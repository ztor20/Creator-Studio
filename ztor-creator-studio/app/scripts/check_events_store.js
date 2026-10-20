#!/usr/bin/env node
/* check_events_store.js — 逐筆驗算 js/events-store.js 假活動資料的內部一致性（回歸腳本）。

   出處（2026-08-19）：原本是一支放在 scratchpad 的一次性稽核腳本
   （audit-events-store.js），三路稽核用它抓出「活動清單連到詳情頁後各分頁假資料兜不起來」
   的問題（live 日期釘死過期、watchback 日期已過、taipei-nye 容量為 0、lrh-taichung 系列
   缺站、realive-world-tour 清單未分組、多處連結沒帶 id）。這批問題修完之後，把稽核腳本
   收進 repo（scratchpad 會揮發、下次沒得比對），改造成可重跑的回歸腳本，讓之後任何人
   改 events-store.js 都能一秒驗一次「有沒有把假資料改壞」。

   讀法：用最小 window/localStorage shim 把 events-store.js 當成瀏覽器腳本執行，
   讓 window.ztorEvents.list() 吐出「跟頁面實際拿到的一模一樣」的資料，不手抄逐筆核對。

   用法： node scripts/check_events_store.js（在 site/app 目錄下執行，或任何工作目錄皆可，
          路徑一律用 __dirname 推算，不依賴呼叫時的 cwd）
   輸出：stdout 印出每條不變量的違反筆數與明細，收尾印一行 PASS/FAIL 總結；
         FAIL 時 process.exitCode = 1，方便串進其他自動化流程判斷成敗。
         同時把結構化結果寫成 JSON 到同目錄 check_events_store.out.json，方便之後比對差異。

   2026-08-19 針對本次修法調整的判準（相對 scratchpad 原版）：
     · TODAY 改成執行當下真正的今天（new Date() 動態算），不再寫死日期字串——否則腳本本身
       會像先前的 events-store.js 一樣，寫完那天以後的「今天」就跟著過期。這也呼應
       events-store.js 新增的 todayStr()：兩邊的「今天」錨點邏輯必須一致，回歸腳本才驗得準。
     · 不變量 7（series 一致性）的「日期遞增」規則放寬為「不遞減」（允許同一天）：
       lrh-campus-ntu／lrh-campus-nccu 是刻意的「同天難兩場」設計（同一天中午、傍晚各一場），
       原本嚴格遞增的規則會把這個合法設計誤判成違反。放寬後同系列同一天仍算合格，
       只有日期真的往回走（第 2 站早於第 1 站）才算違反。
     · series.total 與實際同系列筆數的檢查沿用不變（本次沒有理由放寬——total 說謊比日期
       同天更嚴重，那是「宣稱有 N 站、其實沒那麼多」的資料錯誤，見本次修掉的 lrh-taichung
       原本自稱 6 站巡演卻只有 1 站在檔內）。

   2026-10-16 判準修正（UI-CHANGES 二百四十四，示範資料修正，D 類）：
     · 不變量 3（收入）改照規格口徑：5.1.6.3 §2.3「活動收入」含門票訂單與含本活動門票的組合包訂單（整組金額，D408），
       已撤銷的不算（§2.7 只加總已付款）。舊判準「Σ 票價 × 售出數」把經組合包賣出的票當成照票價直接賣，
       bookyay 三場因此被誤報、自建活動含組合包的六場反而漏抓。現在直接拿 store 自己的 transactions()＋
       bundleTransactions() 已付款金額加總（＝活動詳情 edRevTotals() 的算式）去比 event.revenue；
       bookyay 端取消的活動票券全數由 bookyay 撤銷，收入 0 是對的（不再誤報）。
     · 不變量 8a（組合包商品名）：products-store 的 nick 批早已改成 P_NICK = Object.assign(...) 組裝，
       舊的正則找 `P_NICK = {` 抽到 0 筆、全數誤報。改成用同一個瀏覽器替身把 products-store.js 真的跑一遍，
       default 與 nick 兩個 persona 的商品記錄都收進來比對。對不到同名商品的成員改列「資訊」不算違反——
       組合商品細節頁（bundle-detail.html）明確支援這種成員（對不到就包成不限量的示範商品），
       屬示範資料缺口、不是規則矛盾；名稱對得到但圖不一致才算違反。
     · 草稿：規格允許草稿帶日期與票種（5.1.6.1 §2 續填草稿、D294 決定二草稿可先設票種、D331 bookyay 帶入存成草稿），
       「草稿應無日期／無票種」兩條拿掉；只把「草稿日期已過」列成資訊（發布前檢核會擋，不是資料錯）。
     · 結果分「違反」與「資訊」兩級：違反才算 FAIL；資訊只列出供人判斷，寫在 out.json 的 info 欄。
*/
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var R2_DIR = path.join(__dirname, '..');
var EVENTS_STORE = path.join(R2_DIR, 'js/events-store.js');
var PRODUCTS_STORE = path.join(R2_DIR, 'js/products-store.js');

