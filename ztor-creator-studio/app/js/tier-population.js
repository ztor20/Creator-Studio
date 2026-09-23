/* ============================================================
   Ztor — 粉絲分級人口（demo 假資料的單一來源）
   2026-07-31 建立。抽自 js/vault-store.js 原本內嵌的 TIERS，讓「每一級有多少人」
   只宣告一次；媒體庫房問「有幾位粉絲打得開這座庫房」、電子商店問「門檻設在這一級
   有幾個人買得到」，是同一份人口的兩種讀法，不該各存一份數字。

   每一級的 count ＝ 該級的「帶」人數（互斥，不含其上各級）——分級是相對排名切出來的
   區間，一位粉絲只會落在其中一級。要回答「門檻設在這一級，共有多少人」得往上累加，
   那正是 cumulativeAt() 做的事。

   ⚠ 這是原型示範資料，不是產品資料。站上另有一組互相矛盾的數字：
   js/i18n.js 的 tier-settings.tier.*-count（核心圈 359／超級粉絲 512／上榜粉絲 640／
   粉絲 329）是分級設定頁卡片上的靜態文案，與本檔的 154／359／475／295 對不起來。
   兩組都是假資料、目前各自服務不同頁面，統一哪一組屬產品資料來源問題，記在
   ASSUMPTIONS.md PG-022，未裁決前不自行選邊。
   ============================================================ */
(function () {
  /* 階梯由高到低，與 tier-settings 的排序一致。key 用完整名稱（superfan 不縮寫成 super）——
     e-shop 與 tier-settings 都用這套；vault-store 內部沿用自己的 super，在那邊映射。
     名稱不在此複製，一律引用 tier-settings.tier.* 的 i18n key。 */
  var TIERS = [
    { key: 'inner',    i18n: 'tier-settings.tier.inner',    count: 154 },
    { key: 'superfan', i18n: 'tier-settings.tier.superfan', count: 359 },
    { key: 'devoted',  i18n: 'tier-settings.tier.devoted',  count: 475 },
    { key: 'fan',      i18n: 'tier-settings.tier.fan',      count: 295 }
  ];
  var TOTAL = TIERS.reduce(function (a, x) { return a + x.count; }, 0);   /* 1,283 */

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
