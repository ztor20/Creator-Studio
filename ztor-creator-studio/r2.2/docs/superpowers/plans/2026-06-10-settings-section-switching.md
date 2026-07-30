# Settings Section Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Settings left navigation behave like local tabs so only the selected section contributes to page height.

**Architecture:** Keep the existing hash links and section IDs as the routing contract. A small inline controller activates one valid section at a time, updates the active navigation item, preserves deep links, and responds to browser back/forward navigation.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS hidden state.

---

### Task 1: Add Single-Section Presentation

**Files:**
- Modify: `settings.html`
- Modify: `ds-components/settings.css`

- [x] Load the Settings component stylesheet on the product page.
- [x] Mark all non-default Settings sections hidden in the initial HTML.
- [x] Add an explicit hidden-state rule and remove trailing section padding from the active panel.

### Task 2: Add Hash-Synced Navigation

**Files:**
- Modify: `settings.html`

- [x] Replace scroll-anchor-only active styling with an `activateSection(id)` controller.
- [x] On navigation click, update the URL hash without scrolling the page.
- [x] Restore the matching section on initial load and browser back/forward.
- [x] Fall back to Profile for invalid or missing hashes.

### Task 3: Verify

**Files:**
- Read: `settings.html`
- Read: `ds-components/settings.css`

- [x] Verify only one Settings section is visible at a time.
- [x] Verify Appearance content height ends before Notifications content.
- [x] Verify direct links such as `settings.html#notifications`.
- [x] Verify browser back/forward and both navigation display modes.
