# subjects Specification

## Purpose
Define database structure for subjects, allowing students to register
and organize their academic disciplines.

## Requirements

### Requirement: Create subjects table
System SHALL create a `subjects` table with fields for name, teacher,
workload hours, description, start/end dates, and a reference to the
owning user.

#### Scenario: User creates a subject
- **WHEN** an authenticated user submits subject data via `POST /subjects`
- **THEN** system stores a new row in `subjects` with `user_id` set to
  the authenticated user's id

### Requirement: Subject ownership
System SHALL associate every subject with exactly one user via `user_id`,
and every read/write operation SHALL filter by that field.

#### Scenario: Subject is linked to its owner
- **WHEN** a subject is created
- **THEN** the `user_id` field references the `users` table

#### Scenario: User only sees their own subjects
- **WHEN** an authenticated user requests `GET /subjects`
- **THEN** system returns only subjects where `user_id` matches the
  authenticated user's id
