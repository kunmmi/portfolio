from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 HRFlowable, Table, TableStyle, KeepTogether)

# ── Palette (matches kunmisportfolio.xyz: charcoal + moss green) ──
DARK   = HexColor('#12151a')
ACC    = HexColor('#7c9473')
ACC_L  = HexColor('#eef1ec')
ACC_D  = HexColor('#0d0f12')
MID    = HexColor('#2b2f33')
MUTED  = HexColor('#6b7178')
LGRAY  = HexColor('#e3e5e2')

PAGE_W, PAGE_H = A4
LM = RM = 0.55 * inch
TM = 0.38 * inch
BM = 0.42 * inch
CW = PAGE_W - LM - RM   # usable content width ≈ 511 pt

# ── Styles ────────────────────────────────────────────────
def ps(name, **kw):
    return ParagraphStyle(name, **kw)

ST = {
    # ── Header (dark bg) ──
    'name':    ps('name',    fontName='Helvetica-Bold',    fontSize=22,  leading=26,  textColor=HexColor('#e7e9ea')),
    'tag':     ps('tag',     fontName='Helvetica',          fontSize=8.5, leading=12,  textColor=HexColor('#9fb894')),
    'contact': ps('contact', fontName='Helvetica',          fontSize=8,   leading=13,  textColor=HexColor('#c7ccc8'), alignment=TA_RIGHT),
    # ── Section label ──
    'sec':     ps('sec',     fontName='Helvetica-Bold',    fontSize=7.5, leading=10,  textColor=ACC),
    # ── Body ──
    'role':    ps('role',    fontName='Helvetica-Bold',    fontSize=10,  leading=12,  textColor=DARK, spaceBefore=6, spaceAfter=1),
    'co':      ps('co',      fontName='Helvetica',          fontSize=8.5, leading=11,  textColor=MUTED, spaceAfter=2),
    'bul':     ps('bul',     fontName='Helvetica',          fontSize=9,   leading=12.5,textColor=MID,   leftIndent=12, firstLineIndent=-10, spaceAfter=1),
    'body':    ps('body',    fontName='Helvetica',          fontSize=9,   leading=13,  textColor=MID,   spaceAfter=3, alignment=TA_JUSTIFY),
    'proj_t':  ps('proj_t',  fontName='Helvetica-Bold',    fontSize=9.5, leading=12,  textColor=DARK,  spaceBefore=5, spaceAfter=1),
    'proj_s':  ps('proj_s',  fontName='Helvetica-Oblique', fontSize=8.5, leading=11,  textColor=MUTED, spaceAfter=1),
    'sk_h':    ps('sk_h',    fontName='Helvetica-Bold',    fontSize=8.5, leading=12,  textColor=MID),
    'sk_v':    ps('sk_v',    fontName='Helvetica',          fontSize=8.5, leading=12,  textColor=MID),
}

# ── Section header block ──────────────────────────────────
def sec(title):
    tbl = Table([[Paragraph(title.upper(), ST['sec'])]], colWidths=[CW])
    tbl.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), ACC_L),
        ('LEFTPADDING',  (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING',   (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 5),
        ('LINEBELOW',    (0, 0), (-1, -1), 1.2, ACC),
    ]))
    return [Spacer(1, 8), tbl, Spacer(1, 5)]

# ── Bullet ──────────────────────────────────────────────
def bul(text):
    return Paragraph(
        '<bullet bulletIndent="-10" bulletFontName="Helvetica" '
        'bulletFontSize="9.5" bulletColor="#7c9473">&#x2022;</bullet> ' + text,
        ST['bul']
    )

# ── Page decoration (left strip + footer) ────────────────
def draw_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    # Left accent strip
    canvas.setFillColor(ACC)
    canvas.rect(0, 0, 4.5, h, fill=1, stroke=0)
    # Footer rule + text
    canvas.setStrokeColor(LGRAY)
    canvas.setLineWidth(0.5)
    canvas.line(LM, 0.30 * inch, w - RM, 0.30 * inch)
    canvas.setFont('Helvetica', 6.5)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(
        w / 2, 0.17 * inch,
        'Oluwabukunmi Odukoya  ·  bukunmiodukoya@gmail.com  ·  +234 707 339 4962  ·  github.com/kunmmi'
    )
    canvas.restoreState()

