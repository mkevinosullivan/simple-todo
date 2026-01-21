# Technical Summary

The Simple To-Do App implements a **monolithic Node.js/TypeScript architecture**
running as a single process on localhost, serving both a React-based web
interface and REST API endpoints. The backend executes business logic services
(TaskService, CelebrationService, PromptingService, WIPLimitService) in-process,
with local JSON file storage for data persistence. A background scheduler
manages proactive task prompting via Server-Sent Events (SSE) for real-time
browser push notifications. The frontend uses React 18 with TypeScript, Vite for
fast builds, and CSS Modules/Tailwind for styling, communicating with the
backend through a simple REST API. This architecture achieves the PRD's goal of
rapid MVP development (4-6 weeks) while maintaining clean separation of concerns
and enabling future migration to hosted deployment.
