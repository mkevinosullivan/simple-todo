# Performance

## Performance Goals & Targets

The Simple To-Do App prioritizes performance to maintain the calm, responsive
experience central to its UX goals. Performance is a feature—not an
afterthought.

**Target Metrics (MVP):**

| Metric                             | Target         | Critical Threshold | Notes                            |
| ---------------------------------- | -------------- | ------------------ | -------------------------------- |
| **First Contentful Paint (FCP)**   | <800ms         | <1.5s              | User sees content quickly        |
| **Largest Contentful Paint (LCP)** | <1.2s          | <2.5s              | Main content fully visible       |
| **Time to Interactive (TTI)**      | <2s            | <3.5s              | App is fully interactive         |
| **Total Blocking Time (TBT)**      | <150ms         | <300ms             | Main thread remains responsive   |
| **Cumulative Layout Shift (CLS)**  | <0.05          | <0.1               | Minimal visual instability       |
| **JavaScript Bundle Size**         | <100KB gzipped | <150KB             | Fast parse and execution         |
| **CSS Bundle Size**                | <20KB gzipped  | <30KB              | Quick style application          |
| **Task Operation Response**        | <100ms         | <200ms             | Instant feedback on interactions |

**Performance Budget:**

- Total page weight (initial load): <300KB gzipped
- Total page weight (with assets): <500KB gzipped
- Maximum API response time: <300ms (p95)
- Frame rate during animations: 60fps minimum

---

## Code Splitting & Lazy Loading

**Strategy:** Split code to minimize initial bundle size and defer non-critical
features.

**Core Bundle (loaded immediately):**

- Main task list view
- Add task functionality
- Task completion
- Basic routing
- Essential utilities

**Lazy-Loaded Modules:**

- **Settings Modal** - Only loaded when user opens settings
- **Celebration System** - Loaded on first task completion
- **Confetti Library** - Loaded only when celebration occurs
- **Analytics Service** - Non-blocking, loads after TTI
- **Help Documentation** - Only when user clicks help icon

**Implementation Example (React):**

```javascript
// Lazy load settings modal
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));

// Lazy load confetti
const loadConfetti = () => import('canvas-confetti');

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  {isSettingsOpen && <SettingsModal />}
</Suspense>;
```

**Benefits:**

- Initial bundle ~60-80KB instead of ~150KB
- Faster initial page load
- Settings modal (~25KB) only loads when needed
- Confetti (~15KB) only loads when celebrating

---

## Asset Optimization

**JavaScript Optimization:**

- **Minification:** Use Terser or esbuild for production builds
- **Tree-shaking:** Remove unused code (especially from libraries)
- **Compression:** Serve gzipped or Brotli-compressed assets
- **Modern builds:** Ship ES2015+ to modern browsers, legacy builds for old
  browsers

**CSS Optimization:**

- **Minification:** Remove whitespace, comments, redundant rules
- **Critical CSS:** Inline critical styles for above-the-fold content
- **Unused CSS removal:** Use PurgeCSS or similar tools
- **Compression:** Gzip CSS files

**Font Loading:**

- **System fonts preferred:** Use native font stack (Inter fallback to system
  fonts)
- **If custom fonts:** Use `font-display: swap` to prevent FOIT (Flash of
  Invisible Text)
- **Subset fonts:** Only include necessary character sets (Latin only for MVP)
- **Preload critical fonts:**
  ```html
  <link
    rel="preload"
    href="/fonts/Inter-var.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  ```

**No Images in MVP:**

- Use SVG icons or emoji (no image loading overhead)
- If images added later: WebP format with JPEG fallback, responsive images with
  `srcset`

---

## Rendering Optimization

**Virtual Scrolling (Phase 2):**

- Not needed for MVP (WIP limit of 5-10 tasks)
- If task limits increase: Use virtual scrolling library (e.g., react-window)
- Only render visible tasks in viewport

**Optimistic UI Updates:**

- Update UI immediately on user action
- Don't wait for API response to show feedback
- Revert if API fails

**Example: Task Completion**

