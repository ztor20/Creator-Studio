/* films-store.js — 前台已上架電影 mock（BR-NEW-1 商品「電影關聯」候選來源）
   電影是 ztor 前台的實體、不在 Creator Studio 建立或管理；此清單僅為原型候選資料，
   真正清單由前台已上架電影目錄提供。商品 → 電影為引用關係（可多部、選填）。
   規格：documents/5.1.5.2-建立商品流程.md §4.4 F12 / 5.1.5.1 §2.14 / 0-設計規格書 §7.1（D138）。
   呈現假設：見 site/r2.1/ASSUMPTIONS.md（電影候選 mock）。 */
(function () {
  'use strict';
  var FILMS = [
    { id: 'film-zheng-yi-sao', title: '海上霸王 · 鄭一嫂' },
    { id: 'film-fist-of-fury', title: 'Fist of Fury: Redux' },
    { id: 'film-neon-harbor',  title: '霓虹港灣' },
    { id: 'film-last-typhoon', title: 'The Last Typhoon' },
    { id: 'film-silk-echo',    title: '絲路回聲' },
    { id: 'film-midnight-canton', title: 'Midnight in Canton' }
  ];
  window.ztorFilms = {
    list: function () { return FILMS.slice(); },
    title: function (id) {
      for (var i = 0; i < FILMS.length; i++) { if (FILMS[i].id === id) return FILMS[i].title; }
      return id;
    }
  };
}());
