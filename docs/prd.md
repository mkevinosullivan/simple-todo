# Simple To-Do App Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Create a to-do application that prevents overwhelm through WIP limits and proactive engagement
- Transform task management from passive lists into an active productivity partner
- Validate the innovation hypothesis that proactive prompting increases task completion rates
- Demonstrate sophisticated behavioral design within a "simple" application context
- Build reusable data tracking infrastructure that supports future intelligent features
- Deliver functional MVP within 4-6 weeks suitable for pilot user testing

### Background Context

Traditional to-do applications are passive tools that wait for user discipline rather than providing active support. This creates a cycle of forgetting → accumulation → overwhelm → despair, particularly affecting chronic procrastinators and overwhelmed professionals. While competitors like Habitica, Todoist, and Things 3 have validated that celebration mechanics and focused views work, no successful product currently uses proactive prompting to break the passive engagement pattern.

This project reimagines task management through psychological design principles, combining proven approaches (WIP limits, celebration mechanics, data-driven insights) with one innovative differentiation: the app initiates interaction by intelligently prompting users to complete specific tasks. The Simple To-Do App aims to be an emotionally supportive accountability partner that prevents list bloat, celebrates progress, and proactively helps users complete what matters.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-15 | v1.0 | Initial PRD draft from Project Brief | John (PM) |
| 2026-01-20 | v1.1 | Updates after checklist review from Product Owner | Sarah (PO) |

## Requirements

### Functional Requirements

- **FR1:** The system shall allow users to create new tasks with a text description
- **FR2:** The system shall allow users to view all active (incomplete) tasks
- **FR3:** The system shall allow users to mark tasks as complete
- **FR4:** The system shall allow users to delete tasks
- **FR5:** The system shall allow users to edit existing task descriptions
- **FR6:** The system shall enforce a configurable WIP (Work In Progress) limit between 5-10 active tasks
- **FR7:** The system shall prevent users from adding new tasks when the WIP limit is reached until a task is completed or deleted
- **FR8:** The system shall display helpful feedback messages when WIP limit is reached, explaining the benefit and guiding users to complete or delete tasks
- **FR9:** The system shall display celebration messages immediately when a task is marked complete
- **FR10:** The system shall rotate through at least 10 distinct celebration messages to minimize repetition
- **FR11:** The system shall implement a proactive prompting system that suggests a task to the user with the message "Could you do [task] now?" with a default interval of 2-3 hours (randomly selected within range for each prompt)
- **FR12:** The system shall allow users to respond to prompts with: complete task, dismiss prompt, or snooze prompt for 1 hour
- **FR13:** The system shall track task creation timestamps for all tasks
- **FR14:** The system shall track task completion timestamps for completed tasks
- **FR15:** The system shall track task metadata including: text length, creation timestamp, completion timestamp, task status, and lifetime duration (time to completion)
- **FR16:** The system shall provide a mechanism to configure WIP limits within the 5-10 range
- **FR17:** The system shall allow users to configure proactive prompting frequency within a range of 1-6 hours
- **FR18:** The system shall allow users to opt-out of proactive prompting entirely
- **FR19:** The system shall prompt users to configure WIP limit (5-10) and prompting preferences during first launch

### Non-Functional Requirements

- **NFR1:** The system shall start up in less than 2 seconds
- **NFR2:** Task operations (add, complete, delete) shall respond in less than 100 milliseconds
- **NFR3:** The system shall handle up to 10,000 tasks without performance degradation
- **NFR4:** All user data shall be stored locally with no external data transmission (privacy-first design)
- **NFR5:** The system shall use JSON file storage for local data persistence
- **NFR6:** The system shall maintain data integrity ensuring no data loss during operations
- **NFR7:** The system shall be implemented using Node.js 18+ and TypeScript 5+
- **NFR8:** The system shall achieve 70%+ test coverage for business logic services (TaskService, CelebrationService, PromptingService, WIPLimitService)
- **NFR9:** The system shall run on Windows 10+, macOS 12+, and Linux (Ubuntu 20.04+)
- **NFR10:** The system shall sanitize user input to prevent injection attacks
- **NFR11:** The system shall be deployable as a web interface running on localhost
- **NFR12:** The system shall handle data storage errors gracefully with user-friendly error messages and prevent data loss

## User Interface Design Goals

### Overall UX Vision

The interface should feel like a supportive productivity partner rather than a demanding task manager. The emotional tone is encouraging and calm, never guilt-inducing or overwhelming. The design prioritizes simplicity and immediate comprehension - users should understand core functionality within 30 seconds of first use. Visual hierarchy emphasizes what to do now rather than everything that needs doing. The interface celebrates small wins meaningfully without feeling patronizing.

### Key Interaction Paradigms

- **Proactive notifications:** The app initiates interaction through non-blocking toast notifications (in-app corner notifications that persist for 30 seconds). Browser notifications are available as an opt-in feature after users have experienced in-app prompts and trust the app's value.
- **Progressive disclosure:** Hide complexity by default - show active tasks prominently, keep settings/configuration accessible but not front-and-center
- **Immediate feedback:** Every action (add task, complete task, hit WIP limit) provides instant visual and textual response
- **Gentle constraints:** WIP limits presented as helpful boundaries with encouraging messaging, not harsh restrictions
- **One-click primary actions:** Completing a task should be a single click/tap, minimizing friction for the core user action
- **Non-interruptive prompting:** Proactive prompts use toast-style notifications that appear in a corner, can be clicked to engage (showing complete/dismiss/snooze options), or ignored to auto-dismiss after 30 seconds
- **Meaningful celebrations:** Task completion celebrations display as prominent but non-blocking elements for 5-10 seconds with user-dismissible option (click anywhere or "Continue" button), maintaining emotional impact while allowing users to control timing

### Core Screens and Views

From a product perspective, the critical screens necessary to deliver the PRD values and goals:

1. **Main Task List View:** Primary interface showing all active tasks in chronological order with visual indicators for task age (color coding or badges to highlight older tasks needing attention), add task input, task completion controls, current WIP count indicator
2. **Proactive Prompt Notification:** Non-blocking toast notification presenting the "Could you do [task] now?" prompt. When clicked, expands to show complete/dismiss/snooze options. Auto-dismisses after 30 seconds if ignored.
3. **Celebration Display:** Prominent overlay celebrating task completion with encouraging message and vibrant visual effects, user-dismissible via click or auto-dismissing after 5-10 seconds
4. **First-Launch Configuration:** Initial setup screen for configuring WIP limit (5-10) and prompting frequency preferences. Does NOT request browser notification permission at this stage.
5. **Settings/Preferences Screen:** Adjust WIP limit, prompting frequency, opt-in to browser notifications, opt-out of prompting entirely, view/change configuration
6. **Empty State - First Time Users:** Quick start guide displayed when new users have no active tasks, explaining core features and how to get started
7. **Empty State - Returning Users (Inbox Zero):** Epic celebration screen when returning users complete all tasks ("You completed everything! 🎉"), displaying completion stats with option to add new tasks

### Accessibility

The application should use semantic HTML and reasonable accessibility practices (keyboard navigation for primary actions, readable fonts, logical tab order). Formal WCAG AA compliance is deferred to Phase 2 to maintain MVP timeline focus on validating core hypotheses.

### Branding

Minimal, clean, modern aesthetic emphasizing calm and focus. The base interface uses a calming, neutral color palette (soft blues, greens, grays) to reduce overwhelm. Celebrations and positive interactions use vibrant accent colors (warm oranges, yellows, or energetic greens) to create emotional range and excitement. Avoid gamification visuals (no RPG elements like Habitica) - maintain professional tone suitable for both personal and work contexts. Typography should be highly readable with generous spacing.

### Target Device and Platforms

**Web Responsive** - Primary target is desktop/laptop web browsers (Chrome, Firefox, Safari, Edge) with responsive design that adapts gracefully to various window sizes (supporting side-by-side layouts, tiled windows, and smaller viewports). The localhost web interface should be usable across desktop screen sizes from narrow sidebars to full-screen displays, and adapt gracefully to tablet and mobile screen sizes for flexibility.

## Technical Assumptions

### Repository Structure: Monorepo

The application will use a **monorepo** structure with a single Git repository containing all code for the Simple To-Do App. This includes frontend web interface, backend services/business logic, shared types, and tests.

**Rationale:** For an MVP with a single web application and no separate services, a monorepo provides simplicity and ease of development. All code is in one place, making it easy to refactor, search, and ensure consistency. There's no need for polyrepo complexity when we don't have multiple independently deployable services. The brief's proposed architecture structure shows a single `simple-todo/` repository with organized subdirectories, confirming this approach.

### Service Architecture: Monolith

The application will be architected as a **monolithic application** running as a single Node.js process serving both the web interface and executing business logic locally.

