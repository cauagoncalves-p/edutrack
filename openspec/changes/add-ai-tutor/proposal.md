# Change: add-ai-tutor

## Why
Students need help understanding the subjects they are studying. An AI tutor
integrated into EduTrack AI lets them ask questions, review content, practice
with exercises and receive explanations adapted to their level, using the
context of the subjects they already registered.

## What Changes
- Add `tutor_conversations` and `tutor_messages` tables to store chat history
- Add tutor endpoints to the Express API (create, list, read, update mode,
  delete conversations and send messages)
- Add an LLM provider adapter (Gemini, free tier) that keeps the API key
  exclusively in the backend
- Add four study modes: teacher, exercises, review and socratic
- Add usage limits (message size, per-minute and daily limits)
- Add a Tutor page to the React frontend, linked from the sidebar and from
  the tasks page of each subject

## Impact
- Two new tables in the SQL Server database
- New routes, controller, services and middleware in `edutrack-api`
- New page and components in `edutrack-front`
- New environment variables: `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` and
  usage limit settings
- New dependencies: `express-rate-limit` (backend) and `react-markdown` with
  a syntax highlighter (frontend)
- Existing features are not modified