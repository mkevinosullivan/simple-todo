# Branding & Style Guide

## Brand Identity

**Brand Personality:**
The Simple To-Do App is your supportive productivity partner—calm, encouraging, intelligent, and approachable. We celebrate progress without being patronizing, provide structure without being rigid, and maintain professionalism while still being warm and human.

**Emotional Tone:**
- **Calm** - Never frantic, urgent, or guilt-inducing
- **Encouraging** - Positive reinforcement, celebrating small wins
- **Supportive** - A partner, not a taskmaster
- **Intelligent** - Thoughtful design based on behavioral science
- **Approachable** - Professional but friendly, never cold or corporate

## Color Palette

### Base/Neutral Colors (Calming Foundation)

These colors form the primary interface, creating a calm environment that reduces cognitive load.

**Background Colors:**
- **Primary Background:** `#F9FAFB` - Very light gray, main app background
- **Card Background:** `#FFFFFF` - Pure white for task cards and modals
- **Secondary Background:** `#F3F4F6` - Slightly darker gray for disabled states

**Border Colors:**
- **Primary Border:** `#E5E7EB` - Subtle borders on cards and inputs
- **Secondary Border:** `#D1D5DB` - Stronger borders for dividers

**Text Colors:**
- **Primary Text:** `#111827` - Near-black for main content
- **Secondary Text:** `#6B7280` - Medium gray for timestamps, labels
- **Tertiary Text:** `#9CA3AF` - Light gray for placeholders

### Accent Colors (Vibrant Highlights)

Used for celebrations, positive interactions, and emotional range.

**Primary Accent (Blue):**
- **Main:** `#3B82F6` - Primary actions, links, focus states
- **Light:** `#DBEAFE` - Backgrounds for info messages
- **Dark:** `#1E40AF` - Hover states on primary buttons

**Success/Complete (Green):**
- **Main:** `#10B981` - Complete buttons, success states, fresh tasks
- **Light:** `#D1FAE5` - Success toast backgrounds
- **Dark:** `#059669` - Hover on complete buttons

**Warning/Aging (Yellow-Orange):**
- **Yellow:** `#F59E0B` - Aging tasks (3-7 days)
- **Orange:** `#F97316` - Old tasks (7-14 days), WIP limit warning
- **Light Yellow:** `#FEF3C7` - WIP count indicator approaching limit
- **Light Orange:** `#FED7AA` - WIP count indicator at limit

**Error/Delete (Red):**
- **Main:** `#EF4444` - Delete buttons, error states, stale tasks (14+ days)
- **Light:** `#FEE2E2` - Error toast backgrounds
- **Dark:** `#DC2626` - Hover on delete buttons

**Celebration (Warm Gradient):**
- **Orange:** `#F97316` - Gradient start
- **Yellow:** `#FCD34D` - Gradient end
- Used for celebration overlays and Inbox Zero states

### Task Age Color Coding

Visual progression showing urgency without anxiety:

| Age Range | Color | Hex | Usage |
|-----------|-------|-----|-------|
| Fresh (<24h) | Green | `#10B981` | Optional indicator or none |
| Recent (1-3 days) | Light Blue | `#3B82F6` | Subtle indicator |
| Aging (3-7 days) | Yellow | `#F59E0B` | Noticeable indicator |
| Old (7-14 days) | Orange | `#F97316` | Prominent indicator |
| Stale (14+ days) | Red | `#EF4444` | Urgent indicator |

## Typography

### Font Families

**Primary Font:** **Inter** or **-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto** (system font stack)
- Highly readable sans-serif
- Available in multiple weights
- Optimized for screen display
- Fallback to system fonts ensures performance

**Monospace Font (optional):** **"SF Mono", Monaco, Consolas, monospace**
- For technical displays like timestamps or data (if needed)

### Type Scale

**Headings:**
- **H1 (Page Title):** 32px / 2rem, Font-weight: 700, Line-height: 1.2
  - Example: "Welcome to Simple To-Do!"
- **H2 (Section Header):** 24px / 1.5rem, Font-weight: 600, Line-height: 1.3
  - Example: "Active Tasks"
- **H3 (Subsection):** 20px / 1.25rem, Font-weight: 600, Line-height: 1.4
  - Example: "WIP Limit Configuration"

**Body Text:**
- **Large Body:** 18px / 1.125rem, Font-weight: 400, Line-height: 1.6
  - Example: Empty state descriptions
- **Default Body:** 16px / 1rem, Font-weight: 400, Line-height: 1.5
  - Example: Task text, button labels
- **Small Body:** 14px / 0.875rem, Font-weight: 400, Line-height: 1.5
  - Example: Timestamps, helper text, captions

**Labels & UI:**
- **Label (Emphasized):** 14px / 0.875rem, Font-weight: 600, Line-height: 1.4
  - Example: Form labels, section labels ("Active Tasks")
- **Button Text:** 16px / 1rem, Font-weight: 600, Line-height: 1
  - Example: "Add Task", "Get Started"
- **Caption:** 12px / 0.75rem, Font-weight: 400, Line-height: 1.4
  - Example: "Auto-dismiss: 30s"

### Font Weight Guidelines

- **Regular (400):** Default body text, descriptions
- **Medium (500):** Subtle emphasis (optional, not required)
- **Semi-Bold (600):** Headings, labels, button text, emphasized content
- **Bold (700):** Large headings, high-impact messages

## Spacing System

Consistent spacing creates visual rhythm and hierarchy.

**Base Unit:** 4px