**Structure:**
- Single Node.js/TypeScript application
- Express.js server serving both static frontend assets and API endpoints
- Business logic services (TaskService, CelebrationService, PromptingService, WIPLimitService) run in-process
- Local JSON file storage accessed directly by backend services
- Background scheduler for proactive prompting runs within the main process

**Rationale:** This is an MVP for 5-10 pilot users running localhost-only on a single machine. Microservices or serverless architectures would add massive complexity (service orchestration, inter-service communication, deployment overhead) for zero benefit. The brief explicitly recommends "No separate backend server for MVP (single-process application or localhost-only)" and notes this is a "demonstration/portfolio project" with a tight 4-6 week timeline. A monolith is the fastest path to validation.

**Future Consideration:** If the app evolves to a hosted SaaS platform (Phase 3+), we could extract the prompting service as a separate worker process or serverless function, but that's premature for MVP.

### Testing Requirements: Unit + Integration

The application will implement **unit tests and integration tests** with a target of 70%+ coverage for business logic services.

**Testing Strategy:**
- **Unit Tests:** Core business logic services (TaskService, WIPLimitService, CelebrationService, PromptingService) with mocked dependencies
- **Integration Tests:** API endpoints with real data layer (test database/file), validating full request/response cycles
- **No E2E/UI Tests in MVP:** Browser-based end-to-end testing (Playwright, Cypress) is deferred to Phase 2 to maintain timeline
- **Testing Framework:** Jest for both unit and integration tests (TypeScript support, mocking, fast execution)

**Rationale:** Unit tests alone wouldn't catch data persistence bugs or API contract issues. Full testing pyramid (unit + integration + E2E + manual) would consume too much of the 4-6 week timeline. Unit + Integration strikes the balance of confidence without excessive overhead. The brief specifies "Jest for unit tests, coverage target 70%+ for core business logic" and notes this is an MVP where speed matters. We can add E2E tests in Phase 2 when the UI stabilizes.

**Manual Testing Approach:** Developer will manually test the web UI during development. Pilot users serve as additional manual QA during the 2-week testing phase.

### Additional Technical Assumptions and Requests

**Frontend Stack:**
- **Framework:** React 18+ with TypeScript for type safety and component reusability
- **Styling:** CSS Modules or Tailwind CSS for scoped styling and rapid development
- **State Management:** React Context API for simple global state (no Redux - YAGNI for MVP)
- **Build Tool:** Vite for fast development server and optimized production builds
- **Rationale:** React + TypeScript is well-supported, has excellent tooling, and aligns with the brief's "React with minimal dependencies" suggestion. Vite provides instant hot reload during development, speeding up iteration.

**Backend Stack:**
- **Runtime:** Node.js 18+ (LTS) for modern async/await and stability
- **Framework:** Express.js for HTTP server and API routing (minimal, proven, well-documented)
- **Language:** TypeScript 5+ for type safety across frontend and backend
- **Data Storage:** JSON file storage with structured schema (no database for MVP)
- **File System:** Node.js `fs` module with async/await for data operations
- **Rationale:** The brief recommends "Start with JSON for MVP simplicity" over SQLite. Express is the standard Node.js web framework. TypeScript prevents bugs and enables shared types between frontend/backend.

**Background Processing (Proactive Prompting):**
- **Scheduler:** `node-schedule` library or simple `setInterval` for periodic prompting
- **Prompt Delivery:** Server-Sent Events (SSE) or WebSocket for pushing prompts to browser in real-time
- **Fallback:** Long polling if SSE/WebSocket proves complex
- **Rationale:** The brief identifies "Option 1: Node.js setInterval for periodic prompts (simpler)" as the recommended MVP approach. SSE is simpler than WebSockets for server-to-client push and sufficient for our use case.

**Development Tooling:**
- **Linting:** ESLint with TypeScript rules for code quality
- **Formatting:** Prettier for consistent code style
- **Version Control:** Git with conventional commits for clean history
- **Package Manager:** npm (comes with Node.js) or pnpm for faster installs
- **Rationale:** These are standard TypeScript/Node.js development tools that prevent bugs and maintain code quality with minimal setup effort.

**Deployment:**
- **MVP:** Runs locally via `npm run dev` (development) and `npm run build && npm start` (production build)
- **Distribution:** GitHub repository with README instructions for local setup
- **No Hosting Required:** Users clone repo and run on their own machines
- **Rationale:** The brief specifies "MVP: Runs locally on user's machine (no hosting needed)" and this is a pilot test with 5-10 users from personal network. Hosting adds complexity and cost for no MVP benefit.

**Security:**
- **Input Sanitization:** Validate and sanitize task text input to prevent XSS attacks (use a library like DOMPurify for frontend display)
- **No Authentication:** Single-user local app doesn't need login/authentication
- **Data Privacy:** All data stays local, no telemetry or external API calls (per NFR4)
- **Rationale:** The brief notes "Input Validation: Sanitize task text to prevent injection attacks if building web interface" and "Authentication: Not needed for MVP (single-user local app)."

**Performance Targets:**
- **Startup Time:** < 2 seconds (NFR1)
- **Task Operations:** < 100ms response (NFR2)
- **Data Scale:** Handle up to 10,000 tasks without slowdown (NFR3)
- **Rationale:** These come from the brief's technical requirements and are achievable with JSON file storage + in-memory caching for active tasks.

**Browser Targets:**
- **Modern Browsers:** Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **No IE11 Support:** Not targeting legacy browsers to keep bundle size small and use modern JavaScript features
- **Rationale:** Pilot users will use modern browsers. Supporting IE11 would require polyfills and transpilation that slows development.

**Migration Path (Phase 2 Considerations):**
- **JSON → SQLite:** Data abstraction layer (DataService) allows future migration to SQLite without changing business logic
- **Localhost → Hosted:** Frontend already separated from backend via API, enabling future deployment to cloud hosting
- **Rationale:** The brief recommends "Service-oriented architecture supports testing and feature independence" with DataService abstraction specifically to enable storage backend swapping.

## Epic List

**Epic 1: Foundation & Core Task Management**
Establish project infrastructure (Node.js/TypeScript setup, Git, basic CI, Express server, React app scaffold) and deliver basic task CRUD functionality with JSON storage. Users can add, view, edit, delete, and complete tasks through a clean web interface.

**Epic 2: WIP Limits & Behavioral Tracking**
Implement WIP limit enforcement with helpful messaging and establish comprehensive data tracking infrastructure (timestamps, task metadata, lifetime tracking). Users experience constraint-based productivity and the system begins capturing behavioral data for future intelligence.

**Epic 3: Celebration Mechanics & User Experience Polish**
Add celebration system with variety of messages, visual effects, and non-blocking presentation. Implement task age visual indicators, empty states (quick start guide for new users, inbox zero celebration for returning users), and first-launch configuration flow.

**Epic 4: Proactive Prompting System**
Build the innovation differentiator - periodic task prompting with toast notifications, user response handling (complete/dismiss/snooze), configurable prompting frequency, browser notification opt-in, and the ability to disable prompting entirely.

## Epic 1 Details: Foundation & Core Task Management

**Epic Goal:** Establish the project infrastructure (Node.js/TypeScript setup, Git repository, basic CI, Express server, React app with Vite) and deliver the foundational task management functionality. By the end of this epic, users can add, view, edit, delete, and complete tasks through a clean, responsive web interface with data persisted to local JSON storage. This epic proves the technical stack works and delivers immediate value - a functioning to-do list.

### Story 1.1: Project Setup and Development Environment

**As a** developer,
**I want** a fully configured Node.js/TypeScript project with React frontend and Express backend,
**so that** I have a solid foundation to build features efficiently with type safety and modern tooling.

**Acceptance Criteria:**

1. Node.js 18+ project initialized with package.json and TypeScript 5+ configuration
2. Project structure follows the monorepo pattern with organized directories: `/src/client` (React), `/src/server` (Express), `/src/shared` (shared types), `/tests`
3. Vite configured for React frontend with hot reload and TypeScript support
4. Express.js server configured with TypeScript and basic middleware (CORS, JSON body parser)
5. ESLint and Prettier configured for code quality and consistent formatting
6. Git repository initialized with .gitignore (excluding node_modules, build artifacts, data files)
7. README.md created with setup instructions for running `npm install`, `npm run dev`, and `npm run build`
8. npm scripts configured: `dev` (runs both frontend and backend concurrently), `build`, `test`
9. Basic health-check endpoint (`GET /api/health`) returns 200 OK when server is running
10. React app renders a "Hello World" placeholder page when accessing localhost:3000

### Story 1.2: JSON Data Storage Layer

**As a** developer,
**I want** a data abstraction layer that handles reading and writing task data to a JSON file,
**so that** task data persists locally and the storage backend can be swapped later without changing business logic.

