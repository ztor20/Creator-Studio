// partials/vip-card.js — 會員卡卡面自訂器（spec 5.1.5.2 §4.2 F11.2）
//
// 綁定每個 [data-vip-card]：Text/Image 模式切換 → 名稱文字 或 上傳 logo(PNG)，
// 即時合成到公版卡片預覽（Preview Your Card）。全前端 demo：不真的存檔/輸出卡面。
// 每次變動 dispatch 'vipcard:change'（bubbles，detail:{mode,filled}）供頁面更新就緒。
(function () {
  function bind(root) {
    if (root.__vipReady) return; root.__vipReady = true;
    var modeBtns = root.querySelectorAll('[data-vip-mode-opt]');
    var textField = root.querySelector('[data-vip-when="text"]');
    var imageField = root.querySelector('[data-vip-when="image"]');
    var nameInput = root.querySelector('[data-vip-name]');
    var logoTile = root.querySelector('[data-vip-logo]');
    var logoEl = root.querySelector('.vip-card__logo');
    var logoImg = root.querySelector('.vip-card__logo-img');
    var url = null;
    var DEFAULT = (logoEl && logoEl.textContent.trim()) || 'LOGO';

    function emit() {
      var mode = root.classList.contains('vip-card--image') ? 'image' : 'text';
      var filled = mode === 'image' ? !!(logoImg && logoImg.getAttribute('src')) : !!(nameInput && nameInput.value.trim());
      root.dispatchEvent(new CustomEvent('vipcard:change', { bubbles: true, detail: { mode: mode, filled: filled } }));
    }
    function setMode(mode) {
      var isImg = mode === 'image';
      root.classList.toggle('vip-card--image', isImg);
      modeBtns.forEach(function (b) {
        var on = b.getAttribute('data-vip-mode-opt') === mode;
        b.classList.toggle('segmented__btn--active', on);
        b.setAttribute('aria-selected', String(on));
      });
      if (textField) textField.hidden = isImg;
      if (imageField) imageField.hidden = !isImg;
      emit();
    }
    modeBtns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-vip-mode-opt')); }); });

    // Text 模式：輸入即時更新卡面文字（空 → 預設 LOGO 占位）
    if (nameInput) nameInput.addEventListener('input', function () { if (logoEl) logoEl.textContent = nameInput.value.trim() || DEFAULT; emit(); });

    // Image 模式：上傳 logo → 合成到卡面（createObjectURL）
    if (logoTile) {
      var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/*'; input.hidden = true; root.appendChild(input);
      logoTile.style.cursor = 'pointer';
      logoTile.addEventListener('click', function () { input.click(); });
      input.addEventListener('change', function () {
        if (!input.files || !input.files[0]) return;
        if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(input.files[0]);
        if (logoImg) logoImg.src = url;
        logoTile.classList.add('is-filled');
        emit();
      });
    }

    setMode('text');  // 預設 Text
  }
  function init() { document.querySelectorAll('[data-vip-card]').forEach(bind); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  window.ztorVipCard = { bind: bind, init: init };
})();
