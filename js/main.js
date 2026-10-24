const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Loader ─────────────────────────────────────────────────────────
// Counts up while fonts and the WebGL scene get ready, then wipes away.
(function loader() {
  const el = document.getElementById('loader');
  const pctEl = document.getElementById('loaderPct');
  if (!el) return;
  document.body.classList.add('is-loading');

  let pct = 0;
  let loaded = document.readyState === 'complete';
  window.addEventListener('load', () => { loaded = true; });
  // Never hold the page hostage to a slow font/CDN: cap the loader at 3.5s.
  const started = Date.now();

  const tick = setInterval(() => {
    const ready = (loaded && window.__sceneReady) || Date.now() - started > 3500;
    pct = Math.min(ready ? pct + 9 : Math.min(pct + Math.random() * 6, 90), 100);
    pctEl.textContent = Math.floor(pct) + '%';
    if (pct >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        el.classList.add('is-done');
        document.body.classList.remove('is-loading');
        document.dispatchEvent(new Event('site:ready'));
        setTimeout(() => el.remove(), 1000);
      }, 250);
    }
  }, reduceMotion ? 10 : 60);
})();

// ── Hero role rotator ──────────────────────────────────────────────
(function roles() {
  const words = Array.from(document.querySelectorAll('.role-word'));
  if (words.length < 2 || reduceMotion) return;
  let i = 0;
  setInterval(() => {
    const cur = words[i];
    i = (i + 1) % words.length;
    const next = words[i];
    cur.classList.remove('is-active');
    cur.classList.add('is-leaving');
    next.classList.remove('is-leaving');
    next.classList.add('is-active');
    setTimeout(() => cur.classList.remove('is-leaving'), 750);
  }, 2600);
})();

// ── "What I do" cards: click (or Enter) to expand ──────────────────
document.querySelectorAll('.card').forEach(card => {
  const toggle = () => card.classList.toggle('is-open');
  card.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

// ── Work list: thumbnail follows the cursor on hover ───────────────
(function preview() {
  const img = document.getElementById('workPreview');
  if (!img) return;
  let x = 0, y = 0, cx = 0, cy = 0, raf = null;
  const follow = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    img.style.left = cx + 24 + 'px';
    img.style.top = cy - 100 + 'px';
    raf = requestAnimationFrame(follow);
  };
  document.querySelectorAll('.work-item[data-thumb]').forEach(item => {
    item.addEventListener('pointerenter', e => {
      img.src = item.dataset.thumb;
      x = cx = e.clientX; y = cy = e.clientY;
      img.classList.add('is-visible');
      if (!raf) follow();
    });
    item.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; });
    item.addEventListener('pointerleave', () => {
      img.classList.remove('is-visible');
      cancelAnimationFrame(raf);
      raf = null;
    });
  });
})();

// ── About: split into words that light up as you scroll ────────────
const aboutEl = document.querySelector('[data-split]');
if (aboutEl) {
  const text = aboutEl.textContent.trim().replace(/\s+/g, ' ');
  aboutEl.innerHTML = text.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
}

// ── Scroll-driven animation (GSAP) ─────────────────────────────────
function initScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // No GSAP (CDN blocked): show everything in its final state.
    document.querySelectorAll('.about-text .w').forEach(w => w.classList.add('is-lit'));
    const fill = document.querySelector('.timeline-fill');
    if (fill) fill.style.height = '100%';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  // Keep animations on wall-clock time. With the default lag smoothing, a
  // slow device rendering the WebGL scene stretches the hero entrance out
  // for many seconds and leaves the name half-faded.
  gsap.ticker.lagSmoothing(0);

  if (reduceMotion) {
    document.querySelectorAll('.about-text .w').forEach(w => w.classList.add('is-lit'));
    gsap.set('.timeline-fill', { height: '100%' });
    return;
  }

  // Hero entrance
  gsap.from('.hero-name > *', { y: 60, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' });
  gsap.from('.hero-role > *', { y: 60, opacity: 0, duration: 1.1, stagger: 0.12, delay: 0.25, ease: 'power4.out' });
  gsap.from(['.site-head', '.side-socials', '.resume-link', '.hero-loc'], { opacity: 0, duration: 1, delay: 0.6 });

  // Hero text parts drift apart as you leave the hero
  gsap.to('.hero-name', { x: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-role', { x: 120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // About words light up one by one
  const words = gsap.utils.toArray('.about-text .w');
  ScrollTrigger.create({
    trigger: '.about-text',
    start: 'top 80%',
    end: 'bottom 45%',
    scrub: true,
    onUpdate: self => {
      const lit = Math.round(self.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    },
  });

  // Section headings rise in
  gsap.utils.toArray('.whatido-title, .career-title, .work-title, .stack-title, .contact-name').forEach(el => {
    gsap.from(el, { y: 80, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.from('.card', { y: 60, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.cards', start: 'top 80%' } });

  // Timeline line fills as you scroll through the jobs
  gsap.to('.timeline-fill', { height: '100%', ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  gsap.utils.toArray('.job').forEach(job => {
    gsap.from(job.children, { y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: job, start: 'top 82%' } });
  });

  gsap.from('.work-item', { y: 50, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.work-list', start: 'top 80%' } });
  gsap.from('.stack-grid span', { y: 30, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.025, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.stack-grid', start: 'top 85%' } });
}

document.addEventListener('site:ready', initScroll, { once: true });

document.getElementById('year').textContent = new Date().getFullYear();

console.log(
  "Reading the source instead of the page — respect. No build step: view-source and it's the whole thing. If you're hiring for backend or smart-contract work, I'm at bukunmiodukoya@gmail.com."
);
