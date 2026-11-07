> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Leave dialog

#### 總表紀錄（原 §4.1 · Leave dialog）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[leave-dialog.css](../ds-components/leave-dialog.css)

建立／編輯流程的返回離開確認彈窗（spec §5.2.4），由 `partials/wizard-chrome.js` 注入、6 建立頁共用。 **2026-09-11 新消費情境**：`e-shop.html` 的「顯示於商店」確認彈窗（D263）直接用這個殼（`.leave-dialog`＋`__scrim`／`__card`／`__title`／`__body`／`__actions`），標題依開／關兩態換句——它是站上唯一的確認彈窗語彙，不另造第二種。兩態同殼：有未存編輯→問儲存（儲存並離開 primary／不儲存就離開 outline）；未編輯→純離開（離開 primary）。頂列無儲存入口的頁面加 `.wizard[data-leave-simple]` 可強制永遠走純離開態（2026-07-31，admin-ip-bank-entry）。`.leave-dialog`[data-open]＞`__scrim`＋`__card`＞`__close`/`__title`/`__body`/（選配）`__list`＞`__list-item`/`__actions`（堆疊滿寬 btn）；Esc/scrim/× 取消。2026-06-29 自 shared.css `.wizard-leave*` promote。**2026-09-18 D284**：新增 `__list`（一列一項、細分隔線、icon＋名稱）放在內文與操作之間，給擋下類彈窗列名稱；封存確認與草稿刪除確認亦用同一個殼——刪除的主鈕換 `.btn--destructive`，封存可逆故維持 `.btn--primary`。**2026-09-18 D288**：`__list` 的兩個 consumer 情境改為——(1) 單售**下架**時仍在上架中的組合包裡：列出組合包、主鈕「一同下架這些組合包」（product-detail.html；D284 時掛在封存、現已搬到下架，封存改為單純確認）；(2) 組合包**重新上架**（D289）：有已下架成員時列出「會一起重新上架的成員」、主鈕「一併重新上架」（確認＝成員連帶重新上架）；有已封存成員時擋下、列出成員、只有一顆「知道了」（取消鈕收起＝純告知）。**2026-09-22（D298）**：擋下內文改「先解除封存這些成員，再上架組合包」——已封存的出口只有「解除封存」（回到已下架、不確認、其他不動），這組重新上架彈窗只從已下架組合包的上架開關進來（bundle-detail.html；e-shop 的已封存列改走解除封存、不再開這組彈窗）。下架確認本身（三種販售管道）也走這個殼、主鈕 primary（可逆）
