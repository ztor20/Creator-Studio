# DS 速查索引（機器生成，勿手改）

> 由 `gen_ds_index.py` 從 `ds-components/` 與設計系統文件產生；Stop hook 與 check_ds_sync 沒有 FAIL 時自動重生，
> 手動重生：專案根執行 `python3 ../../Skills/project-ui-creator/scripts/gen_ds_index.py "site/app"`。
> 用途：**動手改 UI 前先掃這頁，照順序看**：要拼畫面或流程先找 Pillar 5 的 pattern（照它挑元件、排版）→ 再找 Pillar 4 的元件 → 值一律用 Pillar 1 的 token，不寫死。
> 流程：先看產品規格 → 找 pattern（照做／大致適用就加變體、不改原 pattern／會重複用才建新 pattern，只有這頁就記 BUILD-SPEC）→ 找元件（用現成／差一點加變體／只有一頁用就留在頁面／都沒有才建新元件）→ 把這頁記成 pattern 卡的實例。
> 本檔是設計系統的**速查版**（Pillar 5、4、1）；要修改時先讀入口 `design-system.md`（Do / Don't＋對照表），
> 再照對照表讀完整版（`ds-pillars/`）或元件列尾的 `ds-specs/` 規格檔；人看的是 `design-system.html`。只列亮色值，暗色屬 Pillar 3。

## Pillar 5 速查 · Pattern（拼畫面與流程的做法，共 13 種）

