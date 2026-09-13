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
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ── Project data ───────────────────────────────
const PROJECTS = [
  {
    title:  'Warden — Trustless Trading Agents',
    image:  'assets/warden-thumb.jpg',
    desc:   'A self-hosted autonomous trading agent for BNB Smart Chain — your keys never leave your machine, and every cap (per-trade, daily, ops/day, drawdown, key expiry) is enforced on-chain by an ERC-4337 account contract, not by promises. The agent proposes trades against a curated PancakeSwap v3 basket; deterministic policy code disposes — no model can ever construct calldata or move funds outside the wall. Ships with a live local dashboard, a "prove the wall" attack simulator, paper-trading mode against real prices, and full Telegram control inside the same permission system.',
    tech:   ['TypeScript', 'ERC-4337', 'Solidity', 'PancakeSwap v3', 'Telegram Bot API', 'Node.js'],
    github: 'https://github.com/kunmmi/warden',
    live:   '',
    badge:  '⭐ Featured',
  },
  {
    title:  'Predict Market',
    image:  'assets/predict-market-thumb.jpg',
    desc:   'A crypto prediction market MVP with a full referral and commission system. Users fund in-app wallets, trade binary yes/no markets, and promoters earn commissions from referred trading. Backed by PostgreSQL via Supabase with Row-Level Security and cron-job settlement.',
    tech:   ['TypeScript', 'Next.js', 'PostgreSQL', 'Supabase', 'GitHub Actions'],
    github: 'https://github.com/kunmmi/Predict-market',
    live:   'https://predict-market-xi.vercel.app',
    badge:  '🔮 Prediction Markets',
  },
  {
    title:  'Whisper — Real-time Chat',
    image:  'assets/whisper-thumb.jpg',
    desc:   'Full-stack real-time messaging platform. Private 1-on-1 and group chats (up to 50 members), typing indicators, read receipts, offline message queuing, JWT auth, and paginated history. Built across 6 phases with comprehensive test suites.',
    tech:   ['Node.js', 'Socket.IO', 'Express', 'JWT', 'React', 'SQLite'],
    github: 'https://github.com/kunmmi/whisper',
    live:   'https://whisper-chat-flow.vercel.app/',
    badge:  '💬 Real-time',
  },
  {
    title:  'FarmSquare Connect',
    image:  'assets/farmsquare-thumb.jpg',
    desc:   'An agricultural marketplace platform connecting farmers, buyers, and agents in one place. Features product listings, agent coordination, and Paystack-powered payments for secure in-app transactions.',
    tech:   ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Paystack'],
    github: '',
    live:   'https://farmsquare-connect-main.vercel.app/',
    badge:  '🌿 AgriTech',
  },
  {
    title:  'AlgoTrading with Ighodalo',
    image:  'assets/algotrading-thumb.jpg',
    desc:   'Professional algorithmic trading platform built for Expert Advisors on MetaTrader 5. Automates trading strategies with secure EA delivery and client management. Led as Senior Developer — architected the product, defined standards, and oversaw delivery.',
    tech:   ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'MetaTrader 5'],
    github: '',
    live:   'https://www.algotradingwithighodalo.xyz/',
    badge:  '📈 Consulting',
  },
  {
    title:  'Online Store',
    image:  'assets/online-store-thumb.jpg',
    desc:   'Full-stack e-commerce platform with a FastAPI backend. Product catalog, JWT-secured auth, shopping cart, and order management. SQLAlchemy ORM, Pydantic validation, and a React + TypeScript frontend.',
    tech:   ['Python', 'FastAPI', 'SQLAlchemy', 'JWT', 'React', 'TypeScript'],
    github: 'https://github.com/kunmmi/Online-store',
    live:   'https://online-store-sage-delta.vercel.app',
    badge:  '🛒 Full-stack',
  },
  {
    title:  'Student ID Card Tracker',
    image:  'assets/student-id-thumb.jpg',
    desc:   'Built during my internship at ITMS, University of Ibadan. A Flask system managing the full lifecycle of student ID card production — tracking per-student status (pending → ready → collected) with student lookup, bulk CSV/Excel upload, and admin workflows for 10,000+ students.',
    tech:   ['Python', 'Flask', 'SQLAlchemy', 'SQLite', 'Flask-Login', 'Pandas'],
    github: 'https://github.com/kunmmi/Student-id-card-status-tracker',
    live:   'https://student-id-tracker.vercel.app',
    badge:  '🎓 Institutional',
  },
  {
    title:  'Base ETH Token Scanner',
    desc:   'A production-ready Telegram bot for Web3 communities on the Base/Ethereum chain. Automates token scanning, DeFi analytics (liquidity, tax analysis), command handling, and push notifications. Deployed on Render with health checks.',
    tech:   ['Python', 'Telegram Bot API', 'Web3.py', 'Ethereum/Base', 'Render'],
    github: 'https://github.com/kunmmi/Base-eth-token-scanner',
    live:   '',
    badge:  '🔗 Web3',
    code: `async def scan_token(update, ctx):
    address = ctx.args[0]
    token = await get_token_info(address)
    liquidity = await check_liquidity(address)
    tax = await analyse_tax(address)

    await update.message.reply_text(
        f"🔍 {token.name} ({token.symbol})\\n"
        f"💧 Liquidity: \${liquidity:,.0f}\\n"
        f"📊 Tax: Buy {tax.buy}% / Sell {tax.sell}%"
    )`,
  },
  {
    title:  'Invoice Automation System',
    desc:   'A GitHub Actions workflow that auto-generates monthly invoices for contractors via the Monday.com API. Runs the 1st of every month at 05:00 UTC — retrieves active contractors, generates invoice entries, prevents duplicates, and auto-populates status and due dates.',
    tech:   ['TypeScript', 'GitHub Actions', 'Monday.com API', 'Cron Schedule'],
    github: 'https://github.com/kunmmi/ccc-invoice-automation',
    live:   '',
    badge:  '⚙️ Automation',
    code: `export async function generateInvoices() {
  const contractors = await getActiveContractors();
  const dueDate = getNextMonthFirst();

  for (const c of contractors) {
    const exists = await checkDuplicate(c.id, dueDate);
    if (exists) continue; // prevent double-billing

    await MondayClient.createInvoice({
      contractor: c.name, amount: c.rate,
      due: dueDate, status: 'Pending'
    });
  }
}`,
  },
];

