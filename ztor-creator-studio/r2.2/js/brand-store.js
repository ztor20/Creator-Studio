/* ============================================================
   Brand campaigns — shared data layer (prototype).

   使用者裁示 2026-07-28. The model, in one paragraph:

   Ztor signs ONE deal with a brand. Any creator may then opt in and
   promote that brand for a window they choose — no contract with the
   brand, no approval step, no exclusivity. It is affiliate marketing,
   not sponsorship. The brand gets customers and reach with no up-front
   cost; the creator gets a cut and, often more valuable, new fans.

   ATTRIBUTION HAPPENS AT SCAN TIME, AND THE FAN CHOOSES IT.
   (使用者裁示 2026-07-28, correcting an earlier assumption.)

   The code is NOT tied to a creator. A Starbucks code is just a
   Starbucks code — the brand prints one pool and hands them out. In the
   Ztor app the scan is attributed to a creator the fan follows: the app
   PRE-SELECTS one (their most-engaged creator, or a pinned favourite)
   and offers a change control. One tap in the common case, still correct
   when the fan means someone else.

   That default/override split is itself a metric worth keeping. A scan
   the fan actively switched TO you means something quite different from
   one that merely landed on you because you were top of their list, and
   a creator who cannot tell them apart will misread a campaign as
   working. `chosen` vs `defaulted` below keeps them separable.

   Two consequences this file exists to encode:

   1. **The creator does not own a batch.** "Codes minted" is therefore
      meaningless as a creator-side metric — the pool is the brand's and
      is shared by every creator running that brand. A report built on
      "scanned ÷ minted" would be dividing by a number that is not the
      creator's, which is why this file does not model minting per
      campaign at all.

   2. **Creators compete for the fan's choice, not for distribution.**
      Fifty creators can run Starbucks simultaneously; they are not
      splitting a stack of cards, they are competing to be the name the
      fan taps. So the honest headline metric is SHARE OF VOICE — of all
      scans of this brand during my window, how many chose me — not a
      redemption rate. `brandScans` below is that denominator.

   Because the fan picks from creators they already follow, the growth
   loop runs the other way round: a creator promotes the collab to WIN
   followers first, and those followers attribute later. `newFans` is
   accounts that started following during the window and went on to
   attribute a scan.

   WHAT A "COUPON" IS HERE — not a discount. The fan has already paid.
   The code is a proof-of-purchase token: scanning it credits the fan
   loyalty points and releases the creator's revenue share. Calling it a
   coupon in the UI would make every creator expect money off, so the
   interface says "reward code".

   OWNERSHIP OF FIELDS (the thing this file exists to keep straight):
     · Ztor ↔ brand, READ-ONLY to the creator — the share rate, the
       issuance rule, the contract window, the brand's identity.
     · Creator-owned — which brand, campaign name, how many codes to
       mint, their own validity window, live/paused.

   Everything below is prototype data. Real records come from the backend.
   ============================================================ */
