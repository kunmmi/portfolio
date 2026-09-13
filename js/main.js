/* ============================================
   PORTFOLIO MAIN JS
   ============================================ */

// ── Page Loader ───────────────────────────────
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
    // Animate hero elements in after loader clears
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), 260 + i * 180);
    });
    startTyping();
  }, 1900);
});

// ── Custom Cursor ─────────────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// ── Navbar subtle background on mouse-near-top ──
// (no page scroll so we just add/remove a class on the nav at boot)
const navbar = document.getElementById('navbar');
navbar.classList.add('scrolled'); // always show subtle bg for legibility

// ── Typing Effect ─────────────────────────────
const typingLines = [
  "Building APIs that automate the tedious and power the complex.",
  "Turning Django & FastAPI into production-ready backends.",
  "Bridging Web2 and Web3 with Python and smart tooling.",
  "Shipping products fast. Shipping them right.",
  "100+ repos. Every one a lesson. Every deploy a win."
];
let lineIndex = 0, charIndex = 0, isDeleting = false;
const typingEl        = document.getElementById('typingText');
const TYPING_SPEED    = 45;
const DELETING_SPEED  = 22;
const PAUSE_TYPED     = 2400;
const PAUSE_DELETED   = 400;

function startTyping() {
  if (!typingEl) return;
  typeLoop();
}

function typeLoop() {
  const line = typingLines[lineIndex];
  if (!isDeleting) {
    typingEl.textContent = line.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === line.length) {
      isDeleting = true;
      setTimeout(typeLoop, PAUSE_TYPED);
      return;
    }
  } else {
    typingEl.textContent = line.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      lineIndex = (lineIndex + 1) % typingLines.length;
      setTimeout(typeLoop, PAUSE_DELETED);
      return;
    }
  }
  setTimeout(typeLoop, isDeleting ? DELETING_SPEED : TYPING_SPEED);
}

// ── Canvas Particle Background ────────────────
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COUNT   = 90;
  const CONNECT = 130;
  const SPEED   = 0.35;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      r:  Math.random() * 2 + 1
    }));
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.55)';
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.18 * (1 - dist / CONNECT)})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  let mx = -9999, my = -9999;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function applyMouseRepel() {
    const REPEL_R = 120, FORCE = 0.22;
    particles.forEach(p => {
      const dx   = p.x - mx;
      const dy   = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_R && dist > 0) {
        const force = (1 - dist / REPEL_R) * FORCE;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }
      }
    });
  }

  function loop() {
    update();
    applyMouseRepel();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init();
  loop();
})();

// ── Projects Overlay ──────────────────────────
const projectsOverlay = document.getElementById('projectsOverlay');
const openProjectsBtn = document.getElementById('openProjectsBtn');
const closeProjectsBtn = document.getElementById('closeProjectsBtn');

function openProjects() {
  projectsOverlay.classList.add('open');
  projectsOverlay.setAttribute('aria-hidden', 'false');
  // Position instantly on open — no slide-in from nowhere
  const track = document.getElementById('showTrack');
  if (track) track.style.transition = 'none';
  window.dispatchEvent(new Event('resize'));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (track) track.style.transition = '';
  }));
  projectsOverlay.dispatchEvent(new CustomEvent('pov:open'));
}

function closeProjects() {
  projectsOverlay.classList.remove('open');
  projectsOverlay.setAttribute('aria-hidden', 'true');
}

openProjectsBtn?.addEventListener('click', openProjects);
closeProjectsBtn?.addEventListener('click', closeProjects);

// Close on Escape (when preview modal isn't open)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const previewOpen = document.getElementById('previewModal')?.classList.contains('open');
  const contactOpen = document.getElementById('contactOverlay')?.classList.contains('open');
  if (!previewOpen && !contactOpen) closeProjects();
});

// ── Contact Overlay ───────────────────────────
const contactOverlay  = document.getElementById('contactOverlay');
const openContactBtn  = document.getElementById('openContactBtn');
const closeContactBtn = document.getElementById('closeContactBtn');
const contactBackdrop = document.getElementById('contactBackdrop');

function openContact() {
  contactOverlay.classList.add('open');
  contactOverlay.setAttribute('aria-hidden', 'false');
}

function closeContact() {
  contactOverlay.classList.remove('open');
  contactOverlay.setAttribute('aria-hidden', 'true');
}

openContactBtn?.addEventListener('click', openContact);
closeContactBtn?.addEventListener('click', closeContact);
contactBackdrop?.addEventListener('click', closeContact);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && contactOverlay?.classList.contains('open')) closeContact();
});

