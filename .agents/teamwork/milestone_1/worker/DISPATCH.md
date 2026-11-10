# Dispatch: Milestone 1 Worker (Visit Analytics & Ingestion Core Implementation)

You are Milestone 1 Worker (`teamwork_worker`).
Working directory: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/worker`
Project root: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator`
Original Request File: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md`
Project Specification: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md`
Test Infrastructure: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_INFRA.md`
Test Ready File: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_READY.md`

## Explorer Investigation Inputs
- Explorer 1 (UA Classifier): `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1/handoff.md` and reference code `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_1/proposed_visit-utils.ts`
- Explorer 2 (Visit Data Layer & Seeds): `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_2/handoff.md`
- Explorer 3 (Ingestion & Proxy): `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/explorer_3/handoff.md`

## Files You Own Exclusively
- `src/lib/visit-utils.ts`
- `src/lib/seed-data.ts` (add `SeedVisit` interface and `SEED_VISITS` array)
- `prisma/schema.prisma` (add `Visit` model and execute `npx prisma generate`)
- `src/lib/data-service.ts` (add `visits` to `FallbackStore`, `recordVisit`, `getVisitAnalytics`, and `resetVisitsStore`)
- `src/proxy.ts` (Next.js 16 request interceptor for visit logging with prefetch filtering and error shielding)
- `src/app/api/analytics/track/route.ts` (fallback visit tracking endpoint)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks
1. Implement `src/lib/visit-utils.ts` exporting `classifyUserAgent(ua)` using the robust multi-stage classifier specified in Explorer 1's report.
2. Update `prisma/schema.prisma` to include the `Visit` model and run `npx prisma generate`.
3. Update `src/lib/seed-data.ts` to export `SeedVisit` and `SEED_VISITS` (100 realistic records spanning 14 days, with normal browsers and bot breakdown).
4. Update `src/lib/data-service.ts` to extend `FallbackStore` with `visits` (with hot-reload guard), and implement `recordVisit`, `getVisitAnalytics`, and `resetVisitsStore`. Ensure zero disruption to existing methods.
5. Create `src/proxy.ts` conforming to Next.js 16 Proxy conventions with `NextRequest`, prefetch exclusion, and `event.waitUntil` background logging.
6. Create `src/app/api/analytics/track/route.ts` for direct/client-side visit logging.
7. Run build and tests:
   - `npx tsc --noEmit`
   - `npx vitest run tests/analytics-suite.test.ts -t "Visit"`
   - `npx vitest run tests/seo-suite.test.ts`
8. Write handoff report to `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/worker/handoff.md` and message the parent orchestrator.


## 2026-11-06T06:27:13Z
You are Milestone 1 Worker (m1_worker).
Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/worker
Project root: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator
Original Request File: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
Dispatch Instructions: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/worker/DISPATCH.md
Project Specification: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
Test Infrastructure: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_INFRA.md
Test Ready: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Follow all instructions in DISPATCH.md. Implement src/lib/visit-utils.ts, update prisma/schema.prisma and run prisma generate, update src/lib/seed-data.ts, update src/lib/data-service.ts, implement src/proxy.ts and src/app/api/analytics/track/route.ts.
Verify with `npx tsc --noEmit` and Vitest.
Write handoff report to /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1/worker/handoff.md and notify parent via send_message.
