from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

DARK   = HexColor('#0f172a')
ACC    = HexColor('#6d28d9')
ACC_D  = HexColor('#0c0618')
ACC_L  = HexColor('#ede9fe')
MID    = HexColor('#334155')
MUTED  = HexColor('#64748b')
LGRAY  = HexColor('#e2e8f0')

PAGE_W, PAGE_H = A4
LM = RM = 0.75 * inch
TM = 0.5  * inch
BM = 0.5  * inch
CW = PAGE_W - LM - RM

def ps(name, **kw):
    return ParagraphStyle(name, **kw)

ST = {
    'name':    ps('name',    fontName='Helvetica-Bold',    fontSize=18, leading=22, textColor=HexColor('#f8fafc')),
    'contact': ps('contact', fontName='Helvetica',          fontSize=8,  leading=13, textColor=HexColor('#c4b5fd'), alignment=TA_RIGHT),
    'label':   ps('label',   fontName='Helvetica-Bold',    fontSize=7.5,leading=10, textColor=ACC),
    'company': ps('company', fontName='Helvetica-Bold',    fontSize=11, leading=15, textColor=DARK, spaceBefore=4),
    'date':    ps('date',    fontName='Helvetica',          fontSize=9,  leading=13, textColor=MUTED, spaceAfter=14),
    'salute':  ps('salute',  fontName='Helvetica',          fontSize=10, leading=14, textColor=DARK, spaceAfter=10),
    'body':    ps('body',    fontName='Helvetica',          fontSize=10, leading=16, textColor=MID,  spaceAfter=10, alignment=TA_JUSTIFY),
    'sign':    ps('sign',    fontName='Helvetica-Bold',    fontSize=10, leading=14, textColor=DARK, spaceBefore=6),
    'sign_s':  ps('sign_s',  fontName='Helvetica',          fontSize=9,  leading=14, textColor=MUTED),
}

def draw_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(ACC)
    canvas.rect(0, 0, 4.5, h, fill=1, stroke=0)
    canvas.setStrokeColor(LGRAY)
    canvas.setLineWidth(0.5)
    canvas.line(LM, 0.32*inch, w - RM, 0.32*inch)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(w/2, 0.18*inch,
        'Oluwabukunmi Odukoya  ·  bukunmiodukoya@gmail.com  ·  +234 707 339 4962  ·  kunmisportfolio.xyz')
    canvas.restoreState()

story = []

# ── Header card ───────────────────────────────────────────
L_COL = 3.8 * inch
R_COL = CW - L_COL

hdr = Table(
    [[
        Paragraph('Oluwabukunmi Odukoya', ST['name']),
        Paragraph(
            'bukunmiodukoya@gmail.com<br/>'
            '+234 707 339 4962<br/>'
            'kunmisportfolio.xyz<br/>'
            'linkedin.com/in/oluwabukunmi-odukoya',
            ST['contact']
        ),
    ]],
    colWidths=[L_COL, R_COL]
)
hdr.setStyle(TableStyle([
    ('BACKGROUND',   (0,0), (-1,-1), ACC_D),
    ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING',  (0,0), (-1,-1), 12),
    ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ('TOPPADDING',   (0,0), (-1,-1), 14),
    ('BOTTOMPADDING',(0,0), (-1,-1), 14),
    ('LINEBELOW',    (0,0), (-1,-1), 3, ACC),
]))
story.append(hdr)
story.append(Spacer(1, 18))

# ── Addressee ─────────────────────────────────────────────
story.append(Paragraph('AxisCare', ST['company']))
story.append(Paragraph('June 2026', ST['date']))
story.append(Paragraph('Dear Hiring Team,', ST['salute']))

# ── Body ──────────────────────────────────────────────────
paragraphs = [
    'The most honest answer I can give to your first question is: I built a crypto prediction '
    'market, and AI was deeply woven into how I got it done.',

    'The product — Predict Market — lets users trade binary yes/no positions on crypto outcomes. '
    'In-app wallets, a referral system, real-time balance tracking, market settlement via cron '
    'jobs. Full TypeScript, Next.js, Supabase with Row-Level Security. The kind of system that '
    'has a dozen places where the wrong decision buries you quietly.',

    'I used AI tools throughout — primarily Claude — not as a code generator I pasted from, but '
    'as a technical collaborator I interrogated. Where it genuinely shone: Supabase\'s RLS policy '
    'syntax is dense and the error messages are almost deliberately unhelpful. AI dramatically '
    'shortened the loop between "something is wrong with my policy" and "here\'s exactly why." '
    'Same with cron-job settlement logic — I described the edge cases I was worried about (race '
    'conditions, duplicate settlements, clock drift) and the back-and-forth forced me to '
    'articulate assumptions I hadn\'t written down. That\'s genuinely useful.',

    'Where it fell short: anything that required understanding the full system at once. When I '
    'asked for help with wallet balance consistency across concurrent transactions, I got '
    'technically correct answers that missed the actual constraint — that Supabase\'s realtime '
    'subscriptions and RLS interact in a specific way in my setup. The model didn\'t know what it '
    'didn\'t know about my architecture, and neither did I until I\'d read the output carefully, '
    'pushed back, and debugged it myself. It confidently suggested an approach I had to throw away.',

    'What I learned about my role: the work didn\'t get smaller — it shifted. Less time on syntax '
    'and boilerplate, more time on judgment. Deciding which suggestions to trust, which to test, '
    'which to bin. You still have to hold the full system in your head. You still have to know '
    'what "correct" looks like to recognise when the tool is wrong. If anything, AI surfaces how '
    'much of good engineering is taste and context that doesn\'t fit in a prompt.',

    'That\'s why AxisCare is where I want to be right now. You\'re not dabbling in AI — you just '
    'shipped AxisCare Intelligence: scheduling recommendations, care analytics, an AI assistant, '
    'all embedded into live workflows, HIPAA-ready, built on AWS Bedrock. That\'s a team that '
    'understands the difference between bolting on a chatbot and actually integrating intelligence '
    'into a domain where the stakes are real people\'s care. Home care operations aren\'t '
    'forgiving. Bad scheduling logic doesn\'t just cause bugs — it leaves someone without a '
    'caregiver. That constraint is exactly the kind of thing that makes backend engineering '
    'interesting, and AI augmentation meaningful rather than cosmetic. I want to be building in '
    'that environment, with engineers who are thinking carefully about what these tools are '
    'actually good for.',
]

for p in paragraphs:
    story.append(Paragraph(p, ST['body']))

# ── Sign-off ──────────────────────────────────────────────
story.append(Spacer(1, 6))
story.append(Paragraph('Sincerely,', ST['sign_s']))
story.append(Spacer(1, 4))
story.append(Paragraph('Oluwabukunmi Odukoya', ST['sign']))
story.append(Paragraph('bukunmiodukoya@gmail.com  ·  +234 707 339 4962  ·  kunmisportfolio.xyz', ST['sign_s']))

# ── Build ─────────────────────────────────────────────────
doc = SimpleDocTemplate(
    'Oluwabukunmi-Odukoya-Cover-Letter-AxisCare.pdf',
    pagesize=A4,
    leftMargin=LM, rightMargin=RM,
    topMargin=TM,  bottomMargin=BM,
)
doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
print('Cover letter generated: Oluwabukunmi-Odukoya-Cover-Letter-AxisCare.pdf')
