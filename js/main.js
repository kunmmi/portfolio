/* ============================================
   PORTFOLIO MAIN JS
   ============================================ */

document.getElementById('year').textContent = new Date().getFullYear();

// ── Nav: background on scroll + mobile menu ───
const navbar    = document.getElementById('navbar');
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navBurger?.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

navMobile?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ── Scroll reveal ──────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ── Project data (ordered by relevance to target roles) ──
const PROJECTS = [
  {
    title:  'Warden — Self-Hosted Trading Agents',
    flagship: true,
    badge:  'FLAGSHIP',
    desc:   'A self-hosted autonomous trading agent for BNB Smart Chain — your keys never leave your machine, and every cap (per-trade, daily, ops/day, drawdown, key expiry) is enforced on-chain by an ERC-4337 account contract, not by promises. A port and re-architecture of an upstream project; my own build is the PancakeSwap v3 venue layer, the 15-minute TWAP pricing guards, and the BreakerRegistry + KernelBreakerPolicy contracts that make the caps hold even if the off-chain agent is fully compromised.',
    tech:   ['Solidity', 'ERC-4337', 'Kernel v3.3', 'TypeScript', 'Next.js', 'PancakeSwap v3'],
    github: 'https://github.com/kunmmi/warden',
    live:   '',
  },
  {
    title:  'Token Launch Intelligence',
    badge:  'LIVE ON-CHAIN',
    desc:   'Real-time, multi-venue token-launch intelligence with actual on-chain launch execution — not just monitoring — across Pump.fun, Pons, and Flap.',
    tech:   ['TypeScript', 'Multi-Venue Execution', 'Pump.fun', 'Pons', 'Flap'],
    github: 'https://github.com/kunmmi/token-launch-intel',
    live:   '',
  },
  {
    title:  'Predict Market',
    badge:  'PREDICTION MARKETS',
    desc:   'A crypto prediction market MVP with a full referral and commission system. Users fund in-app wallets, trade binary yes/no markets, and promoters earn commissions from referred trading. Backed by PostgreSQL via Supabase with Row-Level Security and cron-job settlement.',
    tech:   ['TypeScript', 'Next.js', 'PostgreSQL', 'Supabase', 'GitHub Actions'],
    github: 'https://github.com/kunmmi/Predict-market',
    live:   'https://predict-market-xi.vercel.app',
  },
  {
    title:  'Whisper — Real-time Chat',
    badge:  'REAL-TIME',
    desc:   'Full-stack real-time messaging platform. Private 1-on-1 and group chats (up to 50 members), typing indicators, read receipts, offline message queuing, JWT auth, and paginated history. Built across 6 phases with comprehensive test suites.',
    tech:   ['Node.js', 'Socket.IO', 'Express', 'JWT', 'React', 'SQLite'],
    github: 'https://github.com/kunmmi/whisper',
    live:   'https://whisper-chat-flow.vercel.app/',
  },
  {
    title:  'Base ETH Token Scanner',
    badge:  'WEB3',
    desc:   'A Telegram bot for Web3 communities on the Base/Ethereum chain automating token scanning and DeFi analytics — liquidity, buy/sell tax — with command handling and push notifications, deployed on Render with health checks.',
    tech:   ['Python', 'Telegram Bot API', 'Web3.py', 'Ethereum / Base', 'Render'],
    github: 'https://github.com/kunmmi/Base-eth-token-scanner',
    live:   '',
  },
  {
    title:  'FarmSquare Connect',
    badge:  'AGRITECH',
    desc:   'An agricultural marketplace platform connecting farmers, buyers, and agents in one place. Product listings, agent coordination, and Paystack-powered payments for secure in-app transactions. Consulted as technical lead on architecture and delivery.',
    tech:   ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Paystack'],
    github: '',
    live:   'https://farmsquare-connect-main.vercel.app/',
  },
  {
    title:  'AlgoTrading with Ighodalo',
    badge:  'CONSULTING',
    desc:   'Professional algorithmic trading platform built for Expert Advisors on MetaTrader 5. Automates trading strategies with secure EA delivery and client management. Led as senior developer — architected the product, defined standards, and oversaw delivery.',
    tech:   ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'MetaTrader 5'],
    github: '',
    live:   'https://www.algotradingwithighodalo.xyz/',
  },
  {
    title:  'Online Store',
    badge:  'FULL-STACK',
    desc:   'Full-stack e-commerce platform with a FastAPI backend. Product catalog, JWT-secured auth, shopping cart, and order management. SQLAlchemy ORM, Pydantic validation, and a React + TypeScript frontend.',
    tech:   ['Python', 'FastAPI', 'SQLAlchemy', 'JWT', 'React', 'TypeScript'],
    github: 'https://github.com/kunmmi/Online-store',
    live:   'https://online-store-sage-delta.vercel.app',
  },
  {
    title:  'Student ID Card Tracker',
    badge:  'INSTITUTIONAL',
    desc:   'Built during my time at ITMS, University of Ibadan. A Flask system managing the full lifecycle of student ID card production — tracking per-student status (pending → ready → collected) with student lookup, bulk CSV/Excel upload, and admin workflows for 10,000+ students.',
    tech:   ['Python', 'Flask', 'SQLAlchemy', 'SQLite', 'Flask-Login', 'Pandas'],
    github: 'https://github.com/kunmmi/Student-id-card-status-tracker',
    live:   'https://student-id-tracker.vercel.app',
  },
  {
    title:  'Invoice Automation System',
    badge:  'AUTOMATION',
    desc:   'A GitHub Actions workflow that auto-generates monthly invoices for contractors via the Monday.com API. Runs the 1st of every month at 05:00 UTC — retrieves active contractors, generates invoice entries, prevents duplicates, and auto-populates status and due dates.',
    tech:   ['TypeScript', 'GitHub Actions', 'Monday.com API', 'Cron Schedule'],
    github: 'https://github.com/kunmmi/ccc-invoice-automation',
    live:   '',
  },
];

