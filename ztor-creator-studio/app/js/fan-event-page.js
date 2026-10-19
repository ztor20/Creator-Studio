/* fan-event-page.js — 粉絲視角活動頁的渲染函式（D305，2026-09-22；同日改為前台鏡像；2026-10-16 D443 改照新前台）
 *
 * 發布前預覽確認（主規格 §7.4）的預覽檢視自 D305 起是「粉絲視角完整頁」：內容等同粉絲端
 * 活動頁會呈現的全部設定。兩個宿主——建立活動（create-event.html 第 8 步，發布前）與活動詳情的「預覽與在地化」
 * 全頁版（event-localization.html，發布後再開；D310 起不是浮層）——都把自己的資料整理成
 * 同一個 `model`，交給本檔畫；
 * 本檔只知道「粉絲頁長什麼樣」，不知道資料從表單還是從 events-store 來。
 *
 * ── 2026-10-16 D443：照新前台（https://ztor.vercel.app/shop-item.html?id=ev-soundtrack-unplugged）──
 *   · 門票與套組合成同一頁：「票券頁／票務商品頁」兩個視圖與 CS 端的切換控件（.pp-fan-viewbar）退場（墓碑）。
 *   · 活動詳情＝左欄閱讀區（描述 → 活動地點地圖，D443 決定八）＋右側欄（卡司 → 單票 → 套組），寬版右側欄跟著捲動；
 *     窄版右側欄攤平（display:contents），卡司排到描述前、單票與套組排在描述與地圖之後（前台同款）。
 *   · 套組卡（.pdp-tier--set）的「看詳情 ›」開組合包詳情彈窗（.ds-modal.pdp-peek.pdp-setview）：寬版置中、
 *     窄版由下往上的面板；彈窗只蓋預覽區（掛在 .fep-shop 裡，position:absolute），宿主側欄照常可用；
 *     宿主因切語言／幣別重畫時，彈窗依穩定宿主（[data-pstage-host] 或 host）上記住的那一組（價格鍵）重新打開、不播動畫。
 *   · 頁面下方「購票方案」大圖卡（.pdp-recs--options），預覽區窄於 768 不顯示（前台同款）。
 *   · 排版依預覽區自己的寬度切換（容器查詢，fan-shop.css 第 7 段），不依整個視窗（D443 決定七）。
 *   · 折扣畫「開賣當下」的價格（D443 決定三）：宿主算好 tiers[].offer／bundles[].offer 交進來，本檔只畫。
 *   · 單買價格一律寫單價（D443 決定四）。
 *   · 與現行規則衝突處照規則畫（D443 決定九）：不畫額外權益（D402）與注意事項（D334）、限購只寫每人總限購（D427）、
 *     退換票是平台固定文案（D313）、發布前沒有銷售資料所以不畫「即將售罄」。
 *   證據：docs/fe-mirror-2026-10-16/（參考頁渲染後的 <main> 與看詳情彈窗 DOM）。
 *
 * ── 2026-09-22 使用者裁決：「預覽 UI 必須做得和這兩個一模一樣，只是資料和機制套用我們的流程與功能」──
 *   本檔輸出的 DOM 結構與 class 名照前台渲染後的 <main>，CSS 是前台規則加 `.fep-shop` 前綴的鏡像
 *   （ds-components/fan-shop.css；本頁專用規則在第 7 段）。與前台的差別只在：
 *   · 資料全部來自我們的流程（名稱／亮點／描述／卡司／取票方式／門票／組合包）
 *   · 前台專有的互動拿掉：pdp-topbar 保留 markup 但不可點、「情境展示」浮鈕不畫、
 *     購買類按鈕（購票／購買／購買套組／收藏／購物車／查看單品）不動作（data-pp-inert）；「看詳情」與彈窗的關閉、縮圖切換可以按
 *   · 亮點（D300）前台沒有位置：放名稱下方一行 `.pdp-buy__highlight`（UIA-167）
 *   · 退換票：平台統一文案（2026-09-23 D313 拍板）——一律吃 i18n `fep.refund.fixed`，預覽裡唯讀、不進 editZones。
 *     `refund` 參數（字串覆蓋／false 不畫）保留為渲染器彈性，活動宿主不使用。
 *   · 地圖（D369）：前台沒有這一節，放左欄描述之後（D443 決定八）；資訊表場館下另加「在 Google 地圖查看 ›」（不動作）
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
 *     venue: 'Taipei Music Center' | { key:'venue' }, address: '…', language: '廣東話、普通話' | ['廣東話','普通話'],   // D328 活動語言可複選
 *                                                // D445（2026-10-19）：venue 可給 { key }（場地名稱是可翻譯文案）；meet／transit 同形，沒值給 null＝不畫
 *     meet: { key:'venue-meet' } | '2 號門售票口' | null,         // 集合地點（D445）：畫在「活動地點」一節、地圖下方；有值才畫
 *     transit: { key:'venue-transit' } | '捷運站步行 3 分鐘' | null,   // 交通說明（D445）：同上
 *                                                // D369：address 有值時，詳情左欄描述之後多畫「活動地點」一節＝依地址產生的地圖（partials/venue-map.js）
 *     priority: { window: '…', state: '…' } | null,   // 優先購（原型示意）
 *     limit: '每人最多 4 張' | null,   // D427：每人總限購
 *     desc: { key:'desc' },
 *     descBlocks: [{ type:'text', text, html } | { type:'image'|'video', src }] | undefined,   // D354：描述的區塊
 *     descMedia: [{ type:'image'|'video', src }] | undefined,   // D335 舊形狀（沒給 descBlocks 時才用）
 *     lineup: [{ name: '周湯豪', role: { key:'role-0' } | null }],
 *     pickup: '電子門票',                       // 取票方式（資訊表「取票」一列＋詳情的取票方式一節）
 *     refund: undefined | string | false,       // 沒給＝平台固定文案；字串＝自訂；false＝不畫
 *     terms: { key:'tnc' } | null,
 *     tiers: [{ key:'tier-vip', name:{ key:'tier-vip' }, note:'', hidden:false, priceObj, soldOut:false, priceKey:'tier:tier-vip',
 *               img:'images/…',                                  // 購票方案大圖卡的圖（D353 門票圖片；沒給退回主視覺）
 *               offer:{ amount, timed, to } | null }],           // D443 決定三：開賣當下的折扣價（amount＝基準幣別、與 priceObj.amount 同單位）；
 *                                                                 //   timed＝限時（畫「限時折扣」標與「優惠至 {to}」）；沒有＝照票價
 *                                                // D328：hidden:true 的列不畫；墓碑 2026-10-16（D443）：deal（{ win, to, gen } 兩段價寫成一行）不再讀，改讀 offer
 *     bundles: [{ name:'…' | { key:'bundle-name-bd-1' }, priceObj, listPriceObj|null, priceKey:'bundle:bd-1',   // D445：name／desc 可給 { key }（可翻譯文案）
 *                 imgs:['…'], img:'…',                                  // 組合包圖片（第一張＝封面；沒給 imgs 用 img）
 *                 offer:{ pct, to } | null,                             // D443 決定三：開賣當下生效的限時折扣（百分比、結束時間顯示字串）
 *                 tickets:{ names:['VIP','Floor'], qty:2, unitPriceObj, unitFrom:true, when:'2026-12-05 19:30 · Taipei Music Center',
 *                           whenBase:'2026-12-05 19:30', 【D445：給了就由本檔接「 · 場地名稱（譯文）」，when 可省略】 } | null,
 *                 goods:[{ name:'官方 Tee', qty:1, spec:true, img:'…', unitPriceObj }],
 *                 desc:'…' | { key:'bundle-desc-bd-1' } }],              // perks 依 D402 退場：給了也不畫
 *     related: true | [{ name, cat, price:'NT$ 1,200 起', img }] | false
 *   }
 *
 * 價格節點帶 `data-fep-price-key`（票價、組合價、彈窗裡的價格、購買區的價格區間；區間給空字串＝不聚焦單列）：
 * D310 起「價格不就地改」，宿主（js/publish-stage.js）接這個屬性把價格表滑出來。
 *
 * api（由 js/publish-stage.js 的 previewRender 提供）：
 *   lang；getValue(key) → 當前語系的值；bindEditable(el, key) → 掛 inline 編輯；
 *   priceIn(priceObj, priceKey) → 當前幣別的數字；money(priceObj, priceKey) → 格式化字串；fmt(n)。
 *   墓碑 2026-10-16（D443）：view／views／setView（兩個視圖）不再讀。
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
  /* ── 描述（D354，2026-10-05；前身 D340）：照區塊排定的順序畫——文字區塊、圖片、影片 ──
     · 預設語言：文字區塊畫格式版（html 已由 partials/rich-body.js 的 sanitize 收成只剩
       p／br／strong／em／a／ul／ol／li／hr；連結帶 target=_blank＝粉絲端新分頁開啟，D354 決定四）
     · 其他語系：每個有字的文字區塊各自一個可翻譯欄位（inline 編輯），譯文是純文字（譯文能否套格式〔產品待確認〕，D340）；
       只有分隔線的文字區塊沒有字可翻，各語系都照原樣畫。圖片與影片不翻譯、位置跟原文相同——所以 key 是
       「第幾個有字的文字區塊」，由 ztorRichBody.fieldKeys() 算，宿主組翻譯表時用同一支，兩邊對得上。
     · 整段過長時的收合交 UI 層（D354 決定七）：原型整段照長度展開、不收合（ASSUMPTIONS UIA-196）。
     沒有 rich-body 可用時退回一整段純文字。 */
  function mediaFig(md) {
    var fig = el('figure', 'pdp-details__media');
    var node = document.createElement(md.type === 'video' ? 'video' : 'img');
    node.src = md.src;
    if (md.type === 'video') { node.controls = true; node.setAttribute('playsinline', ''); node.preload = 'metadata'; }
    else node.alt = '';
    fig.appendChild(node);
    return fig;
  }
  function richBody(api, blocks, baseKey, cls, placeholder) {
    var R = window.ztorRichBody;
    var wrap = el('div', 'pdp-rich' + (cls ? ' ' + cls : ''));
    var list = R ? R.normalize(blocks || []) : [];
    var keys = R ? R.fieldKeys(baseKey, list) : [baseKey];
    var ti = 0;
    list.forEach(function (b) {
      if (b.type !== 'text') { wrap.appendChild(mediaFig(b)); return; }
      var node = el('div', 'pdp-rich__text');
      if (String(b.text || '').trim()) {
        var key = keys[ti++];
        if (api.isDefault !== false) node.innerHTML = b.html || '';
        else { node.classList.add('pdp-rich__text--plain'); api.bindEditable(node, key); }
      } else node.innerHTML = b.html || '';   // 只有分隔線：沒有字可翻，各語系照原樣
      wrap.appendChild(node);
    });
    /* 一段文字都沒有：留一個可翻譯的空欄位（畫斜體佔位），版面不塌 */
    if (!ti) wrap.insertBefore(slot(api, 'div', 'pdp-rich__text pdp-rich__text--plain', { key: keys[0] || baseKey }, placeholder || ''), wrap.firstChild);
    return wrap;
  }
  /* 墓碑 2026-10-05（D354）：clampBody()／infoSections()（說明區塊：標題＋內文、太長才收合「展開全文」，D340，
     .pdp-info[data-feat="S60"]）隨說明區塊退場——原說明區塊的內容是描述裡的無標題文字區塊，由上面的 richBody 照順序畫。 */

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

  /* ── 價格：開賣當下的價（D443 決定三）＋刪除線原價＋−% ─────────────────────── */
  /* 折後價取整：有小數位的幣別（USD／SGD）留兩位，其餘取整數（同 events-store 換算後的顯示習慣） */
  function roundFor(api) { return /^(USD|SGD)$/.test(api.currency || '') ? function (n) { return Math.round(n * 100) / 100; } : function (n) { return Math.round(n); }; }
  function pctOff(now, was) { return was > 0 ? Math.round((1 - now / was) * 100) : 0; }
  /* 單票：offer.amount 與 priceObj.amount 同單位（基準幣別）——用比例套到當前幣別的票價上，
     幣別覆寫價照樣生效；沒有 offer＝照票價、沒有刪除線 */
  function tierPrice(api, t) {
    var cur = numOf(api, t.priceObj, t.priceKey);
    var o = t.offer;
    var base = t.priceObj && Number(t.priceObj.amount);
    if (!o || o.amount == null || !(base > 0) || Number(o.amount) >= base) return { now: cur, was: null, timed: false, to: '' };
    return { now: roundFor(api)(cur * Number(o.amount) / base), was: cur, timed: !!o.timed, to: o.to || '' };
  }
  /* 套組：售價（組合折扣後）× 開賣當下生效的限時折扣；刪除線＝原價合計（沒有原價合計但有限時折扣時＝售價） */
  function setPrice(api, b) {
    var sell = numOf(api, b.priceObj, b.priceKey);
    var o = b.offer && Number(b.offer.pct) > 0 ? b.offer : null;
    var now = o ? roundFor(api)(sell * (1 - Number(o.pct) / 100)) : sell;
    var list = b.listPriceObj ? numOf(api, b.listPriceObj, null) : 0;
    var was = list > now ? list : (o && sell > now ? sell : null);
    return { now: now, was: was, timed: !!o, to: o ? (o.to || '') : '' };
  }
  function multiTix(b) { return !!(b.tickets && b.tickets.names && b.tickets.names.length > 1); }
  /* 「NT$ 2,800<span class=pdp-tier__was><s>NT$ 3,200</s> <span class=price-pct>−13%</span></span>」——前台 .pdp-tier__price 的內容 */
  function priceHtml(api, p, from) {
    var nowStr = fmtNum(api, p.now);
    if (from) nowStr = T('fep.bd.from', 'From {price}').replace('{price}', nowStr);
    var h = esc(nowStr);
    if (p.was) h += '<span class="pdp-tier__was"><s>' + esc(fmtNum(api, p.was)) + '</s> <span class="price-pct">−' + pctOff(p.now, p.was) + '%</span></span>';
    return h;
  }
  function dealTag() { return ' <span class="price-pct price-pct--word pdp-tier__deal" data-i18n="fep.deal.tag">' + esc(T('fep.deal.tag', 'Limited-time offer')) + '</span>'; }
  function dealEnds(to) { return '<span class="pdp-tier__meta pdp-tier__deal-ends">' + esc(T('fep.deal.until', 'Offer ends {t}').replace('{t}', to)) + '</span>'; }

  /* 套組成員列（前台 .pdp-rec-card__parts[role=list]）：票券＝允許門票名單（多種時「（座位任選）」）× 張數；商品＝名稱（有規格「（規格任選）」）× 數量。
     「票券」「商品」兩個字是前台 CSS 的 content 字串，英文預覽由 fan-shop.css 換掉（UIA-167）。 */
  function partsHtml(b) {
    var out = '';
    var tx = b.tickets;
    if (tx && tx.names && tx.names.length) {
      out += '<span class="pdp-rec-card__part" role="listitem" data-kind="ticket"><span>' +
        esc(tx.names.join('／') + (tx.names.length > 1 ? T('fep.set.pick', ' (any seat)') : '') + ' × ' + (Number(tx.qty) || 1)) + '</span></span>';
    }
    (b.goods || []).forEach(function (g) {
      out += '<span class="pdp-rec-card__part" role="listitem" data-kind="goods"><span>' +
        esc((g.name || '') + (g.spec ? T('fep.set.spec', ' (any option)') : '') + ' × ' + (Number(g.qty) || 1)) + '</span></span>';
    });
    return out ? '<span class="pdp-rec-card__parts" role="list">' + out + '</span>' : '';
  }
  function setImgs(b) { return (b.imgs && b.imgs.length ? b.imgs : [b.img || (b.goods && b.goods[0] && b.goods[0].img) || '']).filter(Boolean); }

  /* ── 看詳情彈窗（前台 #pdpSetView：.ds-modal.pdp-peek.pdp-setview）──────────────────
     掛在 .fep-shop 裡、只蓋預覽區；.fep-modal__stage 是鏡像唯一加的殼——跟著捲動黏在可視範圍
     （fan-shop.css 第 7 段），面板照前台：寬版置中 720、窄版由下往上的面板（有抓柄、沒有 ✕）。
     「購買套組」「查看單品 ›」保留外觀、不動作；價格點了開價格表（宿主認 data-fep-price-key）。 */
  function setViewEl(api, b, i, instant) {
    var p = setPrice(api, b);
    var imgs = setImgs(b);
    var m = el('div', 'ds-modal pdp-peek pdp-setview is-open' + (instant ? ' is-instant' : ''));
    m.setAttribute('data-size', 'lg');
    m.setAttribute('data-fep-setview', String(i));
    m.setAttribute('data-pp-no-zone', '');
    m.setAttribute('aria-label', T('fep.set.view', 'Set details'));
    var gal = '<div class="pdp-setview__gallery"><div class="pdp-peek__media pdp-setview__media' + (imgs[0] ? '' : ' pdp-setview__media--empty') + '">' +
      (imgs[0] ? '<img class="pdp-peek__img" data-setview-main src="' + esc(imgs[0]) + '" alt="' + esc(b.name || '') + '" draggable="false">' : '<i data-lucide="package" class="ztor-icon"></i>') + '</div>';
    if (imgs.length > 1) {
      gal += '<div class="pdp-peek__thumbs pdp-setview__thumbs">' + imgs.map(function (src, k) {
        return '<button class="pdp-peek__thumb' + (k === 0 ? ' is-active' : '') + '" type="button" data-setview-shot="' + esc(src) + '" aria-label="' +
          esc(T('fep.gallery.view', 'View image {n}').replace('{n}', k + 1)) + '">' + imgTag(src) + '</button>';
      }).join('') + '</div>';
    }
    gal += '</div>';
    var info = '<div class="pdp-setview__info"><div class="pdp-setview__head">' +
      '<span class="pdp-rec-card__kind" data-i18n="fep.set.kind">' + esc(T('fep.set.kind', 'Set')) + '</span>' +
      '<h2 class="ds-modal__title pdp-peek__name">' + esc(b.name || T('cpp.bd.untitled', 'Untitled bundle')) + (p.timed ? dealTag() : '') + '</h2>' +
      '<p class="pdp-peek__price pdp-setview__total" data-fep-price-key="' + esc(b.priceKey || '') + '">' +
        esc(multiTix(b) ? T('fep.bd.from', 'From {price}').replace('{price}', fmtNum(api, p.now)) : fmtNum(api, p.now)) +
        (p.was ? ' <s>' + esc(fmtNum(api, p.was)) + '</s> <span class="price-pct">−' + pctOff(p.now, p.was) + '%</span>' : '') + '</p>' +
      (p.timed && p.to ? dealEnds(p.to) : '') +
      (b.desc ? '<p class="pdp-setview__note">' + esc(b.desc) + '</p>' : '') +
      '</div>';
    /* 單買＝單價（D443 決定四）：票券「單買 NT$ 1,200／張」（多種門票可選時取最低、加「起」）、商品「單買 NT$ 790／件」 */
    var tx = b.tickets;
    if (tx && tx.names && tx.names.length) {
      var tu = tx.unitPriceObj ? fmtNum(api, numOf(api, tx.unitPriceObj, null)) : '';
      if (tu && tx.unitFrom) tu = T('fep.bd.from', 'From {price}').replace('{price}', tu);
      info += '<section class="pdp-bundle pdp-setview__sec" aria-label="' + esc(T('fep.set.tickets', 'Tickets')) + '"><h2 class="pdp-bundle__title" data-i18n="fep.set.tickets">' + esc(T('fep.set.tickets', 'Tickets')) + '</h2>' +
        '<ul class="pdp-setview__list"><li class="pdp-setview__row"><span class="pdp-setview__name">' +
        esc(tx.names.join('／') + (tx.names.length > 1 ? T('fep.set.pick', ' (any seat)') : '') + ' × ' + (Number(tx.qty) || 1)) + '</span>' +
        (tx.when ? '<span class="pdp-setview__meta">' + esc(tx.when) + '</span>' : '') +
        (tu ? '<span class="pdp-setview__price">' + esc(T('fep.set.single.tix', '{p} each').replace('{p}', tu)) + '</span>' : '') +
        '</li></ul></section>';
    }
    var goods = b.goods || [];
    if (goods.length) {
      info += '<section class="pdp-bundle pdp-setview__sec" aria-label="' + esc(T('fep.set.goods', 'Goods')) + '"><h2 class="pdp-bundle__title" data-i18n="fep.set.goods">' + esc(T('fep.set.goods', 'Goods')) + '</h2><ul class="pdp-setview__list">' +
        goods.map(function (g) {
          var gu = g.unitPriceObj ? fmtNum(api, numOf(api, g.unitPriceObj, null)) : '';
          return '<li class="pdp-setview__row pdp-setview__row--goods">' +
            '<span class="pdp-setview__thumb" aria-hidden="true">' + (g.img ? imgTag(g.img) : '') + '</span>' +
            '<span class="pdp-setview__name">' + esc((g.name || '') + ' × ' + (Number(g.qty) || 1)) + '</span>' +
            (g.spec ? '<span class="pdp-setview__meta"><span>' + esc(T('fep.set.spec.at', 'Options chosen at checkout')) + '</span></span>' : '') +
            '<a class="pdp-setview__link" data-pp-inert tabindex="-1">' + esc(T('fep.set.item', 'View item')) + '<span aria-hidden="true"> ›</span></a>' +
            (gu ? '<span class="pdp-setview__price">' + esc(T('fep.set.single.goods', '{p} each').replace('{p}', gu)) + '</span>' : '') +
            '</li>';
        }).join('') + '</ul></section>';
    }
    /* 墓碑 2026-10-16（D443 決定九）：前台彈窗的額外權益清單（.pdp-rec-card__perks）不畫——D402 組合包沒有額外權益 */
    m.innerHTML = '<div class="ds-modal__scrim" data-fep-setview-close></div>' +
      '<div class="fep-modal__stage">' +
        '<div class="ds-modal__panel" role="dialog" aria-modal="true" aria-label="' + esc(b.name || '') + '">' +
          '<div class="pdp-peek__grip" aria-hidden="true"><span></span></div>' +
          '<button class="ds-modal__close" type="button" data-fep-setview-close aria-label="' + esc(T('fep.close', 'Close')) + '"><i data-lucide="x" class="ztor-icon"></i></button>' +
          '<div class="ds-modal__body pdp-peek__body"><div class="pdp-setview__layout">' + gal + info + '</div></div>' +
          '<div class="ds-modal__footer pdp-peek__footer"><button class="btn btn--mono btn--lg" type="button" data-setview-buy data-pp-inert tabindex="-1" data-i18n="fep.set.buy">' + esc(T('fep.set.buy', 'Buy set')) + '</button></div>' +
        '</div>' +
      '</div>';
    /* 縮圖切主圖（預覽裡可以按：只換圖，不涉及購買） */
    m.addEventListener('click', function (e) {
      var shot = e.target.closest('[data-setview-shot]');
      if (!shot) return;
      var main = m.querySelector('[data-setview-main]');
      if (main) main.src = shot.getAttribute('data-setview-shot');
      m.querySelectorAll('.pdp-peek__thumb').forEach(function (x) { x.classList.toggle('is-active', x === shot); });
    });
    return m;
  }

  /* 看詳情彈窗開著哪一組（價格鍵）：記在「穩定的宿主」上——publish-stage 掛載的外層（[data-pstage-host]，
     create-event 切語言會整個重掛預覽區，外層不變），沒有就記在 host 本身；宿主重畫後照樣打開（render 末段）。
     同一頁有好幾份渲染（design-system.html 的 demo）時各記各的。 */
  var escWired = false;
  function anchorOf(host) { return (host.closest && host.closest('[data-pstage-host]')) || host; }

  /* ── 主體 ─────────────────────────────────────────────────────────── */
  function render(host, model, api) {
    host.innerHTML = '';
    var m = model || {};
    /* D328：隱藏的票不在票價清單列出（也不算進價格區間與「N 種購票方案」）；它仍可在組合包裡被賣出。 */
    var tiers = (m.tiers || []).filter(function (t) { return !t.hidden; });
    /* D445：場地名稱與組合包名稱／描述是可翻譯文案，宿主給 { key }（或舊式純字串）；這裡一次換成當前語系的字串
       （沒填譯文就是原文，publish-stage 的 displayValue 負責），其餘各處照舊吃字串。 */
    var venueText = valueOf(api, m.venue);
    var meetText = valueOf(api, m.meet);
    var transitText = valueOf(api, m.transit);
    var bundles = (m.bundles || []).map(function (b) {
      var r = Object.assign({}, b);
      r.name = valueOf(api, b.name);
      r.desc = valueOf(api, b.desc);
      if (b.tickets && b.tickets.whenBase != null) {
        r.tickets = Object.assign({}, b.tickets, { when: [b.tickets.whenBase, venueText].filter(Boolean).join(' · ') });
      }
      return r;
    });
    var nameText = valueOf(api, m.name);
    /* 墓碑 2026-10-16（D443 決定一）：CS 端的視圖切換（.pp-fan-viewbar ＋ .segmented「票券頁／票務商品頁」）與
       data-fep-view／isBundles 分支退場——門票與套組合成同一頁。 */

    var root = el('div', 'fep-shop fep-shop--event rf-shop');
    root.setAttribute('lang', api.lang === 'zh' ? 'zh-Hant' : (api.lang || 'en'));

    var main = el('main');
    var section = el('section', 'section section-bg-page section--flush-top');
    var pdp = el('div', 'pdp');
    pdp.setAttribute('data-pdp', ''); pdp.setAttribute('aria-busy', 'false'); pdp.setAttribute('data-type', 'event');

    /* 手機頂欄（預覽區 <768 才顯示）：保留結構，不可點 */
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
    /* 墓碑 2026-10-12（D404）：主視覺裁切位置（keyvisualPos）退場——不提供調整裁切，主圖框一律 contain。 */
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

    /* 資訊表：日期／時間／時長／場館＋地址＋地圖連結／語言／優先購／限購／取票 */
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
    /* 新前台：場館下多一行「在 Google 地圖查看 ›」（預覽不動作，D443 決定八的呈現參考） */
    row('fep.venue', 'Venue', venueText ? esc(venueText) + (m.address ? '<small>' + esc(m.address) + '</small>' +
      '<a class="pdp-event-meta__map" data-pp-inert>' + dsIcon('map-pin') + '<span data-i18n="fep.map.link">' + esc(T('fep.map.link', 'View on Google Maps ›')) + '</span></a>' : '') : '');
    var langVal = Array.isArray(m.language) ? m.language.filter(Boolean).join(T('ce.evlang.sep', ', ')) : m.language;
    row('fep.language', 'Language', esc(langVal));
    if (m.priority) row('fep.priority', 'Early access', '<span class="pdp-event-meta__nowrap">' + esc(m.priority.window) + '</span>' + (m.priority.state ? '<small>' + esc(m.priority.state) + '</small>' : ''), 'pdp-event-meta__row--names');
    row('fep.limit', 'Limit', esc(m.limit));
    row('fep.pickup.k', 'Tickets', esc(m.pickup));
    buy.appendChild(em);

    /* 票價區間（開賣當下的單票價；沒有單票時改用套組價）＋「票券優惠」＋「N 種購票方案 ›」 */
    var tierPs = tiers.map(function (t) { return tierPrice(api, t); });
    var setPs = bundles.map(function (b) { return setPrice(api, b); });
    var price = el('div', 'pdp-event-price');
    var pk = el('span', 'pdp-event-price__k'); pk.setAttribute('data-i18n', 'fep.price.k'); pk.textContent = T('fep.price.k', 'Price');
    var pv = el('span', 'pdp-event-price__v');
    var rangeSrc = tierPs.length ? tierPs : setPs;
    if (rangeSrc.length) {
      pv.textContent = rangeText(api, rangeSrc.map(function (p) { return p.now; }));
      /* D310：區間不對應單一列，key 給空字串＝開表但不聚焦任何一格 */
      pv.setAttribute('data-fep-price-key', '');
    } else { pv.classList.add('is-empty'); pv.textContent = T('ce.pv.tickets', 'Tickets coming soon'); }
    price.appendChild(pk); price.appendChild(pv);
    if (tierPs.concat(setPs).some(function (p) { return !!p.was; })) {
      var sale = el('span', 'status-tag status-tag--green pdp-event-price__sale'); sale.setAttribute('data-i18n', 'fep.price.sale'); sale.textContent = T('fep.price.sale', 'Ticket deals');
      price.appendChild(sale);
    }
    var nPlans = tiers.length + bundles.length;
    if (nPlans) {
      var plink = el('button', 'pdp-event-price__link'); plink.type = 'button'; plink.setAttribute('data-pdp-tiers', '');
      plink.textContent = T('fep.plans.n', '{n} ticket options').replace('{n}', nPlans) + ' ›';
      plink.addEventListener('click', function () { var d = root.querySelector('[data-pdp-tiers-target]'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      price.appendChild(plink);
    }
    buy.appendChild(price);

    var actions = el('div', 'pdp-buy__actions');
    actions.innerHTML =
      '<button class="btn btn--mono btn--lg pdp-buy__add" type="button" data-pdp-ticket data-pp-inert tabindex="-1"><span data-add-label data-i18n="fep.cta.buy">' + esc(T('fep.cta.buy', 'Buy tickets')) + '</span></button>' +
      '<button class="pdp-buy__heart" type="button" data-pdp-wish data-pp-inert tabindex="-1" aria-pressed="false" aria-label="' + esc(T('fep.wish', 'Add to wishlist')) + '">' + SVG.heart + '</button>';
    buy.appendChild(actions);
    grid.appendChild(buy);
    container.appendChild(grid);
    page.appendChild(container);

    /* ── 活動詳情：左欄（描述 → 活動地點）＋右側欄（卡司 → 單票 → 套組） ── */
    var details = el('section', 'pdp-details pdp-details--event');
    details.setAttribute('aria-label', T('fep.details.label', 'Event details'));
    var inner = el('div', 'pdp-details__inner container');
    var h2 = el('h2', 'pdp-details__heading'); h2.setAttribute('data-i18n', 'fep.sec.about'); h2.textContent = T('fep.sec.about', 'About');
    inner.appendChild(h2);
    var layout = el('div', 'pdp-details__layout');
    var dmain = el('div', 'pdp-details__main');
    /* 描述（D354）：宿主給了 descBlocks 就照區塊順序畫（文字含格式、圖片、影片，見 richBody），
       整塊仍掛 lead 段 class（預覽的「編輯」入口認它）。沒給的舊宿主退回 D335 的最小做法（UIA-187）。
       整段過長的收合交 UI 層，原型照長度展開（UIA-196）。 */
    if (m.descBlocks) {
      dmain.appendChild(richBody(api, m.descBlocks, (m.desc && m.desc.key) || 'desc', 'pdp-details__lead', T('cp.pv.desc-ph', 'Description')));
    } else {
      dmain.appendChild(slot(api, 'p', 'pdp-details__lead', m.desc, T('cp.pv.desc-ph', 'Description')));
      (m.descMedia || []).forEach(function (md) { if (md && md.src) dmain.appendChild(mediaFig(md)); });
    }
    /* 活動地點（D369）：依完整地址產生的地圖。新前台沒有這一節，D443 決定八放在描述之後。沒有地址＝不畫。 */
    var mapHtml = (m.address && window.ztorVenueMap) ? window.ztorVenueMap.html({ address: m.address }) : '';
    /* 集合地點與交通說明（D445 決定三）：畫在「活動地點」一節、地圖下方；有值才畫（兩項都沒有、也沒有地址＝整節不畫）。
       沿用資訊表的列樣式（.pdp-event-meta），不新增元件。 */
    var metaRows = '';
    if (meetText) metaRows += '<div class="pdp-event-meta__row" data-fep-meet><span class="pdp-event-meta__k" data-i18n="fep.meet">' + esc(T('fep.meet', 'Meeting point')) + '</span><span>' + esc(meetText) + '</span></div>';
    if (transitText) metaRows += '<div class="pdp-event-meta__row" data-fep-transit><span class="pdp-event-meta__k" data-i18n="fep.transit">' + esc(T('fep.transit', 'Getting there')) + '</span><span>' + esc(transitText) + '</span></div>';
    if (mapHtml || metaRows) {
      var vb = el('div', 'pdp-details__specs-block pdp-details__venue');
      vb.setAttribute('data-fep-venue', '');
      vb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('map-pin') + '<span data-i18n="fep.sec.venue">' + esc(T('fep.sec.venue', 'Location')) + '</span></h3>' +
        (venueText ? '<p class="pdp-details__shipping-text">' + esc(venueText) + '</p>' : '') + mapHtml +
        (metaRows ? '<div class="pdp-event-meta pdp-event-meta--venue">' + metaRows + '</div>' : '');
      dmain.appendChild(vb);
    }
    layout.appendChild(dmain);

    var aside = el('aside', 'pdp-details__aside');
    /* 卡司陣容 chips：人名維持原文、角色標籤可翻譯（§7.4），前台寫法是「角色 人名」一顆 chip */
    if (m.lineup && m.lineup.length) {
      var blk = el('div', 'pdp-details__specs-block pdp-story__lineup');
      blk.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('user') + '<span data-i18n="fep.sec.lineup">' + esc(T('fep.sec.lineup', 'Lineup')) + '</span></h3>';
      var list = el('div', 'pdp-lineup__list');
      m.lineup.forEach(function (p) {
        var chip = el('span', 'pdp-lineup__chip');
        if (p.role) { chip.appendChild(slot(api, 'span', '', p.role, '')); chip.appendChild(document.createTextNode(' ')); }
        chip.appendChild(document.createTextNode(p.name || ''));
        list.appendChild(chip);
      });
      blk.appendChild(list);
      aside.appendChild(blk);
    }

    /* 單票（前台 .pdp-tiers-block）：票名＋限時折扣標、說明、優惠至；價格＝開賣當下的價＋刪除線原價＋−%；購買鈕不動作。
       發布前沒有銷售資料，「即將售罄」不畫（D443 決定九）。 */
    var tb = el('div', 'pdp-details__specs-block pdp-tiers-block'); tb.setAttribute('data-pdp-tiers-target', '');
    tb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('ticket') + '<span data-i18n="fep.sec.single">' + esc(T('fep.sec.single', 'Tickets')) + '</span></h3>';
    var tl = el('div', 'pdp-tiers pdp-tiers--info'); tl.setAttribute('data-tiers', ''); tl.setAttribute('role', 'list'); tl.setAttribute('aria-label', T('fep.sec.single', 'Tickets'));
    if (!tiers.length) {
      var e0 = el('div', 'pdp-tier pdp-tier--info');
      e0.innerHTML = '<span class="pdp-tier__main"><span class="pdp-tier__label is-empty">' + esc(T('ce.pv.tickets', 'Tickets coming soon')) + '</span></span>';
      tl.appendChild(e0);
    }
    tiers.forEach(function (t, i) {
      var p = tierPs[i];
      var tr = el('div', 'pdp-tier pdp-tier--info' + (t.soldOut ? ' is-oos' : '')); tr.setAttribute('data-tier', String(i)); tr.setAttribute('role', 'listitem');
      var mainEl = el('span', 'pdp-tier__main');
      var lab = slot(api, 'span', 'pdp-tier__label', t.name, T('ce.tier.untitled', 'Untitled tier'));
      mainEl.appendChild(lab);
      if (p.timed) { var dtag = el('span', 'price-pct price-pct--word pdp-tier__deal'); dtag.setAttribute('data-i18n', 'fep.deal.tag'); dtag.textContent = T('fep.deal.tag', 'Limited-time offer'); lab.insertAdjacentElement('afterend', dtag); }
      if (t.note) mainEl.appendChild(el('span', 'pdp-tier__meta', esc(t.note)));
      if (p.timed && p.to) mainEl.insertAdjacentHTML('beforeend', dealEnds(p.to));
      /* 墓碑 2026-10-16（D443 決定三）：D367 的兩段價說明行（「限時 {p}（至 {to}）· 之後 {p}」）不再畫——預覽只畫開賣當下的價 */
      tr.appendChild(mainEl);
      var tprice = el('span', 'pdp-tier__price' + (p.was ? ' pdp-tier__price--sale' : ''), priceHtml(api, p, false));
      tprice.setAttribute('data-fep-price-key', t.priceKey || '');   /* D310：點價格開價格表 */
      tr.appendChild(tprice);
      var b = el('button', 'btn btn--yellow-ghost btn--sm pdp-tier__buy'); b.type = 'button'; b.setAttribute('data-pp-inert', ''); b.tabIndex = -1;
      var tn = valueOf(api, t.name);
      if (t.soldOut) { b.disabled = true; b.setAttribute('data-i18n', 'fep.tier.soldout'); b.textContent = T('fep.tier.soldout', 'Sold out'); b.setAttribute('aria-label', tn + ' ' + T('fep.tier.soldout', 'Sold out')); }
      else { b.setAttribute('data-pdp-tier-buy', t.key || ''); b.setAttribute('data-i18n', 'fep.tier.buy'); b.textContent = T('fep.tier.buy', 'Buy'); b.setAttribute('aria-label', T('fep.tier.buy', 'Buy') + ' ' + tn); }
      tr.appendChild(b);
      tl.appendChild(tr);
    });
    tb.appendChild(tl);
    aside.appendChild(tb);

    /* 套組（前台 .pdp-sets-aside）：名稱＋限時折扣標、成員列、優惠至、價格、「看詳情 ›」；右側購買鈕不動作。
       限購只寫每人總限購（在資訊表，D427）；額外權益不畫（D402）。 */
    var anchor = anchorOf(host);
    function openSet(i, instant) {
      closeSet();
      if (!bundles[i]) return;
      anchor.__fepOpenKey = bundles[i].priceKey || ('#' + i);
      var mv = setViewEl(api, bundles[i], i, instant);
      root.appendChild(mv);
      if (window.ztorIcons) window.ztorIcons.applyIcons(mv);
      if (window.applyI18n && !instant) { /* 文字已由 T() 給，避免重套 */ }
      var cls = mv.querySelector('.ds-modal__close');
      if (cls && !instant) try { cls.focus({ preventScroll: true }); } catch (_) {}
    }
    function closeSet() {
      var old = root.querySelector('[data-fep-setview]');
      if (old) old.remove();
      anchor.__fepOpenKey = null;
    }
    if (bundles.length) {
      var sb2 = el('div', 'pdp-details__specs-block pdp-tiers-block pdp-sets-aside'); sb2.setAttribute('data-fep-sets', '');
      sb2.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('ticket') + '<span data-i18n="fep.sec.sets">' + esc(T('fep.sec.sets', 'Sets')) + '</span></h3>';
      var sl = el('div', 'pdp-tiers pdp-tiers--info'); sl.setAttribute('role', 'list'); sl.setAttribute('aria-label', T('fep.sec.sets', 'Sets'));
      bundles.forEach(function (b, i) {
        var p = setPs[i];
        var card = el('div', 'pdp-tier pdp-tier--info pdp-tier--set'); card.setAttribute('role', 'listitem'); card.setAttribute('data-bundle', b.priceKey || String(i));
        var bn = b.name || T('cpp.bd.untitled', 'Untitled bundle');
        card.innerHTML = '<span class="pdp-tier__main">' +
            '<span class="pdp-tier__label">' + esc(bn) + (p.timed ? dealTag() : '') + '</span>' +
            partsHtml(b) +
            (p.timed && p.to ? dealEnds(p.to) : '') +
            '<span class="pdp-tier__price' + (p.was ? ' pdp-tier__price--sale' : '') + '" data-fep-price-key="' + esc(b.priceKey || '') + '">' + priceHtml(api, p, multiTix(b)) + '</span>' +
            '<button class="pdp-bundle-item__link pdp-tier__more" type="button" data-set-view="' + i + '"><span data-i18n="fep.set.more">' + esc(T('fep.set.more', 'Details')) + '</span><span aria-hidden="true"> ›</span></button>' +
          '</span>' +
          '<button class="btn btn--yellow-ghost btn--sm pdp-tier__buy" type="button" data-bundle-buy="' + i + '" data-pp-inert tabindex="-1" aria-label="' + esc(T('fep.tier.buy', 'Buy') + ' ' + bn) + '" data-i18n="fep.tier.buy">' + esc(T('fep.tier.buy', 'Buy')) + '</button>';
        sl.appendChild(card);
      });
      sb2.appendChild(sl);
      aside.appendChild(sb2);
    }
    layout.appendChild(aside);
    inner.appendChild(layout);

    /* 取票方式／退換票：前台是「注意事項（左）＋取票方式、退換票（右）」兩欄；注意事項已刪（D334），
       左欄改放取票方式、右欄放退換票，兩欄不留空（ASSUMPTIONS UIA-272）。 */
    var cols = el('div', 'pdp-details__cols');
    var left = el('div', 'pdp-details__left');
    if (m.pickup) {
      var pb = el('div', 'pdp-details__shipping-block'); pb.setAttribute('data-fep-pickup', '');
      pb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('ticket') + '<span data-i18n="fep.sec.pickup">' + esc(T('fep.sec.pickup', 'Ticket delivery')) + '</span></h3>';
      pb.appendChild(el('p', 'pdp-details__shipping-text', esc(m.pickup)));
      left.appendChild(pb);
    }
    cols.appendChild(left);
    var right = el('div', 'pdp-details__right');
    /* 退換票：平台固定文案（D313）；宿主給字串就用宿主的、給 false 不畫 */
    if (m.refund !== false) {
      var rb = el('div', 'pdp-details__shipping-block');
      rb.innerHTML = '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('history') + '<span data-i18n="fep.sec.refund">' + esc(T('fep.sec.refund', 'Refunds & exchanges')) + '</span></h3>';
      var rp = el('p', 'pdp-details__shipping-text');
      if (typeof m.refund === 'string' && m.refund) rp.textContent = m.refund;
      else { rp.setAttribute('data-i18n', 'fep.refund.fixed'); rp.textContent = T('fep.refund.fixed', 'Tickets sold are non-refundable; if the organizer cancels or postpones, the ticket price is refunded in full.'); }
      rb.appendChild(rp);
      right.appendChild(rb);
    }
    cols.appendChild(right);
    inner.appendChild(cols);
    /* 墓碑 2026-10-16（D443 決定一）：「票種與價格」收合段（details.pdp-terms--tiers）退場——單票搬進右側欄 */

    /* 購票條款（收合） */
    if (m.terms) {
      var dterm = el('details', 'pdp-terms');
      dterm.innerHTML = '<summary class="pdp-terms__summary" data-i18n="fep.sec.terms">' + esc(T('fep.sec.terms', 'Terms')) + '</summary>';
      dterm.appendChild(slot(api, 'p', 'pdp-terms__text', m.terms, ''));
      inner.appendChild(dterm);
    }
    details.appendChild(inner);
    page.appendChild(details);

    /* ── 購票方案（前台 .pdp-recs--options）：單票一排、套組一排的大圖卡；預覽區 <768 不顯示（D443 決定二）──
       墓碑 2026-10-16（D443 決定一）：票務商品頁的組合方案橫排（.pdp-recs--bundles、[data-fep-bundles]）退場。 */
    if (nPlans) {
      var os = el('section', 'pdp-recs pdp-recs--options'); os.setAttribute('aria-label', T('fep.sec.plans', 'Ticket options'));
      var oin = el('div', 'pdp-recs__inner container');
      oin.innerHTML = '<h2 class="pdp-recs__heading" data-i18n="fep.sec.plans">' + esc(T('fep.sec.plans', 'Ticket options')) + '</h2>';
      function flag(cls, key, fb) { return '<span class="rf-flag ' + cls + '" data-i18n="' + key + '">' + esc(T(key, fb)) + '</span>'; }
      function cardPrice(api2, p, from, key) {
        var nowStr = fmtNum(api2, p.now);
        if (from) nowStr = T('fep.bd.from', 'From {price}').replace('{price}', nowStr);
        return '<span class="shop-card__price" data-fep-price-key="' + esc(key || '') + '">' + (p.was ? '<s>' + esc(fmtNum(api2, p.was)) + '</s>' : '') + esc(nowStr) +
          (p.was ? '<span class="price-pct">−' + pctOff(p.now, p.was) + '%</span>' : '') + '</span>';
      }
      if (tiers.length) {
        oin.insertAdjacentHTML('beforeend', '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('ticket') + '<span data-i18n="fep.sec.single">' + esc(T('fep.sec.single', 'Tickets')) + '</span></h3>');
        var g1 = el('div', 'shop-grid pdp-plans'); g1.setAttribute('data-fep-plans', 'tiers');
        tiers.forEach(function (t, i) {
          var p = tierPs[i];
          var src = t.img || imgs[0] || '';
          var tn = valueOf(api, t.name) || T('ce.tier.untitled', 'Untitled tier');
          var cat = [t.note ? esc(t.note) : '', p.timed && p.to ? esc(T('fep.deal.until', 'Offer ends {t}').replace('{t}', p.to)) : ''].filter(Boolean).join('<span aria-hidden="true"> · </span>');
          var c = el('article', 'shop-card shop-card--plan pdp-bundle-item'); c.setAttribute('data-tier-card', t.key || '');
          c.innerHTML = '<div class="shop-card__media pdp-bundle-item__media' + (src ? '' : ' shop-card__media--empty') + '">' + (src ? imgTag(src, '', tn) : '<i data-lucide="ticket" class="ztor-icon"></i>') +
              '<div class="shop-card__flags">' + flag('rf-flag--neutral', 'fep.sec.single', 'Tickets') + (p.timed ? flag('rf-flag--sale', 'fep.deal.tag', 'Limited-time offer') : '') + '</div></div>' +
            '<div class="shop-card__body"><h3 class="shop-card__title">' + esc(tn) + '</h3>' + (cat ? '<span class="shop-card__cat">' + cat + '</span>' : '') +
              '<div class="shop-card__bottom"><div class="shop-card__foot">' + cardPrice(api, p, false, t.priceKey) + '</div>' +
              '<div class="shop-card__actions"><button class="btn btn--mono btn--sm" type="button" data-pp-inert tabindex="-1" data-i18n="fep.tier.buy">' + esc(T('fep.tier.buy', 'Buy')) + '</button></div></div></div>';
          g1.appendChild(c);
        });
        oin.appendChild(g1);
      }
      if (bundles.length) {
        oin.insertAdjacentHTML('beforeend', '<h3 class="pdp-details__sub-heading pdp-details__sub-heading--icon">' + dsIcon('ticket') + '<span data-i18n="fep.sec.sets">' + esc(T('fep.sec.sets', 'Sets')) + '</span></h3>');
        var g2 = el('div', 'shop-grid pdp-plans'); g2.setAttribute('data-fep-plans', 'sets');
        bundles.forEach(function (b, i) {
          var p = setPs[i];
          var src = setImgs(b)[0] || '';
          var bn = b.name || T('cpp.bd.untitled', 'Untitled bundle');
          var c = el('article', 'shop-card shop-card--plan pdp-bundle-item'); c.setAttribute('data-bundle', b.priceKey || String(i));
          c.innerHTML = '<div class="shop-card__media pdp-bundle-item__media' + (src ? '' : ' shop-card__media--empty') + '">' + (src ? imgTag(src, '', bn) : '<i data-lucide="package" class="ztor-icon"></i>') +
              '<div class="shop-card__flags">' + flag('rf-flag--neutral', 'fep.sec.sets', 'Sets') + (p.timed ? flag('rf-flag--sale', 'fep.deal.tag', 'Limited-time offer') : '') + '</div></div>' +
            '<div class="shop-card__body"><h3 class="shop-card__title"><button class="pdp-setview__open" type="button" data-set-view="' + i + '">' + esc(bn) + '</button></h3>' +
              (p.timed && p.to ? '<span class="shop-card__cat">' + esc(T('fep.deal.until', 'Offer ends {t}').replace('{t}', p.to)) + '</span>' : '') +
              partsHtml(b) +
              '<div class="shop-card__bottom"><div class="shop-card__foot">' + cardPrice(api, p, multiTix(b), b.priceKey) + '</div>' +
              '<div class="shop-card__actions"><button class="btn btn--mono btn--sm" type="button" data-pp-inert tabindex="-1" data-i18n="fep.tier.buy">' + esc(T('fep.tier.buy', 'Buy')) + '</button></div></div></div>';
          g2.appendChild(c);
        });
        oin.appendChild(g2);
      }
      os.appendChild(oin);
      page.appendChild(os);
    }

    /* ── 相關活動：三張卡、全部標「非本活動」（非本活動內容是否出現在預覽，上游待確認 §8.26） ── */
    if (m.related !== false && m.related != null) {
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
      '<button class="btn btn--mono shop-buybar__add pdp-buy__add" type="button" data-pdp-ticket data-pp-inert tabindex="-1">' + esc(T('fep.cta.buy', 'Buy tickets')) + '</button>';
    pdp.appendChild(buybar);

    section.appendChild(pdp);
    main.appendChild(section);
    root.appendChild(main);

    /* 看詳情：套組卡與購票方案卡都開同一個彈窗；關＝✕、點遮罩、Esc（有抽屜開著時 Esc 先給抽屜） */
    root.addEventListener('click', function (e) {
      var open = e.target.closest('[data-set-view]');
      if (open && root.contains(open)) { e.preventDefault(); openSet(Number(open.getAttribute('data-set-view')), false); return; }
      if (e.target.closest('[data-fep-setview-close]')) { e.preventDefault(); closeSet(); }
    });
    if (!escWired) {
      escWired = true;
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        /* 價格表開著時 Esc 先關抽屜（publish-stage）、彈窗留著。用 capture 階段：publish-stage 的 Esc 在 bubble 階段先登記、
           會先把抽屜關掉，bubble 階段再判斷就看不到抽屜、兩層一起關 */
        if (document.querySelector('.drawer.is-open')) return;
        document.querySelectorAll('[data-fep-setview]').forEach(function (x) {
          var r = x.closest('.fep-shop--event'), h = r && r.parentNode;
          if (h) anchorOf(h).__fepOpenKey = null;
          x.remove();
        });
      }, true);
    }
    host.appendChild(root);
    /* 宿主重畫（切語言／幣別、改價格表；create-event 切語言會整個重掛預覽區）時，原本開著的那一組
       （以價格鍵認，不靠位置）照樣開著、不播動畫 */
    if (anchor.__fepOpenKey != null) {
      var reIdx = -1;
      bundles.forEach(function (b, k) { if (reIdx < 0 && (b.priceKey || ('#' + k)) === anchor.__fepOpenKey) reIdx = k; });
      if (reIdx >= 0) openSet(reIdx, true); else anchor.__fepOpenKey = null;
    }
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    return root;
  }

  window.ztorFanEventPage = { render: render, relatedFromStore: relatedFromStore };
})();
