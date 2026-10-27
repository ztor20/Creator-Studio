# Ztor eShop · Feature Scope Map — release2.2／release2.3／release2.4

> Creator Studio × eShop 完整功能盤點與版本切割。每個節點都歸入三個 tier 之一；非 release2.2 的項目也全部列出，供商務團隊排優先序。

- **日期**：2026-06-29
- **來源**：Ztor功能點.md + Phase 1 handoff
- **範圍**：internal use only
- **2026-10-07 改名**：Phase 1 改稱 release2.3（E-Shop，已凍結交付）、下一版改稱 release2.4；**2026-10-27 序號改名**：release2.3→release2.2、release2.4→release2.3、release2.5→release2.4，本表已全部換成新名；Tier 欄與版本鍵同步改名，下方 2026-10-07 以前的段落保留當時寫法
- **功能總數**：209 列（2026-10-27 補登 S126〔活躍粉絲 KPI，自 S118 拆出〕；2026-10-23 使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP：補登 S120–S125，以程式逐列重數；2026-10-23 release2.4 建立：補登 S115–S119、S110 改 🟣，以程式逐列重數——補登前實際 197 列、原寫 196 少算一列 ⚪；2026-10-23 D477 補登 S112–S114；2026-10-23 D476 補登 S107–S111；2026-10-22 D475 補登 S106；2026-10-21 D463 補登 S105；2026-10-20 D461 補登 S104；2026-10-19 稽核以程式逐列重數，與下方「本期統計」合計一致；原寫 129 為歷次補登都沒回頭更新。以下括號是補登沿革：2026-10-09 補登 S93〔媒體庫三分頁新增讀數〕；2026-10-08 補登 S86〔D377 媒體庫第二層〕；2026-10-05 補登 S68–S71、O33，D360；2026-09-29 補登 S52–S56；同日補登 S58；2026-09-30 補登 S59–S61，D340；2026-10-01 補登 S62–S64，D342；2026-10-02 補登 S65–S66，D347；2026-10-05 補登 S67，D354；同日 S54（D353）、S57、S60（D354）改 ⚫ 退場）

## Tier 圖例

| Tier | 意義 |
|---|---|
| 🟢 release2.2（已交付） | 已交付開發的範圍（E-Shop），凍結在 monorepo 的 `release2.2` 分支（2026-09-23 切出，原名 `phase1`） |
| 🔵 release2.3（下一版） | 下一期要交付的功能；標上去就會出現在面板的「release2.3」預覽 |
| 🟣 release2.4（再下一版） | 粉絲管理＋媒體庫那一期（2026-10-23 建立，與 release2.3 並存）；標上去就會出現在面板的「release2.4」預覽，release2.3 預覽看不到 |
| ⚪ TBD（未排定） | 商務團隊待定；release2.3 預覽不顯示，只在最終版出現 |
| ⚫ 退場 | retired（產品決策已全面撤除，不再規劃／不計入 release2.2／release2.3／TBD 三態，2026-09-09 起新增） |

Tier 欄的 release 編號就是程式用的 tier 代號：`devtools.js` 讀到 `🟢 release2.2` 就把該功能歸到 `release2.2`。之後交付 release2.3 時，那批功能改標 `🟢 release2.3`（保留它是哪一版交付的），新的下一版標 `🔵 release2.4`。

本期統計：🟢 release2.2 92 · 🔵 release2.3 51 · 🟣 release2.4 12 · ⚪ TBD 48 · ⚫ 退場 6 · 合計 209 列（2026-10-27 補登 S126 🟣、自 S118 拆出，以程式逐列重數）（2026-10-23 使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP：S86、S93、S106、S112、S113、S114 ⚪ 改 🟣，補登 S120 🟣（媒體庫頁本身）、S121–S125 ⚪（大彩蛋／其餘六種行動任務／鑰匙／待補規格的數字／排程，自原列拆出），以程式逐列重數；2026-10-23 release2.4 建立：補登 S115–S117 🟣、S118–S119 ⚪，S110 ⚪ 改 🟣，以程式逐列重數——補登前 ⚪ 實為 48、原寫 47；2026-10-23 D477：補登 S112–S114 ⚪；2026-10-23 D476：補登 S107–S111 ⚪；2026-10-22 D475：補登 S106 ⚪；2026-10-21 D463：補登 S105 ⚪；2026-10-20 D461：S96 ⚪ 改 🔵、補登 S104 ⚪，逐列重數；2026-10-20 補正：S79 改 🔵、新增 S101／S102／S103 ⚪，逐列重數；2026-10-20 D460：補登 S103 ⚪；2026-10-19 D447：補登 S100 🔵；2026-10-16 使用者指示組合包納入 release2.3：S63、S64 ⚪ 改 🔵；同日使用者裁決 release2.3 電子商店範圍：S45、O04、O09 ⚪ 改 🔵；2026-10-16 D432／D433／D435：補登 S51.1、S47.1、S81.1 🔵；2026-10-15 D424：補登 O40–O42 🔵；2026-10-15 以程式逐列重數更正，原寫 🔵 34／⚪ 39；合計含 `S31.1`；2026-10-15 D422／D423：S75 改 ⚪、補登 S97 🔵（自 S64 拆出）、S98 ⚪、S99 🔵；2026-10-15 D416：補登 O39 🔵；2026-10-14 D414：補登 O38 🔵；2026-10-13 D411：補登 O34–O37 🔵；2026-10-13 D410：補登 S95 ⚪〔非 bookyay 的示範活動，2.4 隱藏〕；2026-10-12 D395：S80 直接促銷同意改 ⚫ 退場；2026-10-09 媒體庫三分頁補登 S93 ⚪；2026-10-09 D383：補登 S87–S91 ⚪、S92 🔵，S78 改 🔵；2026-10-08 D377 補登 S86 ⚪；2026-10-07 依功能表逐列重數，同日補登 S82〔D366〕；2026-10-08 D371：S81 改 🔵、補登 S83 🔵；同日 D375 補登 S85 🔵；各模組小計與功能總數另待校正）

## Build 狀態圖例

相對兩份 prototype 的落地狀態（2026-06-29 盤點，預設 built，僅列例外）。

| 狀態 | 意義 |
|---|---|
| ✅ built | 已建置 |
| 🟡 gap | 部分落地、有缺口 |
| ❌ missing | 未建置 |
| ✅⬆ ahead | 超前建置（prototype 已有，規格尚未涵蓋） |
| ⏳ deferred | 已延後 |

Build 統計：✅ 111 built · 🟡 6 gap · ✅⬆ 63 ahead · ⏳ 2 deferred（合計 182 列；2026-10-19 以程式逐列重數更正，原寫 108／59 是 2026-10-15 之後新登列沒有跟著加）

**Feature ID** — `S` Shop · `O` Orders · `E` Earnings · `B` Buyer storefront（例：`E07`），跨團隊引用用，編號穩定不變。

## 開發版本配置

cheat code（Alt＋右鍵開啟）的「版本」切換讀這張表生成選項；改這張表、重整頁面即重新配置，不必動程式。「類型」欄同時是面板分組鍵：`開發`→「開發版本」、`測試`→「測試版」、`Demo`→「Presentation demo」。純減功能（`tier:`）的開發版只改表即可；但**以 Phase 4 為基底、只改接個別頁面的特殊版**（`route:`／`page:`，如 `funding-test`、`deck-for-sony`）另需在**兩處**白名單登記其鍵——`js/devtools.js` 的 `isFullBaseVersion()` 與 `js/sidebar.js` 的 `fullVersion()`（navbar 有獨立的 route gate），漏一處就會被當低版本、藏掉 full-only 頁面或 navbar 選項。新分組若要友善標題，在 devtools.js 的 `VER_GROUP_LABEL`／`VER_GROUP_ORDER` 補一筆；未登記者面板直接以類型字串當標題。

| 鍵 | 顯示名 | 類型 | 規則 | 說明 |
|---|---|---|---|---|
| `full` | 最終版 | 開發 | `all` | 全部功能（預設）；日常編修都改這一版 |
| `release2.3` | release2.3 | 開發 | `tier:release2.2,release2.3` | 已交付（🟢 release2.2）＋下一版（🔵 release2.3）；⚪ 未排定、`full` 保留 gate 與未標記的新功能都隱藏 |
| `release2.4` | release2.4 | 開發 | `tier:release2.2,release2.3,release2.4` | 已交付（🟢 release2.2）＋ release2.3（🔵）＋粉絲管理與媒體庫（🟣 release2.4）；⚪ 未排定、`full` 保留 gate 與未標記的新功能都隱藏 |
| `funding-test` | funding-test | 測試 | `route:create-project.html=funding-test/create-campaign.html` | 建立專案改接募資建立流程（create-campaign 部署複本），其餘同最終版 |
| `deck-for-sony` | Deck for Sony | Demo | `route:earnings.html=earnings-sony.html` | 收入管理改接 Sony 簡報版（earnings-sony.html），其餘同最終版 |

**交付輪替（2026-09-23 起；2026-10-07 改用 release 編號）**：已交付的版本不留在 `main` 的面板上，改由 monorepo 的凍結分支代表——release2.2＝`release2.2` 分支（原名 `phase1`；版本鎖死、獨立網址、只收明確要進 release2.2 的修正，升版記在該分支的 `RELEASE2.2-CHANGES.md`）。下一期範圍確定時：
1. 把要做的功能標 `🔵 release2.3`
2. 用面板的「release2.3」確認畫面
3. 從 `main` 切 `release2.3` 分支鎖定並開新網址
4. 交付後把那批功能改標 `🟢 release2.3`
5. 本表的開發版本配置拿掉已交付的那一列（例如交付 release2.3 後刪 `release2.3` 列），同步 `js/devtools.js` 的 `VERSIONS` 後備；`TIER_EMOJI` 的 🔵／🟣 照「下一版、再下一版」往前對：🔵 改對到原本 🟣 那一版、🟣 改對到再下一版，並把原 🟣 的功能改標 🔵；新標的功能在 `FEAT_TIER` 後備補一筆，已交付的 `release2.3` 值不用改

**兩個未來版本並存（2026-10-23 起）**：release2.3（🔵，活動）還沒交付時，粉絲管理與媒體庫先排進 release2.4（🟣）。面板同時有「release2.3」「release2.4」兩個預覽：release2.3 規則不變（看不到 🟣），release2.4 規則 `tier:release2.2,release2.3,release2.4`（含 release2.3 的活動功能）。🟣 功能在 release2.3 的連結與頁面都會收起或導回 E-Shop。

**新功能做出來的當下就要掛 `data-feat` 標記並在本表登記（預設 ⚪ 未排定）**，否則沒有標記的元素每個版本都會顯示，release2.3 預覽就會多出不在範圍的東西。

> 2026-10-07 改名：版本鍵 `next`（下一版預覽）改成 `release2.4`，tier 代號 `p1`→`release2.3`、`next`→`release2.4`（2026-10-27 起分別改稱 `release2.3`、`release2.2`、`release2.3`）。舊瀏覽器存著的 `next` 由 `devtools.js` 的 `VERSION_ALIAS` 直接對到 `release2.3`。

> 2026-09-23 退場：`p1`／`p1-next`／`p1-next-tbd`（Phase 1／2／3）與 `golive-4step`（其目標頁 `golive-4step/` 已一併刪除）。舊瀏覽器 devstate 若存著這些鍵或 2026-08-31 退場的 `home-canvas`，`devtools.js` 的 `load()` 會把未知鍵改寫成 `full`，`isFullBaseVersion()`／`fullVersion()` 兩份白名單因此不再需要兜底。

規則語法：`all` 全部可見｜`tier:release2.2,release2.3` 只顯示這些 tier 的功能｜`feat:S30`／`-feat:S30` 額外加入／排除特定功能｜`route:來源頁=目標` 把指向「來源頁」的連結改接到「目標」，並在你「已停在來源頁」（含直接輸入 URL、或切版本時正停在該頁）時把整頁換到目標；切回非此版本時，停在目標頁會自動導回來源頁（雙向、保留 query／hash）。特殊版用；標 `data-route-keep` 的連結不改接｜`page:原頁=變體` 換整頁。tier 對照取自下方各模組功能表的 Tier 欄（欄內的 release 編號優先，沒寫編號時 🟢＝release2.2、🔵＝release2.3、⚪＝tbd）；頁面元素需標 `data-feat="S30"` 才會被版本切換控制，外殼元素包多個功能時可寫逗號多值 `data-feat="S05,S06"`（任一在版本內即顯示）。`data-feat="full"` 是保留 gate，表示 scope 未列功能，只在 `all`／funding-test 顯示；整頁用 `data-page-feat`，低版本直連會回到 E-Shop。作用中分頁被版本藏掉時，cheat code 會自動切到第一個可見分頁。

**登入頁的自助註冊入口：已整段移除，待註冊規格補齊後再議（2026-08-04 使用者裁示）**。原本的登記是：規格 5.1.10 要求自助註冊入口 phase 1–3 完全不出現，上表三個 tier（🟢 Phase 1／🔵 Next／⚪ TBD）沒有一個能表達（⚪ TBD 在 Phase 3 就看得到），所以沿用保留 gate `data-feat="full"` 掛在 `login.html` F1 方式選擇底下的「還沒有帳號？註冊」那一列。**現況**：使用者裁示直接整段拿掉那一列，原型任何版本都不出現註冊入口，因此**本表不再登記任何 `full` gate 給註冊**——沒有對應元素的閘門只會誤導後續 session。等自助註冊真的要做時，連同上游規格一起補，再決定要用哪個閘門。`login.html` 整頁**不掛** `data-page-feat`、也不進 `js/devtools.js` 與 `js/sidebar.js` 的 `FULL_ROUTES` 清單——登入本身是 phase 1 能力（D170），各版本都要進得去。

**取貨管理三頁的頁級閘門（2026-08-11 修）**：`pickup.html`／`pickup-detail.html`／`scanner.html` 的 `data-page-feat` 原本停在 `full`，但 D157 已在 2026-07-30 把 O24–O30 併入 Phase 1，`sidebar.js` 與 `devtools.js` 的 `FULL_ROUTES` 當時也同步移除了這三頁。結果是 Phase 1 側欄看得到「取貨管理」、點下去卻被頁級閘門導回 E-Shop。三頁改標各自的功能編號（O24／O27／O29）後恢復正常。**教訓**：把一個模組併進低 tier 時，要同時掃三處——功能表的 Tier 欄、兩份 `FULL_ROUTES`、以及該模組每一頁的 `data-page-feat`。

**商店設定的 S05／S06 閘門在改版時掉了（2026-08-13 修）**：D184 把商店設定從彈窗改成獨立頁時，分區容器由 `[data-ss-panel]` 換成 `#sec-*`，重寫的 markup 沒把原本掛在付款與出貨上的 `data-feat="S05"`／`"S06"` 帶過去，Phase 1 因此看得到收款分頁與出貨預設卡。已補回三處：收款分頁（`[data-sec="payment"]`）、`#sec-payment` 整區、`#sec-selling` 裡的出貨那張卡（幣別那張不屬 S06，留著）。同一次改版還把 F7 商品規格的互動 JS 打斷了（它查的還是舊的 `[data-ss-panel="specs"]`，整段被開頭的 early return 擋掉、按鈕全部沒反應），一併改用 `#sec-specs`。**教訓**：換容器選擇器是全頁性的改動，要連 `data-feat` 閘門與所有靠選擇器綁事件的 JS 一起掃，不能只看畫面長得對不對。

