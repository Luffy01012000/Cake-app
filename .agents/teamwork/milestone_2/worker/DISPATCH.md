# Task: Milestone 2 — Cake Order & Revenue Tracking Core Implementation

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Implement end-to-end cake order placement, cancellation, revenue metrics calculation, and UI checkout integration with complete dual-store parity and 100% test pass on Milestone 2 suites.

## Authoritative Files to Read First
1. `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md`
2. `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md`
3. `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_1/handoff.md`
4. `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_2/handoff.md`
5. `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_3/handoff.md`

Reference artifacts already prepared by Explorers:
- Proposed routes and patches in `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/explorer_3/`

## Exclusive Write Ownership
You exclusively own and may edit the following files:
1. `prisma/schema.prisma`
2. `src/lib/seed-data.ts`
3. `src/lib/data-service.ts`
4. `src/app/api/orders/route.ts` (create new)
5. `src/app/api/admin/orders/[id]/route.ts` (create new)
6. `src/components/CartDrawer.tsx`

## Detailed Implementation Steps

### 1. Prisma Schema (`prisma/schema.prisma`)
- Define `enum OrderStatus { ACTIVE, CANCELLED }`
- Define `model Order`:
  ```prisma
  enum OrderStatus {
    ACTIVE
    CANCELLED
  }

  model Order {
    id            String      @id @default(cuid())
    cakeId        String
    cakeName      String
    customerName  String
    customerEmail String
    price         Float
    quantity      Int         @default(1)
    status        OrderStatus @default(ACTIVE)
    deliveryDate  String?
    notes         String?
    createdAt     DateTime    @default(now())
    updatedAt     DateTime    @updatedAt

    @@index([cakeId])
    @@index([status])
    @@index([createdAt])
  }
  ```
  *(Note: Do not enforce hard foreign key relation on `cakeId` so that tests placing orders with ad-hoc IDs like `test-isolated-cancel-cake` succeed).*
- Run: `npx prisma db push` and `npx prisma generate`.

### 2. Seed Data (`src/lib/seed-data.ts`)
- Add and export `SeedOrder` interface:
  ```ts
  export interface SeedOrder {
    id: string;
    cakeId: string;
    cakeName: string;
    customerName: string;
    customerEmail: string;
    price: number;
    quantity: number;
    status: "ACTIVE" | "CANCELLED";
    deliveryDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }
  ```
- Export `SEED_ORDERS: SeedOrder[]` with the 14 realistic orders from Explorer 1's handoff (11 active, 3 cancelled, across all 6 cakes, whole integer prices).

### 3. Data Service (`src/lib/data-service.ts`)
- Export `OrderStatus`, `OrderRecord`, `CakeSalesMetrics`, `CreateOrderInput`.
- Extend `FallbackStore` with `orders: OrderRecord[] = JSON.parse(JSON.stringify(SEED_ORDERS))`.
- Add global check: `if (!globalStore.__auraStore.orders) globalStore.__auraStore.orders = JSON.parse(JSON.stringify(SEED_ORDERS));`.
- Implement `resetOrdersStore(): void`.
- Implement `createOrder(data: CreateOrderInput): Promise<OrderRecord>`:
  - Generates `id = ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`.
  - Default `quantity = 1` if omitted/<=0.
  - Auto-lookups `cakeName` and `price` from `getCakeBySlug(data.cakeId)` if omitted; fallback to `data.cakeName || data.cakeId` and `data.price || 0`.
  - Sets `status: "ACTIVE"`.
  - Dual-store: creates in Prisma if DB available, unshifts into `store.orders`.
- Implement `cancelOrder(orderId: string): Promise<OrderRecord>`:
  - Validates order exists (throws error if not found).
  - Updates status to `"CANCELLED"` and updates `updatedAt`.
  - Idempotent: already cancelled order remains CANCELLED without double error or metric drift.
  - Dual-store: updates Prisma if DB available, updates in `store.orders`.
- Implement `getAllOrders(): Promise<OrderRecord[]>`:
  - Returns orders sorted descending by `createdAt`.
- Implement `computeSalesMetrics(orders: OrderRecord[], catalogCakes: Array<{ id: string; name: string }>): CakeSalesMetrics`:
  - `totalBoughtCount`: Sum of quantities of ALL orders.
  - `totalCancelledCount`: Sum of quantities of CANCELLED orders.
  - `grossRevenue`: Sum of `price * quantity` of ALL orders.
  - `cancelledRevenue`: Sum of `price * quantity` of CANCELLED orders.
  - `netRevenue`: `grossRevenue - cancelledRevenue` (sum of ACTIVE orders).
  - `perCake`: Array for all catalog cakes (even with 0 sales) plus any custom test cakes. Invariant `sum(perCake.netRevenue) === netRevenue`.
