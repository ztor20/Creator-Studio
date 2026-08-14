/* ============================================================
   detail-sheet.js — 清單 → 細節不再導航走，改開覆蓋層

   使用者裁示 2026-07-28：
     「點一個專案時應該用覆蓋層顯示專案頁，關掉就回到收益頁。
       不要發明新的詳情頁設計，就用同一個詳情頁，只是變成覆蓋層，
       這樣不會打斷使用者原本的動作。這在很多頁都會發生，
       請檢查每一頁的流程，用同一個方法解決。」

   ── 這在修什麼 ────────────────────────────────────────────
   清單頁的價值在「當下這一批」：篩選、搜尋、排序、分頁、捲動位置，合起來是
   使用者花力氣建立的一個工作狀態。整頁導航到細節頁會把它整個丟掉——瀏覽器
   上一頁救得回網址，救不回 JS 篩出來的那份清單。財務總覽最明顯：篩了分類、
   翻到第 2 頁、點進一個專案，回來又是第 1 頁的全部分類。
   覆蓋層讓那份狀態原封不動地留在底下，關掉就在原地。

   ── 為什麼是 iframe ───────────────────────────────────────
   因為使用者說「用同一個詳情頁」。iframe 載入的就是 project-detail.html 本人，
   不是抄一份版面。若改成 fetch HTML 再塞進當前文件，細節頁那些內嵌 script
   會在同一個 window 上重跑一次，跟清單頁的全域變數互相踩——而且從此有兩條
   算繪路徑要維護，遲早長得不一樣。
   站上本來就有這個作法：ds-components/embed-modal.css 用 iframe 開商店設定，
   它的註解自己寫著「Reusable for any "open page X as a popup" need」。

   ── 契約 ──────────────────────────────────────────────────
   頁面在 <body> 掛 data-sheet-nav 即啟用；本檔攔截該頁所有指向細節頁的
   連結／列，改成開覆蓋層。逐頁 opt-in 而不是全站自動，是因為有些「離開」
   是使用者真的想離開（例如精靈的下一步、麵包屑往回）。
     · a[href="*-detail.html*"]   一般連結
     · [data-go] / [data-fin-go]  整列可點（dashboard 卡、財務總覽列）
     · [data-sheet-ignore]        單點退出，仍走原本的整頁導航
   關閉：✕、Esc、點背板、瀏覽器上一頁。開啟時 pushState 一個 ?sheet= 參數，
   所以上一頁＝關覆蓋層，而不是離開清單頁；重新整理也還原得回來。
   ============================================================ */
