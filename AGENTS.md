# AGENTS.md

Machine-readable contract for any coding agent (OpenAI Codex CLI, Claude Code, Cursor, Aider, Gemini CLI, …) that installs, reviews, or maintains this plugin.

## What this is

A **DeepSeek Harness (DSH) client plugin**, not a standalone application and not an npm library with a runtime API for other agents. It renders inside the DSH Web GUI's right sidebar.

- Package name: `@local/creation-timeline`
- Two halves in one bundle: `index.js` (Host, Node) + `client.js` (browser, plain JS, no build step, no bundler)
- No dependencies. `package.json` declares no `dependencies`; installation must not install anything else.

If the target machine has no DSH installation, stop: this zip cannot run anywhere else.

## Install (DSH present)

Preferred, keeps DSH's own bookkeeping:

1. In the DSH Web GUI, open **Settings → Plugins → install bundle** (Plugin Manager).
2. Point it at the repository root, the directory containing `package.json` and `cordis.patch.yml`.
3. Confirm the row `@local/creation-timeline` exists and is enabled.
4. Reload the page. The right sidebar's **文件** page header shows a `按时间顺序` switch.

CLI/agent-driven alternative (only when a human asked for it): DSH's profile directory composes plugins from `cordis.patch.yml`; do not hand-edit that file — use the Plugin Manager so the profile stays consistent.

Verify after install:

- In the authenticated DSH browser session, the request to `/api/creation-timeline/index` returns JSON with a `files` array for a workspace recorded in session persistence.
- The switch appears in the files page header; toggling it covers the tree with the by-time list.
- Right-clicking a row shows the native file menu plus a `删除…` row.

Rollback: disable or remove the row in Plugin Manager. The files page returns to the platform's own rendering immediately.

## Contract surface used

Client (`ctx.*`): `slots`, `locale`, `uiWorkspace`, `sidebarRight`, `contextMenus`.
Host: `connection`, `sessionPersistence`, `fs`.

Extension points:

- `sidebar.right.tab.files.actions` — the switch (list entry, `order: -1`).
- `contextMenus.register({ target: 'file' })` — the `删除…` menu row.
- Owner-only Host Fetch routes: `GET /api/creation-timeline/index`, `POST /api/creation-timeline/delete`.

Do **not**:

- import `@deepseek-ai/dsh-client-ui-primitives` or any other Harness client package (the artwork in `client.js` is a verbatim copy for exactly this reason);
- register a tab type for kind `files` (this plugin deliberately does not take the page over; it overlays it);
- write DOM outside the plugin's own elements, or append a second app root.

## Files

| File | Role |
|---|---|
| `index.js` | Host half: folds stored session logs + a workspace scan into the index; serves it; deletes one file. |
| `client.js` | Browser half: the switch, the overlay panel, search, grouping, multi-select, delete dialog. All artwork is inline. |
| `cordis.patch.yml` | Inserts the `creation-timeline` row. |
| `locale/*.json` | Plugin Manager title/description only; runtime copy ships in `client.js` (`zh` + `en`). |
| `icon.svg` | Plugin icon. |

## Invariants to preserve when editing

1. **The switch must never depend on risky hooks.** `FilesPanel` is intentionally limited to `useState`; session/menu hooks live below the `PanelBoundary` error boundary so a panel failure cannot remove the switch (this was a real regression).
2. **Existence is decided by the Host** (`fs.lstat`), never by browser-side per-file stats.
3. **Deletion is confined to a recorded workspace.** The host checks path containment after link resolution and calls `fs.deleteFile` with the workspace-write policy. A refusal ends the request.
4. **No hard-coded font sizes**: everything derives from `--dsh-content-font-size` / `--dsh-content-font-size-secondary`.
5. **Locale keys must stay symmetric** between the `zh` and `en` dictionaries (currently 31 keys each).

## Verification checklist (no browser control)

```bash
node --check client.js
node --check index.js
```

Then, in an authenticated DSH session, open the timeline for a known workspace and delete a disposable file through the UI. A request for an unknown workspace or a deletion outside the recorded workspace must return HTTP 403.

Visual checks that need a person: switch position, list spacing, hover states, delete dialog, multi-select.
