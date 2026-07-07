# Ztor Creator Studio · R 2.1 · UI-CHANGES

> 嚴格分區：**A** spec-derived 新增 · **B** 反饋導入 · **C** 撤除（intentional removal）· **D** infra / 文件。Bug 修正不寫。
>
> 每筆紀錄日期 + 範圍 + 動機（為什麼這樣設計）。R 2.1 是從零搭起，所以首筆紀錄包山包海；之後的調整一筆一筆來。

---
>
> **排序慣例（2026-07-02 起）**：新條目一律加在**最上方**（新→舊）。更早的紀錄（2026-05-25 ～ 2026-06-24）已移至 [UI-CHANGES-archive.md](UI-CHANGES-archive.md)。

## 2026-07-07 · 陰影系統化：E0–E4 海拔階梯（B 反饋導入・全站 token 層）

使用者裁示風格方向：扁平為底、用柔和陰影做浮起分層，並要求把它變成統一系統。陰影收斂為五階海拔（elevation）階梯，每階綁定固定用途：

- **階梯**：E0 貼底（`--shadow-hairline`，邊緣非浮起）／E1 微浮（`--shadow-raise`，按鈕輸入框）／E2 卡片（`--shadow-card`，card·清單容器·KPI·sticky 工作列）／E3 懸浮（**新 `--shadow-float`**：下拉、popover、tooltip、拖曳列）／E4 覆蓋（**新 `--shadow-overlay`**：modal、對話框）。
- **規則**：一元件一階；互動借上一階（`--shadow-card-hover` 改為 float 別名，card hover＝升到 E3）；同層分隔永遠不用陰影（用 hairline／surface 色階）；越高位移暈開越大、濃度收斂（柔和、保扁平感）；深色模式成對定義（提高 alpha＋亮色內框）。
- **遷移**：`--shadow-popover` 淘汰——下拉（dropdown-menu、header 帳號選單）、chart tooltip、`.tip__bubble`、cookie banner、拖曳列、readiness popover、建立頁自動完成/就緒 popover 改 `--shadow-float`；modal 家族（payout-dialog、embed-modal、leave-dialog）改 `--shadow-overlay`；低庫存 sticky 條裸值陰影改 `--shadow-header`（邊緣工具）。
- **DS 同步**：design-system.html §1.5 改為階梯表＋五階視覺 demo、§2.5 對照更新；design-system.md token 表／Elevation 表／dark 差異表／payout·dropdown·cookie 條目同步。BUILD-SPEC 補決策紀錄。
- 動機：原本下拉、卡片、modal 全共用 `--shadow-card`，「誰浮在誰上面」無法表達；`--shadow-popover` 強度與命名顛倒。階梯化後層級語意固定、新元件先選階再實作。

## 2026-07-06 · 電子商店 UI 優化第一輪：demo 資料在地化＋縮圖分類 icon＋表頭一致（B 反饋導入）

使用者裁示優化 r2.1 UI、先做電子商店頁。本輪處理內容品質與一致性五項：

- **填充列全面在地化**（e-shop.html `fillDemoProducts`）：原 22 列填充商品分類/庫存是英文（「Accessories」「12 left」）且名稱與分類錯配（Beanie→Books）、價格庫存為等差數列。改為逐件指定——繁中分類（§7.1 葉節點：配件/服飾/書籍/居家生活/海報與印刷）、合理價格與自然變化庫存、每件補中文 meta 描述（「毛帽 · 均碼」）、庫存格式統一「剩 N 件」。
- **競標分類改單語**：`cp.acat.*` 七鍵由雙語並列（「服飾 · Clothing」）改單語（D108 固定繁中後與商品/組合分頁一致；該組鍵現僅 e-shop 競標分頁使用）。
- **表頭「商品圖片」欄改空白**：三分頁表頭的 Image 欄改 `aria-label`（與訂單管理/取貨管理縮圖欄一致）；移除 `e-shop.col.image` 鍵。
- **縮圖占位改分類 icon**：原每列灰字「ztor.」文字 mark 看似圖片壞掉，改為分類 icon（書籍→book-open、服飾→shirt、音樂專輯→disc、收藏品→gem、配件→tag、居家生活→house、海報與印刷→image、草稿→package）；`product-list.css` 新增占位 icon 樣式（20px、`--foreground-subtle`），icons.js 補 shirt/book-open/disc/gem/house 五顆；「ztor.」mark 保留為通用變體（DS demo 並陳兩種）。
- **DS 同步**：design-system.html `--eshop` demo 列改示範 icon 占位＋說明；design-system.md placeholder 條目補 icon 對照表。

## 2026-07-06 · 場次詳情「名單／核銷紀錄」改分頁切換（A spec-derived · D123）

使用者裁示：取貨場次詳情把「取貨與入場名單」與「核銷紀錄」合併成同一區塊的分頁切換，名單為預設分頁、核銷紀錄放最後。規格 5.1.5.15 改寫成三個 F 項（F3 分頁切換／F4 取貨與入場名單／F5 核銷紀錄）。

- **pickup-detail.html**：原本名單與核銷紀錄上下堆疊（紀錄在上），改為 `.tabs` 分頁切換——「取貨與入場名單」預設分頁在前、「核銷紀錄」第二分頁在後；各自的 filter-tabs／搜尋／匯出保留在各分頁內。新增 `data-pk-detail-tabs` 切換 JS、補掛 `tabs.css`。
- 沿用既有元件（`.tabs` 同 scanner.html／其他頁），無新元件；i18n `pk.tab.roster`／`pk.tab.log` 既有。
- 動機：名單（誰核銷了沒）與紀錄（發生過哪些動作）是同一場次的兩個視角，收在一組分頁比上下兩長段更好切換；名單是現場最常看的，設為預設。

## 2026-07-06 · 取貨核銷改二元制（A spec-derived · D122，部分推翻 D119）

使用者裁示：取貨核銷是二元的——每次掃描一次領取該買家在此場次的所有物品；掃過＝已核銷、未掃＝待核銷。移除 部分核銷、有問題、未到場（No-show）。規格 §7.2 與 5.1.5.11／5.1.5.14／5.1.5.15／5.1.5.3.1 同步。

- **pickup.html**：F2 摘要「Issues」KPI 改「Redeemed today（今日已核銷）」；F4 清單移除「Issues」欄（9→8 欄，`product-list--pickup` grid 同步）與 Ended 列的 No-show 統計。
- **pickup-detail.html**：F4 名單移除 No-show／Issues 篩選分頁與該兩列、pending 列的「Mark issue」動作、標記有問題的 JS；保留「反轉核銷」。
- **scanner.html**：Items 統計去「Issues」；Roster 的 Issue 列改為已核銷；hint 去「mark issue」。SCEN 保留「已領取過（重複掃）／不在此場次」即時提醒（非狀態）。
- **i18n**：移除 pk.kpi.issues／pk.col.issues／pk.stat.issues／pk.stat.noshow／pk.roster.issue／pk.roster.noshow／pk.st.issue／pk.roster.flag／pk.roster.r5；新增 pk.kpi.redeemed；改寫 pk.roster.r4／sc.roster.hint。
- 動機：現場核銷是「來了就一次領完」，部分／異常／未到場對 demo 語意多餘；二元制與 scanner「一次領取全部」一致。

## 2026-07-06 · 取貨場次移除「草稿」狀態（A spec-derived · D112）

使用者裁示：取貨管理不需要草稿。規格同步更新（§7.2 取貨場次狀態、5.1.5.11 F2／F3），站台跟改。

- **F2 場次清單**：移除「草稿（Draft）」狀態篩選分頁與草稿範例列；場次狀態只剩 尚未開始／進行中／已結束／已封存。
- **F3 建立場次 popup**（`partials/pickup-session-modal.js`）：移除「Save draft」次要動作，只留「建立場次」主鈕；主鈕在未加入任何取貨商品或活動票券前**停用**（空場次無法建立、無草稿中繼態）。提示文案 `pks.note` 改寫。
- **i18n**：移除 `pk.status.draft`／`pks.draft`／`pk.act.delete`（Delete draft）三個已無引用鍵。
- 動機：草稿中繼態對現場核銷無意義——場次一定要有可核銷項目才成立；「必須加項目才能建立」比「先存空草稿」更符合現場流程。DS 頁 draft 字樣皆屬「商品草稿／建立流程存草稿」，與取貨場次無關，不動。

## 2026-07-06 · 訂單管理／取貨管理主清單對齊電子商店 UI 元件（B 反饋導入）

使用者裁示：訂單管理（orders.html F3）與取貨管理（pickup.html F2 場次清單）要以電子商店（e-shop 家族）的 UI 元件為準。原本兩頁用的是較陽春的 `.data-list`＋灰底 `.filter-tabs`＋常駐 `.input` 搜尋，與 e-shop（product-list＋淡橘 filter-tabs＋收合搜尋＋kebab＋分批頁尾）不一致。本輪把兩頁主清單改吃同一套共用元件。

- **清單列 `.data-list` → `.product-list`**：新增兩個欄位版型 `product-list--orders`（icon／訂單+買家+品項·取貨 meta／金額／狀態雙軸／日期／actions）與 `product-list--pickup`（icon／場次名+地點·時間·統計 meta／狀態／scanner／actions），比照既有 `--eshop/--bundles/--auctions` 手法疊在 base grid 上、不改 base（含 `product-list__head` 欄位表頭、≤760px 堆疊）。清單**不再包 `.card`**、直接落頁（比照 e-shop）。pickup 詳情內的 F4/F5/F8 子清單維持 `.data-list`（次級清單，比照 order-detail）。
- **狀態篩選灰底 `.filter-tabs` → `.filter-tabs--brand`＋每項數量**：淡橘 active／橘字，每個 tab 附 `.filter-tabs__count`（隨搜尋連動重算）。
- **搜尋常駐 `.input` → `search-collapse`（收合式）**：放大鏡鈕點開成 `field-pill`、✕／Esc 收起。
- **工作列改兩排式**（比照 e-shop F3）：上排收合搜尋靠右、下排狀態篩選獨佔整列（版面為 page-specific inline 佈局，不套 e-shop 的 sticky／Figma 陰影；元件本身皆共用）。
- **列操作收進 kebab（⋯）`dropdown-menu`**：orders 列＝Open order／Copy order #／View in Earnings；pickup 場次列依狀態＝Open／Start scanning／Copy URL／Edit session／Archive（草稿＝Edit／Delete；已結束＝Open／Export／Archive）。點外部或點選項後自動關閉。
- **分批載入頁尾 `list-footer`**：清單下方加 end-cap 計數（Showing N of M，隨篩選更新；demo 已全載）。
- 新增 i18n：`orders.col.*`／`orders.a.*`／`orders.btn.search`／`orders.search.close`／`orders.footer.count`／`pk.col.*`／`pk.a.more`／`pk.act.archive`／`pk.act.delete`／`pk.btn.search`／`pk.search.close`／`pk.footer.count`（en＋zh）。無新增 icon（more-vertical/search/x 皆既有）。
- 驗證：Playwright 實測兩頁——product-list 渲染（列高 88px、欄位版型正確）、filter-tabs--brand 橘色 active＋數量（orders 4/0/3/1/2/1/1、pickup 4/1/1/1/1/0）、收合搜尋開合、狀態篩選、kebab 開關、footer 句子在地化（load 後重跑修掉 inline 早於 i18n 的英文殘留）、pickup 詳情/建立場次 popup 仍正常；0 raw i18n、0 缺 icon。`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260706a`。

## 2026-07-03 · E-Shop 新增「取貨管理」＋現場 QR 領取串接（A spec-derived · D111／Plan170）

上游規格新增 E-Shop 子頁「取貨管理（Pickup Management）」（documents/5.1.5.11，決策 D111）：現場 QR 領取不再塞進訂單出貨表單，改由取貨場次統一核銷，一個場次可同時核銷多個取貨商品與多個活動票券，並產生密碼保護的獨立手機 scanner URL。依規格把整套落到 R 2.1。

- **導航（全站）**：`js/sidebar.js` 的 E-Shop 下拉由「電子商店／訂單管理」加為三項，第三項＝取貨管理 → 新頁 `pickup.html`（icon `qr-code`）。i18n 新增 `nav.pickup`／`nav.pickup-sub`。`scanner.html` 為獨立手機頁、無主導航，刻意不進 `match`。
- **新頁 `pickup.html`（取貨管理主頁，F1–F8）**：清單視圖（F1 頁首＋4 張總覽 KPI「今日待核銷／進行中場次／待設定／有問題」＋needs-setup 提示＋F2 場次清單，狀態 filter-tabs＋搜尋，比照 orders.html）；場次詳情視圖（場次基本資訊＋F6 Scanner 存取卡＋tabs：F4 可核銷項目〔取貨商品／活動票券〕、F5 取貨入場名單〔狀態篩選＋搜尋〕、F8 核銷紀錄〔結果篩選＋匯出〕）。清單全部重用 `.data-list`／`.kpi`／`.filter-tabs`／`.tabs`／`.badge`／`.empty-card`。
- **新元件 `ds-components/pickup.css`（🟠 organism · SiteSpecific）**：`.scanner-access`（F6 URL＋密碼＋QR 卡）、`.qr-box`（framed faux-QR，`window.ztorFauxQr()` 生成）、`.pickup-detail__header/__meta`、`.pickup-stats`、`.pickup-select__row`（建立場次多選列）。全 token 化、無裸色。
- **新元件 `ds-components/scanner.css`＋新頁 `scanner.html`（F7 手機 scanner，🟠 organism）**：獨立 URL、無主工作台導航。密碼閘 → 相機視窗（`--surface-inverse` role token、非裸色；掃描線 respects `prefers-reduced-motion`）→ 掃描結果（有效／重複／不屬此場次 三種 banner）→ 確認核銷。demo 用「模擬掃描」循環四情境。
- **共用建立場次 popup `partials/pickup-session-modal.js`（F3）**：`.payout-dialog` 外殼＋`.pickup-select` 多選＋場次名稱／地點／開始·結束時間（含結束＞開始驗證）／取貨說明／scanner 密碼；建立成功→顯示 scanner URL＋QR 結果步。由 `pickup.html`／`create-product.html`／`product-detail.html` 三處共用；從商品脈絡開啟時該商品預先勾選。
- **姊妹頁串接**：`create-product.html`／`product-detail.html` 的「現場 QR 領取」加「取貨場次」選擇＋「建立取貨場次」鈕（開共用 popup）；`orders.html` 混合訂單列加品項層取貨狀態徽章＋待出貨只計物流的說明；`order-detail.html` 品項列加取貨資格狀態（待取貨／場次／核銷紀錄入口），出貨 popup 的 QR 分支改為「不在此手動 Mark received、由取貨管理 scanner 核銷回寫」並隱藏確認鈕。
- **icon**：`js/icons.js` 新增 `scan`／`map-pin`／`calendar-clock`／`key`／`rotate-ccw`。**i18n**：新增 `pk.*`／`pks.*`／`sc.*`／`cp.delivery.session.*`／`pd.delivery.session.hint`／`od.item.pickup.*`／`od.qr.session|manage|note`／`orders.row1.pickup`／`orders.pickup.note`（en＋zh），並改寫既有 `cp.delivery.qr-note`／`od.qr.body`（原「核銷機制待補」→ 串接取貨場次）。
- **DS 同步**：`design-system.html` 加兩支 `<link>`＋TOC＋元件表列＋§4.81 Pickup management／§4.82 Mobile scanner demo；`design-system.md` 元件表加兩列。camera 視窗用 `--surface-inverse`、無新裸色例外。
- 驗證：`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260703e`；Playwright 實測見下。

## 2026-07-03 · 4.5 Chip：視覺展示改完整矩陣＋釐清「動作用 Button 不用 chip」（B 反饋導入）

使用者反饋：4.5 Chip 的視覺展示要像 §4.2 Button 一樣是完整矩陣；並確認 Export CSV 應是 Button、產品頁沒用錯。

- **Chip 視覺展示改矩陣（`design-system.html`）**：原本是「一個 filter-row demo ＋ 一個只有 `.chip` 一列、把 `.chip--static` 硬塞成狀態欄的半矩陣」，改成三張 `matrix-block` 卡：
  - `.chip`（篩選）— text／+count 兩列 × default／:hover／.chip--active
  - `.chip--static`（唯讀）— default／:hover(無變化)
  - `.chip--removable`（帶 ×）— neutral／.chip--active
  - `.filter-row`（chip-group＋Button 動作）保留為「實際情境」示範。格式與 §4.2 一致。
- **釐清 Export CSV 是 Button（非 chip）**：filter-row 情境下加 field-text 明說「Export CSV 是 `.btn--outline`、不是 chip；chip 負責篩選，匯出／列印這類動作用 Button」；Do&Don't 補一條「別把動作做成 chip」。`design-system.md` 同步（Don't 條）。
- **產品頁審計（無需修）**：全庫掃 `.chip` 用法——文字全是篩選／分類／標籤值（All、E-Shop、Vinyl、稅務國別、尺寸 S/M/L…），**0 個動作被做成 chip**；所有 Export／匯出 都是 `.btn`（earnings／fans-crm 皆 `.btn--outline`）。產品頁用法正確，未動 markup。
- 驗證：playwright 實測 chip 段三張矩陣卡渲染、Export CSV＝`<button class="btn btn--outline btn--sm">`、`.chip--static` 不再當狀態欄；`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260703d`。

## 2026-07-03 · 4.2 Button：高度對齊 --control-h 尺度＋Split button 併入顯示展示矩陣（B 反饋導入）

