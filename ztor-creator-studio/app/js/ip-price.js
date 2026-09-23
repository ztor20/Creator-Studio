// js/ip-price.js — IP 授權定價的單一資料形狀與唯一格式化器。
//
// ── 2026-07-27 使用者裁示：定價模型改成「一次性費用＋分潤%」 ──────────
// 舊模型是「按期計價」：標準／獨家價各自綁一個租期，另有「最短租期」欄位，
// 承租端還有 3 個月／6 個月／12 個月三顆價格 chip。新模型把「價格」與「期間」拆開：
//   · 價格 ＝ 一次性 flat fee（付一次就能用）＋ 在其上的分潤 %
//   · 期間 ＝ 仍然存在（授權仍會到期、仍可續約），但不再是計價單位
// 因此「最短租期」欄位與逐期價格 chip 退場；到期／續約／到期提醒一律不動。
//
// ── 「價格請洽詢」（price on request）─────────────────────────────
// 一次性費用與分潤 % **各自** 可以不公開數字、改成「請洽詢」（使用者指定：兩者都要）。
// 所以 on-request 是欄位層級的狀態，不是整頁一個開關；一筆 IP 可以是
// 「$5,000 ＋ 分潤請洽詢」，也可以兩個都洽詢。
//
// 為什麼要有這支共用檔：價格字串同時出現在「我的 IP」清單、管理頁 KPI、IP 市場卡、
// IP 詳情頁。之前 KPI 與清單各寫各的就對不起來（26 vs 24 的那次）。這裡定義一次形狀、
// 一支格式化器，四個地方都吃同一份輸出，結構上不可能漂移。
(function () {
  'use strict';

  /* 價格物件的形狀（三個欄位各自獨立）：
       fee:       { mode:'amount'|'on-request', amount:Number }
       exclusive: { mode:'amount'|'on-request'|'none', amount:Number }   none＝不提供獨家
       royalty:   { mode:'percent'|'on-request', percent:Number }
     沒有 minTerm——期間不再是計價單位。 */

  function t(key, fallback) {
    return (window.i18nT && window.i18nT(key)) || fallback;
  }

  function money(n) {
    return '$' + Number(n || 0).toLocaleString('en-US');
  }

  /* 一次性費用 */
  function fee(price) {
    var f = price && price.fee;
    if (!f) return '—';
    if (f.mode === 'on-request') return t('ip.price.on-request', 'Price on request');
    if (f.amount == null) return null;          /* 尚未定價 ≠ 免費 */
    return money(f.amount);
  }

  /* 獨家授權費用；不提供時回 null，呼叫端自行決定要不要整列不顯示 */
  function exclusive(price) {
    var e = price && price.exclusive;
    if (!e || e.mode === 'none') return null;
    if (e.mode === 'on-request') return t('ip.price.on-request', 'Price on request');
    return money(e.amount);
  }

  /* 分潤 % */
  function royalty(price) {
    var r = price && price.royalty;
    if (!r) return '—';
    if (r.mode === 'on-request') return t('ip.royalty.on-request', 'Royalty on request');
    if (r.percent == null) return null;         /* 尚未定價 ≠ 0% */
    return Number(r.percent) + '%';
  }

  /* 清單／卡片用的一行摘要：「$6,800 ＋ 12% 分潤」。
     兩者都洽詢時收斂成一句「價格請洽詢」，不要印出兩次「請洽詢」。 */
  function summary(price) {
    var f = price && price.fee, r = price && price.royalty;
    var feeOnReq = f && f.mode === 'on-request';
    var royOnReq = r && r.mode === 'on-request';
    /* 兩個欄位都還沒填＝這筆 IP 尚未定價（例如驗證中／站外剛登錄），印破折號，
       不要印成「$0 ＋ 0% 分潤」——那會被讀成免費授權。 */
    if (fee(price) == null && royalty(price) == null) return t('ip.price.not-set', 'Not priced yet');
    if (feeOnReq && royOnReq) return t('ip.price.on-request', 'Price on request');
    if (royOnReq) return t('ip.price.fee-plus-royalty-req', '{fee} + royalty on request')
                      .replace('{fee}', fee(price));
    /* 費用不公開但分潤是公開數字：主詞要講「費用」，不能沿用整體的「價格請洽詢」，
       否則會印出「價格請洽詢 ＋ 12% 分潤」這種自相矛盾的句子。 */
    if (feeOnReq) return t('ip.price.fee-req-plus-royalty', 'Fee on request + {royalty} royalty')
                      .replace('{royalty}', royalty(price));
    return t('ip.price.fee-plus-royalty', '{fee} + {royalty} royalty')
             .replace('{fee}', fee(price))
             .replace('{royalty}', royalty(price));
  }

  /* 這筆 IP 需不需要走「洽詢」而不是直接承租——任一欄位未公開就算。 */
  function needsEnquiry(price) {
    return !!price && ((price.fee && price.fee.mode === 'on-request') ||
                       (price.royalty && price.royalty.mode === 'on-request') ||
                       (price.exclusive && price.exclusive.mode === 'on-request'));
  }

  window.ztorIpPrice = {
    fee: fee,
    exclusive: exclusive,
    royalty: royalty,
    summary: summary,
    needsEnquiry: needsEnquiry,
    money: money
  };
}());
