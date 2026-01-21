# User Flows

## Critical User Journeys

The following flows represent the most important user interactions in the Simple
To-Do App. These flows are designed to be visualized using Mermaid diagrams for
clarity.

### Flow 1: First-Time User Onboarding

This flow shows how a new user experiences the app from launch through first
task completion.

```mermaid
graph TD
    A[Launch App] --> B{Config Exists?}
    B -->|No| C[First-Launch Configuration Screen]
    B -->|Yes| G[Main Task List]
    C --> D[Display WIP Limit Selector<br/>Default: 7 tasks<br/>Range: 5-10]
    D --> E[User Selects WIP Limit]
    E --> F[Click 'Get Started' Button]
    F --> G[Main Task List View]
    G --> H{Has Tasks?}
    H -->|No| I[Show Quick Start Guide<br/>Empty State]
    H -->|Yes| J[Show Task List]
    I --> K[User Reads Guide:<br/>1. Add first task<br/>2. Complete it<br/>3. See celebration]
    K --> L[User Adds First Task]
    L --> M[Task Appears in List]
    M --> N[User Clicks Complete Button]
    N --> O[Celebration Overlay Appears<br/>'First task done! Keep it up!']
    O --> P[Auto-dismiss after 7s<br/>or User Dismisses]
    P --> Q[Returns to Main Task List<br/>User Onboarded ✓]
```

**Key Decision Points:**

- Config existence check determines onboarding path
- Empty state vs populated list determines which view to show
- First completion triggers special celebration message

### Flow 2: Adding a Task (Happy Path & WIP Limit)

Shows both successful task addition and hitting the WIP limit constraint.

```mermaid
graph TD
    A[Main Task List] --> B[User Types Task Text]
    B --> C[User Presses Enter or<br/>Clicks 'Add Task']
    C --> D{Validate Input}
    D -->|Empty/Whitespace| E[Show Error:<br/>'Task cannot be empty']
    D -->|Too Long >500 chars| F[Show Error:<br/>'Task too long max 500 characters']
    D -->|Valid| G{Check WIP Limit}
    G -->|Below Limit| H[Create Task via API]
    G -->|At Limit| I[Show WIP Limit Message<br/>'You have N active tasks...<br/>complete one to add more']
    H --> J[Task Appears in List<br/>Input Field Clears]
    J --> K[WIP Count Updates<br/>e.g., '6 of 7 tasks']
    I --> L[Add Button Disabled<br/>Visual Feedback]
    L --> M[User Clicks Settings Link<br/>in Message]
    M --> N[Settings Modal Opens]
    N --> O[User Adjusts WIP Limit<br/>or Completes/Deletes Task]
    E --> B
    F --> B
```

**Key Decision Points:**

- Input validation prevents empty or oversized tasks
- WIP limit check determines whether task creation proceeds
- Error states allow user to retry with corrected input
- WIP limit state provides path to settings or task completion

### Flow 3: Proactive Prompt Response Flow

Demonstrates the complete lifecycle of a proactive prompt from generation to
user response.

```mermaid
graph TD
    A[App Running<br/>User Away] --> B[Prompting Scheduler<br/>Interval: 2-3 hours]
    B --> C{Has Active Tasks?}
    C -->|No| D[Skip Prompt<br/>Wait for Next Interval]
    C -->|Yes| F{Prompting Enabled?}
    F -->|No| D
    F -->|Yes| E[Select Random Task]
    E --> G[Generate Prompt Event<br/>via SSE]
    G --> H[Toast Notification Appears<br/>Bottom-Right Corner<br/>'Could you do task now?']
    H --> I[30-Second Timer Starts]
    I --> J{User Response?}
    J -->|Complete Button| K[Call Complete API<br/>PATCH /api/tasks/:id/complete]
    J -->|Dismiss Button| L[Toast Disappears<br/>No Further Action]
    J -->|Snooze Button| M[Log Response:<br/>'snooze' + timestamp]
    J -->|Timeout 30s| N[Toast Auto-Dismisses<br/>Log as 'timeout']
    K --> O[Task Marked Complete<br/>Removed from Active List]
    O --> P[Celebration Overlay Appears]
    P --> Q[Log Response:<br/>'complete' + timestamp]
    L --> R[Log Response:<br/>'dismiss' + timestamp]
    M --> S[Snoozed Prompt Queue]
    S --> T[Wait 1 Hour]
    T --> H
    N --> V[Log Response:<br/>'timeout' + timestamp]
```

