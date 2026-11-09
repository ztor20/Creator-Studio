# r2.1 風格裁決紀錄

同一視覺角色站上只能有一個答案。本檔記錄呈現層的風格裁決：已裁決條目是法律，動 UI 前先查；發現站上同一件事有兩種做法時，記入待裁決（附證據檔:行號），暫依最新確認的做法並標註題號，不得默默新增第三種。裁決權在使用者；裁決後要開執行工單全庫同步，並在 UI-CHANGES.md 記錄。

> **2026-09-09 D253 三批改動收尾複核**：eShop 訂單線／活動模組／Earnings 三批「退款全面改作廢沖銷」原型改動（D253）逐一核對站上既有視覺裁決——作廢確認彈窗在 `event-detail.html` 新增第二個 consumer，沿用 §5.1.11 Destructive confirm pattern 與既有 `.payout-modal`／`.payout-dialog` 殼層；帳務異動描邊徽章沿用 Q110 既有裁決（僅改名對象由「退款」變「作廢沖銷」，視覺規則不變）。三批沿用既有裁決、無新增待裁決條目。

---

## 已裁決

> **2026-11-09 起改成索引**：已裁決的規則都已寫進設計系統（`design-system.md`、`ds-specs/`、`design-system.html`），只影響單頁的寫進 `BUILD-SPEC.md` §4m。下表一條一行，指向現行規則的位置；完整裁決、理由與執行紀錄逐字封存在 [STYLE-DECISIONS-archive.md](STYLE-DECISIONS-archive.md)。
>
> - 動 UI 前照舊先查本表：已裁決仍是法律，只是條文住在設計系統。
> - 新裁決照舊寫成完整一列，放在下方「近期裁決」表，並同步設計系統；累積多了再搬進封存檔、在索引補一行。
> - 收尾檢查 `check_ds_sync` 第 19 項會擋：位置欄連到的檔案要寫到該題號；新裁決照完整列格式寫的，題號要出現在設計系統文件或 `BUILD-SPEC.md`。刻意不進設計系統的題，位置欄寫「不寫回：原因」。
> - 位置欄是「規則主要寫在哪」，以引用該題號次數最多的規格檔為準；同一條規則可能也出現在其他規格檔。

### 索引

| 編號 | 題目 | 裁決日期 | 現行規則位置 | 備註 |
|---|---|---|---|---|
| Q137 | disabled 輸入框的值墨色 | 2026-10-27 | [design-system.md](design-system.md) |  |
| Q136 | 可點卡片 hover 要長什麼樣 | 2026-10-20 | [design-system.md](design-system.md) 5.3 可點卡片 hover |  |
| Q135 | 淺色模式要不要繼續提供 | 2026-10-15 | [design-system.md](design-system.md) 淺色模式暫時關閉 |  |
| Q134 | 破壞性確認視窗的確認鈕比入口鈕還輕 | 2026-10-15 | [design-system.md](design-system.md)、[ds-specs/4.102-media-vault.md](ds-specs/4.102-media-vault.md) |  |
| Q76 | chip 無框化後，淺色模式的未選 chip 與卡面同色（原待裁決，2026-08-25 提出） | 2026-10-15 | [ds-specs/4.5-chip.md](ds-specs/4.5-chip.md)、[design-system.md](design-system.md) |  |
| Q133 | disabled 輸入框要不要有底色 | 2026-10-12 | [ds-specs/4.8-input.md](ds-specs/4.8-input.md)、[ds-specs/4.227-condition-list.md](ds-specs/4.227-condition-list.md) |  |
| Q132 | 建立活動步驟 2「基本資料」的兩張卡（名稱／亮點／國家／語言 | 2026-10-12 | [BUILD-SPEC.md](BUILD-SPEC.md) §4m |  |
| Q130 | 建立活動的「活動圖片」區段名 | 2026-10-12 | [BUILD-SPEC.md](BUILD-SPEC.md) §4m | 文案檢查 12 的必要例外 |
| Q131 | 建立組合包的區段名用使用者原字 | 2026-10-12 | [BUILD-SPEC.md](BUILD-SPEC.md) §4m | 文案檢查 12 的必要例外 |
| Q129 | filter-tabs 的未選計數要不要有泡泡 | 2026-10-12 | [ds-specs/filter-tabs.md](ds-specs/filter-tabs.md) |  |
| Q128 | 兩段式面板（[data-editable] ＋ data-mode="view"／"edit"）… | 2026-10-12 | [design-system.md](design-system.md)、[ds-specs/field-system.md](ds-specs/field-system.md) | 有後續修訂，見封存原文 |
| Q126 | 同一組選項列，單選與複選要不要長同一個樣子 | 2026-09-23 | [ds-specs/4.96-checkbox.md](ds-specs/4.96-checkbox.md) |  |
| Q125 | 表單分段的區塊標題要由什麼換來，以及彈窗裡那一疊區塊的垂直節奏誰持有 | 2026-09-23 | [ds-specs/form-section.md](ds-specs/form-section.md)、[ds-specs/4.29-payout-bank-picker-dialog.md](ds-specs/4.29-payout-bank-picker-dialog.md) | 有後續修訂，見封存原文 |
| Q124 | 建立流程（wizard）的頂列與底列材質 | 2026-09-23 | [ds-specs/wizard-frame.md](ds-specs/wizard-frame.md) | 底列 2026-10-28 改成膠囊（UI-CHANGES 四百零四） |
| Q123 | 表單分段裡的文字層級該有幾層 | 2026-09-22 | [ds-specs/field-system.md](ds-specs/field-system.md)、[ds-specs/form-section.md](ds-specs/form-section.md) | 規則分散在多份規格，沒有一處寫全 |
| Q119 | 兩段式編輯面板（[data-mode="view"]／"edit"）裡的表單欄位，檢視態怎麼呈現 | 2026-09-21 | [ds-specs/field-system.md](ds-specs/field-system.md)、[ds-specs/4.222-rich-body.md](ds-specs/4.222-rich-body.md) |  |
| Q118 | 兩段式編輯面板（[data-mode="view"]／"edit"）裡的表格，檢視態的格子怎麼呈… | 2026-09-21 | [ds-specs/field-system.md](ds-specs/field-system.md)、[ds-specs/variant-builder.md](ds-specs/variant-builder.md) |  |
| Q117 | 逐選項組合的縮圖（D268）在列出組合的表裡怎麼擺 | 2026-09-12 | [ds-specs/variant-builder.md](ds-specs/variant-builder.md)、[ds-specs/4.29c-restock-order.md](ds-specs/4.29c-restock-order.md) |  |
| Q116 | ztorUI 換裝殘留稽核（docs/ztorUI換裝稽核-2026-09-11.md）C 表 … | 2026-09-11 | [ds-specs/combobox.md](ds-specs/combobox.md) | 稽核彙總題，處理結果分散在各元件規格 |
| Q115 | 詳情頁同時有黏住的頂列與吸頂的分節橫列時，畫面上該有幾條固定列 | 2026-09-11 | [ds-specs/4.214-section-tabs.md](ds-specs/4.214-section-tabs.md)、[ds-specs/4.22h0-section-nav.md](ds-specs/4.22h0-section-nav.md) |  |
| Q114 | 標籤輸入欄（.tag-input__field）裡已選 chip 的對比 | 2026-09-11 | [ds-specs/tag-input.md](ds-specs/tag-input.md) |  |
| Q113 | 密集控件（--control-h-xs）的高度 | 2026-09-11 | [design-system.md](design-system.md) `--control-h-xs` |  |
| Q112 | 卡片級大圓角（--radius-xl）外框裡的表格列，左右內距要多少 | 2026-09-11 | [ds-specs/4.23-table.md](ds-specs/4.23-table.md)、[ds-specs/variant-builder.md](ds-specs/variant-builder.md) |  |
| Q111 | 標籤輸入欄（.tag-input__field）的表面，以及欄內已選 chip 的圓角要跟誰 | 2026-09-11 | [ds-specs/tag-input.md](ds-specs/tag-input.md) |  |
| Q110 | 同一張表裡有兩族狀態時，狀態徽章的視覺答案 | 2026-09-05 | [ds-specs/4.3-badge-status-pill.md](ds-specs/4.3-badge-status-pill.md) | 有後續修訂，見封存原文 |
| Q107 | 「可展開的子列」站上有兩種基礎元件 | 2026-09-03 | [ds-specs/4.204-row-disclosure.md](ds-specs/4.204-row-disclosure.md)、[ds-specs/4.225-demand-table.md](ds-specs/4.225-demand-table.md) |  |
| Q108 | L3 群組面板內（.rowdis__group 亮著時）的列 hover | 2026-09-04 | [ds-specs/4.204-row-disclosure.md](ds-specs/4.204-row-disclosure.md)、[design-system.md](design-system.md) |  |
| Q109 | 可展開列的控制項配置 | 2026-09-04 | [ds-specs/4.204-row-disclosure.md](ds-specs/4.204-row-disclosure.md)、[ds-specs/4.225-demand-table.md](ds-specs/4.225-demand-table.md) |  |
| Q103 | 垂直節奏誰持有（間距黏死的系統性成因） | 2026-09-01 | [ds-specs/form-section.md](ds-specs/form-section.md)、[design-system.md](design-system.md) |  |
| Q101 | 分段切換（segmented）有兩份實作 | 2026-09-01 | [ds-specs/4.22d-segmented.md](ds-specs/4.22d-segmented.md) |  |
| Q1 | 膠囊型元件圓角形狀 | 2026-07-13 | [design-system.md](design-system.md)、[ds-specs/tag-input.md](ds-specs/tag-input.md) |  |
| Q2 | 控制項圓角級距（6 vs 7px） | 2026-07-13 | [design-system.md](design-system.md) |  |
| Q3 | 卡片邊界 | 2026-07-13 | [design-system.md](design-system.md)、[ds-specs/4.11-card.md](ds-specs/4.11-card.md) | 有後續修訂，見封存原文 |
| Q4 | 控制項邊界 | 2026-07-13 | [design-system.md](design-system.md) |  |
| Q5 | hover 浮起規則 | 2026-07-13 | [ds-specs/4.27-product-list.md](ds-specs/4.27-product-list.md)、[design-system.md](design-system.md) | 有後續修訂，見封存原文 |
| Q6 | 表單欄位垂直節奏 | 2026-07-13 | [design-system.md](design-system.md) 表單欄位垂直節奏 |  |
| Q7 | 卡片內距級距 | 2026-07-13 | [design-system.md](design-system.md) |  |
| Q8 | 品牌橘使用範圍 | 2026-07-13 | [design-system.md](design-system.md)、[ds-specs/4.5-chip.md](ds-specs/4.5-chip.md) |  |
| Q9 | hover 底色灰階 | 2026-07-13 | [design-system.md](design-system.md)、[ds-specs/wizard-frame.md](ds-specs/wizard-frame.md) | 有後續修訂，見封存原文 |
| Q10 | 關閉鍵 icon 尺寸 | 2026-07-13 | [design-system.md](design-system.md) |  |
| Q11 | 「已付款 Paid」顏色 | 2026-07-13 | [design-system.md](design-system.md) |  |
| Q12 | 欄位標籤 | 2026-07-13 | [design-system.md](design-system.md) |  |
| Q13 | 建立流程選擇卡邊界／form-section--outlined 外框 | 2026-07-16 | [ds-specs/radio-card.md](ds-specs/radio-card.md)、[design-system.md](design-system.md) | 有後續修訂，見封存原文 |
| Q14 | form-section--outlined 是否保留 1px 外框 | 2026-07-16 | [ds-specs/form-section.md](ds-specs/form-section.md)、[ds-specs/preview-column.md](ds-specs/preview-column.md) |  |
| Q15 | 黑夜版 midnight 深色層次＋KPI delta chip | 2026-07-17 | [design-system.md](design-system.md) 暗色層階 token、[ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) | 有後續修訂，見封存原文 |
| Q20 | 清單列縮圖／圖示晶片 | 2026-07-18 | [ds-specs/4.22-data-list.md](ds-specs/4.22-data-list.md)、[ds-specs/4.27-product-list.md](ds-specs/4.27-product-list.md) |  |
| Q18 | midnight 精修搬入 r2.1（form-section 浮起／型別磚縮小／上傳圖示晶片） | 2026-07-17 | [ds-specs/4.18-selection-card.md](ds-specs/4.18-selection-card.md) 型別磚、[design-system.md](design-system.md) 表面材質原則 | form-section 浮起那一半已被 Q77 玻璃化取代 |
| Q19 | midnight 精修搬入 r2.1 batch 2（input 填色／標籤橘框／radio 小… | 2026-07-17 | [ds-specs/4.5-chip.md](ds-specs/4.5-chip.md)、[ds-specs/tag-input.md](ds-specs/tag-input.md) | 有後續修訂，見封存原文 |
| Q16 | 卡片/面板級圓角放大 | 2026-07-17 | [design-system.md](design-system.md)、[ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) |  |
| Q21 | 商品明細改版連帶的四個全站視覺尺度（區塊標題字級／區塊副標與欄位說明的色階與字級／KPI 底色／… | 2026-07-20 | [ds-specs/form-section.md](ds-specs/form-section.md)、[ds-specs/field-system.md](ds-specs/field-system.md) | 有後續修訂，見封存原文 |
| Q25 | 單行輸入控件的高度（站上有 6 種、其中 3 種帶小數） | 2026-07-21 | [design-system.md](design-system.md)、[ds-specs/variant-builder.md](ds-specs/variant-builder.md) |  |
| Q25（第二題） | 詳情頁右側常駐欄可不可以放可互動的卡 | 2026-07-21 | [ds-specs/4.52-detail-rail.md](ds-specs/4.52-detail-rail.md) | 封存原文裡同編號兩題 |
| Q26 | 站上有兩個按鈕家族、預設高度不同 | 2026-07-21 | [ds-specs/4.2-button.md](ds-specs/4.2-button.md) |  |
| Q24 | 卡片內的層級怎麼往上疊（填色階梯已用完） | 2026-07-21 | [ds-specs/4.53-nest.md](ds-specs/4.53-nest.md)、[design-system.md](design-system.md) 層級表 |  |
| Q27 | 編輯／新增流程用側邊 drawer 還是中央彈窗 | 2026-07-24 | [ds-specs/drawer.md](ds-specs/drawer.md) | 有後續修訂，見封存原文 |
| Q28 | 建立專案「專案類型」picker 用哪個元件 | 2026-07-24 | [ds-specs/radio-card.md](ds-specs/radio-card.md)、[ds-specs/4.96-checkbox.md](ds-specs/4.96-checkbox.md) |  |
| Q29 | 站上有兩支長相不同的資料表元件（ztor-table vs variant-table） | 2026-07-25 | [ds-specs/4.23-table.md](ds-specs/4.23-table.md)、[ds-specs/4.225-demand-table.md](ds-specs/4.225-demand-table.md) |  |
| Q30 | IP 卡／IP hero 封面 | 2026-07-25 | [ds-specs/ip-market-card-cover.md](ds-specs/ip-market-card-cover.md) |  |
| Q31 | IP 詳情 hero | 2026-07-25 | [ds-specs/rent-block.md](ds-specs/rent-block.md)、[ds-specs/ip-hero.md](ds-specs/ip-hero.md) |  |
| Q32 | 卡片邊界更上層問題（Q23 留待裁決） | 2026-07-26 | [design-system.md](design-system.md) 卡片邊界、[ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) |  |
| Q33 | 控制項邊框是否該看「有沒有卡片／section 包著」決定，而非 Q4 的一律真 border | 2026-07-26 | [ds-specs/4.8-input.md](ds-specs/4.8-input.md) |  |
| Q34 | 清單列 hover | 2026-07-26 | [design-system.md](design-system.md) Q5 hover 浮起規則、[ds-specs/4.27-product-list.md](ds-specs/4.27-product-list.md) |  |
| Q38 | 頁面分節 tabs | 2026-07-31 | [ds-specs/4.214-section-tabs.md](ds-specs/4.214-section-tabs.md)、[ds-specs/4.102-media-vault.md](ds-specs/4.102-media-vault.md) | 執行未完成，見封存原文 |
| Q39 | 圖片上傳槽比例 | 2026-07-31 | [ds-specs/4.7b-upload-tile.md](ds-specs/4.7b-upload-tile.md) | 有後續修訂，見封存原文 |
| Q40 | 圖片上傳槽 hover 動作列 | 2026-07-30 | [ds-specs/4.7b-upload-tile.md](ds-specs/4.7b-upload-tile.md) |  |
| Q41 | 列表／表格的欄位表頭 | 2026-07-31 | [ds-specs/4.23-table.md](ds-specs/4.23-table.md)、[ds-specs/4.115-size-chart-editor.md](ds-specs/4.115-size-chart-editor.md) |  |
| Q42 | 暗色浮起卡的底色 | 2026-08-01 | [design-system.md](design-system.md) 表面材質原則 | 已被 Q77 玻璃化取代，`form-section.css` 已刪暗色 `--surface-shell` 宣告 |
| Q52 | 活動（Events）清單縮圖 | 2026-08-05 | [ds-specs/4.27-product-list.md](ds-specs/4.27-product-list.md) | 有後續修訂，見封存原文 |
| Q46 | 顯示端全面改直式後，活動（Events）的橫式橫幅槽是否也併入 | 2026-07-31 | [ds-specs/4.7b-upload-tile.md](ds-specs/4.7b-upload-tile.md) | 2026-08-05 已被推翻，現行＝活動圖片只有直式 |
| Q43 | 「返回上一層」按鈕的樣貌 | 2026-08-02 | [ds-specs/4.2-button.md](ds-specs/4.2-button.md) `--icon-circle` | 裁決寫返回鈕靜止態無底，現行 `--icon-circle` 預設有薄膜底，待確認 |
| Q44 | UI 文案的脈絡重述 | 2026-08-03 | 不寫回：原則寫在 `project-ui-creator` skill 鐵律 12，由 `check_ds_sync` 檢查 12 把關；例外見 [BUILD-SPEC.md](BUILD-SPEC.md) §4m | 原則寫在 skill，不在設計系統；站上文案尚未全面清理 |
| Q37 | 卡片內的移除／刪除動作 | 2026-08-03 | [ds-specs/bundle-editor.md](ds-specs/bundle-editor.md)、[ds-specs/4.114-ticket-tier-card.md](ds-specs/4.114-ticket-tier-card.md) | 已被推翻，見封存原文 |
| Q49 | 未登入層整頁殼要不要包一張卡 | 2026-08-04 | [ds-specs/4.113-auth-shell.md](ds-specs/4.113-auth-shell.md) |  |
| Q50 | 填色按鈕的停用態 | 2026-08-04 | [ds-specs/4.2-button.md](ds-specs/4.2-button.md) |  |
| Q51 | 圖示風格 | 2026-08-04 | [ds-specs/4.9-icon.md](ds-specs/4.9-icon.md)、[design-system.md](design-system.md) |  |
| Q53 | 勾選框 | 2026-08-06 | [ds-specs/4.96-checkbox.md](ds-specs/4.96-checkbox.md)、[ds-specs/4.29-payout-bank-picker-dialog.md](ds-specs/4.29-payout-bank-picker-dialog.md) |  |
| Q65 | 區塊標題字級 | 2026-08-11 | [ds-specs/form-section.md](ds-specs/form-section.md) | 有後續修訂，見封存原文 |
| Q73 | 描述文字的字級 | 2026-08-25 | [ds-specs/form-section.md](ds-specs/form-section.md)、[ds-specs/field-system.md](ds-specs/field-system.md) |  |
| Q72 | 「列與列的分隔線」站上有兩個色階 | 2026-08-25 | [ds-specs/4.50-kv-list.md](ds-specs/4.50-kv-list.md)、[ds-specs/4.49-review-row.md](ds-specs/4.49-review-row.md) |  |
| Q71 | 卡內分組與強調的層級階梯 | 2026-08-25 | [ds-specs/card-group.md](ds-specs/card-group.md) |  |
| Q74 | 可選卡的「已選」表達 | 2026-08-25 | [ds-specs/radio-card.md](ds-specs/radio-card.md)、[ds-specs/check-card.md](ds-specs/check-card.md) |  |
| Q75 | 分節導覽（section-nav）的視覺語言 | 2026-08-25 | [ds-specs/4.22h0-section-nav.md](ds-specs/4.22h0-section-nav.md)、[ds-specs/4.48-store-settings-page.md](ds-specs/4.48-store-settings-page.md) |  |
| Q77 | 表面材質的統一語言 | 2026-08-28 | [design-system.md](design-system.md) 表面材質原則 |  |
| Q78 | 彈出層（dropdown／popover／dialog）要不要也跟著卡片一起玻璃化 | 2026-08-28 | [design-system.md](design-system.md) `--float-glass`／`--float-blur` | 有後續修訂，見封存原文 |
| Q79 | 玻璃卡的 backdrop-filter 模糊半徑要抓多大 | 2026-08-28 | [design-system.md](design-system.md) 模糊半徑的判準 |  |
| Q80 | 選中態的視覺語彙 | 2026-08-28 | [design-system.md](design-system.md) 選中態依場景分五種語彙 |  |
| Q81 | app shell 檯面要不要有裝飾層 | 2026-08-28 | [design-system.md](design-system.md) 星空背景 |  |
| Q82 | KPI 數字要不要換成規格書 §1.9 定義的 --font-dot（Doto 點陣字面） | 2026-08-28 | [ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) |  |
| Q83 | .kpi--hero 實色橘卡與 Q77「表面中性玻璃、顏色只在光與文字」字面衝突，要不要玻璃化 | 2026-08-28 | [ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) |  |
| Q84 | .info-banner 實色 --accent 面與 Q77 衝突，且是 Wave 2 熔接漏… | 2026-08-28 | [ds-specs/4.7-info-banner.md](ds-specs/4.7-info-banner.md) |  |
| Q85 | admin 表格密集頁（.admin-table-wrap）沒有掛 .list-dock，星空不… | 2026-08-28 | [design-system.md](design-system.md) 列表頁漸消 |  |
| Q88 | 儀表板 KPI 的成長 delta | 2026-08-28 | [ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) | 有後續修訂，見封存原文 |
| Q89 | KPI 卡的微型走勢圖 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q90 | KPI 走勢圖的細節程度 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q91 | 走勢圖的標記區間要標哪一段、要不要帶數值 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q92 | 走勢圖標記區間的顏色與構件 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q93 | 收入走勢圖該畫什麼量 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q94 | 走勢圖的時間窗口與縱軸刻度密度 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q95 | 橫軸最後一個刻度（本週）沒有對齊折線終點 | 2026-08-28 | [ds-specs/sparkline.md](ds-specs/sparkline.md) |  |
| Q96 | 儀表板收入卡 | 2026-08-28 | [ds-specs/4.12-kpi.md](ds-specs/4.12-kpi.md) |  |
| Q86 | creator-detail.html 的 Account source／Shop and co… | 2026-08-28 | [BUILD-SPEC.md](BUILD-SPEC.md) §4m |  |
| Q87 | C-4（fans-guide 編輯風說明頁）／C-5（funding-simulate 內部試算… | 2026-08-28 | [BUILD-SPEC.md](BUILD-SPEC.md) §4m |  |
| Q97 | 詳情浮層（detail-sheet）的外框還是換裝前的樣子 | 2026-08-31 | [ds-specs/4.97-detail-sheet.md](ds-specs/4.97-detail-sheet.md) |  |
| Q99 | 主按鈕白字在橘玻璃上不夠站得住、hover 幾乎看不出來 | 2026-08-31 | [ds-specs/4.2-button.md](ds-specs/4.2-button.md) |  |
| Q98 | 浮層與主按鈕的材質參數 | 2026-08-31 | [design-system.md](design-system.md) token 表、[ds-specs/4.97-detail-sheet.md](ds-specs/4.97-detail-sheet.md) | 主按鈕漸層濃度同日回退為 78／78／82，其餘照裁決 |

