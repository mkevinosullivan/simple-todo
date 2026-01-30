# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Epic 2] - WIP Limits & Behavioral Tracking - 2026-01-30

### Added

- **WIP Limit Enforcement**: Configurable limit (5-10 tasks) prevents creating new tasks when at capacity, with encouraging messaging to maintain focus
- **First-Launch Configuration Flow**: Welcome screen guides new users through initial WIP limit setup with feature highlights
- **Settings Screen**: Dedicated settings modal allows users to adjust WIP limit and view current active task count
- **WIP Count Indicator**: Real-time display of active tasks vs. limit with color-coded status (green/yellow/orange) in UI header
- **Analytics Service**: Comprehensive behavioral metrics including:
  - Completion rate calculation
  - Average task lifetime measurement
  - Task counts by status (active/completed)
  - Oldest active task identification
- **Task Metadata Infrastructure**: Automatic tracking of creation timestamps (`createdAt`) and completion timestamps (`completedAt`) for all tasks
- **Helpful Messaging**: Supportive, non-punitive messages when WIP limit reached, emphasizing focus and productivity
- **TaskHelpers Utilities**: Calculation infrastructure for task duration, age, and text length (foundation for future intelligent features)
- **Real-Time Updates**: WIP count indicator and limit enforcement update immediately without app restart

### Changed

- **Task Creation Workflow**: Now checks WIP limit via WIPLimitService before allowing new task creation
- **Config API Endpoints**: Expanded to support `hasCompletedSetup` flag for first-launch flow
- **POST /api/tasks**: Returns 409 Conflict (instead of 400) when WIP limit reached, includes `wipLimitMessage` field
- **Task Data Model**: All tasks now include `createdAt` timestamp; completed tasks include `completedAt` timestamp

### Technical

- **WIPLimitService** added with 100% test coverage (exceeds 75% architecture target)
- **AnalyticsService** added with 95% test coverage (exceeds 70% architecture target)
- **Comprehensive Test Suite**: 100+ tests across unit, integration, and accessibility layers
  - 27 unit tests for WIPLimitService
  - 18 unit tests for AnalyticsService
  - 21 integration tests for config API endpoints
  - 6+ integration tests for WIP-enforced task creation
  - 37 frontend integration tests for flows
- **Full WCAG 2.1 AA Compliance**: All new UI components meet accessibility standards
- **Real File I/O Testing**: Integration tests use actual file system operations, not mocks
- **Manual Testing Checklist**: Comprehensive 8-scenario checklist for Epic 2 validation

### Architecture

- **Services Layer**: WIPLimitService and AnalyticsService follow established service architecture patterns
- **Metadata Infrastructure**: TaskHelpers provide foundation for future intelligent features (proactive prompting, task prioritization)
- **Encouraging UX**: User-centered design emphasizes supportive messaging and calming visual design

### Documentation

- **README.md** updated with WIP Limit Feature and Analytics Capabilities sections
- **Coverage Requirements** updated to include WIPLimitService (75%+) and AnalyticsService (70%+)
- **Manual Testing Checklist** created at `docs/qa/manual-testing-checklists/epic-2-wip-limits-behavioral-tracking.md`

## [Epic 1] - Core Task Management - 2026-01-15

### Added

- **Task CRUD Operations**: Create, read, update, delete tasks via REST API
- **Task Completion**: Mark tasks as completed with timestamp tracking
- **Status Filtering**: Filter tasks by status (active/completed)
- **Data Persistence**: JSON file-based storage with atomic write operations
- **Task Validation**: Input validation for task text (1-500 characters)
- **Error Handling**: Comprehensive error responses with descriptive messages

### Technical

- **TaskService** with 92% test coverage (exceeds 80% target)
- **DataService** with 91% test coverage (exceeds 85% target)
- **Atomic File Writes**: Temp file + rename pattern prevents data corruption
- **REST API**: Express-based API with proper HTTP status codes (200, 201, 204, 400, 404)

### Architecture

- **Monorepo Structure**: npm workspaces with apps/web, apps/server, packages/shared
- **Type Safety**: Shared TypeScript types across frontend and backend
- **Service Layer**: Clear separation between routes (HTTP) and services (business logic)

---

## Contributing

When updating this changelog:

1. Add new entries under `[Unreleased]` section
2. Follow the format: `### Added/Changed/Deprecated/Removed/Fixed/Security`
3. Include references to issues/PRs where applicable
4. Move `[Unreleased]` to a version number when releasing
