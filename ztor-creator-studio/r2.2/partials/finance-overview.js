/* ============================================================
   Finance overview — Deck for Sony 版收入管理頁的互動
   移植自 ztor cocreate 站 finance-overview.html（ds.js 的 fin-filter /
   fin-drawer / ledger-pager），改寫成 R2.1 自包含 vanilla JS（無 fetch、
   file:// 可跑）。掛在 earnings-sony.html 尾端載入。

   負責四件事：
     1) 存入類型分段篩選（data-fin-legend）— 聚焦走勢圖對應線、依 data-fin-types
        篩「我的項目」列、改金額欄標題、無符合列時顯示對應類型的空狀態
     2) 類別／身分／日期下拉（data-fin-dd）— 疊加篩選「我的項目」列
     3) 兩張表的數字分頁（data-fin-pager / data-fin-histpager）
     4) 兩個抽屜（data-drawer-open / -close / scrim / Esc）開關
   全部只讀寫 class／attribute，不改頁面資料。
   ============================================================ */
(function () {
  'use strict';
  var T = function (k) { return (window.i18nT && window.i18nT(k)) || k; };

  /* ---------- 彈窗（canonical .payout-modal / .payout-dialog）---------- */
  function openModal(key) {
    var m = document.querySelector('.payout-modal[data-modal="' + key + '"]');
    if (!m) return;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModals() {
    document.querySelectorAll('.payout-modal[data-modal]').forEach(function (m) { m.hidden = true; });
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-drawer-open]');
    if (open) { e.preventDefault(); openModal(open.getAttribute('data-drawer-open')); return; }
    if (e.target.closest('[data-drawer-close]')) { e.preventDefault(); closeModals(); return; }
    /* 點遮罩（.payout-modal 本身、非對話框內）關閉 */
    var overlay = e.target.closest('.payout-modal[data-modal]');
    if (overlay && !e.target.closest('.payout-dialog')) closeModals();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.querySelector('.payout-modal[data-modal]:not([hidden])')) closeModals();
  });

  /* ---------- 可關閉的提示條 ----------
     2026-07-27 使用者裁示：長期掛著的說明是雜訊，要能關掉；但「重新登入」時該再出現。
     所以用 sessionStorage 而不是 localStorage——localStorage 會永久記住，
     使用者就再也看不到；sessionStorage 隨瀏覽器工作階段結束自動清空，
     等於「下次重新登入會再看到一次」。（正式站接上真的登入後，改綁 auth session 更精準。） */
  var DISMISS_PREFIX = 'ztor.dismissed.';
  function dismissKey(el) { return DISMISS_PREFIX + el.getAttribute('data-dismiss-key'); }
  document.querySelectorAll('[data-dismiss-key]').forEach(function (el) {
    try { if (sessionStorage.getItem(dismissKey(el)) === '1') el.hidden = true; } catch (e) {}
  });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-dismiss]');
    if (!btn) return;
    var el = btn.closest('[data-dismiss-key]');
    if (!el) return;
    el.hidden = true;
    try { sessionStorage.setItem(dismissKey(el), '1'); } catch (err) {}
  });

  /* ---------- 通用數字分頁 ---------- */
  /* 實作 2026-08-10 搬到 js/pager.js——收入管理的貼文報告明細也要分頁，
     但那一頁不載本 partial，留在這裡就得複製一份。這裡只留別名。 */
  var makePager = function (getRows, size, nav) {
    return window.ztorPager ? window.ztorPager.mount(getRows, size, nav) : function () {};
  };

  /* ---------- 我的項目：類型 × 類別 × 身分 篩選 ---------- */
  var table = document.querySelector('[data-fin-table]');
  var legend = document.querySelector('[data-fin-legend]');
  var chart = document.querySelector('.fin-chart');
  var state = { type: 'all', cat: 'all' };

  /* ---------- 我的項目：依 persona 從 projects-store 產生列 ----------
     2026-07-26：原本 6 列名稱寫死在 markup（港片那批＝default persona），切到
     周湯豪（nick）persona 時名稱不會跟著換。改由 window.ztorProjects.list() 取
     當前 persona 的前 6 個項目渲染；收益類型／金額仍用固定示意值（SLOTS，依序
     套用），好讓上方的類型 chips 維持可用。類別欄用項目自己的 cat
     （movie/song/album…），data-fin-cat 與下拉選項一律用 cat 代碼比對，所以換
     persona 也不會對不上。persona 切換由 cheat code 觸發整頁 reload。
     2026-07-26 使用者：拿掉「身分」（發起人／支持者／影評人）——Creator Studio
     底下列出的都是使用者自己發起的項目，不需要身分區分，SLOTS 隨之簡化。 */
  var CAT_I18N = {
    movie: 'fin.cat.film', short: 'fin.cat.short', series: 'fin.cat.series',
    song: 'fin.cat.single', album: 'fin.cat.album', mv: 'fin.cat.mv',
    event: 'fin.cat.event', merch: 'fin.cat.merch', document: 'fin.cat.doc',
    custom: 'fin.cat.custom'
  };
  /* ── 收益類型：由項目自己的 family／cat 推導，不再按列序硬配 ──
     2026-07-27 使用者裁示：「OTT 版稅是影視收益，點 OTT 應該列出影片／MV，不該出現單曲。」
     舊版 SLOTS 按 index 配型，跟項目是什麼完全脫鉤——nick persona 前六筆是單曲／專輯，
     於是 OTT 篩出一排歌，語意就錯了。projects-store 早就有正解：family
       film  = movie／short／series／mv（MV 是影片，算影視）
       music = song／album
       other = event／merch／document／custom
     故：OTT 版稅＝film、音樂版稅＝music、門票＝event、商品＝merch，
     共創計畫＝群眾集資型（type:'fund'），授權收益＝原創影音（film＋music）。 */
  var FAMILY_TYPES = {
    film:  ['ott', 'commission', 'licence'],
    music: ['music', 'licence'],
    other: []
  };
  var CAT_TYPES = { event: ['ticket'], merch: ['goods'] };
  /* 帶貨收益不綁 cat：它來自創作者寫的貼文，而貼文談的是自己的影音作品，
     所以掛在 film／music 兩個 family 上，跟著被提及的作品走。 */
  var AFFILIATE_FAMILIES = ['film', 'music'];
  function typesFor(p) {
    var t = (FAMILY_TYPES[p.family] || []).slice();
    (CAT_TYPES[p.cat] || []).forEach(function (x) { if (t.indexOf(x) < 0) t.push(x); });
    if (p.type === 'fund' && t.indexOf('cocreate') < 0) t.unshift('cocreate');
    if (AFFILIATE_FAMILIES.indexOf(p.family) >= 0) t.push('affiliate');
    return t.join(' ');
  }
  /* 金額改依類別給合理量級（原本綁在 SLOTS 上，列數一變就沒得取）。示意值，非真實數據。 */
  var CAT_AMOUNT = {
    movie: 3200, series: 2400, short: 800, mv: 1590,
    album: 1000, song: 100, event: 4200, merch: 1860,
    document: 300, custom: 200
  };
  function amountFor(p) { return CAT_AMOUNT[p.cat] || 100; }
  function ntd(n) { return 'NTD ' + n.toLocaleString('en-US'); }
  function renderMyItems(tableEl) {
    var store = window.ztorProjects;
    var body = tableEl && tableEl.querySelector('[data-fin-rows]');
    if (!store || !body) return;                 /* 沒有 store 就保留 markup 既有列 */
    /* 2026-07-27：不再切前 6 筆。舊的 slice(0,6) 讓 nick 的活動／周邊項目（第 11–13 筆）
       永遠進不了表，門票與商品兩個 chip 就篩不出任何列。表格本來就有分頁（每頁 8 筆）。 */
    var projects = store.list();
    if (!projects.length) return;
    var MODE_KEY = { fund: 'fund', preorder: 'preorder', 'go-live': 'golive' };
    var html = '', cats = [];
    projects.forEach(function (p, i) {
      var slot = { types: typesFor(p), amt: ntd(amountFor(p)) };
      var key = CAT_I18N[p.cat] || 'fin.cat.custom';
      var label = store.catLabel(p.cat);
      if (cats.indexOf(p.cat) < 0) cats.push(p.cat);
      var img = p.poster || p.cover || '';
      html += '<tr class="fin-rowlink" data-fin-cat="' + p.cat +
              '" data-fin-types="' + slot.types + '" data-fin-go="project-detail.html?id=' + p.id + '#earnings">' +
              '<td class="ztor-table__feature"><span class="ztor-table__media">' +
                (img ? '<img class="ztor-table__thumb" src="' + img + '" alt="" loading="lazy">'
                     : '<span class="ztor-table__thumb"></span>') +
                '<span data-proj-name="' + p.id + '">' + store.nameLabel(p).en + '</span>' +
              '</span></td>' +
              /* 項目類型＝發行模式（共創／預購／直接發佈）。沿用 projects.mode.* 鍵，
                 與項目清單同一套詞，不另造。2026-07-31 使用者指定新增。 */
              '<td data-i18n="projects.mode.' + MODE_KEY[p.type] + '">' + p.type + '</td>' +
              '<td data-i18n="' + key + '">' + label.en + '</td>' +
              '<td class="fin-amt">' + slot.amt + '</td>' +
              '<td class="ztor-table__chevcell"><i data-lucide="chevron-right" class="ztor-icon ztor-icon--sm"></i></td></tr>';
    });
    body.innerHTML = html;

    /* 類別下拉重建：只列出當前 persona 這幾列真正出現的類別 */
    var menu = tableEl.querySelector('[data-fin-dd="cat"] .dropdown__menu');
    if (menu) {
      var opts = '<button class="dropdown__item" type="button" role="option" data-fin-opt="all" data-i18n="fin.cat.all">All categories</button>';
      cats.forEach(function (c) {
        var k = CAT_I18N[c] || 'fin.cat.custom';
        opts += '<button class="dropdown__item" type="button" role="option" data-fin-opt="' + c +
                '" data-i18n="' + k + '">' + store.catLabel(c).en + '</button>';
      });
      menu.innerHTML = opts;
    }
    if (window.ztorIcons) window.ztorIcons.applyIcons(tableEl);
    if (window.applyI18n) window.applyI18n(tableEl);
    /* 列換完才掛排序：元件會在 init 當下把當時的列順序記成「預設順序」
       （第三次點擊要還原到它），先掛的話記到的是 markup 的備援列。 */
    if (window.ztorTableSort) window.ztorTableSort.scan(tableEl);
  }
  renderMyItems(table);

  if (table) {
    var allRows = Array.prototype.slice.call(table.querySelectorAll('[data-fin-rows] > tr'));
    var scroll = table.querySelector('.fin-scroll');
    var emptyCard = table.querySelector('[data-fin-empty]');
    var emptyTitle = table.querySelector('[data-fin-empty-title]');
    var emptyText = table.querySelector('[data-fin-empty-text]');
    var countEl = table.querySelector('[data-fin-count]');
    var totalEl = table.querySelector('.fin-ledgerbar__total strong');
    var scopeEl = table.querySelector('[data-fin-scope]');
    var amtHead = table.querySelector('[data-fin-amt-head]');
    var pagerNav = table.querySelector('[data-fin-pager]');

    function rowMatches(r) {
      var types = (r.getAttribute('data-fin-types') || '').split(/\s+/);
      if (state.type !== 'all' && types.indexOf(state.type) < 0) return false;
      if (state.cat !== 'all' && r.getAttribute('data-fin-cat') !== state.cat) return false;
      return true;
    }
    var matched = allRows.slice();
    var pager = makePager(function () { return matched; }, 8, pagerNav);

    function applyEmptyCopy() {
      if (!emptyCard) return;
      var titleKey = state.type === 'all' ? 'fin.empty.title.all' : 'fin.empty.title.type';
      var textKey = 'fin.empty.text.' + state.type;
      if (emptyTitle) emptyTitle.setAttribute('data-i18n', titleKey);
      if (emptyText) emptyText.setAttribute('data-i18n', textKey);
      if (window.applyI18n) window.applyI18n(emptyCard);
    }
    function relabelAmount() {
      if (!amtHead) return;
      /* 掛上排序後，<th> 裡面是 .sort-th 按鈕，文字在 .sort-th__label。
         直接寫 th.textContent 會把整顆按鈕（含插入符與事件）清掉，該欄的排序就死了。 */
      var target = amtHead.querySelector('.sort-th__label') || amtHead;
      if (state.type === 'all') { target.setAttribute('data-i18n', 'fin.col.amount'); }
      else {
        target.removeAttribute('data-i18n');
        target.textContent = T('fin.type.' + state.type) + ' ' + T('fin.col.amount');
      }
      if (window.applyI18n) window.applyI18n(amtHead);
    }
    /* 標題副標＝目前選的類型，讓上面的 chip 和下面的清單看得出是同一件事 */
    function relabelScope() {
      if (!scopeEl) return;
      if (!state.type || state.type === 'all') { scopeEl.hidden = true; scopeEl.textContent = ''; }
      else { scopeEl.hidden = false; scopeEl.textContent = '· ' + T('fin.type.' + state.type); }
    }
    /* 類別下拉只列出「目前這個收益類型底下真的存在」的類別。
       2026-07-27 使用者裁示：在音樂版稅頁看到 MV／活動／周邊等選項是誤導——
       那些類別在這個類型底下一列都篩不出來。 */
    var catMenu = table.querySelector('[data-fin-dd="cat"] .dropdown__menu');
    var catLabelEl = table.querySelector('[data-fin-dd="cat"] [data-fin-dd-label]');
    function catsForType() {
      var seen = [];
      allRows.forEach(function (r) {
        var types = (r.getAttribute('data-fin-types') || '').split(/\s+/);
        if (state.type !== 'all' && types.indexOf(state.type) < 0) return;
        var c = r.getAttribute('data-fin-cat');
        if (c && seen.indexOf(c) < 0) seen.push(c);
      });
      return seen;
    }
    function rebuildCatMenu() {
      if (!catMenu) return;
      var store = window.ztorProjects, cats = catsForType();
      /* 已選的類別在新類型底下不存在時要退回「全部類別」，
         否則會卡在一個永遠篩不到東西、使用者也看不到原因的狀態。 */
      if (state.cat !== 'all' && cats.indexOf(state.cat) < 0) {
        state.cat = 'all';
        if (catLabelEl) { catLabelEl.setAttribute('data-i18n', 'fin.cat.all'); catLabelEl.textContent = T('fin.cat.all'); }
      }
      var html = '<button class="dropdown__item" type="button" role="option" data-fin-opt="all" data-i18n="fin.cat.all">All categories</button>';
      cats.forEach(function (c) {
        var k = CAT_I18N[c] || 'fin.cat.custom';
        var lbl = (store && store.catLabel(c) && store.catLabel(c).en) || c;
        html += '<button class="dropdown__item" type="button" role="option" data-fin-opt="' + c +
                '" data-i18n="' + k + '">' + lbl + '</button>';
      });
      catMenu.innerHTML = html;
      if (window.applyI18n) window.applyI18n(catMenu);
    }

    function refilter() {
      rebuildCatMenu();          /* 先重建：它可能把失效的 state.cat 重設成 all */
      matched = allRows.filter(rowMatches);
      allRows.forEach(function (r) { if (matched.indexOf(r) < 0) r.hidden = true; });
      if (countEl) countEl.textContent = String(matched.length);
      /* 存入總和跟著篩選結果走。2026-07-27：原本是寫死的 NTD 15,860，與列的加總
         （當時 3,890）對不上；列數與金額現在都由 store 產生，寫死一定會再對不上。 */
      if (totalEl) {
        totalEl.textContent = ntd(matched.reduce(function (sum, r) {
          var cell = r.querySelector('.fin-amt');
          return sum + (cell ? Number(cell.textContent.replace(/[^0-9.]/g, '')) || 0 : 0);
        }, 0));
      }
      var empty = matched.length === 0;
      if (scroll) scroll.hidden = empty;
      if (pagerNav) pagerNav.hidden = empty;
      if (emptyCard) emptyCard.hidden = !empty;
      if (empty) applyEmptyCopy(); else pager(1);
      relabelAmount();
      relabelScope();
    }
    table.__refilter = refilter;   // 供 legend 區塊透過 fin:refilter 事件呼叫

    /* 排序會直接重排 tbody 的 DOM 順序，但分頁是照 matched 陣列的順序決定
       哪 8 列可見——不重讀就會出現「排序後第一頁還是舊的那 8 列」。
       元件為此發 ztor:sorted，收到就以新的 DOM 順序重建並回到第 1 頁。 */
    table.addEventListener('ztor:sorted', function () {
      allRows = Array.prototype.slice.call(table.querySelectorAll('[data-fin-rows] > tr'));
      refilter();
    });

    /* 類別／日期下拉：設 label、更新 state、重篩。
       用事件委派（監聽在 details 上）而不是逐一綁在選項上——類別選單會隨類型重建，
       綁在選項上的 handler 會跟著 innerHTML 一起被丟掉，下拉就再也點不動。 */
    table.querySelectorAll('[data-fin-dd]').forEach(function (dd) {
      var kind = dd.getAttribute('data-fin-dd');
      var label = dd.querySelector('[data-fin-dd-label]');
      dd.addEventListener('click', function (e) {
        var opt = e.target.closest('[data-fin-opt]');
        if (!opt || !dd.contains(opt)) return;
        var val = opt.getAttribute('data-fin-opt');
        if (label) { label.textContent = opt.textContent; label.removeAttribute('data-i18n'); }
        dd.open = false;
        if (kind === 'cat') state.cat = val;
        if (kind !== 'date') refilter();   // 日期為展示用，不改列
      });
    });

    /* 首次載入就跑一次：筆數與存入總和原本停在 markup 的寫死值（6 筆／NTD 15,860），
       只有點了 chip 或下拉才會更新。以前列數剛好也是 6 看不出來；現在列由 store 產生
       （nick 13 筆），不先跑一次的話首屏就會顯示「6 筆・NTD 15,860」而表裡是 13 列。 */
    refilter();
  }

  /* ---------- 我的項目：整列可點 → 該項目的「我的收益」分頁 ----------
     列上帶 data-fin-go（project-detail.html?id=<項目>#earnings）。2026-07-26：
     屬性原本就在 markup 上、但從來沒有接線，所以列點了沒反應。 */
  document.addEventListener('click', function (e) {
    var row = e.target.closest('[data-fin-go]');
    if (!row) return;
    /* 列內若有連結／按鈕，讓它自己處理，不搶走 */
    if (e.target.closest('a[href], button')) return;
    var href = row.getAttribute('data-fin-go');
    if (href) window.location.href = href;
  });

  /* ---------- 類型分段篩選（圖表聚焦 + 表格篩選）---------- */
  if (legend) {
    legend.querySelectorAll('[data-fin-type]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        legend.querySelectorAll('[data-fin-type]').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('filter-tabs__item--active', on);
          c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        state.type = chip.getAttribute('data-fin-type');
        /* 聚焦邏輯集中在 applyFocus()（宣告在下方圖表區塊，函式宣告會提升）——
           因為切換期間會重建整張圖，重建後必須用同一份邏輯把聚焦狀態套回去。 */
        applyFocus();
        if (table) { /* refilter 定義在 table 區塊內，透過事件重呼 */ }
        document.dispatchEvent(new CustomEvent('fin:refilter'));
      });
    });
  }
  /* 讓 legend 與 table 兩區塊解耦：table 監聽 fin:refilter */
  if (table) {
    document.addEventListener('fin:refilter', function () {
      /* refilter 在 table 閉包內；用一個掛在 table 的參照呼叫 */
      if (table.__refilter) table.__refilter();
    });
  }

  /* ════════════════════════════════════════════════════════════
     互動式收益走勢圖 + 類型明細（2026-07-27 使用者需求）
     需求：滑過看到「當日實際金額」、點某條線開明細；音樂類型看各發行平台分潤，
     其餘類型看最賺的前 20 個項目，都能再點一次看全部。

     為什麼要重寫整張圖：原本七條線是寫死的 bezier 路徑，底下沒有任何數值——
     沒有資料就生不出「當日金額」。所以先給圖表資料模型，再由資料畫圖。

     一致性（單一事實來源）：
       type 總額 = 該類型所有項目的 amountFor 加總（＝表格下方「存入總和」）
       ├─ 時間軸：一條 365 天的日資料，全年加總 == 總額；期間切換只是取其中一段
       └─ 明細：同一個總額按來源拆分，加總 == 總額
     兩種拆法都回到同一個總額，所以「表格總和／滑過的數字／明細合計」不可能互相打架。
     ════════════════════════════════════════════════════════════ */
  /* 2026-08-09 D181：新增第八型「貼文帶貨收益」。使用者裁示貼文的成效看粉絲分析、
     錢看這裡，所以帶貨的金額只在本頁出現一次，粉絲分析那頁完全不放金額。 */
  var TYPES = ['cocreate', 'ott', 'music', 'commission', 'licence', 'goods', 'ticket', 'affiliate'];
  var TYPE_SERIES = { cocreate: 1, ott: 2, commission: 3, music: 4, licence: 5, goods: 6, ticket: 7, affiliate: 8 };

  /* 決定性亂數：示意數字必須每次重新整理都一樣，否則簡報時數字會自己跳。 */
  function hashStr(str) {
    var h = 2166136261, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var s = hashStr(String(seed)) || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  /* 把整數 total 依權重拆成整數陣列，且保證加總 == total。
     單純 floor 會少掉餘數（拆 7 份可能少 6 元），餘數逐一補給權重最大的桶。 */
  function splitExact(total, weights) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    var parts = weights.map(function (w) { return Math.floor(total * w / sum); });
    var rem = total - parts.reduce(function (a, b) { return a + b; }, 0);
    var order = weights.map(function (w, i) { return i; }).sort(function (a, b) { return weights[b] - weights[a]; });
    for (var k = 0; k < rem; k++) parts[order[k % order.length]] += 1;
    return parts;
  }

  function projectsOfType(t) {
    var store = window.ztorProjects;
    if (!store) return [];
    return store.list().filter(function (p) { return typesFor(p).split(' ').indexOf(t) >= 0; });
  }
  function totalOfType(t) {
    return projectsOfType(t).reduce(function (a, p) { return a + amountFor(p); }, 0);
  }

  /* 三年份日資料；全期加總 == 該類型總額（＝表格「存入總和」的累計值）。
     權重前低後高＝逐步成長。為什麼是三年而不是一年：分段是「粒度」不是「範圍」，
     最粗的一段（年）要有幾個桶才畫得出走勢；而且一年攤 365 天後每日只剩個位數，
     七條線會全部擠在底部。三年當底、以月為預設粒度，量級才合理。 */
  var DAYS = 1095, dailyCache = {};
  /* 每個類型給不同的成長曲度＋季節相位，走勢才會散開。
     2026-07-27：初版用的是接近線性的權重，日資料併成月桶後雜訊被平均掉，
     七條線變成幾乎平行的直線——資料是對的，但圖表讀不出東西。 */
  function dailySeries(seed, total) {
    var r = rng('daily:' + seed), i, w = [];
    var g = 1.3 + rng('g:' + seed)() * 1.7;       /* 成長曲度：有的早發、有的後期才衝 */
    var ph = rng('ph:' + seed)() * Math.PI * 2;   /* 季節相位 */
    var amp = 0.12 + rng('a:' + seed)() * 0.20;   /* 季節振幅 */
    for (i = 0; i < DAYS; i++) {
      var x = i / (DAYS - 1);
      var trend = 0.08 + Math.pow(x, g) * 0.92;
      var season = 1 + amp * Math.sin(ph + x * Math.PI * 6);
      w.push(Math.max(0.01, trend * season * (0.85 + r() * 0.3)));
    }
    return splitExact(total, w);
  }
  function daily(t) {
    return dailyCache[t] || (dailyCache[t] = dailySeries(t, totalOfType(t)));
  }

  /* 全站總額：每個項目只算一次。
     注意不能把各類型總額相加——一個影視項目同時屬於 OTT／影評人佣金／我的 IP，
     相加會重複計算。表格在「全部」時每列也只出現一次，所以這個數字＝表格的存入總和。 */
  function grandTotal() {
    var store = window.ztorProjects;
    if (!store) return 0;
    return store.list().reduce(function (a, p) { return a + amountFor(p); }, 0);
  }
  var grandCache = null;
  function grandDaily() {
    return grandCache || (grandCache = dailySeries('__grand', grandTotal()));
  }

  /* 分段＝桶的粒度（日／月／季／年），取日資料的最後一段再併桶。
     故細粒度看到的是近期切片，年粒度加總才等於累計總額。 */
  var PERIODS = {
    day:     { buckets: 30, size: 1,   foot: 'fin.trend.range.day' },
    month:   { buckets: 12, size: 30,  foot: 'fin.trend.range.month' },
    quarter: { buckets: 8,  size: 91,  foot: 'fin.trend.range.quarter' },
    year:    { buckets: 3,  size: 365, foot: 'fin.trend.range.year' }
  };
  var curPeriod = 'month';

  function bucketsFor(t, key) {
    var cfg = PERIODS[key], d = daily(t), out = [], span = cfg.buckets * cfg.size;
    var start = Math.max(0, d.length - span), i, j, sum;
    for (i = 0; i < cfg.buckets; i++) {
      sum = 0;
      for (j = 0; j < cfg.size; j++) sum += d[start + i * cfg.size + j] || 0;
      out.push(sum);
    }
    return out;
  }
  /* 每個桶的結束日期（今天為最後一桶）——tooltip 的日期就是它。 */
  function bucketDates(key) {
    var cfg = PERIODS[key], out = [], i, ms = 86400000, today = new Date();
    today.setHours(0, 0, 0, 0);
    for (i = 0; i < cfg.buckets; i++) {
      out.push(new Date(today.getTime() - ((cfg.buckets - 1 - i) * cfg.size) * ms));
    }
    return out;
  }
  function fmtDate(d, key) {
    var zh = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('zh') === 0;
    if (key === 'year') return zh ? (d.getFullYear() + ' 年') : String(d.getFullYear());
    if (key === 'month' || key === 'quarter') {
      return zh ? (d.getFullYear() + '年' + (d.getMonth() + 1) + '月')
                : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return zh ? ((d.getMonth() + 1) + '月' + d.getDate() + '日')
              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  /* 座標軸上限：先把「四等分後的刻度」取成整數，再乘回去。
     2026-07-27：原本直接把最大值進位到 1/2/4/5×10ⁿ，資料峰值 1,100 會被推到 2,000，
     圖表上半整片空白。改成以刻度為單位取整（275→300→上限 1,200），既貼合資料又是整數刻度。 */
  function niceMax(v) {
    if (!(v > 0)) return 100;
    var step = v / (TICKS - 1);
    var e = Math.pow(10, Math.floor(Math.log10(step))), f = step / e;
    var ladder = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10], n = 10, i;
    for (i = 0; i < ladder.length; i++) { if (f <= ladder[i]) { n = ladder[i]; break; } }
    return n * e * (TICKS - 1);
  }
  /* Catmull-Rom → 三次貝茲，維持原本的平滑曲線外觀 */
  function smoothPath(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return 'M ' + pts[0][0] + ',' + pts[0][1];
    var d = 'M ' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1), i;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C ' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
         + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
         + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }

  var X0 = 24, X1 = 672, Y_TOP = 30, Y_BOT = 210, TICKS = 5;
  var svgEl = document.querySelector('[data-fin-svg]');
  var plotEl = document.querySelector('[data-fin-plot]');
  var yAxisEl = document.querySelector('[data-fin-yaxis]');
  var xLabelsEl = document.querySelector('[data-fin-xlabels]');
  var tipEl = document.querySelector('[data-fin-tip]');
  var footEl = document.querySelector('.chart-card__foot [data-i18n="fin.trend.range"]')
            || document.querySelector('.chart-card__foot span');
  var view = null;   /* 目前畫面上的資料：{ key, dates, max, series:{type:[值]}, xs:[] } */

  function buildView(key) {
    var series = {}, max = 0;
    TYPES.forEach(function (t) {
      series[t] = bucketsFor(t, key);
      series[t].forEach(function (v) { if (v > max) max = v; });
    });
    var cfg = PERIODS[key], xs = [], i;
    var step = cfg.buckets > 1 ? (X1 - X0) / (cfg.buckets - 1) : 0;
    for (i = 0; i < cfg.buckets; i++) xs.push(X0 + i * step);
    return { key: key, dates: bucketDates(key), max: niceMax(max), series: series, xs: xs };
  }
  function yOf(v, max) {
    var y = Y_BOT - (v / (max || 1)) * (Y_BOT - Y_TOP);
    return Math.max(Y_TOP - 6, Math.min(Y_BOT, y));
  }

  function renderChart() {
    if (!svgEl) return;
    view = buildView(curPeriod);
    var svg = '', i, t;
    /* 格線 */
    for (i = 0; i < TICKS; i++) {
      var gy = Y_TOP + (Y_BOT - Y_TOP) * (i / (TICKS - 1));
      svg += '<line class="linechart__grid" x1="' + X0 + '" y1="' + gy + '" x2="' + X1 + '" y2="' + gy + '"></line>';
    }
    /* 面積 → 折線 → 熱區線（後畫的在上層，點擊由熱區線接手） */
    var paths = {};
    TYPES.forEach(function (t) {
      paths[t] = smoothPath(view.series[t].map(function (v, i) { return [view.xs[i], yOf(v, view.max)]; }));
    });
    TYPES.forEach(function (t) {
      svg += '<path class="fin-area" data-fin-line="' + t + '" d="' + paths[t]
           + ' L ' + X1 + ',240 L ' + X0 + ',240 Z"></path>';
    });
    TYPES.forEach(function (t) {
      svg += '<path class="linechart__line linechart__line--s' + TYPE_SERIES[t] + '" data-fin-line="' + t + '" d="' + paths[t] + '"></path>';
    });
    svg += '<line class="fin-guide" data-fin-guide x1="0" y1="' + (Y_TOP - 6) + '" x2="0" y2="' + Y_BOT + '" style="display:none"></line>';
    TYPES.forEach(function (t) {
      svg += '<path class="fin-hitline" data-fin-line="' + t + '" data-fin-open="' + t + '" d="' + paths[t] + '"></path>';
    });
    svgEl.innerHTML = svg;

    /* Y 軸刻度：跟著資料上限走（原本寫死 1,500/1,000/500/0，資料一變就與線對不上）*/
    if (yAxisEl) {
      var yh = '';
      for (i = 0; i < TICKS; i++) {
        var val = view.max * (1 - i / (TICKS - 1));
        var pct = ((Y_TOP + (Y_BOT - Y_TOP) * (i / (TICKS - 1))) / 240 * 100).toFixed(2);
        yh += '<span class="linechart__y-tick" style="top:' + pct + '%">' + Math.round(val).toLocaleString('en-US') + '</span>';
      }
      yAxisEl.innerHTML = yh;
    }
    /* X 軸最多標 5 個點，密集粒度才不會擠成一團；桶數少於 5 就全標
       （年粒度只有 3 桶，硬取 5 個會取到重複的索引、印出同一年三次）。 */
    if (xLabelsEl) {
      var n = view.dates.length, marks = Math.min(5, n), picks = [], xh = '';
      for (i = 0; i < marks; i++) picks.push(marks === 1 ? 0 : Math.round(i * (n - 1) / (marks - 1)));
      picks.forEach(function (idx) { xh += '<span>' + fmtDate(view.dates[idx], view.key) + '</span>'; });
      xLabelsEl.style.gridTemplateColumns = 'repeat(' + marks + ', 1fr)';
      xLabelsEl.innerHTML = xh;
    }
    if (footEl) { footEl.removeAttribute('data-i18n'); footEl.textContent = T(PERIODS[curPeriod].foot); }
    applyFocus();
  }

  /* 聚焦：'all' 全亮；否則只亮該類型的面積／線／熱區線 */
  function applyFocus() {
    updateChartTotal();
    if (!chart) return;
    chart.querySelectorAll('[data-fin-line]').forEach(function (l) { l.classList.remove('is-focus'); });
    if (!state.type || state.type === 'all') { chart.removeAttribute('data-focus'); return; }
    chart.setAttribute('data-focus', state.type);
    chart.querySelectorAll('[data-fin-line="' + state.type + '"]').forEach(function (el) { el.classList.add('is-focus'); });
  }
  /* 圖表標題列的類型總額：只在選了單一類型時出現（「全部」由上方 KPI 磚負責，不重複）。 */
  function updateChartTotal() {
    var el = document.querySelector('[data-fin-charttotal]');
    if (!el) return;
    if (!state.type || state.type === 'all') { el.hidden = true; el.innerHTML = ''; return; }
    var label = T('fin.charttotal').replace('{type}', T('fin.type.' + state.type));
    el.hidden = false;
    el.innerHTML = '<span class="fin-dot" style="--dot:var(--chart-' + TYPE_SERIES[state.type] + ')"></span>'
      + '<span class="fin-charttotal__label"></span>'
      + '<strong class="fin-charttotal__value"></strong>';
    el.querySelector('.fin-charttotal__label').textContent = label;
    el.querySelector('.fin-charttotal__value').textContent = ntd(totalOfType(state.type));
  }

  /* ---------- 滑過：導引線 + 當日各類型金額 ---------- */
  function visibleTypes() {
    return (!state.type || state.type === 'all') ? TYPES : [state.type];
  }
  function showTip(idx, clientX) {
    if (!view || !tipEl || !plotEl) return;
    var types = visibleTypes();
    var html = '<div class="fin-tip__date">' + fmtDate(view.dates[idx], view.key) + '</div>';
    types.forEach(function (t) {
      /* 列＝按鈕，data-fin-open 與線上的熱區共用同一個開啟明細的處理器 */
      html += '<button type="button" class="fin-tip__row" data-fin-open="' + t + '">'
           + '<span class="fin-dot" style="--dot:var(--chart-' + TYPE_SERIES[t] + ');margin:0"></span>'
           + '<span>' + T('fin.type.' + t) + '</span>'
           + '<span class="fin-tip__amt">' + ntd(view.series[t][idx]) + '</span></button>';
    });
    html += '<div class="fin-tip__hint">' + T('fin.tip.hint') + '</div>';
    tipEl.innerHTML = html;
    tipEl.hidden = false;

    /* 位置換算：viewBox 用了 preserveAspectRatio="none"，橫向會被拉伸，
       所以要用實際像素寬度換算，不能直接拿 viewBox 座標當螢幕座標。 */
    var box = plotEl.getBoundingClientRect();
    var px = ((view.xs[idx] - X0) / (X1 - X0)) * box.width;
    var guide = svgEl.querySelector('[data-fin-guide]');
    if (guide) { guide.setAttribute('x1', view.xs[idx]); guide.setAttribute('x2', view.xs[idx]); guide.style.display = ''; }
    /* 位置＝游標右側 14px，靠右邊界時翻到左側。這是原本的行為，維持不變。
       （2026-07-27 曾改成「固定貼在另外半邊」想讓浮層更好點，但那讓浮層出現在
        離游標很遠的地方，像壞掉一樣——使用者裁示改回原本的跟隨式定位。
        要能點的關鍵不是位置，是下面的 pointer-events 與凍結，不需要動定位。） */
    var tw = tipEl.offsetWidth, left = px + 14;
    if (left + tw > box.width) left = px - tw - 14;
    if (left < 0) left = 0;
    tipEl.style.left = Math.round(left) + 'px';
    /* 垂直也要夾住：卡片是 overflow:hidden，浮層比繪圖區高就會被裁掉底部。 */
    var top = 8, th = tipEl.offsetHeight;
    if (top + th > box.height) top = Math.max(0, box.height - th);
    tipEl.style.top = Math.round(top) + 'px';
  }
  function hideTip() {
    if (tipEl) tipEl.hidden = true;
    var guide = svgEl && svgEl.querySelector('[data-fin-guide]');
    if (guide) guide.style.display = 'none';
  }
  if (plotEl) {
    plotEl.addEventListener('mousemove', function (e) {
      if (!view) return;
      /* 游標已經移到浮層上時就凍結：再重算會讓浮層在腳下換位置，列就點不到了。 */
      if (e.target.closest && e.target.closest('[data-fin-tip]')) return;
      var box = plotEl.getBoundingClientRect();
      var ratio = (e.clientX - box.left) / (box.width || 1);
      var idx = Math.round(ratio * (view.dates.length - 1));
      idx = Math.max(0, Math.min(view.dates.length - 1, idx));
      showTip(idx, e.clientX);
    });
    plotEl.addEventListener('mouseleave', hideTip);
  }

  /* ---------- 點線 → 類型明細 ---------- */
  var PLATFORMS = ['Spotify', 'YouTube Music', 'KKBOX', 'QQ Music', 'Apple Music', 'LINE MUSIC',
                   'MyMusic', 'Amazon Music', 'friDay 音樂', 'Deezer', '網易雲音樂', 'Tidal'];
  var TOP_N = { music: 8 };            /* 音樂：平台數量少，先列前 8，其餘由「查看全部」展開 */
  var DEFAULT_TOP = 20;                /* 其餘類型：最賺的前 20 個項目 */

  /* 明細＝把同一個 type 總額按來源拆開。同一筆總額可以有多種拆法，每種拆法一張表：
     音樂版稅同時拆成「發行平台」與「單曲・專輯」兩張並排的表（2026-07-27 使用者需求），
     兩張各自加總都等於總額——它們是同一筆錢的兩個切面，不是相加的關係。 */
  function platformRows(total) {
    var w = PLATFORMS.map(function (p) { return 0.2 + rng('p:' + p)(); });
    var amts = splitExact(total, w);
    return PLATFORMS.map(function (p, i) { return { name: p, amount: amts[i] }; })
                    .sort(function (a, b) { return b.amount - a.amount; });
  }
  function itemRows(t) {
    return projectsOfType(t).map(function (p) {
      return {
        name: p.name,
        /* 類別自成一欄（2026-07-27 使用者裁示），連 i18n key 一起帶著走，
           這樣中文介面顯示的是「專輯／單曲」而不是英文 catLabel。 */
        cat: (window.ztorProjects.catLabel(p.cat) || {}).en || p.cat,
        catKey: CAT_I18N[p.cat] || 'fin.cat.custom',
        amount: amountFor(p), id: p.id
      };
    }).sort(function (a, b) { return b.amount - a.amount; });
  }
  function sectionsFor(t) {
    if (t === 'music') {
      return [
        { key: 'platform', dim: 'fin.detail.platform', rows: platformRows(totalOfType(t)), limit: TOP_N.music },
        { key: 'title',    dim: 'fin.detail.title',    rows: itemRows(t),                  limit: DEFAULT_TOP }
      ];
    }
    return [{ key: 'item', dim: 'fin.detail.item', rows: itemRows(t), limit: DEFAULT_TOP }];
  }

  var detailTitle = document.querySelector('[data-fin-detail-title]');
  var detailBody = document.querySelector('[data-fin-detail-body]');
  var detailState = { type: null, expanded: {} };   /* expanded 逐表記錄（兩張表各自展開） */

  /* 單一張表（含表頭、佔比、查看全部）。佔比以該表自己的列為分母，故每張表各自為 100%。 */
  function sectionHtml(sec, showColHead) {
    var truncated = !detailState.expanded[sec.key] && sec.rows.length > sec.limit;
    var shown = truncated ? sec.rows.slice(0, sec.limit) : sec.rows;
    /* 佔比也用 splitExact 分配（單位＝0.1%），逐列各自四捨五入會讓整欄加起來變成
       100.2% 之類的數字。以千分位整數拆分，顯示時再除以 10，整欄必為 100.0%。 */
    var tenths = splitExact(1000, sec.rows.map(function (r) { return r.amount; }));
    /* 有類別的（項目類）多一欄；發行平台沒有類別，維持四欄。欄寬靠 modifier 區分。 */
    var withCat = sec.rows.some(function (r) { return !!r.cat; });
    var html = '<div class="fin-detail__col' + (withCat ? ' fin-detail__col--cat' : '') + '">';
    if (showColHead) html += '<div class="fin-detail__colhead">' + T(sec.dim) + '</div>';
    /* 名稱／類別／金額／佔比皆可排序；「#」是名次（隨排序重新編號），本身不排序。 */
    html += '<div class="fin-scroll"><table class="ztor-table"><thead><tr>'
      + '<th class="fin-detail__rank">#</th>'
      + '<th data-sort="text">' + T(sec.dim) + '</th>'
      + (withCat ? '<th data-sort="text">' + T('fin.col.cat') + '</th>' : '')
      + '<th class="fin-amt sort-th--end" data-sort="num">' + T('fin.col.amount') + '</th>'
      + '<th class="fin-detail__share sort-th--end" data-sort="num">' + T('fin.detail.share') + '</th></tr></thead><tbody>';
    shown.forEach(function (row, i) {
      html += '<tr><td class="fin-detail__rank">' + (i + 1) + '</td>'
           + '<td class="ztor-table__feature">' + row.name + '</td>'
           + (withCat ? '<td class="fin-detail__cat" data-i18n="' + (row.catKey || '') + '">' + (row.cat || '') + '</td>' : '')
           + '<td class="fin-amt">' + ntd(row.amount) + '</td>'
           + '<td class="fin-detail__share">' + (tenths[i] / 10).toFixed(1) + '%</td></tr>';
    });
    html += '</tbody></table></div>';
    if (sec.rows.length > sec.limit) {
      html += '<div class="fin-detail__foot"><button class="btn btn--ghost btn--sm" type="button" data-fin-detail-toggle="' + sec.key + '">'
           + (truncated ? T('fin.detail.seeall') + ' ' + sec.rows.length : T('fin.detail.showless'))
           + '</button></div>';
    }
    return html + '</div>';
  }

  function renderDetail() {
    if (!detailBody) return;
    var t = detailState.type, total = totalOfType(t), secs = sectionsFor(t);
    var dialog = document.querySelector('.payout-modal[data-modal="typedetail"] .payout-dialog');
    if (detailTitle) detailTitle.textContent = T('fin.type.' + t);
    /* 兩張表才加寬對話框；單表維持 620px */
    if (dialog) dialog.classList.toggle('fin-dialog--wide', secs.length > 1);

    if (!secs.some(function (s) { return s.rows.length; })) {
      detailBody.innerHTML = '<div class="empty-card"><span class="empty-card__icon">'
        + '<i data-lucide="banknote" class="ztor-icon"></i></span>'
        + '<h3 class="empty-card__title">' + T('fin.detail.empty') + '</h3></div>';
      if (window.ztorIcons) window.ztorIcons.applyIcons(detailBody);
      return;
    }
    var html = '<div class="fin-detail__head">'
      + '<span class="fin-dot" style="--dot:var(--chart-' + TYPE_SERIES[t] + ')"></span>'
      + '<span class="fin-detail__total">' + ntd(total) + '</span></div>'
      + '<div class="fin-detail__scope">' + T(secs.length > 1 ? 'fin.detail.scope2' : 'fin.detail.scope') + '</div>'
      + '<div class="fin-detail__cols' + (secs.length > 1 ? ' fin-detail__cols--2' : '') + '">';
    secs.forEach(function (s) { html += sectionHtml(s, secs.length > 1); });
    detailBody.innerHTML = html + '</div>';
    if (window.ztorIcons) window.ztorIcons.applyIcons(detailBody);
    /* 類別欄帶 data-i18n，要翻譯過才會顯示「專輯／單曲」而不是英文 */
    if (window.applyI18n) window.applyI18n(detailBody);
    /* 每次重畫都是全新的 <table>，要重新掛排序（元件有 data-sort-ready 防重複）。 */
    if (window.ztorTableSort) window.ztorTableSort.scan(detailBody);
  }
  /* 排序後名次要跟著重編：「#」代表目前這份排列的第幾名，不是固定編號。 */
  if (detailBody) {
    detailBody.addEventListener('ztor:sorted', function (e) {
      var tbl = e.target.closest ? e.target.closest('table') : null;
      if (!tbl) return;
      Array.prototype.forEach.call(tbl.querySelectorAll('tbody tr'), function (tr, i) {
        var cell = tr.querySelector('.fin-detail__rank');
        if (cell) cell.textContent = String(i + 1);
      });
    });
  }
  function openDetail(t) {
    detailState.type = t; detailState.expanded = {};
    renderDetail();
    openModal('typedetail');
  }
  document.addEventListener('click', function (e) {
    var line = e.target.closest('[data-fin-open]');
    if (line) { hideTip(); openDetail(line.getAttribute('data-fin-open')); return; }
    var toggle = e.target.closest('[data-fin-detail-toggle]');
    if (toggle) {
      var k = toggle.getAttribute('data-fin-detail-toggle');
      detailState.expanded[k] = !detailState.expanded[k];   /* 兩張表各自展開／收合 */
      renderDetail();
    }
  });

  /* ---------- 期間切換：重取窗格並重畫（原本只換 active class） ---------- */
  var PERIOD_KEYS = ['day', 'month', 'quarter', 'year'];
  var period = document.querySelector('[data-fin-period]');
  if (period) {
    period.querySelectorAll('.segmented__item').forEach(function (t, i) {
      t.addEventListener('click', function () {
        period.querySelectorAll('.segmented__item').forEach(function (x) {
          x.classList.remove('segmented__item--active'); x.setAttribute('aria-selected', 'false');
        });
        t.classList.add('segmented__item--active'); t.setAttribute('aria-selected', 'true');
        curPeriod = PERIOD_KEYS[i] || 'month';
        hideTip();
        renderChart();
      });
    });
  }

  /* ---------- 上方 KPI 磚：與表格同源 ----------
     2026-07-27 使用者提問：「選『全部』時，右下角的存入總和不就應該等於總收益嗎？」——對。
     這兩塊原本是 Sony 版寫死的數字（15,860 / 1,500），而表格早已改由 projects-store 產生，
     兩邊必然對不上。改成同一個來源：
       總收益   = grandTotal()（每個項目只算一次）＝「全部」時表格的存入總和
       本月收益 = 同一筆總額的日資料取最近 30 天
     「可提領」不動——那是餘額不是收益，屬於另一個語意框架（另有門檻文案）。 */
  (function () {
    if (!window.ztorProjects) return;
    var totalKpi = document.querySelector('[data-fin-kpi="total"]');
    var monthKpi = document.querySelector('[data-fin-kpi="month"]');
    if (totalKpi) totalKpi.textContent = ntd(grandTotal());
    if (monthKpi) {
      var d = grandDaily();
      monthKpi.textContent = ntd(d.slice(Math.max(0, d.length - 30)).reduce(function (a, b) { return a + b; }, 0));
    }
  })();

  renderChart();

  /* ---------- 提領歷史抽屜分頁 ---------- */
  var histRows = document.querySelectorAll('[data-fin-histrows] > tr');
  makePager(function () { return Array.prototype.slice.call(histRows); }, 6,
    document.querySelector('[data-fin-histpager]'));
})();
