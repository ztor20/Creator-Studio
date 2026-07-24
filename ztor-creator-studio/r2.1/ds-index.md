# DS 速查索引（機器生成，勿手改）

> 由 `gen_ds_index.py` 從 `ds-components/` 產生；Stop hook 驗收 PASS 後自動重生，
> 手動重生：專案根執行 `python3 ../../Skills/project-ui-creator/scripts/gen_ds_index.py "site/r2.1"`。
> 用途：**動手改 UI 前先掃這頁**——色彩／字體／間距／陰影一律用下列 token，版面一律先找既有元件；
> 用法細節與規範看 `design-system.md`（AI 契約）／`design-system.html`（人看）。只列亮色值，暗色屬 Pillar 3。

## Tokens（_tokens.css，亮色，共 220 條）

### --accent-*
- `--accent`: #F3F3F3
- `--accent-foreground`: #000000

### --background-*
- `--background`: #FFFFFF

### --border-*
- `--border`: #EAEAEA
- `--border-soft`: #EFEFEF
- `--border-inverse`: rgba(255, 255, 255, 0.1)

### --card-*
- `--card`: #FFFFFF
- `--card-foreground`: #000000

### --chart-*
- `--chart-1`: #ffa33f
- `--chart-2`: #266DF0
- `--chart-3`: #22C55E
- `--chart-4`: #F8D749
- `--chart-5`: #8B5CF6

### --control-*
- `--control-h-xs`: 28px
- `--control-h-sm`: 36px
- `--control-h-md`: 44px
- `--control-h-lg`: 52px
- `--control-h-xl`: 60px

### --destructive-*
- `--destructive`: #DA314A
- `--destructive-foreground`: #FFFFFF

### --duration-*
- `--duration`: 200ms

### --easing-*
- `--easing`: cubic-bezier(0.32, 0.72, 0, 1)

### --font-*
- `--font-display`: 'Geist', system-ui, sans-serif
- `--font-ui`: 'Geist', system-ui, sans-serif
- `--font-body`: 'Inter', system-ui, sans-serif
- `--font-mono`: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace
- `--font-cjk`: 'Noto Sans TC'

### --foreground-*
- `--foreground`: #1A1A1A
- `--foreground-muted`: #4D4D4D
- `--foreground-on-inverse`: #FFFFFF
- `--foreground-on-inverse-muted`: rgba(255, 255, 255, 0.6)

### --fs-*
- `--fs-11`: 11px
- `--fs-12`: 12px
- `--fs-13`: 13px
- `--fs-14`: 14px
- `--fs-15`: 15px
- `--fs-16`: 16px
- `--fs-18`: 18px
- `--fs-20`: 20px
- `--fs-22`: 22px
- `--fs-24`: 24px
- `--fs-28`: 28px
- `--fs-32`: 32px
- `--fs-40`: 40px
- `--fs-44`: 44px
- `--fs-56`: 56px
- `--fs-64`: 64px

### --fw-*
- `--fw-regular`: 400
- `--fw-medium`: 500
- `--fw-semibold`: 600
- `--fw-bold`: 700

