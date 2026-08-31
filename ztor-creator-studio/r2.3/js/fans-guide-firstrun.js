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

  var here = (location.pathname.split("/").pop() || "").toLowerCase();

  /* On the guide itself: this counts as having been shown. Covers both
     the redirect and someone opening it deliberately — either way they
     have now seen it, so it must not ambush them later. */
  if (here === GUIDE) {
    markSeen();
    return;
  }

  if (seen()) return;

  markSeen();
  location.replace(GUIDE + "?next=" + encodeURIComponent(here || "fans-crm.html"));
})();
