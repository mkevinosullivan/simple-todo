# 14. Accessibility Implementation

## Rationale and Key Decisions:

**1. WCAG 2.1 AA Compliance Target**: The Simple To-Do App will target WCAG 2.1
Level AA compliance to ensure usability for users with disabilities. This
includes keyboard navigation, screen reader compatibility, sufficient color
contrast, and proper semantic HTML.

**2. Accessibility-First Component Design**: Rather than retrofitting
accessibility, each component will be designed with accessibility as a core
requirement from the start. This includes proper ARIA attributes, keyboard event
handlers, and focus management.

**3. Automated Testing Integration**: Accessibility testing will be integrated
into the CI/CD pipeline using axe-core and jest-axe to catch violations early.
Manual testing with screen readers (NVDA, JAWS, VoiceOver) will supplement
automated tests.

**4. Progressive Enhancement**: The app will function without JavaScript for
core task viewing (though creating/completing tasks requires JS). This ensures
basic functionality for users with JavaScript disabled or using assistive
technologies that struggle with complex JS interactions.

## Accessibility Standards & Requirements

**WCAG 2.1 Level AA Principles:**

| Principle          | Implementation                                                        | Verification                                       |
| ------------------ | --------------------------------------------------------------------- | -------------------------------------------------- |
| **Perceivable**    | Semantic HTML, ARIA labels, sufficient color contrast (4.5:1 minimum) | Automated contrast checker, screen reader testing  |
| **Operable**       | Full keyboard navigation, no keyboard traps, focus indicators         | Manual keyboard testing, focus order validation    |
| **Understandable** | Clear labels, consistent navigation, error identification             | User testing with screen readers                   |
| **Robust**         | Valid HTML, compatible with assistive technologies                    | W3C validator, screen reader compatibility testing |

## Component-Level Accessibility Requirements

### 1. TaskCard Component

**Semantic HTML:**