### 近期裁決

| 編號 | 角色/題目 | 裁決 | 日期 | 理由 | 執行狀態 |
|---|---|---|---|---|---|

## 待裁決

### Q139 · 橘底白字：主按鈕以外的小元素對比度約 2.0

Q99 處理過主按鈕的白字，靠文字陰影撐住。下面這些同樣是 `--primary` 底加 `--primary-foreground` 字，沒有那層處理，巡檢量到對比度約 2.0（DS demo 巡檢 2026-11-07）。

- `pager.css:17`：分頁目前頁碼
- `funding-panel.css:75`：募資百分比
- `empty-stub.css:30`：空狀態標記
- `fan-store.css:132,298`：粉絲商店 CTA 與 New 徽章
- `upload-tile.css:325`：Hero 標記
- 選項：**A** 全部沿用 Q99 的文字陰影；**B** 小元素改深色字；**C** 維持現狀。
- 建議：B——小字沒有主按鈕的尺寸撐著，文字陰影效果有限。
- 本輪處置：不改，等裁決。

### Q138 · Admin 設定頁的頁型有兩種：「全頁表單＋工作列一顆全域儲存」vs「每個分頁一張卡、卡內就地編輯」（2026-11-02 提出，暫依平台忠誠點數設定的新做法、待裁決）

使用者看過平台忠誠點數設定的格式示範後裁示「套用」（UI-CHANGES #458，D508），同一個視覺角色——Admin Creator Studio 的平台級設定頁——於是出現兩種做法：

- 現況 A（舊，兩頁仍在用）：麵包屑 → page-intro → `.list-toolbar` 底線分頁＋右端**一顆全域「儲存」**（或分割鈕／新增鈕）→ 多個 `.form-section--outlined`，輸入框常駐可改。證據：`admin-platform-fees.html:49`（工作列）、`:57`（`list-toolbar__actions` 的儲存分割鈕）、`:82`（第一個 `form-section--outlined`）；`admin-platform-promotions.html:53`（工作列）、`:60`（新增鈕）、`:73`（`form-section--outlined`）。
- 現況 B（新，本頁）：同一個工作列殼，但分頁一頁一張 `.card`；卡頭 `.card__head--wrap` 左一句說明、右「變更歷史」＋「編輯」；**預設唯讀**，按編輯就地切成輸入框（`.tier-ov__read`／`__edit` 兩面），以卡為單位取消／儲存，全頁沒有全域儲存。證據：`admin-platform-loyalty.html:67`（工作列）、`:83`（卡頭）、`:87`（編輯鈕）。來源是創作者端「粉絲分級設定」卡（`fans-crm.html` `[data-tier-card]`）。
- 選項：**A** 維持兩種並存——參數少、改了要一起生效的頁（費率）用全頁表單，參數多、分類多的頁用 B；**B** Admin 設定頁統一走 B，平台費率與平台優惠兩頁改版；**C** 撤回本頁回到 A。
- 建議：B——三頁同屬「全平台參數、改錯影響所有創作者」，預設唯讀＋就地編輯能防誤改，且以卡為單位儲存讓修改紀錄的分類（變更歷史）有對應的位置；成本是兩頁改版，費率頁的「排程生效」分割鈕要另想放在卡頭的哪裡。裁決權在使用者。
- 本輪處置：只改平台忠誠點數設定；另兩頁不動。

### Q127 · 「檢視資料、順手填一兩格」的浮層用中央彈窗 `.payout-modal` 還是側滑 `.drawer`（2026-10-05 提出，D360 商品細節頁需求數據彈窗，暫用中央彈窗、待裁決）

商品細節頁新增的需求數據入口（S69，5.1.5.1 §2.19）開的是一個「看資料」的浮層，內容是需求看板的單品切片：三個摘要指標、市場需求表、選定市場的面板，其中有幾個「計畫生產量」輸入格（填了只供看板對照，不改庫存）。

- 已裁決的線索：Q27 把 `.payout-modal`／`.payout-dialog` 定為「編輯或新增一筆資料」的唯一殼層，同時寫明 `.drawer` 保留給「不離開當前頁看詳情／歷史／說明」的唯讀用途（目前只有 `earnings-sony` 的提領歷史）。本浮層是檢視性質、卻有輸入格，兩邊的定義都只沾一半。
- 站上證據：同一頁已有的兩個檢視性彈窗——庫存歷史紀錄的「查看全部」與補貨紀錄，都是 `.payout-modal`（`product-detail.html` 的 `[data-pd-history-modal]`）；Q78 要求彈出層一律全不透明（`.payout-dialog` 已吃 `--popover`，沒有衝突）。
- 本輪做法：用 `.payout-modal` ＋ `.payout-dialog--xwide`（1180px，同「分級設定」那種裝一整個畫面的特寬版），不新增第三種殼、也不動 `.drawer`。選它的原因：表格有 7 個尺寸欄加選定市場面板，要的是寬度而不是側滑的長條；本頁其他檢視性浮層本來就是中央彈窗。
- 選項：**A** 維持本輪——檢視性浮層只要內容有互動（輸入、點選）就用中央彈窗，`.drawer` 限純文字／純唯讀的說明；**B** 這類資料浮層改 `.drawer--wide`，同頁的兩個歷史彈窗一併遷移；**C** 修訂 Q27 的字面：`.drawer` 退場，所有浮層統一 `.payout-modal`。
- 建議：A（成本最低，也符合 Q27 理由「站上本來就以中央彈窗為主」）。裁決權在使用者。
- **2026-10-08 補證據（媒體庫，D377）**：`media-vault.html` 的單件內容設定一直是側滑 `.drawer`（`[data-item-sheet]`，2026-08-01 使用者裁示「點進去每個 media 設定裡」，可改名、刪除），本輪在同一個抽屜加了第二層的「任務」區與大彩蛋開關（`js/media-vault.js` `taskSectionHtml`／`grandRowHtml`）——它是「編輯一筆資料」，照 Q27 字面該用中央彈窗。暫依既有抽屜（使用者 2026-08-01 指定、任務是單件屬性、抽屜讓被編輯的格子仍看得見），不另起第三種殼；若裁 A 或 C，這個抽屜一併評估遷移。

### Q122 · 「一頁多段」的分節導覽站上有兩種做法：橫向固定分頁（section-tabs，跳轉＋scrollspy）vs 左側 section-nav（切換面板）；分頁列併進頂列當第二排是否算違反 Q115「只准一條固定列」（2026-09-21 提出，暫依使用者指示做橫向固定分頁、待裁決）

使用者對「新增票務商品（活動票券組合包）」彈窗的反饋：「在創建的 popup 中有 fix 在最上面的 tab 可以快速滾動到指定區塊」。落地成新元件 `ds-components/section-tabs.css`＋`js/section-tabs.js`（§4.214），裝在建立活動第 6 步彈窗與電子商店建立組合頁。這一題有兩個層次：

- 現況 A（本輪新）：橫向一排 `.section-tabs` > `.tabs.tabs--underline-short.tabs--underline-label`，三段都在畫面上，點了平滑捲到段、捲動時 scrollspy 亮目前段（證據：`js/bundle-editor.js` `sectionTabsHTML()`；`create-bundle.html:109`）。
- 現況 B（既有）：詳情頁的左側 `section-nav`（Q75 分隔線式）——選了切換面板、一次只看一段（證據：`product-detail.html`、`bundle-detail.html:148`、`series-detail`、settings 共九頁）。
- 兩者的角色不完全相同：B 是「同一個東西的哪一段」切換視圖，A 是「長表單裡跳到哪一段」定位。但對使用者而言都是「一頁多段的導覽」，同一站兩種語彙要不要收斂（例如長表單也改左側 section-nav 不捲動、或詳情頁的設定分頁也改成橫向 scrollspy）是裁決題。
- 固定列數量：Q115 裁「只准一條固定列」（詳情頁頂列收編分節橫列）。本輪做法是**把分頁列併進既有頂列當第二排**——彈窗＝標題排＋分頁排（都在捲動區外）、建立流程＝`.wizard__top` 頂列＋分頁排（同一個 sticky 塊）——畫面上仍是一塊固定區、沒有第二條浮在內容上，本輪視為符合 Q115 精神；但頂列因此長高 44px（建立流程 80 → 124）。
- 選項：**A** 維持本輪（橫向分節分頁＝長表單專用、左側 section-nav＝詳情頁切換視圖，兩種語彙各司其職，寫進 §4.214／§4.22h0 的 Usage）；**B** 長表單也改左側 section-nav（彈窗要挪出一欄給導覽，1180px 特寬彈窗左欄會再縮）；**C** 分頁排改成捲動到頂列底下才滑入（像 detail-topbar 的收編），頂列靜止態維持 80px。
- 建議：A——長表單的分節本來就要一次看得到（邊填邊看預覽卡），切換視圖會把「粉絲看到的」對照關係切斷；C 多一個狀態換 44px 的靜止態高度，划不來。裁決權在使用者。

### Q121 · 同一套「建立組合包」建構體驗有兩份實作：共用編輯器彈窗（活動第 6 步）vs 頁面級表單（電子商店建立組合）（2026-09-21 提出，暫維持兩份、待裁決）

第 2 批把電子商店 `create-bundle.html` 對齊第 1 批的版面與文案後，站上「左三段建構、右粉絲預覽卡、底部粉絲實付」這一套體驗有兩份程式：

- 現況 A（第 1 批）：`js/bundle-editor.js` `layout:'split'`——彈窗殼、一次只編輯一組、其餘收成列；消費者 `create-event.html` 第 6 步（募資兩頁走 `layout:'sections'`）。預覽卡 markup 由編輯器內的 `fanHTML()` 產生。
- 現況 B（第 2 批）：`create-bundle.html` 自己的頁內 IIFE——頁面級三張 `form-section--outlined`、右欄 `preview-col`、`wizard__bottom`；重用同一批元件 CSS（`bundle-preview-card`、`bd-tbl--tix`／`--items`、`bd-calc-list`、`bd-disc`、`bd-readout--big`、`bd-listing`、`bd-foot-*`）與同一批文案 key（`cpp.bd.sp.*`），但 `fanHTML()`／算式／鎖定提示各有一份（證據：`create-bundle.html` 頁尾 script 的 `fanHTML()`／`calcListHTML()`／`setsText()`；`js/bundle-editor.js` 同名函式）。
- 為什麼沒合流：電子商店脈絡多了挑活動子流程、候選商品的下架／封存資格、完整三開關、限時折扣、電影關聯、十格素材、嵌入建立商品、ListingState 鎖定分配表；要塞進編輯器得新增頁面級殼與六種插槽，而編輯器每次改動整卡重畫（`render()` 換 innerHTML），插槽裡的日期時間欄與開關會丟狀態——動到的是募資兩頁與建立活動共用的渲染迴圈。
- 選項與取捨：**A** 把編輯器抽成「頁面級、可插槽、局部更新」的版本，電子商店改掛它（單一實作，但要重寫 render 策略、三個既有消費頁全部回歸）；**B** 維持兩份，但把純算式（最低票價 × n、規格價取最小、Σ floor(剩餘 ÷ n)、鎖定／限量取小、省多少）抽成 `js/bundle-calc.js` 共用，兩頁只各留 DOM 層；**C** 維持現況，靠元件 CSS＋文案 key 對齊、以截圖對照守住視覺一致。
- 建議：B——算式是最容易分岔、也最不該分岔的一層；DOM 層兩份是因為兩個殼（彈窗 vs 頁面）本來就不同。裁決權在使用者，本輪先走 C 落地、不動編輯器。

### ~~Q120 · 粉絲端預覽卡的媒體格比例：商品／拍賣預覽卡直式 2:3，組合包預覽卡 2:1~~（2026-09-21 提出；**2026-10-12 裁決**：選 A）

> **2026-10-12 已裁決**：使用者「商品圖片應該都要是直的，我們上傳圖片現在都是直的」——組合包預覽卡改回直式 2:3，全站粉絲端預覽卡媒體格一律 `--img-portrait`，不再有 2:1 例外（`bundle-preview-card.css`）。以下為提出時的原文，保留作沿革。

