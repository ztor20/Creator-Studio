/* ============================================================
   components.js — runtime-injected content blocks.

   Same mechanism as sidebar.js (which injects the topbar): a page
   places a <div data-component="NAME" data-key="..."> placeholder;
   on load each placeholder is filled by a shared renderer using a
   named dataset, then icons / i18n are (re)applied to the new nodes.

   Why: this static-HTML prototype has no build step, so the only way
   to make a block a real "change-once, every-page-syncs" component is
   to render it from one shared function. The transaction list is the
   cross-page case — Dashboard F3 and Earnings render it from the SAME
   renderer, so their row format can never drift again (each page still
   passes its own page-appropriate rows). The rest of the Dashboard
   blocks (F2 ops summary, F4 alerts, F5 activity, F6 events/projects,
   F7 fan/audience insight, F8 external data status) are likewise
   rendered here so each is a single source of truth.

   Load order: AFTER icons.js + i18n.js (needs window.ztorIcons /
   window.applyI18n) and BEFORE reveal.js (so injected .card/.kpi/
   .info-banner exist when reveal sets up its IntersectionObserver).
   Mounts synchronously on execution — placeholders above it in the
   <body> are already parsed.

   Convention: a placeholder keeps its structural wrapper class
   (e.g. class="bento"/"insight-split") and the renderer returns that
   wrapper's children; list renderers return their own .data-list.
   ============================================================ */
