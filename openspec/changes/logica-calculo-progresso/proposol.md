# Change: logica-calculo-progresso

## Why
Calculate the completion percentage of academic tasks for a given subject to display progress metrics in EduTrack AI.

## What Changes
- Create Python script `scripts/calculate_progress.py` to compute `(completed / total) * 100`, handle division by zero, and return a JSON response with the `percentage` key.

## Impact
Enables automated progress tracking logic ready for backend integration.