# ── Story ─────────────────────────────────────────────────
story = []

# ── Header card ───────────────────────────────────────────
L_COL = 4.15 * inch
R_COL = CW - L_COL

hdr = Table(
    [[
        [
            Paragraph('Oluwabukunmi Odukoya', ST['name']),
            Spacer(1, 5),
            Paragraph(
                'Backend Engineer &nbsp;·&nbsp; Solidity &nbsp;·&nbsp; ERC-4337 &nbsp;·&nbsp; TypeScript &nbsp;·&nbsp; BNB Smart Chain',
                ST['tag']
            ),
        ],
        Paragraph(
            'bukunmiodukoya@gmail.com<br/>'
            '+234 707 339 4962<br/>'
            'github.com/kunmmi<br/>'
            'linkedin.com/in/oluwabukunmi-odukoya',
            ST['contact']
        ),
    ]],
    colWidths=[L_COL, R_COL]
)
hdr.setStyle(TableStyle([
    ('BACKGROUND',   (0, 0), (-1, -1), ACC_D),
    ('VALIGN',       (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING',  (0, 0), (-1, -1), 12),
    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ('TOPPADDING',   (0, 0), (-1, -1), 14),
    ('BOTTOMPADDING',(0, 0), (-1, -1), 14),
    ('LINEBELOW',    (0, 0), (-1, -1), 3, ACC),
]))
story.append(hdr)

# ── Summary ───────────────────────────────────────────────
story += sec('Professional Summary')
story.append(Paragraph(
    'Backend engineer with 4+ years shipping production APIs and blockchain systems, now '
    'focused on <b>Solidity</b> and <b>ERC-4337 account abstraction</b> on <b>BNB Smart '
    'Chain</b>. Built a custom on-chain policy layer (<b>BreakerRegistry</b> + a Kernel v3 '
    'module) enforcing per-trade, daily, and drawdown caps at the account-contract level, '
    'plus a PancakeSwap v3 venue layer with TWAP-based pricing guards against pool '
    'manipulation. Backend core in <b>Python (Django, FastAPI)</b> and <b>TypeScript</b>, '
    'with prior experience leading code reviews, defining architectural standards, and '
    'mentoring engineers. Seeking a remote backend or smart-contract engineering role.',
    ST['body']
))

# ── Experience ────────────────────────────────────────────
story += sec('Experience')

story.append(KeepTogether([
    Paragraph('Senior Developer', ST['role']),
    Paragraph('Ighodalo Labs  |  Lagos, Nigeria  |  December 2025 &ndash; Present', ST['co']),
    bul('Established Git workflow standards across the engineering team (feature branches, PR reviews, merge policies), reducing integration conflicts and improving release cadence.'),
    bul('Architected strict dev/production environment separation for all internal projects, eliminating a whole class of deployment-related bugs.'),
    bul('Led weekly code reviews and introduced Trello-based sprint tracking, improving ticket completion rates and team accountability.'),
    bul('Mentored junior developers on backend architecture, REST API design, and Python best practices, reducing onboarding time significantly.'),
    bul('Refactored core backend modules across ongoing projects, reducing technical debt and increasing test coverage.'),
]))

story.append(KeepTogether([
    Paragraph('Backend Developer', ST['role']),
    Paragraph('Panda Tech  |  Remote  |  July 2025 &ndash; December 2025', ST['co']),
    bul('Designed and shipped scalable REST APIs powering the core product, improving response performance through query optimisation and strategic caching.'),
    bul('Built blockchain integrations &mdash; token analytics, wallet event processing, and on-chain data pipelines &mdash; enabling real-time crypto features for end users.'),
    bul('Leveraged cloud infrastructure to improve system availability and support horizontal scaling under load.'),
    bul('Conducted regular code reviews, maintaining quality standards and supporting smooth onboarding of new team members.'),
]))

story.append(KeepTogether([
    Paragraph('Technical Consultant', ST['role']),
    Paragraph('FarmSquare  |  Remote  |  December 2025 &ndash; January 2026', ST['co']),
    bul('Served as technical consultant on an agricultural marketplace platform connecting farmers, buyers, and agents across Nigeria.'),
    bul('Advised on product architecture, reviewed implementation decisions, and ensured delivery met production standards.'),
    bul('Coordinated Paystack payment integration and provided guidance on platform scalability and deployment.'),
]))

story.append(KeepTogether([
    Paragraph('Technical Consultant &amp; Senior Developer', ST['role']),
    Paragraph('AlgoTrading with Ighodalo  |  Remote  |  January 2026 &ndash; March 2026', ST['co']),
    bul('Led the architecture and delivery of a professional algorithmic trading platform for MetaTrader 5 Expert Advisors.'),
    bul('Defined engineering standards, reviewed all implementation, and oversaw a junior developer\'s delivery end-to-end.'),
    bul('Ensured secure EA packaging, client management workflows, and a smooth production deployment on a custom domain.'),
]))

story.append(KeepTogether([
    Paragraph('Backend Developer', ST['role']),
    Paragraph('ITMS, University of Ibadan  |  Ibadan, Nigeria  |  September 2024 &ndash; May 2025', ST['co']),
    bul('Designed and built a Django backend managing the full ID card production lifecycle for <b>10,000+ students</b> &mdash; tracking status from submission through to collection.'),
    bul('Implemented secure student lookup, real-time status updates, and role-based admin workflows, replacing a fully manual institutional process.'),
    bul('Enforced data consistency through ORM constraints and comprehensive input validation, ensuring accurate real-world representation.'),
    bul('Delivered a production system actively used daily by institutional staff &mdash; a real shipped product, not a tutorial.'),
]))

story.append(KeepTogether([
    Paragraph('Backend Developer', ST['role']),
    Paragraph('Renager  |  Remote  |  August 2021 &ndash; October 2022', ST['co']),
    bul('Integrated third-party APIs and payment services, expanding platform functionality and improving user engagement.'),
    bul('Applied microservices architecture patterns, improving system modularity, fault isolation, and service reliability.'),
    bul('Developed authentication and data-protection middleware, hardening the platform against common web security vulnerabilities.'),
    bul('Partnered with frontend engineers via RESTful API contracts to deliver seamless cross-stack user experiences.'),
]))

# ── Selected Projects ─────────────────────────────────────
story += sec('Selected Projects')

projects = [
    {
        'title': 'Warden &mdash; Self-Hosted Trading Agents (BNB Smart Chain)',
        'stack': 'Solidity  |  ERC-4337  |  Kernel v3.3  |  TypeScript  |  Next.js  |  Electron  |  PancakeSwap v3',
        'link':  'github.com/kunmmi/warden',
        'bullets': [
            'Port and re-architecture of an upstream trading-agent project onto BNB Smart Chain. Built the PancakeSwap v3 venue layer, a 15-minute TWAP valuation model with pool-depth and price-divergence guards, and the on-chain token registry.',
            'Designed BreakerRegistry + KernelBreakerPolicy, a custom Kernel v3 module (type 5) that enforces per-trade, daily, and drawdown caps at the account-contract level &mdash; caps hold even if the off-chain agent is fully compromised.',
        ]
    },
    {
        'title': 'Token Launch Intelligence',
        'stack': 'TypeScript  |  Multi-Venue On-Chain Execution  |  Pump.fun  |  Pons  |  Flap',
        'link':  'github.com/kunmmi/token-launch-intel',
        'bullets': [
            'Real-time, multi-venue token-launch intelligence platform with actual on-chain launch execution (not just monitoring) across Pump.fun, Pons, and Flap.',
        ]
    },
    {
        'title': 'Predict Market',
        'stack': 'TypeScript  |  Next.js  |  PostgreSQL  |  Supabase  |  GitHub Actions  |  Vercel',
        'link':  'predict-market-xi.vercel.app   |   github.com/kunmmi/Predict-market',
        'bullets': [
            'Crypto prediction market MVP with binary yes/no trading, in-app wallets, and a full referral/commission system for promoters.',
            'Implemented Row-Level Security in Supabase, cron-job market settlement, and real-time balance tracking with end-to-end TypeScript type safety.',
        ]
    },
    {
        'title': 'FarmSquare Connect',
        'stack': 'AgriTech  |  Paystack  |  REST API  |  Vercel',
        'link':  'farmsquare-connect-main.vercel.app',
        'bullets': [
            'Agricultural marketplace platform connecting farmers, buyers, and agents across Nigeria &mdash; consulted as Technical Lead on architecture and delivery.',
            'Advised on Paystack payment integration, product architecture decisions, and ensured the platform met production standards before launch.',
        ]
    },
    {
        'title': 'AlgoTrading with Ighodalo',
        'stack': 'MetaTrader 5  |  Expert Advisors  |  Python  |  Custom Domain',
        'link':  'algotradingwithighodalo.xyz',
        'bullets': [
            'Professional algorithmic trading platform for MT5 Expert Advisors &mdash; led as Senior Developer, overseeing a junior developer\'s end-to-end implementation.',
            'Defined engineering standards, managed secure EA packaging and client delivery workflows, and oversaw production deployment to a custom domain.',
        ]
    },
    {
        'title': 'Whisper &mdash; Real-time Chat Platform',
        'stack': 'Node.js  |  Socket.IO  |  Express  |  JWT / bcrypt  |  React  |  SQLite',
        'link':  'whisper-chat-flow.vercel.app   |   github.com/kunmmi/whisper',
        'bullets': [
            'Full-stack messaging platform with WebSocket delivery, group chats (50 members), typing indicators, read receipts, and offline message queuing.',
            'Architected across 6 development phases with JWT auth, paginated message history, and a comprehensive test suite.',
        ]
    },
    {
        'title': 'Invoice Automation System',
        'stack': 'TypeScript  |  GitHub Actions  |  Monday.com API  |  Cron Schedule',
        'link':  'github.com/kunmmi/ccc-invoice-automation',
        'bullets': [
            'GitHub Actions workflow auto-generating monthly contractor invoices via Monday.com API, running the 1st of every month at 05:00 UTC.',
            'Prevents duplicate billing and auto-populates status, due dates, and service classification &mdash; zero manual intervention required.',
        ]
    },
]

for p in projects:
    story.append(KeepTogether([
        Paragraph(p['title'], ST['proj_t']),
        Paragraph(p['stack'], ST['proj_s']),
        Paragraph('<i>' + p['link'] + '</i>', ST['proj_s']),
        *[bul(b) for b in p['bullets']],
    ]))

# ── Education ─────────────────────────────────────────────
story += sec('Education')
story.append(Paragraph('Bachelor of Science in Computer Science', ST['role']))
story.append(Paragraph('University of Ibadan, Ibadan, Nigeria  |  2020 &ndash; 2025', ST['co']))

# ── Technical Skills ──────────────────────────────────────
story += sec('Technical Skills')

skill_rows = [
    ('Languages',         'Python  |  TypeScript  |  JavaScript  |  SQL  |  Bash'),
    ('Frameworks',        'Django  |  FastAPI  |  Node.js  |  Express  |  Next.js  |  React  |  SQLAlchemy  |  Socket.IO'),
    ('Databases',         'PostgreSQL  |  MySQL  |  SQLite  |  Supabase (Row-Level Security)'),
    ('Blockchain / Web3', 'Solidity  |  ERC-4337 Account Abstraction  |  BNB Smart Chain  |  Ethereum  |  Hyperledger  |  Web3.py  |  EVM  |  DeFi Protocols'),
    ('DevOps &amp; Cloud',    'Git  |  GitHub Actions  |  Docker  |  AWS  |  Render  |  Vercel  |  Linux'),
    ('Practices',         'REST API Design  |  Code Review  |  TDD  |  Microservices  |  CI/CD  |  Agile / Scrum'),
]
for i, (label, value) in enumerate(skill_rows):
    bg = ACC_L if i % 2 == 0 else HexColor('#ffffff')
    row = Table(
        [[Paragraph('<b>' + label + '</b>', ST['sk_h']), Paragraph(value, ST['sk_v'])]],
        colWidths=[1.5 * inch, CW - 1.5 * inch]
    )
    row.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), bg),
        ('VALIGN',       (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING',  (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING',   (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 3),
    ]))
    story.append(row)

# ── Build ─────────────────────────────────────────────────
doc = SimpleDocTemplate(
    'Odukoya-Oluwabukunmi-Senior-Backend-CV.pdf',
    pagesize=A4,
    leftMargin=LM, rightMargin=RM,
    topMargin=TM,  bottomMargin=BM,
)
doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
print('CV generated: Odukoya-Oluwabukunmi-Senior-Backend-CV.pdf')
