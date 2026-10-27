# tutor Specification

## Purpose
Define how the AI tutor lets students study through conversations that are
contextualized by their subjects, stored per user and protected by usage limits.

## ADDED Requirements

### Requirement: Manage tutor conversations
The system SHALL let an authenticated user create, list, continue and delete
their own tutor conversations.

#### Scenario: User starts a conversation for a subject
- **WHEN** an authenticated user creates a conversation selecting a subject and a study mode
- **THEN** the system stores the conversation with the user_id, subject_id and mode

#### Scenario: User deletes a conversation
- **WHEN** an authenticated user deletes one of their conversations
- **THEN** the system removes the conversation and all of its messages

### Requirement: Exchange messages with the AI provider
The system SHALL send the user message, the conversation history and the study
context to the AI provider and store both the question and the answer.

#### Scenario: Student asks a follow-up question
- **WHEN** a student sends a message in an existing conversation
- **THEN** the system includes the recent messages in the request, stores the AI answer and returns it

#### Scenario: API key stays in the backend
- **WHEN** the frontend sends a message
- **THEN** the AI provider credentials are read only from backend environment variables and never returned to the client

### Requirement: Use subject context
The system SHALL provide the AI with the subject name, description, teacher,
workload and task list, and SHALL NOT invent study materials that do not exist.

#### Scenario: Conversation linked to a subject
- **WHEN** a conversation is linked to a subject
- **THEN** the AI request includes that subject data as delimited context data

#### Scenario: No material available
- **WHEN** the subject has no content that answers the question
- **THEN** the AI states that it is using general knowledge

### Requirement: Provide study modes
The system SHALL support the teacher, exercises, review and socratic study
modes, each with its own instructions for the AI.

#### Scenario: Student changes the study mode
- **WHEN** a student changes the mode of a conversation
- **THEN** the next AI answer follows the instructions of the selected mode

### Requirement: Limit usage
The system SHALL limit message size, requests per minute and messages per day
for each user.

#### Scenario: Message exceeds the maximum size
- **WHEN** a user sends a message larger than the allowed size
- **THEN** the system rejects it with a clear error and does not call the AI provider

#### Scenario: Daily limit reached
- **WHEN** a user reaches the daily message limit
- **THEN** the system rejects new messages until the next day

### Requirement: Protect conversation access
The system SHALL ensure that a user can only read, update or delete their own conversations.

#### Scenario: User requests another user's conversation
- **WHEN** an authenticated user requests a conversation that belongs to another user
- **THEN** the system responds as if the conversation does not exist

### Requirement: Handle provider errors
The system SHALL translate AI provider failures into friendly error messages.

#### Scenario: Provider is unavailable
- **WHEN** the AI provider fails, times out or rejects the request due to rate limits
- **THEN** the system returns a friendly error without exposing internal details