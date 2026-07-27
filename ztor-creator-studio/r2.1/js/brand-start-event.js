/* ============================================================
   brand-start-event.js — 發起品牌活動的設定表（2026-07-28 使用者裁示）

   起點是使用者指出的一件事：品牌卡上那個 2026/01–2026/12 是「Ztor 與品牌的
   合約窗」，不是創作者自己的檔期；活動期間應該由創作者設定。順著這條線，
   「按下發起活動之後要設定什麼」就有了答案——而答案幾乎全部由
   js/brand-store.js 已經寫死的模型決定，不是憑空發想的欄位。

   ── 只放「模型逼出來的決定」，其餘一律不放 ──────────────────
   brand-store.js 的所有權分界很清楚：
     Ztor↔品牌（唯讀）：分潤、發放規則、發放方式、粉絲點數、合約窗、品牌識別
     創作者自己的     ：哪個品牌、活動名稱、自己的期間、上線／暫停
   所以這張表分三段：先讓創作者看懂拿到什麼（唯讀），再讓他決定自己的部分，
   最後把這個模型最違反直覺的一點講明白。

   ── 刻意「沒有」的東西 ──────────────────────────────────
   · 沒有「要發幾組碼」。brand-store.js 的所有權清單雖然列了「how many codes
     to mint」，但同一份檔案上方更明確地說：創作者不擁有批次、「codes minted」
     在創作者端沒有意義、而且「this file does not model minting per campaign
     at all」。兩句話不能同時成立，以後者為準——那正是它在修正的舊假設。
     加一個數量欄位等於把已經被推翻的模型重新做回去。
   · 沒有送審／待核准狀態。模型明說 no approval step——這是從贊助類產品帶過來
     的反射動作，加了就與模型矛盾。
   · 沒有「立即上線／排程」開關。開始日期在未來就是排程，可以推導，不必再問一次。

   ── 期間的邊界 ─────────────────────────────────────────
   創作者的檔期必須落在品牌合約窗之內：合約 2026-12-31 到期，就不可能排到 2027。
   所以 min/max 直接夾在 contract.from / contract.to，而不是自由日期。
   ============================================================ */