建立活動第 6 步的組合包編輯器改成兩欄版面（UI-CHANGES 五十三）時，右欄「粉絲看到的」預覽卡（新元件 `ds-components/bundle-preview-card.css`）沿用 `preview-card` 為底，但媒體格的比例與 2026-07-31 定下的規則不同。

- 現況 A（既有，2026-07-31 使用者裁示）：`.preview-card__media { aspect-ratio: var(--img-portrait) }`（`ds-components/preview-card.css`）——「這張卡的職責是粉絲會看到的樣子，建立流程的主圖槽已是 750×1125；預覽框若還是橫式，剛上傳的直式圖會在預覽裡被切成橫帶，等於預覽騙人」。消費者：create-product／create-auction／create-bundle／create-project 的右欄預覽、order-detail 的商品快照。
- 現況 B（本輪新增，demo 定案）：`.bpc .preview-card__media { aspect-ratio: 2 / 1 }`（`ds-components/bundle-preview-card.css`）——組合包預覽卡坐在彈窗 340px 側欄裡，直式 2:3 會吃掉 510px、把粉絲真正要看的內含清單與價格推到第二屏；demo `docs/bundle-create-demo-2026-09-21.html` 用 2:1，使用者看過裁示「做上正式」。組合包封面的上傳格仍是直式（`.upload-tile--portrait`），所以 A 的理由（預覽裁切與上傳不一致）在這裡同樣成立。
- 選項與取捨：**A** 組合包預覽卡改回直式（與上傳格一致、規則單一；代價是側欄第一屏只剩圖）；**B** 維持 2:1 但寫成規則例外（「坐在窄側欄的預覽卡可用 2:1」，並在 DS 註明媒體格會裁切直式圖的中段）；**C** 組合包封面的上傳格與前台卡一起改橫式（需上游定組合包主圖尺寸——5.1.5.4 F8 未定）。
- 建議：B——demo 是使用者看過裁示的，且側欄第一屏要看得到內含清單與價格是這張卡存在的理由；但 A 的「預覽不能騙人」要補一句說明或改成 `object-fit: cover` 取中段。裁決權在使用者。

### ~~Q119 · 兩段式編輯面板的檢視態，站上現在有兩種呈現：表格＝純文字、表單欄位＝disabled 外觀的輸入框~~（2026-09-21 提出，**同日裁決**，見上方「已裁決」表 Q119 列）

> **2026-09-21 已裁決**：表單欄位跟進表格、檢視態一律純文字；清單列裡的步進器歸表單這邊。舊的 2026-07-27「回到編輯畫面的格式、只是不能編輯」與 2026-09-11「全站檢視態＝disabled 外觀」（UI-CHANGES 十八）兩條裁示**由 Q119 取代**。以下保留提出當時的現況快照供對照。


Q118 依使用者指示把**表格**的檢視態改成純文字，但同一個面板裡的**一般表單欄位**仍照 2026-09-11 的裁示（「全站檢視態都改成 disabled 外觀」，幾何不動、透明底、`--locked-field-ink` 淡墨），於是同一頁同一時刻並存兩種「不能改」的樣子：

- **現況 A（表格，Q118）**：檢視態純文字、無框；按「編輯」才出現輸入框。證據：`product-detail.html` 商品設定分頁「逐選項組合定價表」`[data-pd-edit-table]`（`ecText()`）；`ds-components/variant-builder.css` `[data-mode="view"] .variant-table` 段。
- **現況 B（表單欄位，2026-09-11）**：檢視態仍是輸入框、只換成 disabled 外觀。證據：`shared.css:1932` `[data-mode="view"] .input …`；`product-detail.html:593`／`:597`／`:684`（單一規格的價格／成本／上限 `.amount-field`）；`bundle-detail.html:401`／`:453`（折扣 %）與 `:782` 成員列的數量 `.zstep`（清單列裡的輸入框，最接近表格的情形）；`event-detail.html:846`／`:922`；`store-settings.html:212`；`project-detail.html` setup 面板。

兩者各有依據：B 是 2026-07-27「回到編輯畫面的格式，只是不能編輯」（攤平會讓角色／姓名兩欄失去對齊、textarea 塌成內容高度）＋ 2026-09-11 的 disabled 外觀裁示；A 是本次「不能編輯就用文字」。表格裡文字本來就有欄軌對齊、不會有 B 擔心的塌陷問題，所以 A 在表格成立；表單欄位若也改純文字，得先解決 2026-07-27 指出的對齊與節奏問題（例如標籤／值改成 `.data-list` 或 `.kv` 讀數列）。

**要裁決的**：(1) 表單欄位的檢視態要不要跟進純文字（若要，需一併設計欄位的讀數版型，不能只把框拿掉）；(2) 清單列裡的輸入框（組合細節成員列的數量 `.zstep`）算表格那邊還是表單那邊。裁決前維持現狀：表格＝A、表單＝B，不新增第三種。

### Q106 · 「正在忙」站上有三種畫法（2026-09-02 提出，本輪新增第三種、已標註題號）

同一個語意（「這件事正在進行，等一下」），站上目前有三份各自實作：

- **環形 spinner（獨立圖形）** — `ds-components/upload-tile.css:291-292`（`.upload-tile__spinner`，22px、2px 環、`--primary` 缺口、`upl-spin .6s`）：上傳中／優化中的 frosted 罩裡放一顆轉圈。
- **環形 spinner（由狀態點變形）** — `shared.css:1403-1410`（`.wizard__save-status[data-state="saving"] .wizard__save-status__dot`，12px、2px 環、`--foreground-muted` 缺口、`wiz-spin .6s`）：自動儲存的綠點在儲存中變成一顆轉圈。
- **把既有的 icon 轉起來（本輪新增）** — `ds-components/button.css`（`.btn[aria-busy="true"] .ztor-icon`，`btn-busy-spin .7s`）：按鈕忙碌時不換圖形，讓它原本那顆 `refresh-ccw` 轉。首個消費者：創作者活動管理的「重新檢查」。

**為什麼本輪還是新增了第三種**：前兩種都是「放一顆專門用來轉的圖形」，適合佔一塊面積的進行中狀態（罩層、狀態列）。按鈕上的忙碌不一樣——那顆 icon 本身就是動作的符號（重新檢查＝`refresh-ccw`），換成一顆通用 spinner 反而讓人以為按鈕變成了別的東西；而且 28px 高的次要按鈕塞不下一顆獨立 spinner 再加文字。所以本輪走「原地轉既有 icon」，並在此登記，不主張它取代前兩種。

**2026-10-15 追加消費者（D424，未新增第四種）**：toast 的進行中態 `.ztor-toast__spinner`（`ds-components/toast.css`，右下角「匯出中…」）照第一種「獨立 spinner」畫——2px 環、`--primary` 缺口、.6s，只把圈徑縮成與成功／錯誤圖示同為 16px。理由同第一種：它佔的是 toast 的圖示格（一塊面積），不是某顆控制項自己的 icon。

**待裁決**：這三種要不要收斂，以及收成什麼。可能的方向——(A) 維持三種、但寫成一條規則（有面積的進行中→獨立 spinner；控制項忙碌→轉它自己的 icon；狀態點→變形）；(B) 統一 spinner 的圈徑、線寬與轉速（現在是 .6s／.6s／.7s、2px／2px／無），只留一組值；(C) 把 `.upload-tile__spinner` 與 wizard 那顆合併成一支共用元件。裁決權在使用者，本輪一個字都沒改前兩種。

### Q105 · ~~「側欄名單列被選中」有兩支各自實作的元件~~（2026-09-02 提出，**同日隨版面改版失效**）

**已失效，不需裁決。** 這一題記的是：站上有兩支長得一模一樣的「左側名單列，點一列換右邊內容」——`.vault-row` / `--active`（`ds-components/media-vault.css:124-188`，2026-08-01 建，消費頁 `fans-vault.html`），以及同日上午為活動匯入頁新建、逐值抄它寫成的那一支。不是兩種畫法，是同一種畫法有兩份程式碼，日後只改一邊就會分岔。

同日下午使用者裁示活動匯入頁改版面（「creator 選擇在上、活動列表在下」「creator 改成一張一張卡片橫著排列」），那支元件整支改寫成 `ds-components/roster-picker.css`：creator 不再是側欄名單列、而是網格裡的卡片，已選態改由既有的 `.selection-card--active`（1px 橘 outline ＋中性陰影）提供，元件本身一條 `--active` 都沒寫。**那份重複的程式碼隨改寫消失**，站上「側欄名單列被選中」現在只剩 `media-vault.css` 一份實作。

沒有第二份、也沒有第三種畫法，所以這一題不留待裁決，也不需要對 `fans-vault.html` 做任何治理動作——那一頁維持原樣。若日後又出現第二個「側欄名單列」需求，直接沿用 `.vault-row`（或屆時再提一次遷移）。

### Q104 · 共創方案在同一個畫面上有三種叫法（2026-09-01 提出，未動任何文案）

項目詳情「方案」分頁的共創區塊，同一件東西被叫了三個名字：

- 區段標題「支持方案」（`project-detail.tiers.title`，i18n.js:6692）
- 區段副標「每個**組合包**是贊助者可認購的回饋方案」（`pd-bundle.editor-sub`，i18n.js:6723）
- 新增鈕「＋ 新增**組合包**」（`pd-bundle.add`，i18n.js:6742）
- 而編輯器模組內部（清單列、彈窗標題、footer）共創一律講「**套組**」（`js/bundle-editor.js` 的 VOC：共創＝套組、預購＝方案、活動＝組合包）

模組那套字彙是有制度的（2026-08-04 定，三個變體各講各的話）；頁面層這三個 key 是更早寫的，沒跟上。目前的結果是使用者在同一畫面上要自己把「支持方案／組合包／套組」對應成同一件事。

**待裁決**：共創這一塊對外的名字是「套組」還是「方案」。牽涉的不只 UI 文案——「支持方案」是規格 §5.2.2 用的產品詞，改動要回寫上游；所以本輪一個字都沒改，暫維持現狀。建議方向：頁面層跟隨模組的變體字彙（共創＝套組），標題保留產品詞「支持方案」當區段名。

### Q102 · 浮層裡的頂列材質（2026-09-01 提出；成因已找到並修掉，剩材質微調待裁決）

黏住的詳情頁頂列在 detail-sheet 浮層裡**有沒有毛玻璃因瀏覽器而異**：`.detail-sheet__panel` 自己帶著 `backdrop-filter: blur(50px)`，巢狀的 backdrop-filter 跨 iframe 邊界在部分環境失效。本專案的內嵌瀏覽器實測有糊（1:1 解析度 A／B 差異明顯），使用者的瀏覽器沒有。

同一輪已來回三次：5% 白薄膜（太白、沒糊時內容直接穿過去）→ `--surface-shell` 72%（太黑、疊在面板的暖色玻璃上變成一塊黑）→ 回到 5% 白薄膜。再猜下去沒有意義。

**做法**：材質改成四個 CSS 變數，並新增 `docs/detail-topbar-tuner.html` 讓使用者在**自己的瀏覽器**裡調（左邊是真的浮層）。多一個不依賴 backdrop-filter 的選項——列的下緣加一段漸層淡出，讓內容淡掉而不是被切斷。

**2026-09-01 收斂**：使用者用調節器的對照開關證明成因是 `.detail-sheet__panel` 本體的 `backdrop-filter` 讓面板成為 backdrop root、壓掉 iframe 內側的玻璃。已把那段搬到 `::before` 負層（視覺不變），成因移除。

**要裁決的**：定案的底色、模糊半徑、要不要啟用下緣漸層。調節器會把值印成可貼的 CSS；貼回 `shared.css` 的 `.pd-detail__topbar.is-stuck` 之前，預設值不動。

### Q100 · rank-bar 的比例條有兩種畫法（2026-09-01 提出，暫依使用者裁示落地，待裁決）

「一列代表一個項目、長度代表比例」這個角色，站上現在有兩個答案：

- **原本的藥丸**：`.rank-bar__track` 40px 高，`__fill` 是一顆撐滿高度的 `--muted` 藥丸，標籤與色點壓在填色上面。仍在用的頁面——`earnings.html`／`earnings-overview.html` 的「收入來源分布」、`fan-detail.html` 的「忠誠點數的來源」（`ds-components/chart.css:494`）。
- **細條**：`.rank-bars--barline`，比例改用 `.project-bar`（`styles/shared.css:2056` 那條 6px 的）自成一列橫跨整個 grid，標籤永遠貼齊列首。只在 `project-detail.html` 的四份清單（方案統計、版稅分頁的地區與串流平台表現）。

**經過**：使用者 2026-09-01 先裁示「1 進度條要用 2 的元件／檢查所有設計，只要是 1 的元件都要改 2」，四個頁面全部換完之後隨即收回——「我錯了 只要改原本那頁就好」。所以細條版目前是刻意的單頁例外，不是還沒做完的遷移。

**要裁決的**：其餘三頁要不要跟上，還是兩種畫法各自有分工（例如「表格型的用細條、純排行的用藥丸」）。在裁決之前不要把任何一邊擴散出去，也不要新增第三種。

### ~~Q76 · chip 無框化後，淺色模式的未選 chip 與卡面同色~~（2026-08-25 提出；**2026-10-15 裁決 B**，已移到上方「已裁決」表）

> 選 B：chip 專用填色 role token `--chip-surface`（淺色比卡深一階、暗色沿用薄膜）。原題的三個候選與 7 處消費場景見 git 歷史。

### Q74 · 可選卡的「已選」表達：單選卡與多選卡目前是兩個答案（2026-08-25 提出，同日使用者裁決：刻意分開）

同一個卡片家族，兩種已選畫法：

- **單選卡** `.radio-cards .segmented__btn--active`（`ds-components/radio-card.css:81`）：**底色不變**（維持 `--input-surface`），已選只由右上角的實心橘點表達。Q8 當時的理由寫在檔內註解——radio-card 是「標題＋副標」的卡，整段標題染橘會變成在讀橘色內文，所以橘落在標記而不是文字或底色。
- **多選卡** `.cos__item--on`（demo）：**底色染橘 28%**＋文字轉 `--selected-ink`，2026-08-25 使用者從五個候選中選 D 暫定。

分岔的可辯護理由：多選一次會亮好幾格，需要更強的「這些是選進來的」訊號；單選永遠只有一格亮，橘點就夠。但兩者長在同一種卡面上，並排時仍讀得出不同體系。

要裁決的是：多選卡沿用單選卡的做法（底不變、只有標記橘，＝候選 E），或單選卡跟進多選卡（已選染底），或確認兩者刻意分開並寫進規則。

**與全站 `--selected-surface`（14%）的關係**：D 沒有動那個 token——它服務側欄、filter-tabs、section-nav 等導覽類已選。若日後要讓卡片與導覽同一個濃度，需另案評估（會動到全站）。

**裁決（2026-08-25）**：確認兩者**刻意分開**並寫進規則——單選卡維持底不變＋右上橘點；多選卡（promote 後的 `check-card.css`）維持染橘 28%＋`--selected-ink`。已登記進已裁決表。


### Q70 · 帳戶選單新增的「可展開單選清單」是站上第一個這種形狀（2026-08-24 提出，暫依現況）

D221 修訂 D220，帳戶選單（topbar 下拉、sidebar 子選單）新增語言列：常駐一列（標籤＋目前值＋
chevron），點了才展開四個語系選項。D222（同日）撤除 D221 引入的雙語言概念（不再有「顯示語言」
「預設語言」之分，語言收回單一概念），這一列因此簡化——原本標「預設」的徽章與「去設定改預設語言」
的提示行一併撤除。**D223（同日）再簡化收合列**：拿掉「預設語言」前置 label 與兩行 title/sub 結構，
只顯示目前語言名稱＋chevron，縮排字級對齊上方純文字列（Profile／Settings／Payments），補
`aria-label` 維持螢幕報讀語意——這只改收合列的**內容**，「收合式單選」這個**形狀**本身不受
影響，仍是站上第一次出現這種組合，本題待裁決範圍不變：

- **不是**卡式或分頁式 1-of-N（Q17 分工表的三支既有元件都假設常駐攤平，不假設「先收起來」）
- **不是** e-shop 分級選單的 `.dropdown__item--choice`／`.dropdown__menu--ladder`（那支殼服務的是完全不同的資料形狀——多層級分級，不是四個平行選項）
- 實作刻意沿用兩個選單各自既有的列 class（`.app-topbar__dropdown-option`／`.app-sidebar__sub-link`）疊加 `--toggle`／`--lang` 修飾子，不建立第三支獨立元件；展開態靠 `[hidden]` 切換＋chevron 旋轉，選中語意靠 `role="menuitemradio"`＋`aria-checked`＋check icon，證據：`js/sidebar.js` 的 `langMenuHtml()`／`langOptionsHtml()`、`ds-components/header.css`（`.app-topbar__dropdown-option--toggle`/`--lang` 一段）、`shared.css`（`.app-sidebar__sub-link--lang-toggle`/`--lang` 一段）

與 Q17／Q51／Q55 的既有 1-of-N 分工爭議交叉引用：Q17 是「卡式 1-of-N 該用哪一支卡」，Q51 是「清單列 vs 表單 select」，Q55 是「單選鈕兩套實作」——三者共同點是「同一個視覺角色隨版面／密度換做法」；本題是同一角色第四種做法（「收合式單選」），觸發條件是**空間極窄且選項數固定只有四個**（帳戶選單本來就窄，攤平四語系會撐爆，sidebar.js 已有 700px 視窗下側欄爆版的前例）。

選項：**A** 承認第四種形狀成立，寫進 Q17 分工表補一行「選單內窄欄＋固定少量選項＝收合式單選」；**B** 建成獨立元件（如 `.menu-select`），統一給未來類似情境重用；**C** 視為帳戶選單專屬的一次性寫法，不升成通用元件。暫依 **C**（目前只有這一個消費者，先不預先泛化），標 Q70；裁決權在使用者。

### Q69 · 同一組閘門的兩關用了兩支不同的 1-of-N 元件（2026-08-18 提出，未裁決）

