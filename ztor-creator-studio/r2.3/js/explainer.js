/* ============================================================
   Explainer dialogs — shared behaviour for [data-explain] triggers.

   使用者裁示 2026-07-27：an info icon opens a proper overlay carrying the
   full explanation, instead of repeating a one-line hint under every
   copy of the same field.

   Contract:
     trigger  <button class="explain-btn" data-explain="explain-toppct">
     dialog   <div class="explain" id="explain-toppct" hidden>

   Many triggers may point at ONE dialog — that is the whole point: the
   three tier cards each show the icon, all three open the same text.

   Styling lives in ds-components/explainer.css.
   ============================================================ */
(function () {
  "use strict";

  var openEl = null;      // the .explain currently shown
  var lastTrigger = null; // focus goes back here on close

  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.disabled && el.offsetParent !== null; }
    );
  }

  function open(id, trigger) {
    var el = document.getElementById(id);
    if (!el) return;
    if (openEl) close();
    openEl = el;
    lastTrigger = trigger || null;
    el.hidden = false;
    document.body.classList.add("is-modal-open");
    if (window.ztorIcons) window.ztorIcons.applyIcons(el);
    var closeBtn = el.querySelector(".explain__close");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!openEl) return;
    openEl.hidden = true;
    openEl = null;
    document.body.classList.remove("is-modal-open");
    /* Send focus back where it came from, or a keyboard reader is
       dropped at the top of the document with no idea what happened. */
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-explain]");
    if (trigger) {
      e.preventDefault();
      open(trigger.getAttribute("data-explain"), trigger);
      return;
    }
    if (!openEl) return;
    if (e.target.closest(".explain__close") || e.target === openEl) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!openEl) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    /* Keep Tab inside the dialog while it is up. */
    if (e.key !== "Tab") return;
    var items = focusables(openEl);
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  window.ztorExplain = { open: open, close: close };
})();
