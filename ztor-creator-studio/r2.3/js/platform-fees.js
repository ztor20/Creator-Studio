/* platform-fees.js — 平台費率的共用讀取（示範資料）
   ---------------------------------------------------------------------------
   為什麼需要這支（2026-09-22，D311）：
     D311 把平台費率的解析順序定成三層——**本張門票的例外 → 該 creator 對該葉節點的
     覆寫 → General 的葉節點值**。在此之前，原型裡的費率是各頁各寫一個常數
     （`create-event.html` 的 `EVENT_FEE_PCT = 5`），單張門票彈窗要顯示「這 5% 是誰
     定的」時沒有地方問。把三層收成一支，建立流程與活動詳情才會給出同一個答案。

   資料來源：`admin-platform-fees.html` 的 General 欄目前的示範值（活動 › 現場活動
   票券＝5%）。**D311 原文舉的例子寫 15%，那是條文裡的示意數字**；站上費率設定頁
   自己寫的是 5%，兩邊不一致時以站上那一頁為準——否則創作者在後台看到 5%、在門票
   彈窗看到 15%。見 ASSUMPTIONS UIA-169。

   葉節點名稱共用費率設定頁的 i18n key（`fees.dim.*`／`fees.leaf.*`），不另抄一份
   中文字串——同一個葉節點在兩個畫面上必須是同一個叫法。

   ⚠ 全部是原型的示範資料與示範行為，不是產品規格：真實系統的費率由後端下發、
     逐 creator 覆寫由合約決定。逐門票例外的寫入端在單張門票彈窗（Admin 專屬）。
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  /* 葉節點：key → 費率設定頁的兩層 i18n key。只列目前原型用得到的活動維度。 */
  var LEAVES = {
    "events.onsite": { dim: "fees.dim.events", leaf: "fees.leaf.events.onsite" },
    "events.online": { dim: "fees.dim.events", leaf: "fees.leaf.events.online" },
    "events.signup": { dim: "fees.dim.events", leaf: "fees.leaf.events.signup" }
  };

  /* 第三層：General（費率設定頁的 data-general 值）。 */
  var GENERAL = { "events.onsite": 5, "events.online": 5, "events.signup": 0 };

  /* 第二層：逐 creator 覆寫（5.1.0.3 F3）。key＝persona handle。
     示範只給一位——沒有任何覆寫的話，「來源」那一行永遠只會顯示 General，
     解析順序的第二層在畫面上就不存在。 */
  var CREATOR = { userB: { "events.onsite": 4 } };

  function t(k) { return (window.i18nT && window.i18nT(k)) || k; }
  function personaId() {
    return (typeof window.ztorPersonaId === "function") ? window.ztorPersonaId() : null;
  }

  /* 這個葉節點在費率設定頁的完整路徑，例如「活動 Events › 現場活動票券」。 */
  function pathText(leafKey) {
    var m = LEAVES[leafKey];
    return m ? (t(m.dim) + " › " + t(m.leaf)) : leafKey;
  }

  function generalPct(leafKey) {
    return GENERAL[leafKey] == null ? 0 : GENERAL[leafKey];
  }
  /* 沒有覆寫時回 null（不是 0）——0% 是一個合法的覆寫值，用 0 當「沒有」會把它吃掉。 */
  function creatorPct(leafKey, who) {
    var row = CREATOR[who == null ? personaId() : who];
    var v = row ? row[leafKey] : null;
    return v == null ? null : v;
  }

  /* 解析：本票例外 → creator 覆寫 → General。
     exceptionPct 傳 null／undefined／空字串＝這張票沒有例外。 */
  function resolve(leafKey, exceptionPct, who) {
    var exc = (exceptionPct === "" || exceptionPct == null) ? null : Number(exceptionPct);
    if (exc != null && isFinite(exc)) return { pct: exc, source: "exception" };
    var ov = creatorPct(leafKey, who);
    if (ov != null) return { pct: ov, source: "creator" };
    return { pct: generalPct(leafKey), source: "general" };
  }

  window.ztorFees = {
    LEAVES: LEAVES, GENERAL: GENERAL, CREATOR: CREATOR,
    pathText: pathText, general: generalPct, creator: creatorPct, resolve: resolve
  };
})();
