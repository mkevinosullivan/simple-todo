# Wireframes & Mockups

Since I can't create actual visual mockups within this text-based format, I'll
provide detailed wireframe descriptions and ASCII-style layout sketches for each
key screen. These descriptions are detailed enough for a designer to create
high-fidelity mockups or for use with AI UI generation tools like v0 or Lovable.

## Screen 1: First-Launch Configuration

**Purpose:** Guide new users through initial WIP limit setup **Layout Type:**
Centered card on neutral background

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│               ╔═══════════════════════════════╗             │
│               ║                               ║             │
│               ║   Welcome to Simple To-Do!    ║             │
│               ║                               ║             │
│               ║  🎯 Focus through limits      ║             │
│               ║  🎉 Celebrate progress        ║             │
│               ║  ⏰ Proactive prompts         ║             │
│               ║                               ║             │
│               ║  ─────────────────────────    ║             │
│               ║                               ║             │
│               ║  How many active tasks feel   ║             │
│               ║  manageable for you?          ║             │
│               ║                               ║             │
│               ║  WIP Limit: [5][6][7][8][9][10]            │
│               ║             (7 recommended)   ║             │
│               ║                               ║             │
│               ║  Most users find 7 tasks      ║             │
│               ║  works well. You can change   ║             │
│               ║  this later in Settings.      ║             │
│               ║                               ║             │
│               ║     [Get Started]             ║             │
│               ║                               ║             │
│               ║  or [Use Default Settings]    ║             │
│               ║                               ║             │
│               ╚═══════════════════════════════╝             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**

- **Card Container:** 480px max-width, centered vertically and horizontally,
  soft shadow
- **Header:** "Welcome to Simple To-Do!" - Large, friendly typography (32px)
- **Feature Icons:** Three core features with icons (emoji or simple SVG)
- **WIP Limit Selector:** 6 clickable number buttons (5-10), default 7
  highlighted with accent color
