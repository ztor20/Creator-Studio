# ztor Creator Studio · site/ 工作流程與檔案結構

這份是 `site/`（原型站台）的總覽：檔案結構、檔案之間的關係、改東西會觸發什麼、以及發版流程。發版流程圖裡的**黃色關卡＝要先問使用者才做**（開 PR／Merge／上線）；本地 commit 不在此列，自動做。

> 2026-07-26 起同步機制改成真正的 `git merge`（原本是自製的檔案比對＋整包覆蓋，兩人並行會靜默還原對方的工作）。詳見 §4。
>
> 2026-09-24 起：站台資料夾固定叫 `app/`（不再隨版本改名）；已交付的階段凍結成 monorepo 的分支（目前 `release2.3`），修正怎麼搬過去見 §5。
>
> 2026-10-07 起：凍結分支改用 release 編號（原 `phase1` 改名 `release2.3`，內容是 E-Shop），`main` 版本面板的預覽選項改名 release2.4；`UI-CHANGES.md` 每筆紀錄標交付版標籤，見 §5。

---

## 1. 檔案結構

```
site/                         ← 獨立 git repo，經 git subtree 與 monorepo ztor20/Creator-Studio 的 main 對齊
│
├─ 〔共編規則 + 工具〕
│  ├─ CLAUDE.md / AGENTS.md   開工→編輯→發版規則（同一份，分別給 Claude / Codex）
│  ├─ README.md               版本與治理
│  ├─ WORKFLOW.md             ← 本檔
│  ├─ pull.sh                 同步：真 git merge（subtree split → merge），有衝突會擋
│  ├─ collab.sh               發版：強制先 pull → 快照進子目錄 → 開 PR
│  ├─ cleanup.sh              刪已合併的 PR 分支（edit/、port/）；pull.sh 每次順手跑
│  ├─ gh-auth.sh              找一把真的推得動的 GitHub 憑證（上面幾支共用）
│  └─ devserver.py            本機預覽 server（送 no-store，取代 python -m http.server）
│
└─ app/                       ← 原型站台（唯一的開發版，對應 monorepo main；資料夾名稱固定）
   ├─ *.html ×40              產品頁面 ＋ design-system.html
   ├─ js/ ×15                 共用前端腳本：theme / i18n / icons(+icons-all) / sidebar / chart / hero /
   │                          reveal / components / scenario / devtools / projects-store / products-store …
   ├─ partials/ ×17           modal / wizard / finance-overview 等片段（html + js）
   ├─ ds-components/ ×92 css  設計系統元件（一元件一檔）
   ├─ *.md ×12                規格與治理：SPEC / BUILD-SPEC / ASSUMPTIONS / STYLE-DECISIONS /
   │                          design-system.md / ds-index.md / UI-CHANGES(+archive) /
   │                          component-library / requirements-map / feature-scope-map
   ├─ fonts/                  自架字型（woff2）
   ├─ images/                 專案／商品／IP 視覺資產
   ├─ screenshots/            開發截圖（本機保留、不進 repo）
   ├─ scratch/                本機暫存，不追蹤、不發版
   └─ docs/                   雜項文件（deploy.sh 排除，不上線）
```

**29 個頁面分區：** 入口 `index` ｜ E-Shop `e-shop / store-settings / tier-settings / product-detail / orders / order-detail` ｜ 收益 `earnings / request-payout` ｜ IP `ip-market / my-ip / ip-detail / register-ip` ｜ 專案活動 `projects / project-detail / events / event-detail` ｜ 粉絲 `fans-crm / fan-detail` ｜ 建立流程 `create-product / create-auction / create-bundle / create-event / create-project` ｜ 詳情 `auction-detail / bundle-detail` ｜ 設定 `settings` ｜ 設計系統 `design-system.html`

---

## 2. 檔案之間的關係（依賴鏈）

由底層往上：

