/* ============================================================
   Ztor Creator Studio · R 2.1 — Scenario banner
   ------------------------------------------------------------
   把 Cheat Codes（devtools.js）的 Event Day 狀態接到活動頁，
   顯示一條情境提示橫幅。讀 window.ztorDevState（載入順序在
   devtools 之後）並監聽 `ztor:devstate-changed` 即時更新。

   2026-06-16：橫幅改用商店同款的 alert 元件（.alert--bar
   alert--warning .alert--page-top），與 e-shop 低庫存通知條共用
   同一份 ds-components/alert.css，並接 i18n（events.scenario.*）。
   貼頂滿版需掛在 .main 第一個子元素（.page 之外的全寬層）。
   × 關閉 = 隱藏目前狀態；切換 Event Day 狀態後再次出現。

   儀表板的無資料引導已由 hero（F1）與卡片空狀態承接，不再用
   橫幅（2026-06-14 移除 data 對應）。
   ============================================================ */
(function () {
  if (window.__ztorScenarioMounted) return;
  window.__ztorScenarioMounted = true;

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'events.html') return;   // 只有活動頁接情境橫幅

  /* state 值 → { i18n key 字根 k, 選配 cta:[labelKey, href] }。null = 不顯示。 */
  var STATES = {
    'pre-event':  { k: 'pre' },
    'live':       { k: 'live' },
    'post-event': { k: 'post' },
    'multi-event':{ k: 'multi' },
    'no-event':   null,
  };

  /* 兩層結構＝與 e-shop 低庫存通知條同款（.alert-inset 定位殼 ＋ .alert--inset-card 視覺卡，
     ds-components/alert.css）：收窄置中對齊內容欄、實色卡、無 icon、無警示色。
     2026-07-26 使用者裁示「活動的通知要用電子商店的通知」，取代原本的 alert--warning + alert--page-top 滿版版。 */
  var outer = document.createElement('div');
  outer.className = 'alert-inset when-data';
  outer.hidden = true;

  var banner = document.createElement('div');
  banner.className = 'alert alert--bar alert--inset-card';
  banner.setAttribute('role', 'status');
  outer.appendChild(banner);

  var dismissedState = null;   // 記住被 × 關閉的那個狀態；切到別的狀態就再顯示

  /* 掛載點：.main 第一個子元素（比照 e-shop 通知條，須在 .page 之外） */
  (function mount() {
    var main = document.querySelector('.main') || document.body;
    main.insertBefore(outer, main.firstChild);
  })();

  function curVal() {
    var s = (window.ztorDevState && window.ztorDevState.get()) || {};
    return s.eventDay || 'no-event';
  }
  function T(key) { return (window.i18nT && window.i18nT(key)) || key; }

  function render() {
    var state = curVal();
    var entry = STATES[state];
    if (!entry || dismissedState === state) { outer.hidden = true; return; }
    outer.hidden = false;

    var base = 'events.scenario.' + entry.k;
    banner.innerHTML =
        '<div class="alert__body">'
      +   '<span class="alert__title">' + T(base + '.title') + '</span>'
      +   '<span class="alert__meta">' + T(base + '.desc') + '</span>'
      + '</div>'
      + (entry.cta ? '<a class="alert__cta" href="' + entry.cta[1] + '">' + T(entry.cta[0]) + '</a>' : '')
      + '<button class="alert__dismiss" type="button" aria-label="' + T('events.scenario.dismiss') + '">×</button>';

    banner.querySelector('.alert__dismiss').addEventListener('click', function () {
      dismissedState = state;
      outer.hidden = true;
    });
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(banner);
  }

  render();
  document.addEventListener('ztor:devstate-changed', render);
  document.addEventListener('i18n:applied', render);
})();
