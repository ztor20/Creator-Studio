// partials/upload-tile.js — 互動上傳格增強器（spec 5.1.5.2 §4 Show it off）
//
// 對每個 .upload-tile[data-upload] 注入：hidden file input、縮圖、進行中浮層、
// 進度條、hover 動作（替換／AI 優化／刪除）、AI 優化徽章；並管理狀態流：
//   空 → 點擊開檔案選取 → 選到圖 → 上傳中（進度條假走 ~2.5s）→ 已上傳
//   已上傳 hover → 替換（重選）／刪除（回空）／AI 優化（優化中 ~1.2s → 已依規格優化）
// 全前端 demo：用 URL.createObjectURL 顯示所選圖，不真的上傳、AI 優化不真的處理。
// 每次狀態變動 dispatch 'upload:change'（bubbles，detail:{key,filled}）供頁面更新就緒檢查。
(function () {
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function el(tag, cls, html) { var n = document.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; }

  var STATES = ['is-empty', 'is-uploading', 'is-filled', 'is-optimizing', 'is-optimized'];

  function enhance(tile) {
    if (tile.__uploadReady) return; tile.__uploadReady = true;
    if (!STATES.some(function (s) { return tile.classList.contains(s); })) tile.classList.add('is-empty');

    var input = el('input', 'upload-tile__input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true;
    var thumb = el('img', 'upload-tile__thumb'); thumb.alt = '';
    var badge = el('span', 'upload-tile__badge', '<i data-lucide="sparkles" class="ztor-icon"></i><span data-i18n="cp.media.optimized">' + T('cp.media.optimized', 'Optimized to spec') + '</span>');
    var overlay = el('div', 'upload-tile__overlay', '<span class="upload-tile__spinner"></span><span class="upload-tile__status"></span>');
    var progress = el('div', 'upload-tile__progress', '<div class="upload-tile__bar"></div>');
    var actions = el('div', 'upload-tile__actions',
      '<button type="button" class="upload-tile__act" data-upload-replace aria-label="' + T('cp.media.replace', 'Replace image') + '" title="' + T('cp.media.replace', 'Replace image') + '"><i data-lucide="refresh-cw" class="ztor-icon"></i></button>' +
      '<button type="button" class="upload-tile__act upload-tile__act--ai" data-upload-optimize aria-label="' + T('cp.media.optimize', 'AI optimize') + '" title="' + T('cp.media.optimize', 'AI optimize') + '"><i data-lucide="sparkles" class="ztor-icon"></i></button>' +
      '<button type="button" class="upload-tile__act" data-upload-remove aria-label="' + T('cp.media.remove', 'Remove image') + '" title="' + T('cp.media.remove', 'Remove image') + '"><i data-lucide="trash-2" class="ztor-icon"></i></button>');

    tile.append(input, thumb, badge, overlay, progress, actions);
    if (window.ztorIcons) window.ztorIcons.applyIcons(tile);

    var statusEl = overlay.querySelector('.upload-tile__status');
    var bar = progress.querySelector('.upload-tile__bar');
    var timer = null, url = null;

    function setState(s) { STATES.forEach(function (c) { tile.classList.remove(c); }); tile.classList.add(s); }
    function emit() {
      var filled = tile.classList.contains('is-filled') || tile.classList.contains('is-optimized');
      tile.dispatchEvent(new CustomEvent('upload:change', { bubbles: true, detail: { key: tile.dataset.cpAsset || null, filled: filled } }));
    }

    function startUpload(file) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(file); thumb.src = url;
      setState('is-uploading'); statusEl.textContent = T('cp.media.uploading', 'Uploading…'); bar.style.width = '0%';
      var pct = 0; clearInterval(timer);
      timer = setInterval(function () {
        pct += Math.random() * 12 + 6;
        if (pct >= 100) { pct = 100; clearInterval(timer); bar.style.width = '100%'; setTimeout(function () { setState('is-filled'); emit(); }, 260); }
        bar.style.width = pct + '%';
      }, 200);
    }
    function optimize() {
      setState('is-optimizing'); statusEl.textContent = T('cp.media.optimizing', 'Optimizing…');
      clearTimeout(timer); timer = setTimeout(function () { setState('is-optimized'); emit(); }, 1200);
    }
    function remove() {
      clearInterval(timer); clearTimeout(timer);
      if (url) { URL.revokeObjectURL(url); url = null; }
      thumb.removeAttribute('src'); input.value = ''; setState('is-empty'); emit();
    }

    input.addEventListener('change', function () { if (input.files && input.files[0]) startUpload(input.files[0]); });
    tile.addEventListener('click', function (e) {
      if (e.target.closest('[data-upload-replace],[data-upload-optimize],[data-upload-remove]')) return;
      if (tile.classList.contains('is-empty')) input.click();
    });
    actions.querySelector('[data-upload-replace]').addEventListener('click', function (e) { e.stopPropagation(); input.click(); });
    actions.querySelector('[data-upload-optimize]').addEventListener('click', function (e) { e.stopPropagation(); optimize(); });
    actions.querySelector('[data-upload-remove]').addEventListener('click', function (e) { e.stopPropagation(); remove(); });
  }

  function init() { document.querySelectorAll('.upload-tile[data-upload]').forEach(enhance); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  window.ztorUploadTile = { enhance: enhance, init: init };
})();
