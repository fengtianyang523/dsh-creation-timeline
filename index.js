/**
 * Host half of the creation timeline.
 *
 * The session log is the only durable record of what a conversation created, so
 * this half folds stored session logs into a per-workspace index of files: when
 * each file was first written, when it was last touched, and which conversations
 * did it. The index is served as JSON on the web carrier for this package's own
 * browser half; nothing here is model-facing.
 */

import { lstat, readdir, realpath, stat } from 'node:fs/promises'
import { isAbsolute, join, relative, sep } from 'node:path'

/** Where the browser half reads the index. */
const ROUTE_PATH = '/api/creation-timeline/index'
/** Where the browser half asks for one file to be removed. */
const DELETE_PATH = '/api/creation-timeline/delete'

/** Tool names whose arguments name a workspace file they write. */
const WRITE_TOOLS = new Set([
  'write',
  'edit',
  'apply_patch',
  'create_file',
  'str_replace_editor',
  'str_replace_based_edit_tool',
  'multi_edit',
])

/** Directories whose files never belong on a creation timeline. */
const SKIP_SEGMENTS = new Set([
  'node_modules',
  '.git',
  '.hg',
  '.svn',
  'dist',
  'build',
  '.next',
  '.cache',
  'target',
])

/** Argument keys that carry a written file's path. */
const PATH_KEYS = ['file_path', 'filePath', 'path', 'abs_path', 'target_file']

/** How long one built index is reused. */
const CACHE_TTL_MS = 30_000
/** Most sessions folded into one index. */
const MAX_SESSIONS = 60
/** Most files returned. */
const MAX_FILES = 300
/** Title length carried to the browser. */
const MAX_TITLE = 120

/**
 * Normalize a workspace root for comparison and display.
 * @param {string} root - a raw root path.
 * @returns {string} the root with `/` separators and no trailing separator.
 */
function normalizeRoot(root) {
  return String(root).replace(/\\/g, '/').replace(/\/+$/, '')
}

/**
 * A comparison key for a root: Windows-style roots compare regardless of case.
 * @param {string} root - a raw root path.
 * @returns {string} the comparison key.
 */
function rootKey(root) {
  const normalized = normalizeRoot(root)
  return /^[A-Za-z]:\//.test(normalized) || normalized.startsWith('//')
    ? normalized.toLowerCase()
    : normalized
}

/**
 * Collapse `.` and `..` segments of an absolute `/`-separated path.
 * @param {string} path - the path to collapse.
 * @returns {string} the collapsed path.
 */
function collapse(path) {
  const parts = path.split('/')
  const out = []
  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') {
      out.pop()
      continue
    }
    out.push(part)
  }
  const lead = path.startsWith('/') ? '/' : ''
  return lead + out.join('/')
}

/**
 * Resolve one tool-supplied path against a session's working directory.
 * @param {string} path - an absolute or relative path.
 * @param {string} cwd - the session's working directory.
 * @returns {string} the absolute `/`-separated path.
 */
