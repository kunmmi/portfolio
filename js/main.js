// Carousel: prev/next buttons scroll by one slide width.
const carousel = document.getElementById('carousel');
const prevBtn = document.querySelector('.car-prev');
const nextBtn = document.querySelector('.car-next');
if (carousel && prevBtn && nextBtn) {
  const scrollByOne = (dir) => {
    const slide = carousel.querySelector('.project');
    const width = slide ? slide.getBoundingClientRect().width + 20 : carousel.clientWidth;
    carousel.scrollBy({ left: dir * width, behavior: 'smooth' });
  };
  prevBtn.addEventListener('click', () => scrollByOne(-1));
  nextBtn.addEventListener('click', () => scrollByOne(1));
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
