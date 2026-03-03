/**
 * Photo Carousel — carousel.js
 *
 * Features
 * ────────
 * • Infinite loop navigation
 * • Keyboard: ArrowLeft / ArrowRight / Home / End
 * • Touch swipe (horizontal only — vertical passes to page scroll)
 * • Mouse drag
 * • Autoplay with configurable delay
 * • Pauses on hover, focus-in, and manual interaction
 * • aria-live region announces slide changes to screen readers
 * • Respects prefers-reduced-motion (disables autoplay + transitions)
 * • No dependencies — vanilla ES2017
 */

(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────── */
  const AUTOPLAY_DELAY  = 5000;  // ms between auto-advances
  const SWIPE_MIN_PX    = 45;    // minimum horizontal px to count as swipe
  const SWIPE_MAX_RATIO = 1.2;   // max dx/dy ratio — avoids diagonal-swipe misfires

  /* ── Query helpers ───────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── DOM ─────────────────────────────────────────────── */
  const carousel    = $('.carousel');
  const track       = $('.carousel__track',    carousel);
  const win         = $('.carousel__window',   carousel);
  const liveRegion  = $('.carousel__live',     carousel);
  const btnPrev     = $('.carousel__btn--prev',carousel);
  const btnNext     = $('.carousel__btn--next',carousel);
  const autoplayBtn = $('.carousel__autoplay', carousel);
  const autoplayLbl = $('.carousel__autoplay-label', carousel);
  const slides      = $$('.carousel__slide',  carousel);
  const dots        = $$('.carousel__dot',    carousel);

  const total          = slides.length;
  const reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── State ───────────────────────────────────────────── */
  let current    = 0;
  let playing    = !reducedMotion; // never autoplay with reduced-motion preference
  let timerId    = null;
  let hovered    = false;
  let focused    = false;

  // Pointer / touch tracking
  let dragStartX = 0;
  let dragStartY = 0;
  let dragging   = false;

  /* ── Navigation ──────────────────────────────────────── */
  function goTo(index) {
    current = ((index % total) + total) % total; // safe modulo for negatives

    // Move track
    track.style.transform = `translateX(-${current * 100}%)`;

    // Sync aria-hidden on slides
    slides.forEach((slide, i) => {
      const active = i === current;
      if (active) {
        slide.removeAttribute('aria-hidden');
      } else {
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Sync dots
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.setAttribute('aria-current', active ? 'true' : 'false');
      dot.classList.toggle('active', active); // purely cosmetic hook if needed
    });

    // Announce to screen readers
    const label = slides[current].getAttribute('aria-label') || `Slide ${current + 1}`;
    const caption = slides[current].querySelector('figcaption')?.textContent ?? '';
    liveRegion.textContent = `${label}${caption ? ': ' + caption : ''}`;
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ── Autoplay ────────────────────────────────────────── */
  function startTimer() {
    if (reducedMotion || !playing) return;
    clearTimeout(timerId);
    timerId = setTimeout(() => { next(); startTimer(); }, AUTOPLAY_DELAY);
  }

  function stopTimer() {
    clearTimeout(timerId);
    timerId = null;
  }

  function setPlaying(state) {
    playing = state;
    carousel.classList.toggle('carousel--paused', !playing);
    autoplayBtn.setAttribute('aria-pressed', playing ? 'false' : 'true');
    autoplayBtn.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Start autoplay');
    autoplayLbl.textContent = playing ? 'Pause' : 'Play';

    if (playing && !hovered && !focused) {
      startTimer();
    } else {
      stopTimer();
    }
  }

  /* Resume the timer if conditions allow */
  function maybeResume() {
    if (playing && !hovered && !focused) startTimer();
  }

  /* ── Manual interaction: stop timer but keep playing=true ── */
  function onManualNav(moveFn) {
    stopTimer();
    moveFn();
    // Restart the timer after a brief pause so the user can see their slide
    setTimeout(() => maybeResume(), 800);
  }

  /* ── Button listeners ────────────────────────────────── */
  btnPrev.addEventListener('click', () => onManualNav(prev));
  btnNext.addEventListener('click', () => onManualNav(next));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => onManualNav(() => goTo(i)));
  });

  autoplayBtn.addEventListener('click', () => setPlaying(!playing));

  /* ── Keyboard ────────────────────────────────────────── */
  carousel.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); onManualNav(prev);             break;
      case 'ArrowRight': e.preventDefault(); onManualNav(next);             break;
      case 'Home':       e.preventDefault(); onManualNav(() => goTo(0));    break;
      case 'End':        e.preventDefault(); onManualNav(() => goTo(total - 1)); break;
    }
  });

  /* ── Hover pause ─────────────────────────────────────── */
  carousel.addEventListener('mouseenter', () => { hovered = true;  stopTimer(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; maybeResume(); });

  /* ── Focus pause ─────────────────────────────────────── */
  carousel.addEventListener('focusin',  () => { focused = true;  stopTimer(); });
  carousel.addEventListener('focusout', (e) => {
    if (!carousel.contains(e.relatedTarget)) {
      focused = false;
      maybeResume();
    }
  });

  /* ── Touch swipe ─────────────────────────────────────── */
  win.addEventListener('touchstart', (e) => {
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    dragging   = true;
  }, { passive: true });

  win.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;

    // Vertical scroll dominates — bail out
    if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_RATIO) {
      dragging = false;
      return;
    }
    // Horizontal swipe — prevent page scroll
    e.preventDefault();
  }, { passive: false });

  win.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - dragStartX;
    if (Math.abs(dx) >= SWIPE_MIN_PX) onManualNav(dx < 0 ? next : prev);
  }, { passive: true });

  /* ── Mouse drag (desktop) ────────────────────────────── */
  win.addEventListener('mousedown', (e) => {
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragging   = true;
  });

  // Listen on window so fast drags outside the element are caught
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    // Provide a tiny visual threshold before treating as drag
    const moved = Math.abs(e.clientX - dragStartX) + Math.abs(e.clientY - dragStartY);
    if (moved > 5) win.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    dragging = false;
    win.style.cursor = '';
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) >= SWIPE_MIN_PX) onManualNav(dx < 0 ? next : prev);
  });

  // Prevent ghost image drag on the link/image
  win.addEventListener('dragstart', (e) => e.preventDefault());

  /* ── Responsive: re-snap on resize ──────────────────── */
  // If the window is resized while mid-slide, snap back without animation
  let resizeTimer;
  window.addEventListener('resize', () => {
    track.style.transition = 'none';
    track.style.transform  = `translateX(-${current * 100}%)`;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      track.style.transition = '';
    }, 150);
  });

  /* ── Init ────────────────────────────────────────────── */
  goTo(0);
  setPlaying(!reducedMotion);

})();