1. **Token 層** — `ds-components/_tokens.css`：所有設計 token（顏色 / 字級 / 間距 / 圓角 / 陰影 / 深色）。**每頁都載**。元件全靠 `var(--token)`，所以改這裡 = 全站換膚。
2. **字型** — `ds-components/fonts.css`（@font-face）→ `fonts/*.woff2`。
3. **元件層** — `ds-components/{name}.css`（63 個，一元件一檔，皆吃 token）。
4. **共用腳本** — 每頁載入：`js/theme.js`（主題）、`js/i18n.js`（中英切換，配 `data-en`/`data-zh`）、`js/icons.js`+`js/icons-all.js`（圖示 registry → applyIcons，配 `data-lucide`）、`js/sidebar.js`（app-shell 導覽）、`shared.css`；其餘 `js/chart.js` / `js/hero.js` / `js/reveal.js` 等按需。
5. **頁面層** — `*.html` = 「共用 chrome + 它用到的元件 CSS 子集 + 它用到的 `partials/*.js`」。
6. **元件展示** — `design-system.html` 載入**同一份** `ds-components/*.css` 來展示 → 是元件的**單一真相來源**（設計師檢視元件只看它）。
7. **文件層** — `design-system.md`（規格）、`component-library.md`、`requirements-map.md`、`SPEC` / `BUILD-SPEC` / `ASSUMPTIONS` / `UI-CHANGES`。

載入順序：`theme.js`（早，防閃白）→ `_tokens` → `fonts` → 元件 CSS → `shared.css` → `icons / i18n / sidebar` + 頁面 partials。

---

## 3. 改東西會觸發哪些流程

| 你改了… | 必須連帶做 |
|---|---|
| **Token**（`_tokens.css`） | 影響全站所有元件 + 頁面 → 跨頁、跨深色目視驗證 |
| **寫出可重用樣式** | 第一次就 promote 成 `ds-components/{name}.css`，不留在頁面 `<style>` |
| **某個元件**（`ds-components/X.css`） | ① 同步 `design-system.html`（demo 卡 + TOC）② 同步 `design-system.md` 條目 ③ grep 所有用到的頁、一起改（共用元件改一次、同步全部 consumer） |
| **i18n 字串** | 加 `data-en` / `data-zh` 成對 + `js/i18n.js` 字典 |
| **新圖示** | 先在 `js/icons.js` registry 註冊，再用 `data-lucide` |
| **新字型** | 放 `fonts/` + `fonts.css` 加 @font-face |
| **規則手冊**（`app/rulebook/`） | 只轉述 `documents/` 已定案規則；不跑 Edit Cycle、不記 UI-CHANGES；改 `shell.js`／`shell.css` 要升全部頁面的 `?v=` |
| **新增 `UI-CHANGES.md` 紀錄** | 標題下一行寫 `**標籤**：…`（只進最終版的不寫），判斷規則見 §5 |
| **任何收尾** | 跑 `check_ds_sync.py "site/app"`（**11 項**：元件 CSS 都進 DS 頁／頁面用的 CSS DS 也有／資產版本一致／元件有 demo／元件無裸色／TOC 錨點／token 真實性／DS 級覆寫不留頁面／md↔html 同步／頁面 token 棘輪／零消費元件），FAIL 修掉；再 append `UI-CHANGES.md` 最上方、同步 `requirements-map.md` |
| **要清瀏覽器快取** | **平常不用做**——資產版本已凍結成固定的 `?v=r2.2`。線上由 Vercel 的 `must-revalidate` ＋ ETag 負責，本機由 `devserver.py` 的 `no-store` 負責。真要強制清才手動跑一次 `bump_ver.py "site/app" <新字串>` |

> 規則出處：規則摘要在專案 `CLAUDE.md`「site/ 原型編修鐵律」；詳細 Edit Cycle 在 `project-ui-creator` skill；檢查由該 skill 的 `scripts/check_ds_sync.py`；**收尾守門員**是個 Stop hook，想結束一輪時自動跑 check，FAIL 就擋住。

---

## 4. 發版流程（黃色 = 要先問使用者才做）