// ── Preview Modal ─────────────────────────────
let openPreview;

(function initPreview() {
  const modal        = document.getElementById('previewModal');
  const backdrop     = document.getElementById('previewBackdrop');
  const closeBtn     = document.getElementById('previewClose');
  const frame        = document.getElementById('previewFrame');
  const loaderEl     = document.getElementById('previewLoader');
  const detailsPanel = document.getElementById('previewDetailsPanel');
  const titleEl      = document.getElementById('previewTitle');
  const urlEl        = document.getElementById('previewUrlText');
  const githubBtn    = document.getElementById('previewGithubBtn');
  const liveBtn      = document.getElementById('previewLiveBtn');

  openPreview = function(card) {
    const title  = card.dataset.title  || 'Project';
    const github = card.dataset.github || '#';
    const live   = card.dataset.live   || '';
    const tech   = card.dataset.tech   ? card.dataset.tech.split(',') : [];
    const desc   = card.dataset.desc   || '';

    titleEl.textContent = title;
    githubBtn.href      = github;

    if (live) {
      urlEl.textContent          = live.replace('https://', '');
      liveBtn.href               = live;
      liveBtn.style.display      = 'inline-flex';
      frame.style.display        = 'block';
      detailsPanel.style.display = 'none';
      loaderEl.style.display     = 'flex';
      frame.onload = () => { loaderEl.style.display = 'none'; };
      frame.src    = live;
    } else {
      urlEl.textContent          = github.replace('https://', '');
      liveBtn.style.display      = 'none';
      frame.style.display        = 'none';
      loaderEl.style.display     = 'none';
      detailsPanel.style.display = 'flex';
      frame.src                  = 'about:blank';
      populateDetails(title, desc, tech, github);
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  function populateDetails(title, desc, tech, github) {
    const techTags = tech.map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');
    detailsPanel.innerHTML = `
      <div class="pdp-terminal terminal-window">
        <div class="terminal-header">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
          <span class="terminal-title">${github.replace('https://github.com/', 'github.com/')}</span>
        </div>
        <div class="terminal-body">
          <div class="terminal-line">
            <span class="terminal-prompt">$ </span><span class="terminal-cmd">cat README.md</span>
          </div>
          <div class="terminal-output" style="margin-bottom:16px;">
            <p class="t-white" style="line-height:1.8;">${desc}</p>
          </div>
          <div class="terminal-line">
            <span class="terminal-prompt">$ </span><span class="terminal-cmd">cat package.json | grep dependencies</span>
          </div>
          <div class="terminal-output">
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">${techTags}</div>
          </div>
          <div class="terminal-line" style="margin-top:16px;">
            <span class="terminal-prompt">$ </span><span class="terminal-cmd">git log --oneline -1</span>
          </div>
          <div class="terminal-output">
            <p class="t-green">✔ This is a backend project — the magic is in the code.</p>
          </div>
        </div>
      </div>
      <div class="pdp-cta">
        <a href="${github}" target="_blank" rel="noopener" class="btn-primary-sm">
          <i class="fab fa-github"></i>&nbsp;View Full Source on GitHub
        </a>
        <button onclick="document.getElementById('previewModal').classList.remove('open');document.getElementById('previewModal').setAttribute('aria-hidden','true');"
          class="btn-ghost-sm">
          <i class="fas fa-times"></i>&nbsp;Close
        </button>
      </div>
    `;
  }

  function closePreview() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { frame.src = 'about:blank'; }, 350);
  }

  closeBtn.addEventListener('click', closePreview);
  backdrop.addEventListener('click', closePreview);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closePreview();
  });
})();

