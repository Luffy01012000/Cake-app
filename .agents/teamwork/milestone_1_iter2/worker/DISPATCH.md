# Dispatch: Milestone 1 Iteration 2 Worker (Remediation of Challenger Defects)

You are Milestone 1 Iteration 2 Worker (`teamwork_worker`).
Working directory: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1_iter2/worker`
Project root: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator`
Original Request File: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md`
Project Specification: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md`

## Input Patches & Reports from Iteration 2 Explorers
1. **UA Classification Fix** (`src/lib/visit-utils.ts`):
   - Report: `.agents/teamwork/milestone_1_iter2/explorer_1/handoff.md`
   - Proposed file: `.agents/teamwork/milestone_1_iter2/explorer_1/proposed_visit-utils.ts`
   - Patch: `.agents/teamwork/milestone_1_iter2/explorer_1/visit-utils.patch`
   - Resolves DuckDuckGo Privacy Browser (`DuckDuckGo/5`, `DuckDuckGo/7`) and Pinterest In-App (`[Pinterest/iOS]`) false positives, and detects standalone `bot/1.0`.
2. **Concurrency & PostgreSQL Parity Fix** (`src/lib/data-service.ts`):
   - Report: `.agents/teamwork/milestone_1_iter2/explorer_2/handoff.md`
   - Patch: `.agents/teamwork/milestone_1_iter2/explorer_2/proposed_data_service.patch`
   - Eliminates race conditions via transaction/atomic aggregation and computes `dailyTrends` in PostgreSQL mode.
3. **Proxy Prefetch Header Casing Fix** (`src/proxy.ts`):
   - Report: `.agents/teamwork/milestone_1_iter2/explorer_3/handoff.md`
   - Proposed file: `.agents/teamwork/milestone_1_iter2/explorer_3/proposed_proxy.ts`
   - Patch: `.agents/teamwork/milestone_1_iter2/explorer_3/proxy_prefetch.patch`
   - Case-insensitive comparison (`?.toLowerCase() === "prefetch"`) for all prefetch headers.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks
1. Apply the 3 patches to:
   - `src/lib/visit-utils.ts`
   - `src/lib/data-service.ts`
   - `src/proxy.ts`
2. Run the full verification suite:
   - `npx vitest run tests/m1-challenger-1-stress.test.ts` (All 26 MUST pass)
   - `npx vitest run tests/m1-challenger-stress.test.ts` (All 22 MUST pass)
   - `npx vitest run tests/analytics-suite.test.ts -t "Visit"` (All pass)
   - `npx vitest run tests/visit-ingestion.test.ts` (All 12 pass)
   - `npx vitest run tests/seo-suite.test.ts` (All 31 pass)
   - `npx tsc --noEmit` (0 errors)
   - `npx eslint src` (0 errors)
3. Write handoff report to `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1_iter2/worker/handoff.md` and message the parent orchestrator.

## 2026-11-06T07:12:45Z
You are Milestone 1 Iteration 2 Worker (m1_iter2_worker).
Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1_iter2/worker
Project root: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator
Original Request File: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
Dispatch Instructions: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1_iter2/worker/DISPATCH.md
Project Specification: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Follow all instructions in DISPATCH.md. Apply the 3 patches to src/lib/visit-utils.ts, src/lib/data-service.ts, and src/proxy.ts.
Verify with vitest against tests/m1-challenger-1-stress.test.ts, tests/m1-challenger-stress.test.ts, tests/analytics-suite.test.ts, tests/visit-ingestion.test.ts, tests/seo-suite.test.ts, and tsc --noEmit.
Write handoff report to /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1_iter2/worker/handoff.md and notify parent via send_message.
