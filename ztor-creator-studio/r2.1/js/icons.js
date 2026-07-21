// Ztor Creator Studio · Icon Registry (self-contained, offline-ready)
// 所有 icon 的 SVG 內容存在本地 REGISTRY、不依賴 CDN。
//
// 圖庫＝Tabler Icons（2026-07-21 由 Lucide 全面換過來，見 UI-CHANGES.md）。
// key 名稱沿用換庫前的舊名（例如 'trash-2'、'more-horizontal'），HTML 不用改；
// 對照表見 design-system.md「Icon 圖庫」節。
//
// 新增 icon 流程：
//   1. 去 https://tabler.io/icons 找
//   2. 點開 icon → Copy SVG
//   3. 把 <svg> 內層的 <path> / <circle> / <rect> 等內容貼到下方 REGISTRY
//      （Tabler 開頭那條隱形定界框 <path d="M0 0h24v24H0z"> 要刪掉）
//   4. 寫上用途註解
//   5. HTML 用 <i data-lucide="新名" class="ztor-icon"></i>
//
// 注意：SVG 內容用 viewBox="0 0 24 24" 為準（Tabler 原生規格，與 Lucide 同網格）。
// stroke-width / stroke / fill 全部由本檔的 applyIcons() 統一注入，不要寫死在 SVG 內。
// 實心變體（*-fill）例外：path 上帶 fill="currentColor" stroke="none"。

// ─── Registry ─────────────────────────────────────────────────────────────

