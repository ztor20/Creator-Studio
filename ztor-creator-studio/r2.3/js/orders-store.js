/* orders-store.js · 訂單 demo 資料的單一來源（2026-08-07）
   ------------------------------------------------------------------
   在此之前，訂單清單（orders.html）的四列寫死在 HTML，而 order-detail.html 是
   一份與清單無關的寫死樣本（#ZT-10482）；清單「點任何一列」都導到同一個網址、
   不帶訂單編號，所以從純數位訂單 #ZT-10481 點進去看到的是別人的資料，狀態自然
   對不上（清單寫「已交付」、明細的出貨彈窗講的卻是實體物流）。

   本檔把訂單資料收成一份，清單與明細同吃：
     · orders.html        依 list() 產生列，列上帶 data-order-id，點列 → order-detail.html?id=<id>
     · order-detail.html  依 ?id= 讀 get(id)；沒帶 id 用 first()；查無 id 顯示查詢失敗

   ── 狀態語言（規格 0-設計規格書 §7.2「訂單」列）────────────────────
     待付款（Unpaid）／已付款（Paid）／待出貨（To Ship）／已出貨（Shipped）／
     已完成（Completed）／退款（Refunded）／爭議（Disputed）
   兩條軸不混用（5.1.5.3.1 §2.2／PCR-001）：
     pay      付款・結算軸：unpaid | paid | refunded | disputed（§7.2 規定單筆訂單
              只屬其中一個值，所以這是單值不是陣列）
     fulfil   履約軸：toship | pickup | shipped | completed（可並列，混合訂單兩顆）
              待付款訂單還沒有履約動作，故 fulfil 為空陣列，兩處畫面都以「—」呈現。
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
   ------------------------------------------------------------------ */