(function () {
  "use strict";

  function isZh() { return (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0; }
  function T(zh, en) { return isZh() ? zh : en; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* 日期工具：全部以 YYYY-MM-DD 字串運算，避免時區把日期挪一天。 */
  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(iso, n) {
    var d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function clamp(iso, lo, hi) { return iso < lo ? lo : (iso > hi ? hi : iso); }
  function human(iso) {
    var p = iso.split("-");
    return isZh() ? (p[0] + "/" + p[1] + "/" + p[2]) : (p[1] + "/" + p[2] + "/" + p[0].slice(2));
  }
  function days(a, b) {
    return Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 86400000) + 1;
  }

  function shareText(b) {
    if (b.share.type === "percent") return T(b.share.value + "% 分潤", b.share.value + "% of purchase");
    var per = b.share.per === "per.coffee" ? T("杯", "coffee") : T("條", "sleeve");
    return isZh() ? ("每" + per + " $" + b.share.value) : ("$" + b.share.value + " per " + per);
  }
  function methodText(b) {
    return b.method === "batch"
      ? T("預印卡片，門市直接發放", "Pre-printed cards, handed out in store")
      : T("結帳時印在收據上", "Printed on the receipt at checkout");
  }

  /* 同期間、同類別的其他活動——模型允許同時跑，所以這是提醒不是阻擋。 */
  function clash(brand, from, to) {
    var S = window.ztorBrands;
    if (!S || !S.campaigns) return null;
    for (var i = 0; i < S.campaigns.length; i++) {
      var c = S.campaigns[i];
      if (c.status === "ended") continue;
      var ob = S.brand(c.brandId);
      if (!ob || ob.id === brand.id || ob.category !== brand.category) continue;
      if (c.from <= to && from <= c.to) return ob;   /* 區間重疊 */
    }
    return null;
  }

  function build() {
    if ($("#brand-start")) return;
    var el = document.createElement("div");
    el.className = "payout-modal";
    el.id = "brand-start";
    el.hidden = true;
    el.innerHTML =
      '<div class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="brand-start-title">' +
        '<div class="payout-dialog__head">' +
          '<h3 class="payout-dialog__title" id="brand-start-title"></h3>' +
          '<button class="btn btn--icon btn--sm" type="button" data-bs-close aria-label="Close">' +
            '<i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="payout-dialog__body" data-bs-body></div>' +
        '<div class="payout-dialog__foot">' +
          '<span class="text-sub" style="font-size:var(--fs-12)" data-bs-summary></span>' +
          '<button class="btn btn--primary" type="button" data-bs-submit></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  var state = null;

  function open(brand) {
    var el = build() || $("#brand-start");
    var lo = brand.contract.from, hi = brand.contract.to;
    var start = clamp(today() < lo ? lo : today(), lo, hi);
    var end = clamp(addDays(start, 59), lo, hi);          /* 預設 60 天，不是整個合約窗 */
    state = { brand: brand, from: start, to: end };

    $("#brand-start-title").textContent = T("發起活動 · " + brand.name, "Start event · " + brand.name);
    $("[data-bs-submit]", el).textContent = T("發起活動", "Start event");
    renderBody(el);

    el.hidden = false;
    document.body.style.overflow = "hidden";
    var f = $("[data-bs-name]", el); if (f) f.focus();
  }

  function close() {
    var el = $("#brand-start");
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = "";
    state = null;
  }

  function renderBody(el) {
    var b = state.brand, lo = b.contract.from, hi = b.contract.to;
    var body = $("[data-bs-body]", el);

    body.innerHTML =
      /* ── 1. 這筆交易（唯讀）──────────────────────────────
         放在最前面，是因為它決定創作者值不值得跑，而且它全部不可改。
         brand-store.js 說得直接：UI 要把條件講清楚，
         「rather than let a creator expect the impossible」。 */
      '<div class="form-section">' +
        '<div class="form-section__title">' +
          '<i data-lucide="lock" class="ztor-icon"></i> ' +
          T("Ztor 與品牌的既定條件", "Set by Ztor & the brand") + '</div>' +
        '<div class="settings-row"><span>' + T("你的分潤", "Your cut") + '</span>' +
          '<strong>' + esc(shareText(b)) + '</strong></div>' +
        '<div class="settings-row"><span>' + T("發放規則", "Code issued") + '</span>' +
          '<strong>' + T("每消費 $" + b.issue.perSpend + " 發一組", "1 code per $" + b.issue.perSpend + " spent") + '</strong></div>' +
        '<div class="settings-row"><span>' + T("發放方式", "How fans get it") + '</span>' +
          '<strong>' + esc(methodText(b)) + '</strong></div>' +
        '<div class="settings-row"><span>' + T("粉絲可得點數", "Fan earns") + '</span>' +
          '<strong>' + b.points + T(" 點", " pts") + '</strong></div>' +
        '<div class="settings-row"><span>' + T("品牌開放期間", "Brand available") + '</span>' +
          '<strong>' + human(lo) + " – " + human(hi) + '</strong></div>' +
      '</div>' +

      /* ── 2. 你的活動（真正的設定）────────────────────────── */
      '<div class="form-section mt-16">' +
        '<div class="form-section__title">' + T("你的活動", "Your event") + '</div>' +

        '<div class="field"><label class="field__label" for="bs-name">' +
          T("活動名稱", "Event name") + '</label>' +
          '<input class="input" id="bs-name" name="eventName" data-bs-name value="' +
            esc(T(b.name + " 推廣檔", b.name + " run")) + '">' +
          '<p class="field__hint">' +
            T("只有你和收益報表看得到，用來分辨同時進行的多檔活動。",
              "Only you and your earnings reports see this — it tells concurrent events apart.") + '</p></div>' +

        /* 期間：這就是使用者指出的那件事。上下限夾在合約窗，不是自由日期。 */
        '<div class="form-grid">' +
          '<div class="field"><label class="field__label" for="bs-from">' + T("開始", "Starts") + '</label>' +
            '<input class="input" type="date" id="bs-from" name="from" data-bs-from value="' + state.from + '" min="' + lo + '" max="' + hi + '"></div>' +
          '<div class="field"><label class="field__label" for="bs-to">' + T("結束", "Ends") + '</label>' +
            '<input class="input" type="date" id="bs-to" name="to" data-bs-to value="' + state.to + '" min="' + lo + '" max="' + hi + '"></div>' +
        '</div>' +
        '<p class="field__hint" data-bs-window></p>' +

        '<div class="field mt-16"><span class="field__label">' +
          T("在哪裡曝光", "Where it appears") + '</span>' +
          '<p class="field__hint">' +
            T("粉絲是在 App 裡「選一位創作者」來歸屬掃碼，所以活動期間你出現在越多地方，被選到的機會越大。",
              "Fans attribute a scan by picking a creator, so the more of your surfaces carry it, the more often they pick you.") + '</p>' +
          surfaceRow("shop", T("電子商店", "Shop"), true) +
          surfaceRow("projects", T("項目頁", "Project pages"), true) +
          surfaceRow("feed", T("社群貼文", "Feed"), true) +
          surfaceRow("events", T("活動頁", "Event pages"), false) +
        '</div>' +

        '<div class="field"><span class="field__label">' + T("上線時通知粉絲", "Announce on launch") + '</span>' +
          '<div class="flex-row" style="justify-content:space-between;gap:var(--sp-12)">' +
            '<span class="field__hint">' +
              T("自動草擬一則貼文並推播給粉絲。先搶到追蹤者，之後的掃碼才有人歸屬給你。",
                "Drafts a post and notifies your fans. You win followers first; attribution follows.") + '</span>' +
            '<div class="switch switch--on" data-bs-announce></div></div></div>' +

        '<div class="field"><label class="field__label" for="bs-goal">' +
          T("目標（選填）", "Goal (optional)") + '</label>' +
          '<div class="form-grid">' +
            '<input class="input" type="number" min="0" id="bs-goal" name="goal" data-bs-goal placeholder="500">' +
            '<select class="select" id="bs-goaltype" name="goalType" aria-label="' + T("目標類型", "Goal type") + '" data-bs-goaltype>' +
              '<option value="scans">' + T("次掃碼歸屬給我", "scans attributed to me") + '</option>' +
              '<option value="fans">' + T("位新粉絲", "new fans") + '</option>' +
            '</select>' +
          '</div>' +
          '<p class="field__hint">' +
            T("沒有目標，之後報表上的數字就只是數字，沒有「達成與否」可言。",
              "Without a target the report is just numbers — nothing to judge them against.") + '</p></div>' +
      '</div>' +

      /* ── 3. 這個模型最違反直覺的一點 ─────────────────────
         同一個品牌可以被很多創作者同時推，粉絲是在其中「選一個」。
         不先講，之後看到 share of voice 偏低會被當成 bug 或被當成平台偏心。 */
      '<div class="info-banner mt-16">' +
        '<i data-lucide="users" class="ztor-icon info-banner__icon"></i>' +
        '<span>' + T(
          "其他創作者也可能同時推廣這個品牌。你們不是在分一疊卡片，而是在爭取粉絲掃碼時選你的名字——所以曝光與號召力就是成績。",
          "Other creators may run this brand in the same window. You are not splitting a stack of cards — you are competing to be the name a fan taps, so reach and pull are the whole game."
        ) + '</span></div>' +
      '<div data-bs-clash></div>';

    if (window.ztorIcons) window.ztorIcons.applyIcons(body);
    if (window.ztorSelect) window.ztorSelect.mount(body);
    sync(el);
  }

  function surfaceRow(key, label, on) {
    return '<label class="zcheck" style="display:flex;align-items:center;gap:var(--sp-10);padding:var(--sp-6) 0">' +
      /* id ＋ name 不是可有可無：沒有的話瀏覽器會回報 "form field should have an
         id or name"，而且 <label> 也無法用 for= 綁定（這裡靠包起來仍可點，
         但輔助技術讀不到穩定的關聯）。 */
      '<span class="zcheck__control"><input class="zcheck__input" type="checkbox"' +
        ' id="bs-sf-' + key + '" name="surface-' + key + '" data-bs-surface="' + key + '"' +
        (on ? " checked" : "") + '><span class="zcheck__box"></span></span>' +
      '<span class="zcheck__label">' + esc(label) + '</span></label>';
  }

  /* 期間摘要 ＋ 邊界說明 ＋ 撞期提醒。每次改日期都重算。 */
  function sync(el) {
    el = el || $("#brand-start");
    if (!el || !state) return;
    var b = state.brand, lo = b.contract.from, hi = b.contract.to;
    var fromEl = $("[data-bs-from]", el), toEl = $("[data-bs-to]", el);

    var from = clamp(fromEl.value || lo, lo, hi);
    var to = clamp(toEl.value || from, lo, hi);
    if (to < from) to = from;                       /* 結束不能早於開始 */
    fromEl.value = from; toEl.value = to;
    state.from = from; state.to = to;

    var n = days(from, to);
    var note = T(n + " 天", n + " days");
    /* 只有真的被合約窗夾到時才解釋，平時不囉嗦。 */
    if (to === hi && hi < addDays(from, 364)) {
      note += " · " + T("已到品牌開放期間的最後一天（" + human(hi) + "）",
                        "ends with the brand's window (" + human(hi) + ")");
    }
    var w = $("[data-bs-window]", el); if (w) w.textContent = note;

    var scheduled = from > today();
    var sum = $("[data-bs-summary]", el);
    if (sum) sum.textContent = scheduled
      ? T("將於 " + human(from) + " 自動上線", "Goes live automatically on " + human(from))
      : T("立即上線", "Goes live immediately");

    /* 同類別撞期：允許，但要講一聲。 */
    var host = $("[data-bs-clash]", el);
    var other = clash(b, from, to);
    host.innerHTML = other
      ? '<div class="info-banner info-banner--warning mt-16">' +
          '<i data-lucide="alert-triangle" class="ztor-icon info-banner__icon"></i><span>' +
          T("這段期間你也在推廣「" + other.name + "」，同屬" + catName(b) + "。可以同時進行，但粉絲可能覺得訊息互相打架。",
            "You are also running " + other.name + " in this window — same category. Allowed, but fans may find the two pitches compete.") +
          '</span></div>'
      : "";
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
  }

  function catName(b) {
    var m = { "cat.food": T("餐飲", "Food & drink"), "cat.sportswear": T("運動服飾", "Sportswear"), "cat.fashion": T("時尚", "Fashion") };
    return m[b.category] || b.category;
  }

  /* ── 接線 ──────────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var start = e.target.closest && e.target.closest("[data-brand-start]");
    if (start) {
      var b = window.ztorBrands && window.ztorBrands.brand(start.getAttribute("data-brand-start"));
      if (b) open(b);
      return;
    }
    if (e.target.closest && e.target.closest("[data-bs-close]")) { close(); return; }
    var el = $("#brand-start");
    if (el && !el.hidden && e.target === el) close();          /* 點灰底關閉 */
    if (e.target.closest && e.target.closest("[data-bs-submit]")) {
      /* 原型：不落地。真實版本在這裡送出 state 並導向新活動的詳情頁。 */
      close();
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target.closest && e.target.closest("[data-bs-from],[data-bs-to]")) sync();
  });
  document.addEventListener("keydown", function (e) {
    var el = $("#brand-start");
    if (e.key === "Escape" && el && !el.hidden) close();
  });

  window.ztorBrandStart = { open: open, close: close };
})();
