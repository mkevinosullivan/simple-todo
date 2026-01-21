# Repository Structure

**Structure:** Monorepo with single Git repository **Monorepo Tool:** npm
workspaces (built into npm 7+, no additional tooling needed) **Package
Organization:** Organized by concern with clear boundaries:

- `/apps/web` - React frontend application
- `/apps/server` - Express backend application
- `/packages/shared` - Shared TypeScript types, constants, and utilities
- `/packages/config` - Shared ESLint, TypeScript, and testing configurations

**Rationale:**

1. **MVP Simplicity:** PRD technical assumptions recommend monorepo for ease of
   development and refactoring
2. **Type Safety:** Shared types package ensures frontend/backend contract
   consistency
3. **No Over-Engineering:** npm workspaces provide sufficient monorepo features
   without adding Nx/Turborepo complexity
4. **Fast Iteration:** All code in one place, easy to search and ensure
   consistency
5. **Future-Ready:** Structure supports extraction of services or deployment as
   separate packages if needed in Phase 2

## Frontend Directory Structure (`/apps/web`)

**Detailed Organization:**

```
apps/web/
├── public/                          # Static assets served directly
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
│
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── TaskCard.tsx            # Individual task display
│   │   ├── TaskCard.module.css     # Component-specific styles
│   │   ├── AddTaskInput.tsx        # Task creation form
│   │   ├── TaskList.tsx            # Task list container
│   │   ├── CelebrationOverlay.tsx  # Celebration modal
│   │   ├── PromptToast.tsx         # Proactive prompt notification
│   │   ├── SettingsModal.tsx       # Settings dialog
│   │   ├── WIPCountIndicator.tsx   # WIP limit progress bar
│   │   ├── EmptyState.tsx          # Empty state displays
│   │   └── shared/                 # Shared/foundational components
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Icon.tsx
│   │
│   ├── views/                       # Page-level components (routes)
│   │   ├── TaskListView.tsx        # Main task list page (/)
│   │   ├── SettingsView.tsx        # Settings page (/settings)
│   │   └── AnalyticsView.tsx       # Analytics page (/analytics)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTasks.ts             # Task state management
│   │   ├── useSSE.ts               # Server-Sent Events connection
│   │   ├── useConfig.ts            # Configuration state
│   │   ├── useTaskSearch.ts        # Search/filter logic (future)
│   │   └── useKeyboardShortcuts.ts # Keyboard navigation
│   │
│   ├── services/                    # API client layer
│   │   ├── api.ts                  # Base API client (fetch wrapper)
│   │   ├── tasks.ts                # Task API calls
│   │   ├── config.ts               # Config API calls
│   │   ├── celebrations.ts         # Celebration API calls
│   │   └── prompts.ts              # Prompt API calls
│   │
│   ├── context/                     # React Context providers
│   │   ├── TaskContext.tsx         # Global task state
│   │   ├── ConfigContext.tsx       # Global config state
│   │   └── UIContext.tsx           # UI state (modals, toasts)
│   │
│   ├── utils/                       # Helper functions and utilities
│   │   ├── announceToScreenReader.ts  # Accessibility helper
│   │   ├── formatDuration.ts       # Time formatting
│   │   ├── performanceMonitoring.ts # Performance tracking
│   │   └── validation.ts           # Client-side validation
│   │
│   ├── styles/                      # Global styles
│   │   ├── global.css              # Global styles and resets
│   │   ├── colors.css              # CSS variables for colors
│   │   ├── typography.css          # Font and text styles
│   │   ├── focus.css               # Focus indicator styles
│   │   ├── accessibility.css       # Accessibility utilities (.sr-only)
│   │   └── animations.css          # Animation utilities
│   │
│   ├── types/                       # Frontend-specific TypeScript types
│   │   └── index.ts                # Extended types not in shared package
│   │
│   ├── App.tsx                      # Root component with routing
│   ├── main.tsx                     # Entry point
│   └── vite-env.d.ts               # Vite type definitions
│
├── tests/                           # Frontend tests
│   ├── unit/
│   │   ├── components/
│   │   │   ├── TaskCard.test.tsx
│   │   │   ├── TaskCard.a11y.test.tsx  # Accessibility tests
│   │   │   └── AddTaskInput.test.tsx
│   │   └── hooks/
│   │       ├── useTasks.test.ts
│   │       └── useSSE.test.ts
│   ├── integration/
│   │   ├── TaskListFlow.test.tsx
│   │   ├── WIPLimitFlow.test.tsx
│   │   └── SettingsFlow.test.tsx
│   ├── mocks/
│   │   └── handlers.ts             # MSW API handlers
│   └── helpers/
│       ├── testSetup.ts
│       └── renderWithProviders.tsx
│
├── index.html                       # HTML entry point
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.node.json               # TypeScript for Node (Vite config)
└── package.json                     # Frontend dependencies
```

**File Placement Guidelines:**

