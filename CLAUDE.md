# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## CRITICAL: File Editing on Windows

### ⚠️ MANDATORY: Always Use Backslashes on Windows for File Paths

**When using Edit or MultiEdit tools on Windows, you MUST use backslashes (`\`)
in file paths, NOT forward slashes (`/`).**

#### ❌ WRONG - Will cause errors:

```
Edit(file_path: "D:/repos/project/file.tsx", ...)
MultiEdit(file_path: "D:/repos/project/file.tsx", ...)
```

#### ✅ CORRECT - Always works:

```
Edit(file_path: "D:\repos\project\file.tsx", ...)
MultiEdit(file_path: "D:\repos\project\file.tsx", ...)
```

## Development Commands

### Creating a git commit message

**Always use the `c:\Users\x374780\.git_commit_template.txt` file as a guide and template when creating a git commit message.**

### Running the application

```bash
npm run dev              # Start both frontend (port 3000) and backend (port 3001) concurrently
npm run dev -w @simple-todo/server   # Start only backend
npm run dev -w @simple-todo/web      # Start only frontend
```

### Building

```bash
npm run build            # Build both frontend and backend
npm run build -w @simple-todo/server  # Build only backend
npm run build -w @simple-todo/web     # Build only frontend
```

### Testing

```bash
npm test                 # Run all tests (Jest for server, Vitest for web)
npm run test:server      # Run only server tests (Jest)
npm run test:web         # Run only web tests (Vitest)
npm run test:coverage    # Run tests with coverage reports
```

### Code Quality

```bash
npm run validate         # Run type-check, lint, and format-check (run before committing)
npm run type-check       # TypeScript type checking across all packages
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted
```

## Architecture Overview

### Monorepo Structure

This is an npm workspaces monorepo with a clear separation between frontend,
backend, and shared code:

- **apps/server**: Express backend API with TypeScript
- **apps/web**: React 18 frontend with Vite bundler
- **packages/shared**: Shared TypeScript types and utilities (used by both apps)
- **packages/config**: Shared ESLint and TypeScript configurations

### Backend Architecture (apps/server)

The backend follows a **layered service architecture**:

1. **Routes layer** (`src/routes/`): Express route handlers that validate input
   and handle HTTP concerns
   - Validates request parameters (UUID format, status values)
   - Maps HTTP status codes (201 Created, 204 No Content, 400 Bad Request, 404
     Not Found)
   - Does NOT contain business logic

2. **Service layer** (`src/services/`): Business logic and orchestration
   - **TaskService**: CRUD operations, validation rules (text length 1-500
     chars, status transitions)
   - **DataService**: Persistence abstraction with atomic file writes (temp
     file + rename pattern)

3. **Data storage**: JSON file-based storage in `data/tasks.json`
   - Uses atomic writes to prevent corruption (write to `.tmp` file, then
     rename)
   - DataService handles all file I/O and ensures directory exists

**Important patterns**:

- Services throw errors with specific messages that routes map to HTTP status
  codes
- TaskService depends on DataService (constructor injection for testability)
- All timestamps are ISO 8601 strings
- UUIDs are v4 format

### Frontend Architecture (apps/web)

The frontend uses a **component-view pattern**:

1. **Views** (`src/views/`): Page-level components that handle state and API
   calls
   - TaskListView: Main view managing task list state

2. **Components** (`src/components/`): Reusable UI components (presentational)
   - TaskCard: Individual task display with actions
   - TaskList: List container
   - EmptyState: No tasks placeholder

3. **Services** (`src/services/`): API integration layer
   - `api.ts`: Generic HTTP methods (apiGet, apiPost, apiPatch, apiDelete)
   - `tasks.ts`: Task-specific API methods wrapping the generic API client

**Important patterns**:

- Service layer throws errors that views must handle
- API base URL: `http://localhost:3001`
- Components receive data and callbacks as props (no direct API calls)

### Type Safety & Code Sharing

**packages/shared** exports:

- `Task` interface: Core task entity (id, text, status, createdAt, completedAt)
- `TaskStatus` type: `'active' | 'completed'`
- TaskHelpers utilities (if needed)

**Import paths**: Use workspace aliases

```typescript
import type { Task, TaskStatus } from '@simple-todo/shared/types';
```

### Testing Strategy

**Server (Jest)**:

- Unit tests: `tests/unit/services/` - Test services in isolation with mocked
  dependencies
- Integration tests: `tests/integration/` - Test API routes with supertest
- Test helpers: `tests/helpers/` - Shared test utilities

**Web (Vitest)**:

- Component tests: `tests/unit/components/` - Test components with React Testing
  Library
- Mocks: `tests/mocks/` - MSW handlers for API mocking
- Test setup: `tests/helpers/testSetup.ts` - Global test configuration

## Code Style & Conventions

### ESLint Rules (Key Highlights)

- Consistent type imports: `import type { ... } from '...'` for type-only
  imports
- Import ordering: React first, then external, then internal (alphabetized with
  newlines between groups)
- Explicit return types on functions (warn level, allows type inference in some
  cases)
- No floating promises or misused promises (error level)
- Accessibility rules enforced (jsx-a11y)

### TypeScript

- ES modules throughout (`.js` extensions in imports despite `.ts` source files)
- Type-safe Express routes with explicit `Promise<void>` returns
- Strict null checks enforced

### File Organization

- Routes initialize their own service instances
- One service class per file
- Tests mirror source structure (`src/services/X.ts` →
  `tests/unit/services/X.test.ts`)

## Domain Rules & Constraints

### Task Entity Rules

- Task text: 1-500 characters (enforced in TaskService)
- Only active tasks can be updated (completed tasks are immutable)
- Task IDs are UUIDs (validated in routes)
- completedAt is null for active tasks, ISO 8601 string when completed

### API Endpoints

- `POST /api/tasks` - Create task (body: `{ text: string }`)
- `GET /api/tasks` - Get all tasks (query: `?status=active|completed`)
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task text (body: `{ text: string }`)
- `DELETE /api/tasks/:id` - Delete task (returns 204)
- `PATCH /api/tasks/:id/complete` - Mark task complete

### Error Handling Pattern

Services throw errors with descriptive messages:

- "Task not found" → 404
- "Task text cannot be empty" → 400
- "Cannot update completed tasks" → 400
- Generic failures → 500 with logged details

Routes catch these errors and map to appropriate HTTP responses.

## Development Notes

### Running Single Tests

```bash
# Server (Jest)
npm run test -w @simple-todo/server -- TaskService.test.ts
npm run test -w @simple-todo/server -- --testNamePattern="createTask"

# Web (Vitest)
npm run test -w @simple-todo/web -- TaskCard.test.tsx
npm run test -w @simple-todo/web -- --run  # Run once without watch mode
```

### Environment Variables

- `DATA_DIR`: Optional path for task data storage (defaults to `./data`)
- Backend runs on port 3001 (configured in `apps/server/src/index.ts`)
- Frontend runs on port 3000 (configured in `apps/web/vite.config.ts`)

### Debugging

- Backend uses Winston logger (`src/utils/logger.ts`) - logs to console in
  development
- Frontend API errors are logged to console via service layer

### Adding New Features

When adding features that span frontend and backend:

1. Add types to `packages/shared/src/types/`
2. Implement backend service logic in `apps/server/src/services/`
3. Add route handlers in `apps/server/src/routes/`
4. Add API methods in `apps/web/src/services/`
5. Update components/views to use new API methods
6. Write tests at each layer

### Future Extensibility Points

- TaskService has `getActiveTaskCount()` method (noted for future WIP limit
  feature)
- DataService is abstracted to allow future database replacement
- Service layer separation allows adding middleware (auth, rate limiting)
  without changing business logic
