# 13. Coding Standards & Conventions

## Rationale and Key Decisions:

**1. Automated Enforcement**: Coding standards are enforced through ESLint and Prettier to ensure consistency across the codebase, especially important for AI agent implementation where multiple agents may work on different parts of the system.

**2. TypeScript-First**: All code must use TypeScript with strict type checking enabled. This prevents runtime errors and provides better IDE support for both human developers and AI agents.

**3. Accessibility as a Standard**: ESLint includes jsx-a11y plugin to catch accessibility violations during development, ensuring WCAG 2.1 AA compliance is maintained.

**4. Security-First**: ESLint security plugin detects common security vulnerabilities (SQL injection patterns, unsafe regex, etc.) before code reaches production.

## File Naming Conventions

**TypeScript/JavaScript Files:**

| File Type | Convention | Example |
|-----------|------------|---------|
| React Components | PascalCase | `TaskCard.tsx`, `AddTaskInput.tsx` |
| Services/Classes | PascalCase | `TaskService.ts`, `DataService.ts` |
| Utilities/Helpers | camelCase | `announceToScreenReader.ts`, `formatDuration.ts` |
| Hooks | camelCase with `use` prefix | `useTasks.ts`, `useSSE.ts` |
| Types/Interfaces | PascalCase | `Task.ts`, `Config.ts` (exported from index) |
| Tests | Match source file + `.test` | `TaskCard.test.tsx`, `TaskService.test.ts` |
| Configuration | kebab-case | `vite.config.ts`, `jest.config.js` |

**CSS Files:**

| File Type | Convention | Example |
|-----------|------------|---------|
| Global styles | kebab-case | `global.css`, `colors.css`, `focus.css` |
| CSS Modules | PascalCase + `.module.css` | `TaskCard.module.css`, `Button.module.css` |

**Other Files:**

| File Type | Convention | Example |
|-----------|------------|---------|
| Markdown | kebab-case | `architecture.md`, `prd.md`, `front-end-spec.md` |
| JSON | kebab-case | `package.json`, `tsconfig.json` |
| Environment | kebab-case | `.env`, `.env.local` |

## Import Path Conventions

**Absolute Imports from Shared Packages:**
```typescript
// ✅ Correct - absolute imports from shared packages
import type { Task, Config } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';
```

**Relative Imports Within Same App:**
```typescript
// ✅ Correct - relative imports within apps/web
import { TaskCard } from '../components/TaskCard';
import { useTasks } from '../hooks/useTasks';
import styles from './TaskList.module.css';

// ❌ Incorrect - don't use absolute imports within same app
import { TaskCard } from 'apps/web/src/components/TaskCard';
```

**Import Order (Enforced by ESLint):**
```typescript
// 1. React (always first)
import React, { useState, useEffect } from 'react';

// 2. External dependencies (alphabetical)
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// 3. Internal shared packages (alphabetical)
import type { Task } from '@simple-todo/shared/types';
import { TaskHelpers } from '@simple-todo/shared/utils';

// 4. Parent directories
import { DataService } from '../../services/DataService';

// 5. Sibling files
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';
```

## Code Formatting (Prettier)

**Configured Prettier Rules:**
- **Semi-colons**: Required (`;` at end of statements)
- **Quotes**: Single quotes for strings (`'hello'`), double for JSX (`<div className="foo">`)
- **Print Width**: 100 characters (line wrap at 100)
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 style (objects, arrays)
- **Arrow Parens**: Always `(x) => x` (not `x => x`)
- **End of Line**: LF (Unix-style line endings)

**Example Formatted Code:**
```typescript
// Formatted by Prettier
export const TaskService = {
  async createTask(text: string): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      text,
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const tasks = await this.dataService.loadTasks();
    tasks.push(task);
    await this.dataService.saveTasks(tasks);

    return task;
  },
};
```

## TypeScript Standards

**Strict Mode Enabled:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Type Imports:**
```typescript
// ✅ Correct - use type imports for type-only imports
import type { Task, Config } from '@simple-todo/shared/types';
import { TaskService } from './TaskService';

// ❌ Incorrect - don't mix type and value imports
import { Task, TaskService } from './types';
```

**Explicit Return Types:**
```typescript
// ✅ Correct - explicit return type on public functions
export async function createTask(text: string): Promise<Task> {
  // Implementation
}

// ⚠️ Acceptable - implicit return type for private/inline functions
const formatDate = (date: Date) => date.toISOString();
```

**No `any` Type:**
```typescript
// ❌ Incorrect - avoid 'any'
function processData(data: any) {
  return data.value;
}

// ✅ Correct - use proper types or unknown
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  throw new Error('Invalid data');
}
```

