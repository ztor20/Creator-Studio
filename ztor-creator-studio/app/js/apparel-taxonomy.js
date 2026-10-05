/* apparel-taxonomy.js · 服飾配件的分類、系統屬性與尺寸顏色標準值（2026-10-05 · D360）
   ------------------------------------------------------------------
   單一來源：建立商品（create-product）、商品細節頁（product-detail）、需求看板（demand-board）、
   products-store（商品記錄的 group／category／sub／audience／attrs）、demand-store 都吃這一份，
   各頁不各自抄清單。內容照 documents/0-設計規格書.md：
     · §7.1「服飾配件的大類與次分類」13 大類 → 次分類（葉節點）→ 款式值
     · §7.16 適用對象、系統屬性項目、尺寸與顏色快捷預設（修訂 D249）
   ⚠ 以下幾處規格標〔產品待確認〕（§8.30 第 6～10 項），本檔只是「呈現假設」、畫面不得宣稱定案：
     · 13 大類附錄的個別歸屬（例：Leggings 歸運動服）
     · 屬性完整值域與哪些屬性出現在哪些大類（本檔 attrs[].appliesTo 為呈現假設）
     · 尺寸與顏色標準清單內容、預設帶入值、各標準顏色的色號
     · 次分類的中文名：規格只列英文，本檔 zh 與 en 同字（不自創譯名）

   載入：<script src="js/apparel-taxonomy.js?v=r2.2"></script>，無相依，掛 window.ztorApparel。
   對外 API（全部唯讀；回傳的是內部物件的參考，呼叫端不要改）：
     ztorApparel.GROUP                   { key:'apparel', en, zh }   群組（具名例外 D210 的「商品類型」用這一層）
     ztorApparel.categories()            → [{ key, en, zh, subs:[{ key, en, zh, styles:[string] }] }]  13 大類
     ztorApparel.category(key)           → 大類物件 | null
     ztorApparel.sub(subKey)             → { key, en, zh, styles, category:<大類 key> } | null
     ztorApparel.categoryOfSub(subKey)   → 大類 key | ''
     ztorApparel.label(key, lang)        → 大類或次分類的名稱（lang 'en'|'zh'，預設 'en'）
     ztorApparel.audiences               [{ key:'men'|'women'|'unisex'|'kids', en, zh }]
     ztorApparel.attrs                   系統屬性項目 [{ key, en, zh, multi, appliesTo:['*'|大類 key…], values:[{key,en,zh}] }]
     ztorApparel.attrsFor(categoryKey)   → 該大類出現的屬性項目（呈現假設）
     ztorApparel.sizes                   { standard:['XXS',…,'XXL'], preset:['XS','S','M','L','XL'] }
     ztorApparel.colours                 { standard:[{ name, hex }], preset:['Black','White'] }
     ztorApparel.OTHER_SIZE              '其他尺寸' 的內部鍵（跨商品合併時自行輸入的值歸這一組）
     ztorApparel.isStandardSize(v)       → bool（比對標準清單，不分大小寫、去空白）
   key 命名規則：小寫英文，多字用連字號；T-Shirt 例外寫成 tshirt（照任務慣例，便於當 CSS／資料鍵）。 */
