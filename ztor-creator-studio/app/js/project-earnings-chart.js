/* ============================================================
   project-earnings-chart.js — 專案詳情「我的收益 › 收益走勢」的互動圖表

   使用者裁示 2026-07-28：「專案的收益折線圖也要有跟財務總覽同一套 tooltip
   與點擊看明細。」對照組是 earnings-sony.html 的 fin-chart（partials/finance-overview.js）。

   為什麼要先改成資料驅動：原本這張圖是四條寫死的 <path>，`d` 裡只有座標、
   沒有任何金額。沒有底層數值就做不出「滑過看到當期各類型金額」——tooltip 不是
   加一層 UI 就有，它要求圖表先知道自己畫的是什麼。所以這支腳本接管整張圖：
   資料 → 座標 → 路徑，順序反過來。

   與財務總覽的分工：
     財務總覽 = 跨全部專案、7 種收益類型、單位 NTD
     這裡     = 單一專案、4 種收益類型、單位 USD（與同頁的收益明細帳一致）
   兩者共用視覺語彙（ds-components/chart-tip.css）與互動語彙（滑過看數字、
   點線或點浮層列看明細），但資料與尺度各自獨立，不互相加總。

   資料為示意值，依專案 id 產生（同一個專案每次載入都一樣，不同專案不一樣）。
   ============================================================ */
