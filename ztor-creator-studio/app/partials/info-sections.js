/* ============================================================
   info-sections.js — 說明區塊編輯器（D334，2026-09-29；5.1.6.1 §4.2 F2、5.1.6.2 F2）
   ------------------------------------------------------------
   運營依每場活動的需要，自己加幾段「標題＋內文」的說明。規則（上游）：
     · 可新增、刪除、調整順序；選填，0 塊也可以
     · 標題與內文都由運營自由填寫，**系統不提供預設標題**、也不預先帶出空白區塊
     · 不限字數、不限區塊數量；只填標題或只填內文的區塊不擋存（2026-09-29 使用者追加裁決）
   本元件只管編輯；翻譯表的欄位（每一塊的標題與內文各一格）由宿主頁從 get() 的結果組出來。
   內文可以夾帶圖片與影片（D335，2026-09-29）：內文那一格是 partials/rich-body.js（文字塊＋媒體塊，
   插入點＝游標）；標題維持純文字。翻譯表只列文字（body），媒體不翻譯。

   用法：
     var h = window.ztorInfoSections.mount(host, { items: [{ title, body, blocks? }], onChange: fn, mediaFeat: 'S58' });
                      （mediaFeat 選填：傳給內文插入鈕列的 data-feat）
     h.get()        → [{ title, body, blocks? }]（照畫面順序；標題、文字、媒體都沒有的塊不回傳）
                      body＝內文的文字（段與段空一行）；有圖片或影片時多一個 blocks（文字與媒體照先後）
     h.set(items)   → 整批換掉（草稿續填、編輯模式捨棄時用）；item 有 blocks 用 blocks，沒有就用 body
   host 是一個空容器（建議 <div class="info-sections" data-info-sections>）；本檔在裡面畫
   .info-sections__list 與新增鈕。樣式見 ds-components/info-sections.css。

   排序：拖曳左側把手（只有按住把手時那一塊才可拖，避免在輸入框裡選字時誤拖）；
   把手聚焦時按上／下鍵也能移動（鍵盤可達）。
   變動通知：每次新增、刪除、排序、打字都呼叫 onChange，並在 host 上發一顆冒泡的
   `infosections:change`（宿主若是用 document 級 input 事件追蹤變更，打字本來就會冒上去）。
   ============================================================ */
