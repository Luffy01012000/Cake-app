# Milestone 2 Explorer 2: Data Service & Revenue Math Handoff Report

## 1. Observation

### Codebase State & File Locations
- **Data Service Implementation**: `src/lib/data-service.ts`
  - Defines `FallbackStore` class (lines 42–48) initialized from `SEED_CAKES`, `SEED_PAGES`, `SEED_ROBOTS`, `SEED_SETTINGS`, `SEED_VISITS`.
  - Sets `globalThis.__auraStore` (lines 50–57) for in-memory persistence across Next.js dev reloads and test runs.
  - Implements visit analytics (`recordVisit`, `getVisitAnalytics`, `resetVisitsStore` at lines 590–785).
  - Currently **lacks** order storage, order management functions, and revenue metrics calculation.
- **Authoritative Test Contract**: `tests/analytics-suite.test.ts`
  - Defines contracts for `OrderStatus`, `OrderRecord`, `CakeSalesMetrics`, and `DataServiceContract` (lines 37–112).
  - Current test run via `pnpm test tests/analytics-suite.test.ts --run`:
    - **47 tests passed**: All Visit Classification & Visit Analytics tests (Tiers 1.1, 1.2, 1.3, 1.4).
    - **48 tests failed**: Specifically all Order and Financial metric tests (Tiers 1.5, 1.6, 1.7, 1.8, 2.2, 2.3, 3, 4) due to:
      ```
      TypeError: ds.getAllOrders is not a function
      TypeError: ds.getCakeSalesMetrics is not a function
      TypeError: ds.createOrder is not a function
      TypeError: ds.cancelOrder is not a function
      ```
- **Prisma Schema**: `prisma/schema.prisma`
  - Current models: `User`, `Cake`, `CakeFaq`, `PageSeo`, `PageFaq`, `RobotsConfig`, `SiteSettings`, `Visit`.
  - `DATABASE_URL` default in `.env`: `postgresql://your_user:your_password@localhost:5432/cake_app?schema=public` (offline during test execution; tests rely on `FallbackStore`).
- **Catalog Cakes**: `src/lib/seed-data.ts` (lines 46–250)
  - 6 luxury catalog cakes:
    1. `elysian-wedding-tier` ("The Elysian Grand Tier", $680)
    2. `blush-seraphina-birthday` ("The Seraphina Blush", $195)
    3. `nocturne-anniversary-velvet` ("The Nocturne Reserve", $360)
    4. `celeste-baby-shower` ("The Céleste Cloud", $320)
    5. `solaris-gala-architectural` ("The Solaris Cube Gala", $850)
    6. `rosalia-intimate-romance` ("The Rosalia Mirror", $165)

### Exact Contract Observations from `tests/analytics-suite.test.ts`

1. **Seed Orders Initial State (Tier 1.5, lines 381–439)**:
   - `getAllOrders()` must return `>= 5` orders (line 388).
   - Must contain both `ACTIVE` and `CANCELLED` orders (lines 395–399).
   - Valid positive prices matching luxury cakes (line 407).
   - Spans `>= 3` distinct cakes with valid emails containing `@` (lines 417–423).
   - Valid ISO timestamps with `new Date(updatedAt) >= new Date(createdAt)` (lines 431–436).

