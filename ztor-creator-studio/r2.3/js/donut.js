/* ============================================================
   donut.js · 「一個總數拆成幾塊」的圓環唯一的畫法（2026-09-01 抽成共用）

   起因與 linechart.js 那次一樣：`.donut-mix`（ds-components/donut-mix.css）的
   幾何原本只長在 `js/components.js` 的 `donutMix()` 裡，而 components.js 是
   展示版首頁那一整包（它會自動掛載頁面上的 `data-component`）。項目詳情的
   「方案統計」要畫同一種環時，面前只有兩條路：把那段弧長計算抄第二份，
   或抽成共用。抄第二份的代價是「改一邊會靜默弄壞另一邊」，所以抽。

   這支只負責「百分比 → SVG 弧」與環本體（含環心的總數），**不含圖例**——
   圖例的欄位每個消費情境都不一樣（展示版只要名稱＋百分比，方案統計還要
   售出與金額），由呼叫端自己組。

   ── 幾何契約（沿用 components.js 定下來的那組，不要單邊改）────────────
     viewBox 120 × 120、半徑 52、描邊寬 9、段間縫 8。
     `W` 必須與 donut-mix.css 的 `--donut-mix-thickness` 是同一個數字：
     段與段之間的縫要扣掉一整個描邊寬（圓端各吃半個），對不上就會看到
     縫忽寬忽窄。環從十二點鐘開始畫（旋轉 -90° 由 CSS 負責）。

   ⚠ 已知重複：`js/components.js` 的 `donutMix()` 仍是自己那一份同樣的計算。
   本檔建立時該檔正被另一個 session 編輯，沒有一併改；下一輪要把 donutMix()
   改成呼叫這裡的 `segsHTML()`，兩份才真的收斂成一份。

   ── API ───────────────────────────────────────────────────────
     ZtorDonut.segsHTML(rows)              → 各段的 <circle>（rows: {pct, color}）
     ZtorDonut.ringHTML(rows, total, unit) → 環本體（含底環與環心）
   ============================================================ */
(function () {
  'use strict';

  var R = 52, W = 9, GAP = 8, C = 2 * Math.PI * R;

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }

  /* rows: [{ pct, color }]。pct 是「佔總數的百分之幾」，呼叫端保證加起來 ≈ 100。 */
  function segsHTML(rows) {
    var off = 0;
    return (rows || []).map(function (r) {
      var len = C * (r.pct || 0) / 100;
      var draw = Math.max(len - GAP - W, 1);   /* 扣掉縫與兩個圓端 */
      var el = '<circle class="donut-mix__seg" cx="60" cy="60" r="' + R + '"' +
        ' style="--seg:' + (r.color || 'var(--chart-1)') + '"' +
        ' stroke-dasharray="' + draw.toFixed(2) + ' ' + (C - draw).toFixed(2) + '"' +
        ' stroke-dashoffset="' + (-(off + (GAP + W) / 2)).toFixed(2) + '"></circle>';
      off += len;
      return el;
    }).join('');
  }

  function ringHTML(rows, total, unit) {
    return '<div class="donut-mix__ringwrap">' +
      '<svg class="donut-mix__ring" viewBox="0 0 120 120" aria-hidden="true">' +
        '<circle class="donut-mix__track" cx="60" cy="60" r="' + R + '"></circle>' +
        segsHTML(rows) +
      '</svg>' +
      '<div class="donut-mix__center">' +
        '<span class="donut-mix__value">' + esc(total) + '</span>' +
        (unit ? '<span class="donut-mix__unit">' + esc(unit) + '</span>' : '') +
      '</div>' +
    '</div>';
  }

  window.ZtorDonut = { R: R, W: W, GAP: GAP, C: C, segsHTML: segsHTML, ringHTML: ringHTML };
})();