- 5.1.1 Dashboard home（Layout） ｜ 什麼時候用：The landing surface after login — the creator needs a one-glance read of money, alerts, and what to do next. ｜ 展示頁 `design-system-pattern.html#pattern-dashboard`
- 5.1.2 Tabbed section view（Layout） ｜ 什麼時候用：One entity has parallel sub-views of the same dataset (Earnings: Overview / Transactions / Payouts / Tax · E-… ｜ 展示頁 `design-system-pattern.html#pattern-tabbed`
- 5.1.3 Filter + list（Interaction） ｜ 什麼時候用：A long, filterable record set the creator scans and acts on (Earnings transactions, payouts, products, fans). ｜ 展示頁 `design-system-pattern.html#pattern-filter-list`
- 5.1.4 Lifecycle states（Lifecycle / State） ｜ 什麼時候用：Any data region that can be empty, loading, or failing — applies to every list, KPI, chart, and panel. ｜ 展示頁 `design-system-pattern.html#pattern-lifecycle`
- 5.1.5 Multi-step wizard（Workflow） ｜ 什麼時候用：A create flow with 3–4 dependent steps — 建立一件東西、步驟彼此相依（見下方實例）。 ｜ 展示頁 `design-system-pattern.html#pattern-wizard`
- 5.1.6 Form assembly（Workflow） ｜ 什麼時候用：Any create / edit form — wizard steps, settings forms, create-product / -event / -project sections. ｜ 展示頁 `design-system-pattern.html#pattern-form-assembly`
- 5.1.7 Settings page（Layout） ｜ 什麼時候用：A page of read-mostly toggles and account values（Settings 主頁、店鋪設定、通知設定）. ｜ 展示頁 `design-system-pattern.html#pattern-settings`
- 5.1.8 Modal types 彈窗類型（Interaction） ｜ 什麼時候用：任何打斷目前頁面、要使用者完成一件事的浮層。 ｜ 展示頁 `design-system-pattern.html#pattern-modal`
- 5.1.9 Split preview（Layout） ｜ 什麼時候用：Editing where the creator needs a live fan-side view — create-product / create-auction preview, e-shop "See a… ｜ 展示頁 `design-system-pattern.html#pattern-split-preview`
- 5.1.10 Detail + persistent rail（Layout） ｜ 什麼時候用：An entity page where editing is split across tabs, but a handful of read-only facts must never leave view — p… ｜ 展示頁 `design-system-pattern.html#pattern-detail-rail`
- 5.1.11 Destructive confirm（Interaction） ｜ 什麼時候用：一個按下去就收不回來的動作——作廢明細、刪除商品／草稿／活動、停用帳號。可逆的動作（存草稿、下架、切換顯示）不走這張卡，直接做完給 toast。 ｜ 展示頁 `design-system-pattern.html#pattern-destructive-confirm`
- 5.1.12 Export confirm（Interaction） ｜ 什麼時候用：創作者已篩好一份清單、要把它拿成檔案——訂單管理、活動交易明細。檔案照目前的篩選結果，所以下載前先講會有幾筆。 ｜ 展示頁 `design-system-pattern.html#pattern-export-confirm`
- 5.1.13 Pre-publish preview（Workflow） ｜ 什麼時候用：要對粉絲公開的東西（活動、商品、組合包、專案、作品）建立或改完、送出之前，讓創作者看一次粉絲端長什麼樣，順便檢查各語系的內容；發布後回頭改語系或內容時也用同一個畫面。 ｜ 展示頁 `design-system-pattern.html#pattern-prepublish`

### 其他通則（文案、狀態、資料視覺化、流程）

- 5.2 Voice & Microcopy
- 5.3 States & Interaction
- 5.4 Data Visualization
- 5.5 Workflow patterns

## Pillar 4 速查 · 元件（ds-components/，共 139 支；主 class 前 5 個 ｜ 用途 ｜ 規格檔）

- `accordion.css` — .ztor-accordion, .ztor-accordion__item, .ztor-accordion__trigger, .ztor-accordion__chevron, .ztor-accordion__content ｜ Collapsible sections (chevron-rotate, height transition) ｜ 規格 `ds-specs/4.14-accordion.md`
- `admin-ip-bank-table.css` — .admin-table-wrap, .admin-table-wrap--fluid, .admin-table-wrap--menu, .admin-table__film, .admin-table__thumb ｜ Admin IP Bank 與 Reporting 的 Film／Owner 分配表與報表篩選列 ｜ 規格 `ds-specs/admin-ip-bank-table.md`
- `album-tracks.css` — .album-tracks, .album-tracks__upload, .album-tracks__upload-label, .album-tracks__req, .album-tracks__upload-hint ｜ 數位音樂專輯的多曲目管理，可上傳、拖曳排序、改名與換封面 ｜ 規格 `ds-specs/album-tracks.md`
- `alert.css` — .alert, .alert--card, .alert--snoozed, .alert--row, .alert--banner ｜ 儀表板提示面板、頁內警示與頁面公告共用的提示條 ｜ 規格 `ds-specs/4.13-alert.md`
- `amount-field.css` — .amount-field, .amount-field__unit, .amount-field__sym, .amount-field__chev, .amount-field--readonly ｜ 附單位符號的金額輸入欄，單位可為固定符號或可切換的開關 ｜ 規格 `ds-specs/amount-field.md`
- `avatar.css` — .ztor-avatar, .ztor-avatar--lg, .ztor-avatar--sm ｜ 姓名首字的識別圓，40px（`.ztor-avatar`）、32px（`--sm`）與 64px（`--lg`）三尺寸 ｜ 規格 `ds-specs/4.202-avatar.md`
- `badge.css` — .ztor-metric-pill, .ztor-metric-pill__icon, .ztor-badge, .ztor-badge--success, .ztor-badge--error ｜ 儀表板、收入與撥款頁的狀態徽章和分類標籤，有橘、綠、紅、藍等語意色 ｜ 規格 `ds-specs/4.3-badge-status-pill.md`
- `benefit-matrix.css` — .bmx, .bmx__head, .bmx__head-label, .bmx__tier, .bmx__tier-count ｜ 權益比較矩陣：一份權益目錄（列）× 四個粉絲分級（欄），取代舊版四張獨立分級卡。詳見 §4.93 ｜ 規格 `ds-specs/4.93-benefit-matrix.md`
- `bento.css` — .bento, .bento--top, .bento__stack, .bento__stack--fill ｜ 12-col responsive grid · KPI rows, dashboard pairs, settings layouts ｜ 規格 `ds-specs/4.25-bento-grid.md`
- `brand-card.css` — .brand-grid, .brand-card, .brand-card__head, .brand-card__logo, .brand-card__mark ｜ 品牌合作目錄卡，分開陳列鎖定的合作條款與創作者可編輯的活動 ｜ 規格 `ds-specs/4.94-brand-card.md`
- `bundle-editor.css` — .fc-bundle-col, .fc-bundle, .fc-bundle__body, .bd-group, .bd-group__title ｜ 建立組合包時的編輯區，含商品挑選、庫存開關與販售設定 ｜ 規格 `ds-specs/bundle-editor.md`
- `bundle-preview-card.css` — .bpc__title, .bpc, .bpc__list, .bpc__row, .bpc__what ｜ 組合包編輯器右欄的粉絲端預覽卡，顯示內含清單、價格與加入購物車鈕 ｜ 規格 `ds-specs/4.213-bundle-preview-card.md`
- `button.css` — .btn, .btn--primary, .btn--outline, .btn--ghost, .btn--destructive ｜ 主要行動、步驟列與頁首動作用的按鈕，有 primary、outline、ghost 等樣式 ｜ 規格 `ds-specs/4.2-button.md`
- `calc-list.css` — .calc-list, .form-section--card, .calc-list--framed, .calc-list__how, .calc-list__sum ｜ 算式列表：一行一項、列首一個運算子（＋ − ＝）、末列是結果 ｜ 規格 `ds-specs/4.217-calc-list.md`
- `card-group.css` — .group-title, .group-desc, .group-divider, .card-head, .card-head__title ｜ 卡片內的資訊分組，用次級標題或分隔線區分不同組內容 ｜ 規格 `ds-specs/card-group.md`
- `card.css` — .ztor-card, .ztor-card--clickable, .ztor-card__title, .ztor-card__meta, .ztor-card__body ｜ Section wrappers w/ head row across all product pages ｜ 規格 `ds-specs/4.11-card.md`
- `chart-tip.css` — .linechart__main, .fin-hitline, .fin-area, .fin-guide, .fin-marker ｜ 折線圖滑過時的浮層與熱區，點擊可開啟明細 ｜ 規格 `ds-specs/4.95-chart-tip.md`
- `chart.css` — .linechart, .linechart__svg, .linechart__grid, .linechart__area, .linechart__line ｜ 折線圖、堆疊長條、來源圖例與排名長條等 SVG 圖表群 ｜ 規格 `ds-specs/4.24-chart.md`、`ds-specs/chart-card.md`、`ds-specs/rank-bars-source-breakdown.md`
- `checkbox.css` — .zcheck, .zcheck__control, .zcheck__input, .zcheck__box, .zcheck__label ｜ 全站自繪的核取方塊，取代原生方塊並支援不確定狀態 ｜ 規格 `ds-specs/4.96-checkbox.md`
- `chip.css` — .chip-group, .chip-group--loose, .chip, .chip--active, .chip--static ｜ Earnings transactions filter, Tax year filter, supported regions ｜ 規格 `ds-specs/4.5-chip.md`
- `code-picker.css` — .code-picker, .code-picker__field, .chip__tag, .code-picker__tbl, .code-picker__head ｜ 商品與組合包的優惠碼選擇欄，以卡片列表呈現並可彈窗新增 ｜ 規格 `ds-specs/4.239-code-picker.md`
- `collapse-group.css` — .collapse-head, .collapse-head__toggle, .collapse-head__chev, .collapse-head__sum, .collapse-head__sum--todo ｜ 可收合的欄位群組，折疊時只留一行標題與值的摘要，用於活動場次 ｜ 規格 `ds-specs/collapse-group.md`
- `combobox.css` — .combobox, .combobox__menu, .combobox__group, .combobox__opt, .combobox__opt-icon ｜ 可輸入搜尋並多選的下拉建議欄，已選項目以 chip 呈現 ｜ 規格 `ds-specs/combobox.md`
- `completeness.css` — .completeness, .completeness__head, .completeness__label, .completeness__count, .completeness__track ｜ label＋x/y＋進度條（素材包完整度） ｜ 規格 `ds-specs/4.22j-completeness-meter.md`
- `cond-list.css` — .cond-list, .cond-list__item, .cond-list__head, .cond-list__title, .cond-list__remove ｜ 「好幾種條件各加一次」的清單，從新增條件選單挑一種加入，加過的種類不再出現 ｜ 規格 `ds-specs/4.227-condition-list.md`
- `control-row.css` — .control-row, .control-row__main, .control-row__sub, .control-group, .control-group--plain ｜ 一列式設定框，左邊放標籤與說明、右邊放開關、數字或按鈕 ｜ 規格 `ds-specs/4.29-payout-bank-picker-dialog.md`
- `data-list.css` — .data-list, .data-list__row, .data-list__group-label, .data-list__row-main, .data-list__row--disabled ｜ 收入、交易、撥款與商品等清單用的資料列，一列一筆資料 ｜ 規格 `ds-specs/4.22-data-list.md`
- `date-input.css` — .date-input, .date-input__icon, .date-input__ph ｜ 為日期與時間欄位加上「選擇日期」佔位字的裝飾層 ｜ 規格 `ds-specs/date-input-placeholder.md`
- `date-range.css` — .date-range, .date-range__label, .date-range__field, .date-range__sep, .date-range__clear ｜ 清單篩選列上的日期區間欄，兩個日期欄並排、可只填一邊 ｜ 規格 `ds-specs/4.238-date-range.md`
- `demand-focus.css` — .demand-focus, .demand-focus__head, .demand-focus__titles, .demand-focus__kicker, .demand-focus__title ｜ 選定市場後的常駐面板，顯示預測售罄天數與各尺寸計畫生產量 ｜ 規格 `ds-specs/4.226-demand-focus.md`
- `demand-table.css` — .demand-table__bar, .demand-table__title, .product-list--demand, .demand-market, .demand-market__name ｜ 市場需求表，列出各市場的需求指數、建議與計畫生產量及差距 ｜ 規格 `ds-specs/4.225-demand-table.md`
- `detail-rail.css` — .detail-grid, .detail-main, .detail-grid--full, .detail-cards, .form-section--outlined ｜ 詳情頁兩欄殼，左邊是可編輯主欄，右邊是固定的唯讀資訊欄 ｜ 規格 `ds-specs/4.52-detail-rail.md`
- `detail-sheet.css` — .detail-sheet, .detail-sheet__panel, .detail-sheet__head, .detail-sheet__back, .detail-sheet__title ｜ 清單頁點列開細節頁的全螢幕 iframe 覆蓋層，取代整頁導航 ｜ 規格 `ds-specs/4.97-detail-sheet.md`
- `donut-mix.css` — .donut-mix, .donut-mix__ringwrap, .donut-mix__ring, .donut-mix__track, .donut-mix__seg ｜ 一個總數拆成幾塊、畫成圓環 ｜ 規格 `ds-specs/donut-mix.md`
- `drawer.css` — .drawer, .drawer__scrim, .drawer__panel, .drawer--wide, .drawer--full ｜ 從右側滑出的面板，用於不離開當前頁就查看詳情、歷史或說明 ｜ 規格 `ds-specs/drawer.md`
- `dropdown-menu.css` — .dropdown, .dropdown__menu, .dropdown__item, .dropdown--left, .dropdown--up ｜ 點開後列出動作的下拉選單，觸發鈕可為主要按鈕或更多圖示鈕 ｜ 規格 `ds-specs/4.26-dropdown-menu.md`
- `earnings-feed.css` — .earnings-feed, .earnings-feed__item, .earnings-feed__name, .earnings-feed__amount, .earnings-feed__amount--neg ｜ 儀表板第一屏右欄的「近期收入」：一筆交易一個框 ｜ 規格 `ds-specs/earnings-feed.md`
- `embed-modal.css` — .embed-modal, .embed-modal__sheet, .embed-modal__head, .embed-modal__title, .embed-modal__close ｜ 全螢幕彈窗內嵌另一頁，不離開清單就能開啟商店設定等頁面 ｜ 規格 `ds-specs/4.97-detail-sheet.md`
- `empty-card.css` — .empty-card, .empty-card--framed, .card, .empty-card__icon, .empty-card__icon--primary ｜ 卡片內「已載入但無資料」空狀態 ｜ 規格 `ds-specs/4.22h-empty-card.md`
- `empty-stub.css` — .empty-stub, .empty-stub__inner, .empty-stub__mark, .empty-stub__title, .empty-stub__sub ｜ Routes not yet built (orange mark + display title + spec refs) ｜ 規格 `ds-specs/4.17-empty-stub.md`
- `entry-list.css` — .entry-list, .entry-list__row, .entry-list__add, .entry-list--extras, .entry-list__row--extras ｜ 一個欄位收不定筆數的同型短文字，一列一格輸入框加刪除鈕，下方新增一列 ｜ 規格 `ds-specs/4.118-entry-list.md`
- `event-preview-card.css` — .event-preview-card, .event-preview-card__poster, .event-preview-card--landscape, .event-preview-card__type-tag, .event-preview-card__body ｜ 建立活動粉絲視角活動卡（即時預覽） ｜ 規格 `ds-specs/4.22p-event-preview-card.md`
- `explainer.css` — .explain-btn, .explain, .explain__dialog, .explain__head, .explain__title ｜ 欄位旁 info 圖示開正式說明彈窗，取代重複提示 ｜ 規格 `ds-specs/4.98-explainer.md`
- `export-dialog.css` — .export-summary, .export-summary__count, .export-summary__num, .export-summary__unit, .export-summary__filters ｜ 匯出視窗的內容區，上方顯示這次匯出摘要，下方列匯出紀錄 ｜ 規格 `ds-specs/export-dialog.md`
- `fan-phone.css` — .fan-phone, .preview-col--tall, .wizard-split__rail, .preview-col ｜ 建立流程右欄的粉絲頁手機版鏡像框，商品與活動預覽共用 ｜ 規格 `ds-specs/4.243-fan-phone.md`
- `fan-shop.css` — .fep-shop, .fep-shop--event ｜ 粉絲端頁面的 1:1 鏡像（活動、商品、組合包、專案四種頁），給發布前預覽用（pattern 5.1.13）；fan-shop.css 不得被其他頁引用 ｜ 規格 `ds-specs/4.215-fan-event-page.md`
- `fan-store.css` — .fan-store, .fan-store__overline, .fan-store__page, .fan-store__profile, .fan-store__avatar ｜ 電子商店與商店設定預覽用的粉絲端創作者頁手機版鏡像 ｜ 規格 `ds-specs/fan-store-preview.md`
- `field-more.css` — .field-more, .form-grid, .field-more__toggle, .field-more__icon, .field-more__body ｜ 把次要欄位收在「顯示更多」按鈕後面的表單收合區 ｜ 規格 `ds-specs/field-more.md`
- `field-pill.css` — .field-pill, .field-pill__icon, .field-pill__chevron, .field-pill__input, .field-pill__select ｜ Inline filter pill — search / select / dropdown-trigger ｜ 規格 `ds-specs/4.22c-field-pill.md`
- `field-source-tag.css` — .field-source, .field__label, .is-source-locked, .radio-cards, .segmented ｜ 欄位標籤旁標出這一格從哪裡帶進來（例如 bookyay），欄位被鎖定時仍可讀 ｜ 規格 `ds-specs/4.121-field-source-tag.md`
- `field-system.css` — .field, .field__label, .field__label--split, .field__label-aside, .field__hint ｜ ONE form field = label / hint / control slot（控件重用 atom） ｜ 規格 `ds-specs/field-system.md`
- `filter-tabs.css` — .filter-tabs, .filter-tabs__item, .filter-tabs__item--active, .filter-tabs__count, .filter-tabs__dot ｜ 主分頁下方的次級狀態篩選膠囊，附即時筆數 ｜ 規格 `ds-specs/filter-tabs.md`
- `follow-field.css` — .follow-fields, .follow-field, .follow-field__head, .follow-field__txt, .follow-field__t ｜ 跟隨活動或另設時間的設定列，用於票務商品的上架、下架、開賣與停售 ｜ 規格 `ds-specs/4.223-follow-field.md`
- `form-grid.css` — .form-grid, .form-grid--3, .form-grid__full ｜ 2 欄或 3 欄的表單欄位排版輔助，窄螢幕自動改單欄 ｜ 規格 `ds-specs/form-grid.md`
- `form-section.css` — .form-section, .form-section--dense, .form-section--outlined, .form-section__actions, .form-section__head ｜ 建立流程中的表單區段，含標題、說明與分隔線，可用外框變體 ｜ 規格 `ds-specs/form-section.md`
- `form-steps.css` — .form-steps ｜ 把同一張表單分成多步顯示，用於建立商品與建立組合包 ｜ 規格 `ds-specs/4.241-form-steps.md`
- `header.css` — .app-topbar, .app-topbar__brand, .app-topbar__brand-logo, .app-topbar__nav, .app-topbar__nav-group ｜ 所有頁面共用的 64px 頂部導覽列，含下拉選單與動作群 ｜ 規格 `ds-specs/4.20-header.md`
- `icon.css` — .ztor-icon, .ztor-icon--xs, .ztor-icon--sm, .ztor-icon--md, .ztor-icon--lg ｜ 全站按鈕、導覽、提示與資料列共用的圖示集（Tabler） ｜ 規格 `ds-specs/4.9-icon.md`
- `info-banner.css` — .info-banner, .info-banner__close, .info-banner--dismissible ｜ Contextual explanations (timing, region note, legal hint) ｜ 規格 `ds-specs/4.7-info-banner.md`
- `input.css` — .input, .textarea, .input--with-prefix, .select--with-prefix, .control-prefix ｜ Wizard fields, settings forms, search ｜ 規格 `ds-specs/4.8-input.md`
- `insight-row.css` — .insight-row, .insight-row__icon, .insight-row__text ｜ 圖表下單行自動洞察（無洞察隱藏） ｜ 規格 `ds-specs/4.22k-insight-row.md`
- `issue-panel.css` — .issue-panel, .issue-panel__head, .issue-panel__toggle, .issue-panel__title, .issue-panel__n ｜ 待辦事項面板：把「還等著創作者處理的事」整批攤開，依來源模組分組、一次展開一則 ｜ 規格 `ds-specs/issue-panel.md`
- `kpi.css` — .kpi, .card, .kpi__label, .kpi__value, .kpi__delta ｜ 儀表板與收入頁的關鍵指標卡，以大字顯示單一數字 ｜ 規格 `ds-specs/4.12-kpi.md`
- `kv-list.css` — .kv, .kv--lead, .kv__k, .kv__sub, .kv__sub--over ｜ 唯讀鍵值列（鍵左值右、逐列 hairline；2026-11-09 Fact list 併入，Q140）：詳情頁 meta 卡、狀態摘要 ｜ 規格 `ds-specs/4.50-kv-list.md`
- `leave-dialog.css` — .leave-dialog, .leave-dialog__scrim, .leave-dialog__card, .leave-dialog__close, .leave-dialog__title ｜ 建立／編輯流程的返回離開確認彈窗（spec §5.2.4），由 `partials/wizard-chrome.js` 注入、6 建立頁共用 ｜ 規格 `ds-specs/leave-dialog.md`
- `limit-set.css` — .limit-set, .limit-set__head, .limit-set__sub, .limit-set__act, .limit-set__fields ｜ 限購：一欄＋一句輔助說明、只換單位（件／組／張） ｜ 規格 `ds-specs/4.234-limit-set.md`
- `link-field.css` — .linkf, .linkf__label, .linkf__row, .linkf__input, .linkf__act ｜ 系統產生、不可編輯、要能整條帶走的連結：唯讀等寬輸入框吃滿寬、行尾複製與重置、底下一行說明 ｜ 規格 `ds-specs/4.206-link-field.md`
- `list-footer.css` — .list-footer, .list-footer__count, .list-footer--center ｜ 清單分頁頁尾（Showing N of M＋Load more） ｜ 規格 `ds-specs/4.22l-list-footer.md`
- `list-toolbar.css` — .list-toolbar, .list-toolbar__actions, .list-toolbar--filters, .list-toolbar__filters, .list-toolbar__filter ｜ 清單頁頭的工作列，左放主軸分頁、右放動作按鈕群 ｜ 規格 `ds-specs/4.90-list-toolbar.md`
- `listing-controls.css` — .lctl, .lctl__row, .lctl--locked, .lctl__row--locked, .lctl__lock-note ｜ 上架、顯示於商店與開賣三個獨立開關並列的設定區塊 ｜ 規格 `ds-specs/4.205-listing-controls.md`
- `lock-sets.css` — .lockset__sets, .lockset__sets-titles, .lockset__sets-title, .lockset__sets-hint, .lockset__sets-ctl ｜ 組合包鎖定套數區，設定鎖定幾套並逐項檢視各商品庫存分配 ｜ 規格 `ds-specs/4.210-lock-sets.md`
- `message-modal.css` — .payout-dialog, .msg-dialog, .msg-compose, .msg-field, .msg-field__label ｜ 群發撰寫 modal（Compose＋History） ｜ 規格 `ds-specs/4.22m-message-composer.md`、`ds-specs/4.22o-token-chip.md`
- `meter-list.css` — .meter-list__row, .meter-list__name, .meter-list__num, .meter-list__num--hot, .meter-list__row--off ｜ 逐項水位清單（名稱 → 量條 → 數字，三欄一線） ｜ 規格 `ds-specs/meter-list.md`
- `nest.css` — .nest, .form-section--outlined ｜ 嵌在卡片底緣的滿版子層（左右下三邊切齊母卡外緣），用於「切換模式後長出一整組設定」 ｜ 規格 `ds-specs/4.53-nest.md`
- `owner-lookup.css` — .owner-lookup, .owner-lookup__results, .owner-lookup__result, .owner-lookup__result--empty, .owner-lookup__flag ｜ 依顯示名稱、帳號或 email 搜尋平台使用者，結果是連結帳號或待邀請的 email ｜ 規格 `ds-specs/4.??-owner-lookup.md`
- `page-intro.css` — .page-intro, .page-intro__lead, .page-intro__media, .page-crumb, .page-crumb--back ｜ 頁面頂部的標題區，含 H1、副標題與可選動作，可在左側放主視覺 ｜ 規格 `ds-specs/page-intro.md`
- `pager.css` — .pager, .pager__ellipsis ｜ 清單底部的數字分頁器，放在表格下方切換頁數 ｜ 規格 `ds-specs/pager.md`
- `payout-modal.css` — .payout-bank-grid, .payout-bank-card, .payout-bank-card--selected, .payout-bank-card--add, .payout-bank-card__top ｜ 全站共用的彈窗殼（`.payout-modal`／`.payout-dialog`，pattern 5.1.8），與撥款銀行選擇卡、申請撥款彈窗 ｜ 規格 `ds-specs/4.29-payout-bank-picker-dialog.md`
- `perf-rank.css` — .perf-rank, .perf-rank__row, .perf-rank--nopct, .perf-rank--tight, .perf-rank--wide ｜ 「表現排行」統一列語法，給 8–11 列的長排行榜用；`.rank-bar` 仍留給 4–6 列的佔比場景。詳見 §4.103 ｜ 規格 `ds-specs/4.103-perf-rank.md`
- `picker.css` — .picker, .card, .payout-dialog, .picker__search, .picker__search-input ｜ Search + scrollable pick-list（Create bundle items、IP linker） ｜ 規格 `ds-specs/4.22b-picker.md`
- `pickup.css` — .scanner-access, .scanner-access__qr, .scanner-access--nomedia, .scanner-access--bare, .scanner-access__main ｜ 現場 QR 核銷工作區（spec 5.1.5.11 · D111），E-Shop 下與訂單管理並列 ｜ 規格 `ds-specs/pickup-management.md`
- `preview-card.css` — .preview-card, .preview-card__media, .preview-card__dots, .preview-card__dot, .preview-card__dot--on ｜ 粉絲端即時預覽卡（商品／拍賣，§5.2.5） ｜ 規格 `ds-specs/4.22e-preview-card.md`
- `preview-column.css` — .preview-split, .preview-split__form, .preview-split--narrow, .preview-split--phone, .preview-col ｜ 建立流程「表單｜預覽」兩欄版面＋右側 sticky 預覽欄 ｜ 規格 `ds-specs/preview-column.md`
- `preview-dock.css` — .preview-dock-toggle, .preview-dock__close, .wizard ｜ 多步驟建立流程的外框，含頂列、底列膠囊與全頁預覽區 ｜ 規格 `ds-specs/wizard-frame.md`
- `preview-panel.css` — .preview-panel, .preview-panel--inset, .wizard, .main, .preview-panel__backdrop ｜ 右側畫面分割面板承載即時預覽——壓窄 wizard、非浮層（§5.2.5） ｜ 規格 `ds-specs/4.22f-preview-panel.md`
- `product-list.css` — .product-list, .product-list__head, .product-list__row, .product-list--eshop, .product-list--bundles ｜ 電子商店庫存清單，顯示商品、狀態、庫存、可見性與編輯動作 ｜ 規格 `ds-specs/4.27-product-list.md`
- `product-post-modal.css` — .payout-dialog, .npp-intro, .npp-product, .npp-product__thumb, .npp-product__info ｜ 建立商品後在電子商店清單彈出的撰寫彈窗，可附上商品卡 ｜ 規格 `ds-specs/new-product-post.md`
- `progress-mark.css` — .pmark, .pmark--done, .pmark--doing, .pmark--alert, .pmark--today ｜ 進度記號：一顆記號、兩個消費者共用（時間軸與總覽的進度摘要） ｜ 規格 `ds-specs/progress-mark.md`
- `progress-stepper.css` — .progress-stepper, .progress-stepper__track, .progress-stepper__fill, .progress-stepper--segmented, .progress-stepper__labels ｜ 嚮導的進度條，細軌加品牌漸層填充，下方列出各步驟標籤 ｜ 規格 `ds-specs/progress-stepper.md`
- `project-list.css` — .project-list, .project-list__head, .project-list__row, .project-list__status, .project-list__image ｜ 專案清單表格，顯示目標進度、剩餘時間、類別與狀態，整列可點入明細 ｜ 規格 `ds-specs/4.28-project-list.md`
- `publish-preview.css` — .pp-toolbar, .pp-lang-tabs, .pp-view-toggle, .pp-banner, .pp-preview-slot ｜ 發布前預覽確認層，以彈窗顯示各語言版本的預覽內容 ｜ 規格 `ds-specs/publish-preview.md`
- `publish-stage.css` — .pstage, .pstage__main, .pstage__side, .pstage__side-inner, .pstage__foot ｜ 發布前預覽確認的全頁畫面，多步驟流程的最後一步 ｜ 規格 `ds-specs/4.216-publish-stage.md`
- `radio-card.css` — .segmented, .radio-cards, .radio-cards--icon, .radio-card__icon, .radio-card__text ｜ 並排的可選卡片，標題加說明，選取時以橘色小圓點標示 ｜ 規格 `ds-specs/radio-card.md`
- `radio-list.css` — .radio-list, .radio-list__item, .radio-list__trigger, .radio-list__dot, .radio-list__item--active ｜ 輕量的垂直單選清單，每列有單選圓點、標題與可選說明 ｜ 規格 `ds-specs/4.96-checkbox.md`
- `readiness.css` — .readiness, .readiness__head, .readiness__title, .readiness__list, .readiness__item ｜ 上架前就緒檢查＋還差幾項 banner ｜ 規格 `ds-specs/4.22g-readiness-card.md`
- `restock-modal.css` — .restock-table, .restock-table__head, .restock-table__row, .restock-table__col, .restock-table__group ｜ E-Shop restock popup (spec §5.1.5.6, D104 order + D106 member tabs); plus an ad… ｜ 規格 `ds-specs/4.29c-restock-order.md`
- `review-row.css` — .review-row, .review-row__item, .review-row__head, .review-row__name, .review-row__action ｜ 流程 Review 步驟的摘要列，顯示欄位名、值與右側編輯連結 ｜ 規格 `ds-specs/4.49-review-row.md`
- `review-status.css` — .review-status, .review-status--flat, .review-status__head, .review-status__thumb, .review-status__title ｜ 送審件的狀態面板，顯示審核狀態、退件理由與可用的動作 ｜ 規格 `ds-specs/4.119-review-status.md`
- `rich-body.css` — .rich-body, .rich-body__blocks, .rich-body__block, .rich-body__main, .rich-body__grip ｜ 描述區塊編輯器：描述＝一串可排序的區塊，三種型別——文字／圖片／影片 ｜ 規格 `ds-specs/4.222-rich-body.md`
- `row-disclosure.css` — .rowdis__group, .product-list-scroll, .rowdis__group--gutter, .rowdis__head, .rowdis__label ｜ 母列收成一列、點開才看到底下每一筆 ｜ 規格 `ds-specs/4.204-row-disclosure.md`
- `sched-restore.css` — .sched-restore, .sched-restore__label, .sched-restore__group, .sched-restore__list, .sched-restore__item ｜ 重新上架被擋下時的提示區塊，逐列列出已過期或未通過檢查的時間 ｜ 規格 `ds-specs/schedule-restore.md`
- `search-collapse.css` — .search-collapse, .search-collapse__field, .search-collapse__close ｜ 收合於工具列的搜尋：平常只見放大鏡、點擊滑開成 field-pill（重用 field-pill、不重造輸入） ｜ 規格 `ds-specs/search.md`、`ds-specs/search-collapse.md`
- `section-nav.css` — .section-nav-layout, .section-nav, .section-nav__item, .settings-nav__item, .section-nav__item--active ｜ 分頁內的側欄分節導覽 ｜ 規格 `ds-specs/4.22h0-section-nav.md`
- `section-outline.css` — .section-outline-host, .section-outline, .section-outline--gutter, .section-outline__inner, .section-outline__head ｜ 長表單的本頁大綱：直排細字清單，目前節亮起＋左側細線（scroll-spy），點擊平滑捲到該節 ｜ 規格 `ds-specs/4.233-section-outline.md`
- `section-tabs.css` — .section-tabs, .section-tabs--dialog, .section-tabs--rail, .section-tabs--wizard ｜ 長表單頂端的分節分頁：點了平滑捲到那一段、捲動時亮目前那一段（scrollspy）、←／→／Home／End 鍵盤可移 ｜ 規格 `ds-specs/4.214-section-tabs.md`
- `segmented.css` — .segmented, .segmented__btn, .segmented__btn--active, .segmented__btn--icon, .segmented--locked ｜ 2/3-way text toggle ｜ 規格 `ds-specs/4.22d-segmented.md`
- `selection-card.css` — .selection-grid, .selection-grid--3, .selection-card, .selection-card--active, .selection-card__title ｜ 嚮導選項卡與設定頁主題、顯示模式的單選卡片 ｜ 規格 `ds-specs/4.18-selection-card.md`
- `settings.css` — .settings-layout, .settings-layout--stacked, .settings-nav, .settings-section, .settings-section__title ｜ Dense label + hint + value/control/action row ｜ 規格 `ds-specs/4.48-store-settings-page.md`
- `size-chart-editor.css` — .sce, .sce__wrap, .sce__table, .sce__head, .sce__row ｜ 兩個維度都能增減的尺寸表編輯器，商店與商品的尺寸指南共用 ｜ 規格 `ds-specs/4.115-size-chart-editor.md`
- `size-mix.css` — .size-mix, .size-mix__slot, .size-mix__bar, .size-mix__fill, .size-mix__val ｜ 各尺寸占比：每個尺寸一格固定寬的小直條，依尺寸順序排，整張表同一尺寸落在同一欄、上下列可直接比 ｜ 規格 `ds-specs/4.224-size-mix.md`
- `sortable.css` — .sort-th, .sort-th--end, .sort-th__ind, .ztor-table, .table-head ｜ 全站表格排序互動：欄位標題包成按鈕，靜止態與純文字標題一致 ｜ 規格 `ds-specs/4.104-sortable.md`
- `source-status.css` — .src-status, .src-status__pill, .src-status__dot, .src-status__chevron, .src-status__panel ｜ 不占版位的資料涵蓋指示＋來源明細面板 ｜ 規格 `ds-specs/4.112-source-status.md`
- `sparkline.css` — .sparkline, .sparkline__plot, .sparkline__main, .sparkline__canvas, .sparkline__svg ｜ 數字的附註型微型走勢圖 ｜ 規格 `ds-specs/sparkline.md`
- `spec-row.css` — .spec-row ｜ 建立商品時可重複新增的詳細規格列，每列有規格名稱、值與刪除鈕 ｜ 規格 `ds-specs/spec-row.md`
- `split-bar.css` — .split-bar, .split-bar__track, .split-bar__seg, .split-bar__legend, .split-bar__row ｜ 一個總數＋它的組成：分段長條與圖例 ｜ 規格 `ds-specs/split-bar.md`
- `split-button.css` — .split-button, .split-button__main, .split-button__caret ｜ 主操作加箭頭下拉相關動作的按鈕 ｜ 規格 `ds-specs/4.2-button.md`
- `stack.css` — .stack, .stack--tight, .stack--loose, .stack--bento ｜ 區塊之間垂直間距的唯一規則：間距由容器承擔（`gap`），子元素不各自加 margin ｜ 規格 `ds-specs/stack.md`
- `stat-row.css` — .stat-row, .stat, .stat__label, .stat__value, .stat__value--success ｜ 卡內大數字排（取代把 `.kpi` 塞進卡片） ｜ 規格 `ds-specs/4.22h1-stat-row-meter-list-day-bars.md`
- `state-check.css` — .state-checks, .state-check, .state-check--on, .state-check__mark, .state-checks--stack ｜ 唯讀的開關狀態排，以圓形勾選標記顯示各項目的開或關 ｜ 規格 `ds-specs/4.209-state-check.md`
- `stepper.css` — .zstep, .zstep--nounit, .zstep__btns, .zstep__btn ｜ 數字輸入框的上下增減鈕，取代原生 spin button ｜ 規格 `ds-specs/4.105-numeric-stepper.md`
- `sticky-actions.css` — .sticky-actions, .sticky-actions__inner, .main ｜ 頂部 CTA 捲出畫面後在底部浮現複製版動作列；全站消費最廣的元件之一（15 頁）。詳見 §4.106 ｜ 規格 `ds-specs/4.106-sticky-actions.md`
- `stock-bar.css` — .stock-bar, .stock-bar__fill, .stock-bar__fill--low ｜ 5px 細長量條（庫存水位／用量比例），必與精確數字並列 ｜ 規格 `ds-specs/4.51-stock-bar.md`
- `stock-history.css` — .shist__date, .shist__type, .shist__end, .shist__delta, .shist__child ｜ 庫存歷史紀錄，每筆補貨或鎖定一列，可展開看逐組合明細 ｜ 規格 `ds-specs/4.208-stock-history.md`
- `stock-tip.css` — .stock-tip, .stock-tip__pop, .stock-tip__row, .stock-tip__name, .stock-tip__qty ｜ 圖示旁的說明提示（`.tip`，shared.css）；資訊卡型變體＝清單儲存格 hover 浮出的 Stock tip ｜ 規格 `ds-specs/tooltip.md`
- `switch.css` — .switch, .switch--on, .switch--locked ｜ 設定頁通知、商店顯示、自動撥款等二選一開關的切換控件 ｜ 規格 `ds-specs/4.6-switch.md`
- `table.css` — .ztor-table, .ztor-table-scroll, .card, .ztor-table__feature, .fee-tree__panel ｜ Earnings transactions 9-col table ｜ 規格 `ds-specs/4.23-table.md`
- `tabs.css` — .tabs, .tabs__item, .tabs__item--active, .tabs__item-count, .tabs--count-plain ｜ 頁面內切換檢視的分頁籤，用於收入、商品類型與專案狀態 ｜ 規格 `ds-specs/4.15-tabs.md`
- `tag-input.css` — .tag-input, .tag-input__field, .tag-input__entry, .tag-input__suggest-label ｜ 商品標籤輸入欄，已選標籤以 chip 呈現並提供建議標籤 ｜ 規格 `ds-specs/tag-input.md`
- `ticket-tier-card.css` — .tier-grid, .tier-list, .tier-toolbar, .tier-toolbar__actions, .tier-add ｜ 建立活動時的票種卡，可收合檢視價格與數量，展開後編輯 ｜ 規格 `ds-specs/4.114-ticket-tier-card.md`
- `tier-overview.css` — .tier-ov, .tier-ov--compact, .tier-ov__head, .tier-ov__row, .tier-ov__rowlabel ｜ 權益比較矩陣：一份權益目錄（列）× 四個粉絲分級（欄），取代舊版四張獨立分級卡。詳見 §4.93 ｜ 規格 `ds-specs/4.93-benefit-matrix.md`
- `toast.css` — .ztor-toasts, .ztor-toast, .ztor-toast__icon, .ztor-toast--error, .ztor-toast__text ｜ 畫面底部中央的短暫確認提示（由下往上滑入）＋「未儲存/已儲存」狀態列（`.save-status`） ｜ 規格 `ds-specs/4.107-toast.md`
- `upload-tile.css` — .upload-tile, .upload-tile__act, .upload-tile--file, .upload-tile--slim, .upload-tile--video ｜ Create-flow upload slots（hero／thumbs／file drop，Add new item） ｜ 規格 `ds-specs/4.7b-upload-tile.md`
- `variant-builder.css` — .variant-builder, .option-set, .option-set__row, .option-set__add, .option-set__name ｜ 建立商品多選項（spec 5.1.5.2 §4.1④，僅實體） ｜ 規格 `ds-specs/variant-builder.md`
- `venue-map.css` — .venue-map, .fep-shop, .venue-map__canvas, .venue-map__streets, .venue-map__road ｜ 依完整地址自動產生的活動地點地圖，定位針不能手動拖動 ｜ 規格 `ds-specs/4.228-venue-map.md`
- `vip-card.css` — .vip-card, .vip-card__settings, .vip-card__head, .vip-card__title, .vip-card__sub-desc ｜ 數位會員卡的卡面自訂區，左邊設定名稱與圖像，右邊即時預覽 ｜ 規格 `ds-specs/vip-card.md`
- `waterfall.css` — .waterfall, .waterfall__row, .waterfall__head, .waterfall__name, .waterfall__meta ｜ 收入頁的損益瀑布表，從總收入逐項扣除到可分配利潤 ｜ 規格 `ds-specs/4.24b-earnings-waterfall.md`
- `wizard-split.css` — .wizard-split, .wizard-split__main, .wizard-split__rail, .wizard-split--narrow, .wizard-split--phone ｜ 精靈流程的「內容欄＋貼頂摘要側欄」兩欄版面，供 create-project 兩步共用。詳見 §4.109 ｜ 規格 `ds-specs/4.109-wizard-split.md`
- `work-card.css` — .work-cards__wrap, .work-cards__nav, .work-cards__nav--prev, .work-cards__nav--next, .work-cards ｜ 儀表板的封面磚列 ｜ 規格 `ds-specs/work-card.md`
- `zselect.css` — .zselect__native, .zselect__trigger, .zselect__lead, .zselect__option, .zselect__label ｜ 自製下拉選單，取代無法被樣式化的原生 `<select>` 展開清單 ｜ 規格 `ds-specs/4.110-zselect.md`

### 頁面專用元件（共 45 支：只服務標示的功能，別拿去別頁；第二個功能要用時先升格成一般元件）

- `auth.css` — .auth-page, .auth-shell, .auth-brand, .auth-brand__logo, .auth-brand__name ｜ 未登入層的置中表單殼（spec 5.1.10 · D170）——站上第二個無工作台導航的整頁殼，無卡片 ｜ 規格 `ds-specs/4.113-auth-shell.md` ｜ 只在 其他單頁（login.html）
- `canvas-home.css` — .canvas-home-shell, .canvas-hero, .canvas-below, .canvas-sheet, .canvas-sheet__foot ｜ `index.html` 的版型層：窄的左欄三格（收入輪播／兩個進行中項目／三則待處理）浮在鋪滿整個視窗的底圖上，整頁釘在視窗高度、不捲 ｜ 規格 `ds-specs/canvas-home.md` ｜ 只在 首頁展示版型（index.html、dashboard-classic.html）
- `canvas-stage.css` — .canvas-stage, .canvas-stage__bg, .canvas-stage__img, .canvas-stage__scrim, .canvas-stage__marker ｜ 一屏不捲展示版（`index.html`）的滿版底圖 ｜ 規格 `ds-specs/canvas-stage.md` ｜ 只在 首頁展示版型（index.html、dashboard-classic.html）
- `detail-overview.css` — .detail-overview, .detail-overview--2col, .detail-overview__col, .detail-overview__kpis, .detail-overview__kpi-row ｜ 詳情頁總覽的三欄骨架 ｜ 規格 `ds-specs/detail-overview.md` ｜ 只在 專案詳情與專案列表（project-detail.html）
- `fans-guide.css` — .fg, .fg-open, .fg-open__kicker, .fg-open__title, .fg-open__sub ｜ 「粉絲經營怎麼玩」整頁式說明，四幕各自用自己真實資料形狀呈現。詳見 §4.99 ｜ 規格 `ds-specs/4.99-fans-guide.md` ｜ 只在 其他單頁（fans-guide.html）
- `finding-card.css` — .finding, .finding__kicker, .finding__title, .finding__sub, .finding__basis ｜ 一則帶著支撐數字的結論（結論＋數字＋依據＋追查入口） ｜ 規格 `ds-specs/4.111-finding-card.md` ｜ 只在 其他單頁（fan-analytics.html）
- `form-ask.css` — .form-ask, .form-ask__t, .form-ask__s, .form-ask__body, .form-ask__row ｜ 問句式設定塊，依序呈現問句、說明與二選一選項，並附標題列讀數 ｜ 規格 `ds-specs/4.237-form-ask.md` ｜ 只在 組合包編輯器（bundle-detail.html、create-bundle.html、create-event.html）
- `funding-panel.css` — .funding-panel, .funding-panel__amount-row, .funding-panel__amount, .funding-panel__backers, .funding-panel__goal ｜ 募資概況面板：已募金額＋支持人數／目標／進度條＋百分比藥丸／倒數＋募資期間／口徑註記，一個區塊講完 ｜ 規格 `ds-specs/4.91-funding-panel.md` ｜ 只在 專案詳情與專案列表（project-detail.html）
- `kpi-rotator.css` — .kpi-rotator, .kpi-rotator__slide, .kpi-rotator__slide--active, .distribution, .distribution__head ｜ 展示版左欄的輪播卡，輪流顯示收入走勢與粉絲分布 ｜ 規格 `ds-specs/kpi-rotator.md` ｜ 只在 首頁展示版型（index.html、dashboard-classic.html）
- `live-item.css` — .live-bg, .is-live-bg, .live-rail__wrap, .live-rail__nav--prev, .live-rail__view ｜ 展示版第二屏的主角：一件正在跑的事，講在一張佔掉大半屏高度的海報旁邊 ｜ 規格 `ds-specs/live-item.md` ｜ 只在 首頁展示版型（index.html）
- `manage-ip.css` — .mi-chips, .mi-dot, .mi-verify, .mi-verify__title, .mi-verify__text ｜ 「管理我的 IP」頁專屬的版面補丁，含狀態徽章、驗證橫幅與授權範圍 ｜ 規格 `ds-specs/4.101-manage-ip.md` ｜ 只在 其他單頁（manage-ip.html）
- `media-preview.css` — .mpreview, .mpreview__stage, .mpreview--image, .mpreview--clip, .mpreview__glyph ｜ 單件媒體預覽，可放大照片、播放影片封面或音檔進度條 ｜ 規格 `ds-specs/4.242-media-preview.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）
- `media-vault.css` — .vault-layout, .vault-layout--norail, .vault-rail, .vault-rail__head, .vault-rail__label ｜ 加密媒體庫：門條（解鎖條件＋觸及讀數）＋圖片/影片/音檔三種原生內容分區。詳見 §4.102 ｜ 規格 `ds-specs/4.102-media-vault.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）
- `member-picker.css` — .member-picker__empty, .member-picker__empty-t, .member-picker__empty-s, .member-picker__more, .member-picker__toolbar ｜ 組合物挑選：空狀態大按鈕＋「加入更多」，點開彈窗搜尋、篩選、一次勾多個。詳見 §4.244 ｜ 規格 `ds-specs/4.244-member-picker.md` ｜ 只在 組合包編輯器（create-bundle.html）
- `member-table.css` — .member-table, .member-table__row, .member-table__exp, .member-table__head, .member-table__name ｜ 組合物表：商品與活動票券成員同一張表，五欄（展開｜名稱｜原價・剩餘｜每組數量｜移除），票券列可展開、展開入口兩處同步。詳見 §4.236 ｜ 規格 `ds-specs/4.236-member-table.md` ｜ 只在 組合包編輯器（bundle-detail.html、create-bundle.html、create-event.html）
- `next-step.css` — .next-step, .next-step--lead, .next-step__label, .next-step__text, .next-step__act ｜ 一句話＋一顆主要動作，放在卡的最後一段 ｜ 規格 `ds-specs/next-step.md` ｜ 只在 專案詳情與專案列表（project-detail.html）
- `notification-matrix.css` — .notif-matrix, .notif-matrix__corner, .notif-matrix__chead, .notif-matrix__label, .notif-matrix__label-title ｜ 事件×管道逐格開關矩陣（含鎖定通道） ｜ 規格 `ds-specs/4.22i-notification-matrix.md` ｜ 只在 其他單頁（settings.html）
- `pdp-preview.css` — .pdp-pv, .pdp-pv__gallery, .pdp-pv__frame, .pdp-pv__img, .pdp-pv__thumbs ｜ 粉絲端商品頁的手機版鏡像（建立商品的即時預覽，D248） ｜ 規格 `ds-specs/4.54b-pdp-preview.md` ｜ 只在 商品與組合包詳情（create-product.html）
- `points-qr.css` — .points-qr, .points-qr--compact, .points-qr__code, .points-qr__name, .points-qr__points ｜ 掃碼領點的 QR 卡，含 QR 名稱、每次點數、用量條與下載鈕 ｜ 規格 `ds-specs/4.51c-points-qr-card.md` ｜ 只在 現場核銷與掃碼（pickup-detail.html）
- `post-composer.css` — .post-composer, .card, .post-composer__stub, .post-composer__head, .post-composer__foot ｜ 發文框，用於進度時間軸、發布更新彈窗與總覽進度摘要的入口 ｜ 規格 `ds-specs/post-composer.md` ｜ 只在 專案詳情與專案列表（project-detail.html、projects.html）
- `price-ladder.css` — .price-ladder, .price-ladder__step, .price-ladder__k, .price-ladder__t, .price-ladder__s ｜ 價格階梯，由上往下列出原價、各項折扣到粉絲實付的算法 ｜ 規格 `ds-specs/4.235-price-ladder.md` ｜ 只在 組合包編輯器（bundle-detail.html、create-bundle.html、create-event.html）
- `profile-avatar-row.css` — .profile-avatar-row, .profile-avatar-row__img, .profile-avatar-row__name ｜ 頭像＋名字＋「變更相片」橫條：薄膜底、圓形頭像 56px、名字跟顯示名稱欄位同步；首用商店設定「店面」分頁。demo 見 §4.211 ｜ 規格 `ds-specs/4.211-profile-avatar-row.md` ｜ 只在 商店設定（store-settings.html）
- `progress-timeline.css` — .ptl, .ptl__node, .ptl__node--foot, .ptl__node--done, .ptl__date ｜ 交付時間軸：一條由真實日期驅動的垂直時間流，未來在上、今天在中、過去在下 ｜ 規格 `ds-specs/4.51b-progress-timeline.md` ｜ 只在 專案詳情與專案列表（project-detail.html）
- `quick-result-list.css` — .quick-result, .quick-result__head, .quick-result__row, .quick-result__name, .quick-result__num ｜ 批次設定產生結果的唯讀預覽，一列一項，可依場次分組 ｜ 規格 `ds-specs/4.122-quick-result-list.md` ｜ 只在 建立活動（create-event.html）
- `rent-block.css` — .rent-block, .rent-block__eyebrow, .rent-block__group, .rent-block__sub, .rent-block__label ｜ IP 詳情頁的租用配置區，分租期、獨家、費用明細與結算兩組 ｜ 規格 `ds-specs/rent-block.md` ｜ 只在 IP 詳情（ip-detail.html）
- `rules-group.css` — .rules-group, .rules-group__row, .rules-group__k, .rules-group__t, .rules-group__s ｜ 購買條件群組，把購買條件與限購整併在同一個細框內 ｜ 規格 `ds-specs/4.240-rules-group.md` ｜ 只在 組合包編輯器（bundle-detail.html、create-bundle.html、create-event.html）
- `scanner.css` — .scanner-page, .scanner-frame, .scanner-top, .scanner-top__name, .scanner-brand ｜ 獨立手機 scanner（spec 5.1.5.14 · D111/D121/D122/D240）——獨立 URL、無主工作台導航 ｜ 規格 `ds-specs/mobile-scanner.md` ｜ 只在 現場核銷與掃碼（event-detail.html、scanner.html）
- `session-list.css` — .session-list, .session-list__row, .session-list__no, .session-list__fields, .session-list__row--main ｜ 系列場次清單：一活動辦好幾場時逐場列出日期與場地 ｜ 規格 `ds-specs/4.117-session-list.md` ｜ 只在 建立活動（create-event.html、create-event-legacy.html）
- `social-links.css` — .social-links, .social-links__row, .social-links__head, .social-links__label, .social-links__mark ｜ 社群連結清單：平台一列一格（平台名＋垃圾桶／網址欄）、虛線「新增」鈕展開未加平台清單 ｜ 規格 `ds-specs/4.212-social-links.md` ｜ 只在 商店設定（store-settings.html）
- `source-import.css` — .source-import, .source-gate, .source-gate__head, .source-gate__titles, .source-gate__acts ｜ 從外部平台搜尋一筆紀錄帶入表單的一頁式閘門，可略過或帶入 ｜ 規格 `ds-specs/4.120-source-import.md` ｜ 只在 建立活動（create-event.html）
- `staged-change.css` — .staged-remove, .staged-remove__strike, .staged-remove__bar ｜ 就地編輯時標示已修改、新增與待刪除項目的狀態標記 ｜ 規格 `ds-specs/4.232-staged-change.md` ｜ 只在 活動詳情（event-detail.html）
- `status-axes.css` — .status-axes, .status-axes--split ｜ 訂單兩條獨立狀態軸（spec 5.1.5.3.1 §2.2 / PCR-001）：履約 vs 付款·結算，不併成單一 badge ｜ 規格 `ds-specs/status-axes.md` ｜ 只在 訂單（orders.html、order-detail.html）
- `step-list.css` — .step-list, .step-list__row, .step-list__row--interactive, .step-list__act, .step-list__body ｜ 階段清單：一串回答「走到第幾步」的列，不是時間軸——沒有日期欄、沒有今天、不能往回捲 ｜ 規格 `ds-specs/step-list.md` ｜ 只在 專案詳情與專案列表（project-detail.html、projects.html）
- `stock-allocation.css` — .salloc, .salloc__row, .salloc__row--head, .salloc__row--pool, .salloc__row--cap ｜ 說明一個庫存池如何分配給各販售管道，逐列顯示鎖定量與可售量 ｜ 規格 `ds-specs/4.207-stock-allocation.md` ｜ 只在 商品與組合包詳情（bundle-detail.html、create-bundle.html、product-detail.html）
- `stock-readout.css` — .stock-readout, .stock-readout__num, .stock-readout__unit ｜ 唯讀的數量讀數，用於只能透過補貨等動作改變的庫存值 ｜ 規格 `ds-specs/4.54-stock-readout.md` ｜ 只在 商品與組合包詳情（product-detail.html）
- `store-settings.css` — .ss-stack, .ss-url, .ss-url__prefix, .ss-url__input, .ss-status ｜ E-Shop 商店層級設定頁（`store-settings.html`） ｜ 規格 `ds-specs/4.48-store-settings-page.md` ｜ 只在 商店設定（e-shop.html、store-settings.html）
- `ticket-preview.css` — .ticket-preview, .ticket-preview--custom-bg, .ticket-preview__top, .ticket-preview__when, .ticket-preview__logo ｜ 粉絲收到的那張票的即時預覽（建立活動步驟 5 票券銷售 › 票券設計的右軌）：識別半張（時間／票名或 logo／票種）＋撕線＋QR 半張 ｜ 規格 `ds-specs/4.116-ticket-preview.md` ｜ 只在 建立活動（create-event-legacy.html）
- `tier-arc.css` — .tier-arc, .tier-arc__ringwrap, .tier-arc__ring, .tier-arc__track, .tier-arc__seg ｜ 層層包含的分層弧，呈現一般粉絲到核心圈的粉絲分層 ｜ 規格 `ds-specs/tier-arc.md` ｜ 只在 首頁展示版型（index.html）
- `todo-list.css` — .todo-list, .todo-list__row, .todo-list__row--done, .todo-list__body, .todo-list__text ｜ 可編輯的待辦清單（勾選＋自行增刪） ｜ 規格 `ds-specs/todo-list.md` ｜ 只在 活動詳情（event-detail.html）
- `vault-access.css` — .vault-access, .vault-reachline, .vault-access__head, .vault-method, .vault-method__head ｜ 媒體庫的存取權限分頁，顯示即時人數、各方法符合人數與分享連結 ｜ 規格 `ds-specs/4.231-vault-access.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）
- `vault-list.css` — .vault-shell, .vault-stage, .vault-list, .vault-list__head, .vault-list__label ｜ 媒體庫左欄：庫房一列（直式封面、名稱、狀態圓點・狀態字・人數）與同形狀的虛線「新增庫房」；選中只靠底色。詳見 §4.245 ｜ 規格 `ds-specs/4.245-vault-list.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）
- `vault-open.css` — .vault-open, .vault-open__row, .vault-open__rowhead, .vault-open__rowtext, .vault-open__title ｜ 媒體庫開啟方式：條件開啟、鑰匙開啟兩列開關、方法小卡、鑰匙列。詳見 §4.247 ｜ 規格 `ds-specs/4.247-vault-open.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）
- `vault-share.css` — .vshare, .vshare__section, .vshare__label, .vshare__hint, .vshare__intent ｜ 媒體庫的加密連結／NFC 鑰匙發放面板，住在 drawer 裡；送禮與 NFC 商品共用同一個物件。詳見 §4.108 ｜ 規格 `ds-specs/4.108-vault-share.md` ｜ 只在 媒體庫（media-vault-popup.html、media-vault.html）
- `vault-stage.css` — .vault-bar, .vault-bar__title, .vault-bar__sched, .vault-bar__name, .vault-bar__nameinput ｜ 媒體庫主欄：庫房標頭、成效三格、灰底容器內固定三欄的直式內容卡片與「添加」卡。詳見 §4.246 ｜ 規格 `ds-specs/4.246-vault-stage.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）
- `vault-task.css` — .vault-tag, .vault-tag__text, .vault-tag--media, .vault-tag--plain, .vault-task ｜ 媒體庫每件內容的任務小標與單件抽屜的任務設定區 ｜ 規格 `ds-specs/4.229-vault-item-task.md` ｜ 只在 媒體庫（media-vault.html、media-vault-popup.html）

### 沒有獨立 CSS 的元件（共 19 支：寫在 shared.css、純 JS 或頁級技法；從總表抄）

- Global nav · sidebar mode — 位置 shared.css · sidebar.js ｜ 取代頂部導覽的 248px 左側導覽列，下拉選單改為可展開群組 ｜ 規格 `ds-specs/global-nav-sidebar-mode.md`
- Admin-layer nav · Tier 0/1 — 位置 shared.css · sidebar.js ｜ 平台管理端的頂部導覽，標示創作者管理並鎖定第一層項目 ｜ 規格 `ds-specs/admin-layer-nav-tier-0-1.md`
- Film picker — 位置 partials/film-picker.js ｜ 電影關聯的可搜尋多選元件，建於標籤輸入與 chip 之上 ｜ 規格 `ds-specs/film-picker.md`
- Work fields — 位置 partials/work-fields.js ｜ 影片作品欄位區塊，由多個既有表單元件組成的 JS 元件 ｜ 規格 `ds-specs/work-fields.md`
- Manual entry modal — 位置 partials/manual-entry-modal.js ｜ 補登站外收入的彈窗，重用共用彈窗殼與表單 helper ｜ 規格 `ds-specs/manual-entry-modal.md`
- Source upload modal — 位置 partials/source-upload-modal.js ｜ 上傳外部平台匯出資料檔的彈窗，重用共用彈窗殼 ｜ 規格 `ds-specs/source-upload-modal.md`
- Fee exception modal — 位置 partials/fee-exception-modal.js ｜ 逐位創作者覆寫平台費率的彈窗，有新增與編輯兩種模式 ｜ 規格 `ds-specs/fee-exception-modal.md`
- Login lang prompt — 位置 partials/login-lang-prompt.js ｜ 登入後詢問「登入畫面剛選的語言」是否要成為帳號預設語言 ｜ 規格 `ds-specs/login-lang-prompt.md`
- Content block injector — 位置 js/components.js ｜ 儀表板與收入管理反覆出現的內容區塊，由同一支渲染器產生 ｜ 規格 `ds-specs/content-block-injector.md`
- App shell — 位置 shared.css ｜ 整個頁面的外框，包含側欄、主內容區與頁面寬度設定 ｜ 規格 `ds-specs/app-shell.md`
- Filter row — 位置 shared.css ｜ Chip filters and inline actions above lists / grids ｜ 規格 `ds-specs/filter-row.md`
- Edge shadow（工具） — 位置 shared.css ｜ 只露出下緣的邊緣陰影工具，用於電子商店庫存條 ｜ 規格 `ds-specs/edge-shadow.md`
- Shell 補角／接縫（頁級技法） — 位置 e-shop.html ｜ 分割與捲動容器的圓角補位技法，目前只用在電子商店頁 ｜ 規格 `ds-specs/shell.md`
- Stepper — 位置 shared.css ｜ Wizard 進度條（數字圓圈） ｜ 規格 `ds-specs/stepper.md`
- Hero slideshow — 位置 shared.css · hero.js ｜ Dashboard full-bleed carousel ｜ 規格 `ds-specs/hero-slideshow.md`
- IP hero — 位置 shared.css ｜ IP detail cover + usage + rental composition（ip-detail 專用） ｜ 規格 `ds-specs/ip-hero.md`
- IP market card cover — 位置 shared.css ｜ IP 市集上架卡的封面，無圖時顯示品牌漸層佔位與 IP 名 ｜ 規格 `ds-specs/ip-market-card-cover.md`
- Rental card — 位置 shared.css ｜ Rental / bidding terms and CTA card ｜ 規格 `ds-specs/rental-card.md`
- Meta cell — 位置 shared.css ｜ Compact label/value stack in dense commercial panels ｜ 規格 `ds-specs/meta-cell.md`

### 資料與行為模組（共 4 支：不是元件，沒有外觀，畫面從它們讀值；見附錄 C）

- Work taxonomy ｜ 題材與年齡分級的值域單一來源 JS 模組，供多處畫面共用 ｜ 規格 `ds-specs/work-taxonomy.md`
- Archived gate ｜ 封存態唯讀的事件層閘門：純 JS 元件 `partials/archived-gate.js`，無自帶 CSS、不畫任何東西 ｜ 規格 `ds-specs/archived-gate.md`
- Loyalty settings ｜ 平台忠誠點數設定的已儲存值模組，作為原型的單一資料來源 ｜ 規格 `ds-specs/loyalty-settings.md`
- Fans roster ｜ 粉絲示範母體：純資料模組 `js/fans-roster.js`，無自帶 CSS ｜ 規格 `ds-specs/fans-roster.md`

## Pillar 1 速查 · Tokens（_tokens.css，亮色，共 303 條）

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

### --chip-*
- `--chip-surface`: color-mix(in srgb, var(--foreground) 6%, var(--card))

### --clickable-*
- `--clickable-card-lift`: -4px
- `--clickable-card-hover-bg`: var(--control-raise-hover)

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

### --disabled-*
- `--disabled-field-bg`: color-mix(in srgb, var(--layer-0-surface) 20%, transparent)

### --duration-*
- `--duration`: 200ms

### --easing-*
- `--easing`: cubic-bezier(0.32, 0.72, 0, 1)

### --faint-*
- `--faint-ink`: color-mix(in srgb, var(--muted-foreground) 72%, transparent)

### --float-*
- `--float-glass`: color-mix(in srgb, var(--popover) 72%, transparent)
- `--float-blur`: var(--ztu-blur-glass)

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
- `--surface-preview`: #0A0A0A
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

### --view-*
- `--view-field-ink`: var(--faint-ink)

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