```javascript
// Optimistic update
const handleComplete = async (taskId) => {
  // 1. Immediately remove from UI
  setTasks(tasks.filter((t) => t.id !== taskId));

  // 2. Trigger celebration immediately
  showCelebration();

  // 3. Call API in background
  try {
    await api.completeTask(taskId);
  } catch (error) {
    // 4. Revert UI if API fails
    setTasks([...tasks, failedTask]);
    showErrorToast('Could not complete task');
  }
};
```

**Debouncing & Throttling:**

- **Task age updates:** Throttle to once per minute (not every render)
- **Auto-save draft task text:** Debounce 500ms after typing stops
- **Window resize listeners:** Debounce to 150ms

**Memoization (React example):**

```javascript
// Memoize expensive calculations
const wipPercentage = useMemo(
  () => (activeTasks.length / wipLimit) * 100,
  [activeTasks.length, wipLimit]
);

// Memoize task list to prevent re-renders
const TaskList = React.memo(({ tasks, onComplete, onDelete }) => {
  return tasks.map((task) => <TaskCard key={task.id} {...task} />);
});
```

---

## API & Data Fetching

**Caching Strategy:**

- **Task list:** Cache in memory, refresh on visibility change (Page Visibility
  API)
- **Config:** Cache in localStorage, sync with server only on change
- **Celebration messages:** Cache all messages on first fetch

**Request Optimization:**

- **Batch requests:** If adding multiple tasks, batch into single API call
- **Prefetch:** Preload celebration messages after first task added
- **Abort stale requests:** Cancel pending requests if new request made

**HTTP/2 or HTTP/3:**

- Use multiplexing for concurrent requests
- Server push for critical assets (optional)

**Service Worker (Phase 2 - PWA):**

- Cache static assets (HTML, CSS, JS)
- Cache-first for assets, network-first for API
- Offline support with queue for failed requests

**SSE (Server-Sent Events) for Proactive Prompts:**

- Keep connection alive, minimal overhead
- Reconnect automatically on disconnect
- Close connection when prompting disabled

---

## State Management Performance

**Minimize Re-renders:**

- Use fine-grained state updates (only update what changed)
- Avoid unnecessary global state
- Use local state for UI-only concerns (modal open/closed)

**Example State Structure:**

```javascript
// Good: Separate state by concern
const [tasks, setTasks] = useState([]);
const [config, setConfig] = useState({});
const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// Avoid: Monolithic state object
// const [state, setState] = useState({ tasks, config, ui: {...} });
```

**Computed Values:**

- Derive don't duplicate (e.g., active task count from task array)
- Use selectors or computed properties

---

## Animation Performance

**GPU Acceleration:**

- Only animate `transform` and `opacity` (already specified in Animation
  section)
- Use `will-change` for frequently animated elements, remove after animation
  completes

**Animation Frame Budget:**

- Target 16ms per frame (60fps)
- Profile animations in Chrome DevTools Performance tab
- Reduce complexity if frames drop below 60fps

**Disable Animations on Low-End Devices (optional):**

```javascript
// Detect low-end device
const isLowEndDevice =
  navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

if (isLowEndDevice) {
  document.body.classList.add('reduce-motion');
}
```

---

## Third-Party Dependencies

**Dependency Audit:**

- Review bundle size of all dependencies
- Avoid large libraries for simple tasks
- Consider alternatives or custom implementations

**Recommended Libraries (with sizes):**

- **canvas-confetti:** ~15KB gzipped (celebration effects)
- **date-fns:** ~2-3KB per function (time formatting) - use tree-shaking
- **Optional: Zustand or Jotai:** ~2-3KB (state management, lighter than Redux)

**Avoid:**

- Moment.js (large, use date-fns or native Intl)
- Lodash (use native ES6 methods or import specific functions)
- jQuery (use native DOM APIs)

---

## Build Optimization

**Production Build Configuration:**

**Webpack (example):**

```javascript
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
  performance: {
    maxAssetSize: 150000, // 150KB warning threshold
    maxEntrypointSize: 300000, // 300KB warning threshold
  },
};
```

**Vite (example):**

```javascript
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          confetti: ['canvas-confetti'],
        },
      },
    },
  },
});
```

**Source Maps:**

- Generate source maps for production debugging
- Store separately, don't serve to all users
- Only load when DevTools open

---

## Monitoring & Measurement

**Real User Monitoring (RUM):**

