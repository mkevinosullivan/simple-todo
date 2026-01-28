# Epic 2 Details: WIP Limits & Behavioral Tracking

**Epic Goal:** Implement the constraint-based productivity mechanism through WIP
(Work In Progress) limit enforcement with encouraging, helpful messaging.
Establish comprehensive metadata calculation infrastructure that provides access
to task metadata (timestamps, text characteristics, lifetime duration) to serve
as the foundation for all future intelligent features. By the end of this epic,
users experience the proven psychological benefit of manageable task counts, and
the system provides rich behavioral data through computed properties.

## Story 2.1: Task Metadata Calculation Infrastructure

**As a** developer, **I want** task metadata calculation infrastructure
established through helper functions, **so that** we have the computational
foundation needed for WIP limits, analytics, and future intelligent features
without extending the stored data model.

**Acceptance Criteria:**

1. TaskHelpers utility includes `getTextLength(text: string): number` function
   that calculates character count from task text
2. TaskHelpers utility includes
   `getDuration(createdAt: string, completedAt: string | null): number | null`
   function that calculates milliseconds from creation to completion (returns
   null if not completed)
3. `createdAt` and `completedAt` timestamp fields verified as ISO 8601 strings
   in documentation (existing fields, no changes to Task interface)
4. Timestamp validation helper function created to ensure ISO 8601 format
   compliance
5. Shared TaskHelpers utilities exported from `@simple-todo/shared/utils` for
   use across frontend and backend
6. Unit tests verify metadata calculations: `getTextLength()` returns correct
   character count, `getDuration()` calculates correct milliseconds, handles
   null for active tasks
7. Documentation updated showing complete TaskHelpers utility suite with usage
   examples and clarifying these are computed properties, not stored fields

## Story 2.2: WIP Limit Service - Business Logic

**As a** developer, **I want** a WIPLimitService that enforces configurable task
limits and provides helpful messaging, **so that** the constraint mechanism is
centralized and testable independently of UI or API.

**Acceptance Criteria:**

1. WIPLimitService class created with methods: `canAddTask()`,
   `getCurrentWIPCount()`, `getWIPLimit()`, `setWIPLimit(limit)`,
   `getWIPLimitMessage()`
2. WIP limit stored in configuration file or user preferences (JSON file at
   `./data/config.json`)
3. Default WIP limit set to 7 (middle of 5-10 range from PRD)
4. `canAddTask()` returns boolean: true if current active task count < WIP
   limit, false otherwise
5. `getCurrentWIPCount()` queries TaskService for count of tasks with status
   'active'
6. `setWIPLimit(limit)` validates input is between 5-10 (inclusive) and persists
   to config file
7. `getWIPLimitMessage()` returns encouraging message like "You have [N] active
   tasks - complete one before adding more to maintain focus!"
8. Service integrates with TaskService to check count before allowing task
   creation
9. Unit tests verify: limit enforcement at exact threshold, helpful messages
   generated, validation of limit range
10. Configuration persistence: WIP limit survives app restarts by reading from
    config.json

## Story 2.3: API Endpoints for WIP Configuration

**As a** frontend developer, **I want** API endpoints to read and update WIP
limit configuration, **so that** users can customize their WIP limit through the
UI.

**Acceptance Criteria:**

1. `GET /api/config/wip-limit` - Returns current WIP limit as
   `{ limit: number }`
2. `PUT /api/config/wip-limit` - Updates WIP limit, accepts `{ limit: number }`
   (5-10 range), returns updated config
3. Validation: PUT endpoint rejects limits outside 5-10 range with 400 status
   and error message "WIP limit must be between 5 and 10"
4. `POST /api/tasks` endpoint modified to check WIPLimitService.canAddTask()
   before creating task
5. When WIP limit reached, POST /api/tasks returns 409 Conflict with
   `{ error: string, wipLimitMessage: string }` including helpful message