(function () {
  'use strict';

  /* 四條線＝頁面上那排篩選 chip 的四種類型。顏色必須與 chip 的 --dot 一致，
     否則圖例對不上線——這是這張圖唯一的圖例。 */
  /* 2026-07-28：第一條線的名字依專案家族而定——歌曲／專輯沒有 OTT（線上影音）版稅，
     那是影視通路的收入，音樂端叫音樂版稅。資料鍵維持 'ott'（同一條線、同一份資料），
     只有顯示名稱換；家族由 <html data-project-family> 提供（project-detail 初始化時寫入）。 */
  function projectFamily() {
    return document.documentElement.getAttribute('data-project-family') || 'film';
  }
  function typeI18n(t) {
    if (t.key !== 'ott') return t.i18n;
    return projectFamily() === 'music' ? 'pd-earn.filter.music' : 'pd-earn.filter.ott';
  }
  var TYPES = [
    { key: 'ott',     i18n: 'pd-earn.filter.ott',     hue: 'var(--chart-5)' },
    { key: 'critic',  i18n: 'pd-earn.filter.critic',  hue: 'var(--chart-2)' },
    { key: 'advance', i18n: 'pd-earn.filter.advance', hue: 'var(--destructive)' },
    { key: 'license', i18n: 'pd-earn.filter.license', hue: 'var(--muted-foreground)' }
  ];

  /* 期間：桶數與每桶代表的時間長度。日／月／季／年各自是一份資料，
     不是同一份乘係數——不同尺度下該看到的形狀本來就不同。 */
  var PERIODS = {
    day:   { buckets: 14, step: 'day',     scale: 0.055 },
    month: { buckets: 12, step: 'month',   scale: 1 },
    q:     { buckets: 8,  step: 'quarter', scale: 3 },
    year:  { buckets: 5,  step: 'year',    scale: 12 }
  };

  var X0 = 24, X1 = 576, YTOP = 20, YBOT = 160;

  /* 決定性亂數：同一個 seed 永遠得到同一串值。用亂數而不是寫死，是為了讓不同專案
     的圖長得不一樣；用決定性版本而不是 Math.random，是為了讓同一個專案每次重畫、
     每次切期間再切回來，看到的都是同一張圖。 */
  function rng(seed) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return function () { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  }

  function T(key, fallback) {
    var s = window.i18nT ? window.i18nT(key) : null;
    return s == null ? (fallback || key) : s;
  }
  function usd(n) { return 'USD ' + Math.round(n).toLocaleString('en-US'); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── 資料 ────────────────────────────────────────────────
     每種類型有一個基準月額與一個成長率；OTT 是主要收益線（成長最快），
     授權最平（一次性合約按月攤提），預付金會有回沖所以允許往下走。 */
  var SHAPE = {
    ott:     { base: 320, growth: 0.135, noise: 0.06 },
    critic:  { base: 210, growth: 0.075, noise: 0.07 },
    advance: { base: 130, growth: 0.020, noise: 0.11 },
    license: { base: 105, growth: 0.008, noise: 0.05 }
  };

  function buildSeries(projectId, periodKey) {
    var p = PERIODS[periodKey] || PERIODS.month;
    var n = p.buckets;
    var out = { key: periodKey, labels: labelsFor(periodKey, n), series: {}, xs: [] };
    for (var i = 0; i < n; i++) out.xs.push(X0 + (X1 - X0) * (n === 1 ? 0 : i / (n - 1)));

    TYPES.forEach(function (t) {
      var s = SHAPE[t.key];
      var r = rng(projectId + ':' + t.key + ':' + periodKey);
      var arr = [];
      for (var i = 0; i < n; i++) {
        var trend = s.base * p.scale * Math.pow(1 + s.growth, i * (12 / n));
        var wobble = 1 + (r() - 0.5) * 2 * s.noise;
        arr.push(Math.max(0, trend * wobble));
      }
      out.series[t.key] = arr;
    });
    return out;
  }

  /* 桶的結束時間＝這一格代表的期間。tooltip 的日期就是它。
     「現在」跟全站唯一的時間錨（project-progress-store.js 的 TODAY_ISO＝2026-08-17）
     同一天（2026-08-19，盤查 A9／B7：原本這裡自帶 2026-06-30，同一頁三個「今天」互相
     矛盾）。progress store 在本檔之前載入，直接讀它；萬一拿不到才用後備常數——
     後備值必須與 TODAY_ISO 同步改。 */
  var PROG_TODAY = (window.ztorProjectProgress && window.ztorProjectProgress.today)
    ? window.ztorProjectProgress.today() : null;
  var NOW = PROG_TODAY
    ? new Date(Date.UTC(PROG_TODAY.getFullYear(), PROG_TODAY.getMonth(), PROG_TODAY.getDate()))
    : new Date(Date.UTC(2026, 7, 17));
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function labelsFor(periodKey, n) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(NOW.getTime());
      if (periodKey === 'day') { d.setUTCDate(d.getUTCDate() - i); out.push(MON[d.getUTCMonth()] + ' ' + d.getUTCDate()); }
      else if (periodKey === 'month') { d.setUTCMonth(d.getUTCMonth() - i); out.push(MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear()); }
      else if (periodKey === 'q') { d.setUTCMonth(d.getUTCMonth() - i * 3); out.push(d.getUTCFullYear() + ' Q' + (Math.floor(d.getUTCMonth() / 3) + 1)); }
      else { d.setUTCFullYear(d.getUTCFullYear() - i); out.push(String(d.getUTCFullYear())); }
    }
    return out;
  }

  /* ── 繪製 ──────────────────────────────────────────────── */

  function niceTicks(max) {
    /* 刻度要落在「人看得懂的數字」上（1/2/5 的倍數），不是把 max 除以 4。 */
    var raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    var step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; })
      .find(function (s) { return s >= raw; }) || mag * 10;
    var top = Math.ceil(max / step) * step, out = [];
    for (var v = top; v >= 0; v -= step) out.push(v);
    return out;
  }

  function pathFor(view, key, close) {
    var ys = view.series[key], d = '';
    for (var i = 0; i < ys.length; i++) {
      d += (i ? ' L ' : 'M ') + view.xs[i].toFixed(1) + ',' + yOf(view, ys[i]).toFixed(1);
    }
    if (close) d += ' L ' + X1 + ',' + YBOT + ' L ' + X0 + ',' + YBOT + ' Z';
    return d;
  }
  function yOf(view, v) { return YBOT - (v / view.max) * (YBOT - YTOP); }

  function render(root, state) {
    var view = buildSeries(state.id, state.period);
    var max = 0;
    TYPES.forEach(function (t) { view.series[t.key].forEach(function (v) { if (v > max) max = v; }); });
    var ticks = niceTicks(max);
    view.max = ticks[0] || 1;
    state.view = view;

    var yAxis = root.querySelector('.linechart__y-axis');
    var plot = root.querySelector('.linechart__main');
    if (!yAxis || !plot) return;

    yAxis.innerHTML = ticks.map(function (v) {
      var top = ((yOf(view, v) - YTOP) / (YBOT - YTOP)) * 100;
      /* 刻度是絕對定位在 y 軸上的，百分比要換算回容器高度：YTOP..YBOT 對應 0..100% 之外
         還要留出線寬，故上下各夾 2%。 */
      return '<span class="linechart__y-tick" style="top:' + Math.max(0, Math.min(96, top * 0.78 + 8)).toFixed(1) + '%">'
        + Math.round(v).toLocaleString('en-US') + '</span>';
    }).join('');

    var svg = '<svg class="linechart__svg" viewBox="0 0 600 180" preserveAspectRatio="none" role="img"'
      + ' aria-label="' + esc(T('pd-earn.trend.title', 'Revenue trend')) + '">';
    ticks.forEach(function (v) {
      var y = yOf(view, v).toFixed(1);
      svg += '<line class="linechart__grid" x1="0" y1="' + y + '" x2="600" y2="' + y + '"/>';
    });
    /* 面積（只在聚焦時顯示）→ 線 → 熱區，順序即疊層順序：熱區必須在最上面才點得到。 */
    TYPES.forEach(function (t) {
      svg += '<path class="fin-area" data-earn-line="' + t.key + '" style="--hue:' + t.hue + '" d="' + pathFor(view, t.key, true) + '"/>';
    });
    TYPES.forEach(function (t) {
      svg += '<path class="linechart__line" data-earn-line="' + t.key + '"'
          + ' style="stroke:' + t.hue + ';stroke-width:2;fill:none" d="' + pathFor(view, t.key) + '"/>';
    });
    svg += '<line class="fin-guide" data-earn-guide x1="0" y1="' + YTOP + '" x2="0" y2="' + YBOT + '" style="display:none"/>';
    svg += '<g data-earn-markers></g>';
    TYPES.forEach(function (t) {
      svg += '<path class="fin-hitline" data-earn-line="' + t.key + '" data-earn-open="' + t.key + '" d="' + pathFor(view, t.key) + '"/>';
    });
    svg += '</svg>';

    plot.setAttribute('data-fin-plot', '');
    plot.innerHTML = svg + '<div class="fin-tip" data-earn-tip hidden></div>';
    applyFocus(root, state);
  }

  function applyFocus(root, state) {
    var chart = root;
    chart.querySelectorAll('[data-earn-line]').forEach(function (el) { el.classList.remove('is-focus'); });
    if (!state.type || state.type === 'all') { chart.removeAttribute('data-focus'); return; }
    chart.setAttribute('data-focus', state.type);
    chart.querySelectorAll('[data-earn-line="' + state.type + '"]').forEach(function (el) { el.classList.add('is-focus'); });
  }

  /* ── 滑過 ──────────────────────────────────────────────── */

  function visibleTypes(state) {
    return (!state.type || state.type === 'all') ? TYPES : TYPES.filter(function (t) { return t.key === state.type; });
  }

  function showTip(root, state, idx) {
    var view = state.view;
    if (!view) return;
    var plot = root.querySelector('.linechart__main');
    var tip = root.querySelector('[data-earn-tip]');
    var svg = root.querySelector('.linechart__svg');
    if (!plot || !tip || !svg) return;

    var types = visibleTypes(state);
    var html = '<div class="fin-tip__date">' + esc(view.labels[idx]) + '</div>';
    types.forEach(function (t) {
      html += '<button type="button" class="fin-tip__row" data-earn-open="' + t.key + '">'
        + '<span class="fin-dot" style="--dot:' + t.hue + '"></span>'
        + '<span>' + esc(T(typeI18n(t))) + '</span>'
        + '<span class="fin-tip__amt">' + usd(view.series[t.key][idx]) + '</span></button>';
    });
    html += '<div class="fin-tip__hint">' + esc(T('pd-earn.tip.hint', 'Click a row for the breakdown')) + '</div>';
    tip.innerHTML = html;
    tip.hidden = false;

    var guide = svg.querySelector('[data-earn-guide]');
    if (guide) { guide.setAttribute('x1', view.xs[idx]); guide.setAttribute('x2', view.xs[idx]); guide.style.display = ''; }
    /* 標記點：只畫目前可見的類型，讓「浮層那幾個數字對應圖上哪幾個點」不必用猜的。
       r 用 non-scaling-stroke 無效（那是描邊用的），所以改畫成小圓＋白邊，
       在 preserveAspectRatio="none" 的橫向拉伸下會變成橢圓——可接受，它只是指示物。 */
    var g = svg.querySelector('[data-earn-markers]');
    if (g) {
      g.innerHTML = types.map(function (t) {
        return '<circle class="fin-marker" cx="' + view.xs[idx].toFixed(1) + '" cy="'
          + yOf(view, view.series[t.key][idx]).toFixed(1) + '" r="3" fill="' + t.hue
          + '" stroke="var(--card)" stroke-width="1.5"/>';
      }).join('');
    }

    /* viewBox 是 preserveAspectRatio="none"，橫向被拉伸，所以位置要用實際像素換算，
       不能直接把 viewBox 座標當螢幕座標用。 */
    var box = plot.getBoundingClientRect();
    var px = ((view.xs[idx] - X0) / (X1 - X0)) * box.width;
    var tw = tip.offsetWidth, left = px + 14;
    if (left + tw > box.width) left = px - tw - 14;
    if (left < 0) left = 0;
    tip.style.left = Math.round(left) + 'px';
    var th = tip.offsetHeight, top = 8;
    if (top + th > box.height) top = Math.max(0, box.height - th);
    tip.style.top = Math.round(top) + 'px';
  }

  function hideTip(root) {
    var tip = root.querySelector('[data-earn-tip]');
    if (tip) tip.hidden = true;
    var guide = root.querySelector('[data-earn-guide]');
    if (guide) guide.style.display = 'none';
    var g = root.querySelector('[data-earn-markers]');
    if (g) g.innerHTML = '';
  }

  /* ── 明細 ──────────────────────────────────────────────── */

  /* 每種收益類型拆成不同的維度，因為它們的錢本來就從不同的地方來：
       OTT 版稅   → 哪個平台播的（依專案家族給影視或音樂平台）
       影評人佣金 → 哪位影評人帶來的
       影評人預付 → 付給哪位影評人
       授權收益   → 授權給誰、哪個地區
     用「這筆錢是誰給的」當維度，明細才回答得了「要再多賺就去找誰」。 */
  var TASTEMAKERS = ['Aria Lam', 'Kenji Watanabe', 'Priya Nair', 'Marco Bellini', 'Sofia Reyes',
                 'Daniel Okafor', 'Hana Kim', 'Tomas Vidal'];
  var LICENSEES = ['Yiu Pictures · Taiwan', 'Dragon Tiger Gate key art Media · Hong Kong', 'Kanata Films · Japan',
                   'Northbound · Singapore', 'Rojak Pictures · Malaysia', 'Halcyon · Worldwide'];

  function platformsFor() {
    var perf = window.ztorPerformance && window.ztorPerformance.data;
    var fam = document.querySelector('[data-perf="panel"]');
    fam = fam && fam.getAttribute('data-perf-family');
    var list = perf && perf[fam === 'music' ? 'music' : 'film'];
    if (!list) return ['Ztor', 'YouTube', 'Netflix', 'Disney+', 'Prime Video'];
    /* 沿用表現分頁那份平台名單：同一個專案在兩個分頁看到的平台必須是同一組，
       不然創作者會問「為什麼收益裡有 KKBOX，表現裡沒有」。 */
    return list.platforms.map(function (p) {
      return p.name || (p.i18n ? T(p.i18n) : '');
    }).filter(Boolean);
  }

  /* 依權重把總額拆成整數且加總精確等於總額（逐列四捨五入會湊不回去）。 */
  function splitExact(total, weights) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    var out = weights.map(function (w) { return Math.floor(total * w / sum); });
    var rest = Math.round(total) - out.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; rest > 0; i = (i + 1) % out.length, rest--) out[i]++;
    return out;
  }

  function rowsFor(state, type) {
    var total = state.view.series[type].reduce(function (a, b) { return a + b; }, 0);
    var names = type === 'ott' ? platformsFor()
              : type === 'license' ? LICENSEES
              : TASTEMAKERS;
    var r = rng(state.id + ':detail:' + type);
    var w = names.map(function () { return 0.25 + r(); });
    var amts = splitExact(total, w);
    return names.map(function (n, i) { return { name: n, amount: amts[i] }; })
                .sort(function (a, b) { return b.amount - a.amount; });
  }

  function openDetail(state, type) {
    var modal = document.getElementById('pd-earn-detail');
    if (!modal || !state.view) return;
    var t = TYPES.find(function (x) { return x.key === type; }) || TYPES[0];
    var rows = rowsFor(state, type);
    var total = rows.reduce(function (a, b) { return a + b.amount; }, 0);
    var tenths = splitExact(1000, rows.map(function (r) { return r.amount; }));
    var dimKey = type === 'ott' ? 'pd-earn.detail.platform'
               : type === 'license' ? 'pd-earn.detail.licensee'
               : 'pd-earn.detail.tastemaker';

    modal.querySelector('[data-earn-detail-title]').textContent = T(typeI18n(t));
    modal.querySelector('[data-earn-detail-body]').innerHTML =
      '<div class="fin-detail__head"><span class="fin-dot" style="--dot:' + t.hue + '"></span>'
      + '<span class="fin-detail__total">' + usd(total) + '</span></div>'
      + '<div class="fin-detail__scope">' + esc(T('pd-earn.detail.scope', 'This project only · current chart range')) + '</div>'
      + '<div class="table-wrap"><table class="ztor-table"><thead><tr>'
      + '<th class="fin-detail__rank">#</th><th>' + esc(T(dimKey)) + '</th>'
      + '<th class="fin-amt">' + esc(T('pd-earn.detail.amount', 'Amount')) + '</th>'
      + '<th class="fin-detail__share">' + esc(T('pd-earn.detail.share', 'Share')) + '</th>'
      + '</tr></thead><tbody>'
      + rows.map(function (row, i) {
          return '<tr class="ztor-table__row"><td class="fin-detail__rank">' + (i + 1) + '</td>'
            + '<td>' + esc(row.name) + '</td>'
            + '<td class="fin-amt">' + usd(row.amount) + '</td>'
            + '<td class="fin-detail__share">' + (tenths[i] / 10).toFixed(1) + '%</td></tr>';
        }).join('')
      + '</tbody></table></div>';
    modal.hidden = false;
  }

  /* ── 掛載 ──────────────────────────────────────────────── */

  function init() {
    var root = document.querySelector('[data-earn-chart]');
    if (!root) return;
    var project = (window.ztorProjects && (window.ztorProjects.get(new URLSearchParams(location.search).get('id')) || window.ztorProjects.first())) || null;
    var state = { id: project ? project.id : 'demo', period: 'month', type: 'all', view: null };

    render(root, state);

    var plot = root.querySelector('.linechart__main');
    root.addEventListener('mousemove', function (e) {
      if (!state.view) return;
      /* 游標已經移到浮層上就凍結：再重算會讓浮層在腳下換位置，列就點不到了。 */
      if (e.target.closest && e.target.closest('[data-earn-tip]')) return;
      var p = root.querySelector('.linechart__main');
      if (!p) return;
      var box = p.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right) return;
      var ratio = (e.clientX - box.left) / (box.width || 1);
      var n = state.view.labels.length;
      var idx = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
      showTip(root, state, idx);
    });
    root.addEventListener('mouseleave', function () { hideTip(root); });

    /* 點線或點浮層列 → 開該類型的明細 */
    document.addEventListener('click', function (e) {
      var hit = e.target.closest && e.target.closest('[data-earn-open]');
      if (!hit) return;
      hideTip(root);
      openDetail(state, hit.getAttribute('data-earn-open'));
    });

    /* 期間切換：重畫整張圖（頁內原本只切 active 樣式，資料不動）。 */
    var period = document.querySelector('[data-earn-period]');
    if (period) period.addEventListener('click', function (e) {
      var b = e.target.closest('.segmented__btn');
      if (!b) return;
      var keys = ['day', 'month', 'q', 'year'];
      var i = Array.prototype.indexOf.call(period.querySelectorAll('.segmented__btn'), b);
      state.period = keys[i] || 'month';
      hideTip(root);
      render(root, state);
    });

    /* 類型 chip：聚焦單一條線（其餘淡出且不可點）。頁內原本的 handler 仍負責
       active 樣式與「深度明細」的顯示，這裡只加聚焦，不接管它。 */
    var filter = document.querySelector('[data-earn-filter]');
    if (filter) filter.addEventListener('click', function (e) {
      var b = e.target.closest('.filter-tabs__item');
      if (!b) return;
      state.type = b.getAttribute('data-earn-series') || 'all';
      hideTip(root);
      applyFocus(root, state);
    });

    /* 換語言之後浮層與明細裡的類型名要跟著換——重畫最省事，圖是決定性的，重畫不會變樣。 */
    document.addEventListener('ztor:lang-changed', function () { render(root, state); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