// ── Projects Showcase Carousel ─────────────────
(function initShowcase() {

  const PROJECTS = [
    {
      title:  'Warden — Trustless Trading Agents',
      image:  'assets/warden-thumb.jpg',
      desc:   'A self-hosted autonomous trading agent for BNB Smart Chain — your keys never leave your machine, and every cap (per-trade, daily, ops/day, drawdown, key expiry) is enforced on-chain by an ERC-4337 account contract, not by promises. The agent proposes trades against a curated PancakeSwap v3 basket; deterministic policy code disposes — no model can ever construct calldata or move funds outside the wall. Ships with a live local dashboard, a "prove the wall" attack simulator, paper-trading mode against real prices, and full Telegram control (chat, alerts, even remote PC control) inside the same permission system.',
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
      embedBlocked: true,
    },
    {
      title:  'FarmSquare Connect',
      desc:   'An agricultural marketplace platform connecting farmers, buyers, and agents in one place. Features product listings, agent coordination, and Paystack-powered payments for secure in-app transactions.',
      tech:   ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Paystack'],
      github: '',
      live:   'https://farmsquare-connect-main.vercel.app/',
      badge:  '🌿 AgriTech',
    },
    {
      title:  'AlgoTrading with Ighodalo',
      desc:   'Professional algorithmic trading platform built for Expert Advisors on MetaTrader 5. Automates trading strategies with secure EA delivery and client management. Led as Senior Developer — architected the product, defined standards, and oversaw delivery.',
      tech:   ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'MetaTrader 5'],
      github: '',
      live:   'https://www.algotradingwithighodalo.xyz/',
      badge:  '📈 Consulting',
    },
    {
      title:  'Whisper — Real-time Chat',
      desc:   'Full-stack real-time messaging platform. Private 1-on-1 and group chats (up to 50 members), typing indicators, read receipts, offline message queuing, JWT auth, and paginated history. Built across 6 phases with comprehensive test suites.',
      tech:   ['Node.js', 'Socket.IO', 'Express', 'JWT', 'React', 'SQLite'],
      github: 'https://github.com/kunmmi/whisper',
      live:   'https://whisper-chat-flow.vercel.app/',
      badge:  '💬 Real-time',
    },
    {
      title:  'Online Store',
      desc:   'Full-stack e-commerce platform with a FastAPI backend. Product catalog, JWT-secured auth, shopping cart, and order management. SQLAlchemy ORM, Pydantic validation, and a React + TypeScript frontend.',
      tech:   ['Python', 'FastAPI', 'SQLAlchemy', 'JWT', 'React', 'TypeScript'],
      github: 'https://github.com/kunmmi/Online-store',
      live:   'https://online-store-sage-delta.vercel.app',
      badge:  '🛒 Full-stack',
    },
    {
      title:  'Student ID Card Tracker',
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
      snippet: {
        file: 'scanner/token_analysis.py',
        lines: [
          { t: 'from web3 import Web3', c: 'cl-kw' },
          { t: 'from telegram import Update', c: 'cl-kw' },
          { t: '', c: '' },
          { t: 'async def scan_token(update: Update, ctx):', c: 'cl-fn' },
          { t: "    address = ctx.args[0]", c: '' },
          { t: '    token = await get_token_info(address)', c: 'cl-fn' },
          { t: '    liquidity = await check_liquidity(address)', c: 'cl-fn' },
          { t: '    tax = await analyse_tax(address)', c: 'cl-fn' },
          { t: '', c: '' },
          { t: '    await update.message.reply_text(', c: 'cl-fn' },
          { t: '        f"🔍 {token.name} ({token.symbol})\\n"', c: 'cl-st' },
          { t: '        f"💧 Liquidity: ${liquidity:,.0f}\\n"', c: 'cl-st' },
          { t: '        f"📊 Tax: Buy {tax.buy}% / Sell {tax.sell}%"', c: 'cl-st' },
          { t: '    )', c: '' },
        ]
      }
    },
    {
      title:  'Invoice Automation System',
      desc:   'A GitHub Actions workflow that auto-generates monthly invoices for contractors via the Monday.com API. Runs the 1st of every month at 05:00 UTC — retrieves active contractors, generates invoice entries, prevents duplicates, and auto-populates status and due dates.',
      tech:   ['TypeScript', 'GitHub Actions', 'Monday.com API', 'Cron Schedule'],
      github: 'https://github.com/kunmmi/ccc-invoice-automation',
      live:   '',
      badge:  '⚙️ Automation',
      snippet: {
        file: 'src/generate-invoices.ts',
        lines: [
          { t: "import { MondayClient } from './monday-client';", c: 'cl-kw' },
          { t: "import { getActiveContractors } from './contractors';", c: 'cl-kw' },
          { t: '', c: '' },
          { t: 'export async function generateInvoices(): Promise<void> {', c: 'cl-fn' },
          { t: '  const contractors = await getActiveContractors();', c: '' },
          { t: '  const dueDate = getNextMonthFirst();', c: 'cl-fn' },
          { t: '', c: '' },
          { t: '  for (const c of contractors) {', c: 'cl-kw' },
          { t: '    const exists = await checkDuplicate(c.id, dueDate);', c: 'cl-fn' },
          { t: '    if (exists) continue; // prevent double-billing', c: 'cl-cm' },
          { t: '', c: '' },
          { t: '    await MondayClient.createInvoice({', c: 'cl-fn' },
          { t: "      contractor: c.name, amount: c.rate,", c: '' },
          { t: "      due: dueDate, status: 'Pending'", c: 'cl-st' },
          { t: '    });', c: '' },
          { t: '  }', c: 'cl-kw' },
        ]
      }
    }
  ];

  const IFRAME_W = 1280;

  const track       = document.getElementById('showTrack');
  const showTitle   = document.getElementById('showTitle');
  const showDesc    = document.getElementById('showDesc');
  const showBadge   = document.getElementById('showBadge');
  const showTags    = document.getElementById('showTags');
  const showActions = document.getElementById('showActions');
  const showDots    = document.getElementById('showDots');
  const showCounter = document.getElementById('showCounter');
  const prevBtn     = document.getElementById('showPrev');
  const nextBtn     = document.getElementById('showNext');

  if (!track) return;

  let current = 0;

  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Build slides ──
  const slides = PROJECTS.map((proj, i) => {
    const slide = document.createElement('div');
    slide.className = 'show-slide';

    const card = document.createElement('div');
    card.className = 'show-card';

    const thumb = document.createElement('div');
    thumb.className = 'show-thumb';

    if (proj.image) {
      const img = document.createElement('img');
      img.src = proj.image;
      img.alt = `${proj.title} screenshot`;
      img.loading = 'lazy';
      img.className = 'thumb-img';
      thumb.appendChild(img);

      if (proj.embedBlocked) {
        const badge = document.createElement('div');
        badge.className = 'thumb-lock-badge';
        badge.innerHTML = `<i class="fas fa-lock"></i> Live preview blocked by its own <code>frame-ancestors: none</code> CSP`;
        thumb.appendChild(badge);
      }

    } else if (proj.live) {
      const iframe = document.createElement('iframe');
      iframe.dataset.src = proj.live;
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
      iframe.setAttribute('tabindex', '-1');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText = `position:absolute;top:0;left:0;width:${IFRAME_W}px;transform-origin:top left;pointer-events:none;border:none;background:#fff;filter:brightness(0.92);`;

      const loaderEl = document.createElement('div');
      loaderEl.className = 'show-thumb-loader';
      loaderEl.innerHTML = `
        <div class="stl-chrome">
          <div class="stl-dots"><span></span><span></span><span></span></div>
          <div class="stl-url-bar"></div>
        </div>
        <div class="stl-body">
          <div class="stl-hero"></div>
          <div class="stl-line w90"></div>
          <div class="stl-line w70"></div>
          <div class="stl-line w55"></div>
          <div class="stl-row">
            <div class="stl-chip"></div>
            <div class="stl-chip"></div>
            <div class="stl-chip"></div>
          </div>
          <div class="stl-line w80" style="margin-top:6px;"></div>
          <div class="stl-line w70"></div>
        </div>`;

      function scaleFrame() {
        const w = thumb.offsetWidth;
        const h = card.offsetHeight || thumb.offsetHeight;
        if (!w) return;
        const s = w / IFRAME_W;
        iframe.style.transform = `scale(${s})`;
        iframe.style.height    = `${Math.ceil(h / s)}px`;
      }

      const ro = new ResizeObserver(scaleFrame);
      ro.observe(thumb);
      thumb._lazyLoad = () => {
        if (!iframe.src && iframe.dataset.src) {
          // Attach load listener only after setting a real src — avoids
          // the immediate about:blank load event wiping the skeleton early
          iframe.addEventListener('load', () => {
            scaleFrame();
            loaderEl.classList.add('fade-out');
            setTimeout(() => loaderEl.remove(), 520);
          }, { once: true });
          iframe.src = iframe.dataset.src;
        }
        scaleFrame();
      };

      thumb.appendChild(iframe);
      thumb.appendChild(loaderEl);

    } else if (proj.snippet) {
      const snip = proj.snippet;
      const lineNums = snip.lines.map((_,j) => `<span>${j+1}</span>`).join('');
      const lineCode = snip.lines.map(l =>
        `<div class="code-ln ${l.c}">${esc(l.t) || '&nbsp;'}</div>`).join('');
      thumb.innerHTML = `
        <div class="tb-bar">
          <span class="tb-dot"></span><span class="tb-dot"></span><span class="tb-dot"></span>
          <span class="tb-url">${esc(snip.file)}</span>
        </div>
        <div class="thumb-code" style="height:calc(100% - 32px)">
          <div class="thumb-line-nums">${lineNums}</div>
          <div class="thumb-code-lines">${lineCode}</div>
        </div>`;
    }

    card.appendChild(thumb);
    slide.appendChild(card);
    track.appendChild(slide);
    return slide;
  });

  // ── Build dots ──
  const dots = PROJECTS.map((proj, i) => {
    const d = document.createElement('button');
    d.className = 'show-dot';
    d.setAttribute('aria-label', `Project ${i+1}: ${proj.title}`);
    d.addEventListener('click', () => goTo(i));
    showDots.appendChild(d);
    return d;
  });

  // ── Update meta + slide classes ──
  function updateMeta(idx) {
    const proj = PROJECTS[idx];
    showCounter.textContent = `${String(idx+1).padStart(2,'0')} / ${String(PROJECTS.length).padStart(2,'0')}`;

    if (proj.badge) {
      showBadge.textContent = proj.badge;
      showBadge.style.display = '';
    } else {
      showBadge.style.display = 'none';
    }

    showTitle.textContent = proj.title;
    showDesc.textContent  = proj.desc;
    showTags.innerHTML    = proj.tech.map(t => `<span class="tech-tag">${esc(t)}</span>`).join('');

    let links = '';
    if (proj.github) links += `<a href="${esc(proj.github)}" target="_blank" rel="noopener" class="show-link-btn"><i class="fab fa-github"></i> Code</a>`;
    if (proj.live)   links += `<a href="${esc(proj.live)}"   target="_blank" rel="noopener" class="show-link-btn show-link-live"><i class="fas fa-external-link-alt"></i> Live</a>`;
    showActions.innerHTML = links;

    const N    = PROJECTS.length;
    const prev = (idx - 1 + N) % N;
    const next = (idx + 1) % N;

    dots.forEach((d, i)  => d.classList.toggle('active', i === idx));
    slides.forEach((s, i) => {
      s.classList.toggle('active',     i === idx);
      s.classList.toggle('prev-slide', i === prev);
      s.classList.toggle('next-slide', i === next);
    });
  }

  // ── Centre active slide in viewport ──
  function applyTranslate() {
    if (!slides[0]) return;
    const slideW    = slides[0].offsetWidth;
    const gap       = parseInt(getComputedStyle(track).gap) || 16;
    const wrapW     = (track.closest('.show-wrap') || document.body).offsetWidth;
    const trackLeft = track.offsetLeft;
    const center    = Math.round(wrapW / 2 - trackLeft - slideW / 2);
    const offset    = center - current * (slideW + gap);
    track.style.transform = `translateX(${offset}px)`;
  }

  // ── Lazy-load iframe ──
  function lazyLoadSlide(idx) {
    const slide = slides[idx];
    if (!slide) return;
    const thumb = slide.querySelector('.show-thumb');
    if (thumb && typeof thumb._lazyLoad === 'function') thumb._lazyLoad();
  }

  // ── Navigate ──
  let animLock = false;
  function goTo(idx, instant = false) {
    if (animLock && !instant) return;
    animLock = true;
    setTimeout(() => { animLock = false; }, 680);

    current = ((idx % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
    applyTranslate();
    updateMeta(current);
    if (userActivated) {
      lazyLoadSlide(current);
      lazyLoadSlide((current + 1) % PROJECTS.length);
    }
  }

  // Load iframes only on first explicit interaction
  let userActivated = false;
  function activateAndLoad() {
    if (userActivated) return;
    userActivated = true;
    lazyLoadSlide(current);
    lazyLoadSlide((current + 1) % PROJECTS.length);
  }

  prevBtn?.addEventListener('click', () => { activateAndLoad(); goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { activateAndLoad(); goTo(current + 1); });

  // Arrow keys — only when projects overlay is open (and preview modal is not)
  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!projectsOverlay?.classList.contains('open')) return;
    if (document.getElementById('previewModal')?.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); activateAndLoad(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); activateAndLoad(); goTo(current + 1); }
  });

  // Touch swipe on track
  let swipeX = 0;
  track.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - swipeX;
    if (Math.abs(dx) > 48) { activateAndLoad(); dx < 0 ? goTo(current + 1) : goTo(current - 1); }
  });

  // Re-centre on resize
  window.addEventListener('resize', applyTranslate);

  // Load current + next iframe on first overlay open
  projectsOverlay?.addEventListener('pov:open', () => activateAndLoad());

  // Boot — instant, no animation on first position
  goTo(0, true);

})();

// ── Console Easter Egg ────────────────────────
console.log('%c<OO/>', 'color:#a855f7;font-family:monospace;font-size:22px;font-weight:700;');
console.log('%cBukunmi Odukoya — Backend Engineer', 'color:#94a3b8;font-family:monospace;font-size:12px;');
console.log('%cgithub.com/kunmmi', 'color:#22d3ee;font-family:monospace;font-size:12px;');