2026-07-26 大改：同步從「自製檔案比對」換成**真正的 `git merge`**，發版前強制先同步。動機與舊版的壞法見本節最後。

```mermaid
flowchart TD
    A(["開工"]) --> B["① 在 site/app 編輯"]
    B --> B2["② 本地 commit<br/>自動做、不問<br/>（不影響發版內容，純還原點）"]
    B2 --> E{"要發版?"}
    E -- "還沒" --> B
    E -- "要" --> F{{"⭐ 問使用者：要開 PR 嗎?"}}
    F --> G["③ ./collab.sh 說明"]
    G --> G1["③-0 強制先跑 ./pull.sh<br/>subtree split → git merge<br/>把 monorepo 最新內容真正合進本機"]
    G1 --> C{"有衝突?"}
    C -- "有" --> C1["停下來、不發版<br/>行級衝突，手動解 → git add → commit<br/>解完重跑 collab.sh"]
    C1 --> G1
    C -- "沒有" --> G2["③-1 快照灌進 ztor-creator-studio/<br/>→ 開分支 → commit → push → 開 PR<br/>（新增條目的標籤貼成 PR 標籤）"]
    G2 --> I["PR 開在 ztor20/Creator-Studio<br/>只含真正的改動"]
    I --> J{"GitHub 顯示衝突?"}
    J -- "有" --> J1["代表你發版期間有人又合併了<br/>重跑 collab.sh 即可"]
    J1 --> G1
    J -- "無 / CLEAN" --> K{{"⭐ 問使用者 → 按 Merge"}}
    K --> L["merge 進 monorepo main<br/>⚠ 還沒上線！"]
    L --> P1["④ 立刻再跑一次 ./pull.sh<br/>消除發版造成的「同樹不同血統」分歧<br/>此刻兩邊內容相同，無痛自動合併"]
    P1 --> M{"要更新線上站?"}
    M -- "不用" --> N(["結束"])
    M -- "要上線" --> O{{"⭐ 問使用者 → ./deploy.sh<br/>（線3，與協作 PR 獨立）"}}
    O --> P(["Vercel 自動 build → 線上更新"])

    classDef gate fill:#FFDB29,stroke:#171717,stroke-width:3px,color:#171717;
    classDef warn fill:#FFF3CD,stroke:#DA314A,stroke-width:1px,color:#171717;
    class F,K,O gate;
    class L,C1 warn;
```

**四個關卡，三個要問：**

| 步驟 | 要問嗎 | 為什麼 |
|---|---|---|
| 本地 commit | **不用** | 純本機還原點。`collab.sh` 送的是工作目錄快照（含未提交編輯），有沒有 commit 不影響發版內容 |
| 開 PR（`collab.sh`） | **要** | 推到協作 repo，別人看得到；新增 `UI-CHANGES.md` 條目的標籤會貼成 PR 標籤（規則見 §5） |
| Merge | **要** | 進 main |
| 上線（`deploy.sh`） | **要** | 對外 |

**四個重點：**

- **③-0 的強制同步跳不掉**，這是「不會洗掉別人工作」的唯一保證。同步過後，本機必然 ＝ 遠端 ⊕ 你的改動，快照送出去就不可能還原別人的東西。
- **衝突現在是行級的、而且會擋。** `pull.sh` 撞到同一行就停，列出檔案要你解。純 `?v=` 版本字串的衝突沒有語意，腳本自動以本機版收掉。
- **④ merge 後那次 pull 不能省。** 發版是把快照灌進 monorepo、送出去的不是你的 commit 物件，所以 merge 完 main 那筆提交跟本機 HEAD 是「同樹不同血統」，兩邊立刻分歧。當下內容相同、pull 無痛；一旦先改了東西再 pull，同一段落就會撞出假衝突（2026-07-26 實測踩過）。
- **Merge ≠ 上線。** 合併只進 monorepo，線上站不會變；要更新線上一定要另跑 `deploy.sh`。

