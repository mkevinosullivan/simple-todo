# Component Library

## Overview

The Simple To-Do App uses a focused set of reusable components to maintain consistency and simplify development. Each component is defined with its variants, states, and technical specifications.

## Core Components

### 1. Button Component

**Purpose:** Primary action triggers throughout the application

**Variants:**

- **Primary Button**
  - Background: Accent color (#3B82F6 blue or similar)
  - Text: White (#FFFFFF)
  - Padding: 12px 24px
  - Border-radius: 8px
  - Font-weight: 600
  - Hover: Darken background by 10%
  - Active: Darken background by 20%, slight scale (0.98)
  - Disabled: 50% opacity, cursor: not-allowed
  - Example: "Add Task", "Get Started", "Save Changes"

- **Secondary Button**
  - Background: Transparent
  - Text: Neutral gray (#6B7280)
  - Border: 1px solid #D1D5DB
  - Padding: 12px 24px
  - Border-radius: 8px
  - Hover: Background #F3F4F6
  - Example: "Cancel"

- **Icon Button**
  - Square: 44x44px (touch-target compliant)
  - Background: Transparent
  - Icon: 20x20px
  - Border-radius: 8px
  - Hover: Background #F3F4F6
  - Example: Settings gear, Help "?"

- **Action Button (Inline)**
  - Small: 32x32px
  - Icon-only or icon + label
  - Color-coded by action type:
    - Complete: Green (#10B981)
    - Delete: Red (#EF4444)
    - Edit: Gray (#6B7280)
  - Hover: Brighten color by 10%
  - Example: Task action buttons (✓, 🗑️, ✏️)

**States:**
- Default
- Hover (cursor: pointer, visual feedback)
- Active/Pressed (visual depression)
- Disabled (opacity: 0.5, cursor: not-allowed)
- Loading (spinner replaces text/icon)

**Accessibility:**
- All buttons have descriptive aria-labels
- Keyboard accessible (focusable, Enter/Space triggers)
- Focus indicator: 2px outline offset 2px in accent color

### 2. Input Field Component

**Purpose:** Text input for task entry and form fields

**Variants:**

- **Text Input (Default)**
  - Width: 100% (responsive)
  - Height: 44px
  - Padding: 12px 16px
  - Border: 1px solid #D1D5DB
  - Border-radius: 8px
  - Font-size: 16px
  - Placeholder color: #9CA3AF
  - Background: White (#FFFFFF)

- **Text Input (Disabled)**
  - Background: #F3F4F6
  - Border: 1px solid #E5E7EB
  - Text color: #9CA3AF
  - Cursor: not-allowed

**States:**
- Default
- Focus (border color: accent #3B82F6, 2px border, remove outline)
- Error (border color: red #EF4444, red text for error message below)
- Disabled (grayed out)

**Validation:**
- Error message appears below input in red (#EF4444)
- Font-size: 14px
- Example: "Task cannot be empty"

**Accessibility:**
- Label associated with input (explicit or aria-label)
- Error messages announced by screen readers (aria-describedby)
- Keyboard accessible

### 3. Task Card Component

**Purpose:** Display individual tasks with metadata and actions

**Structure:**
```
┌──────────────────────────────────────────────────┐
│ [●] Task text here                  [✏️] [✓] [🗑️] │
│     Created X ago                                │
└──────────────────────────────────────────────────┘
```

**Elements:**

- **Age Indicator (left):**
  - Colored circle: 12px diameter
  - Colors: Green (#10B981), Yellow (#F59E0B), Orange (#F97316), Red (#EF4444)
  - Tooltip on hover: "Created X days ago"

- **Task Text (center):**
  - Font-size: 16px
  - Font-weight: 400
  - Color: #111827
  - Line-height: 1.5
  - Word-wrap: break-word

- **Action Buttons (right):**
  - Edit, Complete, Delete icons
  - 32x32px each
  - Aligned horizontally with 8px gap

- **Timestamp (below):**
  - Font-size: 14px
  - Color: #6B7280
  - Format: "Created X ago" (human-readable relative time)

**Styling:**
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB
- Border-radius: 8px
- Padding: 16px 20px
- Shadow: 0 1px 2px rgba(0,0,0,0.05)
- Hover shadow: 0 4px 6px rgba(0,0,0,0.1) (elevate on hover)

**States:**
- Default
- Hover (elevated shadow, slightly lighter background)
- Edit mode (shows input field replacing text, Save/Cancel buttons)
- Completing (fade-out animation, 200ms)

### 4. Toast Notification Component

**Purpose:** Non-blocking notifications for prompts and messages

**Types:**

- **Proactive Prompt Toast**
  - Width: 320px
  - Position: Fixed bottom-right (16px from edges)
  - Background: Light blue-gray (#EFF6FF)
  - Border-left: 4px solid accent blue (#3B82F6)
  - Padding: 16px
  - Border-radius: 8px
  - Shadow: 0 4px 12px rgba(0,0,0,0.15)

- **Error/Success Toast**
  - Width: 320px
  - Position: Fixed top-right (16px from edges)
  - Background:
    - Error: Light red (#FEE2E2)
    - Success: Light green (#D1FAE5)
  - Border-left: 4px solid:
    - Error: Red (#EF4444)
    - Success: Green (#10B981)
  - Padding: 12px 16px
  - Auto-dismiss: 5 seconds

**Content Structure (Proactive Prompt):**
- Icon (⏰)
- Heading: "Could you do this task now?"
- Task text (truncated if long)
- Divider line
- 3 action buttons (Complete, Dismiss, Snooze)
- Timer: "Auto-dismiss: 30s"

**Animations:**
- Enter: Slide in from right (300ms ease-out)
- Exit: Slide out to right (300ms ease-in)

**Accessibility:**
- role="alert" for screen reader announcement
- Focusable action buttons
- Escape key dismisses

### 5. Modal/Overlay Component

**Purpose:** Settings screen, celebrations, and focused dialogs

**Variants:**

- **Settings Modal**
  - Width: 600px max
  - Height: Auto (scrollable if needed)
  - Position: Centered vertically and horizontally
  - Background: White (#FFFFFF)
  - Border-radius: 12px
  - Shadow: 0 20px 25px rgba(0,0,0,0.25)
  - Backdrop: rgba(0,0,0,0.5) semi-transparent

- **Celebration Overlay**
  - Width: 500px max
  - Height: Auto
  - Position: Centered
  - Background: Gradient (orange #F97316 to yellow #FCD34D)
  - Border-radius: 16px
  - Shadow: 0 25px 50px rgba(0,0,0,0.3)
  - No backdrop (celebrations don't dim background)

**Header:**
- Title text (20px, bold)
- Close button (X) in top-right corner

**Footer (Settings Modal):**
- Two-button layout
- Cancel (left, secondary)
- Save Changes (right, primary)

**Animations:**
- Enter: Fade in + scale from 0.95 to 1.0 (200-300ms)
- Exit: Fade out + scale to 0.95 (200ms)

**Accessibility:**
- role="dialog"
- aria-modal="true"
- Focus trap (Tab cycles within modal)
- Escape key closes modal
- Focus returns to trigger element on close

### 6. Slider (Range Input) Component

**Purpose:** Adjust numeric values (WIP limit, prompt frequency, celebration duration)

**Styling:**
- Width: 100%
- Height: 6px track
- Thumb: 20px circle
- Track color: Light gray (#E5E7EB)
- Fill color: Accent blue (#3B82F6)
- Thumb color: White with accent border
- Labels: Min/max values on ends
- Current value displayed above or to right

**States:**
- Default
- Hover (enlarge thumb slightly)
- Focus (outline on thumb)
- Active/Dragging (enlarge thumb, show current value)

**Behavior:**
- Click anywhere on track jumps to that value
- Drag thumb for fine control
- Keyboard accessible (arrow keys adjust value)

**Accessibility:**
- role="slider"
- aria-valuenow, aria-valuemin, aria-valuemax
- Keyboard: Left/Right arrows change value

### 7. Toggle/Switch Component

**Purpose:** Enable/disable binary settings

**Styling:**
- Width: 44px
- Height: 24px
- Border-radius: 12px (pill shape)
- Background (off): Gray (#D1D5DB)
- Background (on): Accent blue (#3B82F6)
- Thumb: 20px white circle
- Thumb position (off): Left
- Thumb position (on): Right
- Transition: 200ms ease

**States:**
- Off (default)
- On
- Disabled (opacity 0.5)

**Label:**
- Text label to right of switch
- Clicking label also toggles switch

**Accessibility:**
- role="switch"
- aria-checked="true/false"
- Keyboard: Space toggles

### 8. Card Container Component

**Purpose:** Grouping related content (empty states, celebrations, config)

**Variants:**

- **Info Card (Empty States, Quick Start)**
  - Width: 480px max
  - Padding: 32px
  - Background: White (#FFFFFF)
  - Border: 1px solid #E5E7EB
  - Border-radius: 12px
  - Shadow: 0 4px 6px rgba(0,0,0,0.1)
  - Centered horizontally

- **Celebration Card (Inbox Zero)**
  - Width: 520px max
  - Padding: 40px
  - Background: Gradient or solid vibrant color
  - Border-radius: 16px
  - Shadow: 0 10px 15px rgba(0,0,0,0.2)
  - Larger, more prominent than info cards

**Content:**
- Headline (24-32px, bold)
- Body text (16px, regular)
- Optional list or stats
- CTA button at bottom

### 9. WIP Count Indicator Component

**Purpose:** Display current active task count vs limit

**Styling:**
- Format: "[N/limit]" e.g., "[5/7]"
- Font-size: 16px
- Font-weight: 600
- Padding: 6px 12px
- Border-radius: 8px
- Background color varies by status:
  - Green (#D1FAE5): 0-60% of limit
  - Yellow (#FEF3C7): 60-90% of limit
  - Orange (#FED7AA): 90-100% of limit
- Text color: Darker shade of background for contrast
- Optional: Progress bar visual

**Behavior:**
- Clickable to open settings
- Tooltip: "Work In Progress limit helps you stay focused"
- Updates in real-time as tasks added/completed

### 10. Age Indicator Badge Component

**Purpose:** Visual indicator of task age

**Styling:**
- Size: 12px diameter circle
- Colors based on age:
  - Fresh (<24h): Green (#10B981) or no indicator
  - Recent (1-3 days): Light blue (#3B82F6)
  - Aging (3-7 days): Yellow (#F59E0B)
  - Old (7-14 days): Orange (#F97316)
  - Stale (14+ days): Red (#EF4444)
- Position: Left side of task card
- Tooltip: "Created X days ago"

**Accessibility:**
- Not relied upon solely (timestamp text also present)
- Tooltip provides text alternative
- Screen readers announce age via timestamp

## Component Specifications Summary Table

| Component | Primary Use | Key Variants | Accessibility Features |
|-----------|-------------|--------------|------------------------|
| Button | Actions, CTAs | Primary, Secondary, Icon, Action | aria-label, keyboard, focus indicator |
| Input Field | Text entry | Default, Disabled, Error | Labels, error messages, validation |
| Task Card | Display tasks | Default, Edit mode, Hover | Semantic HTML, action labels, timestamps |
| Toast | Notifications | Prompt, Error, Success | role="alert", dismissible, timers |
| Modal | Settings, dialogs | Settings, Celebration | Focus trap, Escape closes, aria-modal |
| Slider | Numeric input | WIP, Frequency, Duration | role="slider", keyboard navigation |
| Toggle | Binary settings | On/Off | role="switch", keyboard toggle |
| Card | Content groups | Info, Celebration | Semantic headings, readable text |
| WIP Indicator | Status display | Color-coded by percentage | Tooltip, real-time updates |
| Age Badge | Task age visual | Color by age category | Tooltip, not sole indicator |
