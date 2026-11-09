/* ============================================================
   variant-image-modal.js — 規格圖片彈窗（建立商品與商品詳情共用，2026-11-09 收斂）
   原本 create-product.html（#cp-vimg-modal，2026-08-10）與 product-detail.html（#pd-vimg-modal，2026-09-11 移植）
   各有一份 markup＋控制器，內容幾乎一樣；收成這一份。pattern：5.1.8 彈窗類型第 1 類「填寫送出」（預設寬）。

   用法：頁面載入本檔後呼叫
     ZtorVariantImageModal.mount({
       trigger: 'data-vimg',            // 開啟鈕的屬性名，值＝規格的 key（建立商品）或索引（商品詳情）
       hintKey: 'cp.var.img.auto', hintFallback: 'Changes apply straight away.',   // 頁尾說明（兩頁儲存時機不同）
       resolve: function (src) { return src; }   // 選填：把存的圖檔名轉成可顯示的網址
     });
   狀態只有一個來源：window.ztorVariantImage（各頁主控制器掛上）：getOwn(key)／setOwn(key, src)／heroSrc()／labelOf(key)（選填）。
   彈窗裡的上傳格走共用互動上傳格（partials/upload-tile.js），這裡只接 upload:change 把結果寫回。
   樣式：payout-modal.css、upload-tile.css（.upload-tile-aside）。
   ============================================================ */
(function () {
  "use strict";
  function T(k, fb) { return (window.i18nT ? window.i18nT(k) : null) || fb; }
  function api() { return window.ztorVariantImage || null; }

  function mount(cfg) {
    cfg = cfg || {};
    var trig = cfg.trigger || "data-vimg";
    var resolve = cfg.resolve || function (s) { return s; };
    var modal = document.createElement("div");
    modal.className = "payout-modal";
    modal.id = "vimg-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="vimg-title">' +
        '<div class="payout-dialog__head">' +
          '<h2 class="payout-dialog__title" id="vimg-title"></h2>' +
          '<button class="btn btn--icon" type="button" data-vimg-close aria-label="Close" data-i18n-aria-label="cp.var.img.close"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="payout-dialog__body" data-vimg-body></div>' +
        '<div class="payout-dialog__foot">' +
          '<span class="field__hint" style="margin:0" data-i18n="' + (cfg.hintKey || "cp.var.img.auto") + '">' + T(cfg.hintKey || "cp.var.img.auto", cfg.hintFallback || "") + '</span>' +
          '<button class="btn btn--primary" type="button" data-vimg-close data-i18n="cp.var.img.done">' + T("cp.var.img.done", "Done") + '</button>' +
        '</div>' +
      '</section>';
    document.body.appendChild(modal);
    var body = modal.querySelector("[data-vimg-body]");
    var title = modal.querySelector("#vimg-title");
    var openKey = null;

    function render() {
      var a = api(); if (!a || openKey === null) return;
      var own = a.getOwn(openKey);
      var hero = a.heroSrc();
      var src = own ? resolve(own) : hero;
      var hintKey = own ? "cp.var.img.own" : (hero ? "cp.var.img.inherit" : "cp.var.img.none");
      body.innerHTML =
        '<div class="upload-tile-aside">' +
          /* 只收圖片：這一格產出的是規格表列首那顆 34px 的辨識小圖，不是展示素材（upload:change 只把 <img> 的 src 寫回） */
          '<div class="upload-tile upload-tile--portrait ' + (src ? "is-filled" : "is-empty") + '" data-upload data-upload-accept="image/*" data-vimg-tile>' +
            (src ? '<img class="upload-tile__thumb" src="' + String(src).replace(/"/g, "&quot;") + '" alt="">'
                 : '<span class="upload-tile__icon"><i data-lucide="plus" class="ztor-icon ztor-icon--md"></i></span>') +
          '</div>' +
          '<div class="upload-tile-aside__side">' +
            '<p class="field__hint" style="margin:0" data-i18n="' + hintKey + '">' + T(hintKey, "") + '</p>' +
            (own ? '<button type="button" class="btn btn--outline btn--sm" data-vimg-reset data-i18n="cp.var.img.reset">' + T("cp.var.img.reset", "Back to the product image") + '</button>' : "") +
          '</div>' +
        '</div>';
      if (window.ztorIcons) window.ztorIcons.applyIcons(body);
      if (window.ztorUploadTile) body.querySelectorAll(".upload-tile[data-upload]").forEach(window.ztorUploadTile.enhance);
    }
    function open(key) {
      var a = api(); if (!a) return;
      openKey = key;
      title.textContent = T("cp.var.img", "Variant image") + " · " + (a.labelOf ? a.labelOf(key) : key);
      render();
      if (window.ztorIcons) window.ztorIcons.applyIcons(modal);
      modal.hidden = false;
      document.body.classList.add("is-modal-open");
    }
    function close() { modal.hidden = true; openKey = null; document.body.classList.remove("is-modal-open"); }

    document.addEventListener("click", function (e) {
      var o = e.target.closest("[" + trig + "]");
      if (o) { open(o.getAttribute(trig)); return; }
      if (e.target.closest("[data-vimg-close]")) { close(); return; }
      if (e.target.closest("[data-vimg-reset]")) {
        var a = api(); if (a && openKey !== null) { a.setOwn(openKey, ""); render(); }
        return;
      }
      if (e.target === modal) close();   // 點背景關閉：只認最外層
    });
    /* 以 openKey 判斷、不看 modal.hidden：頁面可能另有通用 Esc 處理器先把 .payout-modal 藏掉 */
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openKey !== null) close(); });
    modal.addEventListener("upload:change", function (e) {
      var a = api(); if (!a || openKey === null) return;
      var tile = e.target.closest("[data-vimg-tile]"); if (!tile) return;
      if (e.detail && e.detail.filled) {
        var img = tile.querySelector(".upload-tile__thumb");
        if (img && img.src) { a.setOwn(openKey, img.src); render(); }
      } else if (e.detail && e.detail.state === "empty") {
        a.setOwn(openKey, ""); render();
      }
    });
  }
  window.ZtorVariantImageModal = { mount: mount };
})();
