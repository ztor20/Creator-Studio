# Ztor Creator Studio · R 2.2 · UI-CHANGES

> 嚴格分區：**A** spec-derived 新增 · **B** 反饋導入 · **C** 撤除（intentional removal）· **D** infra / 文件。Bug 修正不寫。
>
> 每筆紀錄日期 + 範圍 + 動機（為什麼這樣設計）。R 2.1 是從零搭起，所以首筆紀錄包山包海；之後的調整一筆一筆來。**2026-07-29 起版本改為 R 2.2**，本檔沿用 R 2.1 的完整紀錄繼續往下寫（R 2.1 資料夾已凍結唯讀）。

## 2026-08-01 · 黏頂通知條加漸層遮罩 ＋ 分頁工作列接手置頂（B 反饋／使用者裁決）

使用者：「當有提示訊息在上面時，往上滑，底下的內容應該被遮住。可以將提示訊息下方加上一個背景色漸層，讓底下內容在提示訊息下方漸消。」先做 `earnings-sony.html` 的複本探索頁確認效果、看過後套用，探索頁已刪除。

- **【B】** **`.alert-inset::before` 黏頂遮罩**（`ds-components/alert.css`）：卡片本身不透明，但**上方那道 16px 空隙**與**卡片正下方**是空的，往上捲時內容會從這兩處穿出來（使用者截圖裡頁面標題從通知條上方冒出就是這個）。補一層 `--surface-page` 同色底，上緣往上多蓋 200px（黏頂與過捲都不露），下緣延伸 `--alert-inset-fade`（44px）做漸層淡出。`z-index:-1` 讓它坐在卡片後面——`.alert-inset` 有 z-index、自成堆疊脈絡，負值只落到該脈絡底層、仍蓋在頁面內容之上。靜止時卡片下緣到頁面第一行字有 68px 空隙，44px 的淡出整段落在空白處、標題不會被糊到（實測）。生效範圍＝所有 `.alert-inset` 消費頁：e-shop 低庫存、fan-analytics、fans-crm、earnings-sony、`js/scenario.js` 注入的活動情境提醒。
- **【B】** **`.alert-inset` 的 z-index 6 → 10**：使用者回報「tab 滑上去時會在通知上面」。根因是它與 `.list-toolbar`（`list-toolbar.css:20`）**同為 6**，同層時 DOM 在後面的贏，所以整條分頁工作列會蓋過黏頂的通知。抬到 10——高過一般頁面內容與工作列（6），仍低於黏頂的 `.list-dock`（20）／篩選浮層與下拉（30）／`app-topbar`（50），那三者本來就該壓在通知之上。站上沒有正式的 z 階梯文件，以既有數字為準對齊。
- **【B】** **分頁工作列改用共用的 snap dock 貼頂**（使用者兩次修正：先「滑到 tab，tab 應該 fix 置頂，此時消息提示應該被往上滑掉」，再「參考電子商店的 tab 做法，應該會變成與邊邊連在一起的設計」）。中途曾在 `earnings-sony.html` 頁內手刻一版 `.list-toolbar { position:sticky; z-index:12 }`，**已撤除**——那會讓同一個視覺角色站上有兩種貼頂做法。改法：
  - **`js/sticky-dock.js` 放寬骨架要求**：原本 `if (!toolbar || !statusRow) return;` 要求工作列與狀態列俱全。站上出現了第二種骨架——只有分頁、沒有次層篩選的工作列——那種頁面完全吃不到這套貼頂。改成狀態列選配（`if (!toolbar) return;`＋`if (statusRow) bars.appendChild(statusRow)`）；`setupFilters()` 本來就會在找不到狀態列時自己返回，不必再改。五個既有消費頁行為不變。
  - **`earnings-sony.html` 接上**：工作列與兩個分頁面板一起包進 `.list-dock`（殼要往下包住內容，sticky 只能在親層 box 裡移動，腳本靠殼裡有沒有 `.bento` 判成 `--tall`）、補掛 `js/sticky-dock.js`。`mt-24` 從工作列移到 `.list-dock`——貼頂時 `.list-dock__bars` 是 flex 容器，工作列的 `margin-top` 會被算進那一條的高度（實測 58 → 81px）。**零新樣式**，貼頂態的形狀全部來自既有的 Snap dock 段。
  - **貼頂時通知條讓位**：`ds-components/alert.css` 加 `.main:has(.list-dock.is-snapped) .alert-inset { position: static; }`，解除 sticky 讓它隨頁面捲走。順帶修掉 e-shop 既有現象——dock 貼在 `top:0`、通知條貼在 `top:16`，兩者高度不同，通知條下緣本來會從 dock 底下探出約 15px（實測 dock 16–73、通知條 32–88）。
  - 實測（1512px）：貼頂態 `border-radius: 0 0 16px 16px`（上緣切平＝與外框連成一體）、工作列 44px、`backdrop-filter: blur(14px) saturate(1.4)`、下緣 1px 邊線、通知條 `position: static`。**未能端到端驗證的部分**：`is-snapped` 的切換靠 IntersectionObserver，而 Browser pane 在程式化捲動下不會派送 IO 回呼（自建的觀察者同樣收不到），所以「捲到門檻自動切換」這一段是靠既有五頁的共用機制推定，不是我親眼看到的；請你實際捲一次確認。
- **【D】** `.fin-tip` 的 `box-shadow` 由寫死 `rgba(...)` 改回 `var(--shadow-float)`（DS 高度階梯 E3 浮層＝下拉／popover／tooltip 的階）。原本是既有負債，探索頁複製後觸發 check 10 棘輪 FAIL，順手修掉，站上寫死裸值 55 → 54 處。
- **【D】** `design-system.md`／`design-system.html` 的 `.alert-inset` 條目同步（遮罩、z-index、與黏頂工作列的接手）。check_ds_sync PASS、棘輪未升。

## 2026-08-01 · 欄距整理、取消獨立於儲存、前 % 名連動粉絲組成、載入更多同步 e-shop（B 反饋）

- **粉絲排行榜欄距**：排名欄 36→28px、分級欄 108→94px，gap 12→14px。兩欄原本是為舊內容留的寬度——排名曾是 36px 圓形頭像、分級 badge 曾整欄拉滿——換成小號數字與 hug 版 badge 後，欄框仍是舊尺寸，內容與下一欄之間留下 30～60px 沒有意義的空白，比其餘固定間距鬆散數倍。94px 已覆蓋最寬的英文 badge「Ranked fans」（實測 86px）；中文短標籤（如「粉絲」）仍會留下較大殘餘空白，這是「badge 要 hug＋固定欄寬要跨兩種語言對齊」兩個要求疊加下無法完全消除的取捨，已改善但非零。
- **編輯改回「取消」＋「儲存」兩顆**：閒置態一顆「編輯」；點下去換成「取消」（不落地，恢復進入編輯前的樣子）＋「儲存」（commit）。進入編輯時拍一張快照（輸入值、開關狀態、新增／複製出的列），取消時整份還原。每張卡各自快照、互不影響。
- **改「前 % 名」時粉絲組成即時連動**：三個門檻是巢狀的（核心圈 ⊂ 超級粉絲 ⊂ 上榜粉絲 ⊂ 全部），母數用 1,283（活躍粉絲，也是原始 154/359/475/295 那組示範數字真正的母數，換算後 12/28/37/23% 全部對得上）。輸入時即時重算圓餅 `--pie-stops`、圖例百分比與人數、以及「最小的 X% 粉絲貢獻了 Y% 收入」那句洞察（原本是頁面載入時算一次就不動的 IIFE，抽成 `window.ztorRefreshFanPareto()` 供這裡呼叫回去）。**取消時這些也一併還原**——圓餅卡不在編輯狀態的卡片範圍內，額外對它拍了快照。
  - legend 的名稱與百分比原本黏在同一個 `data-i18n` 字串裡（如「Inner Circle · 12%」），語言切換時 `applyI18n` 會把即時算出的百分比蓋回寫死的舊值。拆成 `<span data-i18n>名稱</span> · <span class="source-row__sharepct">數字</span>` 兩個節點解決。
- **載入更多同步 e-shop 商品列表**：改用 `.list-footer--center`（置中變體）＋ `btn--ghost` 按鈕；「顯示 N / M 位」的常駐計數拿掉，改成跟 e-shop 一樣——未載完只見「載入更多」，全載完只見置中的 end-cap「已顯示全部 N 位」，兩者互斥而非並存。
- **`.tier-ov__row` 列高加大**：`padding` 由 `--sp-10` 提到 `--sp-14`（單列 56→65px）。

---

## 2026-08-01 · 權益列選單、單位 i18n、中英夾雜與頭像（B 反饋）

- **每列權益加「…」選單**（`details.dropdown`，同 e-shop 商品列的做法），內含**複製**與**移除**。只在編輯態出現——唯讀時沒有可做的動作，一排恆亮的選單鈕會讓人以為表格隨時可改。有選單的列多一欄放它，沒有選單的列補一格空的，四個分級欄才不會錯開（實測兩態都對齊在同一個 x）。
- **複製＝整列複製**：四個分級的值原樣帶過來，名稱欄換成輸入框並預填「原名 副本」，Enter 存、Esc 取消。預填而不是留空——留空會讓 Enter 直接送出一個沒有名字的權益。
- **移除沿用 benefit-matrix 的判斷**：真的有分級在用時先問，沒人用的安靜刪掉。
- **最低忠誠點數補單位「點」**；`天`／`點` 改吃 i18n（原本寫死中文，英文介面下會冒出中文單位）。
- **修中英夾雜**：`fans.tier.inner` 的中文欄位留著 'Inner Circle'、`fans.hof.peak.*` 是「巔峰 · Inner Circle」。分級名稱的唯一出處是 `tier-settings.tier.*`，這組 `fans.*` 是重複定義，已把中文對齊為核心圈／粉絲。**重複本身沒解掉**，只是先讓值一致。
- **分級徽章不再被拉滿整欄**：grid 子項預設 `justify-self: stretch`，`.badge` 被拉成一條色條。補 `justify-self: start`。
- **粉絲頭像**：站上沒有粉絲人像素材，也不該拿商品／IP 圖當人臉，所以用縮寫圓（同頂列帳號頭像的語言）。色相由名字雜湊決定——同一位粉絲每次載入／切語言／重新排序都是同一個顏色；真隨機的話排序一次整欄變色，看起來像換了一批人。短中文名用 `h*31+c` 低位不散（實測 5 人有 4 人撞色），改用 FNV ＋ avalanche。排名圓圈同時降成純數字：一列兩個圓會互相搶。

---

## 2026-08-01 · 分級設定改成就地編輯，編輯彈窗退場（B 反饋 ＋ C 撤除）

原本按「編輯」開一個裝著 `.bmx` 矩陣的彈窗。使用者裁示改成**就地編輯**：按下去之後「組織你的粉絲圈」與「行為加權」兩張卡直接變成編輯狀態，欄位換成原本在彈窗裡的那些控制項。

- **兩個狀態、一份 DOM**：唯讀值（`.tier-ov__read`）與編輯控制項（`.tier-ov__edit`）都寫在 DOM 裡，用 `display` 切換。不採「按下去才生成」——生成式會在切換那一幀重排整張表，而且捨棄時要把原值找回來。
- **列高以較高的狀態為基準**（使用者指定）：`.tier-ov__cell` 恆為 `--control-h-sm` 高。唯讀是一行文字（約 19px）、編輯是 36px 輸入框，不預留的話按下「編輯」整張表會抽高、下面的內容整片位移。**實測兩態列高完全一致**。
- **兩張卡同進同出一個模式**：它們是同一份設定的兩半，分開存會讓「門檻改了但加權沒存」變成可能的狀態。所以儲存／捨棄只有一組，放在 `.page-intro__actions`——順便白拿 `sticky-actions.js`（那支腳本就是掛這個容器，捲下去會自動複製成吸底動作列）。
- **捨棄回到「進入編輯的那一刻」**，不是回到頁面初值：進入時快照輸入值與開關狀態，捨棄時還原，並移除這一輪新增的權益列。
- **「目前人數」是 `--locked` 列**：編輯態降一階、不給控制項，但不隱藏——它是判斷門檻要怎麼調的依據。
- 「新增權益項目」與生效時機說明改成只在編輯態出現。
- **【C】編輯彈窗撤除**；變更歷史彈窗保留（唯讀，與編輯模式無關）。

---

## 2026-08-01 · 收合式搜尋的 ✕ 貼齊右緣（D infra，元件層）

`.search-collapse` 展開後殼是固定寬（240px），但內層 `.field-pill__input` 沿用預設的 `flex: 0 1 auto`、只佔文字寬，於是 ✕ 跟著文字走、右邊留下一段隨字數浮動的空白（實測 30px）。

`field-pill` 本來就有 `--grow` 提供「輸入吃滿、後置元素貼右」的行為，只是收合式搜尋沒有掛上。這次直接寫進 `search-collapse.css` 的版面契約（`.search-collapse__field .field-pill__input { flex: 1 1 auto }`）而不是逐頁加 class——殼固定寬、輸入吃滿、✕ 貼右是這支元件的定義，不是消費頁的選擇。

**五個消費頁一起生效**：fans-crm／projects／e-shop／orders／pickup。實測 fans-crm 與 projects 的 ✕ 右側間距由 30px 收成 5px（＝pill 自己的 4px 右內距）。

### 【B】追加同日：編輯改成單鈕來回切、補說明鈕、目前人數換成權益數量

- **編輯是一顆按鈕來回切**：鉛筆「編輯」→ 欄位可編輯 → 打勾「完成」→ 收回唯讀。撤掉前一版放在頁首的儲存／捨棄——按鈕自己就是那個開關，多一組頁首動作只會讓人問「那這顆編輯又是什麼」。**每張卡各自獨立**（使用者是對著單一 section 說話）。
- **修掉行為加權點不動**：`.tier-ov.is-editing .tier-ov__edit` 這個選擇器要求「帶 .is-editing 的 .tier-ov 祖先」，但行為加權那幾列走的是 `.settings-row`、沒有 `.tier-ov` 祖先，於是整組進不了編輯態。改成掛在任一 `.is-editing` 祖先上。
- **兩道門檻補 (i) 說明鈕**，面板原樣自備份頁 `tier-settings.html` 搬來（`explain-toppct` / `explain-points`）。
- **「目前人數」改成「權益數量」**，而且**用算的不寫死**：編輯時開關一動就要跟著變，否則「我剛給了超級粉絲一項權益」在摘要那列上看不到。實測 10/7/2/0，替上榜粉絲開一項後變 10/7/3/0。
- **規則卡的「唯讀」膠囊移除**。
- **權益數量移到表格第一列**（使用者裁示）：它是這張表的摘要，該先講結果再講細節。
- **編輯鈕文案／圖示定案**：鉛筆「編輯」↔ 勾勾「儲存」，編輯態轉 `btn--primary`。
- **表頭下框線移除**：補齊 2026-07-31 的全站裁示「列表表頭不畫下框線」——`product-list` 與 `benefit-matrix` 當時已改，`tier-overview` 是之後才建立的、漏掉了。分隔改由留白承擔。
- **修掉兩個圖示同時出現**：`icons.js` 把 `<i data-lucide>` 換成 `<svg>` 時不會帶走 `hidden`，所以 hidden 掛在 `<i>` 上等於沒掛。改成掛在外層 `<span>`；外層帶 `.flex-row`（`display:flex`）又會蓋掉 UA 的 `[hidden]{display:none}`，所以再補一條 `[data-icon-idle][hidden]{display:none}`——站上 `alert.css`、`list-toolbar.css` 都踩過同一個坑。

---

## 2026-07-31 · 粉絲群組重整：分級設定＋分級權益併入粉絲管理，兩頁自導覽退場（A spec ＋ B 反饋 ＋ C 撤除）

> 起點是一輪版面討論：「如果粉絲圈頁面要包含分級權益和分級設定，整個頁面 wireframe 要怎麼重新設計」。
> 探索稿走了兩版（四張分級卡 → 一張四欄對照表），第一版被使用者否掉，原因記在下面「作廢的做法」。

### 【B】導覽改名與收斂

- 粉絲群組由 6 個子項收成 4 個：**粉絲分析**（`fan-analytics.html`，本日稍早曾叫「總覽」）、**粉絲管理**（`fans-crm.html`，原「粉絲圈」／再原「總覽」）、媒體庫、粉絲活動。
- **分級權益（`tier-benefits.html`）與分級設定（`tier-settings.html`）自側欄移除**，檔案保留、各自加了墓碑註解（見【C】）。兩個檔名仍留在 `sidebar.js` 的 `match` 陣列裡——舊連結或書籤打開時側欄還會亮在「粉絲」這一組，不會失去定位。

### 【A】粉絲管理新增「粉絲分級設定」分頁

分頁列由 2 個變 3 個（排行榜｜名人堂｜粉絲分級設定），並裝進 `.list-toolbar` 的 58px 殼——`--underline-label` 的底線照容器下緣畫，沒有殼會變成浮空的一截橘線（同日在 tabs.css 立為鐵律）。群發訊息移到殼的右側動作群，只在排行榜分頁出現：動作要貼在它的對象旁邊。

新分頁的版面＝左欄直著疊三塊、右欄放粉絲組成（7/3）：

- **組織你的粉絲圈** — 新元件 `.tier-ov` 的四欄對照表：門檻兩列 ＋ 目前人數 ＋ 十項權益。右上角「編輯」「變更歷史」
- **行為加權** — 四列權重，右上角「編輯」
- **規則** — 四條產品規則，掛「唯讀」膠囊（由上游掌管）
- **粉絲組成** — 由原本的 `.stacked-bar` 改成圓餅（`.pie`）＋圖例；沒有編輯鈕，它是分級的結果不是設定

三塊都唯讀，改一律走彈窗，所以**本頁沒有儲存狀態**，切分頁不必攔截未儲存變更。

### 【A】兩個彈窗

- **編輯分級與權益**（`.payout-dialog--wide`）：表單直接沿用分級權益那頁的 `.bmx` 矩陣結構，再把分級設定的兩道門檻插成矩陣最前面兩列——欄位本來就一樣（同樣四個分級），門檻只是多兩列，不需要第二張表。行為加權接在下方。三個入口鈕開的都是這一個，只差捲到哪一段（`data-tier-sec`）。
- **變更歷史**：唯讀版本紀錄，來源是原本「規則與版本」那段的 version history。

### 【D】元件層改動

- **新增 `ds-components/tier-overview.css`**（`.tier-ov`）：分級對照表，Benefit matrix 的唯讀對照版——矩陣負責改、這支負責看。design-system.md §4.93b ＋ .html demo ＋ TOC 已同步。
- **`payout-modal.css` 新增 `.payout-dialog--wide`**（880px）：預設 620px 裝不下五欄矩陣，`.bmx` 自己的 min-width 就是 760px。
- **`benefit-matrix.css`**：矩陣裝進彈窗時欄頭 sticky——12 列捲到一半，四個分級的欄頭已經捲出畫面。
- **清單卡框拿掉**：排行榜與名人堂不再包 `.card`（使用者裁示，比照電子商店商品列表的無框清單）；分隔仍由 `.data-list__row` 的底線承擔。

### 【C】撤除

- `fans-crm.html` 原本的 F3「粉絲組成」卡（`.stacked-bar` 版）自主流程移除，改以圓餅版重生在新分頁裡。
- 頁首動作群移除「受眾」連結（側欄的粉絲分析就是它）與「群發訊息」（移到分頁列），只留匯出 CSV。
- `tier-benefits.html` / `tier-settings.html` 加墓碑註解、退出導覽，**檔案未刪**（使用者指定保留備份）。

### 【B】追加同日：提示位置、搜尋與篩選改對齊既有模式

- **流失風險提示移到整頁最上方**：原本是 `.alert--banner.alert--error` 夾在 KPI 與分頁列之間，改成 `.alert-inset` ＋ `.alert--bar.alert--inset-card`（sticky 貼頂、`.main` 第一個子元素），與 E-Shop 低庫存條、粉絲分析同步異常條同一組。原位置每次進站都要先跨過它才看得到清單，而且紅色橫幅夾在內容流裡讀起來像「這一段壞了」，不像「有一件事要處理」。
- **搜尋移到分頁列右側**：改用 `.search-collapse`（放大鏡展開、× 收起並清空），同 projects／e-shop／orders／pickup。
- **標籤由 chip group 改成下拉**（使用者裁示）：比照項目頁「內容類別」的做法——`.select--bare` ＋ `margin-left:auto` 靠右，由 `zselect.js` 升級。⚠ **連帶行為變更**：原本 chip 可複選（多標籤取交集），下拉只能單選。
- **分級篩選由 `<select>` 改成 `.filter-tabs--brand`**，與標籤 chip 一起放進 `.list-status-row`，比照項目頁的兩層控制骨架。分級是互斥單選所以是 tablist，標籤可複選所以維持 chip group；兩者不同軸，中間加一道細分隔線。每一級帶自己的筆數，且**筆數只跟「搜尋 × 標籤」連動、不跟分級自己連動**——否則選了核心圈之後其他級全變 0，就看不出「切過去會有幾筆」。

### 作廢的做法（留著避免重犯）

1. **四張分級卡 ＋ 逐階編輯抽屜**：把「調核心圈」收成一顆鈕看似方便，但門檻的單調性（往下走前 % 名遞增、最低點數遞減）是儲存的前提，一次只看一階就驗不出來；權益也一樣，矩陣的價值就是「一眼看出上一階比下一階多什麼」，壓成三顆 chip 就沒了。使用者否決。
2. **全域規則收進 `.ztor-accordion` 折疊區**：該元件內容區硬上限 320px（為短文字段落設計），四列行為加權加規則說明會被裁掉。
3. **裸 tabs（無 `.list-toolbar` 殼）**：見上。

### 待回寫上游

`documents/0-設計規格書.md §3.2` 的 sitemap 仍列著分級權益（5.1.7.2）與分級設定（5.1.7.6）兩個獨立子頁，粉絲分析／粉絲管理的頁名也還是舊的。**頁面清單的唯一來源在那裡**，本次是先在 site 實作、規格未同步——要正式化需回頭改 §3.2 與對應的 `5.1.7.x` 分頁。

---

## 2026-07-31（第十九批）· 庫房總覽卡片牆 ＋ 單一庫房彈窗；已發出的鑰匙升成獨立區塊（B 反饋／使用者裁決）

- **【B】** **「兩個左欄」定案**。使用者指出全站導覽是左欄、庫房清單又是左欄，兩條並排太擠；庫房清單天生垂直（縮圖／名稱／內容數／鑰匙數），轉橫排塞不下——所以解法不是把它轉向，是讓它不要跟主內容同時出現。三種做法各做了探索頁，裁決結果：**頁面只放總覽卡片牆（`.vault-overview`），點一張卡把那座庫房開在彈窗裡（`.vault-modal`），彈窗內維持清單＋詳情的兩欄。** 彈窗裡沒有全站導覽，所以清單留在左邊只有一條左欄，並排的問題消失，換庫房也不必關掉彈窗。探索頁已刪除。
  - 未採用：只留標題旁的切換下拉（看不到全部庫房的概況）；把全站導覽改走頂列（那是全站偏好設定，為單一頁面改它本末倒置）。
- **【B】** 總覽卡把封面放大（側欄 276px 擠著的縮圖在卡片牆上有 240px 起跳的寬度），鑰匙數用 22px 標題字排在名稱下面——「哪座門開得最大」比清單更一眼看得出來，而那正是這一頁想講的事。
- **【D】** 彈窗外殼沿用 `.embed-modal`（同一層 z-index 80、同一張 backdrop），只換尺寸（1320×940）與內部捲動。捲動容器換成 `.vault-modal__body`，所以側欄與「誰進得來」的貼頂高度在彈窗內歸零。關閉有三條路：叉叉、點背景、Esc（分享抽屜或條件選單開著時 Esc 先關它們，不一路關到彈窗）。庫房名字只寫在彈窗標題列（捲不走），內文不再重複第二次。
- **【B】** **「已發出的鑰匙」從門條卡片下緣的一列升成獨立區塊**（`.vault-keys`）。條件回答「哪一群人自動符合」，鑰匙回答「我親手把權限交給了誰」——兩件事都通向同一道門，但塞在條件那張卡的下緣會被讀成條件的附註。`.vault-door__keyrow`／`__keyleft` 退場。彈窗主欄現在是四張同級的卡：誰進得來（吸頂）→ 解鎖條件 → 已發出的鑰匙 → 這座庫房裡。
- **【D】** 同一輪修掉被暴露的容錯問題：清單容器改從 document 找、`startDraft` 改成「替換掉傳進來的那顆按鈕」（總覽的新增卡也能就地變輸入欄）、`.vault-layout[hidden]` 補 `display:none`（又一個 `display:grid` 贏過 UA `[hidden]` 的案例）。`media-vault.html` 補載 `embed-modal.css`。`design-system.md`／`design-system.html` §4.102／§4.108 同步。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第十八批）· 媒體庫的區塊標題改用標題規格（B 反饋／使用者裁示）

- **【B】** 「解鎖條件」「誰進得來」「這座庫房裡」原本走 `.vault-door__label` 的**欄位標籤**規格——12px、全大寫、加字距、muted 色。那是用來標一個輸入框的寫法；這幾個各自帶起下面一整塊內容，是**標題**。改吃站上卡片標題的既有規格 `.card__title`（Satoshi 標題體 18px、Regular、前景色），全站區塊標題長得一樣。圖示跟著放大到 16px，維持 muted 色，不跟標題搶字重。
- **【B】** 「已發出的鑰匙」共用同一個 class，因此一併改成標題——它跟前兩者同在門條卡片裡、同一層級，留小字反而會讓同一張卡出現兩種標題規格。
- **【D】** class 名稱維持 `.vault-door__label`（`__label` 是歷史遺留，實際角色是標題）；改名會動到 4 處 HTML ＋ DS 頁，與另一個 session 的並行編輯有衝突風險，留待日後一次處理。層級現況：頁面 H1 44 → 庫房名稱 22 → 區塊標題 18。`design-system.md`／`design-system.html` §4.102 同步。check_ds_sync PASS。

## 2026-07-31（第十七批）· 媒體庫解鎖條件改成「幾種進得來的方法」（原型先行，待上游裁決）＋ 上傳入口改回方框（B 反饋／使用者指示）

- **【E】** **解鎖條件從「一串條件」改成「幾種進得來的方法」。這是權限規則變更，屬產品決策，`documents/` 尚未同步——原型先行供裁決，未經核准不得視為正式功能（記入 `ASSUMPTIONS.md` PG-025）。** 起因是使用者問「這裡的條件是不是連集」——查下去發現方向相反：現行是「或」（符合任一即可），缺的是「而且」。
- **【E】** 結構由使用者指定：**外層任一、內層全部**——列出幾種方法，任何一種達成就進得來；同一種方法裡的條件要一起達成。例：方法一＝「核心圈 ＋ 買過黑膠」，方法二＝「出席過簽名會」。資料上 `rules` 從單層條件陣列改成 `[{items:[…]},…]`，一個元素＝一種方法；舊資料的每個條件各自成為一種方法，語意不變。<br>**為什麼是這個方向**：創作者腦中的東西是「我開了幾條路給粉絲走」，每條路各有幾個門檻。反過來（外層全部、內層任一）同樣算得出結果，但要人自己在腦中補括號。
- **【B】** **措辭刻意避開邏輯符號**（使用者要求「小白才看得懂」）：畫面上寫「這些要一起達成」「或是」「多一種進得來的方法」「再加一個」，不出現「且／或／AND／OR」。總結句是「上面任何一種達成，粉絲就進得來。」
- **【B】** **漸進顯示**：框只在該方法有兩個以上條件時才畫（一個條件不需要圈起來）；「或是」分隔在有兩種方法時才出現。
- **【B】** **上鎖遮罩上的條件改直排**：一種方法一行、同行條件用「＋」串起、行間寫「或是」。橫排時斷行會讓看的人不知道括號在哪。
- **【D】** 邊界處理：空的方法不算達成（否則剛加一種還沒選條件，門就對全站開了）；刪到空的方法自動消失（最後一種除外，要留著當加條件的落點）；鑰匙不受影響，仍是疊在條件之上的另一條路，拆分讀數「靠條件／靠鑰匙／重疊」語意不變。資料層新增 `V.ruleMatches(vault, fan)` 與 `V.ruleCount(vault)`（判斷「有沒有設條件」用後者，`rules.length` 數的是方法數）。
- **【B】** **上傳入口改回方框**（撤回第十五批把它收進標題列 ghost 鈕的做法，使用者裁示）：空的與有內容都是同一塊 `.vault-empty`，只換標題（「這座庫房還是空的」／「新增內容」），有內容時矮一階（`--filled`）。方框同時是拖放目標，畫小等於把最省事的那條路藏起來。
- **【D】** `design-system.md`／`design-system.html` 的 Media vault（§4.102）同步，DS demo 換成「兩種方法＋或是」的實際結構。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第十六批）· 媒體庫頁首收斂：撤頁級建立鈕、檢視器靠右去字、新增庫房移到清單上方（C 撤除 ＋ B 反饋）

看過第十五批的實機之後的三條追加裁示。

- **【C】** **頁首的「新增庫房」主鈕撤除**，`.page-intro__actions` 整個拿掉。建立庫房的入口只留側欄那一顆——兩顆同名按鈕做同一件事，頁首那顆還得先把畫面捲到側欄再開草稿列，是繞路的第二個入口。`data-vault-new-top` 與其 handler 一併移除。
- **【C】** **檢視器旁的白話現況（`.vault-lens__state`）撤除**，`.vault-lens` 改 `justify-content: flex-end` 靠右。狀態已經寫在畫面上三個地方——側欄逐列標「打不開」、主欄蓋遮罩、下拉自己轉品牌橘——再補一句是重複。連帶把 `.vault-lens.is-on` 的整列底色也拿掉：內容靠右之後，橫幅上色會變成一大片空的色塊。「回到我的視角」留著，排在下拉左邊，讓下拉守住最右邊界。
- **【B】** **側欄「新增庫房」移到清單上方**（原本在清單底部）。按下去長出來的名字欄是清單第一列，按鈕就該在那一列正上方；擺在底部要人按完把視線拉回頂端。
- **【D】** `design-system.md`／`design-system.html` 的 Media vault（§4.102）條目與 demo 同步這三條。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第十五批）· 媒體庫版面重整四題 ＋「系統說明」全模組移位（B 反饋／使用者裁決）

使用者標了三張圖，另有兩題要求先討論再動；裁決結果四條全數採用推薦方案。

- **【B】** **「系統說明」離開動作列，全模組 8 頁一起改**。它站在「新增庫房」「儲存」旁邊會被讀成第三個動作，實際上只是把這一頁再解釋一次——跟說明文字同一個角色。改成說明段落末尾的 inline 連結 `.page-intro__help`，收在新的 `.page-intro__lede`（承接 560px 行寬，`__sub` 改 `display: inline`，連結就接在最後一句後面一起換行）。**不能寫在 `__sub` 裡面**：`applyI18n` 是 `innerHTML = v`，切語言會把連結一起洗掉，所以做成兄弟節點。受影響 8 頁：`brand-campaigns`／`brand-campaign-detail`／`fan-analytics`／`fans-crm`／`media-vault`／`tier-benefits`／`tier-settings`／`fan-detail`。`fan-detail` 沒有 page-intro，改接在 `.fan-hero__meta` 身分那一行末尾，同樣是「跟說明走、不跟按鈕走」。
- **【B】** **檢視身分自成一列**（圖一）。同日稍早才從側欄搬到頁首動作列，使用者看過實機後裁示再往下搬：新增 `.vault-lens`，橫跨在庫房側欄與內容的正上方。三個位置的差別是它被讀成什麼——側欄＝清單篩選器、動作列＝第三顆按鈕、這裡＝「以下所有東西都受這個角度影響」。同時補兩件配套：`.vault-lens__state` 用白話寫出後果（「以『上榜粉絲』的身分：7 座裡打得開 3 座、打不開 4 座」），開著時整列上底色；「回到我的視角」按鈕只在檢視中出現，離開的路一直在。
- **【B】** **新增庫房的名字欄移到清單第一列、拆掉外層卡片**（圖二）。原本 `.vault-rail__draft` 是「橘框卡片包住一個 `.input`」，而 `.input` 自己就有邊框與聚焦光暈，兩層疊成框中框——使用者說的「input 應該沒有這種元件樣式」就是這個。現在直接把 `.input` 放進清單，聚焦樣式交還元件。位置也從清單最下方（新增鈕上面）移到第一列，並讓新建的庫房 `unshift` 進陣列：打字的位置就是它等一下會站的位置。
- **【B】** **內容區重做：空的只給一張空狀態，有東西才長分區**（圖三）。原本三個分區固定存在、空的各印一句「尚無照片——拖進上面的上傳格」，加上常駐的上傳格，一座新庫房會連續印出四塊「這裡沒有東西」。改成——空庫房只有一張 `.vault-empty`（`.upload-tile` 加高版，同時是說明與投放目標，「三種媒體會各自歸位」那句教學在這裡講一次）；有內容之後上傳收進 `.vault-gridbar__right` 的 ghost 鈕，下面只長出真的有東西的分區。`.vault-group--empty`／`.vault-group__empty` 退場。兩個上傳入口共用住在標題列的同一個 `<input type=file>`，拖放仍綁 `[data-vault-grid]` 容器、與長相無關。
- **【C】** **內容區底部兩張 info-banner 撤除，各歸各位**。條件細則（何時重新判定、哪四類是永久的）貼著條件放成 `.vault-door__fine`——它回答的是上面那幾張 chip 的問題，壓在媒體清單下面等於問完隔了半頁才回答；整頁的原型示範聲明降級為頁尾 `.page-note`（橫幅是「請讀我」，這種長期聲明是「需要時查得到」）。
- **【D】** `page-intro.css` 新增 `.page-intro__lede`／`.page-intro__help`／`.page-note`（`.page-note` 與 `.page-crumb` 是同一個家族的兩端，故同檔），`.page-intro__actions` 補 `flex-wrap: wrap`。`media-vault.css` 新增 `.vault-lens` 系列／`.vault-empty`／`.vault-door__fine`／`.vault-gridbar__right`。i18n 新增 `vault.btn.add`／`vault.lens.reset`。`design-system.md`／`design-system.html` 的 Page intro（§4.44）與 Media vault（§4.102）條目同步改寫，DS 頁 demo 換成新結構。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第十四批）· 媒體庫「檢視身分」搬出側欄、升為頁級控制項（B 反饋／使用者裁決）

- **【B】** 使用者：「這個其實應該是整個檢視角度，是否不應該放在庫房的區塊裡面」。`.vault-viewer`（以某個粉絲分級檢視的下拉）原本住在側欄 `.vault-rail__head`，讀起來像「庫房清單的篩選器」，但它換的是整頁——側欄把打不開的庫房壓暗、**主欄同時把打不開的那座蓋上遮罩**。改放到頁首 `.page-intro__actions`，跟「系統說明」「新增庫房」同一列；側欄標題列只留「庫房 / 座數」。側欄那行右側在檢視器開著時仍換成「分級名稱 · 母體人數」（那是在解釋側欄鑰匙數字的分母，屬於側欄的事，留在原地）。
- **【B】** 高度改吃 `--control-h-sm`（36px，＝`.btn` 實際預設）：原本 `--control-h-xs` ＋ 上下 `--sp-8` 內距＝46px，放進按鈕列會高出一截。`.vault-viewer .select` 加 `min-width: 178px`，五個選項標籤長短不一時觸發鈕不會抽動。中英雙語與 zselect 下拉皆實測對齊。
- **【D】** `.page-intro__actions` 加 `flex-wrap: wrap`：這一列原本只放兩三顆按鈕都塞得下，多了一個 223–237px 寬的下拉之後，375px 視窗會直接爆出容器（「系統說明」被壓成直排、「新增庫房」切一半）。允許換行對既有頁面是零影響——沒有溢位就不會換行（fans-crm 四個動作、earnings 三個動作於桌機實測仍單行）。媒體庫另在 `max-width: 640px` 讓檢視器獨佔一行，另兩顆才排得整齊。
- **【D】** `js/media-vault.js` 的 `els.viewer`／`els.viewerWrap` 改從 `document` 查（原本從 `els.rail` 查，搬走就抓不到），`applyI18n` 一併補上檢視器那一塊。`design-system.md`／`design-system.html` 的 Page-intro 條目同步：動作列可放頁級控制項、會換行、放進來的控制項高度要對齊 36px。

## 2026-07-31（第十三批）· 具名素材槽數量隨比例收斂（依 D164／§7.10 規格落地）（A 規格落地）

- **【A】** 依 `documents/decisions.md` D164 與 `0-設計規格書.md` §7.10：**建立項目**（5.1.2.1 F6）縮圖／直式海報／橫式橫幅／圖庫 4 格併為**主視覺（Key visual）＋圖庫** 2 格，兩者皆必填。
- **【A】** **建立活動**（5.1.6.1 F4）4 格併為**主視覺＋橫幅＋圖庫** 3 格，必填數由 4 降為 3；橫幅維持 `--16x9`／1920×1080（唯一未併入的格）。
- **【A】** **編輯活動**（5.1.6.2 F4）具名槽同步收斂為 2 格＋圖庫列，計數文案 n/4→n/3。
- **【A】** **項目詳情**（5.1.2.2 §2.2.2）展示內容文案改為「第一張為主視覺、其餘為圖庫」，取代原本列舉縮圖／海報／橫幅／相簿四種角色的敘述。
- **【D】** `js/events-store.js` 資料模型：具名欄位 `thumb`＋`poster` 併為單一 `keyvisual`（11 筆資料同步）。
- **【D】** i18n（`js/i18n.js`）新增 `cpp.s2.both-req`／`cpp.s2.keyvisual(-size)`／`ce.img.keyvisual(-hint)`；退場 `cpp.s2.four-req`／`thumb`／`poster`／`banner` 系列與 `ce.img.thumb`／`poster` 系列；另清掉三個原本就零消費的孤兒 key。
- **【D】** `design-system.md`／`design-system.html` 的 upload-tile 章節（§4.15）demo 改為兩種組合展示（建立項目 2 格／建立活動 3 格），Class API 補上 D164 槽位組合說明。
- **【E】** `create-campaign` 的「海報／橫幅」兩個具名槽仍在直式格子裡、D164 影響清單未涵蓋募資建立流程——記入 `ASSUMPTIONS.md` 新產品缺口。

## 2026-07-31（第十二批）· 顯示端縮圖／卡片封面改直式；活動保留橫式橫幅為唯一例外（A 規格落地）

- **【A】** 使用者裁決（Q39 顯示端續作）：全站清單縮圖與卡片封面比例統一改讀 Foundation token `--img-portrait`（750/930），不再各自方形／橫式裁切。受影響 7 支顯示元件（fan-store 內含兩個框）：`.product-list__image`（76×76→76×94）、`.project-list__image`（76×76→76×94，同推導）、`.project-card__cover`（16:9→直式，280px 欄寬約長 347px）、`.preview-card__media`（4:3→直式）、`.fan-store__featured-media`（4:3→直式）、`.fan-store__thumb`（1:1→直式）、`.ztor-table__thumb`（40×40→32×40，鎖高算寬）、`.admin-table__thumb`（36×36→29×36，鎖高算寬）。全部由同一張直式原圖 `object-fit: cover` 置中裁切填滿，不另備方形或橫式素材。
- **【A】** 例外維持：`.product-list--events .product-list__image` 仍是 `1:1`（活動列表方形版位不變）；`.product-list__thumb`（取貨頁 QR 圖示）、頭像、logo、`.fc-ref__thumb`、`.vault-tile` 皆非展示圖框，維持原樣不動。
- **【A】** 活動（Events）保留橫式橫幅：`--16x9` 從墓碑復活，唯一服務活動的橫式橫幅圖片槽（`create-event`／`edit-event`，1920×1080）；`upload-tile.css` 的 `--16x9` 墓碑註解同步改為「服役中」，服役範圍由「僅檔案槽」擴大為「檔案槽＋活動橫幅圖片槽」。
- **【D】** Foundation token `--img-portrait` 從 `shared.css` 的 `:root` 搬進 `ds-components/_tokens.css`（本輪文件同步順帶修正）：Foundation 級變數應住在 Pillar 1 的來源檔，放在 `shared.css` 會讓 `check_ds_sync` 檢查 9 的 token 文件化稽核抓不到，也違反 Foundation ← Role ← Component 依賴契約；`shared.css` 留墓碑註解指向新位置，全站頁面各自 `<link>` 載入 `_tokens.css`（排在 `shared.css` 之前）不受影響，無需改任何 `<link>`。
- **【D】** `design-system.md`／`design-system.html` 同步：Pillar 1 新增 `--img-portrait` Foundation 條目；Pillar 4 七支顯示元件的比例描述改為直式並註明活動與 QR 兩個例外；upload-tile 章節（§4.15）契約表同步新來源。
- **【E】** 顯示框比例仍與新直式標準（0.806）不同、尚未收斂的殘留：IP 卡（Q30）與 IP hero 顯示框（Q31，`.ip-hero__cover` 3:4）、`.pd-hero__cover`（商品詳情 hero，2:3）——已記入 `STYLE-DECISIONS.md` 待裁決，不擅自選邊。

## 2026-07-31 · 全站圖片上傳槽比例收斂為單一直式 750×930（A 規格裁決 ＋ D infra）

- **【A】** 使用者裁決：全站「上傳圖片」槽一律改用單一直式 750×930（`--upload-img-ratio`，`ds-components/upload-tile.css:31`），取代原本縮圖 1:1／直式海報 3:4／橫幅 16:9／相簿 3:2 四套並存的比例模型。10 個產品頁（create-project／create-product／create-event／edit-event／create-auction／create-bundle／bundle-detail／product-detail／create-campaign／project-detail）改用新比例，另加測試版路由 `funding-test/create-campaign.html`（devtools 版本切換會走到，一併收斂）；`--1x1`／`--3x4`／`--3x2` 三個形狀修飾詞自圖片槽退場、CSS 宣告已刪除（`--16x9` 仍服役於 project-detail 的 Demo 影片／音樂**檔案**槽，非圖片槽，不受影響）。
- **【D】** `ds-components/bundle-editor.css:28-30` 移除 `.fc-item-row .upload-tile` 的 `aspect-ratio: 1/1` 覆寫（會蓋掉元件比例）。頁面上寫死尺寸的說明文案（800×800、1920×1080、1:1、16:9 等）改成直式敘述，中英雙語同步（`js/i18n.js` 新增 `cp.media.portrait`）。顯示端（清單縮圖、`.project-card__cover-img`、`.ipm-card__cover-img`、`.ip-hero__cover-img` 等）不動，靠既有 `object-fit: cover` 從直式原圖置中裁切填滿。
- **【D】** `design-system.html`／`design-system.md` 的 upload-tile 章節同步（示範卡改 `--750x930`、契約表補 `--upload-img-ratio`／`__flag`／`data-upload-src`／`data-upload-key`／`upload:change`／鍵盤契約）。
- **【E】** 這是使用者裁決、非上游規格變更；`documents/`（5.1.5.2／5.1.5.10／5.1.6.1／5.1.2.1 等）仍寫多比例規格，尚未同步。已記入 `ASSUMPTIONS.md` 新增的產品變更提案與產品缺口（詳見 IMG-001、PG-023）。

## 2026-07-30 · 圖片上傳槽 hover 動作統一到共用元件，補齊六頁漏載＋鍵盤可及性（D infra ＋ B 反饋）

- **【D】** 圖片上傳槽的 hover 動作列收斂成單一產生路徑 `partials/upload-tile.js`；`project-detail.html`／`product-detail.html`（含內嵌的第二份）手刻的 hover 版本全部移除。動作列顯示條件由 `[data-upload]` 放寬為 `.is-filled`，手刻與 JS 產生兩種來源行為一致。
- **【D】** 標準收斂為**替換／刪除 2 鈕**；AI 優化改 `data-upload-ai` opt-in 第三鈕，目前只有 create-product 的商品圖槽開啟。i18n 正典收斂為 `cp.media.replace`／`cp.media.remove`／`cp.media.optimize`／`cp.media.optimized`；`project-detail.showcase.replace`／`.delete` 退場。
- **【B】** 補齊六頁原本漏掉的 hover 動作：`bundle-detail`（原本漏載 `upload-tile.js`＝bug）、`create-bundle`、`create-auction`、`create-campaign`、`create-event`、`create-project`。
- **【B】** 新增 `.upload-tile__flag`（封面標籤，由 `shared.css` 的 `.pd-gallery__badge` 搬入元件層）；`shared.css` 該段只留 `#pd-gallery` 版面規則＋墓碑註解。
- **【B】** 鍵盤可及性：可觸發的空狀態格加 `role="button"`＋`tabindex="0"`，Enter／Space 等效點擊（Space 不捲頁）；填圖後自動撤掉 role／tabindex；動作鈕在 `:focus-within` 時動作列顯示；焦點環用既有 `outline: 2px solid var(--ring)`；刪除／上傳完成／AI 完成後把焦點交還（僅鍵盤路徑）。
- **【D】** 新增元件事件契約：`data-upload-src`（起始圖）、`data-upload-key`、`upload:change` 事件（`detail:{key,filled}`）。

## 2026-07-31（第十批）· 新增 IP Entry：撤掉頂列「儲存」鈕，離開彈窗一律走純離開版（C 撤除 ＋ B 反饋）

- **【C】** `admin-ip-bank-entry.html` 移除頂列右側整個 `.wizard__top-actions`（內含 `.wizard__save-status--button` 手動儲存鈕）。動機：這頁不自動儲存（`data-autosave="false"`），底部主鈕「儲存 IP Entry」才是真正建立 entry 並回父頁 F3 的動作；頂列那顆點下去只有 700ms 的「儲存中…」示意、什麼都沒送出，兩顆同名按鈕擺在同一頁只會讓人以為存過了。**只動這一頁**，其他 wizard 頁的儲存狀態不受影響。
- **【B】** 同頁的返回離開彈窗改成永遠是純離開版（「要離開這一頁嗎？／你隨時可以再回來。／離開」），不再因為動過欄位就跳「要先儲存再離開嗎？／儲存並離開／不儲存就離開」。動機：頂列的儲存入口撤掉之後，彈窗已經沒有可觸發的儲存機制，「儲存並離開」會變成問了也做不到的選項。
- **【D】** 做法是在共用的 `partials/wizard-chrome.js` 加一個 opt-in 開關 `.wizard[data-leave-simple]`，掛上就強制走 clean 態；不掛的頁行為完全不變（沒有動到其他 6 支建立頁）。`design-system.md`／`design-system.html` 的 Leave dialog 條目同步這個開關。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第十批）· 列表表頭一律不畫下框線（10 支元件）＋ media cell 縮圖放大（B 反饋／使用者裁決，STYLE-DECISIONS Q41）

使用者先要求「做一個整頁的 demo 把這條底線拿掉我看看效果」——建了 `e-shop.html` 的複本探索頁（唯一差異是 `.product-list__head { border-bottom: 0 }`），看過後裁示全面套用。探索頁已刪除。

- **【B】** **10 支元件的欄位表頭移除 `border-bottom`**：`.product-list__head`（e-shop）、`.project-list__head`（projects）、`.ztor-table thead th`（全站資料表）、`.table-head`（sortable，brand-campaigns／fans-crm）、`.restock-table__head`、`.variant-table__head`、`.restock-log__head`、`.bmx__head`（tier-benefits）、`.msg-history__head`（fans-crm）、`.notif-matrix__corner`／`__chead`（settings）。分隔改由表頭與內容之間的留白承擔，**每一列自己的分隔線不動**。其中四支原本表頭帶 `--muted` 底色的（restock-table／variant-table／restock-log／notif-matrix）**底色保留**，由它繼續承擔分隔。<br>**刻意不在範圍內**：面板／彈窗／卡片／群組的「標題列」——`.drawer__head`、`.detail-sheet__head`、`.payout-dialog__head`、`.embed-modal__head`、`.preview-panel__head`、`.chart-card__head`、`.vault-group__head`、`.app-notif__head`、`.header`。那是標題與內容的結構分隔，不是欄位標籤列，拿掉是另一個題目。<br>驗收：projects／settings／fans-crm／product-detail／tier-benefits／earnings 六頁實測 computed `border-bottom-width` 皆 0px、列分隔線仍 1px。裁決記於 **STYLE-DECISIONS Q41**（同時吸收同日稍早「`.ztor-table` 表頭去底色」那次裁決——當時分隔還留給 border，這次連 border 也去掉）。
- **【B】** *（同日追加）* 使用者：「所有表頭的字的顏色也都要改成這樣」——指 `.ztor-table thead th` 那階更暗的灰。查下去發現同一個角色站上跑了**三種**配方：裸 `--muted-foreground`（7 支）、`color-mix(--muted-foreground 68%, --card)`（`.product-list--eshop` 的覆寫）、`color-mix(--muted-foreground 72%, transparent)`（ztor-table），正是 Q9 要收斂的「散落的即席灰」。<br>因此收成新 token **`--column-head-ink`**（`_tokens.css`，＝ `--muted-foreground` 降到 72% 不透明度），11 處表頭一律寫 `var(--column-head-ink)`；`.product-list--eshop` 的 68% 覆寫整條刪除，`.restock-table__head` 原本沒指定文字色（繼承彈窗內文），這次明確給上 token。混 `transparent` 而非 `--card` 的理由：四支帶 `--muted` 底色的表頭要跟其餘同一階暗度，混 `--card` 會把卡片色烤進墨色裡、換個底就走鐘。**字級不動**——`--fs-11`／`--fs-12` 兩階留著，使用者這次只點名顏色。
- **【D】** `design-system.md`／`design-system.html` 的 Table 條目同步改寫（原本寫「分隔仍由下方 border 承擔」已不成立），並各補一段 `--column-head-ink` 的 token 說明（check 9 要求 `_tokens.css` 的每支 token 兩份文件都要有）。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第九批）· 儀表板三張表：假資料補滿 ＋ 一律單行截斷 ＋ 第二行改複合名詞（B 反饋／使用者裁決）

- **【B】** **假資料補滿**：三張表原本各只有 4–5 列，卡片下半是空的（近期收入與「今日待處理」並排，被對方的高度撐出一大塊留白）。近期收入 5 → 8 列（新增 WYAGL 連帽衫、REALIVE 特仕版 CD、FLAMES MV 廣告分潤；F3 只放已結算收入的規則不變）、最近動態 4 → 7 列、近期活動與項目 4 → 6 列。新列的商品圖沿用既有素材、圖文對得上（FLAMES MV 那列原本配 `nick-realive.jpg`，縮圖與上一列的 CD 幾乎一樣，改配 `nick-flames.jpg`）。
- **【B】** **一律單行、超出點點點**：新增 modifier `.ztor-table--truncate`（`ds-components/table.css`），掛在儀表板這三張表上。做法是名稱欄 `.ztor-table__namecell` 用 `max-width: 0` ＋ `width: 100%`——在 `table-layout: auto` 下這一格會吃掉其他欄取完自然寬度後剩餘的空間，內容超過就被 ellipsis 收掉，而不是把整張表撐寬去觸發橫向捲動。**不用 `table-layout: fixed`**：那會一併改掉站上所有 `.ztor-table` 的欄寬演算法（收益總帳這類長表靠的正是自然寬度），作成 modifier 才只影響掛上它的表。實測 700px 視窗下最大行數 1、三張表溢出皆 0。
- **【B】** **第二行改複合名詞**（使用者中途裁示，先做成「項目 · 預購」再改）：活動與項目改成 `預購項目`／`共創項目`／`實體活動`／`線上活動`／`上線項目`，子類型同時從標題裡拿掉（標題只留作品名）；收入的來源同步改成 `串流版稅`／`電子商店銷售`／`故事世界授權`／`IP 授權版稅`／`活動票券`／`預購銷售`／`影音廣告版稅`。最近動態那一行的兩段是「模組 · 日期」不是分類配對，維持原樣。
- **【D】** F2「進行中項目」的彈窗清單原本只濾掉草稿，補進已成立／已結束的新列後數字會對不上 KPI；改成濾掉所有終態（草稿／已成立／已結束／已取消），KPI 隨之 3 → 4。順手把該 KPI 的輔助行從舊術語「上線 · 募資 · 排程中」改成「進行中 · 共創 · 準備中」。
- **【B】** *（同日修正）* 使用者圈出縮圖說「圖片左右空隙太大」。原因是我把縮圖**另開一欄**，於是 32px 的圖兩側各吃一次儲存格內距（20px），落在 72px 的空欄正中間。站上既有的答案是 `.ztor-table__media`——縮圖與名稱**同一格**的 flex 內層包裝、間距只有 `--sp-10`，表頭用 `.ztor-table__media-head` 把標籤推過縮圖、欄名仍對齊名稱。三張表改用該 pattern（縮圖欄取消，欄數各少一），圖文間距 20px → 10px，名稱欄多拿回 42px 寬（最近動態的「NICKTHEREAL 肖像續約」因此不再被截斷）。新增伴生類 `.ztor-table__mediatext`（兩行文字的包裝；flex item 預設 `min-width:auto` 不會縮，不歸零 ellipsis 永遠不觸發）。
- **【B】** *（同日再調）* 使用者：「間距大一點點，然後圖也可以大一點點」。縮圖 **32 → 40px**、間距 `--sp-10 → --sp-12`。40px 剛好等於資料列的內容高（列高 72 － 上下 `--sp-16`），所以縮圖與整列等高、列高幾乎不變（72 → 73px）；沒有 36px 的間距 token，取上一階 `--sp-40` 而不寫死數值。**這條覆蓋 2026-07-26「縮圖再小一階（36→32）」的裁決**，圓角維持 `--radius`。改在元件層，`earnings-sony.html` 那張同樣用 media cell 的表一起生效（已驗：縮圖 40px、表頭仍對齊名稱、無溢出）——同一個視覺角色不留兩種尺寸。順帶把 `.ztor-table__media` 內的圖示晶片退路（`.data-list__icon`，本體 52px）對齊到 40px，只在 media cell 情境，STYLE-DECISIONS Q20 規範的清單列不受影響。
- **【D】** `design-system.md`／`design-system.html` 同步 `.ztor-table--truncate`、`.ztor-table__mediatext` 條目，並把「縮圖不要自成一欄」寫進 Table 說明；`js/i18n.js` 補 20 組新 key。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第八批）· 修掉 tabs 元件的底線 bug（全站 17 支頁面受益）＋版稅來源收進 popup ＋ Sony 佣金提示改通知條（D infra ＋ B 反饋）

使用者問「為什麼這個會改壞兩次，這個 tab 不是元件嗎」。是元件，而且**壞的就是元件本身**——不是我套用的方式。根因與修法記在這裡，避免第三次。

- **【D】** **`ds-components/tabs.css` 的 `button.tabs__item { border: 0 }` 是 bug 的根源。** `.tabs__item` 的 `border-bottom: 2px solid transparent` 是整套底線的**基座**：經典變體直接把它染成 `--primary`，`--underline-short`／`--underline-label` 變體則靠它撐出 item 高度、讓 `::after` 的 `-12px` 落在分頁／卡片底緣。那條 `border: 0` 把基座一起清掉，於是——<br>(1) 全站 **17 支用 `<button>` 寫的分頁**，active 的橘色底線一律畫不出來（`event-detail`／`project-detail`／`fans-crm`／`product-detail`／`ip-detail`／`manage-ip`／`scanner`／`store-settings`… 都在內）；<br>(2) 底線變體還會因為少了那 2px、`::after` 多掉出去 2px，被 `.tabs` 的 `overflow-y:auto` 裁掉——這正是這兩輪「線不見了」的直接原因。<br>**同一個元件，`<div>` 版正常、`<button>` 版壞掉**，這是元件缺陷，不是消費頁的問題。改成只清上／右／左三邊、底邊完全交還給 `.tabs__item` 與 `--active` 兩條規則。<br>**`border: 0` 不能只換成重寫 `border-bottom`**：這條規則排在 `.tabs__item--active` 之後、specificity 又更高（0,1,1 vs 0,1,0），只要它碰到 border-bottom 的**顏色**，active 的橘色就會被蓋掉（實作中已踩到並修正）。<br>**影響範圍**：那 17 支頁面的 active 分頁**恢復**橘色底線（元件檔頭本來就寫「orange active accent」，是壞掉不是沒設計），item 高度 +2px。這是修 bug 不是改風格，故直接執行並記錄。
- **【B】** 版稅的「依來源拆解」四列從常駐區收起來，改成一行摘要 ＋「**查看來源**」開 popup（`earnings.html` 沿用既有的 `data-bd-open`／`data-bd-modal` 開關；`earnings-sony.html` 沿用 `data-drawer-open`／`data-modal`）——兩頁都**沒有新增 JS**，用的是頁上原本就有的彈窗機制與 `.payout-modal`／`.payout-dialog` 殼。動機：那四列把整個版稅分頁推得很長，但它是「想確認才看」的資料，不是進頁就要讀的。
- **【B】** `earnings-sony.html` 的品味推薦人佣金提示，由頁內 `.info-banner--dismissible`（位置在 KPI 下方）改成 **e-shop 低庫存通知條同一組元件與位置**：`.alert-inset`（外層只管定位，sticky、跟 `.page` 同一套 max-width＋margin＋padding）＋ `.alert.alert--bar.alert--inset-card`（內層視覺卡），掛在 `<main>` 內、`<div class="page">` 之前。可關閉行為沿用 `data-dismiss-key="fin-ratio"`（`finance-overview.js` 的 sessionStorage 機制），不變。
- **【B】** *（同批追加）* 版稅分頁的三顆操作——**查看來源｜匯出報表｜補登版稅報表**——從卡片內搬到**工作列右側**（`.list-toolbar__actions`，比照 e-shop 的「建立商品」位置），只有選到「版稅」分頁時才出現：`activate()` 加一行 `document.querySelectorAll('[data-tab-actions]')` 顯隱，兩頁各一行、無新元件。動機是使用者指的「按鈕該在這裡」——跟著分頁走的操作屬工作列，散在卡片內會讓同一張卡同時承載資料與行動。卡片因此只剩期間切換（資料控制）＋大數字＋說明＋一行摘要，短很多。
- **【D】** *（同日修正 ×2）* 動作群搬進工作列後又踩到兩個坑，都在元件層收掉：<br>**(a) `hidden` 屬性失效**——`.list-toolbar__actions` 自己宣告了 `display:flex`，權重蓋過 UA 的 `[hidden]{display:none}`，於是 `el.hidden = true` 設得下去、畫面上照樣顯示（使用者一眼看出來，我第一次只信了 JS 回報值沒對畫面）。元件補 `.list-toolbar__actions[hidden] { display: none; }`，並寫進 `design-system.md`。**這與同批 tabs 那個 bug 是同一類**：元件宣告了 `display` 就會默默弄壞 `hidden` 屬性，之後任何要顯隱的動作群都會中。<br>**(b) 按鈕尺寸違反已記錄的規則**——三顆一開始掛了 `btn--sm`，但 `design-system.md` §4.90 明寫「右側主 CTA 一律用 `.btn.btn--primary` 基礎尺寸（36px／13px），不要加 `btn--sm`」（2026-07-26 為此修齊過 projects）。已改回基礎尺寸，實測三顆都是 36px／13px。
- **【C】+【A】** *（同日裁決）* **「依串流／下載次數」榜自收入管理搬到粉絲分析**。使用者問「這個是不是在粉絲分析就有了」，查證後粉絲分析其實沒有——它四張卡全在算「人」（影響力／分群／漏斗／商業價值分地區）。但使用者據此裁定：**收入管理·版稅分頁只講錢，次數屬表現分析**，整張搬過去。<br>連帶**各 section 標題不再重複「依版稅金額」**——這個分頁底下的資料都是版稅金額，每張卡各標一次是冗詞。「Top 10 表現最佳作品 · 依版稅金額」→「Top 10 表現最佳作品」，「地區表現 · 依版稅金額」→「地區表現」，「串流平台表現 · 依版稅金額」→「串流平台表現」。版稅榜因此獨佔整排（`bento--span-12`），popup 也拿掉次數欄。<br>粉絲分析那張卡沿用 `roy.work1–11` 與 `roy.type.*`（同一批作品、同一份 persona 覆蓋、同一組類型定義），不另建一套。<br>**⚠ 與 D162 的單位界線相牴觸**：D162 寫明「粉絲分析本頁算『人』（去重後人數），儀表板／項目詳情的表現卡算『次數』」。把次數榜放進粉絲分析等於在該頁引入第二種單位。依權威鏈第 1 條（使用者當次明確指示）執行，並在卡上用膠囊「單位是次數，不是人」＋註腳「與上方以『人』為單位的數字分開計算、不可互比」把界線寫在畫面上。**D162 的敘述需回寫**，記入 ASSUMPTIONS ESP-008。
- **【D】** *（同日查證）* 使用者問的重複另有其人：**`project-detail.html` 早就有一個版稅分頁**（`data-panel="royalty"`，CCR-006 提案），含總版稅、地區表現、平台表現，**地區清單與收入管理這邊完全相同**。使用者裁定兩者定位為**單一項目 vs 全部作品彙總**，各自成立、不合併。目前兩層未互相連結（作品榜點列還沒導向該項目的版稅分頁），記入 ESP-008 待處理。
- **【A】** *（同日）* **兩張作品榜改 Top 10 ＋ 類型篩選 ＋「查看全部」popup**，依使用者指示。<br>**作品由 7 部擴到 11 部**，兩個 persona 都取自 `projects-store.js` 的真實作品、不虛構：default 補《我要衝線》《海上霸姬 第二季》《海上霸姬 幕後紀錄》《低俗喜劇之嗨仔番外篇》，nick 補《REALIVE》《FLAMES》《罵醒我 (Reimagined)》《LOVE RAGE HOPE 黑膠典藏版》。<br>**類型篩選（全部／音樂／影片）**依 `projects-store` 的 `cat` 分：`song`／`album`＝音樂，`mv`／`movie`／`short`／`series`／`document`＝影片；`merch`／`event` 整批不列（周邊不產生版稅、活動走票務）。因為兩個 persona 的作品組成不同，類型陣列也分兩份存。<br>**兩張榜改由 JS 依資料重畫**（原本是寫死的 7 列）：篩選、期間切換、語言切換都會重畫，排序、名次、長條比例、`顯示 N 部，共 M 部` 一起更新。<br>**popup ＝全部作品表**：一次給兩個軸（版稅金額＋串流下載次數）與類型欄，同一組篩選也在裡面。它的價值不只是「多一列」——卡片是單軸 Top 10，popup 是全作品雙軸對照。<br>**帳仍然對得起來**：11 部作品的版稅由當期總額用最大餘數法分配，所以 popup 的全部加總＝總版稅（USD 4,520／NTD 6,480 都驗過）；卡片上的 Top 10 是子集、本來就不等於總額，popup 副標寫明「本期共 11 部作品」把範圍講清楚。
- **【D】** *（同日）* 兩張榜的**類型篩選移到標題下方自成一列**：span-6 的寬度放不下「長標題＋三顆 chip」同一行，chips 會被擠成兩行。標題保持完整、篩選獨立一列，任何寬度都不會壞。
- **【D】** *（同日修正）* **版稅榜的作品名沒跟著 persona 走**——使用者指出「現在選的是周湯豪，但有其他不相干的資料出現」。原因是我建版稅榜時直接從 `js/projects-store.js` grep 作品名，抓到的是 **`PROJECTS_DEFAULT`（Maya Chou 世界觀，港片片名）**那一組，且寫死進 HTML。切到 nick persona 時，整站其他地方都換成周湯豪的內容，只有這兩張榜還掛著《深水埗的月光》《龍虎門外傳》。<br>修法照站上既有機制（`js/i18n.js:1223` 已寫明「earnings／events／fans 原本寫死在 HTML 的名字 data-i18n 化，default 值留 DICT、周湯豪版放 `PERSONA_DICT.nick`」）：14 個作品名（金額榜 7＋次數榜 7，同 7 部作品兩種排序）改掛 `roy.work1`–`roy.work7`，DICT 放 default 的港片名、`PERSONA_DICT.nick` 放周湯豪的真實作品（LOVE RAGE HOPE／REAL LIFE／帥到分手／罵醒我／愛上你算我賤／什麼都不必說／帥到分手 MV，取自 `PROJECTS_NICK`）。兩個 persona 與 Sony 版都實測過。<br>**教訓**：這個原型的假資料是分 persona 的，新做的區塊只要出現「作品／商品／人名」，就得走 persona 覆蓋層，不能直接 grep 一份資料檔寫死。
- **【A】** *（同日）* **期間切換接上真資料**——使用者回報「這個切換，資料沒變動」。原本月／季／年／自訂區間只是靜態控制項，點了什麼都不會發生。現在四個期間各有一份完整資料（總版稅、依來源四列、作品／地區／平台三張榜、串流下載次數），點哪個就整頁換過去。<br>**帳不會被切散**：各期數字用**最大餘數法**由該期總額分配，所以四張表的加總都精準等於該期總版稅（USD／NTD 兩份都驗過）。百分比刻意不動——量在變、組成不變，這才是版稅隨期間變化的實際樣子。NTD 那份的權重另存一套：拿 USD 權重回推會把已驗收的 2,640 算成 2,638，等於偷偷改掉對過的帳。
- **【B】** *（同日）* **「查看來源」自工具列搬進卡片**，改成右下角的無框按鈕（`btn--ghost btn--lg`，44px／14px，含 `arrow-right` 箭頭）。**新增 icon**：registry 原本只有 `arrow-left`，依使用者指定「要有尾巴的箭頭」補上鏡像的 `arrow-right`（Tabler 同一套網格）。分工寫進註解：`chevron-right` 是「進下一層」，帶尾巴的箭頭才是「往前一步／就地展開」。順手校正 DS 文件的 registry 顆數——`design-system.md`／`.html` 都寫「策展 111 顆」，實際在我加之前就已經 117 顆，現為 118，兩份同步更新，依使用者截圖指示。工具列只留匯出報表與補登版稅報表兩顆。理由：查看來源是「就地展開這張卡的細節」，不是跟著分頁走的操作，放工具列會跟另外兩顆搶同一種份量。
- **【D】** *（同日踩坑）* meta 那行一度在中文介面顯示英文——JS 裡用 `document.documentElement.lang === 'zh'` 判斷語言，但實際值是 **`zh-Hant`**。改成不自己判斷語言：四個期間各給一個 i18n 鍵（`roy.meta.*`），切期間時只換 `data-i18n` 再呼叫 `window.applyI18n`，語言切換沿用既有機制。頁面不該自己複製一份語言判斷邏輯。<br>*同源的第二個坑*：這顆按鈕的箭頭一度也不見了——`data-i18n` 掛在 `<button>` 上，而 i18n 是寫 `textContent`，會把 icon 子元素一起清掉。改用站上既有寫法（Sony 頁「提領歷史」同款）：標籤包 `<span data-i18n>`、icon 當兄弟節點。**凡是按鈕內含 icon，`data-i18n` 就不能掛在按鈕本身**。
- **【C】** *（同日）* 版稅卡瘦身兩項，依使用者指示：<br>**摘要句「本期有四個來源，兩個可在 Ztor 結算、兩個不行」整條撤除**——它本來是用來介紹下面那張來源列表的，列表收進 popup、按鈕搬去工作列之後，它就成了一句沒有對象的旁白。`roy.src.summary` i18n key 一併刪除。<br>**資料時效橫幅撤出卡片，但事實不丟**：使用者問這條是否也不用出現。判斷是「橫幅可以不要，資訊不能不要」——版稅數字晚一季這件事，是「這個金額能不能拿來做決定」的前提，§7.3 也要求財務數字要能辨識狀態與是否已驗證。所以拆成兩處安置：截止日併進大數字下面那行 meta（`roy.total-meta2`，那行本來就在講期間與範圍），完整說明（發行商定期提供／部分延遲一季／與 Ztor 銷售分開計算）移進「查看來源」popup 末尾——會去翻來源的人，正是需要知道口徑的人。<br>結果是卡片只剩：標題＋期間切換＋大數字＋一行 meta，高度大約砍掉一半。
- **【B】** *（同日）* Deck for Sony 版的頁名由「**財務總覽**／Finance overview」改為「**收入管理**／Earnings」（`fin.crumb`／`fin.h1` ＋ 該頁 `<title>`），與導覽項目 `nav.earnings` 一致——同一個目的地在導覽叫一個名字、進去之後叫另一個名字，是版本切換後最容易讓人以為走錯頁的地方。
- **【D】** `js/i18n.js` 補 `roy.src.summary`／`roy.src.view`／`roy.src.modal-title`／`roy.src.modal-sub`。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第七批）· Deck for Sony 版加上「總覽／版稅」兩個分頁；earnings 家族 tab 改底線式（B 反饋／使用者裁決 ＋ A spec）

- **【B】** 分頁樣式改用使用者圈選的那組——e-shop 工作列的 `tabs tabs--underline-short tabs--underline-label`（短橘底線、只跟標籤等寬）。套用範圍限 **earnings 家族兩支**：`earnings.html` 七顆、`earnings-sony.html` 兩顆。<br>兩件實作細節：`tabs--count-plain` **沒掛**——它只作用在 `.tabs__item-count`，這兩處沒有計數，掛了是無作用的 class；`tabs--underline-label` 要求標籤包在子元素裡（底線掛在 `:first-child` 的 `::after`），所以 earnings.html 原本把 `data-i18n` 直接放在 `<button>` 上的七顆全部改成包一層 `<span>`。<br>**未掃齊**：站上另有 8 支頁面（event-detail／fans-crm／ip-detail／pickup-detail／fan-detail／project-detail／scanner／store-settings）的頁面分節 tabs 仍是純 `.tabs`，跟 earnings 是同一個視覺角色。照風格單一答案原則應該一起改，但那是 8 頁批次、且本輪使用者只指到 earnings，已記為 **STYLE-DECISIONS Q38（部分執行）** 等裁決，不擅自掃。
- **【A】** `earnings-sony.html` 加上分頁：**總覽｜版稅**兩顆（使用者指定只要這兩個）。原本整頁攤平的內容（類型 chip 圖例＋收益走勢圖＋我的項目表）包進 `data-panel="overview"`，版稅區塊整段自 `earnings.html` 搬過來當第二個 panel。切換 JS 與 `earnings.html` 同一段邏輯（含 hash deep-link），寫在頁內。
- **【A】** 版稅金額換算成 Sony 版的 **NTD 口徑**——那頁全頁用 NTD，混 US$ 在簡報裡會很刺眼。總版稅 NTD 6,480（發行商報表 2,280／Ztor IP 版稅 2,640／Ztor 授權 1,080／KKBOX 補登 480，四項相加對得上），作品、地區、平台三張榜依同一比例換算、百分比不變、三張榜各自加總仍等於 6,480。串流／下載次數不是金額，維持原值。
- **【B】** *（同日修正）* 只加 class 不夠——使用者比對後指出樣式仍不對。原因是這組底線式 tab 的 `::after` 是 `bottom:-12px`，設計上**要落在 58px 高工作列卡的底緣**（`list-toolbar.css` 檔頭寫明：固定高＋`align-items:stretch`，tab 撐滿才貼得到卡底）。只掛 class 時 `.tabs__item` 只有 39px 高，底線就浮在文字下方 10px 的空中。修法是把兩頁的分頁列包進同一個 `.list-toolbar` 殼（＋引 `list-toolbar.css`），零新 CSS，量到的幾何與 e-shop 完全一致：卡高 58px、標籤 span 38px、底線上緣與卡底緣差 0px、圓角 16px。
- **【D】** `earnings-sony.html` 補引 `tabs.css`／`perf-rank.css`／`data-list.css`／`badge.css`（原本沒用到這四支），頁面 `<style>` 補與 `earnings.html` 同一份的 `.roy-*` 一次性版面——兩頁是同一頁的兩個版本，樣式必須同源。check_ds_sync PASS、棘輪未升。

## 2026-07-31（第六批）· 拆頁併回單頁：版稅改當一個分頁，不用全頁 filter（B 反饋／使用者裁決 ＋ C 撤除）

使用者問「收入總覽和 Ztor 收入可以合併對嗎，用 filter 分開」。合併是對的，**但不能用全頁 filter**——filter 的前提是每個值對每個視圖都成立，這裡不成立：站外 × 項目收益、站外 × 提款、站外 × 稅務文件三格是空的（那三個分頁根本沒有站外版本），切過去會有三個分頁變空白。而且提款、稅務下載是動錢的操作，主要行動不該隨 filter 狀態出現又消失。所以改用分頁分開，filter 只用在「兩邊都有內容」的地方。

- **【C】** 撤除導覽群組：`js/sidebar.js` 的 Earnings 改回平鋪單頁，`js/devtools.js` 的 Deck for Sony 改接退回一條（`route:earnings.html=earnings-sony.html`）。第四批新增的四個 `nav.earnings-*` i18n key 留著沒刪（無害，之後若確定不回頭再清）。拆頁版 `earnings-overview.html`／`earnings-ztor.html` **暫留磁碟供比對、不掛導覽**，定案後再決定刪或留。
- **【A】** `earnings.html` 新增「版稅」分頁（`data-panel="royalty"`，排在總覽之後），內容整段搬自拆頁版：總版稅＋期間切換＋資料截至說明＋依來源拆解四列＋補登入口，加上作品 Top（依版稅金額／依串流下載次數並排）、地區表現、串流平台表現。另補空狀態（`when-empty`：還沒有版稅報表，帶補登 CTA），與其他分頁一致由 Cheat Codes 的 Empty 切換。
- **【B】** KPI 四張改成「範圍看得懂」的一組：**總收入 $26,760（hero）｜Ztor 收入 $24,830｜站外版稅 $1,930｜可提領 $8,940**，前三張互斥可加總。這一列本身就回答了使用者最初的疑問（「這頁是不是只有 ztor 的收入」），不需要用兩個頁面來講。<br>被擠掉的兩張各有去處：**淨利**搬進「項目收益」分頁——金流瀑布本來就在那，淨利是它的結果；**待結算 $3,210** 併進可提領卡的輔助行，讓「Pending ≠ Available」那條提示仍有依附對象。
- **【B】** 交易明細補一顆「站外版稅」篩選 chip（沿用既有的 chip 單選 JS），這是 filter 唯一站得住的位置之一。總覽分頁沒加範圍 filter：那裡的趨勢圖本來就只畫 Ztor，KPI 已把範圍講完，再加一層只是噪音。
- **【B】** 交易明細的「手動補登」鈕改成「補登版稅報表」並跳到版稅分頁——補登的既然只剩版稅報表，入口就該跟版稅在一起，不留在交易明細。
- **【D】** 收入趨勢標題改「收入趨勢 · Ztor」、圖腳註明只含 Ztor 收入、版稅是季報會晚一季到（沿用第五批的處理，指向改成「版稅分頁」）。`earnings.html` 補引 `perf-rank.css`、頁面 `<style>` 補 `.roy-*` 一次性版面。**已知不一致仍在**：趨勢圖圖例還有「平台／串流版稅」「OTT 版稅」兩條線，與註記相牴觸，等資料歸屬定案（ASSUMPTIONS ESP-004）再重畫。
- **未做**：「如何運作」仍是第 7 個分頁。原本提過可以收成頁尾連結回到 6 個，但那是獨立的取捨、且會動到既有內容，等使用者看過再決定。

## 2026-07-31（第五批）· 收入總覽改為「Ztor 收入＋版稅」，版稅區塊整組重做（B 反饋／使用者裁決 ＋ A spec）

第四批做完後使用者釐清了總覽的用途：**它是為了把各平台匯進來的版稅與 Ztor 上的版稅收在一起看**，而且**外部平台的商品販售不納入**。接著指向 cocreate 原型的提案版稅分頁（`my-cocreate-proposal.html?tab=royalty`），點名要總版稅、Top 10 依版稅金額、地區表現依版稅金額這幾組資料。

那一頁推翻了第四批的一個核心假設：**版稅不是各平台各自接 API 同步，是發行商定期報表**（頁上明寫「部分來源約延遲一季」）。所以「串流平台表現」那張 Spotify／YouTube／KKBOX 是報表內的平台拆分，不是八條整合線。第四批做的「Spotify 已同步 2 小時前／StreetVoice 未連結 → 前往設定」整組是錯的模型，本輪移除。

- **【C】** 撤除「外部收入」區塊的平台連結狀態模型（已同步／未連結／前往設定），連同 `ext.*` 全部 i18n 字串。錯的原因見上；保留的只有列尾對齊用的 `.ext-row__end`。
- **【A】** 新增**版稅區塊**（`#royalties`），三層：<br>**總版稅 US$4,520**＋期間切換（月／季／年／自訂）＋匯出報表＋「資料截至 2026-06-30、部分來源延遲一季」的說明——講的是報表什麼時候到，不是平台連上了沒。<br>**依來源拆解**四列：發行商報表（站外）／Ztor IP 版稅（可結算）／Ztor 授權（可結算）／KKBOX Q3 補登（未驗證）。這是「合併成一個總版稅」之後把它拆回來，逐列 badge 標清楚哪些能提領。<br>**補登入口**改成「補登版稅報表」，範圍收窄成 Ztor 還沒串接的版稅來源。
- **【A】** 新增四張排行卡，用既有的 `perf-rank` 元件（它的檔頭註解本來就寫「參考稿＝共創提案 › 版稅頁」，等於是為這件事做的）：表現最佳作品·依版稅金額 ｜ 依串流／下載次數（兩張並排，照參考稿的雙欄；兩個軸要對照著看才有意義——賺最多的不一定是聽最多的）；地區表現、串流平台表現各佔整排。<br>作品名沿用 `js/projects-store.js` 的既有作品，讓版稅視角接得回站上真實物件。<br>兩張作品榜用 `perf-rank--nopct`（4 欄、無百分比），跟參考稿一致；地區與平台用 5 欄含 %。**踩到的坑**：`--nopct` 是容器修飾詞不是列修飾詞；且 5 欄版在 `bento--span-6` 的寬度下 `minmax(0,1fr)` 會被固定欄擠成 0px、長條整條消失——所以含 % 的兩張改整排。
- **【B】** KPI 第三張由「外部收入」改「**站外版稅**」，數字重算成互斥可加總：總收入 $26,760 ＝ Ztor 收入 $24,830 ＋ 站外版稅 $1,930。**總版稅（$4,520）刻意不上 KPI**——Ztor 的 IP 版稅與授權同時算在「Ztor 收入」裡，四張卡並排時使用者會以為能相加。合併放在版稅區塊自己做，KPI 那層維持「錢的歸屬」一種切法。理由寫進 ASSUMPTIONS ESP-002。
- **【B】** 收入趨勢圖標題改「收入趨勢 · Ztor」、圖腳補一句「只含 Ztor 上的收入，版稅是季報、會晚一季到」。理由：Ztor 收入即時、版稅延遲一季，畫同一張圖的話最近兩三個月的版稅一定是空的，看起來像收入崩掉。**已知不一致（未修）**：圖例仍有「平台／串流版稅」「OTT 版稅」兩條線，與註記相牴觸；那兩條的 SVG path 是手繪的，等資料歸屬定案（ESP-004）再一次處理。
- **【D】** 頁面 `<style>` 補 `.roy-total`／`.roy-foot` 兩組一次性版面（全走 token）；`earnings-overview.html` 補引 `ds-components/perf-rank.css`（earnings.html 原本沒引）。check_ds_sync PASS、棘輪未升。
- **【D】** ASSUMPTIONS 的 ESP 段整組改寫成 ESP-001～006，把「發行商報表 vs API 同步」「兩個切面不是兩個桶子」「時間軸對不上」「作品維度口徑」四個結構問題與各自的待上游項目寫清楚。

## 2026-07-31（第四批）· Earnings 拆成兩頁 demo：收入總覽（整合內外部）＋ Ztor 收入（結算層）（A spec ＋ D infra）

> **這是探索性原型，規格尚未回寫**。使用者要先看到畫面再決定要不要進 `documents/`。舊的單頁 `earnings.html` 原封不動保留、只從導覽移除，可直接輸入 URL 開，方便並排比對與回退。完整提案與待決見 `ASSUMPTIONS.md` 的 ESP-001～003。

起點是使用者的問題：「r2.2 的收入管理是不是只有 ztor 平台的收入？」查證結果是「不只」——§7.3 的收入分類第 8 類「平台／串流版稅」本來就是外部平台同步進來的，F10 手動補登也明寫是補外部收入。問題在於這兩種外部收入被塞進一個以「結算與提款」為主軸的頁面裡，所以規格得到處補「這筆不計入可提領／不計入稅務」的例外條款。拆頁要收掉的就是這個。

**分界線＝錢有沒有經過 Ztor**（不是資料從哪來）。經手的可結算、可提領、可拆費率、進稅務文件；沒經手的只記錄與統計。這一刀下去，例外條款變成頁面層級的一條規則。

- **【A】** 新增 `earnings-overview.html`（收入總覽）＝原 Overview 分頁升格成獨立頁。KPI 改「總收入·全部來源（hero 橘卡）｜Ztor 收入｜外部收入｜可提領」；hero 給總收入是因為這頁要回答的是「我總共賺多少」，可提領在這裡只是通往頁2 的指路牌。新增**外部收入區塊**（`#external`）：平台同步列（Spotify／YouTube，`badge--success`）、手動補登列（`badge--warning` 未驗證）、未連結列（`badge--neutral` ＋前往設定），末尾 info-banner 一句講白「只記錄、不結算」。手動補登入口從頁2 搬來這裡——補登的是外部收入，跟它的同類放在一起才找得到。
- **【A】** 新增 `earnings-ztor.html`（Ztor 收入）＝原其餘五個分頁，預設落在交易明細。KPI 首卡改稱「Ztor 總收入」點明口徑；可提領改 hero 卡——這頁的主要行動是提款，hero 跟著行動走，跟頁1 的 hero 邏輯是同一條（hero 標的是這一頁要做的事）。原本的「Manual entry」鈕改成連往頁1 `#external` 的「External & manual entry」。影評人佣金率提示（CCR-002）留在這頁：它是套用於淨收益的 Ztor 側費率，不屬全收入圖像。
- **【D】** `js/sidebar.js` 的 Earnings 由平鋪改為下拉群組，比照 Fans／E-Shop／IP Bank 的既有 `panel` 寫法，沒有多寫任何條件分支——`topbarNavHtml`／`sidebarNavHtml`／`isActive`／`applyVersionRoutes` 四段本來就吃 `it.panel`。`match` 收 `earnings.html` 與 `earnings-sony.html`，直達舊頁時群組仍會點亮。
- **【D】** `js/devtools.js` 的 Deck for Sony 版本規則從一條改接擴成三條（`earnings-overview.html`／`earnings-ztor.html`／`earnings.html` 三者都導向 `earnings-sony.html`），Sony 簡報版在拆頁後仍是收入管理的唯一落點。`earnings-overview.html` 排第一條是刻意的：`guardRoutePage()` 反向導回時取第一個 pair 的來源，所以離開 Sony 版會落在新的總覽頁而不是舊單頁。已雙向實測（切 Sony → 停在 sony；切回 full → 回總覽）。
- **【D】** `js/i18n.js` 補導覽群組四個 key（`nav.earnings-overview*`／`nav.earnings-ztor*`）與兩頁的中英字串（`earnings.ov.*`／`earnings.zt.*`／`ext.*`）。實測兩頁 `data-i18n` 零未翻鍵、`data-lucide` 零未解析 icon（外部收入列的 icon 走既有 registry：`music`／`video`／`pencil`／`link`／`globe`，未新增 icon）。
- **【D】** 兩頁的頁面 `<style>` 按用途分流：`.src-*`（收入來源 focus 高亮）跟去總覽頁、`.bd-*`（項目收益表格）跟去 Ztor 頁，不整段照抄。總覽頁新增 `.ext-row__end`（外部收入列尾的 badge＋金額對齊）——單頁一次性版面、暫不 promote，等拆頁定案再看要不要進 `ds-components/`。check_ds_sync 全 PASS（棘輪未升）。
- **未做／待上游**：`documents/` 一律未動（sitemap §3.2.1、5.1.8 的 F1–F12 分派、§7.3 新增「收入歸屬」欄位）；「平台／串流版稅」歸內或歸外**本輪刻意不選邊**，頁1 示意兩列、頁2 篩選 chip 仍留著，等上游裁決金流路徑（ESP-002）。

## 2026-07-31（第三批）· 活動清單「現場報到台」改為深連結，整列點擊帶上活動 id（A spec ＋ D infra）

使用者在活動清單上發現「現場報到台」點開後與直接點活動看不出差別，懷疑是誤植或該刪。查證結果：它不是誤植——規格 [5.1.6.3 §2.5](../../documents/5.1.6.3-活動詳情.md) 定義現場報到台是活動詳情頁裡活動進行中才出現的區塊（`#ed-live`），不是獨立頁，所以只有進行中那一列掛這個選項是對的。看不出差別是兩件事疊起來造成的。

- **【A】** `events.html` 的「現場報到台」href 補錨點 `#ed-live`：原本只連到 `event-detail.html?id=…`，落點在頁面最上方，與點活動名稱完全相同，這個選單項等於沒有目的地。實測瀏覽器原生錨點捲動在此可用（區塊由 `initLive()` 在解析階段就解除 `hidden`，早於錨點捲動時機），整頁與覆蓋層兩種開法都會停在報到台上，故不另寫 JS 捲動。
- **【D】** `events.html` 十一列全部補 `data-go="event-detail.html?id=<id>"`，十筆標題連結補上原本漏掉的 `?id=`（原本只有進行中那列有）。整列點擊的退路由寫死的 `location.href = 'event-detail.html'` 改讀 `row.dataset.go`——寫死的網址不帶 id，會開到示例首筆活動而不是點的那一列；使用者看到的「同一列的兩個入口開出不同內容」就是這個。`data-go` 同時讓 `detail-sheet.js` 在捕獲階段接手，整列點擊與選單項一致走覆蓋層，不再一個 popup 一個整頁。

## 2026-07-31 · 新頁 粉絲分析（Fan analytics）：受眾洞察從全域能力升為 Fans 子頁（A spec ＋ D infra）

> **同日更名（D162）**：頁面由「受眾分析／Audience」改為「粉絲分析／Fan analytics」，檔名 `audience.html` → `fan-analytics.html`。連帶把 Fans CRM 與本頁的分工從「受眾 vs 粉絲」改成**名冊 vs 分析**——一個一個看 vs 整體看，不再依賴詞彙定義。F2「受眾總覽」→「粉絲總覽」、「總受眾規模」→「總追蹤人數 / Total following」、「受眾分群」→「粉絲分群」。同時把**單位界線**寫進兩邊文案：本頁算「人」（去重後人數），儀表板／項目詳情的表現卡算「次數」（觀看＋串流）；兩邊都有平台與地區切面，數字不可互比。未採納把儀表板三張表現卡搬進本頁——它們的單位是作品觸及次數、不是人，且已歸屬項目詳情的表現分頁。

規格側先行：`documents/5.1.7.8-受眾分析.md` 新建、D158（升為 Fans 群組子頁）／D159（撤除 v1 分期、F1 改為不占版位的常駐指示）／D160（F8 更名建議行動）。本輪把規格落地成站台。

- **【A】** 新增 `fan-analytics.html`，掛在 Fans 導覽群組第 6 個位置（`js/sidebar.js` panel ＋ `FULL_ROUTES`；`js/devtools.js` 的同名清單一併補上——兩份清單必須一致，只改一邊會讓低版本藏得掉導覽、頁內連結卻還點得進去）。Fans 不在 `feature-scope-map.md` 的 scope 表內，比照其他非 scope 產品頁標 `data-page-feat="full"`。
- **【A】** 版面順序 F7 → F2 → F3·F4 → F5·F6 → F8。F7 置頂是刻意的：先給一句有證據的結論，比先給一排數字更快讓人接上狀況；F2 緊接在後，讓創作者用整體數字驗證那句結論可不可信（D159）。
- **【A】** F1 平台連結與同步狀態**不占常駐版位**：它坐在頁首操作區、取代原本獨立的「前往整合設定」按鈕。理由是「去連平台」永遠是先看到某個平台缺了或壞了之後才成立的動作，獨立擺在頁首會變成一顆沒有前因的按鈕；動線固定為 看到狀態 → 展開明細 → 知道是哪個平台 → 前往設定。唯一例外是未連結態，此時整頁只剩來源清單，前往設定就是主要行動。
- **【D】** 新元件 `ds-components/finding-card.css`（`.finding`）——F7 用。與 `insight-row` 的分工寫進 DS：insight-row 一行就講完；結論需要數字支撐、而且要能追查下去時才用 finding card。兩個數字並列＋中間的落差標記，是為了讓「不同步」變成看得見的形狀，而不是一句要人腦補的敘述。
- **【D】** 新元件 `ds-components/source-status.css`（`.src-status`）——F1 用。狀態由容器的 `data-open`／`data-alert` 驅動；異常時整顆膠囊轉 destructive 且排除前不回到低調樣式。來源識別塊只放縮寫、不用各平台品牌色：品牌色會讓五列變成五種強度不一的視覺重量，而這裡要比較的是「狀態」不是「是哪一家」。明細列沿用 `settings.css` 的 `.settings-row`，不另造一套列。
- **【D】** `design-system.html`／`design-system.md` 同步兩支新元件（§4.111 Finding card、§4.112 Source status）：TOC 錨點、元件總表兩列、rendered preview、Class API 與消費頁。
- **【D】** `js/i18n.js` 補整頁中英字串（`aud.*`）。用詞取捨記在該區塊註解裡：「受眾/audience」對整體匿名、「粉絲/fans」對站內認得出來的人，兩詞不可互換；膠囊用 sources 不用 platforms（要講的是「數字建立在什麼之上」）；F8 用「建議行動 / Suggested actions」而非上游的「商業機會提示」（D160）。
- **【A】** Dashboard F7 受眾欄補「進入受眾分析」入口（`js/components.js`）。這收掉的是 D057 留下的懸空 deep-link——當時裁示指向「Fans CRM 受眾／趨勢區塊」，但那個區塊從未存在過。
- **【A】** `fans-crm.html` 頁首補一條到受眾分析的 cross-link，`fans.sub` 補一句分工：這裡看「人」，跨平台的整體受眾樣貌在受眾分析。

## 2026-07-31（第二批）· 分級選單補上「累計人數」，分級人口抽成單一來源（B 反饋 ＋ D infra）

接續同日第一批。使用者比對 demo 後指出線上版少了選單裡的人數，並指定要**累計**人數。

- **【B】** 分級選單每一級右邊顯示「門檻設在這一級，共有多少人買得到」＝該級與其上各級相加（154 ／ 513 ／ 988 ／ 1,283），不是該級自己的帶人數。決定門檻時真正要回答的是「會擋掉多少人」，只給單級人數的話使用者得自己心算；累計值往下讀就是把門檻收緊的代價。新增 `renderReach()`，隨 `renderTier()` 一起跑。
- **【D】** 新增 `ds-components/dropdown-menu.css` 的 `.dropdown__meta`（值列尾端次要資訊）：`margin-left:auto` 靠右推齊讓四列數字對成一欄可以直接比，`tabular-nums` 讓位數不跳動，次要色＋小一階字表明它是參考值、不是這一列選的東西。`design-system.html`／`design-system.md` 的 §4.58 同步（demo 四列補數字、Class API 新增一列、Token usage 補 `--fs-12`／`--sp-8`、說明段補累計語義）。
- **【D】** 新增 `js/tier-population.js`：把每一級的人口抽成單一來源，原本內嵌在 `js/vault-store.js` 的 `TIERS` 改讀它（vault-store 內部沿用自己的 `super` key，在讀取處映射，不動它的 reach 系列與假資料）。媒體庫房問「有幾位粉絲打得開」、電子商店問「門檻設在這一級有幾個人買得到」，是同一份人口的兩種讀法，不該各存一份數字。`media-vault.html` 補載該檔（順序在 vault-store 之前）。已回歸驗證：媒體庫房的分級數字（154／359／475／295）、總數 1,283 與庫房卡片渲染皆不變，無 JS 錯誤。
- **【D】** i18n 新增 `e-shop.tier.reach`（`{n} fans`／`{n} 人`）。
- **未做／已記缺口**：站上另有一組矛盾的人口數字——`js/i18n.js` 的 `tier-settings.tier.*-count`（359／512／640／329）是分級設定頁卡片的靜態文案，與本檔對不起來。兩組都是假資料、各自服務不同頁面，統一哪一組屬產品資料來源問題，記為 **PG-022**，本輪不自行選邊。

## 2026-07-31 · 粉絲分級欄改「單擊門檻」，推翻 07-29 的自由多選（B 反饋／使用者裁決 ＋ D infra）

使用者檢視方案比較 demo（`scratch/demo-tier-gate.html`）後裁決採門檻模型。產品決策記於 `documents/decisions.md` D161，欄位本身仍無規格出處，記為產品缺口 PG-021。

- **【B】** `e-shop.html` 粉絲分級欄的互動由「四級各自勾選」改為「點一級＝把門檻設在那一級，該級與其上各級自動包含」。合法狀態由 16 種收斂成 4 種——原本的 12 種不連續組合（如「粉絲買得到、上榜粉絲買不到」）在巢狀分級下講不通，07-29 的實作自己也承認：遇到不連續時沒有簡寫可用，只能把分級名字逐一列出。`tiersOf()` 新增門檻正規化（任何既有值一律收斂成「從頂端連續到其中最低那一級」，保守方向、不會把原本買得到的人擋掉）；`tierSummary()` 移除「逐項列出」的退路分支；`renderTier()` 移除「最後一項不能取消」的停用邏輯——門檻永遠存在，做不出「沒有人買得到」那個狀態。
- **【B】** 摘要文案由大於號寫法改成含本級的說法：`> 粉絲` → `上榜粉絲以上`、`> 上榜粉絲` → `超級粉絲以上`、`僅核心圈` → `僅限核心圈`、`全部` → `全部分級`。用字對齊建立拍賣頁的競標資格（`cp.elig.*`）——同一個模型在產品裡只用一套說法。英文取 `Superfan+`／`Ranked fans+` 簡寫是為了塞得進 144px 欄寬（實測中英文皆無溢出），規格 §5.1.5 描述競標資格時本來也是寫 `Superfan+`。
- **【D】** `ds-components/dropdown-menu.css` 新增面板變體 `.dropdown__menu--ladder`：已選列左緣加一條 2px `--selected-ink` 直線，把「被包含的一段」連起來——沒有它，四個各自帶 check 的列看起來就是四個獨立開關，使用者會以為可以隨意跳選。同時新增 `.dropdown__item--preview`（hover 預告，40% 透明 check，讓階梯關係在點擊前就看得見）與 `.dropdown__cap`（選單抬頭小字「買得到的最低分級」，非選項不可點）。`--choice` 的原註解說「選單一次只會有一個被選」已過期，一併改寫。
- **【D】** `design-system.html`／`design-system.md` 的 Dropdown menu（§4.58）同步：rendered preview 新增第三張 demo（ladder 選單，第三列固定在 `--preview` 態示範 hover 預告）＋說明段；Class API 補 `--choice`（07-29 落地時漏記，本輪補上）、`--ladder`、`--preview`、`.dropdown__cap` 四列；Token usage 補 `--selected-ink`／`--radius-pill`／`--sp-4`／`--fs-11`／`--lh-snug`（寫入前逐一 grep 確認 CSS 有定義且有引用）。
- **【D】** `js/i18n.js`：新增 `e-shop.tier.cap`／`min-devoted`／`min-superfan`，改寫 `all`／`inner-only`，刪除 `gt-fan`／`gt-ranked`（全站無其他消費者，且措辭與新模型矛盾，留著會誘導下一個人用錯模型）。中英齊全。
- **【D】** 13 個靜態列的分級選單加上 `dropdown__menu--ladder` 與抬頭；demo 填充列（`fillDemoProducts`）沿用既有的「複製第一列 markup」做法，不需另改模板。

## 2026-07-30（第五批）· 套組卡片：展開態價格移到標題列右上，動作移到卡片底部，卡內間距比照建立商品 section（B 反饋）

接續同日稍早三輪套組編輯器改動（第二／三批，見下方）。本輪三項改動皆共用模組 `js/bundle-editor.js` 與 `ds-components/bundle-editor.css`，create-project.html／project-detail.html 兩個消費頁同步生效。

- **【B】** 展開態的價格移到卡片標題列右上角：標籤「套組價」（`.fc-sum__tag`，展開態才顯示）＋放大金額（`.fc-sum__val`，`--fs-20`），有折扣時原價劃線（既有 `.fc-sum__was`）並列在前。收合態的摘要價格維持原樣不變。理由：定價區塊在卡片最後、中間隔著五組欄位，編輯名額或商品的當下看不到價格變成多少。
- **【B】** 展開態的動作從標題列移到卡片底部：標題列右上角只剩價格。底部改成兩層——`.fc-collapse`（整條可點的收合把手，滿寬、上緣分隔線、置中，內含 icon 元件 `<i data-lucide="chevron-up" class="ztor-icon">`）＋`.fc-bundle__foot`（右對齊，內含紅色的 `.btn.btn--destructive.btn--sm` 移除鈕，只有多於一張卡時出現）。收合態維持標題列右側的「編輯／移除」文字連結不變。移除鈕改用**實色** `.btn--destructive`，與站上多數「刪除」動作慣用的 `.btn--ghost.btn--destructive` 不同——記入 STYLE-DECISIONS Q37（待裁決）。
- **【B】** 卡內間距對齊建立商品頁的 section（使用者指定參考 create-product 的 `.form-section--outlined`）：`.fc-bundle` 內距由 `--sp-16`/`--sp-18` 改成 `--sp-24`；收合態左右內距同步改 `--sp-24`（收合↔展開時名稱不左右位移）；新增 `.fc-bundle__body .field__label { font-size: var(--fs-14) }` 與 `.fc-bundle__body .field__label + .field__hint { margin-top: calc(-1 * var(--sp-4)) }`。欄位間距維持基礎 `.field` 的 16px（Q6 已統一全站）。
- **【D】** i18n 新增 3 個 key（中英齊全）：`cpp.bd.collapse.long`（收合這個套組）、`cpp.bd.remove.long`（移除這個套組）、`cpp.bd.price.tag`（套組價）。既有的 `cpp.bd.collapse`／`cpp.bd.remove` 仍供收合態的短連結使用。
- **【D】** `design-system.md`／`design-system.html` 的 Bundle editor 條目（§4.15b）同步：purpose 段補價格上移／動作下移／間距對齊三項，demo 卡改成新版標題列＋底部把手，spec 表 Anatomy／Behavior／Classes／Token usage 四欄補新 class 與 `--fs-20`／`--ring` 兩個 token（grep 確認 `ds-components/bundle-editor.css` 逐一存在後才寫入，`--font-ui`／`--fw-regular` 屬既有但先前漏記的 token，一併補上）。

## 2026-07-30（第四批）· 發布項目改導向詳情頁＋toast 跨頁佇列，停用按鈕旁補原因行（B 反饋 ＋ D infra）

- **【B】** 建立項目 wizard 的「發布項目」不再只彈 alert（`create-project.html:1277-1290` `publish()`）：改成把成功訊息排進 toast 跨頁佇列，導向 `project-detail.html?id=<id>`，讓使用者看到「東西已經在了」而不是停在原表單。原型無真實建立，故導向「與這次選的類型相符的第一筆示範專案」（`golive`→nick-lrh、`fund`→nick-r2、`preorder`→nick-wo-de-i，型別對映見程式碼註解）；排程發布（Publish timing 選「排程發布」）改用「已排程」語氣的文案，不謊報「已發布」。舊 `cpp.publish-alert` 已無消費者，暫留未刪。
- **【D】** `js/toast.js:71-121` 新增跨頁佇列 API `window.ztorToast.queue(message, { key, tone, hold })`：訊息連同 i18n key 寫入 `sessionStorage`（key `ztor.toast.queue`），下一個載入本檔的頁面在 DOM ready 時「先清佇列再顯示」，避免重整重跳；存 i18n key 而非翻好的字串是因為顯示時機在下一頁、語言可能已切換，查無 key 才退回保底字串。任何頁面載入 `js/toast.js` 即自動支援，不必逐頁接線。`show()` 本身未動。`project-detail.html:46,2069` 補載 `toast.css`／`js/toast.js`。design-system.md／design-system.html 的 Toast 條目（§4.107）同步補充。
- **【B】** Wizard footer 主動作旁新增原因行 `[data-next-hint]`（`create-project.html:833`）：只在回饋套組步驟 Continue 被停用時顯示「還需要一個完整的套組才能繼續。」，可按時清空（`create-project.html:894-906,948,1240-1243`）——先前擋關原因只寫在步驟內的教練提示，離 footer 那顆灰按鈕太遠，按鈕自己不解釋自己。新樣式 `.wizard__bottom-hint`（`shared.css:1172-1186`），視覺與 `.field__hint` 同級，全用既有 token；design-system.md／design-system.html 的 Wizard frame 條目（§4.50）同步新增 disabled+hint 示範狀態與 spec 表列。
- **【D】** `js/i18n.js:3015-3016,3475-3476` 新增三個 i18n key（發布成功／已排程／footer 原因行），中英齊全。

## 2026-07-30（第三批）· 套組優惠改百分比欄位，卡片欄位重排，撤除卡片左緣「未完成」色線（A spec 落地／使用者裁決 ＋ B 反饋 ＋ C 撤除）

接續同日稍早把套組價格改唯讀計算＋新增套組優惠欄位那兩筆（見下方兩則）。本輪三項改動皆共用模組 `js/bundle-editor.js` 與 `ds-components/bundle-editor.css`，create-project.html／project-detail.html 兩個消費頁同步生效。

- **【A】** 套組優惠單位由「金額」改為「百分比」（使用者裁決）：欄位改 0–100、單位 `%`（沿用既有 `.amount-field--suffix.amount-field--readonly` 做法，未新造百分比欄樣式）。折抵金額＝原價×百分比÷100，仍夾在商品定價加總之內——折扣不能吃到分潤名額，折後價格地板＝股份總價不變。可折抵上限改以百分比表達：新函式 `maxPct()`＝floor(商品定價加總÷原價×100)。超標時 hint 轉紅並說出實際生效的百分比與金額（沿用既有 `.field__hint.fc-hint--over`，未新增第二種紅）。價格組成說明改百分比與金額並陳，例：「1 個名額 × $200 ＋ 1 件商品 $3,680 ＝ 原價 $3,880，折 15%（−$582）＝ $3,298」。
- **【B】** 套組卡展開態欄位重排（使用者反饋，由輸入到結果）：套組名稱 → 一句話說明 → 含分潤名額｜販售上限 → 商店商品 → 額外權益 → **定價區塊**（新增，置卡片最後）。定價區塊＝優惠 %（窄欄）＋ 價格（唯讀結果）＋ 組成說明 ＋ 折抵上限／超標說明，上緣一條分隔線。新增 CSS：`.fc-pricing`／`__row`／`__out`／`__note`（`ds-components/bundle-editor.css:189-217`），以及補回格線與下一欄位間距的 `.fc-bundle__body > .form-grid { margin-bottom: var(--sp-16) }`（`ds-components/bundle-editor.css:176`）。
- **【C】** 撤除套組卡「未完成」的左緣色線（使用者明確裁決）：`.fc-bundle--invalid` 規則與 class 一併移除（CSS 約 59-64 行留墓碑註解），連帶移除只為它存在的 `border-color` transition；`--status-warning` 在本元件已無引用。**判準 `isValid()` 沒變、資訊沒有跟著消失**——仍驅動建立頁底部教練提示與 Continue 的停用狀態，移除的只是卡片自己那條表現。同時撤除已無用的 `.field__hint.fc-pricecalc`（重排後定價區塊容器已承接它的功能），CSS 留墓碑註解。
- 未做：`create-campaign.html` 仍是自己的第一代頁內 `.fc-*` 副本，未遷移到共用模組——治理待辦，已記在 design-system.md/.html 條目內。

## 2026-07-30（第二批）· 套組價格改唯讀自動計算，新增「套組優惠」折抵欄位（A spec 落地／使用者裁決）

接續同日稍早把套組編輯器抽成共用模組 `js/bundle-editor.js` 那筆（見下一則）。使用者裁決：套組的「價格」不該由創作者手填——名額的單價在募資設定已經定死、商品的定價住在商品自己頁面，兩個都是算得出來的數字，再打一次只會跟對帳漂移。真正屬於創作者的定價決定只剩「要不要給這個組合折扣」，因此新增套組優惠欄位。本輪同時追加裁決：折扣不能吃到分潤名額那一段——名額賣的是淨收益股份、單價全項目一致，允許套組折讓名額等於把分潤條件改掉，不是行銷折扣。

- **【A】** `js/bundle-editor.js`：「價格」欄由可填輸入改為唯讀（`.amount-field--readonly`），公式＝原價（含分潤名額×每名額單價＋所選商店商品定價加總）－套組優惠；新增 `discount` 狀態欄位（唯一與價格有關的使用者輸入）與 `listPrice()`／`finalPrice()`／`maxDiscount()`／`perSlot()` 四個推導函式。可折抵上限＝商品定價加總，折後價格地板＝股份總價（名額×每名額單價）；純回饋（0 名額）卡可折到 $0，只含名額無商品的卡一分都不能折。填超過上限不默默截掉：優惠欄下方 hint 說出上限與理由，超標時整行轉紅（`.field__hint.fc-hint--over`）；價格欄上方的組成說明改顯示實際生效的折抵值。`isValid()` 判準同步改為「有名稱且（名額>0 或至少一件商品）」，取代舊的「有名稱且價格>0」——價格已不可手填，舊判準會讓新卡永遠無效。收合摘要列新增原價劃線（`.fc-sum__was`）：有折扣時原價劃掉並列在套組價前面，讓比較三張卡的收合視角看得到折扣存在。
- **【A】** `mount()` 新增每名額單價注入（`getPerSlot`／`perSlotInput`／`perSlot`，優先序同既有名額池注入）：create-project 讀募資步驟既有唯讀欄位 `#fd-perslot`（目標金額÷支持者名額，`create-project.html`）；project-detail 沒有這組募資欄位，改由專案資料 `fund.goal ÷ 200` 推導名額池、每名額單價固定 $200（`project-detail.html:1675-1678`，原型假資料，見 ASSUMPTIONS PG-020）。新增 `refresh()` 供外部注入值變動時就地重算全部卡片。
- **【A】** i18n 新增 15 個 `cpp.bd.*` key（價格組成說明 5 種狀態、折扣 hint 5 種狀態、折扣欄標籤等），中英齊全。
- **【D】** `ds-components/bundle-editor.css` 新增 `.fc-sum__was`（收合摘要列原價刪除線）與 `.field__hint.fc-hint--over`（欄位級超標提示，寫成 0,2,0 權重疊過 field-system.css 的 `.field__hint`）；`design-system.md`／`design-system.html` 的 Bundle editor 條目（§4.15b）同步補上計價規則、新 class、新 demo（有折扣的收合摘要列、正常 vs 超標 hint 對照）。
- **產品變更提案（未經上游核准，記入 ASSUMPTIONS CCR-008 附錄）**：套組定價從「創作者自由填」改為「系統推導＋限定範圍的折扣」，屬商業規則變更、非單純呈現調整。
- 未做：不同套組覆寫每名額單價（現行全項目統一單價，見 PG-020）；套組優惠是否該有其他讓利管道（例如折抵名額）——本輪裁決不可折抵，未來若翻案需重新裁示。

## 2026-07-30 · 項目詳情「方案與承諾」改用建立流程同款套組卡；套組編輯器抽成共用模組 js/bundle-editor.js（A spec 落地／使用者裁決 ＋ D infra）

CCR-008 已裁決支持方案改「共創套組」模型、照建立流程 create-project「回饋套組」步驟做，但先前 project-detail 落地的仍是第一代編輯器（自由輸入商品＋照片上傳、無價格、無販售上限），跟建立流程長得不一樣。本輪使用者裁決兩頁完全對齊同一款卡，順手把行為抽成共用模組供兩頁使用，之後改一次兩頁同時到位。

- **【A】** `project-detail.html`：「方案與承諾›支持方案」第一代編輯器（`itemRow`／`bundleCard`／`.fc-item-row` 自由輸入商品＋照片上傳）整段刪除，改 mount 共用模組（`project-detail.html:1637-1716`），帶 3 張已填種子套組、全部預設收合、名額池寫死 `SLOT_POOL = 100`（`project-detail.html:1656`，原型假資料，真實來源待上游）。欄位因此由「名稱／描述／含股份／名額／自由輸入商品列」改成與建立頁一致的：套組名稱＊／價格 USD＊／一句話說明／含分潤名額／販售上限（自動·限量 segmented）／商店商品（搜尋引用既有 E-Shop SKU）／額外權益——**含股份併入含分潤名額、自由輸入商品列退場改為引用既有商品**，皆使用者本輪明確裁決。補載 `ds-components/amount-field.css`(:41)、`js/products-store.js`／`js/bundle-editor.js`(:1375-1377)。
- **【D】** `create-project.html`「回饋套組」步驟原本的頁內第二代實作（2026-07-28）抽出為共用模組 `js/bundle-editor.js`（新檔，565 行，`window.ZtorBundleEditor.mount()`）；`create-project.html` 頁內只留三件它自己的事：名額池讀 `#fd-slots`、右軌 `#bd-overview` 名額分帳與目標覆蓋率、教練提示與 Continue 擋關（`create-project.html:1105-1212`）。
- **【D】** `ds-components/bundle-editor.css` 本身未改動（第二代 class 上一輪已補齊）；`design-system.md`／`design-system.html` 的 Bundle editor 條目同步升級為第二代描述＋標註共用模組。
- 未做：`create-campaign.html` 仍是自己的第一代頁內 `.fc-*` 副本（自由輸入商品、無收合/引用/名額推導），未遷移到共用模組——治理待辦，已在 design-system.md/.html 條目內註記，不在此重複登記。

## 2026-07-31 · 儀表板三張表：斷點改為整排獨佔、第一欄換成作品／商品圖（B 反饋導入）

- **【B】** 新增 bento 修飾類 `--stack-lg`：裝了表格的那兩排延後到 **1440px** 才並排，之下各佔一行。原本 bento 一律 900px 堆疊，那是為 KPI 這類短內容定的；實測這三張表要不擠分別需要 597／448／632px，換算回視窗約 1480px，硬並排就會擠成多行（使用者回報「都變形了」）。其餘 `.bento`（KPI 列等）不受影響。
- **【B】** 三張表第一欄由狀態圖示改為**真實作品／商品縮圖**（沿用 `.ztor-table__thumb`，同 finance-overview 的做法）；沒有 `img` 的列仍退回圖示。
- **【B】** 配圖與文案一起改：舊的英文佔位實體（Coastline EP／Late Bloom／Neon Tide／Winter Set／Quiet Hours）換成 persona 既有作品——REAL LIFE、帥到分手、LOVE RAGE HOPE 黑膠典藏版、什麼都不必說、REALIVE (R2)、FLAMES、NICKTHEREAL 肖像。**配對一律取自 `projects-store.js` 的既有「名稱↔封面」對應，不自行湊圖**：這個 repo 先前修過「電子商店多筆商品圖文不符」，亂配等於再犯一次。
- 這同時修掉一處既有的不一致：站上其他頁（項目、電子商店、活動）早就是周湯豪 persona，只有儀表板這幾列還留著舊的英文佔位資料。
- 驗證：13 張縮圖全部載入成功；1335px 視窗下三張表皆整排獨佔、無擠壓。

## 2026-07-31 · 近期活動與項目的進度欄加上進度條（B 反饋導入）

使用者指定改成與項目清單（`.project-list__goal`）同一種呈現：百分比 ＋ 進度條 ＋ 原始數字。

- **【B】** 正在進行的列，進度欄由單行數字改為三段式——`62%` ／ 進度條 ／ `62 / 100 位支持者`。非進行中的列不變，仍只顯示狀態詞（準備中、草稿…）。
- **【D】** 進度條沿用 shared.css 既有的 `.project-bar`（funding-panel 與 project-list 都在用），不另做一支。`table.css` 只新增容器與兩段文字樣式 `.ztor-table__goal`／`__goal-pct`／`__goal-amt`。**這兩段文字樣式與 `.project-list__goal-*` 內容相同、分屬不同元件各留一份**——已在 CSS 註解標明：若第三處再出現同樣需求，應把這組 goal cell 抽成共用元件，不要再複製第三次。
- 三張卡在 1155px 與 1526px 視窗下皆零溢出。窄視窗時進度條只有約 46px，仍可讀但偏短，若之後覺得太細可再調。

## 2026-07-31 · 生命週期狀態統一為「準備中」，補齊終態文案與例外上色（B 反饋導入）

使用者裁示「預定改準備中」，並要求把先前列出的三項待決一起做完。

- **【B】** 生命週期的 Scheduled 狀態，中文一律用**準備中**：原本活動軸寫「預定」、項目軸寫「已排程」，同一個概念兩個詞。改到 6 條 i18n（`status.scheduled`／`events.badge.scheduled`／`events.stage.scheduled`／`projects.state.scheduled`／`project-detail.status.scheduled`／`event-detail.badge.scheduled`）與三處頁面內的標籤對照表。英文維持 `Scheduled`。
- **【B】** 補齊四條終態文案：`status.sold-out`（已售完）、`status.ended`（已結束）、`status.cancelled`（已取消）、`status.succeeded`（已成立）。表格的進度欄會直接顯示狀態詞，缺文案會露出 key。
- **【B】** 進度欄的狀態詞依既有 variant 上色：中性狀態維持次級灰，`error` 用 `--destructive`、`warning` 用 `--status-warning-ink`。不回到彩色徽章，是為了讓這一欄維持單一視覺語彙（要嘛數字、要嘛一個狀態詞）。
- **不動的同名概念**：商品的定時上架、新品貼文的排程發布、群發訊息的排程狀態（`msg.status.scheduled`、`cpp.publish.toast.scheduled`）都用同一個「已排程」字眼，但講的是動作排程、不是生命週期，整批換會弄壞語意，故逐處分類後只改生命週期那幾處。
- 規格同步：§7.2、5.1.2、5.1.6.3 共 3 處（Plan225）。

## 2026-07-31 · 近期活動與項目：進度欄吸收狀態；最近動態日期併入第二行（B 反饋導入）

使用者裁示「只有正在進行的才顯示幾張票／多少支持者，其他狀態都直接寫狀態」。

- **【B】** 近期活動與項目**移除狀態欄**：進度欄改為——狀態屬「正在進行」（`status.live`／`status.on-sale`／`projects.state.published`）時顯示進度數字，其餘一律直接寫狀態詞（草稿／已排程／已成立／已售完／已結束／已取消）。判準是「數字本身有沒有說明現況」。此舉同時解掉一處資料矛盾：demo 第 2 列狀態是「預定」卻帶著募資進度，現在只顯示「預定」。
- **【B】** 最近動態把**日期併入第二行**（`Projects · 11/23`），移除日期欄。原因是這張卡是 span-5，1155px 視窗下四欄會溢出 52px、狀態徽章被切掉；日期與來源模組同屬歸屬資訊，放同一行也自然。狀態維持獨立欄——它是這張卡真正要看的東西。
- **【D】** 表頭字級 `--fs-13` → `--fs-12`，顏色改為 `color-mix(in srgb, var(--muted-foreground) 72%, transparent)`（使用者要求更小更暗；站上沒有比 `--muted-foreground` 更暗的文字 token，故以它為基底降不透明度，不新增 token 也不寫死色值）。
- **【D】** 修掉表格列下框線在圖示欄斷掉的問題：`.ztor-table__media` 被誤套在 `<td>` 上，而 design-system 對這個類別本來就寫著「內層包裝，絕不能放在 `<td>`——`display:flex` 會破壞儲存格版面」。改回純 `<td>`。
- 三張卡在 1155px 與 1400px 視窗下皆為零溢出。

## 2026-07-31 · 儀表板三張卡改成表格，表頭去底色（B 反饋導入）

使用者裁示把近期收入／最近動態／近期活動與項目的欄位「拆出來」成表格；隨後再裁示表頭不要底色、並把來源／模組／分類移到主欄位的第二行。

- **【B】** 三張卡由 `data-list` 改為 `ztor-table`。欄位——近期收入：項目（第二行放來源）｜時間｜金額；最近動態：事件（第二行放來源模組）｜日期｜狀態；近期活動與項目：名稱（第二行放分類）｜進度｜期限｜狀態。圖示保留為第一欄（承載狀態語意，不是裝飾）。
- **【B】** `.ztor-table` 表頭移除底色（全站一致，不另開變體）：分隔改由既有的 `border-bottom` 承擔。底色在卡片裡會讀成另一個區塊。
- **【D】** i18n 新增 48 組逐欄文案 key（中英）。原本每列副標是「來源·時間」「分類·模組·日期」這樣一整串、共用一個 key，拆欄後每個欄位各自一個。
- **【D】** 表格化做成**逐處選用**（資料集帶 `table: true`）：`transaction-list` 同時被 earnings／earnings-overview 使用、`events-projects` 還被 F2 專案 popup 用，整支渲染器換掉會改到不相干的頁面。那些消費端維持原本的清單，已實測未受影響。
- **【D】** `table.css` 新增三個伴生類：`.ztor-table-scroll`（自 project-detail 用過兩次的行內 `overflow-x:auto` promote，第三次出現即收進元件；在 `.card` 內時取消表格自框避免框中框）、`.ztor-table__nowrap`、`.ztor-table__sub`。
- 過程中量到的事：把來源獨立成一欄時，三張卡分別溢出 0／51／109px；改成第二行後全部歸零。長值欄（進度「62 / 100 位支持者」、期限「預定 12/01 上線」）必須允許換行，鎖 nowrap 會把整張表撐開。

## 2026-07-31 · 「通知與待辦」改名「通知中心」（B 反饋導入）

使用者裁示改名。側欄／頂列的入口標籤、面板標題與公告文案三處中文一起改。

- **【B】** `js/i18n.js`：`nav.notif-label`（通知與待辦 → 通知中心）、`notif.title`（通知與待辦中心 → 通知中心）、`notif.announce.meta`（官方公告已併入…）。
- 規格同步：`0-設計規格書.md` §5.2.1／§6.5 等 14 處一併改名（Plan224）。
- **英文同日定為 `Notifications`**（使用者指定）：`nav.notif-label`、`notif.title` 兩條英文由 `Notifications & to-dos` 改為 `Notifications`，規格定義詞同步。儀表板空狀態文案裡的 `to-dos`（`dash.empty.*`）**不動**——那描述的是「待辦這種內容」，不是中心的名字。

## 2026-07-30 · 取貨管理納入 Phase 1，並修好版本 gate 的漏水（D infra / 文件）

使用者裁示「開發版本的 Phase 1 也要包含取貨管理」。取貨管理是 2026-07-03 才加的模組（D111），比 `feature-scope-map.md` 這張表晚，所以一直落在「未列 scope 的整頁功能只在 Phase 4 顯示」那條規則裡——不是被誰設成 Phase 4，是根本沒被登記。

- **【D】** `feature-scope-map.md` O 區新增取貨管理小節 `O24`–`O30`（入口／場次清單／建立場次／場次詳情／Scanner URL 與密碼／手機掃碼核銷／活動票券共用核銷），全部 🟢 Phase 1、✅ built，各列註明對應規格（5.1.5.11／12／14／15）。O 區統計 🟢 17 → 24。
- **【D】** `js/devtools.js` 與 `js/sidebar.js` 的 `FULL_ROUTES` 移除 `pickup.html`／`pickup-detail.html`／`scanner.html`——它們已列進 scope，改由 tier 管轄。
- **【D】** 順帶修好一個既有漏水：外部 r2.2 改版新增的 6 頁（tier-benefits／media-vault／brand-campaigns／brand-campaign-detail／fans-guide／manage-ip）只加進 `sidebar.js` 的 `FULL_ROUTES`、**漏了 `devtools.js` 的同名清單**。後果是低版本下導覽藏得掉、但頁內連結還點得進去。兩份清單本來就該一致，現已補齊（僅存的差異是 4 支 Admin 頁，r2.1 起就如此，Admin 屬 Tier 0、不會從創作者頁連過去）。
- 驗證：切到 Phase 1，側欄出現「電子商店／訂單管理／取貨管理」，`pickup.html` 連結未被擋；同一版本下那 6 支新頁的連結確實被擋住。測完已把版本切回原本的設定。

## 2026-07-30 · 撤除項目詳情的方形裁切工具，展示圖片維持單一直式尺寸（C 撤除）

使用者裁示移除。理由：展示圖片只用一種尺寸（直式 750 × 930），既然沒有第二種比例要另取一塊，裁切工具就沒有存在意義。**本筆推翻上一筆（同日的 B 反饋導入）**——那筆才剛把裁切從編輯模式放行到檢視模式，功能移除後該例外自然失效。

- **【C】** `project-detail.html`：移除「編輯（裁切）」鈕、`#pd-edit-crop`「調整方形裁切」彈窗、以及選框拖曳／等比縮放／即時預覽的整段邏輯。原位置留墓碑註解指向 git 歷史。
- **【C】** `shared.css`：移除 `.pd-crop-edit` 家族樣式（`__col`／`__stage`／`__img`／`__box`／`__handle`／`__preview`，共 30 行）與上一筆加的檢視模式例外，檢視狀態回到「動作層整層不出現」。**保留 `.pd-crop__badge`**（封面藥丸，名字相近但與裁切無關）。
- **【C】** `js/i18n.js`：移除 `pd-crop.title`／`.sub`／`.portrait`／`.square`、`showcase.crop-hint-view`、`showcase.edit`（裁切鈕的 title）共 6 個 key；改寫 `showcase.sub` 與 `showcase.crop-hint` 兩條仍在講「拖動方框設定方形裁切」的文案。
- **【D】** 一併改名，避免留下指向不存在功能的名字：`data-crop-tile`／`data-crop-replace`／`data-crop-del` → `data-gallery-*`、`.pd-crop__badge` → `.pd-gallery__badge`、`showcase.crop-hint` → `showcase.hint`。
- **【D】** 修掉一個會連帶壞掉的 guard：相簿 JS 原本是 `if (!gallery || !stage || !box) return;`，裁切舞台與選框拆掉後那兩個必為 null，不改這行的話**替換與刪除會被一起提早 return 掉**。已改為只檢查 `gallery`，並實測刪除仍生效。
- 保留：替換與刪除仍在編輯狀態下由圖片 hover 提供。
- 規格同步見 D156。**移除後產生一個缺口需上游補**：商店／縮圖等方形版位要如何從直式原圖取圖（自動置中、留白、或改用直式），原本是創作者用裁切工具自己決定，工具移除後這個決定權沒有交給任何人。

## 2026-07-30 · 項目詳情：方形裁切在檢視狀態即可操作（B 反饋導入）

使用者回報「r2.1 的圖片可以 hover 進去裁切，r2.2 好像被刪掉了」。查證結果是功能沒被刪——2026-07-27 改成就地編輯後，兩個分頁預設檢視狀態、以白名單把所有可改動入口收起來，圖片 hover 的動作列一併被藏，裁切因此抵達不了。使用者裁示走折衷：裁切放行、替換與刪除仍要進編輯狀態。

- **【B】** `project-detail.html`：裁切鈕加 `data-view-safe`，納入既有的檢視狀態白名單。**不改成黑名單**——`shared.css` 那段註解記著第一版用黑名單漏掉卡司與問答共 18 顆刪除鈕，白名單才收得乾淨。
- **【B】** `shared.css`：相簿的動作層在檢視狀態由 `display:none` 改為保留（`[data-mode="view"] .pd-gallery … .upload-tile__actions`）。層本身留著、裡面只有白名單那顆會出現，所以不必逐一列舉要藏誰。判準寫在註解裡：裁切只決定方形版位取原圖哪一塊、不動圖片資產，屬調整呈現；替換與刪除會動到資產，要進編輯狀態。
- **【B】** 新增檢視狀態專用提示語（`project-detail.showcase.crop-hint-view`）：「游標移到圖片、點裁切圖示即可設定方形裁切位置。替換或刪除圖片要先按「編輯」。」原本的提示語（講可替換／刪除）屬 `.field__hint`、在檢視狀態整組被藏，所以檢視狀態下等於沒有任何說明——這正是使用者以為功能被刪的原因。兩條提示語依狀態互斥顯示。
- 規格同步：`5.1.2.2-專案詳情.md` §2.2 補上「檢視／編輯兩段式」互動模型與白名單例外、§2.2.2 補「方形裁切」條目（見 D155）。兩段式本身是 2026-07-27 的改動、當時未留紀錄，這輪一併補齊。

## 2026-07-30 · 活動詳情／編輯活動依活動類型分支，共看派對收起不適用的區塊（A spec-derived 新增）

D149 早就定了共看派對（Watch Party）不套用票種、QR 報到、退款佇列與系列活動，但站上一直沒有依類型分支——所有活動都畫同一套區塊，一場共看派對的頁面上會出現它根本沒有的票種設定與報到台。這輪把規格落地。

- **【A】** `event-detail.html`：共看派對隱藏「票種／到場與報到／退款與贈票／系列」四個分頁及其面板、頁首的系列徽章、概覽的系列列、報到快照卡與現場報到台（`#ed-live`，即使活動進行中也不開）。分頁可見性接進既有的 `applyTabs()`（依活動階段算的那個單一決策點），不另外再設一次 `hidden`——檔內原本的註解就寫著「兩邊都想決定同一件事就會互相覆蓋」，實作時確實踩到一次。
- **【A】** `edit-event.html`：共看派對隱藏票種區段與概覽的票種列。
- **【A】** 頁首 KPI 收掉「已報到」與「退款佇列」後只剩半排，留下的兩張由 `--span-3` 加寬為 `--span-6` 填滿（純版面決定）。
- **【D】** `ds-components/kpi.css` 補 `.kpi[hidden] { display: none; }`。這是元件本身的漏洞：`.kpi` 是 flex，特異度贏過瀏覽器對 `[hidden]` 的預設，所以**在此之前站上任何用 `el.hidden` 收 KPI 的地方都藏不掉**。同款保護 `alert.css`／`badge.css`／`amount-field.css`／`kv-list.css` 早就有，kpi 漏了。已同步 `design-system.md` 與 `design-system.html`。
- 分支用 `data-hide-type="watchparty"` 屬性驅動，沿用 `create-event.html` 既有的同名慣例，不另發明機制。
- 未做：共看派對該用什麼取代那些區塊（D149 把「房間控場與觀看名單是否進本詳情頁」列為待產品確認），所以只收不補。另「已售票數」的副標仍寫「Across 1 tier」，用了 tier 一詞、與「無票種」略有矛盾，改文案需產品定調。

## 2026-07-30 · 登錄 IP：最後一步「登錄 IP」接上流程（A spec-derived 新增）

使用者回報這顆按鈕點了沒反應。實際上它接的是一個 `alert()` 佔位——文案還寫著「最終送出文案待產品確認」，等於四步精靈走到底就斷在這裡。規格 5.1.4.1 §7.1 早就定義了落點：「IP 資產（5.1.4）＝登錄入口與**建立後落點**」。

- **【A】** 送出後導回 `my-ip.html`，成功提示用 `ztorToast.queue()` 帶到下一頁。**這裡不能用 `show()`**——導頁的瞬間就會把它丟掉；`queue()` 存 sessionStorage、由 `toast.js` 在目標頁自動 flush，正是 create-project 發布後導頁用的同一套。
- **【A】** **文案分兩句**：上架出租與保持私有是兩種結果。共用一句「已登錄」會漏掉「私有的之後可從 IP 詳情頁再上架」——那正是 §4 上架狀態提示與 §6.5「私有可後補」要傳達的事，也是使用者選了私有之後最需要知道的下一步。
- **【D】** `my-ip.html` 原本沒載 `toast.js`，queue 的提示會永遠等不到 flush，一併補上；`register-ip.html` 同樣補 `toast.css`／`toast.js`。移除已無消費者的 `ri.register-alert`。
- **【D】** 一開始寫了 `window.ztorWizardChrome.markSaved()` 想先解除離開確認，查證後發現 `wizard-chrome.js` 根本沒有對外 API、也沒掛 `beforeunload`——它只攔頂部返回鈕，`location.href` 不受影響。那行是我憑印象加的，已刪。
- **⚠ 原型無後端**：不真的建立 IP record，回到 `my-ip.html` 不會多一列。

## 2026-07-30 · IP 詳情頁：「送出租用申請」接上流程（A spec-derived 新增）

使用者回報這顆按鈕點了沒反應。規格 5.1.3.1 §F4 早就定義了行為——送出＝建立一筆 Draft 授權、進入權利人的核准佇列，**不是付款**；§F3 另外要求「不得讓創作者誤以為已完成授權」。原本頁面只有法務小字寫著這件事，按鈕本身沒接任何行為。

- **【A】** 送出後**整個結帳 CTA 換成申請狀態**，不是跳一個 toast 就把按鈕留在原地。§F3 那條要求靠 toast 是滿足不了的——toast 幾秒就消失，使用者回頭看到的還是一顆「送出租用申請」，只會更困惑。狀態區留下四件事：`Draft 草稿` 徽章、「等待權利人核准」、送出內容摘要、以及「核准前不構成授權、這一步不扣款」。
- **【A】** 摘要的總額與條款**直接讀畫面上既有的 `.rent-block__total` 與 `ip-detail.rent-sub`**，不另存一份。同一個數字在兩處各寫一次，就會有對不上的一天。
- **【A】** 提供「撤回申請」讓誤點可逆（原型層級）。**撤回的正式規則上游未定**——§7.7 生命週期只有 Draft／Active／Expired／Revoked／Disputed，沒說申請方可否自行撤回、撤回後留不留痕，記入 ASSUMPTIONS UIA-098。
- **【A】** 「稍後再說」只給一則**誠實的 toast**（暫存在本機、清單尚無規格），刻意不假裝有收藏清單可以回去看。上游沒有定義「已儲存的 IP」落在哪一頁，給一個沒有去處的成功訊息比沒反應更糟。
- **【D】** 補上本頁沒載的 `toast.css`／`toast.js`。i18n 的取值助手是 `window.i18nT`（查不到鍵回 `null`，所以呼叫端一定要留英文退路），不是我原先以為的 `ztorT`。

## 2026-07-30 · 登錄 IP 流程：新增「素材上傳」區，素材槽依 IP 類型分流（A spec-derived 新增／產品變更提案）

使用者指定在 IP 名稱與描述那個 section 之下新增素材上傳。主規格 §7.7 Media Pack 已確立「每種 IP 類型有對應的素材槽與完整度計算」，但 §8.10.3 把**各型槽位明細**明列為待決，所以槽位表本身是提案，記入 ASSUMPTIONS UIA-096，未回寫 `documents/`。

- **【A】** `register-ip.html` 第 1 步新增 `#ri-assets`：**單一上傳區＋已上傳檔案列表**（`data-list`），上傳區下方一行提示這一型建議上傳什麼。建議清單隨 IP 類型換一組——共通兩項（封面圖、展示圖集）＋分型項目：故事世界 7、音樂 7、品牌 6、活動形式 7、其他 3；**真人形象不共用一組**（肖像是影像、聲音是音檔，混在一起兩邊都不對），依 UIA-095 的子類型再分：肖像 8、聲音 6、其他 5。清單寫在 JS 的 `ASSET_SLOTS`。
- **【A】** **初版做成「每個項目各一格上傳格」，同日依使用者指定改成單一上傳列表**：固定格子把「這型該有哪些檔」講得很清楚，代價是版面長、而且實際上傳往往一次多檔、也常有清單沒列到的東西。改法保留了原本的資訊——那份清單降級成提示文字，不再是必須逐格填的欄位。換 IP 類型會清空已上傳列表，否則列表與提示會互相矛盾。
- **【A】** **與「所有權證明」刻意分成兩個 section**（使用者裁示）：證明檔是給平台驗證的法務文件、素材包是承租方實際拿到的資產。這兩件事疊在一起最容易被當成同一件，所以副標直接把差異寫出來，而不是靠使用者自己推論。
- **【A】** **全部選填**（使用者裁示）：不進就緒檢核，登錄門檻保持低。第 4 步審閱新增「素材包」一列，顯示已上傳幾個檔。**改成自由列表後，登錄流程不再計算完整度**（沒有固定槽位就沒有分母），`completeness` 計量條與 `completeness.css` 一併從本頁移除；IP 市場卡的 x/N 仍在，該值改由平台端計算，落差記入 UIA-096。
- **【A】** 提示文字分兩句空狀態：還沒選 IP 類型、以及選了真人形象但還沒選子類型；這兩種情況上傳區一併收起（沒有建議清單就沒有東西可對照）。**兩者要有各自的 render key**，否則重繪守衛會把它們當成同一件事而跳過，文案永遠停在先出現的那一句（實作時踩到）。
- **【B】** 連帶修正 `ip-market.html`：九張卡的完整度原本一律寫死 `x/10`，與「每型槽位不同」直接矛盾。改成依 `data-type` 帶各型正確分母（story／music／event 7、brand 6、person 8），滿格才給 `--ready`。
- **【D】** 零新元件、零新 token：上傳區沿用 `upload-tile--file`、檔案列表沿用 `data-list`（列本身就是「主內容＋右側一格」的 grid，刪除鈕直接放右格），並補上本頁沒載的 `data-list.css`。圖示一律取自已註冊的 icon REGISTRY——沒註冊的名字會**渲染成空白且不報錯**，很難事後發現，所以動手前先把整份 REGISTRY 撈出來對過。

## 2026-07-30 · 登錄 IP 流程：真人形象增加「肖像／聲音」子類型與肖像年齡區間（A spec-derived 新增／產品變更提案）

使用者指定：新增 IP 流程要依類型分流欄位，選「真人形象」時，除了下面的 IP 名稱與描述，還要能選肖像或聲音；選肖像後要能選年齡區間。規格 `5.1.4.1` 的第 1 步只有「類型 → 名稱 → 描述 → 證明檔」、沒有任何依類型分流的欄位，所以這是**新增產品欄位**，記入 ASSUMPTIONS UIA-095 待上游裁定，未回寫 `documents/`。

- **【A】** `register-ip.html` 第 1 步在 IP 類型與 IP 名稱之間插入條件區塊 `#ri-person`（`hidden`，選「真人形象」才出現）：單選卡「肖像／聲音／其他」。肖像與聲音各自授權、各自計價（清單上已是 row9／row10 兩筆獨立 IP），登錄時就該分開；`register-ip.html` 的 Person-Based 副標原本就寫「Likeness, persona, voice」，所以是把既有語意顯性化。**第三張卡「其他」收沒被列出來的真人形象權利**（使用者指定），副標舉例人設、姓名、簽名、招牌動作——這同時解決了「人設」沒有去處的問題：上游沒定義它與肖像的界線，先歸其他、不為它單開一張卡。比照 IP 類型的 Other 卡，「其他」不附自由文字欄，細節寫在下方的 IP 描述。
- **【A】** 子類型選「肖像」才出現 `#ri-age`：**起／迄兩個下拉**（使用者指定），選項為「不限」＋1～100。**語意經使用者確認＝「這批肖像素材屬於本人哪個時期的形象」**，承租方挑年代形象時用得到；不是權利人現齡的法務聲明。兩端都留「不限」＝橫跨所有時期，摘要列此時收起。**起 > 迄時就地把另一端拉到同一個值**，不擋下來也不標紅字——那是選錯順序，不是需要被糾正的錯誤，使用者最後按的那個值優先。1～100 的 option 由 JS 生成、不寫死 200 行 markup。
- **【A】** 顯隱是**階梯式**的：真人形象 → 才有子類型；子類型＝肖像 → 才有年齡。切換類型或子類型時**清掉被收起欄位的既有選擇**，否則使用者改主意後會留下看不見的值，摘要與檢核照樣吃到它。
- **【A】** 接進既有的審閱與就緒檢查：第 4 步摘要新增「權利範圍」「年齡區間」兩列（非真人形象時整列收起，比照 prices 列）；就緒清單新增一項「肖像或聲音（選真人形象時）」，**只在選真人形象時才檢核**（比照標準價只在 rental 時要求）。年齡區間為選填、不進檢核。
- **【D】** 零新元件、零新 token：子類型用既有 `selection-grid`／`selection-card`（與上方 IP 類型卡同一套互動語彙）、年齡用既有 `.select`＋`form-grid`，並補上本頁原本沒載的 `zselect.css`／`zselect.js`（站上所有下拉都靠它把原生 select 換成 Ztor 自繪清單，不載就會露出作業系統畫的選單）。因此不需要動 `design-system.html`／`.md`。

## 2026-07-30 · 我的 IP 清單新增「肖像權」與「聲音」兩筆（B 反饋導入）

使用者指定在自有 IP 清單補周湯豪的肖像權與聲音兩個項目。兩者歸**站外登錄**：人格權本來就存在於 Ztor 之外、由創作者登錄進來，不是在站上產出的作品；`register-ip.html` 的 IP 類型「Person-Based」副標原本就寫「Likeness, persona, voice」，所以這兩筆落在既有分類內，未新增產品規則（IP 類型 enum 兩套並存的既有問題記入 ASSUMPTIONS UIA-094）。

- **【B】** `my-ip.html` 自有清單新增 row9（肖像權）／row10（聲音），完全沿用 row7 的「站外登錄＋已驗證＋有完整數據＋已上架」樣板：`data-source="external"`、類型欄「—」、權利／租出數／收益／`data-ip-price` 齊備、市場開關 on、kebab 與整列點擊都連 `manage-ip.html?id=row9|row10`。**類型欄刻意不加原創徽章**——站上所有站外登錄列都是「—」，加了就是自創「站外登錄＋徽章」的第三種組合（風格單一答案）。
- **【B】** 文字照既有兩層 persona 架構落位：主 `DICT` 放 default 人格（Coastline 世界）的通用版「肖像權／聲音」，`PERSONA_DICT.nick` 放「周湯豪的肖像權／周湯豪的聲音」＋權利人「周湯豪 · 100%」。**周湯豪的內容不寫進主 DICT**，維持 `js/i18n.js` 檔頭那條「周湯豪內容只集中在兩支資料檔的 nick 區塊＋PERSONA_DICT」的架構。
- **【B】** `js/ip-store.js` 補 row9／row10 的結構欄位，讓 `manage-ip.html` 點進去不是空頁、清單租金欄有數字：`ipType` 取語意最近的 `Character / Likeness`（聲音無專屬型別，屬將就）、verified、已上架、一次性費用＋分潤（$6,400＋15%／$3,200＋12%）。`deals` 筆數對齊 nick 人格的租出數（6／3），與 row1 同慣例。
- **【B】** 計數同步：自有分頁 tab 計數 8→10、KPI「IP 總數」12→14、`my-ip.kpi.total-meta`「自有 8」→「自有 10」。來源 filter 計數與頁尾「顯示 n 筆」是 JS 即時算、未動。「租出數 26」與「IP 總收入」屬人工設定的展示值（本來就不等於逐列加總），本輪不動。
- **【B · 追加】** 使用者指定把這兩列**移到清單第一、第二位**。連帶效果：清單不再是「Ztor 產出五列在前、站外登錄五列在後」的順序，DOM 順序改為肖像權／聲音 → Ztor 五列 → 其餘站外登錄三列。原分組順序本來就沒有承載語意（來源分組由上方 filter-tabs 即時篩選承擔，每列自帶 `data-source`），故不需改篩選邏輯；`js/ip-store.js` 的物件順序與其「順序同清單 DOM」的註解一併同步（順序對查表無功能影響，同步只為讓註解說的是真話）。
- **【D】** 新資產 `images/ip/nick-portrait.jpg`（440×440）：由 `persona/NICKTHEREAL/images/artist_2024_nick.jpg` 裁出頭肩方形，兩列的 `data-nick-img` 共用。既有 `images/projects/nick-*.jpg` 都是專輯／海報構圖（`nick-r2.jpg` 還壓著「LIVE 11.23」字樣），拿來當肖像權與聲音的縮圖讀不出「這是這個人本人」。

## 2026-07-29 · 版本切版：R 2.1 → R 2.2，併入外部協作者改版快照（D infra / 文件）

r2.1 凍結為唯讀對照存檔，開發移到 r2.2。r2.2 的內容＝我方 r2.1 ＋ 外部協作者 2026-07-29 交付的本機快照（該批未經 monorepo，只能以檔案形式整合）。

- **【D】** 建立 `site/r2.2`：先以 r2.1 原樣複製建立還原點，再覆蓋外部快照，換行由 CRLF 轉回 LF（否則 git 會被整檔假差異洗掉）。淨增 21,341 行、刪 2,414 行，涵蓋 7 個新頁、19 支新元件、字型（Satoshi ＋ 昭源黑體 ＋ LINE Seed TW 子集）與顏色／字重規則翻修，以及 create-project、event-detail 等既有頁重構。逐項差異見 `../docs/r2.1-外部改版差異-20260729.md`。
- **【D】** 資產版本字串由 `?v=r2.1` 改為 `?v=r2.2`（1,441 個連結），避免與凍結的 r2.1 在本機共用快取時互相污染。此字串仍為固定值，平常不逐次 bump。
- **【D】** 部署、預覽 server、專案與共編規則文件的預設版本一併切到 r2.2。

## 2026-07-29 · Media Vault：Fans 底下的加密媒體庫，門檻掛在每一座庫房上（A spec-derived 新增）

使用者裁示新增這支功能。原本「創作者庫房」只是 tier-benefits 權益目錄裡的一個開關列，說明寫的是「為某個分級開啟＝把整個庫房開給該分級」；實際要的是**一座座各自有門檻的庫房**，而且進門的方式不只分級，還包含買過什麼、支持過哪個專案、出席過哪一場、達成了什麼。

- **【A】** 新頁 `media-vault.html`（Fans 導航第三項，排在分級權益之後、分級設定之前——權益定義「給什麼」，媒體庫是那個東西本身）。單頁 master–detail：左側庫房清單、右主欄「門條」＋內容格。新元件 `media-vault.css`、`vault-share.css`。
- **【A】** **門條**是這一頁唯一的新視覺語彙：左邊解鎖條件（可移除的 chips），右邊觸及讀數與分級覆蓋條。設計動機——雲端硬碟把分享權限藏在選單第二層，「這座庫房現在誰打得開」永遠要多按兩下才知道，未發行素材外流幾乎都是這樣發生的。把門放進版面裡，它就不會被忘記。
- **【A】** 解鎖條件語意固定為**符合任一**（any-of），四類條件的選項直接引用既有目錄（products-store / projects-store / events-store），選單裡每一項都附上「這條規則本身觸及幾人」——創作者要選的不是一個名詞，是一群人。
- **【A】** **人數是算出來的**：`vault-store.js` 以固定種子生成 1,283 筆粉絲紀錄（tier 分佈對齊 `fans.tier.*-cnt` 的 154/359/475/295），觸及＝集合聯集，條件重疊自動去重。限量條件的天花板釘死在實際售出量（acetate 限量 50、已售 21 → 該規則最多 21 人；票券取 events-store 的 sold）。理由同 brand-campaigns 拒絕虛構平均客單價：把兩個猜測相加當成事實呈現，比不給數字更糟。
- **【A】** **分享／NFC 鑰匙**：一條加密連結，可直接送給粉絲當禮物（uses 1），或寫進 NFC 商品（uses N）由粉絲購買後碰一下解鎖。`create-product.html` 接 `?vaultkey=<代號>` 並在頁首顯示那把鑰匙，所以「已附帶鑰匙」不是分享抽屜單方面的說法。鑰匙是持有者憑證，與條件分開計算：**未領取的次數是產能不是人，永遠不進人數**；門條把「靠條件／靠鑰匙／重疊」三個數字都寫出來，總數是算出來的不是相加。撤銷會讓靠它進來的人立刻失去權限，確認句直接寫出會影響幾個人。
- **【A】** **以粉絲身分檢視**：選一個分級，側欄改顯示該級打得開的人數，0 人才標鎖。不用布林值——除分級外的條件在任何一級都只有部分人符合，布林值會說謊。
- **【B】** `tier-benefits.html` 的 `ben.vault.*` 說明改寫：舊文案「為某個分級開啟＝把整座庫房開給該分級」在新模型下已不成立，留著會直接誤導；並加上前往媒體庫的連結。
- **【D】** 新庫房預設 0 條件＝0 人進得來，門條亮紅。這不是嚇人，是事實；比預設「所有人可見」安全。

## 2026-07-28 · 粉絲價值分對外名稱全站統一為「忠誠點數 / Loyalty points」，「聲望 / Reputation」退役（B 反饋導入）

使用者圈選 Fans CRM 的「AVG REPUTATION」KPI 裁示：**這個東西全站都叫 loyalty points，不要自己發明名詞**。站上原本一個概念兩個名字——品牌合作報告、分級設定、粉絲指南三處早就寫「忠誠點數 / Loyalty points」（點數餵養分級），只有 Fans CRM 與粉絲檔案兩頁還留著舊詞「聲望 / Reputation」，讀者要自己推論兩者是同一個分數。

- **【B】** 對外文案改名（en＋zh 成對改，未新增任何 key）：`fans.sub`（排序依據）、`fans.kpi.rep`「Avg loyalty points／平均忠誠點數」、`fans.kpi.rep.tip`、`fans.col.rep` 欄名、`fan-detail.kpi.points`、`fan-detail.batch-note`、`fan-detail.repmix.title`「What drives these points／忠誠點數的來源」（英文標題不寫全稱：正上方 KPI 已寫明 Loyalty points，全稱在 364px 的卡片裡會斷成兩行、比鄰卡標題矮一截）、`fan-detail.footer2`。HTML 內的 fallback 文字同步改（i18n 套用前那一幀不會閃舊詞）。
- **【B/連帶】** `tier-settings.rules.dualgate-hint` 原文「reputation AND spend 兩道門檻」是**雙重過期**——2026-07-27 已把消費門檻移除、改成「Top %＋最低忠誠點數」，這行卻還在描述舊規則。改寫成實際的兩道門檻。
- **【C】** 移除死 key `tier-settings.gate.reputation`（消費門檻改版後就沒有任何頁面引用，留著只會把退役的詞餵給下一個接手的人）。內部 key `fan-detail.kpi.reputation(-delta)` → `.points(-delta)`，同樣是不讓舊詞在程式碼裡復活；`fans.*.rep` 這組縮寫 key 不動（`data-sort-key="rep"` 綁在九列資料上，改了得動排序接線，而 `rep` 本身不是對外名詞）。
- **【欄寬】** 忠誠點數欄 `78px → 96px`：「LOYALTY POINTS」單行需 90px，78px 會斷成兩行、標題比鄰欄矮半行。同時給 `.table-head.fan-row > *` 加 `white-space: nowrap`（欄名不該斷行），表格 `min-width` 900 → 920px。
- **【驗證】** dev server `localhost:7777`，`fans-crm` / `fan-detail` / `tier-settings` 三頁 × en / zh-Hant 雙語，量測＋1440×900 實際截圖逐頁看過：全站已無「Reputation／聲望」字樣（只剩 i18n.js 這條變更註記本身）；欄名單行 17px、標題列各欄同高 40px、欄名右緣與數值右緣同為 1128px；fan-detail 兩張並排卡片標題同一條基線；無 console error、無橫向溢位。

## 2026-07-27 · 儀表板「總收入」卡升為主角卡 · 新增 `.kpi--hero` ＋ `--on-primary`／`--brand-ink`（B 反饋導入）

使用者圈選儀表板第一塊 KPI 卡（總收入 `$24,830`）裁示「這是本頁最重要的數據，用橘色 accent」，並在確認時指明是**卡片底色、不是字**（第一版做成只染數字，已改）。同一列三塊 KPI 原本外觀完全相同（同底色、數值同為 `--fs-28` 白字），看不出哪張是主角。

- **【B】** `kpi.css` 新增 `.kpi--hero`：**整張卡實色 `--primary`**。併入既有的顏色修飾類家族（`--success`／`--warning`／`--destructive`），不另造機制。兩者不同軸：那三個是「這個數字**狀態**好不好」（verdict），`--hero` 是「這張卡**最重要**」（編輯權重）。選擇器寫 `.kpi.kpi--hero`（0,2,0）以贏過 `.card .kpi` 的巢狀底色覆寫，hero 卡放進 `.card` 系容器也不會被改回 `--input-surface`。
- **【B】** `js/components.js` `kpiTile()` 支援 `t.hero` 旗標吐出 class；儀表板 tile 定義的總收入那筆加 `hero: true`。一列只給一個，否則沒有主角。
- **【與 Q8-A「已選中」如何不撞】** 分辨靠**填底濃度＋尺度**，不是色相：**實色＝主角**（主 CTA／`.pager` 目前頁／hero 卡）、**tint 半透明＝已選中**，且已選中永遠只長在 pill／nav item 這種小控件上。沒有人會把一整張實色橘的卡讀成「這張卡被我點選了」。實色橘在本系統一直代表「主角／主要動作」，一張實色橘的卡＝本頁主角，語彙一致。
- **【B/token】** `_tokens.css` 新增 **`--on-primary`**（`#171717`，亮暗同值）＝鋪在實色橘上的墨色。**不能用 `--primary-foreground`**：它亮色是白字（使用者 2026-06-22 指定），白對 `#ffa33f` 只有 **1.99:1**、連 large text 3:1 都不到；小面積按鈕文字沿用不動，但鋪滿一整張卡會不能讀。深墨對橘 **9.02:1**（過 AAA）。另新增 `--brand-ink`（light `#8F4E00`／dark `#ffa33f`）＝「橘當字放在**非橘**底上」的唯一來源，`--selected-ink` 改為其語意別名（值不變、視覺零差異）。兩條規則分工清楚：橘字在非橘底 → `--brand-ink`；字在實色橘底 → `--on-primary`。
- **【delta 膠囊：保留設計，只換墨色】** 使用者裁示「綠色半透明的設計要保留，只是不要黑底」。**膠囊配方一個字沒改**（12% 半透明染色＋pill＋內距），改的是兩件事：
  - **底不再把卡色烤進去**：`color-mix(…, var(--card))` → `color-mix(…, transparent)`。對深卡是**數學上的 no-op**（12% 色混不透明 `--card`，與 12% alpha 疊在 `--card` 上，合成結果相同；實測仍 7.06:1、events.html 截圖比對外觀一致），但改成 transparent 之後膠囊會「跟著它實際坐的面走」，黑斑的根因（`--card` 早就不是 hero 卡的底色）就消失了。
  - **hero 卡＝深綠半透明底＋白字**（使用者提案的最終版）。形狀語彙完全不動：一樣的 pill、一樣的內距、仍然是半透明染色——改的只有「染多深」與「字色」。理由：12% 淡染疊在飽和橘上色相幾乎不位移（合成 `#e9aa47` vs 卡的 `#ffa33f`），綠撐不起來、只能靠墨色暗示；改成深綠底之後「綠」由**底本身**承載，字換白，識別與對比同時變強，也不再需要把墨色壓到 green-950 那種近黑的深度。**仍然半透明**（90% 而非 100%）——橘從底下透 10% 上來把綠暖化，像長在這張卡上而不是貼上去的色塊。這也是它跟先前被否決的「純黑底」的本質差異：那是中性黑、讀起來就是一塊黑斑，這是**有色相的深綠**，一眼還是綠的。
  - **墨色跟著面走、不跟著主題走**：fill 與 ink 成對抽成 token（`--status-success-fill`／`-ink`／`--destructive-fill`／`-ink`，深階值 `--status-success-deep` `#14532D`／`--destructive-deep` `#881337`），由 `.kpi--hero` 在卡片這一層**整組**重新定義，custom property 往下繼承到膠囊，亮暗兩主題同時成立，不必比特異性也不用 `!important`。關鍵認知——**實色橘卡在深色主題底下依然是一個「亮底」**，所以主題型 token（像 `--brand-ink`）解不了它。
- **【連帶修掉兩個既有缺陷】**（都不是本次新增，是這次量測才浮出來的）：亮色主題下 delta 綠字對淡綠膠囊只有 **2.05:1**（全站所有 KPI）；深色主題下 `--neg` 紅字只有 **3.19:1** —— 紅墨當初漏接了 2026-07-21 為此新增的 `--status-error`（它的存在理由正是「深底小字徽章 `#E7000B` 太深不易讀」），換上後 4.35:1 仍不足（12px semibold 屬 normal text，門檻 4.5 不是 3），用 `color-mix(--status-error 88%, #fff)` 再提一階才過。
- **【試過但退場的四版】** 純黑底（否決）、白色薄膜（否決）、完全不要底（否決——膠囊不再讀作「綠的」，犧牲色相識別）、深綠字配 12% 淡染底（可讀但綠仍撐不起來，被使用者提案的深綠底＋白字取代）。最終版是唯一同時滿足「半透明染色膠囊」「無黑底」「一眼是綠的」「對比達標」四個條件的解。
- **【實測對比】** 八種組合（hero／一般 × 正／負 × 亮／暗）全數 ≥4.5:1：hero 正 **7.94**、hero 負 **8.29**（亮暗同值，因為卡在兩個主題都是橘）；一般卡 正 7.06／13.44、負 4.84／13.10。hero 膠囊合成色 `#2c5b2f`／`#942138` 配白字。
- **【label／meta】** 用同一支深墨壓透明度做層級（不另挑灰，灰在橘底會發濁）。
- **【驗證】** dev server `localhost:7777`。實測合成後對比：value **9.02:1**、label **6.33:1**、meta **6.85:1**、delta **9.02:1**，全數過 WCAG AA（value 過 AAA）。三塊 KPI 量到同高 150px、同 top 108px，換色未動版面。亮暗雙主題截圖確認（亮色卡底同為 `rgb(255,163,63)`、字同為 `rgb(23,23,23)`）。版本字串沿用凍結的 `?v=r2.1`。

## 2026-07-27 · Q8 反轉：「已選中」狀態全站統一用品牌橘（B 反饋導入）

使用者截圖圈出側欄的已選項（Dashboard），裁示「highlighted features must use our accent color across all pages or tabs」。這推翻了 2026-07-13 的 Q8-B（橘只給主操作、導覽／篩選已選一律中性灰）。反轉前站上同一件事「這個被選中了」有**四種答案**：側欄／settings-nav 中性灰底、`.chip--active` 反白黑底、`.segmented__btn--active` 白色浮起 pill、`.filter-tabs__item--active` 灰底（16 個 consumer 頁裡只有 9 個加了 `--brand` 修飾類才是橘）——只有 `.tabs` 一直是橘。

- **【B】** `_tokens.css` 新增三個 token × 亮暗兩套：`--selected-surface`（`color-mix(--primary 14%, transparent)`）／`--selected-surface-hover`（20%）／`--selected-ink`。用 `transparent` 混色而非混 `--card`，所以同一個 token 疊在 rail、card、page 任何底色上都自動貼合，不必分別調。
- **【B】** tint 形態改吃新 token：`shared.css` 的 `.app-sidebar__link[aria-current]`／`--active`／`.app-sidebar__sub-link[aria-current]`（各補一條 active-hover，否則已選項滑過去沒有回饋）、`settings.css` 的 `.settings-nav__item--active`、`filter-tabs.css` 的 `.filter-tabs__item--active` 與其計數泡泡、`chip.css` 的 `.chip--active`。icon 走 `currentColor`，跟著文字一起變橘、不必另寫。
- **【B】** `segmented.css` `.segmented__btn--active` 與 `chart.css` `.segmented__item--active` **只換字色、保留白色浮起 pill**。浮起是這個元件的結構語彙（iOS segmented 的實體隱喻），把底染橘會讓「一塊被抬起來」讀成「一塊被塗色」。`header.css` 的 `.app-topbar__link[aria-current]` 改橘字、底色仍留給滑動 highlight pill，不疊第二層底。
- **【為什麼是 tint 不是實色】** 實色橘保留給主 CTA 與 solid 形態（`.pager` 目前頁）。導覽＋篩選＋分頁若全用實色橘，一個頁面會同時出現三四塊實色橘跟 CTA 互搶，DESIGN.md 的 One Spotlight Rule（橘 ≤ 10% 畫面）當場破功。tint＋橘墨水讓「橘一定在場」與「實色橘只有一個」兩件事同時成立。
- **【a11y 硬需求】** `--selected-ink` 必須亮暗分色。`#ffa33f` 對亮色 rail（`#FBFBFB`）只有 **1.92:1**，遠低於 WCAG AA——這個坑站上已經踩過一次（`tag-input` 的 `color: var(--primary)`）。亮色版壓深成同色相 32° 的 `#8F4E00`：對 `--sidebar` **6.23:1**、對 14% 橘 tint 合成底 **5.70:1**，且過 APCA body-text。深色版維持 `#ffa33f`：**8.49:1**／**6.44:1**。
- **【C 撤除】** 橘變成基底後兩組覆寫變成純重複，已刪：`filter-tabs.css` 的 `--brand` 四條顏色規則（只留它真正獨有的「計數不加泡泡」，9 個 consumer 頁的 class 不必動）、`tag-input.css` 的 `.chip--active` 三行（Q19 的意圖由基底承接，順帶修掉上述亮色對比 bug）。
- **【刻意不動】** `.radio-card` 的標題維持 `--foreground`（`.radio-cards .segmented__btn` 的 `color` 以 0,2,0 壓過 active 的 0,1,0）——卡片有標題＋副標，整段染橘等於在讀橘色內文；它的橘落在右上實心標記點與 `.radio-card__icon`，所以「已選一定有橘」仍成立，已在 `radio-card.css` 加註解避免日後被當成漏改。`.filter-tabs--source` 不受管轄（每項取自己資料序列的顏色，色彩＝該筆資料本身，不是選取記號）。`.tabs` 的橘底線／橘 `::after` 與 `.pager` 實色橘本來就合規，未動。
- **【驗證】** dev server `localhost:7777`。36 頁 same-origin iframe 掃描（cache-busted）：tint 形態全數量到 `rgb(255, 163, 63)`，`.tabs` 的橘在 `::after`／`border-bottom`、`.selection-card` 的橘在 `outline`、`.radio-list` 的橘在 `::after` — 皆確認在場。亮暗雙主題各截圖確認。`check_ds_sync.py` **本機不存在（未執行）**。版本字串沿用凍結的 `?v=r2.1`。

## 2026-07-27 · 活動詳情：分頁依生命週期階段顯示 ＋ 新增「交易明細」分頁（A spec-derived 新增）

使用者指定：不同階段該有不同分頁；售票中與進行中需要一個顯示每筆銷售紀錄的分頁（站上原本沒有）；已排程與草稿不需要名單與報到、退款、收支、以及新的交易明細。並指示移除頁首的樣本資料說明橫幅。

- **【A/原則】** 推導矩陣的原則：**一個分頁只在「它管的東西可能存在」時才出現**（不逐頁挑選）。每個分頁都是一句「這裡有東西可看」的宣稱；草稿顯示「名單與報到」是資料兌現不了的承諾，久了使用者就不信任整排導覽。前置條件：總覽／票種＝永遠；通知＝要有可通知的對象（草稿沒有觀眾）；交易明細／名單／退款／收支＝要有金流或持票人；系列＝這場活動真的屬於某個系列。
- **【A/矩陣】** 草稿：總覽 · 票種｜已排程：＋通知｜售票中／進行中／已結束：＋交易明細 · 名單與報到 · 退款 · 收支｜系列：任何階段，但**僅在該活動有系列時**。使用者只點名了「已排程與草稿不需要那四個」，其餘由上述前置條件推出（草稿 ⊂ 已排程 ⊂ 有金流的三個階段）。
- **【A/新分頁】** 交易明細：一列一筆訂單（不是一張票——很少有人只買一張），欄位＝訂單／買家／票種／張數／金額／平台費／淨額／付款方式／狀態，上方摘要＝收款總額 · 平台費 · 實收淨額 · 已退款，另有全部／已付款／已退款篩選。**它回答的問題與既有分頁都不同**：名單問「誰會來」、收支問「這場賺不賺」，交易明細問「收入 KPI 那個數字由哪些款項組成、每一筆後來怎麼了」——對帳與爭議處理面。
- **【A/資料一致性，最重要的一條】** 交易由 store 依票種決定性地生成，且**已結算金額加總恆等於該場次的 revenue**——否則這張表會跟頁首的收入 KPI 互相打架，整個 console 的可信度就沒了。退款筆是**額外**附加、不計入加總（退掉的票已回庫存、不在 `sold` 裡）。為了讓恆等式成立，順手修掉一個既有矛盾：Chongqing 的票種單價 × 售出＝30×72+60×12＝2,880，與 revenue 2,520 不符（是我先前照清單列的收入數字反推票價時留下的），GA 調成 25 後 25×72+60×12＝2,520。**七個有金流的場次全部驗過**：settled sum ＝ revenue ＝ 票種單價×售出，且結算張數 ＝ sold。
- **【A/系列】** 上一輪我把「Series 2 of 3」整列藏起來（store 沒有這欄位、對粉絲見面會是不實陳述），但那讓系列分頁永遠沒有內容。改為在 store 補上 `series` 欄位：兩場 REALIVE 巡演與兩場 LOVE·RAGE·HOPE 有值，其餘明確為 `null`。於是系列列、頁首徽章與系列分頁都只在真的有系列時出現——**治本，不是壓症狀**。
- **【C/撤除】** 移除頁首的樣本資料說明橫幅（使用者指示）。
- **【修正】** 分頁控制器的 `names` 原本是寫死的字串陣列，新增分頁後 `#transactions` 這個 hash 會被它擋掉；改為從 DOM 推導，日後新增分頁不必再回來改。同時把「哪個分頁作用中」收斂為**只有分頁控制器一個擁有者**——我的階段矩陣只負責可見性，兩邊都想決定同一件事就會互相覆蓋。控制器並補上：hash 指向被藏起來的分頁時退回第一個可見分頁。
- **【修正】** 「Across 3 tiers」是寫死的示例值（該場只有 2 個票種），改為跟著資料走，並補單數字串（`Across 1 tier`，實測已結束場次原本印出「Across 1 tiers」）。
- **【驗證】** Playwright：五個階段逐一導覽驗證可見分頁集合＝矩陣（草稿＝總覽/票種/系列——該草稿屬於 REALIVE 巡演故有系列；已排程＝總覽/票種/通知；售票中與已結束＝八個全開；進行中＝七個，無系列）。**深連結陷阱**：草稿場次開 `#refunds` → 退回總覽且確實有面板渲染（`blankPage: false`），不是白畫面。**無 `?id=` 不受影響**：八個分頁全顯示，行為與先前相同。交易明細金額對照：Chongqing 收款總額 $2,520 ＝ 收入 KPI $2,520、平台費 −$270、淨額 $2,250、63 筆訂單/84 張票；內圈見面會 $50,000／−$5,000／$45,000／150 筆訂單/200 張票，晶片計數 152/150/2 與渲染列一致。中英雙語標籤正確。
  - **過程記錄**：`#transactions` 一度看似無效，實際原因是 Playwright 導向「只有 hash 不同」的網址不會重新執行頁面腳本，我讀到的是上一次點擊留下的舊狀態；改為先導去別頁再導回，深連結即正確啟用。這是量測方法的問題，不是程式的問題——但若不追到原因，就會去「修」一個根本沒壞的東西。
- **【本輪未做，刻意說明】** 票種明細／退款／通知／收支四個分頁的內容仍是示例資料，尚未改由 store 渲染。使用者這次要求變成真實資料的是交易明細與名單，其餘是另一個可分離的較大工作。

## 2026-07-27 · 進行中活動：現場報到台（即時到場人數 ＋ 掃碼連結分享）（A spec-derived 新增）

使用者要求：進行中的活動要有真實的 mock 資料、到場人數的即時計數（誰到了、誰還沒到），並在介面上給出掃碼器連結、可複製、可用任何通訊軟體傳出去。

- **【A/資料】** `js/events-store.js` 新增 `inner-circle-taipei`（內圈粉絲見面會 · 臺北，**日期＝今天 2026-07-27**、200/200 售罄、$50,000）。日期必須是今天，否則「進行中」會跟它自己顯示的日期打架。並新增 `roster()`：由固定名單池**決定性地**生成 200 筆到場名單（不用 `Math.random`，同輸入同輸出，截圖與計數斷言才穩定）。
- **【C/撤除】** 移除上一輪 events.html 裡「用 Cheat Codes `eventDay` 把最近一場售票中推導成進行中」的權宜作法。當時沒有 live 資料才需要那個推導；現在有真實的一列，同一件事不留兩個真相來源。`eventDay` 仍驅動情境橫幅，只是不再偷改任何一列的階段。
- **【A】** `event-detail.html` 開始讀 `?id=`（此前完全不看，從清單點哪一場看到的都是同一份寫死的示例）。填入 store 真的有的欄位：頁首徽章／標題／日期場地、KPI 列、總覽的活動詳情、名單分頁。其餘分頁仍是示例內容。
- **【A/現場報到台】** `status==='live'` 時，總覽右欄由「報到快照（活動當天才開）」換成現場報到台：脈動的 live 點、`已進行 N 分鐘`、**到場 / 售出**大數字＋百分比＋進度條、到場／未到場兩格、`最近 5 分鐘 N 位` 的到場速率。售罄場次的售出率是常數 100%、沒有資訊量，**現場唯一會動的數字是到場率**，故頭條放它。計時器約每 4 秒一位（`prefers-reduced-motion` 時放慢並停用脈動與跳動）。
- **【A/名單】** 名單分頁在進行中場次改為即時名單，篩選＝全部／已到場／未到場，計數與報到台一致。**排序＝最新報到者在最前**：原本照原順序排，剛掃進來的人在第 145 位、落在只渲染 40 列的視窗外，「剛到」的標記等於做了看不到（實測 `newestArrivalHighlighted: false`）。
- **【A/掃碼連結】** 沿用取貨場次同一組 `.scanner-access` 元件（QR＋連結＋密碼），現場人員兩邊看到同一個東西。**「送到任何通訊軟體」＝ `navigator.share()` 叫出系統分享面板**，裡面是那台裝置真正裝了的 App——而不是我列一排 WhatsApp/Line/Telegram 按鈕（那種清單永遠會漏、深連結也各平台各壞法）。沒有 share API 的環境退回複製，並把按鈕文字改成「已複製——貼給現場人員即可」：按了沒反應比沒有這顆按鈕更糟。顯示的就是**可以直接開的絕對網址**，不做「顯示一個、複製另一個」。
- **【A】** `scanner.html` 新增 `?event=<id>`：收到連結的現場人員第一眼要知道這是哪一場的掃碼器，故頂列場次名稱與頁面標題換成該活動。沒帶參數時行為完全不變。
- **【驗證】** Playwright 1440×900：
  ① **反面案例先驗**——`?id=realive-chongqing`（非進行中）**不**顯示報到台、維持原本的報到快照與示例名單；壞掉的條件式只會在這裡露出來。
  ② 數值對照 store：200/200、$50,000、頁首日期場地與 `ztorEvents.get()` 一致。
  ③ 即時計數：9 秒內 142→145 單調遞增，且每次取樣 `到場+未到場＝售出200`。
  ④ **上限用強制邊界驗證**（暫時把 `arrivedAtOpen` 改 198、重載、觀察 18 秒）：到 200 後停住、六次取樣都是 200、未超賣、未到場歸零、100%；驗畢改回 132。
  ⑤ 篩選晶片計數＝報到台數字（134/66），已到場檢視全為已到場、未到場檢視全為未到場。
  ⑥ 掃碼連結 `fetch` 回 **HTTP 200**；`scanner.html?event=…` 的場次名稱與標題確實變成該活動；複製路徑攔截 `writeText` 驗證寫入的是絕對網址、按鈕回饋「已複製連結」。
  ⑦ 活動清單 6×4＝24 種組合的計數恆等式重跑仍全數通過（Live 1、全部 11）。
  ⑧ 中英雙語、無溢出、無水平捲動。
- **【讀圖後修掉的三個缺陷】**（截圖逐格核對才發現，不是跑完就算數）：
  - 類型徽章印出 `Meet &amp; Greet`——字典值本身帶 HTML entity，用 `textContent` 會原樣印出，改 `innerHTML`。
  - 總覽「活動詳情」的值寫進了標籤格（Type 那列顯示日期、第二列標籤變成場地字串）——`.data-list__row span:last-child` 會連 `.data-list__row-main` 裡的標籤 span 一起選中，改用 `> span:last-child` 限定直接子層。
  - 頁首徽章、詳情列與頁尾殘留示例的系列／直播權益資訊（粉絲見面會顯示「Series 2 of 3」「VIP 含直播」），store 沒有這些欄位，整列與徽章收起、頁尾改成該活動名稱——不留半真半假的陳述。
- **【已知限制】** 到場計時器是原型示意（固定節奏、不接真實票務系統）；`startedMinutesAgo` 是資料裡的固定值、不接真實時鐘；名單只渲染前 40 列（下方註記說明總數）。

## 2026-07-27 · 活動清單兩排篩選重構：生命週期 × 活動類型（B 反饋導入）

使用者指定第一排改成 live／on sale／scheduled／past／draft，第二排改成活動類型三分法（並註明「不是硬性規則，是方向」）。

**為什麼這個重構同時修掉一個既有 bug**：舊的第一排是時段（Upcoming／Past）、第二排混了銷售狀態與草稿。草稿沒有日期，兩個時段分頁都容不下它，所以才需要 D060/D033(c) 的「草稿跨時段顯示」特例——而那個特例讓計數自相矛盾：Past 檢視實測 All 2、On Sale 0、Draft 1，`0+1≠2`，且那個 Draft 指向一列當下分頁根本顯示不出來的資料。新軸把草稿與已結束都納入同一條生命週期，特例連同矛盾一起消失。

- **【B】上排＝生命週期階段**（互斥，規則「取走到最遠的那一階」：當天開演即使現場仍在售票也算進行中）：**全部 · 進行中 · 售票中 · 已排程 · 草稿 · 已結束**。
  - **與使用者列出的順序有兩處差異，明列**：
    - 補上「全部」——五個互斥階段若無全部，就再也看不到完整清單，等於我引入一個退步。
    - 「已結束」移到最後（使用者原列在草稿之前）。

    理由：已結束是唯一純檔案性質的桶（用來回顧、不用來行動），草稿則是還沒做完的工作，該和其他活躍階段放在一起。排序原則＝注意力優先，不是生命週期順序。
- **【B】下排＝活動類型**：**全部 · 演唱會 · 粉絲見面會 · 線上活動**。判準＝「核心是不是一場實體聚集」：實體演出的線上直播仍歸演唱會（錨點是那場實體演出），純線上才歸線上活動。建立流程六型別的對應表寫在 `js/events-store.js` 檔頭（**單一出處**）：concert／festival → 演唱會｜meet／launch → 粉絲見面會｜virtual／watchparty → 線上活動。
  - **兩個要使用者裁示的判斷題**：
    - `launch`（發片派對）歸粉絲見面會——它比較像近距離慶祝而非售票演出，但若有表演成分也可歸演唱會。
    - 定義本身的邊界——粉絲見面會是用「實體近距離接觸」定義、線上活動是用「媒介」定義，所以線上的粉絲互動兩者皆符合，依使用者原話「any online interaction events」歸線上活動。

    這條規則會決定日後所有邊界案例，故明寫出來。
- **【B/計數規則】** 上排＝整份清單各階段總數（不隨下排變動，切類型時上排數字不會在游標下亂跳）；下排＝目前階段之內的類型分佈。恆等式：下排各類型相加 ＝ 下排全部 ＝ 上排選定分頁。搜尋是第三個 AND 條件但**刻意不改寫任何計數**——會默默改掉分頁宣稱數字的過濾器比不改更糟。
- **【B/資料】** 每列由 `data-period`＋`data-status` 換成 `data-stage`＋`data-category`，每條軸各一個值，過濾與計數都變成單純的 filter，無任何特例。`events-store.js` 同步加 `category`。
- **【B/示範資料】** 新增一場「專輯簽名會 — 臺北」（`album-signing-taipei`，售票中、118/150）。**原因**：既有九場全落在演唱會與線上活動，粉絲見面會在每個檢視都是 0，那個晶片就無法被評估、看起來像壞掉。屬為了讓設計可被判斷而加的示範資料，**不需要時把 events.html 那一列與 store 那筆一起刪掉即可**，已在兩處標註。
- **【B/進行中】** 「進行中」＝今天就是開演日。清單是靜態的、所有場次都在未來，硬把某列寫死成進行中會跟它自己顯示的日期打架（Oct 25, 2026 不可能是今天）。改接既有的 Cheat Codes 情境開關（`ztorDevState.eventDay`，與 `js/scenario.js` 同一個來源）：設 `live` 時把最近一場售票中視為進行中；沒開情境時 Live 誠實顯示 0。
- **【驗證】** Playwright 1440×900：**6 個階段分頁 × 4 個類型晶片＝24 種組合逐一驗證**，每格都檢查「實際顯示列數 ＝ 該格宣稱數字」且恆等式成立 → 全數通過（全部 10＝7+1+2、售票中 4＝1+1+2、已排程 3、草稿 1、已結束 2）。Live 情境：切 `eventDay=live` → 進行中 0→1、售票中 4→3（總數守恆），關掉還原 0。空組合（草稿×線上活動）正確隱藏清單並顯示空狀態。搜尋 "signing" → 1 列且上排計數不變。中英雙語標籤皆正確、控制列無換行無溢出。十列的 kebab 編輯連結重新驗證一一對到自己的活動。

## 2026-07-27 · 編輯活動：圖片區改成「顯示現有素材」＋新增票種鈕間距（B 反饋導入）

使用者指出編輯頁的圖片區是四個空的上傳框，卻同時寫著「已上傳 3 / 4」——編輯的前提就是先看見現在是什麼，這裡等於要創作者離開頁面、去前台找出目前上線的是哪張海報。另指出「新增票種」鈕貼死在最後一張票種卡上。

- **【B/元件】** `partials/upload-tile.js` 新增 `data-upload-src` 支援：有值就直接進 `is-filled` 並掛上縮圖，不跑假上傳計時。**為什麼加在共用元件而不是頁內**：這支此前只認得「使用者剛選的檔案」（`createObjectURL`），沒有「這格在伺服器上本來就有圖」這個狀態，而那正是所有編輯流程的常態（edit-product／edit-auction 之後需要的是同一件事）。屬**純新增**——沒有這個屬性的 tile 行為與先前完全相同。
- **【B】** `edit-event.html` 圖片區改用 `[data-upload]` 互動增強器，於是**縮圖／hover 替換／AI 優化／移除**全部沿用既有元件，未自造任何互動。三個具名槽各自帶自己的比例修飾詞（`--1x1`／`--3x4`／`--16x9`），槽位因此預覽真實裁切，不再是三個一樣的方框。
- **【B】** 加了一行 caption（縮圖 · 1:1／直式海報 · 3:4／橫式橫幅 · 16:9）。**原因**：tile 一旦有圖，元件就會隱藏它自己的 `__title`，三張圖並排時認不出哪張是海報。建立流程沒這問題（空框都有標題），故 caption 是編輯態特有需求，留在頁內。
- **【B】** 相簿（1–8 張）改成獨立一列、**一張圖一格**＋尾端恆留一個空格可再加，並顯示「2 / 8」計數。單一格表達不了 1–8 張，也無法逐張移除。
- **【B/資料】** `js/events-store.js` 的 `images` 由 `true/false` 改成**實際路徑**，`gallery` 為陣列。`thumb` 沿用活動清單那一列在用的圖檔（同一場活動不該在兩個畫面長不同的臉），`poster`／`banner`／`gallery` 各自不同素材——具名槽本來就是不同的成品，全部指同一張看起來像壞掉。草稿場次刻意四格全空，順便涵蓋空狀態。
- **【B】** 圖片變動一律由元件的 `upload:change` 事件回報，頁面只負責寫回 `images` 並重算髒值，不自己攔點擊——替換／移除才不會有兩套真相。原型不真的上傳，新選的檔案記成 sentinel `(new upload)`，不偽造一個看似已存檔的 URL。
- **【B】** 粉絲視角預覽卡改放真正的海報圖（建立流程只能塗實色，因為那時還沒有圖）；未存檔的新檔案沒有可顯示路徑，退回實色示意而不是掛一個壞掉的 `<img>`。
- **【B】** `#ee-tier-add` 補 `margin-top: var(--sp-24)`。**成因**：區段間距來自 `.form-section--outlined ~ .form-section--outlined`，只在兩個 outlined section 之間生效；這顆是 `.btn`，完全沒吃到，實測間距 0。用同一個節奏補回，不另訂數值。
- **【修正】** 語言切換後重繪動態節點：`i18n:applied` 追加 `renderGallery()`／`renderTiers()`。i18n 只重寫帶 `data-i18n` 的節點，相簿格與票種列是 JS 生成的，切 en 後仍留著「第 1 張／新增圖片」。
- **【驗證】** Playwright 1440×900：三個具名槽 `naturalWidth` 675／400／400、相簿 400／618（**量解碼後尺寸而非只看 `<img>` 存在**——壞掉的路徑一樣會有元素），槽位量到 200×200／150×200／356×200 即三種比例皆生效；按元件自帶的移除鈕 → tile 轉 `is-empty`、空狀態提示回來、總覽由「4 / 4」變「3 / 4」、主動作變「儲存 1 項變更」、總覽 Images 列標「已變更」；移除相簿第一張 → 計數 2/8→1/8、格數 3→2；新增票種鈕間距由 0 變 24px；中英切換兩次後圖片仍在、且未產生假髒值（主動作維持 disabled）。
- **【回歸】** 因為動到五頁共用的 `partials/upload-tile.js`：`create-product.html` 11 個 tile 仍全部 `is-empty`、縮圖隱藏、提示文字可見；`project-detail.html` 3 個既有 `is-filled` tile 狀態不變。兩頁皆無 `data-upload-src`，走原路徑。

## 2026-07-27 · 新增「編輯活動」頁 edit-event.html（A spec-derived 新增）

使用者指出活動詳情頁的「編輯活動」鈕連到 `create-event.html`＝建立新活動流程，「totally wrong」：欄位全空、語彙是建立（儲存草稿／發布／五項發布前檢核），等於叫人把活動重寫一次。要求另做編輯頁，可沿用建立流程的介面，但**使用者自己挑要改哪一段**，且**所有欄位都要帶入當初填的值**。

**設計判斷（編輯 ≠ 建立，逐項說明為什麼）**

- **【A】落地畫面＝建立流程的最後一頁。** `create-event` 的 Review 步驟（`review-row`：區段名＋現值＋「Edit →」）本來就是編輯流程最理想的大門，故直接把同一個元件當成 Overview 落地區段，不另造 hub 元件。建立以它收尾，編輯以它開場——同一個零件，反向使用。
- **【A】進度條 → 區段導覽。** 中欄由 `.progress-stepper`（有序、有填充、只能回點已完成步）改成 `.tabs`（四個平等的去處、全部解鎖）。編輯沒有「進度」只有「位置」，填充條在這裡是在說謊。四個去處＝總覽／活動內容／場地與時間／票券。
- **【A】不自動儲存，改明確儲存。** 建立流程全程 autosave（還沒公開，存了不痛不癢）；編輯的對象是已開賣的活動，邊打字邊把改動推給已購票者不可接受。故 `.wizard[data-autosave="false"]`（`wizard-chrome.js` 既有的 fallback 開關，非新契約），主動作＝「儲存變更」，**髒值才可按**，按鈕帶變更計數（`儲存 2 項變更`）。
- **【A】離開前看得見自己改了什麼。** 動過的區段在 Overview 列標「已變更」徽章＋列名轉主色；比對基準是**開頁時的值**而非上一次輸入，所以改了又改回原樣時記號會自己消失。抵達與離開都在同一面鏡子前。
- **【A】後果分級（編輯頁真正的工作）。** 已售 84 張＝與 84 個人的約定，故欄位依影響分四級：安全（文案／圖片，隨時可改）｜**會通知到購票者**（日期／時間／場地／地址——改動後才就地顯示 `alert--row` 說明，沒改就不嘮叨）｜**受已售出限制**（容納人數不可低於已售張數，是驗證不是提醒；已售出的票種不可刪、只能停售）｜**鎖定**（活動類型開賣後不可改——以鎖定列＋原因呈現，不是藏起來，消失會讓人以為壞了）。狀態橫幅只在頁首講一次（售票中 · 已售出 84 張 · 日期），各區段只帶自己的後果說明。
- **【A】建立流程的專屬零件全部拿掉**（Jony 減法）：發布前五／七項檢核（那是首次發布的閘門，已上線活動早就過了）、儲存為草稿（已發布的活動沒有草稿態）、發布 gating、自動儲存 pill、活動類型作為可走的步驟。保留粉絲視角預覽——編輯文案／圖片時「粉絲會看到什麼」正是後果本身，且一律以現有資料開場、不是空殼。

**檔案與接線**

- **【A】** 新增 `edit-event.html`。**零新增 ds-components**：button／badge／alert／tabs／form-section／form-grid／upload-tile／card／input／date-input／preview-panel／event-preview-card／leave-dialog／review-row／amount-field 全部沿用；頁內 `<style>` 只留本頁 layout hook（比照 create-event／events 的既有作法）。
- **【A】** 新增 `js/events-store.js`（9 筆活動 mock，比照 products-store／films-store 的既有作法）。**為什麼要有**：編輯頁的每個欄位都要帶「當初填的值」，若直接寫死在頁面裡，同一場活動的名稱／場地／票數就會有第三份各自漂移的副本（清單一份、詳情一份、編輯頁一份）。數值刻意與清單列上看得到的事實一致。
- **【B】** `event-detail.html` 的「編輯活動」→ `edit-event.html?id=…`（原本指向 create-event）。`events.html` 九列 kebab 的「編輯」同樣改指 `edit-event.html?id=…`，**逐列對到自己的活動**（已驗證九列 id 一一對應，不會點 A 開到 B）。
- **【D】** `js/sidebar.js` 的 Events `match` 與 `FULL_ROUTES`、`js/devtools.js` 路由表補 `edit-event.html`。
- **【D】** i18n 新增 `ee.*` 一組（en／zh-Hant 成對）。共用欄位標籤（活動名稱／場地／時間…）**刻意沿用 `ce.*`**——同一個欄位在兩個流程不該有兩套譯法；`ee.*` 只收編輯態自己的語彙。

**【驗證】** dev server（`localhost:7777`，`serve-local.py` no-store）＋ Playwright 1440×900：
① 預填——`?id=realive-chongqing` 讀出名稱／場地／日期／容量 120／兩個票種皆正確，副標＝活動名稱。
② 髒值——改日期→「儲存 1 項變更」、時間列標「已變更」、時間區段的通知說明現身；再改名稱→「儲存 2 項變更」；把日期改回原值→退回 1 項、記號與說明同步消失。
③ 硬限制——容量填 500（< 已售 10,000）→ 欄位 `is-invalid`＋`aria-invalid=true`＋「不可低於 10,000」；已售票種的刪除鈕 disabled 並帶原因 title。
④ 雙語——en／zh-Hant 皆單行不折、日期時間各走該語系慣例（`Oct 25, 2026 · 8:00 PM`／`2026/10/25 · 晚上 8:00`），千分位與清單一致（10,000 非 10000）。
⑤ console 僅剩既有的 favicon 404（`radio` 圖示未註冊的警告已藉改用既有 `ticket` 圖示消除，未新增圖示）。
版本字串沿用凍結的 `?v=r2.1`。`check_ds_sync.py` **本機不存在（未執行）**；本輪未新增／修改任何 `ds-components/*.css`。

**【已知債】**（刻意選擇，不是意外）
1. **欄位標記重複**：`edit-event.html` 的欄位骨架與 `create-event.html` 平行存在，兩邊可能漂移。選擇獨立頁的理由：使用者要求的互動模型與建立流程實質不同（hub 落地、全解鎖、變更追蹤、後果分級），硬掛進那支 935 行、已有五步狀態機＋共看派對分支的頁面，等於日後每次改建立流程都要同時推理兩套 IA。緩解：欄位標記結構、`data-*` hook 與元件全部與 create-event 對齊，日後要收斂是機械式工作。**站內另有前例可收斂**：`create-product.html?edit`／`create-auction.html?edit` 是「同頁 ?edit 切編輯態」的作法（標題改 Edit、主動作改 Save changes、顯示 Delete、不擋上架）——要不要三者統一成同一種編輯範式，是產品層決定，待使用者裁示。
2. **`shared.css` 的 latent bug 未根治**：`.wizard__top-lead` 的 `justify-self: start` 讓它以 max-content 計寬、可溢出自己的 grid 軌道；副標夠長就會壓到中欄（本頁副標＝活動名稱，實測 lead 320px vs 軌道 204px、蓋過導覽 100px）。本輪只在 edit-event 頁內以 `max-width:100%` 收斂；根治要改 `shared.css`，那支 7 個建立頁共用、屬跨頁改動，另案處理。
3. **清單與詳情尚未改由 store 渲染**：`events.html` 的列與 `event-detail.html` 仍是靜態 HTML，值與 store 一致但非同源。`event-detail.html` 也還沒讀 `?id=`（編輯頁的返回／儲存後導向已帶上 id，屆時可直接生效）。
4. **狀態橫幅顯示的是「已儲存的事實」**：改了日期後橫幅仍顯示原日期（那正是已購票者現在相信的資訊），與表單裡的未存新值並存於同一畫面。屬刻意設計，但兩個參照系同框，若使用者覺得混淆可再調。

## 2026-07-27 · 活動頁「平均出席」KPI 改成百分比率（B 反饋導入）

使用者在 `events.html` 的 KPI 列點名第四塊：平均出席應該是百分比。原本顯示絕對人頭數 `76`，標籤「平均出席」、註腳「來自報到資料」——人頭數跨場地不可比（120 人 livehouse 的 76 人跟 10,000 人小巨蛋的 76 人是兩件事），同一列的另外三塊（活動總數／已售票數／總收入）各自是可加總的量，只有這塊需要的是比率。

- **【B】** `events.html` 第四塊 KPI：值由 `76` 改 `91%`；標籤 `events.kpi.avg` 由「平均出席 / Avg attendance」改「出席率 / Attendance rate」；註腳 `events.kpi.avg-meta` 由「來自報到資料 / From check-in data」改「已報到 ÷ 售出 / Checked in ÷ sold」。
- **【為什麼是「已報到 ÷ 售出」】** 這塊的軸線是「買了票的人到底有沒有來」（出席品質），跟已售票數（需求）、總收入（金額）不重疊；註腳直接寫算式而不只寫資料來源，分母才不會被誤讀成場地容量——容量利用率在清單「票券」欄的進度條已經看得到。
- **【標籤長度】** 先試「平均出席率 / Avg attendance rate」＋「已報到 ÷ 售出票數」，量到標籤與註腳都折成兩行、該塊 tile 由 126px 撐到 158px、跟左邊三塊的底線對不齊。「平均」對一個 rate 是贅字，砍掉後中英各自單行、四塊等高。沒有為此加任何 CSS。
- **【範圍】** 只動這一塊 KPI 的文案與數值；沒有改任何元件 CSS、沒有動清單列、沒有動 `event-detail.html` 的報到三色統計（那裡仍是活動當日才開的「—」）。全站只有這一處出現出席率，無其他 consumer 需同步。
- **【驗證】** dev server（`localhost:7777`，`serve-local.py` no-store）：四塊 KPI 在 en 與 zh-Hant 皆量到 `labelLines: 1 / footLines: 1`、top 283 → bottom 409、height 126 一致。`check_ds_sync.py` **本機不存在（未執行）**；本輪未新增／修改任何 `ds-components/*.css`，DS 同步類檢查無適用項目。版本字串沿用凍結的 `?v=r2.1`。

## 2026-07-27 · 電子商店「商品」與「競標」分頁置頂列順序調整（B 反饋導入）

使用者指定 Nick persona 下這兩個清單要先看到哪幾筆，僅調整列出現的先後，未改任何商品內容、價格、庫存、狀態或成員。

- **【B】** 商品分頁：`js/products-store.js` 新增 `WISH_TOP_IDS` 置頂清單（26MS T-Shirt (白) → 祝你好命 刺繡 Logo 老帽 → 祝你好命 束口工裝褲 → 祝你好命 紅白低筒球鞋），其餘商品沿用 `WISHYOU_PRODUCTS` 的定義順序接在後面。產列邏輯（`patchEshopList` 以 `WISH_IDS` 逐一 clone 模板列）不變。
- **【B】** 競標分頁：`e-shop.html` 把「Nike Dunk Low Pro SB「WYAGL / 祝你好命」客製鞋」那一列（`data-name="WYAGL Nike Dunk Low Pro SB"`）整塊搬到「REALIVE 巡演主吉他（親簽）」（`data-name="Stage-worn leather jacket"`）之後，親簽海報與母帶盤帶依序後移。列內容與 `data-status` 皆未動。
- 說明：清單最上方的「未命名」草稿列不受影響——e-shop 頁本來就會把草稿列浮到第一個非草稿列之前（`e-shop.html:859`），屬既有行為。
- **【驗證】** dev server（`localhost:4326`，`devserver.py` no-store）＋ `ztor.persona=nick`：DOM 讀出商品列依序為 未命名（草稿）→ 白 Tee → 老帽 → 束口褲 → 球鞋 → 其餘；競標列依序為 主吉他 → Nike Dunk → 親簽海報 → 母帶盤帶 → 未命名。`check_ds_sync.py` 全 PASS（僅既有基準 WARN）。版本字串沿用凍結的 `?v=r2.1`。

## 2026-07-27 · 拍賣詳情頁撤除「競標生命週期階段」列（C 撤除）

使用者選了拍賣詳情頁的三階段列（預展／開放競標／結果，目前階段加框），指出它跟頁首那顆「競標中」徽章講的是同一件事，留徽章就夠。判斷同意：創作者端要知道的是「現在能不能改、還剩多久」，這由徽章＋右欄「競標狀態」卡（狀態／目前出價／剩餘時間／結束／保留價）完整回答；階段列多出來的只有「前後還有哪些階段」，屬粉絲端敘事而非管理資訊。

- **【C】** `auction-detail.html` 移除 `.ad-phases` 整個區塊（原位置在頁首與頁籤之間）。
- **【C】** 同步移除頁面 `<style>` 內的 `.ad-phases`／`.ad-phase`／`.ad-phase__dot`／`--done`／`--current` 五條規則——全站只有這頁在用，不留死樣式。
- **【C】** 移除 i18n key `ad.phase.preview`／`ad.phase.open`／`ad.phase.result`（grep 確認全站無其他消費者）。
- **⚠ 規格衝突已登記，未回寫 `documents/`**：規格 5.1.5.8 §2.3 仍把「競標生命週期階段」列為頁面內容、§3 顯示順序第 3 項也還在，所以原型目前未覆蓋 §2.3。已記入 `ASSUMPTIONS.md` PG-019，待上游裁決要移除規格 §2.3 還是要求原型復原。依權威鏈「使用者當次明確指示」最優先，原型先照裁示撤除。
- 驗證：dev server 實跑，頁首徽章與右欄競標狀態卡不受影響、頁籤位置上移接在頁首之後、三個分頁切換正常；`grep` 確認站上已無 `ad-phase` 殘留；`check_ds_sync.py` PASS。

## 2026-07-27 · 組合／拍賣詳情頁的版型骨架改成與商品詳情頁一致（B 反饋導入）

使用者指出組合包詳情頁與競標詳情頁的 wireframe 要跟商品詳情頁一致。三頁原本是兩套骨架：商品明細早已是 `page--narrow` ＋ 頁籤 ＋ Detail rail（主欄＋右側常駐欄）＋ `form-section--outlined`；另兩頁停在一排 bento `card`、徽章在標題上方、頁寬 1280。組合頁尤其嚴重——名稱／描述／素材／成員／價格／庫存／折扣／上架設定八件事全塞在同一張 `bento--span-7` 卡裡往下捲。兩份規格（5.1.5.8／5.1.5.9）的 §3 都明寫「實際分欄／版面／RWD 由 project-ui-creator 決定，非約束」，所以這是呈現層裁量、不動上游。分頁切法經使用者選定後才施工。

- **【B】** `bundle-detail.html` 換上商品明細同一套殼，內容一項未增減、只重新分組：分頁 **總覽**（§2.4 銷售摘要＋§2.3 名稱描述＋§2.3 素材）｜**銷售設定**（§2.3 組合價格・折扣設定・庫存）｜**成員**（§2.3 成員清單＋§2.5 成員影響）。§2.3 的上架設定依 STYLE-DECISIONS Q25「管整個物件、不隸屬任一分頁」移入右側常駐欄，右欄另加一張唯讀「組合概況」卡（組合價／目前在庫／組合內含，數值鏡射主欄、不可就地編輯）。成員分頁掛 `--norail`（清單要整頁寬，右欄再放一次組合概況等於重複）。頁首的 `page-intro__sub`（原組合描述）移除——商品明細頁首無描述，且描述本來就在總覽分頁的欄位裡；同時撤掉 Cancel 鈕，動作列與商品明細一致（See as fan ｜ 儲存變更）。
- **【B】** `auction-detail.html` 同套殼：分頁 **總覽**（§2.5 競標概況 KPI＋§2.4 物品摘要）｜**出價**（§2.6 出價活動）｜**拍賣資訊**（§2.7 設定一覽＋結標與履約）。§2.3 競標生命週期三階段列留在頁籤上方不隨分頁消失（規格顯示序第 3，屬頁層級狀態）。右欄放唯讀「競標狀態」卡（狀態／目前出價／剩餘時間／結束／保留價）。出價分頁掛 `--norail`。
- **【D】** 兩頁原本都用了 `.field`／`.field__label`／`.field__hint` 卻沒載入 `field-system.css`（全站唯一定義處），欄位標籤與說明文字一直吃預設樣式；本輪一併補上。
- **【D】** `product-detail.html` 頁首徽章列的 class `pd-id__meta` 全站無 CSS 定義（死類名，等於沒有間距），改用既有 utility，讓三頁徽章列寫法一致。
- **【D】** 新增 11 個 i18n key（`bd.tab.members`／`bd.rail.summary`／`ad.tab.bids`／`ad.tab.info`／`ad.stats.title`／`ad.stats.sub`／`ad.item.title`／`ad.bids.sub`／`ad.info.sub`／`ad.fulfil.title`／`ad.rail.status`）；分頁名沿用商品明細既有 key（`product-detail.tab.overview`／`.price-stock`）以免同一概念兩套用語。
- **【D】** DS 文件同步 consumer 清單：`detail-rail.css`／`tabs.css`（`--card` 變體）檔頭、`design-system.md` §4.50 KV list／§4.52 Detail rail／§4.1 App shell 列／§6.1 `.page--narrow`、`design-system.html` 對應三處。無新增元件、無元件 CSS 行為改動。
- 驗證：本 session 自建 dev server（`localhost:48311`，走 `devserver.py` no-store）＋ nick persona。組合頁：三個分頁逐一切換確認 panel 顯隱／`--norail` 生效／`#hash` 深連結、標題與麵包屑帶入組合名、主圖與四張成員附圖、成員 4 列、右欄三個唯讀值與主欄一致、折扣 10% 重算 NT$5,980→NT$5,382 且右欄同步。拍賣頁：三分頁切換、階段列在頁籤上方、hero＋4 張 gallery、右欄五列狀態。兩頁 0 console error、0 水平溢出、`.field__label` 樣式生效（14px/11px）。中英切換確認 11 個新 key 兩語皆解析。`check_ds_sync.py` 結果 PASS + WARN（raw-color／token-reality／zero-consume 三項為既有基準、與本輪無關）。**版本字串沿用凍結的 `?v=r2.1`，未跑 `bump_ver`**。

## 2026-07-27 · 上線時間卡改滿版寬、時程點改跟合作者同款 `.ztor-table`（B 反饋導入）

使用者選了「關於專案」分頁的「上線時間」卡（`data-type="go-live"`，直接上線類專案專屬），原本是 `bento--span-6` 半版寬、旁邊沒有另一張 span-6 的卡搭配、右側留白；兩個時程點（建立草稿／正式上線）擠在同一支 `.data-list` 裡上下疊放。使用者要求滿版寬＋名稱／日期欄位分開，先試過兩版（並排 `.data-list` 欄位、`.form-grid` 唯讀 field）皆不是要的效果，最後指名「合作者」卡的 `.ztor-table` 為範本，改成同款有表頭的表格。

- **【B】** `project-detail.html` 的 go-live 卡由 `bento--span-6` 改 `bento--span-12` 滿版寬。
- **【B】** 內容由 `.data-list` 時間軸改成 `.ztor-table`（跟同頁「合作者」卡一致的表格元件）：表頭「名稱」「日期」兩欄，兩列資料（建立草稿／Sep 20, 2025、正式上線／Oct 05, 2025），外層加 `overflow-x:auto` 比照合作者卡。新增 i18n key `project-detail.golive.field.name`／`.date`。沒有新增元件，純重用既有 `.ztor-table`。
- 驗證：dev server（`localhost:4325`，走 `devserver.py` no-store）上用 `nick-wo-de-i`（go-live 類型專案）＋ nick persona 檢查，DOM 讀出表頭與兩列資料正確、`grid`／`table` 皆滿版寬；截圖比對跟合作者卡視覺一致；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）。**版本字串沿用凍結的 `?v=r2.1`，本輪未跑 `bump_ver`**（2026-07-26 起的新規則，見 CLAUDE.md）。

## 2026-07-27 · 「祝你好命」選物四件組改用來源商品參考重製主圖（B 反饋導入）

使用者指定主圖須以剛下載的 Wish You A Good Life 商品圖為參考；來源商品未包含老帽、束口褲與球鞋，故補齊與 Tee 配色一致的搭配單品。

- **【B/素材】** `images/products/set-outfit-model.webp` 覆蓋為 1:1 方形深炭灰棚拍平鋪，採用 26MS 白 Tee 與足球衫的紅／白／黑視覺語言；畫面清楚呈現白 Tee、黑色刺繡老帽、黑色束口工裝褲與紅白低筒球鞋。
- **【B/缺漏補齊】** 老帽、束口褲與球鞋未在來源目錄中，僅作組合包主視覺的相搭示意，沒有新增為單一可售商品或改動既有組合成員、價格、庫存與上架狀態。
- **【驗證】** 輸出為 1254×1254 WebP，黑色衣物與深色背景保有輪廓、縫線和口袋可讀性。

## 2026-07-27 · 「祝你好命」選物四件組詳情接線與缺件單品補齊（B 反饋導入）

修正 Bundles 列未傳入 bundle id、詳情頁未載入 bundle 資料，導致開啟後顯示預設示意內容且沒有主圖的問題。

- **【B/資料接線】** E-Shop 的 Nick 組合列改連至 `bundle-detail.html?id=wish-you-good-life-four-piece`；詳情頁讀相同資料源，填入組合名稱、說明、4 件成員、NT$ 組合價、主圖和四張成員附圖。
- **【B/缺件單品】** 新增老帽、束口工裝褲、紅白低筒球鞋三筆單一商品與各自 1:1 商品圖，讓四件組每個成員皆可從詳情頁連回商品頁；三者為組合包延伸視覺單品，價格明示「待確認」，不偽稱來源網站商品。
- **【驗證】** 需檢查 bundle id、4 個 member link、4 張 gallery 圖與三個新增商品圖均可解析。

## 2026-07-27 · Auctions 新增 WYAGL / 祝你好命客製鞋（B 反饋導入）

使用者指定在拍賣清單加入 Nike Dunk Low Pro SB「WYAGL / 祝你好命」客製鞋，並使用既有 `nick-nike-00`～`03` 素材。

- **【B/清單】** Nick persona Auctions 新增即將開始的客製鞋拍賣列，顯示商品名稱、全新／限量客製、鞋款、起標 NT$12,800 與關注數。
- **【B/詳情】** `auction-detail.html?id=wyagl-nike-dunk` 讀同一拍賣資料，主圖使用 `nick-nike-00.jpg`，附圖載入 `nick-nike-01.jpg`、`nick-nike-02.jpg`、`nick-nike-03.jpg`。
- **【範圍】** 只在 Nick persona 顯示新的客製鞋資料；Default／userB 的既有拍賣內容不變。
- **【驗證】** 以實際 HTML runtime 驗證清單列、詳情標題、主圖與 4 張附圖均成功渲染，無 console error。

## 2026-07-27 · 四件組詳情頁素材 fallback 修正（B 反饋導入）

使用者回報組合詳情頁出現空白上傳格與異常狀態；原因是舊連結沒有 bundle id 時，動態資料未命中。

- **【B/相容】** `ztorGetBundle()` 支援舊版無 query 的四件組入口；詳情頁 HTML 同時預置主圖與四張成員圖，避免快取或初始化順序造成空白。
- **【驗證】** 以無 query 的 Nick bundle-detail runtime 驗證主圖、4 張附圖、4 個成員列均存在，無 console error。

## 2026-07-27 · 四件組詳情頁圖片顯示修正（Bug fix）

截圖驗證發現縮圖雖已寫入 DOM，但 `upload-tile` 元件只會對帶有 `data-upload` 的已填入格顯示 `.upload-tile__thumb`；詳情頁使用自訂資料屬性，導致全部縮圖被 CSS 隱藏。

- **【修正】** 主圖與四個附圖格同時保留 bundle 資料 hook 並加上 `data-upload`，套用既有已上傳狀態，圖片滿版顯示且不再出現空白上傳提示與綠框。
- **【驗證】** runtime computed style：5 個 `.upload-tile__thumb` 均為 `display:block`，主圖與四張附圖路徑正確、無 console error。

## 2026-07-27 · Nick 商店同步 Wish You A Good Life 商品資料（B 反饋導入）

使用者指定以公開商品頁及其子頁替換周湯豪電子商店的示意商品，並沿用已下載至 `images/products/` 的本地商品圖。

- **【B/資料】** Nick persona Products 分頁改為 13 筆來源商品，包含商品名稱、NT$ 售價、繁中摘要、規格、來源庫存與商品分類。
- **【B/素材】** 每筆商品使用來源頁對應的本地首圖；商品詳情頁載入同商品的全部本地圖，並提供原商品頁連結。
- **【範圍】** 只替換 Nick persona；Default／userB 資料集與既有組合包、拍賣列不變。來源頁未提供成本資料，成本欄保留空值。
- **【驗證】** 13 筆商品 id、31 張本地圖、詳情頁多圖與來源連結需以靜態檢查及 `check_ds_sync.py` 驗證。

## 2026-07-26 · 「祝你好命」選物四件組改用實物合成主視覺（B 反饋導入）

使用者指定組合包不可再沿用灰色模特模板，需以商品本身整合成一張可辨識四件內容的主圖。

- **【B/素材】** `images/products/set-outfit-model.webp` 改為可填滿方形縮圖外框的 1:1 深色棚拍平鋪：祝你好命 Tee、刺繡 Logo 老帽、束口工裝褲、紅包主題低筒球鞋四件同框。Tee 的彩色胸前圖樣、老帽輪廓與鞋款紅白黃綠配色依各自商品素材呈現；褲子仍為無實拍時的中性黑色視覺替代。
- **範圍**：只替換既有同名組合主圖，`products-store.js` 的組合成員、售價、庫存、狀態與 E-Shop 行為完全不變；沒有新增人物、藝人肖像或品牌標誌。
- **驗證**：同名 WebP 可正常載入；Nick persona 的 Bundles 列仍顯示四件組資訊，且頁面無 console error。

## 2026-07-26 · 四件組主視覺提高背景對比（B 反饋導入）

使用者回饋原本近黑背景讓黑色 Tee、老帽與束口褲的材質不易辨識。

- **【B/素材】** 保留 1:1 四件組構圖與商品位置，將背景提亮為深炭灰並補柔和側光，讓黑色衣物的輪廓、縫線與布料紋理在方形縮圖中可讀。
- **範圍**：只調整主圖曝光與背景對比，商品成員、資料與 E-Shop 行為不變。

## 2026-07-26 · 新增「一同回顧」共看派對＋活動通知條改用電子商店同款（B 反饋導入）

使用者兩項指示：(1) 比照 LOVE·RAGE·HOPE 臺中場再新增一個共看派對、時間即將到來、性質是「一同回顧」；(2)「活動的通知要用電子商店的通知」。

- **【A/新活動】** `events.html` 即將舉辦最前新增一列共看派對：**LOVE·RAGE·HOPE 臺中場 — 線上一同回顧**（2026/8/8 · 晚上 9:00、線上 · 臺中場實錄、售票中 38/300、$190），沿用該場的巡演主視覺 `nick-lrh-tour.jpg`；新增 i18n 鍵 `events.rowWP2.*`（default 給通用版、nick 覆蓋為 LRH 專名）。KPI 活動總數 12→13。此列與既有的 R2 演唱會電影共看場並列，示範共看派對的第二種用途＝回顧自己既有演出實錄。
- **【D/元件 promote】** 「收窄置中的頁面通知條」原為 e-shop 頁內私有樣式（`#eshop-stock-bar` / `.eshop-stock-bar__card`），活動頁要用同一款＝第二個消費者，依鐵律 1 **promote 進 `ds-components/alert.css`**：新增 `.alert-inset`（外層定位殼：sticky `top:--sp-16`、`max-width:1280` + `margin-inline:auto` + `padding-inline:28px`）＋ `.alert--inset-card`（內層視覺卡：`--surface-shell` 底、`--radius-xl`、12/16 內距；淺色改白底＋`--shadow-card`）。e-shop 改吃共用元件、頁內重複規則刪除，只留該頁專屬的句內元素樣式（`__names` / `__link`）。
- **【B/活動通知】** `js/scenario.js` 由單層 `alert--bar alert--warning alert--page-top`（滿版、黃色警示、鈴鐺 icon）改為兩層 `.alert-inset` + `.alert--bar.alert--inset-card`，**移除 icon 與狀態色**，與電子商店低庫存提醒完全同款；× 關閉改切外層 `hidden`。`.alert--page-top` 現無人消費，於 DS 文件標為保留變體。
- **【D/DS 同步】** `design-system.md` 更新 `.alert--page-top` 條目並新增 `.alert-inset` ＋ `.alert--inset-card` 規格；`design-system.html` 更新通知條說明並新增「頁面貼頂變體」demo 卡（雙語）。
- **驗證**：本機 devserver（`devserver.py`，送 no-store）實測——活動頁通知條無 icon、`--surface-shell` 實色底、16px 圓角、max-width 1280、sticky，文案與 × 關閉正常；e-shop 通知條重量：寬度 1280、右緣較 `.main` 內縮 36px、**無溢出**（即原註解警告的 flex 百分比 margin 問題未重現）；新活動列渲染正確（即將舉辦 6／售票中 3）。無 console error；`check_ds_sync.py` PASS。
  - 過程註記：先前在被占用的 port 上驗證，實際跑的是別人的 `http.server`（不送 no-store），瀏覽器吃到舊 JS 導致誤判；改用乾淨 port 起 `devserver.py` 後才驗到真實結果。

## 2026-07-26 · 活動頁所有演出時間整體後移 6 個月（B 反饋導入）

承前一輪的時間軸重排，使用者要求「所有活動往後推移 6 個月」。位移後有三場由已舉辦翻成即將舉辦，分桶與排序一併重算。

- **【B/資料】** 各場 +6 個月：墾丁 4/4→**2026/10/4**、重慶 4/25→**2026/10/25**、屏東黑鮪魚 5/2→**2026/11/2**、共看派對 2026/8/1→**2027/2/1**、LOVE·RAGE·HOPE 臺中 2025/10/11→**2026/4/11**、R2 特仕版 2024/11/23→**2025/5/23**。**跨年場維持 12/31**（日期語意鎖定於年末，位移後仍是未來場，改動反而不成立）。
- **【B/分桶】** 相對今日（2026-07-26）重算：**即將舉辦 5**（墾丁 10/4 → 重慶 10/25 → 屏東 11/2 → 跨年 12/31 → 共看派對 2027/2/1，由近到遠）、**已舉辦 2**（LRH 臺中 2026/4/11 → R2 特仕版 2025/5/23）、**草稿 1**。DOM 順序實體重排（共看派對由第一列移到即將舉辦末列），確保各桶內仍是由近到遠。
- **【B/狀態】** 由已舉辦翻為未來的三場，狀態與票務改回售前語意：重慶＝售票中 84/120（$2,520）；墾丁、屏東為音樂節嘉賓場＝預定、不限名額、無票收。
- **【B/i18n】** nick 與 default 兩個字典的 `events.row*.datetime` 同步位移（default 亦整體 +6 個月以維持與分桶一致）。
- **範圍**：只動 `events.html` 與 `js/i18n.js` 的日期／狀態／列順序；元件、版面、篩選邏輯未動。
- **驗證**：本機 devserver 切 nick persona 實測——八列 period／status／日期逐列核對正確，即將舉辦 5、售票中 2、草稿 1，各桶內由近到遠；無 console error；`check_ds_sync.py` PASS。

## 2026-07-26 · 活動頁依真實時間軸重排周湯豪演出（nick persona，B 反饋導入）

使用者要求「周湯豪的活動頁按照時間重新上活動」，並指定參考 `persona/NICKTHEREAL/gallery.html`（43 場演出史）；另指定兩張主視覺素材。

- **【B/資料】** 發現先前放在「即將舉辦」的成都(3/28)、墾丁(4/4)、重慶(4/25) **實際上都早於今天（2026-07-26）**，分桶錯誤。依真實日期重排八列：
  - **即將舉辦（2，由近到遠）**：REALIVE (R2) 演唱會電影線上共看場（2026/8/1，共看派對）→ 臺北最High新年城跨年演出（2026/12/31，預定）。
  - **已舉辦（5，由近到遠）**：屏東黑鮪魚文化觀光季海洋音樂會（2026/5/2）→ REALIVE 世界巡迴・中國段重慶場（2026/4/25 蜚聲 LIVEHOUSE）→ 台灣祭墾丁大灣演唱嘉賓（2026/4/4）→ LOVE·RAGE·HOPE Live House Tour 臺中場（2025/10/11 Legacy Taichung）→ motorola 呈獻 REALIVE (R2) 特仕版臺北小巨蛋（2024/11/23）。
  - **草稿（1）**：REALIVE 世界巡迴新場次規劃（日期未定）。
  - 共看派對列移到 DOM 最前，確保「即將舉辦」內部也是由近到遠；票券／收入依性質調整（音樂節嘉賓場＝不限名額無票收、巡演場＝售罄）。
- **【B/素材】** 依使用者指定新增兩張官方主視覺（自 `persona/NICKTHEREAL/images/` 複製進 site）：`artwork-440x440.jpg` → `images/projects/nick-lrh-tour.jpg`（LOVE·RAGE·HOPE Live House Tour）、`REALIVE R2 特仕版.jpeg` → `images/projects/nick-r2-special.jpg`（R2 特仕版）。其餘列沿用既有素材。
- **【B/i18n】** `PERSONA_DICT.nick` 活動區塊整段依新分桶改寫（row1＝跨年、row2–row6＝已舉辦、row7＝草稿），補齊各列 datetime／venue／tickets；event-detail 系列頁改指重慶場（第 2 場／共 3 場）。**default persona 同步調整** row1（改年末場，才符合 upcoming）與 row6（改已舉辦日期），避免非 nick 檢視出現「未來日期卻在已舉辦」的矛盾。
- **範圍**：只動 `events.html`（列順序／分桶／圖片／票券欄）與 `js/i18n.js`（兩個字典的活動區塊）；未改元件、版面或篩選邏輯。
- **驗證**：本機 devserver 切 nick persona 實測——八列 period／status／日期／場地／圖片逐列核對正確（即將舉辦 2、已舉辦 5、草稿 1，各桶內由近到遠）；兩張指定素材皆 200 且成功解碼（440px／399px）；無 console error；`check_ds_sync.py` PASS。

## 2026-07-26 · 修好活動頁情境提醒橫幅（漏載 alert.css 導致無樣式）（B 反饋導入）

使用者回報活動頁頂部的「下一場活動快開始了」提醒橫幅版面壞掉（圖示／標題／說明／✕ 垂直散開），要求修成與電子商店低庫存提示一致。

- **【B/修正】** 根因＝`events.html` **未載入 `ds-components/alert.css`**。該橫幅由 `js/scenario.js` 依 Cheat Codes 的 Event Day 狀態動態注入（class `alert alert--bar alert--warning alert--page-top`），markup 本身正確，但頁面缺樣式表，元素退化成無樣式的垂直堆疊。補掛 `alert.css` 即復原為單行通知條（鈴鐺 icon＋標題＋同行說明＋右側 ✕、貼頂滿版 sticky），與 e-shop 低庫存通知條共用同一支元件。
- **範圍**：只在 `events.html` `<head>` 補一行 `<link>`；未動 `scenario.js`、`alert.css` 或任何 markup／行為。
- **驗證**：本機 server 切 Event Day＝Pre-Event 實測——橫幅 `display:flex`／`align-items:center`／`position:sticky` 皆生效、單行呈現、✕ 可關閉（`hidden=true`）；無 console error；`check_ds_sync.py` PASS。

## 2026-07-26 · 所有列表 hover 統一改浮起版（解決 STYLE-DECISIONS Q34）（B 反饋導入）

使用者指名電子商店商品列表的 hover（截圖示範：卡底＋圓角＋陰影，列從清單裡浮出來）要套到「所有列表」。查了一輪：站上真正有「列 hover」語意的只有兩支——`product-list.css`（電子商店／取貨／活動／IP 市場等 7 頁共用）與 `project-list.css`（專案列表），兩者原本都是 Q9 2026-07-13 的純換底色，只有 `--eshop`／`--ip` 兩個 product-list 變體先前（2026-07-20/21）已改浮起。radio-list／ztor-table／data-list 等其餘清單本來就沒有「列 hover 浮起」這個語意（選取態或純資料表），不屬於這次的「商品列表」角色，未動。

- **【B】** `ds-components/product-list.css`：`.product-list__row:hover` base 規則由 `background: var(--accent)` 改為浮起版（`--card` 底＋`--radius-md`＋`--shadow-lift-flat`＋自身與上一列 `border-bottom` 透明），7 個變體（`--orders`／`--pickup`／`--events`／`--auctions`／`--bundles`／`--eshop`／`--ip`）統一。原本 `--eshop`／`--ip` 專屬的 scoped 規則因此變成單純重複，已刪除、併回 base；`--eshop` 的 `cursor:pointer`（點列進編輯的點擊行為，非 hover 視覺）維持 scoped 不動。
- **【B】** `ds-components/project-list.css`：`.project-list__row:hover` 同步比照改寫，跟 product-list 用同一套視覺語言。
- **文件同步**：`STYLE-DECISIONS.md` 新增 Q34（登記本次裁決），Q5／Q9 加註「清單列 hover 部分已被 Q34 取代」。
- 驗證：dev server 上 hover 專案列表任一列，視覺確認卡底浮起＋圓角＋陰影，跟電子商店列表一致；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）。

## 2026-07-26 · 控制項邊框新規則：不在卡片／section 內的 select 改無邊框（新增 `.select--bare`，解決 STYLE-DECISIONS Q33）（B 反饋導入）

使用者選了 `projects.html` 列表工具列的內容類別下拉，指出它不該有 border（跟旁邊無邊框的 `.filter-tabs` 並排卻自己戴一圈框），並定調新規則：「section 內的才要 border」。稽核全站後發現這是目前唯一一處「select 直接坐在工具列上、沒有卡片包著」的情境（其餘 `.list-status-row` consumer 頁沒有這個 pattern，ip-market 的六個 select 在進階篩選面板內、不受影響）。

- **【B/新變體】** `ds-components/input.css` 新增 `.select--bare`（疊加在 `.select` 上）：`box-shadow:none`、`background:transparent`、pill 圓角、`--fs-12`／`--fw-medium`（比照同列 `.filter-tabs__item`），hover 才浮出 `--muted` 底＋`--foreground` 字。
- **【B】** `projects.html` 的 `#proj-cat` 加上 `select--bare`。
- **文件同步**：`STYLE-DECISIONS.md` 新增 Q33，Q4 加註條件；`design-system.md`／`design-system.html` 同步 Input/Select 組件的 Variants／States／Class API／Do & Don't／Code example。
- **範圍聲明**：這次只稽核並套用了 `.select`；`.input`／`.textarea`／`.switch`／`.metric-pill` 尚未逐一比照，若之後出現同款「不在卡片內」的情境再處理，不代表這條規則已對其他控件類型全面套用。
- 驗證：dev server 上量測 `#proj-cat` 的 `getComputedStyle`——`box-shadow:none`、背景透明、`border-radius:9999px`；截圖確認跟旁邊 filter-tabs 視覺一致；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）；`bump_ver` → `20260726za`。

## 2026-07-26 · 我的 IP 列操作改三點選單（B 反饋導入）

使用者裁示：`my-ip.html` 每列的「管理」文字連結改用三點（⋯）設計，比照 orders／pickup 既有的列操作 kebab pattern，全站列操作收斂成單一答案。

- **【B】** 8 列的 `<a class="card__link">管理</a>` 全部改成 `<details class="dropdown"><summary class="btn btn--icon btn--xs">⋯</summary>` ＋ `.dropdown__menu`，選單內單一項目「管理」（`<a href="ip-detail.html">`，圖示 `settings`），行為與連結目標不變。重用既有 `dropdown-menu.css`（未修改元件本身），補上該頁原本沒有的 `<link>`。
- **【D】** 新增 i18n 鍵 `my-ip.a.more`（More actions／更多操作），比照 orders.a.more／pk.a.more／events.a.more 的既有命名慣例。
- **【D】** 補上該頁原本缺的 kebab 收合邏輯（點選項或點外部關閉），複製 orders.html 的既有寫法，不重新發明。
- 驗證：起站實測——8 列 kebab 皆可展開／點外部關閉／再次展開；選單項「管理」連結 `ip-detail.html` 不變；中英文 aria-label／title／選單文字皆正確；console 無錯；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260726x`。

## 2026-07-26 · 專案詳情「我的收益」篩選由 chip-group 換成收入管理同款 filter-tabs--source（B 反饋導入）

使用者附兩張截圖（專案詳情 › 我的收益 vs 收入管理），指定「第一個的元件要用第二個的」。

- **【B/元件套用】** `project-detail.html` 收益分頁的篩選由 `.chip-group`＋`.chip`（自捲 `.earn-dot` 內聯色）換成 `.filter-tabs.filter-tabs--source`（＋`.filter-tabs__dot`，色值改走 `--dot` 自訂屬性），與收入管理 `earnings.html` F5 收益來源篩選、財務頁 `fin-legend` 同一支元件與同一視覺語彙：選中時藥丸底色＝該項自身顏色 12% 淡底＋同色文字（`--source` 變體），未選為靜音文字＋色點。容器由 `<div>` 改語意化 `<nav role="tablist">`，各項補 `role="tab"`／`aria-selected`。
- **【B/JS】** 篩選事件的選取器由 `.chip`／`chip--active` 改 `.filter-tabs__item`／`filter-tabs__item--active`，並同步切換 `aria-selected`；「選 OTT 版稅才顯示共創深度明細」的既有連動邏輯（`data-earn-series="ott"`）不變。
- **【D/依賴】** `project-detail.html` 補掛 `ds-components/filter-tabs.css`（原未載入）。`.earn-dot`（shared.css）仍為其他處使用、未動。
- **範圍**：只動 `project-detail.html` 收益分頁篩選一處；篩選項目、順序、顏色對應與深度明細行為皆不變，屬元件替換的呈現決策。
- **驗證**：本機 server 實測——五項渲染正常、色點 4 顆；點 OTT 版稅時底色 `color(srgb 0.19 0.18 0.24)`＋文字 `rgb(167,139,250)`（紫，與其色點同色）、`aria-selected=true`、共創深度明細展開；切到授權收益時深度明細收起；回「全部」正常。無 console error；`check_ds_sync.py` PASS。

## 2026-07-26 · `.card`／`.kpi` 全站改陰影浮起、去 1px 邊框（解決 STYLE-DECISIONS Q23，新增 Q32 裁決）（B 反饋導入）

使用者選了專案詳情頁三種 `.card` 系卡型（組合包卡／募資狀態卡／發布更新卡）比對「現況邊框」vs「陰影浮起」demo 後裁示「全站都改」；接著再選一個 `.kpi` 指出「底色應該和 section 一樣，且都改成無 border 的」。這其實是站上已登記的開放問題（`STYLE-DECISIONS.md` Q23）：`.card` 系（Q3 2026-07-13 裁決＝邊框）與 `form-section--outlined`（Q14/Q18 裁決＝陰影浮起）是同一視覺角色的兩種答案，先前只在建立流程預覽欄做過 scope 例外。本輪由使用者裁示 **Q23 選項 C：全站統一**，登記為新裁決 **Q32**。

- **【B】** `ds-components/card.css` `.card` 基底：`border: 1px solid var(--border)` → `border: 0` ＋ `box-shadow: var(--shadow-card), var(--shadow-edge-top)`，跟 `form-section--outlined` 統一做法。`.funding-panel--card`（`ds-components/funding-panel.css`）同步；`.fc-bundle` 本就吃 `.card` 基底，自動套用不用另改。
- **【B】** `ds-components/kpi.css` `.kpi`：邊框同步去除、改陰影；預設底色順便由 `--input-surface`（2026-07-20 Q21）還原成 `--card`——派 agent 稽核全站 24 處 `.kpi` 用法後發現：16 處直接放在 `.bento`／`.tab-panel` 上（沒有卡包著，跟外層同色才是常態），只有 8 處（`event-detail.html` Overview 分頁、`earnings.html` Breakdown／Payouts、`auction-detail.html`、`bundle-detail.html`、`product-detail.html`、`admin-ip-bank-entry.html`、`ip-detail.html`）真的疊在 `.card`／`.form-section--outlined`／`.ip-hero` 內，需要保留 Q21 的「亮一階避免糊色」處理。這 8 處用 scoped selector `.card .kpi, .form-section--outlined .kpi, .ip-hero .kpi` 改回 `--input-surface`，其餘 16 處吃新預設 `--card`。
- **未動**：`.ztor-card`（docs-only，未上產品頁，仍照 Q3）；input／table／dropdown／picker／modal 等控制項或清單類的 1px 邊框（Q3/Q4 對這些角色仍有效，本輪只處理「大容器卡」這個視覺角色，範圍不無限擴大）。
- **文件同步**：`STYLE-DECISIONS.md` 新增 Q32（登記本次裁決）、Q23 標記「上層問題已由 Q32 解決」、Q3 加註「`.card`／`.kpi` 已被 Q32 取代」；`design-system.md`／`design-system.html` 同步 4.11b Section card、4.12 KPI 兩節的 States／Class API／Token usage，以及 Pillar 2 的 Card shadow 說明列。
- 驗證：dev server 上分別量測三類實例的 `getComputedStyle`——`.funding-panel--card` border 0px＋box-shadow 有值；共創進度 tab 的獨立 `.kpi`（無卡包著）背景 `rgb(33,34,35)`＝`--card`、border 0；product-detail Sales summary 的巢狀 `.kpi`（`.form-section--outlined` 內）背景 `rgb(42,43,45)`＝`--input-surface`、border 0，三種情境皆符合預期；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）；`bump_ver` → `20260726u`。

## 2026-07-26 · 我的項目移除「身分」篩選＋發起徽章（B 反饋導入）

使用者裁示：「移除，在 Creator Studio 應該都是發起人」——`earnings-sony.html` 我的項目原本沿用公開端 cocreate 站的「身分」概念（發起人／支持者／影評人，用來分辨你在某計畫裡扮演的角色），但 Creator Studio 底下這張表列的永遠是使用者自己發起的專案，身分永遠是同一個值，區分／篩選都沒有意義。

- **【C】** 移除「全部身分」`details.dropdown`（含發起人／支持者／影評人三個選項）；`fin-ledgerbar` 現在只剩全部類別／期間兩個下拉。
- **【C】** 移除每列的「發起」徽章（`ztor-badge--info fin-role`）——先前只在部分列顯示，隱含「其餘列不是發起人」的錯誤訊息；拿掉篩選後這個區分本來就不該再局部顯示。
- **【B】** `partials/finance-overview.js`：`state` 拿掉 `role`、`rowMatches()` 拿掉身分比對、下拉 change handler 拿掉 `role` 分支；`SLOTS` 簡化成只剩 `types`／`amt`（不再帶 `role`）；`renderMyItems()` 不再輸出 `data-fin-role` 屬性與徽章 span。
- **【D/清理】** 移除死掉的 4 個 `fin.role.*` i18n 鍵與已無人引用的 `fin.badge.creator` 鍵；移除頁面級 `.fin-role` CSS（僅服務已刪除的徽章）。
- 驗證：起站實測——身分下拉已消失、`fin-ledgerbar` 只剩類別／期間兩個下拉；6 列徽章數＝0；類別篩選（測「專輯」）仍正確篩出 2 筆並同步計數；點列仍正確導向 `project-detail.html?id=...#earnings`；兩個 persona（nick／default）皆確認；console 無錯；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260726s`。

## 2026-07-26 · 暗色 hairline 邊框跟著填色底調亮（`--border`／`--input`，全站 token）（B 反饋導入）

上一輪把 `--input-surface` 調亮後，使用者追問邊框是不是也要跟著等比調——算過對比度：填色底調亮前「填色底 → 邊框」對比 ≈1.21，調亮後掉到 ≈1.15，邊框相對變得不明顯。做了 3 階候選（A 現行 `#333435`／B `#373839`／C `#3C3D3F`）demo，選定 **B**。

- **【B】** `ds-components/_tokens.css` 暗色區塊 `--border` 與 `--input`（維持同值）：`#333435` → `#373839`，對填色底的對比回到 ≈1.21（調亮前的分離感）。`--border` 是全站共用 token（卡片外框、下拉選單、表格分隔線、彈窗…58 支元件 CSS／72 個頁面在用），非只有輸入框，本輪連動影響全站 hairline。
- **未動**：`--sidebar-border`（側欄分隔線，另一個獨立 token，7/21 Q22 時與 `--border` 同步過，但這次的候選 demo 只呈現 `--border` 情境、使用者也只針對輸入框反饋來的，故先不動——如需一併調亮再另外確認）。
- 驗證：dev server 上量測欄位 `box-shadow` 實際色值 `rgb(55, 56, 57)`＝`#373839`；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）；`bump_ver` → `20260726p`。

## 2026-07-26 · 暗色控件填色底對比加大（`--input-surface`，全站 token）（B 反饋導入）

使用者反饋暗色主題下 `.input`／`.textarea`／`.upload-tile` 的填色底跟卡片背景色差太小、看不出是可填欄位。做了 5 階候選值（A 現行 `#262729` ～ E `#3D3E40`）demo 給使用者比對，選定 **B `#2A2B2D`**。

- **【B】** `ds-components/_tokens.css` 暗色區塊 `--input-surface`：`#262729` → `#2A2B2D`。純 token 值調整，無新增 CSS 規則；全站消費此 token 的 `.input`／`.textarea`／`.select`／`.upload-tile` 一次套用，無需逐頁改。亮色主題 `--input-surface`（＝`var(--card)`）未動，僅暗色。
- 驗證：dev server（`localhost:4325`）nick persona 下的支持方案套組編輯器 `getComputedStyle` 確認欄位底色為 `rgb(42, 43, 45)`＝`#2A2B2D`；螢幕截圖比對卡面／欄位分層明顯浮出；console 無錯；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）；`bump_ver` → `20260726m`。

## 2026-07-26 · 專案詳情頁四項清理：展示內容撤除混雜舊圖／OTT 收益深度明細改滿版／支持方案套組更名組合包／我的收益撤除探索原型橫幅（B 反饋導入 · C 撤除）

- **【C/撤除】** `project-detail.html` 「關於專案 › 展示內容」相簿的第 2、3 張圖是與本專案無關的舊假資料——`adia-chan.webp`（另一部電影專案的海報）與 `shuangyan-zhijian.webp`（《雙眼之間》海報），兩張皆非 JS 動態帶入（只有封面格 `#pd-gallery-cover` 有接 `p.poster`），任何專案開啟都會看到同樣兩張不相干的圖。直接移除這兩格靜態 tile，相簿只留封面格（動態、正確）＋新增圖片鈕。
- **【B】** 「我的收益 › 共創計畫．深度明細」的「計畫項目收益」與「淨收益分配 70/30」兩張卡由 `bento--span-7`／`bento--span-5`（並排半版）改 `bento--span-12`（各自滿版一整列），使用者反饋這區要 fill 整個畫面。
- **【B】** 「方案與承諾 › 支持方案」套組編輯器全面更名「組合包」：`js/i18n.js` 的 `pd-bundle.*` 系列 zh 文案（標題／名稱／描述／商品／新增鈕）由「套組」改「組合包」（僅此頁 `pd-bundle.*` 命名空間；create-campaign 流程用的是自己另一套 `fc.*` 副本，維持既有「套組」用語，未改）。卡片標頭原本固定顯示「組合包 N」，現在依「組合包名稱」欄位即時反應：有填名稱時顯示「組合包：{名稱}」、清空則退回「組合包 N」（新增 i18n key `pd-bundle.head-named`，`project-detail.html` 的 `refresh()`／`headline()` 加上 `data-b-name` 的 `input` 監聽）。同時卡頭與欄位間距 `.fc-bundle__head { margin-bottom }` 由 `--sp-6` 加大到 `--sp-16`（`ds-components/bundle-editor.css`），對齊使用者反饋的「間距加大」。
- **【C/撤除】** 「我的收益」分頁頂部的「⚠ 探索原型 — 收益模型提取自共創計畫，數字為示意、待產品裁決」橫幅整塊移除（使用者反饋直接撤除，非改文案）。
- 驗證：改走本機 dev server（`http://localhost:4325`，先前誤用 `file://` 直開曾吃到瀏覽器層級快取、跟 disk 內容不同步，改用 dev server＋硬重整後複測皆正確）——展示內容只剩封面格；深度明細兩卡 `getComputedStyle` 確認 `grid-column: span 12`；組合包卡標頭空名稱時顯示「組合包 1」、輸入後即時變「組合包：{名稱}」、頭尾間距量測 16px；我的收益分頁首元素改為篩選 chip-group、無 banner；console 無錯；`check_ds_sync.py` 全 PASS（僅既有基準 WARN）；`bump_ver` → `20260726c`。

## 2026-07-26 · 工作列右側留白加大、建立專案鈕尺寸修齊（B 反饋導入）

- **【B】** `ds-components/list-toolbar.css` 的 `.list-toolbar` 內距由 `padding-inline: var(--sp-8)` 改成 **`var(--sp-8) var(--sp-20)`**（左 8／右 20）。左右刻意不對稱：第一個 tab 自己還有 14px 內距，左側視覺留白本來就有 22px；右側動作群沒有內距，8px 會讓建立鈕貼著殼層邊緣。實測改後 22 / 20，視覺對齊。四個消費頁（projects／my-ip／e-shop／events）一起受惠。
- **【B】** `projects.html` 的「＋ 建立專案」拿掉 `btn--sm`。使用者指出電子商店的尺寸才對——全站清單頁的主 CTA 都是 `.btn.btn--primary`（36px／`fs-13`／`0 14px`），只有 projects 掛了 `--sm` 變成 28px／`fs-12`／`0 10px`。orders／pickup／my-ip／events 逐頁核對過，都沒有這個問題。
- **【D/文件】** `design-system.md` 的 List toolbar 條目補上這兩條：不對稱內距的理由、以及「右側主 CTA 不要加 `btn--sm`」。
- 驗證：實測左 22／右 20、按鈕 36px／13px／`0 14px`，與 e-shop 的 `split-button__main` 完全一致。

## 2026-07-26 · 直接發佈的第二支 MV 改成〈什麼都不必說〉（B 反饋導入）

- **【B/資料】** `js/projects-store.js` 的 `nick-sdfs-mv-live`（直接發佈／已上線／MV）由「帥到分手 MV」改名為 **什麼都不必說**，簡介同步改寫。原本兩支 MV 同名（差別只在發行模式），現在各自獨立：帥到分手 MV＝募資型（有版稅分頁）、什麼都不必說＝直接發佈型（無版稅），剛好各佔矩陣一格。
- **【B/素材】** 封面換成 `images/projects/nick-smdbbs.jpg`（來源 `persona/NICKTHEREAL/images/single_2022-07-15_2022-remix.jpg`，gallery 標註為〈什麼都不必說 (2022 Remix)〉），原本 400×400 不需再裁。
- 名稱依使用者字面採「什麼都不必說」未加「MV」字樣；類別欄仍顯示 MV／影視。
- 驗證：專案頁實測 13 筆、該列名稱與封面正確；`node --check` 通過。**本輪未跑 bump_ver**——版本已凍結成 `?v=r2.1`，這是版本凍結後第一次發版，改動不再擴散到全站 1099 條連結。

## 2026-07-26 · 改名後的專案換上正確封面（B 反饋導入）

- **【B/素材】** 改名時只換了名字沒換圖，使用者指出後從 `persona/NICKTHEREAL/images/`（周湯豪素材庫，含 `manifest.json` 與 `gallery.html` 對照表）取正確封面，複製進 `images/projects/`：
  - **帥到分手** → `nick-sdfs.jpg`（來源 `single_2016-09-30_x.jpg`，gallery 標註 alt=帥到分手）；兩筆「帥到分手 MV」同曲共用同一張
  - **愛上你算我賤** → `nick-asn.jpg`（來源 `single_2022-02-11_acoustic-version.jpg`，Acoustic Version 單曲封面）
  - **罵醒我** → `nick-mxw.jpg`（repo 內本來就是〈罵醒我 (Reimagined)〉的封面，與同名草稿專案共用＝同一首歌的兩個版本）
  - 兩張新圖原本就是 400×400，不需再裁。
- **【B/一致性】** `my-ip.html` 第 3 列「帥到分手 官方 MV 影像」的 nick persona 圖同步換成 `nick-sdfs.jpg`（原為〈我的i〉封面）。
- **【B/一致性】** 帥到分手的簡介原本沿用〈我的i〉的文案說它是「LOVE RAGE HOPE 首波主打」，與 2016 年的封面互相矛盾，改成 REAL 時期的代表單曲。
- 留下的舊圖 `nick-i.jpg`／`nick-wln.jpg`／`nick-baipa.jpg` 仍被 my-ip／events 引用，未刪；`nick-nsddd.jpg` 目前全站無人使用、保留備用。
- 驗證：專案頁實測三筆封面與名稱相符；`node --check` 通過。

## 2026-07-26 · 周湯豪專案假資料改名＋補一筆 MV（B 反饋導入）

- **【B/資料】** `js/projects-store.js` 的 `PROJECTS_NICK` 依使用者指定改名（id 保持不變，避免既有深連結失效）：我的i → **帥到分手**／為了你 → **罵醒我**／走三關 → **愛上你算我賤**／你說的都對 MV → **帥到分手 MV**。
- **【B/資料】** 新增第 13 筆 **帥到分手 MV**（`nick-sdfs-mv-live`，直接發佈／已上線／MV／影視家族，沿用 `nick-i.jpg`）。與上一筆同名同曲、差在發行模式：募資型那筆有版稅分頁，這筆沒有，剛好補上「MV × 直接發佈 × 已上線」這格樣本。**同名為使用者指定**，需要區隔再加副標。
- **【B/資料一致性】** 「愛上你算我賤」原本沿用〈走三關〉的介紹說它出自 REALIVE，但同一份資料裡 REAL LIFE 的介紹已寫明收錄此曲——改成 REAL LIFE，去掉互相打架的敘述。
- **【B/資料一致性】** 專案改名後，nick persona 其他頁面殘留的「我的i」一併換成「帥到分手」：`js/i18n.js` 的 `my-ip.row3.name`／`fan-detail.tl.project1`／`fan-detail.spend.r3`／`fan-detail.projects.r1`／`earnings.name.latebloom`、`earnings.html` 的取樣授權列名稱、`js/products-store.js` 的數位單曲／專輯曲目／母帶盤帶拍賣。
- **【D/修 bug】** `earnings.html` 的 9 處 `project-detail.html?id=…#money` 深連結改指 `#earnings`——「專案收益」分頁已於 2026-07-25 退場，這些連結自那時起就落在不存在的 anchor 上。
- 驗證：專案頁實測 13 筆、名稱與發行模式如上；`node --check` 三支 store/i18n 語法通過。

## 2026-07-26 · 清單頁工作列分頁統一成同一組配方（B 反饋導入）

- **【B】** 使用者發現 my-ip 與 events 的工作列分頁跟 projects「有些微不同」，問是不是沒元件化。查證：四頁用的是**同一個元件** `.tabs.tabs--underline-short`，差別在兩個修飾 class 只有 projects 有——`tabs--underline-label`（底線只等標籤寬、不含計數）與 `tabs--count-plain`（計數不用藥丸、改 `--muted-foreground` 純文字）。
- **處置（使用者裁示，STYLE-DECISIONS Q26）**：`.list-toolbar` 主軸分頁一律 `tabs tabs--underline-short tabs--underline-label tabs--count-plain`。補上 `my-ip.html:54`、`events.html:119`、`e-shop.html:309`；projects 原本就有。e-shop 沒有計數，`--count-plain` 不影響外觀仍照寫，之後要加計數不必再改 class。
- **【D/文件】** `design-system.md` §Tabs 與 `design-system.html` 的 Tabs demo 由「Projects 專用 opt-in」改寫成「list-toolbar 的標準配方」，並順手修掉 `--count-plain` 的文件漂移（文件寫 `--foreground-muted`，實作 2026-07-24 起已是 `--muted-foreground`）。
- **範圍界線**：`tabs--underline-label` 需要標籤包在子元素裡；product-detail、admin-platform-fees 的分頁標籤是 `<button>` 直接文字、也不是 list-toolbar，維持原樣不動。
- 驗證：三頁實測 class 已套用、active 底線色 `rgb(255,163,63)` 掛在標籤 span 上、item 自身 `::after` 為 `none`、計數色 `rgb(117,117,117)` 無填色；e-shop 底線由 30px（item 內縮）收成 26px（實際標籤寬）。

## 2026-07-26 · 建立專案閘門的關閉鈕提亮（B 反饋導入）

- **【B】** `.wizard__gate-close`（`create-project.html` 閘門底部的 ✕）在暗底上幾乎看不見，使用者反饋「亮一點，元件是這麼暗嗎？」。查證：`.btn--icon-circle` 預設 `--muted`(#161718) 底＋`--muted-foreground` 圖示，這組值假設鈕坐在 `--card`(#212223) 上；閘門用的是 `.wizard__sheet--sectioned` 的 `--surface-page`(#0C0D0D)，兩者只差一階，圓形等於消失。
- **處置**：在 `shared.css` 的閘門段 scope 提亮——`--card` 底＋1px `--border` 描邊＋`--foreground-muted` 圖示，hover 仍回 `--accent`＋`--foreground`。**不動元件預設**，composer 的送出鈕坐在卡片上、維持原樣。
- 同步在 `design-system.md` Button 章節記下「`--icon-circle` 的底色有面向假設」與這個已知案例，避免下次又踩。
- 驗證：實測 bg `rgb(33,34,35)`／border `rgb(55,56,57)`／icon `rgb(185,185,185)`，截圖可見。

## 2026-07-26 · 專案卡片封面補齊正方形素材（B 反饋導入）

- **【B/素材】** `images/projects/nick-baipa-goods.jpg` 880×1100（直式）→ **880×880**（取上緣）。周湯豪 12 個專案的封面只有這張不是正方形，卡片檢視下該張的封面比其他卡高一截、整列參差；使用者框選要求改成方的。原圖可從 git 還原。

## 2026-07-26 · 六個清單頁縮圖統一 76px、列留白加大、篩選列到清單的間距 24→40（B 反饋導入）

- **【B】** `ds-components/product-list.css`：`.product-list__image` 60px → **76px**、`.product-list__thumb` 52px → **76px**（使用者：「我的 IP／電子商店／取貨管理／活動，有商品列表的都要改成這樣」）。首版誤照各自 +1/3 算成 80／68，使用者當場更正「全部都跟專案列表一樣 76」，已改為統一值。內含 icon 同步放大（`__image--placeholder` 20→28px、`__thumb` 20→26px）。
- **【B】** 同檔各變體欄軌第一格跟著放寬：`--eshop`／`--bundles`／`--auctions` 68→84px、`--ip` 60→76px、`--pickup` 44→76px；`events.html` 頁內的 `--events` 欄軌 60→76px（桌機與 ≤760px 兩組）。
- **【B】** 有縮圖的變體（`--eshop`／`--bundles`／`--auctions`／`--pickup`／`--ip`／`--events`）列高改 **116px**、上下留白改 **`--sp-20`**。`--orders`（2026-07-23 已移除縮圖欄）與 `--creators`（走頭像）維持 base 的 88px／`--sp-14`，不受影響。
- **【B】** 次層篩選列到清單的間距由 24px → **40px**（使用者框選該處空白要求加大）：`ds-components/list-toolbar.css` 的 `.list-status-row { margin-bottom }` 一處改到位，涵蓋專案／我的 IP／電子商店／活動；訂單與取貨兩頁未用共用元件、各自的 `.ord-list-controls`／`.pk-list-controls` 同步改成 `var(--sp-40)`。
- **待裁決**：`.ord-status-row`／`.pk-status-row` 是 `.list-status-row` 的頁內同構複本（同樣 `flex／align-items:center／gap:12px／flex-wrap`），這輪只同步了間距、沒有合併。已記入 `STYLE-DECISIONS.md`。
- 驗證：六頁實測——e-shop 縮圖 76×76／間距 40px；my-ip 76×76；pickup 76px QR 晶片；orders 無縮圖列高不變；events 縮圖放大不裁切；`check_ds_sync.py` 全 PASS。

## 2026-07-26 · 專案列表縮圖放大三分之一＋列上下留白加大；周湯豪三張封面裁成正方形（B 反饋導入）

- **【B】** `ds-components/project-list.css`：`.project-list__image` 56px → **76px**（先照使用者指示放大兩倍成 112px，同輪回饋「太大，加三分之一即可」，落在 56×4/3≈75、取 4 的倍數 76），桌機／≤1180px／≤760px 三組 `grid-template-columns` 的第一軌同步；`--placeholder` 的類型 icon 20px → 28px 等比跟上。
- **【B】** 同檔 `.project-list__row` 上下留白 `--sp-14` → **`--sp-20`**（使用者：「上下的 padding 要再大一點」），`min-height` 88px → **116px**（76 縮圖 ＋ 上下 20）。
- **【B/素材】** `images/projects/` 三張周湯豪封面依使用者框選裁成正方形（原 16:9，保留框選側、取最大正方形）：`nick-baipa.jpg` 1200×675 → 675×675（取右）、`nick-r2.jpg` 1000×562 → 562×562（取右）、`nick-lwh.jpg` 1100×618 → 618×618（取左）。三張同時餵給列表方形縮圖與 `.project-card__cover`（16:9，`object-fit: cover` 取正方形中央帶），原圖可從 git 還原。
- 同步 `design-system.md` §4.28 與元件表的 56px／88px 描述。
- 驗證：實測 `.project-list__image` 76×76、三張圖 naturalSize 皆為正方形；`check_ds_sync.py` 全 PASS（餘 WARN 皆為既有存量）；`bump_ver` → `20260726f`。

## 2026-07-26 · sony 版「我的項目」改吃真專案資料＋整列可點進該專案的我的收益；修三個篩選下拉開錯邊（B 反饋導入）

- **【B/資料】** `earnings-sony.html` 的「我的項目」6 列由寫死的假名稱（塑膠花／Tr33: 有綫耳機…）改為**依 persona 從 `js/projects-store.js` 動態渲染**（`renderMyItems()` 於 `partials/finance-overview.js`，取當前 persona 的前 6 個專案）。第一版先換成 default persona 的港片專案、仍寫死在 markup，使用者指出「周湯豪 user 下也要換成他的假資料」後改為動態：default → 我要衝線／陳松伶精選／旺角狙擊／海上霸姬鄭一嫂／龍虎門外傳：九龍夜行／深水埗的月光；nick（周湯豪）→ 我的i／為了你／走三關／LOVE RAGE HOPE／你說的都對 MV／REALIVE。身分（發起／支持／影評人）、收益類型與金額用固定示意值 `SLOTS` 依序套用，讓上方類型 chips 與身分篩選維持可用；金額與存入總和不動。
- **【B】** 類別欄與篩選改用 store 的 **cat 代碼**（`movie`／`song`／`album`／`mv`…）比對：`data-fin-cat` 帶代碼、類別下拉改由 JS 依「這批列實際出現的類別」重建（default 顯示電影／專輯／連續劇／短劇；nick 顯示單曲／專輯／MV），換 persona 不會出現對不上的選項。顯示文字仍走 i18n（新增 `fin.cat.mv`／`event`／`merch`／`doc`／`custom` 五個鍵）。sony 頁補載 `js/projects-store.js`。
- **【B】** 整列可點 → `project-detail.html?id=<專案>#earnings`，直接落在該專案的「我的收益」分頁。**`data-fin-go` 屬性原本就寫在 markup 上、但從來沒有接線**（列點了沒反應），本輪在 `partials/finance-overview.js` 補上事件委派（列內若有連結／按鈕則讓它自己處理，不搶走）。
- **【B/修 bug】** 「全部類別／全部身分／迄今」三個 `details.dropdown` 缺 `dropdown--left`，面板預設 `right:0` 對窄觸發器會往左溢出到卡片外（使用者截圖：展開後是一塊空白框）。三個都補上 `dropdown--left`，改為對齊觸發器左緣。
- **依賴說明**：港片那批專案屬 `projects-store` 的 **default persona**（Maya Chou 世界觀），與 sony deck 的內容世界一致；cheat code 切到 `nick` persona 時這些 id 查無資料、會退回該 persona 的第一個專案（store 現行行為，非本輪引入）。
- **【B/新增共用樣式】** 列名稱前面加 36px 方形縮圖（取專案的 `poster || cover`；無圖時留 muted 方塊）。這個「表格列首小縮圖」promote 進共用 `ds-components/table.css`：`.ztor-table__media`（內層 flex wrapper，gap `--sp-10`）＋ `.ztor-table__thumb`（36px、`--radius-sm`、muted 底、1px 邊框、`object-fit:cover`），尺寸沿用 admin IP Bank 表格自有的縮圖規格、改為任何 `.ztor-table` 都能用。DS 三件套同步（`table.css` 註解＋`design-system.html` class 表＋`design-system.md` 條目）。
- **【D/踩雷紀錄】** flex **不可**直接放在 `<td>`（第一版把 `display:flex` 加在 `.ztor-table__feature` 上）：儲存格會脫離表格排版，`table-layout:fixed` 的欄寬因此失效——實測第一欄由 409px 塌成 180px、四欄總和 700 ≠ 表寬 932，長名稱（LOVE RAGE HOPE）被迫折行。改成內層 wrapper 後欄寬恢復 409/223/223/74（總和＝表寬）、名稱單行。此限制已寫進 `table.css` 註解與 DS 兩份文件，避免再犯。
- 驗證：下拉展開與觸發器左緣對齊（left 297 = 297）、選項只列實際類別；兩個 persona 各自渲染正確（nick 6 列全為周湯豪作品、類別下拉＝單曲／專輯／MV；default 6 列為港片專案）；nick 下按類別「專輯」篩出 2 筆、計數同步；點列實測 default→`?id=pirate-queen#earnings`（標題 海上霸姬鄭一嫂）、nick→`?id=nick-lrh#earnings`（標題 LOVE RAGE HOPE），皆落在「我的收益」分頁；console 無錯；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260726k`。

## 2026-07-25 · ≤900px 導覽收進 burger（新增 `.app-nav-burger`，全站 shell）（B 反饋導入）

使用者指出窄螢幕下側邊欄那一整排選項擠成一團（10 幾個項目換行、「通知與待辦」被壓成直排）、要收進 burger。原本 ≤900px 的做法是把 rail 攤成橫排（`shared.css` 舊註解自己寫著「full drawer/hamburger is R 2.1.x」），topbar 模式則更糟——直接 `display:none` 藏掉 nav、窄螢幕**完全沒有導覽入口**。本輪把 burger 補上，兩個 shell 一起處理。

- **【A/新元件】** `header.css` 新增 `.app-nav-burger`：36px（`--control-h-sm`）方形圖示鈕，`display:none`，只在 ≤900px 顯示；`margin-left:auto` 靠右；圖示 menu ↔ x 依 `[data-nav-open]` 互換。
- **【A】** `js/sidebar.js`：兩個 shell 的 markup 都在 logo 之後插入 burger（帶 `aria-expanded`／`data-i18n-aria-label="nav.menu"`），新增 `wireBurger()`——切 shell 根元素的 `[data-nav-open]`、點選項／Esc 自動關閉、寬度回到 >900px 清除旗標（matchMedia＋resize 雙保險）。
- **【A】** ≤900px 收合規則：**sidebar 模式**（`shared.css`，因其載入順序在 ds-components 之後）隱藏 `> nav` 與 `.app-sidebar__actions`，展開時各佔滿一列、直向堆疊、`max-height:60vh` 自身可捲；**topbar 模式**（`header.css`）改為隱藏 `> nav` 包裝層（原本只藏 `ul`，包裝層仍佔位導致展開後卡在中間），展開時 `flex:1 1 100%` 落到自己一列。
- **【A】** topbar 面板內的 mega-dropdown 改成 inline 常開（`position:static`、去陰影去邊框、縮排 24px）——桌機靠 hover 展開，觸控打不開會讓子頁完全點不到。
- **【D/修 bug 級 infra】** `shared.css` 的 5 條 `@import`（header／icon／page-intro／field-system／settings）版本被寫死在 `?v=20260702a`，`bump_ver.py` 只改 HTML 的 `<link>`、不動 CSS 內的 @import，所以這五支元件 CSS 自 7/02 起改動**在瀏覽器端一直吃舊快取**（本輪 burger 樣式完全沒生效才發現）。已同步為當前版本；後續每次 bump 需一併更新（check 3 只掃頁面、抓不到這類 @import 陳舊版本）。
- **【D】** i18n 新增 `nav.menu`（選單／Menu）；DS 文件同步：`design-system.html` 的 App shell 規格表補 burger 行為＋class 欄、`design-system.md` 的 Header (topbar) 條目補述。
- 驗證：820／760px 兩種寬度、sidebar 與 topbar 兩種模式實測——收起只留 logo＋burger（sidebar 79px／topbar 61px 高）、展開為滿版直向面板（707／577px）、子選單可點、Esc／點選項／再按 burger 三種關閉皆有效、放大回 1280px burger 自動隱藏且 nav 恢復正常、`data-nav-open` 不殘留；console 無錯；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260725zy`。

## 2026-07-25 · 收入來源篩選改 filter-tabs、選中色跟該來源色（新增 `--source` 變體）（B 反饋導入）

使用者裁決（看過 A／B 兩案 demo 後選 A）：收入來源篩選的選中狀態改成電子商店那排 `filter-tabs` 的做法（淡色底 pill），但選中色**跟著該來源的點點顏色**走、「全部」用品牌橘。另指定授權收入的紅要改用電子商店「急需補貨」徽章那個紅（全站紅標籤只有這一個配色）。

- **【B/新變體】** `filter-tabs.css` 新增 `.filter-tabs--source`：active pill 以該項自己的顏色上色（`color-mix(--dot 12%, --card)` 淡底＋同色標籤，hover 18%），顏色由每顆按鈕以 inline `--dot` 傳入；同時新增 `.filter-tabs__dot`（8px 前置色點，讀同一個 `--dot`）。本身無色的項目（「全部」）`--dot` 給 `--primary`。配方與既有 `--brand` 同源（12% 淡底＋同色字），差別只在「一色 vs 每項自己的色」。
- **【B】** earnings 的來源篩選由 `.chip-group` ＋ `.chip` 換成 `nav.filter-tabs.filter-tabs--source` ＋ `.filter-tabs__item`（`role="tablist"`／`aria-selected`），色點改用 DS 的 `.filter-tabs__dot`，頁面級自刻 `.src-dot` 退場。active 切換改在來源篩選的 JS 內處理（原本靠全頁通用 `.chip-group` handler 切 `.chip--active`，換元件後不再適用）。
- **【B/色彩】** 授權收入由 `--destructive`（#E7000B，深、小字不易讀）改 **`--status-error`**（#FF3D47，＝`badge--error`／急需補貨徽章用色），三處同步：chip 色點、趨勢線＋面積填色、右側「收入來源分布」清單色點。earnings 其餘 4 處 `--destructive` 是交易明細的負數金額（提款／退款），語意不同、不動。
- **【D】** DS 三件套同步：`filter-tabs.css` 變體註解＋`design-system.html` 新增「Filter tabs · source」demo 卡（All／共創藍／OTT 綠／授權紅 各 default+active 對照）與 class 表一列＋`design-system.md` Filter tabs 條目補述。
- **待裁決（已回報使用者）**：9 個來源目前有兩組深色主題下**完全同色**——OTT 版稅與 IP 版稅皆 `#4ADE80`、共創計畫與平台／串流皆 `#5896F3`。改成彩色選中後兩組 pill 會長得一樣；處理需連圖表線與來源清單色點一起改，使用者尚未裁決。
- **【B】Deck for Sony 版同步**：`earnings-sony.html` 的存入類型篩選（`data-fin-legend`）同樣由 `.chip-group`＋`.chip` 換成 `nav.filter-tabs.filter-tabs--source`＋`.filter-tabs__item`（`role="tablist"`／`aria-selected`），8 個類型各帶自己的 `--dot`（共創橘／OTT 藍／佣金綠／預付金黃／授權紫／獎金・派對灰），色點改用 DS `.filter-tabs__dot`；`partials/finance-overview.js` 的 active 切換由 `chip--active` 改 `filter-tabs__item--active`＋同步 `aria-selected`。頁面級 `.fin-legend` 收斂成只留外距（排列交給 `.filter-tabs`）；`.fin-dot` 保留給「如何運作」彈窗的類型說明列，「即將推出」那排維持 `.chip--static` 的 disabled 灰。
- 驗證（sony）：起站實測——選 OTT＝淡藍底＋藍字、active 與 `aria-selected` 互斥、圖表聚焦 `data-focus=ott`、我的項目表同步篩成 4 列、即將推出仍為 disabled 灰；console 無錯。
- 驗證：起站實測——選授權收入＝淡紅底＋#FF3D47 紅字（與急需補貨徽章同色）、選全部＝淡橘底＋橘字、切換時 active class 與 `aria-selected` 正確互斥、趨勢線與清單色點同步為新紅；console 無錯；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260725zv`。

## 2026-07-25 · 周湯豪組合包改「選物四件組」＋帽/鞋補成可單買商品（B 反饋導入）

使用者指定參考公開端 `shop-item.html?id=fan-selection-set`（實際內容：**影迷選物四件組**，NT$2,760／原價 3,320，四件＝觀影社 Logo Tee／刺繡 Logo 老帽／棉質束口棉褲／帆布低筒鞋，每件各自挑尺寸顏色），把該組合加進周湯豪的組合包，**並把裡面的衣／帽／褲／鞋拆成單一商品、狀態都設為販售中**；追加指示「用『祝你好命 衣褲二件組』做替換、名稱也改一下」＝拿既有那筆二件組的位子換成這個四件組並改名。

- **【B/資料】** `js/products-store.js` 的 `BUNDLES_NICK`：原「祝你好命 衣褲二件組」（Tee＋褲 2 件／$88）改為 **「祝你好命 選物四件組」**（Tee ＋ 老帽 ＋ 束口褲 ＋ 球鞋 · 4 件／$178／16 組），比照參考站「組合價低於單買加總」（單買 38+32+58+78＝206，省 $28）。
- **【B/資料】** `P_NICK` 新增兩個單品，狀態皆 `live`：**祝你好命 刺繡 Logo 老帽**（$32／4 色）、**祝你好命 紅包主題低筒球鞋**（$78／US 8–11）。連同既有的 `tee`（$38，live）與 `pin`＝祝你好命 束口工裝褲（$58，live），四件在 e-shop 商品分頁都可單買且都是販售中。
- **【B/圖】** `nick-nike.jpg` 實際是「祝你好命」紅包主題聯名球鞋實拍，原本被掛在**褲子**上，改掛回**鞋子**；帽子用既有 `cap.webp`。褲子改用 `socks.webp` 佔位（站上無棉褲實拍，同為下身著用品），**已在檔內註記 ⚠ 待替換**。
- **【D】** `e-shop.html` 新增兩列商品列（`?id=cap`／`?id=shoes`，`data-status="live"`＋販售中徽章），default persona 對應資料一併補進 `P_DEFAULT`（Logo cap · six-panel／Canvas low-top），否則這兩列在 default 下點編輯會查無商品；`js/i18n.js` 補 `e-shop.rowCap.*`／`e-shop.rowSho.*` 共 8 鍵（依站上逐列 key 慣例）。
- **範圍**：只動示意資料與列表列，未改商品狀態機、費率或補貨邏輯。狀態徽章沿用既有的 `patchEshopList()` STATUS_MAP 自動由 store 的 `status` 推導，未另外寫死。
- **驗證**：本機切 nick persona 實測 e-shop——商品分頁四件皆顯示「販售中」（Tee $38／老帽 $32／束口工裝褲 $58／球鞋 $78），規格副標分別為尺寸(S/M/L/XL)、顏色(霧灰/墨黑/海軍藍/米白)、顏色×腰圍、尺碼(US 8–11)；組合分頁顯示「祝你好命 選物四件組 · Tee ＋ 老帽 ＋ 束口褲 ＋ 球鞋 · 4 件 · $178 · 販售中」。console 無錯，`check_ds_sync.py` 全 PASS。

## 2026-07-25 · 專案詳情分頁矩陣調整（版稅適用範圍／製作進度／收益備份退場）＋周湯豪假資料補齊（B 反饋導入 · C 撤除）

使用者盤點「階段 × 類型 × 類別」三軸下詳情頁該有哪些分頁後的一批裁決。

- **【C】「專案收益備份」分頁退場**：`project-detail.html` 移除分頁按鈕與整個 `data-panel="money"` 面板（270 行），連同 15 個只剩它在用的 i18n 鍵（`project-detail.tab.money`、`pd-cf.*` 共 14 鍵）。移除前先原樣備份成 [docs/專案收益備份-money-panel-20260725.html](docs/專案收益備份-money-panel-20260725.html)（`docs/` 不在部署範圍、僅供 repo 查閱）。
- **【B/產品規則】版稅適用範圍改「募資型全類別」**：條件由 `type==='fund' && status==='published' && family==='music'` 改為 `type==='fund' && status==='published'`。使用者裁決理由——版稅是股份分潤的產物，只有募資型有股份；直接發佈與預購沒有股份，因此任何階段任何類別都不該有版稅。影視與音樂都有版稅，差別在面板內容。仍屬 CCR-006 待上游裁決範圍。
- **【B/新版型】影視版版稅面板**：版稅面板改家族切版（`data-royalty-common` 共用 ＋ `data-royalty-fam="music|film"` 兩版）。共用＝季度版稅總額＋地區佔比；音樂版維持串流平台佔比＋Top 10 歌曲；**影視版新做 OTT 平台佔比（Netflix／Disney+／愛奇藝／Prime Video／CATCHPLAY+／friDay）＋授權明細表（平台／授權地區／授權期間／授權金／入帳狀態，6 筆）**。理由：一部電影沒有「Top 10 歌曲」，影視版稅的實際形態是逐筆 OTT 授權合約。i18n 新增 `pd-roy.ott.*`／`pd-roy.deal.*` 共 18 鍵。
- **【C】「製作進度」改成只有募資才有**：`data-type` 由 `fund preorder` 改 `fund`（分頁按鈕與面板同步）。使用者裁決：**預購不需要對外交代製作進度，之後需要時再加**。
- **【B/資料】** 旺角狙擊 `funded`→`published`（募資達標、交付完成後上線），成為影視版版稅面板的樣本；陳松伶精選已是募資＋音樂＋已上線，為音樂版樣本。
- **【B/資料】周湯豪專案假資料**：依使用者指定補齊並把指定項排到最前——直接上線單曲 ×3（我的i／為了你／**走三關**為新增）、募資專輯 ×1（LOVE RAGE HOPE，募資中）、**MV 募資已上線**（你說的都對 MV，由直接上線改募資型；MV 屬影視家族，故為影視版版稅的第二個樣本）。其餘專案排在後面。
- **【B/資料】周湯豪 eShop 假資料**：`pin` 改為「祝你好命 束口工裝褲」（顏色 ×腰圍 8 組變體）、`acetate` 改為「LOVE RAGE HOPE 限量黑膠 1/500」；新增 persona 版的組合包與拍賣資料——組合包「祝你好命 衣褲二件組」（Tee ＋工裝褲）與「LOVE RAGE HOPE 黑膠典藏組」、拍賣「REALIVE 巡演主吉他（親簽）」。組合包結構參考公開端 `shop-item.html?id=fan-selection-set`（一組多件、每件各自選規格、組合價低於單買）。
- **【B/修正】persona 切換的三處資料不一致**：(a) 組合與競標兩分頁的列原本完全沒有 persona 支援，切到周湯豪仍顯示 Coastline 名稱——新增 `patchBundlesAndAuctions()` 以 `data-name` 為鍵替換；(b) 商品列的規格副標、狀態徽章與 `data-status` 未跟著換，會出現「已售完」卻顯示 96 件的矛盾——`patchEshopList()` 補上 meta／badge／data-status／limited 版庫存；(c) 低庫存通知條的商品名寫死 Coastline，改為依 persona 取名單。
- **【D】MV 歸類修正**：MV 由音樂家族改歸影視家族（使用者指定）——`projects.html` 的類別下拉分組與 `CAT_GROUP`、`projects-store.js` 的 `FAMILY` 與 3 筆 MV 資料的 `family`／`icon` 同步。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量）；HTML 結構解析器驗證 `project-detail.html` 標籤完全平衡（移除面板時修掉 2 個殘留 `</div>`、補回 1 個 `.page` 收尾）；兩種版稅版型於瀏覽器實測切換正確；eShop 商品／組合／競標三分頁與低庫存通知條實測一致。

## 2026-07-25 · 我的收益：兩區塊改「共創計畫 · 深度明細」＋只在 OTT 版稅收益時出現（B 反饋導入）

使用者指定參考共創前台（`my-cocreate-proposal.html?kind=music&filter=all`）：那邊要切到版稅收益系列才會出現「共創計畫 · 深度明細」與「淨收益分配」；r2.1 對應的是「計畫項目收益」與「淨收益分配」，**出現時機照連結調整、UI wireframe 照連結、design system 用本站自己的**。

- **【B/出現時機】** 兩區塊包進新的 `#pd-earn-deep`（`.pd-deep`），預設 `hidden`；收益類型 chips 點擊時只有 `[data-earn-series="ott"]`（OTT 版稅收益）會顯示，其餘（全部／影評人佣金／影評人預付金／授權收益）隱藏——共創收支拆解與 70/30 分配是版稅這條收益線才有的語意。
- **【B/版型】** 外層＝**無卡片**區段（Q24 不做卡中卡，同本站慣例）：區段抬頭「共創計畫 · 深度明細」＋收合鈕（`aria-expanded` 控整區）＋期間 `select`（近一個月／三個月／一年）；內容才是兩張真卡（span-7／span-5）。
  - **計畫項目收益**：三列＝`+ 收入總和（小計）`／`− 支出總和（小計）`／`= 淨收益`，各帶 `data-list__icon` 圖示晶片（本站單色，不採參考站的彩色底）；前兩列右側金額旁有展開鈕，展開顯示明細子列（收入→項目版稅收入；支出→平台費用／推廣及宣傳費／影評人佣金）。**數字改為自洽的 500,000 − 100,000 = 400,000**（原本 520,000 − 100,000 卻寫 400,000，算式對不上；且此區已限定 OTT 版稅收益，收入即項目版稅 500,000）。
  - **淨收益分配**：改用**圓環**＋圖例（發起人 70% / USD 280,000、支持者 30% / USD 120,000），取代原本的 KPI 方塊＋兩列清單。
- **【D/元件】** 兩項擴充既有元件（不新增元件檔）：`chart.css` 新增 `.donut` 家族（`--donut-p` 比例／`--donut-a|b` 色／`--donut-size` 220px／`--donut-thickness` 28px／`--donut-hole`；圖例沿用同檔 `.source-list`，三段以上改用 stacked-bar／rank-bar）；`data-list.css` 新增 `.data-list__row--child`（小計展開的明細子列，縮排 64px、無 icon、13px muted、去下框線），**取代各頁 inline `padding-left:12px` 的散裝寫法**（頁面裸值 51→49）。`js/icons.js` 補 `minus`／`equal`。
- **【D】** `design-system.html` 加 donut demo＋Class API 列、data-list 加 `--child` demo 列與 API 列；`design-system.md` 同步 Chart 與 Data list 兩條；`shared.css` 加 `.pd-deep`（抬頭列、`aria-expanded` 箭頭轉 180°、金額＋展開鈕群組）；i18n 加 `pd-earn.deep.*`／`pd-earn.range.*`／`pd-earn.item.*`／`pd-earn.dist.founder|supporter` 等 17 鍵。
- **【B/微調（同輪二稿）】** 使用者反饋兩點：(1)「圖示框太大，那只是一個 icon」→ `data-list.css` 新增 `.data-list__icon--sm`（32px 晶片＋16px 圖示，與同列 `.btn--icon.btn--sm` 等高），三條小計列改用之；(2)「數字要靠右對齊，以 `USD 500,000` 的最右邊為基準線」→ `.data-list__row--child` 的縮排改吃 `--data-list-child-indent`（預設 64px，`.pd-deep` 覆寫 44px＝對齊 32px 圖示＋12px gap），並讓**沒有展開鈕的列**（明細子列＋淨收益列）補上 `--pd-deep-toggle-col`（32px 鈕＋8px gap）的右內距，使七個金額共用同一條右基準線。
- **驗證**：本機 `?id=adia-chan` 實測——五個 chips 逐一點擊結果為「全部→隱藏／OTT→顯示／佣金→隱藏／預付金→隱藏／授權→隱藏」；兩個小計展開後 4 條子列全出；整區收合／再展開 `aria-expanded` 與 body 同步；圓環中央數字不溢出。二稿後量測：七個金額的 `getBoundingClientRect().right` 全等於 762、圖示晶片 32×32。console 無錯，`check_ds_sync.py` 全 PASS。

## 2026-07-25 · 建立專案流程內「專案類型」已選卡加卡底提亮（B 反饋導入 · Q28）

使用者裁示：流程內表單（`radio-cards--3`）的專案類型已選卡背景要亮一點，讓選取更明顯。

- **【B/微互動】** `radio-card.css` 新增 `.radio-cards--3:not(.radio-cards--gate) .segmented__btn--active { background: color-mix(--foreground 6%, --accent) }`——流程內表單已選卡在 Q13 右上小橘點外再加卡底提亮（與閘門 hover 同亮度）。閘門（`--gate`）無持久選取態、不套。
- **【D】** `design-system.md`（Radio card `--3` 條目）、`STYLE-DECISIONS.md` Q28 同步。
- **範圍**：只動 `radio-card.css` 與文件；HTML 不變。
- **驗證**：瀏覽器實測——流程內先募資已選卡明顯比另兩張亮；閘門仍維持 default 無點無底。`check_ds_sync.py` PASS；`bump_ver` 已跑。

## 2026-07-25 · 專案詳情「關於專案 › 公開資訊」由摘要清單改「全部攤開＋inline 可編輯」（B 反饋導入）

使用者要公開資訊「全部列出來、可編輯像截圖那樣」。原本是 `.data-list` 五列摘要（簡介「必填·180字」、演職名單「6 位列名」…只有數量、看不到內容），改成攤開的 inline 可編輯欄位，沿用建立流程風格與 DS 既有元件。

- **【B/版面】** `project-detail.html` 公開資訊卡重寫：拿掉 header 的「編輯」鈕（改 inline 可編輯）＋卡標題下加灰色說明。欄位＝**簡介**（`.textarea`，帶專案簡介）→ **演職名單**（逐列 職稱/姓名＋移除，`＋新增列名`）→ **常見問答**（逐則 問題/回答＋移除，`＋新增問答`）→ **年齡分級**（`.select`）＋**語言**（`.input`，`.form-grid` 2 欄）→ **標籤**（DS `tag-input`：可移除 chip＋輸入 Enter 新增＋建議 chip 切換）。
- **【B/JS】** 內嵌 IIFE：演職名單／常見問答用 starter demo 資料生成、逐列增刪；標籤 tag-input 自行接線（Enter 加、chip × 移除、建議 chip toggle）。簡介由 render JS 用專案 `p.desc` 帶入（與 hero 同源、換專案自動換）。原型：不落地、重整還原。
- **【B/資料】** 演職名單（導演/監製/主演×2/攝影/剪輯）與常見問答（發放時程/改方案/海外/數位取得）為 demo 示意文字，非產品規格；年齡分級選項（G/PG/PG-13/R/NC-17）與語言值同為示意。
- **【D】** `project-detail.html` 補掛 `tag-input.css`；`js/i18n.js` 加 `project-detail.details.sub/synopsis-ph/cast-add/cast-role/cast-name/faq-add/faq-q/faq-a/language/tags-ph/tags-suggest` 11 鍵（舊 `*-val`／`done` 摘要鍵保留未刪、無害）。
- **驗證**：本機 `?id=f-i-am-speed` 切「關於專案」實測——簡介＝專案簡介、演職 6 列、FAQ 4 則、年齡分級/語言 2 欄、標籤 3 chip＋建議，console 無錯。`check_ds_sync.py` 全 PASS。

## 2026-07-25 · 我的 IP 改電子商店同款工具列＋兩段清單合併為「來源」篩選（B 反饋導入）

使用者截圖圈選並指定：(1) 改得和電子商店的設計一樣；(2) 把「在 ZTOR 上產出的 IP」「ZTOR 之外的 IP」兩段合併成用分類篩選、預設全部，並在 IP 名稱上加來源標記。

- **【B/版面】** `my-ip.html` 改用 e-shop 兩層工具列：上排 `.list-toolbar`（自有／租入底線 `tabs--underline-short` 在左｜`.list-toolbar__actions`＝收合搜尋 `search-collapse` ＋匯入 waterfall（改 upload 圖示鈕）＋「＋新增 IP」primary），下排 `.list-status-row` 的 `.filter-tabs--brand` 來源藥丸。原 page-intro 的兩顆按鈕移入工具列（比照 e-shop／events／IP 市場）。
- **【B/資訊架構】** 兩段 `<h3>` 標題分組（「在 ZTOR 上產出的 IP · 5」「ZTOR 之外的 IP · 3」）退場，清單**合併成單一 `.product-list`**；每列加 `data-source="ztor|external"`，改由來源 filter-tabs 篩選（**全部／Ztor 產出／站外登錄**，預設全部、各帶即時計數，隨搜尋重算）。i18n 鍵 `my-ip.section.on-ztor`／`.outside-ztor` 移除。
- **【B/命名】** 來源命名採 **「Ztor 產出」／「站外登錄」**（en: Made on Ztor／Registered externally）：兩者字數對稱、語意精準——一個是**在站上產出**（專案上架時自動建立 IP 紀錄），一個是**把站外既有權利登錄進來**；且不必每列重複品牌名。名稱後加 `badge--neutral` 來源徽章（比原創／衍生／驗證中的彩色徽章安靜一階，不搶既有型別徽章）。
- **【B/內容】** 補齊示例列到 **8 筆（站內 5＋站外 3）**：原兩段標題宣稱 5＋3、實際只寫了 3＋1，計數與 KPI「自有 8」對不上。新增 Coastline 演出視覺／Harbour Nights 美術手冊（站內）、Northline 試聽母帶（站外·已驗證，示範站外也能有租金與收入）／Coastline zine vol.01 插畫（站外·待驗證）。i18n 補 en＋zh。
- **【B/功能】** 新增收合式搜尋（比照 e-shop／IP 市場）與「無符合」空狀態＋一鍵清除；頁尾計數改為「顯示 {總數} 筆中的 {目前} 筆」隨篩選即時更新。租入分頁無示例列，切過去時一併隱藏來源篩選列。
- **【B/元件】** `product-list.css` 的 `--ip` 變體新增 `.product-list__title` 可換行規則（flex-wrap、取消 nowrap／ellipsis）：名稱列現在帶兩顆徽章，基礎的單行截斷會把第二顆切成「…」。**僅限 `--ip`**，orders／pickup／e-shop 維持單行截斷。欄寬未改（一度加寬到 260px 造成整頁水平溢出，已回退為原本的 220px，改由換行解決）。
- **範圍**：呈現層與示例資料，未動權利／版稅／市場開關語意與任何商業規則。
- **驗證**：1440px 實測——來源計數 全部 8／Ztor 產出 5／站外登錄 3，點站內→5 筆、站外→3 筆、回全部→8 筆；搜尋「northline」→1 筆且計數同步變 1／0／1；無結果顯空狀態、清除後回 8 筆；名稱列 0 截斷、列高一致 89px、無水平溢出。`check_ds_sync.py` 全 PASS、`bump_ver` 已跑。
- **修訂（同日）**：來源命名「站內產出」改「**Ztor 產出**」（使用者指定），英文 `Made on Ztor` 不變。
- **修訂（同日，使用者截圖圈選）**：來源改**純文字**、移到**名稱正上方**（`.product-list__source`，比照站上既有的大寫小字 eyebrow 語彙——kpi__label／rent-block__label 同一套），不再是徽章；類型（原創／衍生／驗證中）**獨立成一欄**（新增 Type 表頭＋`.product-list__type`），不再擠在名稱旁邊。名稱欄因此收窄回單純文字寬度（`minmax(180px,1.1fr)`），新增 Type 欄固定 92px。站外登錄的列在類型欄顯示 `—`（本來就沒有原創／衍生分類）。

## 2026-07-25 · 我的 IP 移除分頁下方的 info-banner（C 撤除）

使用者在畫面上圈選該說明條並指定移除。

- **【C/撤除】** `my-ip.html` 移除 `我的 IP／租入` 分頁下方的 `.info-banner`（原文：「專案上架時會自動建立 IP 紀錄。要登錄 Ztor 之外既有的權利，請用**新增 IP**——之後便可上架到市場。」），原位置留註解。該頁已無其他 `.info-banner` 消費者，一併移除本頁的 `info-banner.css` 連結；**元件本身保留**（earnings／project-detail／register-ip 等 10+ 頁仍在用）。孤兒 i18n 鍵 `my-ip.info-banner`（en＋zh）一併刪除。
- **範圍**：只動 my-ip 的這一條說明；分頁計數、清單、空狀態與其餘版面未動。
- **驗證**：`check_ds_sync.py` 全 PASS；`bump_ver` 已跑；瀏覽器實測見回報。

## 2026-07-25 · IP 市場篩選區改用電子商店同款 list-toolbar＋filter-tabs、清單補到 10 筆、移除 R 2.1.1 佔位（B 反饋導入）

使用者截圖指定「這些做得和電子商店的 UI 一樣」，並要求刪掉「完整列表、排序與儲存搜尋」佔位塊、補更多假資料。比照 2026-07-24 活動頁的同款轉換，全部重用既有元件、無新增元件。

- **【B/版面】** `ip-market.html` 篩選區由「滿版搜尋 field-pill ＋ 六格 select 卡」重構為 e-shop 兩層結構：上層 `.list-toolbar`（類型底線式 `tabs--underline-short` 在左、各帶即時計數｜`.list-toolbar__actions`＝收合搜尋 `search-collapse` ＋進階篩選 sliders 圖示 ＋「＋上架我的 IP」primary 鈕），下層 `.list-status-row` 的 `.filter-tabs--brand` 淡橘藥丸狀態篩選（不限狀態／可租用／競標中／獨家，各帶計數）。「＋上架我的 IP」由 page-intro 移入工具列（比照 e-shop／events）；「我的篩選」改為工具列的 sliders 圖示。
- **【B/元件套用】** 類型與狀態由 `<select>` 改成 tabs／filter-tabs：新增計數邏輯——類型計數＝該類型 × 關鍵字（不含狀態，避免兩維度互相歸零）、狀態計數＝目前類型 × 關鍵字下各狀態數。搜尋改收合式（點放大鏡展開、✕／Esc／點外部無字收起），移除舊的常駐 field-pill 與 `#ipm-search-clear` 及其頁面 `<style>`。進階條件（版稅／租期／地區／可立即租用）保留、收進 `#ipm-adv` 面板由 sliders 圖示開合。
- **【B/內容】** 示例卡由 3 筆補到 **10 筆**，覆蓋全部五型與三態：新增 寶可夢 Pokémon（品牌·可租用）／五月天 Mayday（音樂·可租用）／七龍珠 Dragon Ball（故事·競標）／超級瑪利歐 Super Mario（品牌·獨家）／葉問 Ip Man（故事·可租用）／戴愛玲 Princess Ai（人物角色·可租用）／超級星光大道 Super Idol（活動形式·競標）。各帶 `data-type`／`data-availability`／中英 `data-search`，i18n 補 en＋zh 共 21 鍵。**同 UIA-088 口徑：真實 IP 名為使用者指定的 demo 填充、非真實授權關係。**
- **【C/撤除】** 移除「完整列表、排序與儲存搜尋」的 R 2.1.1 建置進度 `empty-stub`（使用者指定；清單已補齊，佔位說明不再需要），原位置留註解說明。
- **【B/封面接線】** 十張卡的封面加上 `<img class="ipm-card__cover-img" src="images/ip/<slug>.jpg" onerror="this.remove()">`：**檔案放進 `images/ip/` 就自動鋪滿，沒放則移除 `<img>` 退回漸層＋IP 名佔位**，不會出現破圖。**本 repo 不內建任何版權素材**——角色圖／劇照／藝人照由使用者自備放入（站台會部署到公開 Vercel 網址與共用 GitHub repo）。
- **【B/素材】** 使用者自備並指定放入 8 張封面圖至 `images/ip/`（哈利波特／A-Lin／佩佩豬／寶可夢／五月天／七龍珠／超級瑪利歐／葉問），檔名正規化為 IP slug（原檔含空白與 `é`，公開網址會有編碼問題）；ip-detail 的 hero 封面同步接上哈利波特。**封面一律「等比滿版」**（使用者裁示）——全部用預設 `object-fit:cover`，當日一度新增的 `--contain` 變體同日退場留墓碑；Pokémon 由方形 wordmark logo 換成使用者提供的直式主視覺，改用換素材而非改 fit 解決裁切。無檔的 2 張（戴愛玲／我是歌手）維持 `onerror` 退回漸層佔位。**素材為使用者提供的第三方版權／商標／肖像資產、ztor 未取得授權，公開發布前建議替換——詳見 ASSUMPTIONS UIA-088 追記。**
- **【B/內容】** 活動形式示例數度更換，最終由使用者指定為「**請世界吃桌 Have A Seat**」（台灣辦桌飲食文化活動）：沿革為 超級星光大道 → 我是歌手（使用者要求換別的活動）→ 簡單生活節（使用者問「是否有香港或台灣的活動 IP」）→ 請世界吃桌（使用者指定）。i18n `card10.meta` 同步；封面 `images/ip/have-a-seat.jpg` 待使用者放入，未放前由 `onerror` 退回漸層佔位。
- **範圍**：呈現層重構＋示例資料，未動價格／版稅／名額／狀態語意與商業規則；空狀態三態（帳號無資料／冷啟動／無搜尋結果）維持不變。
- **驗證**：瀏覽器實測——類型計數 全部10／故事3／音樂2／人物1／品牌3／活動1，狀態 可租用5／競標3／獨家2；點「音樂」→2 筆、再點「可租用」→1 筆、搜尋「任天堂」→1 筆、清空回 10 筆；進階面板開合正常；`check_ds_sync.py` 全 PASS、`bump_ver` 已跑。

## 2026-07-25 · IP 詳情 hero 改兩欄：租用側欄收進內容欄（新元件 rent-block）＋四格事實改 bento KPI（B 反饋導入 · Q31）

使用者連續三輪圈出 hero 的空白與擠壓要求修正，最後裁示「全部放在右邊、照片在左邊不動」＋「這些做成 bento」＋「直接做在正式的」。

- **【B/版面】** `shared.css` `.ip-hero` 由三欄（封面 248｜內容 1fr｜側欄 auto 280）改 **兩欄 `200px minmax(0,1fr)`**：封面獨佔左欄（3:4、頂對齊，寬度刻意配合右欄文字自然高度，兩欄底部相近不留空洞），其餘全部走右欄。原 280px 側欄把內容欄壓到 217px——標題硬折行、meta 塌成單欄。
- **【B/元件套用】** 四格事實（版稅／起租費／租期／獨家）由自建的 `.ip-hero__meta` auto-fit 網格＋`.meta-cell` 純文字，改用站上標準 **`.bento > .kpi.bento--span-3`**，與儀表板／收入管理的指標列同一套讀法。
- **【A/新元件】** 新增 `ds-components/rent-block.css`（🟡 molecule）：hero 內的租用配置區，垂直兩組——組 1 租期（duration-chip）｜獨家（settings-row＋switch）、組 2 費用明細（`rental-card__breakdown`）｜結算（總額＋CTA）；組內 `1.3fr 1fr` 使兩組左右欄上下對齊，620px 以下改單欄。全部由既有元件組成，未新增視覺語彙。
- **【C/撤除】** `.ip-hero__meta`、`.ip-hero__side` 退場，`shared.css` 留墓碑並註明替代方案（`.meta-cell` 保留——create-project 仍消費）；`design-system.html` 的 `.ds-preview .ip-hero__side` 覆寫一併移除、hero preview 改三欄→兩欄。
- **【B/i18n】** 新增 `ip-detail.bd.title`（費用明細）、`ip-detail.checkout.title`（結算）兩鍵，en＋zh 皆補。
- **【D】** `design-system.html` 新增 4.75b Rent block 章節（demo＋規格表）＋TOC＋關係圖 chip 更新、IP hero 章節的 Anatomy／Classes／Layout 同步；`design-system.md` 新增 Rent block 條目＋IP hero 條目改寫；`STYLE-DECISIONS.md` Q31（含兩個被否決做法：封面拉長填滿、租用區跨滿卡寬）；探索頁 `docs/ip-detail-hero-demo.html`。
- **範圍**：純版面與元件重組，未動價格／版稅／名額／狀態／文案語意與任何商業規則。
- **驗證**：`check_ds_sync.py` 全 PASS；`bump_ver` 已跑；瀏覽器實測見回報。

## 2026-07-25 · IP Market 示例改真實知名 IP 名＋封面 promote 成可放真實圖（B 反饋導入 · Q30 · 附 ASSUMPTIONS UIA-088）

延續同日「IP Market 換示例卡」那筆：使用者改要真實知名 IP 名、且「圖片也要換」。本輪把三卡與詳情頁的示例名換成真實 IP，並把封面由漸層色塊 promote 成可放真實封面圖的結構。**版權／肖像界線**：真實 IP 名只作純文字提及、描述為原創通用措辭；受版權角色圖與真人藝人照不由 AI 生成或代抓，真實授權圖一律由使用者自備放入 `images/`（見 ASSUMPTIONS UIA-088）。

- **【B/元件】** `shared.css` 新增 `.ipm-card__cover`（IP Market 卡封面，由 ip-market 三個無 class 的 inline 漸層 div promote：3:4、品牌漸層佔位、`position:relative;overflow:hidden`）＋ `.ipm-card__cover-img`／`.ip-hero__cover-img`（`object-fit:cover`、絕對定位疊在佔位上）；`.ip-hero__cover` 加 `position:relative;overflow:hidden` 承接疊圖。無圖時顯示漸層＋IP 名，加 `<img class="…__cover-img" src="images/…">` 即鋪滿。比照站上 `.project-card__cover-img` 慣例。**Q30 裁決**。
- **【B/內容】** `ip-market.html` 三卡改真實 IP 名：
  - 哈利波特 Harry Potter（Story World·Warner Bros.·Available）
  - A-Lin（Music·Sony Music·Bidding）
  - 佩佩豬 Peppa Pig（Brand·Hasbro·Exclusive）

  封面 div 改用 `.ipm-card__cover`、更新 `data-search`；順帶消掉 card2／card3 的兩組 inline 裸 hex 漸層（頁面裸值降）。
- **【B/內容】** `ip-detail.html`（三卡共用詳情頁，對齊 card1）改哈利波特：title／麵包屑／hero 封面＋標題／owner 卡（avatar 首字→W、姓名→Warner Bros.）；描述改魔法世界通用措辭（保留 14 位角色以對齊 Assets 計數 14）。
- **【B/i18n】** `js/i18n.js` 同步 en＋zh：`ip-market.card1.meta`／`card2.title`／`card2.meta`／`card3.title`／`card3.meta`、`ip-detail.owner-line`／`desc`／`owner.bio`／`footer1`；HTML fallback 一併同步。
- **【D】** `design-system.md`（IP hero 條目補 `__cover-img`＋新增「IP market card cover」條目）／`design-system.html`（IP hero spec 表補 Classes＋Cover art 說明）／`STYLE-DECISIONS.md` Q30／`ASSUMPTIONS.md` UIA-088 同步。
- **範圍**：純示例資料＋封面結構，未動價格／royalty／名額／狀態／商業規則；三卡數量維持 3。取代同日前一筆的「擬真原創命名」（墨海江湖／島語聲景／香境識別）。**跨頁舊 IP 名仍未動**（my-ip／e-shop／通知／fan-detail）。
- **驗證**：`check_ds_sync.py` 全 PASS；`bump_ver` 已跑；瀏覽器實測見回報。

## 2026-07-25 · 專案詳情「關於專案 › 展示內容」改直式相簿＋方形裁切＋展示媒體（B 反饋導入 · 附 ASSUMPTIONS CCR-009）

使用者要展示內容照參考截圖的排版做，並把「相簿」改成**直式（portrait）多圖、第一張＝封面、每張可設定方形裁切位置**、可編輯。原本的固定素材槽（縮圖 1:1／海報 3:4／橫幅 16:9／相簿 3:2）換成單一直式相簿＋展示媒體兩區。**改到素材模型，另記 ASSUMPTIONS CCR-009。**

- **【B/版面】** `project-detail.html` 展示內容卡重寫：卡標題下加灰色說明；**圖片素材沿用 DS 既有元件** `.upload-assets`＋`.upload-tile--3x4`（直式，非自製）——加作用域 `.pd-crop-gallery`：第一格帶「封面」藥丸（`.pd-crop__badge`）＋方形裁切窗（`.pd-crop`）、末格空 `upload-tile--3x4`＝「＋新增圖片」；**展示媒體**＝展示影片／展示音樂兩格（`upload-tile--file`，`.form-grid` 並排）。原固定四槽 upload-assets（縮圖/海報/橫幅/相簿）與預告單格移除。
- **【B/互動】** 方形裁切窗 `.pd-crop`：滿寬正方形＋九宮格細線＋中央握把（讀作裁切工具、非空框），可**上下拖**（直式切方形寬滿版、只需選上下位置）：pointer 事件、位置限制在 [0, 圖高−框高]、存成 top%。內嵌 JS，支援滑鼠＋觸控。
- **【B/資料】** 相簿第一張（封面）由 render JS 用專案海報（`p.poster`／與 hero 同源）；其餘為直式 demo 圖。
- **【D/CSS】** `.pd-crop*` 與 `.pd-crop-gallery` 作用域進 `shared.css`（project-detail 專屬，比照 `.pd-hero`）：`.pd-crop-gallery` 內讓 `.upload-tile` 定位＋顯示縮圖（不走 data-upload 增強）、並中和 `.is-filled` 的「完成綠框」為中性邊；裁切窗用 `--foreground`＋九宮格 `color-mix` 細線、不觸品牌橘；封面藥丸沿用 `--primary`。i18n 加 `project-detail.showcase.*` 10 鍵。
- **修正（同輪二稿）**：初版用自製 `.pd-gallery`＋裸白框，被指「壞掉且沒照元件」→改沿用 `.upload-tile--3x4`＋乾淨裁切窗（九宮格＋握把）＋中和綠框。
- **修正（同輪三稿·現行）**：使用者要「用商品詳情那顆圖片元件（hover 顯示編輯/刪除），編輯開 popup 同時看到直與方、可調尺寸與位置」。→ 圖格改沿用商品詳情的 `.upload-tile.is-filled` ＋ hover `.upload-tile__actions`（編輯 `pencil`／刪除 `trash-2`，作用域補顯示、frosted 覆蓋層＝同一顆元件）；移除格上常駐裁切窗。**「編輯」開方形裁切彈窗 `#pd-edit-crop`（`.payout-modal`/`.payout-dialog`）**：左＝直式舞台＋可**移動**（拖框身）＋可**縮放**（拖右下握把）的方形選框、框外壓暗；右＝方形即時預覽（`background-size/position` 換算），左右即時連動。「刪除」移除該格。i18n 補 `project-detail.showcase.edit/delete`＋`pd-crop.title/sub/portrait/square`。原型：不落地。
- **驗證**：本機 `?id=f-i-am-speed` 切「關於專案」實測——直式三圖（無綠框）＋封面藥丸＋各自裁切窗、＋新增圖片格、展示影片/音樂兩格；實拖第一張裁切窗成功位移，console 無錯。`check_ds_sync.py` 全 PASS。**「公開資訊」卡的攤開＋可編輯下一輪做。**

## 2026-07-25 · 建立專案閘門卡：圖示不變色＋hover 左緣可選提示點（B 反饋導入 · Q28）

使用者裁示：閘門專案類型卡的引導圖示已選時不用變色（維持灰）；已選指示點維持右上、預設顯示；滑過未選卡時左緣冒一顆小橘點當「可選」提示。

- **【C】** `radio-card.css` `.radio-cards--gate` 移除「已選圖示轉 `--foreground`」規則——`.radio-card__lead` 恆為 `--muted-foreground`。
- **【B/微互動】** 閘門＝「選了就進下一步」的 picker、無持久選取態（對齊使用者兩張截圖：default 無點、hover 右上橘點）：resting 用 `.radio-cards--gate .segmented__btn--active::after { background: none }` 覆蓋掉 base 的已選橘點＝完全無指示點；`.radio-cards--gate .segmented__btn:hover::after` 才在右上冒橘點，並 `:hover` 把卡底提亮到比 Q9 `--accent` 再亮一階的 `color-mix(--foreground 6%, --accent)`（閘門 scoped，使用者要更亮）＝橘點＋亮底一起當 hover 提示。
- **【D】** `design-system.md`／`design-system.html`（radio-card `--gate` 說明）＋ `STYLE-DECISIONS.md` Q28 同步。
- **範圍**：只動 `radio-card.css` 與文件；`create-project.html` 標記不變。
- **驗證**：瀏覽器實測——已選卡圖示灰、右上橘點；hover 先募資左緣冒橘點；`check_ds_sync.py` PASS；`bump_ver` 已跑。

## 2026-07-25 · 全站資料表收斂到 variant-table 樣式（Q29 · 元件層）＋專案詳情三處呈現微調（B 反饋）

使用者兩輪並排比較後裁示「全站資料表都收斂成商品明細 `variant-table` 那個看」。資料表過去有兩支長相不同的元件（`ztor-table` 陰影 vs `variant-table` 自帶邊框），此輪把 `ztor-table` 的**框型**收斂成 `variant-table`（自帶邊框），站上資料表框型單一答案。密度先一併收斂、經 demo 後回退（見下）。同輪處理 project-detail hero 三處小調整。

- **【A/元件收斂】** `ds-components/table.css`：`.ztor-table` 由 `box-shadow` 改 **1px `--border` 自框**（對齊 `.variant-table-wrap` 自框做法）。**間距／字級維持原樣**（padding `sp-16/sp-20`、表頭 fs-13、內文 fs-14）——首版連密度一起收斂到 `sp-10/sp-12`＋fs-11/fs-13，使用者看密度 demo（`_demo-table-density.html`）後選「框型收斂、間距復原」，故回退密度、只留邊框。詳見 STYLE-DECISIONS Q29。
- **【A/防雙框】** 三種容器脈絡各自處理：(1) 新增規則 `.card > .ztor-table { border:0; border-radius:0 }`——flush 表（earnings／event-detail，表格是出框 `.card` 直接子代）由卡出框、取消表格自框；(2) inset／standalone 表（project-detail 發布更新／合作者包在 `overflow-x` 容器、earnings `.bd-tablecard`）保留自框；(3) `ds-components/admin-ip-bank-table.css` 的 `.admin-table-wrap .ztor-table` 由 `box-shadow:none` 改 `border:0`（wrap 出框）。
- **【B/版面】** `project-detail.html`：預覽鍵 `btn--ghost`→`btn--outline`（與「編輯」同款）、加 `eye` icon、文案 `在 Ztor 上預覽`→`預覽`（i18n `project-detail.btn.preview` en `Preview on Ztor`→`Preview`、zh 同步）。
- **【B/版面】** `project-detail.html`：hero 徽章列（`.pd-hero__badges`，狀態＋型別）由「標題／簡介下方」移到**標題上方**（`.pd-hero__head` 之前）。
- **【D/文件】** `design-system.md` §4.23 Table 與 `design-system.html` table demo 說明同步改寫（自框／密度／字級／三脈絡防雙框）；`STYLE-DECISIONS.md` 新增 Q29。
- **範圍**：只動呈現層，未改 `variant-table` 本身、未動 `.ztor-table__feature`／狀態格／可展開列等既有語意與各頁欄位。7 個 `ztor-table` 消費頁全部沿用同一元件、無逐頁改。
- **驗證**：`check_ds_sync.py` 全 PASS；`bump_ver`→`20260725a`；瀏覽器實測 project-detail（inset 自框）、earnings 交易明細（flush 卡出框＋可展開列）、admin-platform-fees（wrap 出框費率樹）、event-detail（3 表 computed `border:0`）逐一確認無雙框、密度正常。

## 2026-07-25 · IP Market 三張示例卡換成擬真原創華人風 IP（B 反饋導入）

使用者要 IP Market 套用「更像華人市場有名 IP」的示例資料。決策取「擬真原創、華人風格」而非真實知名名號——貼近華人熟悉題材與命名，但為原創虛構，避免把真實權利人虛構成在 ztor 平台掛牌授權。維持既有三型（Story World／Music／Brand）、三狀態（Available／Bidding／Exclusive）與所有價格／版稅／名額／素材包數字不動，只換名稱、封面字、權利人、題材與 `data-search` 關鍵字。

- **【B/內容】** `ip-market.html` 三張卡換名，封面字改中文兩字（CJK 經 fonts.css 三 stack fallback 到 Noto Sans TC）、更新 `data-search` 中英＋權利人關鍵字；card3 封面字級由 fs-22 回正 fs-24（新名較短）。三卡內容：
    - 墨海江湖 Ink Sea Chronicles（水墨武俠故事世界 · 柳三川）
    - 島語聲景 Island Tongues（台客語器樂庫 · 海風錄）
    - 香境識別 Incense Realm（宮廟常民美學視覺系統 · 三合院設計所）
- **【B/內容】** `ip-detail.html`（三卡共用的詳情頁，對齊 card1）：title／麵包屑／hero 封面＋標題／owner 卡（avatar 首字 H→柳、姓名→柳三川 Liu San-chuan）全部改成墨海江湖；描述改水墨武俠 jianghu 題材（保留 14 位具名角色以對齊 Assets 分頁計數 14）。
- **【B/i18n】** `js/i18n.js` 同步 en＋zh：`ip-market.card1.meta`／`card2.title`／`card2.meta`／`card3.title`／`card3.meta`、`ip-detail.owner-line`／`desc`／`footer1`；HTML fallback 文字一併同步成新 en 值。
- **範圍**：純示例資料替換，未動任何 token／元件／版面／商業規則／狀態；三卡數量維持 3（規格「3 sample listings」不變）。**跨頁未改**（見下）。
- **待決**：舊 IP 名（Goldfish Patterns／Salt & Bitumen）另散見於 `my-ip`／`e-shop`／通知／`fan-detail` 的 i18n，屬各頁自有示例，本輪不動；是否全站對齊待使用者裁決。
- **驗證**：`check_ds_sync.py` 全 PASS；`bump_ver` 已跑；瀏覽器實測見回報。

## 2026-07-24 · 專案詳情麵包屑加入內容分類（專案／分類／專案名），移除 hero 分類徽章（B 反饋導入）

使用者要麵包屑帶內容分類、形成「專案 / 分類 / 專案名」三段；既然分類已進麵包屑，hero 徽章列那顆分類徽章（原 `#pd-badge-cat`）就重複，移除。

- **【B/版面】** `project-detail.html` 麵包屑（`.pd-detail__breadcrumb`）在「專案」與專案名之間插入 `#pd-crumb-cat` 一段（含分隔線）；hero 徽章列（`.pd-hero__badges`）刪掉 `#pd-badge-cat`，剩狀態（`badge--orange`）＋型別（`badge--info`）兩顆。
- **【B/JS】** render：原 `badge('pd-badge-cat', …)` 改為 `set('pd-crumb-cat', t(store.catLabel(p.cat)))`，分類值資料驅動放進麵包屑；狀態／型別徽章與其餘渲染不變。
- **驗證**：本機 `?id=adia-chan` 實測——麵包屑「專案 / 電影 / 陳松伶精選」三段，hero 徽章只剩「已上線・先募資」，console 無錯，`check_ds_sync.py` 全 PASS。

## 2026-07-24 · 建立專案閘門卡加回頂部圖示＋標題/描述間距加大（B 反饋導入 · Q28 · radio-cards `--gate`）

使用者指定：閘門（第一頁）的專案類型卡上面要把圖示加回來，且卡內標題與描述的間距要大一點；流程內表單維持純標題不動。

- **【B/元件變體】** `radio-card.css` 新增 `.radio-cards--gate`：卡內改縱向堆疊（頂部引導圖示 `.radio-card__lead` → 標題 → 描述），`.radio-card__text` 間距由 3px 加大到 `--sp-6`，radio 點（::after）改絕對定位固定右上；`.radio-card__lead` 24px、色 `--muted-foreground` 恆定（已選不變色）。僅閘門套用。
- **【B】** `create-project.html` 閘門容器加 `radio-cards--gate`，三張卡各加回 lucide 圖示（rocket／trending-up／calendar）。流程內表單（`radio-cards--3`、無 `--gate`）維持純標題、無圖示。
- **【D】** `design-system.md`／`design-system.html`（radio-card 條目＋Classes＋新增 `--gate` demo 卡）、`STYLE-DECISIONS.md` Q28 同步；`.radio-cards--3` 的 Classes 說明順手清掉先前已撤的「橘底」字樣。
- **範圍**：只動 `create-project.html` 閘門與 `radio-card.css`＋DS 文件；型別 key、FLOWS、產品規則未改。
- **驗證**：瀏覽器實測——閘門三卡皆有頂部圖示、標題/描述間距變寬、已選右上小橘點；表單維持純標題。`check_ds_sync.py` PASS；`bump_ver` 已跑。

## 2026-07-24 · 活動頁篩選區改用電子商店同款 list-toolbar＋filter-tabs（B 反饋導入）

使用者附兩張截圖（活動 vs 電子商店），要求活動頁的篩選區「改成和電子商店一樣的設計」。

- **【B/版面】** `events.html` 篩選區由「時段 tabs 一列＋segmented 狀態切換＋滿版搜尋 field-pill 一列」重構為 e-shop 兩層結構：上層 `.list-toolbar`（時段底線式 `tabs--underline-short` 在左｜`.list-toolbar__actions`＝搜尋收合 `search-collapse`＋`＋新增活動` primary 鈕在右），下層 `.list-status-row` 的 `.filter-tabs.filter-tabs--brand` 淡橘藥丸狀態篩選（全部／售票中／草稿，各帶即時計數）。「＋新增活動」由 page-intro 移入工具列（比照 e-shop 無 page-intro 建立鈕）。全部重用既有 ds-components（list-toolbar／filter-tabs／search-collapse／tabs），移除本頁 segmented.css 依賴。
- **【B/元件套用】** 狀態切換由 `segmented` 改 `filter-tabs`：新增 `statusCount()` 依目前時段重算每項數量（全部＝時段內非草稿、售票中＝時段內售票中、草稿＝跨時段全部），填入 `.filter-tabs__count`；active 由 `filter-tabs__item--active`＋`aria-selected` 表示。搜尋改收合式（`search-collapse`）：點放大鏡展開、✕／Esc／點外部無字收起，移除舊的常駐 field-pill 與 `#ev-search-clear`。
- **【B/sticky】** 比照 e-shop：wrapper `.ev-list-controls` 併吞清單，桌機（≥901px）`.list-toolbar` 貼頂 top:0、`.list-status-row` 貼 top:74px（58 tab 列高＋16 間距），屬本頁捲動容器版面、非元件。
- **【B/搜尋修正】** 搜尋比對由「僅 `data-search`」改「`data-search`＋當前渲染文字」，讓各 persona 覆蓋後的真實名稱（如周湯豪「重慶」「成都」）也搜得到——原本 data-search 只含 default persona 關鍵字。
- **範圍**：只動 `events.html`＋i18n 兩鍵（`events.btn.search`／`events.search.close`）；未改活動資料、狀態機或列結構。
- **驗證**：本機 server 實測（nick persona）——上下兩排版面與 e-shop 一致；搜「重慶」命中重慶場、售票中／草稿切換正確、計數 全部4／售票中3／草稿2、搜尋收合展開正常；`check_ds_sync.py` PASS；`bump_ver` 已跑。

## 2026-07-24 · 建立專案「專案類型」picker 收斂為建立商品同款 radio-cards、`--menu` 系列退場（B 反饋導入 · Q28 修訂）

使用者比對建立商品的「商品選項」（`.segmented.radio-cards`，灰卡＋右上小橘點），指出建立專案的專案類型 picker「根本長不一樣」，要求改用那個元件、並把先前用的 list-menu 樣式從元件庫刪掉。

- **【C】撤回上一輪的 `.radio-list--menu`／`--menu-compact`／`--menu-row` 變體**：`radio-list.css` 相關規則整段移除、留 tombstone；`design-system.html` 的 `--menu` demo 卡移除；`design-system.md` Radio list 條目改記退場。base `.radio-list` 與 `--collapsible`（上架設定用）不受影響。
- **【B/元件套用】** `create-project.html` 閘門與流程內表單的專案類型都改用 `.segmented.radio-cards radio-cards--3`：閘門帶標題＋描述（`.radio-card__sub`）、表單只標題；`data-gate-type`／`data-type` hook 不變，`syncTypeUI` 兩個分支都改 toggle `segmented__btn--active`。閘門移除原本的 lucide 圖示（radio-cards 無內容圖示槽、與建立商品一致）。
- **【C】移除橘色已選底（修訂本日稍早的 Q28）**：`radio-card.css` 的 `.radio-cards--3` 已選底色覆寫（40% 橘）刪除，`--3` 收斂成純 3 欄版面變體；已選一律回到 radio-cards 基準（Q13：灰邊框卡＋右上小橘點、無底色），與建立商品「商品選項」完全一致。
- **【D】** `STYLE-DECISIONS.md` Q28 改寫為「專案類型 picker 統一用 radio-cards、無橘底、`--menu` 退場」；`design-system.md`（Radio list／Radio card）、`design-system.html` 同步。
- **範圍**：只動 `create-project.html` 兩個 picker、`radio-list.css`、`radio-card.css` 與 DS 文件；型別 key、FLOWS、產品規則未改。
- **驗證**：瀏覽器實測——閘門與表單皆為灰卡＋右上小橘點、無橘底，與建立商品一致；閘門選卡→表單同步、stepper 依型別展開（preorder 4 步）。`check_ds_sync.py` PASS；`bump_ver` 已跑。

## 2026-07-24 · 支持方案改「共創套組編輯器」＋promote bundle-editor 元件（B 反饋導入 · 附 ASSUMPTIONS CCR-008）

使用者指定：Phase 4（`full` 完整版）中，專案詳情「方案與承諾 › 支持方案」要照建立流程 create-campaign 的「新增套組」編輯器做。原本欄位（方案名稱／價格／E-Shop 商品引用／名額／額外權益）換成共創套組模型。**牽涉產品資料欄位，另記 ASSUMPTIONS CCR-008。**

- **【D/元件】** promote `ds-components/bundle-editor.css`（`.fc-bundle`／`.fc-bundle__head`／`.fc-item-row`／`.fc-item-fields`／`.fc-add`／`.fc-add-item`）——由 create-campaign 頁內 `.fc-*` 樣式升進，tokenize 間距（sp-6/8/10/12/16/18）、固定尺寸保留（96px 縮圖、56/48px 鈕高）。第二消費者＝project-detail。**create-campaign 仍保留頁內同名副本，待遷移（治理待辦，已記 design-system.md）**——該檔正被另一 session 編輯，暫不動以免衝突；兩份不同頁、不同載入，無 runtime 衝突（check 8 只抓 [data-theme]／token 洩漏，plain class 不觸發）。
- **【B/版面＋JS】** `project-detail.html` 的 pledges 面板：mount 由 `#pd-tier-editor`→`#pd-bundle-editor`；編輯器 JS 整段換成套組版：每張套組＝`.card.fc-bundle`（套組名稱／套組描述 `.form-grid` 2 欄 → 含股份／名額 `.form-grid` 2 欄 → 套組商品多件 `.fc-item-row`：`.upload-tile`＋名稱/描述＋移除），滿版新增鈕 `.fc-add`（新增套組）／`.fc-add-item`（新增商品）。至少 1 個套組（原至少 3）。原型：不持久化、不計算。
- **【B/i18n】** `js/i18n.js` 新增 `pd-bundle.*` 17 鍵；舊 `pd-tier.*` 鍵保留未刪（無害）。
- **【D/DS】** design-system.html 加 4.15b Bundle editor（link＋TOC＋demo 卡＋spec 表）；design-system.md Pillar 4 加 Bundle editor 條目。
- **【B/資料】** 起始套組假資料改**依當前專案**產生（不再是 Early-bird/Vinyl 泛用值）：由 `?id=` 對應共用 `ztorProjects`（與 hero 同一物件），套組/商品名稱帶專案名、描述用專案語意，字樣依語言中英切換；**套組商品縮圖先用專案封面／海報**（`is-filled`＋`data-upload`＋`.upload-tile__thumb`，純 CSS 顯圖）。新增的空商品格維持可加圖「＋」。
- **驗證**：本機切「方案與承諾」（LOVE RAGE HOPE）實測——套組名稱「數位版」、描述帶專案名、商品列縮圖顯示專案封面，console 無錯。`check_ds_sync.py` 全 PASS（89 元件；WARN 5/7/11 存量）。

## 2026-07-24 · 建立專案「專案類型」picker 改橫排＋表單改用 radio-cards＋已選更明顯（B 反饋導入 · Q28）

使用者截圖指定：閘門的專案類型清單要橫向排列、已選顏色再明顯一點；進入內頁後表單的「專案類型」要改用「建立商品」的並排卡元件（`.segmented.radio-cards`）。

- **【B/元件套用】** `create-project.html` 表單 step-1 的「專案類型」由 `.radio-list--menu-compact` 改成建立商品同款 `.segmented.radio-cards radio-cards--3`（三張並排卡、僅標題），`data-type` hook 不變；`syncTypeUI` 的表單分支改 toggle `segmented__btn--active`（閘門仍用 `radio-list__item--active`）。補掛 `radio-card.css`。
- **【B/元件變體】** 閘門的 `.radio-list--menu` 加 `--menu-row` 變體＝橫向三欄等寬卡（卡內 icon→標題→描述縱堆、radio 點置右上）。
- **【B/已選強度 · Q28】** 兩個專案類型 picker 的已選由灰底／小橘點加強為淡橘底 `color-mix(--primary 40%, --input-surface)`：`radio-list.css` 改 `.radio-list--menu ...--active`（原 `--accent`）、`radio-card.css` 新增 scoped `.radio-cards.radio-cards--3 .segmented__btn--active`。**只影響這兩個 picker**，全站其他 `.radio-cards` 維持 Q13 已選呈現（灰邊框＋小橘點）。
- **【D】** `radio-card.css` 新增 `.radio-cards--3`（3 欄，雙 class 提權蓋過預設 2 欄）；`design-system.md`（Radio list／Radio card 條目）、`design-system.html`（radio-card Classes）、`STYLE-DECISIONS.md` Q28 同步。`radio-list--menu-compact` 變體 CSS 暫留（無 consumer，未 tombstone）。
- **範圍**：只動 `create-project.html` 兩個 picker 與 `radio-list.css`／`radio-card.css`；型別 key、FLOWS、產品規則均未改。
- **驗證**：瀏覽器實測——閘門三卡橫排、已選淡橘底明顯；點卡進表單，表單「專案類型」為三張並排卡、已選同款淡橘底，stepper 依型別展開（fund 5 步）；DOM 核對 `formActive` 對應 `segmented__btn--active`、`radio-cards--3` grid=3 欄、`--menu-row` display=grid、radio-card.css 已掛。`check_ds_sync.py` PASS（WARN 皆存量）；`bump_ver` 已跑。

## 2026-07-24 · 活動頁假資料改用周湯豪真實演出史（nick persona，B 反饋導入）

使用者反饋：活動頁的假資料都用周湯豪的演唱會資訊，本地有資料可調用（`persona/NICKTHEREAL/資料彙整.md` 二、演唱會/活動史）。

- **【B/i18n】** `js/i18n.js` 的 `PERSONA_DICT.nick` 活動覆蓋層整段換成真實演出：即將舉辦＝REALIVE 世界巡迴・中國段（成都 2026/3/28 東郊記憶 BPM／重慶 2026/4/25 蜚聲 LIVEHOUSE）＋台灣祭墾丁大灣演唱嘉賓（2026/4/4 屏東）；共看派對列改為 REALIVE (R2) 演唱會電影線上共看；已舉辦＝motorola REALIVE (R2) 特仕版臺北小巨蛋（2024/11/23）、LOVE·RAGE·HOPE Live House Tour 臺北 Legacy MAX（2025/9/19）；草稿＝REALIVE 世界巡迴廣州場、屏東黑鮪魚文化觀光季海洋音樂會。每列補真實日期（`row*.datetime`）、場館（`row*.venue`）、類型（`row*.meta`），event-detail 系列頁同步改中國段成都/重慶/廣州。**只動 nick persona 覆蓋層，default persona 通用假資料不變**（符合「周湯豪內容只集中在 nick 區塊」的架構）。
- **【B/縮圖】** `events.html` 三列縮圖重新配對真實作品：共看派對→`nick-r2.jpg`（R2 海報）、墾丁音樂節→`hero-event.jpg`（演唱會人群）、小巨蛋 R2 特仕版→`nick-mxw.jpg`（現場照）；其餘沿用（成都 REALIVE→`nick-realive.jpg`、重慶→`nick-baipa.jpg`「白趴」、LOVE RAGE HOPE→`nick-lrh.jpg`）。
- **範圍**：只動 `js/i18n.js`（nick 覆蓋層）與 `events.html`（3 張圖）；資料為真實演出史、屬 demo persona 內容，非產品規則。
- **驗證**：本機 server 切 nick persona 實測——四列即將舉辦全部顯示真實巡演名稱、日期、場館，圖片 4 張皆 200 OK 並解碼；無 console error；`check_ds_sync.py` PASS。

## 2026-07-24 · projects 發行模式由下拉改攤成 filter-tabs 一整排、＋cheat code 版本框去橘（B 反饋導入）

- **【B】** `projects.html` 的發行模式（`#proj-type` select）改成一整排 `.filter-tabs.filter-tabs--brand`（`#proj-types`：所有類型／直接發佈／募資／預購，各帶計數），同一行靠左，對照 e-shop 狀態列（使用者指定「像截圖一樣攤開、同一行靠左」）。內容類別 select 以 `margin-left:auto` 推到右邊；`.list-status-row` 移除 `--end`。JS：`#proj-type` 的 change 監聽改為 `#proj-types` 的 click 監聽，render 同步 active＋每型計數（全部＝總數、其餘＝該發行模式的專案數）。head 補載 `filter-tabs.css`。此為前一輪「chip→下拉」的再反轉（發行模式現以攤開陳列為準）。
- **【B】** cheat code 面板「版本 · Build version」外框（`js/devtools.js` 的 `.ztd__group--top`）去掉品牌橘：border 由 `color-mix(--primary 55%,--border)` 改 `--border`、背景由 `color-mix(--primary 7%,--card)` 改 `--card`（使用者「不要橘色框框」）。屬 devtools 面板樣式、非 DS 元件。
- **【B】** 狀態 tabs 計數（`.tabs--count-plain .tabs__item-count`）顏色由 `--foreground-muted`（偏亮）改最暗文字 token `--muted-foreground`（使用者「顏色再深一點」）；`tabs.css`，同步 DS 註記。
- **【B】** 清單欄序：類別欄移到當前目標之前（`project-list.css` grid 由 image·project·goal·time·category·status·chevron 改 image·project·**category·goal**·time·status·chevron；`projects.html` head 與 rowHtml、DS demo/anatomy 三處同步）。
- **【B】** 當前目標的金額（`.project-list__goal-amt`）加 `margin-top:var(--sp-4)`，與上方進度條再拉開（使用者反饋，疊在 column gap 上）。
- **【B】** 三處字型微調（使用者反饋）：百分比 `.project-list__goal-pct` 字重 `--fw-bold`→`--fw-semibold`；類型標籤 `.project-list__kind` 顏色 `--foreground-muted`→`--muted-foreground`（深）＋字重 `--fw-medium`→`--fw-regular`（細）。
- **【B】** 欄名「當前目標」改「專案目標」（i18n `projects.col.goal`：zh 專案目標／en Project goal；DS demo columnheader 同步）。
- **【B】** 卡片檢視格線間距 `.project-grid` gap `--sp-16`→`--sp-20`（使用者「間距稍微大一點」）；`shared.css`。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量）；發行模式點擊實測（募資→5 列、所有類型→12）、靠左 0px／內容類別靠右 0px；cheat code 版本框 border=`--border`／底=`--card`。

## 2026-07-24 · 建立專案閘門：移除左上返回鈕、改表單底部置中關閉鈕（B 反饋導入）

使用者指定：把閘門畫面左上角的「返回上一頁」鈕刪除，改在型別清單下方置中放一個帶「✕」圖示的關閉鈕。

- **【C／B】** `create-project.html` 閘門移除左上 `.wizard__gate-back`（`btn--ghost`＋chevron＋「返回上一頁」文字），改在 `.radio-list--menu` 下方新增 `.wizard__gate-foot`（置中）內含 `.wizard__gate-close`（`btn--icon-circle`＋`x` 圖示）。`data-gate-back` hook 移到關閉鈕、離開行為不變（`history.back()`，無歷史回 `projects.html`）；`cpp.gate.back` 保留為關閉鈕 aria-label（行為＝返回上一頁）。
- **【D/CSS】** `shared.css` 的 `.wizard__gate-back` 規則換成 `.wizard__gate-foot { display:flex; justify-content:center; margin-top: var(--sp-32); }`；關閉鈕沿用既有 `btn--icon-circle`（button.css），無新元件 CSS。
- **範圍**：只動 `create-project.html` 閘門與其 `shared.css` 版面；型別 radio-list、表單、FLOWS、產品規則均未動。
- **驗證**：瀏覽器實測——閘門左上已無返回鈕，型別清單下方置中一顆圓形 ✕ 關閉鈕；DOM 核對 `[data-gate-back]` 僅 1 個（＝關閉鈕）、`.wizard__gate-foot` justify-content=center、舊 `.wizard__gate-back` 已無。`check_ds_sync.py` PASS（WARN 皆存量）；`bump_ver` 已跑。

---

## 2026-07-24 · 活動清單整列可點進詳情、編輯改連詳情頁、縮圖換真實活動圖片（B 反饋導入）

使用者反饋：活動清單點整條都要能進入活動詳情；三個點點選單的「編輯」也應該進活動詳情（而非建立活動精靈）；縮圖不要停在空狀態的日曆圖示，要換成真的活動圖片。

- **【B/互動】** `events.html` 新增整列可點（比照 `orders.html` 既有慣例）：`.product-list--events .product-list__row { cursor: pointer }` ＋ JS 在 `#ev-list` 委派 click，排除點在 `.dropdown` 或 `a` 上的情況，其餘一律導向 `event-detail.html`；含無標題連結的草稿列（row6／row7）在內全部可點。
- **【B/連結】** 8 列「⋯ → 編輯」的 `href` 由 `create-event.html` 改為 `event-detail.html`（Duplicate／Delete 仍是無導向按鈕，未動）；頁首與空狀態的「＋ 新增活動」按鈕維持指向 `create-event.html`，未誤改。
- **【B/縮圖】** 8 列縮圖由 `.product-list__image--placeholder`＋calendar/film icon 換成真實 `<img>`（沿用既有 `.product-list__image img` 樣式，無新 CSS）：row1／row2 用 `images/projects/nick-realive.jpg`／`nick-baipa.jpg`（REALIVE 巡演海報）、Watch Party 用 `images/hero-event.jpg`、row3 用 `nick-mxw.jpg`、row4 用 `nick-r2.jpg`（(R2) REALIVE 海報）、row5 用 `nick-lrh.jpg`（LOVE RAGE HOPE 封面）、row6 用 `nick-flames.jpg`、row7 用 `nick-wln.jpg`，皆為既有素材庫既有圖片、無新增檔案。
- **範圍**：只動 `events.html`；未改活動資料欄位、狀態機或 event-detail 頁本身。
- **驗證**：本機 server 實測——點資料列非連結區域（如日期時間欄）與無連結的草稿列標題皆正確導向 `event-detail.html`；kebab 選單「編輯」連結原生 href 已指向 `event-detail.html`；8 列縮圖皆顯示對應真實圖片、無空狀態圖示殘留；無 console error。`check_ds_sync.py` PASS（WARN 皆存量）；`bump_ver` 已跑。

---

## 2026-07-24 · 專案詳情表單與支持方案改用既有元件（B 反饋導入）

使用者確認支持方案採建立流程的卡片式編輯方向，但維持既有價格、E-Shop 商品引用與額外權益的資訊邊界。

- **【B/表單】** 基本資料、排程、合作者、里程碑與發布更新 popup 的欄位統一改用 `.field`，成對資料改用 `.form-grid`；保留 `.payout-modal/.payout-dialog` 外殼、既有 ID、儲存 hook 與本頁原型行為。
- **【B/支持方案】** 方案由單一 `pd-edit-tier` popup 改為頁內多組 `.form-section--outlined` 編輯器；每組明確呈現方案名稱、價格、E-Shop 商品引用、名額／不限量與額外權益，商品只從既有 E-Shop picker 選取，不建立自由商品欄位。
- **【B/下限與互動】** 預填三組既有方案，可新增／移除方案與新增／移除額外權益；只有三組時移除方案按鈕停用並顯示最低三組提示。所有操作仍是本頁、不持久化的 demo，不新增價格／分潤計算或發布後限制。
- **【D】** 重用既有 `field-system`、`form-grid`、`form-section`、`picker`、`upload-tile` 與 button 元件，未新增 CSS 或 design-system 元件；新文案及動態 editor 標籤均補雙語 i18n。

## 2026-07-24 · 專案類型名稱精簡（B 反饋導入）

使用者確認專案頁類型統一使用短而對稱的名稱，保留既有 type key 與篩選行為。

- **【B】** projects 的清單類型標示與篩選選項由「先募資／直接上線／預購」改為「募資／直接發佈／預購」；僅改繁中呈現文案，不改專案資料、篩選或建立流程。
- **【D】** `BUILD-SPEC.md` 同步記錄。

## 2026-07-24 · 建立專案的專案類型改為圖示直列選單（B 反饋導入）

使用者指定先處理「專案類型」：移除已選大卡的橘色框，改用圖示引導的深色直列選項面板；內容類型、付費模式與發布時間維持原樣。

- **【B】** `create-project.html` 的流程前閘門與 About 內「專案類型」同步改為 `.radio-list--menu`；前者保留模式說明，表單內使用 compact 版。選中狀態改為列底色＋右側橘點，仍由既有 `chooseType` 驅動 FLOWS。
- **【D】** `radio-list.css` 新增 `--menu`／`--menu-compact` 變體，design-system、`BUILD-SPEC.md`、`requirements-map.md`、`STYLE-DECISIONS.md` 同步記錄；未改任何產品規則。

## 2026-07-24 · 專案狀態分頁計數改為純文字（B 反饋導入）

使用者指定專案頁狀態分頁的筆數不要自成黑色 pill，而是直接顯示為較高對比的文字；保留標籤與數字之間的節奏。

- **【B】** Tabs 新增 opt-in `.tabs--count-plain`，移除 `.tabs__item-count` 的填色與內距、改用 `--foreground-muted`；只套用至 projects 狀態列，其他計數徽章維持原樣。
- **【D】** Tabs 三件套與 `BUILD-SPEC.md` 同步記錄。

## 2026-07-24 · 專案清單目標格加上左右內距（B 反饋導入）

使用者指定「當前目標」欄的內容不要貼齊兩側；既有欄寬與欄間距維持不變，改由格內留白處理。

- **【B】** `project-list.css` 的 `.project-list__goal` 新增 `padding-inline: var(--sp-4)`，左右各 4px；三排資訊與非 campaign 的「—」沿用相同內距。
- **【D】** design-system 三件套、`BUILD-SPEC.md` 與 `requirements-map.md` 同步記錄。

## 2026-07-24 · 專案清單加大欄間留白（B 反饋導入）

使用者希望加寬「當前目標」後，欄位兩側也保有呼吸空間；桌機／中寬版的欄間距微增，窄版既有兩維 gap 不動。

- **【B】** `project-list.css` 將共用列的 `gap` 拆為列距 `--sp-16` 與欄距 `--sp-20`，讓所有桌機欄位左右多出 4px 留白。
- **【D】** design-system 三件套、`BUILD-SPEC.md` 與 `requirements-map.md` 同步記錄此間距規則。

## 2026-07-24 · 設定區入口按鈕統一為線框（B 反饋導入）

- **【B】**「發布更新」「＋ 新增合作者」與「前往我的 IP 連結」統一為滿寬、文字置中的 outline 按鈕；合作者新增入口從卡頭移到卡底，與發布更新採相同位置與視覺層級。行為與連結目的地不變。

## 2026-07-24 · 移除 IP Rental 未綁定提示（C 反饋導入）

- **【C】** 使用者指定移除專案設定 IP Rental 卡中的「尚未綁定 IP／權利揭露」提示橫幅；保留卡標題與「從 IP 資產庫連結」操作，不改綁定流程或產品規則。

## 2026-07-24 · IP Rental 入口改為前往按鈕（B 反饋導入）

- **【B】** 保留既有 `my-ip.html` 連結目的地，按鈕由 outline 改為 primary，文案改「前往我的 IP 連結」；僅強化入口層級，不改 IP 綁定流程。

## 2026-07-24 · 專案詳情設定分頁的更新與合作者改為欄位式清單（B 反饋導入）

使用者要求更新與合作者的資料欄位清楚分開並有表頭；發布更新改為區塊下方的正式主按鈕，專案完成則在發佈時一併選擇。

- **【B/更新】** `project-detail.html` 的「發布更新」重用既有 `.ztor-table`，拆為更新內容／受眾／發布日期／通知四欄；header 的 ghost 按鈕改為表格下方滿寬 primary「發布更新」按鈕。動態更新直接產生 `<tr>`，不再依賴 data-list row。
- **【B/完成選項】** 移除常駐「標記專案完成」按鈕；`pd-edit-update` popup 增加「此更新同時標記專案完成」checkbox。送出時保留新增更新列，勾選才把狀態 badge 轉為完成，沿用既有 prototype 的非持久化行為。
- **【B/合作者】** 合作者卡擴為 `bento--span-12`，重用 `.ztor-table` 並拆成合作者／角色／確認狀態／分潤四欄；新增合作者後同樣以 table row 呈現待確認與分潤。
- **【D】** 全部重用既有 table、button、modal 與 token，未新增 design-system 元件或改變產品規則；新增欄位與動態狀態字串皆補雙語 i18n。

## 2026-07-24 · 專案清單加寬當前目標欄（B 反饋導入）

使用者指出三排目標資訊需要更多橫向空間，降低金額被截斷的機率；桌機與中寬版同步微增欄寬，名稱欄繼續吸收剩餘空間。

- **【B】** `project-list.css` 的目標軌由 128px 增為 144px，≤1180px 由 120px 增為 136px；窄版堆疊規則不變。
- **【D】** design-system 三件套、`BUILD-SPEC.md` 與 `requirements-map.md` 同步記錄兩個 breakpoint 的欄寬。

## 2026-07-24 · 專案詳情操作鈕移至麵包屑同列（B 反饋導入）

使用者指定「編輯／在 Ztor 上預覽／發布更新」應與「專案／專案名稱」麵包屑在同一列，讓 hero 標題保持單純、閱讀不被操作鈕切開。

- **【B/版面】** `project-detail.html` 用僅此頁的 `.pd-detail__topbar` 包住 breadcrumb 與既有 `.pd-hero__actions`；桌面版左側保留專案脈絡、右側保留原三鈕的文字、順序與 hooks。`.pd-hero__head` 只保留標題。
- **【B/RWD】** `shared.css` 的 topbar 使用 flex 對齊與 `flex-wrap`；窄螢幕時麵包屑與按鈕群自然換列，按鈕群本身亦可換行，避免擠壓或溢出。
- **【D】** 純 page-specific layout，沿用既有 button／token，未新增 design-system 元件或產品行為。

## 2026-07-24 · 專案清單目標資訊改為三排（B 反饋導入）

使用者指定進度條應固定落在第二排，並把百分比縮小一級：三排依序為「百分比／橘色進度條／已募／目標金額」，讓比例、視覺進度與實際金額逐行閱讀。

- **【B】** 移除先前的 `.project-list__goal-main` 首排包裝；既有 `.project-bar` 維持共用，固定承接目標格的第二排。
- **【B】** `.project-list__goal-pct` 由 `--fs-16` 改為既有 `--fs-14` token，仍保留 bold；金額與非 campaign 的「—」規則不變。
- **【D】** `projects.html` renderer、design-system 三件套 demo／anatomy／Class API、`BUILD-SPEC.md` 與 `requirements-map.md` 同步更新。

## 2026-07-24 · 專案清單把類型併入專案識別區（B 反饋導入）

使用者指定類型應貼近專案名稱閱讀，而不是獨立佔一欄：每列改為「類型／名稱／描述」三層識別，讓目標、倒數、類別與狀態保留更多空間。

- **【B】** `projects.html` 將既有類型文字移入 `.project-list__project` 最上方的 `__kind`；`project-list.css` 以既有字級與間距 token 定義其弱於名稱、強於描述的層級。
- **【C】** 移除清單表頭與列中的獨立 `__type`／`__col-type`，桌機 grid 由 8 軌收為 7 軌；≤1180px 不再隱藏類型，因為類型已是專案識別的一部分。
- **【D】** `design-system.md`／`design-system.html` 的 demo、anatomy、Class API、RWD 說明與 `BUILD-SPEC.md`／`requirements-map.md` 同步。

## 2026-07-24 · 專案清單的當前目標加入細進度條（B 反饋導入）

使用者以「金額在上、深色軌道下方、橘色填滿」的參考圖指定專案清單當前目標欄的呈現；既有百分比與已募／目標金額保留，讓比例與實際金額都能直接讀到。

- **【B】** `projects.html` 的 `projectBarData()` 統一驗證 `p.bar.pct`（限制在 0–100%、保留既有 `success` 變體），卡片與清單共用；`goalCell()` 在既有目標資料同時有有效百分比時，於百分比與金額下方重用 `.project-bar`。缺少 campaign 資料或有效百分比時不補數字、不輸出進度條，非 campaign 列維持 muted「—」。
- **【B/a11y】** 進度條標 `aria-hidden="true"`，因為百分比與已募／目標金額已是可讀文字，避免重複朗讀。
- **【B/RWD】** ≤760px 的 `.project-list__status` 不再與目標共用第二行格位，改用右側獨立軌道；chevron 隨之移到最右軌，避免 badge 壓住金額或進度條。
- **【D】** `design-system.md` §4.28／元件清單與 `design-system.html` Project list demo、Class API、程式碼示例同步，明確記錄 `.project-bar` 是既有可重用元件而非另造樣式；`BUILD-SPEC.md`／`requirements-map.md` 同步此呈現決策。


## 2026-07-24 · 已上線募資音樂專案改用獨立「版稅」tab（B 反饋導入）

已上線的募資音樂專案需要可查版稅，依 cocreate preview 的既有內容與視覺方向，把原本混在 Money（backup）的音樂版稅分析搬為獨立入口，讓共創金流與版稅資料不再混讀。

- **【B/tab＋搬移】** `project-detail.html` 在「我的收益」後新增「版稅」tab，完整 `[data-money-section="music"]` 區塊移入新的 `data-panel="royalty"`，Money（backup）不再保留副本，既有非音樂內容完全不動。
- **【B/gate】** tab 與 panel 共用 `data-royalty`，只在 `fund + published + music` 顯示；深連結到不合條件專案的 `#royalty` 會沿既有 fallback 回到專案總覽，不留空白面板。
- **【B/demo 資料】** `adia-chan` 改為唯一已上線募資音樂示意樣本，募資摘要／倒數／期間改為已募足、已上線的示意文字，供驗收季度／地區／平台／Top 10 內容；不新增資料欄位、不調整價格或分帳規則。
- **【D/邊界】** 版稅資料、彙入頻率與是否與募資分帳仍是 CCR-006 待確認；`published` 狀態仍是 UIA-084 產品範圍提案。兩者皆不因本輪示意樣本而成為正式產品規則。
- **【D/i18n】** 僅新增 `project-detail.tab.royalty`，完整重用既有 `pd-roy.*` 鍵；無新增 CSS 或 design-system 三件套改動。

## 2026-07-24 · 建立活動新增第 6 型「共看派對（Watch Party）」＋type 分支欄位（A spec-derived · D149）

依 `documents/decisions.md` D149（新增第 6 種活動類型），把共看派對接進建立活動流程與活動清單。欄位集照使用者確認範圍（選影片／房間名稱／開始＋預估結束時間／人數上限［不限／設定上限］／可觀看地區［全球／指定／排除］／隱私［公開／私密］／入場券［免費／自訂價］），不套演出型的表演陣容／四張圖／實體場地／票種階層。

- **【A/型別卡】** `create-event.html` step 1 新增第 6 張 `.selection-card--icon`（`data-choice="watchparty"`、icon `film`），沿用既有型別卡樣式（STYLE-DECISIONS Q13／Q18／Q19），不新增卡片做法。
- **【A/type 分支】** 新增 type-driven 顯隱機制：共看派對專屬區塊標 `data-show-type="watchparty"`、演出型區塊標 `data-hide-type="watchparty"`，選卡時 `applyTypeVisibility()` 依 `eventType` 切換；F1 類型與 F10–F12 Review 兩型共用。這是全站首個 type 分支（先前 5 型共用同一套 step）。
- **【A/欄位】** step 2＝選影片（`<select class="select">` 從 `js/films-store.js` 灌候選）＋房間名稱；step 3＝時間（開始＋預估結束，附「房間不自動關閉」註記）／人數上限（`.segmented` 不限／設定上限＋reveal 數字）／可觀看地區（`.segmented` 三選一）／隱私（`.segmented` 公開／私密）；step 4＝入場券（`.segmented` 免費／自訂價＋reveal `amount-field`，單一價、無票種階層、無 QR）。全部重用既有元件，無新增 ds-component。
- **【A/Review】** step 5 加共看派對版摘要（4 列）＋發布前檢核（7 項：影片／房間名稱／開始時間／人數上限／地區／隱私／入場券），與演出型 5 項並存、依類型顯隱。
- **【A/活動清單】** `events.html` Upcoming 新增一筆共看派對樣本列（週五電影夜 — 霓虹港灣共看，Watch Party，線上，142／200，$710，On Sale），KPI Total events 11→12。
- **【A/i18n】** `js/i18n.js` 新增 `ce.type.watchparty(-sub)`＋`ce.wp.*`（約 45 鍵）＋`events.rowWP.*`（4 鍵），皆雙語。
- **範圍**：只動 `create-event.html`／`events.html`／`js/i18n.js`；`create-event.html` 補掛 `segmented.css`＋`amount-field.css`＋`js/films-store.js`。深度未定項（影片來源、人數上限數字、票價區間、收入分類）記 ASSUMPTIONS 待上游，不寫死。
- **驗證**：本機 server 實測——選共看派對卡後副標變「共看派對」，step 2 只顯示選影片＋房間名稱（演出欄位隱藏），step 3 四組 segmented 全渲染，影片下拉灌入 6 部；活動清單多一筆共看派對列。無 console error；`check_ds_sync.py` PASS（WARN 皆存量）；`bump_ver` 已跑。

## 2026-07-24 · 建立專案流程前置「專案類型閘門」＋表單型別選擇器降級為標題級（B 反饋導入 · D150）

使用者要求：整個建立專案流程開始前，先出現一個只有三張型別卡（直接上線／先募資／開放預購）＋「返回上一頁」的畫面；選定後才進入現在的分步表單，且表單內的「專案類型」欄位只保留標題級切換、不再顯示每型說明。

- **【B/流程】** `create-project.html` 在分步 `.wizard__sheet`（改標 `data-sheet`）之前新增一個 `.wizard__gate`（`data-gate`）閘門畫面：只含返回鈕（`data-gate-back`）＋沿用原 `cpp.s1.h1/sub` 標題＋三張 `.selection-card`（含 tag/title/**說明**，`data-gate-type`）。流程從閘門開始（`showGate()`），選卡後 `enterWizard()` 隱藏閘門、顯示表單與底部導覽（footer 標 `data-footer` 一併切換）。返回鈕 `history.back()`，無歷史時回 `projects.html`。
- **【B/元件套用】** 表單 step-1 的「專案類型」由三張 `.selection-card`（含說明）換成 `.segmented`（`ds-components/segmented.css`）三段純標題切換（直接上線／先募資／開放預購），無說明。閘門卡與 segmented 共用 `chooseType()` 驅動同一 `type`、雙向同步高亮（`syncTypeUI`），型別仍決定 FLOWS 分步。step-1 標題改用新鍵 `cpp.about.h1/sub`（「基本資料／填寫必要資訊…」），避免與閘門的「你正在做的是什麼？」重複。
- **【D/CSS】** `shared.css` 新增 `.wizard__gate`（沿用 `.wizard__sheet` 白卡底＋圓角，僅 `justify-content:center`）＋ `.wizard__gate-inner`（max 760、置中、`--sp-32/--sp-24` 內距）＋ `.wizard__gate-back`。`create-project.html` 補掛 `segmented.css`（原先漏掛，segmented 軌道無底色）。新增 i18n 鍵 `cpp.gate.back`／`cpp.about.h1`／`cpp.about.sub`。
- **範圍**：只動 `create-project.html`（募資專案有三型別）；其他 create-* 流程不變。三型別、各自 FLOWS、各步欄位、產品規則均未改——僅把既有的「選型別」動作前置成獨立畫面、並把表單內型別選擇器降成標題級（呈現重組，非產品變更；記 ASSUMPTIONS）。
- **驗證**：瀏覽器實測——進站先見閘門（只三卡＋返回，無 stepper/存草稿/footer）；點卡進表單，segmented 高亮與所選型別一致、stepper 依型別展開（fund 5 步、preorder 4 步）；DOM 核對 `activeSeg=fund/preorder`、`gateHidden/sheetHidden` 切換正確。`check_ds_sync.py` PASS（WARN 皆存量）；`bump_ver` 已跑。

## 2026-07-24 · 專案詳情 hero 改「封面在左、標題與資訊在右欄並排」（B 反饋導入）

使用者附參考截圖（ztor-cocreate-preview 募資預覽卡），要求把 hero 排版調成同款並排結構——「除了麵包屑不用改」。原本標題／徽章／創作者脈絡橫在頁首（`.page-intro`）、封面與募資卡才在下方左右並排（「標題在上」wireframe）；改為封面在左單欄，右欄由上而下堆疊全部資訊。

- **【B/版面】** 移除 `project-detail.html` 的 `.page-intro` 頁首區塊，內容併入 `.pd-hero__main` 右欄。右欄由上而下＝`.pd-hero__head`（標題靠左＋操作鈕群靠右，同一列）→ `.pd-hero__desc`（簡介）→ `.pd-hero__badges`（狀態／類別／型別徽章列）→ `.funding-panel--card`（募資卡）→ `.info-banner`（下一步）。**標題與簡介在框外**；**創作者脈絡（`.pd-hero__owner`）搬進募資卡框內最下面，取代原 `.funding-panel__note`（§7.3 口徑註記，已移除）**。卡內＝金額／目標／進度／倒數＋末行創作者脈絡。徽章／標題／owner 的 id（`pd-badge-*`／`pd-title`／`pd-owner-line`）不變，render JS 照舊資料驅動。
- **【B/CSS】** `shared.css` 的 `.pd-hero` 區塊：`.pd-hero__main` gap 20→16；新增 `.pd-hero__head`（space-between、flex-wrap，標題＋鈕同列）、`.pd-hero__actions`；`.pd-hero__title`（display 字級 fs-40／900px 降 fs-32，無下 margin）、`.pd-hero__owner`（框內頁腳行，muted fs-13、上留一格）、`.pd-hero__desc`。麵包屑（`.text-sub` 那行）完全未動。
- **範圍**：只動 hero 版面與其樣式；tab 列以下所有面板、資料驅動邏輯、三型別 gating 均不變。`.page-intro` 元件本身保留（其他詳情頁仍在用）。
- **驗證**：本機 server 切 nick／adia 實測——右欄徽章列＋鈕靠右、創作者脈絡貼標題、募資卡與簡介依序在下，麵包屑不變。`check_ds_sync.py` PASS＋存量 WARN；`bump_ver` 已跑。

## 2026-07-24 · User A（周湯豪）persona 換上真實作品＋真封面（B 反饋導入 · 延續 UIA-085）

承前的 persona 機制，使用者要求把周湯豪 persona 的**佔位內容（NIGHT RUN／失控 OUTTA CONTROL／凌晨三點 3AM 等先前示意名）換成他的真實作品**，並用真實封面／海報／商品圖。素材與彙整見 vault 的 `persona/NICKTHEREAL/`（研究檔＋畫廊＋圖庫；資料以維基＋Apple Music＋官方售票／媒體多來源查證）。

- **【B/資料】** `js/projects-store.js` 的 `PROJECTS_NICK` 11 筆改為真實作品：LOVE RAGE HOPE（2025 專輯・募資中）／REALIVE（2023 EP・已達標）／REAL LIFE（2022 專輯・已上線）／我的i・FLAMES・你說的都對・為了你・罵醒我（單曲/MV）／REALIVE (R2) 演唱會・LOVE·RAGE·HOPE Live House Tour（活動）／REALIVE 白趴官方周邊；cover/poster→`images/projects/nick-*.jpg`（真封面/海報）。
- **【B/資料】** `js/products-store.js` 的 `P_NICK` 9 商品（id 不變，維持 e-shop `?id=`／product-detail 對應）改為真實周邊/數位：REALIVE 寫真誌／白趴 Tee／祝你好命連帽外套／CASETiFY 好命限定禮盒（限量 100）／BEARBRICK 公仔／我的i 單曲／R2 演唱會影像／LOVE RAGE HOPE 數位專輯／NICKTHEREAL 後援會；img→`images/products/nick-*`；albumSeed 換真實 LOVE RAGE HOPE 曲目。
- **【B/i18n】** `js/i18n.js` 的 `PERSONA_DICT.nick` 與 `earnings.html` 內嵌 BD_PROJECTS 的佔位名全數替換為真實作品（NIGHT RUN→REALIVE、失控 OUTTA CONTROL→LOVE RAGE HOPE、凌晨三點 3AM→我的i）；涵蓋 my-ip IP 名、events 活動名、earnings 項目/交易名、fan-detail 消費/活動名。殘留佔位 0。
- **【B/圖】** 新增 20 張真圖進 `images/projects/`（12）與 `images/products/`（8），命名 `nick-*`。**版權素材、僅供原型 demo 參考**；default（Coastline/Maya Chou）資料與圖完全未動。
- **範圍**：只換 nick persona 的內容與圖；數字（募資/票數/金額）仍為原型示意值。周邊「高雄站／R2 周邊」與早期巡演海報公開無實拍，未納入。
- **驗證**：起本機 server 切 nick 實測——projects 11 筆真封面、e-shop 9 真商品、my-ip 4 真 IP 名，圖 0 破圖；切 default 完整復原。`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zx`；fresh-context 驗收核對真實性/缺圖/佔位殘留/default 零回歸/語法。

## 2026-07-24 · projects 清單四項微調：移除待辦欄、目標改百分比+金額、搜尋等距、tab 底線只等文字寬（B 反饋導入）

使用者圈選四處逐項指定。

- **【C】移除待辦欄**：`projects.html` 清單列與表頭移除「待辦」欄（tip「i」圖示）；`project-list.css` grid 由 9 軌降為 8 軌、刪 `.project-list__todo` 規則與響應式引用；`js/i18n.js` 移除 `projects.col.todo` 鍵。tip pattern 本身保留（卡片檢視仍用）。
- **【B】當前目標改兩行**：`.project-list__goal` 由單行金額改成「百分比（粗體、`fs-16` 大字，`__goal-pct`）換行實際金額（`__goal-amt`）」；百分比取 `p.bar.pct`。非募資列仍走 `__cell--empty` 破折號。
- **【B/元件 bugfix】搜尋收合間距**：`search-collapse.css` 的收合態 padding 被後載入的 `field-pill.css` 同優先級覆蓋（14px 內距＋1px 邊框殘留約 30px 幽靈寬），把觸發鈕往左推、與右鄰控制項間距不一致。提高收合規則選擇器優先級（`.search-collapse .search-collapse__field`）＋收合歸零 `border-width`、展開補回，收合寬回到＝觸發鈕寬（32px），全站消費者（e-shop／orders／pickup）一致受益。
- **【B/元件變體】tab 底線只等文字寬**：新增 opt-in `.tabs--underline-label`（搭 `--underline-short`），active 底線改掛在標籤 span 上、只等文字寬、**不含尾隨計數徽章**；projects 狀態列加此 class。標籤為 `<button>` 直接文字的分頁（product-detail／admin-platform-fees）**不加**、維持整條 item 底線——已驗證這些頁底線未受影響。
- **【D】** 三件套同步：`project-list.css`／`tabs.css`／`search-collapse.css`＋`design-system.md`（§4.28 anatomy 改 8 軌＋goal 兩行、Tabs Variants/Class API 補 `--underline-label`）＋`design-system.html`（§4.27 demo 去待辦欄＋goal 兩行、Tabs 新增 `--underline-label` demo 卡與 Class API 列）。
- **收尾追加（同輪，使用者反饋）**：(a) 當前目標／類別兩行間距由 `--sp-2` 加大為 `--sp-4`（原 2px 太擠）；(b) `.tabs--underline-label` 底線由標籤 span 正下方（`bottom:0`，被 item 底內距頂高、離卡緣約 12px）下移到 `bottom: calc(-1 * var(--sp-12))`＝貼齊卡片底緣（實測底線底緣 261＝卡片底緣 261）。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量）；棘輪未新增裸值；瀏覽器實測——搜尋↔切換↔建立三段間距皆 12px、active tab 底線＝標籤寬 26px（不含計數）且貼卡片底緣、product-detail 底線仍整條 item、goal 兩行百分比粗大字、兩行間距 4px。

## 2026-07-24 · cheat code「User」改為 persona 切換：User A＝周湯豪 全站 demo 資料換人（B 反饋導入 · ASSUMPTIONS UIA-085）

使用者指定：cheat code 原本的「User」組（一般創作者＋3 個 admin 代管）改成四顆 **default User / admin / User A（周湯豪 NICKTHEREAL）/ User B**；切到 User A 時，**專案、電子商店、我的 IP、活動、粉絲、收入管理**（含各詳情頁）的假資料整組換成周湯豪的版本；default＝原本這批（Maya Chou 世界觀）、User B＝佔位空殼（暫沿用 default）。數字部分經使用者裁決「只換名字、數字維持現狀」。

- **【B/機制】** 新增 persona 維度：一個 `localStorage['ztor.persona']`（default/nick/userB）為單一真相，切換由 `window.ztorPersona.set()` 寫值後 `location.reload()`，每頁載入時重讀。它同時驅動兩支資料檔與一層 i18n 覆蓋，**周湯豪內容只集中在「兩支資料檔的 nick 區塊」＋「i18n 的 PERSONA_DICT.nick」**，不散落各頁。
- **【B/資料】** `js/projects-store.js`／`js/products-store.js` 由單一資料集改為 `{ default, nick }`（userB 未列＝fallback default），對外 API 不變、內部依 persona 回傳。專案列表/詳情、商品詳情本就資料驅動，故 reload 後自動換；nick 商品沿用相同 9 個 id 讓 `?id=` 連結與詳情頁對上。
- **【B/資料】** 電子商店列表的商品名／圖寫死在 HTML（非 i18n），故 `products-store.js` 加 `patchEshopList()`：persona≠default 時就地改 9 主商品列（名＋圖＋價＋分類＋庫存），**不動 `data-name`**（那是補貨模組 PRODUCT_MATRIX 的查表鍵）。e-shop 延伸目錄的通用小物（貼紙/馬克杯/托特包…）persona 無關、保留；bundles/auctions 名走 i18n 覆蓋。
- **【D/i18n】** `js/i18n.js` 加 `PERSONA_DICT` 覆蓋層：`t()` 在 persona≠default 時先查該表、有值即蓋掉原 DICT。收入/我的 IP/活動/粉絲/商店 bundles 裡「本就是 i18n key」的資料值（約 69 個）直接放 nick 覆蓋。
- **【B/名字】** 上述四頁另有大量「寫死在 HTML 的名字」（買家 Maya Chou、9 位粉絲、演出陣容、參加者、專案名、IP 名等）——就地 data-i18n 化（default 值＝原文入 DICT、周湯豪值入 PERSONA_DICT.nick，共約 28 組），維持 default 逐字不變。`fan-detail.html` 的 `<title>`、`earnings.html` 內嵌 JS `BD_PROJECTS`（含 dash slug 對映到 nick 專案 id）改為依 persona 切換。
- **【B/cheat】** `js/devtools.js` 的 User 組改用 `window.ztorPersona`（渲染四選項＋handler `kind==='persona'`）。admin 選項沿用 `ztorCreator` 名冊首位套代管 chrome、資料維持 default。
- **範圍與已知限制**：**只換名字，各頁 KPI/票數/金額/百分比等數字維持原 demo 值**（使用者裁決，避免勾稽數字改一動十）。nick 的專案/商品縮圖沿用現有 `images/` 檔（非周湯豪本人素材，待替換）。User B 為空殼佔位（見 ASSUMPTIONS UIA-085）。
- **驗證**：起本機 server 實測——切 nick 後 projects（11 筆全換）、e-shop 列表 9 主商品、product-detail、my-ip（IP 名＋收入 $86,400）、events（活動標題）、fans-crm（9 位台灣粉絲）、earnings（交易項目/買家周湯豪/BD_PROJECTS）全數換人；切 default 逐字復原（Maya Chou／Coastline／Wei Yu-han 原封不動）；五頁 console 無錯。fresh-context 驗收員逐條 1–9 全 PASS（default 零回歸、nick 覆蓋 0 孤兒、只換名字數字未動、四支 JS＋兩段 inline script `node --check` 皆過）。`check_ds_sync.py` 全 PASS（未動 ds-components/CSS，WARN 皆存量、裸值棘輪維持 51）。



使用者指定：主狀態篩選在「已完成」後加「已上線」。經確認語意＝募資／預購專案交付完成後上架販售的階段；直接上線類型天生為此狀態。**§7.2 狀態語言原本沒有這個狀態**，屬產品範圍提案，登記於 [ASSUMPTIONS.md](ASSUMPTIONS.md) UIA-084（待上游確認是否正式納入 §7.2）。

- **【B】** 新增專案狀態 `published`（label 已上線、`badge--success` 綠）：`projects.html` 的 STATUS map、`TAB.published=['published']`、狀態 tab（在 completed 後 failed 前）；`project-detail.html` 的 STATUS／STATUS_TONE 同步加 `published`（badge 也會顯示已上線）。
- **【B/資料】** `js/projects-store.js` 把 3 個「直接上線且正在上線」的作品（海上霸姬鄭一嫂／九龍夜行 片尾曲／海上霸姬 幕後紀錄）狀態由 `live` 改 `published`。進行中（live tab＝live+funded）連帶 8 → 5，已上線＝3。**尚未指派任何募資型專案**——旺角狙擊仍交付中（funded）、廟街為已完成收尾（completed），樣本暫無募資型走到「上架販售」子狀態，故已完成 tab 維持 1（未出現空分頁）。
- **【D】** i18n 新增 `projects.tab.published`（en Published／zh 已上線）。
- 驗證：tab 計數實測 全部12／草稿1／已排程1／進行中5／已完成1／已上線3／失敗1（加總＝12）；已上線 tab 3 列皆綠 badge、類型直接上線；project-detail STATUS 對映驗證 published→已上線／badge--success。`check_ds_sync.py` 全 PASS（WARN 皆存量）。

## 2026-07-24 · projects 清單列改真圖縮圖＋把 meta 拆成真欄位（B 反饋導入）

使用者指定：清單縮圖用專案詳情的圖、樣式比照電子商店商品列；把原本擠在名稱下一行的 meta（`類別 · $8,420/$15,000 · 134 位支持者 · 剩 21 天`）拆成獨立欄位；那顆「i」提示圖示獨立成一欄。經確認：非募資專案的目標／倒數欄顯示「—」，i 欄標題＝「待辦」。

- **【B】** `project-list.css` 重寫成 e-shop 視覺語言的 9 欄 grid：圖片(56px `poster||cover`，object-fit cover) · 專案(名稱＋一行簡介) · 當前目標 · 剩餘時間 · 類別(內容類型疊家族，比照 e-shop 兩行分類格) · 類型 · 狀態 · 待辦(tip i 圖示) · chevron。列 hover `--accent`、整列連進明細。
- **【B】** 縮圖用 `poster||cover`（與 project-detail hero 同源，點進去看到的圖一致）；無圖退 `.project-list__image--placeholder`（muted 方塊＋類型 icon）。原 52×52 icon chip `__icon` 退場，**project-list 就此離開 Q20 icon-chip 家族**（`.product-list__thumb`／`.data-list__icon` 不受影響）。
- **【B】** 當前目標／剩餘時間只有募資／預購專案有值，非募資列用 `.project-list__cell--empty` 顯示 muted 破折號——忠實呈現、不編造數字。
- **【B/資料】** `js/projects-store.js` 的 5 個募資／預購專案加 `list:{ goal, left }` 雙語顯示欄位（示意值，與既有 `meta`／`fund` 同批 demo 數字，不新增產品規則）；其餘專案不加、渲染顯示「—」。
- **【B/響應式】** ≤1180px 收掉次要欄（剩餘時間／類別／類型），保留圖片＋名稱＋目標＋狀態＋待辦；≤760px 列重新堆疊（目標＋狀態落第二行）。
- **【D】** i18n 新增 `projects.col.{goal,time,category,todo}`（en/zh）；`projects.col.type/status/project` 沿用。
- **【D】** 三件套同步：`project-list.css`＋`design-system.md` §4.28／元件清單表＋`design-system.html` §4.27（rendered preview 改新九欄、含 campaign 列與 `—` 列兩種）。Data list 條目與 Project list 條目補註「project-list 2026-07-24 退出 Q20 icon-chip 家族」。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量）；棘輪檢查 10 未新增裸值；12 列於深／淺主題、1440／1100 寬度實測，圖片零破圖、篩選與卡片檢視未受影響。

## 2026-07-24 · 佣金比例提示改用中性 info-banner（對齊 Deck for Sony）（B 反饋導入）

- **【B】** 使用者指定 earnings 總覽的「影評人佣金比例 15%」提示要像 Deck for Sony 一樣。sony 用中性 `.info-banner`（accent 底＋細框＋灰字＋info 圓圈圖示），earnings 原本用 `.insight-row`（品牌橘 12% 調底＋percent 圖示）。改這一處 instance＝`.insight-row`→`.info-banner mt-16`、`percent` 圖示→`info`、`<p class="insight-row__text">`→`<span>`，文案（`earnings.ratio` i18n）不動。
- **【C/清理】** earnings 移除已無用的 `insight-row.css` `<link>`。**`.insight-row` 元件本身不動**——fans-crm F3 Pareto 洞察仍在用（非零消費），不退場。
- 驗證：起站實測提示改為中性深色 banner（無橘調）、info 圖示、文案與連結不變；`check_ds_sync.py` 全 PASS。

## 2026-07-24 · 總覽收入趨勢加「收入來源」篩選（B 反饋導入）

使用者指定：把 Deck for Sony 財務總覽那種圖表上方 chip 篩選搬到 earnings 總覽的收入趨勢，篩選項目用本頁「收入來源分布」的 9 個來源。行為經兩輪定案——先試「只留一條＋各來源自算刻度」，使用者改要**忠於 sony 的聚焦式**：全部線都在、點一個把其他淡化。同一輪內直接改到位（下方為最終狀態，不另立條目）。

- **【B】** 收入趨勢圖上方新增 chip 篩選列（`data-src-legend`）：全部＋9 個收入來源（電商／共創／活動票券／影評人佣金／OTT／IP／平台串流／授權／專案支持其他），每個 chip 帶對應色點。沿用站上 `.chip-group` 既有單選 active 邏輯。
- **【B · 聚焦式最終形態】** 圖表由單一「總收入」線改為**多線＋聚焦**：「全部」同時畫 9 條來源線＋1 條加總線（加總＝白色虛線，讀作 sum 參考）；點某來源就把該線標 `is-focus`、其餘（含加總）淡化到 opacity .14，靠 `[data-src-chart][data-focus]` 控制，機制與 sony 相同。所有線共用單一 y 軸（$0–28k），故小額來源（如授權 3%）是靠底部的低矮線——忠實反映占比，聚焦時靠淡化其他線讓它可追。10 條線為靜態 `<path>`（Catmull-Rom 平滑），JS 只切 focus class、不再換 `d`／刻度。
- **【B/一致性】** 9 個來源各給一個「深色底可見」的 token 色，chip 色點、趨勢線、右側「收入來源分布」清單色點三者統一。順手修掉清單裡 3 個深色底不可見的裸色（`#000`→`--chart-4`、`#1db954`→`--status-info`、`#999`→`--muted-foreground`；授權改 `--destructive` 避免與平台串流同藍），全站頁面裸值 54→51。
- **【D】** i18n 新增 `src.filter.all`（全部／All）；趨勢圖副標由「總收入趨勢」改「依收入來源 · 加總為虛線」（`earnings.legend.sub`），貼合多線呈現。頁面級 `<style>` 加 `.src-legend`／`.src-dot`／`.src-line` 聚焦規則（純 token、只覆寫自建 class，不動共用元件）。
- **【B · sony 化樣式】** 依使用者「這曲線圖要像 Deck for Sony 一樣 style」：9 條來源線各補一層半透明面積填色（`.src-area`，`fill:color-mix(來源色 15%)`，畫在線之下、聚焦時與線一起淡化），比照 sony 的 `.fin-area` 疊層山脈感。加總線依使用者「保留但不要這麼粗」由 2.5px 白實虛線改 **1.25px `--muted-foreground` 虛線**，退為淡參考線。已向使用者說明：因保留加總（撐大 y 軸到 $28k），來源仍會壓在底部、無法完全鋪滿如 sony——此為保留加總的必然取捨、使用者已接受。
- **【B · 拿掉加總線＋來源尺度最終形態】** 使用者反映「選單一來源時所有曲線都被壓在下面、看不出差異」，並裁示「看不到全部（加總）而已，其他項目只是變淡」。定案：**移除加總虛線**（它在 $12k–25k、把 y 軸撐到 $28k 是壓扁來源的元兇），y 軸改用**來源高標** $7.5k／$5k／$2.5k／$0（電商峰值 ~$7k）。9 條來源就鋪滿整個高度、彼此可比、疊出 sony 山脈感。互動回到**淡化式**（非隔離）：「全部」＝9 條全亮；選某來源＝其餘**變淡**（opacity .14、仍可見）、選中高亮。曾短暫做成「隔離＋各來源自算刻度」（藏掉其餘），依使用者回饋改回淡化＋單一來源尺度。實作：9 條線／面積改以 topTick 7500 生成靜態 path；JS 回到單純 focus toggle（切 `is-focus`）；CSS 回到 dim 非 focus。
- **【D】** 趨勢圖副標由「依收入來源 · 加總為虛線」改「依收入來源」（`earnings.legend.sub`），因加總線已移除。
- **範圍**：淡化作用於線圖；長條圖檢視（line/bar 切換的 bar）仍顯示總收入、不隨來源篩選（與 sony 同為線圖專屬）。
- 驗證：起站實測——10 個 chip 中英標籤正確；點電商聚焦時電商線亮、其餘與加總虛線淡化；點小額來源（授權）仍正確 `is-focus`、其他不 focus；「全部」清除 focus 全部復原；來源清單色點與 chip 一致；語言切換後仍運作；console 無錯。`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zh`。

## 2026-07-24 · 項目收益分頁微調：全部收入改 bento、彈窗去進度條、分頁改名（B 反饋導入）

承前一則改版後的三點收斂：

- **【B】** 「全部收入」卡的摘要列改成 **bento 兩格 KPI**（總收入／可分配淨利），拿掉原本的箭頭與並排文字；把「已扣直接成本…」那句收進可分配淨利格的 `kpi__meta`、總收入格 meta 用「212 筆已結算收入」。用站上既有 `.bento`＋`.kpi`，無新元件。原 `.bd-summary*` 版面與其頁面級 CSS 一併移除。
- **【B】** 兩個彈窗（全部收入瀑布 F12／專案階梯 F11）**移除 running-balance 進度條**：只刪這兩個彈窗實例裡的 `.waterfall__bar` 節點（17 個），共用元件 `waterfall.css` 不動、其他消費頁（design-system／project-detail／交易小階梯）照舊有條。彈窗改讀成純損益表帳本（名稱＋說明＋金額），里程碑仍靠 `--subtotal`／`--pool` 的上分隔線與粗體區分。填值 JS 有 guard，條移除後不報錯。
- **【B】** 分頁名稱「收益拆解 / Breakdown」改「**項目收益 / Project income**」（`earnings.tab.breakdown`）。內部 `data-tab="breakdown"` 與 hash 錨點不變。`documents/5.1.8-收入管理.md` 的分頁列與 F2 條目同步標註「功能名稱 Breakdown、介面顯示項目收益」。
- 驗證：起站實測——分頁標籤顯示「項目收益」；bento 兩格 label／value／meta 正確；全部收入瀑布彈窗 0 條進度條、11 列保留；專案階梯彈窗 0 條、6 列、Coastline +10.8% 差異正確；console 無錯。`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zb`。

## 2026-07-24 · 收益拆解改「全部收入摘要＋我的項目表格」，瀑布與階梯收進彈窗（B 反饋導入）

使用者裁示：收益拆解分頁的「本期間／依專案」切換鈕看不懂，改成 earnings-sony「我的項目」那種上下兩塊、表格點列開彈窗的結構。切換鈕退場，「本期間」這個詞只留在瀑布彈窗副標裡。

- **【C】** 移除 Breakdown 的「本期間／依專案」segmented 切換鈕（`data-breakdown-toggle`）與其 JS、兩個 `data-bd-section` 常駐區塊。原本切到哪塊就整塊換掉的做法退場。
- **【B】** 上塊「全部收入」＝一行概述（總收入 $24,830 → 可分配淨利 $16,721 ＋「已扣直接成本、平台與支付費、IP 版稅與 Ztor 抽成」），右邊「查看完整拆解 →」開**中央彈窗**呈現原本的完整 F12 收入去向瀑布（11 階，內容與口徑不變）。
- **【B】** 下塊「我的項目」＝原「依專案」下拉選單攤平成 `.ztor-table` 表格，一列一個專案（專案／類型／專案淨收入／chevron），4 個 demo 專案。點任一列開**中央彈窗**呈現該專案的 F11 收益階梯（總收入 → 直接成本 → 毛利 → 平台費 → 合作者分潤 → 專案淨利），底部保留「查看共創儀表板 →／查看交易／匯出」出口。
- **【A/資料層】** 專案階梯改資料化：`BD_PROJECTS`（4 專案，各含收入／成本／費用／分潤／預期＋雙語 meta）為單一來源，JS 依點選的列填入金額、running-balance 條寬與「對比預期」差異（正負號動態），語言切換時 re-render。動態欄位不掛 `data-i18n`，避免 i18n 覆寫 JS 寫入值（比照 project-detail 資料化的作法）。
- **【D】** 兩個彈窗都用站上共用中央彈窗殼（`.payout-modal`／`.payout-dialog`，標準寬，未新增變體），開關吃 `hidden`＋`data-bd-open`／`data-bd-close`，✕／點灰底／Esc 三種關閉都在；符合 Q27（編輯用中央彈窗、唯讀詳情沿用同殼，比照 sony 的提領歷史／如何運作）。
- **【D】** i18n 新增「全部收入」摘要、表格欄位、專案類型（音樂／商品／授權／活動）、階梯副標共 11 鍵；移除退場的 `breakdown.toggle.*` 與改由 JS 帶雙語後孤兒的 5 個 `breakdown.ladder.*-meta` 鍵。
- **【D/規格】** `documents/5.1.8-收入管理.md` 的 Breakdown 佈局段與 F11 進入點同步改為「全部收入摘要＋我的項目表格＋彈窗」，明註 F11／F12 內容與口徑不變、僅呈現由常駐區塊改為觸發式彈窗。
- **一次性版面**：earnings.html 新增頁面級 `<style>`（`.bd-summary`／`.bd-tablecard`／`.bd-amt`），色彩字級全走 token、無裸值，比照 sony finance-overview 的一次性版面做法。
- 驗證：本機起站中英雙語實測——上下兩塊版面正常、4 列數字正確；點列開專案階梯（含 Late Bloom 負向差異 −6.3%、Taipei Live +13.6%）金額／條寬／差異正負號皆對；「查看完整拆解」瀑布彈窗 11 階完整；✕／灰底／Esc 三種關閉有效；英文切換階梯 re-render 正確；console 無錯。`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724v`。

## 2026-07-24 · 「金流瀑布」與「淨利池」改用創作者看得懂的名字（B 反饋導入）

使用者指出「金流瀑布根本看不懂」，要求全站改名。裁決後採用：圖表標題＝**收入去向**（Where the money goes）、末端那階＝**可分配淨利**（Distributable profit）。「瀑布」和「池」都是財務內部術語，創作者要的是「我的錢跑哪去了」與「最後能分多少」。

- **【B】** Earnings · Breakdown 的 F12 標題由「金流瀑布／Earnings waterfall」改「收入去向／Where the money goes」，副標由「總收入 → 淨利池 · 本期間」改「從總收入到可分配淨利 · 本期間」。
- **【B】** 「淨利池／Net profit pool」全站改「可分配淨利／Distributable profit」，共 13 處 i18n 鍵：earnings 的瀑布末階與 Payouts 分頁（標題／KPI／說明橫幅）、project-detail 的三個鍵、event-detail 的退款吸收順序與「錢在哪」說明。附屬說明「本期可分配」改成更白話的「這段期間可以分的錢」。
- **【B】** Payouts 說明橫幅改寫：「淨利池是瀑布的末端」→「可分配淨利是收入去向的最後一階」。Breakdown 空狀態同步改寫，不再出現「金流瀑布」。
- **【B】** project-detail 共創金流的「收益瀑布／Revenue waterfall」改「專案收入去向／Where this project's money goes」。
- **【D】** `design-system.html` 4.72 與 `design-system.md` 4.24b 的敘述、demo 文字、do/don't、modifier 說明同步改用新用語。**元件條目名 `Earnings waterfall` 與 class `.waterfall`／`--pool` 一律不動**——那是工程識別名，對應 CSS 檔名，改了會讓文件與程式碼脫節，且使用者看不到。
- **【D/規格】** 依裁決在 `documents/0-設計規格書.md` §7.3「金流瀑布與淨利池」加一段呈現名稱對照（規格用語不變、介面用新名、class 與 i18n 鍵不隨之改），`documents/5.1.8-收入管理.md` F12 補「區塊標題：收入去向」與淨利池的呈現名稱對照。規格編號與 D041 等既有決策的引用鏈因此不斷。
- **未動**：`my-ip.html`／`ip-detail.html` 的 "waterfall"（Import waterfall data、Awaiting waterfall verification）是音樂產業講的**版稅分帳流程**，與這個圖表同名純屬巧合，屬業界標準用語，維持原樣。
- **發現未處理**：`project-detail.money.waterfall.*`／`.wf.pool`／`.money.kpi.pool` 三組 i18n 鍵**全站無人使用**（該頁實際用的是 `cocreate.split.*`，且分潤模型是 70/30 不是 60/40）。本輪照樣同步了字串，但這批孤兒鍵與兩套分潤比例的落差留待後續釐清。
- **【B】** Payouts 那張卡的右上副標由「可分配餘額 · §7.3 / §5.2.2」改「口徑依 §7.3 / §5.2.2」——改名後「可分配」在同一張卡出現三次（標題／副標／KPI 標籤），副標本來就只是標口徑，讓掉重複。
- 驗證：本機起站實測中英雙語，Breakdown 標題／副標／末階與 Payouts 卡片文字皆為新用語、無破版；`check_ds_sync.py` 全 PASS（3 個 WARN 為既有存量，非本輪引入）；`bump_ver` → `20260724o`。

## 2026-07-24 · 專案詳情頁依三種類型（直接上線／募資／預購）完整區分（B 反饋導入）

使用者裁示照規格 §3.1／§5 的差異，把三種專案類型的詳情頁做出完整區分（先前只做了募資型、另外兩型是把募資的東西藏掉、不合身）。使用者另裁決：預購＝單一商品（無多方案）、我的收益用簡版。

- **【B/gating 系統】** 建立通用 `data-type` 顯示機制取代原 `data-fund-only`：任何帶 `data-type="<類型清單>"` 的元素（tab 按鈕／面板／卡片／時間軸列）只在列出的類型顯示，無屬性＝全部類型。render JS 依 `p.type` 一次套用；若當前停在被隱藏分頁則退回專案總覽。
- **【B】** 分頁矩陣（依規格）：
  - **直接上線**：專案總覽（含新的「上線時間」卡）／關於專案／我的收益／專案收益備份。無門檻無退款，故無方案與承諾、製作進度、共創進度。
  - **募資**：全部七分頁（原樣）。
  - **預購**：專案總覽／關於專案／製作進度／我的收益／**預購進度**（新）／專案收益備份。無方案與承諾（單一商品）、無共創進度。
- **【A/新 tab】** 預購進度（`data-panel="preorder"`）：KPI（已下單／最少訂購數／預購截止）＋訂購進度（62/100、單價、預期交付）＋未達量全額退款保證＋預購訂單明細表。對齊規格 §5.3「達最少訂購數再生產、未達量全額退款」。
- **【A】** 新增 go-live 專屬「上線時間」卡（`data-type="go-live"`，收在專案總覽）：因 go-live 無製作進度分頁，其簡單時程（建立→上線）收在這裡；註明無門檻無退款、上線後分潤。
- **【B】** 製作進度的時間軸依類型換列：募資顯示 募資發布／募資截止＋達標退款說明；預購顯示 預購開始／預購截止／預期交付＋未達量退款說明（各列 `data-type` 控制）。
- **【B】** 我的收益「淨收益分配（70/30 支持者分潤）」卡標 `data-type="fund"`——只有募資型有支持者分潤；直接上線／預購顯示簡版（計畫項目收益＋走勢圖＋收益明細，無支持者分潤）。
- **【D】** i18n 新增預購進度 tab／時間軸預購列／go-live 上線時間／`pd-pre.*` 共約 30 鍵。
- **未做（回報）**：基本資料編輯彈窗的欄位（存取價格 vs 募資目標 vs 預購條件）尚未依類型換——目前共用；hero 的預購型仍用 meta 摘要（未做獨立進度條，預購進度分頁已完整呈現）。專案收益備份仍三型皆留，待確認可移除。
- 驗證：三型各自的分頁組合、預購時間軸換列、go-live 上線時間卡、預購進度分頁、淨收益分配僅募資顯示，皆實測正確；console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zq`。

## 2026-07-24 · 我的收益補上收益走勢圖＋類型篩選 chips（B 反饋導入）

上一輪新增的「我的收益」略過了公開端的收益走勢圖，本輪補齊——內容直接對照 `my-cocreate-proposal.html`「我的收益」分頁。

- **【B】** 我的收益分頁最上方補「類型篩選 chips」：全部／OTT版稅收益／影評人佣金／影評人預付金／授權收益，各帶對應顏色圓點（`.earn-dot`，色用 `--chart-5`／`--chart-2`／`--destructive`／`--muted-foreground`），兼作圖表圖例。
- **【B】** 補「收益走勢」圖卡：R2.1 多線圖元件 `.linechart--axes`（y 軸 1,500／1,000／500／0）＋四條走勢線（對應四種收益類型）＋期間切換 `.segmented`（天／月／三個月／年，月為預設）。
- **【D/JS】** chips 與期間切換做純視覺 active 切換（資料為示意、不重算，與公開端圖表同為靜態 demo）。project-detail 補掛 `chip.css`；`shared.css` 新增 `.earn-dot` 圓點。
- **【D】** i18n 新增走勢圖標題／四個期間／五個篩選類型共 10 鍵。
- 驗證：四線圖與 chips／期間切換渲染正常、active 可切、console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zp`。

## 2026-07-24 · 專案收益改備份＋新增我的收益／共創進度 tab（依專案類型顯示）（B 反饋導入）

使用者裁示：把現在的專案收益改成備份、依專案類型補上三種類型的行為、加「我的收益」「共創進度」兩個 tab（內容提取自 ztor 公開端 `my-cocreate-proposal.html`）。

- **【B】**「專案收益」tab 改名「專案收益備份」（`data-panel` 仍為 `money`，內容不動，當探索原型的備份保留）。
- **【B/新 tab】** 新增「我的收益」（`data-panel="earnings"`）：提取自公開端「我的收益」分頁——計畫項目收益（收入 − 支出 ＝ 淨收益）、淨收益分配（發起人 70%／支持者 30%）、收益明細 ledger（日期／金額／活動類型，`ztor-table`）。
- **【B/新 tab】** 新增「共創進度」（`data-panel="cofund"`）：提取自公開端「共創進度」分頁——KPI（已參與人數／支持方案／上架日期）、共創金額（已收取／應撥 80%）、撥款進度、方案支持統計表、支持者明細表。
- **【B/類型維度】** 補上專案「類型」維度（直接上線／募資／預購）：我的收益與共創進度是共創（募資型）專屬，render JS 依 `store` 的 `p.type === 'fund'` 顯隱這兩個 tab 與面板（`data-fund-only`）；非募資型（如直接上線的海上霸姬）自動隱藏、若正停在被隱藏分頁則退回專案總覽。實測 fund 型顯示、go-live 型隱藏。
- **【D】** i18n 新增 earnings／cofund 兩 tab、`pd-earn.*`（約 20 鍵）、`pd-cofund.*`（約 12 鍵）；`project-detail.tab.money` 值改「專案收益備份」。方案沿用白話名（數位版／實體＋數位版／尊享版）。
- **內容取捨**：公開端「我的收益」的收益走勢圖（多篩選＋時間範圍）本輪未移植（純呈現、資料量大），先做卡片與 ledger；ledger 取樣本 5 列（原 23 筆）。版稅（royalty）分頁未新增——音樂版稅已在專案收益備份的音樂區塊。
- **待確認（回報使用者）**：(1) 三種類型中目前只做 fund 型的兩個 tab，直接上線／預購要顯示什麼收益／進度尚未定義；(2) tab 數量達 7 個（含備份），備份確認可移除後可降到 6。
- 驗證：fund 型七 tab 全顯示、go-live 型隱藏兩 tab、兩新 tab 內容與表格正常、console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zl`。

## 2026-07-24 · 專案收益重排＋支持者兩表格化＋方案改白話名稱（B 反饋導入）

- **【B】** 專案收益分頁重排：KPI 統計條 → 方案支持統計 → 支持者明細 → 其他（共創金額／上映後淨收益分潤／撥款進度）→ 音樂版稅。
- **【B】**「支持者總覽」改名「方案支持統計」（`cocreate.tiers.title`：en `Support by plan`／zh `方案支持統計`）——它顯示的是各方案幾人支持，原名容易與「支持者明細」混淆。
- **【B】** 方案支持統計與支持者明細由 `.data-list` 改成 `.ztor-table` 表格、欄位分開：方案支持統計＝方案／價格／內容／名額／支持人數；支持者明細＝#／支持者／方案／NFT／日期／扣款狀態。兩表都包 `overflow-x:auto` 供窄螢幕橫捲。
- **【B】** 方案改成看得懂的白話名稱（`project-detail.plan.digital/bundle/premium`）：Believer→數位版、Champion→實體＋數位版、Inner Circle→尊享版；三處同步——方案與承諾的支持方案卡、專案收益的方案支持統計與支持者明細、`pd-edit-tier` 彈窗預設值。
- **【D】** i18n 新增方案白話名 3 個、表格欄位標題 8 個、名額「不限」與尊享版內容說明；`cocreate.tiers.title` 值改「方案支持統計」。原逐列 meta 鍵（pd-cf.b1/b2/b3-meta、pd-cf.t3-meta、pd-cf.ppl）因改表格已無引用，保留未刪。
- **未做（回答使用者提問）**：「上映後淨收益分潤」是否併進「共創金額」當展開詳情——技術上可行、也建議做（兩者是同一筆錢的製作期 vs 上映後兩段），但本輪照使用者的排序把它留在「其他」區獨立呈現，等使用者確認要不要合併再動。
- 驗證：收益分頁新順序、兩表格欄位分開、方案白話名三處一致、深連結與 console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zj`。

## 2026-07-24 · 總覽去重＋新增「製作進度」tab＋展示內容攤開成上傳格（B 反饋導入）

使用者四點裁示：收益概況與 hero 重複可移除、專案時間與里程碑整合、展示內容比照建立流程攤開、里程碑與內容項目（改名作品進度）獨立成新 tab。

- **【C】** 移除總覽的「收益概況」卡（與上方 hero 的募資資訊重複）。渲染 JS 對 pd-rev-* 已加空值防呆，元素不存在不報錯。
- **【B/新 tab】** 新增 **製作進度**（`data-panel="progress"`，排在關於專案與專案收益之間），收兩張卡：
  - **專案時間與里程碑**（整合）：原「專案時間」的排程事件（建立／發布／截止）與原「里程碑」的製作里程碑（殺青／調光／首映）合成單一時間軸、依時序交錯，里程碑列標「里程碑」徽章；卡頭兩個動作＝編輯日期（`pd-edit-schedule`）＋＋里程碑（`pd-edit-milestone`），自動轉換說明與退款開關留在卡底。＋里程碑仍寫進同一條 `#pd-ms-list`（實測可新增）。
  - **作品進度**（原「內容項目」改名，`project-detail.items.title`：en `Work progress`／zh `作品進度`）。
- **【C】**「專案時間」卡從總覽移出、「里程碑」卡從方案與承諾移出——都併入製作進度。移出後：總覽剩 發布更新／合作者／IP Rental；方案與承諾剩 支持方案。
- **【B】** 關於專案的「展示內容」由 `.data-list` 壓縮清單改成建立流程同款的 `.upload-assets` 上傳格：已上傳（縮圖／海報）用 `is-filled`＋真實縮圖攤開、待補（橫幅／相簿）維持虛線 ＋ 格，另加預告影片 file-drop 格。project-detail 補掛 `upload-tile.css`。卡改滿版（span-12）讓格子攤得開。
- **【D】** i18n 新增製作進度 tab／整合時間軸標題／里程碑徽章／編輯日期鈕／展示內容各格標籤共 11 鍵；`project-detail.items.title` 值改「作品進度」。
- **命名**：新 tab 取「製作進度」（Production progress），與卡片「作品進度」「專案時間與里程碑」區隔；備選 專案進度／時程與進度（見回報，易改）。
- 驗證：五個 tab 內容逐一確認、＋里程碑寫回整合時間軸、展示內容格 200px 正常攤開無破圖、console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724zd`。

## 2026-07-24 · 專案詳情 hero 改 GoFundMe 募款預覽 wireframe（B 反饋導入）

使用者指定參考 Mobbin 上 GoFundMe 募款預覽的 wireframe（標題在上、封面在左、募資資訊獨立成右側卡）改 hero。

- **【B/版型】** 新增 `.pd-hero` 版型（shared.css，取代專案詳情原本的 `.ip-hero--project`）：無外層填色容器，封面（放大到 300px 直式）在左、右欄放「募資卡＋簡介＋下一步」。標題／徽章／建立脈絡維持在頁首 `.page-intro`＝wireframe 的「標題在上」。
- **【A/元件變體】** `funding-panel.css` 加 `.funding-panel--card`：把巢狀襯底面板變成獨立有框卡（Q3 邊框、無疊色陰影）。因為它現在坐在頁背景上＝L1 卡，用邊框而非 `--nest-surface`（不違反 Q24——Q24 管的是卡中卡；這裡不是卡中卡）。
- **【B】**「下一步」info-banner 由 hero 下方移進右欄底部，填補直式海報造成的高度落差（右欄＝募資卡＋簡介＋下一步，高度接近海報）。
- **【A】** 募資卡資料化補非先募資分支：直接上線／預購專案沒有「已募 / 目標 / 進度」語意，改顯示 meta 摘要（如「累計 US$12,500 · 45,000 次觀看」）並隱藏目標／進度條／支持人數／募資期間，避免露出 Late Bloom 的預設值。
- **【C】** 移除 `.ip-hero--project`、`.ip-hero__cover--photo`（唯一消費者是專案詳情，已改用 `.pd-hero`）；`.ip-hero` 基底維持給 ip-detail 用。design-system.md／html 的 ip-hero 條目還原、funding-panel 補 `--card` 變體。
- 驗證：先募資（陳松伶）顯示完整募資卡、直接上線（海上霸姬）顯示累計摘要且隱藏募資限定欄；深／淺色與 760／1440 寬實測無破版、無橫向捲動、console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724z`。

## 2026-07-24 · 「專案更新」改名「發布更新」並移到總覽第一項（B 反饋導入）

- **【B】**「專案更新」卡改名「發布更新」（`project-detail.updates.title`：en `Published updates`／zh `發布更新`），並移到「專案總覽」分頁第一張卡。新順序：發布更新（滿版）→ 收益概況（滿版）→ 專案時間＋合作者（各半）→ IP Rental（滿版）。
- **【D】** 卡內原「發布更新」按鈕與新卡標題同字，改用站上 ＋ 新增 樣式的 `＋ 發布更新`（`project-detail.updates.add`），與合作者「＋ 新增」、里程碑「＋ 里程碑」一致；頁首的「發布更新」按鈕不動。
- 驗證：總覽第一張卡為發布更新、按鈕文案正確；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724v`。

## 2026-07-24 · 專案總覽改成 landing、拿掉發布狀態下拉、時間設定獨立（B 反饋導入）

使用者三點裁示：(1) 發布狀態下拉不需要，那些時間應在專案建立後自動照時間跑；(2)「已完成」的動作放在專案更新裡按；(3) 專案總覽該是創作者一進來就看到資訊與所需操作——更新專案、知道進度與收益（進度／狀態已在 tab 上方）。

- **【C】** 移除頁首的「發布狀態」select 與「儲存變更」按鈕。理由：七個狀態裡只有「取消」需要人主動決定，其餘由時間與募資結果自動轉（草稿→進行中→已達標／失敗）；下拉還會允許非法轉換（例如把失敗改回進行中）。狀態改以標題上方的唯讀徽章呈現。「儲存變更」拿掉是因為每個區塊的編輯都在自己的彈窗按儲存，頁首那顆沒有對應的儲存對象。
- **【B】** 頁首操作改成 編輯（basics，→ `pd-edit-about`）／在 Ztor 上預覽／發布更新。基本資料已顯示在標題與徽章，編輯鈕依使用者指示移到頁首右上角。
- **【C】** 移除總覽的「專案基本資料」卡（內容與頁首重複）。其存取與價格欄、專案類型鎖定徽章、D041 鎖定說明移進 `pd-edit-about` 彈窗。
- **【B】**「狀態」卡改「專案時間（Schedule）」，加編輯鈕開新彈窗 `pd-edit-schedule`（募資發布時間／募資截止／未達標退款開關）——回應「要有地方放專案時間設定」。卡內補一行自動轉換說明：到截止時達標轉已達標、未達標轉失敗並自動退款，只有取消要人決定。
- **【A】** 新增「收益概況」卡（滿版橫向短卡）：先募資顯示已承諾金額＋「達標後開始撥款」，其他類型顯示累計收益摘要，右側「查看專案收益 →」跳到收益分頁。撥款分期／分潤／費用明細仍在收益分頁，這裡只給一行摘要與入口。
- **【B】**「專案更新」卡加「標記專案完成」按鈕——回應「已完成在專案更新中可以按」。原型示意：附一則「專案已完成」更新並把狀態徽章轉為已完成。
- **【B】** 總覽版面重排成 landing：收益概況（滿版）→ 專案時間＋合作者（各半）→ 專案更新（滿版）→ IP Rental（滿版）。
- **【B】** 依前一輪裁示，「暫停／下架」按鈕先不做（使用者：先不用）。
- **【D】** i18n 新增 schedule／rev／updates.complete 與 `pd-edit.schedule.*` 共 11 鍵。原 `project-detail.publish.*`、`project-detail.status.draft/scheduled/live/...`、`pd-cf.type-film/music` 等鍵因下拉與 segmented 移除已無引用，鍵值保留未刪（不影響其他頁）。
- 驗證：先募資／go-live 兩類專案的收益概況分別顯示已承諾與累計收益；編輯／專案時間彈窗開關正常、標記完成會附更新並翻徽章、收益概況入口正確跳分頁；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724r`。

## 2026-07-24 · 專案類型改由清單決定、詳情頁資料化，demo 補齊十種內容類型（B 反饋導入）

使用者指出：專案收益裡那顆「影視／音樂」切換是假的——專案類型本來就有很多種，該由清單上點進來的是哪個專案決定，不是在詳情頁自己切。連帶要求清單上要看得到不同類型、demo 名稱與圖片用公開端共創計畫預覽站的素材。

- **【C】** 移除專案收益的「影視／音樂」segmented 與其 JS。音樂版稅分析區塊改由專案本身的內容類型決定是否顯示。
- **【A/資料層】** 新增 [js/projects-store.js](./js/projects-store.js)：專案 demo 資料的單一來源，清單與詳情頁同吃一份。原本清單資料寫死在 `projects.html` 的 inline script、詳情頁是另一份寫死的樣本，兩邊對不起來。
- **【A】** project-detail 改資料化：讀 `?id=` 帶出名稱、簡介、封面、內容類型／發行模式／狀態三顆徽章、創作者與日期、募資面板數字（已募／目標／人數／百分比／倒數／期間），音樂家族才顯示版稅分析。沒帶 id 或 id 不存在時退回清單第一個專案。四個被資料接管的欄位已拿掉 `data-i18n`，避免 i18n 覆寫掉 JS 剛寫進去的值（實測過這個衝突）。
- **【B/資料】** demo 專案由 8 筆改成 **12 筆、覆蓋上游 spec 5.1.2.1 §4.1 F3 的全部十種內容類型**：電影／短劇／影集（影視）＋音樂／音樂專輯／MV（音樂）＋活動／其他商品／文檔／自訂（其他）。名稱、簡介與圖片取自 ztor 公開端共創計畫預覽站；影視與音樂以外的四種該站沒有樣本，名稱依同一世界觀補寫（見 ASSUMPTIONS UIA-083）。
- **【B】** 清單的內容類別篩選補齊：原本只有影視三項＋音樂兩項，現在對齊十種類型，新增「其他」群組（活動／其他商品／文檔／自訂），並修正兩處與上游用語不一致的舊值（`film`→`movie`、`single`→`song`；影集的中文由「連續劇」改「影集」、短劇由「短片」改「短劇」）。
- **【D】** i18n 新增／改寫 11 個內容類別鍵與「其他」群組標籤。
- 驗證：12 筆專案在清單與卡片檢視都正確渲染、無破圖；逐一開啟音樂／影視／其他三類詳情頁確認徽章、封面、募資數字與版稅區塊顯隱皆隨專案改變；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724l`。

## 2026-07-24 · 編輯／新增一律改中央彈窗，drawer 退出編輯場景（B 反饋導入）

使用者裁示：所有「編輯／新增」的開啟方式都不要側邊滑出，改用站上原本的中央彈窗。站上編輯流程本來就以中央彈窗為主（出貨、退款、補貨、費率例外、請款），project-detail 的五個 drawer 是少數例外，本輪收斂成單一答案。

- **【B】** project-detail 的五個彈窗（專案基本資料／合作者／里程碑／專案更新／支持方案）由 `.drawer` 改成站上共用的中央彈窗殼 `.payout-modal` ＞ `.payout-dialog`（`__head`／`__title`／`__body`），開關改吃 `hidden` 屬性、掛勾由 `data-drawer-*` 改名 `data-modal-*`；關閉方式三種都在：右上 ✕、點灰底、Esc。頁面改掛 `payout-modal.css`、移除 `drawer.css`。
- **【D/裁決】** [STYLE-DECISIONS](STYLE-DECISIONS.md) 新增 **Q27**：編輯／新增流程的殼層＝中央彈窗，`.drawer` 只保留給「不離開當前頁看詳情／歷史／說明」的唯讀用途。
- **未動**：`earnings-sony.html` 的提領歷史與「如何運作」仍是 drawer——那兩個是唯讀說明、不是編輯或新增，符合 Q27 保留的用途。`design-system.md` 的 Drawer 條目已補註本輪的界線。
- 驗證：五個彈窗逐一開關實測（✕／灰底／Esc 三種關閉都有效），里程碑新增流程實測寫回列表且彈窗自動關閉；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724i`。

## 2026-07-24 · 分頁再調整：專案設定改名專案總覽、專案更新歸位、狀態改名專案歷程（B 反饋導入）

- **【B】** 分頁「專案設定」改名 **專案總覽**（`data-panel` 仍為 `settings`，深連結不變）。
- **【B】** 「專案更新」由「方案與承諾」搬回「專案總覽」；「方案與承諾」現在只剩支持方案與里程碑。
- **【B】** 「狀態」卡改名 **專案歷程**——卡內三列（建立草稿／募資發布／募資截止）本來就是已發生與已排定的事件紀錄，原名容易與頁首的發布狀態下拉混淆。卡內的「未達標時自動全額退款」開關**是設定不是紀錄**，本輪先留在原處（它掛在募資截止這條時間軸上最好讀），若之後覺得混就搬去專案基本資料。
- 驗證：四個分頁內容逐一實測；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724i`。

## 2026-07-24 · 專案詳情四個分頁重新分類（B 反饋導入）

原本的分頁（總覽／內容／公開資訊／共創金流）是按「資料型態」分的，使用者要求改成按「這件事在做什麼」分。經三輪討論定案成四個分頁，每個都能用一句話說完。

- **【B】** 分頁與歸位（`data-panel` 一併改名，深連結 hash 同步）：
  - **專案設定**（`settings`）＝規則與權利：專案基本資料（原「關於專案」卡，同名易與分頁混淆，卡標題改「專案基本資料」）、狀態與時間軸、合作者與分潤、IP Rental
  - **方案與承諾**（`pledges`）＝賣什麼、答應什麼、說了什麼：支持方案定義（新卡）、里程碑、專案更新
  - **關於專案**（`about`）＝作品長什麼樣：展示內容、內容項目、公開資訊（原「內容」與「公開資訊」兩分頁合併）
  - **專案收益**（`money`）＝錢到哪了，全部唯讀：共創金額、撥款進度、上映後分潤、支持者總覽與明細、音樂類版稅
- **【A】** 新增「支持方案」卡（`project-detail.tiers.*`）：三個方案的名稱／價格／名額／內容，逐列與卡頭都有編輯入口，接新抽屜 `pd-edit-tier`。原本方案定義與支持人數混在收益頁的「支持者總覽」，現在定義歸設定側、收益頁只留人數與名單。
- **【B】** 撥款進度卡補一行規則說明（`pd-cf.tranche-rule`）：「預算 5 萬以下這一級距分三期撥款 40/30/30，第一期之後每期都要先遞交對應物料」。**級距與比例由平台依預算決定、創作者不可改**，所以整塊留在收益頁，規則當說明文字、進度當內容，不拆成兩個分頁。
- **【D】** i18n：新增四個分頁鍵、支持方案卡與抽屜共 12 鍵；`project-detail.tab.overview`／`.content`／`.details` 三個舊鍵移除（已無引用）。`project-detail.about.title` 值由「關於專案」改「專案基本資料」。
- **【D/規格】** `documents/5.1.2.2-專案詳情.md` §3 原寫「本頁顯示序與編號序一致」，重新分組後不成立，改成「顯示序不必等於編號序，分組屬呈現決策」。§2.x 區段定義與編號未動。
- **【D/假設】** 新增產品缺口 PG-018：支持方案發布後能否編輯未定。依使用者指示**先保留編輯功能**，抽屜內以提示文字標明「已有 28 人支持、發布後能否更動待產品裁決」，等上游裁決。
- **刻意沒做**：里程碑同時被三處使用（設定維護／公開端呈現／撥款觸發），使用者裁示先維持現狀，正典定在「方案與承諾」分頁；對外資訊分散在兩個分頁（公開資訊在關於、里程碑與更新在方案與承諾）也維持現狀。
- 驗證：四個分頁逐一實測內容正確、深連結 hash 可用；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724g`。

## 2026-07-24 · 專案假資料改用公開端的真實海報（B 反饋導入）

使用者指定專案的假資料圖片一律取自 ztor 公開端共創計畫預覽站（`ztor-cocreate-preview.vercel.app`）。原本專案在兩個地方都只有圖示佔位（詳情頁 hero 是漸層底＋專案名文字、清單卡片檢視是灰底 lucide 圖示），換成真實海報後才看得出「這是一部作品」。

- **【D/素材】** 15 張圖存進 [images/projects/](./images/projects/)：7 張 2:3 直式海報（6 部片＋1 張音樂）、7 張 16:9 橫式卡圖、1 張情境圖，共 2.2MB。目前實際被引用的是 9 張（hero 1＋卡片 8），其餘 6 張直式海報先備著，等專案詳情頁改成吃資料、每個 demo 專案都有自己的海報時接上。兩張原始 PNG（2.7MB／2.2MB）以 `cwebp -q 80` 轉成 webp（160KB／123KB）並縮到 800／1200 寬，其餘來源本身就是 webp／jpg，原樣保留。
- **【B】** project-detail hero 封面由漸層文字佔位改成 `<img class="ip-hero__cover ip-hero__cover--photo">`。
- **【A/元件變體】** `shared.css` 新增 `.ip-hero__cover--photo`（`padding:0`／`background:none`／`object-fit:cover`）。規則必須排在 `.ip-hero__cover` 之後——兩者同權重，先寫會被佔位樣式蓋掉，實測會在海報四周露出 16px 內距的漸層框。
- **【B】** projects 卡片檢視封面改放真實海報：`PROJECTS` 資料每筆加 `cover` 欄位，render 端有 `cover` 才出 `<img class="project-card__cover-img" loading="lazy">`，沒有的專案（例如新建、還沒上傳素材）仍走原本的圖示佔位。
- **【A/元件變體】** `shared.css` 新增 `.project-card__cover-img`（鋪滿 16:9 封面格並裁切）。
- **未動**：清單檢視的 `.project-list__icon` 與 my-ip／訂單等頁的縮圖晶片仍是圖示，維持 [STYLE-DECISIONS](STYLE-DECISIONS.md) Q20 的單一標準；那批要不要改放真實圖片屬另一題。
- **假資料的名實不符**：demo 專案名（Late Bloom、Coastline EP…）與海報上的片名（我要衝線、陳松伶精選…）對不起來，這是借用他站 demo 素材的必然結果。要一致的話得改專案名或另備素材，屬產品層決定，此處不自行更動。
- 驗證：詳情頁與清單卡片檢視實測海報正常裁切、無漸層殘框；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724e`。

## 2026-07-24 · 專案詳情 hero 比照公開端共創計畫版型＋promote `funding-panel`（B 反饋導入）

使用者給了 ztor 公開端共創計畫詳情頁（`ztor-cocreate-preview.vercel.app/cocreate-project.html`）的截圖與連結，要求專案詳情 hero「比照這個排版」，並指定：原本 hero 裡的東西一件都不能少、tab 以下不動、右側 Actions rail 改成「和其他詳情頁一樣的頁首」、工具放頁首該放的位置。

- **【B】** 新增 `.page-intro` 頁首（麵包屑之下、hero 之上），比照 order-detail／event-detail 的既有骨架：左側狀態徽章列（進行中／短片／先募資）＋ `h1` 專案名 ＋ 建立與募資脈絡副標；右側 `.page-intro__actions` 放發布狀態（`.field` ＋ `.select` ＋ `.field__hint`，保住原本的「具金流或支持者承諾影響的狀態轉換需確認」說明）與三顆操作（發布更新 ghost／在 Ztor 上預覽 outline／儲存變更 primary）。標題與副標從 hero 上移到這裡，避免同頁出現兩個標題。
- **【C】** hero 右側 `.ip-hero__side` Actions 卡撤除——內容整批搬進上述頁首，無遺漏項目。
- **【A/元件變體】** `shared.css` 新增 `.ip-hero--project`：兩欄（240px 海報｜內容）、海報改 2:3 直式、`align-items:center`。基底 `.ip-hero`（ip-detail 使用中）完全未動。900px 以下沿用既有單欄規則，另補 `max-width:220px` 免得 2:3 海報變成滿版超高直幅（實測 860px 已驗）。
- **【A/元件 promote】** 新增 [funding-panel.css](./ds-components/funding-panel.css)：已募金額＋支持人數同列／目標行／進度條＋百分比藥丸／倒數＋募資期間／底部口徑註記。取代原本「四格 `meta-cell` ＋裸 `.project-bar` ＋註記」的攤平寫法，四個數字一個都沒少，只是換成與粉絲端相同的讀法。進度條內層直接重用 `.project-bar`，不重造量條。
- **層級與邊界的取捨**：參考來源的面板有可見 1px 邊框，此處刻意不照抄——面板坐在 `.ip-hero`（L1 卡）內＝L2 巢狀層，依 [STYLE-DECISIONS](STYLE-DECISIONS.md) Q24 只用 `--nest-surface` ＋ `--shadow-nest-up` 分層。照抄邊框會讓「卡內第二層」出現第二種答案。百分比藥丸沿用進度條的 `--primary`（同一個進度讀數角色，不觸及 Q8 的品牌橘範圍）。
- **【D】** `design-system.html` 新增 §4.91 Funding panel（TOC＋demo＋規格表）、ip-hero 規格表補 `--project` 變體列；`design-system.md` 補元件表一列與 §4.91 完整條目。
- **【D】** i18n 新增 `project-detail.fund.backers`／`.goal`／`.left`／`.period` 四鍵。原 `project-detail.meta.raised`／`.goal`／`.backers`／`.left`／`.left-val`／`actions.title` 因版型改變不再被消費，鍵值保留未刪。
- **未做**：公開端的全幅模糊背景、返回列、發起人頭像列、關鍵字 chips 未移植（後台頁沒有這些角色；發起人資訊已在頁首副標）。tab 以下四個分頁完全未動。
- 驗證：dark／light 兩主題與 1292／860 兩寬度實測無破版、無橫向捲動、console 無錯誤；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724c`。

## 2026-07-24 · 建立流程頂欄左欄補下限＋募資頁上傳格收進 `.upload-assets`（D infra／元件）

承上一則的同一輪反饋，兩處都是「共用版面在窄視窗下失控」，故一併從元件層收。

- **【D/元件】** `shared.css` `.wizard__top-bar` 三欄軌道改 `minmax(var(--wizard-lead-min), 1fr) minmax(0, 820px) minmax(min-content, 1fr)`，新增 `--wizard-lead-min: 180px`。原本兩側都是純 `1fr`：左欄標題塊有 `min-width:0`＋ellipsis、最小能縮到 0，右欄的儲存狀態＋按鈕不能縮（約 196px），視窗一窄中欄的 820px 就把左欄整個吃掉，標題溢出欄外壓在進度條上。實測 1058px 時 col1＝0、標題與 stepper 重疊；補下限後 col1＝180、進度條退到 224 起，重疊消失。1440px 實測 266/820/266 與改前相同，寬螢幕零影響。六個建立頁共用同一骨架，一次生效。
- **【B】** create-campaign 與 funding-test 的海報／橫幅上傳格改用 `.upload-assets` ＋ `.upload-tile--3x4`，移除 inline `aspect-ratio`。原本兩格各 314×419（同比例所以沒溢出，但投放區高得誇張），現為 150×200。維持原有 3:4 比例未動——「橫幅」標籤配直式比例看起來像上游的呈現筆誤，屬產品層判斷，僅記於此不自行更改。
- **【D】** 同兩頁的頁內 `@media (max-width:1180px)` 原本把 `.wizard__top-bar` 整組軌道覆寫成 `1fr minmax(0,520px) 1fr`，會繞過上面那條下限、在 1180px 以下重現同一個重疊。改成只收窄中欄、兩側沿用 shared.css 的軌道。
- **【D】** `funding-test/create-campaign.html` 的資產版本字串手動對齊到 `20260724b`。`bump_ver.py` 與 `check_ds_sync.py` 都只掃 site 根層的 `*.html`、不遞迴子目錄，所以這個沙盒頁一直停在 `20260714b`，檢查 3 也看不到它——本輪先手動補齊，腳本的遞迴問題留給下一輪處理。
- 驗證：1058／1440／820 三個寬度實測頂欄無重疊、無橫向捲動；`check_ds_sync.py` 全 PASS；`bump_ver` → `20260724b`。

## 2026-07-24 · promote `.upload-assets` 具名素材槽列（D infra／元件）

create-project「作品呈現」的四個素材格（縮圖／直式海報／橫幅／相簿）原本是寫在頁面裡的臨時 grid（`repeat(2,1fr)` ＋逐格 inline `aspect-ratio`），實測整排寬 852px 撐破 732px 的容器、單格高到 568px。成因是 grid `1fr` 的最小尺寸為 auto：格子帶了 `aspect-ratio` 後，瀏覽器拿比例換算出的內容尺寸回頭撐開欄寬，四格互相拉扯就衝出容器。這是元件缺角（DS 只有等比的 `.upload-grid`／`.upload-showcase`，沒有「每格比例都不同」的排法），不是單頁筆誤，故走元件層而非就地補 CSS。

- **【D/元件】** `upload-tile.css` 新增 `.upload-assets`：flex-wrap 列，格子高度＝共用 `--upload-asset-h`（200px，≤640px 收 148px）、寬度由比例推導。改成「固定高度推寬度」就沒有那條回饋迴路，格子在任何容器寬度下都不可能溢出。
- **【D/元件】** 新增形狀修飾詞 `.upload-tile--1x1`／`--3x4`／`--3x2`／`--16x9`，取代 inline `aspect-ratio`。
- **【D】** create-project 步驟 2 圖片區改用上述 class，移除該區全部 inline 樣式。1058px 實測：200／150／356 三格排第一列（右緣 893 ≤ 容器 895）、相簿 300 換行，整區高 412px、完全收在 section 內。
- **【D】** `design-system.html` §Upload tile 補「具名素材槽」demo 卡與中英說明；`design-system.md` 補 Layout helper 段、Class API 兩列與「別把 `aspect-ratio` 加在 grid `1fr` 格子上」的成因註記。
- 未動 create-campaign／funding-test 同款 inline `aspect-ratio:3/4`：兩格同比例、實測 314×419 未溢出，屬另一個「投放區過高」的議題，留待反饋。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 5／7／11 皆存量、基準未動）；`bump_ver` → `20260724a`。

## 2026-07-23 · `.view-switch` 退場、收斂進 segmented icon 變體（C 撤除）

使用者反饋清單／卡片切換器「很醜、和 design system 不搭」。問題不在細節而在角色重複：`.view-switch` 選中側是實心填 `--foreground`，這是站上第三種「已選中」畫法，與 segmented 的白浮起 pill 打架（見 [STYLE-DECISIONS](STYLE-DECISIONS.md) 已選狀態一題）；而「切換同一資料的視角」本來就是 segmented 定義的角色。故不另調樣式，直接收斂成 segmented 的純圖示變體。

- **【C】** `shared.css` 的 `.view-switch` / `.view-switch__btn`（含 `--active`）規則移除，原處留墓碑註解說明去向。唯一消費者是 projects，無其他頁受影響。
- **【A/元件變體】** `segmented.css` 新增 `.segmented__btn--icon`：32px 正方段、`--sp-6` 內距、18px 圖示。文字段靠左右內距撐寬，圖示段得改正方，否則 14px 內距會把圖示擠扁。
- **【C】** `design-system.html` §4.60 View switch 改為墓碑段（保留錨點免斷 TOC，標 ✝ retired 並指向 Segmented control）；`design-system.md` 於 §4.22d Segmented 補 Class API 一列與「接收 `.view-switch` 退場」註記。segmented DS demo 加 icon 變體示例卡。
- **【D】** i18n 新增 `projects.view.label`（en `View`／zh `檢視方式`）供 segmented 群組的無障礙標籤。
- **【Bug 例外記一筆——因為它改的是元件行為不是修錯字】** `.list-toolbar__actions` 由絕對定位改成 `margin-left:auto` 的流內排列，`.list-toolbar > .tabs` 補 `flex:1 1 auto; min-width:0; overflow-x:auto`。原本絕對定位時 tabs 仍佔滿整條，projects 的 6 個 tab 在 1280px 以下會捲到動作群底下疊字（實測撞到）；改流內後 tabs 只吃剩餘寬度、裝不下就橫捲。e-shop 因動作群本來就靠右、垂直置中，改後位置不變（已實測）。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 剩 5／7／11 皆存量）；棘輪檢查 10 PASS；`bump_ver` → `20260723zt`。projects 於 800／1440 兩種寬度、e-shop 於 1440 皆已實測。

## 2026-07-23 · projects 頁頭整理成 e-shop 同款兩層骨架＋promote `list-toolbar`（B 反饋導入）

使用者圈起 projects 頁頭整塊（頁頭動作群＋狀態 tabs＋篩選列）說「整理，可以參考電子商店的設計」。三段控制項本來各自佔一條、彼此沒有層級關係；改成 e-shop 那套「殼層工作列＋次層篩選列」後收成兩層。

- **【B/元件 promote】** e-shop 頁內的 `.eshop-list-topbar`／`.eshop-list-toolbar__actions`／`.eshop-status-row` promote 成共用元件 [list-toolbar.css](./ds-components/list-toolbar.css)（`.list-toolbar`／`.list-toolbar__actions`／`.list-status-row`），projects 為第二個消費者。CSS 規則值原樣搬移未改。sticky 貼頂留在各頁 `<style>`（依各頁捲動容器決定），e-shop 的 sticky 規則改指新 class 名。
- **【B】** `projects.html` 頁頭重組：狀態 tabs 移進殼層工作列左側（加 `tabs--underline-short`，底線貼齊容器下緣）；檢視切換與「＋建立專案」自 `page-intro__actions` 移進工作列右側動作群；搜尋改用共用 `.search-collapse`（收合成放大鏡、✕/Esc 收起並清空關鍵字），與 e-shop／orders／pickup 一致；發行模式與內容類別兩個 select 落在第二層 `.list-status-row`。`page-intro` 只剩標題與說明（同 e-shop）。
- **【B】** tabs 補 `role="tablist"`／`role="tab"`，render 時同步 `aria-selected`。
- **【D】** 三件套同步：新增 `list-toolbar.css`＋`design-system.md` §4.90 條目與元件清單一列＋`design-system.html` §4.90 區段（含 rendered preview、TOC 連結、head 載入）。`design-system.md` Pillar 3 那條「`.eshop-list-topbar` 頁內覆寫例外」改記為已解除。
- **【D】** `projects.html` head 補載 `list-toolbar.css`／`search-collapse.css`；i18n 新增 `projects.search.{open,close}` 2 鍵（en/zh）。
- **順帶修掉一個存量 WARN**：`check_ds_sync` 檢查 8（DS 級覆寫不留頁面）原本長期標記 `e-shop.html` 的 `.eshop-list-topbar`，promote 後改 PASS。
- 驗證：`check_ds_sync.py` 檢查 8 由 WARN 轉 PASS，其餘全 PASS（WARN 剩 5／7／11 皆存量）；棘輪檢查 10 PASS 未新增裸值；`bump_ver` → `20260723zr`。深淺兩色主題與搜尋收合互動皆已在瀏覽器實測。

## 2026-07-23 · projects 發行模式篩選由 chip 收成下拉（B 反饋導入）

使用者問「狀態與發行模式兩排篩選，哪個該全列展開」。裁決：狀態全列、發行模式收起。理由三條——狀態是後台的日常主軸（草稿要補、進行中要盯、失敗要善後），發行模式是專案建立時就定死的屬性、只在偶發情境才篩；狀態 tab 帶計數、不點也有資訊價值，發行模式 chip 不點等於白佔一列；tabs 與 chips 都是橫向膠囊排、視覺重量接近，兩排並置看不出主次。

- **【B】** `projects.html` 的發行模式由 `chip-group`（`#proj-types`，4 顆 chip）改成 `.select`（`#proj-type`），與內容類別 select、搜尋框同列；JS 的 `chipsEl` 點擊監聽改為 `typeEl` change 監聽，render 改同步 `select.value`。狀態 tabs 維持全列展開＋計數不動。
- **【B/元件文件】** `.filter-row` 的 chip-group 那半確立為**可選**：低頻篩選收成 select 後整條列只留 `.filter-row__actions`（放 select 與 `.field-pill` 搜尋），內容左靠。三件套同步：`chip.css` 註解＋`design-system.md` class 表＋`design-system.html` Filter row 加 actions-only 示例卡與 Anatomy 改寫。CSS 本身未改。
- **【D】** i18n 新增 `projects.type.label`（en `Release mode`／zh `發行模式`，供 select 的 aria-label）。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量）；棘輪檢查 10 PASS 未新增裸值；`bump_ver` → `20260723zp`。

## 2026-07-23 · projects 撤除身分維度篩選（C 撤除）

使用者裁決：Creator Studio 是創作者自己的後台，Projects 的範圍就是「我發起的專案」，不該出現支持者／影評人視角——那是消費端共創前台（`cocreate-src/finance-overview.html`）的軸，同日批次 3 搬進後台屬誤植。ASSUMPTIONS [CCR-005](ASSUMPTIONS.md) 該項結案為「不納入」。

- **【C】** `projects.html` 移除身分 `chip-group`（`#proj-identity`：All／Creator／Backer／Tastemaker）、demo 提示 `info-banner`（`#proj-identity-note`）、`identity` 篩選狀態（`match()` 條件、render 同步、事件監聽、清除篩選重置）與資料的 `roles` 欄位。
- **【C】** 移除 3 筆「別人的專案」樣本列：Dragon Gate Nights／First to the Line／Paper Boats。樣本資料回到 8 筆、全為帳號本人發起。
- **【C】** `js/i18n.js` 移除 `projects.identity.{label,all,creator,backer,tastemaker,explore}` 6 鍵（en/zh）；`projects.html` 移除已無消費者的 `info-banner.css` 載入。
- **保留**：內容類別軸（`#proj-cat` select ＋ `cat2` 資料欄）不動，改併入第一列 `filter-row__actions`（搜尋框左側），版面回到單列篩選。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量）；棘輪檢查 10 PASS 未新增裸值；`bump_ver` → `20260723zo`。

## 2026-07-23 · Co-create 整合 批次 3：projects 加內容類別＋身分兩維度篩選（B 反饋導入）

`projects.html` 新增兩個獨立篩選維度，接上既有 projects 篩選機制（status tab × type chip × search 同一 `match()`）。對照原始碼 `cocreate-src/finance-overview.html` 的 `[data-fin-dd="cat"]`（影視/音樂為不可選群組標頭）與 `[data-fin-dd="role"]`（發起人/支持者/影評人，`data-fin-role` 空白分隔集合語意）。登記於 [ASSUMPTIONS.md](ASSUMPTIONS.md) CCR-005。**未新增任何元件**——全部重用既有 chip／select／info-banner。

- **【B】內容類別（新軸，獨立於發行模式 type，不取代它）**：第二列 `filter-row` 右側放原生 `.select`（`#proj-cat`）＋optgroup 呈現階層——群組標頭 Film & TV（影視）／Music（音樂）用 `<optgroup>` 為**不可選**（對齊 cocreate），可選葉節點 Film 電影／Short drama 短劇／Series 連續劇／Single 單曲／Album 專輯。資料每列加 `cat2` 葉值（`CAT_GROUP` 對應群組）；既有樣本列顯示類別文字不動、僅另掛 `cat2` 供篩選。
- **【B】身分維度（R2.1 projects 新概念）**：第二列 `filter-row` 左側 `chip-group`（`#proj-identity`：All／Creator／Backer／Tastemaker），沿用既有 type-chip 機制（`chip--active` 反白）。資料每列加 `roles` 集合（一列可 backer+tastemaker）；新增 3 筆標記 backer／tastemaker 的樣本列（Dragon Gate Nights／First to the Line／Paper Boats＝別人的專案、meta 自帶「你支持／評論的專案」自我標示，幣別 USD）。
- **【B】探索性原型明確標示**：選到非 Creator 視角（含混合 All）時顯示 `info-banner`（info 圖示）標「僅為 demo、未定案」；`match()` 加 `cat`／`identity` 兩條件、清除篩選一併重置；render 同步 chip active／select value／optgroup label（optgroup label 為屬性、無 `[data-i18n]` handler，於 render 以 `i18nT` 設定）。
- **【D】** `projects.html` head 補載 `input.css`（`.select`）／`info-banner.css`（原本未載）。
- **【D】** i18n 新增 15 鍵（en/zh）：`projects.cat.{label,all,grp.filmtv,grp.music,film,short,series,single,album}`（9）、`projects.identity.{label,all,creator,backer,tastemaker,explore}`（6）。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量：fan-store 裸色、control-h 待採用 token、e-shop leak、cookie-banner/footer 零消費，非本輪引入）；棘輪檢查 10 PASS 未新增裸值；`bump_ver` → `20260723zn`。

## 2026-07-23 · Co-create 整合 Slice 2-B：project-detail Music 型版稅分析（B 反饋導入）

`project-detail.html` Money 分頁補「Film / Music」兩型切換與音樂型版稅分析區塊。對照原始碼 `cocreate-src/my-cocreate-proposal.html` 的版稅分頁（`data-tab-panel="royalty"`，第 1340–1456 行），幣別原始碼即 USD、照抄示意值；提案性質，標「提案 · 未定案」，登記於 [ASSUMPTIONS.md](ASSUMPTIONS.md) CCR-006。

- **【B】** money 分頁頂部加 `segmented`（`__btn`／canonical）Film／Music 切換，`data-money-type` + 小段 IIFE（比照 earnings breakdown toggle 寫法）；Film＝隱藏版稅區塊（預設，Late Bloom 為短片）、Music＝顯示。
- **【B】** 新增音樂型版稅分析區塊（`[data-money-section="music"]`，`hidden` 由 IIFE 切換）：(1) 季度版稅總額用既有 `kpi`（US$1,590 · Q2 2026）；(2) 地區佔比 11 條、(3) 平台佔比 8 條，皆用既有 `rank-bars`；(4) Top 10 歌曲用既有 `ztor-table`，兩排序（依版稅金額／依播放次數）以第二個 `segmented`＋`data-song-sort` IIFE 切兩張預排表。頂部一條 `info-banner`（alert-triangle）標提案未定案。
- **【B/元件變體】** `rank-bars` 加 `--amount` 變體：既有 rank-bar 只有「名稱＋%」，地區／平台需「名稱＋%＋金額」，故 `chart.css` 加 `.rank-bar--amount`（grid 改 `1fr auto 48px`）＋`.rank-bar__amt` 值欄。三件套同步：`chart.css`＋`design-system.md`（anatomy 行＋class 表）＋`design-system.html`（rank-bars demo 加 `--amount` 示例卡＋class API 列）。
- **【D】** `project-detail.html` head 補載 `segmented.css`／`chart.css`／`table.css`（原本未載）。
- **【D】** i18n 新增 40 鍵（en/zh）：`pd-cf.type-film`／`type-music`、`pd-roy.*`（proposal-note／total-label／total-meta／byrev／region.title／platform.title／rg.{tw,jp,us,hk,sg,my,kr,th,ca,au,other}／pf.friday／top.{title,byrev,byplays,col-song,col-royalty,col-plays}／song.s1–s10）。歌名 zh 存原題、en 為譯名。
- 驗證：`check_ds_sync.py` 全 PASS（WARN 皆存量：fan-store 裸色、control-h 待採用 token、e-shop leak、cookie-banner/footer 零消費，非本輪引入）；棘輪檢查 10 PASS 未新增裸值；`bump_ver` → `20260723zm`。

## 2026-07-23 · Co-create 整合 Slice 2b：cocreate-dashboard.html 退場（C 撤除 · 使用者確認）

`project-detail.html` 共創金流分頁（Slice 2）已完整承接統一模型內容，`cocreate-dashboard.html` 成為冗餘頁；使用者確認後刪除。

- **【C】** 刪除 `cocreate-dashboard.html`；解除三處註冊——`js/devtools.js` FULL_ROUTES、`js/sidebar.js` FULL_ROUTES、projects NAV `match`。
- **【D】** `cocreate.*` i18n 鍵**保留**（project-detail 共創金流分頁續用中，i18n.js 註解已改指向）；`avatar-stack` 的 DS 文件 evidence（design-system.html/md）由 cocreate-dashboard 改指 project-detail。
- 驗證：`check_ds_sync.py` 全 PASS；全站 grep `cocreate-dashboard` 僅剩文件敘述（UI-CHANGES／ASSUMPTIONS 歷史紀錄），無活連結。

## 2026-07-23 · Deck for Sony 收入管理視覺回饋修正一輪（B 反饋導入 · D infra）

使用者逐點回饋 earnings-sony.html 的呈現，六項修正：

- **【B】** 收益走勢圖改為隨寬度延展：`.linechart` 改用 `.linechart--axes` 標準結構（Y 軸刻度 `.linechart__y-axis` 與 X 軸 `.linechart__labels--sparse` 移出 SVG 成 HTML），SVG 加 `preserveAspectRatio="none"` 填滿卡寬（原本無此屬性→依 3:1 比例置中留白）。刻度移出 SVG 避免被橫向拉伸變形。
- **【B】** 影評人佣金比例條由 `insight-row`（品牌淡橘）改為 `info-banner`（中性線框＋圓圈 ⓘ），比照使用者指定的元件；本頁不再用 insight-row。
- **【B】** 「我的項目」表加線框：外層 `.fin-tablecard`（`--border` 1px＋`--radius-xl`＋overflow hidden），比照 DS 其他資料表外框。
- **【B】** 類別／身分／日期三個篩選鈕由 `btn--ghost` 改 `btn--outline`（線框）。
- **【B】** 提領歷史／如何運作由右側滑出抽屜改為**置中彈窗**，改用 canonical `.payout-modal` / `.payout-dialog` 殼（`__head`／`__title`／`__body`）；`finance-overview.js` 開關改成切 `.payout-modal[hidden]`＋點遮罩／Esc 關閉。彈窗內 `.ztor-table` 儲存格加 `white-space:nowrap`，修正窄欄把日期／狀態擠成多行的變形。連帶：本頁不再載入／使用 `drawer.css`（該元件若無其他 consumer 將由治理巡檢標為退場候選）。
- **【D】** `ds-components/empty-card.css` 補 `.empty-card[hidden]{display:none}`：原本 `.empty-card{display:flex}` 蓋掉 `[hidden]`，導致以 hidden 屬性切換的每類型空狀態「有資料時仍常駐顯示」。此為元件層修正，惠及所有以 hidden 切換 empty-card 的 consumer。

第二輪追加四項：

- **【B】** 收益走勢改用完整 `chart-card` 元件（`__head` 標題＋副標「依收益類型」＋`.segmented`(`__item`) 期間切換＋`__icon-btn` 匯出鈕＋`__body`＋`__foot` 資料範圍），承載 5 條不同顏色的線（沿用 `--chart-1..5`／`linechart__line--s1..s5`）。period 切換 JS 由 `.segmented__btn` 改對 `.segmented__item`。本頁改載 `chart.css`＋`segmented.css`。
- **【B】** Coming soon 三 chip 呈現為 disabled 狀態（`.fin-soon .chip{opacity:.5;cursor:not-allowed}`）。
- **【B】** 「我的項目」金額欄表頭改右對齊對齊數值（`.ztor-table th.fin-amt{text-align:right}` 蓋過 `.ztor-table thead th` 的預設 left）。
- 新增 i18n `fin.trend.sub`／`fin.trend.range` 兩鍵。
- 驗證：`check_ds_sync` 全 PASS；http 起站實測——chart-card 標題／副標／期間切換（可切）／匯出鈕／頁腳齊全、5 色線填滿卡寬、Coming soon 淡化、金額表頭右對齊、佣金條 info-banner、表線框、三篩選鈕線框、空狀態預設隱藏、提領歷史置中彈窗不變形、i18n 0 raw key。

## 2026-07-23 · Deck for Sony 版收入管理＝finance-overview 忠實移植（A 新增 · D infra）

「Deck for Sony」（Presentation demo 版本）的收入管理頁改為 ztor cocreate 站 `finance-overview.html`「財務總覽」的**忠實內容移植、改套 R2.1 設計系統**。只在該版本經 `route:earnings.html=earnings-sony.html` 顯示，不動 Phase 1–4 的 `earnings.html`。範圍界定見 [ASSUMPTIONS.md](ASSUMPTIONS.md) UIA-082（呈現／簡報 demo，收入模型未納入 R2.1 產品規格）。來源：`ztor20/Frontend` feature/cocreate-flow。

- **【A】** `earnings-sony.html` 全頁重建：頁首＋副標（開「如何運作」抽屜）、3 張 KPI（總收益／本月收益／可提領＋提領鈕＋提領歷史）、影評人佣金比例 15% 一列、7 類存入類型分段篩選（兼圖例）、Coming soon 三 chip、收益走勢 5 線圖＋期間 tabs、「我的項目」表（類別／身分／日期篩選、6 列、發起標、點列前往、存入總和、分頁）、每類型空狀態（8 種文案）、提領歷史抽屜（18 列＋狀態標＋分頁）、如何運作抽屜（8 種收益類型定義）。元件對應：`kpi`／`insight-row`／`chip`（+`fin-dot` 圖例點）／`tabs`／`chart`（`linechart--s1..s5`）／`card`／`ztor-table`／`dropdown`／`badge`／`empty-card`／新 `drawer`／新 `pager`。頁面 `<style>` 僅放 finance 專屬一次性版面，全走 token、無裸值、不覆寫共用 class／token。
- **【D】** 新增兩支元件：`ds-components/drawer.css`（右側滑出抽屜）＋ `ds-components/pager.css`（數字分頁，頁碼沿用 `.btn`）。三件套的 `design-system.html` demo／`design-system.md` 條目由並行的「Co-create 整合」工作串補入並經 `check_ds_sync` 檢查 1/4/9 驗證對齊。
- **【D】** `partials/finance-overview.js`（新）：自包含 vanilla JS（無 fetch、file:// 可跑）接四類互動——類型分段篩選連動走勢圖聚焦＋表格列篩選＋金額欄改標＋對應空狀態；類別／身分下拉疊加篩選；兩表數字分頁；兩抽屜開關（scrim／關閉鈕／Esc）。
- **【D】** `js/i18n.js` 新增 `fin.*` 一組雙語鍵（en＋faithful zh，zh 即來源繁中文案）。`js/sidebar.js` 的收入管理項 `match` 已含 `earnings-sony.html`（前一輪）。
- 驗證：`node --check` 過 finance-overview.js／i18n.js；`check_ds_sync.py` 全 PASS（棘輪存量裸值 54、未增）；http 起站實測——版本切 Deck for Sony 後 navbar 0 隱藏、i18n 0 raw key、KPI/chip/列/線/抽屜齊全、類型篩選連動圖表聚焦＋列篩選＋金額改標＋空狀態、兩抽屜開關與提領歷史分頁（3 頁）皆正常。

## 2026-07-23 · Co-create 整合 Slice 2：project-detail 併入統一模型金流＋內容區可編輯化（B 反饋導入 · C 撤除 · 依 CCR-007）

使用者裁決把 r2.1 專案詳情與 cocreate preview 內容**整合成單一專案詳情頁**：preview 的排版/UI 可借用、token 用本站、元件擇優。本筆為合併主刀。

- **【B】** `project-detail.html` Money 分頁改「共創金流」（`project-detail.tab.money` 值改 Co-creation & money／共創金流，`data-tab="money"` hash 不變）：統一模型說明條＋4 格 KPI（134 人/$8,420·56%/$9,713 含自付/撥款 0%）＋共創金額卡（支持者募資＋**發起人自付額 $2,000**＋資金池＋系統費−$707＋應撥，Late Bloom 口徑）＋上映後分潤卡（70/30，保留「Trigger distribution」手動觸發）＋撥款三期卡（預算 5 萬以下 40/30/30，交付 gated）＋支持者分層卡（3 tiers＋avatar-stack＋名額進度）＋支持者明細卡（達標才扣款/扣款重試中）。
- **【C】** 撤除舊 NFT 模型區塊：Revenue waterfall（60/40）、Distribution（NFT holders 60/40 列）、NFT holder governance 卡——由統一模型取代（backer＝NFT holder 併軸，CCR-007 使用者裁決）。i18n 舊鍵保留未刪（僅 markup 移除）。
- **【B】** 內容區可編輯化（原型級，改動作用本頁、不持久化）：關於專案 Edit／合作者 ＋Add／里程碑 ＋Milestone（新增鈕）／發布更新（操作 rail 與 Updates 卡兩處）→ 各開對應 **drawer 編輯面板**（重用 `ds-components/drawer.css`；表單用既有 `.input`/`.textarea`/`.select`）。儲存即回寫頁面：改標題與描述、新增合作者列（Pending confirmation）、新增里程碑列、置頂新公告列（Just now·受眾）。受眾選項照 spec §2.2.9（Everyone/Backers only/Superfan+）。
- **【B】** `<head>` 補掛 `drawer.css`＋`avatar-stack.css`；`js/i18n.js` 新增 `pd-cf.*` 18 鍵＋`pd-edit.*` 22 鍵（en/zh）。
- 驗證：`check_ds_sync.py` 全 PASS；本機 http 實測——共創金流分頁渲染正確、About Edit drawer 滑出/表單/儲存正常（截圖 merged-money-tab.png／edit-drawer-about.png）。`cocreate-dashboard.html` 暫留（退場屬治理動作，待使用者確認後走墓碑機制）。

## 2026-07-23 · Co-create 整合 Slice 1b：cocreate-dashboard 改「統一模型」＋補 drawer/pager 進 DS 頁（B 反饋導入 · D infra）

使用者裁決把 NFT/淨利池 與 股權/70-30 兩模型**收斂成單一「統一模型」**（見 [ASSUMPTIONS.md](ASSUMPTIONS.md) CCR-007 2026-07-23 更新）。

- **【B】** `cocreate-dashboard.html`：財務兩張卡改統一模型。共創金額卡新增「發起人自付額」列（`sliders-horizontal` icon，$0＝純預購・可設 0～任意）＋「資金池合計」列（支持者募資＋自付）；淨收益卡改標題「上映後淨收益分潤」、badge「股權模型→統一模型」、支持者列標「支持者（NFT 持有者）」、註記改為自付額可調分潤＋可手動提早觸發；頂部說明條改述統一模型。
- **【B】** `js/i18n.js`：改 5 個既有 `cocreate.*` 值（explore-note／split.title／split.model／split.backers／split.note）＋新增 6 鍵（payout.backers／backers-meta／selffund／selffund-meta／pool／pool-meta），en/zh 雙語。
- **【D】** 補並行新增的 `drawer.css`（🟠 organism，右側滑出面板）與 `pager.css`（🟡 molecule，數字分頁）進 `design-system.html`（head link＋4.33d/4.33e demo 卡＋TOC 錨點 `#drawer`／`#pager`，drawer demo 可互動開合）與 `design-system.md`（清單各一列）。此二元件由 earnings 財務整合並行加入、當時漏同步 DS 頁，本輪補齊清掉 check_ds_sync FAIL（非本人新建，DS 三件套補全）。
- 驗證：`check_ds_sync.py` 全 PASS（86 元件全連入·每支有 demo·TOC 全解析·無新裸值）。本機 http 截圖確認統一模型財務區渲染正確。

## 2026-07-23 · Co-create 整合 Slice 1：新增「共創依專案儀表板」後台頁 cocreate-dashboard.html（A spec-derived · 依 ASSUMPTIONS CCR-007，探索原型）

使用者裁決把 ztor cocreate 前台（來源＝GitHub `ztor20/Frontend` 分支 `feature/cocreate-flow`）缺在後台的管理功能整套補齊、兩財務模型（NFT/淨利池 vs 股權/70-30）並存、看畫面再決定模型。四刀計劃見 [docs/共創後台-執行計劃-2026-07-23.md](../../docs/共創後台-執行計劃-2026-07-23.md)、落差分析見 [docs/共創後台落差分析-2026-07-23.md](../../docs/共創後台落差分析-2026-07-23.md)。本筆為 Slice 1（模型預覽頁），內容為探索原型、非已定案產品行為（見 [ASSUMPTIONS.md](ASSUMPTIONS.md) CCR-007）。

- **【A】** 新頁 `cocreate-dashboard.html`：後台版共創專案儀表板，鏡像前台 `my-cocreate-proposal.html`「共創進度」＋撥款。區塊＝麵包屑／探索提示 info-banner／`.ip-hero`（封面·狀態·募資摘要·操作 rail）／4 格 KPI（`.kpi`＋`.bento--span-3`）／共創金額（`.project-bar`＋`.data-list`：支持總金額−系統費＝應撥）／淨收益 70/30 分配（重用 `.waterfall__row--distribution`）／支持者分層總覽（`.data-list`＋新元件 avatar-stack）／撥款三期（`.data-list` icon 態）／支持者付款明細（`.data-list`＋狀態 `.badge`）／活動公告。全用既有 token 與元件，無寫死值。
- **【A】** 版本 gating：`<html data-page-feat="full">`＋登記 `js/devtools.js` 與 `js/sidebar.js` 兩處 `FULL_ROUTES`（低版本直連回 E-Shop、跨頁入口隱藏）；掛進 `projects` NAV 的 `match`（側欄「專案」高亮）。歸 Phase 4，低版本不出現。
- **【D】** 新元件 `ds-components/avatar-stack.css`（🟡 molecule，重疊頭像＋`+N` 更多膠囊；28px 圓·`--card` 分隔環·`--muted`/`--accent` 填·`--radius-pill`）：第一次出現即 promote。同步 `design-system.html`（4.33c demo 卡＋TOC 錨點 `#avatar-stack`）＋`design-system.md`（元件清單表新增一列）。
- **【A】** `js/i18n.js`：新增 `cocreate.*` 共 75 鍵（en/zh 雙語，zh 對齊頁面文字，接於 `project-detail.*` 區塊後）。
- 驗證：`check_ds_sync.py` 全 PASS（棘輪存量裸值 57 未增、無新裸值；84 元件全進 DS 頁；116 TOC 錨點解析；md↔html 對齊）。本機 http 開頁截圖確認全區塊 DS 風格內渲染正確。cache-bust 全站 bump 留待 Slice 收束前跑。fresh-context read-back 由 `ui-closeout-verifier` 另派。

## 2026-07-23 · Co-create 整合 批次 2-A：收入管理依專案接到共創儀表板（B 反饋導入）

使用者要的「收益拆解 → 依專案＝單一專案儀表板」。單一專案共創金流儀表板已由另一 session 建在 `project-detail.html` 的 Money 分頁（集資／三層分層／支持者名單／70-30 分潤／分期撥款）；本 slice 把 earnings 依專案接過去，不重做內容。

- **【B】** `earnings.html`：收益拆解 → 依專案（`data-bd-section="project"`）的動作鈕由通用「View project」（`href="#"`）改為 primary「View co-creation dashboard →」，deep-link 到 `project-detail.html#money`。project-detail 的 tab JS 支援 hash（`location.hash` → activate），會直接開 Money 共創金流分頁。
- **【B】** `js/i18n.js`：`breakdown.action.project` 文案改；`breakdown.project.sub` 補一句指引「完整集資／支持者／撥款儀表板在共創金流分頁」。
- earnings 依專案保留其財務 waterfall（收益拆解語意），完整專案管理儀表板走連結接通，避免重複。check PASS、bump `zl`。
- **未做（批次 2-B）**：project-detail 共創儀表板仍缺 film/music 兩型切換與音樂版稅分析（地區／平台／Top10 歌曲）。

## 2026-07-23 · Co-create 整合 批次 1c：收入管理收益來源＋交易篩選擴充成 14 類（B 反饋導入 · ASSUMPTIONS CCR-001）

把合併分類體系（CCR-001）落到收入管理的兩個顯示點。

- **【B】** `earnings.html` Overview「Revenue by source」rank-bars 由 6 條擴為 9 條，加入 3 個 cocreate 提案類（Co-creation funding 20%／Tastemaker commission 11%／OTT royalties 9%），百分比重排為示意 demo（9 條總和 100%）；新類 dot 用 `--chart-2/5/3` token（非裸值）。既有 6 類的 `data-feat` gate 保留。
- **【B】** `earnings.html` 交易明細篩選 chip 加 3 個 cocreate 類（`cocreate`／`commission`／`ott`，重用既有 `src.*` label）。chip 是既有的純視覺單選切換（不實際篩表格），故未加對應示範交易列——交易明細示範資料維持原樣，待有真實 cocreate 交易口徑再補（記此限制於此）。
- 未改 i18n（沿用 CCR-001 已建的 `src.*` key）、未新增元件。驗證：`check_ds_sync.py` PASS（棘輪存量裸值未增、無新裸 hex）；`bump_ver.py` 全站統一。

## 2026-07-23 · Co-create 整合 批次 1b：收入管理加影評人佣金比例 strip（B 反饋導入 · ASSUMPTIONS CCR-002 提案）

依 preview `finance-overview.html` 的 `.fin-ratio` strip，在收入管理頂部 KPI 列下方加一條影評人佣金比例 callout。忠於 preview 做法（strip 而非第 5 張 KPI 卡），不動現有 4 張 KPI 排版。

- **【B】** `earnings.html`：4 張金額 KPI 的 `bento` 下方新增一條 `when-data` 包住的 `insight-row`（既有元件，品牌橘 tint 單行 callout）：`percent` icon ＋「Your tastemaker commission rate is 15%, applied to net income · View terms」。`<head>` 補掛既有 `insight-row.css`。
- **【B】** `js/i18n.js`：新增 `earnings.ratio`（en/zh，值含 `<strong>15%</strong>` 與條款連結，連結暫指 `#`——影評人條款頁在 R2.1 尚不存在）。
- 影評人身分與佣金比例屬提案（CCR-002），未定案。
- 未新增元件。驗證：`check_ds_sync.py` PASS（版本一致、棘輪 57 未增）、`percent` icon 在 registry；`bump_ver.py` 統一 `?v=20260723zc`。

## 2026-07-23 · Co-create 整合 批次 1a：收入管理新增「How it works」分頁（B 反饋導入 · 依 ASSUMPTIONS CCR-001 提案）

使用者要求把 ztor cocreate 原型（來源＝GitHub `ztor20/Frontend` 分支 `draft/dashboard-merge-demo` 的 `finance-overview.html`「如何運作」drawer）的財務能力整合進 R 2.1 收入管理，此為三批工程第一塊。收入分類合併地基見 [ASSUMPTIONS.md](ASSUMPTIONS.md) CCR-001（14 類詞彙表）。內容為提案、非已定案產品行為。

- **【B】** `earnings.html`：分頁列（§5.1.8.2）新增第 6 個 tab「How it works」（`data-tab="howto"`、無 `data-feat` gate、常顯）＋對應 `tab-panel`——一張 `card` 內用共用 `ztor-accordion` 列 14 種收入類型（R2.1 §7.3 既有 8 類 ＋ cocreate 新增 6 類：共創計畫／OTT 版稅／音樂版稅／影評人佣金／影評人預付金／共創派對收益），每類點擊展開白話定義；卡尾 `info-banner` 標「提案、未定案」。`<head>` 補掛既有 `accordion.css`。
- **【B】** `earnings.html` JS 兩處：tab hash 白名單加 `howto`；新增手風琴展開／收合 IIFE（scope 限 `[data-panel="howto"]`，toggle `data-state`＋`aria-expanded`）。
- **【B】** `js/i18n.js`：新增 9 個收入類名稱鍵（`src.cocreate`／`collaborator`／`fanvestor`／`ott`／`music`／`commission`／`advance`／`bonus`／`party`，供本頁與後續交易明細／收益來源擴充共用）＋`earnings.tab.howto`＋`howto.title/sub/note`＋14 條 `howto.d.*` 定義，皆 en/zh 雙語。cocreate 6 類 zh 沿用 preview drawer 原文、r2.1 8 類依 §7.3 措辭；英文為本輪翻譯、語意統一 USD。
- 未新增元件（用既有 accordion），design-system 無需同步。
- 驗證：`check_ds_sync.py` 全 PASS（棘輪存量裸值 57 未增、無新裸值）；`bump_ver.py` 全站統一 `?v=20260723zb`。tab 切換／i18n 切語言 0 raw key 的 fresh-context read-back 留待批次 1 全數（1b 影評人 KPI／1c 交易·來源分類擴充）完成後一起派工。

## 2026-07-23 · cheat code 新增「Presentation demo」組與 Deck for Sony 版本（D infra）

新增一個以 Phase 4 為基底的簡報 demo 版本 Deck for Sony：其餘頁面全同 Phase 4，只有收入管理頁改接到新的 Sony 簡報版。同時把版本面板分組從「開發／測試」寫死改成依「類型」欄動態分組，之後加組免動渲染程式。

- **【D】** `feature-scope-map.md`：「開發版本配置」表新增一列 `deck-for-sony`（顯示名 Deck for Sony、類型 `Demo`、規則 `route:earnings.html=earnings-sony.html`）；表下說明補上「類型欄＝面板分組鍵」與「特殊版需登記 `isFullBaseVersion()`」兩點。
- **【D】** `js/devtools.js` 三處：
  - `VERSIONS` 後備陣列同步加 deck-for-sony 一列。
  - `verRows()` 由寫死 dev/test 兩組改為依 `v[2]` 類型動態分組，配 `VER_GROUP_LABEL`（`Demo`→「Presentation demo」）與 `VER_GROUP_ORDER`。
  - 新增 `isFullBaseVersion()` 收斂「以 Phase 4 為基底」白名單（full／funding-test／deck-for-sony）；`applyRouteAvailability()` 與 `guardPageFeature()` 兩處改用它，取代原本硬比 full／funding-test，否則新版會被當低版本藏掉 full-only 頁。
- **【D】** `js/sidebar.js` 兩處：
  - 收入管理 nav item 加 `match: ["earnings-sony.html"]`，讓變體頁 active 高亮正常。
  - `fullVersion()` 白名單補上 `deck-for-sony`（navbar 有獨立於 devtools 的 route gate，`fullVersion()` 是 `isFullBaseVersion()` 的重複份；初版漏補，導致 Deck for Sony 下 navbar 誤藏所有 Phase 4 選項）。feature-scope-map 說明已標注此白名單須兩處同步。
- **【D】** 新增 `earnings-sony.html`：目前為 `earnings.html` 的忠實複本佔位（頂層放置，資產路徑免改），內容待 Sony 簡報版規格確定後重建；`ds-baseline.json` 對應登記 3（＝複本自 earnings.html 繼承的既有例外裸值，非新增技術債）。
- 驗證：`node --check js/devtools.js`／`js/sidebar.js` 語法過；`check_ds_sync.py` 全 PASS（棘輪存量裸值 57，未增）；版本切換／改接行為由 fresh-context subagent 讀檔核對。

## 2026-07-23 · 電子商店商品清單移除低庫存門檻 tooltip（C 撤除）

使用者裁示：單一選項商品（zine／acetate／pin）hover 狀態／庫存欄時，浮卡只留「目前庫存」一行，拿掉當天稍早才加的「低庫存門檻」那一行。

- **【C】** `e-shop.html`：`thresholdLine()` 改名 `currentStockLine()`，回傳值只剩目前庫存一行；門檻換算（`lowThr()`／limited 版讀 cap／unlimited 版「無固定門檻」文案）整段移除，不影響補貨彈窗共用的 `lowThr()` 本體（該函式仍在，供 `TEE_VARIANTS`／`HOODIE_MATRIX` 等資料算門檻用）。多選項／組合商品的逐選項庫存明細 hover 不受影響。
- **【C】** `js/i18n.js`：移除已無消費者的 `e-shop.stocktip.threshold`／`e-shop.stocktip.unlimited` 兩個 key；`e-shop.stocktip.currentstock` 保留（仍在用）。
- **【D】** `design-system.md`／`.html` §4.56 Stock tip 同步：說明文字、Do & Don't、Rendered preview demo（合併原本兩個單一選項 demo 成一個，只顯示目前庫存）、規格表 Behavior 欄全部改寫，不再提低庫存門檻。
- 驗證：`node --check` 過 JS 語法；`check_ds_sync.py` 待跑確認全 PASS。

## 2026-07-23 · 取貨清單場次欄拆欄＋名稱三行（B 反饋導入）

使用者要求：取貨管理清單（`pickup.html` F4）的場次欄，把「場次名稱」與「內容（商品·票券）」拆成兩個獨立欄位；並在場次名稱下用灰字分兩行顯示取貨地點與時間，連名稱共三行。

- **【B】** `pickup.html`：F4 `product-list--pickup` 第 2 欄（場次）改為三行——第一行場次名稱連結（`__title`）、第二行取貨地點、第三行時間（皆 `__meta` 灰字、各自一行）；原本疊在名稱下的「內容」meta（如「2 商品 · 1 活動票券」）獨立成第 3 欄，第 3 欄由原「取貨地點與時間」改為「內容」。欄數不變（仍 8 欄），原獨立的「取貨地點與時間」欄併入名稱欄後移除。純 markup 重組，沿用既有 `__title`／`__meta`／`__cell` class，無新增 CSS 或元件。
- **【B】** `js/i18n.js`：`pk.col.loctime` 表頭改為 `pk.col.content`（Contents／內容）；每列 `pk.rowN.loctime` 單一字串拆成 `pk.rowN.loc`（地點）＋`pk.rowN.time`（時間）兩鍵；內容欄沿用既有 `pk.rowN.meta`。

## 2026-07-23 · 支付手續費拆雙金流商 Atom／Stripe＋固定額移除幣別前綴（B 反饋導入／產品範圍提案 UIA-081）

- **【B／產品範圍提案】** 支付手續費由**單一費率**改成**兩個金流商各自的費率**：Atom（3.4%＋2.40）、Stripe（3.4%＋2.35），每個各有「百分比＋每筆固定額」，只在「基本設定」分頁（`fee-payment-atom`／`-atom-fixed`／`fee-payment-stripe`／`-stripe-fixed`）。**超出現行規格單一費率**——記 `ASSUMPTIONS.md UIA-081`（示意值、前端 demo，結算未接）。
- **【C】** 例外彈窗（`fee-exception-modal.js`）**移除支付手續費整塊**（原唯讀鏡射）：支付手續費全站統一、不逐 Creator（D141），例外只覆寫平台費，放在彈窗只是雜訊；連帶刪掉 `open()` 的鏡射邏輯。參考值改看「基本設定」分頁（2026-07-23 使用者裁示）。
- **【B】** 固定額前綴**只留靜態「$」**（原 HK$ 拿掉 HK、保留 $；`.amount-field.amount-field--readonly` ＋ `__unit`＝「$」，input 仍可編）：實際幣別由 Admin 側欄的全站幣別統一。連帶**撤回前一版的「固定額幣別跟隨平台」機制**（`data-fee-cur`／`FEE_CUR_SYM`／`applyFeeCurrency()`／side listener 全刪）。
- **【B】** Admin 側欄幣別**只留 HKD**（`sidebar.js` 移除 TWD 選項；`applySavedCurrency()` 加護欄：非 HKD 的舊存值一律回退 HKD，避免卡在無法切換的狀態）。
- 副標 `fees.payment.sub` 改為「每個金流商各自的費率……」。
- 驗證：Playwright 確認設定頁兩列可編、彈窗兩列唯讀且值鏡射自設定頁、無 HK$ 前綴；`check_ds_sync.py` 全 PASS。

## 2026-07-23 · 電子商店商品清單整列可點開啟編輯（B 反饋導入）

使用者要求：商品清單每一行點擊時直接進入編輯——草稿進對應建立頁、已建立商品進對應細節頁。這正是 Orders／Creators 列既有的「整列可點」模式，本次是 E-Shop 商品清單第一次套用。

- **【B】** `e-shop.html`：`.product-list--eshop`（涵蓋 Products／Bundles／Auctions 三分頁）新增整列點擊委派。目的地不另外判斷草稿/已建立邏輯，直接讀該列 kebab 選單裡標籤為「編輯」的 `<a href>`（用 `:has([data-i18n="e-shop.edit"])` 精準鎖定，不是抓第一個 `<a>`——已出貨的 ended 拍賣列 kebab 唯一連結是「追蹤履約 → orders.html」，抓錯會點去訂單頁）；沒有編輯項的列（如該 ended 拍賣）點列不做任何事。排除握把（拖曳重排用）、operations 欄（kebab 選單本身，含 stock tip 的觸發格）與任何 `<a>`/`<button>`。
- **【B】** `ds-components/product-list.css`：`.product-list--eshop .product-list__row` 加 `cursor: pointer`——只有 `--eshop` 有這個點擊行為，`--ip`（My IP 清單，共用同一份 hover 樣式）沒有，游標提示不能共用。
- **【D】** `design-system.md`／`.html` §4.27／§4.26 Product list 同步補上這條行為說明與 Do 條目。
- 驗證：`node --check` 過 JS 語法；逐列稽核 kebab 選單是否含「編輯」項確認只有 2 列（Stage-worn leather jacket、Vintage synth，皆為已出貨 ended 拍賣）沒有編輯項，符合設計、點擊安全 no-op；`check_ds_sync.py` 全 PASS。

## 2026-07-23 · 訂單清單移除商品縮圖欄、訂單內容行距加大（C 撤除／B 反饋導入）

同日第四輪，使用者裁示「訂單管理列表不需要商品圖片」，並要訂單內容各行間距大一點。

- **【C】** **移除訂單縮圖欄**：`product-list--orders` 由 9 欄改 8 欄，拿掉本輪稍早才加的首欄縮圖（`.product-list__image`／表頭空 Icon 欄／每列 image-cell 全移除）。欄序改＝訂單編號／訂單內容／買家／金額／付款狀態／出貨狀態／日期／actions。連帶移除 `.product-list--orders .product-list__image-cell` 右內距規則；≤760px 堆疊左內距由 sp-72 收回（無縮圖不需清位）。這也讓「訂單清單改真實照」的 Q20 scoped 例外失效——訂單清單不再是縮圖家族 consumer（STYLE-DECISIONS Q20 註記已更新）。
- **【B】** **訂單內容行距加大**：`__line` 各品項行之間加 `margin-top:var(--sp-6)`（`.product-list__line + .product-list__line`），多品項訂單各行不再貼太緊。
- **【D】** DS 兩份文件 `--orders` 條目同步（8 欄、無縮圖、行距）。純呈現層。
- 驗證：check_ds_sync 全 PASS（棘輪未升）；fresh-context 讀檔驗收。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 訂單清單縮圖真實照、訂單內容多行、編號複製鈕、整列可點（B 反饋導入）

同日第三輪，使用者對訂單清單再指定五點呈現調整。

- **【B】** **訂單內容改多行**：`__items` 欄由單行 `__meta`（fs-12 灰字、各品項 ` · ` 串一行）改為每項商品一行的 `__line`（白字 `--foreground`＋與其他欄同字級 fs-13）；欄位 `-webkit-line-clamp:4`＝最多 4 行、超過第 4 行以 … 截斷。row1（#ZT-10482）示範兩品項兩行（新增 `orders.row1.item1`／`item2`）。
- **【B】** **縮圖換真實商品照**：訂單列縮圖由 `.product-list__thumb`（icon chip）改用 e-shop 同款 `.product-list__image`（60×60 真實 `images/products/*.webp`）——tour-zine／coastline-ep／coastline-acetate 對應各單。此為 **Q20「清單縮圖 icon chip 單一標準」的訂單 scoped 例外**（記入 STYLE-DECISIONS Q20），`--pickup`／projects／data-list 仍維持 icon chip。
- **【B】** **縮圖與訂單編號拉開距離**：縮圖欄加 `padding-right:var(--sp-8)`，縮圖列首欄寬 44→68px（容 60 照＋內距），與編號約 28px 間距。
- **【B】** **訂單編號旁加很小的複製鈕**：`__order-id` 內加 `btn--icon btn--xs .product-list__copy`（icon 13px、muted→hover foreground），點擊複製編號、`title` 短暫顯示「已複製」（新增 `orders.a.copied`）、`stopPropagation` 不觸發整列開啟。編號欄寬 88→120px 容納。
- **【B】** **整列可點開啟訂單**：`__row` 加 `cursor:pointer`，清單層委派 click → `order-detail.html`；點 kebab／複製鈕／連結不觸發（`closest('.dropdown')`／`[data-copy]`／`a` 跳過）。**比照 creators 列的既有整列點擊慣例**，不新增第三種做法。
- **【D】** ≤760px 堆疊：訂單列左內距 56→72px 才清得過 60px 縮圖。DS 兩份文件 `--orders` 條目同步上述五點。純呈現／互動層，未動產品規則。
- 驗證：check_ds_sync 全 PASS（棘輪未升）；fresh-context 讀檔驗收。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 訂單清單欄位重排＋現場取貨升為出貨狀態徽章（B 反饋導入）

承同日「訂單清單每項資訊各自成欄」，使用者再指定兩件事：欄位重排、把「1 項待現場取貨」升成出貨狀態軸的一顆徽章。

- **【B】** **欄位重排**：`product-list--orders` 9 欄改為 icon／訂單編號／**訂單內容**／買家／金額／**付款狀態**／**出貨狀態**／日期／actions（原順序把買家排在訂單內容前、出貨排在付款前）；「商品」欄改名「訂單內容」（`orders.col.items` en `Contents`／zh `訂單內容`）。
- **【B】** **現場取貨升為出貨狀態軸的履約值**：原本掛在訂單內容欄品項層 meta 的「1 項待現場取貨」小字徽章移除，改為出貨狀態欄的狀態徽章「待取貨」（新增 `orders.status.pickup`，en `Awaiting pickup`／zh `待取貨`、`badge--warning`）。混合訂單（配送＋現場取貨，如 #ZT-10482）在出貨狀態欄同時出現「待出貨＋待取貨」兩顆徽章，`__ship` 設 `gap＋flex-wrap:nowrap`、欄寬 `minmax(148px,auto)` 容兩顆水平不換行。
- **【D】** 這把取貨狀態由 D111 的「品項層、不改訂單層狀態」提升為訂單層出貨（履約）軸的狀態值＝**重新詮釋 D111**，記入 ASSUMPTIONS UIA-080、待上游回寫 spec 5.1.5.3；`orders.pickup.note` 頁尾說明同步改寫（品項層→出貨狀態欄徽章）。付款軸仍與履約軸分離（§7.2 不變）。DS 兩份文件的 `--orders` 條目同步新欄序與取貨軸說明。
- 驗證：check_ds_sync 全 PASS（棘輪未升）；fresh-context 讀檔驗收。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 訂單明細改主欄＋買家資訊右欄，金額拆解併入品項明細（B 反饋導入）

使用者要求把訂單明細（`order-detail.html`）改成左主欄／右側欄兩欄版型，並精簡區塊。

- **【B】** 版型改用既有 `detail-rail` 版型殼（`.page--narrow` 1056 窄版＋`.detail-grid` 主欄/300px 右欄）：**左主欄＝品項明細**、**右欄＝買家資訊**。原本四個 `form-section` 由上而下堆疊（品項明細／金額拆解／收入對帳／買家）改成兩欄。純呈現層重組，商品內容、金額口徑、買家資料一律不變。
- **【B／C】** **品項列改五欄表**（幾輪反饋收斂的最終形態）：使用者要求逐欄拆開、限購不顯示、出貨狀態簡化。品項列由單格改成五欄表（表頭＋列）：**商品名稱（名稱＋底下灰色字分類）｜數量｜單價｜出貨狀態（含取貨）｜小計**。
  - 分類由原本與單價合併的 `data-list__meta` 拆出、改放品名底下當灰色副標（`data-list__meta`）；數量（原品名旁 `×1`）獨立成純數字欄。
  - **【C】限購不再顯示**：`每人限購` 徽章從品項列移除（使用者指定；限購 enforcement／資料口徑不受影響，僅這頁不呈現）。
  - **出貨狀態欄（含取貨）簡化**：每列只顯示單一狀態——寄送品項＝`待配送`（`od.item.deliver`）；現場取貨品項＝`待取貨`＋`前往取貨場次`連結（`od.item.pickup.goto`，連 pickup.html）。原本的場次名稱（`od.item.pickup.session`）與核銷紀錄連結（`od.item.pickup.log`）移除。
  - 僅頁內 `.od-items` 範圍覆寫 `.data-list__row` 欄軌（商品／出貨兩欄 `minmax(0,fr)` 可收縮換行防溢出），**不動全站 `data-list`**（其餘 15 個消費頁不受影響）；page-specific class `.od-items__head`／`.od-cell`／`.od-col-r`／`.od-item-pickup`，皆吃 token。i18n 新增 `od.col.item`（改 zh 商品名稱）／`qty`／`unit`／`fulfil`／`subtotal`＋`od.item.deliver`／`od.item.pickup.goto`；`od.col.category`／`limit`／`pickup` 與 `od.item.limit`／`pickup.session`／`pickup.log`、`od.item1.meta`／`od.item2.meta` 改為未消費、保留未刪。
- **【B】** **金額拆解併入品項明細**：原 §2.3.2 獨立區塊撤除，其內容（逐項金額 `.od-amt`＋跨幣別提示＋對帳提示）移到品項明細的商品列表下，以細線（`.od-amt-group` 上緣 `--border`）分隔。
- **【C】** **收入對帳（§2.3.3）獨立區塊撤除**：原本整塊 form-section＋滿版 `View in Earnings` 按鈕，改成品項明細右下角一個常駐文字入口 `.od-amt-foot`（`card__link`，i18n 沿用 `od.amt.cta`「在收入管理查看 →」）。
- **【C】** **移除品項明細下方的限購說明句**（`od.limit.note`「限購商品於結帳時依買家累計購買量檢查；本頁僅呈現結果」）：每品項列上的 `Limit 2/person` 徽章仍在，限購結果照舊呈現，只撤說明長句。
- **【B】** **買家 → 買家資訊**：`od.buyer.title` 由「買家／Buyer」改「買家資訊／Buyer info」。
- **【D】** 新增 page-specific class `.od-amt-group`／`.od-amt-foot`（一次性版面，留頁面 `<style>`，皆吃 token 無裸值）；`order-detail.html` 新增 `detail-rail.css` 引用並改 `.page--narrow`。`detail-rail`／`page--narrow` 的 consumer 清單同步加入 order-detail（`detail-rail.css`、`design-system.md`、`design-system.html`）——`detail-rail` 首次用於「無 tabs、主欄為唯讀摘要」的情境，已在 design-system.md consumer 註記。舊 i18n key `od.items.sub.amount`／`od.sec.amount.sub`／`od.items.sub.recon`／`od.sec.recon.sub`／`od.limit.note` 保留未刪（無害、避免誤傷）。
- **spec 對照**：spec 5.1.5.3.1 仍以 §2.3.1/§2.3.2/§2.3.3＋§2.4 描述內容責任；本次只重組畫面分區與相對位置，不動產品內容口徑，未回寫上游 spec。
- 驗證：check_ds_sync 全 PASS；fresh-context 讀檔驗收逐條核對。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 電子商店商品清單新增「逐選項庫存」hover 浮卡（B 反饋導入）

使用者反饋：多選項商品／組合商品在清單上只看得到一個彙總庫存數字，想在「狀態」跟「庫存」兩欄 hover 時看到每個選項各自的庫存，不用另外點開補貨彈窗。先出規劃請使用者裁決三個開放問題（組合商品攤到哪一層、兩欄內容是否一樣、遮擋怎麼處理），使用者確認：組合商品攤到選項組合層級、兩欄內容先一樣、遮擋問題可以做。

- **【B】** 新增 `ds-components/stock-tip.css`（🟢 atom）：hover/focus 觸發格 `.stock-tip` + `position:fixed` 浮卡 `.stock-tip__pop`，逐行列出名稱與數字（`--low`/`--out` 修飾子上色）。多選項或組合商品列（tee／hoodie／兩個 Bundle）顯示逐選項庫存明細。
- **【B】** 使用者追問「為什麼不是每一列都有這個 hover」後擴大範圍：單一選項商品（zine／acetate／pin）也掛上，改顯示「低庫存門檻」——限量版（acetate）從列上的「在庫/上限」算出真實門檻（`lowThr(上限)`）；不限量版（zine、pin）沒有固定上限可以算 10%（spec §7.2／D105 本來就標「產品待確認」），如實顯示「不限量，無固定門檻」，不捏造數字。新增 2 個 i18n key：`e-shop.stocktip.threshold`／`e-shop.stocktip.unlimited`。
- **【B】** 同輪再修正：使用者截圖回饋 zine 列（急需補貨、3/∞）的浮卡只寫「不限量，無固定門檻」，跟目前庫存數字顯示衝突、答非所問。改成兩行——先「目前庫存」（依 `data-status` 上色，跟選項健康狀態同一套顏色規則）再「低庫存門檻」。新增 i18n key `e-shop.stocktip.currentstock`。順手抓到並修掉一個潛在衝突：acetate 庫存欄原本留著舊的原生 `title="In stock / edition cap"`，跟新掛的 `.stock-tip` 兩套 hover 提示會疊在一起，已移除原生 `title`。
- **【B】** `e-shop.html`：把原本鎖在補貨彈窗 IIFE 裡的 `TEE_VARIANTS`／`HOODIE_MATRIX`／`PRODUCT_MATRIX`／`PRODUCT_VARIANTS`／`BUNDLE_MEMBERS` 資料常數搬到共用作用域，新增一個獨立 IIFE 讀同一份資料產生浮卡內容——組合商品攤到「成員 · 選項組合」（如 `Coastline hoodie · S/Black`），矩陣型商品攤到「選項組合」（如 `S/Black`），不手key第二份數字。
- **【B】** 定位改 JS 算、不用純 CSS `:hover`：清單在 sticky 篩選列（`.eshop-list-topbar`／`.eshop-status-row`）下捲動，固定往同一方向開會被頂欄擋到或超出視窗；JS 在 `mouseenter`/`focusin` 量測觸發格位置，viewport 上半部往下開、下半部往上開。
- **【B】** 使用者接續反饋：徽章是「急需補貨」的列，浮卡只留真的需要補貨的選項（`low`／`out`），健康選項直接不列——這種列 hover 是要立刻看到哪裡出問題，不是看全部選項總覽。判斷依據是該列狀態格有沒有 `[data-i18n="e-shop.row.low"]`，不看選項本身的 status，避免徽章語意以後改了但濾掉條件沒跟著同步。目前資料裡只有 hoodie 列符合（S/Black、S/Sand 兩個問題選項留下，其餘 4 個健康選項濾掉）；tee／兩個 Bundle 徽章都是「Live」，浮卡維持完整清單不受影響。
- **【D】** `design-system.md`／`.html` 新增 §4.56／§4.89 Stock tip 條目（Class API、Token usage、rendered demo 三種情境：單軸、雙軸矩陣攤平且套用急需補貨過濾、組合攤平）；TOC 與元件總覽表同步。
- 順手記一筆既有 WARN 的裁決：`check_ds_sync` 檢查 8 標記 `.eshop-list-topbar`（頁內 `[data-theme]` 覆寫）——這顆 class 全站唯一消費頁是 `e-shop.html` 自己，沒有跨頁一致性風險，暫不 promote，已在 design-system.md 註記例外。
- 驗證：`check_ds_sync.py` 全 PASS（含新 WARN 例外註記）；JS 語法另以 `node --check` 過（Playwright 瀏覽器當時被佔用，尚待實機截圖複核 hover 定位翻轉與組合攤平格式）。

## 2026-07-23 · 訂單清單每項資訊各自成欄，狀態雙軸拆兩欄（B 反饋導入）

使用者指出訂單清單把「訂單編號＋買家＋商品」擠在一格、「出貨＋付款」兩顆徽章擠在同一「狀態」欄，要求每項資訊各自獨立成欄。

- **【B】** `product-list--orders` 由 6 欄改 **9 欄**：icon／訂單編號／買家／商品（取貨徽章仍掛品項層 meta）／金額／出貨狀態／付款狀態／日期／actions。編號原本是 `__title`＋買家是其中 `text-sub`、商品是 `__meta`，三者拆成三個獨立 `__cell`（編號 `__order-id` 字重 medium、買家 `__customer`、商品 `__items`）；狀態欄的 `.status-axes` 雙徽章拆成 `__ship`／`__pay` 兩欄各放一顆。純呈現層變更、不動產品規則——反而更貼合 spec §7.2「履約與付款兩軸分開、絕不混用」（reconcile 提示原文已如此聲明）。
- **【B】** 元件層只改 `--orders` 變體 grid 模板（疊在 base grid 上、不動 base，e-shop／bundles／auctions／pickup／ip 各變體不受影響）；`status-axes` 元件本身保留（order-detail.html 與 design-system.html 仍消費）。≤760px 堆疊模式：訂單編號當識別列貼縮圖右側，其餘欄依序堆下方。
- **【D】** i18n 新增欄名 `orders.col.orderid`／`customer`／`items`／`fulfilment`／`payment`（買家沿用全站慣例「買家」）；舊 `orders.col.order`／`status` 保留未刪（無害、避免誤傷其他引用）。
- 驗證：check_ds_sync 全 PASS（棘輪檢查 10 未新增裸值）；fresh-context 讀檔驗收逐條核對。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 補貨彈窗高度鎖定，切換方式不再跳動（B 反饋導入）

- **【B】** 補貨彈窗置中，但「定時補貨」比「立即補貨」多一欄「預計到貨」而變高，切換方式時整框上下跳。開窗時先量「定時」狀態（最高）的實際高度、鎖成 `.payout-dialog` 的 `min-height`，之後切「立即」維持同高（body flex 撐開、footer 仍釘底），不再跳。量測在同一幀 paint 前同步完成、看不到閃動；每次開窗重量，自動適應單/多規格不同內容高度（restock-modal.js `lockHeight()`）。

## 2026-07-23 · 補貨方式改用 radio-cards 元件＋「計時」正名「定時」（B 反饋導入）

使用者指出補貨彈窗的「立即補貨／計時補貨」還是舊的 segmented pill、應改用 Figma node 866-1191 的 radio-cards 卡片元件。

- **【B】** 根因是**漏連 CSS**：補貨彈窗 markup 早已是 `.segmented.radio-cards`，但 `radio-card.css` 沒連在承載彈窗的頁面上（product-detail、e-shop），退化成基礎 segmented pill。補上 `radio-card.css` 連結後即呈現 Figma 的兩張並排卡＋右上橘點（e-shop 連 `segmented.css` 也一起補，它原本兩支都沒連）。
- **【B】** 文案正名：`計時補貨` → `定時補貨`（restock.method.scheduled 與相關說明句，對齊 Figma）。
- **【D】** 卡片外圈多一層框的修正：`.radio-cards` 與 `.segmented` 同權重（各一個 class），product-detail 先連 radio-card 後連 segmented → 後載入的 `.segmented` 軌道底＋邊框蓋回去、露出外框。把容器覆寫規則提權成 `.segmented.radio-cards`（0,2,0），穩定蓋過不受連結順序影響（元件層根治，所有消費頁一致）。比對 Figma node 866-1190 確認無外框。
- 驗證：check_ds_sync 全 PASS；比對 Figma node 866-1191／866-1190 確認卡片樣式、文案與無外框。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 彈窗 footer 釘住收斂到元件層＋編輯加「新增選項」（B 反饋導入／D infra）

- **【D】** **footer/header 釘住改在 `.payout-dialog` 元件層**（payout-modal.css）：dialog 改 flex column＋`overflow:hidden`，`__head`/`__foot` `flex:none`、`__body` `flex:1＋overflow-y:auto`。原本整框 `overflow:auto` 會讓 footer 隨內容捲走、每個 popup 各自補救（restock／費率例外 `[data-fx-modal]` 曾 scope 修過，本輪兩處重複都移除）。**所有 `.payout-dialog` 消費者一次到位**。中間隔一層 wrapper 的兩種結構（請款彈窗的 `.payout-view` 步驟、creators 的 `<form>`）另加一條規則讓 wrapper 也成為撐滿的 flex column，footer-pin 才穿得到它底下的 head/body/foot（否則會被 `overflow:hidden` 裁掉、連捲軸都沒有）。
- **【B】** 編輯 popup 的選項管理補上**「新增選項」**（維度）：先前只能「新增選項值」；現在每個選項可改名／移除整個選項，底部「新增選項」可再加一個維度（如再加「材質」），組合表笛卡兒積即時重算、支援 3 層以上。收尾自動清掉空值/空選項。
- **【D】** i18n 新增 edit.addoption／optname.ph；DS 兩份文件的 Payout dialog（§4.29）補「釘住頭尾」行為；ASSUMPTIONS UIA-079 更新為「可增減選項值與選項維度」。
- 驗證：check_ds_sync 全 PASS，div/section 平衡，9 段 inline JS 語法通過。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-23 · 多規格改資料驅動＋兩階層（顏色×尺寸）、編輯改「管理選項值」（B 反饋導入）

使用者指出：電子商店的兩階層商品（hoodie：顏色 Black/Sand × 尺寸 S/M/L）開商品細節頁後只顯示單階層；且「新增組合」流程對兩階層不成立。

- **【B】** 商品明細規格表改**資料驅動**：由 `products-store` 的 `options`／`variants` 渲染。hoodie 建模成真正兩階層（顏色×尺寸＝6 組合，依顏色分組）、tee 維持單階層（尺寸）。新增 `.variant-table__group`（撐滿整列的分組標題，與補貨矩陣同語彙）。
- **【B】** 「編輯」改成**管理選項值**模型（取代錯誤的「單一組合新增」）：popup 內每個選項一塊、值可加/改名/移除，底下組合表笛卡兒積即時重算（`.variant-table--preview` 5 欄唯讀預覽）；價格/成本為全組合共用。儲存才寫回、取消丟棄草稿。
- **【C】** 移除「⋯ → 新增」選單項與整個「新增組合」popup（併入編輯）。
- **【D】** i18n：新增 edit.options/options-hint/combos/addvalue；移除已死的 add.* 與 stock.add。DS 兩份文件的 Variant builder 條目同步 `.variant-table__group`／`--preview`。產品缺口更新 ASSUMPTIONS **UIA-079**（事後增減選項值與 UIA-056／D137 鎖定衝突；兩階層 store 資料屬呈現、非產品規則）。
- 驗證：check_ds_sync 全 PASS，div/section 平衡，9 段 inline JS 語法通過。**瀏覽器目視驗證待補**（Playwright 被佔用）。示範：`?id=hoodie`（兩階層 顏色×尺寸）／`?id=tee`（單階層 尺寸）。

## 2026-07-23 · 銷售設定分頁：庫存卡改「唯讀＋彈窗編輯」、分頁改名（B 反饋導入）

- **【B】** 頁籤改名：定價與庫存→**銷售設定**、關聯→**商品推廣**（i18n `product-detail.tab.price-stock`／`.relations`；交付分頁維持依取貨方式動態命名）。
- **【B】** 當前庫存卡標題列加右側動作：**補貨紀錄**鈕（開 popup）＋ **⋯ 選單**（新增[多規格才有]／編輯／補貨）。新增 `.form-section__head--actions` 變體承載標題列動作。
- **【B】** 頁面表格改**唯讀**：多規格表的價格/SKU/成本/總量欄由 input 換成 `.variant-cell--ro` 純文字（`data-vc` 標角色）；單規格的價格/成本/總量上限改 `.field-readout` 唯讀文字。改值一律走 ⋯ → 編輯 popup。列尾「單獨下架」kebab 保留。
- **【B】** 三個新 popup（重用 `.payout-dialog` 殼）：**補貨紀錄**（內容＝原補貨紀錄 section，`data-restock-log` 仍在此，logRow 照舊寫得到）／**編輯**（單規格＝價格+成本；多規格＝逐組合表，列由 JS 依頁面表格即時複製，儲存寫回頁面）／**新增**（填組合名+價格+成本+起始庫存+SKU，送出 append 一列唯讀列）。
- **【C】** 移除頁面上獨立的「補貨紀錄」section 與庫存卡底部的整寬「補貨」鈕（補貨紀錄進 popup、補貨進 ⋯ 選單）。
- **【D】** 新元件：`.form-section__head--actions`（form-section.css）、`.field-readout`（field-system.css）、`.variant-cell--ro`（variant-builder.css），DS 兩份文件同步。產品缺口記 ASSUMPTIONS **UIA-079**（頁面唯讀＋彈窗編輯、事後新增／改名規格組合與 UIA-056／D137「規格建立後鎖定」衝突，前端 demo）。i18n 新增 stock.history/add/edit、edit.title、add.* 等鍵。
- 驗證：check_ds_sync 全 PASS，div 257/257、section 17/17，9 段 inline JS 語法通過。**瀏覽器目視驗證待補**（Playwright 被佔用）。示範：`?id=tee`（多規格）／`?id=zine`（單規格）銷售設定分頁。

## 2026-07-22 · 多規格表列尾改 kebab「單獨下架／重新上架」（B 反饋導入）

- **【B】** 定價與庫存·多規格表列尾的「X（移除）」改為三點 kebab 下拉（沿用 `.dropdown` 元件、`more-vertical`），選單一項「單獨下架／重新上架」。商品明細的規格建立後鎖定、不可移除，用「下架」而非「刪除」才對。
- **【B】** 下架後該規格列灰階＋輸入 `disabled`（新增 `.variant-table__row--delisted`，只壓「除 kebab 外的直接子代」，kebab 仍可用來重新上架）；選單項隨狀態切「單獨下架」↔「重新上架」。
- **【D】** 浮動選單防裁切：`.variant-table-wrap` 的 `overflow-x:auto` 會裁掉浮出的選單，新增 `.variant-table-wrap--menu` 在桌面寬度放行 `overflow:visible`、<560px 才恢復橫捲；product-detail 與 DS demo 的表格外框都掛上。
- **【D】** 產品缺口記 ASSUMPTIONS **UIA-078**（逐規格上下架非現有規格範圍，前端 demo）；DS 兩份文件的 Variant builder 條目同步兩種列尾消費（建立＝X 排除／明細＝kebab 下架）。i18n 新增 `product-detail.var.delist`／`.relist`。
- 驗證：check_ds_sync 全 PASS，div 219/219、section 15/15，8 段 inline JS 語法通過。**瀏覽器目視驗證待補**（Playwright 被佔用）。示範：`?id=tee`（多規格）定價與庫存分頁。

## 2026-07-22 · 定價與庫存·當前庫存精簡（C 撤除）

- **【C】** 多規格庫存表上方的「總計／選項組合數」兩行摘要（`kv--lead` Total／Options）移除——庫存數字已逐列在表格內呈現，表頭再給一次加總是重複。
- **【C】** 移除庫存版本（Unlimited／Limited edition）唯讀一行——限量與否已由單規格讀數的「/ 50」與 limited 進度條表達，多規格情境不需再列一行。
- **【C】** 移除「庫存欄唯讀——要增加數量請用右側的補貨」提示句：補貨按鈕就在同區塊、行為自明，提示句多餘。
- 驗證：check_ds_sync 全 PASS，div 216/216、section 15/15。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-22 · 交付分頁標題＝取貨方式本身、頁籤連動（B 反饋導入）

- **【B】** 交付與取貨 section 的標題改為取貨方式本身：實體＝物流配送／現場 QR 領取、數位＝交付與存取，由 `applyProduct` 依商品資料設定（同時設 data-i18n 與文字，語言切換仍正確）。
- **【C】** 移除區塊內的「取貨方式」唯讀欄位（標題已表達）；數位區塊內重複的「交付與存取」小標一併移除、只留說明橫幅。
- **【B】** 上方頁籤原「交付與取貨」改為與 section 同名的取貨方式（物流配送／現場 QR 領取／交付與存取）。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（Playwright 全程被佔用）。示範：`?id=zine`＝物流配送、`?id=acetate`＝現場 QR 領取、`?id=song`＝交付與存取。

## 2026-07-22 · 補貨彈窗間距對齊 Figma 866-1179（B 反饋導入）

使用者反映補貨彈窗表單間距不對。比對 Figma node 866-1179 的實測值修正。

- **【B】** 區塊間距由 20px 改 24px（Figma body gap 24）；「商品名稱」標題→逐選項表維持 8px（同一組）。
- **【B】** 供應商／備註／預計到貨時間由已退役的 `.payout-field`（2026-07-11 起無樣式、label 與 input 貼在一起）改用現行 `.field`／`.field__label`，恢復 label→input 間距與標籤字級。
- **【B】** 補貨方式兩張 radio-cards 的間距對齊 Figma（gap 16，元件預設 12；scope 在補貨彈窗、不動其他頁的 radio-cards）。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（Playwright 全程被佔用）。

## 2026-07-22 · 定價與庫存分頁重配版面、交付分頁取貨方式唯讀（B 反饋導入）

依使用者指定的 wireframe 分配重排商品明細兩個分頁。

**定價與庫存分頁** — 分頁內部自建 main／rail 兩欄（外層全域右欄仍以 `.detail-grid--full` 收起）：
- **【B】** 左主欄：價格（單選項）／當前庫存（單選項＝讀數、多選項＝逐選項組合表）／補貨紀錄。
- **【B】** 右欄：折扣設定、低庫存提醒設定（兩者自左主欄移入），加上每人限購（自交付分頁移入）。
- **【D】** `detail-rail.css`：`.detail-grid--full .detail-rail` 改直接子代 `> .detail-rail`，只收起本層全域右欄、不誤傷分頁內部新建的巢狀 rail。

**交付與取貨分頁**：
- **【B】** 取貨方式改唯讀顯示（物流配送／現場 QR 領取），移除切換器——商品明細不可更改取貨方式。**隱含「建立後固定」的產品規則，已記 ASSUMPTIONS UIA-077，未寫回 `documents/`。**
- **【B】** 物流配送欄位全部展開，移除「顯示更多」收合——重量／運送分類／尺寸／取貨地點一律直接呈現。
- **【C】** 每人限購自本分頁移出（併入定價與庫存右欄）。
- **【D】** i18n.js 新增 `data-i18n-value` 屬性支援（唯讀 input 的 value 可翻譯，通用）；移除 `wireSeg('pd-delivery')` 互動綁定。

- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（Playwright 全程被佔用）；單／多選項兩種版面、取貨方式唯讀顯示、footer 與 sticky rail 的實際行為尚未確認。

## 2026-07-22 · 補貨彈窗改版對齊 Figma（B 反饋導入）

依 Figma（node 861-28842 立即補貨 / 866-1179 定時補貨）重排補貨彈窗版型。共用元件——`product-detail` 與 `e-shop` 都開同一個。

- **【B】** 補貨方式由普通 `.segmented`（軌道膠囊）改成 `.segmented.radio-cards`（兩張並排卡＋右上橘點）；方式下方的灰色提示行移除。
- **【B】** 版型重排：逐選項表移到「補貨方式」正下方（商品名稱標題＋表格）；供應商／備註／預計到貨時間（僅定時）移到表格**下方**。
- **【B】** item layer 由 `.restock-line` 卡片列改成 `.restock-table` 三欄數字表：當前數量（唯讀）／補貨數量（可填）／補後數量（唯讀，＝當前＋補貨，即時算），依第一個選項分組（Small／Medium）。
- **【C】** 移除底部黃色 stickynote 提示框（Figma 無）；一併移除每列的低庫存徽章與門檻文字——每列改由「當前數量」欄顯示各選項現貨，比原本的徽章更精確。
- **【B】** footer 釘在框底：`[data-restock-modal] .payout-dialog` 改 flex 直列、只捲 body、head/foot 固定（與平台費率彈窗 `[data-fx-modal]` 同一套做法）。
- **【D】** `restock-modal.css` 以 `.restock-table*` 取代 `.restock-line*`；`partials/restock-modal.js` 的 `lineHTML`／`matrixHTML`／`recalc` 改吐表格結構（`data-restock-line`／`data-restock-qty`／`data-restock-after` 資料契約保留，`collect()` 不變）；`badgeFor()` 與方式提示切換退場。i18n 新增 `restock.product-name`／`restock.col.current`／`restock.col.after`（`restock.col.qty` 沿用補貨紀錄表既有 key）。
- **DS 文件**：`design-system.md` §4.29c 與 `design-system.html` 補貨彈窗 demo 卡由 `.restock-line` 改寫成 `.restock-table`。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（Playwright 全程被佔用）；落地前已用獨立預覽 `docs/補貨彈窗-Figma版-預覽.html` 逐輪與使用者確認版型（radio-cards 方式、間距、footer 釘底）。


## 2026-07-22 · 費率例外彈窗微調：欄頭「費率」、新增鈕線框等寬、去維度分隔線、支付固定額幣別跟隨平台（B 反饋導入）

- **【B】** 例外編輯器費率欄欄頭「此 Creator（空＝繼承預設）」→「**費率**」（`i18n.js fees.exc.col-rate`；彈窗 clone 的 fallback 同步為 `Rate`）。「空＝繼承」的說明保留在每個輸入框的 placeholder 與 badge，欄頭精簡。
- **【B】** 「新增例外商品」由虛線改**實線外框鈕**（`.btn.btn--outline`＋`.fee-exc-prod__add` 只覆寫整寬置中），並讓 `.fee-exc-prod` 左右內距歸零，使按鈕與商品列**與上方費率表等寬**（貼齊 `fee-tree__panel` 邊）。
- **【B】** 費率樹**各維度手風琴之間不畫分隔線**（`table.css`：`.ztor-accordion__item:has(.fee-tree__panel)` 解除全域 `.ztor-accordion__item` 的上下 1px border；用 `:has` 只命中費率維度、不動站上其他手風琴；各維度已用 `.admin-table-wrap` 外框自成一塊）。
- **【B】** 支付手續費的**每筆固定金額幣別跟隨平台幣別**（不再寫死 HK$）：Admin 側欄已有全站幣別（`localStorage 'ztor-currency'`，預設 HKD），設定分頁與例外彈窗兩處固定額的單位符號改讀該設定（HKD→HK$／TWD→NT$，`data-fee-cur`＋`applyFeeCurrency()`），同頁切換即時跟隨。
- 驗證：Playwright 確認欄頭「費率」、外框鈕寬 580＝表寬、五維度 border-top 皆 0、HKD→HK$／TWD→NT$；`check_ds_sync.py` 全 PASS。

## 2026-07-22 · Admin 側欄精簡＋幣別、費率樹全展開/去分隔線/彈窗滿版、E-Shop 逐商品例外（B 反饋導入）

- **【B】** Admin Creator Studio 側欄下方精簡（`js/sidebar.js` 依 `isAdminPlatform` 分流，不動 creator 頁）：只留**幣別**（新增，預設港幣 HKD，可切 TWD、`localStorage` 記住）＋**顯示模式**＋**登出**；移除搜尋、通知、帳戶選單。`js/icons.js` 補 `log-out` icon；`js/i18n.js` 新增 `nav.currency*`。
- **【B】** 費率樹**預設全部維度展開**（設定分頁 5 維度 markup 改 `data-state="open"`；例外彈窗 `renderTreeInto` 改一律展開）。
- **【B】** 費率樹**各交易項之間不畫分隔線**（`table.css`：`.fee-tree__panel .ztor-table tbody td { border-bottom:0 }`）。
- **【B】** 例外彈窗的**平台費表格填滿 body 可用寬度**（`table.css`：在 `.fee-tree__panel` 範圍解除 `.admin-table-wrap` 借來的 `min-width:840px`——那是給寬的 admin IP 銀行表設的，費率樹只有 2–3 欄不需要，在窄彈窗會被撐出橫向捲軸）。同日撤回先前「左右負邊距 edge-to-edge」做法：body 是 `overflow-y:auto`，內容戳出左右內距會讓 `overflow-x` 變 `auto`、長出多餘橫向捲軸。「新增例外商品」改用站上既有整寬虛線「新增列」語彙（`.fee-exc-prod__add`，同 `.variant-option__add-value`），不再是裸 ghost 鈕。
- **【B／產品範圍提案】** 例外彈窗 E-Shop 下加「**新增例外商品**」：選商品＋填該商品平台費，可加多列／移除。**超出文件資料模型**（`FeeException` 只有逐葉，無逐商品）——本輪為前端 demo（假商品池、不寫入 overrides、不進儲存），記 `ASSUMPTIONS.md UIA-076` 待上游裁決。
- 驗證：Playwright 確認側欄三項＋幣別 HKD→TWD 切換、樹全展開無分隔線、彈窗滿版、E-Shop 可加商品例外列；`check_ds_sync.py` 全 PASS。

## 2026-07-22 · 平台費率頁補 OTT 維度（A spec-derived，feature_description v1.1）

需求 v1.1 把 OTT/PPV 納入範圍（roadmap 票由「; not PPV」改「+ PPV」）。費率樹補第 5 個維度，達文件要求的 15 葉。

- **【A】** 新增「OTT · 線上影音」手風琴（置於專案 Projects 與 IP 之間），單葉 `ott.ppv`＝單次付費觀看（PPV），預設 **40%**；費率欄掛「**All-in**」badge，`title`／i18n 說明「費率已含金流手續費，不另計 3.4% + HK$2.40」（對應 `FeeRate.allIn=true`：此葉結算不另收支付手續費）。
- **【A】** 支付手續費卡副標（`fees.payment.sub`）補「OTT 除外，其費率已含金流」——符合文件 §4.1「支付手續費套用所有交易，但 allIn 葉（OTT）除外」。
- **【D】** `js/i18n.js` 新增 `fees.dim.ott`／`fees.leaf.ott.ppv`／`fees.ott.allin`／`fees.ott.allin.tip`。
- badge 放在費率欄（非葉標籤 `td`），避免 applyI18n 覆寫掉 badge；例外彈窗 clone 會一併帶入此葉（達 15 葉逐 Creator 覆寫）。
- 尚未做（另列，待你決定）：IP 三葉停用＋「待業務確認」標；生效日「≥ 今天」驗證；目前版本徽章／分頁名稱與順序跟文件的差異。
- 驗證：Playwright 截圖確認 OTT 手風琴可展開、40% + All-in badge、例外彈窗含 OTT 葉；`check_ds_sync.py` 全 PASS。

## 2026-07-22 · 建立 creator 改「搜尋前台帳號 → 選取後就地建檔」單面板（B 反饋導入，對齊 BR-02）

使用者反饋：Admin Creator 管理的「建立 creator」不該憑空填表，要改成先搜尋帳號、選到後就地帶出建檔表單、按建立。此流程正好對齊規格 §5.1.0 頁面定位「開店前置（BR-02）」——creator 來源是本人先在 ztor 前台自助註冊帳號，Admin 在此以該已註冊帳號為對象建檔（承接、非憑空開號）。同日經幾輪反饋收斂成下述單面板形態（去 stepper、不分兩步）。

- **【B】** `creators.html` 建立 creator 彈窗由單張憑空表單改為**搜尋帳號＋就地建檔的單面板**（續用 `payout-dialog` 殼）：
  - 搜尋——續用 IP Bank Entry「權利人」同款 `owner-lookup` 元件（即時 typeahead）：輸入即比對前台已註冊、尚未建檔的帳號池，依**人名／username／email** 顯示下拉結果（頭像＋名稱＋`@username · email · 註冊日`），點一筆＝選定並顯示「已選擇…」狀態。使用者反饋此框要能像 IP entry 那樣搜到人名或 email，故由原本的 `field-pill` 改為 `owner-lookup`。
  - 建檔表單——選定帳號後，下方即出現建檔欄位（**逐列排版、一欄一列**）：放大頭像（64px，沿用選定帳號首字母，無說明文字）、名稱／Email 沿用帳號唯讀、店鋪網址（`ztor.com/shop/…` 即時預覽、平台唯一擋重複）、電話（選填、帶入可改）；底部按鈕「建立」（選定前 disabled）。重新編輯搜尋框會收起表單、清除選定。
  - 反覆修正紀錄：先做成「search→下一步→列出清單→帶入→再下一步建立」的兩步精靈，使用者續反饋「搜尋框要用 owner-lookup」，再反饋「不要 stepper、不要分兩步、搜尋到後下方直接出表單、欄位逐列、頭像放大、拿掉『沿用註冊帳號的頭像』字樣」，最後給 Figma node 863-34562 要「照這個結構」——據以收斂為本單面板：搜尋區改單一 field label「搜尋 ztor 帳號」（去掉描述性 hint 段落）、搜尋與表單之間加**滿版分隔線**（`.creator-onboard` 以負邊界破出 body 的 `--sp-20` 內距再回填）、表單欄位逐列（頭像 64px→名稱→Email→店鋪網址＋預覽→電話（選填））、footer 取消／建立。移除 `progress-stepper` 與 step foot 切換。
  - 與 IP entry 版差異：`owner-lookup` 原模組（`partials/owner-lookup.js`）帶「未註冊 email→建立待寄送邀請」路徑，屬 IP 權利人語意；creator 必須來自已註冊帳號（BR-02），故此頁只借用 `owner-lookup.css` 視覺與結果列樣式、另寫在地 typeahead（無 invite 路徑）。
- **【B】** 建立＝把選定帳號 onboard 進名冊（`list.push`，status active、created＝今日），並自註冊池 `splice` 移除，避免重複建立。
- **【D】** `js/sidebar.js` 新增 `REGISTERED` 前台已註冊帳號池（6 筆 demo，含 id／name／username／email／phone／registered），`window.ztorCreator` 增 `registered`。
- **【D】** `js/i18n.js` 現用 `creators.search2-ph`／`no-account`／`acc-registered`／`acc-label`（改為「搜尋 ztor 帳號」）／`lookup-selected`（收斂過程曾加的 `step-search`／`step-confirm`／`next`／`back`／`avatar-inherited`／`search-hint` 已無引用、留待下輪清）。
- 依歸屬：流程改動屬呈現＋對齊既有 BR-02 產品規則；名冊／帳號池／自動生成店鋪皆前端 demo（UIA-029／045）。把名稱·Email 改「沿用註冊帳號、唯讀」是對 D107 建立欄位的**呈現詮釋**，記 ASSUMPTIONS（UIA-071），規格 §5.1.0 F2 建立欄位（D107）宜回頭與此對齊。
- 驗證：inline script／i18n.js／sidebar.js `node --check` 皆 OK、fresh-context 讀檔核對、`check_ds_sync.py` 全 PASS；瀏覽器實機走查待補（Playwright 佔用中）。

## 2026-07-22 · 平台費率頁儲存改分割下拉（立即／延遲生效）＋撤版本卡（B 反饋，Figma 865-100）

依 Figma node 865-100 結構調整儲存流程。

- **【B】** 分頁工具列改版對齊 Figma 865-100：整條分頁列收進圓角 `--card` 卡（背景／`--radius-xl`／`--shadow-card`＋`--shadow-edge-top`，比照 `tabs--card` 的表面處理但由工具列容器承載，好把右端儲存鈕一起包進同一張卡）；分頁改用既有 `tabs--underline-short` 變體（短置中橘色底線、去掉整條灰 hairline），對齊 Figma 的分頁樣式。
- **【B】** 儲存移到卡右端，改**分割鈕**（`details.dropdown` + `dropdown__menu`，復用既有下拉元件）：主體「儲存」＋ chevron 兩段、中間 1px 縫（比照 Figma 分割鈕）。按「儲存」＝立即生效（今天發版、不開下拉）；按 chevron 才開下拉——「立即生效」（`check` icon）、「延遲生效」（`calendar-clock` icon，開彈窗選生效日）。工具列整條加高（上下 `--sp-12`／`--sp-8` 內距、垂直置中），讓右側鈕上下留白。
- **【B】** 工具列右側動作鈕**依分頁切換**（JS 控 `[data-toolbar-action]` 顯隱）：費率設定＝儲存分割鈕、費率例外＝「＋新增例外」（由原本例外分頁內移上工具列）、版本歷史＝無鈕。切分頁時收合儲存下拉。注意：`hidden` 屬性會被 inline `display` 蓋掉，故被切換元素外層不留 inline display（flex 版面收進內層 div）。
- **【B】** 「延遲生效」開彈窗（復用 `payout-modal` 殼，`#fee-delay-modal`）＝原「費率版本與生效範圍」內容：只留「生效時間」日期欄＋「排程生效」，**去掉目前版本**。確認後以所選生效日發版；生效日在未來時該版本在版本歷史標「待生效」。
- **【C】** 撤除頁面上原本的「費率版本與生效範圍」獨立卡（含目前版本徽章 `#fee-cur-version`、待生效副行 `#fee-next-note`、生效日欄與 Save 鈕）——版本資訊改由「版本歷史」分頁承載；`addHistory()` 改為吃 `eff` 參數、不再更新頁面徽章。
- **【D】** `js/i18n.js` 新增 `fees.save.now`／`fees.save.later`／`fees.delay.title`／`fees.delay.hint`／`fees.delay.confirm`；`fees.version.save` 由「儲存並產生版本」縮為「儲存」。
- 責任邊界：立即／延遲＝生效日「今天 vs 未來」的兩種呈現，仍是 spec 5.1.0.3 F4「儲存發版、只對之後生效」的同一規則；未新增產品規則。移除頁面目前版本徽章屬呈現取捨（版本歷史仍完整）。
- 驗證：Playwright 截圖確認分割鈕下拉兩項、延遲彈窗選日發版、版本歷史列「待生效」；`check_ds_sync.py` 全 PASS。

## 2026-07-22 · 平台費率頁分頁順序＋新增例外按鈕層級（B 反饋導入）

- **【B】** 分頁順序改「費率設定／費率例外／版本歷史」——例外設定比歷史查閱常用，排在歷史前面（原為 設定／歷史／例外）。只調 `tabs` nav 按鈕順序，panel 由 `data-panel` 對應、DOM 不需動。
- **【B】** 「＋ 新增例外」由次要 ghost 小按鈕（`btn--ghost btn--sm`）改主按鈕（`btn--primary`）——新增例外是這個分頁的主要動作，用主按鈕層級。
- 驗證：`check_ds_sync.py` 全 PASS。

## 2026-07-22 · 平台費率頁 4 項視覺／互動修正（B 反饋導入）

使用者截圖反饋，針對前一項費率改動的呈現問題。

- **【B】** 費率樹費率欄對齊：`ds-components/table.css` 對 `.fee-tree__panel .ztor-table` 加 `table-layout:fixed`＋非首欄靠右——四個維度表（E-Shop／Events／Projects／IP）原本各自依左側標籤寬度自動排版，費率輸入框錯位；固定欄寬後對齊同一位置。**設定分頁預設樹與例外彈窗 clone 兩者都在 `.fee-tree__panel` 內、一起生效**（2026-07-22 先只修設定分頁，同日再補彈窗）。實測四維度輸入框 left 座標一致。
- **【B】** 例外彈窗搜尋改 `field-pill`（`partials/fee-exception-modal.js`＋頁面補 `field-pill.css` 連結）：與「創建 creator」搜尋一致（放大鏡 icon）；`admin-platform-fees.html` 的 `renderSuggest()` 改為空查詢不列任何選項（打字才篩），移除預設把全部 Creator 列在下方的行為。
- **【B】** 例外彈窗標題字級階層修正：Creator／支付手續費／平台費 三個區塊主標由 `field__label`（`--fs-12`）提到 `--fs-18` semibold，讓其大於樹內維度標題 `.ztor-accordion__trigger`（`--fs-16`）——原本子層 E-Shop 比主標還大。
- **【C】** 例外彈窗支付列移除「全站統一 · 唯讀」badge（`fees.exc.payment-locked`）：唯讀語意已由欄位 disabled 呈現，badge 冗餘。
- **【D】** `js/i18n.js`：`fees.exc.creator` 由「Creator」改「選擇創作者」（en `Select creator`）。
- **【D】** 例外彈窗 footer 釘底：`payout-modal.css` 加 `[data-fx-modal]`-scope 規則，dialog 改 flex 直列、只讓 `.payout-dialog__body` 內捲、head/foot 固定（費率樹展開後內容變長，取消／儲存例外原本會被推到內容下方隨捲；只 scope 費率例外彈窗，不動 earnings payout modal）。同輪修好彈窗內費率樹的活動／專案／IP 維度打不開（手風琴委派 handler 補認 `[data-fx-tree]`）。
- 驗證：Playwright 截圖確認四維度費率欄對齊、彈窗搜尋空狀態不列選項＋打字可篩、字級階層、badge 已移除；`check_ds_sync.py` 全 PASS。

## 2026-07-22 · 平台費率頁對齊 2026-07-17 確認費率＋三項規則呈現（A spec-derived）

費率於 2026-07-17 由 Susan/biz 確認，需求文件（`requirement/` CS/EN、`feature_description.md §Assumptions「Prototype deltas」`）已更新；原型 `admin-platform-fees.html` 落後，補齊其中 4 項（第 5 項 IP bank fee 上游 pending，本輪不動）。

- **【A】** 支付手續費由「單一 %」改為「% ＋ 每筆固定金額」：設定卡新增唯讀前綴 `HK$` 欄（`#fee-payment-fixed`，`amount-field--readonly`），值 3.4% ＋ HK$2.40；例外編輯彈窗（`partials/fee-exception-modal.js`）的支付列同步鏡射此固定金額（唯讀、全站統一，D141）。彈窗開啟時由 `open()` 取設定分頁的 `#fee-payment` 與 `#fee-payment-fixed` 值鏡射。
- **【A】** 預設費率樹初始值改用確認費率：E-Shop 各葉 5%、活動票券（onsite／online）5%、專案眾籌成功 5%、活動報名費 0%。需求未逐一點名的葉節點依「繼承上一層、無上層則保持原值」處理→專案的預購／實體回饋／數位回饋隨眾籌 5%；IP 維度 pending、無確認上層，保持原值（licensing 15%、royalty 10%、rental 10%）。`data-general`（繼承基準）同步更新。
- **【A】** 版本徽章延後切換：`addHistory()` 改為判斷生效日，生效日在未來時主徽章（`#fee-cur-version`）維持現行版本、新增副行 `#fee-next-note` 顯示「待生效：cfg-XXXX.XX · 日期起」、歷史列標「待生效」；到生效日（或生效日非未來）才把徽章切成新版本。
- **【A】** 移除費率例外也寫入版本歷史：例外清單的 remove 由「直接消失」改為同步 `addHistory()` 建新版本＋歷史列（金流規則變更須可稽核，與其他儲存一致）。
- **【D】** `js/i18n.js` 新增 `fees.version.next`／`fees.version.pending`／`fees.exc.removed`，並更新 `fees.payment.sub`（補「＋每筆固定金額」語意）。
- 依歸屬：以上為需求既有規則的呈現補齊，`site/` 未新增或改寫產品規則；費率數值與規則的權威在 `requirement/` 與 `documents/5.1.0.3`。
- 驗證：Playwright 逐頁截圖確認（支付欄、費率樹、例外彈窗鏡射、移除→歷史列待生效）；`check_ds_sync.py` 全 PASS。

## 2026-07-22 · 下拉選單依 Figma 調整校正三輪：分隔線、圓角、內距（B 反饋導入，Figma 比對）

使用者在 Figma 把先前匯出的下拉選單 capture（node 861:34177／861:34183）做了調整，回傳連結請依此修正，分三輪修：

- **【B】第一輪·分隔線顏色** `ds-components/dropdown-menu.css`：`.dropdown__item--toggle` 的 `border-bottom` 由 `var(--border-soft)` 改 `var(--border)`。深色模式下 `--border-soft`（`#202122`）跟面板底色 `--card`（`#212223`）只差 1 個色階，等於畫了一條幾乎看不見的線；`--border` 是 Q22 已經為同一個「深色 hairline 太淡看不出來」理由全站提亮過的 token（`#333435`），比另開新色階或動 `--border-soft`（全站多處消費、動了影響範圍太大）風險小。（此輪誤判面板陰影 spread 與選項間距差異是 html-to-design 轉換誤差、未跟進——第三輪證實其中內距那部分判斷錯了，見下。）
- **【B】第二輪·開關列圓角** 使用者截圖回饋「在商店上架」那個 frame 沒有圓角，同一規則加 `border-radius: 0`，覆蓋掉繼承自 `.dropdown__item` 的 `--radius-md`。回頭比對 Figma 原始碼發現：「編輯」「補貨」等一般動作項的 Menu Item frame 都個別掛了 6px 圓角 class，唯獨這個 toggle 用的 Button frame 沒有掛——即這一列 hover 高亮設計上就是直角，跟下面一般動作項的圓角 hover 不同。Playwright 灌強制 hover 樣式截圖確認：直角高亮框內縮於面板 6px padding 之內，不會被面板自己的 8px 圓角裁到，視覺乾淨。
- **【B】第三輪·面板／選項內距** 使用者再點名面板節點（861:34183）指出 padding 仍不對，重新比對確認第一輪的判斷有誤——這不是轉換誤差，是真的設計差異。`.dropdown__menu` 的水平 padding 拿掉（`padding: var(--sp-6) 0`，原本四邊都留 `var(--sp-6)`），改由 `.dropdown__item` 自己承擔水平內距（`--sp-10`→`--sp-16`）。效果：選項的 hover 高亮框頂到面板左右內緣、不再有 6px 的面板級留白溝，跟 Figma 的 Menu frame（`px-0 py-6`，選項自帶 `px-16`）一致。Playwright 截圖比對兩種狀態（開關列分隔線、一般選項 hover 底部圓角）確認跟 Figma 截圖視覺一致，且面板圓角不被選項的直角/圓角邊緣裁出鋸齒。
- **【D】** `design-system.md`／`.html` 同步 Class API、Sizes、Token usage 各處（三輪皆同步）。
- 驗證：Playwright 截圖比對深色模式下分隔線可見度、開關列 hover 直角、一般選項 hover 圓角是否被面板裁到；`check_ds_sync.py` 全 PASS。

## 2026-07-21 · 下拉選單去外框線＋開關列跟動作項加分隔線（B 反饋導入）

使用者接續前一項下拉選單改動再反饋：面板不要外框線；「在商店上架」開關列跟下面的一般動作項之間要有分隔線。

- **【B】** `ds-components/dropdown-menu.css`：`.dropdown__menu` 移除 `border: 1px solid var(--border)`——面板本來就有 `--shadow-float`，那顆 token 內建一圈 `0 0 0 1px` 的軟性描邊已經在畫邊緣，兩個疊在一起是重複畫兩次。
- **【B】** `.dropdown__item--toggle`（如 e-shop 的「在商店上架」）加 `border-bottom` + `margin-bottom`，跟後面的一般動作項分隔——切換狀態跟會跑導頁／JS 的動作是兩種語意，不該連在一起看不出界線。
- 過程中抓到一個 specificity 陷阱：選擇器一開始寫 `.dropdown__item--toggle`（單一 class），border-bottom 完全沒生效——因為這個變體的 markup 一律是 `<button>`，而 `button.dropdown__item { border: 0 }` 的 specificity（元素+class）比單一 class 高，會贏過它、把四邊 border 全部歸零。改成 `.dropdown__item.dropdown__item--toggle`（兩個 class 疊加）才穩定蓋過去。
- **【D】** `design-system.md`／`.html` 同步：Class API 新增 `.dropdown__item--toggle` 條目，Token usage 移除 border、順手修正一處早就跟實際 CSS 不同步的 `--shadow-card`→`--shadow-float`。
- 驗證：Playwright 量測 computed style 確認 `.dropdown__menu` 的 `border` 歸零、`--toggle` 的 `border-bottom` 確實是 `1px solid`；light/dark 兩種主題都截圖確認面板邊緣靠陰影仍讀得出來、分隔線清楚可見。`check_ds_sync.py` 全 PASS。

## 2026-07-21 · 全站下拉選單每個選項前面加對應 icon（B 反饋導入）

使用者指定：全站表單／列操作的下拉選單（`.dropdown__item`），每個選項前面都要有對應的 icon，唯一例外是「在商店上架」那種開關列（`.dropdown__item--toggle`）。

- **【B】** `ds-components/dropdown-menu.css`：`.dropdown__item` 由 `display:block` 改 `display:flex; align-items:center; gap:var(--sp-10)`，讓 icon 跟文字同一行對齊。icon 顏色不額外指定，直接吃 `currentColor`——一般項跟著 `--foreground`、`--danger` 項（如「刪除」）自動變紅，不用另外覆寫。`--toggle` 變體維持原樣不受影響（本來就是另一套 flex 版面）。
- **【B】** 全站 7 個消費頁逐一補上圖示，同一動作全站統一同一顆 icon：`e-shop.html`（Copy store link／Copy link → `copy`；Edit → `pencil`；Restock → `package`；Delete → `trash-2`；Track fulfilment → `truck`；Create new product → `plus`；Create bundle from products → `boxes`；Create auction → `gavel`）、`admin-ip-bank.html`（Edit → `pencil`；Delete → `trash-2`）、`events.html`（Edit → `pencil`；Duplicate → `copy`；Delete → `trash-2`）、`creators.html`（啟用/停用 toggle 改成依狀態動態切換 `check-circle`／`x-circle`——這顆不是 `--toggle` 變體、是一般動作項，仍要有 icon）、`pickup.html`（Open → `external-link`；Start scanning → `scan`；Copy URL → `copy`；Show QR code → `qr-code`；Edit session → `pencil`；Archive → `inbox`；Export → `download`）、`orders.html`（Copy order # → `copy`；Open order → `external-link`；View in Earnings → `banknote`，對齊側欄 nav.earnings 既有用的同一顆）、`pickup-detail.html`（Reverse redemption → `rotate-ccw`）。全部沿用既有 Tabler icon registry（`js/icons.js`），無新增 icon。
- **【D】** `design-system.html`／`.md` 同步：Dropdown menu 元件的 Anatomy／Do & Don't／Class API／Token usage／Code example／兩處 rendered demo 全部補上 icon 範例與規則說明。
- 驗證：`check_ds_sync.py` 全 PASS；Playwright 檢查 e-shop.html／orders.html 的選單展開狀態，確認每個非 toggle 選項都出現對應 icon、「在商店上架」維持無 icon。

## 2026-07-21 · 上架設定移到右側常駐欄（B 反饋導入）

- **【B】** `product-detail.html`：「上架設定」整張卡自「定價與庫存」分頁移入 `.detail-rail`，排在右欄第一張。上架與否是商品的最高層級狀態，塞在定價庫存分頁裡等於暗示它只跟定價庫存有關；放右欄後，編輯任何分頁時都看得到並能隨手改。
- **【D】** 這是右欄第一次放可互動的卡（原定義只放唯讀狀態卡），已記為 STYLE-DECISIONS **Q25** 並落地：右欄放寬為「唯讀狀態卡 ＋ 跨分頁層級的可互動設定」兩類，判準是這個設定管的是整個商品、不隸屬任何分頁；隸屬單一分頁的欄位仍留在該分頁，右欄不做成第二個表單。`detail-rail.css` 的元件說明同步更新。
- **已知的取捨**：右欄在「定價與庫存」分頁是收起的（同日的 `.detail-grid--full`），所以在該分頁看不到上架設定。判斷可接受——調價格庫存與決定上架時機是兩件事，且其餘三個分頁都看得到。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-21 · 商品明細右欄在定價與庫存分頁撤除、補貨紀錄改欄位表（B 反饋導入）

延續同日的庫存區重整。右欄「當前庫存」與主欄「庫存」卡講的是同一件事，使用者裁決把右欄在該分頁整個撤掉、資訊往主欄合。

- **【C】** 右欄「當前庫存」整張卡撤除；「定價與庫存」分頁掛新的 `.detail-grid--full`，整個右欄收起、主欄吃滿頁寬（逐選項組合表因此拿得到完整寬度）。其餘分頁的右欄不受影響，仍常駐「交付與取貨」與「使用中」兩張卡。
- **【B】** 主欄「庫存」卡改名「當前庫存」，並吸收右欄原有的四樣：量條（限量版才出現）、多選項的總計與選項組合數（排在表格上方）、庫存版本唯讀一行、補貨按鈕（排在卡片最後、緊接補貨紀錄卡）。狀態徽章沒有跟著移——頁首已經有一顆商品狀態徽章，移過來會變成同一頁講兩次。
- **【B】** 補貨紀錄由 `.data-list`（一行標題＋一行 meta 的句子式）改為新元件 `.restock-log` 的欄位表：選項組合／補貨數量／日期／供應商／狀態各自成欄。理由是補貨紀錄要被互相比對（這批比上批多幾件、距上次多久），欄位對齊才掃得動。
- **【B】** `.restock-log--with-option` 只在多選項商品掛上，單選項商品「選項組合」欄含表頭整欄退場。
- **【D】** 新元件 `ds-components/restock-log.css`；`detail-rail.css` 新增 `.detail-grid--full` modifier；`logRow()` 改吐新的列結構並插在表頭之後，`markReceived()` 的選擇器同步。
- **【D】** i18n 新增 5 個欄位名 key（`restock.col.option` / `qty` / `date` / `supplier` / `status`）。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證仍待補**——Playwright 全程被佔用，四種組合與分頁切換時右欄收合的實際行為尚未確認。

## 2026-07-21 · 低庫存門檻改存百分比（B 反饋導入）

使用者裁決「存 %」：低庫存門檻的輸入與儲存值由件數改為「佔庫存上限的百分比」。原本兩頁的說明文字都在講 10%，實際填的卻是算好的件數，心智模型與畫面不一致。

- **【B】** `create-product.html` 與 `product-detail.html` 的自訂門檻欄改用 `.amount-field--suffix`（右側 % 單位），預設 10，範圍 0–100。
- **【B】** 兩頁都在提示行即時換算成件數（`≈ 5 件`），基準為限量的總量上限、不限量則沿用目前在庫（UIA-042 既有缺口）。百分比是存的值，件數只是輔助理解。
- **【B】** 商品明細 Phase 1（S31.1 未納入版本）改成唯讀顯示「10 %」，取代原本唯讀顯示算好的件數。
- **【D】** i18n：`product-detail.threshold.custom.hint` 與 `cp.lowstock.custom.hint` 兩句改講百分比；新增 `cp.unit.pcs`。
- **屬資料模型變更**，已記入 ASSUMPTIONS **UIA-070**，未寫回 `documents/`——庫存上限變動時，存 % 的門檻件數會跟著浮動，存件數則不會。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（Playwright 被佔用）。

## 2026-07-21 · 商品明細庫存區重整為三張卡、庫存改唯讀（B 反饋導入）

使用者要求收斂商品明細「定價與庫存」分頁的庫存相關功能。原本散在兩張卡：「商品選項」卡放逐選項組合表（含庫存欄），「庫存與補貨」卡放庫存數字、低庫存門檻、鎖住的庫存版本切換器、補貨紀錄。問題有三個——同一個庫存數字有「直接改欄位」與「走補貨流程」兩條改法（只有後者留紀錄）；庫存版本是建立後不可改的資訊卻長得像可以切換；補貨紀錄是歷史卻混在設定欄位裡。

- **【B】** 分頁只保留一張逐選項組合表，位置移到「庫存」卡內。原本上方獨立的「商品選項」卡整個撤除——多選項商品的庫存本來就住在那張表裡，拆兩處會把同一張表的欄位切開（使用者裁決：三個落地選項中選「只留一張表」）。
- **【B】** 庫存區改為三張卡，單選項與多選項共用同一套分層：**庫存**（單選項＝唯讀讀數，限量再加總量上限欄；多選項＝逐選項組合表）／**低庫存提醒設定**（只有門檻）／**補貨紀錄**（獨立成卡）。
- **【B】** 庫存數字一律唯讀，改變數量只能透過右欄「補貨」。單選項用新元件 `.stock-readout`（顯示字級數字＋單位／分母＋狀態徽章）取代 `.input`；多選項的表格庫存欄用新增的 `.variant-cell--stock`（低於門檻時 `--stock-low` 轉紅）取代 `.input`。**這一條牴觸規格 §2.10，已記入 ASSUMPTIONS UIA-069，未寫回 `documents/`。**
- **【C】** 撤除鎖住的「庫存版本」segmented（D137 建立後不可編輯），當前值改由右欄以唯讀一行呈現；一併撤除限量版重複的「現貨」欄（與庫存數字同義）。
- **【B】** 右欄「當前庫存」卡改為依規格模式與庫存版本分流：量條只在限量版出現（不限量沒有分母、畫不出比例）；單選項顯示庫存數字，多選項改顯示總計與選項組合數；新增狀態與庫存版本兩列。
- **【B】** 價格卡加 `data-when-var="single"`：多選項的定價與成本逐列填在表裡，再另開一個單一價格欄會出現兩個互相矛盾的答案。
- **【D】** 新元件 `ds-components/stock-readout.css`（DS 兩份文件由並行 session 補齊，見同日「補完 Stock readout 的 DS 三件套」）；`variant-builder.css` 新增 `.variant-cell--stock` / `--stock-low`；`applyVis()` 接管逐選項組合表的 `--limited` 欄位開關與「主分類＋規格模式」雙條件顯隱（原本兩支函式各自設 `hidden`、會互相覆寫）。
- **【D】** i18n 新增 11 個 key（`product-detail.stock2.sub-multi` / `stock.unit` / `stock.readonly` / `cap.hint` / `var.stock-readonly` / `threshold.title` / `threshold.sub` / `threshold.multi` / `rail.total` / `rail.variants` / `rail.status`），中文一律用「選項組合」對齊 UIA-067 的術語更名。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**——本機 Playwright 全程被佔用，四種組合（單／多選項 × 不限量／限量）的實際版面尚未逐一確認。獨立預覽檔 `docs/庫存區收斂-四種組合-預覽.html` 為落地前的討論稿。

## 2026-07-21 · 白天版工作列＋低庫存通知改白底陰影；商品列表 hover/drag 浮起去 rim（B 反饋導入）

使用者兩張截圖分別指出：（1）白天版的工作列（類型 tab＋動作群）與低庫存通知條要用白色＋陰影；（2）商品列表 hover 時不要 border。

- **【B】** `e-shop.html`：新增 `html[data-theme="light"] .eshop-list-topbar` 與 `html[data-theme="light"] .eshop-stock-bar__card` 覆寫，背景由 `--surface-shell`（淺灰）改 `--card`（白），陰影由無/none 改 `--shadow-card`（E2 resting card 階，token 註解本來就把「sticky 工作列」列為此階用途）。**只在白天生效**——深色 `--surface-shell` 本身就明顯亮於 `--surface-page`，色差已經夠分區，不需要改色加陰影。
- **【B】** `ds-components/_tokens.css`：新增 `--shadow-lift-flat` token（亮 = `--shadow-float` 去掉內建的 `0 0 0 1px` rim 那層；暗 = 與 `--shadow-float` 相同）。根因：`--shadow-float` 的 rim 是特意畫來在浮層疊在任意底色上時補輪廓用的（見 design-system.md 的陰影 Pattern 說明），但商品列表 hover/drag 浮起的卡背景就是 `--card` 白、跟頁面背景色差已經夠明顯，rim 反而被誤讀成一圈邊框——這正是使用者反饋的「border」。深色不受影響：深底陰影本身讀不太出來，rim 是唯一可靠的浮起提示，拿掉會讓浮起變不可見。
- **【B】** `ds-components/product-list.css`：`.product-list--eshop`／`.product-list--ip` 的 `.product-list__row:hover` 與 `.product-list__row.is-dragging` 都改用 `--shadow-lift-flat`（原本兩者皆為 `--shadow-float`）——hover 跟 drag 維持同一套視覺，不因為這次修正而分岔。
- 驗證：Playwright 分別在 light/dark 主題下量測 computed style，確認白天工作列／低庫存條背景與陰影正確切換、hover 列 `box-shadow` 不含 rim 分量且 `border-bottom-color` 透明；深色模式下三者維持原樣（`--surface-shell` 底、`--shadow-float` 含 rim）未受影響。`check_ds_sync.py` 全 PASS，`design-system.md`／`.html` 的陰影階梯表、product-list 行為表已同步新 token。

## 2026-07-21 · 電子商店工作列＋狀態列捲動時整塊固定（B 反饋導入）

使用者截圖指出：捲動到工作列（類型 tab＋動作群）與狀態篩選列這個位置時，這兩排要固定在頂端、下方商品清單繼續捲動。原本只有狀態列掛了 `position:sticky`，工作列本身沒有；而且實測發現狀態列自己也沒有真的黏住——捲超過約 120px 後兩者一起脫黏跟著清單捲走。

- **【B】** 根因：`position:sticky` 的可黏貼範圍受限於元素自己的親層 box 高度，親層多高就只能黏多久。工作列＋狀態列原本被關在一個只包這兩排、高約 120px 的窄 `<section class="eshop-list-controls">` 裡，一旦捲動距離超過這個高度，兩者就會脫黏。
- **【B】** `e-shop.html`：把 `.eshop-list-controls` 從只包工作列＋狀態列的 `<section>`，改成往下併吞三個 product-list 分頁（Products／Bundles／Auctions）＋ list-footer ＋ 查無符合／帳號無資料卡的 `<div>`，讓親層 box 跟整張清單一樣高，工作列＋狀態列才能在清單捲動全程保持貼頂。原本掛在外層的 `aria-label="Main list filters"` 隨舊 `<section>` 一併移除，改由內層每個 product-list panel 自帶的 `role="table" aria-label` 承擔語意。
- **【B】** `.eshop-list-topbar` 新增 `position:sticky; top:0`（桌機 ≥901px），與既有 `.eshop-status-row` 的 sticky 疊接；狀態列 top 位移改為 74px（工作列高 58px ＋ 兩者相鄰 margin 摺疊後的 16px 間距，不是原本誤算的 8px）。狀態列↔清單原本 24px 的視覺間距，因外層 margin-bottom 隨併層失效，改移到 `.eshop-status-row` 自己的 margin-bottom，數字不變。
- 驗證：Playwright 量測桌機（1512px）捲動 0/300/600/900/1200px，工作列＋狀態列全程貼在同一位置（top 16px／90px）、清單持續往上捲；窄螢幕（≤900px，未啟用 sticky）行為不受影響。check_ds_sync 全 PASS。

## 2026-07-21 · Icon 按鈕字符 16px → 20px（B 反饋導入）

使用者看電子商店工具列（搜尋／商店設定／預覽）反映「這幾個 icon 要稍微大一點」。判斷是元件層問題而非單頁問題：那三顆是 `.btn--icon.btn--sm`，吃的是 `button.css` 的全站通則，同樣的偏小情形在其他 11 頁一樣存在。與使用者確認後採全站一起調，不做單頁特例。

- **【B】** `ds-components/button.css`：`.btn--icon .ztor-icon` 與 `.btn--icon-circle .ztor-icon` 由 16px 改為 **20px**（語意階梯的 `--md`，不新增體系外數值）。32px 框內填充率 50% → 62.5%，36px 框內 44% → 56%。
- **【B】** 一併移除 `.btn--icon.btn--xs .ztor-icon` 那條 16px 覆寫。它原本與基準同值、屬無作用規則；基準上調後若留著，會讓 `--xs` 與 `--sm`（兩者框都是 32×32）出現兩種字符大小。移除後統一吃基準。
- **牽動範圍**：`.btn--icon.btn--sm` 36 處／12 頁、`.btn--icon.btn--xs` 74 處／9 頁、`.btn--icon-circle` 14 處／1 頁、單獨 `.btn--icon` 19 處／2 頁，合計約 143 顆按鈕。全部走元件層一次改完，無頁面級覆寫。
- **【B】** DS 文件同步：`design-system.md` §4.9 Sizes 與 `design-system.html` 的 `.ztor-icon` 尺寸矩陣說明，原本明寫「icon buttons 維持 16px 基準字符」，已改為 20px `--md` 並註明調整原因。
- 驗證：check_ds_sync 全 PASS。**瀏覽器目視驗證待補**（本機 Playwright 被佔用），143 顆按鈕的實際觀感尚未逐頁確認。


## 2026-07-21 · `.ztor-btn` 按鈕家族退場，`.btn` 成為唯一按鈕（C 撤除，STYLE-DECISIONS Q26）

承 Q25 的高度盤點：使用者問「按鈕應該有不同尺寸對嗎？」——是，而且 `.btn` 本來就做對了（`--sm` 28／預設 36／`--lg` 44，全整數全在刻度上）。**問題不在尺寸，在兩套並存**：`.ztor-btn` 預設 44px 被標成「文件用 canonical 按鈕」，`.btn` 預設 36px 卻是 236+ 處真實頁面在用的。使用者檢視元件的唯一入口是 `design-system.html`，那裡把 44 當預設，與出貨結果不符。

- **【C】** `ds-components/button.css`：`.ztor-btn` / `--outline` / `--xs` / `--sm` / `--lg` / `--xl` 全部規則清空，改為墓碑註解（記錄替代方案與退場理由）。**退場成本近乎零**——清點時全站已無任何 markup 消費它，只剩 `design-system.html` 一行 class API 說明，DS 頁的按鈕 demo 早就用 `.btn`。比照 2026-07-10 `.ztor-input` 替身退場的前例。
- **【D】** `design-system.html` 移除該 class API 列；`design-system.md` 的 Variants／Sizes／States／Class API 四處敘述改寫，不再描述「雙命名空間」。`button.css` 內兩段仍在講舊架構的註解一併更正。
- **【D】** **副作用要記住**：`--control-h-lg`(52) 與 `--control-h-xl`(60) 的唯一消費者就是 `.ztor-btn--lg/--xl`，退場後兩階變成零消費。**沒有刪 token**，在 `design-system.md` 標為「待採用」——刻度的完整性比消掉一個零消費警告重要，日後真要 52/60 時不必重新發明。

## 2026-07-21 · 單行輸入控件高度統一成 36px、改吃 token（B 反饋導入，STYLE-DECISIONS Q25）

使用者問「r2.1 的 input 框有幾種高度」，派 `ui-audit` 全庫盤點後答案是 **6 種**：39（`.input` 基準）／44（field-pill、tag-input）／41.5（picker 搜尋）／37.5（側欄搜尋）／35.5（頂欄搜尋）／32（規格表格）。使用者裁示「統一元件、不要有小數點」，並在三選一中選 36（跟按鈕等高）。報告：`docs/input高度盤點-2026-07-21.md`。

- **【B】** **根因是做法、不是數值**：舊 `.input` 靠 `padding 9×2 + font-size 14 × line-height 1.5` 撐開＝39px。只要高度是 padding 撐的，`padding×2 + font-size×line-height` 幾乎必然算出小數，各元件再各自調 padding 就長出那三個對不齊的搜尋框。所以裁決連做法一起改：**單行控件一律 `height: var(--control-h-sm)`，禁止用 padding 湊高度**。只調數值是治標。
- **【B】** 改動檔：`input.css`（`.input`/`.select` 固定 36、`--input-pad-y` 歸零；`.textarea` 明確 `height:auto` 維持多行撐開）、`field-pill.css`／`tag-input.css`（44→36）、`picker.css`（41.5→36）、`shared.css` 的 `.app-sidebar__action`（37.5→36，側欄搜尋與導覽列共用這條、一起齊平）、`header.css` 的頂欄搜尋（35.5→36）、`variant-builder.css` 表格欄位（32→`--control-h-xs` 28，維持比一般欄位矮一階但落在刻度上）。
- **【B】** **為什麼是 36 不是 44**：`.btn` 就是 36，工具列裡搜尋框與按鈕必須齊平——那三個歪掉的搜尋框正是沒對齊按鈕造成的；`_tokens.css` 原本就宣稱「同尺寸的 input 與 button 等高」，選 36 讓這句由空話變事實；本站 token 命名對齊 shadcn，而 shadcn 的 input 與 button 同為 `h-9`＝36。
- **【D】** `_tokens.css` 的 `--control-h-*` 註解改寫：標明**實際預設是 sm(36) 而非標為 default 的 md(44)**，並寫上「新增控件一律從這裡取高度、不要用 padding 湊」。`design-system.md`／`design-system.html` 的控件尺寸段同步（含把 ★ 預設標記從 44 移到 36）。
- **【B】追加（使用者：「都改為整數」）**：側欄導覽列一併吃 token——`.app-sidebar__link` 34.8→36、`.app-sidebar__sub-link` 33.6→36（後者 `display:block`→`flex`＋`align-items:center`，鎖高後 block 文字會貼頂）。整條側欄現在單一列高。**逐一檢查後刻意不動**：`.app-notif__item`（多行通知）、`.app-notif__foot`、`.duration-chip`（內含第二行價格）——高度本該隨內容變，鎖高是錯的。
- **待使用者目視**：一般欄位矮 3px、**field-pill 與 tag-input 矮 8px（較有感）**。另 `.amount-field--hero` 的 70px 是既有的刻度外例外（CSS 註解自承），本輪不動。
- **本輪未處理、另案**：`<select>` 之外的 checkbox／radio 等非文字控件未納入盤點；`.ztor-btn`（DS 展示用按鈕）預設仍是 44、與產品頁的 `.btn`(36) 是兩套，屬既有分岔。

## 2026-07-21 · 物流配送的尺寸／寄件地改選填（A 規格對齊，規格與 UI 一起改）

使用者裁示「取貨方式／物流配送的尺寸、寄件地、出貨分類都改為選填，規格書也改」。出貨分類原本就是選填，實際變更的是尺寸與寄件地兩欄。**這是必填規則變更＝產品決策**，所以先改上游規格再改 UI，記 D148。

- **【A】** `documents/5.1.5.2` §4.1⑥：尺寸與寄件地移除 ＊，四欄只剩重量必填（改前原文存 `backup_plan.md` Plan212）。§4.6 就緒檢查由「需重量與尺寸與寄件地齊備」改為「需重量齊備」。
- **【C】** 連帶移除 D145 的第二個收合硬條件（「就緒檢查因尺寸或寄件地未填而不通過時，收合區必須展開或指出缺漏」）。那條是為了保護被收合的必填欄；唯一必填只剩常駐的重量後就沒有保護對象了。**第一個條件保留**（收合區內有值即預設展開）——它保護的是編輯既有商品時不藏已填資料，與必填無關。
- **【A】** `create-product.html`：移除尺寸／寄件地的 `.field__req`；`shippingOk()` 由「重量＋寄件地＋三個尺寸全填」改成只檢查重量；就緒清單那一項的文字由 `Shipping weight, size & origin` 改成 `Shipping weight`（不改會變成勾選條件與敘述不符）。順手移除因此失去消費者的 `fShipPickup` 常數。
- **【A】** `product-detail.html`：同步移除兩個 `.field__req`（同一組欄位的編輯頁）。
- 已確認不需改：`documents/5.1.5.1` §2 取貨方式那行只列舉欄位名稱、不帶 ＊ 標記。

## 2026-07-21 · 補完 Stock readout 的 DS 三件套（D infra）

**這支元件不是本 session 建的**——`ds-components/stock-readout.css` 與 `product-detail.html` 的用法由另一個並行 session 加入（同日 16:38），但只做了 CSS ＋ 產品頁，沒接上 `design-system.html`，觸發 check_ds_sync 的 1／2／4 三條 FAIL（缺 `<link>`、產品頁有 DS 頁沒有、主 class 無 demo）。收尾守門員擋住，故由本 session 補完，內容一律依 CSS 檔頭註解與 product-detail 的實際用法還原，未新增或改變任何行為。

- **【D】** `design-system.html`：補 `<link>`、TOC 項、元件總表列、§4.87 元件卡（含兩個情境 demo：一般＋限量分母、Do &amp; Don't、規格表）。
- **【D】** `design-system.md`：補元件總表列與 §4.54 條目。
- 記錄兩個設計判斷（來自原作者的 CSS 註解，非本 session 決定）：庫存做成唯讀讀數而非 `.input`，因為庫存只能靠補貨增加、每筆留紀錄，做成輸入框等於暗示一個不存在的能力；不用 `.kpi` 因為那是儀表列的有框方塊，這個是表單卡內的一行。

## 2026-07-21 · 「顯示更多」改成滿寬線框按鈕（B 反饋導入）

使用者指示取貨方式的「顯示更多」要用 fill-width 的線框按鈕（原為靠左的無框文字鈕）。

- **【B】** markup 掛上 `.btn.btn--outline`，`field-more.css` 只留 `width:100%` ＋ `justify-content:center`——**外觀一律重用 Button atom，不自己刻一顆長得像 outline 的按鈕**，否則 Button 的邊框／圓角／hover 日後改了這裡不會跟著動。原本 `.field-more__toggle` 自帶的 background／border／font／color／hover／focus-visible 全部刪除。
- **【B】** 三個 consumer 一起改：`create-product.html`（取貨方式）、`product-detail.html`（同一組欄位的編輯頁）、`design-system.html`（demo 卡）。改共用元件必須全庫 grep 同步所有使用頁，只改單頁會讓兩頁分岔。
- **【B】** 連帶補間距（使用者回報「都黏在一起」）：`.field-more` 原本沒有下外距——上方的 16px 是前一個 `.field` 的 `margin-bottom` 給的，自己不出力，所以後面的元素（取貨方式的 `info-banner`）直接貼上來。文字鈕時代看不太出來，變成滿寬實心方塊後就讀成擠成一團。補 `margin-bottom: var(--sp-16)` 吃 `.field` 同一套節奏，並用 `:last-child` 歸零，避免商品明細那種「收在區塊尾端」的情形多出尾巴。
- **【D】** `design-system.md` ＋ `design-system.html` 的 Field more 條目同步改敘述與 anatomy。

## 2026-07-21 · 多選項編輯器改版：逐值 input、列去填色改邊框（B 反饋導入）

使用者提供設計圖要求改多選項的選項編輯器。兩個關鍵取捨由使用者拍板：**值改成逐值一個 input**（取消 chip 膠囊）、**列一律透明、新增鈕用虛線**。後者正好讓同日確立的 Q24「L3 改邊框」第一次有真實消費者——這些列坐在 nest（L2）裡就是第三層。

- **【B】** `create-product.html` `renderOptions()`：編輯態改成「選項名稱 *」「選項值 *」兩個 `.field`，值為逐值 `.input`（`__value` > `.input` ＋ `__value-remove`），底部虛線 `__add-value` 再長一列（Enter 亦可），最下方 `__actions` 靠右放「刪除」＋「儲存」。原本 head 右上的 X 移除鈕與左下的「完成」鈕退場。**為什麼放棄 chip**：設定選項時最常做的是改一個字，chip 模式得先刪掉再重打。
- **【B】** `ds-components/variant-builder.css`：`.option-set__row`／`.variant-option` 由 `--input-surface` 填色改 `transparent` ＋ 1px 實線 `--border`（Q24 的 L3 規則落地）；`.option-set__add` 與新的 `.variant-option__add-value` 改 1px **虛線** `--border`。虛線不是新語彙——upload-tile、payout-modal 早就用它表達「這裡還沒有東西、按了會長出來」。新增 `__value`／`__value-remove`／`__actions`，退場 `__head`／`__remove`／`__entry`／`__add`。`.variant-option .field` 明確 `margin-bottom:0`，否則 `.field` 自帶的 16 會與容器 gap 10 疊成 26、比設計圖鬆散。
- **【B】** 打字時的重繪紀律：值 input 的 `input` 事件**只寫回資料 ＋ 重繪逐規格表**（新切 `syncVariantsOnly()`），刻意不呼叫含 `renderOptions()` 的 `regenVariants()`——那會整層重建 DOM、每敲一鍵游標就跳掉。整組 `.option-set` 只在新增／刪除值這種離散事件才重繪。沿用 `data-opt-name` 既有的保焦點手法。
- **【B】** `currentCombos()` 與收合列摘要一律過濾空字串值：逐值 input 模式下「新增了一列但還沒填字」是常態，不濾會生出「S / 」空組合污染逐規格表、摘要則會顯示「S、、M」。
- **【C】** `js/i18n.js`：`cp.var.opt.done` 移除（唯一消費者已改用 `cp.var.opt.save`）；新增 `cp.var.opt.save`／`.delete`／`.name.label`／`.value.label`／`.add-value`。
- **刻意沒做**：設計圖的「刪除」是紅底填色，但 Button 元件契約明寫「破壞性只綁 ghost，避免做出紅色實心鈕」。提報使用者後裁示**尊重舊規則**，改用現成的 `.btn--ghost.btn--destructive`，不新增變體、不動既有裁決。
- **【D】** 連帶的文件校正（收尾驗收抓到）：`design-system.md`／`.html` 的 Chip 元件 class API 原本把 `.chip--value` 與 `.chip--removable` 的用途寫成「多選項的選項值」，改版後已不成立，兩份都改掉。同時退場兩段死 CSS：`.variant-option__entry`（舊的「打字按 Enter」輸入列）與 `.variant-option__add::placeholder`（更舊的無框 input 殘留），已無任何 markup 消費。
- **⚠ `.chip--value` 變成零消費，待裁決**：這個變體是同日稍早才為「輸入後的標籤不要用白的」而建的（灰底＋一般內文色，參照 Webflow），唯一消費者就是選項值；本輪改成逐值 input 後它失去用途，目前只剩 DS 頁 demo。**未擅自移除**——退場屬治理動作、要使用者確認，已在兩份 DS 文件標記為退場候選。
- **已知限制（沿用既有，非本輪引入）**：`varData` 以「值字串組合」當 key，就地改值會讓已填價格庫存的舊 key 變孤兒。改字每次都會換 key 是新模型帶來的放大效果；根治要把 key 換成穩定 id，屬架構級改動，本輪不處理。

## 2026-07-21 · 新增 Nest 巢狀層元件，確立「兩層填色、L3+ 改邊框」的層級規則（B 反饋導入）

使用者要求把商品選項切到「多選項」後出現的建構器，做成「疊上去的一層」（Figma 856:27798）。動手前先量測發現真正的問題：巢狀層與其中的 input 在現有絕對色模型下算出**完全同色** `rgb(38,39,41)`——填色階梯已經用完，再往上加一階就得動 foundation。與使用者在探索頁 `docs/層級系統-半透明疊加-探索.html` 逐輪確認後裁決（STYLE-DECISIONS **Q24**）：填色上限壓在兩層，所以**既有 token 零修改**，只新增兩個。

- **【B】** `ds-components/nest.css`（新元件）：`.nest` 以負 margin 抵銷母卡 `--sp-16` 內距，左／右／下三邊切齊母卡外緣，`border-radius` 取與母卡同值的 `--radius-xl`，靠 `--shadow-nest-up` 的向上投影從卡面浮起。附帶 `.form-section--outlined:has(> .nest) { overflow: hidden; }`——**這條是必要的**，`--shadow-nest-up` 只有垂直位移，8px 模糊會往左右擴散到母卡圓角外、漏到頁面底色上；用 `:has()` 只裁真的含 nest 的卡，其餘 form-section 不受影響。
- **【B】** `ds-components/_tokens.css`：新增 `--nest-surface`（亮 `transparent`／深 `rgba(222,223,233,.04)`）與 `--shadow-nest-up`（亮 `0 -6px 8px rgba(0,0,0,.05)`／深 `0 -8px 8px rgba(0,0,0,.08)`）。深色刻意用**冷調淺灰而非純白**：純白疊加會把 midnight 畫布的冷調洗掉（B−R 由 +2 掉到 +0.8），這個 tint 反而推到 +3.0、與畫布同溫；Figma 獨立算出的也是同一個值（856:27796）。亮色兩層都是白，單靠陰影分層。
- **【B】** `create-product.html`：`#cp-var-builder` 加上 `.nest`（唯一消費者，多選項模式才顯示）。
- **【D】** 文件：`design-system.md` §4.53 ＋ 元件表 ＋ role token 表 ＋ 陰影 token 表；`design-system.html` §4.86 元件卡 ＋ TOC ＋ 色票 ＋ 邊緣工具列。兩份都寫明**與 `.card--muted` 的分工**（同為「卡中卡」的兩種做法，不寫清楚就是同角色第二種答案）：`.card--muted` ＝ 保留母卡內距的靜態子區塊，`.nest` ＝ 貼齊底緣的另一個平面。
- **刻意不做的兩件事**：(1) **L3 邊框規則只寫進文件、不出 CSS**——站上目前沒有三層巢狀的用例，寫了就是沒驗證過的死碼，真的出現時再補。(2) **不順帶結案 Q23**——那題問的是全站「邊框 vs 陰影」判準，與本次的填色分層是不同問題，裁決權在使用者。
- 亮色版的 `0 -6px 8px rgba(0,0,0,.05)` 是補的初稿（Figma 只給了深色值），待使用者目視確認。

## 2026-07-21 · Icon 圖庫由 Lucide 全面換成 Tabler（D infra）

使用者指示「全部換成 Tabler」。改法選擇「只換皮、不換名」：registry 的 key 一律沿用換庫前的舊名（`trash-2`、`more-horizontal`、`check-circle`…），`data-lucide` 屬性名也不動，只把 key 底下的 SVG 內容換成 Tabler 的。因此 **39 頁、2,630 處 icon 引用一行都沒改**，風險集中在單一檔案而不是散在全站。兩套圖庫同為 24×24 網格、2px 線條基準，幾何相容，`applyIcons()` 注入的 1.2px stroke 維持不變。

- **【D】** `js/icons.js`：registry 全數換成 Tabler SVG（來源 `@tabler/icons` 3.45.0）。71 顆同名直接對上、40 顆需名稱對照（`trash-2`→`trash`、`more-horizontal`→`dots`、`sliders-horizontal`→`adjustments-horizontal`、`party-popper`→`confetti`…完整對照表已落在 `design-system.md` §1.7 與 `design-system.html` §1.7 的可展開表格）。4 顆實心變體（`alert-triangle-fill`／`check-circle-fill`／`x-circle-fill`／`info-fill`）原本是手刻的 heroicons-style solid，改用 Tabler 原生 filled，風格終於跟 outline 同源。每行的中文用途註解全部保留。
- **【D】** `js/icons-all.js`：Lucide 全集 1,713 顆 → Tabler 全集 6,166 顆（outline 5,112＋filled 1,054，filled 以 `<name>-fill` 命名，沿用 registry 既有慣例）。檔案 365KB → 1.7MB，但**只有 `design-system.html` 載**，產品頁不受影響。
- **【D】** `design-system.html` icon 圖庫改成**執行期懶生成**：原本是寫死的 1,683 格 Lucide markup（176KB），換庫後那些名稱多半在 Tabler 不存在、會整片空白。改成展開時才依 `window.ZTOR_ICONS_ALL` 實際內容建格子，並自動排除頁面上已使用的名稱。副作用是 `design-system.html` 從 1.0MB 縮到 864KB，且以後再換圖庫或增刪 icon 都不用重生 markup。
- **【D】** 文件同步：`design-system.md`（§1.7 Iconography、§4.9 Icon、Pillar 0/6 摘要表）、`design-system.html`（雙語對照，新增「換庫對照表」可展開區塊與「key 沿用舊名」的取捨說明）、`BUILD-SPEC.md`、`js/sidebar.js` 與 5 支 `ds-components/*.css` 的註解，全部從 Lucide 改為 Tabler。`UI-CHANGES-archive.md` 與 `docs/` 底下的歷史紀錄**刻意不動**——那些描述的是當時的事實。
- **順手補的三個既有缺鍵**：`badge-check`（交易列表「IP 授權金」，`js/components.js:212` 動態帶入）、`dollar-sign`（DS 頁金額輸入前綴示範）、`bar-chart-3`（Admin 側欄 IP Bank Reporting，`js/sidebar.js:36`）**在換庫之前就不在 registry 裡**、一直渲染成空白，這輪一併補上（對應 Tabler 的 `rosette-discount-check`、`currency-dollar`、`chart-bar`）。屬既有缺陷，非本次換庫造成。
- **刻意留下的技術債**：`data-lucide` 屬性名現在名不副實。正名成 `data-icon` 要動 2,630 處，跟換圖庫綁在一起會讓出事時無法二分定位，因此拆成獨立的一次性機械改名，另案處理。
- 驗證：`node --check` 過兩支 JS；程式比對產品頁 79 個 icon 名＋JS 動態注入 15 個名稱對 registry 缺鍵數＝0；Playwright 起 http 逐頁截圖比對並讀 console 攔 `[icons.js] Unknown icon` 警告；check_ds_sync 全 PASS。

## 2026-07-21 · 電子商店商品狀態顯示文案改版（A 規格對齊，規格與 UI 一起改）

使用者指示「全站狀態調整（規格一起改）」：全部狀態→全部商品、草稿→未完成、庫存過低→急需補貨、上架中→販售中。這是呈現文案調整，不是狀態機改名——`documents/5.1.5-電子商店.md` §7.2 對齊的內部狀態概念（Draft／Live／Low Stock）維持不變，只換使用者看到的中文字。

- **【A】** `documents/5.1.5-電子商店.md` §2 狀態徽章行同步改字（先於 `documents/backup_plan.md` 記 Plan211 存底稿），F3 狀態篩選選項集列舉行（純英文內部狀態名）不受影響、維持原樣。
- **【A】** `js/i18n.js` 8 個 key 同步中英文顯示值：`e-shop.status.all/in/low/draft`（Products／Bundles／Auctions 三分頁共用的篩選 tab，全部商品／販售中／急需補貨／未完成）、`e-shop.row.active/low`（清單列狀態徽章）、`product-detail.badge.live/low2`（商品細節頁狀態徽章）。英文對應（All products／Selling／Needs restock／Incomplete）為本輪 project-ui-creator 譯法決定，規格條目本身未指定英文字詞。
- **牽動範圍確認**：`e-shop.status.all/in/draft` 三個 key 是 Products／Bundles／Auctions 三分頁篩選 tab 共用（既有架構、非本次新增），改字後三分頁一併套用；「已售完」（Sold Out）與拍賣分頁自己的「競標中」等詞彙未受影響、使用者未要求變動。訂單管理的「全部狀態」（`orders.status.all`，語意是訂單狀態非商品狀態）、我的IP／專案／活動的「草稿」（不同領域語意）皆為不同 key、確認不受影響。
- 驗證：Playwright 讀出 Products／Bundles／Auctions 三分頁篩選 tab 文字與商品列狀態徽章文字，逐一核對「全部商品／販售中／急需補貨／已售完／未完成」；product-detail.html 狀態徽章同步核對「販售中」；check_ds_sync 全 PASS；`Skills/design-spec-writer/scripts/validate_spec.py` 確認規格結構未破壞。

## 2026-07-21 · 電子商店清單縮圖去邊框放大＋kebab 新增「複製商店連結」（B 反饋導入）

使用者附兩張圖：已上架商品的 kebab 選單要多一項「複製商店連結」；清單縮圖（不管是真實照片還是 icon placeholder 狀態）都不要邊框、再放大一點。

- **【B】** `.product-list__image` 底層 CSS：52×52＋1px `--border` 改 60×60、拿掉邊框；`.product-list__image--placeholder` 同步拿掉 `border-color` 覆寫（沒有邊框可染色了）。真實照片與 icon 兩種狀態共用同一個底層 class，一次改完兩種樣子都對齊使用者要求。
- **【B】** Products／Bundles／Auctions 三分頁的 kebab 選單，緊接在「在商店上架」開關之後新增「複製商店連結」（新 i18n key `e-shop.a.copystorelink`），純展示用（跟既有其他選單項一樣沒有真的複製邏輯）——JS 動態生成的商品列模板也同步补上。Auctions 分頁原本就有一個獨立的「複製連結」（`e-shop.a.copylink`），語意已經涵蓋，維持不動、不重複加。
- **牽動範圍確認**：`.product-list__image` 是共用元件，除了 e-shop 只有 `events.html` 也在用（真實活動海報／icon 兩態同一元件）；events 頁的欄寬是寫死 `grid-template-columns: 52px ...`（含桌機與 ≤760px 兩處），縮圖改 60px 若不同步欄寬會裁切，已一併改成 60px 對齊。`.product-list__thumb`／`.project-list__icon`／`.data-list__icon`（Q20 統一的純 icon 家族，orders/pickup/my-ip/projects/14 頁）**不受影響、維持原本 52px＋邊框**——那組角色是唯讀 icon chip、不承載真實照片，跟這次改的 `.product-list__image`（可放真實商品照）本來就是不同元件，只是 Q20 當時把兩者的視覺基準對齊過，這次拉開後在 design-system.md 補了說明避免以後誤會成沒同步。
- 驗證：Playwright 量測 `.product-list__image` computed width/height/border（60px／60px／`0px none`）；開啟 kebab 選單讀出項目順序「在商店上架／複製商店連結／編輯／補貨」；events.html 桌機截圖確認縮圖沒被裁切。check_ds_sync 全 PASS。

使用者指出全站商品縮圖都是「尚未上傳」的分類 icon placeholder，要求電子商店的商品/組合/競標清單改用真實商品照片，並提供參考站 `ztor-eshop-fe.vercel.app/shop.html`。討論後範圍收斂為「只改電子商店」（不動 orders／pickup／my-ip 等其他頁面共用同款 icon placeholder 的清單，那些留待之後視需要再議）。

- **【B】** 新增 `images/products/`（29 張 `.webp`，共 412KB），取自參考站的商品攝影素材（`assets/images/shop/g/t/*.webp`，經 `assets/shop-data-imgmap.js` 找到實際路徑；該站與本站同屬 Ztor 產品家族，圖檔重新命名為語意化檔名如 `coastline-tee.webp`，不沿用來源站的泛用檔名）。
- **【B】** `e-shop.html` 商品分頁：9 個具名商品列＋Bundles 2 列＋Auctions 3 列，`.product-list__image--placeholder`＋分類 icon 改成 `.product-list__image`＋`<img>` 真實照片；JS 動態生成的 20 筆填充商品中，前 15 筆（Sticker sheet ~ Wristband）比照辦理，**刻意保留最後 5 筆（Bandana／Pennant／Lyric booklet／Photo set／Bookmark）維持原本的 icon placeholder**（使用者指定，示範「尚未上傳圖片」的原始樣式仍在，不是全部換掉）。三個分頁的草稿列（Untitled，各分頁各 1 列）維持 icon——草稿本來就沒有素材，符合「尚未上傳」語意，不算在保留名額內。
- **【B】** 數位商品（單曲／電影／專輯／會員卡）依使用者指定也換照片（原本用 music/film/disc/id-card 語意化 icon）；會員卡用參考站的卡片攝影（`cards-3.webp`）視覺上最貼近「會員卡」概念。「古董合成器」拍賣品找不到貼切素材，用通用道具照代替（`vintage-synth.webp`，來源檔 `prop-3.webp`），為一處已知的不完美配對。
- 影響範圍：僅 `e-shop.html`；`.product-list__image`／`.product-list__image--placeholder`／`.product-list__image img` 三個共用 class 定義本身未變動，其他頁面沿用同款元件的地方不受影響。
- 驗證：Playwright 逐列檢查 `hasImg`／`hasIcon` 布林值，商品分頁 30 列中 24 張圖＋1 草稿 icon＋5 保留 icon，組合/競標分頁真實列全數換圖、草稿列維持 icon，圖片全數 200（`loading="lazy"` 未進視窗前 `naturalWidth` 為 0 屬正常延遲載入、非壞圖）；check_ds_sync 全 PASS。

## 2026-07-21 · 電子商店清單 hover 擴大套用浮起效果（B 反饋導入，Q5 例外擴大）

使用者先前（2026-07-20）已指定「我的 IP」清單 hover 要跟拖曳抬起態一樣浮起，這次再指定電子商店清單也要一樣。

- **【B】** `.product-list--eshop .product-list__row:hover` 併入原本只給 `.product-list--ip` 的浮起規則（`--card` 底＋`--radius-md`＋`--shadow-float`，比照 `.is-dragging`），兩者合併成同一條 CSS 規則，不重複定義。`.product-list--eshop` 是 Products／Bundles／Auctions 三分頁共用的 class，三頁的清單列 hover 一併套用；`--orders`／`--pickup` 兩個清單仍維持原本只換底色（未被要求變動）。
- STYLE-DECISIONS.md Q5 與 design-system.md 的 Product list Variants 條目同步更新例外範圍。
- 驗證：Playwright hover Coastline acetate 列，量測 computed background/border-radius/box-shadow 與拖曳態數值一致；check_ds_sync 全 PASS。

## 2026-07-21 · 物流欄位收進「顯示更多」＋出貨分類 placeholder＋購買限制與標籤拆兩區（B 反饋導入）

使用者三項指示：(1) 取貨方式的物流配送只顯示重量，其餘用「顯示更多」按鈕展開；(2) 出貨分類下拉的 placeholder 寫「選擇貨物類型」；(3)「購買限制與標籤」拆成「購買限制」與「商品標籤」兩個 section。

- **【B】** 新元件 [field-more.css](./ds-components/field-more.css) ＋ [partials/field-more.js](./partials/field-more.js)：`.field-more__toggle`（chevron ＋顯示更多／收合）＋ `.field-more__body[hidden]`。物流配送只留「重量」在外層，出貨分類／尺寸／寄件地收進去。
- **關鍵設計判斷——收合區有值就自動展開**：同一段 markup 在建立商品是空表單（收起來合理），在商品明細是編輯頁、欄位帶著真實資料（尺寸 21/15/2、寄件地台南）。若照樣收起來等於把使用者填過的東西藏起來。改由 JS 依「收合區內有沒有值」決定初始狀態，兩頁就能共用同一支元件、不必分岔成兩種寫法——這也是不用原生 `<details>` 的原因。實測：建立商品初始收合、商品明細初始展開。
- **【B】** 出貨分類下拉新增空值 option `cp.delivery.shipcat.ph`（選擇貨物類型／Select cargo type）取代原本的空白 option；create-product 與 product-detail 同步。
- **【B】** `create-product.html` 的「購買限制與標籤」拆成兩個 `form-section--outlined`：「購買限制」（`cp.limits.title`，新 key）與「商品標籤」（沿用 `cp.tags` 當區塊標題，原本的說明文字改掛 `form-section__sub`）。`product-detail.html` 本來就是分開的兩區，未動。`cp.shared.title`（購買限制與標籤）已無消費頁，保留定義不刪。
- i18n 新增 4 個 key：`field.show-more`／`field.show-less`（通用元件文案）、`cp.delivery.shipcat.ph`、`cp.limits.title`。
- 施工中踩到的坑（同一類問題連續三次，記下來）：**新元件的資源掛載漏了三處**。(1) `create-product.html` 的 `<script src="partials/field-more.js">` 沒寫進去（批次插入時被同時在改這批檔的其他 session 覆蓋，版本號一路被別人 bump 到 zf），按鈕點了沒反應；(2) `design-system.html` 漏掛同一支 JS，元件卡的 demo 不會動；(3) `design-system.html` 連 `field-more.css` 的 `<link>` 都沒有——chevron 不會轉向。**第 (3) 點暴露 check_ds_sync 檢查 1 的盲點**：它判斷「元件 CSS 有沒有進 DS 頁」是比對檔名字串，而 `field-more.css` 這個字串本來就出現在元件卡的 `<code>` 說明裡，於是誤判為已連入。三處都已補上並實測（DS 頁與產品頁的 chevron 皆正確轉 180°、開合與文案切換正常）。**教訓：批次掛資源後要逐檔 grep 真正的 `<link>`／`<script>` 標籤，不能只看腳本回報成功，也不能只信 check_ds_sync 的 PASS。**
- 驗證：Playwright 實測 create-product 收合→展開→再收合三態（`data-open` 與按鈕文案同步切換）、外層只剩「重量 *」一欄；product-detail 初始即 `data-open="true"`、收合區內確實有值（一般包裹／21／15／2）；出貨分類第一個 option 顯示「選擇貨物類型」；兩個 section 標題為「購買限制」與「商品標籤」；兩頁 div／section 平衡（HTMLParser 檢查 0 錯）。

## 2026-07-21 · 「規格」術語收斂成「選項」＋成本價欄位精簡（B 反饋導入，全站文案）

使用者指定三項全站文案改動：(1) 商品資訊的「規格」改「詳細規格」；(2) 「商品規格」section 改「商品選項」，其中「單一規格／多規格」改「單一選項／多選項」；(3) 成本價的「僅自己可見」改「選填」，並移除 input 下方那行「選填」。

- **【B】** 站上「規格」原本混用兩種意思：**產品規格書**（「時區與時間精度待規格確認」那類）與**商品變體**。本輪只動後者，前者全部保留。經使用者裁示連衍生詞一起改，避免出現「多選項」旁邊寫「逐規格表」的矛盾。
- 改動的 i18n key（20 個 key、23 處值，其中 3 處是英文對應）：`cp.spec.title`（規格→詳細規格）、`cp.spec.add`、`cp.var.title`（商品規格→商品選項；en Variations→Product options）、`cp.var.single`、`cp.var.multiple`（en Multiple variations→Multiple options）、`cp.var.col.variant`（規格組合→選項組合）、`cp.var.priced-above`、`cp.var.table.title`、`cp.var.table.sub`、`cp.var.empty`、`cp.discount.enable-pct-sub`、`cp.sale.pct-allhint`、`e-shop.variant.single`、`product-detail.var.opts-locked`、`cp.auc.sub`、`cb.meta.variants`、`cb.note.variants`、`cb.price.auto-hint`、`od.snap.variant`、`cp.cost.note`（僅自己可見→選填；en creator only→Optional）。
- 英文只動兩個 section 級標籤（Variations→Product options、Multiple variations→Multiple options）。句子層的 EN 維持 variation／variant——英文本來就用 options 指「尺寸／顏色」、variants 指「組合」，語意已經分得清楚，跟著改反而會失準。
- **【C】** `create-product.html` 與 `product-detail.html` 的成本價 input 下方 `field__hint`（`cp.optional-cap`）移除——資訊與標籤上的「選填」重複。該 key 目前無消費頁、成為孤兒 key，保留定義備用（未刪，避免影響其他 session 正在做的改動）。
- 影響頁面：文案改在 `js/i18n.js` 一處，實際渲染變動的頁面為 create-product、product-detail、e-shop、create-bundle、bundle-detail、order-detail、create-auction。
- **收尾驗收抓到一處漏改**：`e-shop.html` 動態生成商品列時，變體欄的 fallback 直接寫死中文 `it.variant || '單一規格'`，不吃 i18n、也沒跟著改；該頁 24 筆填充商品有 22 筆走這條 fallback，畫面上會與同頁靜態列的「單一選項」並存。已改成沒有自訂變體字串時輸出帶 `data-i18n="e-shop.variant.single"` 的節點（注入後既有的 `applyI18n` 會處理），順帶讓這欄支援語言切換。`design-system.html` 的 variant-builder demo 按鈕 `Multiple variations` 也一併同步成 `Multiple options`。
- **上游落差（未回寫）**：`documents/` 的 5.1.5.1／5.1.5.2／5.1.5.4 等規格仍使用「規格／多規格／規格組合」的舊術語，本輪只改 UI 呈現層、未動 `documents/`。術語表若要正式更名，需走 `design-spec-writer` 更新上游並記入 `decisions.md`；在那之前規格書與畫面的用詞會不一致。

## 2026-07-21 · 建立流程右側預覽欄的卡去邊框，與左欄一致（B 反饋導入）

使用者指出上架設定的外框不該有線、要跟左邊的 section 一致。查證後確認是站上兩條裁決撞在一起：左欄的 `form-section--outlined` 早在 Q14／Q18 就改成「填色＋E2 陰影＋頂緣高光、無邊框」，右欄的卡卻還是 Q3 的「填色＋1px 邊框」——同一個畫面兩種卡邊界。

- **【B】** `preview-column.css` 新增 scoped 規則：`.preview-col .card` 與 `.preview-col .preview-card` 改 `border: 0` ＋ `box-shadow: var(--shadow-card), var(--shadow-edge-top)`，與左欄完全同一組值。
- 範圍由使用者裁示為「右側預覽欄全部」而非只改上架設定卡——只改一張的話，它正上方的商店預覽卡還是有線，同一欄會出現兩種做法。實際受影響 **4 頁共 7 個盒子**，經元件層一次生效：create-product／create-bundle／create-auction 各 2（預覽卡＋上架設定卡），外加 **create-campaign 的預覽卡 1 個**——這頁同樣用 `.preview-col`，首版回報時漏列，收尾驗收抓出後補上（該頁預覽欄只有預覽卡、沒有第二張卡）。
- **未推翻 Q3**：規則 scope 在 `.preview-col` 內，全站其他約 40 處 `.card`（儀表板、收入、訂單…）維持 1px 邊框不變。
- 欄內收合式上架設定選單自己的 1px 外框保留——那是控制項層級的邊界（Q4：控制項用真 border），與卡片邊界是兩個角色。
- 驗證：Playwright 量測上架設定卡／商店預覽卡／左側 section 三者的 border 與 box-shadow，三組值完全相同（`0px none` ＋ `rgba(0,0,0,0.4) 0 2px 6px` ＋ 頂緣高光）；create-bundle／create-auction 各確認 2 個盒子都在 scope 內。

## 2026-07-21 · 開關揭示的表單包進外框：新增 `.control-group`；多規格選項列圓角放大（B 反饋導入）

使用者附兩張圖：(1) 低庫存提醒那組——開關列與它揭示的「自訂低庫存門檻」要包在同一個框內，並指名「開啟折扣這類開關開啟後會有表單出現的設計都要」比照；(2) 多規格選項列的圓角要更大。

- **【B】** `control-row.css` 新增 `.control-group`（`--radius-xl` 外框＋1px 內描邊）與 `.control-group__body`（1px 上分隔線＋`--sp-16` 內距）。群組內的 `.control-row` 交出自己的邊框與圓角，邊界由群組承擔。原本揭示欄位是裸的散在外框列下方，看起來像獨立的另一件事；包成一框＋一條分隔線，「這塊歸這個開關管」的從屬關係才讀得出來。
- **【B】** 全站 11 組「開關→揭示表單」一次包完：create-product（開啟折扣 ▸ 限時折扣、多規格折扣 ▸ 限時折扣、低庫存提醒、每人限購）、create-bundle 與 bundle-detail（限時折扣）、product-detail（開啟折扣 ▸ 限時折扣、每人限購）。**群組可巢狀**——折扣的揭示區裡本來就包著限時折扣的開關，現在呈現為外框內再一框。沒有揭示表單的單純開關列（create-auction 密封終局／得標者付運費、create-project 直播／廣告）維持單獨 `.control-row`，未動。
- **【B】** `variant-builder.css` 的 `.option-set__row`／`.option-set__add` 圓角由 `--radius`(6) 放大到 `--radius-xl`(16)；編輯態的 `.variant-option` 一併由 `--radius-md`(6) 改 16——兩者是同一列的收合／展開兩態，圓角不同會在切換時跳一下。與收合式 radio-list 的列同階（見 STYLE-DECISIONS Q22）。**收尾驗收抓到一個漏改**：同檔另有一條優先權更高的 `.option-set .variant-option{border-radius:var(--radius)}`（兩個 class）把編輯態蓋回 6px；由於 `renderOptions()` 一定把 `.variant-option` append 進 `.option-set`，正式頁面實際渲染的是被蓋掉的 6px，只有收合列真的變 16。已一併改為 16。
- 落地時修掉一個副作用：低庫存那組的揭示欄位原本帶 `max-width:300px` 的行內樣式，包進群組後會讓分隔線只有 300px 寬、切在半途；把寬度限制移到內層 `input`，容器保持滿版。這條規則已寫進元件卡（寬度限制下在欄位、不下在 `__body`）。
- 連帶修正 DS demo 的還原度：`design-system.html` 的 variant-builder demo 原本沒把 `.variant-option` 包進 `.option-set`，與真實 DOM 不符，正好繞過上述那條覆寫規則、讓 demo「看起來是對的」而掩蓋 bug。demo 已補上 `.option-set` 外層並加註解，DS demo 須還原真實巢狀結構這條規則寫進該段註解。
- 驗證：Playwright 量測 `.control-group` 圓角 16px／內描邊 `rgb(51,52,53)`、`__body` 上分隔線 1px＋內距 16px、群組內 `.control-row` box-shadow 為 none；四頁 div 平衡以 HTMLParser 逐檔核對（未閉合 0、多餘關閉 0）；巢狀折扣組與低庫存組各截圖確認。

## 2026-07-21 · 多規格選項值 chip 改中性淡填：chip 新增 `--value` 變體（B 反饋導入）

使用者附圖指出建立商品「多規格」裡剛輸入的選項值標籤是白底黑字、太搶眼，並要求參照 Webflow 的做法。查 Webflow Designer 的 class chip（Mobbin screen `eb345f20`）：淡色填底、低對比，安靜待在深色面板上，不會反白。

- **【B】** `chip.css` 新增 `.chip--value`：`--input-surface` 底＋`--foreground` 字＋1px `--border`，hover 不變色。語意是「創作者剛輸入的值」——正在輸入的資料不該比頁面上任何東西都搶眼。`create-product.html` 的多規格選項值由 `chip--active`（反白）改用 `chip--value`；圓角維持 `--radius-pill`（Q1「可點＝全圓」不動）。
- 三種「創作者自建值 chip」的分工同輪寫進 `design-system.md`：`--value` 中性灰＝剛建立的值、`.tag-input .chip--active` 橘＝已套用的分類（Q19）、`--active` 反白＝篩選已選（Q8）。使用者選中性灰而非併入橘色，理由是選項值與商品標籤的語意不同。
- 影響範圍：`create-product.html` 多規格選項值一處（全站唯一消費點）＋ `design-system.html` 的 chip 卡（新增 `--value` 矩陣與三者對照）與 variant-builder demo。商品標籤、電影關聯、篩選 chip 全部不動。

## 2026-07-21 · 日期／時間欄位補 placeholder：新元件 date-input（B 反饋導入，全站約 40 個欄位）

使用者附圖指出上架時間欄空著時顯示的「年/月/日 --:--」是一般內文色，看起來像已經填了值，要求「所有日期的 input 文字都要改成 placeholder 的顏色，並且都要顯示日曆 icon ＋『選擇日期』」。原生日期欄位不吃 `placeholder` 屬性，那串遮罩是瀏覽器自己畫的，只能另做裝飾層。

- **【B】** 新增 [date-input.css](./ds-components/date-input.css)：空值＝日曆 icon ＋淡灰「選擇日期」（原生 `::-webkit-datetime-edit` 藏起來）；已填＝日期用正常內文色、內距回到欄位原值。**icon 與文字都只在空值時出現**——首版讓 icon 常駐，實測發現它吃掉 28px 橫向空間，設定頁 120px 的勿擾時段時間欄會被切字（截圖佐證），改成只在空值出現後，已填狀態的版面與改版前完全相同。原生右側日曆鈕攤平成整格透明覆蓋層，所以填值後仍可點整格開選單。
- **【B】** 新增 [partials/date-input.js](./partials/date-input.js)：執行期掃全站 `date`／`datetime-local`／`time` 欄位，各包一層 `.date-input` 並注入 icon 與文案，依 value 切 `[data-empty]`。這樣頁面 markup 完全不用動（約 40 個欄位散在 17 個檔），日後改文案只改一處。補貨、取貨場次、手動登錄、新品貼文這些點開才生出來的彈窗，用 `MutationObserver` 接住，各 partial 不必自己記得呼叫 mount。
- 文案三型共用一句「選擇日期」（i18n `field.pick-date`），依使用者裁示；純時間欄位（活動時刻、勿擾時段）因此也顯示日曆 icon ＋「選擇日期」，語意上略有落差，已向使用者說明、待其決定是否分寫。
- 影響範圍：17 頁掛上新 CSS／JS（admin-platform-fees／bundle-detail／create-auction／create-bundle／create-campaign／create-event／create-product／create-project／design-system／e-shop／earnings／fans-crm／ip-bank-reporting／pickup-detail／pickup／product-detail／settings）。`input.css` 本身未動，避免影響非日期欄位。
- 驗證：Playwright 量測 create-product 上架時間欄——空值 padding-left 40px、placeholder 落在 icon 右側 40px 處且完整置於欄內；填值後 `[data-empty="false"]`、padding 回 12px、文字色 `rgb(253,253,253)`＝`--foreground`、無截斷。設定頁 120px 窄時間欄 `scrollWidth === clientWidth`（未溢出）。
- 已知落差：design-system 頁沒有 `data-i18n` 執行環境，該頁 demo 的 placeholder 固定顯示英文 "Pick a date"，產品頁不受影響（已寫進元件卡的 Note 欄）。

## 2026-07-21 · 上架設定改收合式選擇器：radio-list 新增 `--collapsible` 變體（A 規格對齊，Figma 856-22782）

使用者提供 Figma node 856-22782 的兩態（收合／展開＋hover），要求把上架設定做進原型。原本（2026-07-17）是三個選項恆展開的 `radio-list`；新版收合時只顯示目前選項＋chevron，點一下才展開完整清單。使用者裁示：五個消費頁一次全改（避免同一角色兩種做法），展開時已選項在觸發列與清單各出現一次的重複照 Figma 保留。

- **【A】** `ds-components/radio-list.css` 新增 `--collapsible` 變體：外框 1px `--border` ＋ `--radius-xl`、`.radio-list__trigger`（圓點恆為已選態＋文字＋`.radio-list__chevron`）、`.radio-list__options[hidden]`；展開時 `[data-open="true"]` 讓觸發列填 `--input-surface`（比卡亮一階＝作用中的控制面，沿用 Q19 的 filled 語言）、chevron 轉 180°。base 變體（選項恆展開）保留未動。
- **【A】** 新增 `partials/radio-list.js`：自動 mount 全站 `.radio-list--collapsible`，統一處理開合、把已選列的文字與 `data-i18n` key 同步到觸發列（切語言由 `applyI18n` 重填，不會殘留單語）、外點與 Esc 關閉、派發 `radio-list:change`。五頁原本各自複製的「移除 active／加 active」邏輯全部退場，頁面只留自己的欄位揭示（選「定時上架／定時開拍」才顯示時間欄）。
- **【B】** 同一輪把 `.radio-list__item:hover` 的底色由 `--muted` 改回 `--accent`——暗色 `--muted`（#161718）比卡片 #212223 還深，hover 讀起來像凹下去；Q9 早就裁決「互動 hover 統一 accent」，這支元件建立時漏跟，Figma 的 hover 也是亮一階。
- 影響範圍：五個消費頁（`create-product`／`create-bundle`／`create-auction` 預覽卡下方、`product-detail`／`bundle-detail` 定價與庫存頁籤）＋ `design-system.html` 卡（base 與 `--collapsible` 兩個 demo）＋ `design-system.md` 條目。拍賣頁語彙仍是「不開拍／立刻開拍／定時開拍」，只換選法、不動文案。
- 待裁決：外框與內部列的圓角取了 `--radius-xl`(16) 對齊 Figma 的 18，與 Q16「控制項／清單列維持 6px」相衝，已記為 `STYLE-DECISIONS.md` Q22，暫依 Figma。

## 2026-07-21 · 狀態徽章新增 `--status-error` token，與 `--destructive` 分離（B 反饋導入，全站共用元件）

使用者附圖指出電子商店清單的狀態標籤（草稿／庫存過低／上架中）顏色要改，附 Figma 參考（node 845:11071）。抿出三色實際值：草稿（`badge--neutral`）與上架中（`badge--success`）跟現有 token 完全對上（`#161718`/`#B9B9B9`、`#4ADE80`）不用改；只有庫存過低（`badge--error`）暗色不對——目前用 `--destructive`（`#E7000B`，深底小字徽章讀不清），Figma 要的是較亮的 `#FF3D47`。

- **【B】** `_tokens.css` 新增 `--status-error`（亮色 `#DA314A`，暫同 `--destructive`；暗色 `#FF3D47`，對齊 Figma），語意上與 `--destructive`（刪除等破壞性操作，如刪除鈕、danger dropdown item）分開——這兩者原本就是兩個概念，2026-06-25 那筆 `--status-error→--destructive` 改名只是對齊 shadcn 命名、當時值本來就相同，不是「兩者永遠同色」的設計裁決，故拆開不算推翻舊決策。
- `.badge--error`／`.ztor-badge--error`／`.ztor-dot--error` 改讀 `--status-error`（原讀 `--destructive`）；`.badge--success` 與 `.ztor-badge--error`／`--success` 的 tint 百分比順手從 14%／12% 對齊到 Figma 量到的 16%，`--destructive` 本身與其餘破壞性操作用途（刪除鈕、danger 選單項、負數金額等）完全不動。
- 影響範圍：`badge.css`／`_tokens.css` 是全站共用元件，凡用 `.badge--error` 的頁面（e-shop／orders／earnings／fans-crm／projects／event-detail／product-detail／settings…）狀態標籤紅色同步變亮；未動 `.alert--error`、`.kpi--destructive`、`.data-list__amount--neg` 等其他仍合理沿用 `--destructive` 的地方（範圍收在使用者實際指出的狀態徽章，不做無關擴大）。
- 驗證：Playwright 在 e-shop.html 與 orders.html 分別量測 `.badge--error`／`--success`／`--neutral` computed color，`rgb(255,61,71)`／`rgb(74,222,128)`／`rgb(185,185,185)` 與 Figma 三色文字值完全吻合；check_ds_sync 全 PASS（含新 token 的 md↔html 文件化檢查）。

## 2026-07-21 · 電子商店主工作列改實色殼卡（A 規格對齊，取代 720:2165 版）

使用者提供新版 Figma 參考（node 845:11081），指出「商品/組合/競標」分頁列＋右側動作圖示這條工作列的底色樣式跟目前不一樣。

- **【A】** `.eshop-list-topbar` 主體從「與頁面同色（`--surface-page`）＋只有下緣圓角 12px＋向下柔影撐出圓角視覺」，改成「實色殼層（`--surface-shell`，比頁面亮一階）＋四角全圓角 16px」；顏色本身的階差已經讓卡片輪廓讀得出來，不再需要陰影撐圓角，box-shadow（含暗色覆寫）一併移除。Figma 量到的 `#1a1c1c` 對應既有 token `--surface-shell`（暗色 `#1C1D1E`，數值差在 Figma 匯出誤差內），亮色沿用同 token（`#F0F0EE`），不必新增 token。
- 2026-06-26 那筆「照 Figma 720:2165 兩層陰影結構」的紀錄視為被本次取代——該版 Figma 節點已更新為新結構，不再是同色卡＋陰影的做法。
- 影響範圍：僅 `e-shop.html` 頁面內 `<style>`（`.eshop-list-topbar` 頁面專屬樣式，未跨頁共用，不動 ds-components）。下方狀態篩選列（`全部狀態／上架中…`）背景仍是 `--surface-page`，維持與頁面同色、不受影響。
- 驗證：Playwright 量測 `.eshop-list-topbar` computed background/border-radius/box-shadow，暗色 `rgb(28,29,30)`／`16px`／`none`，亮色 `rgb(240,240,238)`／`16px`，兩色階與 Figma 對齊；check_ds_sync 全 PASS。

## 2026-07-21 · 電子商店商品清單移除規格數／限量徽章（C 撤除）

使用者看過上一輪（UIA-066 那筆）改完的畫面後回饋：Coastline tee／hoodie 名稱後的「4 種規格」「6 種規格」徽章、Coastline acetate 名稱後的「限量」徽章都是多餘的——庫存欄已經是「21 / 50」能直接看出限量，規格種類則已經由名稱下方的灰色副標（`__meta`，「顏色（Black/Sand）× 尺寸（S/M/L）」這類文字）呈現，徽章與這兩者是重複資訊。

- **【C】** `e-shop.html` 移除三個 `badge badge--neutral badge--inline` 徽章（`e-shop.row2.variants`／`e-shop.rowH.variants`／`e-shop.row.limited`），連同 `js/i18n.js` 對應三個 key 一併刪除（皆已確認無其他頁面引用）。`__meta` 副標與 `__stock` 格式維持 UIA-066 那筆的內容不變，本次只拿掉徽章，不影響規格副標與庫存的文字規則本身。
- `.badge--inline` 元件本身不受影響（`order-detail.html`「Limit 2/person」「Awaiting pickup」、`orders.html` 取貨提醒仍在用），只是 E-Shop 這個特定用法被撤除；`design-system.html` Class API 的 `--inline` 示範改用 order-detail 的真實案例，`design-system.md` 的 Badge 條目與 Product list Variants 條目同步註記。
- 影響範圍：僅 Coastline tee／hoodie／acetate 三列的商品名稱；分類欄、庫存欄、JS 動態填充的 21 筆商品皆未變動（那批本來就沒有這個徽章）。

## 2026-07-20 · 電子商店商品清單三處內容對齊 Figma（A 規格補齊 · UIA-066）

使用者提供 Figma 參考（node 845-12576），要求電子商店「商品」分頁清單三處內容規則對齊：商品名稱副標、分類欄、庫存欄。

- **【A · 規格副標】** `.product-list__meta`：單一規格商品固定顯示「單一規格」（新 i18n key `e-shop.variant.single`，取代 row1/row4/row5 各自的 `rowN.meta`）；多規格商品顯示「維度（選項）× 維度（選項）」——Coastline hoodie 原本就是這個格式（拿掉多餘的「連帽衫 · 」前綴），Coastline tee 補成「尺寸（S/M/L/XL）」。JS 動態填充的 21 筆商品（`document.querySelector('[data-eshop-panel="products"]')` 那段 IIFE）同步：僅 Tee 兩款有真實尺寸選項改用 variant 欄位，其餘 19 筆一律「單一規格」（原本各自的格式描述文字如「貼紙·12入」不再顯示，改為統一的規格副標語意）。
- **【A · 分類兩行】** 新增元件層 class `.product-list__cat-sub`（子分類，白字 `--foreground`）／`.product-list__cat-main`（主分類，灰字 `--muted-foreground`），`.product-list__category-cell` 改放兩個 span；主分類用共用 i18n key `e-shop.cat.physical`／`e-shop.cat.digital`（不必每列各自定義），依各列 `data-type` 挑選。9 筆命名商品＋21 筆 JS 填充商品皆套用（填充商品主分類固定「實體商品」，因為 ITEMS 陣列全是實體品）。
- **【A · 庫存格式】** `.product-list__stock`：無限量商品「剩餘 / ∞」（取代原本「X left」／「剩 X 件」），限量商品「剩餘 / 上限」（Coastline acetate 原本就是 `21 / 50`，格式已對，未變動）。
- **呈現假設記入 UIA-066**：數位商品（單曲／電影／EP／會員卡）在 Figma 稿子也顯示「48 / ∞」，但三列數字相同、疑似佔位假資料，且數位商品無實體庫存概念——經使用者確認，數位商品庫存維持純 `∞`、不採用 Figma 字面值捏造銷售數字；數位商品的 `__meta` 也維持原本格式描述文字（音樂單曲·MP3+FLAC 等），不套用規格副標規則（數位商品無「規格」概念）。
- 影響範圍：僅 `e-shop.html` 商品（Products）分頁；套組（Bundles）／競標（Auctions）分頁的 `category-cell` 是不同語意（成員／分類），未觸碰。
- 文件同步：`design-system.md`／`design-system.html` 的 Product list 條目與 Class API 表補充兩行分類的說明；`ASSUMPTIONS.md` 新增 UIA-066。check_ds_sync 全 PASS、Playwright 逐列量測 30 筆 Products 資料＋i18n 中英切換皆確認正確、bump `20260721a`。

## 2026-07-20 · 商品明細改版：兩欄版型＋右側常駐 meta 欄，連帶四項全站視覺尺度裁決（B 反饋導入 · A 規格對齊 · C 撤除 · Q21）

起點是使用者要求「依照 `docs/黑夜版風格探索-midnight.html` 的商品明細改 r2.1」，中途改以 Figma node `845-10300` 為準；經約十輪逐項截圖回饋定案。先在 `docs/商品明細-midnight版型-預覽.html` 做獨立預覽頁反覆對版，確認後才落地。

### 【B】版型：單欄分頁 → 兩欄（主欄＋右側常駐 meta 欄）

- 分頁列橫跨全寬，其下分左右兩欄。左欄放分頁內容，右欄是**跨分頁常駐**的唯讀狀態欄（sticky），切到任何分頁都看得到庫存、交付、關聯——這是本次改版的核心：改東西前要先知道的資訊不該藏在某個分頁裡。
- 分頁由 5 個併為 4 個：**總覽**（原總覽＋原基本資訊）／定價與庫存／交付與取貨／關聯。原總覽的庫存健康與專案引用移進右欄，銷售摘要留在總覽最上方。
- 右欄三張卡：**當前庫存**（量條＋庫存 3/50＋補貨鈕）／**交付與取貨**（取貨方式二選一，選物流配送顯示發貨地址、選 QR 領取顯示領取場次，由既有 `data-when-delivery` 連動）／**使用中**（專案／組合引用）。

### 【B】新元件三支（promote，鐵律 1）

- `ds-components/detail-rail.css` — `.detail-grid` / `.detail-main` / `.detail-rail`。詳情頁兩欄殼，右欄 sticky、≤1100px 收單欄。內含一條必要的權重覆寫：元件層 `.form-section--outlined:not([hidden]) ~ …` 的 24px margin-top 會疊上 flex gap 變成 48px，在此歸零讓右欄間距只由 gap 決定（與左欄同為 24px）。
- `ds-components/kv-list.css` — `.kv` / `.kv__k` / `.kv__v` / `.kv--lead`。唯讀鍵值列。**`.kv[hidden]` 必須顯式歸零 display**：本元件用 flex，會蓋過瀏覽器對 hidden 屬性的預設 `display:none`——這是實作時真的踩到的坑（兩種取貨方式同時顯示）。
- `ds-components/stock-bar.css` — `.stock-bar` / `__fill` / `__fill--low`。細長量條，低於低庫存門檻轉紅（`--destructive`）。百分比由 consumer 以 inline style 提供（那是資料不是樣式）。

### 【Q21】四項全站視覺尺度（詳見 STYLE-DECISIONS.md Q21）

這四項動到的是共用元件與 token，依鐵律 9 不能留在頁面 `<style>`。已在明確告知影響範圍（15–28 頁）後由使用者裁決**全站套用**：

- `.form-section__title` 18→14px（同 `.field__label`）
- `.form-section__sub` 14→11px、色階壓暗（同 `.field__hint`）
- `.field__hint` 壓暗成 `--muted-foreground`——**推翻 2026-07-16 的反向提亮決定**
- `.kpi` 底色 `--card`→`--input-surface`（卡中卡不再同色相糊）
- 頁寬：**新增 `.page--narrow`（1056）只給商品明細用，`.page` 維持 1280**（同日修訂；原裁決是全站收窄，使用者看過實際結果後改為變體）

### 【A】對齊 Figma 845-10300 的內容調整

- 素材區改成一排四格（主圖／＋／＋／more），尺寸一致；由 `upload-showcase--stacked` 改回 base `upload-showcase`，未動共用元件。
- 欄位順序改為 標題 → 描述 → 主分類／次分類 → 規格；「新增規格」改通欄按鈕。
- 銷售摘要包進 outlined 卡、補副標、右上連結改「查看更多 →」；KPI 由三個改四個（已售／營收／扣費後淨利／轉換率）。
- 麵包屑「商品」→「實體商品」；頁首去縮圖、只留單一狀態徽章。
- 狀態徽章去橘改中性——除對齊 Figma，亦符合 Q8「品牌橘只給主操作與主分類」。

### 【C】撤除（依使用者逐項指定）

頁首的庫存過低徽章與商品描述、右欄的低庫存門檻與上架中兩列、專案引用的影響範圍說明與變更影響副標、主分類的「建立後不可變更」提示、頁首的補貨鈕（入口收斂到右欄當前庫存卡）。**其中專案引用的兩項是規格 §2.4 明列的組成項，移除後規格與畫面不一致——已記入 ASSUMPTIONS UIA-065 待上游裁決。**

### 產品缺口（UIA-062～065）

轉換率 KPI、組合引用、次分類鎖定、以及上述【C】的規格落差，四項均為上游未定義或與規格不符，已記入 `ASSUMPTIONS.md`，未回寫 `documents/`。

### 收尾

i18n 新增 18 個 `product-detail.*` key（已驗證頁面 0 缺 key）；bump `20260720j`；Playwright 逐頁量測 index／create-product／e-shop／earnings／settings／product-detail，0 水平溢出；頁寬僅 product-detail 用 `.page--narrow` 1056、其餘頁維持 1280。

---

## 2026-07-20 · `--ip` 列 hover 改浮起，比照拖曳抬起態（B 反饋導入 · Q5 scoped 例外）

使用者比對 `--eshop` 拖曳握把的抬起效果後，指定「hover 效果要跟 drag 的 style 一樣」。

- **【B】** `.product-list--ip .product-list__row:hover` 由 base 的純換底色（`--accent`）改成 `--card` 底＋`--radius-md`＋`--shadow-float`，跟 `.is-dragging`（拖曳抬起態）同一種浮起視覺；`position:relative;z-index:1` 避免陰影被相鄰列的 hairline 分隔線切掉。
- **牴觸 Q5、記為 scoped 例外**：Q5 裁決「清單列 hover 只換底色，只有可點卡片才浮起」，本次是使用者當次明確指定、非默默偏離——已記入 `STYLE-DECISIONS.md` Q5 的 scoped 例外（僅 `--ip`，其餘 5 個變體不受影響）。
- 順手修一個文件殘留：`design-system.html` 的 Product list Behavior details 表格原寫 base hover 是 `--muted`，實際 CSS（Q9 2026-07-13）早已是 `--accent`，文件跟程式碼不同步多時，一併修正。
- check_ds_sync 全 PASS、bump `20260720i`。

## 2026-07-20 · 我的 IP 清單改表格化，對齊 spec 5.1.4 §F6 的 8 欄定義（A 規格補齊 · 新元件變體 · UIA-061）

使用者反饋「我的 IP 版面跟電子商店不像」，指的是整體版面（圖示顏色已經一致，不是這個）——`my-ip.html` 原本用 `.data-list` 卡片式清單，把 IP 名稱、權利資訊、租出數、收入、租金全部擠成一行文字（如「Maya Chou · 租出3 · 收入$2,180 · 分潤100% · 租金$480/6個月」）。查證 `documents/5.1.4-我的IP.md` §F6「清單頁欄位與互動」發現：**規格本來就定義了 8 個獨立欄位**（IP／權利資訊／租出數／收入／租金／Mktplace／Manage），現有實作沒有照著做——使用者的直覺跟規格是一致的，不是新提案。

- **【A · 新元件變體 `.product-list--ip`】** 比照 e-shop/orders/pickup 既有的「同一組 grid 換一批欄位模板」手法，在 `product-list.css` 新增 8 欄版型：icon(60px) / IP 名稱＋標籤 / 權利資訊 / 租出數 / 收入 / 租金 / Mktplace(開關，新 `.product-list__mktplace` cell) / Manage。含 ≤760px 響應式堆疊規則（同 --orders/--pickup 手法）。
- **【A · my-ip.html 表格化】** 兩段清單（「在 Ztor 上產出的 IP」5 筆／「Ztor 之外的 IP」3 筆，現有樣本各 3 筆／1 筆）改用新變體，含表頭列（IP/權利資訊/租出數/收入/租金/Mktplace）。**純拆欄、不動資料**：原本擠在單一 meta 字串裡的權利資訊/租出數/收入/租金原樣拆進對應欄，數字文字皆未改動。i18n 新增 `my-ip.col.*`（欄位表頭）＋ `my-ip.rowN.rights/rented/revenue/price`（原 `rowN.meta` 拆開，取代舊 key）。
- **【D · 頁面樣式依賴切換】** `my-ip.html` 移除 `data-list.css`、改載 `product-list.css`（`.data-list` 元件仍供其餘 14 頁使用，未退場）。JS 計數改抓 `.product-list__row`。
- **呈現假設記入 UIA-061**：spec §F6 IP 欄要求「發布或登記日期」，現有前 3 筆 demo 資料本來就沒有日期值，本輪未捏造日期、暫不顯示；第 4 筆（Ztor 之外的 IP，原本就有登記日期）保留在 `.product-list__meta` 顯示。
- 文件同步：`design-system.md` Product list 條目與 Variants 段補 `--ip`；`ASSUMPTIONS.md` 新增 UIA-061。實測欄寬三輪微調（避免長標題被省略號截斷、避免租金欄位中途換行），已用 Playwright 截圖確認與 e-shop 視覺語言一致（表頭字級色、圖示晶片、hairline、hover）。check_ds_sync 全 PASS、bump `20260720g`。

## 2026-07-20 · 清單列縮圖三度修正：data-list__icon 取消獨立家族、全站併成單一標準（B 反饋導入 · Q20 三修）

使用者指出「我的 IP」（用 `.data-list__icon`）跟電子商店仍不一樣。二次修正時 `.data-list__icon` 刻意保留成獨立家族（`--card`／`--border`／40px，理由是與 `.alert--card .alert__icon` 同尺寸家族），但使用者的判斷標準很明確：全站看起來就是要一樣，不接受「兩個家族各自合理」的解釋。

- **【B】** `.data-list__icon` 由 `--card`／`--border`／40×40 改為 `--muted`／`--border-soft`／52×52／icon 色 `--muted-foreground`，與 `.product-list__thumb`／`.project-list__icon` 完全一致（不再是獨立家族）。取消與 `.alert--card .alert__icon` 的尺寸配對關係。
- 影響 15 頁（auction-detail／bundle-detail／create-bundle／create-project／fan-detail／earnings／event-detail／order-detail／ip-detail／pickup-detail／product-detail／project-detail／scanner／my-ip／design-system.html）。row 用 flex/grid 自適應高度，尺寸放大不會撞版；已用 Playwright 截圖檢查我的 IP（一般密度）與收入管理（較密集列表）兩頁，版面正常無破版。
- 用 Playwright 量測 my-ip.html 的 `.data-list__icon` computed style，與先前驗證過的 orders/e-shop/projects 三頁數值逐項比對相同（52px／`rgb(22,23,24)`／`1px rgb(32,33,34)`／icon `rgb(117,117,117)`）。
- 文件同步：`design-system.md` Data list 條目與 Anatomy 區塊改寫、`STYLE-DECISIONS.md` Q20 改為「全站統一單一標準」並記錄完整沿革（首版→二次修正→三度修正）。check_ds_sync 全 PASS、bump `20260720d`。
- **追加**：驗收發現 `border-radius` 也沒統一（`.data-list__icon` 寫死 `10px`，另三者用 `var(--radius)`=6px，肉眼可辨），一併改成 `var(--radius)`；`design-system.md` 對應段落（Anatomy／Sizes／Class API）同步。四頁四元件的 width/height/背景色/邊框寬與色/圓角/icon 色共 7 項，已用 Playwright 逐項量測完全相等。bump `20260720e`。

## 2026-07-20 · 清單列縮圖二次修正：對齊錯了基準，重改成真實呈現值（B 反饋導入 · Q20 修正）

使用者截圖指出訂單管理與電子商店的縮圖仍尺寸、顏色都不同——07-18 那筆改動對齊錯了對象。`.product-list__image` 全站 28 處使用皆搭配 `--placeholder` 變體，基礎規則（`--card`／`--border`／52px）從未單獨呈現過；真正畫面上看到的是 `--placeholder` 覆蓋後的值（`--muted` 底／`--border-soft` 邊／`--muted-foreground` icon），且 07-18 那筆也忘了同步尺寸（維持舊的 44px，`.product-list__image--placeholder` 其實是 52px）。

- **【B · 二次修正】** `.product-list__thumb`（orders／pickup）與 `.project-list__icon`（projects）改為 52×52／`--muted` 底／1px `--border-soft`／icon 色 `--muted-foreground`——這次直接用 Playwright 量測兩邊的 computed style（背景色、邊框色、尺寸、icon 顏色）逐項核對到數值相同，不是只憑外觀感覺判斷。
- **`.data-list__icon` 不套用這組新值**：它是「儀表板資訊列圖示」家族（與 `.alert--card .alert__icon` 同尺寸家族），跟「照片佔位圖」家族角色不同，維持 07-18 那筆改的 `--card`／`--border`／40px，不強行統一到 52px／`--muted`。
- 文件同步：`design-system.md` product-list／project-list／data-list 三條目改寫，清楚標示兩個家族各自的基準；`STYLE-DECISIONS.md` Q20 補「二次修正」段落，誠實記錄首版對齊錯誤的原因。check_ds_sync 全 PASS、bump `20260720c`。

## 2026-07-20 · 清單列縮圖統一追加：data-list__icon 也改描邊框（B 反饋導入 · Q20 續）

接續 07-18 那筆，使用者確認「我的 IP」等 15 頁用的 `.data-list__icon` 也要一併改，不維持例外。

- **【B】** `.data-list__icon` 由 `--muted` 填色無邊框改為 `--card` 底＋1px `--border`，與 `.product-list__thumb`／`.project-list__icon` 一致。原本保留 `--muted` 是因為與 `.alert--card .alert__icon`「同族」（同尺寸 40×40／radius 10）；但 `alert__icon` 底色本就由狀態變體決定、無邊框語意不同，改邊框不影響兩者的視覺配對。
- 影響頁：auction-detail／bundle-detail／create-bundle／create-project／fan-detail／earnings／event-detail／order-detail／ip-detail／pickup-detail／product-detail／project-detail／scanner／my-ip（14 頁）＋ design-system.html。
- 文件同步：`design-system.md` Data list 條目、`STYLE-DECISIONS.md` Q20（移除「未納入」但改為說明差異不影響配對）。check_ds_sync 全 PASS、bump `20260720b`。暗色截圖驗證。

## 2026-07-18 · 清單列縮圖統一成描邊框（B 反饋導入 · Q20）

使用者截圖指定：把「填色無邊框」那種列縮圖全部換成「描邊框」那種。這其實是 product-list 元件內部的真實不一致——同一個「清單列縮圖」角色有兩種做法並存。

- **【B · 統一列縮圖】** `.product-list__thumb`（orders／pickup）與 `.project-list__icon`（projects）由 `--muted` 填色無邊框，改為 `--card` 底＋1px `--border` 描邊框，與同元件既有的 `.product-list__image`（e-shop／events／pickup）一致。反白變體 `.product-list__thumb--cover` 的 `border-color` 設成與自身填色同色，避免反白塊上露出中性描邊。
- **未納入（待使用者決定）**：`.data-list__icon`（15 頁的儀表板資訊列圖示晶片，40×40／radius 10，當初刻意與 `alert--card` 圖示同族）維持 `--muted` 填色無邊框——角色與清單列縮圖不同，未一併改。
- 元件層一次生效、consumer 頁無需改 markup。文件同步：`design-system.md` product-list／project-list 條目、`STYLE-DECISIONS.md` Q20。check_ds_sync 全 PASS、bump `20260720a`。暗色截圖驗證。

## 2026-07-17 · midnight 精修搬入 r2.1 batch 2：input 填色＋標籤橘框＋radio 小點（B 反饋導入 · Q19）

接續 Q18，使用者對照 `docs/黑夜版風格探索-midnight.html` 逐項截圖指定，再搬三項元件級精修（全走元件層、consumer 頁自動生效）。

- **【B · input 填色，新增 `--input-surface` token】** `.input/.textarea/.select` 底色由 `--card` 改用新 token `--input-surface`（亮＝`var(--card)` 白卡、靠 1px border 分界；暗＝`#262729` 比卡 `#212223` 亮一階）。動機：section 改浮起卡後，input 底＝卡底同色會糊在卡面上（Surface-Layer Contrast），暗色尤明顯；filled 一階讓欄位讀得出。全站所有表單欄位生效，亮色維持白卡不變（無回歸）。
- **【B · 標籤已選橘框，Q8 scoped 例外】** tag-input 的已選標籤 chip（`.tag-input__field .chip--active`）改品牌橘外框＋橘字＋淡橘底（`color-mix(--primary 8%)`）。只 scope 在 tag-input 內——全站一般 `.chip--active`（earnings/fans/projects 等篩選器）維持反白黑底（Q8 不動）。動機：標籤是創作者為自己商品下的分類，橘標更像「已套用」而非中性篩選。
- **【B · radio-list 點精修】** `.radio-list__dot` 未選 16→13px 細環（1.5→1.25px），已選粗環消失、只留 8px 實心橘點（原已選還留一圈橘環）。midnight 選中指示器 A 案。radio-list 全 5 頁生效（create-product/-bundle/-auction 上架設定＋product-detail/bundle-detail）。
- **【B · 追加 2026-07-18，續對照 midnight】** (a) tag-input 橘色 scope 由 `.tag-input__field` 放寬到整個 `.tag-input`——建議列裡「已加入」而原本反白成白色的標籤，現在也是橘框橘字（全站 `.chip--active` 仍不動）；(b) 已選型別卡（`.selection-card--icon.selection-card--active`）除橘 outline 再加淡橘底，對齊 midnight——icon 維持中性、不加勾（修訂 Q13 已選呈現）。bump `20260718b`。
- **【B · 追加 2026-07-18 第二輪，續對照 midnight】** (a) 型別選項卡 `.selection-card--icon` 與上傳投放區 `.upload-tile` 底色由「同 section 卡色／transparent」改用 `--input-surface`（暗色比 section 亮一階＝填色互動面、亮色白卡）——對齊 midnight「選項/投放區比 section 亮一階」，`--input-surface` 用途由「只 input」擴為「input＋型別卡＋上傳」；已選型別卡淡橘底基底同步改疊在 `--input-surface` 上。(b) 順修一個既有 bug：`.select-wrap__icon`（下拉自訂箭頭）原 `right: var(--select-icon-inset)`，但該變數定義在兄弟 `.select` 上、CSS 變數不從兄弟繼承→箭頭 `right` 失效跑到框外，改直接 `right: var(--sp-12)`（並移除孤兒變數）。bump `20260718c`。
- 文件同步：`_tokens.css` 新 token（亮/暗）、`design-system.md` token 表＋input/tag-input/radio-list 條目、`design-system.html` swatch、`STYLE-DECISIONS.md` Q19＋Q8 scoped 例外標記。check_ds_sync 全 PASS、fresh-context 驗收、bump `20260718a`（與 Q18 batch 一起收）。淺色暗色皆截圖驗證（含 committed 標籤橘態）。

## 2026-07-17 · midnight 精修搬入 r2.1：form-section 浮起卡＋型別磚縮小＋上傳圖示晶片框（B 反饋導入 · Q18）

把探索頁 `docs/黑夜版風格探索-midnight.html` 的三項區塊/元件精修搬進正式站，範圍**限建立流程元件、不動全站一般 `.card`**（維持 Q3）。使用者先在 midnight 迭代確認外觀，再指定搬 r2.1，並選「只套建立流程 section」的範圍（不覆蓋全站卡片、不撞另一 session 進行中的 Q15/Q16）。

- **【B · form-section 浮起，修訂 Q14】** `.form-section--outlined` 由「純填色卡」加 `box-shadow: var(--shadow-card), var(--shadow-edge-top)`＝浮在內容底上的卡；仍 `border:0`（無 1px 邊框），改由填色＋E2 陰影＋頂緣高光共同分區。新增 Foundation token `--shadow-edge-top`（亮 `inset 0 1px 0 rgba(255,255,255,.5)` 白底近乎不可見／暗 `rgba(253,253,253,.05)` 深底顯上緣光）。元件層一次生效、~12 個 consumer 建立頁自動套用。
- **【B · 型別磚縮小，修訂 Q13 尺寸】** `.selection-card--icon` icon 晶片 42→36、內 icon 28→24、內距 22→`--sp-14`、gap→`--sp-8`（較 Figma 781-4166 更緊）。僅動 `--icon` 變體，base/swatch 卡不變；已選標記仍是橘 outline 無勾（Q13 邊框/標記不變）。
- **【B · 上傳圖示晶片框】** `.upload-tile--hero .upload-tile__icon` 加圓角晶片框（`--accent` 底＋1px `--border`＋`--radius-lg`＋56×56）；縮圖格不變。
- **未採用**：input 底再亮一階（#262729）——r2.1 暗色 input 已是 filled `--card`(#212223)、差一階幾乎不可見，不值得為它加暗色專用 token（撞棘輪），略過。
- 文件同步：`design-system.md` 新增 `shadow-edge-top` token 列＋form-section/upload/selection 條目更新；`design-system.html` 邊緣工具行含 `--shadow-edge-top`；`STYLE-DECISIONS.md` 新增 Q18＋Q13/Q14 修訂標記。check_ds_sync 全 PASS（WARN 僅既有 fan-store raw-color＋cookie-banner/footer 零消費）、fresh-context 驗收 10 條全 pass、bump `20260717p`。淺色暗色皆截圖驗證。

## 2026-07-17 · 折扣設定：單一規格 折扣價↔折扣% 雙向連動、多規格改折扣%＋移到逐規格表下（B 反饋導入 · 產品變更待規格 · 接續 D144）

使用者反饋：多規格下折扣設定位置與語意都不理想——(a) 折扣設定給的是「絕對折扣價 $」，多規格每個規格各自定價，一個絕對折扣價套不到 N 個規格；(b) 單一規格的定價區在多規格會隱藏（`data-when-var="single"`），但折扣設定沒設隱藏、照樣顯示且排在「逐規格定價表」上方，與真正的價格脫節。裁決走「折扣跟著價格走」＋「多規格用折扣%」。**⚠️ 動到折扣的資料模型（D144 原定義＝絕對折扣價），屬產品變更，`documents/` 規格尚未同步（見 ASSUMPTIONS UIA-060）。**

- **【B · 單一規格＝折扣價 ↔ 折扣% 雙欄連動】** create-product 單一規格折扣設定的「折扣價」欄改成 form-grid 兩欄：折扣價（$ 前綴）＋折扣%（% 後綴，`amount-field--suffix`）；以定價（`cp-price`）為基準雙向自動換算、最後編輯為準（打折扣價算出%、打%算出折扣價、改定價時依現有%重算折扣價）。程式設值不觸發 input 事件故無迴圈。原 section 補 `data-when-var="single"`（多規格時隱藏）。
- **【B · 多規格＝折扣%、位置移到表格下】** 新增第二個折扣設定 section（`data-cp-show="physical" data-when-var="multiple"`），置於「逐規格定價表」正下方；只放單一「折扣 %」（套用所有規格，無絕對折扣價）＋限時折扣起訖日。與單一規格版互斥顯示。
- **【D · 位置原則】** 折扣設定「跟著價格走」：單一規格＝定價下（現狀）、多規格＝逐規格表下。上架設定（發佈行為）在預覽欄、折扣設定（改價格）留表單，兩者刻意分流。
- 新增 i18n：`cp.sale.percent`、`cp.sale.linkhint`、`cp.sale.pct-allhint`、`cp.discount.enable-pct-sub`（皆 en+zh）。重用 `amount-field--suffix`（既有 % 後綴變體）、`control-row`、`form-grid`、`switch`，無新元件。check_ds_sync 全 PASS（棘輪未超標＝無新裸值；WARN 9 `--shadow-edge-top` 屬 Q18 既有 drift、非本輪）、bump `20260717o`。
- 範圍：本輪只動 create-product（創建頁）。product-detail 的 §2.15 折扣設定同理應套同模型（單一→雙欄、多規格→折扣%），未動＝待辦。

## 2026-07-17 · 建立取貨場次 modal 反饋三輪：改頁籤式 dialog（B 反饋導入 · C 撤除 · UIA-059）

依使用者反饋（參考 Mobbin：Vapi「Create Structured Output」等頂部分頁 dialog——頁籤可自由切換、非 1→2→3 步驟）把共用「建立取貨場次」popup（`partials/pickup-session-modal.js`）從「三塊 `--muted` 填色面板疊直」改成「頂部三頁籤自由切換」。動機：只有三區、填色面板偏重且暗色下仍顯笨重；頁籤一次只看一區、無捲動、無步驟壓力，分區交給頁籤底線承載。

- **【B · 版面改頁籤】** F1/F2/F3 三區改成 `.tabs`＋`.tab-panel`（重用既有 Tabs 元件，不新造）三頁籤：基本資訊／取貨項目／密碼；移除段內重複 H3（頁籤標籤即區名）。pickup.css 加 glue：`[data-pks-panels]` 保 `min-height:248px` 免切換塌陷、`.pks-panel__intro` 為取貨項目頁引言、面板內 `.field__label` 維持 14px regular（沿用原 modal 節奏）。
- **【B · 藏欄位驗證路由】** 取貨項目頁加 `.tabs__item-count` 即時計數徽章；按「建立」時驗證，若未加項目或起訖時間顛倒，自動跳到出錯的頁籤（解掉頁籤把必填藏起來的取捨——藏在別頁的錯不會沉默）。「無草稿、需 ≥1 項才可建立」（D112）仍以停用建立鈕落地。
- **【C · 撤除 `.form-section--modal`】** 同日上一輪為此 modal 新增的 `--muted` 填色面板變體，改頁籤後無任何消費者，從 `form-section.css` 移除；`design-system.html` 該 demo 改成退場說明、`design-system.md` 條目同步。
- **【B · 頁籤標籤 i18n】** 新增 `pks.tab.{basic,items,scanner}`（en+zh，短標籤）；移除改版後不再被引用的 `pks.sec.{basic,scanner}` 與 `pks.sec.items`（`pks.sec.items.sub` 仍作引言保留）。
- check_ds_sync 全 PASS、cache-bust bump。淺色暗色皆截圖驗證。

## 2026-07-17 · 上架設定移到商店預覽下＋改 radio-list（新元件）（B 反饋導入，接續 D144）

依使用者反饋，把「上架設定」從表單流程搬到右側「商店預覽」欄（預覽卡下方），並把選法從分段控制（segmented）換成新的輕量單選列（radio-list）。動機：預覽窄欄放水平三段軌太擠；「何時上架」與「買家看到的樣子」擺一起語意最順；選法上，上架時機是「資料選擇」而非 segmented 定義的「視角切換」，radio-list 語意更對。使用者從三案（直式選擇卡／下拉／輕量 radio 列）中選 radio-list（探索稿 `docs/上架設定-位置與選法探索.html`）。此筆更新前一則「上架設定改分段控制」中 segmented 的部分。

- **【D · 新元件 radio-list】** promote `ds-components/radio-list.css`（輕量垂直單選：radio 點＋標題＋可選描述，選中＝填橘點；透明列、hover `--muted`、無卡框；純 token、無裸 hex/rgb/font-size）。DS 頁新增「4.84 Radio list」demo＋TOC＋元件矩陣列，`design-system.md` 補條目。掛入 5 頁＋design-system。
- **【B · 位置（僅創建頁）】** create-product／create-bundle／create-auction 的上架設定從 `.preview-split__form` 移到 `.preview-col`，包成第二張 `.card` 疊在預覽卡下（sticky 欄；窄螢幕 ≤1040px 改堆疊在表單後）。
- **【B · 選法（全 5 頁）】** 上架設定控制由 segmented 改 radio-list：create-product／-bundle／-auction（拍賣為 不開拍／立刻開拍／定時開拍）＋ product-detail／bundle-detail（位置不動、僅換選法，維持全站同一控制長相一致）。選「定時上架／定時開拍」才展開時間欄的行為不變。
- **【C · 移除】** 三創建頁表單內原 `form-section--outlined` 上架設定區塊移除（內容搬到預覽欄）；listing 控制的 segmented 用法退場（segmented 仍保留給視角切換）。
- 新增 i18n：`cp.listing.{none,now,schedule}-sub`、`ca.start.{none,now,schedule}-sub`（各 en+zh，一句描述）。check_ds_sync 全 PASS（棘輪未超標＝無新裸值）、cache-bust bump `20260717k`。
- 風格觀察（未阻斷）：站上 1-of-N 選擇器現有三種——selection-card（grid 大卡）／radio-card（2-up）／radio-list（vertical 窄欄），依版面密度分工；是否需明確分工或收斂已記入 `STYLE-DECISIONS.md` 待裁決（Q17）。

## 2026-07-17 · 建立取貨場次 modal 反饋二輪：combobox 選取＋間距＋文案（B 反饋導入 · UIA-059）

依使用者反饋再調共用「建立取貨場次」popup（`partials/pickup-session-modal.js`）。四點：

- **【B · F2 改單框 combobox】** 原「搜尋框＋兩份常駐清單」改為單一 search-to-add combobox（新元件 `ds-components/combobox.css`，重用 `.tag-input` 欄位＋`.chip`）：已選項顯示為可移除 chip，focus／輸入時彈出下拉建議（取貨商品／活動票券分組、icon＋名稱＋meta），點選加入為 chip、已選項自建議移除、無命中顯示空訊息。F2 標題「加入可核銷項目」→「**加入取貨項目**」，副標改「**至少加入一項商品或活動票券**」。
- **【C · 移除文案】** 刪 F2 舊副標「把取貨商品與活動票券加進本場次…」與底部 stickynote「! 場次至少需加入一個商品或票券才能建立…」（i18n `pks.note` def 一併移除）。最低一項的規則改由 F2 副標承載。
- **【B · F3 改名】** 「Scanner 存取」→「**設置密碼**」。
- **【B · 區段分區改填色面板】** 使用者反饋暗色下 section 沒有區隔——根因是 **pickup.html 漏掛 `form-section.css`／`chip.css`**（modal 的區段與 chip 樣式在此頁根本沒載入），補齊；並把 `.form-section--modal` 由「間距＋細線」改為 **`--muted` 填色面板＋`--border` 邊框＋`--radius-xl`**（`--card` dialog 上細線暗色讀不出，改填色分區，淺暗兩色都清楚）。淺色暗色皆截圖驗證。
- 新元件 `combobox.css` 掛入 pickup／create-product／product-detail／design-system（pickup 另補漏掛的 `tag-input.css`）；DS 頁新增「4.16b Combobox」demo＋TOC＋`design-system.md` 條目。i18n 更新 `pks.sec.items/.items.sub/.scanner`、刪 `pks.note`。check_ds_sync 全 PASS（棘輪未超標）、cache-bust bump。

## 2026-07-17 · 建立取貨場次 modal 分三區塊＋統一搜尋＋死 class 遷移（A spec-derived · D infra · Plan195）

依上游 5.1.5.12 v1.4（§4 歸三個功能塊）重構共用「建立取貨場次」popup（`partials/pickup-session-modal.js`，pickup／create-product／product-detail 三頁共用開啟）；同時修掉 2026-07-11 欄位系統退役後遺留的死 class。使用者反饋：欄位在頁面上「全部擠在一起、沒有視覺區隔」。

- **【D · 死 class 遷移（根因）】** modal STEP 1 表單仍在用 2026-07-11 已退役、無 CSS 定義的 `.payout-field` / `.payout-form-grid` / `.payout-field__label` / `.payout-field__hint`（欄位因此失去樣式、擠成一團＝反饋的根因）；改用 canonical `.field` / `.form-grid` / `.field__label` / `.field__hint`（field-system.css／form-grid.css）。（`partials/restock-modal.js` 殘留同樣的死 class，本輪未動，另記待辦。）
- **【A · 分三區塊】** 依 spec §4 用 `.form-section` 包成 F1 場次基本資訊（名稱／地點／起訖時間／說明）· F2 加入可核銷項目 · F3 Scanner 存取（密碼）；區段標題＋`+` 分隔線提供視覺分區。
- **【A · 統一搜尋加入（spec §4 F2）】** F2 頂部加搜尋框，依名稱即時過濾取貨商品與活動票券兩份清單（`filterItems()`）；純視覺過濾——被過濾掉的已勾選項仍保持勾選並計數；兩清單皆無命中時顯示「沒有符合搜尋的項目」。
- **【D · 新增 `.form-section--modal` 變體】** 頁面版 44px 垂直留白在 modal 太空曠，新增 dialog 用精簡變體（`--sp-20` 內距、區段起點 `:first-child` 去上內距，標題與分隔線不變）；`design-system.html` demo ＋ `design-system.md` 條目同步。
- 新增 i18n：`pks.sec.basic/.items/.items.sub/.scanner`、`pks.search/.ph/.empty`（皆 en+zh）；補 `.pickup-select__row[hidden]` 還原規則（搜尋過濾需要）。check_ds_sync 全 PASS（棘輪未超標＝無新裸值）、cache-bust bump `20260717f`。

## 2026-07-17 · 折扣設定結構化＋上架設定改分段控制（B 反饋導入，接續 D144）

使用者對前一筆 D144 的兩個新區塊給了更明確的互動結構：折扣設定改成「開啟折扣 → 折扣價 →（可選）開啟限時折扣 → 起訖日」的兩層揭示；上架設定改成三選一「不上架／立刻上架／定時上架」分段控制、選「定時上架」才展開時間欄（使用者選定分段控制，非並排卡）。純呈現/互動結構調整，復用既有元件，無新 CSS 元件。

- **【B · 折扣設定兩層揭示（商品）】** create-product／product-detail：主開關「開啟折扣」（`cp.discount.enable`）→ 展開折扣價（`cp.sale.price`，絕對價）＋次開關「開啟限時折扣」（`cp.discount.limited`）→ 展開起訖日。限時折扣關＝常態折扣、開＝只在檔期內套用。JS 用既有 `wireReveal`／`revealToggle` 綁兩層開關。
- **【B · 折扣設定（組合）差異化】** create-bundle／bundle-detail：組合折扣幅度＝定價區既有的「折扣 %」（衍生價，不動），折扣設定區只放一句說明（`cb.discount.note`）＋「開啟限時折扣」→ 起訖日；不設絕對折扣價欄。**組合是否把折扣% 併入折扣設定＝待使用者裁決。**
- **【B · 上架設定改分段控制（三型）】** 三建立頁＋兩細節頁的「上架開關＋定時上架二開關」改為單一 `.segmented` 三選一（商品/組合＝不上架／立刻上架／定時上架 `cp.listing.none/now/schedule`；拍賣＝不開拍／立刻開拍／定時開拍 `ca.start.none/now/schedule`），預設「立刻上架/開拍」，選「定時」才 reveal 時間欄。三選一已含「不上架＝隱藏」，故移除原獨立上架開關（`cp.show`）。create-bundle／bundle-detail 補掛 `segmented.css`。
- **命名／鍵**：i18n 新增 `cp.discount.enable/enable-sub`、`cp.discount.limited/limited-sub`、`cp.listing.none/now`、`ca.start.none/now`、`cb.discount.note`；`cp.sale.price` 值「特價」→「折扣價」、`cp.sale.start/end`／`cb.sale.start/end`「特價」→「折扣」起訖日；`cp.listing.schedule`／`ca.start.schedule` en 縮成「Schedule」。移除孤兒鍵 `cp.sale.activate(-sub)`、`cp.listing.schedule-sub`、`cb.sale.activate(-sub)`、`ca.start.schedule-sub`。check_ds_sync 全 PASS（棘輪未超標）、cache-bust bump（→20260717h）。
- **與規格的分歧（待同步）**：折扣可「常態不限期」與上架三態，較 documents 現寫的「排程特價一定有起訖日／上架開關」更廣，屬 D144 的細化；`documents/5.1.5.1/2/4` 與 decisions 待補一則細化紀錄（尚未同步）。

## 2026-07-17 · 定價瘦身＋折扣設定/上架設定（排程特價・定時上架）三型對齊（A spec-derived · D144）

依 D144 把規格改動落到原型：商品定價只留「定價（現金）＋成本價」，移除原價與 POPCORN 定價單位；三型都補「上架設定」（含定時上架，拍賣叫定時開拍），商品與組合再補「折扣設定 → 排程特價」，拍賣不設。規格已於前一輪同步（`documents/5.1.5.1/2/4/8/9/10`、decisions.md D144、backup_plan Plan210）。全部復用既有元件（form-section／control-row／switch／field／form-grid／amount-field），零新 CSS 元件。

- **【C · 移除原價欄】** create-product 與 product-detail 的定價區刪整個「原價（Original price · if on sale）」欄；三欄 `form-grid--3` 收成兩欄 `form-grid`（定價＋成本）。i18n `cp.original`／`cp.original.if` 移除。
- **【C · 移除 POPCORN 定價單位切換】** create-product 的價格欄（含逐規格表 JS 樣板）由 `amount-field` 互動切換鈕（`<button data-amount-unit>`＋`__chev`＋`data-price-sync`）改回純現金 `$`（`amount-field--readonly`）；刪 `syncPriceUnit()` 狀態機與 `cp-price-unit-note` 換算 hint；i18n `cp.priceunit.*`（title/cash/popcorn/hint）移除。store-settings F6 幣別說明改寫、不再對照 POPCORN。
- **【A · 折扣設定 → 排程特價（商品＋組合）】** create-product／product-detail 新增「折扣設定」區塊＝排程特價開關 → 展開特價價格＋起訖日（商品有絕對特價，取代原價劃線機制）。create-bundle 現有「販售排程」改名回「排程特價」歸入「折扣設定」（反轉 D091），bundle-detail 同步；組合維持開關＋起訖日、**不設特價價格欄**（規格標組合特價來源待確認）。拍賣不設排程特價（競標無固定售價可折）。
- **【A · 上架設定 → 定時上架（三型）】** 三建立頁＋product-detail／bundle-detail 新增「上架設定」＝上架開關＋定時上架（開關→上架時間，`datetime-local`）；拍賣的等價功能為「定時開拍」（`ca.start.*`）。
- **【C · 上架開關由預覽欄併入主表單】** 三建立頁原本在右側 sticky 預覽欄的「Show in my shop」開關移入主表單新「上架設定」區塊、移除預覽欄重複開關（使用者裁示佈局 A）；與細節頁的上架設定分組一致。
- **命名／鍵**：i18n.js 新增共用家族 `cp.discount.title`／`cp.sale.*`（商品＋詳情共用）／`cp.listing.*`（五頁共用區塊標題）／`ca.start.*`（拍賣）；bundle 沿用 `cb.sale.*` 但值由「販售排程」改「排程特價」、移除 `cb.sale.title`。全部新 key 皆 en+zh、經覆蓋檢查（def=1、被 1–5 頁引用）。
- **【D · 元件文件同步】** `amount-field.css` 檔頭註解標明 cash/POPCORN 互動切換隨 D144 退場、切換 chrome 保留為可重用能力（無消費者）；`design-system.html`／`design-system.md` 的 amount-field demo 拿掉 🍿 示範、改「靜態 $＋保留切換」雙例，anatomy／Do&Don't／`[data-amount-unit]` 說明同步。check_ds_sync 全 PASS（棘輪未超標＝無新裸值）、cache-bust bump（20260717e）。

## 2026-07-17 · 黑夜版 midnight 壓暗（v2）＋KPI delta chip＋卡片圓角 16（B 反饋導入 · Q15／Q16）

使用者以總覽為起點裁示採用 midnight 深色風格（`docs/黑夜版風格探索-midnight.html` 測試頁截圖核可；Mobbin 參照 Whop/Posh/Substack）。改動全在元件層與 token 層，**不動任何產品頁 HTML 檔案**（其他 session 正在編輯產品頁，僅外觀經 token 連動）。亮色模式完全不動。

- **【B · 暗色 token 壓暗 v2（`_tokens.css` dark 區塊 14 值，Q15）】** **維持 r2.1 內凹層次語意**：content(surface-page/background) `#191A1A`→**`#0C0D0D`＝最深** → 嵌套襯底 `--muted #272828`→`#161718` → 外殼(surface-shell/sidebar) `#2B2B2C`→**`#1C1D1E`＝明顯亮於 content、包住圓角內凹的 content** → 卡/popover `#303131`→`#212223` → hover `--accent #383839`→`#2A2B2C`；border/input `#3A3A3C`→`#2C2D2E`、border-soft `#2A2A2A`→`#202122`、sidebar-accent→`#262728`、sidebar-active `#444445`→`#303132`。**v1 一度反轉成殼最深/content 較亮且兩者相近，使用者回饋「content 要最深、外殼別太相近」後改回 v2**（維持 r2.1 原制、整體壓暗）。舊值全部留在 token 行註解。
- **【B · KPI delta 升級膠囊 chip（`kpi.css`，Q15）】** `.kpi__delta` 由純色文字改染色膠囊——semibold、`color-mix(status 12%, --card)` 底、radius-pill、`2px --sp-8` 內距；`--neg` 紅色同構。膠囊＝「趨勢指示」新視覺角色（與 Q1 badge 小圓角角色區隔）。全站 15 頁 KPI 消費者連動受益。
- **【B · form-section 暗色配套修正（`form-section.css`，Q15）】** `[data-theme="dark"] .form-section--outlined` 填色 `--muted`→`--card`：壓暗後 `--muted` 與最深的 content 過近、區塊會消失；改 `--card`(#212223) 浮在 content(#0C0D0D) 上、與亮色行為一致（修訂 Q14 暗色部分）。
- **【B · 卡片/面板級圓角 6→16px（Q16，約 40 支元件）】** card／kpi／preview-card／selection-card／radio-card／readiness／notification-matrix／insight-row／table 容器／picker／album-tracks／upload-tile／alert banner·bar／info-banner／store-settings 卡／scanner／vip-card／彈窗 dialog（payout/embed/leave）＋其內容卡，統一到現有 `--radius-xl`(16px)、與 form-section 一致。**控制項維持 6px**（button/input/badge/segmented/field-pill）、下拉浮層維持 `--radius-lg` 8px、清單列/icon 底框/縮圖不動（守 Q1 形狀＝角色）。不引入新圓角值、不違反 Q2。
- **【D · 版本與檔案紀律】** 本輪未主動跑 bump_ver（避免改寫全站 39 頁與別 session 衝突）；**別 session 稍後已 bump 全站到 `20260717f`**，本輪 CSS 改動（內容已變）搭該版號生效。全程**未動 `js/i18n.js`**（別 session 編輯中）與 `js/components.js`（純換皮、資料結構不碰）。
- **影響面**：暗色模式全站外觀連動（sidebar／卡片／彈窗／表單區塊全變深、卡片圓角變柔）；檔案動 4 支 CSS（_tokens／kpi／card／form-section 的暗色與圓角）＋約 40 支元件的圓角行＋4 份文件。回歸抽查 index／e-shop／create-product／product-detail／退款彈窗通過。DS 雙軌（md＋html token 表 v2、Q15/Q16 裁決、kpi/form-section/card/radius 條目、Q9 行）已同步。

## 2026-07-16 · 訂單詳情品項名稱改開「商品快照」popup（A spec-derived · D143）

依使用者指示＋新產品決策 D143，把訂單詳情品項明細的商品名稱從「直連商品管理頁」改為開一個「商品快照（Product snapshot）」popup，呈現下單當時的商品樣貌。規格已同步（`documents/5.1.5.3.1-訂單詳情.md` §2.3.1 導向、新增 §2.7、§3／§5、frontmatter v2.0）與 `documents/decisions.md` D143。

- **【A · 品項名稱改開快照 popup】** 兩個品項的商品名稱連結（`.data-list__title` 內的 `<a>`）由直連 `product-detail.html` 改為 `.od-snap-open`（`data-snap-*` 屬性帶名稱／價格／次分類／描述／所購規格／管理連結），點擊開 `#od-snapshot-modal`、不再跳頁。
- **【A · 商品快照 popup 內容】** 新增 `#od-snapshot-modal`（沿用 `.payout-modal`／`.payout-dialog` 外殼，比照出貨／退款彈窗，零新 modal CSS）：**快照卡**重用建立流程的 `.preview-card`（改餵固定資料靜態渲染，主圖／名稱／單價／描述，限寬 320px 置中）；**訂單欄位**＝所購規格（多規格品項顯示，單規格自動 `hidden`）與次分類；**凍結說明**（`field__hint`，i18n `od.snap.freeze`）；**foot**＝關閉／「管理此商品 →」次連結連回商品管理頁（5.1.5.1）。
- **命名／鍵**：i18n.js 新增 `od.snap.title/variant/cat/freeze/close/manage`，皆有 en+zh。
- **零新元件 CSS**：`preview-card`／`payout-modal`／`data-list`／`field__hint` 皆既有元件，本頁新掛 `preview-card.css`＝新增 in-context consumer。ASSUMPTIONS 補 UIA-058（快照 popup 的呈現層實作選擇，區分於 D143 的產品決策本身）。check_ds_sync PASS、cache-bust bump（20260717d）。

## 2026-07-16 · 訂單詳情配色與元件對比優化（B 反饋導入）

使用者指示「優化 UI 元件與配色」，以訂單詳情頁試做、聚焦配色對比與元件精緻度；元件層改動全站受益，已同步 design-system.md 並跑全站回歸（orders／create-product）確認無破壞。

- **【B · `field__hint` 提亮（元件層）】** 說明文字顏色由 `--muted-foreground` 改 `--foreground-muted`（暗色 #757575→#B9B9B9），全站表單／詳情的淺灰說明字更好讀。
- **【B · `badge--warning` 對比加強（元件層）】** tint 18%→22%、文字 `color-mix` 50%→60% foreground，warning 狀態 badge（如「待出貨」）更清楚，文字色與既有 checkin-stat 黃一致。design-system.md 對應描述行同步。
- **【B · `segmented` 軌道修復（元件層，缺陷修正）】** 原軌道底 `color-mix(--foreground 5%, --muted)` 在深色主題下把軌道提亮到接近彈窗底色（`--card`），加上 active pill 也用 `--card`，整個切換控制融進 popover 背景、看不出是可點控制。改軌道恆用 `--muted`＋加 1px `--border` 界定邊界，落實 design-system.md 既有的「Surface-layer contrast」通則。影響全站用 segmented 的彈窗（退款／出貨）與建立頁。design-system.md class API 描述同步。
- **【B · `.od-amt` 頁面私有收斂】** 負向金額（平台費／支付費）顏色同步提亮；`padding` 裸值 `7px`→`var(--sp-8)` 收斂進 token 刻度。
- check_ds_sync PASS、cache-bust bump（20260717a→b）。

## 2026-07-16 · 訂單詳情 §2.3／§2.4 改用 form-section、依規格項目拆為獨立 section（B 反饋導入）

使用者裁示「設計參照商品細節頁或創建頁、Section 依規格書項目拆分」。把 [order-detail.html](./order-detail.html) 的內容區手法對齊商品細節頁（product-detail）／創建頁（create-product）：每個規格項目＝一個 `.form-section--outlined`、單欄由上到下堆疊。**產品規則不變**，屬呈現結構調整。

- **【B · §2.3 拆三獨立 section】** 上一輪的「一張 `.card` 卡內用 `.od-subhead` 分三小段」改為三個獨立 `.form-section form-section--outlined`：品項明細（§2.3.1）／金額拆解（§2.3.2）／收入對帳（§2.3.3）。每個 section 用 `.form-section__head`（`.form-section__title` 18px＋`.form-section__sub` 灰副標一句），對齊商品細節頁手法。
- **【B · §2.4 買家統一 form-section】** 買家區由 `.card`／`.card__head` 改為 `.form-section--outlined`，與 §2.3 一致。
- **【B · 版面改單欄堆疊】** 移除原 §2.3(span-7)＋§2.4(span-5) 的 `.bento` 並排容器，改為四個 form-section 由上到下堆疊（完全對齊參照頁，使用者選定）。
- **【C · 棄用 `.od-subhead`】** order-detail 頁內 `<style>` 的私有 `.od-subhead`（上一輪新增）整段移除，其角色由 DS 元件 `.form-section__title/__sub` 取代（撤除上一筆 UI-CHANGES 對 `.od-subhead` 的說明）。
- **零新元件 CSS**：`form-section` 為既有 DS 元件，本頁新掛 `form-section.css`＝新增 in-context consumer；`.od-amt`／`.od-qr` 等其他頁內私有樣式保留。
- **命名／鍵**：i18n.js 新增 `od.sec.items.sub`／`od.sec.amount.sub`／`od.sec.recon.sub`／`od.buyer.sub`（四個 section 灰副標）；`od.items.sub.items` 的 en 由「Items」改「Order items」（當 section 標題）。原卡頭鍵 `od.items.title`／`od.items.source` 拆 section 後無元素引用（留存未清）。check_ds_sync PASS、cache-bust bump（20260716zd）。

## 2026-07-16 · 訂單詳情對齊 spec 5.1.5.3.1：品項三子塊、退款改彈窗、退款鈕最終形態、爭議降狀態（A spec-derived · O18／O23／D041）

依 spec 5.1.5.3.1 最新版把原型 [order-detail.html](./order-detail.html) 對齊。**產品規則不變**——D041「v1 不開放創作者主動退款」仍有效、以 feature gate 守；PCR-001 兩軸不混用維持。屬呈現與前端結構調整。

- **【A · §2.3 三具名子塊】** 品項與金額細分卡內加 `.od-subhead` 子標題，分「品項明細 Items（§2.3.1）／金額拆解 Amount breakdown（§2.3.2）／收入對帳 Reconciliation（§2.3.3）」三段，對齊 spec §2.3 子節結構。`.od-subhead` 是 order-detail 頁內**局部 class**（頁面 `<style>`、非 DS 元件），用 token（`--fs-11`／`--fw-semibold`／`--muted-foreground`）、page-specific，不 promote（ASSUMPTIONS UIA-057d）。
- **【A · 退款改彈窗】** 原常駐 card「Refund & dispute」撤除，改為 `#od-refund-modal`——**重用既有 `.payout-modal`／`.payout-dialog` 對話框外殼**（比照 `#od-ship-modal` 標記出貨彈窗，零新 modal 元件 CSS）。彈窗內容：退款範圍 `.segmented`（整筆 Full／部分 Partial）、部分退款用 `.data-list`＋原生 checkbox（`.od-refund-check`，`accent-color: --primary`）勾選品項、`.od-amt` 即時試算退款金額、庫存回補／收入影響／爭議區隔說明用 `.field__hint`。JS＝頁末新增 IIFE（開關比照 od-ship，segmented 切 Full／Partial 分支、checkbox change 重算金額）。
- **【A · 退款鈕最終形態】** 頁首 Refund 鈕（`#od-refund-open`，保留 `data-feat="O18"`）**移除 disabled**、改為可點開退款彈窗＝在預設 full 版本可操作的最終形態；Phase 1 版本仍由 `data-feat="O18"` gate 隱藏＝守 D041「v1 不開放創作者主動退款」。confirm 鈕為 demo（關窗即止；真實退款經 Earnings §7.3）。依使用者 2026-07-16 指示做最終形態（ASSUMPTIONS UIA-057b）。
- **【A · 爭議降為狀態】** 爭議不再是常駐操作區塊——降為 §2.2 Payment·settlement 軸的 disputed 狀態值（示範訂單 #ZT-10482＝Paid、不觸發顯示）＋退款彈窗末尾「爭議區隔」說明（爭議由買家發起、金額凍結待 Earnings 調查 §7.3）。守 PCR-001 兩軸不混用（ASSUMPTIONS UIA-057c）。
- **命名／鍵**：i18n.js 新增 `od.items.sub.items/amount/recon`、`od.refund.select/amount/confirm/cancel/full.note/restock/dispute`；`od.refund.title` 由「Refund & dispute」改「Refund」。舊鍵 `od.refund.sub/body/v1` 已無元素引用（留存未清）。
- **零新元件 CSS**：退款彈窗重用 `payout-modal`／`payout-dialog`／`segmented`／`data-list`／`field__hint`（新 in-context consumer）；`.od-subhead` 為 page-specific 局部 class、無新裸值。BUILD-SPEC §3.2 補退款彈窗 pattern 行＋Status axes 行註記爭議降狀態；requirements-map 5.1.5.3.1 補列。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 費率例外：新增／編輯改彈窗（partial）、Creator 搜尋、支付費唯讀（B 反饋導入）

依使用者反饋，把費率例外的新增與編輯從「行內展開」改成**彈窗（modal）**，並新增 Creator 搜尋（[admin-platform-fees.html](./admin-platform-fees.html)、新檔 [partials/fee-exception-modal.js](./partials/fee-exception-modal.js)）：

- **【B · 新 partial】** 建 `partials/fee-exception-modal.js`（照站上 partial 慣例＝template 字串，由頁面注入 `[data-fee-exc-modal-host]` 並接開關/搜尋/儲存）。復用共用對話框殼 `payout-modal.css`（`.payout-modal`/`.payout-dialog`/__head/__title/__body），零新元件 CSS。
- **【B · 編輯彈窗】** 列表「編輯」不再行內展開，改開彈窗：標題「編輯費率例外 · <Creator>」、Creator 固定不可改、平台費樹（clone 預設樹、有覆寫的維度自動展開、繼承/覆寫 badge、逐葉覆寫）。移除舊的 table detail-row 行內編輯器與 `buildEditor`，改 `renderTreeInto(container, ov)` 回傳 `readOverrides()`。
- **【B · 新增彈窗＋搜尋】** 「＋ 新增例外」開彈窗（add 模式）：頂部 Creator 搜尋框，依名稱即時過濾建議、**排除已有例外的 Creator**；選定後填平台費、儲存即加入清單並記版本。取代原本的 inline `select` picker（刪 `#fee-exc-picker`、孤兒鍵 `fees.exc.pick`）。
- **【B · 支付手續費唯讀】** 彈窗內顯示支付手續費但 `disabled`＋badge「全站統一 · 唯讀」——維持 D141「支付費全站單一、不逐 Creator」產品規則，只有平台費可逐 Creator 覆寫（使用者裁示）。
- **命名／鍵**：新增 `fees.exc.modal-add/modal-edit/creator/search/search-none/payment-locked`。accordion／input 委派仍在 document（涵蓋彈窗內 clone 樹）。
- **瀏覽器實測**：編輯彈窗（標題帶名、支付費唯讀、IP 自動展開 12%／覆寫）、新增彈窗（搜尋過濾＋排除已有例外）、選定→填值→翻覆寫→儲存→關窗＋新列＋版本歷史，全通過、0 console error。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：整頁改三分頁 IA（B 反饋導入）

依使用者反饋，把整頁重整為三個 tab（沿用 `tabs` 元件），並順手清掉「費率版本與生效範圍」擠成一排的混亂 UI（[admin-platform-fees.html](./admin-platform-fees.html)）：

- **【B · 三分頁】** page-intro 下加 `nav.tabs`（費率設定／版本歷史／費率例外），內容拆進三個 `.tab-panel`：**費率設定**＝支付手續費＋平台費預設樹＋版本設定；**版本歷史**＝歷史表（獨立）；**費率例外**＝例外清單＋新增＋行內編輯器。JS 加 tablist 委派切 `tabs__item--active`／`tab-panel--active`。
- **【B · 版本設定去混亂】** 原「目前版本 badge＋生效日 input＋儲存鈕」三者擠一排 `align-items:flex-end`，矮 badge 與高輸入框高低不齊 → 拆兩層：「目前版本」獨立成上方資訊行（標籤＋badge），下方只留「生效時間＋儲存鈕」一排（兩控件對齊）。
- **【B · 委派改 document】** 例外編輯器 clone 樹現位於「費率例外」分頁、與預設樹 `#fee-tree` 分屬不同 section，accordion 展開與覆寫 input 的事件委派由掛在單一 section 改掛 `document`＋守衛（只認 `#fee-tree` 或 `.fee-exc` 內），跨分頁仍運作。
- **命名**：新增 `fees.tab.settings/history/exceptions`；`fees.default.hint` 改指向「費率例外」分頁；例外分頁不再重覆 h4 標題（tab 已標示），刪孤兒鍵 `fees.exc.title`。零新元件（`tabs.css` 既有、僅本頁新掛連結）、零新裸值。
- **瀏覽器實測**：三 tab 切換、例外編輯器跨分頁開啟／accordion 展開／IP 自動展開／新增／儲存／移除／空狀態全通過、0 console error。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：設變改「預設＋例外清單」IA、去 General 命名（B 反饋導入）

依使用者反饋「右上模式切換不好，應該是預設＋可管理的例外清單；名稱不要中英混合」，把逐 Creator 設變（spec 5.1.0.3 F3／D141）從「模式切換＋單選下拉」重構成「預設費率＋費率例外清單」IA（[admin-platform-fees.html](./admin-platform-fees.html)）。產品規則不變（仍是預設＋逐 Creator 覆寫、逐葉粒度），只改呈現與命名。

- **【B · 去模式切換】** 移除 `segmented`（General／設變）與其下 creator 單選 picker。平台費區直接顯示**預設費率**樹（全平台通用，`fees.default.hint` 一行說明），不再需要先切模式。
- **【B · 費率例外清單】** 樹下新增「費率例外」區（`ztor-table`）：每列＝Creator＋覆寫摘要（如「IP 授權金抽成 15%→12%」，>2 項顯示件數）＋編輯／移除（`btn--ghost btn--sm`）；「＋ 新增例外」展開 Creator `select`、選定即加入清單並開啟編輯器；空狀態 `fees.exc.empty`。種子 2 筆（Neon Harbor、Aria Chen）。
- **【B · 行內展開編輯器】** 點「編輯」就地展開該 Creator 的覆寫編輯器（使用者選定的互動）：JS `cloneNode` 預設樹→顯示「來源」欄、每格 `placeholder` 帶預設值（空＝繼承）、填入既有覆寫、輸入即翻「繼承／覆寫」`badge`；儲存收集非空值寫回該例外、append 版本歷史一列（scope＝「例外 · <Creator>」）。開編輯器時**自動展開有覆寫的維度、其餘收合**（都沒有則展開第一個），覆寫一眼可見。accordion 展開改**事件委派**同時服務預設樹與所有 clone 樹。瀏覽器實測：展開/新增/儲存/移除/空狀態/自動展開全通過、0 console error。
- **【B · 去 General 命名】** 全站 zh 介面本就統一用英文「Creator」（Creator 名冊／管理，專有名詞保留原文），保留一致；真正的中英混雜是「General」——刪 `fees.mode.general/override`、`fees.creator.*`、`fees.override.hint`，改用 `fees.scope.default`（預設費率）／`fees.scope.exc`（例外）＋新增 `fees.exc.*`（title/add/hint/empty/pick/col-*/edit/remove/save/cancel/editor-hint/none/count）與 `fees.default.hint`。版本歷史 seed 的 scope 同步改中文。
- **零新元件 CSS**：復用 accordion／ztor-table／select／amount-field／badge／button／form-section；例外清單與行內展開沿用既有 `.fee-tree__panel`＋`[hidden]` 手法與 table detail-row，未新增裸值。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：移除「示意值待確認」提示帶（C 撤除）

依使用者「這個不需要寫上去」，刪掉頁首 `fees.pending-banner` info-banner（[admin-platform-fees.html](./admin-platform-fees.html)）——該句是「給看原型的人」的元資訊、非產品 UI 一部分，正式頁面不會出現。

- 刪 HTML info-banner 區塊＋孤兒鍵 `fees.pending-banner`（zh/en）；本頁已無其他 info-banner 用例，順手移除 head 的 `info-banner.css` 死連結（該元件仍被其他頁消費、非退場）。
- **產品事實不受影響**：「費率數值待產品確認」仍記於 spec 5.1.0.3（§34、F2）與 D141 待確認項，只是頁面不再複誦。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：排版收斂、主次拉開（B 反饋導入）

依使用者「照現在頁面優化排版／結構／UI」，在功能不變下重整版面主次（[admin-platform-fees.html](./admin-platform-fees.html)）：

- **【B · 支付手續費改輕量單列】** 原本一個小輸入框佔一整張大卡、右側大片空白、份量與主角齊平 → 改為單列橫向：標題＋白話說明靠左（`flex:1`）、輸入框靠右，卡高大幅下降，視覺上明確是配角。用既有 `form-section`＋`amount-field`，零新元件。
- **【B · 版本兩卡合一】** 「費率版本與生效範圍」與「版本歷史」原為兩張獨立 form-section（其實同屬版本管理）→ 合併成一張卡：上排放 目前版本／生效日／儲存，下方以 `field__label` 小標「版本歷史」帶出歷史表。全頁卡片由 4 張收成 3 張。
- **【B · 主次分明】** 費率樹維持最大權重＝主角，支付手續費（矮列）與版本卡（中）明顯輕於它；間距／內距沿用 token（`--sp-8/16/18`），零新裸值。
- check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：支付費置頂＋名稱白話化（B 反饋導入）

依使用者反饋「支付費應排第一、名稱要白話」，調整 [admin-platform-fees.html](./admin-platform-fees.html) 資訊順序與用詞，功能與 spec 對應（F1–F5）不變：

- **【B · 支付費置頂】** 支付費由「費率樹尾一列 inline」提升為頁面最上方獨立 section（排在平台費率樹之前）——它是全站最單純的一項（一個數字套所有交易），先給最好懂的，再進複雜的分類樹。
- **【B · 名稱白話化】** i18n `fees.payment.title`「支付費 · 金流商（全站單一）」→「支付手續費」；新增 `fees.payment.sub` 白話註解「不分交易類型，所有交易都收同一個比例」。費率樹標題 `fees.tree.title`「費率樹」→「平台費 · 依交易類型」，與置頂的支付手續費形成對比（一個全站統一、一個依類型分）。
- **【B · 導言重寫】** `fees.lede` 改為一次交代兩種費率（支付手續費全站共用一個、平台費依交易類型分別設）＋生效規則，取代原本只講平台抽成的說法。
- **零新元件、零新裸值**：支付費 section 沿用 `form-section`＋`amount-field`；新增 i18n 鍵 `fees.payment.sub`。spec 5.1.0.3 未釘視覺位置（僅定義支付費為全站單一產品規則），位置屬呈現、不回改規格。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁佈局精簡：去重複資訊、來源欄改設變才顯示（B 反饋導入）

依使用者反饋「佈局不行、有不必要的資訊」，對 [admin-platform-fees.html](./admin-platform-fees.html) 做去重與收斂，功能與 spec 對應（F1–F5）不變：

- **【B · 訊息去重】**「只對之後生效、不回溯」原本講三次（lede＋noretro info-banner＋頁尾 note）→ 只留 lede 一句；刪 F4 區的 noretro banner 與頁尾單一來源 note（單一來源屬規格事實，spec 5.1.0.3 F5 仍在，頁面不需複誦）。「Admin only」banner 也刪——breadcrumb 已標 Admin Creator Studio，屬冗餘；頂部 banner 由 2 條收為 1 條（只留「示意值待確認」）。
- **【B · 來源欄按需顯示】** General 模式下「來源」欄整欄都是「預設」＝噪音 → 該欄（`th/td.fee-src`）General 模式隱藏、切到設變才顯示（繼承／覆寫 badge），General 的樹回歸乾淨兩欄（子類＋費率）。i18n 刪 `fees.source.default`。
- **【B · 區塊收斂】** 模式切換 segmented 併入費率樹 section head 右側（原獨立浮在頁面上，歸屬不明）；creator 選單＋繼承說明併入同 section（說明由 info-banner 降為 text-sub 一行）；支付費由獨立 form-section 收為樹 section 尾的一列 inline（一個輸入框佔一整區太重），刪 `fees.payment.note` 複誦。
- **【B · 文案縮短】** lede、override hint 精簡；i18n 孤兒鍵清除（fees.admin-only／fees.version.noretro／fees.note／fees.source.default／fees.payment.note）。零新裸值、check_ds_sync PASS、cache-bust 20260716s。

## 2026-07-16 · 平台費率設定升級為四維度費率樹＋逐 creator 設變（A spec-derived · BR-NEW-4／D141）

依 spec 5.1.0.3 改寫（D141／Plan204）：平台費率由扁平三列表升級為「電子商店／活動／專案／IP 四維度 × 交易子類葉節點」費率樹，並加 General 預設／設變（逐 creator 覆寫）兩層。原型 [admin-platform-fees.html](./admin-platform-fees.html) 全頁重搭。

- **【A · F2 費率樹】** 四維度以 `ztor-accordion` 呈現可展開樹（複用 accordion 的 trigger／chevron／分隔線；面板改用自有 `.fee-tree__panel` + `[hidden]` 顯隱，**不套 `.ztor-accordion__content` 的 FAQ 高度上限**，避免資料列被 320px 裁切）。每維度展開為 `ztor-table`，逐葉節點一列＋`amount-field--suffix` % 輸入＋來源 `badge`。葉節點：E-Shop（直售實體/數位·組合·拍賣）、Events（現場/線上票券·報名處理費）、Projects（募資/預購/實體回饋/數位回饋）、IP（授權金/版稅/租用）。示意值 15/10/0 等、雙 info-banner 明示待確認。
- **【A · F3 設變】** `segmented`（General／設變）切模式；設變模式顯示 creator `select`（3 個 mock creator）＋繼承提示 info-banner。切到設變時每個葉節點輸入清空、placeholder 顯示繼承的 General 值；輸入值即把該列來源 badge 由「繼承」翻成「覆寫」（`badge--brand`）。覆寫粒度＝逐葉節點（D141）。
- **【A · 支付費】** 全站單一費率獨立一段（不隨維度分葉、設變不影響）。
- **【A · F4 版本】** 版本歷史表改「版本／生效／範圍／調整」四欄；Save 依當前模式（General 或 Override·某 creator）append-only 插一列、更新目前版本 badge（demo，不回溯）。
- **零新元件 CSS**：複用 segmented／accordion／select／ztor-table／amount-field／badge／form-section／info-banner；新增裸值 0（`.fee-tree__panel` 無 CSS、只當 JS hook＋`[hidden]`）。i18n 新增 fees.mode/creator/dim/leaf/source/payment 等鍵。check_ds_sync PASS、cache-bust bump 20260716r。詳見 UIA-054（改寫）。

## 2026-07-16 · form-section--outlined 全站去外框線（保留填色卡）· STYLE-DECISIONS Q14（B 反饋導入）

依使用者裁示：`.form-section--outlined` 的 1px 硬邊界太重，全站去掉外框線、改靠填色卡分區。**取代 Q13 對本元件的「邊框化」部分**（Q13 的 selection-card／radio-cards 邊框不受影響）。

- **【B · Q14】元件層一次改、全站 11 頁 88 處同步**（[form-section.css](./ds-components/form-section.css)）：`.form-section--outlined` 移除 `border`（原 `1px solid --border`），保留背景填色（亮 `--card`／暗 `--muted`）、圓角 `--radius-xl`(16)、內距 `--sp-16`。採用頁：create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry／admin-platform-fees／product-detail／section-test。
- **權重陷阱處理**：改寫成 `.form-section.form-section--outlined`（權重 0,2,0、置於檔案靠後）以蓋過 `.form-section + .form-section` 的 `border-top` 分隔線（同權重）——否則相鄰 outlined 卡頂端會殘留一條線。同時移除已無作用的 `.form-section--outlined + .form-section--outlined { border-top-color }` 規則。
- **零新值**：只刪 border、無新增裸值；填色/圓角/內距/間距皆沿用既有 token。STYLE-DECISIONS 新增 Q14（並在 Q13 標註邊框部分被取代）；DS 文件（md＋html）Form section 條目與 Form assembly 配方已改為「無外框線」。cache-bust bump。

## 2026-07-16 · 商品細節頁多規格「選項」建立後鎖定（暫行）（B 反饋導入）

依使用者指定：商品細節頁（post-creation）的多規格**選項**暫時不允許調整。對齊 spec 5.1.5.1 §2.8「加新選項或新選項值＝受限·產品待確認（D137）」，UI 先保守鎖定，不動產品規則。

- **【B】§2.8 選項建構器改鎖定唯讀**（[product-detail.html](./product-detail.html)）：多規格視圖的選項建構器——選項名稱 `input` 加 `readonly aria-readonly`、選項值 chip 由 `chip--removable` 改 `chip--static`（移除 `chip__remove` ×）、移除「新增選項值」輸入格、「Add option」按鈕與「移除選項」按鈕。只呈現當前選項與值、不可改名/增刪。
- **【B】逐規格表維持可編輯**：各規格的價格／庫存／SKU／單件成本仍可改（對齊 §2.8「各列的價格/庫存/SKU/單件成本可自由編輯」）；新增提示 `product-detail.var.opts-locked` 說明「選項固定、逐規格值可改」。
- **範圍**：只鎖 product-detail（post-creation）；建立商品頁（create-product）的選項建構器不動、建立時照常可建。屬呈現層保守鎖定（ASSUMPTIONS UIA-056），待上游確認 D137 選項編輯規則後再放寬/定案。
- **無新元件 CSS / 無新裸值**：重用既有 `chip--static`；`check_ds_sync` 基準未動；cache-bust bump。

## 2026-07-16 · 商品細節頁改「商品資料驅動」＋補齊數位內容檔各型態（B 反饋導入）

依使用者反饋：商品細節頁的組合切換不該藏在 devtools，應由電子商店清單點開對應商品就呈現「該有的組合」；並把缺的數位次分類內容檔表單補齊。屬**呈現決策＋前端架構**，未動產品規則（組合維度與內容檔形態切換皆為 spec 5.1.5.1 §2.6/§2.7/§2.8/§2.10 明定）。

- **【B】新增 `js/products-store.js`（比照 films-store / ip-bank-store）**：把 e-shop 清單 9 個單售商品各建一筆 mock 資料，帶 `cat`（實體/數位）／`subKey`（次分類）／`content`（數位內容檔形態 video·song·album·membership·document·ip）／`variant`（單一/多規格）／`edition`（不限量/限量）／status/price/stock/cap，及 `albumSeed`（專輯曲目）、`vipName`（卡名）。對外 `window.ztorGetProduct(id)`。
- **【B】`product-detail.html` 改資料驅動**：e-shop 每列 Edit → `product-detail.html?id=<key>`（9 列已接，e-shop.html）。頁面讀 `?id` 查 store，`applyProduct()` 配置整頁——頁首標題/副標/狀態 badge、主分類唯讀顯示、次分類（實體/數位各一 select、依 `data-sub` 選值）、規格模式（單一/多規格版面）、庫存版本（限量/不限量欄位）、價格/庫存、以及 §2.7 內容檔表單。無 `?id`（含底部動態補列）用預設 zine 樣本。
- **【B · C】移除 devtools 的 `pd-cat/pd-var/pd-edition` page-scoped 預覽組**（`ZTOR_DEV_PAGE_GROUPS`／`applyFromDev`／`ztor:devstate-changed` 監聽整段刪除）——組合改由真實商品資料驅動、不再靠 devtools 切換。devtools 的「版本」feature gate（`data-feat`）不受影響。
- **【B · A】§2.7 數位內容檔補齊各型態**（重用既有元件，無新 CSS 元件）：影視/單曲/文檔＝單檔上傳格（標題/提示依 `content` 切 `data-i18n`）；**音樂專輯＝多曲目管理器**（重用 `album-tracks`，見下條 seed）；**會員卡＝卡面自訂器＋即時預覽**（重用 `vip-card`＋`partials/vip-card.js`）；**IP 資產＝素材槽 placeholder**（產品缺口，明確標註、見 ASSUMPTIONS PG-017）。由 `applyContentFile()` 依 `content` 一次顯示一種。head 補掛 `album-tracks.css`／`vip-card.css`，底部補 `products-store.js`／`album-tracks.js`／`vip-card.js`。
- **【B】`partials/album-tracks.js` 加 seed 能力**（State/API 層增強，reusable）：新增 `data-album-seed`（JSON `[{name,meta,type?,lyrics?}]`），init 時建成「已完成」曲目列（重用同一列樣板與 rename/cover/play/drag/delete 互動），供細節頁呈現已存在專輯內容；建立頁不帶此屬性＝維持空狀態、行為不變。
- **代表性樣本（UIA-055）**：逐品的變體列（S/M/L 靜態）、專輯曲目、卡面內容、成本/門檻等為代表性樣本，重點是 realize「該有的版面組合」、非真實逐品內容。
- **無新元件 CSS / 無新裸值**：`check_ds_sync` 5/10/11 基準未動；新增 i18n `product-detail.badge.low2/.soldout`、`pd.cfile.video/song.*`、`pd.cfile.ip.*`；數位次分類 select 重用 `cp.dsub.*`；cache-bust bump 至 `20260716o`。Bundles／Auctions 已各有 detail 頁、本輪不動。

## 2026-07-16 · create-product content 寬度 narrow→wide→mid＋逐規格表貼齊內容，讓多規格＋限量表完整展開又不留過多空白（B 反饋導入）

依使用者反饋：多規格（Multiple variations）＋限量（Limited edition）下，「各規格價格與庫存」逐規格表被 preview-split 的表單欄擠到水平捲動、無法完整展開。

- **【B】create-product body 由 `--narrow`(1000px) 改 `--wide`(1240px)**（[create-product.html](./create-product.html)）：本頁是 `preview-split`（表單欄｜固定 320px 預覽欄＋40px gap），narrow 下表單欄僅約 584px（1000−28×2−320−40），而限量逐規格表 7 欄（規格名／價格／原價／上限／成本／在庫／刪除，`variant-builder.css` 的 `.variant-table--limited`）最小需約 685px → 溢出捲動。改 wide 後表單欄約 824px（1240−56−360），7 欄完整展開仍餘約 140px。
- **復用既有修飾類、零新值**：`--wide` 是 create-campaign 已在用的既有 `.wizard__body--wide`，非新增寬度；`variant-table` 的 `overflow-x:auto` 保留當更窄視窗的保險。DS 文件（md＋html）body-modifier 清單已把 create-product 由 narrow 移到 wide。cache-bust bump。
- **【B · 追加】逐規格表「規格組合」欄不再過寬**（[variant-builder.css](./ds-components/variant-builder.css)，元件層改一次 → create-product／product-detail／DS demo 三處同步）：頁面變寬後，第一欄原本 `minmax(110px, 1.3fr)` 用 `fr` 吃掉所有多餘寬度，導致「S／M」這種短值也被撐得很寬。改法：
  - `.variant-table-wrap` 加 `width:fit-content`＋`max-width:100%`，表格外框貼齊實際內容寬、靠左，不再撐滿表單欄。
  - 第一欄改 `minmax(110px, max-content)`，貼齊內容、保留 110px 下限、不吃滿剩餘寬度。

  限量表因此收斂到約 682px 靠左展開，更窄視窗仍由 `min-width:560`＋`overflow-x:auto` 回退捲動。DS 兩份文件的 Variant builder 條目已補此欄寬行為。
- **【B · 再追加】整頁寬度由 `--wide`(1240) 收到新增的 `--mid`(1140)**（[shared.css](./shared.css)＋[create-product.html](./create-product.html)）：表格貼齊內容後只約 682px，`--wide` 右側留白過多。新增介於 narrow/wide 之間的 `.wizard__body--mid`(1140px)，表單欄變約 704px（1140−56−320−40）＝表格完整展開＋約 22px 餘裕、右側留白大幅收窄。**下限 floor≈1100px**：因固定 320px 預覽欄，再窄（如回 narrow 1000→表單欄 584）表格就會溢出捲動，故收到 mid 而非 narrow。DS 兩份文件 body-modifier 清單新增 `--mid`、create-product 由 wide 移到 mid。

## 2026-07-16 · 商品細節頁改分頁式（tabs）佈局（B 反饋導入）

依使用者反饋：商品細節頁欄位多、單欄長捲不好找，改為分頁式。屬**呈現決策**（5.1.5.1 §3 顯示順序明文為「呈現參考、非約束，由 project-ui-creator 決定分欄／tabs／form-section 形式」），未動任何產品內容、欄位、狀態或鎖定規則。

- **【B】`product-detail.html` 單欄長捲 → 5 tab**，重用既有 DS 元件 `tabs.css`（earnings canonical），**無新元件**：新增 `<nav class="tabs" data-tabs>` ＋各區塊包進 `.tab-panel[data-panel]`。tab 對應——**總覽**（§2.3 銷售摘要＋庫存健康快照〔新〕＋§2.4 專案引用，皆唯讀管理視角）／**基本資訊**（§2.5 素材＋§2.6 資訊＋§2.7 內容檔）／**定價與庫存**（§2.8 規格＋§2.9 價格＋§2.10 庫存——多規格價格/庫存同在逐規格表、單一規格各自獨立欄位，合在同一 tab 才不拆表）／**交付與取貨**（§2.11 取貨＋§2.12 限購）／**關聯**（§2.13 標籤＋§2.14 電影）。
- **【B】§2.4 專案引用自頁面最下移入「總覽」**（唯讀變更影響提示＝管理視角，非日常編輯焦點）；原 markup 原封搬移、DOM 內只出現一次。
- **【B】新增「庫存健康」唯讀快照（總覽）**：用既有 `kpi`＋`badge` 呈現目前庫存/低庫存門檻＋Low Stock badge，右下 `.card__link` 帶 `data-tab-jump="price-stock"` 深連結到「定價與庫存」tab 實際編輯；不新增進度條元件。
- **【B】分頁切換 inline JS**（比照 earnings、無共用 tabs.js）：click 切 `.tab-panel--active`＋`aria-selected`，支援 `[data-tab-jump]` 跨 tab 與 `#hash` deep-link（`history.replaceState`）。See-as-fan 分割預覽（header 按鈕觸發）維持不動、跨 tab 皆可開。
- **產品內容零改動**：11 個 §2.x 區塊只重新分組進 tab-panel，欄位/選項/驗證/空狀態/D137 三鎖定欄位（主分類 `#pd-main-cat`／規格模式 `#pd-var-mode`／庫存版本 `#pd-edition`）與 devtools page-scoped 預覽（`ZTOR_DEV_PAGE_GROUPS`／`applyCat`／`applyVis`／`syncLocked`）邏輯全數保留（元素只是移進 panel，`document` 範圍查詢照舊生效）。
- **無新元件 CSS / 無新裸值**：`check_ds_sync` 5/10/11 基準未動；新增 i18n `product-detail.tab.*`（5 tab 標題）＋`product-detail.health.*`（庫存健康快照）雙語；`tabs.css` 補掛 head；cache-bust bump 至 `20260716k`。

## 2026-07-16 · Wizard header 左上返回箭頭＋標題合併為單一返回按鈕（B 反饋導入）

依使用者指定＋Figma node 781:4142：建立流程頂欄左上「返回箭頭（`.wizard__back`）＋標題塊（`.wizard__top-titlewrap`）」整組視為一顆返回按鈕，hover 套圓角膠囊底、點標題也回上一頁。

- **【B】只改 `shared.css` 一支、不動任何消費頁 markup**：`.wizard__top-lead` 升為膠囊面（`position:relative`＋`--radius-lg` 8px＋內距 `8/16/8/8`〔`--sp-8`/`--sp-16`〕），常態透明、`:hover` 套 `--accent`（Q9 互動 hover 統一色）；padding 用等量負 `margin` 抵銷 → 箭頭維持原位、hover 不位移。icon 與標題間距 `--sp-14`→`--sp-12`（對齊 Figma）。以上圓角/底色/內距/間距數值全照 Figma 781:4142。
- **【B】命中區與焦點環用 stretched `::after`**：實際可點/可聚焦的仍是內層 `.wizard__back` `<button>`，新增 `.wizard__back::after{position:absolute;inset:0}` 撐滿整個 lead（inset 以 `position:relative` 的 lead 為基準）→ 點標題等同點返回；`:focus-visible` 焦點環畫在 `::after` 上（`--ring`）。移除舊的小方塊 `.wizard__back:hover` 底色。
- **涵蓋 10 個 wizard 頁**（create-product/-bundle/-auction/-project/-event/-campaign、register-ip、funding-simulate〔`fc-back-arrow`〕、admin-ip-bank-entry、funding-test/create-campaign）——元件層改一次全數生效，markup 零改動。
- **無新元件 / 無新裸值**：全用既有 token，`check_ds_sync` 5/10/11 基準未動；`design-system.md` Wizard frame 條目已補行為描述；cache-bust bump 至 `20260716j`。

## 2026-07-16 · 電影關聯精修：拆獨立 section＋可搜尋（promote film-picker 元件）（A 規格同步）

依上游 5.1.5.2 v6.2／5.1.5.1 v1.22／D140（電影關聯自 §4.4 拆為獨立小節 §4.5、加電影名稱搜尋），同步 r2.1。

- **【A · D140】create-product 電影關聯改獨立 section**：原本電影關聯欄併在「Buyer limits & tags」共用設定 section 內，改為**自己一張 `form-section--outlined` 卡**（標題 Linked movies＋副標），對齊 spec 把 F12 拆成獨立 §4.5。
- **【A · D140】promote 共用元件 `partials/film-picker.js`（可搜尋多選）**：兩頁的電影選取邏輯抽成單一 JS 元件，**建於既有 tag-input＋chip 之上、無自帶 CSS**——`.tag-input__entry`(type=search) 即時過濾候選、建議 `.chip-group` 點選加入、已選 `.chip--active.chip--removable` 移除；候選來自 `window.ztorFilms`。API `window.ZTOR_PARTIALS.createFilmPicker(host,{selected,onChange})`。create-product 掛空選取、product-detail 掛預設示意 2 部，取代前一版兩頁各自的 inline 渲染。design-system.md 元件表新增 Film picker 條目（指向 .js）。
- **【A · D140】搜尋（BR-NEW-1）**：新增 i18n `films.search`（placeholder「搜尋電影名稱加入…」）／`films.suggest`／`films.none`；candidate 多時可打字定位，只在既有候選內過濾、不新建電影。
- **無新元件 CSS / 無新裸值**：film-picker 純 JS 復用 tag-input＋chip，check_ds_sync 5/10/11 基準未動；cache-bust bump 至 `20260716i`。移除兩頁舊 inline 電影程式碼（cp-films chip-group 迴圈、pd-films 渲染 IIFE）。

## 2026-07-16 · ztor eShop 新需求落地：商品電影關聯（BR-NEW-1）＋Admin 平台費率設定頁（BR-NEW-4）（A 規格新增）

依上游新規格 5.1.5.2 §4.4 F12（v6.1）／5.1.5.1 §2.14（v1.21）／新頁 5.1.0.3／0-設計規格書 §7.1·§3.2.1（v3）與 D138／D139，把兩條新需求實作進 r2.1。

- **【A · BR-NEW-1】商品電影關聯（可多部、選填）**：
  - 新增 `js/films-store.js`——前台已上架電影 mock（6 部），A/B 兩頁共用的候選來源；電影是前台實體、不在 CS 管理，此處只建立商品→電影引用（呈現假設記 UIA-052）。
  - `create-product.html` §4.5 共用設定區新增「電影關聯」欄：`.chip-group#cp-films` 由 films-store 動態渲染可點 chip，toggle `chip--active` 即多選（沿用既有 chip / chip-group 元件，無新元件）；收集陣列 `linkedFilms`。films-store 於該頁首個 IIFE 前載入以確保 `window.ztorFilms` 就緒。
  - `product-detail.html` 於 §2.13 標籤與 §2.4 專案引用之間新增「§2.14 電影關聯」區塊：已關聯以 `chip--active chip--removable` 呈現（預設示意 2 部）、下方 suggested chip 群可加入，空狀態 hint；與 §2.4 專案引用（未上架電影）明確區隔。
  - i18n：新增 `cp.films*`／`pd.films*` 鍵（en/zh）。
- **【A · BR-NEW-4】Admin 平台費率設定頁（第四個 Admin 目的地）**：
  - 新增 `admin-platform-fees.html`——仿 `ip-bank-reporting.html` 目的地外殼（breadcrumb＋page-intro＋app 頁框），內容為可編輯設定型：Admin-only + 待確認雙 info-banner、F2 費率表（`ztor-table` + `amount-field--suffix` % 可編輯輸入，示意值 15/10/2.4，全標「產品待確認」不寫死承諾）、F3 費率版本與生效範圍（目前版本 badge＋生效日期＋Save，儲存即發版 demo：append-only 插入版本歷史、既有列不動＝不回溯）、版本歷史表。全用既有元件（form-section／table／amount-field／info-banner／badge／page-intro），無新元件 CSS。
  - `js/sidebar.js` 三處掛第四目的地（`ADMIN_ROUTES`／`ADMIN_NAV`｛icon `percent`｝／`FULL_ROUTES`）；`js/icons.js` 新增 `percent` icon；i18n 新增 `admin.platform-fees` 與 `fees.*` 鍵。
- **【A】收益拆解 E22**：earnings 頁既有實作（Breakdown tab＋F12 waterfall＋費率版本引用，`data-feat="E22"`）已涵蓋，scope-map 由 TBD/blocked 解成 Next；本輪只驗收、未改頁面。
- **無新元件 / 無新裸值**：三件事全部復用既有元件與 token，`check_ds_sync` 檢查 5/10 基準未動；cache-bust 統一 bump 至 `20260716h`。費率確切數值、per-creator/IP 覆寫、電影候選前台介接屬產品/工程缺口（記 ASSUMPTIONS UIA-052／UIA-053），原型不宣稱為正式行為。

## 2026-07-16 · 商品細節頁：D137 建立後固定不可編輯欄位鎖定＋銷售摘要去框＋素材附圖移次行（A 規格同步＋B 反饋導入）

依上游 5.1.5.1 §2.6/§2.8/§2.10（v1.20）與 D137，把「建立後固定不可編輯」的三個欄位在 `product-detail.html` 改成唯讀呈現、不可切換；並依使用者版面反饋去掉銷售摘要外框、把素材附圖移到主圖下方一行。

- **【A · D137】三欄位鎖定（呈現層唯讀）**：
  - 主分類 `#pd-main-cat` 改 `disabled` select（唯讀呈現目前值、不可切換）＋下方鎖定 hint。
  - 規格模式 `#pd-var-mode`、庫存版本 `#pd-edition` 兩個 segmented 改 `segmented--locked`（`aria-disabled="true"`＋各 `__btn disabled`）——維持當前模式的 active 高亮、整組不可點＋下方鎖定 hint。
  - 三者共用新 i18n `product-detail.locked.hint`（en `Fixed after creation`／zh `建立後不可變更`）。
  - 後端訂單約束（上限≥已售、已售規格不可刪、數位改次分類受限）屬工程、不在原型強制（記 ASSUMPTIONS）。
- **【A · D137】demo 替代版面預覽改走開發者工具**：鎖定後頁面固定樣本值（zine＝實體／單一規格／不限量），設計師看不到數位／多規格／限量版面。於 `js/devtools.js` 新增**通用 page-scoped 預覽開關機制**（`window.ZTOR_DEV_PAGE_GROUPS` → Cheat Codes 面板渲染單選組 → `ztor:devstate-changed` 的 `detail.pageOpts` 派給頁面），product-detail 註冊三組（主分類 實體/數位、規格模式 單一/多規格、庫存版本 不限量/限量），驅動 `data-pd-cat`/`data-when-var`/`data-when-edition` 顯隱並同步鎖定 segmented 高亮。其他頁未設定即不渲染、零影響。
- **【B】銷售摘要去 section 外框**：由 `form-section form-section--outlined` 改成裸露 `.pd-sales`（無卡框）；第一行三個 KPI bento 並排（`bento--span-4`×3，Units sold／Gross／Net after fees，net-meta 收在 Net 格內），第二行「View sales & revenue log →」右下小型文字連結；保留 when-data／when-empty 兩態與 Source · Earnings。移除與 Source 重複的 `product-detail.sales.hint` 呈現（i18n 鍵保留）。
- **【B】素材附圖移次行**：Media 的 `.upload-showcase` 加新修飾 `.upload-showcase--stacked`（實體＋數位版都套）——主圖第一行、附圖列第二行（不分寬度），取代原橫向並排。
- **JS 重構**：管理 IIFE 的 `wireSeg` 只保留 delivery（可互動）；var/edition 不再 wire（改鎖定）；新增 `applyCat`（含更新 disabled select 顯示值）、`syncLocked`（鎖定 segmented 高亮）、`applyFromDev`（讀 devtools pageOpts）；移除舊獨立主分類切換 IIFE。限購 toggle／標籤／delivery segmented／規格列／補貨 modal／See as fan 照舊。
- **元件層新增（promote，同步 DS 文件）**：`segmented.css` 加 `.segmented--locked`；`upload-tile.css` 加 `.upload-showcase--stacked`；`input.css` 加 `:disabled` 狀態（靜音底＋not-allowed）。三者皆已同步 `design-system.html`（demo＋spec 表）與 `design-system.md`（Class API／States 條目）；input `:disabled` 狀態缺口註記已更新為已補。全用既有 token，未新增裸值（check_ds_sync 5/10 基準未動，PASS）。

## 2026-07-16 · 商品細節頁改 form-section 風格＋依 D136 §3 頁面佈局重排（B 反饋導入）

依上游 5.1.5.1 §3 頁面佈局（D136）＋使用者版面反饋，把 `product-detail.html` 全部區塊從 `.card` 改成建立商品頁的 `form-section form-section--outlined`（`.form-section__head > .form-section__title + .form-section__sub`），並補掛 `ds-components/form-section.css`；顯示順序重排成 10 節。

- **全區改 form-section 風格**：Sales summary／Product content／Content file／Variations／Price／Stock & restock／Delivery & pickup／Purchase limit／Product tags／Referenced by projects 十區一律 outlined form-section，標題結構統一；各區內部欄位（KPI bento、upload-showcase、spec-row、variant-builder、amount-field、segmented、control-row、switch、tag-input、data-list）原封不動。
- **新顯示序（§3）**：銷售摘要首排獨立一區（不再與專案引用並排）→ 商品素材＋商品資訊並列同一區 → 數位內容檔案（獨立節，僅數位）→ 商品規格 Variations → 價格 → 庫存與補貨 → 取貨與交付 → 每人限購 → 商品標籤 → 專案引用置底。
- **銷售摘要入口降級**：「View sales & revenue log →」由整寬 outline 按鈕改成右下角小型文字連結（`.card__link`＋`--fs-12`，`flex-row` 靠右），符合 §3「次要入口」呈現參考。
- **素材＋資訊並列**：用 `bento` 兩欄（`bento--span-6`×2）——一欄 Media（實體主圖組／數位封面組，保留 `data-pd-cat` 雙版），另一欄 Title＋主分類＋次分類＋描述＋詳細規格（僅實體）；窄螢幕自動疊。
- **拆節**：舊 Price & stock 卡拆成「價格」與「庫存與補貨」兩節；舊 Delivery & buyer settings 卡（`#pd-settings`）拆成「取貨與交付」「每人限購」「商品標籤」三節；數位內容檔案自 Product content 卡移出成獨立節。
- **JS 掛勾保留**：settings 段入口由 `getElementById('pd-settings')` 改判 document 範圍錨點（`#pd-limit-toggle`／`#pd-delivery`），限購欄位 `[data-pd-limit-fields]` 改 `document.querySelector`；`wireSeg('pd-edition'/'pd-delivery'/'pd-var-mode')`、`applyVis()`（document 範圍）、標籤（`#pd-tags-field`/`-entry`）、補貨 modal、規格列、取貨場次、See as fan 拆節後全部照舊運作。清掉主分類切換 script 過時註解「2 體驗（採實體版型）」。
- 新增 i18n（en+zh）：`product-detail.content.sub`／`.price2.title`／`.price2.sub`／`.stock2.title`／`.stock2.sub`／`.delivery2.title`／`.limit2.title`／`.limit2.sub`；標題重用 `product-detail.sales.*`／`.content.title`／`.ref.*`／`cp.cfile.*`／`cp.var.*`／`cp.tags`／`cp.optional`／`product-detail.inv.sub`。全用既有 token／元件，未新增元件 CSS、未新增裸值（check_ds_sync 5/10 基準未動）。

## 2026-07-16 · 商品細節頁重排＋補原價/成本/規格；E-Shop 數位樣本補齊（A 規格同步）

依上游 5.1.5.1 §2 13 節新順序（D133／D134／D135）重排 `product-detail.html`：

- **銷售摘要前置（D134）**：把 Sales summary（改 `bento--span-7`）與 Referenced by projects（改 `bento--span-5`、保留 `data-feat="S24"`）搬到 page-intro 之後成為第一個 bento；原內部 markup（when-data／when-empty、KPI、資料列）原封不動。Product content 卡改為緊接其後的獨立 `card mt-16`。
- **移除 Experiences 主分類（D133）**：`#pd-main-cat` 刪掉 `Experiences & Events` option，只留 Physical／Digital；主分類切換 JS 以 `selectedIndex===1` 判 digital，不受影響。
- **新增 §2.8 商品規格 Variations 卡（D135）**：僅實體（`data-pd-cat="physical"`，切數位整卡隱藏）。重用既有 `variant-builder.css`／`segmented.css`／`chip.css`——規格模式 segmented（單一/多規格）＋多規格時的選項建構器（示範選項「Size / 尺寸」＋值 chips S/M/L＋「新增選項」outline 鈕，示範未接功能）＋逐規格表（靜態 3 列 S/M/L，欄：規格組合／價格／庫存／SKU／單件成本，價格與成本用現金 `$` 前綴 `amount-field--readonly`、無 POPCORN 切換；上限欄限量才顯示，示範從簡）。JS 擴充既有 settings 那段的 `applyVis`／`wireSeg` 加 `data-when-var`（預設 single、建構器隱藏）。
- **價格補原價/成本（D133）**：Price & stock 卡的價格區由單一 Price 改三欄 `form-grid--3`＝價格 $24.00 ＋原價 $30.00（`cp.original`／`cp.original.if`）＋成本價 $9.00（`cp.cost`／`cp.cost.note`「僅自己可見」）；三欄一律現金 `$` 前綴 `amount-field--readonly`、不帶 POPCORN 定價單位鈕（POPCORN 本專案維持未啟用）。Stock／低庫存門檻改置於其下獨立 `form-grid`（2 欄），欄位內部 markup 與 feature-gate 原封不動；Edition／補貨紀錄不變。

`e-shop.html` Products 清單調整為「草稿置頂 → 實體各列 → 數位各列」的 demo 呈現順序：把原本夾在實體列中間的 Coastline EP（Album）移到實體列之後，並新增音樂單曲（Song，`music`）、電影（Movie，`film`）、會員卡（Membership，`id-card`）三列數位樣本；最終數位順序＝單曲 → 電影 → 專輯 → 會員卡，四類覆蓋數位次分類。不動 `applyFilter()`／`pinDrafts()`。

新增 icon `id-card`（REGISTRY 補，path 取自 icons-all）。新增 i18n 鍵（en+zh）：`cp.var.single-note`、`e-shop.rowSong.*`、`e-shop.rowMovie.*`、`e-shop.rowVip.*`；其餘（`cp.var.*`／`cp.original`／`cp.cost*`／`cp.optional-cap`／`e-shop.row3.*`）全數重用。全用既有 token／元件，未新增元件 CSS、未新增裸值（check_ds_sync 10 未動基準）。

## 2026-07-16 · radio-card 邊框化＋標記精修（對齊 Figma node 781-4386）（B 反饋導入）

- `.radio-cards`（不限量/限量、規格模式、取貨方式等二選一卡）卡面由 `--shadow-card` 陰影改 1px 純邊框 `--border`、扁平無陰影。
- 選中標記精修（對齊 Figma node 781-4386）：已選卡**移除橘色 outline 外框**（只留灰邊框）；radio 標記由「橘外圈＋橘心」改成**置中小橘實心點、無外圈**；**未選卡不再顯示灰圈**（無可見標記）。卡距維持 `--sp-12`。
- 元件層改一次，consumer（create-product／-auction／-bundle／bundle-detail）全部生效。併入 STYLE-DECISIONS Q13。同步 design-system.md（E2 階梯、Pillar 3 陰影例外、radio-card 條目）、design-system.html（radio-card demo＋spec 表）。全用既有 token。

## 2026-07-16 · 型別選擇卡邊框化 ＋ form-section 外框對齊 Figma（B 反饋導入）

- 對齊 Figma node 781-4166（商品類型 section）。`.selection-card--icon`（create-product／create-event 的型別卡）由 `--shadow-card` 陰影改成 1px 純邊框 `--border`、扁平無陰影；卡片間距由 12 收成 8（`.selection-grid:has(.selection-card--icon)`）；已選仍是橘色 outline 線框。base `.selection-card` 其他用途（拍賣 kind／組合 edition／主題 swatch…）維持陰影，不受影響。
- `.form-section--outlined` 外框全站改圓角 `--radius-xl`(16px)／內距 `--sp-16`（原圓角 6／內距 32）；影響所有採用頁（create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry／section-test）。使用者裁示全站統一。
- 對應 STYLE-DECISIONS Q13。同步 design-system.html（icon 變體說明）、design-system.md（變體表＋form-section 條目）。全用既有 token，無新增裸值。

## 2026-07-15 · E-Shop 工作列暗色分隔陰影改純黑（B 反饋導入）

- 暗色模式下 `.eshop-list-topbar` 的下緣分隔陰影由白色微光 `rgba(255,255,255,0.12)` 改純黑 `rgba(0,0,0,0.45)`，色相與透明度對齊同頁低庫存橫條的 `--shadow-header` 暗色值，兩塊分隔陰影一致。
- 沿用 topbar 原本 `0 6px 14px -4px` 的下緣偏移幾何，只換顏色；同步更新該區塊註解。頁面內嵌樣式，未動 CSS/JS 資產、不需 bump 版本。

## 2026-07-15 · 預設主題定為 Dark（B 反饋導入）

- theme.js `cycle()` 循環起點由 light 改 dark（dark → light → system → dark）；fallback 本就為 dark，此次僅對齊起點與註解措辭。
- devtools（cheat code）Theme 選項改為 Dark 排第一並標「（預設）」，System 去掉「（預設）」字樣，讓面板呈現與實際預設一致。
- 純預設值／選項順序調整，不動任何視覺 token、元件或版面；既有訪客的 localStorage 偏好仍以其上次選擇為準。

## 2026-07-15 · Admin IP Entry Owner lookup 與待寄送邀請原型（A 規格同步）

- 新增 owner-lookup SiteSpecific component（CSS + vanilla JS），以同一 Owner 輸入搜尋 sample Ztor directory 的名稱、username 與 email；結果顯示身份三要素，選取後為 Linked。
- 有效但尚未註冊的 email 可建立 Pending invitation；同一待邀請 email 會被阻擋重複建立，清單與 Reporting 仍以既有 Linked／Pending 狀態呈現。
- 原型只將 invitation metadata 存入 localStorage，成功語意為已建立／待寄送；不查正式帳號、不寄送 email。對應 D132。

## 2026-07-15 · 建立流程統一為區塊式表單（B 反饋導入）

- create-product、create-auction、create-bundle、create-event、create-project、register-ip 與 admin-ip-bank-entry 的 wizard sheet 統一使用 `--surface-page` 底色；每個指定的表單群組採 outlined section。
- outlined section 以 `--card`／黑夜 `--muted`、`--border` 組成，所有可見區塊間以 `--sp-24` 留白；跨越條件顯示的 `[hidden]` 區塊時不留下空白。
- 只調整呈現層與區塊容器，既有欄位、條件顯示、驗證與 JavaScript 行為不變。

## 2026-07-15 · Admin IP Bank 補齊導覽脈絡（A 規格同步）

- 在既有 `page-intro` 前補上 Admin Creator Studio → IP Bank 的 Breadcrumb，明確標記目前頁並提供回到 Admin 起始目的地的連結；重用既有文字連結與 token，不新增 CSS 或視覺元件。

## 2026-07-15 · Admin IP Bank Reporting 補齊導覽脈絡（A 規格同步）

- 在既有 `page-intro` 前補上 Admin Creator Studio → IP Bank Reporting 的 Breadcrumb，明確標記目前頁並提供回到 Admin 起始目的地的連結；重用既有文字連結與 token，不新增 CSS 或視覺元件。

## 2026-07-15 · Admin IP Bank Reporting 頁首收斂（B 反饋導入）

- 移除 Reporting 頁首的非操作 badge，保留既有 `page-intro` 標題與說明層級；頁首無操作時不建立空的 actions 區，與其他 Admin 頁的既有頁首規則一致。報表的唯讀權限、KPI 與 Owner／Platform 分潤資料均維持不變。

## 2026-07-14 · Admin Creator Studio 的 IP Bank 與 Reporting（A 規格同步）

- 新增 `admin-ip-bank.html`、`admin-ip-bank-entry.html`、`ip-bank-reporting.html`，分別對應 Admin IP Bank、建立 IP Entry 流程與 IP Bank Reporting 規格。
- `sidebar.js` 將 Admin 三個同層目的地固定為左側欄導覽與 active state；Artist Creator Studio 導覽不加入 IP Bank 後台。
- `admin-ip-bank-entry.html` 採既有單頁建立 shell：Content／IP details／Owner／Share 四個表單群組、頂部儲存與底部取消／提交，作為 Admin 子流程而非 Artist 導覽頁。
- Reporting 的 Film、起始日期與結束日期收為同一操作列；變更篩選重繪 F3／F4，並在 KPI 與列表間保留明確垂直間距。
- `ip-bank-store.js` 以 localStorage 提供原型用跨頁 mock data；正式 settlement／payout 規則未由 UI 推定，詳見 ASSUMPTIONS UIA-049。
>
> **排序慣例（2026-07-02 起）**：新條目一律加在**最上方**（新→舊）。更早的紀錄（2026-05-25 ～ 2026-06-24）已移至 [UI-CHANGES-archive.md](UI-CHANGES-archive.md)。

## 2026-07-14 · 白天 App Shell 再降一階（B 反饋導入）

- **外層層次加深**：`--surface-shell` `#F5F5F3` → `#F0F0EE`，讓 app 外層比 `main` 的 `--surface-page #FAFAFA` 更明確退後；`--card #FFF`、`--surface-page #FAFAFA` 與所有 dark token 不變。

## 2026-07-14 · 全頁版本切割（D infra · 使用者裁決）

- `feature-scope-map.md` 未列的產品功能改為 Phase 4-only：頁級 `data-page-feat="full"`、區塊級 `data-feat="full"`；`devtools.js` 內建安全 fallback、低版本直連回 E-Shop、動態連結與 `sidebar.js` 導航不再露出完整功能入口。funding-test 保持同 Phase 4。
- 補齊已列 scope：S11 拍賣頁級 gate、S45 組合限量、E13–E18 收入來源 chip／列表／Overview source gate；E09 Overview panel 於 P1 隱藏。

## 2026-07-14 · 白天 Form Section 外框三階層（B 反饋導入）

- **明確分層**：正式 opt-in `.form-section--outlined` 在白天使用最亮的 `--card #FFF`；其外為 `main` 的 `--surface-page #FAFAFA`，再外為 `app` 的 `--surface-shell #F0F0EE`。黑夜維持 `--muted #272828` 填色與 `--border #3A3A3C` 外框。`admin-ip-bank-entry.html` 為目前採用流程，`section-test.html` 保留作視覺驗證。

## 2026-07-14 · 白天 Shell／Page Surface 降低明度（B 反饋導入）

- **只調整兩層外框面**：當時 `--surface-shell` `#FAFAF8` → `#F5F5F3`，`--surface-page` `#FFFFFF` → `#FAFAFA`；後續 shell 再調為 `#F0F0EE`。外層 App Shell 與建立流程的 route page 保留原本層次、降低整體白亮度。`--background`、`--card`、元件樣式與 dark token 不變。

## 2026-07-14 · 主題偏好跨頁保存＋Section 外框測試（B 反饋導入）

- **主題偏好恢復**：`theme.js` 改讀合法的 localStorage light／dark／system 值，沒有偏好時預設黑夜；`?theme=` 為優先、但不寫入的當頁覆寫。使用者切換淺色或黑夜後，換頁仍保留選擇；所有可到達 HTML 的靜態初始 theme 改 dark，避免白色首幀。
- **外框先做 opt-in 視覺驗證**：`form-section.css` 新增 `.form-section--outlined`，使用 `--muted` 填色與 `--border` 外框；暗色實際對應 #272828 填色與 #3A3A3C 邊線。新增 `section-test.html` 供切換主題／URL override 檢視；後續由 `admin-ip-bank-entry.html` 成為首個正式採用流程。
- **設計系統與追蹤文件同步**：Form section 的欄位節奏統一記為基礎 gap 6／欄距 16，移除舊的 4／26 說法；BUILD-SPEC、ASSUMPTIONS、requirements map 的 D108 固定淺色現況改為本輪決定。

## 2026-07-13 · Create Product 元件尺寸與 Icon atom 對齊（B 反饋導入）

- 套用 PR #101 的實質元件調整：Upload tile 的自製 SVG／文字 `＋` 改為 Lucide、select 改用 `.select-wrap` 的 Lucide chevron、icon 增加 12／20／24px 語意尺寸、filter tabs 與 icon button 對齊密度。
- Input 改為 1px 陰影邊線與 4px focus glow；卡片仍保留主分支的 1px border、無陰影，按鈕 hover 仍用 `--accent`。
- 此輪只改呈現層與元件文件，Create Product 的產品流程、文字語意與資產清單不變。

## 2026-07-13 · 訂單匯出移至篩選工作列（A 規格同步）

- `orders.html` 的 Export 自 F1 訂單摘要頁首移到 F2 訂單篩選上排，與搜尋並列；功能不變。規格書與需求對照同步。

## 2026-07-13 · Info banner 密度與圓角修正（B 反饋導入）

- **回歸緊湊資訊元件尺度**：`.info-banner` 字級 16px → 14px、圖示 24px → 20px、圖示間距 16px → 10px、內距 16×20px → 10×12px。原先過大的比例使單句說明看似頁面公告，與「情境資訊提示」角色不符。
- **圓角 token 修正**：`--radius-shell`（28px，app 外框專用）改為 `--radius-lg`（8px，緊湊面板）。同步更新 Design System 文件與展示；手機為 13px 字級、18px 圖示。

## 2026-07-13 · Stickynote 全站改為中性 Info banner（B 反饋導入 · 元件替換）

- **元件語意與視覺重置**：移除橘色 `.stickynote`，改為 `.info-banner`。全站 32 個提示保留原本的產品文字與位置，統一改成中性灰底、細邊框、較大圓角與圓形 `info` 圖示，符合使用者提供的參考樣式；不再把說明文字誤傳達成警示。
- **共用層同步**：新增 `ds-components/info-banner.css`，移除 `stickynote.css`；所有頁面、彈窗、Dashboard 元件與 `design-system.html` 改載入新檔。`design-system.md`、`design-system.html`、`BUILD-SPEC.md` 更新元件角色與 token 說明。

## 2026-07-13 · 兩處使用者反饋修正：交易表展開箭頭移到列尾 + stickynote 字色可讀（B 反饋導入）

- **earnings 交易明細 `.ztor-table` 展開箭頭移到列尾獨立欄**：原 `chevron-right` 內嵌在「日期」儲存格最前，把 `Nov 24` 擠到換行。改法——箭頭移到每列最後新增的 `.ztor-table__chevcell`（右對齊、32px 寬），表頭補一個等寬 `<th>` 對齊，日期欄加 `.ztor-table__datecell{white-space:nowrap}` 不再換行；詳情列 colspan 6→7。展開互動（點列 rotate 90°＋顯示 waterfall 詳情）不變。`ds-components/table.css` 移除 chevron 的 `margin-right`、新增兩個 cell class；`design-system.html` demo 表與 `design-system.md` 條目同步改成「列尾 chevron」。
- **`.stickynote` 字色白→深**：橘色便利貼 callout（create-product 等 7 頁用）原本 `color: var(--primary-foreground)`（白字），在淡橘底（`color-mix(--primary 32%, --card)`）上讀不清。改成 `var(--foreground)`，隨主題翻轉（白天深字、夜間白字），兩模式都清楚。

## 2026-07-13 · 風格微調（taste／minimalist／soft 三方體檢後，使用者選定落地）（B 反饋導入 · 純 token 層）

用 `taste-skill`（產品 UI 只取可轉用維度）＋`minimalist-skill`＋`soft-skill` 對 r2.1 體檢，做成 `docs/風格微調體檢-視覺化.html`（current↔proposed 對照）。使用者逐條選定後落地。全部集中在 `ds-components/_tokens.css` 的 token 值調整，零元件結構變更。

- **文字純黑→off-black**（三方共識）：`--foreground` `#000000`→`#1A1A1A`；`--muted-foreground` `#737373`→`#6E6E68`（微暖）。純黑殺層次，off-black 更柔、對比仍遠超 AAA。dormant 的 `--card-foreground`／`--popover-foreground`／`--accent-foreground`／`--sidebar-foreground`（零消費、元件一律吃 `--foreground`）維持 `#000000` 不動。
- **底色微暖＋邊框更淡**（三方共識）：`--surface-shell` `#F5F5F5`→`#FAFAF8`（暖 off-white，讓白卡靠色階浮出）；`--border`／`--input`／`--sidebar-border` `#E5E5E5`→`#EAEAEA`。
- **陰影柔化**（minimalist §7「shadow <0.05」／soft「柔擴散 ambient」）：`--shadow-card`、`--shadow-float` 改成更擴散、更低透明（保留極淡 rim 維持輪廓）。只影響仍用陰影的浮層／強調卡（下拉、彈窗、selection-card hover），不動 Q3 的預設卡純邊框。
- **暗色校準**（taste §8「兩模式層級對等」，補 STYLE-DECISIONS 的暗色落差）：暗色 `--status-success`／`--chart-3` `#00A63E`→`#4ADE80`（原本反向變暗、與其他狀態色方向相反，屬漏調；Paid 綠徽章在深底才讀得清）；補上暗色缺的 `--overlay-tint`（`rgba(0,0,0,0.6)`，深底遮罩要更濃）與 `--gradient-brand`（拿掉亮色淡膚起點 `#ffd9a0`，深底才讀得出漸層）。
- **使用者未採用**：主按鈕對比（維持白字，未改深字／深橘）、卡片柔浮陰影基調（維持純邊框）、double-bezel 巢狀卡。
- design-system.md／.html／ds-index.md 同步新 token 值；check_ds_sync 全 PASS；bump_ver → **20260713b**。

## 2026-07-13 · 風格裁決 Q1–Q12 全數落地（A spec-derived · 含 C 撤除）

`STYLE-DECISIONS.md` 累積的 12 題「同一視覺角色站上有兩種以上做法」經使用者逐題裁決後一次全站落地。視覺化圈選版 `docs/風格裁決-視覺化.html`。此輪只動呈現層（token／元件 CSS／少量頁面 class），零產品行為變更。

- **Q1 形狀＝可否互動的線索（文件化）**：可篩選/可點膠囊（chip、filter-tabs）＝全圓；純顯示徽章（badge、field-pill、metric-pill）＝小圓角矩形。規則寫進 design-system。CSS 本已如此，本輪只補明文。
- **Q2 圓角統一 6px**：`--radius-md` 由 7px 改成 `var(--radius)`（6px 別名，不 churn 67 處呼叫點，視覺同全量合併）；`.btn--icon-circle` 裸值 `9999px` 改 `var(--radius-pill)`。
- **Q3 預設卡＝純邊框（C 撤除陰影）**：`.ztor-card`／`.card`／`.kpi` 由 `--shadow-card` 改 `border:1px solid var(--border)`（平、editorial）。可點/浮起強調卡（`.ztor-card--clickable` hover、`.selection-card`）保留陰影。`.preview-card`／`.event-preview-card` 本為純邊框、維持。
- **Q4 控制項＝真 border**：`.input/.textarea/.select`、`.ztor-metric-pill`、`.switch` 由陰影模擬邊框改真 `border:1px solid var(--border)`（與 2026-06-12 outline 按鈕決定一致）；input focus 改 `border-color:--ring`＋3px 柔光環；switch knob 內移 1px 補償 border-box。
- **Q5 hover 浮起規則（文件化）**：可點卡片 hover 借陰影浮起；清單列/表格列 hover 只換底色（見 Q9）；純預覽/展示卡不做 hover。
- **Q6 表單節奏統一 16px**：移除 `.form-section .field` 的垂直節奏覆寫（原 gap 4px／欄位間距 26px 裸值），改吃基礎 `.field`（6px／16px）。「長流程用 24」折衷未採用（可選）。
- **Q7 卡片內距對照表（文件化）**：維持各自密度（kpi 16/18、card 20、ztor-card 24、selection-card 14/16、empty-card 32/24），整理成表寫進 design-system，未來新卡對號入座。
- **Q8 品牌橘收斂**：`.settings-nav__item--active` 由品牌橘 tint 改中性灰 `var(--sidebar-active)`，向 `.app-sidebar` 看齊（橘只留給主操作/主分類）。
- **Q9 hover 底色統一 --accent（C 撤除 --secondary）**：全站互動 hover 由散落的 `--muted`／即席 `color-mix` 灰統一成 `var(--accent)`（約 30 處，跨 button/chip/dropdown/list/table/tile/nav/wizard 等）；`--muted` 僅留斑馬紋/襯底。零消費的 `--secondary`／`--secondary-foreground` token 自 `_tokens.css` 亮暗兩區塊退役。**例外**：`.filter-tabs__item:hover` 保留 `--muted`（其 active 也是 muted，hover 不可比已選重）。
- **Q10 關閉鍵 icon 統一 16px**：移除 `.alert__close`(20)／`.leave-dialog__close`(18) 覆寫，回到基礎 `.ztor-icon` 16px。
- **Q11 已付款 Paid ＝ 綠色**：orders.html（3 處）／order-detail.html（1 處）的 Paid 徽章 `badge--neutral`→`badge--success`。
- **Q12 欄位標籤退役大寫孤例（C 撤除）**：`tier-settings.html` 的 `.gate-field__label`（大寫）退役，改用 DS 的 `.settings-row__label`（一般大小寫）；頁內 `<style>` 定義移除，補一條 gate/benefit 標籤↔輸入框 6px 間距。

design-system.md／design-system.html 同步 12 條裁決（卡片/控制項描述改真邊框、Q1/Q5/Q7/Q8 規則新增小節、`--secondary` 從 token 表移除）；check_ds_sync 全 PASS（既有 fan-store 裸色、零消費元件 WARN 未變）；收尾 `bump_ver` → **20260713a**（833 連結、34 頁）。

## 2026-07-11 · 全站元件統一（第三批）：四個新變體元件＋二輪掃描補修＋機械清理（B 反饋導入）

使用者指示「再次把基準三頁的元件推到其他所有產品頁」。三路二輪掃描（表單軸／清單狀態軸／24 頁殘留複檢）＋使用者裁決四項設計判斷後施工。同輪的兩則 payout 收斂另見下方兩條目。

- **四個新變體／元件（三件套齊全）**：`.amount-field--suffix`（右側單位如 %／months，與 `--readonly` 組合）；`.amount-field--hero`（payout 主角級 70px/32px）；`.kpi--success/--warning/--destructive`（只染 `__value` 的色態，status role token）；新元件 **`review-row.css`**（建立流程 Review 摘要列：`__item` > `__head`(`__name`＋`__action`)＋`__value`，另有 `__item--kv` 名值變體）——正規化 create-event `.ce-review-row`、create-project 壓平 `.card`、register-ip `.ri-summary` 三頁各自手刻的同族。
- **create-project 二輪補修**（第一批只改了骨架、金額欄與雙欄結構全漏）：5 個金額欄改 `.amount-field--readonly`（含「Per slot」的 `$200` 烤字串移出為前綴）；6 處「單一 `.field` 塞兩組 label+input 的 inline grid」拆成 `.form-grid`＋雙 `.field`；Review 步驟 9 個壓平 `.card` 改 `.review-row`，頁內 `!important` 壓平規則全數退場。
- **新變體套用**：register-ip 的 %／months 後綴改 `--suffix`（`.ri-affix` 家族退場）、`.ri-summary`→review-row；bundle-detail 折扣 %（`.bd-price-input` 退場）；event-detail 簽到統計三色卡（`.checkin-stats` 退場）改標準 `.kpi`＋色態；create-event `.ce-review-row`→review-row、時間三欄補 `form-grid--3`（第一批漏的修飾類）。
- **scanner.html data-list 標準化**：7 列重排 `__row-main`/`__end` 結構、inline grid 退場（全站 data-list anatomy 至此一致）；核銷互動經瀏覽器實測（篩選／模擬掃描／確認流程正常）。
- **ip-detail 分頁接線**：5 個裝飾性 tab 補 role/aria/data-tab＋切換 JS（照 project-detail 慣例、hash 深連結），內容分組：Overview（含歸屬模糊的「Manage as owner」，已標註）／Terms & usage／Assets（**產品缺口：無資產內容，面板為空**，記 ASSUMPTIONS.md）／Bidding／Owner contact。
- **list-footer 補齊**：projects／events／creators／my-ip 四個 JS 渲染清單頁補「Showing N of M」計數（接各頁篩選函式、空狀態時隱藏），新增 i18n 四鍵（`projects/events/creators/my-ip.footer.count`）；my-ip tabs 補 role/aria。
- **`.data-list__row[hidden]{display:none}` 收斂進 data-list.css**（原為 pickup-detail 頁內臨時規則，display:grid 蓋過 [hidden] 的元件級 bug 正式修復）。
- **store-settings 文件同步＋`.ss-amount` 退場**：規則已無 consumer，自 store-settings.css 刪除（tombstone），DS 兩份文件的欄位型別描述改 `.amount-field`。
- **機械清理**：全站 145 處 `<span class="badge__dot">` 死 markup 移除（24 檔＋`js/components.js` badge() 範本＋payout-request-modal.js；badge.css 規則與 DS 頁棄用說明保留）；15 支「link 了但零使用」的多餘元件 CSS 引用移除（create-campaign ×6、funding-simulate、events、my-ip、order-detail、pickup-detail、e-shop、store-settings；funding-simulate 的 form-section.css 因 `.form-footnote` 在用而保留）。
- **疑似項維持現狀（記錄不動）**：tier-settings spend gate 無 $ 前綴（與 Reputation gate 對稱考量）、頭像上傳兩頁實作不一（無正式元件）、my-ip 清單列尾迷你開關、scanner-result 的 dl key-value、fan-detail「Last active」KPI 字級（需字級變體而非 compact）、create-project 的 checkbox 選擇列（DS 無對應元件）、卡內窄搜尋（pickup-detail/scanner/create-project tier editor 一致待遇）。

- **icon registry 補鍵**：瀏覽器實測抓到 7 個「頁面在用但 registry 漏收、渲染空白」的 icon（inbox／gift／heart／history／store／user-plus／file-check，分布 event-detail、fan-detail、tier-settings、ip-market、register-ip），lucide path 已補進 `js/icons.js`，全站 icon 缺鍵清零。

check_ds_sync 全 PASS（fan-store 裸色 WARN 為既有註記存量）；收尾統一 `bump_ver` → **20260711c**（68 支元件 CSS，review-row 為第 68 支）；ip-detail 兩個產品缺口記 `ASSUMPTIONS.md` PG-016；`requirements-map.md` 無產品映射變化未動。

## 2026-07-11 · `.payout-field` 平行表單家族退場：restock／pickup-session／creators 三個最後 consumer 收斂進 field-system／form-grid／control-row（D infra，純呈現整併，零產品行為變更）

前一則「Earnings payout 彈窗欄位殼收斂」明確跳過 `partials/restock-modal.js`、`partials/pickup-session-modal.js`、`creators.html` 三個 consumer，本輪補做，`.payout-field`／`.payout-form-grid`／`.payout-inline-control` 家族全站退場。

- **三檔欄位殼統一**：`.payout-field`→`.field`（`__label`/`__hint`→`.field__label`/`.field__hint`）；`.payout-form-grid`→`.form-grid`。`restock-modal.js` 的「補貨方式＋供應商／到貨／備註」單據層、`pickup-session-modal.js` 的場次表單、`creators.html` 內建的建立 creator 表單皆改用新殼。三檔皆未曾實際使用 `.payout-inline-control`（`payout-modal.css` 裡的舊註解誤植，全站 grep 確認零 consumer）。所有 JS `querySelector` 走 `data-*` 屬性，class 改名不影響綁定；文案與 `data-i18n` key 零變動。
- **宿主頁補 `<link>`**（版本沿用該頁既有 `?v=20260711a`）：`e-shop.html`／`pickup.html`／`creators.html` 補齊 `field-system.css`／`form-grid.css`／`control-row.css` 三支；`product-detail.html`／`create-product.html` 各補 `field-system.css`（`form-grid.css`／`control-row.css` 已在）；`pickup-detail.html` 補齊三支。`design-system.html` 本來就三支俱全，未動。
- **`ds-components/payout-modal.css` 完全退場**：刪除 `.payout-form-grid`／`.payout-form-grid--single`／`.payout-field`(`__label`/`__hint`)／`.payout-inline-control` 四組規則（零剩餘 consumer），留 tombstone 註解指向 `field-system.css`／`form-grid.css`；同步修正 `@media (max-width:720px)` 內殘留指向舊 class 的響應式規則，改為 `.payout-dialog .form-grid`（範圍收在 modal 殼內，不影響頁面其他 `.form-grid` 用法）——這條規則在上一輪改名後其實已失效（選擇器對應不到任何元素），一併修正。
- **`ds-components/restock-modal.css` 精簡**：移除 `[data-restock-modal] .payout-field[hidden]{display:none}` 頁面局部覆寫——`field-system.css` 本身的 `.field[hidden]{display:none}` 已通用涵蓋（該檔已補 link 進兩個宿主頁），不需重複定義。
- **`creators.html` 順手清理**：狀態 badge 的 `<span class="badge__dot">` 死 markup 移除（該子元件 2026-07 起 `display:none` 棄用，僅此頁殘留字面 markup；其餘頁面另行處理不在本輪範圍）。
- **`design-system.html`／`design-system.md` 同步**：4.61 Payout 段落 prose（英/中雙語）改為「全部四個 consumer + creators.html 皆已收斂、舊 class 零 consumer、規則已從 payout-modal.css 移除」；4.62 Restock demo 卡的 `.payout-field`/`.payout-form-grid` 手刻 markup 改用 `.field`/`.form-grid`；`design-system.md` §4.29 Usage 段落同步、§4.29c Restock anatomy／Token usage／Dependencies／CSS 補上 field-system.css／form-grid.css。
- **已知殘留、本輪未動**：`pickup-detail.html` 原本就未 link `payout-modal.css`（modal 殼本身的樣式來源缺失），本輪只補齊 field-system／form-grid／control-row 三支，未動 payout-modal.css 缺口——與本次退場任務無關的既有缺口，留待後續處理。`BUILD-SPEC.md`／`ASSUMPTIONS.md` 中對 restock 的 `.payout-field` 描述屬歷史記錄未同步改寫（僅 design-system.md／html 屬本輪同步範圍）。

check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；未 bump 版本（版本沿用既有 `?v=20260711a`，未新增 CSS/JS 檔）。

## 2026-07-11 · Earnings payout 彈窗欄位殼收斂進 field-system／form-grid／control-row／amount-field--hero（D infra，純呈現整併，零產品行為變更）

前一則「2026-07-10 全站元件統一」批次收尾時明確跳過「earnings payout 平行表單系統」，本輪補做。`partials/payout-request-modal.js`／`partials/manual-entry-modal.js` 原本各自用一套 `.payout-field`／`.payout-form-grid`／`.payout-inline-control`／`.payout-amount-*`，與全站標準 `.field`／`.form-grid`／`.control-row`／`.amount-field` 平行重複；金額輸入框（彈窗主角級 70px 高／32px display 字視覺）改用 design system 已新建的 `.amount-field.amount-field--hero` 變體承接，退場自刻的 `.payout-amount-*`。

- **兩支 partial 欄位殼統一**：`.payout-field`→`.field`（`__label`/`__hint`→`.field__label`/`.field__hint`）；add-bank／manual-entry 兩個表單網格 `.payout-form-grid`→`.form-grid`（預設 2 欄，欄位數符合）；「設為預設帳戶」／「上傳附件」兩個行內開關列 `.payout-inline-control`→`.control-row`(`__main`/`__sub`)，比照 create-auction 既有寫法。金額框改 `.amount-field.amount-field--hero`(`__unit` $ 前綴 + `.amount-field__input.input`)，70px/32px 視覺與改前等價、數值原樣移植。manual-entry 的「金額＋幣別 select」組合維持不動（無對應的無前綴＋幣別變體，只換外層欄位殼）。所有 JS 綁定走 `data-*` 屬性（如 `[data-payout-amount]`），class 改名不影響選擇器；文案與 `data-i18n` key 零變動。
- **`ds-components/payout-modal.css` 部分退場**：刪除 `.payout-amount-wrap`／`.payout-amount-prefix`／`.input.payout-amount-input`（唯一 consumer 已遷移），留 tombstone 註解指向 `amount-field.css`。**`.payout-field`／`.payout-form-grid`／`.payout-inline-control` 未刪**——全站 grep 發現 `partials/restock-modal.js`、`partials/pickup-session-modal.js`、`creators.html` 仍在用（另有 create-bundle／create-product／e-shop／pickup／fans-crm／order-detail／product-detail 等頁載入 `payout-modal.css` 間接依賴），不在本次改動清單內，保留並加註記說明原因，待後續分次收斂。
- **`earnings.html` 補 4 支 `<link>`**：`field-system.css`／`form-grid.css`／`control-row.css`／`amount-field.css`（此前只有 `payout-modal.css`）。
- **`design-system.html`／`design-system.md` 同步**：4.61 Payout demo 卡改用真身 `.field`／`.amount-field--hero`（移除純展示用的 `.payout-form-grid--single` 包裹，因真實 markup 本來就沒有這層）；compose chips 補 Field system／Form grid／Control row／Amount field；Class API 表兩列改寫並附「2026-07-11 起⋯原為」對照；`design-system.md` §4.29 anatomy／Dependencies／Usage 同步，Usage 段落註明 restock/pickup 兩支 partial 現況仍用舊 class；Pillar 4 表 Amount field 條目與 `amount-field.css` 的 Hero size 註解，語氣從「待遷移」改「已遷移」。

`requirements-map.md` 未動——5.1.8.1／5.1.8.2 兩條只到「已覆蓋哪些欄位」層級，未提及實作 class，本次純呈現整併不影響。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260711a**。

## 2026-07-10 · 全站元件統一（第一＋二批）：以電子商店／建立商品／建立組合為基準，24 頁改用基準元件（B 反饋導入）

使用者指示「以 e-shop／create-product／create-bundle 用到的元件為主，改到其他所有產品頁上」。四路獨立盤點 29 頁得 28 項確定差距，經使用者批准後分七路施工；已對齊免改：orders、pickup、scanner、ip-market（request-payout 為轉址殘頁不適用）。

- **自建骨架歸位**：create-event（`.ce-block`→`.form-section`、`.ce-grid`→`.form-grid`、`.ce-type-icon`→`.selection-card--icon`、`.ce-save-status`→`.wizard__save-status`）；create-project（`.tf-grid`→`.form-grid`、`.card`+`!important` 硬蓋改 `.form-section`／`.form-grid`、2 處無樣式破版的 `.settings-row`→`.control-row`）；register-ip（`.ri-block`→`.form-section`、`.ri-tags` 19 處→`.chip-group`/`.chip`、`.ri-usage` 11 處→`.selection-card`、`$` 前綴 `.ri-affix`→`.amount-field--readonly`）
- **金額欄統一 `.amount-field`（唯讀 $ 前綴款）**：create-auction 起標/保留價、create-campaign 目標金額、product-detail 價格（value 內的 `$`/`USD` 移出為前綴呈現）、settings 撥款門檻（USD 字樣改進 hint，i18n key `settings.pay.min-hint` 雙語擴充）、store-settings 免運門檻（舊制 `.ss-amount` 退場，store-settings.css 內規則已無使用者、待清理）
- **空狀態語意修正**：projects／events／event-detail 誤用 `.empty-stub`（「頁面未建置」佔位符）→ `.empty-card`（icon＋title＋text＋清除篩選 CTA）；fans-crm 單行文字空狀態升級 `.empty-card`；creators `.empty-card__desc`→`__text`（class 錯字，樣式本來沒生效）
- **清單頁工具列**：projects／fans-crm 搜尋裸 input→`.field-pill`；fans-crm 手刻篩選鈕→`.chip-group`（JS toggle 改 `.chip--active`）；events 每列 3 顆常駐圖示鈕→`.dropdown` kebab；my-ip 裝飾性 tabs 接上切換 JS
- **詳情頁**：auction/bundle-detail 9 個 KPI 卡 inline style→`.kpi--compact`；auction-detail `.ad-info__k`／event-detail `.kv-row`→`.data-list`；order-detail 金額掛 `.data-list__amount`、出貨 modal 拆成標準雙 `.field`；pickup-detail 7 列重排 `.data-list__row-main`/`__end` 標準結構（並修復既有 bug：`[hidden]` 被 `display:grid` 蓋過、篩選從未真的隱藏列，頁內補 `.data-list__row[hidden]{display:none}` 待收斂進 data-list.css）；project-detail select 正名＋Actions 卡標題用 `.card__head`
- **失效 token 修復**：create-campaign／funding-simulate 16+6 處未定義變數（`--surface`/`--surface-muted`/`--text-sub`/`--text-strong`→`--card`/`--muted`/`--muted-foreground`/`--foreground`）；三頁 QR 產生 JS 的 `fill="var(--surface)"`→`var(--card)`；驗收時加抓 `pickup.css`／`scanner.css` 共 19 處同源殘留（含 `--success`/`--warning`/`--error`→`--status-success`/`--status-warning`/`--destructive`），修復後全站失效 token 清零（`--surface-shell`/`--surface-page`/`--surface-inverse` 為刻意保留的 [ext] token，不在此列）
- **i18n**：新增 `projects.empty.noresult.clear`、`events.a.more`、`fans.empty.noresult.title`/`.clear` 四鍵（雙語）
- **跳過歸第三批（設計判斷）**：register-ip 的 `%`/月數後綴輸入（amount-field 僅支援前綴）、event-detail 簽到統計卡（需 KPI 色態變體）、create-project Review 摘要卡 9 個的 `.card` 壓平（需 review-row 元件）、earnings payout 平行表單系統、tier-settings 大寫標籤、金額拆解列與 Review 摘要列的跨頁收斂

check_ds_sync 全 PASS（fan-store 裸色 WARN 為既有註記存量）；`bump_ver` → **20260710e**（施工後首 bump d、驗收加修 CSS 失效 token 後再 bump e）；`requirements-map.md` 無產品映射變化未動。

## 2026-07-10 · Design system demo 改用真身元件：Input 家族整併＋field__hint 防呆＋4 孤兒標註＋Card 章節損毀修復＋新增 Section card 條目＋badge__dot 清理（D infra，產品頁視覺零改動）

使用者發現 4.10 Field system 的 demo 間距與 create-product 實頁不同，根因是 DS 頁 demo 長期用一套 `ztor-*` 替身 class（產品頁從未採用）。原則：產品頁視覺是真相、DS 頁改成展示真身。

- **Input 家族整併**：`.input`／`.textarea`／`.select` 規則原住 `shared.css:805-835`，原樣整段搬進 `ds-components/input.css`（屬性值逐字元未動，含非 token 的 `9px` padding）；`shared.css` 原位置留一行指向新家的註解。`input.css` 內未被任何實頁使用的 `.ztor-input`／`.ztor-input--xs/sm/lg/xl`／`.ztor-textarea` 全數移除，檔頭補刪除紀錄。`design-system.html` 4.9 Input 章節 29＋5 處 `ztor-input`／`ztor-textarea` 全改真身：input 用 `.input`、textarea 用 `.textarea`，移除假的尺寸變體 demo，補 `.select`（含原生 chevron，此前從未正式示範）；真身缺 disabled／invalid 樣式，demo 不展示、`design-system.md` 記「狀態缺口：待補」。
- **field__hint 防呆**：`ds-components/field-system.css` 的 `.field__hint` 加 `margin: 0`，讓 p／div 元素選用不影響視覺；`design-system.html` 7 處 `<p class="field__hint">` 改 `<div>`，並修正 `pickup-detail.html:82`（本輪唯一動到的產品頁 markup，改後因 margin:0 防呆視覺不變）。
- **4 個行銷孤兒標註保留**：`ztor-footer`（4.42）、`ztor-cookie-banner`（4.67）、`ztor-accordion`（4.46）、`ztor-metric-pill`（Badge 條目內）在 `design-system.html` 各加一行雙語告示（沿用既有 `.compose__note` 告示樣式）「行銷站遺留元件，admin 後台未使用」，`design-system.md` 對應條目同步加註；內容與 CSS 均未刪除。
- **4.33 Card 章節損毀修復＋拆分**：該章節內容曾重複貼兩次、中間夾一段殘破片段（`</div>n class="sub" id="card">`），已重建為單一正確章節。順勢把混用已久的 `.ztor-card`／`.card` 兩個命名空間拆乾淨：4.33 Card 現只講 `.ztor-card`（產品頁未使用，展示保留，補雙語告示），新增 **4.33b Section card** 條目講 `.card`（產品頁真正在用的區段外框，evidence：e-shop、earnings、event-detail、auction-detail、bundle-detail、my-ip、fan-detail、create-campaign、create-event、create-project），並修掉原 demo 裡 `.card` 誤配 `.ztor-card__body` 的 bug。`design-system.html` 內原本語意上指向「區段外框」卻連到 `#card` 的交叉連結（Chart／Bento grid／Store settings／Chart 家族的 compose-map、4.1 Inventory 表）一併改連 `#card-section`，避免文件自相矛盾；TOC 新增 Section card 錨點。`design-system.md` 同步拆成 4.11 Card／4.11b Section card 兩條目，含界線說明。
- **badge__dot 清理**：Badge 條目（4.3）的 Status pill demo 表格 7 處 `<span class="badge__dot">` 移除（該子元件已 `display:none`，soft-tag 改版後棄用，markup 不再需要）；`design-system.md` Badge 條目補一句棄用說明。
- **驗收後補修（同輪）**：`ds-index.md` 重新生成（原索引仍列已刪的 `.ztor-input*`）；Badge 條目 Do／Class API 兩處說明文字仍在推薦 `badge__dot`，改為棄用口徑；`design-system.html` 其餘散落的死 markup `<span class="badge__dot"></span>`（程式碼範例、empty-stub、status-axes、settings-row、rental demo 共 8 處）全數移除，僅留 Class API 表的棄用說明列；4.10 Field system demo 頭與 `design-system.md` 條目補「單獨預設密度 gap 6／欄距 16 vs Form section 內收緊為 gap 4／欄距 26（form-section.css 情境規則）」交叉說明——這正是使用者比對 4.10 與 create-product 時的第二個困惑來源（第一個是 ztor-input 替身），兩者現都已文件化。產品頁殘留的隱形 `badge__dot` markup（24 檔）不影響視覺，留待日後順手清。

`requirements-map.md`：本輪全屬呈現層元件整併，無產品映射變化，未動。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260710c**。

## 2026-07-10 · 三項 design system 歸位修正：alert--page-top 文件校正＋tabs 短底線變體＋寬度 token 家族（D infra，零視覺變動）

昨日 DS 稽核發現三處歸位問題，已裁決落地：

- **`.alert--page-top` 文件校正**：`ds-components/alert.css` 註解、`design-system.md`、`design-system.html` 對此變體的描述更新為雙情境現況——(1) Events 的 Event Day 情境橫幅（`js/scenario.js` 注入 events.html，由 devtools 情境狀態觸發），用變體基底原樣＝滿版邊到邊；(2) E-Shop 低庫存提醒（`#eshop-stock-bar`），該頁以 instance 覆寫將其收窄、置中對齊內容欄，關閉自帶下緣陰影與 `::after` 角遮罩、改走共用 `.edge-shadow`，屬記錄在案的頁面特例。「邊到邊」是基底行為、保留描述；原稽核「Events 相關頁面查無使用」的前提經核實為誤判（橫幅由 JS 注入、靜態 grep 頁面 markup 看不到）。**e-shop.html 的 alert 相關區塊零改動**。
- **tabs 短底線升級為正式變體**：e-shop.html 頁內覆寫（灰底線關閉＋active 底線縮短置中）promote 成 `ds-components/tabs.css` 的 `.tabs--underline-short`；e-shop.html 的 `.tabs` 改掛此 class、刪除頁內對應覆寫規則（`margin-bottom:0` 屬頁面版式間距，保留頁內）。`design-system.md`／`design-system.html` 同步新增變體說明與 demo，視覺與改前逐 px 一致。
- **寬度 token 家族 `--w-*`**：`ds-components/_tokens.css` 新增 Foundation 寬度刻度 `--w-220`／`--w-300`（欄位／小元件 max-width 刻度，起點兩值、後續按需擴充）；套用於 create-product.html 三處寬度裸值（自訂低庫存門檻欄、限購數量欄、pickup session 下拉的 flex-basis）。`design-system.md` 的 token 表與 `design-system.html` token 展示區同步文件化。

`requirements-map.md`：本輪全屬呈現層，無產品映射變化，未動。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260710b**。

## 2026-07-10 · 補齊 6/25 token 改名收尾：斷鏈修復＋md 表格對齊＋裸值→token＋amount-field 文件修正（D infra）

6/25 token 大改名（`--foreground-subtle→--muted-foreground`、`--surface-rail→--sidebar`、`--surface-rail-hover→--accent`、`--surface-rail-active→--sidebar-active`）與 px→token 遷移收尾有漏，本輪補齊：

- **斷鏈 token 修復**：`product-list.css`、`pickup.css`（6 處）、`scanner.css`（4 處）、`scanner.html`（2 處 inline）、`restock-modal.js`（1 處模板字串）共引用已不存在的 `--foreground-subtle` 14 處，一律換成 `--muted-foreground`（原本樣式實際失效，本輪修復後灰字才真正生效）；`data-list.css` 註解、`design-system.md` 規格文字（§4.90 Product list variants）同步改詞。
- **design-system.md 兩張 token 表舊名清理**：Quick Reference（§0，~76-96 行）與 Pillar 1 Foundation（~145-163 行）表內 `foreground-subtle`／`surface-rail`／`surface-rail-hover`／`surface-rail-active` 四列就地改名為 `muted-foreground`／`sidebar`／`accent`／`sidebar-active`，值與描述保留不變。
- **e-shop.html／create-product.html 裸值→token**：兩頁 6/25 新寫 markup 遺留的裸 px 間距共 12 處，換成對應 `var(--sp-N)`（e-shop.html 的 `margin-top`/`margin-bottom` 3 處；create-product.html `<style>` 區 3 處＋inline style 9 處），寬度類裸值（max-width 等）維持不動。
- **amount-field 文件修正**：`design-system.html` anatomy 表 `.amount-field__unit` 描述由「muted fill／灰底」改為與 `amount-field.css:29` 實作一致的「白底（--card）、hover 淡灰（--accent）」；補文件化 `[data-price-sync]`（標記共用單位群組、前綴固定 46px 置中欄）與 `[data-amount-unit]`（前綴按鈕點擊 hook，頁面 JS 對整組切換 $/🍿）兩個屬性契約，`design-system.md` 的 Amount field 條目同步補一句說明。

`requirements-map.md`：本輪全是呈現層修正，無產品映射變化，未動。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260710a**。

## 2026-07-09 · 對齊 eShop BRD：建立商品加「定價單位切換」＋商店設定幣別四選（A spec-derived）

依 documents 新決策落地兩處（上游：BRD BR-05／BR-13，已寫進 `documents/decisions.md` D124／D125）：

- **create-product 定價單位切換**（spec 5.1.5.2 F3.2／D124）：在價格區塊之前新增一個 `.segmented`（沿用既有元件、非新元件）現金／POPCORN 二選一切換，作用於整件商品（單一與多規格皆然）。切 POPCORN 時價格欄 placeholder 由 `$ 0.00` 換 `POPCORN 0`、隱藏同分類均價提示。**為什麼這樣設計**：規格把 POPCORN 定位為「與現金切換的定價單位」（現金為定價之準、POPCORN 由現金價換算），非並排兩個價格欄；故用單一單位切換而非新增欄位。JS 沿用頁內 `wireSegmented` 助手，i18n 新增 `cp.priceunit.*` 四鍵。**POPCORN 換算率與收款受 OQ-1 閘控＝產品缺口 PG-016**，此切換為探索性佔位、不做換算計算、不宣稱可收 POPCORN。
- **store-settings 幣別重整**（spec 5.1.5.5 F6／D125）：三件事——(a) 幣別由 F2 店面門面抽出成獨立的 **F6 · 幣別**；(b) F6 與付款／出貨並列為**第三個設定 tab**（付款｜出貨｜幣別），原型把幣別 select 從身分帶 meta 行搬進設定群組 tabpanel（`data-ss-tab/panel="currency"`、沿用通用 tab 切換 JS），i18n 加 `store-settings.group.currency`／`store-settings.currency.hint`；(c) 選項由原型自填的 USD/EUR/GBP/JPY/TWD 校正為規格四種 **HKD／TWD／SGD／USD**。**為什麼**：幣別選項集與版面歸屬屬產品決策，依 D125 校正；此為法幣顯示幣別、與商品 POPCORN 單位是兩件事，放同一組 tab 與付款/出貨並列。顯示鎖定方式仍待上游、未在此假設。

---

## 2026-07-09 · 3 組重複頁內樣式 promote 進 design system（D infra，零視覺變動）

稽核發現 create-product / create-auction 兩頁逐字重複破壞性 ghost 按鈕與 footnote 樣式，7 個建立頁逐頁複寫 `.wizard__body` 的頂距與內容寬——皆違反「可重用樣式第一次出現就 promote」鐵律。三組數值全數照抄搬進 ds-components，不改動任何呈現：

- **`.btn--ghost.btn--destructive`**（`ds-components/button.css`）：紅字＋hover 淡紅底，綁 `.btn--ghost` 防止誤掛 `.btn--primary` 做出紅色主按鈕。create-product `#cp-delete`、create-auction `#ca-delete` 改用，刪除頁內 `.cp-delete`/`.ca-delete` 兩組規則（含殘留的 fallback hex，改用 `var(--destructive)` 純 token）。
- **`.form-footnote`**（併入 `ds-components/form-section.css`，不開新檔）：表單底部置中小字（如 Stripe 保障文案）。create-product `.cp-footnote`、create-auction `.ca-footnote` 改掛，數值逐字照抄（margin-top 22px 非 token）；create-campaign 的 `.fc-footnote` 樣式不同，維持獨立不動。
- **`.wizard__body--form` / `--narrow` / `--wide`**（併入 `shared.css` 既有 `.wizard__body` 規則之後）：7 個建立頁（create-product/-auction/-bundle/-campaign/-event/-project、register-ip）刪除頁內 `.wizard__body` 覆寫、改掛修飾類。已知分岔未收：funding-simulate.html（32px 頂距）、funding-test/create-campaign.html（44px 頂距）維持頁內獨立覆寫，不強行統一。

DS 雙文件（`design-system.md`＋`design-system.html`）同步三項新內容；`check_ds_sync` 全 PASS；`bump_ver` 統一 cache-bust。

## 2026-07-08 · 元件 vs Pattern 分類學修正：展示判準＋Pillar 5 中間層配方（B 反饋導入）

使用者發現 4.10 Field system 的視覺展示長得像 pattern（兩個欄位堆成表單）、4.11 Form section 的示範是隨機組合。診斷：Pillar 5 只有頁面級配方，中間層組合規則（表單怎麼堆、modal 殼共用…）無處可放，於是寄生在 Pillar 4 的示範裡造成誤導。整輪修正：

- **立展示判準（§4.0＋design-system.md＋skill）**：元件段視覺展示只展示「該元件單一實例」的變體 × 狀態矩陣；多元件組合示範一律標「實際情境 In context」並連 Pillar 5 對應卡；組合規則只寫 Pillar 5。判斷句：「刪掉這個元件的 CSS，這條規則還成立嗎？」成立 → pattern。
- **4.10 Field system**：展示改為單欄位矩陣（input／switch／textarea 三種槽 × default／+hint／+required），原兩欄位堆疊改標 In context 連 Form assembly 配方；規格表註明「多欄位成組＝Pillar 5，非本元件」。
- **4.11 Form section**：層級 🟡 molecule → 🟠 organism（承載 Field 的組合殼）；展示改「單一區段（unit）」＋「區段相接自動分隔線（form-section.css 自有規則）」兩塊，並註明「哪些區段、什麼順序、放哪些欄位＝Pillar 5 配方，示範欄位只是示意」。inventory 同步。
- **4.30 Filter row**：拆掉展示內嵌的 data-list（那是 Pillar 5 · Filter + list 配方的重演），改為文字指向配方卡。
- **4.82 Pickup management**：原本兩個無關功能（F6 Scanner 存取卡＋F3 取貨多選列）疊在同一示範，拆成兩塊各自標題的獨立展示。
- **4.50 Wizard frame／4.61 Payout**：加指向——殼歸元件段、使用規則歸 Pillar 5（wizard 卡／新 Modal shell 卡）。
- **Pillar 5 擴充＋修 bug**：
  - 修既有表格 bug：Lifecycle 與 Wizard 兩列都少了「Pattern card」名稱格（內容擠進名稱欄）。
  - 新增 4 張中間層配方卡（html 縮圖＋表列、md 完整五欄卡）：**Form assembly**（欄位→區段→表單、26px 節奏、欄位順序識別→內容→設定→風險揭露）、**Settings page**（nav 分組＋列卡、右槽單控件、逐列生效或整卡儲存擇一）、**Modal shell**（canonical `.payout-dialog` 殼＋scroll-lock＋確認閘、絕不自捲新殼）、**Split preview**（右欄壓縮主欄、無遮罩非浮層、關閉還原）。5 → 9 張卡。
- skill 同步：project-ui-creator SKILL.md 元件策略加展示判準條；`_shared/component-inventory.md` §16 加 v9 變更（含「Pillar 5 必須含中間層配方」）。
- 驗證：headless playwright——4.10 矩陣 9 格單欄位＋In context 連結、4.11 organism 標籤＋pattern 連結、4.30 無內嵌 list、4.82 兩塊展示、Pillar 5 縮圖 9 張／表 9 列／0 缺格列、§4.0 判準在、4.50/4.61 指向在；`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260708a`。

## 2026-07-07 · DS 頁優化輪：結構修正＋token 文件化補洞＋15 段矩陣卡化（B 反饋導入 · D infra）

使用者指示「優化 r2.1 的 Design System」，盤點後執行三批：

- **結構修正（`design-system.html`）**：
  - 合併重複文件化的 Search collapse——原 §4.28b（插錯位）與 §4.79 同 id、同元件寫了兩段；併成一段（保留較完整敘述＋雙態標籤 demo），TOC 去重。
  - 修 §4.78 編號碰撞（Spec row／Album tracks 同號）：尾段順推為 4.78 Spec row → 4.79 Album tracks → 4.80 Search collapse → 4.81 VIP card → 4.82 Pickup → 4.83 Scanner。全頁不再有重複編號。
  - 兩個殘留的獨立「變體 ·」區塊照 Split button 前例併入視覺展示：4.45 Tabs 的「變體 · Filter tabs」改為兩張矩陣卡（base × default/:hover/:focus-visible/--active、brand × default/--active），其 Purpose 濃縮進卡頭、Do&Don't 與 Class API 併入主段；4.54 Preview card 的「變體 · Event preview card」併為卡片，整段重構為兩張矩陣卡（.preview-card 含 filled/.is-empty 兩態、.event-preview-card）＋單一 code-fold。
  - 盤點原疑「4.8 Icon 雙 code-fold」經查屬誤判——第一個 fold 是「瀏覽 1683 個未用圖示」圖庫、與開發者 fold 用途不同，保留。
- **token 文件化補洞（含檢查器 bug 修正）**：
  - 修 `check_ds_sync.py` 檢查 9 的通配 bug：`--r1..--r5` 範圍寫法產生 rogue 前綴「-」，等於任何 token 都算已文件化、html 覆蓋檢查形同虛設。加「範圍前綴必須仍是合法 token 形」防呆。
  - bug 修掉後浮出 45 個 html 端未文件化 token，全數補齊：字級表第二欄改記真正 token 家族名（`--type-display-64-*` 等 6 家 ×5=30）；§2.1 補「已定義・待採用」揭露行（shadcn 對齊組：`--chart-1..5`、`--popover(-foreground)`、`--secondary(-foreground)`、`--accent-foreground`、`--card-foreground`、`--destructive-foreground`、`--input`、sidebar 四成員）；狀態色說明補 `--status-accent`；§1.5 陰影表補全 `--shadow-raise-strong` 全名；§2.5 補 `--overlay-tint`/`--overlay-blur` 毛玻璃配方。
  - `design-system.md` 同步：changelog 過期指標修正（`--space-1..16` 已退役非待採用）、Sidebar family 行標注 4 個未引用成員待採用、機器 `_inventory` 移除已退役的 navigation-menu。
- **15 段裸矩陣升級 matrix-block 卡**（比照 §4.2/§4.5 格式，卡頭帶名稱＋用途說明）：4.3 Badge、4.4 Status dot、4.6 Switch、4.8 Icon、4.9 Input、4.19 Selection card、4.22 Segmented control、4.25 Table（兩張）、4.33 Card、4.34 KPI、4.40 NavigationMenu、4.45 Tabs、4.46 Accordion、4.68 Alert。內容值不變、只升級包裝與可讀性；chart 段經查無矩陣（盤點誤標）未動。
- 驗證：headless playwright 實測——15 段卡數正確、獨立變體區塊 0 殘留、search-collapse 唯一、尾段編號連續、TOC 0 斷鏈、filter-tabs pill 正常渲染；`check_ds_sync` 10 項 PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260707b`。

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
