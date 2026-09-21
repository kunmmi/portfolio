// The only animated thing on this page: the warden flow diagram plays
// once, when it scrolls into view — explaining the sequence, not
// decorating the page.
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
