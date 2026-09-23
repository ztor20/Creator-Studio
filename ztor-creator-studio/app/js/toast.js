/* ============================================================
   Toast — transient confirmation, shared by every page.

   window.ztorToast.show("Benefits saved", { tone: "success" })

   Cross-page hand-off (2026-07-30):

   window.ztorToast.queue("項目已發布", { key: "cpp.publish.toast.now", tone: "success" })
   → 訊息存進 sessionStorage，下一個載入本檔的頁面自動顯示一次再清掉。

   為什麼要有 queue：有些確認發生在「按下去就換頁」的動作上（建立流程按發布 →
   導向專案詳情頁）。show() 只活在當前頁，導向的瞬間就被丟掉，使用者到了新頁面
   不會知道剛才那一下有沒有成功。存 i18n key 而不是翻好的字串，是因為顯示的時機
   在下一頁——語言可能已經被切過；查不到 key 時退回存下來的字串，所以畫面上永遠
   不會出現 raw key。

   Announced via aria-live so a screen-reader user hears the same
   confirmation a sighted user sees; the visual toast alone would leave
   them with no feedback that Save did anything.
   ============================================================ */
(function () {
  "use strict";

  var HOLD = 3200;   // long enough to read a short sentence, short enough not to nag
  var QUEUE_KEY = "ztor.toast.queue";   // sessionStorage：只活在這個分頁、關掉即消失
  var host = null;

  function ensureHost() {
    if (host && document.body.contains(host)) return host;
    host = document.createElement("div");
    host.className = "ztor-toasts";
    host.setAttribute("role", "status");
    host.setAttribute("aria-live", "polite");
    host.setAttribute("aria-atomic", "false");
    document.body.appendChild(host);
    return host;
  }

  var ICON = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ztor-icon"><path d="M5 12l5 5l10 -10"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ztor-icon"><path d="M12 8v5M12 16.5v.01"/><path d="M12 3l9 16H3z"/></svg>'
  };

  function show(message, opts) {
    opts = opts || {};
    var tone = opts.tone === "error" ? "error" : "success";
    var el = document.createElement("div");
    el.className = "ztor-toast" + (tone === "error" ? " ztor-toast--error" : "");
    el.innerHTML = '<span class="ztor-toast__icon">' + ICON[tone] + "</span>" +
                   '<span class="ztor-toast__text"></span>';
    el.querySelector(".ztor-toast__text").textContent = message;
    ensureHost().appendChild(el);

    var gone = false;
    function dismiss() {
      if (gone) return;
      gone = true;
      el.classList.add("is-leaving");
      /* Remove on animationend, with a timer as the backstop — an
         animationend that never fires (background tab) would otherwise
         leave the toast on screen forever. */
      var done = function () { if (el.parentNode) el.parentNode.removeChild(el); };
      el.addEventListener("animationend", done, { once: true });
      setTimeout(done, 400);
    }
    setTimeout(dismiss, opts.hold || HOLD);
    el.addEventListener("click", dismiss);
    return { dismiss: dismiss };
  }

  /* ── Cross-page queue ───────────────────────────────────────────────
     queue() 只負責存；顯示由「下一個載入本檔的頁面」在 DOM ready 時做。
     opts.key ＝ i18n key（顯示時才翻譯，跨語言用）；message ＝ 退路字串。
     存不進去（無痕模式、配額滿）就安靜放棄——原型不該因為存不了一句提示
     而中斷導向。 */
  function queue(message, opts) {
    opts = opts || {};
    var item = {
      m: message == null ? "" : String(message),
      k: opts.key || "",
      tone: opts.tone === "error" ? "error" : "success"
    };
    if (opts.hold) item.hold = opts.hold;
    try {
      var list = readQueue();
      list.push(item);
      sessionStorage.setItem(QUEUE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  function readQueue() {
    try {
      var raw = sessionStorage.getItem(QUEUE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) { return []; }
  }

  function flush() {
    var list = readQueue();
    /* 先清再顯示：顯示完才清的話，途中重整就會再跳一次同一則提示。 */
    try { sessionStorage.removeItem(QUEUE_KEY); } catch (_) {}
    list.forEach(function (item) {
      if (!item) return;
      /* i18nT 查不到（key 打錯、字典還沒補）會回 null／undefined —— 這時退回
         存下來的字串，寧可顯示發布當下的語言，也不要把 key 印在畫面上。 */
      var text = item.k && typeof window.i18nT === "function" ? window.i18nT(item.k) : null;
      if (text == null || text === "") text = item.m;
      if (!text) return;
      show(text, { tone: item.tone, hold: item.hold });
    });
  }

  /* 自己在載入時 flush，任何頁面只要 link 這支就自動支援跨頁提示，不必逐頁接線。
     等到 DOM ready 才做的兩個理由：show() 需要 document.body；翻譯需要 i18n.js
     已經跑過（它在 parse 時就掛好 window.i18nT 並設好 documentElement.lang）。 */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", flush);
  } else {
    flush();
  }

  window.ztorToast = { show: show, queue: queue };
})();
