/* ============================================================
   Fans guide — first-run.

   使用者裁示 2026-07-28: the first time a creator opens ANY page under
   粉絲, the 系統說明 shows itself. After that it never interrupts again,
   whichever Fans page they open next.

   Once means once — the flag is written the moment we redirect, not when
   the guide is finished. A creator who bounces straight back has still
   been offered it; nagging someone who already said no with their feet
   is worse than them missing a paragraph. They can always reopen it from
   the 系統說明 link, which is on every Fans page.

   `?next=` carries where they were actually going, so the guide can hand
   them back rather than stranding them. Auto-showing a page they did not
   ask for is only acceptable if the trip is clearly round.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "ztor.fansGuideSeen";
  var GUIDE = "fans-guide.html";

  function seen() {
    try { return localStorage.getItem(KEY) === "1"; } catch (e) { return true; }
  }
  function markSeen() {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
  }

  /* 2026-10-23 release2.4：粉絲系統說明（fans-guide.html）只在最終版類版本存在——
     限縮版（release2.3／release2.4）連過去會被頁級閘門導回 E-Shop，所以不跳、也不記「看過」，
     切回最終版第一次進粉絲頁仍會跳。這支在 <head> 早於 devtools.js 執行，自己讀版本：
     URL ?version= 優先，其次 localStorage 的 ztor.devstate；最終版類白名單與 devtools.js 的
     isFullBaseVersion()、sidebar.js 的 fullVersion() 同一份（舊鍵 next 會被改寫成 release2.3，仍屬限縮版）。 */
  function fullBaseVersion() {
    var v = null;
    try { v = new URLSearchParams(location.search).get("version"); } catch (e) {}
    if (!v) { try { v = (JSON.parse(localStorage.getItem("ztor.devstate") || "{}") || {}).version; } catch (e) {} }
    if (!v) return true;
    return v === "full" || v === "funding-test" || v === "deck-for-sony" || !/^(release\d+\.\d+|next)$/.test(v);
  }
  var onFullBase = fullBaseVersion();

  var here = (location.pathname.split("/").pop() || "").toLowerCase();

  /* On the guide itself: this counts as having been shown. Covers both
     the redirect and someone opening it deliberately — either way they
     have now seen it, so it must not ambush them later. */
  if (here === GUIDE) {
    if (onFullBase) markSeen();   /* 限縮版直開說明頁會被導回 E-Shop，沒看到就不算看過 */
    return;
  }

  if (seen()) return;

  if (!onFullBase) return;

  markSeen();
  location.replace(GUIDE + "?next=" + encodeURIComponent(here || "fans-crm.html"));
})();
