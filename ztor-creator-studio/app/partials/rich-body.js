/* ============================================================
   rich-body.js — 內文編輯器：文字（粗體、清單）＋圖片／影片
   （D335，2026-09-29；D340，2026-09-30；5.1.6.1 §4.2 F2、5.1.6.2 F2、主規格 §7.10「內文媒體」）
   ------------------------------------------------------------
   活動「描述」與每一塊「說明區塊」的內文，除了文字之外可以夾帶圖片與影片，插在文字之間的
   哪個位置由運營決定、也可以刪除。
   D340（2026-09-30）：
     · 文字支援**粗體**與**清單**（項目符號、編號）；連結、標題字級等其他格式本輪不做——
       貼上一律轉純文字，帶入時由 sanitize() 去掉其他標記、保留文字。
     · 圖片與影片的尺寸比例不限（預覽框照媒體本身的比例）；每段內文最多 10 個媒體（圖片＋影片合計），
       滿了插入鈕停用並在工具列尾端說明。格式與單檔大小沿用展示素材的規則（主規格 §7.10，數字待上游），
       本元件只照檔型分流（選圖片的鈕只收圖片、選影片的鈕只收影片）。
     · 描述只有媒體、沒有文字不算已填：proxy 只收文字，宿主的必填檢查讀 proxy 就對了。

   資料：blocks＝照先後排列的陣列
     [{ type:'text', text, html }, { type:'image', src }, { type:'video', src }, …]
     · text＝純文字（翻譯表、必填、proxy 用；清單項一行一項）
     · html＝同一段的格式版，只含 <p> <br> <strong> <ul> <ol> <li>（sanitize() 保證）
   舊資料只有 text 也照收（toBlocks 會把純文字轉成段落）；也可以直接給字串，等同一個文字塊。

   畫面：一疊「文字塊（contenteditable，外觀＝.textarea）」與「媒體塊（.upload-tile，重用上傳格：hover 出現
   替換／刪除，影片多一顆播放）」交錯排列，底下一列工具：粗體／項目符號清單／編號清單｜插入圖片／插入影片。
     · 格式鈕：作用在游標所在的文字塊（還沒點進任何文字塊時先聚焦最後一塊）；目前選取是粗體或在清單裡時鈕呈按下態。
     · 插入：插在游標所在的位置——把那個文字塊從游標處切成兩段，媒體夾在中間；
       還沒點進任何文字塊時插在最後面。媒體後面一定跟著一個文字塊，運營可以接著往下寫。
     · 刪除媒體：用上傳格自己的刪除鈕；媒體前後兩段文字併回一段。
   用法：
     var ed = window.ztorRichBody.mount(host, {
       blocks | text,            // 起始內容
       rows: 3,                  // 第一個文字塊的最小列數（其餘文字塊 2 列）
       placeholder, placeholderKey,   // 第一個文字塊的占位字（掛 data-i18n-key，切語言時重譯）
       label, labelKey,          // 文字塊的 aria-label
       proxy,                    // 選填：宿主既有的表單元素（如 [data-ce="desc"]），本元件把「只有文字」的
                                 // 內容同步寫進 proxy.value 並補發 input——必填檢查、翻譯表、自動儲存照舊讀它
       maxMedia: 10,             // 每段內文的媒體上限（D340，主規格 §7.10）
       feat,                     // 選填：掛在工具列的 data-feat（版本切換用，feature-scope-map）
       fmtFeat,                  // 選填：掛在格式鈕群組的 data-feat（D340 粗體與清單）
       onChange                  // 每次變動呼叫
     });
     ed.get()    → blocks（相鄰文字併成一段、空白文字塊略過）
     ed.text()   → 只有文字（段與段之間空一行）；翻譯表只列文字、媒體不翻譯
     ed.media()  → 只有媒體 [{ type, src }]
     ed.set(v)   → 整批換掉（blocks 或字串）
     ed.lock(on) → 鎖定（bookyay 帶入的描述，F21）：文字不可改、工具列收起、媒體格不可替換或刪除
   靜態工具：window.ztorRichBody.toBlocks(v)／normalize／textOf／mediaOf／hasMedia／hasText／
     sanitize(html)／plainOf(html)／textToHtml(text)／fromHtml(html)（外部富文本 → blocks，bookyay 用）／
     fieldKeys(base, blocks)（翻譯欄位 key：文字被媒體切成幾段就幾個 key，譯文照段落放回原位）
   變動時在 host 上發一顆冒泡的 `richbody:change`。樣式見 ds-components/rich-body.css。
   ============================================================ */
