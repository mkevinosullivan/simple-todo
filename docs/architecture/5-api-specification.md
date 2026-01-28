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

## Configuration Endpoints

### GET /api/config/wip-limit

Get current WIP limit configuration with metadata about active task count.

**Request:**

```http
GET /api/config/wip-limit
```

**Response (200 OK):**

```json
{
  "limit": 7,
  "currentCount": 3,
  "canAddTask": true
}
```

**Response Fields:**

- `limit` (number): Current WIP limit (5-10)
- `currentCount` (number): Number of active tasks
- `canAddTask` (boolean): True if tasks can be added (currentCount < limit)

**Error Responses:**

- `500 Internal Server Error`: Failed to retrieve configuration

---

### PUT /api/config/wip-limit

Update WIP limit configuration.

**Request:**

```http
PUT /api/config/wip-limit
Content-Type: application/json

{
  "limit": 8
}
```

**Request Body:**

- `limit` (number, required): New WIP limit (5-10, integer)

**Response (200 OK):**

```json
{
  "limit": 8,
  "currentCount": 3,
  "canAddTask": true
}
```

**Response Fields:**

- `limit` (number): Updated WIP limit
- `currentCount` (number): Current number of active tasks
- `canAddTask` (boolean): True if tasks can be added

**Error Responses:**

**400 Bad Request** (Validation Failed):

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "limit",
      "message": "WIP limit must be at least 5"
    }
  ]
}
```

**Validation Rules:**

- `limit` must be a number
- `limit` must be an integer
- `limit` must be between 5 and 10 (inclusive)

**500 Internal Server Error:**

```json
{
  "error": "Failed to update WIP limit configuration"
}
```

---

## WIP Limit Enforcement

The WIP limit is enforced when creating tasks via `POST /api/tasks`.

**409 Conflict** (WIP Limit Reached):

```json
{
  "error": "WIP limit reached",
  "wipLimitMessage": "You have 7 active tasks - complete one before adding more to maintain focus!"
}
```

**When WIP Limit is Enforced:**

- Checked before task creation
- Only counts tasks with status "active"
- Completed tasks do not count toward limit
- Config changes take effect immediately (no restart required)

**Error Code Distinction:**

- `400 Bad Request`: Invalid task data (empty text, too long, etc.)
- `409 Conflict`: WIP limit reached (business rule violation)
- `500 Internal Server Error`: Server-side error (file system, etc.)

---