建立項目的閘門 2026-08-18 起有兩關，兩關的選項卡不是同一支元件：

- 第一關「項目類型」＝ `radio-card`（`.radio-cards.radio-cards--3.radio-cards--gate`）：三張橫向大卡，卡內圖示在上、標題＋一段描述，無持久選取態、hover 時右上冒橘點。證據：`create-project.html:63-67`、`ds-components/radio-card.css` 的 `--gate` 變體。
- 第二關「內容類型」＝ `selection-card`（`.selection-grid--tiles` ＋ `.selection-card--icon`）：十張方形磚，圖示置中、只有標題。證據：`create-project.html` 的 `[data-cat-grid]`、`ds-components/selection-card.css` 的 `--tiles` 變體（本輪新增）。

兩支各自都合 Q17 的分工（三張帶描述的大卡 vs 十個只有標籤的密集選項），數量與資訊量差距也確實撐不起同一種卡；但**連著出現的兩個畫面**用兩套卡面語言，中間沒有任何解釋。可能的收法：**A** 維持現況，在 `design-system.md` 寫明「同一組閘門可依選項數與資訊量換卡型」；**B** 第二關改用 `radio-cards--gate` 的卡面、只調密度；**C** 第一關改用磚、描述改成 hover 或次行小字。暫依 **A**（現況），標 Q69；裁決權在使用者。

### Q50 · 詳情頁頁首的封面尺寸：站上有三種做法（2026-08-17 記錄，未裁決）

同一個視覺角色「詳情頁頁首左側的封面」，站上目前有三個答案：

| 做法 | 寬度 | 比例 | 消費頁 | 證據 |
|---|---|---|---|---|
| `.pd-hero__cover` | 220px | 2 / 3 | `project-detail.html` | `shared.css:1432`、`:1441` |
| `.ip-hero__cover` | 200px | 3 / 4 | `ip-detail.html` | `shared.css:1304`、`:1306` |
| `.page-intro__media` | 96px（窄螢幕 64px） | 2 / 3 | `event-detail.html` | `ds-components/page-intro.css:34-46` |

**怎麼跑出三種的**：三者各自為當下的頁面需求調過一次，沒有人在同一輪裡看到另外兩個。`.pd-hero` 這一版在 2026-08-17 由 300px 收到 220px，是為了修 D193 搬走營運摘要之後右欄空掉一大半的破洞（見 ASSUMPTIONS HERO-001）——那次只解掉「破洞」，沒有解掉「站上有三種」。`.ip-hero` 的 3 / 4 也與全站統一的 `--img-portrait`（2 / 3，Q39 使用者裁決）不一致。

**本輪的處置**：只把 `.pd-hero` 調到「跟它自己右欄的內容高度對得上」，**沒有動另外兩支**，也沒有新增第四種。裁決權在使用者。

**選項**：
- **A** 三頁統一成一種尺寸（要挑一個，並接受活動頁的頁首變高、或項目頁的封面變小）。
- **B** 依「封面在這一頁有多重要」分兩級：作品類詳情（項目、IP）用大封面，活動類用小縮圖——那就要把兩級寫成 design system 的規則，而不是三個各自為政的數字。
- **C** 維持現狀，明白承認這是三個獨立版型。

> **Q43（返回鈕樣貌）已於 2026-08-02 當日裁決，見上方「已裁決」表。**

> **2026-07-13：Q1–Q12 全數裁決完成，見上方「已裁決」表。** 以下保留每題的證據與選項供執行工單參考（動 token/元件時對照）。視覺化圈選版：`docs/風格裁決-視覺化.html`。
>
> **2026-07-13 全數執行完成**（執行狀態欄已標 ✅）。落地時的三個技術決定，記錄在案供日後對照：
>
> - Q2：採「別名合併」——把 `--radius-md` 定義成 `var(--radius)`（同 6px），不改 67 處呼叫點；視覺結果與全量合併相同。
> - Q9：`.filter-tabs__item:hover` 保留 `--muted` 為**例外**（因其 `--active` 也是 muted 灰，hover 若升 accent 會比「已選」還重、倒置層級）。其餘互動 hover 全收斂成 `--accent`。
> - Q6：統一 16px、`.form-section` 不再覆寫；「長建立流程用 24」折衷**未採用**（如日後想恢復呼吸感再加一條 scoped 規則）。
>
> 完整改動清單見 `UI-CHANGES.md`（2026-07-13 條目）。

站台：`Project/ztor-creator-studio/site/r2.1`。以下每題都是「同一件事、站上已存在兩種以上做法」的真實矛盾，逐題圈選 A／B／C 後即可一次落 token 或元件、全站生效。證據一律標「檔案:行號」。

### Q68：表格表頭要不要畫底色帶（2026-08-13 提出，同日使用者選 C，維持原裁示）

使用者提供一張外部參考圖（資料表：表頭有一條藍色底色帶、欄名較重、列首一欄勾選框、未選列灰化），指示「這個 table 用這樣的設計，樣式用我們的」。底色帶那一項與 **2026-07-31 已裁示的「列表表頭不畫底色帶」**（`--column-head-ink` 欄名＋留白分隔）直接衝突，因此做成三個變體並排比對（`docs/bundle-table-demo.html`）：

- A：表頭疊一層薄膜（`--nest-surface`）往亮，方向與 Q66 的疊層模型一致
- B：表頭用品牌橘 10% tint，最接近參考圖那條藍色帶的份量
- C：不畫底色，維持 2026-07-31 的做法

**裁決：C。** 2026-07-31 的慣例仍是唯一答案，A／B 兩案退場，全站不必改。參考圖的其餘三件事同輪採用到組合包彈窗的兩張表：表頭第一格放全選、所有勾選框（含場次組頭）對齊同一欄、沒勾到的列整列淡化。參考圖還有一欄彩色狀態點，**我們的票券沒有對應的資料欄位**，未採用（要做需先由上游定義那個狀態是什麼）。

### Q67：控件的填色要不要跟著所在表面走（2026-08-13 提出，同日裁示「從 DS 和元件一起改」，已落地）

使用者圈選組合包彈窗裡的「＋ 新增權益」：「這個按鈕沒有照階層邏輯」。

**問題**：`.btn--outline` 的填色是**絕對色** `--card`。同一顆按鈕因此在三種表面上讀出三種層級關係——

| 所在表面 | 深色底色 | 按鈕填色 | 讀起來 |
|---|---|---|---|
| 頁面畫布 | `#0C0D0D` | `#212223` | 比底亮（對） |
| 卡片內 | `#212223` | `#212223` | **同色，填色等於不存在** |
| L2 分組面內 | ≈`#292A2B` | `#212223` | **比底暗，往下沉** |

這與 `.form-section--outlined` 放進卡（Q66）是同一類毛病：**在巢狀情境裡用絕對表面色**。

**裁決＝填色改成相對值**。新增 `--control-raise`：深色 `rgba(222,223,233,.04)`（疊在所在那一層上，固定亮一階）／亮色 `var(--card)`（維持白卡；亮色畫布是 `#FAFAFA`、卡是白，白填在畫布上有升起感，在白卡裡本來就交給邊框——**亮色行為完全不變**）。

`.btn--outline` 原本那句註解（2026-06-12）自己就寫著「a real border works on both white and gray grounds」——邊框接手之後，那個填色就只剩「在某一種表面上剛好對」的絕對值，本題把它收成相對值。

**同輪連帶（元件層）**：`.fc-add` / `.fc-add-item`（新增套組／新增商品／新增權益）改 `border-style: dashed`。站上「這裡還沒有東西、按了才長出來」一律是虛線框——`upload-tile` 的上傳格、`payout-modal` 的新增帳戶、`variant-builder` 的兩顆新增鈕（Q24 同輪改的）都是；這兩顆做的是同一件事，實線會讀成一般按鈕。

**複驗**：events／e-shop／earnings／settings／create-product／project-detail／publish-work／design-system 八頁掃過所有 `.btn--outline`，相對所在表面**最差 +7.6**（改之前在卡與 L2 裡是 0 與負值）；亮暗兩主題各驗一次。

證據：`ds-components/button.css` 的 `.btn--outline`（含 2026-06-12 的沿革註解）、`ds-components/_tokens.css` 的 `--control-raise`、`ds-components/bundle-editor.css` 的 `.fc-add`／`.fc-add-item`。

### Q66：巢狀分組往亮還是往暗（2026-08-13 提出，同日使用者裁示「一起做完」，已全站落地）

**Q66 全站落地（2026-08-13 第三輪，使用者「都改」）**：先前的稽核只查「亮度方向」，漏掉另一類——**卡／彈窗裡的分組面用實色（更暗的 `--muted` 或與母層同色的 `--card`）**。重掃 25 個代表頁後逐支翻向，一律改成 `--nest-surface` 薄膜 ＋ `--nest-line`、交出浮起陰影：

- 一定在卡內的，直接改元件本體：`.scanner-access`（掃碼器存取）、`.payout-bank-card`／`--empty`／`--option`／`.payout-summary`（提款相關四支）、`.ss-status`、`.msg-schedule`、`.review-status`、`.cb-summary`／`.cb-add-tile`（建立組合包頁內）。
- 兩種情境都有的，規則掛在情境上、不動頁面層用法：`.card .preview-card`／`.payout-dialog .preview-card`、`.card .funding-panel--card`、`.card .picker`。
- 結構層：`.payout-dialog .card`、`.form-section--outlined .form-section--outlined`（內層翻向）。
- 連帶：`.payout-bank-card--selected` 的底色原本吃 `--card`，基底翻成薄膜後它反而比未選態沉，改成薄膜再疊一層。
- **刻意不改**：`.qr-box`（媒體井，QR 要印在淺底）、`.album-tracks__upload`／`.sce__add`（虛線的「可以放東西進來」動作格）、`.vip-card__plate`（VIP 卡的裝飾板）、`.segmented` 軌道等控件凹槽（Q66 B 段已裁：`--muted` 只服務凹槽與襯底）。
- **順帶修的控件**：`.scanner-access__url code`（掃碼器連結那一格）原本吃 `--card`——它坐在分組面裡、是第三層卻疊著 L1 卡的顏色；它是唯讀值欄位，改用跟 input 同一個面 `--input-surface`。
- 對照 demo：`docs/surface-layer-fix-demo.html`（五組左右並排＋亮度差實測）。複驗：13 頁重掃，25 處分組面全部由 −11／0 變成 **+7.6～+7.8**（往亮一階）。

**Q66 延伸落地（2026-08-13 第二輪，使用者指著建立活動的場次盒裁示「開放入場是用線框的，但場次 Day 1 要用背景色」）**：

- **層級分工定案**：L1 區塊卡（`--card`）→ **L2 分組面用填色**（`.card--muted` 的 `--nest-surface` 薄膜）→ **L3 用 1px 線框**（`.control-group--plain`）。這正是 `nest.css` 檔頭寫的「填色只到 L2、第三層起用線框」，本輪把它套到活動的場次結構上。
- **改了什麼**：建立活動的場次盒與票務「一場一盒」、活動詳情場次分頁的場次盒，由 `.control-group--plain`（線框）改為 `.card--muted`（填色）；盒內的「開放入場」維持線框，成為 L3 的示範用例。
- **連帶的元件規則**：`.card--muted` 坐在卡或頁面分組裡時交出 `.card` 的浮起陰影與上緣高光（`.card .card--muted, .form-section .card--muted { box-shadow: none }`）——留著會被讀成「浮在卡上的第二張卡」，與「疊上去的一層」是兩種語彙。連帶影響 publish-work、auction-detail 既有的 `.card--muted`（方向一致，屬修正）。
- **`--plain` 的角色因此收斂**：只服務第三層。兩步（場次那一步、票務那一步）同一種「一場一盒」不再長成兩種樣子。


站上同一個視覺角色（「卡片裡的一段分組」）目前有**兩套方向相反**的答案，兩套各自都合 token 紀律，機械檢查抓不到：

- **往暗**：`--muted` `#161718`（`.card--muted`）與 `--surface-shell` `#1C1D1E`（`.form-section--outlined`，Q42）。`_tokens.css:612` 的註解直接寫「嵌套襯底：比卡深」。
- **往亮**：`--nest-surface` `rgba(222,223,233,.04)`（Q24 的 `.nest`）與 `design-layers.html` 的 `--layer-2-surface`（同值，照 Figma `856:27798` 定的）。模型是「疊在誰身上就跟著誰亮一階」。

**觸發**：組合包彈窗把三張分卡放進 `.payout-dialog`（底色 `--card` `#212223`）時，`.form-section--outlined` 的 `--surface-shell` 比面板**更暗**，讀起來是往下沉一階。使用者圈選該區裁示：「依照 figma 修正階層的規則，每加一層的 section 顏色應該是越來越亮。」

**本輪暫依「往亮」**：`docs/bundle-popup-demo.html` 的 `.bdp-sec` 用 `--layer-2-surface`／`--layer-line`，只在該頁作用域內，`_tokens.css` 與既有元件零修改。

**裁決＝全站分組面往亮，且把 `--muted` 的角色收斂**（2026-08-13 使用者「一起做完」）。落地三件事：

1. **`.card--muted` 翻向**：`--muted`（比卡暗）→ `--nest-surface`（疊在卡上、比卡亮一階）。亮色兩層同為白，補一條 `--nest-line` 線框才分得出來（沿用 Q62「亮色分層改用陰影或線框」）。實測深色 host `#1C1D1E` → 子層 +7.8 亮度、亮色白底 + `rgba(16,17,20,.08)` 線框。
2. **新增 `--nest-line`**：深色 `transparent`（4% 薄膜已足夠，再加線會變成兩套分層語彙疊在一起）／亮色 `rgba(16,17,20,.08)`。
3. **`--muted` 角色收斂**：只服務**凹槽與襯底**——控件軌道（`.segmented`）、媒體井（圖片未載入的格子）、進度條底。這一類往下凹是對的，**不在翻向範圍**，所以 B 段那 5 頁的 segmented 不動。token 註解已改寫。

**Q42 未被推翻**：`.form-section--outlined` 仍用 `--surface-shell`。它是**頁面層**的分組，坐在畫布 `#0C0D0D` 上本來就比畫布亮、方向正確。改的是「卡／彈窗內的分組」這個不同的角色——規則見下一段。

**連帶規則（寫進 design-system Pillar 6）**：`.form-section--outlined` 是頁面層的分組，**不放進卡或彈窗**；卡／彈窗內的分組用往亮的那一層（`.bd-sec` 之於組合包彈窗、`.card--muted` 之於卡內分組、`.nest` 之於模式切換長出來的整層）。理由：outlined 吃的是絕對色 `--surface-shell`，比 `--card` 暗，一放進卡就往下沉一階。

**全站稽核（2026-08-13，53 頁逐頁量合成後亮度）**：報告在 `docs/階層稽核-2026-08-13.md`。結果——站上大致一致，同類問題只有 **2 處**（`publish-work.html` 的 `.form-section--outlined > .card--muted`、`auction-detail.html` 的 `.form-section--outlined > .ad-hero`，皆 `#161718` 坐在 `#1C1D1E` 上）；另有 **1 個隱患**——`.segmented` 的軌道也吃 `--muted`，但那是「控件凹槽」不是「分組面」，**Q66 若裁全站往亮，必須先把這兩個角色拆成兩個 token**，否則軌道跟著翻亮、滑塊就浮不起來（受影響：create-auction／projects／earnings 三族共 5 頁）。**目前 0 頁**把 `.form-section--outlined`／`.card--muted`／`.nest` 放進 `.card`／`.payout-dialog`／`.drawer`／`.detail-sheet`——組合包彈窗會是第一個，已在 demo 避開。

證據：`ds-components/_tokens.css:607`（`--card`）、`:612`（`--muted` 註解「比卡深」）、`:643`（`--nest-surface`）、`:676`（`--surface-shell`）、`design-layers.html:33-37`、`ds-components/nest.css` 檔頭的兩層填色說明、`docs/bundle-popup-demo.html` 的 `.bdp-sec`、`docs/階層稽核-2026-08-13.md`。

### Q61～Q64：表面階層要不要收成一組帶級數的 token（2026-08-11 提出，**2026-09-15 使用者裁決：Q61 A／Q63 B／Q64 核可遷移**）

**裁決（2026-09-15，使用者原話「Q61 : A／Q63 : B／Q64: ok」）與落地**：

- **Q61 A ✅ 已執行**：`_tokens.css` 新增 `--layer-0-surface`／`--layer-1-surface`／`--layer-2-surface`／`--layer-2-line`／`--layer-3-surface`／`--layer-line` 六支 Role 別名（全部 `var()` 指向既有 Foundation，不帶新顏色、不另設暗色覆寫）。與 8/11 提案的差異：換裝之後 L1 已是玻璃，所以 `--layer-1-surface` 指 `--ztu-glass-bg`、`--layer-2-surface` 指 `--ztu-film`（不是提案時的 `--card`／4% 薄膜）；L2 邊界沿 Q66／Q98 現況用線（`--layer-2-line`＝`--nest-line`），提案的 `--layer-2-edge` 落影環未採用（未進 `_tokens.css`）。`.nest` 與 `.card--muted` 已改吃 `--layer-2-surface`／`--layer-2-line`，零視覺變動。文件：`design-system.md`／`.html` §2.5a。
- **Q62**：8/11 已裁示，不變。
- **Q63 B ✅ 已執行**：`--layer-line: var(--border)`，只把現行線色收進層級系統，不覆議 Q22 挑定的亮度。
- **Q64 ✅ 已執行（2026-09-15 同日，使用者「改吧」）**：盤點清單 `docs/Q64-表面階層遷移清單-2026-09-15.md`。第一批 40 支純改名（L0 1／L1 29／L2 1／L3 9，別名零變動）＋第二批 15 支 `--nest-surface`→`--layer-2-surface`（4%→8.5%，`.funding-panel`／`.payout-bank-*`／`.scanner-access`／`.review-status`／`.ss-status`／`.msg-schedule`／`.bd-sec`／`.cb-summary` 等，同規則的 `--nest-line`→`--layer-2-line`）一次做完；第三批「不確定」9 支判為材質或效果、維持原 token；`design-layers.html` 對照組未動。實測 `project-detail`／`store-settings`／`create-bundle` 三頁 computed 值 4%→8.6%，0 console error，check_ds_sync 全 PASS。原規劃（供對照）：L0（`shared.css` body 直接吃 `--ztu-canvas`）、L1（`card.css` 等直接吃 `--ztu-glass-bg` 的卡面）、L3（`--border` 消費者裡屬「分組線框」的那些）、以及 **`--nest-surface`（4%）22 支消費者與 `--ztu-film`（8.5%）並存的差**——這是 Q66 落地（8/13）與 ztorUI 換裝（8/28）先後改出來的兩種 L2 濃度，遷移時要逐支確認該併到 8.5% 還是它其實是凹槽。遷移清單另派盤點、按批走，每批附零視覺變動證據。
- `design-layers.html`：**2026-09-16 使用者要求「把 layer demo 以最終定案的方向再整理一次」**，改寫成只吃正式 `--layer-*` token 與正式元件（`.card`／`.card--muted`／`.form-section--outlined`／`.nest`／`.btn--outline`／`.segmented`）的定案示範頁，提案變數（`--lyrdemo-*`）全部拿掉；Q87「不熔接」對這一頁不再適用（其餘 C-4／C-5／C-8 頁不變）。內容：怎麼運作、階梯總表（即時算合成色與對比）、四階相套、疊到第幾層停（正確 vs 禁止）、浮層不透明／控件比所在層亮／凹槽往暗三例、裁決紀錄。