使用者反饋兩點：`.btn` 系列高度是非整數（預設 37.5px、`--sm` 27.5px，源自 padding＋`line-height` 撐出的尾數），要**對齊既有控件尺度 `--control-h`**（跟 input／`.ztor-btn` 同一套 token）；4.2 Button 的「顯示展示」本身就是變體矩陣，底下不該再掛一個獨立的「變體 · Split button」區塊。

- **`.btn` 高度 token 化（`button.css`）**：產品密度 `.btn` 改為釘 `--control-h` 高度、丟掉垂直 padding、由 `align-items:center` 置中（`box-sizing:border-box` 讓 outline 的 1px 邊框含在同一高度內）。對應：預設 `.btn` = `--control-h-sm`（36px，原 37.5）、`--sm` = `--control-h-xs`（28px，原 27.5）、`--lg` = `--control-h-md`（44px，原 ~45）。四變體（primary／outline／ghost／soft）× 三尺寸全部精準落在 token 值、無裁切。outline 各尺寸 padding 同步去掉垂直值（`0 13/17/9px`）。icon 方鈕（36/32/28px）維持自有尺寸系統、不動。全站 25 頁的 `.btn` 經共用 `button.css` 自動吃到新高度。
  - 註：原始需求是「sm 取整數 27」，追問後改為對齊控件尺度 → sm=`--control-h-xs`(28)、預設=`--control-h-sm`(36)；`--lg` 因預設被釘死需連帶給 height，接尺度下一階 `--control-h-md`(44)。
- **Split button 併入 gallery（`design-system.html`）**：移除 §4.2 末尾獨立的「變體 · Split button」區塊（含 `<hr>`／`sub__desc`／`.demo`／自帶 code-fold），改成顯示展示 gallery 內的一張 `matrix-block` 卡——三欄對應 context（Products／Bundles／Auctions）呈現 context-aware 主鈕文字（建立商品／組合／拍賣），caret 可點開全建立類型選單。同步：compose 圖「Used by molecule」補 Split button chip、Button 段 code-fold 的 Class API 補 `.split-button` 系列列。元件 `split-button.css` 與 e-shop markup **未動**（結構本就一致）。
- **產品頁**：e-shop 的 split button 隨 `.btn` 高度變 36px（主鈕＝caret＝36 對齊、context-aware 正常）；sm 按鈕自動變 28px。無 markup 改動。
- 同步 `design-system.md`（Sizes／Class API 改記 token 驅動高度 28/36/44）。驗證：playwright 實測 DS 頁四變體×三尺寸＝28/36/44 且無裁切、split 三卡渲染、舊獨立區塊 0 殘留、e-shop（split 主鈕/caret＝36、sm＝28）與 settings（default 36／sm 28）皆無裁切；`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260703c`。

## 2026-07-03 · 全域外觀鎖定＋Creator 管理擴充（A spec-derived · D107／D108／D110）

上游規格改動落地（documents/ D107 建立欄位擴充／D108 移除語言·主題·顯示模式切換／D110 修訂：顯示模式保留可切換、預設側邊欄）。

- **全域外觀（D108／D110）**：
  - **主題固定淺色**（`theme.js`）：`readStored()` 強制回 `light`、boot 直接 `apply("light")`，忽略舊儲存值與 `?theme=`；`sidebar.js` 拿掉 topbar／sidebar 兩處主題切換鈕（`data-theme-toggle`）。
  - **語言固定繁中**（`i18n.js`）：`DEFAULT_LANG` 由 `en` 改 `zh-Hant`，啟動強制 `restored='zh-Hant'` 並覆寫 localStorage；`sidebar.js` 拿掉 topbar／sidebar 兩處語言切換鈕（`.app-topbar__lang`）。英文字串保留在 DICT（移出 v1、非刪除）。
  - **顯示模式保留可切換、預設側邊欄**（D110）：`theme.js` 的 navmode `readStored` 預設由 `topbar` 改 `sidebar`；顯示模式切換鈕（`data-nav-toggle`）**保留**。
  - **settings.html 外觀**：移除 Light/Dark/System 三張主題卡、移除 Profile 的「語言偏好」欄；保留顯示模式兩卡（「預設」標註移到 sidebar）。
- **Creator 管理（D107，`creators.html`＋`sidebar.js`）**：
  - **未選 creator 時導航只留 Creator 管理**：`topbarNavHtml/sidebarNavHtml` 在 `locked` 時直接回空字串，移除原本鎖住的 Tier 1 模組列（不再顯示 lock 排）。
  - **建立表單擴充**：新增頭像（file，demo）、email（必填）、電話（選填）、店鋪網址（`ztor.com/shop/…` 即時預覽、handle 平台唯一→建立時擋重複 `setCustomValidity`）；名稱保留。
  - **名冊列**：新增「創建時間」欄（grid 5 欄，≤720px 收起該欄）；頭像欄沿用首字母。資料模型 `CREATORS` 補 `email/phone/created`；建立成功以 `new Date()` 記創建時間 append。
  - 新增 i18n keys：`creators.col-created`／`form-avatar`／`form-email(-ph)`／`form-phone(-ph)`／`form-optional`／`form-handle-dup`；`form-handle` 標籤改「店鋪網址」。
- 驗證：`check_ds_sync` 9 項 PASS（唯一 WARN＝既存 fan-store 裸色，非本輪）；`bump_ver` → `20260703a`（31 頁 732 連結）。

## 2026-07-02 · DS 優化輪收尾：fan-store 補轉／UI-CHANGES 歸檔／cache-bust 統一／icon 舊名修正（D infra）

- `fan-store.css` 補轉 `--sp-*`×48＋`--lh-*`×4（值不變驗證；先前因並行編輯跳過）。
- **UI-CHANGES 整治**：統一為新→舊排序（歷史上「頂端插入」與「尾端 append」兩慣例打架、順序已亂）；223 條 2026-06-24 以前的舊條目移至 `UI-CHANGES-archive.md`，主檔 4503→~650 行。新慣例：**新條目一律加最上方**。
- cache-bust 全站統一 `20260702o`（`bump_ver.py`，31 頁 732 連結）。
- icon 舊名修正：`check-circle-2`（Lucide 舊名、registry 無、一直空白）→ `check-circle`（settings.html＋DS readiness demo 共 2 處）。
- 驗證：check_ds_sync 9 項全 PASS（唯一 WARN 為 fan-store `--fst-*` 子主題色板，§1.5 已註記例外）；Playwright 抽查 DS 頁（矩陣/行距/間距/Pillar 2 色票）＋ orders 亮/暗 皆正常，截圖 `screenshots/ds-opt-01~05`。

## 2026-07-02 · 商店預覽改「深色手機版粉絲 app」呈現（B 反饋導入）

使用者裁示：電子商店的商店預覽（See-as-fan）改做成 endgame 原型 creator 商店頁的**手機版**樣子（https://endgame.ztor.lx7.com/creator-jay-chou.html，僅視覺方向）。三項確認＝手機外框呈現／參考頁區塊全做／商店設定 See-as-fan 一起換（§6.7 同源）：
- **fan-store 元件全面改版**（`partials/fan-store.js`＋`ds-components/fan-store.css` 重寫）：預覽面板中央一支**深色手機**（`.fan-store__phone` 外殼＋`.fan-store__screen` 560–640px 自捲動螢幕、藏捲軸），螢幕內容＝粉絲 app 商店頁——app 頂列（menu·ztor.·購物車/帳號，sticky）→ hero（名字壓深色漸層封面＋tagline＋橘點 meta＋圓形社群 YT/IG/TH/X＋橘色「加入社群」pill）→ **sticky app 分頁列**（商店 active 橘字/活動/排行榜/貼文/關於）→ 本月精選（大圖＋橘 overline＋橘框「立即購買」）→ 商品/組合/拍賣**底線式子分頁** → **雙欄商品格**（圖上、名＋價下＋橘購物車圓鈕；售完＝圖降透明＋「售完補貨中」無鈕）→ **頭號粉絲**（名次圈橫捲：#1 橘环／#2 紫／#3 綠…＋名次角標＋積分，名單沿用 Fans CRM 排行榜同批 demo 名）→ **關於**（bio＋閱讀更多）→ sticky 底部 app 導航（焦點/共創/社群/比賽/商店 active）。
- **主題例外**：手機螢幕＝粉絲 app 的**固定深色面**（不跟隨後台亮/暗主題，同 vip-card 前例）——深色中性色 scoped `--fst-*`、品牌橘沿用 `var(--primary)`；已登記 design-system.md「Raw-color exceptions」。空狀態 empty-card 於螢幕內深色覆寫。
- **兩處同源不變**：e-shop F5 與 store-settings F1 注入同一份 partial；e-shop headerless 的「商店預覽」小標改為手機上方置中 overline。商品資料仍沿用管理側同店面（zine/tee/EP/acetate＋hoodie/sticker 六卡，與 e-shop 清單一致）。
- **icons 新增**：menu／user／shopping-cart（標準 Lucide，registry 註明 fan-store 用途）；i18n 新增 `fan.nav.*`／`fan.cart`／`fan.fans.*`／`fan.about.*`／`fan.tabbar.*`（中英）。
- ⚠ 產品語意不變：app 分頁列（活動/排行榜/貼文/關於）、頭號粉絲、關於創作者、購物車、底部 app 導航＝**新增的粉絲端提案欄位**，併入 ASSUMPTIONS UIA-026（待上游核准，未寫回 documents/）。display-only、無互動邏輯。
- 動機：預覽呈現為真實粉絲手機視角，比桌面窄欄更能傳達「粉絲看到什麼」；參考頁只借版型與密度，內容仍用本店 demo 資料。

---

## 2026-07-02 · 低庫存門檻自訂 S31.1 建置，改由 cheat code「版本」切換呈現（A 規格 · D105／D infra）

使用者裁示：把原本延後的「逐商品自訂門檻」現在就做進原型，交付版本切割改由 cheat code 的「版本」開關控制呈現（不再只是 deferred 不做）。做法＝建 UI＋用 `data-feat` 版本閘，Phase 1 仍看到固定 10%、Next+／最終版才看到可編輯門檻：
- **cheat code 機制補強（infra）**：(1) `devtools.js` 解析 feature-scope-map 的 ID 正規表達式原本只吃 `[SOEB]\d{2}`，**加上可選小數點子 ID**（`(?:\.\d+)?`）才抓得到 `S31.1`——否則 `data-feat="S31.1"` 會被當 p1、每版都顯示（gate 失效）。(2) 新增**反向閘 `data-feat-off`**：功能「不」在版本內才顯示，與同位置 `data-feat` 成對，做「Phase 1 用預設呈現、Next+ 換升級版」的切換（`ztd-ver-hidden`）。首次使用。
- **建立商品**（create-product）：低庫存提醒開關下方加「自訂低庫存門檻」數值輸入格（`data-feat="S31.1"`）；Phase 1 隱藏＝只有開關＋固定 10% 說明，Next+ 顯示輸入格。**追加（使用者回饋）**：(1) 輸入格改為**只有「庫存快不夠時提醒我」開關開啟時才顯示**（JS 控 `hidden`，關閉即收起）；(2) 顯示時**預填＝庫存基準的 10%**並隨基準即時重算——限量＝總量上限（如 50→5、30→3）、不限量無硬上限→demo 用目前在庫（如 40→4，spec §7.2 待確認）；使用者手動改值後停止覆寫、清空則回自動。移除原 inline `onclick`，開關改由控制器接管（同步 `aria-checked`）。
- **商品細節頁**（product-detail）：門檻欄改**兩態成對**——base（`data-feat-off="S31.1"`）＝唯讀自動 10%＋「後續版本可自訂」提示；升級版（`data-feat="S31.1"`）＝可編輯數值＋「覆寫預設、留空則自動」提示。版本開關切換兩者。
- **feature-scope-map**：S31.1 Build ⏳ deferred → ✅ built（tier 維持 🔵 Next）；補「data-feat 標註現況」註記。i18n 新增 `cp.lowstock.custom`／`.ph`／`.hint`、`product-detail.threshold.custom.hint`（中英）。
- 動機：規格本就描述「可逐商品調整」為最終產品，原型預設（最終完整版）本應看得到；用版本閘保留 D105「Phase 1 用固定 10%」的交付切割。**未反轉 D105**（Phase 1 體驗不變）、未動 documents/。逐規格門檻粒度仍未做（spec §8 待決）。

---

## 2026-07-02 · 低庫存門檻預設改「庫存上限的 10%」＋自訂門檻延後（A 規格 · D105）

上游把低庫存門檻預設由寫死的「5 件」改為**該品項庫存上限的 10%**（限量＝Total Quantity×10%；不限量基準待確認），且「逐商品自訂門檻」的 UI **v1 不做**、記入版本切割 feature-scope-map S31.1（🔵 Next／deferred）（spec §7.2／5.1.5.1 §2.3／5.1.5.2 §4.1、D105／Plan164）。R2.1 對應：
- **建立商品**（create-product）：低庫存提醒開關由單行標題補上副說明列——「在庫存降到庫存上限的 10%（預設低庫存門檻）時提醒你」（`.control-row__sub`＋`cp.lowstock.hint`）；仍只有開關、無門檻數值輸入（對齊 S31.1「v1 無自訂門檻 UI」）。
- **商品細節頁**（product-detail）：低庫存門檻欄由可編輯 `value="5"` 改為**唯讀**（`readonly`，demo 值 4＝cap40 的 10%）＋提示「自動 · 庫存上限的 10%，逐商品自訂為後續版本功能」（`product-detail.threshold.hint`）；PRODUCT demo threshold 5→4。
- **補貨彈窗**（restock-modal + e-shop 控制器）：新增 `lowThr(cap)=ceil(cap×10%)`，示範資料每個規格/成員改帶自身 cap 並由此導門檻（tee S30→3／M·L40→4；hoodie 30–60→3–6；sticker50→5；LP150→15；poster100→10），列 meta 顯示導出值而非寫死 5；一般清單列無 cap→隱藏「· threshold N」meta（移除 `|| 5` 魔術數）。
- DS §4.62 demo 門檻 5→3/4/4＋補「threshold＝10% of cap」說明；design-system.md §4.29c、ASSUMPTIONS UIA-042、requirements-map 同步。全站資產版本 `20260702k→l`。
- 動機：門檻跟著庫存規模走比固定值更合理；自訂門檻延後讓 v1 聚焦固定預設。皆前端 demo；不限量 10% 基準、取整、門檻粒度＝上游待確認（D105 待辦）。

---

## 2026-07-02 · 補貨組合成員改「成員 tab」＋新增 2×3 矩陣示範商品（A 規格 · D106）

使用者指出 D104 把組合成員平鋪在同一份矩陣清單（不同商品跟 variant 混在一起）不對——不同商品應以 tab 分開。裁示模型：`商品 → 規格矩陣`；`組合 → 商品A(tab)/商品B(tab) → 各自規格矩陣`（spec 5.1.5.6 v1.5／D106／Plan165）：
- **只有「成員商品」用單層 tab；規格永遠是矩陣**（解 D101 曾有的「成員 tab 內再套規格 tab」兩層問題）。
- **restock-modal.js 重構**：`openProduct(groups)`＝無 tab 的規格矩陣；`openBundle(members)`＝成員 tab（重用 tabs.css `.tabs`＋`.tab-panel`），每個 tab 面板放該成員的 `.restock-lines` 矩陣；成員資料支援 `variants`（1 選項）／`matrix`（2 選項）／單品三型。單據層（方式/供應商/ETA/備註）仍在 tab 之上、整單填一次；**數量跨 tab 保留**（各成員面板都在 DOM，`.tab-panel` 切顯示）。移除 `.restock-lines__group`＝成員名的用法（成員改用 tab；group 現只用於商品內 2 選項的選項一分組）。
- **restock-modal.css**：加 `[data-restock-tabs][hidden]{display:none}`（`.tabs` 的 flex 會蓋 `[hidden]`）。
- **e-shop demo**：組合「Coastline starter pack」改混合成員＝tee（4 規格）＋hoodie（2×3 矩陣）＋sticker（單品），完整展示「成員 tab → tab 內規格矩陣（含 2 選項矩陣）」。
- **另新增 2×3 矩陣示範商品**（前一輪）：Coastline hoodie（顏色 Black/Sand × 尺寸 S/M/L＝6 格），列於 Products；補貨以選項一（顏色）分組、選項二（尺寸）為列。
- DS §4.62／design-system.md §4.29c、ASSUMPTIONS UIA-006、BUILD-SPEC、requirements-map 同步為「商品矩陣／組合成員 tab」。皆前端 demo（UIA-006/007；成員實際出貨規格口徑沿用上游待確認）。
- 微調（使用者回饋）：組合成員 tab 與上方「補貨品項」標題間距加大（restock-modal.css `[data-restock-tabs]{margin-top:14px}`，原約 4px）。

---

## 2026-07-02 · 補貨改「一張補貨單＋逐品項數量列」（A 規格 · D104，取代 D101 tab）

使用者指出 tab 模式兩個破綻：組合內含多規格成員 → 成員 tab 再套規格 tab（兩層）；一個商品規格很多 → tab 爆版面且供應商/到貨要逐面板重填。裁示改「補貨單」模型（spec 5.1.5.6 v1.4／Plan163）：
- **兩層**：
  - 單據層（`.segmented` 方式立即/計時＋供應商/預計到貨/備註，整單填一次）
  - 品項層 `.restock-lines`＝每個要補的品項一列 `.restock-line`（識別＋狀態 badge＋目前庫存/門檻＋數量輸入＋即時「→ 補後」讀數）。
