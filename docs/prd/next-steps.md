# Next Steps

## UX Expert Prompt

You are the UX Expert receiving a handoff from the Product Manager for the
Simple To-Do App project.

**Your Task:** Review the PRD (docs/prd.md) and Project Brief (docs/brief.md),
then create a comprehensive UI/UX design specification that brings the product
vision to life.

**Key Focus Areas:**

1. **Design System:** Create a calming base color palette (soft blues, greens,
   grays) + vibrant accent colors (warm oranges, yellows, energetic greens) for
   celebrations. Define typography, spacing, and component styles.

2. **Core Components:** Design the non-blocking toast notification for proactive
   prompts, celebration overlay with animations, task age visual indicators, and
   empty states (first-time guide vs inbox zero celebration).

3. **Responsive Layouts:** Define breakpoints and layouts for the main task list
   view, settings screen, and first-launch configuration that work from narrow
   sidebars (300px) to full-screen displays.

4. **Interaction Details:** Specify animations (entrance/exit timing, easing
   functions), micro-interactions, and state transitions that create the
   "supportive productivity partner" feeling.

5. **Accessibility:** Ensure keyboard navigation, screen reader support,
   sufficient color contrast, and focus indicators for primary actions.

**Deliverables:** UI/UX design document with component specifications,
responsive wireframes/mockups, interaction patterns, and design system
guidelines.

**Critical Constraint:** The proactive prompting innovation depends on
non-intrusive UX - toasts must be helpful, not annoying.

## Architect Prompt

You are the Architect receiving a handoff from the Product Manager for the
Simple To-Do App project.

**Your Task:** Review the PRD (docs/prd.md) and Project Brief (docs/brief.md),
then create a comprehensive technical architecture that implements the
requirements efficiently and maintainably.

**Key Focus Areas:**

1. **System Architecture:** Design the monolithic Node.js/TypeScript application
   structure (Express backend + React frontend + Vite build) with clear
   separation between client, server, and shared code.

2. **Data Layer:** Design the DataService abstraction that works with JSON file
   storage initially but enables future SQLite migration. Define the task data
   schema and config file structures.

3. **Service Layer:** Architect TaskService, WIPLimitService,
   CelebrationService, PromptingService, and AnalyticsService with clear
   interfaces and dependencies.

4. **Real-Time Infrastructure:** Design Server-Sent Events (SSE) implementation
   for proactive prompting with reconnection logic, keep-alive strategy, and
   fallback approaches.

5. **Testing Strategy:** Define unit and integration testing approach to achieve
   70%+ coverage using Jest, including how to mock SSE and test background
   scheduling.

**Deliverables:** Architecture document with system diagrams, data models, API
specifications, service interfaces, deployment architecture, and testing
strategy.

**Critical Constraints:**

- Localhost-only, single-user, privacy-first (no external data transmission)
- Must support 10,000 tasks without performance degradation
- Proactive prompting requires background scheduling and real-time push to
  browser

**Technical Risks to Address:** SSE implementation complexity, JSON storage
scaling, background scheduler reliability.
