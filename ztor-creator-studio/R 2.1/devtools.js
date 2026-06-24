/* ============================================================
   Ztor Creator Studio · R 2.1 — Dev Tools (prototype state harness)
   ------------------------------------------------------------
   原型情境切換 + 元素 inspector 的浮動面板。純前端、自包含，
   但**樣式走我們的 design system tokens**（var(--surface)/--primary/
   --border/--foreground…），所以亮/暗色自動跟著 app 走。

   開啟方式：**只有 Alt(Option) ＋ 右鍵**（按著 Alt 才攔截 contextmenu；
     純右鍵保留瀏覽器原生選單）。未開啟時右下角不顯示任何東西。
     Esc 或面板的 × 關閉。

   狀態：localStorage `ztor.devstate` ＋同步 URL 參數
     （?data=…&event=…&skip=1），可用連結分享情境。
   對外 API：window.ztorDevState.get()/set(patch)/on(cb)；
     變更派發 document 事件 `ztor:devstate-changed`（逐功能接、非逐頁改）。
   外觀類切換（Theme / Language / Display mode·版面）不屬 devstate：
     直接驅動既有系統 window.ztorTheme（theme.js）、window.setLang（i18n.js）、
     window.ztorNavMode（theme.js），各自持久化；面板只讀現值高亮、點擊呼叫其 API，
     並監聽其事件在面板開啟時同步高亮。

   Inspector：面板內「Inspect element」開關。開啟後 hover 頁面元素即高亮，
     面板即時讀出 selector／尺寸／盒模型／字體與顏色；點擊鎖定該元素。
     （評估過 eruda / dom-inspector 等現成品：不是太重就是樣式不合 DS，
       故自寫精簡版，約 80 行，純讀取、不改頁面。）
   ============================================================ */
