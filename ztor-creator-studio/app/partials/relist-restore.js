/* relist-restore.js — 重新上架時檢查下架時保存的排程（spec 0-設計規格書 §7.14「重新上架時檢查保存的排程」· D488，2026-10-29；
   取代 D481〔2026-10-27〕的「詢問是否恢復排程」）
   規格：下架時四個排程時間保存但暫停（ListingState.unlist → entity.paused）。創作者按「上架」時系統檢查保存的開賣、停售、
     定時下架三種時間（拍賣：開拍、定時下架；上架時間一律不查）：
       有任何一個已過、或沒通過既有的時間檢查 → 不讓上架，提示一次列出有問題的時間（哪一種、日期與時間、原因），請創作者先去改；不改任何資料。
       都沒問題（或沒設這些時間）            → 直接上架並恢復排程，不跳確認、不詢問（呼叫 ListingState.relist）。
     組合包連帶上架成員時只檢查組合包自己（D488 決定 6）；活動 D448 彈窗裡的組合包各自檢查（D488 決定 7），
     成員有已下架單品的組合包另外提示（D489，memberBlockHTML）。
   為什麼有這支：同一個檢查有六個入口——商品細節頁、組合商品細節頁、拍賣細節頁（頁首「上架」與上架開關）、電子商店清單三類列的「上架」、
     組合包上架的成員閘門（partials/bundle-relist.js）、活動詳情重新上架的 D448 彈窗；媒體庫庫房的重新上架對話框也用同一段提示。
     列時間、分組、原因只寫這一份。
   純 vanilla，只依賴 window.ListingState。樣式：ds-components/sched-restore.css（內容區塊）＋ leave-dialog.css（block() 的殼）。

   用法：
     const plan = ZtorRelistRestore.plan([{ entity, name, check }]);   // check(key, iso, entity) → 不通過的原因字串，或 null（可省略）
     if (!plan.any) { ListingState.relist(entity); … }                  // 沒有問題：直接上架、恢復
     else ZtorRelistRestore.block({ title, plan, auction, T, onClose })  // 擋下：自帶 leave-dialog 殼，只有「知道了」
     // 或在別的殼裡：body += ZtorRelistRestore.blockHTML(plan, { auction, T, label })
     // D489：body += ZtorRelistRestore.memberBlockHTML([{ name, members:[名稱] }], { T })
   墓碑（2026-10-29 · D488）：ask()（恢復／不恢復兩選一的確認）、bindChoice()、skipOf() 退場——沒有「不恢復」這個選項了。
   consumer：product-detail.html、bundle-detail.html、auction-detail.html、e-shop.html、event-detail.html、partials/bundle-relist.js、
     media-vault.html（媒體庫沒有 ListingState，由 js/media-vault.js 用 VaultStore.relistBlockers 自己組 plan，只用 blockHTML）。 */
