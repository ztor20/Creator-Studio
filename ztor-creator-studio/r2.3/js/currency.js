/* ============================================================
   currency.js — 幣別的兩個常數與換算（2026-09-23，D316；主規格 §7.15）

   D316 把站上三個彼此不收斂的幣別概念（帳號預設幣別／商店幣別／手動補登收入的幣別）
   收成**一個**「創作者幣別」，同時把 Admin 側的營運金額欄改以「平台基準幣別」記錄。
   這支就是這兩個名詞在原型裡的單一來源，四個宿主頁一起讀它：

     · settings.html          創作者幣別（唯讀顯示）
     · store-settings.html    同一個值（此頁不再有自己的幣別清單）
     · admin-platform-fees.html        支付費每筆固定額＝平台基準幣別
     · admin-platform-promotions.html  滿額折扣門檻金額＝平台基準幣別

   ── 兩個常數 ────────────────────────────────────────────────
   · CREATOR＝這位創作者的幣別。一位創作者只有一個，建立帳號時設定，之後創作者與
     Admin 都不能改（D316；日後是否開放代改屬產品待確認）。示範值 'TWD'——與
     js/events-store.js 的 DEFAULT_CURRENCY 同一個值（那裡的註解已寫明它是
     「示範資料的創作者預設幣別」），兩邊不得各說各話。
   · BASE＝平台基準幣別，平台自己的營運記帳幣別，預設 'HKD'，與任何一位創作者無關。
     站上**不存在「全站幣別」**這個概念（D316 裁決 B）。

   ── 匯率從哪來 ──────────────────────────────────────────────
   不自帶第二張匯率表：換算一律委派 js/events-store.js 既有的 `fx()`／`fmtMoney()`
   （固定示範匯率 FX_PER_USD，ASSUMPTIONS PG-035），宿主頁要先載入 events-store.js。
   真實匯率來源、時點與進位方式上游待確認（主規格 §8.28），所以 AS_OF 是**寫死的示範
   時點**，只為了讓畫面示範「換算後金額要標匯率時點」這件事（ASSUMPTIONS UIA-173）。
   ============================================================ */
(function () {
  'use strict';

  var CREATOR = 'TWD';
  var BASE    = 'HKD';
  var AS_OF   = '2026-09-23 09:00 GMT+8';

  function store() { return window.ztorEvents || null; }
  function T(key, fb) { return (window.i18nT && window.i18nT(key)) || fb || key; }

  /* 換算與格式化：有 events-store 就走它，沒有就退成「原數字」——不在這裡放第二張匯率表。 */
  function fx(from, to, amount) {
    var s = store();
    return s ? s.fx(from, to, amount) : Math.round(Number(amount) || 0);
  }
  function fmt(cur, amount) {
    var s = store();
    if (s) return s.fmtMoney(cur, amount);
    return cur + ' ' + (Math.round(Number(amount) || 0)).toLocaleString('en-US');
  }
  /* 平台基準幣別的金額 → 這位創作者的幣別。小數的固定額（HK$2.40）保留兩位，
     不然 2.40 會被 events-store 的 fx() 直接四捨五入成 2。 */
  function toCreator(amount) {
    var a = Number(amount) || 0;
    if (CREATOR === BASE) return a;
    return fx(BASE, CREATOR, a * 100) / 100;
  }
  /* 「TWD · 新台幣」：代碼先讀，全名在後（代碼是站上到處都在用的那一串）。 */
  function label(cur) {
    var c = cur || CREATOR;
    return c + ' · ' + T('currency.name.' + c, c);
  }
  /* 幣別符號：events-store 的 SYMBOL 是站上唯一那份，沒載到就退成代碼加空白。 */
  function symbol(cur) {
    var s = store();
    return (s && s.SYMBOL && s.SYMBOL[cur]) || (cur + ' ');
  }
  /* 有小數就留兩位（HK$2.40 這種每筆固定額），整數就不補 .00。 */
  function money(cur, amount) {
    var a = Number(amount) || 0;
    return symbol(cur) + (a % 1
      ? a.toFixed(2).replace(/\B(?=(\d{3})+(?!\d)\.)/g, ',')
      : a.toLocaleString('en-US'));
  }
  /* 「HK$2.40 ≈ NT$9.45 · 匯率 2026-09-23 09:00 GMT+8」：Admin 的營運金額欄共用這一句。 */
  function baseWithConversion(amount) {
    var a = Number(amount) || 0;
    return money(BASE, a) + ' ≈ ' + money(CREATOR, toCreator(a)) +
      ' · ' + T('currency.fx.asof', 'Rate as of {t}').replace('{t}', AS_OF);
  }

  /* 三個掛勾，宿主頁只擺空節點、字由這裡填，四頁因此永遠是同一份事實：
       [data-currency-readout]      創作者幣別的讀數（值可傳幣別代碼，預設＝創作者幣別）
       [data-currency-base-symbol]  平台基準幣別的符號，掛在 Admin 金額欄的前綴上
       [data-currency-fx-for="id"]  該輸入框的金額換算成創作者幣別＋匯率時點，跟著輸入即時更新 */
  function fxOutText(amount) {
    return '≈ ' + money(CREATOR, toCreator(amount)) +
      ' · ' + T('currency.fx.asof', 'Rate as of {t}').replace('{t}', AS_OF);
  }
  var wired = [];
  function paint(scope) {
    var root = scope || document;
    root.querySelectorAll('[data-currency-readout]').forEach(function (el) {
      el.textContent = label(el.getAttribute('data-currency-readout') || CREATOR);
    });
    root.querySelectorAll('[data-currency-base-symbol]').forEach(function (el) {
      el.textContent = symbol(BASE);
    });
    root.querySelectorAll('[data-currency-fx-for]').forEach(function (el) {
      var src = document.getElementById(el.getAttribute('data-currency-fx-for'));
      if (!src) return;
      if (wired.indexOf(el) < 0) {
        wired.push(el);
        src.addEventListener('input', function () { el.textContent = fxOutText(src.value); });
      }
      el.textContent = fxOutText(src.value);
    });
    /* 幣別金額說明句裡的 {cur} 佔位（2026-09-23 D316b，主規格 §7.15）：跟 fxOutText／
       baseWithConversion 同一招，直接呼叫 T() 取 i18n 模板再代入 CREATOR，不依賴
       data-i18n 先跑過（兩邊都吃 i18n:applied，順序不保證）。目前只有 settings.html
       「最低提款金額」說明這一格在用，見 ASSUMPTIONS UIA-173。 */
    root.querySelectorAll('[data-currency-hint]').forEach(function (el) {
      var key = el.getAttribute('data-currency-hint');
      el.textContent = T(key, el.textContent).replace('{cur}', CREATOR);
    });
  }

  window.ztorCurrency = {
    CREATOR: CREATOR,
    BASE: BASE,
    AS_OF: AS_OF,
    fx: fx,
    fmt: fmt,
    toCreator: toCreator,
    symbol: symbol,
    money: money,
    label: label,
    baseWithConversion: baseWithConversion,
    fxOutText: fxOutText,
    paint: paint
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { paint(); });
  } else {
    paint();
  }
  /* 語言一換，讀數裡的幣別全名與「匯率時點」那句要跟著換。 */
  document.addEventListener('i18n:applied', function () { paint(); });
})();
