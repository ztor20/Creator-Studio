# Ztor eShop — Consolidated Ingestion Brief

*2026-06-24 · prep for narrowing **Phase 1 of Ztor eShop & Creator eShop (internal use only)***

This brief ingests three bodies of work into one map so we can cut Phase 1 cleanly. It does **not** decide scope — it surfaces what exists and the tensions that the Phase 1 decision must resolve.

---

## The three sources on the table

| # | Source | Type | Side | Where | Fidelity |
|---|---|---|---|---|---|
| 1 | **My prior artifacts** | BRD + wireframe + clickable prototype | Both | `outputs/specs/…`, `aic-output/ztor/…`, `ztor-docs/prototypes/ztor-eshop-proto/` | Spec-of-record + working demo |
| 2 | **Creator Studio repo** | Static HTML mockup + requirement docs | **Creator eShop** (internal admin) | `pathfinders/Creator-Studio/` (`ztor20/Creator-Studio`, pulled to 8ee4ba7) | UX spec + traceability, no backend |
| 3 | **Designer prototype** | Bilingual HTML prototype | **Ztor eShop** (buyer/fan-facing) | `endgame.ztor.lx7.com` → mirrored to `outputs/research/eshop-designer-proto-2026-06-24/` | Breadth demo, mock data, no backend |

**Terminology used below:** *Creator eShop* = the internal Creator-Studio admin surface (manage shops/products/orders). *Ztor eShop* = the buyer-facing storefront on the consumer platform. Phase 1 "internal use only" = the **whole loop run by internal ops** (admin creates shop → lists product → internal tester buys → order recorded → pickup).

---

## 1 · What I already produced

