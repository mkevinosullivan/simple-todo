# Project Brief: Simple To-Do App

## Executive Summary

This project will create a Node.js/TypeScript to-do application that reimagines task management through psychological design principles. Rather than being a passive list that grows into an overwhelming source of despair, this app will actively engage users with celebration mechanics, WIP limits, and proactive prompting to prevent procrastination and maintain emotional well-being. The application demonstrates that even simple projects can incorporate sophisticated user experience thinking when approached methodically through the BMad framework.

**Target Market:** Individual users struggling with traditional to-do apps - chronic procrastinators, overwhelmed professionals, and productivity enthusiasts seeking data-driven insights.

**Key Value Proposition:** Transform to-do lists from "joyless checkboxes" into supportive productivity partners that prevent overwhelm, celebrate progress, and proactively help users complete what matters.

## Problem Statement

**Current State:** Traditional to-do applications are passive lists that users interact with episodically without intelligent intervention or contextual support. While different users experience different primary challenges (some face list bloat, others struggle with context switching, still others lack motivation), most existing apps treat all tasks as equal priorities in a single undifferentiated view.

**Pain Points Across User Types:**

**For Chronic Procrastinators:**
- **Motivation Deficit:** Completions go unrecognized, missing opportunities for positive reinforcement that could build momentum
- **Passive Forgetting:** Users add tasks then avoid the app, leading to accumulation and eventual abandonment
- **Emotional Discouragement:** Uncompleted lists can become sources of guilt rather than empowerment

**For Overwhelmed Professionals:**
- **Context Chaos:** Tasks lack contextual intelligence (location, time, urgency), forcing users to mentally filter their entire list each time
- **Analysis Paralysis:** Long task lists without smart prioritization create decision fatigue - users don't know where to start
- **Mental Overwhelm:** No constraints on list growth, enabling accumulation that feels insurmountable

**For Productivity Enthusiasts:**
- **Insight Blindness:** No visibility into productivity patterns, trends, or behavioral data that could inform optimization
- **Reactive Tools:** Apps wait for user discipline rather than offering proactive support based on historical behavior

**Impact:**
- Users cycle through multiple to-do apps seeking something better, experiencing "tool fatigue" without finding satisfactory solutions
- The tools intended to create accomplishment and control instead generate frustration when lists become unmanageable
- Important tasks get buried or forgotten while users focus on managing the list rather than completing work
- Lack of contextual awareness means users see irrelevant tasks ("grocery shopping") when they're at work, adding cognitive noise

**Why Existing Solutions Fall Short:**

Most to-do apps focus on organizational features (tags, folders, priorities, due dates) without addressing the core behavioral, emotional, and contextual challenges. They optimize for capturing tasks, not for completing them. They're reactive tools waiting for user discipline rather than proactive partners supporting user success. They treat all users and all tasks the same, without adapting to individual patterns or situational context.

**Urgency:**

This matters now because productivity tools should enhance well-being and effectiveness, not diminish them. As knowledge work intensifies and personal responsibilities multiply, people need tools that actively help them manage cognitive load and context switching rather than merely document tasks. The opportunity exists to build something genuinely helpful using modern tracking and behavioral design principles - while maintaining privacy-conscious data practices.

## Proposed Solution

**Core Concept:** Build a Node.js/TypeScript to-do application that acts as an active productivity partner rather than a passive list. The solution combines proven behavioral design patterns with one innovative differentiation: proactive engagement through intelligent prompting.

**Solution Architecture - Three Core Elements:**

1. **Data-Driven Foundation**
   - Rich behavioral tracking (task creation time, completion time, task characteristics, aging patterns)
   - Serves as infrastructure enabling all intelligent features
   - Privacy-conscious design: local storage, no external data transmission

2. **Constraint-Based Productivity (PROVEN)**
   - WIP (Work In Progress) limits prevent list bloat before it starts
   - Enforces manageable task counts (e.g., 5-10 max active tasks)
   - Validated by: Kanban methodology, Forest app's focus constraints, Sunsama's daily planning rituals

3. **Celebration-Driven Motivation (PROVEN)**
   - Immediate positive reinforcement when tasks are completed
   - Builds momentum through psychological reward mechanisms
   - Validated by: Habitica's gamification (millions of users), Todoist's Karma system, Forest's tree-growth visualization

4. **Proactive Intelligent Prompting (INNOVATIVE/UNVALIDATED)**
   - App initiates interaction: "Could you do [task] now?"
   - Uses timing algorithms and task characteristics to surface relevant prompts
   - **Key differentiation:** No successful competitor does this - it's our innovation bet
   - **Risk acknowledgment:** Could be perceived as annoying if poorly implemented; requires careful UX design

**Why This Solution Will Succeed Where Others Haven't:**

**Validated by Successful Products:**
- **Celebration mechanics work:** Habitica (RPG gamification), Todoist Karma, and Forest app prove that positive reinforcement drives engagement and completion
- **Helpful constraints work:** Forest's phone lockout and Kanban WIP limits show users accept and benefit from thoughtful restrictions
- **Focused views work:** Things 3's "Today" view and Sunsama's daily planning demonstrate that hiding the full list reduces overwhelm

**Our Unique Angle:**
Traditional to-do apps are **passive** - they wait for users to remember, decide, and act. Our brainstorming Five Whys analysis revealed that passive tools enable the forgetting → accumulation → overwhelm → despair cycle. By adding **proactive prompting**, we break this cycle with active engagement.

**Competitive Positioning:**
- vs. **Habitica:** Professional tone without RPG theming that polarizes users
- vs. **Todoist:** Proactive engagement vs. passive metrics
- vs. **Things 3:** Algorithmic assistance vs. manual curation only
- vs. **Forest:** Task completion focus vs. time-blocking focus

**High-Level Product Vision:**

