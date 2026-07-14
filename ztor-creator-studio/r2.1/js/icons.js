// Ztor Creator Studio · Icon Registry (self-contained, offline-ready)
// 所有 icon 的 SVG 內容存在本地 REGISTRY、不依賴 CDN。
//
// 新增 icon 流程：
//   1. 去 https://lucide.dev/icons 找
//   2. 點開 icon → Copy SVG
//   3. 把 <svg> 內層的 <path> / <circle> / <rect> 等內容貼到下方 REGISTRY
//   4. 寫上用途註解
//   5. HTML 用 <i data-lucide="新名" class="ztor-icon"></i>
//
// 注意：SVG 內容用 viewBox="0 0 24 24" 為準（Lucide 原生規格）。
// stroke-width / stroke / fill 全部由本檔的 applyIcons() 統一注入，不要寫死在 SVG 內。

// ─── Registry ─────────────────────────────────────────────────────────────

const REGISTRY = {
  // 標準 Lucide icon —————————————————————————————————————
  'plus':           '<path d="M5 12h14" /> <path d="M12 5v14" />',                              // 建立 / 新增
  'arrow-left':     '<path d="m12 19-7-7 7-7" /> <path d="M19 12H5" />',                        // 返回 Creator 名冊（Admin 全域導航 · §4.1/D086）
  'shield-check':   '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" />',  // Creator Management（Admin 標記）
  'bell':           '<path d="M10.268 21a2 2 0 0 0 3.464 0" /> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />', // 通知
  'flag':           '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /> <line x1="4" x2="4" y1="22" y2="15" />', // 公告 / Announcements
  'refresh-ccw':    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M3 21v-5h5" />', // 重新授權 / 同步
  'package-x':      '<path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" /> <path d="M16.5 9.4 7.55 4.24" /> <polyline points="3.29 7 12 12 20.71 7" /> <line x1="12" x2="12" y1="22" y2="12" /> <path d="m17 17 5 5" /> <path d="m22 17-5 5" />', // 庫存過低
  'search':         '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',           // 搜尋
  'sliders-horizontal': '<line x1="21" x2="14" y1="4" y2="4" /> <line x1="10" x2="3" y1="4" y2="4" /> <line x1="21" x2="12" y1="12" y2="12" /> <line x1="8" x2="3" y1="12" y2="12" /> <line x1="21" x2="16" y1="20" y2="20" /> <line x1="12" x2="3" y1="20" y2="20" /> <line x1="14" x2="14" y1="2" y2="6" /> <line x1="8" x2="8" y1="10" y2="14" /> <line x1="16" x2="16" y1="18" y2="22" />', // 篩選 / 狀態篩選
  'x':              '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',                          // 關閉
  'more-horizontal':'<circle cx="12" cy="12" r="1" /> <circle cx="19" cy="12" r="1" /> <circle cx="5" cy="12" r="1" />', // 列溢出操作選單（⋯）
  'lock':           '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" />', // 阻斷型告警 / 鎖定（F4 blocking、關閉鈕 disabled）
  'eye':            '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" />',  // 即時預覽 Preview
  'chevron-left':   '<path d="m15 18-6-6 6-6" />',                                              // 上一張 / 返回
  'chevron-right':  '<path d="m9 18 6-6-6-6" />',                                               // 下一張 / next
  'chevron-down':   '<path d="m6 9 6 6 6-6" />',                                                // dropdown / select 展開
  'upload':         '<path d="M12 3v12" /> <path d="m17 8-5-5-5 5" /> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />', // 上傳
  'play':           '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',         // 播放
  'pause':          '<rect x="14" y="4" width="4" height="16" rx="1" /> <rect x="6" y="4" width="4" height="16" rx="1" />',      // 暫停（Album 曲目封面播放控制）
  'layout-grid':    '<rect width="7" height="7" x="3" y="3" rx="1" /> <rect width="7" height="7" x="14" y="3" rx="1" /> <rect width="7" height="7" x="14" y="14" rx="1" /> <rect width="7" height="7" x="3" y="14" rx="1" />', // 卡片檢視
  'list':           '<path d="M3 5h.01" /> <path d="M3 12h.01" /> <path d="M3 19h.01" /> <path d="M8 5h13" /> <path d="M8 12h13" /> <path d="M8 19h13" />',                                          // 清單檢視
  'grip-vertical':  '<circle cx="9" cy="12" r="1" fill="currentColor" /> <circle cx="9" cy="5" r="1" fill="currentColor" /> <circle cx="9" cy="19" r="1" fill="currentColor" /> <circle cx="15" cy="12" r="1" fill="currentColor" /> <circle cx="15" cy="5" r="1" fill="currentColor" /> <circle cx="15" cy="19" r="1" fill="currentColor" />',  // 拖曳把手（商品陳列排序）
  'more-vertical':  '<circle cx="12" cy="12" r="1" fill="currentColor" /> <circle cx="12" cy="5" r="1" fill="currentColor" /> <circle cx="12" cy="19" r="1" fill="currentColor" />',  // 列操作選單觸發（kebab）
  'film':           '<rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M7 3v18" /> <path d="M3 7.5h4" /> <path d="M3 12h18" /> <path d="M3 16.5h4" /> <path d="M17 3v18" /> <path d="M17 7.5h4" /> <path d="M17 16.5h4" />',  // 影片 / 電影 / 紀錄片 內容類型
  'music':          '<path d="M9 18V5l12-2v13" /> <circle cx="6" cy="18" r="3" /> <circle cx="18" cy="16" r="3" />',  // 音樂 / 專輯 / 歌單 內容類型
  'disc-3':         '<circle cx="12" cy="12" r="10" /> <path d="M6 12c0-1.7.7-3.2 1.8-4.2" /> <circle cx="12" cy="12" r="2" /> <path d="M18 12c0 1.7-.7 3.2-1.8 4.2" />',  // 黑膠 / 唱片（fan-store 預覽）
  'menu':           '<path d="M4 5h16" /> <path d="M4 12h16" /> <path d="M4 19h16" />',                                                                                      // fan-store 手機 app bar（漢堡選單，display-only）
  'user':           '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" />',                                                                // fan-store 手機 app bar（帳號，display-only）
  'shopping-cart':  '<circle cx="8" cy="21" r="1" /> <circle cx="19" cy="21" r="1" /> <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />',  // fan-store 購物車（app bar＋商品卡加入鈕，display-only）
  'tag':            '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /> <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />',                       // 我的 IP / 標籤
  'shopping-bag':   '<path d="M16 10a4 4 0 0 1-8 0" /> <path d="M3.103 6.034h17.794" /> <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />',                              // 電子商店
  'calendar':       '<path d="M8 2v4" /> <path d="M16 2v4" /> <rect width="18" height="18" x="3" y="4" rx="2" /> <path d="M3 10h18" />',                                                            // 活動
  'trending-up':    '<path d="M16 7h6v6" /> <path d="m22 7-8.5 8.5-5-5L2 17" />',                                                                                                                      // 收入管理 / 趨勢
  'pencil':         '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" />',          // Stepper 狀態：Editing
  'copy':           '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',                                                  // 列操作：複製
  'trash-2':        '<path d="M3 6h18" /> <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /> <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /> <line x1="10" x2="10" y1="11" y2="17" /> <line x1="14" x2="14" y1="11" y2="17" />',  // 列操作：刪除
  'image':          '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /> <circle cx="9" cy="9" r="2" /> <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',                                         // 建立活動：圖片上傳格
  'video':          '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /> <rect x="2" y="6" width="14" height="12" rx="2" />',                                                // 建立活動：線上活動類型
  'tent':           '<path d="M3.5 21 14 3" /> <path d="M20.5 21 10 3" /> <path d="M15.5 21 12 15l-3.5 6" /> <path d="M2 21h20" />',                                                                            // 建立活動：音樂節類型
  'party-popper':   '<path d="M5.8 11.3 2 22l10.7-3.79" /> <path d="M4 3h.01" /> <path d="M22 8h.01" /> <path d="M15 2h.01" /> <path d="M22 20h.01" /> <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L12 10" /> <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.97 1.11c-.11.7-.72 1.22-1.43 1.22H17" /> <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.97c-.7.11-1.22.72-1.22 1.43V7" /> <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />',  // 建立活動：發表派對類型
  'check-circle':   '<circle cx="12" cy="12" r="10" /> <path d="m9 12 2 2 4-4" />',                                                                                                                     // Stepper 狀態：Completed
  'circle':         '<circle cx="12" cy="12" r="10" />',                                                                                                                                               // Stepper 狀態：Incomplete

  // Alert row icons —————————————————————————————————————
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /> <path d="M12 9v4" /> <path d="M12 17h.01" />',                                                                                                                                                                       // alert-row--warn
  'info':           '<circle cx="12" cy="12" r="10" /> <path d="M12 16v-4" /> <path d="M12 8h.01" />',                                                                                                                                                                                                                       // alert-row--info

  // Solid / filled variants (heroicons-style, evenodd cutout) — used in dashboard alert cards
  'alert-triangle-fill': '<path fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2.002 5.197 0l7.355 12.748c1.154 1.999-.29 4.499-2.599 4.499H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />',
  'x-circle-fill':       '<path fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" />',
  'info-fill':           '<path fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm0 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-.75 2.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0V10.25Z" />',
  'check-circle-fill':   '<path fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" />',

  // Sitemap §3.2.1 dropdown icons —————————————————————————
  'package':        '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /> <path d="M12 22V12" /> <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" /> <path d="m7.5 4.27 9 5.15" />',  // E-Shop > Orders

  // 2026-07-11 全站 icon 缺鍵補齊（頁面已在用、registry 漏收，渲染空白）—————
  'inbox':          '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /> <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />',  // event-detail 退款空狀態
  'gift':           '<rect x="3" y="8" width="18" height="4" rx="1" /> <path d="M12 8v13" /> <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /> <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />',  // event-detail 贈禮
  'heart':          '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />',  // fan-detail 追蹤來源
  'history':        '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /> <path d="M3 3v5h5" /> <path d="M12 7v5l4 2" />',  // tier-settings 版本沿革
  'store':          '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /> <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /> <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /> <path d="M2 7h20" /> <path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />',  // ip-market 商店
  'user-plus':      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <line x1="19" x2="19" y1="8" y2="14" /> <line x1="22" x2="16" y1="11" y2="11" />',  // fan-detail 新粉絲
  'file-check':     '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="m9 15 2 2 4-4" />',  // register-ip 佐證文件
  'truck':          '<path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2" /> <path d="M15 18H9" /> <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /> <circle cx="17" cy="18" r="2" /> <circle cx="7" cy="18" r="2" />',  // 補貨 > 供應商 / 物流
  'boxes':          '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /> <path d="m7 16.5-4.74-2.85" /> <path d="m7 16.5 5-3" /> <path d="M7 16.5v5.17" /> <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /> <path d="m17 16.5-5-3" /> <path d="m17 16.5 4.74-2.85" /> <path d="M17 16.5v5.17" /> <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /> <path d="M12 8 7.26 5.15" /> <path d="m12 8 4.74-2.85" /> <path d="M12 13.5V8" />',  // 補貨 > 多品項 / 套組
  'users':          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" />',          // Fans > Fans List
  'award':          '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /> <circle cx="12" cy="8" r="6" />',           // Fans > Loyalty Program
  'megaphone':      '<path d="m3 11 18-5v12L3 14v-3z" /> <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />',                                                                                                  // Fans > Announcements
  'rocket':         '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /> <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /> <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />',  // Fans > Campaigns

  // Earnings §5.1.8 icons —————————————————————————————————
  'download':       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <path d="M7 10l5 5 5-5" /> <path d="M12 15V3" />',                                                                                                                                                       // Export / Tax Document download

  // Add new item (spec 5.1.5.2) icons ——————————————————————
  'gavel':          '<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" /> <path d="m16 16 6-6" /> <path d="m8 8 6-6" /> <path d="m9 7 8 8" /> <path d="m21 11-8-8" />',                                                                                                              // Auction hero 占位
  'link':           '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',                                                                                                         // 拍賣列 Live 複製連結（5.1.5 F4 §89）
  'search-x':       '<path d="m13.5 8.5-5 5" /> <path d="m8.5 8.5 5 5" /> <circle cx="11" cy="11" r="8" /> <path d="m21 21-4.3-4.3" />',                                                                                                                                          // 查無符合空狀態（5.1.5 F4 §96）
  'qr-code':        '<rect width="5" height="5" x="3" y="3" rx="1" /> <rect width="5" height="5" x="16" y="3" rx="1" /> <rect width="5" height="5" x="3" y="16" rx="1" /> <path d="M21 16h-3a2 2 0 0 0-2 2v3" /> <path d="M21 21v.01" /> <path d="M12 7v3a2 2 0 0 1-2 2H7" /> <path d="M3 12h.01" /> <path d="M12 3h.01" /> <path d="M12 16v.01" /> <path d="M16 12h1" /> <path d="M21 12v.01" /> <path d="M12 21v-1" />',  // 取貨方式 > 現場 QR 領取（5.1.5.2 §4.1⑥）
  'camera':         '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /> <circle cx="12" cy="13" r="3" />',                                                                                                                      // Prove it's real 合照
  'scan':           '<path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" />',  // 取貨管理 · 開始掃描 / scanner（5.1.5.11 F7）
  'map-pin':        '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /> <circle cx="12" cy="10" r="3" />',  // 取貨場次地點（5.1.5.11 F3/F5）
  'calendar-clock': '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /> <path d="M16 2v4" /> <path d="M8 2v4" /> <path d="M3 10h5" /> <path d="M17.5 17.5 16 16.25V14" /> <circle cx="16" cy="16" r="6" />',  // 取貨場次時間範圍（5.1.5.11 F3）
  'key':            '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L21 5" /> <path d="m21 2-9.6 9.6" /> <circle cx="7.5" cy="15.5" r="5.5" />',  // 取貨管理 · scanner 密碼（5.1.5.11 F6）
  'rotate-ccw':     '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /> <path d="M3 3v5h5" />',  // 取貨管理 · 反轉錯誤核銷（5.1.5.11 F8）
  'file':           '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" />',                                                                                                                                                   // Certificate 上傳
  'file-text':      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="M10 9H8" /> <path d="M16 13H8" /> <path d="M16 17H8" />',                                                                                  // Tax forms
  'clock':          '<circle cx="12" cy="12" r="10" /> <polyline points="12 6 12 12 16 14" />',                                                                                                                                                                                    // Pending payout
  'check':          '<polyline points="20 6 9 17 4 12" />',                                                                                                                                                                                                                        // Paid
  'alert-circle':   '<circle cx="12" cy="12" r="10" /> <line x1="12" y1="8" x2="12" y2="12" /> <line x1="12" y1="16" x2="12.01" y2="16" />',                                                                                                                                       // Failed / Disputed
  'x-circle':       '<circle cx="12" cy="12" r="10" /> <path d="m15 9-6 6" /> <path d="m9 9 6 6" />',                                                                                                                                                                              // Not allowed (outline)
  'chart-line':     '<path d="M3 3v16a2 2 0 0 0 2 2h16" /> <path d="m19 9-5 5-4-4-3 3" />',                                                                                                                                                                                       // chart-card line-view toggle
  'chart-column':   '<path d="M3 3v16a2 2 0 0 0 2 2h16" /> <path d="M18 17V9" /> <path d="M13 17V5" /> <path d="M8 17v-3" />',                                                                                                                                                     // chart-card bar-view toggle
  'globe':          '<circle cx="12" cy="12" r="10" /> <line x1="2" y1="12" x2="22" y2="12" /> <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />',                                                                            // Supported regions
  'external-link':  '<path d="M15 3h6v6" /> <path d="M10 14 21 3" /> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',                                                                                                                                       // Project breakdown link
  'receipt':        '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /> <path d="M16 8H8" /> <path d="M16 12H8" /> <path d="M13 16H8" />',                                                                                                        // Transactions
  'ticket':         '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /> <path d="M13 5v2" /> <path d="M13 17v2" /> <path d="M13 11v2" />',  // F3 Event tickets income
  'banknote':      '<rect width="20" height="12" x="2" y="6" rx="2" /> <circle cx="12" cy="12" r="2" /> <path d="M6 12h.01M18 12h.01" />',  // Payout / money
  'landmark':      '<path d="M10 18v-7" /> <path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z" /> <path d="M14 18v-7" /> <path d="M18 18v-7" /> <path d="M3 22h18" /> <path d="M6 18v-7" />',  // Payout bank account (earnings + payout modal)
  'paperclip':     '<path d="M13.234 20.252 21 12.3" /> <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 0 0-5.657-5.657l-8.379 8.551a6 6 0 0 0 8.485 8.485l7.293-7.586" />',  // Composer attach
  'repeat-2':       '<path d="m2 9 3-3 3 3" /> <path d="M13 18H7a2 2 0 0 1-2-2V6" /> <path d="m22 15-3 3-3-3" /> <path d="M11 6h6a2 2 0 0 1 2 2v10" />',                                                                                                                            // Recurring royalty
  'arrow-up-right': '<path d="M7 7h10v10" /> <path d="M7 17 17 7" />',                                                                                                                                                                                                              // View All Transactions
  'arrow-up':       '<path d="m5 12 7-7 7 7" /> <path d="M12 19V5" />',                                                                                                                                                                                                              // Composer send button
  'mic':            '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /> <path d="M19 10v2a7 7 0 0 1-14 0v-2" /> <line x1="12" x2="12" y1="19" y2="22" />',                                                                                                             // Composer voice input

  // Theme toggle icons (R 2.0 dark mode) ──────────────────
  'sun':            '<circle cx="12" cy="12" r="4" /> <path d="M12 2v2" /> <path d="M12 20v2" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" /> <path d="M2 12h2" /> <path d="M20 12h2" /> <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />',  // Light theme indicator
  'moon':           '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',                                                                                                                                                                                                              // Dark theme indicator
  'monitor':        '<rect width="20" height="14" x="2" y="3" rx="2" /> <line x1="8" x2="16" y1="21" y2="21" /> <line x1="12" x2="12" y1="17" y2="21" />',                                                                                                                          // System theme indicator
  'panel-left':     '<rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M9 3v18" />',                                                                                                                                                                                    // 顯示模式：切到 Sidebar
  'panel-top':      '<rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M3 9h18" />',                                                                                                                                                                                    // 顯示模式：切到 Topbar

  // Settings — notifications / sessions (2026-06-15) ───────
  'send':           '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /> <path d="m21.854 2.147-10.94 10.939" />',                                                                          // 寄測試通知 Send test
  'smartphone':     '<rect width="14" height="20" x="5" y="2" rx="2" ry="2" /> <path d="M12 18h.01" />',                                                                                                                                                                          // Active session — mobile device

  // Upload tile — interactive uploader actions (5.1.5.2 §4 Show it off) ───
  'refresh-cw':     '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M8 16H3v5" />',  // 上傳格：替換圖片
  'sparkles':       '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /> <path d="M20 3v4" /> <path d="M22 5h-4" /> <path d="M4 17v2" /> <path d="M5 18H3" />',  // 上傳格：AI 優化（假動作）

  // E-Shop — 商品縮圖占位分類 icon（5.1.5 F4，無圖商品依分類顯示）───────────
  'shirt':          '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />',  // 服飾
  'book-open':      '<path d="M12 7v14" /> <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />',  // 書籍
  'disc':           '<circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="2" />',  // 音樂專輯
  'gem':            '<path d="M10.5 3 8 9l4 13 4-13-2.5-6" /> <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" /> <path d="M2 9h20" />',  // 收藏品
  'house':          '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /> <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',  // 居家生活
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
