# Task: Milestone 2 Data Service & Revenue Math Exploration

## Objective
Investigate `src/lib/data-service.ts` enhancements to support order management and sales revenue analytics with dual-store parity.

## Scope
- `src/lib/data-service.ts`:
  - `FallbackStore.orders` initialization from `SEED_ORDERS`.
  - `createOrder(data)`: creates order in Postgres or FallbackStore. If `price` or `cakeName` not provided, look up from cake catalog.
  - `cancelOrder(orderId)`: updates status to `CANCELLED`.
  - `getAllOrders()`: returns all orders ordered by `createdAt` desc.
  - `getCakeSalesMetrics()`: computes `totalBoughtCount`, `totalCancelledCount`, `grossRevenue`, `cancelledRevenue`, `netRevenue` (`gross - cancelled`), and `perCake` breakdown for all 6 cakes.
  - `resetOrdersStore()`: resets in-memory orders store to initial seed state.
- Check database query strategy and FallbackStore consistency.
- Review `ORIGINAL_REQUEST.md`, `PROJECT.md`, and existing test expectations in `tests/analytics-suite.test.ts` (Tiers 1.5, 1.6, 1.7, 1.8, 2.2, 2.3).

## Deliverable
Write your findings and technical recommendations to `handoff.md` in your working directory.

## 2026-11-06T07:36:14Z
You are Milestone 2 Explorer 2 (Data Service & Revenue Math).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_2

Read the following authoritative specification files before beginning:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_2/DISPATCH.md

Your mission:
Explore and specify `src/lib/data-service.ts` extensions for order management and revenue metrics:
1. `FallbackStore` in-memory structure:
   - Add `orders: OrderRecord[]` initialized from deep clone of `SEED_ORDERS`.
   - Implement `resetOrdersStore()`.
2. Core methods (implementing exact dual-store parity between PostgreSQL and `FallbackStore`):
   - `createOrder(data)`: Validates input, looks up cake name/price if omitted, creates order record with `status: ACTIVE`.
   - `cancelOrder(orderId)`: Updates order status to `CANCELLED` and `updatedAt` timestamp.
   - `getAllOrders()`: Returns all orders sorted descending by `createdAt`.
   - `getCakeSalesMetrics()`:
     - `totalBoughtCount`: Total quantity of all orders (or total orders? Check `PROJECT.md` and `tests/analytics-suite.test.ts` exact assertions!).
     - `totalCancelledCount`: Quantity or count of cancelled orders? Check test assertions!
     - `grossRevenue`: Sum of `price * quantity` across all orders (or active + cancelled?).
     - `cancelledRevenue`: Sum of `price * quantity` of cancelled orders.
     - `netRevenue`: `grossRevenue - cancelledRevenue` (equivalent to sum of active orders).
     - `perCake`: Array of metrics for all 6 cakes (even those with 0 sales), including `cakeId`, `cakeName`, `boughtCount`, `cancelledCount`, `netRevenue`.
3. Check `tests/analytics-suite.test.ts` (especially Tiers 1.5, 1.6, 1.7, 1.8, 2.2, 2.3) to ensure 100% test contract alignment.

Produce your structured handoff report in:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_2/handoff.md

Remember: You are read-only. DO NOT modify codebase source files. Send a completion message via send_message to the orchestrator when your report is ready.