An emotionally supportive to-do app that feels like a helpful accountability partner. Users experience:
- Opening the app without guilt (manageable list via WIP limits)
- Being pleasantly surprised by timely, relevant prompts
- Feeling genuine satisfaction when completing tasks (celebrations)
- Understanding their productivity patterns through data insights (Phase 2+)
- Context-intelligent task surfacing (home/work/errands) (Phase 2+)

**Known Challenges & Mitigation:**

*Gaming Vulnerability:* Users might complete tasks for celebrations then immediately re-add them.
- *Mitigation:* Track task text similarity; detect and gently discourage this pattern

*Proactive Prompting Risk:* Could be annoying rather than helpful.
- *Mitigation:* User control over prompt frequency; learn from dismissals; start conservatively

*Algorithmic Control Trade-off:* Some users prefer manual curation (Things 3 model).
- *Mitigation:* Provide both algorithmic suggestions AND manual override capability

## Target Users

Our research identified three distinct user segments, each experiencing different primary pain points but sharing a common frustration with existing to-do app solutions.

### Primary User Segment: The Overwhelmed Professional

**Demographic/Firmographic Profile:**
- Age: 28-45 years old
- Occupation: Knowledge workers, managers, freelancers juggling multiple clients/projects
- Tech proficiency: Moderate to high - comfortable with productivity tools
- Context: Works across multiple life domains (career, personal, family responsibilities)
- Income: Middle to upper-middle class, willing to invest in productivity solutions

**Current Behaviors and Workflows:**
- Maintains multiple task lists across different apps/systems (work tasks, personal errands, family coordination)
- Frequently switches contexts (office → home → errands → meetings)
- Adds tasks rapidly when they think of them, often in the wrong context
- Opens to-do app multiple times per day but struggles to decide what to work on
- Has tried 5+ different to-do apps in past 2 years seeking something that "clicks"

**Specific Needs and Pain Points:**
- **Context chaos:** Sees irrelevant tasks when in wrong location/mode (grocery list at office, work tasks at home)
- **Decision fatigue:** Every app opening requires scanning entire list and deciding "what now?"
- **Fragmented systems:** Different lists for different life areas creates cognitive overhead
- **Time sensitivity stress:** Due dates and urgent items get lost in undifferentiated lists
- **Guilt and avoidance:** Opening the app triggers stress rather than clarity

**Goals They're Trying to Achieve:**
- See the right tasks at the right time without manual filtering
- Make quick decisions about "what to do now" without analysis paralysis
- Maintain control across work/life domains without feeling overwhelmed
- Reduce cognitive load of task management itself
- Feel accomplished rather than perpetually behind

### Secondary User Segment: The Chronic Procrastinator

**Demographic/Firmographic Profile:**
- Age: 22-40 years old
- Occupation: Students, early-career professionals, creative workers
- Tech proficiency: Moderate - uses apps but doesn't optimize them
- Psychology: Self-aware about procrastination tendencies, seeks external accountability
- Income: Budget-conscious, prefers free or low-cost solutions

**Current Behaviors and Workflows:**
- Enthusiastically adopts new to-do apps then abandons them within weeks
- Adds tasks but avoids opening the app when list gets long (passive avoidance)
- Creates elaborate task organization systems that they don't maintain
- Works in bursts when anxiety peaks, then crashes when overwhelmed
- Feels shame about uncompleted tasks but struggles to build consistent habits

**Specific Needs and Pain Points:**
- **Motivation deficit:** Lacks internal discipline to maintain consistent task completion
- **Overwhelm triggers avoidance:** Large lists create paralysis, leading to app abandonment
- **No positive feedback loop:** Completions feel hollow without recognition/celebration
- **Low barrier to entry needed:** App must feel safe to open even when behind on tasks
- **External prompting required:** Needs reminders/nudges to engage, won't self-initiate reliably

**Goals They're Trying to Achieve:**
- Build sustainable task completion habits through external support
- Experience small wins and positive reinforcement to build momentum
- See manageable daily goals rather than overwhelming master lists
- Get gentle accountability without judgment or shame
- Prevent list bloat before it triggers abandonment

## Goals & Success Metrics

### Business Objectives

- **Demonstrate BMad methodology depth:** Successfully showcase that even a "simple to-do app" can incorporate sophisticated user research, behavioral design, and strategic thinking when approached systematically
- **Create functional MVP within 4-6 weeks:** Deliver working application with core features (data tracking, WIP limits, celebrations, proactive prompting) suitable for user testing
- **Validate innovation hypothesis:** Gather user feedback data showing whether proactive prompting increases task completion rates compared to passive to-do apps (target: 15%+ improvement)
- **Build reusable technical foundation:** Create data tracking infrastructure and TypeScript architecture that can scale to Phase 2+ features without major refactoring
- **Generate portfolio/showcase artifact:** Produce a compelling case study demonstrating problem discovery → research → design → implementation workflow

### User Success Metrics

- **Reduced abandonment:** Users continue using app for 30+ days (vs. estimated 7-14 day abandonment for typical productivity apps)[^1]
- **Maintained task completion rate:** Users complete ≥60% of tasks they create (estimated industry baseline: 40-50% completion)[^2]
- **Prevented list bloat:** Average active task count remains under WIP limit threshold, preventing overwhelm state
- **Positive emotional response:** User feedback indicates app feels "supportive" and "helpful" rather than "stressful" or "guilt-inducing"
- **Engagement with proactive features:** Users respond positively to ≥40% of proactive prompts (complete task or engage with prompt vs. ignore/dismiss)

### Key Performance Indicators (KPIs)

