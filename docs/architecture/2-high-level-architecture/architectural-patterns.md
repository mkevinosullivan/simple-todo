# Architectural Patterns

**Overall Architecture Patterns:**

- **Monolithic Architecture:** Single Node.js process serves all concerns -
  _Rationale:_ MVP with 5-10 users doesn't justify microservices complexity;
  enables rapid development and simple deployment
- **Layered Architecture:** Clear separation of API routes → Services → Data
  access - _Rationale:_ Testability and future migration flexibility (can
  extract layers later)

**Frontend Patterns:**

- **Component-Based UI:** Reusable React components with TypeScript -
  _Rationale:_ Maintainability, type safety, component reuse across screens
- **Unidirectional Data Flow:** React Context API for global state (WIP config,
  task list) - _Rationale:_ Simpler than Redux for MVP, sufficient for limited
  global state needs
- **Optimistic UI Updates:** Update UI immediately, revert on API failure -
  _Rationale:_ Achieves <100ms perceived response time (NFR2)

**Backend Patterns:**

- **Service Layer Pattern:** Business logic encapsulated in services
  (TaskService, CelebrationService, etc.) - _Rationale:_ Separation of concerns,
  unit testable, reusable across API endpoints
- **Repository Pattern:** DataService abstracts storage implementation -
  _Rationale:_ Enables future JSON → SQLite migration without changing business
  logic (PRD Phase 2 consideration)
- **Singleton Services:** Services instantiated once, shared across requests -
  _Rationale:_ Localhost single-user app has no concurrency concerns, simplifies
  architecture

**Integration Patterns:**

- **REST API:** Simple JSON-based HTTP endpoints - _Rationale:_ Standard,
  well-supported, sufficient for CRUD operations
- **Server-Sent Events (SSE):** Backend pushes prompts to frontend -
  _Rationale:_ Simpler than WebSockets for one-way server→client push, PRD
  recommends for proactive prompting
- **Atomic File Writes:** DataService uses temp file + rename pattern -
  _Rationale:_ Prevents JSON corruption on write failures (NFR6: data integrity)

**Proactive Prompting Pattern:**

- **Event-Driven Scheduling:** Background scheduler emits events via SSE when
  interval elapsed - _Rationale:_ Decouples prompt generation from HTTP
  request/response cycle, enables real-time delivery

**Configuration Management Pattern:**

- **Distributed Config Handling:** Config API routes to different services based
  on business logic needs:
  - `/api/config/wip-limit` → WIPLimitService (validation, business logic,
    helpful messages)
  - `/api/config/prompting` → PromptingService (update config + restart
    scheduler)
  - `/api/config/celebrations` → DataService (simple validation + persistence)
  - `/api/config` GET → DataService (read entire config object)
- _Rationale:_ Services own their configuration updates when side effects are
  needed (scheduler restart, validation logic), otherwise direct DataService
  access keeps it simple

---
