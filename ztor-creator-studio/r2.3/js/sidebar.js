/* ============================================================
   Shared global navigation — injected into every product page.

   Spec §5.2.1 calls this the "全域導航框架 (Global Navigation)". It
   renders in TWO display modes (spec §6.9 / decisions D016), chosen by
   html[data-nav-mode] (set early by theme.js, persisted in localStorage):

     · "topbar"  (default) — R 2.0 canonical 64px sticky horizontal bar:
         Ztor SVG logo + <ul>/<li> nav + hover mega-dropdowns + right-side
         actions cluster (theme · search · lang · notifications · avatar).
     · "sidebar"           — 248px vertical left rail, SAME nav model/IA;
         dropdowns become expandable accordion groups, actions sit at the
         bottom. CSS lives in shared.css ([data-nav-mode="sidebar"] / .app-sidebar*).

   Same sitemap in both — only placement changes (§6.9: IA unchanged).
   2026-07-28（使用者裁示）：切換版面的按鈕不再出現在導航列本身（topbar 與 sidebar
   兩邊都移除）。Settings ▸ 外觀已經有一組 Display mode 選擇卡，同一個入口不該同時
   存在於兩層導航——這與 E-Shop 商店設定離開 dropdown 的理由相同。devtools（Alt＋右鍵）
   的「設置」組仍可切，所以能力沒有消失、只是離開了常駐 chrome。
   Header dropdowns (spec §3.2.1 / decisions D013+D014): IP Bank and E-Shop.
   File stays named sidebar.js to avoid touching every page's <script src>;
   mounts at #sidebar OR #topbar. Re-renders on ztor:navmode-changed.
   ============================================================ */
