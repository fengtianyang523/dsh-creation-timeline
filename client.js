window.__ModuleLoader__.load({
  id: '@local/creation-timeline',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** This package's copy namespace. */
    const NS = 'creationTimeline'
    /** Where the Host half serves the folded index. */
    const ROUTE = '/api/creation-timeline/index'
    /** Where the switch remembers its position per Session. */
    const STORE_PREFIX = 'dsh.creation-timeline.v1.'

    const zh = {
      orderByTime: '按时间顺序',
      'switch.on': '按创建时间查看文件',
      'switch.off': '按文件夹查看文件',
      loading: '正在整理创作记录…',
      empty: '这个工作区还没有可以追溯的创作记录。',
      noWorkspace: '这个会话没有工作区目录。',
      'error.read': '读取创作记录失败：{message}',
      today: '今天',
      yesterday: '昨天',
      created: '创建于',
      writes: '{count} 次改动',
      openFile: '打开文件',
      openConversation: '打开对话',
      untitled: '未命名对话',
      noConversation: '无对话记录',
      deleted: '已删除',
      search: '搜索文件名称/对话/时间',
      noMatch: '没有匹配的文件',
      clear: '清空搜索',
      'delete.menu': '删除…',
      'delete.title': '删除这个文件？',
      'delete.body': '文件会从磁盘上永久删除，无法撤销：',
      'delete.cancel': '取消',
      'delete.confirm': '删除',
      'delete.failed': '删除失败：{message}',
      'delete.titleMany': '删除选中的文件？',
      'delete.many': '共 {count} 个文件。',
      select: '选择',
      onlyKey: '仅重点文件',
      allFiles: '显示全部文件',
      filter: '显示范围',
    }
    const en = {
      orderByTime: 'By time',
      'switch.on': 'Show files by when they were created',
      'switch.off': 'Show files by folder',
      loading: 'Collecting the creation record…',
      empty: 'No creation record for this workspace yet.',
      noWorkspace: 'This session has no workspace directory.',
      'error.read': 'Could not read the creation record: {message}',
      today: 'Today',
      yesterday: 'Yesterday',
      created: 'Created',
      writes: '{count} edits',
      openFile: 'Open file',
      openConversation: 'Open conversation',
      untitled: 'Untitled conversation',
      noConversation: 'No conversation',
      deleted: 'Deleted',
      search: 'Search file, conversation or time',
      noMatch: 'No file matches',
      clear: 'Clear search',
      'delete.menu': 'Delete…',
      'delete.title': 'Delete this file?',
      'delete.body': 'The file is removed from disk permanently and cannot be restored:',
      'delete.cancel': 'Cancel',
      'delete.confirm': 'Delete',
      'delete.failed': 'Delete failed: {message}',
      'delete.titleMany': 'Delete the selected files?',
      'delete.many': '{count} files in total.',
      select: 'Select',
      onlyKey: 'Key files only',
      allFiles: 'Show all files',
      filter: 'Show',
    }

    const CSS = `
.ctx-switch{display:inline-flex;align-items:center;gap:8px;height:26px;padding:0 2px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:inherit;line-height:20px;font-weight:400;cursor:pointer;white-space:nowrap;flex:none}
.ctx-switch:hover{color:var(--dsw-alias-label-primary)}
.ctx-switchLabel{white-space:nowrap}
.ctx-switchTrack{position:relative;flex:none;width:34px;height:20px;border-radius:999px;background:var(--dsw-alias-border-l2);transition:background-color .2s ease}
.ctx-switch[aria-checked="true"] .ctx-switchTrack{background:var(--dsw-alias-label-secondary)}
.ctx-switchKnob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.28),0 0 0 .5px rgba(0,0,0,.06);transition:transform .22s cubic-bezier(.32,.72,0,1)}
.ctx-switch[aria-checked="true"] .ctx-switchKnob{transform:translateX(14px)}
.ctx-overlay{--ctx-fs:var(--dsh-content-font-size,13px);--ctx-fs-2:var(--dsh-content-font-size-secondary,12px);--ctx-lh:calc(var(--ctx-fs) * 1.55);--ctx-dot:calc(var(--ctx-lh) / 2 + 4px);position:absolute;z-index:5;box-sizing:border-box;background:var(--dsw-alias-bg-base);display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}
.ctx-search{flex:none;box-sizing:border-box;display:flex;align-items:center;gap:8px;margin:10px 10px 4px;padding:0 10px;height:calc(var(--ctx-fs) + 19px);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover);border:.5px solid var(--dsw-alias-border-l1);transition:border-color .12s ease,background-color .12s ease}
.ctx-search:focus-within{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.ctx-searchIcon{flex:none;color:var(--dsw-alias-label-secondary);display:block}
.ctx-searchInput{flex:1;min-width:0;height:100%;border:0;outline:none;background:transparent;font-family:inherit;font-size:var(--ctx-fs);line-height:var(--ctx-lh);color:var(--dsw-alias-label-primary);appearance:none}
.ctx-searchInput::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7}
.ctx-searchClear{flex:none;width:18px;height:18px;padding:0;border:0;border-radius:50%;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:var(--ctx-fs-2);line-height:calc(var(--ctx-fs-2) + 6px);cursor:pointer}
.ctx-searchClear:hover{color:var(--dsw-alias-label-primary)}
.ctx-toolbar{flex:none;display:flex;align-items:center;gap:8px;padding:2px 12px 6px;min-height:30px}
.ctx-toolBtn{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 6px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:var(--ctx-fs-2);cursor:pointer}
.ctx-toolBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.ctx-toolBtn[aria-pressed="true"]{color:var(--dsw-alias-label-primary)}
.ctx-toolBtn:disabled{opacity:.45;cursor:default}
.ctx-toolDanger{color:var(--dsw-alias-state-error-primary);font-weight:500}
.ctx-toolDanger:disabled{color:var(--dsw-alias-state-error-primary);opacity:.45}
.ctx-toolSpacer{flex:1}
.ctx-filter{position:relative;display:inline-flex;flex:none}
.ctx-filterBtn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.ctx-filterBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.ctx-filterMenu{position:absolute;top:calc(100% + 6px);left:0;z-index:20;min-width:168px;padding:4px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-base);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.18));border:.5px solid var(--dsw-alias-border-l1)}
.ctx-filterItem{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--ctx-fs-2);cursor:pointer;text-align:left}
.ctx-filterItem:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ctx-filterCheck{flex:none;width:12px;text-align:center;color:var(--dsw-alias-label-secondary)}
.ctx-pick{flex:none;position:relative;width:16px;height:16px;margin-top:calc(var(--ctx-dot) - 8px);border-radius:50%;border:1.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:center;font-size:10px;line-height:1;color:#fff;cursor:pointer;transition:background-color .12s ease,border-color .12s ease}
.ctx-pick:not([data-disabled="true"]):hover{border-color:var(--dsw-alias-label-secondary)}
.ctx-pick[data-disabled="true"]{opacity:.35;cursor:default}
.ctx-pick[data-on="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent}
.ctx-item[data-picking="true"]{cursor:pointer}
.ctx-item[data-missing="true"]{cursor:default}
.ctx-item[data-missing="true"] .ctx-hit:hover{background:transparent}
.ctx-pickSpacer{flex:none;width:16px;height:16px;margin-top:calc(var(--ctx-dot) - 8px)}
.ctx-item[data-picking="true"] .ctx-file,.ctx-item[data-picking="true"] .ctx-talkLabel{cursor:default}
.ctx-item[data-selected="true"] .ctx-hit{background:var(--dsw-alias-interactive-bg-hover)}
.ctx-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:10px 6px 46px 14px;scrollbar-width:thin;scrollbar-gutter:stable;overscroll-behavior:contain;scrollbar-color:var(--dsw-alias-border-l2) transparent}
.ctx-scroll::-webkit-scrollbar{width:8px;height:8px}
.ctx-scroll::-webkit-scrollbar-track{background:transparent}
.ctx-scroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l1);border-radius:8px}
.ctx-scroll:hover::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2)}
.ctx-list{margin:0;padding:0;list-style:none}
.ctx-day{list-style:none;margin:46px 0 10px;padding:0 0 0 10px;font-size:var(--ctx-fs-2);line-height:calc(var(--ctx-fs-2) + 6px);font-weight:500;color:var(--dsw-alias-label-secondary)}
.ctx-day[data-first="true"]{margin-top:0}
.ctx-item{display:flex;gap:10px;align-items:stretch}
.ctx-rail{position:relative;flex:none;width:14px}
.ctx-rail::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;margin-left:-0.5px;background:var(--dsw-alias-border-l1)}
.ctx-item[data-first="true"] .ctx-rail::before{top:var(--ctx-dot)}
.ctx-item[data-last="true"] .ctx-rail::before{bottom:auto;height:var(--ctx-dot)}
.ctx-dot{position:absolute;left:50%;top:var(--ctx-dot);width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--dsw-alias-border-l2);box-shadow:0 0 0 3px var(--dsw-alias-bg-base)}
.ctx-item[data-newest="true"] .ctx-dot{background:var(--dsw-alias-brand-primary)}
.ctx-entry{flex:1;min-width:0;padding:1px 14px 12px 0}
.ctx-hit{margin:0 -6px;padding:3px 6px 4px;border-radius:var(--dsw-radius-md);transition:background-color .12s ease}
.ctx-hit:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ctx-row{display:flex;align-items:baseline;gap:10px;min-width:0}
.ctx-file{flex:1;min-width:0;display:flex;align-items:center;gap:7px;margin:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--ctx-fs);line-height:var(--ctx-lh);text-align:left;cursor:pointer;border-radius:var(--dsw-radius-sm);overflow:hidden}
.ctx-fileIcon{flex:none;display:inline-flex;align-items:center;line-height:0}
.ctx-file[data-tone="muted"]{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}
.ctx-file[data-missing="true"]{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));opacity:.72}
.ctx-file[data-missing="true"] .ctx-fileName{text-decoration:line-through;text-decoration-thickness:1px;text-underline-offset:2px}
.ctx-file[data-missing="true"] .ctx-fileIcon{opacity:.4;filter:saturate(.15)}
.ctx-file[data-missing="true"]:hover{opacity:1}
.ctx-file[data-missing="true"]:hover .ctx-fileName{text-decoration:line-through;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}
.ctx-item[data-missing="true"] .ctx-dir{opacity:.5}
.ctx-item[data-missing="true"] .ctx-meta{opacity:.6}
.ctx-item[data-missing="true"] .ctx-dot{background:var(--dsw-alias-border-l1)}
.ctx-file:hover .ctx-fileName{color:var(--dsw-alias-brand-primary);text-decoration:underline;text-underline-offset:2px}
.ctx-fileName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ctx-dir{flex:none;max-width:42%;font-size:calc(var(--ctx-fs-2) - 1px);line-height:var(--ctx-lh);color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.8}
.ctx-talk{flex:none;display:flex;align-items:baseline;justify-content:flex-end;gap:4px;width:190px;max-width:52%;min-width:0}
.ctx-talkLabel{margin:0;padding:0;border:0;background:transparent;font-family:inherit;font-size:calc(var(--ctx-fs-2) - 1px);line-height:calc(var(--ctx-fs-2) + 6px);font-weight:400;color:var(--dsw-alias-label-secondary);opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right;cursor:pointer;min-width:0}
.ctx-talkLabel:hover{text-decoration:underline;text-underline-offset:2px}
.ctx-talkMore{flex:none;font-size:calc(var(--ctx-fs-2) - 1px);line-height:calc(var(--ctx-fs-2) + 6px);color:var(--dsw-alias-label-secondary);opacity:.7}
.ctx-talkNone{min-width:0;font-size:calc(var(--ctx-fs-2) - 1px);line-height:calc(var(--ctx-fs-2) + 6px);color:var(--dsw-alias-label-secondary);opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right}
.ctx-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:4px}
.ctx-time{font-size:var(--ctx-fs-2);line-height:calc(var(--ctx-fs-2) + 6px);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ctx-writes{font-size:calc(var(--ctx-fs-2) - 1px);line-height:calc(var(--ctx-fs-2) + 6px);color:var(--dsw-alias-label-secondary);opacity:.7}
.ctx-note{margin:0;padding:16px 10px;font-size:var(--ctx-fs);line-height:var(--ctx-lh);color:var(--dsw-alias-label-secondary)}
.ctx-note[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.ctx-modal{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.38);pointer-events:auto}
.ctx-modalCard{width:min(380px,90vw);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-prominent,0 8px 30px rgba(0,0,0,.28));padding:18px 18px 14px;display:flex;flex-direction:column;gap:10px;pointer-events:auto}
.ctx-modalTitle{font-size:calc(var(--ctx-fs) + 1px);line-height:var(--ctx-lh);font-weight:600;color:var(--dsw-alias-label-primary)}
.ctx-modalText{margin:0;font-size:var(--ctx-fs);line-height:var(--ctx-lh);color:var(--dsw-alias-label-secondary);word-break:break-all}
.ctx-modalError{margin:0;font-size:var(--ctx-fs-2);line-height:calc(var(--ctx-fs-2) + 6px);color:var(--dsw-alias-state-error-primary)}
.ctx-modalRow{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
.ctx-btn{height:calc(var(--ctx-fs) + 17px);padding:0 14px;border-radius:var(--dsw-radius-sm);border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--ctx-fs);cursor:pointer}
.ctx-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ctx-btnDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:#fff}
.ctx-btnDanger:hover{background:var(--dsw-alias-state-error-primary);filter:brightness(.94)}
`


    /* ------------------------------------------------------------------
     * File-type artwork, copied verbatim from the shipped client primitives
     * (the product's own sheet/folder/excel drawings and per-type colours).
     * ------------------------------------------------------------------ */
    const FIG_SHEET = "M8.48924 28H19.5108C21.6479 28 22.7165 28 23.5594 27.6509C24.6833 27.1853 25.5762 26.2924 26.0417 25.1685C26.3909 24.3256 26.3909 23.257 26.3909 21.1199V8.79443C26.3909 8.32877 26.3909 8.09593 26.3471 7.87507C26.2887 7.58058 26.173 7.30042 26.0067 7.05048C25.882 6.86303 25.7177 6.69799 25.3893 6.36792L20.0611 1.01354C19.7304 0.681235 19.5651 0.515081 19.3769 0.38885C19.126 0.220541 18.8443 0.103463 18.5481 0.0443412C18.3259 0 18.0915 0 17.6226 0H8.48924C6.35209 0 5.28351 0 4.4406 0.349145C3.31672 0.814671 2.4238 1.70759 1.95828 2.83147C1.60913 3.67438 1.60913 4.74296 1.60913 6.88011V21.1199C1.60913 23.257 1.60913 24.3256 1.95828 25.1685C2.4238 26.2924 3.31672 27.1853 4.4406 27.6509C5.28351 28 6.35209 28 8.48924 28Z"
    const FIG_CORNER = "M26.3909 7.37445L19.0525 0V3.77445C19.0525 4.89271 19.0525 5.45184 19.2352 5.89289C19.4788 6.48096 19.946 6.94818 20.5341 7.19176C20.9751 7.37445 21.5342 7.37445 22.6525 7.37445H26.3909Z"
    const FIG_MARK_112 = "translate(14 16) scale(1.12) translate(-14 -16)"
    const FIG_MARK_122 = "translate(14 16) scale(1.22) translate(-14 -16)"
    const FIG_MARK_FOLDER = "translate(14 13.0693) scale(1.12) translate(-14 -13.0693)"

    function Sheet({size:e,className:t,children:r,markTransform:i,muted:n=!1}){return h("svg",{width:e,height:e,className:t,viewBox:"0 0 28 28",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-hidden":!0,children:[h("path",{d:FIG_SHEET,fill:"currentColor"}),n?h("path",{d:FIG_CORNER,fill:"var(--dsw-static-neutral-400)"}):h("path",{d:FIG_CORNER,fill:"var(--dsw-static-neutral-00)",fillOpacity:".7"}),r!==void 0&&h("g",{color:"var(--dsw-static-neutral-00)","data-file-type-mark":!0,transform:i,children:r})]})}

    function FolderArt({size:e,className:t}){return h("svg",{width:e,height:e,className:t,viewBox:"0 0 28 28",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-hidden":!0,children:[h("path",{d:"M2.80078 10.2112C2.80078 9.52802 2.80078 9.18642 2.85314 8.866C2.98648 8.05 3.36942 7.29538 3.94925 6.70595C4.17694 6.4745 4.45264 6.2728 5.00404 5.86939C5.29197 5.65874 5.43594 5.55342 5.58711 5.46632C5.97089 5.24521 6.39638 5.10618 6.83667 5.05803C7.01011 5.03906 7.18849 5.03906 7.54524 5.03906H11.6543C12.4669 5.03906 12.8732 5.03906 13.2599 5.13697C13.3882 5.16945 13.5143 5.20986 13.6375 5.25795C14.0091 5.40294 14.3398 5.63902 15.0012 6.1112L16.2632 7.01224C16.5526 7.21881 16.6972 7.3221 16.8598 7.38553C16.9137 7.40657 16.9689 7.42425 17.025 7.43846C17.1942 7.4813 17.372 7.4813 17.7275 7.4813H19.8008C22.0506 7.4813 23.1755 7.4813 23.9641 8.05425C24.2188 8.23928 24.4428 8.46326 24.6278 8.71794C25.2008 9.50654 25.2008 10.6315 25.2008 12.8813V18.7283C25.2008 20.9781 25.2008 22.1031 24.6278 22.8917C24.4428 23.1463 24.2188 23.3703 23.9641 23.5554C23.1755 24.1283 22.0506 24.1283 19.8008 24.1283H8.20077C5.95094 24.1283 4.82602 24.1283 4.03743 23.5554C3.78274 23.3703 3.55877 23.1463 3.37373 22.8917C2.80078 22.1031 2.80078 20.9781 2.80078 18.7283V10.2112Z",fill:"currentColor"}),h("g",{color:"var(--dsw-static-neutral-00)","data-file-type-mark":!0,transform:FIG_MARK_FOLDER,children:h("path",{d:"M6.31445 13.0693H21.6893",stroke:"currentColor",strokeWidth:"2.38"})})]})}

    function ExcelArt({size:e,className:t}){return h(Sheet,{size:e,className:t,children:h("path",{d:"M14 11.5H11.4C10.5599 11.5 10.1399 11.5 9.81901 11.6635C9.53677 11.8073 9.3073 12.0368 9.16349 12.319C9 12.6399 9 13.0599 9 13.9V16.5M14 11.5H16.6C17.4401 11.5 17.8601 11.5 18.181 11.6635C18.4632 11.8073 18.6927 12.0368 18.8365 12.319C19 12.6399 19 13.0599 19 13.9V16.5M14 11.5V21.5M14 21.5H16.6C17.4401 21.5 17.8601 21.5 18.181 21.3365C18.4632 21.1927 18.6927 20.9632 18.8365 20.681C19 20.3601 19 19.9401 19 19.1V16.5M14 21.5H11.4C10.5599 21.5 10.1399 21.5 9.81901 21.3365C9.53677 21.1927 9.3073 20.9632 9.16349 20.681C9 20.3601 9 19.9401 9 19.1V16.5M19 16.5H9",stroke:"currentColor",strokeWidth:"1.2"})})}

    function kindArt(e,t,r){switch(e){case"code":return h(Sheet,{size:t,className:r,children:[h("path",{d:"M10.0053 13.126L7.0236 16.3788C6.96052 16.4476 6.96052 16.5532 7.0236 16.622L10.0053 19.8748",stroke:"currentColor",strokeWidth:"1.35"}),h("path",{d:"M17.9941 13.126L20.9759 16.3788C21.039 16.4476 21.039 16.5532 20.9759 16.622L17.9941 19.8748",stroke:"currentColor",strokeWidth:"1.35"}),h("path",{d:"M15.2652 12.957L12.7344 20.0433",stroke:"currentColor",strokeWidth:"1.35"})]});case"excel":return h(ExcelArt,{size:t,className:r});case"folder":return h(FolderArt,{size:t,className:r});case"html":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_112,children:h("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M13.9994 9.68298C17.212 9.68298 19.8167 12.2872 19.8168 15.4997C19.8168 18.7123 17.2121 21.3171 13.9994 21.3171C10.7869 21.3169 8.18274 18.7122 8.18274 15.4997C8.1829 12.2873 10.787 9.68315 13.9994 9.68298ZM9.26213 16.0247C9.47025 17.9241 10.7936 19.4876 12.5639 20.0463C12.42 19.7977 12.2952 19.5152 12.1879 19.2116C11.885 18.3541 11.693 17.2434 11.6424 16.0247H9.26213ZM16.3565 16.0247C16.3059 17.2434 16.1145 18.3542 15.8116 19.2116C15.7044 19.5151 15.5788 19.7971 15.435 20.0456C17.2054 19.487 18.5293 17.9242 18.7374 16.0247H16.3565ZM12.6938 16.0247C12.7439 17.1459 12.9212 18.1334 13.1784 18.8616C13.332 19.2962 13.503 19.61 13.6686 19.805C13.834 19.9996 13.9473 20.0256 13.9994 20.0258C14.0514 20.0258 14.1651 20.0002 14.331 19.805C14.4966 19.61 14.6676 19.2962 14.8211 18.8616C15.0784 18.1334 15.2557 17.1459 15.3058 16.0247H12.6938ZM13.9994 10.733C13.9473 10.7331 13.834 10.7598 13.6686 10.9545C13.503 11.1494 13.3319 11.4633 13.1784 11.8978C12.903 12.6777 12.7188 13.7545 12.6849 14.9747H15.3147C15.2808 13.7545 15.0966 12.6777 14.8211 11.8978C14.6676 11.4633 14.4965 11.1494 14.331 10.9545C14.1651 10.7593 14.0514 10.733 13.9994 10.733ZM15.5888 11.0051C15.6701 11.1756 15.7444 11.3576 15.8116 11.5478C16.1343 12.4613 16.3308 13.6619 16.3647 14.9747H18.7374C18.5352 13.1307 17.2817 11.6036 15.5888 11.0051ZM12.4101 11.0051C10.7174 11.6037 9.46428 13.1308 9.26213 14.9747H11.6349C11.6688 13.6619 11.8652 12.4613 12.1879 11.5478C12.2551 11.3577 12.3288 11.1756 12.4101 11.0051Z",fill:"currentColor"})});case"image":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_112,children:[h("path",{d:"M10.4212 15.9204C10.5756 15.6558 10.9579 15.6558 11.1123 15.9204L13.6493 20.2696C13.8048 20.5362 13.6125 20.8711 13.3037 20.8711H8.22974C7.92102 20.8711 7.72868 20.5362 7.88423 20.2696L10.4212 15.9204Z",fill:"currentColor"}),h("path",{d:"M15.4981 13.186C15.6505 12.9117 16.0451 12.9117 16.1975 13.186L20.1368 20.2769C20.2849 20.5435 20.0922 20.8711 19.7872 20.8711H11.9084C11.6034 20.8711 11.4107 20.5435 11.5588 20.2769L15.4981 13.186Z",fill:"currentColor"}),h("path",{d:"M11.8603 11.3997C11.8603 12.286 11.1418 13.0045 10.2555 13.0045C9.36924 13.0045 8.65076 12.286 8.65076 11.3997C8.65076 10.5134 9.36924 9.79492 10.2555 9.79492C11.1418 9.79492 11.8603 10.5134 11.8603 11.3997Z",fill:"currentColor"})]});case"markdown":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_122,children:h("path",{d:"M8.7588 19.5V14.6H9.8998L11.9298 17.932H11.3278L13.3018 14.6H14.4428L14.4568 19.5H13.1828L13.1688 16.539H13.3858L11.9088 19.017H11.2928L9.7738 16.539H10.0398V19.5H8.7588ZM15.4375 19.5V14.6H17.7545C18.2958 14.6 18.7718 14.7003 19.1825 14.901C19.5932 15.1017 19.9128 15.384 20.1415 15.748C20.3748 16.112 20.4915 16.546 20.4915 17.05C20.4915 17.5493 20.3748 17.9833 20.1415 18.352C19.9128 18.716 19.5932 18.9983 19.1825 19.199C18.7718 19.3997 18.2958 19.5 17.7545 19.5H15.4375ZM16.8235 18.394H17.6985C17.9785 18.394 18.2212 18.3427 18.4265 18.24C18.6365 18.1327 18.7998 17.9787 18.9165 17.778C19.0332 17.5727 19.0915 17.33 19.0915 17.05C19.0915 16.7653 19.0332 16.5227 18.9165 16.322C18.7998 16.1213 18.6365 15.9697 18.4265 15.867C18.2212 15.7597 17.9785 15.706 17.6985 15.706H16.8235V18.394Z",fill:"currentColor"})});case"other":return h(Sheet,{size:t,className:r,muted:!0});case"pdf":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_122,children:h("path",{d:"M6.80616 19.5V14.6H9.04616C9.49416 14.6 9.87916 14.6723 10.2012 14.817C10.5278 14.9617 10.7798 15.1717 10.9572 15.447C11.1345 15.7177 11.2232 16.0397 11.2232 16.413C11.2232 16.7817 11.1345 17.1013 10.9572 17.372C10.7798 17.6427 10.5278 17.8527 10.2012 18.002C9.87916 18.1467 9.49416 18.219 9.04616 18.219H7.57616L8.19216 17.617V19.5H6.80616ZM8.19216 17.764L7.57616 17.127H8.96216C9.2515 17.127 9.46616 17.064 9.60616 16.938C9.75083 16.812 9.82316 16.637 9.82316 16.413C9.82316 16.1843 9.75083 16.007 9.60616 15.881C9.46616 15.755 9.2515 15.692 8.96216 15.692H7.57616L8.19216 15.055V17.764ZM11.8989 19.5V14.6H14.2159C14.7573 14.6 15.2333 14.7003 15.6439 14.901C16.0546 15.1017 16.3743 15.384 16.6029 15.748C16.8363 16.112 16.9529 16.546 16.9529 17.05C16.9529 17.5493 16.8363 17.9833 16.6029 18.352C16.3743 18.716 16.0546 18.9983 15.6439 19.199C15.2333 19.3997 14.7573 19.5 14.2159 19.5H11.8989ZM13.2849 18.394H14.1599C14.4399 18.394 14.6826 18.3427 14.8879 18.24C15.0979 18.1327 15.2613 17.9787 15.3779 17.778C15.4946 17.5727 15.5529 17.33 15.5529 17.05C15.5529 16.7653 15.4946 16.5227 15.3779 16.322C15.2613 16.1213 15.0979 15.9697 14.8879 15.867C14.6826 15.7597 14.4399 15.706 14.1599 15.706H13.2849V18.394ZM17.6821 19.5V14.6H21.5251V15.671H19.0681V19.5H17.6821ZM18.9701 17.82V16.749H21.2311V17.82H18.9701Z",fill:"currentColor"})});case"ppt":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_122,children:h("path",{d:"M11.0132 20.5V13.5H14.2132C14.8532 13.5 15.4032 13.6033 15.8632 13.81C16.3299 14.0167 16.6899 14.3167 16.9432 14.71C17.1966 15.0967 17.3232 15.5567 17.3232 16.09C17.3232 16.6167 17.1966 17.0733 16.9432 17.46C16.6899 17.8467 16.3299 18.1467 15.8632 18.36C15.4032 18.5667 14.8532 18.67 14.2132 18.67H12.1132L12.9932 17.81V20.5H11.0132ZM12.9932 18.02L12.1132 17.11H14.0932C14.5066 17.11 14.8132 17.02 15.0132 16.84C15.2199 16.66 15.3232 16.41 15.3232 16.09C15.3232 15.7633 15.2199 15.51 15.0132 15.33C14.8132 15.15 14.5066 15.06 14.0932 15.06H12.1132L12.9932 14.15V18.02Z",fill:"currentColor"})});case"video":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_112,children:h("path",{d:"M17.5 14.634C18.1667 15.0189 18.1667 15.9811 17.5 16.366L11.5 19.8301C10.8333 20.215 10 19.7339 10 18.9641L10 12.0359C10 11.2661 10.8333 10.785 11.5 11.1699L17.5 14.634Z",fill:"currentColor"})});case"word":return h(Sheet,{size:t,className:r,markTransform:FIG_MARK_122,children:h("path",{d:"M10.5118 20.5L8.24179 13.5H10.2818L12.1918 19.56H11.1618L13.1718 13.5H14.9918L16.8918 19.56H15.9018L17.8718 13.5H19.7618L17.4918 20.5H15.3718L13.7518 15.35H14.3218L12.6318 20.5H10.5118Z",fill:"currentColor"})});default:return KR(e)}}

    /** Extension to the product's file kind. */
    const KIND_BY_EXTENSION = {
      md: 'markdown', markdown: 'markdown',
      png: 'image', jpg: 'image', jpeg: 'image', webp: 'image', gif: 'image', bmp: 'image', svg: 'image', ico: 'image', tif: 'image', tiff: 'image',
      mp4: 'video', mov: 'video', webm: 'video', mkv: 'video', avi: 'video', m4v: 'video',
      pdf: 'pdf',
      doc: 'word', docx: 'word', rtf: 'word', odt: 'word', pages: 'word',
      xls: 'excel', xlsx: 'excel', csv: 'excel', ods: 'excel', numbers: 'excel',
      ppt: 'ppt', pptx: 'ppt', odp: 'ppt', key: 'ppt',
      html: 'html', htm: 'html',
      js: 'code', mjs: 'code', cjs: 'code', jsx: 'code', ts: 'code', tsx: 'code', py: 'code', json: 'code',
      yml: 'code', yaml: 'code', toml: 'code', ini: 'code', sh: 'code', ps1: 'code', css: 'code', scss: 'code',
      c: 'code', h: 'code', cpp: 'code', hpp: 'code', java: 'code', go: 'code', rs: 'code', rb: 'code', php: 'code', sql: 'code', xml: 'code',
    }

    /**
     * The product's file kind for one basename.
     * @param {string} name - the file's basename.
     * @returns {string} one of the artwork kinds.
     */
    function classifyName(name) {
      const dot = name.lastIndexOf('.')
      if (dot <= 0) return 'other'
      return KIND_BY_EXTENSION[name.slice(dot + 1).toLowerCase()] ?? 'other'
    }
    /** The ink each file kind wears, as the product's stylesheet assigns it. */
    const KIND_INK = {
  "code": "--dsw-static-deepseek-500",
  "excel": "--dsw-static-green-500",
  "folder": "--dsw-static-amber-400",
  "html": "--dsw-static-deepseek-500",
  "image": "--dsh-file-type-violet",
  "markdown": "--dsw-static-deepseek-500",
  "other": "--dsw-static-neutral-bluish-300",
  "pdf": "--dsw-static-red-600",
  "ppt": "--dsw-static-amber-500",
  "video": "--dsh-file-type-violet",
  "word": "--dsw-static-deepseek-450"
}

    /**
     * One file's type icon, drawn exactly as the workspace tree draws it.
     * @param {{ name: string }} props - the file's basename.
     * @returns {import('react').ReactElement} the icon.
     */
    function FileTypeBadge(props) {
      const kind = classifyName(props.name)
      const ink = KIND_INK[kind] ?? KIND_INK.other
      return h(
        'span',
        { className: 'ctx-fileIcon', style: { color: `var(${ink})` } },
        kindArt(kind, 16, undefined),
      )
    }

    /**
     * Two-digit clock time.
     * @param {Date} date - the moment.
     * @returns {string} the local `HH:MM`.
     */
    function clockOf(date) {
      try {
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date)
      } catch {
        return date.toTimeString().slice(0, 5)
      }
    }

    /**
     * A timeline stamp: the day word for today and yesterday, else the date.
     * @param {number} ms - epoch milliseconds.
     * @param {(key: string) => string} t - the namespace translator.
     * @returns {string} the display stamp.
     */
    function stampOf(ms, t) {
      const date = new Date(ms)
      const now = new Date()
      const day = date.toDateString()
      if (day === now.toDateString()) return `${t('today')} ${clockOf(date)}`
      if (day === new Date(now.getTime() - 86_400_000).toDateString()) return `${t('yesterday')} ${clockOf(date)}`
      let dayLabel
      try {
        dayLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
      } catch {
        dayLabel = date.toISOString().slice(5, 10)
      }
      return `${dayLabel} ${clockOf(date)}`
    }

    /**
     * The calendar day a timestamp belongs to.
     * @param {number} ms - epoch milliseconds.
     * @returns {string} the day key.
     */
    function dayKeyOf(ms) {
      const date = new Date(ms)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    /**
     * The heading one day of the list carries.
     * @param {number} ms - epoch milliseconds.
     * @param {(key: string) => string} t - the namespace translator.
     * @returns {string} the day label.
     */
    function dayLabelOf(ms, t) {
      const date = new Date(ms)
      const now = new Date()
      const today = now.getTime()
      if (dayKeyOf(ms) === dayKeyOf(today)) return t('today')
      if (dayKeyOf(ms) === dayKeyOf(today - 86_400_000)) return t('yesterday')
      try {
        return new Intl.DateTimeFormat(undefined, {
          ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
          month: 'long',
          day: 'numeric',
        }).format(date)
      } catch (error) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }
    }

    /**
     * Deliverables keep the primary ink; scripts, data, configuration and notes
     * read as secondary so a working file never competes with the work itself.
     */
    const OUTCOMES = new Set([
      'doc', 'docx', 'pdf', 'rtf', 'odt', 'pages',
      'ppt', 'pptx', 'odp', 'key',
      'xls', 'xlsx', 'ods', 'numbers', 'csv',
      'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'ico', 'svg',
      'mp4', 'mov', 'webm', 'avi', 'mkv',
      'mp3', 'wav', 'm4a', 'flac', 'aac',
      'epub',
    ])

    /**
     * The row's ink.
     * @param {string} name - the file's basename.
     * @returns {'main' | 'muted'} the tone.
     */
    function toneOf(name) {
      const dot = name.lastIndexOf('.')
      if (dot <= 0) return 'muted'
      return OUTCOMES.has(name.slice(dot + 1).toLowerCase()) ? 'main' : 'muted'
    }

    /**
     * Everything one row can be found by: names, paths, conversations and time in
     * the spellings a person types.
     * @param {object} file - one index entry.
     * @param {(key: string) => string} t - the namespace translator.
     * @returns {string} a lowercased haystack.
     */
    function searchTextOf(file, t) {
      const titles = (Array.isArray(file.conversations) ? file.conversations : [])
        .map((conversation) => conversation.title ?? '')
        .join(' ')
      const date = new Date(file.createdAt)
      const month = String(date.getMonth() + 1)
      const day = String(date.getDate())
      return [
        file.name,
        file.relative,
        file.directory ?? '',
        titles,
        clockOf(date),
        `${date.getFullYear()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        `${month}-${day}`,
        `${month}月${day}日`,
        `${month}/${day}`,
        stampOf(file.createdAt, t),
      ]
        .join(' ')
        .toLowerCase()
    }

    /**
     * The sidebar resource address of one workspace file.
     * @param {string} sessionId - the authorizing session.
     * @param {string} relative - the `/`-separated path under the workspace root.
     * @returns {string} the `dsh-resource://file/…` address.
     */
    function fileAddress(sessionId, relative) {
      const encode = (segment) => encodeURIComponent(segment).replace(/%3A/gi, ':')
      const path = relative.split('/').map(encode).join('/')
      return `dsh-resource://file/session/${encode(sessionId)}/${path}`
    }

    /**
     * Fill a `{name}` placeholder in one translated template.
     * @param {unknown} template - the translated string.
     * @param {string} name - the placeholder name.
     * @param {unknown} value - its replacement.
     * @returns {string} the filled text.
     */
    function fill(template, name, value) {
      return String(template ?? '').split(`{${name}}`).join(String(value))
    }

    /**
     * The remembered switch position for one Session.
     * @param {string} sessionId - the Session.
     * @returns {boolean} whether the by-time list is on.
     */
    function readStored(sessionId) {
      try {
        return window.localStorage.getItem(`${STORE_PREFIX}${sessionId}`) === 'on'
      } catch (error) {
        return false
      }
    }

    /**
     * Remember the switch position for one Session.
     * @param {string} sessionId - the Session.
     * @param {boolean} on - the new position.
     */
    function writeStored(sessionId, on) {
      try {
        window.localStorage.setItem(`${STORE_PREFIX}${sessionId}`, on ? 'on' : 'off')
      } catch (error) {
        /* a full or blocked store only loses the preference */
      }
    }

    /** The event the row menu uses to ask for one deletion. */
    const DELETE_EVENT = 'dsh-creation-timeline:delete'

    /**
     * Ask the panel to confirm removing one file.
     * @param {{ path: string, root: string }} request - the target.
     */
    function requestDelete(request) {
      try {
        window.dispatchEvent(new CustomEvent(DELETE_EVENT, { detail: request }))
      } catch (error) {
        console.error('creation-timeline: cannot ask for a deletion', error)
      }
    }

    /**
     * Keep one failing panel from taking the switch with it: the switch has to stay
     * clickable whatever the list underneath does.
     */
    class PanelBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false, message: '' }
      }
      static getDerivedStateFromError(error) {
        return { failed: true, message: error instanceof Error ? error.message : String(error) }
      }
      componentDidCatch(error) {
        console.error('creation-timeline: by-time panel failed', error)
      }
      render() {
        if (this.state.failed) return this.props.fallback ?? h('p', { className: 'ctx-note', 'data-tone': 'error' }, this.state.message)
        return this.props.children ?? null
      }
    }

    return {
      inject: ['slots', 'locale', 'uiWorkspace', 'sidebarRight', 'contextMenus'],
      apply(ctx) {
        const t = ctx.locale.bind(NS)
        ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'creation-timeline: zh copy')
        ctx.effect(() => ctx.locale.register(NS, 'en', en), 'creation-timeline: en copy')

        ctx.effect(() => {
          if (typeof document === 'undefined') return () => {}
          const stale = document.querySelector('style[data-creation-timeline="css"]')
          if (stale !== null) stale.remove()
          const tag = document.createElement('style')
          tag.setAttribute('data-creation-timeline', 'css')
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => {
            tag.remove()
          }
        }, 'creation-timeline: stylesheet')

        /** Open one conversation in the main column. */
        const openConversation = (sessionId) => {
          try {
            ctx.uiWorkspace.openSession(sessionId)
          } catch (error) {
            console.error('creation-timeline: cannot open conversation', error)
          }
        }

        /**
         * The by-time list, drawn over the workspace tree in the same page.
         * @param {{ sessionId: string, cwd: string | undefined, onClose: () => void }} props - target and close.
         * @returns {import('react').ReactElement} the list.
         */
        function ByTimeList(props) {
          const { sessionId, cwd, onClose, useMenu, paneId } = props
          let menu
          try {
            menu = typeof useMenu === 'function' ? useMenu() : undefined
          } catch (error) {
            menu = undefined
          }
          const [state, setState] = React.useState({ phase: 'loading', data: undefined, message: '' })
          const [query, setQuery] = React.useState('')
          const [picking, setPicking] = React.useState(false)
          const [selected, setSelected] = React.useState(() => new Set())
          const [onlyKey, setOnlyKey] = React.useState(false)
          const [filterOpen, setFilterOpen] = React.useState(false)
          const [confirming, setConfirming] = React.useState(null)
          const [deleting, setDeleting] = React.useState(false)
          const [deleteError, setDeleteError] = React.useState('')
          const [nonce, setNonce] = React.useState(0)
          const scrollRef = React.useRef(null)
          const landed = React.useRef(false)

          React.useEffect(() => {
            if (typeof cwd !== 'string' || cwd === '') {
              setState({ phase: 'no-workspace', data: undefined, message: '' })
              return undefined
            }
            const controller = new AbortController()
            setState((previous) => ({ phase: 'loading', data: previous.data, message: '' }))
            fetch(`${ROUTE}?root=${encodeURIComponent(cwd)}`, {
              signal: controller.signal,
              headers: { accept: 'application/json' },
            })
              .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.json()
              })
              .then((payload) => {
                if (controller.signal.aborted) return
                if (payload && typeof payload.error === 'string') {
                  throw new Error(payload.message ?? payload.error)
                }
                setState({ phase: 'ready', data: payload, message: '' })
              })
              .catch((error) => {
                if (controller.signal.aborted) return
                setState((previous) => ({
                  phase: previous.data === undefined ? 'error' : 'ready',
                  data: previous.data,
                  message: error instanceof Error ? error.message : String(error),
                }))
              })
            const onFocus = () => setNonce((value) => value + 1)
            window.addEventListener('focus', onFocus)
            return () => {
              controller.abort()
              window.removeEventListener('focus', onFocus)
            }
          }, [cwd, nonce])

          React.useEffect(() => {
            if (state.phase !== 'ready' || landed.current) return
            const node = scrollRef.current
            if (node === null) return
            landed.current = true
            node.scrollTop = node.scrollHeight
          }, [state.phase])


          React.useEffect(() => {
            const onAsk = (event) => {
              const detail = event === null || event === undefined ? undefined : event.detail
              if (detail === null || typeof detail !== 'object' || typeof detail.path !== 'string') return
              setDeleteError('')
              setDeleting(false)
              setConfirming({ paths: [detail.path], root: typeof detail.root === 'string' ? detail.root : '' })
            }
            window.addEventListener(DELETE_EVENT, onAsk)
            return () => window.removeEventListener(DELETE_EVENT, onAsk)
          }, [])

          React.useEffect(() => {
            const onKey = (event) => {
              if (event.key !== 'Escape' || event.defaultPrevented) return
              onClose()
            }
            window.addEventListener('keydown', onKey)
            return () => window.removeEventListener('keydown', onKey)
          }, [onClose])

          const openFile = (file) => {
            const address = fileAddress(sessionId, file.relative)
            try {
              ctx.sidebarRight.openResource(address)
            } catch (error) {
              console.error('creation-timeline: cannot open file', error)
            }
          }

          React.useEffect(() => {
            if (!filterOpen) return undefined
            const dismiss = () => setFilterOpen(false)
            window.addEventListener('pointerdown', dismiss)
            return () => window.removeEventListener('pointerdown', dismiss)
          }, [filterOpen])

          const togglePick = (path) => {
            setSelected((previous) => {
              const next = new Set(previous)
              if (next.has(path)) next.delete(path)
              else next.add(path)
              return next
            })
          }

          const stopPicking = () => {
            setPicking(false)
            setSelected(new Set())
          }

          const files =
            state.phase === 'ready' && Array.isArray(state.data?.files)
              ? [...state.data.files].sort((left, right) => left.createdAt - right.createdAt)
              : []
          const rootPath = typeof state.data?.root === 'string' ? state.data.root : cwd
          const workspaceName =
            typeof rootPath === 'string' && rootPath !== ''
              ? rootPath.split(/[\\/]/).filter((part) => part !== '').pop() ?? ''
              : ''
          const tokens = query.toLowerCase().split(/\s+/).filter((token) => token !== '')
          const visible = files.filter((file) => {
            if (onlyKey && !(toneOf(file.name) === 'main' && file.missing !== true)) return false
            if (tokens.length === 0) return true
            const hay = searchTextOf(file, t)
            return tokens.every((token) => hay.includes(token))
          })
          // Filtering away a selected file drops it from the batch, so the red count can
          // never delete something the reader cannot see.
          React.useEffect(() => {
            setSelected((previous) => {
              if (previous.size === 0) return previous
              const keep = new Set()
              for (const file of visible) if (previous.has(file.path)) keep.add(file.path)
              return keep.size === previous.size ? previous : keep
            })
          }, [visible])

          const groups = []
          for (const file of visible) {
            const key = dayKeyOf(file.createdAt)
            const current = groups.length === 0 ? undefined : groups[groups.length - 1]
            if (current !== undefined && current.key === key) current.files.push(file)
            else groups.push({ key, label: dayLabelOf(file.createdAt, t), files: [file] })
          }
          const rows = []
          groups.forEach((group, groupIndex) => {
            rows.push({ kind: 'day', key: `day-${group.key}`, label: group.label, first: groupIndex === 0 })
            group.files.forEach((file, fileIndex) => {
              rows.push({
                kind: 'file',
                file,
                first: fileIndex === 0,
                last: fileIndex === group.files.length - 1,
                newest: groupIndex === groups.length - 1 && fileIndex === group.files.length - 1,
              })
            })
          })

          const list =
            files.length === 0
              ? null
              : visible.length === 0
                ? null
                : h(
                    'ul',
                    { className: 'ctx-list' },
                    rows.map((row) => {
                    if (row.kind === 'day') {
                      return h(
                        'li',
                        { className: 'ctx-day', key: row.key, 'data-first': row.first ? 'true' : undefined },
                        row.label,
                      )
                    }
                    const file = row.file
                    const conversations = Array.isArray(file.conversations) ? file.conversations : []
                    const newest = conversations[0]
                    const extra = conversations.length - 1
                    const tone = toneOf(file.name)
                    const isGone = file.missing === true
                    let trigger
                    if (menu !== undefined) {
                      try {
                        trigger = menu.getTriggerProps({
                          kind: 'file',
                            value: { sessionId, path: file.path, paneId, root: cwd },
                        })
                      } catch (error) {
                        trigger = undefined
                      }
                    }
                    return h(
                      'li',
                      {
                        className: 'ctx-item',
                        key: file.path,
                        'data-tone': tone,
                        'data-missing': isGone ? 'true' : undefined,
                        'data-first': row.first ? 'true' : undefined,
                        'data-last': row.last ? 'true' : undefined,
                        'data-newest': row.newest ? 'true' : undefined,
                        'data-picking': picking ? 'true' : undefined,
                        'data-selected': picking && selected.has(file.path) ? 'true' : undefined,
                      },
                      picking && isGone
                        ? h('span', { className: 'ctx-pickSpacer', 'aria-hidden': true })
                        : picking
                        ? h(
                            'span',
                            {
                              className: 'ctx-pick',
                              'data-on': selected.has(file.path) ? 'true' : 'false',
                              'data-disabled': isGone ? 'true' : undefined,
                              role: 'checkbox',
                              'aria-checked': selected.has(file.path) ? 'true' : 'false',
                              'aria-disabled': isGone ? 'true' : undefined,
                              'aria-label': file.name,
                              onClick: isGone
                                ? undefined
                                : (event) => {
                                    event.stopPropagation()
                                    togglePick(file.path)
                                  },
                            },
                            selected.has(file.path) ? '✓' : '',
                          )
                        : h('span', { className: 'ctx-rail', 'aria-hidden': true }, h('span', { className: 'ctx-dot' })),
                      h(
                        'div',
                        { className: 'ctx-entry' },
                        h(
                          'div',
                          { className: 'ctx-hit', ...(picking && !isGone ? { onClick: () => togglePick(file.path), role: 'checkbox', 'aria-checked': selected.has(file.path) ? 'true' : 'false' } : {}), ...trigger },
                        h(
                          'div',
                          { className: 'ctx-row' },
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'ctx-file',
                              'data-tone': tone,
                              'data-missing': isGone ? 'true' : undefined,
                              title: `${isGone ? `${t('deleted')} · ` : ''}${t('openFile')} · ${file.relative}`,
                              onClick: picking ? undefined : () => openFile(file),
                            },
                            h(FileTypeBadge, { name: file.name }),
                            h('span', { className: 'ctx-fileName' }, file.name),
                            file.directory === '' ? null : h('span', { className: 'ctx-dir' }, file.directory),
                          ),
                          (() => {
                            const talk =
                              newest === undefined
                                ? t('noConversation')
                                : `${workspaceName === '' ? '' : `${workspaceName} / `}${newest.title ?? t('untitled')}`
                            return h(
                              'div',
                              { className: 'ctx-talk' },
                              extra > 0 ? h('span', { className: 'ctx-talkMore' }, `+${extra}`) : null,
                              newest === undefined
                                ? h('span', { className: 'ctx-talkNone', title: talk }, talk)
                                : h(
                                    'button',
                                    {
                                      type: 'button',
                                      className: 'ctx-talkLabel',
                                      title: `${t('openConversation')} · ${talk}`,
                                      onClick: picking ? undefined : () => openConversation(newest.sessionId),
                                    },
                                    talk,
                                  ),
                            )
                          })(),
                        ),
                        h(
                          'div',
                          { className: 'ctx-meta' },
                          h('span', { className: 'ctx-time', title: t('created') }, stampOf(file.createdAt, t)),
                          file.writes > 1 ? h('span', { className: 'ctx-writes' }, fill(t('writes'), 'count', file.writes)) : null,
                        ),
                        ),
                      ),
                    )
                  }),
                )

          const confirmDelete = async () => {
            if (confirming === null || deleting) return
            setDeleting(true)
            setDeleteError('')
            try {
              for (const path of confirming.paths) {
                const response = await fetch('/api/creation-timeline/delete', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ root: confirming.root, path }),
                })
                const payload = await response.json().catch(() => null)
                if (!response.ok || payload === null || payload.ok !== true) {
                  throw new Error(payload?.message ?? payload?.error ?? `HTTP ${response.status}`)
                }
              }
              setConfirming(null)
              setDeleting(false)
              setSelected(new Set())
              setPicking(false)
              setNonce((value) => value + 1)
            } catch (error) {
              setDeleting(false)
              setDeleteError(error instanceof Error ? error.message : String(error))
            }
          }

          const body =
            state.phase === 'no-workspace'
              ? h('p', { className: 'ctx-note' }, t('noWorkspace'))
              : state.phase === 'loading' && list === null
                ? h('p', { className: 'ctx-note' }, t('loading'))
                : state.phase === 'error'
                  ? h('p', { className: 'ctx-note', 'data-tone': 'error' }, fill(t('error.read'), 'message', state.message))
                  : list === null
                    ? h('p', { className: 'ctx-note' }, tokens.length === 0 ? t('empty') : t('noMatch'))
                    : list

          return h(
            React.Fragment,
            null,
            h(
              'div',
              { className: 'ctx-search' },
              h(
                'svg',
                { className: 'ctx-searchIcon', viewBox: '0 0 16 16', width: 14, height: 14, fill: 'none', 'aria-hidden': true },
                h('circle', { cx: 7, cy: 7, r: 4.6, stroke: 'currentColor', strokeWidth: 1.4 }),
                h('path', { d: 'M10.5 10.5 14 14', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
              ),
              h('input', {
                className: 'ctx-searchInput',
                type: 'text',
                value: query,
                placeholder: t('search'),
                'aria-label': t('search'),
                onChange: (event) => setQuery(event.target.value),
              }),
              query === ''
                ? null
                : h(
                    'button',
                    {
                      type: 'button',
                      className: 'ctx-searchClear',
                      'aria-label': t('clear'),
                      title: t('clear'),
                      onClick: () => setQuery(''),
                    },
                    '×',
                  ),
            ),
            h(
              'div',
              { className: 'ctx-toolbar' },
              picking
                ? h('button', { type: 'button', className: 'ctx-toolBtn', onClick: stopPicking }, t('delete.cancel'))
                : h(
                    'div',
                    {
                      className: 'ctx-filter',
                      onPointerDown: (event) => event.stopPropagation(),
                    },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'ctx-filterBtn',
                        'aria-haspopup': 'menu',
                        'aria-expanded': filterOpen ? 'true' : 'false',
                        'aria-label': t('filter'),
                        title: t('filter'),
                        onClick: () => setFilterOpen((value) => !value),
                      },
                      h(
                        'svg',
                        {
                          viewBox: '0 0 16 16',
                          width: 14,
                          height: 14,
                          fill: 'none',
                          'aria-hidden': true,
                          style: { transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' },
                        },
                        h('path', {
                          d: 'M3.5 6.2 8 10.4l4.5-4.2',
                          stroke: 'currentColor',
                          strokeWidth: 1.4,
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                        }),
                      ),
                    ),
                    filterOpen
                      ? h(
                          'div',
                          { className: 'ctx-filterMenu', role: 'menu' },
                          h(
                            'button',
                            {
                              type: 'button',
                              role: 'menuitemradio',
                              className: 'ctx-filterItem',
                              'aria-checked': onlyKey ? 'false' : 'true',
                              onClick: () => {
                                setOnlyKey(false)
                                setFilterOpen(false)
                              },
                            },
                            h('span', { className: 'ctx-filterCheck' }, onlyKey ? '' : '✓'),
                            t('allFiles'),
                          ),
                          h(
                            'button',
                            {
                              type: 'button',
                              role: 'menuitemradio',
                              className: 'ctx-filterItem',
                              'aria-checked': onlyKey ? 'true' : 'false',
                              onClick: () => {
                                setOnlyKey(true)
                                setFilterOpen(false)
                              },
                            },
                            h('span', { className: 'ctx-filterCheck' }, onlyKey ? '✓' : ''),
                            t('onlyKey'),
                          ),
                        )
                      : null,
                  ),
              h('span', { className: 'ctx-toolSpacer' }),
              picking
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'ctx-toolBtn ctx-toolDanger',
                      disabled: selected.size === 0 || deleting,
                      onClick: () => {
                        if (selected.size === 0) return
                        setDeleteError('')
                        setConfirming({ paths: [...selected], root: typeof cwd === 'string' ? cwd : '' })
                      },
                    },
                    selected.size === 0 ? t('delete.confirm') : `${t('delete.confirm')} (${selected.size})`,
                  )
                : h('button', { type: 'button', className: 'ctx-toolBtn', onClick: () => setPicking(true) }, t('select')),
            ),
            h('div', { className: 'ctx-scroll', ref: scrollRef }, body),
            confirming === null
              ? null
              : h(
                  'div',
                  { className: 'ctx-modal', role: 'dialog', 'aria-modal': 'true' },
                  h(
                    'div',
                    { className: 'ctx-modalCard' },
                    h(
                      'div',
                      { className: 'ctx-modalTitle' },
                      confirming.paths.length === 1 ? t('delete.title') : t('delete.titleMany'),
                    ),
                    h('p', { className: 'ctx-modalText' }, t('delete.body')),
                    confirming.paths.length === 1
                      ? h('p', { className: 'ctx-modalText' }, confirming.paths[0])
                      : h('p', { className: 'ctx-modalText' }, fill(t('delete.many'), 'count', confirming.paths.length)),
                    deleteError === ''
                      ? null
                      : h('p', { className: 'ctx-modalError' }, fill(t('delete.failed'), 'message', deleteError)),
                    h(
                      'div',
                      { className: 'ctx-modalRow' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'ctx-btn',
                          disabled: deleting,
                          onClick: () => {
                            setConfirming(null)
                            setDeleteError('')
                          },
                        },
                        t('delete.cancel'),
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'ctx-btn ctx-btnDanger',
                          disabled: deleting,
                          onClick: () => {
                            void confirmDelete()
                          },
                        },
                        t('delete.confirm'),
                      ),
                    ),
                  ),
                ),
          )
        }

        /**
         * The list's frame: it measures the workspace page's content box and covers
         * exactly that box, so the native header above stays untouched.
         * @param {object} props - the target.
         * @returns {import('react').ReactElement} the overlay.
         */
        function Overlay(props) {
          const { sessionId, onClose, useMenu, useSessions, paneId } = props
          let cwd
          try {
            cwd = typeof useSessions === 'function' ? useSessions((state) => state?.byId?.[sessionId]?.cwd) : undefined
          } catch (error) {
            cwd = undefined
          }
          const frameRef = React.useRef(null)
          const [box, setBox] = React.useState(null)

          React.useLayoutEffect(() => {
            const node = frameRef.current
            if (node === null) return undefined
            const page = node.closest('[data-files-page]')
            if (page === null) return undefined
            const content = page.querySelector('[data-files-content]') ?? page.lastElementChild ?? page
            const measure = () => {
              const parent = node.offsetParent
              if (parent === null) return
              const outer = parent.getBoundingClientRect()
              const inner = content.getBoundingClientRect()
              const room = Math.max(120, window.innerHeight - inner.top - 6)
              setBox({
                top: inner.top - outer.top,
                left: inner.left - outer.left,
                width: inner.width,
                height: Math.min(inner.height, room),
              })
            }
            measure()
            const observer = new ResizeObserver(measure)
            observer.observe(content)
            if (page !== null) observer.observe(page)
            window.addEventListener('resize', measure)
            return () => {
              observer.disconnect()
              window.removeEventListener('resize', measure)
            }
          }, [])

          const style =
            box === null
              ? { visibility: 'hidden', top: 0, left: 0, width: 0, height: 0 }
              : {
                  top: `${box.top}px`,
                  left: `${box.left}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                }
          return h('div', { className: 'ctx-overlay', ref: frameRef, style }, h(ByTimeList, { sessionId, cwd, onClose, useMenu, paneId }))
        }

        /**
         * The switch in the files page header, and the list it opens.
         * @param {object} props - the composed slot props.
         * @returns {import('react').ReactElement} the switch, plus the list when on.
         */
        function FilesPanel(props) {
          const sessionId = props.sessionId
          const [on, setOn] = React.useState(() => readStored(sessionId))

          const toggle = React.useCallback(() => {
            setOn((previous) => {
              const next = !previous
              writeStored(sessionId, next)
              return next
            })
          }, [sessionId])

          const close = React.useCallback(() => {
            setOn(false)
            writeStored(sessionId, false)
          }, [sessionId])

          return h(
            React.Fragment,
            null,
            h(
              'button',
              {
                type: 'button',
                role: 'switch',
                className: 'ctx-switch',
                'aria-checked': on ? 'true' : 'false',
                'aria-label': t('orderByTime'),
                title: on ? t('switch.off') : t('switch.on'),
                onClick: toggle,
              },
              h('span', { className: 'ctx-switchLabel' }, t('orderByTime')),
              h('span', { className: 'ctx-switchTrack', 'aria-hidden': true }, h('span', { className: 'ctx-switchKnob' })),
            ),
            on
              ? h(
                  PanelBoundary,
                  { key: 'panel' },
                  h(Overlay, {
                    sessionId,
                    onClose: close,
                    paneId: undefined,
                    useSessions: typeof props.useSessions === 'function' ? props.useSessions : undefined,
                    useMenu: typeof props.useContextMenu === 'function' ? props.useContextMenu : undefined,
                  }),
                )
              : null,
          )
        }


        ctx.effect(
          () =>
            ctx.contextMenus.register({
              id: 'creation-timeline.delete-file',
              target: 'file',
              order: 300,
              resolve: (target) => {
                if (target === null || typeof target !== 'object') return []
                const path = target.path
                const root = target.root
                if (typeof path !== 'string' || path === '' || typeof root !== 'string' || root === '') return []
                return [
                  {
                    id: 'creationTimelineDelete',
                    label: t('delete.menu'),
                    failureLabel: t('delete.failed'),
                    separatorBefore: true,
                    run: () => {
                      requestDelete({ path, root })
                    },
                  },
                ]
              },
            }),
          'creation-timeline: delete action',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.tab.files.actions', () =>
              ctx.slots.register(
                {
                  name: 'sidebar.right.tab.files.actions',
                  id: 'creation-timeline-toggle',
                  order: -1,
                  locale: NS,
                },
                FilesPanel,
              ),
            ),
          'creation-timeline: files switch',
        )
      },
    }
  },
})