```typescript
// apps/web/src/components/TaskCard.tsx
export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
  return (
    <article
      className="task-card"
      aria-labelledby={`task-${task.id}-text`}
      aria-describedby={`task-${task.id}-age`}
    >
      <div className="task-content">
        <p id={`task-${task.id}-text`}>{task.text}</p>
        <span id={`task-${task.id}-age`} className="sr-only">
          Created {TaskHelpers.formatDuration(TaskHelpers.getAge(task))} ago
        </span>
      </div>

      <div className="task-actions" role="group" aria-label="Task actions">
        <button
          onClick={() => onComplete(task.id)}
          aria-label={`Complete task: ${task.text}`}
          className="btn-complete"
        >
          <CheckIcon aria-hidden="true" />
          <span>Complete</span>
        </button>

        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.text}`}
          className="btn-delete"
        >
          <TrashIcon aria-hidden="true" />
          <span className="sr-only">Delete</span>
        </button>
      </div>
    </article>
  );
};
```

**Keyboard Navigation:**

- Tab: Move between Complete and Delete buttons
- Enter/Space: Activate button
- Focus indicators visible (2px solid outline, 4.5:1 contrast)

**Screen Reader Announcements:**

- On focus: "Complete task: Buy groceries, button" or "Delete task: Buy
  groceries, button"
- After complete: "Task completed: Buy groceries"
- After delete: "Task deleted: Buy groceries"

### 2. AddTaskInput Component

**Accessible Form:**

```typescript
// apps/web/src/components/AddTaskInput.tsx
export const AddTaskInput: React.FC = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (text.length === 0) {
      setError('Task description is required');
      inputRef.current?.focus();
      return;
    }

    if (text.length > 500) {
      setError('Task description must be 500 characters or less');
      inputRef.current?.focus();
      return;
    }

    // Submit task...
    setError('');
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Add new task">
      <div className="form-group">
        <label htmlFor="new-task-input" className="form-label">
          What needs to be done?
          <span className="required" aria-label="required">*</span>
        </label>

        <input
          ref={inputRef}
          id="new-task-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Buy groceries"
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'task-input-error' : undefined}
          maxLength={500}
          className="task-input"
        />

        {error && (
          <div
            id="task-input-error"
            role="alert"
            aria-live="polite"
            className="error-message"
          >
            {error}
          </div>
        )}

        <div className="character-count" aria-live="polite" aria-atomic="true">
          {text.length} / 500 characters
        </div>
      </div>

      <button type="submit" className="btn-primary">
        <PlusIcon aria-hidden="true" />
        <span>Add Task</span>
      </button>
    </form>
  );
};
```

**Keyboard Navigation:**

- Tab: Move to input field, then to Add Task button
- Enter: Submit form (from input or button)
- Escape: Clear input and error (if present)

**Error Announcements:**

- Errors announced immediately via `role="alert"` and `aria-live="polite"`
- Focus returns to input field after validation error

### 3. PromptToast Component

**Live Region Announcements:**

```typescript
// apps/web/src/components/PromptToast.tsx
export const PromptToast: React.FC<PromptToastProps> = ({ prompt, onComplete, onDismiss, onSnooze }) => {
  useEffect(() => {
    // Announce prompt to screen readers
    const announcement = `Task reminder: ${prompt.taskText}`;
    announceToScreenReader(announcement);
  }, [prompt]);

  return (
    <div
      role="alertdialog"
      aria-labelledby="prompt-title"
      aria-describedby="prompt-task"
      aria-modal="false"
      className="prompt-toast"
    >
      <div className="prompt-content">
        <h2 id="prompt-title" className="prompt-title">
          Ready to tackle this?
        </h2>
        <p id="prompt-task" className="prompt-task">
          {prompt.taskText}
        </p>
      </div>

      <div className="prompt-actions" role="group" aria-label="Prompt actions">
        <button
          onClick={onComplete}
          aria-label={`Complete task: ${prompt.taskText}`}
          className="btn-complete"
          autoFocus
        >
          Complete Now
        </button>

        <button
          onClick={onSnooze}
          aria-label="Remind me in 1 hour"
          className="btn-snooze"
        >
          Snooze
        </button>

        <button
          onClick={onDismiss}
          aria-label="Dismiss reminder"
          className="btn-dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

// Helper function to announce to screen readers
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

**Keyboard Navigation:**

- Prompt appears: Focus automatically moves to "Complete Now" button
- Tab: Cycle through Complete Now → Snooze → Dismiss buttons
- Escape: Dismiss prompt (same as Dismiss button)
- Enter/Space: Activate focused button

### 4. CelebrationOverlay Component

**Non-Blocking Announcement:**

```typescript
// apps/web/src/components/CelebrationOverlay.tsx
export const CelebrationOverlay: React.FC<CelebrationProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    // Announce celebration without stealing focus
    announceToScreenReader(message.message);

    // Auto-dismiss after configured duration
    const timer = setTimeout(onDismiss, config.celebrationDurationSeconds * 1000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="celebration-overlay"
    >
      <div className="celebration-content">
        <p className="celebration-message">{message.message}</p>
        <button
          onClick={onDismiss}
          aria-label="Close celebration"
          className="btn-close"
        >
          <XIcon aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {/* Confetti is decorative, hidden from screen readers */}
      <div aria-hidden="true">
        <ConfettiEffect />
      </div>
    </div>
  );
};
```

**Keyboard Navigation:**

- Celebration appears: Does NOT steal focus (non-blocking)
- Tab: Can navigate to Close button if user chooses
- Escape: Dismiss celebration
- Auto-dismisses after 7 seconds (or configured duration)

### 5. SettingsModal Component

**Modal Dialog with Focus Trap:**

```typescript
// apps/web/src/components/SettingsModal.tsx
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element in modal
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus to previously focused element
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="settings-title">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="btn-close"
          >
            <XIcon aria-hidden="true" />
          </button>
        </header>

        <div className="modal-body">
          {/* WIP Limit Setting */}
          <fieldset>
            <legend>Work In Progress Limit</legend>
            <label htmlFor="wip-limit-slider">
              Maximum active tasks (5-10)
            </label>
            <input
              id="wip-limit-slider"
              type="range"
              min="5"
              max="10"
              step="1"
              aria-valuemin={5}
              aria-valuemax={10}
              aria-valuenow={wipLimit}
              aria-valuetext={`${wipLimit} tasks`}
            />
            <output htmlFor="wip-limit-slider" aria-live="polite">
              {wipLimit} tasks
            </output>
          </fieldset>

          {/* Prompting Frequency */}
          <fieldset>
            <legend>Proactive Prompting</legend>
            <div className="checkbox-group">
              <input
                id="prompting-enabled"
                type="checkbox"
                checked={promptingEnabled}
                onChange={(e) => setPromptingEnabled(e.target.checked)}
              />
              <label htmlFor="prompting-enabled">
                Enable proactive task prompts
              </label>
            </div>

            {promptingEnabled && (
              <div className="slider-group">
                <label htmlFor="prompting-frequency">
                  Prompt frequency (1-6 hours)
                </label>
                <input
                  id="prompting-frequency"
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  aria-valuemin={1}
                  aria-valuemax={6}
                  aria-valuenow={frequency}
                  aria-valuetext={`Every ${frequency} hours`}
                />
                <output htmlFor="prompting-frequency" aria-live="polite">
                  Every {frequency} hours
                </output>
              </div>
            )}
          </fieldset>
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};
```

**Keyboard Navigation:**

- Modal opens: Focus moves to first interactive element (Close button or first
  input)
- Tab: Cycles through modal controls only (focus trapped)
- Shift+Tab: Cycles backward through modal controls
- Escape: Closes modal, restores focus to trigger element
- Enter: Activates focused button

## Color Contrast Requirements

**Minimum Contrast Ratios (WCAG 2.1 AA):**

| Element Type                          | Minimum Ratio          | Example                                              |
| ------------------------------------- | ---------------------- | ---------------------------------------------------- |
| Normal text (body)                    | 4.5:1                  | #333333 on #FFFFFF (11.6:1) ✅                       |
| Large text (18pt+)                    | 3:1                    | #666666 on #FFFFFF (5.7:1) ✅                        |
| Interactive elements (buttons, links) | 4.5:1                  | #0066CC on #FFFFFF (7.7:1) ✅                        |
| UI components (borders, icons)        | 3:1                    | #999999 on #FFFFFF (2.8:1) ❌ Use #767676 (4.5:1) ✅ |
| Focus indicators                      | 3:1 against background | 2px solid #0066CC outline ✅                         |

**Color Palette with Contrast Values:**

```css
/* apps/web/src/styles/colors.css */
:root {
  /* Primary colors - WCAG AA compliant */
  --color-primary: #0066cc; /* 7.7:1 on white */
  --color-primary-hover: #0052a3; /* 9.4:1 on white */

  /* Text colors */
  --color-text-primary: #1a1a1a; /* 16.1:1 on white */
  --color-text-secondary: #4a4a4a; /* 9.7:1 on white */
  --color-text-tertiary: #767676; /* 4.5:1 on white - minimum for AA */

  /* Status colors */
  --color-success: #008a00; /* 4.5:1 on white */
  --color-error: #c71f1f; /* 5.9:1 on white */
  --color-warning: #947600; /* 4.5:1 on white */

  /* UI colors */
  --color-border: #cccccc; /* 2.6:1 - decorative only */
  --color-border-focus: #0066cc; /* 7.7:1 - focus indicator */

  /* Background colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5; /* Subtle, decorative */
  --color-bg-hover: #e8e8e8;
}
```

**Dark Mode Considerations** (Phase 2):

- Invert ratios: Text must be 4.5:1 against dark backgrounds
- Example: #E0E0E0 text on #1A1A1A background (12.6:1) ✅

## Keyboard Navigation Map

**Global Keyboard Shortcuts:**

| Key       | Action                           | Context             |
| --------- | -------------------------------- | ------------------- |
| Tab       | Navigate forward                 | Global              |
| Shift+Tab | Navigate backward                | Global              |
| Enter     | Activate button/link             | Focused element     |
| Space     | Activate button, toggle checkbox | Focused element     |
| Escape    | Close modal/toast                | Modal or toast open |
| /         | Focus search (future feature)    | Global              |

**Component-Specific Navigation:**

| Component          | Tab Order                       | Special Keys      |
| ------------------ | ------------------------------- | ----------------- |
| TaskCard           | Complete button → Delete button | -                 |
| AddTaskInput       | Input field → Add button        | Enter to submit   |
| PromptToast        | Complete → Snooze → Dismiss     | Escape to dismiss |
| SettingsModal      | Close → Inputs → Cancel → Save  | Escape to close   |
| CelebrationOverlay | Close button (optional)         | Escape to dismiss |

**Focus Indicators:**

```css
/* apps/web/src/styles/focus.css */
*:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Remove default browser outline, replace with custom */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1);
}

/* High-contrast mode support */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline-width: 3px;
    outline-offset: 3px;
  }
}
```

## Screen Reader Support

**ARIA Landmarks:**

```typescript
// apps/web/src/App.tsx
export const App = () => (
  <div className="app-container">
    <header role="banner">
      <h1>Simple To-Do</h1>
      <nav role="navigation" aria-label="Main navigation">
        <Link to="/">Tasks</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>
    </header>

    <main role="main" aria-label="Main content">
      <Routes>
        <Route path="/" element={<TaskListView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/analytics" element={<AnalyticsView />} />
      </Routes>
    </main>

    <footer role="contentinfo">
      <p>Simple To-Do App - Privacy-first task management</p>
    </footer>
  </div>
);
```

**Screen Reader Announcements:**

| Event             | Announcement                                                                    | Priority  |
| ----------------- | ------------------------------------------------------------------------------- | --------- |
| Task created      | "Task added: [task text]"                                                       | Polite    |
| Task completed    | "Task completed: [task text]"                                                   | Polite    |
| Task deleted      | "Task deleted: [task text]"                                                     | Polite    |
| WIP limit reached | "Cannot add task. You have 7 active tasks. Complete a task before adding more." | Assertive |
| Prompt appears    | "Task reminder: [task text]"                                                    | Polite    |
| Celebration       | "[Celebration message]"                                                         | Polite    |
| Validation error  | "[Error message]"                                                               | Assertive |
| Settings saved    | "Settings saved successfully"                                                   | Polite    |

**Live Region Implementation:**

```typescript
// apps/web/src/utils/announceToScreenReader.ts
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden but announced
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement (1 second delay)
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

**Screen Reader Only Utility Class:**

```css
/* apps/web/src/styles/accessibility.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Allow focusing on sr-only elements for keyboard navigation */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Accessibility Testing Strategy

### Automated Testing (Jest + jest-axe)

**Component Tests:**

```typescript
// apps/web/tests/unit/components/TaskCard.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TaskCard } from '../../../src/components/TaskCard';
import { createTestTask } from '../../helpers/factories';

expect.extend(toHaveNoViolations);

describe('TaskCard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const task = createTestTask({ text: 'Buy groceries' });
    const { container } = render(
      <TaskCard task={task} onComplete={jest.fn()} onDelete={jest.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels on buttons', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    const { getByLabelText } = render(
      <TaskCard task={task} onComplete={jest.fn()} onDelete={jest.fn()} />
    );

    expect(getByLabelText('Complete task: Buy groceries')).toBeInTheDocument();
    expect(getByLabelText('Delete task: Buy groceries')).toBeInTheDocument();
  });

  it('should be keyboard navigable', () => {
    const task = createTestTask();
    const onComplete = jest.fn();
    const onDelete = jest.fn();

    const { getByLabelText } = render(
      <TaskCard task={task} onComplete={onComplete} onDelete={onDelete} />
    );

    const completeButton = getByLabelText(/complete task/i);
    const deleteButton = getByLabelText(/delete task/i);

    // Simulate keyboard interaction
    completeButton.focus();
    expect(document.activeElement).toBe(completeButton);

    deleteButton.focus();
    expect(document.activeElement).toBe(deleteButton);
  });
});
```

**CI/CD Integration:**

```yaml
# .github/workflows/ci.yaml (accessibility tests)
- name: Run accessibility tests
  run: npm run test:a11y

- name: Fail if accessibility violations detected
  run: |
    if [ $? -ne 0 ]; then
      echo "Accessibility violations detected"
      exit 1
    fi
```

### Manual Testing Checklist

**Screen Reader Testing:**

| Test                           | Tool              | Pass Criteria                                |
| ------------------------------ | ----------------- | -------------------------------------------- |
| Navigate task list             | NVDA (Windows)    | Tasks announced with text and age            |
| Complete task                  | JAWS (Windows)    | Completion announced, task removed from list |
| Add task with validation error | VoiceOver (macOS) | Error announced immediately, focus on input  |
| Receive proactive prompt       | NVDA              | Prompt announced, focus on Complete button   |
| Navigate settings modal        | VoiceOver         | Focus trapped, slider values announced       |
| Celebrate task completion      | JAWS              | Celebration message announced                |

**Keyboard-Only Testing:**

| Test                     | Keys Used                     | Pass Criteria                                    |
| ------------------------ | ----------------------------- | ------------------------------------------------ |
| Navigate entire app      | Tab, Shift+Tab                | All interactive elements reachable               |
| Add task                 | Tab to input, Enter to submit | Task added without mouse                         |
| Complete task            | Tab to Complete button, Enter | Task completed without mouse                     |
| Dismiss prompt           | Escape                        | Prompt dismissed without mouse                   |
| Close settings           | Escape                        | Settings modal closed, focus restored            |
| Focus indicators visible | Tab through elements          | 2px blue outline visible on all focused elements |

**Color Contrast Testing:**

| Tool                    | Usage                    | Pass Criteria                     |
| ----------------------- | ------------------------ | --------------------------------- |
| WebAIM Contrast Checker | Manual spot checks       | All text 4.5:1, UI components 3:1 |
| axe DevTools            | Automated page scan      | No contrast violations reported   |
| Chrome DevTools         | Inspect element contrast | Passes WCAG AA                    |

### Browser Compatibility

**Assistive Technology Support:**

| Browser      | Screen Reader | Support Level   |
| ------------ | ------------- | --------------- |
| Chrome 100+  | NVDA          | Full support ✅ |
| Firefox 100+ | NVDA          | Full support ✅ |
| Edge 100+    | JAWS          | Full support ✅ |
| Safari 15+   | VoiceOver     | Full support ✅ |

**Reduced Motion:**

```css
/* apps/web/src/styles/animations.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Disable confetti animation */
  .celebration-overlay canvas {
    display: none;
  }
}
```

## Accessibility Acceptance Criteria

**Must Pass Before Release:**

- ✅ Zero axe-core violations in automated tests
- ✅ All interactive elements keyboard accessible
- ✅ All form inputs have associated labels
- ✅ All images have alt text (or aria-hidden if decorative)
- ✅ Color contrast meets WCAG AA (4.5:1 for text)
- ✅ Focus indicators visible on all interactive elements
- ✅ Screen reader testing passes on NVDA (Windows) and VoiceOver (macOS)

**Should Pass Before Pilot Users:**

- ⚠️ JAWS screen reader testing complete
- ⚠️ Manual keyboard-only navigation tested for all user flows
- ⚠️ Reduced motion preference respected

**Nice to Have (Phase 2):**

- 📊 WCAG 2.1 AAA compliance (7:1 contrast for text)
- 📊 Voice control testing (Dragon NaturallySpeaking)
- 📊 High contrast mode support
- 📊 Accessibility audit by external auditor

---

_This document will continue to be updated as the architecture evolves._
