/* 設計系統各頁共用的左側目錄。連結一律寫「檔名#位置」，載入後把指向本頁的連結改成「#位置」。
   新增元件卡：在對應分組加一行 toc__link，檔名寫元件卡所在的那一頁。 */
document.write(String.raw`  <aside class="toc">

    <p class="toc__brand"><span class="toc__brand-mark">✻</span> Ztor Creator Studio · R 2.2</p>
    <p class="toc__sub">design system · creator studio</p>
    <button class="toc__theme" data-theme-toggle hidden>◐ <span data-en>Theme</span><span data-zh>主題</span></button>
    <button class="toc__lang" data-lang-toggle>中文</button>
    <div class="toc__display">
      <button class="toc__mode" data-mode-toggle aria-label="Display mode / 顯示模式">
        <i data-lucide="monitor" class="ztor-icon"></i>
        <span data-mode="fixed"><span data-en>Fixed</span><span data-zh>固定寬</span></span>
        <span data-mode="rwd">RWD</span>
      </button>
      <label class="toc__width" data-width-wrap><input type="number" data-width-input min="320" max="2560" step="10" value="1440" aria-label="Content width (px)"> px</label>
    </div>
    <div class="toc__group"><span data-en>Overview</span><span data-zh>總覽</span></div>
    <a class="toc__link" href="design-system.html#identity"><span data-en>Identity</span><span data-zh>識別</span></a>
    <a class="toc__link" href="design-system.html#quickref"><span data-en>Quick Reference</span><span data-zh>速查</span></a>
    <a class="toc__link" href="design-system.html#dodont"><span data-en>Top-level Do / Don't</span><span data-zh>總則 該做／別做</span></a>
    <div class="toc__group"><span data-en>Pillar 0 · Record</span><span data-zh>Pillar 0 · 記錄</span></div>
    <a class="toc__link" href="design-system.html#record"><span data-en>System metadata</span><span data-zh>系統 metadata</span></a>
    <div class="toc__group"><span data-en>Pillar 1 · Foundation</span><span data-zh>Pillar 1 · 基礎</span></div>
    <a class="toc__link" href="design-system-foundation.html#foundation"><span data-en>Foundation tokens</span><span data-zh>基礎 token</span></a>
    <div class="toc__group"><span data-en>Pillar 2 · Role</span><span data-zh>Pillar 2 · 角色</span></div>
    <a class="toc__link" href="design-system-role-mode.html#role"><span data-en>Semantic roles</span><span data-zh>語意角色</span></a>
    <div class="toc__group"><span data-en>Pillar 3 · Mode</span><span data-zh>Pillar 3 · 模式</span></div>
    <a class="toc__link" href="design-system-role-mode.html#mode"><span data-en>Dark / overrides</span><span data-zh>深色／覆寫</span></a>
    <div class="toc__group"><span data-en>Pillar 4 · Component</span><span data-zh>Pillar 4 · 元件</span></div>
    <a class="toc__link" href="design-system-components.html#classification"><span data-en>4.0 Classification</span><span data-zh>4.0 分類</span></a>
    <a class="toc__link" href="design-system-components.html#inventory"><span data-en>4.1 Inventory</span><span data-zh>4.1 清單</span></a>
    <div class="toc__subgroup"><span data-en>Primitives</span><span data-zh>基礎元素</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#button">Button</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#badge">Badge / Status pill</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#chip">Chip</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#switch">Switch</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#info-banner">Info banner</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#icon">Icon</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#input">Input</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#avatar">Avatar</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#stock-readout">Stock readout 📄</a>
    <div class="toc__subgroup"><span data-en>Form &amp; fields</span><span data-zh>表單與欄位</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#field-system">Field system</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#form-section">Form section</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#owner-lookup">Owner lookup</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#form-grid">Form grid</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#control-row">Control row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#collapse-group">Collapse group</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#field-more">Field more</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#field-pill">Field pill</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#search-collapse">Search collapse</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#upload-tile">Upload tile</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#bundle-editor">Bundle editor</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#album-tracks">Album tracks</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#vip-card">VIP card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#tag-input">Tag input</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#combobox">Combobox</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#variant-builder">Variant builder</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#number-stepper">Number stepper</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#zselect">Custom select (zselect)</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#ticket-tier-card">Ticket tier card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#size-chart-editor">Size chart editor</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#field-source-tag">Field source tag</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#listing-controls">Listing controls</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#link-field">Link field</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#lock-sets">Lock sets</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#rich-body">Rich body</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#follow-field">Follow field</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#cond-list">Condition list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#vault-open">Vault open 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#vault-task">Vault item task 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#rules-group">Rules group 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#form-ask">Form ask 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#member-picker">Member picker 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#post-composer">Post composer 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#profile-avatar-row">Profile avatar row 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#social-links">Social links 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#notification-matrix">Notification matrix 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#work-fields">Work fields</a>
    <a class="toc__link toc__link--sub" href="design-system-components-forms.html#film-picker">Film picker</a>
    <div class="toc__subgroup"><span data-en>Selection controls</span><span data-zh>選擇控件</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#selection-card">Selection card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#radio-card">Radio card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#radio-list">Radio list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#date-input">Date input placeholder</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#nest">Nest</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#segmented">Segmented</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#amount-field">Amount field</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#picker">Picker</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#checkbox">Checkbox</a>
    <div class="toc__subgroup"><span data-en>Lists &amp; tables</span><span data-zh>清單與表格</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#data-list">Data list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#drawer">Drawer</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#pager">Pager</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#review-row">Review row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#kv-list">KV list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#table">Table</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#product-list">Product list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#project-list">Project list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#list-footer">List footer</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#insight-row">Insight row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#filter-row">Filter row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#list-toolbar">List toolbar</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#empty">Empty stub</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#progress-mark">Progress mark</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#section-nav">Section nav</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#section-outline">Section outline</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#limit-set">Limit set</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#form-steps">Form steps</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#date-range">Date range</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#code-picker">Code picker</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#stat-row">Stat row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#meter-list">Meter list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#empty-card">Empty card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#benefit-matrix">Benefit matrix</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#sortable">Sortable table header</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#row-disclosure">Row disclosure</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#stock-history">Stock history</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#calc-list">Calc list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#demand-table">Demand table</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#vault-list">Vault list 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#price-ladder">Price ladder 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#member-table">Member table 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#progress-timeline">Progress timeline 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#step-list">Step list 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#session-list">Session list 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#quick-result-list">Quick result list 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#todo-list">Todo list 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-lists.html#stock-allocation">Stock allocation 📄</a>
    <div class="toc__subgroup"><span data-en>Cards &amp; tiles</span><span data-zh>卡片與磚</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#card">Card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#card-section">Section card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#card-group">Card group</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#kpi">KPI</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#sparkline">Sparkline</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#issue-panel">Issue panel</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#work-card">Work card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#earnings-feed">Earnings feed</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#split-bar">Split bar</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#donut-mix">Donut mix</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#meta-cell">Meta cell</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#bento">Bento grid</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#product-post">New product post</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#brand-card">Brand card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#demand-focus">Demand focus</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#venue-map">Venue map</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#vault-access">Vault access 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#media-preview">Media preview 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#live-item">Live item 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#kpi-rotator">KPI rotator 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#next-step">Next step 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#funding-panel">Funding panel 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#project-card">Project card 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#rental-card">Rental card 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#rent-block">Rent block 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#points-qr">Points QR card 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#finding-card">Finding card 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#content-blocks">Content block injector</a>
    <div class="toc__subgroup"><span data-en>Navigation &amp; chrome</span><span data-zh>導覽與框架</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#header">Header</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#app-shell">App shell</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#detail-rail">Detail rail</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#page-intro">Page intro</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#tabs">Tabs</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#accordion">Accordion</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#stack">Stack</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#settings-row">Settings row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#sticky-actions">Sticky actions bar</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#section-tabs">Section tabs</a>
    <div class="toc__subgroup"><span data-en>Create-flow / wizard</span><span data-zh>建立流程</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#stepper">Progress stepper</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#wizard-frame">Wizard frame</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#readiness">Readiness card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#completeness">Completeness meter</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#stock-bar">Stock bar</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#wizard-split">Wizard split rail</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#source-import">Source import gate 📄</a>
    <div class="toc__subgroup"><span data-en>Preview</span><span data-zh>預覽</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#preview-card">Preview card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#preview-column">Preview column</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#preview-panel">Preview panel</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#fan-store">Fan store preview</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#pickup">Pickup management</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#bundle-preview-card">Bundle preview card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#fan-event-page">Fan page mirror</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#fan-phone">Fan phone (create-flow phone mirror)</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#publish-stage">Publish stage</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#ticket-preview">Ticket preview 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#pdp-preview">PDP preview (fan-side mirror) 📄</a>
    <div class="toc__subgroup"><span data-en>Overlays &amp; dialogs</span><span data-zh>浮層與對話</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#dropdown-menu">Dropdown menu</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#tooltip">Tooltip</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#payout">Modal shell / Payout picker</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#restock-modal">Restock table</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#embed-modal">Embed modal</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#leave-dialog">Leave dialog</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#sched-restore">Schedule restore</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#spec-row">Spec row</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#entry-list">Entry list</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#message-modal">Message composer</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#msg-token">Token chip</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#detail-sheet">Detail sheet</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#vault-share">Vault share drawer 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#source-upload-modal">Source upload modal 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#fee-exception-modal">Fee exception modal 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#manual-entry-modal">Manual entry modal</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#publish-preview">Publish preview</a>
    <a class="toc__link toc__link--sub" href="design-system-components-flow.html#login-lang-prompt">Login lang prompt</a>
    <div class="toc__subgroup"><span data-en>Feedback &amp; status</span><span data-zh>回饋與狀態</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#alert">Alert</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#status-axes">Status axes 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#explainer">Explainer</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#toast">Toast &amp; save status</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#source-status">Source status</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#review-status">Review status</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#state-check">State check</a>
    <a class="toc__link toc__link--sub" href="design-system-components-basic.html#staged-change">Staged change 📄</a>
    <div class="toc__subgroup"><span data-en>Data viz</span><span data-zh>資料視覺化</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#chart">Chart</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#waterfall">Earnings waterfall</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#chart-card">Chart card</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#rank-bars">Rank bars</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#chart-tip">Earnings chart tooltip</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#perf-rank">Performance rank</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#size-mix">Size mix</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#tier-arc">Tier arc 📄</a>
    <div class="toc__subgroup"><span data-en>Page sections &amp; heroes</span><span data-zh>頁面區塊與 Hero</span></div>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#media-vault">Media vault 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#vault-stage">Vault stage 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#canvas-stage">Canvas stage 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#canvas-home">Canvas home 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#hero-slideshow">Hero slideshow 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#detail-overview">Detail overview（三欄骨架） 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#ip-hero">IP hero 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#store-settings">Store settings page 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#scanner">Mobile scanner 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#fans-guide">Fans guide page 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#manage-ip">Manage IP patches 📄</a>
    <a class="toc__link toc__link--sub" href="design-system-components-cards.html#auth-shell">Auth shell 📄</a>
    <div class="toc__group"><span data-en>Pillar 5 · Pattern</span><span data-zh>Pillar 5 · Pattern</span></div>
    <a class="toc__link" href="design-system-pattern.html#patterns"><span data-en>5.1 Pattern cards</span><span data-zh>5.1 Pattern 卡</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-dashboard"><span data-en>5.1.1 Dashboard home</span><span data-zh>5.1.1 Dashboard home</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-tabbed"><span data-en>5.1.2 Tabbed section view</span><span data-zh>5.1.2 Tabbed section view</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-filter-list"><span data-en>5.1.3 Filter + list</span><span data-zh>5.1.3 Filter + list</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-lifecycle"><span data-en>5.1.4 Lifecycle states</span><span data-zh>5.1.4 Lifecycle states</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-wizard"><span data-en>5.1.5 Multi-step wizard</span><span data-zh>5.1.5 Multi-step wizard</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-form-assembly"><span data-en>5.1.6 Form assembly</span><span data-zh>5.1.6 Form assembly</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-settings"><span data-en>5.1.7 Settings page</span><span data-zh>5.1.7 Settings page</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-modal"><span data-en>5.1.8 Modal shell</span><span data-zh>5.1.8 Modal shell</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-split-preview"><span data-en>5.1.9 Split preview</span><span data-zh>5.1.9 Split preview</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-detail-rail"><span data-en>5.1.10 Detail + persistent rail</span><span data-zh>5.1.10 Detail + persistent rail</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-destructive-confirm"><span data-en>5.1.11 Destructive confirm</span><span data-zh>5.1.11 Destructive confirm</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-export-confirm"><span data-en>5.1.12 Export confirm</span><span data-zh>5.1.12 Export confirm</span></a>
    <a class="toc__link toc__link--sub" href="design-system-pattern.html#pattern-prepublish"><span data-en>5.1.13 Pre-publish preview</span><span data-zh>5.1.13 發布前預覽</span></a>
    <a class="toc__link" href="design-system-pattern.html#voice"><span data-en>5.2 Voice</span><span data-zh>5.2 語氣</span></a>
    <a class="toc__link" href="design-system-pattern.html#states"><span data-en>5.3 States</span><span data-zh>5.3 狀態</span></a>
    <a class="toc__link" href="design-system-pattern.html#dataviz"><span data-en>5.4 Data viz</span><span data-zh>5.4 資料視覺化</span></a>
    <div class="toc__group"><span data-en>Pillar 6 · Structure</span><span data-zh>Pillar 6 · 結構</span></div>
    <a class="toc__link" href="design-system-structure.html#structure"><span data-en>Grid + templates</span><span data-zh>Grid + 模板</span></a>
    <a class="toc__link toc__link--sub" href="design-system-structure.html#surface-layers"><span data-en>Surface layers</span><span data-zh>表面階層</span></a>
    <div class="toc__group"><span data-en>Appendix</span><span data-zh>附錄</span></div>
    <a class="toc__link" href="design-system-structure.html#appendix-a"><span data-en>A · Output formats</span><span data-zh>A · 輸出格式</span></a>
    <a class="toc__link" href="design-system-structure.html#appendix-b"><span data-en>B · JSON skeleton</span><span data-zh>B · JSON 骨架</span></a>
    <a class="toc__link" href="design-system-structure.html#appendix-c"><span data-en>C · Data &amp; behavior modules</span><span data-zh>C · 資料與行為模組</span></a>
    <a class="toc__link" href="design-system-structure.html#impl"><span data-en>Implementation Notes</span><span data-zh>實作說明</span></a>
    <a class="toc__link" href="design-system-structure.html#validator"><span data-en>Integrity Check</span><span data-zh>完整性檢查</span></a>
  </aside>`);
