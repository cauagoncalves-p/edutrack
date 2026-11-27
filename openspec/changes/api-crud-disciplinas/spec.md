# subjects-api Specification

## Purpose
Define authenticated CRUD endpoints for the subjects resource.

## ADDED Requirements

### Requirement: Manage user-scoped subjects via REST API
The system SHALL provide GET, POST, PATCH, and DELETE endpoints for `/subjects` requiring authentication and filtering all operations by `user_id == auth.id`.

#### Scenario: Authenticated user retrieves subjects
- **WHEN** user sends GET `/subjects`
- **THEN** system returns only subjects where `user_id` matches `auth.id`

#### Scenario: Authenticated user modifies or deletes a subject
- **WHEN** user sends PATCH or DELETE `/subjects/{id}`
- **THEN** system verifies ownership (`user_id == auth.id`) before applying changes