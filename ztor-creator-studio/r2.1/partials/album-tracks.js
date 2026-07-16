// partials/album-tracks.js — 數位商品「音樂專輯」多曲目管理器（spec 5.1.5.2 §4.2 F11.1）
//
// 增強每個 [data-album-tracks]：上傳多個曲目檔（mp3/mp4）→ 每檔一列曲目，
// 逐列可拖曳重排、改名（inline）、更換封面、上傳歌詞（音訊限定→出現「查看歌詞」）、刪除。
// 上傳以假進度呈現（~2s）後轉為正式列。全前端 demo：不真的上傳/存檔/處理歌詞。
// 每次曲目增減 dispatch 'albumtracks:change'（bubbles，detail:{count}）供頁面更新就緒。
(function () {
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
  }
  function baseName(name) { return name.replace(/\.[^.]+$/, ''); }

  function enhance(root) {
    if (root.__albumReady) return; root.__albumReady = true;
    var list = root.querySelector('[data-album-list]');
    var addBtn = root.querySelector('[data-album-add]');
    if (!list || !addBtn) return;

    var input = el('input'); input.type = 'file'; input.accept = 'audio/*,video/*'; input.multiple = true; input.hidden = true;
    root.appendChild(input);

    // 尚未上傳的佔位訊息
    var emptyEl = el('div', 'album-tracks__empty', '<span data-i18n="cp.album.empty">' + T('cp.album.empty', 'No files uploaded yet') + '</span>');
    root.appendChild(emptyEl);
    function syncEmpty() { emptyEl.hidden = list.querySelectorAll('.album-track').length > 0; }

    function emit() { syncEmpty(); root.dispatchEvent(new CustomEvent('albumtracks:change', { bubbles: true, detail: { count: list.querySelectorAll('.album-track:not(.is-uploading)').length } })); }

    function buildRow(file, finished) {
      var isAudio = (file.type || '').indexOf('video') === -1;
      var row = el('div', 'album-track' + (finished ? '' : ' is-uploading')); row.draggable = !!finished;
      var typeIcon = isAudio ? 'music' : 'video';
      row.innerHTML =
        '<span class="album-track__grip"><i data-lucide="grip-vertical" class="ztor-icon"></i></span>' +
        '<span class="album-track__cover">' +
          '<i data-lucide="' + typeIcon + '" class="ztor-icon album-track__cover-ph"></i>' +
          '<img class="album-track__cover-img" alt="" hidden>' +
          '<div class="album-track__cover-actions">' +
            '<button type="button" class="album-track__cover-btn" data-track-play aria-label="' + T('cp.album.track.play', 'Play') + '"><i data-lucide="play" class="ztor-icon album-track__ic-play"></i><i data-lucide="pause" class="ztor-icon album-track__ic-pause"></i></button>' +
            '<button type="button" class="album-track__cover-btn" data-track-editimg aria-label="' + T('cp.album.track.cover', 'Change image') + '"><i data-lucide="pencil" class="ztor-icon"></i></button>' +
          '</div>' +
        '</span>' +
        '<div class="album-track__main">' +
          '<div class="album-track__name"></div>' +
          '<div class="album-track__meta"></div>' +
          '<div class="album-track__bar"></div>' +
          '<button type="button" class="album-track__lyrics btn btn--outline btn--xs" hidden><i data-lucide="file-text" class="ztor-icon"></i> <span data-i18n="cp.album.viewlyrics">' + T('cp.album.viewlyrics', 'View Lyrics') + '</span></button>' +
        '</div>' +
        '<details class="dropdown album-track__menu">' +
          '<summary class="btn btn--icon btn--xs" aria-label="' + T('cp.album.track.actions', 'Track actions') + '"><i data-lucide="more-vertical" class="ztor-icon"></i></summary>' +
          '<div class="dropdown__menu" role="menu">' +
            '<button class="dropdown__item" type="button" role="menuitem" data-track-rename><i data-lucide="pencil" class="ztor-icon"></i><span data-i18n="cp.album.track.rename">' + T('cp.album.track.rename', 'Edit name') + '</span></button>' +
            '<button class="dropdown__item" type="button" role="menuitem" data-track-cover><i data-lucide="image" class="ztor-icon"></i><span data-i18n="cp.album.track.cover">' + T('cp.album.track.cover', 'Change image') + '</span></button>' +
            (isAudio ? '<button class="dropdown__item" type="button" role="menuitem" data-track-lyrics><i data-lucide="upload" class="ztor-icon"></i><span data-i18n="cp.album.track.lyrics">' + T('cp.album.track.lyrics', 'Upload lyrics') + '</span></button>' : '') +
            '<button class="dropdown__item dropdown__item--danger" type="button" role="menuitem" data-track-delete><i data-lucide="trash-2" class="ztor-icon"></i><span data-i18n="cp.album.track.delete">' + T('cp.album.track.delete', 'Delete') + '</span></button>' +
          '</div>' +
        '</details>';

      var nameEl = row.querySelector('.album-track__name');
      var metaEl = row.querySelector('.album-track__meta');
      var coverEl = row.querySelector('.album-track__cover');
      var lyricsBtn = row.querySelector('.album-track__lyrics');
      var menu = row.querySelector('details');
      var coverUrl = null;

      if (finished) {
        // 預置（seed）曲目：已存在的內容，直接呈現完成列、不跑假上傳
        nameEl.textContent = baseName(file.name);
        metaEl.textContent = file.meta || (file.name + ' · ' + fmtSize(file.size));
        if (file.lyrics && lyricsBtn) lyricsBtn.hidden = false;
      } else {
        metaEl.textContent = file.name + ' ' + T('cp.album.uploadingword', 'is uploading…');
        // 假上傳 → 完成
        setTimeout(function () {
          row.classList.remove('is-uploading');
          row.draggable = true;
          nameEl.textContent = baseName(file.name);
          metaEl.textContent = file.name + ' · ' + fmtSize(file.size) + ' · ' + T('cp.album.justnow', 'just now');
          emit();
        }, 1600 + Math.random() * 900);
      }

      function closeMenu() { if (menu) menu.open = false; }

      // 改名（inline）
      row.querySelector('[data-track-rename]').addEventListener('click', function () {
        closeMenu();
        if (row.querySelector('.album-track__name-input')) return;
        var inp = el('input', 'album-track__name-input'); inp.type = 'text'; inp.value = nameEl.textContent;
        nameEl.style.display = 'none'; nameEl.parentNode.insertBefore(inp, nameEl); inp.focus(); inp.select();
        function commit() { if (!inp.isConnected) return; var v = inp.value.trim(); if (v) nameEl.textContent = v; nameEl.style.display = ''; inp.remove(); }
        function cancel() { if (!inp.isConnected) return; nameEl.style.display = ''; inp.remove(); }
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { cancel(); } });
        inp.addEventListener('blur', commit);
      });

      // 更換封面（選單「更換封面」與封面上的編輯鈕共用）
      var coverImg = row.querySelector('.album-track__cover-img');
      var coverPh = row.querySelector('.album-track__cover-ph');
      var coverInput = el('input'); coverInput.type = 'file'; coverInput.accept = 'image/*'; coverInput.hidden = true; row.appendChild(coverInput);
      row.querySelector('[data-track-cover]').addEventListener('click', function () { closeMenu(); coverInput.click(); });
      row.querySelector('[data-track-editimg]').addEventListener('click', function () { coverInput.click(); });
      coverInput.addEventListener('change', function () {
        if (!coverInput.files || !coverInput.files[0]) return;
        if (coverUrl) URL.revokeObjectURL(coverUrl);
        coverUrl = URL.createObjectURL(coverInput.files[0]);
        coverImg.src = coverUrl; coverImg.hidden = false; if (coverPh) coverPh.style.display = 'none';
      });

      // 播放/暫停（假動作，一次只播一首）
      row.querySelector('[data-track-play]').addEventListener('click', function () {
        var wasPlaying = coverEl.classList.contains('is-playing');
        list.querySelectorAll('.album-track__cover.is-playing').forEach(function (c) { c.classList.remove('is-playing'); });
        if (!wasPlaying) coverEl.classList.add('is-playing');
      });

      // 上傳歌詞（音訊限定，假動作）→ 顯示 View Lyrics
      var lyricsItem = row.querySelector('[data-track-lyrics]');
      if (lyricsItem) lyricsItem.addEventListener('click', function () { closeMenu(); lyricsBtn.hidden = false; });

      // 刪除
      row.querySelector('[data-track-delete]').addEventListener('click', function () {
        closeMenu(); if (coverUrl) URL.revokeObjectURL(coverUrl); row.remove(); emit();
      });

      // 拖曳重排
      row.addEventListener('dragstart', function () { if (row.draggable) row.classList.add('is-dragging'); });
      row.addEventListener('dragend', function () { row.classList.remove('is-dragging'); list.querySelectorAll('.is-over').forEach(function (r) { r.classList.remove('is-over'); }); });
      row.addEventListener('dragover', function (e) { e.preventDefault(); var d = list.querySelector('.is-dragging'); if (d && d !== row) row.classList.add('is-over'); });
      row.addEventListener('dragleave', function () { row.classList.remove('is-over'); });
      row.addEventListener('drop', function (e) {
        e.preventDefault(); row.classList.remove('is-over');
        var d = list.querySelector('.is-dragging'); if (!d || d === row) return;
        var rows = Array.prototype.slice.call(list.children);
        if (rows.indexOf(d) < rows.indexOf(row)) list.insertBefore(d, row.nextSibling); else list.insertBefore(d, row);
      });

      return row;
    }

    function addFiles(files) {
      Array.prototype.forEach.call(files, function (f) { var row = buildRow(f); list.appendChild(row); if (window.ztorIcons) window.ztorIcons.applyIcons(row); });
      syncEmpty();
    }

    addBtn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { if (input.files && input.files.length) { addFiles(input.files); input.value = ''; } });

    // 預置曲目：data-album-seed = JSON array of {name, meta, type?, lyrics?}。
    // 用於商品細節頁呈現已存在的專輯內容（product-detail）；建立頁不帶此屬性＝空狀態。
    var seedRaw = root.getAttribute('data-album-seed');
    if (seedRaw) {
      try {
        JSON.parse(seedRaw).forEach(function (t) {
          var row = buildRow({ name: t.name, size: t.size || 0, type: t.type || 'audio', meta: t.meta, lyrics: t.lyrics }, true);
          list.appendChild(row);
          if (window.ztorIcons) window.ztorIcons.applyIcons(row);
        });
      } catch (e) { /* 忽略格式錯誤的 seed */ }
    }
    syncEmpty();
  }

  function init() { document.querySelectorAll('[data-album-tracks]').forEach(enhance); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  window.ztorAlbumTracks = { enhance: enhance, init: init };
})();
