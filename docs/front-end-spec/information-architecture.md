# Information Architecture

## Site Map / Screen Inventory

The Simple To-Do App has a focused, minimal screen structure to maintain simplicity:

```
Simple To-Do App
│
├── First-Launch Configuration (one-time)
│   └── WIP Limit Setup
│
├── Main Task List View (Primary Screen)
│   ├── Add Task Input
│   ├── Active Tasks List
│   ├── WIP Count Indicator
│   └── Settings Access Icon
│
├── Settings/Preferences Screen (Modal/Overlay)
│   ├── WIP Limit Configuration
│   ├── Proactive Prompts Section
│   │   ├── Enable/Disable Toggle
│   │   ├── Frequency Slider (1-6 hours)
│   │   └── Browser Notifications Opt-In
│   └── Celebration Preferences
│       ├── Enable/Disable Toggle
│       └── Duration Slider (3-10 seconds)
│
├── Empty States (Conditional Views)
│   ├── First-Time User Quick Start Guide
│   └── Inbox Zero Celebration
│
└── Overlays & Notifications (Non-Screen Elements)
    ├── Proactive Prompt Toast (bottom-right corner)
    ├── Celebration Overlay (center screen)
    ├── WIP Limit Message (inline with add task)
    └── Error/Success Toasts (top-right corner)
```

### Screen Details

**1. First-Launch Configuration**
- **When Shown:** First app launch only (detected by absence of config.json or hasCompletedSetup flag)
- **Purpose:** Guide user through initial WIP limit setup
- **Exit Path:** "Get Started" button → Main Task List View

**2. Main Task List View**
- **When Shown:** Default view after setup, primary interface
- **Key Elements:** Add task input at top, active tasks in chronological order, WIP count indicator in header, settings icon
- **Variations:**
  - Empty state (first-time users) → Quick Start Guide
  - Empty state (returning users) → Inbox Zero Celebration

**3. Settings/Preferences Screen**
- **When Shown:** User clicks settings icon/link
- **Implementation:** Modal overlay or slide-in panel (does not navigate away from main view)
- **Exit Path:** Close button or backdrop click → Returns to Main Task List View

**4. Proactive Prompt Toast**
- **When Shown:** At configured intervals (default 2-3 hours) when active tasks exist
- **Location:** Bottom-right corner of screen
- **Behavior:** Non-blocking, auto-dismisses after 30 seconds
- **Actions:** Complete, Dismiss, Snooze (1 hour)

**5. Celebration Overlay**
- **When Shown:** Immediately after task completion (via manual action or prompt response)
- **Location:** Center screen, prominent but non-blocking
- **Behavior:** Auto-dismisses after 7 seconds (configurable), user can dismiss via click or Escape key

## Navigation Patterns

**Primary Navigation Paradigm:** Single-Page Application (SPA) with minimal navigation

The app intentionally avoids traditional multi-page navigation to maintain focus and reduce cognitive load:

1. **No Traditional Menu/Navigation Bar**
   - Main Task List is always the primary view
   - Settings accessed via icon (gear/cog) in top-right corner
   - Help accessed via "?" icon adjacent to settings

2. **Modal-Based Settings Access**
   - Settings open as overlay/modal on top of main view
   - User can see their task list underneath (semi-transparent backdrop)
   - Closing settings returns immediately to where they were
   - No history navigation needed

3. **Inline Contextual Actions**
   - Task actions (complete, edit, delete) appear directly on each task item
   - WIP limit messages appear inline near add task input
   - No separate "task detail" view needed

4. **Non-Intrusive Overlays**
   - Toasts appear in corners, don't interrupt flow
   - Celebrations appear center-screen but are dismissible
   - User never "loses" their place in the app

5. **Keyboard Navigation Support**
   - Tab through tasks and actions
   - Enter to submit new task
   - Arrow keys to navigate task list (optional enhancement)
   - Escape to dismiss modals/overlays
   - All primary actions accessible via keyboard

**Navigation Flow Examples:**

```
First Launch Flow:
Launch → First-Launch Config → Main Task List (with Quick Start Guide if 0 tasks)

Daily Usage Flow:
Main Task List ← → Settings Modal
     ↓
Task Completion → Celebration Overlay → Returns to Main Task List
     ↓
Toast Prompt → Action (Complete/Dismiss/Snooze) → Returns to previous state

Inbox Zero Flow:
Complete Final Task → Inbox Zero Celebration → Returns to Main Task List (empty state)
```

**State Persistence:**
- App remembers last view state (scroll position, any in-progress task edits)
- Settings changes apply immediately without page reload
- Task operations update UI optimistically (instant feedback)
