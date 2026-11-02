/* faux-qr.js — 假 QR 產生器（共用，原型專用；正式產品換成真 QR 編碼）
   window.ztorFauxQr(seed) → 回傳 <svg> 字串。同一個 seed 畫出同一張圖。
   畫法與 pickup-detail.html／event-detail.html／create-product.html／product-detail.html
   等頁內嵌的版本一致（25×25 格、三個定位角、其餘依 seed 取格）。
   已定義就不覆蓋：頁內仍有自己的內嵌定義時以內嵌為準，不會被這支蓋掉。 */
(function () {
  if (typeof window.ztorFauxQr === 'function') return;
  window.ztorFauxQr = function (seed) {
    seed = seed || 7;
    var N = 25, cell = 4, pad = 2, size = N * cell + pad * 2, r = '';
    function finder(ox, oy) {
      r += '<rect x="' + (pad + ox * cell) + '" y="' + (pad + oy * cell) + '" width="' + (7 * cell) + '" height="' + (7 * cell) + '" fill="currentColor"/>';
      r += '<rect x="' + (pad + (ox + 1) * cell) + '" y="' + (pad + (oy + 1) * cell) + '" width="' + (5 * cell) + '" height="' + (5 * cell) + '" fill="var(--card)"/>';
      r += '<rect x="' + (pad + (ox + 2) * cell) + '" y="' + (pad + (oy + 2) * cell) + '" width="' + (3 * cell) + '" height="' + (3 * cell) + '" fill="currentColor"/>';
    }
    function inFinder(x, y) {
      return (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (((x * 131 + y * 57 + seed * 17 + x * y) % 3) === 0)
        r += '<rect x="' + (pad + x * cell) + '" y="' + (pad + y * cell) + '" width="' + cell + '" height="' + cell + '" fill="currentColor"/>';
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="QR code" xmlns="http://www.w3.org/2000/svg">' + r + '</svg>';
  };
})();
