/* ============================================================
   rich-body.js — 內文編輯器：文字＋圖片／影片（D335，2026-09-29；5.1.6.1 §4.2 F2、5.1.6.2 F2）
   ------------------------------------------------------------
   活動「描述」與每一塊「說明區塊」的內文，除了文字之外可以夾帶圖片與影片，插在文字之間的
   哪個位置由運營決定、也可以刪除；文字維持純文字（粗體、清單、連結本輪不做，D335）。
   媒體規則（格式、大小、數量）見主規格 §7.10「內文媒體」——多數〔產品待確認〕，所以本元件
   不擋任何數字，只照檔型分流（選圖片的鈕只收圖片、選影片的鈕只收影片）。

   資料：blocks＝照先後排列的陣列
     [{ type:'text', text }, { type:'image', src }, { type:'video', src }, …]
   只有文字的內文也可以直接給字串（set('…')），等同一個文字塊。

   畫面：一疊「文字塊（.textarea）」與「媒體塊（.upload-tile，重用上傳格：hover 出現替換／刪除，
   影片多一顆播放）」交錯排列，底下一列「插入圖片／插入影片」。
     · 插入：插在游標所在的位置——把那個文字塊從游標處切成兩段，媒體夾在中間；
       還沒點進任何文字塊時插在最後面。媒體後面一定跟著一個文字塊，運營可以接著往下寫。
     · 刪除媒體：用上傳格自己的刪除鈕；媒體前後兩段文字併回一段。
   用法：
     var ed = window.ztorRichBody.mount(host, {
       blocks | text,            // 起始內容
       rows: 3,                  // 第一個文字塊的列數（其餘文字塊 2 列）
       placeholder, placeholderKey,   // 第一個文字塊的占位字（掛 data-i18n-placeholder 讓切語言時重譯）
       label, labelKey,          // 文字塊的 aria-label（沒有可見標籤時用）
       proxy,                    // 選填：宿主既有的表單元素（如 [data-ce="desc"]），本元件把「只有文字」的
                                 // 內容同步寫進 proxy.value 並補發 input——必填檢查、翻譯表、自動儲存照舊讀它
       feat,                     // 選填：掛在插入鈕那一列的 data-feat（版本切換用，feature-scope-map）
       onChange                  // 每次變動呼叫
     });
     ed.get()    → blocks（相鄰文字併成一段、空白文字塊略過）
     ed.text()   → 只有文字（段與段之間空一行）；翻譯表只列文字、媒體不翻譯（D335）
     ed.media()  → 只有媒體 [{ type, src }]
     ed.set(v)   → 整批換掉（blocks 或字串）
     ed.lock(on) → 鎖定（bookyay 帶入的描述，F21）：文字不可改、插入鈕收起、媒體格不可替換或刪除
   靜態工具：window.ztorRichBody.toBlocks(v)／textOf(blocks)／mediaOf(blocks)／hasMedia(blocks)
   變動時在 host 上發一顆冒泡的 `richbody:change`。樣式見 ds-components/rich-body.css。
   ============================================================ */
