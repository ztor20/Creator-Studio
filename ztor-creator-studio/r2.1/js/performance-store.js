/* ============================================================
   performance-store.js — 作品表現（Performance）的 demo 資料與繪製器

   這一支同時餵兩個地方，所以它是那份資料唯一的來源：
     · project-detail.html › Performance 分頁（依項目家族切變體）
     · index.html › Dashboard「平台表現」兩張卡（跨所有已上線項目彙總）

   ── 這個分頁在講什麼（與「我的收益」「版稅」的分工）─────────────
   我的收益 ＝ 錢進來多少（共創、佣金、授權…）
   版稅     ＝ 發行商結算了多少錢給我（延遲一季、與募資分開算）
   表現     ＝ 有多少人看／聽、在哪些平台、在哪些地區  ← 本檔
   同一件作品的三個問題，量綱不同（USD ／ USD ／ 次數），不可互相加總，
   所以放三個分頁而不是三張卡。本檔完全不出現金額。

   ── 家族變體（使用者裁示 2026-07-28）─────────────────────────
   影視 film ： Ztor、YouTube、Netflix 等 OTT 平台，量綱＝觀看次數
   音樂 music： Spotify、QQ 音樂、SoundCloud 等發行平台，量綱＝串流次數
   其他 other： 活動／商品／文檔沒有串流發行通路，不假裝有——出空狀態

   「Top 10」這一區只在項目本身有多個單元時才出現：
     album → 曲目 ／ series → 集數 ／ song・movie・short・mv → 單一作品，不出
   一份只有一列的排行榜不是排行榜。

   數字全為示意資料（與 projects-store.js 同一個世界觀），非真實成效。
   ============================================================ */
