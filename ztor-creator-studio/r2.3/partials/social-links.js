/* partials/social-links.js — 店面「社群連結」清單與頭像列的接線（2026-09-11）
   ============================================================================
   資料在 js/store-profile-store.js，這支只負責畫與接事件：
     [data-social-links]      清單容器：依 store 的 socials 畫列（平台名＋刪除＋網址格）、
                              「＋ 新增社群連結」虛線鈕、點開的平台清單（已加過的不列；都加完鈕就收起）
     [data-sp-avatar]         頭像列：換相片鈕開檔案選擇器，選了就存成 data URL
   網址輸入即寫回 store（預覽即時跟著變；取消由頁面用快照還原）。 */
window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function S() { return window.ZtorStoreProfile; }

  function glyph(p, cls) {
    if (p.icon) return '<i data-lucide="' + esc(p.icon) + '" class="ztor-icon"></i>';
    return '<span class="social-links__mark">' + esc(p.mark || p.label) + '</span>';
  }

  function render(root) {
    var store = S(); if (!store) return;
    var prof = store.get();
    var used = prof.socials.map(function (s) { return s.platform; });
    var rows = prof.socials.map(function (s) {
      var p = store.platform(s.platform) || { id: s.platform, label: s.platform };
      return '<div class="social-links__row" data-platform="' + esc(s.platform) + '">'
        + '<div class="social-links__head">'
        + '<span class="social-links__label">' + glyph(p) + '<span>' + esc(store.platformLabel(p.id)) + '</span></span>'
        + '<button class="btn btn--icon btn--sm social-links__remove" type="button" data-sl-remove aria-label="' + esc(T('social.remove', 'Remove')) + '" title="' + esc(T('social.remove', 'Remove')) + '"><i data-lucide="trash-2" class="ztor-icon"></i></button>'
        + '</div>'
        + '<input class="input social-links__url" type="url" data-sl-url value="' + esc(s.url || '') + '" placeholder="' + esc(T('social.url.ph', 'Paste your {p} link').replace('{p}', store.platformLabel(p.id))) + '" aria-label="' + esc(store.platformLabel(p.id)) + '">'
        + '</div>';
    }).join('');
    var options = store.PLATFORMS.filter(function (p) { return used.indexOf(p.id) < 0; }).map(function (p) {
      return '<button class="social-links__option" type="button" data-sl-pick="' + esc(p.id) + '">' + glyph(p) + '<span>' + esc(store.platformLabel(p.id)) + '</span></button>';
    }).join('');
    var wasOpen = root.querySelector('.social-links__add.is-open') != null;
    root.innerHTML = rows
      + (options ? '<button class="social-links__add' + (wasOpen ? ' is-open' : '') + '" type="button" data-sl-add aria-expanded="' + (wasOpen ? 'true' : 'false') + '"><i data-lucide="plus" class="ztor-icon"></i><span>' + esc(T('social.add', 'Add a social link')) + '</span></button>'
                 + '<div class="social-links__picker"' + (wasOpen ? '' : ' hidden') + '>' + options + '</div>' : '');
    if (window.ztorIcons) window.ztorIcons.applyIcons(root);
    /* 文字都用 T() 直接翻好，不呼叫 applyI18n——它會再發 i18n:applied，而這支正是聽那個事件重畫的（會無限迴圈） */
    /* 檢視態的 readonly 由頁面的模式切換統一處理；這裡畫完先照當下模式補上 */
    var sec = root.closest('[data-editable]');
    var ro = sec ? sec.getAttribute('data-mode') !== 'edit' : false;
    root.querySelectorAll('input').forEach(function (el) { el.readOnly = ro; });
  }

  function bind(root) {
    if (root.__slBound) return; root.__slBound = true;
    root.addEventListener('click', function (e) {
      var store = S(); if (!store) return;
      var add = e.target.closest('[data-sl-add]');
      if (add) {
        var open = !add.classList.contains('is-open');
        add.classList.toggle('is-open', open);
        add.setAttribute('aria-expanded', open ? 'true' : 'false');
        var picker = root.querySelector('.social-links__picker');
        if (picker) picker.hidden = !open;
        return;
      }
      var pick = e.target.closest('[data-sl-pick]');
      if (pick) { store.addSocial(pick.getAttribute('data-sl-pick')); render(root); var last = root.querySelector('.social-links__row:last-of-type input'); if (last) last.focus(); return; }
      var rm = e.target.closest('[data-sl-remove]');
      if (rm) { store.removeSocial(rm.closest('[data-platform]').getAttribute('data-platform')); render(root); }
    });
    root.addEventListener('input', function (e) {
      var url = e.target.closest('[data-sl-url]'); if (!url) return;
      S().setSocialUrl(url.closest('[data-platform]').getAttribute('data-platform'), url.value);
    });
    render(root);
  }

  function bindAvatar(row) {
    if (row.__spBound) return; row.__spBound = true;
    var btn = row.querySelector('[data-sp-avatar-pick]');
    var file = row.querySelector('input[type="file"]');
    if (btn && file) {
      btn.addEventListener('click', function () { file.click(); });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0]; if (!f) return;
        var fr = new FileReader();
        fr.onload = function () { S().set({ avatar: String(fr.result) }); };
        fr.readAsDataURL(f);
        file.value = '';
      });
    }
  }

  function mount(scope) {
    (scope || document).querySelectorAll('[data-social-links]').forEach(bind);
    (scope || document).querySelectorAll('[data-sp-avatar]').forEach(bindAvatar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); }); else mount();
  /* 切語言：平台名與占位字重畫；store 被整份換掉（取消還原）也重畫 */
  document.addEventListener('i18n:applied', function () { document.querySelectorAll('[data-social-links]').forEach(render); });
  window.ZTOR_PARTIALS.socialLinks = { mount: mount, render: function () { document.querySelectorAll('[data-social-links]').forEach(render); } };
})();
