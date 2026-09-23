/* fan-product-page.js — 粉絲視角商品頁的渲染函式（D310 商品側，2026-09-23）
 *
 * 建立商品按下「開始販售」後進入的發布前預覽確認全頁畫面（js/publish-stage.js，D310），
 * 主區要畫「粉絲視角完整商品頁」（5.1.5.2 §1／§4.6：商品只有一個視圖，D305）。
 * 活動那一支是 js/fan-event-page.js；本檔是它的商品版，API 形狀與寫法照抄它：
 * 宿主把資料整理成一個 `model` 交給本檔畫，本檔只知道「粉絲頁長什麼樣」，不知道資料從哪來。
 *
 * ── 鏡像來源（2026-09-23 讀前台原始碼，未開瀏覽器）──
 *   前台 https://ztor.vercel.app/shop-item.html 的商品（goods）分支：
 *   assets/shop-detail-render.js 的 renderGoods()／goodsBuyHtml()／priceBlock()／variantsHtml()／
 *   qtyHtml()／deliveryMicroHtml()／stockLineHtml()／detailsSectionHtml()／relatedHtml()／buyBarHtml()。
 *   DOM 結構與 class 名照它；CSS 是前台 components.css 的同名規則加 `.fep-shop` 前綴
 *   （ds-components/fan-shop.css 第 4 段），與活動頁共用第 1–3 段。與前台的差別只在：
 *   · 資料全部來自建立商品表單（名稱／描述／圖庫／分類／選項／價格／折扣／庫存／規格／取貨與退貨）
 *   · 前台專有的互動拿掉：加入購物車／收藏／數量／放大／縮圖切換／尺寸指南一律不動作（data-pp-inert）
 *   · 相關商品四張卡標「非本商品」佔位（同活動頁的相關活動作法）
 *   · 店家列（pdp-host--shop）：宿主給 shop 才畫；原型沒有店家資料時不畫、不編名字
 *
 * 用法：
 *   window.ztorFanProductPage.render(host, model, api)   // 回傳 .fep-shop 根節點
 *
 * model（宿主整理；可翻譯欄位給 `{ key }`，本檔以 api.getValue(key) 取當前語系的值並
 * 交給 api.bindEditable 掛 inline 編輯；非文案的資料值給字串）：
 *   {
 *     category: 'Apparel',                        // 麵包屑中段與規格表「分類」列（平台分類，跟介面語言走）
 *     badge: '' ,                                 // 選填：前台 .pdp-buy__meta 的徽章（原型不給）
 *     gallery: [{ src, kind:'image'|'video' } | 'src', …],   // 第一張＝主圖
 *     name: { key:'name' },
 *     shop: { name, avatar } | null,             // 店家列；null＝不畫
 *     price: { priceObj, priceKey } | null,       // 單一選項：一個價格
 *     variants: {                                 // 多選項：選項組（晶片）＋逐組合價格
 *       groups: [{ name:{key}|'Size', kind:'colour'|'', values:[{ label:{key}|'M', hex:'#000' }] }],
 *       rows:   [{ priceObj, priceKey }]          // 價格顯示取最低（不同時加「起」）
 *     } | null,
 *     discountPct: 0,                             // 折扣 %（>0 才畫折後價＋原價＋省多少；換算後依比例打折）
 *     stock: null | 3,                            // 限量才給「目前還剩幾件」；null＝不限量不顯示
 *     sizeGuide: false,                           // 有可看的尺寸指南（商店沿用或專屬）才畫「尺寸指南」
 *     delivery: { icon:'truck'|'download', key:'cp.delivery.shipping', fallback:'Shipping' } | null,
 *     desc: { key:'desc' },
 *     specs: [{ k:{key}|'Material', v:{key}|'Cotton' }],     // 規格表（dl）；分類列由宿主放第一列
 *     returns: { key:'returns' } | null,          // 取貨與退換段；null＝整段不畫（D291 留空不顯示）
 *     related: true | false | [{ name, cat, priceObj|price, img }]   // true＝四張佔位卡（標「非本商品」）
 *   }
 *
 * 價格節點帶 `data-fep-price-key`（沿用活動頁的屬性名：宿主 js/publish-stage.js 認這個屬性把價格表滑出來，
 * D310「價格不就地改」）；另掛 `data-fpp-price-key` 標明是商品頁的價格節點（editZones 可選）。
 * 單一選項給該價格的 key；多選項的「最低價起」不對應單一列，給空字串＝開表但不聚焦。
 * 其他可給 editZones 選的區塊：[data-fpp-gallery]、.pdp-buy__title、[data-fpp-price]、[data-fpp-variants]、
 * [data-fpp-stock]、[data-fpp-delivery]、.pdp-details__lead、[data-fpp-specs]、[data-fpp-returns]。
 *
 * api（由 js/publish-stage.js 的 previewRender 提供，與活動頁同介面）：
 *   lang；getValue(key)；bindEditable(el, key)；priceIn(priceObj, priceKey)；money(priceObj, priceKey)；fmt(n)。
 *
 * 依賴 CSS：ds-components/fan-shop.css（第 1–3 段共用、第 4 段商品頁）；宿主頁另需 publish-stage.css。
 */
