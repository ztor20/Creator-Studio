// js/products-store.js — 電子商店單售商品的示範資料源（spec 5.1.5.1 商品細節頁）。
//
// 目的：商品細節頁（product-detail.html）改為「資料驅動」——由 e-shop 清單以 ?id=<key>
// 開啟，本 store 提供該商品「該有的組合」讓細節頁 realize 對應版面，取代舊的 devtools
// 預覽切換（pd-cat/pd-var/pd-edition）。全前端 mock、無後端；逐品的變體列/曲目/卡面內容
// 為代表性樣本（UIA-055），重點是把「主分類×次分類×規格模式×庫存版本」的版面組合做出來。
//
// 每筆欄位：
//   cat        主分類 physical | digital（E&E 由活動模組管理、不在此頁）
//   subKey     次分類（對應 §2.6 次分類 select 的值；只影響顯示）
//   content    數位內容檔形態 video|song|album|membership|document|ip（僅數位；決定 §2.7 表單）
//   variant    規格模式 single | multiple（僅實體；§2.8）
//   edition    庫存版本 unlimited | limited（§2.10）
//   status     live | low | soldout（狀態 badge 與庫存呈現）
//   price/cost 現金字串；stock 目前庫存；cap 限量上限（limited 才有）；sold 已售（limited 才有）
//   albumSeed  數位·專輯的預置曲目（餵給 album-tracks 的 data-album-seed）
//   vipName    數位·會員卡的預置卡面名稱
//   img        e-shop 列表縮圖檔名（在 images/products/ 下）；供 persona 就地改列用
//
// ── Persona（2026-07-24）──────────────────────────────────────────
// cheat code「User」切換改 localStorage 'ztor.persona'：default＝原批（Coastline 巡迴
// 世界觀）、nick＝周湯豪 NICKTHEREAL、userB＝佔位沿用 default。兩個 persona 用「相同的
// 9 個商品 id」，所以 e-shop 列表既有的 ?id=<key> 連結與 product-detail 都自動對上。
// product-detail 依當前 persona 讀對應商品；e-shop 列表的商品名／圖是寫死在 HTML（非
// i18n key），故由本檔的 patchEshopList() 在載入後就地改列（名＋圖＋價＋庫存＋分類一起換，
// 不半套）。⚠ nick 圖沿用現有 images/products/ 檔、金額為示意值。
(function () {
  var PERSONA_KEY = 'ztor.persona';
  function persona() {
    try { var p = localStorage.getItem(PERSONA_KEY); if (p === 'nick' || p === 'userB') return p; } catch (_) {}
    return 'default';
  }

  /* ── default：原有 9 商品（Coastline 巡迴）───────────────────── */
  var P_DEFAULT = {
    zine: {
      name: 'Tour zine vol. 02', img: 'tour-zine-vol-02.webp',
      sub: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
      cat: 'physical', subKey: 'zine', variant: 'single', edition: 'unlimited',
      status: 'low', price: '24.00', cost: '9.00', stock: '3', threshold: '4',
      catLabel: 'Physical Merchandise', subLabel: 'Books · 書籍'
    },
    tee: {
      name: 'Coastline tee', img: 'coastline-tee.webp',
      sub: 'Heavyweight cotton tee — east-coast tour print. 4 variants.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '32.00', cost: '11.00', stock: '42', threshold: '6',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      // 單階層（僅尺寸）：options 一組、variants 逐值一列（combo 只有一個值）。
      options: [{ name: 'Size / 尺寸', values: ['S', 'M', 'L', 'XL'] }],
      variants: [
        { combo: ['S'],  sku: 'TEE-S',  stock: '2' },
        { combo: ['M'],  sku: 'TEE-M',  stock: '18' },
        { combo: ['L'],  sku: 'TEE-L',  stock: '15' },
        { combo: ['XL'], sku: 'TEE-XL', stock: '7' }
      ]
    },
    hoodie: {
      name: 'Coastline hoodie', img: 'coastline-hoodie.webp',
      sub: 'Brushed-fleece hoodie — embroidered wave mark. 6 variants.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'low', price: '58.00', cost: '22.00', stock: '48', threshold: '8',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      // 兩階層（顏色 × 尺寸）：options 兩組、variants ＝ 笛卡兒積 2×3＝6 列，
      // 顯示時依 options[0]（顏色）分組。與 e-shop 補貨 HOODIE_MATRIX 同源。
      options: [
        { name: 'Colour / 顏色', values: ['Black', 'Sand'] },
        { name: 'Size / 尺寸', values: ['S', 'M', 'L'] }
      ],
      variants: [
        { combo: ['Black', 'S'], sku: 'HOOD-BK-S', stock: '3' },
        { combo: ['Black', 'M'], sku: 'HOOD-BK-M', stock: '12' },
        { combo: ['Black', 'L'], sku: 'HOOD-BK-L', stock: '8' },
        { combo: ['Sand', 'S'],  sku: 'HOOD-SD-S', stock: '0' },
        { combo: ['Sand', 'M'],  sku: 'HOOD-SD-M', stock: '5' },
        { combo: ['Sand', 'L'],  sku: 'HOOD-SD-L', stock: '20' }
      ]
    },
    acetate: {
      name: 'Coastline acetate · numbered 1/50', img: 'coastline-acetate.webp',
      sub: 'Hand-numbered acetate LP — limited run of 50, signed. Collect on-site at the signing session.',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '120.00', cost: '38.00', stock: '29', cap: '50', sold: '21', threshold: '5',
      delivery: 'qr',   /* 現場 QR 領取示範：簽名場次現場領取的限量收藏品（唯一一筆 QR 領取商品）*/
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品'
    },
    pin: {
      name: 'Enamel pin · wave', img: 'enamel-pin-wave.webp',
      sub: 'Hard-enamel pin, gold plating. Wave mark.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'soldout', price: '12.00', cost: '3.50', stock: '0', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    song: {
      name: 'Coastline · single', img: 'coastline-single.webp',
      sub: 'Lead single — instant download after purchase.',
      cat: 'digital', subKey: 'song', content: 'song', variant: 'single', edition: 'unlimited',
      status: 'live', price: '1.50', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Song · 音樂單曲'
    },
    movie: {
      name: 'Tour documentary', img: 'tour-documentary.webp',
      sub: 'Feature-length tour documentary — stream / download.',
      cat: 'digital', subKey: 'movie', content: 'video', variant: 'single', edition: 'unlimited',
      status: 'live', price: '9.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Movie · 電影'
    },
    album: {
      name: 'Coastline EP — digital download', img: 'coastline-ep.webp',
      sub: 'Five-track EP — full download with lyrics.',
      cat: 'digital', subKey: 'album', content: 'album', variant: 'single', edition: 'unlimited',
      status: 'live', price: '12.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Album · 音樂專輯',
      albumSeed: [
        { name: 'Coastline (intro)', meta: 'coastline-intro.mp3 · 3.2 MB · Apr 2026', lyrics: false },
        { name: 'Tidewater', meta: 'tidewater.mp3 · 8.1 MB', lyrics: true },
        { name: 'Harbor Lights', meta: 'harbor-lights.mp3 · 7.4 MB', lyrics: true },
        { name: 'Undertow', meta: 'undertow.mp3 · 6.9 MB', lyrics: false },
        { name: 'Coastline (reprise)', meta: 'coastline-reprise.mp3 · 4.0 MB', lyrics: false }
      ]
    },
    membership: {
      name: 'Inner circle · membership', img: 'inner-circle-membership.webp',
      sub: 'Recurring membership card — perks, early access, community.',
      cat: 'digital', subKey: 'membership', content: 'membership', variant: 'single', edition: 'unlimited',
      status: 'live', price: '8.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Membership / VIP card · 會員卡',
      vipName: 'Inner Circle'
    }
  };

  /* ── nick：周湯豪 NICKTHEREAL（相同 9 個 id，換內容）─────────────
     圖沿用現有 images/products/ 檔（非本人素材），價格為示意值。 */
  var P_NICK = {
    zine: {
      name: 'REALIVE 巡演精裝寫真誌', img: 'nick-realive-cd.jpg',
      sub: '48 頁巡演幕後寫真＋精裝 EP 卡冊。',
      cat: 'physical', subKey: 'zine', variant: 'single', edition: 'unlimited',
      status: 'low', price: '32.00', cost: '11.00', stock: '5', threshold: '6',
      catLabel: 'Physical Merchandise', subLabel: 'Books · 書籍'
    },
    tee: {
      name: 'REALIVE 白趴 官方 Tee', img: 'nick-tee.jpg',
      sub: '白趴演唱會官方純棉 Tee，與「祝你好命」共同設計。4 種尺寸。',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '38.00', cost: '13.00', stock: '160', threshold: '12',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [{ name: 'Size / 尺寸', values: ['S', 'M', 'L', 'XL'] }],
      variants: [
        { combo: ['S'],  sku: 'RL-TEE-S',  stock: '24' },
        { combo: ['M'],  sku: 'RL-TEE-M',  stock: '60' },
        { combo: ['L'],  sku: 'RL-TEE-L',  stock: '52' },
        { combo: ['XL'], sku: 'RL-TEE-XL', stock: '24' }
      ]
    },
    hoodie: {
      name: '祝你好命 連帽外套', img: 'nick-hoodie.webp',
      sub: '周湯豪主理品牌「祝你好命」刷毛連帽外套。6 種組合。',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'low', price: '78.00', cost: '30.00', stock: '58', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [
        { name: 'Colour / 顏色', values: ['Black', 'Cream'] },
        { name: 'Size / 尺寸', values: ['S', 'M', 'L'] }
      ],
      variants: [
        { combo: ['Black', 'S'], sku: 'WY-HD-BK-S', stock: '5' },
        { combo: ['Black', 'M'], sku: 'WY-HD-BK-M', stock: '16' },
        { combo: ['Black', 'L'], sku: 'WY-HD-BK-L', stock: '11' },
        { combo: ['Cream', 'S'], sku: 'WY-HD-CR-S', stock: '3' },
        { combo: ['Cream', 'M'], sku: 'WY-HD-CR-M', stock: '9' },
        { combo: ['Cream', 'L'], sku: 'WY-HD-CR-L', stock: '14' }
      ]
    },
    acetate: {
      name: 'CASETiFY ×祝你好命 好命限定禮盒 1/100', img: 'nick-casetify.jpg',
      sub: '全球限量 100 份聯名禮盒，含 2 款鏡面殼＋磁吸支架＋卡套。附獨立編號。',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '338.00', cost: '120.00', stock: '64', cap: '100', sold: '36', threshold: '8',
      delivery: 'qr',
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品'
    },
    pin: {
      name: 'BEARBRICK ×祝你好命 1000%', img: 'nick-bearbrick.png',
      sub: '周湯豪聯名 BE@RBRICK 1000% 積木公仔。',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'soldout', price: '260.00', cost: '90.00', stock: '0', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    song: {
      name: '我的i · 單曲', img: 'nick-single.jpg',
      sub: 'LOVE RAGE HOPE 首波主打，購買後立即下載。',
      cat: 'digital', subKey: 'song', content: 'song', variant: 'single', edition: 'unlimited',
      status: 'live', price: '1.50', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Song · 音樂單曲'
    },
    movie: {
      name: 'REALIVE (R2) 演唱會影像 數位版', img: 'nick-r2.jpg',
      sub: '小巨蛋 R2 特仕版演唱會影像，串流／下載。',
      cat: 'digital', subKey: 'movie', content: 'video', variant: 'single', edition: 'unlimited',
      status: 'live', price: '12.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Movie · 電影'
    },
    album: {
      name: 'LOVE RAGE HOPE — 數位專輯', img: 'nick-album.jpg',
      sub: '第五張錄音室專輯，十軌完整下載附歌詞。',
      cat: 'digital', subKey: 'album', content: 'album', variant: 'single', edition: 'unlimited',
      status: 'live', price: '15.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Album · 音樂專輯',
      albumSeed: [
        { name: '未完成的夢', meta: 'weiwan-de-meng.mp3 · 3.4 MB · 2025', lyrics: true },
        { name: 'FLAMES', meta: 'flames.mp3 · 8.2 MB', lyrics: true },
        { name: '我的i', meta: 'wo-de-i.mp3 · 7.6 MB', lyrics: true },
        { name: 'SO SICK', meta: 'so-sick.mp3 · 6.8 MB', lyrics: false },
        { name: 'TIL THE END', meta: 'til-the-end.mp3 · 4.4 MB', lyrics: true }
      ]
    },
    membership: {
      name: 'NICKTHEREAL 官方後援會', img: 'nick-member.jpg',
      sub: '定期訂閱會員卡：搶先聽、優先購票、專屬社群。',
      cat: 'digital', subKey: 'membership', content: 'membership', variant: 'single', edition: 'unlimited',
      status: 'live', price: '10.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Membership / VIP card · 會員卡',
      vipName: 'NICKTHEREAL Club'
    }
  };

  var DATASETS = { default: P_DEFAULT, nick: P_NICK /* userB 未列＝沿用 default */ };
  function active() { return DATASETS[persona()] || DATASETS.default; }

  var P = active();
  window.ZTOR_PRODUCTS = P;
  // 由 ?id 取商品；找不到回 null（頁面自帶預設 zine）。
  window.ztorGetProduct = function (id) { return (id && P[id]) ? P[id] : null; };

  /* ── e-shop 列表就地改列（persona ≠ default 時）──────────────────
     e-shop.html 的商品名／圖寫死在 HTML、價/庫存/分類走 i18n key；i18n apply 後由此
     依當前 persona 的商品資料把每列覆蓋一致（名＋圖＋價＋分類＋庫存）。用列內
     product-detail.html?id=<key> 連結取得該列的商品 id。變體數／狀態 badge 等深層
     欄位維持原樣（第一批範圍）。監聽 i18n:applied 以免語言切換後被還原。 */
  function priceText(p) { return '$' + String(p.price).replace(/\.00$/, ''); }
  function stockText(p) {
    if (p.edition === 'limited') return (p.sold || '0') + ' / ' + (p.cap || '∞');
    if (p.stock === '∞' || p.cat === 'digital') return '∞';
    return p.stock + ' / ∞';
  }
  function patchEshopList() {
    if (persona() === 'default') return;
    var list = document.querySelector('.product-list, [data-eshop-list]') ||
               (document.querySelector('.product-list__row') && document.body);
    if (!list) return;
    document.querySelectorAll('.product-list__row').forEach(function (row) {
      var link = row.querySelector('a[href*="product-detail.html?id="]');
      if (!link) return;
      var m = /[?&]id=([^&]+)/.exec(link.getAttribute('href'));
      var p = m && active()[m[1]];
      if (!p) return;
      var title = row.querySelector('.product-list__title');
      if (title) title.textContent = p.name;
      var img = row.querySelector('.product-list__image img');
      if (img && p.img) { img.setAttribute('src', 'images/products/' + p.img); img.setAttribute('alt', ''); }
      /* 不動 data-name：它是補貨模組（PRODUCT_MATRIX/PRODUCT_VARIANTS）的內部查表鍵，
         改了會讓該列補貨查不到變體。只換可見標題即可。 */
      var price = row.querySelector('.product-list__price');
      if (price) price.textContent = priceText(p);
      var catSub = row.querySelector('.product-list__cat-sub');
      if (catSub && p.subLabel) catSub.textContent = p.subLabel.split(' · ')[0];
      var stockCell = row.querySelector('.product-list__stock span[data-i18n], .product-list__stock');
      if (stockCell && stockCell.querySelector('.stock-tip__pop') == null) stockCell.textContent = stockText(p);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchEshopList);
  } else { patchEshopList(); }
  document.addEventListener('i18n:applied', patchEshopList);
})();
