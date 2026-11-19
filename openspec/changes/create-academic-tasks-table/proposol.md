# Change: create-academic-tasks-table

## Why
Allow students to register and manage their academic obligations (assignments, exams, projects) linked to each subject.

## What Changes
- Create `academic_tasks` table in XanoScript (`tables/academic_tasks.xs`) with fields: `title`, `description`, `due_date`, `status`, `subject_id`, and `user_id`.

## Impact
Establishes the database schema for task tracking in EduTrack AI.