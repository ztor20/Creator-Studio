/* ============================================================
   purchase-conds.js · 購買條件編輯器（「新增條件」清單）— 共用 vanilla JS 元件
   ------------------------------------------------------------
   2026-10-09 建（D388）：自建活動發布後可在活動詳情修改活動預設購票規則與單張門票購買條件，
   條件模型同建立流程（5.1.6.1 F22，D366／D367／D368）。原本這套畫法寫在 create-event.html 頁內
   （condsHTML 一族），活動詳情要用同一套，所以從 create-event 抽出來放這裡，兩頁共用——
   不在活動詳情另寫一份。外觀走 ds-components/cond-list.css（＋ dropdown-menu.css、
   ticket-tier-card.css 的 .rule-row、amount-field.css、field-system.css）。

   對外 API（window.ztorPurchaseConds）：
     TYPES / FIELDS / FIELDS_EV / FAN_TIERS   條件種類（固定順序）與每種的欄位形狀
     STRINGS / t(k)                           條件編輯器的中英字樣（d.cond.*、d.rule.*）；t() 依 <html lang> 取字，
                                              查不到落回 window.i18nT
     isDiscK(k) / fields(k, scope)            折扣類判斷；新加一張條件的空欄位（scope="event" 時折扣類用百分比，D368）
     condPrice(c, base) / pctOf(price, base)  折扣條件換算成這張票的價格；回推百分比（D367）
     pctText(c, bases) / evPriceText(c, bases, money)   兩種唯讀讀數（門票層回推 %、活動層算出的門票價）
     copyForTicket(rules, base)               活動層一組複製成門票自己的一組（拿掉 bookyay 標記、% 換成這張票的固定價）
     html(rules, scope, locked, ctx)          畫一整份條件清單（ctx 見下）
     discTimeBad(conds, isEvent)              限時折扣價高於一般折扣價？（D390 決定二十五追認：擋存）
     syncWarn(host, conds, isEvent)           把上一條寫成條件卡內的紅字；回傳 1／0（呼叫端據以擋存）
     periodWins(rules) / periodErrs(rules, et, T) / syncPeriod(host, rules, et, T)
                                              期間檢查（D342／D363；D389 起活動詳情同用）：有時間窗的條件須落在活動上架區間內、
                                              限時購買的結束不晚於活動停售；回傳 / 寫入 [data-rule-tl-err] 紅字。建立流程與活動詳情共用
     mount(host, opts)                        活動詳情用：畫進 host、自己接新增／移除／輸入，改動呼叫 opts.onChange；
                                              回傳 { render, refresh, rules, check }，refresh() 只重算價格讀數（例如票價改了）；
                                              opts.times() 給了活動時間時，check() 做期間檢查並回傳錯誤數（D389：按儲存 >0 就擋）

   ctx（呼叫端提供）：{ esc, featOn(id), srcChip(), pctReadout(c, scope), evPriceReadout(c) }
   粉絲分級三種（feat S82，⚪ 未排定）掛 data-feat，release2.4 由 devtools 的 regate() 收起（D366 決定五／D367 決定三）。
   ============================================================ */
