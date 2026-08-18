/* js/bundle-editor.js — 回饋套組編輯器（共用模組）
   ============================================================================
   2026-07-30 抽出。原本住在 create-project.html 的頁內腳本（2026-07-28 第二代），
   現在四個掛載點共用同一份 markup 產生器：
     · create-project.html  「回饋套組」步驟（共創，wizard-split，池＝#fd-slots 即時值）
     · create-project.html  「預購方案」步驟（預購，shares:false）
     · project-detail.html  「方案與承諾 › 支持方案」（共創，bento，池＝原型固定值）
     · project-detail.html  「方案與承諾 › 預購方案」（預購，shares:false）

   2026-08-03（D166）新增 shares 選項：預購與共創的方案是同一個東西，差別只在
   **預購不含分潤名額**——分潤名額賣的是未來收益的一份，預購賣的是這個方案本身的
   可售份數。所以不另造一支編輯器，改成同一支關掉股份相關欄位（見 SHARES）。
   規格出處：documents/5.1.2.1-建立專案流程.md §5.3.2 F28／F29、decisions.md D166。

   2026-08-03（D167）預購方案必含作品：粉絲預購買的主體是作品本身，附屬商品只是搭配。
   所以 shares:false 時多出兩樣東西，仍然是同一支編輯器、同一組欄位機制：
     · 卡片內容區最上方固定一列「作品」，不可移除；下面才是附屬商品。
     · 新欄位「含作品份數」（最小 1、預設 1），與販售上限並排——兩者相乘就是這個方案
       最多能賣出幾份作品，正是發布前檢查用的那個數字。
   價格算式因此對兩型都成立：非商品那一段（共創＝名額 × 每名額單價，預購＝單位價格 ×
   含作品份數）＋ 商品定價加總，再套方案優惠。差別只有優惠能吃到哪一段：共創的分潤
   名額不可折讓，預購沒有分潤，作品與商品都可以折（見 maxDiscount）。

   為什麼抽出來：project-detail 原本是第一代編輯器（自由輸入商品＋照片上傳、沒有
   價格與販售上限），跟建立流程長得不一樣、欄位也對不上。同一個東西在站上有兩種
   長相，等於逼使用者學兩次。共用一支之後，改一次兩頁同時到位。

   ── 設計約束 ────────────────────────────────────────────────────────────────
   · 樣式一律吃 ds-components/bundle-editor.css 既有 class，模組不產生任何 inline
     色值／字級／間距。
   · i18n 不內建：翻譯函式由頁面注入（兩頁各有自己的 T()），模組只吐 key。
   · 名額池可注入：建立頁是會即時變動的 input，詳情頁是固定數字。
   · 每名額單價可注入（2026-07-30）：建立頁讀募資步驟的 #fd-perslot（會即時變動），
     詳情頁給固定值。價格因此是算出來的、不是填出來的——見 listPrice()／finalPrice()。

   狀態→渲染單向流：所有互動只改 BUNDLES，然後 render() 重畫。
   不做局部 DOM 手術——「編輯器顯示的東西與實際狀態不同步」正是第一代壞掉的方式。

   唯一例外：正在輸入的欄位不重畫（見 render() 的 focus 保留），否則每打一個字
   游標就跳回開頭。
   ========================================================================== */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var num = function (v) { var n = parseFloat(v); return Number.isFinite(n) ? n : NaN; };
  var el = function (x) { return typeof x === 'string' ? document.querySelector(x) : x; };

  /* 金額字串 → 數字。要吃下三種來源，任何一種解析失敗都當 0（不是 NaN）：
       · 商品目錄的定價字串        '24.00'、'3680'
       · 建立頁唯讀欄位的顯示值    '1,000'（帶千分位逗號）
       · 空值／未填                ''、null、undefined
     空值當 0 是刻意的：價格是「把有的東西加起來」，少一項就是少加，不是整條算式失效。
     ⚠ 幣別：商品假資料混著台幣定價（26MS Hoodie 標 3680），本輪一律當同幣別直接相加、
     不做匯率換算（使用者裁決，記在 ASSUMPTIONS）。 */
  var cash = function (v) {
    if (v == null) return 0;
    var n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  /* 百分比字串：整數就寫整數，除不盡才留一位小數（94.85% → 94.9%）。
     全部無條件取整會讓「實際生效的百分比」變成一句不精確的話，而那一句正是
     用來承認「你填的被截掉了」的——它自己必須說得準。 */
  var pctStr = function (n) { return String(Math.round(n * 10) / 10); };

  /* 目錄：persona-aware 的既有商品源。沒有它就退回空目錄，picker 只剩「新增商品」出口。 */
  function catalogue() {
    var P = window.ZTOR_PRODUCTS || {};
    /* 依名稱去重：ZTOR_PRODUCTS 把多個 persona 的商品併在同一個物件裡，所以同一件
       商品會以不同 key 出現好幾次（實測 27 筆裡「26MS Hoodie」出現 3 次）。
       key 不同＝技術上是不同列，但對創作者而言那是同一件商品——請人在三個一模一樣的
       選項之間挑一個，是把資料層的瑕疵當成使用者的問題。 */
    var seen = {};
    return Object.keys(P).reduce(function (acc, k) {
      var name = P[k].name;
      if (!name || seen[name]) return acc;
      seen[name] = true;
      acc.push({
        id: k,
        name: name,
        img: P[k].img ? 'images/products/' + P[k].img : '',
        price: P[k].price || '',
        meta: P[k].catLabel || '',
      });
      return acc;
    }, []);
  }

  /* 種子資料裡的商品可以只寫 { id }：名稱／縮圖／價格從商品源查回來，
     不必在頁面裡把商品名再抄一遍（抄一遍就會跟 persona 切換脫節）。

     先查 ZTOR_PRODUCTS 原始表、查不到才退回 catalogue()：catalogue 為了 picker 好用
     會依名稱去重，而某些 persona 的 key 是別名（movie／album／zine 指到同一批實體商品），
     別名剛好都是被去重掉的那一份。picker 不該列出重複選項，但「用 id 指定一件已知商品」
     跟去重無關——照 catalogue 查會查不到，那是把 UI 的整理規則誤用成資料的存在性。

     ⚠ 2026-07-30：品項一定要帶 price——套組價是從商品定價加總出來的，只留 meta
     （給人看的字串）等於把價格藏在顯示層裡，之後只能用正規表示式從 '$24.00' 挖回來。 */
  function resolveItem(it) {
    if (!it) return null;
    if (it.name) return { id: it.id, name: it.name, img: it.img || '', meta: it.meta || '', price: it.price || '' };
    var raw = (window.ZTOR_PRODUCTS || {})[it.id];
    if (raw && raw.name) {
      return {
        id: it.id,
        name: raw.name,
        img: raw.img ? 'images/products/' + raw.img : '',
        meta: raw.price ? '$' + raw.price : (raw.catLabel || ''),
        price: raw.price || '',
      };
    }
    var p = catalogue().filter(function (x) { return x.id === it.id; })[0];
    if (!p) return null;
    return { id: p.id, name: p.name, img: p.img, meta: p.price ? '$' + p.price : p.meta, price: p.price || '' };
  }

  /* ══ mount ═══════════════════════════════════════════════════════════════
     opts:
       list               卡片容器（Element 或 selector）           必填
       addBtn             「新增套組」按鈕（Element 或 selector）    選填
       t                  翻譯函式 (key) => string                 選填（預設走 window.i18nT）
       getPool            () => number  名額池，優先權最高           選填
       poolInput          讀 .value 當名額池的 input                選填
       pool               固定數字的名額池                          選填
       getPerSlot         () => number  每名額單價，優先權最高       選填
       perSlotInput       讀 .value 當每名額單價的 input            選填
       perSlot            固定數字的每名額單價                      選填
       getUnitPrice       () => number  作品單位價格，優先權最高     選填（僅預購）
       unitPriceInput     讀 .value 當作品單位價格的 input          選填（僅預購）
       unitPrice          固定數字的作品單位價格                    選填（僅預購）
       getWorkName        () => string  作品名稱，優先權最高         選填（僅預購）
       workName           固定的作品名稱                            選填（僅預購）
       initial            初始套組陣列（見 newBundle 的欄位）        選填
       collapsedByDefault initial 的卡片是否預設收合                選填（預設 false）
       shares             是否含分潤名額（預設 true；預購傳 false）  選填
       onChange           狀態變動後的回呼 (bundles) => void         選填
     回傳 instance：見檔尾的 return。
     ════════════════════════════════════════════════════════════════════════ */
  function mount(opts) {
    opts = opts || {};
    var list = el(opts.list);
    if (!list) return null;
    var addBtn = el(opts.addBtn);
    var T0 = opts.t || function (k) { return (window.i18nT && window.i18nT(k)) || k; };
    var onChange = opts.onChange || function () {};

    /* SHARES=false（預購）關掉的東西，逐項對應 D166：
         · 含分潤名額欄位整格不出現（沒有分潤，就沒有名額可填）
         · 販售上限的「自動」不出現——自動是從名額池除出來的，預購沒有池子，
           那顆按鈕會是一個永遠算不出數字的選項。只留「不限量」與「限量」。
       同一個旗標同時打開預購專屬的東西（D167）：作品列與含作品份數欄位。
       兩邊都掛在 SHARES 上，不複製第二支編輯器。
       其餘（價格、一句話說明、商店商品、額外權益、套組優惠）兩型完全相同。
       非 limited 的那個選項在兩型的內部值刻意不同（auto／unlimited），
       讓狀態自己說得出「這是推導出來的」還是「這是真的沒有上限」；所有判斷式
       一律寫成「是不是 limited」，不寫「是不是 auto」。 */
    var SHARES = opts.shares !== false;
    var AVAIL_OPEN = SHARES ? 'auto' : 'unlimited';

    /* 活動套組變體（2026-08-04）：使用者裁決「活動套組、募資套組、電子商店組合包是同一件事的
       三個變體」，所以不開第二支編輯器，改在這支加兩個**選配**能力。兩個都不傳時行為與先前
       一模一樣，募資那兩個消費頁（create-project／project-detail）不受影響。
         · cover   ＝ 每張卡一張封面圖。活動套組每一組賣的是不同的東西，卡與卡之間要靠圖分辨
                     （電子商店組合包也有主圖，日後併過來時同一個旗標就能用）。
         · tickets ＝ 適用票種勾選清單。活動套組「一定含一張票」，所以有票種時至少要勾一個
                     才算有效（isValid）。傳陣列或傳 getter 都可以——票種在建立流程中會即時
                     增減，getter 才拿得到當下的值。 */
    /* work:false ＝ 沒有「作品」這個本體（活動套組賣的是票＋商品，不是一份作品的份數）。
       只在 shares:false 時有意義：共創本來就沒有作品這一段。 */
    var WORK = opts.work !== false;
    var COVER = !!opts.cover;
    var getTickets = typeof opts.tickets === 'function' ? opts.tickets
                   : (opts.tickets ? function () { return opts.tickets; } : null);

    /* 分段版型（2026-08-13，`layout: 'sections'`）：活動變體專用。使用者先要 UI 規劃、
       看過 `docs/bundle-step-demo.html` 之後裁示「照這樣改正式」。募資兩個消費頁不傳
       這個選項，走原本的版型，一行都不受影響。

       版型差在**順序**：預設是名稱＊ → 說明 → 封面圖 → 內容 → 數量 → 權益 → 定價，
       等於要創作者先替一個還沒有內容的盒子取名字；分段版把它倒過來——
         ① 這一組賣什麼（適用票種／商店商品／額外權益）
         ② 怎麼賣（原價加總 → 折扣 → 粉絲付，一列算完；販售上限）
         ③ 怎麼呈現（名稱＊／一句話說明／封面圖同一列）
       名稱移到最後，並從內容自動擬建議名，必填欄從空白格變成確認一下。

       票種項目可以多帶兩個**選配**欄位，帶了才啟用對應能力（不帶就是今天的平清單）：
         · group ＝ {id, name}  這張票屬於哪一場 → 挑選器依場次分組、組頭可整場全選
         · kind  ＝ {id, name}  這張票是哪一個票種 → 一排跨場次的票種捷徑
         · qty   ＝ 這張票有幾張（只顯示，不參與計算）
       為什麼掛在票種項目上而不是另開一個 groups 選項：分組資訊本來就是票自己的屬性，
       分開傳會出現「兩份清單對不起來」的可能。 */
    var SECTIONS = opts.layout === 'sections';

    /* 預購模式優先讀 `<key>.pre` 的文案，查不到才回落共用那組（2026-08-03 使用者裁決）。
       兩型的字彙本來就不同：共創賣的是「套組」給「支持者」，預購賣的是「方案」給
       「預購者」。共用同一組字串會讓其中一邊永遠說錯話，而各自複製一整套字典又會
       在下次改文案時分岔——所以只覆寫講法不同的那幾條，其餘照舊共用。 */
    /* 字彙變體（2026-08-04 由 `.pre` 一種擴成三種）：三個變體賣的東西不同，講法就不該相同。
         共創 → 基礎字串（套組／支持者）
         預購 → `.pre`（方案／預購者／作品）
         活動 → `.ev`（套組／買這組的人）
       只覆寫講法真的不同的那幾條，其餘照舊共用——各自複製一整套字典會在下次改文案時分岔。 */
    var VOC = SHARES ? '' : (WORK ? 'pre' : 'ev');
    function T(k) {
      if (VOC) {
        var alt = T0(k + '.' + VOC);
        if (alt && alt !== k + '.' + VOC) return alt;
      }
      return T0(k);
    }

    var BUNDLES = [];
    var seq = 0;

    /* 名額＝分潤單位。included slots = 0 代表「純回饋、不分潤」，這是合法且常見的。 */
    function newBundle(seed) {
      seq += 1;
      var b = {
        id: 'b' + seq,
        name: '', desc: '',
        /* price 不在狀態裡：它是 listPrice()／finalPrice() 從名額、商品、每名額單價
           推導出來的（2026-07-30 使用者裁決）。存一份等於多一個會跟算式分岔的真相。 */
        /* ⚠ discount ＝ **百分比**（0–100），不是金額（2026-07-30 使用者裁決改制）。
           欄位名沿用 discount 以免動到兩頁的種子資料與焦點還原選擇器，但值的單位變了：
           折抵金額 ＝ 原價 × discount ÷ 100，見 discountRaw()。當成金額讀會差好幾個量級。 */
        discount: '',         // 套組優惠（百分比，可留空）——唯一與價格有關的使用者輸入
        slots: 0,
        /* 含作品份數（D167，只在預購用）：最小 1、預設 1。共創沒有這個欄位，值留著也
           不會被讀到（unitCount() 先看 SHARES）。雙人票類方案填 2。 */
        units: 1,
        /* 共創：auto | limited（2026-07-28：unlimited → auto，見 maxUnits）
           預購：unlimited | limited（2026-08-03 D166，沒有名額池可推導） */
        avail: AVAIL_OPEN,
        cap: '',
        items: [],            // [{id, name, img, meta, price}] — 引用，不是自由文字
        perks: [],            // [string] — 自由文字，見 bundle-editor.css 的說明
        /* 只有 cover／tickets 選項打開時才有意義；關著時留在狀態裡也不會被讀到。
           cover 是布林不是圖：原型沒有素材儲存，上傳格自己顯示縮圖，這裡只記「有沒有」。 */
        cover: false,
        tickets: [],          // [票種 id] — 活動套組適用哪幾種票
        /* 分段版型專用，其餘版型留著不會被讀到：
             scope    shared＝一組通用所有場次｜per＝每場各一組（送出時展開成 N 組）
             pickOpen 票種挑選器是不是展開中（選完收成 chip，清單只在挑選當下展開） */
        scope: 'shared',
        /* 折扣預設關（比照建立商品的「折扣設定」）：多數組合包不打折。 */
        discountOn: false,
        pickOpen: true,
        /* fresh＝這一組是剛按「新增」開出來的，還沒送出過。只影響兩件事：彈窗標題
           寫「新增」還是「編輯」、以及沒填任何東西就關掉時要不要直接丟掉。 */
        fresh: true,
        collapsed: false,
      };
      if (seed) {
        /* price 刻意不從 seed 收：舊種子資料還帶著寫死的價格，收進來會蓋掉算出來的值。 */
        Object.keys(seed).forEach(function (k) { if (k !== 'id' && k !== 'items' && k !== 'price') b[k] = seed[k]; });
        if (seed.items) {
          b.items = seed.items.map(resolveItem).filter(Boolean);
        }
        /* 預購沒有分潤名額：種子若帶了 slots／avail:'auto'，一律歸零、退回 unlimited。
           留著會讓價格算式偷偷加進一段畫面上根本沒有欄位可以解釋的錢。 */
        if (!SHARES) {
          b.slots = 0;
          if (b.avail !== 'limited') b.avail = 'unlimited';
        }
      }
      return b;
    }

    var get = function (id) { return BUNDLES.filter(function (b) { return b.id === id; })[0]; };

    /* ── 價格（2026-07-30 使用者裁決：唯讀、自動計算）──────────────────────
       原價   ＝ 基底 ＋ 所選商店商品定價加總
                 基底：共創＝含分潤名額 × 每名額單價；預購＝單位價格 × 含作品份數（D167）
       套組價 ＝ 原價 − min(原價 × 套組優惠%, 可折抵上限)
       可折抵上限 ＝ 原價 − 不可折讓的那一段（maxDiscount）
                 共創的不可折讓段＝分潤名額的價值；預購沒有分潤，作品與商品都可以折，
                 所以上限就是原價全額（D167 的算式把優惠乘在整包上）。
       上限的百分比說法 ＝ maxPct()＝floor(可折抵上限 ÷ 原價 × 100)

       為什麼不讓人手填：這兩項本來就是算得出來的。名額的單價在募資步驟已經定死
       （目標金額 ÷ 支持者名額），商品的定價住在商品自己的頁面——要創作者再打一次
       一個他無權決定的數字，就是把對帳工作外包給他，而且兩邊一定會漂移。
       真正屬於創作者的定價決定只剩一個：要不要給這個組合一點折扣（見 discount）。

       為什麼折扣不能吃到名額那一段（2026-07-30 追加裁決）：名額賣的是**淨收益的股份**，
       它的單價是募資設定除出來的一個對所有人一致的數字。允許某張套組把名額折價賣，
       等於同一份股份在不同套組有不同價錢——那不是行銷折扣，那是把分潤條件改掉。
       所以折扣的作用範圍只到「商品」這一段，折後價格的地板就是這張卡的股份總價。

       為什麼優惠改用百分比（2026-07-30 使用者裁決）：原價本身是算出來的，會隨名額單價
       與商品增減浮動。填死金額的話，每次原價一變，那個金額就悄悄變成另一種折扣力道；
       填百分比則是「打幾折」這個意圖本身，原價怎麼變都還是同一個意圖。
       地板不變：百分比只是換一種寫法，實際折抵仍夾在商品那一段之內。 */
    function perSlot() {
      var n;
      if (typeof opts.getPerSlot === 'function') n = cash(opts.getPerSlot());
      else if (opts.perSlotInput) { var pe = el(opts.perSlotInput); n = pe ? cash(pe.value) : 0; }
      else n = cash(opts.perSlot);
      return n > 0 ? n : 0;
    }
    function slotCount(b) {
      if (!SHARES) return 0;   /* 預購沒有分潤名額，股份那一段一律 0 */
      var s = num(b.slots);
      return Number.isFinite(s) && s > 0 ? s : 0;
    }
    /* 作品的單位價格（D167）：共創沒有這個概念，一律 0。
       來源是「預購設定」步驟的單位價格欄位——它管的是作品一份多少錢，不是方案價格。 */
    function unitPrice() {
      if (SHARES) return 0;
      var n;
      if (typeof opts.getUnitPrice === 'function') n = cash(opts.getUnitPrice());
      else if (opts.unitPriceInput) { var ue = el(opts.unitPriceInput); n = ue ? cash(ue.value) : 0; }
      else n = cash(opts.unitPrice);
      return n > 0 ? n : 0;
    }
    /* 含作品份數：最小 1。欄位清空或亂填時回落到 1 而不是 0——作品是必含項，
       說成 0 份等於在價格裡默默把預購的主體拿掉。共創恆為 0（沒有作品那一段）。 */
    function unitCount(b) {
      if (SHARES) return 0;
      var n = num(b.units);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
    }
    function itemsTotal(b) {
      return b.items.reduce(function (sum, it) { return sum + cash(it.price); }, 0);
    }
    /* 這張卡的股份總價＝共創折後價格的地板（預購沒有股份，恆為 0）。 */
    function shareValue(b) { return slotCount(b) * perSlot(); }
    /* 這張卡的作品總價（預購專屬）。 */
    function workValue(b) { return unitCount(b) * unitPrice(); }
    /* 票那一段（分段版型／活動套組，2026-08-13）。在此之前活動套組的原價只加商品，
       等於一組「VIP 票 ＋ T 恤」報的價把票本身漏掉了——那不是折扣，是算錯。

       取**勾選的票裡最貴的那一張**：這一組適用多張票時粉絲只挑一種（見 cpp.bd.tickets.hint），
       所以真正會被賣掉的只有一張。取最貴的是保守估——算便宜了會讓折後價看起來比實際低。
       粉絲若挑了便宜的那一張，實收與這個數字對不上，折扣百分比該以哪一張為基準未定，
       記在 ASSUMPTIONS BDL-002。
       只在分段版型生效：募資兩型沒有票，getTickets 也不存在。 */
    function ticketValue(b) {
      if (!SECTIONS || !getTickets) return 0;
      var tks = getTickets() || [];
      var chosen = b.tickets || [];
      return tks.reduce(function (top, t) {
        return chosen.indexOf(t.id) >= 0 ? Math.max(top, cash(t.price)) : top;
      }, 0);
    }
    function listPrice(b) { return shareValue(b) + workValue(b) + ticketValue(b) + itemsTotal(b); }
    /* 可折抵上限＝原價扣掉不可折讓的那一段（＝分潤名額）。
       共創：等於商品定價加總，與 2026-07-30 的行為完全相同。
       預購：shareValue 恆為 0，所以上限就是原價全額（作品與商品都能折）。 */
    function maxDiscount(b) { return listPrice(b) - shareValue(b); }
    /* 上限的百分比說法。向下取整＝寧可少說一點也不要說出一個會被截掉的數字
       （94.85% 寫成 95% 的話，照著填就會踩到超標）。 */
    function maxPct(b) {
      var lp = listPrice(b);
      return lp > 0 ? Math.floor(maxDiscount(b) / lp * 100) : 0;
    }
    /* 使用者實際填的（可能超標）與實際生效的（夾在上限內）分開，
       兩個都要拿得到——否則畫面沒辦法誠實地說「你填的被截掉了」。 */
    /* 折扣開關關著時一律 0：分段版型把折扣收進開關之後，欄位可能還留著舊值，
       但畫面上已經沒有那一段——算式必須跟畫面說同一件事。 */
    function discountPct(b) {
      if (SECTIONS && !b.discountOn) return 0;
      var p = cash(b.discount); return p > 0 ? p : 0;
    }
    function discountRaw(b) { return listPrice(b) * discountPct(b) / 100; }
    function discountOf(b) { return Math.min(discountRaw(b), maxDiscount(b)); }
    /* 用金額比而不是比百分比：上限本身是金額（商品那一段），換算成百分比會有取整誤差，
       拿取整後的數字當判準會在邊界上判錯。留 0.005 的容差吃掉浮點尾數。 */
    function discountOver(b) { return discountRaw(b) > maxDiscount(b) + 0.005; }
    /* 實際生效的百分比（＝夾過上限之後回推）。超標時畫面要說的就是這個數字，
       不是使用者填的那個。 */
    function effPct(b) {
      var lp = listPrice(b);
      return lp > 0 ? discountOf(b) / lp * 100 : 0;
    }
    /* 不需要再夾 0：listPrice − discountOf ≥ shareValue ≥ 0，地板是股份總價不是零。 */
    function finalPrice(b) { return listPrice(b) - discountOf(b); }

    /* ── 一張套組卡是否可用：有名字，而且裡面真的裝了東西 ──────────────────
       2026-07-30 改判準。舊版是「有名字＋價格 > 0」，但價格已經不是人填的了——
       新卡的價格必然是 0，照舊判準永遠無效，Continue 也就永遠打不開。
       「裝了東西」＝含名額（買的是分潤）或至少一件商品（買的是實物）。
       兩者皆無的套組收了錢卻沒有任何對價，那不是還沒填完，是不該存在。 */
    /* 2026-08-03（D167）預購版的判準退回「有名稱」一條：作品是必含項，任何一張預購方案
       都至少裝著一份作品，對價從來不會是空的。舊版要求「至少一件商品或一項權益」是在
       作品還不在方案裡的時候寫的，現在照舊判準會把一張只賣作品本身的方案判成無效——
       而那正是最基本、最常見的預購方案。 */
    function isValid(b) {
      if (!String(b.name).trim().length) return false;
      // 活動套組一定含一張票（使用者裁決）：有票種可勾時，一個都沒勾就不算成立
      if (getTickets && !(b.tickets || []).length) return false;
      if (!SHARES) return WORK ? unitCount(b) >= 1 : true;
      if (b.items.length > 0) return true;
      return slotCount(b) > 0;
    }
    /* ── 販售上限（2026-07-28 使用者裁示改制）─────────────────────────────
       舊制：含名額就強制 Limited、要創作者自己打一個數字，否則算成「無上限的分潤承諾」。
       那是把一個算得出來的數字丟回去給人填——名額本來就有一個共用池（募資頁的
       Supporter slots），賣掉多少就少多少，每張套組能賣幾份是**除出來的**，不是填的。

       新制兩種模式：
         auto    ＝ 從池子推導。可賣份數 = floor(剩餘池 ÷ 每份含的名額)。
                   含 0 名額（純回饋不分潤）不吃池子 → 真正無上限。
         limited ＝ 創作者主動點選、手動輸入的硬上限（想更早收手時才用）。

       使用者的例子：池 100、A 每份 10 名額、B 每份 50。
       B 賣掉 1 份 → 池剩 50 → A 還能賣 5 份（50÷10）。兩張卡共享同一個池，
       所以 auto 不預先佔用名額（committed = 0）；只有 limited 會把 cap×slots 鎖起來，
       auto 再從沒被鎖走的餘額裡推導。這樣就不可能超賣，也就不需要舊的 unbounded 錯誤態。 */
    function pool() {
      var n;
      if (typeof opts.getPool === 'function') n = num(opts.getPool());
      else if (opts.poolInput) { var pi = el(opts.poolInput); n = pi ? num(pi.value) : NaN; }
      else n = num(opts.pool);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : NaN;
    }
    /* Limited 卡硬鎖走的名額總數——auto 只能用剩下的。 */
    function reservedSlots() {
      return BUNDLES.reduce(function (sum, b) {
        if (b.avail !== 'limited') return sum;
        var s = num(b.slots), c = num(b.cap);
        return sum + (Number.isFinite(s) && s > 0 && Number.isFinite(c) && c > 0 ? s * c : 0);
      }, 0);
    }
    /* auto 模式推導出的可賣份數。池子沒填 → 先當無上限（募資頁填了就會重算）。 */
    function autoUnits(b) {
      var s = num(b.slots);
      if (!Number.isFinite(s) || s <= 0) return Infinity;   // 不含名額＝不吃池子
      var p = pool();
      if (!Number.isFinite(p)) return Infinity;
      return Math.max(0, Math.floor((p - reservedSlots()) / s));
    }
    function maxUnits(b) {
      if (b.avail === 'limited') { var c = num(b.cap); return Number.isFinite(c) && c > 0 ? c : 0; }
      return autoUnits(b);
    }
    /* 「已承諾的名額」只算 limited：auto 是從池子裡拿，不會把池子撐破，
       把它的理論最大值也加總進來會重複計算（A 100 ＋ B 100 ＞ 池 100）。 */
    function committedSlots(b) {
      var s = num(b.slots);
      if (!Number.isFinite(s) || s <= 0) return 0;
      if (b.avail !== 'limited') return 0;
      var u = maxUnits(b);
      return u === Infinity ? Infinity : s * u;
    }

    /* ── 渲染 ───────────────────────────────────────────────────────────── */
    function itemsHTML(b) {
      if (!b.items.length) return '';
      return b.items.map(function (it) {
        return '<div class="fc-ref" data-bd-ref="' + esc(it.id) + '">' +
          (it.img ? '<img class="fc-ref__thumb" src="' + esc(it.img) + '" alt="" loading="lazy">'
                  : '<span class="fc-ref__thumb"></span>') +
          '<div><div class="fc-ref__name">' + esc(it.name) + '</div>' +
            (it.meta ? '<div class="fc-ref__meta">' + esc(it.meta) + '</div>' : '') + '</div>' +
          '<button class="btn btn--icon btn--xs" type="button" data-bd-item-remove aria-label="' +
            esc(T('cpp.bd.item.remove')) + '"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>';
      }).join('');
    }

    /* 作品列（預購專屬，D167）：固定在內容區最上方、沒有移除鈕，右側掛一顆「必含」徽章。
       為什麼不做成商品清單裡的一列：作品的定價來自預購設定、附屬商品的定價來自電子商店，
       兩者資料來源不同；混在同一份清單裡，「哪一列可以移除」就只能靠使用者記住。
       次要資訊寫的是這一列怎麼算成錢（單價 × 份數 ＝ 小計），價格區塊的算式才有源頭。 */
    function workRowHTML(b) {
      var u = unitCount(b), p = unitPrice();
      return '<div class="fc-ref fc-ref--work" data-bd-work>' +
        '<span class="fc-ref__thumb fc-ref__thumb--work"><i data-lucide="package" class="ztor-icon"></i></span>' +
        '<div><div class="fc-ref__name" data-bd-work-name>' + esc(workName()) + '</div>' +
          '<div class="fc-ref__meta" data-bd-work-meta>' + esc(workMetaText(b)) + '</div></div>' +
        '<span class="badge badge--neutral">' + esc(T('cpp.bd.work.req')) + '</span>' +
      '</div>';
    }
    function workName() {
      var s = typeof opts.getWorkName === 'function' ? opts.getWorkName() : opts.workName;
      s = String(s == null ? '' : s).trim();
      return s || T('cpp.bd.work.untitled');
    }
    function workMetaText(b) {
      var u = unitCount(b), p = unitPrice();
      if (!(p > 0)) return T('cpp.bd.work.meta.noprice');
      return T('cpp.bd.work.meta')
        .replace('{per}', money(p))
        .replace('{n}', String(u))
        .replace('{unit}', T(u === 1 ? 'cpp.bd.n.copy' : 'cpp.bd.n.copies'))
        .replace('{sum}', money(workValue(b)));
    }

    /* 限量時 cap 欄位底下那一行。
       共創講的是硬上限與名額池的先後（靜態一句）；預購講的是上限與份數相乘出來的
       結果——那正是發布前檢查會拿去跟最少預購數比的數字，寫在這裡才不必自己乘。 */
    function capHintText(b) {
      if (SHARES) return T('cpp.bd.cap.hint');
      var u = unitCount(b), c = num(b.cap);
      var unit = T(u === 1 ? 'cpp.bd.n.copy' : 'cpp.bd.n.copies');
      if (!Number.isFinite(c) || c <= 0) {
        return T('cpp.bd.cap.calc.nocap').replace('{n}', String(u)).replace('{unit}', unit);
      }
      c = Math.floor(c);
      return T('cpp.bd.cap.calc')
        .replace('{cap}', c.toLocaleString('en-US'))
        .replace('{n}', String(u))
        .replace('{unit}', unit)
        .replace('{total}', (c * u).toLocaleString('en-US'));
    }

    function perksHTML(b) {
      return b.perks.map(function (p, i) {
        return '<div class="fc-perk">' +
          '<input class="input" data-bd-perk="' + i + '" value="' + esc(p) + '" placeholder="' +
            esc(T('cpp.bd.perk.ph')) + '">' +
          '<button class="btn btn--icon btn--xs" type="button" data-bd-perk-remove="' + i + '" aria-label="' +
            esc(T('cpp.bd.perk.remove')) + '"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>';
      }).join('');
    }

    /* 價格欄底下那一行：把錢是怎麼加出來的寫成一句話。
       唯讀欄位如果不解釋自己，看到的人只會覺得那個數字是憑空出現的。 */
    function priceHintText(b) {
      var s = slotCount(b), per = perSlot(), n = b.items.length;
      var u = unitCount(b), unitP = unitPrice();
      if (SHARES ? (!s && !n) : (!unitP && !n)) {
        return T(SHARES ? 'cpp.bd.price.calc.empty' : 'cpp.bd.qty.price.empty');
      }
      var parts = [];
      /* 預購：作品那一段永遠排第一，它是這筆預購的主體，附屬商品才接在後面。 */
      if (!SHARES) {
        var copyUnit = T(u === 1 ? 'cpp.bd.n.copy' : 'cpp.bd.n.copies');
        parts.push(unitP > 0
          ? T('cpp.bd.price.calc.work').replace('{n}', String(u)).replace('{unit}', copyUnit).replace('{per}', money(unitP))
          : T('cpp.bd.price.calc.nounit').replace('{n}', String(u)).replace('{unit}', copyUnit));
      }
      if (s > 0) {
        /* 單複數借既有的量詞 key（摘要列也用同一組），別再造第二套 */
        var slotUnit = T(s === 1 ? 'cpp.bd.n.slot' : 'cpp.bd.n.slots');
        parts.push(per > 0
          ? T('cpp.bd.price.calc.slots').replace('{n}', String(s)).replace('{unit}', slotUnit).replace('{per}', money(per))
          : T('cpp.bd.price.calc.noper').replace('{n}', String(s)).replace('{unit}', slotUnit));
      }
      if (n > 0) {
        parts.push(T('cpp.bd.price.calc.items')
          .replace('{n}', String(n))
          .replace('{unit}', T(n === 1 ? 'cpp.bd.n.item' : 'cpp.bd.n.items'))
          .replace('{sum}', money(itemsTotal(b))));
      }
      var joined = parts.join(T('cpp.bd.price.calc.plus'));
      var d = discountOf(b);
      if (d > 0) {
        /* 百分比與金額並陳：百分比是使用者的意圖，金額是它落在這張卡上的後果，
           只寫一個就得自己心算另一個。 */
        return T('cpp.bd.price.calc.discounted')
          .replace('{parts}', joined)
          .replace('{list}', money(listPrice(b)))
          .replace('{pct}', pctStr(effPct(b)))
          .replace('{disc}', money(d))
          .replace('{total}', money(finalPrice(b)));
      }
      return T('cpp.bd.price.calc.total').replace('{parts}', joined).replace('{total}', money(finalPrice(b)));
    }

    /* 套組優惠欄底下那一行：說出上限是多少、為什麼是那個數字，超標時自己承認被截掉。
       靜靜把使用者打的 9999 換成 2268 而不吭聲，是讓畫面上的數字跟他記得自己做的事
       對不起來——那比擋下來還糟。 */
    function discountHintText(b) {
      var max = maxDiscount(b), share = shareValue(b);
      if (listPrice(b) <= 0) return T('cpp.bd.discount.hint');   /* 卡片還是空的，沒有上限可談 */
      /* 上限是 0 的卡（只含名額、沒有商品）永遠說同一句話，不管填了什麼。填了當然算
         超標、欄位照樣轉紅，但「實際只折 0%（−$0）」是一句用算式包裝的廢話——
         真正該說的是「這張卡沒有可折抵的部分」以及為什麼。 */
      if (max <= 0) return T('cpp.bd.discount.none').replace('{share}', money(share));
      if (discountOver(b)) {
        /* 超標時說的是「實際生效的百分比與金額」，不是上限的取整值——這一句的
           全部作用就是承認截掉了多少，它自己不能再含糊。 */
        return (share > 0 ? T('cpp.bd.discount.over') : T('cpp.bd.discount.over.all'))
          .replace('{pct}', pctStr(effPct(b)))
          .replace('{amt}', money(discountOf(b)))
          .replace('{share}', money(share));
      }
      return (share > 0 ? T('cpp.bd.discount.cap') : T('cpp.bd.discount.cap.all'))
        .replace('{max}', String(maxPct(b))).replace('{share}', money(share));
    }

    /* 收合摘要列的價格格：有優惠時原價劃掉並列在套組價前面。
       只寫套組價會讓「這張卡有折扣」這件事在收合狀態下完全消失——而收合狀態正是
       創作者比較三張卡的那一屏。 */
    function summaryPriceHTML(b) {
      if (listPrice(b) <= 0) return '—';
      var d = discountOf(b);
      return (d > 0
        ? '<span class="fc-sum__was" title="' + esc(T('cpp.bd.price.list')) + '">' + esc(money(listPrice(b))) + '</span>'
        : '') + esc(money(finalPrice(b)));
    }

    /* 展開態右上角的價格：標籤「套組價」＋放大的金額（2026-07-30 使用者選定）。
       展開時卡片最後才是定價區塊，中間隔著五組欄位；編輯名額或商品的當下看不到
       自己把價格改成多少，等於要一路捲到底才知道剛才那一下的後果。標籤是必要的——
       右上角一個沒有名字的數字，跟卡片最後那個有算式的數字看起來會像兩件事。 */
    function headPriceHTML(b) {
      if (listPrice(b) <= 0) return '<span class="fc-sum__tag">' + esc(T('cpp.bd.price.tag')) + '</span>—';
      var d = discountOf(b);
      return '<span class="fc-sum__tag">' + esc(T('cpp.bd.price.tag')) + '</span>' +
        (d > 0
          ? '<span class="fc-sum__was" title="' + esc(T('cpp.bd.price.list')) + '">' + esc(money(listPrice(b))) + '</span>'
          : '') +
        '<span class="fc-sum__val">' + esc(money(finalPrice(b))) + '</span>';
    }

    /* 收合摘要：名稱 · 內容物 · 名額｜價格。內容物寫成人看得懂的一句，不是計數器。 */
    function summaryMeta(b) {
      var bits = [];
      /* 預購的收合列先報含幾份作品（規格 F28 要求卡片顯示含作品份數），再報附屬商品。
         2026-08-13 修條件：原本掛在 `!SHARES`（有沒有分潤名額），但「有沒有作品」是 WORK
         管的——活動變體明明傳了 `work:false`，收合列仍寫著「1 份作品」，而活動套組裡
         裝的是票和商品，根本沒有作品這個東西。改掛 WORK 之後活動變體改報票與商品。 */
      if (!SHARES && WORK) {
        var u = unitCount(b);
        bits.push(u + ' ' + T(u === 1 ? 'cpp.bd.n.copy' : 'cpp.bd.n.copies'));
      }
      /* 活動套組報「含幾張票」——那是這一組的主體，不報等於摘要沒說出它賣什麼。 */
      if (getTickets && (b.tickets || []).length) {
        var n = b.tickets.length;
        bits.push(n + ' ' + T(n === 1 ? 'cpp.bd.n.ticket' : 'cpp.bd.n.tickets'));
      }
      if (b.items.length) bits.push(b.items.length + ' ' + T(b.items.length === 1 ? 'cpp.bd.n.item' : 'cpp.bd.n.items'));
      if (b.perks.length) bits.push(b.perks.length + ' ' + T(b.perks.length === 1 ? 'cpp.bd.n.perk' : 'cpp.bd.n.perks'));
      var s = slotCount(b);   /* 預購恆為 0，摘要列不會冒出「N 個名額」 */
      if (s > 0) bits.push(s + ' ' + T(s === 1 ? 'cpp.bd.n.slot' : 'cpp.bd.n.slots'));
      if (b.avail === 'limited' && num(b.cap) > 0) bits.push(num(b.cap) + ' ' + T('cpp.bd.n.available'));
      return bits.length ? bits.join(' · ') : T('cpp.bd.sum.empty');
    }

    /* ══ 分段版型（SECTIONS）的產生器 ═══════════════════════════════════════
       只在 `layout:'sections'` 時走這一條；其餘版型完全不會呼叫到這一段。 */

    /* 票種清單依 `group` 收成場次分組。沒有 group 的票全部歸進一個匿名組（＝單場活動），
       畫面上不畫組頭——單場沒有「哪一場」要區分。 */
    function ticketGroups() {
      var tks = getTickets ? (getTickets() || []) : [];
      var order = [], byId = {};
      tks.forEach(function (t) {
        var g = t.group || { id: '', name: '' };
        if (!byId[g.id]) { byId[g.id] = { id: g.id, name: g.name, rows: [] }; order.push(g.id); }
        byId[g.id].rows.push(t);
      });
      return order.map(function (id) { return byId[id]; });
    }
    /* 票種捷徑用的「種類」清單（跨場次）。票沒帶 kind 就沒有捷徑可給。 */
    function ticketKinds() {
      var tks = getTickets ? (getTickets() || []) : [];
      var order = [], byId = {};
      tks.forEach(function (t) {
        if (!t.kind) return;
        if (!byId[t.kind.id]) { byId[t.kind.id] = { id: t.kind.id, name: t.kind.name, ids: [] }; order.push(t.kind.id); }
        byId[t.kind.id].ids.push(t.id);
      });
      return order.map(function (id) { return byId[id]; });
    }
    function ticketById(id) {
      var tks = getTickets ? (getTickets() || []) : [];
      return tks.filter(function (t) { return t.id === id; })[0];
    }
    /* 建議名稱＝票種名（跨場次去重）＋第一件商品。沒有內容就不給——沒東西可依據時
       擬出來的名字是猜的，不是建議。 */
    function suggestName(b) {
      var chosen = b.tickets || [];
      if (!chosen.length) return '';
      var seen = {}, names = [];
      chosen.forEach(function (id) {
        var t = ticketById(id);
        if (!t) return;
        var n = t.kind ? t.kind.name : t.name;
        if (n && !seen[n]) { seen[n] = true; names.push(n); }
      });
      var head = names.join('／');
      if (!head) return '';
      return b.items.length ? head + ' ＋ ' + b.items[0].name : head;
    }

    /* 兩個共用字串為預設版型帶了排版用的分隔符——`cpp.bd.perks.sub` 前面有「· 」
       （它接在標籤同一行後面），`cpp.bd.discount` 後面有「 · %」（那時沒有 % 後綴欄）。
       分段版型把它們各自放到自己的一行、而且真的有 % 後綴，分隔符就變成畫面上的雜訊。
       在這裡剝掉而不是另建兩個 key：同一句話兩份文案，下次改文案就會分岔。 */
    function plain(k) { return T(k).replace(/^[·・]\s*/, '').replace(/\s*[·・]\s*%$/, ''); }

    /* 適用場次表的一列（2026-08-13 使用者指示「表格化」）：勾選框／票種／售價／張數
       各佔一欄。原本是一列 `.fc-ref`（縮圖＋名稱＋「$3800 · 共 150 張」），一列的事實
       全串在同一行字裡——要讀句子才分得出哪個數字是價格、哪個是張數，六列之間也對不齊。
       票券圖示一併拿掉：分卡標題已經說了這裡列的是票，每列再放一個一模一樣的圖示是裝飾。 */
    /* 2026-08-13 第二輪（使用者提供參考圖、選定變體 C）：沒勾到的列整列淡化
       （`--off`），取代原本「勾到的列給一條左緣色線」。同一排列裡要一眼數出選了幾張，
       靠的是「沒選的退到背景」比「選到的多一條線」直接。 */
    function ticketRowHTML(t, on, labelKind) {
      return '<label class="bd-tbl__row bd-tbl__row--pick' + (on ? '' : ' bd-tbl__row--off') + '">' +
        '<span class="zcheck__control">' +
          '<input class="zcheck__input" type="checkbox" data-bd-ticket="' + esc(t.id) + '"' + (on ? ' checked' : '') + '>' +
          '<span class="zcheck__box"></span>' +
        '</span>' +
        '<span class="bd-tbl__name">' + esc(labelKind && t.kind ? t.kind.name : t.name) + '</span>' +
        '<span class="bd-tbl__num">' + esc(Number(t.price) === 0 ? T('ce.tier.free') : money(t.price)) + '</span>' +
        '<span class="bd-tbl__num">' + esc(t.qty ? String(t.qty) : '—') + '</span>' +
      '</label>';
    }

    function kindChipsHTML(b) {
      var chosen = b.tickets || [];
      return ticketKinds().map(function (k) {
        var all = k.ids.every(function (id) { return chosen.indexOf(id) >= 0; });
        return '<button class="chip' + (all ? ' chip--active' : '') + '" type="button" ' +
          'data-bd-kind="' + esc(k.id) + '">' + esc(k.name) + '</button>';
      }).join('');
    }

    /* 就緒檢查：與 isValid() 同一組條件，只是攤開成逐項。
       2026-08-13 使用者裁決撤除 footer 的就緒 chip（`.readiness__chip` ＋ hover 清單），
       改由「完成」按鈕自己的 disabled 說話——還不能建立時按鈕就是關的。原本那顆 chip
       在兩項都齊時只會寫「可以建立了」，等於把按鈕已經表達的事再說一次。
       這組條件本身不動，它仍然是按鈕停用與否的判準。 */
    function readiness(b) {
      return [
        (b.tickets || []).length > 0,
        !!String(b.name || '').trim() || !!suggestName(b),
        !capOver(b)
      ];
    }
    function readyMiss(b) { return readiness(b).filter(function (ok) { return !ok; }); }
    /* 主要按鈕該不該停用。第 1 步只看它自己那一步答得完的兩件事（有沒有含票、售出上限
       有沒有超過票券張數）——名稱在第 2 步，還沒走到就要求它會擋在一個看不到的欄位上。 */
    function gateOffFor(b) {
      var r = readiness(b);
      return b.step === 2 ? r.indexOf(false) >= 0 : !(r[0] && r[2]);
    }

    /* ⓪ 場次對應（只有多場活動才問）
       自成一張分卡，比照建立商品把「單選項／多選項」放進自己的 Variations 區塊——
       這種「先決定用哪一種模式，後面的欄位跟著換」的選擇是一個獨立決定，
       擠在「適用票種」的標籤底下會讀成那個欄位的附屬設定。
       控件也照那邊用 `.segmented.radio-cards`（帶標題與說明的二選一卡），
       不用 filter-tabs——filter-tabs 是「篩清單」的語彙，這裡是在設定模式。 */
    function secScopeHTML(b) {
      var groups = ticketGroups();
      if (!(groups.length > 1 && groups[0].name)) return '';
      function card(val, on) {
        return '<button type="button" class="segmented__btn' + (on ? ' segmented__btn--active' : '') +
          '" role="radio" aria-checked="' + on + '" data-bd-scope="' + val + '">' +
          '<span class="radio-card__text">' +
            '<span class="radio-card__title">' + esc(T('cpp.bd.scope.' + val)) + '</span>' +
            '<span class="radio-card__sub">' + esc(T('cpp.bd.scope.' + val + '.sub').replace('{n}', groups.length)) + '</span>' +
          '</span></button>';
      }
      /* 2026-08-13 使用者指示「放同一個 section」：與票種合併成一張分卡，這裡只回傳欄位群。
         兩者回答的是同一件事的兩半——這一組賣哪一種票、以及那一種票怎麼對應到場次；
         拆成兩張卡會讓人以為是兩個不相干的決定。 */
      return '<div class="field">' +
        '<div class="field__label">' + esc(T('cpp.bd.sec.scope')) + '</div>' +
        '<div class="segmented radio-cards" role="radiogroup" aria-label="' + esc(T('cpp.bd.sec.scope')) + '">' +
          card('shared', b.scope !== 'per') + card('per', b.scope === 'per') +
        '</div>' +
      '</div>';
    }

    /* ── 票種：卡片複選 ────────────────────────────────────────────────
       2026-08-13（使用者指示「改成卡片的方式，且要與它所在的表做 section 區隔」）：
       原本是清單框最上面一排小 chip 的「跨場次選取」捷徑。問題是它長得像篩選器
       （chip 是「篩清單」的語彙），又擠在票券清單的框裡，讀起來像那張表的工具列——
       但「這一組要賣哪一種票」是這張卡最先要回答的問題，不是清單的附屬操作。

       改成卡片複選之後模型也順了：**先選票種，再（選配）取消不賣的場次**。
       卡片是複選不是二選一，所以用 aria-pressed 而不是 role=radio；版型沿用
       .radio-cards——站上「帶標題與說明的選項卡」只有這一套，重刻第二套只多一種語彙。 */
    function kindCardsHTML(b) {
      var chosen = b.tickets || [];
      var kinds = ticketKinds();
      if (!kinds.length) {
        return '<div class="fc-ref fc-ref--placeholder">' +
          '<span class="fc-ref__thumb fc-ref__thumb--work"><i data-lucide="ticket" class="ztor-icon"></i></span>' +
          '<div><div class="fc-ref__name">' + esc(T('cpp.bd.tickets.ph')) + '</div>' +
            '<div class="fc-ref__meta">' + esc(T('cpp.bd.tickets.none')) + '</div></div>' +
        '</div>';
      }
      return '<div class="segmented radio-cards" role="group" aria-label="' + esc(T('cpp.bd.sec.kind')) + '">' +
        kinds.map(function (k) {
          var picked = k.ids.filter(function (id) { return chosen.indexOf(id) >= 0; }).length;
          var on = picked > 0;
          var first = ticketById(k.ids[0]) || {};
          /* 取消了部分場次時卡片仍算「選了這個票種」，只是說明改成報幾場——
             不然取消一場整張卡就跳回未選，看起來像自己的操作被撤銷。 */
          var sub = on
            ? (k.ids.length > 1
                ? T('cpp.bd.kind.on.n').replace('{n}', picked).replace('{all}', k.ids.length)
                : T('cpp.bd.kind.on'))
            : (Number(first.price) === 0 ? T('ce.tier.free') : '$' + first.price);
          return '<button type="button" class="segmented__btn' + (on ? ' segmented__btn--active' : '') +
            '" aria-pressed="' + on + '" data-bd-kind="' + esc(k.id) + '">' +
            '<span class="radio-card__text">' +
              '<span class="radio-card__title">' + esc(k.name) + '</span>' +
              '<span class="radio-card__sub">' + esc(sub) + '</span>' +
            '</span></button>';
        }).join('') +
      '</div>';
    }

    function secKindHTML(b) {
      var n = (b.tickets || []).length;
      var deduct = !n ? '' : T(n > 1 ? 'cpp.bd.deduct.many' : 'cpp.bd.deduct.one');
      var scope = secScopeHTML(b);          // 多場才有，單場回空字串
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.kind')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T(scope ? 'cpp.bd.sec.kind.sub.multi' : 'cpp.bd.sec.kind.sub')) + '</p>' +
        '</div>' +
        scope +
        (scope ? '<div class="field__label">' + esc(T('cpp.bd.kind.which')) + '</div>' : '') +
        kindCardsHTML(b) +
        (deduct ? '<div class="field__hint mt-10">' + esc(deduct) + '</div>' : '') +
      '</section>';
    }

    /* ── 會建立的組合包：「每場次各一組」的實際清單 ────────────────────────
       點了模式卡只說「會長出 3 組」，但沒說是哪 3 組。這裡照 commit() 的展開邏輯
       （每一場一顆組合包，內含當場所有已選票種的票）算出真正會建立的清單，逐場列出。
       名稱欄寫的是展開後的完整名字（`stem · 場次名`），不只是場次名——那才是按下完成
       之後清單上會出現的字。
       2026-08-13 使用者指示「和適用場次一樣是一個 section，兩個都要表格化」：從票種分卡
       裡的一段欄位升格成自己的分卡。它回答的是「按下完成之後會多出哪幾組」，與「這一組
       賣哪一種票」是兩個決定，擠在同一張卡裡會讀成那個欄位的附註。
       還沒挑票種時分卡照樣出現、只把說明句換成引導：整塊消失會接不上剛剛那一下點擊。 */
    function perRows(b) {
      var picked = {};
      ticketKinds().forEach(function (k) {
        if (k.ids.some(function (id) { return (b.tickets || []).indexOf(id) >= 0; })) picked[k.id] = true;
      });
      if (!Object.keys(picked).length) return [];
      return ticketGroups().map(function (g) {
        var incl = g.rows.filter(function (t) { return t.kind && picked[t.kind.id]; });
        return incl.length ? { g: g, incl: incl } : null;
      }).filter(Boolean);
    }
    function secPerHTML(b) {
      if (b.scope !== 'per') return '';
      // 沒有票種可挑時不出這張卡——kindCardsHTML 的佔位列已經講過那件事
      if (!ticketGroups().length || !ticketKinds().length) return '';
      var rows = perRows(b);
      var stem = b.name || suggestName(b) || T('cpp.bd.untitled');
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.per.preview')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(rows.length
            ? T('cpp.bd.per.preview.sub').replace('{n}', rows.length)
            : T('cpp.bd.per.preview.empty')) + '</p>' +
        '</div>' +
        (!rows.length ? '' :
          '<div class="bd-tbl bd-tbl--per">' +
            '<div class="bd-tbl__head">' +
              '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.bundle')) + '</span>' +
              '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.incl')) + '</span>' +
              '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.value')) + '</span>' +
            '</div>' +
            rows.map(function (r) {
              /* 票券原價取這一組裡最高的那一張，與 ticketValue() 同一條規則——
                 粉絲擇一入場，最高價是保守的算法。 */
              var top = r.incl.reduce(function (m, t) { return Math.max(m, cash(t.price)); }, 0);
              return '<div class="bd-tbl__row">' +
                '<span class="bd-tbl__name">' + esc(stem + ' · ' + r.g.name) + '</span>' +
                '<span class="bd-tbl__sub">' + esc(r.incl.map(function (t) { return t.kind.name; }).join('、')) + '</span>' +
                '<span class="bd-tbl__num">' + esc(top ? money(top) : T('ce.tier.free')) + '</span>' +
              '</div>';
            }).join('') +
          '</div>') +
      '</section>';
    }

    /* ── 適用場次：選配的微調 ──────────────────────────────────────────
       只在「多場 ＋ 全場次共用一組 ＋ 已選票種」時出現。預設每一場都適用，這張表的
       用途是**取消**不販售的那幾場，不是從零勾選——所以標題是「適用場次」而不是
       「選擇票券」。單場活動與「每場次各一組」都不需要它。 */
    function secSessionsHTML(b) {
      if (b.scope === 'per') return '';
      var groups = ticketGroups();
      if (!(groups.length > 1 && groups[0].name)) return '';
      var chosen = b.tickets || [];
      var kinds = ticketKinds().filter(function (k) {
        return k.ids.some(function (id) { return chosen.indexOf(id) >= 0; });
      });
      if (!kinds.length) return '';
      var live = {};
      kinds.forEach(function (k) { k.ids.forEach(function (id) { live[id] = true; }); });
      var liveIds = Object.keys(live);
      var allOn = liveIds.every(function (id) { return chosen.indexOf(id) >= 0; });
      /* 表頭第一格放「全選」（2026-08-13 第二輪，照使用者提供的參考圖）：勾選框佔的是
         列首那一欄，與底下每一列的勾選框上下對齊，一整欄讀下來就是「這一格管底下全部」。
         沒有文字標籤，語意交給位置——所以要補 aria-label，螢幕閱讀器才聽得出它管什麼。 */
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.sess')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.sec.sess.sub')) + '</p>' +
        '</div>' +
        '<div class="bd-tbl bd-tbl--sess">' +
          '<div class="bd-tbl__head">' +
            '<span class="zcheck__control">' +
              '<input class="zcheck__input" type="checkbox" data-bd-all' + (allOn ? ' checked' : '') +
                ' aria-label="' + esc(T('cpp.bd.grp.allsess')) + '">' +
              '<span class="zcheck__box"></span>' +
            '</span>' +
            '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.tier')) + '</span>' +
            '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.price')) + '</span>' +
            '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.qty')) + '</span>' +
          '</div>' +
          groups.map(function (g) {
            var rows = g.rows.filter(function (t) { return live[t.id]; });
            if (!rows.length) return '';
            var all = rows.every(function (t) { return chosen.indexOf(t.id) >= 0; });
            /* 場次組頭：勾選框同樣坐在列首那一欄（2026-08-13 使用者指示「放在上面一列、
               跟其他勾選一樣靠左，不需要寫『全選本場次』」）。原本它靠右、帶一段文字標籤，
               等於在同一張表裡出現第二種勾選框的擺法；移到同一欄之後，父子關係由位置說完。 */
            return '<label class="bd-tbl__group">' +
                '<span class="zcheck__control">' +
                  '<input class="zcheck__input" type="checkbox" data-bd-group="' + esc(g.id) + '"' + (all ? ' checked' : '') +
                    ' aria-label="' + esc(T('cpp.bd.grp.all')) + '">' +
                  '<span class="zcheck__box"></span>' +
                '</span>' +
                '<span class="bd-tbl__gname">' + esc(g.name) + '</span>' +
              '</label>' +
              rows.map(function (t) { return ticketRowHTML(t, chosen.indexOf(t.id) >= 0, true); }).join('');
          }).join('') +
        '</div>' +
      '</section>';
    }

    /* ── 商店商品 ────────────────────────────────────────────────────── */
    function secItemsHTML(b) {
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.items')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.items.sec.sub')) + '</p>' +
        '</div>' +
        (b.items.length ? itemsHTML(b) + '<div class="mt-8"></div>' : '') +
        '<div class="fc-pick" data-bd-pick>' +
          '<input class="input" data-bd-search placeholder="' + esc(T('cpp.bd.search')) + '" autocomplete="off">' +
          '<div class="fc-pick__results" data-bd-results hidden></div>' +
        '</div>' +
      '</section>';
    }

    /* ── 額外權益 ──────────────────────────────────────────────────────
       自由文字，一行一項。收的是「沒有商品編號、也不需要履約紀錄的東西」——
       Discord 身分組、感謝名單、抽選資格這一類。**上游沒有規定可以加哪些**，
       所以不做選單、不接資料源；產品缺口記在 ASSUMPTIONS BDL-002。 */
    function secPerksHTML(b) {
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.perks')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.perks.sec.sub')) + '</p>' +
        '</div>' +
        (b.perks.length ? perksHTML(b) : '') +
        '<button class="btn btn--outline btn--add fc-add-item" type="button" data-bd-perk-add>' + esc(T('cpp.bd.perk.add')) + '</button>' +
      '</section>';
    }



    /* ② 定價
       折扣改成開關（比照建立商品的「折扣設定」）：多數組合包不打折，把折扣欄永遠攤在
       算式裡等於預設每一組都要回答一個多數人不需要回答的問題。關著時算式只有兩段
       （原價合計＝粉絲實付），開了才長出折扣欄與那一段減號。 */
    function secPriceHTML(b) {
      var on = !!b.discountOn;
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.sell')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.sec.sell.sub')) + '</p>' +
        '</div>' +
        /* 開關排在算式之前：先決定要不要打折，才有第二個數字可看。
           **關著時算式只留一段**——原價合計與粉絲實付是同一個數字，兩段並排等於
           同一件事說兩次，還會讓人以為中間漏了什麼。 */
        '<div class="control-group">' +
          '<div class="control-row">' +
            '<div>' +
              '<div class="control-row__main">' + esc(T('cpp.bd.disc.on')) + '</div>' +
              '<div class="control-row__sub">' + esc(T('cpp.bd.disc.on.sub')) + '</div>' +
            '</div>' +
            '<div class="switch' + (on ? ' switch--on' : '') + '" role="switch" aria-checked="' + on + '" ' +
              'tabindex="0" data-bd-disc-toggle></div>' +
          '</div>' +
        '</div>' +
        /* 最終價已搬到 footer（2026-08-13 使用者指示「價格放在 footer」）：它是這張卡的
           結果，而 footer 是釘住的——捲到哪裡都看得到，不必為了確認價格捲回定價那一段。
           所以這裡只留「輸入」：原價合計與折扣欄。關掉折扣時整個算式塊都不出現——
           沒有可填的東西，留一個只有一個數字的框是空殼。 */
        /* 2026-08-13 使用者指示「優惠趴數／原價／優惠價三個欄位各一行」：原本是一列
           橫向算式（原價 − 折扣%），三個數字擠在同一行、標籤又比值小一階，要左右掃過去
           才讀得完。改成三個獨立欄位上下堆疊，一行一件事，標籤與值的關係跟站上其他欄位一致。
           只有折扣是輸入，另外兩個是推導值，所以用 `.field-readout`（唯讀顯示，不畫框、
           不留 input 內距）而不是停用的 `.input`——停用的輸入框看起來像「這裡本來可以填」。 */
        (on
          ? '<div class="mt-16">' +
              '<div class="field">' +
                '<label class="field__label">' + esc(plain('cpp.bd.discount')) + '</label>' +
                '<span class="amount-field amount-field--suffix bd-calc__disc">' +
                  '<input class="amount-field__input input" type="number" min="0" max="100" step="1" data-bd-f="discount" ' +
                    'value="' + esc(b.discount) + '" placeholder="' + esc(T('cpp.bd.discount.ph')) + '">' +
                  '<span class="amount-field__unit">%</span></span>' +
              '</div>' +
              '<div class="field">' +
                '<label class="field__label">' + esc(T('cpp.bd.calc.base')) + '</label>' +
                '<div class="field-readout" data-bd-calc-base>' + esc(money(listPrice(b))) + '</div>' +
              '</div>' +
              '<div class="field">' +
                '<label class="field__label">' + esc(T('cpp.bd.calc.final')) + '</label>' +
                '<div class="field-readout" data-bd-calc-final>' + esc(money(finalPrice(b))) + '</div>' +
              '</div>' +
            '</div>'
          : '<div class="field__hint mt-8">' + esc(T('cpp.bd.calc.nodisc')) + '</div>') +
      '</section>';
    }

    /* 這一組的售出上限不能超過它含的票（2026-08-13 使用者指示「必須小於等於所選票的最低量」）。
       賣掉一組就要從每一種含的票各扣一張，所以能賣幾組由**張數最少的那一種**決定——
       取最小值而不是加總。沒有張數資料（qty 留空）的票不參與，全都沒有就沒有上限。 */
    function ticketCapMax(b) {
      if (!SECTIONS || !getTickets) return Infinity;
      var chosen = b.tickets || [];
      var qs = (getTickets() || [])
        .filter(function (t) { return chosen.indexOf(t.id) >= 0; })
        .map(function (t) { return num(t.qty); })
        .filter(function (n) { return Number.isFinite(n) && n > 0; });
      return qs.length ? Math.min.apply(null, qs) : Infinity;
    }
    function capOver(b) {
      if (b.avail !== 'limited') return false;
      var c = num(b.cap), m = ticketCapMax(b);
      return Number.isFinite(c) && c > 0 && m !== Infinity && c > m;
    }
    function capMaxHint(b) {
      var m = ticketCapMax(b);
      if (m === Infinity) return '';
      var n = m.toLocaleString('en-US');
      return T(capOver(b) ? 'cpp.bd.cap.over' : 'cpp.bd.cap.max').replace(/\{n\}/g, n);
    }

    /* ③ 販售數量：不限量／限量二選一（比照建立商品的「庫存」）。
       原本是一個「留空＝不限」的數字欄——留空是一種安靜的預設，讀不出「我選了不限量」，
       而且空欄與 0 在畫面上長得一樣。改成先選再填。 */
    function secQtyHTML(b) {
      var limited = b.avail === 'limited';
      function card(val, on, key) {
        return '<button type="button" class="segmented__btn' + (on ? ' segmented__btn--active' : '') +
          '" role="radio" aria-checked="' + on + '" data-bd-avail="' + val + '">' +
          '<span class="radio-card__text">' +
            '<span class="radio-card__title">' + esc(T(key)) + '</span>' +
            '<span class="radio-card__sub">' + esc(T(key + '.sub')) + '</span>' +
          '</span></button>';
      }
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.qty')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.sec.qty.sub')) + '</p>' +
        '</div>' +
        '<div class="segmented radio-cards" role="radiogroup" aria-label="' + esc(T('cpp.bd.sec.qty')) + '">' +
          card(AVAIL_OPEN, !limited, 'cpp.bd.qty.unlim') + card('limited', limited, 'cpp.bd.avail.limited') +
        '</div>' +
        (limited
          ? '<div class="form-grid mt-16">' +
              '<div class="field">' +
                '<label class="field__label">' + esc(T('cpp.bd.cap')) + ' <span class="field__req">*</span></label>' +
                '<input class="input" type="number" min="1" step="1"' +
                  (ticketCapMax(b) === Infinity ? '' : ' max="' + ticketCapMax(b) + '"') +
                  (capOver(b) ? ' aria-invalid="true"' : '') +
                  ' data-bd-f="cap" value="' + esc(b.cap) +
                  '" placeholder="' + esc(T('cpp.bd.cap.ph')) + '">' +
                /* 上限來自票券張數，寫在欄位底下才不必自己去比對票種那一段 */
                (capMaxHint(b)
                  ? '<div class="field__hint' + (capOver(b) ? ' fc-hint--over' : '') + '" data-bd-capmax>' +
                      esc(capMaxHint(b)) + '</div>'
                  : '') +
              '</div>' +
            '</div>'
          : '') +
      '</section>';
    }

    /* ④ 基本資料（名稱與說明）／⑤ 封面圖 —— 拆成兩張，比照建立商品的
       「商品資訊」與「展示它」。原本合成一張「呈現方式」，名稱／說明與圖片是兩件
       不同的事，混在同一張卡裡右邊那一格圖看起來像名稱欄的附屬。 */
    function secInfoHTML(b) {
      var sug = suggestName(b);
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.info')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.sec.info.sub')) + '</p>' +
        '</div>' +
        '<div>' +
            '<div class="field">' +
              '<label class="field__label">' + esc(T('cpp.bd.name')) + ' <span class="field__req">*</span></label>' +
              '<input class="input" data-bd-f="name" value="' + esc(b.name) + '" ' +
                'placeholder="' + esc(sug || T('cpp.bd.name.ph')) + '">' +
              (sug && b.name !== sug
                ? '<button class="bd-suggest" type="button" data-bd-usesug>' +
                    esc(T('cpp.bd.suggest').replace('{n}', sug)) + '</button>'
                : '') +
            '</div>' +
            '<div class="field">' +
              '<label class="field__label">' + esc(T('cpp.bd.desc')) + '</label>' +
              '<input class="input" data-bd-f="desc" value="' + esc(b.desc) + '" ' +
                'placeholder="' + esc(T('cpp.bd.desc.ph')) + '">' +
            '</div>' +
        '</div>' +
      '</section>';
    }

    function secCoverHTML(b) {
      if (!COVER) return '';
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.cover')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.cover.sub')) + '</p>' +
        '</div>' +
        /* 預設排法、不加 --fill：--fill 是「一排 N 格平分容器」的變體，
           一格封面擺進窄欄會被除成四分之一（2026-08-13 實測 32×48）。 */
        /* 版面照建立商品的圖片槽（2026-08-13）：--fill 一排四格、寬度隨容器等比縮放，
           格子裡帶尺寸與格式提示。先前不用 --fill 是因為封面被塞在名稱欄旁的 120px 窄欄裡
           會被除成四分之一；自成一張分卡之後欄寬是整列，--fill 才是對的排法。 */
        '<div class="upload-assets upload-assets--fill">' +
          '<div class="upload-tile upload-tile--portrait' + (b.cover ? ' is-filled' : '') +
              '" data-bd-cover data-asset="bdcover-' + b.id + '" data-upload>' +
            '<span class="upload-tile__icon"><i data-lucide="image" class="ztor-icon ztor-icon--md"></i></span>' +
            '<span class="upload-tile__title">' + esc(T('cpp.bd.cover.cta')) + '</span>' +
            '<span class="upload-tile__hint">' + esc(T('cp.media.portrait')) + '</span>' +
            '<span class="upload-tile__hint">' + esc(T('cp.media.formats')) + '</span>' +
          '</div>' +
        '</div>' +
      '</section>';
    }

    /* 兩步彈窗（2026-08-13 使用者指示「基本資料與封面圖放下一步，不需要 stepper」）。
       第 1 步回答「這一組賣什麼、怎麼賣」，第 2 步才是「它長什麼樣」——名稱與封面圖
       本來就排在最後，而且名稱會從內容自動擬好，等於是確認而不是填空。
       **不放 stepper**：兩步的進度條要佔掉 dialog 頂部一整條，卻只表達「兩步中的第幾步」，
       而分卡標題（基本資料／封面圖）已經說了現在在哪；前後由 footer 的兩顆按鈕承擔。 */
    function secCardHTML(b, i) {
      var groups = ticketGroups();
      var step2 = b.step === 2;
      var primaryLabel = step2
        ? (b.scope === 'per' ? T('cpp.bd.createn').replace('{n}', perRows(b).length || groups.length) : T('cpp.bd.done'))
        : T('cpp.bd.next');
      var gateOff = gateOffFor(b);
      return '' +
      '<div class="payout-modal bd-modal" data-bd-card="' + b.id + '">' +
        '<section class="payout-dialog payout-dialog--wide" role="dialog" aria-modal="true">' +
          '<div class="payout-dialog__head">' +
            '<h2 class="payout-dialog__title">' + esc(b.fresh ? T('cpp.bd.add') : T('cpp.bd.edit')) + '</h2>' +
            '<button class="btn btn--icon" type="button" data-bd-close aria-label="' + esc(T('cpp.bd.close')) + '">' +
              '<i data-lucide="x" class="ztor-icon"></i></button>' +
          '</div>' +
          '<div class="payout-dialog__body">' +
            (step2
              ? secInfoHTML(b) + secCoverHTML(b)
              : secKindHTML(b) + secPerHTML(b) + secSessionsHTML(b) + secItemsHTML(b) +
                secPerksHTML(b) + secPriceHTML(b) + secQtyHTML(b)) +
          '</div>' +
          '<div class="payout-dialog__foot">' +
            /* 價格釘在 footer（2026-08-13 使用者指示）：它是整張卡的結果，
               放在定價那一段的話，捲到「基本資料」就看不到自己定出來的價格了。
               有折扣時把原價劃線並列，讓「讓了多少」在同一眼裡看得完。
               2026-08-13 第二輪（使用者指示「靠左」）：它是 footer 的**第一個**子元素、
               貼左緣，不再跟主要動作擠在右邊那一團——結果歸結果、動作歸動作，
               擠在一起時那兩行字會被讀成按鈕的說明。 */
            '<div class="bd-foot-price">' +
              '<span class="bd-foot-price__k">' + esc(T('cpp.bd.calc.final')) + '</span>' +
              '<span class="bd-foot-price__v">' +
                (listPrice(b) > finalPrice(b)
                  ? '<span class="bd-foot-price__was">' + esc(money(listPrice(b))) + '</span>' : '') +
                '<span data-bd-calc-final>' + esc(money(finalPrice(b))) + '</span>' +
              '</span>' +
            '</div>' +
            (BUNDLES.length > 1
              ? '<button class="btn btn--ghost btn--sm" type="button" data-bd-remove>' + esc(T('cpp.bd.remove')) + '</button>'
              : '') +
            '<div class="bd-foot-actions">' +
              (step2 ? '<button class="btn btn--outline" type="button" data-bd-back>' +
                esc(T('cpp.bd.back')) + '</button>' : '') +
              '<button class="btn btn--primary" type="button" data-bd-primary' +
                (gateOff ? ' disabled' : '') + '>' + esc(primaryLabel) + '</button>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>';
    }

    /* 方案的縮圖＝它裝的第一件商品。方案沒有自己的圖片欄位，硬加一個會多出一份要維護
       （而且會跟商品自己的圖不同步）；取第一件商品是站上三處（方案卡、方案分頁列、
       總覽的方案摘要）共同的做法。 */
    function thumbHTML(b) {
      var img = b.items && b.items[0] && b.items[0].img;
      return img
        ? '<img class="fc-sum__thumb" src="' + esc(img) + '" alt="" loading="lazy">'
        : '<span class="fc-sum__thumb fc-sum__thumb--empty"><i data-lucide="package" class="ztor-icon"></i></span>';
    }

    /* 收合列：叫什麼、裡面有什麼、賣多少。整列可點、點開就是上面那個彈窗。 */
    function secRowHTML(b, i) {
      var base = listPrice(b), fin = finalPrice(b);
      /* 列用 data-bd-open、彈窗才是 data-bd-card：編輯中兩者同時存在，共用同一個屬性的話
         「找這張卡的某個欄位」會先命中沒有欄位的那一列，打字時的焦點還原就會斷。 */
      return '<button class="card bd-row" type="button" data-bd-open="' + b.id + '">' +
        '<span class="bd-row__thumb"><i data-lucide="package" class="ztor-icon"></i></span>' +
        '<span>' +
          '<span class="bd-row__name"><span class="fc-bundle__index">' + String(i + 1).padStart(2, '0') + '</span>' +
            esc(b.name || T('cpp.bd.untitled')) + '</span>' +
          '<span class="bd-row__meta">' + esc(summaryMeta(b)) + '</span>' +
        '</span>' +
        '<span class="bd-row__price">' + esc(money(fin)) +
          (base > fin ? '<span class="bd-row__was">' + esc(money(base)) + '</span>' : '') + '</span>' +
        '<span class="bd-row__chev"><i data-lucide="chevron-right" class="ztor-icon"></i></span>' +
      '</button>';
    }

    function cardHTML(b, i) {
      /* 分段版型的列與彈窗由 render() 分開產生（見那裡的說明），不走這條。 */
      if (SECTIONS) return b.collapsed ? secRowHTML(b, i) : secCardHTML(b, i);
      /* 2026-07-28：不再因為填了名額就強制 Limited。auto 由池子推導，兩顆都永遠可點。
         2026-07-30：卡片不再因為未完成而長出左緣色線（使用者裁決刪除）。「還沒完成」
         這件事仍然說得出口——底部教練提示與 Continue 的停用狀態照舊，見消費頁。 */

      /* ── 數量那一排（兩型各佔兩格，所以 form-grid 一律成立）─────────────────
         共創：含分潤名額｜販售上限。預購：含作品份數｜販售上限（D167）。
         把份數與上限並排是刻意的——它們最容易被當成同一件事，而規格特別要求分清楚：
         上限管這個方案最多成立幾筆訂單，份數管每一筆含幾份作品，相乘才是可售份數。 */
      var qtyField = (!SHARES && !WORK) ? '' : SHARES
        ? '<div class="field">' +
            '<label class="field__label">' + esc(T('cpp.bd.slots')) + '</label>' +
            '<input class="input" type="number" min="0" step="1" data-bd-f="slots" value="' + esc(b.slots) + '">' +
            '<div class="field__hint">' + esc(T('cpp.bd.slots.hint')) + '</div>' +
          '</div>'
        : '<div class="field">' +
            '<label class="field__label">' + esc(T('cpp.bd.units')) + ' <span class="field__req">*</span></label>' +
            '<input class="input" type="number" min="1" step="1" data-bd-f="units" value="' + esc(b.units) + '">' +
            '<div class="field__hint">' + esc(T('cpp.bd.units.hint')) + '</div>' +
          '</div>';

      var availField =
        '<div class="field">' +
          '<div class="field__label">' + esc(T('cpp.bd.avail')) + '</div>' +
          '<div class="segmented" role="radiogroup" aria-label="' + esc(T('cpp.bd.avail')) + '">' +
            '<button type="button" class="segmented__btn' + (b.avail !== 'limited' ? ' segmented__btn--active' : '') +
              '" role="radio" aria-checked="' + (b.avail !== 'limited') + '" data-bd-avail="' + AVAIL_OPEN + '">' +
              esc(T(SHARES ? 'cpp.bd.avail.auto' : 'cpp.bd.qty.unlim')) + '</button>' +
            '<button type="button" class="segmented__btn' + (b.avail === 'limited' ? ' segmented__btn--active' : '') +
              '" role="radio" aria-checked="' + (b.avail === 'limited') + '" data-bd-avail="limited">' +
              esc(T('cpp.bd.avail.limited')) + '</button>' +
          '</div>' +
          /* cap 需要自己的標籤：一旦填了值，placeholder 就不再說明它是什麼，
             這個輸入框會變成 segmented 底下一個沒有名字的數字。 */
          (b.avail === 'limited'
            ? '<label class="field__label mt-8">' + esc(T('cpp.bd.cap')) + '</label>' +
              '<input class="input" type="number" min="1" step="1" data-bd-f="cap" value="' + esc(b.cap) +
                '" placeholder="' + esc(T('cpp.bd.cap.ph')) + '">' +
              '<div class="field__hint" data-bd-cap-hint>' + esc(capHintText(b)) + '</div>'
            /* auto：把算出來的份數直接寫出來。這一格不是輸入框——它是結果，
               讓創作者看得到「池子除下來是幾份」，而不是自己去猜一個數字。
               預購的「不限量」是使用者自己選的、不是算出來的，沒有結果要報告。 */
            : (SHARES ? '<div class="field__hint mt-8" data-bd-auto-hint>' + esc(autoHintText(b)) + '</div>' : '')) +
        '</div>';

      var qtyRow = '<div class="form-grid">' + qtyField + availField + '</div>';

      /* 預購的內容分兩塊：作品本體在最上方、不可移除，附屬商品接在下面（D167）。
         共創沒有作品這一段，內容區就只有商店商品，與 2026-07-30 完全相同。 */
      var workField = (SHARES || !WORK) ? '' :
        '<div class="field">' +
          '<div class="field__label">' + esc(T('cpp.bd.work')) + '</div>' +
          workRowHTML(b) +
        '</div>';

      var itemsField =
        '<div class="field">' +
          '<div class="field__label">' + esc(T('cpp.bd.items')) + '</div>' +
          '<div class="fc-pick" data-bd-pick>' +
            '<input class="input" data-bd-search placeholder="' + esc(T('cpp.bd.search')) + '" autocomplete="off">' +
            '<div class="fc-pick__results" data-bd-results hidden></div>' +
          '</div>' +
          (b.items.length ? '<div class="mt-8">' + itemsHTML(b) + '</div>' : '') +
          '<div class="field__hint">' + esc(T('cpp.bd.items.hint')) + '</div>' +
        '</div>';

      /* 封面圖（選配）：活動套組每一組賣的是不同的東西，卡與卡之間要靠圖分辨。
         用站上唯一的上傳格產生路徑（Q40）——點擊選檔、hover 替換／刪除都由
         partials/upload-tile.js 接手，這裡只出 markup。 */
      /* 2026-08-06 修：上傳格要包在 .upload-assets 裡。--portrait 只給比例，高度是
         .upload-assets 的 --upload-asset-h 給的；少了外層，格子會沿著 .field 撐滿整列寬、
         再依比例長到半個畫面高（使用者回報「壞掉了」的就是這個）。
         包了之後與活動圖片、項目展示相簿是同一組尺寸，不再各長各的。 */
      var coverField = !COVER ? '' :
        '<div class="field">' +
          '<div class="field__label">' + esc(T('cpp.bd.cover')) + '</div>' +
          '<div class="upload-assets upload-assets--fill">' +
            '<div class="upload-tile upload-tile--portrait' + (b.cover ? ' is-filled' : '') +
                '" data-bd-cover data-asset="bdcover-' + b.id + '" data-upload>' +
              '<span class="upload-tile__icon"><i data-lucide="image" class="ztor-icon"></i></span>' +
              '<span class="upload-tile__title">' + esc(T('cpp.bd.cover.cta')) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';

      /* 適用票種（選配）：一張卡可以賣給多種票的持有者，所以是複選不是單選。
         票種是在同一個流程的上一步建立的，所以每次渲染都重新取——中途新增的票種
         要立刻出現在這裡，不能停在掛載當下的那份快照。 */
      /* 2026-08-06 使用者指示：票券**以商品的形式帶入一列**，不再是一排勾選框。
         理由是這一塊在回答「這組裡面有什麼」——商品用的是 .fc-ref（縮圖＋名稱＋次要資訊）
         的引用列，票券也是這組的內容物之一，長成另一種樣子只會讓人以為那是設定不是內容。
         還沒建立票種時放一列 placeholder（虛線、灰字），把「這裡將來會有一張票」畫出來，
         而不是只留一句提示文字。 */
      var tks = getTickets ? (getTickets() || []) : [];
      var chosen = (b.tickets || []);
      var ticketsField = !getTickets ? '' :
        '<div class="field">' +
          '<div class="field__label">' + esc(T('cpp.bd.tickets')) + '</div>' +
          (tks.length
            ? tks.map(function (t) {
                var on = chosen.indexOf(t.id) >= 0;
                return '<label class="fc-ref bd-ticket' + (on ? ' bd-ticket--on' : '') + '">' +
                  '<span class="zcheck__control">' +
                    '<input class="zcheck__input" type="checkbox" data-bd-ticket="' + esc(t.id) + '"' + (on ? ' checked' : '') + '>' +
                    '<span class="zcheck__box"></span>' +
                  '</span>' +
                  '<span class="fc-ref__thumb fc-ref__thumb--work"><i data-lucide="ticket" class="ztor-icon"></i></span>' +
                  '<div><div class="fc-ref__name">' + esc(t.name) + '</div>' +
                    '<div class="fc-ref__meta">' + (Number(t.price) === 0 ? esc(T('ce.tier.free')) : '$' + esc(t.price)) + '</div></div>' +
                '</label>';
              }).join('')
            : '<div class="fc-ref fc-ref--placeholder">' +
                '<span class="fc-ref__thumb fc-ref__thumb--work"><i data-lucide="ticket" class="ztor-icon"></i></span>' +
                '<div><div class="fc-ref__name">' + esc(T('cpp.bd.tickets.ph')) + '</div>' +
                  '<div class="fc-ref__meta">' + esc(T('cpp.bd.tickets.none')) + '</div></div>' +
              '</div>') +
          '<div class="field__hint">' + esc(T('cpp.bd.tickets.hint')) + '</div>' +
        '</div>';

      /* 順序差一處：預購的份數欄位要在作品出現之後才有東西可數，所以數量那排排在
         內容兩塊後面（也就是規格 F29 的欄位順序）；共創沿用原順序不動。
         活動變體的票種接在內容之前——先講「這組賣給誰」，再講「裡面有什麼」。 */
      var middle = coverField + ticketsField +
        (SHARES ? (qtyRow + itemsField) : (workField + itemsField + qtyRow));

      return '' +
      '<div class="card fc-bundle' + (b.collapsed ? ' fc-bundle--collapsed' : '') +
          '" data-bd-card="' + b.id + '">' +
        '<div class="fc-bundle__head">' +
          '<div class="fc-sum" data-bd-expand>' +
            /* 方案圖片排最前面（2026-08-18 使用者裁決）：方案本身沒有自己的圖，它是一組
               商品的組合——取第一件商品，與方案分頁列與總覽的方案摘要取同一張。沒有商品時
               留一格包裹圖示的空底，列的基線才不會因為有沒有圖而跳動。 */
            thumbHTML(b) +
            '<div>' +
              '<div class="fc-sum__name"><span class="fc-bundle__index">' + String(i + 1).padStart(2, '0') + '</span>' +
                esc(b.name || T('cpp.bd.untitled')) + '</div>' +
              '<div class="fc-sum__meta">' + esc(summaryMeta(b)) + '</div>' +
            '</div>' +
            '<div class="fc-sum__price">' + (b.collapsed ? summaryPriceHTML(b) : headPriceHTML(b)) + '</div>' +
            /* 右上角固定一顆 chevron（2026-08-18 使用者裁決「icon 按鈕在右上」）：收合與展開
               共用同一顆、只轉向，所以那個位置永遠是「開關這張卡」的地方，不必先讀字才知道
               現在能按什麼。原本的「編輯」文字連結因此退場——點開卡片本來就是在編輯，
               再給一個叫「編輯」的連結等於同一個動作有兩個名字。
               「移除」不留在標題列：它刪掉整張方案且無法復原，收在展開後的卡片底部
               （.fc-bundle__foot，紅色 destructive 鈕），要先看到內容才刪得掉。 */
            '<button class="fc-sum__chev" type="button" data-bd-toggle' +
              ' aria-expanded="' + (b.collapsed ? 'false' : 'true') + '"' +
              ' aria-label="' + esc(T(b.collapsed ? 'cpp.bd.expand' : 'cpp.bd.collapse')) + '">' +
              '<i data-lucide="chevron-down" class="ztor-icon"></i></button>' +
          '</div>' +
        '</div>' +

        /* ── 卡片內的順序＝從「輸入」走到「結果」（2026-07-30 重排）───────────
           共創：名稱 → 一句話說明 → 名額｜販售上限 → 商店商品 → 額外權益 → 定價區塊。
           預購：名稱 → 一句話說明 → 作品 → 附屬商品 → 份數｜販售上限 → 權益 → 定價。
           舊排法把價格（結果）跟名稱（輸入）並排在第一列，等於在人還沒說出這張卡
           裝什麼之前就先給他一個 $0；組成說明夾在兩排欄位之間，歸屬也看不出來。
           定價現在整組收在卡片最後，讀完前面五項才會遇到它，那時它才有內容可算。 */
        '<div class="fc-bundle__body">' +
          '<div class="field">' +
            '<label class="field__label">' + esc(T('cpp.bd.name')) + ' <span class="field__req">*</span></label>' +
            '<input class="input" data-bd-f="name" value="' + esc(b.name) + '" placeholder="' + esc(T('cpp.bd.name.ph')) + '">' +
          '</div>' +

          '<div class="field">' +
            '<label class="field__label">' + esc(T('cpp.bd.desc')) + '</label>' +
            '<input class="input" data-bd-f="desc" value="' + esc(b.desc) + '" placeholder="' + esc(T('cpp.bd.desc.ph')) + '">' +
          '</div>' +

          middle +

          '<div class="field">' +
            '<div class="field__label">' + esc(T('cpp.bd.perks')) + ' <span class="text-sub">' + esc(T('cpp.bd.perks.sub')) + '</span></div>' +
            (b.perks.length ? perksHTML(b) : '') +
            '<button class="btn btn--outline btn--add fc-add-item" type="button" data-bd-perk-add>' + esc(T('cpp.bd.perk.add')) + '</button>' +
          '</div>' +

          /* ── 定價區塊：這張卡唯一的「結果」──────────────────────────────
             優惠（唯一可填的定價決定）與價格（算出來的）並排成兩個窄欄，兩行說明
             橫跨整列接在下面：算式與上限句都是完整句子，塞進窄欄會折成五行。
             價格欄沿用建立頁 #fd-perslot 那個「自動算出來的錢」的既有做法
             （.amount-field--readonly ＋ disabled input），不自創第二種唯讀金額樣式；
             優惠欄沿用站上既有的百分比欄做法（.amount-field--suffix.amount-field--readonly
             ＋ 右側 % 後綴，同 admin-platform-fees／create-product／bundle-detail）。
             價格的標籤沒有必填星號——星號是「這格等你填」的承諾，它已經不成立了。 */
          '<div class="fc-pricing">' +
            '<div class="fc-pricing__row">' +
              '<div class="field">' +
                '<label class="field__label">' + esc(T('cpp.bd.discount')) + '</label>' +
                '<div class="amount-field amount-field--suffix amount-field--readonly">' +
                  '<input class="amount-field__input input" type="number" min="0" max="100" step="1" data-bd-f="discount" value="' + esc(b.discount) +
                    '" placeholder="' + esc(T('cpp.bd.discount.ph')) + '">' +
                  '<span class="amount-field__unit">%</span></div>' +
              '</div>' +
              '<div class="field fc-pricing__out">' +
                '<label class="field__label">' + esc(T('cpp.bd.price')) + '</label>' +
                '<div class="amount-field amount-field--readonly"><span class="amount-field__unit"><span class="amount-field__sym">$</span></span>' +
                  '<input class="amount-field__input input" data-bd-price value="' + esc(money(finalPrice(b)).replace('$', '')) + '" disabled></div>' +
              '</div>' +
            '</div>' +
            '<div class="field__hint fc-pricing__note" data-bd-price-hint>' + esc(priceHintText(b)) + '</div>' +
            '<div class="field__hint fc-pricing__note' + (discountOver(b) ? ' fc-hint--over' : '') +
              '" data-bd-discount-hint>' + esc(discountHintText(b)) + '</div>' +
          '</div>' +

          /* ── 卡片底部的兩個出口 ────────────────────────────────────────
             收合＝整條可點的把手（滑鼠不用瞄準，卡片這麼長時最常按的就是它）。
             移除＝把手下面的紅色按鈕：它刪掉整張套組、且無法復原，所以用站上既有的
             destructive 樣式明說後果，並與收合分成上下兩層，不並排在同一條線上。 */
          '<button class="fc-collapse" type="button" data-bd-toggle>' +
            '<i data-lucide="chevron-up" class="ztor-icon"></i>' + esc(T('cpp.bd.collapse.long')) +
          '</button>' +
          (BUNDLES.length > 1
            ? '<div class="fc-bundle__foot">' +
                '<button class="btn btn--destructive btn--sm" type="button" data-bd-remove>' +
                  esc(T('cpp.bd.remove.long')) + '</button>' +
              '</div>'
            : '') +
        '</div>' +
      '</div>';
    }

    function render(o) {
      /* 重畫會殺掉焦點與游標位置。先記下「哪張卡的哪個欄位、游標在第幾個字」，畫完還原。 */
      var ae = document.activeElement;
      var keep = null;
      if (ae && list.contains(ae)) {
        var card = ae.closest('[data-bd-card]');
        if (card) keep = {
          id: card.dataset.bdCard,
          sel: ae.dataset.bdF ? '[data-bd-f="' + ae.dataset.bdF + '"]'
             : ae.hasAttribute('data-bd-search') ? '[data-bd-search]'
             : ae.dataset.bdPerk != null ? '[data-bd-perk="' + ae.dataset.bdPerk + '"]' : null,
          start: ae.selectionStart, end: ae.selectionEnd,
        };
      }

      /* 彈窗捲到哪裡也要記下來（2026-08-13 使用者回報「點了選項就跳回最頂端」）：
         重畫是整段 innerHTML 換掉，捲動位置歸零，於是在「販售設定」那一段勾一個開關，
         畫面會自己彈回「票種」——使用者以為自己被送回了第一步。
         以卡片 id 記，一張卡對一個捲動位置；卡沒了就自然不還原。 */
      var scrolls = {};
      list.querySelectorAll('[data-bd-card] .payout-dialog__body').forEach(function (body) {
        var c = body.closest('[data-bd-card]');
        if (c && body.scrollTop) scrolls[c.dataset.bdCard] = body.scrollTop;
      });

      /* 分段版型：收合列一律全部畫出來（編輯中的那一組也留著它的列，否則清單會在
         彈窗打開的瞬間少一行），展開的那一組另外附一個彈窗。彈窗排在前面，
         焦點還原的 querySelector 才會先命中它。 */
      list.innerHTML = SECTIONS
        ? BUNDLES.filter(function (b) { return !b.collapsed; })
              .map(function (b) { return secCardHTML(b, BUNDLES.indexOf(b)); }).join('') +
          /* 還沒送出過的新卡不先佔一列：它在按下「完成」之前還不是清單上的東西，
             先放一列「未命名套組 · 還沒有內容」等於替使用者宣告一個他還沒做的決定。
             已存在的那些就算正在編輯也留著列，否則清單會在彈窗打開的瞬間少一行。 */
          BUNDLES.filter(function (b) { return b.collapsed || !b.fresh; })
              .map(function (b) { return secRowHTML(b, BUNDLES.indexOf(b)); }).join('')
        : BUNDLES.map(cardHTML).join('');
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(list);
      /* 上傳格是重畫出來的，要再跑一次 partials/upload-tile.js 的初始化——它只在載入時
         掃一次靜態 HTML，沒被初始化的格子拿不到 .is-empty，而 upload-tile.css 用
         `:not(.is-empty)` 判定「已經有圖」，於是把圖示、標題與尺寸提示全部藏起來，
         畫面上只剩一個空的虛線框（2026-08-13 實測）。enhance() 自己會跳過已處理的格子。 */
      if (window.ztorUploadTile && window.ztorUploadTile.init) window.ztorUploadTile.init();
      /* 全選勾選框的「勾了一部分」是 DOM 屬性、寫不進 HTML 字串，所以每次重畫之後
         要再補一次；只補這一項，不跑整支 syncPickState（它在某些狀態下會再叫 render）。 */
      if (SECTIONS) {
        list.querySelectorAll('[data-bd-card]').forEach(function (card) {
          var b = get(card.dataset.bdCard);
          if (b) syncTriBoxes(card, b);
        });
      }

      /* 捲動位置還原。要在同一拍做完（不排到下一個 frame）——晚一拍還原，使用者會先
         看到畫面閃回頂端再跳回來，比不還原更難讀。
         `o.top`＝換了一步，兩步的內容不一樣，把上一步的捲動位置套上去只會落在別的地方。 */
      if (o && o.top) scrolls = {};
      Object.keys(scrolls).forEach(function (id) {
        var body = list.querySelector('[data-bd-card="' + id + '"] .payout-dialog__body');
        if (body) body.scrollTop = scrolls[id];
      });

      if (keep && keep.sel && !(o && o.blur)) {
        var target = list.querySelector('[data-bd-card="' + keep.id + '"] ' + keep.sel);
        if (target) {
          target.focus();
          try { target.setSelectionRange(keep.start, keep.end); } catch (_) { /* number inputs 不支援 */ }
        }
      }
      onChange(BUNDLES);
    }

    /* auto 模式下，那行推導出來的份數會隨著名額每打一個字就變，所以「要不要重畫」
       不能再看舊的 disabled 旗標（已經沒有了），改成比對畫面上現在寫的那句話跟
       重算後的那句話是否一致。用 DOM 當「之前」的證據，不另外維護影子狀態。
       limited 模式與結構無關（cap 欄位是否存在只跟 avail 有關），直接回 false。 */
    function autoHintText(b) {
      var s = num(b.slots);
      var hasSlots = Number.isFinite(s) && s > 0;
      var poolN = pool();
      var u = autoUnits(b);
      if (!hasSlots || u === Infinity) return T('cpp.bd.avail.auto.noslots');
      if (!Number.isFinite(poolN)) return T('cpp.bd.avail.auto.nopool');
      return T('cpp.bd.avail.auto.hint')
        .replace('{n}', u.toLocaleString('en-US'))
        .replace('{pool}', poolN.toLocaleString('en-US'));
    }
    function slotsCrossedZero(card, b) {
      if (!SHARES || b.avail === 'limited') return false;
      var shown = card.querySelector('[data-bd-auto-hint]');
      return !shown || shown.textContent !== autoHintText(b);
    }

    /* 不重畫的就地同步：摘要列、算出來的價格、以及所有推導出來的說明文字。 */
    function syncCard(card, b) {
      /* 分段版型的卡片沒有共用的摘要／價格節點（收合態根本是另一種 markup），
         就地同步的對象只有算式那兩個數字——其餘一律靠重畫。 */
      if (SECTIONS) {
        var baseEl = card.querySelector('[data-bd-calc-base]');
        if (baseEl) baseEl.textContent = money(listPrice(b));
        /* 最終價現在有兩個落點（定價分卡的欄位、footer 的結果），兩顆都要更新——
           只取第一顆的話，另一顆會停在重畫當下的舊數字。 */
        card.querySelectorAll('[data-bd-calc-final]').forEach(function (el) {
          el.textContent = money(finalPrice(b));
        });
        /* 售出上限的提示與紅框：打字當下就要跟著改，不重畫（重畫會踢掉游標）。 */
        var capMaxEl = card.querySelector('[data-bd-capmax]');
        if (capMaxEl) {
          capMaxEl.textContent = capMaxHint(b);
          capMaxEl.classList.toggle('fc-hint--over', capOver(b));
        }
        var capEl = card.querySelector('[data-bd-f="cap"]');
        if (capEl) {
          if (capOver(b)) capEl.setAttribute('aria-invalid', 'true');
          else capEl.removeAttribute('aria-invalid');
        }
        var primaryEl = card.querySelector('[data-bd-primary]');
        if (primaryEl) primaryEl.disabled = gateOffFor(b);
        /* footer 的劃線原價：折扣打到 0 或清空時要收掉，否則會留著一個
           跟最終價一模一樣的劃線數字。 */
        var finEl = card.querySelector('.bd-foot-price [data-bd-calc-final]');
        var wasEl = card.querySelector('.bd-foot-price__was');
        var off = listPrice(b) > finalPrice(b);
        if (wasEl && !off) wasEl.remove();
        else if (wasEl) wasEl.textContent = money(listPrice(b));
        else if (off && finEl && finEl.parentNode) {
          finEl.insertAdjacentHTML('beforebegin',
            '<span class="bd-foot-price__was">' + esc(money(listPrice(b))) + '</span>');
        }
        var titleEl = card.querySelector('.fc-sum__name');
        if (titleEl) {
          var idxS = titleEl.querySelector('.fc-bundle__index');
          titleEl.textContent = b.name || suggestName(b) || T('cpp.bd.untitled');
          if (idxS) titleEl.insertBefore(idxS, titleEl.firstChild);
        }
        return;
      }
      var nameEl = card.querySelector('.fc-sum__name');
      var idx = nameEl.querySelector('.fc-bundle__index');
      nameEl.textContent = b.name || T('cpp.bd.untitled');
      if (idx) nameEl.insertBefore(idx, nameEl.firstChild);
      card.querySelector('.fc-sum__meta').textContent = summaryMeta(b);
      /* 標題列的價格在兩種狀態下長得不一樣（收合＝一行摘要價；展開＝帶「套組價」標籤的
         放大金額），就地同步時要挑對那一份，否則打字打到一半標籤會消失。 */
      card.querySelector('.fc-sum__price').innerHTML =
        card.classList.contains('fc-bundle--collapsed') ? summaryPriceHTML(b) : headPriceHTML(b);
      var priceInput = card.querySelector('[data-bd-price]');
      if (priceInput) priceInput.value = money(finalPrice(b)).replace('$', '');
      var priceHint = card.querySelector('[data-bd-price-hint]');
      if (priceHint) priceHint.textContent = priceHintText(b);
      /* 上限會隨名額與商品浮動（移掉一件商品，上限就掉下來），所以這行每次都重算，
         不是只在使用者動優惠欄時才更新。 */
      var discHint = card.querySelector('[data-bd-discount-hint]');
      if (discHint) {
        discHint.textContent = discountHintText(b);
        discHint.classList.toggle('fc-hint--over', discountOver(b));
      }
      var autoHint = card.querySelector('[data-bd-auto-hint]');
      if (autoHint) autoHint.textContent = autoHintText(b);
      /* 預購（D167）：作品列與限量說明都是推導出來的，單價、份數、上限任一動了就要重寫。
         單價住在外面的欄位（建立頁的預購設定、詳情頁的單位價格），所以不能只在
         「使用者動了這張卡」的時候更新——refreshAll() 一律整批走一遍。 */
      var workNameEl = card.querySelector('[data-bd-work-name]');
      if (workNameEl) workNameEl.textContent = workName();
      var workMetaEl = card.querySelector('[data-bd-work-meta]');
      if (workMetaEl) workMetaEl.textContent = workMetaText(b);
      var capHint = card.querySelector('[data-bd-cap-hint]');
      if (capHint) capHint.textContent = capHintText(b);
      /* 2026-07-30：卡片不再標記「未完成」的左緣色線（使用者裁決刪除）。isValid 本身
         沒有動——它仍然是 Continue 擋關與底部教練提示的判準，只是不再有卡片級的表現。 */
    }

    /* 勾一張票之後，畫面上跟著它走、但不在那一列裡的三件事（分段版型）：
       那一列自己的選中色線、票種捷徑的 active、組頭的整場全選。就地改，不重畫——
       重畫會把正在連續勾選的 checkbox 連同焦點一起換掉。 */
    /* 組頭與表頭的全選（2026-08-13 第二輪）：標籤文字拿掉之後，這兩顆勾選框只剩位置
       在說「我管底下那幾列」，所以「勾了一部分」要用 indeterminate 表達——只有 checked
       的話，取消其中一場會讓組頭整個彈回未勾，看起來像自己的操作被撤銷。
       表頭那顆的範圍是這張表列得出來的全部票（＝已選票種在各場次的那幾張）。
       indeterminate 是 DOM 屬性、寫不進 HTML 字串，所以重畫之後也要再跑一次（見 render）。 */
    function syncTriBoxes(card, b) {
      var chosen = b.tickets || [];
      function setTri(box, on, some) {
        if (!box) return;
        box.checked = on;
        box.indeterminate = !on && some;
      }
      var live = [];
      ticketKinds().forEach(function (k) {
        if (k.ids.some(function (id) { return chosen.indexOf(id) >= 0; })) live = live.concat(k.ids);
      });
      ticketGroups().forEach(function (g) {
        var rows = g.rows.filter(function (t) { return live.indexOf(t.id) >= 0; });
        setTri(card.querySelector('[data-bd-group="' + g.id + '"]'),
          rows.length > 0 && rows.every(function (t) { return chosen.indexOf(t.id) >= 0; }),
          rows.some(function (t) { return chosen.indexOf(t.id) >= 0; }));
      });
      setTri(card.querySelector('[data-bd-all]'),
        live.length > 0 && live.every(function (id) { return chosen.indexOf(id) >= 0; }),
        live.some(function (id) { return chosen.indexOf(id) >= 0; }));
    }

    function syncPickState(card, b) {
      var chosen = b.tickets || [];
      card.querySelectorAll('[data-bd-ticket]').forEach(function (input) {
        /* 兩種列型：分段版型的表格列（`.bd-tbl__row`）與預設版型的引用列（`.bd-ticket`）。 */
        var on = chosen.indexOf(input.dataset.bdTicket) >= 0;
        var tblRow = input.closest('.bd-tbl__row');
        if (tblRow) { tblRow.classList.toggle('bd-tbl__row--off', !on); return; }
        var row = input.closest('.bd-ticket');
        if (row) row.classList.toggle('bd-ticket--on', on);
      });
      ticketKinds().forEach(function (k) {
        var kc = card.querySelector('[data-bd-kind="' + k.id + '"]');
        if (!kc) return;
        var picked = k.ids.filter(function (id) { return chosen.indexOf(id) >= 0; }).length;
        var on = picked > 0;
        kc.classList.toggle('chip--active', on);          /* chip 版（其他消費頁） */
        kc.classList.toggle('segmented__btn--active', on); /* 卡片版（分段版型） */
        kc.setAttribute('aria-pressed', String(on));
        /* 卡片的說明要跟著「取消了哪幾場」走，否則取消一場之後卡片還寫著全選 */
        var sub = kc.querySelector('.radio-card__sub');
        if (sub) {
          var first = ticketById(k.ids[0]) || {};
          sub.textContent = on
            ? (k.ids.length > 1
                ? T('cpp.bd.kind.on.n').replace('{n}', picked).replace('{all}', k.ids.length)
                : T('cpp.bd.kind.on'))
            : (Number(first.price) === 0 ? T('ce.tier.free') : '$' + first.price);
        }
      });
      syncTriBoxes(card, b);
      /* 兩個東西只在「有沒有選到票」翻面的當下才需要重畫：挑選器的「完成選擇」，
         以及 footer 主要按鈕的停用狀態。 */
      var bar = card.querySelector('.bd-pick__bar');
      var primary = card.querySelector('[data-bd-primary]');
      var gateWrong = primary && (primary.disabled !== gateOffFor(b));
      if (gateWrong || (bar && !bar.querySelector('[data-bd-pickdone]') && chosen.length)) render({ blur: true });
    }

    /* 一張卡的改動會外溢到別張：auto 推導吃的是「全域」剩餘名額（B 鎖走 50 → A 從
       10 份掉到 5 份）。價格則是外部注入的每名額單價一變、每張卡同時要改。
       所以任何變動一律整批就地同步，而不是只更新被動到的那張。
       就地改文字、不整塊重畫——重畫會把游標從正在打字的欄位踢掉。 */
    function refreshAll() {
      list.querySelectorAll('[data-bd-card]').forEach(function (card) {
        var b = get(card.dataset.bdCard);
        if (b) syncCard(card, b);
      });
    }

    function renderResults(card, b, q) {
      var box = card.querySelector('[data-bd-results]');
      if (!box) return;
      var term = String(q || '').trim().toLowerCase();
      if (!term) { box.hidden = true; box.innerHTML = ''; return; }
      var taken = {};
      b.items.forEach(function (i) { taken[i.id] = true; });
      var hits = catalogue().filter(function (p) {
        return !taken[p.id] && p.name.toLowerCase().indexOf(term) >= 0;
      }).slice(0, 6);
      box.innerHTML =
        hits.map(function (p) {
          return '<button type="button" class="fc-pick__opt" data-bd-opt="' + esc(p.id) + '">' +
            (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy">' : '<span></span>') +
            '<span>' + esc(p.name) + '</span>' +
            '<span class="fc-pick__opt-price">' + (p.price ? '$' + esc(p.price) : '') + '</span>' +
          '</button>';
        }).join('') +
        (hits.length ? '' : '<div class="fc-pick__empty">' + esc(T('cpp.bd.search.none')) + '</div>') +
        '<button type="button" class="fc-pick__opt" data-bd-opt="__new"><span></span>' +
          '<span>' + esc(T('cpp.bd.search.new').replace('{q}', q)) + '</span><span></span></button>';
      box.hidden = false;
    }

    /* ── 事件（全部委派到容器，卡片是重畫出來的，直接綁會掉） ──────────────── */
    list.addEventListener('input', function (e) {
      var card = e.target.closest('[data-bd-card]');
      if (!card) return;
      var b = get(card.dataset.bdCard);
      if (!b) return;

      if (e.target.dataset.bdF) {
        var f = e.target.dataset.bdF;
        var wasAvail = b.avail;
        b[f] = e.target.value;
        /* 2026-07-28（使用者裁示）：填了名額不再自動切 Limited。份數由池子算出來，
           auto 就是預設；Limited 只有創作者自己點下去、想設硬上限時才進去。 */

        /* 只有「卡片結構會變」時才整塊重畫——也就是名額跨越 0（切換 Limited 強制、
           顯示/隱藏強制說明）的那一刻。打字本身不重畫：每個字元重建一次 DOM 又把
           游標還原回去，是在跟自己打架，而且任何持有節點參照的程式都會拿到斷開的節點。 */
        var structural = (f === 'slots') && (b.avail !== wasAvail || slotsCrossedZero(card, b));
        if (structural) { render(); return; }

        refreshAll();   /* 這張卡的 slots/cap 會改變別張 auto 卡的推導與價格 */
        onChange(BUNDLES);
        return;
      }
      if (e.target.dataset.bdPerk != null) {
        b.perks[Number(e.target.dataset.bdPerk)] = e.target.value;
        onChange(BUNDLES);   /* perks 不影響卡片結構，不必重畫 */
        return;
      }
      if (e.target.hasAttribute('data-bd-search')) {
        renderResults(card, b, e.target.value);
      }
    });

    /* 含作品份數的下限（D167：最小 1）在離開欄位時才夾住，不在打字當下夾——
       打字當下夾會讓「清空再重打」變成不可能（每刪一個字就被塞回 1）。
       離開時把狀態與畫面一起補成 1，才不會留下一個空欄位配著算 1 份的價格。 */
    list.addEventListener('change', function (e) {
      /* 表頭全選（分段版型，2026-08-13）：一次翻掉表上所有列。範圍限「這張表列得出來的票」
         ——也就是已選票種在各場次的那幾張，不會去動沒被列出來的票種。 */
      if (e.target.hasAttribute && e.target.hasAttribute('data-bd-all')) {
        var cardA = e.target.closest('[data-bd-card]');
        var ba = cardA && get(cardA.dataset.bdCard);
        if (ba) {
          var kindsA = ticketKinds().filter(function (k) {
            return k.ids.some(function (id) { return (ba.tickets || []).indexOf(id) >= 0; });
          });
          var allIds = [];
          kindsA.forEach(function (k) { allIds = allIds.concat(k.ids); });
          ba.tickets = e.target.checked
            ? (ba.tickets || []).concat(allIds.filter(function (id) { return ba.tickets.indexOf(id) < 0; }))
            : (ba.tickets || []).filter(function (id) { return allIds.indexOf(id) < 0; });
          render({ blur: true });
        }
        return;
      }
      /* 整場全選（分段版型）：一次翻該場的全部票。重畫是必要的——票種捷徑的 active
         狀態與收合態的 chip 都要跟著這一次翻動重算。 */
      var grp = e.target.closest('[data-bd-group]');
      if (grp) {
        var cardG = e.target.closest('[data-bd-card]');
        var bg = cardG && get(cardG.dataset.bdCard);
        if (bg) {
          var g = ticketGroups().filter(function (x) { return x.id === grp.dataset.bdGroup; })[0];
          var ids = g ? g.rows.map(function (t) { return t.id; }) : [];
          bg.tickets = grp.checked
            ? bg.tickets.concat(ids.filter(function (id) { return bg.tickets.indexOf(id) < 0; }))
            : bg.tickets.filter(function (id) { return ids.indexOf(id) < 0; });
          render({ blur: true });
        }
        return;
      }
      var tk = e.target.closest('[data-bd-ticket]');
      if (tk) {
        var cardT = e.target.closest('[data-bd-card]');
        var bt = cardT && get(cardT.dataset.bdCard);
        if (bt) {
          var id = tk.dataset.bdTicket, at = (bt.tickets || []).indexOf(id);
          if (tk.checked && at < 0) bt.tickets.push(id);
          else if (!tk.checked && at >= 0) bt.tickets.splice(at, 1);
          /* 不重繪：重繪會把 checkbox 連同焦點一起換掉，連續勾兩個就會斷。
             這一格改變的只有自己的勾選狀態與整卡的有效性，兩者都不需要重畫。
             分段版型多了三個跟著這一勾走的東西（票種捷徑的 active、組頭的全選、
             算式與卡頭標題），一樣就地同步、不重畫——見 syncPickState()。 */
          if (SECTIONS) { syncPickState(cardT, bt); refreshAll(); }
          onChange();
        }
        return;
      }
      if (!e.target.dataset || e.target.dataset.bdF !== 'units') return;
      var card = e.target.closest('[data-bd-card]');
      var b = card && get(card.dataset.bdCard);
      if (!b) return;
      var fixed = unitCount(b);
      if (String(b.units) !== String(fixed)) {
        b.units = fixed;
        e.target.value = fixed;
        refreshAll();
        onChange(BUNDLES);
      }
    });

    /* 搜尋框失焦時收起結果；用 mousedown 之前的 blur 會吃掉點擊，所以延遲一拍。 */
    list.addEventListener('focusout', function (e) {
      if (!e.target.hasAttribute || !e.target.hasAttribute('data-bd-search')) return;
      var pick = e.target.closest('[data-bd-pick]');
      setTimeout(function () {
        if (pick && !pick.contains(document.activeElement)) {
          var r = pick.querySelector('[data-bd-results]'); if (r) r.hidden = true;
        }
      }, 120);
    });

    list.addEventListener('click', function (e) {
      /* 收合列在 [data-bd-card] 之外（見 secRowHTML 的說明），要先接。
         一次只編輯一組：打開這一組的同時把其餘收回列。 */
      var open = e.target.closest('[data-bd-open]');
      if (open) {
        var bo = get(open.dataset.bdOpen);
        if (bo) {
          BUNDLES.forEach(function (x) { x.collapsed = true; });
          bo.collapsed = false;
          bo.step = 1;          /* 每次打開都從第 1 步開始，不接續上次停在哪 */
          render({ blur: true, top: true });
        }
        return;
      }
      var card = e.target.closest('[data-bd-card]');
      if (!card) return;
      var b = get(card.dataset.bdCard);
      if (!b) return;

      /* ── 分段版型專屬的動作 ────────────────────────────────────────── */
      var scope = e.target.closest('[data-bd-scope]');
      if (scope) {
        /* 換了對應方式，原本挑的票就不再成立（一個是挑「哪一場的哪一張」、
           一個是挑「哪一個票種」），清空重挑比留著讓人猜誠實。 */
        b.scope = scope.dataset.bdScope;
        b.tickets = [];
        b.pickOpen = true;
        render({ blur: true });
        return;
      }
      var kind = e.target.closest('[data-bd-kind]');
      if (kind) {
        var k = ticketKinds().filter(function (x) { return x.id === kind.dataset.bdKind; })[0];
        if (k) {
          var allOn = k.ids.every(function (id) { return b.tickets.indexOf(id) >= 0; });
          b.tickets = allOn
            ? b.tickets.filter(function (id) { return k.ids.indexOf(id) < 0; })
            : b.tickets.concat(k.ids.filter(function (id) { return b.tickets.indexOf(id) < 0; }));
          render({ blur: true });
        }
        return;
      }
      if (e.target.closest('[data-bd-pickdone]')) { b.pickOpen = false; render({ blur: true }); return; }
      if (e.target.closest('[data-bd-pickopen]')) { b.pickOpen = true; render({ blur: true }); return; }
      if (e.target.closest('[data-bd-usesug]')) { b.name = suggestName(b); render({ blur: true }); return; }
      if (e.target.closest('[data-bd-disc-toggle]')) {
        b.discountOn = !b.discountOn;
        /* 關掉就把值清掉：留著一個看不見卻仍在算的折扣，是畫面與價格對不起來的來源。 */
        if (!b.discountOn) b.discount = '';
        render({ blur: true });
        return;
      }
      /* 主要按鈕：第 1 步是「下一步」、第 2 步才是送出。就緒未過時按鈕本來就是停用的，
         這裡再擋一次是為了鍵盤與程式化觸發。 */
      if (e.target.closest('[data-bd-primary]')) {
        if (b.step !== 2) {
          if (gateOffFor(b)) return;
          b.step = 2;
          render({ blur: true, top: true });
          return;
        }
        if (readyMiss(b).length) return;
        commit(b);
        return;
      }
      if (e.target.closest('[data-bd-back]')) { b.step = 1; render({ blur: true, top: true }); return; }
      if (e.target.closest('[data-bd-close]')) { close(b); return; }

      var avail = e.target.closest('[data-bd-avail]');
      if (avail) {
        if (avail.disabled) return;
        b.avail = avail.dataset.bdAvail;
        render({ blur: true });
        return;
      }
      if (e.target.closest('[data-bd-toggle]')) {
        e.preventDefault(); b.collapsed = !b.collapsed; render({ blur: true }); return;
      }
      if (e.target.closest('[data-bd-expand]') && b.collapsed) {
        b.collapsed = false; render({ blur: true }); return;
      }
      if (e.target.closest('[data-bd-remove]')) {
        e.preventDefault();
        BUNDLES = BUNDLES.filter(function (x) { return x.id !== b.id; });
        render({ blur: true });
        return;
      }
      var ref = e.target.closest('[data-bd-item-remove]');
      if (ref) {
        var row = ref.closest('[data-bd-ref]');
        b.items = b.items.filter(function (it) { return it.id !== row.dataset.bdRef; });
        render({ blur: true });
        return;
      }
      if (e.target.closest('[data-bd-perk-add]')) {
        b.perks.push(''); render({ blur: true });
        var pk = list.querySelector('[data-bd-card="' + b.id + '"] [data-bd-perk="' + (b.perks.length - 1) + '"]');
        if (pk) pk.focus();
        return;
      }
      var prm = e.target.closest('[data-bd-perk-remove]');
      if (prm) {
        b.perks.splice(Number(prm.dataset.bdPerkRemove), 1); render({ blur: true }); return;
      }
      var opt = e.target.closest('[data-bd-opt]');
      if (opt) {
        var id = opt.dataset.bdOpt;
        if (id === '__new') {
          /* 目錄裡沒有＝還沒壓出來的黑膠。就地開一個草稿商品，仍然是一筆真的目錄列，
             只是狀態是草稿——不是退回自由文字。 */
          var q = card.querySelector('[data-bd-search]').value.trim();
          /* 草稿商品沒有定價（還沒壓出來的東西也還沒定價），price 留空＝計價時算 0。 */
          if (q) b.items.push({ id: 'draft:' + q.toLowerCase().replace(/\s+/g, '-'), name: q, img: '', meta: T('cpp.bd.item.draft'), price: '' });
        } else if (!b.items.some(function (it) { return it.id === id; })) {
          var p = catalogue().filter(function (x) { return x.id === id; })[0];
          if (p) b.items.push({ id: p.id, name: p.name, img: p.img, meta: p.price ? '$' + p.price : p.meta, price: p.price || '' });
        }
        render({ blur: true });
        return;
      }
    });

    /* 送出這一張（分段版型的「完成 ／ 建立 N 組」）。
       shared：就是把卡收成一列——沒填名字的用建議名補上，收合列的辨識靠名稱。
       per   ：把挑到的票種在每一場各展開成一組，原本那張編輯卡功成身退。
               每一組只含那一場對應的票，所以之後可以分開改價、分開下架。 */
    function commit(b) {
      if (b.scope !== 'per') {
        if (!b.name) b.name = suggestName(b);
        b.pickOpen = false;
        b.fresh = false;
        b.collapsed = true;
        render({ blur: true });
        return;
      }
      var groups = ticketGroups();
      var kinds = {};
      (b.tickets || []).forEach(function (id) {
        var t = ticketById(id);
        if (t && t.kind) kinds[t.kind.id] = true;
      });
      var picked = Object.keys(kinds);
      /* 一個票種都沒挑就沒有東西可展開——維持在編輯狀態，不要靜默生出 N 張空卡。 */
      if (!picked.length || !groups.length) return;
      var stem = b.name || suggestName(b) || T('cpp.bd.untitled');
      /* 只展開真的有票可放的場次——那一場沒有賣這個票種的話，展開出來會是一顆空組合包。
         這一行也讓「會建立的組合包」那張分卡與這裡展開的結果逐列相同（perRows 同條件）。 */
      var made = groups.filter(function (g) {
        return g.rows.some(function (t) { return t.kind && picked.indexOf(t.kind.id) >= 0; });
      }).map(function (g) {
        var copy = newBundle();
        copy.name = stem + ' · ' + g.name;
        copy.desc = b.desc;
        copy.cover = b.cover;
        copy.discount = b.discount;
        copy.cap = b.cap;
        copy.items = b.items.slice();
        copy.perks = b.perks.slice();
        copy.tickets = g.rows
          .filter(function (t) { return t.kind && picked.indexOf(t.kind.id) >= 0; })
          .map(function (t) { return t.id; });
        copy.pickOpen = false;
        copy.collapsed = true;
        return copy;
      });
      var at = BUNDLES.indexOf(b);
      BUNDLES.splice(at < 0 ? BUNDLES.length : at, at < 0 ? 0 : 1);
      made.forEach(function (m, i) { BUNDLES.splice((at < 0 ? BUNDLES.length : at) + i, 0, m); });
      render({ blur: true });
    }

    /* 關掉彈窗。什麼都還沒填的新卡直接丟掉——留下來會在清單上多一列「未命名套組 ·
       還沒有內容」，那不是使用者建的東西，是他按了新增又改變主意。
       已經有內容的就收回列：這支編輯器是即時寫入狀態的，沒有可以還原的「取消」，
       所以按鈕也不寫「取消」（那會是一句做不到的承諾）。 */
    function close(b) {
      var empty = !(b.tickets || []).length && !b.items.length && !b.perks.length && !b.name && !b.desc;
      if (b.fresh && empty) {
        BUNDLES = BUNDLES.filter(function (x) { return x.id !== b.id; });
      } else {
        b.collapsed = true;
      }
      b.step = 1;
      render({ blur: true });
    }

    function add() {
      /* 新增時把已填妥的卡收起來：建立回饋是比較式寫作，新的那張要獨佔注意力。
         分段版型更嚴格——一次只編輯一張，其餘一律收成列（未填完的也收，它的內容
         在收合列上仍讀得到「還沒有內容」，比兩張攤開的表單好認）。 */
      BUNDLES.forEach(function (b) { if (SECTIONS || isValid(b)) b.collapsed = true; });
      BUNDLES.push(newBundle());
      render({ blur: true });
      var cards = list.querySelectorAll('[data-bd-card]');
      var last = cards[cards.length - 1];
      /* 分段版型不需要捲動定位也不自動聚焦：彈窗自己浮在畫面中央，
         而且第一個要做的決定是「賣什麼」，不是名稱（名稱在第三段）。 */
      if (last && !SECTIONS) {
        last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        var i = last.querySelector('[data-bd-f="name"]');
        if (i) i.focus();
      }
    }
    if (addBtn) addBtn.addEventListener('click', add);

    /* Esc 關掉彈窗（分段版型）：站上其他彈窗都收 Esc，這一個沒有的話會是唯一的例外。 */
    if (SECTIONS) document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = BUNDLES.filter(function (b) { return !b.collapsed; })[0];
      if (open) { e.stopPropagation(); close(open); }
    });

    /* 第一次進到這步就給一張空卡：「新增第一張」永遠是使用者要做的事。 */
    function ensure() {
      if (!BUNDLES.length) BUNDLES.push(newBundle());
      render({ blur: true });
    }

    function setBundles(arr) {
      BUNDLES = (arr || []).map(function (s) {
        var b = newBundle(s);
        if (opts.collapsedByDefault) b.collapsed = true;
        return b;
      });
      render({ blur: true });
    }

    if (opts.initial && opts.initial.length) setBundles(opts.initial);

    return {
      /* 狀態 */
      getBundles: function () { return BUNDLES; },
      setBundles: setBundles,
      add: add,
      ensure: ensure,
      render: render,
      /* 外部注入的值（每名額單價、名額池）改變時呼叫：就地重算每張卡，不重畫、不搶焦點。 */
      refresh: refreshAll,
      /* 推導（給頁面的摘要／驗證共用同一套算式，不要各自重算一份） */
      /* 讓外部摘要（總覽的方案摘要）用同一支格式化：金額的四捨五入與千分位在這裡
         只寫一次，摘要自己 toFixed 遲早會跟卡片顯示的數字差一塊錢。 */
      money: money,
      /* 一句話交代這張方案裝了什麼（幾件商品／幾個名額／幾項權益）。總覽的方案摘要
         與卡片上的摘要行讀同一支，兩邊的算法不會分岔。 */
      summaryMeta: summaryMeta,
      isValid: isValid,
      listPrice: listPrice,
      finalPrice: finalPrice,
      maxDiscount: maxDiscount,   /* 可折抵上限（金額） */
      maxPct: maxPct,             /* 同一個上限的百分比說法（向下取整） */
      perSlot: perSlot,
      unitPrice: unitPrice,       /* 作品單位價格（預購；共創恆為 0） */
      unitCount: unitCount,       /* 含作品份數（預購；共創恆為 0） */
      workValue: workValue,       /* 作品那一段的小計 */
      maxUnits: maxUnits,
      autoUnits: autoUnits,
      committedSlots: committedSlots,
      pool: pool,
      num: num,
    };
  }

  window.ZtorBundleEditor = { mount: mount, catalogue: catalogue, num: num };
})();
