// js/size-guides-store.js — 商店層尺寸指南的單一資料源（spec 5.1.5.5 F7 · 5.1.5.2 §4.1 F2 · D211）
//
// 為什麼有這支：同一份清單有兩個消費點——商店設定的「Size guides」分頁在管理它，
// 建立商品／商品細節的「尺寸指南」那一列在說「這件商品沿用哪幾份」。兩頁各寫一份
// 資料就會分岔：使用者在商店設定把指南全部刪掉，建立商品卻還寫著「沿用 衣服·褲子·帽子」
// （2026-09-10 使用者回報的正是這個畫面）。
//
// 原型無後端，狀態存 localStorage，所以同一個瀏覽器跨頁、重整都看得到同一份清單。
// 任何變動都發 'sizeguides:changed'（window 上，bubbles 不適用），消費頁重畫即可。
//
// 一筆指南：
//   { id: 'sg-…', nameKey?: '<i18n key>', name?: '<使用者輸入的名字>', typeKey: '<i18n key>' }
//   nameKey ＝ 示範資料那三份（切語言要跟著換）；使用者自己建的用 name（不進 i18n）。
(function () {
  'use strict';
  var KEY = 'ztor.sizeGuides';
  var EVT = 'sizeguides:changed';

  /* 示範資料＝商店設定原本寫死在 HTML 的那三列（衣服／褲子／帽子）。
     只在「這個瀏覽器從來沒動過這份清單」時鋪一次；使用者刪光之後不會自己長回來，
     否則「刪光」這個狀態在原型上永遠測不到。 */
  var SEED = [
    { id: 'sg-tops', nameKey: 'store-settings.specs.row.tops', typeKey: 'store-settings.specs.type.apparelacc' },
    { id: 'sg-bottoms', nameKey: 'store-settings.specs.row.bottoms', typeKey: 'store-settings.specs.type.apparelacc' },
    { id: 'sg-hats', nameKey: 'store-settings.specs.row.hats', typeKey: 'store-settings.specs.type.apparelacc' }
  ];

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null) return SEED.map(function (g) { return Object.assign({}, g); });
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return SEED.map(function (g) { return Object.assign({}, g); });
    }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent(EVT, { detail: { list: list } })); } catch (e) {}
    return list;
  }

  function newId() { return 'sg-' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }

  /* 顯示用名字：示範那三份走 i18n（切語言跟著換），使用者建的用原字。 */
  function labelOf(g) {
    if (!g) return '';
    if (g.name) return g.name;
    return (window.i18nT && g.nameKey && window.i18nT(g.nameKey)) || g.nameKey || '';
  }

  window.ZtorSizeGuides = {
    EVENT: EVT,
    list: function () { return read(); },
    count: function () { return read().length; },
    labelOf: labelOf,
    labels: function () { return read().map(labelOf).filter(Boolean); },
    get: function (id) { return read().filter(function (g) { return g.id === id; })[0] || null; },
    add: function (name, typeKey) {
      var list = read();
      list.push({ id: newId(), name: name || '', typeKey: typeKey || 'store-settings.specs.type.apparelacc' });
      return write(list);
    },
    rename: function (id, name) {
      var list = read();
      list.forEach(function (g) { if (g.id === id) { g.name = name; delete g.nameKey; } });
      return write(list);
    },
    duplicate: function (id) {
      var list = read(), i = -1;
      list.forEach(function (g, n) { if (g.id === id) i = n; });
      if (i < 0) return list;
      /* 複本的名字是使用者的資料、不再是預設指南：把 nameKey 換成當下語言的字面值，
         否則下一次切語言會把「 copy」抹掉、變回預設名。 */
      var copy = { id: newId(), name: labelOf(list[i]) + ' copy', typeKey: list[i].typeKey };
      list.splice(i + 1, 0, copy);
      return write(list);
    },
    remove: function (id) {
      return write(read().filter(function (g) { return g.id !== id; }));
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} return write(read()); }
  };
}());
