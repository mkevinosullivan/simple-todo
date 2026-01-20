# Animation & Micro-interactions

## Motion Design Philosophy

The Simple To-Do App uses motion purposefully to enhance usability, provide feedback, and create delightful moments—never as decoration. Every animation serves one of these goals:

1. **Provide Feedback** - Confirm user actions (button press, task completion)
2. **Guide Attention** - Direct focus to important changes (new toast, celebration)
3. **Explain Transitions** - Show what's happening (modal opening, task disappearing)
4. **Express Personality** - Reinforce brand tone (celebratory confetti, gentle fades)
5. **Reduce Cognitive Load** - Smooth transitions prevent jarring changes

**Core Animation Principles:**

- **Purposeful, Not Decorative** - Every animation has a functional reason
- **Fast but Not Instant** - 200-300ms feels responsive without being abrupt
- **Consistent Timing** - Similar actions use similar durations
- **Natural Easing** - Ease-out for entrances (starts fast), ease-in for exits (ends fast)
- **Respectful of Attention** - Motion attracts focus, so use sparingly
- **Performance First** - GPU-accelerated properties only (transform, opacity)
- **Reduce Motion Support** - Honor user's accessibility preferences

---

## Global Animation Timing Reference

| Duration | Use Case | Examples |
|----------|----------|----------|
| **100-150ms** | Micro-interactions | Button hover, focus ring appearance |
| **200-300ms** | Standard UI transitions | Modal open/close, toast slide-in/out, task fade-out |
| **300-500ms** | Significant state changes | Empty state transitions, filter animations |
| **500-700ms** | Celebratory moments | Celebration overlay entrance with scale |
| **700-1000ms** | Special effects | Confetti animation, particle effects |

---

## Component-Specific Animations

### 1. Button Animations

**Hover State (100ms ease-out)**
```css
.button {
  transition: background-color 100ms ease-out,
              transform 100ms ease-out,
              box-shadow 100ms ease-out;
}

.button:hover {
  background-color: /* 10% darker */;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**Active/Pressed State (100ms ease-in)**
```css
.button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
```

**Loading State (continuous)**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.button-spinner {
  animation: spin 600ms linear infinite;
}
```

**Micro-interactions:**
- **Ripple effect (optional):** On click, circular ripple expands from click point (300ms)
- **Icon pulse:** For icon buttons, subtle scale pulse on hover (0.95 → 1.0, 150ms)

---

### 2. Input Field Animations

**Focus State (200ms ease-out)**
```css
.input {
  transition: border-color 200ms ease-out,
              box-shadow 200ms ease-out;
}

.input:focus {
  border-color: #3B82F6;
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

**Error State (entrance: 200ms, shake: 400ms)**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.input-error {
  animation: shake 400ms ease-in-out;
  border-color: #EF4444;
}
```

**Error Message Appearance (200ms slide-down + fade)**
```css
@keyframes error-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  animation: error-slide-in 200ms ease-out;
}
```

---

### 3. Task Card Animations

**Entrance (when added to list): Slide-down + fade (300ms ease-out)**
```css
@keyframes task-enter {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card-enter {
  animation: task-enter 300ms ease-out;
}
```

**Hover State (200ms ease-out)**
```css
.task-card {
  transition: box-shadow 200ms ease-out,
              background-color 200ms ease-out;
}

.task-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  background-color: #FAFBFC; /* Slightly lighter */
}
```

**Completion Exit (300ms ease-in)**
```css
@keyframes task-complete {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translateX(24px) scale(0.95);
  }
  100% {
    opacity: 0;
    transform: translateX(48px) scale(0.9);
    height: 0;
    margin: 0;
    padding: 0;
  }
}

.task-card-exit {
  animation: task-complete 300ms ease-in forwards;
}
```

**Edit Mode Transition (200ms)**
- Task text fades out (100ms)
- Input field fades in (100ms, delayed 100ms)
- Action buttons swap (fade cross-dissolve, 200ms)

**Age Indicator Pulse (when aging category changes)**
```css
@keyframes age-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.age-indicator-change {
  animation: age-pulse 400ms ease-in-out;
}
```

