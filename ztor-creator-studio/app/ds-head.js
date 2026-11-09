/* 設計系統各頁共用的 <head>：樣式、元件 CSS、主題與語言預設。只改這一份，所有 design-system*.html 都會跟著變。
   新增元件 CSS：在下面的 <link> 清單照覆寫順序加一行。 */
document.write(String.raw`<script src="js/theme.js?v=r2.2"></script>
<script src="js/row-disclosure.js?v=r2.2"></script>
<script src="js/listing-state.js?v=r2.2"></script>
<script src="js/link-field.js?v=r2.2"></script>
<script>(function(){var h=document.documentElement;try{var l=localStorage.getItem('ztor.ds.lang')||'zh';h.setAttribute('data-lang',l);h.setAttribute('lang',l==='zh'?'zh-Hant':'en');var m=localStorage.getItem('ztor.ds.docmode')||'fixed';var w=parseInt(localStorage.getItem('ztor.ds.docwidth')||'1440',10)||1440;h.setAttribute('data-docmode',m);h.style.setProperty('--doc-maxw',m==='rwd'?'none':w+'px');}catch(e){h.setAttribute('data-lang','zh');h.setAttribute('data-docmode','fixed');}})();</script>
<link rel="stylesheet" href="ds-components/_tokens.css?v=r2.2">
<link rel="stylesheet" href="ds-components/fonts.css?v=r2.2">
<link rel="stylesheet" href="ds-components/icon.css?v=r2.2">
<link rel="stylesheet" href="ds-components/button.css?v=r2.2">
<link rel="stylesheet" href="ds-components/badge.css?v=r2.2">
<link rel="stylesheet" href="ds-components/accordion.css?v=r2.2">
<link rel="stylesheet" href="ds-components/date-range.css?v=r2.2">
<link rel="stylesheet" href="ds-components/export-dialog.css?v=r2.2">
<link rel="stylesheet" href="ds-components/alert.css?v=r2.2">
<link rel="stylesheet" href="ds-components/bento.css?v=r2.2">
<link rel="stylesheet" href="ds-components/card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/card-group.css?v=r2.2">
<link rel="stylesheet" href="ds-components/chart.css?v=r2.2">
<link rel="stylesheet" href="ds-components/waterfall.css?v=r2.2">
<link rel="stylesheet" href="ds-components/funding-panel.css?v=r2.2">
<link rel="stylesheet" href="ds-components/chip.css?v=r2.2">
<link rel="stylesheet" href="ds-components/data-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/review-row.css?v=r2.2">
<link rel="stylesheet" href="ds-components/picker.css?v=r2.2">
<link rel="stylesheet" href="ds-components/field-pill.css?v=r2.2">
<link rel="stylesheet" href="ds-components/search-collapse.css?v=r2.2">
<link rel="stylesheet" href="ds-components/segmented.css?v=r2.2">
<link rel="stylesheet" href="ds-components/preview-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/pdp-preview.css?v=r2.2">
<link rel="stylesheet" href="ds-components/preview-panel.css?v=r2.2">
<link rel="stylesheet" href="ds-components/readiness.css?v=r2.2">
<link rel="stylesheet" href="ds-components/empty-stub.css?v=r2.2">
<link rel="stylesheet" href="ds-components/empty-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/staged-change.css?v=r2.2">
<link rel="stylesheet" href="ds-components/limit-set.css?v=r2.2">
<link rel="stylesheet" href="ds-components/rules-group.css?v=r2.2">
<link rel="stylesheet" href="ds-components/form-steps.css?v=r2.2">
<link rel="stylesheet" href="ds-components/price-ladder.css?v=r2.2">
<link rel="stylesheet" href="ds-components/code-picker.css?v=r2.2">
<link rel="stylesheet" href="ds-components/member-table.css?v=r2.2">
<link rel="stylesheet" href="ds-components/form-ask.css?v=r2.2">
<link rel="stylesheet" href="ds-components/notification-matrix.css?v=r2.2">
<link rel="stylesheet" href="ds-components/completeness.css?v=r2.2">
<link rel="stylesheet" href="ds-components/insight-row.css?v=r2.2">
<link rel="stylesheet" href="ds-components/list-footer.css?v=r2.2">
<link rel="stylesheet" href="ds-components/message-modal.css?v=r2.2">
<link rel="stylesheet" href="ds-components/event-preview-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/header.css?v=r2.2">
<link rel="stylesheet" href="ds-components/input.css?v=r2.2">
<link rel="stylesheet" href="ds-components/zselect.css?v=r2.2">
<link rel="stylesheet" href="ds-components/date-input.css?v=r2.2">
<link rel="stylesheet" href="ds-components/field-more.css?v=r2.2">
<link rel="stylesheet" href="ds-components/session-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/review-status.css?v=r2.2">
<link rel="stylesheet" href="ds-components/owner-lookup.css?v=r2.2">
<link rel="stylesheet" href="ds-components/amount-field.css?v=r2.2">
<link rel="stylesheet" href="ds-components/kpi.css?v=r2.2"><link rel="stylesheet" href="ds-components/sparkline.css?v=r2.2"><link rel="stylesheet" href="ds-components/issue-panel.css?v=r2.2"><link rel="stylesheet" href="ds-components/work-card.css?v=r2.2"><link rel="stylesheet" href="ds-components/earnings-feed.css?v=r2.2"><link rel="stylesheet" href="ds-components/live-item.css?v=r2.2"><link rel="stylesheet" href="ds-components/canvas-home.css?v=r2.2"><link rel="stylesheet" href="ds-components/canvas-stage.css?v=r2.2"><link rel="stylesheet" href="ds-components/split-bar.css?v=r2.2"><link rel="stylesheet" href="ds-components/donut-mix.css?v=r2.2"><link rel="stylesheet" href="ds-components/tier-arc.css?v=r2.2"><link rel="stylesheet" href="ds-components/kpi-rotator.css?v=r2.2"><link rel="stylesheet" href="ds-components/rent-block.css?v=r2.2"><link rel="stylesheet" href="ds-components/selection-card.css?v=r2.2"><link rel="stylesheet" href="ds-components/drawer.css?v=r2.2"><link rel="stylesheet" href="ds-components/pager.css?v=r2.2">
<link rel="stylesheet" href="ds-components/page-intro.css?v=r2.2">
<link rel="stylesheet" href="ds-components/field-system.css?v=r2.2">
<link rel="stylesheet" href="ds-components/form-section.css?v=r2.2">
<link rel="stylesheet" href="ds-components/nest.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stock-readout.css?v=r2.2">
<link rel="stylesheet" href="ds-components/radio-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/radio-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/control-row.css?v=r2.2">
<link rel="stylesheet" href="ds-components/cond-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/venue-map.css?v=r2.2">
<link rel="stylesheet" href="ds-components/vault-task.css?v=r2.2">
<link rel="stylesheet" href="ds-components/vault-access.css?v=r2.2">
<link rel="stylesheet" href="ds-components/media-preview.css?v=r2.2">
<link rel="stylesheet" href="ds-components/collapse-group.css?v=r2.2">
<link rel="stylesheet" href="ds-components/form-grid.css?v=r2.2">
<link rel="stylesheet" href="ds-components/preview-column.css?v=r2.2">
<link rel="stylesheet" href="ds-components/settings.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stack.css?v=r2.2">
<link rel="stylesheet" href="ds-components/step-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/progress-mark.css?v=r2.2">
<link rel="stylesheet" href="ds-components/post-composer.css?v=r2.2">
<link rel="stylesheet" href="ds-components/size-chart-editor.css?v=r2.2">
<link rel="stylesheet" href="ds-components/info-banner.css?v=r2.2">
<link rel="stylesheet" href="ds-components/upload-tile.css?v=r2.2">
<link rel="stylesheet" href="ds-components/bundle-editor.css?v=r2.2">
<link rel="stylesheet" href="ds-components/album-tracks.css?v=r2.2">
<link rel="stylesheet" href="ds-components/vip-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/switch.css?v=r2.2">
<link rel="stylesheet" href="ds-components/table.css?v=r2.2">
<link rel="stylesheet" href="ds-components/admin-ip-bank-table.css?v=r2.2">
<link rel="stylesheet" href="ds-components/tabs.css?v=r2.2">
<link rel="stylesheet" href="ds-components/list-toolbar.css?v=r2.2">
<link rel="stylesheet" href="ds-components/filter-tabs.css?v=r2.2">
<!-- 後加的元件放在基礎元件之後，覆寫順序才正確（如 .amount-field__input.input 覆寫 .input） -->
<link rel="stylesheet" href="ds-components/dropdown-menu.css?v=r2.2">
<link rel="stylesheet" href="ds-components/product-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/project-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/payout-modal.css?v=r2.2">
<link rel="stylesheet" href="ds-components/publish-preview.css?v=r2.2">
<link rel="stylesheet" href="ds-components/restock-modal.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stock-tip.css?v=r2.2">
<link rel="stylesheet" href="ds-components/store-settings.css?v=r2.2">
<link rel="stylesheet" href="ds-components/fan-store.css?v=r2.2">
<link rel="stylesheet" href="ds-components/pickup.css?v=r2.2">
<link rel="stylesheet" href="ds-components/scanner.css?v=r2.2">
<link rel="stylesheet" href="ds-components/variant-builder.css?v=r2.2">
<link rel="stylesheet" href="ds-components/tag-input.css?v=r2.2">
<link rel="stylesheet" href="ds-components/combobox.css?v=r2.2">
<link rel="stylesheet" href="ds-components/spec-row.css?v=r2.2">
<link rel="stylesheet" href="ds-components/entry-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/rich-body.css?v=r2.2">
<link rel="stylesheet" href="ds-components/status-axes.css?v=r2.2">
<link rel="stylesheet" href="ds-components/embed-modal.css?v=r2.2">
<link rel="stylesheet" href="ds-components/leave-dialog.css?v=r2.2">
<link rel="stylesheet" href="ds-components/sched-restore.css?v=r2.2">
<link rel="stylesheet" href="ds-components/split-button.css?v=r2.2">
<link rel="stylesheet" href="ds-components/product-post-modal.css?v=r2.2">
<link rel="stylesheet" href="ds-components/progress-stepper.css?v=r2.2">
<link rel="stylesheet" href="ds-components/kv-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/calc-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stock-bar.css?v=r2.2">
<link rel="stylesheet" href="ds-components/points-qr.css?v=r2.2">
<link rel="stylesheet" href="ds-components/section-nav.css?v=r2.2">
<link rel="stylesheet" href="ds-components/section-outline.css?v=r2.2">
<link rel="stylesheet" href="ds-components/row-disclosure.css?v=r2.2">
<!-- D241 上架三開關與庫存池（spec §7.14，2026-09-04） -->
<link rel="stylesheet" href="ds-components/listing-controls.css?v=r2.2">
<link rel="stylesheet" href="ds-components/link-field.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stock-allocation.css?v=r2.2">
<link rel="stylesheet" href="ds-components/avatar.css?v=r2.2">
<link rel="stylesheet" href="ds-components/progress-timeline.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stat-row.css?v=r2.2">
<link rel="stylesheet" href="ds-components/todo-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/meter-list.css?v=r2.2">
<link rel="stylesheet" href="ds-components/next-step.css?v=r2.2">
<link rel="stylesheet" href="ds-components/detail-rail.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stock-history.css?v=r2.2">
<link rel="stylesheet" href="ds-components/state-check.css?v=r2.2">
<link rel="stylesheet" href="ds-components/lock-sets.css?v=r2.2">
<link rel="stylesheet" href="ds-components/follow-field.css?v=r2.2">
<link rel="stylesheet" href="ds-components/size-mix.css?v=r2.2">
<link rel="stylesheet" href="ds-components/demand-table.css?v=r2.2">
<link rel="stylesheet" href="ds-components/demand-focus.css?v=r2.2">
<link rel="stylesheet" href="ds-components/bundle-preview-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/section-tabs.css?v=r2.2">
<link rel="stylesheet" href="ds-components/profile-avatar-row.css?v=r2.2">
<link rel="stylesheet" href="ds-components/social-links.css?v=r2.2">
<!-- r2.2 新進元件（19 支，2026-07-29 補齊 demo；zselect 原本就有 <link>，見上方 45 行） -->
<link rel="stylesheet" href="ds-components/benefit-matrix.css?v=r2.2">
<link rel="stylesheet" href="ds-components/tier-overview.css?v=r2.2">
<link rel="stylesheet" href="ds-components/brand-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/chart-tip.css?v=r2.2">
<link rel="stylesheet" href="ds-components/checkbox.css?v=r2.2">
<link rel="stylesheet" href="ds-components/detail-sheet.css?v=r2.2">
<link rel="stylesheet" href="ds-components/explainer.css?v=r2.2">
<link rel="stylesheet" href="ds-components/fans-guide.css?v=r2.2">
<link rel="stylesheet" href="ds-components/manage-ip.css?v=r2.2">
<link rel="stylesheet" href="ds-components/media-vault.css?v=r2.2">
<link rel="stylesheet" href="ds-components/perf-rank.css?v=r2.2">
<link rel="stylesheet" href="ds-components/sortable.css?v=r2.2">
<link rel="stylesheet" href="ds-components/stepper.css?v=r2.2">
<link rel="stylesheet" href="ds-components/sticky-actions.css?v=r2.2">
<link rel="stylesheet" href="ds-components/toast.css?v=r2.2">
<link rel="stylesheet" href="ds-components/vault-share.css?v=r2.2">
<link rel="stylesheet" href="ds-components/wizard-split.css?v=r2.2">
<link rel="stylesheet" href="ds-components/finding-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/source-status.css?v=r2.2">
<!-- 2026-08-04 補掛：login.html（D170）與 create-event 票種卡 promote 時漏接 DS 頁 -->
<link rel="stylesheet" href="ds-components/auth.css?v=r2.2">
<link rel="stylesheet" href="ds-components/ticket-tier-card.css?v=r2.2">
<link rel="stylesheet" href="ds-components/ticket-preview.css?v=r2.2">
<!-- 2026-08-09 補掛：create-event bookyay 帶入閘門 promote 時新增的三支元件 -->
<link rel="stylesheet" href="ds-components/source-import.css?v=r2.2">
<link rel="stylesheet" href="ds-components/field-source-tag.css?v=r2.2">
<link rel="stylesheet" href="ds-components/quick-result-list.css?v=r2.2">
<!-- 2026-09-16 補掛：detail-overview 的 demo 卡（§4 詳情總覽三欄）一直沒連自己的 CSS，圖鑑抽出時檢查 15 抓到 -->
<link rel="stylesheet" href="ds-components/detail-overview.css?v=r2.2">
<!-- 2026-09-22：D305 粉絲視角活動頁改為前台 shop-item 鏡像（fan-shop.css，使用者裁決「預覽 UI 與前台一模一樣」）；fan-event-page.css 已墓碑化 -->
<link rel="stylesheet" href="ds-components/fan-shop.css?v=r2.2">
<link rel="stylesheet" href="ds-components/preview-dock.css?v=r2.2">
<link rel="stylesheet" href="ds-components/fan-phone.css?v=r2.2"><!-- §4.243 Fan phone（UI-CHANGES 394） -->
<link rel="stylesheet" href="ds-components/member-picker.css?v=r2.2"><!-- §4.244 Member picker（UI-CHANGES 399） -->
<link rel="stylesheet" href="ds-components/vault-list.css?v=r2.2"><!-- §4.245 Vault list（UI-CHANGES 439） -->
<link rel="stylesheet" href="ds-components/vault-stage.css?v=r2.2"><!-- §4.246 Vault stage（UI-CHANGES 439） -->
<link rel="stylesheet" href="ds-components/vault-open.css?v=r2.2"><!-- §4.247 Vault open（UI-CHANGES 439） -->
<!-- 2026-09-22：D310 發布前預覽確認改為全頁畫面（publish-stage.css，§4.216） -->
<link rel="stylesheet" href="ds-components/publish-stage.css?v=r2.2">
<link rel="stylesheet" href="shared.css?v=r2.2">
<link rel="stylesheet" href="ds-doc.css?v=r2.2">
<style>
/* ===== Doc chrome (visualization shell only; tokens come from ds-components) ===== */
* { box-sizing: border-box; }
body { margin: 0; background: var(--background); color: var(--foreground); font-family: var(--type-body-family); font-size: var(--type-body-size); line-height: var(--type-body-line-height); letter-spacing: var(--type-body-tracking); -webkit-font-smoothing: antialiased; }
a { color: inherit; }
.doc { display: grid; grid-template-columns: 264px 1fr; min-height: 100vh; }
.toc { position: sticky; top: 52px; align-self: start; height: calc(100vh - 52px);   /* 2026-09-17：讓出頂部 Design 導覽 */ overflow-y: auto; padding: 24px 16px 64px; border-right: 1px solid var(--border); background: var(--card); }
.toc__brand { display: flex; align-items: center; gap: 8px; font-family: var(--font-ui); font-size: var(--fs-18); font-weight: var(--fw-regular); letter-spacing: -0.5px; margin: 0 0 4px; }
.toc__brand-mark { color: var(--primary); }
.toc__sub { font-size: var(--fs-11); color: var(--muted-foreground); margin: 0 0 16px; }
.toc__theme { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-ui); font-size: var(--fs-12); padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-pill, 999px); background: var(--card); color: var(--foreground-muted); cursor: pointer; margin-bottom: 18px; }
.toc__lang { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-ui); font-size: var(--fs-12); padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-pill, 999px); background: var(--card); color: var(--foreground-muted); cursor: pointer; margin: 0 0 18px 6px; }
.toc__lang:hover, .toc__theme:hover { color: var(--foreground); border-color: var(--muted-foreground); }
.toc__display { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: 0 0 18px; }
.toc__mode { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-ui); font-size: var(--fs-12); padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-pill, 999px); background: var(--card); color: var(--foreground-muted); cursor: pointer; }
.toc__mode:hover { color: var(--foreground); border-color: var(--muted-foreground); }
.toc__mode .ztor-icon { width: 13px; height: 13px; }
.toc__width { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-ui); font-size: var(--fs-11); color: var(--muted-foreground); }
.toc__width input { width: 54px; font-family: var(--font-mono, monospace); font-size: var(--fs-11); padding: 4px 6px; border: 1px solid var(--border); border-radius: var(--radius-sm, 4px); background: var(--card); color: var(--foreground); }
html[data-docmode="fixed"] .toc__mode [data-mode="rwd"] { display: none; }
html[data-docmode="rwd"] .toc__mode [data-mode="fixed"] { display: none; }
html[data-docmode="rwd"] .toc__width { display: none; }
/* ===== i18n show/hide (paired data-en / data-zh) ===== */
html[data-lang="en"] [data-zh] { display: none !important; }
html[data-lang="zh"] [data-en] { display: none !important; }
.toc__group { font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-foreground); margin: 18px 0 6px; }
/* Pillar 4 內的功能次分組標籤（比 Pillar 標題輕，靠左小標）*/
.toc__subgroup { font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); color: var(--foreground-muted); margin: 11px 0 2px; padding-left: 8px; }
.toc__unit-head { cursor: pointer; }
.toc__unit-head:hover { color: var(--foreground); }
.toc__caret { display: inline-block; width: 1.1em; color: var(--muted-foreground); }
.ds-eng { margin: var(--sp-12) 0; border: 1px solid var(--border); border-radius: var(--radius); }
.ds-eng > summary { cursor: pointer; padding: var(--sp-8) var(--sp-12); font-size: var(--fs-12); color: var(--muted-foreground); display: flex; align-items: center; gap: var(--sp-8); }
.ds-eng > summary:hover { color: var(--foreground); }
.ds-eng__tag { margin-left: auto; font-size: var(--fs-11); color: var(--muted-foreground); }
.ds-eng[open] > summary { border-bottom: 1px solid var(--border); }
.ds-eng > :not(summary) { margin-left: var(--sp-12); margin-right: var(--sp-12); }
/* 設計師檢視：段落開頭的日期與決策編號（2026-10-15（D443）：）原文保留、畫面不顯示 */
.ds-hist { display: none; }
.toc__link { display: block; font-size: var(--fs-13); color: var(--foreground-muted); text-decoration: none; padding: 4px 8px; border-radius: var(--radius-sm, 4px); }
.toc__link:hover { background: var(--accent); color: var(--foreground); }
.toc__link.is-active { background: color-mix(in srgb, var(--primary) 22%, transparent); color: var(--foreground); font-weight: var(--fw-regular); }
.toc__link--sub { padding-left: 18px; font-size: var(--fs-12); }
.doc-main { max-width: var(--doc-maxw, 1440px); padding: 48px 56px 120px; }
.doc-title { font-family: var(--type-page-title-family); font-size: var(--type-page-title-size); font-weight: var(--type-page-title-weight); letter-spacing: var(--type-page-title-tracking); line-height: var(--type-page-title-line-height); margin: 0 0 8px; }
.doc-eyebrow { font-family: var(--type-caption-family); font-size: var(--type-caption-size); font-weight: var(--type-caption-weight); text-transform: uppercase; letter-spacing: var(--type-caption-tracking); color: var(--muted-foreground); }
.lede { font-family: var(--type-body-lg-family); font-size: var(--type-body-lg-size); font-weight: var(--type-body-lg-weight); color: var(--foreground-muted); line-height: var(--type-body-lg-line-height); letter-spacing: var(--type-body-lg-tracking); max-width: 70ch; }
.pillar { padding-top: 40px; margin-top: 40px; border-top: 1px solid var(--border); }
.pillar:first-of-type { border-top: 0; }
.pillar__num { font-family: var(--type-caption-family); font-size: var(--type-caption-size); font-weight: var(--type-caption-weight); text-transform: uppercase; letter-spacing: var(--type-caption-tracking); color: var(--primary-foreground); background: var(--primary); padding: 3px 8px; border-radius: var(--radius-sm, 4px); }
.pillar__title { font-family: var(--type-h2-family); font-size: var(--type-h2-size); font-weight: var(--type-h2-weight); letter-spacing: var(--type-h2-tracking); line-height: var(--type-h2-line-height); margin: 12px 0 8px; }
.pillar__intro { color: var(--foreground-muted); font-family: var(--type-body-lg-family); font-size: var(--type-body-lg-size); font-weight: var(--type-body-lg-weight); line-height: var(--type-body-lg-line-height); letter-spacing: var(--type-body-lg-tracking); max-width: 72ch; }
.sub { padding: 32px 0 10px; border-top: 1px solid var(--border); margin-top: 32px; }
.sub__head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.ds-variant { margin-top: var(--sp-32); padding-top: var(--sp-16); border-top: 1px dashed var(--border); }  /* 併進原卡的變體段（2026-11-09） */
.ds-variant__title { font-family: var(--type-h4-family); font-size: var(--fs-15); font-weight: var(--type-h4-weight); margin: 0 0 var(--sp-8); }
.sub__title { font-family: var(--type-h4-family); font-size: var(--type-h4-size); font-weight: var(--type-h4-weight); letter-spacing: var(--type-h4-tracking); line-height: var(--type-h4-line-height); margin: 0; }
.sub__desc { color: var(--foreground-muted); font-family: var(--type-body-family); font-size: var(--type-body-size); font-weight: var(--type-body-weight); line-height: var(--type-body-line-height); letter-spacing: var(--type-body-tracking); max-width: none; margin: 4px 0 16px; }
.layer { display: inline-flex; align-items: center; font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); padding: 2px 8px; border-radius: var(--radius-pill, 999px); white-space: nowrap; }
.ck { display: inline-block; width: 13px; height: 13px; border-radius: 3px; box-shadow: 0 0 0 1px rgba(23,23,23,.20); vertical-align: -2px; margin-right: 6px; }
.state-cell { display: inline-flex; flex-direction: column; gap: 7px; align-items: flex-start; }
.state-cell small { font-size: var(--fs-11); color: var(--muted-foreground); font-family: var(--font-mono, monospace); }
/* ===== composition (Built from / Used by) ===== */
.compose {
  display: grid;
  gap: 7px;
  margin: 10px 0 16px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  background: color-mix(in srgb, var(--muted) 58%, var(--card));
}
.compose__label { font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); text-transform: uppercase; letter-spacing: .06em; color: var(--muted-foreground); margin-right: 2px; }
.compose-chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-ui); font-size: var(--fs-12); padding: 4px 10px; border-radius: var(--radius-pill, 999px); text-decoration: none; border: 1px solid var(--border); color: var(--foreground-muted); background: var(--card); box-shadow: var(--shadow-hairline); }
.compose-chip::before { content: ""; width: 7px; height: 7px; border-radius: 50%; flex: none; }
.compose-chip--atom::before { background: color-mix(in srgb, var(--status-success) 65%, #000); }
.compose-chip--molecule::before { background: var(--primary); }
.compose-chip--organism::before { background: color-mix(in srgb, var(--status-info) 70%, #000); }
.compose-chip:hover { border-color: var(--muted-foreground); color: var(--foreground); }
.compose__none { font-size: var(--fs-12); color: var(--muted-foreground); font-style: italic; }
/* 4.0 overview map */
.compose-map { border: 1px solid var(--border); border-radius: var(--radius-md, 8px); background: var(--muted); padding: 16px 18px; margin: 8px 0 16px; }
.compose-map__tier { font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); text-transform: uppercase; letter-spacing: .06em; color: var(--muted-foreground); margin: 14px 0 8px; }
.compose-map__tier:first-child { margin-top: 0; }
.compose-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 5px 0; }
.compose-row__arrow { color: var(--muted-foreground); font-size: var(--fs-13); margin: 0 2px; }
.compose__dir { font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); text-transform: uppercase; letter-spacing: .06em; color: var(--foreground); margin: 6px 0 0; }
.compose__dir:first-child { margin-top: 0; }
.compose__tier { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 2px 0; }
.compose__tier-label { min-width: 84px; font-family: var(--font-ui); font-size: var(--fs-11); color: var(--foreground-muted); display: inline-flex; align-items: center; gap: 6px; }
.compose__tier-label::before { content: ""; width: 8px; height: 8px; border-radius: 50%; flex: none; }
.compose__tier--atom .compose__tier-label::before { background: color-mix(in srgb, var(--status-success) 65%, #000); }
.compose__tier--molecule .compose__tier-label::before { background: var(--primary); }
.compose__tier--organism .compose__tier-label::before { background: color-mix(in srgb, var(--status-info) 70%, #000); }
.compose__tier .compose-chip::before { display: none; }
.compose__note {
  font-size: var(--fs-12);
  color: var(--muted-foreground);
  line-height: 1.45;
  margin: 4px 0 0;
  padding: 9px 11px;
  border-radius: var(--radius-sm, 4px);
  background: color-mix(in srgb, var(--card) 82%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 62%, transparent);
}
/* ===== styles gallery (each style = rendered item + name + when) ===== */
.gallery { display: flex; flex-wrap: wrap; gap: 18px; padding: 22px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--layer-1-surface); margin: 8px 0 14px; align-items: flex-start; }   /* 2026-09-16：L1，同 .demo */
.gallery__item { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; max-width: 240px; }
.gallery__name { font-family: var(--font-ui); font-size: var(--fs-13); font-weight: var(--fw-regular); color: var(--foreground); }
.gallery__when { font-size: var(--fs-12); color: var(--muted-foreground); line-height: 1.45; }
/* ===== developer-reference fold (classes + tokens + code) ===== */
.code-fold__body { padding: 8px 14px 14px; }
.code-fold__body .field-label { font-size: var(--fs-12); line-height: 1.3; text-transform: uppercase; letter-spacing: 0.05em; margin: 16px 0 6px; }
.code-fold__body .field-label:first-child { margin-top: 4px; }
.code-fold__body .code { margin: 10px 0 0; border-radius: var(--radius-sm, 4px); }
.code-fold__body .spec { margin: 4px 0 8px; }
/* ===== rendered preview stage ===== */
.matrix-block {
  /* 2026-09-16（使用者「這些是照 layer 的規則嗎」→ 改來看）：.sub 不是卡（只有分隔線），矩陣區塊直接坐在
     L0 檯面上，所以它是第一層＝L1 玻璃面：--layer-1-surface＋1px --border；裡面的表格是 L3 線框、
     表頭與列標是薄膜（比 L1 亮一階）。不再用換裝前的實色 --card 漸層。
     同日先試過 L2 薄膜（--layer-2-surface），但那是「疊在卡上」的階，這裡沒有卡，退回 L1。
     舊值：border 1px --border；background linear-gradient(--card 92% → --background/--muted 混色）。 */
  margin: 10px 0 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--layer-1-surface);
}
.matrix-block__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; margin: 0 0 10px; }
.matrix {
  width: 100%;
  margin: 10px 0 16px;
  border-collapse: separate;
  border-spacing: 0;
  /* 2026-09-16：表格本體是 L2 裡再分一層＝L3，只畫線不填色（--layer-line），不再疊第二塊實色 --card。
     舊值：border 1px --border；background var(--card)。 */
  border: 1px solid var(--layer-line);
  border-radius: var(--radius);
  background: transparent;
  overflow: hidden;
}
.matrix-block .matrix { margin: 0; }
.matrix thead th { font-family: var(--font-mono, monospace); font-size: var(--fs-11); font-weight: var(--fw-regular); color: var(--muted-foreground); padding: 10px 14px; text-align: left; background: var(--ztu-film); border-bottom: 1px solid var(--layer-line); }   /* 2026-09-16：卡內表頭用薄膜、不往暗（Q41／檢查 14）。舊值 color-mix(--muted 72%, --card) */
.matrix tbody th { text-align: left; font-family: var(--font-mono, monospace); font-size: var(--fs-11); font-weight: var(--fw-regular); color: var(--muted-foreground); padding: 14px; white-space: nowrap; vertical-align: middle; background: var(--ztu-film); }   /* 2026-09-16：列標同表頭，薄膜。舊值 color-mix(--muted 42%, transparent) */
.matrix tbody td { padding: 14px; text-align: left; vertical-align: middle; }
.matrix tbody tr + tr > * { border-top: 1px solid color-mix(in srgb, var(--border) 55%, transparent); }
.matrix tbody th + td,
.matrix tbody td + td,
.matrix thead th + th { border-left: 1px solid color-mix(in srgb, var(--border) 48%, transparent); }
.layer--atom { background: color-mix(in srgb, var(--status-success) 14%, var(--card)); color: color-mix(in srgb, var(--status-success) 65%, #000); }
.layer--molecule { background: color-mix(in srgb, var(--status-warning) 20%, var(--card)); color: color-mix(in srgb, var(--status-warning) 50%, #000); }
.layer--organism { background: color-mix(in srgb, var(--status-info) 14%, var(--card)); color: color-mix(in srgb, var(--status-info) 70%, #000); }
.demo {
  /* 2026-09-16：與 .matrix-block 同理——示範容器直接坐在檯面上＝L1 玻璃面。舊值：--card 88% 漸層 */
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--layer-1-surface);
  margin: 10px 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-start;
}
.demo > * { max-width: 100%; }
.demo--preview { width: 100%; align-items: stretch; background: var(--layer-0-surface); }   /* 2026-09-16：預覽舞台＝檯面 L0。舊值 --background 86%/--muted */
.demo--preview .ds-preview { width: 100%; margin: 0 auto; }
.ds-preview--narrow { max-width: 520px; }
.ds-preview--medium { max-width: 760px; }
.ds-preview .app {
  min-height: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  background: var(--background);
  overflow: hidden;
}
.ds-preview .app-topbar {
  position: static;
  height: 56px;
  padding: 0 18px;
  gap: 14px;
}
.ds-preview .app-topbar__brand { font-size: var(--type-body-size); }
.ds-preview .app-topbar__nav { gap: 2px; }
.ds-preview .app-topbar__link { height: 32px; padding: 0 10px; font-size: var(--fs-12); }
.ds-preview .app-topbar__actions { gap: 6px; margin-left: auto; }
.ds-preview .page { max-width: none; padding: 22px; }
.ds-preview .app-footer { padding: 12px 18px; }
.ds-preview .hero { width: 100%; margin: 0; }
.ds-preview .hero__slide { min-height: 260px; }
.ds-preview .hero--fullbleed .hero__slide { min-height: 300px; }
.ds-preview .hero--fullbleed .hero__title { font-size: var(--type-h3-size); max-width: 520px; }
.ds-preview .hero--fullbleed .hero__copy { padding: 44px 28px 56px; }
.ds-preview .wizard {
  min-height: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  background: var(--background);
  overflow: hidden;
}
.ds-preview .wizard__top { --wizard-top-pad-t: var(--sp-12); --wizard-top-pad-x: var(--sp-12); --wizard-top-pad-b: var(--sp-12); }   /* 2026-09-23：頂列外距與膠囊 inset 讀同一組變數 */
.ds-preview .wizard__sheet { padding-bottom: 0; }   /* demo 的底列是 static、不疊在內容上，不必留高度 */
.ds-preview .wizard__body { padding: 24px 22px; max-width: none; }
.ds-preview .wizard__step-title { font-size: var(--fs-24); }
.ds-preview .wizard__bottom { position: static; padding: 12px 18px; }
.ds-preview .settings-layout { grid-template-columns: 180px 1fr; width: 100%; gap: 22px; }
.ds-preview .settings-nav { position: static; }
.ds-preview .ip-hero {
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px;
  padding: 18px;
  margin: 0;
}
.ds-preview .ip-hero__cover { font-size: var(--fs-24); }
.ds-preview .ip-hero__title { font-size: var(--fs-24); }
.ds-preview .rental-card__total { font-size: var(--fs-24); }
.ds-preview .chart-card { max-width: 760px; }
.ds-preview .chart-card__body { min-height: 180px; }
@media (max-width: 900px) {
  .ds-preview .app-topbar__nav { display: none; }
  .ds-preview .settings-layout,
  .ds-preview .ip-hero { grid-template-columns: 1fr; }
}
.anatomy { font-family: var(--font-mono, ui-monospace, monospace); font-size: var(--fs-11); line-height: 1.5; background: var(--muted); border: 1px solid var(--border); border-radius: var(--radius-sm, 4px); padding: 14px 16px; overflow-x: auto; color: var(--foreground-muted); white-space: pre; margin: 4px 0 16px; }
.field-label { font-family: var(--type-section-label-family); font-size: var(--type-section-label-size); font-weight: var(--type-section-label-weight); line-height: var(--type-section-label-line-height); letter-spacing: var(--type-section-label-tracking); color: var(--foreground); margin: 22px 0 8px; }
.field-note { font-family: var(--type-caption-family); font-size: var(--type-caption-size); font-weight: var(--fw-regular); color: var(--muted-foreground); }
/* 彈窗類元件的行內展示（2026-08-11）：.payout-modal 原生是 position:fixed 的全視窗覆蓋層，
   直接放進 demo 卡會蓋住整頁。這裡只在展示容器內把它壓回文件流——元件本身不動，
   產品頁看到的仍是覆蓋層。同 #sticky-actions 卡的既有做法。 */
.demo--inline-modal .payout-modal { position: static; inset: auto; display: block; padding: 0; background: none; backdrop-filter: none; }
.demo--inline-modal .payout-dialog { width: 100%; max-height: none; }
.field-text { color: var(--foreground-muted); font-family: var(--type-body-family); font-size: var(--type-body-size); font-weight: var(--type-body-weight); line-height: 1.55; letter-spacing: var(--type-body-tracking); margin: 0 0 4px; max-width: none; }
.field-list { color: var(--foreground-muted); font-family: var(--type-body-family); font-size: var(--type-body-size); font-weight: var(--type-body-weight); line-height: 1.6; letter-spacing: var(--type-body-tracking); margin: 0; padding-left: 20px; }
.spec { width: 100%; border-collapse: collapse; font-size: var(--fs-13); margin: 4px 0 8px; }
.spec th, .spec td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
.spec thead th { font-family: var(--font-ui); font-size: var(--fs-11); font-weight: var(--fw-regular); text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); background: var(--muted); }
.spec td { color: var(--foreground-muted); }
.dodont { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 4px 0 8px; }
.dodont > div { border: 1px solid var(--border); border-radius: var(--radius-sm, 4px); padding: 12px 14px; }
.dodont strong { font-family: var(--font-ui); font-size: var(--fs-12); text-transform: uppercase; letter-spacing: 0.06em; }
.dodont__do strong { color: var(--status-success); }
.dodont__dont strong { color: var(--destructive); }
.dodont ul { margin: 8px 0 0; padding-left: 18px; color: var(--foreground-muted); font-size: var(--fs-13); line-height: 1.5; }
.code { font-family: var(--font-mono, ui-monospace, monospace); font-size: var(--fs-12); line-height: 1.5; background: var(--surface-inverse, #0a0a0a); color: #e8e8e8; border-radius: var(--radius-sm, 4px); padding: 14px 16px; overflow-x: auto; white-space: pre; margin: 4px 0 8px; }
code { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.92em; background: var(--muted); padding: 1px 5px; border-radius: 3px; }
.spec code, .field-list code, .field-text code { background: var(--muted); }
.idblock p { line-height: 1.6; max-width: 74ch; }
.tags code { margin-right: 4px; }
.swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin: 8px 0; }
.swatch__chip { height: 56px; border-radius: var(--radius-sm, 4px); border: 1px solid var(--border); }
.swatch__name { font-family: var(--font-ui); font-size: var(--fs-12); font-weight: var(--fw-regular); display: block; margin-top: 6px; }
.swatch__hex { font-family: var(--font-mono, monospace); font-size: var(--fs-11); color: var(--muted-foreground); }
.dd { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.dd h3 { font-family: var(--font-ui); font-size: var(--fs-13); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px; }
.dd--do h3 { color: var(--status-success); } .dd--dont h3 { color: var(--destructive); }
.dd ul { margin: 0; padding-left: 18px; color: var(--foreground-muted); line-height: 1.55; }

/* ===== code-fold (collapsible code for developers) ===== */
.code-fold { margin: 4px 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm,4px); background: var(--muted); overflow: hidden; }
.code-fold > summary { cursor: pointer; list-style: none; display: flex; align-items: center; gap: 8px; font-family: var(--font-ui); font-size: var(--fs-12); color: var(--muted-foreground); padding: 9px 14px; user-select: none; }
.code-fold > summary::-webkit-details-marker { display: none; }
.code-fold > summary:hover { color: var(--foreground); }
.code-fold > summary .ztor-icon { width: 14px; height: 14px; }
.code-fold[open] > summary { border-bottom: 1px solid var(--border); color: var(--foreground); }
.code-fold .code { margin: 0; border-radius: 0; }

/* ===== visual helpers (every concept gets a picture) ===== */
.viz { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-end; padding: 22px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--layer-1-surface); margin: 8px 0 16px; }   /* 2026-09-16：L1，同 .demo */
.viz--top { align-items: flex-start; }
.viz--col { flex-direction: column; align-items: stretch; }
/* spacing scale */
.scale-row { display: flex; align-items: center; gap: 12px; width: 100%; }
.scale-row + .scale-row { margin-top: 8px; }
.scale-bar { height: 14px; background: var(--primary); border-radius: 2px; box-shadow: 0 0 0 1px rgba(23,23,23,.12); }
.scale-num { font-family: var(--font-mono,monospace); font-size: var(--fs-11); color: var(--muted-foreground); width: 38px; text-align: right; flex: none; }
/* radius */
.radius-cell { text-align: center; }
.radius-box { width: 72px; height: 54px; background: color-mix(in srgb, var(--primary) 70%, var(--card)); box-shadow: 0 0 0 1px rgba(23,23,23,.14); margin: 0 auto; }
.radius-cap { display: block; font-family: var(--font-mono,monospace); font-size: var(--fs-11); color: var(--muted-foreground); margin-top: 8px; }
/* shadow */
.shadow-cell { text-align: center; }
.shadow-box { width: 104px; height: 64px; background: var(--card); border-radius: var(--radius-md,8px); margin: 0 auto; }
.shadow-cap { display: block; font-family: var(--font-ui); font-size: var(--fs-11); color: var(--muted-foreground); margin-top: 12px; }
/* motion easing curve */
.curve-wrap { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.curve-svg { width: 120px; height: 120px; background: var(--card); border-radius: var(--radius-sm,4px); box-shadow: 0 0 0 1px var(--border); }
.curve-svg path { fill: none; stroke: var(--primary); stroke-width: 3; }
.curve-svg line { stroke: var(--border); stroke-width: 1; }
/* icon grid */
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px,1fr)); gap: 6px; width: 100%; }
.icon-cell { display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 12px 4px; border-radius: var(--radius-sm,4px); background: var(--card); box-shadow: 0 0 0 1px var(--border); }
.icon-cell .ztor-icon { width: 22px; height: 22px; color: var(--foreground); }
.icon-cell span { font-size: var(--fs-11); color: var(--muted-foreground); font-family: var(--font-mono,monospace); }
/* §4.8 Icon card — base .ztor-icon lives in ds-components/icon.css; the card below sizes its demo variants explicitly. */
#icon .matrix .ztor-icon { width: 16px; height: 16px; display: inline-block; vertical-align: -2px; }
#icon .matrix .ztor-icon--sm { width: 14px; height: 14px; }
#icon .matrix .btn--icon .ztor-icon { width: 16px; height: 16px; }
#icon .reg-gallery .ztor-icon { width: 20px; height: 20px; color: var(--foreground); }
/* type specimen */
.type-spec { width: 100%; }
.type-spec > div { padding: 10px 0; border-bottom: 1px solid var(--border); line-height: 1.1; color: var(--foreground); }
.type-spec > div:last-child { border-bottom: 0; }
.type-spec small { display: block; font-family: var(--font-ui); font-size: var(--fs-11); color: var(--muted-foreground); margin-top: 4px; line-height: 1.4; }
/* light/dark mode pair */
.mode-pair { display: grid; grid-template-columns: 1fr 1fr; width: 100%; max-width: 460px; border-radius: var(--radius-md,8px); overflow: hidden; box-shadow: 0 0 0 1px var(--border); }
.mode-pane { padding: 20px; }
.mode-pane--light { background: #FFFFFF; color: #171717; }
.mode-pane--dark { background: #191A1A; color: #FDFDFD; }
.mode-pane h5 { margin: 0 0 12px; font-family: var(--font-ui); font-size: var(--fs-11); text-transform: uppercase; letter-spacing: .06em; opacity: .55; }
.mode-chip { display: inline-block; padding: 6px 12px; border-radius: 6px; background: #ffa33f; color: #171717; font-family: var(--font-ui); font-size: var(--fs-13); box-shadow: 0 0 0 1px rgba(23,23,23,.12); }
.mode-card { margin-top: 12px; padding: 12px 14px; border-radius: 8px; font-size: var(--fs-13); }
.mode-pane--light .mode-card { background: #fff; box-shadow: 0 2px 8px -1px rgba(12,10,9,.05), 0 0 0 1px rgba(23,23,23,.05); }
.mode-pane--dark .mode-card { background: rgba(253,253,253,.10); box-shadow: 0 0 0 1px rgba(253,253,253,.12); }
/* contrast pairs */
.contrast-grid { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }
.contrast-cell { border-radius: var(--radius-md,8px); padding: 16px; min-width: 150px; flex: 1; font-family: var(--font-ui); box-shadow: 0 0 0 1px rgba(23,23,23,.08); }
.contrast-cell b { font-size: var(--fs-16); display: block; }
.contrast-cell small { font-size: var(--fs-11); display: block; margin-top: 8px; opacity: .85; }
/* template + pattern wireframes */
.wire-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(176px,1fr)); gap: 16px; width: 100%; }
.wire { border: 1px solid var(--border); border-radius: var(--radius-md,8px); overflow: hidden; background: var(--card); }
.wire__frame { aspect-ratio: 4 / 3; display: flex; flex-direction: column; gap: 5px; padding: 7px; background: var(--muted); }
.wire__b { background: var(--foreground); opacity: .14; border-radius: 2px; }
.wire__b--top { height: 13px; opacity: .28; }
.wire__b--hero { flex: 1.4; background: var(--primary); opacity: .55; border-radius: 4px; }
.wire__b--grow { flex: 1; }
.wire__b--side { width: 30%; }
.wire__row { display: flex; gap: 5px; }
.wire__row--grow { flex: 1; }
.wire__row > .wire__b { flex: 1; }
.wire__kpi { display: flex; gap: 5px; }
.wire__kpi > .wire__b { flex: 1; height: 22px; }
.wire__cap { padding: 9px 11px; font-family: var(--font-ui); font-size: var(--fs-12); border-top: 1px solid var(--border); color: var(--foreground-muted); }
.wire__cap code { font-size: var(--fs-11); }
.wire__cap b { color: var(--foreground); font-weight: var(--fw-regular); }
.wire-link { display: block; text-decoration: none; color: inherit; border-radius: var(--radius-md,8px); }
.wire-link:hover .wire { border-color: var(--muted-foreground); }
.wire-link:hover .wire__cap b { color: var(--primary); }
/* ── 1.2.2 type matrix（抽 class 去重，2026-07-02；每列只帶 --tm-fs 一個變數）── */
.tm { border-collapse: collapse; width: max-content; }
.tm th { text-align: left; font: var(--fw-regular) var(--fs-11)/1 var(--font-mono, monospace); text-transform: uppercase; letter-spacing: .06em; color: var(--muted-foreground); padding: 0 16px 10px 0; white-space: nowrap; }
.tm td { font-family: var(--tm-ff, var(--font-ui)); font-size: var(--tm-fs); font-weight: var(--fw-regular); line-height: var(--lh-none); letter-spacing: normal; padding: 14px 16px; white-space: nowrap; vertical-align: baseline; }
.tm td:first-child { font: var(--fw-regular) var(--fs-11)/1 var(--font-mono, monospace); color: var(--muted-foreground); padding: 14px 16px 14px 0; }
.tm td:nth-child(3) { font-weight: var(--fw-regular); }
.tm td:nth-child(4) { font-weight: var(--fw-regular); }
.tm td:nth-child(5) { font-weight: var(--fw-regular); }
.tm--body td { --tm-ff: var(--font-body); }
/* ── 2.2 rendered roles / 2.4 control rows（抽 class 去重）── */
.role-row { display: flex; align-items: baseline; gap: 16px; padding: 10px 0; border-top: 1px solid var(--border); }
.role-row > code, .ctl-row > code { flex: 0 0 180px; color: var(--muted-foreground); font: var(--fw-regular) var(--fs-12)/1 var(--font-mono, monospace); }
.ctl-row { display: flex; align-items: center; gap: 14px; padding: 8px 0; }
.ctl-row > code { flex-basis: 150px; }
.lh-sample { font-family: var(--font-ui); font-size: var(--fs-15); max-width: 30ch; }
/* ── §4.204 Row disclosure demo — 列首欄的欄軌（doc-only）──
   2026-09-04：base '.product-list' 是 5 軌，這兩個 demo（活動系列群組列、§4.204 表格型）
   要示範最前面多一軌的列首欄，所以在 demo 容器上補一組欄軌。真實消費頁的軌道各自寫在
   product-list.css（--roster）與 events.html（--events），不經過這裡。 */
.ds-lead-demo .product-list__head,
.ds-lead-demo .product-list__row {
  grid-template-columns: var(--rowdis-lead-w) minmax(200px, 1fr) 112px 88px 92px 40px;
}

/* ── §4.204 Row disclosure demo — 面板內 hover 常駐模擬（doc-only，不覆寫共用 class）──
   2026-09-04：真實互動走 ds-components/row-disclosure.css 的 :hover／:focus-within／
   [open]（見該檔「面板內列 hover」段），這裡另掛一顆 doc 專用 class 讓同一個視覺結果
   不必真的把滑鼠停在上面就看得到，方便截圖與稽核。選擇器刻意照抄該檔的祖先鏈
   （面板亮著時才生效），只是把觸發條件從 :hover 換成這顆 class，數值逐項相同。 */
.rowdis__group:is(
  .rowdis__group--static,
  :has(> .rowdis__head:not([hidden]):not(.hidden) .rowdis__toggle[aria-expanded="true"])
) :is(.rowdis__head, .rowdis__child).ds-hover-sim {
  background: var(--ztu-glass-strong);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  position: static;
  z-index: auto;
  border-bottom-color: transparent;
}
.rowdis__group:is(
  .rowdis__group--static,
  :has(> .rowdis__head:not([hidden]):not(.hidden) .rowdis__toggle[aria-expanded="true"])
) :is(.rowdis__head, .rowdis__child).ds-hover-sim .dropdown {
  opacity: 1;
}
@media (max-width: 900px) {
  .doc { grid-template-columns: 1fr; }
  .toc { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--border); }
  .doc-main { padding: 32px 20px 80px; }
  .dodont, .dd { grid-template-columns: 1fr; }
}
</style>`);
