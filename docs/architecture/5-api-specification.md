# 5. API Specification

## REST API Endpoints Summary

| Endpoint                    | Method | Purpose                                    |
| --------------------------- | ------ | ------------------------------------------ |
| `/api/tasks`                | GET    | Get all tasks (optional status filter)     |
| `/api/tasks`                | POST   | Create new task (409 if WIP limit reached) |
| `/api/tasks/:id`            | GET    | Get task by ID                             |
| `/api/tasks/:id`            | PUT    | Update task text                           |
| `/api/tasks/:id`            | DELETE | Delete task                                |
| `/api/tasks/:id/complete`   | PATCH  | Mark task as complete                      |
| `/api/config/wip-limit`     | GET    | Get WIP limit configuration                |
| `/api/config/wip-limit`     | PUT    | Update WIP limit (5-10)                    |
| `/api/config/prompting`     | GET    | Get prompting configuration                |
| `/api/config/prompting`     | PUT    | Update prompting settings                  |
| `/api/config/celebrations`  | GET    | Get celebration configuration              |
| `/api/config/celebrations`  | PUT    | Update celebration settings                |
| `/api/config`               | GET    | Get all configuration                      |
| `/api/celebrations/message` | GET    | Get random celebration message             |
| `/api/prompts/stream`       | GET    | SSE stream for proactive prompts           |
| `/api/prompts/snooze`       | POST   | Snooze a prompt for 1 hour                 |
| `/api/analytics/tasks`      | GET    | Get task analytics (Phase 2)               |
| `/api/analytics/prompts`    | GET    | Get prompt analytics (Phase 2)             |

**Complete OpenAPI 3.0 specification available in separate section above.**

---