(function () {
  'use strict';

  function s(v) { return v == null ? '' : String(v); }
  function di18n(key, fallback) { return key ? ' data-i18n="' + key + '"' : ''; }
  function badge(st) {
    if (!st) return '';
    var cls = 'badge' + (st.variant ? ' badge--' + st.variant : '');
    return '<span class="' + cls + '">'
      + '<span' + di18n(st.key) + '>' + s(st.fallback) + '</span></span>';
  }

  /* ===========================================================
     Renderers
     =========================================================== */

  // F3 / Earnings — one transaction row: icon · name · source·date · amount(+currency) · status pill.
  // hideStatus drops the status pill: Dashboard F3 only lists settled income (spec 5.1.1 §F3
  // "狀態恆為 settled，故不另列狀態欄"); Earnings still passes statuses, so the column is per-call.
  function txRow(r, hideStatus) {
    var iconCls = 'data-list__icon' + (r.iconVariant ? ' data-list__icon--' + r.iconVariant : '');
    var amtCls  = 'data-list__amount' + (r.neg ? ' data-list__amount--neg' : '');
    return ''
      + '<div class="data-list__row">'
      +   '<div class="data-list__row-main">'
      +     '<div class="' + iconCls + '"><i data-lucide="' + r.icon + '" class="ztor-icon"></i></div>'
      +     '<div class="data-list__body">'
      +       '<div class="data-list__title"' + di18n(r.titleKey) + '>' + s(r.title) + '</div>'
      +       '<div class="data-list__meta"' + di18n(r.metaKey) + '>' + s(r.meta) + '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="data-list__end">'
      +     '<div class="' + amtCls + '">' + s(r.amount) + '</div>'
      +     (hideStatus ? '' : badge(r.status))
      +   '</div>'
      + '</div>';
  }


  /* ── 逐筆成框的收入列（2026-08-28 使用者裁示「一筆一個 section 匡」）─────────
     與 txRow／txTableRow 是**三支各自獨立**的渲染，刻意不共用：
     那兩支的版面前提是「一整欄上下對齊比較」，這一支的前提是「窄欄裡一筆一個
     完整敘述」。合成一支會讓任何一次調整同時打到 earnings 等頁。
     欄位全部取自既有的 TX 資料（名稱／來源／時間／金額），不新造任何產品事實。
     樣式在 ds-components/earnings-feed.css。 */
  /* 時間欄：當天的那幾筆顯示時分秒，其餘照舊顯示日期（2026-08-31 使用者裁示
     「如果是今天就顯示幾點幾分幾秒」）。當天與否由資料端的 `todayMinsAgo` 決定
     ——原型層沒有真實交易時間戳，這個數字是「幾分鐘前」的示意值（ASSUMPTIONS
     FEED-001）；每次重畫都以當下時間回推，所以畫面上的鐘會跟著走，而不是一個
     寫死的字串。這一格因此不掛 data-i18n：時分秒兩個語言寫法相同，沒有可譯的字。 */
  function timeCell(r, stamps) {
    var at = stamps && stamps[r.titleKey];
    if (typeof at !== 'number' && typeof r.todayMinsAgo === 'number') at = Date.now() - r.todayMinsAgo * 60000;
    if (typeof at !== 'number') {
      return '<span class="earnings-feed__time"' + di18n(r.timeKey) + '>' + s(r.time) + '</span>';
    }
    var t = new Date(at);
    function pad(x) { return (x < 10 ? '0' : '') + x; }
    return '<span class="earnings-feed__time">'
      + pad(t.getHours()) + ':' + pad(t.getMinutes()) + ':' + pad(t.getSeconds())
      + '</span>';
  }

  function earningsFeedItem(r, entering, stamps) {
    var cls = 'earnings-feed__item' + (entering ? ' earnings-feed__item--enter' : '');
    var amtCls = 'earnings-feed__amount' + (r.neg ? ' earnings-feed__amount--neg' : '');
    return '<div class="' + cls + '">'
      +   '<div class="earnings-feed__name"' + di18n(r.titleKey) + '>' + s(r.title) + '</div>'
      +   '<div class="' + amtCls + '">' + s(r.amount) + '</div>'
      +   '<div class="earnings-feed__meta">'
      +     '<i data-lucide="' + s(r.icon) + '" class="ztor-icon earnings-feed__icon" aria-hidden="true"></i>'
      +     '<span class="earnings-feed__src"' + di18n(r.srcKey) + '>' + s(r.src) + '</span>'
      +     timeCell(r, stamps)
      +   '</div>'
      + '</div>';
  }

  /* ── 表格版列渲染（2026-07-31 使用者裁示：儀表板三張卡的欄位要拆成表格）──
     只有帶 table:true 的資料集會走這裡；其餘消費端（earnings 的 earn-recent、
     F2 專案 popup 的 ops-projects-list）維持原本的清單樣式，避免一支渲染器換掉
     就把不相干的頁面一起改了。
     圖示留在第一欄：它承載狀態語意（收入的成功／資訊色、動態的完成／里程碑），
     不是純裝飾，拿掉會少一層可掃視的資訊。 */
  /* 第一欄：有 img 就放真實縮圖（沿用 .ztor-table__thumb，同 finance-overview 的做法），
     沒有才退回狀態圖示。2026-07-31 使用者要求儀表板三張表改用商品／作品圖，
     配圖一律取自 projects-store／products 的既有對應，不自行湊圖——這個 repo
     先前就修過「商品圖文不符」，亂配等於再犯一次。 */
  /* 儀表板三張表一律單行截斷（2026-07-31 使用者裁示）；modifier 樣式在 ds-components/table.css。 */
  var TRUNCATE = 'ztor-table--truncate';
  function iconCell(r) {
    if (r.img) return '<td><img class="ztor-table__thumb" src="' + s(r.img) + '" alt="" loading="lazy"></td>';
    var cls = 'data-list__icon' + (r.iconVariant ? ' data-list__icon--' + r.iconVariant : '');
    return '<td><div class="' + cls + '"><i data-lucide="' + r.icon + '" class="ztor-icon"></i></div></td>';
  }
  /* 縮圖與名稱同一格（2026-07-31 使用者：「圖片左右空隙太大」）。縮圖自成一欄時
     兩側各吃一次儲存格內距（20px），32px 的圖就浮在 72px 的空欄中間；站上既有的
     答案是 .ztor-table__media——同一格內的 flex 內層包裝，間距只有 --sp-10。
     表頭用 .ztor-table__media-head 把標籤推過縮圖，欄名仍對齊名稱而非圖片。 */
  function nameCell(r, inner) {
    var media = r.img
      ? '<img class="ztor-table__thumb" src="' + s(r.img) + '" alt="" loading="lazy">'
      : '<span class="data-list__icon' + (r.iconVariant ? ' data-list__icon--' + r.iconVariant : '')
        + '"><i data-lucide="' + r.icon + '" class="ztor-icon"></i></span>';
    return '<td class="ztor-table__feature ztor-table__namecell"><span class="ztor-table__media">'
      + media + '<span class="ztor-table__mediatext">' + inner + '</span></span></td>';
  }

  function txTableRow(r, hideStatus) {
    var amtCls = 'data-list__amount' + (r.neg ? ' data-list__amount--neg' : '');
    return '<tr>'
      + nameCell(r, '<span' + di18n(r.titleKey) + '>' + s(r.title) + '</span>'
      +     '<span class="ztor-table__sub"' + di18n(r.srcKey) + '>' + s(r.src) + '</span>')
      + '<td class="ztor-table__datecell text-sub"><span' + di18n(r.timeKey) + '>' + s(r.time) + '</span></td>'
      + '<td style="text-align:right"><span class="' + amtCls + '">' + s(r.amount) + '</span></td>'
      + (hideStatus ? '' : '<td>' + badge(r.status) + '</td>')
      + '</tr>';
  }
  /* 日期併進第二行（2026-07-31）：這張卡是 span-5，1155px 視窗下四欄會溢出 52px、
     狀態徽章被切掉。日期與來源模組同屬「這件事發生在哪、什麼時候」的歸屬資訊，
     放同一行讀起來也自然；狀態則必須留成獨立欄——它是這張卡真正要看的東西。 */
  function activityTableRow(r) {
    return '<tr>'
      + nameCell(r, '<span' + di18n(r.titleKey) + '>' + s(r.title) + '</span>'
      +     '<span class="ztor-table__sub"><span' + di18n(r.modKey) + '>' + s(r.mod) + '</span>'
      +       ' · <span' + di18n(r.dateKey) + '>' + s(r.date) + '</span></span>')
      + '<td class="ztor-table__nowrap">' + badge(r.status) + '</td>'
      + '</tr>';
  }
  /* 進度欄同時承擔狀態（2026-07-31 使用者裁示）：只有「正在進行」的列顯示進度數字
     （幾張票／多少支持者），其餘狀態直接把狀態詞寫進這一欄，狀態欄因此整個拿掉。
     判準是「數字本身就說明了現況」——集資中／售票中屬之；草稿、準備中、已成功、
     已售完、已結束、已取消都要明講，光看數字看不出來。 */
  var RUNNING_STATUS = { 'status.live': 1, 'status.on-sale': 1, 'projects.state.published': 1 };
  function eventProjectTableRow(r) {
    var running = !!(r.status && RUNNING_STATUS[r.status.key]);
    var progCell = running
      ? (r.pct == null
          ? '<span' + di18n(r.progKey) + '>' + s(r.prog) + '</span>'
          : '<div class="ztor-table__goal">'
            +   '<span class="ztor-table__goal-pct">' + r.pct + '%</span>'
            +   '<div class="project-bar" aria-hidden="true"><div class="project-bar__fill" style="width:' + r.pct + '%"></div></div>'
            +   '<span class="ztor-table__goal-amt"' + di18n(r.progKey) + '>' + s(r.prog) + '</span>'
            + '</div>')
      : (r.status
          ? '<span class="ztor-table__state--' + s(r.status.variant || 'neutral') + '"'
            + di18n(r.status.key) + '>' + s(r.status.fallback) + '</span>'
          : '—');
    return '<tr>'
      + nameCell(r, '<span' + di18n(r.titleKey) + '>' + s(r.title) + '</span>'
      +     '<span class="ztor-table__sub"' + di18n(r.catKey) + '>' + s(r.cat) + '</span>')
      + '<td class="text-sub">' + progCell + '</td>'
      + '<td class="text-sub"><span' + di18n(r.dueKey) + '>' + s(r.due) + '</span></td>'
      + '<td class="ztor-table__chevcell">'
      +   (r.go ? '<a class="data-list__go" href="' + r.go + '" aria-label="Open"><i data-lucide="chevron-right" class="ztor-icon"></i></a>' : '')
      + '</td>'
      + '</tr>';
  }
  /* ── 卡片版的進行中項目（2026-08-28 使用者裁決：儀表板 F6 的 Ongoing 分頁
     由表格改成一排卡片）──────────────────────────────────────────────
     為什麼另開一支而不是改 eventProjectTableRow：那一支還餵著「進行中項目」
     彈窗（index.html 的 data-bd-modal="ops-projects"）與 docs/ 的儀表板探索稿，
     一支渲染器換掉就會把不相干的落點一起改了（同 2026-07-31 表格版的判斷）。
     spec 5.1.1 §F6 要求的七項在這裡逐項對應，樣式與理由見
     ds-components/work-card.css 檔頭。
     整卡是 <a>：鍵盤 Tab 走得到、Enter 直接導頁，不必補 data-go 那套委派；
     卡內沒有第二個互動元素，所以也沒有要攔的內層點擊。 */
  /* 狀態 variant → 狀態點的色階。資料端的 variant 是徽章用的詞彙（orange/info/
     success/空），這裡映到既有的 .ztor-dot 修飾類；沒對到的就用中性點，
     不要讓一個沒見過的 variant 靜默變成沒有點。 */
  var WORK_DOT = { orange: 'warning', info: 'info', success: 'success' };

  /* 磚下方的文字塊（2026-08-28 第四版重排，使用者：「應該分開不同行，並且重新整理」）。
     四段由上而下：
       __kind   作品類型（音樂／電影…）＝眉標。刻意最淡最小——封面其實已經講了一半
                （專輯封面 vs 電影海報一眼可辨），它只是把那個直覺變成明確的字。
       __name   名稱＝識別，權重最強、獨佔一行。
       __state  一行兩端：左＝項目類型（預購／共創／上線），右＝最可行動的那個值
                （剩餘天數 ＞ 百分比 ＞ 上線日）。兩者同一行是因為它們講的是同一件事——
                「這是什麼機制、現在到哪」；分兩行反而要讀者自己接起來。
                兩端對齊而不是用「·」串接：中英文的長度差很大，串接在英文會爆行。
       __bar    進度條，只有真的有百分比時才畫。
     狀態點已撤除（2026-08-28）：純顏色沒有圖例，看得見的人得不到資訊；
     而且磚列本身已有「進行中／最近發生」分頁在篩狀態，點只能再細分一階，不值一個視覺元素。
     狀態詞仍以視覺隱藏的形式留給讀屏。 */
  function workCard(r) {
    var srStatus = r.status
      ? '<span class="u-visually-hidden"' + di18n(r.status.key) + '>' + s(r.status.fallback) + '</span>'
      : '';
    var state = '';
    if (r.type || (r.timing && r.timing.value)) {
      state = '<div class="work-card__state">'
        + '<span class="work-card__type">' + s(r.type || '') + '</span>'
        + '<span class="work-card__value">' + s(r.timing ? r.timing.value : '') + '</span>'
        + '</div>';
    }
    var bar = (r.timing && r.timing.pct != null)
      ? '<div class="project-bar work-card__bar" aria-hidden="true">'
        + '<div class="project-bar__fill" style="width:' + r.timing.pct + '%"></div></div>'
      : '';
    /* 眉標有一段與兩段兩種形態。作品磚只有作品類型（一段）；事件磚是
       「事件類型 ↔ 事件來源」兩端對齊（規格 5.1.1 §F5 的第 1、3 項），
       排法與下方狀態列刻意相同——兩行同一種對齊，眼睛才會把它們讀成一組。 */
    var kind = r.kindRight
      ? '<div class="work-card__kind work-card__kind--split">'
        + '<span class="work-card__kind-text">' + s(r.kind) + '</span>'
        + '<span class="work-card__source">' + s(r.kindRight) + '</span>'
        + '</div>'
      : '<div class="work-card__kind">' + s(r.kind) + '</div>';
    /* 沒有 go 就不是連結，改吐 <div>。寧可這張磚不能點，也不要給一個會 404 的落點；
       同時它就不該進 Tab 鍵序——聚焦得到卻按了沒反應，比根本不能聚焦更難懂。 */
    var open  = r.go ? '<a class="work-card" href="' + s(r.go) + '">' : '<div class="work-card work-card--static">';
    var close = r.go ? '</a>' : '</div>';
    return open
      + '<div class="work-card__cover">'
      +   '<img class="work-card__bg" src="' + s(r.img) + '" alt="" aria-hidden="true" loading="lazy">'
      +   '<img class="work-card__img" src="' + s(r.img) + '" alt="" loading="lazy">'
      + '</div>'
      + srStatus
      + kind
      + '<div class="work-card__name">' + s(r.title) + '</div>'
      + state + bar
      + close;
  }
  function tableWrap(headCells, bodyRows, mod) {
    return '<div class="ztor-table-scroll"><table class="ztor-table' + (mod ? ' ' + mod : '') + '"><thead><tr>'
      + headCells + '</tr></thead><tbody>' + bodyRows + '</tbody></table></div>';
  }
  function th(key, label, extra) { return '<th' + (extra || '') + di18n(key) + '>' + label + '</th>'; }

  // F2 — operations summary KPI tile. delta + metaLink can coexist (e.g. Total revenue shows a
  // week-over-week delta with freshness AND a deep-link into Earnings, spec 5.1.1 §F2). delta.neg
  // flips to the down/negative style (.kpi__delta--neg); divide-by-zero "new" is runtime logic.
  /* 微型走勢圖（.sparkline，見 ds-components/sparkline.css）：把一串數字轉成
     折線與線下填充的 SVG path。座標系固定 100×30，靠 preserveAspectRatio="none"
     橫向撐滿卡寬——所以這裡只需要照資料的最大最小值正規化，不必知道實際像素。
     單一數值或全平的序列會讓 span 為 0，除法會炸；退回畫中線。 */
  function sparkPaths(vals, opt) {
    opt = opt || {};
    var W = 100, H = opt.h || 30, PAD = 3;   // PAD 留給線寬，免得極值被裁掉半條線
    /* 刻度給了固定值域就照它算（折線才會對齊格線與目標線）；沒給才用資料自身的極值。 */
    var max = opt.max != null ? opt.max : Math.max.apply(null, vals);
    var min = opt.min != null ? opt.min : Math.min.apply(null, vals);
    var span = max - min;
    var stepX = vals.length > 1 ? W / (vals.length - 1) : 0;
    var yOf = function (v) {
      return span === 0 ? H / 2 : PAD + (H - PAD * 2) * (1 - (v - min) / span);
    };
    var pts = vals.map(function (v, i) { return [i * stepX, yOf(v)]; });
    var d = function (list) {
      return list.map(function (p, i) {
        return (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2);
      }).join(' ');
    };
    return {
      /* 值域一起回傳：附加線要用同一組 max/min 才比得起來（見 sparkBlock 的 extra）。 */
      max: max, min: min,
      line: d(pts),
      area: d(pts) + ' L' + W + ' ' + H + ' L0 ' + H + ' Z',
      /* 區間工具：把索引區間換成「重點線段的 path」與「兩端圓點的座標」。 */
      seg: function (from, to) { return d(pts.slice(from, to + 1)); },
      at: function (i) { return pts[i]; },
      xOf: function (i) { return i * stepX; },
      yOf: yOf,
      W: W, H: H
    };
  }

  /* 走勢圖（`.sparkline`）的產出抽成共用函式（2026-08-31）：KPI 卡與展示版左欄
     第一格都要畫同一種圖，兩邊各寫一份遲早會分岔。欄位說明見呼叫端。 */
  function sparkBlock(sk) {
    if (!sk || !sk.values || !sk.values.length) return '';
    var yT = sk.yTicks || [];
    var withV = yT.filter(function (k) { return k.v != null; });
    var H = sk.h || (sk.detail ? 76 : 30);
    /* 值域預設由刻度決定（最上與最下那一格），但可以用 `sk.max` / `sk.min` 覆寫
       （2026-08-31）：刻度是「畫幾條格線」，值域是「線落在哪裡」，多條線疊在一起時
       這兩件事會分家——格線要落在整數（$20k／$10k），值域卻得包住最高的那條線
       （24.8k）。不分家的話最高點會被畫到畫布之外、線在頂邊被切平（實測踩過）。 */
    var sp = sparkPaths(sk.values, {
      h: H,
      max: sk.max != null ? sk.max : (withV.length ? withV[0].v : null),
      min: sk.min != null ? sk.min : (withV.length ? withV[withV.length - 1].v : null)
    });

    var svg = '';
    /* 格線畫在每個「有值」的縱軸刻度上，折線才跟刻度對得起來。 */
    withV.forEach(function (k) {
      var y = sp.yOf(k.v).toFixed(2);
      svg += '<line class="sparkline__grid" x1="0" y1="' + y + '" x2="100" y2="' + y + '"></line>';
    });
    (sk.bands || []).forEach(function (b) {
      var x1 = sp.xOf(b.from), x2 = sp.xOf(b.to);
      svg += '<rect class="sparkline__band" x="' + x1.toFixed(2) + '" y="0" width="'
           + (x2 - x1).toFixed(2) + '" height="' + H + '"></rect>';
    });
    svg += '<path class="sparkline__area" d="' + sp.area + '"></path>';
    svg += '<path class="sparkline__line" d="' + sp.line + '"></path>';
    /* 附加線（2026-08-31）：與主線共用同一組值域與同一支 `sparkPaths`，
       所以幾條線疊起來的高低是可以互相比較的——各自算自己的極值就會變成
       「每條線都填滿整個高度」，那種圖看起來有比較、實際上不能比。
       只畫線不畫面：面積填滿疊在一起會把底下那條蓋掉。 */
    (sk.extra || []).forEach(function (ex) {
      if (!ex.values || !ex.values.length) return;
      var ep = sparkPaths(ex.values, { h: H, max: sp.max, min: sp.min });
      svg += '<path class="sparkline__line sparkline__line--sub" style="--line:' + (ex.color || 'var(--chart-1)')
           + '" d="' + ep.line + '"></path>';
    });
    if (sk.target && sk.target.v != null) {
      var ty = sp.yOf(sk.target.v).toFixed(2);
      svg += '<path class="sparkline__target" d="M0 ' + ty + ' L100 ' + ty + '"></path>';
    }
    /* 重點線段疊在主線之上，主線因此不必被切斷。
       2026-08-28 使用者裁示端點圓點撤除：區間的起訖已經由色塊的左右邊界講清楚，
       再放兩顆點是同一件事講第二次，在這個尺寸下也只是兩個雜訊。 */
    (sk.bands || []).forEach(function (b) {
      svg += '<path class="sparkline__seg' + (b.trend ? ' sparkline__seg--' + b.trend : '')
           + '" d="' + sp.seg(b.from, b.to) + '"></path>';
    });

    var axisY = yT.length
      ? '<div class="sparkline__axis-y">' + yT.map(function (k) {
          return '<span' + di18n(k.key) + '>' + s(k.text) + '</span>';
        }).join('') + '</div>'
      : '';
    var axisX = (sk.xTicks && sk.xTicks.length)
      ? '<div class="sparkline__axis-x">' + sk.xTicks.map(function (k) {
          return '<span' + di18n(k.key) + '>' + s(k.text) + '</span>';
        }).join('') + '</div>'
      : '';

    /* 區間標籤：疊在 SVG 之上的 HTML（不能畫進 SVG——preserveAspectRatio="none"
       只拉伸 x，SVG 裡的文字會變扁）。水平對齊區間中點、垂直落在區間最高點之上；
       中點超過 60% 的區間改靠右對齊，否則置中的標籤會溢出畫布右緣。 */
    var marks = '';
    (sk.bands || []).forEach(function (b) {
      if (!b.label) return;
      var mid = (sp.xOf(b.from) + sp.xOf(b.to)) / 2;
      var top = Math.min.apply(null, sk.values.slice(b.from, b.to + 1).map(sp.yOf));
      var atEnd = mid > 60;
      marks += '<span class="sparkline__mark' + (atEnd ? ' sparkline__mark--end' : '')
        + (b.trend ? ' sparkline__mark--' + b.trend : '') + '" style="left:'
        + (atEnd ? sp.xOf(b.to).toFixed(1) : mid.toFixed(1)) + '%;top:'
        + (top / H * 100).toFixed(1) + '%"' + di18n(b.labelKey) + '>' + s(b.label) + '</span>';
    });

    /* 橫軸包在 __main 裡跟畫布同寬——放在 .sparkline 底下會連縱軸那一欄一起撐開，
       最後一個刻度就會落在縱軸標籤底下而不是折線的終點（2026-08-28 修）。 */
    return '<div class="sparkline' + (sk.detail ? ' sparkline--detail' : '') + '" aria-hidden="true">'
      + '<div class="sparkline__plot">'
      + '<div class="sparkline__main">'
      + '<div class="sparkline__canvas">'
      + '<svg class="sparkline__svg" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none">'
      + svg + '</svg>' + marks + '</div>' + axisX + '</div>'
      + axisY + '</div></div>';
  }

  function kpiTile(t) {
    var sub = '';
    /* delta 自 2026-08-28 起改掛在數字那一行（見下方 valueRow），不再進 sub。 */
    if (t.metaLink) sub += '<div class="kpi__meta"><a class="card__link" href="' + t.metaLink.href + '"' + di18n(t.metaLink.key) + '>' + s(t.metaLink.text) + '</a></div>';
    /* 原本是 else-if 且要求「沒有 delta」才顯示 meta——有 delta 的卡就永遠看不到註腳。
       2026-08-19 放寬成 plainMeta 明示（V3 的總收入卡同時要 delta 與「2 小時前更新」），
       既有呼叫端沒有 plainMeta，行為完全不變。 */
    else if (t.meta && (t.plainMeta || !t.delta)) sub += '<div class="kpi__meta"' + di18n(t.meta.key) + '>' + s(t.meta.text) + '</div>';
    /* t.open = key of a .payout-modal on the page (data-bd-modal). The whole tile
       becomes a <button> that opens it — an in-place detail popup instead of a
       cross-page jump (L directive 2026-07-27: consistent UX, clear next step).
       A trailing chevron in the label row is the tap affordance (same glyph the
       alert cards / data-list rows use for "this opens something"). */
    /* Chevron sits OUTSIDE .kpi__label (absolutely positioned top-right) — the label
       carries data-i18n, and a language apply rewrites its innerHTML, which would
       wipe an inline icon. */
    var chev = t.open ? '<i data-lucide="chevron-right" class="ztor-icon kpi__chevron" aria-hidden="true"></i>' : '';
    /* t.topLink = 右上角的去處連結（＋chevron），與 kpi__meta 的純文字註腳分開。
       2026-08-19 為儀表板 V3 探索頁新增：原本「時間 · 去處」擠在同一條底線連結裡，
       使用者要求把去處提到右上、時間留在原地且不要連結底線。純選配，既有呼叫端不受影響。 */
    /* 文字與 chevron 包在同一個 <a> 裡（2026-08-19 修）：原本是兩個各自絕對定位的元素，
       文字有行高、圖示沒有，兩者的視覺中線對不齊。包成一個 inline-flex 就由 align-items
       負責對齊，不必手動配 top 值。
       data-i18n 掛在內層 <span> 而非 <a>：換語言會重寫該節點的 innerHTML，掛在 <a> 上
       會把 chevron 一起洗掉（同 kpi__chevron 當初的處置）。 */
    /* 2026-08-19 使用者裁決：畫面上只留箭頭、不留文字，顏色回到與其他三塊 KPI 的
       .kpi__chevron 一致的中性色（不用橘）。文字改成 .u-visually-hidden——它仍在
       無障礙樹裡當這個連結的名字，只是不佔墨；純圖示連結沒有名字讀屏會唸不出去處。
       data-i18n 掛在那個 <span> 上而不是 <a>：換語言會重寫該節點的 innerHTML，
       掛在 <a> 上會把箭頭一起洗掉。 */
    var topLink = t.topLink
      ? '<a class="kpi__toplink" href="' + t.topLink.href + '">'
        + '<span class="u-visually-hidden"' + di18n(t.topLink.key) + '>' + s(t.topLink.text) + '</span>'
        + '<i data-lucide="chevron-right" class="ztor-icon kpi__toplink-chev" aria-hidden="true"></i>'
        + '</a>'
      : '';
    /* 數字那一行：金額＋（選配）成長膠囊，膠囊與金額 baseline 對齊。
       2026-08-28：hover 展開對照期的 .kpi__delta-ctx 一併退場——儀表板收入卡的膠囊本身
       已撤除（走勢圖標記區間標了同一個數字），全站再無消費端，不留死碼。 */
    var deltaEl = t.delta
      ? '<span class="kpi__delta' + (t.delta.neg ? ' kpi__delta--neg' : '') + '"'
        + di18n(t.delta.key) + '>' + s(t.delta.text) + '</span>'
      : '';
    var valueRow = '<div class="kpi__value-row">'
      + '<div class="kpi__value">' + s(t.value) + '</div>' + deltaEl + '</div>';

    /* t.spark → 卡底的微型走勢圖（.sparkline，見 ds-components/sparkline.css）。
       欄位（除了 values 全是選配，給了才畫）：
         values   一串數字
         yTicks   縱軸刻度，由上而下 [{key,text,v}]；v 給了就用來定值域與格線位置
         xTicks   橫軸刻度，由左而右 [{key,text}]
         target   { v } 目標值的虛線（2026-08-28 起不帶文字註記，使用者裁示上緣那行不需要）
         bands    [{from,to,trend}] 標記區間（索引），畫色塊＋重點線段；trend 為 'up'／'down'，決定語意色
         detail   true 時套 --detail（繪圖區加高，四段刻度才排得開）
       aria-hidden：圖是數字的視覺附註，精確值 .kpi__value 已唸過；
       量級、期間與目標由刻度和註記那幾個 i18n 字串負責。 */
    var spark = t.spark ? sparkBlock(t.spark) : '';
    var inner = chev + topLink
      + '<div class="kpi__label"' + di18n(t.labelKey) + '>' + s(t.label) + '</div>'
      + valueRow
      + sub
      + spark;
    /* t.hero = 這一列的主角數字（.kpi--hero → 整張卡實色橘）。一列只給一個。
       t.accent = 只把數字染成 --brand-ink 橘、底色維持一般（
       墨色一律走 --brand-ink，不得 var(--primary)，見 STYLE-DECISIONS Q8）。
       t.span = 欄寬（預設 4；V3 一排四塊時給 3）。 */
    var mods = (t.hero ? ' kpi--hero' : '')
      + (t.accent ? ' kpi--accent' : '')
;
    var span = ' bento--span-' + (t.span || 4);
    /* t.focus = 頁內落點的元素 id（2026-08-28）：點了捲到該元素並把焦點交給它，
       而不是開彈出層。待處理事項改成頁內面板之後，這顆計數卡的去處就在同一頁上，
       為了同一份資料再開一層窗只會多一次「關掉才能繼續看」。
       t.open 仍然保留並可與 t.focus 並存：同一支渲染器也餵 docs/ 的儀表板探索稿，
       那些頁面沒有面板、仍靠彈出層承接（處理器找不到 focus 目標時自己退場）。 */
    if (t.focus || t.open) {
      return '<button type="button" class="kpi kpi--tappable' + span + mods + '"'
        + (t.focus ? ' data-focus="' + t.focus + '"' : '')
        + (t.open ? ' data-bd-open="' + t.open + '"' : '') + '>' + inner + '</button>';
    }
    return '<div class="kpi' + span + mods + '">' + inner + '</div>';
  }

  // F4 — alert / action card. Processing state lives in a.meta (severity · object · Open/In progress/Snoozed).
  // a.snoozed = soft-closed info item (muted, reappears ~7d, spec 5.1.1 §F4); a.blocking = compliance-type
  // item that can only be resolved in its source module → the close control is disabled (locked).
  function alertCard(a) {
    /* 右上控制鈕三態（spec §F4「處理狀態」）：
         阻斷型  → 鎖頭 disabled，只能在來源模組解決
         資訊型  → 暫緩（軟關）：規格允許資訊型軟關、約 7 天後重新浮現並留痕
         其餘    → 前往（整卡導航的顯性把手）
       2026-08-19 修：此前非阻斷一律給 chevron「前往」，等於軟關這個動作全站不存在，
       規格的「處理狀態」只做到唯讀顯示。 */
    var close = a.blocking
      ? '<button class="alert__close btn btn--icon btn--xs" type="button" disabled aria-label="Resolve in source module" title="Resolve in the source module"><i data-lucide="lock" class="ztor-icon"></i></button>'
      : (a.variant === 'info' && !a.snoozed)
      ? '<button class="alert__close btn btn--icon btn--xs" type="button" data-snooze="' + s(a.id) + '" aria-label="Snooze" title="Snooze — reappears in about 7 days"><i data-lucide="clock" class="ztor-icon"></i></button>'
      : '<button class="alert__close btn btn--icon btn--xs" type="button" aria-label="Open"><i data-lucide="chevron-right" class="ztor-icon"></i></button>';
    /* data-go：整張卡都可點、去 CTA 的同一個深連結（L directive 2026-07-27 —— 點擊目標
       不只那行小字）。委派 handler 在 mount 下方；內部 <a>（CTA）維持原生導航不重複處理。
       鍵盤：tabindex + Enter（handler 同處）。blocking 卡照樣可點——lock 鎖的是「關閉」，
       不是「前往處理」。 */
    return '<div class="alert alert--card alert--' + a.variant + (a.snoozed ? ' alert--snoozed' : '')
      + (a.ctaHref ? '" data-go="' + a.ctaHref + '" tabindex="0" role="link' : '') + '">'
      + '<div class="alert__icon"><i data-lucide="' + a.icon + '" class="ztor-icon"></i></div>'
      + '<div class="alert__body">'
      +   '<div class="alert__title"' + di18n(a.titleKey) + '>' + s(a.title) + '</div>'
      +   '<div class="alert__desc"' + di18n(a.descKey) + '>' + s(a.desc) + '</div>'
      +   '<div class="alert__meta"' + di18n(a.metaKey) + '>' + s(a.meta) + '</div>'
      +   '<a class="alert__cta" href="' + a.ctaHref + '"' + di18n(a.ctaKey) + '>' + s(a.cta) + '</a>'
      + '</div>'
      + close
      + '</div>';
  }

  /* ── F4 · 待處理事項面板（2026-08-28）─────────────────────────────────
     同一份 dash-alerts 此前有三個出口（警示條、待處理彈窗、查看全部彈窗），
     使用者裁決併成一個頁內分組面板。分組依據＝來源模組（item.src），
     組序照該組最急那一則的 urgency 由高到低——分組是為了「知道要去哪裡處理」，
     排序仍要維持「先看最會出事的」。

     受影響細項（details）與相對時間（ago）都由資料端提供，渲染器不生成任何
     產品事實；「下一步」那一行沿用該則本來就有的 cta／ctaHref，不是推薦引擎。 */
  var ISSUE_SRC_ICON = {
    'my-ip':         'tag',
    'e-shop':        'package',
    'events':        'ticket',
    'settings':      'sliders-horizontal',
    'fan-analytics': 'globe'
  };
  /* 分組標題的 fallback 文字（i18n 套上去之前那一瞬間會看到它）。
     不用 item.src 當 fallback：那是路由用的內部字串（e-shop、fan-analytics），
     露出來就是把程式的內部命名端到畫面上。真正的譯文走 item.srcKey。 */
  var ISSUE_SRC_LABEL = {
    'my-ip':         'My IP',
    'e-shop':        'E-Shop',
    'events':        'Events',
    'settings':      'Settings',
    'fan-analytics': 'Fans'
  };
  /* 嚴重度只用一顆小圓點承載（Q77 表面律：顏色只上小面積標記，不鋪進事項卡的面）。
     舊版是一顆帶數字的徽章，數字＝細項數；但那個數字跟標題本身（如「Low stock ·
     3 items」）和群組筆數重複，一列裡三個數字讀者只能猜哪個是哪個。 */
  var ISSUE_SEV = { error: 'issue-card__sev--error', warning: 'issue-card__sev--warning', info: 'issue-card__sev--info' };

  /* 每個細項自己帶一顆動作鈕，而不是整張卡共用一條「下一步」：一則「庫存過低 ·
     3 項商品」真正要做的是「這三件各自去補」，共用一條連結等於把三件事併成一件。
     去處取該則告警既有的 `ctaHref`（細項可用 `d.href` 覆寫），文案取既有的 `cta`——
     兩者都不是這裡生出來的，渲染器不製造任何產品事實（ASSUMPTIONS ISSUE-001）。 */
  function issueDetail(d, a) {
    var href = d.href || (a && a.ctaHref);
    var label = d.cta || (a && a.cta);
    var key   = d.ctaKey || (a && a.ctaKey);
    return '<div class="issue-detail">'
      + '<div class="issue-detail__body">'
      +   '<div class="issue-detail__name"' + di18n(d.nameKey) + '>' + s(d.name) + '</div>'
      +   (d.sub ? '<div class="issue-detail__sub"' + di18n(d.subKey) + '>' + s(d.sub) + '</div>' : '')
      + '</div>'
      + (href ? '<a class="btn btn--outline btn--sm issue-detail__action" href="' + s(href) + '"' + di18n(key) + '>' + s(label) + '</a>' : '')
      + '</div>';
  }

  /* `where` 有值＝展示版左欄那一格（compact）。它同時是「用哪一種排法」的開關，
     所以呼叫端一律顯式傳（完整版寫成 `function (a) { return issueCard(a); }`）：
     直接餵給 `map` 的話第二個參數會是索引，第二張起就會誤判成 compact。 */
  function issueCard(a, where) {
    var details = a.details || [];
    var bodyId = 'issue-body-' + s(a.id);
    /* 次要動作三態沿用 alertCard 同一套規則（spec §F4「處理狀態」），但一律放進
       展開後的「下一步」那一行、不掛在收合列：純圖示鈕在收合列讀不出意思
       （時鐘不等於暫緩、鎖頭不等於「只能在來源模組解決」），而且會跟「整列可以點開」
       這個唯一訊號搶注意力。
         阻斷型 → 一句說明（去處本來就是右邊那條 CTA）
         資訊型 → 暫緩（軟關，約 7 天後重新浮現）
         其餘   → 不放 */
    var extra = a.blocking
      ? '<span class="issue-card__note" data-i18n="issue.blocking">Can\u2019t be dismissed until resolved</span>'
      : (a.variant === 'info' && !a.snoozed)
      ? '<button class="btn btn--ghost btn--sm" type="button" data-snooze="' + s(a.id) + '" data-i18n="issue.snooze" title="Reappears in about 7 days">Snooze</button>'
      : '';
    var sevCls = 'issue-card__sev' + (ISSUE_SEV[a.variant] ? ' ' + ISSUE_SEV[a.variant] : '');
    /* compact 的標題改寫成「要做的事」（2026-08-31 使用者裁示，例：補交稅務表單）：
       這一格叫「待辦事項」，每一列就該讀成一件事情本身，而不是一句狀況描述
       （「提款已暫停 — 需補稅務表單」）。要做的事不是新編的文案——它就是這一則
       本來的 CTA 標籤，卡片與彈窗的按鈕上寫的是同一句。狀況、說明、受影響的項目
       全部收進點開後的彈窗，那裡才是要把事情看完的地方。
       完整版（儀表板）維持狀況標題：那裡是工作台，一次列五則以上，讀者要先判斷
       「發生了什麼」再決定要不要動手。 */
    var title = where && a.cta ? { k: a.ctaKey, t: a.cta } : { k: a.titleKey, t: a.title };
    return '<div class="issue-card' + (a.snoozed ? ' issue-card--snoozed' : '') + '">'
      + '<div class="issue-card__head">'
      /* compact 點開的是彈窗、不是就地展開，所以掛的是 `data-todo` 與
         `aria-haspopup`，不是 `aria-expanded`／`aria-controls`——這一格只有三則的
         高度，就地展開會把第三則推出畫面（一屏不捲的版型沒有多的高度可以長）。 */
      +   (where
            ? '<button class="issue-card__toggle" type="button" data-todo="' + s(a.id) + '" aria-haspopup="dialog">'
            : '<button class="issue-card__toggle" type="button" aria-expanded="false" aria-controls="' + bodyId + '">')
      /* compact（展示版左欄）換一套排法：前面的嚴重度色條改成模組 icon，
         標題與模組名疊成兩行（2026-08-31 使用者裁示）。色條在照片上是一個
         沒有形狀的紅點，讀不出「這是什麼」；icon 兩件事一起講——形狀說模組、
         顏色說嚴重度。完整版（儀表板）維持色條，那裡有群組標題在講模組。 */
      +     (where
            ? '<span class="issue-card__icon ' + sevCls + '" aria-hidden="true">'
              + '<i data-lucide="' + (ISSUE_SRC_ICON[a.src || 'other'] || 'flag') + '" class="ztor-icon"></i></span>'
            : '<span class="' + sevCls + '" aria-hidden="true"></span>')
      +     (where
            ? '<span class="issue-card__text">'
              + '<span class="issue-card__title"' + di18n(title.k) + '>' + s(title.t) + '</span>'
              + '<span class="issue-card__where"' + di18n(a.srcKey) + '>' + s(where) + '</span>'
              + '</span>'
            : '<span class="issue-card__title"' + di18n(title.k) + '>' + s(title.t) + '</span>')
      +     '<span class="issue-card__ago"' + di18n(a.agoKey) + '>' + s(a.ago) + '</span>'
      /* 箭頭方向跟著行為走（2026-08-31 使用者裁示「箭頭向右」）：向下＝就地往下
         展開，向右＝離開這一列去別的地方（這裡是彈窗）。方向指錯的話，第一次點
         下去發生的事就與畫面上的承諾不一樣。 */
      +     '<span class="issue-card__chev"><i data-lucide="' + (where ? 'chevron-right' : 'chevron-down') + '" class="ztor-icon ztor-icon--sm"></i></span>'
      +   '</button>'
      + '</div>'
      /* compact 不畫展開層：內容改由彈窗承擔，留在這裡就是一份永遠 hidden 的
         重複標記（同一批 id 還會與彈窗打架）。 */
      + (where ? '' :
          '<div class="issue-card__body" id="' + bodyId + '" hidden>'
          +   '<div class="issue-card__affected" data-i18n="issue.affected">Affected items</div>'
          +   '<div class="issue-card__details">' + details.map(function (d) { return issueDetail(d, a); }).join('') + '</div>'
          /* 卡底那一行只在真的有東西要說時才出現：動作已經下放到每個細項，
             這裡剩下的是「這一則不能暫緩」的說明或那顆暫緩鈕。 */
          +   (extra ? '<div class="issue-card__foot">' + extra + '</div>' : '')
          + '</div>')
      + '</div>';
  }

  /* ── 待辦事項彈窗（2026-08-31，只有展示版的 compact 面板用）─────────
     使用者裁示「點擊開啟 popup」。為什麼是彈窗不是就地展開：這一格固定住在
     一屏不捲的版型裡、高度只夠三則，就地展開會把第三則推出畫面；而展開後要看的
     東西（狀況說明、受影響的項目、每一項自己的動作）也不是三行放得下的。
     殼沿用全站的 `.payout-modal` / `.payout-dialog`（窄版）：這是站上既有的
     「在原地看完一件事」的浮層，不為這一頁另發明一種。
     內容全部來自這一則本來就有的欄位，沒有新編的產品事實。 */
  function todoDialog(a) {
    var where = ISSUE_SRC_LABEL[a.src || 'other'] || a.src || '';
    var extra = a.blocking
      ? '<span class="issue-card__note" data-i18n="issue.blocking">Can\u2019t be dismissed until resolved</span>'
      : (a.variant === 'info' && !a.snoozed)
      ? '<button class="btn btn--ghost btn--sm" type="button" data-snooze="' + s(a.id) + '" data-todo-close data-i18n="issue.snooze" title="Reappears in about 7 days">Snooze</button>'
      : '';
    var details = a.details || [];
    return '<div class="payout-modal" data-todo-modal hidden>'
      + '<section class="payout-dialog payout-dialog--narrow" role="dialog" aria-modal="true" aria-labelledby="todo-dialog-title">'
      +   '<div class="payout-dialog__head">'
      +     '<div>'
      /* 彈窗的標題是「發生了什麼」，不是卡片上那句「要做什麼」：卡片回答
         「我等一下要幹嘛」，彈窗回答「為什麼要幹這件事」。兩句都在、各就各位。 */
      +       '<h2 class="payout-dialog__title" id="todo-dialog-title"' + di18n(a.titleKey) + '>' + s(a.title) + '</h2>'
      +       '<span class="text-sub todo-dialog__where"' + di18n(a.srcKey) + '>' + s(where) + '</span>'
      +     '</div>'
      +     '<button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="sheet.close" data-todo-close>'
      +       '<i data-lucide="x" class="ztor-icon"></i></button>'
      +   '</div>'
      +   '<div class="payout-dialog__body">'
      +     '<p class="todo-dialog__desc"' + di18n(a.descKey) + '>' + (a.desc || '') + '</p>'
      +     (details.length
            ? '<div class="issue-card__affected" data-i18n="issue.affected">Affected items</div>'
              + '<div class="issue-card__details">' + details.map(function (d) { return issueDetail(d, a); }).join('') + '</div>'
            : '')
      +   '</div>'
      /* 底列不再放一顆主要動作（2026-08-31）：每一個受影響的項目自己就掛著同一個
         動作（見 `issueDetail`），底下再放一顆寫著同一句話的按鈕，是同一件事講兩次；
         只有一個細項時兩顆會上下相鄰，看起來像兩個不同的去處。底列只留「這一則
         不能暫緩」的說明或那顆暫緩鈕，沒有這兩者就整條不畫。 */
      +   (extra ? '<div class="payout-dialog__foot">' + extra + '</div>' : '')
      + '</section>'
      + '</div>';
  }

  function todoHost() {
    var host = document.getElementById('todo-dialog-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'todo-dialog-host';
      document.body.appendChild(host);
    }
    return host;
  }
  function closeTodo() {
    var host = document.getElementById('todo-dialog-host');
    if (host) host.innerHTML = '';
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-todo-close]')) { closeTodo(); return; }
    var opener = e.target.closest('[data-todo]');
    if (opener) {
      e.preventDefault();
      var id = opener.getAttribute('data-todo');
      var a = (DATA['dash-alerts'].items || []).filter(function (x) { return x.id === id; })[0];
      if (!a) return;
      var host = todoHost();
      host.innerHTML = todoDialog(a);
      var modal = host.firstChild;
      modal.hidden = false;
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
      if (window.applyI18n) window.applyI18n(host);
      document.body.style.overflow = 'hidden';
      /* 焦點交給關閉鈕：彈窗打開後不移焦點的話，下一次 Tab 會從底下那張卡繼續走，
         人在彈窗、焦點還在後面。 */
      var x = host.querySelector('[data-todo-close]');
      if (x) x.focus();
      return;
    }
    /* 點背景關閉：只認背板自己，點到對話框內部不算。 */
    if (e.target.hasAttribute && e.target.hasAttribute('data-todo-modal')) closeTodo();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.querySelector('[data-todo-modal]')) closeTodo();
  });

  /* ============================================================
     首頁展示版的大畫布（2026-08-31）：海報牆與 90 天時間軸兩個模式。
     資料一律取自既有的三個 store，這裡不生成任何產品事實——
       作品／項目 → ztorProjects.list()（有 poster 或 cover 的才進牆）
       商品       → ZTOR_PRODUCTS（products-store 匯出的那張表）
       活動       → ztorEvents.list()（帶 ISO date，時間軸靠它）
     ============================================================ */
  /* 2026-08-31 撤除（墓碑）：`canvasMode`（wall／timeline 兩個模式）、`CANVAS_DAYS`、
     `CANVAS_TIMELINE_MIN` 與下方的 `canvasDated()`／`canvasTimeline()`。使用者裁示
     「不需要未來 90 天了」，畫布只剩單一作品舞台一個模式；沒有第二個模式，模式
     切換器本身也就沒有理由存在。CSS 那半的墓碑在 canvas-stage.css。 */
  var canvasPick = 0;               // 右緣切換器選到第幾件

  function canvasZh() { return (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0; }

  /* 右緣切換器的清單＝**從最近的進行中，排到未來即將開始的**（2026-08-31 使用者裁示
     兩次：先是「接下來要進行哪些項目，用這些項目的視覺當背景」，再是「這裡從最近的
     進行中，排到未來即將開始的活動」）。

     一條時間線，近的在上：正在募資／預購的項目（剩幾天截止）、正在賣票或今天正在
     舉行的活動、還沒到上線日的項目、還在準備中的活動，全部換算成「距今幾天」之後
     排在一起。這一排同時是整屏底圖的來源，所以選到哪一件，地就是那一件的視覺。

     **天數怎麼來**：有日期的直接算（專案的 `releaseDate`、活動的 `date`）；募資與
     預購沒有截止日欄位，只有 store 自己寫好的那句「剩餘 20 天」「剩 9 天」，所以從
     那句話裡取數字——不在這裡另外編一個截止日。

     **同一天只留一件**：store 裡正在舉行（`live`）的活動日期一律是動態的今天
     （見 ASSUMPTIONS EVD-006），不擋的話這六格會全部被「今天」塞滿（實測）。
     同一天列兩次在這個位置也不增加資訊，其餘的在活動清單頁。

     **保底**：一件都排不出來時退回原本的作品清單——這一排空掉，整屏會連地都沒有。 */
  /* 從 store 寫好的那句話裡取「還剩幾天」。**只認倒數的句型**，不是抓到數字就算：
     預購的 `meta` 最後一段有時候寫的是別的事（實測撞到「審核已過，11/07 上映」，
     照抓數字會把 11 當成 11 天）。認不出來就回 null，那一列不進這一排。 */
  function canvasDaysIn(label) {
    if (!label) return null;
    var t = String(label);
    if (/今天|^\s*today\s*$/i.test(t)) return 0;
    var m = t.match(/(?:剩|剩餘|還有)\s*(\d+)\s*天/);
    if (m) return +m[1];
    m = t.match(/(\d+)\s*days?\s*(?:left|to go)/i) || t.match(/\bin\s*(\d+)\s*days?\b/i);
    return m ? +m[1] : null;
  }
  var CANVAS_EVENT_ON = { scheduled: 1, 'on-sale': 1, live: 1 };

  function canvasItems() {
    var zh = canvasZh(), out = [], all = [];
    var api = window.ztorProjects;
    if (api) {
      api.list().forEach(function (p) {
        var img = p.poster || p.cover;
        if (!img) return;
        var nm = api.nameLabel(p), lab = api.catLabel(p.cat);
        /* 小字寫的是**這一件現在在做什麼**（募資／預購／上線），不是它的分類
           （2026-08-31 使用者裁示「項目應該顯示募資、預購等，不是顯示類型」）：
           這一排是一條時間線，讀者要的是「這一件正在進行哪一步」；分類（其他商品、
           音樂專輯）在這個位置不幫忙做任何判斷。用的是第二屏那幾顆階段藥丸的同一組字。 */
        /* 募資與預購寫階段，上線那一種寫分類：倒數本身已經說了「12 天後**上線**」，
           小字再寫一次「上線」等於同一件事講兩次；而募資／預購的倒數只說「剩 9 天」，
           不寫階段就不知道那 9 天是在數什麼。
           （`CANVAS_STAGE` 的鍵是 `fund`／`preorder`／`golive`，而 store 的類型是
           `go-live` 帶連字號——這裡刻意只查前兩種，不必為那個連字號做對應。） */
        var stage = CANVAS_STAGE[p.type];
        var row = { kind: 'work', img: img, title: zh ? nm.zh : nm.en,
                    sub: stage ? stage[zh ? 'zh' : 'en'] : (zh ? lab.zh : lab.en),
                    go: 'project-detail.html?id=' + p.id };
        all.push(row);
        if (!CANVAS_PROJ_OPEN[p.status]) return;
        var n = null, when = '';
        if (p.type === 'go-live') {
          var d = api.releaseDate ? api.releaseDate(p) : '';
          n = canvasDaysCount(d);
          if (n != null && n >= 0) when = canvasDaysTo(d, 'release');
        } else if (p.type === 'fund' && p.fund && p.fund.left) {
          when = zh ? p.fund.left.zh : p.fund.left.en;      /* 「剩餘 20 天」 */
          n = canvasDaysIn(when);
        } else if (p.type === 'preorder' && p.meta) {
          var meta = zh ? p.meta.zh : p.meta.en;            /* 「62 / 100 筆預購 · 單價 $28 · 剩 9 天」 */
          when = String(meta).split('\u00b7').pop().trim();
          n = canvasDaysIn(when);
        }
        if (n == null || n < 0 || !when) return;
        out.push({ kind: row.kind, img: row.img, title: row.title, sub: row.sub,
                   go: row.go, n: n, when: when });
      });
    }
    var ev = window.ztorEvents;
    if (ev) {
      ev.list().forEach(function (e) {
        var img = e.images && e.images.keyvisual;
        if (!img) return;
        /* 活動同樣寫階段（售票中／進行中／準備中），不寫「活動」——「活動」是分類，
           而這一排上的每一件都需要回答「現在到哪一步」。 */
        var row = { kind: 'event', img: img, title: e.name,
                    sub: CANVAS_EVENT_STAGE[e.status] ? CANVAS_EVENT_STAGE[e.status][zh ? 'zh' : 'en']
                                                      : (zh ? '活動' : 'Event'),
                    go: 'event-detail.html?id=' + e.id };
        all.push(row);
        if (!CANVAS_EVENT_ON[e.status]) return;
        var n = canvasDaysCount(e.date);
        if (n == null || n < 0) return;
        row.n = n;
        row.when = canvasDaysTo(e.date);
        out.push(row);
      });
    }
    out.sort(function (a, b) { return a.n - b.n; });
    var seen = {}, one = [];
    out.forEach(function (r) {
      if (seen[r.n]) return;
      seen[r.n] = 1;
      one.push(r);
    });
    return one.length ? one : all;
  }

  /* 舞台上浮的標記位置：畫面座標，不是資料。原型沒有「這件事發生在圖上的哪裡」
     這種空間資訊（參考版型有，因為它的圖是一棟真的樓）。這裡取兩個固定的落點，
     讓標記穩定地站在圖的中段與右下，而不是每次重畫都跳到別處。 */
  var CANVAS_SPOTS = [{ x: 46, y: 42 }, { x: 68, y: 66 }];

  /* 當前這一件的浮標：先放需要處理的（來自待處理事項），再補這件作品自己的事實
     （進度或上線日）。最多兩個——參考版型也只掛兩個，第三個開始就從「指出重點」
     變成「蓋住畫面」。 */
  function canvasMarkers(it) {
    var zh = canvasZh(), out = [];
    (DATA['dash-alerts'].items || []).forEach(function (a) {
      if (a.snoozed || out.length) return;
      var names = (a.details || []).map(function (d) {
        return [d.name, (d.nameKey && typeof window.i18nT === 'function') ? window.i18nT(d.nameKey) : ''];
      });
      var hit = names.some(function (pair) {
        return pair.some(function (n) { return n && String(n).trim() === String(it.title).trim(); });
      });
      if (!hit) return;
      out.push({ tone: a.variant === 'error' ? 'alert' : 'warning', icon: 'alert-triangle',
                 top: zh ? '待處理' : 'Needs action', main: a.title, mainKey: a.titleKey,
                 go: a.ctaHref });
    });
    /* 只留「需要被處理」的那一種（2026-08-31 使用者裁示拿掉中性的事實浮標）：
       參考版型上浮著的兩顆膠囊都是異常，它們之所以值得蓋住畫面，是因為看到就要動。
       上線日、進度那類事實在右下角的說明與左欄都講過了，浮在圖上只是重複一次。 */
    return out.slice(0, 2);
  }

  /* 展示版左欄第一格的兩張：一個總數＋它的組成（見 ds-components/split-bar.css）。
     兩份組成都取自站上既有的資料，不是為這一格新編的：
       收入分布 → earnings-overview.html「收入來源分布」那九項的百分比
       等級分布 → DATA['dash-insight'].fans.tiers 的四級
     收入只取前四大＋「其他」：九列在一條 300px 的欄裡會把這一格撐成半個畫面，
     而讀者在這個位置要的是「錢主要從哪來」，不是完整帳表。 */
  var CANVAS_REV_SPLIT = [
    { key: 'src.eshop',      en: 'E-Shop sales',          pct: 28, color: 'var(--chart-1)' },
    { key: 'src.cocreate',   en: 'Co-creation funding',   pct: 20, color: 'var(--chart-2)' },
    { key: 'src.events',     en: 'Event tickets',         pct: 14, color: 'var(--chart-4)' },
    { key: 'src.commission', en: 'Tastemaker commission', pct: 11, color: 'var(--chart-5)' },
    /* 「其他」＝剩下五項（OTT 版稅、IP 版稅、串流、授權、項目支持）的合計 27%，
       沿用既有的 `src.other` 譯詞（項目支持 · 其他），不新造一個同義的鍵。 */
    { key: 'src.other',      en: 'Project support · other', pct: 27, color: 'var(--muted-foreground)' }
  ];
  var TIER_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-5)'];

  function splitBar(rows) {
    return '<div class="split-bar">'
      + '<div class="split-bar__track" aria-hidden="true">'
      +   rows.map(function (r) {
            return '<span class="split-bar__seg" style="flex:' + r.pct + ';background:' + r.color + '"></span>';
          }).join('')
      + '</div>'
      + '<div class="split-bar__legend">'
      +   rows.map(function (r) {
            return '<div class="split-bar__row">'
              + '<span class="split-bar__dot" style="color:' + r.color + '"></span>'
              + '<span class="split-bar__label"' + di18n(r.key) + '>' + s(r.label || r.en) + '</span>'
              + '<span class="split-bar__pct">' + r.pct + '%</span>'
              + '</div>';
          }).join('')
      + '</div></div>';
  }

  /* 一張分布卡：標題（右邊掛切換用的箭頭）＋總數與漲跌＋分段條與圖例。 */
  /* 圓環（`.donut-mix`，2026-08-31 使用者提供參考圖裁示「fan mix 換成這種圓環圖」）。
     幾何全部在這裡算，CSS 只負責顏色與粗細：
       半徑 52、線寬 12 → 外徑 116（環心的洞 80px，裝得下 24px 的總數與一行單位）
       每一段的弧長 = 周長 × 百分比，再扣掉「縫」與圓端多畫出來的半個線寬
       起點從十二點鐘（SVG 的 0° 在三點鐘，所以整個 svg 轉 -90°）
     縫要扣兩次半個線寬：`stroke-linecap: round` 會讓每一端各多出半個線寬，
     不扣的話段與段會黏在一起、縫等於沒有（實測 12px 線寬吃掉 12px 的縫）。 */
  function donutMix(rows, total, unitKey, unitText) {
    /* W 是描邊寬度，必須與 donut-mix.css 的 `--donut-mix-thickness` 同一個數字：
       段與段之間的縫要扣掉一整個描邊寬（圓端各吃半個），對不上就會看到縫忽寬忽窄。
       12 → 9（2026-08-31 使用者裁示「環大一點、線窄一點」）。 */
    var R = 52, W = 9, GAP = 8, C = 2 * Math.PI * R, off = 0;
    var segs = rows.map(function (r) {
      var len = C * (r.pct || 0) / 100;
      var draw = Math.max(len - GAP - W, 1);       // 扣縫與兩個圓端
      var el = '<circle class="donut-mix__seg" cx="60" cy="60" r="' + R + '"'
        + ' style="--seg:' + (r.color || 'var(--chart-1)') + '"'
        + ' stroke-dasharray="' + draw.toFixed(2) + ' ' + (C - draw).toFixed(2) + '"'
        + ' stroke-dashoffset="' + (-(off + (GAP + W) / 2)).toFixed(2) + '"></circle>';
      off += len;
      return el;
    }).join('');
    return '<div class="donut-mix">'
      + '<div class="donut-mix__ringwrap">'
      +   '<svg class="donut-mix__ring" viewBox="0 0 120 120" aria-hidden="true">'
      +     '<circle class="donut-mix__track" cx="60" cy="60" r="' + R + '"></circle>'
      +     segs
      +   '</svg>'
      +   '<div class="donut-mix__center">'
      +     '<span class="donut-mix__value">' + s(total) + '</span>'
      +     (unitText ? '<span class="donut-mix__unit"' + di18n(unitKey) + '>' + s(unitText) + '</span>' : '')
      +   '</div>'
      + '</div>'
      /* 圖例借 split-bar 的列：同一份資料的圖例沒有理由有兩套寫法。 */
      + '<div class="donut-mix__legend"><div class="split-bar__legend">'
      +   rows.map(function (r) {
            return '<div class="split-bar__row" style="color:' + (r.color || 'var(--chart-1)') + '">'
              + '<span class="split-bar__dot"></span>'
              + '<span class="split-bar__label"' + di18n(r.key) + '>' + s(r.label || r.en || '') + '</span>'
              + '<span class="split-bar__pct">' + (r.pct || 0) + '%</span>'
              + '</div>';
          }).join('')
      + '</div></div>'
      + '</div>';
  }

  function distributionBlock(d, withSwitch) {
    return '<section class="distribution">'
      + '<div class="distribution__head">'
      +   '<h2 class="distribution__title"' + di18n(d.titleKey) + '>' + s(d.title) + '</h2>'
      /* 左右兩顆（2026-08-31 使用者裁示）：一顆箭頭只能往前，走過頭就得繞一圈
         才回得來；兩顆之後前後對稱，讀者不必記得自己現在在第幾張。 */
      +   (withSwitch
            ? '<span class="canvas-nav">'
              + '<button type="button" class="canvas-step" data-kpi-nav="prev"'
              +   ' aria-label="Previous" data-i18n-aria-label="btn.prev">'
              +   '<i data-lucide="chevron-left" class="ztor-icon" aria-hidden="true"></i></button>'
              + '<button type="button" class="canvas-step" data-kpi-nav="next"'
              +   ' aria-label="Next" data-i18n-aria-label="btn.next">'
              +   '<i data-lucide="chevron-right" class="ztor-icon" aria-hidden="true"></i></button>'
              + '</span>'
            : '')
      + '</div>'
      /* 三種身體，由 `d.mode` 決定（2026-08-31 使用者裁示兩張各換一種圖）：
           'curve'  大數字 ＋ 走勢曲線（收入：它問的是「最近往上還往下」）
           'donut'  圓環，總數收進環心（粉絲：它問的是「這群人由誰組成」）
           其餘     大數字 ＋ 分段條（原本的 split-bar，其他消費情境仍可用）
         為什麼兩張不同型：兩張講的本來就是兩件事，硬要同一種畫法，其中一張一定
         在遷就。輪播的高度取最高的那一張，兩型並存不會讓外框跳動。 */
      + (d.mode === 'donut'
          ? donutMix(d.rows || [], d.value, d.unitKey, d.unit)
          : '<div class="distribution__value-row">'
            + '<span class="distribution__value">' + s(d.value) + '</span>'
            + (d.delta ? '<span class="distribution__delta">' + s(d.delta) + '</span>' : '')
            + '</div>'
            + (d.mode === 'curve'
                /* 幾條線各是誰：三個小色鍵一排，不用完整圖例（那要三行，這一格
                   沒有那個高度）。主線的鍵吃中性墨色，與圖上一致。
                   **色鍵排在曲線上方、靠右**（2026-08-31 使用者裁示）：它是讀圖的
                   前提，先看到才知道等一下的三條線各是誰；排在圖下面時，讀者是
                   看完圖再回頭找對照。靠右則是為了讓它與左邊的大數字分工——
                   同一行的兩端，一邊是答案、一邊是圖例。 */
                ? '<div class="distribution__keys">'
                  +   '<span class="distribution__key distribution__key--ink"'
                  +     di18n('canvas.trend.total') + '>Total</span>'
                  +   ((d.spark && d.spark.extra) || []).map(function (ex) {
                        return '<span class="distribution__key" style="--key:' + ex.color + '"'
                          + di18n(ex.key) + '>' + s(ex.en) + '</span>';
                      }).join('')
                  + '</div>'
                  + '<div class="distribution__curve">' + sparkBlock(d.spark) + '</div>'
                : splitBar(d.rows || [])))
      + '</section>';
  }

  /* 舞台拆成兩層（2026-08-31 使用者裁示「這些是一個區塊，所以間距要重新調整」）：
       canvas-stage    底圖與壓底，`fixed` 鋪滿整個視窗
       canvas-overlay  模式切換／作品切換器／說明／浮標，貼齊**內容區**的四邊
     兩者不能混在一起：底圖要滿到視窗邊（不然就不是「地」），但浮層要跟左欄同一個
     框——貼視窗邊的話，右邊那幾個控制會比左欄多凸出頁面內距那一段，四個角對不齊。
     兩層共用同一組狀態，所以點擊要同時重畫（見檔尾的委派監聽）。 */
  function canvasCurrent() {
    var items = canvasItems();
    if (!items.length) return null;
    var picks = items.slice(0, 6);
    if (canvasPick >= picks.length) canvasPick = 0;
    return { picks: picks, cur: picks[canvasPick] };
  }

  function canvasStage(d) {
    var st = canvasCurrent();
    if (!st) {
      return '<div class="canvas-stage"><div class="canvas-stage__empty">'
        + '<div class="canvas-stage__empty-title"' + di18n('canvas.empty.title') + '>Nothing published yet</div>'
        + '<div class="canvas-stage__empty-text"' + di18n('canvas.empty.text') + '>Your works, merch and events appear here as soon as the first one goes live.</div>'
        + '</div></div>';
    }
    /* 兩張同一張圖：底下那張放大模糊當底色（左半才不會是一片純黑），
       上面那張清晰、靠右、左緣用遮罩溶進底層。 */
    return '<div class="canvas-stage">'
      + '<img class="canvas-stage__bg" src="' + s(st.cur.img) + '" alt="" aria-hidden="true">'
      + '<img class="canvas-stage__img" src="' + s(st.cur.img) + '" alt="">'
      + '<span class="canvas-stage__scrim" aria-hidden="true"></span>'
      + '</div>';
  }

  function canvasOverlay() {
    var st = canvasCurrent();
    if (!st) return '';
    var picks = st.picks, cur = st.cur;

    var overlay = canvasMarkers(cur).map(function (m, i) {
        var spot = CANVAS_SPOTS[i] || CANVAS_SPOTS[0];
        var tone = m.tone ? ' canvas-stage__marker--' + m.tone : '';
        var open = m.go ? '<a class="canvas-stage__marker' + tone + '" href="' + s(m.go) + '"' : '<div class="canvas-stage__marker' + tone + '"';
        return open + ' style="left:' + spot.x + '%;top:' + spot.y + '%">'
          + '<span class="canvas-stage__pill">'
          +   '<span class="canvas-stage__icon"><i data-lucide="' + s(m.icon) + '" class="ztor-icon"></i></span>'
          +   '<span class="canvas-stage__label">'
          +     '<span class="canvas-stage__label-top">' + s(m.top) + '</span>'
          +     '<span class="canvas-stage__label-main"' + (m.mainKey ? di18n(m.mainKey) : '') + '>' + s(m.main) + '</span>'
          +   '</span>'
          + '</span>'
          + '<span class="canvas-stage__stem" aria-hidden="true"></span>'
          + '<span class="canvas-stage__dot" aria-hidden="true"></span>'
          + (m.go ? '</a>' : '</div>');
      }).join('');
    /* 2026-08-31 撤除（墓碑）：右下角的作品說明 `.canvas-stage__caption`
       （`__kind`／`__title`／`__go`）。使用者裁示移除，它的工作整份搬進右緣的
       切換器——當前這一項現在自己就長成那個樣子（類型小字＋放大的名稱＋前往箭頭），
       同一件事沒有理由在畫面上寫兩次。 */

    /* 切換器的每一列：切換鈕（類型＋名稱）＋ 前往的箭頭。
       兩個目標而不是一個：名稱那一段是「換底圖看這一件」，箭頭是「進到這一件」，
       兩件事不同——把它們併成同一個點擊目標，就得有一個要被犧牲。
       名稱那一段吃掉整列扣掉箭頭的寬度，所以主要動作仍然是一整行可點的。 */
    return overlay;
  }

  /* 切換器獨立成一個渲染器（2026-08-31）：它與頂列要**一起**釘住、一起被第二段推走
     （使用者裁示「他們應該同步往上滑不見」）。sticky 的元素是被自己容器的下緣推走的，
     而推走的時機取決於元素自己的高度——切換器 250px、頂列 46px，同一個容器裡兩者
     一定不同步（實測捲到 860 時頂列還在 4、切換器已經到 -139）。
     解法是把兩者放進**同一個 sticky 容器**（`.canvas-hero__chrome`），整塊一起走；
     那個容器住在頂列那一層，所以切換器得從浮層裡搬出來、自成一個渲染器。 */
  function canvasPicks() {
    var st = canvasCurrent();
    if (!st) return '';
    var picks = st.picks;
    /* 這一排上面掛一行標題（2026-08-31 使用者裁示「上面加一個標題 項目與活動」）：
       它現在是第一屏的第三格，與左欄那兩格一樣需要一個名字——沒有名字時，六行
       靠右的字讀起來像浮在圖上的裝飾，而不是一份清單。 */
    var rail = '<div class="canvas-stage__rail" role="group">'
      + '<p class="canvas-stage__rail-title"' + di18n('canvas.picks.title') + '>Coming up</p>'
      + picks.map(function (it, i) {
          return '<div class="canvas-stage__pick' + (i === canvasPick ? ' canvas-stage__pick--active' : '') + '">'
            + '<button type="button" class="canvas-stage__pick-main"'
            +   ' data-canvas-pick="' + i + '" title="' + s(it.title) + '">'
            /* 類型後面接倒數（2026-08-31）：這一排現在回答「接下來要進行哪些」，
               而「哪些」與「什麼時候」是同一個問題的兩半。接在同一行、不另起一行——
               另起一行會把展開的那一列撐成三行，前往的箭頭就對不到名稱那一行了。 */
            +   '<span class="canvas-stage__pick-kind">' + s(it.sub)
            +     (it.when ? ' \u00b7 ' + s(it.when) : '') + '</span>'
            +   '<span class="canvas-stage__pick-name">' + s(it.title) + '</span>'
            + '</button>'
            /* 「前往 →」包成一組、掛在玻璃面外面（2026-08-31 使用者裁示「前往和箭頭
               會凸出來」＋「兩者水平置中對齊」）：動詞緊鄰它要作用的那個箭頭，
               讀起來是一句話；包成一組之後兩者由同一個 flex 置中，不必各自對齊。
               搬到面外還讓名稱的右緣可以直接抵著玻璃面的右內距——那條線現在與頂列
               的時間切齊（見 canvas-stage.css）。 */
            + '<span class="canvas-stage__pick-cta">'
            +   '<span class="canvas-stage__pick-lead"' + di18n('canvas.open') + '>Open</span>'
            +   '<a class="canvas-stage__pick-go" href="' + s(it.go) + '"'
            +     ' aria-label="Open" data-i18n-aria-label="canvas.open">'
            +     '<i data-lucide="chevron-right" class="ztor-icon" aria-hidden="true"></i></a>'
            + '</span>'
            + '</div>';
        }).join('')
      + '</div>';
    return rail;
  }

  function issuePanel(d) {
    var items = sortByUrgency(d.items);
    /* 分組：保留「第一次出現的順序」＝已排好的 urgency 順序，所以組序天然是
       「最急那一則所屬的模組排最前」，不必再另外算一次分數。 */
    var order = [], byGroup = {};
    items.forEach(function (a) {
      var k = a.src || 'other';
      if (!byGroup[k]) { byGroup[k] = []; order.push(k); }
      byGroup[k].push(a);
    });
    /* 面板總數只算「還需要處理的」（排除已軟關）——
       它必須跟 F2 那顆「待處理事項」KPI 對得起來：兩邊掛的是同一個標題，
       一個說 4 一個說 5 的話，讀者只能猜哪一個在騙人。已軟關的卡照樣渲染、
       只是降階並沉到組底：它當下不需要處理，但仍要看得到（spec 5.1.1 §F4）。 */
    function isLive(a) { return !a.snoozed; }
    var groups = order.map(function (k) {
      var list = byGroup[k];
      var icon = ISSUE_SRC_ICON[k] || 'flag';
      return '<section class="issue-group">'
        + '<div class="issue-group__head">'
        +   '<span class="issue-group__icon"><i data-lucide="' + icon + '" class="ztor-icon"></i></span>'
        +   '<span class="issue-group__label"' + di18n(list[0].srcKey) + '>' + s(ISSUE_SRC_LABEL[k] || k) + '</span>'
        + '</div>'
        + '<div class="issue-group__list">' + list.map(function (a) { return issueCard(a); }).join('') + '</div>'
        + '</section>';
    }).join('');
    var n = items.filter(isLive).length;
    /* compact＝展示版左欄那一格（見 issue-panel.css 的 --compact 段）：不分組、
       只出前 d.limit 則、模組名掛在標題下方。 */
    if (d.compact) {
      var cap = d.limit === 0 ? items.length : (d.limit || 3);
      var shown = items.filter(isLive).slice(0, cap);
      var cards = shown.map(function (a) {
        return issueCard(a, ISSUE_SRC_LABEL[a.src || 'other'] || a.src || '');
      }).join('');
      /* compact 的標題只有名稱、不帶筆數（2026-08-31 使用者裁示改成「待辦事項」）：
         這一格固定出三則，標題不宣稱總數就沒有「說了 5 卻只看得到 3」的問題。
         完整版（儀表板）仍寫「N 件待辦事項」，那裡列的就是全部。 */
      /* 2026-08-31 撤除（墓碑）：這一列的 `.issue-panel__more`（查看更多），
         使用者裁示移除。取捨要知道：畫面上只出三則，現在沒有一條路通往其餘的。
         之所以還過得去，是同日稍早標題已經拿掉筆數（只寫「待辦事項」）——標題沒有
         宣稱有五則，就沒有「說了 5 卻只給看 3」的問題。 */
      return '<div class="issue-panel__head">'
        + '<button class="issue-panel__toggle" type="button" aria-expanded="true" aria-controls="issue-panel-groups">'
        +   '<span class="issue-panel__title" data-i18n="ops.todo">To-do</span>'
        + '</button>'
        + '</div>'
        + '<div class="issue-panel__groups" id="issue-panel-groups">'
        +   '<section class="issue-group"><div class="issue-group__list">' + cards + '</div></section>'
        + '</div>'
        /* 「查看更多」收成標題旁的 > 圖示（2026-08-31 使用者裁示，與進行中那一區同一套）。
           它掛在標題列裡、不在清單底下——底下那個位置每次筆數變動就會跟著上下跑。 */
        + '';
    }
    return '<div class="issue-panel__head">'
      + '<button class="issue-panel__toggle" type="button" aria-expanded="true" aria-controls="issue-panel-groups">'
      /* 筆數寫進標題本身而不是旁邊掛一顆徽章（2026-08-31 使用者裁示「直接寫成
         5 件待處理事項」）：徽章要讀者自己把數字與標題連起來，寫成一句就不用連。
         數字單獨一個 span、名詞走 i18n——中文的量詞「件」黏在名詞那半，英文則
         靠單複數兩個鍵，兩邊各自照自己的語法走，不做「數字＋固定字串」的硬拼。 */
      +   '<span class="issue-panel__title">'
      +     '<span class="issue-panel__n">' + n + '</span> '
      +     '<span data-i18n="' + (n === 1 ? 'ops.pending-one' : 'ops.pending-n') + '">'
      +     (n === 1 ? 'pending action' : 'pending actions') + '</span>'
      +   '</span>'
      +   '<span class="issue-panel__chev"><i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm"></i></span>'
      + '</button>'
      + '</div>'
      + '<div class="issue-panel__groups" id="issue-panel-groups">' + groups + '</div>';
  }

  // F5 — recent activity row: icon · name · type·source·time · status badge.
  function activityRow(r) {
    var iconCls = 'data-list__icon' + (r.iconVariant ? ' data-list__icon--' + r.iconVariant : '');
    return '<div class="data-list__row">'
      + '<div class="data-list__row-main">'
      +   '<div class="' + iconCls + '"><i data-lucide="' + r.icon + '" class="ztor-icon"></i></div>'
      +   '<div class="data-list__body">'
      +     '<div class="data-list__title"' + di18n(r.titleKey) + '>' + s(r.title) + '</div>'
      +     '<div class="data-list__meta"' + di18n(r.metaKey) + '>' + s(r.meta) + '</div>'
      +   '</div>'
      + '</div>'
      + badge(r.status)
      + '</div>';
  }

  // F6 — recent events & projects row: icon · name · type·source·progress · status badge + source-aware entry.
  function eventProjectRow(r) {
    return '<div class="data-list__row">'
      + '<div class="data-list__row-main">'
      +   '<div class="data-list__icon"><i data-lucide="' + r.icon + '" class="ztor-icon"></i></div>'
      +   '<div class="data-list__body">'
      +     '<div class="data-list__title"' + di18n(r.titleKey) + '>' + s(r.title) + '</div>'
      +     '<div class="data-list__meta"' + di18n(r.metaKey) + '>' + s(r.meta) + '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="data-list__end data-list__end--row">'
      +   badge(r.status)
      /* r.cta = labelled action button instead of the bare chevron — used by the
         F2 Active-projects popup where every row must state its next step. */
      +   (r.cta
            ? '<a class="btn btn--outline btn--sm" href="' + r.go + '"' + di18n(r.cta.key) + '>' + s(r.cta.text) + '</a>'
            : '<a class="data-list__go" href="' + r.go + '" aria-label="Open"><i data-lucide="chevron-right" class="ztor-icon"></i></a>')
      + '</div>'
      + '</div>';
  }

  // F8 — external data-status row: brand chip · platform · type·sync / impact · status badge + optional Settings CTA.
  function extRow(r) {
    var L = r.logo || {};
    var style = 'font-weight: var(--fw-regular);font-size:' + (L.fs || 'var(--fs-13)') + ';';
    if (L.bg) style += 'background:' + L.bg + ';';
    if (L.fg) style += 'color:' + L.fg + ';';
    var cta = r.cta ? '<a class="card__link" href="' + r.cta.href + '"' + di18n(r.cta.key) + '>' + s(r.cta.text) + '</a>' : '';
    return '<div class="data-list__row">'
      + '<div class="data-list__row-main">'
      +   '<span class="data-list__icon" style="' + style + '">' + s(L.t) + '</span>'
      +   '<div class="data-list__body">'
      +     '<div class="data-list__title">' + s(r.title) + '</div>'
      +     '<div class="data-list__meta"' + di18n(r.typeKey) + '>' + s(r.type) + '</div>'
      +     '<div class="data-list__meta"' + di18n(r.impactKey) + '>' + s(r.impact) + '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="data-list__end">' + badge(r.status) + cta + '</div>'
      + '</div>';
  }

  // F7 — fan-relations | audience-trends insight split (one block, two labelled columns).
  function insightSplit(d) {
    var f = d.fans, a = d.audience;
    var tiers = (f.tiers || []).map(function (t) {
      return '<div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center">'
        + '<span' + di18n(t.key) + '>' + s(t.label) + '</span>'
        + '<span class="text-sub">' + s(t.pct) + '</span>'
        + '<span style="font-weight: var(--fw-regular)">' + s(t.rev) + '</span></div>';
    }).join('');
    var plats = (a.platforms || []).map(function (p) {
      var val = p.muted
        ? '<span class="text-sub"' + di18n(p.valKey) + '>' + s(p.val) + '</span>'
        : '<span style="font-weight: var(--fw-regular)">' + s(p.val) + '</span>';
      return '<div style="display:grid;grid-template-columns:1fr auto;gap:8px"><span>' + s(p.name) + '</span>' + val + '</div>';
    }).join('');
    var fansCol = '<div class="insight-split__col">'
      + '<div class="insight-eyebrow"><span' + di18n(f.eyebrowKey) + '>' + s(f.eyebrow) + '</span>'
      +   '<span class="insight-eyebrow__src"' + di18n(f.syncKey) + '>' + s(f.sync) + '</span></div>'
      + '<div class="kpi__value" style="margin-bottom:4px">' + s(f.value) + '</div>'
      + '<div class="text-sub" style="font-size: var(--fs-12);margin-bottom:14px"' + di18n(f.subKey) + '>' + s(f.sub) + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;font-family:var(--font-ui);font-size: var(--fs-12)">' + tiers + '</div>'
      + '<div class="mt-16"><a class="card__link" href="' + f.linkHref + '"' + di18n(f.linkKey) + '>' + s(f.link) + '</a></div>'
      + '</div>';
    /* Risk toast（2026-07-28 L 裁示）：原本欄中段的 info-banner 改成卡底、跨兩欄的
       actionable toast——同 fans-crm 頁自己的 #fans-risk-alert 視覺（alert--banner
       alert--error），整條可點（data-go，同 alert 卡的整卡可點手勢），落地直接
       開啟訊息 composer、收件對象預選「At risk (5)」（fans-crm ?msg=risk）。 */
    var toast = f.risk
      ? '<div class="alert alert--banner alert--error insight-split__toast" data-go="' + f.risk.href + '" role="link" tabindex="0">'
        + '<div class="alert__icon">!</div>'
        + '<div class="alert__body">'
        +   '<div class="alert__title"' + di18n(f.risk.titleKey) + '>' + s(f.risk.title) + '</div>'
        +   '<div class="alert__meta"' + di18n(f.risk.metaKey) + '>' + s(f.risk.meta) + '</div>'
        + '</div>'
        + '<span class="alert__cta"' + di18n(f.risk.ctaKey) + '>' + s(f.risk.cta) + '</span>'
        + '</div>'
      : '';
    var audCol = '<div class="insight-split__col">'
      + '<div class="insight-eyebrow"><span' + di18n(a.eyebrowKey) + '>' + s(a.eyebrow) + '</span>'
      +   '<span class="insight-eyebrow__src"' + di18n(a.syncKey) + '>' + s(a.sync) + '</span></div>'
      + '<div class="kpi__value" style="margin-bottom:4px">' + s(a.value) + '</div>'
      + '<div class="text-sub" style="font-size: var(--fs-12);margin-bottom:14px"' + di18n(a.leadKey) + '>' + s(a.lead) + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:10px;font-family:var(--font-ui);font-size: var(--fs-13)">' + plats + '</div>'
      + '<div class="text-sub" style="font-size: var(--fs-11);margin-top:14px"><span' + di18n(a.noteKey) + '>' + s(a.note) + '</span> '
      +   '<a class="card__link" href="' + a.fixHref + '"' + di18n(a.fixKey) + '>' + s(a.fix) + '</a></div>'
      + (a.linkHref ? '<div class="mt-16"><a class="card__link" href="' + a.linkHref + '"' + di18n(a.linkKey) + '>' + s(a.link) + '</a></div>' : '')
      + '</div>';
    return fansCol + audCol + toast;
  }

  /* ── F4 urgency 排序（spec 5.1.1 §F4）─────────────────────────────────
     規格：阻斷 > 即將到期（≤7 天）> 待審 > 待確認付款 > 低庫存 > 資訊，
     阻斷恆為最高；權重數值為可調參數、留實作層。此前是資料陣列的寫死順序，
     阻斷型那筆實際排在第 4（2026-08-19 稽核發現）。
     已軟關（snoozed）的一律沉到最後——它當下不需要處理，但仍要看得到。 */
  var URGENCY = { blocking: 100, expiring: 80, review: 60, payment: 50, lowstock: 40, info: 10 };
  function urgencyScore(a) {
    if (a.blocking) return URGENCY.blocking;              // 阻斷恆為最高，不受 kind 影響
    return URGENCY[a.kind] != null ? URGENCY[a.kind] : URGENCY.info;
  }
  function sortByUrgency(items) {
    return (items || []).slice().sort(function (x, y) {
      if (!!x.snoozed !== !!y.snoozed) return x.snoozed ? 1 : -1;   // 已軟關的沉底
      return urgencyScore(y) - urgencyScore(x);                     // 穩定排序：同分維持原序
    });
  }
  /* 首頁摘要最多 5 筆（spec §F4）。此前沒有程式化上限，資料一多就整串渲染。
     完整清單走「查看全部」的完整待辦視圖。 */
  var F4_SUMMARY_MAX = 5;

  /* 只有數字是白的，其餘的字（幣別符號、「還有」「天」「張票」這類單位詞）降成
     灰的小字（2026-08-31 使用者裁示）。一列裡真正要被讀到的是那個數字，單位是
     讀懂它需要的最少的字——同樣大小同樣白的話，「還有 12 天」四個字裡有三個
     在跟那個 12 搶。
     整串完全沒有數字時（「尚未排期」「今天」）原樣輸出：那時候那句話就是答案，
     把它整句降階會讓這一列沒有主詞。 */
  /* `base` 是類別字首（2026-08-31 加）：同一套「數字白、單位灰」的切法有兩個消費者
     ——左欄的 `.work-row` 與第二屏的 `.live-card`，各自的單位樣式住在自己的元件檔裡。 */
  function workValue(v, base) {
    var pre = base || 'work-row';
    var str = String(v || '');
    if (!/[0-9]/.test(str)) return s(str);
    var parts = str.split(/([0-9][0-9.,]*)/);
    return parts.map(function (part, i) {
      if (!part) return '';
      if (/^[0-9]/.test(part)) return s(part);
      /* 單位詞與數字之間要有一點空（2026-08-31 使用者裁示「增加 $ 與金額的間距」）：
         有些單位自己帶空白（「還有 」「 天」），有些沒有（幣別符號緊貼數字）。
         只有「沒帶空白、又緊鄰數字」的那一種才補外距，否則帶空白的那幾個會變成
         兩倍寬。判斷靠相鄰的那一段是不是數字，不靠字面猜是哪個幣別。 */
      var cls = pre + '__unit';
      if (!/\s$/.test(part) && /^[0-9]/.test(parts[i + 1] || '')) cls += ' ' + pre + '__unit--pre';
      if (!/^\s/.test(part) && /[0-9]$/.test(parts[i - 1] || '')) cls += ' ' + pre + '__unit--post';
      return '<span class="' + cls + '">' + s(part) + '</span>';
    }).join('');
  }

  var RENDERERS = {
    'transaction-list': function (d) {
      var hide = d.hideStatus;
      if (d.table) return tableWrap(
        th('dash.col.item', 'Item', ' class="ztor-table__media-head"') + th('dash.col.time', 'Time')
        + th('dash.col.amount', 'Amount', ' style="text-align:right"') + (hide ? '' : th('dash.col.status', 'Status')),
        (d.rows || []).map(function (r) { return txTableRow(r, hide); }).join(''), TRUNCATE);
      return '<div class="data-list">' + (d.rows || []).map(function (r) { return txRow(r, hide); }).join('') + '</div>';
    },
    /* F3 第一屏版（2026-08-28）：逐筆成框，一次只露 d.limit 筆，其餘靠 d.offset 輪替。
       視窗是環狀的（取模），所以 8 筆資料可以無限輪下去而不會走到盡頭；
       只有 d.entering 為真（＝這次重畫是計時器觸發的）時，頂端那一框才帶進場 class。 */
    'earnings-feed':    function (d) {
      var rows = d.rows || [];
      var n = rows.length;
      if (!n) return '<div class="earnings-feed"></div>';
      var cap = Math.min(d.limit || n, n);
      var off = ((d.offset || 0) % n + n) % n;
      var out = '';
      for (var i = 0; i < cap; i++) {
        out += earningsFeedItem(rows[(off + i) % n], i === 0 && !!d.entering, d.stamps);
      }
      return '<div class="earnings-feed">' + out + '</div>';
    },
    'ops-summary':      function (d) { return (d.tiles || []).map(kpiTile).join(''); },
    /* 展示版左欄第一格：兩張 KPI 輪流講（見 ds-components/kpi-rotator.css）。
       所有張都渲染出來、只有一張帶 --active——只渲染當前那一張的話，換張時
       高度會先塌到 0 再撐回來，整欄跟著跳。 */
    'kpi-rotator':      function (d) {
      var slides = d.slides || [], i = d.index || 0;
      if (!slides.length) return '';
      /* 進度點退場、改成標題右邊一顆可點的箭頭（2026-08-31 使用者裁示）：
         點是純指示、告訴你有幾張；箭頭同時讓你自己往下一張。與其他兩區的
         「查看更多」用同一個字形，但那兩顆是導航、這顆是切換——差別在於
         它不離開這一頁，所以擺在標題內、不在區塊的右上外緣。 */
      return '<div class="kpi-rotator">'
        + slides.map(function (t, k) {
            return '<div class="kpi-rotator__slide' + (k === i ? ' kpi-rotator__slide--active' : '') + '"'
              + (k === i ? '' : ' aria-hidden="true"') + '>' + distributionBlock(t, slides.length > 1) + '</div>';
          }).join('')
        + '</div>';
    },
    'canvas-stage':     function (d) { return canvasStage(d); },
    'canvas-overlay':   function ()  { return canvasOverlay(); },
    'canvas-picks':     function ()  { return canvasPicks(); },
    /* 待處理事項面板（2026-08-28）：取代警示條＋兩個彈窗。上限一律不套——
       面板的收合層本來就負責「不要一次佔滿第一屏」，再砍成 5 筆會讓那顆總筆數說謊。 */
    'issue-panel':      function (d) { return issuePanel(d); },
    'alerts':           function (d) {
      var items = sortByUrgency(d.items);
      var cap = d.limit === 0 ? items.length : (d.limit || F4_SUMMARY_MAX);
      return items.slice(0, cap).map(alertCard).join('');
    },
    'activity-list':    function (d) {
      if (d.table) return tableWrap(
        th('dash.col.event', 'Event', ' class="ztor-table__media-head"') + th('dash.col.status', 'Status'),
        (d.rows || []).map(activityTableRow).join(''), TRUNCATE);
      return '<div class="data-list">' + (d.rows || []).map(activityRow).join('') + '</div>';
    },
    'events-projects':  function (d) {
      if (d.table) return tableWrap(
        th('dash.col.name', 'Name', ' class="ztor-table__media-head"') + th('dash.col.progress', 'Progress')
        + th('dash.col.due', 'Due') + '<th></th>',
        (d.rows || []).map(eventProjectTableRow).join(''), TRUNCATE);
      return '<div class="data-list">' + (d.rows || []).map(eventProjectRow).join('') + '</div>';
    },
    /* F6 Ongoing 分頁的卡片列（2026-08-28）。d.more 給了才畫列尾入口：
       它是「開頁內彈窗」而不是換頁，所以文字與筆數都由資料帶進來，
       渲染器不猜落點。筆數與標籤分成兩個節點——數字是資料、標籤是文案，
       分開之後中英文不必為語序重寫句子。 */
    /* 2026-08-28：「查看全部」列尾隨資料端的 more 一併撤除——完整清單就在下一個區塊的
       F6 表格裡，同屏放入口是重複（且那個入口的筆數已濾掉終態、與表格對不起來）。 */
    /* 磚列外面包一層 __wrap 是為了讓翻頁鈕能絕對定位在捲動區的左右緣——
       鈕若放在 .work-cards 裡面會跟著一起捲走。 */
    'work-cards':       function (d) {
      var nav = function (dir, icon, key, label) {
        return '<button type="button" class="work-cards__nav work-cards__nav--' + dir + '"'
          + ' data-work-nav="' + dir + '" aria-label="' + label + '" data-i18n-aria-label="' + key + '">'
          + '<i data-lucide="' + icon + '" class="ztor-icon" aria-hidden="true"></i></button>';
      };
      return '<div class="work-cards__wrap">'
        + nav('prev', 'chevron-left', 'rail.prev', 'Previous')
        + '<div class="work-cards" data-work-rail>' + (d.rows || []).map(workCard).join('') + '</div>'
        + nav('next', 'chevron-right', 'rail.next', 'Next')
        + '</div>';
    },
    /* 第二屏的「進行中」列（2026-08-31 使用者裁示重做兩次）：一次看一件、右邊露出
       下一件的一半，右側五分之一留白給翻頁鈕；**不畫卡面**、海報放大到佔掉這一屏
       大半的高度（同日第二次裁示）。
       **每一件要自己把狀態說完**：現在做到哪（募資／預購／售票中）、賣了多少對多少、
       進度與百分比、還剩多久，外加活動的場次與城市。這一屏的任務是「掃一眼就知道
       手上這幾件跑得怎麼樣」，看不完的用右邊的箭頭翻下一輪。
       磚列（`work-cards`）留在原地不動：那一列是「我有哪些作品」的目錄，這一列是
       「哪幾件正在跑」的狀態，兩件事。 */
    'live-cards':       function (d) {
      var rows = d.rows || [];
      /* 兩顆鈕都恆常在：這一列是環狀的（最後一件的下一件是第一件），沒有「到頭了」
         這回事，收起其中一顆反而是在說謊。 */
      var nav = function (dir, icon, key, label, step) {
        return '<button type="button" class="live-rail__nav live-rail__nav--' + dir + '"'
          + ' data-live-nav="' + step + '" aria-label="' + label + '" data-i18n-aria-label="' + key + '">'
          + '<i data-lucide="' + icon + '" class="ztor-icon" aria-hidden="true"></i></button>';
      };
      /* 畫出來的順序把**最後一件排在最前面**（2026-08-31 使用者裁示「置中輪播，
         左邊放最後一個」）：這一列置中顯示第二格，所以第一格就是它左邊那一件——
         一開始看的是第一件，左邊自然該是最後一件。環狀就是從這個排法來的，
         不必複製節點也不必判斷邊界。 */
      var ordered = rows.length > 1 ? [rows[rows.length - 1]].concat(rows.slice(0, -1)) : rows;
      var items = ordered.map(function (r) {
        /* 進度條與它的讀數同一行：百分比是那條長條的數值，分開排會變成兩件事。
           沒有百分比的那幾種（例如沒有目標數）就整行不畫，不留一條空軌道被讀成 0。 */
        var bar = (r.pct != null)
          ? '<span class="live-item__bar-row">'
            + '<span class="project-bar live-item__bar" aria-hidden="true">'
            +   '<span class="project-bar__fill" style="width:' + Math.min(r.pct, 100) + '%"></span></span>'
            + '<span class="live-item__pct">' + r.pct + '%</span>'
            + '</span>'
          : '';
        /* 標出這一件是項目還是活動：出口的文案與去處跟著正中央那一件走
           （見下面的 `paintMore`）。判準用資料端的落點，不猜名稱。 */
        var kind = /^event-detail/.test(String(r.go || '')) ? 'event' : 'project';
        return '<a class="card live-item" data-live-kind="' + kind + '" href="' + s(r.go || '#') + '">'
          + '<span class="live-item__poster"><img src="' + s(r.img) + '" alt="" loading="lazy"></span>'
          + '<span class="live-item__body">'
          +   '<span class="live-item__top">'
          +     (r.stage ? '<span class="live-item__stage">' + s(r.stage) + '</span>' : '')
          +     (r.kind ? '<span class="live-item__kind">' + s(r.kind) + '</span>' : '')
          +   '</span>'
          +   '<span class="live-item__name">' + s(r.title) + '</span>'
          +   (r.meta ? '<span class="live-item__meta">' + s(r.meta) + '</span>' : '')
          +   '<span class="live-item__status">'
          +     (r.value
                  ? '<span class="live-item__value-row">'
                    + '<span class="live-item__value">' + workValue(r.value, 'live-item')
                      + (r.den ? '<span class="live-item__den">' + s(r.den) + '</span>' : '')
                      + '</span>'
                    + '</span>'
                  : '')
          +     bar
          +     (r.side ? '<span class="live-item__side">' + s(r.side) + '</span>' : '')
          /* 「前往」畫成二級按鈕、擺在卡的右下（2026-08-31 使用者裁示）。它是 `<span>`
             不是 `<a>`：整張卡本身就是那個連結，裡面再放一個連結會多一個 Tab 停留點，
             而兩者去的是同一個地方。 */
          +     '<span class="btn btn--outline btn--sm live-item__go">'
          +       '<span data-i18n="canvas.open">Open</span>'
          +       '<i data-lucide="chevron-right" class="ztor-icon" aria-hidden="true"></i>'
          +     '</span>'
          +   '</span>'
          + '</span>'
          + '</a>';
      }).join('');
      var empty = rows.length ? '' :
        '<p class="live-rail__empty"' + di18n('canvas.tab.empty') + '>Nothing open in this group</p>';
      /* **置中輪播、一次一件**（2026-08-31 使用者裁示）：中間那一件是現在在講的，
         左右各露出一截，兩顆鈕分站兩側。不用捲動區＋scroll-snap 而改用位移：
         環狀的列沒有「捲到底」這回事，而原生捲動一定有兩個端點；位移只要在動畫
         結束後把第一件搬到最後（或反過來），位置歸零就等於轉了一格。 */
      /* 這一屏的背景（正中央那一件的海報）**不畫在這裡**：它要鋪滿整個視窗、壓在所有
         東西的最後面，所以那個節點與第一屏的底圖放在一起（見 home-canvas.html）。
         畫在這一段裡的話，它會落在 `.canvas-below` 那層 z-index 之內，蓋掉側欄。 */
      return '<div class="live-rail__wrap">'
        + nav('prev', 'chevron-left', 'rail.prev', 'Previous', '-1')
        + '<div class="live-rail__view">'
        +   '<div class="live-rail" data-live-rail>' + (empty || items) + '</div>'
        + '</div>'
        + nav('next', 'chevron-right', 'rail.next', 'Next', '1')
        + '</div>';
    },
    /* 展示版左欄的進行中項目：**橫的**一列一件（2026-08-31 使用者裁示「用橫的，
       像參考圖那樣」）。參考版型左欄的每一區都是橫向的行——縮圖或圖示在左、
       名稱與數字在右；直式封面在一條 300px 的窄欄裡會把兩件事排成兩根柱子，
       跟上下兩區的節奏對不起來。
       不包 __wrap 也不放翻頁鈕：只有兩件時捲動的機制一個都用不到。 */
    'work-rows':        function (d) {
      /* 標題列自己畫（2026-08-31 使用者裁示「改成和收入分佈一樣」）：分頁列退場，
         改成標題右邊兩顆左右箭頭，與左欄第一格的收入／粉絲分布同一顆控制
         （`.canvas-step`）。四個標籤並排時，「上線 募資 預購 活動」在 300px 的欄裡
         是四個一直在那裡、卻九成時間都不會被按的字；換成箭頭之後，當前這一組的
         名稱接在標題後面（灰字），要看別組再按——同一個位置少講三件事。
         組名不能省：它是這一列在講誰的唯一線索，列上的「類型」講的是作品分類
         （電影／MV），不是這一組。 */
      var g = d.group || {};
      /* 標題整句跟著組別換（2026-08-31 使用者裁示「xxx進行中，每次換頁就換名」）：
         「上線進行中」／「募資進行中」／「預購進行中」／「活動進行中」，不是
         「進行中 · 上線」那種主標＋限定詞的拼法。一句話比兩截好讀，而且中英文
         各自照自己的語序寫（英文是 Ongoing releases，把量詞放在後面）。
         2026-08-31 撤除（墓碑）：`.canvas-block__sub`（灰字組名）與這一列的
         `.canvas-block__more`（查看更多），使用者裁示移除。 */
      var head = '<div class="canvas-block__head">'
        + '<h2 class="canvas-block__title"' + di18n(g.titleKey) + '>' + s(g.titleEn || '') + '</h2>'
        + '<span class="canvas-nav">'
        +   '<button type="button" class="canvas-step" data-work-step="-1"'
        +     ' aria-label="Previous" data-i18n-aria-label="btn.prev">'
        +     '<i data-lucide="chevron-left" class="ztor-icon"></i></button>'
        +   '<button type="button" class="canvas-step" data-work-step="1"'
        +     ' aria-label="Next" data-i18n-aria-label="btn.next">'
        +     '<i data-lucide="chevron-right" class="ztor-icon"></i></button>'
        + '</span>'
        + '</div>';
      var empty = !(d.rows || []).length
        ? '<div class="canvas-block__empty"' + di18n('canvas.tab.empty') + '>Nothing open in this group</div>'
        : '';
      var rows = (d.rows || []).map(function (r) {
        var bar = (r.pct != null)
          ? '<div class="project-bar work-row__bar" aria-hidden="true">'
            + '<div class="project-bar__fill" style="width:' + r.pct + '%"></div></div>'
          : '';
        return '<a class="work-row" href="' + s(r.go || '#') + '">'
          + '<span class="work-row__thumb">'
          +   '<img src="' + s(r.img) + '" alt="" loading="lazy">'
          + '</span>'
          + '<span class="work-row__body">'
          +   '<span class="work-row__head">'
          +     '<span class="work-row__name">' + s(r.title) + '</span>'
          +     (r.kind ? '<span class="work-row__kind">' + s(r.kind) + '</span>' : '')
          +   '</span>'
          /* 剩餘天數改掛在數字那一行的右邊（2026-08-31 使用者裁示）：它與那個數字
             講的是同一件事的兩面（賣了多少／還剩多久），排成上下兩行會讀成兩件事，
             也讓每一列多長一行。進度條因此緊接在這一行底下，三者連成一組。 */
          +   (r.value
                ? '<span class="work-row__value-row">'
                  /* 分母接在數字後面、用小字（2026-08-31 使用者裁示「要有 1000/1000，
                     分母用小字」）：分子是這一列的答案（賣了多少、募到多少），分母是
                     讀懂它需要的尺度。同樣大小的話「18,400 / 20,000」會讀成兩個
                     並列的數字，而它們是一件事的兩半。 */
                  + '<span class="work-row__value">' + workValue(r.value)
                    + (r.den ? '<span class="work-row__den">' + s(r.den) + '</span>' : '')
                    + '</span>'
                  + (r.side ? '<span class="work-row__side">' + s(r.side) + '</span>' : '')
                  + '</span>'
                : '')
          +   bar
          + '</span>'
          + '</a>';
      }).join('');
      return head + '<div class="canvas-works">' + empty + rows + '</div>';
    },
    'ext-data-status':  function (d) { return '<div class="data-list">' + (d.rows || []).map(extRow).join('') + '</div>'; },
    'insight-split':    insightSplit
  };

  /* ===========================================================
     Datasets (single source of truth)
     =========================================================== */

  // Shared transaction-row library — defined once, composed per page.
  var TX = {
    preorder:  { icon: 'receipt',   iconVariant: 'success', titleKey: 'tx.preorder.title',  title: '<em>LOVE RAGE HOPE</em> vinyl · 47 supporters', img: 'images/projects/nick-lrh.jpg', metaKey: 'tx.preorder.meta',  meta: 'Project support · 2 hours ago', srcKey: 'tx.preorder.src', src: 'Pre-order sales', timeKey: 'tx.preorder.time', time: '2 hours ago',             amount: '+US$1,410.00',           status: { key: 'status.pending',   fallback: 'Pending',   variant: 'neutral' } },
    spotify:   { todayMinsAgo: 12, icon: 'play',      iconVariant: 'info',    titleKey: 'tx.spotify.title',   title: '<em>REAL LIFE</em> (Q4 statement)',             img: 'images/projects/nick-real-life.jpg', metaKey: 'tx.spotify.meta',   meta: 'Platform / streaming royalties · Yesterday', srcKey: 'tx.spotify.src', src: 'Streaming royalty', timeKey: 'tx.spotify.time', time: 'Yesterday', amount: '+US$684.32',            status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    merch:     { todayMinsAgo: 47, icon: 'package',                           titleKey: 'tx.merch.title',     title: '<em>Pirate Queen zine vol. 02</em> × 14',               img: 'images/products/tour-zine-vol-02.webp', metaKey: 'tx.merch.meta',     meta: 'E-Shop sales · Nov 22', srcKey: 'tx.merch.src', src: 'E-Shop sales', timeKey: 'tx.merch.time', time: 'Nov 22',                     amount: '+US$392.00',            status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    licensing: { icon: 'file-text',                         titleKey: 'tx.licensing.title', title: '<em>帥到分手</em> story world → Yiu Pictures',    img: 'images/projects/nick-sdfs.jpg', metaKey: 'tx.licensing.meta', meta: 'Licensing · Nov 20', srcKey: 'tx.licensing.src', src: 'Story world licensing', timeKey: 'tx.licensing.time', time: 'Nov 20',                        amount: '+US$2,400.00',          status: { key: 'status.available', fallback: 'Available', variant: 'info' } },
    tickets:   { icon: 'ticket',                            titleKey: 'tx.tickets.title',   title: '<em>REALIVE (R2)</em> × 38',                    img: 'images/projects/nick-r2.jpg', metaKey: 'tx.tickets.meta',   meta: 'Event tickets · Nov 18', srcKey: 'tx.tickets.src', src: 'Event tickets', timeKey: 'tx.tickets.time', time: 'Nov 18',                    amount: '+US$1,140.00',          status: { key: 'status.pending',   fallback: 'Pending',   variant: 'neutral' } },
    payout:    { icon: 'download',  iconVariant: 'error',   titleKey: 'tx.payout.title',    title: 'Bank transfer ••3417',                          metaKey: 'tx.payout.meta',    meta: 'Withdrawal · Nov 18', srcKey: 'tx.payout.src', src: 'Bank transfer payout', timeKey: 'tx.payout.time', time: 'Nov 18',                       amount: '−US$5,200.00', neg: true, status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    // Settled-only income examples for Dashboard F3 (spec excludes Pending; F3 hides the status column).
    iproyalty:    { icon: 'badge-check', iconVariant: 'success', titleKey: 'tx.iproyalty.title',    title: 'NICKTHEREAL likeness → 2 licensees',      img: 'images/ip/nick-portrait.jpg', metaKey: 'tx.iproyalty.meta',    meta: 'IP royalties · Nov 19', srcKey: 'tx.iproyalty.src', src: 'IP licensing royalty', timeKey: 'tx.iproyalty.time', time: 'Nov 19',  amount: '+US$960.00',   status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } },
    ticketsSettled: { icon: 'ticket',     iconVariant: 'success', titleKey: 'tx.tickets-settled.title', title: '<em>REALIVE (R2)</em> × 52',         img: 'images/projects/nick-r2.jpg', metaKey: 'tx.tickets-settled.meta', meta: 'Event tickets · Nov 17', srcKey: 'tx.tickets-settled.src', src: 'Event tickets', timeKey: 'tx.tickets-settled.time', time: 'Nov 17', amount: '+US$1,560.00', status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } },
    hoodie:       { icon: 'package',     iconVariant: 'success', titleKey: 'tx.hoodie.title',       title: '<em>WYAGL</em> hoodie × 22',              img: 'images/products/nick-hoodie.webp', metaKey: 'tx.hoodie.meta',    meta: 'E-Shop sales · Nov 16', srcKey: 'tx.hoodie.src', src: 'E-Shop sales', timeKey: 'tx.hoodie.time', time: 'Nov 16', amount: '+US$1,078.00', status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } },
    cdPreorder:   { icon: 'receipt',     iconVariant: 'success', titleKey: 'tx.cd-preorder.title',  title: '<em>REALIVE</em> special edition CD × 63', img: 'images/products/nick-realive-cd.jpg', metaKey: 'tx.cd-preorder.meta', meta: 'Pre-order · Nov 15', srcKey: 'tx.cd-preorder.src', src: 'Pre-order sales', timeKey: 'tx.cd-preorder.time', time: 'Nov 15', amount: '+US$1,890.00', status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } },
    adshare:      { icon: 'play',        iconVariant: 'info',    titleKey: 'tx.adshare.title',      title: '<em>FLAMES</em> MV ad revenue share',     img: 'images/projects/nick-flames.jpg', metaKey: 'tx.adshare.meta',   meta: 'Video ad royalties · Nov 14', srcKey: 'tx.adshare.src', src: 'Video ad royalty', timeKey: 'tx.adshare.time', time: 'Nov 14', amount: '+US$517.40', status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } }
  };

  var DATA = {
    // F3 — settled income only, no status column (spec 5.1.1 §F3: "狀態恆為 settled，故不另列狀態欄"；
    // excludes refunds / payouts / fees / disputes and any non-settled rows). Sorted by settle time,
    // cross-source, ≤8 rows. hideStatus drops the status pill for this list only.
    'dash-recent': { table: true, hideStatus: true, rows: [TX.spotify, TX.merch, TX.licensing, TX.iproyalty, TX.ticketsSettled, TX.hoodie, TX.cdPreorder, TX.adshare] },
    // Earnings Overview — full recent ledger (income + a payout). Same renderer ⇒ identical format.
    'earn-recent': { rows: [TX.preorder, TX.spotify, TX.merch, TX.licensing, TX.tickets, TX.payout] },

    // F2 — operations summary. The two count tiles open in-place popups (data-bd-modal
    // on index.html) instead of jumping pages — the popup lists each item WITH its own
    // labelled CTA so the next step needs no guessing (L directive 2026-07-27).
    'dash-ops': { tiles: [
      /* hero:true — 使用者裁示 2026-07-27「這是本頁最重要的數據」，數字染品牌橘（.kpi--hero）。這一列只有這一塊是 hero。 */
      { labelKey: 'ops.revenue',  label: 'Total revenue',   value: '$24,830', hero: true, delta: { key: 'ops.revenue-delta-full', text: '+12.6% vs last week' }, metaLink: { href: 'earnings.html', key: 'ops.revenue-meta', text: 'Updated 2h ago · view in Earnings' } },
      { labelKey: 'ops.pending',  label: 'Pending actions', value: '4',       meta: { key: 'ops.pending-meta',  text: '3 open · 1 in progress' },  open: 'ops-pending' },
      { labelKey: 'ops.projects', label: 'Active projects', value: '4',       meta: { key: 'ops.projects-meta', text: 'Live · co-create · scheduled' }, open: 'ops-projects' }
    ] },

    // F4 — today's actions. CTA hrefs are DEEP LINKS with the landing state preset
    // (L directive 2026-07-27: the user finishes in the overlay or lands with filters
    // applied — never on a generic page): my-ip #rented + ?ip= flashes the license row;
    // e-shop ?status=low pre-activates the Low Stock chip; event-detail #overview opens
    // the tab holding the Pre-flight checklist card (2026-08-13: the card moved out of
    // the Refunds tab — that tab is hidden before sales open, exactly when the checklist matters); settings #tax aliases to Payments
    // and flashes the three tax rows.
    /* details／ago（2026-08-28，待處理事項面板）：
         details = 這一則牽涉到的細項，名稱一律從同一則的 desc 裡已經寫著的內容拆出來，
                   不新增任何產品事實（ASSUMPTIONS ISSUE-001）。徽章上的數字＝details.length。
         ago     = 相對時間，示意假資料（原型層沒有事件時間戳，見 ASSUMPTIONS ISSUE-001）。
       兩者的字串都走 i18n key；細項名稱在 persona=nick 時另有覆寫（PERSONA_DICT），
       否則面板會唸預設世界觀的品名、上面那行 desc 卻是周湯豪的作品。 */
    'dash-alerts': { items: [
      { variant: 'warning', icon: 'alert-triangle-fill', titleKey: 'alert.ip-rental.title', title: 'IP rental expires in 6 days',     descKey: 'alert.ip-rental.desc', desc: '<em>Dragon Tiger Gate key art</em> brand license expires May 25. Renew or release before expiry to avoid breach.',     metaKey: 'alert.ip-rental.meta', meta: 'Warning · My IP · In progress', ctaKey: 'alert.ip-rental.cta', cta: 'Renew',              ctaHref: 'my-ip.html?ip=neon-tide#rented', id: 'ip-rental', kind: 'expiring', src: 'my-ip', srcKey: 'nav.my-ip',
        agoKey: 'issue.ago.yesterday', ago: 'Yesterday',
        details: [
          { nameKey: 'alert.ip-rental.d1.name', name: 'Dragon Tiger Gate key art — brand license', subKey: 'alert.ip-rental.d1.sub', sub: 'Expires May 25' }
        ] },
      { variant: 'error',   icon: 'x-circle-fill',       titleKey: 'alert.stock.title',     title: 'Low stock · 3 items',             descKey: 'alert.stock.desc',     desc: '<em>Pirate Queen zine vol. 02</em>, <em>Kowloon After Dark tee (S)</em>, and the Mong Kok Sniper concept poster are below restock threshold.',   metaKey: 'alert.stock.meta',     meta: 'Critical · E-Shop · Open',      ctaKey: 'alert.stock.cta',     cta: 'Restock',            ctaHref: 'e-shop.html?status=low', id: 'low-stock', kind: 'lowstock', src: 'e-shop', srcKey: 'nav.eshop',
        agoKey: 'issue.ago.5h', ago: '5 hours ago',
        details: [
          { nameKey: 'alert.stock.d1.name', name: 'Pirate Queen zine vol. 02',      subKey: 'issue.sub.below-threshold', sub: 'Below restock threshold' },
          { nameKey: 'alert.stock.d2.name', name: 'Kowloon After Dark tee (S)',     subKey: 'issue.sub.below-threshold', sub: 'Below restock threshold' },
          { nameKey: 'alert.stock.d3.name', name: 'Mong Kok Sniper concept poster', subKey: 'issue.sub.below-threshold', sub: 'Below restock threshold' }
        ] },
      { variant: 'warning', icon: 'alert-triangle-fill', titleKey: 'alert.event.title',     title: 'Event pre-flight incomplete',     descKey: 'alert.event.desc',     desc: '<em>REALIVE World Tour (China) — Chongqing · Oct 25</em> still needs refund policy and on-site staffing confirmed.',                 metaKey: 'alert.event.meta',     meta: 'Warning · Events · Open',       ctaKey: 'alert.event.cta',     cta: 'Complete checklist', ctaHref: 'event-detail.html?id=realive-chongqing#overview', id: 'event-preflight', kind: 'review', src: 'events', srcKey: 'nav.events',
        agoKey: 'issue.ago.3h', ago: '3 hours ago',
        details: [
          { nameKey: 'alert.event.d1.name', name: 'Refund policy',    subKey: 'issue.sub.not-confirmed', sub: 'Not confirmed yet' },
          { nameKey: 'alert.event.d2.name', name: 'On-site staffing', subKey: 'issue.sub.not-confirmed', sub: 'Not confirmed yet' }
        ] },
      // Blocking (compliance) — resolvable only in its source module; close control is disabled (spec §F4).
      { variant: 'error',   icon: 'lock',                blocking: true, titleKey: 'alert.payout-block.title', title: 'Payouts on hold — tax form required', descKey: 'alert.payout-block.desc', desc: 'A W-8/W-9 tax form is required before any withdrawal can be released. Resolve in Settings.',  metaKey: 'alert.payout-block.meta', meta: 'Critical · Settings · Open · Blocking', ctaKey: 'alert.payout-block.cta', cta: 'Add tax form',  ctaHref: 'settings.html#tax', id: 'payout-tax', kind: 'blocking', src: 'settings', srcKey: 'nav.settings',
        agoKey: 'issue.ago.2h', ago: '2 hours ago',
        details: [
          { nameKey: 'alert.payout-block.d1.name', name: 'W-8 / W-9 tax form', subKey: 'alert.payout-block.d1.sub', sub: 'Required before any withdrawal is released' }
        ] },
      // Info-type item — the only kind the spec lets the creator soft-close (§F4). Shipped as
      // Open, not pre-snoozed: until 2026-08-19 this row was hardcoded snoozed:true, which meant
      // the snooze CONTROL never rendered anywhere and the whole soft-close path was unreachable.
      // Snoozing it now is a live action — the card recedes, sinks to the bottom, and F2's count drops.
      { variant: 'info',    icon: 'info-fill',           titleKey: 'alert.spotify.title',   title: 'SPOTIFY sync stopped',            descKey: 'alert.spotify.desc',   desc: 'Spotify is an official ztor integration — we\u2019re fixing it. Upload an export if you need the figures now.',            metaKey: 'alert.spotify.meta',   meta: 'Info · Fan analytics · Open', ctaKey: 'alert.spotify.cta',   cta: 'Upload data',        ctaHref: 'fan-analytics.html', id: 'spotify-sync', kind: 'info', src: 'fan-analytics', srcKey: 'nav.fans',
        agoKey: 'issue.ago.2d', ago: '2 days ago',
        details: [
          { nameKey: 'alert.spotify.d1.name', name: 'Spotify integration', subKey: 'alert.spotify.d1.sub', sub: 'Sync stopped — ztor is fixing it' }
        ] }
    ] },

    // F5 — recent activity (completed / record-only events).
    'dash-activity': { table: true, rows: [
      { icon: 'check-circle', iconVariant: 'success', titleKey: 'dash.recent.row1.title', title: '<em>帥到分手</em> MV published',               img: 'images/projects/nick-sdfs.jpg', metaKey: 'dash.recent.row1.meta', meta: 'Content · Projects · Nov 23', modKey: 'dash.recent.row1.mod', mod: 'Projects', dateKey: 'dash.recent.row1.date', date: 'Nov 23', status: { key: 'status.published', fallback: 'Published', variant: 'success' } },
      { icon: 'award',        iconVariant: 'info',    titleKey: 'dash.recent.row2.title', title: 'Fan milestone — Inner Circle reached 50',      img: 'images/products/inner-circle-membership.webp', metaKey: 'dash.recent.row2.meta', meta: 'Fans · Fans CRM · Nov 21', modKey: 'dash.recent.row2.mod', mod: 'Fans CRM', dateKey: 'dash.recent.row2.date', date: 'Nov 21',   status: { key: 'status.reached',   fallback: 'Reached',   variant: 'success' } },
      { icon: 'refresh-ccw',                          titleKey: 'dash.recent.row3.title', title: 'Expiring IP renewed — NICKTHEREAL likeness',   img: 'images/ip/nick-portrait.jpg', metaKey: 'dash.recent.row3.meta', meta: 'IP · My IP · Nov 19', modKey: 'dash.recent.row3.mod', mod: 'My IP', dateKey: 'dash.recent.row3.date', date: 'Nov 19',        status: { key: 'status.updated',   fallback: 'Updated',   variant: 'neutral' } },
      { icon: 'file-text',                            titleKey: 'dash.recent.row4.title', title: 'Brand partnership signed — Cypress Audio',     img: 'images/products/vintage-synth.webp', metaKey: 'dash.recent.row4.meta', meta: 'Income · Earnings · Nov 17', modKey: 'dash.recent.row4.mod', mod: 'Earnings', dateKey: 'dash.recent.row4.date', date: 'Nov 17', status: { key: 'status.signed',    fallback: 'Signed',    variant: 'neutral' } },
      { icon: 'ticket',       iconVariant: 'success', titleKey: 'dash.recent.row5.title', title: 'Ticket sales opened — <em>REALIVE (R2)</em>',  img: 'images/projects/nick-r2.jpg', metaKey: 'dash.recent.row5.meta', meta: 'Event · Events · Nov 16', modKey: 'dash.recent.row5.mod', mod: 'Events', dateKey: 'dash.recent.row5.date', date: 'Nov 16', status: { key: 'status.on-sale', fallback: 'On sale', variant: 'success' } },
      { icon: 'package',                              titleKey: 'dash.recent.row6.title', title: 'Restocked — <em>WYAGL</em> hoodie',            img: 'images/products/nick-hoodie.webp', metaKey: 'dash.recent.row6.meta', meta: 'Store · E-Shop · Nov 15', modKey: 'dash.recent.row6.mod', mod: 'E-Shop', dateKey: 'dash.recent.row6.date', date: 'Nov 15', status: { key: 'status.updated', fallback: 'Updated', variant: 'neutral' } },
      { icon: 'circle',                               titleKey: 'dash.recent.row7.title', title: 'Co-create project opened — <em>什麼都不必說</em>', img: 'images/projects/nick-smdbbs.jpg', metaKey: 'dash.recent.row7.meta', meta: 'Project · Projects · Nov 14', modKey: 'dash.recent.row7.mod', mod: 'Projects', dateKey: 'dash.recent.row7.date', date: 'Nov 14', status: { key: 'status.published', fallback: 'Published', variant: 'success' } }
    ] },

    /* 事件來源模組 → 落點頁（2026-08-28）。放在資料端而不是磚元件裡：
       「Fans CRM 這個來源該連去哪一頁」是產品的路由事實，不是磚要怎麼畫。
       鍵用資料裡未翻譯的 mod 字串——模組名兩個語言都不翻，所以它就是穩定的識別碼。
       規格 §F5 列的來源模組全在這裡；查不到的來源不給連結（見 activityCard）。 */
    'activity-module-href': {
      'Projects':  'projects.html',
      'Fans CRM':  'fans-crm.html',
      'My IP':     'my-ip.html',
      'Earnings':  'earnings.html',
      'E-Shop':    'e-shop.html',
      'Events':    'events.html',
      'IP Market': 'ip-market.html',
      'Settings':  'settings.html'
    },

    // F6 — recent events & ongoing projects. `go` links are per-item deep links (2026-07-27):
    // project rows → project-detail.html?id=<the store project whose numbers these rows cite>
    // (established format, projects.html uses it; unknown id degrades to store.first());
    // 2026-08-19：提醒卡改點名 realive-chongqing 並顯式帶 ?id=——舊文案指的 Kowloon Café
    // 已不在 store，無 id 示例頁如今 hydrate 成 store 首筆，寫死舊活動名會與落地頁對不上。
    'dash-events': { table: true, rows: [
      { icon: 'circle', titleKey: 'dash.progress.row1.title', title: '<em>LOVE RAGE HOPE</em> vinyl',      img: 'images/projects/nick-lrh.jpg', metaKey: 'dash.progress.row1.meta', meta: 'Project · Projects · 62 / 100 supporters · ends Dec 14', catKey: 'dash.progress.row1.cat', cat: 'Pre-order project', pct: 62, progKey: 'dash.progress.row1.prog', prog: '62 / 100 supporters', dueKey: 'dash.progress.row1.due', due: 'ends Dec 14', status: { key: 'status.live',      fallback: 'Live',      variant: 'orange' },  go: 'project-detail.html?id=dragon-tiger-gate' },
      { icon: 'circle', titleKey: 'dash.progress.row2.title', title: '<em>什麼都不必說</em>',              img: 'images/projects/nick-smdbbs.jpg', metaKey: 'dash.progress.row2.meta', meta: 'Project · Projects · $8,420 / $15,000 · 21 days left', catKey: 'dash.progress.row2.cat', cat: 'Co-create project', progKey: 'dash.progress.row2.prog', prog: '$8,420 / $15,000', dueKey: 'dash.progress.row2.due', due: '21 days left',   status: { key: 'status.scheduled', fallback: 'Scheduled', variant: 'info' },    go: 'project-detail.html?id=f-i-am-speed' },
      /* 2026-08-19 修正：這張卡原本寫 title「REALIVE (R2) concert」、文案「Apr 12・84/200・Taipei」，
         store（js/events-store.js）裡查無這場活動，go 也沒帶 ?id=——點下去只會落在 event-detail.html
         的預設示例活動，跟卡片講的完全是兩回事。改指向 store 真實存在的一筆 on-sale 活動
         realive-chongqing（date 2026-10-25、sold 84、capacity 120、city Chongqing），
         文案數字（日期/售出/容量/城市）與 pct 同步改成該筆真實數字（84/120≈70%）；
         標題原本掛的是「REALIVE (R2)」品牌（臺北小巨蛋特仕版），與重慶站是不同場次，
         一併改成這一筆自己的名稱，避免「R2 品牌＋重慶內容」的新錯配。 */
      { icon: 'circle', titleKey: 'dash.progress.row3.title', title: '<em>REALIVE World Tour</em> — Chongqing', img: 'images/projects/nick-realive.jpg', metaKey: 'dash.progress.row3.meta', meta: 'Event · Events · Oct 25 · 84 / 120 tickets · Chongqing', catKey: 'dash.progress.row3.cat', cat: 'In-person event', pct: 70, progKey: 'dash.progress.row3.prog', prog: '84 / 120 tickets', dueKey: 'dash.progress.row3.due', due: 'Oct 25',    status: { key: 'status.on-sale',   fallback: 'On sale',   variant: 'success' }, go: 'event-detail.html?id=realive-chongqing' },
      { icon: 'circle', titleKey: 'dash.progress.row4.title', title: '<em>FLAMES</em>',                    img: 'images/projects/nick-flames.jpg', metaKey: 'dash.progress.row4.meta', meta: 'Project · Projects · scheduled to launch Dec 01', catKey: 'dash.progress.row4.cat', cat: 'Release project', progKey: 'dash.progress.row4.prog', prog: '—', dueKey: 'dash.progress.row4.due', due: 'scheduled to launch Dec 01',        status: { key: 'status.draft',     fallback: 'Draft',     variant: '' },        go: 'projects.html' },
      { icon: 'circle', titleKey: 'dash.progress.row5.title', title: '<em>帥到分手</em> photo book',       img: 'images/projects/nick-sdfs.jpg', metaKey: 'dash.progress.row5.meta', meta: 'Project · Projects · closed Nov 10', catKey: 'dash.progress.row5.cat', cat: 'Co-create project', progKey: 'dash.progress.row5.prog', prog: '—', dueKey: 'dash.progress.row5.due', due: 'closed Nov 10', status: { key: 'status.succeeded', fallback: 'Succeeded', variant: 'success' }, go: 'project-detail.html?id=f-i-am-speed' },
      { icon: 'circle', titleKey: 'dash.progress.row6.title', title: '<em>REALIVE (R2)</em> concert film watch party', img: 'images/projects/nick-r2.jpg', metaKey: 'dash.progress.row6.meta', meta: 'Event · Events · Jan 18', catKey: 'dash.progress.row6.cat', cat: 'Online event', progKey: 'dash.progress.row6.prog', prog: '—', dueKey: 'dash.progress.row6.due', due: 'Jan 18', status: { key: 'status.scheduled', fallback: 'Scheduled', variant: 'info' }, go: 'events.html' }
    ] },

    // F8 — external data status. D165: two intake tracks. Official integrations
    // (Spotify, StreetVoice) are ztor's to run — the creator has nothing to authorise,
    // so a failure gets no CTA except Spotify's upload fallback. Creator-upload
    // platforms (YouTube, Instagram, TikTok) route to Fan analytics, where the
    // upload actually happens. Nothing here routes to Settings any more, and no row
    // says Connect — none of the five is something the creator connects.
    // Order follows the spec: official first, Spotify leading.
    'dash-ext': { rows: [
      { logo: { t: 'SP' }, title: 'Spotify',     typeKey: 'ext.spotify.type',     type: 'Streams & monthly listeners · last synced Nov 18',  impactKey: 'ext.spotify.impact',     impact: 'Affects Fan overview & streaming royalties', status: { key: 'data.status.delayed', fallback: 'Stalled',      variant: 'error' },   cta: { key: 'ext.cta.upload',   text: 'Upload data',       href: 'fan-analytics.html' } },
      { logo: { t: 'SV' }, title: 'StreetVoice', typeKey: 'ext.streetvoice.type', type: 'Followers & plays · synced Nov 23',                 impactKey: 'ext.streetvoice.impact', impact: 'Some fan metrics incomplete',               status: { key: 'data.status.partial', fallback: 'Partial',      variant: 'neutral' } },
      { logo: { t: 'YT' }, title: 'YouTube',     typeKey: 'ext.youtube.type',     type: 'Subscribers & views · uploaded 4 days ago',         impactKey: 'ext.youtube.impact',     impact: 'Feeds Fan overview',                        status: { key: 'data.status.normal',  fallback: 'Normal',       variant: 'success' } },
      { logo: { t: 'IG' }, title: 'Instagram',   typeKey: 'ext.instagram.type',   type: 'Followers & engagement · no file uploaded yet',     impactKey: 'ext.instagram.impact',   impact: 'Feeds Fan overview & Fans CRM',             status: { key: 'data.status.missing', fallback: 'Not uploaded', variant: 'neutral' }, cta: { key: 'ext.cta.upload',   text: 'Upload data',       href: 'fan-analytics.html' } },
      { logo: { t: 'TT' }, title: 'TikTok',      typeKey: 'ext.tiktok.type',      type: 'Followers & engagement · no file uploaded yet',     impactKey: 'ext.tiktok.impact',      impact: 'No TikTok data in Fan overview',            status: { key: 'data.status.missing', fallback: 'Not uploaded', variant: 'neutral' }, cta: { key: 'ext.cta.upload',   text: 'Upload data',       href: 'fan-analytics.html' } }
    ] },

    // F7 — fan relations (Fans CRM) | audience trends (Audience Intelligence).
    'dash-insight': {
      fans: {
        eyebrowKey: 'dash.fans.eyebrow', eyebrow: 'Fan relations · Fans CRM',
        syncKey: 'dash.fans.synced', sync: 'Updated 2h ago',
        value: '1,283', subKey: 'dash.fans.sub', sub: 'Active · 184 are Inner Circle',
        tiers: [
          { key: 'dash.fans.tier.inner',   label: 'Inner Circle', pct: '12%', rev: '$8,420' },
          { key: 'dash.fans.tier.super',   label: 'Superfan',     pct: '28%', rev: '$6,180' },
          { key: 'dash.fans.tier.devoted', label: 'Ranked fans', pct: '37%', rev: '$4,890' },
          { key: 'dash.fans.tier.fan',     label: 'Fan',          pct: '23%', rev: '$1,210' }
        ],
        /* risk → 卡底 actionable toast（2026-07-28）：整條可點，落地 fans-crm 直接開
           composer、收件對象預選 At risk (5)。文案與 fans-crm #fans-risk-alert 同源。 */
        risk: {
          href: 'fans-crm.html?msg=risk',
          titleKey: 'dash.fans.risk.title', title: '5 Superfans at risk of dropping',
          metaKey: 'dash.fans.risk.meta',   meta: '14+ days without a touchpoint',
          ctaKey: 'dash.fans.risk.cta',     cta: 'Send a private update'
        },
        linkKey: 'dash.fans.link', link: 'Open Fans', linkHref: 'fans-crm.html'
      },
      audience: {
        eyebrowKey: 'dash.audience.eyebrow', eyebrow: 'Audience trends · Audience Intelligence',
        syncKey: 'dash.audience.synced', sync: 'Last 30 days',
        value: '+847', leadKey: 'dash.audience.lead', lead: 'New followers across connected platforms',
        platforms: [
          { name: 'YouTube',     val: '+412' },
          { name: 'Instagram',   val: '+286' },
          { name: 'StreetVoice', val: '+149' },
          { name: 'Spotify',     valKey: 'dash.audience.sync-paused', val: '— sync paused', muted: true }
        ],
        noteKey: 'dash.audience.note', note: 'Spotify resync needed — last successful Nov 18.',
        fixKey: 'dash.audience.fix', fix: 'Upload data', fixHref: 'fan-analytics.html',   /* D165：Spotify 是官方串接，創作者能做的是上傳備援，不是去設定重連 */
        /* 2026-07-31 D158：受眾趨勢的處理入口原本懸空（D057 裁示指向「Fans CRM
           受眾／趨勢區塊」，但那個區塊從未存在）。受眾分析成頁後落在這裡。 */
        linkKey: 'dash.audience.link', link: 'Open Audience', linkHref: 'fan-analytics.html'
      }
    }
  };

  /* F2 popup datasets — DERIVED from the F4/F6 sources above (never restated), so the
     popup can only ever show what the cards below already show. Pending = F4 minus
     snoozed (matching the tile's count rule); Active projects = F6 minus drafts, each
     row upgraded to a labelled CTA (Open project / Open event). */
  DATA['ops-pending-list'] = { items: DATA['dash-alerts'].items.filter(function (a) { return !a.snoozed; }), limit: 0 };
  /* 完整待辦視圖（spec §F4）：全部都在（含已軟關），不套 5 筆摘要上限；
     來源模組篩選由消費頁的 popup wiring 負責（data-todo-src）。
     2026-08-28：index.html 的 todo-all／ops-pending 兩個彈窗已撤除，改由頁內的
     issue-panel 承擔。這兩個衍生資料集**保留**——docs/ 的儀表板探索稿（v1／v2／v3／
     demo-a／demo-b）仍在消費，刪掉會讓那幾份留檔的彈窗變成空的。 */
  DATA['ops-todo-all'] = { items: DATA['dash-alerts'].items, limit: 0 };

  /* 只取阻斷型（2026-08-19 使用者裁決）：告警是例外狀態，讓它獨佔第一屏最大的
     區塊等於為異常設計版面——實測 534px，是 KPI 那排的 3.6 倍、吃掉第一屏 53%。
     改成份量跟著嚴重度走：會擋錢的（阻斷型）留卡片形態在第一屏，其餘收成一行
     摘要導向完整視圖。沒有阻斷型的日子，這個資料集是空的、整塊自然不佔位。
     用 getter 而非快照：軟關會改寫 dash-alerts，取值時才過濾才不會落後。 */
  /* 2026-08-28 撤除（墓碑）：`dash-recent-compact`（2026-08-19 建，F3 的側欄版，
     同一批已結算收入走 data-list 列格式）。唯一消費端 index.html 已改用下面的
     `dash-recent-feed`（逐筆成框），全站零消費故一併移除，不留死碼。
     要「同一批資料走清單列格式」的場合請直接用 `transaction-list` ＋ 自己的資料集。 */

  /* F3 第一屏版（2026-08-28 使用者裁示：近期收入搬到第一屏右欄、一筆一個框、每 10 秒更新）。
     rows 直接指向 dash-recent 的同一個陣列——**不複製**，資料只有一份。
     offset／entering 是輪替的狀態，所以這裡必須是實體物件而不是 getter：
     getter 每次取值都會回一個新物件，輪替位置無處可存。
       limit    ＝ 同時顯示幾筆（8 筆資料輪流上場）
       offset   ＝ 目前視窗的起點（見檔尾的輪替計時器）
       entering ＝ 這一次重畫是不是輪替造成的；只有它為真時，頂端那一框才播進場動畫 */
  DATA['dash-recent-feed'] = {
    /* limit 0 ＝ 不設上限，八筆全渲染（渲染器把 falsy 當「全部」）。
       2026-08-31 由 5 改成 0：這一欄改成可捲＋底部漸消之後，只渲染 5 筆會讓漸消
       說謊——看起來「下面還有」，捲下去卻是空的。 */
    rows: DATA['dash-recent'].rows,
    limit: 0,
    offset: 0,
    entering: false,
    /* 每一筆「進帳於何時」的時戳，key＝titleKey。放在這個資料集自己身上、不寫回
       共用的 `dash-recent`——那份陣列同時餵著磚列的「近期」分頁，改到它就會連帶
       改掉不相干的畫面。 */
    stamps: {}
  };

  /* ── 首頁展示版的三個資料集（2026-08-31）────────────────────
     都是 getter：展示版的左欄會被計時器與篩選重畫，取值必須是當下的狀態，
     不能是模組載入那一刻的快照。 */
  var canvasRotatorIndex = 0;
  Object.defineProperty(DATA, 'canvas-kpi-rotator', {
    get: function () {
      /* 總數與漲跌直接借 dash-ops-4up 的前兩張（總收入、站上粉絲），不另外造一份：
         同一個數字在兩個版型上各有一份定義，遲早會對不起來。組成則來自各自
         既有的來源（見 CANVAS_REV_SPLIT 與 dash-insight.fans.tiers）。 */
      var t = DATA['dash-ops-4up'].tiles || [];
      var rev = t[0] || {}, fans = t[1] || {};
      /* 漲跌取走勢圖上那段標記的文案——卡片上本來就只有那一個地方在講漲跌，
         這裡不另外算一次。 */
      function delta(tile) {
        var b = tile.spark && tile.spark.bands && tile.spark.bands[0];
        return b ? b.label : '';
      }
      var tiers = ((DATA['dash-insight'] || {}).fans || {}).tiers || [];
      return {
        index: canvasRotatorIndex,
        slides: [
          /* 收入改成曲線（2026-08-31 使用者裁示）：資料直接借 KPI 卡那條「近 9 週的
             滾動七日收入」，不另造一份——同一個數字兩份定義遲早對不起來。
             刻度、格線、目標線、標記區間全部不帶：這一格要回答的是「最近往上還往下」，
             精確值那一行大數字已經寫著，四段刻度在 300px 的欄裡也排不開。
             **標題跟著改**：它畫的不再是「分布」而是走勢，名字不改就是說謊。 */
          { titleKey: 'canvas.trend.revenue', title: 'Revenue trend',
            mode: 'curve', value: rev.value, delta: delta(rev),
            spark: {
              values: (rev.spark && rev.spark.values) || [], h: 64,
              /* 刻度只留三上兩下（2026-08-31 使用者裁示「多加一些橫縱的數值，不要太多」）：
                 縱軸兩條格線（$20k／$10k），值域另外指定 0–26k：格線要落在整數，
                 值域卻得包住最高的那條線（24.8k），兩件事分開寫才不會把線畫到畫布外。
                 值域從 0 起算不是從 15k：附加線只有 5–7k，不從 0 起算它們會全部
                 擠在底邊變成兩條直線。橫軸只留兩端（9 週前／本週），中間的 6 週、
                 3 週在 300px 的欄裡是四個互相擠的字，而「這段是多久」兩端就講完了。 */
              max: 26, min: 0,
              yTicks: [{ key: 'spark.y.rev20', text: '$20k', v: 20 },
                       { key: 'spark.y.rev10', text: '$10k', v: 10 }],
              xTicks: [{ key: 'spark.x.w9', text: '9w' }, { key: 'spark.x.now', text: 'now' }],
              /* 附加線：總收入之外再放兩條最大的來源（電子商店 28%、共創 20%）。
                 為什麼只有兩條：五條全放進 300px 的欄就是五條纏在一起的線，而這一格
                 要回答的是「錢主要從哪來、那兩塊在長還是在縮」。完整的九項在收入總覽頁。
                 **兩條線是示意資料**（與整條 spark 同一個等級的示意，見上方 KPI 卡的
                 說明）：站上沒有逐來源的時間序列，只有「當期份額」。這兩條的**末端
                 對齊真實份額**（24,830 × 28% ＝ 6.95k、× 20% ＝ 4.97k），中段的形狀是
                 編出來的——共創走一波募資高峰後回落，電子商店穩定成長。要拿它做結論
                 之前，先確認後端有沒有逐來源的序列（記在 ASSUMPTIONS CANVAS-002）。 */
              extra: [
                { key: 'src.eshop', en: 'E-Shop sales', color: 'var(--chart-1)',
                  values: [4.19,4.23,4.25,4.23,4.19,4.17,4.19,4.23,4.28,4.3,4.29,4.26,4.25,4.27,4.33,4.39,4.42,4.42,4.4,4.41,4.44,4.52,4.59,4.64,4.65,4.65,4.67,4.73,4.82,4.9,4.96,4.99,5.0,5.04,5.11,5.21,5.3,5.37,5.41,5.43,5.48,5.56,5.66,5.77,5.84,5.88,5.91,5.95,6.03,6.14,6.25,6.32,6.36,6.37,6.42,6.5,6.61,6.71,6.77,6.81,6.83,6.87,6.95] },
                { key: 'src.cocreate', en: 'Co-creation funding', color: 'var(--chart-2)',
                  values: [5.08,5.21,5.27,5.29,5.37,5.49,5.61,5.65,5.66,5.74,5.86,5.96,5.97,5.97,6.05,6.15,6.21,6.2,6.18,6.23,6.32,6.33,6.28,6.26,6.3,6.33,6.32,6.23,6.18,6.21,6.22,6.15,6.05,5.99,5.99,5.96,5.86,5.74,5.66,5.65,5.6,5.48,5.34,5.28,5.24,5.18,5.03,4.91,4.87,4.93,4.95,4.9,4.87,4.92,4.98,4.98,4.93,4.92,4.97,5.03,5.02,4.97,4.97] }
              ]
            } },
          /* 粉絲改成圓環（同日使用者提供參考圖）：總數收進環心，圖例並排在右邊。
             這一張因此沒有上方那個 56px 的大數字——環心已經有一個總數，
             同一個數字在同一張卡上出現兩次沒有意義。 */
          { titleKey: 'canvas.split.tiers', title: 'Fan mix',
            mode: 'donut', value: fans.value,
            unitKey: 'canvas.donut.fans', unit: 'fans',
            rows: tiers.map(function (x, i) {
              return { key: x.key, en: x.label, label: x.label,
                       pct: parseInt(String(x.pct), 10) || 0,
                       color: TIER_COLORS[i % TIER_COLORS.length] };
            }) }
        ]
      };
    }
  });
  /* ── 展示版左欄第二格「進行中」：四個分頁（2026-08-31 使用者裁示）────
     分頁＝上線／募資／預購／活動。前三個是專案的三種類型，第四個是活動。

     **「進行中」的口徑各自不同，這是刻意的**：
       專案（三種）→ `scheduled`（還沒開始）＋ `published`（正在跑）。
                     **不含 `live`**——專案的 live 是「已經上線了」，那件事做完了。
       活動        → `scheduled` ＋ `on-sale` ＋ `live`。活動的 live 是「正在舉行」，
                     那正是最需要盯著的時候，與專案的 live 意思相反。

     **每一列固定三段，但四個分頁的白字各自不同**（2026-08-31 使用者裁示）：
       灰字   名稱 · 類型      ← 這是哪一件事
       白字   關鍵數字         ← 上線＝倒數天數；募資＝已募金額；預購＝已售筆數；活動＝已售票數
       進度條 ＋ 小字          ← 上線沒有進度條、小字放上線日期；其餘進度條＋小字剩餘時間

     為什麼名稱退成灰字、白字只留一個：這一格一次只看得到兩件事，人是先掃
     「賣得如何／還剩幾天」，名稱是回頭確認用的。白字全欄只有一個，那一個
     就一定是這一列的答案；名稱與數字同為白字時兩者互搶，一列要讀兩次。
     所有數字都取自 store 既有欄位，這裡不生成產品事實。 */
  /* `k` 是分頁鍵、`type` 是 store 裡的專案類型——兩者不一定同名（上線那一頁的
     類型是 `go-live`，帶連字號），所以分開存，不靠鍵名去猜。 */
  var CANVAS_WORK_TABS = [
    { k: 'golive',   type: 'go-live',  key: 'canvas.tab.golive',   en: 'Release',
      titleKey: 'canvas.ongoing.golive',   titleEn: 'Ongoing releases' },
    { k: 'fund',     type: 'fund',     key: 'canvas.tab.fund',     en: 'Funding',
      titleKey: 'canvas.ongoing.fund',     titleEn: 'Ongoing funding' },
    { k: 'preorder', type: 'preorder', key: 'canvas.tab.preorder', en: 'Pre-order',
      titleKey: 'canvas.ongoing.preorder', titleEn: 'Ongoing pre-orders' },
    { k: 'event',    type: null,       key: 'canvas.tab.event',    en: 'Events',
      titleKey: 'canvas.ongoing.event',    titleEn: 'Ongoing events' }
  ];
  function canvasWorkType(tab) {
    var k = tab || canvasWorkTab;
    for (var i = 0; i < CANVAS_WORK_TABS.length; i++) {
      if (CANVAS_WORK_TABS[i].k === k) return CANVAS_WORK_TABS[i].type;
    }
    return null;
  }
  var canvasWorkTab = 'golive';
  var CANVAS_PROJ_OPEN = { scheduled: 1, published: 1 };
  /* 卡片上那顆狀態小字用的說法：一律等於站上既有的字典值（`canvas.tab.*`／`status.*`），
     這裡只是把它們拿到渲染當下用——這幾個字是資料算出來的，不是靜態標籤，掛
     `data-i18n` 會被字典值蓋掉（見換語言那一段的說明）。 */
  var CANVAS_STAGE = {
    golive:   { zh: '上線', en: 'Release' },
    fund:     { zh: '募資', en: 'Funding' },
    preorder: { zh: '預購', en: 'Pre-order' }
  };
  var CANVAS_EVENT_STAGE = {
    'on-sale':  { zh: '售票中', en: 'On sale' },
    live:       { zh: '進行中', en: 'Live' },
    scheduled:  { zh: '準備中', en: 'Scheduled' }
  };
  var CANVAS_EVENT_OPEN = { scheduled: 1, 'on-sale': 1, live: 1 };

  /* 距今幾天。`releaseDate()` 回的是 `2026/09/12` 這種顯示字串，這裡只把它當日期
     解析，不改寫它——過期或解析不出來就回空字串，不硬掰一個數字。 */
  /* 距今幾天（數字）。切換器要用它排序，倒數的字則由下面那支拼出來——
     兩者共用同一個解析，日期格式只認一次。 */
  function canvasDaysCount(str) {
    if (!str) return null;
    var m = String(str).match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var n = Math.round((d - today) / 86400000);
    return isNaN(n) ? null : n;
  }
  function canvasDaysTo(str, style) {
    var n = canvasDaysCount(str);
    if (n == null || n < 0) return '';
    var zh = canvasZh();
    /* `style: 'release'`＝上線那一組的白字（2026-08-31 使用者裁示「中文改成
       12 天後上線」）：那一列沒有別的東西在講「這是要上線」，倒數本身就得把事情
       說完。其餘位置（活動的剩餘時間）維持中性的「還有 N 天」——它旁邊已經有
       售票數與進度條在講是什麼事。
       兩個語言各照自己的語序：中文把動作放後面（12 天後上線），英文放前面
       （Live in 12 days）；英文的單複數也各自處理，不做「數字＋固定字串」的硬拼。 */
    if (style === 'release') {
      if (n === 0) return zh ? '今天上線' : 'Live today';
      return zh ? (n + ' 天後上線') : ('Live in ' + n + (n === 1 ? ' day' : ' days'));
    }
    if (n === 0) return zh ? '今天' : 'Today';
    return zh ? ('還有 ' + n + ' 天') : (n + (n === 1 ? ' day' : ' days'));
  }

  /* 「62 / 100 筆預購」→「62 筆預購」。單位詞（筆預購／張票／pre-orders）沿用
     store 自己寫在 `meta` 裡的那一個，不在這裡另外決定叫什麼——同樣是預購，
     電影票寫「張票」、周邊寫「筆預購」，改寫任何一邊都是竄改產品事實。
     格式對不上就整段原樣回傳，寧可長一點也不要切錯。 */
  function canvasSoldOf(seg) {
    var m = String(seg || '').match(/^\s*([\d,]+)\s*\/\s*[\d,]+\s*(.*)$/);
    if (!m) return String(seg || '');
    return (m[1] + ' ' + m[2]).trim();
  }

  /* 一組「進行中」的列（2026-08-31 抽參數）：原本這支直接讀 `canvasWorkTab`，
     左欄的四組輪播是它唯一的消費者；第二屏的進行中卡片要一次吃三組（募資、預購、
     活動），所以組別改用參數傳進來，兩個消費者共用同一份取數與口徑。 */
  function canvasRowsOf(tab) {
    var api = window.ztorProjects, zh = canvasZh();
    if (tab === 'event') {
      var ev = window.ztorEvents;
      if (!ev) return [];
      return ev.list().filter(function (e) {
        return CANVAS_EVENT_OPEN[e.status] && e.images && e.images.keyvisual;
      }).map(function (e) {
        var sold = typeof e.sold === 'number' ? e.sold
          : (e.tiers || []).reduce(function (a, t) { return a + (t.sold || 0); }, 0);
        var cap = e.capacity || (e.tiers || []).reduce(function (a, t) { return a + (t.qty || 0); }, 0);
        return {
          img: e.images.keyvisual, title: e.name,
          kind: zh ? '活動' : 'Event',
          /* 狀態與場次資訊（2026-08-31 為第二屏的進行中卡片加）：這兩樣只有卡片版用得到，
             左欄那一列放不下。字一律沿用站上既有的說法（`status.on-sale` 售票中／
             `status.live` 進行中／`status.scheduled` 準備中、store 自己寫的日期與城市），
             不在這裡另外造一套。 */
          status: e.status,
          stage: CANVAS_EVENT_STAGE[e.status] ? CANVAS_EVENT_STAGE[e.status][zh ? 'zh' : 'en'] : '',
          meta: [e.date, e.city].filter(Boolean).join(' \u00b7 '),
          /* 分子是賣了幾張、分母是容量（2026-08-31 使用者裁示補上分母）：
             單位詞跟著分母走，「18,400 / 20,000 張票」才是一句話，
             跟在分子後面會變成「18,400 張票 / 20,000」。 */
          value: sold.toLocaleString(),
          den: cap ? (' / ' + cap.toLocaleString() + (zh ? ' 張票' : ' tickets')) : '',
          pct: cap ? Math.round(sold / cap * 100) : null,
          side: canvasDaysTo(e.date),
          go: 'event-detail.html?id=' + e.id
        };
      });
    }
    if (!api) return [];
    var want = canvasWorkType(tab);
    return api.list().filter(function (p) {
      return p.type === want && CANVAS_PROJ_OPEN[p.status] && (p.poster || p.cover);
    }).map(function (p) {
      var nm = api.nameLabel(p), lab = api.catLabel(p.cat);
      var row = {
        img: p.poster || p.cover, title: zh ? nm.zh : nm.en,
        kind: zh ? lab.zh : lab.en,
        stage: CANVAS_STAGE[tab] ? CANVAS_STAGE[tab][zh ? 'zh' : 'en'] : '',
        go: 'project-detail.html?id=' + p.id
      };
      if (tab === 'fund' && p.fund) {
        row.value = p.fund.raised;
        row.den = p.fund.goal ? (' / ' + p.fund.goal) : '';
        row.pct = p.bar ? p.bar.pct : null;
        row.side = p.fund.left ? (zh ? p.fund.left.zh : p.fund.left.en) : '';
      } else if (tab === 'preorder') {
        /* `meta` 是「62 / 100 筆預購 · 單價 $28 · 剩 9 天」這種三段字串：
           取第一段的已售數當白字、最後一段的剩餘時間當小字。中間的單價在
           這個位置不幫忙做任何決定。 */
        var meta = p.meta ? (zh ? p.meta.zh : p.meta.en) : '';
        var parts = meta.split('\u00b7').map(function (x) { return x.trim(); });
        /* 「62 / 100 筆預購」拆成分子與分母兩段：分子單獨是白的大字，分母帶著
           單位詞走小字。單位詞仍沿用 store 自己寫的那一個，不在這裡另外決定。 */
        var seg = String(parts[0] || '').match(/^\s*([\d,]+)\s*\/\s*([\d,]+)\s*(.*)$/);
        row.value = seg ? seg[1] : canvasSoldOf(parts[0]);
        row.den = seg ? (' / ' + seg[2] + (seg[3] ? ' ' + seg[3] : '')) : '';
        row.pct = p.bar ? p.bar.pct : null;
        row.side = parts.length > 1 ? parts[parts.length - 1] : '';
        /* 中段（「單價 $28」）在左欄那一列沒有位置，卡片版有：它是預購這件事的第二個
           事實——賣多少錢。同樣沿用 store 自己寫的那一段，不重新組句。 */
        row.meta = parts.length > 2 ? parts.slice(1, parts.length - 1).join(' \u00b7 ') : '';
      } else {
        /* 上線沒有進度可言，白字就是倒數（要決定的是「還來得及做什麼」）。
           **上線日期 2026-08-31 撤除**（使用者裁示）：倒數已經是同一個日期的另一種
           說法，兩個都寫等於同一件事講兩次，而這一列只需要回答「還剩多久」。
           倒數讀不出來時放「尚未排期」——空白比一個假數字好，但這一列不能沒有主詞。 */
        var d = api.releaseDate(p);
        var left = canvasDaysTo(d, 'release');
        row.value = left || (zh ? '尚未排期' : 'Not scheduled');
        row.pct = null;
      }
      return row;
    });
  }
  function canvasWorkRows() { return canvasRowsOf(canvasWorkTab); }

  Object.defineProperty(DATA, 'canvas-works', {
    get: function () {
      var g = CANVAS_WORK_TABS.filter(function (t) { return t.k === canvasWorkTab; })[0] || CANVAS_WORK_TABS[0];
      return { group: g, rows: canvasWorkRows().slice(0, 2) };
    }
  });
  /* 第二屏的「進行中」卡片（2026-08-31 使用者裁示「換成進行中的項目募資、預購以及
     活動售票中」）：三組接成一串，順序是募資 → 預購 → 活動。
     **不含上線那一組**：使用者點名的是這三種，而上線只有倒數、沒有進度可看——
     這一屏要回答的是「現在跑得怎麼樣」。 */
  Object.defineProperty(DATA, 'canvas-live', {
    get: function () {
      /* 活動只收**售票中與進行中**（使用者點名的是這兩種）：左欄那一組還收「準備中」，
         因為它問的是「這一組裡有什麼」；這一屏問的是「現在跑得怎麼樣」，而準備中的
         活動連票都還沒開賣，進度條會是一整排的 0。 */
      var live = { 'on-sale': 1, live: 1 };
      return {
        rows: canvasRowsOf('fund')
          .concat(canvasRowsOf('preorder'))
          .concat(canvasRowsOf('event').filter(function (r) { return live[r.status]; }))
      };
    }
  });
  Object.defineProperty(DATA, 'canvas-issues', {
    /* limit 0＝全部列出（2026-08-31 使用者裁示「有更多就繼續往下排」）：
       這一格原本固定出三則、多的看不到；現在清單有幾則就排幾則，左欄跟著變長，
       第一段也跟著長高（見 canvas-home.css 的 `.canvas-hero` min-height）。 */
    get: function () { return { items: DATA['dash-alerts'].items, compact: true, limit: 0 }; }
  });

  Object.defineProperty(DATA, 'dash-alerts-blocking', {
    get: function () {
      return { items: DATA['dash-alerts'].items.filter(function (a) { return a.blocking; }), limit: 0 };
    }
  });

  /* F2「待處理事項」的數字與副標改為從 F4 推導（2026-08-19）——此前是寫死的 '4' 與
     '3 open · 1 in progress'，軟關一筆之後兩邊就對不起來。口徑照規格：Open + In Progress，
     排除 Snoozed，且顯示真實總數（不受首頁 5 筆摘要上限影響）。 */
  function pendingStats() {
    var live = DATA['dash-alerts'].items.filter(function (a) { return !a.snoozed; });
    var inProg = live.filter(function (a) { return /In progress/i.test(a.meta || ''); }).length;
    return { total: live.length, open: live.length - inProg, inProgress: inProg };
  }
  /* 副標帶動態數字，所以不能掛 data-i18n（字典值會把算好的字蓋掉——2026-08-19 實測
     顯示「3 open」而總數是 4）。照站上既有做法：字典存 {open}/{prog} 佔位符，
     這裡取字串後就地替換，語言切換時重算一次。 */
  function pendingMetaText() {
    var st = pendingStats();
    var tpl = (window.i18nT && window.i18nT('ops.pending-meta')) || '{open} open · {prog} in progress';
    return tpl.replace('{open}', st.open).replace('{prog}', st.inProgress);
  }
  function syncPendingTile() {
    var st = pendingStats();
    var tile = DATA['dash-ops'].tiles.filter(function (t) { return t.open === 'ops-pending'; })[0];
    if (!tile) return st;
    tile.value = String(st.total);
    tile.meta = { text: pendingMetaText() };     // 刻意不帶 key，見上方註解
    return st;
  }
  syncPendingTile();

  /* ── 四塊 KPI 的營運摘要（2026-08-19 使用者裁決）──────────────────────
     與 dash-ops 的差別只有三件事，資料本身共用同一組推導：
       · 一排四塊（span 3），第四塊是「站上粉絲」，點開才看圓餅與分級明細
       · 總收入卡不再是實色橘 hero，改成一般底色＋橘色數字（--brand-ink，Q8）
       · 「查看 Earnings」提到右上角，「2 小時前更新」留在註腳且不帶連結底線
     用 getter：待處理那塊的數字由 syncPendingTile() 寫進 dash-ops，取值時才複製
     才不會落後（軟關會改寫它）。 */
  Object.defineProperty(DATA, 'dash-ops-4up', {
    get: function () {
      var src = DATA['dash-ops'].tiles;
      var pending = src.filter(function (t) { return t.open === 'ops-pending'; })[0];
      var projects = src.filter(function (t) { return t.open === 'ops-projects'; })[0];
      return { tiles: [
        /* spark = 近 12 週的收入走勢（示意資料，與 $24,830 同一條線的末端對齊）。
           只有「量隨時間變化」的兩塊給走勢圖：總收入與站上粉絲；待處理與進行中項目
           是當下的計數，畫成折線會暗示一個它們沒有在講的趨勢。 */
        /* 2026-08-28 使用者裁示：這張卡不要註腳（原本是「2 小時前更新」）——
           走勢圖已經把「最近的變化」講完，再放一行時間戳是同一件事講第二次。
           i18n 的 ops.revenue-since 保留不刪，dash-ops 那組仍在用。 */
        { accent: true,
          labelKey: 'ops.revenue', label: 'Total revenue', value: '$24,830',
          /* 63 個點＝近 9 週的「滾動七日收入」：每一天回看過去七天的總額。
             為什麼不是逐日收入——卡片的值是單週 $24,830、目標是每週，逐日值的單位對不上
             （日收入 $24k 會讓週收入變 $175k）。滾動七日的單位就是週收入，終點正好等於卡片上的數字，
             而且滾動加總本身會把單日波動抹平，讀起來才像收入而不是感測器雜訊。
             窗口 12→9 週、縱軸 4→3 段（2026-08-28 使用者裁示）：範圍收窄後折線佔滿的高度更多。
             刻度值域寫死 25/15（不是取資料極值），折線才會落在格線之間、不隨資料飄。 */
          spark: { detail: true,
                   values: [17.53,17.54,17.48,17.76,17.91,17.85,18.21,18.04,18.21,18.21,18.37,18.64,18.71,18.54,18.7,18.9,18.94,18.9,19.04,19.08,18.94,19.25,19.17,19.03,19.06,19.19,19.14,19.07,19.39,19.13,19.32,19.32,19.21,19.27,19.49,19.29,19.38,19.55,19.63,19.42,19.68,19.71,19.87,19.88,20,19.92,20.05,20.13,20.55,20.53,20.82,21.03,21.42,21.59,21.77,22.05,22.3,22.75,23.24,23.4,23.9,24.34,24.83],
                   yTicks: [{ key: 'spark.y.rev25', text: '$25k', v: 25 },
                            { key: 'spark.y.rev20', text: '$20k', v: 20 },
                            { key: 'spark.y.rev15', text: '$15k', v: 15 }],
                   xTicks: [{ key: 'spark.x.w9', text: '9w' }, { key: 'spark.x.w6', text: '6w' },
                            { key: 'spark.x.w3', text: '3w' }, { key: 'spark.x.now', text: 'now' }],
                   target: { v: 24 },
                   bands: [{ from: 49, to: 62, trend: 'up',
                             labelKey: 'ops.revenue-delta', label: '+12.6%' }] },
          /* 2026-08-28 使用者裁示移除 delta 膠囊：走勢圖的標記區間已經標了同一個 +12.6%，
             卡上放兩次是同一件事講兩遍。 */
          topLink: { href: 'earnings.html', key: 'ops.revenue-link', text: 'View in Earnings' } },
        { labelKey: 'dash.tiers.title', label: 'Fans on Ztor', value: '1,283',
          spark: { detail: true,
                   values: [1167,1166,1168,1171,1172,1178,1178,1181,1180,1185,1183,1186,1190,1190,1192,1192,1194,1198,1197,1202,1204,1203,1204,1206,1207,1208,1212,1213,1212,1213,1216,1215,1218,1220,1220,1222,1224,1224,1224,1227,1230,1229,1228,1231,1235,1233,1235,1235,1240,1242,1241,1244,1244,1251,1251,1254,1254,1258,1263,1269,1274,1275,1283],
                   yTicks: [{ key: 'spark.y.fans13', text: '1.3k', v: 1300 },
                            { key: 'spark.y.fans12', text: '1.2k', v: 1200 },
                            { key: 'spark.y.fans11', text: '1.1k', v: 1100 }],
                   xTicks: [{ key: 'spark.x.w9', text: '9w' }, { key: 'spark.x.w6', text: '6w' },
                            { key: 'spark.x.w3', text: '3w' }, { key: 'spark.x.now', text: 'now' }],
                   target: { v: 1250 },
                   bands: [{ from: 49, to: 62, trend: 'up',
                             labelKey: 'spark.fans-wow', label: '+2.3%' }] },
          /* 2026-08-28 使用者裁示移除註腳（原為「Inner Circle 12% · 超級粉絲 28%」）：
             與總收入卡一致，帶走勢圖的卡不再放註腳。分級組成點開卡片就看得到。 */
          open: 'fans-tiers' },
        /* 2026-08-28（版面改兩欄）：待處理事項的計數卡整顆撤除——右欄的分組面板
           自己就帶著總筆數與逐組筆數，左欄再放一張只寫「5」的卡是同一個數字第三次出現。
           `pending` 仍取值：syncPendingTile 要靠它把面板的總數寫回 docs/ 的舊版儀表板。 */
        { labelKey: projects.labelKey, label: projects.label, value: projects.value,
          meta: projects.meta, open: 'ops-projects' }
      ] };
    }
  });
  /* 只列「還在跑」的項目與活動：草稿還沒公開、已成功／已結束／已取消都是終態，
     留在這個彈窗裡會讓 F2 的「進行中項目」數字對不起來（2026-07-31 補齊假資料時）。 */
  var OPS_TERMINAL = { 'status.draft': 1, 'status.succeeded': 1, 'status.ended': 1, 'status.cancelled': 1 };
  DATA['ops-projects-list'] = { rows: DATA['dash-events'].rows
    .filter(function (r) { return !OPS_TERMINAL[r.status.key]; })
    .map(function (r) {
      var isEvent = r.go === 'events.html';
      return Object.assign({}, r, { cta: {
        key: isEvent ? 'ops.modal.open-event' : 'ops.modal.open-project',
        text: isEvent ? 'Open event' : 'Open project'
      } });
    }) };

  /* 儀表板 F6 Ongoing 分頁的卡片列（2026-08-28）。與 ops-projects-list 同一種
     推導寫法：從 dash-events 派生，原資料不動（docs/ 的探索稿仍吃表格版）。
       · 只取前 3 筆：一排三張卡佔滿一屏的寬度，第四筆起會把 F3「近期收入」
         那張卡整個推到摺線以下。其餘由列尾入口承接。
       · more.count 取「彈窗真正列得出來的筆數」（ops-projects-list 已濾掉草稿與
         已結束），不是 dash-events 的 6——入口寫 6、點開只有 4，那顆數字就在說謊。 */
  /* 卡片列只取前 3 筆：它的職責是「一眼認出是哪幾件」，完整清單由正下方的 F6 表格承接
     （2026-08-28 使用者裁決兩者並存）。刻意不放「查看全部」入口——完整清單就在下一個區塊，
     而且那個入口連到的彈窗已濾掉終態（4 筆）、與表格的 6 筆對不起來，兩個數字並排會打架。 */
  /* 磚列的料改從 projects store 取（2026-08-28）。
     為什麼不繼續用 dash-events 那 6 筆：那是 F6 表格的簡化假資料，只帶一張 img，
     而 store 的每一筆本來就同時有 cover（卡片圖）與 **poster（直式海報）**——
     磚列要的正是後者。順帶把「再多放幾個」一起解決：store 有 51 筆，
     濾掉終態（已取消／草稿／已成功）之後仍遠多於一排放得下的數量。
     取 poster、沒有 poster 才退回 cover；兩者都缺就跳過這一筆（寧可少一張，
     也不要一塊空白灰磚）。 */
  /* 磚列的兩個分頁（2026-08-28 使用者裁決，同日第二次改）。
       進行中 ＝ 還會變的作品（live 進行中、scheduled 準備中），取自 projects store
       近期   ＝ §F5 的系統事件，取自 dash-activity
     ── 為什麼「近期」不再是「已結束的作品」──
     兩者本來就高度重疊：「帥到分手 MV 上線」這則事件，與同一支 MV 狀態為
     「已上線」的作品磚講的是同一件事，同一區用兩種說法講一次就是重複。
     合併之後磚列的敘事變乾淨——左分頁＝我在做什麼，右分頁＝剛剛發生了什麼；
     已結束的作品仍可由右上的「更多」進 projects.html 看到，沒有資訊消失。
     draft 仍然兩邊都不進——草稿還不是作品，磚列的職責是「認出是哪幾件作品」。 */
  var WORK_RAIL_GROUPS = {
    ongoing: { live: 1, scheduled: 1 }
  };
  var workRailGroup = 'ongoing';

  /* 規格 5.1.1 §F5 的五項逐項落位（每筆必須齊全，不得少）：
       1 事件類型 → 眉標左段（取 meta 的第一段，見 activityKind）
       3 事件來源 → 眉標右段（mod）
       2 事件名稱 → 名稱行（title）
       5 事件狀態 → 狀態列左（status 的譯詞）
       4 發生時間 → 狀態列右（date）
     文字在這裡就先譯好、磚上不掛 data-i18n：磚上這幾格本來就有一半是純資料
     （作品名、剩餘天數來自 store 的雙語物件），語言一換整列重畫；兩種來源走同一條
     路徑，才不會出現「一半新語言、一半舊語言」。 */
  function tr(key, fallback) {
    var v = (key && window.i18nT) ? window.i18nT(key) : null;
    return v == null ? (fallback == null ? '' : fallback) : v;
  }
  /* 事件類型只存在於 meta 這句散文的第一段（「內容 · Projects · 11/23」）。
     取第一段而不是自己編一套分類：規格說事件類型是既有欄位，這份原型資料就放在那裡。
     切不出來（沒有分隔號）就整段留空，只顯示來源模組——不為了填滿格子發明分類。 */
  function activityKind(r) {
    var meta = tr(r.metaKey, r.meta);
    var i = meta.indexOf('·');
    return i > 0 ? meta.slice(0, i).trim() : '';
  }
  function activityCard(r) {
    var href = DATA['activity-module-href'][r.mod];
    return {
      img: r.img,
      kind: activityKind(r),
      kindRight: tr(r.modKey, r.mod),
      title: tr(r.titleKey, r.title),
      /* 狀態詞在事件磚上是看得見的字（規格要求五項齊全），所以不再另外送
         status 進去做視覺隱藏的讀屏文字——同一句話唸兩次。 */
      type: r.status ? tr(r.status.key, r.status.fallback) : '',
      timing: { value: tr(r.dateKey, r.date) },
      go: href || ''
    };
  }

  /* 名稱下方那一行的資料判斷（2026-08-28 第三版）。順序是覆蓋率順序，不是偏好順序：
       1. 有 bar.pct       → 進度：細條＋「pct% · 剩餘天數」（天數是 fund.left，雙語物件）
       2. 有 releaseDate   → 上線日：日期照 i18n 樣板拼進句子
       3. 都沒有           → 回 null，整行不畫
     為什麼不去剖析 p.meta 的散文：那是給人讀的句子（「審核中 · 9/05 上映」），
     格式沒有契約，剖析它等於把文案當資料欄位用，文案一改就靜默拿到錯的日期。
     releaseDate() 是 store 的既有 API，影片家族取送審件、其餘取項目自己的欄位（D180），
     呼叫端不必知道差別——但頁面要載 work-review-store.js，否則影片家族那一半永遠是空的。 */
  /* 磚上第三行的右側值（2026-08-28 第四版）。只回「一個最可行動的數字」，
     不再把項目類型混進句子裡——類型已經在同一行的左側，寫兩次是重複
     （改版前 go-live 的磚會同時出現「上線」與「2025/08/22 上線」）。
     優先序：剩餘天數 > 百分比 > 上線日期。剩餘天數最可行動（它會逼你做事），
     百分比次之，日期是既成事實、最不需要決策。 */
  function railTiming(p, zh) {
    if (p.bar && p.bar.pct != null) {
      var left = p.fund && p.fund.left;
      return { pct: p.bar.pct, value: left ? (zh ? left.zh : left.en) : p.bar.pct + '%' };
    }
    var d = window.ztorProjects.releaseDate(p);
    return d ? { value: d } : null;
  }

  DATA['dash-events-cards'] = {
    get rows() {
      /* 「近期」分頁裝的是 §F5 系統事件（2026-08-28 使用者裁示把 F5 併進磚列）。
         它不經 projects store——事件是跨模組的紀錄，不是某一件作品的狀態。 */
      if (workRailGroup === 'recent') return (DATA['dash-activity'].rows || []).map(activityCard);
      var api = window.ztorProjects;
      if (!api) return DATA['dash-events'].rows;      // store 未載入時的退路
      var group = WORK_RAIL_GROUPS.ongoing;
      var zh = (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
      return api.list()
        .filter(function (p) { return group[p.status] && (p.poster || p.cover); })
        .map(function (p) {
          var nm = api.nameLabel(p);
          /* 兩套詞彙分開送：kind＝作品是什麼（眉標那行），type＝項目是什麼（狀態行左側）。
             合成一個字串是上一版的做法，使用者裁示拆行，這裡就拆成兩個欄位，
             不在元件端切字串——切字串會把「·」的語意藏進呈現層。 */
          var lab = api.catLabel(p.cat);
          var tl = api.typeLabel ? api.typeLabel(p.type) : null;
          return {
            img: p.poster || p.cover,
            title: zh ? nm.zh : nm.en,
            kind: zh ? lab.zh : lab.en,
            type: tl ? (zh ? tl.zh : tl.en) : '',
            timing: railTiming(p, zh),
            go: 'project-detail.html?id=' + p.id,
            status: { key: 'status.' + p.status, fallback: p.status,
                      variant: p.status === 'live' ? 'orange'
                             : p.status === 'scheduled' ? 'info'
                             : p.status === 'cancelled' ? 'neutral' : 'success' }
          };
        });
    }
  };

  /* ===========================================================
     Runtime
     =========================================================== */

  function mount(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-component]');
    if (!nodes.length) return;
    Array.prototype.forEach.call(nodes, function (el) {
      var name = el.getAttribute('data-component');
      var fn = RENDERERS[name];
      if (!fn) { console.warn('[components.js] unknown component "' + name + '"'); return; }
      var key = el.getAttribute('data-key');
      if (key && !DATA[key]) console.warn('[components.js] unknown data-key "' + key + '"');
      el.innerHTML = fn(key ? (DATA[key] || {}) : {});
    });
    if (window.ztorIcons) window.ztorIcons.applyIcons(root);
    if (window.applyI18n) window.applyI18n(root);
  }

  mount(document); // synchronous, before reveal.js

  /* 封面磚列翻頁（2026-08-28）：一次捲一「頁」＝當前可視寬度，不是固定像素——
     視窗寬窄不同時每頁的張數就不同，捲固定值會在窄視窗一次跳過兩三張。
     scroll-behavior 交給 CSS（含 prefers-reduced-motion 的關閉）。
     鈕的顯隱依捲動位置：到頭收左鈕、到底收右鈕；resize 也要重算（視窗變寬可能就不必翻了）。 */
  (function () {
    function sync(rail) {
      var wrap = rail.parentElement;
      var max = rail.scrollWidth - rail.clientWidth;
      var prev = wrap.querySelector('[data-work-nav="prev"]');
      var next = wrap.querySelector('[data-work-nav="next"]');
      if (prev) prev.hidden = rail.scrollLeft <= 2;
      if (next) next.hidden = rail.scrollLeft >= max - 2;
    }
    function eachRail(fn) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-work-rail]'), fn);
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-work-nav]');
      if (!btn) return;
      var rail = btn.parentElement.querySelector('[data-work-rail]');
      if (!rail) return;
      var page = rail.clientWidth;
      rail.scrollBy({ left: btn.getAttribute('data-work-nav') === 'next' ? page : -page, behavior: 'smooth' });
    });
    document.addEventListener('scroll', function (e) {
      if (e.target && e.target.matches && e.target.matches('[data-work-rail]')) sync(e.target);
    }, true);
    window.addEventListener('resize', function () { eachRail(sync); });
    eachRail(sync);
    /* 圖是 lazy 載入，載完寬度才定案——第一次 sync 可能算在圖還沒撐開之前。 */
    window.addEventListener('load', function () { eachRail(sync); });

    /* 磚列自己的分頁（2026-08-28）：進行中／最近發生。
       ── 為什麼另立 data-rail-tabs 而不是沿用 data-dash-tabs ──
       下方 F6 卡片裡那組同名分頁由 index.html 的 [data-dash-tabs] 腳本管，它的做法是
       「往上找最近的 .card，切它底下的 .tab-panel」。磚列不住在 .card 裡、也沒有
       .tab-panel（切的是同一塊 DOM 的內容，不是換面板），兩件事機制不同。
       更關鍵的是**選擇器必須互不命中**：磚列這組自成一套 class（.work-rail__tab），
       點磚列的分頁會連帶切換下方表格。所以鉤子分開（data-rail-tabs／data-rail-tab），
       且這裡的委派條件寫死在 [data-rail-tabs] 之內。
       切換後一定要重算翻頁鈕：內容換了、可捲距離也換了，沿用舊的顯隱會出現
       「明明還有磚，右鈕卻是收起來的」。 */
    /* 2026-08-28：分頁由膠囊改成標題級的兩個詞（.work-rail__tab），選擇器跟著換。
       仍不與下方表格那組共用任何 class，兩者必須互不命中。 */
    function paintRailTabs(nav, btn) {
      nav.querySelectorAll('.work-rail__tab').forEach(function (t) {
        var on = t === btn;
        t.classList.toggle('work-rail__tab--active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-rail-tabs] .work-rail__tab[data-rail-tab]');
      if (!btn) return;
      var next = btn.getAttribute('data-rail-tab');
      paintRailTabs(btn.closest('[data-rail-tabs]'), btn);
      if (next === workRailGroup) return;
      workRailGroup = next;
      rerender(['work-cards']);
      eachRail(sync);
    });

    /* 磚上的三行字有兩行是**資料**不是 i18n key（作品名、類型、剩餘天數都來自 store 的
       雙語物件），applyI18n 掃 data-i18n 掃不到它們，所以換語言要整列重畫。
       比對語言碼而不是無條件重畫：applyI18n 每次套用都會發這個事件（含初次載入），
       無條件重畫等於每次都白做一次，而且會在 i18n 與元件之間來回觸發。 */
    var railLang = document.documentElement.lang || '';
    document.addEventListener('i18n:applied', function () {
      var now = document.documentElement.lang || '';
      if (now === railLang) return;
      railLang = now;
      rerender(['work-cards']);
      eachRail(sync);
    });
  })();

  /* ── 進行中那一列：置中的環狀輪播（2026-08-31 使用者裁示「置中輪播，左邊放最後
     一個」）────────────────────────────────────────────────
     為什麼不沿用磚列那套（原生捲動 ＋ scroll-snap）：環狀的列沒有「捲到底」這回事，
     而原生捲動一定有兩個端點；要偽裝成環狀就得複製節點或在端點瞬間跳位，兩種都會
     在畫面上看得出來。改成位移之後只有一件事要做——動畫結束後把第一件搬到最後
     （往回就是把最後一件搬到最前），位置歸零，等於轉了一格。

     **中間那一格是第 2 格**：渲染器把最後一件排在最前面，所以一開始置中的是第一件、
     左邊露出的是最後一件。位移的基準＝（可視區寬 − 一件寬）÷ 2 − 一件的間距。

     兩個實作要點：
       · 動畫進行中不接受下一次點擊（`data-busy`），否則會在半路上重算基準、跳一下。
       · 換語言或改視窗寬度之後要重新定位：位置是算出來的像素值，寬度變了就不對。 */
  (function () {
    function items(rail) { return rail.children; }
    function pitch(rail) {
      var a = items(rail)[0], b = items(rail)[1];
      if (!a) return 0;
      return b ? (b.getBoundingClientRect().left - a.getBoundingClientRect().left)
               : a.getBoundingClientRect().width;
    }
    function base(rail) {
      var view = rail.parentElement, a = items(rail)[0];
      if (!view || !a) return 0;
      return (view.clientWidth - a.getBoundingClientRect().width) / 2 - pitch(rail);
    }
    /* 歸位不帶動畫：讀一次 offsetHeight 逼瀏覽器把「沒有動畫的那一步」先畫完，
       否則關掉與打開 transition 之間的位移會被合併成一次帶動畫的跳動。 */
    function place(rail) {
      rail.style.transition = 'none';
      rail.style.transform = 'translateX(' + base(rail) + 'px)';
      void rail.offsetHeight;
      rail.style.transition = '';
    }
    function eachRail(fn) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-live-rail]'), fn);
    }
    /* 背景換成正中央那一件的海報：置中的永遠是第二格（第一格是它左邊那一件）。
       先把圖預載好再換，否則糊完的底圖會在載入那一刻閃一下白。 */
    function paintBg(rail) {
      var bg = document.querySelector('[data-live-bg]');
      var cur = items(rail)[1] || items(rail)[0];
      var img = cur && cur.querySelector('.live-item__poster img');
      if (!bg || !img) return;
      var src = img.getAttribute('src');
      if (!src || bg.getAttribute('data-src') === src) return;
      bg.setAttribute('data-src', src);
      bg.style.opacity = '0';
      var pre = new Image();
      pre.onload = pre.onerror = function () {
        bg.style.backgroundImage = 'url("' + src + '")';
        bg.style.opacity = '';
      };
      pre.src = src;
    }
    /* 出口跟著正中央那一件換（2026-08-31 使用者裁示「改查看更多項目，如果對應的是
       活動就寫查看更多活動」）：文字掛回 `data-i18n`，換語言時由 i18n 自己接手；
       這裡同時把當下這個語言的字寫上去，否則要等下一次語言套用才會更新。 */
    function paintMore(rail) {
      var btn = document.querySelector('[data-live-more]');
      var cur = items(rail)[1] || items(rail)[0];
      if (!btn || !cur) return;
      var ev = cur.getAttribute('data-live-kind') === 'event';
      var key = ev ? 'canvas.more.events' : 'canvas.more.projects';
      var label = btn.querySelector('[data-i18n]') || btn.firstElementChild;
      if (label) {
        label.setAttribute('data-i18n', key);
        label.textContent = canvasZh()
          ? (ev ? '查看更多活動' : '查看更多項目')
          : (ev ? 'More events' : 'More projects');
      }
      btn.setAttribute('href', ev ? 'events.html' : 'projects.html');
    }

    function step(rail, dir) {
      if (rail.getAttribute('data-busy') || items(rail).length < 2) return;
      var p = pitch(rail);
      if (!p) return;
      rail.setAttribute('data-busy', '1');
      rail.style.transform = 'translateX(' + (base(rail) - dir * p) + 'px)';
      var done = function () {
        rail.removeEventListener('transitionend', done);
        if (dir > 0) rail.appendChild(rail.firstElementChild);
        else rail.insertBefore(rail.lastElementChild, rail.firstElementChild);
        place(rail);
        paintBg(rail);
        paintMore(rail);
        rail.removeAttribute('data-busy');
      };
      rail.addEventListener('transitionend', done);
      /* 保險：`transitionend` 在偏好減少動態、或元素被重畫時可能不會來。 */
      setTimeout(function () { if (rail.getAttribute('data-busy')) done(); }, 700);
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-live-nav]');
      if (!btn) return;
      var wrap = btn.parentElement;
      var rail = wrap && wrap.querySelector('[data-live-rail]');
      if (rail) step(rail, parseInt(btn.getAttribute('data-live-nav'), 10) || 1);
    });
    function placeAll() { eachRail(function (rail) { place(rail); paintBg(rail); paintMore(rail); }); }
    placeAll();
    window.addEventListener('resize', placeAll);
    window.addEventListener('load', placeAll);
    document.addEventListener('i18n:applied', function () { setTimeout(placeAll, 0); });
    /* 側欄收合、字型換好、圖載完都會改變可視區的寬度。 */
    if (window.ResizeObserver) {
      eachRail(function (rail) {
        if (rail.parentElement) new ResizeObserver(placeAll).observe(rail.parentElement);
      });
    }
  })();

  /* ── 主色鋪底：把當前底圖的平均色寫進 `--canvas-tint`（2026-08-31 使用者裁示）──
     做法是把圖畫進 1×1 的畫布，讓瀏覽器自己做平均——一行 `drawImage` 就是全圖縮到
     一個像素，比自己掃像素快也準。同源才讀得到像素；跨源或載入失敗時什麼都不做，
     CSS 那邊會退回檯面色。
     **每張圖只算一次**（用 src 當快取鍵）：切換器滑過就換圖，不快取的話每滑過一列
     都要重新解碼一張圖。 */
  (function () {
    var tintCache = {};
    function applyTint(stage, hex) { stage.style.setProperty('--canvas-tint', hex); }
    function canvasTint() {
      var stage = document.querySelector('.canvas-stage');
      var img = stage && stage.querySelector('.canvas-stage__img');
      if (!stage || !img) return;
      var src = img.getAttribute('src');
      if (!src) return;
      if (tintCache[src]) { applyTint(stage, tintCache[src]); return; }
      var im = new Image();
      im.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = 1; c.height = 1;
          var x = c.getContext('2d');
          x.drawImage(im, 0, 0, 1, 1);
          var d = x.getImageData(0, 0, 1, 1).data;
          var hex = '#' + [d[0], d[1], d[2]].map(function (n) {
            return ('0' + n.toString(16)).slice(-2);
          }).join('');
          tintCache[src] = hex;
          applyTint(stage, hex);
        } catch (e) {}
      };
      im.src = src;
    }
    canvasTint();
    /* 舞台換圖的路徑有好幾條（滑過切換器、換語言、初次載入），盯著那一塊 DOM
       比在每一條路徑各補一次呼叫可靠。 */
    var host = document.querySelector('[data-component="canvas-stage"]');
    if (host && window.MutationObserver) {
      new MutationObserver(canvasTint).observe(host, { childList: true, subtree: true });
    }
    window.addEventListener('load', canvasTint);
  })();

  /* ── 近期收入的輪替計時器（2026-08-28 使用者裁示「每 10 秒更新一次」）─────────
     它模擬的是「收入持續進來」的即時感，**不是真的有新交易**：換上來的每一筆都
     取自既有的 8 筆（`dash-recent`），一筆新的都沒有生成（ASSUMPTIONS FEED-001）。

     ── 為什麼 offset 是往回退一格 ──
     視窗往回退，等於「比目前最上面那筆更前面的一筆」被推上頂端，其餘整批往下移、
     最末一筆退出可視範圍。讀起來就是「上面進來一筆」，這正是收入流的方向。

     ── 不會疊出多重計時器 ──
     start() 一律先 stop()，所以任何路徑（初次載入、切回前景、外部呼叫）重入
     都只會存在一個 interval。tickCount 對外可讀，驗證時可以直接數。

     ── 分頁切到背景就停 ──
     背景分頁裡輪替沒有人看得到，繼續跑只是空轉（瀏覽器也會把 interval 節流到
     每分鐘一次，回到前景時反而會補跑一串）。visibilitychange 兩邊都接：
     隱藏時停、回來時重開，回來的第一次仍要等滿 10 秒才換，不補跑。
     pagehide 一併停——bfcache 存起來的頁面不該還掛著計時器。 */
  (function () {
    var FEED_KEY = 'dash-recent-feed';
    var FEED_MS = 10000;
    var timer = null;
    var ticks = 0;

    function mounted() { return document.querySelectorAll('[data-component="earnings-feed"]').length; }

    function tick() {
      var d = DATA[FEED_KEY];
      var n = d && d.rows ? d.rows.length : 0;
      if (!n) return;
      d.offset = (((d.offset || 0) - 1) % n + n) % n;
      /* 輪進頂端的那一筆，在這個原型的設定裡就是「剛進帳的一筆」，所以蓋上當下
         時間。少了這一步，輪替會把 11:46 的今天那筆推到「Nov 19」下面，一欄
         號稱由新到舊的清單自己打自己的臉。時戳一旦蓋上就不再變，往下推的時候
         仍然照時間排在正確的位置。 */
      var top = d.rows[d.offset];
      if (top && top.titleKey && !d.stamps[top.titleKey]) d.stamps[top.titleKey] = Date.now();
      d.entering = true;
      rerender(['earnings-feed']);
      d.entering = false;          // 只有輪替那一次帶進場動畫；別的原因重畫不播
      ticks++;
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();                                        // 永遠先關再開 ⇒ 不可能同時有兩個
      if (document.visibilityState === 'hidden') return;
      if (!mounted()) return;                        // 沒有這塊的頁面完全不起計時器
      timer = setInterval(tick, FEED_MS);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') stop(); else start();
    });
    window.addEventListener('pagehide', stop);

    /* 這一欄現在會捲（2026-08-31）。兩件事因此必須接：
       ① 捲到底就把底部漸消關掉——漸消是「下面還有」的訊號，捲完了還留著，
          最後一筆會永遠是半透明的、讀起來像沒載完。scroll 不冒泡，所以用捕獲。
       ② 指標在這一欄裡時停止輪替——正在讀（或正在捲）的時候把整份內容換掉，
          讀者會當場失去位置。移開就恢復，回到原本的 10 秒節奏。 */
    /* 兩個可捲＋底部漸消的區塊共用這一段（收入欄、展示版的海報牆）：
       規則相同（捲到底就把漸消關掉），沒有理由寫兩份。 */
    var FADE_SCROLLERS = 'earnings-feed'.split(' ');
    function markEnd(el) {
      /* 捕獲式監聽會收到 document 與 window 的捲動事件，兩者都沒有 classList。 */
      if (!el || !el.classList) return;
      if (!FADE_SCROLLERS.some(function (c) { return el.classList.contains(c); })) return;
      var atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      el.classList.toggle('is-at-end', atEnd);
    }
    document.addEventListener('scroll', function (e) { markEnd(e.target); }, true);
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest('.earnings-feed')) stop();
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.target.closest || !e.target.closest('.earnings-feed')) return;
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.earnings-feed')) return;
      start();
    });

    start();

    /* 對外只為了驗證與外部重掛（例如日後有頁面動態插入這塊）：
       running 回報現在有沒有計時器、ticks 回報換過幾輪。 */
    window.ZtorEarningsFeed = {
      start: start,
      stop: stop,
      running: function () { return !!timer; },
      ticks: function () { return ticks; },
      /* 今日進帳＝標了「今天」的那幾筆金額合計（展示版頂列在用）。
         金額欄是字串（'+US$1,890.00'），這裡只把數字挖出來加總，
         幣別沿用第一筆的前綴——原型全站單一幣別，不在這裡處理換匯。 */
      todayTotal: function () {
        var d = DATA['dash-recent-feed'], rows = (d && d.rows) || [], sum = 0, cur = '';
        rows.forEach(function (r) {
          var isToday = typeof r.todayMinsAgo === 'number' || (d.stamps && d.stamps[r.titleKey]);
          if (!isToday) return;
          var m = String(r.amount || '').match(/([^\d]*)([\d,.]+)/);
          if (!m) return;
          if (!cur) cur = m[1].replace('+', '');
          sum += parseFloat(m[2].replace(/,/g, '')) || 0;
        });
        if (!sum) return '';
        return '+' + cur + sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    };
  })();

  /* ── 展示版左欄第一格的輪播（2026-08-31）──────────────────────
     節奏比收入欄慢（8 秒 vs 10 秒）但規則完全相同：先 stop 再 start、頁面隱藏就停、
     pagehide 一併停、沒有這一格的頁面完全不起計時器。指標停在上面時暫停——
     它是一張要讀的卡，讀到一半被換掉沒有道理。 */
  (function () {
    var MS = 8000, timer = null, ticks = 0;
    function el() { return document.querySelector('[data-component="kpi-rotator"]'); }
    function tiles() { return (DATA['canvas-kpi-rotator'].slides || []).length; }
    function tick() {
      var n = tiles();
      if (n < 2) return;
      canvasRotatorIndex = (canvasRotatorIndex + 1) % n;
      rerender(['kpi-rotator']);
      ticks++;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (document.visibilityState === 'hidden') return;
      if (!el() || tiles() < 2) return;
      timer = setInterval(tick, MS);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') stop(); else start();
    });
    window.addEventListener('pagehide', stop);
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest('.kpi-rotator')) stop();
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.target.closest || !e.target.closest('.kpi-rotator')) return;
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.kpi-rotator')) return;
      start();
    });
    /* 標題旁那顆箭頭：往下一張。點了之後把計時器重開，讓自己動的那一輪從現在
       重新計時——不重開的話，剛按完可能隔 0.5 秒就自己又跳一張。 */
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-kpi-nav]');
      if (!b) return;
      e.preventDefault();
      var n = tiles();
      if (n < 2) return;
      var step = b.getAttribute('data-kpi-nav') === 'prev' ? -1 : 1;
      canvasRotatorIndex = ((canvasRotatorIndex + step) % n + n) % n;
      rerender(['kpi-rotator']);
      start();
    });

    start();
    window.ZtorKpiRotator = {
      start: start, stop: stop,
      running: function () { return !!timer; },
      ticks: function () { return ticks; },
      index: function () { return canvasRotatorIndex; }
    };
  })();

  /* 換語言要把展示版這幾塊重畫一次（2026-08-31 修，使用者回報「這區塊的英文語系
     沒做」）：它們的字是渲染當下用 `canvasZh()` 從 store 挑出來的（作品名、類型、
     單位詞、倒數），不是掛 `data-i18n` 的靜態標籤——`applyI18n` 掃不到，換了語言
     它們會停在上一次渲染的那一種。重畫的範圍只限這一頁自己的四個渲染器。
     **事件是 `i18n:applied`，不是 `ztor:langchange`**：後者站上沒有任何地方發
     （home-canvas.html 的頂列本來也掛在它上面，一起改掉了）。
     比對語言碼而不是無條件重畫：`applyI18n` 每次套用都會發這個事件（含初次載入
     與 `rerender` 自己呼叫的那一次），無條件重畫會在 i18n 與元件之間來回觸發。 */
  var canvasLang = document.documentElement.lang || '';
  document.addEventListener('i18n:applied', function () {
    var now = document.documentElement.lang || '';
    if (now === canvasLang) return;
    canvasLang = now;
    rerender(['work-rows', 'live-cards', 'canvas-stage', 'canvas-overlay', 'canvas-picks', 'kpi-rotator']);
  });

  /* 滑過切換器就換底圖（2026-08-31 使用者裁示「這些選項是 hover 上去就換背景」）：
     選一件作品這件事本來要點兩下（先點著、再點進去），改成滑過即換之後，點擊就
     專心做一件事——前往。這也是為什麼已選的那一列一直掛著「前往」。
     只在索引真的變了才重畫：滑鼠在同一列裡移動會連續觸發，不擋的話每一次移動都
     重建一次 DOM。重畫的範圍只有底圖與切換器本身。 */
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('[data-canvas-pick]');
    if (!t) return;
    var next = parseInt(t.getAttribute('data-canvas-pick'), 10) || 0;
    if (next === canvasPick) return;
    canvasPick = next;
    rerender(['canvas-stage', 'canvas-picks']);
  });

  /* 大畫布的模式切換與類型篩選（2026-08-31）：委派一次，兩種控制共用。
     狀態存在模組變數、由 rerender 重畫整塊——篩選要動的是每一張磚的 class，
     逐張改比重畫一次還多事，而且會與「切模式時整塊換掉」走兩套路徑。 */
  /* 進行中的四組：標題旁的左右箭頭一次走一組（2026-08-31 由分頁列改成箭頭）。
     兩顆而不是一顆：一顆只能往前，走過頭要繞一圈才回得來——與收入分布那一格
     同一個判斷。頭尾相接（環狀），四組隨便從哪一組都走得完。
     不自動輪播：全站只能有一個東西在自己動，那個名額在收入分布那一格。 */
  document.addEventListener('click', function (e) {
    var st = e.target.closest && e.target.closest('[data-work-step]');
    if (st) {
      e.preventDefault();
      var step = parseInt(st.getAttribute('data-work-step'), 10) || 1;
      var at = 0;
      for (var wi = 0; wi < CANVAS_WORK_TABS.length; wi++) {
        if (CANVAS_WORK_TABS[wi].k === canvasWorkTab) { at = wi; break; }
      }
      var n = CANVAS_WORK_TABS.length;
      canvasWorkTab = CANVAS_WORK_TABS[(at + step + n) % n].k;
      rerender(['work-rows']);
      return;
    }
    var t = e.target.closest && e.target.closest('[data-canvas-pick]');
    if (!t) return;
    e.preventDefault();
    var pk = t.getAttribute('data-canvas-pick');
    if (pk !== null) {
      var next = parseInt(pk, 10) || 0;
      /* 點的是已經選中的那一列＝前往（2026-08-31 使用者裁示，與該列 hover 時
         名稱前面長出的「前往」對上）：再選一次什麼都不會發生，那一刻唯一還有
         意義的動作是進到它的頁面。 */
      if (next === canvasPick) {
        var cur = canvasCurrent();
        if (cur && cur.cur && cur.cur.go) { location.href = cur.cur.go; return; }
      }
      canvasPick = next;
    }
    rerender(['canvas-stage', 'canvas-overlay', 'canvas-picks']);
  });

  /* Alert 卡整卡可點（data-go，2026-07-27）：委派一次、F4 與 F2 popup 共用。
     內部 <a>（CTA 文字連結）走原生導航、不重複處理；disabled 按鈕（blocking 卡的
     lock 關閉鈕）不觸發；chevron「Open」鈕落入整卡導航。Enter＝鍵盤等價。 */
  document.addEventListener('click', function (e) {
    var card = e.target.closest && e.target.closest('[data-go]');
    if (!card) return;
    if (e.target.closest('a')) return;
    var btn = e.target.closest('button');
    if (btn && btn.disabled) return;
    location.href = card.getAttribute('data-go');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var card = e.target && e.target.closest && e.target.closest('[data-go]');
    if (card && e.target === card) location.href = card.getAttribute('data-go');
  });

  /* ── 待處理事項面板的兩層開合（2026-08-28）────────────────────────────
     面板層與事項卡層共用同一個委派處理器：按鈕自己帶 aria-controls 指向要收起的
     那一段，處理器只做「翻轉 aria-expanded、同步目標的 hidden」。
     用委派而不是逐顆綁：軟關會整塊重畫，重畫後新的按鈕不必再綁一次。
     鍵盤：兩層都是原生 <button>，Tab 走得到、Enter／Space 觸發 click，不必另外處理。 */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.issue-panel__toggle, .issue-card__toggle');
    if (!btn) return;
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    target.hidden = !open;
  });

  /* KPI 計數卡 → 頁內面板（2026-08-28）：捲過去並把焦點交給面板，
     讀屏與鍵盤使用者才知道「畫面剛剛換到哪裡」——只捲不移焦點的話，
     下一次 Tab 會從原本的 KPI 卡繼續走，人在面板、焦點還在上面。
     找不到目標就不動作：同一支渲染器也餵沒有面板的 docs/ 探索稿。 */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-focus]');
    if (!btn) return;
    var target = document.getElementById(btn.getAttribute('data-focus'));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  });

  /* ── 軟關（Snooze）· spec 5.1.1 §F4 ──────────────────────────────────
     資訊型可軟關，約 7 天後自動重新浮現並留痕。原型層級：把該筆標成 snoozed
     （沉到清單底、視覺降階、退出 F2 計數），並在 meta 尾巴留下狀態痕跡。
     重新浮現的排程屬後端行為，原型不模擬時間流逝。
     重繪範圍只限 alerts 與 ops-summary 兩種佔位，不整頁 remount——
     其他區塊（分頁內的動態清單等）沒有理由跟著重畫。 */
  function rerender(names) {
    var sel = names.map(function (n) { return '[data-component="' + n + '"]'; }).join(',');
    document.querySelectorAll(sel).forEach(function (el) {
      var fn = RENDERERS[el.getAttribute('data-component')];
      var key = el.getAttribute('data-key');
      if (fn) el.innerHTML = fn(key ? (DATA[key] || {}) : {});
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-snooze]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();                       // 不要觸發整卡導航
    var id = btn.getAttribute('data-snooze');
    DATA['dash-alerts'].items.forEach(function (a) {
      if (a.id !== id) return;
      a.snoozed = true;
      a.metaKey = '';                          // 狀態文字改由此處接管，脫離原 i18n key
      a.meta = String(a.meta || '').replace(/·\s*(Open|In progress)\b/i, '· Snoozed');
    });
    DATA['ops-pending-list'].items = DATA['dash-alerts'].items.filter(function (a) { return !a.snoozed; });
    syncPendingTile();
    /* issue-panel 一併重畫（2026-08-28）：軟關那一則要沉到組底並降階，
       組上的筆數與面板總筆數也要跟著改。 */
    rerender(['alerts', 'ops-summary', 'issue-panel']);
  }, true);                                    // capture：搶在 data-go 的整卡導航之前

  /* 換語言後副標要用新語言重算（它不走 data-i18n，applyI18n 不會碰它） */
  document.addEventListener('i18n:applied', function () {
    var tile = DATA['dash-ops'].tiles.filter(function (t) { return t.open === 'ops-pending'; })[0];
    if (!tile) return;
    var next = pendingMetaText();
    if (tile.meta && tile.meta.text === next) return;   // 沒變就不重畫，避免與 applyI18n 互相觸發
    tile.meta = { text: next };
    rerender(['ops-summary']);
  });

  /* sparkBlock 對外開放（2026-08-31）：項目詳情的支持者 KPI 也要畫同一種走勢圖。
     不開放的話那一頁只能再抄一份畫線邏輯，正是本檔上面那段註解警告的「兩邊各寫一份遲早分岔」。 */
  window.ZtorComponents = { mount: mount, RENDERERS: RENDERERS, DATA: DATA, rerender: rerender, sparkBlock: sparkBlock };
})();
