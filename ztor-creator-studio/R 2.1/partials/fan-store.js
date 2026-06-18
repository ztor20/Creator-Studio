window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Fan store · 粉絲端店面（See-as-fan 預覽的唯一呈現，spec §6.7 同源）。
   E-Shop F5（商店預覽）與 Store-settings F1（See as fan）共用同一份 markup，
   注入各自 preview-panel body 的 [data-fan-store-host]；確保兩處「預覽＝粉絲端」
   完全一致（§6.7，差異即缺陷）。樣式見 ds-components/fan-store.css。

   版面參考圖2（hero cover + 本月精選 + 分頁 + 商品格）；display-only，預覽不改資料。
   ⚠ 追蹤數 / 社群連結 / 加入社群 / 本月精選 / 立即購買 / 售完補貨中 為產品變更提案
      （ASSUMPTIONS UIA-026），上游核准前僅作提案呈現。商品資料沿用管理側同一店面。 */
window.ZTOR_PARTIALS.fanStore = String.raw`
<div class="fan-store">

  <header class="fan-store__hero">
    <p class="fan-store__overline" data-fan-overline hidden></p>
    <h3 class="fan-store__artist">My Fan Store</h3>
    <p class="fan-store__tagline" data-i18n="fan.tagline">Independent musician shipping merch, vinyl, and digital drops.</p>
    <div class="fan-store__meta">
      <span class="fan-store__role" data-i18n="fan.role">Musician · 12.4k followers</span>
      <span class="fan-store__socials">
        <a class="fan-store__social" href="#" aria-label="YouTube">YT</a>
        <a class="fan-store__social" href="#" aria-label="Instagram">IG</a>
        <a class="fan-store__social" href="#" aria-label="Threads">TH</a>
      </span>
    </div>
    <button class="fan-store__follow" type="button">
      <i data-lucide="plus" class="ztor-icon"></i><span data-i18n="fan.follow">Join community</span>
    </button>
  </header>

  <div class="fan-store__content">

  <section class="fan-store__featured when-data">
    <div class="fan-store__featured-media"><i data-lucide="disc-3" class="ztor-icon"></i></div>
    <span class="fan-store__featured-tag" data-i18n="fan.featured.tag">Featured</span>
    <div class="fan-store__featured-info">
      <div class="fan-store__featured-title">Coastline acetate · 1/50</div>
      <div class="fan-store__featured-price">$180</div>
      <button class="fan-store__featured-cta" type="button" data-i18n="fan.featured.cta">Buy now</button>
    </div>
  </section>

  <nav class="fan-store__tabs" aria-label="Store sections">
    <button class="fan-store__tab fan-store__tab--active" type="button" data-i18n="e-shop.tab.products">Products</button>
    <button class="fan-store__tab" type="button" data-i18n="e-shop.tab.bundles">Bundles</button>
    <button class="fan-store__tab" type="button" data-i18n="e-shop.tab.auctions">Auctions</button>
  </nav>

  <div class="fan-store__grid when-data">
    <article class="fan-store__card fan-store__card--out">
      <div class="fan-store__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
      <div class="fan-store__card-body">
        <div class="fan-store__card-title">Tour zine vol. 02</div>
        <div class="fan-store__card-status" data-i18n="fan.status.restocking">Sold out · restocking</div>
      </div>
    </article>
    <article class="fan-store__card">
      <div class="fan-store__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
      <div class="fan-store__card-body">
        <div class="fan-store__card-title">Coastline tee</div>
        <div class="fan-store__card-price">$32</div>
      </div>
    </article>
    <article class="fan-store__card">
      <div class="fan-store__thumb"><i data-lucide="music" class="ztor-icon"></i></div>
      <div class="fan-store__card-body">
        <div class="fan-store__card-title">Coastline EP · digital</div>
        <div class="fan-store__card-price">$12</div>
      </div>
    </article>
    <article class="fan-store__card">
      <div class="fan-store__thumb"><i data-lucide="disc-3" class="ztor-icon"></i></div>
      <div class="fan-store__card-body">
        <div class="fan-store__card-title">Coastline acetate · 1/50</div>
        <div class="fan-store__card-price">$180</div>
      </div>
    </article>
  </div>

  <div class="when-empty"><div class="empty-card">
    <span class="empty-card__icon"><i data-lucide="shopping-bag" class="ztor-icon"></i></span>
    <h3 class="empty-card__title" data-i18n="fan.empty.title">Your store is empty</h3>
    <p class="empty-card__text" data-i18n="fan.empty.text">Once you add and publish a product, fans see it here.</p>
  </div></div>

  </div>
</div>`;
