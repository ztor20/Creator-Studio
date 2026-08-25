/* partials/login-lang-prompt.js — D225 登入所選語言與帳號預設語言不同時，登入後詢問
 *
 * 沿革：D221（2026-08-24）曾有 partials/lang-mismatch-dialog.js，處理的是「顯示語言」與
 * 「預設語言」兩個概念的不一致；D222 同日把語言收回單一概念（window.ztorLang），該檔與
 * 兩個概念一併撤除、檔案已刪（design-system.md 留 tombstone 條目）。本檔是 D225 使用者
 * 2026-08-25 裁示後的**復活並改寫語意**：站上現在只有一個語言值，本檔問的是「登入畫面剛
 * 選的語言」與「帳號已存的預設語言」哪個算數——跟 D221 的雙概念判斷完全是兩回事，只是
 * 沿用同一種殼與開關寫法。
 *
 * 三條登入成功路徑（login.html 的 email／phone／第三方 OAuth）落地前都會寫 sessionStorage
 * 旗標 ztor-r22-login-lang-pending=1（見 login.html 的 markJustLoggedIn()）；login.html 的
 * 語言選擇器每次改動都把選擇記進 ztor-r22-login-lang-pick（見 login.html 底部的接線
 * script，用 window.ztorLang.preview() 只套用畫面、不寫入帳號預設值）。
 *
 * 掛了本檔的 shell 頁（load 時）見 pending 旗標存在，就讀 login-lang-pick：
 *   - 沒有 pick（使用者在登入畫面沒動過語言選擇器）→ 直接清 pending，不跳，因為沒有
 *     「剛選的語言」可比對。
 *   - 有 pick 但等於 window.ztorLang.get()（帳號預設語言）→ 清兩把旗標，不跳。
 *   - 有 pick 且與帳號預設語言不同 → 先把畫面套成 pick 的語言（ztorLang.preview()，
 *     讓確認框跳出的當下使用者看到的就是登入時選的那個語言——這樣「保留原本的預設
 *     語言」才有東西可以「切回」），再開確認框。
 * 同一次登入只問一次：任一顆按鈕被按下、或彈窗被關閉（Esc／點遮罩，等同「保留原本的
 * 預設語言」），兩把旗標即清除。
 *
 * 殼沿用站上正典 .payout-modal／.payout-dialog（STYLE-DECISIONS Q27 法律：中央確認彈窗
 * 一律用這個殼），開關慣例照 partials/finance-overview.js:20-40（遮罩／Esc／close 都收）。
 * 沒有旗標時完全零 DOM、零開銷。
 *
 * 掛載範圍：index.html／creators.html（兩條登入落點）；其餘掛 js/sidebar.js 的 shell 頁
 * 載到也無害（沒旗標就不跳）。
 *
 * 對外也留一個手動觸發 API（window.ztorLoginLangPrompt.show(pickedLang, defaultLang)），
 * 純粹給 design-system.html 的 demo 卡按鈕用，不走旗標判斷、不碰 sessionStorage。
 */