(function () {
  'use strict';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* 前台金額格式「NT$ 1,200」（符號後一個空格）；events-store 的 fmtMoney 給「NT$1,200」，這裡只補空格 */
  function spaced(s) { return String(s == null ? '' : s).replace(/^([^\d\s]+)(\d)/, '$1 $2'); }
  function numOf(api, po, key) { return api.priceIn ? api.priceIn(po, key) : 0; }
  function fmtNum(api, n) { return spaced(api.fmt ? api.fmt(n) : String(n)); }

  /* 可翻譯 slot：同 fan-event-page.js——值從 api 取、交給 api 決定要不要開放 inline 編輯；空值畫斜體佔位 */
  function slot(api, tag, cls, field, placeholder) {
    var n = el(tag, cls);
    if (field && field.key) {
      api.bindEditable(n, field.key);
      if (!n.textContent) n.setAttribute('data-placeholder', placeholder || '');
    } else {
      n.textContent = field == null ? '' : String(field);
      if (!n.textContent) { n.classList.add('is-empty'); n.setAttribute('data-placeholder', placeholder || ''); }
    }
    return n;
  }
  function valueOf(api, field) { return (field && field.key) ? (api.getValue(field.key) || '') : (field == null ? '' : String(field)); }

  /* 前台 inline svg（shop-detail-render.js 的 SVG 表）：照抄 path，不走 icons.js registry（形狀要一模一樣） */
  var SVG = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle><path d="M2.5 3h2l2.2 12.3a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 7H6"></path></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2M11 8v6M8 11h6"></path></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"></path></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 5v4h-7V8z"></path><circle cx="5.5" cy="18.5" r="1.5"></circle><circle cx="18.5" cy="18.5" r="1.5"></circle></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12L12 2l10 10-10 10L2 12z"></path><path d="M7 12l1.5-1.5M10 9l1.5-1.5M13 12l1.5-1.5"></path></svg>'
  };

  /* 素材：字串＝圖片；物件 { src, kind }＝圖片或影片（D259 素材槽可放影片）。影片停在第一影格、不自動播。 */
  function mediaOf(x) { return typeof x === 'string' ? { src: x, kind: 'image' } : (x && x.src ? { src: x.src, kind: x.kind === 'video' ? 'video' : 'image' } : null); }
  function mediaTag(m, cls, alt) {
    if (!m) return '';
    var c = cls ? ' class="' + cls + '"' : '';
    return m.kind === 'video'
      ? '<video' + c + ' src="' + esc(m.src) + '" muted playsinline preload="metadata"></video>'
      : '<img' + c + ' src="' + esc(m.src) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">';
  }
  function thumbBtn(m, i, active) {
    var b = el('button', 'pdp-gallery__thumb' + (active ? ' is-active' : '') + (m ? '' : ' pdp-gallery__thumb--empty'));
    b.type = 'button'; b.setAttribute('data-thumb', String(i)); b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
    b.setAttribute('aria-label', T('fep.gallery.view', 'View image {n}').replace('{n}', i + 1));
    b.innerHTML = m ? mediaTag(m, '', '') : '<i data-lucide="image" class="ztor-icon"></i>';
    return b;
  }

  /* 前台色票：有色號（D249）就填色號，沒有就用前台的退路色（--border-strong） */
  function swatchStyle(hex) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex || '') ? '--swatch-bg:' + hex : '--swatch-bg:var(--border-strong)';
  }

  /* ── 主體 ─────────────────────────────────────────────────────── */
  function render(host, model, api) {
    host.innerHTML = '';
    var m = model || {};
    var nameText = valueOf(api, m.name);
    var zh = /^zh/.test(api.lang || '');

    var root = el('div', 'fep-shop rf-shop');
    root.setAttribute('data-fpp-view', 'product');
    root.setAttribute('lang', api.lang === 'zh' ? 'zh-Hant' : (api.lang || 'en'));

    var main = el('main');
    var section = el('section', 'section section-bg-page section--flush-top');
    var pdp = el('div', 'pdp');
    pdp.setAttribute('data-pdp', ''); pdp.setAttribute('aria-busy', 'false'); pdp.setAttribute('data-type', 'goods');

    /* 手機頂欄（≤768 才顯示）：保留結構，不可點 */
    var topbar = el('div', 'pdp-topbar');
    topbar.setAttribute('data-pdp-topbar', '');
    topbar.innerHTML =
      '<a class="pdp-topbar__back" data-pdp-back data-pp-inert aria-label="' + esc(T('fep.back', 'Back')) + '">' +
        '<span class="icon-btn icon-btn--sm icon-btn--plain" aria-hidden="true">' + SVG.back + '</span>' +
        '<span class="pdp-topbar__backlabel">' + esc(T('fep.back', 'Back')) + '</span></a>' +
      '<span class="pdp-topbar__spacer"></span>' +
      '<button class="icon-btn icon-btn--sm icon-btn--plain pdp-topbar__wish" type="button" data-pdp-wish data-pp-inert tabindex="-1" aria-pressed="false" aria-label="' + esc(T('fep.wish', 'Add to wishlist')) + '">' + SVG.heart + '</button>' +
      '<button class="icon-btn icon-btn--sm icon-btn--plain pdp-topbar__cart" type="button" data-pp-inert tabindex="-1" aria-label="' + esc(T('fep.cart', 'Cart')) + '">' + SVG.cart + '<span class="pdp-topbar__badge" aria-live="polite" aria-atomic="true">0</span></button>';
    pdp.appendChild(topbar);

    var page = el('div', 'pdp__page');
    var container = el('div', 'container');

    /* 麵包屑：商店 › 分類 › 名稱（前台商品頁的根是「商店」、中段是分類） */
    var crumb = el('nav', 'page-head__crumbs');
    crumb.setAttribute('aria-label', T('fep.crumb.label', 'Breadcrumb'));
    crumb.innerHTML = '<a data-pp-inert data-i18n="fpp.crumb.shop">' + esc(T('fpp.crumb.shop', 'Shop')) + '</a>' +
      '<span class="page-head__crumb-sep" aria-hidden="true">›</span>' +
      (m.category ? '<a data-pp-inert>' + esc(m.category) + '</a><span class="page-head__crumb-sep" aria-hidden="true">›</span>' : '');
    var cur = el('span', 'page-head__crumb-cur'); cur.setAttribute('aria-current', 'page');
    cur.textContent = nameText || T('cp.pv.name', 'Product name');
    crumb.appendChild(cur);
    container.appendChild(crumb);

    var grid = el('div', 'pdp__grid');

    /* ── 圖庫：縮圖條 ＋ 主圖框（2:3）＋ 左右箭頭（>1 張才有） ── */
    var media = (m.gallery || []).map(mediaOf).filter(Boolean);
    var gallery = el('div', 'pdp-gallery'); gallery.setAttribute('data-pdp-gallery', ''); gallery.setAttribute('data-fpp-gallery', '');
    var strip = el('div', 'pdp-gallery__strip'); strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', T('fep.gallery.label', 'Images'));
    var mobile = el('div', 'pdp-gallery__thumbs-mobile'); mobile.setAttribute('role', 'group'); mobile.setAttribute('aria-label', T('fep.gallery.label', 'Images'));
    (media.length ? media : [null]).forEach(function (x, i) { strip.appendChild(thumbBtn(x, i, i === 0)); mobile.appendChild(thumbBtn(x, i, i === 0)); });
    var stage = el('div', 'pdp-gallery__stage');
    var frame = el('button', 'pdp-gallery__frame' + (media[0] ? '' : ' pdp-gallery__frame--empty'));
    frame.type = 'button'; frame.setAttribute('data-zoom-open', ''); frame.setAttribute('data-pp-inert', ''); frame.tabIndex = -1;
    frame.setAttribute('aria-label', T('fep.zoom', 'Zoom'));
    frame.innerHTML = (media[0] ? mediaTag(media[0], 'pdp-gallery__img', nameText) : '<i data-lucide="image" class="ztor-icon"></i>') +
      '<span class="pdp-gallery__zoom-hint" aria-hidden="true">' + SVG.zoom + '</span>';
    stage.appendChild(frame);
    var vw = el('div', 'pdp-gallery__video-wrap'); vw.setAttribute('data-pdp-video-wrap', ''); vw.hidden = true;
    stage.appendChild(vw);
    if (media.length > 1) {
      var prev = el('button', 'pdp-gallery__arrow pdp-gallery__arrow--prev liquid-glass', SVG.back);
      prev.type = 'button'; prev.setAttribute('data-pp-inert', ''); prev.tabIndex = -1; prev.setAttribute('aria-label', T('fpp.gallery.prev', 'Previous view'));
      var next = el('button', 'pdp-gallery__arrow pdp-gallery__arrow--next liquid-glass', SVG.chev);
      next.type = 'button'; next.setAttribute('data-pp-inert', ''); next.tabIndex = -1; next.setAttribute('aria-label', T('fpp.gallery.next', 'Next view'));
      stage.appendChild(prev); stage.appendChild(next);
    }
    stage.appendChild(mobile);
    gallery.appendChild(strip);
    gallery.appendChild(stage);
    grid.appendChild(gallery);

    /* ── 購買欄 ── */
    var buy = el('div', 'pdp-buy');
    if (m.badge) {
      var meta = el('div', 'pdp-buy__meta');
      meta.appendChild(el('span', 'pdp-buy__badge status-tag status-tag--yellow', esc(m.badge)));
      buy.appendChild(meta);
    }
    buy.appendChild(slot(api, 'h1', 'pdp-buy__title', m.name, T('cp.pv.name', 'Product name')));

    /* 店家列（前台 pdp-host--shop：頭像＋店名＋「前往創作者商店 ›」）：宿主有店家資料才畫 */
    if (m.shop && m.shop.name) {
      var hostEl = el('a', 'pdp-host pdp-host--shop'); hostEl.setAttribute('data-pp-inert', '');
      var avatar = m.shop.avatar
        ? '<img class="pdp-host__avatar" src="' + esc(m.shop.avatar) + '" alt="">'
        : '<span class="pdp-host__avatar pdp-host__avatar--initial" aria-hidden="true">' + esc(String(m.shop.name).trim().charAt(0).toUpperCase()) + '</span>';
      hostEl.innerHTML = avatar +
        '<span class="pdp-host__name-row"><span class="pdp-host__name">' + esc(m.shop.name) + '</span></span>' +
        '<span class="pdp-host__more" data-i18n="fep.host.more">' + esc(T('fep.host.more', 'Visit creator shop ›')) + '</span>';
      buy.appendChild(hostEl);
    }

    /* 價格：單一選項＝那一個價格；多選項＝逐組合的最低價（價格不同時加「起」）。
       折扣（F13）：折扣 % 套在當前幣別的價格上（覆寫過的幣別也照比例打折），畫前台的「原價」與「省」。 */
    var priceBox = el('div', 'pdp-price'); priceBox.setAttribute('data-fpp-price', '');
    var nowEl = el('span', 'pdp-price__now');
    var listN = null, fromTag = false, priceKey = '';
    if (m.variants && m.variants.rows && m.variants.rows.length) {
      var nums = m.variants.rows.map(function (r) { return numOf(api, r.priceObj, r.priceKey); });
      listN = Math.min.apply(null, nums);
      fromTag = Math.max.apply(null, nums) !== listN;
      priceKey = '';
    } else if (m.price && m.price.priceObj) {
      listN = numOf(api, m.price.priceObj, m.price.priceKey);
      priceKey = m.price.priceKey || '';
    }
    var pct = Number(m.discountPct) || 0;
    var hasDiscount = listN != null && pct > 0 && pct < 100;
    var nowN = listN == null ? null : (hasDiscount ? Math.round(listN * (100 - pct) / 100) : listN);
    var nowStr = nowN == null ? '' : fmtNum(api, nowN);
    if (nowN == null) {
      nowEl.classList.add('is-empty');
      nowEl.textContent = fmtNum(api, 0);
    } else {
      nowEl.textContent = fromTag ? T('fpp.price.from', 'From {price}').replace('{price}', nowStr) : nowStr;
      /* D310：點價格開右側價格表（價格不就地改）；publish-stage 認 data-fep-price-key */
      nowEl.setAttribute('data-fep-price-key', priceKey);
      nowEl.setAttribute('data-fpp-price-key', priceKey);
    }
    priceBox.appendChild(nowEl);
    if (hasDiscount && listN > nowN) {
      priceBox.appendChild(el('span', 'pdp-price__was', esc(T('fpp.price.was', 'Was {price}').replace('{price}', fmtNum(api, listN)))));
      priceBox.appendChild(el('span', 'pdp-price__save', esc(T('fpp.price.save', 'Save {amt}').replace('{amt}', fmtNum(api, listN - nowN)))));
    }
    buy.appendChild(priceBox);

    /* 庫存：前台只在「限量且快沒了（≤10 件）」才說還剩幾件；售完交給 CTA 的售完態（stockLineHtml 同規則） */
    var STOCK_LOW_AT = 10;
    var stockN = m.stock == null || m.stock === '' ? null : Number(m.stock);
    var soldOut = stockN != null && !isNaN(stockN) && stockN <= 0;
    if (stockN != null && !isNaN(stockN) && stockN > 0 && stockN <= STOCK_LOW_AT) {
      var st = el('p', 'pdp-stock'); st.setAttribute('data-fpp-stock', '');
      st.textContent = T('fpp.stock.left', 'Only {n} left').replace('{n}', stockN);
      buy.appendChild(st);
    }

    /* 選項：顏色＝色票（第一顆預選、標題後帶色名），其餘＝尺寸格（前台 pdp-size-chip）；
       有尺寸指南時，第一個非顏色的選項列標題右側帶「尺寸指南」，沒有這種列就單獨一列（前台 --reflone） */
    var groups = (m.variants && m.variants.groups) || [];
    var guideUsed = false;
    function guideBtn() {
      guideUsed = true;
      return '<button class="pdp-variant__guide" type="button" data-size-guide data-pp-inert tabindex="-1">' +
        '<span class="pdp-variant__guide-icon" aria-hidden="true">' + SVG.ruler + '</span><span data-i18n="fpp.size-guide">' + esc(T('fpp.size-guide', 'Size guide')) + '</span></button>';
    }
    if (groups.length) {
      var vs = el('div', 'pdp-variants'); vs.setAttribute('data-variants', ''); vs.setAttribute('data-fpp-variants', '');
      groups.forEach(function (g, gi) {
        var isColour = g.kind === 'colour';
        var row = el('div', 'pdp-variant'); row.setAttribute('data-variant', isColour ? 'colour' : 'size'); row.setAttribute('data-vrow', String(gi));
        var head = el('div', 'pdp-variant__header');
        var label = el('span', 'pdp-variant__label');
        label.appendChild(slot(api, 'span', '', g.name, T('pp.field.option-group', 'Option')));
        var vals = g.values || [];
        if (isColour && vals.length) {
          label.appendChild(document.createTextNode(zh ? '：' : ': '));
          label.appendChild(el('span', 'pdp-variant__colour-name', esc(valueOf(api, vals[0].label))));
        }
        head.appendChild(label);
        if (!isColour && m.sizeGuide && !guideUsed) head.insertAdjacentHTML('beforeend', guideBtn());
        row.appendChild(head);
        var opts = el('div', 'pdp-variant__opts ' + (isColour ? 'pdp-variant__opts--swatches' : 'pdp-variant__opts--sizes'));
        opts.setAttribute('role', 'radiogroup');
        opts.setAttribute('aria-label', valueOf(api, g.name));
        vals.forEach(function (v, vi) {
          var text = valueOf(api, v.label);
          var b;
          if (isColour) {
            b = el('button', 'pdp-swatch' + (vi === 0 ? ' is-selected' : ''), '<span class="pdp-swatch__fill" aria-hidden="true"></span>');
            b.setAttribute('style', swatchStyle(v.hex));
            b.setAttribute('title', text);
            b.setAttribute('aria-checked', vi === 0 ? 'true' : 'false');
          } else {
            b = el('button', 'pdp-size-chip', '<span class="pdp-size-chip__label">' + esc(text) + '</span>');
            b.setAttribute('aria-checked', 'false');
          }
          b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
          opts.appendChild(b);
        });
        row.appendChild(opts);
        vs.appendChild(row);
      });
      buy.appendChild(vs);
    }
    if (m.sizeGuide && !guideUsed) {
      var lone = el('div', 'pdp-variant pdp-variant--reflone', guideBtn());
      buy.appendChild(lone);
    }

    /* 購買列：數量（售完不畫）＋加入購物車（售完＝已售完、disabled）＋收藏 */
    var actions = el('div', 'pdp-buy__actions');
    var ctaKey = soldOut ? 'fpp.cta.soldout' : 'fpp.cta.add';
    var ctaFb = soldOut ? 'Sold out' : 'Add to cart';
    actions.innerHTML =
      (soldOut ? '' :
        '<div class="pdp-qty" data-qty>' +
          '<button class="pdp-qty__btn" type="button" data-qty-dec data-pp-inert tabindex="-1" aria-label="' + esc(T('fpp.qty.dec', 'Decrease quantity')) + '">' + SVG.minus + '</button>' +
          '<span class="pdp-qty__val" data-qty-val>1</span>' +
          '<button class="pdp-qty__btn" type="button" data-qty-inc data-pp-inert tabindex="-1" aria-label="' + esc(T('fpp.qty.inc', 'Increase quantity')) + '">' + SVG.plus + '</button>' +
        '</div>') +
      '<button class="btn btn--mono btn--lg pdp-buy__add" type="button" data-pdp-add data-pp-inert tabindex="-1"' + (soldOut ? ' disabled' : '') + '>' +
        '<span class="pdp-buy__add-glyph" aria-hidden="true">' + SVG.cart + '</span><span data-add-label data-i18n="' + ctaKey + '">' + esc(T(ctaKey, ctaFb)) + '</span></button>' +
      '<button class="pdp-buy__heart" type="button" data-pdp-wish data-pp-inert tabindex="-1" aria-pressed="false" aria-label="' + esc(T('fep.wish', 'Add to wishlist')) + '">' + SVG.heart + '</button>';
    buy.appendChild(actions);

    /* 交付方式一行（前台 pdp-delivery）：實體＝物流配送／現場 QR 領取、數位＝購買後即時下載 */
    if (m.delivery) {
      var dl = el('div', 'pdp-delivery'); dl.setAttribute('data-fpp-delivery', '');
      var icon = m.delivery.icon === 'download' ? '<i data-lucide="download" class="ztor-icon"></i>' : SVG.truck;
      dl.innerHTML = '<span class="pdp-delivery__icon" aria-hidden="true">' + icon + '</span>' +
        '<span class="pdp-delivery__text"' + (m.delivery.key ? ' data-i18n="' + esc(m.delivery.key) + '"' : '') + '>' +
        esc(m.delivery.key ? T(m.delivery.key, m.delivery.fallback || '') : (m.delivery.fallback || '')) + '</span>';
      buy.appendChild(dl);
    }

    grid.appendChild(buy);
    container.appendChild(grid);
    page.appendChild(container);

    /* ── 商品詳情：描述（lead）＋ 左：規格 dl ／ 右：取貨與退換 ── */
    var details = el('section', 'pdp-details');
    details.setAttribute('aria-label', T('fpp.details.label', 'Product details'));
    var inner = el('div', 'pdp-details__inner container');
    var h2 = el('h2', 'pdp-details__heading'); h2.setAttribute('data-i18n', 'fpp.sec.details'); h2.textContent = T('fpp.sec.details', 'Product details');
    inner.appendChild(h2);
    inner.appendChild(slot(api, 'p', 'pdp-details__lead', m.desc, T('cp.pv.desc', 'Missing: description')));

    var cols = el('div', 'pdp-details__cols');
    var left = el('div', 'pdp-details__left');
    var specs = m.specs || [];
    if (specs.length) {
      var sb = el('div', 'pdp-details__specs-block'); sb.setAttribute('data-fpp-specs', '');
      sb.innerHTML = '<h3 class="pdp-details__sub-heading" data-i18n="fpp.sec.specs">' + esc(T('fpp.sec.specs', 'Specifications')) + '</h3>';
      var dlist = el('dl', 'pdp-specs');
      specs.forEach(function (s) {
        var r = el('div', 'pdp-specs__row');
        r.appendChild(slot(api, 'dt', '', s.k, T('pp.mock.spec-pending', 'To be confirmed')));
        r.appendChild(slot(api, 'dd', '', s.v, T('pp.mock.spec-pending', 'To be confirmed')));
        dlist.appendChild(r);
      });
      sb.appendChild(dlist);
      left.appendChild(sb);
    }
    cols.appendChild(left);
    var right = el('div', 'pdp-details__right');
    if (m.returns && valueOf(api, m.returns)) {
      var rb = el('div', 'pdp-details__shipping-block'); rb.setAttribute('data-fpp-returns', '');
      rb.innerHTML = '<h3 class="pdp-details__sub-heading" data-i18n="fpp.sec.returns">' + esc(T('fpp.sec.returns', 'Pickup & returns')) + '</h3>';
      rb.appendChild(slot(api, 'p', 'pdp-details__shipping-text', m.returns, ''));
      right.appendChild(rb);
    }
    cols.appendChild(right);
    inner.appendChild(cols);
    details.appendChild(inner);
    page.appendChild(details);

    /* ── 你可能也喜歡：四張卡、全部標「非本商品」（同活動頁相關活動的佔位作法） ── */
    if (m.related) {
      var rs = el('section', 'pdp-recs'); rs.setAttribute('aria-label', T('fpp.sec.related', 'You may also like'));
      var rin = el('div', 'pdp-recs__inner container');
      rin.innerHTML = '<h2 class="pdp-recs__heading" data-i18n="fpp.sec.related">' + esc(T('fpp.sec.related', 'You may also like')) + '</h2>';
      var rrail = el('div', 'pdp-recs__rail');
      var items = Array.isArray(m.related) ? m.related.slice(0, 4) : [null, null, null, null];
      items.forEach(function (r) {
        var a = el('a', 'pdp-rec-card'); a.setAttribute('data-pp-inert', '');
        var md = el('div', 'pdp-rec-card__media' + (r && r.img ? '' : ' pdp-rec-card__media--empty'));
        md.innerHTML = (r && r.img ? mediaTag({ src: r.img, kind: 'image' }, '', r.name) : '<i data-lucide="image" class="ztor-icon"></i>') +
          '<span class="rf-flag rf-flag--limited" data-i18n="fpp.related.badge">' + esc(T('fpp.related.badge', 'Not this item')) + '</span>';
        a.appendChild(md);
        var bd = el('div', 'pdp-rec-card__body');
        var priceStr = r ? (r.priceObj ? fmtNum(api, numOf(api, r.priceObj, null)) : (r.price || '')) : '';
        bd.innerHTML = '<span class="pdp-rec-card__cat">' + esc(r ? (r.cat || '') : T('fep.related.note', 'Placeholder')) + '</span>' +
          '<h3 class="pdp-rec-card__title">' + esc(r ? r.name : T('fpp.related.badge', 'Not this item')) + '</h3>' +
          '<span class="pdp-rec-card__price">' + esc(priceStr || '—') + '</span>';
        a.appendChild(bd);
        rrail.appendChild(a);
      });
      rin.appendChild(rrail);
      rs.appendChild(rin);
      page.appendChild(rs);
    }

    pdp.appendChild(page);

    /* 手機底部購買列（≤768 才顯示）：保留結構、不動作 */
    var buybar = el('div', 'shop-buybar'); buybar.setAttribute('data-buybar', ''); buybar.setAttribute('aria-hidden', 'true');
    buybar.innerHTML = '<div class="shop-buybar__info"><span class="shop-buybar__name">' + esc(nameText) + '</span><span class="shop-buybar__price">' + esc(nowEl.textContent) + '</span></div>' +
      '<button class="btn btn--mono shop-buybar__add pdp-buy__add" type="button" data-pdp-add data-pp-inert tabindex="-1"' + (soldOut ? ' disabled' : '') + '>' + esc(T(ctaKey, ctaFb)) + '</button>';
    pdp.appendChild(buybar);

    section.appendChild(pdp);
    main.appendChild(section);
    root.appendChild(main);
    host.appendChild(root);
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    return root;
  }

  window.ztorFanProductPage = { render: render };
})();