2. **Revenue Calculation Formulas (Tier 1.6, lines 441–498 & Tier 4, lines 1578–1583)**:
   - **`grossRevenue`**:
     ```ts
     const expectedGross = orders.reduce((acc, o) => acc + o.price * o.quantity, 0);
     ```
     Verbatim line 449: Gross revenue is the sum of `price * quantity` of **all** placed orders (both active and cancelled). Cancelling an order does **not** decrease `grossRevenue` (line 646: `expect(after.grossRevenue).toBe(before.grossRevenue)`).
   - **`cancelledRevenue`**:
     ```ts
     const expectedCancelled = orders
       .filter((o) => o.status === "CANCELLED")
       .reduce((acc, o) => acc + o.price * o.quantity, 0);
     ```
     Verbatim line 458: Cancelled revenue is the sum of `price * quantity` of all `CANCELLED` orders.
   - **`netRevenue`**:
     ```ts
     expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);
     ```
     Verbatim line 469: Strictly enforced formula `netRevenue = grossRevenue - cancelledRevenue`. Equivalent to the sum of `price * quantity` of all `ACTIVE` orders.
   - **`totalBoughtCount`**:
     ```ts
     const expectedTotalBought = orders.reduce((acc, o) => acc + o.quantity, 0);
     ```
     Verbatim line 479 & line 1581: Sum of quantities across **all** orders (active + cancelled). When an order is placed, `totalBoughtCount` increases by `quantity`. When cancelled, `totalBoughtCount` does **not** decrease.
   - **`totalCancelledCount`**:
     ```ts
     const expectedTotalCancelled = orders
       .filter((o) => o.status === "CANCELLED")
       .reduce((acc, o) => acc + o.quantity, 0);
     ```
     Verbatim line 480 & line 1582: Sum of quantities across all `CANCELLED` orders.
   - **`perCake` Breakdown**:
     Verbatim line 495:
     ```ts
     const sumPerCakeNet = metrics.perCake.reduce((acc, cake) => acc + cake.netRevenue, 0);
     expect(sumPerCakeNet).toBe(metrics.netRevenue);
     ```
     The sum of `netRevenue` across all cakes in `perCake` must **strictly equal** the catalog-wide `netRevenue`.
     Must include all 6 catalog cakes (even with 0 sales), where `boughtCount: 0, cancelledCount: 0, netRevenue: 0` (lines 1019–1023).

3. **Order Placement Flow (Tier 1.7, lines 500–578)**:
   - Initial status must be `"ACTIVE"`.
   - Unique generated ID (e.g. prefixed `ord_`).
   - If `cakeName` and `price` omitted, auto-populate from catalog (lines 525–533: `cakeId: "blush-seraphina-birthday"` resolves to `name: "The Seraphina Blush"`, `price: 195`).
   - If `quantity` omitted, defaults to `1` (line 543).
   - Order creation updates metrics: `totalBoughtCount + quantity`, `grossRevenue + price * quantity`, `netRevenue + price * quantity` (lines 559–561).
   - New order is immediately returned by `getAllOrders()` (lines 573–577).

4. **Order Cancellation Flow (Tier 1.8, lines 580–668 & Tier 2.2, lines 936–984)**:
   - Cancels order by transitioning status to `"CANCELLED"` (line 597).
   - Updates `updatedAt` timestamp (lines 610–612).
   - Increments `totalCancelledCount` by `order.quantity` (line 629).
   - Decreases `netRevenue` by `order.price * order.quantity` while preserving `grossRevenue` (lines 646–648).
   - Preserves all other order details (line 662–666).
   - **Idempotency**: Cancelling an already cancelled order returns `"CANCELLED"` without double-subtracting revenue or corrupting counts (lines 948–955).
   - **Invalid ID**: Calling `cancelOrder` with a non-existent ID must reject/throw an Error (line 960).
   - **Full Cancellation Boundary**: If all orders for a cake are cancelled, `boughtCount === cancelledCount` and `netRevenue === 0` without negative numbers (lines 981–983).

5. **Arbitrary Test Cake IDs (Tier 2.2 line 965 & Tier 3 line 1384)**:
   - Tests place orders with non-catalog `cakeId`s:
     - `cakeId: "test-isolated-cancel-cake"` (line 965)
     - `cakeId: "test-reorder-cycle-cake"` (line 1384)
   - These orders are included in `getCakeSalesMetrics().perCake` matching their dynamic `cakeId`!

---

## 2. Logic Chain

1. **Dual-Store Architecture Requirement**:
   - In production with PostgreSQL, operations execute against Prisma models.
   - In test and offline development environments, `isDbAvailable()` returns `false`, causing all methods to execute against `FallbackStore` on `globalThis.__auraStore`.
   - Therefore, `FallbackStore` must hold an in-memory `orders: OrderRecord[]` initialized from `SEED_ORDERS`, and all operations must modify `FallbackStore.orders` in-memory while persisting to PostgreSQL when available.
