# Epic 1 Details: Foundation & Core Task Management

**Epic Goal:** Establish the project infrastructure (Node.js/TypeScript setup, Git repository, basic CI, Express server, React app with Vite) and deliver the foundational task management functionality. By the end of this epic, users can add, view, edit, delete, and complete tasks through a clean, responsive web interface with data persisted to local JSON storage. This epic proves the technical stack works and delivers immediate value - a functioning to-do list.

## Story 1.1: Project Setup and Development Environment

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

## Story 1.2: JSON Data Storage Layer

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

## Story 1.3: Task Service - Core CRUD Operations

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

## Story 1.4: REST API Endpoints for Task Management

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

## Story 1.5: React UI - Main Task List View

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

## Story 1.6: React UI - Add Task Functionality

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

## Story 1.7: React UI - Complete and Delete Task Actions

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

## Story 1.8: React UI - Edit Task Functionality

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

## Story 1.9: Basic Testing and Deployment Setup

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
