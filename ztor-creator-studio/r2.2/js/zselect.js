/* ============================================================
   zselect.js — 把原生 <select> 升級成站上自己的下拉選單

   使用者回報 2026-07-28：「所有下拉的樣式都還不是我們 Ztor 的。」
   收合時的樣子一直都是我們的（input.css 的 .select）；**展開後那張清單是作業系統畫的**，
   CSS 管不到——沒有任何瀏覽器開放樣式化原生 <select> 的彈出清單。所以要換掉的不是樣式，
   是那個清單本身。

   ── 做法：漸進增強，不改任何一頁的 markup ──────────────────
   原生 <select> 留在 DOM（.zselect__native 視覺隱藏），仍然是唯一的資料來源：
   表單提交、el.value、既有的 addEventListener('change') 全部照舊。
   旁邊插一顆 <button> 當觸發鈕（原 select 的 class 與 inline style 原封複製過去，
   所以 .select / .select--bare / width 之類的既有樣式自動生效），
   選單面板則掛到 <body> 下、position:fixed。

   為什麼面板要掛 <body> 而不是放在觸發鈕旁邊：專案頁那顆「全部分類」就住在貼頂列的
   overflow-x:auto 容器裡，absolute 面板會被那一層直接裁掉。掛 body ＋ fixed 就不受
   任何祖先的 overflow 影響，代價是要自己算座標（開啟時算一次，捲動／縮放時重算）。

   ── 不接手的情況 ───────────────────────────────────────
   · [multiple] 與 [size>1]：那是多選清單，不是下拉，語意不同
   · [data-no-zselect]：逐一 opt out 的逃生口
   · 沒有 .select class 的 select：不在設計系統的管轄內

   ── 無障礙 ─────────────────────────────────────────────
   觸發鈕 role=combobox + aria-expanded/-controls/-activedescendant，
   面板 role=listbox，選項 role=option + aria-selected。
   鍵盤：↑↓ 移動、Home/End 首末、Enter/Space 選取、Esc 關閉、輸入字母跳到該字開頭的選項。
   關閉後焦點一律回到觸發鈕——焦點掉到 body 是最常見的鍵盤陷阱。
   ============================================================ */