| New File Type        | Where to Place              | Naming Convention          |
| -------------------- | --------------------------- | -------------------------- |
| React Component      | `src/components/`           | `ComponentName.tsx`        |
| Page/Route Component | `src/views/`                | `PageNameView.tsx`         |
| Custom Hook          | `src/hooks/`                | `useFeatureName.ts`        |
| API Service          | `src/services/`             | `resourceName.ts`          |
| Utility Function     | `src/utils/`                | `functionName.ts`          |
| Context Provider     | `src/context/`              | `FeatureContext.tsx`       |
| Component Styles     | Same directory as component | `ComponentName.module.css` |
| Global Styles        | `src/styles/`               | `purpose.css`              |
| Component Test       | `tests/unit/components/`    | `ComponentName.test.tsx`   |
| Integration Test     | `tests/integration/`        | `FeatureFlow.test.tsx`     |

**Import Path Examples:**

```typescript
// Component imports another component (relative)
import { Button } from '../shared/Button';
import styles from './TaskCard.module.css';

// Component uses hook (relative)
import { useTasks } from '../../hooks/useTasks';

// Component uses API service (relative)
import { tasks } from '../../services/tasks';

// Component uses shared types (absolute from package)
import type { Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

// Component uses context (relative)
import { useTaskContext } from '../../context/TaskContext';
```

## Backend Directory Structure (`/apps/server`)

**Detailed Organization:**

```
apps/server/
├── src/
│   ├── routes/                      # API route handlers
│   │   ├── tasks.ts                # Task endpoints
│   │   ├── config.ts               # Config endpoints
│   │   ├── celebrations.ts         # Celebration endpoints
│   │   ├── prompts.ts              # Prompt/SSE endpoints
│   │   ├── analytics.ts            # Analytics endpoints (Phase 2)
│   │   └── health.ts               # Health check endpoint
│   │
│   ├── services/                    # Business logic layer
│   │   ├── TaskService.ts          # Task CRUD operations
│   │   ├── WIPLimitService.ts      # WIP limit enforcement
│   │   ├── CelebrationService.ts   # Celebration message generation
│   │   ├── PromptingService.ts     # Proactive prompting logic
│   │   ├── AnalyticsService.ts     # Analytics calculations
│   │   └── DataService.ts          # Data persistence abstraction
│   │
│   ├── middleware/                  # Express middleware
│   │   ├── errorHandler.ts         # Global error handling
│   │   ├── validation.ts           # Zod validation middleware
│   │   ├── performanceMonitoring.ts # Request timing
│   │   └── logging.ts              # Request logging
│   │
│   ├── utils/                       # Helper functions
│   │   ├── logger.ts               # Winston logger setup
│   │   └── asyncHandler.ts         # Async route wrapper
│   │
│   ├── types/                       # Backend-specific types
│   │   └── index.ts                # Extended types
│   │
│   ├── app.ts                       # Express app setup
│   └── index.ts                     # Server entry point
│
├── tests/                           # Backend tests
│   ├── unit/
│   │   ├── services/
│   │   │   ├── TaskService.test.ts
│   │   │   ├── WIPLimitService.test.ts
│   │   │   └── CelebrationService.test.ts
│   │   └── utils/
│   │       └── TaskHelpers.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── tasks.test.ts
│   │   │   ├── config.test.ts
│   │   │   └── celebrations.test.ts
│   │   └── data/
│   │       └── DataService.test.ts
│   ├── fixtures/
│   │   ├── tasks.json
│   │   └── config.json
│   └── helpers/
│       ├── testSetup.ts
│       └── factories.ts            # Test data factories
│
├── tsconfig.json                    # TypeScript configuration
├── jest.config.js                   # Jest configuration
└── package.json                     # Backend dependencies
```

## Shared Packages Structure

**`/packages/shared` - Shared Types and Utilities:**

```
packages/shared/
├── src/
│   ├── types/                       # Shared TypeScript types
│   │   ├── Task.ts                 # Task interface
│   │   ├── Config.ts               # Config interface
│   │   ├── CelebrationMessage.ts   # Celebration types
│   │   ├── PromptEvent.ts          # Prompt types
│   │   ├── AnalyticsData.ts        # Analytics types
│   │   └── index.ts                # Barrel export
│   │
│   ├── utils/                       # Shared utility functions
│   │   ├── TaskHelpers.ts          # Task computation helpers
│   │   ├── constants.ts            # Shared constants
│   │   └── index.ts                # Barrel export
│   │
│   └── index.ts                     # Main barrel export
│
├── tsconfig.json
└── package.json
```

**`/packages/config` - Shared Configurations:**

```
packages/config/
├── eslint/
│   └── base.js                      # Base ESLint config
├── typescript/
│   ├── base.json                    # Base TypeScript config
│   ├── react.json                   # React-specific overrides
│   └── node.json                    # Node-specific overrides
└── package.json
```
