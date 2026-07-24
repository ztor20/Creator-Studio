/* ============================================================
   Ztor Creator Studio · R 2.1 — Dev Tools (prototype state harness)
   ------------------------------------------------------------
   原型情境切換 + 元素 inspector 的浮動面板。純前端、自包含，
   但**樣式走我們的 design system tokens**（var(--card)/--primary/
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
    ['dark', 'Dark', '強制暗色（預設）'],
    ['light', 'Light', '強制亮色'],
    ['system', 'System', '跟隨系統'],
  ];
  var LANG = [
    ['en', 'English', '英文（預設）'],
    ['zh-Hant', '中文', '繁體中文'],
  ];
  var NAV = [
    ['topbar', 'Topbar', '水平頂列（預設）'],
    ['sidebar', 'Sidebar', '左側直欄'],
  ];
  /* ---- 版本（最高級別 gate）：讀 feature-scope-map.md 重新配置 ----
     一份 md 當單一真相：版本清單＋規則取自其「## 開發版本配置」表，
     功能→tier 取自各 pillar 功能表的 🟢/🔵/⚪ 欄。fetch 失敗（file://）用內建後備。
     規則語法：all｜tier:p1,next｜feat:ID／-feat:ID｜page:原頁=變體（特殊版換頁，行為製作時定）。
     減功能型靠元素的 data-feat → tier 比對；特殊版（page:）不減功能、換頁行為待接。
     data-feat＝功能在版本內才顯示；data-feat-off＝功能「不」在版本內才顯示（base／預設呈現），
     兩者同位置成對即可做「Phase 1 用預設、Next+ 換升級版」的呈現切換（如 S31.1 低庫存門檻）。*/
  var TIER_EMOJI = { '🟢': 'p1', '🔵': 'next', '⚪': 'tbd' };
  /* 每筆：[鍵, 顯示名, 類型(開發/測試), 規則, 說明]。類型用於分組（測試版自成一組）。*/
  var VERSIONS = [
    ['p1', 'Phase 1（Phase 1）', '開發', 'tier:p1', '內部首發'],
    ['p1-next', 'Phase 2（Phase 1 ＋ Next）', '開發', 'tier:p1,next', '首發＋規劃追加'],
    ['p1-next-tbd', 'Phase 3（Phase 1 ＋ Next ＋ TBD）', '開發', 'tier:p1,next,tbd', '＋商務待定（TBD）'],
    ['full', 'Phase 4（最終完整版）', '開發', 'all', '全部功能（預設）'],
    ['funding-test', 'r2.1_funding-test', '測試', 'route:create-project.html=funding-test/create-campaign.html', '建立專案改接募資建立流程'],
    ['deck-for-sony', 'Deck for Sony', 'Demo', 'route:earnings.html=earnings-sony.html', '收入管理改為 Sony 簡報版，其餘同 Phase 4'],
  ];
  /* `full` 是版本 gate 的保留 tier，不是 feature-scope-map 的產品 ID。
     必須在 md 尚未載入或 fetch 失敗時也成立，否則 Phase 1 會短暫漏顯 full-only 功能。 */
  /* 載入前／失敗後的安全後備：非 P1 gate 不能因 fetch 問題降格成 P1。 */
  var FEAT_TIER = {
    full: 'full', S05: 'next', S06: 'next', S11: 'tbd', S24: 'tbd', 'S31.1': 'next', S45: 'tbd',
    O04: 'tbd', O09: 'tbd', O17: 'next', O18: 'tbd', O22: 'next', O23: 'next',
    E08: 'next', E09: 'next', E13: 'tbd', E14: 'tbd', E15: 'tbd', E16: 'tbd', E17: 'tbd', E18: 'next', E20: 'next', E22: 'tbd', E23: 'next', E24: 'tbd'
  };   // { S30:'p1', … } 由 md 功能表填
  var FULL_ROUTES = {
    'index.html': 1, 'creators.html': 1, 'projects.html': 1, 'project-detail.html': 1, 'create-project.html': 1,
    'create-campaign.html': 1, 'funding-simulate.html': 1, 'events.html': 1, 'event-detail.html': 1, 'create-event.html': 1,
    'fans-crm.html': 1, 'fan-detail.html': 1, 'tier-settings.html': 1, 'my-ip.html': 1, 'ip-detail.html': 1,
    'ip-market.html': 1, 'register-ip.html': 1, 'pickup.html': 1, 'pickup-detail.html': 1, 'scanner.html': 1, 'settings.html': 1
  };
  function featTier(id) { return FEAT_TIER[id.trim()] || (id.trim() === 'full' ? 'full' : 'p1'); }
  function parseScopeMd(txt) {
    var lines = txt.split('\n'), vs = [], inVer = false;
    lines.forEach(function (ln) {
      if (/^##\s*開發版本配置/.test(ln)) { inVer = true; return; }
      if (inVer && /^##\s/.test(ln)) inVer = false;
      if (inVer) {
        var m = ln.match(/^\|\s*`?([\w.-]+)`?\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*`?([^|`]+?)`?\s*\|\s*([^|]*?)\s*\|/);
        if (m && m[1] !== '鍵' && !/^-+$/.test(m[1])) vs.push([m[1], m[2], m[3], m[4], m[5]]);
      }
    });
    if (vs.length) VERSIONS = vs;
    lines.forEach(function (ln) {
      var idm = ln.match(/\|\s*`([SOEB]\d{2}(?:\.\d+)?)`\s*\|/);
      if (!idm) return;
      for (var em in TIER_EMOJI) { if (ln.indexOf(em) >= 0) { FEAT_TIER[idm[1]] = TIER_EMOJI[em]; break; } }
    });
  }
  function curVersionRule() {
    for (var i = 0; i < VERSIONS.length; i++) if (VERSIONS[i][0] === state.version) return VERSIONS[i][3];
    return 'all';
  }
  function tiersForRule(rule) {
    var m = /tier:([\w,]+)/.exec(rule || '');
    return m ? m[1].split(',') : null;   // null ＝ 全部 tier（all／route／page 規則皆不減功能）
  }
  function routesForRule(rule) {
    var out = [];
    (rule || '').split(/\s+/).forEach(function (tok) {
      var m = /^route:([^=]+)=(.+)$/.exec(tok);
      if (m) out.push([m[1], m[2]]);
    });
    return out;
  }
  /* 以 Phase 4（最終完整版）為基底的版本：full 本身，以及只改接個別頁面、
     其餘同 Phase 4 的特殊版（funding-test、deck-for-sony）。這些版本不減功能，
     故 full-only 頁面與跨頁連結照常可見。新增同型特殊版時把 key 加進這裡。 */
  function isFullBaseVersion(v) { return v === 'full' || v === 'funding-test' || v === 'deck-for-sony'; }
  function applyRouteAvailability() {
    var allowFull = isFullBaseVersion(state.version);
    document.querySelectorAll('a[href]').forEach(function (a) {
      var route = (a.getAttribute('href') || '').split(/[?#]/)[0].toLowerCase();
      if (!FULL_ROUTES[route]) return;
      a.classList.toggle('ztd-ver-hidden', !allowFull);
      a.classList.toggle('ztd-ver-future', false); // future preview must never re-open a blocked route
    });
  }
  /* future 是視覺預覽，不是權限提升。被 feature gate 排除的連結可以淡顯，
     但 href／鍵盤焦點必須拿掉；切回可用版本再完整還原。 */
  function setFeatureLinkDisabled(el, disabled) {
    var links = el.matches && el.matches('a[href],a[data-ztd-feat-href]') ? [el] : Array.prototype.slice.call(el.querySelectorAll('a[href],a[data-ztd-feat-href]'));
    links.forEach(function (a) {
      if (disabled) {
        if (a.hasAttribute('href')) { a.setAttribute('data-ztd-feat-href', a.getAttribute('href')); a.removeAttribute('href'); }
        if (a.hasAttribute('tabindex')) a.setAttribute('data-ztd-feat-tabindex', a.getAttribute('tabindex'));
        a.setAttribute('tabindex', '-1'); a.setAttribute('aria-disabled', 'true');
      } else if (a.hasAttribute('data-ztd-feat-href')) {
        a.setAttribute('href', a.getAttribute('data-ztd-feat-href')); a.removeAttribute('data-ztd-feat-href');
        if (a.hasAttribute('data-ztd-feat-tabindex')) { a.setAttribute('tabindex', a.getAttribute('data-ztd-feat-tabindex')); a.removeAttribute('data-ztd-feat-tabindex'); }
        else a.removeAttribute('tabindex');
        a.removeAttribute('aria-disabled');
      }
    });
  }
  /* 版本選項渲染：一行一個、依類型分「開發版本／測試版」兩組。
     mode='onb' 給首次 popup（data-onb 暫存選擇）；否則面板（data-kind=version 立即套用）。*/
  /* 版本依「類型」欄（v[2]）分組：已知類型給友善標題與固定排序，未知類型
     照其在 VERSIONS 中首次出現的順序接在已知組之後。加新組只要在
     feature-scope-map 的「開發版本配置」表填新類型即可，不必再動這裡。 */
  var VER_GROUP_LABEL = { '開發': '開發版本', '測試': '測試版', 'Demo': 'Presentation demo' };
  var VER_GROUP_ORDER = ['開發', '測試', 'Demo'];
  function verRows(current, mode) {
    /* 依類型分組＋排序（面板 dropdown 與首次 popup 大卡片共用同一份分組）*/
    var groups = {}, seen = [];
    VERSIONS.forEach(function (v) {
      var t = v[2] || '開發';
      if (!groups[t]) { groups[t] = []; seen.push(t); }
      groups[t].push(v);
    });
    seen.sort(function (a, b) {
      var ia = VER_GROUP_ORDER.indexOf(a), ib = VER_GROUP_ORDER.indexOf(b);
      ia = ia < 0 ? VER_GROUP_ORDER.length + seen.indexOf(a) : ia;
      ib = ib < 0 ? VER_GROUP_ORDER.length + seen.indexOf(b) : ib;
      return ia - ib;
    });
    /* 面板：原生 <select>＋optgroup（省空間），下方顯示當前版本說明。
       首次 popup（onb）維持大卡片一行一個（進站主選擇，卡片較好點）。*/
    if (mode !== 'onb') {
      var curDesc = '';
      var opts = seen.map(function (t) {
        return '<optgroup label="' + (VER_GROUP_LABEL[t] || t) + '">'
          + groups[t].map(function (v) {
              if (v[0] === current) curDesc = v[4] || '';
              return '<option value="' + v[0] + '"' + (v[0] === current ? ' selected' : '') + '>' + v[1] + '</option>';
            }).join('')
          + '</optgroup>';
      }).join('');
      return '<select class="ztd__select" data-ver-select aria-label="Build version">' + opts + '</select>'
        + '<div class="ztd__select-desc">' + curDesc + '</div>';
    }
    function row(v) {
      return '<button class="ztd__optrow' + (v[0] === current ? ' is-active' : '') + '" data-onb="' + v[0] + '">'
        + '<span class="ztd__optrow-name">' + v[1] + '</span><span class="ztd__optrow-desc">' + (v[4] || '') + '</span></button>';
    }
    return seen.map(function (t) {
      return '<div class="ztd__subgroup">' + (VER_GROUP_LABEL[t] || t) + '</div>'
        + '<div class="ztd__rows-v">' + groups[t].map(row).join('') + '</div>';
    }).join('');
  }
  function applyVersion() {
    var rule = curVersionRule();
    /* 1) 減功能：依 tier 隱藏／標記帶 data-feat 的元素 */
    var allow = tiersForRule(rule);
    document.querySelectorAll('[data-feat]').forEach(function (el) {
      /* data-feat 支援逗號多值（外殼包多個功能時）：任一功能在版本內→顯示；全部不在→藏 */
      var ids = el.getAttribute('data-feat').split(',');
      var inVer = !allow || ids.some(function (id) {
        return allow.indexOf(featTier(id)) >= 0;
      });
      el.classList.toggle('ztd-ver-hidden', !inVer && !state.showFuture);
      el.classList.toggle('ztd-ver-future', !inVer && state.showFuture);
      setFeatureLinkDisabled(el, !inVer);
    });
    /* 1b) 反向閘：data-feat-off 的元素是「該功能未納入版本時才顯示」的 base／預設呈現，
       與同位置的 data-feat 元素成對——功能在版本內（或預覽 future）→ 顯示升級版、收起 base；
       功能不在 → 顯示 base、藏升級版。逗號多值＝任一功能在版本內即收起 base。 */
    document.querySelectorAll('[data-feat-off]').forEach(function (el) {
      var offIds = el.getAttribute('data-feat-off').split(',');
      var featShown = offIds.some(function (id) {
        var inVer = !allow || allow.indexOf(featTier(id)) >= 0;
        return inVer || state.showFuture;
      });
      el.classList.toggle('ztd-ver-hidden', featShown);
    });
    /* 作用中分頁被版本藏掉時，自動切到第一個可見的兄弟 tab（點擊觸發頁面自身切換 JS）*/
    document.querySelectorAll('.tabs__item.ztd-ver-hidden, .filter-tabs__item.ztd-ver-hidden').forEach(function (t) {
      var active = t.classList.contains('tabs__item--active') || t.classList.contains('filter-tabs__item--active') || t.getAttribute('aria-selected') === 'true';
      if (!active || !t.parentElement) return;
      var sib = t.parentElement.querySelector('.tabs__item:not(.ztd-ver-hidden), .filter-tabs__item:not(.ztd-ver-hidden)');
      if (sib && sib !== t) sib.click();
    });
    /* 2) 改接：route:來源=目標（連結改接抽成 applyRouteRedirects，供 DOM 變動後重跑）*/
    applyRouteRedirects();
    applyRouteAvailability();
  }
  /* route 連結改接：先把上次改過的還原，再套當前版本（標 data-route-keep 的不動）。
     抽成獨立函式，讓 sidebar／i18n 事後重繪注入的新連結（MutationObserver）也能重新改接。 */
  function applyRouteRedirects() {
    var rule = curVersionRule();
    document.querySelectorAll('a[data-route-orig]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('data-route-orig'));
      a.removeAttribute('data-route-orig');
    });
    routesForRule(rule).forEach(function (pair) {
      var from = pair[0], to = pair[1];
      document.querySelectorAll('a[href]').forEach(function (a) {
        if (a.hasAttribute('data-route-keep')) return;
        var h = a.getAttribute('href');
        if (h === from || h.split(/[?#]/)[0] === from) {
          a.setAttribute('data-route-orig', h);
          a.setAttribute('href', to);
        }
      });
    });
  }
  /* 全頁功能（scope 未列＝full-only）不能只靠 data-feat：直接輸入 URL 時，
     該頁沒有可見產品內容才是正確的低版本行為。導向 P1 可用的 E-Shop，保留
     version/query/hash；funding-test 明確定義為其餘同 Phase 4，故可通過。 */
  function guardPageFeature() {
    var pageFeat = document.documentElement.getAttribute('data-page-feat');
    if (!pageFeat || isFullBaseVersion(state.version)) return false;
    var allow = tiersForRule(curVersionRule());
    if (!allow || allow.indexOf(featTier(pageFeat)) >= 0) return false;
    var here = (location.pathname.split('/').pop() || '').toLowerCase();
    if (here === 'e-shop.html') return false; // defensive: avoid a malformed page attribute loop
    var target = 'e-shop.html' + location.search + location.hash;
    location.replace(target);
    return true;
  }
  /* route 頁級改接：連結改接只影響「點擊」，但你可能已停在來源頁（或直接輸入 URL）。
     切到 deck-for-sony 卻還停在 earnings.html 就看不到 Sony 版——故在此把整頁換過去。
     掃全部版本的 route 規則，雙向處理：
       1) 停在「作用中版本」的來源頁 → 換到目標頁（earnings.html → earnings-sony.html）
       2) 停在某變體目標頁、但該版本沒作用、且無作用版本也指向此頁 → 導回來源頁
          （earnings-sony.html 在非 deck-for-sony 版 → 回 earnings.html）
     保留 query／hash；earnings-sony.html 不是任何來源，故無迴圈。 */
  function guardRoutePage() {
    var here = (location.pathname.split('/').pop() || '').toLowerCase();
    var pairs = [];
    VERSIONS.forEach(function (v) {
      routesForRule(v[3]).forEach(function (p) {
        pairs.push({ from: p[0].toLowerCase(), to: p[1].toLowerCase(), fromRaw: p[0], toRaw: p[1], ver: v[0] });
      });
    });
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].ver === state.version && pairs[i].from === here) {
        location.replace(pairs[i].toRaw + location.search + location.hash); return true;
      }
    }
    for (var j = 0; j < pairs.length; j++) {
      if (pairs[j].to === here && pairs[j].ver !== state.version) {
        var stillActive = pairs.some(function (p) { return p.to === here && p.ver === state.version; });
        if (!stillActive) { location.replace(pairs[j].fromRaw + location.search + location.hash); return true; }
      }
    }
    return false;
  }
  function loadVersions() {
    try {
      fetch('feature-scope-map.md').then(function (r) { return r.ok ? r.text() : null; })
        .then(function (t) { if (t) { parseScopeMd(t); if (root.classList.contains('is-open')) paint(); applyVersion(); } })
        .catch(function () {});
    } catch (e) {}
  }
  function curTheme() { return (window.ztorTheme && window.ztorTheme.getPreference && window.ztorTheme.getPreference()) || 'system'; }
  function curLang() { return document.documentElement.lang === 'zh-Hant' ? 'zh-Hant' : 'en'; }
  function curNav() { return (window.ztorNavMode && window.ztorNavMode.get && window.ztorNavMode.get()) || 'topbar'; }
  /* Creator (Admin) — spec §4.1 / D086. Switch which creator the Admin is
     operating as, or clear back to the roster (Tier 1 locked). Reads/sets the
     shared model exposed by sidebar.js (window.ztorCreator). */
  function creatorOpts() {
    var list = (window.ztorCreator && window.ztorCreator.list) || [];
    /* 一般創作者（無代管）排第一，其後才是各 creator 的 admin 代管。 */
    var opts = [['__none__', '一般創作者', '一般創作者視角（無 admin chrome）']];
    list.forEach(function (c) { opts.push([c.handle, c.name, c.shop]); });
    return opts;
  }
  function curCreator() {
    var c = window.ztorCreator && window.ztorCreator.get && window.ztorCreator.get();
    return c ? c.handle : '__none__';
  }

  /* ---- 頁面自訂 dev 預覽開關（page-scoped，非全站）----
     頁面在載入 devtools 前設 window.ZTOR_DEV_PAGE_GROUPS = [{ key, label,
       options:[[val,name,desc],…], def }, …]；選值存 state.pageOpts[key]，
     切換時透過 ztor:devstate-changed 的 detail.pageOpts 派給該頁自行套用。
     未設定時完全不渲染、對其他頁零影響。用於「建立後鎖定」的欄位在 demo
     仍能預覽替代版面（如 product-detail 的實體/數位、單一/多規格、限量）。*/
  var PAGE_GROUPS = (window.ZTOR_DEV_PAGE_GROUPS && window.ZTOR_DEV_PAGE_GROUPS.length) ? window.ZTOR_DEV_PAGE_GROUPS : [];

  var DEFAULTS = { skipValidation: false, data: 'has-data', eventDay: 'no-event', version: 'full', showFuture: false };
  var LS = 'ztor.devstate';

  function load() {
    var s = Object.assign({}, DEFAULTS);
    try { Object.assign(s, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
    var q = new URLSearchParams(location.search);
    if (q.has('data')) s.data = q.get('data');
    if (q.has('event')) s.eventDay = q.get('event');
    if (q.has('skip')) s.skipValidation = q.get('skip') === '1' || q.get('skip') === 'true';
    if (q.has('version')) s.version = q.get('version');
    if (q.has('future')) s.showFuture = q.get('future') === '1' || q.get('future') === 'true';
    return s;
  }
  var state = load();
  /* page-scoped 預覽選值：確保 state.pageOpts 存在且每個 group 有預設；
     不放進 DEFAULTS 以免 reset 時與 DEFAULTS 共用同一物件參照。 */
  function seedPageOpts() {
    if (!state.pageOpts || typeof state.pageOpts !== 'object') state.pageOpts = {};
    PAGE_GROUPS.forEach(function (g) { if (state.pageOpts[g.key] == null) state.pageOpts[g.key] = g.def; });
  }
  seedPageOpts();
  var listeners = [];

  function persist() {
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
    var q = new URLSearchParams(location.search);
    q.set('data', state.data);
    q.set('event', state.eventDay);
    if (state.skipValidation) q.set('skip', '1'); else q.delete('skip');
    if (state.version && state.version !== 'full') q.set('version', state.version); else q.delete('version');
    if (state.showFuture) q.set('future', '1'); else q.delete('future');
    history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
  }
  function emit() {
    var d = Object.assign({}, state);
    /* 把狀態反映到 <html>，任何頁面 / CSS 都能據此反應（通用橋接）*/
    var el = document.documentElement;
    el.setAttribute('data-data-state', state.data);
    el.setAttribute('data-event-day', state.eventDay);
    el.setAttribute('data-skip-validation', state.skipValidation ? '1' : '0');
    el.setAttribute('data-version', state.version);
    if (guardPageFeature()) return;
    if (guardRoutePage()) return;
    applyVersion();
    listeners.forEach(function (f) { try { f(d); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('ztor:devstate-changed', { detail: d }));
  }

  /* ---- styles：用 design system tokens（亮/暗色自動跟隨）---- */
  var css = ''
    + '.ztd{font-family:var(--font-ui,system-ui,sans-serif)}'
    + '.ztd *{box-sizing:border-box}'
    + '.ztd__panel{display:none;position:fixed;right:18px;bottom:18px;z-index:2147483000;width:344px;max-width:calc(100vw - 36px);'
    + 'height:auto;min-height:220px;max-height:calc(100vh - 36px);overflow:auto;resize:vertical;'  /* resize:vertical → 右下角原生握把可調高度 */
    + 'background:var(--card);color:var(--foreground);border:1px solid var(--border);border-radius:var(--radius-xl,16px);'
    + '-webkit-backdrop-filter:var(--overlay-blur);backdrop-filter:var(--overlay-blur);'  /* 暗色 --card 半透明，毛玻璃避免透出後方（同全域浮層治理）*/
    + 'box-shadow:0 16px 48px rgba(0,0,0,.18),0 2px 6px rgba(0,0,0,.06)}'
    + '.ztd.is-open .ztd__panel{display:block}'
    + '.ztd__head{display:flex;align-items:center;gap:10px;padding:15px 16px;border-bottom:1px solid var(--border);cursor:move;user-select:none}'  /* 標題列＝拖移把手 */
    + '.ztd__title{font-size: var(--fs-14);font-weight: var(--fw-semibold);flex:1}'
    + '.ztd__head svg,.ztd__iconbtn svg{width:18px;height:18px}'
    + '.ztd__iconbtn{width:30px;height:30px;display:inline-grid;place-items:center;border:0;border-radius:var(--radius-md,7px);background:transparent;color:var(--foreground-muted);cursor:pointer}'
    + '.ztd__iconbtn:hover{background:var(--muted);color:var(--foreground)}'
    + '.ztd__iconbtn.is-on{background:var(--primary);color:var(--primary-foreground)}'
    + '.ztd__body{padding:14px 16px 4px}'
    /* 三 tab 分頁列（情境/開發/設置）：底線 accent，橘只出現在作用中底線 */
    + '.ztd__tabs{display:flex;gap:2px;margin:-2px 0 14px;border-bottom:1px solid var(--border)}'
    + '.ztd__tab{flex:1;padding:9px 6px;border:0;background:transparent;color:var(--muted-foreground);'
    + 'font:inherit;font-size:var(--fs-13);font-weight:var(--fw-medium);cursor:pointer;'
    + 'border-bottom:2px solid transparent;margin-bottom:-1px;border-radius:var(--radius-sm,5px) var(--radius-sm,5px) 0 0}'
    + '.ztd__tab:hover{color:var(--foreground);background:var(--muted)}'
    + '.ztd__tab.is-active{color:var(--foreground);border-bottom-color:var(--primary)}'
    + '.ztd__tabpanel[hidden]{display:none}'
    /* 版本 dropdown（面板版；首次 popup 仍用大卡片）*/
    + '.ztd__select{width:100%;padding:10px 30px 10px 12px;border:1px solid var(--border);border-radius:var(--radius-md,7px);'
    + 'background:var(--card);color:var(--foreground);font:inherit;font-size:var(--fs-13);font-weight:var(--fw-medium);cursor:pointer;'
    + "-webkit-appearance:none;appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 11px center}"
    + '.ztd__select:focus{outline:2px solid var(--primary);outline-offset:1px}'
    + '.ztd__select-desc{font-size:var(--fs-11);color:var(--muted-foreground);margin-top:6px;line-height:1.4}'
    + '.ztd__group{margin-bottom:16px}'
    + '.ztd__group-label{font-size: var(--fs-11);font-weight: var(--fw-semibold);letter-spacing:.06em;color:var(--muted-foreground);text-transform:uppercase;margin:0 0 9px}'
    /* 開關列＝標籤＋真 switch（橘只出現在滑軌，量很小）。比照 ds switch.css */
    + '.ztd__row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:11px 13px;'
    + 'border:1px solid var(--border);border-radius:var(--radius-md,7px);background:var(--card);color:var(--foreground);'
    + 'font:inherit;font-size: var(--fs-13);font-weight: var(--fw-medium);cursor:pointer;text-align:left}'
    + '.ztd__row:hover{background:var(--muted)}'
    + '.ztd__sw{position:relative;width:36px;height:20px;flex:none;background:var(--muted);border-radius:999px;box-shadow:0 0 0 1px var(--border);transition:background .2s ease}'
    + '.ztd__sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--card);box-shadow:0 1px 2px rgba(0,0,0,.15);transition:left .15s ease}'
    + '.ztd__row.is-on .ztd__sw{background:var(--primary);box-shadow:none}'
    + '.ztd__row.is-on .ztd__sw::after{left:18px}'
    /* 單選選項：選中＝淡橘 tint＋細橘環（比照 ds selection-card--active），不再整塊橘 */
    + '.ztd__grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.ztd__opt{padding:11px 13px;border:1px solid var(--border);border-radius:var(--radius-md,7px);background:var(--card);'
    + 'color:var(--foreground);font:inherit;font-size: var(--fs-13);font-weight: var(--fw-medium);cursor:pointer;text-align:left}'
    + '.ztd__opt:hover{background:var(--muted)}'
    + '.ztd__opt.is-active{background:color-mix(in srgb,var(--primary) 14%,var(--card));box-shadow:inset 0 0 0 1.5px var(--primary);border-color:transparent}'
    + '.ztd__opt-desc{display:block;font-size: var(--fs-11);font-weight: var(--fw-regular);color:var(--muted-foreground);margin-top:4px;line-height:1.4}'   /* 說明預設常駐 */
    /* 版本（最高級別 gate）：組強調框＋版本外功能的隱藏/標記樣式（全站套用）*/
    + '.ztd__group--top{border:1px solid color-mix(in srgb,var(--primary) 55%,var(--border));background:color-mix(in srgb,var(--primary) 7%,var(--card));border-radius:var(--radius-md,7px);padding:12px 13px 4px;margin-bottom:18px}'
    /* 版本選項：一行一個＋分組小標題（開發版本／測試版）*/
    + '.ztd__subgroup{font-size:var(--fs-11);font-weight:var(--fw-semibold);color:var(--muted-foreground);letter-spacing:.04em;margin:2px 0 7px}'
    + '.ztd__subgroup:not(:first-child){margin-top:13px}'
    + '.ztd__rows-v{display:flex;flex-direction:column;gap:6px}'
    + '.ztd__optrow{display:block;width:100%;text-align:left;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-md,7px);background:var(--card);color:var(--foreground);font:inherit;cursor:pointer;transition:.15s}'
    + '.ztd__optrow:hover{background:var(--muted)}'
    + '.ztd__optrow.is-active{background:color-mix(in srgb,var(--primary) 14%,var(--card));box-shadow:inset 0 0 0 1.5px var(--primary);border-color:transparent}'
    + '.ztd__optrow-name{display:block;font-size:var(--fs-13);font-weight:var(--fw-medium)}'
    + '.ztd__optrow-desc{display:block;font-size:var(--fs-11);color:var(--muted-foreground);margin-top:3px;line-height:1.4}'
    + '.ztd-ver-hidden{display:none!important}'
    + '.ztd-ver-future{opacity:.42!important;outline:1px dashed var(--primary);outline-offset:2px}'
    /* 縮小：只留 header，body／foot 收起，面板高度回到 auto（蓋掉 resize 存的高度）*/
    + '.ztd.is-min .ztd__body,.ztd.is-min .ztd__foot{display:none}'
    + '.ztd.is-min .ztd__panel{min-height:0;height:auto!important;resize:none}'
    + '.ztd.is-min .ztd__head{border-bottom:0}'
    + '.ztd__foot{padding:11px 16px;border-top:1px solid var(--border);font-size: var(--fs-11);color:var(--muted-foreground);'
    + 'display:flex;align-items:center;justify-content:space-between;gap:10px}'
    + '.ztd__reset{background:transparent;border:0;color:var(--foreground-muted);font:inherit;font-size: var(--fs-12);cursor:pointer;text-decoration:underline;padding:0}'
    + '.ztd__reset:hover{color:var(--foreground)}'
    /* inspector readout */
    + '.ztd__inspect{border:1px solid var(--border);border-radius:var(--radius-md,7px);overflow:hidden}'
    + '.ztd__inspect-empty{padding:13px 14px;font-size: var(--fs-12);color:var(--muted-foreground)}'
    + '.ztd__inspect-row{display:flex;gap:10px;padding:9px 14px;font-size: var(--fs-12);border-top:1px solid var(--border)}'
    + '.ztd__inspect-row:first-child{border-top:0}'
    + '.ztd__inspect-k{flex:0 0 64px;color:var(--muted-foreground)}'
    + '.ztd__inspect-v{flex:1;min-width:0;color:var(--foreground);font-family:var(--font-mono,ui-monospace,monospace);word-break:break-all}'
    + '.ztd__inspect.is-locked{outline:2px solid var(--primary);outline-offset:-1px}'
    + '.ztd__badge{display:inline-block;padding:1px 8px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-weight: var(--fw-semibold)}'
    + '.ztd__muted{color:var(--muted-foreground)}'
    /* highlight overlay：非元件＝藍框；是元件＝橘框（一眼分辨）*/
    + '.ztd-hl{position:fixed;z-index:2147482999;pointer-events:none;border:1.5px solid var(--status-info,#266DF0);'
    + 'background:color-mix(in srgb,var(--status-info,#266DF0) 12%,transparent);border-radius:2px;display:none}'
    + '.ztd-hl.is-on{display:block}'
    + '.ztd-hl--component{border-color:var(--primary);background:color-mix(in srgb,var(--primary) 16%,transparent)}'
    + '.ztd-hl__tag{position:absolute;top:-22px;left:0;white-space:nowrap;font:var(--fs-11)/1.6 var(--font-mono,ui-monospace,monospace);'
    + 'padding:1px 6px;border-radius:4px;background:var(--surface-inverse,#000);color:var(--foreground-on-inverse,#fff)}'
    + '.ztd-hl--component .ztd-hl__tag{background:var(--primary);color:var(--primary-foreground)}'
    /* 首次進站 onboarding popup：選版本 → 確定 → 進入（之後不再跳）*/
    + '.ztd-onb{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.45);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);font-family:var(--font-ui,system-ui,sans-serif)}'
    + '.ztd-onb__card{width:min(440px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--card);color:var(--foreground);border:1px solid var(--border);border-radius:var(--radius-xl,16px);padding:22px 22px 20px;box-shadow:0 16px 48px rgba(0,0,0,.28)}'
    + '.ztd-onb__title{display:flex;align-items:center;gap:8px;font-size:var(--fs-18,18px);font-weight:var(--fw-semibold);margin-bottom:6px}'
    + '.ztd-onb__title svg{width:20px;height:20px;color:var(--primary)}'
    + '.ztd-onb__sub{font-size:var(--fs-13);color:var(--muted-foreground);margin-bottom:16px;line-height:1.5}'
    + '.ztd-onb__opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}'
    + '.ztd-onb__ok{width:100%;padding:12px;border:0;border-radius:var(--radius-md,7px);background:var(--primary);color:var(--primary-foreground);font:inherit;font-weight:var(--fw-semibold);font-size:var(--fs-14);cursor:pointer}'
    + '.ztd-onb__ok:hover{filter:brightness(.96)}'
    + '@media (max-width:420px){.ztd-onb__opts{grid-template-columns:1fr}}';
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
  /* page-scoped 預覽開關的分組渲染（data-kind=page＋data-group=<key>）；無 group 回空字串。 */
  function pageGroupsHtml() {
    return PAGE_GROUPS.map(function (g) {
      var cur = state.pageOpts[g.key];
      var opts = g.options.map(function (o) {
        return '<button class="ztd__opt' + (o[0] === cur ? ' is-active' : '') + '" data-kind="page" data-group="' + g.key + '" data-val="' + o[0] + '">'
          + o[1] + '<span class="ztd__opt-desc">' + (o[2] || '') + '</span></button>';
      }).join('');
      return '<div class="ztd__group"><p class="ztd__group-label">' + g.label + '</p><div class="ztd__grid">' + opts + '</div></div>';
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
      /* 三 tab：情境（要模擬什麼狀況）／開發（檢查工具）／設置（外觀基本）。切 tab 只改顯示、
         狀態存 localStorage 跨頁記住。Reset 維持底部全域按鈕（跨 tab 皆適用）。 */
      +     '<div class="ztd__tabs" role="tablist">'
      +       '<button class="ztd__tab' + (activeTab === 'scenario' ? ' is-active' : '') + '" data-act="tab" data-tab="scenario" role="tab">情境</button>'
      +       '<button class="ztd__tab' + (activeTab === 'dev' ? ' is-active' : '') + '" data-act="tab" data-tab="dev" role="tab">開發</button>'
      +       '<button class="ztd__tab' + (activeTab === 'settings' ? ' is-active' : '') + '" data-act="tab" data-tab="settings" role="tab">設置</button>'
      +     '</div>'
      /* ── 情境：版本（最高級 gate，保留強調框）＋顯示未來功能＋User＋Data State＋Event Day ── */
      +     '<div class="ztd__tabpanel" data-tab-panel="scenario"' + (activeTab !== 'scenario' ? ' hidden' : '') + '>'
      +       '<div class="ztd__group ztd__group--top"><p class="ztd__group-label">版本 · Build version</p>'
      +         verRows(state.version, 'panel')
      +         '<button class="ztd__row' + (state.showFuture ? ' is-on' : '') + '" data-act="toggle-future" style="margin-top:9px"><span>顯示未來功能（淡色標記）</span><span class="ztd__sw"></span></button>'
      +       '</div>'
      +       '<div class="ztd__group"><p class="ztd__group-label">User</p>'
      +         '<div class="ztd__grid">' + optsHtml((window.ztorPersona ? window.ztorPersona.list() : creatorOpts()), (window.ztorPersona ? window.ztorPersona.current() : curCreator()), 'persona') + '</div></div>'
      +       '<div class="ztd__group"><p class="ztd__group-label">Data State</p>'
      +         '<div class="ztd__grid">' + optsHtml(DATA, state.data, 'data') + '</div></div>'
      +       '<div class="ztd__group"><p class="ztd__group-label">Event Day</p>'
      +         '<div class="ztd__grid">' + optsHtml(EVENTDAY, state.eventDay, 'eventDay') + '</div></div>'
      +     '</div>'
      /* ── 開發：本頁預覽開關（pageGroups，逐頁才有）＋Inspect＋Validation ── */
      +     '<div class="ztd__tabpanel" data-tab-panel="dev"' + (activeTab !== 'dev' ? ' hidden' : '') + '>'
      +       pageGroupsHtml()
      +       '<div class="ztd__group"><p class="ztd__group-label">Inspect</p>'
      +         '<button class="ztd__row' + (inspecting ? ' is-on' : '') + '" data-act="toggle-inspect"><span>Inspect element</span><span class="ztd__sw"></span></button>'
      +         '<div class="ztd__inspect" id="ztd-inspect" style="margin-top:8px"><div class="ztd__inspect-empty">開啟後把游標移到頁面元素；點擊鎖定。橘框＝已建立元件、藍框＝非元件。</div></div>'
      +       '</div>'
      +       '<div class="ztd__group"><p class="ztd__group-label">Validation</p>'
      +         '<button class="ztd__row' + (state.skipValidation ? ' is-on' : '') + '" data-act="toggle-skip"><span>Skip validation</span><span class="ztd__sw"></span></button>'
      +       '</div>'
      +     '</div>'
      /* ── 設置：外觀基本（Theme／Language／Display）＋重新顯示首次 popup ── */
      +     '<div class="ztd__tabpanel" data-tab-panel="settings"' + (activeTab !== 'settings' ? ' hidden' : '') + '>'
      +       '<div class="ztd__group"><p class="ztd__group-label">Theme</p>'
      +         '<div class="ztd__grid">' + optsHtml(THEME, curTheme(), 'theme') + '</div></div>'
      +       '<div class="ztd__group"><p class="ztd__group-label">Language</p>'
      +         '<div class="ztd__grid">' + optsHtml(LANG, curLang(), 'lang') + '</div></div>'
      +       '<div class="ztd__group"><p class="ztd__group-label">Display mode · 版面</p>'
      +         '<div class="ztd__grid">' + optsHtml(NAV, curNav(), 'nav') + '</div></div>'
      +       '<div class="ztd__group"><button class="ztd__row" data-act="reonboard"><span>重新顯示首次 popup</span></button></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="ztd__foot"><button class="ztd__reset" data-act="reset">Reset</button>'
      +     '<span class="ztd__muted">Alt＋右鍵 開關 · 拖標題移動 · 拉底邊調高</span></div>'
      + '</div>';
    applyGeo();
  }
  var OPEN_LS = 'ztor.devtools.open';   // 跨頁記住開/關，換頁不被重置
  var MIN_LS = 'ztor.devtools.min';     // 跨頁記住縮小/展開
  var TAB_LS = 'ztor.devtools.tab';     // 跨頁記住目前 tab（情境/開發/設置）
  var activeTab = (function () {
    try { var t = localStorage.getItem(TAB_LS); if (t === 'scenario' || t === 'dev' || t === 'settings') return t; } catch (e) {}
    return 'scenario';
  })();
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
    if (act === 'tab') { activeTab = btn.getAttribute('data-tab'); try { localStorage.setItem(TAB_LS, activeTab); } catch (e) {} return paint(); }
    if (act === 'reset') { state = Object.assign({}, DEFAULTS); state.pageOpts = {}; seedPageOpts(); setInspect(false); return update(); }
    if (act === 'reonboard') { try { localStorage.removeItem(ONBOARD_LS); } catch (e) {} showOnboarding(); return; }
    if (act === 'toggle-skip') { state.skipValidation = !state.skipValidation; return update(); }
    if (act === 'toggle-future') { state.showFuture = !state.showFuture; return update(); }
    if (act === 'toggle-inspect') { setInspect(!inspecting); return; }
    var kind = btn.getAttribute('data-kind');
    if (!kind) return;
    var val = btn.getAttribute('data-val');
    /* page-scoped 預覽開關：存 state.pageOpts[group]，emit 時併入 detail.pageOpts 派給該頁 */
    if (kind === 'page') { state.pageOpts[btn.getAttribute('data-group')] = val; return update(); }
    /* 外觀類：呼叫既有系統（自行持久化），再 repaint 更新高亮；不動 devstate */
    if (kind === 'theme') { if (window.ztorTheme) window.ztorTheme.setPreference(val); return paint(); }
    if (kind === 'lang')  { if (window.setLang) window.setLang(val); return paint(); }
    if (kind === 'nav')   { if (window.ztorNavMode) window.ztorNavMode.set(val); return paint(); }
    /* persona＝cheat「User」組：切換資料人格（default/admin/nick/userB）；set() 內部 reload */
    if (kind === 'persona') { if (window.ztorPersona) window.ztorPersona.set(val); return; }
    if (kind === 'creator') { if (window.ztorCreator) window.ztorCreator.set(val === '__none__' ? null : val); return paint(); }
    state[kind] = val; update();
  });

  /* 版本 dropdown（原生 select 觸發 change 而非 click）：套用選定版本 */
  root.addEventListener('change', function (e) {
    var sel = e.target.closest('select[data-ver-select]');
    if (!sel) return;
    state.version = sel.value; update();
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
  document.addEventListener('ztor:creator-changed', syncAppearance);
  document.addEventListener('i18n:applied', syncAppearance);

  window.ztorDevState = {
    get: function () { return Object.assign({}, state); },
    set: function (patch) { Object.assign(state, patch || {}); update(); },
    on: function (cb) { if (typeof cb === 'function') listeners.push(cb); },
  };
  emit();
  loadVersions();
  /* partials/i18n 會在初次 applyVersion 後注入連結；新節點也必須遵守 full-only route gate。 */
  if (window.MutationObserver) {
    new MutationObserver(function () { applyRouteRedirects(); applyRouteAvailability(); })
      .observe(document.body, { childList: true, subtree: true });
  }
  /* 首次進站：跳 popup 選版本 → 確定進入（每裝置第一次；手機免 Alt＋右鍵也能設版本）*/
  var ONBOARD_LS = 'ztor.devtools.onboarded';
  function showOnboarding() {
    var _old = document.querySelector('.ztd-onb'); if (_old) _old.remove();
    var ov = document.createElement('div'); ov.className = 'ztd-onb';
    var sel = state.version || 'full';
    function draw() {
      ov.innerHTML = '<div class="ztd-onb__card">'
        + '<div class="ztd-onb__title">' + SPARK + 'Cheat Codes</div>'
        + '<p class="ztd-onb__sub">選擇要檢視的版本。之後桌面可 Alt＋右鍵叫出完整面板再調整。</p>'
        + verRows(sel, 'onb')
        + '<button class="ztd-onb__ok">確定</button>'
        + '</div>';
    }
    draw();
    ov.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-onb]');
      if (opt) { sel = opt.getAttribute('data-onb'); draw(); return; }
      if (e.target.closest('.ztd-onb__ok')) {
        state.version = sel; update();
        try { localStorage.setItem(ONBOARD_LS, '1'); } catch (e) {}
        ov.remove();
      }
    });
    document.body.appendChild(ov);
  }
  try { if (!localStorage.getItem(ONBOARD_LS)) showOnboarding(); } catch (e) {}
})();
