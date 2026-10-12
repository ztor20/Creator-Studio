/* ============================================================
   view-mode.js — 兩段式編輯面板的檢視態（退場成相容殼，2026-10-12）

   2026-09-21～10-12（STYLE-DECISIONS Q119）這支在每個控件後面插一顆純文字讀數
   <span class="field-readout" data-vm-readout>，檢視態由 shared.css 藏控件、顯示讀數。

   2026-10-12 使用者裁決改判（STYLE-DECISIONS Q128 選項 B＋甲，UI-CHANGES 一百六十七、一百七十六）：
   全站兩段式面板的檢視態一律是「輸入框留著、顯示成 disabled」——樣子完全由 shared.css 的
   「檢視模式：表單欄位＝disabled 輸入框」區塊給，這支不必再產生任何節點。
   讀數機制、data-vm-group／data-vm-suffix／data-vm-skip 標記、configure(format) 與 opt-in 屬性
   data-vm-style="disabled" 一併失效（殘留在 HTML 上的屬性無作用）。

   為什麼還留著這個檔：各頁（含不在本輪範圍、不能動的 event-detail.html）還有
   <script src="js/view-mode.js"> 與 window.ZtorViewMode.sync(...) 呼叫；留一個同名 API 的空殼，
   順手清掉 bfcache／舊快照帶回來的讀數節點。之後各頁把呼叫拿掉，就可以整支刪除。

   API：window.ZtorViewMode = { mount(scope), sync(panel), configure(panel, opts), syncAll() }（皆為相容用）
   ============================================================ */
(function () {
  'use strict';

  function sync(panel) {
    if (!panel || !panel.querySelectorAll) return;
    panel.querySelectorAll('[data-vm-readout]').forEach(function (ro) { ro.remove(); });
    panel.querySelectorAll('[data-vm-control]').forEach(function (el) { el.removeAttribute('data-vm-control'); });
  }
  function mount(scope) { (scope || document).querySelectorAll('[data-editable]').forEach(sync); }
  function configure(panel) { sync(panel); }
  function syncAll() { mount(document); }

  window.ZtorViewMode = { mount: mount, sync: sync, configure: configure, syncAll: syncAll };
})();