- **分組攤平**：單一規格 1 列；多規格逐啟用規格列，`.restock-lines__group`＝商品名；組合逐實體成員一組，**多規格成員展開為其規格列**（直接解使用者問的巢狀情況）。demo＝Coastline starter pack 含多規格 tee（S/M/L/XL）＋單品 cap／sticker。
- **數量留空＝該品項不補**，至少一列＞0 才可送出；送出對＞0 的品項生效、細節頁逐品項 append 補貨紀錄。
- **tab 整個退場**：`restock-modal.js` 改 `openOrder`（openSingle/openVariants/openBundle 皆走它）；移除 `.restock-panel`/`.restock-identity`/`.restock-after`/`.tabs` 依賴，新增 `.restock-lines`/`.restock-line*`；DS §4.62 與 design-system.md §4.29c 改「Restock order (lines)」。
- **[hidden] 防護保留**：ETA 欄由方式切 `[hidden]`，`[data-restock-modal] .payout-field[hidden]{display:none}` 補回隱藏。
- 動機：單據層填一次貼近真實「一張補貨單多品項」，數量列把巢狀與爆量兩問題一次解決。整單單一方式、同單混合方式/部分收貨標待確認（UIA-006/007）。

---

## 2026-07-02 · 補貨再分單一規格/多規格：多規格逐規格 tab 補（A 規格 · D101）

補貨對象粒度依規格模式（spec 5.1.5.6 v1.3／5.1.5.1 v1.9，D101/Plan162）：
- **多規格商品**（5.1.5.2 §4.1 F3 路線 B）補貨＝重用 D100 的 tab 機制，`.tabs` 逐**啟用規格**各一面板分別填；e-shop 多規格列（Coastline tee，`data-variants`）kebab 加「補貨」，demo 規格 S(2 低)/M(18)/L(15)/XL(7) 合計對齊列總量 42。tab 標籤短（S/M/L/XL）、面板識別與紀錄用全名（Coastline tee — S）。
- **單一規格**維持單一面板不變；組合成員本身多規格時再逐規格填（規格層 demo 未展開，紀錄於 spec）。
- **restock-modal.js**：`openBundle`/`openVariants` 共用 `openTabbed`（tabs＝成員或規格，支援 `tab` 短標籤）；補貨紀錄逐筆帶規格名。
- **面板狀態 badge 補三態**：原僅 low/out，庫存充足的規格（如 M 18 件）也被標紅——加 `ok`＝綠色 In stock（庫存軸 §7.2），並校正組合成員 demo 資料（cap 9／LP 21／poster 12 → In stock）。
- 動機：多規格商品的庫存本來就逐規格管（§7.2 逐規格上限與在庫），補貨粒度必須跟庫存粒度一致，否則「補 20 件」不知道補到哪個規格；tab 模式與組合逐成員同構、零新元件。皆前端 demo（UIA-006/007；批次送出語意待上游）。

---

## 2026-07-02 · 補貨流程改版：入口分單一/組合、立即/計時、補貨紀錄（A 規格 · D100）

依使用者裁示改版補貨（spec 5.1.5.6 改寫、5.1.5.1 §2.3＋主規格 §7.2 同步，D100/Plan161）：
- **單一商品面板為核心**：商品列補貨鈕／商品細節頁 Restock 開單一 `.restock-panel`——商品識別（圖＋名＋目前庫存/門檻＋狀態 badge `.restock-identity`）、補貨方式、數量、補後在庫讀數（`.restock-after`＝目前剩餘＋補貨數量，即時算）。移除舊「勾選品項清單」（`.restock-items`／`.restock-item*`）。
- **組合補貨＝tabs 逐成員**：live bundle 列 kebab 加「補貨」，開 `.tabs`＋每個實體成員各一面板分別填（demo 成員 literal）。
- **立即／計時補貨**：`.segmented` 切換——`Restock now`（現貨、送出即 In stock、隱藏預計到貨與到貨確認）／`Scheduled`（送出進 Restocking、顯示「預計到貨」必填＋「到貨確認」）。
- **補貨紀錄**：商品細節頁 §2.3 新增「補貨紀錄」區（重用 `.data-list`：補貨數量／時間／供應商＋狀態 badge，最新在上）；送出即 prepend 一列（demo）。
- **重用不重造**：方式＝Segmented、成員＝Tabs、紀錄＝Data list；restock 專屬只有 `.restock-panel`／`.restock-identity`／`.restock-after`。行為集中在 `partials/restock-modal.js` 的 `createRestock()` 工廠，e-shop.html／product-detail.html 共用。
- 動機：補貨對象與方式因入口與時序不同（現貨即入庫 vs 下單待到貨），單品與組合的填寫粒度也不同；把「單品面板」做成可重用核心、組合用 tab 疊 N 份，最貼近「逐成員分別填」的心智。皆前端 demo，實際庫存/狀態重算口徑待上游 §7.2（UIA-006/007）。

---

## 2026-07-02 · 組合定價改「成員自動加總、唯讀」（C 撤除＋A 規格 / D102）

- **移除創作者定價/折扣**（撤 D088）：create-bundle 與 bundle-detail 的定價區由「固定價／% off 折扣兩模式＋輸入」改為**唯讀自動價**——組合價格＝成員價格自動加總（`bundlePriceText()`），任一成員多規格（`data-variants`）→「從 $X 起（From $X）」。成因＝成員多規格多價位、手動定價過複雜（使用者裁示）。
- **就緒去檢價**：create-bundle Create gating＝名稱＋≥2 成員（＋啟用販售排程時起訖日）；移除 priceOk／≤成員合計檢核。preview 組合價改自動值。submit 帶入自動價文字。
- **JS 清理**：移除 pGrid/fixedMode/syncDiscount/折扣雙欄連動/定價模式切換/定價輸入監聽；bundle-detail 移除定價模式切換。新增 `.cb-autoprice` 顯示。
- **i18n**：`cb.pricing`→「組合價格/Bundle price」；新增 `cb.price.auto-hint`／`cb.price.from`／`cb.price.from-suffix`（zh「 起」）。舊 `cb.price.fixed/pct/discounted/...` 保留未用。
- **規格**：5.1.5.4 v1.9（§3 去定價模式表、§4 F3 改「組合價格（自動、唯讀）」、§4 F7 特價來源失效改待確認、§5 資料、§6 去檢價）、5.1.5.9 v1.6（定價改唯讀）；decisions D102（撤 D088）、backup_plan Plan156。
- 待上游：買家結帳依所選規格的實際組合價、是否有平台層組合優惠、販售排程特價機制。皆前端 demo。

## 2026-07-02 · scope map 對源複核＋版本切換階段一標註（D infra · 使用者指示）

- **對源複核**：源頁（ztor-eshop-proto）未更新（自標 2026-06-29、位元組級相同），feature-scope-map.md 107 項 tier／build 以腳本重抽比對**零漂移**。就地更正兩處源頁筆誤並於列備註標依據：O08 代付款→待付款（規格 Unpaid）、E22 EFT→NFT（§7.3 淨利池 NFT 40%）；轉錄註記補 7/2 複核說明。
- **規格核對報告更新**（feature-scope-map-規格核對.md）：折入 6/30 後規格變動——5.1.5.6 D100 補貨改版（單一/組合入口、立即/計時、補貨紀錄）、5.1.5.2 F11 內容檔擴充（F11.1 曲目／F11.2 卡面）列入「規格有、Scope 未列」；POPCORN 複查仍零命中；記錄筆誤已修與「B 買家店面略過」決策。
- **devtools.js 版本切換機制強化**：(1) `data-feat` 支援逗號多值（外殼包多功能，任一在版本內即顯示）；(2) 作用中分頁被版本藏掉時自動 click 第一個可見兄弟 tab（`.tabs__item`／`.filter-tabs__item` 通用，觸發頁面自身切換 JS）。
- **階段一 data-feat 標註（25 個元素、17 個功能點）**：e-shop S11 拍賣整線（tab／Create auction 下拉／即時橫條／清單）；orders O04 退款 KPI＋O09 退款篩選 tab；order-detail O17 粉絲記錄／O18 退款鈕／O22 數位交付（segmented＋branch）／O23 退款爭議卡；earnings E09/E22/E23/E24 四分頁＋E22 View breakdown 捷徑＋E20 補登鈕×2（E08 前已標）；store-settings S05/S06 tab＋panel＋外殼（逗號多值示範）；product-detail S24 專案引用卡。E13–E17 r2.1 無實體可標。
- 驗證：node 模擬 25 標註 × full/p1-next/p1 三版本顯示決策全對齊 tier 表；devtools.js 語法 OK；check_ds_sync PASS（WARN 皆既有例外）。requirements-map 無需動（本輪為 dev harness 標註，非規格覆蓋變更）。未 deploy／未 collab，待使用者指示。
- **版本檔位改序號命名＋補第四檔（同日後續，使用者指示）**：開發版本由 3 檔擴為 **4 檔**、順序改 P1→P4 遞增，顯示名改「**Phase N（原 tier 命名）**」以便日後對照 source——Phase 1（Phase 1／tier:p1）／Phase 2（Phase 1 ＋ Next／p1,next）／Phase 3（Phase 1 ＋ Next ＋ TBD／p1,next,tbd，**新增檔位**）／Phase 4（最終完整版／`all`，鍵仍 `full`、預設）。鍵未動（URL/LS 相容）。Phase 3 與 4 對已標 data-feat 的 eShop 元素畫面相同（差異只在 eShop 外模組日後納入切割）。node 驗四檔顯示決策對齊 tier 表。

## 2026-07-02 · 組合折扣補回：自動 base ＋ 折扣 %（A 規格 / D103 修訂 D102）

- 依使用者「折扣功能要加上去」：在自動加總 base（唯讀）上補回**單一「折扣 %」欄（選填 0–100）**；粉絲付＝base×(1−折扣%)。**不恢復固定價/絕對折後價**（變體多價位下語意不明）。
- create-bundle／bundle-detail：base 顯示改「有折扣時大字＝折後價＋旁邊劃掉 base（`.cb-basestrike`）＋『−N%·省 $Z』」；多規格「從 $Y 起」。create-bundle gating 加「折扣填了須 0–100」（`discOk`）；bundle-detail 折後即時計算（base 靜態 demo）。
- i18n：新增 `cb.price.discount`／`cb.price.discount-hint`／`cb.price.discount-bad`。
- 規格：5.1.5.4 v2.0（§4 F3「組合價格與折扣」、§3/§5/§6 同步）、5.1.5.9 v1.7；decisions D103（修訂 D102）、backup_plan Plan157。
- 皆前端 demo；結帳依所選規格實際計價、平台層優惠仍待上游。

## 2026-07-02 · 商品細節頁卡片重分：價格·庫存移出「商品內容」→ 獨立「Price & stock」卡（A 規格 / D109）

- 依使用者裁示：商品細節頁（product-detail.html）「Product content」卡不該含 價格／庫存／低庫存門檻，這些屬銷售設定、應獨立成「價格與庫存」。對齊建立商品（5.1.5.2）分組——F2 商品資訊只放內容、F3·F5 才是價格與庫存。
- **卡片重分為三張**（原型；對齊 spec 5.1.5.1 §2.3–§2.5）：
  - **Product content（§2.3）**：只留 圖片素材／標題／主·次分類／描述／詳細規格（實體）／內容檔案（數位）。移除原本嵌在其中的 價格·庫存·低庫存門檻 3 欄格。
  - **Price & stock（§2.4，新增卡 `#pd-pricestock`）**：價格·庫存·低庫存門檻 3 欄格（自 content 卡移入）＋庫存版本 Edition（自舊 settings 卡移入）＋補貨紀錄 Restock history（自舊 settings 卡移入）。
  - **Delivery & buyer settings（§2.5，原 `#pd-settings` 更名，原 en「Inventory, delivery & buyer settings」→「Delivery & buyer settings」、zh「庫存、取貨與購買設定」→「取貨與購買設定」）**：取貨方式／數位交付／每人限購／商品標籤。Edition 與 Restock 已移出。
- **JS**：settings 控制器 `applyVis()` 的 `[data-when-edition]` 查詢由 `#pd-settings` 卡範圍改 `document` 範圍（Edition 子欄位已移出該卡）；`#pd-edition` 以 `getElementById` 全域取用、不受影響；restock log／`data-pd-cat` 本就全域查詢。限量子欄位（Total quantity／Goods in stock）toggle 驗證正常。
- **i18n**：新增 `product-detail.price.title`（Price & stock／價格與庫存）、`product-detail.price.sub`；改 `product-detail.inv.title`（→ Delivery & buyer settings／取貨與購買設定）。i18n.js cache-buster 全站 `20260702l`→`20260702m`（30 頁）。
- **規格**：5.1.5.1 v1.12（§2.3 拆三塊、原 §2.4/§2.5 後移 §2.6/§2.7）＋0-設計規格書三處 §編號同步；decisions D109、backup_plan Plan168。
- 皆前端 demo。check_ds_sync PASS（WARN 皆既有例外）。未 deploy／未 collab，待使用者指示。

## 2026-07-02 · 間距 token 化 --sp-*（px 直命名）＋行距第 7 階 --lh-comfy，全元件層收斂（D infra · 使用者指示）

- 範圍：`ds-components/_tokens.css`、61 支元件 CSS + `shared.css`（`fan-store.css` 因並行編輯跳過、待補）、`design-system.html`／`.md` §1.2／§1.3／§2.3。
- **間距**：新建 `--sp-*` px 直命名刻度 20 階（`2…96`，數字＝px、與 `--fs-14` 同邏輯；取自全庫實值直方圖）。轉換腳本把 645+ 處 `gap`/`padding`/`margin` 字面 px 換成 `var(--sp-N)`，**逐檔「值不變」可逆驗證通過（零渲染變化）**。保留字面值：奇數微調（1/3/5/7/9/11/13px）、刻度外 22/26px、負值、`calc()`。舊 `--space-1…16`（4 倍數制、從未採用）退役移除；`--space-shell-gutter` 保留。
- **行距**：`--lh-*` 加第 7 階 `--lh-comfy 1.4`；元件層 70 處硬寫行距全轉 token——53 處值完全不變、17 處 ±0.05（1.35/1.45→1.4、1.05→1.1、1.15/1.25→1.2）。
- **check_ds_sync 同輪升級**（Skills 端）：新增檢查 9「md↔html 同步」（Pillar 1/2 小節編號對齊＋`_tokens.css` 每個 token 兩份文件都要文件化，萬用 `--x-*` 可涵蓋；揭露行「待採用/退役」計入文件化但不算宣稱使用）；並修齊 md 22 個 shadcn 對齊 token 的文件缺口（標「待採用」）。另新增 `bump_ver.py`（全站 cache-bust 一鍵統一，dry-run 驗證 20260702o/732 連結）。
- 驗證：check_ds_sync 檢查 1–4、6–9 全 PASS；唯一 WARN 為 fan-store.css 裸色（並行編輯中、歸該線收尾）。cache-bust 待發版前統一 bump（頁面屬並行線工作區、暫不touching）。
- 附帶修正：`--highlight` 虛構 token（KPI 「orange tint」說法）3 處移除——kpi.css 從無此 token，headline 靠 display 字級突顯。

## 2026-07-02 · design-system.html 抽 class 減量＋icons 雙檔架構文件化（D infra · 使用者指示）

- **抽 class**：1.2.2 三張字體矩陣（15 th＋24 列＋96 格）、1.2.3 行距樣本（7 格）、2.2 role 渲染列（10）、2.4 控件列（5）的重複 inline style 全抽成 DS 頁 `<style>` 類別（`.tm`／`.tm--body`／`.role-row`／`.ctl-row`／`.lh-sample`；矩陣列只帶 `--tm-fs` 一個變數，字重走 `nth-child`）。樣式值一比一對應、零視覺變化；檔案省 ~27KB。
- **icons 盤點結論：icons.js 與 icons-all.js 是刻意分工、不合併**——`icons.js`（27KB/89 顆策展）30 個產品頁用；`icons-all.js`（365KB/1713 顆全集）只有 DS 頁載（icon 總覽），`icons.js` 啟動時把缺的 key 併入。接線驗證正確（DS 頁 all 在前）。design-system.md §1.7 補記此架構與「勿合併」警告。
- 驗證：check_ds_sync 9 項僅剩 fan-store.css 裸色 WARN（並行線檔）；殘留矩陣長 inline style＝0。

## 2026-07-01 · E-Shop 草稿列行為細化（B 反饋 · 使用者裁示 · UIA-038）

草稿（`data-status="draft"`）在商品列表的行為，依使用者兩次裁示調整：
- **置頂**：載入時 `pinDrafts()` 把草稿列移到清單最前，優先讓創作者補齊。
- **不可拖曳**：草稿無粉絲端陳列順序（拖曳＝粉絲陳列順序 D083），握把隱藏（`product-list.css` 的 `[data-status="draft"] .product-list__drag { visibility:hidden; pointer-events:none }`）＋`pointerdown` 對草稿 return；且 `follow()` 只把非草稿列當讓位對象，別的列拖不到草稿上方。
- **kebab 選單改組**：**移除「在商店上架」開關**（草稿未備齊、不提供直接上架）＋**新增「刪除」破壞性項**（紅字，promote 成 `dropdown-menu.css` 的 `.dropdown__item--danger`＝紅字 ghost）。狀態徽章維持「草稿（Draft，`badge--neutral`）」。刪除為 demo（`data-eshop-delete` 直接移除列＋重算分批/狀態計數），完整 destructive 樣式與確認流程待規格。
- i18n 新增 `e-shop.delete`（Delete／刪除）。DS：dropdown demo 加 `--danger` 刪除項、product-list drag State 表加草稿 non-draggable 列；design-system.md 同步。
- 驗證：check_ds_sync PASS；Playwright——草稿在 index 0、握把隱藏不可拖、別的列拖到頂草稿仍第一、選單＝編輯＋刪除（無上架開關）、刪除紅字 #DA314A、點刪除列數 30→29 草稿移除、狀態 草稿。

