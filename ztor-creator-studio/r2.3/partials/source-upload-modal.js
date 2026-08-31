window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Source upload modal · spec 5.1.7.8 F1「上傳資料檔」（D165）。以 <script> 掛在
   fan-analytics.html（file:// safe）。

   為什麼是彈窗而不是就地展開：來源明細本身是一顆 popover（.src-status__panel），
   在 popover 裡再長出一個檔案投放區會讓兩層浮層互相蓋住，而且上傳過程需要
   讀說明、看錯誤、確認期間——那是一段有頭有尾的任務，屬 Q27 裁決的「編輯／
   新增一筆資料」，殼層一律用 .payout-modal / .payout-dialog。

   為什麼不寫死檔案格式與大小：規格把「接受哪些格式、必要欄位、同期間重複
   上傳怎麼處理、資料多久算過期」四件事標為〔產品待確認〕（D165 待確認 1–3），
   呈現層不得自行決定。所以文案只講「從平台後台匯出的資料檔」與各平台的匯出
   路徑，不出現任何 .csv／MB／欄位名。缺口登記在 ASSUMPTIONS.md PG-026～028。

   openFor(platform) 帶入平台，決定標題與「去哪裡匯出」那一句；platform 值
   對應 i18n key 的後綴（sp / yt / ig / tt）。StreetVoice 不開放上傳，所以
   沒有 sv 分支——它的列本來就不會有這顆按鈕。 */
(function () {
  window.ZTOR_PARTIALS.sourceUploadModal = `
<div class="payout-modal" data-src-upload-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="src-upload-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="src-upload-title" data-src-upload-title data-i18n="aud.up.title.yt">Upload YouTube data</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-src-upload-sub data-i18n="aud.up.sub">We don't connect to this platform, so its figures come from a file you export yourself.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="aud.up.close" data-src-upload-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>

    <div class="payout-dialog__body">
      <!-- 去哪裡匯出：規格要求「每個平台附一句取得方式，讓創作者不必自己找」。
           用中性說明條，不用 alert（這不是異常，是操作指引）。 -->
      <div class="info-banner">
        <i data-lucide="info" class="ztor-icon info-banner__icon"></i>
        <span data-src-upload-where data-i18n="aud.up.where.yt">Export it from YouTube Studio → Analytics → Advanced mode.</span>
      </div>

      <div class="upload-tile upload-tile--file" data-upload="content" data-upload-key="src-file">
        <span class="upload-tile__icon"><i data-lucide="upload" class="ztor-icon"></i></span>
        <span class="upload-tile__title" data-i18n="aud.up.drop.title">Drop the exported file here</span>
        <span class="upload-tile__hint" data-i18n="aud.up.drop.hint">The report file you downloaded from the platform, unmodified.</span>
      </div>

      <label class="field">
        <span class="field__label" data-i18n="aud.up.period">Period this file covers</span>
        <input class="input" placeholder="2026/05/01 – 2026/07/31" data-src-upload-period>
        <span class="field__hint" data-i18n="aud.up.period.hint">Tells the page which dates these figures speak for.</span>
      </label>
    </div>

    <div class="payout-dialog__foot">
      <button class="btn btn--outline" type="button" data-src-upload-close data-i18n="aud.up.cancel">Cancel</button>
      <button class="btn btn--primary" type="button" data-src-upload-submit data-i18n="aud.up.submit">Upload</button>
    </div>
  </section>
</div>`;
})();
