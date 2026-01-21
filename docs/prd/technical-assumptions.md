# Technical Assumptions

## Repository Structure: Monorepo

The application will use a **monorepo** structure with a single Git repository
containing all code for the Simple To-Do App. This includes frontend web
interface, backend services/business logic, shared types, and tests.

**Rationale:** For an MVP with a single web application and no separate
services, a monorepo provides simplicity and ease of development. All code is in
one place, making it easy to refactor, search, and ensure consistency. There's
no need for polyrepo complexity when we don't have multiple independently
deployable services. The brief's proposed architecture structure shows a single
`simple-todo/` repository with organized subdirectories, confirming this
approach.

## Service Architecture: Monolith

The application will be architected as a **monolithic application** running as a
single Node.js process serving both the web interface and executing business
logic locally.

**Structure:**

- Single Node.js/TypeScript application
- Express.js server serving both static frontend assets and API endpoints
- Business logic services (TaskService, CelebrationService, PromptingService,
  WIPLimitService) run in-process
- Local JSON file storage accessed directly by backend services
- Background scheduler for proactive prompting runs within the main process

**Rationale:** This is an MVP for 5-10 pilot users running localhost-only on a
single machine. Microservices or serverless architectures would add massive
complexity (service orchestration, inter-service communication, deployment
overhead) for zero benefit. The brief explicitly recommends "No separate backend
server for MVP (single-process application or localhost-only)" and notes this is
a "demonstration/portfolio project" with a tight 4-6 week timeline. A monolith
is the fastest path to validation.

**Future Consideration:** If the app evolves to a hosted SaaS platform (Phase
3+), we could extract the prompting service as a separate worker process or
serverless function, but that's premature for MVP.

## Testing Requirements: Unit + Integration

The application will implement **unit tests and integration tests** with a
target of 70%+ coverage for business logic services.

**Testing Strategy:**

- **Unit Tests:** Core business logic services (TaskService, WIPLimitService,
  CelebrationService, PromptingService) with mocked dependencies
- **Integration Tests:** API endpoints with real data layer (test
  database/file), validating full request/response cycles
- **No E2E/UI Tests in MVP:** Browser-based end-to-end testing (Playwright,
  Cypress) is deferred to Phase 2 to maintain timeline
- **Testing Framework:** Jest for both unit and integration tests (TypeScript
  support, mocking, fast execution)

**Rationale:** Unit tests alone wouldn't catch data persistence bugs or API
contract issues. Full testing pyramid (unit + integration + E2E + manual) would
consume too much of the 4-6 week timeline. Unit + Integration strikes the
balance of confidence without excessive overhead. The brief specifies "Jest for
unit tests, coverage target 70%+ for core business logic" and notes this is an
MVP where speed matters. We can add E2E tests in Phase 2 when the UI stabilizes.

**Manual Testing Approach:** Developer will manually test the web UI during
development. Pilot users serve as additional manual QA during the 2-week testing
phase.

## Additional Technical Assumptions and Requests

**Frontend Stack:**

- **Framework:** React 18+ with TypeScript for type safety and component
  reusability
- **Styling:** CSS Modules or Tailwind CSS for scoped styling and rapid
  development
- **State Management:** React Context API for simple global state (no Redux -
  YAGNI for MVP)
- **Build Tool:** Vite for fast development server and optimized production
  builds
- **Rationale:** React + TypeScript is well-supported, has excellent tooling,
  and aligns with the brief's "React with minimal dependencies" suggestion. Vite
  provides instant hot reload during development, speeding up iteration.

**Backend Stack:**

- **Runtime:** Node.js 18+ (LTS) for modern async/await and stability
- **Framework:** Express.js for HTTP server and API routing (minimal, proven,
  well-documented)
- **Language:** TypeScript 5+ for type safety across frontend and backend
- **Data Storage:** JSON file storage with structured schema (no database for
  MVP)
- **File System:** Node.js `fs` module with async/await for data operations
- **Rationale:** The brief recommends "Start with JSON for MVP simplicity" over
  SQLite. Express is the standard Node.js web framework. TypeScript prevents
  bugs and enables shared types between frontend/backend.

**Background Processing (Proactive Prompting):**

- **Scheduler:** `node-schedule` library or simple `setInterval` for periodic
  prompting
- **Prompt Delivery:** Server-Sent Events (SSE) or WebSocket for pushing prompts
  to browser in real-time
- **Fallback:** Long polling if SSE/WebSocket proves complex
- **Rationale:** The brief identifies "Option 1: Node.js setInterval for
  periodic prompts (simpler)" as the recommended MVP approach. SSE is simpler
  than WebSockets for server-to-client push and sufficient for our use case.

**Development Tooling:**

- **Linting:** ESLint with TypeScript rules for code quality
- **Formatting:** Prettier for consistent code style
- **Version Control:** Git with conventional commits for clean history
- **Package Manager:** npm (comes with Node.js) or pnpm for faster installs
- **Rationale:** These are standard TypeScript/Node.js development tools that
  prevent bugs and maintain code quality with minimal setup effort.

**Deployment:**

- **MVP:** Runs locally via `npm run dev` (development) and
  `npm run build && npm start` (production build)
- **Distribution:** GitHub repository with README instructions for local setup
- **No Hosting Required:** Users clone repo and run on their own machines
- **Rationale:** The brief specifies "MVP: Runs locally on user's machine (no
  hosting needed)" and this is a pilot test with 5-10 users from personal
  network. Hosting adds complexity and cost for no MVP benefit.

**Security:**

- **Input Sanitization:** Validate and sanitize task text input to prevent XSS
  attacks (use a library like DOMPurify for frontend display)
- **No Authentication:** Single-user local app doesn't need login/authentication
- **Data Privacy:** All data stays local, no telemetry or external API calls
  (per NFR4)
- **Rationale:** The brief notes "Input Validation: Sanitize task text to
  prevent injection attacks if building web interface" and "Authentication: Not
  needed for MVP (single-user local app)."

**Performance Targets:**

- **Startup Time:** < 2 seconds (NFR1)
- **Task Operations:** < 100ms response (NFR2)
- **Data Scale:** Handle up to 10,000 tasks without slowdown (NFR3)
- **Rationale:** These come from the brief's technical requirements and are
  achievable with JSON file storage + in-memory caching for active tasks.

**Browser Targets:**

- **Modern Browsers:** Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **No IE11 Support:** Not targeting legacy browsers to keep bundle size small
  and use modern JavaScript features
- **Rationale:** Pilot users will use modern browsers. Supporting IE11 would
  require polyfills and transpilation that slows development.

**Migration Path (Phase 2 Considerations):**

- **JSON → SQLite:** Data abstraction layer (DataService) allows future
  migration to SQLite without changing business logic
- **Localhost → Hosted:** Frontend already separated from backend via API,
  enabling future deployment to cloud hosting
- **Rationale:** The brief recommends "Service-oriented architecture supports
  testing and feature independence" with DataService abstraction specifically to
  enable storage backend swapping.
