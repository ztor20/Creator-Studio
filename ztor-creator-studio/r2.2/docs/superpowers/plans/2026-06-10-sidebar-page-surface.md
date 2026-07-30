# Sidebar Page Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sidebar mode read as a gray App Shell containing one continuous white route page.

**Architecture:** Keep the shared `.app > navigation + .main` HTML contract. Add semantic shell tokens in the Design System, then style `.main` as the route page only when `data-nav-mode="sidebar"` is active; reset the treatment at the existing 900px responsive breakpoint.

**Tech Stack:** Static HTML, CSS custom properties, shared responsive CSS, in-app browser verification.

---

### Task 1: Add App Shell Tokens

**Files:**
- Modify: `ds-components/_tokens.css`
- Modify: `design-system.md`
- Modify: `design-system.html`

- [x] Add light and dark semantic values for the shell canvas and route page.
- [x] Add page-level radius and gutter tokens.
- [x] Document the tokens and Sidebar-mode composition.

### Task 2: Apply the Shared Sidebar Shell

**Files:**
- Modify: `shared.css`

- [x] Put Sidebar mode on the shell canvas.
- [x] Make the sidebar transparent against the canvas.
- [x] Turn `.main` into the single opaque page surface.
- [x] Add the desktop top gap and top-left page radius.
- [x] Reset the shell treatment at the 900px breakpoint.

### Task 3: Synchronize Product Documentation

**Files:**
- Modify: `SPEC.md`
- Modify: `UI-CHANGES.md`

- [x] Record the Sidebar App Shell layout contract.
- [x] Record the new Design System tokens and responsive behavior.

### Task 4: Verify

**Files:**
- Read: `index.html`
- Read: `settings.html`
- Read: `shared.css`

- [x] Verify Dashboard and Settings in Sidebar mode.
- [x] Verify light and dark themes.
- [x] Verify Topbar mode remains full-width and unchanged.
- [x] Verify the mobile reset at or below 900px.
- [x] Verify the notification flyout stacking and page clipping.
