# Responsiveness

## Responsive Design Strategy

The Simple To-Do App uses a **mobile-first responsive design** that adapts
gracefully from narrow sidebars (300px) to full-screen displays (1920px+). The
primary target is desktop/laptop browsers, but the design accommodates window
tiling, split-screen layouts, tablets, and mobile devices.

## Breakpoints

**Defined Breakpoints:**

| Breakpoint | Min Width  | Target Use Case                     | Layout Changes                     |
| ---------- | ---------- | ----------------------------------- | ---------------------------------- |
| **XSmall** | 0-479px    | Mobile phones, very narrow sidebars | Stacked layout, minimal chrome     |
| **Small**  | 480-767px  | Large phones, narrow sidebars       | Compact layout, reduced spacing    |
| **Medium** | 768-1023px | Tablets, half-screen desktop        | Comfortable spacing, full features |
| **Large**  | 1024px+    | Full desktop, wide layouts          | Generous spacing, optimal layout   |

**Implementation (CSS):**

```css
/* Mobile-first base styles (XSmall) */
.component { ... }

/* Small screens and up */
@media (min-width: 480px) { ... }

/* Medium screens and up */
@media (min-width: 768px) { ... }

/* Large screens and up */
@media (min-width: 1024px) { ... }
```

## Layout Adaptations by Breakpoint

### XSmall (0-479px) - Mobile/Narrow

**Header:**

- App title: "Simple To-Do" (abbreviated or icon only if needed)
- WIP indicator: "[5/7]" compact format
- Settings and help icons: 40x40px (still touch-accessible)
- Stack vertically if space constrained

**Add Task Section:**

- Input field: Full width (100%)
- "Add Task" button: Full width below input (stacked vertically)
- Padding: 12px horizontal margins

**Task Cards:**

- Full width with 12px margins
- Task text: Wraps to multiple lines
- Action buttons: Remain 44x44px for touch targets
- Buttons stack vertically if horizontal space too tight
- Timestamp: Below task text, smaller font (12px)

**Modals:**

- Full-screen overlay (no margins)
- Settings modal: Full viewport height, scrollable
- Celebration: Reduced padding (24px instead of 40px)

**Toasts:**

- Width: calc(100vw - 32px) - 16px margins on each side
- Position: Bottom center instead of bottom-right
- Buttons: Stack vertically if needed for clarity

### Small (480-767px) - Large Phone/Narrow Sidebar

**Header:**

- Full app title visible: "Simple To-Do"
- WIP indicator and icons in single row
- Comfortable spacing between elements

**Add Task Section:**

- Input field: 70% width
- "Add Task" button: 30% width, same row
- Or: Input full width with button below (depends on design preference)

**Task Cards:**

- Width: calc(100% - 24px) with 12px margins
- Action buttons: Horizontal row at right
- All features visible

**Modals:**

- Settings: 90vw max-width, centered with small margins
- Scrollable if content exceeds viewport height

**Toasts:**

- Width: 320px (fixed)
- Position: Bottom-right corner

### Medium (768-1023px) - Tablet/Half-Screen Desktop

**Header:**

- Full layout with generous spacing
- All elements visible and comfortable

**Add Task Section:**

- Input: 75% width
- Button: 25% width or auto-width (e.g., 120px)
- Horizontal layout

**Task Cards:**

- Max-width: 700px, centered
- Padding: 16px vertical, 20px horizontal
- All elements comfortably spaced

**Modals:**

- Settings: 600px max-width, centered
- Celebration: 500px max-width, centered

**Toasts:**

- 320px width
- Fixed bottom-right corner (16px from edges)

### Large (1024px+) - Full Desktop

**Header:**

- Optimal spacing (24px margins)
- All elements with maximum breathing room

**Add Task Section:**

- Max-width: 800px, centered within viewport
- Comfortable padding and spacing

**Task Cards:**

- Max-width: 800px, centered
- Generous padding and margins
- Hover effects fully visible

**Modals & Overlays:**

- Standard sizes as defined in wireframes
- Centered with ample backdrop space

## Component-Specific Responsive Behavior

### Task Cards

**XSmall:**

```
┌─────────────────────────────┐
│ 🟡 Buy groceries for week   │
│                         ✏️  │
│                         ✓   │
│                         🗑️  │
│ Created 5 days ago          │
└─────────────────────────────┘
```

- Actions stack vertically on right

**Small and up:**

```
┌───────────────────────────────────────┐
│ 🟡 Buy groceries       ✏️  ✓  🗑️     │
│    Created 5 days ago                 │
└───────────────────────────────────────┘
```

- Actions in horizontal row

### Settings Modal

**XSmall:**

- Full screen overlay
- Vertical scrolling for content
- Sliders full width
- Section spacing reduced to 24px