- **Explanation Text:** Small, calming gray text explaining the recommendation
- **Primary CTA:** "Get Started" button - large, prominent, accent color
- **Secondary CTA:** "Use Default Settings" - text link, smaller, less prominent
- **Background:** Very light gray (#F5F7FA) or subtle gradient

**Interactions:**

- Clicking a number highlights it with accent color border
- Hover states on all interactive elements
- "Get Started" saves config and transitions to Main Task List
- "Use Default Settings" bypasses selection, uses 7

## Screen 2: Main Task List View (With Active Tasks)

**Purpose:** Primary interface for viewing and managing tasks **Layout Type:**
Full viewport, single column, responsive

```
┌────────────────────────────────────────────────────────────────┐
│  Simple To-Do                          [5/7]  ⚙️  ❓          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [What needs to be done?                    ] [Add Task] │  │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Active Tasks                                                  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🟡 Buy groceries for the week           ✏️  ✓  🗑️   │    │
│  │    Created 5 days ago                                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🟢 Review project proposal              ✏️  ✓  🗑️   │    │
│  │    Created 2 hours ago                               │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🟢 Schedule dentist appointment         ✏️  ✓  🗑️   │    │
│  │    Created 1 day ago                                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🟠 Call mom about birthday plans        ✏️  ✓  🗑️   │    │
│  │    Created 3 days ago                                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🟢 Update resume with recent project    ✏️  ✓  🗑️   │    │
│  │    Created 8 hours ago                               │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

**Header Bar:**

- App title "Simple To-Do" (left-aligned, 20px font)
- WIP count indicator "[5/7]" with color coding (green <60%, yellow 60-90%,
  orange 100%)
- Settings gear icon (clickable)
- Help "?" icon (clickable)
- Subtle bottom border separating header from content

**Add Task Section:**

- Full-width input field with placeholder "What needs to be done?"
- "Add Task" button (right-aligned, accent color)
- Input and button on same row for desktop, stack for mobile

**Task List:**

- "Active Tasks" label (subtle, uppercase, small font)
- Each task card includes:
  - **Age indicator:** Colored circle (🟢 Fresh/Recent, 🟡 Aging, 🟠 Old, 🔴
    Stale)
  - **Task text:** Primary content, 16px readable font
  - **Action buttons:** Edit (✏️), Complete (✓ green), Delete (🗑️ red)
  - **Timestamp:** "Created X ago" in small gray text
  - Card has subtle border, slight shadow on hover
  - Generous padding (16px vertical, 20px horizontal)

**Spacing:**

- 24px between task cards
- 32px top margin for add task section
- 16px padding around viewport edges

**Colors:**

- Background: Very light gray (#F9FAFB)
- Task cards: White (#FFFFFF)
- Age indicators: Green (#10B981), Yellow (#F59E0B), Orange (#F97316), Red
  (#EF4444)
- Complete button: Green accent
- Delete button: Red/pink accent
- Edit button: Neutral gray

## Screen 3: Main Task List - Empty State (First-Time Users)

**Purpose:** Guide new users when they have no tasks yet **Layout Type:**
Centered empty state with quick start guide

```
┌────────────────────────────────────────────────────────────────┐
│  Simple To-Do                          [0/7]  ⚙️  ❓          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [What needs to be done?                    ] [Add Task] │  │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│               ╔═══════════════════════════════╗               │
│               ║                               ║               │
│               ║    Welcome! 👋               ║               │
│               ║                               ║               │
│               ║  This app helps you stay      ║               │
│               ║  focused with smart task      ║               │
│               ║  management.                  ║               │
│               ║                               ║               │
│               ║  Quick Start:                 ║               │
│               ║                               ║               │
│               ║  1️⃣ Add your first task above ║               │
│               ║                               ║               │
│               ║  2️⃣ Complete it to see a      ║               │
│               ║     celebration              ║               │
│               ║                               ║               │
│               ║  3️⃣ Your WIP limit is set to  ║               │
│               ║     7 tasks to help you      ║               │
│               ║     stay focused             ║               │
│               ║                               ║               │
│               ║       [Got it!]              ║               │
│               ║                               ║               │
│               ╚═══════════════════════════════╝               │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

- Same header and add task section as populated view
- **Centered card** instead of task list
- **Welcoming headline** with friendly emoji
- **3-step guide** clearly numbered and spaced
- **"Got it!" button** dismisses guide, marks user as onboarded
- **Light, encouraging tone** in all copy
- Card uses same styling as First-Launch config (centered, shadowed)

## Screen 4: Main Task List - Empty State (Inbox Zero Celebration)

**Purpose:** Celebrate when returning users complete all tasks **Layout Type:**
Prominent celebration with stats

```
┌────────────────────────────────────────────────────────────────┐
│  Simple To-Do                          [0/7]  ⚙️  ❓          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [What needs to be done?                    ] [Add Task] │  │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│             ╔═════════════════════════════════════╗           │
│             ║                                     ║           │
│             ║         🎉 🎊 ✨                   ║           │
│             ║                                     ║           │
│             ║   You completed everything!         ║           │
│             ║                                     ║           │
│             ║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ║           │
│             ║                                     ║           │
│             ║   📊 You completed 12 tasks         ║           │
│             ║      this week                      ║           │
│             ║                                     ║           │
│             ║   ⚡ Average completion time:       ║           │
│             ║      2.3 days per task              ║           │
│             ║                                     ║           │
│             ║   🔥 3-day inbox zero streak!       ║           │
│             ║                                     ║           │
│             ║                                     ║           │
│             ║       [Add New Tasks]               ║           │
│             ║                                     ║           │
│             ╚═════════════════════════════════════╝           │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

- Same header with WIP count showing 0/7
- **Larger, more vibrant card** than quick start guide
- **Celebration headline** with multiple emojis
- **Statistics section** with data-driven insights:
  - Tasks completed this week
  - Average completion time
  - Streak information (optional)
- **Vibrant accent colors** (oranges, yellows, greens) instead of calming base
- **"Add New Tasks" CTA** to encourage continued use
- Card persists until dismissed or new task added (no auto-dismiss)

## Screen 5: Settings Modal

**Purpose:** Configure WIP limit, prompting, and celebration preferences
**Layout Type:** Modal overlay with form sections

```
┌────────────────────────────────────────────────────────────────┐
│  Simple To-Do                          [5/7]  ⚙️  ❓          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░     ╔══════════════════════════════════════════╗     ░░░  │
│ ░░     ║  Settings                           ✕    ║     ░░░  │
│ ░░     ║  ────────────────────────────────────    ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  WIP Limit Configuration                ║     ░░░  │
│ ░░     ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║     ░░░  │
│ ░░     ║  Work In Progress Limit (5-10 tasks)    ║     ░░░  │
│ ░░     ║  [5]─────●─────[10]  Current: 7         ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  You currently have 5 active tasks      ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  Proactive Prompts                      ║     ░░░  │
│ ░░     ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║     ░░░  │
│ ░░     ║  [●] Enable proactive prompts           ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  Frequency (hours)                      ║     ░░░  │
│ ░░     ║  [1]───●───────[6]  Current: 2.5 hrs   ║     ░░░  │
│ ░░     ║  Next prompt in ~45 minutes             ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  [○] Enable browser notifications       ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  Celebration Preferences                ║     ░░░  │
│ ░░     ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║     ░░░  │
│ ░░     ║  [●] Enable celebrations                ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  Duration (seconds)                     ║     ░░░  │
│ ░░     ║  [3]─────●─────[10]  Current: 7s       ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║  [Preview Celebration]                  ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ║               [Cancel]  [Save Changes]  ║     ░░░  │
│ ░░     ║                                          ║     ░░░  │
│ ░░     ╚══════════════════════════════════════════╝     ░░░  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  (Task list visible but dimmed underneath backdrop)           │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

**Modal Container:**

- 600px max-width, centered vertically and horizontally
- White background, prominent shadow
- Close "✕" button in top-right corner

**Backdrop:**

- Semi-transparent dark overlay (rgba(0,0,0,0.5))
- Clicking backdrop closes modal (discards changes)
- Task list visible but dimmed underneath

**Settings Sections (3 groups):**

1. **WIP Limit Configuration**
   - Section header with bottom border
   - Slider control with min/max labels
   - Current value displayed
   - Shows current active task count for context

2. **Proactive Prompts**
   - Enable/disable toggle (styled checkbox or switch)
   - Frequency slider (1-6 hours)
   - Shows time until next prompt
   - Browser notifications toggle (disabled if no permission)

3. **Celebration Preferences**
   - Enable/disable toggle
   - Duration slider (3-10 seconds)
   - "Preview Celebration" button to test timing

**Footer Actions:**

- "Cancel" button (left, secondary styling)
- "Save Changes" button (right, primary accent color)

## Screen 6: Proactive Prompt Toast Notification

**Purpose:** Non-blocking notification suggesting a task **Layout Type:** Fixed
position toast in bottom-right corner

```
┌────────────────────────────────────────────────────────────────┐
│  Simple To-Do                          [5/7]  ⚙️  ❓          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [What needs to be done?                    ] [Add Task] │  │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Active Tasks                                                  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🟡 Buy groceries for the week           ✏️  ✓  🗑️   │    │
│  │    Created 5 days ago                                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  [... more tasks ...]                                          │
│                                                                │
│                                   ┌──────────────────────┐    │
│                                   │  ⏰                   │    │
│                                   │  Could you do this   │    │
│                                   │  task now?           │    │
│                                   │                      │    │
│                                   │  "Buy groceries for  │    │
│                                   │  the week"           │    │
│                                   │                      │    │
│                                   │  ───────────────     │    │
│                                   │                      │    │
│                                   │  [✓] [✕] [💤]       │    │
│                                   │                      │    │
│                                   │  Auto-dismiss: 30s   │    │
│                                   └──────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

**Toast Container:**

- Fixed position: bottom-right corner
- 320px width
- Slides in from right with smooth animation
- Neutral background color (light blue-gray, not vibrant)
- Subtle shadow for elevation

**Content:**

- **Clock icon** (⏰) indicating prompt
- **Prompt text:** "Could you do this task now?"
- **Task text:** Shows full task (truncated if >60 chars with "..." and
  expansion on click)
- **Divider line** separating text from actions

**Action Buttons (3 equal-width buttons):**

- **Complete (✓):** Green accent, completes task immediately
- **Dismiss (✕):** Neutral gray, removes toast
- **Snooze (💤):** Blue accent, reschedules for 1 hour

**Timer Indicator:**

- Small text "Auto-dismiss: 30s" with countdown
- Helps user understand toast will disappear

**Behavior:**

- Appears with slide-in animation (300ms)
- Clicking action triggers immediate response
- Ignoring causes auto-dismiss after 30 seconds
- Exits with slide-out animation (300ms)

## Screen 7: Celebration Overlay

**Purpose:** Reward task completion with positive reinforcement **Layout Type:**
Center-screen modal overlay

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│            ╔════════════════════════════════════╗             │
│            ║                                    ║             │
│            ║          ✨ 🎉 ⭐                  ║             │
│            ║                                    ║             │
│            ║      Amazing! You crushed it!      ║             │
│            ║                                    ║             │
│            ║   ──────────────────────────────   ║             │
│            ║                                    ║             │
│            ║  You completed:                    ║             │
│            ║  "Buy groceries for the week"      ║             │
│            ║                                    ║             │
│            ║  That's 3 tasks this week! 📊      ║             │
│            ║                                    ║             │
│            ║                                    ║             │
│            ║        [Click to continue]         ║             │
│            ║                                    ║             │
│            ║    (or press Escape to dismiss)    ║             │
│            ║                                    ║             │
│            ╚════════════════════════════════════╝             │
│                                                                │
│          (Confetti animation in background)                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

**Overlay Container:**

- Center of viewport
- 500px max-width
- **Vibrant background:** Warm orange/yellow gradient
- Large shadow for prominence
- Fade-in animation (200-300ms)

**Content:**

- **Large emojis** at top (✨🎉⭐ or similar celebratory)
- **Celebration message:** Varies (10+ options), large bold text (24-28px)
- **Divider line**
- **Completed task context:** "You completed: [task text]" (truncated if long)
- **Optional data insight:** "That's N tasks this week!" (using
  AnalyticsService)

**Dismissal Options:**

- **"Click to continue" button** (optional, makes dismissal explicit)
- **Click anywhere** on overlay dismisses
- **Press Escape** key dismisses
- **Auto-dismiss after 7 seconds** (configurable 3-10s)

**Visual Effects:**

- **Confetti animation** (optional, using library like canvas-confetti)
- **Particle effects** around edges
- **Fade-out animation** on dismiss (200-300ms)

**Color Palette:**

- Background: Warm gradient (orange #F97316 to yellow #FCD34D)
- Text: White or very dark for contrast
- Emojis: Full color for vibrancy

## Screen 8: WIP Limit Reached State

**Purpose:** Inform user they've hit limit with encouraging messaging **Layout
Type:** Inline message near add task input

```
┌────────────────────────────────────────────────────────────────┐
│  Simple To-Do                          [7/7]  ⚙️  ❓          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ [What needs to be done?               ] [Add Task 🔒] │   │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  💡 You have 7 active tasks                          │    │
│  │                                                       │    │
│  │  Complete or delete a task before adding more to     │    │
│  │  maintain focus!                                     │    │
│  │                                                       │    │
│  │  Research shows limiting WIP improves completion     │    │
│  │  rates.                                              │    │
│  │                                                       │    │
│  │  Adjust your limit in [Settings] →                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Active Tasks                                                  │
│                                                                │
│  [... 7 tasks displayed ...]                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**

**Modified Add Task Section:**

- Input field remains visible but disabled (grayed out)
- "Add Task" button shows lock icon (🔒) and is disabled
- Visual feedback: grayed-out, cursor: not-allowed

**WIP Limit Message Card:**

- Appears directly below add task input
- **Light bulb icon** (💡) indicating helpful tip
- **Headline:** "You have 7 active tasks" (shows current count)
- **Encouraging explanation:** Guides user to complete or delete
- **Psychological rationale:** "Research shows limiting WIP improves completion
  rates"
- **Link to Settings:** "[Settings] →" is clickable, opens settings modal
- **Calming color scheme:** Light blue background (#DBEAFE), blue border
  (#3B82F6)
- **Friendly tone:** Supportive, not restrictive

**Animation:**

- Message slides in with gentle animation (200ms)
- If user tries to add task via Enter key, message pulses briefly

**Removal:**

- Message disappears immediately when task count drops below limit
- Add Task button re-enables smoothly