(function () {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  /* ─────────────────────────────────────────────────────────
     Platform-operator (Admin) layer — spec §4.1 / §3.2.1 Tier 0-1 / D086.
     creators.html (Tier 0) is the Admin's only global module; the existing
     pages are the Creator-scope (Tier 1) workspace, entered after an Admin
     picks a creator. v1 = Admin operates on the creator's behalf (no creator
     self-login). The picked creator is held in localStorage; switching it is
     driven by the devtools "cheat code" panel (D086, presentation裁示).
     ───────────────────────────────────────────────────────── */
  const ROSTER_PAGE = "creators.html";
  /* 2026-08-07（D179）：Admin 同層目的地由四個增為五個——新增影片上架審核
     （spec 5.1.0.4，登記於 0-設計規格書 §3.2 產品地圖 Tier 0）。它跨全平台、
     不需選定 Artist，與其他四個同層。 */
  /* 2026-09-02（D233）：Admin 同層目的地由五個增為六個——新增創作者活動管理
     （spec 5.1.0.6，登記於 0-設計規格書 §3.2 產品地圖 Tier 0），排在 Creator 管理
     正下方：它是 creator 名冊衍生出來的工作，不是與 Admin IP Bank 平行的另一個領域。 */
  const ADMIN_ROUTES = new Set(["creators.html", "creator-detail.html", "admin-creator-events.html", "admin-ip-bank.html", "admin-ip-bank-entry.html", "ip-bank-reporting.html", "admin-platform-fees.html", "admin-video-review.html"]);
  const ADMIN_NAV = [
    { href: "creators.html",          key: "admin.creator-mgmt", icon: "users" },
    { href: "admin-creator-events.html", key: "admin.creator-events", icon: "download" },
    { href: "admin-video-review.html", key: "admin.video-review", icon: "file-check" },
    { href: "admin-ip-bank.html",     key: "admin.ip-bank",      icon: "landmark", match: ["admin-ip-bank-entry.html"] },
    { href: "ip-bank-reporting.html", key: "admin.ip-reporting", icon: "bar-chart-3" },
    { href: "admin-platform-fees.html", key: "admin.platform-fees", icon: "percent" }
  ];
  const isRoster = path === ROSTER_PAGE;
  const isAdminPlatform = ADMIN_ROUTES.has(path);
  /* 這一頁要不要穿上 Admin 平台層的外觀（Admin nav＋Admin 標記＋回名冊的 logo）。
     2026-09-08：多加一個條件「身分是 Admin」——role=general 進到 Admin 頁時，
     Admin nav 整區不出現（那些去處按了也進不去），導航退回一般創作者那一套，
     使用者才走得出這一頁；頁面主內容由下方 applyAdminGate() 換成無權限狀態。
     寫成函式而不是常數：身分可以在不重新載入的情況下切換（cheat code Role 組），
     mount() 每次重繪都要重新問一次。 */
  function adminView() { return isAdminPlatform && isAdminRole(); }
  /* Demo roster (prototype data; the real list comes from the backend).
     Mirrors the concept sketch (denise / aya / kmt). */
  /* D107: creator 資料含 email／電話（選填）／建立時間。email 供 phase 2 交還本人。
     D219: 另含 bookyayEvents——已從 bookyay 匯入的活動 id 清單。
     D233（2026-09-02）: 匯入搬到獨立頁 admin-creator-events.html 之後，那一頁要在**還沒選人以前**
     就把每位 creator 的進度講清楚，所以這裡補了 bookyay 相關欄位。
     D238（2026-09-02）: 匯入由「Admin 逐場勾選」改成**綁定後自動匯入、系統持續檢查更新**，
     所以「可匯入」這個概念整組退場（自動搬完之後不存在「還沒搬進來」的活動），欄位改成：
       · bookyayLinked  — 有沒有綁定 bookyay 帳號。未綁定＝沒有任何活動、右欄走 F5 空狀態。
                          綁定流程本身〔產品待確認〕（D233 未定第 4 項），這裡只有結果值。
       · bookyayPool    — 「哪些 bookyay 活動算這位 creator 的」的原型答案（id 陣列，指向
                          BOOKYAY_EVENTS）。真實界定方式〔產品待確認〕（D233 未定第 1 項）。
       · bookyayEvents  — 已在 ztor 這一側落地的活動 id。**自動匯入之後它涵蓋整個 pool**
                          （示範資料照這個前提寫；兩者不一致就演成「有東西還沒搬過來」，
                          那正是 D238 取消掉的狀態）。
       · bookyaySetup   — 已匯入且套組已設定完成的 id。與 create-event 發布時寫的
                          localStorage `ztor.bkySetupDone` 併集使用：這一份是示範資料的起始值，
                          那一份是這次操作累積的結果，兩份都算「已完成」。
       · lastImportAt   — 最後一次真的搬進新活動的時間；沒搬過為 null。自動匯入之後沒有頁面
                          顯示它（D235 已把「最後匯入時間」從規格 5.1.0.6 F2 移除），保留是因為
                          它屬上游的資料口徑，不是呈現決策。
       · lastCheckedAt  — 最後一次向 bookyay 檢查更新的時間（D238 新增，顯示在下段標題列）。
                          未綁定為 null——沒綁帳號就沒有「檢查」這回事。 */
  /* 2026-09-08 使用者裁決：名冊＝三個 persona 本人，handle 就是 persona id（單一來源）。
     改版前這裡是三筆與 persona 無關的假資料（Denise／Aya／KMT），所以「從名冊進某位
     creator」不會換掉專案與商品資料——名冊看到的人跟工作區裡的資料是兩組互不相干的
     假人。收斂成同一組之後，Enter 周湯豪落地就真的是周湯豪的資料。
     name 沿用 js/projects-store.js 的資料集擁有者寫法（default＝Gary Lin、
     nick＝周湯豪 NICKTHEREAL），代管標示與名冊才不會各叫各的名字。
     userB 目前是佔位人格（沒有專屬資料集，各 store 自動退回 default）。 */
  const CREATORS = [
    { handle: "default", name: "Gary Lin",           shop: "/shop/gary",  status: "active", email: "gary@example.com",  phone: "",                 created: "2026-01-08",
      bookyayLinked: true,  bookyayPool: ["bky-1", "bky-2", "bky-3", "bky-4", "bky-5"], bookyayEvents: ["bky-1", "bky-2", "bky-3", "bky-4", "bky-5"], bookyaySetup: ["bky-1", "bky-3"], lastImportAt: "2026-08-28 14:20", lastCheckedAt: "2026-09-02 09:40" },
    { handle: "nick",    name: "周湯豪 NICKTHEREAL", shop: "/shop/nick",  status: "active", email: "nick@example.com",  phone: "+886 912 000 111", created: "2026-02-19",
      bookyayLinked: true,  bookyayPool: [], bookyayEvents: [], bookyaySetup: [], lastImportAt: null, lastCheckedAt: "2026-09-02 09:40" },
    { handle: "userB",   name: "User B",             shop: "/shop/userb", status: "active", email: "userb@example.com", phone: "",                 created: "2026-05-30",
      bookyayLinked: false, bookyayPool: [], bookyayEvents: [], bookyaySetup: [], lastImportAt: null, lastCheckedAt: null },
  ];
  /* BR-02 開店前置：一個 creator 的來源是本人先在 ztor 前台（買家端）自助註冊 ztor／Store
     帳號。Admin 在 Creator 管理「建立 creator」時，是搜尋這批已註冊、但尚未建檔的帳號，
     選定後承接成 creator（自動生成電子商店），該帳號即離開本池。prototype 資料；真實名錄由後端提供。 */
  const REGISTERED = [
    { id: "u-1042", name: "Lin Yuchen",    username: "yuchen",     email: "yuchen@example.com",       phone: "+886 912 345 678", registered: "2026-06-14" },
    { id: "u-1177", name: "Mika Tanaka",   username: "mika.t",     email: "mika.tanaka@example.com",  phone: "",                 registered: "2026-06-28" },
    { id: "u-1203", name: "Noel Studio",   username: "noelstudio", email: "hello@noelstudio.example", phone: "+886 900 111 222", registered: "2026-07-02" },
    { id: "u-1250", name: "Priya Nair",    username: "priyanair",  email: "priya@example.com",        phone: "",                 registered: "2026-07-09" },
    { id: "u-1288", name: "Sora Kim",      username: "sora",       email: "sora.kim@example.com",     phone: "+82 10 5555 7777", registered: "2026-07-15" },
    { id: "u-1301", name: "Diego Alvarez", username: "diego.a",    email: "diego@example.com",        phone: "",                 registered: "2026-07-18" },
  ];
  /* D219 bookyay 活動：bookyay 是外部售票平台，creator 的活動可能已經在那邊賣了。
     **D238（2026-09-02）改自動匯入**：creator 綁定 bookyay 帳號之後，屬於他的活動由系統
     自動搬進 ztor 並持續檢查更新，Admin 不再逐場勾選——所以「可匯入／已匯入」這組對立
     不存在了，本池對已綁定的人來說就是「他在 ztor 上的活動」。
     prototype 假資料；真實名錄由 bookyay 端提供，而「哪些活動算這位 creator 的」
     怎麼界定、多久檢查一次〔產品待確認〕（ASSUMPTIONS PG-EVIMP-001／PG-EVIMP-006）。 */
  /* 2026-09-01 對齊 create-event.html 的 BKY 池（使用者裁示 admin 匯入後要能接著把活動
     設完）：原本兩邊各一份假資料（這裡六場簡表、create-event 五場完整資料），id 對不上，
     「繼續設定」就找不到完整欄位可帶。改成同 id 同名——**create-event 的 BKY 是正本**
     （它有場次、票種、開賣日期與時間），這裡只是給 admin 看的摘要投影。
     那邊標 imported 的三場（站上已存在的活動）刻意不列，本池維持這五場。 */
  const BOOKYAY_EVENTS = [
    { id: "bky-1", name: "REALIVE World Tour — Taipei", date: "2026-09-12", venue: "台北小巨蛋" },
    { id: "bky-2", name: "MIRROR FANMEETING 2026 高雄", date: "2026-10-02", venue: "高雄流行音樂中心 海音館" },
    { id: "bky-3", name: "城市草地音樂節 2026",          date: "2026-11-08", venue: "大佳河濱公園" },
    { id: "bky-4", name: "限量黑膠簽名場 — 台中",        date: "2026-12-06", venue: "Legacy Taichung" },
    { id: "bky-5", name: "冬季特別公演 — 台南",          date: "2027-01-17", venue: "台南文化中心 演藝廳" },
  ];
  /* 2026-09-02（D233 建、D238 收成兩值）：這四欄就是創作者活動管理頁表格要的全部——
     規格 5.1.0.6 F3 只要求「每一筆至少呈現活動名稱、日期與場地」，狀態不是資料欄位
     而是**算出來的**：在完成清單裡＝已完成，不在＝待設定套組。自動匯入之後只剩這兩值
     （「可匯入」隨 D238 退場）。所以本池不需要 status 欄，也就不會有「資料裡的 status
     與算出來的狀態各說各話」這種第二真相。
     兩份假資料**仍未合併**（見 ASSUMPTIONS UIA-EI-04）：create-event.html 的 BKY 是正本
     （帶 type／圖片／場次／票種，驅動那一頁的類型閘門），本池是給 admin 看的摘要投影。
     契約是 **id 一致**——「繼續設定」靠 `?import=<id>` 過去找完整欄位，id 對不上就會落空。 */
  function bookyaySetupDone() {
    /* 「這一場的套組設完了沒」的單一來源：示範資料的起始值（CREATORS[].bookyaySetup）
       ＋ create-event 發布時寫進 localStorage 的累積結果。名冊、創作者活動管理頁與詳情頁
       三處都讀這一支，數字才不會各算各的。 */
    var ls = [];
    try { ls = JSON.parse(localStorage.getItem("ztor.bkySetupDone") || "[]") || []; } catch (e) { ls = []; }
    return Array.isArray(ls) ? ls : [];
  }
  /* D224 · creator 的編輯結果（店鋪網址、電話、已匯入的 bookyay 活動）存 localStorage。
     編輯搬到獨立頁 creator-detail.html 之後，它是被 detail-sheet 放進 iframe 的
     「另一個 window」——兩邊各有一份 CREATORS 陣列，改在那一邊不會傳回名冊。
     落在 localStorage 是同源共享的最小解：寫入端呼叫 saveCreator()，另一份文件收到
     瀏覽器的 storage 事件後呼叫 refreshCreators() 重新套一次覆寫。
     原型限制：只存被改過的欄位，示範資料本身仍寫在這支檔裡。 */
  const CREATOR_EDITS_LS = "ztor.creatorEdits";
  /* 新建立的 creator 也要落地：編輯搬到獨立頁之後，名冊與詳情頁是兩份文件，
     只活在其中一份記憶體裡的 creator，在另一份會變成「查無此 creator」。 */
  const CREATOR_ADDS_LS  = "ztor.creatorAdds";
  function readEdits() {
    try { return JSON.parse(localStorage.getItem(CREATOR_EDITS_LS) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function refreshCreators() {
    const edits = readEdits();
    CREATORS.forEach(c => {
      const patch = edits[c.seed || c.handle];
      if (patch) Object.assign(c, patch);
    });
    return CREATORS;
  }
  /* seed＝這一筆在示範資料裡的原始 handle。店鋪網址改得掉，所以不能拿現值當鍵，
     否則改過一次之後就對不回同一筆。 */
  CREATORS.forEach(c => { c.seed = c.handle; });
  try {
    const added = JSON.parse(localStorage.getItem(CREATOR_ADDS_LS) || "[]");
    if (Array.isArray(added)) added.forEach(c => {
      if (c && c.seed && !CREATORS.some(x => x.seed === c.seed)) CREATORS.push(c);
    });
  } catch (e) {}
  /* 2026-09-08（persona × role）：名冊的三位固定 creator 就是三個 persona，但執行期由
     「建立 creator」精靈新增的人**沒有專屬資料集**——`js/projects-store.js`／
     `js/products-store.js` 只認得 default 與 nick，查不到就退回 default。所以進入新建
     creator 的工作區看到的是預設帳號那一批展示資料，名冊與代管標示會寫對他的名字。
     要讓新建的人也有自己的一套資料，得先在兩支 store 補資料集，屬 demo 資料範圍。 */
  function addCreator(c) {
    CREATORS.push(c);
    try {
      const added = JSON.parse(localStorage.getItem(CREATOR_ADDS_LS) || "[]");
      added.push(c);
      localStorage.setItem(CREATOR_ADDS_LS, JSON.stringify(added));
    } catch (e) {}
    return c;
  }
  function saveCreator(seed, patch) {
    const edits = readEdits();
    edits[seed] = Object.assign({}, edits[seed], patch);
    try { localStorage.setItem(CREATOR_EDITS_LS, JSON.stringify(edits)); } catch (e) {}
    refreshCreators();
  }
  refreshCreators();

  /* ── Role · 身分（2026-09-08 使用者裁決）────────────────────────────────
     狀態只剩兩把 key：`ztor.persona`（誰的資料，js/theme.js 落地）與這裡的
     `ztor.role`（用什麼身分看，general｜admin）。舊的兩把身分 key——名冊選定的
     creator、以及 Admin 頁交接那一趟——本輪一起退役（遷移在 js/theme.js）；
     它們回答的都是同一個問題「現在是不是 Admin 代管態」，只是各自又多記了一份
     「代管誰」，於是與 persona 各說各話。現在「代管誰」直接讀 persona。 */
  const ROLE_LS = "ztor.role";
  const ROLE_ADMIN = "admin";
  function getRole() {
    /* theme.js 已在每頁第一支 script 正規化並寫回，這裡讀到的一定是合法值；
       localStorage 被封鎖時走它掛上的 window.ztorRoleId()。 */
    try { return localStorage.getItem(ROLE_LS) === ROLE_ADMIN ? ROLE_ADMIN : "general"; }
    catch (e) {
      return (typeof window.ztorRoleId === "function" && window.ztorRoleId() === ROLE_ADMIN) ? ROLE_ADMIN : "general";
    }
  }
  function isAdminRole() { return getRole() === ROLE_ADMIN; }
  function setRole(r) {
    const role = r === ROLE_ADMIN ? ROLE_ADMIN : "general";
    try { localStorage.setItem(ROLE_LS, role); } catch (e) {}
    /* 事件名沿用 ztor:creator-changed：站上（sidebar 重繪、order-detail 的作廢鈕）
       聽的就是這一個，「代管狀態變了」正是它原本的語意。 */
    document.dispatchEvent(new CustomEvent("ztor:creator-changed", { detail: { role: role } }));
  }
  /* 目前代管的是誰＝目前 persona 對應的名冊項；general 身分沒有代管對象（null）。 */
  function getCreator() {
    if (!isAdminRole()) return null;
    const id = (typeof window.ztorPersonaId === "function") ? window.ztorPersonaId() : null;
    return CREATORS.find(c => c.handle === id) || null;
  }
  /* 「進入這位 creator 的工作區」＝把 persona 換成他、身分設為 admin。creators.html 的
     Enter 與 creator-detail.html 的「前往工作區」呼叫它之後**自己導向 index.html**，
     所以這裡不 reload——資料集在下一次載入才需要生效，多一次 reload 只會打斷導航。 */
  function setCreator(handle) {
    if (!handle) { setRole("general"); return; }
    try { localStorage.setItem("ztor.persona", handle); } catch (e) {}
    setRole(ROLE_ADMIN);
  }
  /* 2026-09-08：對外開放「現在是不是 Admin 身分」。API 名稱維持 adminScope（
     order-detail.html 的作廢鈕已在用），語意由「名冊選了人」改成「身分是 Admin」。 */
  function isManagingCreator() { return isAdminRole(); }
  /* Shared with creators.html (roster render + onboard flow) and devtools.js (cheat-code switch).
     registered = BR-02 pre-registered accounts pool (searched by the「建立 creator」onboard wizard). */
  window.ztorCreator = { list: CREATORS, registered: REGISTERED, bookyayEvents: BOOKYAY_EVENTS,
                        get: getCreator, set: setCreator, rosterPage: ROSTER_PAGE,
                        save: saveCreator, add: addCreator, refresh: refreshCreators,
                        adminScope: isManagingCreator,
                        /* Role · 身分（2026-09-08）：兩態 general｜admin。devtools 的
                           「Role · 身分」cheat 組讀 role()／寫 setRole()；setRole 會派
                           ztor:creator-changed 讓導航即時重繪。 */
                        role: getRole, setRole: setRole,
                        /* D233：套組完成清單的共用讀取（名冊的待設定徽章、創作者活動管理頁的
                           狀態欄與詳情頁的唯讀事實都走這一支）。 */
                        bookyaySetupDone: bookyaySetupDone,
                        /* 一位 creator 的匯入進度，三處共用同一份算法——名冊、創作者活動管理頁
                           與 Creator 詳情頁的「已匯入 M 場活動」不會各算各的。
                           墓碑 2026-09-02（D238 自動匯入）：這裡原本還回傳 `importable`
                           （在池裡但還沒搬過來的場次數）。綁定後自動匯入之後不存在「還沒搬
                           進來」的活動，該值零消費、就地移除——三個消費點（卡上的小標籤、
                           下段標題列摘要、「有待匯入」篩選）同輪一起退場。 */
                        bookyayStats: function (c) {
                          var pool = (c && c.bookyayPool) || [];
                          var imported = ((c && c.bookyayEvents) || []).filter(function (id) { return pool.indexOf(id) !== -1; });
                          var doneIds = bookyaySetupDone().concat((c && c.bookyaySetup) || []);
                          var pending = imported.filter(function (id) { return doneIds.indexOf(id) === -1; });
                          return {
                            pool: pool,
                            imported: imported.length,
                            pending: pending.length,
                            doneIds: doneIds
                          };
                        } };

  /* ── 返回哪裡（2026-09-08 改寫）────────────────────────────────────────
     Admin 代管態的 chrome 有一顆返回鍵。預設回 Creator 管理（名冊是進工作區的
     正門）；從別的 Admin 頁（例如影片上架審核）用 `?creator=&from=` 進來時，
     返回鍵改指 `from` 那一頁。

     `from` 讀網址、不落 localStorage（舊的交接 key 已退役）：它只是
     「這一趟從哪裡來」，重複套用沒有副作用，離開這一頁就自然回到預設的名冊。
     只接受站上既有的 Admin 目的地，避免返回鍵被帶去任意網址。 */
  function backFromParam() {
    try {
      const f = String(new URLSearchParams(location.search).get("from") || "").split(/[?#]/)[0].toLowerCase();
      return ADMIN_ROUTES.has(f) ? f : null;
    } catch (e) { return null; }
  }
  /* 返回鍵上的字。側欄那顆只有一行的位置，所以用短名（「Creator 名冊」的同級寫法），
     aria 才寫完整的「返回 X」。沒有短名的 Admin 頁退回 ADMIN_NAV 的頁名。 */
  const BACK_LABEL = {
    "creators.html":           { label: "admin.back-short",  aria: "admin.back" },
    "admin-video-review.html": { label: "admin.back-review", aria: "admin.back-review-aria" }
  };
  function adminRouteKeys(href) {
    if (BACK_LABEL[href]) return BACK_LABEL[href];
    const hit = ADMIN_NAV.find(it => it.href === href || (it.match || []).includes(href));
    return { label: hit ? hit.key : "admin.creator-mgmt", aria: "admin.back" };
  }
  /* 目前這一頁要不要出現代管 chrome，以及代管的是誰、返回哪裡。null＝一般創作者
     （role=general，或 role=admin 但目前 persona 不在名冊上）。 */
  function adminContext() {
    const picked = getCreator();
    if (!picked) return null;
    /* 名字優先問 projects-store（它就是這份 demo 資料的擁有者名稱，永遠對得上目前
       人格，而且雙語稱謂會跟著語言變）；沒載入那支 store 的頁面才用名冊上的名字。 */
    let name = "";
    try { name = (window.ztorProjects && window.ztorProjects.owner && window.ztorProjects.owner()) || ""; } catch (e) {}
    const back = backFromParam() || ROSTER_PAGE;
    const keys = adminRouteKeys(back);
    return { name: name || picked.name, back: back, backKey: keys.label, ariaKey: keys.aria };
  }

  /* Full Ztor wordmark from R 2.0 (101×32 viewBox, monochrome currentColor). */
  /* 頭像縮寫跟著 persona 走。原本兩處都寫死 "M"（Maya 的縮寫），
     切到周湯豪之後頭像還是 M——名字換了、臉沒換。
     取稱謂的第一個字：Gary→G、周湯豪→周、Nick Chou→N。
     projects-store 尚未載入時退回 "M"，維持原樣不會壞。 */
  function avatarInitial() {
    try {
      var n = window.ztorProjects && window.ztorProjects.displayName && window.ztorProjects.displayName();
      if (n) return n.trim().charAt(0).toUpperCase();
    } catch (e) {}
    return "M";
  }

  /* 這份 path 在站上有兩份複本：本檔是正本，login.html 是副本（登入頁刻意不載
     sidebar.js）。改 logo 要兩邊一起改，見 UI-CHANGES 2026-08-04。 */
  /* 只有記號、沒有字的標誌（2026-08-31 使用者提供 Ztor_Symbol.svg）。
     側欄收合成 76px 時字標會被切成「zto」，這支是那個狀態下的品牌落點；
     兩者同時掛在品牌連結裡，由 CSS 決定哪一個顯示。fill 改 currentColor，
     跟著側欄的文字色走，不寫死白色。 */
  const SYMBOL_SVG = '<svg class="app-sidebar__brand-symbol" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.99" d="M21.0879 14.0938C22.6959 14.0939 23.9998 15.3043 24 16.7969C24 18.2896 22.6961 19.4998 21.0879 19.5C19.4796 19.5 18.1758 18.2897 18.1758 16.7969C18.176 15.3042 19.4797 14.0938 21.0879 14.0938ZM14.8906 4.5C15.2844 4.5 15.6034 4.8193 15.6035 5.21387C15.6035 5.35888 15.5612 5.49277 15.4873 5.60547L15.3975 5.71777L13.4912 8.08398L8.12109 14.7559C8.10547 14.7736 8.09069 14.7927 8.07715 14.8115C8.0012 14.9169 7.95612 15.0448 7.95605 15.1846C7.95605 15.5395 8.24348 15.828 8.59766 15.8281H15.1191L15.1201 15.8271C15.4826 15.8271 15.7752 16.1212 15.7754 16.4834V18.8037C15.7753 19.167 15.4816 19.46 15.1201 19.46H0.642578C0.287501 19.4598 0.000137745 19.1722 0 18.8164C0 18.6775 0.0460766 18.5478 0.121094 18.4424L0.166016 18.3867L2.22559 15.8281L8.05469 8.58594C8.05575 8.58492 8.05762 8.58403 8.05762 8.58301C8.092 8.53185 8.1123 8.47007 8.1123 8.4043C8.11208 8.22804 7.96891 8.08496 7.79297 8.08496H1.37207C1.00961 8.0849 0.716901 7.79087 0.716797 7.42871V5.15625C0.717001 4.79313 1.01071 4.50006 1.37207 4.5H14.8906Z"/></svg>';

  const LOGO_SVG = '<svg class="app-topbar__brand-logo" viewBox="0 0 101 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.99" d="M55.749 7.35352C62.3102 6.56387 68.1795 8.99977 70.8506 13.6182C71.8335 15.3184 72.2187 16.7656 72.3027 19.0908C72.4094 22.015 71.9544 23.817 70.5332 26.0986C69.8395 27.2145 67.9548 29.025 66.6904 29.792C62.6322 32.2529 56.4412 32.7086 51.6602 30.8984C48.7838 29.81 46.349 27.6537 45.0264 25.0264C44.2163 23.4148 43.8408 21.6966 43.8311 19.5537C43.8214 17.4853 44.0078 16.4756 44.6934 14.8818C45.864 12.1628 48.31 9.81044 51.2637 8.56543C52.486 8.05031 54.5137 7.50209 55.749 7.35352ZM96.4805 23.1143C98.9761 23.1143 101 24.9861 101 27.2949C101 29.6039 98.9763 31.4766 96.4805 31.4766C93.9848 31.4764 91.9619 29.6038 91.9619 27.2949C91.9622 24.9863 93.985 23.1145 96.4805 23.1143ZM89.5264 7.31055C90.089 7.31055 90.5439 7.76583 90.5439 8.32617V12.2227C90.5439 12.6328 90.2997 12.9866 89.9473 13.1465L89.9102 13.1621L83.6123 15.9268C83.2129 16.1318 82.9384 16.5458 82.9336 17.0254V30.1709C82.9336 30.7329 82.4771 31.1875 81.916 31.1875H76.9004C76.3379 31.1873 75.8838 30.7311 75.8838 30.1709V8.68457C75.8838 8.12275 76.3395 7.66917 76.9004 7.66895H81.916C82.4787 7.66895 82.9336 8.12423 82.9336 8.68457V9.69531C82.9336 9.84549 83.0567 9.96875 83.207 9.96875C83.2424 9.96868 83.2764 9.96012 83.3086 9.94727C83.3103 9.94707 83.3154 9.94482 83.3164 9.94434L89.1035 7.4043L89.1465 7.38477C89.2644 7.33638 89.3923 7.31061 89.5264 7.31055ZM35.6514 0C36.214 0 36.6689 0.455327 36.6689 1.01562V7.56348C36.6689 7.83628 36.89 8.05745 37.1631 8.05762H40.5762C41.1387 8.05762 41.5935 8.51311 41.5938 9.07324V12.5742C41.5938 13.1362 41.1372 13.5908 40.5762 13.5908H37.1631C36.89 13.591 36.6689 13.8122 36.6689 14.085V30.1699C36.6689 30.7318 36.2124 31.1855 35.6514 31.1855H30.6592C30.0966 31.1855 29.6417 30.7302 29.6416 30.1699V14.085C29.6416 13.8122 29.4205 13.5911 29.1475 13.5908H27.9102C27.3475 13.5908 26.8936 13.1346 26.8936 12.5742V9.07324C26.8938 8.51149 27.3493 8.05762 27.9102 8.05762H29.1475C29.4205 8.05738 29.6416 7.83624 29.6416 7.56348V1.01562C29.6417 0.453712 30.0982 0 30.6592 0H35.6514ZM23.1084 8.04492C23.7194 8.0451 24.2138 8.5392 24.2139 9.14941C24.2139 9.37374 24.1479 9.58055 24.0332 9.75488L23.8936 9.92773L20.9365 13.5889L12.6016 23.9072C12.5773 23.9347 12.5552 23.9641 12.5342 23.9932C12.4161 24.1563 12.3467 24.3549 12.3467 24.5713C12.3468 25.1201 12.7923 25.5652 13.3418 25.5654H23.4619L23.4639 25.5645C24.0265 25.5645 24.4805 26.0198 24.4805 26.5801V30.168C24.4805 30.7299 24.0249 31.1835 23.4639 31.1836H0.998047C0.4467 31.1836 0 30.7382 0 30.1875C2.76681e-06 29.9727 0.0710906 29.7725 0.1875 29.6094L0.256836 29.5234L3.45312 25.5645L12.5 14.3652C12.5017 14.3637 12.5049 14.3619 12.5049 14.3604C12.5581 14.2814 12.5888 14.1864 12.5889 14.085C12.5889 13.8121 12.367 13.5908 12.0938 13.5908H2.12988C1.56722 13.5908 1.1123 13.1346 1.1123 12.5742V9.06055C1.11243 8.49869 1.56891 8.04492 2.12988 8.04492H23.1084ZM59.7852 13.2803C56.0761 12.3824 52.1339 14.574 51.2188 18.041C50.9957 18.8888 50.9911 20.5182 51.2109 21.2852C51.8885 23.6539 54.3762 25.684 57.0762 26.0732C60.5912 26.5803 64.1954 24.3252 64.9893 21.123C65.201 20.2655 65.1817 18.8623 64.9473 18.0518C64.2681 15.7105 62.2975 13.8891 59.7852 13.2803ZM24.2168 8.05762L24.2012 8.04492H24.2168V8.05762Z"/></svg>';

  /* Nav definition · spec §3.2.1 order. Each top-level item carries a Tabler
     icon (used by the sidebar mode). Dropdowns (panel) = IP Bank + E-Shop
     (spec §3.2.1 / decisions D013 + D014). Sub-pages / create flows are reached
     in-page, not from the header; `match` keeps the item highlighted there. */
  const NAV = [
    /* 2026-09-01 兩份總覽對調（使用者裁示「將新版總覽替換上總覽（第一個），將原本的
       總覽往下移命名為舊版總覽」）：新版排第一、成為進站的預設落點，原本那一份退到
       第二格並改名。**兩份仍然並存**（2026-08-31 起的狀態沒變，見 ASSUMPTIONS
       CANVAS-001）——這一次動的是誰排前面、誰叫什麼，不是把舊的下架。
       **2026-09-01 同日再改：第一格的「新」拿掉**（使用者裁示「去掉新」）——它排在
       第一格、是進站的預設落點，名字就該是這件事本身；「新版」是相對於誰新，而那個
       「誰」已經自己在下面標了「舊版」。第一格因此吃回 `nav.dashboard`（單純的「總覽」），
       `nav.dashboard-new` 隨之退役。
       **圖示同時對調**（使用者裁示「icon 也不對，這是正式的總覽」）：`sparkles` 是
       「這是新加的、還在試」的說法，一個正式的總覽不該掛著它；站上代表總覽的字形
       是 `layout-grid`，交還給排第一的那一格。舊的那一份改用 `history`——兩格不能
       同時掛 `layout-grid`（同一個字形出現兩次，這一對就分不出誰是誰），而它現在
       的身分正是「上一個版本」。 */
    { href: "index.html", key: "nav.dashboard", icon: "layout-grid" },
    { href: "dashboard-classic.html", key: "nav.dashboard-old", icon: "history" },
    { href: "projects.html", key: "nav.projects",  icon: "rocket",
      match: ["create-project.html"] },
    /* IP Bank dropdown (D013): My IP + IP Market. Detail pages are reached
       in-page → not dropdown items, but still highlight via match:
       ip-detail = the renter-facing market page (spec 5.1.3.1);
       manage-ip = the owner-facing page reached from a My IP row (2026-07-27). */
    { key: "nav.ip-bank", icon: "landmark", panel: [
      { href: "my-ip.html",     icon: "tag",    titleKey: "nav.my-ip",     descKey: "nav.my-ip-sub" },
      { href: "ip-market.html", icon: "search", titleKey: "nav.ip-market", descKey: "nav.ip-market-sub" },
    ], match: ["ip-detail.html", "manage-ip.html"] },
    /* E-Shop dropdown (D065, partial rollback of D028; +取貨管理 D111): three
       items — 電子商店 E-Shop (landing page) + 訂單管理 Orders + 取貨管理
       Pickup management (on-site QR redemption workspace, sibling of Orders).
       Store settings left the dropdown (D065): it is now a popup opened from the
       E-Shop page F3 toolbar; store-settings.html stays as the popup's full spec
       and is matched here so E-Shop nav highlights on it. Product detail /
       create-product / create-bundle / order-detail are in-page sub-routes.
       scanner.html is the standalone mobile scanner (spec 5.1.5.11 F7) — a
       separate URL with no Studio nav, so it is intentionally NOT matched here. */
    { key: "nav.eshop", icon: "shopping-bag", panel: [
      { href: "e-shop.html", icon: "package",  titleKey: "nav.manage-eshop", descKey: "nav.manage-eshop-sub" },
      { href: "orders.html", icon: "receipt",  titleKey: "nav.orders",       descKey: "nav.orders-sub" },
      { href: "pickup.html", icon: "qr-code",  titleKey: "nav.pickup",       descKey: "nav.pickup-sub" },
    ], match: ["product-detail.html", "create-product.html", "create-auction.html", "create-bundle.html", "auction-detail.html", "bundle-detail.html", "order-detail.html", "store-settings.html"] },
    /* Events = flat top-level link; sub-pages reached in-page. */
    { href: "events.html",   key: "nav.events",   icon: "ticket", match: ["create-event.html", "edit-event.html"] },
    /* Fans dropdown (2026-07-27 使用者裁示，比照 E-Shop／IP Bank 的 accordion)：
       總覽 ＋ 分級權益 ＋ 分級設定 ＋ 品牌合作。原本是 tier-settings 頁內分頁的
       Benefits，升格成左側導航的正式目的地、自成一頁——同一個入口不該同時存在
       於兩層導航。fan-detail 由總覽頁內進入，列在 match 讓群組維持 highlight。

       品牌合作歸在粉絲底下（2026-07-28 使用者裁示）：它的燃料是粉絲——由粉絲
       掃碼、由粉絲指定歸屬給誰、成效也用「新增粉絲」與「主動選你」來衡量。
       放在頂層會讓它看起來像獨立的廣告模組，實際上它是粉絲關係的變現方式。
       刻意不叫 "Campaign"：create-campaign.html 已經是「募資活動」的意思，
       同一個字指兩件事會永久混淆。

       媒體庫排在權益之後（2026-07-29 使用者裁示）：它是「權益」那一格被打開
       之後，粉絲真正拿到的東西——先定義給什麼（Benefits）、再決定誰進得來並
       把東西放進去（Media Vault）。放在分級設定之前，因為它跟權益是同一件事
       的兩半，分級設定則是門檻本身的計算規則。 */
    /* 2026-07-31 使用者裁決：粉絲分析改名「粉絲總覽」並移到第一位，原本的
       「總覽」（粉絲名冊）改名「粉絲圈」。先看整體樣貌、再進到一個一個人，
       所以總覽在前、名冊在後；兩者原本都叫「總覽」會撞名，故名冊改叫粉絲圈。 */
    /* 2026-08-09 使用者裁決（D181）：粉絲分析拆成兩頁。新的「粉絲分析」只用
       ztor 現在真的拿得到的資料（發行商報表的次數＋站上會員的屬性），排第一位；
       原本那頁改名「粉絲分析：含外部」，因為它依賴的 IG／TikTok／YouTube 資料
       目前拿不到，先封存備份，所以退到這一組的最後。 */
    { key: "nav.fans", icon: "users", panel: [
      { href: "audience-report.html",  icon: "trending-up", titleKey: "nav.fans-report",   descKey: "nav.fans-report-sub" },
      { href: "fans-crm.html",         icon: "users",     titleKey: "nav.fans-overview", descKey: "nav.fans-overview-sub" },
      { href: "media-vault.html",      icon: "key",       titleKey: "nav.fans-vault",    descKey: "nav.fans-vault-sub" },
      { href: "brand-campaigns.html",  icon: "handshake", titleKey: "nav.brandcmp",      descKey: "nav.brandcmp-sub" },
      { href: "fan-analytics.html",    icon: "globe",     titleKey: "nav.fans-audience", descKey: "nav.fans-audience-sub" },
    ], match: ["fan-detail.html", "brand-campaign-detail.html", "fans-guide.html",
               /* 2026-07-31：分級權益／分級設定併進粉絲管理的「粉絲分級設定」分頁，
                  兩頁自導覽移除但檔案保留（見各檔頭的墓碑註解）。仍列在 match 裡，
                  舊連結或書籤打開時側欄還會亮在「粉絲」這一組、不會失去定位。 */
               "tier-benefits.html", "tier-settings.html"] },
    /* Earnings 維持平鋪單頁（2026-07-31 使用者裁決）：一度拆成「收入總覽／Ztor 收入」
       兩個下拉目的地，後來併回一頁、版稅改當一個分頁。不用全頁 filter 的理由——
       filter 的前提是每個值對每個視圖都成立，這裡不成立：站外 × 項目收益／提款／
       稅務文件 三格是空的。拆頁版 earnings-overview.html／earnings-ztor.html 暫留
       在磁碟上供比對，不掛導覽。 */
    { href: "earnings.html", key: "nav.earnings", icon: "banknote", match: ["earnings-sony.html"] },
  ];

  /* feature-scope-map 未列的整頁功能在低版本不可作為任何入口。
     完整清單也供 notification/account/link 這類 NAV 以外的錨點使用。 */
  /* ✝ 2026-07-30：取貨管理三頁移出本清單，改由 feature-scope-map 的 O24–O30（🟢 Phase 1）管轄（D157）。
     這份清單與 devtools.js 的同名清單必須一致，改一邊就要改另一邊。 */
  const FULL_ROUTES = new Set([
    "index.html", "dashboard-classic.html", "creators.html", "admin-ip-bank.html", "admin-ip-bank-entry.html", "ip-bank-reporting.html", "admin-platform-fees.html", "admin-video-review.html", "projects.html", "project-detail.html", "create-project.html",
    "create-campaign.html", "funding-simulate.html", "events.html", "event-detail.html", "create-event.html", "edit-event.html",
    "fans-crm.html", "fan-detail.html", "tier-settings.html", "tier-benefits.html", "media-vault.html",
    "brand-campaigns.html", "brand-campaign-detail.html", "fans-guide.html", "fan-analytics.html", "audience-report.html", "my-ip.html", "ip-detail.html",
    "manage-ip.html",
    "ip-market.html", "register-ip.html", "settings.html"
  ]);
  function fullVersion() {
    const v = (window.ztorDevState && window.ztorDevState.get && window.ztorDevState.get().version)
      || document.documentElement.getAttribute("data-version") || "full";
    /* 以 Phase 4 為基底的版本（不減功能、只改接個別頁面）：nav 全開。
       與 devtools.js 的 isFullBaseVersion() 同一份白名單，新增同型特殊版時兩處都要加。
       `home-canvas` 2026-08-31 已不是一個版本（該頁進了正式導覽），鍵留著只為了讓
       還存著舊 devstate 的瀏覽器不會被當成未知版本、導覽少一半。 */
    return v === "full" || v === "funding-test" || v === "deck-for-sony" || v === "golive-4step" || v === "home-canvas";
  }
  function routeAllowed(href) {
    const route = (href || "").split(/[?#]/)[0].toLowerCase();
    return fullVersion() || !FULL_ROUTES.has(route);
  }
  function applyVersionRoutes(root) {
    if (!root) return;
    const limited = !fullVersion();
    root.querySelectorAll("a[href]").forEach(a => {
      if (!routeAllowed(a.getAttribute("href"))) {
        a.hidden = true;
        const li = a.closest("li"); if (li) li.hidden = true;
      }
    });
    root.querySelectorAll(".app-topbar__nav-group, .app-sidebar__group").forEach(group => {
      const links = Array.from(group.querySelectorAll("a[href]")).filter(a => !a.hidden && a.getAttribute("href") !== "#");
      if (limited && group.closest("nav") && links.length === 0) group.hidden = true;
    });
    root.querySelectorAll(".app-topbar__brand, .app-sidebar__brand").forEach(brand => {
      brand.setAttribute("href", limited ? "e-shop.html" : (isRoster ? ROSTER_PAGE : "index.html"));
    });
  }

  function isActive(it) {
    const allHrefs = it.panel
      ? it.panel.map(p => p.href).concat(it.match || [])
      : [it.href].concat(it.match || []);
    return allHrefs.includes(path);
  }
  function panelChildActive(it) {
    return it.panel && it.panel.some(p => p.href === path);
  }

  /* ─────────────────────────────────────────────────────────
     Notification & to-do center (spec §5.2.1 / decisions D019).
     Same panel content in both display modes; only where it opens
     differs (topbar = dropdown below the icon, sidebar = flyout to
     the right of the rail — see shared.css). Official announcements
     are merged in (no separate entry). Sample items below; the full
     type taxonomy lives in the spec. */
  const NOTIF_TODO = [
    { icon: "banknote",       href: "earnings.html#payouts",      k: "notif.payout-fail",  source: "notif.source.earnings" },
    { icon: "receipt",        href: "order-detail.html",          k: "notif.to-ship",      source: "notif.source.orders" },
    { icon: "package-x",      href: "e-shop.html",                k: "notif.low-stock",    source: "notif.source.eshop" },
    { icon: "landmark",       href: "my-ip.html",                 k: "notif.ip-expiring",  source: "notif.source.ipbank" },
    { icon: "users",          href: "projects.html",              k: "notif.split-confirm", source: "notif.source.projects" },
  ];
  const NOTIF_INFO = [
    { icon: "banknote",       href: "earnings.html",              k: "notif.available",    source: "notif.source.earnings" },
    { icon: "receipt",        href: "order-detail.html",          k: "notif.new-order",    source: "notif.source.orders" },
    { icon: "rocket",         href: "projects.html",              k: "notif.funded",       source: "notif.source.projects" },
    { icon: "award",          href: "fans-crm.html",              k: "notif.fan-up",       source: "notif.source.fans" },
    { icon: "upload",         href: "fan-analytics.html",         k: "notif.connected",    source: "notif.source.analytics" },
    { icon: "megaphone",      href: "#",                          k: "notif.announce",    source: "notif.source.official" },
  ];

  function notifItemsHtml(list, isTodo) {
    return list.map(n => `<a class="app-notif__item${isTodo ? " app-notif__item--todo" : ""}" href="${n.href}" data-unread="true">
        <span class="app-notif__item-icon"><i data-lucide="${n.icon}" class="ztor-icon ztor-icon--sm"></i></span>
        <span class="app-notif__item-body">
          <span class="app-notif__item-title" data-i18n="${n.k}.title">${n.k}.title</span>
          <span class="app-notif__item-meta" data-i18n="${n.k}.meta">${n.k}.meta</span>
          <span class="app-notif__item-source" data-i18n="${n.source}">${n.source}</span>
        </span>
        <span class="app-notif__item-time" data-i18n="${n.k}.time">${n.k}.time</span>
      </a>`).join("");
  }

  function notifPanelHtml() {
    return `
      <div class="app-notif__head">
        <span class="app-notif__title" data-i18n="notif.title">Notifications</span>
        <button class="app-notif__markread" type="button" data-i18n="notif.markread">Mark all read</button>
      </div>
      <div class="app-notif__scroll">
        <div class="app-notif__section-label" data-i18n="notif.todo">To-do</div>
        ${notifItemsHtml(NOTIF_TODO, true)}
        <div class="app-notif__section-label" data-i18n="notif.updates">Updates</div>
        ${notifItemsHtml(NOTIF_INFO, false)}
      </div>
      <a class="app-notif__foot" href="settings.html#notifications" data-i18n="notif.viewall">View all</a>`;
  }

  /* ─────────────────────────────────────────────────────────
     語言列（D222，撤除 D221 的雙概念）——帳戶選單裡一顆可展開的單選清單，topbar／
     sidebar 兩種殼共用同一套資料，只是外層 row 的 class 不同（各自沿用該選單本來的
     列樣式，不引入 dropdown__item--choice／--ladder 那支分級選單元件，見
     STYLE-DECISIONS Q70）。常駐只顯示「預設語言」＋目前值＋展開指示；點了才展開
     四個語系。選中的那個語言打勾；D221 曾有的「預設」徽章與「去設定改預設語言」
     提示行已撤除——語言只有一個概念，這裡點哪個就是哪個，不必再區分「這是不是預設」
     或指去別處改。點語言列只呼叫 ztorLang.set()。渲染當下讀一次目前值；之後的變更由
     refreshLangRows()（見下）patch DOM，不整段重繪（sidebar.js 只在
     navmode/creator/devstate 變更時 remount）。 */
  function langOptionsHtml(kind) {
    var optClass = kind === "topbar"
      ? "app-topbar__dropdown-option app-topbar__dropdown-option--lang"
      : "app-sidebar__sub-link app-sidebar__sub-link--lang";
    var textClass = kind === "topbar" ? "app-topbar__dropdown-option-text" : "app-sidebar__lang-text";
    var checkClass = kind === "topbar" ? "app-topbar__dropdown-lang-check" : "app-sidebar__lang-check";
    var current = window.ztorLang ? window.ztorLang.get() : "en";
    var list = window.ztorLang ? window.ztorLang.list() : [["en", "English"]];
    return list.map(function (pair) {
      var code = pair[0], label = pair[1];
      var checked = code === current;
      return `<li role="presentation"><button class="${optClass}" type="button" role="menuitemradio" aria-checked="${checked ? "true" : "false"}" data-lang-pick="${code}">
        <span class="${textClass}">${label}</span>
        ${checked ? `<i data-lucide="check" class="ztor-icon ztor-icon--sm ${checkClass}"></i>` : ""}
      </button></li>`;
    }).join("");
  }
  function langMenuHtml(kind) {
    var current = window.ztorLang ? window.ztorLang.get() : "en";
    var list = window.ztorLang ? window.ztorLang.list() : [["en", "English"]];
    var currentLabel = (list.filter(function (p) { return p[0] === current; })[0] || list[0])[1];
    /* D223 收合修正：收合列改成只顯示目前語言（拿掉「預設語言」前置 label 與
       title/sub 兩行結構），縮排與字級對齊選單其他列（Profile／Settings／Payments，
       都是純文字直接放在 .app-topbar__dropdown-option / .app-sidebar__sub-link 裡，
       不套 -option-text/-title/-sub 那組 icon+子標列樣式）。視覺上只剩語言名稱，
       螢幕報讀失去「這是語言切換」的語意，補 aria-label（data-i18n-aria-label，
       2026-08-24 審查抓到）。 */
    if (kind === "topbar") {
      return `<li class="app-topbar__dropdown-langgroup" role="presentation" data-lang-group>
        <button class="app-topbar__dropdown-option app-topbar__dropdown-option--toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Switch language" data-i18n-aria-label="settings.lang.toggle-label" data-lang-toggle>
          <span data-lang-current-label>${currentLabel}</span>
          <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm app-topbar__dropdown-lang-chevron"></i>
        </button>
        <ul class="app-topbar__dropdown-langlist" role="menu" hidden>
          ${langOptionsHtml("topbar")}
        </ul>
      </li>`;
    }
    return `<li class="app-sidebar__lang-group">
      <button class="app-sidebar__sub-link app-sidebar__sub-link--lang-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Switch language" data-i18n-aria-label="settings.lang.toggle-label" data-lang-toggle>
        <span data-lang-current-label>${currentLabel}</span>
        <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm app-sidebar__lang-chevron"></i>
      </button>
      <ul class="app-sidebar__lang-panel" hidden>
        ${langOptionsHtml("sidebar")}
      </ul>
    </li>`;
  }

  /* ─────────────────────────────────────────────────────────
     TOPBAR mode (R 2.0 canonical) — horizontal bar markup.
     ───────────────────────────────────────────────────────── */
  function topbarNavHtml(locked) {
    /* Admin 平台層：列出五個同層目的地，用與 sidebar 同一份 ADMIN_NAV。
       2026-08-20 修正：這裡原本把 Admin 也當成 locked 直接回空字串，於是 topbar
       模式下 Admin 五頁之間完全沒有導航可走（sidebar 模式正常），違反主規格
       §6.4「仍可使用」與 §6.9.2「兩個模式是同一套地圖、只差排列」。 */
    if (adminView()) {
      return ADMIN_NAV.map(function (it) {
        var active = [it.href].concat(it.match || []).includes(path);
        return `<li><a class="app-topbar__link" href="${it.href}"${active ? ' aria-current="page"' : ''} data-i18n="${it.key}">${it.key}</a></li>`;
      }).join("");
    }
    /* D107: 未選定 creator（Tier 0 名冊）時，Tier 1 模組不在導航呈現——
       只留「Creator 管理」marker，不列出鎖住項。 */
    if (locked) return "";
    let html = "";
    for (const it of NAV) {
      const active = isActive(it);
      if (it.panel) {
        html += `<li class="app-topbar__nav-group" data-dropdown>
          <button class="app-topbar__link app-topbar__link--group" aria-haspopup="true" aria-expanded="false" type="button"${active ? ' aria-current="page"' : ''}>
            <span data-i18n="${it.key}">${it.key}</span>
            <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm"></i>
          </button>
          <ul class="app-topbar__dropdown app-topbar__dropdown--mega" role="menu">`;
        for (const sub of it.panel) {
          html += `<li role="presentation">
            <a class="app-topbar__dropdown-option" href="${sub.href}" role="menuitem">
              <span class="app-topbar__dropdown-icon"><i data-lucide="${sub.icon}" class="ztor-icon ztor-icon--sm"></i></span>
              <span class="app-topbar__dropdown-option-text">
                <span class="app-topbar__dropdown-option-title" data-i18n="${sub.titleKey}">${sub.titleKey}</span>
                <span class="app-topbar__dropdown-option-sub" data-i18n="${sub.descKey}">${sub.descKey}</span>
              </span>
            </a>
          </li>`;
        }
        html += `</ul></li>`;
      } else {
        html += `<li><a class="app-topbar__link" href="${it.href}"${active ? ' aria-current="page"' : ''} data-i18n="${it.key}">${it.key}</a></li>`;
      }
    }
    return html;
  }

  function buildTopbar() {
    const creator = adminContext();               // null = 一般創作者（無 admin 代管）
    const adminScope = !isAdminPlatform && !!creator;    // admin 正在代管某個 creator
    /* Three nav faces:
       · Tier 0 roster (creators.html): "Creator Management" marker + locked Tier-1.
       · Admin 代管 (Tier-1, a creator selected): back icon BEFORE the logo
         (使用者裁示, D086) + "Managing <creator>" chip + full nav. 返回的目的地是
         「從哪個 Admin 頁進來的」——名冊進來就回名冊，審核頁進來就回審核頁。
       · 一般創作者 (Tier-1, no creator selected): plain topbar, NO admin chrome —
         the normal dashboard view (之前的版本). */
    const back = adminScope
      ? `<a class="app-topbar__back" href="${creator.back}" aria-label="Back" data-i18n-aria-label="${creator.ariaKey}">
           <i data-lucide="arrow-left" class="ztor-icon"></i>
         </a>`
      : "";
    const marker = adminView()
      ? `<span class="app-topbar__context app-topbar__context--admin">
           <i data-lucide="shield-check" class="ztor-icon ztor-icon--sm"></i>
           <span data-i18n="admin.creator-mgmt">Creator Management</span>
         </span>`
      : (adminScope ? `<span class="app-topbar__context">
           <span class="app-topbar__context-label" data-i18n="admin.managing">Managing</span>
           <span class="app-topbar__context-name">${creator.name}</span>
         </span>` : "");
    return `
    ${back}
    <a href="${adminView() ? ROSTER_PAGE : "index.html"}" class="app-topbar__brand" aria-label="Ztor Creator Studio">${LOGO_SVG}</a>
    ${marker}
    <button class="app-nav-burger" type="button" aria-expanded="false" aria-label="Menu" data-i18n-aria-label="nav.menu" data-nav-burger>
      <i data-lucide="menu" class="ztor-icon"></i>
      <i data-lucide="x" class="ztor-icon"></i>
    </button>

    <nav aria-label="Primary">
      <ul class="app-topbar__nav"><span class="app-topbar__nav-highlight" aria-hidden="true"></span>${topbarNavHtml(adminView())}</ul>
    </nav>

    <div class="app-topbar__actions">
      <div class="app-topbar__search-menu" data-dropdown>
        <button class="app-topbar__icon-btn btn btn--icon" aria-haspopup="true" aria-expanded="false" aria-label="Open search" data-i18n-aria-label="nav.search-label" data-search-trigger type="button">
          <i data-lucide="search" class="ztor-icon"></i>
        </button>
        <div class="app-topbar__dropdown app-topbar__dropdown--right app-topbar__search-panel" role="dialog" aria-label="Search">
          <label class="app-topbar__search-input-wrap">
            <i data-lucide="search" class="ztor-icon"></i>
            <input type="search" class="app-topbar__search-input" placeholder="Search projects, IP, fans, transactions…" data-i18n-placeholder="nav.search-placeholder" data-autofocus>
            <kbd class="app-topbar__search-kbd">ESC</kbd>
          </label>
          <p class="app-topbar__search-hint" data-i18n="nav.search-hint">Type a keyword, then press Enter</p>
        </div>
      </div>

      <div class="app-topbar__nav-group app-notif" data-dropdown data-notif>
        <button class="app-topbar__icon-btn btn btn--icon" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Notifications" data-i18n-aria-label="nav.notif-label">
          <i data-lucide="flag" class="ztor-icon"></i>
          <span class="app-topbar__badge-dot" aria-hidden="true"></span>
        </button>
        <div class="app-topbar__dropdown app-topbar__dropdown--right app-notif__panel" role="dialog" aria-label="Notifications">${notifPanelHtml()}</div>
      </div>

      <div class="app-topbar__nav-group" data-dropdown data-account>
        <button class="app-topbar__avatar" aria-haspopup="true" aria-expanded="false" aria-label="Account" data-i18n-aria-label="nav.account-label" type="button">${avatarInitial()}</button>
        <ul class="app-topbar__dropdown app-topbar__dropdown--right" role="menu">
          <li role="presentation"><a class="app-topbar__dropdown-option" href="settings.html#profile" role="menuitem" data-i18n="nav.profile">Profile</a></li>
          <li role="presentation"><a class="app-topbar__dropdown-option" href="settings.html" role="menuitem" data-i18n="nav.settings">Settings</a></li>
          <li role="presentation"><a class="app-topbar__dropdown-option" href="settings.html#payments" role="menuitem" data-i18n="nav.payments">Payments</a></li>
          <li class="app-topbar__dropdown-divider" role="separator"></li>
          ${langMenuHtml("topbar")}
          <li class="app-topbar__dropdown-divider" role="separator"></li>
          <li role="presentation"><a class="app-topbar__dropdown-option" href="login.html" role="menuitem" data-logout data-i18n="nav.logout" style="color:var(--destructive)">Log out</a></li>
        </ul>
      </div>
    </div>
  `;
  }

  /* ─────────────────────────────────────────────────────────
     SIDEBAR mode — vertical rail markup. Same NAV, dropdowns become
     expandable accordion groups. Actions sit at the bottom.
     ───────────────────────────────────────────────────────── */
  function sidebarNavHtml(locked) {
    /* 現役樣式＝可收合 accordion（2026-06-13 使用者反饋改回原樣）。
       「分組標題＋子項平鋪」版本（.app-sidebar__section-label）仍保留在
       shared.css 與 design-system，作為可隨時切回的變體。 */
    /* D107: 未選定 creator 時 Tier 1 模組不在導航呈現（只留 Creator 管理 marker）。 */
    if (adminView()) {
      return ADMIN_NAV.map(function (it) {
        var active = [it.href].concat(it.match || []).includes(path);
        return `<li><a class="app-sidebar__link" href="${it.href}"${active ? ' aria-current="page"' : ''}>
          <i data-lucide="${it.icon}" class="ztor-icon"></i>
          <span class="app-sidebar__link-label" data-i18n="${it.key}">${it.key}</span>
        </a></li>`;
      }).join("");
    }
    if (locked) return "";
    let html = "";
    for (const it of NAV) {
      const active = isActive(it);
      if (it.panel) {
        /* 2026-07-27（使用者裁示，取代 2026-06-13 的「全部預設展開」）：
           只有「包含當前頁」的群組預設展開，其餘收合。理由是量出來的——三個群組
           同時展開時側欄內容 848px，在 700px 視窗下溢出 148px、逼出第二條捲軸；
           accordion 化收回約 336px，700px 下還剩約 190px 餘裕。
           這是減法而不是壓縮：少給幾個同時可見的選項，而不是把每個選項變小
           （壓縮版只能收回 ~150px，且會動到 2026-07-21 對齊搜尋列的 36px 控件高）。
           父項（群組標題）不顯示已選態——只有實際 current 子項 highlight。 */
        const open = isActive(it) || (it.panel || []).some(sub => sub.href === path);
        html += `<li class="app-sidebar__group" data-state="${open ? "open" : "closed"}">
          <button class="app-sidebar__link app-sidebar__group-toggle" type="button" aria-expanded="${open ? "true" : "false"}">
            <i data-lucide="${it.icon}" class="ztor-icon"></i>
            <span class="app-sidebar__link-label" data-i18n="${it.key}">${it.key}</span>
            <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm app-sidebar__chevron"></i>
          </button>
          <ul class="app-sidebar__subnav"><div>`;
        for (const sub of it.panel) {
          html += `<li><a class="app-sidebar__sub-link" href="${sub.href}"${sub.href === path ? ' aria-current="page"' : ''} data-i18n="${sub.titleKey}">${sub.titleKey}</a></li>`;
        }
        html += `</div></ul></li>`;
      } else {
        html += `<li><a class="app-sidebar__link" href="${it.href}"${active ? ' aria-current="page"' : ''}>
          <i data-lucide="${it.icon}" class="ztor-icon"></i>
          <span class="app-sidebar__link-label" data-i18n="${it.key}">${it.key}</span>
        </a></li>`;
      }
    }
    return html;
  }

  function buildSidebar() {
    const creator = adminContext();               // null = 一般創作者（無 admin 代管）
    const adminScope = !isAdminPlatform && !!creator;
    /* Same three faces as topbar: roster marker / admin 代管 (back + managing) /
       plain creator (no chrome). */
    const lead = adminView()
      ? `<div class="app-sidebar__context app-sidebar__context--admin">
           <i data-lucide="shield-check" class="ztor-icon"></i>
           <span data-i18n="admin.studio">Admin Creator Studio</span>
         </div>`
      : (adminScope ? `<a class="app-sidebar__back" href="${creator.back}" data-i18n-aria-label="${creator.ariaKey}" aria-label="Back">
           <i data-lucide="arrow-left" class="ztor-icon"></i>
           <span class="app-sidebar__back-label" data-i18n="${creator.backKey}">Back</span>
         </a>
         <div class="app-sidebar__context">
           <span class="app-sidebar__context-label" data-i18n="admin.managing">Managing</span>
           <span class="app-sidebar__context-name">${creator.name}</span>
         </div>` : "");
    return `
    <div class="app-sidebar__top">
    <a href="${adminView() ? ROSTER_PAGE : "index.html"}" class="app-sidebar__brand" aria-label="Ztor Creator Studio">${LOGO_SVG}${SYMBOL_SVG}<span class="app-sidebar__brand-name" data-i18n="nav.brand-sub">Creator Studio</span></a>
      <button class="app-nav-rail-toggle" type="button" aria-expanded="true"
        aria-label="Collapse navigation" data-i18n-aria-label="nav.collapse" data-nav-rail>
        <i data-lucide="sidebar-collapse" class="ztor-icon"></i>
      </button>
    </div>
    ${lead}
    <button class="app-nav-burger" type="button" aria-expanded="false" aria-label="Menu" data-i18n-aria-label="nav.menu" data-nav-burger>
      <i data-lucide="menu" class="ztor-icon"></i>
      <i data-lucide="x" class="ztor-icon"></i>
    </button>

    <nav aria-label="Primary">
      <ul class="app-sidebar__nav">${sidebarNavHtml(adminView())}</ul>
    </nav>

    <div class="app-sidebar__actions">${adminView() ? `
      <!-- Admin Creator Studio 下方：只留幣別（預設港幣）＋顯示模式＋登出（不含搜尋/通知/帳戶選單）-->
      <div class="app-sidebar__group" data-state="closed" data-currency>
        <button class="app-sidebar__action app-sidebar__group-toggle" type="button" aria-expanded="false" aria-label="Currency" data-i18n-aria-label="nav.currency">
          <i data-lucide="dollar-sign" class="ztor-icon"></i>
          <span class="app-sidebar__action-label" data-i18n="nav.currency">Currency</span>
          <span class="app-sidebar__action-value" data-currency-current style="margin-left:auto;color:var(--muted-foreground)">HKD</span>
          <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm app-sidebar__chevron"></i>
        </button>
        <ul class="app-sidebar__subnav"><div>
          <!-- 2026-07-23 使用者裁示：幣別只留 HKD（移除 TWD）-->
          <li><a class="app-sidebar__sub-link" href="#" data-currency-pick="HKD" data-i18n="nav.currency.hkd">HKD (HK$)</a></li>
        </div></ul>
      </div>

      <a class="app-sidebar__action" href="login.html" data-logout aria-label="Log out" data-i18n-aria-label="nav.logout" style="color:var(--destructive)">
        <i data-lucide="log-out" class="ztor-icon"></i>
        <span class="app-sidebar__action-label" data-i18n="nav.logout">Log out</span>
      </a>
` : `
      <label class="app-sidebar__action app-sidebar__search">
        <i data-lucide="search" class="ztor-icon"></i>
        <input type="search" class="app-sidebar__search-input" placeholder="Search…" data-i18n-placeholder="nav.search-placeholder">
      </label>

      <div class="app-notif app-notif--rail" data-dropdown data-notif>
        <button class="app-sidebar__action" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Notifications" data-i18n-aria-label="nav.notif-label">
          <i data-lucide="flag" class="ztor-icon"></i>
          <span class="app-sidebar__action-label" data-i18n="nav.notif-label">Notifications</span>
          <span class="app-topbar__badge-dot" aria-hidden="true"></span>
        </button>
        <div class="app-topbar__dropdown app-notif__panel app-notif__panel--rail" role="dialog" aria-label="Notifications">${notifPanelHtml()}</div>
      </div>

      <div class="app-sidebar__group" data-state="closed" data-account>
        <button class="app-sidebar__action app-sidebar__group-toggle" type="button" aria-expanded="false" aria-label="Account" data-i18n-aria-label="nav.account-label">
          <span class="app-sidebar__avatar">${avatarInitial()}</span>
          <span class="app-sidebar__action-label" data-i18n="nav.account-label">Account</span>
          <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm app-sidebar__chevron"></i>
        </button>
        <ul class="app-sidebar__subnav"><div>
          <li><a class="app-sidebar__sub-link" href="settings.html#profile" data-i18n="nav.profile">Profile</a></li>
          <li><a class="app-sidebar__sub-link" href="settings.html" data-i18n="nav.settings">Settings</a></li>
          <li><a class="app-sidebar__sub-link" href="settings.html#payments" data-i18n="nav.payments">Payments</a></li>
          ${langMenuHtml("sidebar")}
          <li><a class="app-sidebar__sub-link" href="login.html" data-logout data-i18n="nav.logout" style="color:var(--destructive)">Log out</a></li>
        </div></ul>
      </div>
`}
    </div>
  `;
  }

  /* ─────────────────────────────────────────────────────────
     Mount / re-mount.
     ───────────────────────────────────────────────────────── */
  function currentMode() {
    /* 2026-08-20：Admin 平台層原本一律鎖 sidebar（導航其實沒消失，但也切不成
       topbar）。主規格 §6.9.2 說兩個模式是同一套地圖、只差排列，沒有「某一層只能
       用其中一種」的例外，所以改為跟隨使用者選的模式；topbarNavHtml 已補上與
       sidebar 同一份 ADMIN_NAV 的分支。 */
    return document.documentElement.getAttribute("data-nav-mode") === "sidebar"
      ? "sidebar" : "topbar";
  }

  function mount() {
    const root = document.getElementById("sidebar") || document.getElementById("topbar");
    if (!root) return;
    const mode = currentMode();
    if (mode === "sidebar") {
      root.className = "app-sidebar";
      root.innerHTML = buildSidebar();
    } else {
      root.className = "app-topbar";
      root.innerHTML = buildTopbar();
    }
    if (window.ztorIcons) window.ztorIcons.applyIcons(root);
    if (window.applyI18n)  window.applyI18n(root);
    applyVersionRoutes(root);

    if (mode === "topbar") {
      wireScroll(root);
      wireHighlight();
      wireHoverGroups();
    }
    wireBurger(root);
    wireNavRail(root);
  }

  /* ── 側欄收合成只有 icon（2026-08-31 使用者裁示「全頁都要有」）─────
     只在 sidebar 模式有意義：topbar 模式本來就沒有可收的欄寬。
     狀態存 localStorage、由 theme.js 之外的這裡在 mount 時還原——跨頁維持同一個
     選擇，不然每點一次導覽就重新展開一次，那個鈕等於沒用。
     收起時只藏字不藏路：每個 icon 留在原位，子選單整段收起（它要靠名稱才讀得懂），
     品牌換成只有記號的版本。 */
  const RAIL_KEY = "ztor.navRail";
  function applyNavRail(on) {
    const app = document.querySelector(".app");
    if (app) app.classList.toggle("is-nav-rail", !!on);
    document.querySelectorAll("[data-nav-rail]").forEach(btn => {
      const key = on ? "nav.expand" : "nav.collapse";
      btn.setAttribute("aria-expanded", on ? "false" : "true");
      btn.setAttribute("data-i18n-aria-label", key);
      /* 直接查表寫值，不靠 applyI18n(btn)——那支只掃「傳進去那個元素的後代」，
         標籤掛在按鈕自己身上，所以永遠掃不到（實測切回展開後仍是英文）。 */
      const t = (typeof window.i18nT === "function") && window.i18nT(key);
      btn.setAttribute("aria-label", t || (on ? "Expand navigation" : "Collapse navigation"));
      const ic = btn.querySelector("[data-lucide]");
      if (ic) ic.setAttribute("data-lucide", on ? "sidebar-expand" : "sidebar-collapse");
      if (window.ztorIcons) window.ztorIcons.applyIcons(btn);
    });
  }
  /* 目前是不是收合態——**問 DOM，不問變數**（2026-09-01）。
     舊版把狀態記在 wireNavRail 的閉包變數 `on` 裡，只要有第二個地方改了收合態
     （本輪新增的「收合時點母項目就展開側欄」就是），那個變數就過期，
     下一次按收合鈕會朝錯的方向切。 */
  function navRailOn() {
    const app = document.querySelector(".app");
    return !!(app && app.classList.contains("is-nav-rail"));
  }
  function setNavRail(on) {
    try { localStorage.setItem(RAIL_KEY, on ? "1" : "0"); } catch (e) {}
    applyNavRail(on);
  }
  function wireNavRail(root) {
    const btn = root.querySelector("[data-nav-rail]");
    if (!btn) return;
    let on = false;
    try { on = localStorage.getItem(RAIL_KEY) === "1"; } catch (e) {}
    applyNavRail(on);
    btn.addEventListener("click", () => setNavRail(!navRailOn()));
  }

  /* ── Narrow-screen burger (≤900px, spec §6.8) ──────────────────
     Both shells hide their nav (and, in sidebar mode, the action rail)
     below 900px; this button expands them as a full-width stacked panel
     under the top row. Above 900px the button is display:none and the
     open flag is cleared, so the desktop rail/topbar is never affected. */
  function wireBurger(root) {
    const burger = root.querySelector("[data-nav-burger]");
    if (!burger) return;
    const setOpen = on => {
      root.toggleAttribute("data-nav-open", on);
      burger.setAttribute("aria-expanded", on ? "true" : "false");
    };
    burger.addEventListener("click", () => {
      setOpen(!root.hasAttribute("data-nav-open"));
    });
    /* Navigating away or picking an item closes the panel. */
    root.addEventListener("click", e => {
      if (e.target.closest("[data-nav-burger]")) return;
      if (e.target.closest("a[href]") && root.hasAttribute("data-nav-open")) setOpen(false);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && root.hasAttribute("data-nav-open")) setOpen(false);
    });
    /* Crossing back to desktop width must not leave a stale open flag.
       matchMedia covers normal resizes; the resize listener is a fallback for
       environments where the media-query change event does not fire. */
    const syncWidth = () => { if (window.innerWidth > 900) setOpen(false); };
    if (window.matchMedia) {
      const mq = window.matchMedia("(min-width: 901px)");
      mq.addEventListener ? mq.addEventListener("change", syncWidth) : mq.addListener(syncWidth);
    }
    window.addEventListener("resize", syncWidth, { passive: true });
    syncWidth();
  }

  /* Scrolled state — topbar switches to a frosted backdrop blur once the
     page leaves the top (dark mode, where --card is translucent). */
  let scrollHandler = null;
  function wireScroll(root) {
    if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
    scrollHandler = () => root.classList.toggle("is-scrolled", window.scrollY > 8);
    scrollHandler();
    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  /* Sliding highlight pill (topbar only). */
  function wireHighlight() {
    const navEl     = document.querySelector(".app-topbar__nav");
    const highlight = document.querySelector(".app-topbar__nav-highlight");
    if (!navEl || !highlight) return;

    function activeLink() {
      return navEl.querySelector('.app-topbar__link[aria-current="page"]');
    }
    function moveTo(linkEl) {
      if (!linkEl) return;
      const nr = navEl.getBoundingClientRect();
      const lr = linkEl.getBoundingClientRect();
      highlight.style.width  = lr.width + "px";
      highlight.style.height = lr.height + "px";
      highlight.style.transform = `translate(${lr.left - nr.left}px, ${lr.top - nr.top}px)`;
      highlight.setAttribute("data-show", "true");
    }
    function rest() {
      const a = activeLink();
      if (a) moveTo(a); else highlight.setAttribute("data-show", "false");
    }
    requestAnimationFrame(rest);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
    window.addEventListener("resize", rest);
    navEl.addEventListener("pointerover", e => {
      const link = e.target.closest(".app-topbar__link");
      if (link && navEl.contains(link)) moveTo(link);
    });
    navEl.addEventListener("pointerleave", rest);
  }

  /* Topbar dropdown state — animated via data-state (open|closed). */
  function setOpen(wrap, open) {
    const btn   = wrap.querySelector("button[aria-haspopup]");
    const panel = wrap.querySelector(".app-topbar__dropdown");
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("data-state", open ? "open" : "closed");
  }
  function closeAll(except) {
    document.querySelectorAll("[data-dropdown]").forEach(d => {
      if (d !== except) setOpen(d, false);
    });
  }

  /* Hover-to-open for topbar nav mega groups (SPEC §3.2.2). */
  let hoverCloseTimer = null;
  function wireHoverGroups() {
    document.querySelectorAll(".app-topbar__nav [data-dropdown]").forEach(group => {
      group.addEventListener("pointerenter", () => {
        clearTimeout(hoverCloseTimer);
        closeAll(group);
        setOpen(group, true);
      });
      group.addEventListener("pointerleave", () => {
        hoverCloseTimer = setTimeout(() => setOpen(group, false), 140);
      });
    });
  }

  /* ── Document-level delegated handlers (attached once) ── */

  /* Topbar click toggle + outside-click close. */
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-dropdown] > button[aria-haspopup]");
    if (trigger) {
      e.preventDefault();
      const wrap = trigger.parentElement;
      const open = trigger.getAttribute("aria-expanded") === "true";
      closeAll(wrap);
      setOpen(wrap, !open);
      if (!open) wrap.querySelector("[data-autofocus]")?.focus();
      return;
    }
    if (!e.target.closest("[data-dropdown]")) closeAll();
  });

  /* Notification center demo interaction: mark visible items as read and clear
     entrance badges. Real removal of to-dos happens in each source module. */
  document.addEventListener("click", e => {
    const markRead = e.target.closest(".app-notif__markread");
    if (!markRead) return;
    e.preventDefault();
    const center = markRead.closest(".app-notif");
    if (!center) return;
    center.querySelectorAll("[data-unread]").forEach(item => item.removeAttribute("data-unread"));
    center.querySelectorAll(".app-topbar__badge-dot").forEach(dot => dot.setAttribute("data-read", "true"));
  });

  /* Sidebar accordion groups (nav groups + account). */
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".app-sidebar__group-toggle");
    if (!toggle) return;
    e.preventDefault();
    const group = toggle.closest(".app-sidebar__group");
    /* 收合態下點有子項目的母項目：先把側欄展開，再把這一組打開（2026-09-01 使用者回報
       「收合狀態下這幾個有子項目的點擊都沒反應」）。
       為什麼看起來沒反應：accordion 本身有作動、`data-state` 也翻了，但收合態的子選單
       是被 CSS 藏起來的（見 shared.css 的 `.is-nav-rail`），翻了也看不到。
       這時候使用者的意圖是「我要看到子項目」，所以**強制展開**、不照 toggle 的語意
       （否則本來就 open 的那一組會在展開側欄的同一下被收掉，等於還是沒反應）。
       底部 actions 的帳號／幣別群組不走這條——它們在收合態有自己的浮出選單。 */
    const inNav = !!group.closest(".app-sidebar__nav");
    const wasRail = inNav && navRailOn();
    if (wasRail) setNavRail(false);
    const open = !wasRail && group.getAttribute("data-state") === "open";
    /* 2026-07-27：真正的 accordion——展開一個就收合同層的其他群組，側欄高度因此有上限、
       不會因為使用者逐一點開而重新溢出（這是「側欄不捲動」能成立的另一半）。
       scope 限定 .app-sidebar__nav 內的導覽群組：底部 actions 的帳號／幣別群組
       （同樣用 .app-sidebar__group）不受影響，它們與導覽互不相干。 */
    const nav = group.closest(".app-sidebar__nav");
    if (nav && !open) {
      nav.querySelectorAll(".app-sidebar__group[data-state='open']").forEach(sib => {
        if (sib === group) return;
        sib.setAttribute("data-state", "closed");
        const t = sib.querySelector(".app-sidebar__group-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }
    group.setAttribute("data-state", open ? "closed" : "open");
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
  });

  /* 底部動作區的群組（帳戶／幣別）是「選單」，不是導覽 accordion：點到群組以外的
     任何地方都要收合。
     2026-07-31 使用者回報：帳戶選單開著時去點搜尋或通知，它會留在原地不動。原因是
     那兩個動作分屬不同機制——搜尋只是個 <label>、根本不在任何下拉裡；通知是
     [data-dropdown]，它的處理只呼叫 closeAll() 收其他 [data-dropdown]。兩邊都不認得
     .app-sidebar__group，所以誰都沒收它。與其在每個動作各補一次，統一在這裡收，
     不管點擊來自哪裡都成立。
     只管 .app-sidebar__actions 內的群組：導覽區的 accordion 展開後是要留著看的內容
     清單，不該因為點了別處就闔上。 */
  function closeSidebarActionGroups(except) {
    document.querySelectorAll(".app-sidebar__actions .app-sidebar__group[data-state='open']").forEach(g => {
      if (g === except) return;
      g.setAttribute("data-state", "closed");
      const t = g.querySelector(".app-sidebar__group-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("click", e => {
    /* 點在群組自己裡面（切換鈕、選單內的連結）不收——收合交給上面的 toggle 處理 */
    closeSidebarActionGroups(e.target.closest(".app-sidebar__actions .app-sidebar__group"));
  });

  /* Currency picker (Admin footer) — 選幣別即更新標籤＋記住，收合群組。預設港幣。 */
  document.addEventListener("click", e => {
    const pick = e.target.closest("[data-currency-pick]");
    if (!pick) return;
    e.preventDefault();
    const cur = pick.getAttribute("data-currency-pick");
    document.querySelectorAll("[data-currency-current]").forEach(el => { el.textContent = cur; });
    try { localStorage.setItem("ztor-currency", cur); } catch (err) {}
    const group = pick.closest(".app-sidebar__group");
    if (group) {
      group.setAttribute("data-state", "closed");
      const t = group.querySelector(".app-sidebar__group-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    }
  });
  function applySavedCurrency() {
    let cur = null;
    try { cur = localStorage.getItem("ztor-currency"); } catch (err) {}
    /* 幣別現只支援 HKD（2026-07-23 移除 TWD）：非 HKD 的舊存值一律回退 HKD，避免卡在無法切換的狀態 */
    if (cur !== "HKD") { cur = "HKD"; try { localStorage.setItem("ztor-currency", "HKD"); } catch (err) {} }
    document.querySelectorAll("[data-currency-current]").forEach(el => { el.textContent = cur; });
  }

  /* 語言列（帳戶選單內可展開的單選清單，D222）——topbar／sidebar 共用同一組
     data 屬性。展開／收合只影響這一顆嵌套面板，不牽動外層帳戶下拉本身（[data-lang-toggle]
     不是 [data-dropdown] 的直接子節點，不會被上面 setOpen/closeAll 那組 topbar 開合
     邏輯攔截；sidebar 這顆也刻意不用 .app-sidebar__group class，避免跟帳戶外層的
     accordion 群組互相干擾，見鐵律 9 判準的反向應用——這裡刻意不共用外層那套狀態機）。 */
  document.addEventListener("click", e => {
    const toggle = e.target.closest("[data-lang-toggle]");
    if (!toggle) return;
    e.preventDefault();
    const panel = toggle.parentElement.querySelector(".app-topbar__dropdown-langlist, .app-sidebar__lang-panel");
    if (!panel) return;
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
  });
  /* 點語言＝呼叫 ztorLang.set()（語言的唯一 API）。選完收合面板，其餘欄位（打勾、
     目前值標籤）由下面的 refreshLangRows() 隨 ztor:lang-changed 廣播統一 patch，
     不在這裡重複寫一份。 */
  document.addEventListener("click", e => {
    const pick = e.target.closest("[data-lang-pick]");
    if (!pick) return;
    e.preventDefault();
    if (window.ztorLang) window.ztorLang.set(pick.getAttribute("data-lang-pick"));
    const panel = pick.closest(".app-topbar__dropdown-langlist, .app-sidebar__lang-panel");
    if (panel) {
      panel.hidden = true;
      const toggle = panel.parentElement.querySelector("[data-lang-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  });
  /* 語言變更時，patch 所有已掛載的語言列（topbar／sidebar 可能同時存在於
     DOM——burger 收合面板與桌面版共用同一份 markup）：目前值標籤、打勾。不整段
     重繪——sidebar.js 只在 navmode/creator/devstate 變更時 remount，語言變更不屬於
     這三者。D221 曾在這裡一併 patch「預設」徽章，D222 撤除該概念後移除。 */
  function refreshLangRows() {
    if (!window.ztorLang) return;
    const current = window.ztorLang.get();
    const list = window.ztorLang.list();
    const labelFor = code => (list.find(p => p[0] === code) || [code, code])[1];
    document.querySelectorAll("[data-lang-current-label]").forEach(el => { el.textContent = labelFor(current); });
    document.querySelectorAll("[data-lang-pick]").forEach(btn => {
      const code = btn.getAttribute("data-lang-pick");
      const checked = code === current;
      btn.setAttribute("aria-checked", checked ? "true" : "false");
      let check = btn.querySelector("[data-lucide='check']");
      if (checked && !check) {
        const isTopbar = btn.classList.contains("app-topbar__dropdown-option");
        const i = document.createElement("i");
        i.setAttribute("data-lucide", "check");
        i.className = "ztor-icon ztor-icon--sm " + (isTopbar ? "app-topbar__dropdown-lang-check" : "app-sidebar__lang-check");
        const textEl = btn.querySelector(".app-topbar__dropdown-option-text, .app-sidebar__lang-text");
        if (textEl) textEl.insertAdjacentElement("afterend", i); else btn.appendChild(i);
        if (window.ztorIcons) window.ztorIcons.applyIcons(btn);
      } else if (!checked && check) {
        check.remove();
      }
    });
  }
  /* 首次呼叫交給下面的 mountAndRestore()（mount() 產生 DOM 之後才有東西可 patch）。 */
  document.addEventListener("ztor:lang-changed", refreshLangRows);

  /* ── 登出 ─────────────────────────────────────────────────
     三個入口共用同一條處理：topbar 帳戶下拉、側欄帳戶選單、Admin 側欄底部。
     全部標 [data-logout]，行為只在這裡定義一次。

     原型沒有真的 session——`login.html` 從頭到尾不寫任何「已登入」旗標，
     登入成功只是 location.href 換頁（見 ASSUMPTIONS UIA-105）。所以登出能清的
     只有「這次是用什麼身分在看」，也就是 ztor.role（2026-09-08 起唯一的身分狀態，
     取代本輪退役的那兩把舊身分 key）——登出回到 general。
     其餘 localStorage 一律不動：語言、顯示模式、幣別、主題、
     devtools 狀態都是裝置偏好，重新登入後本來就該維持原樣；ztor.persona 是
     cheat code 的假資料人物開關（開發工具狀態、不是身分），清掉只會讓下次載入
     被 theme.js 重設成 default、悄悄換掉整批展示資料，所以也不碰。

     登出後導向 login.html。是否需要二次確認、是否真的該一併放掉代操中的 creator、
     正式 session 該清哪些東西——上游沒有規格（ASSUMPTIONS 產品缺口 PG-032）。 */
  document.addEventListener("click", e => {
    const out = e.target.closest("[data-logout]");
    if (!out) return;
    e.preventDefault();
    setRole("general");
    location.href = "login.html";
  });

  /* ESC closes any open topbar dropdown. */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
  });

  /* ── Admin 頁門禁（2026-09-08 使用者裁決）────────────────────────────────
     Admin 平台層的頁面（ADMIN_ROUTES）只有 Admin 身分進得去。role=general 時把
     主內容整段收起來，換成一則無權限狀態——不做「頁面看得到但按鈕都沒反應」，
     也不做導轉（導轉會讓使用者不知道自己被擋在哪裡）。

     一份共用實作、六頁共用，不是每頁各寫一份：站上原本只有 admin-video-review.html
     自己寫了一個 `#vr-noaccess`（由它自己的「檢視身分」假開關控制），本輪把那份退役、
     行為收進這裡。呈現重用既有元件 `.empty-card`（＋既有的 .btn），零新 CSS。 */
  const GATE_ATTR = "data-admin-gate";
  const GATE_HID  = "data-admin-gate-hid";
  function gateHost() {
    /* 一般 Admin 頁的主內容容器；admin-ip-bank-entry.html 是 wizard 版型，
       它的主內容是表單本體（頁首返回鍵留著，使用者才走得出去）。 */
    return document.querySelector(".main > .page") || document.querySelector(".main")
        || document.querySelector(".wizard__body");
  }
  function gateAlsoHide() {
    /* wizard 版型的底部動作列在主內容之外，不收起來的話會剩一顆孤零零的送出鈕。 */
    const foot = document.querySelector(".wizard__bottom");
    return foot ? [foot] : [];
  }
  const GATE_HTML =
    '<div ' + GATE_ATTR + '>' +
      '<div class="empty-card">' +
        '<div class="empty-card__icon empty-card__icon--warning"><i data-lucide="lock" class="ztor-icon"></i></div>' +
        '<h2 class="empty-card__title" data-i18n="admin.gate.title">Admin access required</h2>' +
        '<p class="empty-card__text" data-i18n="admin.gate.text">This page belongs to platform operations. Switch the Role to Admin in Cheat Codes, or sign in with an Admin account.</p>' +
        '<a class="btn btn--outline empty-card__cta" href="index.html" data-i18n="admin.gate.back">Back to the workspace</a>' +
      '</div>' +
    '</div>';
  function applyAdminGate() {
    if (!isAdminPlatform) return;
    const host = gateHost();
    if (!host) return;
    const denied = !isAdminRole();
    const hideAlso = gateAlsoHide();
    [].slice.call(host.children).concat(hideAlso).forEach(function (el) {
      if (el.hasAttribute(GATE_ATTR)) return;
      if (denied) {
        /* 只收起「本來看得到」的東西，頁面自己 hidden 的區塊維持原狀——
           解除門禁時才不會把它們一起放出來（例如審核頁的詳情檢視）。 */
        if (!el.hasAttribute("hidden")) { el.setAttribute(GATE_HID, ""); el.setAttribute("hidden", ""); }
      } else if (el.hasAttribute(GATE_HID)) {
        el.removeAttribute(GATE_HID); el.removeAttribute("hidden");
      }
    });
    let gate = host.querySelector("[" + GATE_ATTR + "]");
    if (denied && !gate) {
      host.insertAdjacentHTML("beforeend", GATE_HTML);
      gate = host.querySelector("[" + GATE_ATTR + "]");
      if (window.ztorIcons) window.ztorIcons.applyIcons(gate);
      if (window.applyI18n) window.applyI18n(gate);
    } else if (!denied && gate) {
      gate.remove();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAdminGate);
  else applyAdminGate();

  /* Initial mount + re-mount when the display mode or active creator changes. */
  function mountAndRestore() { mount(); applySavedCurrency(); refreshAvatar(); refreshLangRows(); applyAdminGate(); }
  mountAndRestore();

  /* sidebar.js 在多數頁面比 projects-store.js 早載入（實測 index.html：
     sidebar 在 286 行、projects-store 在 291 行），所以 mount() 當下
     window.ztorProjects 還不存在，avatarInitial() 只會拿到退路值 "M"。
     DOM 就緒與 load 之後各補寫一次，此時 store 必定已經在。 */
  function refreshAvatar() {
    var i = avatarInitial();
    document.querySelectorAll(".app-topbar__avatar, .app-sidebar__avatar")
      .forEach(function (el) { el.textContent = i; });
    /* 代管中的創作者名字同理：mount() 當下 projects-store 可能還沒載入，先寫進去的
       是交接時存的那一份，store 到位後改用它的擁有者名稱（雙語稱謂會跟著語言變）。 */
    var ctx = adminContext();
    if (!ctx || !ctx.name) return;
    document.querySelectorAll(".app-topbar__context-name, .app-sidebar__context-name")
      .forEach(function (el) { el.textContent = ctx.name; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refreshAvatar);
  else refreshAvatar();
  window.addEventListener("load", refreshAvatar);
  /* 換語言也要重寫：稱謂本身是雙語的（周湯豪／Nick Chou），縮寫跟著變 周／N。 */
  document.addEventListener("i18n:applied", refreshAvatar);
  document.addEventListener("ztor:navmode-changed", mountAndRestore);
  document.addEventListener("ztor:creator-changed", mountAndRestore);
  document.addEventListener("ztor:devstate-changed", mountAndRestore);
})();