(function () {
  'use strict';

  var GROUP = { key: 'apparel', en: 'Apparel & accessories', zh: '服飾配件' };

  /* 簡寫：s(key, 英文名, [款式…])。款式值取自 §7.1 的 13 大類表（「—」＝沒有預設款式值＝空陣列）。 */
  function s(key, en, styles) { return { key: key, en: en, zh: en, styles: styles || [] }; }

  var CATEGORIES = [
    { key: 'tops', en: 'Tops', zh: '上衣', subs: [
      s('tshirt', 'T-Shirt'), s('polo', 'Polo'), s('henley', 'Henley'), s('tank-top', 'Tank Top'),
      s('shirt', 'Shirt', ['Dress Shirt', 'Casual Shirt', 'Oxford Shirt', 'Hawaiian Shirt']),
      s('blouse', 'Blouse', ['Puff Sleeve', 'Wrap']),
      s('sweater', 'Sweater'), s('cardigan', 'Cardigan'), s('knit-top', 'Knit Top'), s('knit-vest', 'Knit Vest'),
      s('sweatshirt', 'Sweatshirt', ['Crewneck']), s('hoodie', 'Hoodie')
    ] },
    { key: 'outerwear', en: 'Outerwear', zh: '外套', subs: [
      s('jacket', 'Jacket', ['Bomber', 'Varsity', 'Harrington', 'Coach', 'Puffer', 'Windbreaker', 'Utility', 'Field', 'Work']),
      s('blazer', 'Blazer', ['Single-Breasted', 'Double-Breasted', 'Tuxedo']),
      s('coat', 'Coat', ['Overcoat', 'Trench', 'Peacoat', 'Duffle', 'Parka', 'Raincoat', 'Puffer']),
      s('vest', 'Vest', ['Puffer', 'Utility', 'Suit'])
    ] },
    { key: 'bottoms', en: 'Bottoms', zh: '下身', subs: [
      s('jeans', 'Jeans', ['Straight', 'Skinny', 'Wide Leg', 'Bootcut', 'Flared', 'Boyfriend', 'Mom', 'Cargo']),
      s('trousers', 'Trousers', ['Straight', 'Wide Leg', 'Tailored', 'Pleated', 'Cargo', 'Chino']),
      s('joggers', 'Joggers'), s('sweatpants', 'Sweatpants'),
      s('shorts', 'Shorts', ['Tailored', 'Cargo', 'Bermuda', 'Sweat', 'Hot Pants']),
      s('skirt', 'Skirt', ['Pencil', 'A-Line', 'Pleated', 'Wrap', 'Cargo', 'Flared'])
    ] },
    { key: 'dresses', en: 'Dresses & One-Piece', zh: '洋裝與連身', subs: [
      s('dress', 'Dress', ['Slip', 'Shirt', 'Bodycon', 'Wrap', 'A-Line', 'Cocktail', 'Evening', 'Sweater']),
      s('jumpsuit', 'Jumpsuit'), s('romper', 'Romper'), s('overall', 'Overall'), s('playsuit', 'Playsuit')
    ] },
    { key: 'suits', en: 'Suits & Sets', zh: '套裝', subs: [
      s('suit', 'Suit', ['Two-Piece', 'Three-Piece', 'Tuxedo', 'Casual']),
      s('set', 'Set', ['Top + Bottom', 'Jacket + Bottom', 'Knit', 'Sweat', 'Lounge'])
    ] },
    { key: 'activewear', en: 'Activewear', zh: '運動服', subs: [
      s('sports-tshirt', 'Sports T-Shirt'), s('sports-tank', 'Sports Tank'), s('sports-bra', 'Sports Bra'),
      s('compression-top', 'Compression Top'), s('leggings', 'Leggings'), s('training-pants', 'Training Pants'),
      s('track-pants', 'Track Pants'), s('running-shorts', 'Running Shorts'), s('cycling-shorts', 'Cycling Shorts'),
      s('track-jacket', 'Track Jacket'), s('tracksuit', 'Tracksuit'),
      s('sport-specific', 'Sport-specific Wear', ['Yoga', 'Tennis', 'Golf'])
    ] },
    { key: 'underwear', en: 'Underwear & Loungewear', zh: '內衣與居家', subs: [
      s('briefs', 'Briefs'), s('boxers', 'Boxers', ['Boxer', 'Boxer Briefs']), s('panties', 'Panties'),
      s('bra', 'Bra', ['Bra', 'Bralette']), s('shapewear', 'Shapewear'), s('pajama-set', 'Pajama Set'),
      s('robe', 'Robe'), s('lounge-top', 'Lounge Top'), s('lounge-pants', 'Lounge Pants'), s('sleep-dress', 'Sleep Dress')
    ] },
    { key: 'swimwear', en: 'Swimwear', zh: '泳裝', subs: [
      s('bikini', 'Bikini'), s('one-piece-swimsuit', 'One-Piece Swimsuit'),
      s('swim-shorts', 'Swim Shorts', ['Swim Shorts', 'Board Shorts']),
      s('rash-guard', 'Rash Guard'), s('cover-up', 'Cover-Up')
    ] },
    { key: 'shoes', en: 'Shoes', zh: '鞋', subs: [
      s('sneakers', 'Sneakers', ['Low Top', 'High Top', 'Running', 'Lifestyle', 'Skate']),
      s('boots', 'Boots', ['Ankle', 'Chelsea', 'Combat', 'Knee-High', 'Cowboy']),
      s('formal-shoes', 'Formal Shoes', ['Oxford', 'Derby', 'Loafer', 'Monk Strap', 'Heels', 'Pumps']),
      s('casual-shoes', 'Casual Shoes', ['Sandals', 'Slides', 'Flats', 'Ballet Flats', 'Espadrilles', 'Mules', 'Slippers'])
    ] },
    { key: 'bags', en: 'Bags', zh: '包', subs: [
      s('tote-bag', 'Tote Bag'), s('shoulder-bag', 'Shoulder Bag'), s('crossbody-bag', 'Crossbody Bag'),
      s('handbag', 'Handbag'), s('backpack', 'Backpack'), s('clutch', 'Clutch'), s('bucket-bag', 'Bucket Bag'),
      s('messenger-bag', 'Messenger Bag'), s('waist-bag', 'Waist Bag'), s('duffel-bag', 'Duffel Bag'),
      s('briefcase', 'Briefcase'), s('wallet', 'Wallet / Card Holder')
    ] },
    { key: 'accessories', en: 'Accessories', zh: '配件', subs: [
      s('cap', 'Cap'), s('beanie', 'Beanie'), s('bucket-hat', 'Bucket Hat'), s('fedora', 'Fedora'), s('visor', 'Visor'),
      s('scarf', 'Scarf'), s('tie', 'Tie', ['Tie', 'Bow Tie']), s('belt', 'Belt', ['Belt', 'Chain Belt']),
      s('sunglasses', 'Sunglasses'), s('optical-frames', 'Optical Frames'), s('gloves', 'Gloves'),
      s('socks', 'Socks'), s('tights', 'Tights'), s('umbrella', 'Umbrella'), s('keychain', 'Keychain')
    ] },
    { key: 'jewelry', en: 'Jewelry', zh: '飾品', subs: [
      s('necklace', 'Necklace', ['Necklace', 'Pendant', 'Chain']), s('bracelet', 'Bracelet', ['Bracelet', 'Bangle']),
      s('ring', 'Ring'), s('earrings', 'Earrings', ['Earrings', 'Ear Cuff']), s('brooch', 'Brooch'),
      s('anklet', 'Anklet'), s('body-jewelry', 'Body Jewelry')
    ] },
    { key: 'watches', en: 'Watches', zh: '手錶', subs: [
      s('watch', 'Watch', ['Dress', 'Sports', 'Dive', 'Chronograph', 'Smartwatch', 'Fashion'])
    ] }
  ];

  var BY_CAT = {}, BY_SUB = {};
  CATEGORIES.forEach(function (c) {
    BY_CAT[c.key] = c;
    c.subs.forEach(function (sub) { sub.category = c.key; BY_SUB[sub.key] = sub; });
  });

  var AUDIENCES = [
    { key: 'men', en: 'Men', zh: '男' },
    { key: 'women', en: 'Women', zh: '女' },
    { key: 'unisex', en: 'Unisex', zh: '中性' },
    { key: 'kids', en: 'Kids', zh: '童' }
  ];

  /* 系統屬性項目（§7.16 表）。values 為規格表「值（舉例）」，完整值域〔產品待確認〕；
     en 為本檔補的英文呈現。款式（style）的值依次分類各自定義（見 sub().styles），這裡 values 留空。
     multi：規格明定材質、季節可多選；其餘〔產品待確認〕本檔暫當單選。
     appliesTo：規格只舉例「腰線只在下身、領口只在上衣」，其餘〔產品待確認〕——本檔為呈現假設。 */
  function v(key, en, zh) { return { key: key, en: en, zh: zh }; }
  var ALL = ['*'];
  var ATTRS = [
    { key: 'department', en: 'Department', zh: '適用對象', multi: false, appliesTo: ALL, values: AUDIENCES },
    { key: 'style', en: 'Style', zh: '款式', multi: false, appliesTo: ALL, values: [] },
    { key: 'fit', en: 'Fit', zh: '版型', multi: false, appliesTo: ['tops', 'outerwear', 'bottoms', 'dresses', 'suits', 'activewear'], values: [
      v('slim', 'Slim', '合身'), v('regular', 'Regular', '標準'), v('relaxed', 'Relaxed', '寬鬆'), v('oversized', 'Oversized', 'Oversized')] },
    { key: 'length', en: 'Length', zh: '長度', multi: false, appliesTo: ['tops', 'outerwear', 'bottoms', 'dresses'], values: [
      v('cropped', 'Cropped', 'Cropped'), v('regular', 'Regular', '標準'), v('longline', 'Longline', '長版'),
      v('mini', 'Mini', 'Mini'), v('midi', 'Midi', 'Midi'), v('maxi', 'Maxi', 'Maxi')] },
    { key: 'sleeve', en: 'Sleeve', zh: '袖長', multi: false, appliesTo: ['tops', 'outerwear', 'dresses', 'activewear'], values: [
      v('sleeveless', 'Sleeveless', '無袖'), v('short', 'Short', '短袖'), v('three-quarter', 'Three-quarter', '七分袖'), v('long', 'Long', '長袖')] },
    { key: 'neckline', en: 'Neckline', zh: '領口', multi: false, appliesTo: ['tops', 'dresses'], values: [
      v('round', 'Crew neck', '圓領'), v('v', 'V-neck', 'V 領'), v('high', 'High neck', '高領')] },
    { key: 'closure', en: 'Closure', zh: '開合方式', multi: false, appliesTo: ['tops', 'outerwear'], values: [
      v('pullover', 'Pullover', '套頭'), v('zip', 'Zip', '拉鍊'), v('button', 'Button', '鈕扣')] },
    { key: 'waist', en: 'Waist', zh: '腰線', multi: false, appliesTo: ['bottoms'], values: [
      v('low', 'Low rise', '低腰'), v('mid', 'Mid rise', '中腰'), v('high', 'High rise', '高腰')] },
    { key: 'material', en: 'Material', zh: '材質', multi: true, appliesTo: ALL, values: [
      v('cotton', 'Cotton', '棉'), v('wool', 'Wool', '羊毛'), v('denim', 'Denim', '丹寧'), v('leather', 'Leather', '皮革')] },
    { key: 'pattern', en: 'Pattern', zh: '圖案', multi: false, appliesTo: ALL, values: [
      v('plain', 'Plain', '素色'), v('logo', 'Logo', 'Logo'), v('stripe', 'Stripe', '條紋')] },
    { key: 'season', en: 'Season', zh: '季節', multi: true, appliesTo: ALL, values: [
      v('spring', 'Spring', '春'), v('summer', 'Summer', '夏'), v('autumn', 'Autumn', '秋'), v('winter', 'Winter', '冬'), v('all-season', 'All season', '四季')] }
  ];

  /* 尺寸與顏色快捷預設（§7.16，修訂 D249）。全部〔產品待確認〕；色號為本檔呈現假設
     （規格只說「每個標準顏色有固定色號」，未給值）。 */
  var SIZES = { standard: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'], preset: ['XS', 'S', 'M', 'L', 'XL'] };
  var COLOURS = {
    standard: [
      { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Grey', hex: '#9E9E9E' },
      { name: 'Navy', hex: '#1F2A44' }, { name: 'Beige', hex: '#D9C7A3' }, { name: 'Brown', hex: '#6B4A2F' },
      { name: 'Red', hex: '#C62828' }, { name: 'Pink', hex: '#F4A6B8' }, { name: 'Green', hex: '#2E7D32' },
      { name: 'Blue', hex: '#1E64C8' }, { name: 'Yellow', hex: '#F2C94C' }
    ],
    preset: ['Black', 'White']
  };

  function norm(x) { return String(x == null ? '' : x).replace(/\s+/g, '').toUpperCase(); }

  window.ztorApparel = {
    GROUP: GROUP,
    categories: function () { return CATEGORIES; },
    category: function (key) { return BY_CAT[key] || null; },
    sub: function (key) { return BY_SUB[key] || null; },
    categoryOfSub: function (key) { return BY_SUB[key] ? BY_SUB[key].category : ''; },
    label: function (key, lang) {
      var o = BY_CAT[key] || BY_SUB[key];
      if (!o) return String(key || '');
      return lang === 'zh' ? o.zh : o.en;
    },
    audiences: AUDIENCES,
    attrs: ATTRS,
    attrsFor: function (categoryKey) {
      return ATTRS.filter(function (a) { return a.appliesTo[0] === '*' || a.appliesTo.indexOf(categoryKey) >= 0; });
    },
    sizes: SIZES,
    colours: COLOURS,
    OTHER_SIZE: 'other',
    isStandardSize: function (val) {
      var n = norm(val);
      return SIZES.standard.some(function (x) { return norm(x) === n; });
    }
  };
})();