(function () {
  'use strict';

  var MAX_MEDIA = 10;

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- 文字格式（D340）：只留粗體與清單 ---- */
  var BLOCKISH = { P: 1, DIV: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, BLOCKQUOTE: 1, SECTION: 1, ARTICLE: 1, PRE: 1 };
  var DROP = { IMG: 1, VIDEO: 1, SOURCE: 1, SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, TEMPLATE: 1 };
  function parse(html) { return new DOMParser().parseFromString('<body>' + String(html == null ? '' : html) + '</body>', 'text/html').body; }
  function cleanKids(node, inLi) {
    var out = '';
    Array.prototype.forEach.call(node.childNodes, function (c) { out += cleanNode(c, inLi); });
    return out;
  }
  function blank(h) { return !String(h).replace(/<br>|<[^>]+>|\s/g, ''); }
  function trimBr(h) { return String(h).replace(/^(<br>)+|(<br>)+$/g, ''); }
  /* 行內節點：粗體留、清單留，其餘標記拆掉只留文字 */
  function cleanNode(n, inLi) {
    if (n.nodeType === 3) return esc(n.nodeValue.replace(/\s*\n\s*/g, ' '));
    if (n.nodeType !== 1) return '';
    var tag = n.nodeName;
    if (DROP[tag]) return '';
    if (tag === 'BR') return '<br>';
    var inner;
    if (tag === 'STRONG' || tag === 'B') { inner = cleanKids(n, inLi); return blank(inner) ? inner : '<strong>' + inner + '</strong>'; }
    if (tag === 'UL' || tag === 'OL') {
      var items = '';
      Array.prototype.forEach.call(n.childNodes, function (c) {
        if (c.nodeType === 1 && c.nodeName === 'LI') items += cleanNode(c, true);
        else { var x = trimBr(cleanNode(c, true)); if (!blank(x)) items += '<li>' + x + '</li>'; }
      });
      return items ? '<' + tag.toLowerCase() + '>' + items + '</' + tag.toLowerCase() + '>' : '';
    }
    if (tag === 'LI') { inner = trimBr(cleanKids(n, true)); return blank(inner) && !/<(ul|ol)>/.test(inner) ? '' : '<li>' + inner + '</li>'; }
    /* 清單項裡的段落（貼上或 bookyay 常見 <li><p>…</p></li>）攤平成一行，段與段之間換行 */
    if (BLOCKISH[tag] && inLi) { inner = trimBr(cleanKids(n, true)); return blank(inner) ? '' : inner + '<br>'; }
    if (BLOCKISH[tag]) return blockify(n);
    return cleanKids(n, inLi);   // 其他標記（連結、斜體、span…）去掉、保留文字（D340）
  }
  /* 容器層：連續的行內內容收成一個 <p>，清單與段落各自成塊——存下來的結構只有 p／ul／ol 三種塊 */
  function blockify(node) {
    var out = '', buf = '';
    function flush() { var b = trimBr(buf); if (!blank(b)) out += '<p>' + b + '</p>'; buf = ''; }
    Array.prototype.forEach.call(node.childNodes, function (c) {
      if (c.nodeType === 1 && (c.nodeName === 'UL' || c.nodeName === 'OL')) { flush(); out += cleanNode(c, false); }
      else if (c.nodeType === 1 && BLOCKISH[c.nodeName]) { flush(); out += blockify(c); }
      else buf += cleanNode(c, false);
    });
    flush();
    return out;
  }
  function sanitize(html) { return blockify(parse(html)); }
  /* 純文字：段落之間空一行、清單一項一行（不加項目符號——D340 取代了「清單項前加・」） */
  function plainOf(html) {
    var out = '';
    function nl(n) { while (!new RegExp('\\n{' + n + '}$').test(out) && out) out += '\n'; }
    function walk(node) {
      Array.prototype.forEach.call(node.childNodes, function (c) {
        if (c.nodeType === 3) { out += c.nodeValue; return; }
        if (c.nodeType !== 1) return;
        var tag = c.nodeName;
        if (tag === 'BR') { out += '\n'; return; }
        if (tag === 'UL' || tag === 'OL') { nl(1); walk(c); nl(2); return; }
        if (tag === 'LI') { walk(c); nl(1); return; }
        if (tag === 'P' || BLOCKISH[tag]) { walk(c); nl(2); return; }
        walk(c);
      });
    }
    walk(parse(html));
    return out.split('\n').map(function (l) { return l.trim(); }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function textToHtml(text) {
    var t = String(text == null ? '' : text).replace(/\r/g, '').trim();
    if (!t) return '';
    return t.split(/\n{2,}/).map(function (p) { return '<p>' + p.split('\n').map(esc).join('<br>') + '</p>'; }).join('');
  }
  function isFormatted(html) { return /<(strong|ul|ol)>/.test(html || ''); }

  /* ---- 資料工具（不碰 DOM）---- */
  function textBlockOf(b) {
    var html = b.html != null ? sanitize(b.html) : textToHtml(b.text || '');
    return { type: 'text', text: plainOf(html), html: html };
  }
  function toBlocks(v) {
    if (Array.isArray(v)) return v.filter(Boolean).map(function (b) {
      return b.type === 'image' || b.type === 'video' ? { type: b.type, src: b.src || '' } : textBlockOf(b);
    });
    return [textBlockOf({ text: v == null ? '' : String(v) })];
  }
  /* 相鄰文字併成一段、空白文字與沒有來源的媒體略過 */
  function normalize(blocks) {
    var out = [];
    toBlocks(blocks).forEach(function (b) {
      if (b.type === 'text') {
        if (!b.text.trim()) return;
        var last = out[out.length - 1];
        if (last && last.type === 'text') { last.text += '\n\n' + b.text; last.html += b.html; }
        else out.push({ type: 'text', text: b.text, html: b.html });
      } else if (b.src) out.push({ type: b.type, src: b.src });
    });
    return out;
  }
  function textOf(blocks) {
    return normalize(blocks).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n\n');
  }
  function mediaOf(blocks) { return normalize(blocks).filter(function (b) { return b.type !== 'text'; }); }
  function hasMedia(blocks) { return mediaOf(blocks).length > 0; }
  function hasText(blocks) { return !!textOf(blocks).trim(); }
  /* 翻譯欄位的 key：譯文照文字段落放回原位（D340：譯文中的圖片與影片位置跟原文相同）。
     文字只有一段（或沒有媒體把它切開）時沿用原本的一個 key；被媒體切成 n 段時是 base~0…base~(n-1)。 */
  function fieldKeys(base, blocks) {
    var n = normalize(blocks).filter(function (b) { return b.type === 'text'; }).length;
    if (n <= 1) return [base];
    var keys = [];
    for (var i = 0; i < n; i++) keys.push(base + '~' + i);
    return keys;
  }
  /* 外部富文本（bookyay 活動詳情的一段）→ blocks：圖片與影片照原本的先後位置變成媒體塊，
     文字保留粗體與清單（D340，取代 D335「轉純文字、清單項前加・」），其餘標記去掉只留文字。
     做法：先把每個媒體標籤換成私用區字元包住的序號，切開之後每一段文字各自 sanitize（DOMParser 會補齊被切斷的標籤）。 */
  var MARK = '';
  function fromHtml(html) {
    var media = [];
    var s = String(html || '').replace(/<img\b[^>]*>|<video\b[^>]*>[\s\S]*?<\/video>|<video\b[^>]*>/gi, function (m) {
      var src = (m.match(/\ssrc\s*=\s*"([^"]*)"/i) || [])[1] || '';
      if (!src) return '';
      media.push({ type: /^<img/i.test(m) ? 'image' : 'video', src: src });
      return MARK + (media.length - 1) + MARK;
    });
    var blocks = [];
    s.split(new RegExp(MARK + '(\\d+)' + MARK)).forEach(function (part, i) {
      if (i % 2) { var m = media[Number(part)]; if (m) blocks.push(m); return; }
      var h = sanitize(part);
      if (plainOf(h)) blocks.push({ type: 'text', html: h, text: plainOf(h) });
    });
    return blocks;
  }

  /* Enter 產生 <p> 而不是 <div>（整頁一次設定即可；只影響 contenteditable） */
  var sepSet = false;
  function ensureParagraphSep() {
    if (sepSet) return;
    sepSet = true;
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* 舊瀏覽器沒有這個指令：sanitize 會把 div 收成段落 */ }
  }

  function mount(host, opts) {
    opts = opts || {};
    var maxMedia = opts.maxMedia || MAX_MEDIA;
    host.classList.add('rich-body');
    var fmtBtn = function (cmd, icon, key, fb) {
      return '<button class="btn btn--ghost btn--sm btn--icon" type="button" data-rb-fmt="' + cmd + '" aria-pressed="false" ' +
        'aria-label="' + esc(T(key, fb)) + '" title="' + esc(T(key, fb)) + '" data-i18n-aria-label="' + key + '" data-i18n-title="' + key + '">' +
        '<i data-lucide="' + icon + '" class="ztor-icon"></i></button>';
    };
    host.innerHTML =
      '<div class="rich-body__blocks" data-rb-blocks></div>' +
      '<div class="rich-body__tools">' +
        '<div class="rich-body__fmt" role="group" aria-label="' + esc(T('rb.fmt', 'Text format')) + '" data-i18n-aria-label="rb.fmt">' +
          fmtBtn('bold', 'bold', 'rb.fmt.bold', 'Bold') +
          fmtBtn('ul', 'list', 'rb.fmt.ul', 'Bulleted list') +
          fmtBtn('ol', 'list-numbers', 'rb.fmt.ol', 'Numbered list') +
        '</div>' +
        '<span class="rich-body__sep" aria-hidden="true"></span>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-rb-insert="image">' +
          '<i data-lucide="image" class="ztor-icon"></i> <span data-i18n="rb.insert.image">' + esc(T('rb.insert.image', 'Insert image')) + '</span></button>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-rb-insert="video">' +
          '<i data-lucide="film" class="ztor-icon"></i> <span data-i18n="rb.insert.video">' + esc(T('rb.insert.video', 'Insert video')) + '</span></button>' +
        '<span class="field__hint rich-body__limit" data-rb-limit hidden></span>' +
      '</div>';
    var list = host.querySelector('[data-rb-blocks]');
    var tools = host.querySelector('.rich-body__tools');
    var limitEl = host.querySelector('[data-rb-limit]');
    if (opts.feat) tools.setAttribute('data-feat', opts.feat);
    if (opts.fmtFeat) host.querySelector('.rich-body__fmt').setAttribute('data-feat', opts.fmtFeat);
    var picker = document.createElement('input');
    picker.type = 'file'; picker.hidden = true;
    host.appendChild(picker);
    var locked = false;
    var lastText = null, lastRange = null;   // 最後一次聚焦的文字塊與游標（插入點、格式鈕的作用對象）

    function icons(node) { if (window.ztorIcons) window.ztorIcons.applyIcons(node); }

    function placeholderText() { return opts.placeholderKey ? T(opts.placeholderKey, opts.placeholder || '') : (opts.placeholder || ''); }
    function textBlock(html, first) {
      var ed = document.createElement('div');
      ed.className = 'textarea rich-body__text';
      ed.setAttribute('data-rb-text', '');
      ed.setAttribute('role', 'textbox');
      ed.setAttribute('aria-multiline', 'true');
      ed.contentEditable = locked ? 'false' : 'true';
      if (locked) ed.setAttribute('aria-disabled', 'true');
      ed.style.setProperty('--rb-rows', String(first ? (opts.rows || 3) : 2));
      if (first && (opts.placeholder || opts.placeholderKey)) {
        ed.setAttribute('data-placeholder', placeholderText());
        if (opts.placeholderKey) ed.setAttribute('data-rb-ph-key', opts.placeholderKey);
      }
      if (opts.label || opts.labelKey) {
        ed.setAttribute('aria-label', opts.labelKey ? T(opts.labelKey, opts.label || '') : opts.label);
        if (opts.labelKey) ed.setAttribute('data-i18n-aria-label', opts.labelKey);
      }
      ed.innerHTML = html || '';
      markBlank(ed);
      return ed;
    }
    function markBlank(ed) { ed.classList.toggle('is-blank', !plainOf(ed.innerHTML) && !/<li>/i.test(ed.innerHTML)); }

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
    /* 預覽框照媒體本身的長寬比（D340：內文圖片與影片的尺寸比例不限，不套展示素材槽的 2:3）。
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
          if (prev && prev.type === 'text') prev.html += b.html;
          else seq.push({ type: 'text', html: b.html });
        } else if (b.src) {
          if (!prev || prev.type !== 'text') seq.push({ type: 'text', html: '' });
          seq.push(b);
        }
      });
      if (!seq.length || seq[seq.length - 1].type !== 'text') seq.push({ type: 'text', html: '' });
      seq.forEach(function (b, i) {
        list.appendChild(b.type === 'text' ? textBlock(b.html, i === 0) : mediaBlock(b.type, b.src));
      });
      lastText = null; lastRange = null;
      syncState();
    }

    /* 只認文字塊與媒體塊（兩段式面板的檢視態等外來節點不算內容） */
    function blocksEl() { return [].slice.call(list.children).filter(isBlock); }
    function isBlock(n) { return !!n && (n.hasAttribute('data-rb-text') || n.hasAttribute('data-rb-media')); }
    function sib(n, dir) { var x = n && n[dir]; while (x && !isBlock(x)) x = x[dir]; return x; }
    function readDom() {
      return blocksEl().map(function (n) {
        if (n.hasAttribute('data-rb-text')) { var h = sanitize(n.innerHTML); return { type: 'text', html: h, text: plainOf(h) }; }
        var v = n.querySelector('.upload-tile__video.is-shown');
        var img = n.querySelector('.upload-tile__thumb');
        var src = (v && v.getAttribute('src')) || (img && img.getAttribute('src')) || '';
        return { type: v ? 'video' : 'image', src: src };
      });
    }
    function get() { return normalize(readDom()); }
    function text() { return textOf(readDom()); }
    function media() { return mediaOf(readDom()); }
    function mediaCount() { return list.querySelectorAll('[data-rb-media]').length; }

    /* 媒體上限（D340：每段內文最多 10 個）：滿了插入鈕停用、工具列尾端說明為什麼 */
    function syncLimit() {
      var full = mediaCount() >= maxMedia;
      host.querySelectorAll('[data-rb-insert]').forEach(function (b) { b.disabled = full || locked; });
      limitEl.hidden = !full;
      limitEl.textContent = full ? T('rb.limit', 'Up to {n} images or videos per section').replace('{n}', maxMedia) : '';
    }
    function syncState() {
      host.classList.toggle('rich-body--has-media', !!list.querySelector('[data-rb-media]'));
      syncLimit();
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

    /* 游標：只記在本編輯器的文字塊裡的位置 */
    function textOfNode(node) { var el = node && (node.nodeType === 1 ? node : node.parentNode); return el && el.closest ? el.closest('[data-rb-text]') : null; }
    function remember() {
      var s = window.getSelection();
      if (!s || !s.rangeCount) return;
      var r = s.getRangeAt(0);
      var ed = textOfNode(r.startContainer);
      if (!ed || !host.contains(ed)) return;
      lastText = ed; lastRange = r.cloneRange();
      syncPressed();
    }
    function syncPressed() {
      var s = window.getSelection();
      var inside = s && s.rangeCount && host.contains(s.anchorNode);
      var anc = inside && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode);
      var inList = function (tag) { return !!(anc && anc.closest && anc.closest(tag) && host.contains(anc.closest(tag))); };
      var state = {
        bold: !!inside && (function () { try { return document.queryCommandState('bold'); } catch (e) { return false; } })(),
        ul: !!inside && inList('ul'),
        ol: !!inside && inList('ol')
      };
      host.querySelectorAll('[data-rb-fmt]').forEach(function (b) { b.setAttribute('aria-pressed', state[b.getAttribute('data-rb-fmt')] ? 'true' : 'false'); });
    }
    function caretToEnd(ed) {
      ed.focus();
      var r = document.createRange(); r.selectNodeContents(ed); r.collapse(false);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    function restoreCaret() {
      var ed = (lastText && lastText.isConnected) ? lastText : blocksEl().filter(function (n) { return n.hasAttribute('data-rb-text'); }).pop();
      if (!ed) return null;
      if (lastRange && ed === lastText && ed.contains(lastRange.startContainer)) {
        ed.focus();
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(lastRange);
      } else caretToEnd(ed);
      return ed;
    }
    function format(cmd) {
      if (locked) return;
      ensureParagraphSep();
      var ed = restoreCaret();
      if (!ed) return;
      var map = { bold: 'bold', ul: 'insertUnorderedList', ol: 'insertOrderedList' };
      try { document.execCommand(map[cmd], false, null); } catch (e) { return; }
      markBlank(ed);
      remember();
      changed();
    }

    /* 插入：切開游標所在的文字塊，媒體夾在中間 */
    function insert(type, file) {
      if (mediaCount() >= maxMedia) { syncLimit(); return null; }
      var ed = (lastText && lastText.isConnected) ? lastText : null;
      var tile;
      if (ed) {
        var after = '';
        if (lastRange && ed.contains(lastRange.startContainer)) {
          var tail = document.createRange();
          tail.setStart(lastRange.startContainer, lastRange.startOffset);
          tail.setEnd(ed, ed.childNodes.length);
          var box = document.createElement('div');
          box.appendChild(tail.extractContents());
          after = box.innerHTML;
        }
        ed.innerHTML = sanitize(ed.innerHTML); markBlank(ed);
        tile = mediaBlock(type, '', file);
        var next = textBlock(sanitize(after), false);
        ed.after(tile, next);
      } else {
        tile = mediaBlock(type, '', file);
        list.appendChild(tile);
        list.appendChild(textBlock('', false));
      }
      icons(tile);
      lastText = null; lastRange = null;
      changed();
      return tile;
    }

    /* 刪除媒體（上傳格清空＝這個媒體不要了）：拿掉整格，前後兩段文字併回一段 */
    function removeMedia(tile) {
      var prev = sib(tile, 'previousElementSibling'), next = sib(tile, 'nextElementSibling');
      tile.remove();
      if (prev && next && prev.hasAttribute('data-rb-text') && next.hasAttribute('data-rb-text')) {
        prev.innerHTML = sanitize(prev.innerHTML) + sanitize(next.innerHTML);
        markBlank(prev);
        next.remove();
      }
      if (prev && prev.hasAttribute('data-rb-text') && !locked) caretToEnd(prev);
      changed();
    }

    /* 格式鈕：mousedown 先擋掉，選取與焦點才不會被按鈕搶走 */
    host.addEventListener('mousedown', function (e) { if (e.target.closest('[data-rb-fmt]')) e.preventDefault(); });
    host.addEventListener('click', function (e) {
      var f = e.target.closest('[data-rb-fmt]');
      if (f) { format(f.getAttribute('data-rb-fmt')); return; }
      var btn = e.target.closest('[data-rb-insert]');
      if (!btn || locked || btn.disabled) return;
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
      var ed = e.target.closest && e.target.closest('[data-rb-text]');
      if (!ed) return;
      markBlank(ed);
      remember();
      changed();
    });
    /* 貼上一律轉純文字：其他格式本輪不做（D340），來源帶進來的連結、字級、顏色不留 */
    host.addEventListener('paste', function (e) {
      var ed = e.target.closest && e.target.closest('[data-rb-text]');
      if (!ed || !e.clipboardData) return;
      e.preventDefault();
      var t = e.clipboardData.getData('text/plain');
      try { document.execCommand('insertText', false, t); } catch (_) { /* 沒有 insertText：不插入，避免把格式帶進來 */ }
    });
    host.addEventListener('focusin', function (e) {
      var ed = e.target.closest && e.target.closest('[data-rb-text]');
      if (!ed) return;
      /* 兩段式面板的檢視態（[data-mode="view"]）：文字塊是讀數、不是輸入框（Q119），鍵盤也進不去 */
      if (host.closest('[data-mode="view"]')) { ed.blur(); return; }
      ensureParagraphSep();
    });
    document.addEventListener('selectionchange', function () {
      var s = window.getSelection();
      if (s && s.rangeCount && host.contains(s.anchorNode)) remember();
      else host.querySelectorAll('[data-rb-fmt][aria-pressed="true"]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    });
    /* 焦點離開整個編輯器時：空白文字塊清乾淨（只剩 <br> 的殘影），並對 proxy 補一個 blur（宿主的必填檢查掛在 proxy 的 blur 上） */
    host.addEventListener('focusout', function (e) {
      if (e.relatedTarget && host.contains(e.relatedTarget)) return;
      list.querySelectorAll('[data-rb-text].is-blank').forEach(function (ed) { if (ed.innerHTML) ed.innerHTML = ''; });
      if (opts.proxy) opts.proxy.dispatchEvent(new Event('blur'));
    });
    /* proxy 被宿主叫 focus()（必填未過、跳到該欄）時，焦點交給第一個文字塊 */
    if (opts.proxy) {
      opts.proxy.focus = function () { var t = list.querySelector('[data-rb-text]'); if (t) t.focus(); };
    }
    /* 占位字跟著語言換（i18n 的 data-i18n-placeholder 只寫 .placeholder 屬性，對 contenteditable 沒有作用） */
    document.addEventListener('i18n:applied', function () {
      host.querySelectorAll('[data-rb-ph-key]').forEach(function (ed) { ed.setAttribute('data-placeholder', T(ed.getAttribute('data-rb-ph-key'), opts.placeholder || '')); });
      syncLimit();
    });

    function set(v) { render(v); }
    function lock(on) {
      locked = !!on;
      host.classList.toggle('is-locked', locked);
      list.querySelectorAll('[data-rb-text]').forEach(function (t) {
        t.contentEditable = locked ? 'false' : 'true';
        if (locked) t.setAttribute('aria-disabled', 'true'); else t.removeAttribute('aria-disabled');
      });
      syncLimit();
    }

    render(opts.blocks != null ? opts.blocks : (opts.text || ''));
    icons(host);
    return { el: host, get: get, text: text, media: media, set: set, lock: lock, insert: insert, format: format };
  }

  window.ztorRichBody = {
    mount: mount, MAX_MEDIA: MAX_MEDIA,
    toBlocks: toBlocks, normalize: normalize, textOf: textOf, mediaOf: mediaOf, hasMedia: hasMedia, hasText: hasText,
    sanitize: sanitize, plainOf: plainOf, textToHtml: textToHtml, isFormatted: isFormatted, fromHtml: fromHtml, fieldKeys: fieldKeys
  };
})();