function resolvePath(path, cwd) {
  const normalized = path.replace(/\\/g, '/')
  if (/^[A-Za-z]:\//.test(normalized) || normalized.startsWith('/')) return collapse(normalized)
  const base = normalizeRoot(cwd)
  return collapse(`${base}/${normalized}`)
}

/**
 * The path's part under a root, when the root contains it.
 * @param {string} path - the absolute path.
 * @param {string} root - the workspace root.
 * @returns {string | undefined} the `/`-separated relative path.
 */
function underRoot(path, root) {
  const prefix = `${normalizeRoot(root)}/`
  const head = path.slice(0, prefix.length)
  const windows = /^[A-Za-z]:\//.test(prefix) || prefix.startsWith('//')
  const matches = windows ? head.toLowerCase() === prefix.toLowerCase() : head === prefix
  return matches ? path.slice(prefix.length) : undefined
}

/**
 * Whether a relative path belongs on the timeline.
 * @param {string} relative - the `/`-separated relative path.
 * @returns {boolean} false for build output and version-control noise.
 */
function worthListing(relative) {
  if (relative === '' || relative.startsWith('/')) return false
  const segments = relative.split('/')
  if (segments.some((segment) => SKIP_SEGMENTS.has(segment))) return false
  return true
}

/**
 * Every file path one tool call wrote.
 * @param {string} name - the tool name.
 * @param {unknown} rawArguments - the tool call's JSON argument text.
 * @returns {string[]} the paths it named.
 */
function pathsOf(name, rawArguments) {
  if (!WRITE_TOOLS.has(name) || typeof rawArguments !== 'string') return []
  let args
  try {
    args = JSON.parse(rawArguments)
  } catch {
    return []
  }
  if (args === null || typeof args !== 'object') return []
  const paths = []
  for (const key of PATH_KEYS) {
    const value = args[key]
    if (typeof value === 'string' && value.trim() !== '') paths.push(value.trim())
  }
  for (const key of ['patch', 'input', 'diff']) {
    const text = args[key]
    if (typeof text !== 'string') continue
    for (const line of text.split(/\r?\n/)) {
      const match =
        /^\*\*\*\s+(?:Update|Add|Delete)\s+File:\s*(.+)$/.exec(line) ??
        /^\*\*\*\s+Move\s+to:\s*(.+)$/.exec(line)
      if (match !== null) paths.push(match[1].trim())
    }
  }
  return paths
}

/**
 * The title a log carries, if it carries one.
 * @param {string} type - the event type.
 * @param {any} data - the event payload.
 * @returns {string | undefined} the accepted title text.
 */
function titleOf(type, data) {
  if (type !== 'session/title' || data === null || typeof data !== 'object') return undefined
  const value = typeof data.title === 'string' ? data.title : typeof data.text === 'string' ? data.text : undefined
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed.slice(0, MAX_TITLE)
}

/**
 * Fold one stored session's log into file writes.
 * @param {any} persistence - the session persistence service.
 * @param {string} id - the session id.
 * @returns {Promise<Array<{ path: string, time: number, title: string | undefined }>>} the writes.
 */
async function writesOf(persistence, id) {
  const handle = await persistence.open(id, 'read')
  try {
    const result = await handle.read()
    const events = result?.events ?? []
    let title
    const writes = []
    for (const event of events) {
      const type = event?.type
      if (type === 'session/title') {
        const found = titleOf(type, event.data)
        if (found !== undefined) title = found
        continue
      }
      if (type !== 'tool/call') continue
      const name = event.data?.name
      const raw = event.data?.arguments
      if (typeof name !== 'string') continue
      for (const path of pathsOf(name, raw)) {
        writes.push({ path, time: event.time, title })
      }
    }
    return writes
  } finally {
    await handle.close()
  }
}

/**
 * Run async work over items with a bounded number in flight.
 * @param {readonly any[]} items - the items.
 * @param {number} limit - the most concurrent operations.
 * @param {(item: any) => Promise<any>} work - the operation.
 * @returns {Promise<any[]>} results in item order, with failures as `[]`.
 */
async function mapLimit(items, limit, work) {
  const out = new Array(items.length).fill(undefined)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const at = next++
      try {
        out[at] = await work(items[at])
      } catch {
        out[at] = []
      }
    }
  })
  await Promise.all(workers)
  return out
}

/** The deepest directory level the workspace scan walks. */
const SCAN_DEPTH = 4
/** The most entries one scan keeps. */
const SCAN_MAX = 4000

/**
 * Walk the workspace root for every file the conversations never named.
 * The harness filesystem reports no timestamps, so the process filesystem
 * supplies the birth time a timeline needs.
 * @param {string} root - the workspace root.
 * @returns {Promise<Array<{ path: string, time: number }>>} the files on disk.
 */