---- 以下為 2026-08-11 提案原文 ----


Figma `856:27798`（layer0／layer1／layer2／layer3）把「表面層級」畫成一個通用模型：L0 畫布實色、L1 卡片實色、L2 半透明薄膜（疊在誰身上就跟著誰亮一階、可再疊）、L3 不再疊填色只留 1px 邊框。站上目前有**三套各自管一段的層級語彙**並存，沒有一套是通用的：

- 現況 A（離散實色階，Q15／Q42）：`--surface-page #0C0D0D` → `--muted #161718` → `--surface-shell`／`--sidebar #1C1D1E` → `--card #212223` → `--accent #2A2B2C`。管全站底色，但級數不在名字裡，要知道某塊是第幾層得先背五個顏色。
- 現況 B（E0–E4 陰影階，`design-system.md:596-608`）：只管陰影強度，不管底色。
- 現況 C（Nest 相對疊加，Q24）：`--nest-surface: rgba(222,223,233,.04)` ＋ `--shadow-nest-up`，值本來就是照這張 Figma 定的（`ds-components/_tokens.css:640-643` 註解直接寫「值與 Figma node 856:27796 相同」），但只服務 `.nest` 一個元件、只有一個消費頁。

**提案 demo：`design-layers.html`**（本輪產出，`--layer-*` 只在該頁作用域內，未進 `_tokens.css`，其他頁面零影響）。四題如下，裁完才動 foundation：

- **Q61 命名**：**A** 新增 `--layer-0/1/2/3-surface`，級數寫在名字裡，看 token 就知道第幾層（代價：既有 `--nest-surface`／`.nest` 要改成指向新名字，過渡期兩個名字並存）；**B** 沿用 `--nest-surface`，只補文件說明它其實是通用的 L2（不新增 token，但「從 token 就看得出層級」只存在文件裡）。demo 示範 A。
- **Q62 亮色的 L2**（**2026-08-11 使用者裁示，已在 demo 落地**）：主色是黑夜，白天版**除了畫布與 L1 之外，其餘層一律留白，分層改用陰影或線框**。落地做法——`--layer-2-surface` 在亮色指向 `var(--card)`（白），新增 `--layer-2-edge`（`0 1px 3px rgba(16,17,20,.08)` 落影 ＋ `0 0 0 1px rgba(16,17,20,.05)` 環）承擔分離感；深色的 `--layer-2-edge` 為透明（深色靠底色分層，不需要）。原先考慮的「疊深色薄膜 `rgba(16,17,20,.03)`」作廢：白底疊灰膜會把卡片染灰，層數愈多愈髒。
- **Q63 hairline 要不要改成相對值**：**A** `--layer-line: rgba(222,223,233,.08)`，疊在卡上合成 ≈`#303133`，同一條線在任何父層上分離感一致（代價：比現行 `--border #373839` 淡一階，而該值是 2026-07-26 Q22 從三個候選裡挑定的，等於覆議）；**B** `--layer-line` 直接指向現行 `--border`，只換名字進層級系統。demo 示範 A。
- **Q64 遷移範圍**：本輪完全沒遷。`--card` 有 66 支元件消費、`--border` 78 支，全站遷移是另一件工程，而遷完才會真的收掉「三套層級語彙並存」。等 Q61～Q63 裁完再排。

建議：Q61 選 A（使用者本次的要求就是「從 token 就有區分」，B 達不到）、Q63 選 **B**（`--border` 的亮度是使用者自己從三個候選挑的，沒有理由在這一輪順手覆議；要改另開一題）。Q62 已裁示。裁決權在使用者。

證據：`ds-components/_tokens.css:605-643`（現況 C 的 `--nest-surface` 與 `--card`／`--muted`／`--accent`／`--border`）、`ds-components/_tokens.css:657`（`--sidebar`）、`ds-components/_tokens.css:676-677`（`--surface-shell`／`--surface-page`，現況 A 的其餘兩階）、`ds-components/_tokens.css:744-746`（`--shadow-nest-up`）、`ds-components/nest.css:1-44`（現況 C 的元件與「只有兩層填色」的既有結論）、`design-system.md:596-608`（E0–E4）、`design-system.md:3975-3997`（§4.53 Nest）、`design-layers.html`（提案 demo）。

### Q60：直式上傳圖的元件與排版（2026-08-09 提出，同日使用者裁決，全站落地）

- 原本站上兩種做法：
  - **大格＋縮圖列**：主圖用 `--hero`（整列寬），附圖 4 格排在旁邊或下方（`.upload-showcase`／`.upload-grid`）。
  - **同尺寸列**：格子一樣大，靠角落標籤 `__flag` 分辨主圖（`.upload-assets`）。
- **裁決＝只留後者，而且只留一套**。使用者：「這個元件和這個排版規則套用到 r2.2 全部直的上傳圖。所以直的上傳圖只會用這一套元件，其他都刪除。」
- 正典＝`.upload-assets.upload-assets--fill`：`--upload-asset-cols`（預設 4）格撐滿一整列、第五格換行且尺寸相同，容器變寬變窄等比縮放（≤640px 降為兩格）；需要「填滿才長出下一格」時容器再加 `[data-upload-reveal]`。
- **退場**：`.upload-tile--hero`（連同 Q18 的圓角晶片圖示框）、`.upload-grid`／`--2x2`、`.upload-showcase`／`--stacked`。CSS 已刪、檔尾留墓碑。
- 仍服役、不在本題範圍：`--file`（檔案投放列）、`--16x9`（橫式媒體槽，project-detail 的 Demo 影片／音樂）。
- 本輪改到的頁：create-product、create-auction、create-bundle、bundle-detail、product-detail（含 IP 素材槽）、publish-work（封面與劇照）；原本就吃 `.upload-assets` 的 create-project／create-event(-legacy)／create-campaign／project-detail／series-detail／event-detail／`bundle-editor.js` 一律補 `--fill`。

證據：`ds-components/upload-tile.css`（`.upload-assets--fill` 與檔尾墓碑段）、`ds-specs/4.15-tabs.md`。

### Q59：已填的上傳格用綠色表達（2026-08-09 提出，同日依使用者裁示落地）

- 現況：`.upload-tile.is-filled` 是 `border-color: var(--status-success)` ＋ `color: var(--status-success)`，連 `.upload-tile__title` 也染綠。
- **裁決＝撤除綠色**。使用者圈選建立活動的圖庫格：「不該有綠色 border 這種元件。」
- 落地：改成中性 `border-style: solid` ＋ `--border` ＋ `--foreground` 文字。**已填與未填的差別改由「實線 vs 虛線邊框」承擔**——形狀差異本來就在，顏色是多的一層。
- 為什麼可以直接撤：`--status-success` 在站上的語意是「狀態結果」（付款成功、審核通過），「這一格填了圖」不是狀態、是內容有沒有；用綠色表達會讓真正的狀態綠變得廉價。十幾個消費頁逐頁確認過，沒有任何一頁是靠這個綠框當「已上傳」的唯一訊號。
- 影響範圍：`upload-tile.css` 的所有消費頁（media-vault／create-project／register-ip／product-detail／publish-work 等十幾頁）。

證據：`ds-components/upload-tile.css` 的 `.upload-tile.is-filled` 段落。

### Q58：站上出現兩種 disabled 欄位（2026-08-09 提出，同日依使用者裁示落地）

- 現況 A（`input.css` 的 `.input:disabled`）：`--muted` 填底＋`--foreground-muted` 字＋`opacity:.75`。全站基準，二十幾頁在吃。
- 現況 B（`field-source-tag.css` 的 `.is-source-locked`，2026-08-09 當天建立）：透明底＋最輕的墨色。起因是 A 的填底比卡片還深，坐在 `form-section` 上讀起來像「這裡壞了」。
- **裁決＝B，並上收成全站基準**。使用者圈選門票彈窗的唯讀「總價」欄位：「這個 disable 的 input 怎麼和剛才改的不同，整個元件庫應該都只能用同一個。」
- 落地：透明底那一組寫進 `input.css` 的 `.input:disabled`／`.textarea:disabled`／`.select:disabled`，`field-source-tag.css` 不再定義欄位鎖定樣式，只留來源標記與 `.is-source-locked .segmented__btn`（segmented 不是表單控件、吃不到 `:disabled`）。
- **連帶的語意決定**：來源鎖定欄位與其他 disabled 欄位長得一樣是刻意的——「這格為什麼不能改」由標籤旁的來源標記回答，不靠兩種灰去暗示。
- **已知代價**：值的墨色是 `--locked-field-ink`，對比刻意低於 WCAG AA（深色 2.69:1／亮色 2.20:1，見該 token 的文件）。全站 disabled 欄位一起套用了這個決定。

證據：`ds-components/input.css` 的 `:disabled` 段落、`ds-components/field-source-tag.css`、`ds-components/_tokens.css` 的 `--locked-field-ink`。

### Q57：「打字搜尋 → 下拉候選 → 選一個」站上有三套做法（2026-08-09 提出，同日依使用者裁示落地）

> **2026-08-09 裁決＝A（往 `combobox.css` 收斂）**。使用者裁示「樣式應該都要以原本的 DS 為主」，三題（Q55／Q56／Q57）一併裁成「頁面改用既有元件、不留頁內的平行做法」。落地：建立活動頁的 `.ce-pick*` 一組退場改用 `.combobox*`，已加入的商品列改用 `.chip.chip--removable`（combobox 自己表達已選項的方式）。**視覺因此改變**——候選項的名稱與價格由「左右分排」改成 combobox 的「name 在上、meta 在下」，已加入的商品由帶邊框的橫列改成可移除標籤。

建立活動正式化時盤點出來的唯一一處真正重複建設。同一個互動問題，站上現在有三個答案：

- 現況 A（`combobox.css`）：`.combobox__menu` 浮動選單＋`.combobox__opt`，focus 觸發、選項可帶 28px 圖示。
- 現況 B（`picker.css`）：`.picker__search` ＋ `.picker__list`，選項列借用 `.data-list__row`，是「面板內的挑選清單」而非浮層。
- 現況 C（建立活動頁內 `.ce-pick*`／`.ce-prod*`）：`.ce-pick__anchor` 定位＋`.ce-pick__menu` 浮層＋`.ce-pick__opt`，另有「已加入的列」`.ce-prod__row`。票種欄與「加入商品」兩處共用。
- 三者的 `z-index` 也不一致（A 是 30，C 是 60），全站沒有 z-index token 刻度，各浮層各自訂數字。
- 選項：**A** 往 `combobox.css` 收斂，C 的「已加入清單」另外抽成一支或併進 `chip.css`；**B** 往 `picker.css` 收斂；**C** 承認兩種語彙並存（浮層型 vs 面板型），把判準寫進 design-system Pillar 5，C 併入其中一支。
- 建議：A。C 與 A 的解剖幾乎一樣（浮層貼在輸入框下、一列一個選項），差別只在 C 多了「已加入的列」；B 是面板內清單，形狀本來就不同，不該硬併。裁決權在使用者。
- ~~現況處置：2026-08-09 正式化時 `.ce-pick*` 一組刻意留在 `create-event.html` 頁內、沒有 promote~~ **同日裁決後已退場**，見本題開頭。

證據：`ds-components/combobox.css:24`（`.combobox__menu`，z-index 30）、`ds-components/picker.css`（`.picker__search`／`.picker__list`）、`create-event.html` 頁內 `<style>` 的 `.ce-pick*`／`.ce-prod*` 段落。

### Q56：場次清單有兩套，欄位數不同（2026-08-09 提出，同日依使用者裁示落地）

> **2026-08-09 裁決＝B（併進既有 `session-list.css` 成為變體）**。同 Q57 的裁示。落地：`.ce-sess*` 退場改用 `.session-list*`；既有元件缺的兩樣東西往元件補——`.session-list__head`（欄位標題列）與 `.session-list--detailed`（多欄變體，含 `[data-multi]` 的兩種欄寬）。既有兩欄版行為不動，`create-event-legacy.html` 不受影響。鎖定態不再自造，改用 `field-source-tag.css` 已有的 `.is-source-locked`。

- 現況 A（`ds-components/session-list.css`）：兩欄版（日期＋場地），`create-event-legacy.html` 仍在消費。
- 現況 B（建立活動頁內 `.ce-sess*`）：四欄版（場次名＋日期＋起訖＋入場），另有 `[data-multi]` 變體再換一次欄寬、`.ce-sess.is-locked` 鎖定態、900px 以下收合。demo 期間的原註解就寫著「沿用 session-list 的節奏但欄位不同，所以另立一組，確認採用再合併」。
- 選項：**A** 把 `session-list.css` 擴充成支援可變欄位數（欄位定義交給消費頁的 grid-template 或 data 屬性），B 併進去；**B** 兩者並存成兩個變體（`.session-list` 單日版／`.session-list--detailed` 多欄版）；**C** 舊的兩欄版退場，全站只留多欄版（但 legacy 頁還在用它）。
- 建議：B。A 的「可變欄位數」會把欄寬決定權推回頁面、等於元件不再擁有版面；C 會動到 legacy 備份頁的呈現。裁決權在使用者。
- **現況處置**：`.ce-sess*` 已依裁決退場。`.ce-types*`／`.ce-tiergroup*`（票種定義列與門票的場次分組標題）**仍留在頁內**——站上沒有對應的既有元件可收斂，不在本次裁決範圍，日後若出現第二個消費者再 promote。

證據：`ds-components/session-list.css`、`create-event-legacy.html` 的 `session-list.css` 連結、`create-event.html` 頁內 `<style>` 的 `.ce-sess*`／`.ce-types*`／`.ce-tiergroup*` 段落。

### Q55：單選鈕有兩套實作（2026-08-09 提出，同日依使用者裁示落地）

> **2026-08-09 裁決＝C（`zradio` 退場，改用既有 `radio-list`）**。同 Q57 的裁示：站上已經有的元件說了算。落地：當天上午才 promote 進 `checkbox.css` 的 `.zradio*` 同日移除、留 tombstone；建立活動購票規則的三組選項改用 `.radio-list__item`／`__dot`／`__text`，選取改由 JS 切 `--active`（radio-list 沒有原生 `<input type="radio">`）。**代價已知並接受**：這些選項因此不具原生表單語意與鍵盤 radio 行為；原型階段沒有真的送出表單，接真後端時要一併檢討。

- 現況 A（`ds-components/radio-list.css`）：2026-07-21 建的「輕量單選列」，按鈕列＋JS 切換 active class，**沒有原生 `<input type="radio">`**，指示器是畫出來的圓點（已選 8px 實心橘）。
- 現況 B（`.zradio*`，2026-08-09 隨建立活動正式化 promote 進 `ds-components/checkbox.css`）：真正的原生 radio 疊在畫出來的圓點下面，點擊、鍵盤、表單語意全部原生，只換視覺。做法與同檔的 `.zcheck` 完全一致（`__control` 16px、`__dot::after` 8px 都與 A 的數值相同）。
- 選項：**A** 承認兩種語彙並存——`radio-list` 用於「選了就切換檢視」的輕量選單列、`zradio` 用於表單裡真的要送出的選項，把判準寫進 design-system Pillar 4；**B** `radio-list` 改成以 `zradio` 為底重寫，全站只留一套；**C** 反過來，`zradio` 退場改用 `radio-list`。
- 建議：A。兩者的差別在語意（一個是檢視切換、一個是表單資料），視覺數值本來就已經一致。C 不可行——購票規則那些選項要進表單，需要原生語意。裁決權在使用者。

證據：`ds-components/radio-list.css:78-79`（已選 8px 圓點）、`ds-components/checkbox.css` 的 `.zcheck` 與新增的 `.zradio` 段落。

### Q54：一個 form-section 裡要再分組時，沒有「小標」這一級（2026-08-08 提出，待裁決）

Q21（2026-07-20）把區段標題與欄位標籤都拉平成 `--fs-14`、層級改由卡片邊界承擔。這在「一張卡＝一組欄位」時成立，但**建立活動 demo** 出現一張卡裡有三組東西（場次的日期時間／場地細節／每一場的人數），Q21 沒有為這個中間層留下任何表達方式。