**Medium and up:**

- 600px max-width, centered
- All content visible without scroll (if possible)
- Standard spacing (32px between sections)

### First-Launch Configuration

**XSmall:**

- Card full width (minus 16px margins)
- WIP selector: 3 columns × 2 rows (for 5-10)
- Font size slightly reduced (28px headline)

**Medium and up:**

- 480px card, centered
- WIP selector: Single row (6 buttons)
- Standard font sizes

## Typography Responsiveness

**Fluid Typography (Optional Enhancement):**

Use `clamp()` for responsive font sizes without media queries:

```css
h1 {
  font-size: clamp(24px, 5vw, 32px);
}

body {
  font-size: clamp(14px, 2.5vw, 16px);
}
```

**Or Media Query Approach:**

```css
/* XSmall: Slightly reduced sizes */
h1 {
  font-size: 28px;
}
h2 {
  font-size: 20px;
}
body {
  font-size: 14px;
}

/* Medium and up: Standard sizes */
@media (min-width: 768px) {
  h1 {
    font-size: 32px;
  }
  h2 {
    font-size: 24px;
  }
  body {
    font-size: 16px;
  }
}
```

## Spacing Responsiveness

**Mobile (XSmall/Small):**

- Reduce margins: 12-16px instead of 24-32px
- Component padding: 12px instead of 16-20px
- Between elements: 16px instead of 24px

**Tablet/Desktop (Medium/Large):**

- Standard spacing as defined in design system
- Generous margins and padding for comfortable UX

## Images & Icons

**All Breakpoints:**

- Icons remain fixed size (20x20px default, 44x44px for touch targets)
- SVG icons scale without quality loss
- Emoji render at native size (typically 16-24px depending on system)

**Responsive Considerations:**

- No images in MVP (icon-only or emoji-based)
- If images added later: Use responsive images (`srcset`) or CSS
  `background-size: cover`

## Touch vs. Mouse Considerations

**Touch Devices (typically Small and below):**

- Minimum 44x44px touch targets (already standard)
- Hover states don't apply (use `:active` instead)
- No tooltips on hover (show info persistently or on tap)

**Mouse Devices (typically Medium and up):**

- Hover states visible on buttons, cards
- Tooltips appear on hover (age indicators, WIP count)
- Cursor changes to pointer on interactive elements

**Detection:**

```css
/* Touch-specific styles */
@media (hover: none) and (pointer: coarse) {
  .tooltip {
    display: none;
  }
  button:active {
    /* active state */
  }
}

/* Mouse-specific styles */
@media (hover: hover) and (pointer: fine) {
  button:hover {
    /* hover state */
  }
  .tooltip {
    display: block;
  }
}
```

## Orientation Support

**Portrait (typical mobile):**

- Vertical layout, content scrolls
- Modals full-screen
- Toasts at bottom

**Landscape (tablets, wide phones):**

- More horizontal space available
- Modals can be smaller (not full-screen)
- Consider max-height for modals to prevent awkward tall layouts

## Testing Strategy

**Manual Testing Viewports:**

1. **320px width** - iPhone SE, very narrow sidebar
2. **375px width** - iPhone 12/13/14
3. **768px width** - iPad portrait, half-screen desktop
4. **1024px width** - iPad landscape, small desktop
5. **1440px width** - Standard desktop
6. **1920px width** - Large desktop

**Browser DevTools:**

- Use responsive design mode
- Test both portrait and landscape
- Verify touch target sizes (Chrome DevTools has overlay)

**Real Devices (Phase 2):**

- iPhone (Safari)
- Android phone (Chrome)
- iPad (Safari)
- Various desktop browsers at different window sizes

## Container Strategy

**Recommended Approach:**

```css
.app-container {
  width: 100%;
  max-width: 800px; /* Prevents overly wide content */
  margin: 0 auto; /* Centers content */
  padding: 0 16px; /* Horizontal margins */
}

@media (min-width: 768px) {
  .app-container {
    padding: 0 24px; /* Wider margins on larger screens */
  }
}
```

This ensures:

- Content never touches viewport edges on any device
- Content doesn't become uncomfortably wide on large screens
- Consistent centering across breakpoints

## Performance Considerations

**Responsive Images (if added later):**

- Use `srcset` and `sizes` attributes
- Serve appropriately sized images for device
- Consider WebP format with fallbacks

**CSS:**

- Single CSS file with media queries (no separate mobile/desktop CSS)
- Minimize layout shifts during resize
- Use `contain` and `content-visibility` for performance (optional)

**JavaScript:**

- Use `matchMedia` to detect breakpoints if needed
- Debounce resize events if doing calculations
- Avoid reflows during animations