(function () {
  'use strict';

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
          }
        }
      ],
      amounts: { goods: '$180.00', shipping: '', platform: '−$27.00', payment: '−$4.32', net: '$148.68' },
      total: '$180.00', totalAmt: 180,
      fx: { currency: 'TWD', paid: 'NT$5,670.00', rate: '1 USD = 31.5 TWD' }
    },
    {
      /* 混合訂單（寄送＋現場 QR 領取）——原本 order-detail.html 寫死的那一筆 */
      id: 'ZT-10482', date: '2026-06-08', kind: 'mixed',
      pay: 'paid', fulfil: ['toship', 'pickup'],
      text: 'zt-10482 mika 幕後寫真誌 九龍夜行 紀念 t 恤 pirate queen zine tee',
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
          }
        }
      ],
      amounts: { goods: '$56.00', shipping: '$5.00', platform: '−$8.40', payment: '−$1.34', net: '$51.26' },
      total: '$56.00', totalAmt: 56,
      fx: { currency: 'TWD', paid: 'NT$1,921.50', rate: '1 USD = 31.5 TWD' }
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
      /* 部分退款：兩件已出貨，其中寫真誌那件退款（$24.00）。§7.2 規定單筆訂單只屬
         一個付款・結算狀態，所以付款軸是 refunded，退了多少寫在 refund 裡由明細頁說明。 */
      id: 'ZT-10476', date: '2026-06-06', kind: 'shipping',
      pay: 'refunded', fulfil: ['shipped'],
      text: 'zt-10476 hugo 九龍夜行 紀念 t 恤 幕後寫真誌 部分退款 tee zine partial refund',
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
          }
        }
      ],
      amounts: { goods: '$56.00', shipping: '$5.00', platform: '−$8.40', payment: '−$1.34', net: '$51.26' },
      total: '$56.00', totalAmt: 56,
      fx: { currency: 'TWD', paid: 'NT$1,921.50', rate: '1 USD = 31.5 TWD' },
      shipment: { carrier: '新竹物流', tracking: '8842-1096-5573' },
      /* 退款結果（§2.6）：金額與吸收順序仍以 Earnings 為準，本頁只呈現已發生的事實 */
      refund: { scope: 'partial', amount: '$24.00', on: '2026-06-10' }
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
          }
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
      /* 整筆退款：已完成的訂單事後整單退（商品金額＋運費）。履約軸留在已完成——
         退款動的是付款・結算軸，兩條軸不互相改寫（§2.2／PCR-001）。 */
      id: 'ZT-10474', date: '2026-06-03', kind: 'shipping',
      pay: 'refunded', fulfil: ['completed'],
      text: 'zt-10474 wen 九龍夜行 帆布低筒鞋 整筆退款 sneakers full refund',
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
          }
        }
      ],
      amounts: { goods: '$64.00', shipping: '$5.00', platform: '−$9.60', payment: '−$1.54', net: '$57.86' },
      total: '$64.00', totalAmt: 64,
      fx: { currency: 'TWD', paid: 'NT$2,173.50', rate: '1 USD = 31.5 TWD' },
      shipment: { carrier: '中華郵政', tracking: 'RR381204775TW' },
      refund: { scope: 'full', amount: '$69.00', on: '2026-06-11' }
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
  var PAY_BADGE = {
    unpaid:   { key: 'orders.pay.unpaid',   text: 'Unpaid',   cls: 'badge--warning' },
    paid:     { key: 'orders.pay.paid',     text: 'Paid',     cls: 'badge--success' },
    refunded: { key: 'orders.pay.refunded', text: 'Refunded', cls: 'badge--neutral' },
    disputed: { key: 'orders.pay.disputed', text: 'Disputed', cls: 'badge--error' }
  };

  /* ── 篩選頁籤（F2）的歸屬由狀態算出來，不手寫 ──────────────────────
     手寫兩份（徽章一份、頁籤一份）遲早會對不上：某一列顯示「已出貨」卻不出現在
     「已出貨」頁籤裡，是清單最難查的那種不一致。所以這裡由 pay／fulfil 直接推導。
     §7.2 允許清單把退款與爭議併成一個篩選分組，故兩者都落到 refund 這個頁籤；
     待取貨（pickup）沒有對應頁籤（F2 只有七個），所以不產生 token。 */
  var PAY_TAB = { unpaid: 'unpaid', paid: 'paid', refunded: 'refund', disputed: 'refund' };
  var FULFIL_TAB = { toship: 'toship', shipped: 'shipped', completed: 'completed' };
  ORDERS.forEach(function (o) {
    var tabs = [];
    var push = function (v) { if (v && tabs.indexOf(v) < 0) tabs.push(v); };
    push(PAY_TAB[o.pay]);
    o.fulfil.forEach(function (v) { push(FULFIL_TAB[v]); });
    o.filters = tabs;
  });

  /* ── F1 訂單摘要的四張 KPI 卡（5.1.5.3 F1）──────────────────────
     一樣由同一份資料算，不寫死數字——寫死的話補一筆訂單就會跟清單對不上。
       待出貨（To ship）    ＝履約軸有「待出貨」的訂單數。現場 QR 領取品項不列入
                             物流待出貨（F1 明文），所以只看 toship、不看 pickup。
       待處理（Pending）    ＝還沒付款、等著被處理的訂單數。
       退款／爭議           ＝落在 refund 篩選分組的訂單數（§7.2 允許兩者併組）。
       近 30 天完成         ＝履約軸已完成、且日期落在最新一筆訂單往前 30 天內的訂單數。
                             demo 資料是凍結的日期（2026-06），所以用資料裡最新的一天
                             當「今天」，否則這張卡永遠是 0。 */
  function toTime(d) { return new Date(String(d) + 'T00:00:00').getTime(); }
  function kpi() {
    var newest = ORDERS.reduce(function (m, o) { return Math.max(m, toTime(o.date)); }, 0);
    var floor = newest - 30 * 24 * 60 * 60 * 1000;
    var n = { toship: 0, pending: 0, refund: 0, completed: 0 };
    ORDERS.forEach(function (o) {
      if (o.fulfil.indexOf('toship') >= 0) n.toship++;
      if (o.pay === 'unpaid') n.pending++;
      if (o.filters.indexOf('refund') >= 0) n.refund++;
      if (o.fulfil.indexOf('completed') >= 0 && toTime(o.date) >= floor) n.completed++;
    });
    return n;
  }

  function normalize(id) { return String(id || '').replace(/^#/, '').trim().toUpperCase(); }

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
    payBadge: function (v) { return PAY_BADGE[v] || null; }
  };
})();
