/* events-store.js — 已建立活動的 mock 紀錄（編輯活動流程 edit-event.html 的預填來源）
   為什麼需要這支（2026-07-27）：
     編輯態的每個欄位都必須帶「使用者當初建立時填的值」。在此之前，活動事實只存在於
     events.html 的靜態列與 event-detail.html 的靜態卡；編輯頁若再抄一份，同一場活動
     的名稱／場地／票數就會有三份會各自漂移的副本。故比照 products-store／projects-store
     ／films-store 的既有作法，把活動紀錄收斂成一份可查詢的 mock。

   目前消費者：edit-event.html（?id=）。
   尚未接線：events.html 的清單列與 event-detail.html 仍是靜態 HTML——值刻意與本檔一致，
   但尚未改由本檔渲染（屬後續重構，見 UI-CHANGES 2026-07-27 該筆的「已知債」）。

   sold／status 是編輯態的行為輸入、不只是顯示值：
     · sold > 0  → 場次已售出，容量不得低於 sold、已售票種不可刪。
     · status='on-sale' → 已公開販售，改日期／場地屬「會通知到購票者」的高影響欄位。
   資料為原型 mock，非真實票務數字（見 ASSUMPTIONS.md）。 */
(function () {
  'use strict';

  var EVENTS = [
    {
      id: 'realive-chongqing',
      type: 'concert',                       // 對應 create-event 的 selection-card data-choice
      typeLabelKey: 'ce.type.concert',
      name: 'REALIVE World Tour (China) — Chongqing',
      desc: 'The China leg opener. Full band, new staging, and the first live airing of three unreleased tracks.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Feisheng Livehouse',
      city: 'Chongqing, China',
      address: 'No. 46 Jianxin North Rd, Jiangbei District',
      date: '2026-10-25',
      start: '20:00',
      end: '22:30',
      doors: '19:00',
      capacity: 120,
      tiers: [
        { id: 'tier-ga',  name: 'General admission', price: 30, qty: 100, sold: 72 },
        { id: 'tier-vip', name: 'VIP · soundcheck',  price: 60, qty: 20,  sold: 12 }
      ],
      sold: 84,
      revenue: 2520,
      status: 'on-sale',
      images: { thumb: true, poster: true, banner: true, gallery: false },
      video: false
    },
    {
      id: 'taiwan-fest-kenting',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      name: 'Taiwan Fest Kenting — Guest set',
      desc: 'Guest appearance on the main stage, 40-minute set.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Kenting Dawan',
      city: 'Pingtung, Taiwan',
      address: '',
      date: '2026-10-04',
      start: '17:00',
      end: '',
      doors: '',
      capacity: 0,                           // 0 = unlimited（節慶場不由本方售票）
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { thumb: true, poster: false, banner: false, gallery: false },
      video: false
    },
    {
      id: 'lrh-taichung-watchback',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      name: 'LOVE·RAGE·HOPE Taichung — Watch-back party',
      desc: 'Watch the Taichung night back together, with the band in chat.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-08-08',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 300,
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 300, sold: 38 }],
      sold: 38,
      revenue: 190,
      status: 'on-sale',
      images: { thumb: true, poster: false, banner: true, gallery: false },
      video: false
    },
    {
      id: 'pingtung-bluefin',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      name: 'Pingtung Bluefin Festival — Ocean concert',
      desc: 'Ocean-side stage as part of the Bluefin Tuna Cultural Tourism Festival.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Pingtung',
      city: 'Pingtung, Taiwan',
      address: '',
      date: '2026-11-02',
      start: '18:30',
      end: '',
      doors: '',
      capacity: 0,
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { thumb: true, poster: false, banner: false, gallery: false },
      video: false
    },
    {
      id: 'taipei-nye',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      name: "Taipei New Year's Eve countdown",
      desc: "Countdown stage set for Taipei's New Year's Eve city party.",
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: "Taipei New Year's Eve",
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-12-31',
      start: '22:00',
      end: '',
      doors: '',
      capacity: 0,
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { thumb: true, poster: false, banner: false, gallery: false },
      video: false
    },
    {
      id: 'realive-r2-watchparty',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      name: 'REALIVE (R2) Concert Film — Watch party',
      desc: 'Stream the concert film together, with a live chat room.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2027-02-01',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 200,
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 200, sold: 142 }],
      sold: 142,
      revenue: 710,
      status: 'on-sale',
      images: { thumb: true, poster: true, banner: true, gallery: false },
      video: false
    },
    {
      id: 'lrh-taichung',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      name: 'LOVE·RAGE·HOPE Live House Tour — Taichung',
      desc: 'Taichung stop of the LOVE·RAGE·HOPE live house tour.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Legacy Taichung',
      city: 'Taichung, Taiwan',
      address: '',
      date: '2026-04-11',
      start: '20:00',
      end: '22:30',
      doors: '19:00',
      capacity: 600,
      tiers: [{ id: 'tier-ga', name: 'General admission', price: 30, qty: 600, sold: 600 }],
      sold: 600,
      revenue: 18000,
      status: 'ended',
      images: { thumb: true, poster: true, banner: true, gallery: true },
      video: false
    },
    {
      id: 'realive-r2-arena',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      name: 'REALIVE (R2) Special Ed. — Taipei Arena',
      desc: 'Hometown finale at Taipei Arena, presented with motorola.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Arena',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2025-05-23',
      start: '20:00',
      end: '22:45',
      doors: '18:30',
      capacity: 10000,
      tiers: [{ id: 'tier-ga', name: 'General admission', price: 32, qty: 10000, sold: 10000 }],
      sold: 10000,
      revenue: 320000,
      status: 'ended',
      images: { thumb: true, poster: true, banner: true, gallery: true },
      video: false
    },
    {
      id: 'next-leg-draft',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      name: 'REALIVE World Tour — Next leg (planning)',
      desc: '',
      lineup: [],
      venue: '',
      city: '',
      address: '',
      date: '',
      start: '',
      end: '',
      doors: '',
      capacity: 0,
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'draft',
      images: { thumb: false, poster: false, banner: false, gallery: false },
      video: false
    }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  window.ztorEvents = {
    list: function () { return clone(EVENTS); },
    get: function (id) {
      for (var i = 0; i < EVENTS.length; i++) {
        if (EVENTS[i].id === id) return clone(EVENTS[i]);
      }
      return clone(EVENTS[0]);               // 未知 id → 首筆，編輯頁永遠有東西可顯示
    },
    /* 票種已售出的張數（容量下限與「可否刪除票種」都靠它） */
    soldOf: function (ev) {
      if (!ev || !ev.tiers) return 0;
      return ev.tiers.reduce(function (n, t) { return n + (t.sold || 0); }, 0);
    }
  };
}());
