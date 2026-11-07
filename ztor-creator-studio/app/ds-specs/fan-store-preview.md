> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Fan store preview

#### 總表紀錄（原 §4.1 · Fan store preview）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[fan-store.css](../ds-components/fan-store.css)

See-as-fan 內的粉絲端創作者頁（E-Shop F5、商店設定 F1 與三個細節頁預覽面板共用 `partials/fan-store.js`，§6.7 同源）。**2026-09-11 依使用者提供的粉絲端實際畫面重做成手機版鏡像**（做法同商品頁鏡像 §4.22g／D248）：版型與比例照粉絲端搬進來、整支 `zoom: 0.75`、欄寬 270px、不畫手機外框；app bar／底部導航／「情境展示」浮標不進預覽（使用者劃掉）。結構：`.fan-store__page` ＞ `__profile`（頭像＋名字＋身分・所在地・追蹤數＋分享；**所在地 2026-09-14 新增**（D269，設定頁個人資料併入店面）：`__location`＝map-pin＋文字、與身分同一條分隔線節奏，店面沒填就不畫）→ `__bio`（兩行＋更多）→ `__socials`（ztor／IG／Threads／X／TikTok）→ `__ctas`（加入社群＋彩蛋解鎖）→ `__nav`（商店・活動・排行榜・貼文・項目）→ `__featured-row`（精選商品橫列）→ `__tabs`（商品・套組・競標）→ `__grid`（雙欄卡：圖＋`__badge--new/--limited`＋`__heart`＋名稱＋價格）。顏色與間距只用 token——舊版 scoped `--fst-*` 寫死色盤（25 處裸色）退場，§1.5 的 fan-store 裸色例外不再適用。資料：人格決定頭像／名字／身分／追蹤數／簡介，商品卡問 `ProductsStore`（名稱、清單同一套幣別寫法、圖），卡序固定（`CARD_IDS`）供 E-Shop 依上架／顯示狀態收起。`window.ZTOR_PARTIALS.fanStore` 為 getter（讀取當下才組）。**2026-09-11 資料改問 `js/store-profile-store.js`**（頁面有載的話）：頭像／名字／身分／所在地／簡介／社群圓鈕（有填網址的平台才出現、順序照店面設定、ztor 固定第一；可加平台 2026-09-14 多一個「個人網站」＝`world` icon，D269）都從店面資料畫；示範資料仍走 i18n key、使用者打的字用字面值；`storeprofile:changed` 時整份重畫（`remountFanStore`，保留 e-shop 收起的卡）。加入社群／彩蛋解鎖兩顆 CTA 在預覽裡隱藏。**2026-09-11 分頁列重量＋釘頂**（使用者：「指出的部分樣式和原本不同」「下滑的時候有東西置頂在上面」）：`__nav` 改照粉絲端 `.glass-tabs` 量——48px 膠囊、padding 4/10、`--ztu-film` 底、`--ztu-rim-soft` 邊、blur(8px) saturate(1.5)；項目高 40、字 14、不換行（放不下橫捲、捲軸藏起）；選中＝`--primary` 粗體＋只在頂端一線的淡橘漸層底＋左上／右下兩道橘色內光（粉絲端 `--lg-fill-active`／`--lg-shine-active`，以 token 的 `color-mix` 表達）。分頁列住在 `__stick`（sticky top 0）；`partials/fan-store.js` 看到它貼到捲動容器頂緣（往上找第一個會捲的祖先，沒有就是視窗；比對線含容器 padding-top）就加 `.is-pinned`：上方長出 `__minihead`（24px 小頭像＋13px 粗體名字），底下 `::before` 一片帶（出血 12/16/24、70% `--ztu-canvas`→透明、`--ztu-blur-shell` 模糊、下緣 mask 淡出）壓暗滑過的內容——即粉絲端 `.tabstick-host.is-pinned`＋`.creator-minihead`。提案欄位（追蹤數／社群／加入社群／彩蛋解鎖／精選／收藏／分頁列）見 ASSUMPTIONS UIA-026
