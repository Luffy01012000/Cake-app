# Task: Milestone 3 Main Dashboard KPI Integration & Test Alignment Exploration

## Objective
Investigate and specify:
1. `src/app/admin/(panel)/page.tsx`:
   - Inspect existing admin overview dashboard.
   - Integrate visit analytics cards: Total visits, Bot vs. User ratio (visible to all authorized roles).
   - Integrate financial KPI cards: Net cake sales revenue, cakes sold count, cancelled orders count (visible ONLY to `ADMIN`, hidden from `SEO_SPECIALIST`).
2. Test Suite Alignment:
   - Check `tests/analytics-suite.test.ts` (especially Tiers 1.9, 1.10, 2.5, 3, 4).
   - Verify RBAC API redaction assertions and route behavior.
   - Verify that all existing tests and new UI additions compile cleanly with Next.js 16 App Router.

Produce your structured handoff report in `handoff.md`.


## 2026-11-06T09:06:23Z
You are Milestone 3 Explorer 3 (Main Dashboard KPI & Test Alignment).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_3

Read the authoritative files before beginning:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_3/DISPATCH.md

Your mission:
Explore and specify:
1. `src/app/admin/(panel)/page.tsx`:
   - Inspect existing admin overview dashboard.
   - Determine how to add summary analytics KPI cards:
     - Traffic summary (Total visits, User vs. Bot count) for all roles.
     - Financial summary (Net cake revenue, Cakes sold, Cancelled orders) for `ADMIN` role only.
   - Ensure clean conditional rendering based on `session.role`.
2. Inspect `tests/analytics-suite.test.ts` (especially Tiers 1.9, 1.10, 2.5, 3, 4):
   - Check what endpoints, selectors, or API shapes are tested for RBAC and role restrictions.
   - Verify that adding these components causes zero regressions on existing tests.

Produce your structured handoff report in:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_3/handoff.md`

Remember: You are read-only. DO NOT modify codebase source files. Send a completion message via send_message to the orchestrator when finished.