### 為什麼要大改（舊流程的壞法）

舊 `collab.sh` 是：clone 最新 main → 清空子目錄 → 灌入本機整包快照 → **從最新 main 開分支**。分支永遠是 main 的線性子代、沒有分歧點，所以 **git 永遠不會報衝突**——本機任何一個落後的檔，在 PR 裡都長成「你刻意改成這樣」，merge 後同事已合併的工作就被**靜默還原**，而且 PR 一律顯示 CLEAN、沒有任何警告。

三種具體壞法：

1. **靜默還原**：B 改了某支 CSS 並合併，A 沒同步就發版 → 那支 CSS 被還原成舊版
2. **新增檔被刪**：B 加了新元件與圖片，A 本機沒有 → 整包灌進去等於刪除
3. **空窗期**：A 就算先同步了，接著改兩小時，期間 B 合併的東西一樣會被洗掉

改成真 merge 後：1、2 由 `pull.sh` 的三方合併擋下；3 由「`collab.sh` 內建同步 ＋ GitHub 對落後基準做真三方比對」擋下。

舊版腳本已於 2026-08-19 刪除（保留只是誘人誤跑一個會靜默還原別人工作的流程；沿革看本段與 git 歷史就夠）。一次性的歷史接合（`git subtree split` ＋ `-s ours` graft）在 site/ 留了安全點 tag `pre-subtree-graft-20260726`。

---

## 5. 交付版凍結（release）

已交給開發的階段不留在 `main` 的切換面板上，改成 monorepo 裡一條**凍結分支**：版本鎖死、有自己的網址、只收明確要進去的修正。目前只有 release2.3（E-Shop 交付範圍，原名 Phase 1），下一版是 release2.4。「release2.3」是交付版，跟設計換裝世代「r2.3」是兩回事，別混用。

| 項目 | release2.3（E-Shop） |
|---|---|
| 分支 | `ztor20/Creator-Studio` 的 `release2.3`（原名 `phase1`，2026-10-07 改名；GitHub 會把舊名稱自動轉到新名稱） |
| 網址 | `https://ztor-cs-release2-3.vercel.app`（主要）<br>`https://ztor-cs-phase1.vercel.app`（舊網址，保留繼續有效） |
| 部署目標 | repo `lern2317/ztor-cs-phase1`、Vercel 專案 `ztor-cs-phase1`（名稱不變，改名會斷自動部署） |
| 改版紀錄 | 分支裡的 `ztor-creator-studio/RELEASE2.3-CHANGES.md` |
| 版本標籤 | 每次升版打標籤 `release2.3-vX.Y`，目前 v1.4<br>舊標籤 `phase1-v1.0`～`phase1-v1.3` 保留不動，從 `release2.3-v1.4` 起用新名稱 |
| 本機 | **沒有**凍結版的檔案；本機 `site/` 永遠只放 `main` |

### 把一筆修正搬進 release2.3

`release-port.sh`、`deploy-release.sh` 在維護者本機的專案根（`site/` 的上一層），不在 monorepo 裡。

```mermaid
flowchart TD
    A["先照 §4 把改動發進 main"] --> B{{"⭐ 使用者說：這筆要進 release2.3"}}
    B --> C["../release-port.sh release2.3 &lt;commit&gt; --check<br/>先試套，確認不衝突"]
    C --> D["../release-port.sh release2.3 &lt;commit&gt; 說明<br/>patch 套到 release2.3（內建排除三份紀錄檔）<br/>→ 開 port/ 分支 → PR（base＝release2.3，自動掛同名標籤）"]
    D --> E["在同一個 PR 補 RELEASE2.3-CHANGES.md 升版條目"]
    E --> F{{"⭐ 問使用者 → Merge"}}
    F --> G["打標籤 release2.3-vX.Y"]
    G --> H{{"⭐ 問使用者 → ../deploy-release.sh release2.3"}}
    H --> I(["約 1 分鐘後凍結版網址更新"])

    classDef gate fill:#FFDB29,stroke:#171717,stroke-width:3px,color:#171717;
    class B,F,H gate;
```

