# Ztor eShop · Feature Scope Map — Phase 1

> Creator Studio × eShop 完整功能盤點與版本切割。每個節點都歸入三個 tier 之一；非 Phase 1 的項目也全部列出，供商務團隊排優先序。

- **日期**：2026-06-29
- **來源**：Ztor功能點.md + Phase 1 handoff
- **範圍**：internal use only
- **功能總數**：107

## Tier 圖例

| Tier | 意義 |
|---|---|
| 🟢 Phase 1 | build now（本期內部要做） |
| 🔵 Next | planned follow-up phase（已規劃的後續期） |
| ⚪ TBD | business team to decide（商務團隊待定） |

本期統計：🟢 Phase 1 82 · 🔵 Next 12 · ⚪ TBD 14

## Build 狀態圖例

相對兩份 prototype 的落地狀態（2026-06-29 盤點，預設 built，僅列例外）。

| 狀態 | 意義 |
|---|---|
| ✅ built | 已建置 |
| 🟡 gap | 部分落地、有缺口 |
| ❌ missing | 未建置 |
| ✅⬆ ahead | 超前建置（prototype 已有，規格尚未涵蓋） |
| ⏳ deferred | 已延後 |

Build 統計：✅ 80 built · 🟡 6 gap · ✅⬆ 19 ahead · ⏳ 2 deferred

**Feature ID** — `S` Shop · `O` Orders · `E` Earnings · `B` Buyer storefront（例：`E07`），跨團隊引用用，編號穩定不變。

## 開發版本配置

cheat code（Alt＋右鍵開啟）的「版本」切換讀這張表生成選項；改這張表、重整頁面即重新配置，不必動程式。

| 鍵 | 顯示名 | 類型 | 規則 | 說明 |
|---|---|---|---|---|
| `p1` | Phase 1（Phase 1） | 開發 | `tier:p1` | 內部首發 |
| `p1-next` | Phase 2（Phase 1 ＋ Next） | 開發 | `tier:p1,next` | 首發＋規劃追加 |
| `p1-next-tbd` | Phase 3（Phase 1 ＋ Next ＋ TBD） | 開發 | `tier:p1,next,tbd` | ＋商務待定（TBD）；eShop 外模組未納切割前畫面同 Phase 4 |
| `full` | Phase 4（最終完整版） | 開發 | `all` | 開發目標，全部功能（預設） |
| `funding-test` | r2.1_funding-test | 測試 | `route:create-project.html=funding-test/create-campaign.html` | 建立專案改接募資建立流程（create-campaign 部署複本），其餘同最終版 |

規則語法：`all` 全部可見｜`tier:p1,next` 只顯示這些 tier 的功能｜`feat:S30`／`-feat:S30` 額外加入／排除特定功能｜`route:來源頁=目標` 把指向「來源頁」的連結改接到「目標」（特殊版用；標 `data-route-keep` 的連結不改）｜`page:原頁=變體` 換整頁。tier 對照取自下方各模組功能表的 🟢 Phase 1／🔵 Next／⚪ TBD 欄；頁面元素需標 `data-feat="S30"` 才會被版本切換控制，外殼元素包多個功能時可寫逗號多值 `data-feat="S05,S06"`（任一在版本內即顯示）。作用中分頁被版本藏掉時，cheat code 會自動切到第一個可見分頁。

**data-feat 標註現況（2026-07-02 階段一：整模組入口）**：S05/S06 商店設定付款·出貨（store-settings）、S11 拍賣整線（e-shop tab＋下拉＋橫條＋清單）、S24 專案引用卡（product-detail）、O04/O09 退款爭議 KPI·篩選（orders）、O17/O18/O22/O23 粉絲記錄·退款·數位交付·退款爭議卡（order-detail）、E08/E09/E20/E22/E23/E24 提款·總覽·補登·拆解·提款·稅務（earnings）。E13–E17 收入來源分頁 r2.1 無實體可標；同頁混版本的零星欄位（階段二）按需再補。**2026-07-02 補 S31.1**：低庫存門檻自訂——create-product 自訂門檻輸入格＋product-detail 門檻欄以 `data-feat="S31.1"`（升級版·可編輯）配 `data-feat-off="S31.1"`（base·唯讀自動 10%）成對切換（首次使用 `data-feat-off` 反向閘與帶小數點的子 ID）。

---

## S · 商店管理 — Shop Management

