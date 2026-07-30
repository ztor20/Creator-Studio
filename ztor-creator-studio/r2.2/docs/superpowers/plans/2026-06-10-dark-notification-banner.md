# Dark Notification Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the E-Shop and Fans page notifications one shared dark banner treatment based on the approved reference.

**Architecture:** Add an isolated `alert--banner` modifier to the existing Alert component. Update only the two page-level banners to use the modifier and shared dismiss markup, leaving Dashboard alert cards untouched.

**Tech Stack:** Static HTML, CSS, existing Ztor design tokens and i18n attributes.

---

### Task 1: Add the shared banner variant

**Files:**
- Modify: `ds-components/alert.css`

- [x] Add desktop and responsive rules for `.alert--banner`, its icon, copy, CTA, and dismiss button.
- [x] Confirm existing `.alert--card` and `.alert--row` selectors are unchanged.

### Task 2: Apply the variant to both page notifications

**Files:**
- Modify: `e-shop.html`
- Modify: `fans-crm.html`

- [x] Update both notifications to use `.alert--banner` and `.alert__body`.
- [x] Add the shared dismiss control to both banners.
- [x] Bump the Alert stylesheet cache key on both pages.

### Task 3: Verify appearance and behavior

**Files:**
- Verify: `e-shop.html`
- Verify: `fans-crm.html`

- [x] Open both pages in the local browser.
- [x] Check desktop and narrow viewport layout.
- [x] Click each dismiss control and confirm only its banner is removed.
