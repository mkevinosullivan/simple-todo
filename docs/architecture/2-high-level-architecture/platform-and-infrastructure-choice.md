# Platform and Infrastructure Choice

After reviewing the PRD requirements (localhost-only MVP, 5-10 pilot users,
privacy-first, 4-6 week timeline), I recommend the following platform:

**Platform:** Local Development Environment (No Cloud) **Key Services:**

- **Runtime:** Node.js 18+ LTS (local process)
- **Web Server:** Express.js (serves both static frontend and API)
- **Data Storage:** Local filesystem (JSON files in `./data/` directory)
- **Build System:** Vite (development server + production build)
- **Process Management:** npm scripts (`npm run dev`, `npm start`)

**Deployment Host and Regions:** N/A - Runs locally on user's machine (Windows
10+, macOS 12+, Linux Ubuntu 20.04+)

**Rationale:**

- **No Cloud Hosting Needed:** PRD specifies localhost-only for MVP; hosting
  adds complexity and cost with zero benefit
- **Privacy Compliance:** All data stays local (NFR4: no external data
  transmission)
- **Simplicity:** Single process monolith is fastest path to validation within
  timeline
- **Future Path:** Architecture supports future migration to Vercel/AWS/Azure in
  Phase 2 if needed

**Alternative Considered:** Vercel + Supabase - Rejected for MVP as it requires
authentication, cloud storage, and hosting setup that delays validation of core
hypotheses