ID 起始 `S01…` ｜ 🟢 45 · 🔵 2 · ⚪ 3

| ID    | 功能                              | English                                          | Tier       | Build    | 備註                                                        |
| ----- | ------------------------------- | ------------------------------------------------ | ---------- | -------- | --------------------------------------------------------- |
|       | **通用功能**                        | Common                                           |            |          |                                                           |
| `S01` | 　頂部庫存預警提示條                      | Low-stock alert bar                              | 🟢 Phase 1 | ✅ built  |                                                           |
| `S02` | 　篩選                             | Filter                                           | 🟢 Phase 1 | ✅ built  |                                                           |
| `S03` | 　商店設定                           | Store settings                                   | 🟢 Phase 1 | ✅ built  |                                                           |
| `S04` | 　　編輯封面 / 頭像 / 名稱 / 連結 / 描述 / 幣種 | Edit cover/avatar/name/URL/desc/currency         | 🟢 Phase 1 | ✅ built  |                                                           |
| `S05` | 　　付款設定                          | Payment settings                                 | 🔵 Next    | ✅ built  | Stripe status read-only; details TBD                      |
| `S06` | 　　出貨設定（出貨地址、免運門檻）               | Shipping defaults (address, free-ship threshold) | 🔵 Next    | ✅ built  | config fields only — no carrier integration               |
| `S07` | 　　粉絲預覽視角                        | See-as-fan preview                               | 🟢 Phase 1 | ✅ built  |                                                           |
| `S08` | 　商店預覽頁面                         | Store preview                                    | 🟢 Phase 1 | ✅ built  |                                                           |
|       | **　建立 商品 / 組合 / 拍賣**            | Create product / bundle / auction                |            |          |                                                           |
| `S09` | 　　建立商品（入口）                      | Create product entry                             | 🟢 Phase 1 | ✅ built  |                                                           |
| `S10` | 　　建立組合（入口）                      | Create bundle entry                              | 🟢 Phase 1 | ✅ built  |                                                           |
| `S11` | 　　建立拍賣（入口）                      | Create auction entry                             | ⚪ TBD      | ✅⬆ ahead | auctions deferred                                         |
|       | **商品**                          | Products                                         |            |          |                                                           |
| `S12` | 　商品列表                           | Product list                                     | 🟢 Phase 1 | ✅ built  |                                                           |
| `S13` | 　　排序                            | Sort                                             | 🟢 Phase 1 | 🟡 gap   |                                                           |
| `S14` | 　　欄位（圖片/名稱/分類/價格/狀態/庫存）         | Columns                                          | 🟢 Phase 1 | ✅ built  |                                                           |
|       | **　　狀態**                        | Statuses                                         |            |          |                                                           |
| `S15` | 　　　已上架（上架開關、編輯）                 | Live (toggle, edit)                              | 🟢 Phase 1 | ✅ built  |                                                           |
| `S16` | 　　　已隱藏                          | Hidden                                           | 🟢 Phase 1 | ✅ built  |                                                           |
| `S17` | 　　　庫存過低                         | Low stock                                        | 🟢 Phase 1 | ✅ built  |                                                           |
| `S18` | 　　　補貨流程（數量/供應商/到貨日/備註/確認）       | Restock flow                                     | 🟢 Phase 1 | ✅ built  |                                                           |
| `S19` | 　　　已售完                          | Sold out                                         | 🟢 Phase 1 | ✅ built  | status shown; exact UI TBD                                |
| `S20` | 　　　草稿                           | Draft                                            | 🟢 Phase 1 | ✅ built  |                                                           |
| `S21` | 　　商品詳情 / 編輯                     | Product detail / edit                            | 🟢 Phase 1 | ✅ built  |                                                           |
| `S22` | 　　　顯示狀態 / 分類                    | Show status/category                             | 🟢 Phase 1 | ✅ built  |                                                           |
| `S23` | 　　　銷售摘要（件數/毛收/淨利 → 收入管理）        | Sales summary                                    | 🟢 Phase 1 | ✅ built  | reads from Earnings minimum                               |
| `S24` | 　　　被專案引用（引用列表 / 前往專案）           | Referenced by project                            | ⚪ TBD      | ✅⬆ ahead | needs project/crowdfund module                            |
| `S25` | 　　　以粉絲身份預覽                      | See-as-fan preview                               | 🟢 Phase 1 | ✅ built  |                                                           |
| `S26` | 　建立商品                           | Create product                                   | 🟢 Phase 1 | ✅ built  |                                                           |
| `S27` | 　　展示圖（主圖 / 副圖）                  | Media (main/sub)                                 | 🟢 Phase 1 | ✅ built  |                                                           |
| `S28` | 　　商品資訊（名稱/描述/分類/規格）             | Info                                             | 🟢 Phase 1 | ✅ built  |                                                           |
| `S29` | 　　商品規格（單一 / 多規格）                | Variants (single/multi)                          | 🟢 Phase 1 | ✅ built  |                                                           |
| `S30` | 　　定價（價格 / 原價 + 爆米花價）            | Pricing + POPCORN price                          | 🟢 Phase 1 | 🟡 gap   | POPCORN price is net-new                                  |
| `S31` | 　　庫存（不限量 / 限量 + 低庫存提醒）          | Inventory                                        | 🟢 Phase 1 | ✅ built  |                                                           |
| `S31.1` | 　　　低庫存門檻自訂（逐商品／逐規格，覆寫預設 10%） | Custom low-stock threshold                | 🔵 Next   | ✅ built  | 已建 create-product／product-detail 自訂門檻輸入，cheat code「版本」以 `data-feat="S31.1"`／`data-feat-off` 控制（Phase 1 隱藏＝固定 10%、Next+ 顯示可編輯）；逐規格粒度未做（spec §8）。spec §7.2／D105 |
| `S32` | 　　多規格價格與庫存（SKU / 成本）            | Variant matrix (SKU/cost)                        | 🟢 Phase 1 | ✅ built  |                                                           |
|       | **　　取貨方式**                      | Fulfillment method                               |            |          |                                                           |
| `S33` | 　　　物流配送（重量/分類/尺寸/寄件地）           | Logistics fields                                 | 🟢 Phase 1 | ✅ built  | data entry only — no carrier API                          |
| `S34` | 　　　現場 QR 領取（領取說明）               | On-site QR pickup                                | 🟢 Phase 1 | ✅ built  |                                                           |
| `S35` | 　　購買限制與標籤（每人限購 / 標籤）            | Purchase limit & tags                            | 🟢 Phase 1 | ✅ built  |                                                           |
| `S36` | 　　預覽 / 上架開賣                     | Preview & publish                                | 🟢 Phase 1 | ✅ built  |                                                           |
| `S37` | 　　稍後再存（草稿）                      | Save draft                                       | 🟢 Phase 1 | ✅ built  |                                                           |
| `S38` | 　　開始售賣                          | Start selling                                    | 🟢 Phase 1 | ✅ built  |                                                           |
| `S39` | 　　　發布貼文（標題/內容/收件對象/排程）          | Product-drop social post                         | 🟢 Phase 1 | ✅ built  | reuses Ztor's existing social-post feature — no new build |
|       | **組合**                          | Bundles                                          |            |          |                                                           |
| `S40` | 　組合包列表（欄位 / 狀態）                 | Bundle list                                      | 🟢 Phase 1 | ✅ built  |                                                           |
| `S41` | 　建立組合包                          | Create bundle                                    | 🟢 Phase 1 | ✅ built  |                                                           |
| `S42` | 　　組合包名稱                         | Name                                             | 🟢 Phase 1 | ✅ built  |                                                           |
| `S43` | 　　商品（新增 / 近期預覽）                 | Items                                            | 🟢 Phase 1 | ✅ built  |                                                           |
| `S44` | 　　定價（固定價 / 折扣價）                 | Pricing (fixed/% off)                            | 🟢 Phase 1 | ✅ built  |                                                           |
| `S45` | 　　限量                            | Quantity limit                                   | ⚪ TBD      | ✅⬆ ahead |                                                           |
| `S46` | 　　發布貼文                          | Publish post                                     | 🟢 Phase 1 | ✅ built  | reuses Ztor's existing social-post feature                |
| `S47` | 　組合包詳情 / 編輯                     | Bundle detail / edit                             | 🟢 Phase 1 | ✅ built  |                                                           |
| `S48` | 　　銷售摘要                          | Sales summary                                    | 🟢 Phase 1 | ✅ built  | reads from Earnings                                       |
| `S49` | 　　庫存與成員影響（= 最少成員）               | Stock = min(member)                              | 🟢 Phase 1 | ✅ built  |                                                           |
| `S50` | 　　以粉絲身份預覽                       | See-as-fan preview                               | 🟢 Phase 1 | ✅ built  |                                                           |

