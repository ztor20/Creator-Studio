/* ============================================================
   file:// guard —— 直接開 .html 檔會看到一個「壞掉」的頁面，自動轉回 dev server。
   （2026-07-27 使用者回報：截圖是一片沒有樣式、沒有側欄的頁面，網址是
   D:/…/r2.1/order-detail.html。那不是 bug，是根本沒經過 server。）

   為什麼 file:// 一定不能用：
     · 沒有 dev server ＝ 沒有 no-store 標頭，改了 CSS 也可能吃到舊的
     · fetch()／XHR 在 file: origin 會被 CORS 擋掉 —— 側欄、i18n、元件渲染全部失效
       （所以截圖裡連側欄都沒有）
   與其每次提醒「請用 localhost」，不如讓它自己轉過去。

   放在 theme.js 最上面是因為它是 43 個頁面共同載入、且在 <head> 裡的第一支 script，
   轉址發生在任何算繪之前。轉址後 protocol 變 http:，這段直接 return，不會有迴圈。
   若 server 沒開，瀏覽器會顯示「無法連線 localhost:7777」——比一個沒有樣式、
   看起來像壞掉的頁面清楚得多。
   ============================================================ */
(function redirectFileProtocolToDevServer() {
  if (location.protocol !== "file:") return;
  /* serve-local.py 以 r2.1 為根目錄，所以取 /r2.1/ 之後的相對路徑即可
     （docs/、funding-test/ 這類子目錄也一併正確對應）。 */
  var rel = location.pathname.match(/\/r2\.1\/(.*)$/);
  if (!rel) return;
  location.replace("http://localhost:7777/" + rel[1] + location.search + location.hash);
})();

/* ============================================================
   字型預載（2026-07-28 使用者回報：「每次重新整理，標題都會先閃一下別的字
   才變成 Alumni」）

   為什麼會閃：@font-face 是在 CSS 被解析完之後才發出字型請求，而 CSS 本身
   還要先下載。所以第一次算繪時 Alumni Sans 根本還沒到，瀏覽器先用堆疊裡的
   第二順位（Geist）畫一次標題，字型到了再換掉——那一下換字就是使用者看到的閃爍。

   為什麼放在這裡：theme.js 是 43 個頁面 <head> 裡的第一支 script，跑在任何
   stylesheet 之前。在這裡塞 <link rel=preload>，字型請求會和 CSS 同時出發，
   而不是排在 CSS 後面。一支檔案修好全站，不必動 43 個 <head>。

   只預載「第一次算繪就會用到、而且小」的字面：
     · Alumni Sans variable（22KB）＝ 所有標題
     · Satoshi 400 / 500（各 25KB）＝ 內文與 UI
   LINE Seed TW 刻意不預載——那四個檔各約 3.4MB（未做子集化的全字集），
   預載反而會把頻寬從關鍵路徑上搶走。中文仍走 swap，第一次進站換一次字。

   搭配 fonts.css 把這三個字面改成 font-display: block：預載之後它們幾乎必定
   趕得上第一次算繪，block 保證「要嘛就是對的字，要嘛還沒畫」，不會換字。
   ============================================================ */
(function preloadCriticalFonts() {
  var faces = [
    /* Alumni Sans 於 2026-07-28 第二次裁示中退場（標題改回 Satoshi ＋ 全大寫），
       字檔仍留在 /fonts 但已無人引用，故不再預載。 */
    "fonts/Satoshi-400.woff2",
    "fonts/Satoshi-500.woff2",
    /* 700 也在第一畫面上（實測 document.fonts 顯示它在專案詳情頁就已載入：
       粗體標籤、表格數值等處用得到）。少了它，其他字都不閃、只有粗體那幾個字閃，
       反而更明顯。 */
    "fonts/Satoshi-700.woff2"
  ];
  /* 路徑從 theme.js 自己的 src 推回站台根目錄——docs/、funding-test/ 這些
     子目錄頁面若用相對路徑 "fonts/…" 會指到不存在的位置，預載就白做了
     （而且會在 console 留下一則「preloaded but not used」警告）。 */
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.replace(/js\/theme\.js.*$/, "") : "";
  /* theme.js 在 <head> 裡，document.head 此時必定存在 */
  for (var i = 0; i < faces.length; i++) {
    var l = document.createElement("link");
    l.rel = "preload";
    l.as = "font";
    l.type = "font/woff2";
    l.href = base + faces[i];
    l.crossOrigin = "anonymous";   /* 字型請求一律 CORS，少了這行預載不會被重用 */
    document.head.appendChild(l);
  }
})();

