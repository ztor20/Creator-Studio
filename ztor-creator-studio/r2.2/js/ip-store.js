// js/ip-store.js — 「管理我的 IP」（manage-ip.html）的示範資料源。
//
// 目的：my-ip.html 的列點進來後，本 store 供給「該筆 IP 該有的組合」，讓管理頁 realize
// 對應版面。比照 js/products-store.js 之於 product-detail.html 的關係（UIA-055）。
//
// ── 為什麼 id 是 row1..row8，而不是可讀 slug ─────────────────────
// my-ip.html 的列內容（名稱／權利／租出數／收益／價格）本來就住在 i18n key
// `my-ip.row<N>.*`，而且會被 PERSONA_DICT 依人格覆蓋（default＝Coastline 世界觀、
// nick＝周湯豪）。人格一換，同一列的「名字」就換了——所以名字做不了穩定的 id。
// row 編號是跨人格唯一穩定的接點，故直接拿它當 id：`manage-ip.html?id=row1`。
// 連帶好處是**顯示內容只有一份來源**：管理頁的名稱／權利／租出數／收益／價格一律
// 掛回同一組 i18n key，本檔只補 i18n 沒有的「結構欄位」，兩邊不可能對不上。
//
// 每筆欄位（結構欄位，i18n 沒有的部分）：
//   i18nKey     對應的 i18n 前綴（'my-ip.row1'）；名稱鍵在 ztor 列是 .name、外部登錄列是 .title
//   source      ztor | external —— 對應清單的「Made on Ztor / Registered externally」分組
//   ipType      register-ip §IP type 的六選一（決定管理頁的類型顯示）
//   verify      verified | verifying | awaiting —— waterfall 驗證狀態，驅動頁首橫幅
//   listed      是否在 IP Market 上架（＝清單 Mktplace 開關的同一件事）
//   accepting   上架中但暫停接單（listed 為真才有意義）
//   bidding     flat | auction —— 下一個檔期的計價模式
//   alerts      到期提醒開關（14 / 7 / 1 天）
//   territory / usage —— register-ip 的授權範圍欄位
//   price       定價物件（一次性費用＋分潤%，各自可設為「請洽詢」）。形狀與唯一格式化器
//               都在 js/ip-price.js；本檔只存值，任何顯示都經過那支格式化器。
//               2026-07-27 取代舊的 royalty/standard/exclusive/minTerm 四個字串欄位。
//   proof       ownership 證明檔名；null＝未上傳
//   deals       進行中的租賃列（承租方／檔期／金額／狀態）
//
// ── 資料真實性界線（重要）────────────────────────────────────────
// 本檔全部是前端 mock，沒有後端。`deals` 尤其要注意：上游規格只定義了「租出數」這個
// 數字，**沒有定義逐筆租賃的欄位**（見 ASSUMPTIONS UIA-090）。這裡的逐筆列是為了讓
// 「租賃紀錄」分頁不是一片空白而編的代表性樣本，筆數與清單的租出數對齊，但承租方名稱、
// 檔期與狀態語言都待上游確認，不得當成產品規則。
(function () {
  'use strict';

  /* 授權範圍與地區的選項字串沿用 register-ip.html 的既有文案，避免兩頁講不同的話。 */
  var IP_TYPES = ['Original Story / Screenplay', 'Character / Likeness', 'Music & Score',
                  'Footage / Clip', 'Brand / Trademark', 'Other'];

  /* 八筆＝my-ip.html 目前的八列，順序同清單 DOM（ztor 五列在前、外部登錄三列在後）。 */
  var IPS = {
    row1: {
      i18nKey: 'my-ip.row1', nameKey: 'name', source: 'ztor', ipType: 'Music & Score',
      verify: 'verified', listed: true, accepting: true, bidding: 'auction', alerts: true,
      territory: 'Worldwide', usage: ['Sync in film & TV', 'Live performance', 'Merchandise print'],
      price: { fee:{mode:'amount',amount:6800},  exclusive:{mode:'amount',amount:34000}, royalty:{mode:'percent',percent:12} },
      proof: 'master-rights-certificate.pdf',
      deals: [
        { who: 'Warner Music TW', term: 'Jan 2026 – Jul 2026', amount: '$6,800', status: 'active' },
        { who: 'Netflix TW', term: 'Feb 2026 – Aug 2026', amount: '$6,800', status: 'active' },
        { who: 'Golden Horse Fest', term: 'Mar 2026 – Sep 2026', amount: '$6,800', status: 'active' },
        { who: 'KKBOX Live', term: 'Apr 2026 – Oct 2026', amount: '$6,800', status: 'active' },
        { who: 'friDay Video', term: 'May 2026 – Nov 2026', amount: '$6,800', status: 'active' },
        { who: 'Line TV', term: 'Jun 2026 – Dec 2026', amount: '$6,800', status: 'active' },
        { who: 'myVideo', term: 'Jul 2026 – Jan 2027', amount: '$6,800', status: 'active' },
        { who: 'CATCHPLAY+', term: 'Aug 2026 – Feb 2027', amount: '$6,800', status: 'active' },
        { who: 'Believe Digital', term: 'Sep 2026 – Mar 2027', amount: '$6,800', status: 'active' },
        { who: 'JetStar Ads', term: 'Oct 2026 – Apr 2027', amount: '$6,800', status: 'active' },
        { who: 'Taipei Dome', term: 'Nov 2026 – May 2027', amount: '$6,800', status: 'active' },
        { who: 'HTC Viveland', term: 'Dec 2026 – Jun 2027', amount: '$6,800', status: 'ending' }
      ]
    },
    row2: {
      i18nKey: 'my-ip.row2', nameKey: 'name', source: 'ztor', ipType: 'Brand / Trademark',
      verify: 'verified', listed: true, accepting: true, bidding: 'flat', alerts: true,
      territory: 'Taiwan · Hong Kong · Macau', usage: ['Merchandise print', 'Digital campaign'],
      price: { fee:{mode:'on-request'},          exclusive:{mode:'on-request'},          royalty:{mode:'percent',percent:8} },
      proof: 'tour-identity-deed.pdf',
      deals: [
        { who: 'StreetVoice', term: 'Jan 2026 – Jul 2026', amount: '$18,000', status: 'active' },
        { who: 'KKBOX Live', term: 'Feb 2026 – Aug 2026', amount: '$18,000', status: 'active' },
        { who: 'Legacy Taipei', term: 'Mar 2026 – Sep 2026', amount: '$18,000', status: 'active' },
        { who: 'Zepp New Taipei', term: 'Apr 2026 – Oct 2026', amount: '$18,000', status: 'active' },
        { who: 'Pinkoi Retail', term: 'May 2026 – Nov 2026', amount: '$18,000', status: 'ending' }
      ]
    },
    row3: {
      i18nKey: 'my-ip.row3', nameKey: 'name', source: 'ztor', ipType: 'Footage / Clip',
      verify: 'verifying', listed: false, accepting: false, bidding: 'flat', alerts: false,
      territory: 'Worldwide', usage: [],
      price: { fee:{mode:'amount',amount:null},  exclusive:{mode:'none'},                royalty:{mode:'percent',percent:null} },
      proof: null, deals: []
    },
    row5: {
      i18nKey: 'my-ip.row5', nameKey: 'name', source: 'ztor', ipType: 'Footage / Clip',
      verify: 'verified', listed: true, accepting: true, bidding: 'flat', alerts: true,
      territory: 'Worldwide', usage: ['Sync in film & TV', 'Digital campaign'],
      price: { fee:{mode:'amount',amount:600},   exclusive:{mode:'amount',amount:3200},  royalty:{mode:'percent',percent:10} },
      proof: 'live-visuals-release.pdf',
      deals: [
        { who: 'Coastline Tour Co.', term: 'Jan 2026 – Jul 2026', amount: '$600', status: 'active' },
        { who: 'Indie Fest TW', term: 'Feb 2026 – Aug 2026', amount: '$600', status: 'active' },
        { who: 'Neon Tide Studio', term: 'Mar 2026 – Sep 2026', amount: '$600', status: 'active' },
        { who: 'Riverside Sessions', term: 'Apr 2026 – Oct 2026', amount: '$600', status: 'ending' }
      ]
    },
    row6: {
      i18nKey: 'my-ip.row6', nameKey: 'name', source: 'ztor', ipType: 'Original Story / Screenplay',
      verify: 'verified', listed: true, accepting: false, bidding: 'flat', alerts: true,
      territory: 'Worldwide', usage: ['Adaptation', 'Merchandise print'],
      price: { fee:{mode:'amount',amount:1200},  exclusive:{mode:'amount',amount:9600},  royalty:{mode:'on-request'} },
      proof: 'art-bible-deposit.pdf',
      deals: [
        { who: 'Harbour Studio', term: 'Jan 2026 – Jul 2026', amount: '$1,200', status: 'active' },
        { who: 'Blue Sail Press', term: 'Feb 2026 – Aug 2026', amount: '$1,200', status: 'ending' }
      ]
    },
    row4: {
      i18nKey: 'my-ip.row4', nameKey: 'title', source: 'external', ipType: 'Footage / Clip',
      verify: 'awaiting', listed: false, accepting: false, bidding: 'flat', alerts: false,
      territory: '—', usage: [],
      price: { fee:{mode:'amount',amount:null},  exclusive:{mode:'none'},                royalty:{mode:'percent',percent:null} },
      proof: null, deals: []
    },
    row7: {
      i18nKey: 'my-ip.row7', nameKey: 'name', source: 'external', ipType: 'Music & Score',
      verify: 'verified', listed: true, accepting: true, bidding: 'flat', alerts: true,
      territory: 'Worldwide', usage: ['Sync in film & TV'],
      price: { fee:{mode:'amount',amount:640},   exclusive:{mode:'amount',amount:4800},  royalty:{mode:'percent',percent:9} },
      proof: 'northline-masters-chain.pdf',
      deals: [
        { who: 'Public Radio TW', term: 'Jan 2026 – Jul 2026', amount: '$640', status: 'active' }
      ]
    },
    row8: {
      i18nKey: 'my-ip.row8', nameKey: 'name', source: 'external', ipType: 'Other',
      verify: 'awaiting', listed: false, accepting: false, bidding: 'flat', alerts: false,
      territory: '—', usage: [],
      price: { fee:{mode:'amount',amount:null},  exclusive:{mode:'none'},                royalty:{mode:'percent',percent:null} },
      proof: null, deals: []
    }
  };

  function get(id) {
    var row = IPS[String(id || '').trim()];
    if (!row) return null;
    return JSON.parse(JSON.stringify(row));
  }

  function ids() { return Object.keys(IPS); }

  window.ztorGetIp = get;
  window.ztorIpStore = { get: get, ids: ids, types: IP_TYPES };
}());