// ── 今天：動態算，理由見檔頭 2026-08-19 註記 ──
function todayStr() {
  var d = new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
var TODAY = todayStr();

// ── 最小瀏覽器 shim ──────────────────────────────────────────
function makeWindow() {
  var store = {};
  var win = {};
  win.localStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  };
  win.window = win;
  /* 2026-10-15（D424 決定 17）：events-store.js 之後會讀 location.pathname（建立活動頁的暫存清理）、
     也可能碰到 document／sessionStorage／console——補最小替身，否則腳本一啟動就 ReferenceError 跑不起來。
     pathname 設成中性的 /index.html，不觸發任何頁面專屬分支；document 只給事件掛載與查詢的空實作。 */
  win.location = { pathname: '/index.html', search: '', hash: '', href: 'http://localhost/index.html' };
  win.sessionStorage = {
    getItem: function () { return null; }, setItem: function () {}, removeItem: function () {}
  };
  win.document = {
    readyState: 'complete',
    addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () { return true; },
    querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    getElementById: function () { return null; },
    documentElement: { lang: 'en', getAttribute: function () { return null; }, setAttribute: function () {} }
  };
  win.addEventListener = function () {}; win.removeEventListener = function () {};
  win.dispatchEvent = function () { return true; };
  win.CustomEvent = function (type, init) { this.type = type; this.detail = init && init.detail; };
  win.console = console;
  win.Date = Date; win.Math = Math; win.JSON = JSON;
  return win;
}

function loadScriptIntoWindow(win, file) {
  var code = fs.readFileSync(file, 'utf8');
  var ctx = vm.createContext(win);
  vm.runInContext(code, ctx, { filename: file });
}

var evWin = makeWindow();
loadScriptIntoWindow(evWin, EVENTS_STORE);
var EVENTS = evWin.window.ztorEvents.list();

console.log('=== 環境檢查 ===');
console.log('今天（動態）：', TODAY);
console.log('events-store 載入活動數：', EVENTS.length);

// products-store.js：用同一個瀏覽器替身真的執行一次，兩個 persona 各跑一遍（2026-10-16 改寫，理由見檔頭）。
// 檔尾的 document.addEventListener 由替身吃掉；ZTOR_PRODUCTS 是當前 persona 的商品表（含別名，同一筆記錄可能有多個 key）。
function loadProducts(persona) {
  var w = makeWindow();
  w.localStorage.setItem('ztor.persona', persona);
  loadScriptIntoWindow(w, PRODUCTS_STORE);
  var P = w.ZTOR_PRODUCTS || {};
  return Object.keys(P).map(function (k) { return { name: P[k].name, img: P[k].img }; })
    .filter(function (p) { return p.name; });
}
var defaultProducts = loadProducts('default');
var nickProducts = loadProducts('nick');
var allKnownProducts = nickProducts.concat(defaultProducts);
console.log('products-store nick 商品記錄：', nickProducts.length, '筆（含別名）');
console.log('products-store default 商品記錄：', defaultProducts.length, '筆（含別名）');
console.log('');

