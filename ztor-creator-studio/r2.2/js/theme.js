/* ============================================================
   file:// guard —— 已於 2026-08-13 移除（墓碑，請勿還原）。

   這裡原本有一段：偵測到頁面是用 file:// 開的，就自動轉去 dev server。
   它的前提是「file:// 開會看到一個沒有樣式、沒有側欄的壞頁面」。

   ── 為什麼移除 ──────────────────────────────────────────
   那個前提現在是錯的，而且已用實測推翻：2026-08-13 用本機 chrome-headless-shell
   直接開 `file://…/r2.2/projects.html`（轉址停用），畫面完整——深色主題、側欄、
   Satoshi 字型、圖示、專案清單縮圖、Cheat Codes 面板全部正常。
   原因是站上的 CSS／JS／字型／圖片全是相對路徑的本地檔（無 CDN），
   這類子資源在 file:// 下照常載入；真正被 file: origin 擋掉的只有 fetch／XHR，
   而全站只有 devtools.js 用到一次（見下方「已知差異」）。

   更關鍵的是它會靜默腐爛：舊版把版本資料夾寫死 `/r2.1/`、埠寫死 `serve-local.py`
   的 7777。2026-07-26 換成 devserver.py（4325）、07-29 資料夾改名 r2.2 之後，
   比對再也不會命中，於是「雙擊 .html 自動跳 localhost」這件事無聲無息地停掉——
   使用者回報「以前可以，現在不行」正是這個。一段會過期、又只在過期時才被發現的
   自動轉址，不如不要有。

   ── 已知差異（file:// 直接開 vs dev server）────────────────
   · Cheat Codes 的版本切換讀不到 `feature-scope-map.md`（devtools.js 唯一的
     fetch，file: origin 被 CORS 擋，該處 .catch 已靜默吞掉）。面板照樣打得開，
     但 Phase 1–4 的功能範圍不會真的套用。要測版本切換請用 devserver.py。
   · 沒有 no-store 標頭。改完 CSS 若畫面沒更新，硬性重新整理（Cmd+Shift+R）。
   兩者都不影響單純看畫面，所以預設讓「雙擊 .html」直接可用。

   要用 dev server 時（AI 驗證、測版本切換）：
     python3 devserver.py 4325 r2.2      # 從 site/ 執行
   ============================================================ */

/* ============================================================
   Persona 的單一真相（2026-07-28 修，使用者回報「有時候要再點一次周湯豪，
   資料才對，不然不知道是哪個使用者的」）

   ── 病因 ────────────────────────────────────────────────
   同一個 localStorage key（ztor.persona）有三個讀取者，而它們在「沒有存過值」
   時的退路不一樣：
     js/i18n.js          → 'nick'      ← cheat code 面板的高亮也是讀這支
     js/projects-store.js→ 'default'
     js/products-store.js→ 'default'
   所以全新的瀏覽器（或清過站台資料）第一次開站時：面板高亮在「周湯豪」，
   專案與商品卻是預設帳號的那一批——畫面同時是兩個人的資料。
   使用者點一次「周湯豪」會呼叫 set() 把值寫進 localStorage，三方從此一致，
   看起來就「修好了」。這正是「明明已經選了還要再點一次」的成因。

   ── 修法 ────────────────────────────────────────────────
   在這裡（每一頁 <head> 的第一支 script，早於所有 store）解析一次並「寫回」
   localStorage。之後任何讀取者拿到的都是實際存在的值，退路根本不會被觸發——
   就算日後有人新增第四個 store 又寫了不同的退路，也不會再分岐。
   ============================================================ */
/* ── Admin 進入某位創作者的工作區（2026-08-07）────────────────────────
   規格 §4.1：Admin 從 Creator 管理選定並進入某 Artist 工作區之後，導航才顯示
   該 Artist 的模組。原型裡「這是誰的工作區」＝哪一份 demo 資料集（persona），
   所以帶著身分的連結長這樣：

     project-detail.html?id=<項目 id>&creator=<persona>&from=<來源 Admin 頁>

   `creator` 在這裡（每頁第一支 script、早於所有 store）就套用，落地頁的資料
   才會是那位創作者的。同時把這趟代管記進 ztor.adminHandoff，供 js/sidebar.js
   畫既有的「代管中 + 返回」列（站上只有那一套標示，不另做第二種）。

   ⚠ persona 是 demo 機制（cheat code 的假資料人物開關），不是產品功能——真實
     系統的「進入誰的工作區」由後端授權，不會是網址上的一個參數。見 ASSUMPTIONS。 */