- `release-port.sh <release> <commit> ["說明"] [--check]`：例如 `../release-port.sh release2.3 3f2a1bc --check`。預設排除 `ASSUMPTIONS.md`、`UI-CHANGES.md`、`requirements-map.md` 三份已分歧的紀錄檔，只搬程式與設計系統文件。
- `deploy-release.sh <release> ["說明"]`：例如 `../deploy-release.sh release2.3`。新交付版要在腳本裡的 `release_target` 補一筆部署目標。
- 凍結分支上有幾處「鎖版本」的改動：`devtools.js` 標 `★ RELEASE2.3 FROZEN` 的段落，以及 `feature-scope-map.md` 開發版本配置表只留 `release2.3` 一列。搬修正時這些段落要保留，不要被 `main` 的內容蓋掉。
- 試套失敗代表凍結版和 `main` 已經長得不一樣，要手動改寫那筆修正，不要硬套。

### 版本切換面板與功能表 tier

`main` 的版本切換面板只有四個選項：

- 最終版
- release2.4（版本鍵 `release2.4`，規則 `tier:release2.3,release2.4`）
- funding-test
- Deck for Sony

`app/feature-scope-map.md` 的 Tier 欄分四種：

- `🟢 release2.3`：已交付
- `🔵 release2.4`：下一版
- `⚪ TBD`：未排定
- `⚫ 退場`

### 每期輪替步驟

1. 把要做的功能在 `app/feature-scope-map.md` 標 `🔵 release2.4`。
2. 用面板的「release2.4」確認畫面。
3. 從 `main` 切 `release2.4` 分支鎖版本。
4. 開部署 repo 與 Vercel 專案，在 `deploy-release.sh` 的 `release_target` 補一筆，開新網址。
5. 交付後把那批功能改標 `🟢 release2.4`；`main` 的下一版改成 release2.5（`feature-scope-map.md` 開發版本配置表，加上 `devtools.js` 的 `VERSIONS` 後備、`TIER_EMOJI` 的 🔵 改對到 release2.5；新標 🔵 的功能在 `FEAT_TIER` 後備補一筆，已交付的 `release2.4` 值不用改）。

### 新功能的規則

做出來的當下就掛 `data-feat` 標記並登記在 `feature-scope-map.md`（預設 ⚪ 未排定）。沒掛標記的東西每個版本都會出現，`main` 的 release2.4 預覽就會多顯示不在範圍的功能。

### UI-CHANGES 的交付版標籤

`app/UI-CHANGES.md` 每筆紀錄標題下一行寫標籤，標出這筆改動會進哪個交付版。格式是 `**標籤**：release2.3`、`**標籤**：release2.4`，或 `**標籤**：release2.3、release2.4`；只進最終版的不寫這一行。判斷依 `feature-scope-map.md` 的 Tier 欄：

| 改到的功能 | 標籤 | 要不要先問使用者 |
|---|---|---|
| `🟢 release2.3`（E-Shop） | 選同步：`release2.3、release2.4`<br>選不同步：`release2.4` | **要**：問要不要同步改進凍結的 release2.3 |
| `🔵 release2.4` | `release2.4` | release2.4 凍結後要，凍結前不用 |
| `⚪ TBD` 或沒掛功能標記 | 不寫標籤行 | 不用 |

- 選同步的條目，發進 `main` 後用 `release-port.sh` 搬進 release2.3。
- 選不同步的條目，只改在 release2.4 與最終版。
- `collab.sh` 開 PR 時讀這次新增條目的標籤，貼成 GitHub PR 標籤，PR 內文列出新增條目的標題。標到已凍結的交付版時，結尾提醒用 `release-port.sh` 搬。

> 另一條線（不在此圖）：`documents/`、`requirement/` 等 `site/` 以外的內容，是一般 `git push`，**無 PR、無 merge 關卡**。
