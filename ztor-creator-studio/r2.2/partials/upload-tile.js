// partials/upload-tile.js — 互動上傳格增強器
//
// 兩種模式（皆 .upload-tile[data-upload]）：
//  · 顯示圖（data-upload=""，Show it off §4 F1）：縮圖＋hover 替換／刪除（站上標準 2 鈕）。
//    加掛 data-upload-ai 才多出第三顆「AI 優化」＋完成徽章——目前只有 create-product 的商品圖槽開啟。
//  · 內容檔（data-upload="content"，§4.2 F11 音樂/影片/檔案）：上傳後可播放（音訊/影片，
//    真實 <audio>/<video>）與刪除，操作比照顯示圖；影片顯示影格、音訊/檔案顯示檔型圖示＋檔名；無 AI。
// 狀態流：空 → 點擊選檔 → 上傳中（進度條假走 ~2.5s）→ 已上傳（hover 動作）。
// 加掛 data-upload-processing 時多一段「處理中」（轉檔／檢查，假走 ~2.4s）：
//   空 → 上傳中 → 處理中 → 已上傳。處理中不算已填（emit 的 filled 為 false），
//   所以就緒檢查會自然把它擋在「未完成」那一側（規格 5.1.2.2.1 §8「檔案就緒」）。
// 全前端 demo：URL.createObjectURL 顯示/播放所選檔，不真的上傳。
// 每次狀態變動 dispatch 'upload:change'（bubbles，detail:{key,filled}）供頁面更新就緒。
//
// 起始已有圖的三種來源（編輯態常態）：
//  1) data-upload-src="<url>"        — 屬性帶入
//  2) 格內已有 <img class="upload-tile__thumb" src="…">  — 沿用該節點，不再另建一張（否則兩張縮圖疊著）
//  3) 頁面 JS 稍後才填 src（如 product-detail 依 ?id 帶圖）— HTML 先給 .is-filled，本檔沿用該狀態
// detail.key 取用順序：data-upload-key → data-cp-asset（create-product 既有命名）。
(function () {
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function el(tag, cls, html) { var n = document.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; }

  var STATES = ['is-empty', 'is-uploading', 'is-processing', 'is-filled', 'is-optimizing', 'is-optimized'];

  function enhance(tile) {
    if (tile.__uploadReady) return; tile.__uploadReady = true;
    var content = tile.getAttribute('data-upload') === 'content';
    var needsProcessing = tile.hasAttribute('data-upload-processing');   // 傳完還要轉檔的格（見檔頭）
    var ai = !content && tile.hasAttribute('data-upload-ai');   // AI 優化＝選配第三鈕（見檔頭）
    if (!STATES.some(function (s) { return tile.classList.contains(s); })) tile.classList.add('is-empty');

    var input = el('input', 'upload-tile__input'); input.type = 'file'; input.hidden = true;
    /* 沿用格內既有的縮圖節點（頁面可能已經放好一張圖、或掛了 id/data-* 讓自己稍後改 src）；
       沒有才新建。新建與否決定後面要不要 append。 */
    var thumb = tile.querySelector('.upload-tile__thumb');
    var ownThumb = !thumb;
    if (ownThumb) { thumb = el('img', 'upload-tile__thumb'); thumb.alt = ''; }
    var overlay = el('div', 'upload-tile__overlay', '<span class="upload-tile__spinner"></span><span class="upload-tile__status"></span>');
    var progress = el('div', 'upload-tile__progress', '<div class="upload-tile__bar"></div>');

    // content 專屬：影片影格 / 檔案標記 / 隱藏 audio
    var video, audioEl, filemark, fileIcon, fileName, media = null;
    if (content) {
      video = el('video', 'upload-tile__video'); video.setAttribute('playsinline', ''); video.setAttribute('preload', 'metadata');
      audioEl = document.createElement('audio'); audioEl.preload = 'metadata';
      filemark = el('div', 'upload-tile__filemark', '<i data-lucide="file" class="ztor-icon"></i><span class="upload-tile__filename"></span>');
      fileIcon = filemark.querySelector('.ztor-icon'); fileName = filemark.querySelector('.upload-tile__filename');
    }

    /* hover 動作列。所有按鈕都掛 data-i18n-title/-aria-label，切語言時由 applyI18n 重譯，
       不必各頁自己再造一份字典。i18n 正典 key：圖片＝cp.media.*、內容檔＝cp.cfile.*。 */
    var actions = el('div', 'upload-tile__actions');
    function act(hook, key, fb, icons, extraCls) {
      var label = T(key, fb);
      return '<button type="button" class="upload-tile__act' + (extraCls ? ' ' + extraCls : '') + '" ' + hook +
        ' aria-label="' + label + '" title="' + label + '"' +
        ' data-i18n-title="' + key + '" data-i18n-aria-label="' + key + '">' + icons + '</button>';
    }
    if (content) {
      actions.innerHTML =
        act('data-upload-play', 'cp.cfile.play', 'Play',
            '<i data-lucide="play" class="ztor-icon upload-tile__ic-play"></i><i data-lucide="pause" class="ztor-icon upload-tile__ic-pause"></i>',
            'upload-tile__act--play') +
        act('data-upload-replace', 'cp.cfile.replace', 'Replace', '<i data-lucide="refresh-cw" class="ztor-icon"></i>') +
        act('data-upload-remove',  'cp.cfile.remove',  'Remove',  '<i data-lucide="trash-2" class="ztor-icon"></i>');
    } else {
      // 站上標準＝替換／刪除兩顆；AI 優化是 opt-in 的第三顆（data-upload-ai）。
      actions.innerHTML =
        act('data-upload-replace', 'cp.media.replace', 'Replace image', '<i data-lucide="refresh-cw" class="ztor-icon"></i>') +
        (ai ? act('data-upload-optimize', 'cp.media.optimize', 'AI optimize', '<i data-lucide="sparkles" class="ztor-icon"></i>', 'upload-tile__act--ai') : '') +
        act('data-upload-remove',  'cp.media.remove',  'Remove image',  '<i data-lucide="trash-2" class="ztor-icon"></i>');
    }

    var badge = null;
    if (ai) { badge = el('span', 'upload-tile__badge', '<i data-lucide="sparkles" class="ztor-icon"></i><span data-i18n="cp.media.optimized">' + T('cp.media.optimized', 'Optimized to spec') + '</span>'); }

    tile.append(input);
    if (ownThumb) tile.append(thumb);
    if (content) tile.append(video, filemark, audioEl);
    if (badge) tile.append(badge);
    tile.append(overlay, progress, actions);
    if (window.ztorIcons) window.ztorIcons.applyIcons(tile);

    var statusEl = overlay.querySelector('.upload-tile__status');
    var bar = progress.querySelector('.upload-tile__bar');
    var playBtn = content ? actions.querySelector('[data-upload-play]') : null;
    var timer = null, url = null;
    var kbd = false;   // 這一輪互動是不是鍵盤觸發的（決定過場後要不要把焦點交還，見 refocusAfter）

    /* 鍵盤可及性（2026-07-31）：可點擊的空格是 <div>（元件要往格內塞 input/img/div，
       包在 <button> 裡是無效 HTML），所以得自己補語意與焦點——空狀態＝role=button＋tabindex=0，
       非空狀態把兩者拿掉（此時整格不再可觸發，能操作的是動作列那兩顆真 <button>）。
       沒有可見文字的格（如附圖列只有一個「＋」）補 aria-label，並掛 data-i18n-aria-label 讓切語言時重譯。 */
    function syncA11y() {
      var empty = tile.classList.contains('is-empty');
      if (empty && tile.tagName !== 'BUTTON') {
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        /* 沒有可見標題時才自己補一個。退路依模式分兩種：內容檔格收的是音訊／影片／字幕之類的
           檔案，套圖片格的「新增圖片」會直接誤導螢幕閱讀器使用者（2026-08-07 修）。
           需要更精確的說法（「上傳預告片」）由消費頁自己寫 aria-label＋data-i18n-aria-label，
           這裡的 hasAttribute 檢查會讓路。 */
        if (!tile.hasAttribute('aria-label') && !tile.querySelector('.upload-tile__title')) {
          var addKey = content ? 'cp.cfile.add' : 'cp.media.add';
          tile.setAttribute('aria-label', T(addKey, content ? 'Add file' : 'Add image'));
          tile.setAttribute('data-i18n-aria-label', addKey);
        }
      } else {
        tile.removeAttribute('role');
        tile.removeAttribute('tabindex');
      }
    }
    function setState(s) { STATES.forEach(function (c) { tile.classList.remove(c); }); tile.classList.add(s); syncA11y(); }
    function emit() {
      var filled = tile.classList.contains('is-filled') || tile.classList.contains('is-optimized');
      var key = tile.dataset.uploadKey || tile.dataset.cpAsset || null;
      /* state 讓消費頁講得出「現在是上傳中還是處理中」——filled 只夠回答「能不能用」，
         而 F1 要求把上傳與處理的進度顯示給創作者看（規格 5.1.2.2.1 F1）。 */
      var state = 'empty';
      STATES.forEach(function (c) { if (tile.classList.contains(c)) state = c.replace('is-', ''); });
      tile.dispatchEvent(new CustomEvent('upload:change', { bubbles: true, detail: { key: key, filled: filled, state: state } }));
    }
    function resetMedia() {
      if (!content) return;
      try { if (media) media.pause(); } catch (e) {}
      if (playBtn) playBtn.classList.remove('is-playing');
      tile.classList.remove('upload-tile--playable');
      video.classList.remove('is-shown'); video.removeAttribute('src');
      filemark.classList.remove('is-shown');
      audioEl.removeAttribute('src'); media = null;
    }
    function showContent(file) {
      var type = file.type || '';
      fileName.textContent = file.name;
      if (type.indexOf('video') === 0) {
        video.src = url; video.classList.add('is-shown'); media = video; tile.classList.add('upload-tile--playable');
      } else if (type.indexOf('audio') === 0) {
        audioEl.src = url; media = audioEl;
        fileIcon.setAttribute('data-lucide', 'music'); filemark.classList.add('is-shown'); tile.classList.add('upload-tile--playable');
        if (window.ztorIcons) window.ztorIcons.applyIcons(filemark);
      } else {
        fileIcon.setAttribute('data-lucide', 'file'); filemark.classList.add('is-shown');  // 非媒體：不可播放
        if (window.ztorIcons) window.ztorIcons.applyIcons(filemark);
      }
    }

    /* 上傳中／優化中這兩個過場會把動作列整個收掉（display:none），鍵盤使用者剛剛按下的那顆鈕
       當場從版面消失、焦點掉回 <body>，過場結束後也回不來。過場完成時把焦點交還給對應的鈕。
       只在「這一輪互動是鍵盤觸發的」才做（kbd 旗標）——滑鼠使用者若被程式塞回焦點，
       :focus-within 會讓動作列一直亮著、看起來像卡住。 */
    function refocusAfter(sel) {
      if (!kbd) return;
      var a = document.activeElement;
      if (a && a !== document.body && !tile.contains(a)) return;   // 使用者已經走到別處，不搶焦點
      var b = actions.querySelector(sel);
      if (b && b.offsetParent !== null) b.focus();
    }

    function startUpload(file) {
      if (url) URL.revokeObjectURL(url);
      resetMedia();
      url = URL.createObjectURL(file);
      if (!content) thumb.src = url;
      setState('is-uploading'); statusEl.textContent = T('cp.media.uploading', 'Uploading…'); bar.style.width = '0%';
      /* 開始上傳也要通知一次：消費頁要能把「上傳中」寫進畫面，而不是等到傳完才有反應。
         此時 filled 為 false，就緒檢查照舊把它算成未完成。 */
      emit();
      var pct = 0; clearInterval(timer);
      timer = setInterval(function () {
        pct += Math.random() * 12 + 6;
        if (pct >= 100) {
          pct = 100; clearInterval(timer); bar.style.width = '100%';
          setTimeout(function () {
            if (content) showContent(file);
            if (needsProcessing) startProcessing(); else { setState('is-filled'); emit(); refocusAfter('[data-upload-replace]'); }
          }, 260);
        }
        bar.style.width = pct + '%';
      }, 200);
    }
    /* 處理中：檔案已在伺服器上、但還不能用。狀態要先發一次（讓消費頁把「處理中」
       寫進畫面、同時知道還不能送出），完成後再發一次。 */
    function startProcessing() {
      setState('is-processing');
      statusEl.textContent = T('cp.cfile.processing', 'Processing…');
      emit();
      clearTimeout(timer);
      timer = setTimeout(function () { setState('is-filled'); emit(); refocusAfter('[data-upload-replace]'); }, 2400);
    }
    function optimize() {
      setState('is-optimizing'); statusEl.textContent = T('cp.media.optimizing', 'Optimizing…');
      clearTimeout(timer); timer = setTimeout(function () { setState('is-optimized'); emit(); refocusAfter('[data-upload-optimize]'); }, 1200);
    }
    function togglePlay() {
      if (!media) return;
      if (media.paused) {
        // 一次只播一個
        document.querySelectorAll('.upload-tile__act--play.is-playing').forEach(function (b) { b.classList.remove('is-playing'); });
        media.play().catch(function () {}); playBtn.classList.add('is-playing');
        media.onended = function () { playBtn.classList.remove('is-playing'); };
      } else { media.pause(); playBtn.classList.remove('is-playing'); }
    }
    function remove() {
      var hadFocus = tile.contains(document.activeElement);
      clearInterval(timer); clearTimeout(timer);
      if (url) { URL.revokeObjectURL(url); url = null; }
      thumb.removeAttribute('src'); resetMedia(); input.value = ''; setState('is-empty'); emit();
      /* 空狀態的動作列是 display:none，剛剛被按下的刪除鈕當場從版面消失、焦點會掉回 <body>，
         鍵盤使用者等於被丟回頁首。把焦點交還給整格（此時它是 role=button）。
         emit() 有可能讓消費頁把整格移除（如項目詳情相簿），所以先確認它還在文件裡。 */
      if (hadFocus && tile.isConnected) tile.focus();
    }
    function pickAccept() { input.accept = content ? (tile.getAttribute('data-upload-accept') || '*/*') : 'image/*'; }

    /* 既有素材預填（data-upload-src，2026-07-27）——編輯態專用的起始狀態。
       此前這支只認得「使用者剛選的檔案」（createObjectURL），沒有「這格在伺服器上本來就有一張圖」
       這個狀態；但那正是所有編輯流程的常態（edit-event 是第一個消費者，edit-product／
       edit-auction 出現時需要的是同一件事）。故加一個屬性：有值就直接進 is-filled 並掛上縮圖，
       不跑假上傳計時。沒有這個屬性的 tile 行為與先前完全相同，既有五個消費頁不受影響。 */
    var preset = tile.getAttribute('data-upload-src') || (!ownThumb && thumb.getAttribute('src')) || '';
    if (preset) { thumb.src = preset; setState('is-filled'); }
    syncA11y();   // preset 沒命中時 setState 不會被呼叫，起始狀態也要同步一次
    /* 頁面 JS 也會直接改狀態 class（product-detail 依 ?id 把圖填進格子、bundle-detail 重繪相簿），
       那條路徑不經過 setState，會留下「已填圖卻仍可 Tab 進去、按 Enter 又什麼都不做」的殘留焦點站。
       盯著 class 變動重跑一次最省事；syncA11y 只改 role/tabindex/aria-label，不會觸發自己。 */
    if (window.MutationObserver) {
      new MutationObserver(syncA11y).observe(tile, { attributes: true, attributeFilter: ['class'] });
    }

    input.addEventListener('change', function () { if (input.files && input.files[0]) startUpload(input.files[0]); });
    tile.addEventListener('click', function (e) {
      if (e.target.closest('[data-upload-play],[data-upload-replace],[data-upload-optimize],[data-upload-remove]')) return;
      if (tile.classList.contains('is-empty')) { pickAccept(); input.click(); }
    });
    /* role=button 的 <div> 不會自己把 Enter／Space 轉成 click，得手動補，行為與滑鼠點擊一致。
       只處理落在整格上的按鍵；焦點在動作列那兩顆真 <button> 時交給瀏覽器原生行為（否則會觸發兩次）。 */
    tile.addEventListener('pointerdown', function () { kbd = false; });
    tile.addEventListener('keydown', function (e) {
      var activate = e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';
      if (activate) kbd = true;   // 動作鈕上的 Enter/Space 也會冒泡到這裡，一併記錄
      if (e.target !== tile) return;   // 焦點在動作鈕上時交給瀏覽器原生行為，否則會觸發兩次
      if (!activate || !tile.classList.contains('is-empty')) return;
      e.preventDefault();   // Space 預設會捲頁
      pickAccept(); input.click();
    });
    if (playBtn) playBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePlay(); });
    actions.querySelector('[data-upload-replace]').addEventListener('click', function (e) { e.stopPropagation(); pickAccept(); input.click(); });
    var aiBtn = actions.querySelector('[data-upload-optimize]'); if (aiBtn) aiBtn.addEventListener('click', function (e) { e.stopPropagation(); optimize(); });
    actions.querySelector('[data-upload-remove]').addEventListener('click', function (e) { e.stopPropagation(); remove(); });
  }

  function init() { document.querySelectorAll('.upload-tile[data-upload]').forEach(enhance); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  window.ztorUploadTile = { enhance: enhance, init: init };
})();
