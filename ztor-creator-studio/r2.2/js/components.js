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
  function tableWrap(headCells, bodyRows, mod) {
    return '<div class="ztor-table-scroll"><table class="ztor-table' + (mod ? ' ' + mod : '') + '"><thead><tr>'
      + headCells + '</tr></thead><tbody>' + bodyRows + '</tbody></table></div>';
  }
  function th(key, label, extra) { return '<th' + (extra || '') + di18n(key) + '>' + label + '</th>'; }

  // F2 — operations summary KPI tile. delta + metaLink can coexist (e.g. Total revenue shows a
  // week-over-week delta with freshness AND a deep-link into Earnings, spec 5.1.1 §F2). delta.neg
  // flips to the down/negative style (.kpi__delta--neg); divide-by-zero "new" is runtime logic.
  function kpiTile(t) {
    var sub = '';
    if (t.delta) sub += '<div class="kpi__delta' + (t.delta.neg ? ' kpi__delta--neg' : '') + '"' + di18n(t.delta.key) + '>' + s(t.delta.text) + '</div>';
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
    var inner = chev + topLink
      + '<div class="kpi__label"' + di18n(t.labelKey) + '>' + s(t.label) + '</div>'
      + '<div class="kpi__value">' + s(t.value) + '</div>'
      + sub;
    /* t.hero = 這一列的主角數字（.kpi--hero → 整張卡實色橘）。一列只給一個。
       t.accent = 只把數字染成 --brand-ink 橘、底色維持一般（
       墨色一律走 --brand-ink，不得 var(--primary)，見 STYLE-DECISIONS Q8）。
       t.span = 欄寬（預設 4；V3 一排四塊時給 3）。 */
    var mods = (t.hero ? ' kpi--hero' : '')
      + (t.accent ? ' kpi--accent' : '')
;
    var span = ' bento--span-' + (t.span || 4);
    if (t.open) return '<button type="button" class="kpi kpi--tappable' + span + mods + '" data-bd-open="' + t.open + '">' + inner + '</button>';
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
    'ops-summary':      function (d) { return (d.tiles || []).map(kpiTile).join(''); },
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
      { labelKey: 'ops.revenue',  label: 'Total revenue',   value: '$24,830', hero: true, delta: { key: 'ops.revenue-delta', text: '+12.6% vs last week' }, metaLink: { href: 'earnings.html', key: 'ops.revenue-meta', text: 'Updated 2h ago · view in Earnings' } },
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
    'dash-alerts': { items: [
      { variant: 'warning', icon: 'alert-triangle-fill', titleKey: 'alert.ip-rental.title', title: 'IP rental expires in 6 days',     descKey: 'alert.ip-rental.desc', desc: '<em>Dragon Tiger Gate key art</em> brand license expires May 25. Renew or release before expiry to avoid breach.',     metaKey: 'alert.ip-rental.meta', meta: 'Warning · My IP · In progress', ctaKey: 'alert.ip-rental.cta', cta: 'Renew',              ctaHref: 'my-ip.html?ip=neon-tide#rented', id: 'ip-rental', kind: 'expiring', src: 'my-ip', srcKey: 'nav.my-ip' },
      { variant: 'error',   icon: 'x-circle-fill',       titleKey: 'alert.stock.title',     title: 'Low stock · 3 items',             descKey: 'alert.stock.desc',     desc: '<em>Pirate Queen zine vol. 02</em>, <em>Kowloon After Dark tee (S)</em>, and the Mong Kok Sniper concept poster are below restock threshold.',   metaKey: 'alert.stock.meta',     meta: 'Critical · E-Shop · Open',      ctaKey: 'alert.stock.cta',     cta: 'Restock',            ctaHref: 'e-shop.html?status=low', id: 'low-stock', kind: 'lowstock', src: 'e-shop', srcKey: 'nav.e-shop' },
      { variant: 'warning', icon: 'alert-triangle-fill', titleKey: 'alert.event.title',     title: 'Event pre-flight incomplete',     descKey: 'alert.event.desc',     desc: '<em>REALIVE World Tour (China) — Chongqing · Oct 25</em> still needs refund policy and on-site staffing confirmed.',                 metaKey: 'alert.event.meta',     meta: 'Warning · Events · Open',       ctaKey: 'alert.event.cta',     cta: 'Complete checklist', ctaHref: 'event-detail.html?id=realive-chongqing#overview', id: 'event-preflight', kind: 'review', src: 'events', srcKey: 'nav.events' },
      // Blocking (compliance) — resolvable only in its source module; close control is disabled (spec §F4).
      { variant: 'error',   icon: 'lock',                blocking: true, titleKey: 'alert.payout-block.title', title: 'Payouts on hold — tax form required', descKey: 'alert.payout-block.desc', desc: 'A W-8/W-9 tax form is required before any withdrawal can be released. Resolve in Settings.',  metaKey: 'alert.payout-block.meta', meta: 'Critical · Settings · Open · Blocking', ctaKey: 'alert.payout-block.cta', cta: 'Add tax form',  ctaHref: 'settings.html#tax', id: 'payout-tax', kind: 'blocking', src: 'settings', srcKey: 'nav.settings' },
      // Info-type item — the only kind the spec lets the creator soft-close (§F4). Shipped as
      // Open, not pre-snoozed: until 2026-08-19 this row was hardcoded snoozed:true, which meant
      // the snooze CONTROL never rendered anywhere and the whole soft-close path was unreachable.
      // Snoozing it now is a live action — the card recedes, sinks to the bottom, and F2's count drops.
      { variant: 'info',    icon: 'info-fill',           titleKey: 'alert.spotify.title',   title: 'SPOTIFY sync stopped',            descKey: 'alert.spotify.desc',   desc: 'Spotify is an official ztor integration — we\u2019re fixing it. Upload an export if you need the figures now.',            metaKey: 'alert.spotify.meta',   meta: 'Info · Fan analytics · Open', ctaKey: 'alert.spotify.cta',   cta: 'Upload data',        ctaHref: 'fan-analytics.html', id: 'spotify-sync', kind: 'info', src: 'fan-analytics', srcKey: 'nav.fans' }
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
     來源模組篩選由 index/demo 頁的 popup wiring 負責（data-todo-src）。 */
  DATA['ops-todo-all'] = { items: DATA['dash-alerts'].items, limit: 0 };

  /* 只取阻斷型（2026-08-19 使用者裁決）：告警是例外狀態，讓它獨佔第一屏最大的
     區塊等於為異常設計版面——實測 534px，是 KPI 那排的 3.6 倍、吃掉第一屏 53%。
     改成份量跟著嚴重度走：會擋錢的（阻斷型）留卡片形態在第一屏，其餘收成一行
     摘要導向完整視圖。沒有阻斷型的日子，這個資料集是空的、整塊自然不佔位。
     用 getter 而非快照：軟關會改寫 dash-alerts，取值時才過濾才不會落後。 */
  /* F3 的側欄版（2026-08-19）：同一批已結算收入，只是不走表格密度——
     卡片降到 span-4 之後表格欄位會擠成多行。table:false 走 data-list 列格式
     （名稱／來源·日期／金額），資料與 dash-recent 完全同一份、不另存。 */
  Object.defineProperty(DATA, 'dash-recent-compact', {
    get: function () { return { rows: DATA['dash-recent'].rows, hideStatus: true }; }
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
        { span: 3, accent: true, plainMeta: true,
          labelKey: 'ops.revenue', label: 'Total revenue', value: '$24,830',
          delta: { key: 'ops.revenue-delta', text: '+12.6% vs last week' },
          meta: { key: 'ops.revenue-since', text: 'Updated 2h ago' },
          topLink: { href: 'earnings.html', key: 'ops.revenue-link', text: 'View in Earnings' } },
        { span: 3, labelKey: pending.labelKey, label: pending.label, value: pending.value,
          meta: pending.meta, open: 'ops-pending' },
        { span: 3, labelKey: projects.labelKey, label: projects.label, value: projects.value,
          meta: projects.meta, open: 'ops-projects' },
        { span: 3, labelKey: 'dash.tiers.title', label: 'Fans on Ztor', value: '1,283',
          meta: { key: 'ops.fans-meta', text: 'Inner Circle 12% · Superfan 28%' },
          open: 'fans-tiers' }
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
    rerender(['alerts', 'ops-summary']);
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