(function () {
  'use strict';

  var DETAIL_RE = /(^|\/)([a-z-]+-detail|project-detail)\.html(\?|#|$)/i;
  var PARAM = 'sheet';

  var sheet = null, frame = null, titleEl = null, openBtn = null;
  var lastFocus = null, currentUrl = null, pushed = false;

  function T(key, fallback) {
    var s = window.i18nT ? window.i18nT(key) : null;
    return s == null ? fallback : s;
  }

  /* 墓碑（2026-08-13）：返回鈕退場後沒有消費者了，但函式先留著——它解過一個實際的坑
     （h1 有時是一句話而不是地名，「Back to Your fans, ranked.」不成句），
     之後若要在浮層上寫出「這是從哪裡打開的」還用得到。 */
  function hereName() {
    /* 2026-07-28：麵包屑收成 .page-crumb（原本是 .text-sub ＋ inline style），選擇器跟著改。 */
    var crumb = document.querySelector('.page > .page-crumb [data-i18n], .page > .page-crumb');
    if (crumb && crumb.textContent.trim()) return crumb.textContent.trim();
    var nav = document.querySelector('[aria-current="page"]');
    if (nav && nav.textContent.trim()) return nav.textContent.trim();
    var h1 = document.querySelector('.page-intro__title');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim().replace(/[.。]$/, '');
    return document.title.split('·')[0].trim();
  }

  function build() {
    if (sheet) return;
    sheet = document.createElement('div');
    sheet.className = 'detail-sheet';
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="detail-sheet__panel" role="dialog" aria-modal="true" aria-label="Detail">' +
        '<div class="detail-sheet__head">' +
          /* 2026-08-13 使用者指示：左邊的「返回清單」退場，改成「整頁開啟」。
             返回跟右上角的 ✕ 是同一個動作（都關掉這張浮層回到清單），兩個入口說同一件事；
             真正缺的是那個從浮層跳去完整頁面的出口，本來只有一顆沒有文字的圖示鈕。 */
          /* 2026-08-13 第二輪（使用者「不需要文字」）：只留圖示，說明交給 title／aria-label。
             這一列的主角是活動名稱，左邊擺一段文字會跟標題搶。 */
          '<button class="detail-sheet__back" type="button" data-sheet-openfull ' +
            'aria-label="' + T('sheet.openfull', 'Open as full page') + '" ' +
            'title="' + T('sheet.openfull', 'Open as full page') + '">' +
            '<i data-lucide="external-link" class="ztor-icon"></i>' +
          '</button>' +
          '<h2 class="detail-sheet__title" data-sheet-title></h2>' +
          '<div class="detail-sheet__actions">' +
            '<button class="detail-sheet__btn" type="button" data-sheet-close ' +
              'aria-label="' + T('sheet.close', 'Close') + '" title="' + T('sheet.close', 'Close') + '">' +
              '<i data-lucide="x" class="ztor-icon"></i></button>' +
          '</div>' +
        '</div>' +
        '<iframe class="detail-sheet__frame" data-sheet-frame title="Detail"></iframe>' +
      '</div>';
    document.body.appendChild(sheet);
    frame = sheet.querySelector('[data-sheet-frame]');
    titleEl = sheet.querySelector('[data-sheet-title]');
    openBtn = sheet.querySelector('[data-sheet-openfull]');

    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) close();                                   /* 點背板 */
      if (e.target.closest('[data-sheet-close]')) close();
      if (e.target.closest('[data-sheet-openfull]') && currentUrl) {
        /* 真的想離開清單時的出口：整頁打開這一頁（去掉 embed 參數）。 */
        location.href = stripEmbed(currentUrl);
      }
    });
    if (window.ztorIcons) window.ztorIcons.applyIcons(sheet);
    if (window.applyI18n) window.applyI18n(sheet);
  }

  function withEmbed(url) {
    var hash = '', u = url;
    var h = u.indexOf('#');
    if (h >= 0) { hash = u.slice(h); u = u.slice(0, h); }
    u += (u.indexOf('?') >= 0 ? '&' : '?') + 'embed=1';
    /* 主題要一起帶進去。theme.js 支援 ?theme= 這個「不落地」的除錯覆寫——
       它不寫 localStorage，所以 iframe 只看 localStorage 會拿到別的值：
       實測外層 ?theme=light、裡面卻是深色，覆蓋層跟底下那頁兩種主題。
       帶的是「目前實際套用的」主題（getResolved），不是偏好值，
       所以 system 模式下也會跟外層一致。 */
    try {
      /* 讀 <html data-theme>（畫面上真正套用的那個），不是 ztorTheme.getResolved()——
         後者回報的是「儲存的偏好」，會忽略 ?theme= 這個不落地的除錯覆寫，
         實測外層 ?theme=light 時它仍回 dark，覆蓋層就跟底下那頁不同色。
         屬性是算繪的事實，偏好只是它的來源之一。 */
      var resolved = document.documentElement.getAttribute('data-theme')
                     || (window.ztorTheme && window.ztorTheme.getResolved && window.ztorTheme.getResolved());
      if (resolved) u += '&theme=' + encodeURIComponent(resolved);
    } catch (_) {}
    return u + hash;
  }
  function stripEmbed(url) {
    return url.replace(/([?&])embed=1&?/, '$1').replace(/([?&])theme=[^&#]*&?/, '$1').replace(/[?&]$/, '');
  }

  function open(url, label, trigger) {
    build();
    currentUrl = url;
    /* 關閉後焦點要回到「剛剛點的那一列」。document.activeElement 在滑鼠點 <tr> 時是
       <body>——<tr> 沒有 tabindex 就收不到焦點，鍵盤使用者一關覆蓋層就掉回頁首，
       等於還是弄丟了位置。所以記住觸發的元素本身，必要時臨時給它 tabindex=-1
       （-1＝程式可對焦但不進 Tab 序列，不會多出一個定位點）。 */
    lastFocus = trigger || document.activeElement;
    if (lastFocus && lastFocus.tabIndex < 0 && !lastFocus.hasAttribute('tabindex')) {
      lastFocus.setAttribute('tabindex', '-1');
      lastFocus.setAttribute('data-sheet-tabindex', '');
    }

    titleEl.textContent = label || '';
    /* 墓碑：原本這裡寫「返回<清單名>」（i18n key sheet.back 保留未用）；
       2026-08-13 第二輪改成純圖示鈕，連文字節點都不需要了。 */
    frame.setAttribute('data-loading', '');
    frame.setAttribute('src', withEmbed(url));
    frame.addEventListener('load', onFrameLoad);

    sheet.hidden = false;
    document.body.classList.add('has-detail-sheet');
    /* 焦點進到覆蓋層，鍵盤才不會還停在底下那份清單上。 */
    sheet.querySelector('[data-sheet-close]').focus();

    /* 上一頁＝關覆蓋層。沒有這一步，使用者按上一頁會直接離開清單頁——
       那正是這個元件要避免的事。 */
    try {
      var u = new URL(location.href);
      u.searchParams.set(PARAM, url);
      history.pushState({ ztorSheet: url }, '', u);
      pushed = true;
    } catch (_) { pushed = false; }
  }

  function onFrameLoad() {
    frame.removeAttribute('data-loading');
    /* iframe 同源，所以拿得到裡面的標題來補覆蓋層抬頭——
       清單列上的文字有時是縮寫，細節頁自己的 h1 才是完整名稱。 */
    try {
      var doc = frame.contentDocument;
      var h1 = doc && (doc.querySelector('.pd-hero__title, .page-intro__title, h1'));
      if (h1 && h1.textContent.trim()) titleEl.textContent = h1.textContent.trim();
      /* 覆蓋層裡按 Esc 也要能關：事件在 iframe 文件上，外層收不到。 */
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

      /* 覆蓋層裡「離開這一頁」的連結要帶著整個 app 走，不能只換 iframe 的內容。
         細節頁自己也有麵包屑（「Fans / Lin Shih-han」）與跨頁 CTA；點了如果只換
         iframe，使用者會得到一個框在覆蓋層裡的清單頁——外面還有一份同樣的清單，
         兩層長得一樣卻互不相干，那比導航走更難理解。
         所以：連到另一個細節頁 → 就地換內容（還在同一個覆蓋層裡看細節，合理）；
               連到其他任何頁 → 關掉覆蓋層、由最上層導航過去。 */
      doc.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || a.target || /^(https?:|mailto:|tel:)/i.test(href)) return;
        if (DETAIL_RE.test(href)) return;                      /* 細節 → 細節，留在覆蓋層 */
        e.preventDefault();
        var dest = stripEmbed(href);
        close();
        setTimeout(function () { window.location.href = dest; }, 170);
      });
    } catch (_) {}
  }

  function close(fromPop) {
    if (!sheet || sheet.hidden) return;
    sheet.classList.add('is-closing');
    var done = function () {
      sheet.classList.remove('is-closing');
      sheet.hidden = true;
      frame.removeEventListener('load', onFrameLoad);
      frame.removeAttribute('src');          /* 卸載，下次開是乾淨的一份 */
      document.body.classList.remove('has-detail-sheet');
      currentUrl = null;
      if (lastFocus && lastFocus.isConnected) {
        lastFocus.focus({ preventScroll: true });   /* 焦點回到剛剛那一列，但不要把清單捲走 */
        if (lastFocus.hasAttribute('data-sheet-tabindex')) {
          lastFocus.removeAttribute('tabindex');
          lastFocus.removeAttribute('data-sheet-tabindex');
        }
      }
    };
    setTimeout(done, 160);

    if (pushed && !fromPop) { pushed = false; try { history.back(); } catch (_) {} }
    else pushed = false;
  }

  window.addEventListener('popstate', function () {
    var has = new URLSearchParams(location.search).get(PARAM);
    if (!has && sheet && !sheet.hidden) close(true);
  });

  /* ── 攔截 ─────────────────────────────────────────────── */

  function urlOf(el) {
    if (el.hasAttribute('data-fin-go')) return el.getAttribute('data-fin-go');
    if (el.hasAttribute('data-go')) return el.getAttribute('data-go');
    var href = el.getAttribute('href');
    return href || null;
  }

  function labelOf(el) {
    /* 列上最像「名字」的那一格：優先明確標記，其次表格的主欄，最後整列文字第一段。 */
    var n = el.querySelector('[data-sheet-label], .ztor-table__feature, .data-list__title, .project-list__name');
    if (n && n.textContent.trim()) return n.textContent.trim();
    var t = (el.textContent || '').trim().split('\n')[0].trim();
    return t.length > 60 ? t.slice(0, 60) + '…' : t;
  }

  document.addEventListener('click', function (e) {
    if (!document.body.hasAttribute('data-sheet-nav')) return;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;   /* 新分頁開啟照舊 */

    var el = e.target.closest('a[href], [data-go], [data-fin-go]');
    if (!el) return;
    if (el.closest('[data-sheet-ignore]') || el.hasAttribute('data-sheet-ignore')) return;
    if (el.closest('.detail-sheet')) return;                       /* 覆蓋層自己的按鈕 */
    if (el.target === '_blank') return;

    var url = urlOf(el);
    if (!url || !DETAIL_RE.test(url)) return;

    e.preventDefault();
    e.stopPropagation();                                            /* 攔在 components.js 的整列導航之前 */
    el.setAttribute('data-sheet-link', '');
    open(url, labelOf(el), el);
  }, true);                                                          /* 捕獲階段：整列 click 監聽器跑不到 */

  /* 重新整理／直接貼網址時還原覆蓋層 */
  function restore() {
    if (!document.body.hasAttribute('data-sheet-nav')) return;
    var url = new URLSearchParams(location.search).get(PARAM);
    if (url && DETAIL_RE.test(url)) { open(url, ''); pushed = false; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore);
  else restore();

  window.ztorDetailSheet = { open: open, close: close };
})();