/* ============================================================
   Ztor Creator Studio R 2.0 — Theme manager

   Drives the `data-theme` attribute on <html>. Three states:
     · "light"  — forced light
     · "dark"   — forced dark
     · "system" — follows prefers-color-scheme

   Storage key: ztor.theme.preference  (one of light / dark / system)
   The actual resolved `data-theme` only ever flips between
   "light" and "dark"; "system" is recorded as the *preference*
   but resolves to one of the two at apply time.

   Sources of truth:
     1. URL ?theme=<value>  (debug override, NOT persisted)
     2. localStorage["ztor.theme.preference"]
     3. dark (the R 2.1 fallback when no valid preference is stored)
     4. window.matchMedia("(prefers-color-scheme: dark)") when set to system

   Public API on window.ztorTheme:
     · getPreference()  → "light" | "dark" | "system"
     · getResolved()    → "light" | "dark"   (what's actually applied)
     · setPreference(value)
     · cycle()          → dark → light → system → dark

   Any page can opt into the shared controls with data-theme-toggle or
   data-theme-set. section-test.html is the current visual test surface.
   ============================================================ */

(function () {
  const STORAGE_KEY = "ztor.theme.preference";
  const VALID = new Set(["light", "dark", "system"]);

  function readStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return VALID.has(v) ? v : "dark";
    } catch (e) { return "dark"; }
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
    const order = ["dark", "light", "system"];
    const cur = readStored();
    const next = order[(order.indexOf(cur) + 1) % order.length];
    setPreference(next);
    return next;
  }

  // ── Boot ──────────────────────────────────────────────
  // URL is a one-page debug override. Otherwise keep the saved choice;
  // a first-time visitor starts in dark mode.
  apply(readUrlOverride() || readStored());

  // Listen for system theme changes — only re-applies when current
  // preference is "system" so explicit light/dark stays sticky.
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const preference = readUrlOverride() || readStored();
        if (preference === "system") apply(preference);
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

/* ============================================================
   Display mode (nav mode) manager — spec §6.9 / decisions D016.

   Drives `data-nav-mode` on <html>. Two states:
     · "topbar"  — horizontal top bar (default)
     · "sidebar" — vertical left rail

   Same nav model / IA in both: only the placement changes.
   Storage key: ztor.nav.mode. Applied here in <head> so the layout
   is correct before first paint (no flash from topbar → sidebar).
   sidebar.js reads data-nav-mode to pick which markup to render and
   re-renders on the ztor:navmode-changed event.

   Public API on window.ztorNavMode:
     · get()          → "topbar" | "sidebar"
     · set(value)
     · toggle()       → flips topbar ↔ sidebar
   Any element with data-nav-set="topbar|sidebar" sets directly
   (Settings → Appearance cards).
   ============================================================ */
(function () {
  const STORAGE_KEY = "ztor.nav.mode";
  const VALID = new Set(["topbar", "sidebar"]);

  function readStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return VALID.has(v) ? v : "sidebar";  // D110: 預設側邊欄（仍可切換 Topbar）
    } catch (e) { return "sidebar"; }
  }
  function readUrlOverride() {
    try {
      const v = new URLSearchParams(location.search).get("nav");
      return VALID.has(v) ? v : null;
    } catch (e) { return null; }
  }
  function apply(mode) {
    document.documentElement.setAttribute("data-nav-mode", mode);
    document.dispatchEvent(new CustomEvent("ztor:navmode-changed", {
      detail: { mode: mode }
    }));
  }
  function setMode(mode) {
    if (!VALID.has(mode)) return;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    apply(mode);
  }
  function toggle() {
    const next = readStored() === "sidebar" ? "topbar" : "sidebar";
    setMode(next);
    return next;
  }

  // Boot — apply early (we are in <head>) to avoid a layout flash.
  apply(readUrlOverride() || readStored());

  document.addEventListener("click", (e) => {
    const toggler = e.target.closest("[data-nav-toggle]");
    if (toggler) {
      if (toggler.tagName === "BUTTON" || toggler.tagName === "A") e.preventDefault();
      toggle();
      return;
    }
    const setter = e.target.closest("[data-nav-set]");
    if (setter) {
      if (setter.tagName === "BUTTON" || setter.tagName === "A") e.preventDefault();
      setMode(setter.getAttribute("data-nav-set"));
    }
  });

  window.ztorNavMode = { get: readStored, set: setMode, toggle };
})();
