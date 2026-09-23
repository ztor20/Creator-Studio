/* ============================================================
   Pager — 數字分頁的行為（樣式在 ds-components/pager.css）

   2026-08-10 從 partials/finance-overview.js 抽出來。原本是那支 partial 的
   內部函式，服務「我的項目」與「提領歷史」兩張表；收入管理的貼文報告明細也要
   分頁，但那一頁不載 finance-overview.js，複製一份就會長出兩個會分岔的實作。

   契約：呼叫端給「目前要分頁的 <tr> 陣列」的 getter（篩選後可即時變動）、
   每頁筆數、以及一個 .pager 容器；模組負責藏／顯示列與重畫頁碼列。
   回傳 render(page)——外部資料重畫之後再呼叫一次即可（不傳頁碼＝留在目前這頁，
   超出總頁數會自動退到最後一頁）。

   刻意不接管資料：列由呼叫端自己產生，這支只管「哪幾列現在看得見」。
   ============================================================ */
(function () {
  'use strict';

  function btn(label, enabled, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--ghost btn--sm';
    b.textContent = label;
    if (!enabled) b.disabled = true;
    else b.addEventListener('click', onClick);
    return b;
  }

  function mount(getRows, size, nav) {
    if (!nav) return function () {};
    var page = 1;
    function render(p) {
      var rows = getRows();
      var pages = Math.max(1, Math.ceil(rows.length / size));
      if (p != null) page = p;
      if (page > pages) page = pages;
      rows.forEach(function (r, i) {
        r.hidden = !(i >= (page - 1) * size && i < page * size);
      });
      nav.innerHTML = '';
      /* 只有一頁就不畫頁碼列——一顆孤零零的「1」不提供任何資訊，
         只是告訴人「這裡本來可以翻頁」。 */
      if (pages <= 1) return;
      nav.appendChild(btn('‹', page > 1, function () { render(page - 1); }));
      for (var n = 1; n <= pages; n++) (function (n) {
        var b = btn(String(n), true, function () { render(n); });
        if (n === page) b.setAttribute('aria-current', 'page');
        nav.appendChild(b);
      })(n);
      nav.appendChild(btn('›', page < pages, function () { render(page + 1); }));
    }
    render(1);
    return render;
  }

  window.ztorPager = { mount: mount };
})();