2. **Mathematical Consistency**:
   - To guarantee that DB mode and in-memory fallback yield bit-for-bit identical results without decimal drift or SQL dialect divergence, a shared pure function `computeSalesMetrics(orders: OrderRecord[], catalogCakes: Array<{ id: string; name: string }>)` should be used.
   - When orders are placed, `totalBoughtCount += qty` and `grossRevenue += price * qty`.
   - When orders are cancelled, `totalCancelledCount += qty`, `cancelledRevenue += price * qty`, while `grossRevenue` remains constant.
   - By definition:
     $$\text{netRevenue} = \text{grossRevenue} - \text{cancelledRevenue} = \sum_{\text{ACTIVE}} (\text{price} \times \text{qty})$$
   - For `perCake`, every catalog cake is pre-populated in a Map with 0s. Each order contributes its `qty` to `boughtCount`. If `CANCELLED`, it contributes to `cancelledCount`; if `ACTIVE`, it contributes to `netRevenue`. Any non-catalog cake (e.g. from tests) is dynamically added to the Map.
   - Because every active order in the catalog belongs to exactly one entry in `perCake`, the invariant $\sum \text{perCake.netRevenue} \equiv \text{netRevenue}$ holds strictly under all operations.
3. **Foreign Key Integrity Boundary**:
   - Because `tests/analytics-suite.test.ts` executes `createOrder` with ad-hoc IDs like `"test-isolated-cancel-cake"`, the Prisma `Order` model must not enforce a hard foreign key constraint requiring `cakeId` to match a pre-existing row in the `Cake` table. `cakeId` should be a `String` without referential rejection, allowing test orders to succeed seamlessly across both stores.
4. **Idempotent Cancellation Logic**:
   - Since metrics are derived by aggregating the current collection of order records by their `status`, setting an order that is already `"CANCELLED"` to `"CANCELLED"` leaves the collection state unchanged. Thus, idempotency is naturally preserved without complicated state machine overhead.
5. **Lookup & Default Fallbacks**:
   - In `createOrder`, if `price` or `cakeName` is omitted, the method looks up the cake via `getCakeBySlug(data.cakeId)`. If found, `cake.name` and `cake.price` are populated. If not found (e.g., test cakes), fallback to `data.cakeName || data.cakeId` and `data.price || 0`. `quantity` defaults to `1` when undefined or $\le 0$.

---

## 3. Caveats

1. **Foreign Key in Prisma Schema**:
   The `Order` model in `prisma/schema.prisma` should define `cakeId String` (indexed), but should **not** define a strict `@relation(fields: [cakeId], references: [id])` with DB-level referential constraint enforcement, or if defined, referential integrity must not block test runs. Keeping `cakeId String` as an indexed string column prevents foreign key violation crashes during tests.
2. **`deliveryDate` Type Representation**:
   Tests pass dates as strings like `"2026-11-20"`. Using `deliveryDate String?` in Prisma rather than `DateTime?` avoids timezone shifts (e.g. converting midnight UTC to the previous day in local time) and ensures lossless round-trip preservation.
3. **In-Memory Store Reset Scope**:
   `resetOrdersStore()` resets in-memory `store.orders` to a fresh deep clone of `SEED_ORDERS`. It does not truncate the PostgreSQL database (which is offline during tests anyway).

---

## 4. Conclusion & Technical Specification

The following technical specifications must be implemented in `src/lib/data-service.ts`:

### A. FallbackStore & Global Cache Setup
```typescript
import {
  SEED_CAKES,
  SEED_PAGES,
  SEED_ROBOTS,
  SEED_SETTINGS,
  SEED_VISITS,
  SEED_ORDERS,
  SeedCake,
  SeedPageSeo,
  SeedOrder,
} from "./seed-data";

export type OrderStatus = "ACTIVE" | "CANCELLED";

export interface OrderRecord {
  id: string;
  cakeId: string;
  cakeName: string;
  customerName: string;
  customerEmail: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CakeSalesMetrics {
  totalBoughtCount: number;
  totalCancelledCount: number;
  grossRevenue: number;
  cancelledRevenue: number;
  netRevenue: number;
  perCake: Array<{
    cakeId: string;
    cakeName: string;
    boughtCount: number;
    cancelledCount: number;
    netRevenue: number;
  }>;
}

export interface CreateOrderInput {
  cakeId: string;
  cakeName?: string;
  customerName: string;
  customerEmail: string;
  price?: number;
  quantity?: number;
  deliveryDate?: string;
  notes?: string;
}

class FallbackStore {
  cakes: SeedCake[] = JSON.parse(JSON.stringify(SEED_CAKES));
  pages: SeedPageSeo[] = JSON.parse(JSON.stringify(SEED_PAGES));
  robots = { ...SEED_ROBOTS };
  settings = { ...SEED_SETTINGS };
  visits: VisitRecord[] = JSON.parse(JSON.stringify(SEED_VISITS));
  orders: OrderRecord[] = JSON.parse(JSON.stringify(SEED_ORDERS));
}

// Global store initialization check
if (!globalStore.__auraStore.orders) {
  globalStore.__auraStore.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
}
```

