// Carousel: prev/next buttons scroll by one slide width, dots jump to
// a slide directly, and the active dot tracks scroll position.
const carousel = document.getElementById('carousel');
const prevBtn = document.querySelector('.car-prev');
const nextBtn = document.querySelector('.car-next');
const dots = Array.from(document.querySelectorAll('.car-dot'));
const slides = Array.from(document.querySelectorAll('.project'));

if (carousel && prevBtn && nextBtn) {
  const slideStep = () => (slides[0] ? slides[0].getBoundingClientRect().width + 20 : carousel.clientWidth);
  prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -slideStep(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => carousel.scrollBy({ left: slideStep(), behavior: 'smooth' }));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      carousel.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    });
  });

  if (slides.length && 'IntersectionObserver' in window) {
    const dotIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target);
          dots.forEach((d) => d.classList.remove('is-active'));
          if (dots[idx]) dots[idx].classList.add('is-active');
        }
      });
    }, { root: carousel, threshold: 0.6 });
    slides.forEach((s) => dotIO.observe(s));
  }
}

// The only animated thing on this page besides the carousel: the warden
// flow diagram plays once, when it scrolls into view.
const flow = document.getElementById('wardenFlow');
if (flow && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  io.observe(flow);
}

console.log(
  "Reading the source instead of the page — respect. This site has no build step: view-source and it's the whole thing. If you're hiring for backend or smart-contract work, I'm at bukunmiodukoya@gmail.com."
);