const REGISTRY = {
  // 標準 Tabler icon —————————————————————————————————————
  'plus':           '<path d="M12 5l0 14" /> <path d="M5 12l14 0" />',                              // 建立 / 新增
  'arrow-left':     '<path d="M5 12l14 0" /> <path d="M5 12l6 6" /> <path d="M5 12l6 -6" />',                        // 返回 Creator 名冊（Admin 全域導航 · §4.1/D086）
  'shield-check':   '<path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" /> <path d="M15 19l2 2l4 -4" />',  // Creator Management（Admin 標記）
  'bell':           '<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /> <path d="M9 17v1a3 3 0 0 0 6 0v-1" />', // 通知
  'flag':           '<path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9" /> <path d="M5 21v-7" />', // 公告 / Announcements
  'refresh-ccw':    '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /> <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />', // 重新授權 / 同步
  'package-x':      '<path d="M8.812 4.793l3.188 -1.793l8 4.5v8.5m-2.282 1.784l-5.718 3.216l-8 -4.5v-9l2.223 -1.25" /> <path d="M14.543 10.57l5.457 -3.07" /> <path d="M12 12v9" /> <path d="M12 12l-8 -4.5" /> <path d="M16 5.25l-4.35 2.447m-2.564 1.442l-1.086 .611" /> <path d="M3 3l18 18" />', // 庫存過低
  'search':         '<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /> <path d="M21 21l-6 -6" />',           // 搜尋
  'sliders-horizontal': '<path d="M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M4 6l8 0" /> <path d="M16 6l4 0" /> <path d="M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M4 12l2 0" /> <path d="M10 12l10 0" /> <path d="M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M4 18l11 0" /> <path d="M19 18l1 0" />', // 篩選 / 狀態篩選
  'x':              '<path d="M18 6l-12 12" /> <path d="M6 6l12 12" />',                          // 關閉
  'more-horizontal':'<path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />', // 列溢出操作選單（⋯）
  'lock':           '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" /> <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /> <path d="M8 11v-4a4 4 0 1 1 8 0v4" />', // 阻斷型告警 / 鎖定（F4 blocking、關閉鈕 disabled）
  'eye':            '<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /> <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />',  // 即時預覽 Preview
  'chevron-left':   '<path d="M15 6l-6 6l6 6" />',                                              // 上一張 / 返回
  'chevron-right':  '<path d="M9 6l6 6l-6 6" />',                                               // 下一張 / next
  'chevron-down':   '<path d="M6 9l6 6l6 -6" />',                                                // dropdown / select 展開
  'upload':         '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /> <path d="M7 9l5 -5l5 5" /> <path d="M12 4l0 12" />', // 上傳
  'play':           '<path d="M7 4v16l13 -8l-13 -8" />',         // 播放
  'pause':          '<path d="M6 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12" /> <path d="M14 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12" />',      // 暫停（Album 曲目封面播放控制）
  'layout-grid':    '<path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />', // 卡片檢視
  'list':           '<path d="M9 6l11 0" /> <path d="M9 12l11 0" /> <path d="M9 18l11 0" /> <path d="M5 6l0 .01" /> <path d="M5 12l0 .01" /> <path d="M5 18l0 .01" />',                                          // 清單檢視
  'grip-vertical':  '<path d="M8 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M8 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M8 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M14 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M14 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M14 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',  // 拖曳把手（商品陳列排序）
  'more-vertical':  '<path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',  // 列操作選單觸發（kebab）
  'film':           '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" /> <path d="M8 4l0 16" /> <path d="M16 4l0 16" /> <path d="M4 8l4 0" /> <path d="M4 16l4 0" /> <path d="M4 12l16 0" /> <path d="M16 8l4 0" /> <path d="M16 16l4 0" />',  // 影片 / 電影 / 紀錄片 內容類型
  'music':          '<path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /> <path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /> <path d="M9 17v-13h10v13" /> <path d="M9 8h10" />',  // 音樂 / 專輯 / 歌單 內容類型
  'disc-3':         '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /> <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M7 12a5 5 0 0 1 5 -5" /> <path d="M12 17a5 5 0 0 0 5 -5" />',  // 黑膠 / 唱片（fan-store 預覽）
  'menu':           '<path d="M4 8l16 0" /> <path d="M4 16l16 0" />',                                                                                      // fan-store 手機 app bar（漢堡選單，display-only）
  'user':           '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /> <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />',                                                                // fan-store 手機 app bar（帳號，display-only）
  'shopping-cart':  '<path d="M4 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M15 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M17 17h-11v-14h-2" /> <path d="M6 5l14 1l-1 7h-13" />',  // fan-store 購物車（app bar＋商品卡加入鈕，display-only）
  'tag':            '<path d="M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3" />',                       // 我的 IP / 標籤
  'shopping-bag':   '<path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304" /> <path d="M9 11v-5a3 3 0 0 1 6 0v5" />',                              // 電子商店
  'calendar':       '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" /> <path d="M16 3v4" /> <path d="M8 3v4" /> <path d="M4 11h16" /> <path d="M11 15h1" /> <path d="M12 15v3" />',                                                            // 活動
  'trending-up':    '<path d="M3 17l6 -6l4 4l8 -8" /> <path d="M14 7l7 0l0 7" />',                                                                                                                      // 收入管理 / 趨勢
  'pencil':         '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /> <path d="M13.5 6.5l4 4" />',          // Stepper 狀態：Editing
  'copy':           '<path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /> <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />',                                                  // 列操作：複製
  'trash-2':        '<path d="M4 7l16 0" /> <path d="M10 11l0 6" /> <path d="M14 11l0 6" /> <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /> <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />',  // 列操作：刪除
  'image':          '<path d="M15 8h.01" /> <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12" /> <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /> <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />',                                         // 建立活動：圖片上傳格
  'video':          '<path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4" /> <path d="M3 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8" />',                                                // 建立活動：線上活動類型
  'tent':           '<path d="M11 14l4 6h6l-9 -16l-9 16h6l4 -6" />',                                                                            // 建立活動：音樂節類型
  'party-popper':   '<path d="M4 5h2" /> <path d="M5 4v2" /> <path d="M11.5 4l-.5 2" /> <path d="M18 5h2" /> <path d="M19 4v2" /> <path d="M15 9l-1 1" /> <path d="M18 13l2 -.5" /> <path d="M18 19h2" /> <path d="M19 18v2" /> <path d="M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39" />',  // 建立活動：發表派對類型
  'check-circle':   '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /> <path d="M9 12l2 2l4 -4" />',                                                                                                                     // Stepper 狀態：Completed
  'circle':         '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />',                                                                                                                                               // Stepper 狀態：Incomplete

  'badge-check':    '<path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1" /> <path d="M9 12l2 2l4 -4" />',   // 交易列表 · IP 授權金（2026-07-21 補：換 Tabler 前就缺鍵、渲染空白）

  'dollar-sign':   '<path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /> <path d="M12 3v3m0 12v3" />',   // 金額輸入前綴（design-system.html §4 input 示範；Tabler 名為 currency-dollar）

  'bar-chart-3':   '<path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6" /> <path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10" /> <path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14" /> <path d="M4 20h14" />',   // Admin 側欄 · IP Bank Reporting（2026-07-21 補：換 Tabler 前就缺鍵、渲染空白）

  // Alert row icons —————————————————————————————————————
  'alert-triangle': '<path d="M12 9v4" /> <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" /> <path d="M12 16h.01" />',                                                                                                                                                                       // alert-row--warn
  'info':           '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /> <path d="M12 9h.01" /> <path d="M11 12h1v4h1" />',                                                                                                                                                                                                                       // alert-row--info

  // Solid / filled variants (heroicons-style, evenodd cutout) — used in dashboard alert cards
  'alert-triangle-fill': '<path fill="currentColor" stroke="none" d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />',
  'x-circle-fill':       '<path fill="currentColor" stroke="none" d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" />',
  'info-fill':           '<path fill="currentColor" stroke="none" d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />',
  'check-circle-fill':   '<path fill="currentColor" stroke="none" d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />',

  // Sitemap §3.2.1 dropdown icons —————————————————————————
  'package':        '<path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /> <path d="M12 12l8 -4.5" /> <path d="M12 12l0 9" /> <path d="M12 12l-8 -4.5" /> <path d="M16 5.25l-8 4.5" />',  // E-Shop > Orders

  // 2026-07-11 全站 icon 缺鍵補齊（頁面已在用、registry 漏收，渲染空白）—————
  'inbox':          '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" /> <path d="M4 13h3l3 3h4l3 -3h3" />',  // event-detail 退款空狀態
  'gift':           '<path d="M3 9a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -2" /> <path d="M12 8l0 13" /> <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" /> <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />',  // event-detail 贈禮
  'heart':          '<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />',  // fan-detail 追蹤來源
  'history':        '<path d="M12 8l0 4l2 2" /> <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />',  // tier-settings 版本沿革
  'store':          '<path d="M3 21l18 0" /> <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" /> <path d="M5 21l0 -10.15" /> <path d="M19 21l0 -10.15" /> <path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />',  // ip-market 商店
  'user-plus':      '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /> <path d="M16 19h6" /> <path d="M19 16v6" /> <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />',  // fan-detail 新粉絲
  'file-check':     '<path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /> <path d="M9 15l2 2l4 -4" />',  // register-ip 佐證文件
  'truck':          '<path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" />',  // 補貨 > 供應商 / 物流
  'boxes':          '<path d="M12 4l-8 4l8 4l8 -4l-8 -4" /> <path d="M4 12l8 4l8 -4" /> <path d="M4 16l8 4l8 -4" />',  // 補貨 > 多品項 / 套組
  'users':          '<path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /> <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" /> <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />',          // Fans > Fans List
  'award':          '<path d="M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" /> <path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889" /> <path d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889" />',           // Fans > Loyalty Program
  'megaphone':      '<path d="M18 8a3 3 0 0 1 0 6" /> <path d="M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5" /> <path d="M12 8l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8" />',                                                                                                  // Fans > Announcements
  'rocket':         '<path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /> <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /> <path d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',  // Fans > Campaigns

  // Earnings §5.1.8 icons —————————————————————————————————
  'download':       '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /> <path d="M7 11l5 5l5 -5" /> <path d="M12 4l0 12" />',                                                                                                                                                       // Export / Tax Document download

  // Add new item (spec 5.1.5.2) icons ——————————————————————
  'gavel':          '<path d="M13 10l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385" /> <path d="M6 9l4 4" /> <path d="M13 10l-4 -4" /> <path d="M3 21h7" /> <path d="M6.793 15.793l-3.586 -3.586a1 1 0 0 1 0 -1.414l2.293 -2.293l.5 .5l3 -3l-.5 -.5l2.293 -2.293a1 1 0 0 1 1.414 0l3.586 3.586a1 1 0 0 1 0 1.414l-2.293 2.293l-.5 -.5l-3 3l.5 .5l-2.293 2.293a1 1 0 0 1 -1.414 0" />',                                                                                                              // Auction hero 占位
  'link':           '<path d="M9 15l6 -6" /> <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /> <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />',                                                                                                         // 拍賣列 Live 複製連結（5.1.5 F4 §89）
  'search-x':       '<path d="M5.039 5.062a7 7 0 0 0 9.91 9.89m1.584 -2.434a7 7 0 0 0 -9.038 -9.057" /> <path d="M3 3l18 18" />',                                                                                                                                          // 查無符合空狀態（5.1.5 F4 §96）
  'qr-code':        '<path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M7 17l0 .01" /> <path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M7 7l0 .01" /> <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /> <path d="M17 7l0 .01" /> <path d="M14 14l3 0" /> <path d="M20 14l0 .01" /> <path d="M14 14l0 3" /> <path d="M14 20l3 0" /> <path d="M17 17l3 0" /> <path d="M20 17l0 3" />',  // 取貨方式 > 現場 QR 領取（5.1.5.2 §4.1⑥）
  'camera':         '<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" /> <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />',                                                                                                                      // Prove it's real 合照
  'scan':           '<path d="M5 12h14" /> <path d="M3 7v-2a2 2 0 0 1 2 -2h2" /> <path d="M3 17v2a2 2 0 0 0 2 2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M17 21h2a2 2 0 0 0 2 -2v-2" />',  // 取貨管理 · 開始掃描 / scanner（5.1.5.11 F7）
  'map-pin':        '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /> <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0" />',  // 取貨場次地點（5.1.5.11 F3/F5）
  'calendar-clock': '<path d="M10.5 21h-4.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3" /> <path d="M16 3v4" /> <path d="M8 3v4" /> <path d="M4 11h10" /> <path d="M14 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /> <path d="M18 16.5v1.5l.5 .5" />',  // 取貨場次時間範圍（5.1.5.11 F3）
  'key':            '<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0" /> <path d="M15 9h.01" />',  // 取貨管理 · scanner 密碼（5.1.5.11 F6）
  'rotate-ccw':     '<path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />',  // 取貨管理 · 反轉錯誤核銷（5.1.5.11 F8）
  'file':           '<path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />',                                                                                                                                                   // Certificate 上傳
  'file-text':      '<path d="M14 3v4a1 1 0 0 0 1 1h4" /> <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /> <path d="M9 9l1 0" /> <path d="M9 13l6 0" /> <path d="M9 17l6 0" />',                                                                                  // Tax forms
  'clock':          '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /> <path d="M12 7v5l3 3" />',                                                                                                                                                                                    // Pending payout
  'check':          '<path d="M5 12l5 5l10 -10" />',                                                                                                                                                                                                                        // Paid
  'alert-circle':   '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /> <path d="M12 8v4" /> <path d="M12 16h.01" />',                                                                                                                                       // Failed / Disputed
  'x-circle':       '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /> <path d="M10 10l4 4m0 -4l-4 4" />',                                                                                                                                                                              // Not allowed (outline)
  'chart-line':     '<path d="M4 19l16 0" /> <path d="M4 15l4 -6l4 2l4 -5l4 4" />',                                                                                                                                                                                       // chart-card line-view toggle
  'chart-column':   '<path d="M4 20h3" /> <path d="M17 20h3" /> <path d="M10.5 20h3" /> <path d="M4 16h3" /> <path d="M17 16h3" /> <path d="M10.5 16h3" /> <path d="M4 12h3" /> <path d="M17 12h3" /> <path d="M10.5 12h3" /> <path d="M4 8h3" /> <path d="M17 8h3" /> <path d="M4 4h3" />',                                                                                                                                                     // chart-card bar-view toggle
  'globe':          '<path d="M7 9a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /> <path d="M5.75 15a8.015 8.015 0 1 0 9.25 -13" /> <path d="M11 17v4" /> <path d="M7 21h8" />',                                                                            // Supported regions
  'external-link':  '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /> <path d="M11 13l9 -9" /> <path d="M15 4h5v5" />',                                                                                                                                       // Project breakdown link
  'receipt':        '<path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2m4 -14h6m-6 4h6m-2 4h2" />',                                                                                                        // Transactions
  'percent':        '<path d="M16 17a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M6 7a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M6 18l12 -12" />',                                                                                                                                        // 平台費率設定 Admin 目的地
  'ticket':         '<path d="M15 5l0 2" /> <path d="M15 11l0 2" /> <path d="M15 17l0 2" /> <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />',  // F3 Event tickets income
  'banknote':      '<path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /> <path d="M3 8a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -8" /> <path d="M18 12h.01" /> <path d="M6 12h.01" />',  // Payout / money
  'landmark':      '<path d="M3 21l18 0" /> <path d="M3 10l18 0" /> <path d="M5 6l7 -3l7 3" /> <path d="M4 10l0 11" /> <path d="M20 10l0 11" /> <path d="M8 14l0 3" /> <path d="M12 14l0 3" /> <path d="M16 14l0 3" />',  // Payout bank account (earnings + payout modal)
  'paperclip':     '<path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />',  // Composer attach
  'repeat-2':       '<path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /> <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />',                                                                                                                            // Recurring royalty
  'arrow-up-right': '<path d="M17 7l-10 10" /> <path d="M8 7l9 0l0 9" />',                                                                                                                                                                                                              // View All Transactions
  'arrow-up':       '<path d="M12 5l0 14" /> <path d="M18 11l-6 -6" /> <path d="M6 11l6 -6" />',                                                                                                                                                                                                              // Composer send button
  'mic':            '<path d="M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5" /> <path d="M5 10a7 7 0 0 0 14 0" /> <path d="M8 21l8 0" /> <path d="M12 17l0 4" />',                                                                                                             // Composer voice input

  // Theme toggle icons (R 2.0 dark mode) ──────────────────
  'sun':            '<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /> <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />',  // Light theme indicator
  'moon':           '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />',                                                                                                                                                                                                              // Dark theme indicator
  'monitor':        '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10" /> <path d="M7 20h10" /> <path d="M9 16v4" /> <path d="M15 16v4" />',                                                                                                                          // System theme indicator
  'panel-left':     '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" /> <path d="M9 4l0 16" />',                                                                                                                                                                                    // 顯示模式：切到 Sidebar
  'panel-top':      '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" /> <path d="M4 9l16 0" />',                                                                                                                                                                                    // 顯示模式：切到 Topbar

  // Settings — notifications / sessions (2026-06-15) ───────
  'send':           '<path d="M10 14l11 -11" /> <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />',                                                                          // 寄測試通知 Send test
  'smartphone':     '<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14" /> <path d="M11 4h2" /> <path d="M12 17v.01" />',                                                                                                                                                                          // Active session — mobile device

  // Upload tile — interactive uploader actions (5.1.5.2 §4 Show it off) ───
  'refresh-cw':     '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /> <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />',  // 上傳格：替換圖片
  'sparkles':       '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />',  // 上傳格：AI 優化（假動作）

  // E-Shop — 商品縮圖占位分類 icon（5.1.5 F4，無圖商品依分類顯示）───────────
  'shirt':          '<path d="M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0" />',  // 服飾
  'book-open':      '<path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /> <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /> <path d="M3 6l0 13" /> <path d="M12 6l0 13" /> <path d="M21 6l0 13" />',  // 書籍
  'disc':           '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /> <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /> <path d="M7 12a5 5 0 0 1 5 -5" /> <path d="M12 17a5 5 0 0 0 5 -5" />',  // 音樂專輯
  'gem':            '<path d="M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5" /> <path d="M10 12l-2 -2.2l.6 -1" />',  // 收藏品
  'house':          '<path d="M5 12l-2 0l9 -9l9 9l-2 0" /> <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /> <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />',  // 居家生活
  'id-card':        '<path d="M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -10" /> <path d="M7 10a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /> <path d="M15 8l2 0" /> <path d="M15 12l2 0" /> <path d="M7 16l10 0" />',  // 會員卡 / 數位商品分類
};