- **BRD v1.1** — `outputs/specs/ztor-eshop-brd-v1-2026-06-15.md`. 12 BRs, 3 phases, machine-readable ticket index + screen map. PH-01 = admin-operated core commerce loop (BR-01→08); PH-02 = public discovery + QR fulfillment (BR-09/10/11/12); PH-03 = SSO self-serve, POPCORN payouts, extra PSPs, refunds, logistics.
- **Wireframe v0.4** — https://aic-output.vercel.app/ztor/ztor-eshop-wireframe-2026-06-11.html (flows · screens · architecture; two-POV Creator Studio; fiat = net-new rail).
- **Clickable prototype** — https://ztor-eshop-proto.vercel.app/ (Next.js 14). Buyer surfaces incl. **product detail + dual-currency checkout + dynamic-QR pickup** + Creator Studio two-POV. *Deeper on the buyer checkout path than the designer prototype.*
- **QA recon** — `outputs/qa-screenshots/2026-06-15-ztor-recon/` (my proto) and `outputs/qa-screenshots/2026-04-27-pre-release/` (Beamco shop UAT — the module we're wrapping).
- **4 still-OPEN items** carried in the BRD: platform revenue cut · dynamic-QR scope · creator-registration approval · commerce-module API spec.

## 2 · Creator Studio repo = the internal admin tool ("Creator eShop")

- **Nature:** static HTML mockup — *no package.json / React / build*. Vanilla-JS + `shared.css`. Active revision = **`ztor-creator-studio/R 2.1/`**. All commerce logic is front-end demo. **The authoritative PRD lives OUTSIDE this repo** (`02-PRD`, `decisions.md`, `0-設計規格書.md`) — this repo is UI + traceability only.
- **Requirements:** `creator-studio-docs/ztor-eshop-requirements-breakdown.md`, IDs `CS-ESHOP-###`, priorities **P0/P1/P2**. Sections 5.1 creator-context → 5.10 earnings. P0 spine = list/filter/toggle screens + order list/detail (read-only) + Earnings KPI/tx minimum.
- **Screens built:** `e-shop.html` (Products/Bundles/Auctions tabs, low-stock banner, status filter, kebab row-actions, on/off toggle), `create-product.html` (Physical + Digital types, variants matrix, edition limited/unlimited, shipping vs QR-pickup delivery, per-person limit), `product-detail.html`, `create-bundle.html` (≥2 members, stock = min), `bundle-detail.html`, `store-settings.html` (Stripe read-only, shipping defaults, slug `ztor.com/shop/{slug}`), `orders.html` + `order-detail.html` (dual status axes, amounts read-only from Earnings), `create-auction.html` + `auction-detail.html`, restock/see-as-fan partials.
- **Data model (proposed FE types):** CreatorProfile · Shop · Product · ProductVariant · ProductMedia · Bundle · StoreSettings · StockMovement · Order · OrderItem · Fulfillment · RevenueEvent · Payout. *Per-shop `currency` is fiat only — no POPCORN field, no platform-toggle field.*
- **Money model:** **Earnings is the single source of truth.** Orders display amounts but never recompute; revenue flows Pending → (T+7) Available → Payout.

## 3 · Designer prototype = the buyer storefront ("Ztor eShop")

- **Nature/design:** bilingual (zh-Hant default), cinematic **dark** UI; canvas `#0a0a0a`, brand accent **amber `#ffa33f`**, Proxima Nova + Noto Sans TC. Catalogue is JS mock data; renders client-side.
- **Shop family (5 surfaces, tabbed):** 商店 `shop.html` (54 platform-merch items, NT$320–12,800) · 爆米花商店 `shop-popcorn.html` (POPCORN **redemption** catalogue — gift cards, airline miles, experiences) · 創作者商店 `shop-creators.html` (creator directory) · 活動 `shop-events.html` (ticketed events) · 拍賣 `shop-auction.html` (auctions).
- **Creator storefront** (`creator-jay-chou.html`) = **unified social profile**: tabs 商店 / 活動 / 排行榜 / 貼文 / 項目. Shop sub-nav **商品 / 套組 / 拍賣** (products / bundles / auctions). "本月精選 (This Month's Pick)" featured drop. **頭號粉絲** fan leaderboard w/ tiers. Creator **我的收益 NTD 1,350** is **private** (own profile dropdown), not public.
- **Currency & checkout:** prices **NT$** + optional secondary **HK$** (display only, no FX). **Cart + checkout = localStorage slide-over drawer** (no dedicated pages) — 5% tax, flat **NT$120 shipping / free over NT$3,000**, payment = **Apple Pay / credit card / 貨到付款 (COD)**. **No product-detail page exists** (cards link to `#`).
- **POPCORN** is a **separate rail**: bought on `popcorn.html` (packages 260/1,250/3,320 顆), framed as a **film-rental** currency; spent on `shop-popcorn.html` as a **rewards/redemption marketplace**. POPCORN never enters the fiat merch cart — it uses a "兌換 (Redeem)" affordance with no checkout wired.

---

## How the two sides fit

```
   INTERNAL (Phase 1 = internal use only)              BUYER-FACING
   ┌─────────────────────────────┐                  ┌──────────────────────────┐
   │  Creator eShop               │   manages →      │  Ztor eShop              │
   │  (Creator Studio admin tool) │ ───────────────► │  (consumer storefront)   │
   │  src: Creator-Studio repo    │                  │  src: designer prototype │
   │                              │                  │       + my ztor-eshop-   │
   │  shop/product/order/earnings │ ◄─────────────── │       proto              │
   └─────────────────────────────┘   orders, money  └──────────────────────────┘
              both wrap →  Beamco commerce + base modules (multi-tenant; Ztor = a tenant)
```

---

## ⚠️ Tensions the Phase 1 cut must resolve

1. **POPCORN — payment rail or separate economy?** *Three sources disagree.* BRD (BR-07) says dual-currency **merch checkout** in v1. Creator Studio prototype has **no POPCORN at all** (fiat only). Designer prototype treats POPCORN as a **separate redemption/film-rental economy**, never a merch payment. → Decide: is POPCORN a checkout option for physical merch in Phase 1, or out?

2. **Scope creep — auctions & digital goods.** BRD scopes v1 to **physical + bundles only**. But **auctions are fully built** in *both* prototypes (Creator Studio `create-auction.html`/`auction-detail.html`; designer global + per-creator auction tabs with live bidding), and the Creator Studio prototype also ships **Digital goods + limited editions** as live. → Decide: hold the physical+bundles line for Phase 1, or absorb auctions/digital because they're already designed?

3. **Two buyer prototypes, opposite shapes.** Mine (`ztor-eshop-proto`) is **deep** (real PDP, dual-currency checkout, QR pickup) but narrow. The designer's is **broad** (auctions, events, leaderboard, POPCORN marketplace, wishlist) but **shallow** (no PDP, mock COD/Apple-Pay checkout). → Decide which is the Phase 1 buyer reference, or how to merge.

4. **Payment rail mismatch.** BRD = **Stripe** (+ POPCORN). Designer mock = **Apple Pay / card / COD**. COD actually fits the "offline fulfillment, local pickup" reality. → Confirm the Phase 1 payment set.

5. **The 4 open BRD items** still block their BRs: platform revenue cut (0% today vs 60/40 vision) · dynamic-QR scope (Asana blocker) · registration-approval policy · **commerce-module API spec (undocumented — source from 邓宇芩/Jesse or the codebase)**.

6. **Authoritative PRD is off-repo.** The real product rules (`02-PRD`, `decisions.md`, `0-設計規格書.md`) are not in the Creator-Studio clone — need to pull them before finalizing requirements of record.

---

## Phase 1 spine (preview — to be confirmed in the narrowing session)

Closest existing cut = **BRD PH-01 + Creator-Studio P0**, run end-to-end internally:

- Creator eShop (admin): create creator → auto-shop → list **physical product + bundle** (dual pricing TBD per tension #1) → publish → **orders list/detail read-only from Earnings**.
- Ztor eShop (buyer): storefront ≡ creator profile shop tab → **product detail** (needs build per tension #3) → checkout (rail per tensions #1/#4) → order confirm → pickup.
- **Likely-out for Phase 1:** auctions, digital goods, public discovery rails, SSO self-serve, refunds, logistics, POPCORN payouts.

> Next step: run the brainstorming pass to lock the Phase 1 line against tensions #1–#6.
