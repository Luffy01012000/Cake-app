# Task: Milestone 2 API Routes & CartDrawer Integration Exploration

## Objective
Investigate HTTP API endpoints for order placement, cancellation, and UI integration in `CartDrawer.tsx`.

## Scope
- `src/app/api/orders/route.ts`:
  - `POST` endpoint receiving order payload `{ cakeId, customerName, customerEmail, quantity, deliveryDate, notes }`.
  - Creates order via `createOrder()` and returns status 201 with created record.
- `src/app/api/admin/orders/[id]/route.ts`:
  - `PATCH` endpoint receiving order cancellation.
  - RBAC check: Requires `ADMIN` role from session cookie `aura_session`. Returns 401/403 if unauthorized.
  - Calls `cancelOrder(id)` and returns updated order.
- `src/components/CartDrawer.tsx`:
  - Currently simulates checkout via `setTimeout`.
  - Update `handleCheckout` to call `POST /api/orders` for cart items, handling success/error states, clearing cart on success.
- Review `ORIGINAL_REQUEST.md`, `PROJECT.md`, and existing test expectations in `tests/analytics-suite.test.ts`.

## Deliverable
Write your findings and technical recommendations to `handoff.md` in your working directory.


## 2026-11-06T07:36:14Z
You are Milestone 2 Explorer 3 (API Routes & Cart Integration).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_3

Read the following authoritative specification files before beginning:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_3/DISPATCH.md

Your mission:
Explore and specify:
1. `src/app/api/orders/route.ts`:
   - `POST` handler for placing orders.
   - Expected request body: `{ cakeId, customerName, customerEmail, quantity?, deliveryDate?, notes? }`.
   - Calls `createOrder()`.
   - Returns status 201 with `{ success: true, order }` or created `order`. Check `tests/analytics-suite.test.ts` for exact response format expectation!
   - Robust error handling for invalid input (e.g. missing customerName or invalid cakeId -> 400).
2. `src/app/api/admin/orders/[id]/route.ts`:
   - `PATCH` handler for cancelling an order.
   - Authentication & RBAC: Inspect `getSession()` / JWT cookie `aura_session`. Only `ADMIN` role is allowed to cancel orders. `SEO_SPECIALIST` or unauthenticated must return 401/403.
   - Calls `cancelOrder(params.id)`.
   - Returns status 200 with `{ success: true, order }` or updated `order`. Check `tests/analytics-suite.test.ts` for exact response format expectation!
3. `src/components/CartDrawer.tsx`:
   - Inspect current implementation and cart state management.
   - Design the checkout integration: sending POST requests for items in the cart to `/api/orders`, providing clear user feedback (toast or status message), handling checkout errors, and clearing the cart on success.
4. Review existing route handlers (`src/app/api/...`) to follow Next.js 16 conventions (`NextRequest`, `NextResponse`, async params in Next.js 15/16: `params: Promise<{ id: string }>`).

Produce your structured handoff report in:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_3/handoff.md`

Remember: You are read-only. DO NOT modify codebase source files. Send a completion message via send_message to the orchestrator when your report is ready.