(function () {
  "use strict";

  /* ── Brand partners ────────────────────────────────────────────
     `share` is the Ztor↔brand commercial term the creator cannot edit:
       { type: "percent", value: 10 }  → 10% of the qualifying purchase
       { type: "flat", value: 1, per: "coffee" } → $1 per qualifying item
     `issue` is the brand's own issuance rule (also read-only): one code
     per this much spend.
     `method` — "batch" (pre-printed cards handed to the brand) or
     "receipt" (printed at the till, needs POS integration). A percentage
     share only makes sense on "receipt", because a pre-printed card
     cannot know the basket value; that pairing is asserted here so the
     UI can explain it rather than let a creator expect the impossible.

     logo — see assets/brands/README for why these are placeholders. */
  var BRANDS = [
    {
      id: "starbucks", name: "Starbucks", category: "cat.food",
      colour: "#00704A", mark: "SB",
      share: { type: "flat", value: 1, per: "per.coffee" },
      issue: { perSpend: 10 },
      method: "batch",
      points: 50,
      contract: { from: "2026-01-01", to: "2026-12-31" },
      blurb: "brand.starbucks.blurb"
    },
    {
      id: "nike", name: "Nike", category: "cat.sportswear",
      colour: "#111111", mark: "NK",
      share: { type: "percent", value: 8 },
      issue: { perSpend: 50 },
      method: "receipt",
      points: 120,
      contract: { from: "2026-03-01", to: "2027-02-28" },
      blurb: "brand.nike.blurb"
    },
    {
      id: "adidas", name: "Adidas", category: "cat.sportswear",
      colour: "#1D3557", mark: "AD",
      share: { type: "percent", value: 7 },
      issue: { perSpend: 50 },
      method: "receipt",
      points: 100,
      contract: { from: "2026-02-15", to: "2026-11-30" },
      blurb: "brand.adidas.blurb"
    },
    {
      id: "zara", name: "Zara", category: "cat.fashion",
      colour: "#242424", mark: "ZA",
      share: { type: "percent", value: 6 },
      issue: { perSpend: 40 },
      method: "receipt",
      points: 80,
      contract: { from: "2026-04-01", to: "2026-12-31" },
      blurb: "brand.zara.blurb"
    },
    {
      id: "nespresso", name: "Nespresso", category: "cat.food",
      colour: "#8B6F4E", mark: "NE",
      share: { type: "flat", value: 2, per: "per.sleeve" },
      issue: { perSpend: 20 },
      method: "batch",
      points: 60,
      contract: { from: "2026-01-15", to: "2026-10-31" },
      blurb: "brand.nespresso.blurb"
    }
  ];

  /* ── The creator's campaigns ───────────────────────────────────
     minted / scanned are the two figures Ztor genuinely observes: it
     generated the batch, and its own app recorded the scans. "Issued"
     (the brand actually handing a card to a customer) is brand-reported
     and may not exist at all — so it is deliberately NOT modelled. An
     invented issuance funnel would read as precision Ztor does not have.

     newFans = scans from accounts that did not already follow this
     creator. Derivable, and it is the reason a creator runs this at all. */
  var CAMPAIGNS = [
    {
      id: "cmp-1041", brandId: "starbucks", name: "Coastline tour · coffee run",
      status: "live", from: "2026-07-01", to: "2026-09-30",
      scans: 1832, chosen: 1104, brandScans: 8420, newFans: 611
    },
    {
      id: "cmp-1039", brandId: "nespresso", name: "Studio sessions",
      status: "live", from: "2026-06-15", to: "2026-08-31",
      scans: 447, chosen: 121, brandScans: 3180, newFans: 96
    },
    {
      id: "cmp-1028", brandId: "zara", name: "Spring lookbook",
      status: "ended", from: "2026-04-01", to: "2026-05-31",
      scans: 1204, chosen: 902, brandScans: 4960, newFans: 318
    },
    {
      id: "cmp-1022", brandId: "nike", name: "Run club collab",
      status: "paused", from: "2026-05-01", to: "2026-10-31",
      scans: 512, chosen: 143, brandScans: 9750, newFans: 187
    }
  ];

  function brand(id) {
    for (var i = 0; i < BRANDS.length; i++) if (BRANDS[i].id === id) return BRANDS[i];
    return null;
  }
  function campaign(id) {
    for (var i = 0; i < CAMPAIGNS.length; i++) if (CAMPAIGNS[i].id === id) return CAMPAIGNS[i];
    return null;
  }

  /* Revenue a campaign has actually earned.
     Flat deals are exact: every scan is worth the same fixed amount.
     Percentage deals are NOT computable here — the share depends on each
     basket's value, which lives in the brand's POS, not in Ztor. Rather
     than invent an average basket and present the product of two guesses
     as a figure, this returns null and the UI says so. A number a creator
     might act on must not be fabricated. */
  function revenueOf(c) {
    var b = brand(c.brandId);
    if (!b) return null;
    if (b.share.type === "flat") return c.scans * b.share.value;
    return null;
  }

  function pointsOf(c) {
    var b = brand(c.brandId);
    return b ? c.scans * b.points : 0;
  }

  /* Share of voice — of every scan of this brand while my campaign ran,
     how many named me. This is the denominator that actually belongs to
     the creator's situation: they are competing for the fan's tap, not
     for a stack of cards. */
  function shareOfVoice(c) {
    return c.brandScans ? (c.scans / c.brandScans) : 0;
  }

  /* Of the scans I won, how many did the fan deliberately switch to me
     rather than accept as the pre-selected default. The honest read of
     whether a campaign is persuading anyone. */
  function chosenRate(c) {
    return c.scans ? (c.chosen / c.scans) : 0;
  }

  window.ztorBrands = {
    brands: BRANDS,
    campaigns: CAMPAIGNS,
    brand: brand,
    campaign: campaign,
    revenueOf: revenueOf,
    pointsOf: pointsOf,
    shareOfVoice: shareOfVoice,
    chosenRate: chosenRate
  };
})();
