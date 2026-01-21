# 8. Security & Compliance

## Threat Model

**Application Context:**

- **Deployment:** Localhost-only, single-user application
- **Network Exposure:** None (no external network access)
- **Data Sensitivity:** Personal task data (non-critical, but private)
- **Attack Surface:** Limited to local machine access

**Threat Actors:**

| Threat Actor                             | Likelihood | Impact | Mitigation                                |
| ---------------------------------------- | ---------- | ------ | ----------------------------------------- |
| **Remote Attacker**                      | None       | N/A    | Not exposed to internet                   |
| **Malicious Software on User's Machine** | Low        | High   | Rely on OS security, file permissions     |
| **Malicious Input (User or Clipboard)**  | Medium     | Medium | Input validation with Zod                 |
| **Accidental Data Loss**                 | Medium     | Medium | Atomic file writes, backup recommendation |
| **Physical Access to Machine**           | Low        | High   | Out of scope (OS-level security)          |

**Out of Scope for MVP:**

- Network-based attacks (no network exposure)
- Multi-user access control (single-user app)
- Encryption at rest (acceptable for localhost MVP)
- Secure credential storage (no credentials used)

---

## Security Controls Implemented

### 1. Input Validation & Sanitization

**Backend - Zod Schema Validation:**

All API endpoints validate input using Zod schemas before processing:

```typescript
// Example: Task creation validation
const CreateTaskDtoSchema = z.object({
  text: z
    .string()
    .min(1, 'Task cannot be empty')
    .max(500, 'Task text too long (max 500 characters)')
    .trim(), // Remove leading/trailing whitespace
});

// In API route
app.post('/api/tasks', async (req, res) => {
  try {
    const dto = CreateTaskDtoSchema.parse(req.body);
    // dto is now validated and type-safe
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  }
});
```

**Validation Rules Enforced:**

- ✅ Task text: 1-500 characters, trimmed
- ✅ WIP limit: Integer 5-10
- ✅ Prompting frequency: Number 1-6
- ✅ Celebration duration: Number 3-10
- ✅ Task IDs: Valid UUIDs
- ✅ Timestamps: Valid ISO 8601 format

**Protection Against:**

- ✅ **SQL Injection:** N/A (no SQL database)
- ✅ **Command Injection:** No user input passed to shell commands
- ✅ **Path Traversal:** File paths are hardcoded, not user-controlled
- ✅ **XSS (Cross-Site Scripting):** React escapes by default, DOMPurify for
  edge cases

---

### 2. Data Integrity & Atomic Writes

**Atomic File Write Pattern:**

```typescript
// DataService implementation
async saveTasks(tasks: Task[]): Promise<void> {
  const tempFile = `${this.tasksFilePath}.tmp`;

  try {
    // Write to temporary file first
    await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2), 'utf-8');

    // Atomic rename (POSIX guarantees atomicity)
    await fs.rename(tempFile, this.tasksFilePath);

    // If process crashes here, worst case: temp file remains, data file is intact
  } catch (error) {
    // Clean up temp file on error
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
}
```

**Benefits:**

- ✅ Prevents partial writes/corrupted JSON (NFR6: data integrity)
- ✅ Crash-safe: Either old data or new data, never corrupted state
- ✅ No race conditions (single-user, single-process)

---

### 3. XSS (Cross-Site Scripting) Prevention

**React Default Escaping:**

React automatically escapes content rendered via JSX:

```typescript
// Safe - React escapes by default
<p>{task.text}</p>

// Even if task.text contains: <script>alert('xss')</script>
// React renders it as plain text, not executable code
```

**Dangerous Patterns Avoided:**

```typescript
// NEVER DO THIS (bypasses React escaping)
<div dangerouslySetInnerHTML={{ __html: task.text }} /> // ❌ DANGEROUS
```

**Current Status:** React's default escaping is sufficient for MVP. Content
Security Policy deferred to Phase 2.

---

### 4. CSRF (Cross-Site Request Forgery) Prevention

**Current Status:** CSRF protection **not needed** for MVP.

**Rationale:**

1. **Localhost-only:** No external access, no cross-site requests
2. **No authentication:** No session cookies to steal
3. **Same-origin policy:** Browser enforces origin checks

**If Phase 2 adds authentication:**

- Implement CSRF tokens for state-changing operations
- Use SameSite cookie attribute
- Verify Origin/Referer headers

---

### 5. File System Security

**Restricted File Paths:**

```typescript
// DataService uses fixed, non-user-controlled paths
class DataService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly tasksFilePath = path.join(this.dataDir, 'tasks.json');
  private readonly configFilePath = path.join(this.dataDir, 'config.json');
  private readonly promptsFilePath = path.join(this.dataDir, 'prompts.json');

  // NEVER construct paths from user input
  // ❌ BAD: path.join(this.dataDir, userInput)
}
```

**Protection Against:**

- ✅ **Path Traversal:** No user input in file paths
- ✅ **Directory Traversal:** Fixed directory structure
- ✅ **File Overwrite:** Only write to designated files

---

### 6. Error Handling & Information Disclosure

**Production vs Development Error Messages:**

```typescript
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error for debugging
  logger.error('API Error:', err);

  // Return sanitized error to client
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'An error occurred',
    // Never send stack traces in production
    ...(isDevelopment && { stack: err.stack }),
  });
});
```

**Sensitive Information Protection:**

- ✅ No stack traces in production responses
- ✅ No internal file paths in error messages
- ✅ No database connection strings (N/A)
- ✅ No API keys (N/A)

---

### 7. Logging & Monitoring

**Winston Logger Configuration:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write to files
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
    // Console output in development
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

**Logged Events:**

