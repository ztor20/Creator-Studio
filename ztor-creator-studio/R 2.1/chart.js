// Ztor Creator Studio · chart-card behavior (offline, no deps)
// Handles: (1) line/bar view toggle, (2) shadcn-style hover tooltip with a
// vertical cursor + dot for the line view and a column highlight for bars.
//
// Data is read from the chart-card's `data-chart-series` attribute:
//   [{ "label": "November 2025", "value": 24830, "y": 38 }, ...]
//   • value → tooltip amount (formatted as USD)
//   • y     → the point's viewBox-Y (0–180) so the hover dot sits on the line

(function () {
  const fmtUSD = v => '$' + Number(v).toLocaleString('en-US');
  const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };

  function initCard(card) {
    const body = card.querySelector('.chart-card__body');
    if (!body) return;

    /* ── view toggle ── */
    const toggle = card.querySelector('[data-chart-toggle]');
    if (toggle) {
      toggle.addEventListener('click', e => {
        const btn = e.target.closest('[data-view]');
        if (!btn) return;
        card.setAttribute('data-chart-view', btn.dataset.view);
        toggle.querySelectorAll('[data-view]').forEach(b =>
          b.classList.toggle('segmented__item--active', b === btn));
        hide();
      });
    }

    /* ── hover tooltip / cursor ── */
    let series;
    try { series = JSON.parse(card.getAttribute('data-chart-series') || '[]'); }
    catch (_) { series = []; }
    if (!series.length) return;
    const seriesName = card.getAttribute('data-chart-name') || 'Revenue';
    const n = series.length;

    const tip = el('div', 'chart-tip');
    const cursor = el('div', 'chart-cursor');
    const dot = el('div', 'chart-cursor__dot');
    body.append(cursor, dot, tip);

    function activeMain() {
      const bar = card.getAttribute('data-chart-view') === 'bar';
      return card.querySelector(
        bar ? '.barchart-wrap .linechart__main'
            : '.linechart:not(.barchart-wrap) .linechart__main');
    }

    function hide() {
      tip.classList.remove('chart-tip--show');
      cursor.classList.remove('chart-cursor--show');
      dot.classList.remove('chart-cursor__dot--show');
      const bc = body.querySelector('.chart-bar-cursor');
      if (bc) bc.classList.remove('chart-bar-cursor--show');
    }

    function showTip(i, px, py) {
      tip.innerHTML =
        '<div class="chart-tip__label">' + series[i].label + '</div>' +
        '<div class="chart-tip__row">' +
          '<span class="chart-tip__key"><span class="chart-tip__dot"></span>' + seriesName + '</span>' +
          '<span class="chart-tip__val">' + fmtUSD(series[i].value) + '</span>' +
        '</div>';
      const bw = body.clientWidth;
      const half = tip.offsetWidth / 2;
      const clampedX = Math.max(half + 2, Math.min(bw - half - 2, px));
      tip.style.left = clampedX + 'px';
      tip.style.top = py + 'px';
      tip.classList.add('chart-tip--show');
    }

    function onMove(e) {
      const main = activeMain();
      if (!main) return;
      const mr = main.getBoundingClientRect();
      const br = body.getBoundingClientRect();
      const x = e.clientX - mr.left;
      if (x < -4 || x > mr.width + 4) return hide();
      const offX = mr.left - br.left;
      const offY = mr.top - br.top;

      if (card.getAttribute('data-chart-view') === 'bar') {
        const bars = [...main.querySelectorAll('.barchart__bar')];
        if (!bars.length) return;
        // nearest bar by horizontal center
        let i = 0, best = Infinity;
        bars.forEach((b, idx) => {
          const r = b.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2));
          if (d < best) { best = d; i = idx; }
        });
        const bar = bars[i];
        // column highlight inside the .barchart (positioned ancestor)
        const barchart = main.querySelector('.barchart');
        let bc = barchart.querySelector('.chart-bar-cursor');
        if (!bc) { bc = el('div', 'chart-bar-cursor'); barchart.prepend(bc); }
        bc.style.left = (bar.offsetLeft - 3) + 'px';
        bc.style.width = (bar.offsetWidth + 6) + 'px';
        bc.classList.add('chart-bar-cursor--show');
        cursor.classList.remove('chart-cursor--show');
        dot.classList.remove('chart-cursor__dot--show');
        const r = bar.getBoundingClientRect();
        showTip(i, (r.left + r.width / 2) - br.left, (r.top - br.top));
      } else {
        const i = Math.max(0, Math.min(n - 1, Math.round((x / mr.width) * (n - 1))));
        const cx = offX + (i / (n - 1)) * mr.width;
        const cy = offY + (series[i].y / 180) * mr.height;
        cursor.style.left = cx + 'px';
        cursor.style.top = offY + 'px';
        cursor.style.height = mr.height + 'px';
        cursor.classList.add('chart-cursor--show');
        dot.style.left = cx + 'px';
        dot.style.top = cy + 'px';
        dot.classList.add('chart-cursor__dot--show');
        showTip(i, cx, cy);
      }
    }

    body.addEventListener('mousemove', onMove);
    body.addEventListener('mouseleave', hide);
  }

  function init() { document.querySelectorAll('.chart-card').forEach(initCard); }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();
