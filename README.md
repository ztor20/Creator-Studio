# Site Governance

`site/` 只保存 UI 呈現、設計系統與工程實作。所有版本都遵守同一條權威鏈：

`requirement/` → `documents/decisions.md` → `documents/` → `site/`

- `BUILD-SPEC.md`：該版本的呈現與工程快照。
- `ASSUMPTIONS.md`：呈現假設、產品缺口與實作偏差。
- `SPEC.md`：舊連結相容頁，不是產品規格。

任何 site 版本都不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。發現缺口時先更新 `ASSUMPTIONS.md`，經上游核准後再修改 UI。
