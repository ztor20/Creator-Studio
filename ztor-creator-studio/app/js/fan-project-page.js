/* fan-project-page.js — 粉絲視角專案頁的渲染函式（D310 專案側，2026-09-23）
 *
 * 建立專案的最後一步「預覽與發布」（js/publish-stage.js 全頁畫面，比照建立活動第 8 步）
 * 主區要畫「粉絲在前台看到的專案頁」。活動／商品／組合包各有一支（fan-event-page.js／
 * fan-product-page.js／fan-bundle-page.js），本檔是專案版，API 形狀照抄它們：
 * 宿主把資料整理成一個 `model` 交給本檔畫，本檔只知道「粉絲頁長什麼樣」，不知道資料從哪來。
 *
 * ── 鏡像來源（2026-09-23 讀前台原始碼，未開瀏覽器）──
 *   · 共創／預購＝前台 https://ztor.vercel.app/cocreate-project.html（?kind=music&state=active、
 *     ?kind=preorder&state=active）的 <main>：.cocreate-detail ＞ .detail-back ＋ .detail-hero
 *     （海報＋標題列＋發起人＋狀態列＋關鍵字＋.cocreate-fund 募資面板）＋ .detail-body 各段
 *     （選擇方案 .reward-tiers／關於這部作品 .cocreate-prose／共創計畫說明／預算分配 .budget-split／
 *     概念圖 .media-grid）。
 *   · 直接發行＝前台 https://ztor.vercel.app/title.html 的 .detail-hero（海報＋標題＋.detail-meta＋
 *     .detail-keywords＋.detail-desc＋.detail-actions 價格鈕），內文段沿用同一組 .detail-section。
 *   DOM 結構與 class 名照前台；CSS 是前台 components.css?v=20260922j／tokens.css 的同名規則加
 *   `.fep-shop` 前綴（ds-components/fan-shop.css 第 6 段），與活動／商品頁共用第 1–3 段的前台殼。
 *   與前台的差別只在：
 *   · 資料全部來自建立專案表單；剛建立的專案一律是「計畫進行中、0 人支持、0%」
 *   · 前台專有的互動拿掉：我要支持／選擇方案／收藏／分享／觀看預告片一律不動作（data-pp-inert）
 *   · 不畫相關推薦、創作團隊、留言討論、浮動支持條、製作進度時間軸（建立流程沒有這些資料）
 *   · 前台的 mask 圖示（assets/icons/*.svg）站上沒有，照抄路徑成 inline svg（fill 改 currentColor）
 *
 * 用法：
 *   window.ztorFanProjectPage.render(host, model, api)   // 回傳 .fep-shop 根節點
 *
 * model（宿主整理；可翻譯欄位給 `{ key }`，本檔以 api.getValue(key) 取當前語系的值並
 * 交給 api.bindEditable 掛 inline 編輯；非文案的資料值給字串）：
 *   {
 *     kind: 'golive' | 'fund' | 'preorder',      // 直接發行／共創（募資）／預購
 *     film: false,                               // 直接發行 × 影片家族（標題頁版型的影片資訊列）
 *     name: { key:'name' },  desc: { key:'desc' },  story: { key:'story' } | null,
 *     creator: 'Gary Lin' | '',                  // 發起人（共創／預購的標題下一行）；空＝不畫
 *     poster: { src, kind:'image'|'video' } | 'src' | null,   // 主視覺（2:3 海報＋模糊背景）
 *     media: [{ src, kind } | 'src'],            // 內文的圖片格（概念圖／商品圖／劇照）；空＝整段不畫
 *     hasTrailer: false,                         // 有影片才畫「觀看預告片」
 *     facts: ['2026', '16+', '1h 41m'],          // 標題頁的資訊列（直接發行）；空＝不畫
 *     langLabel: 'Original language', langValue: 'Cantonese',   // 資訊列尾端的語言（選填）
 *     keywords: ['Single', 'Indie rock'],        // 關鍵字 chip
 *     meta: [{ k:'Artists', v:'Sunset Rollercoaster' }],        // 「關於這部作品」下的條列
 *     // 直接發行
 *     access: 'free' | 'ppv' | 'hybrid',
 *     price: { priceObj, priceKey, from:false } | null,          // 價格鈕（免費＝null）
 *     // 共創／預購
 *     fund: {
 *       goal: priceObj,                          // 共創：目標金額（跟著預覽幣別換算，不是價格表的一列）
 *       units: 100,                              // 預購：最少預購數（份）
 *       days: 30, deadline: '2026-10-23 23:59'   // 期間與截止時點
 *     },
 *     delivery: {                                // 交付時程（共創／預購；D322 原 F10 併入預覽）；null＝不畫
 *       date: '2026-12-01' | '',                 // 預期交付：畫成就地可改的日期欄 [data-fpj-delivery-input]，
 *                                                // 宿主監聽它的 change 寫回自己的單一來源（本檔不管資料落在哪）
 *       milestones: [{ label:'Campaign funded', state:'done'|'doing'|'todo' }]
 *     } | null,
 *     tiers: [{ key, name:{key}|'Untitled', priceObj, priceKey,
 *               benefits:[{key}|'string'], cap: 25 | null }],   // cap＝null 表示名額不限
 *     budget: [{ label:{key}|'Production', pct: 50 }],            // 共創才有
 *     // 作品模式（2026-09-23 加，publish-work.html 最後一步；三欄都選填，不給＝與建立專案完全相同的畫面）
 *     work: false,                               // true＝上架的是作品：沒有故事也沒有條列時不畫「關於這部作品」空段
 *     credits: [{ role:'Director', names:['A','B'] }],   // 前台 title.html「創作團隊」段的 .detail-crew 名單；空＝不畫
 *     clips: [{ kind:'trailer'|'bts', thumb:{ src, kind }|'src'|null }]   // 前台「預告與花絮」段；空＝不畫
 *   }
 *
 * ── 作品上架也用本檔（2026-09-23，作品上架流程最後一步改全頁預覽，比照 D322）──
 *   前台沒有獨立的「作品頁」：影片作品上線後粉絲看到的就是 title.html（前台
 *   assets/cocreate-released-titles.js 檔頭：「A released film co-creation IS an ordinary title page」，
 *   首頁片卡也一律連 title.html?t=<slug>）。所以作品上架沿用本檔的直接發行 × 影片版型（kind:'golive'、film:true），
 *   只多兩段前台 title.html 有、建立專案用不到的內文段：創作團隊（.detail-castwrap ＞ .detail-crew）與
 *   預告與花絮（.media-grid 的 .media-card＋.media-card__play）。段落順序照 title.html：創作團隊 → 劇照 → 預告與花絮。
 *
 * 價格節點帶 `data-fep-price-key`（沿用活動頁的屬性名：js/publish-stage.js 認這個屬性把價格表滑出來，
 * D310「價格不就地改」）；另掛 `data-fpj-price-key` 標明是專案頁的價格節點。
 * 可給 editZones 選的區塊：[data-fpj-poster]、[data-fpj-title]、[data-fpj-keywords]、[data-fpj-desc]、
 * [data-fpj-fund]、[data-fpj-price]、[data-fpj-tiers]、[data-fpj-about]、[data-fpj-story]、
 * [data-fpj-budget]、[data-fpj-delivery]、[data-fpj-media]、[data-fpj-credits]、[data-fpj-clips]（後兩個只在作品模式出現）。
 *
 * api（由 js/publish-stage.js 的 previewRender 提供，與活動頁同介面）：
 *   lang；currency；getValue(key)；bindEditable(el, key)；priceIn(priceObj, priceKey)。
 *
 * 依賴 CSS：ds-components/fan-shop.css（第 1–3 段共用、第 6 段專案頁）；宿主頁另需 publish-stage.css。
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

  /* 前台金額寫法「USD 4,100」（幣別代碼＋空格＋千分位、不帶小數）：共創面板與方案卡都是這個格式 */
  function amountOf(api, po, key) { return api.priceIn ? api.priceIn(po, key) : 0; }
  function codeMoney(api, n) {
    var v = Math.round(Number(n) || 0);
    return (api.currency || '') + ' ' + v.toLocaleString('en-US');
  }

  /* 可翻譯 slot：同 fan-product-page.js——值從 api 取、交給 api 決定要不要開放 inline 編輯；空值畫斜體佔位 */
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

  /* 前台 inline svg：返回箭頭照抄 cocreate-project.html；其餘四個是前台 mask 圖示
     （assets/icons/user.svg／info.svg／bookmark_regular.svg／share.svg）的 path，fill 改 currentColor */
  var SVG = {
    back: '<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.0009 5.125C10.275 5.125 8.87585 6.52411 8.87585 8.25C8.87585 9.97589 10.275 11.375 12.0009 11.375C13.7267 11.375 15.1259 9.97589 15.1259 8.25C15.1259 6.52411 13.7267 5.125 12.0009 5.125ZM7.62585 8.25C7.62585 5.83375 9.58461 3.875 12.0009 3.875C14.4171 3.875 16.3759 5.83375 16.3759 8.25C16.3759 10.6662 14.4171 12.625 12.0009 12.625C9.58461 12.625 7.62585 10.6662 7.62585 8.25Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M4.93335 19.5C4.93335 16.1385 8.22679 13.625 12.0008 13.625C15.7749 13.625 19.0683 16.1385 19.0683 19.5C19.0683 19.8452 18.7885 20.125 18.4433 20.125C18.0982 20.125 17.8183 19.8452 17.8183 19.5C17.8183 17.0565 15.3368 14.875 12.0008 14.875C8.66491 14.875 6.18335 17.0565 6.18335 19.5C6.18335 19.8452 5.9035 20.125 5.55835 20.125C5.21317 20.125 4.93335 19.8452 4.93335 19.5Z" fill="currentColor"></path></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3C16.9747 3 21 7.02578 21 12C21 16.9747 16.9743 21 12 21C7.02525 21 3 16.9742 3 12C3 7.02525 7.02571 3 12 3ZM12 4.25586C7.72985 4.25586 4.25586 7.72982 4.25586 12C4.25586 16.2702 7.72985 19.7441 12 19.7441C16.2701 19.7441 19.7441 16.2702 19.7441 12C19.7441 7.72982 16.2701 4.25586 12 4.25586ZM12 10.502C12.5092 10.502 12.9235 10.7272 12.9238 11.0586V15.5723C12.9238 15.8566 12.5094 16.1416 12 16.1416C11.467 16.1415 11.0879 15.8566 11.0879 15.5723V11.0596C11.0879 10.7279 11.467 10.502 12 10.502ZM12 7.71777C12.5331 7.71777 12.96 8.10939 12.96 8.55957C12.9598 9.00969 12.533 9.41211 12 9.41211C11.4553 9.41201 11.0294 9.00963 11.0293 8.55957C11.0293 8.10945 11.4551 7.71787 12 7.71777Z" fill="currentColor"></path></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none"><path d="M11.8301 2C12.38 2.00004 12.8301 2.45003 12.8301 3C12.8301 3.54997 12.38 3.99996 11.8301 4H7.96973C7.15994 4.00015 6.50015 4.65994 6.5 5.46973V18.3799C6.5 18.5299 6.67027 18.6098 6.78027 18.5098L11.3301 14.4502C11.5201 14.2802 11.76 14.2002 12 14.2002C12.24 14.2002 12.4799 14.2802 12.6699 14.4502L17.2197 18.5195C17.3297 18.6095 17.5 18.5396 17.5 18.3896V12.3301H17.5098C17.5098 11.7802 17.9599 11.3302 18.5098 11.3301C19.0598 11.3301 19.5098 11.7801 19.5098 12.3301V19.8799C19.5098 20.4698 19.1601 21.01 18.6201 21.25C18.0801 21.49 17.4498 21.39 17.0098 21L12.3203 16.8096C12.1405 16.6497 11.8704 16.65 11.6904 16.8096L7 21C6.72 21.25 6.36 21.3799 6 21.3799C5.79 21.3799 5.58965 21.34 5.38965 21.25C4.84982 21.0099 4.5 20.4698 4.5 19.8799V5.46973C4.50015 3.54994 6.04994 2.00015 7.96973 2H11.8301Z" fill="currentColor"></path></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.9269 4.21902C11.2514 4.04478 11.6453 4.06294 11.9523 4.26631L21.5523 10.6253C21.8257 10.8064 21.9929 11.11 21.9999 11.4379C22.0068 11.7657 21.8526 12.0761 21.5871 12.2686L11.9871 19.2296C11.6828 19.4502 11.2805 19.4816 10.9457 19.3108C10.6109 19.14 10.4001 18.7959 10.4001 18.42L10.4001 15.6507C8.71632 15.6997 7.19869 16.4759 5.99993 17.375C5.30763 17.8942 4.75079 18.4333 4.36743 18.8428C4.17644 19.0468 4.03036 19.2167 3.93389 19.3331C3.88571 19.3912 3.85004 19.4358 3.82749 19.4645L3.8036 19.4952L3.79991 19.5C3.54157 19.8439 3.09177 19.9847 2.68368 19.8487C2.27534 19.7126 1.99991 19.3304 1.99991 18.9C1.99991 18.9 2.00129 18.8 2.00251 18.7721C2.00494 18.6985 2.00966 18.595 2.01878 18.4654C2.03701 18.2063 2.07294 17.8412 2.14386 17.4005C2.28526 16.5218 2.56832 15.3261 3.13856 14.0634C4.22312 11.662 6.34713 9.03424 10.4001 7.91551L10.4001 5.1C10.4001 4.73174 10.6025 4.39327 10.9269 4.21902ZM4.54036 15.9746C4.62487 15.908 4.71142 15.8414 4.79994 15.775C6.3966 14.5775 8.75632 13.3618 11.5241 13.7077C12.0246 13.7703 12.4001 14.1957 12.4001 14.7V16.4597L19.2453 11.4962L12.4001 6.96189V8.7C12.4001 9.17154 12.0707 9.579 11.6096 9.6778C7.78069 10.4983 5.90836 12.7896 4.9613 14.8866C4.79359 15.2579 4.65494 15.6237 4.54036 15.9746Z" fill="currentColor"></path></svg>'
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
  function inertBtn(cls, html, label) {
    var b = el('button', cls, html);
    b.type = 'button'; b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
    if (label) b.setAttribute('aria-label', label);
    return b;
  }
  function sectionHead(titleKey, titleFb, countText) {
    var head = el('div', 'detail-section__head');
    head.appendChild(el('h2', 'detail-section__title', esc(T(titleKey, titleFb))));
    if (countText) head.appendChild(el('span', 'detail-section__count', esc(countText)));
    return head;
  }
  function metaList(rows) {
    var box = el('div', 'cocreate-meta-list');
    rows.forEach(function (r) {
      var s = el('span');
      s.appendChild(el('strong', '', esc(r.k)));
      s.appendChild(document.createTextNode(r.v));
      box.appendChild(s);
    });
    return box;
  }

  /* ── 主體 ─────────────────────────────────────────────────────── */
  function render(host, model, api) {
    host.innerHTML = '';
    var m = model || {};
    var kind = m.kind === 'fund' || m.kind === 'preorder' ? m.kind : 'golive';
    var cc = kind !== 'golive';               // 共創與預購共用 cocreate-project 版型
    var pre = kind === 'preorder';
    var nameText = valueOf(api, m.name);

    var root = el('div', 'fep-shop rf-cocreate');
    root.setAttribute('data-fpj-view', kind);
    root.setAttribute('lang', api.lang === 'zh' ? 'zh-Hant' : (api.lang || 'en'));

    var main = el('main');
    var detail = el('div', cc ? 'cocreate-detail' : 'title-detail');
    detail.setAttribute('data-project-state', 'active');

    /* 返回列（共創頁固定在頂端的那一列；標題頁沒有，前台靠全站頁首返回） */
    if (cc) {
      var backBar = el('div', 'container container--wide detail-back');
      backBar.innerHTML =
        '<a class="detail-back__nav" data-pp-inert aria-label="' + esc(T('fep.back', 'Back')) + '">' +
          '<span class="icon-btn icon-btn--sm icon-btn--plain" aria-hidden="true">' + SVG.back + '</span>' +
          '<span class="detail-back__title">' + esc(T('fep.back', 'Back')) + '</span></a>' +
        '<span class="detail-back__spacer"></span>';
      detail.appendChild(backBar);
    }

    /* ── HERO：模糊背景 ＋ 2:3 海報 ＋ 標題欄 ── */
    var hero = el('section', 'detail-hero');
    var poster = mediaOf(m.poster);
    if (poster && poster.kind === 'image') {
      var bg = el('div', 'detail-hero__bg');
      bg.style.backgroundImage = 'url(' + JSON.stringify(poster.src) + ')';
      hero.appendChild(bg);
    }
    var heroInner = el('div', 'container container--wide detail-hero__inner');
    var head = el('div', 'detail-head');
    var posterEl;
    if (poster) {
      var wrap = el('div', '', mediaTag(poster, 'detail-head__poster', nameText));
      posterEl = wrap.firstChild;
    } else {
      posterEl = el('div', 'detail-head__poster detail-head__poster--empty', '<i data-lucide="image" class="ztor-icon"></i>');
    }
    posterEl.setAttribute('data-fpj-poster', '');
    head.appendChild(posterEl);

    var hm = el('div', 'detail-head__main');
    var titlebar = el('div', 'detail-titlebar');
    var lead = el('div', 'detail-titlebar__lead');
    var h1 = el('h1', 'detail-title');
    h1.setAttribute('data-fpj-title', '');
    h1.appendChild(slot(api, 'span', '', m.name, T('cpp.s1.title', 'Project title')));
    if (cc) {
      /* 分類標籤：共創＝共創計畫、預購＝預購計畫（前台固定品牌色、不隨階段變色） */
      h1.appendChild(el('span', 'status-tag status-tag--yellow cocreate-cat-tag',
        esc(pre ? T('fpj.cat.preorder', 'Pre-order') : T('fpj.cat.fund', 'Co-creation'))));
    }
    lead.appendChild(h1);
    titlebar.appendChild(lead);
    if (cc) {
      var aside = el('a', 'detail-titlebar__aside');
      aside.setAttribute('data-pp-inert', '');
      aside.innerHTML = '<span class="cocreate-hero__info-icon" aria-hidden="true">' + SVG.info + '</span>' +
        esc(pre ? T('fpj.learn.preorder', 'About pre-orders') : T('fpj.learn.fund', 'About co-creation'));
      titlebar.appendChild(aside);
    }
    hm.appendChild(titlebar);

    /* 發起人（共創／預購）：前台是頭像＋「發起人 名字」；原型沒有頭像檔，退回名字首字圓 */
    if (cc && m.creator) {
      var by = el('span', 'cocreate-hero__by');
      by.innerHTML = '<span class="cocreate-hero__by-avatar cocreate-hero__by-avatar--initial" aria-hidden="true">' +
        esc(String(m.creator).trim().charAt(0).toUpperCase()) + '</span>' +
        esc(T('fpj.by', 'Started by')) + ' <strong>' + esc(m.creator) + '</strong>';
      hm.appendChild(by);
    }

    /* 狀態列（共創／預購）或資訊列（直接發行）：同一個 .detail-meta，前者開頭是「計畫進行中」 */
    var facts = (m.facts || []).filter(Boolean);
    if (cc || facts.length || m.langValue) {
      var metaRow = el('div', 'detail-meta' + (cc ? ' cocreate-hero__status-line' : ''));
      var bits = [];
      if (cc) bits.push('<span class="cocreate-hero__status-group"><span class="cocreate-status-text">' + esc(T('fpj.status.active', 'Campaign live')) + '</span></span>');
      facts.forEach(function (f) { bits.push('<span>' + esc(f) + '</span>'); });
      if (m.langValue) bits.push('<span class="detail-meta__label">' + esc(m.langLabel || '') + '</span><span>' + esc(m.langValue) + '</span>');
      metaRow.innerHTML = bits.join('<span class="detail-meta__sep" aria-hidden="true"></span>');
      hm.appendChild(metaRow);
    }

    var keywords = (m.keywords || []).filter(Boolean);
    if (keywords.length) {
      var kw = el('div', 'detail-keywords');
      kw.setAttribute('data-fpj-keywords', '');
      keywords.forEach(function (k) { kw.appendChild(el('span', 'detail-chip', esc(k))); });
      hm.appendChild(kw);
    }

    var trailerBtn = m.hasTrailer ? inertBtn('btn btn--ghost btn--lg', esc(T('fpj.cta.trailer', 'Watch trailer'))) : null;

    if (cc) {
      hm.appendChild(fundPanel(m, api, pre, trailerBtn));
    } else {
      /* 標題頁：描述在 hero 裡（.detail-desc），下面接動作列（預告片＋價格鈕） */
      var desc = el('p', 'detail-desc');
      desc.setAttribute('data-fpj-desc', '');
      desc.appendChild(slot(api, 'span', 'detail-desc__text', m.desc, T('cpp.s1.desc', 'Description')));
      hm.appendChild(desc);
      hm.appendChild(actionsRow(m, api, trailerBtn));
    }

    head.appendChild(hm);
    heroInner.appendChild(head);
    hero.appendChild(heroInner);
    detail.appendChild(hero);

    /* ── BODY：.detail-body 各段 ── */
    var bodySec = el('section', 'section');
    var body = el('div', 'container container--wide detail-body');

    if (cc && (m.tiers || []).length) body.appendChild(tiersSection(m, api, pre));

    /* 關於這部作品（共創＝作品、預購＝這組商品；直接發行＝故事）。
       作品模式沒有故事欄、也沒有類型條列時整段不畫——只剩標題的空段在前台不存在（title.html 沒有這一段）。 */
    var aboutEmpty = !!m.work && !cc && !m.story && !(m.meta || []).length;
    var about = el('section', 'detail-section');
    about.setAttribute('data-fpj-about', '');
    about.appendChild(sectionHead(pre ? 'fpj.sec.about.goods' : 'fpj.sec.about.work', pre ? 'About these items' : 'About this work'));
    var prose = el('div', 'cocreate-prose');
    if (cc) {
      var leadP = slot(api, 'p', 'cocreate-prose__lead', m.desc, T('cpp.s1.desc', 'Description'));
      leadP.setAttribute('data-fpj-desc', '');
      prose.appendChild(leadP);
    } else if (m.story) {
      var st = slot(api, 'p', 'fpj-prose__story', m.story, T('cpp.s2.story', 'Story'));
      st.setAttribute('data-fpj-story', '');
      prose.appendChild(st);
    }
    if ((m.meta || []).length) prose.appendChild(metaList(m.meta));
    about.appendChild(prose);
    if (!aboutEmpty) body.appendChild(about);

    /* 共創計畫說明／預購計畫說明：故事全文 ＋ 預期交付 */
    if (cc) {
      var plan = el('section', 'detail-section');
      plan.appendChild(sectionHead(pre ? 'fpj.sec.plan.preorder' : 'fpj.sec.plan.fund', pre ? 'About this pre-order' : 'About this co-creation'));
      var planProse = el('div', 'cocreate-prose');
      planProse.setAttribute('data-fpj-story', '');
      if (m.story) planProse.appendChild(slot(api, 'p', 'fpj-prose__story', m.story, T('cpp.s2.story', 'Story')));
      plan.appendChild(planProse);
      body.appendChild(plan);
      /* 交付時程（D322：原 F10 併入主區前台預覽）：預期交付就地可改＋里程碑沿用前台 .project-timeline 三段殼 */
      if (m.delivery) body.appendChild(deliverySection(m, api));
    }

    if (kind === 'fund' && (m.budget || []).length) body.appendChild(budgetSection(m, api));

    /* 作品模式：創作團隊排在劇照前（title.html 的段序）；建立專案不給 credits，這一段不存在 */
    var credits = (m.credits || []).filter(function (r) { return r && (r.names || []).length; });
    if (credits.length) body.appendChild(creditsSection(credits, api));

    var media = (m.media || []).map(mediaOf).filter(Boolean);
    if (media.length) {
      var ms = el('section', 'detail-section');
      ms.setAttribute('data-fpj-media', '');
      ms.appendChild(sectionHead(
        pre ? 'fpj.sec.media.goods' : (cc ? 'fpj.sec.media.concept' : (m.film ? 'fpj.sec.media.stills' : 'fpj.sec.media.photos')),
        pre ? 'Product images' : (cc ? 'Concept art' : (m.film ? 'Stills' : 'Photos'))));
      var grid = el('div', 'media-grid');
      media.slice(0, 4).forEach(function (x) {
        var card = el('a', 'media-card', mediaTag(x, 'media-card__img', ''));
        card.setAttribute('data-pp-inert', '');
        grid.appendChild(card);
      });
      ms.appendChild(grid);
      body.appendChild(ms);
    }

    /* 作品模式：預告與花絮排在劇照後（title.html 的段序）；建立專案不給 clips，這一段不存在 */
    var clips = (m.clips || []).filter(Boolean);
    if (clips.length) body.appendChild(clipsSection(clips));

    bodySec.appendChild(body);
    detail.appendChild(bodySec);
    main.appendChild(detail);
    root.appendChild(main);
    host.appendChild(root);
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    return root;
  }

  /* 交付時程：前台 .project-timeline（三段節點＋標題），里程碑三態＝已完成（綠點）／進行中（前台 is-current 黃點＋徽章）／
     未開始（空心點）。預期交付是 D322 規定「本步可調整」的欄位，所以畫成日期輸入——這是鏡像裡唯一的表單控件（呈現假設）。 */
  function deliverySection(m, api) {
    var d = m.delivery || {};
    var sec = el('section', 'detail-section');
    sec.setAttribute('data-fpj-delivery', '');
    sec.appendChild(sectionHead('cpp.rv.delivery', 'Delivery timeline'));
    var row = el('label', 'fpj-delivery__row');
    row.appendChild(el('span', 'fpj-delivery__k', esc(T('fpj.meta.delivery', 'Expected delivery'))));
    var input = el('input', 'fpj-delivery__input');
    input.type = 'date';
    input.value = d.date || '';
    input.setAttribute('data-fpj-delivery-input', '');
    input.setAttribute('aria-label', T('fpj.meta.delivery', 'Expected delivery'));
    row.appendChild(input);
    if (!d.date) row.appendChild(el('span', 'fpj-delivery__hint', esc(T('fpj.delivery.empty', 'Required — fans see this date before they back you.'))));
    sec.appendChild(row);
    var ms = d.milestones || [];
    if (ms.length) {
      var tl = el('div', 'project-timeline');
      ms.forEach(function (x) {
        var ph = el('div', 'project-timeline__phase' + (x.state === 'doing' ? ' is-current' : (x.state === 'done' ? ' is-done' : '')));
        ph.appendChild(el('span', 'project-timeline__node', ''));
        ph.firstChild.setAttribute('aria-hidden', 'true');
        if (x.state === 'doing') ph.appendChild(el('span', 'project-timeline__badge', esc(T('fpj.timeline.now', 'In progress'))));
        ph.appendChild(slot(api, 'span', 'project-timeline__phase-title', x.label, ''));
        tl.appendChild(ph);
      });
      sec.appendChild(tl);
    }
    return sec;
  }

  /* 創作團隊（前台 title.html .detail-castwrap）：前台演員是頭像橫滑卡、劇組是右側文字名單；上架流程沒有演員照片，
     所以全部角色走文字名單，並照前台「沒有演員卡」的寫法留一個 hidden 的 [data-cast-main]，名單吃緊湊行距（呈現假設）。
     名字是專有名詞、不進翻譯表；角色名跟介面語言走（同其他靜態標籤）；多個名字照前台用「、」串，英文預覽改逗號。 */
  function creditsSection(credits, api) {
    var sec = el('section', 'detail-section');
    sec.setAttribute('data-fpj-credits', '');
    sec.appendChild(sectionHead('fpj.sec.team', 'Creative team'));
    var wrap = el('div', 'detail-castwrap');
    var castMain = el('div', 'cast-main');
    castMain.setAttribute('data-cast-main', '');
    castMain.hidden = true;
    wrap.appendChild(castMain);
    var dl = el('dl', 'detail-crew');
    var sep = String(api.lang || '').indexOf('zh') === 0 ? '、' : ', ';
    credits.forEach(function (r) {
      dl.appendChild(el('dt', '', esc(r.role)));
      dl.appendChild(el('dd', '', esc(r.names.join(sep))));
    });
    wrap.appendChild(dl);
    sec.appendChild(wrap);
    return sec;
  }

  /* 預告與花絮（前台 title.html #trailer）：一支影片一張 16:9 卡＋置中播放鈕，段標題旁帶支數。
     前台的播放鈕是 mask 圖示（assets/icons/media/play.svg），站上沒有，改包 lucide play（REGISTRY 已註冊）。
     縮圖：有抽得到的影格就用，沒有就退回主視覺，再沒有就留空底（呈現假設）。卡片不動作（data-pp-inert）。 */
  function clipsSection(clips) {
    var sec = el('section', 'detail-section');
    sec.setAttribute('data-fpj-clips', '');
    sec.appendChild(sectionHead('fpj.sec.clips', 'Trailers & clips', String(clips.length)));
    var grid = el('div', 'media-grid');
    clips.forEach(function (c) {
      var thumb = mediaOf(c.thumb);
      var card = el('a', 'media-card', mediaTag(thumb, 'media-card__img', ''));
      card.setAttribute('data-pp-inert', '');
      card.setAttribute('aria-label', c.kind === 'bts' ? T('fpj.clip.bts', 'Play the behind-the-scenes reel') : T('fpj.clip.trailer', 'Play the trailer'));
      card.appendChild(el('span', 'media-card__play', '<span class="media-card__play-btn"><i data-lucide="play" class="ztor-icon"></i></span>'));
      card.lastChild.setAttribute('aria-hidden', 'true');
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    return sec;
  }

  /* 共創／預購的募資面板（前台 .cocreate-fund）：剛發布＝0 人、0%、倒數＝整個期間 */
  function fundPanel(m, api, pre, trailerBtn) {
    var f = m.fund || {};
    var panel = el('div', 'cocreate-fund');
    panel.setAttribute('data-fpj-fund', '');
    var hero = pre
      ? T('fpj.po.units', '{n} copies').replace('{n}', '0')
      : codeMoney(api, 0);
    var backers = pre ? T('fpj.po.backers', '{n} pre-orders') : T('fpj.fund.backers', '{n} backers');
    var goalText = pre
      ? T('fpj.po.goal', 'Goal {n} copies').replace('{n}', (Number(f.units) || 0).toLocaleString('en-US'))
      : T('fpj.fund.goal', 'Goal {amt}').replace('{amt}', f.goal ? codeMoney(api, amountOf(api, f.goal, null)) : '—');
    panel.innerHTML =
      '<div class="cocreate-fund__amount-row">' +
        '<div class="cocreate-fund__amount">' + esc(hero) + '</div>' +
        '<span class="cocreate-fund__backers"><span class="cocreate-fund__backers-icon" aria-hidden="true">' + SVG.user + '</span>' +
        '<span>' + esc(backers.replace('{n}', '0')) + '</span></span>' +
      '</div>' +
      '<span class="cocreate-fund__goal">' + esc(goalText) + '</span>' +
      '<div class="cocreate-fund__bar-row" style="--bar-fill:0%">' +
        '<div class="cocreation-card__bar"><div class="cocreation-card__bar-fill" data-bar-fill="0"></div></div>' +
        '<span class="cocreate-fund__pct-pill">0%</span>' +
      '</div>' +
      '<div class="cocreate-fund__status-row">' +
        (f.days ? '<span class="cocreate-fund__countdown">' + esc(T('fpj.fund.left', '{n} days left').replace('{n}', f.days)) + '</span>' : '') +
        (f.deadline ? '<span class="cocreate-fund__meta-period">' +
          esc((pre ? T('fpj.po.period', 'This pre-order only goes ahead if it reaches its minimum by {date}.')
                   : T('fpj.fund.period', 'This project only succeeds if it reaches its goal by {date}.')).replace('{date}', f.deadline)) +
          '</span>' : '') +
      '</div>';
    var actions = el('div', 'cocreate-hero__actions');
    actions.appendChild(inertBtn('btn btn--yellow-ghost btn--lg cocreate-hero__cta-primary', esc(T('fpj.cta.back', 'Back this project'))));
    if (trailerBtn) actions.appendChild(trailerBtn);
    var io = el('span', 'cocreate-hero__io');
    io.appendChild(inertBtn('cocreate-hero__io-btn', '<span class="cocreate-hero__io-icon" aria-hidden="true">' + SVG.save + '</span>', T('fpj.save', 'Save')));
    io.appendChild(inertBtn('cocreate-hero__io-btn', '<span class="cocreate-hero__io-icon" aria-hidden="true">' + SVG.share + '</span>', T('fpj.share', 'Share')));
    io.appendChild(el('span', '', '0'));
    actions.appendChild(io);
    panel.appendChild(actions);
    var note = el('p', 'cocreate-fund__note');
    note.innerHTML = '<span class="cocreate-fund__note-icon" aria-hidden="true">' + SVG.info + '</span>' +
      '<span>' + esc(T('fpj.fund.note', 'Your card is only verified now. It is charged once the goal is met, and never if it falls short.')) + '</span>';
    panel.appendChild(note);
    return panel;
  }

  /* 直接發行的動作列（前台 title.html .detail-actions）：預告片（有才畫）＋ 價格鈕／免費觀看鈕 */
  function actionsRow(m, api, trailerBtn) {
    var row = el('div', 'detail-actions');
    row.setAttribute('data-fpj-price', '');
    var prim = el('div', 'detail-actions__primary');
    if (trailerBtn) prim.appendChild(trailerBtn);
    if (m.price && m.price.priceObj) {
      /* 價格鈕本身不動作，但金額要點得到（開價格表），所以整顆不掛 data-pp-inert */
      var b = el('button', 'btn btn--yellow-ghost btn--lg detail-price');
      b.type = 'button'; b.tabIndex = -1;
      var amt = codeMoney(api, amountOf(api, m.price.priceObj, m.price.priceKey));
      var main = el('span', 'detail-price__main');
      var a = el('span', 'detail-price__amount', esc(m.price.from ? T('fpj.price.from', 'From {price}').replace('{price}', amt) : amt));
      a.setAttribute('data-fep-price-key', m.price.priceKey || '');
      a.setAttribute('data-fpj-price-key', m.price.priceKey || '');
      main.appendChild(a);
      b.appendChild(main);
      var labelKey = m.film ? 'fpj.price.rent' : (m.access === 'hybrid' ? 'fpj.price.hybrid' : 'fpj.price.ppv');
      var labelFb = m.film ? 'Rent · one-time' : (m.access === 'hybrid' ? 'Unlock paid content' : 'Pay per view · one-time');
      b.appendChild(el('span', 'detail-price__label', esc(T(labelKey, labelFb))));
      prim.appendChild(b);
    } else {
      prim.appendChild(inertBtn('btn btn--yellow-ghost btn--lg', esc(T('fpj.cta.free', 'Watch free'))));
    }
    row.appendChild(prim);
    return row;
  }

  /* 選擇方案（前台 .reward-tiers 三欄卡）：名稱／價格／權益清單／支持人數／名額＋選擇 → */
  function tiersSection(m, api, pre) {
    var sec = el('section', 'detail-section');
    sec.setAttribute('data-fpj-tiers', '');
    sec.appendChild(sectionHead('fpj.sec.tiers', 'Choose a tier'));
    var grid = el('div', 'reward-tiers');
    m.tiers.forEach(function (t) {
      var card = el('article', 'reward-tier');
      card.setAttribute('data-tier-state', 'open');
      var th = el('div', 'reward-tier__head');
      th.appendChild(slot(api, 'span', 'reward-tier__name', t.name, T('cpp.bd.untitled', 'Untitled bundle')));
      card.appendChild(th);
      var price = el('div', 'reward-tier__price');
      var pn = el('span', '', esc(codeMoney(api, amountOf(api, t.priceObj, t.priceKey))));
      pn.setAttribute('data-fep-price-key', t.priceKey || '');
      pn.setAttribute('data-fpj-price-key', t.priceKey || '');
      price.appendChild(pn);
      card.appendChild(price);
      var benefits = t.benefits || [];
      if (benefits.length) {
        var ul = el('ul', 'reward-tier__benefits');
        benefits.forEach(function (b) { ul.appendChild(slot(api, 'li', '', b, '')); });
        card.appendChild(ul);
      }
      var backers = el('div', 'reward-tier__backers');
      backers.appendChild(el('span', 'reward-tier__count',
        esc((pre ? T('fpj.po.backers', '{n} pre-orders') : T('fpj.fund.backers', '{n} backers')).replace('{n}', '0'))));
      card.appendChild(backers);
      var foot = el('div', 'reward-tier__foot');
      var cap = t.cap == null ? null : Number(t.cap);
      foot.appendChild(el('span', 'reward-tier__slots', esc(cap && cap > 0
        ? T('fpj.tier.left', '{n} of {total} left').replace('{n}', cap.toLocaleString('en-US')).replace('{total}', cap.toLocaleString('en-US'))
        : T('fpj.tier.unlimited', 'Unlimited'))));
      foot.appendChild(inertBtn('reward-tier__cta', esc(T('fpj.tier.cta', 'Select →'))));
      card.appendChild(foot);
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    return sec;
  }

  /* 預算分配（前台 .budget-split）：分段長條＋三欄圖例（百分比、換算後金額）。
     前台三段固定配色（製作／宣傳／周邊）；這裡的分類是創作者自填、數量不定，改依序輪替站上圖表色（第 6 段）。 */
  function budgetSection(m, api) {
    var f = m.fund || {};
    var goal = f.goal ? amountOf(api, f.goal, null) : 0;
    var sec = el('section', 'detail-section');
    sec.setAttribute('data-fpj-budget', '');
    sec.appendChild(sectionHead('fpj.sec.budget', 'Budget allocation',
      goal ? T('fpj.budget.total', 'Total {amt}').replace('{amt}', codeMoney(api, goal)) : ''));
    var split = el('div', 'budget-split');
    var bar = el('div', 'budget-split__bar');
    var legend = el('div', 'budget-split__legend');
    m.budget.forEach(function (r) {
      var pct = Math.max(0, Number(r.pct) || 0);
      var seg = el('span', 'budget-split__seg');
      seg.style.flex = String(pct);
      bar.appendChild(seg);
      var item = el('div', 'budget-split__item');
      var lab = el('span', 'budget-split__item-label', '<span class="budget-split__dot" aria-hidden="true"></span>');
      lab.appendChild(slot(api, 'span', '', r.label, T('cpp.fd.budget.name.ph', 'e.g. Production')));
      item.appendChild(lab);
      item.appendChild(el('span', 'budget-split__pct', esc(pct + '%')));
      item.appendChild(el('span', 'budget-split__amount', esc(goal ? codeMoney(api, goal * pct / 100) : '—')));
      legend.appendChild(item);
    });
    split.appendChild(bar);
    split.appendChild(legend);
    sec.appendChild(split);
    return sec;
  }

  window.ztorFanProjectPage = { render: render };
})();