- Implement `getCakeSalesMetrics(): Promise<CakeSalesMetrics>`:
  - Calls `computeSalesMetrics` with orders and `await getAllCakes()`.

### 4. API Routes
- `src/app/api/orders/route.ts`:
  - Implement `POST`: validates body (`cakeId`, `customerName`, `customerEmail`), calls `createOrder`, returns status 201 with `{ success: true, order, ...order }` (or `{ success: true, order }`).
  - Implement `GET`: returns 405 Method Not Allowed.
- `src/app/api/admin/orders/[id]/route.ts`:
  - Implement `PATCH`: authenticates via `getSession()` / cookie `aura_session` / Bearer token.
  - Role check: Requires `ADMIN` role. If unauthorized -> 401; if not ADMIN (e.g. `SEO_SPECIALIST`) -> 403.
  - Awaits `params: Promise<{ id: string }>`.
  - Calls `cancelOrder(id)`.
  - Returns status 200 with `{ success: true, order }`.
  - Export `DELETE` as alias to `PATCH`.

### 5. UI Integration (`src/components/CartDrawer.tsx`)
- Update `handleCheckout` to call `POST /api/orders` for cart items.
- Provide input fields for customer name and email (with luxury sensible fallbacks).
- Handle checkout errors with an alert banner without clearing cart.
- On success, call `onClearCart()` and show confirmation with actual created order IDs.

## Verification Requirements
Run the following commands and verify 100% pass:
1. `npx prisma validate`
2. `npx prisma db push`
3. `npx tsc --noEmit`
4. `npx eslint src`
5. `npx vitest run tests/analytics-suite.test.ts -t "Tier 1.5|Tier 1.6|Tier 1.7|Tier 1.8|Tier 2.2|Tier 2.3"`
6. `npx vitest run tests/analytics-suite.test.ts -t "Order|Revenue|Sales"`
7. `npx vitest run --fileParallelism=false --maxWorkers=1 tests/m1-challenger-1-stress.test.ts tests/m1-challenger-stress.test.ts tests/visit-ingestion.test.ts tests/seo-suite.test.ts`

Write your completion report in:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/worker/handoff.md`


## 2026-11-06T07:45:38Z
You are the Milestone 2 Implementation Worker (Orders & Revenue Tracking Core).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/worker

Read your complete task specification and instructions in:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/worker/DISPATCH.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write files:
1. `prisma/schema.prisma`
2. `src/lib/seed-data.ts`
3. `src/lib/data-service.ts`
4. `src/app/api/orders/route.ts`
5. `src/app/api/admin/orders/[id]/route.ts`
6. `src/components/CartDrawer.tsx`

Reference explorer handoffs and pre-built artifacts:
- `.agents/teamwork/milestone_2/explorer_1/handoff.md` (Schema & 14 seed orders)
- `.agents/teamwork/milestone_2/explorer_2/handoff.md` (Data service methods & revenue math)
- `.agents/teamwork/milestone_2/explorer_3/handoff.md` (API routes, CartDrawer patch)
- `.agents/teamwork/milestone_2/explorer_3/proposed_orders_route.ts`
- `.agents/teamwork/milestone_2/explorer_3/proposed_admin_orders_id_route.ts`
- `.agents/teamwork/milestone_2/explorer_3/cart_drawer.patch`

Implement all code, run `npx prisma db push`, `npx prisma generate`, run `npx tsc --noEmit`, run `npx eslint src`, and run test suites:
- `npx vitest run tests/analytics-suite.test.ts -t "Tier 1.5|Tier 1.6|Tier 1.7|Tier 1.8|Tier 2.2|Tier 2.3"`
- `npx vitest run tests/analytics-suite.test.ts -t "Order|Revenue"`
- `npx vitest run --fileParallelism=false --maxWorkers=1 tests/m1-challenger-1-stress.test.ts tests/m1-challenger-stress.test.ts tests/visit-ingestion.test.ts tests/seo-suite.test.ts`

Document all commands, results, and code changes in:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_2/worker/handoff.md`

Send a completion message via send_message to the orchestrator when finished.

## 2026-11-06T07:56:45Z
**Context**: Milestone 2 Implementation (m2_worker)
**Content**: Heartbeat check. Please update your progress.md with current status on schema, seed data, data-service, API routes, or test execution.
**Action**: Continue implementation, update progress.md, and deliver handoff when complete.
