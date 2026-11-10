# Task: Milestone 2 Challenger 2 (API Routes & Cart Checkout Adversarial Stress)

## Objective
Empirically stress-test Milestone 2 HTTP routes and checkout flows:
- `POST /api/orders`: Malformed JSON, missing required fields, negative quantities, boundary payloads, HTTP method guards (GET -> 405).
- `PATCH /api/admin/orders/[id]`: Non-existent order ID -> 404, invalid auth tokens -> 401, non-admin role -> 403, valid admin token -> 200.
- `CartDrawer.tsx` checkout flow, network failure resilience.

Execute tests and write report with verdict in `handoff.md`.


## 2026-11-06T08:33:41Z
You are Milestone 2 Challenger 2 (API Routes & Checkout Flow Adversarial Stress).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/gate_challenger_2

Read the authoritative files before beginning:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/worker/handoff.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/gate_challenger_2/DISPATCH.md

Your mission:
Empirically stress-test HTTP endpoints and checkout flows:
1. `POST /api/orders`:
   - Malformed JSON -> 400
   - Missing cakeId, customerName, or customerEmail -> 400
   - Negative quantities or invalid prices
   - Method guard: `GET /api/orders` -> 405 Method Not Allowed
   - Successful order creation -> 201 `{ success: true, order }`
2. `PATCH /api/admin/orders/[id]`:
   - Unauthenticated request -> 401
   - Authenticated as `SEO_SPECIALIST` -> 403
   - Authenticated as `ADMIN` -> 200 `{ success: true, order }`
   - Non-existent order ID -> 404
   - `DELETE` alias support -> 200 for ADMIN
3. `CartDrawer.tsx` checkout flow, guest field inputs, error handling banner, cart clearing.

Execute test suites and adversarial checks.
Write your structured challenge report to:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/gate_challenger_2/handoff.md`
State your explicit verdict: APPROVE or REQUEST_CHANGES.
Send a completion message via send_message to the orchestrator when finished.