**2026-07-01 追加（同輪 B 反饋，UIA-038/039）**
- **草稿「編輯」→ 建立流程頁**：草稿＝未完成的建立，編輯＝回到建立精靈。Products 草稿 Edit `product-detail`→`create-product`、Bundles `bundle-detail`→`create-bundle`、Auctions 本就 `create-auction`；三類一致（非草稿列 Edit 仍進細節頁）。
- **上架/下架狀態文案**：商店上架→狀態「上架中」、商店下架→狀態「已下架」。i18n 顯示層——`e-shop.row.active`＋`e-shop.status.in` zh「已上架」→「上架中」（對齊 product-detail 既有）、`e-shop.row.hidden`「Hidden／已隱藏」→「Unlisted／已下架」。內部 `data-status`（§7.2）不變，僅列上顯示字；三類 Live 徽章與 Live 篩選 tab 共用鍵一併生效。

---

## 2026-07-01 · E-Shop 產品頁 DS drift 稽核收斂（D infra · 多代理稽核 13 項 findings）

對 e-shop 產品頁叢集（e-shop / product-detail / create-product / create-bundle）做「有設計、沒同步進 DS」稽核，收斂 13 項 drift（0 高/9 中/4 低）。無產品行為變更、純呈現層收斂與 DS 文件對齊：

**收斂重造的元件（改用既有元件，刪頁面內重寫）**
- `e-shop.html`：`.eshop-list-foot`/`__cap` → 改用 `list-footer`（`--center` 新變體，載完 end-cap）；連 `list-footer.css`、刪頁面 `<style>` 3 條。
- `product-detail.html`：`.pd-switch-row` → `control-row`；`.pd-two-col`/`.pd-three-col` → `form-grid`/`--3`；`kpi` 側欄 inline 尺寸 → `kpi--compact`。連 control-row/form-grid.css、刪頁面 CSS。

**promote 頁面內可重用 pattern 進元件層（＋DS demo＋md）**
- 收合式工具列搜尋 → 新 `ds-components/search-collapse.css`（`.search-collapse`，內層重用 field-pill）＋DS §4.28b demo＋TOC。
- 拖曳握把 `.product-list__drag`＋抬起態 `.is-dragging` → 併入 `product-list.css`＋DS 加 `--eshop` 拖曳 demo＋State 表。
- 選單開關列 `.dropdown__item--toggle` → `dropdown-menu.css` modifier＋DS kebab demo 加 toggle 列。
- 就緒 footer chip `.cp-ready-chip`/`--ready`/`.cp-ready-pop` → `readiness.css`（`__chip`/`__pop`）＋DS demo；create-product 改用（create-campaign 有自身 pill 變體、暫留待後續收斂）。
- 行內標題標籤 → `badge--inline` modifier（e-shop ×2／order-detail ×1，統一左間距 6px）＋DS badge 表加變體。
- 必填星號 inline `color:var(--error,#c00)`（26 處／7 檔）→ `field__req`（`field-system.css`，改用 `--destructive` token，去裸 hex）。

**DS 文件修正**
- Preview panel §4.56 註解由錯誤的「常駐、不可關閉」改為「可開關、預設關閉、headerless」（對齊 D084／實際 JS）。
- KPI md「Single variant」改列 `--compact`；product-list md/demo 補 `--eshop`／拖曳握把（原缺）。
- 接縫陰影 `.eshop-seam-shadow`／補角 `.eshop-corner-mask`＝shell 版式膠水，暫留頁面但於 design-system.md 註記為與 `.edge-shadow` 同族的頁級技法；修 corner-mask anti-alias fork（`-0.5px`→`-1px`，對齊 DS 的 `.alert--page-top::after`）。

cache：`shared.css` 的 5 個 @import 版本由長期停滯的 `20260626j` 一併校正到 `20260701d`（field-system.css 改了 `.field__req` 必須 bump 才生效）；全站 HTML 版本統一 `20260701d`。驗證：check_ds_sync PASS（65 元件全連入／版本一致／97 TOC 解析；WARN 僅既有 selection-card 例外＋`--space-1` 死 token）；Playwright——search 收合展開、list-footer 置中、拖曳握把 grab、dropdown toggle space-between、badge--inline、control-row 外框、form-grid 三欄、kpi--compact 無 min-height、field__req 紅（#DA314A）皆正確、0 runtime error。

**未動（判為合理單頁膠水／out of scope）**：create-bundle 的 `.cb-add-tile`/`.cb-summary`/`.cb-price-input`/`.cb-sublabel`/`.cb-no-result` 為單頁 Create bundle 專屬組合，無跨頁 consumer，留頁面層；create-campaign 的 `.cp-ready-chip`（自身 pill 視覺、與 create-product 不同）待後續與 readiness__chip 收斂。

---

## 2026-07-01 · 全建立頁上緣留白加大對齊募資測試頁（B 反饋）

使用者反饋：所有建立頁的內容上緣 padding 太緊，要加大到跟「募資創建（測試版）」`create-campaign.html`（已調成 `.wizard__body` `padding-top:44px`）一樣。

- **改動**：6 個建立頁的 `.wizard__body` `padding-top` 由 **16px → 44px**——`create-product`／`create-auction`／`create-bundle`／`create-project`／`register-ip`（原各自 override 16px），`create-event`（原無 override、吃 shared 40px，補一條 44px override）。
- 純呈現、只動各頁 inline `<style>` 的上緣留白；未動 `shared.css` 的 `.wizard__body` 預設（40px，其他 wizard 沿用）、未動 max-width、未碰產品規則。
- 驗證：http 開 create-product，上緣留白明顯放寬、與 create-campaign 一致；0 JS error（僅 favicon）。截圖 `screenshots/create-pages-upper-padding-44px-20260701.png`。無版本 bump（僅 inline style）。

---

## 2026-07-01 · 建立商品「Show it off」互動上傳格（A 呈現／含產品變更提案）

- **Promote 互動上傳為 DS 元件**：`ds-components/upload-tile.css` 加互動狀態（scoped `[data-upload]`，不動舊 `.is-filled` 綠框，其他頁不受影響）＋新 `partials/upload-tile.js` 增強器。狀態流：空 → 點擊開檔案選取 → 選到圖（`createObjectURL` 縮圖）→ 上傳中（frosted 罩 spinner＋底部進度條，假走 ~2.5s）→ 已上傳 → hover 出 替換／AI 優化／刪除 → AI 優化（優化中 ~1.2s → 「已依規格優化」徽章）。空狀態 hover 顯示更多資訊（`__sub`/`__hint` 淡入、無版面跳動）。
- **create-product**：Show it off 的 10 個圖片格（p-hero＋4 p-gallery＋d-cover＋4 d-gallery）加 `[data-upload]`、載入 partial；就緒檢查改監聽 `upload:change`（同 key 多格取任一已上傳）；數位內容檔 `d-file` 維持原簡易 toggle。
- **icons**：新增 `sparkles`（AI 優化）、`refresh-cw`（替換）；`image`/`trash-2` 沿用。**i18n**：新增 `cp.media.uploading/optimizing/optimized/replace/optimize/remove`。
- **DS 同步**：design-system.html 4.15 Upload tile 加互動 live demo（點擊可試）＋狀態表＋AI 優化提案註記＋載入 partial；design-system.md class API／token／registry 同步。全 CSS token 驅動（罩用 `color-mix(--foreground/--card)` 主題自適應），check_ds_sync PASS。
- **產品變更提案（ASSUMPTIONS UIA-037）**：**AI 優化＝把圖轉成「制式規格」上游無此功能**（媒體規格目前僅尺寸下限）；按鈕為假動作、不真處理，制式規格定義／是否為平台功能／可否還原待上游核准，未寫回 documents。
- 皆前端 demo，無真實上傳／持久化。

## 2026-07-01 · 數位商品「音樂專輯（Album）」多曲目管理器（A 規格）

- **規格先行（documents/5.1.5.2 v5.3）**：F11 內容檔音樂類拆單曲／專輯，新增子塊 F11.1「專輯曲目管理」——逐曲：曲目檔案（音訊/影片，含上傳中狀態）／曲目封面／曲名（可改）／檔案資訊／順序（拖曳）／歌詞（音訊限定）；逐曲操作＝改名/換封面/上傳歌詞/刪除。§7.4 同步；backup_plan Plan154；validate_spec PASS。
- **新 DS 元件 `album-tracks`**：`ds-components/album-tracks.css`＋`partials/album-tracks.js`。上傳區（Upload File *，建議 mp3/mp4）＋曲目列（拖曳把手/封面/曲名+meta/View Lyrics/⋯ 選單）。逐列 ⋯ 選單重用 `dropdown-menu.css`（改名 inline／更換封面／上傳歌詞〔音訊限定〕／刪除紅字）。上傳中列＝type icon＋「檔名 上傳中…」＋不定進度條、無把手。emit `albumtracks:change` 供就緒。
- **接進 create-product**：數位分類選 Album → F11 顯示曲目管理器、隱藏單檔格（`updateCfile()`）；就緒 `d-file` 改吃曲目數>0。載入 dropdown-menu.css/album-tracks.css/js。
- **i18n**：新增 `cp.album.*`（upload／upload-hint／uploadingword／justnow／viewlyrics／track.rename/cover/lyrics/delete/actions）。icons 沿用既有（grip-vertical/more-vertical/music/video/image/pencil/upload/trash-2/file-text）。
- **DS 同步**：design-system.html 4.78 Album tracks live demo（可點試）＋TOC＋registry＋head link/partial；design-system.md registry 條目。
- **產品待確認（規格內標記，未寫成正式規則）**：至少一曲、封面必填、歌詞格式、檔案大小上限、試聽、影片曲目歸屬。皆前端 demo（假上傳/歌詞/封面）。
- 依據：使用者指示＋Figma Beamco Artist Portal v2 node 14192-34712。

## 2026-07-01 · 補接 search-collapse 進 DS（D infra，非本人功能）

- 背景：另一 session 已把電子商店 F3 收合式搜尋 promote 成 `ds-components/search-collapse.css`（未追蹤）並在 `e-shop.html` 使用，但未接進 design-system.html，導致 check_ds_sync FAIL（缺 link／缺 demo／頁面有 DS 無）。
- 處置（additive，不 revert/刪除他人改動）：design-system.html 補 head link＋TOC＋registry＋4.79 Search collapse demo（收合／展開兩態，內層重用 field-pill）；design-system.md 補條目。check_ds_sync 回 PASS。
- 未動 e-shop.html；`search-collapse.css` 仍未追蹤——正式 commit 前需 `git add` 納入追蹤，否則線上會缺檔（見回報）。

## 2026-07-01 · 數位會員卡「卡面自訂器」vip-card（A 規格）

- **規格先行（documents/5.1.5.2 v5.4）**：F11 會員卡由「上傳整張卡面圖」改為卡面自訂器，新增子塊 F11.2「會員卡卡面自訂」——平台公版＋Text/Image 模式（Text＝卡片名稱文字、Image＝上傳 PNG logo 約 127×33px 透明底）→ 合成到公版＋即時預覽（Preview Your Card，固定副標 OFFICIAL MEMBERSHIP）。§7.4 同步、backup_plan Plan155、validate_spec PASS。
- **新 DS 元件 `vip-card`**：`ds-components/vip-card.css`＋`partials/vip-card.js`。`.vip-card`＞`__settings`（`.segmented.radio-cards` Text/Image＋`.input`名稱／`.upload-tile` logo）＋`__preview`（`__frame` 全像場景＞`__plate` 霧面卡＞`__logo`/`__logo-img`/`__plate-sub`）。模式 class `.vip-card--image`；emit `vipcard:change`。重用 radio-cards/input/upload-tile。
- **接進 create-product**：內容檔改三態——會員卡→vip-card、專輯→album-tracks、其他→單檔格（`updateCfile()`）；就緒 d-file 改吃「名稱有字 或 已傳 logo」。
- **i18n**：新增 `cp.vip.*`（title/sub/text/image/name/name.ph/uploadlogo/uploadfile/logohint/preview）。
- **DS 同步**：design-system.html 4.80 VIP card live demo＋TOC＋registry＋head link/partial；design-system.md registry 條目。
- **裸色例外（記錄在案）**：`vip-card.css` 公版全像漸層＋玻璃卡白字/rgba＝固定藝術（theme-independent），已在 design-system.md「Raw-color exceptions」列明；check_ds_sync PASS（WARN 已註記）。
- **公版為 CSS 近似**、實際卡面素材與合成輸出待提供；**產品待確認**：多公版、名稱字數上限、logo 硬限制/去背、副標可編輯（D071 權益/存取仍擱置）。皆前端 demo。

## 2026-07-01 · 內容檔（音樂/影片）互動上傳＋播放/刪除（A 呈現）

- **`upload-tile` 加內容檔模式 `data-upload="content"`**：單檔內容格由「點一下切 is-filled」升級為互動格（比照 Show it off 圖片上傳）——點擊選檔→假進度→已上傳→hover 動作。**音訊/影片可即時預覽播放**（真實 `<audio>`/`<video>` 播所選檔）＋替換＋刪除，**無 AI 優化**。影片顯示影格（`.upload-tile__video`）、音訊/檔案顯示檔型圖示＋檔名（`.upload-tile__filemark`/`__filename`）；`.upload-tile--playable` 才顯示播放鈕；新增 `.upload-tile__act--play`（play/pause 切換）。
- **create-product**：內容檔單檔格加 `data-upload="content"`；`accept` 隨分類（音樂→`audio/*`、影視→`video/*`、其他→任意）由 `updateCfile()` 設 `data-upload-accept`；就緒沿用 `upload:change`。
- **i18n**：新增 `cp.cfile.play/replace/remove`。icons `play`/`pause`/`file`/`music`/`video` 皆既有。
- **DS**：upload-tile demo 加「內容檔模式」可試用區＋說明；design-system.md Class API 補 `[data-upload="content"]` 條目。
- **規格**：documents/5.1.5.2 F11 補一句「音訊/影片內容檔上傳後可即時預覽播放與移除（呈現參考·非約束）」；ASSUMPTIONS UIA-041。
- 顯示圖模式（Show it off）行為不變（仍 AI/替換/刪除、無 play），已回歸驗證。皆前端 demo（`createObjectURL` 本機預覽，不真上傳）。

## 2026-06-30 · Creator 管理頁移除 bento 概覽＋搜尋/篩選改同列（B 反饋 · A 規格 D099）

延續同日 creators 改版，使用者裁示再調整：拿掉名冊概覽（bento）、狀態篩選與搜尋改放同一列。

**B 反饋（呈現，creators.html）**
- **移除 bento 概覽**：拿掉「總數/啟用中/已停用」三張 kpi tile（F2 概覽整塊移除）；各狀態數量改只由 filter-tabs 的 count 承載。移除 `kpi.css`／`bento.css` 連結與 i18n `creators.metric-total`。
- **搜尋/篩選同列**：原本搜尋一列、filter-tabs 另一列 → 併成單列 flex（**篩選左、搜尋右**，`justify-content:space-between`，搜尋 `flex:0 1 320px`）。

**A 規格（D099，先改 documents/）**
- 5.1.0 移除 F2 名冊概覽，F 重編號為 F1 頁首／F2 名冊工作列（搜尋＋篩選＋建立）／F3 Creator 名冊／F4 進入返回；頁面佈局/狀態/情境 F 引用同步；備份 Plan153。部分撤銷 D098。

**D infra**
- cache：改動 i18n.js → 全站版本 bump `20260630b`→`20260630c`。

驗證：http 0 JS error；無 bento、篩選左+搜尋右同列、清單表頭與互動正常；截圖 `screenshots/creators-10-*-20260630.png`；check_ds_sync PASS、validate_spec OK。

---

## 2026-06-30 · Creator 管理頁對齊電子商店元件：bento 概覽、前往(Enter)、field-pill/filter-tabs/product-list ＋ 規格 F 重編號（B 反饋 · A 規格 D098 · D infra）

延續同日 creators 改版，使用者再反饋四項：摘要改 bento、管理鈕改「前往」、搜尋/篩選/列表改用電子商店同款元件、規格 F 項照電子商店分類重編號。

**B 反饋（呈現，creators.html）**
- **摘要列改 bento**：「N 位·X 啟用中·Y 已停用」文字行 → bento 12 欄格＋三張 `.kpi.bento--span-4`（總數/啟用中/已停用），與 Dashboard KPI 同元件。
- **管理 → 前往**：列主按鈕 i18n `creators.manage` 改 en `Enter`／zh `前往`。
- **搜尋改 field-pill**：原 `.creators-search`＋`.input` → e-shop 同款 `field-pill`（放大鏡 icon＋輸入）。
- **狀態篩選改 filter-tabs**：原 native `<select>` → e-shop 同款 `filter-tabs filter-tabs--brand`（全部/啟用中/已停用 淡橘 pill＋每項數量，隨名冊即時重算）。
- **列表改 product-list**：原 `data-list` → e-shop 同款 `product-list` 列骨架（retarget 欄位 avatar／名稱+識別／狀態／列操作）；停用列淡化、整列可點維持。依使用者再指定，補上 `product-list__head` **欄位表頭**（Creator／狀態，欄寬固定 `52px / 1fr / 104px / 140px` 讓表頭與列對齊）；creators 無分類/價格/庫存與拖曳重排，故省略 e-shop 的那幾欄與 drag handle。再依使用者指定**移除工作列/清單最外層 `.card` 包裹**（e-shop 清單本就不包卡片，改用 `eshop-list-controls`＋`product-list` 兩 section 直接落頁），creators 同步拿掉 `.card` 與 card.css 連結；bento 概覽 tile（kpi）保留。

