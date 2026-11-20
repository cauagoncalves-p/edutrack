# Change: geracao-relatorio-pdf

## Why
Allow students to export a structured PDF report summarizing their academic progress across all enrolled subjects.

## What Changes
- Create Python script `scripts/generate_report.py` using `fpdf2` (with `try/except` error handling) to generate a formatted progress PDF.
- Create `GET /reports/generate` endpoint in XanoScript (`apis/reports/reports_generate_GET.xs`) scoped to `auth.id`.

## Impact
Provides downloadable academic performance reporting in EduTrack AI.