(function () {
  if (window.__ztorDevToolsMounted) return;
  window.__ztorDevToolsMounted = true;

  var DATA = [
    ['empty', 'Empty', '帳號下尚無任何內容（含第一次進站）'],
    ['has-data', 'Has Data', '已建立過任何內容（預設）'],
  ];
  var EVENTDAY = [
    ['no-event', 'No Event', '沒有進行中的活動（預設）'],
    ['pre-event', 'Pre-Event', '活動開始前'],
    ['live', 'Live', '活動進行中'],
    ['post-event', 'Post-Event', '活動結束後'],
    ['multi-event', 'Multi-Event', '同時多場活動'],
  ];
  /* 外觀類切換：直接驅動既有系統（theme.js / i18n.js），
     各自持久化，不併入 devstate；面板只讀現值高亮、點擊呼叫其 API。*/
  var THEME = [
    ['light', 'Light', '強制亮色'],
    ['dark', 'Dark', '強制暗色'],
    ['system', 'System', '跟隨系統（預設）'],
  ];
  var LANG = [
    ['en', 'English', '英文（預設）'],
    ['zh-Hant', '中文', '繁體中文'],
  ];
  var NAV = [
    ['topbar', 'Topbar', '水平頂列（預設）'],
    ['sidebar', 'Sidebar', '左側直欄'],
  ];
  function curTheme() { return (window.ztorTheme && window.ztorTheme.getPreference && window.ztorTheme.getPreference()) || 'system'; }
  function curLang() { return document.documentElement.lang === 'zh-Hant' ? 'zh-Hant' : 'en'; }
  function curNav() { return (window.ztorNavMode && window.ztorNavMode.get && window.ztorNavMode.get()) || 'topbar'; }

  var DEFAULTS = { skipValidation: false, data: 'has-data', eventDay: 'no-event' };
  var LS = 'ztor.devstate';

  function load() {
    var s = Object.assign({}, DEFAULTS);
    try { Object.assign(s, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
    var q = new URLSearchParams(location.search);
    if (q.has('data')) s.data = q.get('data');
    if (q.has('event')) s.eventDay = q.get('event');
    if (q.has('skip')) s.skipValidation = q.get('skip') === '1' || q.get('skip') === 'true';
    return s;
  }
  var state = load();
  var listeners = [];

  function persist() {
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
    var q = new URLSearchParams(location.search);
    q.set('data', state.data);
    q.set('event', state.eventDay);
    if (state.skipValidation) q.set('skip', '1'); else q.delete('skip');
    history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
  }
  function emit() {
    var d = Object.assign({}, state);
    /* 把狀態反映到 <html>，任何頁面 / CSS 都能據此反應（通用橋接）*/
    var el = document.documentElement;
    el.setAttribute('data-data-state', state.data);
    el.setAttribute('data-event-day', state.eventDay);
    el.setAttribute('data-skip-validation', state.skipValidation ? '1' : '0');
    listeners.forEach(function (f) { try { f(d); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('ztor:devstate-changed', { detail: d }));
  }

  /* ---- styles：用 design system tokens（亮/暗色自動跟隨）---- */
  var css = ''
    + '.ztd{font-family:var(--font-ui,system-ui,sans-serif)}'
    + '.ztd *{box-sizing:border-box}'
    + '.ztd__panel{display:none;position:fixed;right:18px;bottom:18px;z-index:2147483000;width:344px;max-width:calc(100vw - 36px);'
    + 'height:auto;min-height:220px;max-height:calc(100vh - 36px);overflow:auto;resize:vertical;'  /* resize:vertical → 右下角原生握把可調高度 */
    + 'background:var(--surface);color:var(--foreground);border:1px solid var(--border);border-radius:var(--radius-xl,16px);'
    + '-webkit-backdrop-filter:var(--overlay-blur);backdrop-filter:var(--overlay-blur);'  /* 暗色 --surface 半透明，毛玻璃避免透出後方（同全域浮層治理）*/
    + 'box-shadow:0 16px 48px rgba(0,0,0,.18),0 2px 6px rgba(0,0,0,.06)}'
    + '.ztd.is-open .ztd__panel{display:block}'
    + '.ztd__head{display:flex;align-items:center;gap:10px;padding:15px 16px;border-bottom:1px solid var(--border);cursor:move;user-select:none}'  /* 標題列＝拖移把手 */
    + '.ztd__title{font-size: var(--fs-14);font-weight: var(--fw-semibold);flex:1}'
    + '.ztd__head svg,.ztd__iconbtn svg{width:18px;height:18px}'
    + '.ztd__iconbtn{width:30px;height:30px;display:inline-grid;place-items:center;border:0;border-radius:var(--radius-md,7px);background:transparent;color:var(--foreground-muted);cursor:pointer}'
    + '.ztd__iconbtn:hover{background:var(--surface-muted);color:var(--foreground)}'
    + '.ztd__iconbtn.is-on{background:var(--primary);color:var(--primary-foreground)}'
    + '.ztd__body{padding:14px 16px 4px}'
    + '.ztd__group{margin-bottom:16px}'
    + '.ztd__group-label{font-size: var(--fs-11);font-weight: var(--fw-semibold);letter-spacing:.06em;color:var(--foreground-subtle);text-transform:uppercase;margin:0 0 9px}'
    /* 開關列＝標籤＋真 switch（橘只出現在滑軌，量很小）。比照 ds switch.css */
    + '.ztd__row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:11px 13px;'
    + 'border:1px solid var(--border);border-radius:var(--radius-md,7px);background:var(--surface);color:var(--foreground);'
    + 'font:inherit;font-size: var(--fs-13);font-weight: var(--fw-medium);cursor:pointer;text-align:left}'
    + '.ztd__row:hover{background:var(--surface-muted)}'
    + '.ztd__sw{position:relative;width:36px;height:20px;flex:none;background:var(--surface-muted);border-radius:999px;box-shadow:0 0 0 1px var(--border);transition:background .2s ease}'
    + '.ztd__sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--surface);box-shadow:0 1px 2px rgba(0,0,0,.15);transition:left .15s ease}'
    + '.ztd__row.is-on .ztd__sw{background:var(--primary);box-shadow:none}'
    + '.ztd__row.is-on .ztd__sw::after{left:18px}'
    /* 單選選項：選中＝淡橘 tint＋細橘環（比照 ds selection-card--active），不再整塊橘 */
    + '.ztd__grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.ztd__opt{padding:11px 13px;border:1px solid var(--border);border-radius:var(--radius-md,7px);background:var(--surface);'
    + 'color:var(--foreground);font:inherit;font-size: var(--fs-13);font-weight: var(--fw-medium);cursor:pointer;text-align:left}'
    + '.ztd__opt:hover{background:var(--surface-muted)}'
    + '.ztd__opt.is-active{background:color-mix(in srgb,var(--primary) 14%,var(--surface));box-shadow:inset 0 0 0 1.5px var(--primary);border-color:transparent}'
    + '.ztd__opt-desc{display:block;font-size: var(--fs-11);font-weight: var(--fw-regular);color:var(--foreground-subtle);margin-top:4px;line-height:1.4}'   /* 說明預設常駐 */
    /* 縮小：只留 header，body／foot 收起，面板高度回到 auto（蓋掉 resize 存的高度）*/
    + '.ztd.is-min .ztd__body,.ztd.is-min .ztd__foot{display:none}'
    + '.ztd.is-min .ztd__panel{min-height:0;height:auto!important;resize:none}'
    + '.ztd.is-min .ztd__head{border-bottom:0}'
    + '.ztd__foot{padding:11px 16px;border-top:1px solid var(--border);font-size: var(--fs-11);color:var(--foreground-subtle);'
    + 'display:flex;align-items:center;justify-content:space-between;gap:10px}'
    + '.ztd__reset{background:transparent;border:0;color:var(--foreground-muted);font:inherit;font-size: var(--fs-12);cursor:pointer;text-decoration:underline;padding:0}'
    + '.ztd__reset:hover{color:var(--foreground)}'
    /* inspector readout */
    + '.ztd__inspect{border:1px solid var(--border);border-radius:var(--radius-md,7px);overflow:hidden}'
    + '.ztd__inspect-empty{padding:13px 14px;font-size: var(--fs-12);color:var(--foreground-subtle)}'
    + '.ztd__inspect-row{display:flex;gap:10px;padding:9px 14px;font-size: var(--fs-12);border-top:1px solid var(--border)}'
    + '.ztd__inspect-row:first-child{border-top:0}'
    + '.ztd__inspect-k{flex:0 0 64px;color:var(--foreground-subtle)}'
    + '.ztd__inspect-v{flex:1;min-width:0;color:var(--foreground);font-family:var(--font-mono,ui-monospace,monospace);word-break:break-all}'
    + '.ztd__inspect.is-locked{outline:2px solid var(--primary);outline-offset:-1px}'
    + '.ztd__badge{display:inline-block;padding:1px 8px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-weight: var(--fw-semibold)}'
    + '.ztd__muted{color:var(--foreground-subtle)}'
    /* highlight overlay：非元件＝藍框；是元件＝橘框（一眼分辨）*/
    + '.ztd-hl{position:fixed;z-index:2147482999;pointer-events:none;border:1.5px solid var(--status-info,#266DF0);'
    + 'background:color-mix(in srgb,var(--status-info,#266DF0) 12%,transparent);border-radius:2px;display:none}'
    + '.ztd-hl.is-on{display:block}'
    + '.ztd-hl--component{border-color:var(--primary);background:color-mix(in srgb,var(--primary) 16%,transparent)}'
    + '.ztd-hl__tag{position:absolute;top:-22px;left:0;white-space:nowrap;font:var(--fs-11)/1.6 var(--font-mono,ui-monospace,monospace);'
    + 'padding:1px 6px;border-radius:4px;background:var(--surface-inverse,#000);color:var(--foreground-on-inverse,#fff)}'
    + '.ztd-hl--component .ztd-hl__tag{background:var(--primary);color:var(--primary-foreground)}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- inline icons ---- */
  var SPARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var MIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';        // 縮小（減號）
  var EXPAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';   // 展開（向下）

  function optsHtml(list, current, kind) {
    return list.map(function (o) {
      return '<button class="ztd__opt' + (o[0] === current ? ' is-active' : '') + '" data-kind="' + kind + '" data-val="' + o[0] + '">'
        + o[1] + '<span class="ztd__opt-desc">' + o[2] + '</span></button>';
    }).join('');
  }

  /* ---- 面板位置／高度（拖移＋resize）持久化 ---- */
  var GEO = 'ztor.devtools.geo';
  var geo = (function () { try { return JSON.parse(localStorage.getItem(GEO) || '{}') || {}; } catch (e) { return {}; } })();
  function saveGeo() { try { localStorage.setItem(GEO, JSON.stringify(geo)); } catch (e) {} }
  function applyGeo() {
    var p = root.querySelector('.ztd__panel'); if (!p) return;
    if (geo.left != null && geo.top != null) {
      var L = Math.max(6, Math.min(geo.left, window.innerWidth - 60));
      var T = Math.max(6, Math.min(geo.top, window.innerHeight - 60));
      p.style.left = L + 'px'; p.style.top = T + 'px'; p.style.right = 'auto'; p.style.bottom = 'auto';
    }
    if (geo.height) p.style.height = geo.height + 'px';
  }

  var root = document.createElement('div');
  root.className = 'ztd';
  function paint() {
    var min = root.classList.contains('is-min');
    root.innerHTML = ''
      + '<div class="ztd__panel" role="dialog" aria-label="Cheat Codes">'
      +   '<div class="ztd__head">' + SPARK + '<span class="ztd__title">Cheat Codes</span>'
      +     '<button class="ztd__iconbtn" data-act="minimize" aria-label="' + (min ? 'Expand' : 'Minimize') + '">' + (min ? EXPAND : MIN) + '</button>'
      +     '<button class="ztd__iconbtn" data-act="close" aria-label="Close">' + CLOSE + '</button>'
      +   '</div>'
      +   '<div class="ztd__body">'
      +     '<div class="ztd__group"><p class="ztd__group-label">Inspect</p>'
      +       '<button class="ztd__row' + (inspecting ? ' is-on' : '') + '" data-act="toggle-inspect"><span>Inspect element</span><span class="ztd__sw"></span></button>'
      +       '<div class="ztd__inspect" id="ztd-inspect" style="margin-top:8px"><div class="ztd__inspect-empty">開啟後把游標移到頁面元素；點擊鎖定。橘框＝已建立元件、藍框＝非元件。</div></div>'
      +     '</div>'
      +     '<div class="ztd__group"><p class="ztd__group-label">Validation</p>'
      +       '<button class="ztd__row' + (state.skipValidation ? ' is-on' : '') + '" data-act="toggle-skip"><span>Skip validation</span><span class="ztd__sw"></span></button>'
      +     '</div>'
      +     '<div class="ztd__group"><p class="ztd__group-label">Data State</p>'
      +       '<div class="ztd__grid">' + optsHtml(DATA, state.data, 'data') + '</div></div>'
      +     '<div class="ztd__group"><p class="ztd__group-label">Event Day</p>'
      +       '<div class="ztd__grid">' + optsHtml(EVENTDAY, state.eventDay, 'eventDay') + '</div></div>'
      +     '<div class="ztd__group"><p class="ztd__group-label">Theme</p>'
      +       '<div class="ztd__grid">' + optsHtml(THEME, curTheme(), 'theme') + '</div></div>'
      +     '<div class="ztd__group"><p class="ztd__group-label">Language</p>'
      +       '<div class="ztd__grid">' + optsHtml(LANG, curLang(), 'lang') + '</div></div>'
      +     '<div class="ztd__group"><p class="ztd__group-label">Display mode · 版面</p>'
      +       '<div class="ztd__grid">' + optsHtml(NAV, curNav(), 'nav') + '</div></div>'
      +   '</div>'
      +   '<div class="ztd__foot"><button class="ztd__reset" data-act="reset">Reset</button>'
      +     '<span class="ztd__muted">Alt＋右鍵 開關 · 拖標題移動 · 拉底邊調高</span></div>'
      + '</div>';
    applyGeo();
  }
  var OPEN_LS = 'ztor.devtools.open';   // 跨頁記住開/關，換頁不被重置
  var MIN_LS = 'ztor.devtools.min';     // 跨頁記住縮小/展開
  try { if (localStorage.getItem(MIN_LS) === '1') root.classList.add('is-min'); } catch (e) {}
  paint();
  document.body.appendChild(root);
  /* 跨頁還原開啟狀態：上一頁開著就自動開（換頁不再被關掉）*/
  try { if (localStorage.getItem(OPEN_LS) === '1') open(); } catch (e) {}

  var hl = document.createElement('div');
  hl.className = 'ztd-hl';
  hl.innerHTML = '<span class="ztd-hl__tag"></span>';
  document.body.appendChild(hl);

  function open() { root.classList.add('is-open'); applyGeo(); try { localStorage.setItem(OPEN_LS, '1'); } catch (e) {} }
  function close() { root.classList.remove('is-open'); setInspect(false); try { localStorage.setItem(OPEN_LS, '0'); } catch (e) {} }
  /* is-open / is-min 在 root 上、innerHTML 只換子節點故會保留；inspect 由 paint 讀 `inspecting` 渲染 */
  function update() { paint(); persist(); emit(); }

  /* ---- 已建立元件對照表（block class 根 → 元件名）。
     **自動**從頁面載入的 ds-components/*.css 推導：掃每支元件 CSS 的規則、
     取每條 selector 第一個 class 的 block 根，對應到「檔名→元件名」。
     頁面用到的元件其 CSS 必然載入，故涵蓋永遠正確、新元件免手動維護。
     少數住 shared.css 的元件（stepper / wizard / app-sidebar）以小清單補上。
     （file:// 直開會因 SecurityError 讀不到 cssRules，退回只剩補充清單；
       以 http / Vercel 開啟則完整。）---- */
  function blockOf(cls) { return cls.split('__')[0].split('--')[0]; }
  var NAME_OVERRIDE = {
    'kpi': 'KPI tile', 'header': 'App nav · topbar', 'dropdown-menu': 'Dropdown menu',
    'selection-card': 'Selection card', 'store-settings': 'Store settings', 'field-system': 'Field system',
    'payout-modal': 'Payout modal', 'cookie-banner': 'Cookie banner', 'empty-stub': 'Empty stub',
    'page-intro': 'Page intro', 'product-list': 'Product list', 'project-list': 'Project list',
    'preview-card': 'Preview card', 'preview-panel': 'Preview panel', 'readiness': 'Readiness card',
    'upload-tile': 'Upload tile', 'field-pill': 'Field pill', 'data-list': 'Data list',
  };
  function prettyName(stem) {
    if (NAME_OVERRIDE[stem]) return NAME_OVERRIDE[stem];
    return stem.replace(/-/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }
  var REG = {};
  function collectRules(rules, name) {
    for (var j = 0; j < rules.length; j++) {
      var r = rules[j];
      if (r.selectorText) {
        var m = r.selectorText.match(/\.[A-Za-z][\w-]*/);   // 該 selector 第一個 class
        if (m) { var b = blockOf(m[0].slice(1)); if (!REG[b]) REG[b] = name; }
      } else if (r.cssRules) { collectRules(r.cssRules, name); }   // @media 等遞迴
    }
  }
  // 檔名 ≠ 主 class 根的少數元件（file:// 後備用，cssRules 讀不到時仍能認出）
  var FILE_BLOCK_ALIAS = { 'button': 'btn', 'field-system': 'field' };
  function buildReg() {
    REG = { 'stepper': 'Stepper', 'wizard': 'Wizard frame', 'app-sidebar': 'App nav · sidebar', 'app-topbar': 'App nav · topbar' };  // shared.css 持有的元件，手動補充
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var href = sheets[i].href || '';
      if (href.indexOf('/ds-components/') < 0) continue;
      var file = href.split('/').pop().split('?')[0].replace('.css', '');
      if (file === '_tokens' || file === 'fonts' || file === 'navigation-menu') continue;
      // 檔名／別名後備 key：即使 cssRules 被擋（file://），多數「主 class＝檔名」的元件仍能認出
      if (!REG[file]) REG[file] = prettyName(file);
      if (FILE_BLOCK_ALIAS[file] && !REG[FILE_BLOCK_ALIAS[file]]) REG[FILE_BLOCK_ALIAS[file]] = prettyName(file);
      var rules; try { rules = sheets[i].cssRules; } catch (e) { continue; }   // 跨來源/file:// → 至少留檔名/別名 key
      if (rules) collectRules(rules, prettyName(file));
    }
  }
  buildReg();
  function componentOf(el) {
    if (!el || !el.getAttribute) return null;
    var classes = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
    for (var i = 0; i < classes.length; i++) { if (REG[blockOf(classes[i])]) return REG[blockOf(classes[i])]; }
    return null;
  }
  function containerComponent(el) {
    var n = el.parentElement;
    while (n && n !== document.body) { var c = componentOf(n); if (c) return c; n = n.parentElement; }
    return null;
  }

  /* ---- inspector ---- */
  var inspecting = false, locked = null;
  function setInspect(on) {
    if (on) buildReg();   // 重建對照表，涵蓋初始化後才載入的元件 CSS
    inspecting = on; locked = null;
    var btn = root.querySelector('[data-act="toggle-inspect"]');
    if (btn) btn.classList.toggle('is-on', on);
    var box = root.querySelector('#ztd-inspect');
    if (box) box.classList.remove('is-locked');
    if (!on) { hl.classList.remove('is-on'); if (box) box.innerHTML = '<div class="ztd__inspect-empty">開啟後把游標移到頁面元素；點擊鎖定。橘框＝已建立元件、藍框＝非元件。</div>'; }
  }
  function selectorOf(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
    if (cls.length) s += '.' + cls.join('.');
    return s;
  }
  function rowsFor(el) {
    var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    function row(k, v) { return '<div class="ztd__inspect-row"><span class="ztd__inspect-k">' + k + '</span><span class="ztd__inspect-v">' + v + '</span></div>'; }
    var comp = componentOf(el), inside = comp ? null : containerComponent(el);
    var compVal = comp ? '<span class="ztd__badge">' + comp + '</span>'
      : (inside ? '<span class="ztd__muted">— 非元件 class（位於 ' + inside + ' 內）</span>'
        : '<span class="ztd__muted">— 非元件 class（純 DOM 元素）</span>');
    return row('component', compVal)
      + row('class', selectorOf(el))
      + row('size', Math.round(r.width) + ' × ' + Math.round(r.height))
      + row('box', 'm ' + cs.margin.replace(/px/g, '') + ' · p ' + cs.padding.replace(/px/g, '') + ' · b ' + parseInt(cs.borderTopWidth) )
      + row('type', cs.fontSize + ' ' + (cs.fontFamily.split(',')[0].replace(/["']/g, '')) + ' ' + cs.fontWeight)
      + row('color', cs.color + (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? ' · bg ' + cs.backgroundColor : ''));
  }
  /* elementFromPoint 會跳過 pointer-events:none 的元素（如 disabled 按鈕），
     回傳上一層。這裡用 getBoundingClientRect 往下精修到「座標落在的最深子元素」，
     讓 inspect 也選得到 disabled / pointer-events:none 的元素。 */
  function refine(el, x, y) {
    var node = el, descended = true;
    while (descended) {
      descended = false;
      var kids = node.children;
      for (var i = kids.length - 1; i >= 0; i--) {   // 反向＝接近上層 paint order
        var c = kids[i];
        if (c.closest && c.closest('.ztd')) continue;
        var r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          node = c; descended = true; break;
        }
      }
    }
    return node;
  }
  function showHl(el) {
    var r = el.getBoundingClientRect();
    hl.style.left = r.left + 'px'; hl.style.top = r.top + 'px';
    hl.style.width = r.width + 'px'; hl.style.height = r.height + 'px';
    hl.classList.add('is-on');
    var comp = componentOf(el);
    hl.classList.toggle('ztd-hl--component', !!comp);
    hl.querySelector('.ztd-hl__tag').textContent = (comp ? comp + ' · ' : '') + selectorOf(el) + '  ' + Math.round(r.width) + '×' + Math.round(r.height);
  }
  function readout(el) {
    var box = root.querySelector('#ztd-inspect'); if (box) box.innerHTML = rowsFor(el);
  }
  document.addEventListener('mousemove', function (e) {
    if (!inspecting || locked) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.closest('.ztd') || el === hl || el.closest('.ztd-hl')) return;
    el = refine(el, e.clientX, e.clientY);
    showHl(el); readout(el);
  }, true);
  document.addEventListener('click', function (e) {
    if (!inspecting) return;
    if (e.target.closest('.ztd')) return;     // 面板內互動照常
    e.preventDefault(); e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.closest('.ztd')) return;
    el = refine(el, e.clientX, e.clientY);
    locked = el; showHl(el); readout(el);
    var box = root.querySelector('#ztd-inspect'); if (box) box.classList.add('is-locked');
  }, true);
  window.addEventListener('scroll', function () { if (inspecting && locked) showHl(locked); }, true);

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act],[data-kind]');
    if (!btn) return;
    var act = btn.getAttribute('data-act');
    if (act === 'close') return close();
    if (act === 'minimize') { var m = root.classList.toggle('is-min'); try { localStorage.setItem(MIN_LS, m ? '1' : '0'); } catch (e) {} return paint(); }
    if (act === 'reset') { state = Object.assign({}, DEFAULTS); setInspect(false); return update(); }
    if (act === 'toggle-skip') { state.skipValidation = !state.skipValidation; return update(); }
    if (act === 'toggle-inspect') { setInspect(!inspecting); return; }
    var kind = btn.getAttribute('data-kind');
    if (!kind) return;
    var val = btn.getAttribute('data-val');
    /* 外觀類：呼叫既有系統（自行持久化），再 repaint 更新高亮；不動 devstate */
    if (kind === 'theme') { if (window.ztorTheme) window.ztorTheme.setPreference(val); return paint(); }
    if (kind === 'lang')  { if (window.setLang) window.setLang(val); return paint(); }
    if (kind === 'nav')   { if (window.ztorNavMode) window.ztorNavMode.set(val); return paint(); }
    state[kind] = val; update();
  });

  /* 拖移：標題列為把手（避開頭部按鈕）。拖移後改用 left/top 定位 */
  root.addEventListener('pointerdown', function (e) {
    var head = e.target.closest('.ztd__head'); if (!head) return;
    if (e.target.closest('.ztd__iconbtn')) return;
    var p = root.querySelector('.ztd__panel'); var r = p.getBoundingClientRect();
    var ox = e.clientX - r.left, oy = e.clientY - r.top;
    p.style.right = 'auto'; p.style.bottom = 'auto'; p.style.left = r.left + 'px'; p.style.top = r.top + 'px';
    function mv(ev) {
      p.style.left = Math.max(6, Math.min(window.innerWidth - r.width - 6, ev.clientX - ox)) + 'px';
      p.style.top = Math.max(6, Math.min(window.innerHeight - 44, ev.clientY - oy)) + 'px';
    }
    function up() {
      document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up);
      geo.left = parseInt(p.style.left); geo.top = parseInt(p.style.top); geo.height = p.offsetHeight; saveGeo();
    }
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    e.preventDefault();
  });
  /* 原生 resize（CSS resize:vertical）結束後存高度 */
  document.addEventListener('mouseup', function () {
    if (!root.classList.contains('is-open')) return;
    var p = root.querySelector('.ztd__panel'); if (!p) return;
    if (p.offsetHeight !== geo.height) { geo.height = p.offsetHeight; saveGeo(); }
  });

  /* Alt(Option) ＋ 右鍵：唯一開啟入口；純右鍵不攔截 */
  document.addEventListener('contextmenu', function (e) {
    if (!e.altKey) return;
    e.preventDefault();
    root.classList.contains('is-open') ? close() : open();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (inspecting) { setInspect(false); return; }
    if (root.classList.contains('is-open')) close();
  });

  /* 從別處（topbar 按鈕、Settings）改了主題/語言/版面時，面板開著就同步高亮 */
  function syncAppearance() { if (root.classList.contains('is-open') && !inspecting) paint(); }
  document.addEventListener('ztor:theme-changed', syncAppearance);
  document.addEventListener('ztor:navmode-changed', syncAppearance);
  document.addEventListener('i18n:applied', syncAppearance);

  window.ztorDevState = {
    get: function () { return Object.assign({}, state); },
    set: function (patch) { Object.assign(state, patch || {}); update(); },
    on: function (cb) { if (typeof cb === 'function') listeners.push(cb); },
  };
  emit();
})();
