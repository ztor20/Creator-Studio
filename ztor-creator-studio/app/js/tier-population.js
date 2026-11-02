/* ============================================================
   Ztor — 粉絲分級人口（demo 假資料的單一來源）
   2026-07-31 建立。抽自 js/vault-store.js 原本內嵌的 TIERS，讓「每一級有多少人」
   只宣告一次；媒體庫房問「有幾位粉絲打得開這座庫房」、電子商店問「門檻設在這一級
   有幾個人買得到」，是同一份人口的兩種讀法，不該各存一份數字。

   每一級的 count ＝ 該級的「帶」人數（互斥，不含其上各級）——分級是相對排名切出來的
   區間，一位粉絲只會落在其中一級。要回答「門檻設在這一級，共有多少人」得往上累加，
   那正是 cumulativeAt() 做的事。

   ⚠ 這是原型示範資料，不是產品資料。
   2026-10-02（D348）依預設「前 % 名」1%／10%／30%（累積）重算，母數維持 1,283
   （活躍粉絲）：核心圈 13（≈1%）／超級粉絲 115（≈9%）／上榜粉絲 257（≈20%）／
   一般粉絲 898（≈70%）；累積 13／128／385／1,283。舊值 154／359／475／295 是照
   10／40／75 的舊示意算的。同輪把 i18n 裡分級設定頁卡片的 tier-settings.tier.*-count
   （原本另一組 359／512／640／329）、粉絲總覽圖例、群發對象、儀表板一起對齊這一組，
   站上不再有兩組人數（ASSUMPTIONS.md PG-022 的 (b) 原型面已統一，真值來源仍待上游）。
   2026-11-02（#460）：改讀 js/fans-roster.js 的示範母體，見下方說明。
   ============================================================ */
(function () {
  /* 2026-11-02（UI-CHANGES 四百六十、ASSUMPTIONS UIA-332）：人數改由 js/fans-roster.js 的示範母體算——
     每一級的 count＝該級「活躍粉絲」人數（5.1.7 F3：分級分布以活躍粉絲計，各級加總＝活躍粉絲數），
     跟著平台忠誠點數設定（S_floor、前 % 名、活躍視窗）變。預設設定下仍是 13／115／257／898（合計 1,283）。
     頁面沒載入 fans-roster.js 時退回下面這組固定數字（同一組預設值）。
     正式版的分級由 Loyalty 引擎提供，原型以示範母體自算。
     階梯由高到低，與 tier-settings 的排序一致。key 用完整名稱（superfan 不縮寫成 super）——
     e-shop 與 tier-settings 都用這套；vault-store 內部沿用自己的 super，在那邊映射。
     名稱不在此複製，一律引用 tier-settings.tier.* 的 i18n key（自訂名稱由 js/loyalty-settings.js 的 i18n 掛勾換上）。 */
  var FALLBACK = { inner: 13, superfan: 115, devoted: 257, fan: 898 };
  var ROSTER_KEY = { inner: 'inner', superfan: 'super', devoted: 'devoted', fan: 'fan' };
  var S = window.ztorFans ? window.ztorFans.summary() : null;
  var TIERS = ['inner', 'superfan', 'devoted', 'fan'].map(function (k) {
    return { key: k, i18n: 'tier-settings.tier.' + k, count: S ? S.tiers[ROSTER_KEY[k]].active : FALLBACK[k] };
  });
  var TOTAL = TIERS.reduce(function (a, x) { return a + x.count; }, 0);   /* 預設 1,283 */

  /* 門檻設在 key 這一級時買得到／進得來的總人數＝該級與其上各級相加。
     查無此 key 時回傳全部人數——門檻讀不出來的保守解讀是「人人可用」，
     不是「沒有人可用」，跟 e-shop 對舊資料的處理同一個方向。 */
  function cumulativeAt(key) {
    var i = TIERS.findIndex(function (x) { return x.key === key; });
    if (i === -1) return TOTAL;
    return TIERS.slice(0, i + 1).reduce(function (a, x) { return a + x.count; }, 0);
  }

  window.ztorTierPopulation = {
    tiers: TIERS,
    total: TOTAL,
    cumulativeAt: cumulativeAt
  };
})();
