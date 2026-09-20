# portfolio

Source for [oluwabukunmiodukoya's portfolio site](https://github.com/kunmmi/portfolio) — a static single-page site plus two Python scripts that generate the CV and cover letter PDFs served from it.

## Structure

- `index.html`, `css/style.css`, `js/main.js` — the site itself, no build step
- `build_cv.py`, `build_cover_letter.py` — generate the PDFs in the repo root using [ReportLab](https://www.reportlab.com/)
- `assets/` — project thumbnails and headshot used on the site

## Running locally

The site is static, so any static file server works:

```bash
npx serve .
```

## Regenerating the PDFs

```bash
pip install reportlab
python build_cv.py
python build_cover_letter.py
```
