/* Fan store · 粉絲端創作者頁的手機版鏡像（See-as-fan 預覽的唯一呈現，spec §6.7 同源）
   ============================================================================
   E-Shop F5（商店預覽）、Store-settings F1（See as fan）與三個細節頁的預覽面板共用同一份
   markup，注入各自的 [data-fan-store-host]；兩處「預覽＝粉絲端」必須完全一致（§6.7，差異即缺陷）。
   樣式見 ds-components/fan-store.css。

   2026-09-11 改版（使用者提供粉絲端實際畫面）：預覽改成**粉絲端創作者頁（ztor 前台）手機版的
   版型鏡像**，做法比照建立商品的商品頁鏡像（pdp-preview，D248）——版型與比例照粉絲端搬進來、
   整支 zoom 3/4 顯示、不畫手機外框。使用者在截圖上劃掉的三樣不進預覽：頂部 app bar
   （選單／logo／搜尋／購物車／登入）、底部 app 導航、「情境展示」浮標——那些是 app 外殼，
   不是這位創作者的頁面。舊版（手機外框＋app bar＋頭號粉絲＋關於＋底部導航）整份退場。

   結構（由上而下）＝粉絲端創作者頁：
     頭像＋名字＋身分・追蹤數＋分享 → 簡介（兩行＋更多）→ 社群圓鈕（ztor／IG／Threads／X／TikTok）
     → 加入社群＋彩蛋解鎖 → 分頁列（商店・活動・排行榜・貼文・項目）
     → 精選商品橫列 → 商品／套組／競標子分頁 → 雙欄商品格（徽章＋收藏）

   資料：人格（persona）決定頭像、名字、身分、追蹤數與簡介；商品接 ProductsStore（頁面有載的話），
   沒載就用示範值。卡片順序固定（見 CARD_IDS），e-shop 用同一順序決定哪張卡要依上架／顯示狀態收起。

   ⚠ 追蹤數／社群連結／加入社群／彩蛋解鎖／精選商品／收藏／app 分頁列為產品變更提案
      （ASSUMPTIONS UIA-026），上游核准前僅作提案呈現；這裡只是把粉絲端已經長出來的樣子照搬。 */