(function seedPersona() {
  var KEY = "ztor.persona";
  var HANDOFF = "ztor.adminHandoff";
  var VALID = ["default", "nick", "userB"];
  /* 本機／demo 的預設人格＝周湯豪（沿用 i18n.js 原本的 [local-default]，
     也是 cheat code 面板本來就高亮的那一個）。上游為 'default'。 */
  var FALLBACK = "nick";
  var asked = null, from = "";
  function stripHandoffParams(q) {
    try {
      q.delete("creator"); q.delete("from");
      var s = q.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
    } catch (_) {}
  }
  try {
    var q = new URLSearchParams(location.search);
    asked = q.get("creator");
    from = q.get("from") || "";
    if (VALID.indexOf(asked) < 0) asked = null;
  } catch (_) { asked = null; }
  try {
    var p = localStorage.getItem(KEY);
    if (asked) p = asked;
    if (VALID.indexOf(p) < 0) p = FALLBACK;
    if (p !== localStorage.getItem(KEY)) localStorage.setItem(KEY, p);
    if (asked) {
      /* 顯示名由來源頁在點擊當下寫入（它手上就有創作者名字）；同一個人再進來一次
         不要把名字洗掉，所以沿用既有那一份。 */
      var prev = null;
      try { prev = JSON.parse(localStorage.getItem(HANDOFF) || "null"); } catch (_) {}
      localStorage.setItem(HANDOFF, JSON.stringify({
        persona: asked,
        from: from,
        name: (prev && prev.persona === asked && prev.name) || ""
      }));
      /* 「現在代管誰」只有一個位子：從審核頁交接進來就取代掉先前從 Creator 名冊
         選的那一位，否則導航會同時有兩個代管對象、返回鍵指錯地方。 */
      localStorage.removeItem("ztor.activeCreator");
      /* 交接參數是一次性的指令，用完就從網址上收掉——留著的話，這一頁往後每一次
         重新載入都會再套用一次，cheat code 換人格時的 reload 會被它蓋回去，看起來
         像切換失效。身分本身已經寫進 localStorage，網址不需要再記一份。 */
      stripHandoffParams(q);
    }
    window.ztorPersonaId = function () { return p; };
  } catch (_) {
    /* localStorage 被封鎖（無痕／第三方 cookie 政策）時仍要有一致的答案，
       否則就退回原本各自為政的狀態。 */
    window.ztorPersonaId = function () { return asked || FALLBACK; };
  }
})();

/* ============================================================
   內嵌模式（2026-07-28 使用者裁示：清單點進細節要用覆蓋層，不要導航離開）

   任何頁面帶 ?embed=1 載入時，在 <html> 標上 data-embed。詳情頁被 detail-sheet
   放進 iframe 時就是這樣載入的：全域導覽與外殼留白由 CSS 收掉（見 shared.css
   「內嵌模式」一節），頁面本身的內容一行都不用改——覆蓋層裡看到的就是同一頁。

   為什麼標在 <html> 而不是等 JS 跑完再加 class：這支是每頁 <head> 的第一支
   script，標在這裡的話 CSS 在第一次算繪前就知道要收掉導覽，
   不會先閃一下側欄再消失。 */
(function markEmbedMode() {
  try {
    /* 兩個判準，缺一不可（第二個為 2026-08-18 補）：
         ?embed=1        — 覆蓋層第一次載入那一頁時加的參數
         被嵌在 iframe 裡 — 在覆蓋層**內部**再導航一次時的唯一線索
       只看參數會漏掉後者：從母活動的系列清單點進子場次，是 iframe 自己換頁，
       新網址沒有帶 embed，於是覆蓋層裡長出第二套側欄與頁尾（使用者 2026-08-18 回報）。
       「在別人的框裡」本來就等於「不要畫自己的全域導覽」，判斷放在這裡最貼近事實，
       不必要求每一個頁內連結都記得把參數接上。 */
    var embedded = new URLSearchParams(location.search).get('embed') === '1';
    var framed = false;
    try { framed = window.self !== window.top; } catch (_) { framed = true; }   // 跨源存取被擋＝確實在別人的框裡
    if (embedded || framed) {
      document.documentElement.setAttribute('data-embed', '1');
    }
  } catch (_) {}
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
  /* file:// 直接開檔時跳過（2026-08-13）：預載一律帶 crossOrigin，而 file: origin
     的 CORS 請求必定被擋，三個字面各留一則紅色 console 錯誤，看起來像站壞了。
     擋掉的只是「預載」——字型本身由 fonts.css 的 @font-face 照常載入，畫面正常，
     只是少了那一層防換字保險（第一次開可能閃一下標題字）。 */
  if (location.protocol === "file:") return;
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
