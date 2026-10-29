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
//   { id: 'sg-…', nameKey?: '<i18n key>', name?: '<使用者輸入的名字>', typeKey: '<i18n key>', content?: {…} }
//   nameKey ＝ 預建 9 份（切語言要跟著換）；使用者自己建的用 name（不進 i18n）。
//   content ＝尺寸表／身高體重／量測方式等內容；預建的由 PRESETS 依 id 提供（不存 localStorage），複製出來的帶複本。
(function () {
  'use strict';
  var KEY = 'ztor.sizeGuides';
  var EVT = 'sizeguides:changed';

  /* 預建 9 份（2026-10-29 · 研究稿 note/尺寸指南預設資料.md 第三節）。每份帶自己的內容：
       cols   ＝量測欄（id → i18n 'store-settings.specs.m.<id>'）
       rows   ＝一列一個實體尺碼；intl/us/eu/jp 是同一列的四個名字，vals 是量測值（公分，四制共用）；
                null＝研究稿標「未能查證」，彈窗顯示「—」，不編數字；字串值（區間）不做公分↔英吋換算；
                us/eu 可為 {m,w}（鞋子男／女碼），彈窗依語言組成「男 7／女 8.5」
       hw     ＝身高體重參考 [{size,h,w}]；null＝不適用（hwNa 說明為什麼）
       howto  ＝量測方式 id 清單（'store-settings.specs.h.<id>.part/.desc'）
       fit/note ＝i18n key
     數值是起手參考值、非規格規定（ASSUMPTIONS UIA-316）。內容不存 localStorage：以 id 對這張表，
     之後改預設值，沒動過的瀏覽器會跟著更新。 */
  var K = 'store-settings.specs.';
  function R(intl, us, eu, jp, vals) { return { intl: intl, us: us, eu: eu, jp: jp, vals: vals }; }
  var TOP4 = { XS: ['XS', '44', 'S'], S: ['S', '46', 'M'], M: ['M', '48', 'L'], L: ['L', '50', 'LL'], XL: ['XL', '52', '3L'], '2XL': ['2XL', '54', '4L'], '3XL': ['3XL', '56', '5L'] };
  function top(sz, vals) { var m = TOP4[sz]; return R(sz, m[0], m[1], m[2], vals); }
  /* 上衣身高體重（Tesla 台灣官網美版合身 T，單一品牌；3XL 未能查證） */
  var HW_TOP = [
    { size: 'XS', h: '160–170 cm', w: '55–60 kg' }, { size: 'S', h: '160–170 cm', w: '60–65 kg' },
    { size: 'M', h: '170–175 cm', w: '65–70 kg' }, { size: 'L', h: '175–180 cm', w: '70–75 kg' },
    { size: 'XL', h: '180–185 cm', w: '75–80 kg' }, { size: '2XL', h: '185–190 cm', w: '80–85 kg' },
    { size: '3XL', h: '', w: '' }
  ];
  var HW_BOTTOM = [
    { size: 'XS', h: '150–160 cm', w: '42–50 kg' }, { size: 'S', h: '158–166 cm', w: '48–56 kg' },
    { size: 'M', h: '164–172 cm', w: '55–64 kg' }, { size: 'L', h: '170–178 cm', w: '62–72 kg' },
    { size: 'XL', h: '175–183 cm', w: '70–82 kg' }, { size: 'XXL', h: '178–188 cm', w: '80–95 kg' }
  ];
  function bottomRows(withBack) {
    var base = [
      ['XS', '26', '42', 'XS', 33.0, 47.0, 25, 36, 29.0, 72, 17.5, 18, 27.5],
      ['S', '28', '44', 'S', 35.5, 49.5, 26, 37, 30.5, 74, 18.0, 19, 29.0],
      ['M', '30', '46', 'M', 38.0, 52.0, 27, 38, 32.0, 76, 18.5, 20, 30.5],
      ['L', '32', '48', 'L', 40.5, 54.5, 28, 39, 33.5, 77, 19.0, 21, 32.0],
      ['XL', '34', '50', 'LL', 43.0, 57.0, 29, 40, 35.0, 78, 19.5, 22, 33.5],
      ['XXL', '36', '52', '3L', 45.5, 59.5, 30, 41, 36.5, 79, 20.0, 23, 35.0]
    ];
    return base.map(function (r) {
      /* 長褲：腰 臀 前檔 後檔 大腿 內長 褲口；短褲：腰 臀 前檔 大腿 內長 褲口（無後檔） */
      return withBack ? R(r[0], r[1], r[2], r[3], [r[4], r[5], r[6], r[7], r[8], r[9], r[10]])
                      : R(r[0], r[1], r[2], r[3], [r[4], r[5], r[6], r[8], r[11], r[12]]);
    });
  }
  var SHOE_MW = [[22, 4, 5.5, 36, '35.5'], [23, 5, 6.5, '37.5', '36.5–37.5'], [24, 6, 7.5, 39, 38], [25, 7, 8.5, 40, '39–40'],
    [26, 8, 9.5, 41, 41], [27, 9, 10.5, '42.5', 42], [28, 10, 11.5, 44, 43], [29, 11, 12.5, 45, 44], [30, 12, 13.5, 46, 45]];
  var PRESETS = {
    'sg-tee': { slug: 'tee', content: {
      cols: ['chest', 'length', 'sleeve'],
      rows: [top('XS', [41.9, 68.6, null]), top('S', [45.7, 71.1, 40.5]), top('M', [50.8, 73.7, 44]), top('L', [55.9, 76.2, 47.5]),
             top('XL', [61.0, 78.7, 51.5]), top('2XL', [66.0, 81.3, 55]), top('3XL', [71.1, 83.8, 58])],
      hw: HW_TOP, howto: ['chest', 'length', 'sleeve', 'bodychest'], fit: K + 'g.tee.fit', note: K + 'note.flat' } },
    'sg-longtee': { slug: 'longtee', content: {
      cols: ['chest', 'length', 'sleeve'],
      rows: [top('S', [45.7, 71.1, null]), top('M', [50.8, 73.7, null]), top('L', [55.9, 76.2, null]),
             top('XL', [61.0, 78.7, null]), top('2XL', [66.0, 81.3, null]), top('3XL', [71.1, 83.8, null])],
      hw: HW_TOP.slice(1), howto: ['chest', 'length', 'sleevelong', 'bodychest'], fit: K + 'g.longtee.fit', note: K + 'note.flat' } },
    'sg-hoodie': { slug: 'hoodie', content: {
      cols: ['chest', 'length', 'sleeve'],
      rows: [top('XS', [45.7, 66.0, 82.5]), top('S', [50.8, 68.6, 83.8]), top('M', [55.9, 71.1, 86.4]), top('L', [61.0, 73.7, 88.9]),
             top('XL', [66.0, 76.2, 91.4]), top('2XL', [71.1, 78.7, 94.0]), top('3XL', [76.2, 81.3, 96.5])],
      hw: HW_TOP, howto: ['chest', 'lengthrib', 'sleeverib', 'bodychest'], fit: K + 'g.hoodie.fit', note: K + 'note.flat' } },
    'sg-jacket': { slug: 'jacket', content: {
      cols: ['chest', 'length', 'shoulder', 'sleeve'],
      rows: [top('XS', [54.5, 68, 45, 84.5]), top('S', [56.5, 70, 47, 87.5]), top('M', [58.5, 72, 49, 90.5]),
             top('L', [61.5, 74, 51, 93.5]), top('XL', [64.5, 76, 53, 96.5]), top('2XL', [67.5, 78, 55, 99.5])],
      hw: [{ size: 'XS', h: '155–164 cm', w: '' }, { size: 'S', h: '165–169 cm', w: '' }, { size: 'M', h: '170–174 cm', w: '' },
           { size: 'L', h: '175–179 cm', w: '' }, { size: 'XL', h: '180–184 cm', w: '' }, { size: '2XL', h: '185–190 cm', w: '' }],
      howto: ['chest', 'lengthcenter', 'shoulder', 'sleeve', 'bodychest'], fit: K + 'g.jacket.fit', note: K + 'note.jacket' } },
    'sg-pants': { slug: 'pants', content: {
      cols: ['waist', 'hip', 'frontrise', 'backrise', 'thigh', 'inseam', 'hem'],
      rows: bottomRows(true), hw: HW_BOTTOM,
      howto: ['waist', 'hip', 'frontrise', 'backrise', 'thigh', 'inseam', 'hem', 'bodywaist', 'bodyhip'], fit: K + 'g.pants.fit', note: K + 'note.flat' } },
    'sg-shorts': { slug: 'shorts', content: {
      cols: ['waist', 'hip', 'frontrise', 'thigh', 'inseam', 'hem'],
      rows: bottomRows(false), hw: HW_BOTTOM,
      howto: ['waist', 'hip', 'frontrise', 'thigh', 'inseam', 'hem', 'bodywaist', 'bodyhip'], fit: K + 'g.shorts.fit', note: K + 'note.flat' } },
    'sg-hats': { slug: 'hats', content: {
      cols: ['head'],
      rows: [R('S', '7', '56', '56', [55.9]), R('M', '7 1/4', '58', '58', [57.8]), R('L', '7 1/2', '60', '60', [59.8]),
             R('XL', '7 3/4', '62', '62', [61.8]), R('F', 'OSFM', '55–60', 'フリー', ['55–60'])],
      hw: null, hwNa: 'head', howto: ['head', 'hatinner'], fit: K + 'g.hats.fit', note: K + 'note.hat' } },
    'sg-socks': { slug: 'socks', content: {
      cols: ['foot'],
      rows: [R('S', '6–8', '35–38', '22–24', ['22.0–24.0']), R('M', '9–11', '39–42', '24–26', ['24.0–26.0']),
             R('L', '10–13', '43–46', '26–28', ['26.0–28.0']), R('XL', '13–15', '47–49', '28–30', ['28.0–30.0'])],
      hw: null, hwNa: 'foot', howto: ['foot'], fit: K + 'g.socks.fit', note: K + 'note.foot' } },
    'sg-shoes': { slug: 'shoes', content: {
      cols: ['foot'],
      rows: SHOE_MW.map(function (r) { return R(String(r[0]), { m: r[1], w: r[2] }, { m: r[3], w: r[4] }, String(r[0]), [r[0]]); }),
      hw: null, hwNa: 'foot', howto: ['foot'], fit: K + 'g.shoes.fit', note: K + 'note.foot' } }
  };
  var ORDER = ['sg-tee', 'sg-longtee', 'sg-hoodie', 'sg-jacket', 'sg-pants', 'sg-shorts', 'sg-hats', 'sg-socks', 'sg-shoes'];
  var NAME_KEY = { 'sg-tee': 'tee', 'sg-longtee': 'longtee', 'sg-hoodie': 'hoodie', 'sg-jacket': 'jacket', 'sg-pants': 'pants', 'sg-shorts': 'shorts', 'sg-hats': 'hats', 'sg-socks': 'socks', 'sg-shoes': 'shoes' };
  function presetName(id) { return K + 'row.' + NAME_KEY[id]; }

  /* 預設清單＝上面 9 份（只在「這個瀏覽器從來沒動過這份清單」時鋪一次；使用者刪光之後不會自己長回來，
     否則「刪光」這個狀態在原型上永遠測不到）。 */
  function seedList() {
    return ORDER.map(function (id) { return { id: id, nameKey: presetName(id), typeKey: K + 'type.apparelacc' }; });
  }
  var OLD_IDS = ['sg-tops', 'sg-bottoms', 'sg-hats'];

  /* 內容查找：使用者自建的指南沒有 content（彈窗用空白範本）；複製出來的帶著複本。 */
  function contentOf(g) {
    if (!g) return null;
    if (g.content) return g.content;
    return PRESETS[g.id] ? PRESETS[g.id].content : null;
  }

  /* cheat code「Data State＝Empty」＝全新帳號，什麼都還沒建立（devtools 把它寫在 <html data-data-state>）：
     沒動過清單時就是一份都沒有，不鋪示範三份；使用者在 Empty 下自己新增的仍存 localStorage、照常讀。
     （2026-09-11 使用者：「在 cheat code empty 的狀態下，尺寸指南並沒有顯示未設定的畫面」） */
  function emptyAccount() {
    try { return document.documentElement.getAttribute('data-data-state') === 'empty'; } catch (e) { return false; }
  }
  /* 舊資料遷移（2026-10-29）：瀏覽器存的若正好是舊三份沒動過的預設（sg-tops／sg-bottoms／sg-hats 且仍用 nameKey），
     換成新 9 份；其他情況（使用者改過名、增減過）原樣保留，不刪使用者資料。 */
  function isUntouchedOld(arr) {
    return arr.length === 3 && arr.every(function (g, i) { return g && g.id === OLD_IDS[i] && g.nameKey && !g.name; });
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null) return emptyAccount() ? [] : seedList();
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      if (isUntouchedOld(arr)) { var fresh = seedList(); try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) {} return fresh; }
      return arr;
    } catch (e) {
      return seedList();
    }
  }

  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.map(function (g) { if (!PRESETS[g.id] || !g.content) return g; var c = Object.assign({}, g); delete c.content; return c; }))); } catch (e) {}
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

  /* Data State 一切換（Empty ↔ 其他），沒動過清單的瀏覽器會在兩種答案之間翻面，通知消費頁重畫 */
  try { document.addEventListener('ztor:devstate-changed', function () { try { window.dispatchEvent(new CustomEvent(EVT, { detail: { list: read() } })); } catch (e) {} }); } catch (e) {}

  window.ZtorSizeGuides = {
    EVENT: EVT,
    list: function () { return read(); },
    count: function () { return read().length; },
    labelOf: labelOf,
    contentOf: contentOf,
    labels: function () { return read().map(labelOf).filter(Boolean); },
    get: function (id) { return read().filter(function (g) { return g.id === id; })[0] || null; },
    /* 預設內容（id → content）：即使清單被刪光，建立商品的「自訂專屬指南」編輯仍有範本可看 */
    preset: function (id) { return PRESETS[id] ? PRESETS[id].content : null; },
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
      var c = contentOf(list[i]);
      if (c) copy.content = JSON.parse(JSON.stringify(c));
      list.splice(i + 1, 0, copy);
      return write(list);
    },
    remove: function (id) {
      return write(read().filter(function (g) { return g.id !== id; }));
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} return write(read()); }
  };
}());
