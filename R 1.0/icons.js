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
  'bell':           '<path d="M10.268 21a2 2 0 0 0 3.464 0" /> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />', // 通知
  'search':         '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',           // 搜尋
  'x':              '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',                          // 關閉
  'chevron-left':   '<path d="m15 18-6-6 6-6" />',                                              // 上一張 / 返回
  'chevron-right':  '<path d="m9 18 6-6-6-6" />',                                               // 下一張 / next
  'chevron-down':   '<path d="m6 9 6 6 6-6" />',                                                // dropdown / select 展開
  'upload':         '<path d="M12 3v12" /> <path d="m17 8-5-5-5 5" /> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />', // 上傳
  'play':           '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',         // 播放
  'layout-grid':    '<rect width="7" height="7" x="3" y="3" rx="1" /> <rect width="7" height="7" x="14" y="3" rx="1" /> <rect width="7" height="7" x="14" y="14" rx="1" /> <rect width="7" height="7" x="3" y="14" rx="1" />', // 卡片檢視
  'list':           '<path d="M3 5h.01" /> <path d="M3 12h.01" /> <path d="M3 19h.01" /> <path d="M8 5h13" /> <path d="M8 12h13" /> <path d="M8 19h13" />',                                          // 清單檢視
  'tag':            '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /> <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />',                       // 我的 IP / 標籤
  'shopping-bag':   '<path d="M16 10a4 4 0 0 1-8 0" /> <path d="M3.103 6.034h17.794" /> <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />',                              // 電子商店
  'calendar':       '<path d="M8 2v4" /> <path d="M16 2v4" /> <rect width="18" height="18" x="3" y="4" rx="2" /> <path d="M3 10h18" />',                                                            // 活動
  'trending-up':    '<path d="M16 7h6v6" /> <path d="m22 7-8.5 8.5-5-5L2 17" />',                                                                                                                      // 收入管理 / 趨勢
  'pencil':         '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" />',          // Stepper 狀態：Editing
  'check-circle':   '<circle cx="12" cy="12" r="10" /> <path d="m9 12 2 2 4-4" />',                                                                                                                     // Stepper 狀態：Completed
  'circle':         '<circle cx="12" cy="12" r="10" />',                                                                                                                                               // Stepper 狀態：Incomplete

  // Alert row icons —————————————————————————————————————
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /> <path d="M12 9v4" /> <path d="M12 17h.01" />',                                                                                                                                                                       // alert-row--warn
  'info':           '<circle cx="12" cy="12" r="10" /> <path d="M12 16v-4" /> <path d="M12 8h.01" />',                                                                                                                                                                                                                       // alert-row--info

  // Sitemap §3.2.1 dropdown icons —————————————————————————
  'package':        '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /> <path d="M12 22V12" /> <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" /> <path d="m7.5 4.27 9 5.15" />',  // E-Shop > Orders
  'users':          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" />',          // Fans > Fans List
  'award':          '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /> <circle cx="12" cy="8" r="6" />',           // Fans > Loyalty Program
  'megaphone':      '<path d="m3 11 18-5v12L3 14v-3z" /> <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />',                                                                                                  // Fans > Announcements
  'rocket':         '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /> <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /> <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />',  // Fans > Campaigns

  // Earnings §5.1.8 icons —————————————————————————————————
  'download':       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <path d="M7 10l5 5 5-5" /> <path d="M12 15V3" />',                                                                                                                                                       // Export / Tax Document download
  'file-text':      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="M10 9H8" /> <path d="M16 13H8" /> <path d="M16 17H8" />',                                                                                  // Tax forms
  'clock':          '<circle cx="12" cy="12" r="10" /> <polyline points="12 6 12 12 16 14" />',                                                                                                                                                                                    // Pending payout
  'check':          '<polyline points="20 6 9 17 4 12" />',                                                                                                                                                                                                                        // Paid
  'alert-circle':   '<circle cx="12" cy="12" r="10" /> <line x1="12" y1="8" x2="12" y2="12" /> <line x1="12" y1="16" x2="12.01" y2="16" />',                                                                                                                                       // Failed / Disputed
  'globe':          '<circle cx="12" cy="12" r="10" /> <line x1="2" y1="12" x2="22" y2="12" /> <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />',                                                                            // Supported regions
  'external-link':  '<path d="M15 3h6v6" /> <path d="M10 14 21 3" /> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />',                                                                                                                                       // Project breakdown link
  'receipt':        '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /> <path d="M16 8H8" /> <path d="M16 12H8" /> <path d="M13 16H8" />',                                                                                                        // Transactions
  'repeat-2':       '<path d="m2 9 3-3 3 3" /> <path d="M13 18H7a2 2 0 0 1-2-2V6" /> <path d="m22 15-3 3-3-3" /> <path d="M11 6h6a2 2 0 0 1 2 2v10" />',                                                                                                                            // Recurring royalty
  'arrow-up-right': '<path d="M7 7h10v10" /> <path d="M7 17 17 7" />',                                                                                                                                                                                                              // View All Transactions
};

// ─── Apply (替換 <i data-lucide> → <svg>) ────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';

function buildSvg(name, innerHTML, sourceEl) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyIcons());
} else {
  applyIcons();
}

// Expose for manual re-application after dynamic insertions
window.ztorIcons = { applyIcons, REGISTRY };