// ── 結果收集 ─────────────────────────────────────────────────
var findings = {}; // invariant key -> { violations: [...], info: [...] }
function record(key, violations, note, info) {
  findings[key] = { violations: violations, note: note || '', info: info || [] };
}

// ── 不變量 1：已退場（2026-09-30 D340）──────────────────────────
// 原本比對 Σ(tiers[].qty) 與 capacity。容量已刪除（5.1.6.1 F8 退場），活動總量＝Σ(tiers[].qty)（含隱藏）本身，
// 沒有第二個數字可比；key 留著、恆為 0 筆，讓 check_events_store.out.json 的欄位對得上舊紀錄。
record('1_qty_vs_capacity', [], 'D340 容量刪除，本條退場');

// ── 不變量 2a：sold ≤ 門票張數合計（D340 起取代 sold ≤ capacity）──────────
(function () {
  var v = [];
  EVENTS.forEach(function (e) {
    var total = (e.tiers || []).reduce(function (s, t) { return s + (t.qty || 0); }, 0);
    if (!(e.tiers && e.tiers.length)) return;
    if ((e.sold || 0) > total) {
      v.push(e.id + '：sold=' + e.sold + ' > Σqty=' + total);
    }
  });
  record('2a_sold_vs_capacity', v, 'D340 起分母＝門票張數合計（含隱藏）');
})();

// ── 不變量 2b：Σ(tier.sold) vs event.sold（用 store 自帶的 soldOf() 邏輯對照）──
(function () {
  var v = [];
  EVENTS.forEach(function (e) {
    var tierSoldSum = (e.tiers || []).reduce(function (s, t) { return s + (t.sold || 0); }, 0);
    if (tierSoldSum !== (e.sold || 0)) {
      v.push(e.id + '：Σtier.sold=' + tierSoldSum + ' ≠ event.sold=' + e.sold);
    }
  });
  record('2b_tier_sold_sum_vs_event_sold', v);
})();

// ── 不變量 3：event.revenue vs 規格口徑的活動收入（2026-10-16 改寫，見檔頭）──
// 期望值＝store 的 transactions()＋bundleTransactions() 裡已付款的金額加總（活動詳情 edRevTotals().total 同一算式）；
// 沒有交易的階段（草稿、已排程）期望 0。另附「票價 ×（售出 − 經組合包賣出）＋ 組合售價 × 組數」的手算值方便對照。
(function () {
  var v = [];
  var S = evWin.window.ztorEvents;
  EVENTS.forEach(function (e) {
    var tx = S.transactions(e.id).concat(S.bundleTransactions ? S.bundleTransactions(e.id) : []);
    var paid = tx.filter(function (t) { return t.status === 'paid'; }).reduce(function (s, t) { return s + (t.gross || 0); }, 0);
    if (paid !== (e.revenue || 0)) {
      var viaBundle = {};
      (e.bundles || []).forEach(function (b) {
        var tk = S.bundleTickets(b);
        if (tk.tierIds[0]) viaBundle[tk.tierIds[0]] = (viaBundle[tk.tierIds[0]] || 0) + (b.sold || 0) * (tk.qty || 1);
      });
      var hand = (e.tiers || []).reduce(function (s, t) { return s + (t.price || 0) * ((t.sold || 0) - (viaBundle[t.id] || 0)); }, 0) +
                 (e.bundles || []).reduce(function (s, b) { return s + (b.price || 0) * (b.sold || 0); }, 0);
      v.push(e.id + '（' + e.status + '）：已付款交易合計=' + paid + ' ≠ event.revenue=' + e.revenue + '（差 ' + ((e.revenue || 0) - paid) + '；手算 門票＋組合包=' + hand + '）');
    }
  });
  record('3_revenue_vs_paid_transactions', v, '口徑：5.1.6.3 §2.3 活動收入含組合包整組金額（D408）、只算已付款（§2.7）');
})();