**Key Decision Points:**

- Active tasks check prevents prompting when list is empty
- Prompting enabled setting respects opt-out preference
- User has 4 possible outcomes: complete, dismiss, snooze, or timeout
- Snooze creates a feedback loop returning to the same prompt
- All responses logged for analytics

### Flow 4: Task Completion to Celebration

Shows the emotional reward system that reinforces positive behavior.

```mermaid
graph TD
    A[User Views Task List] --> B[User Clicks Complete Button<br/>on Task]
    B --> C[Optimistic UI Update<br/>Task Fades Out Immediately]
    C --> D[API Call:<br/>PATCH /api/tasks/:id/complete]
    D --> E{API Success?}
    E -->|Yes| F[Fetch Celebration Message<br/>GET /api/celebrations/message]
    E -->|No| G[Task Reappears in List<br/>Error Toast]
    F --> H[Celebration Overlay Renders<br/>Center Screen]
    H --> I[Display Message + Icon<br/>Vibrant Colors<br/>Optional Confetti]
    I --> J[7-Second Timer Starts]
    J --> K{User Action?}
    K -->|Click Anywhere| L[Celebration Dismisses<br/>Fade Out Animation]
    K -->|Press Escape| L
    K -->|Timer Expires| L
    L --> M{Was Last Active Task?}
    M -->|Yes| N[Show Inbox Zero Celebration<br/>'You completed everything!']
    M -->|No| O[Return to Task List<br/>WIP Count Updated]
    N --> P[Display Completion Stats<br/>e.g., 'N tasks this week']
    P --> Q[Call to Action:<br/>'Add New Tasks' Button]
    G --> R[User Can Retry Action]
```

**Key Decision Points:**

- Optimistic update provides instant feedback
- API failure gracefully reverts UI state
- User can dismiss celebration or let it auto-dismiss
- Completing last task triggers special Inbox Zero flow
- Inbox Zero celebration is more elaborate and persistent

### Flow 5: Settings Configuration

Shows how users customize their experience through the settings interface.

```mermaid
graph TD
    A[Main Task List] --> B[User Clicks Settings Icon<br/>Gear in Top-Right]
    B --> C[Settings Modal Opens<br/>Semi-Transparent Backdrop]
    C --> D[Display Current Config:<br/>- WIP Limit<br/>- Prompt Frequency<br/>- Celebration Duration]
    D --> E{User Makes Changes?}
    E -->|Adjust WIP Limit| F[Slider/Input 5-10<br/>Shows Current Count]
    E -->|Adjust Prompt Freq| G[Slider 1-6 hours<br/>Shows Next Prompt Time]
    E -->|Toggle Prompts| H[Enable/Disable<br/>Stops Scheduler if Off]
    E -->|Adjust Celebration| I[Duration Slider 3-10s<br/>Preview Button]
    E -->|Browser Notifications| J[Request Permission<br/>Toggle Enabled]
    F --> K[Click Save Button]
    G --> K
    H --> K
    I --> L[Click Preview Button]
    L --> M[Sample Celebration Shows]
    M --> I
    I --> K
    J --> N{Permission Granted?}
    N -->|Yes| O[Toggle Enabled<br/>Browser Notifs Active]
    N -->|No| P[Toggle Disabled<br/>Show Helper Text]
    O --> K
    P --> K
    K --> Q[Save Config to config.json<br/>PUT /api/config/*]
    Q --> R[Show Success Message<br/>'Settings saved!']
    R --> S[Changes Apply Immediately<br/>No Restart Required]
    E -->|Close/Cancel| T[Discard Unsaved Changes]
    T --> U[Modal Closes<br/>Return to Task List]
    S --> U
```

**Key Decision Points:**

- Settings open as modal, not navigation away
- Preview button lets users test celebration timing
- Browser notification permission handled gracefully
- Save applies changes immediately
- Cancel/close discards unsaved changes without prompt
