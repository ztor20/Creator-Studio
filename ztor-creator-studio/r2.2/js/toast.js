/* ============================================================
   Toast — transient confirmation, shared by every page.

   window.ztorToast.show("Benefits saved", { tone: "success" })

   Announced via aria-live so a screen-reader user hears the same
   confirmation a sighted user sees; the visual toast alone would leave
   them with no feedback that Save did anything.
   ============================================================ */
(function () {
  "use strict";

  var HOLD = 3200;   // long enough to read a short sentence, short enough not to nag
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

  window.ztorToast = { show: show };
})();
