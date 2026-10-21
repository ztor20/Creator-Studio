/* ============================================================
   lock-alloc.js · 組合包「指定鎖定項目」清單（共用 vanilla JS 元件；2026-10-21 由三處抽出）
   ------------------------------------------------------------
   規格：5.1.5.4 §4 F4（鎖定套數）、D266（修訂 D255／D258）、D268（逐選項組合列的縮圖）；主規格 §7.14。
   視覺元件：ds-components/lock-sets.css（.lockset 清單、.lockset__row 列、.lockset__child 選項組合列）。

   規則（三處同一套，純電子商店組合包與含票券的組合包沒有差別）：
     · 單一選項成員  已鎖定＝N × 每套用量，系統算、唯讀
     · 多選項成員    已鎖定同上（唯讀）；另可展開「逐選項組合」選填分配——指定哪些選項組合各鎖幾件：
                     每格不得大於該組合當下沒被鎖定的量（含本組合已鎖的），各格合計不得超過該成員的已鎖定量；
                     少分配＝只限總數、選項組合不拘
     · 數字一律問 window.ListingState（bundleMemberLock／bundleAllocOf／freeQty／variantFree…），這裡不另算

   消費者（markup 屬性前綴 prefix 不同，其餘一致）：
     · create-bundle.html            prefix 'cb'   建立組合的「數量」卡
     · bundle-detail.html            prefix 'bd'   組合細節的「組合庫存」分頁
     · js/bundle-editor.js（SPLIT）  prefix 'sp'   建立活動第 6 步組合包彈窗的「數量」段（只畫多選項成員，見 o.multiOnly）
   三處原本各抄一份 renderAlloc／refreshAlloc 的列迴圈；抽成這支之後，改規則只改一處。

   資料形狀（同 ListingState）：
     bundle   { id, lockSets, alloc: { <成員 id>: { <選項組合索引>: 件數|null } }, members: [{ productId, qty }] }
     product  { id, name, variant, variants:[{ combo, stock, locks }], pool:{ total, locks } … }（單一選項商品只需 pool）

   對外 API（window.ZtorLockAlloc）
     render(host, o)    重建清單的列（只在成員清單變動時呼叫；打字走 refresh，輸入框才不會被重建）
       o.prefix        'cb'｜'bd'｜'sp'
       o.members       成員陣列（物件要有 productId）
       o.productOf(m)  → 商品物件｜undefined
       o.nameCell(m,p,multi) → 名稱格 HTML（頁面各自決定連結與標籤）
       o.alloc         { <成員 id>: { <索引>: 件數 } } 用來回填輸入框
       o.multiOnly     true＝只畫多選項成員（SPLIT：單一選項成員的已鎖定量沒有可填的東西）
       o.skipMissing   true＝找不到商品的成員不畫（預設畫成 0 件的列）
     refresh(host, o)   更新數字、錯誤態；回傳 { anyBad }
       o.bundle        上面的 bundle 形狀
       o.setQty        選填，(el, n) 寫庫存數字；預設不限量掛 data-i18n
       o.T             翻譯函式 (key, fallback)
       o.disabled(locked) 選填，回傳該成員的輸入框要不要停用；預設＝未鎖定時停用
   ============================================================ */