// ─── Apply (替換 <i data-lucide> → <svg>) ────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';

function buildSvg(name, innerHTML, sourceEl) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('data-lucide', name);
  svg.innerHTML = innerHTML;
  // Preserve class / aria-hidden / per-icon overrides from the placeholder
  if (sourceEl.className) svg.setAttribute('class', sourceEl.className);
  if (sourceEl.hasAttribute('aria-hidden')) svg.setAttribute('aria-hidden', sourceEl.getAttribute('aria-hidden'));
  if (sourceEl.hasAttribute('stroke-width')) svg.setAttribute('stroke-width', sourceEl.getAttribute('stroke-width'));
  return svg;
}

function applyIcons(root = document) {
  const placeholders = root.querySelectorAll('[data-lucide]:not(svg)');
  placeholders.forEach(el => {
    const name = el.getAttribute('data-lucide');
    const inner = REGISTRY[name];
    if (!inner) {
      console.warn(`[icons.js] Unknown icon "${name}" — add it to REGISTRY in icons.js`);
      return;
    }
    el.replaceWith(buildSvg(name, inner, el));
  });
}

// Optional full set: if a page loaded icons-all.js (window.ZTOR_ICONS_ALL),
// merge any missing icons so the full Lucide library renders. Product pages don't
// load it, so they stay lean (just this hand-curated REGISTRY).
if (window.ZTOR_ICONS_ALL) {
  for (const k in window.ZTOR_ICONS_ALL) { if (!(k in REGISTRY)) REGISTRY[k] = window.ZTOR_ICONS_ALL[k]; }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyIcons());
} else {
  applyIcons();
}

// Expose for manual re-application after dynamic insertions
window.ztorIcons = { applyIcons, render: applyIcons, REGISTRY };