(function () {
  'use strict';

  function tr(T, k, fb) {
    if (typeof T === 'function') { var v = T(k, fb); if (v && v !== k) return v; }
    return (window.i18nT ? window.i18nT(k) : null) || fb;
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* 日期與時間：本地 YYYY/MM/DD HH:mm（與站上其他時間讀數同一個樣子） */
  function fmt(v) {
    var d = new Date(String(v).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(v || '');
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /**
   * entries：[{ entity, name, check? }]。回 { groups:[{ entity, name, items:[{ key, at, end?, passed, reason }] }], any }
   * any＝至少有一個有問題的時間（＝這次不讓上架）。只列有問題的實體。
   */
  function plan(entries) {
    var LS = window.ListingState, groups = [];
    (entries || []).forEach(function (en) {
      if (!LS || !en || !en.entity) return;
      var items = LS.relistBlockers(en.entity, undefined, en.check);
      if (items.length) groups.push({ entity: en.entity, name: en.name || en.entity.name || '', items: items });
    });
    return { groups: groups, any: groups.length > 0 };
  }

  function whatOf(it, auction, T) {
    if (it.key === 'unlistAt') return tr(T, 'rr.k.unlistAt', 'Unlist time');
    if (it.key === 'saleEnd') return tr(T, 'rr.k.saleEnd', 'Sale end');
    return auction ? tr(T, 'rr.k.auctionStart', 'Auction start') : tr(T, 'rr.k.saleStart', 'Sale start');
  }

  /** 有問題的時間（sched-restore.css）。opts：{ auction, T, label?, named? }——label＝段落小標（省略＝「要先改的時間」）；
      named＝只有一組也顯示名稱（活動 D448 彈窗：要看得出是哪一個組合包）。 */
  function blockHTML(p, opts) {
    var o = opts || {}, T = o.T, groups = (p && p.groups) || [], multi = groups.length > 1 || !!o.named, h = '';
    h += '<div class="sched-restore" data-sched-restore>';
    h += '<p class="sched-restore__label">' + esc(o.label || tr(T, 'rr.times', 'Times to fix')) + '</p>';
    groups.forEach(function (g) {
      if (multi) h += '<p class="sched-restore__group">' + esc(g.name) + '</p>';
      h += '<ul class="sched-restore__list">' + g.items.map(function (it) {
        var when = fmt(it.at) + (it.end ? ' · ' + tr(T, 'rr.k.auctionEnd', 'ends {t}').replace('{t}', fmt(it.end)) : '');
        var note = it.passed ? tr(T, 'rr.why.passed', 'This time has passed') : it.reason;
        return '<li class="sched-restore__item" data-rr-key="' + esc(it.key) + '">' +
          '<i data-lucide="clock" class="ztor-icon"></i><span class="sched-restore__text">' +
          '<span class="sched-restore__what">' + esc(whatOf(it, o.auction || (g.entity && g.entity.duration !== undefined), T)) + '</span>' +
          '<span class="sched-restore__when">' + esc(when) + '</span>' +
          (note ? '<span class="sched-restore__note">' + esc(note) + '</span>' : '') +
          '</span></li>';
      }).join('') + '</ul>';
    });
    h += '</div>';
    return h;
  }

  /**
   * D489：成員有已下架單品、不能跟活動一起上架的組合包。list：[{ name, members:[名稱] }]；opts：{ T, label? }。
   * 同一個元件的另一種內容：組合包名稱當分組、已下架的成員單品一列一個。
   */
  function memberBlockHTML(list, opts) {
    var o = opts || {}, T = o.T, h = '';
    if (!list || !list.length) return '';
    h += '<div class="sched-restore" data-sched-members>';
    h += '<p class="sched-restore__label">' + esc(o.label || tr(T, 'rr.members.label', 'Unlisted items')) + '</p>';
    list.forEach(function (g) {
      h += '<p class="sched-restore__group">' + esc(g.name) + '</p>';
      h += '<ul class="sched-restore__list">' + (g.members || []).map(function (n) {
        return '<li class="sched-restore__item"><i data-lucide="package" class="ztor-icon"></i><span class="sched-restore__text">' +
          '<span class="sched-restore__when">' + esc(n) + '</span>' +
          '<span class="sched-restore__what">' + esc(tr(T, 'rr.members.state', 'Unlisted')) + '</span></span></li>';
      }).join('') + '</ul>';
    });
    h += '</div>';
    return h;
  }

  /* ── 自帶的提示殼（leave-dialog）：商品／組合包／拍賣細節頁與電子商店清單共用；只注入一次 ── */
  var dlg = null, pending = null;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('div');
    dlg.className = 'leave-dialog';
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'rr-dialog-title');
    dlg.setAttribute('data-rr-dialog', '');
    dlg.innerHTML =
      '<div class="leave-dialog__scrim" data-rr-close></div>' +
      '<div class="leave-dialog__card">' +
        '<button class="leave-dialog__close" type="button" data-rr-close aria-label="Close"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '<h2 class="leave-dialog__title" id="rr-dialog-title" data-rr-title></h2>' +
        '<p class="leave-dialog__body" data-rr-body></p>' +
        '<div data-rr-slot></div>' +
        '<div class="leave-dialog__actions">' +
          '<button class="btn btn--primary" type="button" data-rr-close data-rr-ok></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) { if (e.target.closest('[data-rr-close]')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pending) close(); });
    return dlg;
  }
  function close() {
    var p = pending; pending = null;
    if (dlg) dlg.removeAttribute('data-open');
    if (p && typeof p.onClose === 'function') p.onClose();
  }

  /**
   * 擋下提示：opts：{ title, plan, auction, T, body?, onClose? }。純告知，只有一顆「知道了」，什麼都不改（D488 決定 3.1）。
   * onClose：關掉時呼叫（上架開關要畫回關）。
   */
  function block(opts) {
    var o = opts || {}, T = o.T, d = ensureDialog();
    d.querySelector('[data-rr-title]').textContent = o.title || '';
    d.querySelector('[data-rr-body]').textContent = o.body || tr(T, 'rr.body', 'Some saved times have passed or can’t be used. Change them to a future time or clear them, then list it again.');
    d.querySelector('[data-rr-slot]').innerHTML = blockHTML(o.plan, { auction: o.auction, T: T });
    var ok = d.querySelector('[data-rr-ok]');
    ok.textContent = tr(T, 'rr.ok', 'Got it');
    d.querySelector('.leave-dialog__close').setAttribute('aria-label', tr(T, 'rr.close', 'Close'));
    pending = { onClose: o.onClose };
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(d);
    d.setAttribute('data-open', '');
    ok.focus();
  }

  window.ZtorRelistRestore = { plan: plan, blockHTML: blockHTML, memberBlockHTML: memberBlockHTML, block: block, fmt: fmt };
})();