(function () {
  'use strict';

  /* ── 期間：三個時間尺度，每個都有自己的一組資料（不是同一組乘係數）──
     m ＝ 近 30 天 ／ q ＝ 2026 Q2 ／ y ＝ 近 12 個月 */
  var PERIODS = ['m', 'q', 'y'];

  /* 地區沿用 project-detail 版稅區已有的 i18n key，不另立同義字典 */
  function geo(key, m, q, y, rest) {
    return { i18n: 'pd-roy.rg.' + key, v: { m: m, q: q, y: y }, rest: !!rest };
  }
  function pf(name, m, q, y, opts) {
    opts = opts || {};
    return { name: name, i18n: opts.i18n || null, v: { m: m, q: q, y: y }, rest: !!opts.rest };
  }

  /* ══════════════ 影視家族 ══════════════ */
  var FILM = {
    metric: 'views',
    unitKind: 'episode',
    total: { m: 128400, q: 412900, y: 1286500 },
    /* hero 底下三個註腳指標 —— 是主數字的補充，不各自開卡 */
    sub: [
      { id: 'watch-hours', i18n: 'perf.sub.watch-hours', fmt: 'hrs', v: { m: 34900, q: 112600, y: 351800 } },
      { id: 'completion',  i18n: 'perf.sub.completion',  fmt: 'pct', v: { m: 76.4, q: 74.9, y: 73.1 } },
      { id: 'viewers',     i18n: 'perf.sub.viewers',     fmt: 'num', v: { m: 61300, q: 188400, y: 574200 } }
    ],
    platforms: [
      pf('Ztor',         41600, 128900, 402100),
      pf('YouTube',      28900,  96300, 318700),
      pf('Netflix',      22400,  74800, 236200),
      pf('Disney+',      12700,  41100, 124900),
      pf('iQIYI 愛奇藝',   9800,  31600,  92400),
      pf('Prime Video',   6300,  19700,  58100),
      pf('CATCHPLAY+',    3900,  12400,  33800),
      pf('friDay 影音',    1900,   5600,  14200),
      pf('',               900,   2500,   6100, { i18n: 'perf.pf.other', rest: true })
    ],
    territories: [
      geo('tw',    44900, 145300, 452700),
      geo('hk',    26800,  84100, 262400),
      geo('my',    13700,  44600, 138900),
      geo('sg',    11200,  36300, 112500),
      geo('jp',     9600,  30800,  96700),
      geo('us',     7900,  25100,  79400),
      geo('kr',     5400,  17200,  53600),
      geo('th',     3800,  12000,  37500),
      geo('ca',     2400,   7600,  24100),
      geo('au',     1600,   5200,  16300),
      geo('other',  1100,   4700,  12400, true)
    ],
    /* 集數：影集才有。兩種排序真的不同——最多人點開的不是被看完最多的。
       a ＝ 觀看次數的「權重」，不是絕對值：實際數字在繪製時由該期間的總觀看數
       依權重分配（見 unitRows）。這樣八集加起來永遠等於上面那個 hero 數字，
       不會出現「單集總和比總數還大」這種讀者一加就會發現的矛盾。
       b ＝ 完播率，本來就是比率，不參與分配。 */
    units: [
      { i18n: 'perf.ep.1', a: 96200, b: 88.7 },
      { i18n: 'perf.ep.2', a: 78400, b: 77.1 },
      { i18n: 'perf.ep.3', a: 66900, b: 74.8 },
      { i18n: 'perf.ep.4', a: 58100, b: 79.5 },
      { i18n: 'perf.ep.5', a: 51700, b: 68.9 },
      { i18n: 'perf.ep.6', a: 47300, b: 71.3 },
      { i18n: 'perf.ep.7', a: 44800, b: 86.2 },
      { i18n: 'perf.ep.8', a: 42600, b: 91.4 }
    ],
    unitsSub: 'perf.units.sub-film',
    unitsA: { i18n: 'perf.col.views',      fmt: 'num', basis: 'total', hue: 'var(--chart-3)' },
    unitsB: { i18n: 'perf.col.completion', fmt: 'pct', basis: 'rate',  hue: 'var(--chart-2)' }
  };

  /* ══════════════ 音樂家族 ══════════════ */
  var MUSIC = {
    metric: 'streams',
    unitKind: 'track',
    total: { m: 214700, q: 663400, y: 2148900 },
    sub: [
      { id: 'listeners',  i18n: 'perf.sub.listeners',  fmt: 'num', v: { m: 84600, q: 246300, y: 731500 } },
      { id: 'saves',      i18n: 'perf.sub.saves',      fmt: 'num', v: { m: 12940, q: 38200, y: 121400 } },
      { id: 'completion', i18n: 'perf.sub.completion', fmt: 'pct', v: { m: 82.1, q: 80.7, y: 79.4 } }
    ],
    platforms: [
      pf('Spotify',       68900, 214100, 706300),
      pf('YouTube Music', 42300, 128700, 418500),
      pf('',              31600,  99200, 322700, { i18n: 'perf.pf.qq' }),
      pf('KKBOX',         24800,  76400, 241900),
      pf('Apple Music',   18200,  55900, 179400),
      pf('SoundCloud',    12900,  38600, 121600),
      pf('LINE MUSIC',     8400,  25300,  82100),
      pf('Ztor',           5600,  17800,  56300),
      pf('',               2000,   7400,  20100, { i18n: 'perf.pf.other', rest: true })
    ],
    territories: [
      geo('tw',    71300, 219800, 712600),
      geo('hk',    38600, 119400, 386900),
      geo('my',    24100,  74700, 242300),
      geo('sg',    19800,  61200, 198400),
      geo('cn',    17400,  53900, 174800),
      geo('jp',    14900,  46100, 149500),
      geo('us',    11700,  36200, 117300),
      geo('kr',     7600,  23500,  76100),
      geo('th',     5200,  16100,  52400),
      geo('ca',     2600,   8100,  26300),
      geo('other',  1500,   4400,  12300, true)
    ],
    /* 曲目沿用版稅區已建立的歌名 key（同一張專輯、同一批歌）。
       a／b 是權重不是絕對值：a 分配該期間的總串流數、b 分配該期間的收藏數，
       所以「十首歌加起來 ＝ hero 的總串流數」「收藏欄加起來 ＝ 上面的收藏數」
       這兩件事是算出來的，不是靠人工對帳。 */
    units: [
      /* b 刻意與 a 分歧：播放量最高的主打（天地男兒）收藏率反而偏低，
         被收藏最多的是排第三的抒情曲——這正是這張卡要說的話，
         如果兩欄排出來一樣，並置兩份排行就沒有意義了。 */
      { i18n: 'pd-roy.song.s2',  a: 128400, b: 4900 },
      { i18n: 'pd-roy.song.s1',  a: 117900, b: 8200 },
      { i18n: 'pd-roy.song.s4',  a:  89300, b: 9600 },
      { i18n: 'pd-roy.song.s3',  a:  74100, b: 5400 },
      { i18n: 'pd-roy.song.s7',  a:  52800, b: 2140 },
      { i18n: 'pd-roy.song.s5',  a:  48200, b: 7300 },
      { i18n: 'pd-roy.song.s6',  a:  31500, b: 2880 },
      { i18n: 'pd-roy.song.s9',  a:  22700, b: 3270 },
      { i18n: 'pd-roy.song.s8',  a:  14100, b: 1120 },
      { i18n: 'pd-roy.song.s10', a:   9800, b: 1460 }
    ],
    unitsSub: 'perf.units.sub-music',
    unitsA: { i18n: 'perf.col.streams', fmt: 'num', basis: 'total',     hue: 'var(--chart-3)' },
    unitsB: { i18n: 'perf.col.saves',   fmt: 'num', basis: 'sub:saves', hue: 'var(--chart-2)' }
  };

  var FAMILY = { film: FILM, music: MUSIC };

  /* ── Top 10 的數值怎麼來 ────────────────────────────────────────
     不手寫絕對值，而是「權重 → 分配該期間的那個池子」：
       依觀看／串流    → 池子 ＝ 該期間的總觀看／總串流數
       依收藏          → 池子 ＝ 該期間的收藏數（hero 底下那個註腳指標）
       依完播率        → 沒有池子，比率不參與分配
     這樣做的理由是可驗證性：任何人把單元欄加起來，都會剛好等於上面那個大數字。
     手寫兩組數字遲早會對不上——第一版就對不上（十首歌加起來 588,800，
     hero 只有 214,700），而那是讀的人一加就會看見的矛盾。

     skew ＝ 由列序決定的固定偏移（±6%），讓三個期間的名次會換位——時間拉長
     之後長尾作品被聽回來本來就會換位；每列乘同一個係數會讓三個期間長得一樣。
     用列序而不是亂數，是為了每次重繪都得到相同結果。
     十列的 skew 加總剛好為 0，所以分配後的總和仍然精確等於池子。 */
  function subVal(family, id, period) {
    for (var i = 0; i < family.sub.length; i++) {
      if (family.sub[i].id === id) return family.sub[i].v[period];
    }
    return 0;
  }
  function unitRows(family, period, which) {
    var cfg = which === 'a' ? family.unitsA : family.unitsB;
    var off = which === 'b' ? 2 : 0;
    var pIdx = PERIODS.indexOf(period);

    if (cfg.basis === 'rate') {
      /* 比率不隨期間放大，但也不該三個期間一模一樣——給一個 ±2.4% 的
         期間微差，名次大致穩定、不會假到看起來像寫死的。上限壓在 100%。 */
      return family.units.map(function (u, i) {
        var nudge = 1 + ((((i * 7) + pIdx) % 5) - 2) * 0.012;
        return { i18n: u.i18n, value: Math.min(100, u.b * nudge) };
      }).sort(function (x, y) { return y.value - x.value; });
    }

    var pool = cfg.basis === 'total'
      ? family.total[period]
      : subVal(family, String(cfg.basis).replace('sub:', ''), period);

    var weights = family.units.map(function (u, i) {
      var w = which === 'a' ? u.a : u.b;
      /* ±6%（初版 ±12% 太大：它會把刻意排在第一的「被收藏最多」那首推下來，
         結果兩欄的第一名又變成同一首，正好抵銷這張卡想說的話）。 */
      var skew = period === 'm' ? 1 : 1 + ((((i * 7) + off) % 5) - 2) * 0.03;
      return w * skew;
    });
    var sum = weights.reduce(function (s, w) { return s + w; }, 0) || 1;

    return family.units.map(function (u, i) {
      return { i18n: u.i18n, value: (weights[i] / sum) * pool };
    }).sort(function (x, y) { return y.value - x.value; });
  }

  /* ══════════════ Dashboard 彙總 ══════════════
     跨所有已上線項目：影視的觀看次數與音樂的串流次數在這裡合併成
     「觸及次數」一個量綱。合併是有前提的——兩者都是「一次消費」的計次，
     卡片標題與註腳都寫明白，不讓讀的人以為是兩種東西被硬加在一起。 */
  var AGGREGATE = {
    total: 343100,
    projects: 6,
    platforms: [
      pf('YouTube',      71200, 0, 0),
      pf('Spotify',      68900, 0, 0),
      pf('Ztor',         47200, 0, 0),
      pf('',             31600, 0, 0, { i18n: 'perf.pf.qq' }),
      pf('KKBOX',        24800, 0, 0),
      pf('Netflix',      22400, 0, 0),
      pf('Apple Music',  18200, 0, 0),
      pf('SoundCloud',   12900, 0, 0),
      pf('Disney+',      12700, 0, 0),
      pf('',             33200, 0, 0, { i18n: 'perf.pf.other', rest: true })
    ],
    territories: [
      geo('tw',    116200, 0, 0),
      geo('hk',     65400, 0, 0),
      geo('my',     37800, 0, 0),
      geo('sg',     31000, 0, 0),
      geo('jp',     24500, 0, 0),
      geo('us',     19600, 0, 0),
      geo('cn',     17400, 0, 0),
      geo('kr',     13000, 0, 0),
      geo('th',      9000, 0, 0),
      geo('ca',      5000, 0, 0),
      geo('other',   4200, 0, 0, true)
    ]
  };

  /* ═══════════════════ 格式化 ═══════════════════ */
  function t(key, fallback) {
    var s = window.i18nT ? window.i18nT(key) : null;
    return s == null ? (fallback || '') : s;
  }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }
  function fmtVal(v, fmt) {
    if (fmt === 'pct') return (Math.round(v * 10) / 10).toFixed(1) + '%';
    if (fmt === 'hrs') return num(v) + ' h';
    /* 金額要帶幣別，否則「9,200」和隔欄的「620,000」看起來是同一種量。
       觀眾數維持裸數字（fmt:'num'）——單位由欄位標題講（依觀看次數／依串流次數），
       不在 JS 裡寫死中文量詞。 */
    if (fmt === 'usd') return 'USD ' + num(v);
    return num(v);
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ═══════════════════ 列 ═══════════════════
     長條寬度＝該列 / 最大列（不是 / 總和）。用最大值當基準，第一名才會滿格，
     排行榜要比的是彼此的長短，不是每一列佔總量多少——佔比另有百分比欄在講。 */
  function rowHTML(o) {
    var label = o.i18n
      ? '<span class="perf-rank__name" data-i18n="' + o.i18n + '">' + esc(o.name || '') + '</span>'
      : '<span class="perf-rank__name" title="' + esc(o.name) + '">' + esc(o.name) + '</span>';
    /* 家族標籤：只有「錢」那一欄需要——它把影視與音樂混在同一排，不標的話
       看不出某一列是哪一種作品。觀眾欄已依家族分節，不需要重複標。 */
    var tag = o.tag
      ? '<span class="perf-rank__tag" data-i18n="dash.top.fam.' + o.tag + '"></span>'
      : '';
    return '<li class="perf-rank__row' + (o.rest ? ' perf-rank__row--rest' : '') + '"'
      + ' style="--w:' + o.w.toFixed(1) + '%;--hue:' + o.hue + ';--i:' + o.i + '">'
      + '<span class="perf-rank__idx">' + (o.rest ? '—' : o.i + 1) + '</span>'
      + label + tag
      + '<span class="perf-rank__track"><span class="perf-rank__fill"></span></span>'
      + (o.pct == null ? '' : '<span class="perf-rank__pct">' + o.pct.toFixed(1) + '%</span>')
      + '<span class="perf-rank__val">' + o.val + '</span>'
      + '</li>';
  }

  /* rows: [{ name?, i18n?, value, rest }] */
  function rankHTML(rows, opts) {
    opts = opts || {};
    var withPct = opts.pct !== false;
    var max = 0, sum = 0;
    rows.forEach(function (r) { if (r.value > max) max = r.value; sum += r.value; });
    if (!max) max = 1;
    var html = rows.map(function (r, i) {
      return rowHTML({
        i: i,
        name: r.name,
        i18n: r.i18n,
        rest: r.rest,
        tag: r.tag,
        w: (r.value / max) * 100,
        pct: withPct && sum ? (r.value / sum) * 100 : null,
        val: fmtVal(r.value, opts.fmt),
        hue: opts.hue || 'var(--chart-3)'
      });
    }).join('');
    return '<ol class="perf-rank' + (withPct ? '' : ' perf-rank--nopct')
      + ' perf-rank--animate">' + html + '</ol>';
  }

  function toRows(list, period) {
    return list.map(function (r) {
      return { name: r.name, i18n: r.i18n, rest: r.rest, value: r.v[period] };
    });
  }

  /* ═══════════════════ 專案詳情：Performance 分頁 ═══════════════════ */

  var PERIOD_CAP = { m: 'perf.cap.m', q: 'perf.cap.q', y: 'perf.cap.y' };

  function panelHTML(fam, family, period, hasUnits) {
    var metricKey = fam === 'music' ? 'perf.total.streams' : 'perf.total.views';

    /* — hero — */
    var subs = family.sub.map(function (s) {
      return '<div class="perf-hero__sub-item">'
        + '<span class="perf-hero__sub-label" data-i18n="' + s.i18n + '"></span>'
        + '<span class="perf-hero__sub-value">' + fmtVal(s.v[period], s.fmt) + '</span>'
        + '</div>';
    }).join('');

    var hero = '<div class="bento mt-16"><section class="card bento--span-12 perf-hero">'
      + '<div class="card__head">'
      +   '<h3 class="card__title" data-i18n="' + metricKey + '"></h3>'
      +   '<div class="segmented" role="tablist" aria-label="Period" data-perf-period>'
      +     PERIODS.map(function (p) {
              return '<button class="segmented__btn' + (p === period ? ' segmented__btn--active' : '')
                + '" type="button" role="tab" aria-selected="' + (p === period)
                + '" data-perf-p="' + p + '" data-i18n="perf.period.' + p + '"></button>';
            }).join('')
      +   '</div>'
      + '</div>'
      + '<strong class="perf-hero__value">' + num(family.total[period]) + '</strong>'
      + '<span class="perf-hero__cap" data-i18n="' + PERIOD_CAP[period] + '"></span>'
      + '<div class="perf-hero__sub">' + subs + '</div>'
      + '</section></div>';

    /* — Top 10（只有多單元的項目才有）— */
    var top = '';
    if (hasUnits) {
      var a = unitRows(family, period, 'a');
      var b = unitRows(family, period, 'b');

      top = '<div class="bento mt-16"><section class="card bento--span-12">'
        + '<div class="card__head"><h3 class="card__title" data-i18n="'
        +   (family.unitKind === 'track' ? 'perf.units.tracks' : 'perf.units.episodes') + '"></h3>'
        + '<span class="text-sub" style="font-size:var(--fs-12)" data-i18n="' + family.unitsSub + '"></span></div>'
        + '<div class="perf-twin mt-16">'
        +   '<div><p class="perf-cap" style="--hue:' + family.unitsA.hue + '">'
        +     '<span class="perf-cap__dot"></span><span data-i18n="' + family.unitsA.i18n + '"></span></p>'
        +     rankHTML(a, { pct: false, fmt: family.unitsA.fmt, hue: family.unitsA.hue }) + '</div>'
        +   '<div><p class="perf-cap" style="--hue:' + family.unitsB.hue + '">'
        +     '<span class="perf-cap__dot"></span><span data-i18n="' + family.unitsB.i18n + '"></span></p>'
        +     rankHTML(b, { pct: false, fmt: family.unitsB.fmt, hue: family.unitsB.hue }) + '</div>'
        + '</div></section></div>';
    }

    /* — 地區 ／ 平台 — */
    var ranks = '<div class="bento mt-16">'
      + '<section class="card bento--span-6">'
      +   '<div class="card__head"><h3 class="card__title" data-i18n="perf.geo.title"></h3>'
      +   '<span class="text-sub" style="font-size:var(--fs-12)" data-i18n="' + metricKey + '"></span></div>'
      +   '<div class="mt-16">' + rankHTML(toRows(family.territories, period), { hue: 'var(--chart-5)' }) + '</div>'
      + '</section>'
      + '<section class="card bento--span-6">'
      +   '<div class="card__head"><h3 class="card__title" data-i18n="'
      +     (fam === 'music' ? 'perf.pf.title-music' : 'perf.pf.title-film') + '"></h3>'
      +   '<span class="text-sub" style="font-size:var(--fs-12)" data-i18n="' + metricKey + '"></span></div>'
      +   '<div class="mt-16">' + rankHTML(toRows(family.platforms, period), { hue: 'var(--chart-6)' }) + '</div>'
      + '</section>'
      + '</div>';

    return hero + top + ranks;
  }

  /* 其他家族（活動／商品／文檔／自訂）：沒有串流發行通路，就說沒有。
     硬塞一組假的平台排行，讀的人會照著它做決定——那比空狀態糟得多。 */
  function emptyHTML(key) {
    return '<div class="bento mt-16"><section class="card bento--span-12"><div class="empty-card">'
      + '<span class="empty-card__icon"><i data-lucide="bar-chart-3" class="ztor-icon"></i></span>'
      + '<h3 class="empty-card__title" data-i18n="' + key + '.title"></h3>'
      + '<p class="empty-card__text" data-i18n="' + key + '.text"></p>'
      + '</div></section></div>';
  }

  /* ═══════════════════ Dashboard 兩張卡 ═══════════════════ */
  function dashHTML() {
    return ''
      + '<section class="card bento--span-6">'
      +   '<div class="card__head">'
      +     '<div class="card__title-group">'
      +       '<span class="card__title-icon card__title-icon--accent"><i data-lucide="radio" class="ztor-icon"></i></span>'
      +       '<h3 class="card__title" data-i18n="dash.perf.pf.title"></h3>'
      +     '</div>'
      +     '<a class="card__link" href="projects.html" data-i18n="dash.perf.link"></a>'
      +   '</div>'
      +   '<p class="text-sub" style="font-size:var(--fs-12);margin:var(--sp-4) 0 0" data-i18n="dash.perf.meta"></p>'
      +   '<div class="mt-16">' + rankHTML(AGGREGATE.platforms.map(function (r) {
              return { name: r.name, i18n: r.i18n, rest: r.rest, value: r.v.m };
            }), { hue: 'var(--chart-6)' }) + '</div>'
      + '</section>'
      + '<section class="card bento--span-6">'
      +   '<div class="card__head">'
      +     '<div class="card__title-group">'
      +       '<span class="card__title-icon card__title-icon--info"><i data-lucide="globe" class="ztor-icon"></i></span>'
      +       '<h3 class="card__title" data-i18n="dash.perf.geo.title"></h3>'
      +     '</div>'
      +   '</div>'
      +   '<p class="text-sub" style="font-size:var(--fs-12);margin:var(--sp-4) 0 0" data-i18n="dash.perf.geo.meta"></p>'
      +   '<div class="mt-16">' + rankHTML(AGGREGATE.territories.map(function (r) {
              return { name: r.name, i18n: r.i18n, rest: r.rest, value: r.v.m };
            }), { hue: 'var(--chart-5)' }) + '</div>'
      + '</section>';
  }

  /* ═══════════════════ 掛載 ═══════════════════ */

  function refresh(el) {
    if (window.ztorIcons) window.ztorIcons.applyIcons(el);
    if (window.applyI18n) window.applyI18n(el);
  }

  /* project-detail 在知道是哪個項目之後呼叫這支；重繪整個面板。 */
  function renderPanel(el, opts) {
    opts = opts || {};
    var fam = opts.family === 'music' ? 'music' : (opts.family === 'film' ? 'film' : 'other');
    var period = PERIODS.indexOf(opts.period) >= 0 ? opts.period : 'q';

    if (fam === 'other') { el.innerHTML = emptyHTML('perf.empty.kind'); refresh(el); return; }
    if (opts.live === false) { el.innerHTML = emptyHTML('perf.empty.pending'); refresh(el); return; }

    var family = FAMILY[fam];
    /* 多單元才有 Top 10：專輯有曲目、影集有集數；單曲／電影／短片／MV 沒有。 */
    var hasUnits = opts.cat === 'album' || opts.cat === 'series';
    el.innerHTML = panelHTML(fam, family, period, hasUnits);
    el.setAttribute('data-perf-family', fam);
    el.setAttribute('data-perf-cat', opts.cat || '');
    el.setAttribute('data-perf-period', period);
    refresh(el);
  }

  /* 期間切換：委派一次就好，重繪後的按鈕自動接上。 */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-perf-p]');
    if (!btn) return;
    var host = btn.closest('[data-perf="panel"]');
    if (!host) return;
    renderPanel(host, {
      family: host.getAttribute('data-perf-family'),
      cat: host.getAttribute('data-perf-cat'),
      period: btn.getAttribute('data-perf-p')
    });
  });

  /* ══════════════ Dashboard「表現最佳作品」（2026-07-27 使用者裁示）══════════════
     原本 Dashboard 只有「平台觸及」與「觀眾在哪裡」——排的是平台與地區，沒有一張卡
     在排「哪一個作品表現最好」。使用者：「你完全漏掉了表現最佳的歌曲或影片，如果那個
     創作者兩種都有的話。」

     為什麼一邊合併、一邊分開（不是我想對稱，是量綱決定的）：
       · 錢可以跨家族比較 —— USD 就是 USD，影視與音樂的版稅放同一排才看得出真正的排名。
         把錢也按家族切開，等於藏起「我最賺錢的作品是哪一個」這個答案。
       · 觀眾不能跨家族比較 —— 影視是觀看次數、音樂是串流次數，本檔開頭就寫明「量綱不同
         不可互相加總」。所以觀眾那一欄依家族分節，各自排各自的。
     只有創作者真的有那個家族才會長出那一節；兩種都沒有就整張卡不出現。

     資料來自 projects-store 的 perf 欄位（單一來源），只取 status==='live'——
     還沒上線的作品沒有觀看數可談，這也是 project-detail 表現分頁的同一條件。 */
  function liveWorks() {
    var store = window.ztorProjects;
    if (!store || !store.list) return [];
    return store.list().filter(function (p) {
      var famName = store.family ? store.family(p.cat) : null;
      return p.status === 'live' && p.perf && (famName === 'film' || famName === 'music');
    }).map(function (p) {
      return {
        name: p.name,
        fam: store.family(p.cat),
        usd: p.perf.usd,
        audience: p.perf.audience,
        kind: p.perf.kind
      };
    });
  }

  function byDesc(key) {
    return function (a, b) { return b[key] - a[key]; };
  }

  function topWorksHTML() {
    var works = liveWorks();
    if (!works.length) return '';

    var fams = ['film', 'music'].filter(function (f) {
      return works.some(function (w) { return w.fam === f; });
    });

    /* 左欄：錢，跨家族合併。列尾掛家族標籤，才知道那一列是影視還是音樂。 */
    var money = works.slice().sort(byDesc('usd')).slice(0, 10).map(function (w) {
      return { name: w.name, value: w.usd, tag: w.fam };
    });

    /* 右欄：觀眾，依家族分節。兩個家族都有時各取 5，只有一個時取 10——
       兩節各 10 列會讓這張卡比整個 Dashboard 還高。 */
    var perFam = fams.length > 1 ? 5 : 10;
    var audienceSections = fams.map(function (f) {
      var rows = works.filter(function (w) { return w.fam === f; })
        .sort(byDesc('audience')).slice(0, perFam)
        .map(function (w) { return { name: w.name, value: w.audience }; });
      return ''
        + '<p class="perf-cap" style="--hue:var(--chart-2)">'
        +   '<span class="perf-cap__dot"></span>'
        +   '<span data-i18n="dash.top.' + (f === 'film' ? 'views' : 'streams') + '"></span>'
        + '</p>'
        + rankHTML(rows, { pct: false, fmt: 'num', hue: 'var(--chart-2)' });
    }).join('<div class="mt-16"></div>');

    return ''
      + '<section class="card bento--span-12">'
      +   '<div class="card__head">'
      +     '<div class="card__title-group">'
      +       '<span class="card__title-icon card__title-icon--accent"><i data-lucide="trending-up" class="ztor-icon"></i></span>'
      +       '<h3 class="card__title" data-i18n="dash.top.title"></h3>'
      +     '</div>'
      +     '<a class="card__link" href="projects.html" data-i18n="dash.perf.link"></a>'
      +   '</div>'
      +   '<p class="text-sub" style="font-size:var(--fs-12);margin:var(--sp-4) 0 0" data-i18n="dash.top.meta"></p>'
      +   '<div class="perf-units mt-16">'
      +     '<div>'
      +       '<p class="perf-cap" style="--hue:var(--chart-1)">'
      +         '<span class="perf-cap__dot"></span><span data-i18n="dash.top.money"></span></p>'
      +       rankHTML(money, { pct: false, fmt: 'usd', hue: 'var(--chart-1)' })
      +     '</div>'
      +     '<div>' + audienceSections + '</div>'
      +   '</div>'
      + '</section>';
  }

  function mount() {
    var dash = document.querySelector('[data-perf="dash"]');
    if (dash) { dash.innerHTML = topWorksHTML() + dashHTML(); refresh(dash); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.ztorPerformance = {
    renderPanel: renderPanel,
    data: { film: FILM, music: MUSIC, aggregate: AGGREGATE }
  };
})();