6. `GET /api/config/wip-limit` includes additional metadata in response:
   `{ limit: number, currentCount: number, canAddTask: boolean }`
7. All config endpoints include proper error handling with descriptive messages
8. Integration tests verify: reading limit, updating limit with valid/invalid
   values, task creation blocked at limit
9. Config changes immediately affect task creation behavior (no restart
   required)
10. Error response for blocked task creation is distinct from other errors
    (status 409 vs 400/500)

## Story 2.4: Settings Screen with WIP Configuration

**As a** user, **I want** a settings screen where I can adjust my WIP limit,
**so that** I can customize the constraint to match my personal productivity
style.

**Acceptance Criteria:**

1. Settings page/modal accessible via navigation link or settings icon in main
   UI
2. Settings screen displays current WIP limit with label "Work In Progress Limit
   (5-10 tasks)"
3. WIP limit adjustable via number input or slider control (range 5-10)
4. Visual explanation provided: "Limits how many active tasks you can have at
   once. This helps prevent overwhelm."
5. "Save" button commits changes via `PUT /api/config/wip-limit`
6. Success feedback shows "Settings saved!" message after successful update
7. Error handling: Invalid limit shows error "Please choose a limit between 5
   and 10"
8. Settings screen shows current active task count: "You currently have [N]
   active tasks"
9. Cancel or close action discards unsaved changes and returns to main view
10. Settings accessible via keyboard navigation and meets accessibility
    requirements (semantic HTML, labels)

## Story 2.5: WIP Limit Enforcement in Task Creation UI

**As a** user, **I want** clear, encouraging feedback when I've reached my WIP
limit, **so that** I understand the constraint is helping me stay focused rather
than blocking me arbitrarily.

**Acceptance Criteria:**

1. When WIP limit is reached, "Add Task" button becomes disabled with visual
   indication (grayed out, cursor not-allowed)
2. Helpful message displays prominently near add task input: "You have [N]
   active tasks - complete one before adding more to maintain focus!" (from
   WIPLimitService)
3. Message tone is encouraging and explanatory, not punitive (uses calming
   colors, friendly icon)
4. If user attempts to add task at limit (via Enter key), message appears with
   gentle animation (slide-in or fade-in)
5. Real-time update: Completing or deleting a task immediately re-enables add
   functionality and removes limit message
6. WIP limit message includes link to settings: "Adjust your limit in Settings"
   (opens settings screen)
7. Visual indicator shows progress toward limit: "[N] of [limit] tasks active"
   displayed near task list
8. First-time users who hit limit see additional context: "This helps you focus.
   Research shows limiting WIP improves completion rates."
9. Message styling matches PRD's "gentle constraints" principle - feels
   supportive, not restrictive
10. Accessibility: Screen readers announce when limit reached and when space
    becomes available

## Story 2.6: WIP Count Indicator

**As a** user, **I want** to see at a glance how many active tasks I have and
how close I am to my limit, **so that** I'm aware of my constraint status
without needing to count tasks manually.

**Acceptance Criteria:**

1. WIP count indicator displayed prominently in UI header or near task list:
   "[N] of [limit] active tasks"
2. Visual design uses progress indicator (e.g., "[5/7]" or progress bar showing
   5 out of 7)
3. Color coding indicates status: green when well below limit (0-60%), yellow
   when approaching (60-90%), orange at limit (100%)
4. Indicator updates in real-time as tasks are added, completed, or deleted
5. Clicking/tapping indicator opens settings to adjust WIP limit (quick access
   to configuration)
6. Tooltip on hover provides context: "Work In Progress limit helps you stay
   focused"
7. Indicator is responsive and visible at all screen sizes (doesn't hide on
   narrow windows)
8. When at limit, indicator styling emphasizes state change (subtle animation,
   distinct color)
9. Indicator accessible to screen readers: "5 of 7 active tasks, below limit" or
   "7 of 7 active tasks, at limit"