// ── Render project grid ────────────────────────
const grid = document.getElementById('projectGrid');

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

PROJECTS.forEach((proj) => {
  const card = document.createElement('article');
  card.className = 'project-card reveal';
  if (proj.flagship) card.classList.add('project-card--flagship');

  card.innerHTML = `
    <span class="project-card-corner">FIG. →</span>
    <div class="project-card-top">
      <h3>${esc(proj.title)}</h3>
      <span class="project-card-badge">${esc(proj.badge)}</span>
    </div>
    <p class="project-card-desc">${esc(proj.desc.length > 150 ? proj.desc.slice(0, 150) + '…' : proj.desc)}</p>
    <div class="chip-row">${proj.tech.map(t => `<span class="chip chip-sm">${esc(t)}</span>`).join('')}</div>
  `;

  card.addEventListener('click', () => openModal(proj));
  grid.appendChild(card);
  io.observe(card);
});

// ── Project modal ──────────────────────────────
const modal        = document.getElementById('projectModal');
const modalBackdrop= document.getElementById('modalBackdrop');
const modalClose   = document.getElementById('modalClose');
const modalEyebrow = document.getElementById('modalEyebrow');
const modalTitle   = document.getElementById('modalTitle');
const modalDesc    = document.getElementById('modalDesc');
const modalTech    = document.getElementById('modalTech');
const modalActions = document.getElementById('modalActions');

function openModal(proj) {
  modalEyebrow.textContent = proj.badge || '';
  modalTitle.textContent   = proj.title;
  modalDesc.textContent    = proj.desc;
  modalTech.innerHTML      = proj.tech.map(t => `<span class="chip chip-sm">${esc(t)}</span>`).join('');

  let actions = '';
  if (proj.github) actions += `<a href="${esc(proj.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Code ↗</a>`;
  if (proj.live)   actions += `<a href="${esc(proj.live)}" target="_blank" rel="noopener" class="btn btn-solid btn-sm">Live site ↗</a>`;
  modalActions.innerHTML = actions;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
