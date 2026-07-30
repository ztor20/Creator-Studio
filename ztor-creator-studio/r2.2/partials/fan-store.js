window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Fan store · 粉絲端店面（See-as-fan 預覽的唯一呈現，spec §6.7 同源）。
   E-Shop F5（商店預覽）與 Store-settings F1（See as fan）共用同一份 markup，
   注入各自 preview-panel body 的 [data-fan-store-host]；確保兩處「預覽＝粉絲端」
   完全一致（§6.7，差異即缺陷）。樣式見 ds-components/fan-store.css。

   2026-07-02 改版：呈現為「手機外框內的粉絲 app 商店頁」（.fan-store__phone >
   .fan-store__screen，screen 內自捲動），版面參考 endgame 原型 creator 商店手機版
   （使用者提供，僅作視覺方向）：app bar＋hero（名字壓深色底＋社群＋加入社群）＋
   app 分頁列＋本月精選＋商品/組合/拍賣子分頁＋雙欄商品格＋頭號粉絲＋關於＋底部導航。
   手機 screen 為固定深色 fan-app 面（主題無關，同 vip-card 前例）；display-only。

   ⚠ 追蹤數 / 社群連結 / 加入社群 / 本月精選 / 立即購買 / 售完補貨中 / app 分頁列
      （活動·排行榜·貼文·關於）/ 頭號粉絲 / 關於創作者 / 購物車 / 底部 app 導航
      為產品變更提案（ASSUMPTIONS UIA-026），上游核准前僅作提案呈現。
      商品資料沿用管理側同一店面（e-shop demo 同批商品）。 */