**Acceptance Criteria:**

1. DataService class created with methods: `loadTasks()`, `saveTasks(tasks)`, `ensureDataFileExists()`
2. JSON file location configured at `./data/tasks.json` (relative to project root)
3. Data directory automatically created if it doesn't exist on first run
4. JSON schema defined for tasks with TypeScript interface: `{ id: string, text: string, createdAt: string, completedAt: string | null, status: 'active' | 'completed' }`
5. `loadTasks()` reads JSON file and parses into Task[] array, returns empty array if file doesn't exist
6. `saveTasks()` writes Task[] array to JSON file with proper formatting (2-space indentation)
7. Data integrity: File write operations use atomic write pattern (write to temp file, then rename) to prevent corruption
8. Error handling: Storage errors throw descriptive exceptions that calling code can catch
9. Unit tests verify: loading empty file, loading existing tasks, saving tasks, handling corrupted JSON gracefully
10. DataService is a singleton or dependency-injectable to allow mocking in tests

### Story 1.3: Task Service - Core CRUD Operations

**As a** developer,
**I want** a TaskService that encapsulates all task management business logic,
**so that** API endpoints and UI components have a clean interface for task operations.

**Acceptance Criteria:**

1. TaskService class created with methods: `getAllTasks()`, `getTaskById(id)`, `createTask(text)`, `updateTask(id, updates)`, `deleteTask(id)`, `completeTask(id)`
2. TaskService uses DataService for persistence (dependency injection or direct instantiation)
3. `createTask()` generates unique task ID (UUID), sets createdAt timestamp, status 'active', returns created task
4. `updateTask()` allows modifying task text only (other fields should not be user-editable)
5. `deleteTask()` removes task from storage entirely, returns success/failure indicator
6. `completeTask()` sets task status to 'completed' and records completedAt timestamp
7. `getAllTasks()` returns all tasks with optional filtering by status ('active' or 'completed')
8. All methods validate inputs (e.g., task text not empty, ID exists) and throw clear errors for invalid operations
9. Unit tests verify: creating tasks with valid/invalid input, updating existing/non-existent tasks, deleting tasks, completing tasks
10. Test coverage for TaskService reaches 80%+

### Story 1.4: REST API Endpoints for Task Management

**As a** frontend developer,
**I want** RESTful API endpoints for task operations,
**so that** the React UI can communicate with the backend to manage tasks.

**Acceptance Criteria:**

1. `POST /api/tasks` - Create new task, accepts `{ text: string }` in request body, returns created task with 201 status
2. `GET /api/tasks` - Retrieve all tasks, accepts optional query param `?status=active|completed`, returns tasks array
3. `GET /api/tasks/:id` - Retrieve single task by ID, returns task or 404 if not found
4. `PUT /api/tasks/:id` - Update task text, accepts `{ text: string }`, returns updated task or 404
5. `DELETE /api/tasks/:id` - Delete task, returns 204 No Content on success or 404 if not found
6. `PATCH /api/tasks/:id/complete` - Mark task as complete, returns updated task or 404
7. All endpoints validate input and return appropriate HTTP status codes (400 for bad requests, 500 for server errors)
8. Error responses include JSON body with `{ error: string }` message describing the issue
9. Input sanitization: Task text is trimmed of whitespace and checked for maximum length (e.g., 500 characters)
10. Integration tests verify: each endpoint with valid/invalid inputs, error handling, proper status codes

### Story 1.5: React UI - Main Task List View

**As a** user,
**I want** to see all my active tasks in a clean list view,
**so that** I can quickly understand what I need to do.

**Acceptance Criteria:**

1. Main task list page renders at the root route `/` showing all active tasks
2. Task list displays tasks in chronological order (newest first as per PRD)
3. Each task shows: task text, visual indicator for task age (color or badge - implementation based on creation date)
4. Empty state displays when no active tasks exist: "No tasks yet. Add your first task to get started!"
5. Task list is responsive and adapts to window width (no horizontal scroll, readable on narrow windows)
6. UI uses semantic HTML (unordered list for tasks, appropriate heading levels)
7. Tasks fetch from `GET /api/tasks?status=active` on component mount
8. Loading state displays while tasks are being fetched ("Loading tasks...")
9. Error state displays if API request fails ("Failed to load tasks. Please refresh.")
10. UI uses the calming base color palette defined in PRD (soft blues, greens, grays)

### Story 1.6: React UI - Add Task Functionality

**As a** user,
**I want** to add a new task by typing text and clicking a button,
**so that** I can capture things I need to do.

**Acceptance Criteria:**

1. Add task input field prominently displayed at top of task list view
2. Input field has placeholder text "What needs to be done?"
3. "Add Task" button positioned next to input field (or input has Enter key submit)
4. Clicking "Add Task" or pressing Enter sends `POST /api/tasks` with task text
5. After successful creation, new task appears in the list immediately and input field clears
6. Validation: Empty or whitespace-only task text shows error message "Task cannot be empty"
7. Validation: Task text exceeding 500 characters shows error message "Task too long (max 500 characters)"
8. Button disabled while task is being created (prevents double-submission)
9. Error handling: If API request fails, show error message and keep user's text in input field
10. Keyboard accessibility: Input and button can be focused and operated via keyboard only

### Story 1.7: React UI - Complete and Delete Task Actions

**As a** user,
**I want** to mark tasks as complete or delete them with a single click,
**so that** I can manage my task list efficiently.

**Acceptance Criteria:**