- Use Web Vitals library to capture Core Web Vitals
- Send metrics to analytics service (Phase 2)
- Monitor p75 and p95 percentiles, not just averages

**Performance API Usage:**

```javascript
// Measure task operation time
const startTime = performance.now();
await completeTask(taskId);
const duration = performance.now() - startTime;
console.log(`Task completion took ${duration}ms`);

// Report if slow
if (duration > 200) {
  analytics.trackSlowOperation('task_complete', duration);
}
```

**Lighthouse CI (Phase 2):**

- Automated Lighthouse audits in CI/CD pipeline
- Fail builds if performance score drops below threshold (e.g., <90)
- Track performance trends over time

**Key Metrics to Monitor:**

- FCP, LCP, TTI, TBT, CLS (Core Web Vitals)
- Bundle sizes (JS, CSS)
- API response times (p50, p95, p99)
- Task operation latency (add, complete, delete)
- Animation frame rate

---

## Browser Performance API Features

**Page Visibility API:**

- Pause expensive operations when tab hidden
- Resume task age calculations when tab visible
- Pause SSE connection when app not visible

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause updates
    stopAgeUpdates();
  } else {
    // Resume updates, refresh data
    startAgeUpdates();
    refreshTaskList();
  }
});
```

**requestIdleCallback:**

- Schedule non-critical work during idle periods
- Example: Update task age indicators, sync analytics

```javascript
requestIdleCallback(() => {
  updateAllTaskAges();
  syncAnalyticsData();
});
```

**Intersection Observer:**

- Lazy load below-the-fold content (if task list grows large in Phase 2)
- Trigger animations when elements enter viewport

---

## Performance Checklist

**Build-Time:**

- [ ] Minify and compress all assets (JS, CSS)
- [ ] Enable tree-shaking for unused code removal
- [ ] Code-split into core and lazy-loaded modules
- [ ] Generate production source maps (stored separately)
- [ ] Analyze bundle size with webpack-bundle-analyzer or similar
- [ ] Set performance budgets in build configuration

**Runtime:**

- [ ] Use optimistic UI updates for instant feedback
- [ ] Implement debouncing for frequent events (typing, resize)
- [ ] Memoize expensive calculations and components
- [ ] Use GPU-accelerated animations only (transform, opacity)
- [ ] Profile with Chrome DevTools Performance tab
- [ ] Verify 60fps during all animations

**Network:**

- [ ] Enable gzip or Brotli compression on server
- [ ] Set appropriate cache headers for static assets
- [ ] Use HTTP/2 or HTTP/3 for multiplexing
- [ ] Minimize number of API requests (batch where possible)
- [ ] Implement request caching strategy

**Testing:**

- [ ] Test on low-end devices (e.g., older Android phone)
- [ ] Test on slow 3G network (Chrome DevTools Network throttling)
- [ ] Run Lighthouse audit (target score: >90)
- [ ] Monitor Core Web Vitals in development
- [ ] Verify bundle sizes stay within budget

---

## Performance Anti-Patterns to Avoid

**DON'T:**

- ❌ Animate properties that cause layout reflow (width, height, top, left)
- ❌ Fetch data synchronously or block rendering
- ❌ Include large dependencies for simple functionality
- ❌ Re-render entire component tree on every state change
- ❌ Load all features upfront (no code splitting)
- ❌ Use large polyfills for modern browsers
- ❌ Ignore performance budgets and warnings

**DO:**

- ✅ Animate transform and opacity only
- ✅ Fetch data asynchronously, show loading states
- ✅ Use small, focused libraries or native APIs
- ✅ Optimize renders with memoization and fine-grained state
- ✅ Lazy load non-critical features
- ✅ Ship modern code to modern browsers
- ✅ Monitor and maintain performance budgets

---

## Phase 2 Performance Enhancements

**Deferred for MVP, consider for Phase 2:**

- Progressive Web App (PWA) with service worker
- Virtual scrolling for large task lists (if WIP limits removed)
- IndexedDB for offline data storage
- Web Workers for heavy computations (analytics processing)
- Advanced prefetching strategies (predictive)
- CDN for global edge caching
- Image optimization pipeline (if images added)

**Rationale:** MVP focuses on core performance metrics that ensure a fast,
responsive experience within the 4-6 week timeline. Advanced optimizations can
be added based on real user data.

---
