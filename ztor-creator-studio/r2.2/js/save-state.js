/* ============================================================
   Save state — Save / Discard / "last saved X ago", shared.

   使用者裁示 2026-07-27：the Save button did nothing. It now saves,
   confirms with a toast rising from the bottom, and reports when it
   last saved.

   The rule this encodes: **a Save button that stays lit after a
   successful save is lying** — there is nothing left to save. So the
   button disables while the page is clean, wakes the instant anything
   changes, and the timestamp beside it carries the reassurance.

   Markup contract (see tier-benefits.html):
     <div data-save-scope>                 ← changes inside here mark dirty
       …
       <button class="btn btn--primary" data-save>Save benefits</button>
       <span class="save-status" data-save-status></span>

   Demo-level: nothing is persisted to a backend. The point is the
   state machine and the feedback, which are real.
   ============================================================ */
(function () {
  "use strict";

  function isZh() { return document.documentElement.lang === "zh-Hant"; }

  /* Relative time, recomputed on a tick — "2 minutes ago" must not
     freeze at the moment it was rendered. */
  function ago(ms) {
    var s = Math.floor((Date.now() - ms) / 1000);
    if (s < 45) return isZh() ? "剛剛" : "just now";
    var m = Math.round(s / 60);
    if (m < 60) {
      if (isZh()) return m + " 分鐘前";
      return m === 1 ? "1 minute ago" : m + " minutes ago";
    }
    var h = Math.round(m / 60);
    if (h < 24) {
      if (isZh()) return h + " 小時前";
      return h === 1 ? "1 hour ago" : h + " hours ago";
    }
    var d = Math.round(h / 24);
    if (isZh()) return d + " 天前";
    return d === 1 ? "1 day ago" : d + " days ago";
  }

  function init(scope) {
    var btn = scope.querySelector("[data-save]");
    var statusEl = scope.querySelector("[data-save-status]");
    if (!btn) return;

    var discard = scope.querySelector("[data-discard]");
    var savedAt = null;
    var dirty = false;
    var saveLabel = btn.textContent.trim();

    function paint() {
      btn.disabled = !dirty;
      if (!statusEl) return;
      if (dirty) {
        statusEl.className = "save-status save-status--dirty";
        statusEl.innerHTML = '<span class="save-status__dot"></span>';
        statusEl.appendChild(document.createTextNode(
          isZh() ? "有未儲存的變更" : "Unsaved changes"));
      } else if (savedAt) {
        statusEl.className = "save-status";
        statusEl.innerHTML = '<span class="save-status__dot"></span>';
        statusEl.appendChild(document.createTextNode(
          (isZh() ? "上次儲存於 " : "Last saved ") + ago(savedAt)));
      } else {
        statusEl.className = "save-status";
        statusEl.textContent = "";
      }
    }

    function markDirty() {
      if (dirty) return;
      dirty = true;
      paint();
    }

    /* Any edit inside the scope counts: typing in a field, flipping a
       switch, adding or removing a row. The matrix re-renders its rows,
       so this listens on the scope rather than on the controls. */
    scope.addEventListener("input", markDirty);
    scope.addEventListener("change", markDirty);
    scope.addEventListener("click", function (e) {
      if (e.target.closest("[data-save], [data-discard]")) return;
      if (e.target.closest(".switch, [data-bmx-add], [data-remove]")) markDirty();
    });

    btn.addEventListener("click", function () {
      if (!dirty) return;
      dirty = false;
      savedAt = Date.now();
      paint();
      btn.textContent = saveLabel;
      if (window.ztorToast) {
        /* The confirmation names what was saved — "Saved" alone makes the
           user re-derive which page they were on. Each page supplies its
           own wording; both locales sit on the button so this needs no
           translation lookup at fire time. */
        window.ztorToast.show(
          (isZh() ? btn.getAttribute("data-save-toast-zh") : btn.getAttribute("data-save-toast")) ||
          (isZh() ? "已儲存" : "Saved"),
          { tone: "success" });
      }
    });

    if (discard) {
      discard.addEventListener("click", function () {
        if (!dirty) return;
        var msg = isZh()
          ? "放棄尚未儲存的變更？"
          : "Discard your unsaved changes?";
        if (!window.confirm(msg)) return;
        dirty = false;
        paint();
        if (window.ztorToast) {
          window.ztorToast.show(
            isZh() ? "變更已放棄" : "Changes discarded", { tone: "success" });
        }
      });
    }

    /* Tick the relative time. 30s is fine — nothing here is precise to
       the second, and a slower tick would let "just now" go stale. */
    setInterval(function () { if (!dirty && savedAt) paint(); }, 30000);
    document.addEventListener("i18n:applied", paint);
    paint();
  }

  /* Relative time is a page-level concern, not private to this file —
     anything else rendering "X ago" should read the same clock rather
     than growing a second, subtly different one. */
  window.ztorSaveState = { ago: ago };

  function boot() {
    document.querySelectorAll("[data-save-scope]").forEach(init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
