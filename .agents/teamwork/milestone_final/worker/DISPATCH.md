## 2026-11-06T10:05:48Z
You are Milestone Final Verification Worker (`teamwork_worker`).
Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_final/worker
Authoritative Request: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
Project Scope: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
Parent Orchestrator Conversation ID: 5224ce45-0d56-4e58-a11c-1bab000d62c3

CRITICAL: Before beginning your work, read /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSION:
Execute end-to-end repository verification across the entire project for Milestone Final:
1. Run the primary test suites via Vitest:
   - `pnpm vitest run --fileParallelism=false --maxWorkers=1 tests/analytics-suite.test.ts`
   - `pnpm vitest run --fileParallelism=false --maxWorkers=1 tests/seo-suite.test.ts tests/visit-ingestion.test.ts`
   - Run all test files in `tests/`: `pnpm vitest run --fileParallelism=false --maxWorkers=1`
2. Run TypeScript static type checker: `npx tsc --noEmit`
3. Run ESLint: `npx eslint src`
4. Run full production Turbopack build: `pnpm build`
5. Report the full execution metrics (number of passed tests, files, build status, compile time) in your handoff report.
6. If any test or build fails, identify and fix the issue (you have write ownership for fixes if needed).

DELIVERABLES:
- Write progress in `.agents/teamwork/milestone_final/worker/progress.md`
- Write comprehensive verification handoff in `.agents/teamwork/milestone_final/worker/handoff.md`
- Send completion message to parent orchestrator via `send_message`.
