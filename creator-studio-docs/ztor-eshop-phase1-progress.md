# Ztor eShop — Phase 1 Brainstorming Progress & Handoff

*2026-06-24 · Owner: Jeff Yang · Status: **mid-brainstorming** — Section 1 (scope) presented, awaiting confirm*

> Handoff doc so this can be resumed on another machine. It is self-contained: the locked decisions, the proposed Phase 1 scope, and the remaining steps are all below.

---

## How to resume (next action)

We are running the **superpowers `brainstorming`** flow to narrow **Phase 1 of Ztor eShop & Creator eShop (internal use only)**. We've ingested all sources and resolved the 6 big scope tensions. We are at **Section 1 — Scope**, presented and awaiting confirmation.

**Pick up here:**
1. Confirm **Section 1 scope** (below) + the **3 residual calls**.
2. Then proceed through the remaining design sections (see *Remaining sections* below).
3. Write the validated spec to `outputs/specs/ztor-eshop-phase1-spec-YYYY-MM-DD.md` (workspace convention overrides the skill's default `docs/superpowers/specs/`).
4. Self-review the spec → user review gate → invoke **`writing-plans`** to produce the implementation plan.

> ⛔ Brainstorming hard-gate: no implementation / code / scaffolding until the design is written and approved.

---

## Sources ingested

| Source | What | Where |
|---|---|---|
| Prior BRD v1.1 | 12 BRs, 3 phases, ticket index + screen map | `outputs/specs/ztor-eshop-brd-v1-2026-06-15.md` (Windows workspace) |
| Wireframe v0.4 | flows · screens · architecture | https://aic-output.vercel.app/ztor/ztor-eshop-wireframe-2026-06-11.html |
| Clickable prototype | Next.js; PDP + dual-currency checkout + QR | https://ztor-eshop-proto.vercel.app/ · src `ztor-docs/prototypes/ztor-eshop-proto/` |
| **Creator Studio repo** | internal admin tool — static HTML mockup `R 2.1/` | **this repo** (`ztor-creator-studio/`, `creator-studio-docs/`) |
| **Designer prototype** | buyer storefront — bilingual HTML | `endgame.ztor.lx7.com` → mirror `outputs/research/eshop-designer-proto-2026-06-24/` |
| Consolidated brief | full ingestion synthesis + tensions | `ztor-eshop-ingestion-brief-2026-06-24.md` (copied into this folder) |

**Terminology:** *Creator eShop* = internal Creator-Studio admin surface. *Ztor eShop* = buyer-facing storefront. *Phase 1 "internal use only"* = the whole purchase loop run/tested by internal ops, not publicly launched.

---

## The 6 locked decisions (from Jeff, 2026-06-24)

1. **POPCORN** — in scope, added as a **"Pay by POPCORN" option on the checkout page** (alongside Apple Pay / credit card). Not a separate rail.
2. **Auctions + digital goods** — **later phase**. Phase 1 = physical + bundles only.
3. **Strictly eShop** — ignore events / leaderboard / posts / projects / POPCORN-redemption marketplace.
4. **COD (貨到付款)** — **removed**.
5. **Open items:** platform fee = **yes (exists)** · QR = **generated after purchase, delivered by email + shown in order/purchase detail** · shop owner = **linked from the Creator Portal**.
6. **PRD** — pull latest (see gap note below).

---

## Section 1 — Phase 1 Scope (presented; awaiting confirm)

### ✅ IN — end-to-end loop, run internally
- **Creator eShop (admin / Creator Studio):** create creator → **auto-generate shop** → manage **physical products + bundles** (dual price: cash base + POPCORN) → **orders list + order detail** (amounts read-only; **Earnings = source of truth**) → store settings → restock. **Two-POV permission** (admin role-assumes into a creator; creator self-serve SSO = later).
- **Ztor eShop (buyer storefront):** creator shop page → **product detail page** (⚠️ must build — designer proto has none) → cart → **checkout: Apple Pay / credit card (Stripe) + Pay by POPCORN** → order confirm → **static QR by email + in order detail** → operator validates at pickup.
- **Platform fee** booked on each order in Earnings (gross − platform fee − payment fee = net).
- **Commerce backend:** wrap Beamco `commerce`+`base` as a microservice; Ztor-owned buyer gateway; Ztor = a tenant.

### ❌ OUT / LATER
COD · in-system refunds · logistics/shipping integration · auctions · digital & limited-edition goods · events/leaderboard/posts/projects · POPCORN redemption marketplace · public discovery rails (`/shops`, homepage merch rails) · creator SSO self-serve · POPCORN payouts (income stays cash) · extra PSPs (Antom etc.) · **rotating/dynamic QR** (Phase 1 = static per-order QR).

### ⚠️ 3 residual calls (recommendation — confirm/correct)
1. **Platform fee rate** → **configurable, default 15%** (matches the figure in the Creator-Studio order-detail mock); exact % = business sign-off, doesn't block build.
2. **QR = static, not rotating** → "email + order detail" ⇒ one fixed QR per order; **drop the 5–30s rotating token** for Phase 1 (it was the Asana blocker). Dynamic refresh = later hardening.
3. **"Creator Portal" = the creator identity/account surface** (the Creator-Studio creator record) → shop owner = that creator profile; commerce tenant links to it; **no separate shop-owner account**. (Correct if Creator Portal is a distinct system to integrate against.)

---

## Remaining brainstorming sections (to do after Section 1 sign-off)

- **Section 2 — System architecture & screen/flow inventory** for Phase 1 (admin + buyer surfaces, the gateway/tenant boundary, where POPCORN checkout plugs in).
- **Section 3 — Data model** for the Phase 1 slice (Product/Bundle/Order/Fulfillment/RevenueEvent + the POPCORN-price + platform-fee fields).
- **Section 4 — Build deltas** (what exists in the two prototypes vs what's net-new to build, esp. buyer PDP + POPCORN checkout + static-QR).
- **Section 5 — Dependencies/risks** (esp. commerce-module API spec — undocumented; platform-fee %, QR ops process).
- Then: write spec → self-review → user review → `writing-plans`.

---

## ⚠️ PRD gap (item 6)

Both ztor20 repos pulled to latest (`Creator-Studio`, `Features`). The authoritative eShop PRD-of-record is **not in any accessible repo** — `ztor-creator-studio/R 2.1/requirements-map.md` references `../../requirement/02-PRD-產品需求規格書.md`, `../../documents/decisions.md`, `../../documents/0-設計規格書.md`, none of which exist in the clone, and only `Creator-Studio` + `Features` exist on the ztor20 GitHub. They live in an upstream local vault not pushed to GitHub. **Action for Mac session:** locate those three files (vault / Notion / Drive) and fold them in; until then we proceed on `ztor-eshop-requirements-breakdown.md` (CS-ESHOP-### list) + `ztor-eshop-business-flow.md` + Jeff's decisions.