// ── 不變量 4：日期 vs 狀態（live 一律＝今天，見檔頭 2026-08-19 註記）───
(function () {
  var v = [], info = [];
  var todayMs = Date.parse(TODAY + 'T00:00:00');
  EVENTS.forEach(function (e) {
    var status = e.status;
    var dateStr = e.date;
    if (status === 'draft') {
      // 規格允許草稿帶日期（見檔頭 2026-10-16）；只有日期已過列成資訊——發布前檢核會擋，不是資料錯
      if (dateStr && Date.parse(dateStr + 'T00:00:00') < todayMs) info.push(e.id + '（draft）：日期 ' + dateStr + ' 已過（發布時會被擋，草稿本身合法）');
      return;
    }
    if (!dateStr) {
      v.push(e.id + '（' + status + '）：非草稿卻無日期');
      return;
    }
    var dMs = Date.parse(dateStr + 'T00:00:00');
    if (isNaN(dMs)) { v.push(e.id + '：日期格式無法解析 ' + dateStr); return; }
    if (status === 'ended') {
      if (dMs >= todayMs) v.push(e.id + '（ended）：日期 ' + dateStr + ' 不在過去（today=' + TODAY + '）');
    } else if (status === 'scheduled') {
      if (dMs <= todayMs) v.push(e.id + '（scheduled）：日期 ' + dateStr + ' 不在未來');
    } else if (status === 'live') {
      // live 的 date 必須「＝今天」：events-store.js 已改用 todayStr() 動態產生，
      // 這裡若不等於今天，代表 store 又有筆漏改回寫死日期。
      if (dateStr !== TODAY) v.push(e.id + '（live）：日期 ' + dateStr + ' ≠ 今天 ' + TODAY);
    } else if (status === 'on-sale') {
      // 售票中的合理性：一般應為未來或今天（正在賣的場次過去售票中極不合理）
      if (dMs < todayMs) v.push(e.id + '（on-sale）：日期 ' + dateStr + ' 已在過去，售票中卻已過期');
    }
    // D457（2026-10-20）：已取消階段退場，原「已取消日期不拘」慣例隨之移除；已封存不是階段，照原階段斷言
  });
  record('4_date_vs_status', v, '', info);
})();

// ── 不變量 5：doors 早於 start；start/end 時間格式一致 ────────
(function () {
  var v = [];
  var timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
  function toMin(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(s);
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }
  EVENTS.forEach(function (e) {
    ['start', 'end', 'doors'].forEach(function (f) {
      var val = e[f];
      if (val && !timeRe.test(val)) {
        v.push(e.id + '：' + f + '="' + val + '" 格式不是 HH:MM(24h)');
      }
    });
    if (e.doors && e.start) {
      var dm = toMin(e.doors), sm = toMin(e.start);
      if (dm != null && sm != null && dm >= sm) {
        v.push(e.id + '：doors=' + e.doors + ' 不早於 start=' + e.start);
      }
    }
    /* 跨日活動（2026-09-29 D328）：有 endDate 的活動結束在另一天，比「日期＋時間」而不是只比時間 */
    if (e.endDate) {
      if (e.date && (e.endDate + ' ' + (e.end || '23:59')) <= (e.date + ' ' + (e.start || '00:00'))) {
        v.push(e.id + '：跨日結束 ' + e.endDate + ' ' + (e.end || '') + ' 不晚於開始 ' + e.date + ' ' + (e.start || ''));
      }
    } else if (e.start && e.end) {
      var sm2 = toMin(e.start), em2 = toMin(e.end);
      if (sm2 != null && em2 != null && em2 <= sm2) {
        v.push(e.id + '：end=' + e.end + ' 不晚於 start=' + e.start);
      }
    }
  });
  record('5_doors_start_end', v);
})();

