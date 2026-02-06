# Simple Todo

A simple todo application with proactive prompting, built with React,
TypeScript, and Express.

## Features

- **Task Management**: Add, view, edit, delete, and complete tasks
- **Proactive Prompting**: Background service runs at configured intervals to proactively remind you about active tasks (Story 4.1)
- **Real-Time Prompt Delivery**: Server-Sent Events (SSE) infrastructure pushes prompts to browser in real-time without polling (Story 4.2)
- **Non-Blocking Prompt Display**: Proactive prompts displayed via non-blocking toast notifications with Complete/Dismiss/Snooze actions (Story 4.3)
- **WIP Limit Enforcement**: Configurable Work In Progress limit (5-10 tasks) helps maintain focus with encouraging, non-punitive messaging
- **First-Launch Configuration**: Welcome screen guides new users through initial WIP limit setup
- **Real-Time WIP Indicator**: Visual progress indicator shows active task count with color-coded status
- **Settings Management**: Adjust WIP limit and view current active task count with immediate effect
- **Help Documentation**: Accessible in-app help modal with comprehensive guides on features, keyboard shortcuts, and troubleshooting
- **Behavioral Analytics**: Track completion rate, average task lifetime, task counts by status, and oldest active tasks
- **Task Metadata**: Automatic tracking of creation and completion timestamps for all tasks
- **Modern Tech Stack**: Built with React 18, TypeScript 5, and Express
- **Type Safety**: Full TypeScript support across frontend and backend
- **Code Quality**: ESLint and Prettier configured for consistent code style
- **Monorepo Structure**: Organized with npm workspaces for easy development

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.0.0 or higher (comes with Node.js)

To check your installed versions:

```bash
node --version
npm --version
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd simple-todo
```

2. Install dependencies:

```bash
npm install
```

This will install all dependencies for the root project and all workspace
packages.

## Development

To start the development servers for both the frontend and backend:

```bash
npm run dev
```

This will start:

- **Frontend**: React app at http://localhost:3000 (with hot reload)
- **Backend**: Express API server at http://localhost:3001

You can verify the backend is running by visiting
http://localhost:3001/api/health

## Build

To create production builds:

```bash
npm run build
```

This will build both the frontend and backend applications.

## Testing

The project uses Jest for backend testing and Vitest for frontend testing, with
comprehensive unit and integration test coverage.

### Running Tests

Run all tests (backend + frontend):

```bash
npm test
```

Run backend tests only (Jest):

```bash
npm run test:server
```

Run frontend tests only (Vitest):

```bash
npm run test:web
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage reports:

```bash
npm run test:coverage
```

### Coverage Requirements

The project maintains the following minimum coverage thresholds:

- **DataService**: 85%+ (critical for data integrity)
- **TaskService**: 80%+ (core business logic)
- **WIPLimitService**: 75%+ (WIP limit enforcement logic) - **Currently: 100%**
- **AnalyticsService**: 70%+ (behavioral metrics calculations) - **Currently: 95%**
- **Frontend Components**: 70%+ (UI components and flows)
- **Overall**: 70%+ for lines, functions, branches, and statements

Coverage reports are generated in:

- Backend: `apps/server/coverage/`
- Frontend: `apps/web/coverage/`

### Test Organization

**Backend Tests** (`apps/server/tests/`):

- Unit tests: `tests/unit/services/` - Service layer testing with mocked
  dependencies
- Integration tests: `tests/integration/api/` - API endpoint testing with real
  file I/O

**Frontend Tests** (`apps/web/tests/`):

- Component tests: `tests/unit/components/` - React component testing with React
  Testing Library
- Integration tests: `tests/integration/` - Full user flow testing with MSW for
  API mocking
- Accessibility tests: Automated a11y checks with jest-axe

### Continuous Integration

GitHub Actions runs all tests automatically on every push and pull request. The
CI pipeline:

- Runs linting and type checking
- Executes all tests with coverage
- Fails if any tests fail or coverage drops below thresholds

## Code Quality

### Linting

Check for linting errors:

```bash
npm run lint
```

Fix linting errors automatically:

```bash
npm run lint:fix
```

### Formatting

Format all files with Prettier:

```bash
npm run format
```

Check if files are formatted correctly:

```bash
npm run format:check
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Validate All

Run type checking, linting, and format checking:

```bash
npm run validate
```

## Project Structure

```
simple-todo/
├── apps/
│   ├── web/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── context/
│   │   │   ├── utils/
│   │   │   ├── styles/
│   │   │   ├── content/    # Markdown content files
│   │   │   │   └── help/   # Help documentation
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   └── package.json
│   └── server/           # Express backend application
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── index.ts
│       └── package.json
├── packages/
│   ├── shared/           # Shared TypeScript types and utilities
│   └── config/           # Shared ESLint and TypeScript configs
├── docs/                 # Documentation
├── package.json          # Root workspace configuration
└── tsconfig.json         # Root TypeScript configuration
```

## WIP Limit Feature

The Work In Progress (WIP) limit feature helps you maintain focus by limiting the number of active tasks you can work on simultaneously.

### Purpose

Research shows that limiting work in progress reduces context switching, improves focus, and increases completion rates. The WIP limit encourages finishing tasks before starting new ones.

### How to Configure

- **First Launch**: When you first open the app, you'll see a welcome screen where you can set your initial WIP limit (5-10 tasks)
- **Settings Modal**: Click the WIP count indicator or access Settings to adjust your limit at any time
- **Default Value**: 7 active tasks (recommended for optimal focus)

