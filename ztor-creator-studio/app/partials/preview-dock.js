// partials/preview-dock.js — 建立流程預覽欄的開關（2026-10-28，UI-CHANGES 402；樣式見 ds-components/preview-dock.css）
//  · 找出這一頁可停靠的預覽欄（內含 .fan-phone 的 .wizard-split__rail／.preview-col），掛 .preview-dock__rail 並補一顆 ✕；
//  · 在頂列 .wizard__top-actions 的儲存狀態鈕右邊補一顆眼睛圖示鈕（.preview-dock-toggle）；
//  · .wizard[data-preview] ＝ open／closed（預設 open，存 localStorage）；.wizard[data-preview-active] ＝ 目前這一步有可見的預覽欄
//    （建立活動第 5～8 步沒有預覽欄時整個機制不作用：內容不留右側空位、開關鈕收起）。
(function () {
  var KEY = 'ztor.preview-dock';
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function start() {
    var wizard = document.querySelector('.wizard');
    if (!wizard) return;
    var rails = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-split__rail, .preview-col')).filter(function (r) { return r.querySelector(':scope > .fan-phone'); });
    var actions = wizard.querySelector('.wizard__top-actions');
    if (!rails.length || !actions) return;

    var open = true;
    try { open = localStorage.getItem(KEY) !== 'closed'; } catch (e) {}

    var eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'btn btn--outline btn--icon preview-dock-toggle';
    toggle.innerHTML = eye;
    toggle.hidden = true;
    actions.appendChild(toggle);

    rails.forEach(function (r) {
      r.classList.add('preview-dock__rail');
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'preview-dock__close'; x.textContent = '✕';
      x.addEventListener('click', function () { set(false); });
      r.insertBefore(x, r.firstChild);
    });

    function railInFlow(r) {
      if (r.hidden || r.classList.contains('hidden')) return false;
      for (var el = r.parentElement; el && el !== wizard; el = el.parentElement) {
        if (el.hidden || getComputedStyle(el).display === 'none') return false;
      }
      return true;
    }
    function label() {
      var l = T('wiz.preview', 'Preview');
      toggle.setAttribute('aria-label', l); toggle.title = l;
      rails.forEach(function (r) { var c = r.querySelector('.preview-dock__close'); if (c) c.setAttribute('aria-label', T('wiz.preview.close', 'Close preview')); });
    }
    function sync() {
      var active = rails.some(railInFlow);
      if (active) wizard.setAttribute('data-preview-active', ''); else wizard.removeAttribute('data-preview-active');
      wizard.setAttribute('data-preview', open ? 'open' : 'closed');
      if (toggle.hidden === active) toggle.hidden = !active;   // 值有變才寫，免得 MutationObserver 每幀自己觸發自己
      toggle.setAttribute('aria-pressed', String(open));
    }
    function set(v) {
      open = v;
      try { localStorage.setItem(KEY, v ? 'open' : 'closed'); } catch (e) {}
      sync();
    }
    toggle.addEventListener('click', function () { set(!open); });

    var pending = false;
    new MutationObserver(function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () { pending = false; sync(); });
    }).observe(wizard, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
    document.addEventListener('i18n:applied', label);
    label(); sync();
  }
  if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start);
})();