// ── 不變量 6：線上類型不帶實體場地；實體類型必有場地 ──────────
(function () {
  var v = [];
  var ONLINE_TYPES = ['virtual', 'watchparty'];
  EVENTS.forEach(function (e) {
    var isOnline = ONLINE_TYPES.indexOf(e.type) >= 0;
    if (isOnline) {
      if (e.address) v.push(e.id + '（' + e.type + '/online）：帶有 address="' + e.address + '"，線上活動不該有實體地址');
      if (e.venue && e.venue !== 'Online' && e.venue !== '') {
        v.push(e.id + '（' + e.type + '/online）：venue="' + e.venue + '"，不是 "Online"');
      }
      if (e.city) v.push(e.id + '（' + e.type + '/online）：帶有 city="' + e.city + '"');
    } else {
      // 實體類型（concert/festival/meet）必有場地——draft 狀態允許場地留白（尚未走完建立流程）
      if (e.status !== 'draft') {
        if (!e.venue) v.push(e.id + '（' + e.type + '）：非草稿卻無 venue');
        if (!e.city) v.push(e.id + '（' + e.type + '）：非草稿卻無 city');
      }
    }
  });
  record('6_online_vs_physical_venue', v);
})();

// ── 不變量 7：series 一致性（日期規則見檔頭 2026-08-19「放寬為不遞減」）──
(function () {
  var v = [];
  var groups = {};
  EVENTS.forEach(function (e) {
    if (e.series && e.series.id) {
      groups[e.series.id] = groups[e.series.id] || [];
      groups[e.series.id].push(e);
    } else if (e.series && !e.series.id) {
      v.push(e.id + '：series 物件存在但缺 series.id（' + JSON.stringify(e.series) + '）');
    }
  });
  Object.keys(groups).forEach(function (sid) {
    var arr = groups[sid];
    // index 是否連續、從 1 開始、total 是否等於 arr.length、name 是否一致
    var indices = arr.map(function (e) { return e.series.index; }).sort(function (a, b) { return a - b; });
    var expected = [];
    for (var i = 1; i <= arr.length; i++) expected.push(i);
    var indicesOk = JSON.stringify(indices) === JSON.stringify(expected);
    if (!indicesOk) {
      v.push('series ' + sid + '：index 集合 [' + indices.join(',') + '] 與期望的連續 1..' + arr.length + ' 不符（' + arr.map(function(e){return e.id+'#'+e.series.index;}).join(', ') + '）');
    }
    var totals = arr.map(function (e) { return e.series.total; });
    var totalMismatch = totals.some(function (t) { return t !== arr.length; });
    if (totalMismatch) {
      v.push('series ' + sid + '：series.total 與實際同系列筆數 ' + arr.length + ' 不符（各筆 total=' + totals.join(',') + '）');
    }
    var names = arr.map(function (e) { return e.series.name; });
    var nameMismatch = names.some(function (n) { return n !== names[0]; });
    if (nameMismatch) {
      v.push('series ' + sid + '：series.name 不一致（' + names.join(' / ') + '）');
    }
    // 日期不遞減（依 index 排序後日期不得往回走；允許同一天——lrh-campus 同天雙場是刻意設計；
    // draft 系列日期皆空，跳過日期檢查）
    var sorted = arr.slice().sort(function (a, b) { return a.series.index - b.series.index; });
    for (var k = 1; k < sorted.length; k++) {
      var prevD = sorted[k - 1].date, curD = sorted[k].date;
      if (prevD && curD && Date.parse(curD) < Date.parse(prevD)) {
        v.push('series ' + sid + '：' + sorted[k - 1].id + '(' + prevD + ') → ' + sorted[k].id + '(' + curD + ') 日期往回走（非同天、非遞增）');
      }
    }
    // 母子欄位齊全：hasPage 只在一部分系列出現，屬設計選項，只記錄不當違反
  });
  record('7_series_consistency', v);
})();