**Spacing Scale:**
- **4px (0.25rem):** Tiny gaps (between icons in a row)
- **8px (0.5rem):** Small gaps (between action buttons)
- **12px (0.75rem):** Default gap (button padding vertical)
- **16px (1rem):** Medium spacing (card padding, toast spacing)
- **20px (1.25rem):** Comfortable spacing (task card padding horizontal)
- **24px (1.5rem):** Large spacing (between task cards)
- **32px (2rem):** Section spacing (between major sections)
- **40px (2.5rem):** Extra large spacing (celebration card padding)
- **48px (3rem):** Maximum spacing (between page sections)

**Application:**
- **Component Padding:** Use 12-20px for internal padding
- **Component Margins:** Use 16-32px for spacing between components
- **Section Gaps:** Use 32-48px for major sections

## Border Radius

Creates friendly, approachable feel while maintaining professionalism.

- **Small (4px):** Subtle rounding (rarely used)
- **Medium (8px):** Standard for buttons, inputs, task cards
- **Large (12px):** Modal containers, settings panels
- **Extra Large (16px):** Celebration overlays, large cards
- **Pill (9999px or 50%):** Toggle switches, badges

## Shadows & Elevation

Shadows create depth and hierarchy without heavy visual weight.

**Elevation Levels:**

- **Level 0 (Flat):** No shadow
  - Usage: Background elements, some text

- **Level 1 (Subtle):**
  - Shadow: `0 1px 2px rgba(0, 0, 0, 0.05)`
  - Usage: Task cards (default state), input fields

- **Level 2 (Raised):**
  - Shadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
  - Usage: Task cards (hover), dropdowns, toasts

- **Level 3 (Floating):**
  - Shadow: `0 10px 15px rgba(0, 0, 0, 0.15)`
  - Usage: Modals, prominent elements

- **Level 4 (Prominent):**
  - Shadow: `0 20px 25px rgba(0, 0, 0, 0.25)`
  - Usage: Settings modal, major overlays

- **Level 5 (Dramatic):**
  - Shadow: `0 25px 50px rgba(0, 0, 0, 0.3)`
  - Usage: Celebration overlays (maximum impact)

## Iconography

**Icon Style:**
- **Type:** Line icons (outlined, not filled) for consistency
- **Weight:** 2px stroke weight for clarity
- **Size:** 20x20px default, 16x16px small, 24x24px large
- **Library Recommendation:** Heroicons (free, consistent, matches design language)

**Common Icons:**
- **Settings:** Gear/cog icon (⚙️)
- **Help:** Question mark in circle (❓)
- **Complete:** Checkmark (✓)
- **Delete:** Trash bin (🗑️)
- **Edit:** Pencil (✏️)
- **Clock/Time:** Clock icon (⏰)
- **Snooze:** Sleep/zzz icon (💤)
- **Close:** X icon (✕)
- **Success:** Checkmark circle
- **Error:** Exclamation triangle
- **Info:** Info circle (ℹ️ or 💡)

**Emoji Usage:**
- Sparingly and purposefully
- Used in celebrations for emotional impact (🎉✨⭐)
- Used in empty states for friendliness (👋)
- Used in WIP limit message for approachability (💡)
- Never in critical UI elements (buttons, labels)

## Animation Principles

Animations should feel smooth, purposeful, and respectful of user attention.

**Timing:**
- **Fast (100-200ms):** Micro-interactions (button hover, focus states)
- **Standard (200-300ms):** Most transitions (modals opening, toasts sliding)
- **Slow (300-500ms):** Significant state changes (page transitions - rare)
- **Very Slow (500-1000ms):** Celebrations, special moments only

**Easing Functions:**
- **Ease-out:** Most entrances (starts fast, ends slow) - `cubic-bezier(0, 0, 0.2, 1)`
- **Ease-in:** Most exits (starts slow, ends fast) - `cubic-bezier(0.4, 0, 1, 1)`
- **Ease-in-out:** Smooth both ways - `cubic-bezier(0.4, 0, 0.2, 1)`
- **Linear:** Rare, only for continuous loops

**Animation Types:**
- **Fade:** Opacity changes for subtle appearance/disappearance
- **Slide:** Toasts slide in from edges
- **Scale:** Modals scale from 0.95 to 1.0 on open
- **Transform:** Task cards fade + slide out on completion

**Performance:**
- Only animate transform and opacity (GPU-accelerated)
- Avoid animating width, height, top, left (causes layout reflow)
- Use `will-change` sparingly for expensive animations

## Voice & Tone

**Copy Guidelines:**

**DO:**
- Use encouraging language: "Great job!", "You're making progress"
- Explain the "why": "This helps you stay focused"
- Be concise and clear: "Task cannot be empty"
- Celebrate small wins: "That's 3 tasks this week!"
- Use active voice: "Add your first task" (not "Your first task should be added")

**DON'T:**
- Use guilt-inducing language: "You still haven't done this"
- Be vague: "Something went wrong"
- Over-explain: Long paragraphs in UI
- Be patronizing: "Good job, little buddy!"
- Use jargon: Avoid technical terms in user-facing copy

**Example Copy:**

- **Empty state:** "No tasks yet. Add your first task to get started!" (Clear, inviting)
- **WIP limit:** "You have 7 active tasks - complete one before adding more to maintain focus!" (Encouraging, explanatory)
- **Celebration:** "Amazing! You crushed it!" (Enthusiastic, personal)
- **Error:** "Task cannot be empty" (Clear, not blaming)

## Accessibility Standards

**Minimum Requirements:**

- **Color Contrast:** WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
- **Focus Indicators:** 2px outline, offset 2px, using accent color
- **Touch Targets:** Minimum 44x44px for all interactive elements
- **Keyboard Navigation:** All actions accessible via keyboard
- **Screen Reader Support:** Semantic HTML, ARIA labels where needed
- **Motion:** Respect `prefers-reduced-motion` for users sensitive to animation