**粉絲分級欄只在 Phase 4（2026-08-13 使用者裁示 / D187）**：電子商店商品清單與組合清單的「粉絲分級」欄（誰買得到）Phase 1–3 不出現。這一欄沒有規格出處（PG-021，2026-07-29 直接在原型上長出來的），所以歸「scope 未列」、走保留 gate `data-feat="full"`；欄頭與每一格另外標 `data-col="tier"`，`product-list.css` 用 `:has([data-col="tier"].ztd-ver-hidden)` 換掉整條欄寬——格線是固定軌數，只把格子藏起來會讓後面每一欄往左錯一格。

**Admin 平台層與帳戶設定列入 Phase 1（2026-09-24 使用者裁示／D324）**：〔2026-10-08 D373 修訂：其中創作者活動管理（`admin-creator-events.html`）改屬 release2.3，登記為 S84 🔵、頁級掛 `data-page-feat="S84"`，下文列它為 Phase 1 的部分不再適用。〕Creator 管理（`creators.html`、`creator-detail.html`）、創作者活動管理（`admin-creator-events.html`）、影片上架審核（`admin-video-review.html`）、Admin IP Bank（`admin-ip-bank.html`、`admin-ip-bank-entry.html`）、IP Bank Reporting（`ip-bank-reporting.html`）、平台費率設定（`admin-platform-fees.html`）與帳戶設定（`settings.html`）拿掉頁級 `data-page-feat="full"`，並移出 `js/devtools.js`／`js/sidebar.js` 兩份 `FULL_ROUTES`——這些頁沒有 scope 功能編號，不掛閘門＝各版本都顯示。**平台優惠設定仍 Phase 4**（D279），頁級閘門與兩份清單照舊（devtools 那份補登，兩份才一致）。頁內指向 Phase 4 模組的連結（活動詳情、IP 詳情、平台優惠等）由 route gate 照常在低版本藏起來。Admin 頁的 logo 在低版本也回名冊（`sidebar.js` 的 `applyVersionRoutes`）。

**粉絲管理進 release2.4、只放需求站 P0（2026-10-23 使用者裁示）**：`fans-crm.html` 頁級 `data-page-feat="S115"`、`fan-detail.html` 頁級 `"S117"`（皆 🟣）。兩頁在 `js/devtools.js`／`js/sidebar.js` 的 `FULL_ROUTES` 不再是「只在最終版」，改成**依功能放行**：devtools 那份的值寫功能 ID（`'fans-crm.html': 'S115'`），sidebar 那份另列 `TIER_ROUTES`（兩份必須一致）——該功能在目前版本內才顯示連結，所以 release2.4 看得到粉絲總覽、release2.3 整個 Fans 群組照舊收起。品牌合作、粉絲分析兩頁、粉絲系統說明、分級權益與分級設定兩個備份頁、平台忠誠點數設定（S65）仍留在 `FULL_ROUTES`、值為 1，release2.4 也看不到。頁內只在最終版的區塊掛 S118（名冊與粉絲詳情延伸）／S119（分級設定的編輯、權益、計分設定與其餘規則）。`js/fans-guide-firstrun.js` 第一次進粉絲頁自動跳粉絲系統說明的行為只在最終版類版本執行。媒體庫要進 release2.4 時：登記 🟣 功能 ID、把 `media-vault.html` 頁級改成該 ID、兩份清單改成同樣的「依功能放行」寫法即可。

**媒體庫進 release2.4、範圍＝需求網址 MVP（2026-10-23 使用者裁決）**：release2.4 的媒體庫＝ https://media-vault-site.vercel.app/ 的 MVP 範圍（本地轉檔 `Project/ztor-endgame-demo/media-vault-site/media-vault-site.md`）。放進的標 🟣 release2.4：頁本身與三分頁、庫房清單與建立多座、上傳與單件預覽、進庫方法與觸及人數、每件任務（不設／等級任務／追蹤創作者、加入社群、分享庫房頁面給 N 位朋友三種行動任務）、解開紀錄兩個數字、檢視身分（以分級、指定一位粉絲）與上鎖卡、庫房狀態（立刻上架、下架、重新上架、刪除）、分享庫房連結、「只能線上看與播放」——S86、S93、S106、S112、S113、S114 改 🟣，頁本身新登記 S120（`media-vault.html` 頁級改 `data-page-feat="S120"`，兩份路由清單改「依功能放行」，寫法同上段粉絲管理）。不放的拆成新編號、⚪ 只在最終版：S121 大彩蛋、S122 其餘六種行動任務、S123 鑰匙（整個直接開放區、鑰匙使用情況、上架前不能領鑰匙與各處「靠鑰匙」字句）、S124 總覽待補規格的數字、S125 排程。鑰匙、排程與那六種任務不在版本內時，`js/vault-store.js` 在資料層當它們不存在（鑰匙不算進人數、排程不生效、用到那六種任務的內容當成不設任務），畫面上的數字、標籤與說明因此一致；只看當下版本、不改資料，切回最終版全部還在（ASSUMPTIONS UIA-300）。

**平台忠誠點數設定的上線階段未定（2026-10-02 D347）**：Admin 第 8 個同層目的地 `admin-platform-loyalty.html`（規格 5.1.0.8）屬哪一期交付〔產品待確認〕（主規格 §8.29 第 16 項），所以登記為 S65 ⚪ 未排定：頁級 `data-page-feat="S65"`，並比照平台優惠設定放進 `js/sidebar.js`／`js/devtools.js` 兩份 `FULL_ROUTES`——「下一版預覽」看不到側欄入口、直連會導回 E-Shop，最終版照常顯示。分級設定新增的各購買品項的份量與互動推薦每 90 天最多得分掛 S66（⚪ 未排定）；所在的 `fans-crm.html` 本身是頁級 `full`，兩層閘門一致。上線階段定案後只改本表 Tier 欄，必要時移出兩份 `FULL_ROUTES`。

**平台滿額折扣與平台優惠碼是全平台協定（2026-09-15 D273／D277）**：Admin 平台優惠設定頁（`admin-platform-promotions.html`，原 `admin-platform-discounts.html`）與其他 Admin 目的地一樣不受開發版本 gate；創作者端沒有對應開關，只在訂單詳情看到「平台滿額折抵」扣項列（D274）。整頁 Phase 4（D279）。

**優惠碼 Phase 1 只有期間、%／固定、全部或指定商品（2026-09-17 D279；2026-09-22 D299 把「指定商品」放寬成可多選、含活動票種）**：Phase 1 的藝人商店優惠碼只留三組欄位——生效期間、折扣型態（百分比或固定金額）、適用範圍（全部商店，或指定商品**可多選**：單售、組合包、活動票種；不選類型層）；碼字串本身當然也有（8–20 英數字、比對不分大小寫）。`store-settings.html` 優惠碼彈窗裡，**類型樹**、每張訂單可折件數／每人總次數／總兌換次數三格、固定金額折法、可與其他優惠碼疊加，一律掛 `data-feat="full"`（使用次數三格連同標籤包一個容器一起掛，固定金額折法與疊加開關各自的既有 `hidden`／JS 顯隱照常，閘門與 hidden 兩道各管各的）。Phase 1 的適用範圍是一組 `data-feat-off="full"` 的 `radio-list`（全部商店／指定商品（可多選））；**指定商品的多選 combobox（`#ss-scope-combo`）自 D299 起不掛任何閘門**——它坐在 Phase 4 那組（`data-feat="full"`）與 Phase 1 那組之外、兩個版本共用，何時露出由頁面 JS 依「哪一組看得見」算，候選同一份（`ProductsStore.all()`＋`bundles()`＋`ztorEvents.list()` 的票種）。清單同步：「已用」欄的「/ 上限」只在有次數上限時才有意義，包一個 `data-feat="full"` 的 span；LAUNCH50（已用完狀態）整列 `data-feat="full"`（Phase 1 沒有次數上限，不會有「已用完」）；「範圍」欄的混選示意（AIKO10「服飾＋2 件商品」）與 Phase 1 的單商品示意（「26MS Hoodie」）用 `data-feat`／`data-feat-off` 成對切換；TOURVIP15（指定多件含票種）無 gate、各版本都有。**平台優惠設定（5.1.0.7）整頁 Phase 4**，見上一段。

**代理優惠碼只在 Phase 4（2026-08-13 使用者裁示 / D185）**：商店設定的優惠碼分頁（S51）各版本都有，但「代理」這一支——彈窗裡的型別切換整列、推廣者與分成欄位、代理銷售紀錄，以及清單裡的代理碼示範列——Phase 1–3 都不出現。三個 tier 沒有一個能表達「只在 Phase 4」，所以沿用保留 gate `data-feat="full"`（同註冊入口那次的做法）。分頁開場白因此做成 `data-feat="full"`／`data-feat-off="full"` 成對：full 版講兩種碼的差別，低版本只講折扣本身；清單裡「自用」那個 meta 標籤也一起收起來——沒有第二種碼時，標它是自用只是廢話。彈窗預設就是以自用開場（`openModal('own', …)`），所以切換列藏掉不影響行為。

**商品專屬尺寸指南只在 Phase 4（2026-08-20 使用者裁示 / D213）**：建立商品 → 商品資訊 → 尺寸指南的「改用專屬指南」按鈕，以及按下去之後那一列「使用專屬尺寸指南」，Phase 1–3 都不出現（`create-product.html` 兩處 `data-feat="full"`）。這個能力是 D211 當天長出來的，功能表沒有它的編號，三個 tier 沒有一個能表達「只在 Phase 4」（⚪ TBD 在 Phase 3 就看得到），所以走保留 gate——同註冊入口（2026-08-04）與代理優惠碼（D185）那兩次。低版本那一格仍然看得到「沿用商店的尺寸指南」與目前有哪幾份，只是沒有覆寫的路。**商店層的尺寸指南設定（5.1.5.5 F7）不掛 gate**：各版本都要能把店裡的指南建起來。

**2026-10-09 D383 範圍收斂（release2.3 只交付 bookyay 能帶入的資料所涉及的功能）**：使用者裁決 bookyay 不帶入重覆活動、也不帶入多時段，release2.3 因此沒有多場次活動；規格寫最終版、不動，release2.3 的範圍只記在本表與版本開關（D383 決定八）。
- 隱藏（⚪）：多場次 S87（新增場次、多場的示範活動；bookyay 多時段與重覆活動的帶入不在此列，D440 起 release2.3 也能帶入、合成同一場）、系列活動 S88、到店自取 S89、活動詳情的轉售 S90 與招待票 S91（招待票為同日使用者補充）。
- 匯入清單：~~多時段的單次活動與重覆活動照樣列出、標「不可帶入」並寫原因~~（2026-10-16 D440 取消這個擋：多時段與重覆活動 release2.3 與最終版都能帶入、合成同一場）；仍標「不可帶入」的只剩不設門票的活動（D369 決定三）與到店自取（S89 不在版本內，D384）。
- 進 release2.3（🔵）：活動詳情的預覽與在地化 S78（含 `event-localization.html` 頁級改 S78）；門票的隱藏狀態與標示自 S55 拆出成 S92——S55 只剩「創作者自己切換門票顯示開關」，維持 ⚪。
- 保留（原本就隨 S72 或各自編號在 release2.3）：獨立票、表演陣容、影片預告、單張門票的入場設定、限時購買、門票圖片（預設沿用活動主視覺、可換可改回）。招待票原本也在保留清單，同日使用者補充改為隱藏（S91）。
- 示範：bookyay 匯入清單新增 bky-13（單一時段的二人套票），release2.3 與最終版都能帶入，帶入後看得到~~隱藏且鎖定的 1 人票與每套 2 張的組合包~~（2026-10-16 D429 起：一張普通門票「二人套票」，沒有自動組合包）；bky-2（三個時段的二人套票）~~在 release2.3 標不可帶入~~（D440 起 release2.3 與最終版都能帶入，三個時段合成同一場、每個時段的那一種門票各成一張）。bky-3 的取票方式由到店自取改為電子門票（原本只是順手寫的值），跨日示範在 release2.3 也帶得進來。

**2026-10-09 D384 補 D383 三題**（不新增功能編號，沿用 S87／S89 兩個標記判斷）：
- 匯入清單的到店自取（決定一）：S89 不在版本內時，取票方式是到店自取的 bookyay 活動（bky-5）標「不可帶入」並寫原因，由推導改為已裁決；最終版照舊可帶入。
- 活動詳情改門票圖片（決定二，產品規則、release2.3 與最終版都有）：`event-detail.html` 單張門票彈窗 `#ed-tm-img-field`（`renderTmImg()`），不掛 `data-feat`——與建立流程的門票圖片同屬保留在 release2.3 的功能。
- 創作者活動管理先標示（決定三，只動版本範圍）：`admin-creator-events.html` 清單列 `[data-ace-r24]`（`verBlock()`）——S87 不在版本內時多時段（`slots` > 1）、重覆（`repeat`）的活動，S89 不在版本內時到店自取（`ship: 'pickup'`）的活動，名稱旁掛「release2.3 不支援」徽章＋原因一行；最終版不出現。`js/sidebar.js` BOOKYAY_EVENTS 的摘要投影補 `slots`／`repeat`／`ship` 三欄與一場重覆活動 bky-11。

**2026-10-09 D391（含同日補充 11–15 題）**（不新增功能編號，各自沿用既有標記判斷）：
- 開賣方式「立即開賣／定時開賣」二選一（第 11 題）：create-event 第 7 步 `#ce-sale-mode`、event-detail 發布設定 `[data-pub="saleMode"]`，屬活動頁面本體（S72）與 bookyay 帶入（S73，帶入後鎖定），不掛 `data-feat`——release2.3 的 bookyay 帶入一定要看得到；開賣超出上架區間的紅字照舊掛 S62。
- 移除場次的確認（第 5 題）、售票中之後場次不能移除（第 12 題）、組合包裡隨場次刪除的門票停用（第 13 題）：只有多場次活動才會發生，跟著 S87（⚪）——create-event／event-detail 的移除鈕本來就只在兩場以上出現；示範活動 `pingtung-bluefin` 改成兩場（events.html 那一列掛 `data-feat="S87"`，release2.3 由 events-store `list()` 的多場過濾收起）。
- 售票中之後門票不能刪（第 12 題）：event-detail 單張門票彈窗刪除鈕停用＋原因，產品規則、不掛標記（release2.3 與最終版都有）。
- 主視覺裁切（第 9 題）：**2026-10-12 退場（D404）**——`#ce-kv-crop`、`#ed-kv-crop` 與粉絲預覽的 `keyvisualPos` 都已移除；只剩 1:1 原圖提示（`#ce-img-ratio-note`，S56）。
- bookyay 帶入門票的顯示／隱藏切換（第 10 題）：2026-10-09 D391 補充二（使用者「照建議」）改掛 S92（🔵 release2.3）——event-detail 單張門票彈窗的顯示開關列 `#ed-tm-show-row`、票卡與票券清單的「隱藏」徽章、create-event `tierShowRowHTML()`，判斷「bookyay 活動」→ S92（2026-10-16 D429：原本另含「1 人票 hideFix」，隨套票拆票機制退場），其餘（自建活動創作者自己切換）仍是 S55（⚪）。S55 本身不升級，避免把自建活動的顯示開關一起帶進 release2.3。
- 顯示開關所在的「上架與顯示」區塊（2026-10-12 自基本區獨立，UI-CHANGES 一百九十八）：event-detail `#ed-tm-show-sec`、create-event `tierSecHTML("d.tm.sec.show")` 的 `<section>` 掛與開關同一個標記（S92／S55，判斷同上）——開關被版本收起時整個區塊一起收，不留只有標題的空區塊（2026-10-15 補）。
- 組合包「無法販售」徽章（D391 補充二）：`js/listing-state.js` `STATUS_META.unavailable`，bundle-detail 頁首與 e-shop 活動組合包列使用；只出現在多場次活動移除場次之後，跟著 S87，不另掛標記。
- 定時開賣在未來的 bookyay 活動不出現「立即開賣」（第 11 題推導）：event-detail `#ed-golive-row`，不掛標記。