- **Task completion rate:** (Tasks completed / Tasks created) × 100 - Target: ≥60%
- **Average task lifetime:** Time from creation to completion - Target: <7 days for 70% of tasks
- **App retention rate:** Percentage of users still active after 30 days - Target: ≥50%
- **WIP limit effectiveness:** Percentage of time users are at/near WIP limit - Target: 60-80% (indicates healthy constraint usage without excessive frustration)
- **Celebration engagement:** User interaction with celebration messages (not immediately dismissed) - Target: ≥70% acknowledgment rate
- **Prompt response rate:** (Prompts acted upon / Total prompts shown) - Target: ≥40% positive response
- **List bloat prevention:** Average active task count stays under 10 - Target: Mean 5-8 tasks
- **Feature utilization:** Percentage of users who engage with all four core features within first week - Target: ≥80%

---

**Research Notes:**

[^1]: **App abandonment rates - NEEDS CITATION**: Research required on typical productivity app retention curves. Anecdotal evidence suggests most users abandon new productivity tools within 2 weeks, but we need published data to validate this claim. Recommended research: App store analytics, academic studies on habit formation with productivity tools, or published retention data from major task management platforms.

[^2]: **Task completion rates - NEEDS CITATION**: Industry baseline estimates require validation. Recommended research sources:
  - Academic studies on task management and goal completion rates
  - Published statistics from Todoist, Asana, Microsoft To-Do, or other major platforms
  - Behavioral psychology research on implementation intentions and task completion
  - Alternative approach: Establish our own baseline through competitive app testing or pilot user study

## MVP Scope

### Core Features (Must Have)

- **Data Tracking Infrastructure:** Comprehensive behavioral tracking system that captures task metadata (creation timestamp, completion timestamp, task text/length, status changes, aging patterns). Serves as foundation enabling all intelligent features. Local storage with privacy-first design (JSON file or SQLite). *Rationale: Infrastructure requirement for all other features; demonstrates "data-first" approach from day one.*

- **Task CRUD Operations:** Basic create, read, update, delete functionality with clean command-line or simple web interface. Add tasks, mark complete, delete tasks, view current list. *Rationale: Baseline functionality required for any to-do app; foundation for advanced features.*

- **WIP (Work In Progress) Limits:** Enforced maximum of 5-10 active tasks at any time. When limit is reached, users must complete or delete a task before adding new ones. Helpful feedback messages ("You have 5 active tasks - complete one before adding more to maintain focus!"). *Rationale: Addresses core problem of overwhelm; simple business logic; proven effective by Kanban methodology and competitive products.*

- **Completion Celebrations:** Immediate positive reinforcement when tasks are marked complete. Encouraging messages, visual feedback, or simple "wins" tracking. Variety of celebration messages to avoid repetition. *Rationale: Emotional engagement hook; builds momentum through psychological reward; easy to implement with high user impact; validated by Habitica/Todoist success.*

- **Proactive Prompting System:** Background process or scheduled mechanism that periodically selects a task and prompts user: "Could you do [task] now?" User can respond yes (complete it), no (dismiss), or snooze. Initial implementation uses simple random selection; Phase 2 will add intelligent selection based on task age, length, or patterns. *Rationale: Our key innovation differentiator; tests unvalidated hypothesis about active engagement; distinguishes us from all passive competitors.*

### Out of Scope for MVP

- **Daily Focus Mode** - Curated 1-3 task daily view (Phase 2: overlaps with WIP limits conceptually; defer until we validate core features)
- **Context-Aware Filtering** - Location-based (home/work/errands) task visibility (Phase 2+: requires tagging system and potentially location detection)
- **Visual Trend Analysis** - Graphs showing task inventory over time (Phase 2+: requires historical data accumulation over weeks)
- **Smart Prompting Algorithms** - ML or pattern-based intelligent task selection for prompts (Phase 2: start with random, add intelligence after validating basic prompting)
- **Multi-user / Collaboration** - Shared lists, delegation, team features (Phase 3+: scope expansion)
- **Mobile Apps** - Native iOS/Android applications (Phase 3+: start with cross-platform CLI or web)
- **Calendar Integration** - Sync with Google Calendar, Outlook, etc. (Phase 2+: integration complexity)
- **Third-party Integrations** - Zapier, IFTTT, API access (Phase 3+: requires API design)
- **Task Recurrence** - Repeating tasks (Phase 2: adds complexity to data model)
- **Subtasks / Nested Tasks** - Task hierarchy (Phase 2+: UI and data model complexity)

### MVP Success Criteria

**The MVP will be considered successful if it demonstrates:**

1. **Technical Validation:**
   - All four core features (data tracking, CRUD, WIP limits, celebrations, proactive prompting) are functional and stable
   - Data tracking accurately captures timestamps and metrics
   - Proactive prompting runs reliably without crashes or excessive resource usage

2. **User Validation (Pilot Testing with 5-10 users over 2 weeks):**
   - ≥3 out of 5 users continue using the app for full 2-week test period
   - Users report positive emotional response to celebrations (feedback survey)
   - Proactive prompting generates ≥30% positive response rate (users act on prompts at least 30% of the time)
   - WIP limits successfully prevent list bloat (average task count stays under 10)

3. **Innovation Validation:**
   - Proactive prompting is deemed "helpful" vs. "annoying" by majority of testers
   - Data collected provides sufficient insights to inform Phase 2 feature decisions
   - We can articulate clear learnings about what worked and what needs refinement

4. **Methodology Demonstration:**
   - Complete documentation trail from brainstorming → problem statement → design → implementation
   - Demonstrates BMad's systematic approach to even "simple" projects
   - Produces shareable case study showcasing depth of thinking

**Decision Gate:** After MVP validation, we'll decide whether to:
- Proceed to Phase 2 with enhanced features (if proactive prompting validates)
- Pivot approach (if proactive prompting fails, focus on proven features only)
- Expand scope (if user demand justifies mobile apps, integrations, etc.)

## Post-MVP Vision

### Phase 2 Features (Next Priority Wave)

**Smart Prompting Algorithms**
Building on the basic random prompting from MVP, implement intelligent task selection based on:
- Task age (surface long-outstanding items to prevent procrastination)
- Task complexity/length (alternate between quick wins and larger items)
- User behavioral patterns from data tracking (when are they most likely to engage?)
- Time of day optimization (morning prompts vs. evening prompts based on user patterns)

