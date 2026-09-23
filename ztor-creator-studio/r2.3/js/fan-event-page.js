/* fan-event-page.js — 粉絲視角活動頁的渲染函式（D305，2026-09-22；同日改為前台鏡像）
 *
 * 發布前預覽確認（主規格 §7.4）的預覽檢視自 D305 起是「粉絲視角完整頁」：內容等同粉絲端
 * 活動頁會呈現的全部設定，活動有「票券頁」與「票務商品頁」兩個視圖（沒有組合包時只有
 * 票券頁）。兩個宿主——建立活動（create-event.html 第 8 步，發布前）與活動詳情的「預覽與在地化」
 * 全頁版（event-localization.html，發布後再開；D310 起不是浮層）——都把自己的資料整理成
 * 同一個 `model`，交給本檔畫；
 * 本檔只知道「粉絲頁長什麼樣」，不知道資料從表單還是從 events-store 來。
 *
 * ── 2026-09-22 使用者裁決：「預覽 UI 必須做得和這兩個一模一樣，只是資料和機制套用我們的流程與功能」──
 *   票券頁     https://ztor.vercel.app/shop-item.html?id=ev-score-live
 *   票務商品頁 https://ztor.vercel.app/shop-item.html?id=ev-themesong-night&sets=1#bundles
 * 所以本檔輸出的 DOM 結構與 class 名照前台兩頁渲染後的 <main>（證據：docs/fe-mirror-2026-09-22/
 * ticket.main.html、bundles.main.html），CSS 是前台規則加 `.fep-shop` 前綴的鏡像
 * （ds-components/fan-shop.css）。與前台的差別只在：
 *   · 資料全部來自我們的流程（名稱／亮點／描述／卡司／須知／取票方式／票種／組合包）
 *   · 前台專有的互動拿掉：pdp-topbar 保留 markup 但不可點、「情境展示」浮鈕與 pdp-sheet 抽屜不畫、
 *     購買類按鈕（購票／購買／購買組合／收藏／購物車）不動作（data-pp-inert）
 *   · 相關活動三張卡標「非本活動」（ASSUMPTIONS UIA-165／UIA-167）
 *   · 亮點（D300）前台沒有位置：放名稱下方一行 `.pdp-buy__highlight`（UIA-167）
 *   · 退換票：平台統一文案（2026-09-23 D313 拍板）——不是活動欄位，創作者不填不可改、
 *     也不屬可翻譯欄位；一律吃 i18n `fep.refund.fixed`，預覽裡唯讀、不進 editZones。
 *     `refund` 參數（字串覆蓋／false 不畫）保留為渲染器彈性，活動宿主不使用。
 * 票券頁／票務商品頁的切換控件是 CS 端的 `.segmented`，畫在 `.fep-shop` 外面（它不是粉絲頁的一部分），
 * 頁內另有前台同款的「只買票 ›」。
 *
 * 用法：
 *   window.ztorFanEventPage.render(host, model, api)
 *   window.ztorFanEventPage.relatedFromStore(excludeId, limit)   // 選用：從 events-store 撈其他活動當相關活動
 *
 * model（宿主整理；可翻譯欄位給 `{ key }`，本檔以 api.getValue(key) 取當前語系的值並
 * 掛上 inline 編輯；非文案的資料值給字串）：
 *   {
 *     status: { labelKey, fallback, tone },     // 狀態標記（售票中／即將開賣…），tone＝'badge--success'|'badge--info'|'badge--neutral'|'badge--error'（對應前台 status-tag 色）
 *     typeLabel: '演唱會',                     // 類型標記（純字串，來自類型卡）
 *     region: 'Taiwan',                         // 地區標記
 *     keyvisual: 'images/…' | '',               // 主圖；gallery 沒給時只用它
 *     gallery: ['images/…', …],                 // 圖庫（第一張＝主視覺）；video: true 時多一顆影片縮圖
 *     video: false,
 *     name: { key:'name' },  highlight: { key:'highlight' } | null,
 *     organizer: 'NICKTHEREAL', organizerAvatar: 'images/…' | '',   // 主辦（原型＝創作者顯示名／名冊頭像）
 *     date: '2026-12-05', time: '19:30 – 21:30', duration: '2 h', doors: '18:30',
 *     venue: 'Taipei Music Center', address: '…', language: '繁體中文',
 *     priority: { window: '…', state: '…' } | null,   // 優先購（原型示意）
 *     limit: '每筆最多 4 張' | null,
 *     desc: { key:'desc' },
 *     lineup: [{ name: '周湯豪', role: { key:'role-0' } | null }],
 *     notes: [{ key:'note-0' }], bring: [{ key:'bring-0' }], includes: [{ tag:'餐飲', key:'inc-0' }],
 *     pickup: '電子門票', entryNote: { key:'tp-note' } | null,
 *     refund: undefined | string | false,       // 沒給＝平台固定文案；字串＝自訂；false＝不畫
 *     terms: { key:'tnc' } | null,
 *     tiers: [{ key:'tier-vip', name:{ key:'tier-vip' }, note:'', priceObj, soldOut:false, priceKey:'tier:tier-vip' }],
 *     bundles: [{ name:'…', priceObj, listPriceObj|null, priceKey:'bundle:bd-1', img:'…',
 *                 tickets:{ names:['VIP','Floor'], qty:2 } | null,      // 允許票種 × 張數（D296）
 *                 goods:[{ name:'官方 Tee', spec:true, img:'…' }],       // 商品成員；spec＝有規格要下單時選
 *                 perks:['…'], note:'商品於活動現場領取' | '' , desc:'…',
 *                 contents:[…] }],                                     // 舊形狀（icon/text 列）仍相容，tickets／goods 沒給時退回它
 *     related: true | [{ name, cat, price:'NT$ 1,200 起', img }]   // true＝三張佔位卡；陣列＝指定內容（都標「非本活動」）
 *   }
 *
 * 價格節點帶 `data-fep-price-key`（票價、組合價、購買區的價格區間；區間給空字串＝不聚焦單列）：
 * D310 起「價格不就地改」，宿主（js/publish-stage.js）接這個屬性把價格表滑出來。
 *
 * api（由 js/publish-stage.js 的 previewRender 提供；浮層版 partials/publish-preview.js 同介面）：
 *   lang；getValue(key) → 當前語系的值；bindEditable(el, key) → 掛 inline 編輯；
 *   priceIn(priceObj, priceKey) → 當前幣別的數字；money(priceObj, priceKey) → 格式化字串；fmt(n)；
 *   view：'ticket' | 'bundles'；views：可切的視圖清單；setView(v)。
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

  /* 前台的金額格式是「NT$ 1,200」（符號後一個空格）；events-store 的 fmtMoney 給「NT$1,200」，
     這裡只補空格、不改站上其他頁的格式。 */
  function spaced(s) { return String(s == null ? '' : s).replace(/^([^\d\s]+)(\d)/, '$1 $2'); }
  function moneyOf(api, po, key) { return spaced(api.money(po, key)); }
  function numOf(api, po, key) { return api.priceIn ? api.priceIn(po, key) : 0; }
  function fmtNum(api, n) { return spaced(api.fmt ? api.fmt(n) : String(n)); }
  function rangeText(api, nums) {
    if (!nums.length) return '';
    var lo = Math.min.apply(null, nums), hi = Math.max.apply(null, nums);
    if (lo === hi) return fmtNum(api, lo);
    /* 「NT$ 1,200 – 2,800」：高價那一端不重複符號 */
    var hiStr = fmtNum(api, hi).replace(/^[^\d]+/, '');
    return fmtNum(api, lo) + ' – ' + hiStr;
  }

  /* 可翻譯 slot：值從 api 取、再交給 api 決定要不要開放 inline 編輯。空值畫斜體佔位（CSS ::before）。 */
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

  /* 前台 inline 的 svg（heart／cart／back／zoom／play）：照抄 path，不走 icons.js registry（形狀要一模一樣） */
  var SVG = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle><path d="M2.5 3h2l2.2 12.3a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 7H6"></path></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2M11 8v6M8 11h6"></path></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"></path></svg>'
  };
  /* 前台 .ds-icon 是 mask 圖示（icons/user.svg…）；站上沒有那批 svg，改包 lucide（fan-shop.css 末端關掉 mask） */
  function dsIcon(name) { return '<span class="ds-icon" aria-hidden="true"><i data-lucide="' + name + '" class="ztor-icon"></i></span>'; }

  function imgTag(src, cls, alt) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">';
  }
  function thumbBtn(src, i, active) {
    var b = el('button', 'pdp-gallery__thumb' + (active ? ' is-active' : '') + (src ? '' : ' pdp-gallery__thumb--empty'));
    b.type = 'button'; b.setAttribute('data-thumb', String(i)); b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
    b.setAttribute('aria-label', T('fep.gallery.view', 'View image {n}').replace('{n}', i + 1));
    b.innerHTML = src ? imgTag(src) : '<i data-lucide="image" class="ztor-icon"></i>';
    return b;
  }
  function videoThumb(src) {
    var b = el('button', 'pdp-gallery__thumb pdp-gallery__thumb--video' + (src ? '' : ' pdp-gallery__thumb--empty'));
    b.type = 'button'; b.setAttribute('data-video', ''); b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
    b.setAttribute('aria-label', T('fep.gallery.video', 'Watch the video'));
    b.innerHTML = (src ? imgTag(src) : '') + '<span class="pdp-gallery__thumb-play" aria-hidden="true">' + SVG.play + '</span>';
    return b;
  }

  function statusTagClass(tone) {
    if (tone === 'badge--success') return 'status-tag--green';
    if (tone === 'badge--info') return 'status-tag--yellow';
    return 'status-tag--cat';
  }

  /* ── 相關活動：從 events-store 撈其他活動（宿主選用；本檔不主動讀 store） ── */
  function relatedFromStore(excludeId, limit) {
    var S = window.ztorEvents;
    if (!S || !S.list) return true;
    var out = [];
    S.list().forEach(function (e) {
      if (out.length >= (limit || 3) || !e || e.id === excludeId) return;
      var prices = (e.tiers || []).map(function (t) { return Number(t.price) || 0; }).filter(function (n) { return n > 0; });
      out.push({
        name: e.name || '', img: (e.images && e.images.keyvisual) || '',
        cat: [e.date, e.venue].filter(Boolean).join(' · '),
        priceObj: prices.length ? { base: e.currency || S.DEFAULT_CURRENCY, amount: Math.min.apply(null, prices), override: {} } : null
      });
    });
    return out.length ? out : true;
  }

  /* ── 主體 ─────────────────────────────────────────────────────────── */
  function render(host, model, api) {
    host.innerHTML = '';
    var m = model || {};
    var view = api.view || 'ticket';
    var hasBundles = !!(m.bundles && m.bundles.length);
    var views = api.views || (hasBundles ? ['ticket', 'bundles'] : ['ticket']);
    if (views.indexOf(view) < 0) view = views[0];
    var isBundles = view === 'bundles' && hasBundles;
    var tiers = m.tiers || [];
    var bundles = m.bundles || [];
    var nameText = valueOf(api, m.name);

    /* CS 端的視圖切換（兩個視圖才畫）：.segmented 是控件層 toggle（STYLE-DECISIONS Q8），畫在粉絲頁外面。 */
    if (views.length > 1) {
      var bar = el('div', 'pp-fan-viewbar');
      var seg = el('div', 'segmented');
      views.forEach(function (v) {
        var b = el('button', 'segmented__btn' + (v === view ? ' segmented__btn--active' : ''));
        b.type = 'button';
        b.setAttribute('data-fep-set-view', v);
        var k = v === 'bundles' ? 'fep.view.bundles' : 'fep.view.ticket';
        b.setAttribute('data-i18n', k);
        b.textContent = T(k, v === 'bundles' ? 'Ticket bundles page' : 'Ticket page');
        b.addEventListener('click', function () { if (api.setView) api.setView(v); });
        seg.appendChild(b);
      });
      bar.appendChild(seg);
      host.appendChild(bar);
    }

    var root = el('div', 'fep-shop rf-shop');
    root.setAttribute('data-fep-view', view);
    root.setAttribute('lang', api.lang === 'zh' ? 'zh-Hant' : (api.lang || 'en'));

    var main = el('main');
    var section = el('section', 'section section-bg-page section--flush-top');
    var pdp = el('div', 'pdp');
    pdp.setAttribute('data-pdp', ''); pdp.setAttribute('aria-busy', 'false'); pdp.setAttribute('data-type', 'event');

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

    /* 麵包屑：活動 › 類型 › 名稱 */
    var crumb = el('nav', 'page-head__crumbs');
    crumb.setAttribute('aria-label', T('fep.crumb.label', 'Breadcrumb'));
    crumb.innerHTML = '<a data-pp-inert data-i18n="fep.crumb.events">' + esc(T('fep.crumb.events', 'Events')) + '</a>' +
      (m.typeLabel ? '<span class="page-head__crumb-sep" aria-hidden="true">›</span><span>' + esc(m.typeLabel) + '</span>' : '') +
      '<span class="page-head__crumb-sep" aria-hidden="true">›</span>';
    var cur = el('span', 'page-head__crumb-cur'); cur.setAttribute('aria-current', 'page');
    cur.textContent = nameText || T('ce.pv.name', 'Event name');
    crumb.appendChild(cur);
    container.appendChild(crumb);

    var grid = el('div', 'pdp__grid');

    /* ── 圖庫：縮圖條 ＋ 主圖框（2:3） ── */
    var imgs = (m.gallery && m.gallery.length) ? m.gallery.slice() : (m.keyvisual ? [m.keyvisual] : []);
    var gallery = el('div', 'pdp-gallery'); gallery.setAttribute('data-pdp-gallery', '');
    var strip = el('div', 'pdp-gallery__strip'); strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', T('fep.gallery.label', 'Images'));
    var mobile = el('div', 'pdp-gallery__thumbs-mobile'); mobile.setAttribute('role', 'group'); mobile.setAttribute('aria-label', T('fep.gallery.label', 'Images'));
    (imgs.length ? imgs : ['']).forEach(function (src, i) { strip.appendChild(thumbBtn(src, i, i === 0)); mobile.appendChild(thumbBtn(src, i, i === 0)); });
    if (m.video) { strip.appendChild(videoThumb(imgs[0] || '')); mobile.appendChild(videoThumb(imgs[0] || '')); }
    var stage = el('div', 'pdp-gallery__stage');
    var frame = el('button', 'pdp-gallery__frame' + (imgs[0] ? '' : ' pdp-gallery__frame--empty'));
    frame.type = 'button'; frame.setAttribute('data-zoom-open', ''); frame.setAttribute('data-pp-inert', ''); frame.tabIndex = -1;
    frame.setAttribute('aria-label', T('fep.zoom', 'Zoom'));
    frame.innerHTML = (imgs[0] ? '<img class="pdp-gallery__img" data-hero src="' + esc(imgs[0]) + '" alt="' + esc(nameText) + '">' : '<i data-lucide="image" class="ztor-icon"></i>') +
      '<span class="pdp-gallery__zoom-hint" aria-hidden="true">' + SVG.zoom + '</span>';
    stage.appendChild(frame);
    var vw = el('div', 'pdp-gallery__video-wrap'); vw.setAttribute('data-pdp-video-wrap', ''); vw.hidden = true;
    stage.appendChild(vw);
    stage.appendChild(mobile);
    gallery.appendChild(strip);
    gallery.appendChild(stage);
    grid.appendChild(gallery);

    /* ── 購買欄 ── */
    var buy = el('div', 'pdp-buy');
    var meta = el('div', 'pdp-buy__meta');
    if (m.status) {
      var st = el('span', 'pdp-buy__badge status-tag ' + statusTagClass(m.status.tone));
      st.setAttribute('data-i18n', m.status.labelKey); st.textContent = T(m.status.labelKey, m.status.fallback || '');
      meta.appendChild(st);
    }
    if (isBundles) {
      var bt = el('span', 'pdp-buy__badge status-tag status-tag--yellow'); bt.setAttribute('data-i18n', 'fep.bd.tag'); bt.textContent = T('fep.bd.tag', 'Bundle');
      meta.appendChild(bt);
    }
    if (m.typeLabel) meta.appendChild(el('span', 'pdp-buy__badge status-tag status-tag--cat', esc(m.typeLabel)));
    if (m.region) meta.appendChild(el('span', 'pdp-buy__badge status-tag status-tag--yellow', esc(m.region)));
    buy.appendChild(meta);
    buy.appendChild(slot(api, 'h1', 'pdp-buy__title', m.name, T('ce.pv.name', 'Event name')));
    if (m.highlight && valueOf(api, m.highlight)) buy.appendChild(slot(api, 'p', 'pdp-buy__highlight', m.highlight, ''));

    /* 主辦：創作者（名冊頭像＋「前往創作者商店 ›」）；沒有頭像退回名字首字 */
    var hostEl = el('a', 'pdp-host'); hostEl.setAttribute('data-pp-inert', '');
    var avatar = m.organizerAvatar
      ? '<img class="pdp-host__avatar" src="' + esc(m.organizerAvatar) + '" alt="">'
      : '<span class="pdp-host__avatar pdp-host__avatar--initial" aria-hidden="true">' + esc(String(m.organizer || '').trim().charAt(0).toUpperCase()) + '</span>';
    hostEl.innerHTML = avatar +
      '<span class="pdp-host__text"><span class="pdp-host__k" data-i18n="fep.organizer">' + esc(T('fep.organizer', 'Organizer')) + '</span>' +
      '<span class="pdp-host__name">' + esc(m.organizer || '') + '</span></span>' +
      '<span class="pdp-host__more" data-i18n="fep.host.more">' + esc(T('fep.host.more', 'Visit creator shop ›')) + '</span>';
    buy.appendChild(hostEl);

    /* 資訊表：日期／時間／時長／場館＋地址／語言／優先購／限購 */
    var em = el('div', 'pdp-event-meta');
    function row(labelKey, labelFb, valueHtml, extraCls) {
      if (!valueHtml) return;
      var r = el('div', 'pdp-event-meta__row' + (extraCls ? ' ' + extraCls : ''));
      r.innerHTML = '<span class="pdp-event-meta__k" data-i18n="' + labelKey + '">' + esc(T(labelKey, labelFb)) + '</span><span>' + valueHtml + '</span>';
      em.appendChild(r);
    }
    row('fep.date', 'Date', esc(m.date));
    row('fep.time', 'Time', esc(m.time));
    row('fep.duration', 'Length', esc(m.duration));
    row('fep.venue', 'Venue', m.venue ? esc(m.venue) + (m.address ? '<small>' + esc(m.address) + '</small>' : '') : '');
    row('fep.language', 'Language', esc(m.language));
    if (m.priority) row('fep.priority', 'Early access', '<span class="pdp-event-meta__nowrap">' + esc(m.priority.window) + '</span>' + (m.priority.state ? '<small>' + esc(m.priority.state) + '</small>' : ''), 'pdp-event-meta__row--names');
    row('fep.limit', 'Per order', esc(m.limit));
    buy.appendChild(em);

    /* 票價區間／組合價區間 ＋「N 種票 ›」／「N 種組合 ›」 */
    var price = el('div', 'pdp-event-price');
    var pk = el('span', 'pdp-event-price__k');
    var pv = el('span', 'pdp-event-price__v');
    var plink = el('button', 'pdp-event-price__link'); plink.type = 'button';
    if (!isBundles) {
      pk.setAttribute('data-i18n', 'fep.price.k'); pk.textContent = T('fep.price.k', 'Price');
      if (tiers.length) {
        pv.textContent = rangeText(api, tiers.map(function (t) { return numOf(api, t.priceObj, t.priceKey); }));
        plink.textContent = T('fep.tiers.n', '{n} ticket types').replace('{n}', tiers.length) + ' ›';
        plink.setAttribute('data-pdp-tiers', '');
        plink.addEventListener('click', function () { var d = root.querySelector('[data-pdp-tiers-target]'); if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
      } else {
        pv.classList.add('is-empty'); pv.textContent = T('ce.pv.tickets', 'Tickets coming soon');
        plink = null;
      }
    } else {
      pk.setAttribute('data-i18n', 'fep.price.bundles.k'); pk.textContent = T('fep.price.bundles.k', 'Bundle price');
      pv.textContent = rangeText(api, bundles.map(function (b) { return numOf(api, b.priceObj, b.priceKey); }));
      plink.textContent = T('fep.bundles.link', '{n} bundles').replace('{n}', bundles.length) + ' ›';
      plink.addEventListener('click', function () { var s = root.querySelector('[data-fep-bundles]'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
    /* D310：預覽裡的價格點了開右側的價格表（價格不就地改）。區間不對應單一列，
       key 給空字串＝開表但不聚焦任何一格；宿主（publish-stage.js）認 [data-fep-price-key]。 */
    if (!pv.classList.contains('is-empty')) pv.setAttribute('data-fep-price-key', '');
    price.appendChild(pk); price.appendChild(pv); if (plink) price.appendChild(plink);
    buy.appendChild(price);

    var actions = el('div', 'pdp-buy__actions');
    var ctaKey = isBundles ? 'fep.cta.bundle' : 'fep.cta.buy';
    actions.innerHTML =
      '<button class="btn btn--mono btn--lg pdp-buy__add" type="button" data-pdp-ticket data-pp-inert tabindex="-1"><span data-add-label data-i18n="' + ctaKey + '">' + esc(T(ctaKey, isBundles ? 'Choose a bundle' : 'Buy tickets')) + '</span></button>' +
      '<button class="pdp-buy__heart" type="button" data-pdp-wish data-pp-inert tabindex="-1" aria-pressed="false" aria-label="' + esc(T('fep.wish', 'Add to wishlist')) + '">' + SVG.heart + '</button>';
    buy.appendChild(actions);
    grid.appendChild(buy);
    container.appendChild(grid);
    page.appendChild(container);

    /* ── 活動詳情：介紹／卡司／注意事項／取票方式／退換票／票種與價格／購票條款 ── */
    var details = el('section', 'pdp-details pdp-details--event');
    details.setAttribute('aria-label', T('fep.details.label', 'Event details'));
    var inner = el('div', 'pdp-details__inner container');
    var h2 = el('h2', 'pdp-details__heading'); h2.setAttribute('data-i18n', 'fep.sec.about'); h2.textContent = T('fep.sec.about', 'About');
    inner.appendChild(h2);
    /* 描述是一個可翻譯欄位，整段放前台的 lead 段（前台把第一段當 lead、其餘 para；一個 contenteditable 拆不成兩個節點，UIA-167） */
    inner.appendChild(slot(api, 'p', 'pdp-details__lead', m.desc, T('cp.pv.desc-ph', 'Description')));

    var cols = el('div', 'pdp-details__cols');
    var left = el('div', 'pdp-details__left');
    /* 卡司陣容 chips：人名維持原文、角色標籤可翻譯（§7.4 顯示規則），前台寫法是「角色 人名」一顆 chip */
    if (m.lineup && m.lineup.length) {
      var blk = el('div', 'pdp-details__specs-block');
      blk.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('user') + '<span data-i18n="fep.sec.lineup">' + esc(T('fep.sec.lineup', 'Lineup')) + '</span></h3>';
      var list = el('div', 'pdp-lineup__list');
      m.lineup.forEach(function (p) {
        var chip = el('span', 'pdp-lineup__chip');
        if (p.role) { chip.appendChild(slot(api, 'span', '', p.role, '')); chip.appendChild(document.createTextNode(' ')); }
        chip.appendChild(document.createTextNode(p.name || ''));
        list.appendChild(chip);
      });
      blk.appendChild(list);
      left.appendChild(blk);
    }
    /* 注意事項：活動內含物／需攜帶物品／活動須知，三份清單合成一節（前台只有一份 ul） */
    var notesAll = [];
    (m.includes || []).forEach(function (x) { notesAll.push({ tag: x.tag, field: x }); });
    (m.bring || []).forEach(function (x) { notesAll.push({ tag: T('fep.tag.bring', 'Bring'), field: x }); });
    (m.notes || []).forEach(function (x) { notesAll.push({ tag: '', field: x }); });
    if (notesAll.length) {
      var nb = el('div', 'pdp-details__specs-block');
      nb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('info') + '<span data-i18n="fep.sec.notes">' + esc(T('fep.sec.notes', 'Good to know')) + '</span></h3>';
      var ul = el('ul', 'pdp-notices');
      notesAll.forEach(function (x) {
        var li = el('li');
        if (x.tag) li.appendChild(document.createTextNode(x.tag + '：'));
        li.appendChild(slot(api, 'span', '', x.field, ''));
        ul.appendChild(li);
      });
      nb.appendChild(ul);
      left.appendChild(nb);
    }
    cols.appendChild(left);

    var right = el('div', 'pdp-details__right');
    if (m.pickup) {
      var sb = el('div', 'pdp-details__shipping-block');
      sb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('ticket') + '<span data-i18n="fep.sec.pickup">' + esc(T('fep.sec.pickup', 'Ticket delivery')) + '</span></h3>';
      sb.appendChild(el('p', 'pdp-details__shipping-text', esc(m.pickup)));
      if (m.entryNote) sb.appendChild(slot(api, 'p', 'pdp-details__shipping-text', m.entryNote, ''));
      right.appendChild(sb);
    }
    /* 退換票：表單沒有此欄，前台那句當平台固定文案（UIA-167）；宿主給字串就用宿主的、給 false 不畫 */
    if (m.refund !== false) {
      var rb = el('div', 'pdp-details__shipping-block');
      rb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('history') + '<span data-i18n="fep.sec.refund">' + esc(T('fep.sec.refund', 'Refunds & exchanges')) + '</span></h3>';
      var rp = el('p', 'pdp-details__shipping-text');
      if (typeof m.refund === 'string' && m.refund) rp.textContent = m.refund;
      else { rp.setAttribute('data-i18n', 'fep.refund.fixed'); rp.textContent = T('fep.refund.fixed', 'Tickets sold are non-refundable; if the organizer cancels or postpones, the ticket price is refunded in full (excluding fees).'); }
      rb.appendChild(rp);
      right.appendChild(rb);
    }
    cols.appendChild(right);
    inner.appendChild(cols);

    /* 票種與價格（票券頁才畫；票務商品頁把這一節換成下面的組合方案） */
    if (!isBundles) {
      var dt = el('details', 'pdp-terms pdp-terms--tiers'); dt.setAttribute('data-pdp-tiers-target', ''); dt.open = true;
      dt.innerHTML = '<summary class="pdp-terms__summary" data-i18n="fep.sec.tiers">' + esc(T('fep.sec.tiers', 'Tickets & prices')) + '</summary>';
      var tl = el('div', 'pdp-tiers pdp-tiers--info'); tl.setAttribute('data-tiers', ''); tl.setAttribute('role', 'list'); tl.setAttribute('aria-label', T('fep.sec.tiers', 'Tickets & prices'));
      if (!tiers.length) {
        var e0 = el('div', 'pdp-tier pdp-tier--info');
        e0.innerHTML = '<span class="pdp-tier__main"><span class="pdp-tier__label is-empty">' + esc(T('ce.pv.tickets', 'Tickets coming soon')) + '</span></span>';
        tl.appendChild(e0);
      }
      tiers.forEach(function (t, i) {
        var tr = el('div', 'pdp-tier pdp-tier--info' + (t.soldOut ? ' is-oos' : '')); tr.setAttribute('data-tier', String(i));
        var mainEl = el('span', 'pdp-tier__main');
        mainEl.appendChild(slot(api, 'span', 'pdp-tier__label', t.name, T('ce.tier.untitled', 'Untitled tier')));
        if (t.note) mainEl.appendChild(el('span', 'pdp-tier__meta', esc(t.note)));
        tr.appendChild(mainEl);
        var tprice = el('span', 'pdp-tier__price', esc(moneyOf(api, t.priceObj, t.priceKey)));
        tprice.setAttribute('data-fep-price-key', t.priceKey || '');   /* D310：點價格開價格表 */
        tr.appendChild(tprice);
        var b = el('button', 'btn btn--yellow-ghost btn--sm pdp-tier__buy'); b.type = 'button'; b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
        var tn = valueOf(api, t.name);
        if (t.soldOut) { b.disabled = true; b.setAttribute('data-i18n', 'fep.tier.soldout'); b.textContent = T('fep.tier.soldout', 'Sold out'); b.setAttribute('aria-label', tn + ' ' + T('fep.tier.soldout', 'Sold out')); }
        else { b.setAttribute('data-pdp-tier-buy', t.key || ''); b.setAttribute('data-i18n', 'fep.tier.buy'); b.textContent = T('fep.tier.buy', 'Buy'); b.setAttribute('aria-label', T('fep.tier.buy', 'Buy') + ' ' + tn); }
        tr.appendChild(b);
        tl.appendChild(tr);
      });
      dt.appendChild(tl);
      inner.appendChild(dt);
    }

    /* 購票條款（收合） */
    if (m.terms) {
      var dterm = el('details', 'pdp-terms');
      dterm.innerHTML = '<summary class="pdp-terms__summary" data-i18n="fep.sec.terms">' + esc(T('fep.sec.terms', 'Terms')) + '</summary>';
      dterm.appendChild(slot(api, 'p', 'pdp-terms__text', m.terms, ''));
      inner.appendChild(dterm);
    }
    details.appendChild(inner);
    page.appendChild(details);

    /* ── 組合方案（票務商品頁）：前台的 pdp-recs--bundles ── */
    if (isBundles) {
      var bs = el('section', 'pdp-recs pdp-recs--bundles'); bs.setAttribute('data-fep-bundles', ''); bs.setAttribute('aria-label', T('fep.sec.bundles', 'Bundles'));
      var bin = el('div', 'pdp-recs__inner container');
      var hr = el('div', 'pdp-recs__headrow');
      hr.innerHTML = '<h2 class="pdp-recs__heading" data-i18n="fep.sec.bundles">' + esc(T('fep.sec.bundles', 'Bundles')) + '</h2>';
      var back = el('a', 'pdp-recs__headlink'); back.setAttribute('role', 'button'); back.tabIndex = 0;
      back.textContent = T('fep.link.ticket', 'Tickets only') + ' ›';
      back.addEventListener('click', function (e) { e.preventDefault(); if (api.setView) api.setView('ticket'); });
      hr.appendChild(back);
      bin.appendChild(hr);
      var rail = el('div', 'pdp-recs__rail');
      bundles.forEach(function (b, i) {
        var card = el('article', 'pdp-rec-card pdp-rec-card--bundle'); card.setAttribute('data-bundle', b.priceKey || String(i));
        var goods = b.goods || [];
        var tix = b.tickets || null;
        /* 舊形狀相容：contents[]（icon/text）→ 拆成票券列與商品列 */
        if (!tix && !goods.length && b.contents && b.contents.length) {
          goods = []; tix = null;
          b.contents.forEach(function (c) {
            if ((c.icon || 'ticket') === 'ticket') tix = tix || { line: c.text || c };
            else goods.push({ name: c.text || c, spec: false, img: '' });
          });
        }
        var coverImg = b.img || (goods[0] && goods[0].img) || imgs[0] || '';
        var media = el('div', 'pdp-rec-card__media' + (coverImg ? '' : ' pdp-rec-card__media--empty'));
        media.innerHTML = (coverImg ? imgTag(coverImg, '', b.name) : '<i data-lucide="package" class="ztor-icon"></i>') +
          '<span class="rf-flag rf-flag--limited" data-i18n="fep.bd.tag">' + esc(T('fep.bd.tag', 'Bundle')) + '</span>';
        card.appendChild(media);
        var body = el('div', 'pdp-rec-card__body');
        /* eyebrow：「票 ＋ 商品 · 較單買省 NT$ X」／「票 × 2 · 較單買省 NT$ X」 */
        var nowN = numOf(api, b.priceObj, b.priceKey);
        var wasN = b.listPriceObj ? numOf(api, b.listPriceObj, null) : 0;
        var kind = goods.length ? T('fep.kind.mix', 'Ticket + goods') : T('fep.kind.tix', 'Ticket × {n}').replace('{n}', (tix && tix.qty) || 1);
        var save = wasN > nowN ? T('fep.save', 'Save {amt} vs. buying separately').replace('{amt}', fmtNum(api, wasN - nowN).replace(/ /g, ' ')) : '';
        body.appendChild(el('span', 'pdp-rec-card__cat', esc(kind) + (save ? ' · ' + esc(save) : '')));
        var h3 = el('h3', 'pdp-rec-card__title');
        h3.innerHTML = '<a class="pdp-rec-card__title-link" data-pp-inert>' + esc(b.name || T('cpp.bd.untitled', 'Untitled bundle')) + '</a>';
        body.appendChild(h3);
        /* 成員列：票券＝允許票種清單 ×張數（多種時「座位區域下單時選」）；商品＝名稱＋規格「下單時選」 */
        var parts = el('ul', 'pdp-rec-card__parts');
        if (tix) {
          var li = el('li'); li.setAttribute('data-kind', 'ticket');
          var line = tix.line;
          if (!line) {
            var names = tix.names || [];
            line = names.join('／') + (names.length > 1 ? T('fep.bd.pick', ' (pick a section at checkout)') : '') + (Number(tix.qty) > 1 ? ' × ' + tix.qty : '');
          }
          li.innerHTML = '<span>' + esc(line) + '</span>';
          parts.appendChild(li);
        }
        goods.forEach(function (g) {
          var gl = el('li'); gl.setAttribute('data-kind', 'goods');
          gl.innerHTML = (g.img ? imgTag(g.img, 'pdp-rec-card__partimg') : '') + '<span>' + esc(g.name) + (g.spec ? esc(T('fep.bd.spec', ' (pick options at checkout)')) : '') + '</span>';
          parts.appendChild(gl);
        });
        body.appendChild(parts);
        var perks = (b.perks || []).map(function (p) { return typeof p === 'string' ? p : (p.title || '') + (p.desc ? ' ' + p.desc : ''); }).filter(Boolean);
        if (perks.length) {
          var pu = el('ul', 'pdp-rec-card__perks');
          perks.forEach(function (p) { pu.appendChild(el('li', '', esc(p))); });
          body.appendChild(pu);
        }
        body.appendChild(el('span', 'pdp-rec-card__note', esc(b.note || '')));
        var priceEl = el('span', 'pdp-rec-card__price');
        priceEl.setAttribute('data-fep-price-key', b.priceKey || '');   /* D310：點價格開價格表 */
        var nowStr = moneyOf(api, b.priceObj, b.priceKey);
        priceEl.textContent = (tix && tix.names && tix.names.length > 1) ? T('fep.bd.from', 'From {price}').replace('{price}', nowStr) : nowStr;
        if (wasN > nowN) { priceEl.appendChild(document.createTextNode(' ')); priceEl.appendChild(el('s', '', esc(moneyOf(api, b.listPriceObj, null)))); }
        body.appendChild(priceEl);
        var act = el('span', 'pdp-rec-card__actions');
        act.innerHTML = '<button class="btn btn--mono btn--sm pdp-rec-card__cta" type="button" data-bundle-buy="' + i + '" data-pp-inert tabindex="-1" data-i18n="fep.cta.bundle.buy">' + esc(T('fep.cta.bundle.buy', 'Buy bundle')) + '</button>' +
          '<button class="icon-btn pdp-rec-card__cart" type="button" data-bundle-cart="' + i + '" data-pp-inert tabindex="-1" aria-label="' + esc(T('fep.cart.add', 'Add to cart')) + '" title="' + esc(T('fep.cart.add', 'Add to cart')) + '">' + SVG.cart + '</button>';
        body.appendChild(act);
        card.appendChild(body);
        rail.appendChild(card);
      });
      bin.appendChild(rail);
      bs.appendChild(bin);
      page.appendChild(bs);
    }

    /* ── 相關活動：三張卡、全部標「非本活動」（非本活動內容是否出現在預覽，上游待確認 §8.26） ── */
    if (m.related !== false) {
      var rs = el('section', 'pdp-recs'); rs.setAttribute('aria-label', T('fep.sec.related', 'Related events'));
      var rin = el('div', 'pdp-recs__inner container');
      rin.innerHTML = '<h2 class="pdp-recs__heading" data-i18n="fep.sec.related">' + esc(T('fep.sec.related', 'Related events')) + '</h2>';
      var rrail = el('div', 'pdp-recs__rail');
      var items = Array.isArray(m.related) ? m.related.slice(0, 3) : [null, null, null];
      items.forEach(function (r) {
        var a = el('a', 'pdp-rec-card'); a.setAttribute('data-pp-inert', '');
        var md = el('div', 'pdp-rec-card__media' + (r && r.img ? '' : ' pdp-rec-card__media--empty'));
        md.innerHTML = (r && r.img ? imgTag(r.img, '', r.name) : '<i data-lucide="image" class="ztor-icon"></i>') +
          '<span class="rf-flag rf-flag--limited" data-i18n="fep.related.badge">' + esc(T('fep.related.badge', 'Not this event')) + '</span>';
        a.appendChild(md);
        var bd = el('div', 'pdp-rec-card__body');
        var priceStr = r ? (r.priceObj ? T('fep.bd.from', 'From {price}').replace('{price}', moneyOf(api, r.priceObj, null)) : (r.price || '')) : '';
        bd.innerHTML = '<span class="pdp-rec-card__cat">' + esc(r ? r.cat : T('fep.related.note', 'Placeholder')) + '</span>' +
          '<h3 class="pdp-rec-card__title">' + esc(r ? r.name : T('fep.related.badge', 'Not this event')) + '</h3>' +
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
    buybar.innerHTML = '<div class="shop-buybar__info"><span class="shop-buybar__name">' + esc(nameText) + '</span><span class="shop-buybar__price">' + esc(pv.textContent) + '</span></div>' +
      '<button class="btn btn--mono shop-buybar__add pdp-buy__add" type="button" data-pdp-ticket data-pp-inert tabindex="-1">' + esc(T(ctaKey, isBundles ? 'Choose a bundle' : 'Buy tickets')) + '</button>';
    pdp.appendChild(buybar);

    section.appendChild(pdp);
    main.appendChild(section);
    root.appendChild(main);
    host.appendChild(root);
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    return root;
  }

  window.ztorFanEventPage = { render: render, relatedFromStore: relatedFromStore };
})();
