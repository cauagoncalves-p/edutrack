# pdf-report Specification

## Purpose
Define PDF progress report generation and download endpoint behavior.

## ADDED Requirements

### Requirement: Generate student progress PDF report
The system SHALL generate a readable PDF file listing each subject, task completion metrics, and progress percentage for the authenticated user (`auth.id`).

#### Scenario: Authenticated user requests progress report
- **WHEN** user calls GET `/reports/generate`
- **THEN** system compiles user subjects and tasks into a PDF and returns the file/download link