// ── 不變量 8a：bundles.products 的 name/img 與 products-store 對得上（2026-10-16 改寫，見檔頭）──
(function () {
  var v = [], info = [], seenInfo = {};
  var nameSet = {};
  allKnownProducts.forEach(function (p) {
    nameSet[p.name] = nameSet[p.name] || [];
    if (nameSet[p.name].indexOf(p.img) < 0) nameSet[p.name].push(p.img);
  });
  EVENTS.forEach(function (e) {
    (e.bundles || []).forEach(function (b) {
      (b.products || []).forEach(function (p) {
        var known = nameSet[p.name];
        if (!known) {
          info.push(e.id + ' / bundle ' + b.id + '：「' + p.name + '」不在 products-store（組合商品細節頁會包成不限量的示範商品）');
          return;
        }
        var imgFile = String(p.img || '').replace(/^images\/products\//, '');
        if (known.indexOf(imgFile) < 0) {
          v.push(e.id + ' / bundle ' + b.id + '：product "' + p.name + '" 的 img="' + p.img + '"（檔名 ' + imgFile + '）與 products-store 記錄的 img（' + known.join(', ') + '）不符');
        }
      });
    });
  });
  record('8a_bundle_products_match_store', v, '名稱對得到但圖不一致＝違反；名稱對不到＝資訊（示範資料缺口）', info);
})();

// ── 不變量 8b：圖片路徑實際存在（keyvisual/banner/gallery + bundle product img）──
(function () {
  var v = [];
  function checkPath(id, field, rel) {
    if (!rel) return;
    var abs = path.join(R2_DIR, rel);
    if (!fs.existsSync(abs)) {
      v.push(id + '：' + field + '="' + rel + '" 檔案不存在（' + abs + '）');
    }
  }
  EVENTS.forEach(function (e) {
    if (e.images) {
      checkPath(e.id, 'images.keyvisual', e.images.keyvisual);
      checkPath(e.id, 'images.banner', e.images.banner);
      (e.images.gallery || []).forEach(function (g, i) { checkPath(e.id, 'images.gallery[' + i + ']', g); });
    }
    (e.bundles || []).forEach(function (b) {
      (b.products || []).forEach(function (p) { checkPath(e.id, 'bundle ' + b.id + ' product img', p.img); });
    });
  });
  record('8b_image_files_exist', v);
})();

// ── 不變量 9：同名活動、重複 id、id 命名規則一致性 ─────────────
(function () {
  var v = [];
  var idCount = {};
  EVENTS.forEach(function (e) { idCount[e.id] = (idCount[e.id] || 0) + 1; });
  Object.keys(idCount).forEach(function (id) {
    if (idCount[id] > 1) v.push('重複 id："' + id + '" 出現 ' + idCount[id] + ' 次');
  });
  // 命名規則：全部小寫、以連字號分隔、無空白/大寫/底線
  var idRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  EVENTS.forEach(function (e) {
    if (!idRe.test(e.id)) v.push(e.id + '：id 不符合 kebab-case 命名規則');
  });
  // 同名活動（name 完全相同）——同系列本就刻意同名，先分組排除同 series.id 的情況再看有無「非系列却同名」
  var nameGroups = {};
  EVENTS.forEach(function (e) {
    nameGroups[e.name] = nameGroups[e.name] || [];
    nameGroups[e.name].push(e);
  });
  Object.keys(nameGroups).forEach(function (name) {
    var arr = nameGroups[name];
    if (arr.length > 1) {
      var seriesIds = arr.map(function (e) { return e.series && e.series.id; });
      var allSameSeries = seriesIds.every(function (s) { return s && s === seriesIds[0]; });
      if (!allSameSeries) {
        v.push('同名但非同一 series：name="' + name + '"，ids=[' + arr.map(function(e){return e.id;}).join(', ') + ']，series.id=[' + seriesIds.join(', ') + ']');
      }
      // 即使同系列，也列一筆資訊供人判斷是否過度雷同（非錯誤，僅記錄）
    }
  });
  record('9_id_name_consistency', v);
})();

// ── 額外檢查：tiers[].sold ≤ tiers[].qty（雖然不在原 9 條清單，但是 2b/1 的基礎，一併驗）──
(function () {
  var v = [];
  EVENTS.forEach(function (e) {
    (e.tiers || []).forEach(function (t) {
      if ((t.sold || 0) > (t.qty || 0)) {
        v.push(e.id + ' / tier ' + t.id + '：sold=' + t.sold + ' > qty=' + t.qty);
      }
    });
  });
  record('extra_tier_sold_vs_qty', v);
})();

// ── 額外檢查：type → category 對照表是否符合檔頭註解的唯一出處 ──
(function () {
  var v = [];
  var MAP = { concert: 'concert', festival: 'concert', meet: 'fans-meet', launch: 'fans-meet', virtual: 'online', watchparty: 'online' };
  EVENTS.forEach(function (e) {
    var expect = MAP[e.type];
    if (expect && e.category !== expect) {
      v.push(e.id + '：type=' + e.type + ' 依對照表應為 category=' + expect + '，實際=' + e.category);
    }
    if (!expect) {
      v.push(e.id + '：type="' + e.type + '" 不在檔頭對照表六個 type 之中');
    }
  });
  record('extra_type_category_map', v);
})();

// ── 額外檢查：scheduled 是否至少 1 種票（草稿帶票種合法，2026-10-16 拿掉草稿那條，見檔頭）──
(function () {
  var v = [];
  EVENTS.forEach(function (e) {
    if (e.status === 'scheduled' && (!e.tiers || e.tiers.length === 0)) {
      v.push(e.id + '（scheduled）：tiers 為空——依檔頭 2026-08-18 修正註解，已排程活動票種為必填');
    }
  });
  record('extra_draft_scheduled_tier_rule', v);
})();

// ── 額外檢查：'live' 狀態的 startedMinutesAgo / arrivedAtOpen 是否有明顯超界 ──
(function () {
  var v = [];
  EVENTS.forEach(function (e) {
    if (e.status === 'live') {
      var total = (e.tiers || []).reduce(function (s, t) { return s + (t.qty || 0); }, 0);   // D340：容量已刪，改比門票張數合計
      if (e.arrivedAtOpen != null && e.arrivedAtOpen > total) {
        v.push(e.id + '：arrivedAtOpen=' + e.arrivedAtOpen + ' > Σqty=' + total);
      }
      if (e.arrivedAtOpen != null && e.sold != null && e.arrivedAtOpen > e.sold) {
        v.push(e.id + '：arrivedAtOpen=' + e.arrivedAtOpen + ' > sold=' + e.sold + '（到場數不該超過售出數）');
      }
    }
  });
  record('extra_live_roster_bounds', v);
})();

// ── 輸出 ─────────────────────────────────────────────────────
console.log('=== 逐條不變量結果 ===');
var totalViolations = 0, totalInfo = 0;
Object.keys(findings).forEach(function (k) {
  var f = findings[k];
  totalViolations += f.violations.length;
  totalInfo += f.info.length;
  console.log('[' + k + '] 違反 ' + f.violations.length + ' 筆' + (f.info.length ? '，資訊 ' + f.info.length + ' 筆' : ''));
  f.violations.forEach(function (line) { console.log('  - ' + line); });
  f.info.forEach(function (line) { console.log('  · 資訊：' + line); });
});

console.log('');
if (totalViolations === 0) {
  console.log('=== PASS：全部不變量皆通過，0 筆違反' + (totalInfo ? '（另有 ' + totalInfo + ' 筆資訊級項目，不算違反）' : '') + ' ===');
} else {
  console.log('=== FAIL：共 ' + totalViolations + ' 筆違反，見上方明細 ===');
  process.exitCode = 1;
}

var outJson = {
  generatedAt: new Date().toISOString(),
  today: TODAY,
  eventCount: EVENTS.length,
  totalViolations: totalViolations,
  totalInfo: totalInfo,
  findings: findings
};
var outPath = path.join(__dirname, 'check_events_store.out.json');
fs.writeFileSync(outPath, JSON.stringify(outJson, null, 2));
console.log('');
console.log('結構化結果已寫入：' + outPath);