**A 規格（D098，先改 documents/）**
- 5.1.0 F 項照 5.1.5 電子商店「頁首/概覽/工作列/清單」分類重編號：F1 頁首／F2 名冊概覽（bento）／F3 名冊工作列（搜尋＋篩選＋建立）／F4 Creator 名冊（列＋列操作 前往/停用/啟用）／F5 進入與返回。原 F2 建立併入 F3、原 F4 停用啟用與進入入口收為 F4 列操作（比照 e-shop 列操作含於清單 F）。頁面佈局/狀態/情境 F 引用同步；備份 Plan152。

**D infra**
- creators.html 連入 `kpi.css`／`bento.css`／`field-pill.css`／`filter-tabs.css`／`product-list.css`，移除 `data-list.css`；新增 i18n `creators.metric-total`。
- cache：改動 i18n.js → 全站版本 bump `20260630a`→`20260630b`。

驗證：http 實測 0 JS error；bento 三 tile（3/2/1）、filter-tabs 點「已停用」只剩 KMT、前往按鈕、中文齊全；截圖 `screenshots/creators-06/07-*-20260630.png`；check_ds_sync PASS、validate_spec OK。

---

## 2026-06-30 · Creator 管理頁：狀態定案兩值＋停用/啟用、建立改 popup、搜尋/篩選/摘要/整列可點（A 規格 D097 · B 反饋 · D infra）

使用者檢視 creators.html 後反饋三事：建立要 popup、要停用按鈕、`已發布／草稿`看不懂。查證後確認 `draft／published` 是建站自塞、無上游依據（D086 待確認 #4 狀態枚舉一直未定），先回上游定案再改站台。

**A 規格（D097，先改 documents/ 再改 site）**
- creator 狀態枚舉定為兩值 **啟用中（Active）／已停用（Disabled）**，撤除無依據的已發布／草稿；spec 5.1.0 F1 寫實、新增 F4「停用／啟用 Creator」、關閉 D086 待確認 #4（備份 Plan151）。

**B 反饋（呈現）**
- **建立改 popup**：inline 展開表單 → modal 彈窗，重用 canonical 對話框外殼 `.payout-modal`／`.payout-dialog`（比照 message-modal），含關閉 ✕／Esc／點遮罩關閉、開啟自動聚焦 name。
- **停用／啟用**：列尾新增 ⋯ 溢出選單（`dropdown`），啟用中顯「停用」、已停用顯「啟用」，in-memory 切換即時重繪；已停用列 `badge--neutral`＋淡化。**已停用仍可 Manage 進入代操**（spec F4 待確認，本輪 demo 不閘控，記 UIA-036）。
- **搜尋／篩選**：toolbar 加名稱／識別搜尋＋狀態 All／Active／Disabled 篩選（僅影響檢視，補建站漏的 F1 既有要求）；無符合顯卡內提示。
- **名冊摘要列**：「共 N 位 · X 啟用中 · Y 已停用」，i18nT 組字＋掛 `i18n:applied` 切語言重譯。
- **整列可點**進管理（管理鈕／⋯選單 stopPropagation）。

**D infra**
- 新 i18n 詞條（status-active／disabled、search-ph、filter-*、summary-unit、row-actions、action-disable／enable、create-close、empty-filter），移除 status-published／draft。
- icons.js 核心 registry 補 `more-horizontal`（⋯）。
- sidebar.js demo roster 狀態改 active／active／disabled。
- creators.html 新連入 `dropdown-menu.css`、`payout-modal.css`。
- cache：改動共用 i18n.js／sidebar.js／icons.js → 全站版本統一 bump `20260629o`→`20260630a`。

驗證：http 起本機站，截圖 light（roster／popup／⋯選單／停用後／中文）存 `screenshots/creators-0x-*-20260630.png`；console 0 JS error（僅 favicon 404）；切中文 0 raw key、摘要即時重譯；check_ds_sync PASS（版本一致、元件齊、TOC），WARN 僅既有 selection-card 裸色。

---

## 2026-06-30 · 行距收成第 4 個原始字型維度 `--lh-*`，Pillar 2 字體 role 矩陣化（D infra · 使用者指示）

- 範圍：`ds-components/_tokens.css`、`design-system.html`（Pillar 1 · 1.2／Pillar 2 · Role）、`design-system.md`（§1.2／§2.3）。
- Pillar 1：新增具名行距刻度 `--lh-*`（6 階 unitless，命名對齊 shadcn/Tailwind `leading-*`、數值調得更緊）：`none 1 · tight 1.1 · snug 1.2 · normal 1.3 · relaxed 1.5 · loose 1.6`。design-system.html 加 1.2.3 行距刻度展示卡（每階附 15px 樣本）。
- 各 `--type-*-line-height` 改為引用 `--lh-*`（如 `--type-body-14-line-height: var(--lh-relaxed)`）。原散落 8 值收進 6 階：3 個標題 1.05→1.1（單行幾無差異）、`label-14` 1.25→1.2；內文 1.5/1.6、caption 1.3 完全保留。
- Pillar 2：把「Typography usage roles」表升級為**標準矩陣**——每 role 一列含 字體·字級·字重·**行距**·字距，行距欄綁 `--lh-*`。design-system.md §2.3 同步同一矩陣。
- 緣由：使用者指出 DS 文件 Pillar 1 的字體只露 字體×字級×字重、沒有行距維度；要求補齊行距並把 Pillar 2 行距「當成用途」矩陣成標準。
- 未動：元件層約 12 種硬寫 `line-height`（含 1.35/1.4/1.45）尚未走 token，列後續清理、不在本次範圍（已於 design-system.md §1.2 註記）。
- 驗證：check_ds_sync PASS（唯一 WARN 為既有 selection-card 主題縮圖裸色例外）。

## 2026-06-30 · Pillar 2 角色重整成六大渲染分類 + 間距虛構 token 修正（D infra · 使用者指示）

- 範圍：`design-system.html`（Pillar 2 整段、Pillar 1 §1.3）、`design-system.md`（§1.3、§2 整段）。緊接同日「行距 `--lh-*`」變更。
- **Pillar 2 重整為六類，每類即時渲染**：2.1 顏色（色票分組：基礎面/文字/主色與邊/狀態/圖表，**只放亮色**）· 2.2 字體（字體家族表＋每個 role 用自身 token 渲染的真樣字＋標準矩陣）· 2.3 間距 · 2.4 控件尺寸（每階擺真 `.btn`＋`.input`）· 2.5 陰影（hairline/micro/card/popover 陰影方塊）· 2.6 跨元件規則（Focus 環、Surface 分層對比、Primary 保留，各附 live 示例）。
- **亮/暗歸位**：Pillar 2 只呈現亮色（角色預設），深色維持在 Pillar 3（§3.1 已有亮↔暗渲染對照）。修正先前「Pillar 2 每格亮暗兩塊」的提案——使用者指出白天黑夜應由 Pillar 3 區分，正確。
- **間距虛構 token 修正（查證後）**：全庫實測 `--gap-tight/default/section/page` **根本不存在**（md §2.2 舊敘述虛構），已移除；`--space-1…16` primitive 已定義但幾乎未採用（僅 `--space-shell-gutter`）、且純 4 倍數缺真實常用的 6/10/14/18。改為誠實標註：間距無語意 role 層、以 ~443 處硬寫 px 為主，密集刻度 `2 4 6 8 10 12 14 16 18 20 24 32 48 64 80`；Pillar 1 §1.3 同步補 2/18/20 與 `--space-*` 現況註記。全面 token 化列後續清理。
- 緣由：使用者要求 Pillar 2 比照 Pillar 1「每項都渲染」、按顏色/尺寸/字體/間距/陰影分類，並把無法歸類者給建議（→ 收斂成 2.6 跨元件規則）；且要求先查證間距實況再修正 DS。
- 驗證：check_ds_sync PASS（唯一 WARN 為既有 selection-card 主題縮圖裸色例外）；TOC 95 錨點全解析；viz helper 與 `.btn`/`.input` 類別均存在且已連入，渲染可成像。

## 2026-06-30 · cheat code 新增「版本」切換（最高級別 gate，讀 md 配置）（D infra · 使用者指示）

- 範圍：`js/devtools.js`（cheat code 面板）、`feature-scope-map.md`（新增「## 開發版本配置」表）、示範標註 `earnings.html`（E08）＋`e-shop.html`（S11 Auctions 分頁）。
- 目的：在 cheat code（Alt＋右鍵）加一個「版本 · Build version」組，當原型「功能存不存在」這條軸的最高級別 gate——選某版本即隱藏/標記不屬於該版本的功能，連帶其下控制項一併失效。與外觀軸（主題/語言/版面）正交、不互相取代。
- 機制（一份 md 當單一真相）：devtools.js 載入時 `fetch('feature-scope-map.md')`，解析「## 開發版本配置」表得版本清單＋規則、解析各 pillar 功能表的 🟢/🔵/⚪ 得「功能→tier」對照。fetch 失敗（file://）用內建後備清單。改 md、重整頁面即重新配置，不必動程式。
- 規則語法：`all`｜`tier:p1,next`（只顯示這些 tier）｜`feat:ID`／`-feat:ID`（加/排）｜`page:原頁=變體`（特殊版換頁）。元素標 `data-feat="S30"` 才會被控制。
- 版本外功能呈現：預設「直接消失」（`.ztd-ver-hidden` display:none）；副開關「顯示未來功能」切成「淡色標記」（`.ztd-ver-future` opacity＋dashed outline）。兩種用途都顧（demo 真貌 vs 對照路線圖）。
- 狀態併入 devstate：`version`（預設 `full`）＋`showFuture`，同步 localStorage＋URL（`?version=p1&future=1`，可分享版本視角），emit 寫 `<html data-version>`。Reset 還原 full。
- 初始版本：最終完整版（full，預設＝現開發目標）／Phase 1＋Next／Phase 1／測試版（特殊，e-shop 換 e-shop-test.html，換頁行為製作時再定）。
- 階段：本輪只做「開關＋讀 md 機制＋2 個示範標註」；107 項逐元素標 `data-feat` 為後續階段一（整模組入口優先）。樣式自包含於 devtools.js（cheat code 工具、非產品元件），不進 ds-components / design-system.html。
- 驗證（node 餵真實 md）：版本清單 4 筆解析正確、107 個功能 tier 全解析；版本判定正確——full 全顯示、p1-next 藏 tbd、p1 藏 next＋tbd、showFuture 改淡色標記。瀏覽器視覺待使用者開頁確認。check_ds_sync PASS。

### 測試版接法定案（2026-06-30，使用者指示「綁測試版切換」）

- 測試版規則由 `page:` 改為 `route:create-project.html=../r2.1_funding-test/create-campaign.html`：切到測試版時，r2.1 所有「建立專案」連結改接另一 session 在做的募資建立流程 `r2.1_funding-test/create-campaign.html`，切回別版自動還原（記 `data-route-orig`）。最終版 href 不動（綁切換、不污染）。
- devtools.js `applyVersion` 加 route 處理（`routesForRule` ＋先還原再套）。`product-detail.html` 的「Open project」（開啟既有專案、非建立）標 `data-route-keep` 排除，不被改接。
- 改動只在 r2.1（devtools.js／feature-scope-map.md／product-detail.html）；不碰 r2.1_funding-test，與其 session 不衝突。
- 部署侷限：deploy.sh 只上 r2.1，funding-test 不在站上、線上點會 404；本機 server（root 設 site）／協作 repo 可達。
- 驗證（node）：route 解析正確、建立專案→create-campaign、Open project 保留、不相干連結不動；server root 設 site 時 projects 與 create-campaign 皆 200。

### 上站方案：複製進 r2.1/funding-test/（部署複本）

- 因部署 repo root＝r2.1 內容（無 `r2.1/` 層）、且 create-campaign 全引用 `../r2.1/`，funding-test 原位無法直接上線（光改 deploy 帶上去，CSS/JS 會 404）。改為複製一份部署複本進 `r2.1/funding-test/create-campaign.html`，並把資源前綴 `../r2.1/` → `../`（子夾往上一層即 r2.1 資源）。route 目標改 `funding-test/create-campaign.html`（本機／線上統一）。
- deploy.sh 不排除 .html，複本隨 r2.1 一起上線；funding-test 的規格 md 不會（排除 `*.md`）。
- **同步維護**：原檔（另一 session 在改）更新後，重跑同步指令刷新複本（在 `site/` 目錄）：`sed 's#\.\./r2\.1/#../#g' r2.1_funding-test/create-campaign.html > r2.1/funding-test/create-campaign.html`
- 驗證：複本 0 殘留 `../r2.1/`、其資源 200；route 解析 `funding-test/create-campaign.html` HTTP 200；線上同層關係成立。

### cheat code 預設載入、手機可用（2026-06-30，使用者指示）

- 起因：手機無法 Alt＋右鍵，開不了 cheat code。
- 改 devtools.js：(1) **預設開啟**（`OPEN_LS !== '0'` 即 open，首次載入就常駐右下角；只有按過 × 才不自動開）；(2) **預設縮成 header bar**（`MIN_LS` 無記錄預設 min，不擋內容，點展開鈕開）；(3) **觸控裝置（`(hover:none) and (pointer:coarse)`）隱藏「×」**，只留縮放，避免手機關了回不來。桌面維持 Alt＋右鍵 toggle／×／Esc。
- 範圍：僅 deploy 上線（已驗證新版 devtools.js 生效），**尚未 collab 進 monorepo**——PR #54 的 devtools.js 仍為無此改動的版本，待下次同步。
- 自包含於 devtools.js（cheat code 工具、非產品元件），不動 design-system。

### 撤回上述手機改動，回原本行為（2026-06-30，使用者指示）

- 使用者：保留關閉按鈕、不要預設開啟。撤回上一筆三項（預設開啟／預設縮 bar／觸控隱藏 ×），devtools.js 回原本——Alt＋右鍵開、預設不顯示、× 永遠在。已 deploy 驗證生效。
- 註：手機（無 Alt＋右鍵）因此暫無法開啟 cheat code；如需手機開法另議（前提：不走預設開、不移除 ×）。

### 首次進站 popup 選版本（2026-06-30，使用者指示）

- 解決手機開不了：devtools.js 加 onboarding popup——每裝置第一次進站跳出 modal（`.ztd-onb`），列出版本選項（讀 VERSIONS），選一個按「確定」即套用該版本（`state.version`→`update()`）並關閉進入畫面，存 flag `ztor.devtools.onboarded` 後不再跳。
- 不違反前面約束：popup 是一次性 onboarding，非常駐面板；devtools 面板本身仍預設不顯示、保留 ×、Alt＋右鍵開。手機首次即可選版本（含測試版→建立專案接 create-campaign）。
- 桌面之後要再切版本走 Alt＋右鍵面板。popup 自包含於 devtools.js，樣式用 DS token，響應式（≤420px 單欄）。已 deploy。

### 版本選項改一行一個＋分組（2026-06-30，使用者指示）

- 版本選項由 2 欄 grid 改**一行一個**（`.ztd__optrow`，名稱＋說明兩行），並**依類型分兩組**（`.ztd__subgroup` 小標題）：開發版本（full／p1-next／p1）、測試版（可多個）。面板與 onboarding popup 共用 `verRows(current, mode)` helper。
- 資料結構加「類型」欄：VERSIONS 每筆 `[鍵,顯示名,類型(開發/測試),規則,說明]`（規則 index 2→3，`curVersionRule`／`parseScopeMd` 同步）；md「## 開發版本配置」表「類型」欄改開發/測試。
- 測試版**用資料夾名當顯示名**：原 `test`／「測試版（特殊）」→ 鍵 `funding-test`、顯示 `r2.1_funding-test`（未來多測試版各用其資料夾名）。已 deploy。
- 另：面板底部加「重新顯示首次 popup」按鈕（`data-act="reonboard"`）——點擊 `localStorage.removeItem('ztor.devtools.onboarded')` 並立即重彈 onboarding popup（`showOnboarding` 開頭加防重複移除），方便測試／手機重看版本選擇，免去手動清 localStorage 或開無痕。已 deploy。

## 2026-06-29 · 商品細節頁補完 media／數位內容檔案／數位交付＋主分類連動（A 規格 · spec 5.1.5.1 §2.3 / D096）