window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var persona = (function () {
    try { if (typeof window.ztorPersonaId === 'function') return window.ztorPersonaId(); } catch (e) {}
    try { return localStorage.getItem('ztor.persona') === 'nick' ? 'nick' : 'default'; } catch (e) { return 'default'; }
  })();

  /* 人格檔案：文字走 i18n key（切語言跟著換），頭像與追蹤數是資料。
     周湯豪的值抄自使用者提供的粉絲端截圖；Gary Lin 沿用舊預覽那一組示範值。 */
  var PROFILE = {
    default: { avatar: 'images/ip/gary-portrait.jpg', nameKey: 'fan.profile.default.name', roleKey: 'fan.profile.default.role', followers: '1.2 萬', followersEn: '12.4k', bioKey: 'fan.profile.default.bio' },
    nick:    { avatar: 'images/ip/nick-portrait.jpg', nameKey: 'fan.profile.nick.name',    roleKey: 'fan.profile.nick.role',    followers: '215 萬', followersEn: '2.15M', bioKey: 'fan.profile.nick.bio' }
  };
  var P = PROFILE[persona] || PROFILE.default;

  /* 商品卡：順序固定，e-shop 的 PREVIEW_IDS 對照表照這個順序。
     名稱／價格／圖優先問 ProductsStore（e-shop 有載）；沒載就用示範值。 */
  var CARD_IDS = ['zine', 'tee', 'album', 'acetate', 'hoodie', 'pin'];
  var FALLBACK = {
    zine:    { name: 'Pirate Queen zine vol. 02',      price: '$24',  img: 'tour-zine-vol-02.webp',  badge: 'new' },
    tee:     { name: 'Kowloon After Dark tee',         price: '$32',  img: 'coastline-tee.webp',     badge: '' },
    album:   { name: 'Kowloon After Dark OST · digital', price: '$12', img: 'coastline-ep.webp',     badge: '' },
    acetate: { name: 'Kowloon After Dark vinyl · 1/50', price: '$180', img: 'coastline-acetate.webp', badge: 'limited' },
    hoodie:  { name: 'Kowloon After Dark hoodie',      price: '$58',  img: 'coastline-hoodie.webp',  badge: '' },
    pin:     { name: 'Enamel pin',                     price: '$12',  img: 'enamel-pin-wave.webp',   badge: '' }
  };
  var FEATURED_ID = 'shoes';
  var FEATURED_FALLBACK = { name: 'Kowloon After Dark low-top sneakers', price: '$64', img: 'nick-nike-01.jpg' };

  function product(id, fb) {
    var p = null;
    try { p = window.ProductsStore && window.ProductsStore.get ? window.ProductsStore.get(id) : null; } catch (e) {}
    /* 幣別寫法跟清單同一套（products-store 的 priceText：nick＝NT$、千分位；其餘 $）。 */
    var price = fb.price;
    if (p && p.price) {
      var raw = String(p.price).replace(/\.00$/, '');
      if (!/^\d+(?:\.\d+)?$/.test(raw)) price = raw;
      else if (p.currency === 'TWD' || persona === 'nick') price = 'NT$' + raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      else price = '$' + raw;
    }
    return {
      name: (p && p.name) || fb.name,
      price: price,
      img: 'images/products/' + ((p && p.img) || fb.img),
      badge: fb.badge || ((p && p.edition === 'limited') ? 'limited' : '')
    };
  }

  function cardHtml(id) {
    var d = product(id, FALLBACK[id]);
    var badge = d.badge === 'limited'
      ? '<span class="fan-store__badge fan-store__badge--limited" data-i18n="fan.badge.limited">Limited</span>'
      : (d.badge === 'new' ? '<span class="fan-store__badge fan-store__badge--new" data-i18n="fan.badge.new">New</span>' : '');
    return '<article class="fan-store__card" data-fs-product="' + esc(id) + '">'
      + '<div class="fan-store__thumb"><img src="' + esc(d.img) + '" alt="" loading="lazy">' + badge
      + '<span class="fan-store__heart" aria-hidden="true"><i data-lucide="heart" class="ztor-icon"></i></span></div>'
      + '<div class="fan-store__card-title">' + esc(d.name) + '</div>'
      + '<div class="fan-store__card-price">' + esc(d.price) + '</div>'
      + '</article>';
  }

  function featuredHtml(id, fb) {
    var d = product(id, fb);
    return '<article class="fan-store__featured">'
      + '<div class="fan-store__featured-media"><img src="' + esc(d.img) + '" alt=""></div>'
      + '<div class="fan-store__featured-info">'
      + '<span class="fan-store__featured-tag" data-i18n="fan.featured.tag">Featured</span>'
      + '<div class="fan-store__featured-title">' + esc(d.name) + '</div>'
      + '<div class="fan-store__featured-price">' + esc(d.price) + '</div>'
      + '<button class="fan-store__featured-cta" type="button" data-i18n="fan.featured.cta">Buy now</button>'
      + '</div></article>';
  }

  var social = function (icon, label) {
    return '<a class="fan-store__social" href="#" aria-label="' + esc(label) + '"><i data-lucide="' + icon + '" class="ztor-icon"></i></a>';
  };

  /* 樣板在「被讀取」的當下才組：消費頁 mount 時 ProductsStore 通常已經載好（這支 partial 多半排在它前面）。 */
  function build() { return (
'<div class="fan-store">' +
'  <p class="fan-store__overline" data-fan-overline hidden></p>' +
'  <div class="fan-store__page">' +

'    <header class="fan-store__profile">' +
'      <img class="fan-store__avatar" src="' + esc(P.avatar) + '" alt="">' +
'      <div class="fan-store__ident">' +
'        <h3 class="fan-store__name" data-i18n="' + P.nameKey + '">Creator</h3>' +
'        <div class="fan-store__meta">' +
'          <span class="fan-store__role" data-i18n="' + P.roleKey + '">Musician</span>' +
'          <span class="fan-store__followers"><b data-fs-followers data-zh="' + esc(P.followers) + '" data-en="' + esc(P.followersEn) + '">' + esc(P.followers) + '</b> <span data-i18n="fan.followers">followers</span></span>' +
'        </div>' +
'      </div>' +
'      <i data-lucide="share" class="ztor-icon fan-store__share" aria-hidden="true"></i>' +
'    </header>' +

'    <p class="fan-store__bio"><span data-i18n="' + P.bioKey + '">Bio</span> <span class="fan-store__more" data-i18n="fan.more">More</span></p>' +

'    <div class="fan-store__socials">' +
       '<a class="fan-store__social fan-store__social--ztor" href="#" aria-label="ztor"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.0879 14.0938C22.6959 14.0939 23.9998 15.3043 24 16.7969C24 18.2896 22.6961 19.4998 21.0879 19.5C19.4796 19.5 18.1758 18.2897 18.1758 16.7969C18.176 15.3042 19.4797 14.0938 21.0879 14.0938ZM14.8906 4.5C15.2844 4.5 15.6034 4.8193 15.6035 5.21387C15.6035 5.35888 15.5612 5.49277 15.4873 5.60547L15.3975 5.71777L13.4912 8.08398L8.12109 14.7559C8.10547 14.7736 8.09069 14.7927 8.07715 14.8115C8.0012 14.9169 7.95612 15.0448 7.95605 15.1846C7.95605 15.5395 8.24348 15.828 8.59766 15.8281H15.1191L15.1201 15.8271C15.4826 15.8271 15.7752 16.1212 15.7754 16.4834V18.8037C15.7753 19.167 15.4816 19.46 15.1201 19.46H0.642578C0.287501 19.4598 0.000137745 19.1722 0 18.8164C0 18.6775 0.0460766 18.5478 0.121094 18.4424L0.166016 18.3867L2.22559 15.8281L8.05469 8.58594C8.05575 8.58492 8.05762 8.58403 8.05762 8.58301C8.092 8.53185 8.1123 8.47007 8.1123 8.4043C8.11208 8.22804 7.96891 8.08496 7.79297 8.08496H1.37207C1.00961 8.0849 0.716901 7.79087 0.716797 7.42871V5.15625C0.717001 4.79313 1.01071 4.50006 1.37207 4.5H14.8906Z"/></svg></a>' +
       social('brand-instagram', 'Instagram') + social('brand-threads', 'Threads') + social('brand-x', 'X') + social('brand-tiktok', 'TikTok') +
'    </div>' +

'    <div class="fan-store__ctas">' +
'      <button class="fan-store__cta fan-store__cta--primary" type="button"><i data-lucide="plus" class="ztor-icon"></i><span data-i18n="fan.follow">Join community</span></button>' +
'      <button class="fan-store__cta" type="button"><i data-lucide="gift" class="ztor-icon"></i><span data-i18n="fan.unlock">Unlock secrets</span></button>' +
'    </div>' +

'    <div class="fan-store__stick" data-fan-stick>' +
'      <div class="fan-store__minihead" aria-hidden="true"><img class="fan-store__minihead-avatar" src="' + esc(P.avatar) + '" alt=""><span class="fan-store__minihead-name" data-i18n="' + P.nameKey + '">Creator</span></div>' +
'      <nav class="fan-store__nav" aria-label="Fan page sections">' +
'        <button class="fan-store__nav-item fan-store__nav-item--active" type="button" data-i18n="fan.nav.shop">Shop</button>' +
'        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.events">Events</button>' +
'        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.board">Ranks</button>' +
'        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.posts">Posts</button>' +
'        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.projects">Projects</button>' +
'      </nav>' +
'    </div>' +

'    <div class="fan-store__content">' +
'      <div class="fan-store__featured-row when-data">' + featuredHtml(FEATURED_ID, FEATURED_FALLBACK) + featuredHtml('hoodie', FALLBACK.hoodie) + '</div>' +

'      <nav class="fan-store__tabs when-data" aria-label="Store sections">' +
'        <button class="fan-store__tab fan-store__tab--active" type="button" data-i18n="e-shop.tab.products">Products</button>' +
'        <button class="fan-store__tab" type="button" data-i18n="e-shop.tab.bundles">Bundles</button>' +
'        <button class="fan-store__tab" type="button" data-i18n="e-shop.tab.auctions">Auctions</button>' +
'      </nav>' +

'      <div class="fan-store__grid when-data">' + CARD_IDS.map(cardHtml).join('') + '</div>' +

'      <div class="when-empty"><div class="empty-card">' +
'        <span class="empty-card__icon"><i data-lucide="shopping-bag" class="ztor-icon"></i></span>' +
'        <h3 class="empty-card__title" data-i18n="fan.empty.title">Your store is empty</h3>' +
'        <p class="empty-card__text" data-i18n="fan.empty.text">Once you add and publish a product, fans see it here.</p>' +
'      </div></div>' +
'    </div>' +
'  </div>' +
'</div>'); }
  Object.defineProperty(window.ZTOR_PARTIALS, 'fanStore', { get: build, configurable: true });

  /* 釘住的分頁列（2026-09-11 使用者：「下滑的時候有東西置頂在上面，請再查驗一次那個網站的設計並補上去」）：
     粉絲端手機版往下捲時，分頁列 sticky 釘在最上面，上方多出「小頭像＋名字」一行，底下一片
     漸層毛玻璃把滑過的內容壓暗（量測自 ztor.vercel.app 的 .tabstick-host.is-pinned／.creator-minihead）。
     sticky 本身是 CSS；「釘住了沒」CSS 判斷不了，由這裡看分頁列的頂緣是否貼到捲動容器的頂緣，寫 is-pinned。
     捲動容器＝往上找第一個 overflow-y 會捲的祖先（e-shop 的右欄 .preview-col--tall），找不到就是視窗。 */
  function scrollParentOf(el) {
    var n = el.parentElement;
    while (n && n !== document.body) {
      var oy = getComputedStyle(n).overflowY;
      if (oy === 'auto' || oy === 'scroll') return n;
      n = n.parentElement;
    }
    return null;
  }
  function bindStick(host) {
    var stick = host.querySelector('[data-fan-stick]');
    if (!stick || stick.__bound) return; stick.__bound = true;
    function check() {
      /* 捲動容器每次重找：預覽面板收著的時候（display:none）量不到，開了才算數 */
      var r = stick.getBoundingClientRect();
      if (!r.width && !r.height) { stick.classList.remove('is-pinned'); return; }   /* 預覽收著（display:none）時量出來全是 0，不算釘住 */
      var sp = scrollParentOf(stick);
      /* sticky top:0 貼的是捲動容器「內距以內」的那條線（Chrome 實測：容器 padding-top 18 就停在 +18） */
      var top = sp ? sp.getBoundingClientRect().top + sp.clientTop + (parseFloat(getComputedStyle(sp).paddingTop) || 0) : 0;
      /* 自己的 sticky top（預覽卡標題列釘頂時不是 0）；在 zoom 裡，算成螢幕像素要乘回 zoom */
      var page = stick.closest('.fan-store__page');
      var zoom = page ? (parseFloat(getComputedStyle(page).zoom) || 1) : 1;
      var own = (parseFloat(getComputedStyle(stick).top) || 0) * zoom;
      stick.classList.toggle('is-pinned', r.top <= top + own + 0.5);
    }
    /* scroll 不冒泡，用 capture 在 document 上一次接住任何容器的捲動（含視窗） */
    document.addEventListener('scroll', check, { passive: true, capture: true });
    window.addEventListener('resize', check);
    /* 預覽欄開關會讓分頁列從 0 尺寸變成有尺寸，開的那一刻重算一次 */
    if (window.ResizeObserver) new ResizeObserver(check).observe(stick);
    check();
  }
  function watchHosts() {
    document.querySelectorAll('[data-fan-store-host]').forEach(function (host) {
      if (host.__fsWatch) return; host.__fsWatch = true;
      bindStick(host);
      if (window.MutationObserver) new MutationObserver(function () { bindStick(host); }).observe(host, { childList: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchHosts); else watchHosts();
  window.ZTOR_PARTIALS.bindFanStore = bindStick;

  /* 追蹤數是資料不是文案，但單位寫法依語言不同（1.2 萬 vs 12.4k）：切語言時自己換。 */
  document.addEventListener('i18n:applied', function () {
    var zh = (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
    document.querySelectorAll('[data-fs-followers]').forEach(function (el) { el.textContent = zh ? el.dataset.zh : el.dataset.en; });
  });
})();
