# Epic 4 Details: Proactive Prompting System

**Epic Goal:** Build the core innovation that differentiates this app from all competitors - a proactive prompting system that initiates interaction by suggesting specific tasks to users at intelligent intervals. Implement non-blocking toast notifications, user response handling (complete/dismiss/snooze), configurable prompting frequency, optional browser notification integration, and the ability to opt-out entirely. By the end of this epic, we validate the unproven hypothesis that proactive engagement increases task completion rates and transforms the app from passive tool to active productivity partner.

## Story 4.1: Prompting Service - Core Scheduling Logic

**As a** developer,
**I want** a PromptingService that manages the scheduling and selection of task prompts,
**so that** proactive prompts are generated at appropriate intervals with proper task selection.

**Acceptance Criteria:**

1. PromptingService class created with methods: `startScheduler()`, `stopScheduler()`, `generatePrompt()`, `selectTaskForPrompt()`
2. Scheduler uses `node-schedule` library or `setInterval` to trigger prompts at configured intervals
3. Default prompting interval: 2-3 hours, randomly selected within range for each prompt (per PRD FR11)
4. `selectTaskForPrompt()` chooses one active task from TaskService using random selection algorithm for MVP
5. `generatePrompt()` creates prompt object: `{ taskId: string, taskText: string, promptedAt: timestamp }`
6. Service reads prompting configuration from config.json: `{ enabled: boolean, frequencyHours: number }`
7. If prompting disabled in config, scheduler doesn't start (respects opt-out)
8. Scheduler only runs when there are active tasks available (pauses when task list empty)
9. Service tracks last prompt time to ensure proper interval spacing
10. Unit tests verify: scheduler triggers at intervals, task selection logic, respects enabled/disabled state

## Story 4.2: Prompt Delivery - Server-Sent Events (SSE) Infrastructure

**As a** developer,
**I want** Server-Sent Events implemented for real-time prompt delivery from backend to frontend,
**so that** prompts can be pushed to the browser without polling.

**Acceptance Criteria:**

1. SSE endpoint created: `GET /api/prompts/stream` establishes persistent connection for prompt delivery
2. Endpoint sends `keep-alive` messages every 30 seconds to maintain connection
3. When PromptingService generates prompt, server sends event through SSE stream: `event: prompt\ndata: {taskId, taskText, promptedAt}\n\n`
4. Frontend SSE client (EventSource) connects to stream on app load
5. Connection automatically reconnects if dropped (EventSource handles this by default)
6. Multiple browser tabs/windows supported - each receives prompts independently
7. SSE endpoint only sends prompts if prompting enabled in config
8. Graceful degradation: If SSE not supported (old browsers), fall back to periodic polling (optional for MVP)
9. Integration tests verify: SSE connection established, events received by client, reconnection works
10. Performance: SSE connection uses minimal resources, doesn't impact app responsiveness

## Story 4.3: Toast Notification Component - Non-Blocking Prompt Display

**As a** user,
**I want** task prompts to appear as non-intrusive notifications in the corner of the screen,
**so that** I'm gently reminded without being interrupted from my current work.

**Acceptance Criteria:**

1. Toast notification component renders in screen corner (bottom-right or top-right, configurable)
2. Toast displays message: "Could you do [task text] now?" with truncation for long tasks (max 60 characters)
3. Toast includes three action buttons: "Complete" (green checkmark), "Dismiss" (X icon), "Snooze" (clock icon)
4. Toast persists for 30 seconds then auto-dismisses if user doesn't interact (per PRD UX goals)
5. Entrance animation: Toast slides in from edge smoothly (300ms animation)
6. Exit animation: Toast slides out when dismissed or times out (300ms animation)
7. Toast is clickable/expandable to show full task text if truncated
8. Multiple prompts queue - only one toast visible at a time, next shows after current dismissed
9. Toast styling uses neutral colors (not vibrant accents) to be informative not demanding
10. Toast doesn't block interaction with main UI - user can continue working while toast visible

## Story 4.4: Prompt Response Handling - Complete/Dismiss/Snooze

**As a** user,
**I want** to respond to task prompts by completing, dismissing, or snoozing them,
**so that** I have control over how I engage with proactive suggestions.

**Acceptance Criteria:**