---

### 4. Toast Notification Animations

**Entrance: Slide-in from right + fade (300ms ease-out)**
```css
@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter {
  animation: toast-enter 300ms ease-out;
}
```

**Exit: Slide-out to right + fade (300ms ease-in)**
```css
@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast-exit {
  animation: toast-exit 300ms ease-in forwards;
}
```

**Button Hover within Toast (150ms)**
- Background color transition
- Slight scale (1.0 → 1.05)

**Auto-dismiss Timer Indicator (optional)**
- Progress bar that shrinks from 100% to 0% over 30 seconds
- Linear animation, no easing

---

### 5. Modal/Overlay Animations

**Settings Modal Entrance (250ms ease-out)**
```css
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: modal-enter 250ms ease-out;
}

/* Backdrop fades in simultaneously */
@keyframes backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

.backdrop-enter {
  animation: backdrop-enter 250ms ease-out;
}
```

**Modal Exit (200ms ease-in)**
```css
@keyframes modal-exit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
}

.modal-exit {
  animation: modal-exit 200ms ease-in forwards;
}
```

**Celebration Overlay Entrance (500ms with bounce)**
```css
@keyframes celebration-enter {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.celebration-enter {
  animation: celebration-enter 500ms ease-out;
}
```

**Celebration Exit (300ms ease-in)**
```css
@keyframes celebration-exit {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.celebration-exit {
  animation: celebration-exit 300ms ease-in forwards;
}
```

---

### 6. Slider (Range Input) Animations

**Thumb Hover/Active (150ms)**
```css
.slider-thumb {
  transition: transform 150ms ease-out,
              box-shadow 150ms ease-out;
}

.slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.slider-thumb:active {
  transform: scale(1.3);
}
```

**Value Change (smooth drag)**
- Track fill animates smoothly as thumb drags (no explicit animation needed, native behavior)
- Current value display updates in real-time with slight fade transition (100ms)

---

### 7. Toggle/Switch Animations

**Toggle Transition (200ms ease-in-out)**
```css
.toggle-switch {
  transition: background-color 200ms ease-in-out;
}

.toggle-thumb {
  transition: transform 200ms ease-in-out;
}

/* When toggled ON */
.toggle-switch.on {
  background-color: #3B82F6;
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(20px); /* Moves thumb to right */
}
```

**Micro-interaction: Slight thumb scale on click (100ms)**
```css
.toggle-thumb:active {
  transform: scale(1.1);
}
```

---

### 8. WIP Count Indicator Animations

**Color Transition (when count changes, 300ms)**
```css
.wip-indicator {
  transition: background-color 300ms ease-out,
              color 300ms ease-out;
}
```

**Pulse when WIP limit reached (400ms)**
```css
@keyframes wip-limit-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.wip-indicator-at-limit {
  animation: wip-limit-pulse 400ms ease-in-out;
}
```

**Number increment/decrement (flip animation, 300ms)**
```css
@keyframes number-flip {
  0% {
    transform: rotateX(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateX(90deg);
    opacity: 0;
  }
  51% {
    transform: rotateX(-90deg);
    opacity: 0;
  }
  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
}

.wip-count-change {
  animation: number-flip 300ms ease-in-out;
}
```

---

### 9. WIP Limit Message Card Animations

**Entrance: Slide-down + fade (200ms ease-out)**
```css
@keyframes wip-message-enter {
  from {
    opacity: 0;
    transform: translateY(-16px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px; /* Adjust based on content */
  }
}

.wip-message-enter {
  animation: wip-message-enter 200ms ease-out;
}
```

**Exit: Slide-up + fade (200ms ease-in)**
```css
@keyframes wip-message-exit {
  from {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
  to {
    opacity: 0;
    transform: translateY(-16px);
    max-height: 0;
  }
}

.wip-message-exit {
  animation: wip-message-exit 200ms ease-in forwards;
}
```

**Pulse when user tries to add task while at limit (300ms)**
```css
@keyframes wip-message-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.wip-message-pulse {
  animation: wip-message-pulse 300ms ease-out;
}
```

---

### 10. Empty State / Celebration Card Animations