*Rationale: If basic prompting validates in MVP, intelligence layer makes it significantly more valuable. Leverages the data foundation we're building from day one.*

**Daily Focus Mode**
Curated daily view showing 1-3 priority tasks selected algorithmically or manually:
- Hide full task list by default to reduce overwhelm
- "Today's Focus" landing screen when app opens
- Toggle to view full list when needed
- New selection each day creates fresh start feeling

*Rationale: Complements WIP limits by providing even narrower focus. Addresses Chronic Procrastinator persona's need for low cognitive load. Proven successful by Things 3's "Today" view.*

**Visual Trend Dashboard**
Graphical analytics showing productivity patterns over time:
- Task inventory line graph (trending up/down/stable)
- Completion rate trends by week/month
- Average task lifetime visualization
- "Wins" counter showing cumulative accomplishments
- Warning indicators when patterns suggest overwhelm approaching

*Rationale: Serves Productivity Enthusiast persona. Turns abstract data into emotional connection. Gamification element ("can I make the line go down?"). Requires several weeks of data accumulation, hence Phase 2.*

**Context-Aware Tagging System**
Foundation for intelligent task filtering:
- Tag tasks as "home," "work," "errands," "anywhere"
- Manual tagging with smart suggestions based on task text
- Filtered views showing context-relevant tasks
- Preparation for Phase 3 automatic context detection

*Rationale: Addresses Overwhelmed Professional's context chaos pain point. Enables right-task-right-place-right-time experience.*

### Long-term Vision (12-24 Months)

**An Emotionally Intelligent Productivity Partner**

The app evolves from a simple task manager into an adaptive system that:
- **Understands user patterns:** Learns when you're most productive, what types of tasks you avoid, what completion patterns look like for different task categories
- **Adapts to life rhythms:** Recognizes busy weeks vs. calm weeks, adjusts expectations and prompting accordingly
- **Provides genuine support:** Celebrates wins meaningfully, offers encouragement during slow periods without nagging, knows when to back off vs. when to nudge
- **Surfaces insights:** "You tend to complete creative tasks in the morning and admin tasks in the afternoon - want to reorganize your list accordingly?"
- **Prevents problems proactively:** "Your task count is trending upward for three weeks - time to review and declutter?"

**From Individual Tool to Platform** (Aspirational):
- Optional anonymized data sharing to understand universal productivity patterns
- Aggregated insights: "Users complete financial tasks 40% faster on Friday afternoons"
- Benchmark comparisons: "Your completion rate is above average for creative professionals"
- Community features: Share successful strategies without exposing private task content

### Expansion Opportunities

**Mobile Native Apps**
- iOS and Android applications with notification support
- Location awareness for automatic context detection ("You're at the grocery store - here are your errands")
- Widget support for glanceable task views
- Sync between devices (requires backend infrastructure)

**Calendar Integration**
- Two-way sync with Google Calendar, Outlook, Apple Calendar
- Time-blocking features: reserve calendar time for specific tasks
- Deadline integration from calendar events
- Schedule-aware prompting: don't prompt during meetings

**Team/Collaboration Features**
- Shared task lists for households or small teams
- Delegation and assignment capabilities
- Team celebration mechanics (shared wins)
- Respect for individual privacy while enabling coordination

**API and Integration Ecosystem**
- Public API for third-party integrations
- Zapier/IFTTT connectivity
- Webhook support for automation
- Developer platform for community-built extensions

**Premium Tier / Monetization** (If pursuing commercial path):
- Free tier: Core features (CRUD, WIP limits, basic celebrations)
- Premium tier: Smart algorithms, trend analytics, integrations, unlimited data history
- Freemium model balances accessibility with sustainability

## Technical Considerations

*Note: This section includes technical details for development planning. Non-technical readers can focus on the "Rationale" explanations which clarify the practical implications of each choice.*

### Platform Requirements

- **Target Platforms:** Cross-platform Node.js[^3] application
  - Initial MVP: Command-line interface (CLI)[^4] for maximum simplicity and demonstration focus
  - Alternative: Simple web interface (localhost Express server with minimal frontend)
  - Future: Native desktop apps (Electron) or mobile apps (React Native)

- **Runtime Environment:** Node.js 18+ (LTS), TypeScript[^5] 5+
  - Reason: Modern async/await support, strong typing for maintainability, excellent package ecosystem

- **Browser/OS Support (if web interface):**
  - Modern browsers: Chrome/Edge 100+, Firefox 100+, Safari 15+
  - OS: Windows 10+, macOS 12+, Linux (Ubuntu 20.04+)

- **Performance Requirements:**
  - App startup: <2 seconds
  - Task operations (add/complete/delete): <100ms response time (essentially instant to users)
  - Proactive prompting: Background process should use <50MB memory (minimal resource usage)
  - Data file operations: Handle up to 10,000 tasks without performance degradation

### Technology Preferences

- **Frontend (if web interface):**
  - Minimal approach: HTML + vanilla JavaScript/TypeScript for simplicity
  - OR: React with minimal dependencies (avoid complex state management initially)
  - CSS: Tailwind CSS or simple custom CSS (avoid heavy frameworks)
  - *Rationale: Keep frontend lightweight to focus on behavioral features, not UI complexity*

- **Backend/Core Logic:**
  - Node.js + TypeScript for type safety and modern development experience
  - No separate backend server for MVP (single-process application or localhost-only)
  - *Rationale: TypeScript prevents common bugs by catching errors before runtime, Node.js enables both CLI and web paths*