1. Clicking "Complete" button on toast calls `PATCH /api/tasks/:id/complete` and triggers celebration
2. After completing task via prompt, toast disappears and celebration appears (same as manual completion)
3. Clicking "Dismiss" button removes toast immediately, no other action taken
4. Clicking "Snooze" button dismisses toast and reschedules prompt for same task in 1 hour (per PRD FR12)
5. API endpoint created: `POST /api/prompts/snooze` accepts `{ taskId: string }` and schedules future prompt
6. Snooze scheduling tracked in memory or persisted to prevent duplicate prompts for same task
7. If snoozed task is completed or deleted before snooze time, scheduled prompt is cancelled
8. Prompt response tracking logged for analytics: track response type (complete/dismiss/snooze) and timestamp
9. User can't be prompted for same task twice within 24 hours (prevents annoying repetition)
10. Integration tests verify: complete response triggers task completion, dismiss removes toast, snooze reschedules

## Story 4.5: Prompting Configuration in Settings

**As a** user,
**I want** to configure how often I receive prompts and disable them entirely if desired,
**so that** I have control over the proactive feature's intrusiveness.

**Acceptance Criteria:**

1. Settings screen includes "Proactive Prompts" section with configuration options
2. Toggle: "Enable proactive prompts" (on by default) - disables/enables entire prompting system
3. Frequency slider: "Prompt frequency" (1-6 hours range, default 2-3 hours) controls interval (per PRD FR17)
4. Explanation text: "The app will suggest a task for you to complete every [N] hours to help you make progress"
5. When prompting disabled, scheduler stops and no prompts generated until re-enabled
6. Frequency changes take effect for next scheduled prompt (current cycle completes at old interval)
7. Settings show time until next prompt: "Next prompt in approximately [X] minutes" (rough estimate)
8. "Test prompt now" button allows user to trigger immediate prompt to see what they look like
9. Settings saved to config.json and persist across app restarts
10. API endpoint created: `PUT /api/config/prompting` accepts `{ enabled: boolean, frequencyHours: number }`

## Story 4.6: Browser Notification Integration (Opt-In)

**As a** user,
**I want** the option to receive browser notifications when prompts occur,
**so that** I can be notified even when the app is in a background tab.

**Acceptance Criteria:**

1. Settings screen includes option: "Enable browser notifications" (off by default per PRD UX revision)
2. Toggle is disabled until user grants browser notification permission
3. Clicking toggle prompts user for notification permission using browser's native permission dialog
4. If permission granted, toggle becomes enabled and browser notifications activate
5. If permission denied, toggle remains disabled with message: "Permission denied. Enable in browser settings to use this feature."
6. When browser notifications enabled, prompts trigger both in-app toast AND browser notification
7. Browser notification includes: "Simple To-Do App" title, "Could you do [task text] now?" message, app icon
8. Clicking browser notification brings app window to focus and shows in-app toast with actions
9. Browser notifications respect user's OS notification settings (Do Not Disturb, quiet hours)
10. Settings persist browser notification preference in config.json

## Story 4.7: Prompt Analytics and Success Tracking

**As a** developer and product manager,
**I want** to track how users respond to prompts (response rate, action types),
**so that** we can measure whether proactive prompting achieves our innovation hypothesis goals.

**Acceptance Criteria:**

1. PromptingService tracks all prompt events: `{ promptId: string, taskId: string, promptedAt: timestamp, response: 'complete'|'dismiss'|'snooze'|'timeout', respondedAt: timestamp }`
2. Prompt events persisted to prompts.json file for historical analysis
3. AnalyticsService extended with methods: `getPromptResponseRate()`, `getPromptResponseBreakdown()`, `getAverageResponseTime()`
4. `getPromptResponseRate()` calculates (prompts with action / total prompts) × 100, target ≥40% per PRD
5. `getPromptResponseBreakdown()` returns object: `{ complete: number, dismiss: number, snooze: number, timeout: number }`
6. `getAverageResponseTime()` calculates mean time between promptedAt and respondedAt for engaged prompts
7. API endpoint created: `GET /api/analytics/prompts` returns prompt statistics for display
8. Statistics displayed in Settings or dedicated analytics view (optional): "Prompt response rate: [X]%"
9. Data collection respects privacy: stored locally only, never transmitted (per NFR4)
10. Unit tests verify: tracking logic, calculation accuracy, response rate formulas

## Story 4.8: Smart Prompt Timing and User Context Awareness (Optional Enhancement)

**As a** user,
**I want** prompts to avoid interrupting me at inconvenient times,
**so that** proactive suggestions feel helpful rather than disruptive.

**Acceptance Criteria:**

1. Prompting service detects user activity: if user actively working in app (added/completed task in last 5 min), delay prompt
2. "Quiet hours" configuration in settings: User can set time range when prompts shouldn't occur (e.g., 10pm-8am)
3. If quiet hours configured, scheduler skips prompts during that window
4. Prompt backlog: If prompts missed during quiet hours, don't catch up with multiple prompts - just resume normal schedule
5. Optional: Detect if user has tab focused - only show in-app toast if app visible, queue for when they return
6. Configuration saved to config.json: `{ quietHoursStart: "22:00", quietHoursEnd: "08:00" }`
7. Settings UI for quiet hours: time pickers for start and end times with toggle to enable/disable
8. When prompt delayed due to user activity, next prompt rescheduled for random interval within configured range
9. Quiet hours respect user's local timezone (use client-side time, not server time)
10. Feature is optional - if not configured, prompts occur at any time within frequency interval

