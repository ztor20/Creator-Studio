/* partials/fan-phone.js — 建立流程右欄的粉絲頁手機版鏡像（樣式 ds-components/fan-phone.css）
   ============================================================================
   2026-10-28（UI-CHANGES 394 建立活動、#397 建立商品與建立組合包）：三條建立流程的右欄預覽都改成粉絲端對應頁面的
   手機版，內容用各自「預覽與發布」那一步同一支渲染器（js/fan-event-page.js／fan-product-page.js／
   fan-bundle-page.js）與同一份 model——宿主把自己的 buildStageOpts()（publish-stage 的選項）交進來，
   本檔借它的 fields／prices／baseCurrency／previewRender，配一個替身 api 畫進 .fan-phone。
   替身 api 與 publish-stage.js 的 previewApi() 同形，但固定介面語言與基準幣別、不開 inline 編輯
   （右欄沒有語言／幣別切換與翻譯表，那些只在「預覽與發布」那一步）。
   用法：
     window.ztorFanPhone.render(host, opts)      // opts＝宿主的 buildStageOpts()
     var schedule = window.ztorFanPhone.scheduler(fn)   // 輸入時頻繁呼叫，合併到下一個畫格跑一次 fn */
(function () {
  'use strict';
  function render(host, opts) {
    if (!host || !opts || typeof opts.previewRender !== 'function') return;
    var vals = {};
    (opts.fields || []).forEach(function (f) { vals[f.key] = f.el ? String(f.el.value || '').trim() : ''; });
    var byKey = {};
    (opts.prices || []).forEach(function (p) { byKey[p.key] = p.priceObj; });
    var S = window.ztorEvents, cur = opts.baseCurrency || 'TWD';
    var lang = window.ztorLang ? window.ztorLang.get() : 'en';
    function priceIn(po, key) { var o = (key && byKey[key]) || po; return S && o ? S.priceIn(o, cur) : 0; }
    function fmt(n) { return S ? S.fmtMoney(cur, n) : String(n); }
    var api = {
      lang: lang, isDefault: true,
      getValue: function (k) { return vals[k] || ''; },
      bindEditable: function (node, k) {
        if (!node) return;
        node.removeAttribute('data-i18n');
        node.textContent = vals[k] || '';
        node.classList.toggle('is-empty', !node.textContent);
      },
      currency: cur,
      priceIn: priceIn,
      money: function (po, key) { return fmt(priceIn(po, key)); },
      fmt: fmt
    };
    host.innerHTML = '';
    opts.previewRender(host, api);
    /* applyI18n 結尾一律發 i18n:applied，宿主多半在那個事件上重算整頁（含再叫一次預覽）——
       畫的期間把 busy 舉起來，scheduler 收到的呼叫一律丟掉，否則會無限互相觸發（2026-10-28 實測建立商品整頁卡死）。 */
    busy = true;
    try {
      if (window.applyI18n) window.applyI18n(host);
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    } finally { setTimeout(function () { busy = false; }, 0); }
  }
  var busy = false;
  function scheduler(fn) {
    var raf = 0;
    return function () {
      if (raf || busy) return;
      raf = requestAnimationFrame(function () { raf = 0; fn(); });
    };
  }
  window.ztorFanPhone = { render: render, scheduler: scheduler };
})();