**2026-10-22 D470＋D471 取貨方式改勾選、移到建立商品步驟 2**（不新增功能編號、不掛標記，屬 S26／S33／S34 🟢 release2.2 的功能；使用者已說不進 release2.2，只進 release2.3 與最終版，UI-CHANGES 二百九十二）：`create-product.html` 步驟 1 只留「物流資料」（重量常駐、其餘收合）、步驟 2 開賣設定之後新增「取貨方式」勾選（物流配送／現場 QR 領取，至少一種）與取貨場次、取貨與退貨說明；`product-detail.html` 取貨方式改勾選、物流資料一律可編輯；單售商品仍只屬於一個取貨場次（D339 保留，彈窗「已綁定」照舊）。兩個版本都有，不切換。組合包自己的取貨場次另登記 S34.1 ⚪（只在最終版）。

**2026-10-20 D460 活動層預設購票規則永久移除**（所有版本，屬 S72 活動詳情與建立活動，🔵 release2.3；新登記 S103 ⚪，見該列）：create-event 票務設定彈窗的「購票規則」區塊（`#ce-rules-sec`／`#ce-rules`）、單張門票購買條件的「跟隨活動預設」開關與繼承摘要、event-detail 票務分頁的「預設購票規則」卡（`#ed-evrules`）與其草稿／變更偵測／儲存／離開防護項目，全部移除；條件只在單張門票自己的購買條件與組合包自己的購買條件。下面 D387／D388 兩段提到的「預設購票規則卡」自此作廢，只留門票彈窗的購買條件編輯。

**2026-10-20 D461 release2.3 門票的購買條件只開放折扣與限時折扣**（版本切割，規格與規則手冊照最終版、不動，比照 D383 決定八）：release2.3 所有門票的「新增條件」只列折扣與限時折扣；限時購買與限購新登記 S104 ⚪（門票專用，組合包的同名條件不受影響），粉絲分級三種照舊 S82 ⚪；bookyay 帶入並鎖定的每人總限購是帶入資料，release2.3 照樣顯示；S96（bookyay 門票自加折扣與限時折扣）由 ⚪ 改 🔵 release2.3。上面 D383 段「保留」清單裡的「限時購買」自此改由 S104 收起。最終版的七種條件照 D460 不變。

**2026-10-09 D388 自建活動發布後可在活動詳情修改購買條件**（不新增功能編號，屬 S72 活動詳情，🔵 release2.3）：`event-detail.html` 預設購票規則卡的編輯態與單張門票彈窗的購買條件區（自建活動）；條件清單的新增選單與條件卡照舊掛 `data-feat="S82"`（粉絲分級三種），release2.3 收起、最終版顯示（實測）。

**2026-10-09 D387 自建活動也唯讀顯示活動預設購票規則**（不新增功能編號，屬 S72 活動詳情，🔵 release2.3）：`event-detail.html` 票務分頁 `#ed-evrules` 改為所有活動都顯示；條件列裡的粉絲分級三種（限粉絲分級購買、粉絲分級折扣、限時＋限粉絲分級折扣）掛 `data-feat="S82"`，release2.3 收起。

**2026-10-12 D397 原型同步**（不新增功能編號、不掛新標記，🔵 release2.3）：`event-detail.html` 總覽右欄新增 `#ed-bky-scancard`（bookyay 現場掃碼卡，已排程／售票中，屬 S73／S56 延伸，同 D394）；票務商品的「建立組合包」（空狀態＋有組合包時的新增卡）帶 `?ev=&from=event-detail` 進 `create-bundle.html` 預帶票券成員（屬 S72 活動詳情與建立組合包的票券成員）；`scanner.html`（O29，🟢 release2.2 頁面）新增活動票券提前入場的結果呈現與兩顆示範鈕，屬活動提前入場設定（S72 活動頁面本體，release2.3）的掃描端，release2.2 凍結版不搬。

**2026-10-12 D401 原型同步**（不新增功能編號、不掛新標記，🔵 release2.3）：`#ed-bky-scancard` 撤除，改把原本的掃碼器卡 `#ed-scanner` 在已排程／售票中搬到總覽右欄（同 S73／S56 延伸）並加「前往領取場次」；`create-bundle.html` 從活動詳情進入鎖定活動（S72）；`pickup.html`（🟢 release2.2 頁面）新增 `?ev=` 篩選，只由活動詳情的「前往領取場次」帶入，release2.2 凍結版不搬（是否同步待使用者決定）。

**2026-10-12 D394 bookyay 活動的現場報到台**（不新增功能編號、不掛新標記，同 D385 的做法屬 S73／S56 延伸，🔵 release2.3）：`event-detail.html` `#ed-scanner` 對 bookyay 活動收起 ztor 掃碼器三格（`[data-ztor-scan]`），改顯示 `#ed-bky-scan`（bookyay 掃描器連結＋複製，值＝`ev.bkyScanUrl`）與 `#ed-scanner-bky`（前往取貨管理）；release2.3 與最終版都看得到。

**2026-10-09 D385 bookyay 帶入活動在活動詳情的補齊**（不新增功能編號、不掛新標記，屬 S56 bookyay 帶入欄位規則與 S73 的延伸，🔵 release2.3）：`event-detail.html` 單張門票彈窗的唯讀購買條件區 `#ed-tm-rules-sec`、票務分頁的唯讀預設購票規則卡 `#ed-evrules`、bookyay 門票刪除停用＋原因、提前入場鎖定；`create-event.html` bookyay 票入場區唯讀、bookyay 草稿續填重跑帶入；示範活動 `hsinchu-vinyl-sf`（順豐寄送、單一時段）。release2.3 與最終版都看得到（實測）。

**data-feat 標註現況（2026-07-14 全面切割）**：S05/S06 商店設定付款·出貨、S11 拍賣入口/頁級、S24 專案引用卡、S45 組合限量、O04/O09 已取消／爭議 KPI·篩選、O17/O18/O22/O23 訂單詳情升級功能、E08/E09/E13–E18/E20/E22/E23/E24 收入與提款功能皆有 gate。scope 未列的產品頁以 `data-page-feat="full"` 限為 Phase 4；跨頁連結在低版本隱藏。S31.1 保持 `data-feat`／`data-feat-off` 成對切換。

---

## S · 商店管理 — Shop Management

ID 起始 `S01…` ｜ 🟢 46 · 🔵 31 · 🟣 11 · ⚪ 38 · ⚫ 退場 4（2026-10-23 使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP：S86、S93、S106、S112–S114 ⚪ 改 🟣、補登 S120 🟣、S121–S125 ⚪，以程式逐列重數；2026-10-23 release2.4 建立：補登 S115–S117 🟣、S118–S119 ⚪，S110 ⚪ 改 🟣，以程式逐列重數——補登前 ⚪ 實為 38、原寫 37；2026-10-23 D477：補登 S112–S114 ⚪；2026-10-23 D476：補登 S107–S111 ⚪；2026-10-22 D475：補登 S106 ⚪；2026-10-21 D463：補登 S105 ⚪；2026-10-20 D461：S96 ⚪ 改 🔵、補登 S104 ⚪，以程式逐列重數——原寫 🔵 29／⚪ 26 漏了同日 S79 改 🔵 與補登 S101／S102；2026-10-20 D460：補登 S103 ⚪；2026-10-19 以程式逐列重數更正 🔵 28→29，S100 補登時沒加；2026-10-16 以程式逐列重數：原寫 🔵 22／⚪ 28 已過時；同日 S45、S63、S64 ⚪ 改 🔵）

