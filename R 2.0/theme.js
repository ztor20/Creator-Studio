/* ============================================================
   Ztor Creator Studio R 2.0 — Theme manager

   Drives the `data-theme` attribute on <html>. Three states:
     · "light"  — forced light
     · "dark"   — forced dark
     · "system" — follows prefers-color-scheme (default)

   Storage key: ztor.theme.preference  (one of light / dark / system)
   The actual resolved `data-theme` only ever flips between
   "light" and "dark"; "system" is recorded as the *preference*
   but resolves to one of the two at apply time.

   Sources of truth:
     1. URL ?theme=<value>  (debug override, NOT persisted)
     2. localStorage["ztor.theme.preference"]
     3. window.matchMedia("(prefers-color-scheme: dark)")

   Public API on window.ztorTheme:
     · getPreference()  → "light" | "dark" | "system"
     · getResolved()    → "light" | "dark"   (what's actually applied)
     · setPreference(value)
     · cycle()          → light → dark → system → light

   Topbar adds a sun/moon icon button (added in index.html etc.).
   Settings page Appearance section uses three radio cards.
   ============================================================ */

(function () {
  const STORAGE_KEY = "ztor.theme.preference";
  const VALID = new Set(["light", "dark", "system"]);

  function readStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return VALID.has(v) ? v : "system";
    } catch (e) { return "system"; }
  }

  function readUrlOverride() {
    try {
      const v = new URLSearchParams(location.search).get("theme");
      return VALID.has(v) ? v : null;
    } catch (e) { return null; }
  }

  function systemResolved() {
    return window.matchMedia &&
           window.matchMedia("(prefers-color-scheme: dark)").matches
           ? "dark" : "light";
  }

  function resolve(pref) {
    return pref === "system" ? systemResolved() : pref;
  }

  function apply(pref) {
    const resolved = resolve(pref);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-preference", pref);
    // Broadcast so listeners (e.g. Settings UI, topbar button label)
    // can re-render their state without polling.
    document.dispatchEvent(new CustomEvent("ztor:theme-changed", {
      detail: { preference: pref, resolved: resolved }
    }));
  }

  function setPreference(pref) {
    if (!VALID.has(pref)) return;
    try { localStorage.setItem(STORAGE_KEY, pref); } catch (e) {}
    apply(pref);
  }

  function cycle() {
    const order = ["light", "dark", "system"];
    const cur = readStored();
    const next = order[(order.indexOf(cur) + 1) % order.length];
    setPreference(next);
    return next;
  }

  // ── Boot ──────────────────────────────────────────────
  const initial = readUrlOverride() || readStored();
  apply(initial);

  // Listen for system theme changes — only re-applies when current
  // preference is "system" so explicit light/dark stays sticky.
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (readStored() === "system") apply("system");
      });
  }

  // ── Topbar toggle button wiring ──────────────────────
  // Any element with data-theme-toggle becomes a cycle button.
  // Any element with data-theme-set="light|dark|system" sets directly.
  //
  // We preventDefault ONLY for <button> / <a> — not for form controls
  // (e.g. radio inputs in Settings Appearance), so they still get
  // their native check/select behavior in addition to our theme set.
  document.addEventListener("click", (e) => {
    const cycler = e.target.closest("[data-theme-toggle]");
    if (cycler) {
      if (cycler.tagName === "BUTTON" || cycler.tagName === "A") e.preventDefault();
      cycle();
      return;
    }
    const setter = e.target.closest("[data-theme-set]");
    if (setter) {
      if (setter.tagName === "BUTTON" || setter.tagName === "A") e.preventDefault();
      setPreference(setter.getAttribute("data-theme-set"));
    }
  });

  // Expose API
  window.ztorTheme = {
    getPreference: readStored,
    getResolved:   () => resolve(readStored()),
    setPreference,
    cycle,
  };
})();
