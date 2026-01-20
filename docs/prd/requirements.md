# Requirements

## Functional Requirements

- **FR1:** The system shall allow users to create new tasks with a text description
- **FR2:** The system shall allow users to view all active (incomplete) tasks
- **FR3:** The system shall allow users to mark tasks as complete
- **FR4:** The system shall allow users to delete tasks
- **FR5:** The system shall allow users to edit existing task descriptions
- **FR6:** The system shall enforce a configurable WIP (Work In Progress) limit between 5-10 active tasks
- **FR7:** The system shall prevent users from adding new tasks when the WIP limit is reached until a task is completed or deleted
- **FR8:** The system shall display helpful feedback messages when WIP limit is reached, explaining the benefit and guiding users to complete or delete tasks
- **FR9:** The system shall display celebration messages immediately when a task is marked complete
- **FR10:** The system shall rotate through at least 10 distinct celebration messages to minimize repetition
- **FR11:** The system shall implement a proactive prompting system that suggests a task to the user with the message "Could you do [task] now?" with a default interval of 2-3 hours (randomly selected within range for each prompt)
- **FR12:** The system shall allow users to respond to prompts with: complete task, dismiss prompt, or snooze prompt for 1 hour
- **FR13:** The system shall track task creation timestamps for all tasks
- **FR14:** The system shall track task completion timestamps for completed tasks
- **FR15:** The system shall track task metadata including: text length, creation timestamp, completion timestamp, task status, and lifetime duration (time to completion)
- **FR16:** The system shall provide a mechanism to configure WIP limits within the 5-10 range
- **FR17:** The system shall allow users to configure proactive prompting frequency within a range of 1-6 hours
- **FR18:** The system shall allow users to opt-out of proactive prompting entirely
- **FR19:** The system shall prompt users to configure WIP limit (5-10) and prompting preferences during first launch

## Non-Functional Requirements

- **NFR1:** The system shall start up in less than 2 seconds
- **NFR2:** Task operations (add, complete, delete) shall respond in less than 100 milliseconds
- **NFR3:** The system shall handle up to 10,000 tasks without performance degradation
- **NFR4:** All user data shall be stored locally with no external data transmission (privacy-first design)
- **NFR5:** The system shall use JSON file storage for local data persistence
- **NFR6:** The system shall maintain data integrity ensuring no data loss during operations
- **NFR7:** The system shall be implemented using Node.js 18+ and TypeScript 5+
- **NFR8:** The system shall achieve 70%+ test coverage for business logic services (TaskService, CelebrationService, PromptingService, WIPLimitService)
- **NFR9:** The system shall run on Windows 10+, macOS 12+, and Linux (Ubuntu 20.04+)
- **NFR10:** The system shall sanitize user input to prevent injection attacks
- **NFR11:** The system shall be deployable as a web interface running on localhost
- **NFR12:** The system shall handle data storage errors gracefully with user-friendly error messages and prevent data loss