- 現況 A（區段標題）：`.form-section__title`——`--font-display`／`--fs-14`／`--type-title-24-tracking`。
- 現況 B（欄位標籤）：`.form-section .field__label`（`ds-components/form-section.css:90`）——`--font-ui`／`--fs-14`／regular。Q21 刻意與 A 同字級。
- 缺口：A 與 B 之間沒有東西。demo 裡試過兩種都錯——掛 `.field__label` 再壓暗成 `--foreground-muted`，變成比它統轄的欄位標籤還小聲；改成 `--fs-13`，又比 `--fs-14` 的欄位標籤更小。兩次都把階層做反。
- demo 暫用的做法（頁內 `.ce-subhead`，`docs/create-event-demo.html`）：**字型字級完全比照 `.form-section__title`，層級靠邊界承擔**——上方一條 `1px solid var(--border-soft)` hairline（與 `.form-section + .form-section` 的分隔線同一支）＋加大留白。這是把 Q21 的原則（邊界，不是字級）往下再用一層，不新增第四種字級。第三層（例如「每一場的人數」統轄最少／最多兩欄）沿用 `.field__label`，只多給上方留白（`.ce-grouplabel`）。
- 選項：**A** 採納 demo 的做法，promote 成 `form-section.css` 的 `.form-section__subhead`（＋第三層 `.form-section__grouplabel`），寫進 design-system Pillar 4；**B** 不承認這一級，改要求「一張卡只放一組」——把場次拆成三張 outlined 卡；**C** 為這一級開一個新字級（例如 display／`--fs-16`），等於部分推翻 Q21 的拉平。
- 建議：A。B 會讓建立流程的卡片數量膨脹（場次一步就從一張變三張，而它們是同一件事的三個部分）；C 動到已裁決的 Q21，代價最大。裁決權在使用者。

**2026-08-09 現況更新**：demo 升為正式頁（`create-event.html`）時，這一級**暫依上面的建議 A 落地**——`.ce-subhead`／`.ce-grouplabel` 已 promote 成 `ds-components/form-section.css` 的 `.form-section__subhead`／`.form-section__grouplabel`。這是「暫依最新確認的做法並標註題號」，不是裁決；使用者若裁 B 或 C，回退範圍就是這兩個 class 與建立活動頁的三處消費點。

證據：`ds-components/form-section.css:70-90`（Q21 的拉平：title 14 / label 14）、`ds-components/form-section.css` 的 `.form-section__subhead` 段落、`create-event.html`（三處消費點）。

### Q46：清單分段的做法出現第二種——群組標題在上 vs 有字的分隔線在下（2026-08-04 提出，待裁決）

「把一張清單切成兩段、並說明每段是什麼」，站上現在有兩個答案：

- 現況 A（群組標題在上）：`.src-status__group`（`ds-components/source-status.css:99-106`）——`--fs-12`、`--foreground`、標題坐在該組**上方**，讀者由標題往下讀該組。2026-08-01 資料來源面板的分組（UIA-099）用這個。
- 現況 B（有字的分隔線在下）：`.product-list__divider`（`ds-components/product-list.css`，2026-08-04 PIN-001）——`--fs-12`、`--muted-foreground`、線坐在釘選區**下方**、句子寫「以上釘選並顯示在商店最前」，右端常駐 `n/10` 計數。
- 為什麼 B 沒有直接沿用 A：這條線同時是**拖曳落點**（跨過它就改變釘選狀態，`.is-drop-target`／`.is-full` 兩個回饋態掛在它身上），它必須是「兩段之間的那條界線」而不是某一段的標題；而且第二段（未釘選的其餘商品）沒有名字可下標題——它就是「其餘」，硬給一個「其他商品」標題只是製造冗詞。
- 選項：**A** 兩處都改成群組標題在上（釘選區加一條「釘選」標題，落點提示另尋他法）；**B** 維持兩種並存，但寫清楚判準——「純分組用標題在上、界線本身可互動時用分隔線在下」；**C** 兩處都改成分隔線在下。
- 建議：B。這兩件事差在功能：A 的分組是唯讀資訊，B 的線是可以被拖過去的邊界。與其強行統一，不如把判準寫進 design-system.md Pillar 5，讓下一個要分段的人知道該挑哪一種。裁決權在使用者。

證據：`ds-components/source-status.css:99-106`（群組標題在上）、`ds-components/product-list.css`（`.product-list__divider` 段落，分隔線在下＋兩個拖曳回饋態）、`e-shop.html`（三個分頁各一條 `[data-eshop-pin-divider]`）。

### Q51：「買得到的最低粉絲分級」有兩種控制項（2026-08-04 提出，待裁決）

建立活動的票種規則新增「限粉絲分級」條件之後，同一個問題（誰買得到）在站上出現第二種控制項。

- 現況 A（既有，清單列）：階梯式 ⋮ 下拉——`.dropdown__menu--ladder` ＋ `.dropdown__item--choice`，每一級是一顆分級徽章＋該級累計人數，點任一級＝門檻設在那一級（`e-shop.html:345` 起，每列一份；元件見 `ds-components/dropdown-menu.css` 的 `--ladder` 段）。
- 現況 B（本輪新增，表單欄位）：原生 `<select class="select">` 四個選項（核心圈以上／超級粉絲以上／上榜粉絲以上／全部粉絲；第三級 2026-10-02 D349 定名「上榜粉絲」（D348 曾定「忠實粉絲」）），由 `js/zselect.js` 自動升級（`create-event.html` 的 `condHTML`）。
- 差異來自所在版面：A 坐在清單列上、要在一個很窄的格子裡同時給出「選了什麼」與「這樣有多少人買得到」；B 坐在表單裡，站上表單的 1-of-N 一律是 select。**B 少了 A 的人數資訊**——那正是幫創作者判斷門檻鬆緊的依據。
- 選項：**A** 表單也改用階梯下拉（要處理它在窄卡裡的寬度與 280px 票種卡內的可用性）；**B** 維持兩種，並在 design-system.md 寫明「清單列用階梯、表單用 select」的判準；**C** 兩邊都用 select，階梯下拉退場（會失去人數資訊，且推翻 2026-07-31 才落地的單擊門檻模型）。
- 建議：B——兩者的差異是版面決定的，不是隨意分岔；但 select 版少掉的人數資訊要不要補（例如選項後面掛「988 人」），值得一併裁決。

證據：`e-shop.html:345`（階梯下拉）、`ds-components/dropdown-menu.css` 的 `.dropdown__menu--ladder`、`create-event.html` 的 `condHTML`（select 版）。

### Q48：建立流程裡「可編輯卡」的收合態動作，站上出現兩種做法（2026-08-04 提出，待裁決）

建立活動的票種卡（`ds-components/ticket-tier-card.css`，2026-08-04 新建）落地時發現，站上已經有一種同角色的做法——「建立流程裡 JS 產生的可編輯卡清單，收合時要能編輯與刪除」。

- 現況 A（既有，套組／方案卡）：兩個 `.card__link` 文字連結「編輯」「移除」並排在卡片標題列右側（`js/bundle-editor.js:641-644`）。
- 現況 B（本輪新增，票種卡）：標題列右側只留 ⋮（`.dropdown` 選單，內含複製票種／移除票種），`Edit` 是**卡底的整寬鈕**（`.tier-card__edit`）（`create-event.html` 的 `tierCardHTML`）。〔**2026-08-04 同日更新**：原本 Edit 與 ⋮ 並排在標題列，當天依 Beamco Artist Portal v3 的票種卡版型（Figma `0gWC6dR1yzdEu0g1LqvRvJ` node 1904-82978）改成現在這樣——卡改窄之後標題列塞不下兩個控制項，而「改這張卡」是常做的事、值得整條可點的寬度。差異因此從「文字連結 vs 鈕＋選單」變成「標題列兩個文字連結 vs 卡底整寬鈕＋標題列 ⋮」，本題要裁決的事不變。〕
- B 不是自由選的：規格 5.1.6.1 F9.2 明寫「提供 Edit 進入編輯；右上 ⋮ 為該卡更多操作——複製票種／移除票種」，複製這個動作在 A 的兩個文字連結裡沒有位置。所以兩者的差異一部分來自需求（票種要複製、套組不用），一部分是純粹的呈現選擇（文字連結 vs 鈕＋選單）。
- 選項：**A** 兩者都改成 ⋮ 選單（動作多寡不同時版面不會走樣，套組卡的「編輯」仍留在外面）；**B** 兩者都改成文字連結，票種的複製擠進去或改放編輯態；**C** 維持現況，把判準寫成「動作 ≤ 2 用文字連結、≥ 3 用 ⋮」並記進 design-system.md。
- 建議：C——先把既有的兩種寫成一條可套用的判準，比強制統一便宜；真的要統一時再依判準挑一邊。裁決權在使用者。

證據：`js/bundle-editor.js:641-644`（文字連結版）、`ds-components/ticket-tier-card.css`（`.tier-card__actions`）、`documents/5.1.6.1-建立活動流程.md` F9.2。

### Q47：欄位末端的清空 ✕，站上只有票種卡有（2026-08-04 提出，待裁決）

票種卡依規格 5.1.6.1 F9.2「每欄末端 ✕ 可清空該欄」做了 `.tier-card__control` ＋ `.tier-card__clear`，這是站上第一個、也是目前唯一一個帶清空鈕的文字輸入欄——其餘所有 `.input` 都要使用者自己全選刪除。

- 現況 A（全站絕大多數）：裸 `.input`，沒有清空的可見入口。
- 現況 B（票種卡）：輸入框右端疊一顆 ✕，有值才出現（`ds-components/ticket-tier-card.css` 的 `.tier-card__control[data-empty="true"] .tier-card__clear`）。
- 這個差異來自規格對票種卡的逐欄描述（來源是截圖），不是站上先有的設計語彙。留著會變成「同一種文字欄位有兩種操作方式」，拔掉則違反規格明文。
- 選項：**A** 升級成 `field-system` 層的通用能力（任何 `.field` 都可 opt-in 清空鈕），與 Q36 的欄位級錯誤提示一起處理；**B** 維持只有票種卡有，並在 design-system.md 標明這是規格點名的例外；**C** 拔掉，回報上游規格這一項與站上輸入語彙不一致。
- 建議：B——先當成規格點名的局部例外，等出現第二個需求再升級成通用能力；現在就升級等於為單一消費者動 field-system。裁決權在使用者。

證據：`ds-components/ticket-tier-card.css`（`.tier-card__clear`）、`documents/5.1.6.1-建立活動流程.md` F9.2、`ds-components/input.css`（無任何清空 affordance）。

### Q45：預購的方案步驟沒有右軌，共創的兩個步驟都有（2026-08-03 提出，待裁決）

`create-project.html` 建立流程新增預購方案步驟（D166，規格 §5.3.2 F28／F29）後，同一種「填一組套組卡」的版面在共創與預購之間出現了差異：

- 現況 A（共創）：`data-panel="funding"`（`create-project.html:391`）與 `data-panel="tiers"`（`create-project.html:564`）兩個步驟都掛 `class="hidden wizard-split"`，各自有一支 `wizard-split__rail`（`#fd-overview`／`#bd-overview`）即時算出名額分帳、目標覆蓋率等摘要。
- 現況 B（預購）：`data-panel="tiers-pre"`（`create-project.html:661`）只掛 `class="hidden"`，沒有 `wizard-split`、沒有右軌——頁內註解明寫原因（`create-project.html:659-660`）：「共創的右軌算的是名額分帳與目標覆蓋率，兩者在預購都不存在，留一個永遠是『—』的側欄比沒有更糟」。
- 這個差異是**內容決定的**，不是遺漏——預購沒有分潤名額（`shares:false`）、沒有名額池可以分帳，右軌原本承載的兩個數字在預購語境下都不成立。但站在使用者角度，「共創兩步都是左右兩欄、預購這步忽然變成單欄滿版」仍是同一種步驟版面在流程中途切換，值得記錄以免之後被誤認成遺漏。
- 選項：**A** 維持現況（預購不裝右軌，單欄滿版）；**B** 預購步驟也套 `wizard-split`，右軌換成別的內容（例如方案數與下限的靜態說明，取代原本的即時算式），視覺對稱優先；**C** 共創的右軌也收起來，兩型統一單欄，右軌內容改成頁內摘要卡。
- 建議：A——右軌的價值在於「即時反映輸入」，預購沒有任何輸入會產生可即時計算的分帳或覆蓋率數字，硬裝一個右軌只是為了視覺對稱、內容不成立會比沒有更誤導。但版面在流程中途忽然收成單欄，是否需要在步驟切換時加一點視覺過渡或說明，裁決權在使用者。

證據：`create-project.html:391`（`funding` 面板 `wizard-split`）、`create-project.html:564`（`tiers` 面板 `wizard-split`）、`create-project.html:568`（`#bd-overview` 右軌）、`create-project.html:661`（`tiers-pre` 面板無 `wizard-split`）、`create-project.html:659-660`（頁內註解說明不裝右軌的理由）。

### Q43：IP 卡／IP hero 兩個顯示框仍是 3:4，不等於直式標準（2026-07-31 提出，2026-08-05 因 D176 改比例而縮小範圍，待裁決）

Q39 顯示端續作把清單縮圖與卡片封面收斂成單一直式 `--img-portrait` 之後，站上還留著「看起來也是直式、但比例數值不同」的顯示框，尚未被收斂觸及——它們是 Q30／Q31 分別裁決過的既有結論，本題不擅自覆蓋那兩則裁決，只記錄新標準出現後產生的不一致。

**2026-08-05 更新（D176 把標準由 0.806 改成 2:3 ≈ 0.667）**：原本三個互不相等的數字，現在少了一個——下方現況 B 的 `.pd-hero__cover` 本來就是 `2/3`，新標準採用 2:3 之後，它與標準值**數值上完全相等**，原先記在 (c) 的裁切落差自動消失。矛盾範圍因此從「三個數字」縮成「兩個」：3:4（現況 A）對上 2:3（標準）。

- 現況 A（`3/4` ＝ 0.75）：`.ip-hero__cover`（`shared.css:1234`，IP 詳情頁封面，Q31 裁決範圍）、`.ipm-card__cover`（`shared.css:1256`，IP Market 上架卡封面，Q30 裁決範圍）。**仍與標準不等**。
- 現況 B（`2/3`）：`.pd-hero__cover`（`shared.css:1364`，商品詳情頁 hero，GoFundMe 預覽 wireframe 版型，2026-07-24 起用於取代 `.ip-hero`）。**2026-08-05 起與標準等值**，但 CSS 仍寫死字面值 `2 / 3`、沒有讀 `--img-portrait`——目前長得一樣純屬巧合，下次再調標準就會無聲分岔。是否改讀 token 屬本題待裁決範圍，未經使用者確認不擅自改。
- 現況 C（`--img-portrait` ＝ `2 / 3`）：收斂的 7 支清單縮圖／卡片封面元件（見 `design-system.md` Pillar 4），以及全站上傳槽本身（Q39）。
- 待確認：(a) 現況 A 的兩支是否也該併入 `--img-portrait`，統一全站「直式顯示框」只剩一個數字；(b) 若維持獨立比例，是否需要在 design-system.md 明確標註「這兩支刻意不吃 Q39 標準」以避免之後又被誤認成待收斂的遺漏；(c) 現況 B 既然已與標準等值，是否直接改讀 `--img-portrait`，把「巧合相等」轉成「保證相等」。
- 本題僅記錄矛盾與證據，不選邊；裁決權在使用者。


### Q36：欄位級「超標」錯誤提示，站上只有 component-scoped 版本，沒有 DS 級通用版（2026-07-30 提出，待裁決）

套組編輯器這輪新增「填超過上限不默默截掉、hint 轉紅」的模式，落地時發現這其實是第二次做同一件事——站上已經有一個幾乎一樣的既有做法，兩者都是「疊在 `.field__hint` 上、超標時變 `--status-error`」，但各自是元件自己的 class，沒有共用的 DS 級修飾。

- 現況 A（既有）：`.fc-slotnote--over`（`ds-components/bundle-editor.css:221`，行號隨 2026-07-30 CSS 重排更新）——名額分帳超賣時的提示轉紅，2026-07-13 前後就存在。
- 現況 B（本輪新增）：`.field__hint.fc-hint--over`（`ds-components/bundle-editor.css:223-230`，行號隨 2026-07-30 CSS 重排更新）——套組優惠填超過可折抵上限時的提示轉紅，特意寫成 `.field__hint.fc-hint--over`（0,2,0 權重）才能疊過同檔案之後載入的 `field-system.css`。
- 兩者色值相同（都吃 `--status-error`），差別只在 class 命名與掛載對象（一個是獨立 `.fc-slotnote`、一個疊在通用 `.field__hint` 上），且都只存在於 `bundle-editor.css`，不是 field-system 本身的一部分。
- 選項與取捨：**A** 維持現況，兩者都是 component-scoped、不升級，未來每個元件自己需要就各刻一個（成本：往後每多一個「這格超標」場景就會重複同一段 CSS）；**B** 把 `.fc-hint--over` 升級成 field-system 層的通用修飾（例如 `.field__hint--error`，定義在 `field-system.css`），`bundle-editor.css` 兩個既有 class 都改吃它，之後任何欄位要表達「超過上限」都有現成答案（成本：要重新測試 field-system 的載入順序與既有消費者不受影響）；**C** 只統一命名、不搬家（兩個 class 改同名但仍留在 `bundle-editor.css`，不升級成 DS 級）。
- 建議：B——欄位級錯誤提示是任何表單都可能需要的通用需求，不應該是套組編輯器的專屬能力；但涉及 field-system.css 載入順序與既有 8 處以上消費頁，屬於需要使用者確認才動的範圍。
- **2026-08-04 追加第三份同構實作**：`.field__hint.tier-card__err`（`ds-components/ticket-tier-card.css`，票種卡的欄位級驗證訊息）用的是與現況 B 完全相同的配方——同樣疊在 `.field__hint` 上、同樣 `--status-error`、同樣寫成兩個 class 提高權重。本輪不擅自升級成 DS 級（那是本題要裁決的事），只登記證據：這已經是第三次為同一件事各刻一份 CSS，選項 B 的成本理由又多一個消費者。

### Q35：原價刪除線有兩種做法，字級不同（2026-07-30 提出，待裁決）

套組編輯器這輪為收合摘要列新增「有折扣時原價劃線」的視覺，落地時發現站上已經有同一個視覺角色的既有做法，兩者字級不同、各自獨立定義，沒有共用一個 token 或 class。