**Entrance: Fade + gentle scale (400ms ease-out)**
```css
@keyframes empty-state-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.empty-state-enter {
  animation: empty-state-enter 400ms ease-out;
}
```

**Inbox Zero Confetti (700-1000ms, using canvas-confetti library)**
- Confetti bursts from center/top
- Multiple particle colors (matching celebration gradient)
- Gravity and spread for natural effect
- Auto-stops after 1 second

---

## Special Effect Animations

### Confetti (Task Completion Celebration)

**Implementation:** Use [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) library

**Configuration:**
```javascript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#F97316', '#FCD34D', '#10B981', '#3B82F6'],
  duration: 1000,
  gravity: 1.2,
  scalar: 1.0
});
```

**Trigger:** On task completion, after celebration overlay appears (delay: 100ms)

**Performance:** Canvas-based, GPU-accelerated, minimal impact

---

## Page-Level Transitions

**Initial Page Load (First-Launch Config or Main Task List)**

**Stagger entrance for multiple elements (100ms delay between each):**
1. Header fades in (200ms)
2. Add task section slides down (200ms, delay 100ms)
3. Task cards appear one by one (200ms each, 100ms stagger)

```css
.stagger-enter-1 { animation: fade-in 200ms ease-out 0ms forwards; }
.stagger-enter-2 { animation: fade-in 200ms ease-out 100ms forwards; }
.stagger-enter-3 { animation: fade-in 200ms ease-out 200ms forwards; }
/* etc. */

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Empty State ↔ Task List Transition (300ms cross-fade)**
- Empty state fades out (200ms)
- First task fades in (200ms, delay 100ms)
- Subsequent tasks stagger in (100ms delay each)

---

## Loading States

**Skeleton Screens (for task list loading)**

**Shimmer effect (1500ms loop)**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    to right,
    #F3F4F6 0%,
    #E5E7EB 20%,
    #F3F4F6 40%,
    #F3F4F6 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 1500ms linear infinite;
}
```

**Spinner (for button loading states, 600ms rotation)**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 600ms linear infinite;
}
```

---

## Focus Indicators (Accessibility)

**Focus Ring Appearance (100ms)**
```css
.focusable {
  transition: outline 100ms ease-out,
              outline-offset 100ms ease-out;
}

.focusable:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

**Focus ring should never animate out** - it disappears instantly when focus is lost for accessibility.

---

## Reduced Motion Support

**Implementation:** Disable all non-essential animations for users with `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**What remains with reduced motion:**
- Instant state changes (no fade, no slide, no scale)
- Functional feedback (still show completion, but instant)
- Focus indicators (instant appearance/disappearance)
- Color changes (instant, not transitioned)

**What's disabled:**
- All entrance/exit animations
- Hover transitions
- Confetti and particle effects
- Skeleton shimmer
- Any decorative motion

**User Experience:** Users with reduced motion still get full functionality, just without motion-based transitions.

---

## Animation Performance Checklist

- **✓ Use GPU-accelerated properties only:** transform, opacity
- **✗ Avoid animating:** width, height, top, left, margin, padding (causes layout reflow)
- **✓ Use `will-change` sparingly:** Only for expensive animations that happen frequently
- **✓ Remove `will-change` after animation completes:** Prevents memory overhead
- **✓ Limit simultaneous animations:** Max 3-4 elements animating at once
- **✓ Test on low-end devices:** Ensure 60fps on older hardware
- **✓ Use CSS animations over JavaScript:** Better performance, native optimization
- **✓ Debounce scroll/resize listeners:** Prevent animation jank during scroll

---

## Animation Testing Strategy

**Manual Testing:**
- [ ] Verify all animations run at 60fps (use Chrome DevTools Performance tab)
- [ ] Test with reduced motion enabled (should see instant transitions)
- [ ] Test on low-end device (e.g., older mobile device)
- [ ] Verify animations feel consistent across different components
- [ ] Check that animations don't block interaction (e.g., can click during modal entrance)

**Automated Testing (Phase 2):**
- Use Lighthouse performance audit
- Monitor animation frame drops in CI/CD
- Automated visual regression testing for animation states
