/* ═══════════════════════════════════════════════
   main.js  —  Shared Site JavaScript
   ═══════════════════════════════════════════════ */
 
document.addEventListener('DOMContentLoaded', () => {
 
  /* ── Mobile nav toggle ──────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.primary-nav');
 
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
 
    // Close on any nav link click (mobile UX)
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      });
    });
  }
 
  /* ── Mark current page link ─────────────────── */
  // Uses aria-current="page" for accessibility
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.primary-nav a').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.setAttribute('aria-current', 'page');
    }
  });
 
  /* ── Scroll reveal ───────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
 
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
 
  reveals.forEach(el => io.observe(el));
 
});