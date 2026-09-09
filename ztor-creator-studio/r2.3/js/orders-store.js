/* orders-store.js · 訂單 demo 資料的單一來源（2026-08-07）
   ------------------------------------------------------------------
   在此之前，訂單清單（orders.html）的四列寫死在 HTML，而 order-detail.html 是
   一份與清單無關的寫死樣本（#ZT-10482）；清單「點任何一列」都導到同一個網址、
   不帶訂單編號，所以從純數位訂單 #ZT-10481 點進去看到的是別人的資料，狀態自然
   對不上（清單寫「已交付」、明細的出貨彈窗講的卻是實體物流）。

   本檔把訂單資料收成一份，清單與明細同吃：
     · orders.html        依 list() 產生列，列上帶 data-order-id，點列 → order-detail.html?id=<id>
     · order-detail.html  依 ?id= 讀 get(id)；沒帶 id 用 first()；查無 id 顯示查詢失敗

   ── 狀態語言（規格 0-設計規格書 §7.2「訂單」列，2026-09-09 隨 D253 改寫）──────
     待付款（Unpaid）／已付款（Paid）／待出貨（To Ship）／已出貨（Shipped）／
     已完成（Completed）／爭議（Disputed）／已取消（Cancelled）
   ⚠ 本軸沒有「已退款（Refunded）」（D253）：平台不提供任何退款動作，退款一律發生在
     平台外且必先於作廢，兩件事永遠成對發生，故用「已取消」單一狀態表達。
   兩條軸不混用（5.1.5.3.1 §2.2／PCR-001）：
     pay      付款・結算軸：unpaid | paid | disputed | cancelled（§7.2 規定單筆訂單
              只屬其中一個值，所以這是單值不是陣列；cancelled＝所有品項皆已作廢的
              終態，取代原本的 refunded，見 isCancelled()）
     fulfil   履約軸：toship | pickup | shipped | completed（可並列，混合訂單兩顆）
              待付款訂單還沒有履約動作，故 fulfil 為空陣列，兩處畫面都以「—」呈現；
              訂單進 cancelled 終態後履約也不會再發生，同樣以「—」呈現（見消費頁）。
   ⚠ 舊原型用過的「Delivered／已交付」不在 §7.2 的狀態表內，2026-08-07 統一收回
     「已完成（Completed）」，不再有第三個說法。

   ── 履約型態 kind（決定明細頁怎麼呈現，5.1.5.3.1 §2.5 區塊狀態）──────
     shipping  含實體物流：出貨彈窗顯示物流商＋追蹤碼（同一單併有數位品項也算這型，
               因為這張單確實要寄一件實體物出去）
     mixed     物流＋現場 QR 領取：同上，取貨品項在品項列顯示待取貨與場次入口
     pickup    純現場 QR 領取：§2.5「純取貨訂單不顯示物流商／追蹤碼欄位，改引導至
               取貨管理」，核銷在 pickup.html 的場次 scanner
     digital   純數位：無實體物流，改呈現數位交付狀態，不顯示物流商／追蹤碼

   ── 2026-08-07 第二輪：把 demo 資料補到蓋滿狀態矩陣（使用者裁示）──────
   原本只有四筆（混合／純數位／爭議／已出貨），七個篩選頁籤裡的「待付款」是空的，
   純現場取貨、實體＋數位同單、部分退款、多品項這幾種也都沒有樣本。補到 12 筆，
   目標是「每個頁籤點下去都有結果、每種履約組合都看得到」，不是筆數愈多愈好。
   世界觀沿用站上既有的港片素材（九龍夜行／海上霸姬）與 js/products-store.js 的商品名；
   買家名沿用既有的「名＋姓氏縮寫」寫法。品項名走 i18n key，所以周湯豪 persona
   切過去時由 js/i18n.js 的 PERSONA_DICT.nick 覆蓋成他自己的作品衍生物。

   ── 金額口徑 ────────────────────────────────────────────────────
   金額為 demo 示意值，口徑仍以收入管理（Earnings）為準、明細頁不重算（§2.3.2）。
   每一筆都照同一條算式，隨手抽一筆都驗得平：
     商品金額（goods）＝各品項小計加總
     平台費（platform）＝商品金額 × 15%（§7.6 一般商品費率）
     支付費（payment） ＝商品金額 × 2.4%（§7.6 全站支付費）
     淨額（net）       ＝商品金額 ＋ 運費 － 平台費 － 支付費
   #ZT-10482 原本寫死的支付費是 −$1.30（＝2.32%，與 2.4% 對不上），本輪一併更正為
   −$1.34、淨額 $51.26，讓 12 筆共用同一條算式。

   ── 買家付款幣別 fx（2026-08-07）─────────────────────────────────
   商店結算幣別是 USD。買家用別的幣別付款時 fx 帶原幣金額與匯率，明細頁的金額拆解
   就多出「買家實付」一列（§2.3.2「跨幣別需顯示原幣、換算幣、匯率與時點」）；同幣別
   訂單 fx 為 null，那一列整條不產生（規格明文：同幣別訂單不顯示此列）。
   12 筆裡只有 #ZT-10482 是跨幣別（TWD），其餘 11 筆同幣別——兩種情況都看得到。

   ── 領取單位（Pickup unit）資料層（2026-09-03，使用者裁決 D240）─────────────
   定義權威在 documents/0-設計規格書.md §7.2「領取單位（Pickup unit）的正式定義」，
   本檔只落地：每個 mode:'pickup' 品項新增 units［長度＝qty］，元素含 code／status／
   at／session；status 四值 pending（待核銷）｜done（已核銷）｜unset（取貨場次待設定，
   商品未綁場次時 session 為 null）｜void（Admin 作廢，領取碼即刻失效）。組合商品
   品項 mode:'bundle'，members 展開成成員商品的領取單位（成員 qty × 組合 qty），
   組合本身不產生碼；成員 units 多帶 from 標記來源組合，mode:'ship' 的成員沒有 units
   （依裁決二）。
   #ZT-10482（Mika L.）藉這輪追加一顆組合品項「Launch night bundle」示範混合取貨，
   goods／platform／payment／net／total／fx 一併重算（142.00 / −21.30 / −3.41 /
   125.29 / 142.00 / NT$4,725.00），與本節開頭「金額口徑」同一條算式；上方 2026-08-07
   的舊註解（$56.00 系列數字）是那一輪的歷史記錄，不再是這筆訂單的現況。
   輔助函式 unitsOf(order)／unitSummary(item) 掛在 window.ztorOrders，供
   scanner.html／pickup-detail.html／order-detail.html 之後接這份資料層時使用。

   ── 作廢即失效（2026-09-03 D242，2026-09-09 隨 D253 收斂觸發源）───────────
   裁決見 documents/decisions.md D242／D253：Admin 作廢訂單品項時，該品項展開的全部
   領取單位轉 void、領取碼即刻失效、不可再核銷；作廢的若是組合品項，只有被作廢成員的
   單位失效，其餘成員不受影響。**唯一觸發源是 Admin 作廢**（D253 收斂 D242 原本「退款
   成立」與「作廢」兩個觸發源為一個——平台不再提供退款動作，退款一律先發生在平台外，
   系統只承接完成後的作廢動作）。demo 訂單落地這條規則：
     #ZT-10471（Yuki H.）── 同一訂單裡一個品項已作廢失效、另一個品項仍可領的最小對照：
       vinyl（PU-10471-01）因作廢轉 void，cap（PU-10471-02）不受影響仍待核銷。
     #ZT-10473（Jonas P.）── 組合的部分成員被作廢：「Launch night bundle」的 cap 成員
       兩件都轉 void（PU-10473-01／02），vinyl 成員（PU-10473-03）不受影響仍待核銷。
       「是否允許只作廢組合中的部分成員」屬 D242 未定清單第 1 項（隨 D253 改指作廢），
       本檔只落地「若發生，對應到哪些單位」這條已裁決規則。
   unitSummary(item) 回傳新增 voided／unset 兩個計數（見下方定義）：total／done 意義
   不變，voided＝已因作廢失效的件數、unset＝取貨場次待設定的件數；pending（待核銷）＝
   total − done − voided − unset，未另開欄位。三個消費頁共用同一口徑：**voided 的件
   不算進待核銷**（規格 5.1.5.3.1 §2.3.1／5.1.5.15 F4.1）。

   ── 作廢明細（Void，2026-09-08 D252 建立，2026-09-09 隨 D253 擴大範圍）──────
   定義權威在 documents/5.1.5.3.1-訂單詳情.md 與 0-設計規格書.md §7.2；本檔只落地：
     · 作廢以「品項（訂單明細）」為單位，逐筆執行，Admin 專屬（Creator 與買家不能作廢）。
     · 可作廢條件＝該品項尚未完成履約，且尚未作廢。「未完成履約」依品項型態各自判準
       （D253 推翻 D252 原本僅取貨型可作廢的限制）：
         取貨型（含組合內的取貨成員）── 所有領取單位皆未核銷（沒有任何一件 status
           === 'done'）。
         出貨型（mode:'ship'）── 所屬訂單尚未標記出貨（shipStage 不是 shipped／
           completed）。demo 資料裡出貨型品項沒有自己的狀態欄位，讀訂單層的履約軸。
         數位（mode:'digital'）── 尚未交付，判準是訂單層 delivery.on 是否有日期。
           即時下載型的數位訂單付款當下就交付完成（有 delivery.on）＝終態不可作廢；
           預購／尚未發布的數位商品沒有 delivery.on＝未完成履約、可作廢（樣本見
           #ZT-10488）。
     · 作廢效果＝有領取單位的品項（取貨型／含取貨成員的組合），其展開的全部領取單位
       status → 'void'，領取碼即刻失效；沒有領取單位的品項（出貨型、數位、全為 ship
       成員的組合）改在品項自己身上記 `voided: true` ＋ `voidedAt`。兩種記法的終態
       意義相同，只是資料形狀不同（有沒有領取碼可以失效）。
     · 訂單層＝所有品項皆已作廢時，訂單進終態「已取消（Cancelled）」；否則訂單狀態不變、
       只有品項層顯示已取消。這個值是**衍生**的（isCancelled(order)），不是第三條狀態軸——
       fulfil 軸的語意不動（PCR-001）；pay 軸則依 D253 把 cancelled 當作 unpaid／paid／
       disputed 之外的第四個值，o.cancelled 是把這個衍生結果快取起來給清單與明細頁用。
     · 原型不做的事：庫存回補與「訂單已取消」email **由後端執行**，本原型只在確認彈窗
       提示會發生；作廢也不呼叫 Stripe——人工退款是營運人員在 Stripe 後台（平台外）先做完
       的前置，平台不處理任何金流。
   demo 資料（都在下方 ORDERS 內）：
     #ZT-10467 部分品項已作廢——黑膠整項作廢、帽子仍可領，訂單狀態不變（pay 仍 paid）。
     #ZT-10466 全部品項已作廢——單品與組合成員全數失效，訂單進「已取消」（pay 改
       cancelled）。
   2026-09-09 D253 改寫前，本節與下一節原本各自描述「退款即失效」與「作廢明細」兩條
   相關但獨立的規則，並各自留了對照 demo；D253 把兩者收斂成一個模型（作廢是唯一觸發
   源），原本 6 筆 `pay:'refunded'` 的 demo 訂單一併改寫——見下方 ORDERS 各筆的行內
   註記（上游規格改動的原文備份於 documents/backup_plan.md Plan305；本檔屬呈現層，
   改寫前後的差異只留在本檔行內註記與 git 歷史）。
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  /* 取貨場次代號：沿用 pickup.html 既有示範場次（data-pk-url 的 tpe-signing-7f3a2），
     單一來源、不在各筆訂單重複硬寫字串。 */
  var PICKUP_SESSION = 'tpe-signing-7f3a2';

  /* 幣別模型（2026-08-07 使用者裁決 A）：商店結算幣別＝USD，買家在台灣、以 TWD 付款，
     所以跨幣別是常態而非例外——12 筆裡 11 筆有 fx。刻意留兩個對照：
       ZT-10470 買家在舊金山（USD）＝同幣別，fx 為 null，驗證「同幣別不產生換算列」（§2.3.2）
       ZT-10469 純數位、無寄送地址的海外買家（JPY），讓幣別不只一種
     fx.paid ＝（商品金額＋運費）× 匯率，與該筆 amounts 自洽。 */
  var ORDERS = [
    {
      /* 待付款：尚未付款，所以還沒有任何履約動作（fulfil 空）。明細頁的「標記出貨」
         主操作對這種訂單停用——規格 5.1.5.3.1 §4 情境 1 是「確認付款後」才出貨。 */
      id: 'ZT-10486', date: '2026-06-09', kind: 'shipping',
      pay: 'unpaid', fulfil: [],
      text: 'zt-10486 nina 九龍夜行 連帽外套 kowloon after dark hoodie',
      buyer: {
        name: 'Nina P.',
        shipTo: 'No. 45, Ln 8, Sec. 1, Xinsheng S. Rd, Taipei 106, TW',
        contact: 'nina.p@example.com'
      },
      items: [
        {
          nameKey: 'od.item5.name', name: 'Kowloon After Dark hoodie (L)',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$58.00', amt: 58, mode: 'ship',
          snap: {
            price: '$58.00', variant: 'L',
            desc: 'Brushed-fleece hoodie with an embroidered neon-sign mark. Unisex fit.',
            manage: 'product-detail.html?id=hoodie'
          }
        }
      ],
      amounts: { goods: '$58.00', shipping: '$5.00', platform: '−$8.70', payment: '−$1.39', net: '$52.91' },
      total: '$58.00', totalAmt: 58,
      fx: { currency: 'TWD', paid: 'NT$1,984.50', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 多品項（4 列）＋待出貨：清單的品項摘要與明細頁的品項表都要撐得住多列 */
      id: 'ZT-10485', date: '2026-06-09', kind: 'shipping',
      pay: 'paid', fulfil: ['toship'],
      text: 'zt-10485 theo 幕後寫真誌 紀念 t 恤 六片帽 琺瑯徽章 zine tee cap pin',
      buyer: {
        name: 'Theo K.',
        shipTo: '3F, No. 210, Sec. 3, Roosevelt Rd, Taipei 100, TW',
        contact: 'theo.k@example.com'
      },
      items: [
        {
          nameKey: 'od.item1.name', name: 'Pirate Queen zine vol. 02',
          catKey: 'e-shop.cat.books', qty: 1, unit: '$24.00', amt: 24, mode: 'ship',
          snap: {
            price: '$24.00', variant: '',
            desc: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
            manage: 'product-detail.html?id=zine'
          }
        },
        {
          nameKey: 'od.item2.name', name: 'Kowloon After Dark tee (M)',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$32.00', amt: 32, mode: 'ship',
          snap: {
            price: '$32.00', variant: 'M',
            desc: 'Soft-washed cotton tee with a 九龍夜行 print. Unisex fit.',
            manage: 'product-detail.html?id=tee'
          }
        },
        {
          nameKey: 'od.item6.name', name: 'Kowloon After Dark six-panel cap',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$26.00', amt: 26, mode: 'ship',
          snap: {
            price: '$26.00', variant: 'Black',
            desc: 'Embroidered six-panel cap with an adjustable strap.',
            manage: 'product-detail.html?id=cap'
          }
        },
        {
          nameKey: 'od.item7.name', name: 'Neon sign enamel pin',
          catKey: 'e-shop.cat.accessories', qty: 2, unit: '$12.00', amt: 24, mode: 'ship',
          snap: {
            price: '$12.00', variant: '',
            desc: 'Hard-enamel pin, gold plating. Neon-sign mark.',
            manage: 'product-detail.html?id=pin'
          }
        }
      ],
      amounts: { goods: '$106.00', shipping: '$8.00', platform: '−$15.90', payment: '−$2.54', net: '$95.56' },
      total: '$106.00', totalAmt: 106,
      fx: { currency: 'TWD', paid: 'NT$3,591.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 純現場 QR 領取：整單都在簽名場次現場領，沒有物流，也沒有寄送地址。
         §2.5 區塊狀態——出貨彈窗不顯示物流商／追蹤碼，改引導到取貨管理。 */
      id: 'ZT-10484', date: '2026-06-09', kind: 'pickup',
      pay: 'paid', fulfil: ['pickup'],
      text: 'zt-10484 sora 九龍夜行 原聲黑膠 編號 現場領取 kowloon after dark vinyl pickup',
      buyer: {
        name: 'Sora M.',
        shipTo: '',                        /* 現場領取無寄送地址：明細頁整列收起 */
        contact: 'sora.m@example.com'
      },
      items: [
        {
          nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
          catKey: 'e-shop.cat.collectibles', qty: 1, unit: '$180.00', amt: 180, mode: 'pickup',
          snap: {
            price: '$180.00', variant: '',
            desc: 'Hand-numbered acetate LP — limited run of 50, signed.',
            manage: 'product-detail.html?id=acetate'
          },
          units: [
            { code: 'PU-10484-01', status: 'pending', at: null, session: PICKUP_SESSION }
          ]
        }
      ],
      amounts: { goods: '$180.00', shipping: '', platform: '−$27.00', payment: '−$4.32', net: '$148.68' },
      total: '$180.00', totalAmt: 180,
      fx: { currency: 'TWD', paid: 'NT$5,670.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 混合訂單（寄送＋現場 QR 領取＋組合品項）——原本 order-detail.html 寫死的那一筆。
         2026-09-03（D240）追加組合商品「Launch night bundle」示範：組合下單展開成
         2 個 pickup 成員＋1 個 ship 成員，混合取貨方式在同一張單同時出現。 */
      id: 'ZT-10482', date: '2026-06-08', kind: 'mixed',
      pay: 'paid', fulfil: ['toship', 'pickup'],
      text: 'zt-10482 mika 幕後寫真誌 九龍夜行 紀念 t 恤 pirate queen zine tee 組合 launch night bundle',
      buyer: {
        name: 'Mika L.',
        shipTo: 'No. 12, Ln 3, Dadaocheng, Taipei 103, TW',
        contact: 'mika.l@example.com'
      },
      items: [
        {
          nameKey: 'od.item1.name', name: 'Pirate Queen zine vol. 02',
          catKey: 'e-shop.cat.books', qty: 1, unit: '$24.00', amt: 24, mode: 'ship',
          snap: {
            price: '$24.00', variant: '',
            desc: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
            manage: 'product-detail.html?id=zine'
          }
        },
        {
          nameKey: 'od.item2.name', name: 'Kowloon After Dark tee (M)',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$32.00', amt: 32, mode: 'pickup',
          snap: {
            price: '$32.00', variant: 'M',
            desc: 'Soft-washed cotton tee with a 九龍夜行 print. Unisex fit.',
            manage: 'product-detail.html?id=tee'
          },
          units: [
            { code: 'PU-10482-01', status: 'pending', at: null, session: PICKUP_SESSION }
          ]
        },
        {
          /* 組合品項（D240 裁決二）：組合本身不產生領取碼，catKey 'bundle' 沒有對應
             i18n 分類詞條（現有 e-shop.cat.* 詞彙都是實體分類、非「這是一個組合」的
             標記），品項表的分類欄會落到既有的「—」佔位，不影響渲染。 */
          nameKey: 'od.item12.name', name: 'Launch night bundle',
          catKey: 'bundle', qty: 1, unit: '$86.00', amt: 86, mode: 'bundle',
          snap: {
            price: '$86.00', variant: '',
            desc: 'Launch-night bundle — six-panel cap ×3 and numbered vinyl picked up on-site, enamel pin shipped separately.',
            manage: 'product-detail.html?id=bundle-launch'
          },
          members: [
            {
              nameKey: 'od.item6.name', name: 'Kowloon After Dark six-panel cap',
              qty: 3, mode: 'pickup',
              units: [
                { code: 'PU-10482-02', status: 'done', at: '13:40', session: PICKUP_SESSION, from: 'od.item12.name' },
                { code: 'PU-10482-03', status: 'pending', at: null, session: PICKUP_SESSION, from: 'od.item12.name' },
                { code: 'PU-10482-04', status: 'pending', at: null, session: PICKUP_SESSION, from: 'od.item12.name' }
              ]
            },
            {
              nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
              qty: 1, mode: 'pickup',
              units: [
                { code: 'PU-10482-05', status: 'pending', at: null, session: PICKUP_SESSION, from: 'od.item12.name' }
              ]
            },
            {
              /* ship 成員不產生 units（D240 裁決二：只有 pickup 成員逐件展開） */
              nameKey: 'od.item7.name', name: 'Neon sign enamel pin',
              qty: 1, mode: 'ship'
            }
          ]
        }
      ],
      amounts: { goods: '$142.00', shipping: '$8.00', platform: '−$21.30', payment: '−$3.41', net: '$125.29' },
      total: '$142.00', totalAmt: 142,
      fx: { currency: 'TWD', paid: 'NT$4,725.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 作廢即失效示範 A（D242，2026-09-03；2026-09-09 隨 D253 改寫）：ops 已在平台外
         （Stripe）完成人工退款，Admin 回平台作廢對應品項——同一張單裡一個品項已作廢、
         另一個品項不受影響仍可核銷，訂單本身未全數作廢、狀態維持不變（paid）。
         純現場 QR 領取，無寄送地址。 */
      id: 'ZT-10471', date: '2026-06-05', kind: 'pickup',
      pay: 'paid', fulfil: ['pickup'],
      text: 'zt-10471 yuki 九龍夜行 原聲黑膠 六片帽 部分作廢 已取消 現場領取 vinyl cap voided cancelled pickup',
      buyer: {
        name: 'Yuki H.',
        shipTo: '',
        contact: 'yuki.h@example.com'
      },
      items: [
        {
          nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
          catKey: 'e-shop.cat.collectibles', qty: 1, unit: '$180.00', amt: 180, mode: 'pickup',
          snap: {
            price: '$180.00', variant: '',
            desc: 'Hand-numbered acetate LP — limited run of 50, signed.',
            manage: 'product-detail.html?id=acetate'
          },
          /* Admin 作廢 → 領取單位轉 void、領取碼即刻失效（D242 裁決一，觸發源由 D253 收斂）*/
          units: [
            { code: 'PU-10471-01', status: 'void', at: '2026-06-11', session: PICKUP_SESSION }
          ]
        },
        {
          nameKey: 'od.item6.name', name: 'Kowloon After Dark six-panel cap',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$26.00', amt: 26, mode: 'pickup',
          snap: {
            price: '$26.00', variant: '',
            desc: 'Embroidered six-panel cap with an adjustable strap.',
            manage: 'product-detail.html?id=cap'
          },
          /* 這件沒有被作廢，不受影響——裁決一只動被作廢品項展開的單位 */
          units: [
            { code: 'PU-10471-02', status: 'pending', at: null, session: PICKUP_SESSION }
          ]
        }
      ],
      amounts: { goods: '$206.00', shipping: '', platform: '−$30.90', payment: '−$4.94', net: '$170.16' },
      total: '$206.00', totalAmt: 206,
      fx: { currency: 'TWD', paid: 'NT$6,489.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 作廢即失效示範 B（D242；2026-09-09 隨 D253 改寫）：組合品項的部分成員被作廢——
         只有被作廢成員的領取單位失效，其餘成員不受影響（裁決二）。見本檔上方
         「作廢即失效」節的說明。 */
      id: 'ZT-10473', date: '2026-06-04', kind: 'pickup',
      pay: 'paid', fulfil: ['pickup'],
      text: 'zt-10473 jonas 首賣夜 組合包 六片帽 原聲黑膠 部分作廢 已取消 launch night bundle cap vinyl voided cancelled',
      buyer: {
        name: 'Jonas P.',
        shipTo: '',
        contact: 'jonas.p@example.com'
      },
      items: [
        {
          nameKey: 'od.item12.name', name: 'Launch night bundle',
          catKey: 'bundle', qty: 1, unit: '$86.00', amt: 86, mode: 'bundle',
          snap: {
            price: '$86.00', variant: '',
            desc: 'Launch-night bundle — six-panel cap ×2 and numbered vinyl, both picked up on-site.',
            manage: 'product-detail.html?id=bundle-launch'
          },
          members: [
            {
              /* 被作廢的成員：兩件都轉 void */
              nameKey: 'od.item6.name', name: 'Kowloon After Dark six-panel cap',
              qty: 2, mode: 'pickup',
              units: [
                { code: 'PU-10473-01', status: 'void', at: '2026-06-10', session: PICKUP_SESSION, from: 'od.item12.name' },
                { code: 'PU-10473-02', status: 'void', at: '2026-06-10', session: PICKUP_SESSION, from: 'od.item12.name' }
              ]
            },
            {
              /* 未被作廢的成員：不受影響，仍待核銷 */
              nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
              qty: 1, mode: 'pickup',
              units: [
                { code: 'PU-10473-03', status: 'pending', at: null, session: PICKUP_SESSION, from: 'od.item12.name' }
              ]
            }
          ]
        }
      ],
      amounts: { goods: '$86.00', shipping: '', platform: '−$12.90', payment: '−$2.06', net: '$71.04' },
      total: '$86.00', totalAmt: 86,
      fx: { currency: 'TWD', paid: 'NT$2,709.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 作廢示範 A（2026-09-08；2026-09-09 隨 D253 改寫 pay 值）：Admin 作廢了其中一個
         取貨品項，另一個品項仍可領——品項層顯示已取消、訂單狀態不變（全部作廢才進
         「已取消」）。純現場領取，無寄送地址。作廢的前置是營運人員已在 Stripe 完成
         人工退款，但平台不記錄這筆退款、也沒有「已退款」這個付款狀態（D253），
         訂單本身未全數作廢，pay 維持 paid。 */
      id: 'ZT-10467', date: '2026-06-02', kind: 'pickup',
      pay: 'paid', fulfil: ['pickup'],
      text: 'zt-10467 elena 九龍夜行 原聲黑膠 六片帽 作廢 已取消 現場領取 vinyl cap voided cancelled pickup',
      buyer: {
        name: 'Elena R.',
        shipTo: '',
        contact: 'elena.r@example.com'
      },
      items: [
        {
          nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
          catKey: 'e-shop.cat.collectibles', qty: 1, unit: '$180.00', amt: 180, mode: 'pickup',
          snap: {
            price: '$180.00', variant: '',
            desc: 'Hand-numbered acetate LP — limited run of 50, signed.',
            manage: 'product-detail.html?id=acetate'
          },
          /* Admin 已作廢這一項：領取碼即刻失效。at 記的是作廢時間（已核銷的單位才把 at
             讀成核銷時間，見消費頁的 status === 'done' 判斷）。 */
          units: [
            { code: 'PU-10467-01', status: 'void', at: '2026-06-06', session: PICKUP_SESSION }
          ]
        },
        {
          nameKey: 'od.item6.name', name: 'Kowloon After Dark six-panel cap',
          catKey: 'e-shop.cat.apparel', qty: 2, unit: '$26.00', amt: 52, mode: 'pickup',
          snap: {
            price: '$26.00', variant: '',
            desc: 'Embroidered six-panel cap with an adjustable strap.',
            manage: 'product-detail.html?id=cap'
          },
          /* 沒有被作廢的品項不受影響，仍待核銷——這一筆就是拿來對照的 */
          units: [
            { code: 'PU-10467-02', status: 'pending', at: null, session: PICKUP_SESSION },
            { code: 'PU-10467-03', status: 'pending', at: null, session: PICKUP_SESSION }
          ]
        }
      ],
      amounts: { goods: '$232.00', shipping: '', platform: '−$34.80', payment: '−$5.57', net: '$191.63' },
      total: '$232.00', totalAmt: 232,
      fx: { currency: 'TWD', paid: 'NT$7,308.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 作廢示範 B（2026-09-08；2026-09-09 隨 D253 改寫 pay 值）：整張單的品項都被作廢 →
         訂單進終態「已取消」（isCancelled() 推導，付款・結算軸依 D253 顯示 cancelled，
         取代原本的 refunded）。一個單品＋一個組合（組合的取貨成員逐件失效），驗證
         兩種展開結構在已取消態下的呈現。 */
      id: 'ZT-10466', date: '2026-06-01', kind: 'pickup',
      pay: 'paid', fulfil: ['pickup'],
      text: 'zt-10466 kai 九龍夜行 紀念 t 恤 首賣夜 組合包 整單作廢 已取消 tee launch night bundle voided cancelled order',
      buyer: {
        name: 'Kai T.',
        shipTo: '',
        contact: 'kai.t@example.com'
      },
      items: [
        {
          nameKey: 'od.item2.name', name: 'Kowloon After Dark tee (M)',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$32.00', amt: 32, mode: 'pickup',
          snap: {
            price: '$32.00', variant: 'M',
            desc: 'Soft-washed cotton tee with a 九龍夜行 print. Unisex fit.',
            manage: 'product-detail.html?id=tee'
          },
          units: [
            { code: 'PU-10466-01', status: 'void', at: '2026-06-05', session: PICKUP_SESSION }
          ]
        },
        {
          nameKey: 'od.item12.name', name: 'Launch night bundle',
          catKey: 'bundle', qty: 1, unit: '$86.00', amt: 86, mode: 'bundle',
          snap: {
            price: '$86.00', variant: '',
            desc: 'Launch-night bundle — six-panel cap ×2 and numbered vinyl, both picked up on-site.',
            manage: 'product-detail.html?id=bundle-launch'
          },
          members: [
            {
              nameKey: 'od.item6.name', name: 'Kowloon After Dark six-panel cap',
              qty: 2, mode: 'pickup',
              units: [
                { code: 'PU-10466-02', status: 'void', at: '2026-06-05', session: PICKUP_SESSION, from: 'od.item12.name' },
                { code: 'PU-10466-03', status: 'void', at: '2026-06-05', session: PICKUP_SESSION, from: 'od.item12.name' }
              ]
            },
            {
              nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
              qty: 1, mode: 'pickup',
              units: [
                { code: 'PU-10466-04', status: 'void', at: '2026-06-05', session: PICKUP_SESSION, from: 'od.item12.name' }
              ]
            }
          ]
        }
      ],
      amounts: { goods: '$118.00', shipping: '', platform: '−$17.70', payment: '−$2.83', net: '$97.47' },
      total: '$118.00', totalAmt: 118,
      fx: { currency: 'TWD', paid: 'NT$3,717.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 純數位訂單：無實體物流（§2.5 區塊狀態）——出貨彈窗改呈現數位交付狀態 */
      id: 'ZT-10481', date: '2026-06-08', kind: 'digital',
      pay: 'paid', fulfil: ['completed'],
      text: 'zt-10481 devon 九龍夜行 原聲帶 數位下載 kowloon after dark ost digital download',
      buyer: {
        name: 'Devon W.',
        shipTo: '',                        /* 純數位無寄送地址：明細頁整列收起 */
        contact: 'devon.w@example.com'
      },
      items: [
        {
          nameKey: 'od.item3.name', name: 'Kowloon After Dark OST — digital download',
          catKey: 'cp.dsub.album', qty: 1, unit: '$12.00', amt: 12, mode: 'digital',
          snap: {
            price: '$12.00', variant: '',
            desc: 'Five-track EP — full download with lyrics.',
            manage: 'product-detail.html?id=album'
          }
        }
      ],
      amounts: { goods: '$12.00', shipping: '', platform: '−$1.80', payment: '−$0.29', net: '$9.91' },
      total: '$12.00', totalAmt: 12,
      fx: { currency: 'TWD', paid: 'NT$378.00', rate: '1 USD = 31.5 TWD' },
      /* 數位交付紀錄（§2.5「數位商品呈現下載／存取權限的交付狀態」）。
         規格沒有給數位交付專屬狀態名，狀態值沿用訂單履約軸的 completed（見 ASSUMPTIONS UIA-107）。 */
      delivery: { methodKey: 'od.dig.method.instant', on: '2026-06-08', downloads: '2' }
    },
    {
      /* 純數位・預購未發行：買家已付款，但專輯要到發行日才開放下載，delivery 沒有 on
         日期＝尚未交付。這是「數位未交付」的可作廢樣本（D253 裁決四：作廢範圍涵蓋所有
         未完成履約的品項，數位以尚未交付為準）。 */
      id: 'ZT-10488', date: '2026-06-10', kind: 'digital',
      /* 履約軸留空：數位尚未交付，fulfil 值域（toship／pickup／shipped／completed）沒有
         對應的值，交付狀態由 delivery 欄位表達。 */
      pay: 'paid', fulfil: [],
      text: 'zt-10488 harper 九龍夜行 續作 數位預購 kowloon after dark ii digital pre-order',
      buyer: {
        name: 'Harper T.',
        shipTo: '',
        contact: 'harper.t@example.com'
      },
      items: [
        {
          nameKey: 'od.item3.name', name: 'Kowloon After Dark II — digital pre-order',
          catKey: 'cp.dsub.album', qty: 1, unit: '$14.00', amt: 14, mode: 'digital',
          snap: {
            price: '$14.00', variant: '',
            desc: 'Follow-up EP — download opens on release day.',
            manage: 'product-detail.html?id=album'
          }
        }
      ],
      amounts: { goods: '$14.00', shipping: '', platform: '−$2.10', payment: '−$0.34', net: '$11.56' },
      total: '$14.00', totalAmt: 14,
      /* 尚未交付：delivery 只記交付方式，沒有 on 日期與下載次數 */
      delivery: { methodKey: 'od.dig.method.preorder', on: '', downloads: '0' }
    },
    {
      /* 實體＋數位同一單：連帽外套要寄、數位專輯付款當下就交付完成。
         kind 仍是 shipping（這張單確實要寄實體物），數位那一列在品項層自己顯示已完成。 */
      id: 'ZT-10479', date: '2026-06-07', kind: 'shipping',
      pay: 'paid', fulfil: ['toship'],
      text: 'zt-10479 elena 九龍夜行 連帽外套 原聲帶 數位下載 hoodie ost digital',
      buyer: {
        name: 'Elena R.',
        shipTo: '7F-2, No. 66, Sec. 4, Ren’ai Rd, Taipei 106, TW',
        contact: 'elena.r@example.com'
      },
      items: [
        {
          nameKey: 'od.item5.name', name: 'Kowloon After Dark hoodie (L)',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$58.00', amt: 58, mode: 'ship',
          snap: {
            price: '$58.00', variant: 'L',
            desc: 'Brushed-fleece hoodie with an embroidered neon-sign mark. Unisex fit.',
            manage: 'product-detail.html?id=hoodie'
          }
        },
        {
          nameKey: 'od.item3.name', name: 'Kowloon After Dark OST — digital download',
          catKey: 'cp.dsub.album', qty: 1, unit: '$12.00', amt: 12, mode: 'digital',
          snap: {
            price: '$12.00', variant: '',
            desc: 'Five-track EP — full download with lyrics.',
            manage: 'product-detail.html?id=album'
          }
        }
      ],
      amounts: { goods: '$70.00', shipping: '$5.00', platform: '−$10.50', payment: '−$1.68', net: '$62.82' },
      total: '$70.00', totalAmt: 70,
      fx: { currency: 'TWD', paid: 'NT$2,362.50', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 實體黑膠（編號 1/50），已出貨、買家發起爭議 → 付款・結算軸 disputed */
      id: 'ZT-10477', date: '2026-06-06', kind: 'shipping',
      pay: 'disputed', fulfil: ['shipped'],
      text: 'zt-10477 aria 九龍夜行 原聲黑膠 編號 kowloon after dark vinyl numbered',
      buyer: {
        name: 'Aria S.',
        shipTo: '5F, No. 88, Sec. 2, Zhongshan N. Rd, Taipei 104, TW',
        contact: 'aria.s@example.com'
      },
      items: [
        {
          nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
          catKey: 'e-shop.cat.collectibles', qty: 1, unit: '$180.00', amt: 180, mode: 'ship',
          snap: {
            price: '$180.00', variant: '',
            desc: 'Hand-numbered acetate LP — limited run of 50, signed.',
            manage: 'product-detail.html?id=acetate'
          }
        }
      ],
      amounts: { goods: '$180.00', shipping: '$12.00', platform: '−$27.00', payment: '−$4.32', net: '$160.68' },
      total: '$180.00', totalAmt: 180,
            fx: { currency: 'TWD', paid: 'NT$6,048.00', rate: '1 USD = 31.5 TWD' },
      /* 已出貨 → §2.5「完成後呈現對應憑證（追蹤碼）」：出貨彈窗帶出已填的物流商與追蹤碼 */
      shipment: { carrier: 'DHL', tracking: 'JD0140126548' }
    },
    {
      /* 出貨型品項作廢示範（2026-09-09，隨 D253 改寫）：買家在出貨前取消其中一件，
         ops 在平台外（Stripe）完成人工退款，Admin 回平台作廢寫真誌那件（$24.00）；
         tee 那件不受影響、仍待出貨。作廢的可用條件是「尚未標記出貨」（D253），所以
         這筆訂單的履約軸改成 toship（作廢前原型舊版寫成已出貨兩件皆退款，在新模型下
         不成立——已出貨即終態不可作廢，見 §2.8「停用情況」）；訂單未全數作廢，
         付款軸維持 paid（品項層顯示已取消，不是訂單層）。 */
      id: 'ZT-10476', date: '2026-06-06', kind: 'shipping',
      pay: 'paid', fulfil: ['toship'],
      text: 'zt-10476 hugo 九龍夜行 紀念 t 恤 幕後寫真誌 部分作廢 已取消 tee zine voided cancelled',
      buyer: {
        name: 'Hugo B.',
        shipTo: 'No. 5, Ln 24, Sec. 2, Fuxing S. Rd, Taipei 106, TW',
        contact: 'hugo.b@example.com'
      },
      items: [
        {
          nameKey: 'od.item2.name', name: 'Kowloon After Dark tee (M)',
          catKey: 'e-shop.cat.apparel', qty: 1, unit: '$32.00', amt: 32, mode: 'ship',
          snap: {
            price: '$32.00', variant: 'M',
            desc: 'Soft-washed cotton tee with a 九龍夜行 print. Unisex fit.',
            manage: 'product-detail.html?id=tee'
          }
        },
        {
          nameKey: 'od.item1.name', name: 'Pirate Queen zine vol. 02',
          catKey: 'e-shop.cat.books', qty: 1, unit: '$24.00', amt: 24, mode: 'ship',
          snap: {
            price: '$24.00', variant: '',
            desc: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
            manage: 'product-detail.html?id=zine'
          },
          /* 出貨型品項作廢：沒有領取單位可失效，改在品項自己身上記 voided（見檔頭
             「作廢明細」節）。at 為作廢時間。 */
          voided: true, voidedAt: '2026-06-10'
        }
      ],
      amounts: { goods: '$56.00', shipping: '$5.00', platform: '−$8.40', payment: '−$1.34', net: '$51.26' },
      total: '$56.00', totalAmt: 56,
      fx: { currency: 'TWD', paid: 'NT$1,921.50', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 混合訂單的另一半局面：物流那段已出貨，取貨那段還等場次 scanner 核銷（§2.5 混合訂單） */
      id: 'ZT-10472', date: '2026-06-05', kind: 'mixed',
      pay: 'paid', fulfil: ['shipped', 'pickup'],
      text: 'zt-10472 priya 幕後寫真誌 九龍夜行 原聲黑膠 現場領取 zine vinyl pickup',
      buyer: {
        name: 'Priya N.',
        shipTo: 'No. 133, Sec. 1, Nanjing E. Rd, Taipei 104, TW',
        contact: 'priya.n@example.com'
      },
      items: [
        {
          nameKey: 'od.item1.name', name: 'Pirate Queen zine vol. 02',
          catKey: 'e-shop.cat.books', qty: 1, unit: '$24.00', amt: 24, mode: 'ship',
          snap: {
            price: '$24.00', variant: '',
            desc: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
            manage: 'product-detail.html?id=zine'
          }
        },
        {
          nameKey: 'od.item4.name', name: 'Kowloon After Dark vinyl · numbered 1/50',
          catKey: 'e-shop.cat.collectibles', qty: 1, unit: '$180.00', amt: 180, mode: 'pickup',
          snap: {
            price: '$180.00', variant: '',
            desc: 'Hand-numbered acetate LP — limited run of 50, signed.',
            manage: 'product-detail.html?id=acetate'
          },
          /* 「取貨場次待設定」示範：商品尚未加入任何場次，領取單位還沒有 session（D240）*/
          units: [
            { code: 'PU-10472-01', status: 'unset', at: null, session: null }
          ]
        }
      ],
      amounts: { goods: '$204.00', shipping: '$5.00', platform: '−$30.60', payment: '−$4.90', net: '$173.50' },
      total: '$204.00', totalAmt: 204,
      fx: { currency: 'TWD', paid: 'NT$6,583.50', rate: '1 USD = 31.5 TWD' },
      shipment: { carrier: '黑貓宅急便', tracking: '9021-4478-3418' }
    },
    {
      /* 實體寄送，已出貨 */
      id: 'ZT-10470', date: '2026-06-05', kind: 'shipping',
      pay: 'paid', fulfil: ['shipped'],
      text: 'zt-10470 kai 幕後寫真誌 pirate queen zine',
      buyer: {
        name: 'Kai T.',
        shipTo: '1042 Valencia St, San Francisco, CA 94110, US',
        contact: 'kai.t@example.com'
      },
      items: [
        {
          nameKey: 'od.item1.name', name: 'Pirate Queen zine vol. 02',
          catKey: 'e-shop.cat.books', qty: 2, unit: '$24.00', amt: 48, mode: 'ship',
          snap: {
            price: '$24.00', variant: '',
            desc: '32-page photo zine documenting the east-coast tour. Letterpress cover.',
            manage: 'product-detail.html?id=zine'
          }
        }
      ],
      amounts: { goods: '$48.00', shipping: '$5.00', platform: '−$7.20', payment: '−$1.15', net: '$44.65' },
      total: '$48.00', totalAmt: 48,
      fx: null,
      shipment: { carrier: '黑貓宅急便', tracking: '9021-4478-3310' }
    },
    {
      /* 純數位、三個品項：單曲＋紀錄片＋後援會會員卡，付款當下全數交付完成 */
      id: 'ZT-10469', date: '2026-06-04', kind: 'digital',
      pay: 'paid', fulfil: ['completed'],
      text: 'zt-10469 otis 九龍夜行 主題單曲 海上霸姬 幕後紀錄 官方後援會 single documentary membership',
      buyer: {
        name: 'Otis L.',
        shipTo: '',                        /* 純數位無寄送地址：明細頁整列收起 */
        contact: 'otis.l@example.com'
      },
      items: [
        {
          nameKey: 'od.item9.name', name: 'Kowloon After Dark — lead single',
          catKey: 'cp.dsub.music', qty: 1, unit: '$1.50', amt: 1.5, mode: 'digital',
          snap: {
            price: '$1.50', variant: '',
            desc: 'Lead single — instant download after purchase.',
            manage: 'product-detail.html?id=song'
          }
        },
        {
          nameKey: 'od.item10.name', name: 'Pirate Queen — behind the scenes',
          catKey: 'cp.dsub.movie', qty: 1, unit: '$9.00', amt: 9, mode: 'digital',
          snap: {
            price: '$9.00', variant: '',
            desc: 'Feature-length tour documentary — stream or download.',
            manage: 'product-detail.html?id=movie'
          }
        },
        {
          nameKey: 'od.item11.name', name: 'Lam Ka-wai official fan club',
          catKey: 'cp.dsub.membership', qty: 1, unit: '$8.00', amt: 8, mode: 'digital',
          snap: {
            price: '$8.00', variant: '',
            desc: 'Recurring membership card — perks, early access, community.',
            manage: 'product-detail.html?id=membership'
          }
        }
      ],
      amounts: { goods: '$18.50', shipping: '', platform: '−$2.78', payment: '−$0.44', net: '$15.28' },
      total: '$18.50', totalAmt: 18.5,
            fx: { currency: 'JPY', paid: '¥2,905', rate: '1 USD = 157 JPY' },
      delivery: { methodKey: 'od.dig.method.instant', on: '2026-06-04', downloads: '5' }
    },
    {
      /* 整單作廢示範（2026-09-09，隨 D253 改寫）：買家在出貨前取消，ops 在平台外
         （Stripe）完成人工退款，Admin 回平台作廢這張單唯一的品項 → 訂單所有品項皆已
         取消，isCancelled() 推導訂單進終態「已取消」（付款・結算軸顯示 cancelled，
         取代原本的 refunded，見 renderStatus）。履約軸原型舊版寫成「已完成」事後整單退，
         在新模型下不成立——已完成即終態不可作廢，故履約軸改回 toship（作廢發生在
         出貨前）。 */
      id: 'ZT-10474', date: '2026-06-03', kind: 'shipping',
      pay: 'paid', fulfil: ['toship'],
      text: 'zt-10474 wen 九龍夜行 帆布低筒鞋 整單作廢 已取消 sneakers voided cancelled order',
      buyer: {
        name: 'Wen C.',
        shipTo: 'No. 9, Ln 55, Sec. 3, Bade Rd, Taipei 105, TW',
        contact: 'wen.c@example.com'
      },
      items: [
        {
          nameKey: 'od.item8.name', name: 'Kowloon After Dark canvas low-tops (US 10)',
          catKey: 'e-shop.cat.footwear', qty: 1, unit: '$64.00', amt: 64, mode: 'ship',
          snap: {
            price: '$64.00', variant: 'US 10',
            desc: 'Canvas low-top sneaker on a rubber cup sole.',
            manage: 'product-detail.html?id=shoes'
          },
          voided: true, voidedAt: '2026-06-11'
        }
      ],
      amounts: { goods: '$64.00', shipping: '$5.00', platform: '−$9.60', payment: '−$1.54', net: '$57.86' },
      total: '$64.00', totalAmt: 64,
      fx: { currency: 'TWD', paid: 'NT$2,173.50', rate: '1 USD = 31.5 TWD' }
    }
  ];

  /* 履約軸／付款・結算軸的徽章語言（§7.2）。字樣走 i18n key，顏色是呈現決策：
     success＝這一格已經妥了、warning＝還等你動手、error＝出事了、neutral＝已成定局的紀錄。
     「已付款」用綠色是 STYLE-DECISIONS Q11 的裁決。 */
  var FULFIL_BADGE = {
    toship:    { key: 'orders.status.toship',    text: 'To ship',        cls: 'badge--warning' },
    pickup:    { key: 'orders.status.pickup',    text: 'Awaiting pickup', cls: 'badge--warning' },
    shipped:   { key: 'orders.status.shipped',   text: 'Shipped',        cls: 'badge--neutral' },
    completed: { key: 'orders.status.completed', text: 'Completed',      cls: 'badge--success' }
  };
  /* 2026-09-09（D253）：付款・結算軸拿掉 refunded，改用 cancelled 表達——平台不提供
     退款動作，「已取消」取代「已退款」；cancelled 沿用與 orders.status.cancelled
     相同的視覺（badge--error，與領取單位／品項層的已取消徽章同色）。 */
  var PAY_BADGE = {
    unpaid:    { key: 'orders.pay.unpaid',    text: 'Unpaid',    cls: 'badge--warning' },
    paid:      { key: 'orders.pay.paid',      text: 'Paid',      cls: 'badge--success' },
    cancelled: { key: 'orders.pay.cancelled', text: 'Cancelled', cls: 'badge--error' },
    disputed:  { key: 'orders.pay.disputed',  text: 'Disputed',  cls: 'badge--error' }
  };

  /* ── 篩選頁籤（F2）的歸屬由狀態算出來，不手寫 ──────────────────────
     手寫兩份（徽章一份、頁籤一份）遲早會對不上：某一列顯示「已出貨」卻不出現在
     「已出貨」頁籤裡，是清單最難查的那種不一致。所以這裡由 pay／fulfil 直接推導。
     2026-09-09（D253）：退款與爭議不再併成一個篩選分組——平台已無退款動作，「已取消」
     與「爭議」是兩件不同的事，各自成頁籤（cancelled 由下面的 o.cancelled 短路產生，
     disputed 走 PAY_TAB）；待取貨（pickup）沒有對應頁籤（F2 只有七個），所以不產生 token。 */
  var PAY_TAB = { unpaid: 'unpaid', paid: 'paid', disputed: 'disputed' };
  var FULFIL_TAB = { toship: 'toship', shipped: 'shipped', completed: 'completed' };
  function computeFilters(o) {
    var tabs = [];
    var push = function (v) { if (v && tabs.indexOf(v) < 0) tabs.push(v); };
    push(PAY_TAB[o.pay]);
    /* 已取消是終態：履約不會再發生，所以不再落進待出貨／已出貨／已完成那些履約頁籤，
       只留付款・結算軸的頁籤加上「已取消」，否則同一筆會同時出現在兩個互斥的分頁裡。 */
    if (o.cancelled) { push('cancelled'); return tabs; }
    o.fulfil.forEach(function (v) { push(FULFIL_TAB[v]); });
    return tabs;
  }
  /* 訂單層的衍生欄位一次算完：作廢會改變 cancelled，cancelled 又會改變篩選歸屬，
     所以兩者永遠一起重算，不讓呼叫端各自記得要更新哪一個。 */
  function refreshDerived(o) {
    o.cancelled = isCancelled(o);
    o.filters = computeFilters(o);
    return o;
  }
  ORDERS.forEach(refreshDerived);

  /* ── F1 訂單摘要的四張 KPI 卡（5.1.5.3 F1）──────────────────────
     一樣由同一份資料算，不寫死數字——寫死的話補一筆訂單就會跟清單對不上。
       待出貨（To ship）    ＝履約軸有「待出貨」的訂單數。現場 QR 領取品項不列入
                             物流待出貨（F1 明文），所以只看 toship、不看 pickup。
       待處理（Pending）    ＝還沒付款、等著被處理的訂單數。
       已取消／爭議         ＝落在 cancelled 或 disputed 篩選分組的訂單數（2026-09-09
                             隨 D253 從「退款／爭議」改名——平台已無退款動作）。
       近 30 天完成         ＝履約軸已完成、且日期落在最新一筆訂單往前 30 天內的訂單數。
                             demo 資料是凍結的日期（2026-06），所以用資料裡最新的一天
                             當「今天」，否則這張卡永遠是 0。 */
  function toTime(d) { return new Date(String(d) + 'T00:00:00').getTime(); }
  function kpi() {
    var newest = ORDERS.reduce(function (m, o) { return Math.max(m, toTime(o.date)); }, 0);
    var floor = newest - 30 * 24 * 60 * 60 * 1000;
    var n = { toship: 0, pending: 0, cancelDisputed: 0, completed: 0 };
    ORDERS.forEach(function (o) {
      if (o.fulfil.indexOf('toship') >= 0) n.toship++;
      if (o.pay === 'unpaid') n.pending++;
      if (o.filters.indexOf('cancelled') >= 0 || o.filters.indexOf('disputed') >= 0) n.cancelDisputed++;
      if (o.fulfil.indexOf('completed') >= 0 && toTime(o.date) >= floor) n.completed++;
    });
    return n;
  }

  function normalize(id) { return String(id || '').replace(/^#/, '').trim().toUpperCase(); }

  /* ── 領取單位 helper（D240）───────────────────────────────────────
     unitsOf(order)：扁平化該訂單所有領取單位，含 pickup 品項自己的 units，
     以及 bundle 品項展開後、其 pickup 成員的 units（ship 成員沒有 units、略過）。
     每個元素補齊消費頁common需要的欄位：品項名／選項組合／來源組合／買家／訂單號。
     unitSummary(item)：單一品項的「N 件中 M 件已核銷」，bundle 品項要合計全部
     pickup 成員的 units（不含 ship 成員，因為它沒有可核銷的領取單位）。 */
  function unitsOf(order) {
    var out = [];
    (order.items || []).forEach(function (it) {
      if (it.mode === 'pickup' && it.units) {
        it.units.forEach(function (u) {
          out.push({
            code: u.code, status: u.status, at: u.at, session: u.session,
            itemName: it.name, itemNameKey: it.nameKey,
            variant: (it.snap && it.snap.variant) ? it.snap.variant : null,
            from: u.from || null,
            buyer: order.buyer.name, orderNo: order.id
          });
        });
      } else if (it.mode === 'bundle' && it.members) {
        it.members.forEach(function (m) {
          if (m.mode !== 'pickup' || !m.units) return;
          m.units.forEach(function (u) {
            out.push({
              code: u.code, status: u.status, at: u.at, session: u.session,
              itemName: m.name, itemNameKey: m.nameKey,
              variant: m.variant || null,
              from: u.from || null,
              buyer: order.buyer.name, orderNo: order.id
            });
          });
        });
      }
    });
    return out;
  }

  /* 單一 units［]的計數（D242）：total 不變（購買件數），done／voided／unset 分開算，
     pending（待核銷）由消費頁自己推：total − done − voided − unset。voided 的件不算
     待核銷（規格 5.1.5.3.1 §2.3.1／5.1.5.15 F4.1 的共同口徑）。 */
  function summarizeUnits(units) {
    var done = 0, voided = 0, unset = 0;
    (units || []).forEach(function (u) {
      if (u.status === 'done') done++;
      else if (u.status === 'void') voided++;
      else if (u.status === 'unset') unset++;
    });
    return { total: (units || []).length, done: done, voided: voided, unset: unset };
  }

  function unitSummary(item) {
    if (item.mode === 'pickup') return summarizeUnits(item.units);
    if (item.mode === 'bundle') {
      var total = 0, done = 0, voided = 0, unset = 0;
      (item.members || []).forEach(function (m) {
        if (m.mode !== 'pickup') return;
        var s = summarizeUnits(m.units);
        total += s.total; done += s.done; voided += s.voided; unset += s.unset;
      });
      return { total: total, done: done, voided: voided, unset: unset };
    }
    return { total: 0, done: 0, voided: 0, unset: 0 };
  }

  /* ── 作廢明細（Void，2026-09-08 D252 建立，2026-09-09 隨 D253 擴大範圍）────────
     voidState(item, order) 把「這一項現在能不能作廢」收成一個字串，讓三處判斷（按不按
     得下去、顯不顯示按鈕、要說哪一句原因）吃同一個答案，不各自重寫條件：
       'ok'        尚未完成履約、尚未作廢 → 可作廢
       'redeemed'  已完成履約（取貨型任一單位已核銷／出貨型已出貨／數位已交付）
                   → 終態，不可作廢
       'voided'    已經作廢 → 不可再作廢、不可逆
     取貨型／含取貨成員的組合，「是否完成履約」看領取單位（done>0 即已完成）；
     出貨型與數位沒有領取單位，改看 `item.voided` 旗標＋所屬訂單的履約軸（shipStage）——
     出貨型「已出貨」＝shipStage 為 shipped／completed，數位品項在本檔的 demo 模型下
     交付與否看訂單層 delivery.on：有日期＝已交付終態，沒有＝預購／未發布，可作廢
     ⚠ 這裡只回答「能不能」，權限（Admin 代管態）不在這支——權限是誰在看的問題、與品項
     本身的狀態無關，由呈現層另外判斷，兩者混在一起會讓資料層依賴登入狀態。
     order 參數只用來讀 fulfil（判斷出貨型是否已出貨），不讀寫；呼叫端固定傳整筆訂單。 */
  function fulfilStageOf(order) {
    var f = (order && order.fulfil) || [];
    if (f.indexOf('completed') >= 0) return 'completed';
    if (f.indexOf('shipped') >= 0) return 'shipped';
    if (f.indexOf('toship') >= 0) return 'toship';
    return '';
  }
  function voidState(item, order) {
    var agg = unitSummary(item);
    var hasPickup = (item.mode === 'pickup' && item.units && item.units.length) ||
                    (item.mode === 'bundle' && agg.total > 0);
    if (hasPickup) {
      if (agg.voided === agg.total) return 'voided';
      if (agg.done > 0) return 'redeemed';
      return 'ok';
    }
    /* 出貨型／數位／全為 ship 成員的組合：沒有領取單位可驗，改看品項自己的 voided
       旗標與所屬訂單的履約階段。 */
    if (item.voided) return 'voided';
    /* 數位：交付與否看訂單層的 delivery 紀錄（有 on 日期＝已交付、終態）。預購或
       尚未發布的數位商品沒有 delivery.on，屬未完成履約，D253 起可作廢。 */
    if (item.mode === 'digital') return (order && order.delivery && order.delivery.on) ? 'redeemed' : 'ok';
    var stage = fulfilStageOf(order);
    if (stage === 'shipped' || stage === 'completed') return 'redeemed';
    return 'ok';
  }

  function markVoid(units, at) {
    (units || []).forEach(function (u) { u.status = 'void'; u.at = at; });
  }

  /* voidItem(order, item)：可作廢時，取貨型／含取貨成員的組合把展開的全部領取單位
     （含組合成員的單位）轉 void 並記下作廢時間；出貨型／數位／全為 ship 成員的組合
     沒有領取單位可轉，改在品項自己身上記 `voided: true` ＋ `voidedAt`。完成後重算
     訂單層的衍生狀態。回傳是否真的作廢了（狀態不允許時回 false，呼叫端不必自己先
     判斷一次）。
     ⚠ 原型只動狀態：**庫存回補與「訂單已取消」email 由後端執行**，這裡不模擬，也不呼叫
     Stripe——人工退款是營運人員在平台外先完成的前置。確認彈窗會把這三件事告訴操作者。 */
  function voidItem(order, item) {
    if (voidState(item, order) !== 'ok') return false;
    var at = new Date().toISOString().slice(0, 10);
    var agg = unitSummary(item);
    var hasPickup = (item.mode === 'pickup' && item.units && item.units.length) ||
                    (item.mode === 'bundle' && agg.total > 0);
    if (item.mode === 'pickup') markVoid(item.units, at);
    else if (item.mode === 'bundle' && hasPickup) {
      (item.members || []).forEach(function (m) { if (m.mode === 'pickup') markVoid(m.units, at); });
    } else {
      item.voided = true; item.voidedAt = at;
    }
    refreshDerived(order);
    return true;
  }

  /* 訂單層「已取消」＝所有品項都已作廢（終態）。衍生、不是第三條狀態軸：fulfil 軸的
     語意不動（PCR-001 兩軸不混用）；pay 軸則依 D253 把 cancelled 當作 unpaid／paid／
     disputed 之外的第四個值，清單與詳情頁改用這顆徽章取代原本的 paid／已退款。
     D253 起出貨型與數位品項也能作廢，所以整單取消不再限於純取貨訂單。 */
  function isCancelled(order) {
    var items = order.items || [];
    if (!items.length) return false;
    for (var i = 0; i < items.length; i++) if (voidState(items[i], order) !== 'voided') return false;
    return true;
  }

  var CANCELLED_BADGE = { key: 'orders.status.cancelled', text: 'Cancelled', cls: 'badge--error' };

  window.ztorOrders = {
    list: function () { return ORDERS.slice(); },
    get: function (id) {
      var key = normalize(id);
      if (!key) return null;
      for (var i = 0; i < ORDERS.length; i++) if (ORDERS[i].id === key) return ORDERS[i];
      return null;
    },
    first: function () { return ORDERS[0]; },
    kpi: kpi,
    fulfilBadge: function (v) { return FULFIL_BADGE[v] || null; },
    payBadge: function (v) { return PAY_BADGE[v] || null; },
    cancelledBadge: function () { return CANCELLED_BADGE; },
    unitsOf: unitsOf,
    unitSummary: unitSummary,
    voidState: voidState,
    voidItem: voidItem,
    isCancelled: isCancelled
  };
})();
