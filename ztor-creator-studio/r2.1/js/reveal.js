// Scroll reveal — fade + slight rise for block-level content as it enters the
// viewport (IntersectionObserver). Above-the-fold blocks animate on load;
// below-the-fold blocks animate when scrolled into view. Each block reveals
// once. Honors prefers-reduced-motion (does nothing → content stays visible).
//
// Pairs with the `.reveal-on / .reveal / .is-in` CSS in shared.css.
(function () {
  var root = document.documentElement;

  // Reduced motion: leave everything visible, never hide.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Block-level targets only (avoid animating every small element). .card also
  // covers .chart-card (it carries the .card class).
  /* Audience-slide hero copy children and .hero__layer are NOT in this list —
     they're animated by hero.js runHeroIntro() via WAAPI (CSS animations on
     <h2>/<img> were unreliable in this engine, stuck at "from" values). */
  var SELECTOR = [
    '.hero__copy', '.section-head', '.kpi', '.card',
    '.tabs', '.info-banner', '.ztor-table', '.alert--row',
    '.filter-row', '.empty-stub'
  ].join(',');

  function run() {
    root.classList.add('reveal-on');

    var els = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));

    // Drop any element nested inside another matched target (avoid double fade).
    els = els.filter(function (el) {
      var p = el.parentElement;
      while (p) {
        if (p.matches && p.matches(SELECTOR)) return false;
        p = p.parentElement;
      }
      return true;
    });

    // Tag + stagger by index within the same parent group.
    var groupCount = new Map();
    els.forEach(function (el) {
      el.classList.add('reveal');
      var key = el.parentNode;
      var i = groupCount.get(key) || 0;
      if (i > 0) el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
      groupCount.set(key, i + 1);
    });

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