// ── Render project grid ────────────────────────
const grid = document.getElementById('projectGrid');

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

PROJECTS.forEach((proj, i) => {
  const card = document.createElement('article');
  card.className = 'project-card reveal';
  if (i % 2 === 1) card.classList.add('project-card--offset');

  const media = proj.image
    ? `<img src="${esc(proj.image)}" alt="${esc(proj.title)} screenshot" loading="lazy" />`
    : `<div class="project-card-code"><pre>${esc(proj.code || '')}</pre></div>`;

  card.innerHTML = `
    <div class="project-card-media">${media}</div>
    <div class="project-card-body">
      <div class="project-card-top">
        <h3>${esc(proj.title)}</h3>
        <span class="project-card-badge">${esc(proj.badge)}</span>
      </div>
      <div class="chip-row">${proj.tech.map(t => `<span class="chip chip-sm">${esc(t)}</span>`).join('')}</div>
    </div>
  `;

  card.addEventListener('click', () => openModal(proj));
  grid.appendChild(card);
  io.observe(card);
});

// ── Project modal ──────────────────────────────
const modal        = document.getElementById('projectModal');
const modalBackdrop= document.getElementById('modalBackdrop');
const modalClose   = document.getElementById('modalClose');
const modalMedia   = document.getElementById('modalMedia');
const modalTitle   = document.getElementById('modalTitle');
const modalBadge   = document.getElementById('modalBadge');
const modalDesc    = document.getElementById('modalDesc');
const modalTech    = document.getElementById('modalTech');
const modalActions = document.getElementById('modalActions');

function openModal(proj) {
  modalMedia.innerHTML = proj.image
    ? `<img src="${esc(proj.image)}" alt="${esc(proj.title)} screenshot" />`
    : `<div class="project-card-code project-card-code--modal"><pre>${esc(proj.code || '')}</pre></div>`;

  modalTitle.textContent = proj.title;
  modalBadge.textContent = proj.badge || '';
  modalDesc.textContent  = proj.desc;
  modalTech.innerHTML    = proj.tech.map(t => `<span class="chip chip-sm">${esc(t)}</span>`).join('');

  let actions = '';
  if (proj.github) actions += `<a href="${esc(proj.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fab fa-github"></i> Code</a>`;
  if (proj.live)   actions += `<a href="${esc(proj.live)}" target="_blank" rel="noopener" class="btn btn-solid btn-sm"><i class="fas fa-external-link-alt"></i> Live site</a>`;
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
