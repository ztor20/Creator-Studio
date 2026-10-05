/* ============================================================
   RETIRED (2026-10-05) — tombstone, safe to delete.
   info-sections.js：2026-09-29 D334 的說明區塊編輯器（window.ztorInfoSections.mount → { get, set }），
   每一塊＝標題＋內文（內文是 partials/rich-body.js），可新增、刪除、拖曳把手或上下鍵排序。
   2026-10-05 D354 描述改成「區塊」模型，說明區塊整組退場：
     · 拖動排序與鍵盤排序的寫法搬進 partials/rich-body.js（按住把手才可拖、把手聚焦時上下鍵移動）；
     · 舊資料（events-store 的 infoSections、草稿）由 ztorRichBody.migrate() 轉成無標題的文字區塊，
       原標題併進該區塊第一行並設為粗體（D354 決定八）。
   消費者 create-event.html、event-detail.html 已移除本檔的 <script>；原始內容見 git 歷史（2026-09-30 commit 9e7ca8c2）。
   ============================================================ */