(function () {
  'use strict';
  if (window.ZtorLockAlloc) return;

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var isMulti = function (p) { return !!(p && p.variant === 'multiple' && (p.variants || []).length); };
  var Tfb = function (T, k, fb) { var v = T ? T(k, fb) : null; return (v == null || v === k) ? (fb || k) : v; };

  /* 不限量掛 data-i18n，切語言時由 applyI18n 自己接手；其餘寫數字 */
  function defaultSetQty(el, n, T) {
    if (!el) return;
    if (n === Infinity) { el.setAttribute('data-i18n', 'cb.stock.unlimited'); el.textContent = Tfb(T, 'cb.stock.unlimited', 'Unlimited'); }
    else { el.removeAttribute('data-i18n'); el.textContent = String(n); }
  }

  function render(host, o) {
    if (!host) return;
    var P = o.prefix, at = function (n) { return 'data-' + P + '-' + n; };
    [].slice.call(host.querySelectorAll('[' + at('alloc-row') + '], [' + at('alloc-group') + ']')).forEach(function (r) { r.remove(); });
    (o.members || []).forEach(function (m) {
      var p = o.productOf(m);
      if (!p && o.skipMissing) return;
      var multi = isMulti(p);
      if (o.multiOnly && !multi) return;
      var gid = 'alloc-' + P + '-' + m.productId;
      var row = document.createElement('div');
      row.className = 'lockset__row' + (multi ? ' lockset__row--sub rowdis__head' : '');
      row.setAttribute(at('alloc-row'), m.productId);
      row.innerHTML = o.nameCell(m, p, multi)
        + '<span class="lockset__num" ' + at('stock') + '></span>'
        + '<span class="lockset__num" ' + at('free') + '></span>'
        + '<span ' + at('lockcell') + '></span>'
        + (multi
          ? '<span class="lockset__end"><button class="btn btn--icon btn--xs rowdis__toggle" type="button" data-rowdis="' + esc(gid) + '" aria-expanded="false" aria-label="Show options" data-i18n-aria-label="bd.lock.expand"><i data-lucide="chevron-down" class="ztor-icon"></i></button></span>'
          : '<span></span>');
      if (!multi) { host.appendChild(row); return; }
      var group = document.createElement('div');
      group.className = 'rowdis__group rowdis__group--gutter';
      group.setAttribute(at('alloc-group'), m.productId);
      group.appendChild(row);
      group.insertAdjacentHTML('beforeend', p.variants.map(function (v, vi) {
        var label = (v.combo || []).join(' / ');
        /* 列首唯讀縮圖（D268）：這個組合自己的圖（實線）或沿用商品主圖（虛線），只看不改 */
        var thumb = (window.ProductsStore && window.ProductsStore.variantThumb) ? window.ProductsStore.variantThumb(p, v, { label: label }) : '';
        return '<div class="lockset__row lockset__child" data-rowdis-child="' + esc(gid) + '" hidden ' + at('alloc-child') + '="' + esc(m.productId) + '" ' + at('vi') + '="' + vi + '">'
          + '<span class="lockset__name">' + thumb + '<span>' + esc(label) + '</span></span>'
          + '<span class="lockset__num" ' + at('stock') + '></span>'
          + '<span class="lockset__num" ' + at('free') + '></span>'
          + '<span><span class="amount-field amount-field--suffix amount-field--readonly"><input class="input amount-field__input" inputmode="numeric" placeholder="0" ' + at('alloc-input') + ' ' + at('vi') + '="' + vi + '" data-i18n-aria-label="stock.lock" aria-label="Locked"><span class="amount-field__unit" data-i18n="stock.unit-pcs">pcs</span></span></span>'
          + '<span></span></div>';
      }).join(''));
      host.appendChild(group);
      var a = (o.alloc || {})[m.productId] || {};
      [].slice.call(group.querySelectorAll('[' + at('alloc-input') + ']')).forEach(function (inp) {
        var q = a[Number(inp.getAttribute(at('vi')))];
        inp.value = (q === null || q === undefined || q === '') ? '' : String(q);
      });
    });
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    if (window.applyI18n) window.applyI18n(host);
    if (window.rowDisclosure && window.rowDisclosure.sync) window.rowDisclosure.sync(host);
  }

  function refresh(host, o) {
    var LS = window.ListingState, anyBad = false;
    if (!host || !LS) return { anyBad: false };
    var P = o.prefix, at = function (n) { return 'data-' + P + '-' + n; }, T = o.T;
    var setQty = o.setQty || function (el, n) { defaultSetQty(el, n, T); };
    var b = o.bundle;
    (b.members || []).forEach(function (m) {
      var p = o.productOf(m);
      var row = host.querySelector('[' + at('alloc-row') + '="' + m.productId + '"]');
      if (!row) return;
      var multi = isMulti(p);
      var stock = !p ? 0 : (multi ? LS.variantsTotal(p.variants) : ((p.pool && p.pool.total === 'unlimited') ? Infinity : Number(p.pool && p.pool.total) || 0));
      var free = !p ? 0 : LS.freeQty(p);
      var locked = LS.bundleMemberLock(b, m);
      var per = LS.memberPer(m);
      setQty(row.querySelector('[' + at('stock') + ']'), stock);
      setQty(row.querySelector('[' + at('free') + ']'), free);
      var cell = row.querySelector('[' + at('lockcell') + ']');
      if (cell) {
        if (locked === null) {
          cell.innerHTML = '<span class="lockset__nolock" data-i18n="bd.lock.shared">' + esc(Tfb(T, 'bd.lock.shared', 'Not locked')) + '</span>';
        } else {
          var al0 = multi ? LS.bundleAllocOf(b, m, p) : null;
          if (al0 && al0.over) anyBad = true;
          var sub = !multi ? '' : (al0.over ? Tfb(T, 'bd.lock.over', 'Exceeds locked qty') : (al0.assigned ? Tfb(T, 'bd.lock.assigned', '{n} pcs pinned').replace('{n}', al0.assigned) : ''));
          cell.innerHTML = '<span class="lockset__lockval"><span class="lockset__lockval-row"><span>' + locked
            + (per > 1 ? '<span class="lockset__per">' + Tfb(T, 'bd.lock.per', '{n} per set').replace('{n}', per) + '</span>' : '')
            + '</span><span data-i18n="stock.unit-pcs">' + Tfb(T, 'stock.unit-pcs', 'pcs') + '</span></span>'
            + (multi ? '<span class="lockset__sub lockset__lockval-sub' + (al0.over ? ' is-over' : '') + '">' + esc(sub) + '</span>' : '')
            + '</span>';
        }
      }
      if (!multi) return;
      var al = LS.bundleAllocOf(b, m, p);
      al.rows.forEach(function (r) {
        if (r.bad) anyBad = true;
        var child = host.querySelector('[' + at('alloc-child') + '="' + m.productId + '"][' + at('vi') + '="' + r.vi + '"]');
        if (!child) return;
        var v = p.variants[r.vi];
        setQty(child.querySelector('[' + at('stock') + ']'), Number(v.stock) || 0);
        setQty(child.querySelector('[' + at('free') + ']'), LS.variantFree(v));
        var inp = child.querySelector('[' + at('alloc-input') + ']');
        if (inp) {
          inp.disabled = o.disabled ? !!o.disabled(locked) : locked === null;
          if (r.bad) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
        }
      });
    });
    return { anyBad: anyBad };
  }

  window.ZtorLockAlloc = { render: render, refresh: refresh, isMulti: isMulti, esc: esc };
})();
