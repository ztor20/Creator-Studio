/* Dashboard hero banner carousel — 3 slides, auto-advance every 8s.
   The active dot is a progress capsule whose fill and the slide advance are
   driven by the SAME requestAnimationFrame clock, so the play/pause button
   freezes/resumes both in perfect sync (Framer video-slideshow style).
   Also runs the audience-slide entrance animation via WAAPI on load (CSS
   animations on the <h2>/<img> targets were stuck at "from" values in this
   engine; Web Animations API works reliably). */
(function () {
  // ── Audience-slide entrance: title/sub/CTAs rise + layers slide ──
  function runHeroIntro() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // CSS reduced-motion fallback already restores opacity; nothing to do.
      return;
    }
    const slide = document.querySelector('.hero__slide--audience');
    if (!slide) return;
    const ease = 'cubic-bezier(0.32, 0.72, 0, 1)';

    // Title / subtext / CTAs — stagger rise (translateY 24px → 0, opacity 0 → 1)
    [...slide.querySelectorAll('.hero__copy > *')].forEach((el, i) => {
      el.animate(
        [{ opacity: 0, transform: 'translateY(24px)' },
         { opacity: 1, transform: 'translateY(0)'   }],
        { duration: 850, easing: ease, delay: 80 + i * 160, fill: 'forwards' }
      );
    });

    // Three performer layers — directional slide-in, left-front slowest.
    // translateY(-50%) is carried in BOTH keyframes because the CSS rule on
    // .hero__layer uses top:50% + translateY(-50%) for vertical centring; if
    // we only animated translateX, the inline transform would clobber the Y
    // offset and the figures would snap downward during/after the animation.
    const layerSpecs = [
      ['.hero__layer--left-back',    'translateX(-140px) translateY(-50%)', 'translateX(0) translateY(-50%)', 1000,  60],
      ['.hero__layer--left-front',   'translateX(-140px) translateY(-50%)', 'translateX(0) translateY(-50%)', 1500, 140],
      ['.hero__layer--right-singer', 'translateX(140px) translateY(-50%)',  'translateX(0) translateY(-50%)', 1100, 220],
    ];
    layerSpecs.forEach(([sel, from, to, dur, delay]) => {
      const el = slide.querySelector(sel);
      if (el) el.animate(
        [{ opacity: 0, transform: from },
         { opacity: 1, transform: to   }],
        { duration: dur, easing: ease, delay, fill: 'forwards' }
      );
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runHeroIntro);
  } else {
    runHeroIntro();
  }

  // ── Carousel ──
  const hero = document.getElementById("hero");
  if (!hero) return;
  const slides = hero.querySelectorAll(".hero__slide");
  const dots = hero.querySelectorAll(".hero__dot");
  const toggle = hero.querySelector("[data-hero-toggle]");
  if (!slides.length) return;

  const DURATION = 8000; // ms per slide
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let idx = 0;
  let elapsed = 0;     // ms into the current slide
  let last = 0;        // last rAF timestamp
  let paused = false;

  function paintFill() {
    const pct = Math.min(elapsed / DURATION, 1) * 100;
    dots.forEach((d, k) => {
      const fill = d.querySelector(".hero__dot-fill");
      if (fill) fill.style.width = k === idx ? pct + "%" : "0%";
    });
  }
  function render() {
    slides.forEach((s, k) => {
      s.classList.toggle("hidden", k !== idx);
      // Only the active slide's background video plays (others pause to save work).
      const v = s.querySelector("video");
      if (v) { if (k === idx) v.play().catch(() => {}); else v.pause(); }
    });
    dots.forEach((d, k) => d.classList.toggle("hero__dot--active", k === idx));
    paintFill();
  }
  function go(i) {
    idx = (i + slides.length) % slides.length;
    elapsed = 0;
    render();
  }

  function tick(t) {
    if (!last) last = t;
    const dt = t - last;
    last = t;
    if (!paused) {
      elapsed += dt;
      if (elapsed >= DURATION) go(idx + 1);
      else paintFill();
    }
    requestAnimationFrame(tick);
  }

  // The play/pause label is state-dependent, so it can't use a static
  // data-i18n-aria-label; instead we pull it from the i18n dictionary (if
  // present) and re-apply on every language switch via the i18n:applied event.
  function labelToggle() {
    if (!toggle) return;
    const key = paused ? "hero.play" : "hero.pause";
    const fallback = paused ? "Play slideshow" : "Pause slideshow";
    toggle.setAttribute("aria-label", (window.i18nT && window.i18nT(key)) || fallback);
  }
  function setPaused(p) {
    paused = p;
    if (toggle) toggle.setAttribute("aria-pressed", p ? "true" : "false");
    labelToggle();
  }

  dots.forEach((d, k) =>
    d.addEventListener("click", () => { go(k); last = 0; if (paused) setPaused(false); })
  );
  if (toggle) toggle.addEventListener("click", () => setPaused(!paused));
  document.addEventListener("i18n:applied", labelToggle);

  render();

  // Reduced motion: show the first slide, start paused, no auto-advance.
  if (reduce) { setPaused(true); return; }

  requestAnimationFrame(tick);
})();