- 現況 A（既有）：`.cb-basestrike`（`create-bundle.html:56`、`bundle-detail.html:44`，兩處逐字重複定義）——`font-size: var(--fs-13); color: var(--muted-foreground); text-decoration: line-through;`。用於建立組合／組合細節頁的折後價格對照。
- 現況 B（本輪新增）：`.fc-sum__was`（`ds-components/bundle-editor.css:91-96`，行號隨 2026-07-30 CSS 重排更新）——`font-size: var(--fs-12); color: var(--muted-foreground); text-decoration: line-through; margin-right: var(--sp-6);`。用於套組編輯器收合摘要列的原價對照。
- 兩者角色完全相同（「劃掉的原價，緊接在折後價之前」），色階相同（`--muted-foreground`），差別只有字級（13 vs 12）與 B 多一個 `margin-right`（A 沒有這個需求是因為它在按鈕式的價格列裡、天生有間距）。`.cb-basestrike` 目前是**頁內複本**（同一段 CSS 在兩個頁面各自貼一份），不是共用元件層的一部分；`.fc-sum__was` 是本輪直接 promote 進 `ds-components/bundle-editor.css` 的元件層 class。
- 選項與取捨：**A** 統一成 13px（`.fc-sum__was` 改吃 `--fs-13`，理由是先出現、且已在兩頁使用）；**B** 統一成 12px（`.cb-basestrike` 改吃 `--fs-12`，理由是收合摘要列字級本來就比一般內文小一階，`.fc-sum__meta` 也是 `--fs-12`，跟着同列鄰居對齊比跟着別頁對齊更合理）；**C** 兩者維持現況不同字級，但把 `.cb-basestrike` 的頁內複本 promote 成共用元件（例如新增 `.price-strike` 或直接讓兩處都吃同一個 class 但保留字級參數化）。
- 建議：B——`.fc-sum__was` 所在的收合摘要列（`.fc-sum`）本身字級體系是 12px 起跳（`.fc-sum__meta`、`.fc-bundle__index` 皆 12px），劃線原價應該跟着同一列的其他文字對齊，而不是套用另一頁的字級；同時建議順手把 `.cb-basestrike` 的頁內重複定義 promote 進元件層，消掉兩處逐字複製的 CSS。裁決權在使用者，本輪暫不動這兩處既有 CSS，只記錄矛盾。
- **2026-09-21 追記**：組合包預覽卡（`ds-components/bundle-preview-card.css` 的 `.bpc__was`）與編輯器 footer 的 `.bd-foot-price__was`／收合列 `.bd-row__was` 又是同一個視覺角色；本輪新的 `.bpc__was` 刻意吃 `--fs-13`＝現況 A，不再開第三種字級，但站上「劃掉的原價」現在有 A（13）與 B（12）各兩處以上消費者，裁決後一次收攏。

### Q26：清單頁工作列的主軸分頁有兩種寫法（2026-07-26 提出，同日依使用者裁示落地）

四個清單頁的 `.list-toolbar` 主軸分頁都是同一個元件 `.tabs.tabs--underline-short`，但兩個修飾 class 只有 projects 有：

- `tabs--underline-label`（active 底線只等標籤寬、不含計數）
- `tabs--count-plain`（計數不用 pill、改 `--muted-foreground` 純文字）

結果 my-ip、events 有計數但底線會延伸到數字下方、計數還是深色藥丸，跟 projects 差一截；e-shop 沒有計數但底線寬度算法也不同。使用者：「所有頁面有這種設計的都要用一樣的元件……和電子商店的差別只在於沒有計數，其他都應該一樣。」

**裁決（A）**：`.list-toolbar` 裡的主軸分頁一律寫成
`class="tabs tabs--underline-short tabs--underline-label tabs--count-plain"`，四頁一致。e-shop 沒有計數，`--count-plain` 在那裡不影響外觀，仍照寫以保持同一組配方、之後要加計數也不必再改 class。

已落地：my-ip.html:54、events.html:119、e-shop.html:309 補上兩個修飾（projects 原本就有）。DS 文件（`ds-specs/4.15-tabs.md` 與 `design-system.html` 的 Tabs demo）已改寫成「這是 list-toolbar 的標準配方」，不再寫成「Projects 專用的 opt-in」。

**注意**：`tabs--underline-label` 需要標籤包在子元素裡。標籤是 `<button>` 直接文字的分頁（product-detail、admin-platform-fees）**不在此範圍**，維持整條 item 底線——那些不是 list-toolbar。

### Q25：次層篩選列有三份同構實作（2026-07-26 提出，待裁決）

同一個視覺角色「工作列下方那排狀態／類型篩選 pill」，站上有三個 class 名、樣式規則完全一樣（`display:flex; align-items:center; gap:12px; flex-wrap:wrap`）：

- `.list-status-row` — 共用元件，`ds-components/list-toolbar.css:74`；消費頁：projects、my-ip、e-shop、events
- `.ord-status-row` — 頁內複本，`orders.html:29`
- `.pk-status-row` — 頁內複本，`pickup.html:39`

2026-07-26 使用者要求「篩選列到清單的間距加大」時，共用元件改一處即涵蓋四頁，兩個頁內複本得各自再改一次（`.ord-list-controls`／`.pk-list-controls` 的 `margin-bottom`）——這就是分岔的成本。

- **A（建議）**：orders／pickup 改用 `.list-status-row`，刪掉兩份頁內複本與各自的外層 margin。需一併確認上排到篩選列的間距（元件是 `margin-top: --sp-16`，兩頁現在是 topbar 的 `margin-bottom: 8px`）。
- **B**：維持現狀，接受三處各改。

暫依現狀（B），本輪只同步了間距值。

### Q23：卡片邊界在建立流程出現兩種答案（2026-07-21 提出，已依使用者裁示落地，登記備查；**上層問題已於 2026-07-26 由 Q32 裁決 C 解決，全站統一陰影版**）

建立流程是左右兩欄並排，兩欄的盒子用了兩種邊界做法：

- 左欄 `form-section--outlined`：填色＋`--shadow-card`＋`--shadow-edge-top`、**無邊框**（Q14 去邊框、Q18 加陰影）。
- 右欄 `.preview-col` 內的 `.preview-card` 與 `.card`：填色＋**1px `--border`**、無陰影（Q3 卡片用邊框）。

兩者各自都合規，機械檢查抓不到，但並排時一眼看得出不一致（使用者 2026-07-21 指出「上架設定的外框不應該有線，和左邊的 section 一致」）。

**處置**：已把 `.preview-col` 內的卡對齊左欄（`border:0` ＋ 同一組陰影），scope 限預覽欄，全站其他 `.card` 維持 Q3 不動。實際受影響＝**4 頁共 7 個盒子**：create-product／create-bundle／create-auction 各 2（預覽卡＋上架設定卡）、create-campaign 1（僅預覽卡，該頁預覽欄沒有第二張卡）。

**留待裁決的是更上層的問題**：Q3（卡片＝邊框）與 Q14／Q18（區塊卡＝陰影無邊框）本質上是同一個視覺角色的兩種答案，目前靠「哪個元件」而非「什麼角色」區分，所以每次有新的並排情境就要再開一次例外（這已經是第二次）。選項：**A** 維持現況（逐案 scope，累積例外）；**B** 定義判準——「內容容器用陰影無邊框、資料列表容器用邊框」之類，寫進 design-system.md 讓後續有規則可循；**C** 全站統一成一種。裁決權在使用者。

### Q22：收合式 radio-list 的圓角，與 Q16「控制項維持 6px」相衝（2026-07-21 提出，待裁決）

Figma node 856-22782 把上架設定畫成收合式：外框 1px 邊、圓角 18，內部觸發列與選項列的圓角也跟著放大到 18（見展開態 hover 在「立刻上架」那列的角度）。站上既有規則是 Q16——卡片／面板級放大到 16（`--radius-xl`），**控制項（button／input／badge／segmented／field-pill）與清單列維持 6**。radio-list 的列在角色上比較接近「清單列」，照 Q16 應該留 6。

- 證據 A（Figma）：外框與列皆 18，收合式整體讀起來像一張小卡片而非一排控制項。
- 證據 B（Q16 裁決）：`STYLE-DECISIONS.md:29`，控制項與清單列明列為「維持 6px」。
- 現況：`ds-components/radio-list.css` 的 `.radio-list--collapsible` 外框與內部列都取 `--radius-xl`(16)，**暫依 Figma**，標 Q22。

選項：**A** 維持現況（外框與列都 16，把「收合式選擇器」視為卡片級容器，等於為 Q16 開一個具名例外）；**B** 外框 16、內部列回 6（容器是卡片、列還是控制項）；**C** 整組回 6（嚴格守 Q16，與 Figma 有落差）。裁決權在使用者。

**2026-07-21 追加證據，方向偏向 A**：使用者當日另外指名「多規格選項列的圓角都要再大一點」，該組列（`.option-set__row`／`.option-set__add`／`.variant-option`，含優先權較高的 `.option-set .variant-option`）因此由 6 放大到 `--radius-xl`(16)；同日新增的 `.control-group`（開關＋揭示表單的外框）也取 16。也就是說「表單內的成組列」這個角色，使用者連續三次都選了大圓角。若最終裁 A，Q16 的「控制項／清單列維持 6px」需改寫成「**單獨的控制項**維持 6px；**成組的設定列**（收合式選擇器、選項列、control-group）用 16」，並把判準寫進 design-system.md，而不是留成一串個案例外。

**2026-09-04 追加：`control-row` 併入 A 的範圍，並留下一個新問題。** 使用者看建立商品的上架設定時裁示「圓角沒有照 DS」——現場是 `.control-group`（24）與單獨的 `.control-row`（10）並排。`.control-row` 已改吃 `--radius-xl`，與 `control-group` 同值；兩者是同一個角色（表單裡成組的設定列），只差有沒有揭示區。同輪 `.lctl__derived` 由填色的 `.card--muted`（16）改成線框的 `.control-group--plain`（24），所以建立流程裡的盒子現在只剩兩級：頁面層的 `form-section--outlined`（24）與它裡面的設定盒（24）。

**新問題（待裁決）**：巢狀盒子要不要降一階圓角？`.card--muted`（卡中卡）用的是 `--radius-lg`(16)，理由是「比母卡小一階才看得出是裡面那一層」；現在設定盒與母卡同為 24。選項：**A** 維持同值（層級交給邊框與內距表達，現行做法）；**B** 巢狀一律降一階（設定盒改 16，`card--muted` 那條規則因此有了通則）。裁決權在使用者。

### Q17：1-of-N 選擇器的分工（2026-07-17 提出，待裁決）

站上互斥單選（1-of-N）現有三支元件，各自合 token、機械檢查抓不到分岔，但概念上都是「從幾個選項挑一個」：

- **selection-card**（`ds-components/selection-card.css`）：grid 大卡，title＋sub（＋可選 icon／swatch），已選＝橘 outline。用於顯眼的主選擇（商品型別、組合 edition、主題）。證據：`create-auction.html` 種類卡。
- **radio-card**（`ds-components/radio-card.css`）：2-up 並排卡，建在 segmented 上，已選＝橘點。用於表單內二選一（單一/多規格、不限量/限量、取貨方式）。證據：`create-product.html` variant/edition/delivery。
- **radio-list**（`ds-components/radio-list.css`，2026-07-17 新增）：垂直輕量列，radio 點＋標題＋可選描述，已選＝填橘點、無卡框。用於窄欄的資料選擇（上架設定）。**2026-07-24 使用者指定建立專案的專案類型對齊深色直列選單，新增 `--menu` 圖示面板變體；仍是資料選擇，不擴及 access／發布等其他卡式選項。**證據：三創建頁預覽欄＋兩細節頁＋create-project 專案類型。

選項：**A** 維持三支、把「何時用哪支」寫成 design-system.md 的明確分工表（依版面：grid 大卡／2-up 並排／vertical 窄欄）；**B** 收斂成兩支（e.g. 卡式一支＋列式一支）；**C** 全部收斂成單一可配置元件。暫依 **A**（三支分工並存，現行做法），標 Q17；裁決權在使用者。

### 維度 1：圓角尺度

#### Q1　「膠囊型」元件的圓角形狀要不要統一

現況 A（全圓 pill，`--radius-pill` / `9999px`）：
- `ds-components/chip.css:36` `.chip`
- `ds-components/filter-tabs.css` `.filter-tabs__item`、`.filter-tabs__count`
- `ds-components/badge.css:79` `.ztor-dot`

現況 B（小圓角矩形，`--radius` 6px 或 `--radius-md` 7px，**但命名或視覺語意都在暗示「pill」**）：
- `ds-components/field-pill.css:28` `.field-pill`——名稱帶「pill」，實際是 `--radius-md` 矩形，不是全圓
- `ds-components/badge.css:24` `.ztor-metric-pill`——名稱帶「pill」，實際是 `--radius-md` 矩形
- `ds-components/badge.css:44` `.ztor-badge`、`ds-components/badge.css:105` `.badge`（狀態徽章）

選項：
- A　凡是「pill」命名／膠囊A視覺一律全圓（field-pill、metric-pill 改 `--radius-pill`）
- B　徽章類統一維持小圓角矩形，只有 chip／filter-tabs 這種「可點選篩選」用全圓，兩者用形狀區分「可篩選 vs 純顯示」（需要在 design-system.md 明文寫下這條規則，否則新元件還會選錯）
- C　混用有理由，維持現況，僅補文件說明

#### Q2　控制項圓角級距只差 1px，要不要收斂成同一階

現況：token 註解本身就寫了兩階並存（`ds-components/_tokens.css:91-92`：`--radius` 6px 給「primary buttons」、`--radius-md` 7px 給「outline buttons, cards」），但實際套用時同一元件家族內部也在混：
- `ds-components/button.css:26` `.ztor-btn`（primary）＝`--radius`(6px)；`ds-components/button.css:64` `.ztor-btn--outline`＝`--radius-md`(7px)；`ds-components/button.css:121` `.btn`（product-density primary）＝`--radius`；`ds-components/button.css:146` `.btn--outline`＝`--radius-md`；`ds-components/button.css:189` `.btn--icon`＝`--radius`
- `ds-components/input.css:14` `.input/.textarea/.select`＝`--radius`(6px)
- `ds-components/card.css:15` `.ztor-card`、`ds-components/card.css:83` `.card`（實際頁面用的版本）都是`--radius-md`(7px)
- 另外 `ds-components/button.css:204` `.btn--icon-circle` 圓角是寫死 `9999px`，沒有走 `var(--radius-pill)` token

選項：
- A　維持兩階（primary 按鈕/輸入框 6px，outline 按鈕/卡片 7px），只把 `.btn--icon-circle` 的裸值 9999px 改成 `var(--radius-pill)`
- B　全部收斂成同一階（6px 或 7px 擇一），不再分「按鈕用哪階、卡片用哪階」
- C　混用有理由（例如視覺上刻意做細微差異），維持現況並在 design-system.md 明文列出「哪個元件用哪一階」的對照表

### 維度 2：邊界做法

#### Q3　卡片類元件：純陰影 vs 純邊框，要不要統一

現況 A（純陰影，`box-shadow: var(--shadow-card)`，陰影本身內含 1px rim，完全不寫 `border`）：
- `ds-components/card.css:11-16` `.ztor-card`、`ds-components/card.css:81-86` `.card`
- `ds-components/kpi.css:16-23` `.kpi`
- `ds-components/selection-card.css` `.selection-card`

現況 B（純 1px 實線 border，完全不寫 `box-shadow`）：
- `ds-components/preview-card.css:17-22` `.preview-card`
- `ds-components/event-preview-card.css:26-31` `.event-preview-card`

選項：
- A　統一走「純陰影」（preview-card / event-preview-card 補上 `--shadow-card`、拿掉 border）
- B　統一走「純邊框」（card / kpi / selection-card 改成 1px border，拿掉陰影）
- C　混用有理由——例如「主畫面卡片用陰影表達可點擊浮起、建立流程的即時預覽卡刻意做得更平面像實體卡」——維持現況但寫進 design-system.md

#### Q4　控制項／浮層邊界：真 border vs 用陰影模擬 border，要不要統一

現況 A（真 `border: 1px solid var(--border)`）：
- `ds-components/chip.css:35` `.chip`、`ds-components/field-pill.css:27` `.field-pill`
- `ds-components/button.css:63` `.ztor-btn--outline`、`ds-components/button.css:144` `.btn--outline`
- `ds-components/dropdown-menu.css:35` `.dropdown__menu`、`ds-components/embed-modal.css:34` `.embed-modal__sheet`、`ds-components/leave-dialog.css:19` `.leave-dialog__card`

現況 B（`box-shadow: 0 0 0 1px var(--border)` 模擬邊框，不寫 `border`）：
- `ds-components/input.css:15-17` `.input/.textarea/.select`
- `ds-components/badge.css:22-25` `.ztor-metric-pill`
- `ds-components/switch.css:25-27`

**關鍵佐證**：`ds-components/button.css:54-59` 的註解明確記載——outline 按鈕在 2026-06-12 已經**從**「陰影模擬邊框」**改回**「真 border」，理由是「白填色按鈕在白底上近乎隱形（使用者反饋）」。這條理由對 input（同樣白底 `--card` 背景 + 陰影模擬邊框）同樣成立，但 input.css 一直沒跟進改版。

選項：
- A　全面改回真 border（跟按鈕當年的決定一致），input／metric-pill／switch 也改成 `border: 1px solid var(--border)`
- B　維持陰影模擬邊框（理由：陰影版可以疊 focus 環時不跳動、不佔版面尺寸），outline 按鈕才是例外
- C　混用有理由（例如「可獲得焦點的表單控件」統一用陰影版方便疊 focus ring，「純展示/觸發用」pill 用真 border），維持現況並明文化

### 維度 3：陰影語言（hover 浮起規則）

#### Q5　哪些「卡片型／列型」元件在 hover 要浮起（借用 `--shadow-float`），哪些不用

