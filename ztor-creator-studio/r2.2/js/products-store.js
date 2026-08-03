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
//   edition    庫存版本 unlimited | limited
//   status     live | low | soldout（狀態 badge 與庫存呈現）
//   price/cost 現金字串；stock 目前庫存；cap 限量上限（limited 才有）；sold 已售（limited 才有）
//   albumSeed  數位·專輯的預置曲目（餵給 album-tracks 的 data-album-seed）
//   vipName    數位·會員卡的預置卡面名稱
//   img        e-shop 列表縮圖檔名（在 images/products/ 下）；供 persona 就地改列用
//
// ── Persona（2026-07-24）──────────────────────────────────────────
// cheat code「User」切換改 localStorage 'ztor.persona'：default＝原批（九龍夜行 巡迴
// 世界觀）、nick＝周湯豪 NICKTHEREAL、userB＝佔位沿用 default。兩個 persona 用「相同的
// 9 個商品 id」，所以 e-shop 列表既有的 ?id=<key> 連結與 product-detail 都自動對上。
// product-detail 依當前 persona 讀對應商品；e-shop 列表的商品名／圖是寫死在 HTML（非
// i18n key），故由本檔的 patchEshopList() 在載入後就地改列（名＋圖＋價＋庫存＋分類一起換，
// 不半套）。⚠ nick 圖沿用現有 images/products/ 檔、金額為示意值。
(function () {
  var PERSONA_KEY = 'ztor.persona';
  function persona() {
    /* 單一真相見 js/theme.js 的 seedPersona()（與 projects-store 同一個理由）。 */
    if (typeof window.ztorPersonaId === 'function') return window.ztorPersonaId();
    try { var p = localStorage.getItem(PERSONA_KEY); if (p === 'nick' || p === 'userB') return p; } catch (_) {}
    return 'default';
  }

  /* ── default：原有 9 商品（九龍夜行 巡迴）───────────────────── */
  var P_DEFAULT = {
    zine: {
      name: '海上霸姬 幕後寫真誌 vol.02', img: 'tour-zine-vol-02.webp',
      sub: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
      cat: 'physical', subKey: 'zine', variant: 'single', edition: 'unlimited',
      status: 'low', price: '24.00', cost: '9.00', stock: '3', threshold: '4',
      catLabel: 'Physical Merchandise', subLabel: 'Books · 書籍'
    },
    tee: {
      name: '九龍夜行 紀念 T 恤', img: 'coastline-tee.webp',
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
      name: '九龍夜行 連帽外套', img: 'coastline-hoodie.webp',
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
      name: '九龍夜行 原聲黑膠 · 編號 1/50', img: 'coastline-acetate.webp',
      sub: 'Hand-numbered acetate LP — limited run of 50, signed. Collect on-site at the signing session.',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '120.00', cost: '38.00', stock: '29', cap: '50', sold: '21', threshold: '5',
      delivery: 'qr',   /* 現場 QR 領取示範：簽名場次現場領取的限量收藏品（唯一一筆 QR 領取商品）*/
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品'
    },
    pin: {
      name: '霓虹招牌 琺瑯徽章', img: 'enamel-pin-wave.webp',
      sub: 'Hard-enamel pin, gold plating. Wave mark.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'soldout', price: '12.00', cost: '3.50', stock: '0', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    song: {
      name: '九龍夜行 主題單曲', img: 'coastline-single.webp',
      sub: 'Lead single — instant download after purchase.',
      cat: 'digital', subKey: 'song', content: 'song', variant: 'single', edition: 'unlimited',
      status: 'live', price: '1.50', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Song · 音樂單曲'
    },
    movie: {
      name: '海上霸姬 幕後紀錄', img: 'tour-documentary.webp',
      sub: 'Feature-length tour documentary — stream / download.',
      cat: 'digital', subKey: 'movie', content: 'video', variant: 'single', edition: 'unlimited',
      status: 'live', price: '9.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Movie · 電影'
    },
    album: {
      name: '九龍夜行 原聲帶 數位下載', img: 'coastline-ep.webp',
      sub: 'Five-track EP — full download with lyrics.',
      cat: 'digital', subKey: 'album', content: 'album', variant: 'single', edition: 'unlimited',
      status: 'live', price: '12.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Album · 音樂專輯',
      albumSeed: [
        { name: '夜行序曲', meta: 'kowloon-intro.mp3 · 3.2 MB · Apr 2026', lyrics: false },
        { name: '霓虹街口', meta: 'neon-crossing.mp3 · 8.1 MB', lyrics: true },
        { name: '天台的風', meta: 'rooftop-wind.mp3 · 7.4 MB', lyrics: true },
        { name: '暗流', meta: 'undertow.mp3 · 6.9 MB', lyrics: false },
        { name: '夜行 重奏', meta: 'kowloon-reprise.mp3 · 4.0 MB', lyrics: false }
      ]
    },
    membership: {
      name: '林家維 官方後援會', img: 'inner-circle-membership.webp',
      sub: 'Recurring membership card — perks, early access, community.',
      cat: 'digital', subKey: 'membership', content: 'membership', variant: 'single', edition: 'unlimited',
      status: 'live', price: '8.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Membership / VIP card · 會員卡',
      vipName: 'Inner Circle'
    },
    /* cap／shoes（2026-07-25 新增）：為「服飾四件組」的成員而開的兩個新商品 id。
       default persona 也要有對應資料，否則這兩列在 default 下點編輯會查不到商品。 */
    cap: {
      name: '九龍夜行 六片帽', img: 'cap.webp',
      sub: 'Embroidered six-panel cap with adjustable strap. Four colours.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '26.00', cost: '9.00', stock: '98', threshold: '12',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [{ name: 'Colour / 顏色', values: ['Grey', 'Black', 'Navy', 'Cream'] }],
      variants: [
        { combo: ['Grey'],  sku: 'CL-CAP-GY', stock: '24' },
        { combo: ['Black'], sku: 'CL-CAP-BK', stock: '33' },
        { combo: ['Navy'],  sku: 'CL-CAP-NV', stock: '22' },
        { combo: ['Cream'], sku: 'CL-CAP-CR', stock: '19' }
      ]
    },
    shoes: {
      name: '九龍夜行 帆布低筒鞋', img: 'nick-nike-01.jpg',
      sub: '九龍夜行 帆布低筒鞋 sneaker, rubber cup sole. Four sizes.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '64.00', cost: '27.00', stock: '72', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [{ name: 'Size / 尺碼', values: ['US 8', 'US 9', 'US 10', 'US 11'] }],
      variants: [
        { combo: ['US 8'],  sku: 'CL-SHO-08', stock: '15' },
        { combo: ['US 9'],  sku: 'CL-SHO-09', stock: '23' },
        { combo: ['US 10'], sku: 'CL-SHO-10', stock: '21' },
        { combo: ['US 11'], sku: 'CL-SHO-11', stock: '13' }
      ]
    }
  };

  /* ── nick：周湯豪 NICKTHEREAL（相同 9 個 id，換內容）─────────────
     圖沿用現有 images/products/ 檔（非本人素材），價格為示意值。 */
  var P_NICK = {
    zine: {
      name: 'REALIVE 巡演精裝寫真誌', img: 'tour-zine-vol-02.webp',
      sub: '48 頁巡演幕後寫真＋精裝 EP 卡冊。',
      cat: 'physical', subKey: 'zine', variant: 'single', edition: 'unlimited',
      status: 'low', price: '32.00', cost: '11.00', stock: '5', threshold: '6',
      catLabel: 'Physical Merchandise', subLabel: 'Books · 書籍'
    },
    tee: {
      name: 'REALIVE 白趴 官方 Tee', img: 'tee-black.webp',
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
      name: '祝你好命 連帽外套', img: 'zip-hoodie.webp',
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
    /* 黑膠單品（2026-07-25 使用者指定）：限量編號版，同時是「黑膠＋海報」組合包的成員。
       ⚠ 圖沿用既有 coastline-acetate.webp（黑膠實拍），非周湯豪本人素材，之後可替換。 */
    acetate: {
      name: 'LOVE RAGE HOPE 限量黑膠 1/500', img: 'coastline-acetate.webp',
      sub: '第五張專輯 180g 雙碟裝黑膠，透明橘膠、內含歌詞海報。全球限量 500 張，附獨立編號。',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '68.00', cost: '26.00', stock: '312', cap: '500', sold: '188', threshold: '25',
      catLabel: 'Physical Merchandise', subLabel: 'Music · 黑膠唱片'
    },
    /* 帽子單品（2026-07-25 使用者指定）：「選物四件組」成員之一，單獨也販售中。
       ⚠ 圖沿用既有 cap.webp（非周湯豪本人素材），之後可替換。 */
    cap: {
      name: '祝你好命 刺繡 Logo 老帽', img: 'cap.webp',
      sub: '周湯豪主理品牌「祝你好命」刺繡 Logo 六片老帽，可調式金屬後扣。4 色。',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '32.00', cost: '11.00', stock: '124', threshold: '12',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [{ name: 'Colour / 顏色', values: ['霧灰', '墨黑', '海軍藍', '米白'] }],
      variants: [
        { combo: ['霧灰'],   sku: 'WY-CAP-GY', stock: '31' },
        { combo: ['墨黑'],   sku: 'WY-CAP-BK', stock: '42' },
        { combo: ['海軍藍'], sku: 'WY-CAP-NV', stock: '28' },
        { combo: ['米白'],   sku: 'WY-CAP-CR', stock: '23' }
      ]
    },
    /* 鞋子單品（2026-07-25 使用者指定）：「選物四件組」成員之一，單獨也販售中。
       圖＝nick-nike.jpg（祝你好命聯名球鞋實拍，紅包主題），由褲子那筆讓出、放回鞋款本身。 */
    shoes: {
      name: '祝你好命 紅包主題低筒球鞋', img: 'nick-nike-01.jpg',
      sub: '周湯豪主理品牌「祝你好命」紅包主題低筒球鞋，紅／白／螢光綠配色，附品牌鞋盒。',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '78.00', cost: '32.00', stock: '86', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [{ name: 'Size / 尺碼', values: ['US 8', 'US 9', 'US 10', 'US 11'] }],
      variants: [
        { combo: ['US 8'],  sku: 'WY-SHO-08', stock: '18' },
        { combo: ['US 9'],  sku: 'WY-SHO-09', stock: '27' },
        { combo: ['US 10'], sku: 'WY-SHO-10', stock: '25' },
        { combo: ['US 11'], sku: 'WY-SHO-11', stock: '16' }
      ]
    },
    /* 褲子單品（2026-07-25 使用者指定）：「選物四件組」成員之一，單獨也販售中。
       ⚠ 圖：站上無棉褲實拍，暫用 socks.webp（同為下身著用品）佔位，之後可替換。 */
    pin: {
      name: '祝你好命 束口工裝褲', img: 'socks.webp',
      sub: '周湯豪主理品牌「祝你好命」水洗棉束口工裝褲，側邊立體口袋。4 種腰圍 × 2 色。',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '58.00', cost: '21.00', stock: '96', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [
        { name: 'Colour / 顏色', values: ['Black', 'Olive'] },
        { name: 'Waist / 腰圍', values: ['28', '30', '32', '34'] }
      ],
      variants: [
        { combo: ['Black', '28'], sku: 'WY-PT-BK-28', stock: '9' },
        { combo: ['Black', '30'], sku: 'WY-PT-BK-30', stock: '18' },
        { combo: ['Black', '32'], sku: 'WY-PT-BK-32', stock: '16' },
        { combo: ['Black', '34'], sku: 'WY-PT-BK-34', stock: '7' },
        { combo: ['Olive', '28'], sku: 'WY-PT-OL-28', stock: '8' },
        { combo: ['Olive', '30'], sku: 'WY-PT-OL-30', stock: '15' },
        { combo: ['Olive', '32'], sku: 'WY-PT-OL-32', stock: '17' },
        { combo: ['Olive', '34'], sku: 'WY-PT-OL-34', stock: '6' }
      ]
    },
    song: {
      name: '帥到分手 · 單曲', img: 'nick-single.jpg',
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
        { name: '帥到分手', meta: 'shuai-dao-fen-shou.mp3 · 7.6 MB', lyrics: true },
        { name: 'SO SICK', meta: 'so-sick.mp3 · 6.8 MB', lyrics: false },
        { name: 'TIL THE END', meta: 'til-the-end.mp3 · 4.4 MB', lyrics: true }
      ]
    },
    membership: {
      name: 'NICKTHEREAL 官方後援會', img: 'inner-circle-membership.webp',
      sub: '定期訂閱會員卡：搶先聽、優先購票、專屬社群。',
      cat: 'digital', subKey: 'membership', content: 'membership', variant: 'single', edition: 'unlimited',
      status: 'live', price: '10.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Membership / VIP card · 會員卡',
      vipName: 'NICKTHEREAL Club'
    }
  };

  /* 2026-07-27：Nick 商店改用 wishyouagoodlife.com/products 的實際商品資料。
     原有 id 保留作為舊連結相容；新商品以 wy-* id 對應來源子頁。 */
  function wishProduct(name, img, price, sub, options, stock, sourceUrl, gallery) {
    return {
      name: name, img: img, gallery: gallery || [img], sourceUrl: sourceUrl,
      currency: 'TWD',
      sub: sub, cat: 'physical', subKey: 'apparel', variant: options && options.length ? 'multiple' : 'single',
      edition: 'unlimited', status: stock === 0 ? 'live' : 'live', price: String(price), cost: '', stock: String(stock), threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾', options: options || []
    };
  }
  var WISHYOU_PRODUCTS = {
    'wy-26ms-hoodie': wishProduct('26MS Hoodie', '26ms-hoodie-01.jpeg', 3680, '注意事項：不可水洗、緩和乾洗；50%棉50%滌綸。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 3, 'https://www.wishyouagoodlife.com/products/26ms-hoodie', ['26ms-hoodie-01.jpeg', '26ms-hoodie-02.jpeg']),
    'wy-26ms-socks': wishProduct('26MS Socks', '26ms-socks-01.jpeg', 688, '材質：棉 82%、彈性纖維 13%、彈性纖維 5%。', [{ name: 'Size / 尺寸', values: ['F'] }], 425, 'https://www.wishyouagoodlife.com/products/26ms-socks'),
    'wy-26ms-tshirt-white': wishProduct('26MS T-Shirt (白)', '26ms-t-shirt-w-01.jpeg', 1880, '注意事項：不可水洗、緩和乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/26ms-t-shirt-w', ['26ms-t-shirt-w-01.jpeg', '26ms-t-shirt-w-02.jpeg']),
    'wy-26ms-tshirt-red': wishProduct('26MS T-Shirt (紅)', '26ms-t-shirt-r-01.jpeg', 1880, '注意事項：不可水洗、緩和乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/26ms-t-shirt-r', ['26ms-t-shirt-r-01.jpeg', '26ms-t-shirt-r-02.jpeg']),
    'wy-24ce-pillow': wishProduct('WYAGL Pillow', 'wyagl-pillow-01.jpg', 1580, '材質：聚酯纖維；尺寸：40cm ±5%；可機洗、不可漂白、不可熨燙。', [{ name: 'Size / 尺寸', values: ['F'] }], 0, 'https://www.wishyouagoodlife.com/products/wyagl-pillow-1', ['wyagl-pillow-01.jpg', 'wyagl-pillow-02.jpg', 'wyagl-pillow-03.jpg']),
    'wy-24ce-jersey': wishProduct('24CE High Shine Football Jersey', '24ce-high-shine-football-jersey-01.jpg', 3680, '注意事項：冷水溫和洗滌、不可漂白；尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/wish-you-a-good-life-high-shine-football-jersey', ['24ce-high-shine-football-jersey-01.jpg', '24ce-high-shine-football-jersey-02.jpg', '24ce-high-shine-football-jersey-03.jpg', '24ce-high-shine-football-jersey-04.jpg']),
    'wy-24ce-skateboard': wishProduct('24CE Skateboard', '24ce-skateboard-01.jpg', 2880, '尺寸：8.0 吋；材質：加拿大楓木七層壓合。', [], 0, 'https://www.wishyouagoodlife.com/products/wyagl-24ce-skateboard', ['24ce-skateboard-01.jpg', '24ce-skateboard-02.jpg']),
    'wy-24ce-mesh': wishProduct('WYAGL Mesh T-shirt', 'wyagl-mesh-t-shirt-01.jpg', 3580, '注意事項：冷水溫和洗滌、不可漂白；尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/wyagl-mesh-t-shirt', ['wyagl-mesh-t-shirt-01.jpg', 'wyagl-mesh-t-shirt-02.jpg', 'wyagl-mesh-t-shirt-03.jpg']),
    'wy-24ce-rug': wishProduct('WYAGL RUG', 'wyagl-rug-01.jpg', 5680, '直徑90公分（±2公分）；100%聚酯纖維。建議使用地毯專用清潔劑清潔。', [{ name: 'Size / 尺寸', values: ['F'] }], 0, 'https://www.wishyouagoodlife.com/products/wyagl-24ce-rug'),
    'wy-24ce-sock': wishProduct('WYAGL Sock', 'wyagl-sock-01.jpg', 1280, '材質：棉 82%、彈性纖維 13%、彈性纖維 5%。', [{ name: 'Colour / 顏色', values: ['一黑一白一紅組合'] }], 0, 'https://www.wishyouagoodlife.com/products/wyagl-sock', ['wyagl-sock-01.jpg', 'wyagl-sock-02.jpg']),
    'wy-24ce-wyagl-tee': wishProduct('Wish You A Good Life T-SHIRT', 'wish-you-a-good-life-t-shirt-01.jpg', 1680, '低溫30°C洗滌、不可乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/wish-you-a-good-life-t-shirt', ['wish-you-a-good-life-t-shirt-01.jpg', 'wish-you-a-good-life-t-shirt-02.jpg', 'wish-you-a-good-life-t-shirt-03.jpg']),
    'wy-24ce-tee': wishProduct('WYAGL T-SHIRT', 'wyagl-t-shirt-01.jpg', 1680, '低溫30°C洗滌、不可乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['L', 'M', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/wyagl-t-shirt', ['wyagl-t-shirt-01.jpg', 'wyagl-t-shirt-02.jpg', 'wyagl-t-shirt-03.jpg']),
    'wy-24ce-dupont-bag': wishProduct('Dupont Bag', 'wyagl-dupont-bag-01.jpg', 1080, '尺寸 M/L/XL；銀色；杜邦紙材質，防水可水洗。尺寸皆為水平手工測量。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, 'https://www.wishyouagoodlife.com/products/wyagl-dupont-bag', ['wyagl-dupont-bag-01.jpg', 'wyagl-dupont-bag-02.jpg', 'wyagl-dupont-bag-03.jpg']),
    'wy-bundle-cap': wishProduct('祝你好命 刺繡 Logo 老帽', 'wyagl-cap-generated.webp', '待確認', '以組合包紅白黑配色延伸的黑色六片老帽，紅色刺繡圓章細節。', [{ name: 'Colour / 顏色', values: ['Black'] }], 0, '', ['wyagl-cap-generated.webp']),
    'wy-bundle-cargo-pants': wishProduct('祝你好命 束口工裝褲', 'wyagl-cargo-pants-generated.webp', '待確認', '以組合包配色延伸的黑色水洗束口工裝褲，側邊口袋與紅色車線細節。', [{ name: 'Size / 尺寸', values: ['S', 'M', 'L', 'XL'] }], 0, '', ['wyagl-cargo-pants-generated.webp']),
    'wy-bundle-lowtop-sneakers': wishProduct('祝你好命 紅白低筒球鞋', 'wyagl-lowtop-sneakers-generated.webp', '待確認', '以組合包配色延伸的紅白黑低筒球鞋，鞋跟有螢光綠點綴。', [{ name: 'Size / 尺寸', values: ['US 8', 'US 9', 'US 10', 'US 11'] }], 0, '', ['wyagl-lowtop-sneakers-generated.webp'])
  };
  /* 既有入口保留，但內容與來源商品同步。 */
  /* 2026-07-27 使用者指定的列表排序：這四筆置頂（白 Tee → 老帽 → 束口褲 → 球鞋），
     其餘沿用 WISHYOU_PRODUCTS 的定義順序。只影響 e-shop 列表的產列順序，不動商品內容。 */
  var WISH_TOP_IDS = ['wy-26ms-tshirt-white', 'wy-bundle-cap', 'wy-bundle-cargo-pants', 'wy-bundle-lowtop-sneakers'];
  var WISH_IDS = WISH_TOP_IDS.concat(Object.keys(WISHYOU_PRODUCTS).filter(function (id) {
    return WISH_TOP_IDS.indexOf(id) === -1;
  }));
  P_NICK = Object.assign({}, WISHYOU_PRODUCTS, {
    zine: WISHYOU_PRODUCTS['wy-26ms-hoodie'], tee: WISHYOU_PRODUCTS['wy-26ms-tshirt-white'],
    hoodie: WISHYOU_PRODUCTS['wy-26ms-hoodie'], acetate: WISHYOU_PRODUCTS['wy-24ce-pillow'],
    cap: WISHYOU_PRODUCTS['wy-bundle-cap'], shoes: WISHYOU_PRODUCTS['wy-bundle-lowtop-sneakers'],
    pin: WISHYOU_PRODUCTS['wy-bundle-cargo-pants'], song: WISHYOU_PRODUCTS['wy-26ms-socks'],
    movie: WISHYOU_PRODUCTS['wy-24ce-jersey'], album: WISHYOU_PRODUCTS['wy-24ce-mesh'],
    membership: WISHYOU_PRODUCTS['wy-24ce-dupont-bag']
  });
  var DATASETS = { default: P_DEFAULT, nick: P_NICK /* userB 未列＝沿用 default */ };
  function active() { return DATASETS[persona()] || DATASETS.default; }

  /* ── 組合包與拍賣（2026-07-25）──────────────────────────────────
     e-shop 的「組合」與「競標」兩個分頁，列是寫死在 e-shop.html 的（沒有 ?id= 連結可查），
     因此 persona 切換時原本不會跟著換，會露出 九龍夜行 的名字。這裡用列的 data-name
     （內部查表鍵、不會被 i18n 覆寫）當 key，替換可見的名稱／圖／成員／價格／庫存。
     組合包結構參考公開端 shop-item.html?id=fan-selection-set：一組多件、每件各自選規格、
     組合價低於單買加總。⚠ 圖沿用既有 images/products/ 檔，之後可替換。 */
  var BUNDLES_NICK = {
    /* 2026-07-25 使用者指定：改成公開端「影迷選物四件組」（shop-item.html?id=fan-selection-set）
       的同型組合——Tee／帽／褲／鞋各自挑尺寸顏色，組合價低於單買加總（206→178，省 $28）。
       四件在 e-shop 都是可單買的獨立商品（cap／shoes／tee／pin，狀態皆販售中）。 */
    '九龍夜行 入門組合': {
      id: 'wish-you-good-life-four-piece',
      name: '『祝你好命』選物四件組', img: 'set-outfit-model.webp',
      description: '白 Tee、刺繡 Logo 老帽、束口工裝褲與低筒球鞋，以紅白黑配色組成的四件穿搭。',
      membersKey: 'e-shop.bnick.set.members', price: 'NT$5,980', priceAmount: 5980, stockAvail: 16,
      memberItems: [
        { id: 'wy-26ms-tshirt-white', name: '26MS T-Shirt (白)', meta: 'Wish You A Good Life · NT$1,880', price: 'NT$1,880', img: '26ms-t-shirt-w-01.jpeg' },
        { id: 'wy-bundle-cap', name: '祝你好命 刺繡 Logo 老帽', meta: '組合包延伸單品 · 價格待確認', price: '待確認', img: 'wyagl-cap-generated.webp' },
        { id: 'wy-bundle-cargo-pants', name: '祝你好命 束口工裝褲', meta: '組合包延伸單品 · 價格待確認', price: '待確認', img: 'wyagl-cargo-pants-generated.webp' },
        { id: 'wy-bundle-lowtop-sneakers', name: '祝你好命 紅白低筒球鞋', meta: '組合包延伸單品 · 價格待確認', price: '待確認', img: 'wyagl-lowtop-sneakers-generated.webp' }
      ]
    },
    'Vinyl + poster set': {
      name: 'LOVE RAGE HOPE 黑膠典藏組', img: 'coastline-acetate.webp',
      membersKey: 'e-shop.bnick.vinyl.members', price: '$92', stockAvail: 18
    }
  };
  var AUCTIONS_NICK = {
    /* 2026-07-26：改用使用者提供的 PRS Custom24 10-Top 實拍（PRS 10-Top.webp）。
       ⚠ 該圖帶 PRS 官方品牌 logo 浮水印，屬廠商商品照非本人素材；僅供內部原型預覽，
       對外展示／公開發布前需替換成無品牌標示或已授權的素材。 */
    /* 2026-07-27：meta／cat／「起標」原本寫死繁中，英文語系整片漏譯。改成 metaKey／catKey
       ＋ priceFrom 旗標——品名（name）維持中文，那是賣家自己的商品名，與商品分頁的處理一致；
       其餘（狀況、分類、起標）都是系統詞彙，一律走 i18n。 */
    'Stage-worn leather jacket': {
      id: 'realive-tour-guitar',
      name: 'REALIVE 巡演主吉他（親簽）', metaKey: 'e-shop.anick.guitar.meta',
      img: 'PRS 10-Top.webp', catKey: 'e-shop.cat.instruments', price: '$1,280'
    },
    'Signed tour poster 1 of 1': {
      name: '白趴主舞台親簽海報 1 of 1', metaKey: 'e-shop.anick.poster.meta',
      img: 'signed-tour-poster.webp', catKey: 'e-shop.cat.memorabilia', price: '$120', priceFrom: true
    },
    'Vintage synth': {
      name: '《帥到分手》錄音室母帶盤帶', metaKey: 'e-shop.anick.tape.meta',
      img: 'coastline-single.webp', catKey: 'e-shop.cat.memorabilia', price: '$860'
    },
    'WYAGL Nike Dunk Low Pro SB': {
      id: 'wyagl-nike-dunk',
      name: 'Nike Dunk Low Pro SB「WYAGL / 祝你好命」客製鞋', metaKey: 'e-shop.anick.dunk.meta',
      img: 'nick-nike-00.jpg', catKey: 'e-shop.cat.footwear', price: 'NT$12,800', priceFrom: true,
      activityKey: 'e-shop.aNick.activity', gallery: ['nick-nike-00.jpg', 'nick-nike-01.jpg', 'nick-nike-02.jpg', 'nick-nike-03.jpg']
    }
  };
  function patchBundlesAndAuctions() {
    if (persona() !== 'nick') return;
    document.querySelectorAll('.product-list__row[data-type="bundle"]').forEach(function (row) {
      var b = BUNDLES_NICK[row.getAttribute('data-name') || ''];
      if (!b) return;
      var detail = row.querySelector('a[href*="bundle-detail.html"]');
      if (detail && b.id) detail.setAttribute('href', 'bundle-detail.html?id=' + b.id);
      /* 組合名＝賣家內容（維持中文）；成員組成是系統敘述（品項＋件數）故走 key。 */
      var t = row.querySelector('.product-list__title');
      if (t) { t.removeAttribute('data-i18n'); t.textContent = b.name; }
      var img = row.querySelector('.product-list__image img');
      if (img) { img.setAttribute('src', 'images/products/' + b.img); img.setAttribute('alt', ''); }
      var mem = row.querySelector('.product-list__category-cell');
      if (mem && b.membersKey) { mem.setAttribute('data-i18n', b.membersKey); mem.textContent = tr(b.membersKey); }
      var pr = row.querySelector('.product-list__price');
      if (pr) { pr.removeAttribute('data-i18n'); pr.textContent = b.price; }
      /* 庫存改走結構化數字＋共用格式器（xx / xx），與商品分頁一致；不再寫「16 組（最少件數）」
         這種散文。實際的「取成員最低庫存」說明由 stock-tip 浮卡逐項列出。 */
      if (b.stockAvail != null) {
        row.setAttribute('data-stock-avail', b.stockAvail);
        if (b.stockCap != null) row.setAttribute('data-stock-cap', b.stockCap);
        if (window.ztorEshopStatus && window.ztorEshopStatus.renderStock) window.ztorEshopStatus.renderStock(row);
      }
    });
    document.querySelectorAll('.product-list__row[data-type="auction"]').forEach(function (row) {
      var a = AUCTIONS_NICK[row.getAttribute('data-name') || ''];
      if (!a) return;
      /* 上游 2026-07-27 的詳情頁連結修復——必須保留，否則拍賣列點進去會開到錯的頁。 */
      var detail = row.querySelector('a[href*="auction-detail.html"]');
      if (detail && a.id) detail.setAttribute('href', 'auction-detail.html?id=' + a.id);
      /* 品名＝賣家內容，維持原值並移除原本那格的 key（示意英文名已不代表這一列）。 */
      var t = row.querySelector('.product-list__title');
      if (t) { t.removeAttribute('data-i18n'); t.textContent = a.name; }
      /* 以下都掛上 data-i18n，切語言時由 applyI18n 直接重譯，不必等本函式再跑一次。 */
      var mt = row.querySelector('.product-list__meta');
      if (mt && a.metaKey) { mt.setAttribute('data-i18n', a.metaKey); mt.textContent = tr(a.metaKey); }
      var img = row.querySelector('.product-list__image img');
      if (img) { img.setAttribute('src', 'images/products/' + a.img); img.setAttribute('alt', ''); }
      var c = row.querySelector('.product-list__category-cell');
      if (c && a.catKey) { c.setAttribute('data-i18n', a.catKey); c.textContent = tr(a.catKey); }
      /* 「起標」是系統字＋金額是資料：組起來寫，並清掉舊 key 以免被示意價蓋回去。 */
      var pr = row.querySelector('.product-list__price');
      if (pr) {
        pr.removeAttribute('data-i18n');
        pr.textContent = a.priceFrom ? (tr('e-shop.bid.from') + ' ' + a.price) : a.price;
      }
      /* activityKey（i18n）優先；仍留 a.activity 字面值分支給尚未轉 key 的舊資料。 */
      var activity = row.querySelector('.product-list__activity');
      if (activity && a.activityKey) { activity.setAttribute('data-i18n', a.activityKey); activity.textContent = tr(a.activityKey); }
      else if (activity && a.activity) activity.textContent = a.activity;
    });
  }

  var P = active();
  window.ZTOR_PRODUCTS = P;
  // 由 ?id 取商品；找不到回 null（頁面自帶預設 zine）。
  window.ztorGetProduct = function (id) { return (id && P[id]) ? P[id] : null; };
  window.ztorGetBundle = function (id) {
    if (persona() !== 'nick') return null;
    var bundles = Object.keys(BUNDLES_NICK).map(function (key) { return BUNDLES_NICK[key]; });
    return bundles.find(function (bundle) { return bundle.id === id; }) || (id == null ? bundles[0] : null);
  };
  window.ztorGetAuction = function (id) {
    if (persona() !== 'nick' || !id) return null;
    var auctions = Object.keys(AUCTIONS_NICK).map(function (key) { return AUCTIONS_NICK[key]; });
    return auctions.find(function (auction) { return auction.id === id; }) || null;
  };

  /* ── e-shop 列表就地改列（persona ≠ default 時）──────────────────
     e-shop.html 的商品名／圖寫死在 HTML、價/庫存/分類走 i18n key；i18n apply 後由此
     依當前 persona 的商品資料把每列覆蓋一致（名＋圖＋價＋分類＋庫存）。用列內
     product-detail.html?id=<key> 連結取得該列的商品 id。變體數／狀態 badge 等深層
     欄位維持原樣（第一批範圍）。監聽 i18n:applied 以免語言切換後被還原。 */
  /* ── i18n 小工具（2026-07-27）────────────────────────────────────
     這支檔案在 i18n:applied 之後改列，等於最後一手；凡是它寫進 DOM 的字都必須自己
     負責語言，否則就會蓋掉剛翻好的內容（正是「英文語系仍顯示販售中」的成因）。
       tr(key)        → 走 i18n.js 對外的 i18nT；key 缺漏時回空字串而非寫死語言
       isZh()         → 目前語系是否繁中（與 i18n.js 的 currentLang 同一判準：html[lang]）
       bilingual(s)   → 資料層的雙語合併字串取對應語言那一邊
                        （'Apparel · 服飾' 以 ' · ' 分隔、'Colour / 顏色' 以 ' / ' 分隔，
                         一律「英文在前、中文在後」）。舊寫法用固定索引 [0] / .pop()
                         取邊，等於把語言寫死在索引裡——分類永遠英文、選項名永遠中文。
       paren(a,b)     → 括號依語系：中文全形（），英文半形 ( )。 */
  function tr(key) { return (window.i18nT && window.i18nT(key)) || ''; }
  function isZh() { return document.documentElement.lang === 'zh-Hant'; }
  function bilingual(s, sep) {
    var parts = String(s == null ? '' : s).split(sep || ' · ');
    if (parts.length < 2) return parts[0] || '';
    return isZh() ? parts[parts.length - 1].trim() : parts[0].trim();
  }
  function paren(label, inner) {
    return isZh() ? label + '（' + inner + '）' : label + ' (' + inner + ')';
  }
  /* 資料層用來表示「價格未定」的佔位值。是系統字串、不是賣家填的內容，故要翻譯。 */
  var PRICE_TBC = '待確認';
  function priceText(p) {
    var raw = String(p.price).replace(/\.00$/, '');
    if (raw === PRICE_TBC) return tr('e-shop.price.tbc') || raw;
    if (!/^\d+(?:\.\d+)?$/.test(raw)) return raw;
    if (persona() === 'nick') return 'NT$' + raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '$' + raw;
  }
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
    /* Nick 商店以來源頁 13 筆實體商品取代原本 11 筆示意列；保留 draft 列與表頭，
       使用既有 row 結構讓篩選、搜尋、分頁與列操作維持原行為。 */
    if (persona() === 'nick' && !list.__wishyouRows) {
      var panel = document.querySelector('[data-eshop-panel="products"]') || list;
      var template = panel.querySelector('.product-list__row:not([data-status="draft"])');
      if (template) {
        panel.querySelectorAll('.product-list__row:not([data-status="draft"])').forEach(function (row) { row.remove(); });
        var draft = panel.querySelector('.product-list__row[data-status="draft"]');
        WISH_IDS.forEach(function (id) {
          var row = template.cloneNode(true);
          row.setAttribute('data-wishyou-id', id);
          row.setAttribute('data-type', 'physical');
          row.setAttribute('data-name', WISHYOU_PRODUCTS[id].name);
          if (draft) panel.insertBefore(row, draft); else panel.appendChild(row);
        });
        list.__wishyouRows = true;
      }
    }
    document.querySelectorAll('.product-list__row').forEach(function (row) {
      var link = row.querySelector('a[href*="product-detail.html?id="]');
      var wishId = row.getAttribute('data-wishyou-id');
      if (wishId && link) link.setAttribute('href', 'product-detail.html?id=' + wishId);
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
      /* 同 catSub：靜態列的價格格帶著 e-shop.rowN.price key（示意值 $24），一旦改成
         persona 的真實價格，那個 key 就不再代表這格，留著只會讓下一輪 applyI18n 蓋回示意值。 */
      if (price) { price.removeAttribute('data-i18n'); price.textContent = priceText(p); }
      var catSub = row.querySelector('.product-list__cat-sub');
      /* subLabel 是 'Apparel · 服飾' 雙語字串；原本固定取 [0]＝永遠英文，中文語系漏譯。
         這裡覆寫的是靜態列上帶 data-i18n 的 span，改寫後該 key 已不適用，一併移除，
         否則下次 applyI18n 會用舊 key 把資料值蓋掉。 */
      if (catSub && p.subLabel) {
        catSub.removeAttribute('data-i18n');
        catSub.textContent = bilingual(p.subLabel, ' · ');
      }

      /* 規格副標：persona 的規格模式可能與 default 那列不同（例：default 的 pin 是單一選項，
         nick 換成有顏色×腰圍的工裝褲），沿用寫死的字會自相矛盾，故一併重寫。 */
      var meta = row.querySelector('.product-list__meta');
      if (meta && p.cat === 'physical') {
        meta.textContent = (p.options && p.options.length)
          ? p.options.map(function (o) {
              /* o.name 是 'Colour / 顏色' 這種雙語字串——取對應語言那一邊，
                 括號也跟著語系走（中文全形、英文半形）。 */
              return paren(bilingual(o.name, ' / '), o.values.join('/'));
            }).join(' × ')
          : tr('e-shop.variant.single');
      }

      /* 狀態徽章與 data-status：同理，nick 的售罄／低量狀態與 default 不同（例：default 的
         pin 售罄、nick 的工裝褲有貨），不換的話會出現「已售完」卻顯示 96 件的矛盾。
         data-status 一併改，狀態篩選 tab 的分류與計數才會對。 */
      /* 2026-07-27：本函式掛在 i18n:applied 上，是「翻譯之後」的最後一手。原本它直接寫
         data-status ＋ 自己畫徽章，於是每次切語言都會把使用者剛按下的「下架」洗回販售中。
         現在只負責回報「商品本身的庫存狀態」（data-stock-status），徽章與 data-status 交給
         e-shop.html 的 renderStatus 推導——上架與否是使用者的決定，不該被資料層覆寫。 */
      var STOCK_DS = { live: 'live', low: 'low', soldout: 'out' };
      var ds = STOCK_DS[p.status];
      if (ds && row.getAttribute('data-status') !== 'draft') {
        row.setAttribute('data-stock-status', ds);
        if (window.ztorEshopStatus && window.ztorEshopStatus.render) {
          window.ztorEshopStatus.render(row);
        } else {
          /* e-shop 以外的頁面沒有那個推導層：退回直接標示，文字一樣走 i18n key。 */
          var FALLBACK = { live: 'e-shop.row.active', low: 'e-shop.row.low', out: 'e-shop.row.out' };
          var CLS = { live: 'badge--success', low: 'badge--error', out: 'badge--neutral' };
          row.setAttribute('data-status', ds);
          var badge = row.querySelector('.product-list__status .badge');
          if (badge) {
            badge.className = 'badge ' + CLS[ds];
            var bs = badge.querySelector('span[data-i18n]');
            if (bs) { bs.setAttribute('data-i18n', FALLBACK[ds]); bs.textContent = tr(FALLBACK[ds]); }
            else badge.textContent = tr(FALLBACK[ds]);
          }
        }
      }

      var stockCell = row.querySelector('.product-list__stock span[data-i18n], .product-list__stock');
      if (stockCell && stockCell.querySelector('.stock-tip__pop') == null) stockCell.textContent = stockText(p);
      else if (stockCell) {
        var sp = stockCell.querySelector('span[data-i18n]');
        if (sp) sp.textContent = stockText(p);
      }
    });
  }
  function patchAll() { patchEshopList(); patchBundlesAndAuctions(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchAll);
  } else { patchAll(); }
  document.addEventListener('i18n:applied', patchAll);
})();
