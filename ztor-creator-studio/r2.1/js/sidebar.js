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
  const ADMIN_ROUTES = new Set(["creators.html", "admin-ip-bank.html", "admin-ip-bank-entry.html", "ip-bank-reporting.html", "admin-platform-fees.html"]);
  const ADMIN_NAV = [
    { href: "creators.html",          key: "admin.creator-mgmt", icon: "users" },
    { href: "admin-ip-bank.html",     key: "admin.ip-bank",      icon: "landmark", match: ["admin-ip-bank-entry.html"] },
    { href: "ip-bank-reporting.html", key: "admin.ip-reporting", icon: "bar-chart-3" },
    { href: "admin-platform-fees.html", key: "admin.platform-fees", icon: "percent" }
  ];
  const isRoster = path === ROSTER_PAGE;
  const isAdminPlatform = ADMIN_ROUTES.has(path);
  /* Demo roster (prototype data; the real list comes from the backend).
     Mirrors the concept sketch (denise / aya / kmt). */
  /* D107: creator 資料含 email／電話（選填）／建立時間。email 供 phase 2 交還本人。 */
  const CREATORS = [
    { handle: "denise", name: "Denise Lonely",  shop: "/shop/denise", status: "active",   email: "denise@example.com", phone: "",             created: "2026-01-08" },
    { handle: "aya",    name: "Aya Kondo",       shop: "/shop/aya",    status: "active",   email: "aya@example.com",    phone: "+81 90-1234-5678", created: "2026-02-19" },
    { handle: "kmt",    name: "KMT Collective",  shop: "/shop/kmt",    status: "disabled", email: "team@kmt.example",   phone: "",             created: "2025-11-30" },
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
  const CREATOR_LS = "ztor.activeCreator";
  function getCreator() {
    try { return CREATORS.find(c => c.handle === localStorage.getItem(CREATOR_LS)) || null; }
    catch (e) { return null; }
  }
  function setCreator(handle) {
    try { handle ? localStorage.setItem(CREATOR_LS, handle) : localStorage.removeItem(CREATOR_LS); }
    catch (e) {}
    document.dispatchEvent(new CustomEvent("ztor:creator-changed", { detail: { handle: handle || null } }));
  }
  /* Shared with creators.html (roster render + onboard flow) and devtools.js (cheat-code switch).
     registered = BR-02 pre-registered accounts pool (searched by the「建立 creator」onboard wizard). */
  window.ztorCreator = { list: CREATORS, registered: REGISTERED, get: getCreator, set: setCreator, rosterPage: ROSTER_PAGE };

  /* Full Ztor wordmark from R 2.0 (101×32 viewBox, monochrome currentColor). */
  const LOGO_SVG = '<svg class="app-topbar__brand-logo" viewBox="0 0 101 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.99" d="M55.749 7.35352C62.3102 6.56387 68.1795 8.99977 70.8506 13.6182C71.8335 15.3184 72.2187 16.7656 72.3027 19.0908C72.4094 22.015 71.9544 23.817 70.5332 26.0986C69.8395 27.2145 67.9548 29.025 66.6904 29.792C62.6322 32.2529 56.4412 32.7086 51.6602 30.8984C48.7838 29.81 46.349 27.6537 45.0264 25.0264C44.2163 23.4148 43.8408 21.6966 43.8311 19.5537C43.8214 17.4853 44.0078 16.4756 44.6934 14.8818C45.864 12.1628 48.31 9.81044 51.2637 8.56543C52.486 8.05031 54.5137 7.50209 55.749 7.35352ZM96.4805 23.1143C98.9761 23.1143 101 24.9861 101 27.2949C101 29.6039 98.9763 31.4766 96.4805 31.4766C93.9848 31.4764 91.9619 29.6038 91.9619 27.2949C91.9622 24.9863 93.985 23.1145 96.4805 23.1143ZM89.5264 7.31055C90.089 7.31055 90.5439 7.76583 90.5439 8.32617V12.2227C90.5439 12.6328 90.2997 12.9866 89.9473 13.1465L89.9102 13.1621L83.6123 15.9268C83.2129 16.1318 82.9384 16.5458 82.9336 17.0254V30.1709C82.9336 30.7329 82.4771 31.1875 81.916 31.1875H76.9004C76.3379 31.1873 75.8838 30.7311 75.8838 30.1709V8.68457C75.8838 8.12275 76.3395 7.66917 76.9004 7.66895H81.916C82.4787 7.66895 82.9336 8.12423 82.9336 8.68457V9.69531C82.9336 9.84549 83.0567 9.96875 83.207 9.96875C83.2424 9.96868 83.2764 9.96012 83.3086 9.94727C83.3103 9.94707 83.3154 9.94482 83.3164 9.94434L89.1035 7.4043L89.1465 7.38477C89.2644 7.33638 89.3923 7.31061 89.5264 7.31055ZM35.6514 0C36.214 0 36.6689 0.455327 36.6689 1.01562V7.56348C36.6689 7.83628 36.89 8.05745 37.1631 8.05762H40.5762C41.1387 8.05762 41.5935 8.51311 41.5938 9.07324V12.5742C41.5938 13.1362 41.1372 13.5908 40.5762 13.5908H37.1631C36.89 13.591 36.6689 13.8122 36.6689 14.085V30.1699C36.6689 30.7318 36.2124 31.1855 35.6514 31.1855H30.6592C30.0966 31.1855 29.6417 30.7302 29.6416 30.1699V14.085C29.6416 13.8122 29.4205 13.5911 29.1475 13.5908H27.9102C27.3475 13.5908 26.8936 13.1346 26.8936 12.5742V9.07324C26.8938 8.51149 27.3493 8.05762 27.9102 8.05762H29.1475C29.4205 8.05738 29.6416 7.83624 29.6416 7.56348V1.01562C29.6417 0.453712 30.0982 0 30.6592 0H35.6514ZM23.1084 8.04492C23.7194 8.0451 24.2138 8.5392 24.2139 9.14941C24.2139 9.37374 24.1479 9.58055 24.0332 9.75488L23.8936 9.92773L20.9365 13.5889L12.6016 23.9072C12.5773 23.9347 12.5552 23.9641 12.5342 23.9932C12.4161 24.1563 12.3467 24.3549 12.3467 24.5713C12.3468 25.1201 12.7923 25.5652 13.3418 25.5654H23.4619L23.4639 25.5645C24.0265 25.5645 24.4805 26.0198 24.4805 26.5801V30.168C24.4805 30.7299 24.0249 31.1835 23.4639 31.1836H0.998047C0.4467 31.1836 0 30.7382 0 30.1875C2.76681e-06 29.9727 0.0710906 29.7725 0.1875 29.6094L0.256836 29.5234L3.45312 25.5645L12.5 14.3652C12.5017 14.3637 12.5049 14.3619 12.5049 14.3604C12.5581 14.2814 12.5888 14.1864 12.5889 14.085C12.5889 13.8121 12.367 13.5908 12.0938 13.5908H2.12988C1.56722 13.5908 1.1123 13.1346 1.1123 12.5742V9.06055C1.11243 8.49869 1.56891 8.04492 2.12988 8.04492H23.1084ZM59.7852 13.2803C56.0761 12.3824 52.1339 14.574 51.2188 18.041C50.9957 18.8888 50.9911 20.5182 51.2109 21.2852C51.8885 23.6539 54.3762 25.684 57.0762 26.0732C60.5912 26.5803 64.1954 24.3252 64.9893 21.123C65.201 20.2655 65.1817 18.8623 64.9473 18.0518C64.2681 15.7105 62.2975 13.8891 59.7852 13.2803ZM24.2168 8.05762L24.2012 8.04492H24.2168V8.05762Z"/></svg>';

  /* Nav definition · spec §3.2.1 order. Each top-level item carries a Tabler
     icon (used by the sidebar mode). Dropdowns (panel) = IP Bank + E-Shop
     (spec §3.2.1 / decisions D013 + D014). Sub-pages / create flows are reached
     in-page, not from the header; `match` keeps the item highlighted there. */
  const NAV = [
    { href: "index.html",    key: "nav.dashboard", icon: "layout-grid" },
    { href: "projects.html", key: "nav.projects",  icon: "rocket",
      match: ["create-project.html"] },
    /* IP Bank dropdown (D013): My IP + IP Market. IP detail is a detail page
       reached in-page → not a dropdown item, but still highlights via match. */
    { key: "nav.ip-bank", icon: "landmark", panel: [
      { href: "my-ip.html",     icon: "tag",    titleKey: "nav.my-ip",     descKey: "nav.my-ip-sub" },
      { href: "ip-market.html", icon: "search", titleKey: "nav.ip-market", descKey: "nav.ip-market-sub" },
    ], match: ["ip-detail.html"] },
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
    /* Events / Fans = flat top-level links; sub-pages reached in-page. */
    { href: "events.html",   key: "nav.events",   icon: "ticket", match: ["create-event.html"] },
    { href: "fans-crm.html", key: "nav.fans",     icon: "users" },
    { href: "earnings.html", key: "nav.earnings", icon: "banknote", match: ["earnings-sony.html"] },
  ];

  /* feature-scope-map 未列的整頁功能在低版本不可作為任何入口。
     完整清單也供 notification/account/link 這類 NAV 以外的錨點使用。 */
  const FULL_ROUTES = new Set([
    "index.html", "creators.html", "admin-ip-bank.html", "admin-ip-bank-entry.html", "ip-bank-reporting.html", "admin-platform-fees.html", "projects.html", "project-detail.html", "create-project.html",
    "create-campaign.html", "funding-simulate.html", "events.html", "event-detail.html", "create-event.html",
    "fans-crm.html", "fan-detail.html", "tier-settings.html", "my-ip.html", "ip-detail.html",
    "ip-market.html", "register-ip.html", "pickup.html", "pickup-detail.html", "scanner.html", "settings.html"
  ]);
  function fullVersion() {
    const v = (window.ztorDevState && window.ztorDevState.get && window.ztorDevState.get().version)
      || document.documentElement.getAttribute("data-version") || "full";
    /* 以 Phase 4 為基底的版本（不減功能、只改接個別頁面）：nav 全開。
       與 devtools.js 的 isFullBaseVersion() 同一份白名單，新增同型特殊版時兩處都要加。 */
    return v === "full" || v === "funding-test" || v === "deck-for-sony";
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
    { icon: "refresh-ccw",    href: "settings.html#integrations", k: "notif.connected",    source: "notif.source.settings" },
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
     TOPBAR mode (R 2.0 canonical) — horizontal bar markup.
     ───────────────────────────────────────────────────────── */
  function topbarNavHtml(locked) {
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
    const creator = getCreator();                 // null = 一般創作者（無 admin 代管）
    const adminScope = !isAdminPlatform && !!creator;    // admin 正在代管某個 creator
    /* Three nav faces (spec §4.1):
       · Tier 0 roster (creators.html): "Creator Management" marker + locked Tier-1.
       · Admin 代管 (Tier-1, a creator selected): back-to-roster icon BEFORE the logo
         (使用者裁示, D086) + "Managing <creator>" chip + full nav.
       · 一般創作者 (Tier-1, no creator selected): plain topbar, NO admin chrome —
         the normal dashboard view (之前的版本). */
    const back = adminScope
      ? `<a class="app-topbar__back" href="${ROSTER_PAGE}" aria-label="Back to creators" data-i18n-aria-label="admin.back">
           <i data-lucide="arrow-left" class="ztor-icon"></i>
         </a>`
      : "";
    const marker = isAdminPlatform
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
    <a href="${isAdminPlatform ? ROSTER_PAGE : "index.html"}" class="app-topbar__brand" aria-label="Ztor Creator Studio">${LOGO_SVG}</a>
    ${marker}

    <nav aria-label="Primary">
      <ul class="app-topbar__nav"><span class="app-topbar__nav-highlight" aria-hidden="true"></span>${topbarNavHtml(isAdminPlatform)}</ul>
    </nav>

    <div class="app-topbar__actions">
      <button class="app-topbar__icon-btn btn btn--icon" type="button" data-nav-toggle aria-label="Display mode" data-i18n-aria-label="nav.navmode-label">
        <i data-lucide="panel-left" class="ztor-icon"></i>
        <i data-lucide="panel-top" class="ztor-icon"></i>
      </button>

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
        <button class="app-topbar__avatar" aria-haspopup="true" aria-expanded="false" aria-label="Account" data-i18n-aria-label="nav.account-label" type="button">M</button>
        <ul class="app-topbar__dropdown app-topbar__dropdown--right" role="menu">
          <li role="presentation"><a class="app-topbar__dropdown-option" href="settings.html#profile" role="menuitem" data-i18n="nav.profile">Profile</a></li>
          <li role="presentation"><a class="app-topbar__dropdown-option" href="settings.html" role="menuitem" data-i18n="nav.settings">Settings</a></li>
          <li role="presentation"><a class="app-topbar__dropdown-option" href="settings.html#payments" role="menuitem" data-i18n="nav.payments">Payments</a></li>
          <li class="app-topbar__dropdown-divider" role="separator"></li>
          <li role="presentation"><a class="app-topbar__dropdown-option" href="#" role="menuitem" data-i18n="nav.logout" style="color:var(--destructive)">Log out</a></li>
        </ul>
      </div>
    </div>
  `;
  }

  /* ─────────────────────────────────────────────────────────
     SIDEBAR mode — vertical rail markup. Same NAV, dropdowns become
     expandable accordion groups (§6.9). Actions sit at the bottom.
     ───────────────────────────────────────────────────────── */
  function sidebarNavHtml(locked) {
    /* 現役樣式＝可收合 accordion（2026-06-13 使用者反饋改回原樣）。
       「分組標題＋子項平鋪」版本（.app-sidebar__section-label）仍保留在
       shared.css 與 design-system，作為可隨時切回的變體。 */
    /* D107: 未選定 creator 時 Tier 1 模組不在導航呈現（只留 Creator 管理 marker）。 */
    if (isAdminPlatform) {
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
        /* 2026-06-13：群組預設展開（const open = true，仍可點 toggle 收合）；
           父項（群組標題）不顯示已選態——只有實際 current 子項 highlight。 */
        const open = true;
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
    const creator = getCreator();                 // null = 一般創作者（無 admin 代管）
    const adminScope = !isAdminPlatform && !!creator;
    /* Same three faces as topbar: roster marker / admin 代管 (back + managing) /
       plain creator (no chrome). */
    const lead = isAdminPlatform
      ? `<div class="app-sidebar__context app-sidebar__context--admin">
           <i data-lucide="shield-check" class="ztor-icon"></i>
           <span data-i18n="admin.studio">Admin Creator Studio</span>
         </div>`
      : (adminScope ? `<a class="app-sidebar__back" href="${ROSTER_PAGE}" data-i18n-aria-label="admin.back" aria-label="Back to creators">
           <i data-lucide="arrow-left" class="ztor-icon"></i>
           <span class="app-sidebar__back-label" data-i18n="admin.back-short">Creators</span>
         </a>
         <div class="app-sidebar__context">
           <span class="app-sidebar__context-label" data-i18n="admin.managing">Managing</span>
           <span class="app-sidebar__context-name">${creator.name}</span>
         </div>` : "");
    return `
    <a href="${isAdminPlatform ? ROSTER_PAGE : "index.html"}" class="app-sidebar__brand" aria-label="Ztor Creator Studio">${LOGO_SVG}</a>
    ${lead}

    <nav aria-label="Primary">
      <ul class="app-sidebar__nav">${sidebarNavHtml(isAdminPlatform)}</ul>
    </nav>

    <div class="app-sidebar__actions">${isAdminPlatform ? `
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

      <button class="app-sidebar__action" type="button" data-nav-toggle aria-label="Display mode" data-i18n-aria-label="nav.navmode-label">
        <i data-lucide="panel-left" class="ztor-icon"></i>
        <i data-lucide="panel-top" class="ztor-icon"></i>
        <span class="app-sidebar__action-label" data-i18n="nav.navmode-label">Display mode</span>
      </button>

      <a class="app-sidebar__action" href="#" aria-label="Log out" data-i18n-aria-label="nav.logout" style="color:var(--destructive)">
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

      <button class="app-sidebar__action" type="button" data-nav-toggle aria-label="Display mode" data-i18n-aria-label="nav.navmode-label">
        <i data-lucide="panel-left" class="ztor-icon"></i>
        <i data-lucide="panel-top" class="ztor-icon"></i>
        <span class="app-sidebar__action-label" data-i18n="nav.navmode-label">Display mode</span>
      </button>

      <div class="app-sidebar__group" data-state="closed" data-account>
        <button class="app-sidebar__action app-sidebar__group-toggle" type="button" aria-expanded="false" aria-label="Account" data-i18n-aria-label="nav.account-label">
          <span class="app-sidebar__avatar">M</span>
          <span class="app-sidebar__action-label" data-i18n="nav.account-label">Account</span>
          <i data-lucide="chevron-down" class="ztor-icon ztor-icon--sm app-sidebar__chevron"></i>
        </button>
        <ul class="app-sidebar__subnav"><div>
          <li><a class="app-sidebar__sub-link" href="settings.html#profile" data-i18n="nav.profile">Profile</a></li>
          <li><a class="app-sidebar__sub-link" href="settings.html" data-i18n="nav.settings">Settings</a></li>
          <li><a class="app-sidebar__sub-link" href="settings.html#payments" data-i18n="nav.payments">Payments</a></li>
          <li><a class="app-sidebar__sub-link" href="#" data-i18n="nav.logout" style="color:var(--destructive)">Log out</a></li>
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
    if (isAdminPlatform) return "sidebar";
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
    /* Language toggle changes label widths → recompute resting pill. */
    document.addEventListener("click", e => {
      if (e.target.closest(".app-topbar__lang")) setTimeout(rest, 60);
    });
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
    const open = group.getAttribute("data-state") === "open";
    group.setAttribute("data-state", open ? "closed" : "open");
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
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

  /* ESC closes any open topbar dropdown. */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
  });

  /* Initial mount + re-mount when the display mode or active creator changes. */
  function mountAndRestore() { mount(); applySavedCurrency(); }
  mountAndRestore();
  document.addEventListener("ztor:navmode-changed", mountAndRestore);
  document.addEventListener("ztor:creator-changed", mountAndRestore);
  document.addEventListener("ztor:devstate-changed", mountAndRestore);
})();