接續 D095，把原標「R 2.1.1 待建」的欄位在 product-detail.html 做完，並由使用者裁示移除規格的「待建」字眼：
- **商品圖片／素材 Media**：「商品內容」卡最上方加素材上傳區——實體＝主圖＋4 附圖（2×2）、數位＝封面＋4 附圖，重用建立商品 5.1.5.2 §4 F1 的 `upload-showcase`/`upload-tile`（dashed 佔位，無真圖、自架不依賴 CDN）。
- **數位內容檔案 Content file（僅數位）**：重用 5.1.5.2 §4.2 F11 的 `upload-tile--file`；**數位交付／存取說明**：stickynote 提示「購買後即時下載／存取，檔案於『內容檔案』管理」。
- **主分類連動顯隱**：主分類 `<select>` 加 id `pd-main-cat`，新增頁面層 IIFE 依選擇切換 `[data-pd-cat="physical|digital"]`——實體顯示（主圖／詳細規格／取貨方式），數位顯示（封面／內容檔案／下載存取），預設實體（Tour zine 範例）。`.field[hidden]` 已由 field-system.css 處理、無 display 蓋掉問題。
- **i18n**：新增 `product-detail.field.media`、`pd.digital-delivery.title/note`（en＋zh）；其餘重用 `cp.media.*`/`cp.cfile.*`。
- **規格同步**：spec 5.1.5.1 §2.3 移除媒體／交付行的「R 2.1.1 待建」與 §2 前言待建註（D096／Plan160），產品定義不變。
- cache：i18n.js 改動 → 全站版本統一 bump `20260629n`→`20260629o`（含新 `upload-tile.css` 連入 product-detail）。驗證：check_ds_sync PASS；Playwright——實體預設顯 3 實體區/隱 3 數位區，切數位反轉、切回還原，0 raw i18n key，hero SVG 44px。

---

## 2026-06-29 · 商品細節頁補「詳細規格」＋主分類對齊（A 規格 · spec 5.1.5.1 §2.3 / D095）

依 spec 5.1.5.1 §2.3（D095）把建立商品已定義、細節頁漏列的欄位補進 product-detail.html：
- **詳細規格 Specifications（僅實體）**：在「商品內容」卡描述／價格之後新增可編輯逐筆「規格名稱＋規格值」列，預填 zine 範例（Material／Size／Pages），＋ 新增規格可加空列、行尾刪除。重用建立商品 5.1.5.2 §4.1② 的列樣式與 `cp.spec.*` i18n；前端 demo（無持久化）。
- **spec-row promote 成元件**：原樣式內聯在 create-product 的 `.cp-spec-row`，第二頁（product-detail）用到，promote 成 `ds-components/spec-row.css`（`.spec-row`）；create-product 同步改用、移除內聯 CSS。DS 頁加 §4.78 demo＋TOC＋index 列、design-system.md 加條目。
- **主分類選項對齊 §7.1／D080**：移除已打散的「Special / Premium」選項，主分類僅留 實體商品（Physical）／數位商品（Digital）／Experiences & Events。
- **media／數位內容檔案／交付細節未做**：spec §2.3＋D095 待辦明標 site R 2.1.1 待建（圖片素材區、數位內容檔案可編輯範圍、交付設定），本輪不建，記 ASSUMPTIONS UIA-018。
- cache：新增 `spec-row.css?v=20260629o`（其餘資產不變、仍 `n`）。驗證：check_ds_sync PASS（spec-row 連入＋demo＋版本一致＋TOC 解析）。

---

## 2026-06-29 · 電子商店 F4 分批載入校正：批量預設 10→25、縮圖 lazy-load 記為慣例（D infra · spec 5.1.5 F4 三類共通 / D094 改版）

依 D094 改版（批量 10→25、縮圖延遲載入）：
- **批量預設 10→25**（使用者裁示）＋ demo 批量改用 25（與規格一致）：先前 demo 取 4 會在 6 筆時誤現「載入更多」（與真實 25 批量矛盾，使用者指出）。改 `BATCH=25`。
- **Demo Products 補滿至 30 筆**（使用者要求，以真實 25 批量展示「載入更多」）：JS `fillDemoProducts()` 於所有 binding 前生成 24 筆樣本列（Live、無圖佔位，套 icons／i18n，故 shop 開關/計數/篩選/拖曳皆涵蓋）。Products 30 筆 → 顯示 25＋載入更多 → 點擊 → 30＋end-cap「已顯示全部 30 筆」。Bundles/Auctions 仍 <25、直接 end-cap。
- **「載入更多」改用無外框按鈕** `btn--ghost`（原 `btn--outline`，使用者指定）。
- Playwright 驗證：30 筆、初顯 25、ghost Load more（border 0/none）、點擊→30＋「已顯示全部 30 筆」、All 計數 30、生成列 Live 徽章中文「已上架」。
- **縮圖 lazy-load**：真實縮圖 `.product-list__image img` 的撰寫慣例＝`loading="lazy"`（僅捲入視窗才抓圖）。**惟本 demo 三類清單為無圖 CSS 佔位（「ztor.」字樣／圖示，自架不依賴 CDN，無真實 `<img>`）**，故依使用者裁示「記成慣例、不放假圖」——記入 design-system.md（product-list「Thumbnail lazy-load」）＋ BUILD-SPEC ＋ ASSUMPTIONS UIA-036；demo 無可見變化、無資產版號變更。
- 待真實縮圖接上時，於 `.product-list__image img` 套 `loading="lazy"` 即生效。

---

## 2026-06-29 · 電子商店 F4 清單分批載入＋end-cap（A 規格 · spec 5.1.5 F4 三類共通 / D094）

依 spec 5.1.5 F4 三類共通「分批載入（Load more）＋全部載完 end-cap」（D094）：
- **e-shop.html**：三類清單共用一個頁尾 `[data-eshop-foot]`（貼在目前可見分頁下方）——未載完顯示「載入更多（Load more）」鈕、全部載完顯示 end-cap「已顯示全部 N 筆」（N＝目前狀態篩選相符總數）。JS：`applyFilter` 改為「相符列只顯示前 `shownCount` 筆」，`updateListFoot` 控制 Load more／end-cap；切換類型分頁、改搜尋、改狀態篩選→`resetBatch()` 回第 1 批；「載入更多」`shownCount += BATCH` 再重套；0 筆走既有「查無符合」（與 end-cap 分流）；語言切換重算 end-cap 文案。
- **批量**：`BATCH = 4`（**demo 值**；spec 預設 10，樣本列少取 4 以展示 Load more，記 ASSUMPTIONS UIA-036）。Products（6 列）→ 顯示 4＋Load more→全 6＋end-cap；Bundles（3 列）／Auctions 直接 end-cap。
- **排序達任一位置**（D094 原則）：demo 清單小、Load more 載完即可全列拖曳；正式門檻（小量全載／大量移到指定位置）屬 BUILD-SPEC（UIA-036）。
- i18n 新增 `e-shop.loadmore`（Load more／載入更多）；end-cap 文案 JS 生成（隨語言）。
- cache bump `20260629m`→`20260629n`。驗證：check_ds_sync PASS；Playwright——Products 顯示 4→Load more→全 6（end-cap「已顯示全部 6 筆」）、Bundles 直接 end-cap「3 筆」、切分頁重置回 4、Sold Out 篩選 end-cap「1 筆」（N 對齊篩選）。

---

## 2026-06-29 · 電子商店 F4 商品狀態欄補「售罄（Sold Out）」徽章（A 規格 · spec 5.1.5 F4 Products / D093）

依 spec 5.1.5 F4 Products 狀態欄列明徽章（D093）：補上「售罄（Sold Out）」，並與「低庫存（Low Stock）」明確區隔、不混用。
- **e-shop.html**：Products 清單加一筆售罄範例列（`data-status="out"`，Enamel pin · wave）——狀態徽章 `badge--neutral`「已售完」（沿用既有 i18n `e-shop.row.out`），stock「剩 0 件」，仍上架、列操作含補貨（Restock，實體售罄可補貨）。售罄篩選（原已有，無對應列）現有一筆、計數＝1。
- **徽章對映**：Live→`badge--success`（綠）／Low Stock→`badge--error`（紅）／Sold Out・Draft・Hidden→`badge--neutral`（灰）。售罄＝庫存歸零、低庫存＝低於門檻仍有貨，灰 vs 紅視覺區隔（D093）。Hidden 維持既有「Shop 關→動態 neutral『已隱藏』」。
- **i18n**：新增售罄範例列欄位 `e-shop.row5.meta/cat/price/stock`；徽章文案沿用既有 `e-shop.row.out`（Sold Out／已售完）。
- **DS 同步**：design-system.html §4.26 product-list 基本 demo 加一筆 Sold Out 列；design-system.md 加「Status badges」對映說明（Live/Low Stock/Sold Out/Draft/Hidden → badge 變體）。
- cache bump `20260629l`→`20260629m`。驗證：check_ds_sync PASS；Playwright——售罄列 `badge--neutral`「已售完」、與 Low Stock `badge--error` 類別/底色皆不同、含 Restock、Sold Out 篩選計數＝1 且只剩售罄列。顯示文案／灰階記 ASSUMPTIONS UIA-035。

---

## 2026-06-29 · 電子商店 F4 清單草稿列空值占位（A 規格 · spec 5.1.5 F4 三類共通 / D092）

依 spec 5.1.5 F4「三類共通——草稿空值占位」（D092）：清單草稿列每一欄都以占位呈現未填值、不留空白。
- **元件**：`product-list.css` 加 `.product-list__title--draft`（淡色、常規字重、斜體）＋`.product-list__empty`（淡色），作為清單列的「草稿／空值」狀態。
- **e-shop.html**：Products／Bundles／Auctions 三類各加一筆草稿範例列（`data-status="draft"`）——名稱→「未命名（Untitled）」、圖片→既有預設 placeholder、次分類／價格／庫存／成員／出價／動態等→「—」；草稿列上架開關預設關閉。Auctions 原狀態集無 draft，本輪補上 `draft` 篩選（STATUS_SETS.auctions）＋草稿拍賣列（Edit→create-auction）。
- **i18n**：新增 `e-shop.draft.untitled`（Untitled／未命名）；Draft 徽章沿用既有 `e-shop.status.draft`。
- **DS 同步**：design-system.html §4.26 Product list 基本 demo 加一筆草稿列、State 表加「draft」列；design-system.md 同步 State 列。
- cache bump `20260629k`→`20260629l`。驗證：check_ds_sync PASS；Playwright——三類草稿列渲染（未命名＋四欄「—」、淡色斜體）、Draft 篩選計數＝1 且只剩草稿列、上架開關 off、auctions 取得 draft 篩選。占位文案（Untitled／—）為 project-ui-creator 依 D092 待辦所定，記 ASSUMPTIONS UIA-034。

---

## 2026-06-29 · 其餘建立頁 footer 一致化：去除多餘「Save for later」、主動作右對齊（C 撤除 · 比照 D090）

把建立組合的 footer 慣例（主動作右對齊、不放多餘「稍後再存」）套到其餘建立頁：
- **create-auction.html**：footer 左側無動作的 ghost「Save for later」移除，`<footer class="wizard__bottom" style="justify-content:flex-end">`（header 已有 Save as draft）。
- **create-project.html**（多步驟）：footer 左側「Save draft」（與 header 的 Save as draft 重複）移除，連同其 JS 綁定（原 `[data-action=save-draft]` alert）一併拿掉以免 querySelector null 報錯；footer 改右對齊，Back／Continue 保留。存草稿統一走 header `data-wizard-savedraft`（wizard-chrome.js）。
- **create-product.html**：footer 早已 `flex-end`、無左側 save-for-later，未動。
- **ip-detail.html**：其「Save for later」是頁內卡片的功能按鈕（`ip-detail.btn.save`，非 wizard footer ghost），保留不動。
- 純呈現／移除冗餘，無資產版本變更（仍 `?v=20260629k`）；驗證：check_ds_sync PASS、Playwright（兩頁 footer flex-end＋主動作靠右、create-project stepper Back/Continue 仍正常、無 console error）。

---

## 2026-06-29 · 建立組合加即時預覽＋上架開關、footer 右對齊、「排程特價」改名「販售排程」（B 反饋＋A 規格 · spec 5.1.5.4 v1.8 / 5.1.5.9 v1.5 / D091）

依使用者反饋：
1. **footer 主動作右對齊**：`<footer class="wizard__bottom" style="justify-content:flex-end">`（比照建立商品；先前移除左側「稍後再存」後按鈕掉到左邊）。
2. **加即時預覽欄**（A 規格 5.1.5.4 §4 F6 確認，比照建立商品 §5.2.5）：`.wizard__body` 改 `preview-split`、表單包入 `.preview-split__form`、新增 `<aside class="preview-col">`＝preview-col head＋`preview-card`（粉絲視角組合卡）。JS 在 recompute 即時更新預覽卡名稱／價格（固定價或折後價）／描述（`.is-empty` 佔位切換）。新掛 preview-card.css／preview-column.css。
3. **加上架開關**（A 規格 F6 確認）：preview-col 內 `control-row`＋`switch`（Show in my shop），沿用 `cp.show`／`cp.show.sub`。
4. **「排程特價」改名「販售排程」**（A 規格 F7／D091）：i18n `cb.sale.title`→販售排程、`cb.sale.activate`→啟用販售排程、`cb.sale.start/end`→販售開始/結束日；create-bundle 與 bundle-detail（透過 i18n）一致。
- 新增 i18n：`cb.preview.heading`／`cb.preview.sub`／`cb.pv.name`／`cb.pv.desc`。spec 同步：5.1.5.4 §4 F6 把「即時預覽卡＋上架開關」由待確認改確認（就緒檢查仍待確認、未建）；§4 F7／§3／§5／§6.1 改名；5.1.5.9 §2.3 改名。
- cache bump `20260629j`→`20260629k`。驗證：validate_spec OK、check_ds_sync PASS、Playwright（footer flex-end＋按鈕靠右、preview-col 可見、show 開關、販售排程改名、預覽卡即時更新名稱/價/描述）全綠。

---

## 2026-06-29 · 建立組合 5 項校正：素材獨立區段／庫存改 selection-card／在庫 disabled／特價日期僅啟用顯示／footer 去「稍後再存」（B 反饋＋A 規格 · spec 5.1.5.4 v1.7 / D090）

依使用者反饋校正前一版：
1. **素材自「組合資訊」拆為獨立區段**（A 規格 5.1.5.4 §4 新增 F8 素材、F1 僅留名稱＋描述／D090）：create-bundle 由一個「Bundle info」段拆成「Show it off」＋「Bundle info」兩個 `form-section`。
2. **庫存版本改用 selection-card**（同定價固定價/折扣卡），取代原 `segmented.radio-cards`；兩頁 `#cb-edition`／`#bd-edition` 改 `.selection-grid`＋`.selection-card`，JS active class 改 `.selection-card--active`；移除兩頁已不用的 radio-card.css／segmented.css link。
3. **目前在庫無值時用 disabled input**（不顯示「—」）：create-bundle `#cb-avail` 初始 `disabled`，recompute 在 n=0 時 `disabled`＋清空、n>0 時解除 disabled 並填 min。
4. **排程特價日期僅啟用時出現**：修 `ds-components/form-grid.css` 補 `.form-grid[hidden]{display:none}`（`display:grid` 原會蓋掉 `[hidden]`，導致起訖日恆顯）；兩頁起訖日 `data-*-sale-fields` 現正確隱藏。
5. **footer 去除「稍後再存／Save for later」**：create-bundle 底部僅留主動作（建立組合）靠右（D090；頂部已有 Save as draft、離開走返回箭頭，spec §3/§F5 本即未列、規格與 UI 一致）。
- 其餘 4 個建立頁（create-product/auction/project、ip-detail）仍有 footer「Save for later」——本輪未動（各有自身 spec），待確認是否一併移除。
- cache bump `20260629i`→`20260629j`。驗證：validate_spec OK、check_ds_sync PASS、Playwright 兩頁重測。

---

## 2026-06-29 · 建立組合／組合細節擴充：素材＋描述＋庫存(Edition)＋排程特價（A 規格 · spec 5.1.5.4 v1.6 / 5.1.5.9 v1.3 / D089）

- 來源：`documents/5.1.5.4-建立組合流程.md` v1.6（D089／Plan153）＋ `5.1.5.9-組合商品細節頁.md` v1.3——依使用者截圖把組合建立擴充成完整流程。
- 改動（沿用既有 ds-components，無新元件）：
  - **create-bundle.html** — F1「組合資訊」加素材（Show it off，`upload-tile` 主圖＋2×2 附圖，沿用建立商品 §4 F1）＋描述（`textarea`）；F4 由「限量」改「庫存」＝Edition `segmented.radio-cards`（不限量／限量）＋唯讀「目前在庫」`input[readonly]`（即時＝min(成員,上限)）＋限量才出現的「組合上限」；新增 F7「排程特價」＝`control-row`＋`switch`（啟用）＋兩個 `input[type=date]` 起訖日。
  - **bundle-detail.html（5.1.5.9）** — 同步加描述＋素材＋庫存(Edition＋唯讀在庫)＋排程特價；%off 由單欄改「折扣後價格＋折扣趴數」雙欄（對齊 D088）；底部卡由「庫存＋影響」改為純「成員影響」（庫存已移入內容卡，去重）。
  - 新增 ds-component link：create-bundle 與 bundle-detail 皆補 upload-tile／radio-card／segmented／control-row／switch／form-grid。
  - JS：Edition 切換顯隱上限欄、唯讀在庫＝min(成員,上限) 即時重算、排程特價 toggle 顯隱起訖日；Create gating 加「限量需有效上限」「啟用特價需起訖日且結束晚於開始」（§6.1）。素材／描述為 demo、**不納入 gating**（見 ASSUMPTIONS UIA-033）。
  - i18n 新增 `cb.media.*`／`cb.desc*`／`cb.stock.title`／`cb.edition.*`／`cb.total*`／`cb.avail.*`／`cb.sale.*`＋`bd.impact.title`（en＋zh）；素材通用鍵沿用 `cp.media.dnd/formats/min600`。
