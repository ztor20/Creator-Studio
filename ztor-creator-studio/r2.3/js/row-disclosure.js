/* row-disclosure.js — 可展開子列的互動（ds-components/row-disclosure.css 的行為半）
   ------------------------------------------------------------------------------
   2026-09-03（STYLE-DECISIONS Q107）。此前三個頁面各寫一份 toggle：pickup-detail
   的 data-group-toggle、order-detail 的 data-od-toggle、scanner 的頁內函式。收斂成
   一支之後，消費頁只寫 markup，不再寫展開／收合。

   Data-attribute 契約
     [data-rowdis="<gid>"]        揭露把手。必須是可聚焦的 <button>，自帶
                                  aria-expanded（鍵盤 Enter／Space 由原生按鈕提供）。
     [data-rowdis-row]（選配）    掛在母列上＝整列可點。值可寫 gid 供消費頁自己查找；
                                  列內的連結、下拉選單與其他按鈕一律放行（它們是去
                                  別的地方的）。把手一定有效。
     [data-rowdis-child="<gid>"]  子列。初始態由 markup 的 hidden 決定，之後由本模組
                                  跟著把手的 aria-expanded 切。

   對外 API（window.rowDisclosure）
     init(root, opts)   註冊一個容器；opts.onToggle(head, open) 在切換後呼叫，給
                        「展開狀態只是可見性其中一個條件」的頁面（pickup-detail 的
                        名單還要疊搜尋與狀態篩選）重算用。註冊後會先 sync 一次。
     set(head, open)    程式切某一組
     toggle(head)       切某一組
     sync(root)         依現有 aria-expanded 重新對齊子列的 hidden（動態渲染後可呼叫）
     isOpen(head)

   點擊一律走 document 級單一委派，所以動態插入的列不必重新綁定；init() 只是登記
   容器與 callback，不會再加一顆監聽器（加了會讓事件被處理兩次、等於沒切）。
*/
(function () {
  'use strict';

  var roots = [];

  function toArray(list) { return Array.prototype.slice.call(list); }

  function isOpen(head) {
    return !!head && head.getAttribute('aria-expanded') === 'true';
  }

  function childrenOf(gid) {
    if (!gid) return [];
    return toArray(document.querySelectorAll('[data-rowdis-child="' + gid + '"]'));
  }

  function set(head, open) {
    if (!head) return;
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    childrenOf(head.getAttribute('data-rowdis')).forEach(function (row) { row.hidden = !open; });
  }

  function toggle(head) { set(head, !isOpen(head)); }

  function sync(root) {
    var scope = root || document;
    toArray(scope.querySelectorAll('[data-rowdis]')).forEach(function (head) { set(head, isOpen(head)); });
  }

  function optsFor(node) {
    for (var i = 0; i < roots.length; i++) {
      if (roots[i].el === document || roots[i].el.contains(node)) return roots[i].opts;
    }
    return null;
  }

  function onClick(e) {
    var head = e.target.closest('[data-rowdis]');
    if (!head) {
      var row = e.target.closest('[data-rowdis-row]');
      if (!row) return;
      /* 整列可點，但列內的連結與選單是去別的地方的 */
      if (e.target.closest('a, button, .dropdown, summary, input, select')) return;
      head = row.querySelector('[data-rowdis]');
      if (!head) return;
    }
    toggle(head);
    var opts = optsFor(head);
    if (opts && typeof opts.onToggle === 'function') opts.onToggle(head, isOpen(head));
  }

  function init(root, opts) {
    var el = root || document;
    roots.push({ el: el, opts: opts || {} });
    sync(el === document ? null : el);
  }

  document.addEventListener('click', onClick);
  document.addEventListener('DOMContentLoaded', function () { sync(); });

  window.rowDisclosure = {
    init: init,
    set: set,
    toggle: toggle,
    sync: sync,
    isOpen: isOpen
  };
})();
