/* fan-bundle-page.js — 粉絲視角組合包頁的渲染函式（D310 組合側，2026-09-23）
 *
 * 建立組合按「下一步：預覽」後進入的「預覽與發布」全頁畫面（js/publish-stage.js，D310／D321），
 * 主區要畫「粉絲視角完整組合包頁」。活動那一支是 js/fan-event-page.js、商品那一支是 js/fan-product-page.js；
 * 本檔是組合包版，API 形狀與寫法照抄它們：宿主把資料整理成一個 `model` 交給本檔畫，
 * 本檔只知道「粉絲頁長什麼樣」，不知道資料從哪來。
 *
 * ── 鏡像來源（2026-09-23 讀前台原始碼，未開瀏覽器）──
 *   前台 https://ztor.vercel.app/shop-item.html 的兩個組合分支，assets/shop-detail-render.js：
 *   · 純商品套組（type 'bundle'）：renderBundle()／bundleBuyHtml()／bundlePickerHtml()／bundleContentsHtml()
 *   · 含票券組合（type 'eventset'）：renderEventSet()／setCrumbsHtml()／setBuyHtml()／setTiersHtml()／
 *     setContentsHtml()／setPerksHtml()（價格與可售由 bundleResolve() 推）
 *   CSS 是前台 components.css?v=20260922j 同名規則加 `.fep-shop` 前綴（ds-components/fan-shop.css 第 5 段），
 *   第 1–4 段與活動頁、商品頁共用。與前台的差別只在：
 *   · 資料全部來自建立組合表單（成員、允許票種、每套數量、折扣、可售套數、名稱、說明、權益、素材）
 *   · 前台專有的互動拿掉：加入購物車／購買組合／收藏／數量／選規格／放大一律不動作（data-pp-inert）
 *   · 「你可能也喜歡／相關活動」不畫（2026-09-23 使用者：「你可能也喜歡都移除」）
 *   · 含票券組合的「主辦活動的活動介紹／注意事項／取票／退換票／購票條款」不畫——那是活動自己的內容，
 *     建立活動時已經預覽過；同一個位置改畫本組合自己的說明（前台組合沒有說明欄，見 ASSUMPTIONS）
 *   · 店家／主辦列：宿主給 shop 才畫；原型沒有店家資料時不畫、不編名字
 *   · 前台純商品套組的交付一行（寫死的「現場 QR 領取 · 免運」）與含票券組合的「領取」列不畫：
 *     那是前台示範資料的交付規則，組合在 Creator Studio 沒有對應欄位或規則
 *
 * 用法：
 *   window.ztorFanBundlePage.render(host, model, api)   // 回傳 .fep-shop 根節點
 *
 * model（宿主整理；可翻譯欄位給 `{ key }`，本檔以 api.getValue(key) 取當前語系的值並
 * 交給 api.bindEditable 掛 inline 編輯；非文案的資料值給字串）：
 *   {
 *     kind: 'goods' | 'eventset',                 // 'eventset'＝含活動票券（前台組合頁分支），否則純商品套組
 *     gallery: [{ src, kind:'image'|'video' } | 'src', …],   // 組合自己的素材；第一張＝主圖
 *     name: { key:'name' },
 *     desc: { key:'desc' } | null,                // 說明；留空＝整段不畫
 *     shop: { name, avatar } | null,              // 店家（goods）／主辦（eventset）列；null＝不畫
 *     event: {                                    // eventset 才有：票券成員所屬活動
 *       name, typeLabel, date, time, venue, online:false, img,
 *       status: { label, tone:'green'|'yellow'|'cat' }
 *     } | null,
 *     members: [
 *       { kind:'ticket', qty:2, tiers:[{ id, name, priceObj, left }] },   // tiers＝允許票種（>1＝粉絲任選一種）
 *       { kind:'product', name:'Tee', img:'images/…', qty:1, priceObj, from:false,
 *         options:[{ name:'尺寸', values:['S','M'] }] }                   // options＝多選項商品的選項組（粉絲購買時選）
 *     ],
 *     price: {
 *       priceObj, priceKey,                       // 組合售價（最低組合的售價）；priceKey 讓點價格開價格表
 *       wasObj,                                   // 原價合計（單買加總，最低組合）；只換算、不可覆寫
 *       from: false,                              // 粉絲的選擇會改變價格（多票種或多規格價差）→ 加「起」
 *       pct: 0                                    // 組合折扣 %（票種價差也照這個 % 打折，見 tierRows）
 *     },
 *     stock: null | 12,                           // 可售套數；null＝不限。前台只在 ≤10 時提示、0＝售完
 *     perks: [{ key:'perk-0' }, …]                // 組合專屬權益（每行一項，可翻譯）
 *   }
 *
 * 價格節點帶 `data-fep-price-key`（沿用活動頁的屬性名：js/publish-stage.js 認這個屬性把價格表滑出來，
 * D310「價格不就地改」），另掛 `data-fbp-price-key` 標明是組合頁的價格節點。
 * 可給 editZones 選的區塊：[data-fbp-gallery]、.pdp-buy__title、[data-fbp-meta]、[data-fbp-price]、
 * [data-fbp-stock]、[data-fbp-picker]、[data-fbp-tiers]、[data-fbp-members]、[data-fbp-perks]、[data-fbp-desc]。
 *
 * api（由 js/publish-stage.js 的 previewRender 提供，與活動頁／商品頁同介面）：
 *   lang；getValue(key)；bindEditable(el, key)；priceIn(priceObj, priceKey)；money(priceObj, priceKey)；fmt(n)。
 *
 * 依賴 CSS：ds-components/fan-shop.css（第 1–3 段共用、第 4 段商品頁的價格／數量／庫存、第 5 段組合包頁）；
 * 宿主頁另需 publish-stage.css。
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

  /* 前台金額格式「NT$ 1,200」（符號後一個空格）；events-store 的 fmtMoney 給「NT$1,200」，這裡只補空格（同商品頁） */
  function spaced(s) { return String(s == null ? '' : s).replace(/^([^\d\s]+)(\d)/, '$1 $2'); }
  function numOf(api, po, key) { return api.priceIn ? api.priceIn(po, key || null) : 0; }
  function fmtNum(api, n) { return spaced(api.fmt ? api.fmt(n) : String(n)); }
  /* 基準幣別的一筆差額換成當前幣別（票種價差用）：不掛 key＝只換算、不吃覆寫 */
  function convert(api, base, amount) { return numOf(api, { base: base, amount: amount, override: {} }, null); }

  /* 可翻譯 slot：同 fan-event-page.js／fan-product-page.js */
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

  /* 前台 inline svg：照抄商品頁那一份（形狀要一模一樣） */
  var SVG = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle><path d="M2.5 3h2l2.2 12.3a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 7H6"></path></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2M11 8v6M8 11h6"></path></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"></path></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>'
  };

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
  var CRUMB_SEP = '<span class="page-head__crumb-sep" aria-hidden="true">›</span>';
  function times(n) { return n > 1 ? ' × ' + n : ''; }
  function listJoin(arr, zh) { return arr.join(zh ? '、' : ', '); }

  /* 成員的一句話（前台 setPartsRows）：商品＝名稱（規格下單時選）× n；票券＝票種（任選時列全部＋座位下單時選）× n */
  function partText(mb) {
    if (mb.kind === 'product') return (mb.name || '') + ((mb.options || []).length ? T('fep.bd.spec', ' (pick options at checkout)') : '') + times(mb.qty);
    var names = (mb.tiers || []).map(function (t) { return t.name; });
    if (names.length > 1) return names.join('／') + T('fep.bd.pick', ' (pick a section at checkout)') + times(mb.qty);
    return (names[0] || '') + times(mb.qty);
  }

  /* ── 主體 ─────────────────────────────────────────────────────── */
  function render(host, model, api) {
    host.innerHTML = '';
    var m = model || {};
    var isSet = m.kind === 'eventset';
    var ev = isSet ? (m.event || {}) : null;
    var zh = /^zh/.test(api.lang || '');
    var nameText = valueOf(api, m.name);
    var members = m.members || [];
    var tixMember = members.filter(function (x) { return x.kind === 'ticket'; })[0] || null;
    var goods = members.filter(function (x) { return x.kind === 'product'; });
    var perks = (m.perks || []).filter(function (p) { return valueOf(api, p); });

    var root = el('div', 'fep-shop rf-shop');
    root.setAttribute('data-fbp-view', isSet ? 'eventset' : 'bundle');
    root.setAttribute('lang', api.lang === 'zh' ? 'zh-Hant' : (api.lang || 'en'));

    var main = el('main');
    var section = el('section', 'section section-bg-page section--flush-top');
    var pdp = el('div', 'pdp');
    pdp.setAttribute('data-pdp', ''); pdp.setAttribute('aria-busy', 'false'); pdp.setAttribute('data-type', isSet ? 'eventset' : 'bundle');

    /* 手機頂欄（≤768 才顯示）：保留結構，不可點（同商品頁） */
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

    /* 麵包屑：純商品套組＝商店 › 名稱（前台 crumbsHtml；組合沒有商品分類，中段不畫）；
       含票券組合＝活動 › 活動型態 › 活動名 › 組合名（前台 setCrumbsHtml） */
    var crumb = el('nav', 'page-head__crumbs');
    crumb.setAttribute('aria-label', T('fep.crumb.label', 'Breadcrumb'));
    crumb.innerHTML = isSet
      ? '<a data-pp-inert data-i18n="fep.crumb.events">' + esc(T('fep.crumb.events', 'Events')) + '</a>' + CRUMB_SEP +
        (ev.typeLabel ? '<span>' + esc(ev.typeLabel) + '</span>' + CRUMB_SEP : '') +
        (ev.name ? '<a data-pp-inert>' + esc(ev.name) + '</a>' + CRUMB_SEP : '')
      : '<a data-pp-inert data-i18n="fpp.crumb.shop">' + esc(T('fpp.crumb.shop', 'Shop')) + '</a>' + CRUMB_SEP;
    var cur = el('span', 'page-head__crumb-cur'); cur.setAttribute('aria-current', 'page');
    cur.textContent = nameText || T('cpp.bd.untitled.ev', 'Untitled bundle');
    crumb.appendChild(cur);
    container.appendChild(crumb);

    var grid = el('div', 'pdp__grid');

    /* ── 圖庫：組合自己的素材（前台 galleryHtml；結構同商品頁） ── */
    var media = (m.gallery || []).map(mediaOf).filter(Boolean);
    var gallery = el('div', 'pdp-gallery'); gallery.setAttribute('data-pdp-gallery', ''); gallery.setAttribute('data-fbp-gallery', '');
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

    /* ── 價格（前台 priceBlock：現價〔起〕＋原價劃線＋省多少）── */
    var P = m.price || {};
    var nowN = P.priceObj ? numOf(api, P.priceObj, P.priceKey) : null;
    var wasN = P.wasObj ? numOf(api, P.wasObj, null) : null;
    function priceBox() {
      var box = el('div', 'pdp-price'); box.setAttribute('data-fbp-price', '');
      var now = el('span', 'pdp-price__now');
      if (nowN == null) { now.classList.add('is-empty'); now.textContent = fmtNum(api, 0); }
      else {
        var s = fmtNum(api, nowN);
        now.textContent = P.from ? T('fpp.price.from', 'From {price}').replace('{price}', s) : s;
        /* D310：點價格開右側價格表（價格不就地改）；publish-stage 認 data-fep-price-key */
        now.setAttribute('data-fep-price-key', P.priceKey || '');
        now.setAttribute('data-fbp-price-key', P.priceKey || '');
      }
      box.appendChild(now);
      if (nowN != null && wasN != null && wasN > nowN) {
        box.appendChild(el('span', 'pdp-price__was', esc(T('fpp.price.was', 'Was {price}').replace('{price}', fmtNum(api, wasN)))));
        box.appendChild(el('span', 'pdp-price__save', esc(T('fpp.price.save', 'Save {amt}').replace('{amt}', fmtNum(api, wasN - nowN)))));
      }
      return box;
    }

    /* 可售套數（前台 stockLineHtml 同規則）：不限＝不顯示、≤10 才提示、0＝交給 CTA 的售完態 */
    var STOCK_LOW_AT = 10;
    var stockN = m.stock == null || m.stock === '' ? null : Number(m.stock);
    var soldOut = stockN != null && !isNaN(stockN) && stockN <= 0;
    function stockLine() {
      if (stockN == null || isNaN(stockN) || stockN <= 0 || stockN > STOCK_LOW_AT) return null;
      var st = el('p', 'pdp-stock'); st.setAttribute('data-fbp-stock', '');
      st.textContent = T('fbp.stock.left', 'Only {n} sets left').replace('{n}', stockN);
      return st;
    }

    /* 店家列（goods，前台 shopHostHtml）／主辦列（eventset，前台 hostHtml）：宿主有資料才畫 */
    function hostRow() {
      if (!(m.shop && m.shop.name)) return null;
      var a = el('a', 'pdp-host' + (isSet ? '' : ' pdp-host--shop')); a.setAttribute('data-pp-inert', '');
      var avatar = m.shop.avatar
        ? '<img class="pdp-host__avatar" src="' + esc(m.shop.avatar) + '" alt="">'
        : '<span class="pdp-host__avatar pdp-host__avatar--initial" aria-hidden="true">' + esc(String(m.shop.name).trim().charAt(0).toUpperCase()) + '</span>';
      a.innerHTML = avatar + (isSet
        ? '<span class="pdp-host__text"><span class="pdp-host__k" data-i18n="fep.organizer">' + esc(T('fep.organizer', 'Organizer')) + '</span><span class="pdp-host__name">' + esc(m.shop.name) + '</span></span>'
        : '<span class="pdp-host__name-row"><span class="pdp-host__name">' + esc(m.shop.name) + '</span></span>') +
        '<span class="pdp-host__more" data-i18n="fep.host.more">' + esc(T('fep.host.more', 'Visit creator shop ›')) + '</span>';
      return a;
    }

    var buy = el('div', 'pdp-buy');
    var ctaText = '';
    if (!isSet) {
      /* ── 純商品套組的購買欄（前台 bundleBuyHtml）── */
      var meta = el('div', 'pdp-buy__meta');
      meta.appendChild(el('span', 'pdp-buy__badge status-tag status-tag--yellow', esc(T('fep.bd.tag', 'Bundle'))));
      buy.appendChild(meta);
      buy.appendChild(slot(api, 'h1', 'pdp-buy__title', m.name, T('cpp.bd.untitled.ev', 'Untitled bundle')));
      var hr = hostRow(); if (hr) buy.appendChild(hr);
      buy.appendChild(priceBox());
      var sl = stockLine(); if (sl) buy.appendChild(sl);
      /* 購買欄內的規格選擇（前台 bundlePickerHtml）：每個多選項成員的每個選項組一列 chip，不預選 */
      var pickRows = [];
      goods.forEach(function (g, gi) {
        (g.options || []).forEach(function (o) {
          var row = el('div', 'pdp-variant'); row.setAttribute('data-variant', 'size'); row.setAttribute('data-crow', String(gi));
          row.innerHTML = '<div class="pdp-variant__header"><span class="pdp-variant__label">' + esc(o.name) + '</span></div>';
          var opts = el('div', 'pdp-variant__opts'); opts.setAttribute('role', 'radiogroup'); opts.setAttribute('aria-label', o.name || '');
          (o.values || []).forEach(function (v) {
            var b = el('button', 'pdp-chip', esc(v));
            b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
            opts.appendChild(b);
          });
          row.appendChild(opts);
          pickRows.push(row);
        });
      });
      if (pickRows.length) {
        var picker = el('div', 'pdp-variants pdp-bundle-picker'); picker.setAttribute('data-bundle-picker', ''); picker.setAttribute('data-fbp-picker', '');
        pickRows.forEach(function (r) { picker.appendChild(r); });
        buy.appendChild(picker);
      }
      /* 主鈕（前台：有東西要選＝「選擇你的組合」、沒有＝「加入套組」，都帶右箭頭；售完＝已售完） */
      var ctaKey = soldOut ? 'fpp.cta.soldout' : (pickRows.length ? 'fbp.cta.choose' : 'fbp.cta.add');
      ctaText = T(ctaKey, soldOut ? 'Sold out' : (pickRows.length ? 'Choose your set' : 'Add set to cart'));
      var actions = el('div', 'pdp-buy__actions');
      actions.innerHTML =
        (soldOut ? '' :
          '<div class="pdp-qty" data-qty>' +
            '<button class="pdp-qty__btn" type="button" data-qty-dec data-pp-inert tabindex="-1" aria-label="' + esc(T('fpp.qty.dec', 'Decrease quantity')) + '">' + SVG.minus + '</button>' +
            '<span class="pdp-qty__val" data-qty-val>1</span>' +
            '<button class="pdp-qty__btn" type="button" data-qty-inc data-pp-inert tabindex="-1" aria-label="' + esc(T('fpp.qty.inc', 'Increase quantity')) + '">' + SVG.plus + '</button>' +
          '</div>') +
        '<button class="btn btn--mono btn--lg pdp-buy__add" type="button" data-bundle-open data-pp-inert tabindex="-1"' + (soldOut ? ' disabled' : '') + '>' +
          '<span data-add-label data-i18n="' + ctaKey + '">' + esc(ctaText) + '</span><span class="pdp-buy__add-glyph pdp-buy__add-chev" aria-hidden="true">' + SVG.chev + '</span></button>' +
        '<button class="pdp-buy__heart" type="button" data-pdp-wish data-pp-inert tabindex="-1" aria-pressed="false" aria-label="' + esc(T('fep.wish', 'Add to wishlist')) + '">' + SVG.heart + '</button>';
      buy.appendChild(actions);
    } else {
      /* ── 含票券組合的購買欄（前台 setBuyHtml）── */
      var meta2 = el('div', 'pdp-buy__meta');
      if (ev.status && ev.status.label) {
        var tone = ev.status.tone === 'green' ? 'status-tag--green' : (ev.status.tone === 'yellow' ? 'status-tag--yellow' : 'status-tag--cat');
        meta2.appendChild(el('span', 'pdp-buy__badge status-tag ' + tone, esc(ev.status.label)));
      }
      meta2.appendChild(el('span', 'pdp-buy__badge status-tag status-tag--cat', esc(T('fep.bd.tag', 'Bundle'))));
      if (ev.typeLabel) meta2.appendChild(el('span', 'pdp-buy__badge status-tag status-tag--cat', esc(ev.typeLabel)));
      buy.appendChild(meta2);
      if (ev.name) {
        var kicker = el('a', 'pdp-buy__kicker pdp-set__host', esc(ev.name + ' ›'));
        kicker.setAttribute('data-pp-inert', '');
        buy.appendChild(kicker);
      }
      buy.appendChild(slot(api, 'h1', 'pdp-buy__title', m.name, T('cpp.bd.untitled.ev', 'Untitled bundle')));
      var hr2 = hostRow(); if (hr2) buy.appendChild(hr2);
      /* 活動資訊框（前台 pdp-event-meta）：內容／日期／時間／場館／領取／專屬權益 */
      var box = el('div', 'pdp-event-meta'); box.setAttribute('data-fbp-meta', '');
      function metaRow(k, v, mod) {
        if (!v) return;
        box.appendChild(el('div', 'pdp-event-meta__row' + (mod ? ' ' + mod : ''),
          '<span class="pdp-event-meta__k">' + esc(k) + '</span><span>' + esc(v) + '</span>'));
      }
      metaRow(T('fbp.meta.contents', 'Includes'), members.map(partText).join(' ＋ '), 'pdp-event-meta__row--names');
      metaRow(T('fep.date', 'Date'), ev.date || '');
      metaRow(T('fep.time', 'Time'), ev.time ? T('fbp.meta.starts', '{t} start').replace('{t}', ev.time) : '');
      if (ev.online) metaRow(T('fep.venue', 'Venue'), T('fbp.meta.online', 'Live online'));
      else metaRow(T('fep.venue', 'Venue'), ev.venue || '', 'pdp-event-meta__row--names');
      /* 前台這裡還有一列「領取：商品於活動現場憑 QR 領取」（含商品時）——那是前台示範資料的交付規則，
         Creator Studio 的組合沒有這條規則，不照抄（不在預覽裡替產品訂規則） */
      if (perks.length) metaRow(T('fbp.meta.perks', 'Perks'), perks.map(function (p) { return valueOf(api, p); }).join(' · '), 'pdp-event-meta__row--names');
      buy.appendChild(box);
      buy.appendChild(priceBox());
      var sl2 = stockLine(); if (sl2) buy.appendChild(sl2);
      ctaText = soldOut ? T('fbp.cta.unavailable', 'Unavailable') : T('fep.cta.bundle.buy', 'Buy bundle');
      var actions2 = el('div', 'pdp-buy__actions');
      actions2.innerHTML =
        '<button class="btn btn--mono btn--lg pdp-buy__add" type="button" data-bundle-buy="0" data-pp-inert tabindex="-1"' + (soldOut ? ' disabled' : '') + '>' +
          '<span data-add-label>' + esc(ctaText) + '</span></button>' +
        (soldOut ? '' : '<button class="pdp-buy__cart" type="button" data-bundle-cart="0" data-pp-inert tabindex="-1" aria-label="' + esc(T('fep.cart.add', 'Add to cart')) + '">' + SVG.cart + '</button>') +
        '<button class="pdp-buy__heart" type="button" data-pdp-wish data-pp-inert tabindex="-1" aria-pressed="false" aria-label="' + esc(T('fep.wish', 'Add to wishlist')) + '">' + SVG.heart + '</button>';
      buy.appendChild(actions2);
    }
    grid.appendChild(buy);
    container.appendChild(grid);

    /* ── 座位區域（前台 setTiersHtml）：允許票種 >1 才有；每列＝該票種的組合價
       （組合價＝最低組合售價＋票種價差 × 每套張數 × (1 − 組合折扣 %)，同表單「粉絲看到的」卡的算法）── */
    function tierRows() {
      if (!tixMember || (tixMember.tiers || []).length < 2) return null;
      var tiers = tixMember.tiers, q = tixMember.qty || 1, pct = Number(P.pct) || 0;
      var minBase = Math.min.apply(null, tiers.map(function (t) { return Number(t.priceObj && t.priceObj.amount) || 0; }));
      var secT = el('section', 'pdp-bundle pdp-bundle--tiers'); secT.setAttribute('data-fbp-tiers', '');
      secT.setAttribute('aria-label', T('fbp.sec.tiers', 'Seat sections · pick one'));
      secT.innerHTML = '<h2 class="pdp-bundle__title">' + esc(T('fbp.sec.tiers', 'Seat sections · pick one')) + '</h2>';
      var list = el('div', 'pdp-tiers pdp-tiers--info'); list.setAttribute('role', 'list');
      tiers.forEach(function (t) {
        var dis = t.left != null && t.left < q;
        var tierN = numOf(api, t.priceObj, null);
        var base = (t.priceObj && t.priceObj.base) || (P.priceObj && P.priceObj.base);
        var delta = ((Number(t.priceObj && t.priceObj.amount) || 0) - minBase) * q * (1 - pct / 100);
        var rowN = nowN == null ? null : nowN + convert(api, base, delta);
        var bits = [esc(T('fbp.tier.price', 'Ticket {price}').replace('{price}', fmtNum(api, tierN)))];
        if (!dis && t.left != null && t.left <= Math.max(5, Math.ceil((t.qty || t.left) * 0.1))) bits.push('<em class="pdp-tier__low">' + esc(T('fbp.tier.left', '{n} left').replace('{n}', t.left)) + '</em>');
        var row = el('div', 'pdp-tier pdp-tier--info' + (dis ? ' is-oos' : ''));
        row.setAttribute('role', 'listitem');
        row.innerHTML = '<span class="pdp-tier__main"><span class="pdp-tier__label">' + esc(t.name) + '</span><span class="pdp-tier__meta">' + bits.join(' · ') + '</span></span>' +
          '<span class="pdp-tier__price">' + esc(rowN == null ? '—' : fmtNum(api, rowN)) + '</span>' +
          '<button class="btn btn--yellow-ghost btn--sm pdp-tier__buy" type="button" data-pp-inert tabindex="-1"' + (dis ? ' disabled' : '') + '>' +
            esc(dis ? T('fep.tier.soldout', 'Sold out') : T('fep.cta.bundle.buy', 'Buy bundle')) + '</button>';
        list.appendChild(row);
      });
      secT.appendChild(list);
      return secT;
    }

    /* ── 套組內容（前台 bundleContentsHtml／setContentsHtml）：一個成員一張卡 ── */
    function contents() {
      if (!members.length) return null;
      var n = members.reduce(function (a, x) { return a + (x.qty || 1); }, 0);
      var secC = el('section', 'pdp-bundle' + (isSet ? ' pdp-bundle--set' : '')); secC.setAttribute('data-fbp-members', '');
      secC.setAttribute('aria-label', T('fbp.sec.contents.label', 'What’s in the set'));
      secC.innerHTML = '<h2 class="pdp-bundle__title">' + esc(T('fbp.sec.contents', 'What’s in the set · {n} items').replace('{n}', n)) + '</h2>';
      var g = el('div', 'pdp-bundle__grid');
      members.forEach(function (mb) {
        var img = mb.kind === 'ticket' ? (ev && ev.img) || '' : (mb.img || '');
        var name, spec, link;
        if (mb.kind === 'product') {
          name = (mb.name || '') + times(mb.qty);
          var single = fmtNum(api, numOf(api, mb.priceObj, null) * (mb.qty || 1));
          spec = [
            (mb.options || []).length ? T('fbp.spec.pick', '{opts} chosen at checkout').replace('{opts}', listJoin(mb.options.map(function (o) { return o.name; }), zh)) : '',
            T('fbp.spec.single', '{price} on its own').replace('{price}', mb.from ? T('fpp.price.from', 'From {price}').replace('{price}', single) : single)
          ].filter(Boolean).join(' · ');
          link = T('fbp.link.item', 'View item');
        } else {
          var tiers = mb.tiers || [], q = mb.qty || 1;
          var when = ev ? [ev.date, ev.online ? T('fbp.meta.online', 'Live online') : ev.venue].filter(Boolean).join(' · ') : '';
          var prices = tiers.map(function (t) { return numOf(api, t.priceObj, null) * q; });
          var lo = prices.length ? Math.min.apply(null, prices) : 0, hi = prices.length ? Math.max.apply(null, prices) : 0;
          name = tiers.map(function (t) { return t.name; }).join('／') + times(q);
          spec = [tiers.length > 1 ? T('fbp.tier.any', 'Pick one') : '', when,
            T('fbp.spec.single', '{price} on its own').replace('{price}', fmtNum(api, lo) + (hi > lo ? '–' + fmtNum(api, hi).replace(/^[^\d]+/, '') : ''))].filter(Boolean).join(' · ');
          link = T('fbp.link.event', 'View event');
        }
        var tile = el('div', 'pdp-bundle-item');
        tile.innerHTML =
          '<div class="pdp-bundle-item__media' + (img ? '' : ' pdp-bundle-item__media--empty') + '">' +
            (img ? '<img class="pdp-bundle-item__img" src="' + esc(img) + '" alt="" loading="lazy">' : '<i data-lucide="' + (mb.kind === 'ticket' ? 'ticket' : 'package') + '" class="ztor-icon"></i>') + '</div>' +
          '<div class="pdp-bundle-item__body"><h3 class="pdp-bundle-item__name">' + esc(name) + '</h3>' +
            (spec ? '<span class="pdp-bundle-item__spec">' + esc(spec) + '</span>' : '') +
            '<a class="pdp-bundle-item__link" data-pp-inert>' + esc(link) + '<span aria-hidden="true"> ›</span></a></div>';
        g.appendChild(tile);
      });
      secC.appendChild(g);
      return secC;
    }

    /* ── 組合專屬權益（前台 setPerksHtml）：一行一項；圖示走站上 lucide（第 3 段 .ds-icon 補丁）── */
    function perksSection() {
      if (!(m.perks || []).length) return null;
      var secP = el('section', 'pdp-bundle pdp-perks'); secP.setAttribute('data-fbp-perks', '');
      secP.setAttribute('aria-label', T('fbp.sec.perks.label', 'Bundle perks'));
      secP.innerHTML = '<h2 class="pdp-bundle__title">' + esc(T('fbp.sec.perks', 'Bundle perks · {n}').replace('{n}', m.perks.length)) + '</h2>';
      var ul = el('ul', 'pdp-perks__list');
      m.perks.forEach(function (p) {
        var li = el('li', 'pdp-perks__item');
        li.innerHTML = '<span class="ds-icon pdp-perks__icon" aria-hidden="true"><i data-lucide="gift" class="ztor-icon"></i></span>';
        var txt = el('span', 'pdp-perks__text');
        txt.appendChild(slot(api, 'b', 'pdp-perks__title', p, ''));
        li.appendChild(txt);
        ul.appendChild(li);
      });
      secP.appendChild(ul);
      return secP;
    }

    /* ── 說明（組合自己的說明欄）：前台商品套組放 .pdp-details 的 lead、含票券組合的同位置是活動介紹，
       這裡兩種都畫成同一個 .pdp-details（標題「組合介紹」）；留空＝整段不畫 ── */
    function details() {
      if (!m.desc) return null;
      var d = el('section', 'pdp-details'); d.setAttribute('data-fbp-desc', '');
      d.setAttribute('aria-label', T('fbp.sec.about', 'About this bundle'));
      var inner = el('div', 'pdp-details__inner container');
      var h2 = el('h2', 'pdp-details__heading'); h2.setAttribute('data-i18n', 'fbp.sec.about'); h2.textContent = T('fbp.sec.about', 'About this bundle');
      inner.appendChild(h2);
      inner.appendChild(slot(api, 'p', 'pdp-details__lead', m.desc, ''));
      d.appendChild(inner);
      return d;
    }

    function add(parent, node) { if (node) parent.appendChild(node); }
    if (!isSet) {
      /* 前台 renderBundle：container{麵包屑、兩欄、套組內容} → 詳情；權益接在套組內容後（前台套組沒有權益欄） */
      add(container, contents());
      add(container, perksSection());
      page.appendChild(container);
      add(page, details());
    } else {
      /* 前台 renderEventSet：container{麵包屑、兩欄} → （活動詳情的位置＝組合說明）→ container{座位區域、套組內容、權益} */
      page.appendChild(container);
      add(page, details());
      var c2 = el('div', 'container');
      add(c2, tierRows());
      add(c2, contents());
      add(c2, perksSection());
      if (c2.childNodes.length) page.appendChild(c2);
    }
    pdp.appendChild(page);

    /* 手機底部購買列（≤768 才顯示）：保留結構、不動作 */
    var buybar = el('div', 'shop-buybar'); buybar.setAttribute('data-buybar', ''); buybar.setAttribute('aria-hidden', 'true');
    var barPrice = nowN == null ? '' : (P.from ? T('fpp.price.from', 'From {price}').replace('{price}', fmtNum(api, nowN)) : fmtNum(api, nowN));
    buybar.innerHTML = '<div class="shop-buybar__info"><span class="shop-buybar__name">' + esc(nameText) + '</span><span class="shop-buybar__price">' + esc(barPrice) + '</span></div>' +
      '<button class="btn btn--mono shop-buybar__add pdp-buy__add" type="button" data-pp-inert tabindex="-1"' + (soldOut ? ' disabled' : '') + '>' + esc(ctaText) + '</button>';
    pdp.appendChild(buybar);

    section.appendChild(pdp);
    main.appendChild(section);
    root.appendChild(main);
    host.appendChild(root);
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    return root;
  }

  window.ztorFanBundlePage = { render: render };
})();