1. Each task in the list displays two action buttons/icons: "Complete" (checkmark icon) and "Delete" (trash icon)
2. Clicking "Complete" sends `PATCH /api/tasks/:id/complete` and removes task from active list immediately
3. Clicking "Delete" sends `DELETE /api/tasks/:id` and removes task from list immediately
4. Optimistic UI update: Task disappears from view before API confirms success (for perceived speed)
5. Error handling: If API request fails, task reappears in list with error toast "Failed to [complete/delete] task. Please try again."
6. Visual feedback: Buttons show hover state and cursor pointer
7. Accessibility: Buttons have descriptive aria-labels like "Complete task: [task text]" and "Delete task: [task text]"
8. Mobile-friendly: Action buttons are touch-target sized (minimum 44x44 pixels)
9. Complete button visually distinct from delete (e.g., green checkmark vs red trash icon)
10. Confirmation for delete actions is NOT required (keeps interaction fast per PRD's "one-click primary actions")

### Story 1.8: React UI - Edit Task Functionality

**As a** user,
**I want** to edit the text of an existing task,
**so that** I can correct typos or refine task descriptions.

**Acceptance Criteria:**

1. Each task displays an "Edit" button/icon in addition to complete and delete actions
2. Clicking "Edit" transforms task text into an editable input field with current text pre-populated
3. Edit mode shows "Save" and "Cancel" buttons replacing the edit/complete/delete actions
4. Clicking "Save" sends `PUT /api/tasks/:id` with updated text and returns to read-only view
5. Clicking "Cancel" discards changes and returns to read-only view without API call
6. Pressing Enter while editing saves changes, pressing Escape cancels
7. Validation: Empty text shows error "Task cannot be empty" and prevents saving
8. Only one task can be in edit mode at a time (editing a different task cancels current edit)
9. Edit input field auto-focused when entering edit mode for immediate typing
10. Optimistic update: UI shows new text immediately after save, reverts if API fails with error message

### Story 1.9: Basic Testing and Deployment Setup

**As a** developer,
**I want** Jest configured and initial tests passing with CI/CD pipeline running,
**so that** code quality is maintained and future features have a testing foundation.

**Acceptance Criteria:**

1. Jest configured for both backend (Node/TypeScript) and frontend (React/TypeScript) with separate configs if needed
2. Test scripts in package.json: `npm test` (all tests), `npm run test:watch` (watch mode), `npm run test:coverage` (coverage report)
3. Unit tests exist and pass for DataService (file operations, error handling)
4. Unit tests exist and pass for TaskService (CRUD operations, validation)
5. Integration tests exist and pass for API endpoints (at least create, get, complete, delete)
6. Test coverage report shows 70%+ coverage for business logic (TaskService, DataService)
7. GitHub Actions workflow (or equivalent CI) configured to run `npm test` on every push/PR
8. CI fails if tests fail or coverage drops below 70%
9. README updated with testing instructions and coverage badge (optional)
10. Production build script (`npm run build`) successfully creates optimized frontend bundle and compiles TypeScript backend. NOTE: IaC (Infrastructure as Code) and complex deployment strategies are intentionally deferred to Phase 2 for this localhost MVP.

## Epic 2 Details: WIP Limits & Behavioral Tracking

**Epic Goal:** Implement the constraint-based productivity mechanism through WIP (Work In Progress) limit enforcement with encouraging, helpful messaging. Establish comprehensive data tracking infrastructure that captures task metadata (timestamps, text characteristics, lifetime duration) to serve as the foundation for all future intelligent features. By the end of this epic, users experience the proven psychological benefit of manageable task counts, and the system begins building a rich behavioral dataset.

### Story 2.1: Enhanced Data Model with Metadata Tracking

**As a** developer,
**I want** the task data model extended to capture comprehensive metadata,
**so that** we have the data foundation needed for WIP limits, analytics, and future intelligent features.

**Acceptance Criteria:**

1. Task interface extended with additional fields: `textLength: number`, `lifetimeDuration: number | null` (milliseconds from creation to completion)
2. `createdAt` and `completedAt` fields verified as ISO 8601 timestamp strings for consistency
3. DataService automatically calculates `textLength` when saving tasks (character count of task text)
4. DataService automatically calculates `lifetimeDuration` when task is completed (completedAt - createdAt)
5. Migration utility created to add new fields to existing tasks in tasks.json (sets defaults for missing fields)
6. Data validation ensures all timestamps are valid date strings before saving
7. Shared TypeScript types updated and exported for use across frontend and backend
8. Unit tests verify metadata calculations: textLength matches actual text, lifetimeDuration calculated correctly
9. Backward compatibility: Tasks without new fields can still be loaded (fields added with defaults)
10. Documentation updated showing complete Task data structure with all fields and their purposes

### Story 2.2: WIP Limit Service - Business Logic

**As a** developer,
**I want** a WIPLimitService that enforces configurable task limits and provides helpful messaging,
**so that** the constraint mechanism is centralized and testable independently of UI or API.

**Acceptance Criteria:**

1. WIPLimitService class created with methods: `canAddTask()`, `getCurrentWIPCount()`, `getWIPLimit()`, `setWIPLimit(limit)`, `getWIPLimitMessage()`
2. WIP limit stored in configuration file or user preferences (JSON file at `./data/config.json`)
3. Default WIP limit set to 7 (middle of 5-10 range from PRD)
4. `canAddTask()` returns boolean: true if current active task count < WIP limit, false otherwise
5. `getCurrentWIPCount()` queries TaskService for count of tasks with status 'active'
6. `setWIPLimit(limit)` validates input is between 5-10 (inclusive) and persists to config file
7. `getWIPLimitMessage()` returns encouraging message like "You have [N] active tasks - complete one before adding more to maintain focus!"
8. Service integrates with TaskService to check count before allowing task creation
9. Unit tests verify: limit enforcement at exact threshold, helpful messages generated, validation of limit range
10. Configuration persistence: WIP limit survives app restarts by reading from config.json

### Story 2.3: API Endpoints for WIP Configuration

**As a** frontend developer,
**I want** API endpoints to read and update WIP limit configuration,
**so that** users can customize their WIP limit through the UI.

**Acceptance Criteria:**

1. `GET /api/config/wip-limit` - Returns current WIP limit as `{ limit: number }`
2. `PUT /api/config/wip-limit` - Updates WIP limit, accepts `{ limit: number }` (5-10 range), returns updated config
3. Validation: PUT endpoint rejects limits outside 5-10 range with 400 status and error message "WIP limit must be between 5 and 10"
4. `POST /api/tasks` endpoint modified to check WIPLimitService.canAddTask() before creating task
5. When WIP limit reached, POST /api/tasks returns 409 Conflict with `{ error: string, wipLimitMessage: string }` including helpful message
6. `GET /api/config/wip-limit` includes additional metadata in response: `{ limit: number, currentCount: number, canAddTask: boolean }`
7. All config endpoints include proper error handling with descriptive messages
8. Integration tests verify: reading limit, updating limit with valid/invalid values, task creation blocked at limit
9. Config changes immediately affect task creation behavior (no restart required)
10. Error response for blocked task creation is distinct from other errors (status 409 vs 400/500)

### Story 2.4: Settings Screen with WIP Configuration

**As a** user,
**I want** a settings screen where I can adjust my WIP limit,
**so that** I can customize the constraint to match my personal productivity style.

**Acceptance Criteria:**

1. Settings page/modal accessible via navigation link or settings icon in main UI
2. Settings screen displays current WIP limit with label "Work In Progress Limit (5-10 tasks)"
3. WIP limit adjustable via number input or slider control (range 5-10)
4. Visual explanation provided: "Limits how many active tasks you can have at once. This helps prevent overwhelm."
5. "Save" button commits changes via `PUT /api/config/wip-limit`
6. Success feedback shows "Settings saved!" message after successful update
7. Error handling: Invalid limit shows error "Please choose a limit between 5 and 10"
8. Settings screen shows current active task count: "You currently have [N] active tasks"
9. Cancel or close action discards unsaved changes and returns to main view
10. Settings accessible via keyboard navigation and meets accessibility requirements (semantic HTML, labels)

### Story 2.5: WIP Limit Enforcement in Task Creation UI

**As a** user,
**I want** clear, encouraging feedback when I've reached my WIP limit,
**so that** I understand the constraint is helping me stay focused rather than blocking me arbitrarily.

**Acceptance Criteria:**

1. When WIP limit is reached, "Add Task" button becomes disabled with visual indication (grayed out, cursor not-allowed)
2. Helpful message displays prominently near add task input: "You have [N] active tasks - complete one before adding more to maintain focus!" (from WIPLimitService)
3. Message tone is encouraging and explanatory, not punitive (uses calming colors, friendly icon)
4. If user attempts to add task at limit (via Enter key), message appears with gentle animation (slide-in or fade-in)
5. Real-time update: Completing or deleting a task immediately re-enables add functionality and removes limit message
6. WIP limit message includes link to settings: "Adjust your limit in Settings" (opens settings screen)
7. Visual indicator shows progress toward limit: "[N] of [limit] tasks active" displayed near task list
8. First-time users who hit limit see additional context: "This helps you focus. Research shows limiting WIP improves completion rates."
9. Message styling matches PRD's "gentle constraints" principle - feels supportive, not restrictive
10. Accessibility: Screen readers announce when limit reached and when space becomes available

### Story 2.6: WIP Count Indicator

**As a** user,
**I want** to see at a glance how many active tasks I have and how close I am to my limit,
**so that** I'm aware of my constraint status without needing to count tasks manually.

**Acceptance Criteria:**

1. WIP count indicator displayed prominently in UI header or near task list: "[N] of [limit] active tasks"
2. Visual design uses progress indicator (e.g., "[5/7]" or progress bar showing 5 out of 7)
3. Color coding indicates status: green when well below limit (0-60%), yellow when approaching (60-90%), orange at limit (100%)
4. Indicator updates in real-time as tasks are added, completed, or deleted
5. Clicking/tapping indicator opens settings to adjust WIP limit (quick access to configuration)
6. Tooltip on hover provides context: "Work In Progress limit helps you stay focused"
7. Indicator is responsive and visible at all screen sizes (doesn't hide on narrow windows)
8. When at limit, indicator styling emphasizes state change (subtle animation, distinct color)
9. Indicator accessible to screen readers: "5 of 7 active tasks, below limit" or "7 of 7 active tasks, at limit"
10. Visual design integrates with overall UI aesthetic (calming colors, clean typography)

### Story 2.7: Analytics Service for Behavioral Data Tracking

**As a** developer,
**I want** an AnalyticsService that captures and calculates behavioral metrics,
**so that** we have data insights available for future features and can validate MVP success criteria.

**Acceptance Criteria:**

1. AnalyticsService class created with methods: `getCompletionRate()`, `getAverageTaskLifetime()`, `getTaskCountByStatus()`, `getOldestActiveTask()`
2. `getCompletionRate()` calculates (tasks completed / total tasks created) × 100, returns percentage
3. `getAverageTaskLifetime()` calculates mean lifetimeDuration for completed tasks, returns milliseconds
4. `getTaskCountByStatus()` returns object: `{ active: number, completed: number }`
5. `getOldestActiveTask()` finds active task with earliest createdAt timestamp, useful for age indicators
6. Service reads data from DataService/TaskService (no separate analytics storage for MVP)
7. Calculations handle edge cases: division by zero (no completed tasks), empty task list
8. Analytics calculated on-demand (not cached) for MVP simplicity - acceptable performance for <10k tasks
9. Unit tests verify calculations with various task datasets: all active, all completed, mixed states, empty
10. Service provides foundation for Phase 2 visual trend dashboard without needing refactoring

### Story 2.8: First-Launch Configuration Flow

**As a** first-time user,
**I want** to be guided through initial setup when I first use the app,
**so that** I can configure my WIP limit and understand what the app does.

**Acceptance Criteria:**

1. App detects first launch by checking for absence of config.json or specific "hasCompletedSetup" flag
2. First-launch screen displays before main task view with welcoming message: "Welcome to Simple To-Do App!"
3. Setup flow explains core concept: "This app helps you focus by limiting how many tasks you can have active at once"
4. User prompted to choose WIP limit with clear explanation: "How many active tasks feel manageable for you?" (5-10 options)
5. Default suggestion highlighted: "Most users find 7 tasks works well - you can change this later in Settings"
6. Visual examples or illustrations show the concept (optional but helpful)
7. "Get Started" button saves configuration and proceeds to main task view
8. Configuration persisted immediately so user doesn't see setup flow again
9. Setup flow skippable with "Use default settings" option that sets limit to 7 and proceeds
10. First-launch flow is one-time only - settings can be changed later but setup doesn't reappear
11. First-launch flow includes message: "This is a pilot version. We'd love your feedback - find the Feedback link in Settings!"

### Story 2.9: Testing and Epic Validation

**As a** developer and product manager,
**I want** comprehensive tests for WIP and tracking features with validation of epic objectives,
**so that** we ensure quality and confirm we've delivered the epic's value proposition.

**Acceptance Criteria:**

1. Unit tests for WIPLimitService verify: limit enforcement, configuration validation, helpful message generation
2. Unit tests for AnalyticsService verify: completion rate calculations, average lifetime, edge case handling
3. Integration tests for config API endpoints: reading/writing WIP limit, validation errors
4. Integration tests for task creation with WIP limit: blocking at limit, allowing under limit
5. End-to-end manual testing checklist completed: configure limit, hit limit, receive helpful message, complete task to free space, analytics calculations accurate
6. Test coverage for new services (WIPLimitService, AnalyticsService) reaches 80%+
7. User acceptance validation: WIP limit prevents task creation with encouraging messaging (per PRD FR6-FR8)
8. Data validation: All tasks in system now have complete metadata (textLength, lifetimeDuration for completed)
9. Epic demo-able: Can show working WIP enforcement, adjustable limits, and basic analytics queries
10. Documentation updated: README includes WIP limit feature explanation and analytics capabilities

## Epic 3 Details: Celebration Mechanics & User Experience Polish

**Epic Goal:** Add the celebration system to provide positive reinforcement when users complete tasks, creating emotional engagement and building momentum. Implement UX refinements including task age visual indicators, differentiated empty states (quick start guide for new users, inbox zero celebration for returning users), and overall polish to create the supportive, encouraging experience defined in the PRD. By the end of this epic, the app feels emotionally supportive and complete from a user experience perspective.

### Story 3.1: Celebration Service - Message Generation and Variety

**As a** developer,
**I want** a CelebrationService that generates varied, encouraging messages,
**so that** task completions trigger positive reinforcement without repetition.

**Acceptance Criteria:**

1. CelebrationService class created with method: `getCelebrationMessage()` returns random celebration message
2. Service maintains pool of at least 10 distinct celebration messages (per PRD FR10)
3. Message variety includes different tones: enthusiastic ("Amazing! You crushed it! 🎉"), supportive ("One more done! You're making progress."), data-driven ("Task completed! That's [N] this week."), motivational ("Keep the momentum going!")
4. Messages avoid patronizing language and maintain professional tone suitable for work contexts
5. Message selection uses random algorithm ensuring reasonable distribution (avoid same message twice in a row)
6. Service tracks recently used messages (last 3-5) to minimize immediate repetition
7. Messages can include dynamic data: task count completed today/week, completion streak (if implemented)
8. TypeScript interface defines CelebrationMessage type with text and optional metadata
9. Unit tests verify: message variety (10+ unique), no immediate repetition, random distribution over 100 calls
10. Messages aligned with PRD branding: encouraging without being childish, professional without being sterile

### Story 3.2: Celebration API Endpoint

**As a** frontend developer,
**I want** an API endpoint that returns celebration messages when tasks are completed,
**so that** the UI can display celebrations triggered by task completion events.

**Acceptance Criteria:**

1. `GET /api/celebrations/message` - Returns random celebration message as `{ message: string, variant: string }`
2. Variant field indicates message tone: "enthusiastic", "supportive", "motivational", "data-driven" (for styling purposes)
3. Endpoint optionally accepts query param `?taskId=<id>` to include task-specific context in message
4. Response includes metadata for UI rendering: `{ message: string, variant: string, duration: number }` (suggested display duration in milliseconds)
5. Default duration suggestion is 5000ms (5 seconds) per PRD UX goals
6. Endpoint calls CelebrationService.getCelebrationMessage() to generate message
7. Lightweight endpoint with fast response time (<10ms) since it's called frequently
8. No authentication required (consistent with single-user local app)
9. Integration tests verify: endpoint returns varied messages, variant types populated correctly
10. Error handling: Returns default celebration if service fails ("Great job! Task completed.")

### Story 3.3: Celebration Display Component - Visual Design and Animation

**As a** user,
**I want** to see a celebratory visual when I complete a task,
**so that** I feel positive reinforcement and satisfaction for making progress.

**Acceptance Criteria:**

1. Celebration component renders as prominent overlay (modal-style but non-blocking) in center of screen
2. Component displays celebration message with vibrant visual effects (per PRD: warm oranges, yellows, energetic greens)
3. Entrance animation: Celebration slides in or fades in smoothly (200-300ms animation)
4. Visual elements include: celebration text, icon/emoji (✓, 🎉, ⭐), optional confetti animation or particle effect
5. Component is user-dismissible: clicking anywhere on overlay or pressing Escape key dismisses it immediately
6. Auto-dismiss after 5-10 seconds if user doesn't manually dismiss (configurable, default 7 seconds)
7. Exit animation: Celebration fades out smoothly when dismissed (200-300ms animation)
8. Multiple completions in quick succession queue celebrations (show one at a time, not stacking)
9. Celebration does NOT block interaction - users can continue working while celebration displays
10. Component styling uses vibrant accent colors from PRD, stands out visually without being harsh

### Story 3.4: Celebration Integration with Task Completion

**As a** user,
**I want** celebrations to appear automatically every time I complete a task,
**so that** I consistently experience positive reinforcement for my progress.

**Acceptance Criteria:**

1. Completing a task via "Complete" button triggers celebration display immediately after task marked complete
2. Celebration fetched from `GET /api/celebrations/message` when task completion API call succeeds
3. Celebration shows AFTER task removed from active list (optimistic UI) - completion feels instant, then celebration appears
4. If celebration API fails, fallback message displays: "Great job! Task completed."
5. Celebration includes completed task context if available: "You completed '[task text]'!" (truncate long tasks)
6. No celebration shown if task completion API call fails (error state takes precedence)
7. Rapid multiple completions (2+ within 1 second) queue celebrations, showing each for reduced duration (3 seconds each)
8. Celebration system doesn't interfere with keyboard shortcuts - users can keep working while celebration displays
9. First completion after app launch includes extra context: "First task done! Keep it up!" (special first-celebration variant)
10. Celebration timing feels natural - appears quickly enough to connect with action but not so fast it feels jarring

### Story 3.5: Task Age Visual Indicators

**As a** user,
**I want** to see which tasks have been sitting around for a while,
**so that** I'm reminded to address older tasks and prevent procrastination.

**Acceptance Criteria:**

1. Task age calculated based on createdAt timestamp compared to current time
2. Age categories defined: Fresh (<24 hours), Recent (1-3 days), Aging (3-7 days), Old (7-14 days), Stale (14+ days)
3. Visual indicator displayed for each task: color coding, badge, or icon representing age category
4. Color progression: Fresh (no indicator or neutral), Recent (light blue #60A5FA), Aging (yellow #FBBF24), Old (orange #F97316), Stale (red/pink #F43F5E)
5. Indicator subtle for fresh/recent tasks, more prominent for aging/old/stale to draw attention
6. Tooltip on hover explains age: "Created 5 days ago" (human-readable relative time)
7. Tasks in chronological order but age indicators help users identify old items even if buried
8. Age indicators update automatically as time passes (component re-renders periodically or on action)
9. Visual design integrates with task list aesthetically - doesn't clutter or overwhelm
10. Accessibility: Screen readers announce task age along with task text ("Buy groceries, created 5 days ago")

### Story 3.6: Empty State - First-Time User Quick Start Guide

**As a** first-time user with no tasks,
**I want** to see guidance on how to use the app,
**so that** I understand the core features and can get started quickly.

**Acceptance Criteria:**

1. Empty state displays when: user has zero active tasks AND hasCompletedSetup flag indicates new user
2. Quick start guide shows app overview: "Welcome! This app helps you stay focused with smart task management."
3. Guide highlights 3 core features with icons/visuals: WIP Limits (constraint), Celebrations (motivation), Proactive Prompts (coming soon note)
4. Step-by-step instructions: "1. Add your first task above, 2. Complete it to see a celebration, 3. Your WIP limit is set to [N] tasks"
5. Visual design inviting and educational, not overwhelming - uses illustrations or simple graphics
6. "Got it!" or "Get Started" button dismisses guide and marks user as no longer first-time (updates flag)
7. Guide can be re-accessed via Help menu → "Show Getting Started Guide" (links to Story 3.11)
8. Guide is responsive and readable on all screen sizes
9. Accessibility: Guide content structured with headings, lists, and semantic HTML for screen readers
10. Guide sets positive, encouraging tone aligned with PRD's supportive personality

### Story 3.7: Empty State - Inbox Zero Celebration for Returning Users

**As a** returning user who completes all tasks,
**I want** to see a special celebration when I reach zero active tasks,
**so that** I feel accomplished and motivated by this achievement.

**Acceptance Criteria:**

1. Inbox Zero celebration displays when: user has zero active tasks AND hasCompletedSetup flag indicates returning user (not first-time)
2. Celebration message: "You completed everything! 🎉" with congratulatory tone
3. Visual design more elaborate than regular task completion celebrations - larger, more vibrant, maybe animated
4. Statistics displayed: "You completed [N] tasks this session/today/week" (using AnalyticsService)
5. Optional: "completion streak" shown if user has consecutive days of hitting inbox zero
6. Call-to-action button: "Add New Tasks" returns user to normal view ready to add tasks
7. Celebration persists until user dismisses or adds new task (doesn't auto-dismiss like regular celebrations)
8. Visual uses vibrant accent colors from PRD with maximum positive energy
9. Message varies if user hits inbox zero multiple times: "Back to zero! You're on fire!" or "All clear again!"
10. Inbox Zero celebration distinct from first-time guide - celebrates achievement, not education

### Story 3.8: Settings Screen - Celebration Preferences

**As a** user,
**I want** to customize celebration behavior,
**so that** I can adjust the feature to match my preferences.

**Acceptance Criteria:**

1. Settings screen includes "Celebration Preferences" section
2. Toggle option: "Enable celebrations" (on by default) - allows users to disable celebrations entirely if they find them distracting
3. Duration slider: "Celebration duration" (3-10 seconds range, default 7 seconds) - controls auto-dismiss timing
4. Preview button: "Preview celebration" triggers sample celebration so users can see changes immediately
5. Preferences saved to config.json and persist across app restarts
6. When celebrations disabled, completing tasks still works but no celebration overlay appears
7. Settings UI explains benefit: "Celebrations provide positive reinforcement to build momentum"
8. Changes take effect immediately without requiring app restart
9. Settings accessible and clearly labeled for easy discovery
10. Default settings optimized for most users (celebrations on, 7-second duration) per UX research

### Story 3.9: UI Polish and Responsive Design Refinement

**As a** user,
**I want** the app to look polished and work smoothly at any window size,
**so that** I have a pleasant, professional experience regardless of how I arrange my windows.

**Acceptance Criteria:**

1. Overall UI uses consistent spacing, typography, and color palette per PRD (calming base, vibrant accents)
2. Responsive breakpoints defined: Large (>1024px), Medium (768-1024px), Small (480-768px), XSmall (<480px)
3. At small widths: Task list remains readable, action buttons don't overlap, add task input doesn't break
4. At narrow sidebar widths (300-400px): UI adapts gracefully, possibly stacking elements vertically
5. Touch targets meet minimum 44x44px size for mobile/tablet usability (buttons, checkboxes, links)
6. Loading states include smooth skeleton screens or spinners (not jarring blank screens)
7. Error messages styled consistently with appropriate severity colors (info, warning, error)
8. Animations smooth and performant (60fps) even on lower-powered devices
9. Dark mode consideration: While not required for MVP, use CSS variables for colors to enable future dark mode
10. Overall aesthetic matches PRD: minimal, clean, modern, calming yet encouraging

### Story 3.10: Testing and Epic Validation

**As a** developer and product manager,
**I want** comprehensive tests for celebration and UX features with validation of epic objectives,
**so that** we ensure quality and confirm we've delivered emotional engagement and polish.

**Acceptance Criteria:**

1. Unit tests for CelebrationService verify: message variety (10+ unique), no immediate repetition, message selection logic
2. Integration tests for celebration API endpoint: returns varied messages, includes variant metadata
3. Manual testing checklist completed: celebrations appear on task completion, age indicators visible, empty states work for new/returning users
4. User acceptance validation: Celebrations feel encouraging not patronizing, auto-dismiss timing feels natural
5. Cross-browser testing: Celebrations and animations work in Chrome, Firefox, Safari, Edge
6. Responsive testing: UI tested at multiple window sizes (full screen, half screen, narrow sidebar)
7. Accessibility testing: Keyboard navigation works for all new features, screen reader announces celebrations
8. Performance validation: Celebrations don't cause UI lag, animations smooth at 60fps
9. Epic demo-able: Can show task completion → celebration → empty states → age indicators flow
10. Documentation updated: README includes celebration feature, empty states, and UX polish details
11. Help modal tested for accessibility (keyboard navigation, screen reader compatibility)
12. Help content reviewed for clarity and tone alignment with PRD

### Story 3.11: Help Documentation & In-App Guidance

**As a** user,
**I want** accessible help documentation explaining features and answering common questions,
**so that** I can understand how to use the app effectively without external support.

**Acceptance Criteria:**

1. Help menu/icon added to app header or settings navigation (? icon or "Help" text link)
2. Clicking Help opens Help modal/view with tabbed or sectioned content
3. Help content includes 5 core sections:
   - **Getting Started:** Overview of add task → complete → celebration flow
   - **WIP Limits:** Explanation of why limits exist, how to adjust (5-10 range), benefits
   - **Proactive Prompts:** What they are, how to respond (complete/dismiss/snooze), how to configure/disable
   - **Keyboard Shortcuts:** List of keyboard navigation (Enter to add task, Escape to cancel, etc.)
   - **Troubleshooting:** Common issues (data not saving, prompts not appearing, browser notification permissions)
4. Quick start guide (Story 3.6) accessible from Help menu via "Show Getting Started Guide" link
5. Help modal is dismissible (Escape key, click outside, Close button)
6. Help content written in encouraging, supportive tone matching PRD personality
7. Screenshots or simple illustrations for complex features (optional for MVP, recommended for usability)
8. "Still need help?" section with feedback email link (connects to Story 4.11)
9. Help menu keyboard accessible (Tab to focus, Enter to open)
10. Help content versionable - stored in markdown files that can be updated without code changes

**File Structure for Help Content:**

```
apps/web/src/content/
├── help/
│   ├── getting-started.md
│   ├── wip-limits.md
│   ├── proactive-prompts.md
│   ├── keyboard-shortcuts.md
│   └── troubleshooting.md
```

**Sample Help Content - WIP Limits Section:**

```markdown
# WIP Limits: Stay Focused

**What are WIP Limits?**
WIP (Work In Progress) limits prevent you from having too many active tasks at once. Research shows that limiting your active tasks improves completion rates and reduces overwhelm.

**How it works:**
- You set a limit between 5-10 active tasks
- When you reach your limit, you must complete or delete a task before adding new ones
- The app shows encouraging messages to help you stay focused, not to punish you

**Adjusting your limit:**
1. Open Settings (gear icon)
2. Find "Work In Progress Limit"
3. Adjust the slider (5-10 tasks)
4. Click Save

**Recommended limit:** Most users find 7 tasks works well, but adjust based on your personal productivity style.
```

**Technical Implementation:**
- Help content rendered from markdown using a markdown parser (e.g., `react-markdown`)
- Help modal component lazy-loaded to reduce initial bundle size
- Help content minified in production build

## Epic 4 Details: Proactive Prompting System

**Epic Goal:** Build the core innovation that differentiates this app from all competitors - a proactive prompting system that initiates interaction by suggesting specific tasks to users at intelligent intervals. Implement non-blocking toast notifications, user response handling (complete/dismiss/snooze), configurable prompting frequency, optional browser notification integration, and the ability to opt-out entirely. By the end of this epic, we validate the unproven hypothesis that proactive engagement increases task completion rates and transforms the app from passive tool to active productivity partner.

### Story 4.1: Prompting Service - Core Scheduling Logic

**As a** developer,
**I want** a PromptingService that manages the scheduling and selection of task prompts,
**so that** proactive prompts are generated at appropriate intervals with proper task selection.

**Acceptance Criteria:**

1. PromptingService class created with methods: `startScheduler()`, `stopScheduler()`, `generatePrompt()`, `selectTaskForPrompt()`
2. Scheduler uses `node-schedule` library or `setInterval` to trigger prompts at configured intervals
3. Default prompting interval: 2-3 hours, randomly selected within range for each prompt (per PRD FR11)
4. `selectTaskForPrompt()` chooses one active task from TaskService using random selection algorithm for MVP
5. `generatePrompt()` creates prompt object: `{ taskId: string, taskText: string, promptedAt: timestamp }`
6. Service reads prompting configuration from config.json: `{ enabled: boolean, frequencyHours: number }`
7. If prompting disabled in config, scheduler doesn't start (respects opt-out)
8. Scheduler only runs when there are active tasks available (pauses when task list empty)
9. Service tracks last prompt time to ensure proper interval spacing
10. Unit tests verify: scheduler triggers at intervals, task selection logic, respects enabled/disabled state

### Story 4.2: Prompt Delivery - Server-Sent Events (SSE) Infrastructure

**As a** developer,
**I want** Server-Sent Events implemented for real-time prompt delivery from backend to frontend,
**so that** prompts can be pushed to the browser without polling.

**Acceptance Criteria:**

1. SSE endpoint created: `GET /api/prompts/stream` establishes persistent connection for prompt delivery
2. Endpoint sends `keep-alive` messages every 30 seconds to maintain connection
3. When PromptingService generates prompt, server sends event through SSE stream: `event: prompt\ndata: {taskId, taskText, promptedAt}\n\n`
4. Frontend SSE client (EventSource) connects to stream on app load
5. Connection automatically reconnects if dropped (EventSource handles this by default)
6. Multiple browser tabs/windows supported - each receives prompts independently
7. SSE endpoint only sends prompts if prompting enabled in config
8. Graceful degradation: If SSE not supported (old browsers), fall back to periodic polling (optional for MVP)
9. Integration tests verify: SSE connection established, events received by client, reconnection works
10. Performance: SSE connection uses minimal resources, doesn't impact app responsiveness

### Story 4.3: Toast Notification Component - Non-Blocking Prompt Display

**As a** user,
**I want** task prompts to appear as non-intrusive notifications in the corner of the screen,
**so that** I'm gently reminded without being interrupted from my current work.

**Acceptance Criteria:**

1. Toast notification component renders in screen corner (bottom-right or top-right, configurable)
2. Toast displays message: "Could you do [task text] now?" with truncation for long tasks (max 60 characters)
3. Toast includes three action buttons: "Complete" (green checkmark), "Dismiss" (X icon), "Snooze" (clock icon)
4. Toast persists for 30 seconds then auto-dismisses if user doesn't interact (per PRD UX goals)
5. Entrance animation: Toast slides in from edge smoothly (300ms animation)
6. Exit animation: Toast slides out when dismissed or times out (300ms animation)
7. Toast is clickable/expandable to show full task text if truncated
8. Multiple prompts queue - only one toast visible at a time, next shows after current dismissed
9. Toast styling uses neutral colors (not vibrant accents) to be informative not demanding
10. Toast doesn't block interaction with main UI - user can continue working while toast visible

### Story 4.4: Prompt Response Handling - Complete/Dismiss/Snooze

**As a** user,
**I want** to respond to task prompts by completing, dismissing, or snoozing them,
**so that** I have control over how I engage with proactive suggestions.

**Acceptance Criteria:**

1. Clicking "Complete" button on toast calls `PATCH /api/tasks/:id/complete` and triggers celebration
2. After completing task via prompt, toast disappears and celebration appears (same as manual completion)
3. Clicking "Dismiss" button removes toast immediately, no other action taken
4. Clicking "Snooze" button dismisses toast and reschedules prompt for same task in 1 hour (per PRD FR12)
5. API endpoint created: `POST /api/prompts/snooze` accepts `{ taskId: string }` and schedules future prompt
6. Snooze scheduling tracked in memory or persisted to prevent duplicate prompts for same task
7. If snoozed task is completed or deleted before snooze time, scheduled prompt is cancelled
8. Prompt response tracking logged for analytics: track response type (complete/dismiss/snooze) and timestamp
9. User can't be prompted for same task twice within 24 hours (prevents annoying repetition)
10. Integration tests verify: complete response triggers task completion, dismiss removes toast, snooze reschedules

### Story 4.5: Prompting Configuration in Settings

**As a** user,
**I want** to configure how often I receive prompts and disable them entirely if desired,
**so that** I have control over the proactive feature's intrusiveness.

**Acceptance Criteria:**

1. Settings screen includes "Proactive Prompts" section with configuration options
2. Toggle: "Enable proactive prompts" (on by default) - disables/enables entire prompting system
3. Frequency slider: "Prompt frequency" (1-6 hours range, default 2-3 hours) controls interval (per PRD FR17)
4. Explanation text: "The app will suggest a task for you to complete every [N] hours to help you make progress"
5. When prompting disabled, scheduler stops and no prompts generated until re-enabled
6. Frequency changes take effect for next scheduled prompt (current cycle completes at old interval)
7. Settings show time until next prompt: "Next prompt in approximately [X] minutes" (rough estimate)
8. "Test prompt now" button allows user to trigger immediate prompt to see what they look like
9. Settings saved to config.json and persist across app restarts
10. API endpoint created: `PUT /api/config/prompting` accepts `{ enabled: boolean, frequencyHours: number }`

### Story 4.6: Browser Notification Integration (Opt-In)

**As a** user,
**I want** the option to receive browser notifications when prompts occur,
**so that** I can be notified even when the app is in a background tab.

**Acceptance Criteria:**

1. Settings screen includes option: "Enable browser notifications" (off by default per PRD UX revision)
2. Toggle is disabled until user grants browser notification permission
3. Clicking toggle prompts user for notification permission using browser's native permission dialog
4. If permission granted, toggle becomes enabled and browser notifications activate
5. If permission denied, toggle remains disabled with message: "Permission denied. Enable in browser settings to use this feature."
6. When browser notifications enabled, prompts trigger both in-app toast AND browser notification
7. Browser notification includes: "Simple To-Do App" title, "Could you do [task text] now?" message, app icon
8. Clicking browser notification brings app window to focus and shows in-app toast with actions
9. Browser notifications respect user's OS notification settings (Do Not Disturb, quiet hours)
10. Settings persist browser notification preference in config.json

### Story 4.7: Prompt Analytics and Success Tracking

**As a** developer and product manager,
**I want** to track how users respond to prompts (response rate, action types),
**so that** we can measure whether proactive prompting achieves our innovation hypothesis goals.

**Acceptance Criteria:**

1. PromptingService tracks all prompt events: `{ promptId: string, taskId: string, promptedAt: timestamp, response: 'complete'|'dismiss'|'snooze'|'timeout', respondedAt: timestamp }`
2. Prompt events persisted to prompts.json file for historical analysis
3. AnalyticsService extended with methods: `getPromptResponseRate()`, `getPromptResponseBreakdown()`, `getAverageResponseTime()`
4. `getPromptResponseRate()` calculates (prompts with action / total prompts) × 100, target ≥40% per PRD
5. `getPromptResponseBreakdown()` returns object: `{ complete: number, dismiss: number, snooze: number, timeout: number }`
6. `getAverageResponseTime()` calculates mean time between promptedAt and respondedAt for engaged prompts
7. API endpoint created: `GET /api/analytics/prompts` returns prompt statistics for display
8. Statistics displayed in Settings or dedicated analytics view (optional): "Prompt response rate: [X]%"
9. Data collection respects privacy: stored locally only, never transmitted (per NFR4)
10. Unit tests verify: tracking logic, calculation accuracy, response rate formulas

### Story 4.8: Smart Prompt Timing and User Context Awareness (Optional Enhancement)

**As a** user,
**I want** prompts to avoid interrupting me at inconvenient times,
**so that** proactive suggestions feel helpful rather than disruptive.

**Acceptance Criteria:**

1. Prompting service detects user activity: if user actively working in app (added/completed task in last 5 min), delay prompt
2. "Quiet hours" configuration in settings: User can set time range when prompts shouldn't occur (e.g., 10pm-8am)
3. If quiet hours configured, scheduler skips prompts during that window
4. Prompt backlog: If prompts missed during quiet hours, don't catch up with multiple prompts - just resume normal schedule
5. Optional: Detect if user has tab focused - only show in-app toast if app visible, queue for when they return
6. Configuration saved to config.json: `{ quietHoursStart: "22:00", quietHoursEnd: "08:00" }`
7. Settings UI for quiet hours: time pickers for start and end times with toggle to enable/disable
8. When prompt delayed due to user activity, next prompt rescheduled for random interval within configured range
9. Quiet hours respect user's local timezone (use client-side time, not server time)
10. Feature is optional - if not configured, prompts occur at any time within frequency interval

### Story 4.9: First Prompt Onboarding and Education

**As a** first-time user receiving a prompt,
**I want** to understand what the prompt is and why I'm receiving it,
**so that** I'm not confused or annoyed by this unfamiliar feature.

**Acceptance Criteria:**

1. First prompt a user receives includes additional educational overlay or tooltip
2. Education message explains: "This is a proactive prompt - the app suggests a task to help you make progress. You can complete it, dismiss it, or snooze for later."
3. Visual indicator marks first prompt as special (highlight, subtle animation, or info icon)
4. "Don't show this again" checkbox allows user to skip education on future prompts
5. After first prompt interaction (any response), education overlay doesn't appear again
6. First prompt timing: Wait at least 15 minutes after app launch before first prompt (let user acclimate)
7. If user completes first prompt, extra encouragement: "Great! You engaged with your first proactive prompt."
8. If user dismisses first prompt, gentle follow-up in next prompt: "Not ready? You can snooze or disable prompts in Settings."
9. Education state tracked in config.json: `{ hasSeenPromptEducation: boolean }`
10. Education doesn't feel patronizing - brief, clear, and respectful of user's intelligence

### Story 4.10: Testing, Epic Validation, and MVP Completion

**As a** developer and product manager,
**I want** comprehensive testing of the prompting system and overall MVP validation,
**so that** we confirm the app is ready for pilot user testing and meets all PRD requirements.

**Acceptance Criteria:**

1. Unit tests for PromptingService verify: scheduling logic, task selection, configuration handling
2. Integration tests for SSE verify: connection establishment, event delivery, reconnection handling
3. Integration tests for prompt responses: complete action completes task, dismiss removes toast, snooze reschedules
4. Manual end-to-end testing checklist completed: receive prompt, test all response types, verify analytics tracking
5. Cross-feature testing: Prompt-triggered completion shows celebration, WIP limit respected, data tracked correctly
6. User acceptance criteria validation: All FR requirements (FR1-FR19) tested and working
7. Non-functional requirements validation: Startup time <2s, task operations <100ms, 70%+ test coverage achieved
8. Pilot user readiness: README with setup instructions, app runs cleanly on Windows/Mac/Linux, no critical bugs
9. Epic demo-able: Can demonstrate full user journey including receiving and responding to prompts
10. MVP complete: All 4 epics delivered, app ready for pilot user testing phase
11. Pilot users informed of feedback channels during onboarding

### Story 4.11: Pilot User Feedback Collection System

**As a** pilot user,
**I want** easy ways to provide feedback about my experience with the app,
**so that** I can report bugs, suggest improvements, and help shape the product's evolution.

**As a** product manager,
**I want** a structured mechanism to collect pilot user feedback,
**so that** I can validate MVP hypotheses and identify issues before broader release.

**Acceptance Criteria:**

1. Feedback link added to Settings screen or Help menu: "Send Feedback" button/link prominently displayed
2. Clicking feedback link opens user's default email client with pre-populated template:
   - **To:** [project email or maintainer email]
   - **Subject:** "Simple To-Do App Feedback"
   - **Body template:** "**What I was doing:** \n\n**What happened:** \n\n**What I expected:** \n\n**Suggestions:** \n\n---\nApp Version: [version from package.json]\nOS: [auto-detected if possible, otherwise user fills in]\n"
3. Alternative feedback option: GitHub Issues link in Help menu (if repository is public)
4. GitHub Issues link opens in browser to repository's issues page with "bug" and "enhancement" label templates
5. README.md updated with "Providing Feedback" section explaining both feedback channels
6. In-app feedback button includes tooltip: "Report bugs or suggest improvements"
7. First-launch configuration flow (Story 2.8) includes optional message: "This is a pilot version - your feedback helps us improve!"
8. Feedback mechanism works offline (email client) and online (GitHub)
9. No analytics or telemetry sent automatically - respects NFR4 privacy-first design
10. Feedback instructions visible but not intrusive - doesn't interrupt user workflows

**Optional Enhancements (Phase 2):**
- In-app feedback form that saves to local JSON for offline collection
- Export system state (tasks.json, config.json, logs) for bug reports
- Feedback prompt after 1 week of usage: "How's it going? We'd love your feedback!"

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 95%

**MVP Scope Appropriateness:** Just Right - The 4-epic structure balances delivering value with maintaining a tight 4-6 week timeline. Each epic builds logically on the previous while delivering independently valuable functionality.

**Readiness for Architecture Phase:** READY

**Most Critical Success Factors:**
- Comprehensive epic breakdown with 38 stories and ~380 acceptance criteria provides clear implementation roadmap
- Technical assumptions section gives architect clear constraints and technology decisions
- UX design goals refined through critical analysis ensure non-intrusive proactive prompting
- Strong alignment between Project Brief, PRD requirements, and epic stories

### Category Analysis

| Category                         | Status  | Critical Issues |
| -------------------------------- | ------- | --------------- |
| 1. Problem Definition & Context  | PASS    | None - well articulated in Background Context |
| 2. MVP Scope Definition          | PASS    | Scope is appropriate, epics are sequenced logically |
| 3. User Experience Requirements  | PASS    | Comprehensive UX Design Goals section with refined interaction paradigms |
| 4. Functional Requirements       | PASS    | 19 FRs covering all MVP features, refined through elicitation |
| 5. Non-Functional Requirements   | PASS    | 12 NFRs covering performance, security, reliability, technical constraints |
| 6. Epic & Story Structure        | PASS    | 4 epics, 38 stories, logical sequencing, appropriate sizing |
| 7. Technical Guidance            | PASS    | Detailed Technical Assumptions section with rationales |
| 8. Cross-Functional Requirements | PASS    | Data model, integration, operational needs covered in stories |
| 9. Clarity & Communication       | PASS    | Well-structured, consistent terminology, clear documentation |

### Final Assessment

**READY FOR ARCHITECT ✅**

The PRD and epic structure are comprehensive, properly scoped, and ready for architectural design. The documentation provides clear problem statement, well-defined requirements, detailed epic breakdown with 38 stories and ~380 acceptance criteria, decisive technical constraints, and thoughtful UX design goals.

**Confidence Level:** HIGH

**Next Steps:** Hand off to UX Expert and Architect (can work in parallel)

## Next Steps

### UX Expert Prompt

You are the UX Expert receiving a handoff from the Product Manager for the Simple To-Do App project.

**Your Task:** Review the PRD (docs/prd.md) and Project Brief (docs/brief.md), then create a comprehensive UI/UX design specification that brings the product vision to life.

**Key Focus Areas:**

1. **Design System:** Create a calming base color palette (soft blues, greens, grays) + vibrant accent colors (warm oranges, yellows, energetic greens) for celebrations. Define typography, spacing, and component styles.

2. **Core Components:** Design the non-blocking toast notification for proactive prompts, celebration overlay with animations, task age visual indicators, and empty states (first-time guide vs inbox zero celebration).

3. **Responsive Layouts:** Define breakpoints and layouts for the main task list view, settings screen, and first-launch configuration that work from narrow sidebars (300px) to full-screen displays.

4. **Interaction Details:** Specify animations (entrance/exit timing, easing functions), micro-interactions, and state transitions that create the "supportive productivity partner" feeling.

5. **Accessibility:** Ensure keyboard navigation, screen reader support, sufficient color contrast, and focus indicators for primary actions.

**Deliverables:** UI/UX design document with component specifications, responsive wireframes/mockups, interaction patterns, and design system guidelines.

**Critical Constraint:** The proactive prompting innovation depends on non-intrusive UX - toasts must be helpful, not annoying.

### Architect Prompt

You are the Architect receiving a handoff from the Product Manager for the Simple To-Do App project.

**Your Task:** Review the PRD (docs/prd.md) and Project Brief (docs/brief.md), then create a comprehensive technical architecture that implements the requirements efficiently and maintainably.

**Key Focus Areas:**

1. **System Architecture:** Design the monolithic Node.js/TypeScript application structure (Express backend + React frontend + Vite build) with clear separation between client, server, and shared code.

2. **Data Layer:** Design the DataService abstraction that works with JSON file storage initially but enables future SQLite migration. Define the task data schema and config file structures.

3. **Service Layer:** Architect TaskService, WIPLimitService, CelebrationService, PromptingService, and AnalyticsService with clear interfaces and dependencies.

4. **Real-Time Infrastructure:** Design Server-Sent Events (SSE) implementation for proactive prompting with reconnection logic, keep-alive strategy, and fallback approaches.

5. **Testing Strategy:** Define unit and integration testing approach to achieve 70%+ coverage using Jest, including how to mock SSE and test background scheduling.

**Deliverables:** Architecture document with system diagrams, data models, API specifications, service interfaces, deployment architecture, and testing strategy.

**Critical Constraints:**
- Localhost-only, single-user, privacy-first (no external data transmission)
- Must support 10,000 tasks without performance degradation
- Proactive prompting requires background scheduling and real-time push to browser

**Technical Risks to Address:** SSE implementation complexity, JSON storage scaling, background scheduler reliability.