- **Database/Storage:**
  - **Option 1 (Simpler):** JSON[^6] file storage with structured format
    - Pros: No dependencies, easy debugging, human-readable, version controllable
    - Cons: Manual data integrity management, no built-in querying
  - **Option 2 (More robust):** SQLite[^7] with better-sqlite3 package
    - Pros: ACID compliance[^8], efficient querying, handles concurrent access, scalable
    - Cons: Adds dependency, requires schema management
  - **Recommendation:** Start with JSON for MVP simplicity, migrate to SQLite if performance becomes issue
  - *Privacy note: Local storage only, no cloud sync in MVP*

- **Hosting/Infrastructure:**
  - MVP: Runs locally on user's machine (no hosting needed)
  - Future: If web-based, consider: Vercel/Netlify (static hosting), Railway/Fly.io (if backend needed)
  - *Rationale: Local-first approach aligns with privacy commitment and simplifies MVP*

### Architecture Considerations

- **Repository Structure:**
  ```
  simple-todo/
  ├── src/
  │   ├── core/           # Business logic (task management, WIP limits)
  │   ├── data/           # Data layer (storage abstraction)
  │   ├── features/       # Feature modules (celebrations, prompting)
  │   ├── cli/            # CLI interface (if chosen)
  │   ├── web/            # Web interface (if chosen)
  │   └── types/          # TypeScript type definitions
  ├── tests/              # Unit and integration tests
  ├── docs/               # Documentation (this brief, architecture, etc.)
  └── data/               # User data storage (gitignored)
  ```
  - *Rationale: Modular structure supports testing, allows swapping interface (CLI ↔ web)*

- **Service Architecture:**[^9]
  - **TaskService:** Core CRUD[^10] operations, WIP limit enforcement
  - **DataService:** Abstraction layer for storage (enables JSON → SQLite migration)
  - **CelebrationService:** Manages celebration messages and display logic
  - **PromptingService:** Background scheduler and task selection algorithm
  - **AnalyticsService:** Data tracking and metrics calculation (foundation for Phase 2 trends)
  - *Rationale: Service-oriented architecture supports testing and feature independence*

- **Proactive Prompting Technical Approach:**
  - **Option 1:** Node.js `setInterval` or `setTimeout` for periodic prompts (simpler, works for CLI)
  - **Option 2:** Separate background process using `node-cron` or system scheduler (more robust)
  - **Option 3:** Event-driven approach triggered by app interactions (less intrusive)
  - **Recommendation:** Start with Option 1 for MVP, evaluate based on user feedback
  - *Challenge: Prompting in CLI requires user to have terminal open; web interface more natural for notifications*

- **Integration Requirements:**
  - MVP: None (standalone application)
  - Phase 2: Notification system integration (desktop notifications, Pushover, etc.)
  - Phase 3: Calendar APIs[^11] (Google Calendar, Outlook), third-party webhooks

- **Security/Compliance:**
  - **Data Privacy:** All data stored locally, no telemetry or external transmission in MVP
  - **Future Considerations:** If building SaaS platform, need: encryption at rest, GDPR[^12] compliance, anonymization strategy, user consent management
  - **Input Validation:** Sanitize task text to prevent injection attacks[^13] if building web interface
  - **Authentication:** Not needed for MVP (single-user local app); required for multi-user future

### Development Tooling

- **Build System:** TypeScript compiler (tsc) with ts-node for development
- **Testing:** Jest for unit tests, coverage target 70%+ for core business logic
- **Linting:** ESLint with TypeScript rules, Prettier for formatting[^14]
- **Version Control:** Git with conventional commits for clean history
- **CI/CD:**[^15] GitHub Actions for automated testing (if repo is public)

---

### Technical Terms Glossary

[^3]: **Node.js** - A JavaScript runtime that allows running JavaScript code outside of web browsers. Think of it as the engine that powers the application on your computer rather than in a browser.

[^4]: **CLI (Command-Line Interface)** - A text-based interface where users type commands rather than clicking buttons. Like the "Terminal" on Mac or "Command Prompt" on Windows. Example: typing `todo add "Buy groceries"` instead of clicking an "Add Task" button.

[^5]: **TypeScript** - A programming language that adds type checking to JavaScript. It catches common errors (like trying to add text to a number) before the code runs, making applications more reliable.

[^6]: **JSON (JavaScript Object Notation)** - A simple text format for storing data that both humans and computers can easily read. Example: `{"task": "Buy groceries", "completed": false}`. Can be opened in any text editor.

[^7]: **SQLite** - A lightweight database system stored in a single file. More sophisticated than JSON for managing data, with built-in features for searching, sorting, and ensuring data integrity.

[^8]: **ACID Compliance** - A set of database reliability guarantees standing for Atomicity, Consistency, Isolation, Durability. Practical meaning: The database ensures operations complete fully (no half-saved data), data stays valid, and saved data won't be lost even if the app crashes.

[^9]: **Service Architecture** - A design pattern where the application is organized into separate, specialized components (services) that each handle one area of functionality. Like having separate departments in a company, each service has clear responsibilities.

[^10]: **CRUD** - Stands for Create, Read, Update, Delete - the four basic operations for managing data. In our app: Create new tasks, Read/view tasks, Update task details, Delete completed tasks.

[^11]: **API (Application Programming Interface)** - A way for different software applications to communicate with each other. Like a waiter taking your order to the kitchen - you don't need to know how the kitchen works, you just use the menu (API) to make requests.

[^12]: **GDPR (General Data Protection Regulation)** - European privacy law that requires companies to protect user data, get consent for data collection, and allow users to delete their data. Applies to any app with European users.

[^13]: **Injection Attacks** - A security vulnerability where malicious users insert harmful code into input fields (like task names) to compromise the system. Prevention involves "sanitizing" (cleaning) user input before storing or processing it.

[^14]: **Linting/Formatting** - Automated code quality tools. ESLint checks for programming errors and enforces coding standards. Prettier automatically formats code consistently (like spell-check and auto-formatting for code).

[^15]: **CI/CD (Continuous Integration/Continuous Deployment)** - Automated systems that test code every time changes are made and can automatically deploy updates. Like having a robot quality inspector that checks every change before it goes live.