async function scanWorkspace(root) {
  const found = []
  const walk = async (dir, depth) => {
    if (depth > SCAN_DEPTH || found.length >= SCAN_MAX) return
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch (error) {
      return
    }
    for (const entry of entries) {
      if (found.length >= SCAN_MAX) return
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (SKIP_SEGMENTS.has(entry.name)) continue
        await walk(full, depth + 1)
        continue
      }
      if (!entry.isFile()) continue
      let info
      try {
        info = await stat(full)
      } catch (error) {
        continue
      }
      const born = Number(info.birthtimeMs)
      const changed = Number(info.mtimeMs)
      const time = Number.isFinite(born) && born > 0 ? born : Number.isFinite(changed) ? changed : Date.now()
      found.push({ path: full.replace(/\\/g, '/'), time })
    }
  }
  await walk(root, 0)
  return found
}

/**
 * Mark the files that no longer exist on disk.
 * @param {any} fs - the filesystem service.
 * @param {Array<object>} files - the index entries.
 * @returns {Promise<Array<object>>} the entries with a `missing` flag.
 */
async function markMissing(fs, files) {
  if (fs === undefined) return files
  const marked = await mapLimit(files, 8, async (file) => {
    try {
      const info = await fs.lstat(file.path)
      return info === undefined ? { ...file, missing: true } : file
    } catch (error) {
      return file
    }
  })
  return marked.filter((file) => file !== null && typeof file === 'object' && Array.isArray(file) === false)
}

/**
 * Build the index for one workspace root.
 * @param {any} persistence - the session persistence service.
 * @param {any} fs - the filesystem service, for existence checks.
 * @param {string} root - the workspace root.
 * @param {Array<object>} snapshots - stored sessions in this workspace.
 * @returns {Promise<object>} the payload the browser half draws.
 */
async function build(persistence, fs, root, snapshots) {
  const mine = snapshots.filter((snapshot) => snapshot.header.origin !== 'subagent')
  mine.sort((left, right) => (right.header.createdAt ?? 0) - (left.header.createdAt ?? 0))
  const chosen = mine.slice(0, MAX_SESSIONS)

  const perSession = await mapLimit(chosen, 6, async (snapshot) => {
    const header = snapshot.header
    const writes = await writesOf(persistence, header.id)
    const scoped = []
    for (const write of writes) {
      const absolute = resolvePath(write.path, header.cwd)
      const relative = underRoot(absolute, root)
      if (relative === undefined || !worthListing(relative)) continue
      scoped.push({ path: absolute, relative, time: write.time, title: write.title, sessionId: header.id })
    }
    return scoped
  })

  const files = new Map()
  for (const write of perSession.flat()) {
    let entry = files.get(write.path)
    if (entry === undefined) {
      const slash = write.relative.lastIndexOf('/')
      entry = {
        path: write.path,
        relative: write.relative,
        name: slash < 0 ? write.relative : write.relative.slice(slash + 1),
        directory: slash < 0 ? '' : write.relative.slice(0, slash),
        createdAt: write.time,
        updatedAt: write.time,
        writes: 0,
        conversations: new Map(),
      }
      files.set(write.path, entry)
    }
    entry.createdAt = Math.min(entry.createdAt, write.time)
    entry.updatedAt = Math.max(entry.updatedAt, write.time)
    entry.writes += 1
    const known = entry.conversations.get(write.sessionId)
    if (known === undefined) {
      entry.conversations.set(write.sessionId, {
        sessionId: write.sessionId,
        title: write.title,
        at: write.time,
      })
    } else if (write.time > known.at) {
      known.at = write.time
      if (write.title !== undefined) known.title = write.title
    }
  }

  // Everything the reader already owns belongs on the timeline too, even when no
  // conversation ever wrote it.
  for (const item of await scanWorkspace(root)) {
    if (files.has(item.path)) continue
    const relative = underRoot(item.path, root)
    if (relative === undefined || !worthListing(relative)) continue
    const slash = relative.lastIndexOf('/')
    files.set(item.path, {
      path: item.path,
      relative,
      name: slash < 0 ? relative : relative.slice(slash + 1),
      directory: slash < 0 ? '' : relative.slice(0, slash),
      createdAt: item.time,
      updatedAt: item.time,
      writes: 0,
      conversations: new Map(),
    })
  }

  const ordered = [...files.values()]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, MAX_FILES)
    .map((entry) => ({
      path: entry.path,
      relative: entry.relative,
      name: entry.name,
      directory: entry.directory,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      writes: entry.writes,
      conversations: [...entry.conversations.values()]
        .sort((left, right) => right.at - left.at)
        .slice(0, 6),
    }))

  return {
    root: normalizeRoot(root),
    generatedAt: Date.now(),
    sessionCount: chosen.length,
    files: await markMissing(fs, ordered),
  }
}