(function () {
  const TYPES = [
    { k: "buyTime",  icon: "clock" },
    { k: "buyTier",  icon: "users",          feat: "S82" },
    { k: "cap",      icon: "shopping-cart" },
    { k: "disc",     icon: "tag" },
    { k: "discTime", icon: "calendar-clock" },
    { k: "discTier", icon: "percent",        feat: "S82" },
    { k: "discBoth", icon: "percent",        feat: "S82" }   // D367 決定三：限時＋限粉絲分級的組合折扣，只在最終版
  ];
  const FIELDS = {
    buyTime:  { from: "", to: "" },
    buyTier:  { tier: "fan" },
    cap:      { person: "", order: "", times: "" },
    disc:     { price: "" },
    discTime: { price: "", from: "", to: "" },
    discTier: { price: "", tier: "fan" },
    discBoth: { price: "", from: "", to: "", tier: "fan" }
  };
  /* D368 決定一：活動層的折扣類條件設的是百分比 pct；門票層照 D367 設固定價 price */
  const FIELDS_EV = {
    disc:     { pct: "" },
    discTime: { pct: "", from: "", to: "" },
    discTier: { pct: "", tier: "fan" },
    discBoth: { pct: "", from: "", to: "", tier: "fan" }
  };
  const FAN_TIERS = ["inner", "superfan", "devoted", "fan"];    // 高→低，與 e-shop 粉絲分級門檻同一套

  /* 條件編輯器的字樣（原 create-event.html 頁內字典 D 的 d.cond.*／d.rule.* 那一段，2026-10-09 搬來這裡；
     create-event 載入時把這份併回它的 D，所以兩頁讀的是同一份字） */
  const STRINGS = {
    "d.cond.buyTime":  { en: "Sales window",            zh: "限時購買" },
    "d.cond.buyTier":  { en: "Fan tier only",           zh: "限粉絲分級購買" },
    "d.cond.cap":      { en: "Purchase limits",         zh: "限購" },
    "d.cond.disc":     { en: "Discount",                zh: "折扣" },
    "d.cond.discTime": { en: "Limited-time discount",   zh: "限時折扣" },
    "d.cond.discTier": { en: "Fan tier discount",       zh: "粉絲分級折扣" },
    "d.cond.discBoth": { en: "Limited-time fan tier discount", zh: "限時＋限粉絲分級折扣" },
    "d.cond.add":      { en: "Add condition",           zh: "新增條件" },
    "d.cond.remove":   { en: "Remove",                  zh: "移除" },
    "d.cond.empty":    { en: "No conditions yet. Anyone can buy, at the ticket price.", zh: "還沒有條件：任何人都買得到，照票價賣。" },
    "d.cond.none":     { en: "No conditions",           zh: "沒有條件" },
    "d.cond.price.disc":     { en: "Discounted price",  zh: "折扣價" },
    "d.cond.price.discTime": { en: "Price in the window", zh: "期間內價格" },
    "d.cond.price.discTier": { en: "Price for the tier", zh: "分級價格" },
    "d.cond.price.discBoth": { en: "Tier price in the window", zh: "期間內分級價格" },
    "d.cond.pct":      { en: "Works out to",            zh: "等於" },
    "d.cond.pct.v":    { en: "{n}% off",                zh: "折 {n}%" },
    "d.cond.pct.range":{ en: "{a}–{b}% off, varies by ticket", zh: "折 {a}%–{b}%（各張票不同）" },
    "d.cond.pct.paren":{ en: "({n}% off)",              zh: "（折 {n}%）" },
    /* D368：活動層的折扣類條件填百分比，讀數是跟隨門票算出來的價格 */
    "d.cond.pctin.disc":     { en: "Discount",            zh: "折扣" },
    "d.cond.pctin.discTime": { en: "Discount in the window", zh: "期間內折扣" },
    "d.cond.pctin.discTier": { en: "Discount for the tier",  zh: "分級折扣" },
    "d.cond.pctin.discBoth": { en: "Tier discount in the window", zh: "期間內分級折扣" },
    "d.cond.evprice":        { en: "Ticket price becomes", zh: "門票折後價" },
    "d.cond.evprice.range":  { en: "{a}–{b}, varies by ticket", zh: "{a}–{b}（各張票不同）" },
    "d.cond.pct.minus":      { en: "{n}% off",            zh: "−{n}%" },
    "d.cond.warn.time":{ en: "Can't be higher than the regular discounted price.", zh: "不得高於一般折扣價。" },
    "d.cond.cap.person": { en: "{n} per person",        zh: "每人 {n} 張" },
    "d.cond.cap.order":  { en: "{n} per order",         zh: "每次 {n} 張" },
    "d.cond.cap.times":  { en: "{n} orders max",        zh: "限 {n} 次" },
    "d.cond.deal.win":   { en: "{p} until {to}",        zh: "限時 {p}（至 {to}）" },
    "d.cond.deal.after": { en: "then {p}",              zh: "之後 {p}" },
    "d.cond.deal.gen":   { en: "Discounted to {p}",     zh: "折扣價 {p}" },
    "d.cond.deal.tier":  { en: "Fan tier price {p}",    zh: "粉絲分級價 {p}" },
    "d.rule.start":   { en: "Starts",             zh: "開始時間" },
    "d.rule.end":     { en: "Ends",               zh: "結束時間" },
    "d.rule.tierpick":{ en: "Minimum fan tier",   zh: "買得到的最低分級" },
    "d.rule.cap.person":{ en: "Tickets per person, in total", zh: "每人總限購數量" },
    "d.rule.cap.person.ph":{ en: "e.g., 4",      zh: "4" },
    "d.rule.cap.order":{ en: "Tickets per order", zh: "每次交易限購數量" },
    "d.rule.cap.order.ph":{ en: "e.g., 2",       zh: "2" },
    "d.rule.cap.times":{ en: "Orders per person", zh: "限購次數" },
    "d.rule.cap.times.ph":{ en: "e.g., 1",       zh: "1" }
  };
  const lang = () => (document.documentElement.lang === "zh-Hant" ? "zh" : "en");
  const t = k => (STRINGS[k] ? STRINGS[k][lang()] : ((window.i18nT && window.i18nT(k)) || k));
  const T = (k, fb) => (window.i18nT && window.i18nT(k)) || fb || k;
  const escDefault = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const isDiscK = k => k === "disc" || k === "discTime" || k === "discTier" || k === "discBoth";
  const fields = (k, scope) => JSON.parse(JSON.stringify(scope === "event" && FIELDS_EV[k] ? FIELDS_EV[k] : FIELDS[k]));
  const meta = k => TYPES.filter(c => c.k === k)[0] || {};
  const name = k => t("d.cond." + k);
  const norm = r => {
    const TBX = window.ZtorTicketBundle;
    if (TBX && TBX.ruleConds) return TBX.ruleConds(r);
    return r && r.conds ? r : { conds: {} };
  };

  /* ── 價格（D367 固定價／D368 活動層百分比）─────────────────────────────── */
  const condPrice = (c, base) => {
    if (!c) return null;
    if (c.price !== "" && c.price != null && isFinite(Number(c.price))) return Math.min(Number(c.price), base);
    if (c.pct !== "" && c.pct != null && isFinite(Number(c.pct))) return Math.round(base * (1 - Math.min(100, Math.max(0, Number(c.pct))) / 100));
    return null;
  };
  const pctOf = (price, base) => base > 0 ? Math.round((1 - price / base) * 1000) / 10 : null;
  /* 門票層讀數：1 − 折扣價 ÷ 票價；bases＝這張票的票價（一個）或全部門票的票價（區間） */
  function pctText(c, bases) {
    const p = c && c.price !== "" && c.price != null ? Number(c.price) : null;
    if (p == null || !isFinite(p)) return "—";
    const pcts = (bases || []).filter(b => b > 0).map(b => pctOf(Math.min(p, b), b));
    if (!pcts.length) return "—";
    const lo = Math.min.apply(null, pcts), hi = Math.max.apply(null, pcts);
    return lo === hi ? t("d.cond.pct.v").replace("{n}", lo) : t("d.cond.pct.range").replace("{a}", lo).replace("{b}", hi);
  }
  /* 活動層讀數：跟隨的門票各自算出來的價格；全部同價寫一個數，不同寫區間 */
  function evPriceText(c, bases, money) {
    if (!c || c.pct === "" || c.pct == null || !isFinite(Number(c.pct))) return "—";
    const bs = (bases || []).filter(b => b > 0);
    if (!bs.length) return "—";
    const ps = bs.map(b => condPrice(c, b));
    const lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps);
    return lo === hi ? money(lo) : t("d.cond.evprice.range").replace("{a}", money(lo)).replace("{b}", money(hi));
  }
  /* 活動層一組 → 門票自己的一組：拿掉 bookyay 標記（D366 決定四）、% 換成這張票的固定價（D368） */
  function copyForTicket(rules, base) {
    const r = JSON.parse(JSON.stringify(norm(rules)));
    Object.keys(r.conds).forEach(k => {
      const c = r.conds[k];
      delete c.bky;
      if (isDiscK(k) && (c.price === "" || c.price == null) && c.pct !== "" && c.pct != null) {
        const p = condPrice(c, base);
        c.price = p == null ? "" : String(p);
      }
      if (isDiscK(k)) delete c.pct;
    });
    return r;
  }

  /* ── 畫法（原 create-event 的 ruleField／winFieldsHTML／tierPickHTML／priceFieldHTML／condBodyHTML／
     condCardHTML／addMenuHTML／condsHTML）─────────────────────────────────── */
  function html(rules, scope, locked, ctx) {
    ctx = ctx || {};
    const esc = ctx.esc || escDefault;
    const featOn = ctx.featOn || (() => true);
    const srcChip = ctx.srcChip || (() => "");
    const pctReadout = ctx.pctReadout || (() => "—");
    const evPriceReadout = ctx.evPriceReadout || (() => "—");
    const dis = l => l ? " disabled" : "";
    const ruleField = (label, control, l) =>
      '<div class="field' + (l ? " is-source-locked" : "") + '"><label class="field__label">' + esc(label) + '</label>' + control + '</div>';
    const winFieldsHTML = (k, c, l) =>
      '<div class="rule-row">' +
        ruleField(t("d.rule.start"),
          '<input class="input" type="datetime-local" data-ph-key="ce.rule.from" data-rule-f="' + k + '.from" value="' + esc(c.from) + '"' + dis(l) + '>', l) +
        ruleField(t("d.rule.end"),
          '<input class="input" type="datetime-local" data-ph-key="ce.rule.to" data-rule-f="' + k + '.to" value="' + esc(c.to) + '"' + dis(l) + '>', l) +
      '</div>' +
      /* D342／D363：限時間必須落在活動上架區間內（可以早於開賣），超出就地紅字（呼叫端 syncRuleTl） */
      '<p class="field__error" data-rule-tl-err="' + k + '" hidden></p>';
    const tierPickHTML = (k, c, l) => ruleField(t("d.rule.tierpick"),
      '<select class="select" data-rule-f="' + k + '.tier"' + dis(l) + '>' +
        FAN_TIERS.map(v => '<option value="' + v + '"' + (c.tier === v ? " selected" : "") + '>' +
          esc(T("ce.rule.tier." + v, v)) + '</option>').join("") +
      '</select>', l);
    function priceFieldHTML(k, c, l) {
      if (scope === "event") {
        const pctIn = ruleField(t("d.cond.pctin." + k),
          '<span class="amount-field amount-field--suffix amount-field--readonly">' +
            '<input class="input amount-field__input" type="number" min="0" max="100" step="0.1" data-rule-f="' + k + '.pct" value="' +
              esc(c.pct == null ? "" : c.pct) + '" placeholder="0"' + dis(l) + '>' +
            '<span class="amount-field__unit">%</span></span>', l);
        const out = ruleField(t("d.cond.evprice"), '<div class="field-readout" data-cond-pct="' + k + '">' + esc(evPriceReadout(c)) + '</div>');
        return '<div class="rule-row">' + pctIn + out + '</div>';
      }
      const price = ruleField(t("d.cond.price." + k),
        '<span class="amount-field' + (l ? " amount-field--readonly" : "") + '">' +
          '<span class="amount-field__unit"><span class="amount-field__sym">$</span></span>' +
          '<input class="input amount-field__input" type="number" min="0" step="1" data-rule-f="' + k + '.price" value="' +
            esc(c.price) + '" placeholder="0"' + dis(l) + '></span>', l);
      const pct = ruleField(t("d.cond.pct"), '<div class="field-readout" data-cond-pct="' + k + '">' + esc(pctReadout(c, scope)) + '</div>');
      return '<div class="rule-row">' + price + pct + '</div>';
    }
    function bodyHTML(k, c, l) {
      if (k === "buyTime") return winFieldsHTML(k, c, l);
      if (k === "buyTier") return tierPickHTML(k, c, l);
      if (k === "cap") return ["person", "order", "times"].map(f =>
        ruleField(t("d.rule.cap." + f),
          '<input class="input" type="number" min="1" step="1" data-rule-f="cap.' + f + '" value="' + esc(c[f]) +
            '" placeholder="' + (l ? "" : esc(t("d.rule.cap." + f + ".ph"))) + '"' + dis(l) + '>', l)).join("");
      let h = priceFieldHTML(k, c, l);
      if (k === "discTime" || k === "discBoth") h += winFieldsHTML(k, c, l);
      if (k === "discTier" || k === "discBoth") h += tierPickHTML(k, c, l);
      /* D367 決定二推導，2026-10-09 D390 決定二十五追認：限時折扣價不得高於一般折扣價——擋存（原本只提示）。
         元素名稱沿用 data-cond-warn（兩頁的同步點都認它），外觀改成欄位錯誤。 */
      if (k === "discTime") h += '<p class="field__error" data-cond-warn="discTime" hidden>' + esc(t("d.cond.warn.time")) + '</p>';
      return h;
    }
    /* chip＝要不要在卡頂列掛來源標記：整組鎖定時區塊標題旁已經有一枚，卡上不重複（UIA-212） */
    function cardHTML(k, c, l, chip) {
      const m = meta(k);
      return '<div class="cond-list__item control-group control-group--plain' + (l ? " is-source-locked" : "") + '" data-cond="' + k + '"' + (m.feat ? ' data-feat="' + m.feat + '"' : "") + '>' +
          '<div class="cond-list__head">' +
            '<span class="cond-list__title"><i data-lucide="' + m.icon + '" class="ztor-icon"></i>' + esc(name(k)) + '</span>' +
            (chip ? srcChip() : "") +
            (l ? "" : '<button type="button" class="btn btn--icon btn--sm cond-list__remove" data-cond-remove="' + k + '" aria-label="' +
              esc(t("d.cond.remove") + " " + name(k)) + '"><i data-lucide="x" class="ztor-icon"></i></button>') +
          '</div>' +
          '<div class="cond-list__body">' + bodyHTML(k, c, l) + '</div>' +
        '</div>';
    }
    /* 「新增條件」選單：只列還沒加、而且在目前版本內的種類；全部加完就整顆不出現 */
    function addMenuHTML(r) {
      const avail = TYPES.filter(c => !r.conds[c.k]);
      if (!avail.filter(c => featOn(c.feat)).length) return "";
      return '<details class="dropdown dropdown--left cond-list__add">' +
          '<summary class="btn btn--outline btn--sm"><i data-lucide="plus" class="ztor-icon"></i><span>' + esc(t("d.cond.add")) + '</span></summary>' +
          '<div class="dropdown__menu" role="menu">' +
            avail.map(c => '<button type="button" class="dropdown__item" role="menuitem" data-cond-add="' + c.k + '"' +
              (c.feat ? ' data-feat="' + c.feat + '"' : "") + '><i data-lucide="' + c.icon + '" class="ztor-icon"></i>' + esc(name(c.k)) + '</button>').join("") +
          '</div>' +
        '</details>';
    }
    const r = norm(rules);
    const keys = TYPES.map(c => c.k).filter(k => r.conds[k]);   // 照種類固定順序排，不照加入先後
    return '<div class="cond-list">' +
        (keys.length ? keys.map(k => cardHTML(k, r.conds[k], locked || !!r.conds[k].bky, !locked && !!r.conds[k].bky)).join("")
                     : '<p class="field__hint cond-list__empty">' + esc(t("d.cond.empty")) + '</p>') +
        (locked ? "" : addMenuHTML(r)) +
      '</div>';
  }

  /* 限時折扣價高於一般折扣價（D390 決定二十五：擋存）：活動層比百分比（限時 % 比一般 % 小＝期間內反而貴），門票層比價格。
     bookyay 帶入且鎖定的兩條不算（創作者改不了，擋了也解不開）。 */
  function discTimeBad(conds, isEvent) {
    const c = conds || {};
    if (c.discTime && c.discTime.bky && c.disc && c.disc.bky) return false;
    const num = (x, f) => x && x[f] !== "" && x[f] != null && isFinite(Number(x[f])) ? Number(x[f]) : null;
    const a = num(c.discTime, isEvent ? "pct" : "price"), b = num(c.disc, isEvent ? "pct" : "price");
    return a != null && b != null && (isEvent ? a < b : a > b);
  }
  function syncWarn(host, conds, isEvent) {
    const bad = discTimeBad(conds, isEvent);
    const w = host && host.querySelector('[data-cond-warn="discTime"]');
    if (w) w.hidden = !bad;
    return bad ? 1 : 0;
  }

  /* ── 期間檢查（D342／D363；D389 起活動詳情同用）──────────────────────────────
     有時間窗的條件（限時購買、限時折扣、限時＋限粉絲分級折扣）的期間必須落在活動上架區間內；
     限時購買的結束另外不能晚於活動停售（開始可以早於開賣＝提前販售；折扣的期間不是販售時間，不套停售）。
     建立流程（create-event syncRuleTl）與活動詳情（mount 的 check()）共用這一套判斷與文案；
     比對規則本體在 js/ticket-bundle.js（outside／lateEnd／periodText），et＝活動時間（TBX.times(ev) 或頁面自己組）。 */
  function periodWins(r) {
    if (!r) return [];
    const c = norm(r).conds || {};
    return ["buyTime", "discTime", "discBoth"].filter(k => c[k]).map(k => ({ k: k, from: c[k].from, to: c[k].to }));
  }
  /* 回傳 { 條件鍵: 紅字 }；Tr＝取字函式（缺＝i18nT） */
  function periodErrs(r, et, Tr) {
    const out = {};
    const TBX = window.ZtorTicketBundle;
    if (!r || !et || !TBX) return out;
    const tr = Tr || (k => T(k, k));
    const outMsg = v => (v && TBX.outside(v, et)) ? tr("tb.err.outside").replace("{period}", TBX.periodText(et, tr)) : "";
    periodWins(r).forEach(x => {
      const m = outMsg(x.from) || outMsg(x.to) ||
        (x.k === "buyTime" && x.to && TBX.lateEnd(x.to, et) ? TBX.lateText(et, tr) : "");
      if (m) out[x.k] = m;
    });
    return out;
  }
  /* 把紅字寫進 host 裡每個 [data-rule-tl-err]（winFieldsHTML 畫的那一行）；回傳錯誤數 */
  function syncPeriod(host, r, et, Tr) {
    const errs = periodErrs(r, et, Tr);
    if (host) host.querySelectorAll("[data-rule-tl-err]").forEach(p => {
      const m = errs[p.dataset.ruleTlErr] || "";
      p.hidden = !m; p.textContent = m;
    });
    return Object.keys(errs).length;
  }

  /* 活動詳情用：把一份規則畫進 host、接好新增／移除／輸入。
     opts：{ rules（{conds}，直接改這份）, scope（"event" 或門票 id）, ctx, onChange(),
             times()（選填：回傳活動時間 et——給了就在改期間時就地比上架區間，D389） } */
  function mount(host, opts) {
    if (!host) return null;
    const st = { rules: norm(opts.rules), scope: opts.scope, ctx: opts.ctx || {} };
    const isEv = st.scope === "event";
    /* 期間紅字：shown＝已經按過儲存被擋（之後每改一次就重比）；還沒按儲存前只在改期間欄位時比 */
    /* D390 決定二十五：限時折扣價高於一般折扣價同樣算一個錯（擋存） */
    const check = () => (opts.times ? syncPeriod(host, st.rules, opts.times()) : 0) + syncWarn(host, st.rules.conds, isEv);
    function render() {
      host.innerHTML = html(st.rules, st.scope, false, st.ctx);
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
      host.querySelectorAll("[data-ph-key]").forEach(el => { el.placeholder = T(el.dataset.phKey, ""); });
      syncWarn(host, st.rules.conds, isEv);
      check();
      const d = window.ztorDevState; if (d && d.regate) d.regate();
    }
    host.onclick = e => {
      const add = e.target.closest("[data-cond-add]");
      const rm = !add && e.target.closest("[data-cond-remove]");
      if (!add && !rm) return;
      const k = (add || rm).dataset[add ? "condAdd" : "condRemove"];
      if (add) {
        if (st.rules.conds[k]) return;                 // 每種最多一次
        st.rules.conds[k] = fields(k, st.scope);
      } else {
        if (st.rules.conds[k] && st.rules.conds[k].bky) return;
        delete st.rules.conds[k];
      }
      render();
      if (opts.onChange) opts.onChange(st.rules);
    };
    const onField = e => {
      const f = e.target.closest("[data-rule-f]");
      if (!f) return;
      const p = f.dataset.ruleF.split(".");
      if (st.rules.conds[p[0]]) st.rules.conds[p[0]][p[1]] = f.value;
      if (p[1] === "price" || p[1] === "pct") {
        const out = host.querySelector('[data-cond-pct="' + p[0] + '"]');
        const c = st.rules.conds[p[0]];
        if (out) out.textContent = p[1] === "pct"
          ? (st.ctx.evPriceReadout ? st.ctx.evPriceReadout(c) : "—")
          : (st.ctx.pctReadout ? st.ctx.pctReadout(c, st.scope) : "—");
        syncWarn(host, st.rules.conds, isEv);
      }
      if (p[1] === "from" || p[1] === "to") check();   // D389：期間一改就重比上架區間（同 create-event 改限時間時 syncRuleTl）
      if (opts.onChange) opts.onChange(st.rules);
    };
    host.oninput = onField;
    host.onchange = e => { if (e.target.matches && e.target.matches("select[data-rule-f]")) onField(e); };
    render();
    /* 讀數重算（不重畫、游標留在欄位裡）：票價這類條件以外的輸入一改，呼叫端叫這支（同 create-event 改票價時重算讀數） */
    function refresh() {
      Object.keys(st.rules.conds).forEach(k => {
        const out = host.querySelector('[data-cond-pct="' + k + '"]');
        if (!out) return;
        const c = st.rules.conds[k];
        out.textContent = isEv
          ? (st.ctx.evPriceReadout ? st.ctx.evPriceReadout(c) : "—")
          : (st.ctx.pctReadout ? st.ctx.pctReadout(c, st.scope) : "—");
      });
      syncWarn(host, st.rules.conds, isEv);
    }
    /* check()：期間檢查（D389）——把紅字寫在各條件的期間欄位下，回傳錯誤數；呼叫端按儲存時 >0 就擋下不存 */
    return { render: render, refresh: refresh, rules: () => st.rules, check: check };
  }

  window.ztorPurchaseConds = {
    TYPES: TYPES, FIELDS: FIELDS, FIELDS_EV: FIELDS_EV, FAN_TIERS: FAN_TIERS, STRINGS: STRINGS,
    t: t, isDiscK: isDiscK, fields: fields, norm: norm,
    condPrice: condPrice, pctOf: pctOf, pctText: pctText, evPriceText: evPriceText, copyForTicket: copyForTicket,
    html: html, syncWarn: syncWarn, discTimeBad: discTimeBad, mount: mount,
    periodWins: periodWins, periodErrs: periodErrs, syncPeriod: syncPeriod
  };
})();
