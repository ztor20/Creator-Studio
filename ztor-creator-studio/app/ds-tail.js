/* 設計系統各頁共用的檔尾：示範用的 JS、語言／版寬切換、目錄捲動同步、完整性報告。只改這一份。 */
document.write(String.raw`
<!-- js/icons-all.js（1.8MB 全套 Tabler）2026-09-17 起改為展開「未使用」清單時才載，見下方 Icon gallery script -->
<script src="js/icons.js?v=r2.2"></script>
<script src="partials/date-input.js?v=r2.2"></script>
<script src="partials/upload-tile.js?v=r2.2"></script>
<script src="partials/album-tracks.js?v=r2.2"></script>
<script src="partials/vip-card.js?v=r2.2"></script>
<script src="partials/owner-lookup.js?v=r2.2"></script>
<script src="partials/radio-list.js?v=r2.2"></script>
<script src="partials/field-more.js?v=r2.2"></script>
<!-- 無自帶 CSS 的 JS 元件（§4.123–4.131）：demo 由這些模組當場產生，不是照模板手抄。
     順序有兩個約束：work-taxonomy 要早於 work-fields（後者初始化時就取它的值域）、
     films-store 要早於 film-picker（候選來源）。components.js 執行當下就掛載，
     所以它的佔位 div（§4.129 的卡）在文件裡本來就在它上面。publish-preview.js
     （§4.130，D223 取代 lang-switch.js）與 login-lang-prompt.js（§4.131，D225）都是
     呼叫式 API，不必特別排序，demo 按鈕的接線見下方 script。login-lang-prompt.js
     載入當下會自檢 sessionStorage 旗標（見 §4.131），本頁沒寫過那兩把旗標，檢查
     一定落空、不會憑空跳出彈窗。 -->
<script src="js/work-taxonomy.js?v=r2.2"></script>
<script src="partials/work-fields.js?v=r2.2"></script>
<script src="js/films-store.js?v=r2.2"></script>
<script src="partials/film-picker.js?v=r2.2"></script>
<script src="partials/archived-gate.js?v=r2.2"></script>
<script src="js/currency.js?v=r2.2"></script><!-- D517：補登彈窗的幣別下拉 -->
<script src="partials/manual-entry-modal.js?v=r2.2"></script>
<script src="partials/source-upload-modal.js?v=r2.2"></script>
<script src="partials/fee-exception-modal.js?v=r2.2"></script>
<script src="js/events-store.js?v=r2.2"></script>   <!-- 2026-09-22：§4.130 demo 的幣別換算（D306）讀它的 fx／priceIn -->
<script src="partials/rich-body.js?v=r2.2"></script>  <!-- §4.215 demo 的描述區塊（D354，只用靜態工具） -->
<script src="partials/venue-map.js?v=r2.2"></script><!-- D369：Fan event page 示範的「活動地點」地圖＋Venue map 元件 -->
<script src="js/fan-event-page.js?v=r2.2"></script>  <!-- 2026-09-22：§4.130 demo 的預覽檢視＝§4.215 Fan event page（D305） -->
<script src="js/fan-product-page.js?v=r2.2"></script>  <!-- 2026-09-23：§4.215（商品頁） Fan product page 的 demo，也是 §4.216 Publish stage 商品側 previewRender 的同一支 -->
<script src="js/fan-bundle-page.js?v=r2.2"></script>  <!-- 2026-09-23：§4.215（組合包頁） Fan bundle page 的 demo，也是 §4.216 Publish stage 組合側 previewRender 的同一支 -->
<script src="js/fan-project-page.js?v=r2.2"></script>  <!-- 2026-09-23：§4.215（專案頁） Fan project page 的 demo，也是 §4.216 Publish stage 專案側 previewRender 的同一支 -->
<script src="partials/publish-preview.js?v=r2.2"></script>
<script src="js/publish-stage.js?v=r2.2"></script>  <!-- 2026-09-22：§4.216 Publish stage（D310 全頁版）的 demo -->
<script src="partials/login-lang-prompt.js?v=r2.2"></script>
<script src="js/components.js?v=r2.2"></script>
<script src="js/loyalty-settings.js?v=r2.2"></script>
<script src="js/fans-roster.js?v=r2.2"></script>
<script>
/* §4.249 Loyalty settings／§4.250 Fans roster 的值域一覽：數字由兩支模組當場填（2026-11-02 #460） */
(function () {
  var L = window.ztorLoyalty, F = window.ztorFans;
  var lb = document.querySelector('[data-ds-loyalty]'), rb = document.querySelector('[data-ds-roster]');
  function row(cells) { var tr = document.createElement('tr'); cells.forEach(function (c) { var td = document.createElement('td'); td.textContent = c; tr.appendChild(td); }); return tr; }
  if (L && lb) {
    var d = L.DEFAULTS, g = L.get();
    [['K_A', d.KA, g.KA], ['γ (A3 / A4)', d.gamma.a3 + ' / ' + d.gamma.a4, g.gamma.a3 + ' / ' + g.gamma.a4],
     ['B1 / B4 / B5 / B3', [d.pts.b1, d.pts.b4, d.pts.b5, d.pts.b3].join(' / '), [g.pts.b1, g.pts.b4, g.pts.b5, g.pts.b3].join(' / ')],
     ['Top %', d.topPct.join(' / '), g.topPct.join(' / ')], ['S_floor', d.sFloor, g.sFloor],
     ['Active / At risk / Recent (days)', [d.activeDays, d.riskDays, d.recentDays].join(' / '), [g.activeDays, g.riskDays, g.recentDays].join(' / ')],
     ['Tier names', '—', Object.keys(g.names).map(function (k) { return k + '=' + g.names[k]; }).join(', ') || '—']
    ].forEach(function (r) { lb.appendChild(row(r.map(String))); });
  }
  if (F && rb) {
    var S = F.summary();
    [['Fans (total)', S.total], ['Active', S.active], ['At risk', S.risk], ['Revenue (active window)', '$' + S.revenue.toLocaleString('en-US')], ['Avg loyalty points', S.avg],
     ['Active per tier (inner / super / devoted / fan)', ['inner', 'super', 'devoted', 'fan'].map(function (t) { return S.tiers[t].active; }).join(' / ')],
     ['All per tier', ['inner', 'super', 'devoted', 'fan'].map(function (t) { return S.tiers[t].all; }).join(' / ')]
    ].forEach(function (r) { rb.appendChild(row([r[0], String(r[1])])); });
  }
})();
</script>
<script>
/* §4.123–4.129 的 demo 掛載。三種掛法各對應元件自己的用法：
   work-fields 用它的 renderAll、film-picker 用它的 create 函式、
   三支彈窗模組給的是模板字串所以直接注入（並解除 [hidden]，卡片內不需要開關）。
   work-taxonomy 與 components.js 自己會就地接線，這裡不必動。 */
(function () {
  var wf = document.querySelector('[data-ds-workfields]');
  if (wf && window.ZtorWorkFields) window.ZtorWorkFields.renderAll(wf, ['audio', 'genres', 'pricing']);

  var fp = document.querySelector('[data-ds-filmpicker]');
  if (fp && window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.createFilmPicker) {
    window.ZTOR_PARTIALS.createFilmPicker(fp, { selected: ['film-neon-harbor'] });
  }
  /* §4.125 唯讀示範（D288）：同一個模組、readonly:true */
  var fpRo = document.querySelector('[data-ds-filmpicker-ro]');
  if (fpRo && window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.createFilmPicker) {
    window.ZTOR_PARTIALS.createFilmPicker(fpRo, { selected: ['film-neon-harbor'], readonly: true });
  }
  /* §4.202 Archived gate 示範：外框帶 data-archived，閘門擋開關與欄位；「解除封存」放行、按了拿掉 data-archived 再按一次放回（D298） */
  var gate = document.querySelector('[data-ds-gate]');
  if (gate && window.ZtorArchivedGate) {
    var gatePicker = document.querySelector('[data-ds-gate-filmpicker]');
    var gp = (gatePicker && window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.createFilmPicker) ? window.ZTOR_PARTIALS.createFilmPicker(gatePicker, { selected: ['film-neon-harbor'], readonly: true }) : null;
    window.ZtorArchivedGate.install(gate);
    var sw = gate.querySelector('[data-ds-gate-switch]');
    if (sw) sw.addEventListener('click', function () { var on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', on ? 'true' : 'false'); sw.classList.toggle('switch--on', on); });
    var rl = gate.querySelector('[data-ds-gate-unarchive]');
    if (rl) rl.addEventListener('click', function () {
      var archived = !gate.hasAttribute('data-archived');
      gate.toggleAttribute('data-archived', archived);
      if (gp) gp.setReadonly(archived);
      var banner = gate.querySelector('.info-banner'); if (banner) banner.hidden = !archived;
      rl.querySelectorAll('span').forEach(function (sp) { sp.textContent = sp.hasAttribute('data-zh') ? (archived ? '解除封存' : '封存（示範）') : (archived ? 'Unarchive' : 'Archive (demo)'); });
      var ic = rl.querySelector('.ztor-icon'); if (ic) { ic.outerHTML = '<i data-lucide="' + (archived ? 'archive-restore' : 'archive') + '" class="ztor-icon"></i>'; if (window.ztorIcons) window.ztorIcons.applyIcons(rl); }
    });
  }

  /* §4.130 Publish preview demo：呼叫式 API，用假欄位（沒有真的表單）示範語言分頁＋預覽/列表
     切換＋草稿保留。2026-09-22（D305／D306）改成活動示範：previewRender＝§4.215 Fan event page、
     兩個視圖（有組合包）；幣別軸於 2026-11-05（D514 決定三）退場，預覽只用 baseCurrency。 */
  var ppDemoName = { value: 'NICK Symphonic Night — Taipei' };
  var ppDemoHl = { value: 'Encore: one unreleased song' };
  var ppDemoDesc = { value: 'The catalogue rearranged for a full orchestra. One night, seated only.' };
  var ppDemoTierA = { value: 'Lower level' }, ppDemoTierB = { value: 'Upper level' };
  var ppDemoPrices = [
    { key: 'tier:a', label: 'Lower level', groupKey: 'pp.price.tiers', groupFallback: 'Ticket types', priceObj: { base: 'TWD', amount: 2800 }, locked: false },
    { key: 'tier:b', label: 'Upper level', groupKey: 'pp.price.tiers', groupFallback: 'Ticket types', priceObj: { base: 'TWD', amount: 1800 }, locked: false },
    { key: 'bundle:x', label: '一樓票 ＋ 交響夜場刊', groupKey: 'pp.price.bundles', groupFallback: 'Ticket bundles', priceObj: { base: 'TWD', amount: 3200 }, locked: false }
  ];
  /* §4.215／§4.130 共用的示範 model（前台鏡像版的 model 形狀，見 js/fan-event-page.js 檔頭） */
  function ppDemoModel() {
    return {
      status: { labelKey: 'fep.status.on-sale', fallback: 'On sale', tone: 'badge--success' },
      typeLabel: 'Concert', region: 'Taipei, Taiwan', keyvisual: 'images/projects/nick-lwh.jpg', gallery: ['images/projects/nick-lwh.jpg'], video: true,
      name: { key: 'name' }, highlight: { key: 'highlight' }, organizer: 'NICKTHEREAL 周湯豪', organizerAvatar: 'images/ip/nick-portrait.jpg',
      date: '2026-12-05', time: '19:30 – 21:30', duration: '2 h', venue: 'Taipei Music Center', address: '台北市南港區市民大道八段 99 號', language: ['Cantonese', 'Mandarin'],   /* D328：活動語言可複選，陣列由渲染器串成一行 */
      meet: 'Gate 2, ticket booth', transit: '3 min walk from Taipei Arena Station Exit 2',   /* D445：集合地點與交通說明（有值才畫，在活動地點一節的地圖下方；宿主可給 { key } 吃譯文，沒值給 null） */
      priority: null, limit: 'Up to 4 per person', desc: { key: 'desc' }, lineup: [{ name: 'NICKTHEREAL 周湯豪', role: null }],
      pickup: 'E-ticket (QR)', terms: null,   /* D327：第一組清單與取票說明欄已刪；D334：notes／bring 兩份清單已刪 */
      /* D354：描述＝區塊（文字含粗體、斜體、連結、清單、分隔線；圖片自成一個區塊），照區塊順序畫在「關於活動」。
         墓碑 2026-10-05：infoSections（說明區塊）退場，原內容改為無標題的文字區塊（原標題＝第一行粗體）。 */
      descBlocks: [
        { type: 'text', html: '<p>The catalogue rearranged for a full orchestra. One night, <em>seated only</em>.</p>' },
        { type: 'text', html: '<p><strong>VIP 彩排參觀</strong></p><p>VIP 持票者演出當天 16:00 於 2 號門集合，集合路線見 <a href="https://example.com/symphonic/vip" target="_blank" rel="noopener noreferrer">VIP 集合說明</a>。</p><hr><p><strong>輪椅席購票方式</strong></p><ul><li>先購買一樓或看台門票</li><li>開演前 7 天來信客服登記，每位輪椅使用者可有 1 位陪同者</li></ul>' },
        { type: 'image', src: 'images/projects/nick-lwh.jpg' },
        { type: 'text', html: '<p>陪同者票與輪椅席相鄰，入場時請一起驗票。</p>' }
      ],
      tiers: [
        /* D328：hidden:true 的票（這裡的 c）不在票價清單列出。墓碑 2026-10-05（D353）：desc（門票簡介）整欄移除 */
        /* D443：offer＝開賣當下的折扣價（基準幣別）；timed＝限時折扣（畫標記與優惠至） */
        { key: 'a', name: { key: 'tier-a' }, note: '', priceObj: ppDemoPrices[0].priceObj, priceKey: 'tier:a', soldOut: false, offer: { amount: 2400, timed: true, to: '2026-11-30 23:59' } },
        { key: 'b', name: { key: 'tier-b' }, note: 'Programme included', priceObj: ppDemoPrices[1].priceObj, priceKey: 'tier:b', soldOut: true },
        { key: 'c', name: { key: 'tier-c' }, note: '', hidden: true, priceObj: ppDemoPrices[1].priceObj, priceKey: 'tier:b', soldOut: false }
      ],
      /* D443：套組卡＋看詳情彈窗——offer＝開賣當下生效的限時折扣、成員帶單買價（單價）與日期場館；perks 退場（D402） */
      bundles: [{ name: '一樓票 ＋ 交響夜場刊', priceObj: ppDemoPrices[2].priceObj, priceKey: 'bundle:x',
        listPriceObj: { base: 'TWD', amount: 3400 }, offer: { pct: 10, to: '2026-11-30' },
        tickets: { names: ['Lower level', 'Upper level'], qty: 1, unitFrom: true, unitPriceObj: ppDemoPrices[1].priceObj, when: '2026-12-05 19:30 · Taipei Music Center' },
        goods: [{ name: 'NICK Symphonic Night 場刊', qty: 1, spec: true, img: 'images/products/tee-black.webp', unitPriceObj: { base: 'TWD', amount: 600 } }],
        imgs: ['images/products/tee-black.webp', 'images/projects/nick-lwh.jpg'], desc: 'One lower-level seat and the night’s programme, picked up at the merch desk.' }],
      related: window.ztorFanEventPage && window.ztorFanEventPage.relatedFromStore ? window.ztorFanEventPage.relatedFromStore(null, 3) : true
    };
  }
  /* §4.215 就地渲染：替身 api（固定語系／幣別、不開 inline 編輯），同一條渲染路徑 */
  var fepHost = document.querySelector('[data-ds-fep-demo]');
  if (fepHost && window.ztorFanEventPage) {
    var fepVals = { name: ppDemoName.value, highlight: ppDemoHl.value, desc: ppDemoDesc.value, 'tier-a': ppDemoTierA.value, 'tier-b': ppDemoTierB.value, 'tier-c': 'Bundle-only seat' };
    var S = window.ztorEvents;
    var fepApi = {
      lang: 'en', isDefault: true,
      getValue: function (k) { return fepVals[k] || ''; },
      bindEditable: function (el, k) { el.textContent = fepVals[k] || ''; el.classList.toggle('is-empty', !fepVals[k]); },
      currency: 'TWD',
      priceIn: function (po) { return S ? S.priceIn(po, 'TWD') : (po && po.amount) || 0; },
      money: function (po) { return S ? S.fmtMoney('TWD', S.priceIn(po, 'TWD')) : 'NT$' + ((po && po.amount) || 0); },
      fmt: function (n) { return S ? S.fmtMoney('TWD', n) : 'NT$' + n; }
      /* 墓碑 2026-10-16（D443）：view／views／setView（兩個視圖）退場 */
    };
    window.ztorFanEventPage.render(fepHost, ppDemoModel(), fepApi);
    /* D443 看詳情彈窗的兩種殼：同一個渲染器畫進兩個固定寬度的框（容器查詢依框寬切版），程式點開第一組套組的「看詳情」 */
    [['[data-ds-fep-popup-wide]', 1040], ['[data-ds-fep-popup-sheet]', 375]].forEach(function (pair) {
      var h = document.querySelector(pair[0]);
      if (!h) return;
      window.ztorFanEventPage.render(h, ppDemoModel(), fepApi);
      var open = h.querySelector('.pdp-sets-aside [data-set-view]');
      if (open) open.click();
    });
  }
  /* §4.243 Fan phone：同一份示範資料畫進 236 寬的手機框（UI-CHANGES 394） */
  var fphHost = document.querySelector('[data-ds-fan-phone-demo]');
  if (fphHost && window.ztorFanEventPage && typeof fepApi !== 'undefined') window.ztorFanEventPage.render(fphHost, ppDemoModel(), fepApi);
  /* §4.215（商品頁） Fan product page 就地渲染：替身 api（固定語系／幣別、不開 inline 編輯），同一條渲染路徑，
     示範一件有兩顆選項（尺寸）、有折扣、快沒庫存的實體商品，觸發折後價／省多少／庫存提醒三個分支。 */
  var fppHost = document.querySelector('[data-ds-fpp-demo]');
  if (fppHost && window.ztorFanProductPage) {
    var fppDemoName = 'REALIVE Tour Hoodie';
    var fppDemoDesc = 'Heavyweight cotton hoodie with the tour print across the back, washed for a lived-in feel.';
    var fppDemoReturns = 'Exchanges accepted within 7 days of delivery, unworn with tags attached.';
    var fppVals = { name: fppDemoName, desc: fppDemoDesc, returns: fppDemoReturns };
    var fppApi = {
      lang: 'en', isDefault: true,
      getValue: function (k) { return fppVals[k] || ''; },
      bindEditable: function (el, k) { el.textContent = fppVals[k] || ''; el.classList.toggle('is-empty', !fppVals[k]); },
      currency: 'TWD',
      priceIn: function (po) { return (po && po.amount) || 0; },
      money: function (po, k) { var n = (po && po.amount) || 0; return 'NT$' + n.toLocaleString('en-US'); },
      fmt: function (n) { return 'NT$' + Number(n || 0).toLocaleString('en-US'); }
    };
    var fppModel = {
      category: 'Apparel', badge: '', gallery: ['images/products/tee-black.webp'],
      name: { key: 'name' }, shop: null,
      price: null,
      variants: {
        groups: [{ name: 'Size', kind: '', values: [{ label: 'S' }, { label: 'M' }, { label: 'L' }] }],
        rows: [{ priceObj: { base: 'TWD', amount: 1280 } }]
      },
      discountPct: 15, stock: 6, sizeGuide: true,
      delivery: { icon: 'truck', key: 'cp.delivery.shipping', fallback: 'Shipping' },
      desc: { key: 'desc' },
      specs: [{ k: 'Material', v: '100% cotton' }, { k: 'Fit', v: 'Regular' }],
      returns: { key: 'returns' }, related: true
    };
    window.ztorFanProductPage.render(fppHost, fppModel, fppApi);
  }
  /* §4.215（組合包頁） Fan bundle page 就地渲染：替身 api（固定語系／幣別、不開 inline 編輯），同一條渲染路徑，
     兩份示範各觸發一種 kind——純商品套組（goods，規格挑選＋套組內容）與含票券組合（eventset，
     座位區域＋活動資訊框＋組合折扣造成的票種價差）。 */
  function fbpApi(vals) {
    return {
      lang: 'en', isDefault: true,
      getValue: function (k) { return vals[k] || ''; },
      bindEditable: function (el, k) { el.textContent = vals[k] || ''; el.classList.toggle('is-empty', !vals[k]); },
      currency: 'TWD',
      priceIn: function (po) { return (po && po.amount) || 0; },
      money: function (po) { var n = (po && po.amount) || 0; return 'NT$' + n.toLocaleString('en-US'); },
      fmt: function (n) { return 'NT$' + Number(n || 0).toLocaleString('en-US'); }
    };
  }
  var fbpGoodsHost = document.querySelector('[data-ds-fbp-demo-goods]');
  if (fbpGoodsHost && window.ztorFanBundlePage) {
    var fbpGoodsVals = {
      name: 'REALIVE Tour Merch Set', desc: 'Hoodie and tote from the tour, boxed together and a little cheaper than buying separately.',
      'perk-0': 'Tour-exclusive colourway'
    };
    var fbpGoodsModel = {
      kind: 'goods',
      gallery: ['images/products/tee-black.webp'],
      name: { key: 'name' }, desc: { key: 'desc' },
      shop: { name: 'REALIVE Official Shop', avatar: '' },
      event: null,
      members: [
        { kind: 'product', name: 'REALIVE Tour Hoodie', qty: 1, priceObj: { base: 'TWD', amount: 1280 }, from: false,
          options: [{ name: 'Size', values: ['S', 'M', 'L'] }] },
        { kind: 'product', name: 'REALIVE Tour Tote', qty: 1, priceObj: { base: 'TWD', amount: 480 }, from: false, options: [] }
      ],
      price: { priceObj: { base: 'TWD', amount: 1580 }, priceKey: 'bundle',
        wasObj: { base: 'TWD', amount: 1760 }, from: false, pct: 10 },
      stock: 8,
      perks: [{ key: 'perk-0' }]
    };
    window.ztorFanBundlePage.render(fbpGoodsHost, fbpGoodsModel, fbpApi(fbpGoodsVals));
  }
  var fbpEventHost = document.querySelector('[data-ds-fbp-demo-eventset]');
  if (fbpEventHost && window.ztorFanBundlePage) {
    var fbpEventVals = {
      name: 'VIP ＋ 巡演 T 恤', desc: '含最靠近舞台的座位與一件巡演限定 T 恤，數量有限。',
      'perk-0': '入場前 15 分鐘優先進場'
    };
    var fbpEventModel = {
      kind: 'eventset',
      gallery: ['images/projects/nick-lwh.jpg'],
      name: { key: 'name' }, desc: { key: 'desc' },
      shop: { name: 'NICKTHEREAL 周湯豪', avatar: 'images/ip/nick-portrait.jpg' },
      event: {
        name: 'NICK Symphonic Night — Taipei', typeLabel: 'Concert', date: '2026-12-05', time: '19:30',
        venue: 'Taipei Music Center', online: false, img: 'images/projects/nick-lwh.jpg',
        status: { label: 'On sale', tone: 'green' }
      },
      members: [
        { kind: 'ticket', qty: 2, tiers: [
          { id: 'a', name: 'VIP', priceObj: { base: 'TWD', amount: 3200 }, left: 6 },
          { id: 'b', name: 'Floor', priceObj: { base: 'TWD', amount: 2200 }, left: 40 }
        ] },
        { kind: 'product', name: 'Tour T-Shirt', img: 'images/products/tee-black.webp', qty: 1, priceObj: { base: 'TWD', amount: 800 }, from: false, options: [] }
      ],
      price: { priceObj: { base: 'TWD', amount: 6280 }, priceKey: 'bundle',
        wasObj: { base: 'TWD', amount: 7200 }, from: true, pct: 5 },
      stock: 6,
      perks: [{ key: 'perk-0' }]
    };
    window.ztorFanBundlePage.render(fbpEventHost, fbpEventModel, fbpApi(fbpEventVals));
  }
  /* §4.215（專案頁） Fan project page 就地渲染：替身 api（固定語系／幣別、不開 inline 編輯），同一條渲染路徑，
     兩份示範各觸發一種 kind——直接發行（golive，標題頁：海報＋價格鈕＋關於這部作品）與共創（fund，
     cocreate 版型：募資面板＋方案卡＋預算分配＋交付時程，固定顯示 0 人支持／0%）。 */
  function fpjApi(vals) {
    return {
      lang: 'en', isDefault: true,
      getValue: function (k) { return vals[k] || ''; },
      bindEditable: function (el, k) { el.textContent = vals[k] || ''; el.classList.toggle('is-empty', !vals[k]); },
      currency: 'TWD',
      priceIn: function (po) { return (po && po.amount) || 0; }
    };
  }
  var fpjGoliveHost = document.querySelector('[data-ds-fpj-demo-golive]');
  if (fpjGoliveHost && window.ztorFanProjectPage) {
    var fpjGoliveVals = {
      name: 'Late Night Radio', desc: 'A single-take live recording, mixed for headphones.',
      story: 'Recorded in one evening at a home studio in Taipei — no overdubs, just the room and the song.'
    };
    var fpjGoliveModel = {
      kind: 'golive', film: false,
      name: { key: 'name' }, desc: { key: 'desc' }, story: { key: 'story' },
      creator: '', poster: 'images/products/tee-black.webp', media: [], hasTrailer: false,
      facts: ['2026', 'Single'], keywords: ['Single', 'Indie rock'], meta: [],
      access: 'ppv',
      price: { priceObj: { base: 'TWD', amount: 150 }, priceKey: 'price', from: false }
    };
    window.ztorFanProjectPage.render(fpjGoliveHost, fpjGoliveModel, fpjApi(fpjGoliveVals));
  }
  var fpjFundHost = document.querySelector('[data-ds-fpj-demo-fund]');
  if (fpjFundHost && window.ztorFanProjectPage) {
    var fpjFundVals = {
      name: 'Sunset Rollercoaster — New Album', desc: 'A full studio album, pressed to vinyl and shipped worldwide.',
      story: 'This is our first fully independent release — no label, just the band and the people backing it directly.'
    };
    var fpjFundModel = {
      kind: 'fund', film: false,
      name: { key: 'name' }, desc: { key: 'desc' }, story: { key: 'story' },
      creator: 'Gary Lin', poster: 'images/projects/nick-lwh.jpg', media: [], hasTrailer: false,
      facts: [], keywords: ['Album', 'Vinyl'], meta: [{ k: 'Artists', v: 'Sunset Rollercoaster' }],
      access: 'free', price: null,
      fund: { goal: { base: 'TWD', amount: 600000 }, days: 23, deadline: '2026-10-23 23:59' },
      delivery: {
        date: '2026-12-01',
        milestones: [
          { label: 'Campaign funded', state: 'done' },
          { label: 'Production', state: 'doing' },
          { label: 'Shipping', state: 'todo' }
        ]
      },
      tiers: [
        { key: 't1', name: 'Early bird', priceObj: { base: 'TWD', amount: 600 }, priceKey: 't1',
          benefits: ['Digital album', 'Thank-you credit'], cap: 50 },
        { key: 't2', name: 'Vinyl edition', priceObj: { base: 'TWD', amount: 1600 }, priceKey: 't2',
          benefits: ['Vinyl LP', 'Digital album', 'Thank-you credit'], cap: null }
      ],
      budget: [
        { label: 'Production', pct: 50 },
        { label: 'Packaging', pct: 20 },
        { label: 'Shipping', pct: 30 }
      ]
    };
    window.ztorFanProjectPage.render(fpjFundHost, fpjFundModel, fpjApi(fpjFundVals));
  }
  function openPpDemo() {
    if (!window.ztorPublishPreview) return;
    window.ztorPublishPreview.open({
      fields: [
        { key: 'name', el: ppDemoName, kind: 'input', labelKey: 'pp.field.name', labelFallback: 'Name' },
        { key: 'highlight', el: ppDemoHl, kind: 'input', labelKey: 'pp.field.highlight', labelFallback: 'Highlight' },
        { key: 'desc', el: ppDemoDesc, kind: 'textarea', labelKey: 'pp.field.desc', labelFallback: 'Description' },
        { key: 'tier-a', el: ppDemoTierA, kind: 'input', labelKey: null, labelFallback: 'Ticket type name', group: 'Ticket types' },
        { key: 'tier-b', el: ppDemoTierB, kind: 'input', labelKey: null, labelFallback: 'Ticket type name', group: 'Ticket types' }
      ],
      prices: ppDemoPrices,
      baseCurrency: 'TWD',
      mode: 'publish',
      shell: 'fan',
      previewRender: function (host, api) {
        if (!window.ztorFanEventPage) return;
        window.ztorFanEventPage.render(host, ppDemoModel(), api);
      },
      onConfirm: function () {}
    });
  }
  /* §4.216 Publish stage demo：與 §4.130 同一份示範資料，改用全頁版（D310）就地掛載。
     checks() 故意留一項未過，示範「主鈕被擋住」與「點一項跳回該步驟」兩件事。 */
  var psHost = document.querySelector('[data-ds-pstage-demo]');
  if (psHost && window.ztorPublishStage) {
    window.ztorPublishStage.mount(psHost, {
      fields: [
        { key: 'name', el: ppDemoName, kind: 'input', labelKey: 'pp.field.name', labelFallback: 'Name' },
        { key: 'highlight', el: ppDemoHl, kind: 'input', labelKey: 'pp.field.highlight', labelFallback: 'Highlight' },
        { key: 'desc', el: ppDemoDesc, kind: 'textarea', labelKey: 'pp.field.desc', labelFallback: 'Description' },
        { key: 'tier-a', el: ppDemoTierA, kind: 'input', labelKey: null, labelFallback: 'Ticket type name', group: 'Ticket types' },
        { key: 'tier-b', el: ppDemoTierB, kind: 'input', labelKey: null, labelFallback: 'Ticket type name', group: 'Ticket types' }
      ],
      prices: ppDemoPrices,
      baseCurrency: 'TWD',
      mode: 'publish',
      editZones: [{ sel: '.pdp-buy__title', step: 2 }, { sel: '.pdp-details__lead', step: 2 }, { sel: '[data-pdp-tiers-target]', step: 5 }, { sel: '[data-fep-sets]', step: 6 }],
      onEdit: function () {},
      checks: function () {
        return [
          { key: 'type', label: 'Event type selected', ok: true, step: 2 },
          { key: 'name', label: 'Event name filled', ok: true, step: 2 },
          { key: 'date', label: 'Date set', ok: true, step: 3 },
          { key: 'venue', label: 'Venue set', ok: true, step: 3 },
          { key: 'ticket', label: 'At least 1 ticket tier', ok: true, step: 5 }
        ];
      },
      previewRender: function (host, api) {
        if (!window.ztorFanEventPage) return;
        window.ztorFanEventPage.render(host, ppDemoModel(), api);
      },
      onPrimary: function () {},
      onSecondary: null
    });
  }

  var ppBtn1 = document.getElementById('ds-pp-demo-btn');
  var ppBtn2 = document.getElementById('ds-pp-demo-btn-zh');
  if (ppBtn1) ppBtn1.addEventListener('click', openPpDemo);
  if (ppBtn2) ppBtn2.addEventListener('click', openPpDemo);

  /* §4.131 Login lang prompt demo：手動 API，不走 sessionStorage 旗標——固定示範
     「登入時選了繁中、帳號預設是英文」這組情境。 */
  function openLlpDemo() {
    if (!window.ztorLoginLangPrompt) return;
    window.ztorLoginLangPrompt.show('zh-Hant', 'en');
  }
  var llpBtn1 = document.getElementById('ds-llp-demo-btn');
  var llpBtn2 = document.getElementById('ds-llp-demo-btn-zh');
  if (llpBtn1) llpBtn1.addEventListener('click', openLlpDemo);
  if (llpBtn2) llpBtn2.addEventListener('click', openLlpDemo);

  document.querySelectorAll('[data-ds-partial]').forEach(function (host) {
    var tpl = window.ZTOR_PARTIALS && window.ZTOR_PARTIALS[host.getAttribute('data-ds-partial')];
    if (!tpl) return;
    host.innerHTML = tpl;
    if (window.ztorCurrency) window.ztorCurrency.paint(host);
    host.querySelectorAll('[hidden]').forEach(function (el) {
      /* 只解除彈窗外層那一層的 hidden：內部條件區塊（例如編輯模式才藏的 Creator 搜尋）
         保持原樣，那才是它真實的長相。 */
      if (el.classList.contains('payout-modal')) el.hidden = false;
    });
  });

  if (window.ztorIcons) window.ztorIcons.applyIcons(document.body);
})();
</script>
<script>
  /* Icon gallery — 執行期由 icons-all.js 實際載入的內容生成「未使用」清單。
     展開時才建（懶載入），避免一開頁就渲染數千個 SVG。 */
  (function () {
    var fold = document.getElementById('icon-gallery-fold');
    var grid = document.getElementById('icon-gallery-grid');
    if (!fold || !grid) return;
    var built = false;
    fold.addEventListener('toggle', function () {
      if (!fold.open || built) return;
      built = true;
      // 2026-09-17：全套 Tabler（icons-all.js，1.8MB）改為此刻才載入——本頁的示範全用策展 registry 就夠，
      // 不需要為了這個摺疊區一開頁就多下載 1.8MB。載完把缺的 key 併進 registry（icons.js 只在自己載入時合併一次）。
      if (!window.ZTOR_ICONS_ALL) {
        grid.textContent = '載入全套圖示中…';
        var sc = document.createElement('script');
        sc.src = 'js/icons-all.js?v=r2.2';
        sc.onload = function () {
          var reg = window.ztorIcons && window.ztorIcons.REGISTRY;
          if (reg) { for (var k in window.ZTOR_ICONS_ALL) { if (!(k in reg)) reg[k] = window.ZTOR_ICONS_ALL[k]; } }
          grid.textContent = '';
          build();
        };
        sc.onerror = function () { grid.textContent = '載不到 js/icons-all.js'; };
        document.body.appendChild(sc);
        return;
      }
      build();
    });
    function build() {
      var all = window.ZTOR_ICONS_ALL || {};
      var used = new Set();
      document.querySelectorAll('[data-lucide]').forEach(function (el) {
        if (!grid.contains(el)) used.add(el.getAttribute('data-lucide'));
      });
      var frag = document.createDocumentFragment();
      Object.keys(all).sort().forEach(function (name) {
        if (used.has(name)) return;
        var cell = document.createElement('div');
        cell.className = 'icon-cell';
        var glyph = document.createElement('i');
        glyph.setAttribute('data-lucide', name);
        glyph.className = 'ztor-icon';
        var label = document.createElement('span');
        label.textContent = name;
        cell.appendChild(glyph); cell.appendChild(label); frag.appendChild(cell);
      });
      grid.appendChild(frag);
      if (window.ztorIcons) window.ztorIcons.applyIcons(grid);
    }
  })();
</script>
<script>
  document.querySelectorAll('[data-owner-lookup-demo]').forEach(function (host) {
    if (window.OwnerLookup) window.OwnerLookup.mount({ host:host, directory:[
      { id:'demo-denise', displayName:'Denise Wong', username:'denise', email:'denise@ztor.com' },
      { id:'demo-mei', displayName:'Mei Lin', username:'meilin', email:'mei@ztor.com' }
    ], isInviteDuplicate:function () { return false; } });
  });
  if (window.ztorIcons && ztorIcons.applyIcons) { try { ztorIcons.applyIcons(document); } catch (e) {} }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (window.ztorTheme && ztorTheme.cycle) { ztorTheme.cycle(); return; }
      var h = document.documentElement;
      h.setAttribute('data-theme', h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  });
  (function () {
    var KEY = 'ztor.ds.lang';
    function cur() { return document.documentElement.getAttribute('data-lang') || 'en'; }
    function upd() { var b = document.querySelector('[data-lang-toggle]'); if (b) b.textContent = (cur() === 'zh' ? 'EN' : '中文'); }
    function set(l) { var h = document.documentElement; h.setAttribute('data-lang', l); h.setAttribute('lang', l === 'zh' ? 'zh-Hant' : 'en'); try { localStorage.setItem(KEY, l); } catch (e) {} upd(); }
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', function () { set(cur() === 'zh' ? 'en' : 'zh'); }); });
    upd();
  })();
  (function () {
    var MK = 'ztor.ds.docmode', WK = 'ztor.ds.docwidth', h = document.documentElement;
    function mode() { return h.getAttribute('data-docmode') || 'fixed'; }
    function width() { var w = parseInt(localStorage.getItem(WK) || '1440', 10); return (w >= 320 && w <= 2560) ? w : 1440; }
    function apply() { h.style.setProperty('--doc-maxw', mode() === 'rwd' ? 'none' : width() + 'px'); }
    function setMode(m) { h.setAttribute('data-docmode', m); try { localStorage.setItem(MK, m); } catch (e) {} apply(); }
    var inp = document.querySelector('[data-width-input]'); if (inp) inp.value = width();
    document.querySelectorAll('[data-mode-toggle]').forEach(function (b) { b.addEventListener('click', function () { setMode(mode() === 'rwd' ? 'fixed' : 'rwd'); }); });
    if (inp) inp.addEventListener('input', function () { var v = parseInt(inp.value, 10); if (v >= 320 && v <= 2560) { try { localStorage.setItem(WK, String(v)); } catch (e) {} if (mode() === 'fixed') apply(); } });
    apply();
  })();
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc__link'));
    var map = {};
    links.forEach(function (l) { var hr = l.getAttribute('href') || ''; var id = hr.charAt(0) === '#' ? hr.slice(1) : ''; if (id) map[id] = l; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          map[e.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  })();
  (function () {
    var out = document.getElementById('ds-validator-report');
    if (!out) return;
    function uniqCounts(items) {
      return items.reduce(function (acc, item) { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    }
    var ids = Array.prototype.slice.call(document.querySelectorAll('[id]')).map(function (el) { return el.id; });
    var idCounts = uniqCounts(ids);
    var duplicateIds = Object.keys(idCounts).filter(function (id) { return idCounts[id] > 1; });
    var internalHrefs = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
    var brokenHrefs = internalHrefs.map(function (a) { return a.getAttribute('href'); }).filter(function (href) { return href && href !== '#' && !document.getElementById(href.slice(1)); });
    var composeBroken = Array.prototype.slice.call(document.querySelectorAll('.compose-chip[href^="#"]')).map(function (a) { return a.getAttribute('href'); }).filter(function (href) { return href && !document.getElementById(href.slice(1)); });
    var localCss = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]')).map(function (l) { return l.getAttribute('href') || ''; }).filter(function (href) { return href && !/^https?:\/\//.test(href); });
    var componentCards = document.querySelectorAll('#component section.sub[id]').length;
    var productSpecIds = Array.prototype.slice.call(document.querySelectorAll('[data-product-spec]')).map(function (el) { return el.getAttribute('data-product-spec'); });
    var productPreviewIds = Array.prototype.slice.call(document.querySelectorAll('[data-product-preview]')).map(function (el) { return el.getAttribute('data-product-preview'); });
    var missingProductPreviews = productSpecIds.filter(function (id) { return productPreviewIds.indexOf(id) === -1; });
    var extraProductPreviews = productPreviewIds.filter(function (id) { return productSpecIds.indexOf(id) === -1; });
    var lines = [
      'Design-system integrity check',
      'ids: ' + ids.length + ' · duplicate ids: ' + duplicateIds.length,
      'internal hrefs: ' + internalHrefs.length + ' · broken: ' + brokenHrefs.length,
      'compose chips: ' + document.querySelectorAll('.compose-chip').length + ' · broken chip targets: ' + composeBroken.length,
      'component cards: ' + componentCards,
      'product-owned spec tables: ' + productSpecIds.length,
      'product-owned previews: ' + productPreviewIds.length + ' · missing previews: ' + missingProductPreviews.length + ' · extra previews: ' + extraProductPreviews.length,
      'local css links: ' + localCss.length,
      duplicateIds.length ? 'duplicate ids -> ' + duplicateIds.join(', ') : 'duplicate ids -> none',
      brokenHrefs.length ? 'broken hrefs -> ' + brokenHrefs.join(', ') : 'broken hrefs -> none',
      composeBroken.length ? 'broken compose chips -> ' + composeBroken.join(', ') : 'broken compose chips -> none',
      missingProductPreviews.length ? 'missing product previews -> ' + missingProductPreviews.join(', ') : 'missing product previews -> none',
      extraProductPreviews.length ? 'extra product previews -> ' + extraProductPreviews.join(', ') : 'extra product previews -> none'
    ];
    out.textContent = lines.join('\n');
  })();
</script>
<script>
  /* Ticket preview 的 demo QR：與 pickup／event-detail 同一支假 QR，守衛以免重複定義 */
  window.ztorFauxQr = window.ztorFauxQr || function (seed) {
    seed = seed || 7; var N = 25, cell = 4, pad = 2, size = N * cell + pad * 2, r = '';
    function fnd(ox, oy) {
      r += '<rect x="' + (pad + ox * cell) + '" y="' + (pad + oy * cell) + '" width="' + (7 * cell) + '" height="' + (7 * cell) + '" fill="currentColor"/>';
      r += '<rect x="' + (pad + (ox + 1) * cell) + '" y="' + (pad + (oy + 1) * cell) + '" width="' + (5 * cell) + '" height="' + (5 * cell) + '" fill="var(--card)"/>';
      r += '<rect x="' + (pad + (ox + 2) * cell) + '" y="' + (pad + (oy + 2) * cell) + '" width="' + (3 * cell) + '" height="' + (3 * cell) + '" fill="currentColor"/>';
    }
    function inF(x, y) { return (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9); }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      if (inF(x, y)) continue;
      var v = (x * 7 + y * 13 + seed * 31) % 11;
      if (v > 4) r += '<rect x="' + (pad + x * cell) + '" y="' + (pad + y * cell) + '" width="' + cell + '" height="' + cell + '" fill="currentColor"/>';
    }
    fnd(0, 0); fnd(N - 7, 0); fnd(0, N - 7);
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%" role="img" aria-label="QR">' + r + '</svg>';
  };
  var dsTkQr = document.getElementById('ds-tk-qr');
  if (dsTkQr) dsTkQr.innerHTML = window.ztorFauxQr(5);
</script>
<script src="js/points-qr.js?v=r2.2"></script>
<script>
  /* Points QR card demo：只有英文名稱示範，語言切換由 points-qr.js 自行重畫 */
  document.querySelectorAll('[data-pqr-demo]').forEach(function (el) {
    window.ztorPointsQr.mount(el, JSON.parse(el.getAttribute('data-pqr-demo')));
  });
</script>
<script src="js/zselect.js?v=r2.2"></script>
<script src="js/section-tabs.js?v=r2.2"></script><!-- 4.214 Section tabs 的 in-context demo（點分頁捲到段、scrollspy） -->
<script src="partials/list-scroll.js?v=r2.2"></script>
<script>
/* DS 頁的折疊 demo：與產品頁同一套行為（點整列開合、展開時摘要收起由 CSS 處理）。 */
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-ds-collapse]');
  if (!t) return;
  var box = t.closest('[data-open]');
  var open = box.getAttribute('data-open') !== 'true';
  box.setAttribute('data-open', open ? 'true' : 'false');
  t.setAttribute('aria-expanded', open ? 'true' : 'false');
  var body = box.querySelector('.collapse-body');
  if (body) body.hidden = !open;
});
</script>
<script>
/* 設計師檢視（2026-11-09）：預設只顯示用途、視覺展示、該做與別做、元件關係；
   工程細節各自收成一個摺疊，要看再一個一個點開。只在規格頁執行（有左側目錄），內容一字不刪。
   收起的有：「規格／行為細節／結構」三段、「Class API」「Token 使用」開頭的段落、補充註記（日期、沿革、題號）。其他段落裡的表格多半是
   「什麼時候用哪個」這類設計指引，維持顯示。 */
(function () {
  if (!document.querySelector('aside.toc') || !document.querySelector('main.doc-main')) return;
  var ENG = { '規格': 'Specification', '行為細節': 'Behavior details', '結構': 'Anatomy' };
  function fold(nodes, en, zh, before) {
    var d = document.createElement('details'); d.className = 'ds-eng';
    var s = document.createElement('summary'); s.className = 'ds-eng__summary';
    s.innerHTML = '<span data-en>' + en + '</span><span data-zh>' + zh + '</span><span class="ds-eng__tag"><span data-en>Engineering</span><span data-zh>工程細節</span></span>';
    d.appendChild(s);
    before.parentNode.insertBefore(d, before);
    nodes.forEach(function (n) { d.appendChild(n); });
    return d;
  }
  document.querySelectorAll('main.doc-main p.field-label:not([data-en])').forEach(function (zh) {
    var key = zh.textContent.trim();
    var plain = !zh.hasAttribute('data-zh');
    var eng = ENG[key] || (/^(Class API|Token 使用)/.test(key) ? key : '') || (plain && /^(Consumers|消費頁)$/.test(key) ? 'Consumers' : '');
    if (!eng) return;
    if (plain && eng === 'Consumers') key = '消費頁';
    var en = zh.previousElementSibling && zh.previousElementSibling.matches('p.field-label[data-en]') ? zh.previousElementSibling : null;
    var items = [], n = zh.nextElementSibling;
    while (n && !n.matches('p.field-label') && !n.matches('section')) { items.push(n); n = n.nextElementSibling; }
    if (!items.length) return;
    fold(items, en ? en.textContent : eng, key, en || zh);
    if (en) en.remove(); zh.remove();
  });
  document.querySelectorAll('main.doc-main p.field-note').forEach(function (p) {
    if (p.closest('details')) return;
    var group = [p], n = p.nextElementSibling;
    while (n && n.matches('p.field-note')) { group.push(n); n = n.nextElementSibling; }
    fold(group, 'Notes', '補充註記', p);
  });
  function openTarget() {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var el = document.getElementById(id); if (!el) return;
    for (var d = el.closest('details.ds-eng'); d; d = d.parentElement && d.parentElement.closest('details.ds-eng')) d.open = true;
  }
  openTarget(); window.addEventListener('hashchange', openTarget);
})();
</script>
`);
