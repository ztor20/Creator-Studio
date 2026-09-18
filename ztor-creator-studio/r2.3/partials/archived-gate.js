/* archived-gate.js — 封存態唯讀的事件層閘門（spec 0-設計規格書 §7.14「封存與不可刪除」· D284／D288，2026-09-18）
   規格：封存後細節頁全頁唯讀，涵蓋所有分頁與逐列操作（選項組合逐列的上架與鎖定、關聯、標籤），不只主編輯入口（D288）。
   為什麼有這支：三個細節頁（product／bundle／auction-detail）原本各自「藏掉會改資料的入口」——藏得到的才擋得住，
   D288 盤點到逐列「⋯」的上架開關與鎖定、關聯分頁的選片器三個漏洞都是「沒藏到」。本閘門在事件層（capture）
   多擋一道：頁面根節點帶 data-archived 時，凡是會改資料的控件，click／keydown／input／change／beforeinput 一律
   在到達頁面 handler 之前攔下。既有的隱藏／停用保留（雙保險），漏藏一個也不會改到資料。
   純 vanilla、無自帶 CSS。用法：
     window.ZtorArchivedGate.install(rootEl, { block: '<extra selectors>', allow: '<extra selectors>' })
   rootEl：帶／不帶 data-archived 的頁面根（通常是 .main）；判斷是即時的，封存／重新上架切換不必重裝。
   block：除預設清單外，本頁還要擋的選擇器（逗號分隔）；allow：永遠放行的選擇器（例如「重新上架」鈕、確認彈窗）。
   consumer：product-detail.html、bundle-detail.html、auction-detail.html。 */
(function () {
  'use strict';
  /* 預設擋：所有輸入控件、開關、分段選擇、單選卡、chip 的 ×、選片器的加入／移除、上傳格、連結欄的重置 */
  var DEFAULT_BLOCK = [
    'input', 'textarea', 'select', '[contenteditable]',
    '.switch', '.segmented__btn', '.radio-list__item', '.radio-card', '.zcheck',
    '.chip__remove', '[data-fp-add]', '[data-fp-remove]', '.tag-input__entry',
    '.upload-tile', '[data-upload]', '[data-linkf-reset]'
  ].join(',');
  /* 預設放行：導覽與查看類——分頁、章節導覽、連結、下拉的 summary（開選單看查看類項目）、確認彈窗、搜尋唯讀清單 */
  var DEFAULT_ALLOW = [
    'a', 'summary', '[role="tab"]', '.tabs__item', '.section-nav__item', '[data-tab-jump]', '[data-rowdis]',
    '.leave-dialog', '.leave-dialog *', '[data-archived-allow]', '[data-archived-allow] *'
  ].join(',');

  function matches(el, sel) { return !!(el && el.closest && sel && el.closest(sel)); }

  function install(root, opts) {
    if (!root) return null;
    opts = opts || {};
    var block = DEFAULT_BLOCK + (opts.block ? ',' + opts.block : '');
    var allow = DEFAULT_ALLOW + (opts.allow ? ',' + opts.allow : '');
    function active() { return root.hasAttribute('data-archived'); }
    function shouldBlock(target) {
      if (!active() || !target || target.nodeType !== 1) return false;
      if (matches(target, allow)) return false;
      return matches(target, block);
    }
    function stop(e) { e.stopImmediatePropagation(); e.stopPropagation(); if (e.cancelable) e.preventDefault(); }
    root.addEventListener('click', function (e) { if (shouldBlock(e.target)) stop(e); }, true);
    root.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && shouldBlock(e.target)) stop(e);
    }, true);
    ['beforeinput', 'input', 'change'].forEach(function (type) {
      root.addEventListener(type, function (e) { if (shouldBlock(e.target)) stop(e); }, true);
    });
    return { isActive: active };
  }

  window.ZtorArchivedGate = { install: install, DEFAULT_BLOCK: DEFAULT_BLOCK, DEFAULT_ALLOW: DEFAULT_ALLOW };
}());
