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
(function () {
  var P = {
    zine: {
      name: 'Tour zine vol. 02',
      sub: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
      cat: 'physical', subKey: 'zine', variant: 'single', edition: 'unlimited',
      status: 'low', price: '24.00', cost: '9.00', stock: '3', threshold: '4',
      catLabel: 'Physical Merchandise', subLabel: 'Books · 書籍'
    },
    tee: {
      name: 'Coastline tee',
      sub: 'Heavyweight cotton tee — east-coast tour print. 4 variants.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '32.00', cost: '11.00', stock: '42', threshold: '6',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      variantName: 'Size / 尺寸', variantValues: ['S', 'M', 'L', 'XL']
    },
    hoodie: {
      name: 'Coastline hoodie',
      sub: 'Brushed-fleece hoodie — embroidered wave mark. 6 variants.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'low', price: '58.00', cost: '22.00', stock: '48', threshold: '8',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      variantName: 'Size / 尺寸', variantValues: ['XS', 'S', 'M', 'L', 'XL', '2XL']
    },
    acetate: {
      name: 'Coastline acetate · numbered 1/50',
      sub: 'Hand-numbered acetate LP — limited run of 50, signed.',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '120.00', cost: '38.00', stock: '29', cap: '50', sold: '21', threshold: '5',
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品'
    },
    pin: {
      name: 'Enamel pin · wave',
      sub: 'Hard-enamel pin, gold plating. Wave mark.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'soldout', price: '12.00', cost: '3.50', stock: '0', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    song: {
      name: 'Coastline · single',
      sub: 'Lead single — instant download after purchase.',
      cat: 'digital', subKey: 'song', content: 'song', variant: 'single', edition: 'unlimited',
      status: 'live', price: '1.50', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Song · 音樂單曲'
    },
    movie: {
      name: 'Tour documentary',
      sub: 'Feature-length tour documentary — stream / download.',
      cat: 'digital', subKey: 'movie', content: 'video', variant: 'single', edition: 'unlimited',
      status: 'live', price: '9.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Movie · 電影'
    },
    album: {
      name: 'Coastline EP — digital download',
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
      name: 'Inner circle · membership',
      sub: 'Recurring membership card — perks, early access, community.',
      cat: 'digital', subKey: 'membership', content: 'membership', variant: 'single', edition: 'unlimited',
      status: 'live', price: '8.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Membership / VIP card · 會員卡',
      vipName: 'Inner Circle'
    }
  };

  window.ZTOR_PRODUCTS = P;
  // 由 ?id 取商品；找不到回 null（頁面自帶預設 zine）。
  window.ztorGetProduct = function (id) { return (id && P[id]) ? P[id] : null; };
})();
