# Change: api-crud-disciplinas

## Why
Provide secure RESTful CRUD endpoints for managing academic subjects so authenticated users can only access and modify their own records.

## What Changes
- Create REST API endpoints (`GET /subjects`, `POST /subjects`, `PATCH /subjects/{id}`, `DELETE /subjects/{id}`) in XanoScript enforcing `user_id == auth.id`.

## Impact
Enables full subject management for the frontend with row-level user isolation.