## Story 4.9: First Prompt Onboarding and Education

**As a** first-time user receiving a prompt,
**I want** to understand what the prompt is and why I'm receiving it,
**so that** I'm not confused or annoyed by this unfamiliar feature.

**Acceptance Criteria:**

1. First prompt a user receives includes additional educational overlay or tooltip
2. Education message explains: "This is a proactive prompt - the app suggests a task to help you make progress. You can complete it, dismiss it, or snooze for later."
3. Visual indicator marks first prompt as special (highlight, subtle animation, or info icon)
4. "Don't show this again" checkbox allows user to skip education on future prompts
5. After first prompt interaction (any response), education overlay doesn't appear again
6. First prompt timing: Wait at least 15 minutes after app launch before first prompt (let user acclimate)
7. If user completes first prompt, extra encouragement: "Great! You engaged with your first proactive prompt."
8. If user dismisses first prompt, gentle follow-up in next prompt: "Not ready? You can snooze or disable prompts in Settings."
9. Education state tracked in config.json: `{ hasSeenPromptEducation: boolean }`
10. Education doesn't feel patronizing - brief, clear, and respectful of user's intelligence

## Story 4.10: Testing, Epic Validation, and MVP Completion

**As a** developer and product manager,
**I want** comprehensive testing of the prompting system and overall MVP validation,
**so that** we confirm the app is ready for pilot user testing and meets all PRD requirements.

**Acceptance Criteria:**

1. Unit tests for PromptingService verify: scheduling logic, task selection, configuration handling
2. Integration tests for SSE verify: connection establishment, event delivery, reconnection handling
3. Integration tests for prompt responses: complete action completes task, dismiss removes toast, snooze reschedules
4. Manual end-to-end testing checklist completed: receive prompt, test all response types, verify analytics tracking
5. Cross-feature testing: Prompt-triggered completion shows celebration, WIP limit respected, data tracked correctly
6. User acceptance criteria validation: All FR requirements (FR1-FR19) tested and working
7. Non-functional requirements validation: Startup time <2s, task operations <100ms, 70%+ test coverage achieved
8. Pilot user readiness: README with setup instructions, app runs cleanly on Windows/Mac/Linux, no critical bugs
9. Epic demo-able: Can demonstrate full user journey including receiving and responding to prompts
10. MVP complete: All 4 epics delivered, app ready for pilot user testing phase
11. Pilot users informed of feedback channels during onboarding

## Story 4.11: Pilot User Feedback Collection System

**As a** pilot user,
**I want** easy ways to provide feedback about my experience with the app,
**so that** I can report bugs, suggest improvements, and help shape the product's evolution.

**As a** product manager,
**I want** a structured mechanism to collect pilot user feedback,
**so that** I can validate MVP hypotheses and identify issues before broader release.

**Acceptance Criteria:**

1. Feedback link added to Settings screen or Help menu: "Send Feedback" button/link prominently displayed
2. Clicking feedback link opens user's default email client with pre-populated template:
   - **To:** [project email or maintainer email]
   - **Subject:** "Simple To-Do App Feedback"
   - **Body template:** "**What I was doing:** \n\n**What happened:** \n\n**What I expected:** \n\n**Suggestions:** \n\n---\nApp Version: [version from package.json]\nOS: [auto-detected if possible, otherwise user fills in]\n"
3. Alternative feedback option: GitHub Issues link in Help menu (if repository is public)
4. GitHub Issues link opens in browser to repository's issues page with "bug" and "enhancement" label templates
5. README.md updated with "Providing Feedback" section explaining both feedback channels
6. In-app feedback button includes tooltip: "Report bugs or suggest improvements"
7. First-launch configuration flow (Story 2.8) includes optional message: "This is a pilot version - your feedback helps us improve!"
8. Feedback mechanism works offline (email client) and online (GitHub)
9. No analytics or telemetry sent automatically - respects NFR4 privacy-first design
10. Feedback instructions visible but not intrusive - doesn't interrupt user workflows

**Optional Enhancements (Phase 2):**
- In-app feedback form that saves to local JSON for offline collection
- Export system state (tasks.json, config.json, logs) for bug reports
- Feedback prompt after 1 week of usage: "How's it going? We'd love your feedback!"