## Constraints & Assumptions

### Constraints

**Budget:**
- **Demonstration/Portfolio Project:** No formal budget allocated; this is a showcase project demonstrating BMad methodology
- **Development costs:** Sweat equity only (no paid developers initially)
- **Infrastructure costs:** $0 for MVP (local-only application, no hosting required)
- **Tooling costs:** $0 (all development tools are free/open-source: Node.js, TypeScript, VS Code, Jest, Git)
- **Future considerations:** If pursuing commercial path, would need budget for: hosting, domain, potential third-party services (analytics, notifications), marketing

**Timeline:**
- **MVP target:** 4-6 weeks from project kickoff to functional MVP
- **Pilot testing:** Additional 2 weeks for user testing and feedback collection
- **Total to validated MVP:** Approximately 6-8 weeks
- **Constraint:** Solo developer timeline (assumes part-time availability, not full-time dedication)
- **Risk factor:** Proactive prompting feature is technically complex and could extend timeline if issues arise

**Resources:**
- **Development team:** Solo developer (or small team of 1-2 people)
- **Design resources:** Minimal UI/UX design needed for MVP (CLI or simple web interface)
- **Testing resources:** 5-10 pilot users from personal network for initial validation
- **No dedicated:** QA team, product manager, designer (all roles covered by developer/team)
- **Skills required:** TypeScript/Node.js proficiency, understanding of behavioral design principles, data modeling

**Technical:**
- **Platform limitation:** Starting with single-user local application (no multi-user, no cloud sync)
- **Interface limitation:** CLI or basic web interface only (no native mobile apps in MVP)
- **Data scale:** Designed for individual users with <10,000 tasks total (not enterprise-scale)
- **Background processing:** Limited by platform choice (CLI prompting requires terminal to stay open)
- **No external dependencies:** Cannot rely on paid third-party services for MVP (keeping costs at $0)

### Key Assumptions

**User Behavior Assumptions:**

- **Users will accept constraints:** We assume WIP limits will be perceived as helpful rather than restrictive, based on Kanban methodology success
- **Celebration resonance:** We assume positive reinforcement messages will motivate users without feeling patronizing or gimmicky (risk: could backfire if tone is wrong)
- **Proactive prompting acceptance:** We assume users will appreciate active engagement rather than finding it annoying (UNVALIDATED - biggest assumption risk)
- **Local-only acceptance:** We assume initial users are comfortable with local-only storage and don't require cloud sync for MVP
- **Pilot user availability:** We assume we can recruit 5-10 users from personal network willing to test for 2 weeks

**Technical Assumptions:**

- **TypeScript/Node.js sufficient:** We assume this tech stack can deliver all MVP features without performance issues
- **JSON storage adequate:** We assume simple JSON file storage handles MVP data needs (might need SQLite if assumption proves wrong)
- **4-6 week timeline realistic:** We assume solo developer can build four core features in this timeframe (risk: proactive prompting complexity)
- **70% test coverage achievable:** We assume we can write sufficient tests while delivering features in timeline
- **Background prompting viable:** We assume setInterval-based prompting works acceptably for MVP (might need more sophisticated solution)

**Market/Product Assumptions:**

- **Problem is real:** We assume our brainstorming-identified pain points (overwhelm, motivation deficit, context chaos) are genuine and widespread
- **Solution approach is viable:** We assume combining WIP limits + celebrations + proactive prompting addresses these pain points effectively
- **Differentiation matters:** We assume proactive engagement is sufficiently different from existing apps to justify building this
- **BMad demonstration value:** We assume documenting the methodology process itself has value beyond the product

**Validation Assumptions:**

- **2-week pilot sufficient:** We assume 2 weeks is long enough to assess retention and feature effectiveness
- **5-10 users sufficient:** We assume this sample size provides meaningful validation for MVP hypotheses
- **Self-reported data reliable:** We assume user feedback surveys accurately capture emotional response to celebrations and prompting
- **Completion rate measurement accurate:** We assume our data tracking correctly captures task completion behavior

**Phase 2/Future Assumptions:**

- **MVP validates approach:** We assume MVP testing will provide clear signal about whether to proceed to Phase 2
- **Phase 2 funding available:** If pursuing beyond MVP, we assume ability to invest more time/resources (this is NOT guaranteed)
- **Scope expansion justified:** We assume user demand will guide Phase 2 priorities (might pivot based on feedback)
- **Commercial viability possible:** We assume there's potential market for a freemium productivity app (but not banking on it)

## Risks & Open Questions

### Key Risks

- **Proactive Prompting Rejection Risk (HIGH PRIORITY):** Users may find random task prompts annoying rather than helpful, potentially causing app abandonment. No successful competitor validates this approach. *Impact: Could invalidate our core differentiation and require pivot to proven features only.* *Mitigation: Start with conservative prompting frequency, provide easy opt-out/configuration, gather explicit feedback in pilot testing, be prepared to pivot if >50% of users disable prompting.*

- **Timeline Overrun Risk (MEDIUM-HIGH):** 4-6 weeks for four features may be optimistic for solo developer, especially given proactive prompting technical complexity (background processes, notification systems). *Impact: Delayed MVP launch, potential burnout, reduced pilot testing time.* *Mitigation: Consider cutting proactive prompting to Phase 2 if timeline pressure mounts, prioritize data + WIP + celebrations as viable MVP fallback, build in buffer time.*

- **Gaming Vulnerability Risk (MEDIUM):** Users might exploit celebration mechanics by completing and immediately re-adding tasks to get positive reinforcement without real productivity. *Impact: Undermines trust in data metrics, creates false sense of accomplishment, defeats purpose of app.* *Mitigation: Track task text similarity, detect patterns, gentle discouragement rather than harsh blocking, accept some gaming as acceptable trade-off for motivation boost.*