### Range

WIP limits are configurable between **5 and 10 active tasks**. This range is based on productivity research suggesting optimal focus occurs with 5-9 concurrent tasks.

### Helpful Messaging

When you reach your WIP limit:
- **Encouraging Tone**: Messages use supportive language like "maintain focus" instead of punitive phrases
- **Calming Design**: Soft colors and friendly icons (💡) create a positive experience
- **Guidance**: Messages include helpful context and a link to adjust your limit in Settings

### WIP Count Indicator

The real-time indicator in the UI header shows:
- **Current Status**: "X of Y active tasks" (e.g., "6 of 7 active tasks")
- **Color Coding**: Green when well below limit, yellow/orange when approaching limit, orange at limit
- **Interactive**: Click to open Settings and adjust your limit
- **Tooltip**: Hover for helpful context about WIP limits

## Analytics Capabilities

The analytics system provides rich behavioral data to help you understand your productivity patterns.

### Available Metrics

**Completion Rate**
- Percentage of tasks completed out of total tasks created
- Formula: (completed tasks / total tasks) × 100
- Helps track overall productivity trends

**Average Task Lifetime**
- Average time from task creation to completion
- Measured in milliseconds, can be formatted to hours/days
- Identifies if tasks are being completed promptly or aging

**Task Count by Status**
- Breakdown of active vs. completed tasks
- Format: `{ active: number, completed: number }`
- Quick snapshot of current workload

**Oldest Active Task**
- Identifies the task that has been active the longest
- Helps surface potentially forgotten or stuck tasks
- Useful for prioritization and cleanup

### How to Access

**For Epic 2 (MVP)**: Analytics are implemented as backend services but not yet exposed via API endpoints. The AnalyticsService provides all metrics with comprehensive test coverage (95%+).

**Phase 2**: Analytics API endpoints will be added:
- `GET /api/analytics/tasks` - Comprehensive task analytics (planned)

**Future Enhancement**: Visual dashboard with charts and trend analysis (planned for Epic 3+)

### Use Cases

- **Track Productivity**: Monitor completion rates over time
- **Identify Bottlenecks**: Find tasks aging without completion
- **Optimize Workflow**: Adjust WIP limits based on completion patterns
- **Data-Driven Insights**: Foundation for future intelligent prompting features

## Help Documentation

The app includes comprehensive in-app help documentation accessible from the main header.

### Accessing Help

Click the **Help icon (?)** in the app header to open the Help modal with tabbed sections covering:

1. **Getting Started**: Overview of the basic task flow (add → complete → celebrate)
2. **WIP Limits**: Explanation of Work In Progress limits, benefits, and how to adjust them
3. **Proactive Prompts**: Guide to understanding and responding to task reminders
4. **Keyboard Shortcuts**: List of keyboard navigation shortcuts for efficient app usage
5. **Troubleshooting**: Common issues and solutions

### Quick Start Guide

The Help modal includes a link to the interactive **Getting Started Guide** (Story 3.6), which provides a guided walkthrough for first-time users.

### Updating Help Content

Help content is stored in markdown files that can be updated without code changes:

**Location**: `apps/web/src/content/help/`

**Files**:
- `getting-started.md` - Basic app introduction and task flow
- `wip-limits.md` - WIP limit explanation and configuration
- `proactive-prompts.md` - Proactive prompting guide
- `keyboard-shortcuts.md` - Keyboard navigation reference
- `troubleshooting.md` - Common issues and solutions

**Updating Content**:
1. Edit the markdown file in `apps/web/src/content/help/`
2. Changes are automatically picked up during development (HMR)
3. No server restart needed - just refresh the Help modal
4. Markdown supports headings, lists, code blocks, and basic formatting

**Tone Guidelines**:
- Use encouraging, supportive language (matches PRD personality)
- Keep content concise and action-oriented
- Avoid technical jargon where possible
- Focus on helping users succeed

## Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm test` - Run all tests
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check if code is formatted correctly
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run type checking, linting, and format checking

### Workspace-Specific

Run commands in specific workspaces:

```bash
npm run dev -w @simple-todo/web      # Start only frontend
npm run dev -w @simple-todo/server   # Start only backend
npm run test -w @simple-todo/web     # Run only frontend tests
npm run test -w @simple-todo/server  # Run only backend tests
```

## Troubleshooting

### Port Already in Use

If you see an error that port 3000 or 3001 is already in use:

**On Windows:**

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**On macOS/Linux:**

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Module Not Found Errors

If you encounter module not found errors:

1. Delete node_modules and package-lock.json:

   ```bash
   rm -rf node_modules package-lock.json apps/*/node_modules packages/*/node_modules
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

### TypeScript Errors

If you see TypeScript errors that don't make sense:

1. Clear TypeScript cache:

   ```bash
   rm -rf **/*.tsbuildinfo
   ```

2. Run type checking:
   ```bash
   npm run type-check
   ```

### Hot Reload Not Working

If changes aren't reflecting in the browser:

1. Check that the dev server is running
2. Try hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Restart the dev server

## Contributing

1. Ensure all tests pass: `npm test`
2. Ensure code is linted: `npm run lint`
3. Ensure code is formatted: `npm run format`
4. Ensure TypeScript compiles: `npm run type-check`

Or run all checks at once:

```bash
npm run validate && npm test
```

## License

MIT
