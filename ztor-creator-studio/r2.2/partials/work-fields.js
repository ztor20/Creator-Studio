/* work-fields.js · 影片作品欄位的單一來源（2026-08-10）
   ------------------------------------------------------------------
   規格：documents/5.1.2.2.1-作品上架流程.md F1–F15。

   為什麼要有這支：作品上架的那組欄位現在有兩個宿主——
     1) publish-work.html：共創／預購成立後的事後上架（四步）
     2) create-project.html：直接發佈影片家族的建立流程（五步，2026-08-10 整併）
   純靜態站台沒有 HTML 片段引用機制，兩頁若各寫一份 markup，欄位規格只有一份、
   實作卻有兩份，日後改一邊就會分岔。所以把「一個欄位區塊長什麼樣」收進這支
   vanilla JS 元件：兩頁都只給一個空容器，由本檔渲染完整的 .form-section。

   為什麼是 JS 元件而不是 HTML partial：這些區塊每一個都會自己工作——字幕可增可刪、
   劇照填滿長下一格、語言組不准重複、幣種切換要改所有金額符號、就緒檢查要即時重算。
   「只是切出畫面」才用 partial，「自己會工作」用 component（見 project-ui-creator 的
   Frontend Architecture Strategy）。

   對外 API（window.ZtorWorkFields）：
     render(host, kind, opts)  把某個欄位區塊渲染進 host，回傳該 <section>
     collect(opts)             把畫面上的值收成送審內容物件（work-review-store 的 work 欄位）
     checks(opts)             回傳就緒檢查項清單（規格 §8 的必填齊全）
     fill(work, opts)          把 collect() 形狀的資料寫回畫面（編輯已上架作品時用）

   fill 的分工：每個區塊自己知道怎麼把值放回去，所以把還原函式掛在該區塊的
   <section> 上（`_fill`），fill() 只負責找出畫面上有哪些區塊並逐一呼叫。宿主頁
   放了哪幾塊、順序如何，模組不需要知道。
   kind 值域：file / audio / subs / cover / stills / bts / trailer /
             copy / spec / genres / tags / age / pricing / credits

   本檔不自帶 CSS：所有外觀都來自既有元件（form-section、form-grid、field-system、
   card、upload-tile、chip、tag-input、segmented、switch、control-row、amount-field、
   entry-list、badge）。新增樣式一律回那些元件改，不在這裡寫死。
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb || k; };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  function enhance(node) {
    if (window.ztorIcons) window.ztorIcons.applyIcons(node);
    if (window.applyI18n) window.applyI18n(node);
  }
  /* 非 input／change 的互動（chip 點選、開關、卡片增刪）沒有原生事件可讓宿主頁掛，
     所以統一補一顆 document 級事件；就緒檢查與摘要都只聽這一個。 */
  function emit() { document.dispatchEvent(new CustomEvent('workfields:change')); }
  function upload(node) {
    if (window.ztorUploadTile) {
      node.querySelectorAll('[data-upload]').forEach(function (t) { window.ztorUploadTile.enhance(t); });
    }
  }
  /* 每個區塊都是一張 .form-section 外框卡；標題與副標由區塊自己決定，
     宿主頁只負責決定「這個區塊放在第幾步」。 */
  function section(host, titleKey, titleFb, subKey, subFb) {
    var s = document.createElement('section');
    s.className = 'form-section form-section--outlined';
    var head = '<div class="form-section__head">'
      + '<h3 class="form-section__title" data-i18n="' + titleKey + '">' + esc(T(titleKey, titleFb)) + '</h3>'
      + (subKey ? '<p class="form-section__sub" data-i18n="' + subKey + '">' + esc(T(subKey, subFb)) + '</p>' : '')
      + '</div>';
    s.innerHTML = head;
    host.appendChild(s);
    return s;
  }

  /* 語言值域：字幕、原始語音、文案語言三處都從這裡取，不各自寫一份清單。 */
  var SUB_LANGS = ['pw.lang.yue', 'pw.lang.cmn', 'pw.lang.en', 'pw.lang.ja', 'pw.lang.ko'];
  var AUDIO_LANGS = ['pw.lang.yue', 'pw.lang.cmn', 'pw.lang.en', 'pw.lang.ja', 'pw.lang.ko', 'pw.lang.none'];
  var COPY_LANGS = ['pw.lang.zh', 'pw.lang.enName', 'pw.lang.ja', 'pw.lang.ko'];
  var COPY_PH = {
    'pw.lang.zh': { t: 'pw.info.title.ph-zh', d: 'pw.info.desc.ph' },
    'pw.lang.enName': { t: 'pw.info.title.ph-en', d: 'pw.info.desc.ph-en' }
  };
  /* 題材（分類）與年齡分級的值域住在 js/work-taxonomy.js——建立項目流程的影視組與項目公開資訊
     也吃同一份（主規格 §7.1.2、§7.11 明講三處是同一份資料）。本檔不再自帶副本。 */
  var TAX = window.ZtorWorkTaxonomy;
  var AGES = TAX.AGES;
  var QUALITY_PRESETS = ['4K', 'HD-1080P', 'SD-720P', 'HD-720P', 'SD-480P'];
  var CREDIT_CAST = ['lead-m', 'lead-f', 'sup-m', 'sup-f'];
  var CREDIT_CREW = ['director', 'editor', 'producer', 'writer', 'studio'];
  var VIDEO_STATE = {
    empty: { key: 'pw.media.file.state.empty', fb: 'Not uploaded', tone: 'badge--neutral' },
    uploading: { key: 'pw.media.file.state.uploading', fb: 'Uploading', tone: 'badge--info' },
    processing: { key: 'pw.media.file.state.processing', fb: 'Processing', tone: 'badge--warning' },
    ready: { key: 'pw.media.file.state.ready', fb: 'Ready', tone: 'badge--success' }
  };

  /* ── 編輯態還原（fill）的共用小工具 ────────────────────────────────
     原型不真的存檔案，送審內容裡的素材只有檔名與筆數（見 collect 的說明），
     所以「還原成已上傳」＝把格子切成已填狀態並寫回檔名，不重跑一次假上傳。 */
  function markFilled(tile, name, thumbSrc) {
    if (!tile) return;
    tile.classList.remove('is-empty');
    tile.classList.add('is-filled');
    var img = tile.querySelector('.upload-tile__thumb');
    if (img && thumbSrc) img.src = thumbSrc;
    var fn = tile.querySelector('.upload-tile__filename');
    if (fn && name) fn.textContent = name;
    var mark = tile.querySelector('.upload-tile__filemark');
    if (mark && name) mark.classList.add('is-shown');
    /* 冒泡出去讓消費頁與容器跟上：F1 的狀態徽章、劇照的「填滿就長下一格」、
       宿主頁的就緒檢查都聽這顆事件。 */
    tile.dispatchEvent(new CustomEvent('upload:change', { bubbles: true, detail: { key: null, filled: true, state: 'filled' } }));
  }
  /* 存進去的值不見得還在值域裡（值域改過、或那筆是更早的資料形狀）。硬寫進 <select>
     會讓它變成空白選項——看起來像創作者當初沒填。對不上就維持預設值。 */
  function setVal(el, v) {
    if (!el || v == null || v === '') return;
    if (el.tagName === 'SELECT' && !el.querySelector('option[value="' + String(v).replace(/"/g, '\\"') + '"]')) return;
    el.value = v;
  }

  /* 沒有 i18n 時的退路字樣（design-system.html 這類不載 i18n.js 的頁面會吃到）。
     退路若是 key 本身，選單會顯示「pw.lang.yue」——那不是語言，是字典鍵。
     字面與 js/i18n.js 的英文值一致，兩邊看到的是同一個詞。 */
  var OPT_FB = {
    'pw.lang.yue': 'Cantonese', 'pw.lang.cmn': 'Mandarin', 'pw.lang.en': 'English',
    'pw.lang.ja': 'Japanese', 'pw.lang.ko': 'Korean', 'pw.lang.none': 'No dialogue',
    'pw.lang.zh': 'Traditional Chinese', 'pw.lang.enName': 'English',
    'pw.age.all': 'Everyone', 'pw.age.7': '7+', 'pw.age.10': '10+',
    'pw.age.13': '13+', 'pw.age.16': '16+', 'pw.age.18': '18+'
  };

  function optionsHtml(keys, selected) {
    return keys.map(function (k) {
      return '<option value="' + k + '"' + (k === selected ? ' selected' : '') + ' data-i18n="' + k + '">' + esc(T(k, OPT_FB[k] || k)) + '</option>';
    }).join('');
  }

  /* ── F1 影片檔 ＋ 上傳與處理狀態 ──────────────────────────────────────
     狀態是系統產生、創作者不可編輯，所以做成卡頭的唯讀徽章而不是欄位；
     轉檔沒跑完就不算就緒，送出會被擋（規格 §8）。 */
  function renderFile(host) {
    var s = document.createElement('section');
    s.className = 'form-section form-section--outlined';
    s.innerHTML =
      '<div class="form-section__head form-section__head--actions">'
      + '<div class="form-section__head-titles">'
      + '<h3 class="form-section__title" data-i18n="pw.media.file.title">' + esc(T('pw.media.file.title', 'Video file')) + '</h3>'
      + '<p class="form-section__sub" data-i18n="pw.media.file.sub">' + esc(T('pw.media.file.sub', 'MP4 or MOV, up to 20 GB.')) + '</p>'
      + '</div>'
      + '<div class="form-section__head-actions"><span class="badge badge--neutral" data-pw-video-state data-i18n="pw.media.file.state.empty">'
      + esc(T('pw.media.file.state.empty', 'Not uploaded')) + '</span></div>'
      + '</div>';
    host.appendChild(s);
    s.insertAdjacentHTML('beforeend',
      '<div class="upload-tile upload-tile--video" data-pw-asset="video" data-upload="content" data-upload-accept="video/*" data-upload-processing>'
      + '<span class="upload-tile__icon"><i data-lucide="film" class="ztor-icon"></i></span>'
      + '<span class="upload-tile__title" data-i18n="pw.media.file.cta">' + esc(T('pw.media.file.cta', 'Drop the master file or browse')) + '</span>'
      + '<span class="upload-tile__hint" data-i18n="pw.media.file.hint">' + esc(T('pw.media.file.hint', '1080p or higher')) + '</span>'
      + '</div>');
    var tile = s.querySelector('[data-pw-asset="video"]');
    var badge = s.querySelector('[data-pw-video-state]');
    function sync() {
      var k = 'empty';
      if (tile.classList.contains('is-filled') || tile.classList.contains('is-optimized')) k = 'ready';
      else if (tile.classList.contains('is-processing')) k = 'processing';
      else if (tile.classList.contains('is-uploading')) k = 'uploading';
      var st = VIDEO_STATE[k];
      badge.dataset.i18n = st.key;
      badge.textContent = T(st.key, st.fb);
      badge.className = 'badge ' + st.tone;
    }
    document.addEventListener('upload:change', sync);
    document.addEventListener('i18n:applied', sync);
    enhance(s); upload(s); sync();
    s._fill = function (w) {
      if (w && w.file && w.file.name) { markFilled(tile, w.file.name); sync(); }
    };
    return s;
  }

  /* ── F2 原始語音 ── */
  function renderAudio(host) {
    var s = section(host, 'pw.media.audio.title', 'Audio track');
    s.insertAdjacentHTML('beforeend',
      '<div class="field" style="margin-bottom:0;max-width:320px">'
      + '<label class="field__label" for="pw-audio" data-i18n="pw.media.audio.lang">' + esc(T('pw.media.audio.lang', 'Original language')) + '</label>'
      + '<select class="select" id="pw-audio">' + optionsHtml(AUDIO_LANGS) + '</select>'
      + '</div>');
    enhance(s);
    s._fill = function (w) { if (w) setVal(s.querySelector('#pw-audio'), w.audio); };
    return s;
  }

  /* ── F3 字幕：一張卡＝一份字幕檔＋它的語言。每次都重新建一張，不複製既有的——
        既有那張已被 upload-tile.js 增強過，連同注入的 <input> 一起複製會變成壞掉的空殼。 */
  function renderSubs(host) {
    var s = section(host, 'pw.media.subs.title', 'Subtitles', 'pw.media.subs.sub', 'One file per language. SRT or VTT.');
    s.insertAdjacentHTML('beforeend',
      '<div data-pw-subs></div>'
      + '<button class="btn btn--outline btn--add mt-16" type="button" data-pw-add-sub><i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="pw.media.subs.add">'
      + esc(T('pw.media.subs.add', 'Add a language')) + '</span></button>');
    var wrap = s.querySelector('[data-pw-subs]');
    function syncRemoves() {
      var cards = wrap.querySelectorAll('[data-pw-sub]');
      cards.forEach(function (c) { c.querySelector('[data-pw-drop-sub]').hidden = cards.length <= 1; });
    }
    function add() {
      var card = document.createElement('div');
      card.className = 'card card--muted' + (wrap.children.length ? ' mt-16' : '');
      card.setAttribute('data-pw-sub', '');
      card.innerHTML =
        '<div class="card__head">'
        + '<select class="select" style="max-width:200px" aria-label="' + esc(T('pw.media.subs.lang', 'Subtitle language')) + '" data-i18n-aria-label="pw.media.subs.lang">'
        + optionsHtml(SUB_LANGS) + '</select>'
        + '<button class="btn btn--icon btn--sm" type="button" data-pw-drop-sub aria-label="Remove"><i data-lucide="x" class="ztor-icon"></i></button>'
        + '</div>'
        /* 2026-08-18 補標題（使用者指示「要有提示拖入或點擊選字幕檔」）：這格原本只有圖示
           ＋一行「SRT / VTT」，而 .is-empty 會把 __hint 藏到 hover 才出現（upload-tile.css），
           靜止態因此是一個空框加一顆圖示，看不出可以把檔案拖進來。跟作品檔那格對齊——
           __title 常駐講怎麼放進來、__hint 留在 hover 講格式限制。
           標題只講「檔案」不講「字幕檔」：卡頭的語言下拉與區段標題已經說了這是字幕。
           aria-label 保留（元件註解交代的「更精確說法由消費頁自己寫」），但改寫成以
           可視標題結尾，讓語音輸入使用者唸得出畫面上看到的那句（WCAG 2.5.3）。
           2026-08-18 使用者裁決「這只是檔案，可以窄一點」：加 --slim。一份 .srt 不值得
           一整片投放畫布，何況一種語言就一張卡，堆起來會把整頁撐長。 */
        + '<div class="upload-tile upload-tile--file upload-tile--slim" data-pw-asset="subtitle" data-upload="content" data-upload-accept=".srt,.vtt"'
        + ' aria-label="' + esc(T('pw.media.subs.file', 'Subtitle file: drop a file or browse')) + '" data-i18n-aria-label="pw.media.subs.file">'
        + '<span class="upload-tile__icon"><i data-lucide="file-text" class="ztor-icon"></i></span>'
        + '<span class="upload-tile__title" data-i18n="pw.media.subs.cta">' + esc(T('pw.media.subs.cta', 'Drop a file or browse')) + '</span>'
        + '<span class="upload-tile__hint" data-i18n="pw.media.subs.slot">' + esc(T('pw.media.subs.slot', 'SRT / VTT')) + '</span>'
        + '</div>';
      card.querySelector('[data-pw-drop-sub]').addEventListener('click', function () {
        if (wrap.children.length <= 1) return;
        card.remove(); syncRemoves(); emit();
      });
      wrap.appendChild(card);
      enhance(card); upload(card); syncRemoves(); emit();
    }
    s.querySelector('[data-pw-add-sub]').addEventListener('click', add);
    enhance(s); add();
    s._fill = function (w) {
      var subs = (w && w.subs) || [];
      if (!subs.length) return;
      while (wrap.children.length < subs.length) add();
      Array.prototype.slice.call(wrap.querySelectorAll('[data-pw-sub]')).forEach(function (card, i) {
        if (!subs[i]) return;
        setVal(card.querySelector('select'), subs[i].lang);
        markFilled(card.querySelector('[data-pw-asset="subtitle"]'), subs[i].name);
      });
    };
    return s;
  }

  /* ── F4 封面 ── */
  function renderCover(host) {
    var s = section(host, 'pw.art.cover.title', 'Cover');
    s.insertAdjacentHTML('beforeend',
      '<div class="upload-assets upload-assets--fill">'
      + '<div class="upload-tile upload-tile--portrait" data-pw-asset="cover" data-upload>'
      + '<span class="upload-tile__icon"><i data-lucide="image" class="ztor-icon ztor-icon--md"></i></span>'
      + '<span class="upload-tile__title" data-i18n="pw.art.cover.cta">' + esc(T('pw.art.cover.cta', 'Add the poster')) + '</span>'
      + '<span class="upload-tile__hint" data-i18n="cp.media.portrait">' + esc(T('cp.media.portrait', '750 × 1125 · portrait')) + '</span>'
      + '</div></div>');
    enhance(s); upload(s);
    /* 縮圖來源由宿主頁給（opts.coverSrc）——原型沒有真的資產庫，編輯態拿項目圖當那張封面。 */
    s._fill = function (w, o) {
      if (w && w.cover) markFilled(s.querySelector('[data-pw-asset="cover"]'), '', (o && o.coverSrc) || '');
    };
    return s;
  }

  /* ── F5 劇照：張數不設限。永遠留一格空的在最後；填滿它就長出下一格，
        清空中間某一格就把那一格移出。 */
  function renderStills(host) {
    var s = section(host, 'pw.art.stills.title', 'Stills', 'pw.art.stills.sub', 'Frames that sell the film without spoiling it.');
    s.insertAdjacentHTML('beforeend', '<div class="upload-assets upload-assets--fill" data-pw-stills></div>');
    var wrap = s.querySelector('[data-pw-stills]');
    function add() {
      var tile = document.createElement('div');
      tile.className = 'upload-tile upload-tile--portrait';
      tile.setAttribute('data-pw-asset', 'still');
      tile.setAttribute('data-upload', '');
      tile.setAttribute('aria-label', T('pw.art.stills.add', 'Add a still'));
      tile.setAttribute('data-i18n-aria-label', 'pw.art.stills.add');
      /* 2026-08-18 補標題（同字幕格那一輪）：這格原本只有一個「＋」，空的時候是一片
         什麼都沒寫的虛線框。改成圖示＋常駐 CTA＋hover 才出現的尺寸提示，與封面格同一套。
         「＋」換成 Tabler 的 plus：元件說明寫明圖示用 Tabler、不用文字符號，而「加一張」
         這個語意 plus 圖示照樣講得出來。 */
      tile.innerHTML =
        '<span class="upload-tile__icon"><i data-lucide="plus" class="ztor-icon ztor-icon--md"></i></span>'
        + '<span class="upload-tile__title" data-i18n="pw.art.stills.cta">' + esc(T('pw.art.stills.cta', 'Drop an image or browse')) + '</span>'
        + '<span class="upload-tile__hint" data-i18n="cp.media.portrait">' + esc(T('cp.media.portrait', '750 × 1125 · portrait')) + '</span>';
      wrap.appendChild(tile);
      /* 2026-08-18：格子改成「圖示＋標題＋提示」之後，這裡非補 enhance 不可——第一格是
         宿主頁建完整頁再統一跑一次圖示與 i18n 才活過來的，填滿末格長出的第二格之後就沒有
         那一次了，少了這行會留下一個 <i data-lucide> 與兩段沒被翻譯的原文。 */
      enhance(tile);
      if (window.ztorUploadTile) window.ztorUploadTile.enhance(tile);
    }
    wrap.addEventListener('upload:change', function (e) {
      var tile = e.target.closest('.upload-tile');
      if (!tile) return;
      var tiles = Array.prototype.slice.call(wrap.querySelectorAll('.upload-tile'));
      var last = tiles[tiles.length - 1];
      if (e.detail && e.detail.filled) { if (tile === last) add(); return; }
      if (tile !== last) tile.remove();
      emit();
    });
    enhance(s); add();
    s._fill = function (w, o) {
      var n = (w && Number(w.stills)) || 0;
      for (var i = 0; i < n; i++) {
        var tiles = wrap.querySelectorAll('.upload-tile');
        /* 末格填滿會由上面的監聽器自己長出下一格，所以每次都填最後那一格。 */
        markFilled(tiles[tiles.length - 1], '', (o && o.coverSrc) || '');
      }
    };
    return s;
  }

  /* ── F6 花絮：一張卡＝一支影片，做法與字幕卡同一套。 */
  function renderBts(host) {
    var s = section(host, 'pw.art.bts.title', 'Behind the scenes', 'pw.art.bts.sub', 'Optional. Extra footage that sits alongside the trailer.');
    s.insertAdjacentHTML('beforeend',
      '<div data-pw-bts></div>'
      + '<button class="btn btn--outline btn--add mt-16" type="button" data-pw-add-bts><i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="pw.art.bts.addmore">'
      + esc(T('pw.art.bts.addmore', 'Add another clip')) + '</span></button>');
    var wrap = s.querySelector('[data-pw-bts]');
    function syncRemoves() {
      var cards = wrap.querySelectorAll('[data-pw-bts-card]');
      cards.forEach(function (c) { c.querySelector('[data-pw-drop-bts]').hidden = cards.length <= 1; });
    }
    function add() {
      var card = document.createElement('div');
      card.className = 'card card--muted' + (wrap.children.length ? ' mt-16' : '');
      card.setAttribute('data-pw-bts-card', '');
      card.innerHTML =
        '<div class="card__head">'
        + '<h3 class="card__title">' + esc(T('pw.art.bts.item', 'Clip')) + ' ' + (wrap.children.length + 1) + '</h3>'
        + '<button class="btn btn--icon btn--sm" type="button" data-pw-drop-bts aria-label="' + esc(T('pw.art.bts.drop', 'Remove this clip')) + '" data-i18n-aria-label="pw.art.bts.drop"><i data-lucide="x" class="ztor-icon"></i></button>'
        + '</div>'
        /* 2026-08-18 使用者裁決「要用影片的比例」：花絮收的是影片，格子就長成影片的樣子
           （16:9、容器 2/3 寬），與預告片、作品檔同一套。原本用 --file 那條長條讀起來像在收文件。 */
        + '<div class="upload-tile upload-tile--video" data-pw-asset="bts" data-upload="content" data-upload-accept="video/*"'
        + ' aria-label="' + esc(T('pw.art.bts.add', 'Add a behind-the-scenes video')) + '" data-i18n-aria-label="pw.art.bts.add">'
        + '<span class="upload-tile__icon"><i data-lucide="video" class="ztor-icon"></i></span>'
        + '<span class="upload-tile__title" data-i18n="pw.art.bts.cta">' + esc(T('pw.art.bts.cta', 'Drop a video or browse')) + '</span>'
        + '<span class="upload-tile__hint" data-i18n="pw.art.bts.hint">' + esc(T('pw.art.bts.hint', 'MP4 or MOV')) + '</span>'
        + '</div>';
      card.querySelector('[data-pw-drop-bts]').addEventListener('click', function () {
        if (wrap.children.length <= 1) return;
        card.remove();
        Array.prototype.slice.call(wrap.children).forEach(function (c, i) {
          c.classList.toggle('mt-16', i > 0);
          c.querySelector('.card__title').textContent = T('pw.art.bts.item', 'Clip') + ' ' + (i + 1);
        });
        syncRemoves(); emit();
      });
      wrap.appendChild(card);
      enhance(card); upload(card); syncRemoves(); emit();
    }
    s.querySelector('[data-pw-add-bts]').addEventListener('click', add);
    enhance(s); add();
    s._fill = function (w) {
      var n = (w && Number(w.bts)) || 0;
      if (!n) return;
      while (wrap.children.length < n) add();
      Array.prototype.slice.call(wrap.querySelectorAll('[data-pw-bts-card]')).slice(0, n).forEach(function (card, i) {
        markFilled(card.querySelector('[data-pw-asset="bts"]'), T('pw.art.bts.item', 'Clip') + ' ' + (i + 1));
      });
    };
    return s;
  }

  /* ── F7 預告片 ── */
  function renderTrailer(host) {
    var s = section(host, 'pw.art.trailer.title', 'Trailer', 'pw.art.trailer.sub', "Plays on the work's page before anyone rents it.");
    s.insertAdjacentHTML('beforeend',
      '<div class="upload-tile upload-tile--video" data-pw-asset="trailer" data-upload="content" data-upload-accept="video/*"'
      + ' aria-label="' + esc(T('pw.art.trailer.add', 'Add the trailer')) + '" data-i18n-aria-label="pw.art.trailer.add">'
      + '<span class="upload-tile__icon"><i data-lucide="play" class="ztor-icon"></i></span>'
      + '<span class="upload-tile__title" data-i18n="pw.art.trailer.cta">' + esc(T('pw.art.trailer.cta', 'Drop a video or browse')) + '</span>'
      + '<span class="upload-tile__hint" data-i18n="pw.art.trailer.hint">' + esc(T('pw.art.trailer.hint', 'Up to 3 minutes')) + '</span>'
      + '</div>');
    enhance(s); upload(s);
    s._fill = function (w) {
      if (w && w.trailer) markFilled(s.querySelector('[data-pw-asset="trailer"]'), w.trailer);
    };
    return s;
  }

  /* ── F8 名稱與說明：一張卡＝一個語言組。預設繁中與英文兩組，可再加、可移除，
        最後一組不給移除（拿掉就沒有任何前台文案了）。同一種語言不准出現兩次。 */
  function renderCopy(host, opts) {
    opts = opts || {};
    var s = section(host, 'pw.info.copy.title', 'Name & synopsis', 'pw.info.copy.sub', 'Fans see the version matching their app language.');
    s.insertAdjacentHTML('beforeend',
      '<div data-pw-copy-wrap></div>'
      + '<button class="btn btn--outline btn--add mt-16" type="button" data-pw-add-lang><i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="pw.info.copy.add">'
      + esc(T('pw.info.copy.add', 'Add a language')) + '</span></button>');
    var wrap = s.querySelector('[data-pw-copy-wrap]');
    var addBtn = s.querySelector('[data-pw-add-lang]');
    var seq = 0;
    var used = function () {
      return Array.prototype.slice.call(wrap.querySelectorAll('[data-pw-copy] select')).map(function (x) { return x.value; });
    };
    function syncControls() {
      var cards = wrap.querySelectorAll('[data-pw-copy]');
      cards.forEach(function (c) { c.querySelector('[data-pw-drop-lang]').hidden = cards.length <= 1; });
      addBtn.disabled = cards.length >= COPY_LANGS.length;
    }
    function syncLangOptions() {
      wrap.querySelectorAll('[data-pw-copy] select').forEach(function (sel) {
        var mine = sel.value;
        var taken = used().filter(function (v) { return v !== mine; });
        sel.querySelectorAll('option').forEach(function (o) { o.disabled = taken.indexOf(o.value) >= 0; });
      });
    }
    function applyPh(card) {
      var key = card.querySelector('select').value;
      var ph = COPY_PH[key] || { d: 'pw.info.desc.ph' };
      var title = card.querySelector('[data-pw-title]');
      var desc = card.querySelector('[data-pw-desc]');
      if (ph.t) { title.placeholder = T(ph.t, ''); title.setAttribute('data-i18n-placeholder', ph.t); }
      else { title.placeholder = ''; title.removeAttribute('data-i18n-placeholder'); }
      desc.placeholder = T(ph.d, ''); desc.setAttribute('data-i18n-placeholder', ph.d);
    }
    function add(langKey) {
      var n = ++seq;
      var card = document.createElement('div');
      card.className = 'card card--muted' + (wrap.children.length ? ' mt-16' : '');
      card.setAttribute('data-pw-copy', '');
      card.innerHTML =
        '<div class="card__head">'
        + '<select class="select" style="max-width:200px" aria-label="' + esc(T('pw.info.copy.lang', 'Language')) + '" data-i18n-aria-label="pw.info.copy.lang">'
        + optionsHtml(COPY_LANGS, langKey) + '</select>'
        + '<button class="btn btn--icon btn--sm" type="button" data-pw-drop-lang aria-label="' + esc(T('pw.info.copy.drop', 'Remove this language')) + '" data-i18n-aria-label="pw.info.copy.drop"><i data-lucide="x" class="ztor-icon"></i></button>'
        + '</div>'
        + '<div class="field">'
        + '<label class="field__label" for="pw-title-' + n + '" data-i18n="pw.info.title">' + esc(T('pw.info.title', 'Title')) + '</label>'
        + '<input class="input" id="pw-title-' + n + '" data-pw-title>'
        + '</div>'
        + '<div class="field" style="margin-bottom:0">'
        + '<label class="field__label" for="pw-desc-' + n + '" data-i18n="pw.info.desc">' + esc(T('pw.info.desc', 'Synopsis')) + '</label>'
        + '<textarea class="textarea" id="pw-desc-' + n + '" data-pw-desc></textarea>'
        + '</div>';
      var sel = card.querySelector('select');
      sel.value = langKey;
      sel.addEventListener('change', function () { applyPh(card); syncLangOptions(); });
      card.querySelector('[data-pw-drop-lang]').addEventListener('click', function () {
        if (wrap.children.length <= 1) return;
        card.remove();
        Array.prototype.slice.call(wrap.children).forEach(function (c, i) { c.classList.toggle('mt-16', i > 0); });
        syncControls(); syncLangOptions(); emit();
        if (opts.onChange) opts.onChange();
      });
      wrap.appendChild(card);
      applyPh(card); enhance(card);
      syncControls(); syncLangOptions(); emit();
      if (opts.onChange) opts.onChange();
    }
    addBtn.addEventListener('click', function () {
      var next = COPY_LANGS.filter(function (k) { return used().indexOf(k) < 0; })[0];
      if (next) add(next);
    });
    enhance(s);
    add('pw.lang.zh'); add('pw.lang.enName');
    s._fill = function (w) {
      var copy = (w && w.copy) || [];
      if (!copy.length) return;
      /* 語言組數是創作者自己決定的，還原時就要還原成當初那幾組——多的移除、少的補上。 */
      while (wrap.children.length > copy.length) wrap.lastElementChild.remove();
      while (wrap.children.length < copy.length) add(COPY_LANGS.filter(function (k) { return used().indexOf(k) < 0; })[0] || COPY_LANGS[0]);
      Array.prototype.slice.call(wrap.querySelectorAll('[data-pw-copy]')).forEach(function (card, i) {
        var it = copy[i]; if (!it) return;
        setVal(card.querySelector('select'), it.lang);
        applyPh(card);
        setVal(card.querySelector('[data-pw-title]'), it.title);
        setVal(card.querySelector('[data-pw-desc]'), it.desc);
      });
      syncControls(); syncLangOptions();
    };
    return s;
  }

  /* ── F9 片長 ＋ F10 上映日期 ── */
  function renderSpec(host) {
    var s = section(host, 'pw.info.spec.title', 'Runtime & release');
    s.insertAdjacentHTML('beforeend',
      '<div class="field">'
      + '<div class="field__label" data-i18n="pw.info.runtime">' + esc(T('pw.info.runtime', 'Runtime')) + '</div>'
      + '<div class="form-grid form-grid--3" style="max-width:340px">'
      + '<div class="field"><input class="input" id="pw-hh" inputmode="numeric" placeholder="01" aria-label="HH"></div>'
      + '<div class="field"><input class="input" id="pw-mm" inputmode="numeric" placeholder="48" aria-label="MM"></div>'
      + '<div class="field"><input class="input" id="pw-ss" inputmode="numeric" placeholder="00" aria-label="SS"></div>'
      + '</div>'
      + '<div class="field__hint" data-i18n="pw.info.runtime.units">' + esc(T('pw.info.runtime.units', 'Hours · minutes · seconds')) + '</div>'
      + '</div>'
      + '<div class="field" style="margin-bottom:0">'
      + '<div class="field__label" data-i18n="pw.info.release">' + esc(T('pw.info.release', 'Release date')) + '</div>'
      + '<div class="form-grid form-grid--3" style="max-width:340px">'
      + '<div class="field"><select class="select" id="pw-yyyy" aria-label="YYYY"></select></div>'
      + '<div class="field"><select class="select" id="pw-mm2" aria-label="MM"></select></div>'
      + '<div class="field"><select class="select" id="pw-dd" aria-label="DD"></select></div>'
      + '</div>'
      + '<div class="field__hint" data-i18n="pw.info.release.hint">' + esc(T('pw.info.release.hint', 'Leave it as today to go live the moment review passes; a future date holds it until then.')) + '</div>'
      + '</div>');
    function fill(el, from, to, pad) {
      for (var n = from; n <= to; n++) {
        var o = document.createElement('option');
        o.value = String(n);
        o.textContent = pad && n < 10 ? '0' + n : String(n);
        el.appendChild(o);
      }
    }
    var now = new Date();
    fill(s.querySelector('#pw-yyyy'), now.getFullYear() - 20, now.getFullYear() + 2, false);
    fill(s.querySelector('#pw-mm2'), 1, 12, true);
    fill(s.querySelector('#pw-dd'), 1, 31, true);
    s.querySelector('#pw-yyyy').value = String(now.getFullYear());
    s.querySelector('#pw-mm2').value = String(now.getMonth() + 1);
    s.querySelector('#pw-dd').value = String(now.getDate());
    enhance(s);
    s._fill = function (w) {
      if (!w) return;
      var rt = String(w.runtime || '').split(':');
      ['#pw-hh', '#pw-mm', '#pw-ss'].forEach(function (id, i) { setVal(s.querySelector(id), rt[i]); });
      /* 存下來的日期可能是補零的（2026/09/12），下拉的 value 沒有補零，先轉成數字再比。 */
      var d = String(w.release || '').split('/');
      ['#pw-yyyy', '#pw-mm2', '#pw-dd'].forEach(function (id, i) {
        var n = parseInt(d[i], 10);
        if (!isNaN(n)) setVal(s.querySelector(id), String(n));
      });
    };
    return s;
  }

  /* ── F11 分類：多選 chip，21 個固定值 ── */
  function renderGenres(host) {
    var s = section(host, 'pw.info.genre.title', 'Genres', 'pw.info.genre.sub', 'Pick every one that fits — they drive where the work shows up.');
    s.insertAdjacentHTML('beforeend', '<div class="chip-group" data-pw-genres>'
      + TAX.genreChipsHtml('data-pw-genre') + '</div>');
    s.addEventListener('click', function (e) {
      var c = e.target.closest('[data-pw-genre]');
      if (!c) return;
      c.classList.toggle('chip--active');
      emit();
    });
    enhance(s);
    s._fill = function (w) {
      var picked = (w && w.genres) || [];
      s.querySelectorAll('[data-pw-genre]').forEach(function (c) {
        c.classList.toggle('chip--active', picked.indexOf(c.getAttribute('data-i18n')) >= 0);
      });
    };
    return s;
  }

  /* ── F12 標籤 ── */
  function renderTags(host) {
    var s = section(host, 'pw.info.tags.title', 'Tags', 'cp.tags.sub', 'Make it easier for fans to discover your work.');
    s.insertAdjacentHTML('beforeend',
      '<div class="tag-input" data-pw-tags><div class="tag-input__field" data-pw-tags-field>'
      + '<input class="tag-input__entry" data-pw-tags-entry placeholder="' + esc(T('cp.tags.ph', 'Type a tag, press Enter')) + '" data-i18n-placeholder="cp.tags.ph">'
      + '</div></div>');
    var field = s.querySelector('[data-pw-tags-field]');
    var entry = s.querySelector('[data-pw-tags-entry]');
    var tags = [];
    s._tags = tags;
    function paint() {
      field.querySelectorAll('.chip').forEach(function (c) { c.remove(); });
      tags.forEach(function (t, i) {
        var chip = document.createElement('span');
        chip.className = 'chip chip--active chip--removable';
        chip.innerHTML = '<span>' + esc(t) + '</span><button class="chip__remove" type="button" data-tag-remove="' + i + '" aria-label="Remove tag"><i data-lucide="x" class="ztor-icon"></i></button>';
        field.insertBefore(chip, entry);
      });
      if (window.ztorIcons) window.ztorIcons.applyIcons(field);
    }
    entry.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var v = entry.value.trim();
      if (v && tags.indexOf(v) < 0) tags.push(v);
      entry.value = '';
      paint();
    });
    field.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-tag-remove]');
      if (rm) { tags.splice(Number(rm.dataset.tagRemove), 1); paint(); return; }
      if (e.target === field) entry.focus();
    });
    enhance(s);
    s._fill = function (w) {
      tags.length = 0;
      ((w && w.tags) || []).forEach(function (t) { tags.push(t); });
      paint();
    };
    return s;
  }

  /* ── F13 年齡限制 ── */
  function renderAge(host) {
    var s = section(host, 'pw.info.age.title', 'Age rating');
    s.insertAdjacentHTML('beforeend',
      '<div class="field" style="margin-bottom:0;max-width:280px">'
      + '<select class="select" id="pw-age" aria-label="' + esc(T('pw.info.age.title', 'Age rating')) + '" data-i18n-aria-label="pw.info.age.title">'
      + optionsHtml(AGES) + '</select></div>');
    enhance(s);
    s._fill = function (w) { if (w) setVal(s.querySelector('#pw-age'), w.age); };
    return s;
  }

  /* ── F14 定價：是否付費 ＋ 幣種 ＋ 逐畫質租賃四個數值。
        畫質做成固定名單而不是自由輸入：畫質是播放端認得的枚舉值，
        打錯字的「HD1080」不會有任何播放器認得。 */
  function renderPricing(host, opts) {
    opts = opts || {};
    var s = section(host, 'pw.price.title', 'Pricing', 'pw.price.sub', 'Each quality is rented separately.');
    s.insertAdjacentHTML('beforeend',
      '<div class="control-row">'
      + '<div><div class="control-row__main" data-i18n="pw.price.paid">' + esc(T('pw.price.paid', 'Charge for this work')) + '</div>'
      + '<div class="control-row__sub" data-i18n="pw.price.paid-sub">' + esc(T('pw.price.paid-sub', 'Turn off and anyone can watch it for free.')) + '</div></div>'
      + '<div class="switch switch--on" id="pw-paid" role="switch" aria-checked="true" tabindex="0"></div>'
      + '</div>'
      + '<div data-pw-price-body>'
      + '<div class="field mt-16"><div class="field__label" data-i18n="pw.price.currency">' + esc(T('pw.price.currency', 'Currency')) + '</div>'
      + '<div class="segmented" data-pw-currency style="max-width:220px">'
      + '<button class="segmented__btn segmented__btn--active" type="button" data-pw-cur="HKD">HKD</button>'
      + '<button class="segmented__btn" type="button" data-pw-cur="TWD">TWD</button>'
      + '</div></div>'
      + '<div data-pw-quality-list></div>'
      + '<button class="btn btn--outline btn--add mt-16" type="button" data-pw-add-quality><i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="pw.price.add">'
      + esc(T('pw.price.add', 'Add a quality')) + '</span></button>'
      /* 平台費是唯讀揭露、不是欄位，位置跟著定價走（規格 5.1.2.2.1 F14 末段、規劃書 §1.4）。 */
      + '<div class="field__hint mt-16" data-i18n="cpp.s3.fee-hint">' + esc(T('cpp.s3.fee-hint', '5% platform fee + 3% Stripe processing, charged on revenue.')) + '</div>'
      + '</div>');
    var paid = s.querySelector('#pw-paid');
    var body = s.querySelector('[data-pw-price-body]');
    var list = s.querySelector('[data-pw-quality-list]');
    var addBtn = s.querySelector('[data-pw-add-quality]');
    var curWrap = s.querySelector('[data-pw-currency]');
    function togglePaid() {
      var on = paid.classList.contains('switch--on');
      paid.setAttribute('aria-checked', String(on));
      body.hidden = !on;
      emit();
      if (opts.onChange) opts.onChange();
    }
    paid.addEventListener('click', function () { paid.classList.toggle('switch--on'); togglePaid(); });
    paid.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault(); paid.classList.toggle('switch--on'); togglePaid();
    });
    function sym() {
      var a = curWrap.querySelector('.segmented__btn--active');
      return a && a.dataset.pwCur === 'TWD' ? 'NT$' : 'HK$';
    }
    curWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.segmented__btn');
      if (!b) return;
      curWrap.querySelectorAll('.segmented__btn').forEach(function (x) { x.classList.toggle('segmented__btn--active', x === b); });
      s.querySelectorAll('[data-pw-cur-sym]').forEach(function (x) { x.textContent = sym(); });
    });
    var usedQ = function () {
      return Array.prototype.slice.call(list.querySelectorAll('[data-pw-quality]')).map(function (el) { return el.dataset.pwQuality; });
    };
    function syncAdd() { addBtn.disabled = QUALITY_PRESETS.every(function (q) { return usedQ().indexOf(q) >= 0; }); }
    function addQuality(name) {
      var card = document.createElement('div');
      card.className = 'card card--muted mt-16';
      card.setAttribute('data-pw-quality', name);
      card.innerHTML =
        '<div class="card__head"><h3 class="card__title">' + esc(name) + '</h3>'
        + '<button class="btn btn--icon btn--sm" type="button" data-pw-drop-quality aria-label="Remove"><i data-lucide="x" class="ztor-icon"></i></button></div>'
        + '<div class="form-grid">'
        + '<div class="field"><div class="field__label" data-i18n="pw.price.rent">' + esc(T('pw.price.rent', 'Rental price')) + '</div>'
        + '<span class="amount-field amount-field--readonly"><span class="amount-field__unit"><span class="amount-field__sym" data-pw-cur-sym>' + sym() + '</span></span>'
        + '<input class="input amount-field__input" inputmode="numeric" placeholder="38"></span></div>'
        + '<div class="field"><div class="field__label" data-i18n="pw.price.popcorn">' + esc(T('pw.price.popcorn', 'Popcorn kernels')) + '</div>'
        + '<input class="input" inputmode="numeric" placeholder="580"></div>'
        + '<div class="field"><div class="field__label" data-i18n="pw.price.window">' + esc(T('pw.price.window', 'Rental window')) + '</div>'
        + '<input class="input" inputmode="numeric" placeholder="30">'
        + '<div class="field__hint" data-i18n="pw.price.window-hint">' + esc(T('pw.price.window-hint', 'Days the rental stays in the library.')) + '</div></div>'
        + '<div class="field"><div class="field__label" data-i18n="pw.price.watch">' + esc(T('pw.price.watch', 'Watch window')) + '</div>'
        + '<input class="input" inputmode="numeric" placeholder="2">'
        + '<div class="field__hint" data-i18n="pw.price.watch-hint">' + esc(T('pw.price.watch-hint', 'Days left after the first play starts.')) + '</div></div>'
        + '</div>';
      card.querySelector('[data-pw-drop-quality]').addEventListener('click', function () {
        if (list.children.length <= 1) return;   // 至少留一個畫質，不然這塊變成空的
        card.remove(); syncAdd(); emit();
        if (opts.onChange) opts.onChange();
      });
      list.appendChild(card);
      enhance(card); syncAdd(); emit();
      if (opts.onChange) opts.onChange();
    }
    addBtn.addEventListener('click', function () {
      var next = QUALITY_PRESETS.filter(function (q) { return usedQ().indexOf(q) < 0; })[0];
      if (next) addQuality(next);
    });
    enhance(s);
    ['4K', 'HD-1080P', 'SD-720P'].forEach(addQuality);
    togglePaid();
    s._fill = function (w) {
      if (!w) return;
      paid.classList.toggle('switch--on', !!w.paid);
      togglePaid();
      if (w.currency) {
        curWrap.querySelectorAll('.segmented__btn').forEach(function (b) {
          b.classList.toggle('segmented__btn--active', b.dataset.pwCur === w.currency);
        });
      }
      var qs = w.qualities || [];
      if (!qs.length) return;
      /* 畫質清單是可增可刪的，還原時整份換掉才不會留下當初刪掉的那一列。 */
      list.innerHTML = '';
      qs.forEach(function (q) { addQuality(q.name); });
      Array.prototype.slice.call(list.querySelectorAll('[data-pw-quality]')).forEach(function (card, i) {
        var q = qs[i]; if (!q) return;
        var inputs = card.querySelectorAll('input');
        setVal(inputs[0], q.price); setVal(inputs[1], q.popcorn);
        setVal(inputs[2], q.rent); setVal(inputs[3], q.watch);
      });
      s.querySelectorAll('[data-pw-cur-sym]').forEach(function (x) { x.textContent = sym(); });
    };
    return s;
  }

  /* ── F15 演職人員：每個角色一份可增可刪的名單 ── */
  function bindRole(field) {
    var list = document.createElement('div');
    list.className = 'entry-list';
    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'btn btn--outline btn--add entry-list__add';
    add.innerHTML = '<i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="pw.credits.add">' + esc(T('pw.credits.add', 'Add another')) + '</span>';
    var rowsOf = function () { return Array.prototype.slice.call(list.querySelectorAll('.entry-list__row')); };
    function syncRemoves() {
      var rows = rowsOf();
      rows.forEach(function (r) { r.querySelector('button').hidden = rows.length <= 1; });
    }
    /* 最後一格還空著就不給新增鈕（元件的 [data-last-empty] 規則）：九個角色各常駐一顆
       「＋ 再加一位」會讓這一步全是重複按鈕。 */
    function syncAdd() {
      var rows = rowsOf();
      var last = rows[rows.length - 1];
      var empty = !last || String(last.querySelector('.input').value || '').trim() === '';
      list.setAttribute('data-last-empty', String(empty));
    }
    function addRow(takeFocus) {
      var row = document.createElement('div');
      row.className = 'entry-list__row';
      row.innerHTML = '<input class="input" data-i18n-placeholder="pw.credits.name.ph" placeholder="' + esc(T('pw.credits.name.ph', 'Name')) + '">'
        + '<button class="btn btn--icon btn--sm" type="button" aria-label="Remove"><i data-lucide="x" class="ztor-icon"></i></button>';
      row.querySelector('button').addEventListener('click', function () {
        /* 被刪掉的那一列會把焦點一起帶走（掉回 <body>），鍵盤使用者當場失去位置，
           所以先記下要接手的鄰居：優先上一列，刪的是第一列就換下一列。 */
        var rows = rowsOf();
        var heir = rows[rows.indexOf(row) - 1] || rows[rows.indexOf(row) + 1];
        row.remove(); syncRemoves(); syncAdd();
        if (heir) heir.querySelector('.input').focus();
      });
      list.insertBefore(row, add);
      syncRemoves(); syncAdd();
      if (window.ztorIcons) window.ztorIcons.applyIcons(row);
      if (takeFocus) row.querySelector('.input').focus();
    }
    add.addEventListener('click', function () { addRow(true); });
    /* 還原時要能多長幾列，但不可搶焦點（fill 發生在載入當下）——所以留一支不搶焦點的入口，
       而不是讓 fill 去點那顆按鈕。 */
    list._addRow = function () { addRow(false); };
    list.addEventListener('input', syncAdd);
    field.appendChild(list);
    list.appendChild(add);
    addRow();
    if (window.ztorIcons) window.ztorIcons.applyIcons(add);
  }
  function renderCredits(host) {
    var cast = section(host, 'pw.credits.cast.title', 'Cast');
    cast.insertAdjacentHTML('beforeend', CREDIT_CAST.map(function (r, i) {
      return '<div class="field" data-pw-role="' + r + '"' + (i === CREDIT_CAST.length - 1 ? ' style="margin-bottom:0"' : '')
        + '><div class="field__label" data-i18n="pw.role.' + r + '">' + esc(T('pw.role.' + r, r)) + '</div></div>';
    }).join(''));
    var crew = section(host, 'pw.credits.crew.title', 'Crew');
    crew.insertAdjacentHTML('beforeend', CREDIT_CREW.map(function (r, i) {
      return '<div class="field" data-pw-role="' + r + '"' + (i === CREDIT_CREW.length - 1 ? ' style="margin-bottom:0"' : '')
        + '><div class="field__label" data-i18n="pw.role.' + r + '">' + esc(T('pw.role.' + r, r)) + '</div></div>';
    }).join(''));
    var notes = section(host, 'pw.credits.notes.title', 'Notes', 'pw.credits.notes.sub', 'Anything the review team should know.');
    notes.insertAdjacentHTML('beforeend',
      '<div class="field" style="margin-bottom:0"><textarea class="textarea" id="pw-notes" aria-label="' + esc(T('pw.credits.notes.title', 'Notes')) + '" data-i18n-aria-label="pw.credits.notes.title"></textarea></div>');
    [cast, crew].forEach(function (sec) { sec.querySelectorAll('[data-pw-role]').forEach(bindRole); });
    /* 三張卡各自還原自己那一段：角色名單照 role key 對回去，備註是一格自由文字。 */
    function fillRoles(sec) {
      return function (w) {
        var credits = (w && w.credits) || [];
        sec.querySelectorAll('[data-pw-role]').forEach(function (f) {
          var key = f.querySelector('.field__label').getAttribute('data-i18n');
          var hit = credits.filter(function (c) { return c.role === key; })[0];
          var names = (hit && hit.names) || [];
          if (!names.length) return;
          var list = f.querySelector('.entry-list');
          while (f.querySelectorAll('.entry-list__row').length < names.length) list._addRow();
          f.querySelectorAll('.entry-list__row .input').forEach(function (input, n) { setVal(input, names[n]); });
          list.dispatchEvent(new Event('input', { bubbles: true }));
        });
      };
    }
    cast._fill = fillRoles(cast);
    crew._fill = fillRoles(crew);
    notes._fill = function (w) { if (w) setVal(notes.querySelector('#pw-notes'), w.notes); };
    enhance(cast); enhance(crew); enhance(notes);
    return cast;
  }

  var RENDER = {
    file: renderFile, audio: renderAudio, subs: renderSubs,
    cover: renderCover, stills: renderStills, bts: renderBts, trailer: renderTrailer,
    copy: renderCopy, spec: renderSpec, genres: renderGenres, tags: renderTags,
    age: renderAge, pricing: renderPricing, credits: renderCredits
  };

  /* ── 送審內容（規格 5.1.0.4 F3「檢視範圍」）──────────────────────────
     原型不真的上傳檔案，所以檔案類欄位存的是檔名與筆數，讓審核者至少看得出
     創作者交了什麼；能不能實際播放屬原型限制，記在 ASSUMPTIONS。 */
  function collect(scope) {
    scope = scope || document;
    var q = function (sel) { return scope.querySelector(sel); };
    var qa = function (sel) { return Array.prototype.slice.call(scope.querySelectorAll(sel)); };
    var fileEl = q('[data-pw-asset="video"]');
    var stateOf = function (el) {
      if (!el) return 'empty';
      if (el.classList.contains('is-filled') || el.classList.contains('is-optimized')) return 'ready';
      if (el.classList.contains('is-processing')) return 'processing';
      if (el.classList.contains('is-uploading')) return 'uploading';
      return 'empty';
    };
    var isFilled = function (el) { return !!el && (el.classList.contains('is-filled') || el.classList.contains('is-optimized')); };
    var val = function (el) { return el ? String(el.value || '').trim() : ''; };
    var optKey = function (sel) {
      var el = q(sel); if (!el) return '';
      var o = el.options[el.selectedIndex];
      return o ? (o.getAttribute('data-i18n') || o.value) : '';
    };
    var tagsBox = q('[data-pw-tags]');
    var tags = (tagsBox && tagsBox.closest('.form-section') && tagsBox.closest('.form-section')._tags) || [];
    var curBtn = q('[data-pw-currency] .segmented__btn--active');
    var paidEl = q('#pw-paid');
    return {
      file: { name: fileEl ? ((fileEl.querySelector('.upload-tile__filename') || {}).textContent || '') : '', state: stateOf(fileEl) },
      audio: optKey('#pw-audio'),
      subs: qa('[data-pw-sub]').map(function (c) {
        var sel = c.querySelector('select'), o = sel.options[sel.selectedIndex];
        return { lang: o ? o.getAttribute('data-i18n') : '', name: (c.querySelector('.upload-tile__filename') || {}).textContent || '' };
      }),
      cover: isFilled(q('[data-pw-asset="cover"]')),
      stills: qa('[data-pw-stills] .upload-tile.is-filled, [data-pw-stills] .upload-tile.is-optimized').length,
      bts: qa('[data-pw-bts] .upload-tile.is-filled').length,
      trailer: (q('[data-pw-asset="trailer"] .upload-tile__filename') || {}).textContent || '',
      copy: qa('[data-pw-copy]').map(function (c) {
        return {
          lang: c.querySelector('select').value,
          title: val(c.querySelector('[data-pw-title]')),
          desc: val(c.querySelector('[data-pw-desc]'))
        };
      }),
      runtime: ['#pw-hh', '#pw-mm', '#pw-ss'].map(function (id) { return val(q(id)) || '00'; }).join(':'),
      release: ['#pw-yyyy', '#pw-mm2', '#pw-dd'].map(function (id) { return val(q(id)); }).join('/'),
      genres: qa('[data-pw-genres] .chip--active').map(function (c) { return c.getAttribute('data-i18n'); }),
      tags: tags.slice(),
      age: optKey('#pw-age'),
      paid: !!paidEl && paidEl.classList.contains('switch--on'),
      currency: curBtn ? curBtn.dataset.pwCur : '',
      qualities: qa('[data-pw-quality]').map(function (c) {
        var v = Array.prototype.slice.call(c.querySelectorAll('input')).map(function (i) { return String(i.value || '').trim(); });
        return { name: c.dataset.pwQuality, price: v[0] || '', popcorn: v[1] || '', rent: v[2] || '', watch: v[3] || '' };
      }),
      credits: qa('[data-pw-role]').map(function (f) {
        return {
          role: f.querySelector('.field__label').getAttribute('data-i18n'),
          names: Array.prototype.slice.call(f.querySelectorAll('.entry-list__row .input')).map(function (i) { return String(i.value || '').trim(); }).filter(Boolean)
        };
      }).filter(function (r) { return r.names.length; }),
      notes: val(q('#pw-notes'))
    };
  }

  /* ── 就緒檢查（規格 §8「必填齊全」＝F1、F2、F4、F8、F9、F10、F11、F13，付費再加 F14）
     opts.stepOf：本檔的區塊 kind → 宿主頁的步驟鍵（兩個宿主的步驟切法不同）
     opts.stepLabel：步驟鍵 → 顯示名 */
  function checks(opts) {
    opts = opts || {};
    var stepOf = opts.stepOf || {};
    var stepLabel = opts.stepLabel || function (k) { return k; };
    var scope = opts.scope || document;
    var q = function (sel) { return scope.querySelector(sel); };
    var filled = function (sel) { var t = q(sel); return !!t && (t.classList.contains('is-filled') || t.classList.contains('is-optimized')); };
    var hasVal = function (el) { return !!el && String(el.value || '').trim() !== ''; };
    var out = [
      { block: 'file', k: 'pw.media.file.title', fb: 'Video file', done: function () { return filled('[data-pw-asset="video"]'); } },
      { block: 'audio', k: 'pw.media.audio.lang', fb: 'Original language', done: function () { return hasVal(q('#pw-audio')); } },
      { block: 'cover', k: 'pw.art.cover.title', fb: 'Cover', done: function () { return filled('[data-pw-asset="cover"]'); } },
      /* F8 要每一個語言組的標題與說明都有值——留一組空白等於那個語言的作品頁是空的。 */
      {
        block: 'copy', k: 'pw.info.copy.title', fb: 'Name & synopsis', done: function () {
          var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-pw-copy]'));
          return cards.length > 0 && cards.every(function (c) {
            return hasVal(c.querySelector('[data-pw-title]')) && hasVal(c.querySelector('[data-pw-desc]'));
          });
        }
      },
      { block: 'spec', k: 'pw.info.runtime', fb: 'Runtime', done: function () { return ['#pw-hh', '#pw-mm', '#pw-ss'].every(function (id) { return hasVal(q(id)); }); } },
      { block: 'spec', k: 'pw.info.release', fb: 'Release date', done: function () { return ['#pw-yyyy', '#pw-mm2', '#pw-dd'].every(function (id) { return hasVal(q(id)); }); } },
      { block: 'genres', k: 'pw.info.genre.title', fb: 'Genres', done: function () { return !!q('[data-pw-genres] .chip--active'); } },
      { block: 'age', k: 'pw.info.age.title', fb: 'Age rating', done: function () { return hasVal(q('#pw-age')); } }
    ];
    /* 免費作品沒有價格可填，這一項就不存在——不是「未通過」，是不適用。 */
    var paidEl = q('#pw-paid');
    if (paidEl && paidEl.classList.contains('switch--on')) {
      out.push({
        block: 'pricing', k: 'pw.price.title', fb: 'Pricing', done: function () {
          var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-pw-quality]'));
          return cards.length > 0 && cards.every(function (c) {
            return Array.prototype.slice.call(c.querySelectorAll('input')).every(function (i) { return String(i.value || '').trim() !== ''; });
          });
        }
      });
    }
    return out.map(function (c) {
      var stepKey = stepOf[c.block] || '';
      c.step = stepKey;
      c.label = (stepKey ? stepLabel(stepKey) + ' · ' : '') + T(c.k, c.fb);
      return c;
    });
  }

  window.ZtorWorkFields = {
    LANGS: { sub: SUB_LANGS.slice(), audio: AUDIO_LANGS.slice(), copy: COPY_LANGS.slice() },
    QUALITY_PRESETS: QUALITY_PRESETS.slice(),
    render: function (host, kind, opts) {
      var fn = RENDER[kind];
      if (!fn || !host) return null;
      return fn(host, opts);
    },
    /* 一次照順序渲染多個區塊，宿主頁不必寫一串 render()。 */
    renderAll: function (host, kinds, opts) {
      var out = [];
      (kinds || []).forEach(function (k) { out.push(RENDER[k] ? RENDER[k](host, opts) : null); });
      return out;
    },
    collect: collect,
    checks: checks,
    /* 把 collect() 形狀的資料寫回畫面（編輯已上架作品時用，規格 5.1.2.2 §2.2.11）。
       opts.scope：只還原某一段（預設整份文件）；opts.coverSrc：素材格的縮圖來源。 */
    fill: function (work, opts) {
      opts = opts || {};
      var scope = opts.scope || document;
      Array.prototype.slice.call(scope.querySelectorAll('.form-section')).forEach(function (sec) {
        if (typeof sec._fill === 'function') sec._fill(work, opts);
      });
      emit();
    }
  };
})();