## Documentation Standards

**JSDoc for Public APIs:**
```typescript
/**
 * Creates a new task and adds it to the task list
 *
 * @param text - The task description (1-500 characters)
 * @returns The newly created task with generated ID and timestamps
 * @throws {Error} If text is empty or exceeds 500 characters
 *
 * @example
 * const task = await createTask('Buy groceries');
 * console.log(task.id); // "123e4567-e89b-12d3-a456-426614174000"
 */
export async function createTask(text: string): Promise<Task> {
  // Implementation
}
```

**Inline Comments for Complex Logic:**
```typescript
// Calculate task lifetime duration
// Use configured frequency as base, add slight randomness (±15 minutes)
const baseHours = config.promptingFrequencyHours; // e.g., 2.5
const randomOffsetMinutes = (Math.random() - 0.5) * 30; // -15 to +15 minutes
const totalHours = baseHours + randomOffsetMinutes / 60;
```

**Component Documentation:**
```typescript
/**
 * TaskCard displays a single task with complete and delete actions
 *
 * Features:
 * - Shows task text and age indicator
 * - Keyboard accessible (Tab, Enter, Space)
 * - Screen reader compatible with ARIA labels
 *
 * @example
 * <TaskCard
 *   task={task}
 *   onComplete={(id) => handleComplete(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
  // Implementation
};
```

## Git Commit Conventions

**Commit Message Format (Conventional Commits):**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature (e.g., `feat(tasks): add task completion celebration`)
- `fix`: Bug fix (e.g., `fix(api): prevent WIP limit bypass`)
- `docs`: Documentation only (e.g., `docs(architecture): add accessibility section`)
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change or bug fix)
- `perf`: Performance improvement (e.g., `perf(data): add in-memory cache`)
- `test`: Add or update tests
- `chore`: Build process, dependencies, tooling (e.g., `chore: update TypeScript to 5.3`)

**Examples:**
```bash
# Feature commit
git commit -m "feat(prompting): implement SSE-based proactive prompts

- Add PromptingService with scheduling logic
- Implement SSE endpoint at /api/prompts/stream
- Add React component for toast notifications
- Track prompt responses in PromptEvent model

Co-Authored-By: Claude <noreply@anthropic.com>"

# Bug fix commit
git commit -m "fix(validation): prevent task creation with empty text

- Add Zod validation schema for CreateTaskDto
- Return 400 error with clear message
- Add unit test for empty text validation

Closes #42

Co-Authored-By: Claude <noreply@anthropic.com>"

# Documentation commit
git commit -m "docs(readme): add installation instructions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Linting and Formatting Commands

**NPM Scripts:**
```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run format:check"
  }
}
```

**Pre-Commit Hook (Husky + lint-staged):**
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

## ESLint Configuration Details

**Installed Plugins:**
- `@typescript-eslint/eslint-plugin` - TypeScript-specific rules
- `eslint-plugin-react` - React best practices
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-jsx-a11y` - Accessibility rules
- `eslint-plugin-security` - Security vulnerability detection
- `eslint-plugin-import` - Import/export organization

**Key Rules Enforced:**
- **TypeScript**: Explicit return types on public functions, no `any`, consistent type imports
- **React**: Hooks rules, no unused state, proper prop types (via TypeScript)
- **Accessibility**: All interactive elements keyboard accessible, proper ARIA usage
- **Security**: No unsafe regex, object injection detection, non-literal require warnings
- **Imports**: Organized groups, alphabetical order, no duplicates

**Configuration File:** `.eslintrc.json` (root directory)

## Prettier Configuration Details

**Installed Dependencies:**
- `prettier` - Core formatter
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier

**Configuration File:** `.prettierrc.json` (root directory)

**Ignore File:** `.prettierignore` (excludes node_modules, build outputs, data files)

## IDE Integration

**VS Code Settings (Recommended):**
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

**Recommended VS Code Extensions:**
- `esbenp.prettier-vscode` - Prettier formatter
- `dbaeumer.vscode-eslint` - ESLint integration
- `ms-vscode.vscode-typescript-next` - TypeScript support

## Code Review Checklist

**Before Committing:**
- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] `npm run format:check` passes (code formatted by Prettier)
- [ ] `npm test` passes (all tests passing)
- [ ] All new functions have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] No `console.log` statements (use `console.warn` or `console.error` if needed)
- [ ] No `TODO` comments without associated GitHub issue
- [ ] Commit message follows Conventional Commits format

---
