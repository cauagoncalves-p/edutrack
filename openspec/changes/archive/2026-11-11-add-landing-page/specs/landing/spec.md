# landing Specification

## Purpose
Present EduTrack AI to visitors and guide them to the login page.

## ADDED Requirements

### Requirement: Show a public landing page
The system SHALL display a landing page at `/` to visitors who are not authenticated.

#### Scenario: Visitor opens the root address
- **WHEN** an unauthenticated visitor opens `/`
- **THEN** the system displays the landing page with a hero, the feature list, the "how it works" steps and a final call to action

### Requirement: Route calls to action to login
The system SHALL send every call to action of the landing page to the login page.

#### Scenario: Visitor clicks a call to action
- **WHEN** a visitor clicks "Começar" or "Criar minha conta"
- **THEN** the system navigates to `/login`

### Requirement: Skip the landing page for authenticated users
The system SHALL redirect authenticated users who open `/` to `/dashboard`.

#### Scenario: Logged-in user opens the root address
- **WHEN** an authenticated user opens `/`
- **THEN** the system redirects to `/dashboard`

### Requirement: Keep a consistent light appearance
The system SHALL render the landing page in the light theme regardless of the selected app theme.

#### Scenario: Dark theme is selected
- **WHEN** an unauthenticated visitor opens `/` while the app theme is dark
- **THEN** the landing page is displayed in the light theme with a readable logo

### Requirement: Adapt to screen size
The system SHALL adapt the landing page layout to desktop and mobile screens.

#### Scenario: Visitor uses a phone
- **WHEN** the landing page is opened on a narrow screen
- **THEN** the cards stack in one column and the header keeps only the primary button