## O · 訂單管理 — Order Management

ID 起始 `O01…` ｜ 🟢 17 · 🔵 3 · ⚪ 3

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `O01` | 資料統計 | KPI stats | 🟢 Phase 1 | ✅ built |  |
| `O02` | 　待出貨 | To ship | 🟢 Phase 1 | ✅ built |  |
| `O03` | 　待處理 | Pending | 🟢 Phase 1 | ✅ built |  |
| `O04` | 　退款 / 爭議 | Refund / dispute | ⚪ TBD | ✅⬆ ahead | refunds deferred |
| `O05` | 　已完成 · 30天 | Completed · 30d | 🟢 Phase 1 | ✅ built |  |
| `O06` | 匯出 | Export | 🟢 Phase 1 | ✅ built |  |
| `O07` | 搜尋訂單 | Search orders | 🟢 Phase 1 | ✅ built |  |
| | **狀態列** | Status filter | | | |
| `O08` | 　全部 / 待付款 / 已付款 / 待出貨 / 已出貨 / 已完成 | All → Completed | 🟢 Phase 1 | ✅ built | 原文「代付款」為筆誤，依規格 Unpaid＝待付款更正 |
| `O09` | 　退款 / 爭議 | Refund / dispute | ⚪ TBD | ✅⬆ ahead |  |
| `O10` | 訂單列表欄位 | Order list fields | 🟢 Phase 1 | ✅ built |  |
| `O11` | 訂單詳情 | Order detail | 🟢 Phase 1 | ✅ built |  |
| | **　內容** | Content | | | |
| `O12` | 　　狀態 / 收入結算 | Status / settlement | 🟢 Phase 1 | ✅ built |  |
| `O13` | 　　訂單商品列表 | Line items | 🟢 Phase 1 | ✅ built |  |
| `O14` | 　　金額（商品 / 運費 / 平台費 / 支付費 / 淨額） | Amounts incl. platform fee | 🟢 Phase 1 | ✅ built |  |
| `O15` | 　　在收入管理檢視 | View in Earnings | 🟢 Phase 1 | ✅ built | link to Earnings minimum |
| `O16` | 　　買家資訊（名稱 / 地址 / 聯絡方式） | Buyer info | 🟢 Phase 1 | ✅ built |  |
| `O17` | 　　檢視粉絲記錄 | View fan record | 🔵 Next | ✅⬆ ahead | Fans CRM module out of scope |
| | **　功能** | Actions | | | |
| `O18` | 　　退款 | Refund | ⚪ TBD | 🟡 gap | no in-system refunds in Phase 1 |
| `O19` | 　　標記出貨 / 履約 | Mark shipped / fulfillment | 🟢 Phase 1 | ✅ built |  |
| `O20` | 　　　物流配送（物流商 / 追蹤碼 / 標記出貨） | Logistics (manual) | 🟢 Phase 1 | ✅ built | manual entry — no carrier API |
| `O21` | 　　　QR 領取（二維碼 / 標記已領取） | QR pickup | 🟢 Phase 1 | ✅ built |  |
| `O22` | 　　　數位（下載） | Digital download | 🔵 Next | ✅⬆ ahead | digital goods deferred |
| `O23` | 　　退款與爭議（部分 / 整單退款） | Refund & dispute | 🔵 Next | 🟡 gap |  |