(function () {
  'use strict';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- 資料工具（不碰 DOM）---- */
  function toBlocks(v) {
    if (Array.isArray(v)) return v.filter(Boolean).map(function (b) {
      return b.type === 'image' || b.type === 'video' ? { type: b.type, src: b.src || '' } : { type: 'text', text: String(b.text || '') };
    });
    return [{ type: 'text', text: v == null ? '' : String(v) }];
  }
  /* 相鄰文字併成一段、空白文字與沒有來源的媒體略過 */
  function normalize(blocks) {
    var out = [];
    toBlocks(blocks).forEach(function (b) {
      if (b.type === 'text') {
        var t = b.text.trim();
        if (!t) return;
        var last = out[out.length - 1];
        if (last && last.type === 'text') last.text += '\n\n' + t; else out.push({ type: 'text', text: t });
      } else if (b.src) out.push({ type: b.type, src: b.src });
    });
    return out;
  }
  function textOf(blocks) {
    return normalize(blocks).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n\n');
  }
  function mediaOf(blocks) { return normalize(blocks).filter(function (b) { return b.type !== 'text'; }); }
  function hasMedia(blocks) { return mediaOf(blocks).length > 0; }

  function mount(host, opts) {
    opts = opts || {};
    host.classList.add('rich-body');
    host.innerHTML =
      '<div class="rich-body__blocks" data-rb-blocks></div>' +
      '<div class="rich-body__tools">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-rb-insert="image">' +
          '<i data-lucide="image" class="ztor-icon"></i> <span data-i18n="rb.insert.image">' + esc(T('rb.insert.image', 'Insert image')) + '</span></button>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-rb-insert="video">' +
          '<i data-lucide="film" class="ztor-icon"></i> <span data-i18n="rb.insert.video">' + esc(T('rb.insert.video', 'Insert video')) + '</span></button>' +
      '</div>';
    var list = host.querySelector('[data-rb-blocks]');
    if (opts.feat) host.querySelector('.rich-body__tools').setAttribute('data-feat', opts.feat);
    var picker = document.createElement('input');
    picker.type = 'file'; picker.hidden = true;
    host.appendChild(picker);
    var locked = false;
    var lastText = null, lastCaret = null;   // 最後一次聚焦的文字塊與游標位置（插入點）

    function icons(node) { if (window.ztorIcons) window.ztorIcons.applyIcons(node); }

    function textBlock(text, first) {
      var ta = document.createElement('textarea');
      ta.className = 'textarea rich-body__text';
      ta.setAttribute('data-rb-text', '');
      ta.rows = first ? (opts.rows || 3) : 2;
      if (first && (opts.placeholder || opts.placeholderKey)) {
        ta.placeholder = opts.placeholderKey ? T(opts.placeholderKey, opts.placeholder || '') : opts.placeholder;
        if (opts.placeholderKey) ta.setAttribute('data-i18n-placeholder', opts.placeholderKey);
      }
      if (opts.label || opts.labelKey) {
        ta.setAttribute('aria-label', opts.labelKey ? T(opts.labelKey, opts.label || '') : opts.label);
        if (opts.labelKey) ta.setAttribute('data-i18n-aria-label', opts.labelKey);
      }
      ta.value = text || '';
      ta.disabled = locked;
      markBlank(ta);
      return ta;
    }
    function markBlank(ta) { ta.classList.toggle('is-blank', !ta.value.trim()); }

    /* 媒體塊＝重用 .upload-tile（partials/upload-tile.js 增強）。src 有值＝既有檔（預填）；
       file 有值＝剛選的檔，交給上傳格自己的 input 跑上傳過場。 */
    function mediaBlock(type, src, file) {
      var tile = document.createElement('div');
      tile.className = 'upload-tile rich-body__media';
      tile.setAttribute('data-upload', '');
      tile.setAttribute('data-rb-media', type);
      tile.setAttribute('data-upload-accept', type === 'video' ? 'video/*' : 'image/*');
      if (src) {
        tile.classList.add('is-filled');
        tile.setAttribute('data-upload-src', src);
        if (type === 'video') tile.setAttribute('data-upload-kind', 'video');
      } else tile.classList.add('is-empty');
      /* 上傳格的增強器（partials/upload-tile.js）有些頁載在頁面腳本之後——那時它的 init() 會在
         DOMContentLoaded 掃到這格再增強，這裡不必等。 */
      if (window.ztorUploadTile) window.ztorUploadTile.enhance(tile);
      if (file && window.DataTransfer) {
        var input = tile.querySelector('.upload-tile__input');
        try {
          var dt = new DataTransfer(); dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change'));
        } catch (e) { /* 舊瀏覽器沒有 DataTransfer 建構子：格子留空，運營點它自己選 */ }
      }
      return tile;
    }
    /* 預覽框照媒體本身的長寬比（內文媒體的比例〔產品待確認〕，不套展示素材槽的 2:3；ASSUMPTIONS UIA-187）。
       load／loadedmetadata 不冒泡，用捕獲階段在 host 一次接住——不管上傳格什麼時候被增強都接得到。 */
    function fitRatio(e) {
      var tile = e.target.closest && e.target.closest('[data-rb-media]');
      if (!tile) return;
      var t = e.target;
      var w = t.naturalWidth || t.videoWidth, h = t.naturalHeight || t.videoHeight;
      if (w && h) tile.style.setProperty('--rb-ratio', w + ' / ' + h);
    }
    host.addEventListener('load', fitRatio, true);
    host.addEventListener('loadedmetadata', fitRatio, true);

    function render(blocks) {
      list.innerHTML = '';
      var bs = toBlocks(blocks);
      /* 版面固定：文字塊開頭、每個媒體後面跟一個文字塊（可空）——運營在任何媒體前後都有地方寫字 */
      var seq = [];
      bs.forEach(function (b) {
        var prev = seq[seq.length - 1];
        if (b.type === 'text') {
          if (prev && prev.type === 'text') prev.text = [prev.text, b.text].filter(function (x) { return x && x.trim(); }).join('\n\n');
          else seq.push({ type: 'text', text: b.text });
        } else if (b.src) {
          if (!prev || prev.type !== 'text') seq.push({ type: 'text', text: '' });
          seq.push(b);
        }
      });
      if (!seq.length || seq[seq.length - 1].type !== 'text') seq.push({ type: 'text', text: '' });
      seq.forEach(function (b, i) {
        list.appendChild(b.type === 'text' ? textBlock(b.text, i === 0) : mediaBlock(b.type, b.src));
      });
      lastText = null; lastCaret = null;
      syncState();
    }

    /* 只認文字塊與媒體塊：兩段式面板的檢視態會在每個文字塊後面插一顆讀數 <span>（js/view-mode.js），不算內容 */
    function blocksEl() { return [].slice.call(list.children).filter(isBlock); }
    function isBlock(n) { return !!n && (n.hasAttribute('data-rb-text') || n.hasAttribute('data-rb-media')); }
    function sib(n, dir) { var x = n && n[dir]; while (x && !isBlock(x)) x = x[dir]; return x; }
    function readDom() {
      return blocksEl().map(function (n) {
        if (n.hasAttribute('data-rb-text')) return { type: 'text', text: n.value };
        var v = n.querySelector('.upload-tile__video.is-shown');
        var img = n.querySelector('.upload-tile__thumb');
        var src = (v && v.getAttribute('src')) || (img && img.getAttribute('src')) || '';
        return { type: v ? 'video' : 'image', src: src };
      });
    }
    function get() { return normalize(readDom()); }
    function text() { return textOf(readDom()); }
    function media() { return mediaOf(readDom()); }

    function syncState() {
      host.classList.toggle('rich-body--has-media', !!list.querySelector('[data-rb-media]'));
      if (opts.proxy) {
        var t = text();
        if (opts.proxy.value !== t) {
          opts.proxy.value = t;
          opts.proxy.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
    function changed() {
      syncState();
      if (typeof opts.onChange === 'function') opts.onChange(get());
      host.dispatchEvent(new CustomEvent('richbody:change', { bubbles: true }));
    }

    /* 插入：切開游標所在的文字塊，媒體夾在中間 */
    function insert(type, file) {
      var ta = (lastText && lastText.isConnected) ? lastText : null;
      var tile;
      if (ta) {
        var pos = lastCaret == null ? ta.value.length : Math.min(lastCaret, ta.value.length);
        var before = ta.value.slice(0, pos).replace(/\s+$/, '');
        var after = ta.value.slice(pos).replace(/^\s+/, '');
        ta.value = before; markBlank(ta);
        tile = mediaBlock(type, '', file);
        var next = textBlock(after, false);
        ta.after(tile, next);
      } else {
        tile = mediaBlock(type, '', file);
        list.appendChild(tile);
        list.appendChild(textBlock('', false));
      }
      icons(tile);
      changed();
      return tile;
    }

    /* 刪除媒體（上傳格清空＝這個媒體不要了）：拿掉整格，前後兩段文字併回一段 */
    function removeMedia(tile) {
      var prev = sib(tile, 'previousElementSibling'), next = sib(tile, 'nextElementSibling');
      tile.remove();
      if (prev && next && prev.hasAttribute('data-rb-text') && next.hasAttribute('data-rb-text')) {
        var a = prev.value.replace(/\s+$/, ''), b = next.value.replace(/^\s+/, '');
        prev.value = a && b ? a + '\n\n' + b : a + b;
        markBlank(prev);
        next.remove();
      }
      if (prev && prev.focus) prev.focus();
      changed();
    }

    host.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-rb-insert]');
      if (!btn || locked) return;
      picker.accept = btn.getAttribute('data-rb-insert') === 'video' ? 'video/*' : 'image/*';
      picker.dataset.type = btn.getAttribute('data-rb-insert');
      picker.value = '';
      picker.click();
    });
    picker.addEventListener('change', function () {
      var f = picker.files && picker.files[0];
      if (f) insert(picker.dataset.type || 'image', f);
    });
    host.addEventListener('upload:change', function (e) {
      var tile = e.target.closest && e.target.closest('[data-rb-media]');
      if (!tile || !host.contains(tile)) return;
      if (e.detail && e.detail.state === 'empty') removeMedia(tile);
      else changed();
    });
    host.addEventListener('input', function (e) {
      var ta = e.target.closest && e.target.closest('[data-rb-text]');
      if (!ta) return;
      markBlank(ta);
      lastText = ta; lastCaret = ta.selectionStart;
      changed();
    });
    /* 記住插入點：聚焦、點擊、方向鍵移動游標都更新 */
    ['focusin', 'click', 'keyup', 'select'].forEach(function (ev) {
      host.addEventListener(ev, function (e) {
        var ta = e.target.closest && e.target.closest('[data-rb-text]');
        if (ta) { lastText = ta; lastCaret = ta.selectionStart; }
      });
    });
    /* 焦點離開整個編輯器時，對 proxy 補一個 blur（宿主的必填檢查掛在 proxy 的 blur 上） */
    host.addEventListener('focusout', function (e) {
      if (!opts.proxy) return;
      if (e.relatedTarget && host.contains(e.relatedTarget)) return;
      opts.proxy.dispatchEvent(new Event('blur'));
    });
    /* proxy 被宿主叫 focus()（必填未過、跳到該欄）時，焦點交給第一個文字塊 */
    if (opts.proxy) {
      opts.proxy.focus = function () { var t = list.querySelector('[data-rb-text]'); if (t) t.focus(); };
    }

    function set(v) { render(v); }
    function lock(on) {
      locked = !!on;
      host.classList.toggle('is-locked', locked);
      list.querySelectorAll('[data-rb-text]').forEach(function (t) { t.disabled = locked; });
    }

    render(opts.blocks != null ? opts.blocks : (opts.text || ''));
    icons(host);
    return { el: host, get: get, text: text, media: media, set: set, lock: lock, insert: insert };
  }

  window.ztorRichBody = { mount: mount, toBlocks: toBlocks, textOf: textOf, mediaOf: mediaOf, hasMedia: hasMedia, normalize: normalize };
})();
