/* js/ticket-bundle.js — 票務商品（含票券的組合包）的時間層級與購買條件（D342，2026-10-01）
   ============================================================================
   規格本體：documents/0-設計規格書.md §7.14「活動販售的時間層級」「票務商品的購買條件」；
   落點：5.1.6.1 F12b／F20／F22／F23、5.1.5.9 §2.3、5.1.5.4 F2／F6。
   三個消費頁共用這一支，不各寫一份規則：
     · create-event.html   第 6 步票務商品（經 js/bundle-editor.js 的 SPLIT 版型）＋第 5 步單張門票的限時間校驗
     · bundle-detail.html  組合商品細節頁（含票券成員時：上架與開賣跟隨或另設、購買條件與限購）
     · create-bundle.html  建立組合（含票券成員時：上架與開賣跟隨或另設、購買條件唯讀預設）

   規則（只呈現上游已寫定的，〔推導〕者照規格做，不另立規則）：
     · 第一層＝活動上架區間（上架到下架）最大；售票期間、單張門票的限時間、票務商品的四個排程時間都要在其內，
       超出擋存並就地提示。活動選「立刻上架」時起點是發布當下——早於發布當下算不算超出〔產品待確認 #1〕，
       原型不擋起點（ASSUMPTIONS D342-02）。下架不填＝沒有終點。
     · 第二層＝活動售票期間（開賣到停售；開賣不填＝上架即開賣、停售不填＝賣到活動開始）。
     · 票務商品四個排程時間逐欄「跟隨活動／另設」：跟隨＝即時連動活動的值（停售跟隨時連同「賣到活動開始」一起跟）；
       另設＝自己的值，須在上架區間內、可以早於活動開賣。
     · 購買條件與限購：預設取所含門票最嚴（分級取最高、限時間取各門票可購買時間的交集、限購取最小，限購以張計
       ÷ n 取整成套）；交集為空擋存。調整時分級與限購只能收窄；限時間可在上架區間內任調。
     · 限購最低 1 組（D342 同日補充）：每人總限購換算成套不足 1 組（門票限購張數 < 每套張數 n）時，
       跟隨或另設都一樣擋存，就地說明是哪張門票、怎麼改（調高門票限購到 ≥ n，或改每套張數）；手動輸入的限購最低 1 組。

   狀態形狀（掛在消費頁自己的物件上，例如 bundle-editor 的 b、bundle-detail 的 bundleModel）：
     st.sched = { listAt, unlistAt, saleStart, saleEnd }  每格 null＝跟隨活動、字串＝另設（'YYYY-MM-DDTHH:MM'；'' ＝另設但還沒填）
     st.rules = null（跟隨所含門票）｜{ on, cond, tier, from, to, cap, person }（已調整；person 以「組」計）
   D456（2026-10-20）：組合包的限購不再跟門票、不再取交集或只能收窄，預設不限、自己設定、獨立計算（js/purchase-limits.js）；
  本檔下面「購買條件與限購」的限購分支（非 buyOnly）本來就沒有消費者，現在規則也已失效，只留舊資料相容，不要再接。購買條件（分級、限時間）不變。
  D427（2026-10-16）：限購只留每人總限購數量——本檔的每次交易限購（order）與限購次數（times）整組移除（墓碑），
   舊資料若帶 order／times 一律忽略。
   活動時間（et，由 times(ev) 或頁面自己組）：{ listFrom, listTo, listNow, saleFrom, saleTo, start, draft, shown, unlisted }

   D398（2026-10-12）：限購擴及所有組合包、預設取所有成員（含商品成員）的交集，改由 js/purchase-limits.js 的組合包限購區塊負責；
   bundle-detail 與 create-bundle 呼叫 rulesHTML／syncErrors／errorCount 時帶 buyOnly（ctx.buyOnly），這裡只剩購買條件。
   建立活動的組合包彈窗（js/bundle-editor.js）2026-10-12 也改接（UI-CHANGES 一百八十八）：三個消費頁都帶 buyOnly，
   本檔的限購分支（非 buyOnly）目前沒有消費者，留著不刪（舊資料 rules.cap 由 purchase-limits.fromRules 相容讀取）。

   活動設定是最高優先層級（D363，2026-10-07；主規格 §7.14「三個狀態開關」）——三個消費頁與電子商店清單共用同一口徑：
     · 顯示：活動隱藏（et.shown === false）時，含其票券的組合包在電子商店一律不顯示、自己的顯示開關不能切成顯示；
       組合包自己的顯示值保留，活動切回顯示後照它自己的開關（evHidden(et)）。
     · 上架：活動已下架（et.unlisted）時組合包不能上架（canList 由消費頁併入）。
     · 開賣：組合包與單張門票的販售結束時間不能晚於活動停售（停售不填＝活動開始）——lateEnd(v, et)；
       唯一例外是提前販售：開始時間可以早於活動開賣，只要還在上架區間內（outside() 照舊只看上架區間）。
   ============================================================================ */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var KEYS = ['listAt', 'unlistAt', 'saleStart', 'saleEnd'];
  /* 分級門檻由低到高（與 create-event 的 FAN_TIERS 同一套，那邊是高→低） */
  var TIER_RANK = { fan: 1, devoted: 2, superfan: 3, inner: 4 };
  var TIERS_HI = ['inner', 'superfan', 'devoted', 'fan'];

  /* ── 時間 ─────────────────────────────────────────────────────────── */
  function ms(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(v || '').trim());
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime() : NaN;
  }
  function local(v) {
    var m = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/.exec(String(v || '').trim());
    return m ? m[1] + 'T' + (m[2] || '00:00') : '';
  }
  function fmt(v) { var l = local(v); return l ? l.replace(/-/g, '/').replace('T', ' ') : ''; }
  var fin = function (n) { return typeof n === 'number' && isFinite(n); };

  /* events-store 的活動紀錄 → 活動時間。listing＝{ from, to }（D342 示範欄位；缺＝立刻上架、不自動下架）。 */
  function times(ev) {
    ev = ev || {};
    var lst = ev.listing || {}, sale = ev.sale || {};
    return {
      listFrom: local(lst.from), listTo: local(lst.to), listNow: !lst.from,
      saleFrom: local(sale.from), saleTo: local(sale.to),
      start: ev.date ? local(ev.date + ' ' + (ev.start || '00:00')) : '',
      draft: ev.status === 'draft',
      /* D363：活動的顯示設定（ev.publish.shown，缺值＝顯示）與是否已下架（ev.unlisted，D361 決定五） */
      shown: !(ev.publish && ev.publish.shown === false),
      unlisted: !!ev.unlisted
    };
  }
  /* D363 決定二：活動隱藏中 → 組合包跟著隱藏（et 缺 shown 欄＝顯示） */
  function evHidden(et) { return !!et && et.shown === false; }
  /* D363 決定三：販售結束的上限＝活動停售；停售不填＝賣到活動開始。回傳上限（local 字串）或 ''（沒有上限）。 */
  function saleCeil(et) { return (et && (et.saleTo || et.start)) || ''; }
  /* 結束時間晚於活動停售 → true。只管「結束端」：開始端可以早於活動開賣（提前販售），由 outside() 管上架區間。 */
  function lateEnd(v, et) {
    var t = ms(v), c = ms(saleCeil(et));
    return fin(t) && fin(c) && t > c;
  }
  function lateText(et, T) { return T('tb.err.saleend.late').replace('{t}', fmt(saleCeil(et))); }
  /* 'before'｜'after'｜null。起點未知（立刻上架）不擋（〔產品待確認 #1〕）；活動未發布（draft 且沒有上架區間）不擋。 */
  function outside(v, et) {
    var t = ms(v);
    if (!fin(t) || !et) return null;
    var a = ms(et.listFrom), b = ms(et.listTo);
    if (fin(a) && t < a) return 'before';
    if (fin(b) && t > b) return 'after';
    return null;
  }
  function periodText(et, T) {
    var a = et && et.listFrom ? fmt(et.listFrom) : T('tb.period.now');
    var b = et && et.listTo ? fmt(et.listTo) : T('tb.period.noend');
    return a + ' – ' + b;
  }
  /* 跟隨時的值（local 字串，'' ＝沒有具體時間、由下方 followText 交代意思） */
  function eventValue(key, et) {
    et = et || {};
    if (key === 'listAt') return et.listFrom || '';
    if (key === 'unlistAt') return et.listTo || '';
    if (key === 'saleStart') return et.saleFrom || '';
    if (key === 'saleEnd') return et.saleTo || et.start || '';   // 停售跟隨＝賣到活動開始（〔推導〕連同預設一起跟）
    return '';
  }
  function followText(key, et, T) {
    et = et || {};
    if (key === 'listAt') return et.listFrom ? fmt(et.listFrom) : T('tb.follow.list.now');
    if (key === 'unlistAt') return et.listTo ? fmt(et.listTo) : T('tb.follow.unlist.none');
    if (key === 'saleStart') return et.saleFrom ? fmt(et.saleFrom) : T('tb.follow.sale.atlist');
    if (key === 'saleEnd') return et.saleTo ? fmt(et.saleTo)
      : (et.start ? T('tb.follow.saleend.start').replace('{t}', fmt(et.start)) : T('tb.follow.saleend.start0'));
    return '';
  }
  function sched(st) { return (st && st.sched) || {}; }
  function isCustom(st, key) { var s = sched(st)[key]; return s !== null && s !== undefined; }
  function effective(st, et) {
    var o = {};
    KEYS.forEach(function (k) { o[k] = isCustom(st, k) ? local(sched(st)[k]) : eventValue(k, et); });
    return o;
  }
  function schedErrors(st, et, T) {
    var e = {}, eff = effective(st, et);
    KEYS.forEach(function (k) {
      if (!isCustom(st, k)) return;
      var v = sched(st)[k];
      if (!String(v || '').trim()) { e[k] = T('tb.err.empty'); return; }
      if (outside(v, et)) e[k] = T('tb.err.outside').replace('{period}', periodText(et, T));
      else if (k === 'saleEnd' && lateEnd(v, et)) e[k] = lateText(et, T);   /* D363：停售不能晚於活動停售 */
    });
    if (!e.unlistAt && isCustom(st, 'unlistAt') && fin(ms(eff.listAt)) && ms(eff.unlistAt) <= ms(eff.listAt)) e.unlistAt = T('tb.err.unlist.order');
    if (!e.saleEnd && (isCustom(st, 'saleEnd') || isCustom(st, 'saleStart')) && fin(ms(eff.saleStart)) && fin(ms(eff.saleEnd)) && ms(eff.saleEnd) <= ms(eff.saleStart)) {
      e[isCustom(st, 'saleEnd') ? 'saleEnd' : 'saleStart'] = T('tb.err.sale.order');
    }
    return e;
  }
  var LABEL = { listAt: 'tb.f.listAt', unlistAt: 'tb.f.unlistAt', saleStart: 'tb.f.saleStart', saleEnd: 'tb.f.saleEnd' };
  /* 兩兩一組（2026-10-12 使用者：「上下架的日期與時間一個開關，開賣的一個開關」）：上架＋下架一條外框、開賣＋停售一條外框，
     每條外框右側一顆「跟隨活動」開關（開＝兩格都跟隨、關＝兩格都另設，無狀態字）；跟隨時框內兩行讀數（活動那兩格的值），
     另設時換成兩個時間欄。資料仍是逐格 st.sched[key]（null＝跟隨）：舊資料兩格狀態不同時，該組當作「另設」顯示，
     跟隨的那格先以活動的值當時間欄的值。 */
  var GROUPS = [['listAt', 'unlistAt'], ['saleStart', 'saleEnd']];
  var GROUP_TITLE = { listAt: 'tb.g.list', saleStart: 'tb.g.sale' };
  var SHORT = { listAt: 'tb.f.s.listAt', unlistAt: 'tb.f.s.unlistAt', saleStart: 'tb.f.s.saleStart', saleEnd: 'tb.f.s.saleEnd' };
  function groupHTML(st, keys, et, T, opts) {
    var custom = keys.some(function (k) { return isCustom(st, k); }), dis = opts && opts.disabled;
    var title = GROUP_TITLE[keys[0]] ? T(GROUP_TITLE[keys[0]]) : T(LABEL[keys[0]]);
    var body = keys.map(function (k) {
      var v = custom
        ? '<div class="field follow-field__field"><label class="field__label">' + esc(T(LABEL[k])) + '</label>' +
          '<input class="input" type="datetime-local" data-tb-at="' + k + '" value="' + esc(local(isCustom(st, k) ? sched(st)[k] : eventValue(k, et))) + '"' + (dis ? ' disabled' : '') + '></div>'
        : '<div class="follow-field__line"><span class="follow-field__k">' + esc(T(SHORT[k])) + '</span><span class="follow-field__v">' + esc(followText(k, et, T)) + '</span></div>';
      return v + '<p class="field__error" data-tb-err="' + k + '" hidden></p>';
    }).join('');
    return '<div class="follow-field" data-tb-sched="' + keys.join(',') + '" data-state="' + (custom ? 'custom' : 'follow') + '">' +
      '<div class="follow-field__head">' +
        '<div class="follow-field__txt"><span class="follow-field__t">' + esc(title) + '</span></div>' +
        '<span class="follow-field__follow"><span>' + esc(T('tb.follow')) + '</span>' +
          '<div class="switch' + (custom ? '' : ' switch--on') + (dis ? ' switch--disabled' : '') + '" role="switch" tabindex="0" aria-checked="' + (!custom) + '"' + (dis ? ' aria-disabled="true"' : '') +
            ' aria-label="' + esc(T('tb.follow') + ' · ' + title) + '" data-tb-follow="' + keys.join(',') + '" data-tb-v="' + (custom ? 'follow' : 'custom') + '"></div></span>' +
      '</div>' +
      '<div class="follow-field__body">' + body + '</div>' +
    '</div>';
  }
  /* keys：只畫哪幾格（bundle-detail 的上架卡畫 listAt／unlistAt、開賣卡畫 saleStart／saleEnd） */
  function schedHTML(st, et, T, opts) {
    opts = opts || {};
    var keys = opts.keys || KEYS;
    return '<div class="follow-fields">' +
      GROUPS.map(function (g) { return g.filter(function (k) { return keys.indexOf(k) >= 0; }); })
        .filter(function (g) { return g.length; })
        .map(function (g) { return groupHTML(st, g, et, T, opts); }).join('') +
      (opts.note === false ? '' : '<p class="field__hint">' + esc(T('tb.sched.note').replace('{period}', periodText(et, T))) + '</p>') +
    '</div>';
  }

  /* ── 購買條件與限購 ───────────────────────────────────────────────── */
  var posInt = function (v) { var n = Math.floor(Number(v)); return isFinite(n) && n > 0 ? n : null; };
  /* 單張門票的規則形狀（D366／D367，2026-10-07 起＝「新增條件」）：
       { conds: { buyTime{from,to}, buyTier{tier}, cap{person}, disc{price}, discTime{price,from,to},
                  discTier{price,tier}, discBoth{price,from,to,tier} } }——每種條件最多一個、沒加就沒有那個鍵；
       bookyay 帶入的條件另帶 bky:true（鎖定）。折扣一律存固定價 price（D367），百分比只是顯示。
     ruleConds()＝舊形狀轉換器：2026-10-07 以前的 { buy{mode,…}, cap{mode,…}, disc{mode,pct,…} }（events-store 舊示範、
     舊草稿）照原意轉成新形狀；舊的折扣只有 % 沒有價格，轉成 pct 欄位，由消費端用票價換算（condPrice）。
     D368（2026-10-07）：活動層的折扣類條件本來就是百分比 pct，所以活動層舊資料的 % 直接沿用、不必換算；
     門票層舊資料的 pct 由 create-event 的 condPrice 照該門票票價換成價格顯示。 */
  function ruleConds(r) {
    if (r && r.conds) return r;
    var out = { conds: {} };
    if (!r) return out;
    var buy = r.buy || {}, cap = r.cap || {}, disc = r.disc || {};
    var bm = buy.mode || 'none', dm = disc.mode || 'off';
    if (bm === 'time' || bm === 'both') out.conds.buyTime = { from: buy.from || '', to: buy.to || '' };
    if (bm === 'tier' || bm === 'both') out.conds.buyTier = { tier: buy.tier || 'fan' };
    if (cap.mode === 'cap') out.conds.cap = { person: cap.person || '' };   /* D427：舊形狀的 order／times 不再轉入 */
    var dk = { on: 'disc', time: 'discTime', tier: 'discTier', both: 'discBoth' }[dm];
    if (dk) {
      var c = { price: '', pct: disc.pct == null ? '' : String(disc.pct) };
      if (dk === 'discTime' || dk === 'discBoth') { c.from = disc.from || ''; c.to = disc.to || ''; }
      if (dk === 'discTier' || dk === 'discBoth') c.tier = disc.tier || 'fan';
      out.conds[dk] = c;
    }
    return out;
  }
  /* 單張門票的規則（任一形狀，先過 ruleConds）→ 正規化成票務商品預設要用的幾個量 */
  function tierRules(r) {
    var c = ruleConds(r).conds;
    var bt = c.buyTime, cp = c.cap;
    return {
      tier: c.buyTier ? (c.buyTier.tier || 'fan') : null,
      timed: !!bt,
      from: bt ? local(bt.from) : '', to: bt ? local(bt.to) : '',
      person: cp ? posInt(cp.person) : null
      /* 墓碑 2026-10-16（D427）：order（每次交易限購）、times（限購次數）退場 */
    };
  }
  /* 預設＝所含門票最嚴（〔推導〕）。rulesList＝每個允許票種的門票規則（原始形狀）；n＝每組張數；
     names＝與 rulesList 同序的門票名稱（選填，限購不足 1 組時就地指名是哪張門票）。
     person＝{ tix, sets }：sets 可能是 0（＝不足 1 組）；short＝{ person? }，列出不足 1 組的門票與其張數。 */
  function defaults(rulesList, n, et, names) {
    n = Math.max(1, Math.floor(Number(n) || 1));
    var list = (rulesList || []).map(tierRules);
    var d = { count: list.length, n: n, tier: null, timed: false, from: '', to: '', empty: false, person: null, differ: false, short: {} };
    if (!list.length) return d;
    var saleA = ms((et && (et.saleFrom || et.listFrom)) || ''), saleB = ms((et && (et.saleTo || et.start)) || '');
    var lo = -Infinity, hi = Infinity;
    list.forEach(function (r) {
      if (r.tier && (!d.tier || TIER_RANK[r.tier] > TIER_RANK[d.tier])) d.tier = r.tier;
      var a = r.timed ? ms(r.from) : saleA, b = r.timed ? ms(r.to) : saleB;
      if (r.timed) d.timed = true;
      if (fin(a) && a > lo) lo = a;
      if (fin(b) && b < hi) hi = b;
    });
    if (d.timed) {
      /* 用本地時間組字串（toISOString 是 UTC，會把時間挪掉） */
      var loc = function (t) { var x = new Date(t), p = function (v) { return String(v).padStart(2, '0'); };
        return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()) + 'T' + p(x.getHours()) + ':' + p(x.getMinutes()); };
      d.from = fin(lo) ? loc(lo) : ''; d.to = fin(hi) ? loc(hi) : '';
      d.empty = fin(lo) && fin(hi) && lo >= hi;
    }
    ['person'].forEach(function (k) {   /* D427：只剩每人總限購 */
      var vals = list.map(function (r) { return r[k]; }).filter(function (v) { return v != null; });
      if (!vals.length) return;
      var tix = Math.min.apply(null, vals);
      d[k] = { tix: tix, sets: Math.floor(tix / n) };
      if (d[k].sets < 1) {
        d.short[k] = list.map(function (r, i) { return { name: (names && names[i]) || '', tix: r[k] }; })
          .filter(function (x) { return x.tix != null && x.tix < n; });
      }
    });
    var sig = function (r) { return [r.tier, r.timed, r.from, r.to, r.person].join('|'); };
    d.differ = list.some(function (r) { return sig(r) !== sig(list[0]); });
    return d;
  }
  function seedFrom(def) {
    return {
      on: !!(def.tier || def.timed),
      cond: def.tier && def.timed ? 'both' : (def.tier ? 'tier' : 'time'),
      tier: def.tier || 'fan',
      from: def.timed ? def.from : '', to: def.timed ? def.to : '',
      cap: def.person ? 'cap' : 'none',
      /* 不足 1 組（sets＝0）不填欄位：0 不是合法的限購，填了只會讓人改不好（錯誤由 rulesErrors 說明怎麼解） */
      person: def.person && def.person.sets >= 1 ? String(def.person.sets) : ''
    };
  }
  var condHas = function (r, part) { return r.on && (r.cond === part || r.cond === 'both'); };
  /* 錯誤：key → 訊息。empty＝預設交集為空（跟隨時擋存；已調整且自設了限時間就不再看交集）。 */
  /* 限購最低 1 組：不足時的就地說明（跟隨與另設都擋；調整只能收窄，所以只有調高門票限購或改每套張數才解得開） */
  function shortErrors(def, T) {
    var e = {};
    ['person'].forEach(function (k) {   /* D427：tb.err.short.order 退場 */
      var list = def && def.short && def.short[k];
      if (!list || !list.length) return;
      var items = list.map(function (x) {
        return x.name ? T('tb.err.short.item').replace('{name}', x.name).replace('{tix}', x.tix) : String(x.tix);
      }).join(sepList(T));
      e[k] = T('tb.err.short.' + k).split('{n}').join(def.n).replace('{items}', items);
    });
    return e;
  }
  /* 清單分隔：中文用頓號、英文用逗號＋空格 */
  function sepList(T) { return String(document.documentElement.lang || '').indexOf('zh') === 0 ? '、' : ', '; }
  /* opts.buyOnly（D398，2026-10-12）：限購改由 js/purchase-limits.js 的組合包限購區塊管（所有組合包、含商品成員的交集），
     這裡只檢查購買條件；bundle-detail／create-bundle／bundle-editor（2026-10-12 起）都傳 buyOnly */
  function rulesErrors(st, def, et, T, opts) {
    var e = {}, r = st && st.rules, buyOnly = !!(opts && opts.buyOnly);
    if (!def || !def.count) return e;
    var short = buyOnly ? {} : shortErrors(def, T);
    if (!r) { if (def.empty) e.empty = T('tb.err.empty.window'); return Object.assign(e, short); }
    if (def.empty && !condHas(r, 'time')) e.empty = T('tb.err.empty.window');
    if (def.tier && (!condHas(r, 'tier') || TIER_RANK[r.tier] < TIER_RANK[def.tier])) {
      e.tier = T('tb.err.tier.loose').replace('{tier}', T('ce.rule.tier.' + def.tier));
    }
    if (condHas(r, 'time')) {
      if (!r.from || !r.to) e.time = T('tb.err.time.empty');
      else if (ms(r.to) <= ms(r.from)) e.time = T('tb.err.time.order');
      else if (outside(r.from, et) || outside(r.to, et)) e.time = T('tb.err.outside').replace('{period}', periodText(et, T));
      else if (lateEnd(r.to, et)) e.time = lateText(et, T);   /* D363：限時間的結束不能晚於活動停售（開始可以早於開賣） */
    }
    if (!buyOnly) ['person'].forEach(function (k) {   /* D427：只剩每人總限購 */
      if (short[k]) { e[k] = short[k]; return; }
      var lim = def[k], max = lim ? lim.sets : null;
      var v = r.cap === 'cap' ? String(r[k] || '').trim() : '';
      if (v && !posInt(v)) { e[k] = T('tb.err.int'); return; }
      if (max != null && (!v || posInt(v) > max)) e[k] = T('tb.err.cap.loose').replace('{n}', String(max));
    });
    return e;
  }
  function tierText(def, T) { return def.tier ? T('ce.rule.tier.' + def.tier) : ''; }
  function buyText(r, T) {
    var parts = [];
    if (r.tier) parts.push(T('ce.rule.tier.' + r.tier));
    if (r.timed && r.empty) parts.push(T('tb.rules.nooverlap'));   // 交集為空：不寫一段倒過來的時間
    else if (r.timed) parts.push((r.from ? fmt(r.from) : '…') + ' – ' + (r.to ? fmt(r.to) : '…'));
    return parts.length ? parts.join(' · ') : T('ce.rule.any');
  }
  function capText(o, T) {
    var parts = [];
    if (o.person != null) parts.push(o.person < 1 ? T('tb.cap.person.short') : T('tb.cap.person.v').replace('{n}', o.person));
    /* 墓碑 2026-10-16（D427）：tb.cap.order.*（每次）與 tb.cap.times.v（限 n 次）退場 */
    return parts.length ? parts.join(' · ') : T('ce.rule.any');
  }
  function defBuy(def) { return { tier: def.tier, timed: def.timed, from: def.from, to: def.to, empty: def.empty }; }
  function defCap(def) {
    return { person: def.person ? def.person.sets : null };
  }
  function curBuy(r) { return { tier: condHas(r, 'tier') ? r.tier : null, timed: condHas(r, 'time'), from: r.from, to: r.to }; }
  function curCap(r) {
    var g = function (k) { return r.cap === 'cap' && posInt(r[k]) ? posInt(r[k]) : null; };
    return { person: g('person') };
  }
  function kv(k, v) { return '<div class="kv"><span class="kv__k">' + esc(k) + '</span><span class="kv__v">' + esc(v) + '</span></div>'; }
  /* 句與句之間：中文直接接、英文空一格 */
  function sep() { return String(document.documentElement.lang || '').indexOf('zh') === 0 ? '' : ' '; }
  function defNote(def, n, T) {
    var s = def.count > 1 ? T('tb.rules.from.many').replace('{n}', def.count) : T('tb.rules.from.one');
    if (def.person && n > 1) s += sep() + T('tb.rules.sets').replace('{n}', n);   // 每組 1 張時組＝張，不必換算
    return s;
  }
  function radio(path, val, opts, T, dis) {
    return '<div class="radio-list" role="radiogroup">' + opts.map(function (o) {
      return '<button type="button" class="radio-list__item' + (o.v === val ? ' radio-list__item--active' : '') + '" data-tb-rule-seg="' + path + '" data-tb-v="' + o.v + '"' + (dis ? ' disabled' : '') + '>' +
        '<span class="radio-list__dot"></span><span class="radio-list__text"><span class="radio-list__title">' + esc(T(o.k)) + '</span></span></button>';
    }).join('') + '</div>';
  }
  function err(key) { return '<p class="field__error" data-tb-err="' + key + '" hidden></p>'; }
  /* opts.readonly＝只畫預設讀數（create-bundle：建立時照預設帶入，調整在細節頁）；opts.locked＝bookyay 鎖定不能改；
     opts.n＝每組張數（限購換算成套）。 */
  function rulesHTML(st, def, et, T, opts) {
    opts = opts || {};
    var r = st && st.rules, n = Math.max(1, Math.floor(Number(opts.n) || 1)), buyOnly = !!opts.buyOnly;
    if (!def || !def.count) return '<p class="field__hint">' + esc(T('tb.rules.none')) + '</p>';
    var follow = !r || opts.readonly;
    /* buyOnly：不提「限購以組計」那句（限購在組合包的限購區塊） */
    var note = buyOnly ? (def.count > 1 ? T('tb.rules.from.many').replace('{n}', def.count) : T('tb.rules.from.one')) : defNote(def, n, T);
    var head = opts.readonly ? '' :
      '<div class="control-row"><div><div class="control-row__main">' + esc(T('tb.rules.follow')) + '</div>' +
        '<div class="control-row__sub">' + esc(note) + '</div></div>' +
        '<div class="switch' + (follow ? ' switch--on' : '') + (opts.locked ? ' switch--locked' : '') + '" role="switch" aria-checked="' + follow + '"' +
          (opts.locked ? ' aria-disabled="true"' : ' tabindex="0"') + ' data-tb-rules-follow aria-label="' + esc(T('tb.rules.follow')) + '"></div></div>';
    if (follow) {
      /* buyOnly：外層已有「購買條件」小標，讀數不再掛同名 kv 標籤（UI 文案不重述上下文） */
      return head + (buyOnly
        ? '<div class="field-readout' + (head ? ' mt-16' : '') + '">' + esc(buyText(defBuy(def), T)) + '</div>'
        : '<div class="kv-list' + (head ? ' mt-16' : '') + '">' +
          kv(T('tb.rules.buy'), buyText(defBuy(def), T)) +
          kv(T('tb.rules.cap'), capText(defCap(def), T)) +
        '</div>') +
        /* 2026-10-20 D455（B7）：「建立後到細節頁調整」改由 create-bundle 整組購買條件與限購共用一句（[data-cb-rules-later]），這裡只留來源句 */
        (opts.readonly ? '<p class="field__hint">' + esc(note) + '</p>' : '') +
        err('empty') + (buyOnly ? '' : err('person'));
    }
    var tierOpts = TIERS_HI.map(function (v) {
      return '<option value="' + v + '"' + (r.tier === v ? ' selected' : '') + '>' + esc(T('ce.rule.tier.' + v)) + '</option>';
    }).join('');
    var when = function (part, inner) { return condHas(r, part) ? '<div class="rule-when">' + inner + '</div>' : ''; };
    var capField = function (k, max) {
      /* max＝0：換算成套不足 1 組、沒有可填的上限，說明交給下方錯誤（不寫「最多 0」） */
      var hint = max == null ? T('tb.cap.nomax') : (max >= 1 ? T('tb.cap.max').replace('{n}', max) : '');
      return '<div class="field"><label class="field__label">' + esc(T('tb.cap.' + k)) + '</label>' +
        '<input class="input" type="number" min="1" step="1" data-tb-rule-f="' + k + '" value="' + esc(r[k]) + '">' +
        (hint ? '<div class="field__hint">' + esc(hint) + '</div>' : '') + err(k) + '</div>';
    };
    return head +
      '<div class="rule mt-16">' +
        '<div class="field__label">' + esc(T('tb.rules.buy')) + '</div>' +
        radio('on', r.on ? 'on' : 'off', [{ v: 'off', k: 'ce.rule.any' }, { v: 'on', k: 'tb.rules.restrict' }], T) +
        (r.on ? '<div class="rule-sub">' +
          radio('cond', r.cond, [{ v: 'time', k: 'ce.rule.time' }, { v: 'tier', k: 'ce.rule.tier' }, { v: 'both', k: 'ce.rule.both' }], T) +
          when('time', '<div class="rule-row">' +
            '<div class="field"><label class="field__label">' + esc(T('ce.rule.from')) + '</label><input class="input" type="datetime-local" data-tb-rule-f="from" value="' + esc(local(r.from)) + '"></div>' +
            '<div class="field"><label class="field__label">' + esc(T('ce.rule.to')) + '</label><input class="input" type="datetime-local" data-tb-rule-f="to" value="' + esc(local(r.to)) + '"></div>' +
          '</div>' + '<div class="field__hint">' + esc(T('tb.time.hint').replace('{period}', periodText(et, T))) + '</div>' + err('time')) +
          when('tier', '<div class="field"><label class="field__label">' + esc(T('tb.tier.min')) + '</label>' +
            '<select class="select" data-tb-rule-f="tier">' + tierOpts + '</select>' +
            (def.tier ? '<div class="field__hint">' + esc(T('tb.tier.hint').replace('{tier}', tierText(def, T))) + '</div>' : '') + '</div>') +
        '</div>' : '') +
        err('tier') + err('empty') +
      '</div>' +
      (buyOnly ? '' : '<div class="rule">' +
        '<div class="field__label">' + esc(T('tb.rules.cap')) + '</div>' +
        radio('cap', r.cap, [{ v: 'none', k: 'ce.rule.any' }, { v: 'cap', k: 'ce.rule.cap.on' }], T) +
        (r.cap === 'cap' ? '<div class="rule-sub">' +
          capField('person', def.person ? def.person.sets : null) +
        '</div>' : err('person')) +   /* D427：每次交易、限購次數兩欄退場 */
      '</div>');
  }
  /* 墓碑 2026-10-16（D429）：buySummary()（只有購買條件那一半的摘要，D398；唯一消費者是 bookyay 自動建立的組合包的唯讀讀數）
     隨自動組合包退場，連同匯出一起刪除。 */
  /* 摘要（收合列、清單、細節頁讀數共用）：「超級粉絲以上 · 每人 2 組」 */
  function rulesSummary(st, def, T) {
    if (!def || !def.count) return '';
    var r = st && st.rules;
    var b = r ? curBuy(r) : defBuy(def), c = r ? curCap(r) : defCap(def);
    return buyText(b, T) + ' · ' + capText(c, T);
  }

  /* ── 互動（消費頁把自己的委派事件轉進來；回傳 true＝狀態變了、需要重畫）───────── */
  function onClick(e, st, ctx) {
    var f = e.target.closest('[data-tb-follow]');
    if (f) {
      if (f.disabled || f.getAttribute('aria-disabled') === 'true') return false;
      st.sched = st.sched || {};
      f.dataset.tbFollow.split(',').forEach(function (key) {   // 一顆開關管一組（上架＋下架、開賣＋停售）
        if (f.dataset.tbV === 'follow') st.sched[key] = null;
        else if (!isCustom(st, key)) st.sched[key] = eventValue(key, ctx && ctx.et);   // 另設從活動目前的值起手
      });
      return true;
    }
    var sw = e.target.closest('[data-tb-rules-follow]');
    if (sw) {
      if (sw.getAttribute('aria-disabled') === 'true') return false;
      st.rules = st.rules ? null : seedFrom((ctx && ctx.def) || {});
      return true;
    }
    var seg = e.target.closest('[data-tb-rule-seg]');
    if (seg && st.rules) {
      if (seg.disabled) return false;
      var p = seg.dataset.tbRuleSeg, v = seg.dataset.tbV;
      if (p === 'on') st.rules.on = v === 'on';
      else if (p === 'cond') st.rules.cond = v;
      else if (p === 'cap') st.rules.cap = v;
      return true;
    }
    return false;
  }
  /* 輸入：只寫值、不重畫（重畫會丟游標）；回傳 true＝有處理。 */
  function onInput(e, st) {
    var at = e.target.closest && e.target.closest('[data-tb-at]');
    if (at) { st.sched = st.sched || {}; st.sched[at.dataset.tbAt] = at.value; return true; }
    var rf = e.target.closest && e.target.closest('[data-tb-rule-f]');
    if (rf && st.rules) { st.rules[rf.dataset.tbRuleF] = rf.value; return true; }
    return false;
  }
  /* 把錯誤寫進就地的 [data-tb-err]，回傳錯誤數（schedule＋rules） */
  function syncErrors(root, st, ctx, T) {
    if (!root) return 0;
    var e = Object.assign({}, schedErrors(st, ctx.et, T), ctx.def ? rulesErrors(st, ctx.def, ctx.et, T, ctx) : {});
    root.querySelectorAll('[data-tb-err]').forEach(function (p) {
      var m = e[p.dataset.tbErr];
      p.hidden = !m; p.textContent = m || '';
    });
    root.querySelectorAll('[data-tb-at]').forEach(function (i) { i.setAttribute('aria-invalid', e[i.dataset.tbAt] ? 'true' : 'false'); });
    return Object.keys(e).length;
  }
  function errorCount(st, ctx, T) {
    return Object.keys(Object.assign({}, schedErrors(st, ctx.et, T), ctx.def ? rulesErrors(st, ctx.def, ctx.et, T, ctx) : {})).length;
  }

  /* 跟隨活動開關是 div role=switch（2026-10-12 由二選一改開關外框列）：補鍵盤 Enter／空白鍵＝點擊，頁面的 click 委派照用。 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    var sw = e.target && e.target.closest && e.target.closest('.follow-field .switch[data-tb-follow]');
    if (!sw) return;
    e.preventDefault();
    sw.click();
  });
  window.ZtorTicketBundle = {
    KEYS: KEYS, ms: ms, local: local, fmt: fmt, times: times, outside: outside, periodText: periodText,
    evHidden: evHidden, saleCeil: saleCeil, lateEnd: lateEnd, lateText: lateText,
    eventValue: eventValue, followText: followText, isCustom: isCustom, effective: effective,
    schedErrors: schedErrors, schedHTML: schedHTML,
    ruleConds: ruleConds, tierRules: tierRules, defaults: defaults, seedFrom: seedFrom, rulesErrors: rulesErrors, rulesHTML: rulesHTML, rulesSummary: rulesSummary,
    onClick: onClick, onInput: onInput, syncErrors: syncErrors, errorCount: errorCount
  };
})();
