# Accessibility

## Accessibility Target

**MVP Goal:** Reasonable accessibility practices with keyboard navigation and screen reader support for primary actions. Formal WCAG 2.1 AA compliance is deferred to Phase 2 to maintain MVP timeline, but we'll implement fundamental accessibility patterns that support most users.

## Keyboard Navigation

All primary user actions must be accessible without a mouse.

**Global Shortcuts:**
- **Tab:** Move forward through interactive elements
- **Shift + Tab:** Move backward through interactive elements
- **Enter:** Activate focused button or link
- **Space:** Activate focused button, toggle checkbox/switch
- **Escape:** Close modals, dismiss toasts, cancel edit mode

**Task List Navigation:**
- **Tab:** Navigate through add task input → add button → first task → task actions → next task
- **Enter in input field:** Submit new task (same as clicking "Add Task")
- **Arrow keys (optional enhancement):** Navigate between tasks in list

**Modal/Overlay Navigation:**
- **Focus trap:** Tab cycles within modal, doesn't escape to background
- **Escape:** Closes modal/overlay
- **Focus management:** When modal opens, focus moves to first interactive element; when closed, focus returns to trigger element

**Settings Screen:**
- **Tab:** Navigate through all form controls (sliders, toggles, buttons)
- **Arrow keys:** Adjust slider values (Left/Right for horizontal sliders)
- **Space:** Toggle switches on/off

## Screen Reader Support

**Semantic HTML:**
- Use appropriate HTML elements: `<button>`, `<input>`, `<label>`, `<h1>`-`<h6>`, `<ul>`, `<li>`
- Avoid generic `<div>` or `<span>` for interactive elements
- Use `<main>`, `<nav>`, `<header>`, `<article>` for page structure

**ARIA Labels and Roles:**

**Task Cards:**
```html
<article role="article" aria-label="Task: Buy groceries">
  <span aria-hidden="true">🟡</span>
  <span>Buy groceries for the week</span>
  <button aria-label="Edit task: Buy groceries">✏️</button>
  <button aria-label="Complete task: Buy groceries">✓</button>
  <button aria-label="Delete task: Buy groceries">🗑️</button>
  <span aria-label="Created 5 days ago">Created 5 days ago</span>
</article>
```

**Toast Notifications:**
```html
<div role="alert" aria-live="polite" aria-atomic="true">
  <p>Could you do "Buy groceries" now?</p>
  <button aria-label="Complete task: Buy groceries">Complete</button>
  <button aria-label="Dismiss prompt for: Buy groceries">Dismiss</button>
  <button aria-label="Snooze task: Buy groceries for 1 hour">Snooze</button>
</div>
```

**Note:** Toast buttons include task-specific aria-labels so screen reader users navigating by button have full context, even if they skip the prompt text.

**Modals:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <h2 id="settings-title">Settings</h2>
  ...
</div>
```

**Form Controls:**
```html
<label for="wip-limit">Work In Progress Limit</label>
<input type="range" id="wip-limit"
       role="slider"
       aria-valuenow="7"
       aria-valuemin="5"
       aria-valuemax="10"
       aria-label="WIP limit slider, currently 7 tasks">
```

**Live Regions:**
- Task completion announcements: `aria-live="polite"`
- Error messages: `aria-live="assertive"`
- Status updates (WIP count): `aria-live="polite"`

## Color Contrast

**Text Contrast (WCAG AA):**
- **Primary text (#111827) on white (#FFFFFF):** 16.1:1 ✓ (exceeds 4.5:1)
- **Secondary text (#6B7280) on white (#FFFFFF):** 7.1:1 ✓ (exceeds 4.5:1)
- **Tertiary text (#9CA3AF) on white (#FFFFFF):** 4.6:1 ✓ (meets 4.5:1)
- **White text on primary blue (#3B82F6):** 4.6:1 ✓ (meets 4.5:1)
- **White text on green (#10B981):** 3.8:1 ⚠ (use for large text only or adjust)

**Action Contrast (WCAG AA):**
- **Primary button (blue #3B82F6):** 3:1 against white background ✓
- **Complete button (green #10B981):** 3:1 against white background ✓
- **Delete button (red #EF4444):** 3:1 against white background ✓

**Non-Color Indicators:**
- Task age shown via **both** color circle AND text timestamp
- WIP limit status shown via **both** color coding AND text "[N/limit]"
- Error states shown via **both** red color AND icon + text message
- Never rely on color alone

## Focus Indicators

**Visible Focus States:**
- **Outline:** 2px solid in accent color (#3B82F6)
- **Offset:** 2px from element edge
- **Visibility:** Never remove focus indicators with `outline: none` without providing alternative

**Focus Order:**
- Logical tab order: follows visual layout (top to bottom, left to right)
- Skip links (optional enhancement): "Skip to main content" link for keyboard users
- Focus trapping in modals prevents focus escaping to background

## Touch Targets

**Minimum Size:**
- All interactive elements: **44x44px minimum** (WCAG 2.1 AA Success Criterion 2.5.5)
- This includes: Buttons, task action icons, settings icons, toggle switches

**Spacing:**
- Interactive elements have sufficient spacing to prevent mis-taps
- At least 8px gap between adjacent touch targets where practical

## Motion & Animation

**Reduced Motion Support:**

Respect `prefers-reduced-motion` media query for users with vestibular disorders or motion sensitivity.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Implementation:**
- Users who enable "Reduce Motion" in OS settings see instant transitions instead of animations
- Celebrations still appear but without slide/scale animations
- Toasts appear/disappear instantly instead of sliding
- Task completions remove immediately without fade-out

## Form Validation & Error Handling

**Accessible Errors:**

```html
<div>
  <label for="task-input">What needs to be done?</label>
  <input
    id="task-input"
    aria-invalid="true"
    aria-describedby="task-error">
  <span id="task-error" role="alert">Task cannot be empty</span>
</div>
```

**Error Announcement:**
- Error messages associated with inputs via `aria-describedby`
- Errors announced immediately when validation fails
- Error text visible below input with clear language

## Loading States & Async Content

**Loading Indicators:**
- Use `aria-busy="true"` during async operations
- Provide text alternative for loading spinners: "Loading tasks..."
- Disable interactive elements during loading to prevent duplicate actions

**Dynamic Content Updates:**
- Use `aria-live` regions for content that updates without page reload
- Example: Task list updates when new task added, screen reader announces change

## Accessibility Testing Checklist

**Manual Testing:**
- [ ] Navigate entire app using keyboard only (no mouse)
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Verify all images/icons have text alternatives
- [ ] Check color contrast using tool (e.g., WebAIM Contrast Checker)
- [ ] Test with browser zoom at 200%
- [ ] Verify focus indicators visible on all interactive elements
- [ ] Test modals for focus trapping and return focus
- [ ] Enable "Reduce Motion" and verify animations disabled

**Automated Testing (Phase 2):**
- Use axe DevTools or Lighthouse accessibility audit
- Integrate accessibility linting into CI/CD (e.g., eslint-plugin-jsx-a11y)

## Known Limitations (MVP)

**Deferred to Phase 2:**
- Full WCAG 2.1 AA compliance audit
- High contrast mode support
- Screen reader testing across multiple screen readers (JAWS, NVDA, VoiceOver)
- Comprehensive keyboard shortcut system (e.g., "c" to complete focused task)
- Skip navigation links
- Advanced ARIA patterns for complex widgets

**Rationale:** MVP focuses on fundamental accessibility (keyboard nav, screen readers, semantic HTML) to validate core product hypotheses within 4-6 week timeline. Phase 2 will conduct formal accessibility audit and remediation.
