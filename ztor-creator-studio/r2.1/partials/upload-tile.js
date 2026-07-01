// partials/upload-tile.js — 互動上傳格增強器
//
// 兩種模式（皆 .upload-tile[data-upload]）：
//  · 顯示圖（data-upload=""，Show it off §4 F1）：縮圖＋hover 替換／AI 優化／刪除。
//  · 內容檔（data-upload="content"，§4.2 F11 音樂/影片/檔案）：上傳後可播放（音訊/影片，
//    真實 <audio>/<video>）與刪除，操作比照顯示圖；影片顯示影格、音訊/檔案顯示檔型圖示＋檔名；無 AI。
// 狀態流：空 → 點擊選檔 → 上傳中（進度條假走 ~2.5s）→ 已上傳（hover 動作）。
// 全前端 demo：URL.createObjectURL 顯示/播放所選檔，不真的上傳。
// 每次狀態變動 dispatch 'upload:change'（bubbles，detail:{key,filled}）供頁面更新就緒。
(function () {
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function el(tag, cls, html) { var n = document.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; }

  var STATES = ['is-empty', 'is-uploading', 'is-filled', 'is-optimizing', 'is-optimized'];

  function enhance(tile) {
    if (tile.__uploadReady) return; tile.__uploadReady = true;
    var content = tile.getAttribute('data-upload') === 'content';
    if (!STATES.some(function (s) { return tile.classList.contains(s); })) tile.classList.add('is-empty');

    var input = el('input', 'upload-tile__input'); input.type = 'file'; input.hidden = true;
    var thumb = el('img', 'upload-tile__thumb'); thumb.alt = '';
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

    // hover 動作列
    var actions = el('div', 'upload-tile__actions');
    if (content) {
      actions.innerHTML =
        '<button type="button" class="upload-tile__act upload-tile__act--play" data-upload-play aria-label="' + T('cp.cfile.play', 'Play') + '" title="' + T('cp.cfile.play', 'Play') + '"><i data-lucide="play" class="ztor-icon upload-tile__ic-play"></i><i data-lucide="pause" class="ztor-icon upload-tile__ic-pause"></i></button>' +
        '<button type="button" class="upload-tile__act" data-upload-replace aria-label="' + T('cp.cfile.replace', 'Replace') + '" title="' + T('cp.cfile.replace', 'Replace') + '"><i data-lucide="refresh-cw" class="ztor-icon"></i></button>' +
        '<button type="button" class="upload-tile__act" data-upload-remove aria-label="' + T('cp.cfile.remove', 'Remove') + '" title="' + T('cp.cfile.remove', 'Remove') + '"><i data-lucide="trash-2" class="ztor-icon"></i></button>';
    } else {
      actions.innerHTML =
        '<button type="button" class="upload-tile__act" data-upload-replace aria-label="' + T('cp.media.replace', 'Replace image') + '" title="' + T('cp.media.replace', 'Replace image') + '"><i data-lucide="refresh-cw" class="ztor-icon"></i></button>' +
        '<button type="button" class="upload-tile__act upload-tile__act--ai" data-upload-optimize aria-label="' + T('cp.media.optimize', 'AI optimize') + '" title="' + T('cp.media.optimize', 'AI optimize') + '"><i data-lucide="sparkles" class="ztor-icon"></i></button>' +
        '<button type="button" class="upload-tile__act" data-upload-remove aria-label="' + T('cp.media.remove', 'Remove image') + '" title="' + T('cp.media.remove', 'Remove image') + '"><i data-lucide="trash-2" class="ztor-icon"></i></button>';
    }

    var badge = null;
    if (!content) { badge = el('span', 'upload-tile__badge', '<i data-lucide="sparkles" class="ztor-icon"></i><span data-i18n="cp.media.optimized">' + T('cp.media.optimized', 'Optimized to spec') + '</span>'); }

    tile.append(input, thumb);
    if (content) tile.append(video, filemark, audioEl);
    if (badge) tile.append(badge);
    tile.append(overlay, progress, actions);
    if (window.ztorIcons) window.ztorIcons.applyIcons(tile);

    var statusEl = overlay.querySelector('.upload-tile__status');
    var bar = progress.querySelector('.upload-tile__bar');
    var playBtn = content ? actions.querySelector('[data-upload-play]') : null;
    var timer = null, url = null;

    function setState(s) { STATES.forEach(function (c) { tile.classList.remove(c); }); tile.classList.add(s); }
    function emit() {
      var filled = tile.classList.contains('is-filled') || tile.classList.contains('is-optimized');
      tile.dispatchEvent(new CustomEvent('upload:change', { bubbles: true, detail: { key: tile.dataset.cpAsset || null, filled: filled } }));
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

    function startUpload(file) {
      if (url) URL.revokeObjectURL(url);
      resetMedia();
      url = URL.createObjectURL(file);
      if (!content) thumb.src = url;
      setState('is-uploading'); statusEl.textContent = T('cp.media.uploading', 'Uploading…'); bar.style.width = '0%';
      var pct = 0; clearInterval(timer);
      timer = setInterval(function () {
        pct += Math.random() * 12 + 6;
        if (pct >= 100) { pct = 100; clearInterval(timer); bar.style.width = '100%'; setTimeout(function () { if (content) showContent(file); setState('is-filled'); emit(); }, 260); }
        bar.style.width = pct + '%';
      }, 200);
    }
    function optimize() {
      setState('is-optimizing'); statusEl.textContent = T('cp.media.optimizing', 'Optimizing…');
      clearTimeout(timer); timer = setTimeout(function () { setState('is-optimized'); emit(); }, 1200);
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
      clearInterval(timer); clearTimeout(timer);
      if (url) { URL.revokeObjectURL(url); url = null; }
      thumb.removeAttribute('src'); resetMedia(); input.value = ''; setState('is-empty'); emit();
    }
    function pickAccept() { input.accept = content ? (tile.getAttribute('data-upload-accept') || '*/*') : 'image/*'; }

    input.addEventListener('change', function () { if (input.files && input.files[0]) startUpload(input.files[0]); });
    tile.addEventListener('click', function (e) {
      if (e.target.closest('[data-upload-play],[data-upload-replace],[data-upload-optimize],[data-upload-remove]')) return;
      if (tile.classList.contains('is-empty')) { pickAccept(); input.click(); }
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
