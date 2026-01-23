# Simple Todo

A simple todo application with proactive prompting, built with React,
TypeScript, and Express.

## Features

- **Task Management**: Add, view, edit, delete, and complete tasks
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