(function () {
  'use strict';

  var PENDING_KEY = 'ztor-r22-login-lang-pending';
  var PICK_KEY = 'ztor-r22-login-lang-pick';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb || k; }

  function langLabel(code) {
    var list = (window.ztorLang && window.ztorLang.list()) || [];
    for (var i = 0; i < list.length; i++) { if (list[i][0] === code) return list[i][1]; }
    return code;
  }

  function clearFlags() {
    try { sessionStorage.removeItem(PENDING_KEY); sessionStorage.removeItem(PICK_KEY); } catch (e) {}
  }

  /* pickedLang＝登入畫面選的語言、defaultLang＝帳號已存的預設語言。
     onClose 不是必填——demo 呼叫不需要清旗標。 */
  function buildDialog(pickedLang, defaultLang, onClose) {
    var wrap = document.createElement('div');
    wrap.className = 'payout-modal';
    wrap.setAttribute('data-login-lang-prompt-modal', '');
    wrap.innerHTML =
      '<section class="payout-dialog payout-dialog--narrow" role="dialog" aria-modal="true" aria-labelledby="login-lang-prompt-title">' +
        '<div class="payout-dialog__head">' +
          '<h2 class="payout-dialog__title" id="login-lang-prompt-title" data-i18n="loginlangprompt.title">Keep this language?</h2>' +
        '</div>' +
        '<div class="payout-dialog__body">' +
          '<p class="text-sub" data-login-lang-prompt-body></p>' +
        '</div>' +
        '<div class="payout-dialog__foot" style="display:flex;gap:var(--sp-8);justify-content:flex-end">' +
          '<button class="btn btn--ghost" type="button" data-login-lang-prompt-keep data-i18n="loginlangprompt.keep">Keep {default} (my default)</button>' +
          '<button class="btn btn--primary" type="button" data-login-lang-prompt-use data-i18n="loginlangprompt.use">Use {picked}</button>' +
        '</div>' +
      '</section>';
    document.body.appendChild(wrap);

    var bodyEl = wrap.querySelector('[data-login-lang-prompt-body]');
    var keepBtn = wrap.querySelector('[data-login-lang-prompt-keep]');
    var useBtn = wrap.querySelector('[data-login-lang-prompt-use]');
    function paintStrings() {
      var pickedName = langLabel(pickedLang), defaultName = langLabel(defaultLang);
      bodyEl.textContent = T('loginlangprompt.body', 'You picked {picked} at login. Your account’s default language is {default}.')
        .replace('{picked}', pickedName).replace('{default}', defaultName);
      keepBtn.textContent = T('loginlangprompt.keep', 'Keep {default} (my default)').replace('{default}', defaultName);
      useBtn.textContent = T('loginlangprompt.use', 'Use {picked}').replace('{picked}', pickedName);
    }

    if (window.ztorIcons) window.ztorIcons.applyIcons(wrap);
    /* 先跑一般 i18n（處理標題的 data-i18n），再用 paintStrings() 蓋上插值——
       body／keep／use 三處帶 {picked}/{default}，applyI18n 只會填回原始模板字串，
       一定要在它之後再跑一次插值，否則模板佔位符會原樣露出。 */
    if (window.applyI18n) window.applyI18n(wrap);
    paintStrings();
    /* i18n:applied 也會重跑 data-i18n（回英文/中文原文模板），接著要重插值一次。 */
    document.addEventListener('i18n:applied', paintStrings);

    var closed = false;
    function close(useNewLang) {
      if (closed) return;
      closed = true;
      document.removeEventListener('i18n:applied', paintStrings);
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = '';
      wrap.remove();
      if (useNewLang) {
        /* 成為帳號預設語言；畫面已經在 pickedLang（maybeShow 先 preview 過），維持不動 */
        if (window.ztorLang) window.ztorLang.set(pickedLang);
      } else {
        /* 帳號值不變；畫面切回帳號預設語言（只套用顯示，不需要也不應該再寫一次同樣的值） */
        if (window.ztorLang) window.ztorLang.preview(defaultLang);
      }
      if (onClose) onClose(!!useNewLang);
    }
    function onKeydown(e) { if (e.key === 'Escape') close(false); }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) { close(false); return; }
      if (e.target.closest('[data-login-lang-prompt-use]')) { close(true); return; }
      if (e.target.closest('[data-login-lang-prompt-keep]')) { close(false); }
    });
  }

  function maybeShowFromFlags() {
    var pending = false;
    try { pending = sessionStorage.getItem(PENDING_KEY) === '1'; } catch (e) {}
    if (!pending) return;

    var picked = null;
    try { picked = sessionStorage.getItem(PICK_KEY); } catch (e) {}
    if (!picked || !window.ztorLang) { clearFlags(); return; }

    var defaultLang = window.ztorLang.get();
    if (picked === defaultLang) { clearFlags(); return; }

    /* 落地當下先把畫面套成登入時選的語言，讓確認框跳出時使用者看到的就是那個語言：
       選「改用剛選的」介面維持不動、選「保留原本的預設語言」介面才切回（D225 驗收）。 */
    window.ztorLang.preview(picked);
    buildDialog(picked, defaultLang, clearFlags);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeShowFromFlags);
  else maybeShowFromFlags();

  /* demo-only：design-system.html 的 Rendered preview 按鈕直接呼叫，不走旗標、不預先 preview。 */
  window.ztorLoginLangPrompt = {
    show: function (pickedLang, defaultLang) { buildDialog(pickedLang, defaultLang, function () {}); }
  };
}());