- 產品待確認（記 ASSUMPTIONS UIA-033、spec §4 F7）：特價價格來源、時區、結束回原價、是否與單品共用排程——UI 標「pending spec」、不自創價格欄。
- cache bump `20260629h`→`20260629i`。驗證：check_ds_sync PASS、Playwright 兩頁互動。

---

## 2026-06-29 · 建立組合表單欄位標題＋折扣雙欄連動（A 規格 · spec 5.1.5.4 v1.5 / D088）

- 來源：`documents/5.1.5.4-建立組合流程.md` v1.5／decisions D088——使用者裁示組合建立頁四項。
- 改動（`create-bundle.html`，皆沿用既有 `.form-section`／`.field`／`.field__label`／`.field__hint`，無新元件）：
  1. **組合名稱**區段補區段標題「組合包資訊（Bundle info）」（`form-section__head`）。
  2. **固定價** input 補 label「固定價」；「組合價不得高於成員原價合計」維持為該 input 的描述（既有動態 `#cb-price-hint`）。
  3. **折扣（% off）** 由原「待補」單一 % 欄改為兩個連動欄位：折扣後價格（`#cb-disc-price`）↔ 折扣趴數（`#cb-disc-pct`），填一欄另一欄即時依成員原價合計 S 換算（價＝S×(1−%/100)、%＝(1−價/S)×100），以最後編輯欄為準；S＝0 提示先加入成員；折扣後價 > S 擋建立（D088）。
  4. **限量** input 補 label「總數量（Total quantity）」。
- i18n 新增 `cb.info.title`／`cb.price.discounted`／`cb.price.pctoff`／`cb.price.disc-hint`／`cb.disc.addfirst`／`cb.limit.label`（en＋zh）；移除已具規格的 `cb.price.pct-note`。
- 無元件／token 變更，design-system 無需同步。cache bump `20260629g`→`20260629h`。
- 驗證（Playwright，cache-bust，DOM eval）：選 2 成員（$11+$12＝$23）後切 % off →填 50% 得折後價 $11.50、填折後價 $20 得 13%、提示「省下 $3.00 相對成員合計 $23.00」；區段標題「組合包資訊」、固定價／總數量／折扣後價格／折扣趴數 label 皆渲染（zh）。check_ds_sync PASS；validate_spec PASS。

---

## 2026-06-29 · 平台營運（Admin）層＋Creator 管理頁（A spec · 5.1.0 / D086）

- 範圍：依新規格 `documents/5.1.0-Creator管理.md`（D086）在現有單一創作者工作區之上加 Admin 視角。新增 `creators.html`（Tier 0：creator 名冊 F1＋建立 creator F2／自動生成 eShop 為 demo＋進入與返回 F3）。改 `sidebar.js`：roster 頁只露 Creator 管理 marker＋Tier 1 各模組鎖定（`.app-topbar__link--locked`）；進入 creator 後 logo 前加返回名冊 icon＋「管理中 <creator>」標示、導航解鎖。`devtools.js` 加「Creator · Admin」cheat code 切換／清除 activeCreator。`icons.js` 補 arrow-left／shield-check。`shared.css` 加 `.app-topbar__back/__context/__link--locked` 與 sidebar 對應。i18n 補 admin.* / creators.* 鍵。
- 動機：站台改為 Beamco 內部 Admin 工具——Admin 管理多個 creator、選定後代為操作其工作區（使用者裁示；上游 PRD §3.3 #3 帳戶切換為部分依據）。v1 僅 Admin 代操、無登入頁、creator 自助 SSO 為 phase 2。
- 三種導航面貌（依 activeCreator，2026-06-29 依使用者反饋修正）：**一般創作者**＝未選 creator → 純 dashboard、無 admin chrome（即之前的版本）；**admin 代管**＝從名冊 Manage 選定 → logo 前返回 icon＋「管理中 X」；**名冊頁**＝Creator 管理 marker＋Tier 1 鎖定。早期「Tier 1 預設帶第一個 creator」已移除——未選就是一般創作者視角，admin chrome 只在真的代管時出現。
- A 實作：`window.ztorCreator`（list/get/set）為單一來源，creators.html 與 devtools 共用；activeCreator 存 localStorage、變更派 `ztor:creator-changed` 由 sidebar 重繪。返回入口依使用者裁示固定置於導航 logo 之前（D086）。
- 待確認（記 ASSUMPTIONS UIA-029..032）：creator 工作區範圍已確認＝完整現有工作區；建立 creator 必填欄位、店鋪識別唯一性、代操稽核、creator 狀態枚舉仍待上游（D086／§8.3）。
- 驗證：check_ds_sync PASS（版本統一 20260629e）；Playwright——roster 3 筆＋7 模組鎖定＋無返回鍵、Manage→index.html 返回鍵在 logo 前＋管理中 Denise＋導航解鎖、cheat-code 切換即時、i18n 無殘留 key、空狀態 `[hidden]` 修正。

## 2026-06-29 · 建立流程 header 新增「儲存為草稿」二級鈕（A 規格）

- 範圍：全 6 建立流程頁 header 的儲存狀態旁——`create-product` / `create-auction` / `create-bundle` / `create-event` / `create-project` / `register-ip`。
- 改動：自動保存指示器右側新增 `btn btn--outline btn--sm`（本 DS 二級按鈕）「儲存為草稿」鈕（i18n `wiz.savedraft`）。
- 行為：手動「儲存為草稿」同時觸發自動儲存示意（寫入自動儲存紀錄）；離開頁面時以最後一次自動儲存的紀錄為準。標準頁由共用 `partials/wizard-chrome.js` 的 `[data-wizard-savedraft]` 接（`edited=true`＋`autosaveTick`）；`create-event` 用自有狀態 JS，於該頁把按鈕接到 `scheduleSave`。
- 規格：同步寫入 `documents/0-設計規格書.md §5.2.4 建立流程共同行為` 輸出內容段（草稿儲存＝自動＋手動並行、離開以自動儲存紀錄為準）。
- 緣由：開發回饋自動儲存有延遲/切頁失敗、無校驗等風險；提供明確手動存檔點。用字對齊既有 wizard 文案「儲存」（非「保存」）。
- 用既有 `btn--outline` 變體，無新增元件，DS 不需新 demo。

### 2026-06-29 後續調整（B 反饋）

- 「儲存為草稿」鈕改用**元件庫標準尺寸**（移除 `btn--sm` → `btn btn--outline`），全 6 建立頁同步。
- 返回離開確認彈窗（`partials/wizard-chrome.js` 注入、`.wizard-leave*` 樣式於 `shared.css`，屬共用 wizard chrome、非正式 ds-component）：第二顆「不儲存就離開」由 `btn--ghost` 改 `btn--outline`（有線框）。

### 2026-06-29 後續調整二（A 規格 / D infra）

- **返回離開確認彈窗 promote 成正式元件**：自 `shared.css` 的 `.wizard-leave*` 搬出 → `ds-components/leave-dialog.css`（class 改名 `.leave-dialog*`），`partials/wizard-chrome.js` 注入端同步改名。6 建立頁加掛 `leave-dialog.css`。涵蓋兩個型態（有未存編輯→問儲存；未編輯→純離開）。
- DS 同步：design-system.html 加 4.77 Leave dialog demo（兩態並列）＋ TOC「Overlays & dialogs」連結＋ 元件登錄列＋ head link；design-system.md 加元件條目。scrim 改用 `var(--overlay-tint)` token（消除裸色 WARN、對齊 modal backdrop 慣例）。
- **「儲存為草稿」鈕按下即 disable、存完（700ms）回 active**：邏輯加在 `wizard-chrome.js` 的 `[data-wizard-savedraft]` handler（`btn:disabled` 視覺由 button.css 既有 `opacity:.45` 提供），6 頁通用；create-event 自有狀態 JS 路徑亦適用。

## 2026-06-27 · 建立商品「定價」新增成本價（Cost）（A 規格 · spec 5.1.5.2 F3.2／D085）

- 來源：`documents/5.1.5.2-建立商品流程.md` v5.2／decisions D085——定價新增「成本價（Cost）」（選填、創作者內部成本、不對買家顯示；多規格時走逐規格表既有 Cost 欄）。
- 改動：`create-product.html` 單一規格「定價」卡（`section[data-when-var="single"]`）在 價格／原價 後新增成本價欄位 `#cp-cost`（沿用既有 `.field`＋`.input`，非新元件）；label「成本價·僅自己可見」、hint「選填」。i18n 新增 `cp.cost`／`cp.cost.note`（en Cost／creator only；zh 成本價／僅自己可見）。逐規格表（多規格）的 Cost 欄本來就有，未動。
- 無元件／token 變更，design-system 無需同步。cache bump `20260629c`→`20260629d`。
- 驗證（Playwright，cache-bust）：定價卡渲染 價格＊／原價／成本價 三欄、i18n 中英皆套用、成本價標選填；check_ds_sync PASS（裸色 WARN 為既有 selection-card）。截圖 `screenshots/cost-field.png`。

## 2026-06-26 · wizard header 加 Header shadow（A 規格 · 參考 Figma 720:1763）

- 依 Figma（node 720:1763「Header shadow」）：sticky wizard header（`.wizard__top`）下緣加一道「內縮、淡」的陰影，把 header 與下方捲動內容分開（取代舊的無分隔）。
- 實作：`.wizard__top::after`（absolute，不參與 flex）——左右內縮 28px 對齊內容區、`top:100%`、bottom 圓角 64px 讓兩端漸淡、`box-shadow:0 2px 16px rgba(0,0,0,0.08)`（同 Figma 值）。改 shared.css 一處，6 個 wizard 建立頁全生效。
- 同步 design-system「Wizard frame」(4.50) spec Anatomy/Behavior 描述。
- 驗證（Playwright）：捲動時 header 下方出現淡陰影、內容捲到其下；check_ds_sync PASS。cache `20260626b`。

- 追加（同日）：Header shadow 加強到可見——Figma 原值 `0 2px 16px rgba(0,0,0,0.08)` 在瀏覽器（白底、頁頂無內容捲入時）幾乎看不見，改 `.wizard__top::after` 為 `height:10px; 左右內縮 24px; box-shadow:0 6px 16px rgba(0,0,0,0.16); border-radius 0 0 40px 40px`，明顯但仍柔和。DS spec 同步此值。cache `20260626c`。

- 追加（同日）：Header shadow 改法——原本用 `.wizard__top::after` 帶圓角的 10px 陰影帶，兩端會像「色塊突出」。改成直接給 `.wizard__top` 一道 `box-shadow: 0 8px 16px -8px rgba(0,0,0,0.16)`（y8 只往下、負 spread -8 從兩側內收），乾淨柔和、不突出色塊。移除 ::after。DS spec 同步。cache `20260626d`。

- 追加（同日）：Header shadow 改回忠實 Figma 720:1763 的**分層色塊結構**（使用者確認）——`.wizard__top::before`：與 header 同色的色塊藏在 header 後方，高度＝header、左右各內縮 28px（＝header 內容 padding）、下方圓角 64px、`box-shadow:0 3px 16px rgba(0,0,0,0.10)`、`z-index:-1`。色塊被 header 蓋住、只露出下緣陰影，大圓角讓兩端漸淡（取代前一版直接 box-shadow 在 header 上）。DS spec 同步。cache `20260626e`。

- 追加（同日）：Header shadow 修掉「上緣/兩側陰影外漏（像浮卡）」——`.wizard__top-bar` 改 `background:inherit; position:relative`，當作不透明的上層蓋住 `::before` 色塊的上緣與兩側陰影（比照 Figma「header 在上層」的兩層結構），只露出下緣陰影。視覺對齊 Figma 720:1827「合併」狀態。cache `20260626f`。

- 追加（同日）：Header shadow 值收進 Foundation token——新增 `--shadow-header`（light `0 3px 16px rgba(0,0,0,0.10)`／dark `0.45`）於 `_tokens.css`，`.wizard__top::before` 改引用 `var(--shadow-header)`，不再寫死。design-system.html（Pillar 1 陰影表＋色票）與 design-system.md 陰影 token 表同步收錄；wizard-frame spec 改引 token 名。cache `20260626g`。

## 2026-06-26 · Header shadow 抽成可覆用工具 .edge-shadow（D infra · 使用者指定圓角 taper）

- 把「下緣柔和、內縮、兩端圓角漸淡、不外漏」的陰影做法抽成共用工具 **`.edge-shadow`**（shared.css）：`::before` 與元素等高、左右內縮（`--edge-shadow-inset` 28px）、下方圓角（`--edge-shadow-radius` 64px）投 `--shadow-header`，再 `clip-path: inset(100% 0 -40px 0)` 只露下緣 → self-contained，不需不透明上層遮蓋（取代之前 header 的 `.wizard__top-bar` cover hack）。用 `::before` 避開用 `::after` 的元件。
- **wizard header**：`.wizard__top` 內建套用（移除舊 ::before 色塊＋bar cover）。
- **電子商店貼頂庫存條**：`#eshop-stock-bar` 加 `edge-shadow` class、重申 `position:sticky`、關掉 `.alert--page-top::after` 角遮罩、移除原本各做一套的漸層帶 → 與 header 同一套陰影。
- DS：design-system.html Pillar 1 · 1.5 陰影 加 `.edge-shadow` 工具說明；design-system.md 元件表加「Edge shadow（工具）」列；Wizard frame 規格改引用工具。
- 驗證（Playwright）：header 與庫存條的 ::before 皆 `--shadow-header`＋clip、只露下緣、不外漏；庫存條仍 sticky。check_ds_sync PASS。cache `20260626j`。

## 2026-06-26 · 電子商店主工作列陰影改忠實 Figma 兩層結構（B 反饋 · 參考 Figma 720:2165）

- 範圍：`e-shop.html` 的 `.eshop-list-topbar`（商品/組合/競標 tab＋動作列那條）。
- 改動：**移出共用 `.edge-shadow`**，改照 Figma node 720:2165 的兩層結構自做——主體層（對齊 Figma Container 720:2167）給**不透明底 `--surface-page`＋下緣圓角 12**，陰影層（對齊 Figma shadow 720:2166）以元素自身 `box-shadow: 0 6px 14px -4px rgba(0,0,0,0.16)`（深色白光 0.12）呈現。markup 拿掉 `edge-shadow` class，刪掉用不到的 `--edge-shadow-*`／`--shadow-header` 覆寫與 clip 覆寫。
- 動機：`.edge-shadow` 用 `clip-path` 水平直切，只能讓陰影兩端淡出，做不出 Figma「白色主體圓角咬進陰影」的缺口；且本工作列原本透明、沒有不透明主體承載圓角，圓角根本不顯。給不透明底後，圓角元素的 `box-shadow` 會自然沿圓角邊緣走，圓角陰影才成形；y6＋負 spread -4 收成主要往下、兩側內縮（模擬 Figma 陰影左右 inset、上緣不外溢）。
- 驗證（Playwright，淺/深色）：工作列下緣柔影沿左右下圓角收尾、上緣不外溢；深色為白色微光。截圖 `screenshots/eshop-topbar-v2-full.png`／`eshop-topbar-v2-dark.png`。

## 2026-06-25 · DS token 對齊 shadcn＋暗色實色＋控件尺寸＋focus 統一（B 反饋 · issue #11）

- 範圍：ztor 工程端 jaskang 在 GitHub issue #11 提 5 點。`ds-components/_tokens.css` 重訂 Role 層；60 元件 CSS＋shared.css＋全頁面＋JS 以邊界安全 sed 換名；design-system.html（Role/Mode/Foundation/控件尺寸/focus）＋design-system.md＋BUILD-SPEC 同步；`project-ui-creator` skill 加 6 條規則。
- 動機：下游用 shadcn 出貨，token 命名對齊可直接複用元件、AI 更好接（jaskang）。
- **A 改名**：`--surface→--card`、`--surface-muted→--muted`、`--foreground-subtle→--muted-foreground`、`--surface-rail→--sidebar`、`--surface-rail-hover→--accent`、`--status-error→--destructive`；補 shadcn 全集（card-foreground / popover(-foreground) / secondary(-foreground) / accent-foreground / destructive-foreground / input / chart-1..5 / sidebar 整組）。creator 獨有保留為 `[ext]`。對齊語意、值不變、品牌橘仍 `--primary`。
- **B 暗色實色**：主要面（background / foreground / card / muted / sidebar / border）由 rgba 疊層改實色 hex（值在 #191A1A / #2B2B2C 上算出、外觀不變）；半透明只剩 backdrop-blur overlay；`--ring` 暗色改繼承品牌橘（不再白）。
- **B 控件尺寸**：新增 `--control-h-*`=28/36/44/52/60（÷4）＋ 4px `--space-1..16`；button / input / field-pill / tag-input 共用、input↔button 同尺寸等高；button / input 補 `--xs`/`--xl`。default 維持 44（未改 shadcn 的 36）。
- **B focus 統一**：原 4 種寫法（outline×2 色 + box-shadow halo×2）收斂成單一 `outline: 2px solid var(--ring); outline-offset: 2px`（清單列 `-2px`）；filter-tabs / tabs 的 `--primary` 改 `--ring`。
- **B 小數**：chart 2.5px、waterfall / upload 1.5px、alert calc −0.5px、shadow 次像素 → 整數。
- **裁示（無障礙）**：a11y 規則一律最低優先、只建議、不當實作通則、不阻擋交付（已寫進 skill）；橘 ring 低對比僅記風險、保留品牌。
- 驗證：rename 後 consumer 殘留 grep = 0；check_ds_sync PASS；Playwright 亮/暗目視 + 控件等高 + focus 一致。

## 2026-06-25 · create-auction 改版成無卡片版（B 反饋 · 5.1.5.10，逐頁 migration #1）

