/* link-field.js — 唯讀連結列的行為（ds-components/link-field.css 的行為半）
   ------------------------------------------------------------------------------
   2026-09-04（spec 0-設計規格書 §7.14 · D241）。首個角色是非公開連結：商品或組合切成
   隱藏時系統產生一條連結，創作者複製給人、或隨時重置作廢舊的。

   媒體庫（media-vault.js 的 copyLink）此前已在頁內做過同一件事，本模組把它抽成
   DS 級的一份；media-vault 這一輪不動，等日後確認兩者要同一個外觀時再收斂。

   Data-attribute 契約
     [data-linkf]            連結列的根（.linkf）。互動由此往內找，消費頁不必給 id。
     [data-linkf-copy]       複製鈕。按下就把同一個 .linkf 內輸入框的值寫進剪貼簿，
                             按鈕文字暫時換成「已複製」，整列亮 1.6 秒（--copied）。
     [data-linkf-reset]      重置鈕（選配）。本模組不決定新連結長什麼樣——它只發一顆
                             linkfield:reset 事件，由頁面（通常呼叫
                             ListingState.resetPrivateLink()）算出新值再寫回輸入框。
     [data-linkf-copied]     選配。放「已複製」的譯文，缺席時退回 i18n key link.copied。

   對外 API（window.linkField）
     setValue(root, url)     寫值（頁面重置後把新連結放回去）
     copy(root)              程式觸發複製
     value(root)

   點擊走 document 級單一委派：動態產生的連結列不必重新綁定。
*/
(function () {
  'use strict';

  var HOLD = 1600;

  function tr(key, fallback) {
    var v = (typeof window.i18nT === 'function') ? window.i18nT(key) : '';
    return v || fallback;
  }

  function inputOf(root) { return root && root.querySelector('input, textarea'); }

  function value(root) {
    var el = inputOf(root);
    return el ? el.value : '';
  }

  function setValue(root, url) {
    var el = inputOf(root);
    if (el) el.value = url == null ? '' : url;
    return url;
  }

  /* 回饋長在按鈕自己的字上：手剛離開的地方就是眼睛在看的地方。 */
  function flash(root, btn) {
    root.classList.add('linkf--copied');
    var label = btn && (btn.querySelector('[data-linkf-copied]') || btn.querySelector('span') || btn);
    var was = label ? label.textContent : null;
    var wasKey = label ? label.getAttribute('data-i18n') : null;
    if (label) {
      label.removeAttribute('data-i18n');
      label.textContent = tr('link.copied', '已複製');
    }
    setTimeout(function () {
      root.classList.remove('linkf--copied');
      if (!label) return;
      label.textContent = was;
      if (wasKey) label.setAttribute('data-i18n', wasKey);
    }, HOLD);
  }

  /* 舊瀏覽器與非安全來源沒有 clipboard API：塞一個離屏 input 再 execCommand，
     比跳「請手動複製」誠實——使用者要的是複製這件事真的發生。 */
  function writeClipboard(text, ok, bad) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
    function fallback() {
      var tmp = document.createElement('input');
      tmp.value = text;
      tmp.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand('copy'); ok(); } catch (_) { if (bad) bad(); }
      tmp.remove();
    }
  }

  function copy(root, btn) {
    var text = value(root);
    if (!text) return;
    writeClipboard(text, function () { flash(root, btn); }, function () {
      if (window.ztorToast) {
        window.ztorToast.show(tr('link.copy-failed', '複製失敗，請手動選取連結'), { tone: 'neutral' });
      }
    });
  }

  document.addEventListener('click', function (e) {
    var copyBtn = e.target.closest && e.target.closest('[data-linkf-copy]');
    if (copyBtn) {
      var root = copyBtn.closest('[data-linkf], .linkf');
      if (root) { copy(root, copyBtn); return; }
    }
    var resetBtn = e.target.closest && e.target.closest('[data-linkf-reset]');
    if (resetBtn) {
      var r = resetBtn.closest('[data-linkf], .linkf');
      if (!r) return;
      /* 新連結由頁面算（通常是 ListingState.resetPrivateLink），本模組不決定格式。 */
      r.dispatchEvent(new CustomEvent('linkfield:reset', { bubbles: true, detail: { root: r } }));
    }
  });

  window.linkField = { setValue: setValue, value: value, copy: copy };
}());
