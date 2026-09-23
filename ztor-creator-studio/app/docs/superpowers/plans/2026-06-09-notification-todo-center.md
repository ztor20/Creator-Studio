# Notification & To-do Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the R 2.1 global notification and to-do center according to `documents/0-設計規格書.md §5.2.1`.

**Architecture:** Reuse the existing `sidebar.js` global navigation injector as the single source of truth for both Topbar and Sidebar modes. Keep one shared notification dataset and one shared panel renderer; CSS changes live in `shared.css`, and bilingual text lives in `i18n.js`.

**Tech Stack:** Static HTML prototype, vanilla JavaScript, token-driven CSS, local Lucide icon registry.

---

### Task 1: Finish Shared Panel Data And Interaction

**Files:**
- Modify: `sidebar.js`
- Modify: `i18n.js`

- [x] Add a shared Notification & To-do Center dataset with to-do items above update items.
- [x] Render the same panel content in both Topbar and Sidebar modes.
- [x] Add bilingual strings for all panel headers, actions, sample to-dos, sample updates, times, and source labels.
- [x] Rename the notification entry from announcement-only wording to Notification & To-do Center wording.
- [x] Add mark-all-read behavior that visually clears unread markers without navigating away.

### Task 2: Polish Layout For Both Display Modes

**Files:**
- Modify: `shared.css`

- [x] Keep the panel on the same surface and animation system as topbar dropdowns.
- [x] In Topbar mode, align the panel under the right action cluster.
- [x] In Sidebar mode, open the same panel as a right-side flyout next to the rail.
- [x] Ensure text truncates cleanly and the panel scrolls internally.

### Task 3: Update R 2.1 Documentation

**Files:**
- Modify: `SPEC.md`
- Modify: `UI-CHANGES.md`

- [x] Mark the R 2.1 global navigation as including the notification and to-do center.
- [x] Record the implementation details and known scope.

### Task 4: Verify

**Files:**
- Read: `index.html`
- Read: `sidebar.js`
- Read: `i18n.js`
- Read: `shared.css`

- [x] Run a local syntax check for the changed JavaScript files.
- [x] Serve the static site locally.
- [x] Inspect Topbar mode in a browser.
- [x] Inspect Sidebar mode in a browser.
