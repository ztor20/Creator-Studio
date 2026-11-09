> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Schedule restore

**Pattern** — 用在重新上架彈窗裡，屬 5.1.8 彈窗類型 的實例，見 [5-pattern.md](../ds-pillars/5-pattern.md)。

#### 總表紀錄（原 §4.1 · Schedule restore）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[sched-restore.css](../ds-components/sched-restore.css)

**2026-10-29（D488／D489，UI-CHANGES 四百一十一）**：改成重新上架被擋下時的提示內容，取代 D481 的「恢復原本的排程／不恢復」兩選一（主規格 §7.14「重新上架時檢查保存的排程」）。下架時四個排程時間保存但暫停（`ListingState.unlist` → `entity.paused`）；按「上架」時 `ListingState.relistBlockers()` 檢查開賣、停售、定時下架三種（拍賣：開拍與定時下架；上架時間不查；組合包只查自己、不查成員）：有已過或沒通過既有時間檢查的，本區塊一次列出，一列一個（`.sched-restore__item`：clock icon＋`__what` 哪一種時間＋`__when` 日期與時間＋`__note` 原因「這個時間已經過了」或檢查原因）；多個販售管道時以 `__group` 依名稱分組，`__label` 是段落小標。都沒問題就直接 `relist()`、恢復排程，本區塊不出現。第二種內容（D489）：`memberBlockHTML()` 用同一組 class 列成員有已下架單品的組合包（`__group`＝組合包名稱，列＝package icon＋`__when` 單品名稱＋`__what`「已下架」）。只是內容區塊、不是殼：`partials/relist-restore.js` 的 `block()` 自帶 `leave-dialog` 殼、只有一顆「知道了」（product-detail／bundle-detail／auction-detail／e-shop 清單列，組合包經 `partials/bundle-relist.js`）；event-detail 的 D448 重新上架彈窗用 `blockHTML()`＋`memberBlockHTML()` 放進自己的 `#ed-confirm`；media-vault 的重新上架對話框（`.payout-modal`）最上面用 `blockHTML()`，plan 由 `VaultStore.relistBlockers` 自組、只有下架時間。墓碑：`.sched-restore__choice`（radio-list 兩選一）、`.sched-restore__item--skip`（不會恢復的刪除線列）與 `ask()`／`bindChoice()`／`skipOf()` 退場。demo 卡見 `design-system.html` §4.77a