(function () {
  'use strict';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function rowHTML() {
    return '' +
      '<button class="btn btn--icon btn--sm info-section__grip" type="button" data-info-grip ' +
        'aria-label="' + esc(T('ce.info.move', 'Drag to reorder')) + '" data-i18n-aria-label="ce.info.move">' +
        '<i data-lucide="grip-vertical" class="ztor-icon"></i></button>' +
      '<div class="info-section__fields">' +
        '<input class="input" data-info-title placeholder="' + esc(T('ce.info.title.ph', 'Title')) + '" data-i18n-placeholder="ce.info.title.ph" ' +
          'aria-label="' + esc(T('ce.info.title.ph', 'Title')) + '" data-i18n-aria-label="ce.info.title.ph">' +
        '<div class="info-section__body" data-info-body></div>' +
      '</div>' +
      '<button class="btn btn--icon btn--sm" type="button" data-info-remove ' +
        'aria-label="' + esc(T('ce.info.remove', 'Remove section')) + '" data-i18n-aria-label="ce.info.remove">' +
        '<i data-lucide="x" class="ztor-icon"></i></button>';
  }

  function mount(host, opts) {
    opts = opts || {};
    host.classList.add('info-sections');
    host.innerHTML =
      '<div class="info-sections__list" data-info-list></div>' +
      '<button class="btn btn--outline btn--add info-sections__add" type="button" data-info-add>' +
        '<i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="ce.info.add">' + esc(T('ce.info.add', 'Add info section')) + '</span></button>';
    var list = host.querySelector('[data-info-list]');

    function changed() {
      if (typeof opts.onChange === 'function') opts.onChange(get());
      host.dispatchEvent(new CustomEvent('infosections:change', { bubbles: true }));
    }
    function icons(node) { if (window.ztorIcons) window.ztorIcons.applyIcons(node); }

    function addRow(item) {
      var row = document.createElement('div');
      row.className = 'card card--muted info-section';
      row.setAttribute('data-info-row', '');
      row.innerHTML = rowHTML();
      row.querySelector('[data-info-title]').value = (item && item.title) || '';
      /* 內文＝rich-body（D335）：有 blocks 用 blocks（含圖片影片），沒有就用純文字 body */
      var bodyHost = row.querySelector('[data-info-body]');
      var start = item && item.blocks ? item.blocks : ((item && item.body) || '');
      row.__rb = window.ztorRichBody
        ? window.ztorRichBody.mount(bodyHost, { blocks: start, rows: 3, placeholder: 'Body', placeholderKey: 'ce.info.body.ph', label: 'Body', labelKey: 'ce.info.body.ph', feat: opts.mediaFeat, onChange: changed })
        : null;
      list.appendChild(row);
      icons(row);
      return row;
    }

    function get() {
      return [].slice.call(list.querySelectorAll('[data-info-row]')).map(function (r) {
        var rb = r.__rb;
        var x = { title: r.querySelector('[data-info-title]').value.trim(), body: rb ? rb.text() : '' };
        if (rb && rb.media().length) x.blocks = rb.get();
        return x;
      }).filter(function (x) { return x.title || x.body || x.blocks; });
    }
    function set(items) {
      list.innerHTML = '';
      (items || []).forEach(addRow);
    }

    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-info-add]')) {
        var r = addRow(null);
        r.querySelector('[data-info-title]').focus();
        changed();
        return;
      }
      var rm = e.target.closest('[data-info-remove]');
      if (rm) {
        var row = rm.closest('[data-info-row]');
        /* 焦點不跟著被刪的那一塊消失：交給上一塊（沒有就下一塊）的標題，都沒有就交給新增鈕 */
        var next = row.previousElementSibling || row.nextElementSibling;
        row.remove();
        (next ? next.querySelector('[data-info-title]') : host.querySelector('[data-info-add]')).focus();
        changed();
      }
    });
    /* 標題打字在這裡通知；內文（rich-body）自己的 onChange 會通知，不重複 */
    host.addEventListener('input', function (e) { if (e.target.matches && e.target.matches('[data-info-title]')) changed(); });

    /* 拖曳排序：按住把手才讓那一塊可拖（row.draggable 在 pointerdown 開、dragend 關） */
    var dragging = null;
    host.addEventListener('pointerdown', function (e) {
      var g = e.target.closest('[data-info-grip]');
      if (g) g.closest('[data-info-row]').draggable = true;
    });
    host.addEventListener('pointerup', function () {
      list.querySelectorAll('[data-info-row][draggable="true"]').forEach(function (r) { if (r !== dragging) r.draggable = false; });
    });
    list.addEventListener('dragstart', function (e) {
      var row = e.target.closest && e.target.closest('[data-info-row]');
      if (!row || !row.draggable) { e.preventDefault(); return; }
      dragging = row;
      row.classList.add('is-dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); } catch (_) {}
    });
    list.addEventListener('dragover', function (e) {
      if (!dragging) return;
      e.preventDefault();
      var over = e.target.closest && e.target.closest('[data-info-row]');
      if (!over || over === dragging) return;
      var rect = over.getBoundingClientRect();
      var after = e.clientY > rect.top + rect.height / 2;
      list.insertBefore(dragging, after ? over.nextElementSibling : over);
    });
    list.addEventListener('drop', function (e) { if (dragging) e.preventDefault(); });
    list.addEventListener('dragend', function () {
      if (!dragging) return;
      dragging.classList.remove('is-dragging');
      dragging.draggable = false;
      dragging = null;
      changed();
    });

    /* 鍵盤排序：把手聚焦時上／下鍵把這一塊往前／往後移一格，焦點留在把手上 */
    host.addEventListener('keydown', function (e) {
      var g = e.target.closest('[data-info-grip]');
      if (!g || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      var row = g.closest('[data-info-row]');
      var sib = e.key === 'ArrowUp' ? row.previousElementSibling : row.nextElementSibling;
      e.preventDefault();
      if (!sib) return;
      list.insertBefore(row, e.key === 'ArrowUp' ? sib : sib.nextElementSibling);
      g.focus();
      changed();
    });

    set(opts.items);
    icons(host);
    return { el: host, get: get, set: set };
  }

  window.ztorInfoSections = { mount: mount };
})();
