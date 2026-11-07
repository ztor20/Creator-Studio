> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Fact list

#### 總表紀錄（原 §4.1 · Fact list）

- `_layer`：🔵 atom
- Status：✓ App
- CSS：[fact-list.css](../ds-components/fact-list.css)

唯讀事實列（2026-08-19 建）：左邊欄目名、右邊值、一項一行、髮絲線分隔（`.fact-list` ＞ `.fact-list__item`，兩個 `<span>` 分別是名與值）。給詳情彈窗這類「回答問題、不能編輯」的內容用。**不用 `.field`**——表單標籤是「等你填」的語彙，唯讀內容穿上它會讀成一張被停用的表單；**也不用 `.data-list`**——那支給「一列一個東西、可能可以點進去」的清單，有 40px 圖示磚與較大行高，事實不是物件，八項排出來每一項都被放大成獨立的東西。與 `.review-status__meta`／`.ptl__meta`（行內流式、適合一兩項附註）的分工：本支一項一行、值靠右，適合五項以上要逐行對照。消費頁：project-detail（更新詳情彈窗）