(function () {
  var here = (location.pathname.split("/").pop() || "design-system.html").split("?")[0];
  var tocs = document.querySelectorAll("aside.toc"); var toc = tocs[tocs.length - 1];
  toc.querySelectorAll("a.toc__link").forEach(function (a) {
    var h = a.getAttribute("href") || ""; var k = h.indexOf("#");
    if (k > 0 && h.slice(0, k) === here) a.setAttribute("href", h.slice(k));
  });
  /* 目錄只展開本頁（2026-11-09）：每個分組＋小分組標題後面的連結算一組；
     組裡有連到本頁的（已改成「#位置」）就展開，其餘收起只留標題，點標題可展開／收起。 */
  var units = [], cur = null;
  Array.prototype.forEach.call(toc.children, function (el) {
    if (el.classList.contains("toc__group") || el.classList.contains("toc__subgroup")) {
      cur = { head: el, links: [] }; units.push(cur);
    } else if (cur && el.matches("a.toc__link")) cur.links.push(el);
  });
  units.forEach(function (u) {
    if (!u.links.length) return;
    var here = u.links.some(function (l) { return (l.getAttribute("href") || "").charAt(0) === "#"; });
    var caret = document.createElement("span"); caret.className = "toc__caret"; caret.setAttribute("aria-hidden", "true");
    u.head.insertBefore(caret, u.head.firstChild);
    u.head.classList.add("toc__unit-head");
    u.head.setAttribute("role", "button"); u.head.setAttribute("tabindex", "0");
    function set(open) {
      u.links.forEach(function (l) { l.hidden = !open; });
      caret.textContent = open ? "▾" : "▸";
      u.head.setAttribute("aria-expanded", open ? "true" : "false");
    }
    set(here);
    function toggle() { set(u.head.getAttribute("aria-expanded") !== "true"); }
    u.head.addEventListener("click", toggle);
    u.head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
})();
