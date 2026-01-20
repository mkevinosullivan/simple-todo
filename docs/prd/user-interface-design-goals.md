# User Interface Design Goals

## Overall UX Vision

The interface should feel like a supportive productivity partner rather than a demanding task manager. The emotional tone is encouraging and calm, never guilt-inducing or overwhelming. The design prioritizes simplicity and immediate comprehension - users should understand core functionality within 30 seconds of first use. Visual hierarchy emphasizes what to do now rather than everything that needs doing. The interface celebrates small wins meaningfully without feeling patronizing.

## Key Interaction Paradigms

- **Proactive notifications:** The app initiates interaction through non-blocking toast notifications (in-app corner notifications that persist for 30 seconds). Browser notifications are available as an opt-in feature after users have experienced in-app prompts and trust the app's value.
- **Progressive disclosure:** Hide complexity by default - show active tasks prominently, keep settings/configuration accessible but not front-and-center
- **Immediate feedback:** Every action (add task, complete task, hit WIP limit) provides instant visual and textual response
- **Gentle constraints:** WIP limits presented as helpful boundaries with encouraging messaging, not harsh restrictions
- **One-click primary actions:** Completing a task should be a single click/tap, minimizing friction for the core user action
- **Non-interruptive prompting:** Proactive prompts use toast-style notifications that appear in a corner, can be clicked to engage (showing complete/dismiss/snooze options), or ignored to auto-dismiss after 30 seconds
- **Meaningful celebrations:** Task completion celebrations display as prominent but non-blocking elements for 5-10 seconds with user-dismissible option (click anywhere or "Continue" button), maintaining emotional impact while allowing users to control timing

## Core Screens and Views

From a product perspective, the critical screens necessary to deliver the PRD values and goals:

1. **Main Task List View:** Primary interface showing all active tasks in chronological order with visual indicators for task age (color coding or badges to highlight older tasks needing attention), add task input, task completion controls, current WIP count indicator
2. **Proactive Prompt Notification:** Non-blocking toast notification presenting the "Could you do [task] now?" prompt. When clicked, expands to show complete/dismiss/snooze options. Auto-dismisses after 30 seconds if ignored.
3. **Celebration Display:** Prominent overlay celebrating task completion with encouraging message and vibrant visual effects, user-dismissible via click or auto-dismissing after 5-10 seconds
4. **First-Launch Configuration:** Initial setup screen for configuring WIP limit (5-10) and prompting frequency preferences. Does NOT request browser notification permission at this stage.
5. **Settings/Preferences Screen:** Adjust WIP limit, prompting frequency, opt-in to browser notifications, opt-out of prompting entirely, view/change configuration
6. **Empty State - First Time Users:** Quick start guide displayed when new users have no active tasks, explaining core features and how to get started
7. **Empty State - Returning Users (Inbox Zero):** Epic celebration screen when returning users complete all tasks ("You completed everything! 🎉"), displaying completion stats with option to add new tasks

## Accessibility

The application should use semantic HTML and reasonable accessibility practices (keyboard navigation for primary actions, readable fonts, logical tab order). Formal WCAG AA compliance is deferred to Phase 2 to maintain MVP timeline focus on validating core hypotheses.

## Branding

Minimal, clean, modern aesthetic emphasizing calm and focus. The base interface uses a calming, neutral color palette (soft blues, greens, grays) to reduce overwhelm. Celebrations and positive interactions use vibrant accent colors (warm oranges, yellows, or energetic greens) to create emotional range and excitement. Avoid gamification visuals (no RPG elements like Habitica) - maintain professional tone suitable for both personal and work contexts. Typography should be highly readable with generous spacing.

## Target Device and Platforms

**Web Responsive** - Primary target is desktop/laptop web browsers (Chrome, Firefox, Safari, Edge) with responsive design that adapts gracefully to various window sizes (supporting side-by-side layouts, tiled windows, and smaller viewports). The localhost web interface should be usable across desktop screen sizes from narrow sidebars to full-screen displays, and adapt gracefully to tablet and mobile screen sizes for flexibility.