把 create-auction 從舊 card 版改成 create-product 的無卡片版面、套用新元件。
- 區段：9 個 `.card ca-section` → `.form-section`（無卡片、標題18／灰副標／分隔線）；種類選擇卡另包成最前的 form-section。
- 控件：`.ca-two-col`/`.ca-price-row` → `.form-grid`；`.ca-show-row`（密封終局/得標者付運費/上架開關）→ `.control-row`（有外框列）。
- 預覽：滑出式 `.preview-panel` → 表單旁 `.cp-preview-col`（sticky 兩欄，preview-card 內移、#ca-pv-* ID 保留）；就緒檢查 `.readiness` 移到 footer chip 的 hover tooltip（`.ca-ready-pop`，比照 create-product）。移除 preview-panel.css link 與 `body.preview-open`。
- 黑夜版：維持 shared.css 全域預設（content #2B2B2C／footer #191A1A）；對調僅 create-product。
- 驗證（Playwright）：兩欄 sticky 預覽、10 區段無卡＋分隔線、control-row 外框、就緒 tooltip、預覽即時更新、種類切換連動隱藏對應區段、無重複 ID。check_ds_sync PASS。

- 連動元件改動：`selection-card.css` 已選樣式由「淡橘底＋2px 環」改為 **ring-only（卡面陰影＋1.5px 橘環、不換底色）= 建立流程標準**（使用者指定全建立流程一致）；含 swatch 的卡（Settings 主題挑選器）以 `:has(.selection-card__swatch)` 維持原淡橘底。同步 design-system.html selection-card 的 active 敘述。影響所有用 `.selection-card` 的頁面（create-product 型別卡、create-auction 種類/時長、之後各建立頁）；Settings 主題挑選器不變。

## 2026-06-25 · 其餘建立頁套用無卡片版（B 反饋，逐頁 migration #2–5）

承 create-auction，其餘 4 頁也改成無卡片＋新元件（每頁畫面截圖給使用者確認）。

- **create-bundle**（5.1.5.4）：4 個 `.card cb-section` → `.form-section`；無預覽面板/就緒檢查（本頁本來就沒有），單欄；其餘 bundle 專屬 class（cb-add-tile/cb-summary/cb-price-input…）保留。
- **create-event**（5.1.5.x，stepper）：表單步驟本就是無卡片 `.ce-block`；Review 步驟 4 張摘要 `.card` → 無卡片摘要列（`.ce-review-row`：標題＋Edit→ 一行＋底線分隔）；選擇卡已隨 selection-card 改 ring-only。
- **create-project**（stepper）：全頁 19 處 `.card`/`.card--muted`（型別欄位群組＋摘要）以頁內 override 一次去卡面（透明底/無框/無陰影，`!important` 蓋 inline padding），有 head 的摘要改底線分隔列；型別卡已 ring-only。
- **register-ip**（stepper）：3 張 review `.card` 同法去卡面改分隔列；自訂 `.ri-usage__card--active` 由淡橘底改 **ring-only**（與選擇卡一致）；表單 `.ri-block` 本就無卡片。
- 黑夜版：這 4 頁維持 shared.css 全域預設（對調僅 create-product）。
- 驗證（Playwright，逐頁）：各頁 0 卡面殘留、stepper/條件顯示/即時預覽正常、ring-only 生效。check_ds_sync 全程 PASS。
- cache 全站 bump → `?v=20260625a`。

## 2026-06-25 · design-system.html 元件導覽功能分組 + 頁面 dead code 清理（D infra）

稽核發現 Pillar 4 元件導覽零散，逐項修：
- **TOC 功能分組**：原本 ~60 個元件平鋪在「Pillar 4 · Component」下一條清單，重整成 12 個功能次分組（Primitives／Form & fields／Selection controls／Lists & tables／Cards & tiles／Navigation & chrome／Create-flow／Preview／Overlays & dialogs／Feedback & status／Data viz／Media & hero），新增 `.toc__subgroup` 小標樣式（比 Pillar 標題輕）。
- **補齊漏掛的 TOC**：原本有 demo 區段但側欄找不到的 16 個元件全部補進（char-counter／completeness／embed-modal／empty-card／event-preview-card／insight-row／list-footer／message-modal／msg-token／notification-matrix／product-post／split-button／status-axes／store-settings／tag-input／variant-builder）。TOC 元件連結 60→77。
- **demo 區段未動**（錨點不變，零破壞）；check_ds_sync TOC 錨點 79→95 全解析、PASS。
- **頁面 dead code**：create-product 移除已失效的 preview-panel.css link＋`@media 760px #cp-preview` 區塊（預覽早已改 inline `.cp-preview-col`，無對應元素）。經查各頁無真正重複 `<link>`（先前「2×」是 grep 命中註解、非重複標籤）。
- 未做（待定）：demo 區段的檔案順序與編號（4.22b–p／4.29c–i 傾倒場、4.49–52 脫序）僅捲動時可見、屬較大改動；Segmented vs Segmented control、Composer vs Message composer 是否合併需上游決定。

## 2026-06-25 · design-system.html 區段重排＋重編號＋去重稽核（D infra，續）

- **demo 區段照功能分組重排**：用腳本把 Pillar 4 的 79 個 `<section class="sub">` 依 12 分組（同 TOC）重新排序，捲動順序＝TOC 順序（錨點不變、零破壞）。
- **重編號**：原本 4.0–4.48 夾雜 4.22b–p／4.29c–i／4.49–52 脫序，重編成連續 **4.0–4.78**（4.0 分類、4.1 清單、4.2 起為元件）；含字母/下標的怪號（如 4.22f₂ Fan store）一併正規化。
- **交叉引用同步**：內文 72 處 `§4.NN` 依舊→新對照表重映，連結仍指向同一元件（pre-existing 的 §typo 如 data-list 誤指 Table 維持原狀、未惡化）。
- **去重稽核（task 2）**：查 Segmented(4.22) vs Segmented control(4.23)、Composer(4.68) vs Message composer(4.66)——皆**非真重複**：Segmented 用 `.segmented__btn`(segmented.css)、Segmented control 用 `.segmented__item`(chart.css，圖表區間切換)；兩組 Composer 也是不同元件。原本看似重複是因為「散在不同位置」，重排後已相鄰，不刪併（刪會丟掉合法 demo）。可改名消歧（如 Segmented control→Chart range toggle）待使用者定。
- 驗證：79 區段、編號 4.0–4.78 連續無重複無殘字母、95 TOC 錨點全解析、捲動順序＝分組；check_ds_sync PASS。備份 /tmp/design-system.bak.html。

## 2026-06-25 · design-system.html 同類型元件合併（D infra，續）

依使用者「同一 UI 類型＋變形歸成一類」原則，把 3 組變形元件併進母類型區段（demo＋dev 細節折入，刪獨立區段＋TOC 項，母區段加「Variant · X」分隔）：
- **Split button → Button**（4.2）
- **Filter tabs → Tabs**
- **Event preview card → Preview card**
維持獨立（使用者未選）：Segmented/Segmented control、Empty stub/Empty card、Selection card/Radio card。
- 連動：區段 79→**76**、重編號 **4.0–4.75** 連續、§4.NN 交叉引用同步重映、指向已併 id 的內文/overview 連結改指母錨點（#button/#tabs/#preview-card）。overview 速查表與 design-system.md 仍保留 3 列（連母錨點）當可搜尋清單。
- 驗證（Playwright）：Button 區段內含「Variant · Split button」＋ live demo；無獨立 split-button 區段；TOC 無該項；§4.5 正確指向 Chip。check_ds_sync PASS（92 錨點全解析）。備份 /tmp/ds.preMerge.html。

- 追加（2026-06-25）：create-product 即時預覽欄標題改成「標題＋描述」兩段——標題＝**商品預覽**（新 i18n `cp.preview.heading`），描述＝**買家在 Ztor 看到的樣子**（沿用原 `cp.preview.title`）；新增 `.cp-preview-col__sub`（fs-14 muted、margin-top 4px），與區段標題（form-section__head）風格一致。

- 追加（同日）：把「即時預覽欄」promote 成元件 **`preview-column.css`**（`.preview-split` 兩欄＋`.preview-split__form`＋`.preview-col` sticky＋`__head/__title/__sub`；sticky top 用 `--preview-col-top` 預設 96）。create-product 與 create-auction 移除頁內重複的預覽欄/兩欄 CSS、markup 改用元件 class（`cp-preview-col`→`preview-col`、`cp-form-col`→`preview-split__form`、`wizard__body`+`preview-split`），頁內只留本頁寬度/上內距與 embed 隱藏。三件套：css＋design-system.html demo（Preview 群組 4.55 Preview column）＋design-system.md 條目。驗證（Playwright）：兩頁 split 584/320、preview-col sticky top 96、標題/描述正常；DS demo 渲染完整。check_ds_sync PASS（61 元件、93 錨點）。

- 追加（2026-06-26）：selection-card 已選態從元件改——
  - 橘色改成**線框**（`outline:1.5px solid var(--primary); outline-offset:-1.5px`），box-shadow 維持中性 `--shadow-card`（不再把橘色放進陰影，依使用者「陰影不該有橘色、應該是線匡橘色」）
  - icon 變體的 icon 由 `--foreground-muted`(#4D4D4D 偏深) 改 `--muted-foreground`(#737373 較淺的灰)
  - 移除 `.selection-card--icon.selection-card--active` 的重複規則（全域 active 已涵蓋）。主題挑選器（含 swatch）以 `:has()` 例外＋`outline:0` 維持原本「淡橘底＋2px 環」不變。驗證：建立流程卡 outline 1.5px 橘、陰影無橘、icon #737373；swatch 卡 outline:0、保留 tint＋環。check_ds_sync PASS。

- 追加（2026-06-26）：統一所有「選擇外匡」已選態為 **1px 橘色線框（outline）＋中性陰影**，從元件改：selection-card 1.5px→1px；radio-card（`.radio-cards .segmented__btn--active`）由 `0 0 0 2px` box-shadow 環改 `outline:1px`（radio 點維持）；register-ip `.ri-usage__card--active` 1.5px 環改 1px outline。tinted 例外（主題挑選器 swatch、ri-tag）維持原樣不動。同步 design-system 的 selection-card／radio-card spec 文字（1.5px/2px→1px outline）。cache bump→`20260626a`。驗證：type/radio 卡 outline 1px 橘、陰影無橘；check_ds_sync PASS。


## 2026-07-06 · 取貨管理拆真實獨立頁（C 撤除單頁 tab 切換 / A 新增 pickup-detail.html＋pickup-roster.html）

- 對照規格（5.1.5.11／5.1.5.13／5.1.5.15）檢查原型，發現 `pickup.html` 原是單一檔案靠 `data-pickup-view` 切 list/detail、detail 內再用 `.tabs` 切 items/roster/log——皆為 JS 內部狀態切換、無獨立網址，分享連結、加書籤、重新整理都停不到原本畫面，與規格「各自獨立頁」不符。使用者裁示修正。
- **C 撤除**：`pickup.html` 移除整個 `data-pickup-view="detail"` 區塊（場次標頭、Scanner access、items/roster/log 三個 tab-panel）與對應 JS（showDetail/showList 切換、`.tabs` 分頁邏輯、scanner-access 開關/重設/複製、roster/log 篩選）；改為真連結導覽。
- **A 新增** `pickup-detail.html`（5.1.5.15 取貨場次詳情）：場次基本資訊（名稱/狀態/地點/時間/編輯入口）、Scanner URL 與密碼（原 F6，QR/複製/重設/停用/密碼）、核銷紀錄（原 F8，篩選+匯出），三段由上到下堆疊、不用 tab；提供「查看可核銷項目與取貨/入場名單 →」連到 pickup-roster.html。
- **A 新增** `pickup-roster.html`（5.1.5.13 取貨與入場名單）：可核銷項目（原 F4，取貨商品清單+活動票券清單+加項按鈕）、取貨/入場名單（原 F5，狀態篩選+搜尋+名單列），兩段堆疊、不用 tab。
- **pickup.html** 收斂為純清單頁（F1 頁首／F2 摘要／F3 清單工作列／F4 取貨清單）：kebab「Open」改真連結 → pickup-detail.html；「可核銷項目摘要」meta 文字改連結 → pickup-roster.html；「Edit session」改直接開建立/編輯 popup（不再繞經詳情頁）；「Copy URL」改讀每列各自的 `data-pk-url`（新增於 active/scheduled 兩列），不再依賴僅存在於舊 detail view 的單一 `[data-pk-url]`。移除頁面不再使用的 `tabs.css`／`status-axes.css` 引用。
- **呈現假設**（ASSUMPTIONS UIA-047）：三頁皆為單一固定 demo 場次（Taipei signing），不依 `?id=` 動態切換內容，與其他既有 detail 頁（product-detail 等）現況一致；若要支援「分享連結直接開到指定場次」需另補依 ID 動態渲染，屬上游待確認。
- i18n：拆 `pk.row1.meta`／`pk.row2.meta`／`pk.row4.meta`（原本混著地點/件數/時間一長串）為「件數」＋新 `pk.rowN.time`；新增 `pk.f8.title`／`pk.detail.sub`／`pk.detail.viewroster`／`pk.roster.sub`。全站 i18n.js cache-buster 統一升版；`check_ds_sync` PASS（僅既有 raw-color WARN，未新增）。

## 2026-07-06 · 移除「有待設定取貨商品」提示卡（C 撤除）

- 對應規格 D120：使用者裁示移除「有待設定取貨商品（Needs Setup）」整個頁面狀態與提示，不只是先前 D113 拿掉的 F2 計數 KPI。
- `pickup.html` 移除 stickynote 提示卡（`data-pk-needsetup`，「2 sold items… use on-site QR pickup but aren't in any session yet.」）；i18n 移除 `pk.needsetup` key；連帶移除頁面不再使用的 `stickynote.css` 引用。
- 不動品項層級狀態「取貨場次待設定」（§7.2）——那是不同概念，商品/訂單頁仍看得到，只是取貨管理頁不再主動彙總提醒。
- i18n.js cache-buster 全站再升一版；check_ds_sync PASS。

## 2026-07-06 · 取貨清單改對齊規格分類（B 反饋 / A 補齊）

- 使用者發現 F3「建立取貨場次」按鈕位置不對（原本放在 F1 頁首，規格 F3 清單工作列本身就該含建立入口）——移到搜尋收合按鈕旁邊，對齊電子商店 F3 慣例（搜尋在前、建立在後，同一排）。
- F4 取貨清單逐項拆欄，不再把地點/時間/統計都塞進同一個儲存格文字：原本「Session」欄位混了地點、件數、時間、待核銷/已核銷/有問題三個統計數字；現在拆成「取貨場次（只留名稱＋可核銷項目摘要連結）」／「取貨地點與時間（合併一欄）」／「待核銷」／「已核銷」／「有問題」五個獨立欄位，對齊規格 F4 逐條列舉的欄位定義。「未到場（No-show）」摘要併入「已核銷」欄旁註記顯示（部分核銷目前無 demo 資料、暫不單獨拆欄）。
- 補齊 F4 缺漏的列操作「顯示 scanner QR code」（連到 pickup-detail.html#scanner）。
- `.product-list--pickup` grid-template-columns 由 5 欄擴為 9 欄；i18n 新增 `pk.col.loctime/pending/redeemed/issues`、`pk.rowN.loctime`（取代原本拆開的 `.meta`/`.time`）；`pk.stat.noshow` zh 由「未領取」改「未到場」，對齊規格 D119 用詞。

## 2026-07-06 · 5.1.5.13 整份退役，內容併入 scanner.html 與 pickup-detail.html（C 撤除 / A 補齊）

- 對應規格 D121：使用者裁示「取貨與入場名單」應同時出現在取貨場次詳情與手機 Scanner 兩份文件，確認後 5.1.5.13（原規劃的獨立 pickup-roster.html）整份退役，內容重新分配：
  - **可核銷項目**（原 pickup-roster.html F1）→ 併入 `scanner.html`，新增 F2 分頁，是「本場次能核銷什麼」的正式定義。
  - **取貨／入場名單**（原 pickup-roster.html F2）→ 併入 `pickup-detail.html`，新增 F4 段落，是完整管理版（搜尋、狀態篩選含未到場、標記有問題、反轉核銷，皆連 kebab 選單操作，demo 即時改變列狀態）。
  - `scanner.html` 額外補一份**唯讀簡化名單**（F3），解鎖後以 Scan／Items／Roster 三分頁呈現（`.tabs`，僅本頁內互切），供工作人員 QR 無法掃描時用姓名/票號人工核對；不含標記有問題／反轉等管理動作、不連到 order-detail.html／event-detail.html 等其他工作台頁面，對齊 scanner 既有的權限邊界規則。
- `pickup-roster.html` 刪除；`pickup.html`、`pickup-detail.html` 原本連到該頁的連結／文字改指向 `pickup-detail.html`（自身頁面）或移除。
- design-system.html 的 Mobile scanner 說明同步更新（F 編號、Items/Roster 分頁能力）；scanner.css 新增 `.scanner-screen--list`（可捲動的清單畫面，phone frame 內 overflow 由 hidden 改 auto）。
- i18n 新增 `sc.nav.*`、`sc.roster.hint`、`pk.roster.noshow`／`.flag`／`.reverse`／`.r5`；`pk.detail.sub` 文案更新、移除已不用的 `pk.detail.viewroster`。cache-buster：scanner.css 單獨升版（內容變更）、i18n.js 全站升版；check_ds_sync PASS。
