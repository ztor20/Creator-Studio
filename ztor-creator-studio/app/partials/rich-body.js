/* ============================================================
   rich-body.js — 描述區塊編輯器：一串可排序的文字／圖片／影片區塊
   （D354，2026-10-05；前身 D335 2026-09-29、D340 2026-09-30；5.1.6.1 §4.2 F2、5.1.6.2 F2、主規格 §7.10）
   ------------------------------------------------------------
   D354 改版（使用者裁決）：活動「描述」＝一串區塊（block），三種型別——**文字**、**圖片**、**影片**。
     · 每個區塊都**沒有標題**、都可以拖動排序、都可以刪除；粉絲看到的順序＝區塊的順序。
     · 第一個文字區塊＝原本必填的描述：至少要有一個文字區塊有字才算已填（只有圖片或影片不算，D340 不變）；
       文字區塊不能刪到一個都不剩（只剩一個時刪除鈕停用）。
     · 「新增描述」加一個文字區塊（排在最後）。
     · 在文字區塊按「插入圖片／插入影片」：媒體成為**獨立區塊**，排在那個文字區塊之後
       （已經跟在它後面的媒體之後，連續插入照插入順序排）——不再夾在文字之間（取代 D335）。
     · 文字區塊的格式工具：粗體、斜體、連結、編號清單、項目符號清單、分隔線（取代 D340 決定八）。
       連結只收 http／https、粉絲端新分頁開啟（target=_blank）；游標在連結裡時再按連結鈕可改網址或移除連結。
       貼上一律轉純文字；帶入時由 sanitize() 收成允許的標記，其餘去掉標記、保留文字。
     · 媒體上限：**整份描述**圖片＋影片合計最多 10 個（D354 決定五，原本是每段 10 個）；滿了所有插入鈕停用、
       區塊清單下方說明。
   取代：說明區塊（partials/info-sections.js，D334）整組退場——它的「可增刪、可拖動排序的一串塊」由本元件的區塊模型承接，
   拖動邏輯照它原本的寫法搬進來（按住把手才可拖、把手聚焦時上／下鍵移動）。

   資料：blocks＝照先後排列的陣列（每個文字區塊各自一筆，不合併）
     [{ type:'text', text, html }, { type:'image', src }, { type:'video', src }, …]
     · text＝純文字（翻譯表、必填、proxy 用；清單項一行一項）
     · html＝格式版，只含 <p> <br> <strong> <em> <a href target rel> <ul> <ol> <li> <hr>（sanitize() 保證）
   舊資料（D335／D340：描述的 descBlocks 文字與媒體交錯、或說明區塊 infoSections）用 migrate() 轉成區塊。

   用法：
     var ed = window.ztorRichBody.mount(host, {
       blocks | text,            // 起始內容
       rows: 3,                  // 第一個文字區塊的最小列數（其餘 2 列）
       placeholder, placeholderKey,   // 第一個文字區塊的占位字（掛 key，切語言時重譯）
       label, labelKey,          // 文字區塊的 aria-label
       proxy,                    // 選填：宿主既有的表單元素（如 [data-ce="desc"]），本元件把所有文字區塊的純文字
                                 // 同步寫進 proxy.value 並補發 input——必填檢查、自動儲存照舊讀它
       maxMedia: 10,             // 整份描述的媒體上限（D354 決定五）
       feat, fmtFeat, addFeat,   // 選填：插入鈕群組／格式鈕群組／「新增描述」鈕的 data-feat（feature-scope-map）
       onChange                  // 每次變動呼叫
     });
     ed.get()    → blocks（空白文字區塊與沒有來源的媒體略過）
     ed.text()   → 所有文字區塊的純文字（段與段之間空一行）
     ed.media()  → 只有媒體 [{ type, src }]
     ed.set(v)   → 整批換掉（blocks 或字串）
     ed.lock(on) → 鎖定 bookyay 帶入的第 1 段（F21）：當下第一個文字區塊＋緊接在它後面的媒體區塊——
                   文字不可改、工具列與刪除鈕收起、媒體不可替換；仍可拖動調整位置（順序不是內容，ASSUMPTIONS UIA-196）。
                   lock(false) 全部解鎖。
     ed.lock(true, { all: true }) → 整份鎖定（D362，2026-10-07，修訂 D354 決定六）：bookyay 帶入的活動，
                   **所有區塊**（文字＋媒體）都鎖——不能改、不能刪、不能拖動排序（把手收起），也不能「新增描述」或插入圖片影片
                   （底部收起，add()／insert()／move() 不動作）；host 掛 .rich-body--locked。之後 set() 重畫也維持整份鎖定，
                   直到 lock(false)。沒有任何段落時留一個空的文字區塊、照樣鎖定（D335）。
     ed.add()    → 新增一個文字區塊（回傳該區塊）
     ed.insert(type, fileOrSrc, row?) → 在 row（文字區塊；省略＝游標所在或最後一個）之後插入媒體區塊
     ed.format(cmd, row?) → cmd＝bold／italic／link／ol／ul／hr
     ed.move(from, to)    → 把第 from 個區塊移到第 to 個位置（拖動與鍵盤排序用同一條路徑）
   掛載後 host.ztorRichBody＝同一個 api（驗收腳本與 cheat code 用）。
   靜態工具：window.ztorRichBody.toBlocks(v)／normalize／textOf／mediaOf／hasMedia／hasText／
     sanitize(html)／plainOf(html)／textToHtml(text)／isFormatted(html)／safeUrl(url)／
     fromHtml(html)（bookyay 一段富文本 → 一個文字區塊＋其後的媒體區塊）／migrate(desc, infoSections)／
     fieldKeys(base, blocks)、textFields(base, blocks)（翻譯欄位：每個有字的文字區塊一格，只有一格時沿用 base）
   變動時在 host 上發一顆冒泡的 `richbody:change`。樣式見 ds-components/rich-body.css。
   ============================================================ */
