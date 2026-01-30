# Epic 2 Manual Testing Checklist
# WIP Limits & Behavioral Tracking

**Tester:** [Your Name]
**Date:** [Test Date]
**Version:** [App Version/Commit SHA]

## Test Environment Setup
- [x] Fresh clone of repository
- [x] npm install completed successfully
- [x] Both frontend (port 3000) and backend (port 3001) running
- [x] data/ directory cleared (or renamed) to simulate first launch

## Test Scenario 1: First Launch Configuration
- [x] **Step 1.1:** Navigate to http://localhost:3000
- [x] **Step 1.2:** Verify FirstLaunchScreen displays with welcome message
- [x] **Step 1.3:** Verify three feature icons displayed (🎯 Focus, 🎉 Celebrate, 💡 Prompts)
- [x] **Step 1.4:** Verify WIP limit selector shows options 5-10
- [x] **Step 1.5:** Verify option 7 is highlighted as default
- [x] **Step 1.6:** Select WIP limit 6
- [x] **Step 1.7:** Click "Get Started"
- [x] **Step 1.8:** Verify main task view appears
- [x] **Step 1.9:** Verify WIP count indicator shows "0 of 6 active tasks"
- [x] **Step 1.10:** Refresh page, verify FirstLaunchScreen does NOT appear again
- [x] **Result:** PASS

## Test Scenario 2: WIP Limit Enforcement - Blocking at Limit
- [x] **Step 2.1:** Add 6 tasks (up to configured limit from Scenario 1)
- [x] **Step 2.2:** Verify WIP count indicator shows "6 of 6 active tasks"
- [x] **Step 2.3:** Verify "Add Task" button becomes disabled
- [x] **Step 2.4:** Verify helpful message displays: "You have 6 active tasks - complete one before adding more to maintain focus!"
- [x] **Step 2.5:** Verify message tone is encouraging (not punitive, calming colors)
- [x] **Step 2.6:** Verify message includes link to Settings
- [x] **Step 2.7:** Attempt to add 7th task via Enter key
- [x] **Step 2.8:** Verify task is NOT created
- [x] **Step 2.9:** Verify gentle animation on limit message (slide-in or fade-in)
- [x] **Result:** PASS

## Test Scenario 3: Free Space by Completing Task
- [x] **Step 3.1:** Complete one of the 6 active tasks
- [x] **Step 3.2:** Verify WIP count indicator updates to "5 of 6 active tasks"
- [x] **Step 3.3:** Verify "Add Task" button becomes enabled
- [x] **Step 3.4:** Verify limit message disappears or updates
- [x] **Step 3.5:** Add new task successfully
- [x] **Step 3.6:** Verify WIP count indicator shows "6 of 6 active tasks" again
- [x] **Result:** PASS

## Test Scenario 4: Analytics Calculations Accuracy
- [x] **Step 4.1:** Open browser console
- [ ] **Step 4.2:** Call analytics methods or inspect API responses
- [ ] **Step 4.3:** Verify completion rate: (completed tasks / total tasks) × 100
  - Expected: (1 / 7) × 100 ≈ 14.29%
  - Actual: ______%
- [ ] **Step 4.4:** Verify task count by status: { active: 6, completed: 1 }
  - Expected: active=6, completed=1
  - Actual: active=____, completed=____
- [ ] **Step 4.5:** Complete another task, wait 5 seconds, verify average lifetime calculation
- [ ] **Step 4.6:** Verify oldest active task is identified correctly
- [x] **Result:** FAIL - analytics service is only implemented in server, with no API access, as it's intended to support a post-MVP feature-set. Unable to test.

## Test Scenario 5: Task Metadata Validation
- [x] **Step 5.1:** Inspect tasks.json file in data/ directory
- [x] **Step 5.2:** Verify all tasks have `createdAt` field (ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ)
- [x] **Step 5.3:** Verify completed tasks have `completedAt` field (ISO 8601 format)
- [x] **Step 5.4:** Verify active tasks have `completedAt: null`
- [x] **Step 5.5:** Verify task text is present (1-500 characters)
- [x] **Step 5.6:** Verify task status is either "active" or "completed"
- [x] **Result:** PASS

## Test Scenario 6: Adjust WIP Limit in Settings
- [x] **Step 6.1:** Open Settings modal (click Settings icon/link)
- [x] **Step 6.2:** Verify current WIP limit displayed correctly (should be 6)
- [x] **Step 6.3:** Verify current active task count displayed: "You currently have 6 active tasks"
- [x] **Step 6.4:** Change WIP limit to 8
- [x] **Step 6.5:** Click "Save"
- [x] **Step 6.6:** Verify success message: "Settings saved!"
- [x] **Step 6.7:** Close Settings modal
- [x] **Step 6.8:** Verify WIP count indicator updates to "6 of 8 active tasks"
- [x] **Step 6.9:** Verify "Add Task" button is enabled (now under limit)
- [x] **Step 6.10:** Add 2 more tasks to reach new limit of 8
- [x] **Step 6.11:** Verify blocking message appears again at new limit
- [x] **Result:** FAIL - the screen needs to be refreshed for steps 6.8, 6.9, 6.10, 9.11 to be completed.  Also, even though the `hasSeenWIPLimitEducation` configuration setting has been set to `true`, the education message still appears when limit is reached.

## Test Scenario 7: WIP Count Indicator Real-Time Updates
- [x] **Step 7.1:** Verify indicator visible in UI header (all screen sizes)
- [x] **Step 7.2:** Verify color coding: green when well below limit (0-60%)
  - Current: 6/8 = 75% (should be yellow/orange, approaching limit)
- [x] **Step 7.3:** Complete 2 tasks → verify indicator shows "6 of 8" → should be green/yellow
- [x] **Step 7.4:** Add tasks to reach limit → verify indicator shows "8 of 8" → should be orange
- [x] **Step 7.5:** Verify clicking indicator opens Settings modal
- [x] **Step 7.6:** Verify tooltip on hover: "Work In Progress limit helps you stay focused"
- [x] **Result:** PASS

## Test Scenario 8: Encouraging Messaging Tone Validation
- [x] **Step 8.1:** Review WIP limit message when at limit
- [x] **Step 8.2:** Verify message uses supportive language ("helps you focus", "maintain focus")
- [x] **Step 8.3:** Verify message does NOT use punitive language ("can't", "forbidden", "blocked")
- [x] **Step 8.4:** Verify message styling: calming colors (not red/harsh colors)
- [x] **Step 8.5:** Verify friendly icon present (💡 or similar)
- [x] **Step 8.6:** Verify message includes helpful context or guidance
- [x] **Result:** PASS

## Overall Results
- **Total Scenarios:** 8
- **Passed:** 6
- **Failed:** 2
- **Pass Rate:** 75%
- **Critical Issues Found:**
  - Unable to test analytics service as there is no front-end access, as there's no back-end API exposing the service.
  - Even after pressing the "Got it" button in the WIP limit education message and the `/api/config/education` API called to set the `hasSeenWIPLimitEducation` to `true` (confirmed in `config.json`), the education message re-appears when the limit is reached.
- **Non-Critical Issues Found:**
  - There should be an explicit test for clicking on the "Got it" button to set the "has seen WIP limit education" configuration setting.

## Sign-Off
- **Tester Signature:** Kevin
- **Date:** 2026-01-30
- **Recommendation:** FAIL
