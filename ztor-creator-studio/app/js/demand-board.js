/* demand-board.js · 需求看板的畫面（2026-10-05 · D360 · S68，規格 documents/5.1.5.16-需求看板.md）
   ------------------------------------------------------------------
   兩段：
     1. window.ztorDemandView — 可重用的 renderer（摘要指標、市場需求表、選定對象面板、資料來源說明）。
        需求看板頁與第 3 波「商品細節頁的商品層需求數據彈窗」共用同一份，數字一律取 window.ztorDemand，
        本檔不寫資料、不寫算法（算法唯一定義處：主規格 §7.17，落地在 js/demand-store.js）。
     2. 頁面接線（只在有 [data-demand-board] 的頁面跑）：F2 篩選、頁面狀態示範開關。

   載入順序：js/apparel-taxonomy.js → js/demand-store.js → js/i18n.js → js/row-disclosure.js → 本檔。

   ── 對外 API ────────────────────────────────────────────────────
   ztorDemandView.create(root, cfg) → view
     root   容器；裡面放下列插槽（缺哪個就不畫哪個，彈窗可以只放要的）：
              [data-dv="summary"]  F3 前三項摘要（.bento 三張 .kpi）
              [data-dv="banner"]   前台國家資料未上線時的說明條（.info-banner）
              [data-dv="main"]     F4 本體（市場需求表＋選定對象面板）；無資料時藏起來
              [data-dv="table"]    市場需求表（.demand-table__bar ＋ .product-list--demand）
              [data-dv="focus"]    選定對象面板（.card.demand-focus）
              [data-dv="empty"]    無資料空狀態（.card > .empty-card）
              [data-dv="note"]     F5 資料來源說明一行
     cfg    { filter: () => filter 物件            看板：F2 的篩選（給 ztorDemand.markets）
             productId: 'tee'                     商品層彈窗：改用 ztorDemand.productSlice(productId)，
                                                   計畫生產量與看板選同一商品時共用（同一個 scopeKey）
             demo: () => null|'empty'|'no-region'  頁面狀態示範（見下方「頁面狀態」）
             idPrefix: 'dv'                       展開城市的 data-rowdis 前綴（同頁掛兩個 view 時要不同） }
     view.render()            重畫（篩選變了、換語言、換狀態時呼叫）
     view.state               { focus: 市場 key|null, focusSize: 尺寸|null, mode: 'share'|'qty' }
     view.result()            目前的 ztorDemand 結果物件

   ztorDemandView.sizeMixHTML(sizes, sizeRows, { mode, labeled })   各尺寸占比的一排（size-mix.css）
   ztorDemandView.sizeMixHeadHTML(sizes)                             與上面同格寬的表頭
   ztorDemandView.gapHTML(gap)                                       差距（建議多於計畫時加強提示）
   ztorDemandView.marketName(row)                                    市場名（國家／城市／未提供地區，跟著語言）

   ── 頁面狀態（規格「頁面狀態」三種）────────────────────────────────
   有資料＝照示範資料；無資料＝ ?state=empty 或 Cheat Codes 的 Empty（html[data-data-state="empty"]）；
   前台國家資料未上線＝ ?state=no-region。empty 不需要資料，本檔直接畫空狀態；no-region 把
   { demo:'no-region' } 交給 ztorDemand（資料層的示範切換，見 ASSUMPTIONS 待補條目）。 */