- **WIP Limit Frustration Risk (MEDIUM):** Users might experience WIP limits as restrictive rather than protective, leading to workarounds (deleting tasks to add new ones, using external lists). *Impact: Feature rejection, app abandonment, users finding ways to circumvent intended constraints.* *Mitigation: Make limit configurable (5-10 range), provide clear explanation of benefits, test with pilot users to find optimal default.*

- **CLI Background Prompting Technical Risk (MEDIUM):** Command-line interface requires terminal to stay open for background prompting to work, limiting usability. *Impact: Proactive prompting feature essentially non-functional in CLI context, forcing web interface development.* *Mitigation: Consider web interface as primary MVP approach instead of CLI, or accept prompting limitation in CLI and focus on other features.*

- **Small Sample Bias Risk (MEDIUM):** Pilot testing with 5-10 users from personal network may not represent broader market, providing false validation. *Impact: Build Phase 2 based on biased feedback, miss critical issues that emerge with diverse users.* *Mitigation: Explicitly recruit diverse personas (procrastinator, overwhelmed professional, enthusiast), seek candid critical feedback, acknowledge limitations in conclusions.*

- **Celebration Tone Risk (LOW-MEDIUM):** Encouragement messages might feel patronizing, childish, or gimmicky to certain user types, especially professionals. *Impact: Emotional engagement feature backfires, creates negative association with app.* *Mitigation: Test multiple celebration styles (professional, playful, minimal), make tone configurable, gather explicit feedback on message resonance.*

- **Scope Creep Risk (LOW-MEDIUM):** Adding "just one more feature" during development could derail timeline and MVP focus. *Impact: Extended timeline, feature bloat, loss of MVP simplicity.* *Mitigation: Strict adherence to defined MVP scope, document Phase 2 ideas but don't implement, decision gate review before adding anything.*

### Open Questions

**User Experience Questions:**

- **How frequently should proactive prompting occur?** Daily? Twice daily? Hourly? What frequency is helpful vs. annoying? (Needs pilot testing to determine)

- **What celebration message tone resonates best?** Professional and minimal? Enthusiastic and playful? Data-driven (metrics)? Or personalized/varied? (Needs user feedback)

- **What's the optimal WIP limit number?** Is 5 tasks too restrictive? Is 10 too permissive? Should it vary by user type? (Needs testing and behavioral observation)

- **Should prompting be opt-in or opt-out by default?** Start with prompting enabled and let users disable? Or require explicit activation? (Trade-off between showcasing innovation vs. respecting user preference)

- **How do users want to interact with prompts?** Simple yes/no? Snooze options? Reschedule? Different responses for different contexts? (Needs UX exploration)

**Technical Questions:**

- **CLI vs. Web interface for MVP?** CLI is faster to build but limits prompting functionality. Web enables better UX but adds complexity. Which path? (Needs early decision)

- **JSON vs. SQLite for storage?** Start simple with JSON or invest in SQLite from day one? When does migration become necessary? (Can defer until performance issues emerge)

- **How to implement background prompting in CLI?** Is setInterval sufficient or do we need system-level scheduler? What about when terminal closes? (Needs technical spike/prototyping)

- **What data fields should we track?** Beyond timestamps and task text, what metadata enables future features? Tag preparation? Priority fields? (Balance between future-proofing and YAGNI principle)

**Validation Questions:**

- **What constitutes MVP "success"?** Are our success criteria (30% prompt response, 3/5 retention) the right thresholds? Too low? Too high? (Needs benchmarking or expert input)

- **Is 2 weeks long enough for pilot testing?** Can we see meaningful retention and behavior patterns in 2 weeks, or do we need 4+ weeks? (Trade-off between speed and data quality)

- **How do we measure "emotional response"?** Surveys? In-app ratings? Observational feedback? What's most reliable? (Needs user research methodology planning)

- **What would cause us to pivot or stop?** What specific failure signals should trigger strategy change? (Needs explicit decision criteria)

**Strategic Questions:**

- **Is this a portfolio project or potential product?** Are we optimizing for demonstration value or commercial viability? This fundamentally affects decisions. (Needs stakeholder alignment)

- **Should we plan for open-source release?** Would sharing code/methodology enhance BMad demonstration value? Privacy implications? (Needs decision before launch)

- **What's the Phase 2 decision gate criteria?** Exactly what results from MVP would justify investing in Phase 2? (Should define now, not after MVP completes)

- **Who is the target audience for the BMad showcase?** Potential employers? Clients? Other product builders? This affects documentation depth. (Affects how we document the process)

### Areas Needing Further Research

- **Behavioral psychology of task completion:** What research exists on completion rates, procrastination patterns, effectiveness of external prompting? (Academic literature review needed)

- **Notification/prompting best practices:** What do push notification studies say about optimal frequency, timing, and tone? (UX research review)

- **To-do app abandonment data:** Can we find published statistics on why users abandon productivity apps? (Validate problem assumptions)

- **Privacy-preserving analytics approaches:** If we pursue SaaS platform vision, how do others handle anonymized behavioral data collection? (Technical research for future phases)

- **Celebration/gamification effectiveness:** What does research say about long-term effectiveness of reward systems? Do they maintain motivation or lose impact over time? (Psychological research)

- **WIP limit research:** Beyond Kanban case studies, what empirical data exists on optimal WIP limits for knowledge work? (Productivity research)

## Appendices

### A. Research Summary

This Project Brief draws on the following research and discovery work:

**Brainstorming Session Results** (January 13, 2026)
- **Location:** `docs/brainstorming-session-results.md`
- **Techniques Used:** Six Thinking Hats, Five Whys, Role Playing
- **Key Findings:**
  - Identified three core user personas: Overwhelmed Professional, Chronic Procrastinator, Productivity Enthusiast
  - Uncovered emotional dimension through Five Whys: to-do lists can create "despair and worthlessness" when they fail
  - Generated 15+ distinct feature ideas across proactive engagement, data-driven insights, and constraint-based productivity
  - Prioritized three features for MVP: Data tracking infrastructure, WIP limits, Completion celebrations
  - Identified proactive prompting as highest-risk/highest-reward innovation opportunity

