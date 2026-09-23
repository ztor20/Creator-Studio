// js/products-store.js — 電子商店單售商品的示範資料源（spec 5.1.5.1 商品細節頁）。
//
// 目的：商品細節頁（product-detail.html）改為「資料驅動」——由 e-shop 清單以 ?id=<key>
// 開啟，本 store 提供該商品「該有的組合」讓細節頁 realize 對應版面，取代舊的 devtools
// 預覽切換（pd-cat/pd-var/pd-edition）。全前端 mock、無後端；逐品的變體列/曲目/卡面內容
// 為代表性樣本（UIA-055），重點是把「主分類×次分類×規格模式×庫存版本」的版面組合做出來。
// 2026-09-11 第 2 步：兩個 persona 各自涵蓋詳情頁的全部類型與狀態（單售 20／16＋8 筆、組合 8／8 筆），
// 對照表見 docs/示範資料索引.md；組合展示資料改由 ztorGetBundle(id) 推導（見該函式註解）。
//
// 每筆欄位：
//   cat        主分類 physical | digital（E&E 由活動模組管理、不在此頁）
//   subKey     次分類（對應 §2.6 次分類 select 的值；只影響顯示）
//   content    數位內容檔形態 video|song|album|membership|document|ip（僅數位；決定 §2.7 表單）
//   variant    規格模式 single | multiple（僅實體；§2.8）
//   edition    庫存版本 unlimited | limited
//   status     live | low | soldout（狀態 badge 與庫存呈現）
//   price/cost 現金字串；stock 目前庫存；cap 限量上限（limited 才有）；sold 已售（limited 才有）
//   variants[].cap / sold  （2026-09-21，spec §7.2「多選項商品的版本型態為逐選項組合」）限量的多選項商品每個組合各自的
//              上限與已售；商品層的 cap／sold／stock 為各組合加總（清單庫存欄與頁首 KPI 讀商品層，呈現假設見 ASSUMPTIONS UIA-156）。
//              不限量商品沒有這兩欄。細節頁編輯上限時守 5.1.5.1 §2.10「只能 ≥ 已售」。
//   albumSeed  數位·專輯的預置曲目（餵給 album-tracks 的 data-album-seed）
//   vipName    數位·會員卡的預置卡面名稱
//   img        e-shop 列表縮圖檔名（在 images/products/ 下）；供 persona 就地改列用
//   variants[].img   （選填，2026-09-11 D268）這個選項組合自己的商品圖檔名（images/products/ 下）；
//              沒給＝沿用商品主圖 img。呈現用 ProductsStore.variantThumb（實線＝自己的圖、虛線＝沿用）
//
// ── 詳情頁的示範狀態欄位（2026-09-11，由頁面層寫死改成資料驅動；缺值＝頁面顯示既有空狀態）──
//   sales      { units, gross, net } | null   銷售摘要 KPI；null＝尚無銷售（切到 .when-empty）。gross／net 為顯示字串（'$2,944'）
//   discount   { price, limited: { start, end } | null, stack: bool } | null   單售折扣；null＝關。
//              price 填折扣價、limited 有值＝限時折扣開＋起訖（YYYY-MM-DD）、stack＝可與優惠碼疊加
//   limit      number | null   每人限購數；有值＝開關開＋數量填入
//   films      string[]        電影關聯（js/films-store.js 的 id）；空＝picker 沒有已選 chip
//   projects   [{ title | titleKey, href }]   被哪些項目引用；titleKey 走 i18n（persona 覆寫字典可換名）；空＝「尚未被任何項目引用」
//   tags       string[]        商品標籤的初始 chip
//   history    [{ id, type:'restock'|'lock', mode:'now'|'scheduled', supplier | supplierKey, eta, note,
//                 state:'done'|'restocking', date, items:[{ combo, vi, delta, qty, to | toKey }] }]
//              庫存歷史紀錄；state 'restocking' 的單同時是「補貨中」卡的內容（沒有就整卡收起）。
//              vi＝多選項的 variants 索引、單一規格填 'single'；supplierKey／toKey 走 i18n（切語言會重譯）
//   draft      bool            草稿：頁首徽章顯示「草稿」（ListingState 讀 entity.draft）
//   archived   bool            已封存（2026-09-18 · D284）：只在 LISTING_SEED 設；seedListing() 會一併關掉總閘門與排程。組合同名欄位在 BUNDLE_SEED
//   unlistReason { type:'member-unlisted', productId, productName, auto? } | null   組合包「因成員下架而一同下架」的原因（僅組合；D288；auto＝定時下架到期自動連動；重新上架時清掉）
//   ── 工作階段覆蓋（2026-09-18 · D288 落地）：下架／封存／重新上架／連動的結果寫進 sessionStorage 'ztor.listing.session'，
//      同一個分頁裡換頁仍看得到（在商品細節頁下架 patch → 回到 e-shop、開 bundle-detail 都是下架後的樣子）；關掉分頁即回到 seed。
//      寫入口 ProductsStore.commit(entity)，只存上架軸欄位（listed／listAt／unlistAt／archived／unlistReason；
//      D290 起再加 saleStart／saleEnd／onSale——下架會把四個時間清空、開賣退回未開賣，這三個也要跨頁看得到）；
//      cheat code 的 Reset 會呼叫 forgetSession() 清掉。 ──
//   onSale     bool（缺值＝true）   開賣設定（D290）：false＝未開賣（上架、顯示照舊、尚未開放結帳）。seed 不設（沿用上架即開賣）；
//              下架（含連動、定時到期）後由 ListingState.unlist 寫成 false，重新上架維持 false，細節頁的開賣二選一因此多一項「未開賣」
//   deleted    bool            已刪除（2026-09-22 · D307，§7.14「封存與刪除」）：零成交且已下架或已封存的販售管道（單售／組合包／拍賣）
//              可刪；ProductsStore.remove(entity) 標上、自 store 拿掉、記進工作階段（sessionStorage 同一把 key 的 `__deleted` 清單），
//              重新整理後 purgeDeleted() 再拿掉一次、e-shop 對應列由 pruneDeletedRows() 移除；cheat code Reset（forgetSession）一併還原
//   delivery   'ship'（預設，可省略）| 'qr'   交付方式；'qr'＝現場 QR 領取（取貨場次欄位）
//   currency   'TWD'（nick 商品）| 省略＝USD   價格幣別（priceText／product-detail 的 money() 讀它）
//   variants[i].locks  { single: n|null, bundles: { <bundleId>: n|null } }   逐選項組合鎖定（D255／D258）；
//              有它時商品層 pool.locks 由 seedListing() 加總得出（見該函式）
//   組合（BUNDLE_SEED）另有（2026-09-11 使用者裁示的價格模型，見 BUNDLE_SEED 上方註解）：
//              discountPct number|null（常態折扣 %；售價＝成員合計 ×(1−%)）、discount { percent, limited, stack } | null（限時折扣）、
//              description、membersKey（e-shop 列的成員說明 i18n key，選填）；films／projects／sales／draft 同上、
//              history 為鎖定歷史 [{ id, date, items:[{ productId | combo, delta }] }]（productId 由頁面換成成員名）
//   草稿成員進組合的可售量規則：草稿商品視同可售 0（listing-state.js 的 bundleQty 實作），所以含草稿成員的組合＝售罄
//
// ── Persona（2026-07-24）──────────────────────────────────────────
// cheat code「User」切換改 localStorage 'ztor.persona'：default＝原批（九龍夜行 巡迴
// 世界觀）、nick＝周湯豪 NICKTHEREAL、userB＝佔位沿用 default。nick 的商品用自己的 id
// （wy-*／nick-*），舊的 9 個共用 id 只留作別名（見 P_NICK 組裝處），舊連結仍能開。
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
      catLabel: 'Physical Merchandise', subLabel: 'Books · 書籍',
      /* 詳細規格／取貨與退貨說明（2026-09-23 · D319 補；ASSUMPTIONS UIA-175「示範資料沒有這兩欄」的落地）：
         形狀對齊 create-product.html collectSpecFields() 逐列 { name, value }，供 product-detail 設定分頁
         與 product-localization 翻譯表共用同一個欄位。 */
      specs: [
        { name: '材質', value: '凸版印刷封面 · 232 磅美術紙內頁' },
        { name: '尺寸', value: '21 × 15 cm' },
        { name: '頁數', value: '32 頁' }
      ],
      deliveryReturns: '訂購後 3–5 個工作日內出貨。到貨 7 天內如有瑕疵可申請換貨，恕不接受已拆封退換。'
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
        /* 2026-09-11（D268）：部分組合各自一張圖（img）、其餘沿用主圖，讓表上同時看得到實線／虛線兩種列 */
        { combo: ['S'],  sku: 'TEE-S',  stock: '2',  img: 'tee-black.webp' },
        { combo: ['M'],  sku: 'TEE-M',  stock: '18', img: 'tee-black.webp' },
        { combo: ['L'],  sku: 'TEE-L',  stock: '15' },
        { combo: ['XL'], sku: 'TEE-XL', stock: '7' }
      ],
      /* 詳細規格／取貨與退貨說明（2026-09-23 · D319 補），同 zine 的形狀與理由。 */
      specs: [
        { name: '材質', value: '220 克精梳純棉' },
        { name: '版型', value: 'Regular fit · 台灣尺碼對照 S–XL' },
        { name: '印刷', value: '海岸線圖騰網版印刷，胸口燙印 LOGO' }
      ],
      deliveryReturns: '訂購後 3–5 個工作日內出貨；到貨 7 天內可換尺寸，商品需保持未拆吊牌、未洗滌。'
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
        /* 2026-09-11（D268）：Sand 三個組合各自一張圖、Black 沿用主圖 */
        { combo: ['Sand', 'S'],  sku: 'HOOD-SD-S', stock: '0',  img: 'zip-hoodie.webp' },
        { combo: ['Sand', 'M'],  sku: 'HOOD-SD-M', stock: '5',  img: 'zip-hoodie.webp' },
        /* 2026-09-11：L 尺寸貴 $6，讓含 hoodie 的組合在清單上顯示價格區間（多選項多價格 → 區間） */
        { combo: ['Sand', 'L'],  sku: 'HOOD-SD-L', stock: '20', price: '64.00', img: 'zip-hoodie.webp' }
      ],
      /* 詳細規格／取貨與退貨說明（2026-09-23 · D319 補），同 zine 的形狀與理由。 */
      specs: [
        { name: '材質', value: '380 克刷毛內裡棉混紡' },
        { name: '版型', value: 'Oversized fit · 附抽繩連帽' },
        { name: '工藝', value: '浪紋刺繡背面標誌' }
      ],
      deliveryReturns: '訂購後 5–7 個工作日內出貨；到貨 7 天內可換尺寸，商品需保持未拆吊牌、未洗滌、無使用痕跡。'
    },
    acetate: {
      name: '九龍夜行 原聲黑膠 · 編號 1/50', img: 'coastline-acetate.webp',
      sub: 'Hand-numbered acetate LP — limited run of 50, signed. Collect on-site at the signing session.',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '120.00', cost: '38.00', stock: '29', cap: '50', sold: '21', threshold: '5',
      delivery: 'qr',   /* 現場 QR 領取示範：簽名場次現場領取的限量收藏品（唯一一筆 QR 領取商品）*/
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品',
      /* 詳細規格／取貨與退貨說明（2026-09-23 · D319 補），同 zine 的形狀與理由；取貨與退貨說明改寫成
         配合現場 QR 領取＋限量手燒版一次性不可退換的脈絡，不是照抄物流版的既定文案。 */
      specs: [
        { name: '材質', value: '180 克黑膠唱片' },
        { name: '轉速', value: '33⅓ RPM · 12 吋' },
        { name: '版次', value: '手工編號限量 50 張，附親簽卡' }
      ],
      deliveryReturns: '現場簽名會 QR 領取；每片獨立編號、限量手燒版，一經領取恕不接受退換。'
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
        { combo: ['US 8'],  sku: 'CL-SHO-08', stock: '15', img: 'nick-nike-02.jpg' },
        { combo: ['US 9'],  sku: 'CL-SHO-09', stock: '23' },
        { combo: ['US 10'], sku: 'CL-SHO-10', stock: '21' },
        { combo: ['US 11'], sku: 'CL-SHO-11', stock: '13' }
      ]
    },

    /* ── 2026-09-11 示範資料補齊（第 2 步）：讓詳情頁的每一種類型與狀態在預設 persona 都有一筆能點進去看。
       上架／鎖定示範值在 LISTING_SEED、詳情頁示範欄位在 DETAIL_SEED，這裡只放商品本體。
       對照表見 docs/示範資料索引.md（由 B 維護）。 ── */
    /* 數位 · 文件（PDF）：有銷售、有標籤、關聯 1 部電影、未被項目引用 */
    'doc-guide': {
      name: '九龍夜行 拍攝手記（PDF）', img: 'notebook.webp',
      sub: '64-page shooting diary — production notes, storyboards and location scouting. PDF download.',
      cat: 'digital', subKey: 'document', content: 'document', variant: 'single', edition: 'unlimited',
      status: 'live', price: '6.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Document · 文件'
    },
    /* 數位 · IP 素材包：尚無銷售（KPI 空狀態）、被 1 個項目引用 */
    'ip-kit': {
      name: '九龍夜行 視覺素材包', img: 'coastline-starter-pack.webp',
      sub: 'Key-art, wave mark and typeface licence pack for fan creations. Personal use only.',
      cat: 'digital', subKey: 'ip', content: 'ip', variant: 'single', edition: 'unlimited',
      status: 'live', price: '45.00', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'IP assets · IP 素材'
    },
    /* 實體 · 海報（限量 1/100、剩 3 ＝ 低庫存）：定時下架排定、限時折扣＋可疊加、每人限購 2 */
    poster: {
      name: '海上霸姬 簽名海報 1/100', img: 'signed-tour-poster.webp',
      sub: 'Hand-signed A2 tour poster — numbered edition of 100. Ships rolled in a tube.',
      cat: 'physical', subKey: 'poster', variant: 'single', edition: 'limited',
      status: 'low', price: '40.00', cost: '12.00', stock: '3', cap: '100', sold: '97', threshold: '5',
      catLabel: 'Physical Merchandise', subLabel: 'Posters & prints · 海報'
    },
    /* 實體 · 外套（限量 30、兩維選項）：逐選項組合鎖定示範——Black/M 鎖給單售 2＋簽名會組 1、Olive/L 鎖給單售 1，
       其餘組合沒鎖定。商品層 pool.locks 由 seedListing() 從 variants 加總（見該函式註解）。
       2026-09-21 逐選項組合上限（spec §7.2／5.1.5.2 F3.3 路線 B）：每個組合各自 cap／sold——Black/S 已售完（5/5、在庫 0）、
       Olive/S 接近上限（4 只剩 1）、其餘還有量；商品層 cap 30＝各組合加總、sold 11、stock 19 同為加總。 */
    jacket: {
      name: '九龍夜行 舞台外套 復刻版', img: 'stage-worn-jacket.webp',
      sub: 'Replica of the stage-worn bomber — embroidered back panel. Limited run of 30.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'limited',
      status: 'live', price: '150.00', cost: '60.00', stock: '19', cap: '30', sold: '11', threshold: '2',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [
        { name: 'Colour / 顏色', values: ['Black', 'Olive'] },
        { name: 'Size / 尺寸', values: ['S', 'M', 'L'] }
      ],
      variants: [
        { combo: ['Black', 'S'], sku: 'JKT-BK-S', stock: '0', cap: '5', sold: '5' },
        { combo: ['Black', 'M'], sku: 'JKT-BK-M', stock: '6', cap: '8', sold: '2', locks: { single: 2 } },
        { combo: ['Black', 'L'], sku: 'JKT-BK-L', stock: '4', cap: '5', sold: '1' },
        { combo: ['Olive', 'S'], sku: 'JKT-OL-S', stock: '1', cap: '4', sold: '3' },
        { combo: ['Olive', 'M'], sku: 'JKT-OL-M', stock: '4', cap: '4', sold: '0' },
        { combo: ['Olive', 'L'], sku: 'JKT-OL-L', stock: '4', cap: '4', sold: '0', price: '150.00', locks: { single: 1 } }
      ]
    },
    /* 實體 · 托特包：隱藏＋待命（隱藏、持非公開連結、開賣日在未來）；尚無銷售 */
    tote: {
      name: '九龍夜行 帆布托特包', img: 'tote-bag.webp',
      sub: '12 oz canvas tote, screen-printed wave mark. One size.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '18.00', cost: '6.00', stock: '40', threshold: '5',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    /* 實體 · 鑰匙圈：排定上架、時間還沒到；尚無銷售 */
    keychain: {
      name: '霓虹招牌 壓克力鑰匙圈', img: 'keychain.webp',
      sub: 'Double-sided acrylic charm of the neon sign. 6 cm.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '8.00', cost: '2.00', stock: '120', threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    /* 實體 · 毛帽（三色）：多選項全部售罄；有一筆已完成補貨的歷史、被 1 個項目引用 */
    beanie: {
      name: '九龍夜行 毛帽', img: 'beanie.webp',
      sub: 'Ribbed acrylic beanie with woven label. Three colours.',
      cat: 'physical', subKey: 'apparel', variant: 'multiple', edition: 'unlimited',
      status: 'soldout', price: '22.00', cost: '7.00', stock: '0', threshold: '6',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾',
      options: [{ name: 'Colour / 顏色', values: ['Black', 'Grey', 'Red'] }],
      variants: [
        { combo: ['Black'], sku: 'BEAN-BK', stock: '0' },
        { combo: ['Grey'],  sku: 'BEAN-GY', stock: '0' },
        { combo: ['Red'],   sku: 'BEAN-RD', stock: '0' }
      ]
    },
    /* 實體 · 簽名會手環（三尺寸）：現場 QR 領取；每個尺寸都鎖 5 件給簽名會限定組（逐選項組合鎖定） */
    wristband: {
      name: '九龍夜行 簽名會手環', img: 'wristband.webp',
      sub: 'Woven fabric wristband — collect at the signing session. Three sizes.',
      cat: 'physical', subKey: 'collectible', variant: 'multiple', edition: 'unlimited',
      status: 'live', price: '10.00', cost: '2.50', stock: '60', threshold: '5',
      delivery: 'qr',
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品',
      options: [{ name: 'Size / 尺寸', values: ['S', 'M', 'L'] }],
      variants: [
        { combo: ['S'], sku: 'WB-S', stock: '20' },
        { combo: ['M'], sku: 'WB-M', stock: '20' },
        { combo: ['L'], sku: 'WB-L', stock: '20' }
      ]
    },
    /* 實體 · 貼紙包：草稿（只有名稱與圖，其餘欄位空；listed:false 在 LISTING_SEED） */
    sticker: {
      name: '九龍夜行 貼紙包', img: 'sticker-sheet.webp',
      sub: '',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '', cost: '', stock: '0', threshold: '0',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品',
      draft: true
    },

    /* ── 2026-09-18 封存示範（D284，§7.14「封存與不可刪除」）：三筆新商品各示範一種封存相關狀態，
       不動既有商品——它們各自背著別的狀態示範，改了會連動組合可售量。上架值在 LISTING_SEED、
       詳情示範在 DETAIL_SEED。 ── */
    /* 實體 · 明信片組：已封存，且有訂單歷史（銷售摘要有數字）——示範「封存不影響訂單與收入」。
       同時是 postcard-set 的成員：那個組合包因它封存而被一同下架（見 BUNDLE_SEED.postcard-set）。 */
    /* 2026-09-21 改成限量 150（已售 64、在庫 58）：站上原本沒有「已封存＋限量」的商品，封存唯讀要涵蓋上限欄得有一筆看得到。 */
    postcard: {
      name: '九龍夜行 明信片組', img: 'postcard-set.webp',
      sub: 'Set of 6 postcards — stills from the tour film. 300gsm. Limited run of 150.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'limited',
      status: 'live', price: '12.00', cost: '3.00', stock: '58', cap: '150', sold: '64', threshold: '5',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    /* 實體 · 馬克杯：已封存、尚無銷售（KPI 空狀態）；仍是已封存組合包 launch-set 的成員——D307（2026-09-22）零成交可刪除的「擋下」示範：
       按刪除會列出 launch-set、要求先到組合包把它移除（不論該組合包上架／下架／封存都擋） */
    mug: {
      name: '九龍夜行 Logo 馬克杯', img: 'logo-mug.webp',
      sub: '11 oz ceramic mug with the wave mark. Dishwasher safe.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '14.00', cost: '4.00', stock: '25', threshold: '5',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    /* 實體 · 刺繡布章：上架中、同時是上架中組合包 roadie-set 的成員——示範下架時的連動彈窗
       （列出組合包名稱、主鈕「一同下架這些組合包」，D288；D284 時這個示範掛在封存、且 patch 是已下架）。 */
    patch: {
      name: '九龍夜行 刺繡布章', img: 'patch-set.webp',
      sub: 'Iron-on embroidered patch, 7 cm. Wave mark on black twill.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '9.00', cost: '2.50', stock: '80', threshold: '8',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    },
    /* 實體 · 杯墊組（2026-09-18 · D288）：定時下架已到期（LISTING_SEED.coaster.unlistAt 在過去）——示範「定時下架到期的自動下架
       同樣連動組合包」：它是上架中組合包 backstage-set 的成員，載入時 ListingState.scheduledUnlistCascade() 把那個組合包一併下架、
       記 unlistReason（auto），通知中心（sidebar.js NOTIF_INFO）有一則對應的示範通知。 */
    coaster: {
      name: '九龍夜行 杯墊組', img: 'coaster-pack.webp',
      sub: 'Set of 4 cork coasters, wave mark debossed.',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '11.00', cost: '3.00', stock: '40', threshold: '5',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品'
    }
  };

  /* ── nick：周湯豪 NICKTHEREAL ───────────────────────────────────────────
     2026-09-11 整理：原本這裡手寫了與預設 persona 同名的 11 個 id（zine／tee／hoodie／acetate／cap／
     shoes／pin／song／movie／album／membership），但下方 P_NICK = Object.assign(...) 把它們整批覆寫成
     wy-* 商品，等於死碼。現在：
       - 五筆數位／限量記錄找回來、改成獨立 id（nick-single／nick-r2／nick-album／nick-member／nick-vinyl），
         由 NICK_EXTRA 承載並納入 e-shop 清單；
       - zine／tee／hoodie／cap／shoes／pin 的手寫版與 wy-* 商品重複，直接刪除（不再保留副本）；
       - 舊 id 別名保留給舊連結相容：song／movie／album／membership／acetate 指向上面五筆，
         zine／tee／hoodie／cap／shoes／pin 仍指向 wy-* 商品（見下方 P_NICK 的組裝）。
     圖沿用現有 images/products/ 檔（非本人素材），金額為 TWD 示意值。 */
  var NICK_EXTRA = {
    'nick-single': {
      name: '帥到分手 · 單曲', img: 'nick-single.jpg', currency: 'TWD',
      sub: 'LOVE RAGE HOPE 首波主打，購買後立即下載。',
      cat: 'digital', subKey: 'song', content: 'song', variant: 'single', edition: 'unlimited',
      status: 'live', price: '45', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Song · 音樂單曲'
    },
    'nick-r2': {
      name: 'REALIVE (R2) 演唱會影像 數位版', img: 'nick-r2.jpg', currency: 'TWD',
      sub: '小巨蛋 R2 特仕版演唱會影像，串流／下載。',
      cat: 'digital', subKey: 'movie', content: 'video', variant: 'single', edition: 'unlimited',
      status: 'live', price: '380', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Movie · 電影'
    },
    'nick-album': {
      name: 'LOVE RAGE HOPE — 數位專輯', img: 'nick-album.jpg', currency: 'TWD',
      sub: '第五張錄音室專輯，十軌完整下載附歌詞。',
      cat: 'digital', subKey: 'album', content: 'album', variant: 'single', edition: 'unlimited',
      status: 'live', price: '450', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Album · 音樂專輯',
      albumSeed: [
        { name: '未完成的夢', meta: 'weiwan-de-meng.mp3 · 3.4 MB · 2025', lyrics: true },
        { name: 'FLAMES', meta: 'flames.mp3 · 8.2 MB', lyrics: true },
        { name: '帥到分手', meta: 'shuai-dao-fen-shou.mp3 · 7.6 MB', lyrics: true },
        { name: 'SO SICK', meta: 'so-sick.mp3 · 6.8 MB', lyrics: false },
        { name: 'TIL THE END', meta: 'til-the-end.mp3 · 4.4 MB', lyrics: true }
      ]
    },
    'nick-member': {
      name: 'NICKTHEREAL 官方後援會', img: 'nick-member.jpg', currency: 'TWD',
      sub: '定期訂閱會員卡：搶先聽、優先購票、專屬社群。',
      cat: 'digital', subKey: 'membership', content: 'membership', variant: 'single', edition: 'unlimited',
      status: 'live', price: '300', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Membership / VIP card · 會員卡',
      vipName: 'NICKTHEREAL Club'
    },
    /* 黑膠單品（2026-07-25 使用者指定）：限量編號版、現場 QR 領取，同時是「簽名會限定組」與「黑膠典藏組」的成員。
       隱藏＋非公開連結＋三個管道都鎖定（單售 40、簽名會組 10、典藏組 12）→ 詳情頁會提醒「250 件未鎖定」。
       ⚠ 圖沿用既有 coastline-acetate.webp（黑膠實拍），非周湯豪本人素材，之後可替換。 */
    'nick-vinyl': {
      name: 'LOVE RAGE HOPE 限量黑膠 1/500', img: 'coastline-acetate.webp', currency: 'TWD',
      sub: '第五張專輯 180g 雙碟裝黑膠，透明橘膠、內含歌詞海報。全球限量 500 張，附獨立編號。',
      cat: 'physical', subKey: 'collectible', variant: 'single', edition: 'limited',
      status: 'live', price: '2480', cost: '900', stock: '312', cap: '500', sold: '188', threshold: '25',
      delivery: 'qr',
      catLabel: 'Physical Merchandise', subLabel: 'Collectibles · 收藏品'
    },
    /* 對照預設 persona 的 doc-guide／ip-kit／sticker（2026-09-11 新增） */
    'nick-doc': {
      name: 'REALIVE 巡演手冊（PDF）', img: 'notebook.webp', currency: 'TWD',
      sub: '巡演場次、舞台設計圖與幕後筆記，PDF 下載。',
      cat: 'digital', subKey: 'document', content: 'document', variant: 'single', edition: 'unlimited',
      status: 'live', price: '180', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'Document · 文件'
    },
    'nick-ip': {
      name: '祝你好命 視覺素材包', img: 'nick-tee.jpg', currency: 'TWD',
      sub: '品牌主視覺、Logo 與字型授權包，限個人創作使用。',
      cat: 'digital', subKey: 'ip', content: 'ip', variant: 'single', edition: 'unlimited',
      status: 'live', price: '1200', cost: '', stock: '∞',
      catLabel: 'Digital Merchandise', subLabel: 'IP assets · IP 素材'
    },
    'wy-draft-tote': {
      name: '祝你好命 托特包', img: 'tote-bag.webp', currency: 'TWD',
      sub: '',
      cat: 'physical', subKey: 'merch', variant: 'single', edition: 'unlimited',
      status: 'live', price: '', cost: '', stock: '0', threshold: '0',
      catLabel: 'Physical Merchandise', subLabel: 'Merch · 商品',
      draft: true
    }
  };

  /* 2026-07-27：Nick 商店的示範商品資料（wy-* id）。原有 id 保留作為舊連結相容。
     2026-09-11 使用者裁示：示範資料只是參考素材，站上不得指向任何外部來源——來源網址欄位與
     「查看原商品頁」連結整個抹除。 */
  function wishProduct(name, img, price, sub, options, stock, gallery) {
    return {
      name: name, img: img, gallery: gallery || [img],
      currency: 'TWD',
      sub: sub, cat: 'physical', subKey: 'apparel', variant: options && options.length ? 'multiple' : 'single',
      edition: 'unlimited', status: wishStatus(stock, 10), price: String(price), cost: '', stock: String(stock), threshold: '10',
      catLabel: 'Physical Merchandise', subLabel: 'Apparel · 服飾', options: options || []
    };
  }
  /* 2026-09-11 修死碼：原本寫成 `stock === 0 ? 'live' : 'live'`，兩個分支一樣，13 件 stock 0 的商品在
     e-shop 退路徽章上仍是「販售中」、與詳情頁的 ListingState 推導（售罄）矛盾。現在與 ListingState 同判準：
     0＝售罄、≤ 門檻＝低庫存、其餘販售中。e-shop 有 ztorEshopStatus 時徽章仍由 ListingState 算，這欄只是退路。 */
  function wishStatus(stock, threshold) {
    var n = Number(stock) || 0, t = Number(threshold) || 0;
    return n === 0 ? 'soldout' : (t > 0 && n <= t ? 'low' : 'live');
  }
  /* 選項組合（variants）：wishProduct 只給「有哪些選項值」，這裡依笛卡兒積補出逐組合的列。
     沒有這份清單，商品分頁「銷售設定 → 當前庫存」的逐規格表會只剩表頭（renderPageTable
     是照 variants 畫列的）。庫存把 stock 平均分攤到各組合、餘數給前面幾列，總和＝目前在庫，
     與庫存池對得起來；SKU 由 id 與選項值推導。皆為 demo 樣本值，非後端資料。 */
  function wishSkuPart(v, i) {
    var s = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
    return s || ('V' + (i + 1));
  }
  function wishVariants(id, options, stock) {
    var combos = [[]];
    (options || []).forEach(function (o) {
      var vals = (o.values || []).filter(function (x) { return String(x).trim() !== ''; });
      if (!vals.length) return;
      var next = [];
      combos.forEach(function (c) { vals.forEach(function (val) { next.push(c.concat([val])); }); });
      combos = next;
    });
    if (!combos.length || !combos[0].length) return [];
    var total = Math.max(0, Number(stock) || 0);
    var base = Math.floor(total / combos.length), rest = total - base * combos.length;
    /* SKU 前綴：id 去掉 wy- 之後只留最後兩段（wy-bundle-cargo-pants → CARGO-PANTS），
       與 default 那批手寫的短碼（TEE-S／HOOD-BK-S）長度相當，窄欄裡才讀得完。 */
    var seg = String(id).replace(/^wy-/, '').split('-');
    var prefix = seg.slice(-2).join('-').toUpperCase();
    return combos.map(function (c, i) {
      return {
        combo: c.slice(),
        sku: [prefix].concat(c.map(wishSkuPart)).join('-'),
        stock: String(base + (i < rest ? 1 : 0))
      };
    });
  }
  var WISHYOU_PRODUCTS = {
    'wy-26ms-hoodie': wishProduct('26MS Hoodie', '26ms-hoodie-01.jpeg', 3680, '注意事項：不可水洗、緩和乾洗；50%棉50%滌綸。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 3, ['26ms-hoodie-01.jpeg', '26ms-hoodie-02.jpeg']),
    'wy-26ms-socks': wishProduct('26MS Socks', '26ms-socks-01.jpeg', 688, '材質：棉 82%、彈性纖維 13%、彈性纖維 5%。', [{ name: 'Size / 尺寸', values: ['F'] }], 425),
    'wy-26ms-tshirt-white': wishProduct('26MS T-Shirt (白)', '26ms-t-shirt-w-01.jpeg', 1880, '注意事項：不可水洗、緩和乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, ['26ms-t-shirt-w-01.jpeg', '26ms-t-shirt-w-02.jpeg']),
    'wy-26ms-tshirt-red': wishProduct('26MS T-Shirt (紅)', '26ms-t-shirt-r-01.jpeg', 1880, '注意事項：不可水洗、緩和乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, ['26ms-t-shirt-r-01.jpeg', '26ms-t-shirt-r-02.jpeg']),
    'wy-24ce-pillow': wishProduct('WYAGL Pillow', 'wyagl-pillow-01.jpg', 1580, '材質：聚酯纖維；尺寸：40cm ±5%；可機洗、不可漂白、不可熨燙。', [{ name: 'Size / 尺寸', values: ['F'] }], 0, ['wyagl-pillow-01.jpg', 'wyagl-pillow-02.jpg', 'wyagl-pillow-03.jpg']),
    'wy-24ce-jersey': wishProduct('24CE High Shine Football Jersey', '24ce-high-shine-football-jersey-01.jpg', 3680, '注意事項：冷水溫和洗滌、不可漂白；尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, ['24ce-high-shine-football-jersey-01.jpg', '24ce-high-shine-football-jersey-02.jpg', '24ce-high-shine-football-jersey-03.jpg', '24ce-high-shine-football-jersey-04.jpg']),
    'wy-24ce-skateboard': wishProduct('24CE Skateboard', '24ce-skateboard-01.jpg', 2880, '尺寸：8.0 吋；材質：加拿大楓木七層壓合。', [], 0, ['24ce-skateboard-01.jpg', '24ce-skateboard-02.jpg']),
    'wy-24ce-mesh': wishProduct('WYAGL Mesh T-shirt', 'wyagl-mesh-t-shirt-01.jpg', 3580, '注意事項：冷水溫和洗滌、不可漂白；尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, ['wyagl-mesh-t-shirt-01.jpg', 'wyagl-mesh-t-shirt-02.jpg', 'wyagl-mesh-t-shirt-03.jpg']),
    'wy-24ce-rug': wishProduct('WYAGL RUG', 'wyagl-rug-01.jpg', 5680, '直徑90公分（±2公分）；100%聚酯纖維。建議使用地毯專用清潔劑清潔。', [{ name: 'Size / 尺寸', values: ['F'] }], 0),
    'wy-24ce-sock': wishProduct('WYAGL Sock', 'wyagl-sock-01.jpg', 1280, '材質：棉 82%、彈性纖維 13%、彈性纖維 5%。', [{ name: 'Colour / 顏色', values: ['一黑一白一紅組合'] }], 0, ['wyagl-sock-01.jpg', 'wyagl-sock-02.jpg']),
    'wy-24ce-wyagl-tee': wishProduct('Wish You A Good Life T-SHIRT', 'wish-you-a-good-life-t-shirt-01.jpg', 1680, '低溫30°C洗滌、不可乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, ['wish-you-a-good-life-t-shirt-01.jpg', 'wish-you-a-good-life-t-shirt-02.jpg', 'wish-you-a-good-life-t-shirt-03.jpg']),
    'wy-24ce-tee': wishProduct('WYAGL T-SHIRT', 'wyagl-t-shirt-01.jpg', 1680, '低溫30°C洗滌、不可乾洗；100%純棉。尺寸為手工水平測量，實際產品尺寸誤差±2cm。', [{ name: 'Size / 尺寸', values: ['L', 'M', 'XL'] }], 0, ['wyagl-t-shirt-01.jpg', 'wyagl-t-shirt-02.jpg', 'wyagl-t-shirt-03.jpg']),
    'wy-24ce-dupont-bag': wishProduct('Dupont Bag', 'wyagl-dupont-bag-01.jpg', 1080, '尺寸 M/L/XL；銀色；杜邦紙材質，防水可水洗。尺寸皆為水平手工測量。', [{ name: 'Size / 尺寸', values: ['M', 'L', 'XL'] }], 0, ['wyagl-dupont-bag-01.jpg', 'wyagl-dupont-bag-02.jpg', 'wyagl-dupont-bag-03.jpg']),
    'wy-bundle-cap': wishProduct('祝你好命 刺繡 Logo 老帽', 'wyagl-cap-generated.webp', 1280, '以組合包紅白黑配色延伸的黑色六片老帽，紅色刺繡圓章細節。', [{ name: 'Colour / 顏色', values: ['Black'] }], 0, '', ['wyagl-cap-generated.webp']),
    'wy-bundle-cargo-pants': wishProduct('祝你好命 束口工裝褲', 'wyagl-cargo-pants-generated.webp', 1980, '以組合包配色延伸的黑色水洗束口工裝褲，側邊口袋與紅色車線細節。', [{ name: 'Size / 尺寸', values: ['S', 'M', 'L', 'XL'] }], 0, '', ['wyagl-cargo-pants-generated.webp']),
    'wy-bundle-lowtop-sneakers': wishProduct('祝你好命 紅白低筒球鞋', 'wyagl-lowtop-sneakers-generated.webp', 2340, '以組合包配色延伸的紅白黑低筒球鞋，鞋跟有螢光綠點綴。', [{ name: 'Size / 尺寸', values: ['US 8', 'US 9', 'US 10', 'US 11'] }], 0, '', ['wyagl-lowtop-sneakers-generated.webp'])
  };
  /* 2026-09-11 示範資料補齊：wy-* 商品原本 13/16 件 stock 0，狀態幾乎只剩「售罄」。這裡把幾件改值，
     讓 nick persona 也涵蓋預設 persona 的每一種狀態（對照 P_DEFAULT 新增的 9 筆；上架／鎖定示範在 LISTING_SEED）。
     在產 variants 之前改，stock 才會照新值分攤到各選項組合。 */
  (function () {
    var W = WISHYOU_PRODUCTS;
    /* 限量 200、已售 180、剩 20（對照 jacket）：Size M 逐選項組合鎖定在下面 variants 產好後再掛 */
    Object.assign(W['wy-24ce-jersey'], { edition: 'limited', cap: '200', sold: '180', stock: '20', threshold: '3' });
    /* 隱藏＋待命（對照 tote）：有貨但還沒開賣，持非公開連結也還買不到 */
    W['wy-24ce-mesh'].stock = '30';
    /* 定時下架排定＋限時折扣＋每人限購（對照 poster） */
    W['wy-24ce-dupont-bag'].stock = '12';
    /* 隱藏＋非公開連結（對照 acetate） */
    W['wy-26ms-tshirt-red'].stock = '18';
    /* 選物四件組的部分鎖示範（對照 zine）：每個尺寸鎖 2 件給組合，單售沒鎖 */
    W['wy-26ms-tshirt-white'].stock = '25';
    /* 現場 QR 領取＋逐選項組合鎖給簽名會組（對照 wristband） */
    Object.assign(W['wy-24ce-tee'], { stock: '40', delivery: 'qr' });
    /* ⚠ 計劃檔寫「其餘 wy 維持」，但選物四件組另外三個成員（老帽／工裝褲／球鞋）原本全是 stock 0，
       整組會直接落成「售罄」，與計劃要它示範的「限量 50＋部分鎖＋販售中」互相矛盾（售罄另有 nick-soldout-set）。
       故給這三件合理庫存；組合可售量因此由白 Tee 的鎖定量（3 尺寸 × 2 ＝ 6）決定，卡頭會寫「受 26MS T-Shirt (白) 限制」。 */
    W['wy-bundle-cap'].stock = '24';
    W['wy-bundle-cargo-pants'].stock = '32';
    W['wy-bundle-lowtop-sneakers'].stock = '20';
    Object.keys(W).forEach(function (id) { W[id].status = wishStatus(W[id].stock, W[id].threshold); });
  }());
  Object.keys(WISHYOU_PRODUCTS).forEach(function (id) {
    var p = WISHYOU_PRODUCTS[id];
    if (p.variants || !p.options || !p.options.length) return;
    p.variants = wishVariants(id, p.options, p.stock);
  });
  /* 逐組合價差示範（2026-09-11）：白 Tee 的 XL 多 NT$200，讓選物四件組在清單上是價格區間 */
  (function () {
    var v = WISHYOU_PRODUCTS['wy-26ms-tshirt-white'] && WISHYOU_PRODUCTS['wy-26ms-tshirt-white'].variants;
    if (v) v.forEach(function (x) { if (x.combo.indexOf('XL') !== -1) x.price = 2080; });
  })();
  /* 逐組合商品圖示範（2026-09-11 D268）：nick persona 也要看得到「自己的圖／沿用主圖」兩種列——
     圖沿用該商品 gallery 的第二張（站內既有檔），只給部分尺寸。 */
  (function () {
    function give(id, sizes, img) {
      var p = WISHYOU_PRODUCTS[id]; if (!p || !p.variants) return;
      p.variants.forEach(function (x) { if (sizes.indexOf(x.combo[0]) !== -1) x.img = img; });
    }
    give('wy-26ms-hoodie', ['M', 'L'], '26ms-hoodie-02.jpeg');
    give('wy-26ms-tshirt-white', ['M'], '26ms-t-shirt-w-02.jpeg');
    give('wy-24ce-jersey', ['M', 'XL'], '24ce-high-shine-football-jersey-02.jpg');
  })();
  /* 逐選項組合鎖定（D255／D258）：variants 產好之後才掛得上去。形狀同 P_DEFAULT.jacket 的寫法。 */
  (function () {
    function lockVariant(id, value, locks) {
      var p = WISHYOU_PRODUCTS[id];
      (p.variants || []).forEach(function (v) { if (value === '*' || v.combo[0] === value) v.locks = JSON.parse(JSON.stringify(locks)); });
    }
    /* 組合鎖定不再寫在商品身上（2026-09-11 鎖定套數規則）：由 BUNDLE_SEED 的 lockSets／alloc 在 get() 時導出 */
    lockVariant('wy-24ce-jersey', 'M', { single: 5 });
  }());
  /* 逐選項組合上限（2026-09-21，對照 P_DEFAULT.jacket）：限量 200 的球衣把 cap／sold 分到三個尺寸——
     M 70/63、L 70/63、XL 60/54（在庫 7／7／6 ＝ wishVariants 分攤 20 的結果；商品層 cap 200、sold 180 為加總）。 */
  (function () {
    var p = WISHYOU_PRODUCTS['wy-24ce-jersey'], caps = { M: ['70', '63'], L: ['70', '63'], XL: ['60', '54'] };
    (p && p.variants || []).forEach(function (v) { var c = caps[v.combo[0]]; if (c) { v.cap = c[0]; v.sold = c[1]; } });
  }());
  /* 既有入口保留，但內容與來源商品同步。 */
  /* 2026-07-27 使用者指定的列表排序：這四筆置頂（白 Tee → 老帽 → 束口褲 → 球鞋），
     2026-09-11 接著排找回的五筆數位／限量記錄與三筆新商品（含草稿 wy-draft-tote——它不另外產列，
     由 e-shop 既有的草稿列連過去，見 patchEshopList），其餘沿用 WISHYOU_PRODUCTS 的定義順序。
     只影響 e-shop 列表的產列順序，不動商品內容。 */
  var WISH_TOP_IDS = ['wy-26ms-tshirt-white', 'wy-bundle-cap', 'wy-bundle-cargo-pants', 'wy-bundle-lowtop-sneakers'];
  var WISH_NEW_IDS = ['nick-single', 'nick-r2', 'nick-album', 'nick-member', 'nick-vinyl', 'nick-doc', 'nick-ip', 'wy-draft-tote'];
  var WISH_IDS = WISH_TOP_IDS.concat(WISH_NEW_IDS).concat(Object.keys(WISHYOU_PRODUCTS).filter(function (id) {
    return WISH_TOP_IDS.indexOf(id) === -1;
  }));
  /* 組裝順序有意義：seedListing() 以第一次遇到的 key 當 p.id 並查 LISTING_SEED／DETAIL_SEED，
     所以正式 id（wy-*／nick-*）必須排在別名（zine／song…）前面。 */
  P_NICK = Object.assign({}, WISHYOU_PRODUCTS, NICK_EXTRA, {
    /* zine 改指球衣（2026-09-11）：原本與 hoodie 同指 26MS Hoodie，訂單明細換成商品圖後同一張單裡兩列同圖；
       nick 沒有書籍類商品，挑一件有庫存的實體衣物當「寫真誌」那筆訂單品項的對應。 */
    zine: WISHYOU_PRODUCTS['wy-24ce-jersey'], tee: WISHYOU_PRODUCTS['wy-26ms-tshirt-white'],
    hoodie: WISHYOU_PRODUCTS['wy-26ms-hoodie'], cap: WISHYOU_PRODUCTS['wy-bundle-cap'],
    shoes: WISHYOU_PRODUCTS['wy-bundle-lowtop-sneakers'], pin: WISHYOU_PRODUCTS['wy-bundle-cargo-pants'],
    /* 2026-09-11 別名重指：這五個舊 id 改回指找回的手寫記錄（原本指到 socks／jersey／mesh／dupont-bag／pillow） */
    song: NICK_EXTRA['nick-single'], movie: NICK_EXTRA['nick-r2'], album: NICK_EXTRA['nick-album'],
    membership: NICK_EXTRA['nick-member'], acetate: NICK_EXTRA['nick-vinyl']
  });
  var DATASETS = { default: P_DEFAULT, nick: P_NICK /* userB 未列＝沿用 default */ };
  function active() { return DATASETS[persona()] || DATASETS.default; }

  /* ── 組合包與拍賣（2026-07-25）──────────────────────────────────
     e-shop 的「組合」與「競標」兩個分頁，列是寫死在 e-shop.html 的，persona 切換時原本不會跟著換。
     拍賣列仍用 data-name（內部查表鍵、不會被 i18n 覆寫）查 AUCTIONS_NICK 就地替換。

     組合列（2026-09-11 改制）：舊的 BUNDLES_NICK（依 data-name 查表、只有 nick、展示資料手寫）已退場——
     組合的展示資料一律由 ztorGetBundle(id) 從 BUNDLE_SEED＋成員商品記錄推導，兩個 persona 都可用。
     e-shop 每個組合列帶 data-bundle-id（由 e-shop.html 寫），patchBundleRows() 依當前 persona 決定列去留
     並覆寫列內容。還沒補 data-bundle-id 的舊列，用 BUNDLE_ROW_LEGACY 以 data-name 對回組合 id（維持舊行為）。 */
  var BUNDLE_ROW_LEGACY = {
    default: { '九龍夜行 入門組合': 'coastline-starter-set', 'Vinyl + poster set': 'vinyl-poster-set' },
    nick:    { '九龍夜行 入門組合': 'wish-you-good-life-four-piece', 'Vinyl + poster set': 'nick-vinyl-set' }
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
  /* ── 拍賣的三開關與封存示範（2026-09-18 · D285／D284，spec §7.14「適用範圍」）──────────
     拍賣列與拍賣細節頁的「狀態」自此不再寫死在 markup：每一件拍賣一筆記錄、欄位名與單售／組合同一套
     （listed／shown／listAt／unlistAt／saleStart／archived），推導走 ListingState.deriveAuctionStatus。
     拍賣獨有：saleStart＝開拍時間、duration＝競標時長（天）；結標時間由 ListingState.auctionSaleEnd 算、不存。
     沒有庫存池。兩個 persona 共用這一份（拍賣列的 persona 差異只有名稱與圖，由 AUCTIONS_NICK 就地換）。
     時間用「相對今天」的 offset 產生——Live／Upcoming／Ended 是時間推出來的，寫死日期會在某天全部變成已結標。
     顯示用欄位（bids／current／winner…）仍是示意值，出價引擎不在原型範圍。 */
  function daysFromNow(days, hour) {
    var d = new Date(); d.setHours(hour === undefined ? 20 : hour, 0, 0, 0);
    d.setDate(d.getDate() + days);
    /* 本地時間的 ISO（不帶 Z），與 LISTING_SEED 其他時間欄同型 */
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':00';
  }
  var AUCTION_SEED = {
    /* Live（競標中）：開拍 4 天前、時長 5 天 → 剩 1 天 */
    'stage-worn-jacket':  { id: 'stage-worn-jacket', nameKey: 'e-shop.a1.name', img: 'stage-worn-jacket.webp', listed: true, shown: true, saleStart: daysFromNow(-4), duration: 5, bids: 18, bidders: 12, tags: ['Tour 2025', 'Signed'] },   /* tags：商品標籤（5.1.5.10 共用設定；2026-09-22 細節頁補欄，Live 唯讀示範） */
    /* Upcoming（未開始）：定時開拍在 2 天後 */
    'signed-tour-poster': { id: 'signed-tour-poster', nameKey: 'e-shop.a2.name', img: 'signed-tour-poster.webp', listed: true, shown: true, saleStart: daysFromNow(2), duration: 7, bids: 0, bidders: 0, tags: ['Signed'] },   /* Upcoming：標籤可加減示範 */
    /* Ended（完售、已出貨，D286 徽章文案改「完售」）：三個月前結標 */
    'vintage-synth':      { id: 'vintage-synth', nameKey: 'e-shop.a3.name', img: 'vintage-synth.webp', listed: true, shown: true, saleStart: daysFromNow(-100), duration: 7, bids: 23, bidders: 9, shipped: true },
    /* 流標（結標、無人出價，D287）：四個月前結標、bids 0 → deriveAuctionStatus 判成 unsold（完售 ended 的同層新桶） */
    'tour-enamel-pin':    { id: 'tour-enamel-pin', nameKey: 'e-shop.a7.name', img: 'enamel-pin-wave.webp', listed: true, shown: true, saleStart: daysFromNow(-120), duration: 7, bids: 0, bidders: 0 },
    /* 已下架（Unlisted）：結標後創作者手動下架，等著封存 */
    'lyric-sheet':        { id: 'lyric-sheet', nameKey: 'e-shop.a4.name', img: 'notebook.webp', listed: false, shown: true, saleStart: daysFromNow(-40), duration: 5, bids: 11, bidders: 6 },
    /* 零出價、已下架（2026-09-22 · D307「拍賣的刪除」）：兩個月前結標沒有人出價（流標），之後下架——清單「已下架」列與細節頁都有「刪除」。
       對照 tour-enamel-pin（流標但仍上架中 → 要先下架才能刪）與 lyric-sheet（已下架但曾有出價 → 只能封存）。 */
    'setlist-sheet':      { id: 'setlist-sheet', nameKey: 'e-shop.a8.name', img: 'notebook.webp', listed: false, shown: true, saleStart: daysFromNow(-60), duration: 5, bids: 0, bidders: 0 },
    /* 已封存（Archived）：只在「已封存」篩選下出現、細節頁唯讀 */
    'tour-laminate':      { id: 'tour-laminate', nameKey: 'e-shop.a5.name', img: 'wristband.webp', listed: false, shown: true, archived: true, saleStart: daysFromNow(-70), duration: 3, bids: 7, bidders: 4 },
    /* 隱藏（Hidden）＋競標中：商店找不到、持非公開連結可出價（§7.14「私下販售」） */
    'demo-cassette':      { id: 'demo-cassette', nameKey: 'e-shop.a6.name', img: 'coastline-single.webp', listed: true, shown: false, privateLink: 'https://ztor.example/s/demo-cassette?k=w4nq8t2e', saleStart: daysFromNow(-1), duration: 7, bids: 3, bidders: 2 },
    /* nick persona 的兩件（AUCTIONS_NICK 有 id 的那兩列）：狀態示範與對應的預設列相同 */
    'realive-tour-guitar': { id: 'realive-tour-guitar', img: 'PRS 10-Top.webp', listed: true, shown: true, saleStart: daysFromNow(-4), duration: 5, bids: 18, bidders: 12 },
    'wyagl-nike-dunk':     { id: 'wyagl-nike-dunk', img: 'nick-nike-00.jpg', listed: true, shown: true, saleStart: daysFromNow(2), duration: 7, bids: 0, bidders: 0 }
  };
  /* ── 工作階段覆蓋（2026-09-18 · D288 落地）──────────────────────────────
     下架／封存／重新上架／組合包連動只改記憶體，換頁就回到 seed——D288 的流程要跨頁看（在商品細節頁下架 patch，
     回到 e-shop 與組合詳情頁要看得到 roadie-set 已下架＋原因），所以把上架軸的五個欄位記進 sessionStorage，
     seed 時套回去。只記這五個欄位、只活在同一個分頁；不是持久化、不模擬後端。 */
  var SESSION_KEY = 'ztor.listing.session';
  var SESSION_FIELDS = ['listed', 'listAt', 'unlistAt', 'archived', 'unlistReason', 'saleStart', 'saleEnd', 'onSale'];   /* 後三個：D290 */
  function sessionRead() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}') || {}; } catch (_) { return {}; } }
  function sessionWrite(o) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(o)); } catch (_) {} }
  function kindOf(e) { return (e && e.members) ? 'bundle' : ((e && e.duration !== undefined) ? 'auction' : 'product'); }
  function applySession(e) {
    if (!e || !e.id) return e;
    var o = sessionRead()[kindOf(e) + ':' + e.id];
    if (!o) return e;
    SESSION_FIELDS.forEach(function (k) { if (Object.prototype.hasOwnProperty.call(o, k)) e[k] = o[k]; });
    return e;
  }
  function commit(e) {
    if (!e || !e.id) return e;
    var all = sessionRead(), o = {};
    SESSION_FIELDS.forEach(function (k) { o[k] = (e[k] === undefined) ? null : e[k]; });
    all[kindOf(e) + ':' + e.id] = o;
    sessionWrite(all);
    return e;
  }
  function forgetSession() { try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {} }
  /* ── 零成交可刪除（2026-09-22 · D307，§7.14「封存與刪除」）──────────────────────
     刪除是「這筆記錄不存在了」，不是三開關的值，所以不走 SESSION_FIELDS：同一把 sessionStorage key 底下另記 `__deleted`
     清單（'product:membership'／'bundle:sample-set'／'auction:setlist-sheet'），載入時 purgeDeleted() 把這些記錄從資料集拿掉、
     pruneDeletedRows() 把 e-shop 對應列移除。判斷（canDelete／hasSales／deleteBlockers）在 ListingState，這裡只做「拿掉並記住」。 */
  function deletedKeys() { var d = sessionRead().__deleted; return Array.isArray(d) ? d : []; }
  function purgeDeleted() {
    deletedKeys().forEach(function (k) {
      var i = k.indexOf(':'), kind = k.slice(0, i), id = k.slice(i + 1);
      if (kind === 'bundle') { if (BUNDLE_SEED[id]) BUNDLE_SEED[id].deleted = true; delete BUNDLE_SEED[id]; return; }
      if (kind === 'auction') { if (AUCTION_SEED[id]) AUCTION_SEED[id].deleted = true; delete AUCTION_SEED[id]; return; }
      /* 單售：同一筆記錄可能被兩個 persona 以不同 key 共用（別名），先標記再把指向它的 key 全部拿掉 */
      Object.keys(DATASETS).forEach(function (pid) {
        var set = DATASETS[pid];
        if (set[id]) set[id].deleted = true;
        Object.keys(set).forEach(function (key) { if (set[key] && set[key].deleted) delete set[key]; });
      });
    });
  }
  function removeEntity(e) {
    if (!e || !e.id) return e;
    var L = ls();
    if (L && L.remove) L.remove(e); else { e.deleted = true; e.listed = false; }
    var all = sessionRead(), k = kindOf(e) + ':' + e.id;
    var d = Array.isArray(all.__deleted) ? all.__deleted : [];
    if (d.indexOf(k) < 0) d.push(k);
    all.__deleted = d;
    delete all[k];   /* 三開關的覆蓋沒有對象了 */
    sessionWrite(all);
    purgeDeleted();
    return e;
  }
  /* e-shop 清單：已刪除的列移除（單售看細節連結的 ?id、組合看 data-bundle-id、拍賣看 data-auction-id）。patchAll 每次都跑，等冪。 */
  function pruneDeletedRows() {
    var keys = deletedKeys();
    if (!keys.length) return;
    document.querySelectorAll('.product-list__row').forEach(function (row) {
      var kind, id;
      if (row.getAttribute('data-bundle-id')) { kind = 'bundle'; id = row.getAttribute('data-bundle-id'); }
      else if (row.getAttribute('data-auction-id')) { kind = 'auction'; id = row.getAttribute('data-auction-id'); }
      else {
        var a = row.querySelector('a[href*="product-detail.html?id="]');
        var m = a && /[?&]id=([^&]+)/.exec(a.getAttribute('href'));
        if (!m) return;
        kind = 'product'; id = decodeURIComponent(m[1]);
      }
      if (keys.indexOf(kind + ':' + id) >= 0) row.remove();
    });
  }

  function seedAuction(a) {
    if (!a || a.__seeded) return a;
    if (a.listed === undefined) a.listed = true;
    if (a.shown === undefined) a.shown = true;
    if (a.listAt === undefined) a.listAt = null;
    if (a.unlistAt === undefined) a.unlistAt = null;
    if (a.privateLink === undefined) a.privateLink = null;
    if (a.archived === undefined) a.archived = false;
    if (a.archived) { a.listed = false; a.listAt = null; a.unlistAt = null; }
    applySession(a);
    a.__seeded = true;
    return a;
  }

  /* e-shop 組合列（2026-09-11）：每列以 data-bundle-id 對 BUNDLE_SEED——
       - 組合的 persona 與當前 persona 對不上（userB 視同 default）→ 整列從 DOM 移除。
         用移除而不是只標 hidden，因為 e-shop 的 applyFilter() 每次篩選都會重設 row.hidden、
         狀態分頁的計數也是數整個面板的列；persona 切換一律整頁重載（devtools.js），移除不會留後遺症。
       - 對上 → 取消 hidden（e-shop.html 先以 hidden 標記 persona 不同的列），覆寫名稱／圖／成員說明／
         價格／庫存與「編輯」連結；狀態徽章與庫存數字交給 e-shop 的 ztorEshopStatus（它讀 store.getBundle）。
       - 草稿列（data-status="draft"）只處理去留、連結與標題，其餘欄位維持「—」。
       - 沒有 data-bundle-id 的列：以 data-name 查 BUNDLE_ROW_LEGACY（舊行為），查不到就不碰。 */
  function bundleIdOfRow(row) {
    var id = row.getAttribute('data-bundle-id');
    if (id) return id;
    /* 只帶 ?id= 連結、沒標 data-bundle-id 的列（例如草稿列）也算 */
    var a = row.querySelector('a[href*="bundle-detail.html?id="]');
    var m = a && /[?&]id=([^&]+)/.exec(a.getAttribute('href'));
    if (m) return decodeURIComponent(m[1]);
    var legacy = BUNDLE_ROW_LEGACY[persona() === 'nick' ? 'nick' : 'default'] || {};
    return legacy[row.getAttribute('data-name') || ''] || null;
  }
  function patchBundleRows() {
    /* 活動組合包列（2026-09-21 · D294）：e-shop.html 依 events-store 各場的 bundles[] 自己注入、標 data-event-bundle，
       資料源在 events-store、不在 BUNDLE_SEED——這裡一律跳過，不當成「查無記錄的列」移除，也不當模板。 */
    var rows = Array.prototype.slice.call(document.querySelectorAll('.product-list__row[data-type="bundle"]:not([data-event-bundle])'));
    if (!rows.length) return;
    /* 當前 persona 有記錄、清單卻沒有列的組合（例：nick 的選物四件組原本借用第一列，那列現在標了
       coastline-starter-set）：用第一個非草稿組合列當模板複製一列補上，插在清單最前面。
       只在第一次執行時補（i18n:applied 會再進來，靠 data-bundle-id 判斷已經有了）。 */
    var panel = rows[0].parentNode;
    var template = rows.filter(function (r) { return r.getAttribute('data-status') !== 'draft'; })[0];
    var present = {};
    rows.forEach(function (r) { var id = bundleIdOfRow(r); if (id) present[id] = true; });
    if (template) {
      bundlesOfPersona().forEach(function (b) {
        if (present[b.id] || b.draft) return;
        var row = template.cloneNode(true);
        row.setAttribute('data-bundle-id', b.id);
        row.removeAttribute('data-name');
        /* 插在模板列前面＝清單最前面（補的通常是該 persona 的主打組合）；模板列若屬別的 persona，下面會被移除 */
        panel.insertBefore(row, template);
        rows.push(row);
      });
    }
    rows.forEach(function (row) {
      var id = bundleIdOfRow(row);
      if (!id) return;
      var seed = BUNDLE_SEED[id];
      if (!seed || !bundleBelongs(seed)) { row.remove(); return; }
      row.removeAttribute('hidden'); row.hidden = false;
      row.setAttribute('data-bundle-id', id);
      var b = window.ztorGetBundle(id);
      var detail = row.querySelector('a[href*="bundle-detail.html"], a[href*="create-bundle.html"]');
      if (detail) detail.setAttribute('href', 'bundle-detail.html?id=' + id);
      /* 組合名＝賣家內容（維持中文）。草稿沒有名字時沿用列上的「未命名」。 */
      var t = row.querySelector('.product-list__title');
      if (t && b.name) { t.removeAttribute('data-i18n'); t.textContent = b.name; }
      row.setAttribute('data-name', b.name || '');
      if (row.getAttribute('data-status') === 'draft') return;
      var img = row.querySelector('.product-list__image img');
      if (img && b.img) { img.setAttribute('src', 'images/products/' + b.img); img.setAttribute('alt', ''); }
      /* 成員（2026-09-11 使用者裁示）：寫在組合名底下、一件一行、暗字、最多三行，第四件起併成「…」一行；
         只寫商品名，不寫件數等細節。列上沒有容器就補一個（舊列結構）。 */
      var body = row.querySelector('.product-list__body');
      var mem = row.querySelector('.product-list__members');
      if (body && !mem) { mem = document.createElement('div'); mem.className = 'product-list__members'; body.appendChild(mem); }
      if (mem) {
        var names = b.memberNames || [];
        var lines = names.slice(0, 3);
        if (names.length > 3) lines.push('…');
        mem.innerHTML = lines.map(function (n) { return '<div class="product-list__members-line">' + String(n).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</div>'; }).join('');
      }
      var pr = row.querySelector('.product-list__price');
      if (pr) { pr.removeAttribute('data-i18n'); pr.textContent = b.price; }
      /* 庫存與狀態：e-shop 的 rowModel 看到 data-bundle-id 會直接問 store（bundleQtyOf／deriveStatus），
         這裡只把結構化數字寫到列上給沒有那個推導層的頁面當退路。 */
      row.setAttribute('data-stock-avail', b.stockAvail === Infinity ? '' : String(b.stockAvail));
      if (b.stockCap != null) row.setAttribute('data-stock-cap', b.stockCap); else row.removeAttribute('data-stock-cap');
      if (window.ztorEshopStatus) {
        if (window.ztorEshopStatus.render) window.ztorEshopStatus.render(row);
        if (window.ztorEshopStatus.renderStock) window.ztorEshopStatus.renderStock(row);
      }
    });
  }
  function patchBundlesAndAuctions() {
    patchBundleRows();
    if (persona() !== 'nick') return;
    document.querySelectorAll('.product-list__row[data-type="auction"]').forEach(function (row) {
      var a = AUCTIONS_NICK[row.getAttribute('data-name') || ''];
      if (!a) return;
      /* 上游 2026-07-27 的詳情頁連結修復——必須保留，否則拍賣列點進去會開到錯的頁。 */
      var detail = row.querySelector('a[href*="auction-detail.html"]');
      if (detail && a.id) detail.setAttribute('href', 'auction-detail.html?id=' + a.id);
      /* 三開關記錄也要跟著換成 nick 那一筆（AUCTION_SEED 有同 id 的記錄），狀態推導才對得上細節頁 */
      if (a.id && AUCTION_SEED[a.id]) row.setAttribute('data-auction-id', a.id);
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

  /* ══ D241 · 庫存池、三開關與鎖定庫存（spec 0-設計規格書 §7.14）════════════════
     推導邏輯一律走 js/listing-state.js（window.ListingState），本檔只負責「資料長什麼樣」：
     把既有的平面欄位（status／stock／cap／sold）補成 §7.14 的模型。舊欄位一個都不刪——
     還沒改版的頁面仍在讀它們——但凡是「算出來的」都改由 ProductsStore.statusOf() 回答。

     三態鎖定量：locks.single／locks.bundles[id] 為 null ＝ 這個管道沒鎖定（共用沒有被鎖定的庫存量）；
     是數字（含 0）＝ 鎖定模式。詳見 listing-state.js 檔頭。 */

  var LS = (typeof window !== 'undefined' && window.ListingState) || null;

  /* 逐品的上架與鎖定示範值。沒列在這裡的商品吃 seedListing() 的預設（上架＋顯示＋不排程＋不鎖定），
     目前在庫由既有 stock 換算。列在這裡的每一筆都是為了讓某一個狀態在原型上真的看得到。 */
  var LISTING_SEED = {
    /* 低庫存＋鎖定示範疊在同一品：池 3、單售鎖 1、組合（coastline-starter-set）鎖 1 →
       兩個管道都在鎖定模式，剩下 1 件沒有被鎖定的庫存量沒有人能賣（§7.14「所有管道都設了鎖定」）。
       zine 是單一規格且已是 coastline-starter-set 的成員（見下方 BUNDLE_SEED），單售鎖定後
       可售量看的是鎖定量（1），仍 ≤ 門檻 4，「低庫存」與「鎖定」兩個示範互不打架、同時成立。
       ⚠ 這條原本掛在 tee（多規格）身上，2026-09-04 D241 收尾移到這裡——多規格商品的庫存池
       與鎖定怎麼疊尚無定論（見 ASSUMPTIONS UIA-132），示範資料先避開這個未決問題。 */
    zine:    { locks: { single: 1 } },   /* 組合鎖定由 BUNDLE_SEED 導出：coastline-starter-set 1 套、signing-set 1 套 → 未鎖定 1 */
    /* 隱藏＋私下販售：商店找不到，持非公開連結仍可買（§7.14 狀態組合表第五列）。
       2026-09-11 疊上簽名會限定組的「成員全鎖」示範：單售鎖 2 ＋ 簽名會組鎖 3；黑膠＋海報典藏組沒鎖，仍共用剩下 24 件。 */
    /* single 2（2026-09-11 改）：原本寫 0 想表達「單售鎖定且賣完」，規格與使用者裁決「0＝不鎖定」，改成正數才是全鎖示範 */
    acetate: { shown: false, privateLink: 'https://ztor.example/s/acetate?k=k3m8qr72', locks: { single: 2 } },
    /* ── 2026-09-11 預設 persona 新增 9 筆的上架示範（商品本體在 P_DEFAULT）── */
    /* 定時下架排定：unlistAt 在未來（整個原型原本沒有任何一筆示範這個狀態） */
    poster:  { unlistAt: '2026-12-31T23:59:00' },
    /* 隱藏＋待命（§7.14 狀態組合表第四列）：隱藏、持非公開連結、但開賣日還沒到 */
    tote:    { shown: false, privateLink: 'https://ztor.example/s/tote?k=p7wq2m9d', saleStart: '2026-10-15T12:00:00' },
    /* 排定上架、時間還沒到（預設 persona 原本缺；keychain 不在 e-shop 的 PREVIEW_IDS 裡，見上方 hoodie 的教訓） */
    keychain: { listAt: '2026-11-01T10:00:00' },
    /* 草稿：總閘門關著（draft 徽章優先於已下架，由 ListingState 排序） */
    sticker: { listed: false },
    /* jacket／wristband／beanie 的鎖定寫在 variants[i].locks（逐選項組合），商品層由 seedListing() 加總 */
    /* 售罄：池 0 */
    pin:     {},
    /* 即將開賣：上架且顯示，開賣日期與時間在未來 */
    movie:   { saleStart: '2026-10-01T12:00:00' },
    /* 販售結束：停售日期與時間已過 */
    song:    { saleEnd: '2026-08-20T23:59:00' },
    /* 已下架：總閘門關掉，公開與非公開連結都失效。尚無銷售、不在任何組合包裡 → D307（2026-09-22）零成交可刪除的正例：清單列與細節頁都有「刪除」 */
    membership: { listed: false },
    /* ⚠ 這裡曾經放過 hoodie 的「排定上架、時間還沒到」示範（2026-09-09 加、同日撤）。
       撤掉的原因：hoodie 同時是 e-shop F5 粉絲端預覽的第 5 張卡，而那段的過濾只看
       listed／shown、不看 listAt（既有淺層判斷，見 ASSUMPTIONS UIA-135），
       於是清單與細節頁說「已下架」、預覽卡卻照樣露出。要補「排定上架未到」的示範，
       請挑不在 e-shop.html 的 PREVIEW_IDS 裡、也不是組合成員的商品——nick persona 的
       wy-24ce-rug 就是為此挑的。
       nick persona 的下架示範（2026-09-09）：原本這個 persona 的 16 件商品全部上架中，
       等於「已下架」這個狀態在周湯豪的資料裡不存在——建立組合的候選清單看不到停用列、
       e-shop 也沒有已下架那一列可篩。兩件都刻意挑非組合成員、非別名的商品，
       不影響既有的組合可售量與 product-detail 示範。 */
    'wy-24ce-skateboard': { listed: false },
    'wy-24ce-rug': { listAt: '2026-11-15T10:00:00' },
    /* 販售軸的兩態（2026-09-09）：建立組合的候選清單要標「販售結束」與「即將開賣」，
       但預設角色帶這兩態的商品（song／movie）依 D251 不能進組合，等於那兩顆徽章沒有資料可看。
       同樣挑非組合成員、非別名、也不在 e-shop F5 預覽名單裡的商品。 */
    'wy-24ce-wyagl-tee': { saleEnd: '2026-08-20T23:59:00' },
    'wy-24ce-sock': { saleStart: '2026-11-01T12:00:00' },
    /* ── 2026-09-11 nick persona 對照預設 persona 的九種狀態（商品改值在 WISHYOU_PRODUCTS 之後的覆寫段）── */
    /* 隱藏＋非公開連結＋三個管道都鎖定（單售 40、簽名會組 10、典藏組 12）→「所有管道都設了鎖定」提醒 */
    'nick-vinyl': { shown: false, privateLink: 'https://ztor.example/s/nick-vinyl?k=v4c9xw27', locks: { single: 40 } },
    /* 隱藏＋待命（對照 tote） */
    'wy-24ce-mesh': { shown: false, privateLink: 'https://ztor.example/s/wy-24ce-mesh?k=m2h7kq58', saleStart: '2026-10-15T12:00:00' },
    /* 定時下架排定（對照 poster） */
    'wy-24ce-dupont-bag': { unlistAt: '2026-12-31T23:59:00' },
    /* 隱藏＋非公開連結（對照 acetate） */
    'wy-26ms-tshirt-red': { shown: false, privateLink: 'https://ztor.example/s/wy-26ms-tshirt-red?k=r8n3pz61' },
    /* 草稿（對照 sticker） */
    'wy-draft-tote': { listed: false },
    /* ── 2026-09-18 封存示範（D284）：archived＝true 的商品由 seedListing() 一併關掉總閘門（封存必然下架） ── */
    postcard: { archived: true },
    mug:      { archived: true },
    /* patch（2026-09-18 D288 改）：上架中、仍在上架中的 roadie-set 裡——按下架時列出組合包、確認＝一同下架。
       原 D284 示範把它設成已下架（listed:false）並讓 roadie-set 維持上架，D288 的不變式（上架中的組合包成員一律上架中）不允許那個組合。 */
    patch:    {},
    /* 定時下架已到期（D288）：coaster 在 2026-09-15 依排程下架，上架中的 backstage-set 由載入時的自動連動一併下架 */
    coaster:  { unlistAt: '2026-09-15T23:59:00' }
  };

  /* 詳情頁示範狀態（2026-09-11）：原本 product-detail.html 對每個 id 都硬插同一組示範
     （銷售摘要 92／$2,944／$2,372、折扣三開關關、每人限購關、電影 2 部、項目引用 1 列、標籤 2 顆、
     seedHistory() 的 4 筆含 1 筆計時補貨），搬進資料層後才有「有／沒有」兩態可看。
     沒列在這裡的商品吃 seedListing() 的預設（全部空狀態）。history 的 combo／vi 對應該商品 variants。 */
  var DETAIL_SEED = {
    /* hoodie＝主要示範頁：原 seedHistory() 那組（含計時補貨還在路上）整組搬到這裡，combo 依 hoodie 的 6 個組合展開 */
    hoodie: {
      sales: { units: 41, gross: '$2,378', net: '$1,915' },
      films: ['film-neon-harbor'],
      tags: ['Tour 2025'],
      history: [
        { id: 'h1', type: 'restock', mode: 'scheduled', date: '2026/09/11', supplier: 'Riso House', eta: '2026/09/18', note: '先補 Sand / L，巡演前要到。', state: 'restocking', items: [{ combo: 'Sand / L', vi: 5, delta: '+20', qty: 20 }] },
        { id: 'h2', type: 'lock', date: '2026/09/05', state: 'done', items: [{ combo: 'Black / S', vi: 0, delta: '0 → 2', toKey: 'stock.history.note.single' }] },
        { id: 'h3', type: 'restock', mode: 'now', date: '2026/09/02', supplier: 'Riso House', note: '第二批，含 5 件備品。', state: 'done', items: [{ combo: 'Black / S', vi: 0, delta: '+40', qty: 40 }, { combo: 'Black / M', vi: 1, delta: '+25', qty: 25 }] },
        { id: 'h4', type: 'restock', mode: 'now', date: '2026/08/20', supplierKey: 'stock.history.own', note: '', state: 'done', items: [{ combo: 'Sand / L', vi: 5, delta: '+30', qty: 30 }] }
      ]
    },
    /* zine＝頁面沒帶 ?id 時的預設樣本：原本寫死在 HTML 的銷售摘要、電影 2 部、項目引用、標籤都歸它；
       歷史只留 1 筆已完成補貨＋對應 LISTING_SEED.zine 單售鎖 1 的鎖定紀錄，沒有補貨中（與 hoodie 成對比） */
    zine: {
      sales: { units: 92, gross: '$2,944', net: '$2,372' },
      limit: 2,
      films: ['film-zheng-yi-sao', 'film-neon-harbor'],
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }],
      tags: ['Tour 2025', 'Signed'],
      history: [
        { id: 'h1', type: 'lock', date: '2026/09/05', state: 'done', items: [{ combo: '—', vi: 'single', delta: '— → 1', toKey: 'stock.history.note.single' }] },
        { id: 'h2', type: 'restock', mode: 'now', date: '2026/08/20', supplierKey: 'stock.history.own', note: '', state: 'done', items: [{ combo: '—', vi: 'single', delta: '+30', qty: 30 }] }
      ]
    },
    /* tee＝折扣三開關全開的示範（限時起訖、可與優惠碼疊加），其餘商品折扣關。
       2026-09-22：tee 是多選項商品，折扣改記 percent（套到每個組合、無絕對價）；單一規格商品（poster／wy-24ce-dupont-bag）
       記 price、細節頁依定價反算 %——同 create-product 的模型（ASSUMPTIONS UIA-060） */
    tee: {
      discount: { percent: 12, limited: { start: '2026-09-15', end: '2026-10-15' }, stack: true },
      history: [
        { id: 'h1', type: 'restock', mode: 'now', date: '2026/08/28', supplier: 'Riso House', note: '', state: 'done', items: [{ combo: 'M', vi: 1, delta: '+20', qty: 20 }] }
      ]
    },
    /* pin＝售罄：有銷售、沒有歷史、沒有補貨中 */
    pin: { sales: { units: 120, gross: '$1,440', net: '$1,160' } },
    /* ── 2026-09-11 既有商品補值（只補缺的示範）── */
    cap:   { limit: 3, lowAlert: false },   /* 2026-09-22：低庫存提醒關著的示範（門檻欄停用） */
    shoes: { films: ['film-fist-of-fury', 'film-last-typhoon'] },
    song:  { sales: null },
    album: { tags: ['OST', 'Digital'] },
    /* ── 2026-09-11 預設 persona 新增 9 筆 ── */
    'doc-guide': {
      sales: { units: 63, gross: '$378', net: '$302' },
      tags: ['Behind the scenes', 'Tour 2025'],
      films: ['film-zheng-yi-sao']
    },
    'ip-kit': {
      sales: null,
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }]
    },
    poster: {
      sales: { units: 97, gross: '$3,880', net: '$3,120' },
      discount: { price: '32.00', limited: { start: '2026-10-01', end: '2026-10-31' }, stack: true },
      limit: 2
    },
    jacket: {
      sales: { units: 11, gross: '$1,650', net: '$1,320' },   /* 2026-09-21：與各組合 sold 加總（11）一致 */
      history: [
        { id: 'h1', type: 'lock', date: '2026/09/08', state: 'done', items: [{ combo: 'Black / M', vi: 1, delta: '— → 2', toKey: 'stock.history.note.single' }, { combo: 'Olive / L', vi: 5, delta: '— → 1', toKey: 'stock.history.note.single' }] }
      ]
    },
    tote: { sales: null },
    keychain: { sales: null },
    beanie: {
      sales: { units: 50, gross: '$1,100', net: '$880' },
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }],
      history: [
        { id: 'h1', type: 'restock', mode: 'now', date: '2026/08/30', supplier: 'Riso House', note: '', state: 'done', items: [{ combo: 'Black', vi: 0, delta: '+30', qty: 30 }, { combo: 'Grey', vi: 1, delta: '+20', qty: 20 }] }
      ]
    },
    wristband: { sales: { units: 34, gross: '$340', net: '$272' } },
    sticker: { draft: true },
    /* ── 2026-09-11 nick persona（對照上面九筆）── */
    'nick-doc': {
      sales: { units: 210, gross: 'NT$37,800', net: 'NT$32,130' },
      tags: ['REALIVE', 'Tour'],
      films: ['film-neon-harbor']
    },
    'nick-ip': {
      sales: null,
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }]
    },
    'wy-24ce-jersey': {
      sales: { units: 180, gross: 'NT$662,400', net: 'NT$563,040' },
      history: [
        { id: 'h1', type: 'lock', date: '2026/09/08', state: 'done', items: [{ combo: 'M', vi: 0, delta: '— → 5', toKey: 'stock.history.note.single' }] }
      ]
    },
    'wy-24ce-dupont-bag': {
      sales: { units: 88, gross: 'NT$95,040', net: 'NT$80,784' },
      discount: { price: '880', limited: { start: '2026-10-01', end: '2026-10-31' }, stack: true },
      limit: 2
    },
    'wy-26ms-tshirt-white': {
      sales: { units: 142, gross: 'NT$266,960', net: 'NT$226,916' },
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }]
    },
    'wy-26ms-socks': {
      sales: { units: 320, gross: 'NT$220,160', net: 'NT$187,136' },
      /* 計時補貨還在路上（對照 hoodie）：vi 0 ＝ 唯一尺寸 F */
      history: [
        { id: 'h1', type: 'restock', mode: 'scheduled', date: '2026/09/10', supplier: '祝你好命 工作室', eta: '2026/09/20', note: '白趴加場前補到。', state: 'restocking', items: [{ combo: 'F', vi: 0, delta: '+200', qty: 200 }] },
        { id: 'h2', type: 'restock', mode: 'now', date: '2026/08/15', supplierKey: 'stock.history.own', note: '', state: 'done', items: [{ combo: 'F', vi: 0, delta: '+300', qty: 300 }] }
      ]
    },
    'wy-24ce-tee': { sales: { units: 96, gross: 'NT$161,280', net: 'NT$137,088' } },
    'wy-draft-tote': { draft: true },
    /* 2026-09-18 封存示範（D284）：明信片組有訂單歷史（封存不影響訂單與收入）；馬克杯沒有 */
    postcard: { sales: { units: 64, gross: '$768', net: '$614' }, tags: ['Tour 2025'] },
    mug: { sales: null },
    /* 2026-09-18 D288：定時下架到期示範，有一點銷售。D307（2026-09-22）反例：已下架但有成交 → 沒有「刪除」、只能封存，上架卡說明多一句「已有銷售紀錄，只能封存」 */
    coaster: { sales: { units: 9, gross: '$99', net: '$79' } }
  };

  /* 一個組合包＝一個販售管道。cap 是組合自己的限量硬上限（§7.2），null ＝ 無額外上限。
     ── 價格模型（2026-09-11 使用者裁示第二版；同日稍早的 discountWindow／stackCodes 兩欄併入 discount 後移除）──
       discountPct number|null   「組合折扣」常態折扣 %（0–100；null／0 ＝ 無優惠）。售價＝成員合計 ×(1 − discountPct/100)。
                                 成員是多選項時合計是區間、售價會是「從 $X 起」——本示範資料的 variants 沒有逐組合定價，
                                 所以 ztorGetBundle() 只算單一值；區間顯示待頁面依 variants[i].price 補。不另存 price 欄。
       discount    { percent, limited: { start, end } | null, stack: bool } | null
                                 「限時折扣」：疊在常態售價之上、依營運需求另設，與單售商品的 discount 同形狀；null ＝ 關。
     其餘詳情頁示範欄位（description／films／projects／sales／history／draft／membersKey）沒寫的由 seedBundle() 補預設。
     展示資料（memberItems／price 顯示字串／img／stockAvail）不存這裡，由 ztorGetBundle(id) 從成員商品記錄推導。 */
  var BUNDLE_SEED = {
    /* ══ 預設 persona（九龍夜行）══ */
    /* 不限量、部分鎖（只有 zine 鎖）、販售中；常態折扣 10%（合計 146） */
    'coastline-starter-set': {
      id: 'coastline-starter-set', persona: 'default', name: '九龍夜行 入門組合', img: 'coastline-starter-pack.webp',
      description: '巡迴紀念 T 恤、六片帽、帆布低筒鞋與幕後寫真誌——入坑的第一套。',
      /* 不用舊的 e-shop.b1.members（寫 3 件、與現在 4 個成員不符），改由成員名自動組出 */
      /* zine（2026-09-04 D241 收尾新增）：多收一個單一規格成員，讓 product-detail.html 的
         庫存分配表有單一規格＋組合包列＋鎖定示範可看（見上方 LISTING_SEED.zine）。 */
      members: [{ productId: 'tee' }, { productId: 'cap' }, { productId: 'shoes' }, { productId: 'zine' }],
      /* 鎖定套數（2026-09-11）：鎖 1 套，四個成員各鎖 1 件（zine 池只有 3：單售 1 ＋ 本組合 1 ＋ 簽名會組 1） */
      lockSets: 1, alloc: {},
      cap: null, listed: true, listAt: null, unlistAt: null,
      /* lowThreshold＝0（2026-09-04 修正，原本兩個組合都是 3）：e-shop 的 Bundles 狀態篩選
         沒有「急需補貨」tab（組合是否設低庫存門檻仍是產品待確認，ASSUMPTIONS UIA-133），
         非 0 門檻卻沒有對應 tab 會讓組合列在某些成員量小時掉進 deriveStatus 判成 low、
         但 9 個分頁一個都篩不到它——加入 zine（池僅 3）當成員後這條路徑真的會被踩到，
         故收斂成 0，兩個組合統一不參與低庫存判斷。 */
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: 10, discount: null,
      sales: { units: 12, gross: '$1,536', net: '$1,230' },
      films: ['film-neon-harbor'],
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }],
      history: [{ id: 'b1', date: '2026/09/05', sets: '— → 1', items: [{ productId: 'tee', delta: '— → 1' }, { productId: 'cap', delta: '— → 1' }, { productId: 'shoes', delta: '— → 1' }, { productId: 'zine', delta: '— → 1' }] }]
    },
    /* 限量 20、含 QR 領取成員（acetate／wristband）、成員全鎖（每個成員在本組合都有鎖定量）；
       常態折扣 10%（合計 304）＋限時折扣 10%（10 月）可與優惠碼疊加 */
    'signing-set': {
      id: 'signing-set', persona: 'default', name: '簽名會限定組', img: 'coastline-starter-pack.webp',
      description: '簽名會現場領取的黑膠與手環，加上舞台外套復刻版與幕後寫真誌。限量 20 組。',
      members: [{ productId: 'acetate' }, { productId: 'wristband' }, { productId: 'jacket' }, { productId: 'zine' }],
      /* 鎖 1 套（zine 剩 1 件、壓住上限）；手環指定 S、外套指定 Black / M（各 1 件＝全部指定） */
      lockSets: 1, alloc: { wristband: { 0: 1 }, jacket: { 1: 1 } },
      cap: 20, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: 10, discount: { percent: 10, limited: { start: '2026-10-01', end: '2026-10-31' }, stack: true },
      perks: ['簽名會優先入場', '限量海報一張（現場領取）'],   /* 額外權益（D292）：一行一項；2026-09-22 細節頁補欄的示範 */
      sales: { units: 5, gross: '$1,400', net: '$1,120' },
      films: ['film-zheng-yi-sao'],
      history: [{ id: 'b1', date: '2026/09/08', sets: '— → 1', items: [{ productId: 'acetate', delta: '— → 1' }, { productId: 'wristband', combo: 'S', delta: '— → 1' }, { productId: 'jacket', combo: 'Black / M', delta: '— → 1' }, { productId: 'zine', delta: '— → 1' }] }]
    },
    /* 隱藏＋非公開連結（沿用 e-shop 既有第二列「Vinyl + poster set」）；無折扣 */
    'vinyl-poster-set': {
      id: 'vinyl-poster-set', persona: 'default', name: '黑膠＋海報典藏組', img: 'vinyl-poster-set.webp',
      description: '編號黑膠與簽名海報，只給持連結的人。',
      membersKey: 'e-shop.b2.members',
      members: [{ productId: 'acetate' }, { productId: 'poster' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: false, privateLink: 'https://ztor.example/s/vinyl-poster-set?k=g6t2mw84', saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null,
      sales: { units: 9, gross: '$1,350', net: '$1,080' }
    },
    /* 可售 0：pin 售罄、sticker 是草稿（草稿成員視同可售 0，規則寫在 listing-state.js 的 bundleQty） */
    'neon-gift-box': {
      id: 'neon-gift-box', persona: 'default', name: '霓虹徽章禮盒', img: 'enamel-pin-wave.webp',
      description: '琺瑯徽章與貼紙包的小禮盒。',
      members: [{ productId: 'pin' }, { productId: 'sticker' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null,
      sales: { units: 20, gross: '$240', net: '$192' }
    },
    /* 即將開賣（saleStart 在未來）、限量 100；常態折扣 15%；尚無銷售 */
    'winter-preorder-set': {
      id: 'winter-preorder-set', persona: 'default', name: '冬季預購組', img: 'coastline-hoodie.webp',
      description: '連帽外套＋六片帽，11 月開放預購。',
      members: [{ productId: 'hoodie' }, { productId: 'cap' }],
      cap: 100, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: '2026-11-01T12:00:00', saleEnd: null, lowThreshold: 0,
      discountPct: 15, discount: null,
      sales: null
    },
    /* 販售結束（saleEnd 已過）；被 1 個項目引用 */
    'tour-recap-set': {
      id: 'tour-recap-set', persona: 'default', name: '巡迴回顧組', img: 'coastline-tee.webp',
      description: '巡迴收官的紀念組：T 恤＋寫真誌。',
      members: [{ productId: 'tee' }, { productId: 'zine' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: '2026-08-20T23:59:00', lowThreshold: 0,
      discountPct: 10, discount: null,
      sales: { units: 44, gross: '$2,200', net: '$1,760' },
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }]
    },
    /* 已下架（listed:false） */
    'internal-test-set': {
      id: 'internal-test-set', persona: 'default', name: '內部測試組', img: 'cap.webp',
      description: '內部測試用，不對外。',
      members: [{ productId: 'cap' }, { productId: 'shoes' }],
      cap: null, listed: false, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null, sales: null
    },
    /* 草稿：沒有圖（清單列用 placeholder）、名稱先叫「新組合」 */
    'draft-set': {
      id: 'draft-set', persona: 'default', name: '新組合', img: null,
      description: '',
      members: [{ productId: 'tee' }, { productId: 'cap' }],
      cap: null, listed: false, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null, draft: true
    },
    /* ── 2026-09-18 封存示範（D284，§7.14「封存與不可刪除」）── */
    /* 已封存的組合包：listed:false＋archived:true；曾有銷售（封存不影響訂單與收入） */
    'launch-set': {
      id: 'launch-set', persona: 'default', name: '首發紀念組', img: 'coaster-pack.webp',
      description: '首發週限定：Logo 馬克杯＋明信片組。',
      members: [{ productId: 'mug' }, { productId: 'postcard' }],
      cap: 50, listed: false, listAt: null, unlistAt: null, archived: true,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: 10, discount: null,
      sales: { units: 50, gross: '$1,170', net: '$936' }
    },
    /* 因成員下架而被一同下架的組合包（D288，原 D284 寫「因成員封存」）：postcard 下架時創作者確認「一同下架」，本組合轉已下架並記原因
       （unlistReason；組合詳情頁要看得出「因成員下架而一同下架」，§7.14）。postcard 之後才封存。成員資格不因下架而移除。 */
    'postcard-set': {
      id: 'postcard-set', persona: 'default', name: '明信片＋寫真誌組', img: 'postcard-set.webp',
      description: '明信片組搭配幕後寫真誌，寄給沒到場的朋友。',
      members: [{ productId: 'postcard' }, { productId: 'zine' }],
      cap: null, listed: false, listAt: null, unlistAt: null,
      unlistReason: { type: 'member-unlisted', productId: 'postcard', productName: '九龍夜行 明信片組' },
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: 5, discount: null,
      sales: { units: 18, gross: '$612', net: '$490' }
    },
    /* 上架中、成員 patch 與 cap 都上架中（D288 不變式）；patch 按下架時本組合會被列進連動彈窗、確認後一同下架並記原因 */
    'roadie-set': {
      id: 'roadie-set', persona: 'default', name: '巡演工作組', img: 'patch-set.webp',
      description: '刺繡布章＋六片帽，隨行工作人員同款。',
      members: [{ productId: 'patch' }, { productId: 'cap' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null,
      sales: { units: 7, gross: '$245', net: '$196' }
    },
    /* 定時下架到期的自動連動示範（2026-09-18 · D288）：seed 寫成上架中，但成員 coaster 的 unlistAt 已過——
       載入時 ListingState.scheduledUnlistCascade() 會把本組合自動下架並記 unlistReason（auto:true）；
       通知中心對應一則「杯墊組已依排程下架，後台茶水組一併下架」（sidebar.js NOTIF_INFO，靜態示範）。 */
    'backstage-set': {
      id: 'backstage-set', persona: 'default', name: '後台茶水組', img: 'coaster-pack.webp',
      description: '杯墊組＋六片帽，後台休息時間的標配。',
      members: [{ productId: 'coaster' }, { productId: 'cap' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: 5, discount: null,
      sales: { units: 4, gross: '$100', net: '$80' }
    },
    /* 零成交的已封存組合包（2026-09-22 · D307，§7.14「零成交可刪除」）：試賣沒賣出去就封存了——清單「已封存」篩選與細節頁頁首都有「刪除」；
       刪除不影響成員（beanie／cap 的狀態與庫存照舊）。對照 launch-set（已封存但有成交 → 只能封存）。 */
    'sample-set': {
      id: 'sample-set', persona: 'default', name: '試賣樣品組', img: 'beanie.webp',
      description: '毛帽＋六片帽的試賣組，沒有人買就先收起來。',
      members: [{ productId: 'beanie' }, { productId: 'cap' }],
      cap: null, listed: false, listAt: null, unlistAt: null, archived: true,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null, sales: null
    },

    /* ══ nick persona（周湯豪）══ 第一筆必須是選物四件組：ztorGetBundle() 沒帶 id 時回該 persona 的第一筆 */
    /* 限量 50、部分鎖（只有白 Tee 逐尺寸鎖 2 件）、販售中；常態折扣 20%（合計 7,480 → 5,984，原手寫的 5,980 是自己四捨五入的結果） */
    'wish-you-good-life-four-piece': {
      id: 'wish-you-good-life-four-piece', persona: 'nick', name: '『祝你好命』選物四件組', img: 'set-outfit-model.webp',
      description: '白 Tee、刺繡 Logo 老帽、束口工裝褲與低筒球鞋，以紅白黑配色組成的四件穿搭。',
      membersKey: 'e-shop.bnick.set.members',
      members: [
        { productId: 'wy-26ms-tshirt-white' }, { productId: 'wy-bundle-cap' },
        { productId: 'wy-bundle-cargo-pants' }, { productId: 'wy-bundle-lowtop-sneakers' }
      ],
      /* 鎖 2 套；白 Tee 是多選項、不指定規格（少分配＝只限總數） */
      lockSets: 2, alloc: {},
      cap: 50, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 3,
      discountPct: 20, discount: null,
      sales: { units: 38, gross: 'NT$227,240', net: 'NT$193,150' },
      films: ['film-neon-harbor'],
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }],
      history: [
        { id: 'b1', date: '2026/09/05', sets: '6 → 2', items: [{ productId: 'wy-26ms-tshirt-white', delta: '6 → 2' }, { productId: 'wy-bundle-cap', delta: '6 → 2' }, { productId: 'wy-bundle-cargo-pants', delta: '6 → 2' }, { productId: 'wy-bundle-lowtop-sneakers', delta: '6 → 2' }] },
        { id: 'b2', date: '2026/08/28', sets: '4 → 6', items: [{ productId: 'wy-26ms-tshirt-white', delta: '4 → 6' }, { productId: 'wy-bundle-cap', delta: '4 → 6' }, { productId: 'wy-bundle-cargo-pants', delta: '4 → 6' }, { productId: 'wy-bundle-lowtop-sneakers', delta: '4 → 6' }] }
      ]
    },
    /* 對照 signing-set：限量 30、含 QR 成員（nick-vinyl／wy-24ce-tee）、成員全鎖；常態折扣 10%＋限時 10% 可疊加 */
    'nick-signing-set': {
      id: 'nick-signing-set', persona: 'nick', name: 'REALIVE 簽名會限定組', img: 'nick-realive-cd.jpg',
      description: '簽名會現場領取的限量黑膠與 WYAGL T-SHIRT，加上 24CE 足球衣。限量 30 組。',
      members: [{ productId: 'nick-vinyl' }, { productId: 'wy-24ce-tee' }, { productId: 'wy-24ce-jersey' }],
      /* 鎖 2 套；球衣指定 M 2 件、Tee 不指定規格 */
      lockSets: 2, alloc: { 'wy-24ce-jersey': { 1: 2 } },
      cap: 30, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: 10, discount: { percent: 10, limited: { start: '2026-10-01', end: '2026-10-31' }, stack: true },
      sales: { units: 8, gross: 'NT$55,840', net: 'NT$47,464' },
      films: ['film-neon-harbor'],
      history: [{ id: 'b1', date: '2026/09/08', sets: '— → 2', items: [{ productId: 'nick-vinyl', delta: '— → 2' }, { productId: 'wy-24ce-tee', delta: '— → 2' }, { productId: 'wy-24ce-jersey', combo: 'M', delta: '— → 2' }] }]
    },
    /* 對照 vinyl-poster-set（沿用舊 BUNDLES_NICK 第二筆「LOVE RAGE HOPE 黑膠典藏組」）：隱藏＋非公開連結；無折扣 */
    'nick-vinyl-set': {
      id: 'nick-vinyl-set', persona: 'nick', name: 'LOVE RAGE HOPE 黑膠典藏組', img: 'coastline-acetate.webp',
      description: '限量黑膠＋Wish You A Good Life T-SHIRT，只給持連結的歌迷。',
      /* 舊的 e-shop.bnick.vinyl.members 寫「巡演寫真誌」、與成員不符，改由成員名自動組出 */
      members: [{ productId: 'nick-vinyl' }, { productId: 'wy-24ce-wyagl-tee' }],
      lockSets: 12, alloc: {},
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: false, privateLink: 'https://ztor.example/s/nick-vinyl-set?k=z3q8dm45', saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null,
      sales: { units: 15, gross: 'NT$59,700', net: 'NT$50,745' }
    },
    /* 對照 neon-gift-box：可售 0（pillow 售罄） */
    'nick-soldout-set': {
      id: 'nick-soldout-set', persona: 'nick', name: '24CE 紀念禮盒', img: '24ce-skateboard-01.jpg',
      description: 'WYAGL 抱枕＋Dupont Bag 的紀念禮盒。',
      members: [{ productId: 'wy-24ce-pillow' }, { productId: 'wy-24ce-dupont-bag' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null,
      sales: { units: 30, gross: 'NT$79,800', net: 'NT$67,830' }
    },
    /* 對照 winter-preorder-set：即將開賣、限量 100、常態折扣 15%；尚無銷售 */
    'nick-preorder-set': {
      id: 'nick-preorder-set', persona: 'nick', name: '冬季預購組', img: '26ms-hoodie-01.jpeg',
      description: '26MS Hoodie＋刺繡 Logo 老帽，11 月開放預購。',
      members: [{ productId: 'wy-26ms-hoodie' }, { productId: 'wy-bundle-cap' }],
      cap: 100, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: '2026-11-01T12:00:00', saleEnd: null, lowThreshold: 0,
      discountPct: 15, discount: null,
      sales: null
    },
    /* 對照 tour-recap-set：販售結束；被 1 個項目引用 */
    'nick-recap-set': {
      id: 'nick-recap-set', persona: 'nick', name: '白趴回顧組', img: '26ms-t-shirt-w-02.jpeg',
      description: '白趴收官紀念：26MS 白 Tee＋襪子。',
      members: [{ productId: 'wy-26ms-tshirt-white' }, { productId: 'wy-26ms-socks' }],
      cap: null, listed: true, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: '2026-08-20T23:59:00', lowThreshold: 0,
      discountPct: null, discount: null,
      sales: { units: 60, gross: 'NT$144,000', net: 'NT$122,400' },
      projects: [{ titleKey: 'product-detail.ref.row1', href: 'create-project.html' }]
    },
    /* 對照 internal-test-set：已下架 */
    'nick-internal-set': {
      id: 'nick-internal-set', persona: 'nick', name: '內部測試組', img: 'wyagl-cap-generated.webp',
      description: '內部測試用，不對外。',
      members: [{ productId: 'wy-bundle-cap' }, { productId: 'wy-bundle-lowtop-sneakers' }],
      cap: null, listed: false, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null, sales: null
    },
    /* 對照 draft-set：草稿 */
    'nick-draft-set': {
      id: 'nick-draft-set', persona: 'nick', name: '新組合', img: null,
      description: '',
      members: [{ productId: 'wy-26ms-tshirt-red' }, { productId: 'wy-26ms-socks' }],
      cap: null, listed: false, listAt: null, unlistAt: null,
      shown: true, privateLink: null, saleStart: null, saleEnd: null, lowThreshold: 0,
      discountPct: null, discount: null, draft: true
    }
  };
  function seedBundle(b) {
    if (!b) return b;
    if (b.discountPct === undefined) b.discountPct = null;
    if (b.discount === undefined) b.discount = null;
    if (b.description === undefined) b.description = '';
    if (b.img === undefined) b.img = null;
    if (!b.films) b.films = [];
    if (!b.projects) b.projects = [];
    if (b.sales === undefined) b.sales = null;
    if (!b.history) b.history = [];
    if (b.draft === undefined) b.draft = false;
    if (b.lockSets === undefined) b.lockSets = null;   /* 鎖定套數（2026-09-11）：null＝不鎖定 */
    if (!b.alloc) b.alloc = {};
    /* 封存（2026-09-18 · D284）：archived 預設 false；封存必然下架。unlistReason＝被「一同下架」時記的原因 */
    if (b.archived === undefined) b.archived = false;
    if (b.archived) b.listed = false;
    if (b.unlistReason === undefined) b.unlistReason = null;
    applySession(b);
    return b;
  }
  Object.keys(BUNDLE_SEED).forEach(function (k) { seedBundle(BUNDLE_SEED[k]); });

  /* 目前在庫：數位商品與 stock 為 ∞ 的一律 'unlimited'，其餘取現有庫存數。
     限量版本（edition==='limited'）的 stock 本來就是「還剩幾件」，直接當目前在庫。 */
  function poolTotal(p) {
    if (p.cat === 'digital' || p.stock === '∞' || p.stock === undefined) return 'unlimited';
    var n = Number(p.stock);
    return isNaN(n) ? 'unlimited' : n;
  }

  function seedListing(id, p) {
    if (p.pool) return p;                       /* 同一筆記錄被兩個 persona 共用時只補一次 */
    var s = LISTING_SEED[id] || {};
    p.id = p.id || id;
    /* 封存（2026-09-18 · D284）：archived＝true 時總閘門一律關上、排程清空（封存必然下架、封存時取消未生效的上架排程） */
    p.archived = !!s.archived;
    p.listed = p.archived ? false : ((s.listed !== undefined) ? s.listed : true);
    p.listAt = p.archived ? null : (s.listAt || null);
    p.unlistAt = p.archived ? null : (s.unlistAt || null);
    p.shown = (s.shown !== undefined) ? s.shown : true;
    p.privateLink = p.shown ? null : (s.privateLink || null);
    p.saleStart = s.saleStart || null;
    p.saleEnd = s.saleEnd || null;
    p.lowThreshold = Number(s.lowThreshold !== undefined ? s.lowThreshold : (p.threshold || 0)) || 0;
    p.pool = {
      total: (s.total !== undefined) ? s.total : poolTotal(p),
      locks: {
        single: (s.locks && s.locks.single !== undefined) ? s.locks.single : null,
        bundles: (s.locks && s.locks.bundles) ? s.locks.bundles : {}
      }
    };
    /* 逐選項組合鎖定（D255／D258，2026-09-11）：多選項商品的鎖定住在 variants[i].locks，商品層的 pool.locks
       改由各組合加總得出（某管道只要有任一組合設了鎖定，商品層就視為該管道鎖定模式、量＝加總；
       全部沒設就是 null）。這樣只讀商品層的頁面（product-detail 的頁首徽章走 channelQty(pool)、
       e-shop 的 qtyOf）與讀 variants 的頁面（庫存管理表、bundle-detail 的分配表）算出同一個數字。
       兩者同時寫時以 variants 為準（LISTING_SEED 的商品層值會被蓋掉）。 */
    if (p.variant === 'multiple' && (p.variants || []).length && p.variants.some(function (v) { return v && v.locks; })) {
      var sum = function (ch) {
        var any = false, n = 0;
        p.variants.forEach(function (v) {
          var l = v.locks || {};
          var val = (ch === 'single') ? l.single : (l.bundles || {})[ch];
          if (val === undefined || val === null || val === '') return;
          any = true; n += Number(val) || 0;
        });
        return any ? n : null;
      };
      var ids = {};
      p.variants.forEach(function (v) { Object.keys((v.locks && v.locks.bundles) || {}).forEach(function (k) { ids[k] = true; }); });
      p.pool.locks = { single: sum('single'), bundles: {} };
      Object.keys(ids).forEach(function (k) { p.pool.locks.bundles[k] = sum(k); });
    }
    /* 詳情頁示範欄位：DETAIL_SEED 有就用，沒有就是空狀態（欄位定義見檔頭） */
    var d = DETAIL_SEED[id] || {};
    var pick = function (f, fallback) { return d[f] !== undefined ? d[f] : (p[f] !== undefined ? p[f] : fallback); };
    p.sales = pick('sales', null);
    p.discount = pick('discount', null);
    p.limit = pick('limit', null);
    p.films = pick('films', []);
    p.projects = pick('projects', []);
    p.tags = pick('tags', []);
    p.history = pick('history', []);
    p.draft = pick('draft', false);
    applySession(p);
    return p;
  }

  Object.keys(DATASETS).forEach(function (personaId) {
    var set = DATASETS[personaId];
    Object.keys(set).forEach(function (id) { seedListing(id, set[id]); });
  });
  /* 工作階段裡已刪除的販售管道（D307）：seed 補完後從三個資料集拿掉，之後的連動、清單、細節頁都看不到它 */
  purgeDeleted();

  /* ── 定時下架到期的自動連動（2026-09-18 · D288 裁決二後半，§7.14「下架確認與組合包連動」）──
     原型沒有排程器：載入時檢查一次——成員單售的 unlistAt 已過而它所在的組合包還上架中，就把那個組合包一併下架、
     記 unlistReason（auto:true）並寫進工作階段覆蓋。判斷在 ListingState.scheduledUnlistCascade（純函式），
     這裡只餵當前 persona 的組合包與商品。結果留在 AUTO_UNLISTED 給通知或 banner 讀（通知中心目前是靜態示範，
     見 sidebar.js NOTIF_INFO 的 notif.auto-unlist）。 */
  var AUTO_UNLISTED = [];
  function runScheduledCascade() {
    var L = (typeof window !== 'undefined' && window.ListingState) || LS;
    if (!L || !L.scheduledUnlistCascade) return;
    var map = active();
    var hits = L.scheduledUnlistCascade(bundlesOfPersona(), function (id) { return map[id] || null; });
    hits.forEach(function (h) { commit(h.bundle); });
    AUTO_UNLISTED = hits;
    /* D290：定時下架到期的東西真的下架一次（清四個時間、退回未開賣）並寫進工作階段——在連動之後跑，
       連動要靠「成員 listed 且 unlistAt 已過」找觸發者。商品、組合包、拍賣三種都跑。 */
    if (L.expireScheduled) {
      var products = Object.keys(map).map(function (id) { return map[id]; });
      var auctions = Object.keys(AUCTION_SEED).map(function (k) { return seedAuction(AUCTION_SEED[k]); });
      L.expireScheduled(products.concat(bundlesOfPersona(), auctions)).forEach(commit);
    }
  }

  /* ── 對外 API（新頁面一律走這裡，別再自己算）────────────────────────────
     statusOf(product, channel)  單售或某個組合包視角的主徽章狀態
     flagsOf(product, channel)   細節頁用：{ status, hidden } 兩顆徽章
     qtyOf(product, channel)     該管道可售量
     bundleStatusOf(bundle)      組合包的主徽章狀態（可售量＝成員最小值再與 cap 取最小）
     bundlesUsing(productId)     哪些組合包含這件商品（算「所有管道都鎖定了嗎」用） */
  function ls() { return LS || (typeof window !== 'undefined' && window.ListingState) || null; }
  /* 這個組合屬於當前 persona 嗎（userB 視同 default） */
  /* 成員商品身上的組合鎖定是導出值（2026-09-11 鎖定套數規則）：第一次取用商品時，把這個 persona 底下
     每一個含它的組合的 lockSets／alloc 寫進 pool.locks.bundles／variants[i].locks.bundles（唯一寫入口是
     ListingState.applyBundleLock；組合詳情頁改 N 時也走它，改完數字即時生效）。 */
  function applyBundleLocks(p) {
    var L = ls();
    if (!p || !L || !L.applyBundleLock || p._bundleLocksApplied) return p;
    p._bundleLocksApplied = true;
    var map = {}; map[p.id] = p;
    bundlesOfPersona().forEach(function (b) {
      if ((b.members || []).some(function (m) { return m.productId === p.id; })) L.applyBundleLock(b, map);
    });
    return p;
  }
  function bundleBelongs(b) {
    var pid = persona() === 'nick' ? 'nick' : 'default';
    return !!b && b.persona === pid;
  }
  function bundlesOfPersona() {
    var out = [], k;
    for (k in BUNDLE_SEED) {
      if (!Object.prototype.hasOwnProperty.call(BUNDLE_SEED, k)) continue;
      if (bundleBelongs(BUNDLE_SEED[k])) out.push(BUNDLE_SEED[k]);
    }
    return out;
  }
  window.ProductsStore = {
    all: function () { return active(); },
    /* 工作階段覆蓋（D288）：狀態轉移後呼叫 commit(entity) 記住；forgetSession() 回到 seed（cheat code Reset 也會呼叫） */
    commit: commit,
    forgetSession: forgetSession,
    /* 零成交可刪除（D307）：remove(entity) 標 deleted、自 store 拿掉、記進工作階段；deleteBlockers(productId)＝這件單售仍在哪些組合包裡
       （不論那些組合包上架／下架／封存，草稿不算）；canDelete／hasSales 直接轉問 ListingState */
    remove: removeEntity,
    deleteBlockers: function (productId) {
      var L = ls(); if (!L || !L.deleteBlockers) return [];
      return L.deleteBlockers(productId, window.ProductsStore.bundlesUsing(productId));
    },
    canDelete: function (e, now) { var L = ls(); return !!(L && L.canDelete && L.canDelete(e, now)); },
    hasSales: function (e) { var L = ls(); return !!(L && L.hasSales && L.hasSales(e)); },
    /* 載入時自動連動的結果 [{ bundle, product }]（定時下架到期→組合包一併下架） */
    autoUnlisted: function () { return AUTO_UNLISTED.slice(); },
    get: function (id) { var p = active()[id]; return p ? applyBundleLocks(seedListing(id, p)) : null; },
    bundles: bundlesOfPersona,
    getBundle: function (id) { return BUNDLE_SEED[id] || null; },
    bundlesUsing: function (productId) {
      return bundlesOfPersona().filter(function (b) {
        return (b.members || []).some(function (m) { return m.productId === productId; });
      });
    },
    /* 下架前的連動清單（§7.14「下架確認與組合包連動」· D288；D284 時掛在封存）：這件單售仍是哪些「上架中」組合包的成員；
       已下架／已封存／草稿的組合包不算。判斷在 ListingState.listedBundlesUsing，這裡只把當前 persona 的組合包餵進去。 */
    unlistBlockers: function (productId) {
      var L = ls(); if (!L || !L.listedBundlesUsing) return [];
      return L.listedBundlesUsing(productId, window.ProductsStore.bundlesUsing(productId));
    },
    /* 組合包重新上架（D288 裁決三＋D289）：先用 relistPlan 盤點——blocked（已封存／草稿）非空要擋下；unlisted 非空要先確認
       「這些單售會一起重新上架」；確認後呼叫 relistBundle：已下架成員連帶 relist、組合包 relist，全部寫進工作階段。 */
    relistPlan: function (bundle) {
      var L = ls(); if (!L || !L.bundleRelistPlan) return { unlisted: [], blocked: [] };
      var map = active();
      return L.bundleRelistPlan(bundle, function (id) { return map[id] || null; });
    },
    relistBundle: function (bundle) {
      var L = ls(); if (!L || !L.relistBundle) return { ok: true, blockers: [], relisted: [] };
      var map = active();
      var r = L.relistBundle(bundle, function (id) { return map[id] || null; });
      if (r.ok) { commit(bundle); r.relisted.forEach(commit); }
      return r;
    },
    /* 拍賣（2026-09-18 · D285）：三開關記錄，兩個 persona 共用；狀態一律問 ListingState 的拍賣版推導 */
    getAuction: function (id) { return id && AUCTION_SEED[id] ? seedAuction(AUCTION_SEED[id]) : null; },
    auctions: function () { return Object.keys(AUCTION_SEED).map(function (k) { return seedAuction(AUCTION_SEED[k]); }); },
    auctionStatusOf: function (a, now) { var L = ls(); return (L && a) ? L.deriveAuctionStatus(a, now) : 'live'; },
    auctionFlagsOf: function (a, now) { var L = ls(); return (L && a) ? L.deriveAuctionFlags(a, now) : { status: 'live', hidden: false }; },
    qtyOf: function (product, channel) {
      var L = ls(); return L ? L.channelQty(product, channel || 'single') : Infinity;
    },
    statusOf: function (product, channel, now) {
      var L = ls(); if (!L || !product) return 'live';
      return L.deriveStatus(product, { qty: L.channelQty(product, channel || 'single'), lowThreshold: product.lowThreshold }, now);
    },
    flagsOf: function (product, channel, now) {
      var L = ls(); if (!L || !product) return { status: 'live', hidden: false };
      return L.deriveFlags(product, { qty: L.channelQty(product, channel || 'single'), lowThreshold: product.lowThreshold }, now);
    },
    bundleQtyOf: function (bundle) {
      var L = ls(); return L ? L.bundleQty(bundle, active()) : Infinity;
    },
    bundleStatusOf: function (bundle, now) {
      var L = ls(); if (!L || !bundle) return 'live';
      return L.deriveStatus(bundle, { qty: L.bundleQty(bundle, active()), lowThreshold: bundle.lowThreshold }, now);
    },
    /* 選項組合的縮圖（2026-09-11 · D268 每個選項組合各一張商品圖，選填、沒給就沿用商品主圖）。
       站上凡是列出組合的表都用這一個函式產列首那顆 34px 直式縮圖，語彙只有一套：
       實線（.variant-thumb--own）＝這個組合自己的圖、虛線＝沿用主圖；沒有任何圖時放一個 image icon。
       預設產唯讀版（<span>.variant-thumb--ro，不可點）——只有建立商品流程與商品細節頁的編輯彈窗能改圖，
       那兩處自己產 <button>（見 create-product.html／product-detail.html）。
       圖值可以是檔名（images/products/ 下）或已經是完整路徑／data URL（頁內上傳的結果）。 */
    variantImgSrc: function (product, variant) {
      var own = variant && variant.img;
      var v = own || (product && product.img) || '';
      if (!v) return '';
      return /^(data:|blob:|https?:|\/|images\/)/.test(v) ? v : 'images/products/' + v;
    },
    variantThumb: function (product, variant, opts) {
      opts = opts || {};
      var own = !!(variant && variant.img);
      var src = window.ProductsStore.variantImgSrc(product, variant);
      var label = String(opts.label || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
      var cls = 'variant-thumb' + (own ? ' variant-thumb--own' : '') + ' variant-thumb--ro';
      return '<span class="' + cls + '"' + (label ? ' title="' + label + '"' : '') + ' aria-hidden="true">'
        + (src ? '<img class="variant-thumb__img" alt="" src="' + src.replace(/"/g, '&quot;') + '">' : '<i data-lucide="image" class="ztor-icon"></i>')
        + '</span>';
    }
  };

  var P = active();
  window.ZTOR_PRODUCTS = P;
  // 由 ?id 取商品；找不到回 null（頁面自帶預設 zine）。
  window.ztorGetProduct = function (id) { return (id && P[id]) ? P[id] : null; };
  /* ── 組合的展示資料（2026-09-11 改制，兩個 persona 都可用）──────────────────────
     ztorGetBundle(id)：從 BUNDLE_SEED[id]（persona 要對上當前 persona）＋成員商品記錄推導展示資料。
     沒帶 id 時回當前 persona 的第一筆（舊行為：nick 的選物四件組）。回傳＝seed 的淺拷貝再加：
       memberItems  [{ id, name, meta, price, img }]   成員清單（price 為顯示字串；meta＝次分類 · 單價）
       membersText  string                              e-shop 清單用的「成員名 + … · N 件」（件數走 i18n）
       baseAmount   number                              成員原價合計（草稿成員沒有定價＝0）
       priceAmount  number                              售價＝baseAmount ×(1 − discountPct/100)（nick 取整數、default 到分）
       price        string                              priceAmount 的顯示字串（幣別依 persona：default $、nick NT$）
       basePrice    string                              baseAmount 的顯示字串（有折扣時頁面畫成刪除線原價）
       currency     'USD' | 'TWD'
       stockAvail   number | Infinity                   組合可售量（ListingState.bundleQty）
       stockCap     number | null                       ＝seed.cap（給 e-shop 列的 data-stock-cap）
     store.getBundle(id) 維持回 seed 本體（頁面改三開關時直接寫它）。 */
  function moneyOfPersona(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    if (persona() === 'nick') return 'NT$' + Math.round(n).toLocaleString('en-US');
    return '$' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
  }
  function priceAmountOf(p) {
    var n = Number(String(p && p.price != null ? p.price : '').replace(/[^0-9.]/g, ''));
    return isFinite(n) ? n : 0;
  }
  /* 商品價格區間：多選項商品逐組合可有自己的 price（沒有就用商品價），取 min／max（同 product-detail 的 priceRange）。 */
  function priceRangeOf(p) {
    var base = priceAmountOf(p);
    var vals = (p && p.variants || []).map(function (v) { var n = Number(String(v.price != null && v.price !== '' ? v.price : base).replace(/[^0-9.]/g, '')); return isFinite(n) ? n : base; });
    if (!vals.length) return { lo: base, hi: base };
    return { lo: Math.min.apply(null, vals), hi: Math.max.apply(null, vals) };
  }
  window.ztorGetBundle = function (id) {
    var seed = null;
    if (id == null) seed = bundlesOfPersona()[0] || null;
    else if (BUNDLE_SEED[id] && bundleBelongs(BUNDLE_SEED[id])) seed = BUNDLE_SEED[id];
    if (!seed) return null;
    var products = active();
    var memberItems = (seed.members || []).map(function (m) {
      var p = products[m.productId];
      if (!p) return { id: m.productId, name: m.productId, meta: '', price: '—', img: '' };
      return {
        id: p.id || m.productId, name: p.name,
        meta: (p.subLabel ? bilingual(p.subLabel, ' · ') + ' · ' : '') + priceText(p),
        price: priceText(p), img: p.img || '',
        /* 2026-09-21（D295）：多選項成員在細節頁成員列標「規格由粉絲購買時選」 */
        multi: p.variant === 'multiple' && (p.variants || []).length > 0
      };
    });
    var baseAmount = (seed.members || []).reduce(function (n, m) { return n + priceAmountOf(products[m.productId]); }, 0);
    /* 成員含多選項多價格時，合計與售價都是區間（2026-09-11 使用者：「組合價格，如果是多選項多價格商品就應該是一個區間」） */
    var baseHi = (seed.members || []).reduce(function (n, m) { return n + priceRangeOf(products[m.productId]).hi; }, 0);
    var pct = Number(seed.discountPct) || 0;
    var roundP = function (n) { return persona() === 'nick' ? Math.round(n) : Math.round(n * 100) / 100; };
    var priceAmount = roundP(baseAmount * (1 - pct / 100));
    var priceHi = roundP(baseHi * (1 - pct / 100));
    var rangeText = function (lo, hi) { return lo === hi ? moneyOfPersona(lo) : moneyOfPersona(lo) + '–' + moneyOfPersona(hi).replace(/^(NT\$|\$)/, ''); };
    var L = ls();
    var stockAvail = L ? L.bundleQty(seed, products) : Infinity;
    var names = memberItems.map(function (it) { return it.name; }).join(' + ');
    var countText = (tr('e-shop.bundle.members.n') || '{n} items').replace('{n}', String(memberItems.length));
    return Object.assign({}, seed, {
      memberItems: memberItems,
      membersText: names ? (names + ' · ' + countText) : countText,
      memberNames: memberItems.map(function (it) { return it.name; }),
      baseAmount: baseAmount, baseHi: baseHi, basePrice: rangeText(baseAmount, baseHi),
      priceAmount: priceAmount, priceHi: priceHi, price: rangeText(priceAmount, priceHi),
      currency: persona() === 'nick' ? 'TWD' : 'USD',
      stockAvail: stockAvail, stockCap: (seed.cap === undefined) ? null : seed.cap
    });
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
  /* 2026-09-11：「待確認」佔位值退場——發布前必填的欄位不可留佔位（使用者裁示），示範資料已全部補上定價。 */
  function priceText(p) {
    var raw = String(p.price).replace(/\.00$/, '');
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
          var p = active()[id];
          /* 草稿商品不另外產列：e-shop 既有的草稿列（data-status="draft"）改連到它，見下方 */
          if (!p || p.draft) return;
          var row = template.cloneNode(true);
          row.setAttribute('data-wishyou-id', id);
          row.setAttribute('data-type', p.cat === 'digital' ? 'digital' : 'physical');
          row.setAttribute('data-name', p.name);
          if (draft) panel.insertBefore(row, draft); else panel.appendChild(row);
        });
        /* 草稿列（2026-09-11）：nick 下連到真的草稿商品 wy-draft-tote（預設 persona 的草稿列由 e-shop.html 寫死 ?id=sticker）。
           草稿列的價格／規格／庫存欄本來就是「—」，下面的迴圈只換連結與標題、不動其餘欄位。 */
        if (draft) {
          var dp = active()['wy-draft-tote'];
          var dl = draft.querySelector('.product-list__actions a[href*="create-product.html"], .product-list__actions a[href*="product-detail.html"]');
          if (dp && dl) dl.setAttribute('href', 'product-detail.html?id=wy-draft-tote');
        }
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
      if (row.getAttribute('data-status') === 'draft') { row.setAttribute('data-name', p.name); return; }
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
        meta.removeAttribute('data-i18n');
        meta.textContent = (p.options && p.options.length)
          ? p.options.map(function (o) {
              /* o.name 是 'Colour / 顏色' 這種雙語字串——取對應語言那一邊，
                 括號也跟著語系走（中文全形、英文半形）。 */
              return paren(bilingual(o.name, ' / '), o.values.join('/'));
            }).join(' × ')
          : tr('e-shop.variant.single');
      } else if (meta && p.cat === 'digital') {
        /* 數位商品的規格副標依內容形態走 key（nick 的數位商品列是從實體列複製來的，不換會留著「單一選項」） */
        var mk = 'e-shop.meta.digital.' + (p.content || 'document');
        meta.setAttribute('data-i18n', mk); meta.textContent = tr(mk);
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
  /* 定時下架到期的自動連動在所有 seed 補完之後跑一次（D288）；ListingState 已於本檔之前載入 */
  runScheduledCascade();

  function patchAll() { pruneDeletedRows(); patchEshopList(); patchBundlesAndAuctions(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchAll);
  } else { patchAll(); }
  document.addEventListener('i18n:applied', patchAll);
})();
