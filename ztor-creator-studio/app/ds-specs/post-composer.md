> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Post composer

#### 總表紀錄（原 §4.1 · Post composer）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[post-composer.css](../ds-components/post-composer.css)

發文框（2026-08-18 promote，自 `progress-timeline.css` 的 `.ptl__composer*`）：**一個發文框、三個落點**——進度時間軸「今天那一格」的內嵌版（`.composer__stub` 收合成一行提示，點了才加 `.is-open`）、「發布更新」彈窗，以及**總覽「進度摘要」卡最上面的收合入口**（2026-08-31 使用者裁示，同日三版定案：先卡頭底下 → 獨立區塊 → 收回卡裡擺最上面）。第三個落點只放收合那一行（`.post-composer--inset`：`.card .post-composer` 整組去面之後，這一行得補回薄膜底＋圓角才讀得出是輸入框），placeholder 用自己的 key `pd-ov.post.stub`（時間軸問「發生了什麼事」、這裡問「要不要發一則更新」）。點了把同一個活的發文框搬到它下面展開——不另做一份欄位。**這個落點沒有位置訊號**，所以類型選「里程碑更新」時要把里程碑下拉打開讓人自己選（`composerHost` 旗標控制；送出時 `patchMilestone` 讀下拉的值）；時間軸的落點仍由位置回答（D197），下拉維持收著。**換分頁要把它還回時間軸**：分頁切換不重繪，不還的話進度分頁那一格會變成空的。兩邊長一樣、行為一樣，差別只有**有沒有位置訊號**：軸上的落點本身就是發文類型的預設值（D197），彈窗沒有位置所以類型與要完成的里程碑都得問一次。promote 的理由——留在時間軸檔裡的話，彈窗要用就得跨元件借樣式，而借來的樣式沒有人負責，改一邊會靜默弄壞另一邊。組成：`__stub` ／ `__head`（`__who` ＋ `__avatar` ＋ 靠右的受眾下拉）／ `__fields`（類型、標題、內文、`__media`［`--image` 160px ／ `--video`・`--audio` 360px］，每塊自帶 `__media-head` ＋ `__media-drop` ×）／ `__foot`（`__tools` 夾帶入口 ＋ `__acts` 取消與送出）。**一則只能一種夾帶**：三種的版面、播放行為與粉絲端呈現都不一樣，允許混用等於要為每一種組合各定一次規則。**名字不叫 composer** 是因為站上已有一支同名元件（AI 產圖那類「拖放或輸入 ＋ 底部工具列與 credit 計量」的輸入卡，根 class 也是 `.composer`）——兩支做的事不同，同名會在 CSS 與 design-system 錨點上直接對撞。**面跟著 `.card` 走**（2026-08-31 換裝補課）：原本寫死 `--card` ＋ 卡陰影，用意是「跟站上的卡同一個面」；換裝時 `.card` 改玻璃、這支沒跟上，拆成獨立區塊後與進度摘要卡上下並排就露餡。改引用 `--ztu-glass-bg` ＋ `--border` ＋ 卡陰影，並補浮層／`html[data-embed]` 的薄膜規則（同 `card.css`／`kpi.css`）。**疊在一張卡裡時整組去面**（`.card .post-composer`）：它是那張卡的內容、不是卡中卡，留著面會在卡裡再畫一個框；`max-width` 一併解除（560px 是給時間軸落點限的行長）。消費頁：project-detail（進度分頁的內嵌發文框＋總覽進度摘要的收合入口）
