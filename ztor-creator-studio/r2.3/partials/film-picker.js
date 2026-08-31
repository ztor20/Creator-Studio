/* film-picker.js — 可搜尋的電影關聯多選元件（BR-NEW-1，spec 5.1.5.2 §4.5 F12 / 5.1.5.1 §2.14 / D140）
   復用既有 tag-input + chip 元件（無自帶 CSS）：搜尋輸入格過濾候選、建議 chip 點選加入、已選 chip 可移除。
   候選來自 window.ztorFilms（films-store.js）。create-product 與 product-detail 共用。
   API：window.ZTOR_PARTIALS.createFilmPicker(hostEl, { selected?: string[], onChange?: (ids)=>void })
        → { getSelected(): string[] }。host 內容由本元件接管。 */
(function () {
  'use strict';
  window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function createFilmPicker(host, opts) {
    opts = opts || {};
    if (!host || !window.ztorFilms) return null;
    var selected = (opts.selected || []).slice();
    var onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};
    var films = window.ztorFilms.list();

    host.innerHTML =
      '<div class="tag-input">' +
      '  <div class="tag-input__field" data-fp-field>' +
      '    <input class="tag-input__entry" type="search" data-fp-search data-i18n-placeholder="films.search" placeholder="Search movies to add…">' +
      '  </div>' +
      '  <div>' +
      '    <div class="tag-input__suggest-label" data-i18n="films.suggest">Suggestions</div>' +
      '    <div class="chip-group" data-fp-suggest></div>' +
      '    <div class="field__hint" data-fp-none data-i18n="films.none" hidden>No matching movies.</div>' +
      '  </div>' +
      '</div>';

    var field = host.querySelector('[data-fp-field]'),
        search = host.querySelector('[data-fp-search]'),
        suggest = host.querySelector('[data-fp-suggest]'),
        none = host.querySelector('[data-fp-none]');

    function renderSelected() {
      field.querySelectorAll('.chip').forEach(function (c) { c.remove(); });
      selected.forEach(function (id) {
        var chip = document.createElement('span');
        chip.className = 'chip chip--active chip--removable';
        chip.innerHTML = '<span>' + esc(window.ztorFilms.title(id)) + '</span><button class="chip__remove" type="button" data-fp-remove="' + id + '" aria-label="Remove movie"><i data-lucide="x" class="ztor-icon"></i></button>';
        field.insertBefore(chip, search);
      });
      if (window.ztorIcons) window.ztorIcons.applyIcons(field);
    }
    function renderSuggest() {
      var q = (search.value || '').trim().toLowerCase();
      var avail = films.filter(function (f) { return selected.indexOf(f.id) < 0 && (!q || f.title.toLowerCase().indexOf(q) >= 0); });
      suggest.innerHTML = '';
      avail.forEach(function (f) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.dataset.fpAdd = f.id; b.textContent = f.title;
        suggest.appendChild(b);
      });
      none.hidden = avail.length > 0;
    }
    function refresh() { renderSelected(); renderSuggest(); onChange(selected.slice()); }

    field.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-fp-remove]');
      if (rm) { var i = selected.indexOf(rm.dataset.fpRemove); if (i >= 0) selected.splice(i, 1); refresh(); return; }
      if (e.target === field) search.focus();
    });
    suggest.addEventListener('click', function (e) {
      var add = e.target.closest('[data-fp-add]');
      if (add) { if (selected.indexOf(add.dataset.fpAdd) < 0) selected.push(add.dataset.fpAdd); search.value = ''; refresh(); }
    });
    search.addEventListener('input', renderSuggest);

    refresh();
    if (window.applyI18n) window.applyI18n(host);
    return { getSelected: function () { return selected.slice(); } };
  }

  window.ZTOR_PARTIALS.createFilmPicker = createFilmPicker;
}());
