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

   2026-09-18（D292／D293）活動變體的票改成「票券清單（票種 × 張數）」：
     · `tickets` 由 `[票種 id]` 改成 `[{id, qty}]`——多筆＝這一組**同時內含**這幾種票
       （家庭套票），不再是「粉絲擇一」；舊資料若是字串陣列一律視為 qty 1（tixNorm）。
     · 原價合計＝Σ（票價 × 張數）＋Σ 商品價，「取最貴那一張票」的估算隨舊語意退場。
     · 販售上限的硬頂＝各成員（剩餘量 ÷ 每套用量）取最小，票券看票種張數、商品看庫存。
     · 至少 1 個成員即成立（票券任一筆或商品任一件，D293），商品改為選填。
     · 每場各一組（scope='per'）展開時每組沿用同一份票券清單，張數跟著。
   規格出處：documents/5.1.5.4 §4 F2／F3／F4、5.1.6.1 §4.6 F20、decisions.md D292／D293。
   募資兩頁（create-project／project-detail）沒有 tickets，這一批改動對它們不生效。

   2026-09-21（D295／D296）票券成員改「允許票種清單 × 固定張數，粉絲任選一種」：
     · `tickets` 由 `[{id, qty}]` 改成**一個物件** `{ tierIds:[...], qty:n }`——tierIds＝創作者
       勾選的允許票種（票券項目 id，多場活動時是各場的那張票）、qty＝整組一個張數。粉絲購買時
       從允許票種挑一種、拿到該票種 × n 張；只勾一種＝鎖定。「多種票各自張數（同時內含）」
       的每列張數模型退場；舊 `[{id, qty}]`／`['id']` 在 tixNorm 相容成 tierIds＝各 id、qty＝第一筆。
     · 原價：一種＝票價 × n；多種＝「從 $最低票價 × n 起」（定價卡算式、footer、收合列都標「起」）。
     · 販售上限硬頂：票券部分＝各允許票種 floor(剩餘 ÷ n) 加總（任一票種剩餘 ≥ n 即可賣），
       再與商品部分取最小。
     · 商品成員的規格由商品本身決定（D295）：多選項商品在成員列標「規格由粉絲購買時選」，
       建組合時不挑規格。
   規格出處：decisions.md D295／D296、主規格 §7.14、5.1.5.4 §4 F2／F3／F4、5.1.6.1 §4.6 F20。

   2026-09-21（第二輪，`layout:'split'`）建立活動第 6 步改成 demo 定案的版面（使用者看過
   `docs/bundle-create-demo-2026-09-21.html` 後裁示「做上正式」）：
     · 彈窗改特寬兩欄（`.payout-dialog--xwide` ＋ `.payout-dialog__split`）——左欄三段分卡
       「內容物 → 定價與庫存 → 命名與上架」（2026-09-21 同日改名，原「內容／定價與數量」）、右欄「粉絲看到的」預覽卡（`ds-components/
       bundle-preview-card.css`，黏在上方、可點：票種／場次／尺寸顏色 chip 只影響預覽），
       footer＝粉絲實付（從 $Y 起）＋原價與最多組數一句＋取消／完成。兩步彈窗（第 2 步名稱
       與封面）在這個版型退場，名稱改由內容自動建議、使用者改過就不再覆蓋（`nameTouched`）。
     · 新增狀態欄位 `lockSets`（鎖定套數，D266）與 `sold`（已售出組數；> 0 時票種、張數、商品
       鎖定，只剩折扣、鎖定套數、上限可改——D292 裁決七）。資料形狀其餘不變：`tickets`＝
       `{ tierIds, qty }`、`items`、`perks`、`discount`、`avail`／`cap`；`commit()` 與每場各一組
       展開照舊。
     · 商品成員帶 `options`／`variants`（從 ZTOR_PRODUCTS 讀）：多規格商品的原價是區間
       「從 $X 起」（各規格價取最小），粉絲端預覽卡長出尺寸／顏色 chip；單一規格固定。
     · 「取消」是真的取消：打開時對這一組拍快照（`snapOf`），取消／✕／Esc 還原快照；
       還沒送出過的新卡直接丟掉。
   `layout:'sections'`（募資兩頁）與預設版型完全不受影響；SPLIT 只在活動變體掛載時傳。
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
    /* IP 資產不進項目（D232）：方案引用的是「可販售的商品」，IP 在項目裡只以
       建立項目 §4.1 F5 的「IP 租借」出現——那是「這個作品借用了誰的 IP」的權利
       揭露，不是貨。目前的種子目錄沒有 IP 類商品，這道過濾是護欄：日後往
       products-store 加了 IP 資產，picker 也不會把授權關係當成回饋品列出來。 */
    var IP_SUBKEYS = ['story-world', 'person-based', 'brand', 'event-format', 'ip-other'];
    return Object.keys(P).reduce(function (acc, k) {
      var name = P[k].name;
      if (!name || seen[name]) return acc;
      if (P[k].ip === true || IP_SUBKEYS.indexOf(P[k].subKey) > -1) return acc;
      seen[name] = true;
      acc.push({
        id: k,
        name: name,
        img: P[k].img ? 'images/products/' + P[k].img : '',
        price: P[k].price || '',
        meta: P[k].catLabel || '',
        stock: P[k].stock,   /* 2026-09-18：販售上限要看商品剩餘（D292），沒有就是不限量 */
        variant: P[k].variant,   /* 2026-09-21（D295）：多選項商品在成員列要標「規格由粉絲購買時選」 */
        /* 2026-09-21 第二輪：選項名與逐規格列（含各規格價／庫存）——多規格商品的原價區間與
           粉絲端預覽卡的尺寸／顏色 chip 都從這兩份讀。單一規格商品沒有這兩欄。 */
        options: P[k].options,
        variants: P[k].variants,
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
    if (it.name) return { id: it.id, name: it.name, img: it.img || '', meta: it.meta || '', price: it.price || '', stock: it.stock, variant: it.variant, options: it.options, variants: it.variants };
    var raw = (window.ZTOR_PRODUCTS || {})[it.id];
    if (raw && raw.name) {
      return {
        id: it.id,
        name: raw.name,
        img: raw.img ? 'images/products/' + raw.img : '',
        meta: raw.price ? '$' + raw.price : (raw.catLabel || ''),
        price: raw.price || '',
        stock: raw.stock,
        variant: raw.variant,
        options: raw.options,
        variants: raw.variants,
      };
    }
    var p = catalogue().filter(function (x) { return x.id === it.id; })[0];
    if (!p) return null;
    return { id: p.id, name: p.name, img: p.img, meta: p.price ? '$' + p.price : p.meta, price: p.price || '', stock: p.stock, variant: p.variant, options: p.options, variants: p.variants };
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
         · tickets ＝ 票券清單（2026-09-21 起是允許票種清單 × 固定張數，見檔頭）。活動套組至少要有
                     1 個成員（票券任一筆或商品任一件）才算有效（isValid，D293）。傳陣列或
                     傳 getter 都可以——票種在建立流程中會即時增減，getter 才拿得到當下的值。 */
    /* work:false ＝ 沒有「作品」這個本體（活動套組賣的是票＋商品，不是一份作品的份數）。
       只在 shares:false 時有意義：共創本來就沒有作品這一段。 */
    var WORK = opts.work !== false;
    var COVER = !!opts.cover;
    var getTickets = typeof opts.tickets === 'function' ? opts.tickets
                   : (opts.tickets ? function () { return opts.tickets; } : null);

    /* 分段版型（2026-08-13，`layout: 'sections'`）：原為活動變體專用——使用者先要
       UI 規劃、看過 `docs/bundle-step-demo.html` 之後裁示「照這樣改正式」。
       2026-09-01 使用者裁示建立專案與項目詳情也改成彈窗＋分段，於是通用化：
       現在**每個消費頁都走這一條**，共創／預購各有自己的第一張分卡
       （含分潤名額／作品＋份數），行內三段卡版型（bd-group）成為無消費頁的備用版型。

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
    /* 分段兩欄版型（2026-09-21 第二輪，`layout:'split'`，見檔頭）：SECTIONS 的一切機制（彈窗、
       收合列、票券表、每場各一組展開）照用，只換彈窗內的版面與 footer；SPLIT 為 true 時
       SECTIONS 必為 true。 */
    var SPLIT = opts.layout === 'split';
    var SECTIONS = opts.layout === 'sections' || SPLIT;
    /* 所屬活動（SPLIT，命名與上架段「跟著活動」那一句、預覽卡的「活動名 · n 張」）：
       頁面注入 getter，回 { name, status, label }——label 是已翻譯的狀態徽章字、status 只用來
       挑徽章色（draft＝無色、on-sale／live＝success、其餘無色）。 */
    var getEvent = typeof opts.event === 'function' ? opts.event : function () { return opts.event || null; };

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
        tickets: { tierIds: [], qty: 1 },   // 允許票種清單 × 每組張數（2026-09-21 D296；舊 [{id, qty}]／[id] 由 tixNorm 相容）
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
        /* SPLIT 版型專用（2026-09-21 第二輪），其餘版型留著不會被讀到：
             lockSets     鎖定套數 N（D266；空白／0＝不鎖定）
             sold         已售出組數（> 0 ＝成員內容鎖定，D292 裁決七；種子帶進來，這裡不會改它）
             nameTouched  名稱是不是使用者自己改過——沒改過就一直跟著內容自動建議 */
        lockSets: '',
        sold: 0,
        nameTouched: false,
      };
      if (seed) {
        /* price 刻意不從 seed 收：舊種子資料還帶著寫死的價格，收進來會蓋掉算出來的值。 */
        Object.keys(seed).forEach(function (k) { if (k !== 'id' && k !== 'items' && k !== 'price') b[k] = seed[k]; });
        /* 票券清單相容：舊種子 `['t1','t2']`／`[{id, qty}]` 由 tixNorm 收成 `{ tierIds, qty }`（D296）。 */
        b.tickets = tixNorm(seed.tickets);
        if (seed.items) {
          b.items = seed.items.map(resolveItem).filter(Boolean);
        }
        /* 預購沒有分潤名額：種子若帶了 slots／avail:'auto'，一律歸零、退回 unlimited。
           留著會讓價格算式偷偷加進一段畫面上根本沒有欄位可以解釋的錢。 */
        if (!SHARES) {
          b.slots = 0;
          if (b.avail !== 'limited') b.avail = 'unlimited';
        }
        /* 分段版的折扣是開關制（discountOn），舊種子只有 discount 數字——帶了折扣卻
           不開開關的話，discountOf() 會回 0，種子的折扣就靜默蒸發（2026-09-01 通用化時補）。 */
        if (SECTIONS && cash(b.discount) > 0) b.discountOn = true;
        /* 帶種子＝這一組本來就存在，不是剛按「新增」開出來的：彈窗標題要寫「編輯」，
           而且原樣關掉也不能被「空卡直接丟掉」的規則收走（2026-09-01 詳情頁接上時抓到）。 */
        b.fresh = false;
        /* 種子帶了名稱＝那是使用者定的，自動建議不再覆蓋它。 */
        b.nameTouched = !!String(seed.name || '').trim();
        b.sold = num(seed.sold) > 0 ? Math.floor(num(seed.sold)) : 0;
      }
      return b;
    }

    var get = function (id) { return BUNDLES.filter(function (b) { return b.id === id; })[0]; };

    /* ── 票券成員（2026-09-21，D296）──────────────────────────────────────
       `b.tickets` 一律是 `{ tierIds:[...], qty:n }`：tierIds＝允許票種（票券項目 id，多場活動時
       是「某場的某票種」）、qty＝整組一個張數。所有讀寫都經過這幾支，外面不直接碰物件——
       舊資料（`[{id, qty}]`／字串陣列）在第一次讀到時就地正規化：tierIds＝各 id、qty＝第一筆的
       張數（舊模型每列各自張數，收成一個時取第一筆），讀的人永遠只看到一種形狀。 */
    function qtyOf(v) { var n = num(v); return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1; }
    function tixNorm(v) {
      if (Array.isArray(v)) {
        var ids = [], q = 1, first = true;
        v.forEach(function (x) {
          if (typeof x === 'string') ids.push(x);
          else if (x && x.id != null) { ids.push(x.id); if (first) { q = qtyOf(x.qty); first = false; } }
        });
        return { tierIds: ids, qty: q };
      }
      if (v && typeof v === 'object') return { tierIds: (v.tierIds || []).slice(), qty: qtyOf(v.qty) };
      return { tierIds: [], qty: 1 };
    }
    function tix(b) {
      if (!b.tickets || Array.isArray(b.tickets) || !Array.isArray(b.tickets.tierIds)) b.tickets = tixNorm(b.tickets);
      return b.tickets;
    }
    function tixIds(b) { return tix(b).tierIds; }
    function tixHas(b, id) { return tixIds(b).indexOf(id) >= 0; }
    /* 整組張數（D296：一組一個 n，不再逐票種各自張數）。 */
    function tixQty(b) { return qtyOf(tix(b).qty); }
    function tixAdd(b, ids) {
      var t = tix(b);
      ids.forEach(function (id) { if (t.tierIds.indexOf(id) < 0) t.tierIds.push(id); });
    }
    function tixDrop(b, ids) { var t = tix(b); t.tierIds = t.tierIds.filter(function (x) { return ids.indexOf(x) < 0; }); }
    function tixSetQty(b, q) { tix(b).qty = qtyOf(q); }
    function tixCount(b) { return tixIds(b).length; }
    /* 從場次組頭／表頭全選／適用場次列加票：只動允許清單，張數是整組一個、不跟票走。 */
    function addIds(b, ids) { tixAdd(b, ids); }

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
    /* ── 商品成員的規格與價格區間（2026-09-21 第二輪，D295）──────────────────
       多選項商品帶 `options`（選項名與值）與 `variants`（逐規格列，可各自有 `price`／`stock`）。
       原價取各規格價的最小值、標「從 $X 起」；粉絲端預覽卡選齊規格後才落到那一格的價。
       只在活動變體生效（getTickets）：募資兩頁的商品原價維持商品定價本身，行為不動。 */
    function itemVariants(it) {
      return (it && it.variant === 'multiple' && Array.isArray(it.variants) && it.variants.length) ? it.variants : null;
    }
    function itemOptions(it) {
      return (it && it.variant === 'multiple' && Array.isArray(it.options) && it.options.length) ? it.options : null;
    }
    function variantPrice(it, v) { return cash(v && v.price ? v.price : it.price); }
    function itemMin(it) {
      var vs = getTickets ? itemVariants(it) : null;
      if (!vs) return cash(it.price);
      return vs.reduce(function (m, v) { return Math.min(m, variantPrice(it, v)); }, Infinity);
    }
    function itemMax(it) {
      var vs = getTickets ? itemVariants(it) : null;
      if (!vs) return cash(it.price);
      return vs.reduce(function (m, v) { return Math.max(m, variantPrice(it, v)); }, 0);
    }
    function itemRange(it) { return itemMin(it) !== itemMax(it); }
    /* 清單分隔：中文頓號、英文逗號（「VIP、Floor」在英文句子裡是錯字）。 */
    function isZh() { return String(document.documentElement.lang || '').indexOf('zh') === 0; }
    function listJoin(arr) { return arr.join(isZh() ? '、' : ', '); }
    /* 選項名在種子裡是「Size / 尺寸」雙語寫法：照當前語言取一邊。 */
    function optName(name) {
      var parts = String(name || '').split(/\s*\/\s*/);
      if (parts.length < 2) return String(name || '');
      return isZh() ? parts[parts.length - 1] : parts[0];
    }
    function itemsTotal(b) {
      return b.items.reduce(function (sum, it) { return sum + itemMin(it); }, 0);
    }
    /* 這張卡的股份總價＝共創折後價格的地板（預購沒有股份，恆為 0）。 */
    function shareValue(b) { return slotCount(b) * perSlot(); }
    /* 這張卡的作品總價（預購專屬）。 */
    function workValue(b) { return unitCount(b) * unitPrice(); }
    /* 票那一段（分段版型／活動套組，2026-08-13）。在此之前活動套組的原價只加商品，
       等於一組「VIP 票 ＋ T 恤」報的價把票本身漏掉了——那不是折扣，是算錯。

       2026-09-21（D296 決定三）：票券成員原價＝**最低允許票價 × 每組張數**。允許票種只有
       一種時就是那張票的票價 × n；多種時粉絲任選、定價時只能保證下界，所以畫面標「從 … 起」
       （tixMulti）。D292 的「Σ（票價 × 張數）」隨「同時內含」模型退場。
       只在分段版型生效：募資兩型沒有票，getTickets 也不存在。 */
    function tixMinPrice(b) {
      var lines = setLines(b);
      if (!lines.length) return 0;
      return lines.reduce(function (m, l) { return Math.min(m, l.price); }, Infinity);
    }
    function tixMulti(b) { return !!getTickets && setLines(b).length > 1; }
    /* 原價是不是區間：允許多種票種，或任一商品成員是多規格（各規格價不同）。 */
    function priceRange(b) { return tixMulti(b) || (!!getTickets && b.items.some(itemRange)); }
    function ticketValue(b) {
      if (!SECTIONS || !getTickets) return 0;
      if (!setLines(b).length) return 0;
      return tixMinPrice(b) * tixQty(b);
    }
    /* 這一組每套含幾張票（有允許票種時＝整組張數 n；沒勾任何票種＝0）。 */
    function ticketCount(b) {
      if (!getTickets) return 0;
      return setLines(b).length ? tixQty(b) : 0;
    }
    /* 允許票種有幾種。 */
    function tierCount(b) { return getTickets ? setLines(b).length : 0; }
    /* 多種允許票種時金額只是下界，前面掛「從 … 起」；一種時就是那個數字。 */
    function moneyFrom(b, v) {
      return priceRange(b) ? T('cpp.bd.price.from').replace('{sum}', money(v)) : money(v);
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
      /* 活動套組（2026-09-18，D293）：至少 1 個成員即成立——票券任一筆（張數 ≥ 1）或
         商品任一件都算；純套票（只有票）與純商品（只有商品）都是合法的組合包。
         舊判準「一定含一張票」隨 D293 退場。 */
      if (getTickets) return hasContent(b);
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
        /* 活動變體（2026-09-21 D295）：多選項商品標「規格由粉絲購買時選」——規格是商品自己的屬性，
           建組合時不挑；單一選項商品沒得挑、不標。 */
        var meta = (getTickets && it.variant === 'multiple')
          ? [it.meta, T('cpp.bd.item.spec')].filter(Boolean).join(' · ')
          : it.meta;
        return '<div class="fc-ref" data-bd-ref="' + esc(it.id) + '">' +
          (it.img ? '<img class="fc-ref__thumb" src="' + esc(it.img) + '" alt="" loading="lazy">'
                  : '<span class="fc-ref__thumb"></span>') +
          '<div><div class="fc-ref__name">' + esc(it.name) + '</div>' +
            (meta ? '<div class="fc-ref__meta">' + esc(meta) + '</div>' : '') + '</div>' +
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

    /* 未定價品項數（草稿項與嵌入建立時沒填價格的商品）。
       它們在計價裡當 0（cash('') = 0）——那是「少一項就少加」的刻意設計，
       但少加這件事必須讓創作者看見（2026-09-01 使用者裁示「不再默默算 0」）：
       套組價旁邊標「N 件未定價」，賣出去的價格才不會比畫面上這個數字該有的還低。 */
    function unpricedCount(b) {
      return (b.items || []).filter(function (i) { return !cash(i.price); }).length;
    }
    function unpricedBadgeHTML(b) {
      var n = unpricedCount(b);
      if (!n) return '';
      return '<span class="fc-sum__unpriced" title="' + esc(T('cpp.bd.price.unpriced.tip')) + '">' +
        esc(T('cpp.bd.price.unpriced').replace('{n}', String(n))) + '</span>';
    }

    /* 收合摘要列的價格格：有優惠時原價劃掉並列在套組價前面。
       只寫套組價會讓「這張卡有折扣」這件事在收合狀態下完全消失——而收合狀態正是
       創作者比較三張卡的那一屏。 */
    function summaryPriceHTML(b) {
      /* 原價 0 的卡也要標未定價——「只裝了未定價項目」正是最需要這個警示的狀態。 */
      if (listPrice(b) <= 0) return '—' + unpricedBadgeHTML(b);
      var d = discountOf(b);
      return (d > 0
        ? '<span class="fc-sum__was" title="' + esc(T('cpp.bd.price.list')) + '">' + esc(money(listPrice(b))) + '</span>'
        : '') + esc(money(finalPrice(b))) + unpricedBadgeHTML(b);
    }

    /* 展開態右上角的價格：標籤「套組價」＋放大的金額（2026-07-30 使用者選定）。
       展開時卡片最後才是定價區塊，中間隔著五組欄位；編輯名額或商品的當下看不到
       自己把價格改成多少，等於要一路捲到底才知道剛才那一下的後果。標籤是必要的——
       右上角一個沒有名字的數字，跟卡片最後那個有算式的數字看起來會像兩件事。 */
    function headPriceHTML(b) {
      if (listPrice(b) <= 0) return '<span class="fc-sum__tag">' + esc(T('cpp.bd.price.tag')) + '</span>—' + unpricedBadgeHTML(b);
      var d = discountOf(b);
      return '<span class="fc-sum__tag">' + esc(T('cpp.bd.price.tag')) + '</span>' +
        (d > 0
          ? '<span class="fc-sum__was" title="' + esc(T('cpp.bd.price.list')) + '">' + esc(money(listPrice(b))) + '</span>'
          : '') +
        '<span class="fc-sum__val">' + esc(money(finalPrice(b))) + '</span>' +
        unpricedBadgeHTML(b);
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
      /* 活動套組報「允許票種 任選 × n」（2026-09-21，D296）——那是這一組的主體，
         只報「2 張票券」讀不出是哪幾種可選。只勾一種寫「VIP × 2」。售價由收合列自己的
         價格欄承擔，不在這裡重複。 */
      if (getTickets) {
        var tl = tixLineText(b);
        if (tl) bits.push(tl);
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
    /* 票券清單表的列＝票種（跨場次一列）。票沒帶 kind 時（單場、消費頁沒給票種資料）
       每張票自成一列，這樣單場活動的表與多場的表是同一支產生器。 */
    function kindRows() {
      var rows = ticketKinds().slice();
      (getTickets ? (getTickets() || []) : []).forEach(function (t) {
        if (!t.kind) rows.push({ id: t.id, name: t.name, ids: [t.id], solo: true });
      });
      return rows;
    }
    function kindOn(b, k) { return k.ids.some(function (id) { return tixHas(b, id); }); }
    function kindPrice(k) { var t = ticketById(k.ids[0]) || {}; return cash(t.price); }
    /* 這一組的允許票種：逐筆 {k, name, price}——原價下界、摘要列、算式、上限全部從
       這一份算，不各自再掃一次票券清單。張數不在列上（整組一個，tixQty）。 */
    function setLines(b) {
      if (!getTickets) return [];
      return kindRows().filter(function (k) { return kindOn(b, k); }).map(function (k) {
        return { k: k, name: k.name, price: kindPrice(k) };
      });
    }
    function tixNames(b) { return setLines(b).map(function (l) { return l.name; }); }
    /* 「VIP／搖滾區 任選 × 2」；只勾一種「VIP × 2」；沒勾回空字串。 */
    function tixLineText(b, names) {
      names = names || tixNames(b);
      if (!names.length) return '';
      var q = String(tixQty(b));
      return names.length === 1
        ? T('cpp.bd.sum.line').replace('{name}', names[0]).replace('{n}', q)
        : T('cpp.bd.sum.any').replace('{names}', names.join('／')).replace('{n}', q);
    }
    /* 建議名稱＝票種名（跨場次去重）＋第一件商品。沒有內容就不給——沒東西可依據時
       擬出來的名字是猜的，不是建議。 */
    function suggestName(b) {
      /* 無票變體（2026-09-01 分段版通用化）：從內容擬名——預購以作品開頭、共創以
         第一件商品開頭。擬不出來就回空字串，名稱欄退回一般的必填空格。 */
      if (!getTickets) {
        if (WORK) {
          var wn = workName();
          return wn ? (b.items.length ? wn + ' ＋ ' + b.items[0].name : wn) : '';
        }
        return b.items.length ? b.items[0].name : '';
      }
      /* 活動變體（2026-09-21 第二輪）：「VIP／Floor 任選 × 2 ＋ 巡演 T 恤」——票券那一段照收合列
         的寫法（一種「VIP × 2」、多種「任選 × n」），商品全部列、頓號分隔；沒票只列商品。 */
      var head = tixLineText(b);
      var its = listJoin(b.items.map(function (it) { return it.name; }).filter(Boolean));
      if (!head) return its;
      return its ? head + ' ＋ ' + its : head;
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
    function ticketRowHTML(t, on, labelKind, locked) {
      return '<label class="bd-tbl__row bd-tbl__row--pick' + (on ? '' : ' bd-tbl__row--off') + '">' +
        '<span class="zcheck__control">' +
          '<input class="zcheck__input" type="checkbox" data-bd-ticket="' + esc(t.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + '>' +
          '<span class="zcheck__box"></span>' +
        '</span>' +
        '<span class="bd-tbl__name">' + esc(labelKind && t.kind ? t.kind.name : t.name) + '</span>' +
        '<span class="bd-tbl__num">' + esc(Number(t.price) === 0 ? T('ce.tier.free') : money(t.price)) + '</span>' +
        '<span class="bd-tbl__num">' + esc(t.qty ? String(t.qty) : '—') + '</span>' +
      '</label>';
    }

    function kindChipsHTML(b) {
      var chosen = tixIds(b);
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
    /* 內容有沒有著落——各變體的「這一組裝了東西」判準（2026-09-01 分段版通用化）：
       活動＝至少含一張票；共創＝有商品或名額 > 0；預購＝作品必含（unitCount ≥ 1 恆真），
       所以恆過。與 isValid() 的非名稱那一半同一套判準，不另立第二種「算有內容」。 */
    function hasContent(b) {
      /* 活動（D293／D296）：票券成員成立＝允許票種 ≥ 1 且張數 ≥ 1；或商品任一件。 */
      if (getTickets) return (tierCount(b) > 0 && tixQty(b) >= 1) || b.items.length > 0;
      if (SHARES) return b.items.length > 0 || slotCount(b) > 0;
      return true;
    }
    function readiness(b) {
      return [
        hasContent(b),
        !!String(b.name || '').trim() || !!suggestName(b),
        !capOver(b),
        !lockOver(b)   /* SPLIT：鎖定套數超過可售上限也擋（其餘版型沒有這個欄位，恆為 true） */
      ];
    }
    function readyMiss(b) { return readiness(b).filter(function (ok) { return !ok; }); }
    /* 主要按鈕該不該停用。第 1 步只看它自己那一步答得完的兩件事（有沒有至少 1 個成員、
       售出上限有沒有超過成員剩餘換算的套數）——名稱在第 2 步，還沒走到就要求它會擋在一個
       看不到的欄位上。SPLIT 只有一頁，全部條件一起看。 */
    function gateOffFor(b) {
      var r = readiness(b);
      if (SPLIT) return r.indexOf(false) >= 0;
      return b.step === 2 ? r.indexOf(false) >= 0 : !(r[0] && r[2]);
    }
    /* SPLIT footer 主要按鈕停用時旁邊那一句：說出是哪一條沒過。 */
    function gateWhyText(b) {
      if (!hasContent(b)) return T(getTickets && kindRows().length ? 'cpp.bd.sp.why.tix' : 'cpp.bd.sp.why.members');
      if (lockOver(b)) return T('cpp.bd.sp.why.lock');
      if (capOver(b)) return T('cpp.bd.sp.why.cap');
      return '';
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
          '" role="radio" aria-checked="' + on + '" data-bd-scope="' + val + '"' + (isLocked(b) ? ' disabled' : '') + '>' +
          '<span class="radio-card__text">' +
            '<span class="radio-card__title">' + esc(T('cpp.bd.scope.' + val)) + '</span>' +
            '<span class="radio-card__sub">' + esc(T('cpp.bd.scope.' + val + '.sub').replace('{n}', groups.length)) + '</span>' +
          '</span></button>';
      }
      /* 2026-08-13 使用者指示「放同一個 section」：與票種合併成一張分卡，這裡只回傳欄位群。
         兩者回答的是同一件事的兩半——這一組賣哪一種票、以及那一種票怎麼對應到場次；
         拆成兩張卡會讓人以為是兩個不相干的決定。 */
      /* SPLIT：每場各一組時底下補一句會建立哪幾組（`cpp.bd.scope.per.names`），允許票種與張數沿用同一份。 */
      var perNames = SPLIT && b.scope === 'per'
        ? '<div class="field__hint">' + esc(T('cpp.bd.scope.per.names').replace('{names}', listJoin(groups.map(function (g) { return g.name; })))) + '</div>'
        : '';
      return '<div class="field">' +
        '<div class="field__label">' + esc(T('cpp.bd.sec.scope')) + '</div>' +
        '<div class="segmented radio-cards' + (isLocked(b) ? ' segmented--locked' : '') + '" role="radiogroup" aria-label="' + esc(T('cpp.bd.sec.scope')) + '">' +
          card('shared', b.scope !== 'per') + card('per', b.scope === 'per') +
        '</div>' + perNames +
      '</div>';
    }

    /* ── 票券清單：表格化（2026-09-18，D292）────────────────────────────
       原本是 `.radio-cards` 複選卡（一張卡一個票種，點了就「納入」），那是「粉絲擇一」語意下
       的挑法（墓碑：kindCardsHTML）。改成票種 × 張數之後，每一列要回答的是「含這種票幾張、
       小計多少」，那是表格的事：勾選框｜票種｜單價｜張數｜小計，表尾合計「共 N 張 · 票券原價 $X」。
       勾選框沿用 `.zcheck`、張數沿用 `.zstep` 家用步進器（站上唯一的步進器，不另造 − ＋ 版，
       鐵律 11）；未勾選的列整列淡化（`--off`，同適用場次表）、張數欄停用（停用態隨 Q58）。
       多場活動：列仍是票種（跨場一列，＝原本票種捷徑的角色），哪幾場適用由「場次對應」與
       「適用場次」兩塊承擔，張數跟票種走——每場各一組展開時每組沿用同一份清單。 */
    function tixPlaceholderHTML() {
      return '<div class="fc-ref fc-ref--placeholder">' +
        '<span class="fc-ref__thumb fc-ref__thumb--work"><i data-lucide="ticket" class="ztor-icon"></i></span>' +
        '<div><div class="fc-ref__name">' + esc(T('cpp.bd.tickets.ph')) + '</div>' +
          '<div class="fc-ref__meta">' + esc(T('cpp.bd.tickets.none')) + '</div></div>' +
      '</div>';
    }
    /* 整組張數欄（2026-09-21，D296）：一組一個 n，放在票券清單表下方——先勾「粉絲可以選哪幾種」，
       再說「拿到幾張」。沿用 `.zstep` 家用步進器＋「張」後綴（同 create-bundle 的票券張數欄，鐵律 11）。 */
    /* 已售出後成員內容鎖定（SPLIT，D292 裁決七／D296 決定六）：允許票種、張數、場次對應、商品
       加入與移除全部停用；折扣、鎖定套數、上限照常可改。 */
    function isLocked(b) { return SPLIT && b.sold > 0; }
    function tixQtyFieldHTML(b) {
      var q = tixQty(b);
      return '<div class="field mt-16">' +
        '<label class="field__label">' + esc(T('cpp.bd.tix.per')) + '</label>' +
        '<span class="amount-field amount-field--suffix amount-field--readonly zstep bd-tix-qty">' +
          '<span class="amount-field__unit">' + esc(T('cb.tix.unit')) + '</span>' +
          '<input class="amount-field__input input zstep__input" type="number" min="1" step="1" value="' + q + '"' +
            (isLocked(b) ? ' disabled' : '') +
            ' data-bd-tix-qty aria-label="' + esc(T('cpp.bd.tix.per')) + '">' +
          '<span class="zstep__btns">' +
            '<button class="zstep__btn" type="button" data-step="up" tabindex="-1" aria-label="' + esc(T('cpp.bd.qty.up')) + '"><i data-lucide="chevron-up" class="ztor-icon"></i></button>' +
            '<button class="zstep__btn" type="button" data-step="down" tabindex="-1" aria-label="' + esc(T('cpp.bd.qty.down')) + '"><i data-lucide="chevron-down" class="ztor-icon"></i></button>' +
          '</span>' +
        '</span>' +
        /* SPLIT（2026-09-22 方案 A）：這一格底下是整段唯一的規則句，用一般 hint 層級講這一組的
           實際值（「粉絲從 VIP、Floor 任選一種，拿到 2 張」），原本的 info 列與另外兩處重複句退場。 */
        '<div class="field__hint"' + (SPLIT ? ' data-bd-sem' : '') + '>' +
          esc(SPLIT ? semanticText(b) : T('cpp.bd.tix.per.hint')) + '</div>' +
      '</div>';
    }
    /* 表尾：「允許 K 種 · 每組 n 張 · 原價從 $X 起」（一種時「原價 $X」）。SPLIT 不畫（方案 A）。 */
    function tixFootText(b) {
      var lines = setLines(b);
      if (!lines.length) return T('cpp.bd.tix.foot.none');
      return T(lines.length > 1 ? 'cpp.bd.tix.foot' : 'cpp.bd.tix.foot.one')
        .replace('{k}', String(lines.length))
        .replace('{n}', String(tixQty(b)))
        .replace('{sum}', money(ticketValue(b)));
    }
    /* 票券清單表（2026-09-21，D296）：勾選框｜票種｜單價｜剩餘。每列張數欄與小計欄退場——
       張數是整組一個（tixQtyFieldHTML），小計沒有了逐列張數就沒有意義；剩餘張數移進來，
       因為「剩餘 < n 的票種粉絲端不可選」（D296 決定四）要在勾選當下看得到。 */
    function tixTableHTML(b) {
      var rows = kindRows();
      if (!rows.length) return tixPlaceholderHTML();
      var locked = isLocked(b), q = tixQty(b);
      return '<div class="bd-tbl bd-tbl--tix' + (locked ? ' bd-tbl--locked' : '') + '">' +
        '<div class="bd-tbl__head">' +
          '<span></span>' +
          '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.tier')) + '</span>' +
          '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.price')) + '</span>' +
          '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.qty')) + '</span>' +
        '</div>' +
        rows.map(function (k) {
          var on = kindOn(b, k), p = kindPrice(k);
          /* 剩餘：單場＝那張票的剩餘；多場＝各場加總（列是跨場的票種）。沒填數量的票寫「—」。 */
          var left = k.ids.reduce(function (m, id) { var t = ticketById(id), q = num(t && t.qty); return Number.isFinite(q) && q > 0 ? (m === null ? q : m + q) : m; }, null);
          /* 剩餘 < 每組張數：這個票種粉絲端選不到（D296 決定四），勾選當下就在剩餘底下標「不足 n 張」。 */
          var short = SPLIT && on && left !== null && left < q;
          /* 2026-09-22 方案 A：不足一組改用畫面表達——整列灰化（`--short`）＋「不足 n 張」徽章，
             表下那句「剩餘不足一組的票種，粉絲端不能選」同輪刪掉。 */
          return '<label class="bd-tbl__row bd-tbl__row--pick' + (on ? '' : ' bd-tbl__row--off') +
              (short ? ' bd-tbl__row--short' : '') + '">' +
            '<span class="zcheck__control">' +
              '<input class="zcheck__input" type="checkbox" data-bd-kind-check="' + esc(k.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + '>' +
              '<span class="zcheck__box"></span>' +
            '</span>' +
            '<span class="bd-tbl__name">' + esc(k.name) + '</span>' +
            '<span class="bd-tbl__num">' + esc(p === 0 ? T('ce.tier.free') : money(p)) + '</span>' +
            '<span class="bd-tbl__num">' + esc(left === null ? '—' : left.toLocaleString('en-US')) +
              (short ? '<span class="ztor-badge bd-tbl__short">' + esc(T('cpp.bd.sp.tix.short').replace('{n}', String(q))) + '</span>' : '') + '</span>' +
          '</label>';
        }).join('') +
        (SPLIT ? '' : '<div class="bd-tbl__foot" data-bd-tix-foot>' + esc(tixFootText(b)) + '</div>') +
      '</div>';
    }

    function secKindHTML(b) {
      var scope = secScopeHTML(b);          // 多場才有，單場回空字串
      var deduct = ticketCount(b) > 0 ? T('cpp.bd.deduct') : '';
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.kind')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T(scope ? 'cpp.bd.sec.kind.sub.multi' : 'cpp.bd.sec.kind.sub')) + '</p>' +
        '</div>' +
        scope +
        (scope ? '<div class="field__label">' + esc(T('cpp.bd.kind.which')) + '</div>' : '') +
        tixTableHTML(b) +
        (kindRows().length ? tixQtyFieldHTML(b) : '') +
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
        if (kindOn(b, k)) picked[k.id] = true;
      });
      if (!Object.keys(picked).length) return [];
      return ticketGroups().map(function (g) {
        var incl = g.rows.filter(function (t) { return t.kind && picked[t.kind.id]; });
        return incl.length ? { g: g, incl: incl } : null;
      }).filter(Boolean);
    }
    /* 每場預覽的票券原價：那一場允許票種的最低票價 × n（多種時是下界，perValText 標「從 … 起」）。 */
    function perVal(r) {
      var min = r.incl.reduce(function (m, t) { return Math.min(m, cash(t.price)); }, Infinity);
      return Number.isFinite(min) ? min : 0;
    }
    function perValText(b, r) {
      var v = perVal(r) * tixQty(b);
      if (!v) return T('ce.tier.free');
      return r.incl.length > 1 ? T('cpp.bd.price.from').replace('{sum}', money(v)) : money(v);
    }
    function secPerHTML(b) {
      if (b.scope !== 'per') return '';
      // 沒有票種可挑時不出這張卡——kindCardsHTML 的佔位列已經講過那件事
      if (!ticketGroups().length || !ticketKinds().length) return '';
      var rows = perRows(b);
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.per.preview')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(rows.length
            ? T('cpp.bd.per.preview.sub').replace('{n}', rows.length)
            : T('cpp.bd.per.preview.empty')) + '</p>' +
        '</div>' +
        perTableHTML(b) +
      '</section>';
    }
    /* 每場預覽的表本體（SPLIT 把它放進票券小節的欄位群，`.bd-sec` 殼由各版型自己包）。 */
    function perTableHTML(b) {
      var rows = perRows(b);
      var stem = (b.nameTouched ? b.name : '') || suggestName(b) || T('cpp.bd.untitled');
      return (!rows.length ? '' :
          '<div class="bd-tbl bd-tbl--per">' +
            '<div class="bd-tbl__head">' +
              '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.bundle')) + '</span>' +
              '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.incl')) + '</span>' +
              '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.value')) + '</span>' +
            '</div>' +
            rows.map(function (r) {
              /* 票券原價＝該場允許票種的最低票價 × n，與 ticketValue() 同一條規則（2026-09-21 D296）；
                 多種時標「從 … 起」。 */
              var val = perVal(r), names = r.incl.map(function (t) { return t.kind.name; });
              return '<div class="bd-tbl__row">' +
                '<span class="bd-tbl__name">' + esc(stem + ' · ' + r.g.name) + '</span>' +
                '<span class="bd-tbl__sub" data-bd-per-sub="' + esc(r.g.id) + '">' + esc(tixLineText(b, names)) + '</span>' +
                '<span class="bd-tbl__num" data-bd-per-val="' + esc(r.g.id) + '">' + esc(perValText(b, r)) + '</span>' +
              '</div>';
            }).join('') +
          '</div>');
    }

    /* ── 適用場次：選配的微調 ──────────────────────────────────────────
       只在「多場 ＋ 全場次共用一組 ＋ 已選票種」時出現。預設每一場都適用，這張表的
       用途是**取消**不販售的那幾場，不是從零勾選——所以標題是「適用場次」而不是
       「選擇票券」。單場活動與「每場次各一組」都不需要它。 */
    function secSessionsHTML(b) {
      var table = sessionsTableHTML(b);
      if (!table) return '';
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sec.sess')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.sec.sess.sub')) + '</p>' +
        '</div>' +
        table +
      '</section>';
    }
    /* 適用場次表本體（SPLIT 放進票券小節；已售出時整張表停用）。 */
    function sessionsTableHTML(b) {
      if (b.scope === 'per') return '';
      var groups = ticketGroups();
      if (!(groups.length > 1 && groups[0].name)) return '';
      var chosen = tixIds(b);
      var kinds = ticketKinds().filter(function (k) { return kindOn(b, k); });
      if (!kinds.length) return '';
      var locked = isLocked(b);
      var live = {};
      kinds.forEach(function (k) { k.ids.forEach(function (id) { live[id] = true; }); });
      var liveIds = Object.keys(live);
      var allOn = liveIds.every(function (id) { return chosen.indexOf(id) >= 0; });
      /* 表頭第一格放「全選」（2026-08-13 第二輪，照使用者提供的參考圖）：勾選框佔的是
         列首那一欄，與底下每一列的勾選框上下對齊，一整欄讀下來就是「這一格管底下全部」。
         沒有文字標籤，語意交給位置——所以要補 aria-label，螢幕閱讀器才聽得出它管什麼。 */
      return '<div class="bd-tbl bd-tbl--sess' + (locked ? ' bd-tbl--locked' : '') + '">' +
          '<div class="bd-tbl__head">' +
            '<span class="zcheck__control">' +
              '<input class="zcheck__input" type="checkbox" data-bd-all' + (allOn ? ' checked' : '') + (locked ? ' disabled' : '') +
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
                  '<input class="zcheck__input" type="checkbox" data-bd-group="' + esc(g.id) + '"' + (all ? ' checked' : '') + (locked ? ' disabled' : '') +
                    ' aria-label="' + esc(T('cpp.bd.grp.all')) + '">' +
                  '<span class="zcheck__box"></span>' +
                '</span>' +
                '<span class="bd-tbl__gname">' + esc(g.name) + '</span>' +
              '</label>' +
              rows.map(function (t) { return ticketRowHTML(t, chosen.indexOf(t.id) >= 0, true, locked); }).join('');
          }).join('') +
        '</div>';
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



    /* 原價合計旁的算式（2026-09-18，D292／5.1.5.4 §4 F3「合計旁列出算式」）：
       「VIP $4,200 × 2 ＋ T 恤 $800 ＝ $9,200」。票券逐筆寫價 × 張數，商品只寫價
       （商品在這支編輯器每套用量恆為 1，寫 × 1 是雜訊）；未定價商品寫「未定價」而不是 $0。 */
    /* 2026-09-21（D296）：票券成員只有一段——一種「VIP $4,200 × 2」；多種「VIP／搖滾區（從 $3,300 起）× 2」，
       總額跟著標「從 … 起」。 */
    function calcPartsText(b) {
      var parts = [];
      var lines = setLines(b);
      if (lines.length) {
        var names = tixNames(b).join('／'), q = String(tixQty(b)), mp = money(tixMinPrice(b));
        parts.push(lines.length > 1
          ? T('cpp.bd.calc.tix.any').replace('{names}', names).replace('{price}', mp).replace('{n}', q)
          : T('cpp.bd.calc.tix').replace('{name}', names).replace('{price}', mp).replace('{n}', q));
      }
      b.items.forEach(function (it) {
        parts.push(T('cpp.bd.calc.item').replace('{name}', it.name)
          .replace('{price}', cash(it.price) ? money(cash(it.price)) : T('cpp.bd.calc.unpriced')));
      });
      if (!parts.length) return T('cpp.bd.calc.parts.empty');
      return T('cpp.bd.calc.parts').replace('{parts}', parts.join(T('cpp.bd.price.calc.plus'))).replace('{total}', moneyFrom(b, listPrice(b)));
    }
    function calcBaseFieldHTML(b, withParts) {
      return '<div class="field">' +
        '<label class="field__label">' + esc(T('cpp.bd.calc.base')) + '</label>' +
        '<div class="field-readout" data-bd-calc-base>' + esc(moneyFrom(b, listPrice(b))) + '</div>' +
        (withParts ? '<div class="field__hint" data-bd-calc-parts>' + esc(calcPartsText(b)) + '</div>' : '') +
      '</div>';
    }

    /* ② 定價
       折扣改成開關（比照建立商品的「折扣設定」）：多數組合包不打折，把折扣欄永遠攤在
       算式裡等於預設每一組都要回答一個多數人不需要回答的問題。關著時算式只有兩段
       （原價合計＝粉絲實付），開了才長出折扣欄與那一段減號。
       活動變體（2026-09-18）例外：原價合計＋算式**永遠**顯示——它是「Σ 票價 × 張數 ＋ 商品」
       這條新規則唯一看得見的地方，折扣關著時也要讓創作者看得到合計是怎麼加出來的。 */
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
        (getTickets ? '<div class="mt-16">' + calcBaseFieldHTML(b, true) + '</div>' : '') +
        (on
          ? '<div class="' + (getTickets ? '' : 'mt-16') + '">' +
              '<div class="field">' +
                '<label class="field__label">' + esc(plain('cpp.bd.discount')) + '</label>' +
                '<span class="amount-field amount-field--suffix bd-calc__disc">' +
                  '<input class="amount-field__input input" type="number" min="0" max="100" step="1" data-bd-f="discount" ' +
                    'value="' + esc(b.discount) + '" placeholder="' + esc(T('cpp.bd.discount.ph')) + '">' +
                  '<span class="amount-field__unit">%</span></span>' +
              '</div>' +
              (getTickets ? '' : calcBaseFieldHTML(b, false)) +
              '<div class="field">' +
                '<label class="field__label">' + esc(T('cpp.bd.calc.final')) + '</label>' +
                '<div class="field-readout" data-bd-calc-final>' + esc(moneyFrom(b, finalPrice(b))) + '</div>' +
              '</div>' +
              /* 折扣上限那句話只給共創／預購（2026-09-01 通用化）：它們的折抵有地板
                 （分潤名額不可折），超標要當場承認實際生效值。活動版維持定案時的樣子。 */
              (!getTickets
                ? '<div class="field__hint' + (discountOver(b) ? ' fc-hint--over' : '') +
                    '" data-bd-discount-hint>' + esc(discountHintText(b)) + '</div>'
                : '') +
            '</div>'
          : '<div class="field__hint mt-8">' + esc(T('cpp.bd.calc.nodisc')) + '</div>') +
      '</section>';
    }

    /* 這一組最多能賣幾套的硬頂（2026-09-18 D292，5.1.5.4 §4 F4）＝各成員
       floor(剩餘量 ÷ 每套用量) 取最小：票券看該票種的剩餘張數 ÷ 每套張數（多場活動時
       同一票種每一場各算一次，最少的那一場壓上限）、商品看庫存 ÷ 1（本編輯器商品每套 1 件）。
       沒有量的成員（票的張數留空、商品不限量）不參與；全都沒有就沒有硬頂。
       這關掉了舊版「販售上限與票的剩餘互不驗證」（BDL-001 未決項）。
       2026-08-13 的前身 `ticketCapMax` 只看票、且沒有除以張數（每套恆 1 張）。 */
    /* 2026-09-21（D296 決定四）：票券部分改「各允許票種 floor(剩餘 ÷ n) **加總**」——粉絲任選一種，
       任一票種剩餘 ≥ n 這組就可賣，所以是加總不是取最小；商品部分不變，最後兩段取最小。 */
    function memberCapMax(b) { return memberCapWho(b).n; }
    /* 同一個硬頂，連同「是誰壓出這個數字」——票券成員回 who:'tix'，商品成員回商品名。 */
    function memberCapWho(b) {
      if (!SECTIONS || !getTickets) return { n: Infinity, who: '' };
      var caps = [];
      var q = tixQty(b), byGroup = {}, tixAny = false;
      setLines(b).forEach(function (l) {
        l.k.ids.forEach(function (id) {
          if (!tixHas(b, id)) return;
          var t = ticketById(id), left = num(t && t.qty);
          if (!(Number.isFinite(left) && left > 0)) return;
          var g = (t.group && t.group.id) || '';
          byGroup[g] = (byGroup[g] || 0) + Math.floor(left / q);
          tixAny = true;
        });
      });
      if (tixAny) {
        var sums = Object.keys(byGroup).map(function (g) { return byGroup[g]; });
        /* 每場各一組（per）：上限套在展開後的每一組，所以看最緊的那一場；一組通用所有場次（shared）：
           各場的允許票種都在同一份清單裡，加總。 */
        caps.push({ n: b.scope === 'per' && sums.length > 1 ? Math.min.apply(null, sums) : sums.reduce(function (a, n) { return a + n; }, 0), who: 'tix' });
      }
      b.items.forEach(function (it) {
        var st = num(it.stock);
        if (Number.isFinite(st) && st >= 0) caps.push({ n: Math.floor(st), who: it.name });
      });
      if (!caps.length) return { n: Infinity, who: '' };
      return caps.reduce(function (m, c) { return c.n < m.n ? c : m; });
    }
    /* 「受誰限制」那個誰的顯示字：票券寫「票券」、商品寫商品名。 */
    function whoText(who) { return who === 'tix' ? T('cpp.bd.sp.who.tix') : String(who || ''); }
    /* ── 鎖定套數與可售套數（SPLIT，D266／D296 決定四）────────────────────────
       lockN        創作者填的鎖定套數（空白／0＝不鎖定）
       lockOver     鎖定套數超過成員硬頂
       setsBeforeCap 鎖定有效＝鎖定套數；否則＝成員硬頂（沒有量的成員不參與 → null）
       sellableSets  再與限量上限取最小 */
    function lockN(b) { var n = num(b.lockSets); return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0; }
    function lockOver(b) {
      if (!SPLIT) return false;
      var m = memberCapMax(b);
      return !!(lockN(b) && m !== Infinity && lockN(b) > m);
    }
    function setsBeforeCap(b) {
      var m = memberCapMax(b);
      if (lockN(b) && !lockOver(b)) return lockN(b);
      return m === Infinity ? null : m;
    }
    function capN(b) { var c = num(b.cap); return b.avail === 'limited' && Number.isFinite(c) && c > 0 ? Math.floor(c) : 0; }
    function sellableSets(b) {
      var s = setsBeforeCap(b);
      if (s === null) return capN(b) || null;
      return capN(b) ? Math.min(s, capN(b)) : s;
    }
    function capOver(b) {
      if (b.avail !== 'limited') return false;
      var c = num(b.cap), m = SPLIT ? setsBeforeCap(b) : memberCapMax(b);
      if (m === null) m = Infinity;
      return Number.isFinite(c) && c > 0 && m !== Infinity && c > m;
    }
    function capMaxHint(b) {
      var m = memberCapMax(b);
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
          /* 共創的第一個選項是「自動」（由名額池推導），不是「不限量」——兩個講法
             對應兩種事實，掛錯字會把推導出來的上限說成沒有上限。 */
          card(AVAIL_OPEN, !limited, SHARES ? 'cpp.bd.avail.auto' : 'cpp.bd.qty.unlim') +
          card('limited', limited, 'cpp.bd.avail.limited') +
        '</div>' +
        (!limited && SHARES
          ? '<div class="field__hint mt-8" data-bd-auto-hint>' + esc(autoHintText(b)) + '</div>' : '') +
        /* 活動變體的「不限量」其實有硬頂（各成員剩餘換算，D292）——寫出來，
           不限量才不會被讀成「想賣幾組都行」。 */
        (!limited && getTickets && capMaxHint(b)
          ? '<div class="field__hint mt-8" data-bd-capmax>' + esc(capMaxHint(b)) + '</div>' : '') +
        (limited
          ? '<div class="form-grid mt-16">' +
              '<div class="field">' +
                '<label class="field__label">' + esc(T('cpp.bd.cap')) + ' <span class="field__req">*</span></label>' +
                '<input class="input" type="number" min="1" step="1"' +
                  (memberCapMax(b) === Infinity ? '' : ' max="' + memberCapMax(b) + '"') +
                  (capOver(b) ? ' aria-invalid="true"' : '') +
                  ' data-bd-f="cap" value="' + esc(b.cap) +
                  '" placeholder="' + esc(T('cpp.bd.cap.ph')) + '">' +
                /* 上限提示：活動來自票券張數（capMaxHint），共創／預購來自名額池與
                   份數的換算（capHintText）——各變體講自己的事實。 */
                (capMaxHint(b)
                  ? '<div class="field__hint' + (capOver(b) ? ' fc-hint--over' : '') + '" data-bd-capmax>' +
                      esc(capMaxHint(b)) + '</div>'
                  : (!getTickets && capHintText(b)
                      ? '<div class="field__hint" data-bd-cap-hint>' + esc(capHintText(b)) + '</div>' : '')) +
              '</div>' +
            '</div>'
          : '') +
      '</section>';
    }

    /* ④ 基本資料（名稱與說明）／⑤ 封面圖 —— 拆成兩張，比照建立商品的
       「商品資訊」與「展示它」。原本合成一張「呈現方式」，名稱／說明與圖片是兩件
       不同的事，混在同一張卡裡右邊那一格圖看起來像名稱欄的附屬。 */
    /* 共創的「含分潤名額」分卡（2026-09-01 分段版通用化）。名額是這一組內容的一部分
       ——支持者買到的分潤資格——所以排在內容區第一張，與預設版型的三段分組同一個歸類。 */
    function secSlotsHTML(b) {
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.slots')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.slots.hint')) + '</p>' +
        '</div>' +
        '<input class="input" type="number" min="0" step="1" data-bd-f="slots" value="' + esc(b.slots) + '">' +
      '</section>';
    }

    /* 預購的「作品」分卡：作品列（不可移除，D167）＋含作品份數。 */
    function secWorkHTML(b) {
      return '<section class="bd-sec">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.work')) + '</h3>' +
          '<p class="bd-sec__sub">' + esc(T('cpp.bd.units.hint')) + '</p>' +
        '</div>' +
        workRowHTML(b) +
        '<div class="field mt-16">' +
          '<label class="field__label">' + esc(T('cpp.bd.units')) + ' <span class="field__req">*</span></label>' +
          '<input class="input" type="number" min="1" step="1" data-bd-f="units" value="' + esc(b.units) + '">' +
        '</div>' +
      '</section>';
    }

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
            '<span class="upload-tile__icon"><i data-lucide="photo-video" class="ztor-icon ztor-icon--md"></i></span>' +
            '<span class="upload-tile__title">' + esc(T('cpp.bd.cover.cta')) + '</span>' +
            '<span class="upload-tile__hint">' + esc(T('cp.media.portrait')) + '</span>' +
            '<span class="upload-tile__hint">' + esc(T('cp.media.formats')) + '</span>' +
          '</div>' +
        '</div>' +
      '</section>';
    }

    /* ══ 分段兩欄版型（SPLIT，2026-09-21 第二輪）的產生器 ═══════════════════════
       設計依據 `docs/bundle-create-demo-2026-09-21.html`（使用者裁示「做上正式」）。
       左欄三段分卡：內容物 → 定價與庫存 → 命名與上架（頂列第二排的分節分頁可跳段）；右欄粉絲看到的預覽卡；footer 粉絲實付。
       只在 `layout:'split'` 時走這一條，其餘版型完全不會呼叫到。 */

    /* 粉絲端預覽卡的暫時狀態（點了哪個場次／票種／規格）。不放在 b 上：它不是這一組的
       資料、也不該跟著 getBundles() 流出去給頁面存檔；卡關掉就清掉。 */
    var FAN = {};
    function fan(b) { return FAN[b.id] || (FAN[b.id] = { session: '', tier: null, variants: {} }); }
    function eventInfo() { return getEvent() || { name: '', status: '', label: '' }; }
    function eventBadgeHTML(ev) {
      if (!ev || !ev.label) return '';
      var tone = (ev.status === 'on-sale' || ev.status === 'live') ? ' ztor-badge--success' : '';
      return '<span class="ztor-badge' + tone + '">' + esc(ev.label) + '</span>';
    }
    /* 小標列：標題＋一句提示（＋選配的右側動作）。 */
    function subHeadHTML(title, hint) {
      return '<div class="bd-sub"><span class="bd-sub__title">' + esc(title) + '</span>' +
        (hint ? '<span class="bd-sub__hint">' + esc(hint) + '</span>' : '') + '</div>';
    }
    /* 家用步進器（`.zstep`）的產生器：整組張數、折扣 %、鎖定套數、限量上限四格共用。 */
    function stepperHTML(attr, val, unit, min, max, extra, disabled) {
      return '<span class="amount-field amount-field--suffix amount-field--readonly zstep ' + (extra || '') + '">' +
        '<span class="amount-field__unit">' + esc(unit) + '</span>' +
        '<input class="amount-field__input input zstep__input" type="number" min="' + min + '"' +
          (max != null ? ' max="' + max + '"' : '') + ' step="1" value="' + esc(val == null ? '' : val) + '" ' + attr +
          (disabled ? ' disabled' : '') + '>' +
        '<span class="zstep__btns">' +
          '<button class="zstep__btn" type="button" data-step="up" tabindex="-1" aria-label="' + esc(T('cpp.bd.qty.up')) + '"><i data-lucide="chevron-up" class="ztor-icon"></i></button>' +
          '<button class="zstep__btn" type="button" data-step="down" tabindex="-1" aria-label="' + esc(T('cpp.bd.qty.down')) + '"><i data-lucide="chevron-down" class="ztor-icon"></i></button>' +
        '</span></span>';
    }
    /* 語意句：這一組粉絲會怎麼買——勾一下就換一句（`cpp.bd.sp.sem.*`）。 */
    function semanticText(b) {
      var lines = setLines(b), n = String(tixQty(b));
      if (!lines.length) return T('cpp.bd.sp.sem.none');
      if (lines.length === 1) return T('cpp.bd.sp.sem.one').replace('{name}', lines[0].name).replace('{n}', n);
      return T('cpp.bd.sp.sem.any').replace('{names}', listJoin(tixNames(b))).replace('{n}', n);
    }
    function specText(it) {
      var opts = itemOptions(it);
      if (!opts) return T('cpp.bd.sp.spec.single');
      return T('cpp.bd.sp.spec.multi').replace('{opts}', listJoin(opts.map(function (o) { return optName(o.name); })));
    }
    function itemPriceText(it) {
      var v = itemMin(it);
      if (!cash(it.price) && !itemVariants(it)) return T('cpp.bd.calc.unpriced');
      return itemRange(it) ? T('cpp.bd.price.from').replace('{sum}', money(v)) : money(v);
    }

    /* ── ① 內容物 ────────────────────────────────────────────────────────── */
    function itemsTableHTML(b) {
      if (!b.items.length) return '';
      var locked = isLocked(b);
      return '<div class="bd-tbl bd-tbl--items">' +
        '<div class="bd-tbl__head">' +
          /* 表頭原本是「已加入」——這張表列的本來就是已加入的，欄名改回主詞「商品」（2026-09-22 方案 A）。 */
          '<span class="bd-tbl__col">' + esc(T('cpp.bd.sp.items')) + '</span>' +
          '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.sp.tbl.list')) + '</span>' +
          '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.sp.tbl.stock')) + '</span>' +
          '<span></span>' +
        '</div>' +
        b.items.map(function (it) {
          var st = num(it.stock);
          return '<div class="bd-tbl__row" data-bd-ref="' + esc(it.id) + '">' +
            '<span class="bd-tbl__cell"><span class="bd-tbl__name">' + esc(it.name) + '</span>' +
              '<span class="bd-tbl__sub">' + esc(it.id.indexOf('draft:') === 0 ? T('cpp.bd.item.draft') : specText(it)) + '</span></span>' +
            '<span class="bd-tbl__num">' + esc(itemPriceText(it)) + '</span>' +
            '<span class="bd-tbl__num">' + esc(Number.isFinite(st) ? Math.floor(st).toLocaleString('en-US') : '—') + '</span>' +
            '<span class="bd-tbl__act">' + (locked ? '' :
              '<button class="btn btn--ghost btn--icon btn--xs" type="button" data-bd-item-remove aria-label="' + esc(T('cpp.bd.item.remove')) + '"><i data-lucide="x" class="ztor-icon"></i></button>') + '</span>' +
          '</div>';
        }).join('') +
      '</div>';
    }
    function ticketBlockHTML(b) {
      if (!getTickets) return '';
      var rows = kindRows();
      var lockNote = isLocked(b)
        ? '<div class="field__hint field__hint--fact bd-lock-note"><i data-lucide="lock" class="ztor-icon"></i>' +
            esc(T('cpp.bd.sp.locked').replace('{n}', String(b.sold))) + '</div>'
        : '';
      /* 2026-09-22 方案 A（三層收斂）：小標 hint、「允許票種」標籤、表下規則 hint 三個一起退場——
         「哪些票種」由表頭「票種」與勾選框本身說完，規則句收斂成張數欄底下唯一一句（tixQtyFieldHTML）。 */
      return subHeadHTML(T('cpp.bd.sp.tix'), '') +
        lockNote +
        secScopeHTML(b) +
        '<div class="field">' +
          tixTableHTML(b) +
        '</div>' +
        (rows.length ? tixQtyFieldHTML(b) : '') +
        sessionsFieldHTML(b) +
        perFieldHTML(b);
    }
    /* 適用場次（多場 ＋ 一組通用所有場次 ＋ 已勾票種）與每場預覽（每場各一組）在 SPLIT 裡是
       票券小節底下的兩個欄位群，不再各自一張分卡——分卡在這個版型只有三張。內容照舊
       （secSessionsHTML／secPerHTML 的 `.bd-sec` 殼換成 `.field`）。 */
    function sessionsFieldHTML(b) {
      var table = sessionsTableHTML(b);
      if (!table) return '';
      return '<div class="field bd-field--table">' +
        '<div class="field__label">' + esc(T('cpp.bd.sec.sess')) + '</div>' +
        table +
        '<div class="field__hint">' + esc(T('cpp.bd.sec.sess.sub')) + '</div>' +
      '</div>';
    }
    function perFieldHTML(b) {
      if (b.scope !== 'per' || !ticketGroups().length || !ticketKinds().length) return '';
      var rows = perRows(b);
      return '<div class="field bd-field--table">' +
        '<div class="field__label">' + esc(T('cpp.bd.per.preview')) + '</div>' +
        perTableHTML(b) +
        '<div class="field__hint">' + esc(rows.length
          ? T('cpp.bd.per.preview.sub').replace('{n}', rows.length)
          : T('cpp.bd.per.preview.empty')) + '</div>' +
      '</div>';
    }
    function productsBlockHTML(b) {
      var locked = isLocked(b);
      /* 2026-09-22 方案 A：小標 hint「選填；每組各 1 件」退場——「選填」降進搜尋框 placeholder，
         「每組各 1 件」由表頭欄名承擔（活動變體每組固定 1 件，欄名就是「商品」）。 */
      return subHeadHTML(T('cpp.bd.sp.items'), '') +
        (locked ? '' :
          '<div class="fc-pick" data-bd-pick>' +
            '<input class="input" data-bd-search placeholder="' + esc(T('cpp.bd.sp.search')) + '" autocomplete="off">' +
            '<div class="fc-pick__results" data-bd-results hidden></div>' +
          '</div>') +
        itemsTableHTML(b);
    }
    /* 三段的段頭一律只有段標題：段副標只能把段標題換句話說，2026-09-22 方案 A 整層退場。 */
    function secContentSplitHTML(b) {
      return '<section class="bd-sec bd-sec--stack" data-st-section="content">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sp.sec.content')) + '</h3>' +
        '</div>' +
        ticketBlockHTML(b) +
        productsBlockHTML(b) +
        '<div class="field">' +
          '<label class="field__label">' + esc(T('cpp.bd.perks')) + '</label>' +
          /* hint「選填。一行一項……」整條併進 placeholder（2026-09-22 方案 A）。 */
          '<textarea class="input textarea bd-perks" rows="2" data-bd-perks placeholder="' + esc(T('cpp.bd.sp.perks.ph')) + '">' +
            esc(b.perks.join('\n')) + '</textarea>' +
        '</div>' +
      '</section>';
    }

    /* ── ② 定價與庫存 ──────────────────────────────────────────────────── */
    /* 原價合計的算式：一行一項（kv 列），每項底下一句「怎麼算」，合計列加粗一階。 */
    function calcListHTML(b) {
      var rows = [], lines = setLines(b), n = String(tixQty(b));
      if (lines.length) {
        var mp = money(tixMinPrice(b));
        rows.push({
          k: tixLineText(b),
          how: lines.length === 1
            ? T('cpp.bd.sp.calc.how.one').replace('{price}', mp).replace('{n}', n)
            : T('cpp.bd.sp.calc.how.any').replace('{price}', mp).replace('{n}', n),
          v: lines.length > 1 ? T('cpp.bd.price.from').replace('{sum}', money(ticketValue(b))) : money(ticketValue(b))
        });
      }
      b.items.forEach(function (it) {
        /* 單一規格的商品在 SPLIT 不寫「怎麼算」：一個價錢乘以一件，沒有要解釋的（2026-09-22 方案 A）。 */
        var multi = !!itemOptions(it);
        rows.push({ k: it.name, how: (SPLIT && !multi) ? '' : T(multi ? 'cpp.bd.sp.calc.how.item.multi' : 'cpp.bd.sp.calc.how.item.single'), v: itemPriceText(it) });
      });
      if (!rows.length) return '<div class="field__hint">' + esc(T('cpp.bd.sp.calc.empty')) + '</div>';
      return '<div class="bd-calc-list">' +
        rows.map(function (r) {
          return '<div class="kv"><span class="kv__k">' + esc(r.k) +
              (r.how ? '<span class="bd-calc-list__how">' + esc(r.how) + '</span>' : '') + '</span>' +
            '<span class="kv__v">' + esc(r.v) + '</span></div>';
        }).join('') +
        '<div class="kv bd-calc-list__total"><span class="kv__k">' + esc(T('cpp.bd.calc.base')) + '</span>' +
          '<span class="kv__v" data-bd-calc-base>' + esc(moneyFrom(b, listPrice(b))) + '</span></div>' +
      '</div>';
    }
    function saveText(b) {
      var d = discountPct(b);
      if (!d) return T('cpp.bd.sp.save.zero');
      return T(priceRange(b) ? 'cpp.bd.sp.save.from' : 'cpp.bd.sp.save')
        .replace('{amt}', money(discountOf(b))).replace('{pct}', pctStr(effPct(b)));
    }
    /* 鎖定套數的 hint 只回答「留空會怎樣」；上限那半句搬去「可售套數」講一次（2026-09-22 方案 A）。
       超過上限是錯誤態，還是要把數字說清楚，所以 `lock.over` 保留完整句。 */
    function lockHintText(b) {
      var c = memberCapWho(b);
      if (c.n === Infinity) return T('cpp.bd.sp.lock.none');
      if (!lockOver(b)) return T('cpp.bd.sp.lock.hint');
      return T('cpp.bd.sp.lock.over')
        .replace('{n}', c.n.toLocaleString('en-US')).replace('{who}', whoText(c.who));
    }
    /* 可售套數（2026-09-22 方案 A）：它是這一段的結果，升成大讀數並移到鎖定套數之前——
       鎖定與限量是對它的兩個調整。數字（`setsValText`）與「受誰限制」（`setsWhyText`）拆成
       讀數與 hint 兩層，上限這個事實全站只在這裡講一次。 */
    function setsValText(b) {
      var s = sellableSets(b);
      return s === null ? '—' : T('cpp.bd.sp.sets.val').replace('{n}', s.toLocaleString('en-US'));
    }
    function setsWhyText(b) {
      var s = sellableSets(b), c = memberCapWho(b);
      if (s === null) return '';
      if (lockN(b) && !lockOver(b)) {
        var t = T('cpp.bd.sp.sets.why.lock').replace('{lock}', lockN(b).toLocaleString('en-US'));
        return capN(b) && capN(b) < lockN(b) ? t + T('cpp.bd.sp.sets.capnote').replace('{cap}', capN(b).toLocaleString('en-US')) : t;
      }
      if (capN(b) && (c.n === Infinity || capN(b) < c.n)) return T('cpp.bd.sp.sets.why.cap');
      if (c.n === Infinity) return '';
      return T('cpp.bd.sp.sets.why.by')
        .replace('{who}', c.who === 'tix' ? T('cpp.bd.sp.sets.by.tix') : T('cpp.bd.sp.sets.by.item').replace('{name}', String(c.who)));
    }
    /* 限量上限的 hint：前半「成員最多供應 N 組」是同一個上限第 3 次出現，刪（2026-09-22 方案 A）；
       只留「賣完自動售罄」。填超過還是要說數字，所以 `cap.over` 保留。 */
    function capHintSplit(b) {
      var s = setsBeforeCap(b);
      if (s !== null && capOver(b)) return T('cpp.bd.sp.cap.over').replace('{n}', s.toLocaleString('en-US'));
      return T('cpp.bd.sp.cap.hint');
    }
    function secPriceSplitHTML(b) {
      var on = !!b.discountOn, lockable = memberCapWho(b).n !== Infinity;
      var limited = b.avail === 'limited';
      /* 副標只在兩個選項真的有差異要講時才寫：「不限量」的副標只是把上一格讀數換句話說，刪。 */
      function card(val, on2, key, subKey) {
        return '<button type="button" class="segmented__btn' + (on2 ? ' segmented__btn--active' : '') +
          '" role="radio" aria-checked="' + on2 + '" data-bd-avail="' + val + '">' +
          '<span class="radio-card__text"><span class="radio-card__title">' + esc(T(key)) + '</span>' +
            (subKey ? '<span class="radio-card__sub">' + esc(T(subKey)) + '</span>' : '') + '</span></button>';
      }
      /* 2026-09-22 方案 A：段副標、「原價合計」標籤（合計列自己說）、「折扣」標籤（步進器已帶 % 後綴）、
         關折扣時那句「粉絲實付＝…」（底部固定列有同一個數字）、「限量」標籤（與選項值一字不差）全部退場；
         可售套數升成大讀數並移到鎖定套數之前。 */
      return '<section class="bd-sec bd-sec--stack" data-st-section="price">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sp.sec.price')) + '</h3>' +
        '</div>' +
        '<div class="field"><div data-bd-calc>' + calcListHTML(b) + '</div></div>' +
        '<div class="control-group">' +
          '<div class="control-row"><div>' +
            '<div class="control-row__main">' + esc(T('cpp.bd.sp.disc.on')) + '</div>' +
            '<div class="control-row__sub">' + esc(T('cpp.bd.sp.disc.on.sub')) + '</div></div>' +
            '<div class="switch' + (on ? ' switch--on' : '') + '" role="switch" aria-checked="' + on + '" tabindex="0" data-bd-disc-toggle></div>' +
          '</div>' +
          '<div class="control-group__body"' + (on ? '' : ' hidden') + '>' +
            '<div class="form-grid bd-disc-grid">' +
              '<div class="field">' +
                stepperHTML('data-bd-f="discount" aria-label="' + esc(T('cpp.bd.sp.disc')) + '"', b.discount, '%', 0, 100, 'bd-disc') + '</div>' +
              '<div class="field"><label class="field__label">' + esc(T('cpp.bd.sp.sell')) + '</label>' +
                '<div class="field-readout bd-readout--big" data-bd-calc-final>' + esc(moneyFrom(b, finalPrice(b))) + '</div>' +
                '<div class="field__hint" data-bd-save>' + esc(saveText(b)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="field"><label class="field__label">' + esc(T('cpp.bd.sp.sets')) + '</label>' +
          '<div class="field-readout bd-readout--big" data-bd-sets>' + esc(setsValText(b)) + '</div>' +
          '<div class="field__hint" data-bd-sets-why>' + esc(setsWhyText(b)) + '</div></div>' +
        '<div class="lockset__sets">' +
          '<div class="lockset__sets-titles"><span class="lockset__sets-title">' + esc(T('cpp.bd.sp.lock')) + '</span>' +
            '<span class="lockset__sets-hint' + (lockOver(b) ? ' is-over' : '') + '" data-bd-lock-hint>' + esc(lockHintText(b)) + '</span></div>' +
          '<div class="lockset__sets-ctl">' + stepperHTML('data-bd-f="lockSets"', b.lockSets, T('cpp.bd.sp.unit.group'), 0, null, 'bd-disc', !lockable) + '</div>' +
        '</div>' +
        '<div class="field">' +
          '<div class="segmented radio-cards" role="radiogroup" aria-label="' + esc(T('cpp.bd.sp.limit')) + '">' +
            card(AVAIL_OPEN, !limited, 'cpp.bd.qty.unlim', '') +
            card('limited', limited, 'cpp.bd.avail.limited', 'cpp.bd.sp.limit.lim.sub') +
          '</div>' +
          (limited
            ? '<div class="mt-8">' + stepperHTML('data-bd-f="cap"' + (capOver(b) ? ' aria-invalid="true"' : ''), b.cap, T('cpp.bd.sp.unit.group'), 1, null, 'bd-disc') +
                '<div class="field__hint' + (capOver(b) ? ' fc-hint--over' : '') + '" data-bd-capmax>' + esc(capHintSplit(b)) + '</div></div>'
            : '') +
        '</div>' +
      '</section>';
    }

    /* ── ③ 命名與上架 ──────────────────────────────────────────────────── */
    function coverFieldHTML(b) {
      if (!COVER) return '';
      /* 2026-09-22 方案 A：欄位標籤「封面」與上傳格 CTA「上傳封面」擇一，留標籤；側欄那句
         「粉絲看到的卡片就用這張」重述標籤，右欄預覽卡已經示範過，刪。 */
      return '<div class="field"><label class="field__label">' + esc(T('cpp.bd.cover')) + '</label>' +
        '<div class="upload-tile-aside bd-cover">' +
          '<div class="upload-tile upload-tile--portrait' + (b.cover ? ' is-filled' : '') +
              '" data-bd-cover data-asset="bdcover-' + b.id + '" data-upload aria-label="' + esc(T('cpp.bd.cover.cta')) + '">' +
            '<span class="upload-tile__icon"><i data-lucide="photo-video" class="ztor-icon ztor-icon--md"></i></span>' +
          '</div>' +
          '<div class="upload-tile-aside__side"><span class="upload-tile__sub">' + esc(T('cp.media.portrait')) + '</span></div>' +
        '</div></div>';
    }
    function secNameSplitHTML(b) {
      var sug = suggestName(b), ev = eventInfo();
      var shown = b.nameTouched ? b.name : sug;
      return '<section class="bd-sec bd-sec--stack" data-st-section="name">' +
        '<div class="bd-sec__head">' +
          '<h3 class="bd-sec__title">' + esc(T('cpp.bd.sp.sec.name')) + '</h3>' +
        '</div>' +
        '<div class="field">' +
          '<label class="field__label">' + esc(T('cpp.bd.name')) + ' <span class="field__req">*</span></label>' +
          '<input class="input" data-bd-f="name" value="' + esc(shown) + '" placeholder="' + esc(sug || T('cpp.bd.sp.name.ph')) + '">' +
          (sug && b.nameTouched && b.name !== sug
            ? '<button class="bd-suggest" type="button" data-bd-usesug>' + esc(T('cpp.bd.suggest').replace('{n}', sug)) + '</button>'
            : '') +
        '</div>' +
        '<div class="field">' +
          '<label class="field__label">' + esc(T('cpp.bd.sp.desc')) + '</label>' +
          '<textarea class="input textarea bd-desc" rows="3" data-bd-f="desc" placeholder="' + esc(T('cpp.bd.sp.desc.ph')) + '">' + esc(b.desc) + '</textarea>' +
        '</div>' +
        coverFieldHTML(b) +
        /* 「上架」標籤與段標題「命名與上架」的後半重複，刪；kv 列的「跟著活動」自己就是主詞。 */
        '<div class="field">' +
          '<div class="kv-list bd-listing">' +
            '<div class="kv kv--lead"><span class="kv__k">' + esc(T('cpp.bd.sp.follow')) + '</span>' +
              '<span class="kv__v">' + esc(ev.name || T('event-detail.untitled')) + eventBadgeHTML(ev) + '</span></div>' +
          '</div>' +
          '<div class="field__hint">' + esc(T(ev.status === 'draft' ? 'cpp.bd.sp.follow.draft' : 'cpp.bd.sp.follow.hint')) + '</div>' +
        '</div>' +
      '</section>';
    }

    /* ── 右欄：粉絲看到的 ─────────────────────────────────────────────── */
    /* 某個票種在粉絲挑的那一場剩幾張（單場＝那張票；多場 shared＝挑的那場；per＝第一場）。 */
    function fanLeft(b, k) {
      var f = fan(b), groups = ticketGroups(), multi = groups.length > 1 && groups[0].name;
      var sess = multi ? f.session : null;
      return k.ids.reduce(function (m, id) {
        var t = ticketById(id);
        if (!t || !tixHas(b, id)) return m;
        if (sess && (t.group && t.group.id) !== sess) return m;
        var q = num(t.qty);
        return m + (Number.isFinite(q) && q > 0 ? q : 0);
      }, 0);
    }
    /* 某個選項值有沒有貨：至少一個含這個值的規格列庫存 > 0（沒填庫存視為有貨）。 */
    function variantValueInStock(it, optIdx, val) {
      var vs = itemVariants(it);
      if (!vs) return true;
      return vs.some(function (v) {
        if (!v.combo || v.combo[optIdx] !== val) return false;
        var st = num(v.stock);
        return !Number.isFinite(st) || st > 0;
      });
    }
    function variantOf(it, sel) {
      var vs = itemVariants(it), opts = itemOptions(it);
      if (!vs || !opts) return null;
      return vs.filter(function (v) {
        return opts.every(function (o, i) { return v.combo && v.combo[i] === sel[o.name]; });
      })[0] || null;
    }
    /* 粉絲選定票種與規格後，價格從「從 $Y 起」收斂成一個數字。 */
    function fanPrice(b) {
      var f = fan(b), lines = setLines(b), n = tixQty(b), v = 0, resolved = true;
      if (lines.length) {
        var l = lines.length === 1 ? lines[0] : lines.filter(function (x) { return x.k.id === f.tier; })[0];
        if (l) v += l.price * n; else { v += tixMinPrice(b) * n; resolved = false; }
      }
      b.items.forEach(function (it) {
        var opts = itemOptions(it);
        if (!opts) { v += itemMin(it); return; }
        var sel = f.variants[it.id] || {};
        var done = opts.every(function (o) { return sel[o.name]; });
        var vr = done ? variantOf(it, sel) : null;
        if (vr) v += variantPrice(it, vr); else { v += itemMin(it); if (itemRange(it)) resolved = false; }
      });
      var d = discountPct(b);
      return { base: v, sell: v - Math.min(v * d / 100, v), range: priceRange(b) && !resolved };
    }
    function pickHTML(label, chips, note) {
      return '<div class="bpc__pick"><span class="bpc__picklabel">' + esc(label) + '</span>' +
        '<div class="chip-group">' + chips + '</div>' +
        (note ? '<span class="bpc__picklabel">' + esc(note) + '</span>' : '') + '</div>';
    }
    function fanHTML(b) {
      var f = fan(b), groups = ticketGroups(), multi = groups.length > 1 && groups[0].name;
      if (multi && (b.scope === 'per' || !groups.some(function (g) { return g.id === f.session; }))) f.session = groups[0].id;
      var lines = setLines(b), n = tixQty(b), ev = eventInfo();
      var name = b.nameTouched && b.name ? b.name : suggestName(b);
      var rows = [];
      if (getTickets && lines.length) {
        var sessPick = (multi && b.scope !== 'per')
          ? pickHTML(T('cpp.bd.sp.fan.session'), groups.map(function (g) {
              return '<button type="button" class="chip' + (f.session === g.id ? ' chip--active' : '') + '" data-bd-fan-sess="' + esc(g.id) + '">' + esc(g.name) + '</button>';
            }).join(''))
          : '';
        var anyShort = false, tierPick = '';
        if (lines.length > 1) {
          var chips = lines.map(function (l) {
            var left = fanLeft(b, l.k), short = left < n;
            if (short) anyShort = true;
            return '<button type="button" class="chip' + (f.tier === l.k.id ? ' chip--active' : '') + '"' +
              (short ? ' disabled title="' + esc(T('cpp.bd.sp.fan.short').replace('{left}', String(left)).replace('{n}', String(n))) + '"' : '') +
              ' data-bd-fan-tier="' + esc(l.k.id) + '">' + esc(l.name) + ' · ' + esc(l.price === 0 ? T('ce.tier.free') : money(l.price)) + '</button>';
          }).join('');
          tierPick = pickHTML(T('cpp.bd.sp.fan.tier'), chips, anyShort ? T('cpp.bd.sp.fan.shortnote') : null);
        }
        var what = (ev.name ? ev.name + ' · ' : '') +
          (multi && b.scope === 'per' ? groups[0].name + ' · ' : '') +
          (lines.length === 1 ? tixLineText(b) : T('cpp.bd.sp.fan.what.n').replace('{n}', String(n)));
        rows.push('<div class="bpc__row"><i data-lucide="ticket" class="ztor-icon"></i><div><div class="bpc__what">' + esc(what) + '</div>' + sessPick + tierPick + '</div></div>');
      } else if (getTickets && kindRows().length) {
        rows.push('<div class="bpc__row"><i data-lucide="ticket" class="ztor-icon"></i><div class="bpc__what is-empty">' + esc(T('cpp.bd.sp.fan.notix')) + '</div></div>');
      }
      b.items.forEach(function (it) {
        var opts = itemOptions(it), sel = f.variants[it.id] || {};
        var picks = opts ? opts.map(function (o, oi) {
          return pickHTML(optName(o.name), o.values.map(function (v) {
            var ok = variantValueInStock(it, oi, v);
            return '<button type="button" class="chip' + (sel[o.name] === v ? ' chip--active' : '') + '"' + (ok ? '' : ' disabled') +
              ' data-bd-fan-var="' + esc(it.id) + '" data-bd-fan-opt="' + esc(o.name) + '" data-bd-fan-val="' + esc(v) + '">' + esc(v) + '</button>';
          }).join(''));
        }).join('') : '';
        rows.push('<div class="bpc__row"><i data-lucide="package" class="ztor-icon"></i><div><div class="bpc__what">' + esc(T('cpp.bd.sp.fan.item').replace('{name}', it.name)) + '</div>' + picks + '</div></div>');
      });
      b.perks.map(function (l) { return String(l || '').trim(); }).filter(Boolean).forEach(function (l) {
        rows.push('<div class="bpc__row"><i data-lucide="sparkles" class="ztor-icon"></i><div class="bpc__what">' + esc(l) + '</div></div>');
      });
      if (!rows.length) rows.push('<div class="bpc__what is-empty">' + esc(T('cpp.bd.sum.empty')) + '</div>');

      var fp = fanPrice(b), d = discountPct(b), sets = sellableSets(b);
      var needTier = lines.length > 1 && !f.tier;
      var needOpts = [];
      b.items.forEach(function (it) {
        var opts = itemOptions(it); if (!opts) return;
        opts.forEach(function (o) { if (!(f.variants[it.id] || {})[o.name]) needOpts.push(optName(o.name)); });
      });
      var soldOut = sets !== null && sets <= 0;
      var canBuy = hasContent(b) && !needTier && !needOpts.length && !soldOut;
      var why = '';
      if (!hasContent(b)) why = T('cpp.bd.sp.fan.why.empty');
      else if (soldOut) why = T('cpp.bd.sp.fan.soldout');
      else if (needTier || needOpts.length) {
        var bits = (needTier ? [T('cpp.bd.tbl.tier')] : []).concat(needOpts);
        why = T('cpp.bd.sp.fan.why.pick').replace('{what}', listJoin(bits));
      }
      var fromOrNot = function (v) { return fp.range ? T('cpp.bd.price.from').replace('{sum}', money(v)) : money(v); };
      return '<div class="preview-card bpc">' +
        '<div class="preview-card__media">' + (b.cover ? '' : '<i data-lucide="image" class="ztor-icon"></i>') + '</div>' +
        '<div class="preview-card__body">' +
          '<div class="preview-card__row"><h4 class="preview-card__name' + (name ? '' : ' is-empty') + '">' + esc(name || T('cpp.bd.untitled')) + '</h4>' +
            eventBadgeHTML(ev) + '</div>' +
          (b.desc ? '<p class="preview-card__desc">' + esc(b.desc) + '</p>' : '') +
          '<div class="bpc__list">' + rows.join('') + '</div>' +
          '<div class="bpc__price">' +
            '<span class="bpc__now">' + esc(hasContent(b) ? fromOrNot(fp.sell) : '—') + '</span>' +
            (d && hasContent(b) ? '<span class="bpc__was">' + esc(fromOrNot(fp.base)) + '</span>' +
              '<span class="ztor-badge ztor-badge--warning">' + esc(T('cpp.bd.sp.fan.off').replace('{pct}', pctStr(effPct(b)))) + '</span>' : '') +
          '</div>' +
          '<div class="bpc__meta">' +
            (sets === null ? '' : (soldOut ? '<span class="ztor-badge ztor-badge--error">' + esc(T('cpp.bd.sp.fan.soldout')) + '</span>' : esc(T('cpp.bd.sp.fan.left').replace('{n}', sets.toLocaleString('en-US'))))) +
            (multi && b.scope === 'per' ? '<span>' + esc(T('cpp.bd.sp.fan.per').replace('{n}', String(groups.length))) + '</span>' : '') +
          '</div>' +
          '<button class="btn btn--primary bpc__cta" type="button" tabindex="-1"' + (canBuy ? '' : ' disabled') + '><i data-lucide="shopping-cart" class="ztor-icon"></i>' + esc(T('cpp.bd.sp.fan.cta')) + '</button>' +
          (why ? '<div class="bpc__why">' + esc(why) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<p class="bpc__note">' + esc(T('cpp.bd.sp.fan.note')) + '</p>';
    }

    /* ── footer：粉絲實付＋原價與最多組數一句＋取消／完成 ───────────────── */
    function footSubText(b) {
      if (!hasContent(b)) return T('cpp.bd.sp.foot.none');
      var sets = sellableSets(b);
      return T(sets === null ? 'cpp.bd.sp.foot.sub.nosets' : 'cpp.bd.sp.foot.sub')
        .replace('{list}', moneyFrom(b, listPrice(b))).replace('{n}', sets === null ? '' : sets.toLocaleString('en-US'));
    }
    /* 頂列第二排：分節分頁（2026-09-21 使用者：「popup 中要有 fix 在最上面的 tab 可以快速滾動到指定區塊」）。
       放在 __head 與 __body 之間、捲動區之外——頂列＝標題排＋分頁排，只有一條固定列（Q115 精神），
       右欄預覽卡的 sticky 不會被它蓋到。行為在 js/section-tabs.js（點了捲到段、scrollspy、鍵盤）；
       每次 render() 換掉 innerHTML 之後都要再 init 一次。 */
    var ST_SECTIONS = [['content', 'cpp.bd.sp.sec.content'], ['price', 'cpp.bd.sp.sec.price'], ['name', 'cpp.bd.sp.sec.name']];
    function sectionTabsHTML() {
      return '<nav class="section-tabs section-tabs--dialog" data-section-tabs data-st-scroller=".payout-dialog__body" aria-label="' + esc(T('st.aria')) + '">' +
        '<div class="tabs tabs--underline-short tabs--underline-label">' +
          ST_SECTIONS.map(function (it, i) {
            return '<button type="button" class="tabs__item' + (i === 0 ? ' tabs__item--active' : '') + '" data-st-tab="' + it[0] + '"' +
              (i === 0 ? ' aria-current="location"' : '') + '><span>' + esc(T(it[1])) + '</span></button>';
          }).join('') +
        '</div>' +
      '</nav>';
    }
    function splitCardHTML(b) {
      var groups = ticketGroups();
      var primaryLabel = b.sold > 0 ? T('cpp.bd.sp.savechanges')
        : (b.scope === 'per' && perRows(b).length > 1 ? T('cpp.bd.createn').replace('{n}', perRows(b).length) : T('cpp.bd.done'));
      var gateOff = gateOffFor(b), why = gateOff ? gateWhyText(b) : '';
      return '' +
      '<div class="payout-modal bd-modal" data-bd-card="' + b.id + '">' +
        '<section class="payout-dialog payout-dialog--xwide bd-dialog--split" role="dialog" aria-modal="true">' +
          '<div class="payout-dialog__head">' +
            '<h2 class="payout-dialog__title">' + esc(b.fresh ? T('cpp.bd.add') : T('cpp.bd.edit')) + '</h2>' +
            '<button class="btn btn--icon" type="button" data-bd-close aria-label="' + esc(T('cpp.bd.close')) + '">' +
              '<i data-lucide="x" class="ztor-icon"></i></button>' +
          '</div>' +
          sectionTabsHTML() +
          '<div class="payout-dialog__body bd-form">' +
            '<div class="payout-dialog__split bd-split">' +
              '<div class="bd-split__main">' + secContentSplitHTML(b) + secPriceSplitHTML(b) + secNameSplitHTML(b) + '</div>' +
              '<aside class="payout-dialog__split-side bd-split__side">' +
                '<h3 class="bpc__title">' + esc(T('cpp.bd.sp.fan.title')) + '</h3>' +
                '<div data-bd-fan>' + fanHTML(b) + '</div>' +
              '</aside>' +
            '</div>' +
          '</div>' +
          '<div class="payout-dialog__foot">' +
            '<div class="bd-foot-price">' +
              '<span class="bd-foot-price__k">' + esc(T('cpp.bd.calc.final')) + '</span>' +
              '<span class="bd-foot-price__v">' +
                '<span data-bd-calc-final>' + esc(hasContent(b) ? moneyFrom(b, finalPrice(b)) : '—') + '</span>' +
              '</span>' +
              '<span class="bd-foot-price__sub" data-bd-foot-sub>' + esc(footSubText(b)) + '</span>' +
            '</div>' +
            '<div class="bd-foot-actions">' +
              '<span class="bd-foot-why" data-bd-why' + (why ? '' : ' hidden') + '>' + esc(why) + '</span>' +
              '<button class="btn btn--outline" type="button" data-bd-cancel>' + esc(T('cpp.bd.sp.cancel')) + '</button>' +
              '<button class="btn btn--primary" type="button" data-bd-primary' + (gateOff ? ' disabled' : '') + '>' + esc(primaryLabel) + '</button>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>';
    }
    /* 就地同步（SPLIT）：打字當下只換推導值，不重繪輸入欄（重繪會丟游標）。 */
    function syncSplit(card, b) {
      var set = function (sel, txt) { var el = card.querySelector(sel); if (el) el.textContent = txt; };
      var calc = card.querySelector('[data-bd-calc]'); if (calc) calc.innerHTML = calcListHTML(b);
      card.querySelectorAll('[data-bd-calc-final]').forEach(function (el) { el.textContent = hasContent(b) ? moneyFrom(b, finalPrice(b)) : '—'; });
      set('[data-bd-save]', saveText(b));
      var lh = card.querySelector('[data-bd-lock-hint]');
      if (lh) { lh.textContent = lockHintText(b); lh.classList.toggle('is-over', lockOver(b)); }
      set('[data-bd-sets]', setsValText(b));
      set('[data-bd-sets-why]', setsWhyText(b));
      var cm = card.querySelector('[data-bd-capmax]');
      if (cm) { cm.textContent = capHintSplit(b); cm.classList.toggle('fc-hint--over', capOver(b)); }
      var capEl = card.querySelector('[data-bd-f="cap"]');
      if (capEl) { if (capOver(b)) capEl.setAttribute('aria-invalid', 'true'); else capEl.removeAttribute('aria-invalid'); }
      /* 語意句現在是張數欄底下的 hint（方案 A），表尾已退場，不再各自更新一次。 */
      set('[data-bd-sem]', semanticText(b));
      /* 「不足 n 張」小字依張數而變：整張票券表就地換掉（勾選框不是文字欄，換掉不丟游標；表內有焦點時不動）。 */
      var tbl = card.querySelector('.bd-tbl--tix');
      if (tbl && !(document.activeElement && tbl.contains(document.activeElement))) {
        var tmp = document.createElement('div'); tmp.innerHTML = tixTableHTML(b);
        if (tmp.firstChild) tbl.replaceWith(tmp.firstChild);
      }
      perRows(b).forEach(function (r) {
        var vEl = card.querySelector('[data-bd-per-val="' + r.g.id + '"]');
        if (vEl) vEl.textContent = perValText(b, r);
        var sEl = card.querySelector('[data-bd-per-sub="' + r.g.id + '"]');
        if (sEl) sEl.textContent = tixLineText(b, r.incl.map(function (t) { return t.kind.name; }));
      });
      /* 名稱沒被改過就一直跟著內容自動建議（聚焦中不動它）。 */
      var nameEl = card.querySelector('[data-bd-f="name"]');
      if (nameEl) {
        var sug = suggestName(b);
        nameEl.placeholder = sug || T('cpp.bd.sp.name.ph');
        if (!b.nameTouched && document.activeElement !== nameEl) nameEl.value = sug;
      }
      var fanEl = card.querySelector('[data-bd-fan]');
      if (fanEl) { fanEl.innerHTML = fanHTML(b); if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(fanEl); }
      set('[data-bd-foot-sub]', footSubText(b));
      var primaryEl = card.querySelector('[data-bd-primary]');
      var off = gateOffFor(b);
      if (primaryEl) {
        primaryEl.disabled = off;
        primaryEl.textContent = b.sold > 0 ? T('cpp.bd.sp.savechanges')
          : (b.scope === 'per' && perRows(b).length > 1 ? T('cpp.bd.createn').replace('{n}', perRows(b).length) : T('cpp.bd.done'));
      }
      var whyEl = card.querySelector('[data-bd-why]');
      if (whyEl) { var why = off ? gateWhyText(b) : ''; whyEl.textContent = why; whyEl.hidden = !why; }
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(card);
    }
    /* 取消＝還原打開時的快照（SPLIT）。快照只收這一組的資料欄位，不收 fresh／collapsed 這類 UI 狀態。 */
    var SNAP_KEYS = ['name', 'desc', 'discount', 'discountOn', 'avail', 'cap', 'lockSets', 'perks', 'scope', 'cover', 'nameTouched'];
    function snapOf(b) {
      var o = {};
      SNAP_KEYS.forEach(function (k) { o[k] = Array.isArray(b[k]) ? b[k].slice() : b[k]; });
      o.items = b.items.map(function (it) { return it; });
      o.tickets = { tierIds: tixIds(b).slice(), qty: tixQty(b) };
      return o;
    }
    function restoreSnap(b) {
      var o = b._snap; if (!o) return;
      SNAP_KEYS.forEach(function (k) { b[k] = Array.isArray(o[k]) ? o[k].slice() : o[k]; });
      b.items = o.items.slice();
      b.tickets = { tierIds: o.tickets.tierIds.slice(), qty: o.tickets.qty };
    }
    function cancel(b) {
      if (b.fresh) {
        BUNDLES = BUNDLES.filter(function (x) { return x.id !== b.id; });
      } else {
        restoreSnap(b);
        b.collapsed = true;
      }
      delete b._snap; delete FAN[b.id];
      b.step = 1;
      render({ blur: true });
    }

    /* 兩步彈窗（2026-08-13 使用者指示「基本資料與封面圖放下一步，不需要 stepper」）。
       第 1 步回答「這一組賣什麼、怎麼賣」，第 2 步才是「它長什麼樣」——名稱與封面圖
       本來就排在最後，而且名稱會從內容自動擬好，等於是確認而不是填空。
       **不放 stepper**：兩步的進度條要佔掉 dialog 頂部一整條，卻只表達「兩步中的第幾步」，
       而分卡標題（基本資料／封面圖）已經說了現在在哪；前後由 footer 的兩顆按鈕承擔。 */
    function secCardHTML(b, i) {
      if (SPLIT) return splitCardHTML(b);
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
              /* 第 1 步的內容分卡依變體組合（2026-09-01 通用化）：
                 活動＝票種／場次那三張（原樣不動）；共創＝分潤名額；預購＝作品＋份數。
                 商品、權益、定價、數量四張是共用的。 */
              : (getTickets
                  ? secKindHTML(b) + secPerHTML(b) + secSessionsHTML(b)
                  : (SHARES ? secSlotsHTML(b) : secWorkHTML(b))) +
                secItemsHTML(b) + secPerksHTML(b) + secPriceHTML(b) + secQtyHTML(b)) +
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
                '<span data-bd-calc-final>' + esc(moneyFrom(b, finalPrice(b))) + '</span>' +
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
        '<span class="bd-row__price">' + esc(moneyFrom(b, fin)) +
          (base > fin ? '<span class="bd-row__was">' + esc(moneyFrom(b, base)) + '</span>' : '') + '</span>' +
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

      /* 2026-09-01 撤除（墓碑）：qtyRow（名額／份數 與 販售上限 並排的 form-grid）。
         三段式重排（見下）把兩者拆進不同段——名額／份數是「支持者拿到什麼」的一部分
         （每一筆含幾份），販售上限是「怎麼賣」的供給設定。原本並排的理由（「最容易被
         當成同一件事，特別要分清楚」）由分段承擔：兩件事各在各的段落裡，比並排在
         同一列更說得清楚它們不是同一件事。 */

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
              '<span class="upload-tile__icon"><i data-lucide="photo-video" class="ztor-icon"></i></span>' +
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
      var chosen = tixIds(b);
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
      var contentFields = coverField + ticketsField +
        (SHARES ? (qtyField + itemsField) : (workField + qtyField + itemsField));

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

        /* ── 三段式分組（2026-09-01 使用者裁示重設計）────────────────────────
           2026-07-30 那次重排把順序理成「從輸入走到結果」，但七組欄位仍是一直排、
           沒有分組——身分、內容物、生意混在一起，讀的人得自己斷句。
           這次依三個問題分段，每段一個小標：
             ① 這是什麼方案      名稱＋一句話說明
             ② 支持者拿到什麼    名額/份數＋作品＋商品＋權益（票與封面也在這段）
             ③ 怎麼賣            販售上限＋套組優惠＋套組價
           連帶的兩個搬動：名額／份數離開「與販售上限並排」（它是內容的量，不是供給），
           販售上限搬到定價旁邊（上限與價格才是同一個問題的兩半——賣幾份、賣多少錢）。
           「從輸入走到結果」的大方向不變：定價仍在最後。 */
        '<div class="fc-bundle__body">' +
          '<div class="bd-group">' +
            '<h4 class="bd-group__title">' + esc(T('cpp.bd.g1')) + '</h4>' +
            '<div class="field">' +
              '<label class="field__label">' + esc(T('cpp.bd.name')) + ' <span class="field__req">*</span></label>' +
              '<input class="input" data-bd-f="name" value="' + esc(b.name) + '" placeholder="' + esc(T('cpp.bd.name.ph')) + '">' +
            '</div>' +
            '<div class="field">' +
              '<label class="field__label">' + esc(T('cpp.bd.desc')) + '</label>' +
              '<input class="input" data-bd-f="desc" value="' + esc(b.desc) + '" placeholder="' + esc(T('cpp.bd.desc.ph')) + '">' +
            '</div>' +
          '</div>' +

          '<div class="bd-group">' +
            '<h4 class="bd-group__title">' + esc(T('cpp.bd.g2')) + '</h4>' +
            contentFields +
            '<div class="field">' +
              '<div class="field__label">' + esc(T('cpp.bd.perks')) + ' <span class="text-sub">' + esc(T('cpp.bd.perks.sub')) + '</span></div>' +
              (b.perks.length ? perksHTML(b) : '') +
              '<button class="btn btn--outline btn--add fc-add-item" type="button" data-bd-perk-add>' + esc(T('cpp.bd.perk.add')) + '</button>' +
            '</div>' +
          '</div>' +

          '<div class="bd-group">' +
            '<h4 class="bd-group__title">' + esc(T('cpp.bd.g3')) + '</h4>' +
            availField +

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
      /* 分節分頁重新接線（SPLIT）：nav 跟著 innerHTML 一起重畫，舊實例隨舊節點消失；
         排在捲動位置還原之後，第一次定位才對得上還原後的位置。 */
      if (SPLIT && window.ZtorSectionTabs) window.ZtorSectionTabs.init(list);

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
      if (SPLIT) { syncSplit(card, b); return; }
      /* 分段版型的卡片沒有共用的摘要／價格節點（收合態根本是另一種 markup），
         就地同步的對象只有算式那兩個數字——其餘一律靠重畫。 */
      if (SECTIONS) {
        var baseEl = card.querySelector('[data-bd-calc-base]');
        if (baseEl) baseEl.textContent = moneyFrom(b, listPrice(b));
        /* 最終價現在有兩個落點（定價分卡的欄位、footer 的結果），兩顆都要更新——
           只取第一顆的話，另一顆會停在重畫當下的舊數字。 */
        card.querySelectorAll('[data-bd-calc-final]').forEach(function (el) {
          el.textContent = moneyFrom(b, finalPrice(b));
        });
        /* 售出上限的提示與紅框：打字當下就要跟著改，不重畫（重畫會踢掉游標）。 */
        var capMaxEl = card.querySelector('[data-bd-capmax]');
        if (capMaxEl) {
          capMaxEl.textContent = capMaxHint(b);
          capMaxEl.classList.toggle('fc-hint--over', capOver(b));
        }
        /* 票券成員（2026-09-21）：改整組張數時就地更新表尾、原價算式、每場預覽的票券原價——
           重畫會把正在打字的步進器連同游標一起換掉。 */
        var partsEl = card.querySelector('[data-bd-calc-parts]');
        if (partsEl) partsEl.textContent = calcPartsText(b);
        var footEl = card.querySelector('[data-bd-tix-foot]');
        if (footEl) footEl.textContent = tixFootText(b);
        if (getTickets) {
          perRows(b).forEach(function (r) {
            var vEl = card.querySelector('[data-bd-per-val="' + r.g.id + '"]');
            if (vEl) vEl.textContent = perValText(b, r);
            var sEl = card.querySelector('[data-bd-per-sub="' + r.g.id + '"]');
            if (sEl) sEl.textContent = tixLineText(b, r.incl.map(function (t) { return t.kind.name; }));
          });
          var wasFoot = card.querySelector('.bd-foot-price__was');
          if (wasFoot) wasFoot.textContent = money(listPrice(b));
        }
        var capEl = card.querySelector('[data-bd-f="cap"]');
        if (capEl) {
          if (capOver(b)) capEl.setAttribute('aria-invalid', 'true');
          else capEl.removeAttribute('aria-invalid');
        }
        /* 共創／預購的推導提示（2026-09-01 通用化）：名額池換算、上限說明、折扣上限
           都會隨名額／商品即時變，跟著就地同步、不重畫。 */
        var autoHintEl = card.querySelector('[data-bd-auto-hint]');
        if (autoHintEl) autoHintEl.textContent = autoHintText(b);
        var capHintEl = card.querySelector('[data-bd-cap-hint]');
        if (capHintEl) capHintEl.textContent = capHintText(b);
        var discHintEl = card.querySelector('[data-bd-discount-hint]');
        if (discHintEl) {
          discHintEl.textContent = discountHintText(b);
          discHintEl.classList.toggle('fc-hint--over', discountOver(b));
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
      var chosen = tixIds(b);
      function setTri(box, on, some) {
        if (!box) return;
        box.checked = on;
        box.indeterminate = !on && some;
      }
      var live = [];
      ticketKinds().forEach(function (k) {
        if (kindOn(b, k)) live = live.concat(k.ids);
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
      var chosen = tixIds(b);
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
      /* 分段版的收合列只帶 data-bd-open、上面那圈掃不到，價格與摘要沒人更新——
         外部注入的單價一改（項目詳情的預購單價欄），列上的數字就過期（2026-09-01 實測）。
         同樣就地改文字不整列重畫：列是可聚焦的按鈕，整列換掉會把鍵盤焦點踢掉。
         名稱不用同步——名稱只能在彈窗第 2 步改，而卡片開著時它的列不存在。 */
      if (SECTIONS) {
        list.querySelectorAll('[data-bd-open]').forEach(function (row) {
          var b = get(row.dataset.bdOpen);
          if (!b) return;
          var meta = row.querySelector('.bd-row__meta');
          if (meta) meta.textContent = summaryMeta(b);
          var price = row.querySelector('.bd-row__price');
          if (price) {
            var base = listPrice(b), fin = finalPrice(b);
            price.innerHTML = esc(moneyFrom(b, fin)) +
              (base > fin ? '<span class="bd-row__was">' + esc(moneyFrom(b, base)) + '</span>' : '');
          }
        });
      }
    }

    function renderResults(card, b, q) {
      var box = card.querySelector('[data-bd-results]');
      if (!box) return;
      var term = String(q || '').trim().toLowerCase();
      var taken = {};
      b.items.forEach(function (i) { taken[i.id] = true; });
      var pool = catalogue().filter(function (p) { return !taken[p.id]; });
      /* 空欄＝瀏覽模式（2026-09-01 使用者裁示「搜尋改成可瀏覽」）：點進欄位就先列全部商品，
         名稱旁帶分類。原本空欄直接把清單藏起來，等於「不記得商品名就找不到」——
         但目錄一共就幾十筆，先攤開讓人認，比逼人回想正確的字省。
         打了字再收斂成比對結果；上限一律 12 筆，容器自己會捲（max-height 264px）。 */
      var hits = (term
        ? pool.filter(function (p) { return p.name.toLowerCase().indexOf(term) >= 0; })
        : pool
      ).slice(0, 12);
      box.innerHTML =
        (!term && hits.length ? '<div class="fc-pick__empty">' + esc(T('cpp.bd.search.browse')) + '</div>' : '') +
        hits.map(function (p) {
          return '<button type="button" class="fc-pick__opt" data-bd-opt="' + esc(p.id) + '">' +
            (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy">' : '<span></span>') +
            '<span>' + esc(p.name) +
              (p.meta ? ' <span class="fc-pick__opt-price">' + esc(p.meta) + '</span>' : '') + '</span>' +
            '<span class="fc-pick__opt-price">' + (p.price ? '$' + esc(p.price) : '') + '</span>' +
          '</button>';
        }).join('') +
        (hits.length ? '' : '<div class="fc-pick__empty">' + esc(T('cpp.bd.search.none')) + '</div>') +
        /* 兩個出口並列（2026-09-01）：
           「建立新商品」＝開完整的建立商品流程（embed 彈窗，見 openCreateModal），
             建出來的是一件有定價、會進電子商店的真商品——這條路原本只有電子商店的
             組合包接了（create-bundle.html ?embed=1），募資套組一直是死路。
           「新增草稿項」＝還沒壓出來的黑膠：連定價都還沒有，先佔一列之後再補。
             有搜尋字時才出現（它的名字就是你打的字）。 */
        '<button type="button" class="fc-pick__opt" data-bd-opt="__create"><span></span>' +
          '<span>' + esc(T('cpp.bd.search.create')) + '</span><span></span></button>' +
        (term
          ? '<button type="button" class="fc-pick__opt" data-bd-opt="__new"><span></span>' +
              '<span>' + esc(T('cpp.bd.search.new').replace('{q}', q)) + '</span><span></span></button>'
          : '');
      box.hidden = false;
    }

    /* ── 就地建立商品（2026-09-01 使用者裁示）────────────────────────────
       嵌入完整的 create-product 流程（?embed=1），建立完成由 postMessage 回傳、
       直接加進正在編輯的那張套組。機制與電子商店組合包同一套
       （create-bundle.html 2026-06-17 起就有），本輪接進募資套組——原本搜不到商品
       只剩草稿項這條路，而草稿沒有定價、計價當 0，方案價會默默少算。

       彈窗動態建立：本編輯器掛在 5 個頁面上，與其要求每一頁都放一份 modal markup，
       不如自己長。外殼借 payout-modal 的 --embed 變體（消費頁都已載 payout-modal.css）。
       ⚠ 原型限制：嵌入頁建立的商品**不會**真的寫進 ZTOR_PRODUCTS（那是唯讀種子），
       所以它以 `new:` 前綴的 id 直接進 items——有名稱有定價、計價正確，
       但重新整理後不會出現在目錄裡（與草稿項同一級的示意行為，記 ASSUMPTIONS）。 */
    var createModal = null, createTarget = null;
    function openCreateModal(b) {
      createTarget = b;
      if (!createModal) {
        createModal = document.createElement('div');
        createModal.className = 'payout-modal';
        createModal.innerHTML =
          '<div class="payout-dialog payout-dialog--embed" role="dialog" aria-modal="true" aria-label="New product">' +
            '<iframe class="embed-frame" title="Create product"></iframe>' +
          '</div>';
        document.body.appendChild(createModal);
        createModal.addEventListener('click', function (e) {
          if (e.target === createModal) closeCreateModal();
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && createModal && !createModal.hidden) closeCreateModal();
        });
        window.addEventListener('message', function (e) {
          var d = (e && e.data) || {};
          if (d.type === 'cp:cancel') { closeCreateModal(); return; }
          if (d.type === 'cp:created' && createTarget) {
            var pr = d.product || {};
            var price = String(pr.price || '').replace(/[^0-9.]/g, '');
            createTarget.items.push({
              id: 'new:' + String(pr.name || 'product').toLowerCase().replace(/\s+/g, '-') + ':' + Date.now(),
              name: pr.name || '', img: '',
              meta: price ? '$' + price : '', price: price
            });
            closeCreateModal();
            render({ blur: true });
            onChange(BUNDLES);
          }
        });
      }
      createModal.querySelector('iframe').src = 'create-product.html?embed=1';
      createModal.hidden = false;
      document.body.classList.add('is-modal-open');
    }
    function closeCreateModal() {
      if (!createModal) return;
      createModal.hidden = true;
      document.body.classList.remove('is-modal-open');
      createModal.querySelector('iframe').src = 'about:blank';
      createTarget = null;
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
        /* SPLIT：名稱由內容自動建議，使用者打了字就不再覆蓋；清空回到自動。 */
        if (SPLIT && f === 'name') b.nameTouched = !!String(e.target.value).trim();
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
      /* SPLIT 的額外權益是一個 textarea、一行一項：拆行寫進 perks（空行留著讓游標好走，送出時濾掉）。 */
      if (e.target.hasAttribute('data-bd-perks')) {
        b.perks = String(e.target.value).split(/\n/);
        refreshAll(); onChange(BUNDLES);
        return;
      }
      /* 整組張數（2026-09-21 D296）：一組一個 n；不重畫，就地同步表尾／算式／上限提示／
         每場預覽（syncCard）。 */
      if (e.target.hasAttribute('data-bd-tix-qty')) {
        tixSetQty(b, e.target.value);
        refreshAll(); onChange(BUNDLES);
        return;
      }
      if (e.target.hasAttribute('data-bd-search')) {
        renderResults(card, b, e.target.value);
      }
    });

    /* 點進搜尋欄就開瀏覽清單（focusin 會冒泡，focus 不會）。 */
    list.addEventListener('focusin', function (e) {
      if (!e.target.hasAttribute || !e.target.hasAttribute('data-bd-search')) return;
      var card = e.target.closest('[data-bd-card]');
      var b = card && get(card.dataset.bdCard);
      if (b) renderResults(card, b, e.target.value);
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
          var kindsA = ticketKinds().filter(function (k) { return kindOn(ba, k); });
          var allIds = [];
          kindsA.forEach(function (k) { allIds = allIds.concat(k.ids); });
          if (e.target.checked) addIds(ba, allIds); else tixDrop(ba, allIds);
          render({ blur: true });
        }
        return;
      }
      /* 票券清單表的勾選（2026-09-21 D296）：勾＝把這個票種在每一場的票加進允許清單、
         取消＝整個票種移出。重畫是必要的：每場預覽與適用場次表都跟著變。 */
      var kc = e.target.closest('[data-bd-kind-check]');
      if (kc) {
        var cardK = e.target.closest('[data-bd-card]');
        var bk = cardK && get(cardK.dataset.bdCard);
        if (bk && isLocked(bk)) { kc.checked = !kc.checked; return; }
        var kk = kindRows().filter(function (x) { return x.id === kc.dataset.bdKindCheck; })[0];
        if (bk && kk) {
          if (kc.checked) tixAdd(bk, kk.ids); else tixDrop(bk, kk.ids);
          render({ blur: true });
        }
        return;
      }
      /* 整組張數欄清空或亂填時，離開欄位把畫面補回實際生效的值（同含作品份數的做法）。 */
      if (e.target.hasAttribute && e.target.hasAttribute('data-bd-tix-qty')) {
        var cardQ = e.target.closest('[data-bd-card]');
        var bq = cardQ && get(cardQ.dataset.bdCard);
        if (bq) {
          var fixedQ = tixQty(bq);
          if (String(e.target.value) !== String(fixedQ)) { e.target.value = fixedQ; if (window.ZStepper) window.ZStepper.sync(e.target.closest('.zstep')); }
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
          if (grp.checked) addIds(bg, ids); else tixDrop(bg, ids);
          render({ blur: true });
        }
        return;
      }
      var tk = e.target.closest('[data-bd-ticket]');
      if (tk) {
        var cardT = e.target.closest('[data-bd-card]');
        var bt = cardT && get(cardT.dataset.bdCard);
        if (bt) {
          var id = tk.dataset.bdTicket;
          if (tk.checked) addIds(bt, [id]); else tixDrop(bt, [id]);
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
          if (SPLIT) bo._snap = snapOf(bo);   /* 「取消」還原到打開時的樣子 */
          render({ blur: true, top: true });
        }
        return;
      }
      var card = e.target.closest('[data-bd-card]');
      if (!card) return;
      var b = get(card.dataset.bdCard);
      if (!b) return;

      /* ── SPLIT 專屬：取消（還原快照）、預覽卡的選擇器（只影響預覽） ─────── */
      if (SPLIT) {
        if (e.target.closest('[data-bd-cancel]')) { cancel(b); return; }
        var fs = e.target.closest('[data-bd-fan-sess]');
        if (fs) { var fo = fan(b); fo.session = fs.dataset.bdFanSess; fo.tier = null; syncSplit(card, b); return; }
        var ft = e.target.closest('[data-bd-fan-tier]');
        if (ft) { if (ft.disabled) return; var fo2 = fan(b); fo2.tier = fo2.tier === ft.dataset.bdFanTier ? null : ft.dataset.bdFanTier; syncSplit(card, b); return; }
        var fv = e.target.closest('[data-bd-fan-var]');
        if (fv) {
          if (fv.disabled) return;
          var fo3 = fan(b), pid = fv.dataset.bdFanVar, opt = fv.dataset.bdFanOpt, val = fv.dataset.bdFanVal;
          fo3.variants[pid] = fo3.variants[pid] || {};
          fo3.variants[pid][opt] = fo3.variants[pid][opt] === val ? null : val;
          syncSplit(card, b); return;
        }
      }
      /* ── 分段版型專屬的動作 ────────────────────────────────────────── */
      var scope = e.target.closest('[data-bd-scope]');
      if (scope) {
        if (scope.disabled) return;
        /* 換了對應方式，原本挑的票就不再成立（一個是挑「哪一場的哪一張」、
           一個是挑「哪一個票種」），清空重挑比留著讓人猜誠實。
           SPLIT 例外：表以票種為列、跨場一勾，兩種對應方式讀的是同一份允許清單，換模式不清。 */
        b.scope = scope.dataset.bdScope;
        if (!SPLIT) b.tickets = { tierIds: [], qty: tixQty(b) };   /* 清允許清單、張數留著（整組一個，與對應方式無關） */
        b.pickOpen = true;
        render({ blur: true });
        return;
      }
      /* 票種捷徑 chip（非表格版型的殘留路徑；分段版型的票種勾選改走 [data-bd-kind-check] 的 change）。 */
      var kind = e.target.closest('[data-bd-kind]');
      if (kind) {
        var k = ticketKinds().filter(function (x) { return x.id === kind.dataset.bdKind; })[0];
        if (k) {
          var allOn = k.ids.every(function (id) { return tixHas(b, id); });
          if (allOn) tixDrop(b, k.ids); else addIds(b, k.ids);
          render({ blur: true });
        }
        return;
      }
      if (e.target.closest('[data-bd-pickdone]')) { b.pickOpen = false; render({ blur: true }); return; }
      if (e.target.closest('[data-bd-pickopen]')) { b.pickOpen = true; render({ blur: true }); return; }
      if (e.target.closest('[data-bd-usesug]')) { b.name = suggestName(b); b.nameTouched = false; render({ blur: true }); return; }
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
        if (SPLIT) {
          if (gateOffFor(b)) return;
          /* 送出前把空行濾掉、名稱補上（沒改過就用建議名）。 */
          b.perks = b.perks.map(function (x) { return String(x || '').trim(); }).filter(Boolean);
          if (!b.nameTouched || !String(b.name).trim()) b.name = suggestName(b);
          delete b._snap; delete FAN[b.id];
          commit(b);
          return;
        }
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
      if (e.target.closest('[data-bd-close]')) { if (SPLIT) cancel(b); else close(b); return; }

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
        if (id === '__create') {
          openCreateModal(b);
          return;
        }
        if (id === '__new') {
          /* 目錄裡沒有＝還沒壓出來的黑膠。就地開一個草稿商品，仍然是一筆真的目錄列，
             只是狀態是草稿——不是退回自由文字。 */
          var q = card.querySelector('[data-bd-search]').value.trim();
          /* 草稿商品沒有定價（還沒壓出來的東西也還沒定價），price 留空＝計價時算 0。 */
          if (q) b.items.push({ id: 'draft:' + q.toLowerCase().replace(/\s+/g, '-'), name: q, img: '', meta: T('cpp.bd.item.draft'), price: '' });
        } else if (!b.items.some(function (it) { return it.id === id; })) {
          var p = catalogue().filter(function (x) { return x.id === id; })[0];
          if (p) b.items.push({ id: p.id, name: p.name, img: p.img, meta: p.price ? '$' + p.price : p.meta, price: p.price || '', stock: p.stock, variant: p.variant, options: p.options, variants: p.variants });
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
      var groups = ticketGroups();
      var kinds = {};
      tixIds(b).forEach(function (id) {
        var t = ticketById(id);
        if (t && t.kind) kinds[t.kind.id] = true;
      });
      var picked = Object.keys(kinds);
      /* 每場各一組但一個票種都沒挑（D293 起純商品組合也成立）：沒有場次可以展開，
         就當成一組收起來，不靜默生出 N 張空卡。 */
      if (b.scope !== 'per' || !picked.length || !groups.length) {
        if (!b.name) b.name = suggestName(b);
        b.pickOpen = false;
        b.fresh = false;
        b.collapsed = true;
        render({ blur: true });
        return;
      }
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
        copy.discountOn = b.discountOn;
        copy.avail = b.avail;
        copy.cap = b.cap;
        copy.lockSets = b.lockSets;
        copy.nameTouched = true;
        copy.items = b.items.slice();
        copy.perks = b.perks.slice();
        /* 每一組沿用同一份 `{ tierIds, qty }`（D296）：tierIds 對應到那一場的允許票種、張數同一個 n。 */
        copy.tickets = {
          tierIds: g.rows
            .filter(function (t) { return t.kind && picked.indexOf(t.kind.id) >= 0; })
            .map(function (t) { return t.id; }),
          qty: tixQty(b)
        };
        copy.pickOpen = false;
        copy.collapsed = true;
        copy.fresh = false;   /* 展開出來的是已送出的組，再點開要寫「編輯」不是「新增」 */
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
      var empty = !tixCount(b) && !b.items.length && !b.perks.length && !b.name && !b.desc;
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
      var nb = newBundle();
      /* 預帶（2026-09-21 D296，5.1.6.1 §4.6 F20）：`defaultAllTiers` 的活動變體新組合包預設
         「本活動全部票種都允許、張數 1」，創作者取消勾選來收窄。 */
      if (opts.defaultAllTiers && getTickets) {
        tixAdd(nb, (getTickets() || []).map(function (t) { return t.id; }));
      }
      BUNDLES.push(nb);
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
      if (open) { e.stopPropagation(); if (SPLIT) cancel(open); else close(open); }
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

    var instance = {
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
      ticketCount: ticketCount,   /* 活動變體：這一組每套含幾張票（＝整組張數 n；沒勾票種＝0） */
      tierCount: tierCount,       /* 活動變體：允許票種有幾種 */
      ticketLine: tixLineText,    /* 活動變體：「VIP／搖滾區 任選 × n」一句（Review／右軌共用） */
      sellableSets: sellableSets, /* SPLIT：可售套數（鎖定／成員硬頂／限量上限取小；沒有量可算＝null） */
      suggestName: suggestName,
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
    /* 掛載登記（2026-09-21）：消費頁多半把實例收在自己的閉包裡，cheat code／驗收腳本要餵種子
       （例如「已售出 3 組」的鎖定態）時拿不到；登記在模組上，不改頁面。 */
    MOUNTED.push(instance);
    return instance;
  }

  var MOUNTED = [];
  window.ZtorBundleEditor = { mount: mount, catalogue: catalogue, num: num, mounted: MOUNTED };
})();
