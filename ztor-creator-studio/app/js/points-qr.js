/* points-qr.js — 點數 QR 卡（.points-qr）的渲染與下載
   依賴：js/faux-qr.js（window.ztorFauxQr）、ds-components/points-qr.css、stock-bar.css
   文案：i18n.js 的 pqr.* 鍵（window.i18nT）；沒載 i18n 的頁面（如 design-system.html）吃內建後備。

   API（window.ztorPointsQr）
     render(opts) → HTML 字串
     mount(el, opts)  把卡畫進 el（el 上記住 opts，語言切換 i18n:applied 時自動重畫）
     download(el)     把 el 內那張 QR 存成 PNG（檔名＝QR 名稱.png）
   opts：
     name     QR 名稱（顯示與檔名用）
     points   每次領的點數（整數）
     seed     假 QR 種子（整數，預設 7；同 seed 同圖）
     claimed  已領名額（選填，與 total 一起給才顯示用量條）
     total    總名額（選填）
     compact  true → 緊湊版 */
(function () {
  var FALLBACK = {
    'pqr.download': { en: 'Download QR', zh: '下載 QR' },
    'pqr.perScan':  { en: '+{n} pts per scan', zh: '每次 +{n} 點' },
    'pqr.claimed':  { en: '{a} of {b} claimed', zh: '已領 {a}／{b}' },
    'pqr.full':     { en: 'Fully claimed', zh: '名額已滿' }
  };

  function lang() {
    var h = document.documentElement;
    var l = h.getAttribute('data-lang') || h.getAttribute('lang') || 'zh';
    return /^zh/.test(l) ? 'zh' : 'en';
  }
  function tr(key, vars) {
    var v = (typeof window.i18nT === 'function') ? window.i18nT(key) : null;
    if (v == null) v = FALLBACK[key][lang()];
    return String(v).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render(o) {
    o = o || {};
    var hasUsage = o.total != null && o.claimed != null && +o.total > 0;
    var full = hasUsage && +o.claimed >= +o.total;
    var pct = hasUsage ? Math.max(0, Math.min(100, Math.round(+o.claimed / +o.total * 100))) : 0;
    var qr = (window.ztorFauxQr ? window.ztorFauxQr(o.seed || 7) : '');
    return '<div class="points-qr' + (o.compact ? ' points-qr--compact' : '') + (full ? ' points-qr--full' : '') + '">' +
      '<div class="points-qr__code" data-pqr-code>' + qr + '</div>' +
      '<div class="points-qr__name">' + esc(o.name) + '</div>' +
      '<div class="points-qr__points">' + esc(tr('pqr.perScan', { n: o.points })) + '</div>' +
      (hasUsage
        ? '<div class="points-qr__usage"><div class="points-qr__usage-text">' +
          esc(full ? tr('pqr.full') : tr('pqr.claimed', { a: o.claimed, b: o.total })) +
          '</div><div class="stock-bar"><span class="stock-bar__fill" style="width:' + pct + '%"></span></div></div>'
        : '') +
      '<button type="button" class="btn btn--outline btn--sm points-qr__download" data-pqr-download>' +
        esc(tr('pqr.download')) + '</button>' +
      '</div>';
  }

  function mount(el, opts) {
    if (!el) return;
    el.__pqrOpts = opts;
    el.innerHTML = render(opts);
  }

  function fileName(name) {
    var n = String(name || 'QR').replace(/[\\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '');
    return (n || 'QR') + '.png';
  }
  function save(blobOrUrl, name) {
    var a = document.createElement('a');
    var isBlob = typeof blobOrUrl !== 'string';
    a.href = isBlob ? URL.createObjectURL(blobOrUrl) : blobOrUrl;
    a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    if (isBlob) setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* SVG → PNG：黑碼白底（與主題無關，印出來才掃得到）。 */
  function download(el) {
    var card = el && el.closest ? (el.classList && el.classList.contains('points-qr') ? el : el.closest('.points-qr') || el.querySelector('.points-qr')) : null;
    var svg = card && card.querySelector('[data-pqr-code] svg');
    if (!svg) return;
    var host = card.parentNode && card.parentNode.__pqrOpts ? card.parentNode : null;
    var nameEl = card.querySelector('.points-qr__name');
    var name = fileName(host ? host.__pqrOpts.name : (nameEl && nameEl.textContent));
    var src = new XMLSerializer().serializeToString(svg)
      .replace(/currentColor/g, 'black').replace(/var\(--card\)/g, 'white');
    var vb = (svg.getAttribute('viewBox') || '0 0 58 58').split(/\s+/);
    var side = 512, margin = 32, inner = side - margin * 2;
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = c.height = side;
      var g = c.getContext('2d');
      g.fillStyle = 'white'; g.fillRect(0, 0, side, side);
      g.imageSmoothingEnabled = false;
      g.drawImage(img, margin, margin, inner, inner * (+vb[3] / +vb[2]));
      if (c.toBlob) c.toBlob(function (b) { if (b) save(b, name); }, 'image/png');
      else save(c.toDataURL('image/png'), name);
    };
    img.onerror = function () {
      save('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src), name.replace(/\.png$/, '.svg'));
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pqr-download]');
    if (b) download(b);
  });
  function remountAll() {
    document.querySelectorAll('.points-qr').forEach(function (card) {
      var host = card.parentNode;
      if (host && host.__pqrOpts) mount(host, host.__pqrOpts);
    });
  }
  document.addEventListener('i18n:applied', remountAll);
  /* 沒載 i18n.js 的頁面（design-system.html）：自己盯 <html data-lang> 的切換 */
  if (window.MutationObserver) {
    new MutationObserver(remountAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  }

  window.ztorPointsQr = { render: render, mount: mount, download: download };
})();
