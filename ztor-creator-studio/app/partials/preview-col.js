/* partials/preview-col.js — 限高預覽欄（.preview-col--tall）的實際可用高度（2026-09-11）
   ============================================================================
   欄的 max-height 原本是 CSS 算的 100vh − sticky 頂距 − 底留白，但那個算式只在「欄已經釘在
   sticky 頂距」時成立；頁面還停在頂端、欄還在自然位置（比 sticky 頂距低了頁首那一段）時，
   卡的下緣就多出那一段、被視窗切掉（使用者：「範圍底部不要破窗」）。CSS 不知道欄現在離視窗頂
   多遠，所以由這支在捲動／改視窗時量 getBoundingClientRect().top，把「視窗底 − 欄頂 − 底留白」
   寫成 --preview-col-max；欄從自然位置往上捲到釘住的過程中卡會跟著長高一點，釘住之後就固定。 */
(function () {
  'use strict';
  var GAP = 24;   /* 與 preview-column.css 的 --sp-24 底留白同值 */
  function all() { return document.querySelectorAll('.preview-col--tall'); }
  function sync() {
    all().forEach(function (col) {
      var r = col.getBoundingClientRect();
      if (!r.height && !r.width) return;   /* 收著（display:none）不量 */
      col.style.setProperty('--preview-col-max', Math.max(240, window.innerHeight - r.top - GAP) + 'px');
      /* 釘在卡頂的標題列有多高（它自己已把卡的上內距吃進 padding），卡內其他要釘頂的東西從它底下開始 */
      var head = col.querySelector('.form-section--outlined > .form-section__head--rule');
      if (head) col.style.setProperty('--preview-head-h', head.getBoundingClientRect().height + 'px');
    });
  }
  document.addEventListener('scroll', sync, { passive: true, capture: true });
  window.addEventListener('resize', sync);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(sync);
    var watch = function () { all().forEach(function (c) { ro.observe(c); }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
  window.addEventListener('load', sync);
  window.ztorPreviewCol = { sync: sync };
})();
