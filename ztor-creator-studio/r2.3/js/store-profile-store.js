// js/store-profile-store.js — 店面（創作者頁最上面那一段）的單一資料源（2026-09-11）
//
// 為什麼有這支：商店設定的「店面」分頁在編輯頭像／名字／身分／簡介／社群連結，右欄與電子商店的
// 「商店預覽」（partials/fan-store.js）在畫同一組東西。兩邊各寫各的就會分岔——左邊填的字右邊看不到
// （2026-09-11 使用者：「將假資料對應上預覽畫面」）。所以資料只放這裡，兩邊都來讀，改了就發事件。
//
// 原型無後端，狀態存 localStorage（依人格分開存：Gary Lin 與周湯豪各一份）。
// 任何變動都發 'storeprofile:changed'（window 上），消費頁重畫即可。
//
// 一份店面：
//   { avatar: '<圖片路徑或 data URL>',
//     name?, nameKey?, role?, roleKey?, bio?, bioKey?,   ← 示範資料走 i18n key（切語言跟著換）；使用者打的字用字面值
//     slug: 'creator-slug',
//     socials: [{ platform: 'instagram', url: 'https://…' }, …] }   ← 順序＝粉絲頁圓鈕順序；ztor 那顆固定、不在這裡
(function () {
  'use strict';
  var EVT = 'storeprofile:changed';
  function persona() {
    try { if (typeof window.ztorPersonaId === 'function') return window.ztorPersonaId(); } catch (e) {}
    try { return localStorage.getItem('ztor.persona') === 'nick' ? 'nick' : 'default'; } catch (e) { return 'default'; }
  }
  function key() { return 'ztor.storeProfile.' + persona(); }

  /* 可加的平台（順序＝粉絲端「新增社群連結」清單）。icon 走 js/icons.js；小紅書沒有線條 icon，用文字標記。 */
  var PLATFORMS = [
    { id: 'instagram',   label: 'Instagram',  icon: 'brand-instagram' },
    { id: 'x',           label: 'X',          icon: 'brand-x' },
    { id: 'threads',     label: 'Threads',    icon: 'brand-threads' },
    { id: 'xiaohongshu', labelKey: 'social.xiaohongshu', label: '小紅書', mark: '小紅書' },
    { id: 'spotify',     label: 'Spotify',    icon: 'brand-spotify' },
    { id: 'twitch',      label: 'Twitch',     icon: 'brand-twitch' },
    { id: 'tiktok',      label: 'TikTok',     icon: 'brand-tiktok' },
    { id: 'youtube',     label: 'YouTube',    icon: 'brand-youtube' }
  ];

  /* 示範資料＝預覽現在畫的那一組：頭像／名字／身分／簡介沿用 fan-store 的人格檔案，社群四條給示範網址。 */
  var SEED = {
    default: {
      avatar: 'images/ip/gary-portrait.jpg',
      nameKey: 'fan.profile.default.name', roleKey: 'fan.profile.default.role', bioKey: 'fan.profile.default.bio',
      slug: 'garylin',
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/garylin.music' },
        { platform: 'threads',   url: 'https://threads.net/@garylin.music' },
        { platform: 'x',         url: 'https://x.com/garylin_music' },
        { platform: 'tiktok',    url: 'https://tiktok.com/@garylin.music' }
      ]
    },
    nick: {
      avatar: 'images/ip/nick-portrait.jpg',
      nameKey: 'fan.profile.nick.name', roleKey: 'fan.profile.nick.role', bioKey: 'fan.profile.nick.bio',
      slug: 'nickchou',
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/nickchou' },
        { platform: 'threads',   url: 'https://threads.net/@nickchou' },
        { platform: 'x',         url: 'https://x.com/nickchou' },
        { platform: 'tiktok',    url: 'https://tiktok.com/@nickchou' }
      ]
    }
  };
  function seed() { var s = SEED[persona()] || SEED.default; return JSON.parse(JSON.stringify(s)); }

  function read() {
    try {
      var raw = localStorage.getItem(key());
      if (raw === null) return seed();
      var o = JSON.parse(raw);
      return (o && typeof o === 'object') ? o : seed();
    } catch (e) { return seed(); }
  }
  function write(p) {
    try { localStorage.setItem(key(), JSON.stringify(p)); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent(EVT, { detail: { profile: p } })); } catch (e) {}
    return p;
  }
  function t(k) { return (window.i18nT && k && window.i18nT(k)) || ''; }

  window.ZtorStoreProfile = {
    EVENT: EVT,
    PLATFORMS: PLATFORMS,
    platform: function (id) { return PLATFORMS.filter(function (p) { return p.id === id; })[0] || null; },
    platformLabel: function (id) { var p = this.platform(id); return p ? (t(p.labelKey) || p.label) : id; },
    get: read,
    /* 顯示用文字：示範資料走 i18n，使用者打的字用字面值 */
    text: function (field, p) {
      p = p || read();
      if (p[field] != null && p[field] !== '') return p[field];
      return t(p[field + 'Key']) || '';
    },
    /* 局部更新：傳 { name: '…' } 這種；改了文字欄位就丟掉對應的 i18n key（之後切語言不會把它蓋回去） */
    set: function (patch) {
      var p = read();
      Object.keys(patch || {}).forEach(function (k) {
        p[k] = patch[k];
        if (k === 'name' || k === 'role' || k === 'bio') delete p[k + 'Key'];
      });
      return write(p);
    },
    replace: function (p) { return write(JSON.parse(JSON.stringify(p))); },
    addSocial: function (platform) {
      var p = read();
      if (p.socials.some(function (s) { return s.platform === platform; })) return p;
      p.socials.push({ platform: platform, url: '' });
      return write(p);
    },
    setSocialUrl: function (platform, url) {
      var p = read();
      p.socials.forEach(function (s) { if (s.platform === platform) s.url = url; });
      return write(p);
    },
    removeSocial: function (platform) {
      var p = read();
      p.socials = p.socials.filter(function (s) { return s.platform !== platform; });
      return write(p);
    },
    reset: function () { try { localStorage.removeItem(key()); } catch (e) {} return write(read()); }
  };
}());
