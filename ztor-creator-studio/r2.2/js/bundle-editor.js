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
    function listPrice(b) { return shareValue(b) + workValue(b) + itemsTotal(b); }
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
    function discountPct(b) { var p = cash(b.discount); return p > 0 ? p : 0; }
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
      /* 預購的收合列先報含幾份作品（規格 F28 要求卡片顯示含作品份數），再報附屬商品。 */
      if (!SHARES) {
        var u = unitCount(b);
        bits.push(u + ' ' + T(u === 1 ? 'cpp.bd.n.copy' : 'cpp.bd.n.copies'));
      }
      if (b.items.length) bits.push(b.items.length + ' ' + T(b.items.length === 1 ? 'cpp.bd.n.item' : 'cpp.bd.n.items'));
      if (b.perks.length) bits.push(b.perks.length + ' ' + T(b.perks.length === 1 ? 'cpp.bd.n.perk' : 'cpp.bd.n.perks'));
      var s = slotCount(b);   /* 預購恆為 0，摘要列不會冒出「N 個名額」 */
      if (s > 0) bits.push(s + ' ' + T(s === 1 ? 'cpp.bd.n.slot' : 'cpp.bd.n.slots'));
      if (b.avail === 'limited' && num(b.cap) > 0) bits.push(num(b.cap) + ' ' + T('cpp.bd.n.available'));
      return bits.length ? bits.join(' · ') : T('cpp.bd.sum.empty');
    }

    function cardHTML(b, i) {
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
          '<div class="upload-assets">' +
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
            '<div>' +
              '<div class="fc-sum__name"><span class="fc-bundle__index">' + String(i + 1).padStart(2, '0') + '</span>' +
                esc(b.name || T('cpp.bd.untitled')) + '</div>' +
              '<div class="fc-sum__meta">' + esc(summaryMeta(b)) + '</div>' +
            '</div>' +
            '<div class="fc-sum__price">' + (b.collapsed ? summaryPriceHTML(b) : headPriceHTML(b)) + '</div>' +
            '<span></span>' +
          '</div>' +
          /* 動作只在收合態留在標題列：那時卡片只有一列，沒有別的地方可以放。
             展開後改放卡片底部（見 .fc-bundle__foot），右上角讓給價格——
             把「這張卡值多少」跟「刪掉這張卡」擺在同一個角落，是把最常看的資訊
             和最不可逆的動作放進同一次瞄準。 */
          (b.collapsed
            ? '<div class="fc-bundle__actions">' +
                '<a class="card__link" href="#" data-bd-toggle>' + esc(T('cpp.bd.edit')) + '</a>' +
                (BUNDLES.length > 1 ? '<a class="card__link" href="#" data-bd-remove>' + esc(T('cpp.bd.remove')) + '</a>' : '') +
              '</div>'
            : '') +
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
            '<button class="btn btn--outline btn--sm fc-add-item" type="button" data-bd-perk-add>' + esc(T('cpp.bd.perk.add')) + '</button>' +
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

      list.innerHTML = BUNDLES.map(cardHTML).join('');
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(list);

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
      var tk = e.target.closest('[data-bd-ticket]');
      if (tk) {
        var cardT = e.target.closest('[data-bd-card]');
        var bt = cardT && get(cardT.dataset.bdCard);
        if (bt) {
          var id = tk.dataset.bdTicket, at = (bt.tickets || []).indexOf(id);
          if (tk.checked && at < 0) bt.tickets.push(id);
          else if (!tk.checked && at >= 0) bt.tickets.splice(at, 1);
          /* 不重繪：重繪會把 checkbox 連同焦點一起換掉，連續勾兩個就會斷。
             這一格改變的只有自己的勾選狀態與整卡的有效性，兩者都不需要重畫。 */
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
      var card = e.target.closest('[data-bd-card]');
      if (!card) return;
      var b = get(card.dataset.bdCard);
      if (!b) return;

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

    function add() {
      /* 新增時把已填妥的卡收起來：建立回饋是比較式寫作，新的那張要獨佔注意力。 */
      BUNDLES.forEach(function (b) { if (isValid(b)) b.collapsed = true; });
      BUNDLES.push(newBundle());
      render({ blur: true });
      var cards = list.querySelectorAll('[data-bd-card]');
      var last = cards[cards.length - 1];
      if (last) {
        last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        var i = last.querySelector('[data-bd-f="name"]');
        if (i) i.focus();
      }
    }
    if (addBtn) addBtn.addEventListener('click', add);

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
