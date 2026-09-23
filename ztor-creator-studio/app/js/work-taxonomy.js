/* work-taxonomy.js · 題材（分類）與年齡分級的值域單一來源（2026-08-10）
   ------------------------------------------------------------------
   規格：documents/0-設計規格書.md §7.1.2 題材軸 21 值、§7.11 年齡分級六級。

   為什麼要有這支：這兩個值域在站上各有三個落點——
     題材：作品上架的分類（上架 F11）、建立項目影視組的分類（5.1.2.1 F4）
     年齡：上架的年齡限制（F13）、建立項目影視組的年齡分級（F4）、項目公開資訊（5.1.2.2 §2.2.8）
   規格 §7.11／§7.1.2 明講這幾處指同一份資料，所以實作也只能有一份清單。
   先前 partials/work-fields.js 自帶一份、project-detail.html 又自己寫了一組 PG-13／G／PG／R／NC-17，
   同一部片在三個畫面可以顯示三個不同的分級——這支就是把那份清單收成唯一來源。

   為什麼獨立成檔而不是掛在 work-fields.js 上：work-fields.js 是整組影片上架欄位的渲染器（八百多行），
   項目詳情只需要那六個年齡值，為了一個陣列載進整支渲染器並不划算。這支只有資料與兩個產生器。

   對外 API（window.ZtorWorkTaxonomy）：
     GENRES              21 個題材值的鍵名尾段（配 'pw.genre.' 前綴成 i18n key）
     AGES                6 個年齡分級的完整 i18n key（順序即顯示順序，第一個為預設值「全部」）
     genreKey(g)         鍵名尾段 → 完整 i18n key
     ageOptionsHtml(sel) 產生 <option> 字串，供 .select 使用
     genreChipsHtml(attr) 產生多選 chip 字串，attr 為每顆 chip 要帶的 data 屬性名

   自動接線：頁面上任何 [data-taxonomy-age] 的 <select> 與 [data-taxonomy-genres] 的容器，
   本檔載入時就地填好內容並綁好 chip 開關，宿主頁不必寫 JS。work-fields.js 走自己的
   render()（它要決定區塊外框與就緒檢查），但吃的是本檔同一份清單。
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb || k; };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* 題材軸 21 值（主規格 §7.1.2；沿用 ztor 片方後台現行清單去重後的結果）。
     存鍵名尾段而不是完整 key，因為 chip 的 data 屬性、收集時的比對都用得到這個短名。 */
  var GENRES = ['drama', 'comedy', 'action', 'romance', 'thriller', 'mystery', 'horror', 'crime',
    'scifi', 'fantasy', 'adventure', 'animation', 'family', 'music', 'history', 'war', 'western',
    'documentary', 'tvmovie', 'feature', 'ai'];

  /* 年齡分級六級（主規格 §7.11），順序即顯示順序、第一個是預設值。 */
  var AGES = ['pw.age.all', 'pw.age.7', 'pw.age.10', 'pw.age.13', 'pw.age.16', 'pw.age.18'];

  function genreKey(g) { return 'pw.genre.' + g; }

  /* 沒有 i18n 時的退路字樣（design-system.html 這類不載 i18n.js 的頁面會吃到）。
     退路是 key 本身的話，選單會顯示「pw.age.all」——那不是分級，是字典鍵。 */
  var AGE_FB = {
    'pw.age.all': 'Everyone', 'pw.age.7': '7+', 'pw.age.10': '10+',
    'pw.age.13': '13+', 'pw.age.16': '16+', 'pw.age.18': '18+'
  };

  function ageOptionsHtml(selected) {
    return AGES.map(function (k) {
      return '<option value="' + k + '"' + (k === selected ? ' selected' : '') + ' data-i18n="' + k + '">'
        + esc(T(k, AGE_FB[k] || k)) + '</option>';
    }).join('');
  }

  function genreChipsHtml(attr) {
    attr = attr || 'data-taxonomy-genre';
    return GENRES.map(function (g) {
      return '<button class="chip" type="button" ' + attr + '="' + g + '" data-i18n="' + genreKey(g) + '">'
        + esc(T(genreKey(g), g)) + '</button>';
    }).join('');
  }

  /* 就地接線：靜態 markup 只留一個空殼，內容由本檔填。
     這樣宿主頁的 HTML 不會寫死 21 顆 chip 或 6 個 option——寫死等於又生一份副本。 */
  function hydrate(root) {
    root = root || document;
    root.querySelectorAll('select[data-taxonomy-age]').forEach(function (sel) {
      if (sel.options.length) return;
      sel.innerHTML = ageOptionsHtml(sel.getAttribute('data-taxonomy-age') || AGES[0]);
    });
    root.querySelectorAll('[data-taxonomy-genres]').forEach(function (box) {
      if (box.children.length) return;
      box.innerHTML = genreChipsHtml();
    });
    if (window.applyI18n) window.applyI18n(root);
  }

  /* chip 沒有原生的「已選」狀態，開關一律走委派——之後動態塞進來的 chip 組也照樣能用。 */
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-taxonomy-genre]');
    if (!c || !c.closest('[data-taxonomy-genres]')) return;
    c.classList.toggle('chip--active');
  });

  /* 立刻跑一次，再補一次 DOMContentLoaded：本檔的 <script> 排在頁尾，執行當下靜態欄位已經解析完，
     先填好才趕得上 js/zselect.js 把 <select> 升級成自繪清單（它也在 DOMContentLoaded 掛載，
     只等那一次會變成先升級、後填選項）。hydrate 對已有內容的節點會跳過，跑兩次不會重複塞。 */
  hydrate(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hydrate(document); });
  }

  window.ZtorWorkTaxonomy = {
    GENRES: GENRES.slice(),
    AGES: AGES.slice(),
    genreKey: genreKey,
    ageOptionsHtml: ageOptionsHtml,
    genreChipsHtml: genreChipsHtml,
    hydrate: hydrate
  };
})();