(function () {
  'use strict';

  var MAX_MEDIA = 10;

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- 連結（D354 決定四）：只收 http／https ---- */
  function safeUrl(u) {
    u = String(u == null ? '' : u).trim();
    if (!/^https?:\/\/\S+$/i.test(u)) return '';
    try {
      var x = new URL(u);
      return (x.protocol === 'http:' || x.protocol === 'https:') && x.hostname ? u : '';
    } catch (e) { return ''; }
  }
  function linkOpen(href) { return '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">'; }

  /* ---- 文字格式（D354）：粗體、斜體、連結、清單、分隔線 ---- */
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
  function wrap(tag, inner) { return blank(inner) ? inner : '<' + tag + '>' + inner + '</' + tag + '>'; }
  /* 行內節點：粗體、斜體、連結、清單留，其餘標記拆掉只留文字 */
  function cleanNode(n, inLi) {
    if (n.nodeType === 3) return esc(n.nodeValue.replace(/\s*\n\s*/g, ' '));
    if (n.nodeType !== 1) return '';
    var tag = n.nodeName;
    if (DROP[tag] || tag === 'HR') return '';   // 分隔線只在塊層成立（blockify 處理），行內與清單裡的去掉
    if (tag === 'BR') return '<br>';
    var inner;
    if (tag === 'STRONG' || tag === 'B') return wrap('strong', cleanKids(n, inLi));
    if (tag === 'EM' || tag === 'I') return wrap('em', cleanKids(n, inLi));
    if (tag === 'A') {
      inner = cleanKids(n, inLi);
      var href = safeUrl(n.getAttribute('href'));
      return href && !blank(inner) ? linkOpen(href) + inner + '</a>' : inner;
    }
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
    /* 其他行內標記（span…）：瀏覽器有時把粗體／斜體寫成 style，照樣認回來；其餘只留文字 */
    inner = cleanKids(n, inLi);
    var st = n.style || {};
    if (/^(bold|[6-9]00)$/.test(st.fontWeight || '')) inner = wrap('strong', inner);
    if (st.fontStyle === 'italic') inner = wrap('em', inner);
    return inner;
  }
  /* 容器層：連續的行內內容收成一個 <p>，清單、段落、分隔線各自成塊——存下來的結構只有 p／ul／ol／hr 四種塊 */
  function blockify(node) {
    var out = '', buf = '';
    function flush() { var b = trimBr(buf); if (!blank(b)) out += '<p>' + b + '</p>'; buf = ''; }
    Array.prototype.forEach.call(node.childNodes, function (c) {
      if (c.nodeType === 1 && (c.nodeName === 'UL' || c.nodeName === 'OL')) { flush(); out += cleanNode(c, false); }
      else if (c.nodeType === 1 && c.nodeName === 'HR') { flush(); out += '<hr>'; }
      else if (c.nodeType === 1 && BLOCKISH[c.nodeName]) { flush(); out += blockify(c); }
      else buf += cleanNode(c, false);
    });
    flush();
    return out;
  }
  function sanitize(html) { return blockify(parse(html)); }
  /* 純文字：段落之間空一行、清單一項一行（不加項目符號）；分隔線沒有文字 */
  function plainOf(html) {
    var out = '';
    function nl(n) { while (!new RegExp('\\n{' + n + '}$').test(out) && out) out += '\n'; }
    function walk(node) {
      Array.prototype.forEach.call(node.childNodes, function (c) {
        if (c.nodeType === 3) { out += c.nodeValue; return; }
        if (c.nodeType !== 1) return;
        var tag = c.nodeName;
        if (tag === 'BR') { out += '\n'; return; }
        if (tag === 'HR') { nl(2); return; }
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
  function isFormatted(html) { return /<(strong|em|a|ul|ol|hr)\b/.test(html || ''); }

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
  function hasContent(b) { return b.type === 'text' ? (!!b.text.trim() || /<hr>/.test(b.html)) : !!b.src; }
  /* 空白文字區塊與沒有來源的媒體略過；**每個文字區塊各自一筆，不合併**（D354：每個描述是一個區塊） */
  function normalize(blocks) {
    return toBlocks(blocks).filter(hasContent).map(function (b) {
      return b.type === 'text' ? { type: 'text', text: b.text, html: b.html } : { type: b.type, src: b.src };
    });
  }
  function translatable(b) { return b.type === 'text' && !!String(b.text || '').trim(); }
  function textOf(blocks) { return normalize(blocks).filter(translatable).map(function (b) { return b.text; }).join('\n\n'); }
  function mediaOf(blocks) { return normalize(blocks).filter(function (b) { return b.type !== 'text'; }); }
  function hasMedia(blocks) { return mediaOf(blocks).length > 0; }
  function hasText(blocks) { return !!textOf(blocks).trim(); }
  /* 翻譯欄位的 key：每個有字的文字區塊一格，譯文放回同一個區塊（媒體不翻譯、位置不變）。
     只有一格時沿用原本的一個 key（base）；n 格時是 base~0…base~(n-1)。只有分隔線的文字區塊沒有字、不列。 */
  function fieldKeys(base, blocks) {
    var n = normalize(blocks).filter(translatable).length;
    if (n <= 1) return [base];
    var keys = [];
    for (var i = 0; i < n; i++) keys.push(base + '~' + i);
    return keys;
  }
  function textFields(base, blocks) {
    var list = normalize(blocks).filter(translatable);
    var keys = fieldKeys(base, list);
    return list.map(function (b, i) { return { key: keys[i], text: b.text }; });
  }
  /* bookyay 活動詳情的一段（intros 的一筆）→ 區塊（D354 決定六）：
     段裡的文字收成**一個文字區塊**（粗體、斜體、連結、清單照原格式保留）；段裡的圖片與影片拆成各自的媒體區塊，
     排在那個文字區塊之後、照原先後順序。只有媒體的段落就只有媒體區塊。 */
  function fromHtml(html) {
    var media = [];
    var s = String(html || '').replace(/<img\b[^>]*>|<video\b[^>]*>[\s\S]*?<\/video>|<video\b[^>]*>/gi, function (m) {
      var src = (m.match(/\ssrc\s*=\s*"([^"]*)"/i) || [])[1] || '';
      if (src) media.push({ type: /^<img/i.test(m) ? 'image' : 'video', src: src });
      return '';
    });
    var h = sanitize(s);
    var blocks = [];
    if (plainOf(h) || /<hr>/.test(h)) blocks.push({ type: 'text', html: h, text: plainOf(h) });
    return blocks.concat(media);
  }
  /* 舊資料轉區塊（D354 決定八）：
     · 描述：字串或 D335／D340 的 descBlocks（文字與媒體交錯）——交錯的每一段文字各成一個文字區塊、媒體各成一個區塊，順序不變。
     · 說明區塊（D334，infoSections [{ title, body, blocks? }]）：每一塊的內文照上面轉，接在描述之後；
       標題有字 → 併進該塊第一個文字區塊的第一行並設為粗體（該塊第一個是媒體時，標題自成一個文字區塊放最前面）。 */
  function migrate(desc, info) {
    var out = toBlocks(desc == null ? '' : desc);
    (info || []).forEach(function (x) {
      if (!x) return;
      var bs = toBlocks(x.blocks && x.blocks.length ? x.blocks : (x.body || ''));
      var title = String(x.title || '').trim();
      if (title) {
        var head = '<p><strong>' + esc(title) + '</strong></p>';
        if (bs[0] && bs[0].type === 'text') bs[0] = textBlockOf({ html: head + bs[0].html });
        else bs.unshift(textBlockOf({ html: head }));
      }
      out = out.concat(bs);
    });
    return normalize(out);
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
    host.innerHTML =
      '<div class="rich-body__blocks" data-rb-blocks></div>' +
      '<div class="rich-body__foot">' +
        '<button class="btn btn--outline btn--add rich-body__add" type="button" data-rb-add>' +
          '<i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="rb.add">' + esc(T('rb.add', 'Add description')) + '</span></button>' +
        '<p class="field__hint rich-body__limit" data-rb-limit hidden></p>' +
      '</div>';
    var list = host.querySelector('[data-rb-blocks]');
    var limitEl = host.querySelector('[data-rb-limit]');
    if (opts.addFeat) host.querySelector('[data-rb-add]').setAttribute('data-feat', opts.addFeat);
    var picker = document.createElement('input');
    picker.type = 'file'; picker.hidden = true;
    host.appendChild(picker);
    var pickRow = null;                      // 按下插入鈕的那個文字區塊（選檔回來後插在它後面）
    var lastText = null, lastRange = null;   // 最後一次聚焦的文字塊與游標（插入點、格式鈕的作用對象）
    var linkCtx = null;                      // 開著的連結輸入列 { row, ed, range, anchor }
    var allLocked = false;                   // 整份鎖定（D362）：lock(true, { all: true })

    function icons(node) { if (window.ztorIcons) window.ztorIcons.applyIcons(node); }
    function placeholderText() { return opts.placeholderKey ? T(opts.placeholderKey, opts.placeholder || '') : (opts.placeholder || ''); }

    /* ---- 區塊殼：把手｜內容｜刪除（卡中卡 .card--muted，Q66）---- */
    function iconBtn(cls, hook, key, fb, icon) {
      return '<button class="btn btn--icon btn--sm ' + cls + '" type="button" ' + hook +
        ' aria-label="' + esc(T(key, fb)) + '" title="' + esc(T(key, fb)) + '" data-i18n-aria-label="' + key + '" data-i18n-title="' + key + '">' +
        '<i data-lucide="' + icon + '" class="ztor-icon"></i></button>';
    }
    function shell(kind) {
      var row = document.createElement('div');
      row.className = 'card card--muted rich-body__block';
      row.setAttribute('data-rb-block', kind);
      row.innerHTML =
        iconBtn('rich-body__grip', 'data-rb-grip', 'rb.move', 'Drag or use the arrow keys to reorder', 'grip-vertical') +
        '<div class="rich-body__main"></div>' +
        iconBtn('rich-body__remove', 'data-rb-remove', 'rb.remove', 'Remove', 'x');
      return row;
    }
    function fmtBtn(cmd, icon, key, fb) {
      return '<button class="btn btn--ghost btn--sm btn--icon" type="button" data-rb-fmt="' + cmd + '" aria-pressed="false" ' +
        'aria-label="' + esc(T(key, fb)) + '" title="' + esc(T(key, fb)) + '" data-i18n-aria-label="' + key + '" data-i18n-title="' + key + '">' +
        '<i data-lucide="' + icon + '" class="ztor-icon"></i></button>';
    }
    function toolsHTML() {
      return '<div class="rich-body__tools">' +
          '<div class="rich-body__fmt" role="group" aria-label="' + esc(T('rb.fmt', 'Text format')) + '" data-i18n-aria-label="rb.fmt"' +
            (opts.fmtFeat ? ' data-feat="' + esc(opts.fmtFeat) + '"' : '') + '>' +
            fmtBtn('bold', 'bold', 'rb.fmt.bold', 'Bold') +
            fmtBtn('italic', 'italic', 'rb.fmt.italic', 'Italic') +
            fmtBtn('link', 'link', 'rb.fmt.link', 'Link') +
            fmtBtn('ol', 'list-numbers', 'rb.fmt.ol', 'Numbered list') +
            fmtBtn('ul', 'list', 'rb.fmt.ul', 'Bulleted list') +
            fmtBtn('hr', 'separator', 'rb.fmt.hr', 'Divider') +
          '</div>' +
          '<div class="rich-body__ins"' + (opts.feat ? ' data-feat="' + esc(opts.feat) + '"' : '') + '>' +
            '<span class="rich-body__sep" aria-hidden="true"></span>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-rb-insert="image">' +
              '<i data-lucide="image" class="ztor-icon"></i> <span data-i18n="rb.insert.image">' + esc(T('rb.insert.image', 'Insert image')) + '</span></button>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-rb-insert="video">' +
              '<i data-lucide="film" class="ztor-icon"></i> <span data-i18n="rb.insert.video">' + esc(T('rb.insert.video', 'Insert video')) + '</span></button>' +
          '</div>' +
        '</div>' +
        /* 連結輸入列（D354 決定四）：按連結鈕才展開，只收 http／https */
        '<div class="rich-body__linkbar" data-rb-linkbar hidden>' +
          '<input class="input" type="url" inputmode="url" data-rb-link-input placeholder="https://" ' +
            'aria-label="' + esc(T('rb.link.url', 'Link URL')) + '" data-i18n-aria-label="rb.link.url">' +
          '<button class="btn btn--primary btn--sm" type="button" data-rb-link-apply><span data-i18n="rb.link.apply">' + esc(T('rb.link.apply', 'Apply')) + '</span></button>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-rb-link-unlink hidden><span data-i18n="rb.link.remove">' + esc(T('rb.link.remove', 'Remove link')) + '</span></button>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-rb-link-cancel><span data-i18n="rb.link.cancel">' + esc(T('rb.link.cancel', 'Cancel')) + '</span></button>' +
          '<p class="field__error rich-body__link-err" data-rb-link-err data-i18n="rb.link.err" hidden>' + esc(T('rb.link.err', 'Enter a link that starts with http:// or https://')) + '</p>' +
        '</div>';
    }
    function textBlock(html, first) {
      var row = shell('text');
      var main = row.querySelector('.rich-body__main');
      main.innerHTML = toolsHTML();
      var ed = document.createElement('div');
      ed.className = 'textarea rich-body__text';
      ed.setAttribute('data-rb-text', '');
      ed.setAttribute('role', 'textbox');
      ed.setAttribute('aria-multiline', 'true');
      ed.contentEditable = 'true';
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
      decorateLinks(ed);
      markBlank(ed);
      main.appendChild(ed);
      return row;
    }
    function markBlank(ed) { ed.classList.toggle('is-blank', !plainOf(ed.innerHTML) && !/<(li|hr)\b/i.test(ed.innerHTML)); }
    /* 編輯中的連結也帶 target／rel（粉絲端新分頁開啟），讀回時 sanitize 會再補一次 */
    function decorateLinks(ed) {
      ed.querySelectorAll('a').forEach(function (a) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });
    }

    /* 媒體區塊＝區塊殼裡放一格 .upload-tile（partials/upload-tile.js 增強）。src 有值＝既有檔（預填）；
       file 有值＝剛選的檔，交給上傳格自己的 input 跑上傳過場。上傳格自己的刪除鈕收起（CSS），刪除走區塊的 ✕。 */
    function mediaBlock(type, src, file) {
      var row = shell(type);
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
      row.querySelector('.rich-body__main').appendChild(tile);
      if (window.ztorUploadTile) window.ztorUploadTile.enhance(tile);
      if (file && window.DataTransfer) {
        var input = tile.querySelector('.upload-tile__input');
        try {
          var dt = new DataTransfer(); dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change'));
        } catch (e) { /* 舊瀏覽器沒有 DataTransfer 建構子：格子留空，運營點它自己選 */ }
      }
      return row;
    }
    /* 預覽框照媒體本身的長寬比（D340：尺寸比例不限）。load／loadedmetadata 不冒泡，用捕獲階段在 host 一次接住。 */
    function fitRatio(e) {
      var tile = e.target.closest && e.target.closest('[data-rb-media]');
      if (!tile) return;
      var t = e.target;
      var w = t.naturalWidth || t.videoWidth, h = t.naturalHeight || t.videoHeight;
      if (w && h) tile.style.setProperty('--rb-ratio', w + ' / ' + h);
    }
    host.addEventListener('load', fitRatio, true);
    host.addEventListener('loadedmetadata', fitRatio, true);

    function rows() { return [].slice.call(list.children).filter(function (n) { return n.hasAttribute('data-rb-block'); }); }
    function textRows() { return rows().filter(function (r) { return r.getAttribute('data-rb-block') === 'text'; }); }
    function isText(r) { return !!r && r.getAttribute('data-rb-block') === 'text'; }
    function rowOf(node) { var el = node && (node.nodeType === 1 ? node : node.parentNode); return el && el.closest ? el.closest('[data-rb-block]') : null; }

    function render(blocks) {
      list.innerHTML = '';
      var bs = toBlocks(blocks).filter(function (b) { return b.type === 'text' || b.src; });
      /* 至少一個文字區塊（必填的描述）；只有媒體時在最前面補一個空的 */
      if (!bs.some(function (b) { return b.type === 'text'; })) bs.unshift({ type: 'text', html: '' });
      var firstText = true;
      bs.forEach(function (b) {
        if (b.type === 'text') { list.appendChild(textBlock(b.html, firstText)); firstText = false; }
        else list.appendChild(mediaBlock(b.type, b.src));
      });
      lastText = null; lastRange = null; linkCtx = null;
      /* 整份鎖定中被 set() 重畫（D362）：新畫出來的區塊照樣全部鎖住 */
      if (allLocked) rows().forEach(function (r) { setLocked(r, true); });
      icons(list);
      syncState();
    }

    function readDom() {
      return rows().map(function (r) {
        if (isText(r)) { var h = sanitize(r.querySelector('[data-rb-text]').innerHTML); return { type: 'text', html: h, text: plainOf(h) }; }
        var v = r.querySelector('.upload-tile__video.is-shown');
        var img = r.querySelector('.upload-tile__thumb');
        var src = (v && v.getAttribute('src')) || (img && img.getAttribute('src')) || '';
        return { type: v ? 'video' : (r.getAttribute('data-rb-block') === 'video' ? 'video' : 'image'), src: src };
      });
    }
    function get() { return normalize(readDom()); }
    function text() { return textOf(readDom()); }
    function media() { return mediaOf(readDom()); }
    function mediaCount() { return list.querySelectorAll('[data-rb-media]').length; }

    /* 媒體上限（D354 決定五：整份描述最多 10 個）：滿了所有插入鈕停用、區塊下方說明 */
    function syncLimit() {
      var full = mediaCount() >= maxMedia;
      host.querySelectorAll('[data-rb-insert]').forEach(function (b) { b.disabled = full; });
      limitEl.hidden = !full;
      limitEl.textContent = full ? T('rb.limit', 'Up to {n} images and videos in total').replace('{n}', maxMedia) : '';
    }
    /* 文字區塊不能刪到一個都不剩：只剩一個時它的刪除鈕停用 */
    function syncRemove() {
      var ts = textRows();
      ts.forEach(function (r) { r.querySelector('[data-rb-remove]').disabled = ts.length <= 1; });
    }
    function syncState() {
      host.classList.toggle('rich-body--has-media', !!list.querySelector('[data-rb-media]'));
      syncLimit();
      syncRemove();
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

    /* ---- 游標：只記在本編輯器的文字塊裡的位置 ---- */
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
      var inside = s && s.rangeCount && host.contains(s.anchorNode) && textOfNode(s.anchorNode);
      var row = inside ? rowOf(s.anchorNode) : null;
      var anc = inside && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode);
      var within = function (tag) { var x = anc && anc.closest && anc.closest(tag); return !!(x && host.contains(x)); };
      var q = function (c) { try { return document.queryCommandState(c); } catch (e) { return false; } };
      var state = inside ? { bold: q('bold'), italic: q('italic'), link: within('a'), ul: within('ul'), ol: within('ol'), hr: false } : {};
      host.querySelectorAll('[data-rb-fmt]').forEach(function (b) {
        var mine = row && row.contains(b);
        b.setAttribute('aria-pressed', mine && state[b.getAttribute('data-rb-fmt')] ? 'true' : 'false');
      });
    }
    function caretToEnd(ed) {
      ed.focus();
      var r = document.createRange(); r.selectNodeContents(ed); r.collapse(false);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    function lastTextRow() { var ts = textRows().filter(function (r) { return !r.classList.contains('is-locked'); }); return ts[ts.length - 1] || null; }
    /* 格式作用的對象：指定的區塊 → 游標所在 → 最後一個可編輯的文字區塊；游標不在該區塊時放到它的尾端 */
    function targetRow(row) { return row || (lastText && lastText.isConnected ? rowOf(lastText) : null) || lastTextRow(); }
    function focusRow(row) {
      var ed = row.querySelector('[data-rb-text]');
      if (lastRange && lastText === ed && ed.contains(lastRange.startContainer)) {
        ed.focus();
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(lastRange);
      } else caretToEnd(ed);
      return ed;
    }
    /* 清單與分隔線不交給 execCommand：Chrome 的 insertOrderedList／insertUnorderedList 在段落裡會把清單包進 <p>
       （<p><ol>…</ol></p>）並把游標丟到清單開頭，insertHorizontalRule 也會留下 id="null"。這兩種改成自己動 DOM：
       以「文字塊的直接子節點」為一塊（段落、清單、分隔線），結果與 sanitize() 收出來的結構同形。 */
    var BLOCK_TAG = /^(P|UL|OL|HR|DIV|H[1-6]|BLOCKQUOTE|PRE)$/;
    function topBlock(ed, node) {
      var n = node;
      if (!n || n === ed) return null;
      while (n && n.parentNode !== ed) n = n.parentNode;
      return n;
    }
    function caretAt(node, offset) {
      var r = document.createRange();
      r.setStart(node, Math.min(offset, node.nodeType === 3 ? node.nodeValue.length : node.childNodes.length));
      r.collapse(true);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    /* 把文字塊頂層的散落行內節點（裸文字、<b>…）收進 <p>，之後每一塊都是段落／清單／分隔線 */
    function wrapLoose(ed) {
      var buf = [];
      function flush(before) {
        if (!buf.length) return;
        var p = document.createElement('p');
        ed.insertBefore(p, before);
        buf.forEach(function (x) { p.appendChild(x); });
        buf = [];
      }
      [].slice.call(ed.childNodes).forEach(function (k) {
        if (k.nodeType === 1 && BLOCK_TAG.test(k.nodeName)) flush(k);
        else if (k.nodeType === 1 || (k.nodeType === 3 && k.nodeValue.trim())) buf.push(k);
        else if (k.nodeType === 3) k.remove();
      });
      flush(null);
    }
    function selectedBlocks(ed) {
      var s = window.getSelection();
      var r = s.rangeCount ? s.getRangeAt(0) : null;
      if (!r) return [];
      var a = topBlock(ed, r.startContainer) || ed.childNodes[r.startOffset] || ed.lastChild;
      var z = topBlock(ed, r.endContainer) || a;
      var out = [], n = a;
      while (n) { out.push(n); if (n === z) break; n = n.nextSibling; }
      return out;
    }
    function toggleList(ed, tag) {
      var s = window.getSelection(), r = s.getRangeAt(0);
      var sc = r.startContainer, so = r.startOffset;
      wrapLoose(ed);
      if (!ed.firstChild) ed.innerHTML = '<p><br></p>';
      if (!ed.contains(sc) || sc === ed) { sc = ed.firstChild; so = 0; caretAt(sc, 0); }
      var blocks = selectedBlocks(ed).filter(function (b) { return b.nodeName !== 'HR'; });
      if (!blocks.length) return;
      if (blocks.every(function (b) { return b.nodeName === tag; })) {
        /* 已經是這種清單：拿掉清單，每一項回到一個段落 */
        blocks.forEach(function (list) {
          [].slice.call(list.children).forEach(function (li) {
            var p = document.createElement('p');
            while (li.firstChild) p.appendChild(li.firstChild);
            if (!p.firstChild) p.appendChild(document.createElement('br'));
            list.parentNode.insertBefore(p, list);
          });
          list.remove();
        });
      } else {
        var list = document.createElement(tag);
        ed.insertBefore(list, blocks[0]);
        blocks.forEach(function (b) {
          if (b.nodeName === 'UL' || b.nodeName === 'OL') { while (b.firstChild) list.appendChild(b.firstChild); b.remove(); return; }
          var li = document.createElement('li');
          while (b.firstChild) li.appendChild(b.firstChild);
          if (!li.firstChild) li.appendChild(document.createElement('br'));
          list.appendChild(li);
          b.remove();
        });
        /* 緊鄰的同種清單併成一串（段落接在清單後面再按一次清單＝續寫同一份清單） */
        var prev = list.previousSibling, next = list.nextSibling;
        if (prev && prev.nodeName === tag) { while (list.firstChild) prev.appendChild(list.firstChild); list.remove(); list = prev; }
        if (next && next.nodeName === tag) { while (next.firstChild) list.appendChild(next.firstChild); next.remove(); }
      }
      if (ed.contains(sc)) caretAt(sc, so); else caretToEnd(ed);
    }
    /* 分隔線：插在游標所在那一塊之後（空白段落就直接換成分隔線），後面沒有段落時補一個空段落讓人接著寫 */
    function insertRule(ed) {
      wrapLoose(ed);
      var blk = selectedBlocks(ed).pop() || null;
      var hr = document.createElement('hr');
      if (blk && blk.nodeName === 'P' && !blk.textContent.trim()) { blk.parentNode.replaceChild(hr, blk); }
      else if (blk) blk.after(hr);
      else ed.appendChild(hr);
      var nxt = hr.nextSibling;
      if (!nxt || nxt.nodeName !== 'P') { nxt = document.createElement('p'); nxt.appendChild(document.createElement('br')); hr.after(nxt); }
      caretAt(nxt, 0);
    }
    function format(cmd, row) {
      row = targetRow(row);
      if (!row || !isText(row) || row.classList.contains('is-locked')) return;
      if (cmd === 'link') { openLink(row); return; }
      ensureParagraphSep();
      var ed = focusRow(row);
      if (cmd === 'ol' || cmd === 'ul') toggleList(ed, cmd.toUpperCase());
      else if (cmd === 'hr') insertRule(ed);
      else if (cmd === 'bold' || cmd === 'italic') { try { document.execCommand(cmd, false, null); } catch (e) { return; } }
      else return;
      markBlank(ed);
      remember();
      changed();
    }

    /* ---- 連結（D354 決定四）---- */
    function anchorIn(range, ed) {
      var n = range.startContainer; n = n.nodeType === 1 ? n : n.parentNode;
      var a = n && n.closest ? n.closest('a') : null;
      return a && ed.contains(a) ? a : null;
    }
    function linkParts(row) {
      var bar = row.querySelector('[data-rb-linkbar]');
      return { bar: bar, input: bar.querySelector('[data-rb-link-input]'), err: bar.querySelector('[data-rb-link-err]'), unlink: bar.querySelector('[data-rb-link-unlink]') };
    }
    function openLink(row) {
      if (linkCtx && linkCtx.row !== row) closeLink(false);
      var ed = focusRow(row);
      var s = window.getSelection();
      var range = s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
      if (!range) return;
      var a = anchorIn(range, ed);
      linkCtx = { row: row, ed: ed, range: range, anchor: a };
      var p = linkParts(row);
      p.bar.hidden = false;
      p.input.value = a ? a.getAttribute('href') : '';
      p.unlink.hidden = !a;
      p.err.hidden = true;
      p.input.removeAttribute('aria-invalid');
      row.querySelector('[data-rb-fmt="link"]').setAttribute('aria-pressed', 'true');
      p.input.focus();
      p.input.select();
    }
    function closeLink(restore) {
      if (!linkCtx) return;
      var c = linkCtx;
      linkCtx = null;
      var p = linkParts(c.row);
      p.bar.hidden = true;
      p.err.hidden = true;
      if (restore && c.ed.isConnected) {
        c.ed.focus();
        var s = window.getSelection(); s.removeAllRanges();
        if (c.ed.contains(c.range.startContainer)) s.addRange(c.range); else caretToEnd(c.ed);
      }
      syncPressed();
    }
    function applyLink() {
      if (!linkCtx) return;
      var c = linkCtx, p = linkParts(c.row);
      var url = safeUrl(p.input.value);
      if (!url) { p.err.hidden = false; p.input.setAttribute('aria-invalid', 'true'); p.input.focus(); return; }
      if (c.anchor && c.anchor.isConnected) c.anchor.setAttribute('href', url);
      else {
        c.ed.focus();
        var s = window.getSelection(); s.removeAllRanges();
        if (c.ed.contains(c.range.startContainer)) s.addRange(c.range); else caretToEnd(c.ed);
        try {
          /* 沒選字：插入網址本身當連結文字；有選字：把選取包成連結 */
          if (s.getRangeAt(0).collapsed) document.execCommand('insertHTML', false, linkOpen(url) + esc(url) + '</a>');
          else document.execCommand('createLink', false, url);
        } catch (e) { /* execCommand 不可用：不動內文 */ }
      }
      decorateLinks(c.ed);
      closeLink(true);
      markBlank(c.ed);
      changed();
    }
    function unlink() {
      if (!linkCtx) return;
      var c = linkCtx, a = c.anchor;
      if (a && a.isConnected) {
        while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a);
        a.remove();
      }
      closeLink(true);
      changed();
    }

    /* ---- 插入媒體：在文字區塊之後（已經跟在它後面的媒體之後），成為獨立區塊 ---- */
    function insert(type, fileOrSrc, row) {
      if (allLocked) return null;            // 整份鎖定（D362）：不能插入
      if (mediaCount() >= maxMedia) { syncLimit(); return null; }
      row = targetRow(row);
      var src = typeof fileOrSrc === 'string' ? fileOrSrc : '';
      var tileRow = mediaBlock(type === 'video' ? 'video' : 'image', src, src ? null : fileOrSrc);
      if (row) {
        var at = row;
        while (at.nextElementSibling && at.nextElementSibling.hasAttribute('data-rb-block') && !isText(at.nextElementSibling)) at = at.nextElementSibling;
        at.after(tileRow);
      } else list.appendChild(tileRow);
      icons(tileRow);
      changed();
      return tileRow;
    }
    function add() {
      if (allLocked) return null;            // 整份鎖定（D362）：不能新增描述
      var row = textBlock('', false);
      list.appendChild(row);
      icons(row);
      changed();
      return row;
    }
    function removeRow(row) {
      if (!row || row.classList.contains('is-locked')) return;
      if (isText(row) && textRows().length <= 1) return;
      if (linkCtx && linkCtx.row === row) linkCtx = null;
      /* 焦點不跟著被刪的那一塊消失：交給上一塊（沒有就下一塊）的把手，都沒有就交給新增鈕 */
      var next = row.previousElementSibling || row.nextElementSibling;
      if (lastText && row.contains(lastText)) { lastText = null; lastRange = null; }
      row.remove();
      (next ? next.querySelector('[data-rb-grip]') : host.querySelector('[data-rb-add]')).focus();
      changed();
    }
    function move(from, to) {
      if (allLocked) return;                 // 整份鎖定（D362）：不能調整順序
      var rs = rows();
      var r = rs[from];
      if (!r || to < 0 || to >= rs.length || from === to) return;
      rs.splice(from, 1);
      rs.splice(to, 0, r);
      rs.forEach(function (x) { list.appendChild(x); });
      changed();
    }

    /* ---- 事件 ---- */
    /* 格式鈕：mousedown 先擋掉，選取與焦點才不會被按鈕搶走 */
    host.addEventListener('mousedown', function (e) { if (e.target.closest('[data-rb-fmt]')) e.preventDefault(); });
    host.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-rb-add]')) { var nr = add(); if (nr) nr.querySelector('[data-rb-text]').focus(); return; }
      var f = t.closest('[data-rb-fmt]');
      if (f) { format(f.getAttribute('data-rb-fmt'), rowOf(f)); return; }
      if (t.closest('[data-rb-link-apply]')) { applyLink(); return; }
      if (t.closest('[data-rb-link-unlink]')) { unlink(); return; }
      if (t.closest('[data-rb-link-cancel]')) { closeLink(true); return; }
      var rm = t.closest('[data-rb-remove]');
      if (rm) { if (!rm.disabled) removeRow(rowOf(rm)); return; }
      var btn = t.closest('[data-rb-insert]');
      if (!btn || btn.disabled) return;
      pickRow = rowOf(btn);
      picker.accept = btn.getAttribute('data-rb-insert') === 'video' ? 'video/*' : 'image/*';
      picker.dataset.type = btn.getAttribute('data-rb-insert');
      picker.value = '';
      picker.click();
    });
    picker.addEventListener('change', function () {
      var f = picker.files && picker.files[0];
      if (f) insert(picker.dataset.type || 'image', f, pickRow && pickRow.isConnected ? pickRow : null);
      pickRow = null;
    });
    host.addEventListener('keydown', function (e) {
      /* 連結輸入列：Enter 套用、Esc 取消 */
      if (e.target.matches && e.target.matches('[data-rb-link-input]')) {
        if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
        else if (e.key === 'Escape') { e.preventDefault(); closeLink(true); }
        return;
      }
      /* 鍵盤排序：把手聚焦時上／下鍵把這一塊往前／往後移一格，焦點留在把手上 */
      var g = e.target.closest && e.target.closest('[data-rb-grip]');
      if (!g || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      e.preventDefault();
      var rs = rows(), i = rs.indexOf(rowOf(g));
      move(i, e.key === 'ArrowUp' ? i - 1 : i + 1);
      g.focus();
    });
    /* 拖動排序（沿用 info-sections.js 的寫法）：按住把手才讓那一塊可拖（row.draggable 在 pointerdown 開、dragend 關），
       避免在文字裡選字時誤拖 */
    var dragging = null;
    host.addEventListener('pointerdown', function (e) {
      var g = e.target.closest('[data-rb-grip]');
      if (g && !allLocked) rowOf(g).draggable = true;
    });
    host.addEventListener('pointerup', function () {
      rows().forEach(function (r) { if (r !== dragging) r.draggable = false; });
    });
    list.addEventListener('dragstart', function (e) {
      var row = e.target.closest && e.target.closest('[data-rb-block]');
      if (!row || !row.draggable) return;   // 文字區塊裡拖選字等原生拖曳不攔（dragover 只在拖區塊時接手）
      dragging = row;
      row.classList.add('is-dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); } catch (_) {}
    });
    list.addEventListener('dragover', function (e) {
      if (!dragging) return;
      e.preventDefault();
      var over = e.target.closest && e.target.closest('[data-rb-block]');
      if (!over || over === dragging || over.parentNode !== list) return;
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

    host.addEventListener('upload:change', function (e) {
      var tile = e.target.closest && e.target.closest('[data-rb-media]');
      if (!tile || !host.contains(tile)) return;
      /* 上傳格被清空（替換時取消等）＝這個媒體不要了：拿掉整個區塊 */
      if (e.detail && e.detail.state === 'empty') { var r = rowOf(tile); if (r) { r.remove(); changed(); } }
      else changed();
    });
    host.addEventListener('input', function (e) {
      var ed = e.target.closest && e.target.closest('[data-rb-text]');
      if (!ed) return;
      markBlank(ed);
      remember();
      changed();
    });
    /* 貼上一律轉純文字：來源帶進來的字級、顏色不留（格式用工具列自己套） */
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
      /* 空白的文字塊先放一個空段落再讓人打字：第一行若是裸文字，Enter 之後的段落與清單會被瀏覽器包進同一個 <p>
         （<p><ol>…</ol></p>），游標跳到清單開頭——一開始就在段落裡，清單與分隔線才會照游標位置成形 */
      if (!plainOf(ed.innerHTML) && !/<(li|hr)\b/i.test(ed.innerHTML) && !ed.querySelector('p')) {
        ed.innerHTML = '<p><br></p>';
        var r = document.createRange(); r.setStart(ed.firstChild, 0); r.collapse(true);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }
    });
    /* 編輯中點到連結不跳頁（contenteditable 裡的 <a> 在某些瀏覽器仍可點） */
    host.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-rb-text] a'); if (a) e.preventDefault(); }, true);
    document.addEventListener('selectionchange', function () {
      var s = window.getSelection();
      if (s && s.rangeCount && host.contains(s.anchorNode) && textOfNode(s.anchorNode)) remember();
      else if (!linkCtx) host.querySelectorAll('[data-rb-fmt][aria-pressed="true"]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    });
    /* 焦點離開整個編輯器時：空白文字塊清乾淨（只剩 <br> 的殘影），並對 proxy 補一個 blur（宿主的必填檢查掛在 proxy 的 blur 上） */
    host.addEventListener('focusout', function (e) {
      if (e.relatedTarget && host.contains(e.relatedTarget)) return;
      list.querySelectorAll('[data-rb-text].is-blank').forEach(function (ed) { if (ed.innerHTML) ed.innerHTML = ''; });
      if (opts.proxy) opts.proxy.dispatchEvent(new Event('blur'));
    });
    /* proxy 被宿主叫 focus()（必填未過、跳到該欄）時，焦點交給第一個可編輯的文字塊 */
    if (opts.proxy) {
      opts.proxy.focus = function () { var t = list.querySelector('.rich-body__block:not(.is-locked) [data-rb-text]'); if (t) t.focus(); };
    }
    /* 占位字與上限說明跟著語言換（i18n 的 data-i18n-placeholder 只寫 .placeholder 屬性，對 contenteditable 沒有作用） */
    document.addEventListener('i18n:applied', function () {
      host.querySelectorAll('[data-rb-ph-key]').forEach(function (ed) { ed.setAttribute('data-placeholder', T(ed.getAttribute('data-rb-ph-key'), opts.placeholder || '')); });
      syncLimit();
    });

    function set(v) { render(v); }
    function setLocked(row, on) {
      row.classList.toggle('is-locked', on);
      var ed = row.querySelector('[data-rb-text]');
      if (ed) {
        ed.contentEditable = on ? 'false' : 'true';
        if (on) ed.setAttribute('aria-disabled', 'true'); else ed.removeAttribute('aria-disabled');
      }
    }
    function lock(on, o) {
      allLocked = !!(on && o && o.all);
      host.classList.toggle('rich-body--locked', allLocked);
      if (!on) { rows().forEach(function (r) { setLocked(r, false); }); syncState(); return; }
      /* 整份鎖定（D362）：每個區塊都鎖；把手、新增描述、插入鈕由 .rich-body--locked 收起（rich-body.css） */
      if (allLocked) {
        if (linkCtx) closeLink(false);
        rows().forEach(function (r) { setLocked(r, true); });
        syncState();
        return;
      }
      var rs = rows(), i = 0;
      while (i < rs.length && !isText(rs[i])) i++;
      if (i >= rs.length) return;
      setLocked(rs[i], true);
      for (var j = i + 1; j < rs.length && !isText(rs[j]); j++) setLocked(rs[j], true);
      syncState();
    }

    render(opts.blocks != null ? opts.blocks : (opts.text || ''));
    icons(host);
    var api = { el: host, get: get, text: text, media: media, set: set, lock: lock, add: add, insert: insert, format: format, move: move };
    host.ztorRichBody = api;
    return api;
  }

  window.ztorRichBody = {
    mount: mount, MAX_MEDIA: MAX_MEDIA,
    toBlocks: toBlocks, normalize: normalize, textOf: textOf, mediaOf: mediaOf, hasMedia: hasMedia, hasText: hasText,
    sanitize: sanitize, plainOf: plainOf, textToHtml: textToHtml, isFormatted: isFormatted, safeUrl: safeUrl,
    fromHtml: fromHtml, migrate: migrate, fieldKeys: fieldKeys, textFields: textFields
  };
})();