window.ZTOR_PARTIALS.fanStore = String.raw`
<div class="fan-store">
  <p class="fan-store__overline" data-fan-overline hidden></p>
  <div class="fan-store__phone">
    <div class="fan-store__screen">

      <div class="fan-store__appbar">
        <i data-lucide="menu" class="ztor-icon"></i>
        <span class="fan-store__wordmark">ztor.</span>
        <span class="fan-store__appbar-end">
          <i data-lucide="shopping-cart" class="ztor-icon"></i>
          <i data-lucide="user" class="ztor-icon"></i>
        </span>
      </div>

      <header class="fan-store__hero">
        <h3 class="fan-store__artist">My Fan Store</h3>
        <p class="fan-store__tagline" data-i18n="fan.tagline">Independent musician shipping merch, vinyl, and digital drops.</p>
        <div class="fan-store__meta">
          <span class="fan-store__role" data-i18n="fan.role">Musician · 12.4k followers</span>
          <span class="fan-store__socials">
            <a class="fan-store__social" href="#" aria-label="YouTube">YT</a>
            <a class="fan-store__social" href="#" aria-label="Instagram">IG</a>
            <a class="fan-store__social" href="#" aria-label="Threads">TH</a>
            <a class="fan-store__social" href="#" aria-label="X">X</a>
          </span>
        </div>
        <button class="fan-store__follow" type="button">
          <i data-lucide="plus" class="ztor-icon"></i><span data-i18n="fan.follow">Join community</span>
        </button>
      </header>

      <nav class="fan-store__nav" aria-label="Fan app sections">
        <button class="fan-store__nav-item fan-store__nav-item--active" type="button" data-i18n="fan.nav.shop">Shop</button>
        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.events">Events</button>
        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.board">Leaderboard</button>
        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.posts">Posts</button>
        <button class="fan-store__nav-item" type="button" data-i18n="fan.nav.about">About</button>
      </nav>

      <div class="fan-store__content">

        <section class="fan-store__featured when-data">
          <div class="fan-store__featured-media"><i data-lucide="disc-3" class="ztor-icon"></i></div>
          <div class="fan-store__featured-info">
            <span class="fan-store__featured-tag" data-i18n="fan.featured.tag">Featured</span>
            <div class="fan-store__featured-title">Coastline acetate · 1/50</div>
            <div class="fan-store__featured-price">$180</div>
            <button class="fan-store__featured-cta" type="button" data-i18n="fan.featured.cta">Buy now</button>
          </div>
        </section>

        <nav class="fan-store__tabs when-data" aria-label="Store sections">
          <button class="fan-store__tab fan-store__tab--active" type="button" data-i18n="e-shop.tab.products">Products</button>
          <button class="fan-store__tab" type="button" data-i18n="e-shop.tab.bundles">Bundles</button>
          <button class="fan-store__tab" type="button" data-i18n="e-shop.tab.auctions">Auctions</button>
        </nav>

        <div class="fan-store__grid when-data">
          <article class="fan-store__card fan-store__card--out">
            <div class="fan-store__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
            <div class="fan-store__card-title">Tour zine vol. 02</div>
            <div class="fan-store__card-status" data-i18n="fan.status.restocking">Sold out · restocking</div>
          </article>
          <article class="fan-store__card">
            <div class="fan-store__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
            <div class="fan-store__card-title">Coastline tee</div>
            <div class="fan-store__card-foot"><span class="fan-store__card-price">$32</span>
              <button class="fan-store__cart" type="button" aria-label="Add to cart" data-i18n-aria-label="fan.cart"><i data-lucide="shopping-cart" class="ztor-icon"></i></button></div>
          </article>
          <article class="fan-store__card">
            <div class="fan-store__thumb"><i data-lucide="music" class="ztor-icon"></i></div>
            <div class="fan-store__card-title">Coastline EP · digital</div>
            <div class="fan-store__card-foot"><span class="fan-store__card-price">$12</span>
              <button class="fan-store__cart" type="button" aria-label="Add to cart" data-i18n-aria-label="fan.cart"><i data-lucide="shopping-cart" class="ztor-icon"></i></button></div>
          </article>
          <article class="fan-store__card">
            <div class="fan-store__thumb"><i data-lucide="disc-3" class="ztor-icon"></i></div>
            <div class="fan-store__card-title">Coastline acetate · 1/50</div>
            <div class="fan-store__card-foot"><span class="fan-store__card-price">$180</span>
              <button class="fan-store__cart" type="button" aria-label="Add to cart" data-i18n-aria-label="fan.cart"><i data-lucide="shopping-cart" class="ztor-icon"></i></button></div>
          </article>
          <article class="fan-store__card">
            <div class="fan-store__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
            <div class="fan-store__card-title">Coastline hoodie</div>
            <div class="fan-store__card-foot"><span class="fan-store__card-price">$58</span>
              <button class="fan-store__cart" type="button" aria-label="Add to cart" data-i18n-aria-label="fan.cart"><i data-lucide="shopping-cart" class="ztor-icon"></i></button></div>
          </article>
          <article class="fan-store__card fan-store__card--out">
            <div class="fan-store__thumb"><i data-lucide="package" class="ztor-icon"></i></div>
            <div class="fan-store__card-title">Sticker sheet</div>
            <div class="fan-store__card-status" data-i18n="fan.status.restocking">Sold out · restocking</div>
          </article>
        </div>

        <div class="when-empty"><div class="empty-card">
          <span class="empty-card__icon"><i data-lucide="shopping-bag" class="ztor-icon"></i></span>
          <h3 class="empty-card__title" data-i18n="fan.empty.title">Your store is empty</h3>
          <p class="empty-card__text" data-i18n="fan.empty.text">Once you add and publish a product, fans see it here.</p>
        </div></div>

        <section class="fan-store__fans">
          <div class="fan-store__section-head">
            <h4 class="fan-store__section-title" data-i18n="fan.fans.title">Top fans</h4>
            <a class="fan-store__link" href="#" data-i18n="fan.fans.all">View all →</a>
          </div>
          <div class="fan-store__fans-row">
            <div class="fan-store__fan">
              <span class="fan-store__fan-ava fan-store__fan-ava--r1">LY<span class="fan-store__fan-rank">1</span></span>
              <span class="fan-store__fan-name">Lin Yiwen</span>
              <span class="fan-store__fan-pts">204,370</span>
            </div>
            <div class="fan-store__fan">
              <span class="fan-store__fan-ava fan-store__fan-ava--r2">AS<span class="fan-store__fan-rank">2</span></span>
              <span class="fan-store__fan-name">Ahmed Said</span>
              <span class="fan-store__fan-pts">158,240</span>
            </div>
            <div class="fan-store__fan">
              <span class="fan-store__fan-ava fan-store__fan-ava--r3">SR<span class="fan-store__fan-rank">3</span></span>
              <span class="fan-store__fan-name">Sofia Rossi</span>
              <span class="fan-store__fan-pts">76,480</span>
            </div>
            <div class="fan-store__fan">
              <span class="fan-store__fan-ava fan-store__fan-ava--r4">LN<span class="fan-store__fan-rank">4</span></span>
              <span class="fan-store__fan-name">Liam Nguyen</span>
              <span class="fan-store__fan-pts">64,980</span>
            </div>
            <div class="fan-store__fan">
              <span class="fan-store__fan-ava fan-store__fan-ava--r5">JC<span class="fan-store__fan-rank">5</span></span>
              <span class="fan-store__fan-name">James Carter</span>
              <span class="fan-store__fan-pts">52,310</span>
            </div>
          </div>
        </section>

        <section class="fan-store__about">
          <h4 class="fan-store__section-title" data-i18n="fan.about.title">About</h4>
          <p class="fan-store__about-text" data-i18n="fan.about.text">Started uploading demos in 2019; the Coastline EP grew into a community of twelve thousand fans. Merch, vinyl and digital drops all ship from the studio — every order funds the next record.</p>
          <a class="fan-store__link" href="#" data-i18n="fan.about.more">Read more →</a>
        </section>

      </div>

      <nav class="fan-store__tabbar" aria-label="Fan app navigation">
        <span class="fan-store__tabbar-item"><i data-lucide="sparkles" class="ztor-icon"></i><span data-i18n="fan.tabbar.spotlight">Spotlight</span></span>
        <span class="fan-store__tabbar-item"><i data-lucide="rocket" class="ztor-icon"></i><span data-i18n="fan.tabbar.cocreate">Co-create</span></span>
        <span class="fan-store__tabbar-item"><i data-lucide="users" class="ztor-icon"></i><span data-i18n="fan.tabbar.community">Community</span></span>
        <span class="fan-store__tabbar-item"><i data-lucide="award" class="ztor-icon"></i><span data-i18n="fan.tabbar.contest">Contests</span></span>
        <span class="fan-store__tabbar-item fan-store__tabbar-item--active"><i data-lucide="shopping-bag" class="ztor-icon"></i><span data-i18n="fan.tabbar.shop">Shop</span></span>
      </nav>

    </div>
  </div>
</div>`;