## E · 收入管理 — Earnings / Income

ID 起始 `E01…` ｜ 🟢 12 · 🔵 5 · ⚪ 7

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `E01` | 資料統計 | KPI stats | 🟢 Phase 1 | ✅ built | minimal slice only |
| `E02` | 　總輸入 | Gross | 🟢 Phase 1 | ✅ built |  |
| `E03` | 　淨利（→ 收益拆分） | Net (→ breakdown) | 🟢 Phase 1 | ✅ built | net p1; waterfall later |
| `E04` | 　待結算 | Pending settlement | 🟢 Phase 1 | ✅ built |  |
| `E05` | 　可提領 | Available | 🟢 Phase 1 | ✅ built | display p1; payout later |
| `E06` | 篩選（本月 / 季 / 年） | Filter (month/qtr/year) | 🟢 Phase 1 | ✅ built |  |
| `E07` | 匯出 | Export | 🟢 Phase 1 | ✅ built |  |
| `E08` | 申請提款 | Request payout | 🔵 Next | ✅⬆ ahead | payout mechanics deferred |
| | **欄目** | Tabs | | | |
| `E09` | 　總覽（趨勢圖 / 近期交易 / 來源分佈） | Overview | 🔵 Next | ✅⬆ ahead | charts deferred |
| `E10` | 　交易明細 | Transactions | 🟢 Phase 1 | ✅ built |  |
| `E11` | 　　全部（欄位 + 展開詳情） | All (fields + expand) | 🟢 Phase 1 | ✅ built |  |
| `E12` | 　　電子商店 | E-Shop tab | 🟢 Phase 1 | ✅ built |  |
| `E13` | 　　電子票券 | E-Tickets | ⚪ TBD | ✅⬆ ahead |  |
| `E14` | 　　IP 版稅 | IP royalty | ⚪ TBD | ✅⬆ ahead |  |
| `E15` | 　　授權 | Licensing | ⚪ TBD | ✅⬆ ahead |  |
| `E16` | 　　平台 / 串流版稅 | Streaming royalty | ⚪ TBD | ✅⬆ ahead |  |
| `E17` | 　　專案支持 | Project support | ⚪ TBD | ✅⬆ ahead |  |
| `E18` | 　　提款與退款 | Payout & refund | 🔵 Next | ✅⬆ ahead |  |
| `E19` | 　　載入更多 | Load more | 🟢 Phase 1 | ✅ built |  |
| `E20` | 　　手動補登 | Manual entry | 🔵 Next | ✅⬆ ahead |  |
| `E21` | 　　匯出 CSV | Export CSV | 🟢 Phase 1 | ✅ built |  |
| `E22` | 　收益拆解（瀑布圖 / 依專案 · Ztor抽成·創作者·NFT） | Revenue breakdown waterfall | ⚪ TBD | ✅⬆ ahead | 'Follow the Money' split — blocked on platform-cut decision（原文「EFT」為筆誤，依規格 §7.3 淨利池 NFT 40% 更正） |
| `E23` | 　提款 | Payout | 🔵 Next | ✅⬆ ahead |  |
| `E24` | 　稅務檔案 | Tax documents | ⚪ TBD | ✅⬆ ahead |  |

