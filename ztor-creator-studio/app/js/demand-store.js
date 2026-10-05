/* demand-store.js · 需求看板（D360）的示範資料與算法（2026-10-05）
   ------------------------------------------------------------------
   給頁面用（demand-board.html、商品細節頁的商品層需求入口）。頁面不必讀實作，看這段就夠。

   ── 規格依據 ────────────────────────────────────────────────────
   算法的唯一定義處是 documents/0-設計規格書.md §7.17「需求估算」；頁面欄位見 documents/5.1.5.16-需求看板.md。
   本檔只落地算法與示範資料，不新增產品規則。標〔產品待確認〕的地方都是上游推定值或呈現假設
   （§8.30 的 25 項），畫面上不得宣稱定案。

   ── 載入與依賴 ──────────────────────────────────────────────────
   <script src="js/apparel-taxonomy.js?v=r2.2"></script>   先載（大類與次分類的名稱、標準尺寸清單）
   <script src="js/demand-store.js?v=r2.2"></script>        掛 window.ztorDemand
   沒載 apparel-taxonomy.js 時仍可算，只是名稱 fallback 成 key、標準尺寸用內建清單。
   不依賴 products-store.js（商品名稱優先讀 ProductsStore，沒有就用本檔 fallback 名）。

   ── 對外 API（全部同步）─────────────────────────────────────────
   filter（所有查詢共用，欄位皆選填）
     { productId, category, sub, audience, persona, rawSizes }
       productId  單一商品；與商品細節頁彈窗同一口徑（見 productSlice）
       category   大類 key（tops／outerwear…，見 apparel-taxonomy.js）
       sub        次分類 key（tshirt／hoodie…）
       audience   men｜women｜unisex｜kids；不給＝各適用對象混算（結果 mixedAudience:true，
                  規格要求尺寸占比不跨適用對象混算，頁面應預設選一個或分組呈現）
       persona    'default'｜'nick'｜'all'；不給＝目前 persona（讀 window.ztorPersonaId()，userB 沿用 default）
       rawSizes   true＝照實顯示賣家自行輸入的尺寸（不歸「其他尺寸」）。單一商品篩選時要不要照實顯示
                  〔產品待確認〕§8.30 第 11 項，預設 false（歸其他尺寸）；productSlice 固定 true（規格明定彈窗照實顯示）

   opts.demo（markets／market／productSlice／filterOptions 都收；頁面狀態示範，2026-10-05）
     'empty'     資料視為空（範圍內沒有任何需求紀錄）
     'no-region' 每筆資料清空國家與城市，全歸「未提供地區」（前台還沒收國家城市時的樣子）
     不給＝照示範資料。compute、參考資料查詢、filterOptions 共用同一份「依 demo 轉換後的資料」，口徑不會分岔。
     只動資料取用，算法公式與參數不受影響。

   ztorDemand.markets(filter, opts) → 結果物件
     {
       state:    'empty'（範圍內沒有需求）｜'no-region'（有需求但全無國家）｜'has-data',
       mixedAudience: bool,
       params:   { periodDays, minSample, … }（本次用的參數）,
       sizes:    ['XS','S','M',…,'other']  範圍內出現的尺寸欄，標準尺寸依序在前，'other'（其他尺寸）在最後,
       summary:  { total, marketCount, unspecifiedShare }   總需求量、涵蓋國家數、未提供地區占比（0–1）,
       rows:     [市場列…]   國家層，依需求指數高到低，「未提供地區」排最後
     }
     市場列：
       key        'TW'（國家）｜'TW|Taipei'（城市）｜'_'（未提供地區）
       level      'country'｜'city'
       country    ISO 兩碼，'' ＝未提供地區
       city       城市（國家列為 ''）
       demand     統計期間需求量（件，已乘管道權重）；recent／prev＝近 90 天／前 90 天
       index      需求指數 0–100 整數；未提供地區為 null（頁面顯示「—」，見下方呈現假設）
       growth     成長係數（已套上下限；前期為 0 取 1）
       status     'ok'（本身樣本夠）｜'reference'（樣本不足、改參考同類商品）｜'insufficient'（資料不足）
       reference  status==='reference' 時 { level:'sub'|'category', key, label }；其餘 null
       sizeRows   [{ size, demand, share(0–1), suggested, planned, gap, daysToSellOut }]
                  suggested 在 insufficient 時為 null；需求量 demand 永遠是該市場該尺寸「自己的」件數
       suggestedTotal  各尺寸建議生產量加總（insufficient 為 null）
       planned / gap / daysToSellOut   市場層的計畫生產量、差距、預測售罄天數（沒填或填 0 → null）
                  gap 是比例（0.38＝多 38%，頁面自己轉百分比；正＝建議多於計畫）；daysToSellOut 取到小數 1 位
       cities     [同結構的城市列]（國家下有城市紀錄才有；未提供地區與沒有城市的國家為 []）
     sizeRows[i].planned／gap／daysToSellOut：只有填到「市場＋尺寸層」才有值（規格：填到尺寸層才顯示尺寸層差距）

   ztorDemand.market(filter, key)         → 單一市場列（國家或城市 key），找不到回 null
   ztorDemand.productSlice(productId)     → { product:{id,name,category,sub,audience}, … 同 markets() 結果 }
                                            商品細節頁彈窗用；照實顯示該商品所有尺寸（含自行輸入）
   ztorDemand.filterOptions(filter)       → { categories:[{key,count}], subs:[{key,category,count}],
                                              audiences:[key…], products:[{id,name,category,sub,audience}] }
                                            只列範圍內「有需求」的值（5.1.5.16 F2 其他狀態）
   ztorDemand.products(filter)            → 示範商品清單（同 filterOptions().products，可不經篩選）
   ztorDemand.PARAMS                      → 參數常數（凍結物件）；ztorDemand.params() 回傳複本
   ztorDemand.standardSizes()             → ['XXS','XS','S','M','L','XL','XXL']；ztorDemand.OTHER_SIZE ＝ 'other'
   ztorDemand.countryName(code, lang)     → 國家名稱（lang 'en'|'zh'）；'' 回傳 ''（未提供地區由頁面走 i18n）

   計畫生產量（賣家填，選填；存記憶體並盡力同步 localStorage 'ztor.demand.planned'，失敗不影響使用）
   ztorDemand.getPlanned(filter, marketKey, size) → number | null      size 省略／null＝市場層
   ztorDemand.setPlanned(filter, marketKey, size, n) → bool
        n 為非負整數；null／'' ＝清除；負數或非整數回 false 且不儲存（驗證訊息由頁面走主規格 §6.6）
   ztorDemand.clearPlanned(filter)        → 清掉該篩選範圍的全部計畫生產量；不給 filter＝全部清掉
   計畫生產量綁定「篩選範圍」（scopeKey＝商品／大類／次分類／適用對象／persona 的組合）。跨多商品的聚合範圍
   能不能填、怎麼存〔產品待確認〕§8.30 第 14 項；本檔先照範圍綁定、聚合範圍也可填。只供看板對照，不連動庫存或生產單。

   ── 算法（§7.17，對照用；PARAMS 見下）───────────────────────────
   需求量     ＝ Σ（件數 × 管道權重），統計期間 180 天 ＝ 近 90 天 ＋ 前 90 天；已撤銷（Void）的品項資料裡本來就不算
   尺寸占比   ＝ 該尺寸需求量 ÷ 該市場全部尺寸需求量
   需求指數   ＝ 該市場需求量 ÷ 同層級最高市場需求量 × 100，四捨五入；國家比國家、城市比同國家的其他城市
   成長係數   ＝ 近 90 天需求量 ÷ 前 90 天需求量；前 90 天為 0 取 1；再夾在 [0.5, 2.0]
   建議生產量 ＝ round(市場需求量 × 尺寸占比 × 成長係數)；市場合計 ＝ 各尺寸之和
   差距       ＝（建議生產量 − 計畫生產量）÷ 計畫生產量；沒填或 0 不顯示
   日均需求量 ＝ 需求量 ÷ 統計期間天數 × 成長係數；預測售罄天數 ＝ 計畫生產量 ÷ 日均需求量
   資料不足   ＝ 市場需求量 < 最少樣本時，依序拿「同次分類 → 同大類」在該市場的其他商品當參考：
                尺寸占比、成長係數用參考資料算，需求量基數改成「參考資料每件商品的平均需求量」
                （範圍內有幾件商品就乘幾件）；參考資料自己也不到最少樣本就往上一層，兩層都不足 → 'insufficient'。
                參考資料＝同層級、同適用對象、「不在目前篩選範圍內」的商品，這個口徑〔產品待確認〕（§7.17 沒寫是否含本身）。

   ── 呈現假設（〔產品待確認〕，要記入 ASSUMPTIONS）────────────────
   1. 「未提供地區」是否參與需求指數〔產品待確認〕（§8.30 第 25 項）：本檔實作成「不參與同層級最高市場的比較、
      自己的指數為 null」，頁面顯示「—」。它仍計入總量、尺寸占比與建議生產量（規格明定照常計入）。
   2. 國家／城市層：城市列只在資料有記錄時出現；同國家裡「沒有城市」的紀錄只計入國家列，不另立「未提供城市」列。
   3. 示範資料是獨立的彙總量（假設前台已上線、訂單多數有國家與城市），不從 orders-store 的 12 筆訂單推導。
   4. 管道權重：訂單與組合包＝1（§7.17）；其他管道的件數即使出現在資料裡，權重未定義＝0、不進統計（第一期之外的管道）。
   5. 鞋類（US 8…）與童裝、內衣是否各用一套尺寸標準清單〔產品待確認〕（§8.30 第 7 項）：示範資料不放鞋類。
   6. 沒有尺寸選項的商品（帽、毛帽）不在看板範圍〔產品待確認〕（§8.30 第 13 項）：示範資料不放。
   7. 賣家能否調整算法參數〔產品待確認〕（§8.30 第 5 項）：本檔只提供 markets(filter, { params }) 覆寫入口供原型試算，
      不提供賣家端設定介面。 */
