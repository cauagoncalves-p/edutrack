# session Specification

## Purpose
Keep the user session consistent when the authentication token is no longer valid.

## ADDED Requirements

### Requirement: Clear invalid sessions
The system SHALL remove the saved session and send the user to the login page when the API rejects the token as missing, invalid or expired.

#### Scenario: Token expired
- **WHEN** an API response has status 401 with a token error message
- **THEN** the system removes the saved token and user, and redirects to `/login`

### Requirement: Preserve the session on credential errors
The system SHALL NOT clear the session for 401 responses that are not token errors.

#### Scenario: Wrong current password
- **WHEN** the API responds 401 because the current password is incorrect
- **THEN** the system keeps the session and shows the error message