## B · 買家店面（Ztor eShop） — Buyer Storefront

> 來源：from Phase 1 handoff (not in 功能點.md)

ID 起始 `B01…` ｜ 🟢 8 · 🔵 1 · ⚪ 1

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `B01` | 創作者商店頁 | Creator shop page | 🟢 Phase 1 | ✅ built |  |
| `B02` | 商品詳情頁 (PDP) | Product detail page | 🟢 Phase 1 | ✅ built | net-new — designer proto has none |
| `B03` | 購物車 | Cart | 🟢 Phase 1 | ✅ built |  |
| `B04` | 結帳 | Checkout | 🟢 Phase 1 | ✅ built |  |
| `B05` | 　Apple Pay / 信用卡 (Stripe) | Apple Pay / card | 🟢 Phase 1 | ✅ built |  |
| `B06` | 　爆米花付款 (Pay by POPCORN) | Pay by POPCORN | 🟢 Phase 1 | 🟡 gap | net-new payment option |
| `B07` | 　貨到付款 (COD) | Cash on delivery | ⚪ TBD | ⏳ deferred | removed from Phase 1 |
| `B08` | 訂單確認 | Order confirmation | 🟢 Phase 1 | ✅ built |  |
| `B09` | 取貨 QR（email + 訂單詳情，靜態） | Pickup QR (static, email + order) | 🟢 Phase 1 | 🟡 gap |  |
| `B10` | 公開探索欄（/shops、首頁商品欄） | Public discovery rails | 🔵 Next | ⏳ deferred | internal-only Phase 1 — no public discovery |

---

_由 https://ztor-eshop-proto.vercel.app/eshop-feature-scope-map.html 轉錄（2026-06-30）；ID 依原始 HTML 的編號邏輯重算（group 結構列不佔號）。2026-07-02 對源複核：源頁未更新（自標 2026-06-29），107 項 tier／build 零漂移；本檔僅就地更正兩處源頁筆誤（O08 代付款→待付款、E22 EFT→NFT，見各列備註），其餘忠實轉錄。_