現況 A（有 hover 浮起）：
- `ds-components/card.css:22-25` `.ztor-card--clickable:hover`（transform -2px + `--shadow-card-hover`）
- `ds-components/selection-card.css:50` `.selection-card:hover`（`--shadow-card-hover`）

現況 B（同屬「可點卡片」，但 hover 完全沒有陰影變化，只有列表行用背景色代替，或什麼都沒有）：
- `ds-components/preview-card.css`、`ds-components/event-preview-card.css`：整檔沒有任何 `:hover` 規則
- `ds-components/kpi.css`：`.kpi` 本體沒有 hover 效果，只有內部的 `.kpi__link:hover`（`ds-components/kpi.css:61`）換文字色
- `ds-components/product-list.css:40-42` `.product-list__row:hover`、`ds-components/project-list.css:40-42` `.project-list__row:hover`：都是背景換成 `var(--muted)`，不是陰影浮起

選項：
- A　「可點擊卡片」一律 hover 浮起（借 `--shadow-float`），列表行維持背景色 hover（列表行本來就不该模仿卡片浮起）——需要先定義「什麼算卡片、什麼算列」
- B　只有真正會導覽到別頁的卡片才浮起，純預覽/展示用卡片（preview-card、kpi）不需要 hover 回饋
- C　混用有理由，維持現況並在 design-system.md 逐一標註每個元件的 hover 規則

### 維度 4：密度

#### Q6　表單欄位垂直節奏：`.field` 基礎值 vs `.form-section` 內覆寫值，要不要統一

現況：
- `ds-components/field-system.css:6-7` 基礎 `.field { gap: var(--sp-6); margin-bottom: var(--sp-16); }`（描述↔控件 6px、欄位↔欄位 16px）
- `ds-components/form-section.css:25` `.form-section .field { gap: var(--sp-4); margin-bottom: 26px; }`（描述↔控件 4px、欄位↔欄位 26px）——且 `26px` 是寫死的字面值，不在 `--sp-*` 刻度表內（最近的刻度是 24 或 28）

選項：
- A　建立流程（`.form-section` 作用域）維持比一般表單更緊的描述間距、但欄位↔欄位間距改採 `--sp-24` 或 `--sp-28`（收進刻度表），不再用裸值 26
- B　全站表單欄位垂直節奏收斂成同一組數值，`.form-section` 不再局部覆寫
- C　混用有理由（建立流程需要更寬鬆的段落感、一般表單需要更緊湊），維持現況，但把 26px 換成刻度內最近值

#### Q7　卡片類元件的內距（padding）沒有統一的級距表

現況（同屬「卡片/資訊磚」但內距各自為政）：
- `ds-components/kpi.css:20` `.kpi` → `var(--sp-16) var(--sp-18)`（16/18）
- `ds-components/card.css:85` `.card`（實際頁面用的版本）→ `var(--sp-20)`（20，四邊等值）
- `ds-components/card.css:11` `.ztor-card`（design-system 文件示範用，頁面不直接用）→ `var(--sp-24)`（24，四邊等值）
- `ds-components/selection-card.css:38` `.selection-card` → `var(--sp-14) var(--sp-16)`（14/16）
- `ds-components/empty-card.css:24` `.empty-card` → `var(--sp-32) var(--sp-24)`（32/24）

選項：
- A　定一組「卡片內距級距表」（例如 sm=16、md=20、lg=24），上述元件對號入座
- B　維持各自的內距（理由：KPI 磚要緊湊、empty-card 要留白突出插畫感），但把現況整理成一張對照表寫進 design-system.md，避免未來新卡片再隨機挑數字
- C　全部統一成單一內距值

### 維度 5：品牌橘使用範圍

#### Q8　「已選中/active」狀態要不要一律用品牌橘標示

> **2026-07-27：已裁決 A（反轉 2026-07-13 的 B），詳見上方「已裁決」表 Q8 列。以下現況快照停留在 2026-07-13，僅供對照當時的分歧，不再反映站上實況。**
> 反轉後「現況 B」那一組（`.app-sidebar__link`／`.app-sidebar__sub-link`／`.chip--active`／`.segmented__btn--active`／預設 `.filter-tabs__item--active`）已全部併入 A。

現況 A（active 用品牌橘）：
- `ds-components/tabs.css:39-42` `.tabs__item--active`（橘色底線）；`ds-components/tabs.css:76` `.tabs--brand .tabs__item--active`（橘色調底）；`ds-components/tabs.css:97` `.tabs--underline-short .tabs__item--active`（橘色短底線）
- `ds-components/settings.css:31-35` `.settings-nav__item--active`（品牌橘 18% 底 tint）
- `ds-components/selection-card.css` `.selection-card--active`（橘色 outline 線框）
- `ds-components/radio-card.css` 已選態（橘色 outline）

現況 B（同樣是「導覽列表/切換控制的已選項」，但用中性黑或灰，完全不用橘色）：
- `shared.css:154` `.app-sidebar__link--active`、`shared.css:188` `.app-sidebar__sub-link[aria-current="page"]` → `background: var(--sidebar-active)`（中性灰 `#ECECEC`，不是橘）
- `ds-components/chip.css:44-48` `.chip--active` → 反白成 `var(--foreground)`（黑底白字），不是橘
- `ds-components/segmented.css:41-47` `.segmented__btn--active` → 白色浮起 pill + 中性邊框，不是橘
- `ds-components/filter-tabs.css` 預設 `.filter-tabs__item--active` → 灰底（`var(--muted)`），只有加 `.filter-tabs--brand` 修飾類才會變橘（頁面各自決定要不要加）

值得注意：**同樣是「側邊導覽列表的已選項」，全站主 `.app-sidebar`（左側大導覽）用中性灰，但 Settings 頁自己的次層導覽 `.settings-nav`（`ds-components/settings.css:31`）卻用品牌橘**——同一種元件角色（左側可捲動的頁內導覽列表）两处给了不同答案。

選項：
- A　「已選中」狀態全站統一用品牌橘（sidebar-active、chip--active、segmented--active 都改橘）
- B　橘色只保留給「主要操作／主要分類」（Tabs、選擇卡的已選），導覽列表／篩選類的已選一律中性色（`.settings-nav--active` 改回中性灰，向 `.app-sidebar` 看齊）
- C　混用有理由（例如「橘色只用在會直接影響資料的操作上，導覽本身不用橘避免與 CTA 搶視覺」），維持現況並在 design-system.md 寫清楚這條分野規則，`.filter-tabs--brand` 這種「選用变体」也要註明哪些頁該用

### 維度 6：灰階層次

#### Q9　「hover 底色」該用哪一個灰階 token

現況：`--muted`(`#FAFAFA`)、`--accent`(`#F3F3F3`)、`--secondary`(`#F4F4F4`) 三個十分接近的近白灰階同時存在（`ds-components/_tokens.css:33-37`），但實際 hover 底色沒有統一套用同一個：
- 多數 hover 用 `var(--muted)`：如 `ds-components/button.css:148` `.btn--outline:hover`、`ds-components/chip.css:42` `.chip:hover`、`shared.css:249` `.app-notif__item:hover`
- 少數 hover 用 `var(--accent)`：`shared.css:152/187/202`（`.app-sidebar__link/__sub-link/__action:hover`）、`ds-components/switch.css:25`、`ds-components/amount-field.css:38`
- 另有元件不用上述兩者、改用即席算出的灰：`ds-components/settings.css:27-29` `.settings-nav__item:hover` 用 `color-mix(in srgb, var(--foreground) 4%, transparent)`；`ds-components/button.css:155` `.btn--ghost:hover` 用 `color-mix(in srgb, var(--foreground) 6%, transparent)`
- `--secondary` 目前**全站零使用**（`ds-components/*.css`、`shared.css`、`*.html` 皆搜不到 `var(--secondary)`），是已定義但未落地的 token

選項：
- A　hover 底色統一用 `--muted`，`--accent` 只保留給「選單項目/導覽 hover」這種更明確的語意角色（sidebar 系列維持用 accent），其餘 `color-mix` 即席寫法都改成引用固定 token
- B　三個 token 語意本來就不同（muted=次級底、accent=互動 hover、secondary=次要按鈕底），維持分工，但要把 `--secondary` 找到實際用途或退役，並把散落的 `color-mix(...)` 即席寫法收斂成引用 `--accent`
- C　直接退役掉其中一個 token（例如 `--secondary`），只留兩階

### 維度 7：icon

#### Q10　「關閉/收合(X)」類功能性小 icon 尺寸沒有統一

現況（同屬「浮層右上角關閉鍵」角色，三種尺寸並存）：
- `ds-components/alert.css:95` `.alert--card .alert__close .ztor-icon` → 20×20px
- `ds-components/leave-dialog.css:29` `.leave-dialog__close .ztor-icon` → 18×18px
- `ds-components/embed-modal.css:72` `.embed-modal__close .ztor-icon` → 16×16px

（基礎 icon 尺度本身有定義：`ds-components/icon.css` 預設 `.ztor-icon` 16px、`.ztor-icon--sm` 14px；但各元件大量各自覆寫成 11–44px 不等，多數是因應圖示型 icon〔如 34/44px 的媒體佔位圖示〕或極小的行內裝飾〔11px 移除鍵〕，屬合理依情境縮放，不算衝突——只有「關閉鍵」這個重複出現的同角色給了三種答案，值得出題。）

選項：
- A　收斂成 1 種（例如都用 18px，介於現有三值中間）
- B　依浮層尺寸分兩階（大型浮層/alert 用 20px，小型 modal/dialog 用 16px），寫進 design-system.md 的對照表
- C　混用有理由，維持現況

### 維度 8：狀態色語意

#### Q11　「已付款 Paid」狀態在不同頁用了不同顏色

現況：同一個「訂單已付款」語意，在收益頁用綠色（success），在訂單頁用灰色（neutral）：
- `earnings.html:382 / 406 / 810 / 823 / 849` → `class="badge badge--success"` 顯示 `Paid`
- `orders.html:109 / 121 / 145` → `class="badge badge--neutral"` 顯示 `Paid`（`data-i18n="orders.pay.paid"`）
- `order-detail.html:57` → `class="badge badge--neutral"` 顯示 `Paid`（`data-i18n="od.badge.paid"`）

（對照組：`Shipped`/已出貨 在 `orders.html:133/145` 都一致用 `badge--neutral`，沒有分歧；`Sold Out`/售罄 在 `e-shop.html:471` 有明確註解記載「刻意用 neutral 灰、與 Low Stock 的紅區隔」，屬已決策、不必出題。「Paid」是目前唯一發現的顏色分歧。）

選項：
- A　「已付款」全站統一用綠色 success（訂單頁的 `orders.pay.paid`、`od.badge.paid` 改成 `badge--success`）
- B　全站統一用中性灰 neutral（收益頁的 `Paid` 改回 `badge--neutral`），因為 orders.html 用 `status-axes` 把「物流狀態」和「付款狀態」分兩軸並列，付款軸本來就刻意做得比物流軸安靜，避免視覺過重
- C　混用有理由（收益頁的 Paid 是「這筆錢已入帳」的正向強調，訂單頁的 Paid 只是眾多資訊軸之一、要安靜），維持現況並明文化這條分野

### 維度 9：字級與字重（label 樣式）

#### Q12　欄位/列標籤：大寫小標 vs 一般 label，同頁同角色卻給了不同答案

現況：`tier-settings.html` 同一頁面內，「欄位名稱標籤」這個角色出現兩種樣式：
- `tier-settings.html:44-51`（頁內 `<style>` 自訂的 `.gate-field__label`）→ 12px、**大寫（`text-transform: uppercase`）**、字距 0.3px，用在「Top %」「Min. loyalty points」「Early access (days)」「Merch discount (%)」等欄位名稱
- `ds-components/settings.css:67-71`（DS 元件 `.settings-row__label`）→ 13px、**一般大小寫**、無字距特調，用在同頁的「Purchases」「Event check-ins」「Dual-gate upgrade」「Versioned, non-retroactive」等列標籤

兩者都是「說明這一列/這一欄是什麼」的標籤角色，只因為 Gates／Benefits 區塊用了頁面自訂 class、Multipliers／Rules 區塊用了 DS 元件，就長得不一樣。

（對照組：站上其他「小型全大寫標籤」——`ds-components/kpi.css:26-30` `.kpi__label`、`shared.css:1012` `.meta-cell__label`、`shared.css:1081` `.insight-eyebrow`、`ds-components/status-axes.css:34-38`、`ds-components/progress-stepper.css:40-44`——彼此字級/字距高度一致〔11-12px、大寫、0.4px 上下字距〕，屬於已經一致的「頁面級小標」系統，`tier-settings.html` 的 `.gate-field__label` 其實是這套系統的又一次重複發明，只是恰好和它同頁的 `.settings-row__label` 不是同一套。）

選項：
- A　`tier-settings.html` 的 `.gate-field__label` 退役，改用 `.settings-row__label`（一般大小寫），欄位名稱樣式跟頁面其他列標籤一致
- B　`.settings-row__label` 也改成大寫小標風格，向站上已經一致的那套「大寫小標系統」看齊，`.gate-field__label` 直接 promote 成 DS 元件供其他頁引用
- C　兩種角色其實不同（`.gate-field__label` 是「單一數字輸入框正上方的緊湊說明」，`.settings-row__label` 是「一整列的標題」），維持現況但把 `.gate-field__label` promote 進 `ds-components/`（目前是頁內孤例，不符合「可重用樣式要 promote」的專案規則）

### 已一致：不出題的部分

- **狀態色的「售罄 vs 低庫存」**：`e-shop.html:471` 已有明確設計決策註解，售罄故意用中性灰、低庫存用紅，不衝突。
- **「已出貨 Shipped」的顏色**：`orders.html` 全站一致用 `badge--neutral`。
- **頁面級小型全大寫標籤系統**（kpi__label / meta-cell__label / insight-eyebrow / status-axes / progress-stepper__label）：字級（11-12px）、字距（約 0.4px 或 .04-.05em）、大寫處理彼此一致，是目前少數已經成熟的子系統（唯一的例外已寫進 Q12）。
- **Icon 基礎尺度**（`ds-components/icon.css`：預設 16px、`--sm` 14px）本身定義清楚；元件各自覆寫到 11–44px 多數對應到「裝飾用大圖示」或「行內極小裝飾」等不同情境，屬合理縮放，只有「關閉鍵」这个重複角色值得出題（見 Q10）。

### 暗色版落差清單

使用者自述「黑夜版比白天少微調」，以下是逐一核對 `ds-components/_tokens.css` 亮／暗兩區塊後，亮色有調、暗色沒跟著調或明顯只是複製貼上的落差，供日後校正（非單選題）：

> **2026-07-13 更新（taste 體檢後使用者指示校準暗色）**：下列 **1（--gradient-brand）、2（--overlay-tint）、3（綠色方向）已處理**——暗色綠 `#00A63E→#4ADE80` 提亮、補暗色 `--overlay-tint: rgba(0,0,0,.6)` 與 `--gradient-brand`（去掉淡膚起點）。4、5 屬刻意/已確認非疏漏，不動。詳見 UI-CHANGES.md 2026-07-13「風格微調」條目。

1. **`--gradient-brand`**（`_tokens.css:81`，進度條品牌漸層 `linear-gradient(90deg, #ffd9a0 0%, #ffa33f 55%, #ff7a4d 100%)`）——暗色區塊（`_tokens.css:390-490`）完全沒有覆寫。漸層起點 `#ffd9a0` 是淺膚橘色，直接套在深色 `#191A1A` 畫布上是否還讀得出漸層層次，沒有被檢視過。
2. **`--overlay-tint`**（`_tokens.css:198`，浮層背後的黑色遮罩 `rgba(0, 0, 0, 0.45)`）——暗色區塊沒有覆寫，黑底上再疊一層 45% 黑遮罩，和淺色模式「白底上疊黑遮罩」的視覺效果不對等，暗色模式的遮罩存在感會弱很多，可能需要改用更淺的遮罩色或调整 alpha。
3. **`--status-success` / `--chart-3`（綠色）方向不一致**——其餘品牌色從亮到暗都是「變亮」以維持深底對比（`--chart-2` 藍 `#266DF0→#5896F3`、`--chart-5`/`--status-accent` 紫 `#8B5CF6→#A78BFA`），唯獨綠色是「變暗」（`#22C55E→#00A63E`，`_tokens.css:57` vs `:426`／`:84` vs `:451`），與其他狀態色的調色方向相反，較可能是沿用亮色模式數值時漏調、而非刻意設計。
4. **`--ring`／`--border-inverse`**：這兩個亮暗同值是刻意決定（`_tokens.css:52`、`:421` 均有註解說明），不是落差，僅記錄以免誤判。
5. **`--destructive`**：亮 `#DA314A` → 暗 `#E7000B`（`_tokens.css:46` vs `:415`）——两值明显不同，屬已調整，附註以確認非疏漏。

---

## 裁決流程

1. 發現矛盾 → 記入本檔「待裁決」，附證據檔:行號、A/B/C 選項。
2. 使用者裁決 → 選定選項。
3. 移入「已裁決」表：填編號、角色/題目、裁決、日期、理由、執行狀態（初始為「待執行」）。
4. 執行 → 全庫同步實作（依裁決結果改 CSS/元件/token），並在 `UI-CHANGES.md` 記錄；執行完成後把「已裁決」表的執行狀態更新為「已執行」。
5. 巡檢時盤點「已裁決」表的執行狀態，找出裁決後仍停留在「待執行」的項目，追蹤補做。

> **2026-10-12 · 文案重述例外（check_ds_sync 檢查 12 基準 12→14）**：建立活動與活動詳情的場次欄位，跨日開啟時標籤用「活動開始日期」「活動結束日期」（`ce.sess.startdate`／`ce.sess.enddate`）。這是使用者 2026-10-12 指定的用詞（「跨日：活動開始日期 開始時間, 活動結束日期 結束時間」），與未開跨日時的「活動日期」對稱，刻意保留「活動」二字；`ds-baseline.json` 的 `r2_label_restates_module` 同步調為 14。