### --gradient-*
- `--gradient-brand`: linear-gradient(90deg, #ffd9a0 0%, #ffa33f 55%, #ff7a4d 100%)

### --input-*
- `--input`: #EAEAEA
- `--input-surface`: var(--card)

### --lh-*
- `--lh-none`: 1
- `--lh-tight`: 1.1
- `--lh-snug`: 1.2
- `--lh-normal`: 1.3
- `--lh-comfy`: 1.4
- `--lh-relaxed`: 1.5
- `--lh-loose`: 1.6

### --muted-*
- `--muted`: #FAFAFA
- `--muted-foreground`: #6E6E68

### --nest-*
- `--nest-surface`: transparent

### --overlay-*
- `--overlay-blur`: blur(14px) saturate(140%)
- `--overlay-tint`: rgba(0, 0, 0, 0.45)

### --popover-*
- `--popover`: #FFFFFF
- `--popover-foreground`: #000000

### --primary-*
- `--primary`: #ffa33f
- `--primary-foreground`: #FFFFFF
- `--primary-hover`: #ffb866

### --radius-*
- `--radius-sm`: 3px
- `--radius`: 6px
- `--radius-md`: var(--radius)
- `--radius-lg`: 8px
- `--radius-xl`: 16px
- `--radius-shell`: 28px
- `--radius-pill`: 9999px

### --ring-*
- `--ring`: var(--primary)

### --shadow-*
- `--shadow-card-hover`: var(--shadow-float)

### --sidebar-*
- `--sidebar`: #FBFBFB
- `--sidebar-foreground`: #000000
- `--sidebar-primary`: #ffa33f
- `--sidebar-primary-foreground`: #FFFFFF
- `--sidebar-accent`: #F3F3F3
- `--sidebar-accent-foreground`: #000000
- `--sidebar-border`: #EAEAEA
- `--sidebar-ring`: var(--primary)
- `--sidebar-active`: #ECECEC

### --sp-*
- `--sp-2`: 2px
- `--sp-4`: 4px
- `--sp-6`: 6px
- `--sp-8`: 8px
- `--sp-10`: 10px
- `--sp-12`: 12px
- `--sp-14`: 14px
- `--sp-16`: 16px
- `--sp-18`: 18px
- `--sp-20`: 20px
- `--sp-24`: 24px
- `--sp-28`: 28px
- `--sp-32`: 32px
- `--sp-40`: 40px
- `--sp-48`: 48px
- `--sp-56`: 56px
- `--sp-64`: 64px
- `--sp-72`: 72px
- `--sp-80`: 80px
- `--sp-96`: 96px

### --space-*
- `--space-shell-gutter`: 16px

### --status-*
- `--status-success`: #22C55E
- `--status-info`: #266DF0
- `--status-warning`: #F8D749
- `--status-accent`: #8B5CF6
- `--status-error`: #DA314A

### --surface-*
- `--surface-shell`: #F0F0EE
- `--surface-page`: #FAFAFA
- `--surface-inverse`: #000000

### --type-*
- `--type-display-64-family`: var(--font-display)
- `--type-display-64-size`: var(--fs-64)
- `--type-display-64-weight`: var(--fw-regular)
- `--type-display-64-line-height`: var(--lh-none)
- `--type-display-64-tracking`: -1.28px
- `--type-display-44-family`: var(--font-display)
- `--type-display-44-size`: var(--fs-44)
- `--type-display-44-weight`: var(--fw-medium)
- `--type-display-44-line-height`: var(--lh-tight)
- `--type-display-44-tracking`: -1px
- `--type-title-40-family`: var(--font-ui)
- `--type-title-40-size`: var(--fs-40)
- `--type-title-40-weight`: var(--fw-medium)
- `--type-title-40-line-height`: var(--lh-tight)
- `--type-title-40-tracking`: -0.8px
- `--type-title-32-family`: var(--font-ui)
- `--type-title-32-size`: var(--fs-32)
- `--type-title-32-weight`: var(--fw-medium)
- `--type-title-32-line-height`: var(--lh-tight)
- `--type-title-32-tracking`: -0.6px
- `--type-title-24-family`: var(--font-ui)
- `--type-title-24-size`: var(--fs-24)
- `--type-title-24-weight`: var(--fw-medium)
- `--type-title-24-line-height`: var(--lh-snug)
- `--type-title-24-tracking`: -0.48px
- `--type-label-15-family`: var(--font-ui)
- `--type-label-15-size`: var(--fs-15)
- `--type-label-15-weight`: var(--fw-medium)
- `--type-label-15-line-height`: var(--lh-none)
- `--type-label-15-tracking`: -0.3px
- `--type-label-14-family`: var(--font-ui)
- `--type-label-14-size`: var(--fs-14)
- `--type-label-14-weight`: var(--fw-bold)
- `--type-label-14-line-height`: var(--lh-snug)
- `--type-label-14-tracking`: 0
- `--type-body-16-family`: var(--font-body)
- `--type-body-16-size`: var(--fs-16)
- `--type-body-16-weight`: var(--fw-regular)
- `--type-body-16-line-height`: var(--lh-loose)
- `--type-body-16-tracking`: 0
- `--type-body-14-family`: var(--font-body)
- `--type-body-14-size`: var(--fs-14)
- `--type-body-14-weight`: var(--fw-regular)
- `--type-body-14-line-height`: var(--lh-relaxed)
- `--type-body-14-tracking`: 0
- `--type-caption-12-family`: var(--font-ui)
- `--type-caption-12-size`: var(--fs-12)
- `--type-caption-12-weight`: var(--fw-medium)
- `--type-caption-12-line-height`: var(--lh-normal)
- `--type-caption-12-tracking`: 0.05em
- `--type-display-1-family`: var(--type-display-64-family)
- `--type-display-1-size`: var(--type-display-64-size)
- `--type-display-1-weight`: var(--type-display-64-weight)
- `--type-display-1-line-height`: var(--type-display-64-line-height)
- `--type-display-1-tracking`: var(--type-display-64-tracking)
- `--type-page-title-family`: var(--type-display-44-family)
- `--type-page-title-size`: var(--type-display-44-size)
- `--type-page-title-weight`: var(--type-display-44-weight)
- `--type-page-title-line-height`: var(--type-display-44-line-height)
- `--type-page-title-tracking`: var(--type-display-44-tracking)
- `--type-h2-family`: var(--type-title-40-family)
- `--type-h2-size`: var(--type-title-40-size)
- `--type-h2-weight`: var(--type-title-40-weight)
- `--type-h2-line-height`: var(--type-title-40-line-height)
- `--type-h2-tracking`: var(--type-title-40-tracking)
- `--type-h3-family`: var(--type-title-32-family)
- `--type-h3-size`: var(--type-title-32-size)
- `--type-h3-weight`: var(--type-title-32-weight)
- `--type-h3-line-height`: var(--type-title-32-line-height)
- `--type-h3-tracking`: var(--type-title-32-tracking)
- `--type-h4-family`: var(--type-title-24-family)
- `--type-h4-size`: var(--type-title-24-size)
- `--type-h4-weight`: var(--type-title-24-weight)
- `--type-h4-line-height`: var(--type-title-24-line-height)
- `--type-h4-tracking`: var(--type-title-24-tracking)
- `--type-section-label-family`: var(--type-label-14-family)
- `--type-section-label-size`: var(--type-label-14-size)
- `--type-section-label-weight`: var(--type-label-14-weight)
- `--type-section-label-line-height`: var(--type-label-14-line-height)
- `--type-section-label-tracking`: var(--type-label-14-tracking)
- `--type-body-lg-family`: var(--type-body-16-family)
- `--type-body-lg-size`: var(--type-body-16-size)
- `--type-body-lg-weight`: var(--type-body-16-weight)
- `--type-body-lg-line-height`: var(--type-body-16-line-height)
- `--type-body-lg-tracking`: var(--type-body-16-tracking)
- `--type-body-family`: var(--type-body-14-family)
- `--type-body-size`: var(--type-body-14-size)
- `--type-body-weight`: var(--type-body-14-weight)
- `--type-body-line-height`: var(--type-body-14-line-height)
- `--type-body-tracking`: var(--type-body-14-tracking)
- `--type-caption-family`: var(--type-caption-12-family)
- `--type-caption-size`: var(--type-caption-12-size)
- `--type-caption-weight`: var(--type-caption-12-weight)
- `--type-caption-line-height`: var(--type-caption-12-line-height)
- `--type-caption-tracking`: var(--type-caption-12-tracking)
- `--type-button-label-family`: var(--type-label-15-family)
- `--type-button-label-size`: var(--type-label-15-size)
- `--type-button-label-weight`: var(--type-label-15-weight)
- `--type-button-label-line-height`: var(--type-label-15-line-height)
- `--type-button-label-tracking`: var(--type-label-15-tracking)

### --w-*
- `--w-220`: 220px
- `--w-300`: 300px

## 元件（ds-components/，共 86 支；主 class 前 5 個）

- `accordion.css` — .ztor-accordion, .ztor-accordion__item, .ztor-accordion__trigger, .ztor-accordion__chevron, .ztor-accordion__content ｜ Ztor — Accordion (FAQ pattern)
- `admin-ip-bank-table.css` — .admin-table-wrap, .admin-table__film, .admin-table__thumb, .admin-table__owner, .admin-table__avatar ｜ Admin IP Bank data-table presentation. Shared by
- `album-tracks.css` — .album-tracks, .album-tracks__upload, .album-tracks__upload-label, .album-tracks__req, .album-tracks__upload-hint ｜ Album tracks · 數位商品「音樂專輯」的多曲目管理器
- `alert.css` — .alert, .alert--card, .alert--snoozed, .alert--row, .alert--banner ｜ Alert — inline notice with status indicator, ico
- `amount-field.css` — .amount-field, .amount-field__unit, .amount-field__sym, .amount-field__chev, .amount-field--readonly ｜ Ztor — Amount field (money input with a unit pre
- `avatar-stack.css` — .avatar-stack, .avatar-stack__item, .avatar-stack__more ｜ avatar-stack — overlapping backer/member avatars
- `badge.css` — .ztor-metric-pill, .ztor-metric-pill__icon, .ztor-badge, .ztor-badge--success, .ztor-badge--error ｜ Ztor — Badge / Inline metric pill / Status dot
- `bento.css` — .bento ｜ Bento — 12-column grid utility for dashboard / p
- `button.css` — .btn, .btn--primary, .btn--outline, .btn--ghost, .btn--soft ｜ Ztor Creator Studio · R 2.1 — Button
- `card.css` — .ztor-card, .ztor-card--clickable, .ztor-card__title, .ztor-card__meta, .ztor-card__body ｜ Ztor — Card
- `chart.css` — .linechart, .linechart__svg, .linechart__grid, .linechart__area, .linechart__line ｜ Chart — SVG-based data visualizations for the da
- `chip.css` — .chip-group, .chip, .chip--active, .chip--static, .chip--value ｜ Chip — clickable filter pill with active state +
- `combobox.css` — .combobox, .combobox__menu, .combobox__group, .combobox__opt, .combobox__opt-icon ｜ combobox.css · multi-select typeahead (search-to
- `completeness.css` — .completeness, .completeness__head, .completeness__label, .completeness__count, .completeness__track ｜ Completeness meter · 素材包完整度（spec 0-設計規格書 §7.7「目前
- `composer.css` — .composer, .composer__drop, .composer__textarea, .composer__bar, .composer__bar-group ｜ Composer — drop-or-type input card with bottom a
- `control-row.css` — .control-row, .control-row__main, .control-row__sub, .control-group, .control-group__body ｜ control-row.css · 有外框的「左文字右控件」獨立列
- `cookie-banner.css` — .ztor-cookie-banner, .ztor-cookie-banner__copy, .ztor-cookie-banner__actions, .ztor-cookie-banner__settings ｜ Ztor — Cookie Banner
- `data-list.css` — .data-list, .data-list__row, .data-list__row-main, .data-list__icon, .data-list__icon--success ｜ Data list — row-divider list (no card per row).
- `date-input.css` — .date-input, .date-input__icon, .date-input__ph ｜ date-input.css · 日期／時間欄位的 placeholder 外觀（2026-07
- `detail-rail.css` — .detail-grid, .detail-main, .detail-grid--full, .detail-grid--norail, .detail-rail ｜ Detail Rail — 詳情頁「主欄 + 右側常駐 meta 欄」版型殼
- `drawer.css` — .drawer, .drawer__scrim, .drawer__panel, .drawer__head, .drawer__title
- `dropdown-menu.css` — .dropdown, .dropdown__menu, .dropdown__item, .dropdown--left, .dropdown__item--toggle ｜ Ztor — Dropdown menu (action menu)
- `embed-modal.css` — .embed-modal, .embed-modal__sheet, .embed-modal__head, .embed-modal__title, .embed-modal__close ｜ Embed modal · full-viewport popup that hosts ano
- `empty-card.css` — .empty-card, .empty-card__icon, .empty-card__title, .empty-card__text, .empty-card__cta ｜ Empty card — in-card empty state for a loaded-bu
- `empty-stub.css` — .empty-stub, .empty-stub__inner, .empty-stub__mark, .empty-stub__title, .empty-stub__sub ｜ Empty stub — placeholder page for routes that ar
- `event-preview-card.css` — .event-preview-card, .event-preview-card__poster, .event-preview-card--landscape, .event-preview-card__type-tag, .event-preview-card__body ｜ Event Preview Card · 粉絲端活動卡即時預覽（spec 5.1.6.1 §4.
- `fan-store.css` — .preview-panel__body, .fan-store, .fan-store__overline, .fan-store__phone, .fan-store__screen ｜ Fan store · 粉絲端店面（See-as-fan 預覽的唯一呈現，spec §6.7 同
- `field-more.css` — .field-more, .field-more__toggle, .field-more__icon, .field-more__body ｜ field-more.css · 表單次要欄位的「顯示更多」收合（2026-07-21）
- `field-pill.css` — .field-pill, .field-pill__icon, .field-pill__chevron, .field-pill__input, .field-pill__select ｜ Field pill · inline control pill — search / sele
- `field-system.css` — .field, .field__label, .field__hint, .field__req, .field-readout ｜ Ztor Creator Studio - Field system molecule
- `filter-tabs.css` — .filter-tabs, .filter-tabs__item, .filter-tabs__item--active, .filter-tabs__count, .filter-tabs--brand ｜ Filter Tabs — secondary, lighter pill row for na
- `footer.css` — .ztor-footer, .ztor-footer__inner, .ztor-footer__brand, .ztor-footer__wordmark, .ztor-footer__tagline ｜ Ztor — Footer
- `form-grid.css` — .form-grid, .form-grid--3 ｜ form-grid.css · 表單欄位並排網格 helper
- `form-section.css` — .form-section, .form-section--outlined, .form-section__head, .form-section__head--actions, .form-section__head-actions ｜ form-section.css · 無卡片表單區段（建立流程共用骨架）
- `funding-panel.css` — .funding-panel, .funding-panel__amount-row, .funding-panel__amount, .funding-panel__backers, .funding-panel__goal ｜ Funding panel · 募資概況面板（2026-07-24 promote）
- `header.css` — .app-topbar, .app-topbar__brand, .app-topbar__brand-logo, .app-topbar__nav, .app-topbar__nav-group ｜ Ztor Creator Studio — Header (canonical app topb
- `icon.css` — .ztor-icon, .ztor-icon--xs, .ztor-icon--sm, .ztor-icon--md, .ztor-icon--lg ｜ Ztor Creator Studio - Icon atom
- `info-banner.css` — .info-banner ｜ Neutral informational banner — for contextual ex
- `input.css` — .input, .textarea, .input--with-prefix, .select, .select-wrap ｜ Ztor — Input (form field)
- `insight-row.css` — .insight-row, .insight-row__icon, .insight-row__text ｜ Insight row — single-line auto-computed callout 
- `kpi.css` — .kpi, .kpi__label, .kpi__value, .kpi__delta, .kpi__delta--neg ｜ KPI — metric tile (label / value / delta or meta
- `kv-list.css` — .kv, .kv--lead, .kv__k, .kv__v ｜ KV List — 唯讀鍵值列（label 左、value 右，逐列細分隔線）
- `leave-dialog.css` — .leave-dialog, .leave-dialog__scrim, .leave-dialog__card, .leave-dialog__close, .leave-dialog__title
- `list-footer.css` — .list-footer, .list-footer__count, .list-footer--center ｜ List footer — paginated-list footer pairing a "S
- `list-toolbar.css` — .list-toolbar, .list-toolbar__actions, .list-status-row ｜ List toolbar · 清單頁頭的兩層控制骨架
- `message-modal.css` — .payout-dialog, .msg-dialog, .msg-compose, .msg-field, .msg-field__label
- `nest.css` — .nest, .form-section--outlined ｜ nest.css · 巢狀層（卡片內的滿版子層）
- `notification-matrix.css` — .notif-matrix, .notif-matrix__corner, .notif-matrix__chead, .notif-matrix__label, .notif-matrix__label-title ｜ Notification matrix — event-type (rows) × channe
- `owner-lookup.css` — .owner-lookup, .owner-lookup__results, .owner-lookup__result, .owner-lookup__result--empty, .owner-lookup__avatar ｜ SiteSpecific Owner lookup — registered user sele
- `page-intro.css` — .page-intro, .page-intro__title, .page-intro__sub, .page-intro__actions ｜ Ztor Creator Studio - Page intro molecule
- `pager.css` — .pager, .pager__ellipsis
- `payout-modal.css` — .payout-bank-grid, .payout-bank-card, .payout-bank-card--selected, .payout-bank-card--add, .payout-bank-card__top
- `picker.css` — .picker, .picker__search, .picker__search-input, .picker__new, .picker__list ｜ Picker · search box + scrollable pick-list conta
- `pickup.css` — .scanner-access, .scanner-access__qr, .scanner-access__main, .scanner-access__label, .scanner-access__url ｜ Pickup management · spec 5.1.5.11 (E-Shop · Pick
- `preview-card.css` — .preview-card, .preview-card__media, .preview-card__dots, .preview-card__dot, .preview-card__dot--on ｜ Preview Card · 粉絲端即時預覽卡（spec §5.2.5）
- `preview-column.css` — .preview-split, .preview-split__form, .preview-col, .preview-col__head, .preview-col__title ｜ preview-column.css · 即時預覽欄（表單旁 sticky 常駐欄）
- `preview-panel.css` — .preview-panel, .preview-panel--inset, .wizard, .main, .preview-panel__backdrop ｜ Preview Panel · 建立流程即時預覽的右側面板（spec §5.2.5）
- `product-list.css` — .product-list, .product-list__head, .product-list__row, .product-list__product, .product-list__thumb ｜ Product list — borderless inventory table for E-
- `product-post-modal.css` — .payout-dialog, .npp-intro, .npp-product, .npp-product__thumb, .npp-product__info ｜ New Product Post — composer popup for announcing
- `progress-stepper.css` — .progress-stepper, .progress-stepper__track, .progress-stepper__fill, .progress-stepper__labels, .progress-stepper__label ｜ ── Progress stepper
- `project-list.css` — .project-list, .project-list__head, .project-list__row, .project-list__image, .project-list__image--placeholder ｜ Project list — borderless table list for the Pro
- `radio-card.css` — .segmented, .radio-cards, .radio-cards--icon, .radio-card__icon, .radio-card__text ｜ radio-card.css · 並排可選卡（radio 卡）
- `radio-list.css` — .radio-list, .radio-list__item, .radio-list__trigger, .radio-list__dot, .radio-list__item--active ｜ radio-list.css · 輕量單選列（1-of-N，資料選擇）
- `readiness.css` — .readiness, .readiness__head, .readiness__title, .readiness__list, .readiness__item ｜ Readiness Card · 就緒檢查卡（spec 5.1.5.2 §4.4「Ready t
- `restock-log.css` — .restock-log-wrap, .restock-log, .restock-log__head, .restock-log__row, .restock-log--with-option ｜ Restock Log — 補貨紀錄表（逐欄對齊的歷史清單）
- `restock-modal.css` — .restock-table, .restock-table__head, .restock-table__row, .restock-table__col, .restock-table__group
- `review-row.css` — .review-row, .review-row__item, .review-row__head, .review-row__name, .review-row__action ｜ Ztor — Review row (flat, no-card wizard summary 
- `scanner.css` — .scanner-page, .scanner-frame, .scanner-top, .scanner-top__brand, .scanner-top__title ｜ Mobile scanner · spec 5.1.5.11 F7 (standalone ph
- `search-collapse.css` — .search-collapse, .search-collapse__field, .search-collapse__close ｜ search-collapse — 收合於工具列的搜尋（點放大鏡展開成 field-pill）
- `segmented.css` — .segmented, .segmented__btn, .segmented__btn--active, .segmented__btn--icon, .segmented--locked ｜ Segmented control · 2/3-way text toggle in a mut
- `selection-card.css` — .selection-grid, .selection-grid--3, .selection-card, .selection-card--active, .selection-card__title ｜ Selection card — click-to-select 1-of-N card wit
- `settings.css` — .settings-layout, .settings-nav, .settings-nav__item, .settings-nav__item--active, .settings-section ｜ Ztor Creator Studio - Settings layout, nav, and 
- `spec-row.css` — .spec-row ｜ spec-row — 逐筆規格列（規格名稱＋規格值＋行尾刪除鈕）
- `split-button.css` — .split-button, .split-button__main, .split-button__caret ｜ Split button · a primary action joined to a care
- `stock-bar.css` — .stock-bar, .stock-bar__fill, .stock-bar__fill--low ｜ Stock Bar — 細長量條（庫存水位／用量比例）
- `stock-readout.css` — .stock-readout, .stock-readout__num, .stock-readout__unit ｜ Stock Readout — 唯讀數量讀數（大數字＋單位＋狀態徽章）
- `stock-tip.css` — .stock-tip, .stock-tip__pop, .stock-tip__row, .stock-tip__name, .stock-tip__qty ｜ Ztor — Stock tip (extra stock info on hover)
- `store-settings.css` — .ss-stack, .ss-identity-card, .ss-band__cover, .ss-band__cover-edit, .ss-band__head
- `switch.css` — .switch, .switch--on ｜ Switch — binary on/off toggle (form control).
- `table.css` — .ztor-table, .ztor-table__feature, .fee-tree__panel, .ztor-accordion__item, .ztor-table__check ｜ Ztor — Table
- `tabs.css` — .tabs, .tabs__item, .tabs__item--active, .tabs__item-count, .tabs--brand ｜ Tabs — horizontal tab bar with hairline underlin
- `tag-input.css` — .tag-input, .tag-input__field, .tag-input__entry, .tag-input__suggest-label ｜ Tag input · creator-built / selectable tags
- `upload-tile.css` — .upload-tile, .upload-tile--hero, .upload-tile--file, .upload-tile__icon, .upload-tile__title ｜ Upload tile · dashed upload affordance for creat
- `variant-builder.css` — .variant-builder, .option-set, .option-set__row, .option-set__add, .option-set__name ｜ Variant builder · Shopify-style options + per-va
- `vip-card.css` — .vip-card, .vip-card__settings, .vip-card__head, .vip-card__title, .vip-card__sub-desc ｜ VIP card · 會員卡卡面自訂器（數位商品分類＝會員卡）
- `waterfall.css` — .waterfall, .waterfall__row, .waterfall__head, .waterfall__name, .waterfall__meta