**Market Research:**
- Competitive analysis of: Habitica (gamification), Todoist (karma system), Things 3 (daily focus), Forest (anti-procrastination), Sunsama (daily planning)
- Validated that celebration mechanics, focused views, and helpful constraints are proven successful
- Identified gap: No successful competitor uses proactive prompting approach

**User Insights:**
- Chronic Procrastinators need: Low cognitive load, external accountability, fresh starts, celebration/motivation
- Overwhelmed Professionals need: Context awareness, reduced decision fatigue, time-sensitive prioritization
- Productivity Enthusiasts need: Data insights, trend analysis, optimization opportunities

**Problem Validation:**
- Five Whys analysis revealed root cause: passive tools enable forgetting → accumulation → overwhelm → despair cycle
- Three distinct pain point categories: Motivation deficit, context chaos, insight blindness
- Common thread: Existing apps are reactive, waiting for user discipline rather than providing proactive support

### B. References

**Brainstorming Documentation:**
- Brainstorming Session Results: `docs/brainstorming-session-results.md`

**Competitive Products Referenced:**
- Habitica: https://habitica.com
- Todoist: https://todoist.com
- Things 3: https://culturedcode.com/things/
- Forest: https://www.forestapp.cc
- Sunsama: https://sunsama.com

**Methodology:**
- BMad Method Framework: (documentation location TBD)
- Project Brief Template: `.bmad-core/templates/project-brief-tmpl.yaml`

**Additional Resources Needed:**
- Research on task completion rates (see footnote [^2])
- App retention/abandonment data (see footnote [^1])
- Behavioral psychology research on external prompting effectiveness
- Notification best practices studies

## Next Steps

### Immediate Actions

1. **Resolve Critical Technical Decisions (Week 1)**
   - Decide: CLI vs. Web interface for MVP (recommendation: Web interface for better prompting UX)
   - Decide: JSON vs. SQLite for storage (recommendation: Start with JSON, migrate if needed)
   - Create technical spike/prototype for proactive prompting to validate feasibility
   - Set up development environment and project repository structure

2. **Conduct Needed Research (Week 1-2)**
   - Find citations for task completion rates and app abandonment statistics
   - Research notification/prompting best practices (frequency, timing, tone)
   - Review behavioral psychology literature on external prompting effectiveness
   - Document findings and update brief with citations

3. **Refine MVP Scope Based on Technical Decisions (Week 2)**
   - If CLI chosen: Accept that proactive prompting will be limited; focus on other features
   - If Web chosen: Design minimal web interface that supports all four core features
   - Finalize data model and tracking fields
   - Create detailed implementation plan with week-by-week milestones

4. **Recruit Pilot Users (Week 2-3)**
   - Identify 5-10 potential pilot testers from personal network
   - Ensure diverse representation: procrastinators, overwhelmed professionals, enthusiasts
   - Set expectations: 2-week testing commitment, feedback surveys, candid criticism welcome
   - Prepare pilot testing materials (onboarding guide, feedback surveys)

5. **Begin MVP Development (Week 3)**
   - Implement data tracking infrastructure first (foundation for all features)
   - Build basic CRUD operations
   - Add WIP limit enforcement
   - Implement celebration mechanics
   - Develop proactive prompting system (or defer if timeline pressure)

6. **Document as You Go**
   - Maintain development log showing BMad methodology in practice
   - Capture design decisions and rationale
   - Document challenges encountered and solutions
   - Create architecture documentation for handoff

7. **Define Phase 2 Decision Criteria (Before MVP Launch)**
   - Establish specific thresholds: What prompt response rate justifies Phase 2? What retention rate?
   - Identify pivot signals: What results would indicate need to change approach?
   - Document decision framework for post-MVP evaluation

### PM Handoff

This Project Brief provides the full context for the **Simple To-Do App** project. The next phase involves transitioning from Business Analyst research and planning to Product Manager execution and development oversight.

**For the Product Manager (or Development Lead):**

Please review this brief thoroughly and use it as the foundation for creating a detailed Product Requirements Document (PRD). Key areas to focus on:

1. **Translate user insights into user stories** - The three personas (Overwhelmed Professional, Chronic Procrastinator, Productivity Enthusiast) should drive feature specifications

2. **Resolve open technical questions** - Particularly CLI vs. Web interface decision, as this fundamentally affects implementation approach

3. **Refine success metrics** - The KPIs outlined in Goals & Success Metrics need measurement instrumentation planning

4. **Develop detailed wireframes/mockups** - Particularly for: celebration mechanics, proactive prompting interaction flow, WIP limit messaging

5. **Create testing plan** - Pilot user recruitment strategy, feedback survey questions, data collection methodology

6. **Build development timeline** - Week-by-week milestones accounting for the 4-6 week MVP target

**Critical Considerations:**

- **Proactive prompting is unvalidated** - This is our innovation bet but highest risk. Have fallback plan if it doesn't work.
- **Timeline may be optimistic** - 4-6 weeks for four features assumes no major blockers. Build in contingency.
- **Small pilot sample** - 5-10 users may not represent broader market. Acknowledge limitations in conclusions.
- **Portfolio vs. Product tension** - Clarify whether optimizing for BMad demonstration value or commercial viability.

**Ask any clarifying questions** about problem statement, user needs, technical considerations, or strategic direction. This brief captures our research-based understanding, but implementation will surface new questions that require decisions.

---

**Document Status:** COMPLETE - Ready for PM review and PRD development

**Next Milestone:** Product Requirements Document (PRD) creation

**Contact:** Business Analyst Mary 📊 for any questions about research methodology, brainstorming insights, or brief content