### B. Core Order & Metrics Methods
```typescript
// ----------------- ORDERS & SALES METRICS -----------------

export function resetOrdersStore(): void {
  store.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
}

function formatDbOrder(dbOrder: any): OrderRecord {
  return {
    id: dbOrder.id,
    cakeId: dbOrder.cakeId,
    cakeName: dbOrder.cakeName,
    customerName: dbOrder.customerName,
    customerEmail: dbOrder.customerEmail,
    price: Number(dbOrder.price),
    quantity: Number(dbOrder.quantity),
    status: dbOrder.status as OrderStatus,
    deliveryDate: dbOrder.deliveryDate
      ? dbOrder.deliveryDate instanceof Date
        ? dbOrder.deliveryDate.toISOString()
        : String(dbOrder.deliveryDate)
      : undefined,
    notes: dbOrder.notes || undefined,
    createdAt:
      dbOrder.createdAt instanceof Date
        ? dbOrder.createdAt.toISOString()
        : String(dbOrder.createdAt),
    updatedAt:
      dbOrder.updatedAt instanceof Date
        ? dbOrder.updatedAt.toISOString()
        : String(dbOrder.updatedAt),
  };
}

export async function createOrder(data: CreateOrderInput): Promise<OrderRecord> {
  if (!data.cakeId || typeof data.cakeId !== "string") {
    throw new Error("Missing required field: cakeId");
  }
  if (!data.customerName || typeof data.customerName !== "string") {
    throw new Error("Missing required field: customerName");
  }
  if (
    !data.customerEmail ||
    typeof data.customerEmail !== "string" ||
    !data.customerEmail.includes("@")
  ) {
    throw new Error("Valid customerEmail is required");
  }

  let cakeName = data.cakeName;
  let price = data.price !== undefined ? Number(data.price) : undefined;

  if (!cakeName || price === undefined) {
    const cake = await getCakeBySlug(data.cakeId);
    if (cake) {
      if (!cakeName) cakeName = cake.name;
      if (price === undefined) price = cake.price;
    } else {
      if (!cakeName) cakeName = data.cakeId;
      if (price === undefined) price = 0;
    }
  }

  const quantity =
    data.quantity !== undefined && data.quantity !== null && Number(data.quantity) > 0
      ? Number(data.quantity)
      : 1;

  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  const record: OrderRecord = {
    id,
    cakeId: data.cakeId,
    cakeName,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    price,
    quantity,
    status: "ACTIVE",
    deliveryDate: data.deliveryDate ? String(data.deliveryDate) : undefined,
    notes: data.notes ? String(data.notes) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  if (await isDbAvailable()) {
    try {
      const dbOrder = await prisma.order.create({
        data: {
          id: record.id,
          cakeId: record.cakeId,
          cakeName: record.cakeName,
          customerName: record.customerName,
          customerEmail: record.customerEmail,
          price: record.price,
          quantity: record.quantity,
          status: record.status,
          deliveryDate: record.deliveryDate || null,
          notes: record.notes || null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        },
      });

      store.orders.unshift(record);
      return formatDbOrder(dbOrder);
    } catch (err) {
      console.error("Error creating order in DB:", err);
    }
  }

  // Fallback Store
  store.orders.unshift(record);
  return { ...record };
}

export async function cancelOrder(orderId: string): Promise<OrderRecord> {
  if (!orderId) {
    throw new Error("Missing orderId for cancellation");
  }

  if (await isDbAvailable()) {
    try {
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!existing) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      });

      const inMemory = store.orders.find((o) => o.id === orderId);
      if (inMemory) {
        inMemory.status = "CANCELLED";
        inMemory.updatedAt =
          updated.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : String(updated.updatedAt);
      }

      return formatDbOrder(updated);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        throw err;
      }
      console.error("Error cancelling order in DB:", err);
    }
  }

  // Fallback Store
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  order.status = "CANCELLED";
  order.updatedAt = new Date().toISOString();
  return { ...order };
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  if (await isDbAvailable()) {
    try {
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      });
      return dbOrders.map(formatDbOrder);
    } catch (err) {
      console.error("Error retrieving orders from DB:", err);
    }
  }

  const sorted = [...(store.orders || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted.map((o) => ({ ...o }));
}

export function computeSalesMetrics(
  orders: OrderRecord[],
  catalogCakes: Array<{ id: string; name: string }>
): CakeSalesMetrics {
  let totalBoughtCount = 0;
  let totalCancelledCount = 0;
  let grossRevenue = 0;
  let cancelledRevenue = 0;

  // Pre-seed perCake map with all catalog cakes
  const cakeMap = new Map<
    string,
    {
      cakeId: string;
      cakeName: string;
      boughtCount: number;
      cancelledCount: number;
      netRevenue: number;
    }
  >();

  for (const cake of catalogCakes) {
    cakeMap.set(cake.id, {
      cakeId: cake.id,
      cakeName: cake.name,
      boughtCount: 0,
      cancelledCount: 0,
      netRevenue: 0,
    });
  }

  for (const order of orders) {
    const qty = Number(order.quantity) || 1;
    const price = Number(order.price) || 0;
    const orderTotal = price * qty;

    totalBoughtCount += qty;
    grossRevenue += orderTotal;

    let entry = cakeMap.get(order.cakeId);
    if (!entry) {
      entry = {
        cakeId: order.cakeId,
        cakeName: order.cakeName || order.cakeId,
        boughtCount: 0,
        cancelledCount: 0,
        netRevenue: 0,
      };
      cakeMap.set(order.cakeId, entry);
    }

    entry.boughtCount += qty;

    if (order.status === "CANCELLED") {
      totalCancelledCount += qty;
      cancelledRevenue += orderTotal;
      entry.cancelledCount += qty;
    } else if (order.status === "ACTIVE") {
      entry.netRevenue += orderTotal;
    }
  }

  const netRevenue = grossRevenue - cancelledRevenue;

  return {
    totalBoughtCount,
    totalCancelledCount,
    grossRevenue,
    cancelledRevenue,
    netRevenue,
    perCake: Array.from(cakeMap.values()),
  };
}

export async function getCakeSalesMetrics(): Promise<CakeSalesMetrics> {
  const catalogCakes = await getAllCakes();

  if (await isDbAvailable()) {
    try {
      const dbOrders = await prisma.order.findMany();
      return computeSalesMetrics(dbOrders.map(formatDbOrder), catalogCakes);
    } catch (err) {
      console.error("Error computing sales metrics from DB:", err);
    }
  }

  return computeSalesMetrics(store.orders || [], catalogCakes);
}
```

