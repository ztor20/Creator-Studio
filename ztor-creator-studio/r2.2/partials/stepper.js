/* Stepper — behaviour for the house up/down number control.
   (2026-07-27; visual contract in ds-components/stepper.css)

   Delegated from the document, so steppers added later (cloned rows, panels
   rendered after load) work without re-initialising anything.

   Two things this must get right or it silently breaks the page:
     1. It dispatches a real `input` event after changing the value. Setting
        `.value` from script does NOT fire one, and the funding step's live
        overview listens on `input` — without this the number would change and
        the summary beside it would not.
     2. It clamps to the field's own min/max and reflects the limit by
        disabling the spent button, instead of letting a live-looking control
        do nothing. */
(function () {
  'use strict';

  function fieldOf(btn) {
    var host = btn.closest('.zstep');
    return host ? host.querySelector('.zstep__input, input') : null;
  }
  function num(v, fallback) {
    var n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }
  /* Round to the step's own decimal places — 0.1 steps otherwise accumulate
     float noise straight into a visible field. */
  function quantize(value, step) {
    var decimals = (String(step).split('.')[1] || '').length;
    return decimals ? Number(value.toFixed(decimals)) : Math.round(value);
  }

  function syncLimits(host) {
    var input = host.querySelector('.zstep__input, input');
    if (!input) return;
    var min = input.hasAttribute('min') ? num(input.min, null) : null;
    var max = input.hasAttribute('max') ? num(input.max, null) : null;
    var v = num(input.value, null);
    var up = host.querySelector('[data-step="up"]');
    var down = host.querySelector('[data-step="down"]');
    if (up) up.disabled = (v !== null && max !== null && v >= max);
    if (down) down.disabled = (v !== null && min !== null && v <= min);
  }

  function step(btn, dir) {
    var input = fieldOf(btn);
    if (!input || input.disabled || input.readOnly) return;
    var stepAttr = num(input.step, 1) || 1;
    var min = input.hasAttribute('min') ? num(input.min, -Infinity) : -Infinity;
    var max = input.hasAttribute('max') ? num(input.max, Infinity) : Infinity;
    /* Empty field: stepping up should land on a sane floor rather than NaN. */
    var current = num(input.value, null);
    if (current === null) current = (min !== -Infinity ? min : 0) - (dir > 0 ? stepAttr : 0);
    var next = quantize(current + dir * stepAttr, stepAttr);
    next = Math.min(max, Math.max(min, next));
    if (next === num(input.value, null)) { syncLimits(input.closest('.zstep')); return; }
    input.value = next;
    /* bubbles:true so delegated listeners (and the funding overview) hear it */
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    syncLimits(input.closest('.zstep'));
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.zstep__btn[data-step]');
    if (!btn) return;
    e.preventDefault();
    step(btn, btn.dataset.step === 'up' ? 1 : -1);
  });

  /* Keep the limit state honest when the user TYPES rather than clicks. */
  document.addEventListener('input', function (e) {
    var host = e.target.closest && e.target.closest('.zstep');
    if (host) syncLimits(host);
  });

  function initAll() { document.querySelectorAll('.zstep').forEach(syncLimits); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

  window.ZStepper = { sync: syncLimits, syncAll: initAll };
}());