(function () {
  'use strict';

  var D = window.ztorDemand;
  var A = window.ztorApparel;
  if (!D) return;

  /* ── 小工具 ─────────────────────────────────────────────────── */
  function lang() { return String(document.documentElement.lang || 'en').indexOf('zh') === 0 ? 'zh' : 'en'; }
  function T(key, fb, vars) {
    var v = window.i18nT ? window.i18nT(key) : null;
    if (v == null) v = fb;
    if (vars) v = String(v).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return v;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(n) { return Number(n).toLocaleString(lang() === 'zh' ? 'zh-TW' : 'en-US'); }
  function pct(x) { return Math.round(x * 100) + '%'; }
  var DASH = '—';

  function sizeLabel(s) { return s === D.OTHER_SIZE ? T('demand.size.other', 'Other sizes') : s; }
  function marketName(row) {
    if (!row || !row.country) return T('demand.market.unspec', 'Unspecified region');
    return row.level === 'city' ? row.city : D.countryName(row.country, lang());
  }
  function marketFullName(row) {
    if (!row) return '';
    if (row.level === 'city') return D.countryName(row.country, lang()) + ' · ' + row.city;
    return marketName(row);
  }
  function refLabel(ref) { return A ? A.label(ref.key, lang()) : (ref.label || ref.key); }

  /* ── 可重用片段 ─────────────────────────────────────────────── */
  function sizeMixHTML(sizes, sizeRows, opts) {
    opts = opts || {};
    var byKey = {};
    (sizeRows || []).forEach(function (r) { byKey[r.size] = r; });
    var max = 0;
    sizes.forEach(function (s) { var r = byKey[s]; if (r && r.share > max) max = r.share; });
    var slots = sizes.map(function (s) {
      var r = byKey[s];
      var has = r && r.share > 0;
      var val = !has ? DASH : (opts.mode === 'qty' ? (r.suggested == null ? DASH : num(r.suggested)) : pct(r.share));
      var cls = 'size-mix__slot' + (!has ? ' size-mix__slot--none' : (r.share === max ? ' size-mix__slot--peak' : ''));
      var title = sizeLabel(s) + ' · ' + (has ? pct(r.share) : DASH);
      return '<span class="' + cls + '" title="' + esc(title) + '">' +
        '<span class="size-mix__bar"><span class="size-mix__fill" style="--share:' + (has && max ? (r.share / max).toFixed(3) : 0) + '"></span></span>' +
        '<span class="size-mix__val">' + esc(val) + '</span>' +
        (opts.labeled ? '<span class="size-mix__label">' + esc(sizeLabel(s)) + '</span>' : '') +
      '</span>';
    }).join('');
    return '<span class="size-mix' + (opts.labeled ? ' size-mix--labeled' : '') + '" style="--size-mix-n:' + sizes.length + '">' + slots + '</span>';
  }
  function sizeMixHeadHTML(sizes) {
    return '<span class="size-mix size-mix--head" style="--size-mix-n:' + sizes.length + '">' +
      sizes.map(function (s) {
        /* 表頭格只有 40px：其他尺寸用短名，全名放 title */
        var short = s === D.OTHER_SIZE ? T('demand.size.other-short', 'Other') : s;
        return '<span class="size-mix__label" title="' + esc(sizeLabel(s)) + '">' + esc(short) + '</span>';
      }).join('') +
    '</span>';
  }
  function gapHTML(gap) {
    if (gap == null) return '<span class="demand-gap">' + DASH + '</span>';
    var p = Math.round(gap * 100);
    if (p > 0) return '<span class="badge badge--warning">+' + p + '%</span>';
    return '<span class="demand-gap">' + (p < 0 ? '−' + Math.abs(p) : '0') + '%</span>';
  }
  function statusHTML(row) {
    if (row.status === 'reference' && row.reference) {
      return '<span class="badge badge--info">' + esc(T('demand.status.reference', 'Similar products: {name}', { name: refLabel(row.reference) })) + '</span>';
    }
    if (row.status === 'insufficient') {
      return '<span class="badge badge--neutral">' + esc(T('demand.status.insufficient', 'Not enough data')) + '</span>';
    }
    return '';
  }

  /* ── view ───────────────────────────────────────────────────── */
  function create(root, cfg) {
    cfg = cfg || {};
    var pre = cfg.idPrefix || 'dv';
    var state = { focus: null, focusSize: null, mode: 'share' };
    var last = null;

    function slot(name) { return root.querySelector('[data-dv="' + name + '"]'); }
    function demo() { return cfg.demo ? cfg.demo() : null; }
    function compute() {
      var d = demo();
      if (d === 'empty') return null;
      var opts = d ? { demo: d } : undefined;
      if (cfg.productId) return D.productSlice(cfg.productId, opts);
      return D.markets(cfg.filter ? cfg.filter() : {}, opts);
    }
    /* 計畫生產量要寫回「同一個篩選範圍」：看板用 F2 的 filter；彈窗用 productSlice 的口徑
       （該商品自己的 persona），與看板在同一 persona 下選同一商品時是同一個 scopeKey。 */
    var slicePersona = cfg.productId ? (cfg.persona || personaOf(cfg.productId)) : undefined;
    function scopeFilter() {
      if (cfg.productId) return { productId: cfg.productId, persona: slicePersona };
      return cfg.filter ? cfg.filter() : {};
    }

    function findRow(res, key) {
      if (!res || !key) return null;
      for (var i = 0; i < res.rows.length; i++) {
        if (res.rows[i].key === key) return res.rows[i];
        for (var j = 0; j < res.rows[i].cities.length; j++) if (res.rows[i].cities[j].key === key) return res.rows[i].cities[j];
      }
      return null;
    }

    /* F3 前三項 */
    function renderSummary(res) {
      var el = slot('summary');
      if (!el) return;
      if (!res || res.state === 'empty') { el.hidden = true; el.innerHTML = ''; return; }
      el.hidden = false;
      var s = res.summary;
      var unspecN = Math.round(s.total * s.unspecifiedShare);
      el.innerHTML =
        '<div class="kpi bento--span-4"><div class="kpi__label">' + esc(T('demand.kpi.total', 'Total demand')) + '</div>' +
          '<div class="kpi__value">' + num(s.total) + '<span class="kpi__unit">' + esc(T('demand.unit.pcs', 'pcs')) + '</span></div>' +
          '<div class="kpi__meta">' + esc(T('demand.kpi.total.meta', 'Last {n} days', { n: res.params.periodDays })) + '</div></div>' +
        '<div class="kpi bento--span-4"><div class="kpi__label">' + esc(T('demand.kpi.markets', 'Markets covered')) + '</div>' +
          '<div class="kpi__value">' + num(s.marketCount) + '</div>' +
          '<div class="kpi__meta">' + esc(T('demand.kpi.markets.meta', 'Counted by country')) + '</div></div>' +
        '<div class="kpi bento--span-4"><div class="kpi__label">' + esc(T('demand.kpi.unspec', 'Unspecified region share')) + '</div>' +
          '<div class="kpi__value">' + pct(s.unspecifiedShare) + '</div>' +
          '<div class="kpi__meta">' + esc(T('demand.kpi.unspec.meta', '{n} pcs without a country', { n: num(unspecN) })) + '</div></div>';
    }

    function renderBanner(res) {
      var el = slot('banner');
      if (!el) return;
      var on = !!res && res.state === 'no-region';
      el.hidden = !on;
      if (on) el.innerHTML = '<i data-lucide="info" class="ztor-icon info-banner__icon"></i><span>' + esc(T('demand.banner.noregion', 'Checkout doesn’t collect country and city yet, so all demand sits under Unspecified region. Market comparisons appear once it does.')) + '</span>';
    }

    function plannedInput(key, size, value, name) {
      var aria = T('demand.planned.aria', 'Planned quantity for {name}', { name: name });
      return '<input class="input demand-planned" type="number" min="0" step="1" inputmode="numeric" placeholder="' + DASH + '"' +
        ' data-dv-plan="' + esc(key) + '"' + (size != null ? ' data-dv-plan-size="' + esc(size) + '"' : '') +
        ' value="' + (value == null ? '' : esc(value)) + '" aria-label="' + esc(aria) + '">';
    }

    function marketRowHTML(row, sizes, opts) {
      var unspec = !row.country;
      var isFocus = !unspec && state.focus === row.key;
      var cls = 'product-list__row' + (opts.city ? ' rowdis__child' : (opts.gid ? ' rowdis__head' : '')) +
        (isFocus ? ' demand-row--focus' : '') + (unspec ? ' demand-row--unspec' : '');
      var attrs = ' role="row" data-dv-market="' + esc(row.key) + '"' +
        (unspec ? '' : ' tabindex="0" aria-selected="' + (isFocus ? 'true' : 'false') + '"') +
        (opts.city ? ' data-rowdis-child="' + esc(opts.gid) + '"' + (opts.open ? '' : ' hidden') : '');
      var lead = opts.city
        ? '<span class="rowdis__num">' + opts.n + '</span>'
        : (opts.gid
          ? '<button class="btn btn--icon btn--xs rowdis__toggle" type="button" data-rowdis="' + esc(opts.gid) + '" aria-expanded="' + (opts.open ? 'true' : 'false') + '"' +
              ' aria-label="' + esc(T('demand.toggle.cities', 'Show cities')) + '" title="' + esc(T('demand.toggle.cities', 'Show cities')) + '"><i data-lucide="chevron-down" class="ztor-icon"></i></button>'
          : '');
      var note = statusHTML(row);
      var index = row.index == null
        ? '<span class="demand-index demand-index--none">' + DASH + '</span>'
        : '<span class="demand-index"><span class="demand-index__num">' + row.index + '</span><span class="stock-bar" aria-hidden="true"><span class="stock-bar__fill" style="width:' + row.index + '%"></span></span></span>';
      var sug = row.suggestedTotal == null ? '<span class="demand-num demand-num--none">' + DASH + '</span>' : '<span class="demand-num">' + num(row.suggestedTotal) + '</span>';
      return '<div class="' + cls + '"' + attrs + '>' +
        '<div class="rowdis__lead" role="cell">' + lead + '</div>' +
        '<div class="demand-market" role="cell"><span class="demand-market__name">' + esc(marketName(row)) + '</span>' +
          (note ? '<span class="demand-market__note">' + note + '</span>' : '') + '</div>' +
        '<div role="cell">' + index + '</div>' +
        '<div role="cell">' + sizeMixHTML(sizes, row.sizeRows, { mode: state.mode }) + '</div>' +
        '<div class="demand-col--num" role="cell">' + sug + '</div>' +
        '<div role="cell">' + plannedInput(row.key, null, row.planned, marketFullName(row)) + '</div>' +
        '<div class="demand-col--num" role="cell">' + gapHTML(row.gap) + '</div>' +
      '</div>';
    }

    function renderTable(res, openSet) {
      var el = slot('table');
      if (!el || !res) return;
      var sizes = res.sizes;
      var head =
        '<div class="product-list__head" role="row">' +
          '<div role="columnheader" aria-label=""></div>' +
          '<div role="columnheader">' + esc(T('demand.col.market', 'Market')) + '</div>' +
          '<div role="columnheader">' + esc(T('demand.col.index', 'Demand index')) + '</div>' +
          '<div role="columnheader">' + sizeMixHeadHTML(sizes) + '</div>' +
          '<div role="columnheader" class="demand-col--num">' + esc(T('demand.col.suggested', 'Suggested')) + '</div>' +
          '<div role="columnheader">' + esc(T('demand.col.planned', 'Planned')) + '</div>' +
          '<div role="columnheader" class="demand-col--num">' + esc(T('demand.col.gap', 'Gap')) + '</div>' +
        '</div>';
      var body = res.rows.map(function (row) {
        if (!row.cities.length) return marketRowHTML(row, sizes, {});
        var gid = pre + '-' + row.key;
        var open = !!openSet[gid];
        return '<div class="rowdis__group" role="rowgroup">' +
          marketRowHTML(row, sizes, { gid: gid, open: open }) +
          row.cities.map(function (c, i) { return marketRowHTML(c, sizes, { city: true, gid: gid, open: open, n: i + 1 }); }).join('') +
        '</div>';
      }).join('');
      el.innerHTML =
        '<div class="demand-table__bar">' +
          '<h2 class="demand-table__title">' + esc(T('demand.table.title', 'Market demand')) + '</h2>' +
          '<div class="segmented" role="radiogroup" aria-label="' + esc(T('demand.mode.aria', 'Size columns show')) + '">' +
            ['share', 'qty'].map(function (m) {
              var on = state.mode === m;
              return '<button type="button" class="segmented__btn' + (on ? ' segmented__btn--active' : '') + '" role="radio" aria-checked="' + on + '" data-dv-mode="' + m + '">' +
                esc(m === 'share' ? T('demand.mode.share', 'Share') : T('demand.mode.qty', 'Suggested quantity')) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="product-list-scroll">' +
          '<div class="product-list product-list--demand" role="grid" aria-label="' + esc(T('demand.table.title', 'Market demand')) + '">' + head + body + '</div>' +
        '</div>';
    }

    function statHTML(label, value, meta) {
      return '<div class="stat"><div class="stat__label">' + esc(label) + '</div>' +
        '<div class="stat__value">' + esc(value) + '</div>' +
        (meta ? '<div class="stat__meta">' + esc(meta) + '</div>' : '') + '</div>';
    }

    function renderFocus(res) {
      var el = slot('focus');
      if (!el || !res) return;
      var row = findRow(res, state.focus);
      if (!row || !row.country) { state.focus = null; state.focusSize = null; row = null; }
      if (row && state.focusSize && !row.sizeRows.some(function (r) { return r.size === state.focusSize; })) state.focusSize = null;

      var head = '<div class="demand-focus__head"><div class="demand-focus__titles">' +
        '<span class="demand-focus__kicker">' + esc(T('demand.focus.kicker', 'Focus')) + '</span>' +
        (row ? '<h2 class="demand-focus__title">' + esc(marketFullName(row) + (state.focusSize ? ' · ' + sizeLabel(state.focusSize) : '')) + '</h2>' : '') +
        '</div>' +
        (row ? '<button class="btn btn--ghost btn--sm" type="button" data-dv-clear>' + esc(T('demand.focus.clear', 'Clear')) + '</button>' : '') +
        '</div>';

      if (!row) {
        var none = res.state === 'no-region'
          ? T('demand.focus.noregion', 'Focus needs a country. It becomes available once checkout collects country and city.')
          : T('demand.focus.empty', 'Select a market in the table to see each size’s suggested quantity and fill in what you plan to make.');
        el.innerHTML = head + '<p class="demand-focus__empty">' + esc(none) + '</p>';
        return;
      }

      /* 指標：預測售罄天數（層級跟著計畫生產量）、尺寸差距（要選到尺寸、且該尺寸填了計畫生產量） */
      var sr = state.focusSize ? row.sizeRows.filter(function (r) { return r.size === state.focusSize; })[0] : null;
      var daysVal = DASH, daysMeta;
      if (sr && sr.daysToSellOut != null) {
        daysVal = T('demand.focus.days.val', '{n} days', { n: num(sr.daysToSellOut) });
        daysMeta = T('demand.focus.days.by-size', 'From the planned quantity for {size}', { size: sizeLabel(sr.size) });
      } else if (row.daysToSellOut != null) {
        daysVal = T('demand.focus.days.val', '{n} days', { n: num(row.daysToSellOut) });
        daysMeta = T('demand.focus.days.by-market', 'From the market’s planned quantity');
      } else {
        daysMeta = row.status === 'insufficient'
          ? T('demand.focus.days.insufficient', 'Not shown when data is insufficient')
          : T('demand.focus.days.need', 'Shows once a planned quantity is filled in');
      }
      var gapVal = DASH, gapMeta;
      if (!sr) gapMeta = T('demand.focus.gap.need-size', 'Select a size below and fill in its planned quantity');
      else if (sr.gap == null) gapMeta = row.status === 'insufficient'
        ? T('demand.focus.days.insufficient', 'Not shown when data is insufficient')
        : T('demand.focus.gap.need-plan', 'Fill in the planned quantity for {size}', { size: sizeLabel(sr.size) });
      else {
        var p = Math.round(sr.gap * 100);
        gapVal = p > 0 ? T('demand.gap.more', '{n}% more', { n: p }) : (p < 0 ? T('demand.gap.less', '{n}% less', { n: Math.abs(p) }) : T('demand.gap.even', 'Even'));
        gapMeta = T('demand.focus.gap.meta', 'Suggested {s} vs planned {p}', { s: num(sr.suggested), p: num(sr.planned) });
      }
      var stats = '<div class="stat-row demand-focus__stats">' +
        statHTML(T('demand.focus.days', 'Days to sell out'), daysVal, daysMeta) +
        statHTML(T('demand.focus.gap', 'Size gap'), gapVal, gapMeta) + '</div>';

      var note = statusHTML(row);
      var rows = row.sizeRows.map(function (r) {
        var on = state.focusSize === r.size;
        return '<div class="variant-table__row' + (on ? ' demand-size--focus' : '') + '" role="row" tabindex="0" aria-selected="' + on + '" data-dv-size="' + esc(r.size) + '">' +
          '<span role="cell">' + esc(sizeLabel(r.size)) + '</span>' +
          '<span role="cell" class="demand-col--num">' + (r.share > 0 ? pct(r.share) : DASH) + '</span>' +
          '<span role="cell" class="demand-col--num">' + (r.suggested == null ? DASH : num(r.suggested)) + '</span>' +
          '<span role="cell">' + plannedInput(row.key, r.size, r.planned, marketFullName(row) + ' ' + sizeLabel(r.size)) + '</span>' +
          '<span role="cell" class="demand-col--num">' + gapHTML(r.gap) + '</span>' +
        '</div>';
      }).join('');
      var table = '<div class="variant-table-wrap"><div class="variant-table variant-table--demand-sizes" role="grid" aria-label="' + esc(marketFullName(row)) + '">' +
        '<div class="variant-table__head" role="row">' +
          '<span role="columnheader">' + esc(T('demand.col.size', 'Size')) + '</span>' +
          '<span role="columnheader" class="demand-col--num">' + esc(T('demand.col.share', 'Share')) + '</span>' +
          '<span role="columnheader" class="demand-col--num">' + esc(T('demand.col.suggested', 'Suggested')) + '</span>' +
          '<span role="columnheader">' + esc(T('demand.col.planned', 'Planned')) + '</span>' +
          '<span role="columnheader" class="demand-col--num">' + esc(T('demand.col.gap', 'Gap')) + '</span>' +
        '</div>' + rows + '</div></div>';

      el.innerHTML = head + stats + (note ? '<div class="demand-focus__note">' + note + '</div>' : '') + table;
    }

    function renderNote(res) {
      var el = slot('note');
      if (!el) return;
      var P = (res && res.params) || D.params();
      var ch = Object.keys(P.channelWeights || {}).filter(function (k) { return P.channelWeights[k] > 0; })
        .map(function (k) { return T('demand.channel.' + k, k); }).join(T('demand.channel.sep', ', '));
      el.textContent = T('demand.note', 'Source: {channels} · Period: last {n} days', { channels: ch, n: P.periodDays });
    }

    function render() {
      /* 保留：展開中的城市組、正在打字的輸入格 */
      var openSet = {};
      root.querySelectorAll('.rowdis__toggle[aria-expanded="true"]').forEach(function (b) { openSet[b.getAttribute('data-rowdis')] = true; });
      var ae = document.activeElement;
      var keep = ae && root.contains(ae) && ae.hasAttribute('data-dv-plan')
        ? { key: ae.getAttribute('data-dv-plan'), size: ae.getAttribute('data-dv-plan-size') } : null;

      var res = compute();
      last = res;
      var isEmpty = !res || res.state === 'empty';
      renderSummary(res);
      renderBanner(res);
      var main = slot('main'), empty = slot('empty');
      if (main) main.hidden = isEmpty;
      if (empty) empty.hidden = !isEmpty;
      if (!isEmpty) { renderTable(res, openSet); renderFocus(res); }
      renderNote(res);

      if (window.ztorIcons) window.ztorIcons.render(root);
      if (window.rowDisclosure) window.rowDisclosure.sync(root);
      if (keep) {
        var sel = '[data-dv-plan="' + keep.key.replace(/"/g, '\\"') + '"]' + (keep.size != null ? '[data-dv-plan-size="' + keep.size.replace(/"/g, '\\"') + '"]' : ':not([data-dv-plan-size])');
        var again = root.querySelector(sel);
        if (again) again.focus();
      }
    }

    /* ── 互動（委派在 root，重畫不必重綁）── */
    function selectMarket(key) {
      if (state.focus === key) { state.focus = null; state.focusSize = null; }
      else { state.focus = key; state.focusSize = null; }
      render();
    }
    function selectSize(size) {
      state.focusSize = state.focusSize === size ? null : size;
      render();
    }
    function interactive(t) { return t.closest('input, button, a, select, textarea, label'); }

    root.addEventListener('click', function (e) {
      var t = e.target;
      var mode = t.closest('[data-dv-mode]');
      if (mode) { state.mode = mode.getAttribute('data-dv-mode'); render(); return; }
      if (t.closest('[data-dv-clear]')) { state.focus = null; state.focusSize = null; render(); return; }
      if (interactive(t)) return;
      var sz = t.closest('[data-dv-size]');
      if (sz) { selectSize(sz.getAttribute('data-dv-size')); return; }
      var row = t.closest('[data-dv-market]');
      if (row && !row.classList.contains('demand-row--unspec')) selectMarket(row.getAttribute('data-dv-market'));
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (interactive(e.target)) return;
      var sz = e.target.closest('[data-dv-size]');
      var row = e.target.closest('[data-dv-market]');
      if (sz === e.target) { e.preventDefault(); selectSize(sz.getAttribute('data-dv-size')); }
      else if (row === e.target && !row.classList.contains('demand-row--unspec')) { e.preventDefault(); selectMarket(row.getAttribute('data-dv-market')); }
    });
    root.addEventListener('change', function (e) {
      var inp = e.target.closest('[data-dv-plan]');
      if (!inp) return;
      var raw = inp.value.trim();
      var size = inp.hasAttribute('data-dv-plan-size') ? inp.getAttribute('data-dv-plan-size') : null;
      var n = raw === '' ? null : Number(raw);
      var ok = D.setPlanned(scopeFilter(), inp.getAttribute('data-dv-plan'), size, n);
      if (!ok) {
        inp.setAttribute('aria-invalid', 'true');
        inp.title = T('demand.planned.err', 'Enter a whole number, 0 or more');
        return;
      }
      render();
    });

    var view = { render: render, state: state, result: function () { return last; } };
    return view;
  }

  /* 商品的 persona：ztorDemand 沒有直接讀 persona 的 API，用 products() 分 persona 比對 */
  function personaOf(id) {
    var ps = ['default', 'nick'];
    for (var i = 0; i < ps.length; i++) {
      if (D.products({ persona: ps[i] }).some(function (p) { return p.id === id; })) return ps[i];
    }
    return undefined;
  }

  window.ztorDemandView = {
    create: create,
    sizeMixHTML: sizeMixHTML,
    sizeMixHeadHTML: sizeMixHeadHTML,
    gapHTML: gapHTML,
    marketName: marketName
  };

  /* ── 頁面接線：需求看板（demand-board.html）───────────────────── */
  function initPage() {
    var page = document.querySelector('[data-demand-board]');
    if (!page) return;
    var qs = new URLSearchParams(location.search);
    function demo() {
      if (document.documentElement.getAttribute('data-data-state') === 'empty') return 'empty';
      var s = qs.get('state');
      return (s === 'empty' || s === 'no-region') ? s : null;
    }
    /* ?product=<id>：從商品細節頁的需求數據彈窗「在需求看板開啟」帶入商品篩選（D360 · S69）；不在有需求的範圍內就由 renderFilters 夾掉 */
    var F = { category: '', sub: '', audience: '', productId: qs.get('product') || '' };
    function viewFilter() {
      return F.productId ? { productId: F.productId } : { category: F.category, sub: F.sub, audience: F.audience };
    }
    function opts(f) {
      if (demo() === 'empty') return { categories: [], subs: [], audiences: [], products: [] };
      var d = demo();
      return D.filterOptions(f, d ? { demo: d } : undefined);
    }

    var elAud = page.querySelector('[data-dv-audience]');
    var elCat = page.querySelector('[data-dv-category]');
    var elSub = page.querySelector('[data-dv-sub]');
    var elProd = page.querySelector('[data-dv-product]');

    function optionHTML(value, text, selected) {
      return '<option value="' + esc(value) + '"' + (selected ? ' selected' : '') + '>' + esc(text) + '</option>';
    }
    function audLabel(a) { return a[lang()] || a.en; }

    /* F2：先把選擇夾回「有需求」的範圍，再畫選項。適用對象一律選定一個（尺寸占比不跨適用對象混算）。 */
    function renderFilters() {
      var all = opts({});
      if (F.category && !all.categories.some(function (c) { return c.key === F.category; })) F.category = '';
      var inCat = opts({ category: F.category });
      if (F.sub && !inCat.subs.some(function (s) { return s.key === F.sub; })) F.sub = '';
      var inSub = opts({ category: F.category, sub: F.sub });
      var auds = inSub.audiences;
      var prodAll = inSub.products;
      var prod = F.productId ? prodAll.filter(function (p) { return p.id === F.productId; })[0] : null;
      if (F.productId && !prod) F.productId = '';
      if (prod) F.audience = prod.audience;
      /* 預設適用對象＝範圍內商品最多的那一個（呈現決策；規格只要求不跨適用對象混算） */
      if (auds.indexOf(F.audience) < 0) {
        var cnt = {};
        prodAll.forEach(function (p) { cnt[p.audience] = (cnt[p.audience] || 0) + 1; });
        F.audience = auds.slice().sort(function (a, b) { return (cnt[b] || 0) - (cnt[a] || 0); })[0] || '';
      }
      var prods = opts({ category: F.category, sub: F.sub, audience: F.audience }).products;

      elAud.innerHTML = (A ? A.audiences : []).map(function (a) {
        var on = a.key === F.audience, has = auds.indexOf(a.key) >= 0;
        return '<button class="filter-tabs__item' + (on ? ' filter-tabs__item--active' : '') + '" type="button" role="tab" aria-selected="' + on + '"' +
          (has ? '' : ' disabled') + ' data-dv-aud="' + a.key + '">' + esc(audLabel(a)) + '</button>';
      }).join('');
      elCat.innerHTML = optionHTML('', T('demand.f.allcat', 'All categories'), !F.category) +
        all.categories.map(function (c) { return optionHTML(c.key, A ? A.label(c.key, lang()) : c.key, c.key === F.category); }).join('');
      elSub.innerHTML = optionHTML('', T('demand.f.allsub', 'All subcategories'), !F.sub) +
        inCat.subs.map(function (s) { return optionHTML(s.key, A ? A.label(s.key, lang()) : s.key, s.key === F.sub); }).join('');
      elProd.innerHTML = optionHTML('', T('demand.f.allprod', 'All products'), !F.productId) +
        prods.map(function (p) { return optionHTML(p.id, p.name, p.id === F.productId); }).join('');
    }

    var view = create(page, { filter: viewFilter, demo: demo, idPrefix: 'dm' });
    function renderAll() { renderFilters(); view.render(); }

    elAud.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dv-aud]');
      if (!b || b.disabled) return;
      F.audience = b.getAttribute('data-dv-aud');
      F.productId = '';
      renderAll();
    });
    elCat.addEventListener('change', function () { F.category = elCat.value; F.sub = ''; F.productId = ''; renderAll(); });
    elSub.addEventListener('change', function () { F.sub = elSub.value; F.productId = ''; renderAll(); });
    elProd.addEventListener('change', function () { F.productId = elProd.value; renderAll(); });

    var lastLang = lang();
    document.addEventListener('i18n:applied', function () {
      if (lang() === lastLang) return;
      lastLang = lang();
      renderAll();
    });
    /* Cheat Codes 的 Empty 開關寫在 <html data-data-state>，切了就重畫 */
    new MutationObserver(renderAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-data-state'] });

    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
  else initPage();
})();
