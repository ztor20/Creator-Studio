/* ============================================================
   linechart.js · 「一段時間的走勢」唯一的畫法（2026-08-31 抽成共用）

   起因：活動詳情的售票趨勢（chart-card ＋ linechart）在 2026-08-17 定案時，
   註解就寫著「站上『一段時間的走勢』從此只有一種畫法」——但那段畫法只長在
   event-detail.html 的一個函式裡。項目詳情的支持者走勢要長一樣的時候，
   面前只有兩條路：把那 50 行抄第二份，或抽成共用。抄第二份的代價是
   「改一邊會靜默弄壞另一邊」，這在本專案已經踩過好幾次，所以抽。

   這支只負責「數字 → SVG 路徑與刻度」，不碰資料怎麼來、不碰卡片外殼、
   不掛事件。呼叫端自己準備 markup（`.linechart.linechart--axes` 那一組，
   見 chart.css §Multi-series）與資料。

   ── 座標系（沿用 event-detail 2026-08-17 定下來的那組，不要改）──────
     viewBox 600 × 180；四條格線落在 y = 23 / 68 / 113 / 158。
     值 → y：0 落在 158、最大值落在 23（即 158 − v/max × 135）。
     面積圖收在 y = 180（畫布底），所以線與底之間才有實心。
     縱軸四個刻度用百分比定位（top 13 / 38 / 63 / 88%），與四條格線對齊。
   這組數字是硬編碼的視覺契約：改任何一個，兩個消費頁的圖會同時變形，
   而它們本來就該長一樣。要調整請連同 chart.css 的 `.linechart--axes` 一起想。

   ── 為什麼平滑（Catmull-Rom → 三次貝茲）───────────────────────────
   折線在 600px 寬、7–8 個點的尺度下看起來像鋸齒，讀者會把取樣的抖動當成
   真的起伏。平滑之後讀得出來的是趨勢，那才是這張圖要回答的問題。

   ── API ───────────────────────────────────────────────────────
     ZtorLinechart.path(values, max)      → 平滑後的 `d` 字串（不含面積）
     ZtorLinechart.areaPath(d)            → 把線的 d 封成面積的 d
     ZtorLinechart.gridHTML()             → 四條格線的 <line>
     ZtorLinechart.yTicksHTML(max, fmt)   → 縱軸四個刻度的 <span>
     ZtorLinechart.seriesHTML(list, max)  → 多條線（list 由後往前疊，
                                            第一條可帶 area）
   ============================================================ */
(function () {
  'use strict';

  var W = 600, TOP = 23, ZERO = 158, FLOOR = 180;
  var GRID = [23, 68, 113, 158];

  function xOf(i, n) { return n < 2 ? 0 : (i * W) / (n - 1); }
  function yOf(v, max) { return ZERO - (v / (max || 1)) * (ZERO - TOP); }

  /* Catmull-Rom 轉三次貝茲。端點各自複製一份當控制點的鄰居，
     線頭線尾才不會被拉出畫布。 */
  function path(values, max) {
    if (!values || !values.length) return '';
    var n = values.length;
    var pts = values.map(function (v, i) { return [xOf(i, n), yOf(v, max)]; });
    var d = 'M ' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C ' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) +
           ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) +
           ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }

  function areaPath(d) { return d ? d + ' L ' + W + ',' + FLOOR + ' L 0,' + FLOOR + ' Z' : ''; }

  function gridHTML() {
    return GRID.map(function (y) {
      return '<line class="linechart__grid" x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" />';
    }).join('');
  }

  /* 縱軸：最大值、三分之二、三分之一、0。fmt 由呼叫端給（千分位、貨幣…）。 */
  function yTicksHTML(max, fmt) {
    var f = fmt || function (v) { return String(v); };
    return [[13, max], [38, Math.round(max * 2 / 3)], [63, Math.round(max / 3)], [88, 0]]
      .map(function (pair) {
        return '<span class="linechart__y-tick" style="top:' + pair[0] + '%">' + f(pair[1]) + '</span>';
      }).join('');
  }

  /* list: [{ values, cls, area }]。cls 預設 s1；area 只給要填底的那一條
     （多條線都填底會互相蓋住，見 sparkline 那邊同樣的取捨）。 */
  function seriesHTML(list, max) {
    return (list || []).map(function (s) {
      var d = path(s.values, max);
      if (!d) return '';
      /* color：直接指定線色（2026-08-31）。s1…s7 那組是語意色（主色／成功／資訊…），
         但有些圖的線色必須跟同一張卡上的圖例對齊——例如「依方案拆分」那種，
         線與色點是同一個方案，色票要來自 --chart-N 而不是語意。兩種都留著：
         沒有 color 就走 s1…s7。 */
      var cls = 'linechart__line' + (s.color ? '' : ' linechart__line--' + (s.cls || 's1'));
      var style = s.color ? ' style="stroke:' + s.color + '"' : '';
      return (s.area ? '<path class="linechart__area" d="' + areaPath(d) + '" />' : '') +
        '<path class="' + cls + '"' + style + ' d="' + d + '" />';
    }).join('');
  }

  window.ZtorLinechart = {
    W: W, GRID: GRID,
    path: path, areaPath: areaPath,
    gridHTML: gridHTML, yTicksHTML: yTicksHTML, seriesHTML: seriesHTML
  };
})();