(function () {
  'use strict';

  var CHEVRON = '<svg class="zselect__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var CHECK = '<svg class="zselect__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  var uid = 0;
  var open = null;          /* 同時只允許一個面板開著 */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function enhance(sel) {
    if (sel.multiple || sel.size > 1) return;
    if (sel.hasAttribute('data-no-zselect')) return;
    if (sel.dataset.zselectReady === '1') return;
    sel.dataset.zselectReady = '1';

    var id = 'zselect-' + (++uid);

    var btn = document.createElement('button');
    btn.type = 'button';
    /* class 與 inline style 原封搬過來：.select--bare 的無邊框樣式、projects 那顆的
       width:auto/min-width/margin-left 都靠這一步繼續生效，不必在這裡重寫任何尺寸。 */
    btn.className = 'zselect__trigger ' + sel.className;
    if (sel.getAttribute('style')) btn.setAttribute('style', sel.getAttribute('style'));
    btn.setAttribute('role', 'combobox');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id + '-panel');
    /* select 上的 aria-label / data-i18n-aria-label 要跟著搬，否則只剩一顆沒有名字的按鈕 */
    ['aria-label', 'data-i18n-aria-label', 'title'].forEach(function (a) {
      if (sel.hasAttribute(a)) btn.setAttribute(a, sel.getAttribute(a));
    });
    if (sel.disabled) btn.disabled = true;
    btn.innerHTML = '<span class="zselect__label"></span>' + CHEVRON;

    sel.classList.add('zselect__native');
    sel.setAttribute('tabindex', '-1');
    sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(btn, sel);

    var state = { sel: sel, btn: btn, id: id, panel: null, opts: [], active: -1, typed: '', typedAt: 0 };
    sel.zselect = state;

    syncLabel(state);

    /* 別人用程式改了 value（既有頁面腳本、i18n 換語言重寫 option 文字）之後，
       按鈕上的字要跟著變。change 事件抓程式外的改動，MutationObserver 抓文字被換掉的情況。 */
    sel.addEventListener('change', function () { syncLabel(state); });
    new MutationObserver(function () { syncLabel(state); })
      .observe(sel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled'] });

    btn.addEventListener('click', function () { toggle(state); });
    btn.addEventListener('keydown', function (e) { onTriggerKey(state, e); });
  }

  function syncLabel(state) {
    var o = state.sel.options[state.sel.selectedIndex];
    var label = state.btn.querySelector('.zselect__label');
    if (label) label.textContent = o ? o.textContent.trim() : '';
    state.btn.disabled = state.sel.disabled;
  }

  /* ── 開關 ─────────────────────────────────────────────── */

  function toggle(state) { (open === state ? close : openPanel)(state); }

  function openPanel(state) {
    if (open) close(open);
    if (state.sel.disabled) return;

    var panel = document.createElement('div');
    panel.className = 'zselect__panel';
    panel.id = state.id + '-panel';
    panel.setAttribute('role', 'listbox');

    var html = '', idx = 0;
    state.opts = [];
    /* 逐一走 <select> 的子節點而不是 sel.options：optgroup 的群組標題要保留順序，
       用 options 集合會把群組結構整個攤平。 */
    Array.prototype.forEach.call(state.sel.children, function (node) {
      if (node.tagName === 'OPTGROUP') {
        html += '<div class="zselect__group">' + esc(node.label) + '</div>';
        Array.prototype.forEach.call(node.children, function (o) {
          html += optionHTML(state, o, idx++, node.disabled);
          state.opts.push(o);
        });
      } else if (node.tagName === 'OPTION') {
        html += optionHTML(state, node, idx++, false);
        state.opts.push(node);
      }
    });
    panel.innerHTML = html;
    document.body.appendChild(panel);
    state.panel = panel;
    open = state;

    state.btn.setAttribute('aria-expanded', 'true');
    position(state);

    /* 開啟時游標落在目前選中的那一項——不是第一項。按 ↓ 應該是「從現在的位置往下」。 */
    setActive(state, state.sel.selectedIndex >= 0 ? state.sel.selectedIndex : 0, true);

    panel.addEventListener('mousemove', function (e) {
      var el = e.target.closest('.zselect__option');
      if (el) setActive(state, Number(el.dataset.i), false);
    });
    panel.addEventListener('click', function (e) {
      var el = e.target.closest('.zselect__option');
      if (!el || el.getAttribute('aria-disabled') === 'true') return;
      commit(state, Number(el.dataset.i));
    });

    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onDocKey, true);
    /* 捲動時面板要跟著走。true＝捕獲階段，才收得到 .main 這種內層容器的捲動。 */
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
  }

  function optionHTML(state, o, i, groupDisabled) {
    var selected = o.selected;
    var disabled = o.disabled || groupDisabled;
    return '<div class="zselect__option" role="option" data-i="' + i + '"' +
      ' aria-selected="' + (selected ? 'true' : 'false') + '"' +
      (disabled ? ' aria-disabled="true"' : '') +
      ' id="' + state.id + '-o' + i + '">' + CHECK +
      '<span>' + esc(o.textContent.trim()) + '</span></div>';
  }

  function close(state) {
    if (!state || !state.panel) return;
    state.panel.remove();
    state.panel = null;
    state.active = -1;
    state.btn.setAttribute('aria-expanded', 'false');
    state.btn.removeAttribute('aria-activedescendant');
    if (open === state) open = null;
    document.removeEventListener('mousedown', onDocDown, true);
    document.removeEventListener('keydown', onDocKey, true);
    window.removeEventListener('scroll', onReflow, true);
    window.removeEventListener('resize', onReflow);
  }

  /* ── 定位 ─────────────────────────────────────────────── */

  function position(state) {
    var p = state.panel;
    if (!p) return;
    var r = state.btn.getBoundingClientRect();
    var gap = 6;
    p.style.minWidth = Math.max(r.width, 200) + 'px';
    p.style.left = '0px';                 /* 先歸零再量，避免用到上一次的位置 */
    p.style.top = '0px';
    var h = p.offsetHeight;
    var w = p.offsetWidth;

    /* 下方放不下就翻到上方——但只有在上方真的比較寬裕時才翻，
       否則寧可留在下方讓面板自己捲（面板有 max-height + overflow-y）。 */
    var below = window.innerHeight - r.bottom - gap;
    var above = r.top - gap;
    var up = h > below && above > below;
    p.classList.toggle('zselect__panel--up', up);
    p.style.top = (up ? Math.max(8, r.top - gap - h) : r.bottom + gap) + 'px';
    /* 靠左對齊觸發鈕；超出右緣就往左收，永遠留 8px 邊界 */
    p.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
  }

  function onReflow() {
    if (!open) return;
    /* 觸發鈕被捲出畫面就關掉：一張浮在半空、指向看不見的欄位的選單沒有意義。 */
    var r = open.btn.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { close(open); return; }
    position(open);
  }

  /* ── 互動 ─────────────────────────────────────────────── */

  function setActive(state, i, scroll) {
    if (!state.panel) return;
    var items = state.panel.querySelectorAll('.zselect__option');
    if (!items.length) return;
    i = Math.max(0, Math.min(i, items.length - 1));
    items.forEach(function (el) { el.classList.remove('zselect__option--active'); });
    var el = items[i];
    el.classList.add('zselect__option--active');
    state.active = i;
    state.btn.setAttribute('aria-activedescendant', el.id);
    if (scroll) el.scrollIntoView({ block: 'nearest' });
  }

  function step(state, delta) {
    var items = state.panel.querySelectorAll('.zselect__option');
    var i = state.active;
    /* 跳過停用項：連按 ↓ 停在一個選不了的項目上，看起來就像壞掉。 */
    for (var n = 0; n < items.length; n++) {
      i += delta;
      if (i < 0 || i >= items.length) return;
      if (items[i].getAttribute('aria-disabled') !== 'true') { setActive(state, i, true); return; }
    }
  }

  function commit(state, i) {
    var o = state.opts[i];
    if (o) {
      state.sel.selectedIndex = Array.prototype.indexOf.call(state.sel.options, o);
      syncLabel(state);
      /* 兩個事件都派：頁面腳本有的聽 change、有的聽 input，而程式設定 value
         本來就不會自動觸發任何一個。bubbles 讓委派監聽器也收得到。 */
      state.sel.dispatchEvent(new Event('input', { bubbles: true }));
      state.sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close(state);
    state.btn.focus();
  }

  function onTriggerKey(state, e) {
    if (open === state) return;      /* 開著的時候由 onDocKey 接手 */
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel(state);
    }
  }

  function onDocDown(e) {
    if (!open) return;
    if (open.panel.contains(e.target) || open.btn.contains(e.target)) return;
    close(open);
  }

  function onDocKey(e) {
    var state = open;
    if (!state) return;
    switch (e.key) {
      case 'Escape':    e.preventDefault(); close(state); state.btn.focus(); break;
      case 'ArrowDown': e.preventDefault(); step(state, 1); break;
      case 'ArrowUp':   e.preventDefault(); step(state, -1); break;
      case 'Home':      e.preventDefault(); setActive(state, 0, true); break;
      case 'End':       e.preventDefault(); setActive(state, state.opts.length - 1, true); break;
      case 'Tab':       close(state); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        var items = state.panel.querySelectorAll('.zselect__option');
        var el = items[state.active];
        if (el && el.getAttribute('aria-disabled') !== 'true') commit(state, state.active);
        break;
      default:
        /* 打字跳選：1 秒內連打累積成字串，比對選項開頭——原生 select 有這個行為，
           換掉清單之後不補回來，鍵盤使用者會覺得下拉「變笨了」。 */
        if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
        var now = Date.now();
        state.typed = (now - state.typedAt < 1000 ? state.typed : '') + e.key.toLowerCase();
        state.typedAt = now;
        for (var i = 0; i < state.opts.length; i++) {
          if (state.opts[i].textContent.trim().toLowerCase().indexOf(state.typed) === 0) {
            setActive(state, i, true);
            break;
          }
        }
    }
  }

  /* ── 掛載 ─────────────────────────────────────────────── */

  function mount(root) {
    (root || document).querySelectorAll('select.select').forEach(enhance);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
  /* 晚生成的 select（元件渲染、彈窗內容）也要接手 */
  window.addEventListener('load', function () { mount(); });

  window.ztorSelect = { mount: mount, close: function () { close(open); } };
})();