/**
 * Answer one JSON request.
 * @param {unknown} body - the payload.
 * @param {number} status - the HTTP status.
 * @returns {Response} the response.
 */
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

/** Use a workspace recorded by the host, never the caller's path as authority. */
async function workspaceOf(persistence, requestedRoot) {
  if (!isAbsolute(requestedRoot)) return undefined
  const key = rootKey(requestedRoot)
  const sessions = (await persistence.list()).filter((snapshot) => {
    const cwd = snapshot?.header?.cwd
    return typeof cwd === 'string' && isAbsolute(cwd) && rootKey(cwd) === key
  })
  if (sessions.length === 0) return undefined
  return { root: sessions[0].header.cwd, sessions }
}

/** A target must be a descendant, both before and after resolving links. */
function isDescendant(root, target) {
  const local = relative(root, target)
  return local !== '' && local !== '..' && !local.startsWith('..' + sep) && !isAbsolute(local)
}

/** Register only on DSH's authenticated, owner-only Fetch registry. */
export function apply(ctx) {
  const cache = new Map()
  ctx.inject(['connection', 'sessionPersistence', 'fs'], (scope) => {
    const { connection, sessionPersistence: persistence, fs } = scope
    scope.effect(() => () => cache.clear(), 'creation-timeline: cache')

    connection.fetch.register({
      path: ROUTE_PATH,
      methods: ['GET'],
      requestBody: 'buffered',
      async fetch(request) {
        const requestedRoot = new URL(request.url).searchParams.get('root')
        if (!requestedRoot?.trim()) return json({ error: 'missing-root' }, 400)
        try {
          const workspace = await workspaceOf(persistence, requestedRoot)
          if (workspace === undefined) return json({ error: 'unknown-workspace' }, 403)
          const key = rootKey(workspace.root)
          const hit = cache.get(key)
          if (hit !== undefined && Date.now() - hit.at < CACHE_TTL_MS) return json(hit.payload, 200)
          const payload = await build(persistence, fs, workspace.root, workspace.sessions)
          cache.set(key, { at: Date.now(), payload })
          return json(payload, 200)
        } catch {
          return json({ error: 'index-failed' }, 500)
        }
      },
    })

    connection.fetch.register({
      path: DELETE_PATH,
      methods: ['POST'],
      requestBody: 'buffered',
      async fetch(request) {
        if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
          return json({ error: 'unsupported-content-type' }, 415)
        }
        let body
        try {
          const raw = await request.text()
          if (raw.length > 64 * 1024) return json({ error: 'too-large' }, 413)
          body = JSON.parse(raw)
        } catch {
          return json({ error: 'bad-json' }, 400)
        }
        if (typeof body?.root !== 'string' || typeof body?.path !== 'string' || !isAbsolute(body.path)) {
          return json({ error: 'missing-path' }, 400)
        }
        try {
          const workspace = await workspaceOf(persistence, body.root)
          if (workspace === undefined || !isDescendant(workspace.root, body.path)) {
            return json({ error: 'outside-workspace' }, 403)
          }
          const root = await realpath(workspace.root)
          const target = await realpath(body.path)
          if (!isDescendant(root, target) || !(await lstat(body.path)).isFile()) {
            return json({ error: 'outside-workspace' }, 403)
          }
          const resolved = await fs.resolve(target, { signal: request.signal })
          await fs.deleteFile(resolved, undefined, request.signal, { mode: 'workspace-write', workspaceRoot: root })
          cache.clear()
          return json({ ok: true }, 200)
        } catch {
          return json({ error: 'delete-failed' }, 500)
        }
      },
    })
  })
}