| ID    | 功能                              | English                                          | Tier       | Build    | 備註                                                        |
| ----- | ------------------------------- | ------------------------------------------------ | ---------- | -------- | --------------------------------------------------------- |
|       | **通用功能**                        | Common                                           |            |          |                                                           |
| `S01` | 　頂部庫存預警提示條                      | Low-stock alert bar                              | 🟢 release2.2 | ✅ built  |                                                           |
| `S02` | 　篩選                             | Filter                                           | 🟢 release2.2 | ✅ built  |                                                           |
| `S03` | 　商店設定                           | Store settings                                   | 🟢 release2.2 | ✅ built  |                                                           |
| `S04` | 　　編輯封面 / 頭像 / 名稱 / 連結 / 描述 / 幣種 | Edit cover/avatar/name/URL/desc/currency         | 🟢 release2.2 | ✅ built  |                                                           |
| `S05` | 　　付款設定                          | Payment settings                                 | 🔵 release2.3    | ✅ built  | Stripe status read-only; details TBD                      |
| `S06` | 　　出貨設定（出貨地址、免運門檻）               | Shipping defaults (address, free-ship threshold) | 🔵 release2.3    | ✅ built  | config fields only — no carrier integration               |
| `S07` | 　　粉絲預覽視角                        | See-as-fan preview                               | 🟢 release2.2 | ✅ built  |                                                           |
| `S08` | 　商店預覽頁面                         | Store preview                                    | 🟢 release2.2 | ✅ built  |                                                           |
|       | **　建立 商品 / 組合 / 拍賣**            | Create product / bundle / auction                |            |          |                                                           |
| `S09` | 　　建立商品（入口）                      | Create product entry                             | 🟢 release2.2 | ✅ built  |                                                           |
| `S10` | 　　建立組合（入口）                      | Create bundle entry                              | 🟢 release2.2 | ✅ built  |                                                           |
| `S11` | 　　建立拍賣（入口）                      | Create auction entry                             | ⚪ TBD      | ✅⬆ ahead | auctions deferred                                         |
|       | **商品**                          | Products                                         |            |          |                                                           |
| `S12` | 　商品列表                           | Product list                                     | 🟢 release2.2 | ✅ built  |                                                           |
| `S13` | 　　排序                            | Sort                                             | 🟢 release2.2 | 🟡 gap   |                                                           |
| `S14` | 　　欄位（圖片/名稱/分類/價格/狀態/庫存）         | Columns                                          | 🟢 release2.2 | ✅ built  |                                                           |
|       | **　　狀態**                        | Statuses                                         |            |          |                                                           |
| `S15` | 　　　已上架（上架／顯示／開賣三開關、編輯）           | Listed (three switches, edit)                    | 🟢 release2.2 | ✅ built  | 2026-09-03 D241：單一「上架」開關拆成上架／顯示／開賣三開關，見主規格 §7.14 |
| `S16` | 　　　已隱藏                          | Hidden                                           | 🟢 release2.2 | ✅ built  |                                                           |
| `S17` | 　　　庫存過低                         | Low stock                                        | 🟢 release2.2 | ✅ built  |                                                           |
| `S18` | 　　　補貨流程（數量/供應商/到貨日/備註/確認）       | Restock flow                                     | 🟢 release2.2 | ✅ built  |                                                           |
| `S19` | 　　　已售完                          | Sold out                                         | 🟢 release2.2 | ✅ built  | status shown; exact UI TBD                                |
| `S20` | 　　　草稿                           | Draft                                            | 🟢 release2.2 | ✅ built  |                                                           |
| `S21` | 　　商品詳情 / 編輯                     | Product detail / edit                            | 🟢 release2.2 | ✅ built  |                                                           |
| `S22` | 　　　顯示狀態 / 分類                    | Show status/category                             | 🟢 release2.2 | ✅ built  |                                                           |
| `S23` | 　　　銷售摘要（件數/毛收/淨利 → 收入管理）        | Sales summary                                    | 🟢 release2.2 | ✅ built  | reads from Earnings minimum                               |
| `S24` | 　　　被專案引用（引用列表 / 前往專案）           | Referenced by project                            | ⚪ TBD      | ✅⬆ ahead | needs project/crowdfund module                            |
| `S25` | 　　　以粉絲身份預覽                      | See-as-fan preview                               | 🟢 release2.2 | ✅ built  |                                                           |
| `S26` | 　建立商品                           | Create product                                   | 🟢 release2.2 | ✅ built  |                                                           |
| `S27` | 　　展示圖（主圖 / 副圖）                  | Media (main/sub)                                 | 🟢 release2.2 | ✅ built  |                                                           |
| `S28` | 　　商品資訊（名稱/描述/分類/規格）             | Info                                             | 🟢 release2.2 | ✅ built  |                                                           |
| `S29` | 　　商品規格（單一 / 多規格）                | Variants (single/multi)                          | 🟢 release2.2 | ✅ built  |                                                           |
| `S30` | 　　定價（價格 / 原價 + 爆米花價）            | Pricing + POPCORN price                          | 🟢 release2.2 | 🟡 gap   | POPCORN price is net-new                                  |
| `S31` | 　　庫存（不限量 / 限量 + 低庫存提醒）          | Inventory                                        | 🟢 release2.2 | ✅ built  |                                                           |
| `S31.1` | 　　　低庫存門檻自訂（逐商品／逐規格，覆寫預設 10%） | Custom low-stock threshold                | 🔵 release2.3   | ✅ built  | 已建 create-product／product-detail 自訂門檻輸入，cheat code「版本」以 `data-feat="S31.1"`／`data-feat-off` 控制（release2.2 隱藏＝固定 10%、release2.3 起顯示可編輯）；逐規格粒度未做（spec §8）。spec §7.2／D105 |
| `S32` | 　　多規格價格與庫存（SKU / 成本）            | Variant matrix (SKU/cost)                        | 🟢 release2.2 | ✅ built  |                                                           |
|       | **　　取貨方式**                      | Fulfillment method                               |            |          |                                                           |
| `S33` | 　　　物流配送（重量/分類/尺寸/寄件地）           | Logistics fields                                 | 🟢 release2.2 | ✅ built  | data entry only — no carrier API                          |
| `S34` | 　　　現場 QR 領取（領取說明）               | On-site QR pickup                                | 🟢 release2.2 | ✅ built  |                                                           |
| `S34.1` | 　　　組合包自己的取貨場次（選填；設了之後成員領取單位歸組合包的場次） | Bundle-level pickup session (optional) | ⚪ TBD | ✅⬆ ahead | D471（2026-10-22）：只在最終版，release2.3 沒有（使用者：「組合包可以另外設取貨場次在 release2.3 不需要」）；release2.3 組合包只沿用各成員自己的場次。規格 5.1.5.4 F9、5.1.5.9 §2.6；2026-10-22 原型已實作（UI-CHANGES 二百九十二）：`partials/pickup-session-modal.js` mountBundlePickup 的開關列 `[data-bp-own]` 掛 `data-feat="S34.1"`，`create-bundle.html` 取貨與核銷節、`bundle-detail.html` §2.6；`js/devtools.js` FEAT_TIER 後備補一筆。2026-10-22 D473（UI-CHANGES 二百九十四）：`create-bundle.html` 的「取貨與核銷」整節搬到步驟 2（上架與開賣之後、購買條件之前）並整節掛 `data-feat="S34.1"`，release2.3 建立組合包不出現這一節（含成員唯讀列表）；組合詳情只有開關列受控，不變 |
| `S35` | 　　購買限制與標籤（每人限購 / 標籤）            | Purchase limit & tags                            | 🟢 release2.2 | ✅ built  |                                                           |
| `S36` | 　　預覽 / 上架開賣                     | Preview & publish                                | 🟢 release2.2 | ✅ built  |                                                           |
| `S37` | 　　稍後再存（草稿）                      | Save draft                                       | 🟢 release2.2 | ✅ built  |                                                           |
| `S38` | 　　開始售賣                          | Start selling                                    | 🟢 release2.2 | ✅ built  |                                                           |
| `S39` | 　　　發布貼文（標題/內容/收件對象/排程）          | Product-drop social post                         | 🟢 release2.2 | ✅ built  | reuses Ztor's existing social-post feature — no new build |
|       | **組合**                          | Bundles                                          |            |          |                                                           |
| `S40` | 　組合包列表（欄位 / 狀態）                 | Bundle list                                      | 🟢 release2.2 | ✅ built  |                                                           |
| `S41` | 　建立組合包                          | Create bundle                                    | 🟢 release2.2 | ✅ built  |                                                           |
| `S42` | 　　組合包名稱                         | Name                                             | 🟢 release2.2 | ✅ built  |                                                           |
| `S43` | 　　商品（新增 / 近期預覽）                 | Items                                            | 🟢 release2.2 | ✅ built  |                                                           |
| `S44` | 　　定價（固定價 / 折扣價）                 | Pricing (fixed/% off)                            | 🟢 release2.2 | ✅ built  |                                                           |
| `S45` | 　　限量                            | Quantity limit                                   | 🔵 release2.3 | ✅⬆ ahead | 2026-10-16 使用者裁決 release2.3 電子商店範圍（建立商品、組合包，以及其流程產出的詳情頁與訂單進 2.4；拍賣、需求看板、服飾尺寸屬性不進）：⚪ 改 🔵 release2.3。 |
| `S46` | 　　發布貼文                          | Publish post                                     | 🟢 release2.2 | ✅ built  | reuses Ztor's existing social-post feature                |
| `S47` | 　組合包詳情 / 編輯                     | Bundle detail / edit                             | 🟢 release2.2 | ✅ built  |                                                           |
| `S47.1` | 　　活動組合包：改允許的門票與張數（尚未售出可改、已售出鎖定） | Event bundle: change allowed tickets & per-set quantity | 🔵 release2.3 | ✅⬆ ahead | D433 決定四（2026-10-16）：bundle-detail 編輯模式票券列下方展開允許門票勾選表（共用 `js/tix-tier-table.js`，與 create-bundle 同一張表）；已售出後表格鎖定。功能閘在 JS（未掛元素標記，表只在活動組合包編輯態出現） |
| `S48` | 　　銷售摘要                          | Sales summary                                    | 🟢 release2.2 | ✅ built  | reads from Earnings                                       |
| `S49` | 　　庫存與成員影響（各成員可售量取最小，鎖定量優先）       | Stock = min(member sellable)                     | 🟢 release2.2 | ✅ built  | 2026-09-03 D241：取代舊「= 最少成員」，成員有鎖定用鎖定量、沒鎖定用沒有被鎖定的庫存量，見主規格 §7.14 |
| `S50` | 　　以粉絲身份預覽                       | See-as-fan preview                               | 🟢 release2.2 | ✅ built  |                                                           |
| `S51` | 　商店優惠碼（清單／新增／編輯／期間／停用）           | Store discount codes                             | 🟢 release2.2 | ✅ built  | D183；2026-09-15 D272 補範圍三級、每單件數／每人總次數／總兌換、已用完；2026-09-17 D279 Phase 1 只留期間／折扣／範圍；2026-09-22 D299 Phase 1 指定商品改可多選含票種、碼不分大小寫。自用碼各版本皆有；代理碼（推廣者／分成／代理銷售紀錄）只在 Phase 4，走保留 gate `full`（D185） |
| `S51.1` | 　　優惠碼「指定商品」可選獨立票（自成一組、標「獨立票」） | Discount code: standalone tickets in "specific items" | 🔵 release2.3 | ✅⬆ ahead | D432（2026-10-16）：store-settings 指定商品候選多一組「獨立票」（events-store 的 `tier.standalone`，只列售票中／已排程／進行中的活動）；`ztorDevState.featOn('S51.1')` 為假時退回舊寫法（獨立票混在票種組） |
|       | **活動（建立活動／活動詳情）**                 | Events (create / detail)                         |            |          | 2026-09-29 補登（D328）：這幾列登記活動模組內的個別元素。2026-10-07 release2.3 切割：活動清單／活動詳情／建立活動三頁改頁級 `data-page-feat="S72"`（🔵 release2.3），建立活動只留 bookyay 帶入（S73），其他建立方式與周邊功能見 S74–S78；bookyay 帶入會填寫的欄位（S52／S53／S56／S58／S59／S67）一起改 🔵 release2.3 |
| `S52` | 　活動語言複選（七選項）                     | Event languages (multi-select)                   | 🔵 release2.3| ✅⬆ ahead | D328；create-event 步驟 2 `[data-ce-lang-field]`；bookyay 帶入多值鎖定；2026-09-30 D340 改下拉複選（Zselect `--multi`）、必填至少 1 種 |
| `S53` | 　跨日活動（場次結束日期）                    | Multi-day date (end date)                        | 🔵 release2.3| ✅⬆ ahead | D328；create-event 步驟 3 與 event-detail 場次盒 `[data-sess-md-group]` |
| `S54` | 　門票簡介                            | Ticket description                               | ⚫ 退場      | ✅⬆ ahead | 2026-10-05（D353）已退場——撤銷 D328 決定二：bookyay「活動門票簡介」不帶入，單張門票彈窗的門票簡介整欄移除（create-event／event-detail／粉絲頁票列／翻譯表同輪拿掉）。原註： D328；單張門票彈窗基本區（create-event／event-detail）；可翻譯 |
| `S55` | 　門票顯示／隱藏                         | Ticket show / hide                               | ⚪ TBD      | ✅⬆ ahead | D328；單張門票彈窗顯示開關＋卡片「隱藏」標示；隱藏的票不在粉絲頁票價清單；~~2026-09-29 D329 補充／D330：發布後隱藏最後一張顯示中的門票時擋下~~（2026-10-15 D424 決定九取消：隱藏不再受可賣性防呆限制；刪除最後一張、停售最後一組組合包造成沒有可賣的東西時擋下的規則照舊）；2026-09-29 D331：下架、隱藏、封存最後一組仍在販售的組合包也擋（組合商品細節頁開關旁紅字 `#bd-list-stop-err`／`#bd-shown-stop-err`、頁首與電子商店清單列純告知彈窗），草稿不擋、售罄不擋；2026-10-09 D383 決定七：隱藏狀態與標示拆出成 S92（🔵 release2.3）——「隱藏」徽章、1 人票（hideFix）的鎖定開關、組合商品細節頁的可賣性防呆紅字改掛 S92；本列只剩「創作者自己切換門票顯示開關」（create-event／event-detail 單張門票彈窗的一般門票開關列、~~event-detail `#ed-tm-show-err` 紅字~~（已於 D424 決定九退場，`event-detail.html` 留墓碑註解）），維持 ⚪ |
| `S56` | 　bookyay 帶入欄位規則（只帶第一種票提示 D440 恢復、多個時段合成同一場 D440、跨日；~~2 人票拆成 1 人票再包裝成組合包~~ D429 退場、~~早鳥轉折扣~~ D417 退場） | bookyay field mapping                | 🔵 release2.3| ✅⬆ ahead | **2026-10-16 D429：「每張門票人數」不帶入，套票拆 1 人票＋自動組合包整組退場（本列其他帶入規則照舊、仍 🔵）——下文凡寫到「自動組合包」「1 人票」的部分都已撤除；套票帶入後就是一張普通 bookyay 門票（票價、張數照 bookyay 並鎖定）。** **2026-10-16 D439：一個時段的所有門票種類都帶入（每種一張 bookyay 門票、張數各帶時段人數上限〔推導〕），「每個場次只帶入第一種票」略過提示 `#ce-bky-skip-note` 退場。** **2026-10-16 D440（取代 D439）：一個時段只帶第一種門票、略過提示 `#ce-bky-skip-note` 恢復（D328 原文案）；張數＝該時段人數上限（一對一）；不管 bookyay 設幾個時段（含重覆活動展開的時段）帶入都合成同一場，日期、時間、跨日與提前入場取第一個時段（使用者確認定案），每個時段那一種門票各成這場一張門票，同名時票名後補「· 時段 N」〔推導，UIA-271〕；D383 的多時段／重覆在 release2.3 不能帶入（`d.bgate.multi`／`d.bgate.repeat`、Admin `ace.r24.multi`／`ace.r24.repeat`）移除，只剩到店自取擋；示範草稿 `mirror-khh-draft` 改一場三張門票、活動清單列改掛 S56。** D328／5.1.6.1 F21；略過提示 `#ce-bky-skip-note`（D439 退場、D440 恢復）；2026-09-29 D329：地點→場地名稱、地區→完整地址、1:1 原圖提示 `#ce-img-ratio-note`、早鳥分流並鎖定、自動組合包整組鎖定（限時折扣讀數與鎖定說明同掛 S56）；2026-09-29 D330：帶入金額換算成創作者幣別當基準價、價格表港幣欄鎖 bookyay 原價、其他幣別可覆寫；自動組合包不能刪除、不能加商品；2026-09-29 D331：創作者自建、含 bookyay 票券的組合包港幣欄依公式鎖定（建立活動、建立組合、在地化三處價格表）、清單與 KPI 用覆寫值、草稿活動刪除時自動組合包連動刪除（活動清單草稿列 `khh-countdown-draft`） |
| `S57` | 　說明區塊（標題＋內文，可增刪、可排序）           | Info sections                                    | ⚫ 退場      | ✅⬆ ahead | 2026-10-05（D354）已退場——說明區塊整組由描述的無標題文字區塊取代（見 S67），`partials/info-sections.js`／`info-sections.css` 留墓碑。原註： D334；create-event 步驟 2 描述下方 `[data-feat="S57"]`、event-detail 活動內容同一支（`partials/info-sections.js`）；取代已刪的「進階詳細資料」兩份清單；可翻譯（標題與內文各一格）；粉絲活動頁呈現暫不做（ASSUMPTIONS UIA-186） |
| `S58` | 　描述的圖片與影片區塊（插入、刪除；整份最多 10 個；bookyay 帶入保留） | Description media blocks | 🔵 release2.3| ✅⬆ ahead | D354（2026-10-05）：圖片與影片各自成一個區塊、排在插入它的文字區塊之後，上限改為整份描述合計 10 個；插入鈕群組 `.rich-body__ins[data-feat="S58"]`。前身 D335；`partials/rich-body.js` 的「插入圖片／插入影片」列掛 `[data-feat="S58"]`（create-event 描述、說明區塊內文，event-detail 同一支）；bookyay 活動詳情的圖片影片照段落帶入；翻譯表只列文字；粉絲活動頁描述下方最小呈現（ASSUMPTIONS UIA-187） |
| `S59` | 　描述文字區塊的格式：粗體、斜體、連結、清單、分隔線（bookyay 帶入保留格式） | Description text formatting                      | 🔵 release2.3| ✅⬆ ahead | D354（2026-10-05）補斜體、連結（只收 http／https、新分頁開啟）、分隔線；前身 D340；`partials/rich-body.js` 格式鈕群組 `.rich-body__fmt[data-feat="S59"]`（create-event 描述＋說明區塊、event-detail 描述＋說明區塊） |
| `S60` | 　粉絲活動頁呈現說明區塊（關於活動下方、太長收合）        | Info sections on the fan event page              | ⚫ 退場      | ✅⬆ ahead | 2026-10-05（D354）已退場——粉絲頁不再另畫說明區塊，描述的區塊照順序畫在「關於活動」（`.pdp-details__lead`）。原註： D340；`js/fan-event-page.js` `.pdp-info[data-feat="S60"]`（create-event 第 8 步、event-localization 預覽） |
| `S61` | 　活動顯示設定（顯示／隱藏＋隱藏時活動連結）            | Event display setting (shown / hidden + link)    | 🔵 release2.3| ✅⬆ ahead | D340；create-event 步驟 7、event-detail 設定 → 發布設定的「顯示設定」區塊 `[data-feat="S61"]`；2026-10-07 使用者指出 release2.3 的發布設定看不到顯示與隱藏，改 🔵 release2.3；同日 D363：售票中／進行中顯示設定仍可切換，活動隱藏時含其票券的組合包跟著隱藏（bundle-detail `[data-bd-event-hidden-lock]`、create-bundle `[data-cb-tshown-lock]` 同掛 S61）。 |
| `S62` | 　活動販售的時間層級＋票務商品上架與開賣跟隨／另設 | Event sales time layers + ticket-bundle follow / custom times | 🔵 release2.3| ✅⬆ ahead | D342；create-event 第 7 步售票期間紅字 `[data-ce-tl-err]`、第 5 步限時間紅字、第 6 步「上架與開賣」段；bundle-detail／create-bundle 含票券成員時的 `[data-tb-host]`；event-detail 開賣設定紅字 `[data-ed-tl-err]`；共用 `js/ticket-bundle.js`＋Follow field；2026-10-07 使用者重申「票務有提前販售時間時，定時上架不可晚於該時間」，改 🔵 release2.3；create-event 上架日期與時間下方新增紅字 `[data-ce-tl-err="list-from"]`（指出最早一筆販售時間）；同日 D363：販售結束不晚於活動停售（`js/ticket-bundle.js` `lateEnd()`）。 |
| `S63` | 　票務商品的購買條件與限購（預設取最嚴、只能收窄） | Ticket-bundle purchase rules & limits | 🔵 release2.3| ✅⬆ ahead | 2026-10-16 使用者指示「電子商店的調整也要包含在 release2.3 中，組合包也要補進去」：⚪ 改 🔵 release2.3（D427／D428／D436 都以組合包有購買條件與限購為前提）。D342；create-event 第 6 步「購買條件與限購」段、bundle-detail `[data-tb-rules-sec]`、create-bundle 預設讀數 `[data-tb-host="cb-rules"]` 2026-10-22 D467 第 4 項（只記在功能表與 D467，不寫進規格正文）：release2.3 的建立組合包步驟 2「購買條件」由唯讀改為建立時可設，規則照舊（預設套用所含門票、取最嚴、只能收窄；純商品組合包預設不限），沿用組合詳情 release2.3 的編輯元件與擋存。 |
| `S64` | 　建立活動第 6 步補齊的組合包欄位（素材、限時折扣、優惠碼疊加、逐票種分配；電影關聯 2026-10-15 拆出為 S97） | Ticket-bundle fields in create-event step 6 | 🔵 release2.3| ✅⬆ ahead | 2026-10-16 使用者指示「電子商店的調整也要包含在 release2.3 中，組合包也要補進去」：⚪ 改 🔵 release2.3。D342／5.1.6.1 F20；`js/bundle-editor.js` SPLIT 的 `[data-feat="S64"]` 區塊；2026-10-15 D422 決定二：電影關聯區塊改掛 S97；2026-10-16 起區段內欄位全被收起時整段（含標題）一併收起 |
| `S97` | 　建立活動第 6 步票務商品的電影關聯（自 S64 拆出） | Film link on ticket bundles in create-event step 6 | 🔵 release2.3| ✅⬆ ahead | D422 決定二（2026-10-15）：建立活動流程的票務商品提供電影關聯、release2.3 也提供（5.1.6.1 F20，同 5.1.5.4 F10）。`js/bundle-editor.js` SPLIT 的 `section[data-bd-sec="films"][data-feat="S97"]`（共用 `partials/film-picker.js`）；S64 其餘欄位 2026-10-16 起亦為 🔵 |
|       | **活動 release2.3 切割（2026-10-07）**          | Events — release2.3 slice                        |            |          | 使用者指示：release2.3 主要只交付「由 bookyay 帶入活動來建立」，其他建立方式先隱藏，看過切割畫面再調整 |
| `S72` | 　活動模組頁面（活動清單、活動詳情、建立活動）            | Events pages (list, detail, create)              | 🔵 release2.3 | ✅⬆ ahead | events.html／event-detail.html／create-event.html 頁級 `data-page-feat="S72"`；已從 `js/devtools.js`／`js/sidebar.js` 兩份 `FULL_ROUTES` 移出，側欄「活動」在 release2.3 出現 |
| `S73` | 　由 bookyay 帶入建立活動（搜尋 bookyay 活動→帶入→鎖定欄位） | Create an event by importing from bookyay       | 🔵 release2.3 | ✅⬆ ahead | create-event 第 1 步選類型後的 bookyay 帶入關卡 `[data-bgate]`／`#ce-bky-go`；Admin 創作者活動「繼續設定」帶 `?import=` 直接進入。只登記、不掛標記（關掉會沒有建立路徑） |
| `S74` | 　手動建立活動（略過 bookyay、切換活動類型）          | Create an event manually (skip bookyay)          | ⚪ TBD      | ✅⬆ ahead | create-event `#ce-bky-skip`「略過」、步驟頁頭的切換類型鈕 `#ce-type-switch`（切換後不再經過 bookyay 關卡） |
| `S75` | 　Watch Party 活動類型                    | Watch Party event type                           | ⚪ TBD      | ✅⬆ ahead | create-event 類型卡 `[data-gate-type="watchparty"]`；Watch Party 不經 bookyay、只能手動建立；2026-10-07 使用者裁示 release2.3 保留；**2026-10-15 D422 決定一改 ⚪**：release2.3 不含共看派對——建立活動選不到、活動清單的共看派對示範活動一起收起（`events.html` 七列 `data-feat="S75"`、`js/events-store.js` `list()` 在版本不含 S75 時濾掉 `type:'watchparty'`，清單計數跟著排除） |
| `S79` | 　其他線下活動類型入口（見面會、音樂節、發表派對） | Other offline event type entries | 🔵 release2.3 | ✅⬆ ahead | create-event 類型卡 `[data-gate-type="meet|festival|launch"]`；2026-10-20 使用者裁示 release2.3 保留演唱會、見面會、音樂節、發表派對四類，四類建立流程相同（只有 Watch Party 走專屬分支）；原 2026-10-07 只留演唱會一個入口，線上活動拆為 S101 |
| `S101` | 　線上活動類型入口（Virtual Event） | Virtual event type entry | ⚪ TBD      | ✅⬆ ahead | create-event 類型卡 `[data-gate-type="virtual"]`；2026-10-20 自 S79 拆出，release2.3 仍不含 |
| `S102` | 　取票方式：順豐寄送（郵寄） | Ticket delivery: SF Express shipping | ⚪ TBD      | ✅⬆ ahead | 2026-10-20 使用者裁示：release2.3 取票方式只有電子門票（沒有郵寄與自取，自取見 S89）。create-event 取票方式 `[data-val="sf"]`、event-detail 發布設定 `[data-pub-val="sf"]`；不在版本內時，取票方式是順豐寄送的 bookyay 活動在匯入清單標不可帶入（同 S89 做法：create-event `bkyVerBlock()`、創作者活動管理 `verBlock()`，原因字串 `d.bgate.sf`、`ace.r24.sf`） |
| `S103` | 　票務設定彈窗（手動建立活動的票種與票務） | Ticket setup dialog (ticket types & tickets for manually created events) | ⚪ TBD      | ✅⬆ ahead | 2026-10-20 D460：release2.3 全是 bookyay 匯入、票種票價張數已鎖定，create-event 步驟 4 不提供票務設定彈窗；入口按鈕 `#ce-quick-open`、彈窗 `#ce-quick-modal`、第一次新增門票時「用快速設定」那張卡 `[data-tixstart="quick"]` 掛 `data-feat="S103"`，TBD 版本收起；bookyay 匯入後的票種列表與單張門票卡不受影響（仍可點開門票彈窗）；最終版（`?version=full`）保留彈窗，但同日起沒有「購票規則」區塊（活動層預設購票規則永久移除，所有版本）。FEAT_TIER 後備表 `S103: 'tbd'` |
| `S104` | 　門票的限時購買與限購（購買條件） | Ticket sales window & purchase limits (purchase conditions) | ⚪ TBD      | ✅ built  | 2026-10-20 D461：release2.3 的門票（bookyay 匯入與自建都一樣）只能新增折扣與限時折扣，限時購買（Sales window）與限購（Purchase limits）只在最終版。`js/purchase-conds.js` 的 `TIX_FEAT`（buyTime／cap → S104）只由門票的呼叫端經 `ctx.typeFeat` 傳入（create-event 步驟 4 單張門票彈窗、event-detail 單張門票彈窗），新增選單的兩個選項 `[data-cond-add][data-feat="S104"]` 與創作者自設的條件卡 `.cond-list__item[data-feat="S104"]`、event-detail 唯讀條件列、create-event 票卡的購買條件與限購摘要，release2.3 由 `regate()` 收起；bookyay 帶入並鎖定的每人總限購（`bky`）不掛、照樣顯示；組合包的購買條件與限購（S94）不傳 `typeFeat`、不受影響。FEAT_TIER 後備表 `S104: 'tbd'` |
| `S105` | 　一般商品與票務組合包共用七種購買條件（組合包不沿用單品與成員、建立時可設） | Shared purchase conditions for products & ticket bundles (bundles don't follow members; settable at creation) | ⚪ TBD      | ✅ built  | 2026-10-21 D463：一般商品（建立商品第二步、商品細節）與票務組合包（建立組合包第二步、組合包細節、建立活動第 5 步組合包彈窗）共用同一份七種條件，新建時沒有條件，組合包不再跟隨所含門票；只在最終版。新區塊掛 `data-feat="S105"`，舊的限購／折扣節掛 `data-feat-off="S105"`，release2.3 由 `regate()` 切換。FEAT_TIER 後備表 `S105: 'tbd'` 2026-10-22 D467 第 3 項：組合包的排程特價就是「限時折扣」條件，同一份資料——組合詳情與建立組合的價格階梯「限時折扣」兩列掛 `data-feat-off="S105"`，最終版只在購買條件出現；舊排程特價轉入（`purchase-conds.js` `legacyConds`）。 |
| `S80` | 　條款與細則：直接促銷同意開關（接受主辦者用於直接促銷＋行銷同意文字） | Consent to direct marketing | ⚫ 退場      | ✅⬆ ahead | 2026-10-12（D395）已退場——使用者裁示移除「接受主辦者用於直接促銷」，條款與細則只留「條款及細則」；create-event、create-event-legacy、event-localization 翻譯表、events-store 假資料已移除。event-detail 活動內容 `#ed-terms` 的同一組已於同日移除。原：D340；release2.3 只留「條款及細則」開關（2026-10-07 使用者裁示）；2026-10-07 D362 起 event-detail 同一組也掛 S80 |
| `S76` | 　複製活動／再辦一次                         | Duplicate / run it again                         | ⚪ TBD      | ✅⬆ ahead | events.html 列選單「Duplicate」×50、event-detail `[data-ed-duplicate]`（頁首＋結束後總覽卡）；兩者都是不經 bookyay 的建立方式 |
| `S77` | 　舊版建立流程（對照用備份頁）                   | Create event (old flow)                          | ⚪ TBD      | ✅⬆ ahead | events.html 建立鈕下拉第二項 → create-event-legacy.html（該頁本身仍是頁級 `full`） |
| `S78` | 　活動預覽與在地化                          | Event preview & localization                     | 🔵 release2.3| ✅⬆ ahead | event-detail 頁首 `[data-ed-localize]`（2026-10-19 D453：設定子分頁「在地化」與其面板、卡內按鈕已拿掉，入口只剩頁首）；event-localization.html 本身仍是頁級 `full`；2026-10-09 D383 決定七改 🔵 release2.3（對齊 D375 決定四、D330），event-localization.html 頁級改掛 `data-page-feat="S78"`，release2.3 也進得去 |
| `S81` | 　活動上架／下架（創作者與 Admin 都能操作，含重新上架）＋「已下架」徽章 | Unlist / relist an event + Unlisted badge | 🔵 release2.3| ✅⬆ ahead | D361 決定五（2026-10-07）建；2026-10-08 D371 決定一、四：創作者本人與 Admin 代管態都能下架與重新上架、草稿以外五個階段都有（已結束／已取消重新上架前先提示），改 🔵 release2.3。event-detail 設定分頁 `#ed-unlist`（`[data-ed-unlist]`／`[data-ed-relist]`）、頁首 `#ed-unlisted-badge`；events.html 清單列狀態欄注入的 `[data-ev-unlisted]` 徽章。上架是階段以外的維度，下架不改階段 |
| `S81.1` | 　　活動發布後只能改庫存（上架中編輯鎖定、翻譯與通知要先下架；活動組合包看自己的上架狀態） | Published & listed event: stock-only edits | 🔵 release2.3 | ✅⬆ ahead | D435（2026-10-16）：event-detail 編輯模式上架中只開放門票張數，說明列 `[data-ed-stockonly-note]`＋下架入口、在地化入口停用；定時上架未到＝視為已下架。bundle-detail 活動組合包上架中「編輯組合」停用＋`[data-bd-stockonly-note]`（只剩鎖定套數）。2026-10-16 D438：另設的上架、下架、開賣、停售時間屬營運動作——bundle-detail 上架中「編輯組合」改回可按、只開放上架與開賣兩節（`bdStockLockApply()`），說明列改「只能改鎖定套數與上架、開賣時間」；另設時間寫回 events-store `sched` |
| `S82` | 　購票規則的粉絲分級條件（限粉絲分級購買、粉絲分級折扣、限時＋限粉絲分級折扣） | Fan-tier purchase conditions (fan tier only, fan tier discount, limited-time fan tier discount) | ⚪ TBD      | ✅⬆ ahead | D366 決定五／D367 決定三（2026-10-07）：create-event 購票規則「新增條件」選單的三個選項 `[data-cond-add][data-feat="S82"]` 與已加的條件卡 `.cond-list__item[data-feat="S82"]`（活動層票務設定彈窗、單張門票彈窗）；選單是 JS 畫的，畫完呼叫 `ztorDevState.regate()` 重跑 data-feat、換版本時重畫；2026-10-09 D388 起畫法在共用元件 `js/purchase-conds.js`，event-detail 的條件清單（預設購票規則卡編輯態、單張門票彈窗）同樣掛。其餘四種條件（限時購買、限購、折扣、限時折扣）隨 S72 進 release2.3 **2026-10-16 使用者裁決**：粉絲分級條件不進 release2.3（純商品組合包的同類條件同樣由 S82 收起，js/purchase-conds.js）。 |
| `S83` | 　建立活動第 7 步「其他售票時間」摘要（早於正式開賣就能買的門票與票務商品，唯讀＋回到該步修改） | Other sale times summary (create event step 7) | 🔵 release2.3| ✅⬆ ahead | D361 決定一建（2026-10-07，原掛 S62）；2026-10-08 D371 決定四另登記、標 🔵 release2.3。create-event `#ce-sale-other`（`renderOtherSale()`，沒有任何一筆時整塊收起） |
| `S84` | 　創作者活動管理（Admin：bookyay 匯入活動清單、逐場對應創作者、解除對應） | Creator event management (admin: imported bookyay events, map / unmap creators) | 🔵 release2.3| ✅⬆ ahead | D373 決定三（2026-10-08）：整頁 `admin-creator-events.html` 頁級 `data-page-feat="S84"`（release2.2 預覽導回 E-Shop）；入口同掛——側欄／頂列 Admin 列「創作者活動管理」（`js/sidebar.js` ADMIN_NAV `feat`）、Creator 詳情「已匯入 M 場活動」（`creator-detail.html` `.cd-imported`）。修訂 D324 把本頁列入 Phase 1 那一項。D374 撤除就地建立待啟用帳號。 |
| `S85` | 　活動「完售」徽章（D444 起活動沒有暫停售票，原暫停／恢復販售已移除） | Sold out badge (event pause / resume removed, D444) | 🔵 release2.3| ✅⬆ ahead | D375 決定七（2026-10-08）、D444（2026-10-19）：event-detail 頁首 `#ed-soldout-badge`；events.html 清單列狀態欄注入的 `[data-ev-soldout]` 徽章。完售不是階段，資料在 events-store `isSoldOut()`。暫停售票徽章與設定分頁的暫停區塊已隨 D444 移除 |
|       | **2026-10-09 D383 範圍收斂**          | Events — D383 scope trim                        |            |          | release2.3 只交付 bookyay 能帶入的資料所涉及的功能；多場次相關功能、系列活動、到店自取、轉售、招待票隱藏；門票隱藏狀態與預覽與在地化進 release2.3。說明見本表上方「2026-10-09 D383 範圍收斂」段 |
| `S87` | 　多場次活動（新增場次、多場示範活動） | Multi-date events (add a date, multi-date demo events) | ⚪ TBD      | ✅⬆ ahead | D383 決定一、二：create-event `#ce-dates-add`、event-detail `#ed-sess-add` 掛 `data-feat="S87"`；~~bookyay 匯入候選清單在 S87 不在版本內時把多時段與重覆活動標「不可帶入」、創作者活動管理清單標「release2.3 不支援」~~（2026-10-16 D440 取消：bookyay 多時段與重覆活動不管版本都能帶入、合成同一場，`bkyVerBlock()` 只剩到店自取，不再屬 S87 範圍）；已帶過、但對到多場活動的那一列（bky-7）在 release2.3 照舊不列；`js/events-store.js` 的 `list()` 濾掉多場的示範活動（album-signing-taipei），活動清單那一列同掛 S87。只在多場時出現的功能（套用第一場設定、門票依場次分組、組合包每場各一組、Review「共 N 場」）隨場次數自然不出現，不另掛 |
| `S88` | 　系列活動（活動清單系列母子列、活動詳情系列卡／徽章／鎖定提示／系列列、系列母頁） | Series (list parent/child rows, series card, badge, lock notes, series page) | ⚪ TBD      | ✅⬆ ahead | D383 決定二：events.html 七組 `.rowdis__group[data-feat="S88"]`（清單計數與頁首數字排除被收起的列與系列各場）；event-detail 頁首系列徽章、`#ed-series-card`、總覽的系列列、兩則 `[data-series-lock]`；`series-detail.html`（頁級本來就是 `full`）補進 `js/devtools.js`／`js/sidebar.js` 兩份 `FULL_ROUTES`，低版本的連結一併收起 |
| `S89` | 　取票方式：到店自取                       | Ticket delivery: store pickup                    | ⚪ TBD      | ✅⬆ ahead | D383 決定六：create-event 取票方式 `[data-val="pickup"]`、event-detail 發布設定 `[data-pub-val="store"]`；不在版本內時，取票方式是到店自取的 bookyay 活動在匯入清單標不可帶入（D384 決定一，2026-10-09 裁決）；創作者活動管理同列掛「release2.3 不支援」＋原因（D384 決定三，`admin-creator-events.html` `[data-ace-r24="pickup"]`） |
| `S90` | 　活動詳情：轉售分頁                       | Event detail: Resale tab                          | ⚪ TBD      | ✅⬆ ahead | D383 決定六：event-detail 票務子分頁 `[data-nav-item="resale"]` 與 `[data-nav-panel="resale"]` |
| `S91` | 　活動詳情：招待票分頁                     | Event detail: Comp tickets tab                    | ⚪ TBD      | ✅⬆ ahead | D383（2026-10-09 使用者補充）：event-detail 票務子分頁 `[data-nav-item="comp"]` 與 `[data-nav-panel="comp"]`，與轉售同樣處理；2026-10-15 D423 決定二（release2.3 不提供招待票）複核入口：原型上招待票只有這個子分頁（分頁標籤＋面板，「發放招待票」鈕在面板內），兩處都已掛 S91，沒有其他入口要補 |
| `S92` | 　門票隱藏狀態與標示（bookyay 活動門票的顯示／隱藏開關與「隱藏」徽章；~~bookyay 套票轉換的隱藏 1 人票、鎖定的顯示開關~~ D429 退場） | Hidden ticket state & badge (bookyay set-ticket conversion; show/hide toggle on bookyay event tickets) | 🔵 release2.3| ✅⬆ ahead | **2026-10-16 D429：1 人票（hideFix）與它的鎖定顯示開關退場，判斷只剩「bookyay 活動」→ S92；本列仍 🔵。** D383 決定七，自 S55 拆出：create-event 票卡 `[data-tier-hidden-badge]`、event-detail 票卡與票券清單的「隱藏」徽章、單張門票彈窗的顯示開關列在 1 人票（hideFix）時改掛 S92（create-event `tierShowRowHTML()`、event-detail `#ed-tm-show-row`）、bundle-detail 五則可賣性防呆紅字。示範：活動 `nick-live-taichung-bky` 的座席票 `tier-tc-seat`（隱藏；2026-10-16 示範資料補齊，原寫 bky-13／taipei-nye／khh-countdown-draft 的 1 人票已隨 D429 退場） |
|       | **媒體庫第二層：每件內容的任務（D377，2026-10-08）** | Media Vault item tasks | | | 規格 5.1.7.3 F8（新節）、F3 每件可看人數、F5 大彩蛋、F6 每件三種結果。媒體庫整頁原是 `data-page-feat="full"`（2026-10-23 起改 `"S120"`，release2.4 出現，見 S120），本編號讓第二層在功能表上有一列；編號沿用 S 段（devtools 只解析 `S`／`O`／`E`／`B` 開頭的 ID） |
| `S86` | 　媒體庫每件內容的任務（不設／九種行動任務〔release2.4 只有追蹤創作者、加入社群、分享庫房頁面 3 種，其餘 6 種拆到 S122〕／等級任務，等級依第一層下限過濾）、大彩蛋標記（2026-10-23 拆到 S121）、每件幾人看得到、以分級檢視每件結果 | Media Vault item tasks, grand surprise, per-item viewers | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP）：行動任務只留 3 種、大彩蛋列與小標改掛 S121。D377（2026-10-08）：`media-vault.html` 單件內容抽屜的 `section.vault-task[data-feat="S86"]` 與大彩蛋列、內容區頂端說明 `vault.grid.fine`、格子與音檔列上的 `.vault-tag[data-feat="S86"]`（JS 畫完呼叫 `ztorDevState.regate()`）；資料與計算在 `js/vault-store.js`。九種行動任務裡只有「商城消費・指定商品」可判定，其餘判定方式〔產品待確認〕（ASSUMPTIONS UIA-230） |
| `S93` | 　媒體庫三分頁新增的讀數與清單（總覽的鑰匙使用情況〔2026-10-23 拆到 S123〕、內容摘要、待補規格的數字〔拆到 S124〕；存取權限的即時人數條、已發鑰匙清單〔含撤銷，拆到 S123〕） | Media Vault tab readouts (key usage, summary, numbers awaiting spec, live reach line, issued-key list) | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP）：本列留內容摘要與即時人數條（鑰匙不在版本內時人數條只寫總數，不拆靠條件／靠鑰匙）；鑰匙使用情況卡與已發鑰匙清單改掛 S123、待補規格的數字卡改掛 S124。2026-10-09 使用者確認的三分頁示範頁移植進正式頁：`media-vault.html` 總覽分頁三張 `.card[data-feat="S93"]`、存取權限分頁 `.vault-reachline[data-feat="S93"]` 與 `.vault-keylist[data-feat="S93"]`；每件可看人數清單沿用 S86。版面重整本身（三分頁、方法小卡、列表化內容）不另編號。整頁 `data-page-feat="full"`（ASSUMPTIONS UIA-235） |
| `S106` | 　媒體庫單件內容預覽（照片大圖、影片與音檔可播放）與庫房分享連結（每座庫房一條、可複製，不給進庫權限） | Media Vault item preview & vault share link | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP）。D475（2026-10-22，5.1.7.3 F5、F9）：`media-vault.html` 單件設定抽屜頂端的 `.mpreview[data-feat="S106"]`（`js/media-vault.js` `previewHtml`，JS 畫完呼叫 `ztorDevState.regate()`）、存取權限分頁最下方的分享連結卡 `.card[data-feat="S106"]`（取代原本淡色的分享頁面列）。整頁 `data-page-feat="full"`；影音播放與網址格式是示範（ASSUMPTIONS UIA-295）。FEAT_TIER 後備表 `S106: 'release2.4'` |
| `S94` | 　組合包的購買條件與限購（D398、D400：所有組合包都有限購（D427 起只剩每人總限購），D456 起不繼承成員：預設不限、可比成員寬或嚴、額度獨立計算〔原跟隨成員／覆寫已退場〕；純商品組合包的購買條件預設不限、可加限時購買／限粉絲分級購買） | Bundle purchase rules & limits (all bundles: follow members / override; product-only bundle conditions) | 🔵 release2.3| ✅⬆ ahead | D398（2026-10-12）：bundle-detail `[data-bd-rules-sec]`（組合內容分頁成員之後；含門票時購買條件仍掛 S63）、create-bundle `[data-cb-rules]`；markup 由 `js/purchase-limits.js`（限購）與 `js/purchase-conds.js`（純商品購買條件，只開 buyTime／buyTier）產生。商品的三種上限屬 S35 的欄位改版、不另掛標記（只進 main／release2.3，不搬 release2.2） 2026-10-22 D469（只記在功能表與 D469，不寫進規格正文）：release2.3 的建立組合包步驟 1「限購」由停用改為建立時可設，規則照 D456（預設不限、可比成員寬或嚴、最低 1 組、獨立計算），沿用組合詳情的限購元件與擋存。 |
| `S98` | 　活動詳情：成本與營收摘要分頁（2.4 隱藏）              | Event detail: Cost & revenue summary tab (hidden in release2.3) | ⚪ TBD      | ✅⬆ ahead | D423 決定四（2026-10-15，交付範圍、規格不動）：event-detail 售票與名單子分頁 `[data-nav-item="finance"]` 與 `[data-nav-panel="finance"]`。其他入口檢查：總覽結案卡的「前往收入管理」連 earnings.html（不連這一節），不受影響；本節自己的「專案淨利」連結隨面板收起 |
| `S99` | 　活動詳情：票務商品卡片／列表檢視與隱藏／顯示            | Event detail: ticket bundles card / list view & hide / show | 🔵 release2.3| ✅⬆ ahead | D423 決定一（2026-10-15）：event-detail 票務商品的檢視切換 `#ed-bd-view`、列表 `#ed-bundle-table`、卡片與列表每組的隱藏／顯示鈕 `[data-bd-vis]` 與卡上「隱藏」徽章；營運動作、立即生效〔推導〕 |
| `S100` | 　活動詳情：門票與票務商品「庫存設為 0」 | Event detail: set ticket / bundle stock to 0 | 🔵 release2.3| ✅⬆ ahead | D447（2026-10-19）：event-detail 列表檢視每列的 `[data-tix-zero]`、門票彈窗 `#ed-tm-zero-row`、票務商品卡片／列表的 `[data-bd-zero]`（把組合包切成限量、總量＝已售，沿用既有 `cap`，不新增欄位）。營運動作、立即生效；bookyay 門票不能設（停用並說明）。標 release2.3 的理由：掛在已進 2.4 的票務商品檢視（S99）與發布後改庫存（S81.1）旁，同屬活動詳情票務的庫存營運；組合包的設 0 對 bookyay 活動的自建組合包也成立 |
| `S95` | 　非 bookyay 的示範活動（2.4 隱藏）                | Non-bookyay demo events (hidden in release2.3)    | ⚪ TBD      | ✅ built  | D410 決定四（2026-10-13，原型示範資料、不是產品功能）：release2.3 只顯示 bookyay 匯入的活動與共看派對。`js/events-store.js` 的 `list()` 在版本不含 S95 時濾掉其餘示範活動（`isRel24Demo()`：`source:'bookyay'` 或 `type:'watchparty'` 以外），活動清單計數、店鋪設定的活動候選、首頁畫布等 `list()` 消費端一起收起；`events.html` 對應的靜態列（含系列母子列）掛 `data-feat="S95"`。`get()` 不濾（直連照樣開得到）。最終版不變。已掛 S87 的 `album-signing-taipei`、`pingtung-bluefin` 列與掛 S88 的系列群組（`.rowdis__group`）維持原標記不另加 S95——`data-feat` 多值是「任一在版本內即顯示」，表達不了兩個條件同時成立；三者都是 ⚪，release2.3 一樣收起 |
| `S96` | 　bookyay 活動自設折扣與早鳥          | Creator-set discount & early bird on bookyay events | 🔵 release2.3| ✅ built  | **2026-10-20 D461：改 🔵 release2.3——release2.3 的 bookyay 門票也能自加折扣與限時折扣（修訂 D417 決定五「release2.3 不提供」）；`js/bundle-editor.js` 自動組合包那一段已隨 D429 退場。** D417 決定五（2026-10-15）：bookyay 不再帶入折扣優惠與早鳥，由創作者在 ztor 自設（原寫「release2.3 不提供」，已由 D461 修訂）。掛在入口上：`js/purchase-conds.js` html() 的 `ctx.addOnly` 選單（bookyay 門票的「新增條件」只列折扣與限時折扣，`[data-feat="S96"]`；create-event 步驟 4 單張門票彈窗、event-detail 單張門票彈窗）；`js/bundle-editor.js` 自動建立組合包的組合折扣與限時折扣（srcFix 時兩區塊改可編輯，`[data-feat="S96"]`；release2.3 收起時改回唯讀讀數）。D419 定案：bookyay 門票沒有「跟隨活動預設」，條件就是自己的一組，只能自加這兩種；套票轉出的隱藏 1 人票不給入口（折扣類落在自動組合包） |
|       | **粉絲忠誠點數（D347，2026-10-02）**                 | Loyalty points scoring model                    |            |          | 規格 5.1.0.8（新頁）、5.1.7.6 F3；計分規則本體在主規格 §7.5。編號沿用 S 段（devtools 只解析 `S`／`O`／`E`／`B` 開頭的 ID），與活動段 S52–S64 同一做法 |
| `S65` | 　平台忠誠點數設定（Admin 第 8 個同層目的地：全站活動給分與上限、賽季加倍週、衰減與等級保留、平台常數唯讀、修改紀錄） | Platform Loyalty Settings (Admin) | ⚪ TBD      | ✅ built  | D347／5.1.0.8 F1–F6；上線階段〔產品待確認〕（主規格 §8.29 第 16 項）。`admin-platform-loyalty.html` 頁級 `data-page-feat="S65"`，並比照平台優惠設定登記進 `js/sidebar.js`／`js/devtools.js` 兩份 `FULL_ROUTES`（低版本藏側欄入口、直連導回） |
| `S66` | 　分級設定的計分設定：各購買品項的份量（5 項）與互動推薦每 90 天最多得分（4 項） | Tier settings: purchase type value & max points per 90 days | ⚪ TBD      | ✅ built  | D347／5.1.7.6 F3.2–F3.3；`fans-crm.html` 分級設定彈窗「計分設定」分頁與 `tier-settings.html` 備份頁的兩組 `[data-feat="S66"]`。四類各類行為的份量（預設改 1.0）與「外部平台訊號本版暫不計入」屬既有分級設定，不掛本編號 |
| `S107` | 　崗位歸屬的資料欄位：作品上架演職名單每筆連結 Ztor 藝人帳號＋職務等級（沒連帳號標「不發分」）、建立活動表演陣容的 Ztor 用戶選職務等級 | Credit attribution fields: link credits to Ztor artists & pick role level | ⚪ TBD      | ✅ built  | D476 第 1 項（2026-10-23，5.1.2.2.1 F15、5.1.6.1 F3）：`partials/work-fields.js` 每列 `.entry-list__extras[data-feat="S107"]`（`publish-work.html` 與 `create-project.html` 影片路徑同一個元件）＋說明句；`create-event.html` `#ce-lineup-levels[data-feat="S107"]`。帳號名冊與各角色預設等級是示範（ASSUMPTIONS UIA-296）。FEAT_TIER 後備 `S107: 'tbd'` |
| `S108` | 　平台忠誠點數設定：多人署名時各職務分到的點數（六級，五級百分比可改、0% 不計分唯讀） | Platform loyalty: points by credited role | ⚪ TBD      | ✅ built  | D476 第 1 項：`admin-platform-loyalty.html` 全站活動之後的 `section[data-feat="S108"]`；輸入框掛 `data-ploy`，改了會進修改紀錄。整頁另受 S65 頁級閘門。FEAT_TIER 後備 `S108: 'tbd'` |
| `S109` | 　賽季加倍的範圍與倍率（Admin：全平台／特定藝人＋倍率）與創作者的「我的賽季加倍」（期間＋倍率，覆寫平台設定、同層取最高） | Season boost scope & multiplier; creator's own season boost | ⚪ TBD      | ✅ built  | D476 第 6 項：`admin-platform-loyalty.html` 賽季表的範圍、倍率兩欄（JS 畫完呼叫 `ztorDevState.regate()`）與彈窗的 `.form-grid[data-feat="S109"]`；`fans-crm.html` 分級設定「計分設定」分頁與 `tier-settings.html` 備份頁的 `[data-feat="S109"]` 群組。release2.3 看不到範圍時新增的一律記成全平台。FEAT_TIER 後備 `S109: 'tbd'` |
| `S110` | 　手動調整粉絲點數（只有 Admin 代管態：加點／扣點、必填原因、送出記一筆）與點數調整紀錄 | Manual loyalty point adjustment (Admin only) | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（需求站 P0 明列後台手動加減點數、記為帳本一筆）。D476 第 8 項：`fan-detail.html` 頁首「調整點數」鈕與行為時間軸分頁的「點數調整紀錄」卡（`[data-admin-only][data-feat="S110"]`，看 `window.ztorCreator.adminScope()`）＋ `#fd-adjust-modal`。FEAT_TIER 後備 `S110: 'release2.4'` |
| `S111` | 　歷史訂單回填（平台上線時執行一次；狀態與規則摘要，起始日期待確認） | Order backfill at launch | ⚪ TBD      | ✅ built  | D476 第 9 項：`admin-platform-loyalty.html` 誠信規則之後的 `section[data-feat="S111"]`，示範狀態「尚未執行」、沒有執行按鈕（UIA-296）。FEAT_TIER 後備 `S111: 'tbd'` |
| `S112` | 　媒體庫庫房狀態與排程（草稿／上架中／已下架；發布〔立刻或排定上架、可設定時下架；排程 2026-10-23 拆到 S125〕、取消排程〔S125〕、下架、重新上架、刪除；非上架中時分享連結停用、鑰匙說明上架前不能領〔拆到 S123〕、人數標上架後試算；單件設定「只能線上看與播放」） | Media Vault status & schedule (draft / listed / unlisted, publish, unlist, relist, delete) | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP）：release2.4 留狀態、立刻上架、下架、重新上架、刪除、分享連結停用、上架後試算、只能線上看與播放；發布視窗的上架方式整塊改掛 S125（release2.4 只剩一句「確認後粉絲立刻看得到」），`[data-vault-keys-off]` 與鑰匙抽屜裡的上架前提示改掛 S123。D477（2026-10-23，5.1.7.3 F10、F1、F4、F5、F9）：`media-vault.html` 側欄每列 `.vault-row__status`、庫房標頭 `.vault-head__status`／`.vault-head__actions`、發布視窗與確認視窗（`[data-vault-pub]`／`[data-vault-confirm]`）、讀數卡「尚未對粉絲開放」徽章、存取權限的 `[data-vault-keys-off]`／`[data-vault-link-off]`、抽屜 `.vault-item__online` 皆 `data-feat="S112"`。整頁 `data-page-feat="full"`（UIA-298）。FEAT_TIER 後備 `S112: 'release2.4'` |
| `S113` | 　媒體庫檢視身分：指定一位粉絲（搜尋粉絲名單、他進不進得了庫、靠哪種方法或鑰匙、每件已解開／需要條件／未解開）與上鎖卡（進不了庫時列出進庫方法） | Media Vault view as one fan & locked card | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP）：鑰匙（S123）不在版本內時，「靠哪把鑰匙進來」與上鎖卡的鑰匙說法都不出現（資料層當沒有鑰匙，UIA-300）。D477（2026-10-23，5.1.7.3 F6、F2）：`media-vault.html` 頁首 `.vault-person[data-feat="S113"]`（owner-lookup 版型）、`.vault-gate[data-feat="S113"]`、每件小標的「上鎖」；粉絲名單是示範資料（UIA-298）。FEAT_TIER 後備 `S113: 'release2.4'` |
| `S114` | 　媒體庫解開紀錄的兩個數字（整座庫房與每件內容的累計解開過、目前看得到；草稿與已下架標上架後） | Media Vault unlock records (unlocked in total / currently visible) | 🟣 release2.4 | ✅ built  | **2026-10-23 改 🟣 release2.4**（使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP）。D477（2026-10-23，5.1.7.3 F3、F8）：`media-vault.html` 總覽「解開紀錄」卡 `.card[data-feat="S114"]`、每件清單 `.vault-ov__ever`；抽屜的兩格人數掛在既有 S86 任務區內。解開紀錄是示範資料（UIA-298）。FEAT_TIER 後備 `S114: 'release2.4'` |
|       | **媒體庫 release2.4：需求網址 MVP 範圍（2026-10-23）** | Media Vault — release2.4 (requirement site MVP) | | | 使用者裁決：release2.4 的媒體庫＝需求網址 https://media-vault-site.vercel.app/ 的 MVP 範圍（本地轉檔 `Project/ztor-endgame-demo/media-vault-site/media-vault-site.md`）。放進的標 🟣（S86、S93、S106、S112–S114、S120），不放的拆成 S121–S125 ⚪；說明見本表上方「媒體庫進 release2.4」段 |
| `S120` | 　媒體庫頁本身（三分頁版面：總覽／內容與任務／存取權限；庫房清單、建立多座庫房、名稱與說明；上傳照片／影片／音檔；進庫方法〔分級、購買過、支持過、出席過、達成過；多種方法任一、同一種方法內全部〕與觸及人數、各等級覆蓋；以分級檢視） | Media Vault page (tabs, vault list, multiple vaults, upload, ways in & reach, view as a tier) | 🟣 release2.4 | ✅ built  | 2026-10-23 使用者裁決 release2.4 媒體庫範圍＝需求網址 MVP：`media-vault.html` 頁級 `data-page-feat="S120"`（原 `full`）；`js/devtools.js` `FULL_ROUTES` 改 `'media-vault.html': 'S120'`、`js/sidebar.js` `TIER_ROUTES` 同步（依功能放行：release2.3 收起、release2.4 出現）。頁內沒掛功能標記的元素都屬本列。FEAT_TIER 後備 `S120: 'release2.4'` |
| `S121` | 　媒體庫大彩蛋標記（單件設定的開關、格子與總覽的大彩蛋小標、內容摘要的大彩蛋計數、內容區說明句提到大彩蛋的半句） | Media Vault grand surprise marker | ⚪ TBD      | ✅ built  | 2026-10-23 自 S86 拆出（release2.4 不放）：抽屜 `.vault-task__flag[data-feat="S121"]`、小標 `.vault-tag--grand[data-feat="S121"]`（JS 畫完 regate）；總覽小標與摘要那一行由 `js/media-vault.js` 依 `featOn('S121')` 決定畫不畫；`vault.grid.fine` 那句掛 S121，S121 不在版本內時改顯示 `data-feat-off="S121"` 的 `vault.grid.fine.nk`。FEAT_TIER 後備 `S121: 'tbd'` |
| `S122` | 　媒體庫其餘六種行動任務（分享指定貼文、邀請朋友加入社群、看完指定影片、參加 Watch Party、商城消費、爆米花打賞） | Media Vault: six more action tasks | ⚪ TBD      | ✅ built  | 2026-10-23 自 S86 拆出（release2.4 只有追蹤創作者、加入社群、分享庫房頁面）：任務「種類」下拉由 `js/vault-store.js` `actionTaskList()` 產生，S122 不在版本內時只列 3 種；最終版那 6 個 `<option>` 逐項掛 `data-feat="S122"`（`<option>` 不能可靠地靠 class 收起，所以版本外是在產生選單時就不畫）。種子資料裡用到這 6 種的內容，S122 不在版本內時一律當成「不設任務」呈現與計算（`taskOf()`，ASSUMPTIONS UIA-300）。FEAT_TIER 後備 `S122: 'tbd'` |
| `S123` | 　媒體庫鑰匙（存取權限的「直接開放」整張卡：送給一位粉絲、做成 NFC 商品、管理鑰匙抽屜、已發鑰匙清單與撤銷；總覽的鑰匙使用情況；上架前不能領鑰匙的提示；人數條的「靠鑰匙」拆解；上鎖卡、指定一位粉絲、任務說明、分享連結說明、發布檢查、刪除確認裡提到鑰匙的字句） | Media Vault keys (direct access, key drawer, key list & revoke, key usage, key wording) | ⚪ TBD      | ✅ built  | 2026-10-23 自 S93／S112 拆出（release2.4 不放）：`media-vault.html` 直接開放卡 `.card[data-feat="S123"]`（內含 `[data-vault-keys-off]`、`.vault-keylist`）、總覽鑰匙使用情況卡、鑰匙抽屜 `[data-vault-drawer]` 與抽屜裡的上架前提示。S123 不在版本內時 `js/vault-store.js` 把鑰匙當成不存在（不算進人數、`fanWays()` 不回鑰匙），提到鑰匙的字句由 `js/media-vault.js` 換成 `.nk` 版本或整條不列（UIA-300）。FEAT_TIER 後備 `S123: 'tbd'` |
| `S124` | 　媒體庫總覽「待補規格的數字」佔位卡（觀看次數、熱門內容） | Media Vault: numbers awaiting spec (placeholder) | ⚪ TBD      | ✅ built  | 2026-10-23 自 S93 拆出：總覽分頁 `.card--muted[data-feat="S124"]`。FEAT_TIER 後備 `S124: 'tbd'` |
| `S125` | 　媒體庫排程（發布視窗的立刻／定時上架選擇、上架日期與時間、定時下架；取消排程；側欄與標頭的已排程標記；下架確認裡「排程會清掉」那一條） | Media Vault scheduling (scheduled listing, timed unlisting, cancel schedule) | ⚪ TBD      | ✅ built  | 2026-10-23 自 S112 拆出（release2.4 發布只有立刻上架）：發布視窗 `.lctl[data-feat="S125"]`，S125 不在版本內時改顯示 `data-feat-off="S125"` 的一句「確認後粉絲立刻看得到」；`js/vault-store.js` 的 `isScheduled()`／`applySchedules()` 與 `js/media-vault.js` 的 `schedText()` 在 S125 不在版本內時不生效、不顯示（種子裡的排程時間保留，切回最終版照舊）。FEAT_TIER 後備 `S125: 'tbd'` |
| `S126` | 　粉絲名冊「活躍粉絲」KPI（近 90 天活躍粉絲數＋粉絲總數） | Fan roster: Active fans KPI | 🟣 release2.4 | ✅ built  | 2026-10-27 使用者裁示加回 release2.4（原屬 S118，需求站 P0 沒提）：`fans-crm.html` 第一張 KPI 卡 `data-feat="S126"`；流失風險、活躍粉絲收入兩張仍歸 S118 只在最終版。ASSUMPTIONS UIA-311 |
|       | **粉絲管理 release2.4：需求站 P0 範圍（2026-10-23）** | Fans — release2.4 (requirement site P0) | | | 使用者裁示：release2.4 只放需求站 MVP「P0 有提到」的粉絲管理；P0 沒提到的只在最終版。依據 `sources/loyalty-requirement-site.zh-TW.md`「MVP 分期建議」P0、「驗收標準 — P0」 |
| `S115` | 　粉絲名冊（排行榜）：粉絲識別、分級、忠誠點數、依點數或分級排序、分級篩選與搜尋、平均忠誠點數 KPI | Fan roster (leaderboard): identity, tier, loyalty points | 🟣 release2.4 | ✅ built  | `fans-crm.html` 頁級 `data-page-feat="S115"`；兩份 `FULL_ROUTES` 依 S115 放行。名冊保留哪些欄見 ASSUMPTIONS UIA-299。FEAT_TIER 後備 `S115: 'release2.4'` |
| `S116` | 　分級設定唯讀：各分級門檻（前幾 % 名、最低點數）與規則（升降級時機、名額取整） | Tier settings, read-only: gates & timing rules | 🟣 release2.4 | ✅ built  | `fans-crm.html` 分級設定彈窗；本身沒有元素掛 S116（彈窗在名冊頁內，跟著頁級 S115），編輯、權益、計分設定分頁與其餘規則掛 S119 收起。FEAT_TIER 後備 `S116: 'release2.4'` |
| `S117` | 　粉絲詳情 P0：頁首識別、分級、忠誠點數（Admin 調整點數另見 S110） | Fan detail (P0): identity, tier, loyalty points | 🟣 release2.4 | ✅ built  | `fan-detail.html` 頁級 `data-page-feat="S117"`；兩份 `FULL_ROUTES` 依 S117 放行。FEAT_TIER 後備 `S117: 'release2.4'` |
| `S118` | 　粉絲名冊與粉絲詳情的延伸區塊：名人堂、Who's who 組成、下一級進度、活躍與風險（流失風險 KPI、活躍粉絲收入 KPI、警示、狀態欄；「活躍粉絲」KPI 已拆出為 S126）、國家與消費欄、標籤、群發訊息、匯出、粉絲詳情的行為時間軸、點數來源分布、消費與參與分頁、名人堂峰值 | Fans roster & detail extras (final only) | ⚪ TBD      | ✅ built  | 需求站 P0 沒提到，只在最終版。`fans-crm.html`、`fan-detail.html` 各區塊 `data-feat="S118"`；名冊欄收起後的格線由頁內 `:has()` 改欄數，粉絲詳情分節導覽收起時由 `ds-components/section-nav.css` 改單欄。頁首說明句以 `data-feat-off="S118"` 換成 P0 版。FEAT_TIER 後備 `S118: 'tbd'` |
| `S119` | 　分級設定的編輯與延伸：編輯／取消／儲存、變更歷史、分級權益列、計分設定分頁、規則分頁的雙門檻／遞增／版本化／生效時機四條 | Tier settings editing, benefits & scoring (final only) | ⚪ TBD      | ✅ built  | 需求站 P0 的設定由工程手改、沒有營運畫面；權益屬 P1。`fans-crm.html` 分級設定彈窗各處 `data-feat="S119"`；彈窗說明句以 `data-feat-off="S119"` 換成只講門檻的版本。FEAT_TIER 後備 `S119: 'tbd'` |
| `S67` | 　描述區塊（無標題文字區塊：新增描述、拖動排序、刪除） | Description blocks (add, reorder, remove) | 🔵 release2.3| ✅⬆ ahead | D354（2026-10-05）；`partials/rich-body.js` 的「新增描述」鈕 `[data-feat="S67"]`（create-event 步驟 2、event-detail 活動內容）；把手拖動／上下鍵排序、區塊刪除隨區塊本身；取代退場的 S57 說明區塊 |
|       | **潛在買家需求看板與服飾配件分類（D360，2026-10-05）** | Demand board & apparel taxonomy | | | 規格 5.1.5.16（新頁）、主規格 §7.1／§7.16／§7.17、§8.30（25 項待確認）；算法唯一定義處 §7.17。編號沿用 S／O 段（devtools 只解析 `S`／`O`／`E`／`B` 開頭的 ID），與活動段 S52–S67 同一做法 |
| `S68` | 　需求看板頁（E-Shop 第四個導覽目的地：篩選、摘要指標、市場需求表、計畫生產量與差距、資料不足與參考同類商品、資料來源說明） | Demand board page | ⚪ TBD      | ✅ built  | D360／5.1.5.16 F1–F5；整頁 `data-page-feat="S68"`，並登記進 `js/sidebar.js`／`js/devtools.js` 兩份 `FULL_ROUTES`（低版本藏側欄入口、直連導回）；資料與算法在 `js/demand-store.js`（示範資料）。上線階段〔產品待確認〕 |
| `S69` | 　商品層需求數據入口（商品細節頁開彈窗，看該商品自己的需求數據） | Product-level demand data entry | ⚪ TBD      | ✅ built  | D360／5.1.5.1 §2.19；與看板同一口徑（`ztorDemand.productSlice`）；入口適用範圍（草稿、數位商品）〔產品待確認〕（§8.30 第 17 項） |
| `S70` | 　服飾配件大類→次分類、適用對象、系統屬性＋自訂規格（建立商品、商品細節） | Apparel category, department & system attributes | ⚪ TBD      | ✅ built  | D360／5.1.5.2 F2、5.1.5.1 §2.6；13 大類、次分類、屬性清單在 `js/apparel-taxonomy.js`，商品記錄欄位見 `js/products-store.js`（group／category／subCategory／audience／attrs／customSpecs）；屬性值域與適用大類、既有商品遷移〔產品待確認〕（§8.30 第 8–10 項） |
| `S71` | 　尺寸顏色快捷預設擴充與自行輸入（建立商品選項建構器、商品細節選項） | Size & colour preset chips + custom values | ⚪ TBD      | ✅ built  | D360（修訂 D249）／5.1.5.2 F3.1、5.1.5.1 §2.8；標準清單在 `js/apparel-taxonomy.js` 的 sizes／colours；清單內容與色號〔產品待確認〕（§8.30 第 6 項）；自行輸入的尺寸跨商品歸「其他尺寸」 |

## O · 訂單管理 — Order Management

ID 起始 `O01…` ｜ 🟢 26 · 🔵 13 · ⚪ 1 · ⚫ 退場 2（2026-10-16 O04、O09 ⚪ 改 🔵）

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `O01` | 資料統計 | KPI stats | 🟢 release2.2 | ✅ built |  |
| `O02` | 　待出貨 | To ship | 🟢 release2.2 | ✅ built |  |
| `O03` | 　待處理 | Pending | 🟢 release2.2 | ✅ built |  |
| `O04` | 　已取消 / 爭議 | Cancelled / dispute | 🔵 release2.3 | ✅⬆ ahead | 2026-10-16 使用者裁決 release2.3 電子商店範圍（建立商品、組合包，以及其流程產出的詳情頁與訂單進 2.4；拍賣、需求看板、服飾尺寸屬性不進）：⚪ 改 🔵 release2.3。 2026-09-09（D253）：由「退款 / 爭議」更名——平台不提供退款動作，KPI 改計已取消／爭議 |
| `O05` | 　已完成 · 30天 | Completed · 30d | 🟢 release2.2 | ✅ built |  |
| `O06` | 匯出 | Export | 🟢 release2.2 | ✅ built |  |
| `O07` | 搜尋訂單 | Search orders | 🟢 release2.2 | ✅ built |  |
| | **狀態列** | Status filter | | | |
| `O08` | 　全部 / 待付款 / 已付款 / 待出貨 / 已出貨 / 已完成 | All → Completed | 🟢 release2.2 | ✅ built | 原文「代付款」為筆誤，依規格 Unpaid＝待付款更正 |
| `O09` | 　已取消 / 爭議 | Cancelled / dispute | 🔵 release2.3 | ✅⬆ ahead | 2026-10-16 使用者裁決 release2.3 電子商店範圍（建立商品、組合包，以及其流程產出的詳情頁與訂單進 2.4；拍賣、需求看板、服飾尺寸屬性不進）：⚪ 改 🔵 release2.3。 2026-09-09（D253）：由「退款 / 爭議」更名，篩選新增獨立 Disputed tab |
| `O10` | 訂單列表欄位 | Order list fields | 🟢 release2.2 | ✅ built |  |
| `O11` | 訂單詳情 | Order detail | 🟢 release2.2 | ✅ built |  |
| | **　內容** | Content | | | |
| `O12` | 　　狀態 / 收入結算 | Status / settlement | 🟢 release2.2 | ✅ built |  |
| `O13` | 　　訂單商品列表 | Line items | 🟢 release2.2 | ✅ built |  |
| `O14` | 　　金額（商品 / 運費 / 平台費 / 支付費 / 淨額） | Amounts incl. platform fee | 🟢 release2.2 | ✅ built |  |
| `O15` | 　　在收入管理檢視 | View in Earnings | 🟢 release2.2 | ✅ built | link to Earnings minimum |
| `O16` | 　　買家資訊（名稱 / 地址 / 聯絡方式） | Buyer info | 🟢 release2.2 | ✅ built |  |
| `O17` | 　　檢視粉絲記錄 | View fan record | 🔵 release2.3 | ✅⬆ ahead | Fans CRM module out of scope |
| | **　功能** | Actions | | | |
| `O18` | 　　退款 | Refund | ⚫ 退場 | 🟡 gap | 2026-09-09（D253）已退場——平台不提供任何退款動作，取消訂單品項的唯一路徑改為 O31 作廢 |
| `O19` | 　　標記出貨 / 履約 | Mark shipped / fulfillment | 🟢 release2.2 | ✅ built |  |
| `O20` | 　　　物流配送（物流商 / 追蹤碼 / 標記出貨） | Logistics (manual) | 🟢 release2.2 | ✅ built | manual entry — no carrier API |
| `O21` | 　　　QR 領取（二維碼 / 標記已領取） | QR pickup | 🟢 release2.2 | ✅ built |  |
| `O22` | 　　　數位（下載） | Digital download | 🔵 release2.3 | ✅⬆ ahead | digital goods deferred |
| `O23` | 　　退款與爭議（部分 / 整單退款） | Refund & dispute | ⚫ 退場 | 🟡 gap | 2026-09-09（D253）已退場——平台不提供任何退款動作 |
|       | **　取貨管理（Pickup Management）** — 2026-07-03 新增模組（D111），2026-07-30 併入 Phase 1（D157） | Pickup management |            |          |                                          |
| `O24` | 　取貨管理入口（E-Shop 下拉第三個目的地）     | Pickup management entry          | 🟢 release2.2 | ✅ built | 規格 5.1.5.11 |
| `O25` | 　　取貨場次清單（篩選 / 搜尋 / 分批載入）     | Pickup session list              | 🟢 release2.2 | ✅ built | 5.1.5.11 F4 |
| `O26` | 　　建立取貨場次                          | Create pickup session            | 🟢 release2.2 | ✅ built | 5.1.5.12 |
| `O27` | 　　取貨場次詳情（名單 / 核銷紀錄 / 匯出）     | Pickup session detail            | 🟢 release2.2 | ✅ built | 5.1.5.15；名單一列一領取單位（D240） |
| `O28` | 　　Scanner URL 與密碼（交付 / 生命週期）    | Scanner URL & password           | 🟢 release2.2 | ✅ built | 5.1.5.15 F2 |
| `O29` | 　　手機 Scanner 掃碼核銷（二元核銷）        | Mobile scanner redemption        | 🟢 release2.2 | ✅ built | 5.1.5.14；二元核銷、一碼一件（D122／D240） |
| `O30` | 　　活動票券共用核銷（回寫 Events check-in）  | Event ticket redemption          | 🟢 release2.2 | ✅ built | 5.1.5.14 F2；票券狀態仍以 Events 為來源 |
| `O31` | 　　作廢品項（Admin 專屬、取貨型）           | Void item (admin only)           | 🟢 release2.2 | ✅ built | 2026-09-07 上游拍板列入 eShop 2.2；creator 態可見但停用（§4.4）；出貨型／數位待產品確認（§8.27） |
| `O32` | 　　平台費展開（依費率葉節點列出計費基準與平台費） | Platform fee breakdown | 🟢 release2.2 | ✅ built | 2026-09-29（D333）；同日使用者裁示列入 Phase 1；`order-detail.html` 平台費列的展開把手與展開列掛 `data-feat="O32"`；支付費不展開 |
| `O33` | 　　收件國家與城市（買家卡的兩個欄位，完整地址保留；沒值顯示未提供地區） | Shipping country & city | ⚪ TBD      | ✅ built  | D360／5.1.5.3.1 §2.4；資料層 `js/orders-store.js` 的 buyer.country（ISO 兩碼）／buyer.city；前台（粉絲結帳頁）同步新增前欄位先空著（需求看板「未提供地區」的來源） |
| `O34` | 　　付款資訊（訂單詳情付款區＋清單付款時間、付款方式、發貨時間欄） | Payment info & paid / shipped times | 🔵 release2.3 | ✅ built | D411（2026-10-13）／5.1.5.3 F3、5.1.5.3.1 §2.2.1；付款編號用共用 link-field 複製；活動交易明細的付款時間欄未掛標記（動態表格欄，devtools 不重跑 data-feat，避免欄位錯位）。電子商店範圍、是否同步進 release2.2 待使用者決定 |
| `O35` | 　　訂單日期區間與訂單類型篩選（訂單管理＋活動交易明細，匯出照篩選結果） | Order date range & type filters | 🔵 release2.3 | ✅ built | D411／5.1.5.3 F2、5.1.6.3 §2.7；新元件 `ds-components/date-range.css`（design-system §4.238） |
| `O36` | 　　門票訂單（清單列門票訂單、訂單詳情門票資料段、訂單類型與來源、交易明細每一列開訂單詳情） | Ticket orders in order management | 🔵 release2.3 | ✅ built | D411／5.1.5.3 F3 範圍、5.1.5.3.1 §2.1、§2.2、§2.3.4、5.1.6.3 §2.7；資料來自 `js/events-store.js` 交易明細（findOrder 反查） |
| `O37` | 　　重寄訂單信（Admin 專屬；創作者可見但停用，寄出前確認信箱、寄出後留紀錄） | Resend order email (Admin only) | 🔵 release2.3 | ✅ built | D411 決定四／5.1.5.3.1 §2.2 |
| `O38` | 　　撤銷整張訂單（訂單詳情頁首；Admin 專屬，創作者可見但停用；效果等同每個品項各撤銷一次） | Void whole order (Admin only) | 🔵 release2.3 | ✅ built | D414（2026-10-14）／5.1.5.3.1 §2.8「整單撤銷」；可用條件為〔推導〕（全部品項皆未履約且未撤銷），含門票品項時停用為示範處理（UIA-255）；`order-detail.html` `#od-void-whole-open` |
| `O39` | 　　匯出 CSV 與確認視窗（訂單管理＋活動交易明細；訂單管理另有「包含收件資料」核取框，預設不勾） | Export CSV & confirm dialog | 🔵 release2.3 | ✅ built | D416（2026-10-15）／5.1.5.3 F2、5.1.6.3 §2.7；`js/csv-export.js`（視窗＋CSV）、`js/orders-store.js` `exportTable()`；版本閘（`ztorDevState.featOn('O39')`）關閉時沿用 O06 舊行為：只回報筆數。O06 的按鈕本身仍是 🟢 release2.2 |
| `O40` | 　　已過期訂單（付款畫面倒數到期被捨棄的訂單留紀錄：清單「已過期」分頁與徽章、訂單詳情說明與停用；不計收入、不扣庫存、不算待處理） | Expired orders | 🔵 release2.3 | ✅ built | D424 決定 1（2026-10-15）／5.1.5.3、5.1.5.3.1；資料層 `js/orders-store.js` 的 `pay:'expired'`（3 筆示範）；`orders.html` 分頁與已過期列掛 `data-feat="O40"`（版本閘收起時不計入其他分頁數量）。倒數幾分鐘不在範圍 |
| `O41` | 　　匯出中提示（訂單管理＋活動交易明細：確認匯出後右下角「匯出中…」約 1 秒轉「匯出完成」並下載） | Export in-progress toast | 🔵 release2.3 | ✅ built | D424 決定 3／5.1.5.3 F2、5.1.6.3 §2.7；`js/csv-export.js` `run()`＋toast 元件新增右下角位置變體與 busy 態（design-system §4.107）。版本閘關閉時沿用 O39：直接下載＋底部完成提示 |
| `O42` | 　　匯出紀錄（誰、何時、篩選條件、筆數、檔名；創作者與 Admin 都看得到） | Export history | 🔵 release2.3 | ✅ built | D424 決定 4；`orders.html`／`event-detail.html` 匯出鈕旁「匯出紀錄」掛 `data-feat="O42"`；`js/csv-export.js` `openLog()`；原型存 localStorage（`ztor.export.log`），版本閘關閉時不寫紀錄 |

## E · 收入管理 — Earnings / Income

ID 起始 `E01…` ｜ 🟢 12 · 🔵 6 · ⚪ 8

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `E01` | 資料統計 | KPI stats | 🟢 release2.2 | ✅ built | minimal slice only |
| `E02` | 　總輸入 | Gross | 🟢 release2.2 | ✅ built |  |
| `E03` | 　淨利（→ 收益拆分） | Net (→ breakdown) | 🟢 release2.2 | ✅ built | net p1; waterfall later |
| `E04` | 　待結算 | Pending settlement | 🟢 release2.2 | ✅ built |  |
| `E05` | 　可提領 | Available | 🟢 release2.2 | ✅ built | display p1; payout later |
| `E06` | 篩選（本月 / 季 / 年） | Filter (month/qtr/year) | 🟢 release2.2 | ✅ built |  |
| `E07` | 匯出 | Export | 🟢 release2.2 | ✅ built |  |
| `E08` | 申請提款 | Request payout | 🔵 release2.3 | ✅⬆ ahead | payout mechanics deferred |
| | **欄目** | Tabs | | | |
| `E09` | 　總覽（趨勢圖 / 近期交易 / 來源分佈） | Overview | 🔵 release2.3 | ✅⬆ ahead | charts deferred |
| `E10` | 　交易明細 | Transactions | 🟢 release2.2 | ✅ built |  |
| `E11` | 　　全部（欄位 + 展開詳情） | All (fields + expand) | 🟢 release2.2 | ✅ built |  |
| `E12` | 　　電子商店 | E-Shop tab | 🟢 release2.2 | ✅ built |  |
| `E13` | 　　電子票券 | E-Tickets | ⚪ TBD | ✅⬆ ahead |  |
| `E14` | 　　IP 版稅 | IP royalty | ⚪ TBD | ✅⬆ ahead |  |
| `E15` | 　　授權 | Licensing | ⚪ TBD | ✅⬆ ahead |  |
| `E16` | 　　平台 / 串流版稅 | Streaming royalty | ⚪ TBD | ✅⬆ ahead |  |
| `E17` | 　　專案支持 | Project support | ⚪ TBD | ✅⬆ ahead |  |
| `E18` | 　　提款與作廢沖銷 | Payout & void | 🔵 release2.3 | ✅⬆ ahead | 2026-09-09（D253）：由「提款與退款」更名——平台不提供退款動作；feature ID／`data-feat` 掛點不變 |
| `E19` | 　　載入更多 | Load more | 🟢 release2.2 | ✅ built |  |
| `E20` | 　　手動補登 | Manual entry | 🔵 release2.3 | ✅⬆ ahead |  |
| `E21` | 　　匯出 CSV | Export CSV | 🟢 release2.2 | ✅ built |  |
| `E22` | 　收益拆解（瀑布圖 / 依專案 · Ztor抽成·創作者·NFT） | Revenue breakdown waterfall | 🔵 release2.3 | ✅⬆ ahead | 收益拆解納入 scope（使用者 2026-07-16 裁示補上，D139）；平台費率設定入口見規格 5.1.0.3、費率凍結機制 §7.6，結構依 §7.3／5.1.8 F11·F12，**實際抽成比例數值仍待產品確認**。（原文「EFT」為筆誤，依規格 §7.3 淨利池 NFT 40% 更正） |
| `E23` | 　提款 | Payout | 🔵 release2.3 | ✅⬆ ahead |  |
| `E24` | 　稅務檔案 | Tax documents | ⚪ TBD | ✅⬆ ahead |  |
| `E25` | 　　合作者分潤 | Collaborator share | ⚪ TBD | ✅⬆ ahead | 2026-09-24 補登：交易明細已有此分類、先前漏掛 data-feat；分類定義見規格 §7.3 |
| `E26` | 　　推薦分潤 | Referral share | ⚪ TBD | ✅⬆ ahead | 2026-09-24 補登：交易明細已有此分類、先前漏掛 data-feat；分類定義見規格 §7.3 |

## B · 買家店面（Ztor eShop） — Buyer Storefront

> 來源：from Phase 1 handoff (not in 功能點.md)

ID 起始 `B01…` ｜ 🟢 8 · 🔵 1 · ⚪ 1

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `B01` | 創作者商店頁 | Creator shop page | 🟢 release2.2 | ✅ built |  |
| `B02` | 商品詳情頁 (PDP) | Product detail page | 🟢 release2.2 | ✅ built | net-new — designer proto has none |
| `B03` | 購物車 | Cart | 🟢 release2.2 | ✅ built |  |
| `B04` | 結帳 | Checkout | 🟢 release2.2 | ✅ built |  |
| `B05` | 　Apple Pay / 信用卡 (Stripe) | Apple Pay / card | 🟢 release2.2 | ✅ built |  |
| `B06` | 　爆米花付款 (Pay by POPCORN) | Pay by POPCORN | 🟢 release2.2 | 🟡 gap | net-new payment option |
| `B07` | 　貨到付款 (COD) | Cash on delivery | ⚪ TBD | ⏳ deferred | removed from Phase 1 **2026-10-16 使用者裁決**：物流尚未導入，貨到付款不進 release2.3。 |
| `B08` | 訂單確認 | Order confirmation | 🟢 release2.2 | ✅ built |  |
| `B09` | 取貨 QR（email + 訂單詳情，靜態） | Pickup QR (static, email + order) | 🟢 release2.2 | 🟡 gap |  |
| `B10` | 公開探索欄（/shops、首頁商品欄） | Public discovery rails | 🔵 release2.3 | ⏳ deferred | internal-only Phase 1 — no public discovery |

---

_由 https://ztor-eshop-proto.vercel.app/eshop-feature-scope-map.html 轉錄（2026-06-30）；ID 依原始 HTML 的編號邏輯重算（group 結構列不佔號）。2026-07-02 對源複核：源頁未更新（自標 2026-06-29），107 項 tier／build 零漂移；本檔僅就地更正兩處源頁筆誤（O08 代付款→待付款、E22 EFT→NFT，見各列備註），其餘忠實轉錄。_
