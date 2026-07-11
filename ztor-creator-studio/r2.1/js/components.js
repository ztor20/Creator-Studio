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
   .stickynote exist when reveal sets up its IntersectionObserver).
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

  // F2 — operations summary KPI tile. delta + metaLink can coexist (e.g. Total revenue shows a
  // week-over-week delta with freshness AND a deep-link into Earnings, spec 5.1.1 §F2). delta.neg
  // flips to the down/negative style (.kpi__delta--neg); divide-by-zero "new" is runtime logic.
  function kpiTile(t) {
    var sub = '';
    if (t.delta) sub += '<div class="kpi__delta' + (t.delta.neg ? ' kpi__delta--neg' : '') + '"' + di18n(t.delta.key) + '>' + s(t.delta.text) + '</div>';
    if (t.metaLink) sub += '<div class="kpi__meta"><a class="card__link" href="' + t.metaLink.href + '"' + di18n(t.metaLink.key) + '>' + s(t.metaLink.text) + '</a></div>';
    else if (!t.delta && t.meta) sub += '<div class="kpi__meta"' + di18n(t.meta.key) + '>' + s(t.meta.text) + '</div>';
    return '<div class="kpi bento--span-4">'
      + '<div class="kpi__label"' + di18n(t.labelKey) + '>' + s(t.label) + '</div>'
      + '<div class="kpi__value">' + s(t.value) + '</div>'
      + sub + '</div>';
  }

  // F4 — alert / action card. Processing state lives in a.meta (severity · object · Open/In progress/Snoozed).
  // a.snoozed = soft-closed info item (muted, reappears ~7d, spec 5.1.1 §F4); a.blocking = compliance-type
  // item that can only be resolved in its source module → the close control is disabled (locked).
  function alertCard(a) {
    var close = a.blocking
      ? '<button class="alert__close btn btn--icon btn--xs" type="button" disabled aria-label="Resolve in source module" title="Resolve in the source module"><i data-lucide="lock" class="ztor-icon"></i></button>'
      : '<button class="alert__close btn btn--icon btn--xs" type="button" aria-label="Open"><i data-lucide="chevron-right" class="ztor-icon"></i></button>';
    return '<div class="alert alert--card alert--' + a.variant + (a.snoozed ? ' alert--snoozed' : '') + '">'
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
      +   '<a class="data-list__go" href="' + r.go + '" aria-label="Open"><i data-lucide="chevron-right" class="ztor-icon"></i></a>'
      + '</div>'
      + '</div>';
  }

  // F8 — external data-status row: brand chip · platform · type·sync / impact · status badge + optional Settings CTA.
  function extRow(r) {
    var L = r.logo || {};
    var style = 'font-weight: var(--fw-bold);font-size:' + (L.fs || 'var(--fs-13)') + ';';
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
        + '<span style="font-weight: var(--fw-medium)">' + s(t.rev) + '</span></div>';
    }).join('');
    var plats = (a.platforms || []).map(function (p) {
      var val = p.muted
        ? '<span class="text-sub"' + di18n(p.valKey) + '>' + s(p.val) + '</span>'
        : '<span style="font-weight: var(--fw-medium)">' + s(p.val) + '</span>';
      return '<div style="display:grid;grid-template-columns:1fr auto;gap:8px"><span>' + s(p.name) + '</span>' + val + '</div>';
    }).join('');
    var fansCol = '<div class="insight-split__col">'
      + '<div class="insight-eyebrow"><span' + di18n(f.eyebrowKey) + '>' + s(f.eyebrow) + '</span>'
      +   '<span class="insight-eyebrow__src"' + di18n(f.syncKey) + '>' + s(f.sync) + '</span></div>'
      + '<div class="kpi__value" style="margin-bottom:4px">' + s(f.value) + '</div>'
      + '<div class="text-sub" style="font-size: var(--fs-12);margin-bottom:14px"' + di18n(f.subKey) + '>' + s(f.sub) + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;font-family:var(--font-ui);font-size: var(--fs-12)">' + tiers + '</div>'
      + '<div class="stickynote mt-16"><span class="stickynote__mark">⚐</span>'
      +   '<span' + di18n(f.warnKey) + '>' + s(f.warn) + '</span></div>'
      + '<div class="mt-16"><a class="card__link" href="' + f.linkHref + '"' + di18n(f.linkKey) + '>' + s(f.link) + '</a></div>'
      + '</div>';
    var audCol = '<div class="insight-split__col">'
      + '<div class="insight-eyebrow"><span' + di18n(a.eyebrowKey) + '>' + s(a.eyebrow) + '</span>'
      +   '<span class="insight-eyebrow__src"' + di18n(a.syncKey) + '>' + s(a.sync) + '</span></div>'
      + '<div class="kpi__value" style="margin-bottom:4px">' + s(a.value) + '</div>'
      + '<div class="text-sub" style="font-size: var(--fs-12);margin-bottom:14px"' + di18n(a.leadKey) + '>' + s(a.lead) + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:10px;font-family:var(--font-ui);font-size: var(--fs-13)">' + plats + '</div>'
      + '<div class="text-sub" style="font-size: var(--fs-11);margin-top:14px"><span' + di18n(a.noteKey) + '>' + s(a.note) + '</span> '
      +   '<a class="card__link" href="' + a.fixHref + '"' + di18n(a.fixKey) + '>' + s(a.fix) + '</a></div>'
      + '</div>';
    return fansCol + audCol;
  }

  var RENDERERS = {
    'transaction-list': function (d) { var hide = d.hideStatus; return '<div class="data-list">' + (d.rows || []).map(function (r) { return txRow(r, hide); }).join('') + '</div>'; },
    'ops-summary':      function (d) { return (d.tiles || []).map(kpiTile).join(''); },
    'alerts':           function (d) { return (d.items || []).map(alertCard).join(''); },
    'activity-list':    function (d) { return '<div class="data-list">' + (d.rows || []).map(activityRow).join('') + '</div>'; },
    'events-projects':  function (d) { return '<div class="data-list">' + (d.rows || []).map(eventProjectRow).join('') + '</div>'; },
    'ext-data-status':  function (d) { return '<div class="data-list">' + (d.rows || []).map(extRow).join('') + '</div>'; },
    'insight-split':    insightSplit
  };

  /* ===========================================================
     Datasets (single source of truth)
     =========================================================== */

  // Shared transaction-row library — defined once, composed per page.
  var TX = {
    preorder:  { icon: 'receipt',   iconVariant: 'success', titleKey: 'tx.preorder.title',  title: 'Pre-order · <em>Coastline EP</em> · 47 supporters',         metaKey: 'tx.preorder.meta',  meta: 'Project support · 2 hours ago',             amount: '+US$1,410.00',           status: { key: 'status.pending',   fallback: 'Pending',   variant: 'neutral' } },
    spotify:   { icon: 'play',      iconVariant: 'info',    titleKey: 'tx.spotify.title',   title: 'Streaming royalty · Spotify (Q4 statement)',                metaKey: 'tx.spotify.meta',   meta: 'Platform / streaming royalties · Yesterday', amount: '+US$684.32',            status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    merch:     { icon: 'package',                           titleKey: 'tx.merch.title',     title: 'Merch sale · <em>Tour zine vol. 02</em> × 14',              metaKey: 'tx.merch.meta',     meta: 'E-Shop sales · Nov 22',                     amount: '+US$392.00',            status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    licensing: { icon: 'file-text',                         titleKey: 'tx.licensing.title', title: 'Licensing · <em>Late Bloom</em> story world → Studio Yiu',  metaKey: 'tx.licensing.meta', meta: 'Licensing · Nov 20',                        amount: '+US$2,400.00',          status: { key: 'status.available', fallback: 'Available', variant: 'info' } },
    tickets:   { icon: 'ticket',                            titleKey: 'tx.tickets.title',   title: 'Event tickets · <em>Spring Launch</em> show × 38',          metaKey: 'tx.tickets.meta',   meta: 'Event tickets · Nov 18',                    amount: '+US$1,140.00',          status: { key: 'status.pending',   fallback: 'Pending',   variant: 'neutral' } },
    payout:    { icon: 'download',  iconVariant: 'error',   titleKey: 'tx.payout.title',    title: 'Payout · Bank transfer ••3417',                             metaKey: 'tx.payout.meta',    meta: 'Withdrawal · Nov 18',                       amount: '−US$5,200.00', neg: true, status: { key: 'status.paid',      fallback: 'Paid',      variant: 'success' } },
    // Settled-only income examples for Dashboard F3 (spec excludes Pending; F3 hides the status column).
    iproyalty:    { icon: 'badge-check', iconVariant: 'success', titleKey: 'tx.iproyalty.title',    title: 'IP royalty · <em>Neon Tide</em> brand → 2 licensees',  metaKey: 'tx.iproyalty.meta',    meta: 'IP royalties · Nov 19',  amount: '+US$960.00',   status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } },
    ticketsSettled: { icon: 'ticket',     iconVariant: 'success', titleKey: 'tx.tickets-settled.title', title: 'Event tickets · <em>Winter Set</em> show × 52', metaKey: 'tx.tickets-settled.meta', meta: 'Event tickets · Nov 17', amount: '+US$1,560.00', status: { key: 'status.paid', fallback: 'Paid', variant: 'success' } }
  };

  var DATA = {
    // F3 — settled income only, no status column (spec 5.1.1 §F3: "狀態恆為 settled，故不另列狀態欄"；
    // excludes refunds / payouts / fees / disputes and any non-settled rows). Sorted by settle time,
    // cross-source, ≤8 rows. hideStatus drops the status pill for this list only.
    'dash-recent': { hideStatus: true, rows: [TX.spotify, TX.merch, TX.licensing, TX.iproyalty, TX.ticketsSettled] },
    // Earnings Overview — full recent ledger (income + a payout). Same renderer ⇒ identical format.
    'earn-recent': { rows: [TX.preorder, TX.spotify, TX.merch, TX.licensing, TX.tickets, TX.payout] },

    // F2 — operations summary.
    'dash-ops': { tiles: [
      { labelKey: 'ops.revenue',  label: 'Total revenue',   value: '$24,830', delta: { key: 'ops.revenue-delta', text: '+12.6% vs last week' }, metaLink: { href: 'earnings.html', key: 'ops.revenue-meta', text: 'Updated 2h ago · view in Earnings' } },
      { labelKey: 'ops.pending',  label: 'Pending actions', value: '4',       metaLink: { href: '#f4-alerts',  key: 'ops.pending-meta',  text: '3 open · 1 in progress' } },
      { labelKey: 'ops.projects', label: 'Active projects', value: '3',       metaLink: { href: 'projects.html', key: 'ops.projects-meta', text: 'Live · funding · scheduled' } }
    ] },

    // F4 — today's actions.
    'dash-alerts': { items: [
      { variant: 'warning', icon: 'alert-triangle-fill', titleKey: 'alert.ip-rental.title', title: 'IP rental expires in 6 days',     descKey: 'alert.ip-rental.desc', desc: '<em>Neon Tide</em> brand license expires May 25. Renew or release before expiry to avoid breach.',     metaKey: 'alert.ip-rental.meta', meta: 'Warning · My IP · In progress', ctaKey: 'alert.ip-rental.cta', cta: 'Renew',              ctaHref: 'my-ip.html' },
      { variant: 'error',   icon: 'x-circle-fill',       titleKey: 'alert.stock.title',     title: 'Low stock · 3 items',             descKey: 'alert.stock.desc',     desc: '<em>Tide Pool</em> vinyl, <em>Cartridge 04</em> zine, and tour T-shirt are below restock threshold.',   metaKey: 'alert.stock.meta',     meta: 'Critical · E-Shop · Open',      ctaKey: 'alert.stock.cta',     cta: 'Restock',            ctaHref: 'e-shop.html' },
      { variant: 'warning', icon: 'alert-triangle-fill', titleKey: 'alert.event.title',     title: 'Event pre-flight incomplete',     descKey: 'alert.event.desc',     desc: '<em>Tide Pool · 14 Jun</em> still needs refund policy and on-site staffing confirmed.',                 metaKey: 'alert.event.meta',     meta: 'Warning · Events · Open',       ctaKey: 'alert.event.cta',     cta: 'Complete checklist', ctaHref: 'events.html' },
      // Blocking (compliance) — resolvable only in its source module; close control is disabled (spec §F4).
      { variant: 'error',   icon: 'lock',                blocking: true, titleKey: 'alert.payout-block.title', title: 'Payouts on hold — tax form required', descKey: 'alert.payout-block.desc', desc: 'A W-8/W-9 tax form is required before any withdrawal can be released. Resolve in Settings.',  metaKey: 'alert.payout-block.meta', meta: 'Critical · Settings · Open · Blocking', ctaKey: 'alert.payout-block.cta', cta: 'Add tax form',  ctaHref: 'settings.html#tax' },
      // Snoozed (info, soft-closed) — excluded from F2 pending count; reappears in ~7 days (spec §F4).
      { variant: 'info',    icon: 'info-fill',           snoozed: true,  titleKey: 'alert.spotify.title',   title: 'SPOTIFY sync failed',             descKey: 'alert.spotify.desc',   desc: 'Authorization expired May 17. Re-authorize to keep audience insights current.',                         metaKey: 'alert.spotify.meta',   meta: 'Info · Settings · Snoozed',     ctaKey: 'alert.spotify.cta',   cta: 'Re-authorize',       ctaHref: 'settings.html#integrations' }
    ] },

    // F5 — recent activity (completed / record-only events).
    'dash-activity': { rows: [
      { icon: 'check-circle', iconVariant: 'success', titleKey: 'dash.recent.row1.title', title: '<em>Coastline EP</em> MV published',               metaKey: 'dash.recent.row1.meta', meta: 'Content · Projects · Nov 23', status: { key: 'status.published', fallback: 'Published', variant: 'success' } },
      { icon: 'award',        iconVariant: 'info',    titleKey: 'dash.recent.row2.title', title: 'Fan milestone — Inner Circle reached 50',          metaKey: 'dash.recent.row2.meta', meta: 'Fans · Fans CRM · Nov 21',   status: { key: 'status.reached',   fallback: 'Reached',   variant: 'success' } },
      { icon: 'refresh-ccw',                          titleKey: 'dash.recent.row3.title', title: 'Updated overdue IP — <em>Late Bloom</em> renewed', metaKey: 'dash.recent.row3.meta', meta: 'IP · My IP · Nov 19',        status: { key: 'status.updated',   fallback: 'Updated',   variant: 'neutral' } },
      { icon: 'file-text',                            titleKey: 'dash.recent.row4.title', title: 'Brand partnership signed — Cypress Audio',         metaKey: 'dash.recent.row4.meta', meta: 'Income · Earnings · Nov 17', status: { key: 'status.signed',    fallback: 'Signed',    variant: 'neutral' } }
    ] },

    // F6 — recent events & ongoing projects (source-aware entry: event → events.html, project → projects.html).
    'dash-events': { rows: [
      { icon: 'circle', titleKey: 'dash.progress.row1.title', title: '<em>Coastline EP</em> · pre-order',        metaKey: 'dash.progress.row1.meta', meta: 'Project · Projects · 62 / 100 supporters · ends Dec 14', status: { key: 'status.live',      fallback: 'Live',      variant: 'orange' },  go: 'projects.html' },
      { icon: 'circle', titleKey: 'dash.progress.row2.title', title: '<em>Late Bloom</em> short film · funding', metaKey: 'dash.progress.row2.meta', meta: 'Project · Projects · $8,420 / $15,000 · 21 days left',   status: { key: 'status.scheduled', fallback: 'Scheduled', variant: 'info' },    go: 'projects.html' },
      { icon: 'circle', titleKey: 'dash.progress.row3.title', title: '<em>Spring Launch</em> show · in-person',  metaKey: 'dash.progress.row3.meta', meta: 'Event · Events · Apr 12 · 84 / 200 tickets · Taipei',    status: { key: 'status.on-sale',   fallback: 'On sale',   variant: 'success' }, go: 'events.html' },
      { icon: 'circle', titleKey: 'dash.progress.row4.title', title: '<em>Quiet Hours</em> playlist · go live',  metaKey: 'dash.progress.row4.meta', meta: 'Project · Projects · scheduled to launch Dec 01',        status: { key: 'status.draft',     fallback: 'Draft',     variant: '' },        go: 'projects.html' }
    ] },

    // F8 — external data status (CTAs only route to Settings; Dashboard never manages integrations).
    'dash-ext': { rows: [
      { logo: { t: 'Y',  bg: '#ff0000', fg: '#fff' },                                                       title: 'YouTube',     typeKey: 'ext.youtube.type',     type: 'Subscribers & views · synced 1h ago',                  impactKey: 'ext.youtube.impact',     impact: 'Feeds Audience trends',                       status: { key: 'data.status.normal',  fallback: 'Normal',        variant: 'success' } },
      { logo: { t: 'IG', bg: 'linear-gradient(45deg,#fbad50,#cd486b,#5b51d8)', fg: '#fff' },                title: 'Instagram',   typeKey: 'ext.instagram.type',   type: 'Followers & engagement · synced 2h ago',               impactKey: 'ext.instagram.impact',   impact: 'Feeds Audience trends & Fans CRM',            status: { key: 'data.status.normal',  fallback: 'Normal',        variant: 'success' } },
      { logo: { t: 'S',  bg: '#1ed760', fg: '#000' },                                                       title: 'Spotify',     typeKey: 'ext.spotify.type',     type: 'Streams & monthly listeners · last synced Nov 18',     impactKey: 'ext.spotify.impact',     impact: 'Affects Audience trends & streaming royalties', status: { key: 'data.status.delayed', fallback: 'Stalled',       variant: 'error' },   cta: { key: 'ext.cta.fix',     text: 'Fix in Settings', href: 'settings.html#integrations' } },
      { logo: { t: 'SV', bg: '#ec5b24', fg: '#fff', fs: 'var(--fs-12)' },                                           title: 'StreetVoice', typeKey: 'ext.streetvoice.type', type: 'Followers & plays · synced Nov 23',                    impactKey: 'ext.streetvoice.impact', impact: 'Some audience metrics incomplete',            status: { key: 'data.status.partial', fallback: 'Partial',       variant: 'neutral' }, cta: { key: 'ext.cta.fix',     text: 'Fix in Settings', href: 'settings.html#integrations' } },
      { logo: { t: 'T' },                                                                                   title: 'TikTok',      typeKey: 'ext.tiktok.type',      type: 'Not linked · no data flowing in',                      impactKey: 'ext.tiktok.impact',      impact: 'No TikTok audience data in analytics',        status: { key: 'status.not-connected', fallback: 'Not connected', variant: 'neutral' }, cta: { key: 'ext.cta.connect', text: 'Connect',         href: 'settings.html#integrations' } }
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
          { key: 'dash.fans.tier.devoted', label: 'Devoted',      pct: '37%', rev: '$4,890' },
          { key: 'dash.fans.tier.fan',     label: 'Fan',          pct: '23%', rev: '$1,210' }
        ],
        warnKey: 'dash.fans.warning', warn: '<strong>5 Superfans at risk of dropping.</strong> 14+ days without a touchpoint. Send a private update?',
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
        fixKey: 'dash.audience.fix', fix: 'Fix', fixHref: 'settings.html#integrations'
      }
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

  window.ZtorComponents = { mount: mount, RENDERERS: RENDERERS, DATA: DATA };
})();
