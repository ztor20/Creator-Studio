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
  function earningsFeedItem(r, entering) {
    var cls = 'earnings-feed__item' + (entering ? ' earnings-feed__item--enter' : '');
    var amtCls = 'earnings-feed__amount' + (r.neg ? ' earnings-feed__amount--neg' : '');
    return '<div class="' + cls + '">'
      +   '<div class="earnings-feed__name"' + di18n(r.titleKey) + '>' + s(r.title) + '</div>'
      +   '<div class="' + amtCls + '">' + s(r.amount) + '</div>'
      +   '<div class="earnings-feed__meta">'
      +     '<i data-lucide="' + s(r.icon) + '" class="ztor-icon earnings-feed__icon" aria-hidden="true"></i>'
      +     '<span class="earnings-feed__src"' + di18n(r.srcKey) + '>' + s(r.src) + '</span>'
      +     '<span class="earnings-feed__time"' + di18n(r.timeKey) + '>' + s(r.time) + '</span>'
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
    var spark = '';
    if (t.spark && t.spark.values && t.spark.values.length) {
      var sk = t.spark;
      var yT = sk.yTicks || [];
      var withV = yT.filter(function (k) { return k.v != null; });
      var H = sk.detail ? 76 : 30;
      var sp = sparkPaths(sk.values, {
        h: H,
        max: withV.length ? withV[0].v : null,
        min: withV.length ? withV[withV.length - 1].v : null
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
      spark = '<div class="sparkline' + (sk.detail ? ' sparkline--detail' : '') + '" aria-hidden="true">'
        + '<div class="sparkline__plot">'
        + '<div class="sparkline__main">'
        + '<div class="sparkline__canvas">'
        + '<svg class="sparkline__svg" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none">'
        + svg + '</svg>' + marks + '</div>' + axisX + '</div>'
        + axisY + '</div></div>';
    }

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
  /* 徽章的染色沿用 badge.css 的語意變體，本檔不另造色票（Q77 表面律：
     嚴重度只上徽章這種小面積標記，不鋪進事項卡的面）。 */
  var ISSUE_BADGE = { error: 'badge--error', warning: 'badge--warning', info: 'badge--info' };

  function issueDetail(d) {
    return '<div class="issue-detail">'
      + '<div class="issue-detail__name"' + di18n(d.nameKey) + '>' + s(d.name) + '</div>'
      + (d.sub ? '<div class="issue-detail__sub"' + di18n(d.subKey) + '>' + s(d.sub) + '</div>' : '')
      + '</div>';
  }

  function issueCard(a) {
    var details = a.details || [];
    var bodyId = 'issue-body-' + s(a.id);
    /* 右側次要動作三態，與 alertCard 同一套規則（spec §F4「處理狀態」）：
         阻斷型 → 鎖頭 disabled（只能在來源模組解決）
         資訊型 → 暫緩（軟關，約 7 天後重新浮現）
         其餘   → 不放鈕（下一步已經在展開後的那一行裡） */
    var aside = a.blocking
      ? '<span class="issue-card__aside"><button class="btn btn--icon btn--xs" type="button" disabled aria-label="Resolve in source module" title="Resolve in the source module"><i data-lucide="lock" class="ztor-icon"></i></button></span>'
      : (a.variant === 'info' && !a.snoozed)
      ? '<span class="issue-card__aside"><button class="btn btn--icon btn--xs" type="button" data-snooze="' + s(a.id) + '" aria-label="Snooze" title="Snooze — reappears in about 7 days"><i data-lucide="clock" class="ztor-icon"></i></button></span>'
      : '';
    var badgeCls = 'badge issue-card__count ' + (ISSUE_BADGE[a.variant] || 'badge--neutral');
    return '<div class="issue-card' + (a.snoozed ? ' issue-card--snoozed' : '') + '">'
      + '<div class="issue-card__head">'
      +   '<button class="issue-card__toggle" type="button" aria-expanded="false" aria-controls="' + bodyId + '">'
      +     '<span class="' + badgeCls + '">' + details.length + '</span>'
      +     '<span class="issue-card__title"' + di18n(a.titleKey) + '>' + s(a.title) + '</span>'
      +     '<span class="issue-card__ago"' + di18n(a.agoKey) + '>' + s(a.ago) + '</span>'
      +     '<span class="issue-card__chev"><i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm"></i></span>'
      +   '</button>'
      +   aside
      + '</div>'
      + '<div class="issue-card__body" id="' + bodyId + '" hidden>'
      +   '<div class="issue-card__details">' + details.map(issueDetail).join('') + '</div>'
      +   '<div class="issue-card__next">'
      +     '<span class="issue-card__next-label" data-i18n="issue.next">Next step</span>'
      +     '<a class="issue-card__next-link" href="' + s(a.ctaHref) + '"' + di18n(a.ctaKey) + '>' + s(a.cta) + '</a>'
      +   '</div>'
      + '</div>'
      + '</div>';
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
    /* 筆數一律只算「還需要處理的」（排除已軟關），面板總數與每組的數字都照這個口徑——
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
        +   '<span class="badge badge--neutral issue-group__count">' + list.filter(isLive).length + '</span>'
        + '</div>'
        + '<div class="issue-group__list">' + list.map(issueCard).join('') + '</div>'
        + '</section>';
    }).join('');
    return '<div class="issue-panel__head">'
      + '<button class="issue-panel__toggle" type="button" aria-expanded="true" aria-controls="issue-panel-groups">'
      +   '<span class="issue-panel__title" data-i18n="ops.pending">Pending actions</span>'
      +   '<span class="badge badge--neutral issue-panel__count">' + items.filter(isLive).length + '</span>'
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
        out += earningsFeedItem(rows[(off + i) % n], i === 0 && !!d.entering);
      }
      return '<div class="earnings-feed">' + out + '</div>';
    },
    'ops-summary':      function (d) { return (d.tiles || []).map(kpiTile).join(''); },
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
    'ext-data-status':  function (d) { return '<div class="data-list">' + (d.rows || []).map(extRow).join('') + '</div>'; },
    'insight-split':    insightSplit
  };

  /* ===========================================================
     Datasets (single source of truth)
     =========================================================== */

  // Shared transaction-row library — defined once, composed per page.
  var TX = {
    preorder:  { icon: 'receipt',   iconVariant: 'success', titleKey: 'tx.preorder.title',  title: '<em>LOVE RAGE HOPE</em> vinyl · 47 supporters', img: 'images/projects/nick-lrh.jpg', metaKey: 'tx.preorder.meta',  meta: 'Project support · 2 hours ago', srcKey: 'tx.preorder.src', src: 'Pre-order sales', timeKey: 'tx.preorder.time', time: '2 hours ago',             amount: '+US$1,410.00',           status: { key: 'status.pending',   fallback: 'Pending',   variant: 'neutral' } },
    spotify:   { icon: 'play',      iconVariant: 'info',    titleKey: 'tx.spotify.title',   title: '<em>REAL LIFE</em> (Q4 statement)',             img: 'images/projects/nick-real-life.jpg', metaKey: 'tx.spotify.meta',   meta: 'Platform / streaming royalties · Yesterday', srcKey: 'tx.spotify.src', src: 'Streaming royalty', timeKey: 'tx.spotify.time', time: 'Yesterday', amount: '+US$684.32',            status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    merch:     { icon: 'package',                           titleKey: 'tx.merch.title',     title: '<em>Pirate Queen zine vol. 02</em> × 14',               img: 'images/products/tour-zine-vol-02.webp', metaKey: 'tx.merch.meta',     meta: 'E-Shop sales · Nov 22', srcKey: 'tx.merch.src', src: 'E-Shop sales', timeKey: 'tx.merch.time', time: 'Nov 22',                     amount: '+US$392.00',            status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
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
    rows: DATA['dash-recent'].rows,
    limit: 5,
    offset: 0,
    entering: false
  };

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

    start();

    /* 對外只為了驗證與外部重掛（例如日後有頁面動態插入這塊）：
       running 回報現在有沒有計時器、ticks 回報換過幾輪。 */
    window.ZtorEarningsFeed = {
      start: start,
      stop: stop,
      running: function () { return !!timer; },
      ticks: function () { return ticks; }
    };
  })();

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

  window.ZtorComponents = { mount: mount, RENDERERS: RENDERERS, DATA: DATA, rerender: rerender };
})();