(function () {
  'use strict';

  /* ── 參數（集中成常數；全部〔產品待確認〕，上游推定值，§7.17「參數預設值」、§8.30 第 4 項）── */
  var PARAMS = Object.freeze({
    periodDays: 180,          /* 統計期間 〔產品待確認〕 */
    compareDays: 90,          /* 成長係數：近 90 天對前 90 天 〔產品待確認〕 */
    growthMin: 0.5,           /* 成長係數下限 〔產品待確認〕 */
    growthMax: 2.0,           /* 成長係數上限 〔產品待確認〕 */
    minSample: 30,            /* 最少樣本（件）〔產品待確認〕 */
    channelWeights: Object.freeze({ order: 1, bundle: 1 })   /* 訂單與組合包權重為 1（已定案）；其他管道未定＝不計 */
  });
  var OTHER = 'other';        /* 「其他尺寸」：賣家自行輸入、不在標準清單的尺寸，跨商品合併時歸這一組（已定案） */
  var UNSPEC = '_';           /* 「未提供地區」的 market key */

  var A = window.ztorApparel || null;
  var STD_SIZES = A ? A.sizes.standard.slice() : ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  function normSize(v) { return String(v == null ? '' : v).replace(/\s+/g, '').toUpperCase(); }
  function canonSize(v) {
    var n = normSize(v);
    for (var i = 0; i < STD_SIZES.length; i++) if (STD_SIZES[i] === n) return STD_SIZES[i];
    return String(v).trim();
  }
  function isStd(v) { return STD_SIZES.indexOf(canonSize(v)) >= 0; }

  var COUNTRIES = {
    TW: { en: 'Taiwan', zh: '台灣' }, JP: { en: 'Japan', zh: '日本' }, TH: { en: 'Thailand', zh: '泰國' },
    US: { en: 'United States', zh: '美國' }, HK: { en: 'Hong Kong', zh: '香港' }, PH: { en: 'Philippines', zh: '菲律賓' },
    SG: { en: 'Singapore', zh: '新加坡' }, MY: { en: 'Malaysia', zh: '馬來西亞' }
  };

  /* ── 示範商品（category／sub／audience 與 products-store 的 D360 示範資料一致）────── */
  var PRODUCTS = {
    tee:   { persona: 'default', name: '九龍夜行 紀念 T 恤', category: 'tops', sub: 'tshirt', audience: 'unisex' },
    hoodie:{ persona: 'default', name: '九龍夜行 連帽外套', category: 'tops', sub: 'hoodie', audience: 'unisex' },
    jacket:{ persona: 'default', name: '九龍夜行 舞台外套 復刻版', category: 'outerwear', sub: 'jacket', audience: 'men' },
    'wy-26ms-tshirt-white': { persona: 'nick', name: '26MS T-Shirt (白)', category: 'tops', sub: 'tshirt', audience: 'unisex' },
    'wy-24ce-tee':          { persona: 'nick', name: 'WYAGL T-SHIRT', category: 'tops', sub: 'tshirt', audience: 'unisex' },
    'wy-26ms-tshirt-red':   { persona: 'nick', name: '26MS T-Shirt (紅)', category: 'tops', sub: 'tshirt', audience: 'unisex' },
    'wy-26ms-hoodie':       { persona: 'nick', name: '26MS Hoodie', category: 'tops', sub: 'hoodie', audience: 'unisex' },
    'wy-bundle-cargo-pants':{ persona: 'nick', name: '祝你好命 束口工裝褲', category: 'bottoms', sub: 'trousers', audience: 'men' }
  };

  /* ── 示範需求資料 ─────────────────────────────────────────────────
     每列：[商品 id, 國家 ISO 兩碼（'' ＝未提供地區）, 城市（'' ＝只記到國家）, '尺寸:近90天/前90天 …', 管道（省略＝'order'）]
     件數是「已排除 Void 的件」。bundle 列示範組合包管道也計入（權重 1）。
     設計用意（default persona）：
       tee    TW／JP／TH／US 樣本充足；HK 無城市；PH 只有 10 件 → 樣本不足，找不到同次分類其他商品，改參考同大類（上衣）的 hoodie
       hoodie TH 只有 26 件 → 樣本不足，同次分類無他品，改參考同大類的 tee；TW 有賣家自行輸入的 3XL（歸其他尺寸）
       jacket TW 只有 24 件 → 樣本不足，同次分類、同大類都沒有別的商品 → 資料不足
     nick persona：tshirt-red 是新品、樣本不足 → 參考同次分類（白 T、WYAGL T）。 */
  var RAW = [
    /* tee（default） */
    ['tee', 'TW', 'Taipei',   'S:14/12 M:30/24 L:22/20 XL:8/8'],
    ['tee', 'TW', 'Taichung', 'S:4/3 M:9/8 L:7/6 XL:2/2'],
    ['tee', 'JP', 'Tokyo',    'S:26/18 M:30/22 L:10/9 XL:2/2'],
    ['tee', 'JP', 'Osaka',    'S:8/5 M:9/6 L:3/3 XL:1/0'],
    ['tee', 'TH', 'Bangkok',  'S:30/16 M:24/18 L:8/6 XL:2/1'],
    ['tee', 'US', 'Los Angeles', 'S:4/6 M:10/12 L:18/16 XL:12/10'],
    ['tee', 'US', 'New York', 'M:6/5 L:9/8 XL:6/6'],
    ['tee', 'HK', '',         'S:6/5 M:10/10 L:7/6 XL:2/2'],
    ['tee', 'PH', 'Manila',   'S:3/0 M:4/1 L:2/0'],
    ['tee', '',   '',         'S:10/8 M:18/15 L:12/11 XL:3/3 Free Size:2/1'],
    /* hoodie（default） */
    ['hoodie', 'TW', 'Taipei', 'S:5/6 M:16/14 L:14/12 3XL:3/2'],
    ['hoodie', 'TW', 'Taipei', 'M:4/3', 'bundle'],
    ['hoodie', 'JP', 'Tokyo',  'S:12/6 M:18/10 L:7/4'],
    ['hoodie', 'TH', 'Bangkok','S:3/4 M:6/6 L:4/3'],
    ['hoodie', 'US', 'Los Angeles', 'S:2/3 M:5/6 L:9/8'],
    ['hoodie', 'PH', 'Manila', 'S:6/2 M:12/6 L:14/8'],
    ['hoodie', '',   '',       'S:4/3 M:8/7 L:6/6'],
    /* jacket（default） */
    ['jacket', 'TW', 'Taipei', 'S:2/2 M:6/5 L:5/4'],
    ['jacket', 'JP', 'Tokyo',  'S:4/3 M:9/7 L:7/5'],
    ['jacket', 'US', 'Los Angeles', 'S:2/1 M:8/6 L:11/9'],
    ['jacket', '',   '',       'M:3/2 L:2/2'],
    /* nick persona */
    ['wy-26ms-tshirt-white', 'TW', 'Taipei',   'M:20/10 L:26/14 XL:10/8'],
    ['wy-26ms-tshirt-white', 'TW', 'Kaohsiung','M:6/4 L:8/5 XL:3/2'],
    ['wy-26ms-tshirt-white', 'HK', '',         'M:12/6 L:10/5 XL:4/2'],
    ['wy-26ms-tshirt-white', 'JP', 'Tokyo',    'M:8/4 L:7/5 XL:2/1'],
    ['wy-24ce-tee', 'TW', 'Taipei', 'M:16/12 L:20/14 XL:8/6'],
    ['wy-24ce-tee', 'HK', '',       'M:8/6 L:9/6 XL:3/2'],
    ['wy-24ce-tee', 'SG', '',       'M:9/5 L:8/6 XL:2/2'],
    ['wy-26ms-tshirt-red', 'TW', 'Taipei', 'M:3/0 L:4/0 XL:1/0'],
    ['wy-26ms-tshirt-red', 'HK', '',       'M:6/0 L:7/0 XL:2/0'],
    ['wy-26ms-hoodie', 'TW', 'Taipei', 'M:6/4 L:8/6 XL:4/3'],
    ['wy-26ms-hoodie', 'HK', '',       'M:5/3 L:6/4 XL:2/1'],
    ['wy-bundle-cargo-pants', 'TW', 'Taipei', 'S:3/2 M:8/6 L:10/8 XL:4/3'],
    ['wy-bundle-cargo-pants', 'JP', 'Tokyo',  'S:5/3 M:8/5 L:6/4 XL:1/1'],
    ['wy-bundle-cargo-pants', '',   '',       'M:3/2 L:3/2']
  ];

  var FACTS = [];
  RAW.forEach(function (row) {
    var ch = row[4] || 'order';
    /* 尺寸名可含空白（Free Size），所以用 ' ' 切 token 後，從右邊認 :n/n */
    var toks = row[3].split(/\s+/), cur = '';
    var parts = [];
    toks.forEach(function (t) {
      var m = /^(.*):(\d+)\/(\d+)$/.exec(t);
      if (m) { parts.push({ size: (cur + ' ' + m[1]).trim(), r: +m[2], v: +m[3] }); cur = ''; }
      else cur = (cur + ' ' + t).trim();
    });
    parts.forEach(function (p) {
      FACTS.push({ pid: row[0], cc: row[1], city: row[2], size: canonSize(p.size), r: p.r, v: p.v, ch: ch });
    });
  });

  /* 頁面狀態示範（opts.demo）：在資料取用處一次轉換，後面所有查詢都吃轉換後的同一份 */
  var FACTS_NO_REGION = FACTS.map(function (f) {
    return { pid: f.pid, cc: '', city: '', size: f.size, r: f.r, v: f.v, ch: f.ch };
  });
  function factsFor(opts) {
    var d = opts && opts.demo;
    if (d === 'empty') return [];
    if (d === 'no-region') return FACTS_NO_REGION;
    return FACTS;
  }

  /* ── 工具 ────────────────────────────────────────────────────── */
  function currentPersona() {
    var p = 'default';
    if (typeof window.ztorPersonaId === 'function') { try { p = window.ztorPersonaId(); } catch (_) {} }
    return p === 'nick' ? 'nick' : 'default';
  }
  function productName(id) {
    try {
      if (window.ProductsStore && window.ProductsStore.all) {
        var rec = window.ProductsStore.all()[id];
        if (rec && rec.name) return rec.name;
      }
    } catch (_) {}
    return PRODUCTS[id] ? PRODUCTS[id].name : id;
  }
  function labelOf(key) { return A ? A.label(key, 'en') : key; }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  function normFilter(f) {
    f = f || {};
    return {
      productId: f.productId || '', category: f.category || '', sub: f.sub || '', audience: f.audience || '',
      persona: f.persona || currentPersona(), rawSizes: !!f.rawSizes
    };
  }
  function scopeKey(f) {
    var n = normFilter(f);
    return [n.persona, n.productId, n.category, n.sub, n.audience].join('/');
  }
  function inScope(pid, n) {
    var p = PRODUCTS[pid];
    if (!p) return false;
    if (n.persona !== 'all' && p.persona !== n.persona) return false;
    if (n.productId && pid !== n.productId) return false;
    if (n.category && p.category !== n.category) return false;
    if (n.sub && p.sub !== n.sub) return false;
    if (n.audience && p.audience !== n.audience) return false;
    return true;
  }

  /* 一組事實 → 需求量、近／前 90 天、各尺寸（尺寸歸桶：rawSizes 或標準尺寸保持原樣，其餘歸 OTHER） */
  function sumFacts(list, P, raw) {
    var out = { D: 0, R: 0, V: 0, sizes: {}, pids: {} };
    list.forEach(function (f) {
      var w = P.channelWeights[f.ch];
      if (!w) return;                          /* 未定義權重的管道不進統計 */
      var r = f.r * w, v = f.v * w, d = r + v;
      var key = (raw || isStd(f.size)) ? f.size : OTHER;
      var b = out.sizes[key] || (out.sizes[key] = { d: 0 });
      b.d += d;
      out.D += d; out.R += r; out.V += v;
      if (d > 0) out.pids[f.pid] = true;
    });
    return out;
  }
  /* 成長係數：前期為 0 取 1，再套上下限 */
  function growthOf(R, V, P) { return V === 0 ? 1 : clamp(R / V, P.growthMin, P.growthMax); }

  function sizeCols(keys, raw) {
    var std = STD_SIZES.filter(function (s) { return keys.indexOf(s) >= 0; });
    var rest = keys.filter(function (k) { return std.indexOf(k) < 0 && k !== OTHER; }).sort();
    var cols = std.concat(rest);
    if (keys.indexOf(OTHER) >= 0) cols.push(OTHER);
    return cols;
  }

  /* ── 計畫生產量（記憶體＋localStorage，try/catch；綁篩選範圍）──────── */
  var LS_KEY = 'ztor.demand.planned';
  var PLAN = {};
  try { var raw0 = window.localStorage && window.localStorage.getItem(LS_KEY); if (raw0) PLAN = JSON.parse(raw0) || {}; } catch (_) { PLAN = {}; }
  function savePlan() { try { window.localStorage.setItem(LS_KEY, JSON.stringify(PLAN)); } catch (_) {} }
  function planSlot(size) { return size == null || size === '' ? '*' : String(size); }
  function getPlanned(filter, marketKey, size) {
    var s = PLAN[scopeKey(filter)];
    var v = s ? s[marketKey + '#' + planSlot(size)] : undefined;
    return typeof v === 'number' ? v : null;
  }
  function setPlanned(filter, marketKey, size, n) {
    var sk = scopeKey(filter), slot = marketKey + '#' + planSlot(size);
    if (n == null || n === '') {
      if (PLAN[sk]) { delete PLAN[sk][slot]; if (!Object.keys(PLAN[sk]).length) delete PLAN[sk]; }
      savePlan(); return true;
    }
    var num = Number(n);
    if (!isFinite(num) || num < 0 || Math.floor(num) !== num) return false;
    (PLAN[sk] || (PLAN[sk] = {}))[slot] = num;
    savePlan(); return true;
  }
  function clearPlanned(filter) {
    if (filter === undefined) PLAN = {}; else delete PLAN[scopeKey(filter)];
    savePlan();
  }

  /* ── 核心：算一個範圍的所有市場 ─────────────────────────────── */
  function compute(filter, opts) {
    var n = normFilter(filter);
    var P = Object.assign({}, PARAMS, (opts && opts.params) || {});
    var raw = n.rawSizes;
    var scopeIds = Object.keys(PRODUCTS).filter(function (id) { return inScope(id, n); });
    var scopeSet = {}; scopeIds.forEach(function (id) { scopeSet[id] = true; });
    var SRC = factsFor(opts);
    var facts = SRC.filter(function (f) { return scopeSet[f.pid]; });

    /* 參考層級（§7.17「新商品與資料不足」）：單一商品→同次分類、同大類；次分類篩選→同大類；其餘沒有 */
    var levels = [];
    var anchor = n.productId ? PRODUCTS[n.productId] : null;
    if (anchor) levels = [{ level: 'sub', key: anchor.sub }, { level: 'category', key: anchor.category }];
    else if (n.sub && PRODUCTS[scopeIds[0]]) levels = [{ level: 'category', key: PRODUCTS[scopeIds[0]].category }];
    var audienceForRef = n.audience || (anchor ? anchor.audience : '');
    function refFacts(lv, cc, city) {
      return SRC.filter(function (f) {
        var p = PRODUCTS[f.pid];
        if (!p || scopeSet[f.pid]) return false;                         /* 參考＝不在目前範圍內的商品 */
        if (n.persona !== 'all' && p.persona !== n.persona) return false;
        if (audienceForRef && p.audience !== audienceForRef) return false;
        if ((lv.level === 'sub' ? p.sub : p.category) !== lv.key) return false;
        return f.cc === cc && (city === null || f.city === city);
      });
    }

    var allKeys = {};
    function build(cc, city, list) {
      var st = sumFacts(list, P, raw);
      Object.keys(st.sizes).forEach(function (k) { allKeys[k] = true; });
      var growth = growthOf(st.R, st.V, P);
      var status = 'ok', ref = null, basis = st, g = growth, base = st.D;
      if (st.D < P.minSample) {
        status = 'insufficient';
        for (var i = 0; i < levels.length; i++) {
          var rst = sumFacts(refFacts(levels[i], cc, city), P, raw);
          if (rst.D >= P.minSample) {
            var nProd = Object.keys(rst.pids).length || 1;
            status = 'reference';
            ref = { level: levels[i].level, key: levels[i].key, label: labelOf(levels[i].key) };
            basis = rst; g = growthOf(rst.R, rst.V, P);
            base = (rst.D / nProd) * Math.max(1, scopeIds.length);        /* 參考資料每件商品的平均需求量 × 範圍內商品數 */
            Object.keys(rst.sizes).forEach(function (k) { allKeys[k] = true; });
            break;
          }
        }
      }
      return { st: st, growth: growth, status: status, ref: ref, basis: basis, g: g, base: base };
    }
    var planKey = scopeKey(n);
    function finish(key, level, cc, city, b) {
      var sizesOwn = b.st.sizes, sizesBasis = b.basis.sizes;
      var sizeKeys = Object.keys(b.status === 'ok' ? sizesOwn : Object.assign({}, sizesBasis, sizesOwn));
      var cols = sizeCols(sizeKeys, raw);
      var P_ = b.status === 'insufficient' ? null : b.base;                /* 建議生產量的基數 */
      var daily = P_ == null ? null : P_ / P.periodDays * b.g;
      var rows = cols.map(function (sz) {
        var own = sizesOwn[sz] ? sizesOwn[sz].d : 0;
        var shareBasis = b.basis.D ? ((sizesBasis[sz] ? sizesBasis[sz].d : 0) / b.basis.D) : 0;
        var shareOwn = b.st.D ? own / b.st.D : 0;
        var share = b.status === 'reference' ? shareBasis : shareOwn;      /* 尺寸占比：參考時用參考資料的占比 */
        var suggested = P_ == null ? null : Math.round(P_ * share * b.g);
        var pl = getPlanned(n, key, sz);
        var planned = pl > 0 ? pl : null;
        return {
          size: sz, demand: own, share: share, suggested: suggested,
          planned: pl, gap: (planned && suggested != null) ? (suggested - planned) / planned : null,
          daysToSellOut: (planned && daily != null && daily * share > 0) ? Math.round(planned / (daily * share) * 10) / 10 : null
        };
      });
      var sugTotal = P_ == null ? null : rows.reduce(function (a, r) { return a + r.suggested; }, 0);
      var pm = getPlanned(n, key, null);
      var plannedM = pm > 0 ? pm : null;
      return {
        key: key, level: level, country: cc, city: city || '',
        demand: b.st.D, recent: b.st.R, prev: b.st.V, index: null, growth: b.g,
        status: b.status, reference: b.ref, sizeRows: rows, suggestedTotal: sugTotal,
        planned: pm, gap: (plannedM && sugTotal != null) ? (sugTotal - plannedM) / plannedM : null,
        daysToSellOut: (plannedM && daily != null && daily > 0) ? Math.round(plannedM / daily * 10) / 10 : null,
        cities: []
      };
    }

    /* 分國家、再分城市 */
    var byCountry = {}, order = [];
    facts.forEach(function (f) {
      if (!byCountry[f.cc]) { byCountry[f.cc] = []; order.push(f.cc); }
      byCountry[f.cc].push(f);
    });
    var rowsOut = order.map(function (cc) {
      var list = byCountry[cc];
      var row = finish(cc || UNSPEC, 'country', cc, '', build(cc, null, list));
      if (cc) {
        var byCity = {}, cityOrder = [];
        list.forEach(function (f) { if (f.city) { if (!byCity[f.city]) { byCity[f.city] = []; cityOrder.push(f.city); } byCity[f.city].push(f); } });
        row.cities = cityOrder.map(function (ct) { return finish(cc + '|' + ct, 'city', cc, ct, build(cc, ct, byCity[ct])); });
        var maxCity = row.cities.reduce(function (m, c) { return Math.max(m, c.demand); }, 0);
        row.cities.forEach(function (c) { c.index = maxCity > 0 ? Math.round(c.demand / maxCity * 100) : null; });
        row.cities.sort(function (a, b) { return b.demand - a.demand; });
      }
      return row;
    });
    /* 需求指數：國家層；「未提供地區」不參與最高市場、指數為 null（呈現假設，見檔頭） */
    var maxCountry = rowsOut.reduce(function (m, r) { return r.country ? Math.max(m, r.demand) : m; }, 0);
    rowsOut.forEach(function (r) { r.index = (r.country && maxCountry > 0) ? Math.round(r.demand / maxCountry * 100) : null; });
    rowsOut.sort(function (a, b) {
      if (!a.country !== !b.country) return a.country ? -1 : 1;           /* 未提供地區排最後 */
      return b.demand - a.demand;
    });

    var total = rowsOut.reduce(function (a, r) { return a + r.demand; }, 0);
    var unspec = rowsOut.filter(function (r) { return !r.country; })[0];
    var regional = rowsOut.filter(function (r) { return r.country && r.demand > 0; });
    var audSet = {}; scopeIds.forEach(function (id) { audSet[PRODUCTS[id].audience] = true; });
    return {
      state: total === 0 ? 'empty' : (regional.length ? 'has-data' : 'no-region'),
      mixedAudience: Object.keys(audSet).length > 1,
      params: P,
      sizes: sizeCols(Object.keys(allKeys), raw),
      summary: { total: total, marketCount: regional.length, unspecifiedShare: total ? (unspec ? unspec.demand : 0) / total : 0 },
      rows: rowsOut
    };
  }

  function findMarket(res, key) {
    for (var i = 0; i < res.rows.length; i++) {
      if (res.rows[i].key === key) return res.rows[i];
      for (var j = 0; j < res.rows[i].cities.length; j++) if (res.rows[i].cities[j].key === key) return res.rows[i].cities[j];
    }
    return null;
  }

  function productsList(filter) {
    var n = normFilter(filter);
    n.productId = '';
    return Object.keys(PRODUCTS).filter(function (id) { return inScope(id, n); }).map(function (id) {
      var p = PRODUCTS[id];
      return { id: id, name: productName(id), category: p.category, sub: p.sub, audience: p.audience };
    });
  }

  window.ztorDemand = {
    PARAMS: PARAMS,
    OTHER_SIZE: OTHER,
    params: function () { return Object.assign({}, PARAMS, { channelWeights: Object.assign({}, PARAMS.channelWeights) }); },
    standardSizes: function () { return STD_SIZES.slice(); },
    countryName: function (code, lang) {
      if (!code) return '';
      var c = COUNTRIES[code];
      return c ? (lang === 'zh' ? c.zh : c.en) : code;
    },
    markets: function (filter, opts) { return compute(filter, opts); },
    market: function (filter, key, opts) { return findMarket(compute(filter, opts), key); },
    productSlice: function (productId, opts) {
      var p = PRODUCTS[productId] || {};
      /* persona 取商品自己的，參考資料才不會跨 persona；與看板在同一 persona 下篩選同一商品時 scopeKey 相同（計畫生產量共用） */
      var res = compute({ productId: productId, rawSizes: true, persona: p.persona || currentPersona() }, opts);
      res.product = { id: productId, name: productName(productId), category: p.category || '', sub: p.sub || '', audience: p.audience || '' };
      return res;
    },
    products: productsList,
    filterOptions: function (filter, opts) {
      var list = productsList(filter);
      var SRC = factsFor(opts);
      var withDemand = list.filter(function (p) {
        return SRC.some(function (f) { return f.pid === p.id && (f.r + f.v) > 0; });
      });
      var cats = {}, subs = {}, auds = {};
      withDemand.forEach(function (p) {
        cats[p.category] = (cats[p.category] || 0) + 1;
        subs[p.sub] = subs[p.sub] || { key: p.sub, category: p.category, count: 0 }; subs[p.sub].count++;
        auds[p.audience] = true;
      });
      return {
        categories: Object.keys(cats).map(function (k) { return { key: k, count: cats[k] }; }),
        subs: Object.keys(subs).map(function (k) { return subs[k]; }),
        audiences: Object.keys(auds),
        products: withDemand
      };
    },
    getPlanned: getPlanned,
    setPlanned: setPlanned,
    clearPlanned: clearPlanned,
    scopeKey: scopeKey
  };
})();
