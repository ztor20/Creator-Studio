# DS 速查索引（機器生成，勿手改）

> 由 `gen_ds_index.py` 從 `ds-components/` 產生；Stop hook 驗收 PASS 後自動重生，
> 手動重生：專案根執行 `python3 ../../Skills/project-ui-creator/scripts/gen_ds_index.py "site/r2.3"`。
> 用途：**動手改 UI 前先掃這頁**——色彩／字體／間距／陰影一律用下列 token，版面一律先找既有元件；
> 用法細節與規範看 `design-system.md`（AI 契約）／`design-system.html`（人看）。只列亮色值，暗色屬 Pillar 3。

## Tokens（_tokens.css，亮色，共 295 條）

### --accent-*
- `--accent`: #F3F3F3
- `--accent-foreground`: #000000

### --background-*
- `--background`: #FFFFFF

### --bloom-*
- `--bloom-surface`: linear-gradient(176deg, color-mix(in srgb, #d0553d 80%, #e8894f) 0%, …

### --border-*
- `--border`: #EAEAEA
- `--border-soft`: #EFEFEF
- `--border-inverse`: rgba(255, 255, 255, 0.1)

### --brand-*
- `--brand-ink`: #8F4E00

### --card-*
- `--card`: #FFFFFF
- `--card-foreground`: #000000

### --chart-*
- `--chart-1`: #ffa33f
- `--chart-2`: #266DF0
- `--chart-3`: #22C55E
- `--chart-4`: #F8D749
- `--chart-5`: #8B5CF6
- `--chart-6`: #EC4899
- `--chart-7`: #06B6D4
- `--chart-8`: #7C4A2D

### --column-*
- `--column-head-ink`: var(--faint-ink)

### --control-*
- `--control-raise`: var(--card)
- `--control-raise-hover`: var(--accent)
- `--control-h-xs`: 32px
- `--control-h-sm`: 36px
- `--control-h-md`: 44px
- `--control-h-lg`: 52px
- `--control-h-xl`: 60px

### --destructive-*
- `--destructive`: #DA314A
- `--destructive-foreground`: #FFFFFF
- `--destructive-ink`: #4C0519
- `--destructive-fill`: color-mix(in srgb, var(--destructive) 12%, transparent)
- `--destructive-deep`: color-mix(in srgb, var(--status-error) 35%, #1a1208)

### --duration-*
- `--duration`: 200ms

### --easing-*
- `--easing`: cubic-bezier(0.32, 0.72, 0, 1)

### --faint-*
- `--faint-ink`: color-mix(in srgb, var(--muted-foreground) 72%, transparent)

### --font-*
- `--font-display`: 'Poppins', var(--font-cjk), system-ui, sans-serif
- `--font-ui`: 'Poppins', var(--font-cjk), system-ui, sans-serif
- `--font-body`: 'Poppins', var(--font-cjk), system-ui, sans-serif
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
- `--fw-light`: 300
- `--fw-regular`: 400
- `--fw-body`: 350
- `--fw-medium`: 500
- `--fw-bold`: 700
- `--fw-semibold`: var(--fw-bold)

### --gradient-*
- `--gradient-brand`: linear-gradient(90deg, #ffd9a0 0%, #ffa33f 55%, #ff7a4d 100%)

### --img-*
- `--img-portrait`: 2 / 3

### --input-*
- `--input`: #EAEAEA
- `--input-surface`: var(--card)

### --layer-*
- `--layer-0-surface`: var(--ztu-canvas)
- `--layer-1-surface`: var(--ztu-glass-bg)
- `--layer-2-surface`: var(--ztu-film)
- `--layer-2-line`: var(--nest-line)
- `--layer-3-surface`: transparent
- `--layer-line`: var(--border)

### --lh-*
- `--lh-none`: 1
- `--lh-tight`: 1.1
- `--lh-snug`: 1.2
- `--lh-normal`: 1.3
- `--lh-comfy`: 1.4
- `--lh-relaxed`: 1.5
- `--lh-loose`: 1.6

### --locked-*
- `--locked-field-ink`: color-mix(in srgb, var(--muted-foreground) 55%, transparent)

### --muted-*
- `--muted`: #FAFAFA
- `--muted-foreground`: #6E6E68

### --nest-*
- `--nest-surface`: transparent
- `--nest-line`: rgba(16, 17, 20, 0.08)

### --on-*
- `--on-primary`: #171717
- `--on-media`: #FFFFFF
- `--on-media-muted`: rgba(255, 255, 255, 0.66)

### --overlay-*
- `--overlay-blur`: blur(24px) saturate(1.25)
- `--overlay-tint`: rgba(0, 0, 0, 0.32)
- `--overlay-scrim`: color-mix(in srgb, var(--background) 40%, var(--overlay-tint))

### --popover-*
- `--popover`: #FFFFFF
- `--popover-foreground`: #000000

### --primary-*
- `--primary`: #ffa33f
- `--primary-foreground`: #171717
- `--primary-hover`: #ffb866

### --radius-*
- `--radius-sm`: 10px
- `--radius`: 10px
- `--radius-md`: var(--radius)
- `--radius-lg`: 16px
- `--radius-xl`: 24px
- `--radius-shell`: 30px
- `--radius-pill`: 9999px

### --ring-*
- `--ring`: var(--primary)

### --scrim-*
- `--scrim-media`: rgba(0, 0, 0, 0.82)

### --scrollbar-*
- `--scrollbar-size`: 12px
- `--scrollbar-thumb`: color-mix(in srgb, var(--foreground) 14%, transparent)
- `--scrollbar-thumb-hover`: color-mix(in srgb, var(--foreground) 32%, transparent)

### --selected-*
- `--selected-surface`: color-mix(in srgb, var(--primary) 14%, transparent)
- `--selected-surface-hover`: color-mix(in srgb, var(--primary) 20%, transparent)
- `--selected-ink`: var(--brand-ink)

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
- `--status-success-ink`: #052E16
- `--status-success-fill`: color-mix(in srgb, var(--status-success) 12%, transparent)
- `--status-success-deep`: color-mix(in srgb, var(--status-success) 35%, #1a1208)
- `--status-info`: #266DF0
- `--status-warning`: #F8D749
- `--status-warning-ink`: #8A6D00
- `--status-info-ink`: #1D4ED8
- `--status-accent-ink`: #6D28D9
- `--status-accent`: #8B5CF6
- `--status-error`: #DA314A

### --surface-*
- `--surface-shell`: #F0F0EE
- `--surface-page`: #FAFAFA
- `--surface-inverse`: #000000

### --tier-*
- `--tier-1`: #7a4a12
- `--tier-2`: #c07a1e
- `--tier-3`: #f0a83c
- `--tier-4`: #ffd9a0

### --type-*
- `--type-display-64-family`: var(--font-display)
- `--type-display-64-size`: var(--fs-64)
- `--type-display-64-weight`: var(--fw-light)
- `--type-display-64-line-height`: var(--lh-none)
- `--type-display-64-tracking`: -1.28px
- `--type-display-44-family`: var(--font-display)
- `--type-display-44-size`: var(--fs-44)
- `--type-display-44-weight`: var(--fw-light)
- `--type-display-44-line-height`: var(--lh-tight)
- `--type-display-44-tracking`: -1px
- `--type-title-40-family`: var(--font-ui)
- `--type-title-40-size`: var(--fs-40)
- `--type-title-40-weight`: var(--fw-regular)
- `--type-title-40-line-height`: var(--lh-tight)
- `--type-title-40-tracking`: -0.8px
- `--type-title-32-family`: var(--font-ui)
- `--type-title-32-size`: var(--fs-32)
- `--type-title-32-weight`: var(--fw-regular)
- `--type-title-32-line-height`: var(--lh-tight)
- `--type-title-32-tracking`: -0.6px
- `--type-title-24-family`: var(--font-ui)
- `--type-title-24-size`: var(--fs-24)
- `--type-title-24-weight`: var(--fw-regular)
- `--type-title-24-line-height`: var(--lh-snug)
- `--type-title-24-tracking`: -0.48px
- `--type-label-15-family`: var(--font-ui)
- `--type-label-15-size`: var(--fs-15)
- `--type-label-15-weight`: var(--fw-regular)
- `--type-label-15-line-height`: var(--lh-none)
- `--type-label-15-tracking`: -0.3px
- `--type-label-14-family`: var(--font-ui)
- `--type-label-14-size`: var(--fs-14)
- `--type-label-14-weight`: var(--fw-regular)
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
- `--type-caption-12-weight`: var(--fw-regular)
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

### --ztu-*
- `--ztu-orange`: #ffa33f
- `--ztu-orange-hi`: #ffc178
- `--ztu-orange-lo`: #f2871f
- `--ztu-glass-bg`: rgba(255, 255, 255, 0.05)
- `--ztu-glass-strong`: rgba(255, 255, 255, 0.12)
- `--ztu-glass-rim`: rgba(255, 255, 255, 0.15)
- `--ztu-film`: rgba(255, 255, 255, 0.085)
- `--ztu-canvas`: #0a0a09
- `--ztu-blur-shell`: 14px
- `--ztu-shell-gutter`: 14px
- `--ztu-shell-solid`: #1c1c1b
- `--ztu-blur-glass`: 24px
- `--ztu-blur-heavy`: 50px
- `--ztu-shadow-card`: 0 24px 60px rgba(0, 0, 0, 0.45)
- `--ztu-shadow-pop`: 0 12px 40px rgba(0, 0, 0, 0.5)
- `--ztu-shadow-pop-up`: 0 -12px 40px rgba(0, 0, 0, 0.5)
- `--ztu-rim-soft`: rgba(255, 255, 255, 0.14)
- `--ztu-rim-strong`: rgba(255, 255, 255, 0.20)
- `--ztu-cool-white`: #eaf2ff
- `--ztu-bloom-1`: #d0553d
- `--ztu-bloom-2`: #e8894f
- `--ztu-bloom-3`: #f0a85e
- `--ztu-bloom-4`: #f5cd80
- `--ztu-accent-surface`: linear-gradient(150deg, color-mix(in srgb, #ffc178 78%, transparent),…
- `--ztu-accent-blur`: blur(16px) saturate(1.25)
- `--ztu-accent-glow`: 0 4px 18px color-mix(in srgb, #ffa33f 30%, transparent), inset 0 1px …
- `--ztu-pill-active-glow`: 0 2px 10px color-mix(in srgb, #ffa33f 24%, transparent), inset 0 1px …
- `--ztu-accent-fg`: rgba(255, 255, 255, 1)
- `--ztu-accent-wash-hover`: color-mix(in srgb, var(--ztu-orange) 18%, transparent)
- `--ztu-accent-glow-hover`: 0 6px 24px color-mix(in srgb, #ffa33f 42%, transparent), inset 0 1px …
- `--ztu-accent-ink-shadow`: 0 1px 3px rgba(0, 0, 0, 0.45)

## 元件（ds-components/，共 154 支；主 class 前 5 個）

- `accordion.css` — .ztor-accordion, .ztor-accordion__item, .ztor-accordion__trigger, .ztor-accordion__chevron, .ztor-accordion__content ｜ Ztor — Accordion (FAQ pattern)
- `admin-ip-bank-table.css` — .admin-table-wrap, .admin-table-wrap--fluid, .admin-table-wrap--menu, .admin-table__film, .admin-table__thumb ｜ Admin IP Bank data-table presentation. Shared by
- `album-tracks.css` — .album-tracks, .album-tracks__upload, .album-tracks__upload-label, .album-tracks__req, .album-tracks__upload-hint ｜ Album tracks · 數位商品「音樂專輯」的多曲目管理器
- `alert.css` — .alert, .alert--card, .alert--snoozed, .alert--row, .alert--banner ｜ Alert — inline notice with status indicator, ico
- `amount-field.css` — .amount-field, .amount-field__unit, .amount-field__sym, .amount-field__chev, .amount-field--readonly ｜ Ztor — Amount field (money input with a unit pre
- `artist-picker.css` — .artist-picker__list, .artist-picker__row, .artist-picker__row--pending, .artist-picker__remove, .owner-lookup__tag ｜ Artist picker — added-artist list under the sear
- `auth.css` — .auth-page, .auth-shell, .auth-brand, .auth-brand__logo, .auth-brand__name ｜ Auth shell · 未登入層的置中表單殼（spec 5.1.10 · D170）
- `avatar.css` — .ztor-avatar, .ztor-avatar--lg, .ztor-avatar--sm ｜ Avatar · 人的識別圓（姓名首字，2026-09-02 promote）
- `badge.css` — .ztor-metric-pill, .ztor-metric-pill__icon, .ztor-badge, .ztor-badge--success, .ztor-badge--error ｜ Ztor — Badge / Inline metric pill / Status dot
- `benefit-matrix.css` — .bmx, .bmx__head, .bmx__head-label, .bmx__tier, .bmx__tier-count ｜ Ztor — Benefit matrix
- `bento.css` — .bento, .bento--top, .bento__stack, .bento__stack--fill ｜ Bento — 12-column grid utility for dashboard / p
- `brand-card.css` — .brand-grid, .brand-card, .brand-card__head, .brand-card__logo, .brand-card__mark ｜ Ztor — Brand partner card
- `bundle-editor.css` — .fc-bundle-col, .fc-bundle, .fc-bundle__body, .bd-group, .bd-group__title ｜ bundle-editor.css · 套組編輯器（共創募資回饋方案）
- `button.css` — .btn, .btn--primary, .btn--outline, .btn--ghost, .btn--destructive ｜ Ztor Creator Studio · R 2.1 — Button
- `canvas-home.css` — .canvas-home-shell, .canvas-hero, .canvas-below, .canvas-sheet, .canvas-sheet__foot ｜ canvas-home — 一屏不捲的展示版型（2026-08-31 建）
- `canvas-stage.css` — .canvas-stage, .canvas-stage__bg, .canvas-stage__img, .canvas-stage__scrim, .canvas-stage__marker ｜ canvas-stage — 首頁展示版的滿版舞台（2026-08-31 建）
- `card-group.css` — .group-title, .group-desc, .group-divider, .card-head, .card-head__title ｜ card-group.css · 卡內分組三件組（Q71 三級制）
- `card.css` — .ztor-card, .ztor-card--clickable, .ztor-card__title, .ztor-card__meta, .ztor-card__body ｜ Ztor — Card
- `chart-tip.css` — .linechart__main, .fin-hitline, .fin-area, .fin-guide, .fin-marker ｜ chart-tip — 折線圖的滑過浮層與點擊熱區（2026-07-28）
- `chart.css` — .linechart, .linechart__svg, .linechart__grid, .linechart__area, .linechart__line ｜ Chart — SVG-based data visualizations for the da
- `check-card.css` — .check-cards, .check-card__group, .check-card, .check-card__mark, .check-card--on ｜ check-card.css · 多選卡（Cosmos 版型）
- `checkbox.css` — .zcheck, .zcheck__control, .zcheck__input, .zcheck__box, .zcheck__label ｜ Checkbox — the house choice control
- `chip.css` — .chip-group, .chip-group--loose, .chip, .chip--active, .chip--static ｜ Chip — clickable filter pill with active state +
- `collapse-group.css` — .collapse-head, .collapse-head__toggle, .collapse-head__chev, .collapse-head__sum, .collapse-head__sum--todo ｜ collapse-group.css · 可折疊的分組盒（標題列＋一行摘要）
- `combobox.css` — .combobox, .combobox__menu, .combobox__group, .combobox__opt, .combobox__opt-icon ｜ combobox.css · multi-select typeahead (search-to
- `completeness.css` — .completeness, .completeness__head, .completeness__label, .completeness__count, .completeness__track ｜ Completeness meter · 素材包完整度（spec 0-設計規格書 §7.7「目前
- `control-row.css` — .control-row, .control-row__main, .control-row__sub, .control-group, .control-group--plain ｜ control-row.css · 有外框的「左文字右控件」獨立列
- `data-list.css` — .data-list, .data-list__row, .data-list__group-label, .data-list__row-main, .data-list__row--disabled ｜ Data list — row-divider list (no card per row).
- `date-input.css` — .date-input, .date-input__icon, .date-input__ph ｜ date-input.css · 日期／時間欄位的 placeholder 外觀（2026-07
- `detail-overview.css` — .detail-overview, .detail-overview--2col, .detail-overview__col, .detail-overview__kpis, .detail-overview__kpi-row ｜ detail-overview.css · 詳情頁總覽的三欄骨架（2026-08-31 使用者裁
- `detail-rail.css` — .detail-grid, .detail-main, .detail-grid--full, .detail-cards, .form-section--outlined ｜ Detail Rail — 詳情頁「主欄 + 右側常駐 meta 欄」版型殼
- `detail-sheet.css` — .detail-sheet, .detail-sheet__panel, .detail-sheet__head, .detail-sheet__back, .detail-sheet__title ｜ detail-sheet — 清單點進細節時的覆蓋層（2026-07-28 使用者裁示）
- `donut-mix.css` — .donut-mix, .donut-mix__ringwrap, .donut-mix__ring, .donut-mix__track, .donut-mix__seg ｜ donut-mix — 一個總數拆成幾塊的圓環（2026-08-31 建）
- `drawer.css` — .drawer, .drawer__scrim, .drawer__panel, .drawer__head, .drawer__title
- `dropdown-menu.css` — .dropdown, .dropdown__menu, .dropdown__item, .dropdown--left, .dropdown__item--toggle ｜ Ztor — Dropdown menu (action menu)
- `earnings-feed.css` — .earnings-feed, .earnings-feed__item, .earnings-feed__name, .earnings-feed__amount, .earnings-feed__amount--neg ｜ earnings-feed.css · 近期收入：一筆一個框
- `embed-modal.css` — .embed-modal, .embed-modal__sheet, .embed-modal__head, .embed-modal__title, .embed-modal__close ｜ Embed modal · full-viewport popup that hosts ano
- `empty-card.css` — .empty-card, .empty-card--framed, .card, .empty-card__icon, .empty-card__icon--primary ｜ Empty card — in-card empty state for a loaded-bu
- `empty-stub.css` — .empty-stub, .empty-stub__inner, .empty-stub__mark, .empty-stub__title, .empty-stub__sub ｜ Empty stub — placeholder page for routes that ar
- `entry-list.css` — .entry-list, .entry-list__row, .entry-list__add ｜ entry-list.css · 逐筆單欄輸入清單（可增可刪）
- `event-preview-card.css` — .event-preview-card, .event-preview-card__poster, .event-preview-card--landscape, .event-preview-card__type-tag, .event-preview-card__body ｜ Event Preview Card · 粉絲端活動卡即時預覽（spec 5.1.6.1 §4.
- `explainer.css` — .explain-btn, .explain, .explain__dialog, .explain__head, .explain__title ｜ Ztor — Explainer
- `fact-list.css` — .fact-list, .fact-list__item ｜ Fact list · 唯讀事實列（2026-08-19）
- `fan-store.css` — .fan-store, .fan-store__overline, .fan-store__page, .fan-store__profile, .fan-store__avatar ｜ fan-store.css · 粉絲端創作者頁的手機版鏡像（See-as-fan 預覽）
- `fans-guide.css` — .fg, .fg-open, .fg-open__kicker, .fg-open__title, .fg-open__sub ｜ Ztor — Fans guide
- `field-more.css` — .field-more, .form-grid, .field-more__toggle, .field-more__icon, .field-more__body ｜ field-more.css · 表單次要欄位的「顯示更多」收合（2026-07-21）
- `field-pill.css` — .field-pill, .field-pill__icon, .field-pill__chevron, .field-pill__input, .field-pill__select ｜ Field pill · inline control pill — search / sele
- `field-source-tag.css` — .field-source, .field__label, .is-source-locked ｜ Field source tag · 「這一格從哪裡來」的來源標記＋鎖定樣式
- `field-system.css` — .field, .field__label, .field__hint, .field__req, .field__error ｜ Ztor Creator Studio - Field system molecule
- `filter-tabs.css` — .filter-tabs, .filter-tabs__item, .filter-tabs__item--active, .filter-tabs__count, .filter-tabs--brand ｜ Filter Tabs — secondary, lighter pill row for na
- `finding-card.css` — .finding, .finding__kicker, .finding__title, .finding__sub, .finding__basis ｜ Finding card · 結論卡（spec 5.1.7.8 F7 · D159／D160）
- `form-grid.css` — .form-grid, .form-grid--3 ｜ form-grid.css · 表單欄位並排網格 helper
- `form-section.css` — .form-section, .form-section__actions, .form-section--outlined, .form-section__head, .form-section__head--actions ｜ form-section.css · 無卡片表單區段（建立流程共用骨架）
- `funding-panel.css` — .funding-panel, .funding-panel__amount-row, .funding-panel__amount, .funding-panel__backers, .funding-panel__goal ｜ Funding panel · 募資概況面板（2026-07-24 promote）
- `header.css` — .app-topbar, .app-topbar__brand, .app-topbar__brand-logo, .app-topbar__nav, .app-topbar__nav-group ｜ Ztor Creator Studio — Header (canonical app topb
- `icon.css` — .ztor-icon, .ztor-icon--xs, .ztor-icon--sm, .ztor-icon--md, .ztor-icon--lg ｜ Ztor Creator Studio - Icon atom
- `info-banner.css` — .info-banner, .info-banner__close, .info-banner--dismissible ｜ Neutral informational banner — for contextual ex
- `input.css` — .input, .textarea, .input--with-prefix, .select--with-prefix, .control-prefix ｜ Ztor — Input (form field)
- `insight-row.css` — .insight-row, .insight-row__icon, .insight-row__text ｜ Insight row — single-line auto-computed callout 
- `issue-panel.css` — .issue-panel, .issue-panel__head, .issue-panel__toggle, .issue-panel__title, .issue-panel__n ｜ issue-panel.css · 待處理事項面板（依來源模組分組、逐項展開）
- `kpi-rotator.css` — .kpi-rotator, .kpi-rotator__slide, .kpi-rotator__slide--active, .distribution, .distribution__head ｜ kpi-rotator — 一格位置輪流講兩件事（2026-08-31 建）
- `kpi.css` — .kpi, .card, .kpi__label, .kpi__value, .kpi__delta ｜ KPI — metric tile (label / value / delta or meta
- `kv-list.css` — .kv, .kv--lead, .kv__k, .kv__v ｜ KV List — 唯讀鍵值列（label 左、value 右，逐列細分隔線）
- `leave-dialog.css` — .leave-dialog, .leave-dialog__scrim, .leave-dialog__card, .leave-dialog__close, .leave-dialog__title
- `link-field.css` — .linkf, .linkf__label, .linkf__row, .linkf__input, .linkf__act ｜ link-field.css · 唯讀連結 ＋ 複製 ＋ 重置
- `list-footer.css` — .list-footer, .list-footer__count, .list-footer--center ｜ List footer — paginated-list footer pairing a "S
- `list-toolbar.css` — .list-toolbar, .list-toolbar__actions, .list-toolbar__filter, .list-toolbar__filter-count, .list-status-row ｜ List toolbar · 清單頁頭的兩層控制骨架
- `listing-controls.css` — .lctl, .lctl__row, .lctl--locked, .lctl__row--locked, .lctl__lock-note ｜ listing-controls.css · 上架、顯示與開賣（spec 0-設計規格書 §7.
- `live-item.css` — .live-bg, .is-live-bg, .live-rail__wrap, .live-rail__nav--prev, .live-rail__view ｜ live-item — 進行中的一件（2026-08-31 建）
- `lock-sets.css` — .lockset__sets, .lockset__sets-titles, .lockset__sets-title, .lockset__sets-hint, .lockset__sets-ctl ｜ lock-sets.css · 組合包「鎖定套數」區（規則：2026-09-11 使用者重定義；
- `manage-ip.css` — .mi-chips, .mi-dot, .mi-verify, .mi-verify__title, .mi-verify__text ｜ manage-ip.css — 「管理我的 IP」頁專屬版面（manage-ip.html）。
- `media-vault.css` — .vault-layout, .vault-layout--norail, .vault-rail, .vault-rail__head, .vault-rail__label ｜ Media Vault · 加密媒體庫（Fans → 媒體庫）
- `message-modal.css` — .payout-dialog, .msg-dialog, .msg-compose, .msg-field, .msg-field__label
- `meter-list.css` — .meter-list__row, .meter-list__name, .meter-list__num, .meter-list__num--hot, .meter-list__row--off ｜ meter-list.css · 逐項水位清單（名稱 → 量條 → 數字，三欄一線）
- `nest.css` — .nest, .form-section--outlined ｜ nest.css · 巢狀層（卡片內的滿版子層）
- `next-step.css` — .next-step, .next-step--lead, .next-step__label, .next-step__text, .next-step__act ｜ next-step.css · 下一步（一句話 ＋ 一顆主要動作）
- `notification-matrix.css` — .notif-matrix, .notif-matrix__corner, .notif-matrix__chead, .notif-matrix__label, .notif-matrix__label-title ｜ Notification matrix — event-type (rows) × channe
- `owner-lookup.css` — .owner-lookup, .owner-lookup__results, .owner-lookup__result, .owner-lookup__result--empty, .owner-lookup__flag ｜ SiteSpecific Owner lookup — registered user sele
- `page-intro.css` — .page-intro, .page-intro__lead, .page-intro__media, .page-crumb, .page-crumb--back ｜ Ztor Creator Studio - Page intro molecule
- `pager.css` — .pager, .pager__ellipsis
- `payout-modal.css` — .payout-bank-grid, .payout-bank-card, .payout-bank-card--selected, .payout-bank-card--add, .payout-bank-card__top
- `pdp-preview.css` — .pdp-pv, .pdp-pv__gallery, .pdp-pv__frame, .pdp-pv__img, .pdp-pv__thumbs ｜ pdp-preview.css · 粉絲端商品頁的手機版鏡像（建立流程的即時預覽）
- `perf-rank.css` — .perf-rank, .perf-rank__row, .perf-rank--nopct, .perf-rank--tight, .perf-rank--wide ｜ perf-rank — 表現排行（Performance ranking）
- `picker.css` — .picker, .card, .payout-dialog, .picker__search, .picker__search-input ｜ Picker · search box + scrollable pick-list conta
- `pickup.css` — .scanner-access, .scanner-access__qr, .scanner-access--nomedia, .scanner-access--bare, .scanner-access__main ｜ Pickup management · spec 5.1.5.11 (E-Shop · Pick
- `post-composer.css` — .post-composer, .card, .post-composer__stub, .post-composer__head, .post-composer__foot ｜ Post composer · 發文框（2026-08-18 promote，自 progres
- `preview-card.css` — .preview-card, .preview-card__media, .preview-card__dots, .preview-card__dot, .preview-card__dot--on ｜ Preview Card · 粉絲端即時預覽卡（spec §5.2.5）
- `preview-column.css` — .preview-split, .preview-split__form, .preview-split--narrow, .preview-split--phone, .preview-col ｜ preview-column.css · 即時預覽欄（表單旁 sticky 常駐欄）
- `preview-panel.css` — .preview-panel, .preview-panel--inset, .wizard, .main, .preview-panel__backdrop ｜ Preview Panel · 建立流程即時預覽的右側面板（spec §5.2.5）
- `product-list.css` — .product-list, .product-list__head, .product-list__row, .product-list--eshop, .product-list--bundles ｜ Product list — borderless inventory table for E-
- `product-post-modal.css` — .payout-dialog, .npp-intro, .npp-product, .npp-product__thumb, .npp-product__info ｜ New Product Post — composer popup for announcing
- `profile-avatar-row.css` — .profile-avatar-row, .profile-avatar-row__img, .profile-avatar-row__name ｜ profile-avatar-row.css · 頭像列（頭像＋名字＋「變更相片」）
- `progress-mark.css` — .pmark, .pmark--done, .pmark--doing, .pmark--alert, .pmark--today ｜ Progress mark · 進度記號（2026-08-18，使用者裁決方案 B ＋ 同日追加
- `progress-stepper.css` — .progress-stepper, .progress-stepper__track, .progress-stepper__fill, .progress-stepper--segmented, .progress-stepper__labels ｜ ── Progress stepper
- `progress-timeline.css` — .ptl, .ptl__node, .ptl__node--foot, .ptl__node--done, .ptl__date ｜ Progress timeline · 交付時間軸（規格 5.1.2.2 §2.2.10，D19
- `project-list.css` — .project-list, .project-list__head, .project-list__row, .project-list__status, .project-list__image ｜ Project list — borderless table list for the Pro
- `publish-preview.css` — .pp-toolbar, .pp-lang-tabs, .pp-view-toggle, .pp-banner, .pp-preview-slot ｜ Publish preview · 發布前預覽確認層（D223，2026-08-24）
- `quick-result-list.css` — .quick-result, .quick-result__head, .quick-result__row, .quick-result__name, .quick-result__num ｜ Quick result list · 批次生成結果的唯讀預覽（一列一項）
- `radio-card.css` — .segmented, .radio-cards, .radio-cards--icon, .radio-card__icon, .radio-card__text ｜ radio-card.css · 並排可選卡（radio 卡）
- `radio-list.css` — .radio-list, .radio-list__item, .radio-list__trigger, .radio-list__dot, .radio-list__item--active ｜ radio-list.css · 輕量單選列（1-of-N，資料選擇）
- `readiness.css` — .readiness, .readiness__head, .readiness__title, .readiness__list, .readiness__item ｜ Readiness Card · 就緒檢查卡（spec 5.1.5.2 §4.4「Ready t
- `rent-block.css` — .rent-block, .rent-block__eyebrow, .rent-block__group, .rent-block__sub, .rent-block__label ｜ Rent block — in-hero rental configurator (ip-det
- `restock-modal.css` — .restock-table, .restock-table__head, .restock-table__row, .restock-table__col, .restock-table__group
- `review-row.css` — .review-row, .review-row__item, .review-row__head, .review-row__name, .review-row__action ｜ Ztor — Review row (flat, no-card wizard summary 
- `review-status.css` — .review-status, .review-status--flat, .review-status__head, .review-status__thumb, .review-status__title ｜ Review status · 送審件的狀態面板（2026-08-07）
- `roster-picker.css` — .roster-picker, .roster-picker__pick, .roster-picker__bar, .roster-picker__search, .roster-picker__grid ｜ Roster picker · 上面選人、下面看那一位（2026-09-02 建、同日改版；
- `row-disclosure.css` — .rowdis__group, .product-list-scroll, .rowdis__group--gutter, .rowdis__head, .rowdis__label ｜ Row disclosure（可展開子列）— 2026-09-03 建，2026-09-04 改
- `scanner.css` — .scanner-page, .scanner-frame, .scanner-top, .scanner-top__name, .scanner-brand ｜ Mobile scanner · spec 5.1.5.14 (standalone phone
- `search-collapse.css` — .search-collapse, .search-collapse__field, .search-collapse__close ｜ search-collapse — 收合於工具列的搜尋（點放大鏡展開成 field-pill）
- `section-nav.css` — .section-nav-layout, .section-nav, .section-nav__item, .settings-nav__item, .section-nav__item--active ｜ section-nav.css · 側欄分節導覽（一頁多節，左邊選、右邊看）
- `segmented.css` — .segmented, .segmented__btn, .segmented__btn--active, .segmented__btn--icon, .segmented--locked ｜ Segmented control · 2/3-way text toggle in a mut
- `selection-card.css` — .selection-grid, .selection-grid--3, .selection-card, .selection-card--active, .selection-card__title ｜ Selection card — click-to-select 1-of-N card wit
- `session-list.css` — .session-list, .session-list__row, .session-list__no, .session-list__fields, .session-list__row--main ｜ Session list — 系列場次清單（2026-08-06）
- `settings.css` — .settings-layout, .settings-layout--stacked, .settings-nav, .settings-section, .settings-section__title ｜ Ztor Creator Studio - Settings layout, nav, and 
- `size-chart-editor.css` — .sce, .sce__wrap, .sce__table, .sce__head, .sce__row ｜ size-chart-editor — 尺寸表編輯矩陣（列＝尺碼、欄＝量測項，兩個維度都可增刪）
- `social-links.css` — .social-links, .social-links__row, .social-links__head, .social-links__label, .social-links__mark ｜ social-links.css · 社群連結清單（平台一列一格＋新增＋平台清單）
- `sortable.css` — .sort-th, .sort-th--end, .sort-th__ind, .ztor-table, .table-head ｜ Ztor — Sortable columns
- `source-import.css` — .source-import, .source-gate, .source-gate__head, .source-gate__titles, .source-gate__acts ｜ Source import · 從外部平台搜尋一筆既有紀錄帶入表單
- `source-status.css` — .src-status, .src-status__pill, .src-status__dot, .src-status__chevron, .src-status__panel ｜ Source status · 資料來源狀態（spec 5.1.7.8 F1 · D159）
- `sparkline.css` — .sparkline, .sparkline__plot, .sparkline__main, .sparkline__canvas, .sparkline__svg ｜ Sparkline · 卡片內的微型走勢圖（無座標軸、無標籤、無互動）
- `spec-row.css` — .spec-row ｜ spec-row — 逐筆規格列（規格名稱＋規格值＋行尾刪除鈕）
- `split-bar.css` — .split-bar, .split-bar__track, .split-bar__seg, .split-bar__legend, .split-bar__row ｜ split-bar — 一個總量拆成幾塊（2026-08-31 建）
- `split-button.css` — .split-button, .split-button__main, .split-button__caret ｜ Split button · a primary action joined to a care
- `stack.css` — .stack, .stack--tight, .stack--loose, .stack--bento ｜ Stack · 區塊之間的垂直間距（2026-08-11 使用者指示）
- `stat-row.css` — .stat-row, .stat, .stat__label, .stat__value, .stat__value--success ｜ stat-row.css · 卡內大數字排
- `state-check.css` — .state-checks, .state-check, .state-check--on, .state-check__mark, .state-checks--stack ｜ State check · 一列並排的「開／關」狀態指示
- `status-axes.css` — .status-axes, .status-axes--split ｜ Status axes · two INDEPENDENT order status track
- `step-list.css` — .step-list, .step-list__row, .step-list__row--interactive, .step-list__act, .step-list__body ｜ Step list · 階段清單（2026-08-18）
- `stepper.css` — .zstep, .zstep--nounit, .zstep__btns, .zstep__btn ｜ Stepper — house up/down control for number input
- `sticky-actions.css` — .sticky-actions, .sticky-actions__inner, .main ｜ Sticky page actions — keep a page's top CTAs rea
- `stock-allocation.css` — .salloc, .salloc__row, .salloc__row--head, .salloc__row--pool, .salloc__row--cap ｜ stock-allocation.css · 庫存分配表（spec 0-設計規格書 §7.14 
- `stock-bar.css` — .stock-bar, .stock-bar__fill, .stock-bar__fill--low ｜ Stock Bar — 細長量條（庫存水位／用量比例）
- `stock-history.css` — .shist__date, .shist__type, .shist__end, .shist__delta, .shist__child ｜ Stock history · 庫存歷史紀錄（2026-09-11，自 lab-stock-hi
- `stock-readout.css` — .stock-readout, .stock-readout__num, .stock-readout__unit ｜ Stock Readout — 唯讀數量讀數（大數字＋單位＋狀態徽章）
- `stock-tip.css` — .stock-tip, .stock-tip__pop, .stock-tip__row, .stock-tip__name, .stock-tip__qty ｜ Ztor — Stock tip (extra stock info on hover)
- `store-settings.css` — .ss-stack, .ss-url, .ss-url__prefix, .ss-url__input, .ss-status
- `switch.css` — .switch, .switch--on, .switch--locked ｜ Switch — binary on/off toggle (form control).
- `table.css` — .ztor-table, .ztor-table-scroll, .card, .ztor-table__feature, .fee-tree__panel ｜ Ztor — Table
- `tabs.css` — .tabs, .tabs__item, .tabs__item--active, .tabs__item-count, .tabs--count-plain ｜ Tabs — horizontal tab bar with hairline underlin
- `tag-input.css` — .tag-input, .tag-input__field, .tag-input__entry, .tag-input__suggest-label ｜ Tag input · creator-built / selectable tags
- `ticket-preview.css` — .ticket-preview, .ticket-preview--custom-bg, .ticket-preview__top, .ticket-preview__when, .ticket-preview__logo ｜ Ticket preview — 票根即時預覽（建立活動步驟 5「票券銷售」）
- `ticket-tier-card.css` — .tier-grid, .tier-list, .tier-toolbar, .tier-toolbar__actions, .tier-add ｜ Ticket tier card — 票種卡（spec 5.1.6.1 F9 / F9.1 / 
- `tier-arc.css` — .tier-arc, .tier-arc__ringwrap, .tier-arc__ring, .tier-arc__track, .tier-arc__seg ｜ tier-arc — 層層包含的分層弧（2026-09-01 建）
- `tier-overview.css` — .tier-ov, .tier-ov--compact, .tier-ov__head, .tier-ov__row, .tier-ov__rowlabel ｜ Tier overview — 分級對照表（唯讀）
- `toast.css` — .ztor-toasts, .ztor-toast, .ztor-toast__icon, .ztor-toast--error, .ztor-toast__text ｜ Ztor — Toast
- `todo-list.css` — .todo-list, .todo-list__row, .todo-list__row--done, .todo-list__body, .todo-list__text ｜ todo-list.css · 可編輯的待辦清單（勾選 ＋ 自行增刪）
- `upload-tile.css` — .upload-tile, .upload-tile__act, .upload-tile--file, .upload-tile--slim, .upload-tile--video ｜ Upload tile · dashed upload affordance for creat
- `variant-builder.css` — .variant-builder, .option-set, .option-set__row, .option-set__add, .option-set__name ｜ Variant builder · Shopify-style options + per-va
- `vault-share.css` — .vshare, .vshare__section, .vshare__label, .vshare__hint, .vshare__intent ｜ Vault share · 加密連結／NFC 鑰匙的發放面板
- `vip-card.css` — .vip-card, .vip-card__settings, .vip-card__head, .vip-card__title, .vip-card__sub-desc ｜ VIP card · 會員卡卡面自訂器（數位商品分類＝會員卡）
- `waterfall.css` — .waterfall, .waterfall__row, .waterfall__head, .waterfall__name, .waterfall__meta
- `wizard-split.css` — .wizard-split, .wizard-split__main, .wizard-split__rail, .wizard-split--narrow, .fd-ov ｜ Wizard split — content column + sticky summary r
- `work-card.css` — .work-cards__wrap, .work-cards__nav, .work-cards__nav--prev, .work-cards__nav--next, .work-cards ｜ Work card · 創作者自己那一批「進行中的項目與活動」的封面磚
- `zselect.css` — .zselect__native, .zselect__trigger, .zselect__lead, .zselect__option, .zselect__label ｜ zselect — 下拉選單的房內樣式（2026-07-28 使用者裁示：「下拉的樣式還不是我們
