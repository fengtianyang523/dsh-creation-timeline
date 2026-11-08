# 创作轨迹 · Creation trail

把 DeepSeek Harness 右侧栏「文件」页改造成一条按**创建时间**排列的创作时间线：每个文件带类型图标、创建时间、所属工作区 / 对话，可按名称、对话、日期搜索，可多选删除。

一个 DSH（DeepSeek Harness）客户端插件，安装即生效，不改动任何平台源码。

---

## 功能

| 功能 | 说明 |
|---|---|
| 时间线 | 文件按创建时间升序，早的在上、最近的在下；左侧竖线 + 圆点串联，最新一条高亮 |
| 日期分组 | 组头显示「今天 / 昨天 / 10月8日 / 2024年10月8日」，组间留白更大；竖线按组独立 |
| 真实文件清单 | 除了会话里写入过的文件，还会递归扫描工作区（深度 ≤ 4、≤ 4000 条），把用户原有的文件一并列出 |
| 类型图标 | 与平台 `FileTypeIcon` 完全同一套图形：Word/PDF/Excel/PPT/Markdown/图片/视频/代码…按类型着色 |
| 成品 / 过程文件 | 成品（docx/pdf/png/mp4…）用主色，脚本与中间产物（py/json/txt/yml…）用三级灰 |
| 已删除 | 宿主用 `lstat` 判定，灰字 + 删除线 + 图标去饱和；不可选中、无悬停、不参与筛选 |
| 搜索 | 文件名 / 路径 / 对话名 / 时间（`今天`、`10月8日`、`10-08`、`2026-10-08`、`18:42`），多关键词空格分隔取交集 |
| 显示范围 | 折叠菜单：显示全部文件 / 仅重点文件（未删除的成品） |
| 右键菜单 | 复用平台原生文件菜单（在侧边栏打开、在浮窗中打开、在文件夹显示、复制路径、下载、另存为…），并追加「删除…」 |
| 删除 | 单个或批量；批量只弹一次确认框；删除走宿主端点，限定在工作区内 |
| 多选 | 「选择」进入多选，左侧圆点变勾选框，整行可点；红色「删除 (N)」提交 |
| 字号 | 全部字号引用平台内容字号变量，随「设置 → 外观 → 字号」等比缩放，行高与圆点同步 |
| 语言 | 跟随应用语言：中文用中文，其余语言回退英文 |

## 安装

在 DSH 里用插件管理器的「安装本地包 / Install bundle」，选择本目录（含 `package.json` 与 `cordis.patch.yml`）。安装后刷新页面，右侧栏「文件」页头部会出现「按时间顺序」开关。

也可以从 GitHub 安装到 Web 配置：

```bash
dsh plugin --profile web add "github:fengtianyang523/dsh-creation-timeline#v1.0.1"
```

安装后：

1. 打开右侧栏「文件」页；
2. 头部开关打开 → 时间线；关闭 → 原生文件树；
3. 面板内：搜索框、显示范围菜单、选择 / 批量删除。

卸载：插件管理器里停用或移除本插件，文件页立即回到平台原样。

## 兼容性

- 目标：DSH 0.2.2-rc.1 的客户端槽位契约（`sidebar.right.tab.files.actions`、`contextMenus`、`shell.overlay` 不再使用）。
- 使用 `slots`、`locale`、`uiWorkspace`、`sidebarRight`、`contextMenus` 与宿主的 `connection`、`sessionPersistence`、`fs`。
- 不 import 任何平台客户端包（图形数据是从应用自带的 primitives 里逐字节抄进插件的），因此不受平台内部包改名影响。
- 平台升级若改动「文件页」头部 DOM 标记（`[data-files-page]` / `[data-files-content]`），时间线面板的测量会退化到整页兜底；仍可用，但位置可能不准。

## 已知限制

- 文件时间：会话里写过的用「第一次写入时间」，其余用文件系统创建时间（取不到则用修改时间）。平台的 `ctx.fs` 抽象不提供时间戳，因此扫描部分直接读进程文件系统（只读）。
- 扫描范围：工作区根目录内、深度 ≤ 4、≤ 4000 条，跳过 `node_modules`、`.git`、`dist`、`build`、`target`、`.cache`。
- 索引条数上限 300（按最近修改排序截断）。
- 索引与删除仅通过 DSH 的已认证所有者连接访问，且工作区必须已有宿主保存的会话。删除还会检查解析后的实际路径，并遵循宿主文件系统的写入策略。
- 工作区名取的是根目录名，不是工作区显示标题。

## 文件结构

```
creation-timeline/
├── package.json          # 包清单：dsh.bundle.patch + dsh.client
├── cordis.patch.yml      # 插入插件行
├── index.js              # 宿主半边：索引端点 + 删除端点
├── client.js             # 浏览器半边：开关、面板、搜索、多选、删除
├── locale/en.json        # 插件管理器中展示的标题/描述（英文）
├── locale/zh.json        # 同上（中文）
├── icon.svg              # 插件图标
├── README.md             # 本文件
├── AGENTS.md             # 给 agent 的安装/维护契约（Codex、Claude Code、Cursor 等通用）
└── CLAUDE.md             # 指向 AGENTS.md
```

## 许可

[MIT](LICENSE)。`client.js` 内嵌的部分文件类型图形来自 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness/tree/dsh-v0.2.2-rc.1)，其版权声明见许可证。
