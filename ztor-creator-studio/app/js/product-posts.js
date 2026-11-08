/* product-posts.js — 商品細節頁「貼文」分頁（spec 5.1.5.1 §2.21、5.1.5.7「發布後的編輯與管理」· D520 · S144）
   相關貼文＝新品貼文撰寫面板發出、綁定這件商品的貼文（群發訊息等其他來源之後再加）。
   這支負責三件事：
     1. 示範資料：每件商品一份貼文清單，存 sessionStorage（重新整理保留、關分頁就回到示範初值）；
        沒帶 ?id 的預設樣本帶三篇（已發送／已排程／發送失敗），帶 ?id 的商品從空的開始，看得到空狀態。
     2. 清單：一篇一列，沿用群發訊息歷史的列（.msg-history--post，message-modal.css）。
     3. 撰寫面板：掛 partials/product-post-modal.js 那一份（與 e-shop 建立後彈窗同一份 markup），
        依模式切換——發新貼文／編輯已排程（全部可改）／編輯已發送（只改標題與內文、顯示不再通知的說明）。
   已封存（.main[data-archived]）整個分頁唯讀：發新貼文與每列動作都收起。
   consumer：product-detail.html。 */
(function () {
  'use strict';

  var KEY = 'ztor.productPosts';
  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var HOUR = 3600e3, DAY = 24 * HOUR;

  /* 受眾 → 標籤字與徽章色（同 fans-crm.html 群發訊息歷史） */
  var AUD = {
    all:       { k: 'msg.to.all.tag',       fb: 'All fans',     badge: 'neutral' },
    inner:     { k: 'msg.to.inner.tag',     fb: 'Inner Circle', badge: 'orange' },
    super:     { k: 'msg.to.super.tag',     fb: 'Super Fans',   badge: 'info' },
    devoted:   { k: 'msg.to.devoted.tag',   fb: 'Ranked Fans',  badge: 'success' },
    fan:       { k: 'msg.to.fan.tag',       fb: 'Fan',          badge: 'neutral' },
    risk:      { k: 'msg.to.risk.tag',      fb: 'At risk',      badge: 'error' },
    recovered: { k: 'msg.to.recovered.tag', fb: 'Recovered',    badge: 'neutral' }
  };
  var STATUS = {
    sent:      { k: 'msg.status.sent',      fb: 'Sent',      badge: 'success' },
    scheduled: { k: 'msg.status.scheduled', fb: 'Scheduled', badge: 'info' },
    failed:    { k: 'msg.status.failed',    fb: 'Failed',    badge: 'error' }
  };

  function seedFor(isSample) {
    if (!isSample) return [];
    var now = Date.now();
    return [
      { id: 'p3', status: 'scheduled', at: now + 2 * DAY, aud: 'super', edited: false,
        title: 'Signed copies drop this Friday', body: 'Hi {{first_name}} — 50 signed copies of vol. 02 go on sale Friday at noon. Set a reminder!' },
      { id: 'p2', status: 'failed', at: now - 2 * DAY, aud: 'inner', edited: false,
        title: 'Behind the zine — studio photos', body: 'A few photos from the print run, just for you.' },
      { id: 'p1', status: 'sent', at: now - 5 * DAY, aud: 'all', edited: true,
        title: 'Pirate Queen zine vol. 02 is here', body: 'Vol. 02 is out now — 48 pages, risograph printed. Grab yours before it sells out.' }
    ];
  }

  var all = {};
  try { all = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { all = {}; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {} }
  function listOf(pid, isSample) {
    if (!all[pid]) { all[pid] = seedFor(isSample); save(); }
    return all[pid];
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ts) { var d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function toast(k, fb) { if (window.ztorToast) window.ztorToast.show(T(k, fb)); }

  function init() {
    var root = document.querySelector('[data-pd-posts]');
    if (!root) return;
    var main = document.querySelector('.main') || document.body;
    var listEl = root.querySelector('[data-pd-posts-list]');
    var tableEl = root.querySelector('[data-pd-posts-table]');
    var emptyEl = root.querySelector('[data-pd-posts-empty]');
    var newBtn = root.querySelector('[data-pd-post-new]');
    var qid = new URLSearchParams(location.search).get('id');
    var pid = qid || (window.pdProduct && window.pdProduct.id) || 'sample';
    var isSample = !qid;
    var archived = function () { return main.hasAttribute('data-archived'); };

    function render() {
      var posts = listOf(pid, isSample).slice().sort(function (a, b) { return b.at - a.at; });
      var ro = archived();
      if (newBtn) newBtn.hidden = ro;
      tableEl.hidden = !posts.length;
      emptyEl.hidden = !!posts.length;
      listEl.innerHTML = posts.map(function (p) {
        var a = AUD[p.aud] || AUD.all, st = STATUS[p.status];
        var acts = '';
        if (!ro && p.status !== 'failed') acts += '<button class="btn btn--outline btn--sm" type="button" data-pp-edit="' + p.id + '">' + esc(T('pd.posts.edit', 'Edit')) + '</button>';
        if (!ro && p.status === 'scheduled') acts += '<button class="btn btn--ghost btn--sm" type="button" data-pp-cancel="' + p.id + '">' + esc(T('pd.posts.cancel-sched', 'Cancel schedule')) + '</button>';
        var fail = p.status === 'failed'
          ? '<div class="msg-row__fail"><i data-lucide="alert-triangle" class="ztor-icon"></i><span>' + esc(T('msg.fail.reason', 'Delivery provider timed out')) + '</span>'
            + (ro ? '' : '<button class="btn btn--outline btn--sm msg-row__retry" type="button" data-pp-retry="' + p.id + '">' + esc(T('msg.retry', 'Retry')) + '</button>') + '</div>'
          : '';
        return '<div class="data-list__row msg-row">'
          + '<span class="msg-row__time">' + fmt(p.at) + '</span>'
          + '<span class="msg-row__subject"><span class="msg-row__subject-text">' + esc(p.title) + '</span>' + (p.edited ? '<span class="msg-row__edited">' + esc(T('pd.posts.edited', 'Edited')) + '</span>' : '') + '</span>'
          + '<span class="msg-row__audience"><span class="badge badge--' + a.badge + '">' + esc(T(a.k, a.fb)) + '</span></span>'
          + '<span class="msg-row__status"><span class="badge badge--' + st.badge + '">' + esc(T(st.k, st.fb)) + '</span></span>'
          + '<span class="msg-row__actions">' + acts + '</span>'
          + fail + '</div>';
      }).join('');
      if (window.ztorIcons) window.ztorIcons.applyIcons(listEl);
    }

    /* ---- 撰寫面板 ---- */
    var host = document.querySelector('[data-pd-post-host]');
    var m = null, last = null, editing = null, sched = false;
    var q = function (sel) { return m.querySelector(sel); };

    function wireCount(input, el, max) {
      var upd = function () { var n = input.value.length; el.textContent = n + ' / ' + max; el.classList.toggle('is-over', n >= max); };
      input.addEventListener('input', upd); upd();
    }
    function setSched(on) {
      sched = on;
      var sw = q('[data-npp-sched]');
      sw.classList.toggle('switch--on', on);
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      q('[data-npp-when]').hidden = !on;
      syncPrimary();
    }
    function syncPrimary() {
      var pub = q('[data-npp-publish]');
      var key = editing ? 'product-detail.btn.save-changes' : (sched ? 'npp.schedule' : 'npp.publish');
      pub.setAttribute('data-i18n', key);
      pub.textContent = T(key, editing ? 'Save' : (sched ? 'Schedule post' : 'Publish post'));
      var ok = q('[data-npp-title]').value.trim() && q('[data-npp-body]').value.trim();
      if (ok && sched && (!editing || editing.status === 'scheduled')) ok = !!(q('[data-npp-date]').value && q('[data-npp-time]').value);
      pub.disabled = !ok;
    }
    function ensure() {
      if (m) return true;
      var html = window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.productPostModal;
      if (!html || !host) return false;
      host.innerHTML = html;
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
      if (window.applyI18n) window.applyI18n(host);
      m = host.querySelector('[data-npp-modal]');
      /* 細節頁裡：不顯示「商品已上架」導言、「剛上架」徽章與「查看商品」連結（人就在這件商品上） */
      q('[data-npp-intro]').hidden = true;
      var badge = q('.npp-product__meta .badge'); if (badge) badge.hidden = true;
      var link = q('.npp-product__link'); if (link) link.hidden = true;
      var skip = q('[data-npp-skip]'); skip.setAttribute('data-i18n', 'payout.cancel'); skip.textContent = T('payout.cancel', 'Cancel');
      m.addEventListener('click', function (e) {
        if (e.target === m || e.target.closest('[data-npp-close]') || e.target.closest('[data-npp-skip]')) close();
        else if (e.target.closest('[data-npp-publish]')) submit();
      });
      wireCount(q('[data-npp-title]'), q('[data-npp-title-count]'), 120);
      wireCount(q('[data-npp-body]'), q('[data-npp-body-count]'), 2000);
      ['[data-npp-title]', '[data-npp-body]', '[data-npp-date]', '[data-npp-time]'].forEach(function (s) { q(s).addEventListener('input', syncPrimary); });
      var body = q('[data-npp-body]');
      m.querySelectorAll('[data-npp-token]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tok = btn.getAttribute('data-npp-token');
          var s = body.selectionStart != null ? body.selectionStart : body.value.length, en = body.selectionEnd != null ? body.selectionEnd : body.value.length;
          body.value = body.value.slice(0, s) + tok + body.value.slice(en);
          var pos = s + tok.length; body.focus(); body.setSelectionRange(pos, pos);
          body.dispatchEvent(new Event('input'));
        });
      });
      q('[data-npp-sched]').addEventListener('click', function () { setSched(!sched); });
      document.addEventListener('keydown', function (e) { if (m && !m.hidden && e.key === 'Escape') close(); });
      return true;
    }
    function open(post) {
      if (archived() || !ensure()) return;
      editing = post || null;
      last = document.activeElement;
      var titleKey = editing ? 'npp.title.edit' : 'npp.title.new';
      var h = q('#npp-title'); h.setAttribute('data-i18n', titleKey); h.textContent = T(titleKey, editing ? 'Edit post' : 'New post');
      var nm = document.getElementById('pd-title'); if (nm) q('[data-npp-prod-name]').textContent = nm.textContent.trim();
      var pr = document.querySelector('[data-pd-hero-price]'); var prEl = q('[data-npp-prod-price]');
      var hasPr = !!(pr && pr.textContent.trim()); prEl.hidden = !hasPr; if (hasPr) prEl.textContent = pr.textContent.trim();
      var sent = !!(editing && editing.status === 'sent');
      q('[data-npp-sent-note]').hidden = !sent;
      q('[data-npp-audience-field]').hidden = sent;
      q('[data-npp-timing-field]').hidden = sent;
      var toks = q('.msg-tokens'); if (toks) toks.hidden = sent;   /* 個人化變數只在發送當下替換，已發送的貼文用不上 */
      q('[data-npp-title]').value = editing ? editing.title : '';
      q('[data-npp-body]').value = editing ? editing.body : '';
      q('[data-npp-to]').value = editing ? editing.aud : 'all';
      var at = editing && editing.status === 'scheduled' ? new Date(editing.at) : new Date(Date.now() + DAY);
      if (!editing || editing.status !== 'scheduled') at.setHours(10, 0, 0, 0);
      q('[data-npp-date]').value = at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate());
      q('[data-npp-time]').value = pad(at.getHours()) + ':' + pad(at.getMinutes());
      ['[data-npp-title]', '[data-npp-body]'].forEach(function (s) { q(s).dispatchEvent(new Event('input')); });
      setSched(!!(editing && editing.status === 'scheduled'));
      m.hidden = false;
      document.body.classList.add('is-modal-open');
      q('[data-npp-title]').focus();
    }
    function close() {
      if (!m) return;
      m.hidden = true;
      editing = null;
      document.body.classList.remove('is-modal-open');
      if (last && last.focus) last.focus();
    }
    function schedTs() {
      var d = q('[data-npp-date]').value, t = q('[data-npp-time]').value;
      return new Date(d + 'T' + t).getTime();
    }
    function submit() {
      var title = q('[data-npp-title]').value.trim(), body = q('[data-npp-body]').value.trim();
      if (!title || !body) return;
      var list = listOf(pid, isSample);
      if (editing && editing.status === 'sent') {
        editing.title = title; editing.body = body; editing.edited = true;
        toast('pd.posts.toast.saved', 'Post saved');
      } else if (editing) {
        editing.title = title; editing.body = body; editing.aud = q('[data-npp-to]').value;
        if (sched) editing.at = schedTs(); else { editing.status = 'sent'; editing.at = Date.now(); }
        toast(sched ? 'pd.posts.toast.saved' : 'pd.posts.toast.sent', sched ? 'Post saved' : 'Post published');
      } else {
        list.push({ id: 'p' + Date.now().toString(36), status: sched ? 'scheduled' : 'sent', at: sched ? schedTs() : Date.now(),
          aud: q('[data-npp-to]').value, edited: false, title: title, body: body });
        toast(sched ? 'pd.posts.toast.sched' : 'pd.posts.toast.sent', sched ? 'Post scheduled' : 'Post published');
      }
      save(); close(); render();
    }

    root.addEventListener('click', function (e) {
      if (archived()) return;
      var list = listOf(pid, isSample);
      var find = function (id) { return list.filter(function (p) { return p.id === id; })[0]; };
      var b;
      if (e.target.closest('[data-pd-post-new]')) { open(null); return; }
      if ((b = e.target.closest('[data-pp-edit]'))) { open(find(b.getAttribute('data-pp-edit'))); return; }
      if ((b = e.target.closest('[data-pp-retry]'))) {
        var p = find(b.getAttribute('data-pp-retry'));
        if (p) { p.status = 'sent'; p.at = Date.now(); save(); render(); toast('pd.posts.toast.sent', 'Post published'); }
        return;
      }
      if ((b = e.target.closest('[data-pp-cancel]'))) {
        var id = b.getAttribute('data-pp-cancel');
        var doCancel = function () {
          all[pid] = list.filter(function (x) { return x.id !== id; });
          save(); render(); toast('pd.posts.toast.canceled', 'Schedule canceled');
        };
        if (window.pdAskConfirm) window.pdAskConfirm({
          title: T('pd.posts.cancel.title', 'Cancel this scheduled post?'),
          body: T('pd.posts.cancel.body', "It won't be sent, and no fans will be notified."),
          okKey: 'pd.posts.cancel.ok', okFallback: 'Cancel schedule', cancelKey: 'pd.posts.cancel.keep', cancelFallback: 'Keep scheduled', destructive: true, onConfirm: doCancel
        });
        else doCancel();
      }
    });

    /* 封存／解除封存是即時切換的，切了就重畫（收起或露出動作） */
    new MutationObserver(render).observe(main, { attributes: true, attributeFilter: ['data-archived'] });
    document.addEventListener('ztor:lang-changed', render);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