10. Visual design integrates with overall UI aesthetic (calming colors, clean
    typography)

## Story 2.7: Analytics Service for Behavioral Data Tracking

**As a** developer, **I want** an AnalyticsService that captures and calculates
behavioral metrics, **so that** we have data insights available for future
features and can validate MVP success criteria.

**Acceptance Criteria:**

1. AnalyticsService class created with methods: `getCompletionRate()`,
   `getAverageTaskLifetime()`, `getTaskCountByStatus()`, `getOldestActiveTask()`
2. `getCompletionRate()` calculates (tasks completed / total tasks created) ×
   100, returns percentage
3. `getAverageTaskLifetime()` calculates mean lifetimeDuration for completed
   tasks, returns milliseconds
4. `getTaskCountByStatus()` returns object:
   `{ active: number, completed: number }`
5. `getOldestActiveTask()` finds active task with earliest createdAt timestamp,
   useful for age indicators
6. Service reads data from DataService/TaskService (no separate analytics
   storage for MVP)
7. Calculations handle edge cases: division by zero (no completed tasks), empty
   task list
8. Analytics calculated on-demand (not cached) for MVP simplicity - acceptable
   performance for <10k tasks
9. Unit tests verify calculations with various task datasets: all active, all
   completed, mixed states, empty
10. Service provides foundation for Phase 2 visual trend dashboard without
    needing refactoring

## Story 2.8: First-Launch Configuration Flow

**As a** first-time user, **I want** to be guided through initial setup when I
first use the app, **so that** I can configure my WIP limit and understand what
the app does.

**Acceptance Criteria:**

1. App detects first launch by checking for absence of config.json or specific
   "hasCompletedSetup" flag
2. First-launch screen displays before main task view with welcoming message:
   "Welcome to Simple To-Do App!"
3. Setup flow explains core concept: "This app helps you focus by limiting how
   many tasks you can have active at once"
4. User prompted to choose WIP limit with clear explanation: "How many active
   tasks feel manageable for you?" (5-10 options)
5. Default suggestion highlighted: "Most users find 7 tasks works well - you can
   change this later in Settings"
6. Visual examples or illustrations show the concept (optional but helpful)
7. "Get Started" button saves configuration and proceeds to main task view
8. Configuration persisted immediately so user doesn't see setup flow again
9. Setup flow skippable with "Use default settings" option that sets limit to 7
   and proceeds
10. First-launch flow is one-time only - settings can be changed later but setup
    doesn't reappear
11. First-launch flow includes message: "This is a pilot version. We'd love your
    feedback - find the Feedback link in Settings!"

## Story 2.9: Testing and Epic Validation

**As a** developer and product manager, **I want** comprehensive tests for WIP
and tracking features with validation of epic objectives, **so that** we ensure
quality and confirm we've delivered the epic's value proposition.

**Acceptance Criteria:**

1. Unit tests for WIPLimitService verify: limit enforcement, configuration
   validation, helpful message generation
2. Unit tests for AnalyticsService verify: completion rate calculations, average
   lifetime, edge case handling
3. Integration tests for config API endpoints: reading/writing WIP limit,
   validation errors
4. Integration tests for task creation with WIP limit: blocking at limit,
   allowing under limit
5. End-to-end manual testing checklist completed: configure limit, hit limit,
   receive helpful message, complete task to free space, analytics calculations
   accurate
6. Test coverage for new services (WIPLimitService, AnalyticsService) reaches
   80%+
7. User acceptance validation: WIP limit prevents task creation with encouraging
   messaging (per PRD FR6-FR8)
8. Data validation: All tasks in system now have complete metadata (textLength,
   lifetimeDuration for completed)
9. Epic demo-able: Can show working WIP enforcement, adjustable limits, and
   basic analytics queries
10. Documentation updated: README includes WIP limit feature explanation and
    analytics capabilities