- ✅ API requests (without sensitive data)
- ✅ Errors and exceptions
- ✅ File write operations
- ✅ Configuration changes
- ❌ Task content (privacy consideration)
- ❌ User identifiable information (none exists)

---

## Compliance & Privacy

### GDPR / Privacy Compliance

**Current Status:** Fully compliant by design (localhost-only, no data
collection)

**GDPR Principles:**

| Principle                              | Compliance Status                                    |
| -------------------------------------- | ---------------------------------------------------- |
| **Lawfulness, Fairness, Transparency** | ✅ User owns all data, runs on their machine         |
| **Purpose Limitation**                 | ✅ Data used only for task management                |
| **Data Minimization**                  | ✅ Only essential task data stored                   |
| **Accuracy**                           | ✅ User controls all data updates                    |
| **Storage Limitation**                 | ✅ User controls data retention (can delete anytime) |
| **Integrity & Confidentiality**        | ✅ Data never leaves user's machine (NFR4)           |
| **Accountability**                     | ✅ No data processing, no third parties              |

**Data Subject Rights:**

| Right                         | Implementation                                 |
| ----------------------------- | ---------------------------------------------- |
| **Right to Access**           | User owns JSON files, can read directly        |
| **Right to Rectification**    | User can edit/update tasks via UI              |
| **Right to Erasure**          | User can delete tasks or entire data directory |
| **Right to Data Portability** | JSON files are portable, readable format       |
| **Right to Object**           | N/A (no automated decision-making)             |

**No Privacy Policy Required:**

- No data collection or processing by third parties
- No cookies (session cookies are localhost HTTP-only, functional only)
- No tracking or analytics
- No external data transmission

---

## Security Testing Strategy

### Static Analysis

**ESLint Security Plugin:**

```json
// .eslintrc.json
{
  "extends": ["plugin:security/recommended"],
  "plugins": ["security"]
}
```

**Checks for:**

- Command injection risks
- Unsafe regex patterns
- Non-literal fs operations
- Eval usage
- Hardcoded secrets (if any added)

### Dependency Scanning

**npm audit:**

```bash
# Run in CI/CD pipeline
npm audit --production

# Fail build on high/critical vulnerabilities
npm audit --audit-level=high
```

**Dependabot (GitHub):**

- Automatic PR for dependency updates
- Security vulnerability alerts

### Manual Security Testing

**Test Cases:**

| Test                                             | Expected Behavior                    |
| ------------------------------------------------ | ------------------------------------ |
| Submit task with `<script>alert('xss')</script>` | Rendered as plain text, not executed |
| Submit task with 501 characters                  | Validation error returned            |
| Send task with null/undefined text               | Validation error returned            |
| Attempt to set WIP limit to 11                   | Validation error returned            |
| Create task while at WIP limit                   | 409 Conflict with helpful message    |
| Directly edit tasks.json with invalid JSON       | App handles gracefully, logs error   |

---

## Known Security Limitations & Accepted Risks

| Limitation                      | Risk Level | Mitigation                       | Acceptance Rationale                                   |
| ------------------------------- | ---------- | -------------------------------- | ------------------------------------------------------ |
| **No encryption at rest**       | Low        | None for MVP                     | Localhost-only, user's machine security responsibility |
| **No authentication**           | None       | N/A                              | Single-user localhost app by design                    |
| **No HTTPS**                    | None       | N/A                              | Localhost HTTP is sufficient, no network exposure      |
| **No rate limiting**            | None       | N/A                              | Single-user, no abuse potential                        |
| **File permissions rely on OS** | Low        | Document recommended permissions | Trust OS-level security                                |
| **No automated backups**        | Medium     | Recommend manual backups in docs | User controls data, can copy JSON files                |

**Risk Acceptance:** All limitations are acceptable for localhost MVP with 5-10
pilot users. Phase 2 deployment requires reevaluation.

---

## Security Checklist

**Implementation Status:**

- [x] Input validation on all API endpoints (Zod)
- [x] Atomic file writes for data integrity
- [x] XSS prevention (React default escaping)
- [x] File path validation (no user input in paths)
- [x] Error handling without information disclosure
- [x] Structured logging (Winston)
- [x] GDPR compliance (privacy by design)
- [x] Dependency vulnerability scanning (npm audit)
- [x] Security linting (ESLint security plugin)
- [ ] HTTPS (N/A for localhost)
- [ ] Authentication (N/A for single-user)
- [ ] CSRF protection (N/A for localhost)
- [ ] Rate limiting (N/A for single-user)
- [ ] Security headers (Deferred to Phase 2)
- [ ] Penetration testing (Deferred to Phase 2)

---

## Security Posture Summary

**Strengths:**

- ✅ **Zero network exposure** eliminates 90% of typical web app vulnerabilities
- ✅ **Privacy-first design** (NFR4) ensures no data leakage
- ✅ **Input validation** prevents injection attacks
- ✅ **Atomic writes** ensure data integrity (NFR6)
- ✅ **React escaping** prevents XSS
- ✅ **GDPR compliant** by design (localhost-only)

**Acceptable Trade-offs:**

- ⚠️ **No encryption at rest** - Acceptable for localhost MVP
- ⚠️ **No audit trail** - Acceptable for 5-10 users
- ⚠️ **Trust OS security** - Reasonable assumption for single-user machine

**Phase 2 Requirements:**

- If hosted: Add HTTPS, CSP headers, HSTS, authentication
- If multi-user: Add RBAC, audit logging, CSRF protection
- If commercial: Add SOC 2 compliance, penetration testing

**Verdict:** Security posture is **appropriate for localhost MVP** and can be
enhanced for Phase 2 deployment as needed.

---
