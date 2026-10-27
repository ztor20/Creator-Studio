/* relist-restore.js — 重新上架時詢問是否恢復下架時保存的排程（spec 0-設計規格書 §7.14「重新上架時詢問是否恢復排程」· D481，2026-10-27）
   規格：下架時四個排程時間保存但暫停（ListingState.unlist → entity.paused）。創作者按「上架」時跳出確認，列出還沒過的時間，
     選「恢復原本的排程」或「不恢復」；已過的不列；沒有任何還沒過的時間就不跳確認、直接上架。
     〔推導〕恢復照既有時間檢查，不通過的不恢復、在確認裡寫原因；組合包連帶上架的成員、活動 D448 彈窗裡的組合包都套用同一個選擇。
   為什麼有這支：同一個問題有六個入口——商品細節頁、組合商品細節頁、拍賣細節頁（頁首「上架」與上架開關）、電子商店清單三類列的「上架」、
     組合包上架的成員閘門（partials/bundle-relist.js）、活動詳情重新上架的 D448 彈窗。列時間、分組、檢查、兩個選項只寫這一份。
   純 vanilla，只依賴 window.ListingState。樣式：ds-components/sched-restore.css（內容區塊）＋ leave-dialog.css（ask() 的殼）＋ radio-list.css（兩個選項）。

   用法：
     const plan = ZtorRelistRestore.plan([{ entity, name, check }]);   // check(key, iso) → 不通過的原因字串，或 null（可省略）
     if (!plan.any) { 直接上架 }
     ZtorRelistRestore.ask({ title, plan, members, auction, T, onChoose: restore => …, onCancel })   // 自帶 leave-dialog 殼
     // 或在別的殼裡：body += ZtorRelistRestore.blockHTML(plan, { members, auction, T }); 再 ZtorRelistRestore.bindChoice(root, restore => …)
     ZtorRelistRestore.skipOf(plan)(entity) → { key:true }：交給 ListingState.relist／relistBundle 的 skip／skipOf
   consumer：product-detail.html、bundle-detail.html、auction-detail.html、e-shop.html、event-detail.html、partials/bundle-relist.js。 */
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
   * entries：[{ entity, name, check? }]。回 { groups:[{ entity, name, items:[{ key, at, end?, reason }] }], any, all }
   * any＝至少有一個還沒過的時間（決定要不要跳確認）。check 只在列得出來的時間上跑。
   */
  function plan(entries) {
    var LS = window.ListingState, groups = [];
    (entries || []).forEach(function (en) {
      if (!LS || !en || !en.entity) return;
      var items = LS.restorableTimes(en.entity).map(function (it) {
        var why = (typeof en.check === 'function') ? en.check(it.key, it.at, en.entity) : null;
        return { key: it.key, at: it.at, end: it.end || null, reason: why || null };
      });
      if (items.length) groups.push({ entity: en.entity, name: en.name || en.entity.name || '', items: items });
    });
    return { groups: groups, any: groups.length > 0 };
  }

  /** 交給 ListingState 的 skip：不通過檢查、不恢復的時間。 */
  function skipOf(p) {
    return function (entity) {
      var g = ((p && p.groups) || []).filter(function (x) { return x.entity === entity; })[0];
      if (!g) return null;
      var s = {}, any = false;
      g.items.forEach(function (it) { if (it.reason) { s[it.key] = true; any = true; } });
      return any ? s : null;
    };
  }

  function whatOf(it, auction, T) {
    if (it.key === 'unlistAt') return tr(T, 'rr.k.unlistAt', 'Unlist time');
    if (it.key === 'saleEnd') return tr(T, 'rr.k.saleEnd', 'Sale end');
    return auction ? tr(T, 'rr.k.auctionStart', 'Auction start') : tr(T, 'rr.k.saleStart', 'Sale start');
  }

  /** 內容區塊（sched-restore.css）。opts：{ members:[名稱], auction, T }。 */
  function blockHTML(p, opts) {
    var o = opts || {}, T = o.T, groups = (p && p.groups) || [], multi = groups.length > 1, h = '';
    h += '<div class="sched-restore" data-sched-restore>';
    if (o.members && o.members.length) {
      h += '<p class="sched-restore__label">' + esc(tr(T, 'rr.members', 'Listed with it')) + '</p>';
      h += '<ul class="sched-restore__list">' + o.members.map(function (n) {
        return '<li class="sched-restore__item"><i data-lucide="package" class="ztor-icon"></i><span class="sched-restore__text">' + esc(n) + '</span></li>';
      }).join('') + '</ul>';
    }
    h += '<p class="sched-restore__label">' + esc(tr(T, 'rr.times', 'Paused schedules')) + '</p>';
    groups.forEach(function (g) {
      if (multi) h += '<p class="sched-restore__group">' + esc(g.name) + '</p>';
      h += '<ul class="sched-restore__list">' + g.items.map(function (it) {
        var when = fmt(it.at) + (it.end ? ' · ' + tr(T, 'rr.k.auctionEnd', 'ends {t}').replace('{t}', fmt(it.end)) : '');
        return '<li class="sched-restore__item' + (it.reason ? ' sched-restore__item--skip' : '') + '" data-rr-key="' + esc(it.key) + '">' +
          '<i data-lucide="clock" class="ztor-icon"></i><span class="sched-restore__text">' +
          '<span class="sched-restore__what">' + esc(whatOf(it, o.auction || (g.entity && g.entity.duration !== undefined), T)) + '</span>' +
          '<span class="sched-restore__when">' + esc(when) + '</span>' +
          (it.reason ? '<span class="sched-restore__note">' + esc(tr(T, 'rr.skip', 'Won’t be restored: {why}').replace('{why}', it.reason)) + '</span>' : '') +
          '</span></li>';
      }).join('') + '</ul>';
    });
    var keepSub = o.auction ? tr(T, 'rr.keep.sub.auction', 'It goes back listed but not started — set the auction start again.')
                            : tr(T, 'rr.keep.sub', 'It goes back listed but not on sale — set the sale start again.');
    h += '<div class="radio-list sched-restore__choice" role="radiogroup" aria-label="' + esc(tr(T, 'rr.times', 'Paused schedules')) + '">' +
      '<button type="button" class="radio-list__item" role="radio" aria-checked="false" data-rr-choice="restore"><span class="radio-list__dot"></span>' +
        '<span class="radio-list__text"><span class="radio-list__title">' + esc(tr(T, 'rr.restore', 'Restore the original schedule')) + '</span>' +
        '<span class="radio-list__sub">' + esc(tr(T, 'rr.restore.sub', 'Each time takes effect when it comes.')) + '</span></span></button>' +
      '<button type="button" class="radio-list__item" role="radio" aria-checked="false" data-rr-choice="keep"><span class="radio-list__dot"></span>' +
        '<span class="radio-list__text"><span class="radio-list__title">' + esc(tr(T, 'rr.keep', 'Don’t restore')) + '</span>' +
        '<span class="radio-list__sub">' + esc(keepSub) + '</span></span></button>' +
      '</div></div>';
    return h;
  }

  /** 兩個選項的接線：點一列＝選它（radio-list 的 --active），onChange(restore:boolean)。回 () => 目前的選擇（未選＝null）。 */
  function bindChoice(root, onChange) {
    var box = root && root.querySelector('[data-sched-restore] .sched-restore__choice');
    var cur = null;
    if (!box) return function () { return cur; };
    box.addEventListener('click', function (e) {
      var item = e.target.closest('[data-rr-choice]');
      if (!item) return;
      box.querySelectorAll('[data-rr-choice]').forEach(function (b) {
        var on = b === item;
        b.classList.toggle('radio-list__item--active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      cur = item.getAttribute('data-rr-choice') === 'restore';
      if (typeof onChange === 'function') onChange(cur);
    });
    return function () { return cur; };
  }

  /* ── 自帶的確認殼（leave-dialog）：商品／組合包／拍賣細節頁與電子商店清單共用；只注入一次 ── */
  var dlg = null, pending = null;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('div');
    dlg.className = 'leave-dialog';
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'rr-dialog-title');
    dlg.setAttribute('data-rr-dialog', '');
    dlg.innerHTML =
      '<div class="leave-dialog__scrim" data-rr-cancel></div>' +
      '<div class="leave-dialog__card">' +
        '<button class="leave-dialog__close" type="button" data-rr-cancel aria-label="Close"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '<h2 class="leave-dialog__title" id="rr-dialog-title" data-rr-title></h2>' +
        '<p class="leave-dialog__body" data-rr-body></p>' +
        '<div data-rr-slot></div>' +
        '<div class="leave-dialog__actions">' +
          '<button class="btn btn--primary" type="button" data-rr-ok disabled aria-disabled="true"></button>' +
          '<button class="btn btn--outline" type="button" data-rr-cancel></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-rr-ok]')) {
        var p = pending; if (!p || p.choice === null) return;
        close(); if (typeof p.onChoose === 'function') p.onChoose(p.choice);
        return;
      }
      if (e.target.closest('[data-rr-cancel]')) cancel();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pending) cancel(); });
    return dlg;
  }
  function close() { pending = null; if (dlg) dlg.removeAttribute('data-open'); }
  function cancel() { var p = pending; close(); if (p && typeof p.onCancel === 'function') p.onCancel(); }

  /**
   * opts：{ title, plan, members, auction, T, okLabel?, onChoose(restore), onCancel? }
   * 一定要選一個選項，「上架」才可按（使用者原話要避免「沒檢查突然開賣」：恢復須創作者在確認時選，D481）。
   */
  function ask(opts) {
    var o = opts || {}, T = o.T, d = ensureDialog();
    d.querySelector('[data-rr-title]').textContent = o.title || '';
    d.querySelector('[data-rr-body]').textContent = tr(T, 'rr.body', 'These schedules were paused when it was unlisted and haven’t come yet.');
    var slot = d.querySelector('[data-rr-slot]');
    slot.innerHTML = blockHTML(o.plan, { members: o.members, auction: o.auction, T: T });
    var ok = d.querySelector('[data-rr-ok]');
    ok.textContent = o.okLabel || ((o.members && o.members.length) ? tr(T, 'rr.ok.all', 'List all') : tr(T, 'rr.ok', 'List'));
    ok.disabled = true; ok.setAttribute('aria-disabled', 'true');
    d.querySelector('.leave-dialog__actions [data-rr-cancel]').textContent = tr(T, 'rr.cancel', 'Cancel');
    d.querySelector('.leave-dialog__close').setAttribute('aria-label', tr(T, 'rr.cancel', 'Cancel'));
    pending = { onChoose: o.onChoose, onCancel: o.onCancel, choice: null };
    bindChoice(slot, function (restore) {
      if (!pending) return;
      pending.choice = restore;
      ok.disabled = false; ok.removeAttribute('aria-disabled');
    });
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(d);
    d.setAttribute('data-open', '');
    var first = slot.querySelector('[data-rr-choice]'); if (first) first.focus();
  }

  window.ZtorRelistRestore = { plan: plan, skipOf: skipOf, blockHTML: blockHTML, bindChoice: bindChoice, ask: ask, fmt: fmt };
})();
