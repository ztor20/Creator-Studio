/* ============================================================
   purchase-conds.js · 購買條件編輯器（「新增條件」清單）— 共用 vanilla JS 元件
   ------------------------------------------------------------
   2026-10-09 建（D388）：自建活動發布後可在活動詳情修改單張門票購買條件，
   條件模型同建立流程（5.1.6.1 F22，D366／D367／D368）。原本這套畫法寫在 create-event.html 頁內
   （condsHTML 一族），活動詳情要用同一套，所以從 create-event 抽出來放這裡，兩頁共用——
   不在活動詳情另寫一份。2026-10-20（D460）：活動層預設購票規則永久移除——本檔的「活動層」分支（scope="event"：折扣類百分比欄、
   evPriceText 讀數、copyForTicket「活動層複製成門票自己一組」、FIELDS_EV）整組退場，只剩單張門票與組合包自己的購買條件。外觀走 ds-components/cond-list.css（＋ dropdown-menu.css、
   ticket-tier-card.css 的 .rule-row、amount-field.css、field-system.css）。

   對外 API（window.ztorPurchaseConds）：
     TYPES / FIELDS / FAN_TIERS   條件種類（固定順序）與每種的欄位形狀
     TIX_FEAT / featFor(k, c, ctx)            門票專用的條件 feat 對照（D461：buyTime／cap＝S104）與一張條件卡實際掛的 feat
     STRINGS / t(k)                           條件編輯器的中英字樣（d.cond.*、d.rule.*）；t() 依 <html lang> 取字，
                                              查不到落回 window.i18nT
     isDiscK(k) / fields(k)                   折扣類判斷；新加一張條件的空欄位（折扣類一律固定價 price，D367）
     condPrice(c, base) / pctOf(price, base)  折扣條件換算成這張票的價格；回推百分比（D367；舊資料的 pct 仍讀得懂）
     pctText(c, bases)                        唯讀讀數（門票層回推 %）
     html(rules, scope, locked, ctx)          畫一整份條件清單（ctx 見下）
     discTimeBad(conds)                       限時折扣價高於一般折扣價？（D390 決定二十五追認：擋存）
     syncWarn(host, conds)                    把上一條寫成條件卡內的紅字；回傳 1／0（呼叫端據以擋存）
     periodWins(rules) / periodErrs(rules, et, T) / syncPeriod(host, rules, et, T)
                                              期間檢查（D342／D363；D389 起活動詳情同用）：有時間窗的條件須落在活動上架區間內、
                                              限時購買的結束不晚於活動停售；回傳 / 寫入 [data-rule-tl-err] 紅字。建立流程與活動詳情共用
     mount(host, opts)                        活動詳情用：畫進 host、自己接新增／移除／輸入，改動呼叫 opts.onChange；
                                              回傳 { render, refresh, rules, check }，refresh() 只重算價格讀數（例如票價改了）；
                                              opts.times() 給了活動時間時，check() 做期間檢查並回傳錯誤數（D389：按儲存 >0 就擋）

   限購三欄的輔助說明（D398）借 js/purchase-limits.js 的 hintHTML()——要先於本檔載入（create-event、event-detail）。

   ctx（呼叫端提供）：{ esc, featOn(id), srcChip(), pctReadout(c, scope), typeFeat }
   粉絲分級三種（feat S82，⚪ 未排定）掛 data-feat，release2.4 由 devtools 的 regate() 收起（D366 決定五／D367 決定三）。
   ctx.typeFeat（2026-10-20 D461）：呼叫端另外給某幾種條件掛的 feat——門票傳 TIX_FEAT（限時購買、限購＝S104 ⚪），
   release2.4 的門票只剩折扣與限時折扣可加；組合包不傳，限時購買與限購照舊。bookyay 帶入的條件（bky）不掛（帶入資料照樣顯示）。
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
    cap:      { person: "" },   // D427（2026-10-16）：限購只留每人總限購數量（order／times 退場）
    disc:     { price: "" },
    discTime: { price: "", from: "", to: "" },
    discTier: { price: "", tier: "fan" },
    discBoth: { price: "", from: "", to: "", tier: "fan" }
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
    "d.cond.none":     { en: "No conditions set",       zh: "未設定條件" },
    "d.cond.price.disc":     { en: "Discounted price",  zh: "折扣價" },
    "d.cond.price.discTime": { en: "Price in the window", zh: "期間內價格" },
    "d.cond.price.discTier": { en: "Price for the tier", zh: "分級價格" },
    "d.cond.price.discBoth": { en: "Tier price in the window", zh: "期間內分級價格" },
    "d.cond.pct":      { en: "Works out to",            zh: "等於" },
    "d.cond.pct.v":    { en: "{n}% off",                zh: "折 {n}%" },
    "d.cond.pct.range":{ en: "{a}–{b}% off, varies by ticket", zh: "折 {a}%–{b}%（各張票不同）" },
    "d.cond.pct.paren":{ en: "({n}% off)",              zh: "（折 {n}%）" },
    /* D368：活動層的折扣類條件填百分比，讀數是跟隨門票算出來的價格 */
    "d.cond.warn.time":{ en: "Can't be higher than the regular discounted price.", zh: "不得高於一般折扣價。" },
    "d.cond.cap.person": { en: "{n} per person",        zh: "每人 {n} 張" },
    /* 墓碑 2026-10-16（D427）：d.cond.cap.order（每次 {n} 張）、d.cond.cap.times（限 {n} 次）退場 */
    "d.cond.deal.win":   { en: "{p} until {to}",        zh: "限時 {p}（至 {to}）" },
    "d.cond.deal.after": { en: "then {p}",              zh: "之後 {p}" },
    "d.cond.deal.gen":   { en: "Discounted to {p}",     zh: "折扣價 {p}" },
    "d.cond.deal.tier":  { en: "Fan tier price {p}",    zh: "粉絲分級價 {p}" },
    "d.rule.start":   { en: "Starts",             zh: "開始時間" },
    "d.rule.end":     { en: "Ends",               zh: "結束時間" },
    "d.rule.tierpick":{ en: "Minimum fan tier",   zh: "買得到的最低分級" },
    "d.rule.cap.person":{ en: "Tickets per person, in total", zh: "每人總限購數量" },
    "d.rule.cap.person.ph":{ en: "e.g., 4",      zh: "4" }
    /* 墓碑 2026-10-16（D427）：d.rule.cap.order／.order.ph（每次交易限購數量）、d.rule.cap.times／.times.ph（限購次數）退場 */
  };
  const lang = () => (document.documentElement.lang === "zh-Hant" ? "zh" : "en");
  const t = k => (STRINGS[k] ? STRINGS[k][lang()] : ((window.i18nT && window.i18nT(k)) || k));
  const T = (k, fb) => (window.i18nT && window.i18nT(k)) || fb || k;
  const escDefault = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const isDiscK = k => k === "disc" || k === "discTime" || k === "discTier" || k === "discBoth";
  const fields = k => JSON.parse(JSON.stringify(FIELDS[k]));
  const meta = k => TYPES.filter(c => c.k === k)[0] || {};
  /* D461（2026-10-20）：門票的限時購買與限購只在最終版（S104 ⚪）；只由門票的呼叫端經 ctx.typeFeat 掛上，組合包不受影響 */
  const TIX_FEAT = { buyTime: "S104", cap: "S104" };
  /* 一種條件實際掛的 feat：種類本身的（S82）優先，其次呼叫端給的 typeFeat；bookyay 帶入的條件（c.bky）不掛 typeFeat */
  const featFor = (k, c, ctx) => meta(k).feat || (ctx && ctx.typeFeat && !(c && c.bky) ? (ctx.typeFeat[k] || "") : "");
  const name = k => t("d.cond." + k);
  const norm = r => {
    const TBX = window.ZtorTicketBundle;
    if (TBX && TBX.ruleConds) return TBX.ruleConds(r);
    return r && r.conds ? r : { conds: {} };
  };

  /* ── 價格（D367 固定價；舊資料的 pct 百分比仍讀得懂）─────────────────────────────── */
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

  /* ── 畫法（原 create-event 的 ruleField／winFieldsHTML／tierPickHTML／priceFieldHTML／condBodyHTML／
     condCardHTML／addMenuHTML／condsHTML）─────────────────────────────────── */
  function html(rules, scope, locked, ctx) {
    ctx = ctx || {};
    const esc = ctx.esc || escDefault;
    const featOn = ctx.featOn || (() => true);
    const srcChip = ctx.srcChip || (() => "");
    const pctReadout = ctx.pctReadout || (() => "—");
    /* ctx.types（D400，2026-10-12）：只開放哪幾種條件——組合包的購買條件只用 buyTime／buyTier；缺＝全部（活動） */
    const ALLOW = ctx.types ? TYPES.filter(c => ctx.types.indexOf(c.k) >= 0) : TYPES;
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
      /* D398（2026-10-12）：上限附一句輔助說明，句子與商品（件）、組合包（組）同一套，
         住在 js/purchase-limits.js＋i18n.js 的 pl.tix.*（這裡只借 hintHTML，條件卡外框不變）
         D427（2026-10-16）：限購只留每人總限購數量——每次交易限購與限購次數兩格退場（bookyay 帶入的卡也只畫這一格，D427 決定三） */
      if (k === "cap") return ["person"].map(f =>
        ruleField(t("d.rule.cap." + f),
          '<input class="input" type="number" min="1" step="1" data-rule-f="cap.' + f + '" value="' + esc(c[f]) +
            '" placeholder="' + (l ? "" : esc(t("d.rule.cap." + f + ".ph"))) + '"' + dis(l) + '>' +
          (window.ztorPurchaseLimits ? window.ztorPurchaseLimits.hintHTML(f, "tix") : "") +
          /* D428（2026-10-16）：開了限購就要填每人總限購數量——空白就地紅字、擋存（同商品端）。
             掛 data-cond-warn，與限時折扣價那一行走同一套同步（syncWarn）；bookyay 帶入鎖定的卡值已帶入，不畫 */
          (l ? "" : '<p class="field__error" data-cond-warn="cap" hidden></p>'), l)).join("");
      let h = priceFieldHTML(k, c, l);
      if (k === "discTime" || k === "discBoth") h += winFieldsHTML(k, c, l);
      if (k === "discTier" || k === "discBoth") h += tierPickHTML(k, c, l);
      /* D367 決定二推導，2026-10-09 D390 決定二十五追認：限時折扣價不得高於一般折扣價——擋存（原本只提示）。
         元素名稱沿用 data-cond-warn（兩頁的同步點都認它），外觀改成欄位錯誤。 */
      if (k === "discTime") h += '<p class="field__error" data-cond-warn="discTime" hidden>' + esc(t("d.cond.warn.time")) + '</p>';
      return h;
    }
    /* chip＝要不要在卡頂列掛來源標記：bookyay 帶入的條件卡一律掛（2026-10-15 起，取代原本「整組鎖定時不重複」的做法） */
    function cardHTML(k, c, l, chip) {
      const m = meta(k);
      const cf = featFor(k, c, ctx);   // D461：門票的限時購買／限購另掛 S104（bookyay 帶入的不掛）
      return '<div class="cond-list__item control-group control-group--plain' + (l ? " is-source-locked" : "") + '" data-cond="' + k + '"' + (cf ? ' data-feat="' + cf + '"' : "") + '>' +
          '<div class="cond-list__head">' +
            '<span class="cond-list__title"><i data-lucide="' + m.icon + '" class="ztor-icon"></i>' + esc(name(k)) + '</span>' +
            (chip ? srcChip() : "") +
            (l ? "" : '<button type="button" class="btn btn--icon btn--sm cond-list__remove" data-cond-remove="' + k + '" aria-label="' +
              esc(t("d.cond.remove") + " " + name(k)) + '"><i data-lucide="x" class="ztor-icon"></i></button>') +
          '</div>' +
          '<div class="cond-list__body">' + bodyHTML(k, c, l) + '</div>' +
        '</div>';
    }
    /* 「新增條件」選單：只列還沒加、而且在目前版本內的種類；全部加完就整顆不出現。
       addOnly（D417 決定五）：整組鎖定時仍開放的那幾種（bookyay 門票最終版可自加折扣與限時折扣），整顆選單掛 ctx.addFeat */
    function addMenuHTML(r, only) {
      const avail = (only ? ALLOW.filter(c => only.indexOf(c.k) >= 0) : ALLOW).filter(c => !r.conds[c.k]);
      if (!avail.filter(c => featOn(featFor(c.k, null, ctx))).length) return "";
      return '<details class="dropdown dropdown--left cond-list__add"' + (only && ctx.addFeat ? ' data-feat="' + ctx.addFeat + '"' : '') + '>' +
          '<summary class="btn btn--outline btn--sm"><i data-lucide="plus" class="ztor-icon"></i><span>' + esc(t("d.cond.add")) + '</span></summary>' +
          '<div class="dropdown__menu" role="menu">' +
            avail.map(c => '<button type="button" class="dropdown__item" role="menuitem" data-cond-add="' + c.k + '"' +
              (featFor(c.k, null, ctx) ? ' data-feat="' + featFor(c.k, null, ctx) + '"' : "") + '><i data-lucide="' + c.icon + '" class="ztor-icon"></i>' + esc(name(c.k)) + '</button>').join("") +
          '</div>' +
        '</details>';
    }
    const r = norm(rules);
    const keys = ALLOW.map(c => c.k).filter(k => r.conds[k]);   // 照種類固定順序排，不照加入先後
    /* D417 決定五（2026-10-15，〔推導〕）：ctx.addOnly＝整組鎖定的一份裡仍可由創作者自加的種類（bookyay 門票：折扣、限時折扣）。
       bky 條件照舊鎖；創作者自己加的（沒有 bky 標記、在 addOnly 內）可改可移除；選單只列 addOnly。
       ctx.noEmpty：沒有任何條件時不寫空狀態句（呼叫端另有自己的空狀態，例如跟隨活動的摘要） */
    const only = locked && ctx.addOnly ? ctx.addOnly : null;
    const lockOf = k => only ? (!!r.conds[k].bky || only.indexOf(k) < 0) : (locked || !!r.conds[k].bky);
    const featOf = k => only && !r.conds[k].bky && only.indexOf(k) >= 0 ? ctx.addFeat : "";
    return '<div class="cond-list">' +
        (keys.length ? keys.map(k => {
                         /* 2026-10-15 目視檢查 C5（照 design-system 條件清單的 anatomy）：bookyay 帶入的條件卡一律在卡頂列掛來源標記——
                            整組鎖定時也掛（取代原本「區塊標題已有一枚、卡上不重複」的做法：區塊標題那一枚同輪拿掉，標記跟著被鎖的那張卡） */
                         const h = cardHTML(k, r.conds[k], lockOf(k), !!r.conds[k].bky);
                         const f = featOf(k);
                         return f ? h.replace('<div class="cond-list__item', '<div data-feat="' + f + '" class="cond-list__item') : h;   // disc／discTime 本身沒有 feat，可直接掛
                       }).join("")
                     : (ctx.noEmpty ? "" : '<p class="field__hint cond-list__empty' + (ctx.emptyKey ? ' field__hint--fact' : '') + '"' + (ctx.emptyKey ? ' data-i18n="' + esc(ctx.emptyKey) + '"' : '') + '>' +
                         esc(ctx.emptyKey ? T(ctx.emptyKey, t("d.cond.empty")) : t("d.cond.empty")) + '</p>')) +
        (locked ? (only ? addMenuHTML(r, only) : "") : addMenuHTML(r)) +
      '</div>';
  }

  /* 限時折扣價高於一般折扣價（D390 決定二十五：擋存）：比價格（D460 起活動層比百分比的分支退場）。
     bookyay 帶入且鎖定的兩條不算（創作者改不了，擋了也解不開）。 */
  function discTimeBad(conds) {
    const c = conds || {};
    if (c.discTime && c.discTime.bky && c.disc && c.disc.bky) return false;
    const num = (x, f) => x && x[f] !== "" && x[f] != null && isFinite(Number(x[f])) ? Number(x[f]) : null;
    const a = num(c.discTime, "price"), b = num(c.disc, "price");
    return a != null && b != null && a > b;
  }
  /* 限購沒填（D428，2026-10-16 定案：開了限購，每人總限購數量必填）：回傳紅字的 i18n key，沒問題回空字串。
     空白＝pl.err.required「請填上限。」；填了但不是 1 以上整數＝pl.err.int。bookyay 帶入且鎖定的不算（值已帶入、改不了）。 */
  function capErrKey(conds) {
    const c = conds && conds.cap;
    if (!c || c.bky) return "";
    const v = String(c.person == null ? "" : c.person).trim();
    if (!v) return "pl.err.required";
    return /^\d+$/.test(v) && Number(v) >= 1 ? "" : "pl.err.int";
  }
  const capBad = conds => !!capErrKey(conds);
  /* 條件卡的就地紅字：限時折扣價高於一般折扣價（D390 決定二十五）＋限購沒填（D428）；回傳錯誤數 */
  function syncWarn(host, conds) {
    const bad = discTimeBad(conds);
    const w = host && host.querySelector('[data-cond-warn="discTime"]');
    if (w) w.hidden = !bad;
    const ck = capErrKey(conds);
    const cw = host && host.querySelector('[data-cond-warn="cap"]');
    if (cw) {
      cw.hidden = !ck;
      if (ck) { cw.setAttribute("data-i18n", ck); cw.textContent = T(ck, ck); } else cw.removeAttribute("data-i18n");
      const inp = host.querySelector('[data-rule-f="cap.person"]');
      if (inp) inp.setAttribute("aria-invalid", ck ? "true" : "false");
    }
    return (bad ? 1 : 0) + (ck ? 1 : 0);
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
     opts：{ rules（{conds}，直接改這份）, scope（門票 id）, ctx, onChange(),
             times()（選填：回傳活動時間 et——給了就在改期間時就地比上架區間，D389）,
             tr(k)（選填：期間紅字的取字函式；組合包用它把「活動上架區間」換成「組合包的上架區間」） }
     ctx 另可帶 types（只開放哪幾種條件）、emptyKey（沒有條件時那一句的 i18n key）——D400：純商品組合包的購買條件
     opts.locked＋ctx.addOnly／addFeat／noEmpty（D417，2026-10-15）：整組鎖定的一份（bookyay 門票），只開放 addOnly 那幾種自加 */
  function mount(host, opts) {
    if (!host) return null;
    const st = { rules: norm(opts.rules), scope: opts.scope, ctx: opts.ctx || {} };
    /* 期間紅字：shown＝已經按過儲存被擋（之後每改一次就重比）；還沒按儲存前只在改期間欄位時比 */
    /* D390 決定二十五：限時折扣價高於一般折扣價同樣算一個錯（擋存） */
    const check = () => (opts.times ? syncPeriod(host, st.rules, opts.times(), opts.tr) : 0) + syncWarn(host, st.rules.conds);
    function render() {
      host.innerHTML = html(st.rules, st.scope, !!opts.locked, st.ctx);   // opts.locked＋ctx.addOnly：bookyay 門票最終版只能自加折扣類（D417）
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
      host.querySelectorAll("[data-ph-key]").forEach(el => { el.placeholder = T(el.dataset.phKey, ""); });
      syncWarn(host, st.rules.conds);
      check();
      const d = window.ztorDevState; if (d && d.regate) d.regate();
    }
    host.onclick = e => {
      const add = e.target.closest("[data-cond-add]");
      const rm = !add && e.target.closest("[data-cond-remove]");
      if (!add && !rm) return;
      const k = (add || rm).dataset[add ? "condAdd" : "condRemove"];
      const only = opts.locked ? (st.ctx.addOnly || []) : null;
      if (only && only.indexOf(k) < 0) return;         // 整組鎖定：只有 addOnly 內的種類可加可移除（D417）
      if (add) {
        if (st.rules.conds[k]) return;                 // 每種最多一次
        st.rules.conds[k] = fields(k);
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
      if (p[0] === "cap") syncWarn(host, st.rules.conds);   // D428：限購一填就收紅字
      if (p[1] === "price") {
        const out = host.querySelector('[data-cond-pct="' + p[0] + '"]');
        const c = st.rules.conds[p[0]];
        if (out) out.textContent = st.ctx.pctReadout ? st.ctx.pctReadout(c, st.scope) : "—";
        syncWarn(host, st.rules.conds);
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
        out.textContent = st.ctx.pctReadout ? st.ctx.pctReadout(c, st.scope) : "—";
      });
      syncWarn(host, st.rules.conds);
    }
    /* check()：期間檢查（D389）——把紅字寫在各條件的期間欄位下，回傳錯誤數；呼叫端按儲存時 >0 就擋下不存 */
    return { render: render, refresh: refresh, rules: () => st.rules, check: check };
  }

  window.ztorPurchaseConds = {
    TYPES: TYPES, FIELDS: FIELDS, FAN_TIERS: FAN_TIERS, STRINGS: STRINGS, TIX_FEAT: TIX_FEAT, featFor: featFor,
    t: t, isDiscK: isDiscK, fields: fields, norm: norm,
    condPrice: condPrice, pctOf: pctOf, pctText: pctText,
    html: html, syncWarn: syncWarn, discTimeBad: discTimeBad, capErrKey: capErrKey, capBad: capBad, mount: mount,
    periodWins: periodWins, periodErrs: periodErrs, syncPeriod: syncPeriod
  };
  /* 「新增條件」選單打開時量下方空間（2026-10-12 使用者回報被遮住）：觸發鈕常坐在彈窗內文（overflow:auto）的底部，
     往下展開會被切掉。找最近的捲動容器（沒有就用視窗），下方放不下、上方放得下就掛 dropdown--up 往上開。 */
  document.addEventListener("toggle", e => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.classList.contains("cond-list__add")) return;
    d.classList.remove("dropdown--up");
    if (!d.open) return;
    const menu = d.querySelector(".dropdown__menu");
    if (!menu) return;
    let box = d.parentElement;
    while (box && box !== document.body && !/(auto|scroll|hidden)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    const bound = (box && box !== document.body) ? box.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const trig = d.getBoundingClientRect();
    const need = menu.offsetHeight + 12;
    if (bound.bottom - trig.bottom < need && trig.top - bound.top >= need) d.classList.add("dropdown--up");
  }, true);
})();