---

## 5. Verification Method

### Automated Test Execution
Run the test suite with Vitest:
```bash
pnpm test tests/analytics-suite.test.ts --run
```

### Specific Target Assertions to Validate
1. **Tier 1.5 (Seed Orders)**:
   - `getAllOrders()` returns $\ge 5$ items containing both `ACTIVE` and `CANCELLED`.
   - Prices and quantities match luxury patisserie ranges ($165–$850, integer quantities $\ge 1$).
2. **Tier 1.6 (Revenue Formulas)**:
   - `grossRevenue === sum(price * quantity across all orders)`
   - `cancelledRevenue === sum(price * quantity across CANCELLED orders)`
   - `netRevenue === grossRevenue - cancelledRevenue`
   - `sum(perCake.netRevenue) === netRevenue`
3. **Tier 1.7 (createOrder)**:
   - Order creation increments `totalBoughtCount` and `grossRevenue`.
   - Missing `cakeName` and `price` correctly populated from `SEED_CAKES`.
   - Default `quantity` is `1`.
4. **Tier 1.8 (cancelOrder)**:
   - Order transitions to `CANCELLED`, `updatedAt` is refreshed.
   - `totalCancelledCount` increments, `netRevenue` decreases, `grossRevenue` stays constant.
5. **Tier 2.2 & 2.3 (Boundaries & Edge Cases)**:
   - Double cancellation is idempotent: does not change metrics.
   - Non-existent order cancellation throws an Error.
   - All orders cancelled for a cake sets `netRevenue: 0` without negative numbers.
   - Ad-hoc cake IDs (`test-isolated-cancel-cake`, `test-reorder-cycle-cake`) appear correctly in `perCake`.

### Invalidation Conditions
- Any difference between `grossRevenue - cancelledRevenue` and `netRevenue`.
- Any mismatch between $\sum \text{perCake.netRevenue}$ and `netRevenue`.
- `cancelOrder` failing to throw on missing order IDs.
- Double cancellation subtracting revenue a second time.
