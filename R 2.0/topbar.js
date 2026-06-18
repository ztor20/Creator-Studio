// Ztor Creator Studio · Topbar dropdown handler
// Handles creator switcher + avatar menu (any element with [data-dropdown]).
// Pattern: wrapper [data-dropdown] > trigger button > <ul class="app-topbar__dropdown" hidden>
// Click trigger to toggle; click outside / ESC to close; close other open dropdowns.

(function () {
  function getTrigger(wrapper) {
    return wrapper.querySelector('button[aria-haspopup="true"]');
  }
  function getPanel(wrapper) {
    // First child with a known panel class
    return wrapper.querySelector('.app-topbar__dropdown, .app-topbar__search-panel');
  }

  function closeDropdown(wrapper) {
    const trigger = getTrigger(wrapper);
    const panel = getPanel(wrapper);
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }

  function openDropdown(wrapper) {
    // Close any other open dropdowns first
    document.querySelectorAll('[data-dropdown]').forEach((other) => {
      if (other !== wrapper) closeDropdown(other);
    });
    const trigger = getTrigger(wrapper);
    const panel = getPanel(wrapper);
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    // Autofocus if the panel has an input marked with [data-autofocus]
    const focusTarget = panel.querySelector('[data-autofocus]');
    if (focusTarget) {
      // Defer so the panel is laid out before focus
      requestAnimationFrame(() => focusTarget.focus());
    }
  }

  function toggleDropdown(wrapper) {
    const trigger = getTrigger(wrapper);
    if (!trigger) return;
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeDropdown(wrapper);
    else openDropdown(wrapper);
  }

  function init() {
    document.querySelectorAll('[data-dropdown]').forEach((wrapper) => {
      const trigger = getTrigger(wrapper);
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(wrapper);
      });
    });

    // Close on click outside any dropdown
    document.addEventListener('click', (e) => {
      document.querySelectorAll('[data-dropdown]').forEach((wrapper) => {
        if (!wrapper.contains(e.target)) closeDropdown(wrapper);
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-dropdown]').forEach(closeDropdown);
      }
    });

    // Creator option radio behavior (single-select within a switcher)
    document.querySelectorAll('.app-topbar__creator-menu').forEach((menu) => {
      menu.querySelectorAll('[role="menuitemradio"]').forEach((opt) => {
        opt.addEventListener('click', () => {
          menu.querySelectorAll('[role="menuitemradio"]').forEach((sib) => {
            sib.setAttribute('aria-checked', sib === opt ? 'true' : 'false');
          });
          const nameEl = menu.querySelector('.app-topbar__creator-name');
          if (nameEl) nameEl.textContent = opt.textContent.trim();
          closeDropdown(menu);
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
