# Milestone 2 Explorer 1 Handoff Report: Schema & Seed Data Specification

**Author**: Milestone 2 Explorer 1  
**Target Milestone**: Milestone 2 (Cake Order & Revenue Tracking Core)  
**Date**: 2026-11-06T07:45:00Z  

---

## 1. Observation

### 1.1 Existing Prisma Schema (`prisma/schema.prisma`)
In `prisma/schema.prisma` lines 20–48, the `Cake` model is defined as:
```prisma
model Cake {
  id              String    @id @default(cuid())
  slug            String    @unique
  name            String
  tagline         String
  occasion        String
  price           Float
  image           String
  imageAlt        String    @default("")
  imageCaption    String?
  finishColor     String    @default("#f0e4d3")
  swatchName      String    @default("Starlight")
  servings        String
  tiers           Int       @default(1)
  isNew           Boolean   @default(false)
  flavors         String[]
  description     String
  tastingNotes    String[]
  dimensions      String
  leadTime        String
  metaTitle       String?
  metaDescription String?
  canonicalUrl    String?
  ogImage         String?
  rawJsonLd       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  faqs            CakeFaq[]
}
```
Currently, `model Cake` does not contain a relation field for `Order`. When a foreign key relation `cake Cake @relation(fields: [cakeId], references: [id])` is added to `Order`, Prisma requires a back-relation field `orders Order[]` on `model Cake`.

### 1.2 Prisma CLI and PostgreSQL Environment
- `npx prisma validate` succeeded:
  ```
  The schema at prisma/schema.prisma is valid 🚀
  ```
- `npx prisma db push` succeeded with exit code 0:
  ```
  Environment variables loaded from .env
  Prisma schema loaded from prisma/schema.prisma
  Datasource "db": PostgreSQL database "cake_app", schema "public" at "localhost:5432"
  The database is already in sync with the Prisma schema.
  ✔ Generated Prisma Client (v6.19.3) to ./node_modules/.pnpm/@prisma+client@6.19.3...
  ```
- `npx prisma generate` generates `@prisma/client` in ~300ms.
- PostgreSQL is active on `localhost:5432` with database `cake_app` configured in `.env`.

### 1.3 Authoritative Cake Catalog vs. Dispatch Placeholder Discrepancy
- The prompt in `DISPATCH.md` mentioned in parentheses: `(Golden Opera, Rose Raspberry Ispahan, Midnight Truffle Sacher, Tokyo Matcha Mille Crepe, Sicilian Pistachio Bloom, Vanilla Grand Cru)`.
- However, grep search across the codebase for `"Golden Opera"` returned zero matches in code files (`src/` and `tests/`).
- The actual authoritative catalog defined in `src/lib/seed-data.ts` (lines 46–274), `src/data/cakes.ts` (lines 20–180), and strictly asserted in `tests/analytics-suite.test.ts` (lines 506, 526, 538, 551, 567, 586) consists of exactly:
  1. `elysian-wedding-tier` — "The Elysian Grand Tier" (price: $680)
  2. `blush-seraphina-birthday` — "The Seraphina Blush" (price: $195)
  3. `nocturne-anniversary-velvet` — "The Nocturne Reserve" (price: $360)
  4. `celeste-baby-shower` — "The Céleste Cloud" (price: $320)
  5. `solaris-gala-architectural` — "The Solaris Cube Gala" (price: $850)
  6. `rosalia-intimate-romance` — "The Rosalia Mirror" (price: $165)

### 1.4 Test Suite Assertions (`tests/analytics-suite.test.ts`)
In `tests/analytics-suite.test.ts`:
- Tier 1.5 (Seed Orders Initial State Verification, lines 381–439):
  - `orders.length >= 5`
  - `activeOrders.length > 0`
  - `cancelledOrders.length > 0`
  - `order.price > 0`, `order.quantity >= 1`, `Number.isFinite(order.price) === true`
  - `cakeIds.size >= 3` (distinct cakes covered)
  - `order.customerName.length > 0`
  - `order.customerEmail.includes("@")`
  - Valid ISO timestamps with `updatedAt >= createdAt`.
- Tier 1.6 (Revenue Calculation Formulas, lines 441–498):
  - `grossRevenue = sum(order.price * order.quantity for all orders)`
  - `cancelledRevenue = sum(order.price * order.quantity for CANCELLED orders)`
  - `netRevenue = grossRevenue - cancelledRevenue`
  - `totalBoughtCount = sum(order.quantity for all orders)`
  - `totalCancelledCount = sum(order.quantity for CANCELLED orders)`
  - `sum(perCake.netRevenue) === netRevenue`
- Tier 2.3 (Precision Invariant, line 993):
  - `expect(Number.isInteger(metrics.grossRevenue)).toBe(true);`
  - `expect(Number.isInteger(metrics.cancelledRevenue)).toBe(true);`
  - `expect(Number.isInteger(metrics.netRevenue)).toBe(true);`
  - All prices and calculated revenues must be pure integers without decimal cent drift.
- Baseline test results:
  - 4 test files (`m1-challenger-1-stress.test.ts`, `m1-challenger-stress.test.ts`, `seo-suite.test.ts`, `visit-ingestion.test.ts`) pass 100% (138 tests passing).
  - `analytics-suite.test.ts` passes all 47 visit/auth tests and fails only the 48 unimplemented Milestone 2 order functions (`getAllOrders`, `createOrder`, `cancelOrder`, `getCakeSalesMetrics`).

---

## 2. Logic Chain

1. **Relation requirement**: In Prisma, establishing `@relation(fields: [cakeId], references: [id])` on `Order` creates a 1-to-many relation between `Cake` and `Order`. Prisma requires both sides of the relation to be defined. Therefore, `model Cake` must include `orders Order[]`.
2. **Schema synchronization**: Because PostgreSQL is running locally and connected via `.env`, `npx prisma db push` will create the `"Order"` table, the `"OrderStatus"` enum, foreign key constraints, and indices in PostgreSQL, and will immediately invoke `prisma generate` to update the client types in `@prisma/client`.
3. **Seed order alignment**: Using the 6 verified cakes (`elysian-wedding-tier`, `blush-seraphina-birthday`, `nocturne-anniversary-velvet`, `celeste-baby-shower`, `solaris-gala-architectural`, `rosalia-intimate-romance`) ensures foreign key integrity against `Cake` rows in PostgreSQL and satisfies all lookup tests in `tests/analytics-suite.test.ts`.
4. **Seed volume and composition**: Selecting 14 seed orders with 11 `ACTIVE` and 3 `CANCELLED` orders satisfies the dispatch instruction ("12-16 realistic seed orders", "2-4 cancelled orders and 10-12 active orders") and exceeds the test suite minimum threshold (`orders.length >= 5`, `cakeIds.size >= 3`).
5. **Integer financial consistency**: Setting all order prices to whole numbers ($165, $195, $320, $360, $680, $850) and quantities to positive integers (1, 2, 3) ensures `price * quantity` is always an integer, guaranteeing that `grossRevenue`, `cancelledRevenue`, and `netRevenue` satisfy `Number.isInteger()`.

---

## 3. Caveats

1. **Parallel Test Race Conditions**: Vitest runs test files concurrently by default across 5 workers. Because in-memory fallback state resides on `globalThis.__auraStore`, tests mutating store state simultaneously can conflict if run in full parallel without isolation. Running sequentially with `pnpm vitest run --fileParallelism=false` succeeds deterministically across all test files.
2. **PostgreSQL vs FallbackStore Dual Synchronization**: Both stores must be kept in sync:
   - When database is active, Prisma queries PostgreSQL tables (`"Order"`).
   - In offline/fallback mode, `globalThis.__auraStore.orders` must be pre-populated from `SEED_ORDERS`.
   - `prisma/seed.ts` must also be extended to upsert `SEED_ORDERS` into the database when `pnpm seed` is invoked.

---

## 4. Conclusion & Actionable Specifications

### 4.1 Prisma Schema Changes (`prisma/schema.prisma`)

#### A. Add to `model Cake`:
```prisma
  orders          Order[]
```
(Place at line 48, right after `faqs CakeFaq[]`).

#### B. Append `enum OrderStatus` and `model Order`:
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
  cake          Cake        @relation(fields: [cakeId], references: [id])

  @@index([cakeId])
  @@index([status])
  @@index([createdAt])
}
```

---

### 4.2 Seed Data Specification (`src/lib/seed-data.ts`)

#### A. `SeedOrder` Interface:
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

#### B. `SEED_ORDERS` Dataset (14 Orders: 11 Active, 3 Cancelled):
```ts
export const SEED_ORDERS: SeedOrder[] = [
  {
    id: "seed-order-001",
    cakeId: "elysian-wedding-tier",
    cakeName: "The Elysian Grand Tier",
    customerName: "Lady Genevieve Montague",
    customerEmail: "genevieve.montague@mayfair-holdings.co.uk",
    price: 680,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-28",
    notes: "Bespoke 24k gold leaf monograms for Montague reception.",
    createdAt: "2026-10-26T10:15:00.000Z",
    updatedAt: "2026-10-26T10:15:00.000Z",
  },
  {
    id: "seed-order-002",
    cakeId: "blush-seraphina-birthday",
    cakeName: "The Seraphina Blush",
    customerName: "Camilla Chesterfield",
    customerEmail: "camilla@chesterfield-design.com",
    price: 195,
    quantity: 2,
    status: "ACTIVE",
    deliveryDate: "2026-11-14",
    notes: "Complimentary chocolate plaque: Happy 30th Camilla",
    createdAt: "2026-10-27T14:30:00.000Z",
    updatedAt: "2026-10-27T14:30:00.000Z",
  },
  {
    id: "seed-order-003",
    cakeId: "nocturne-anniversary-velvet",
    cakeName: "The Nocturne Reserve",
    customerName: "Lord Julian Sterling",
    customerEmail: "julian@sterling-villas.com",
    price: 360,
    quantity: 1,
    status: "CANCELLED",
    deliveryDate: "2026-11-12",
    notes: "Client rescheduled anniversary dinner to next quarter.",
    createdAt: "2026-10-28T09:00:00.000Z",
    updatedAt: "2026-10-29T11:20:00.000Z",
  },
  {
    id: "seed-order-004",
    cakeId: "celeste-baby-shower",
    cakeName: "The Céleste Cloud",
    customerName: "Dr. Vivienne Vance",
    customerEmail: "vivienne.vance@central-hospital.org",
    price: 320,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-20",
    notes: "Sky Azure finish with white chocolate cluster spheres.",
    createdAt: "2026-10-29T16:45:00.000Z",
    updatedAt: "2026-10-29T16:45:00.000Z",
  },
  {
    id: "seed-order-005",
    cakeId: "solaris-gala-architectural",
    cakeName: "The Solaris Cube Gala",
    customerName: "Bartholomew Kensington",
    customerEmail: "bkensington@kensington-partners.ch",
    price: 850,
    quantity: 2,
    status: "ACTIVE",
    deliveryDate: "2026-12-05",
    notes: "White-glove banquet refrigerated installation at Guggenheim atrium.",
    createdAt: "2026-10-30T11:00:00.000Z",
    updatedAt: "2026-10-30T11:00:00.000Z",
  },
  {
    id: "seed-order-006",
    cakeId: "rosalia-intimate-romance",
    cakeName: "The Rosalia Mirror",
    customerName: "Sebastian Moreau",
    customerEmail: "sebastian.moreau@atelier-lux.fr",
    price: 165,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-10",
    notes: "Proposal dinner setup at Le Bernardin private alcove.",
    createdAt: "2026-10-31T18:20:00.000Z",
    updatedAt: "2026-10-31T18:20:00.000Z",
  },
  {
    id: "seed-order-007",
    cakeId: "elysian-wedding-tier",
    cakeName: "The Elysian Grand Tier",
    customerName: "Countess Jacqueline de Valois",
    customerEmail: "jacqueline@valois-estates.fr",
    price: 680,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-12-18",
    notes: "Direct courier delivery to Valois manor ballroom.",
    createdAt: "2026-11-01T08:30:00.000Z",
    updatedAt: "2026-11-01T08:30:00.000Z",
  },
  {
    id: "seed-order-008",
    cakeId: "blush-seraphina-birthday",
    cakeName: "The Seraphina Blush",
    customerName: "Hélène René-Dupont",
    customerEmail: "helene@dupont-luxury.com",
    price: 195,
    quantity: 1,
    status: "CANCELLED",
    deliveryDate: "2026-11-08",
    notes: "Guest of honor international travel postponed.",
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-02T15:45:00.000Z",
  },
  {
    id: "seed-order-009",
    cakeId: "nocturne-anniversary-velvet",
    cakeName: "The Nocturne Reserve",
    customerName: "Alexander Pemberton",
    customerEmail: "a.pemberton@pemberton-capital.com",
    price: 360,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-22",
    notes: "24k gold drape finish with Araguani dark chocolate.",
    createdAt: "2026-11-02T14:15:00.000Z",
    updatedAt: "2026-11-02T14:15:00.000Z",
  },
  {
    id: "seed-order-010",
    cakeId: "celeste-baby-shower",
    cakeName: "The Céleste Cloud",
    customerName: "Margot Saint-Clair",
    customerEmail: "margot@saintclair-interiors.com",
    price: 320,
    quantity: 2,
    status: "ACTIVE",
    deliveryDate: "2026-11-25",
    notes: "Twin celebration: one pastel sky blue, one blush rose velvet.",
    createdAt: "2026-11-03T09:40:00.000Z",
    updatedAt: "2026-11-03T09:40:00.000Z",
  },
  {
    id: "seed-order-011",
    cakeId: "solaris-gala-architectural",
    cakeName: "The Solaris Cube Gala",
    customerName: "Maximilian Rothschild",
    customerEmail: "m.rothschild@fin-geneve.ch",
    price: 850,
    quantity: 1,
    status: "CANCELLED",
    deliveryDate: "2026-11-30",
    notes: "Gala venue changed catering policy to in-house kitchen.",
    createdAt: "2026-11-03T17:10:00.000Z",
    updatedAt: "2026-11-04T10:05:00.000Z",
  },
  {
    id: "seed-order-012",
    cakeId: "rosalia-intimate-romance",
    cakeName: "The Rosalia Mirror",
    customerName: "Chloë Müller",
    customerEmail: "chloe.mueller@zurich-arts.ch",
    price: 165,
    quantity: 3,
    status: "ACTIVE",
    deliveryDate: "2026-11-15",
    notes: "Trio of individual mirror cakes for private salon vernissage.",
    createdAt: "2026-11-04T11:25:00.000Z",
    updatedAt: "2026-11-04T11:25:00.000Z",
  },
  {
    id: "seed-order-013",
    cakeId: "elysian-wedding-tier",
    cakeName: "The Elysian Grand Tier",
    customerName: "Dominic Thorne",
    customerEmail: "thorne@thorne-estates.com",
    price: 680,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-12-22",
    notes: "Tahitian Vanilla Bean & Rosé Champagne filling.",
    createdAt: "2026-11-05T13:50:00.000Z",
    updatedAt: "2026-11-05T13:50:00.000Z",
  },
  {
    id: "seed-order-014",
    cakeId: "blush-seraphina-birthday",
    cakeName: "The Seraphina Blush",
    customerName: "Seraphina Albright",
    customerEmail: "seraphina@albright-foundation.org",
    price: 195,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-18",
    notes: "Gold leaf dust inscription: 40 Years of Radiance",
    createdAt: "2026-11-05T16:30:00.000Z",
    updatedAt: "2026-11-05T16:30:00.000Z",
  },
];
```

---

### 4.3 Baseline Financial & Quantity Mathematical Verification

| Metric | Active Orders | Cancelled Orders | Total / Net Result | Formula Verification |
|---|---|---|---|---|
| **Order Records** | 11 | 3 | 14 orders | 11 + 3 = 14 (within 12–16) |
| **Item Quantities** | 16 | 3 | 19 bought items | totalBought: 19, totalCancelled: 3 |
| **Gross Revenue** | — | — | **$7,710** | Sum of (price × qty) for all 14 orders |
| **Cancelled Revenue** | — | — | **$1,405** | Sum of (price × qty) for 3 cancelled orders |
| **Net Revenue** | — | — | **$6,305** | $7,710 − $1,405 = $6,305 |

#### Per-Cake Expected Aggregates:
1. **The Elysian Grand Tier** (`elysian-wedding-tier`, $680):
   - Bought count: 3 (Orders 001, 007, 013)
   - Cancelled count: 0
   - Net revenue: 3 × $680 = **$2,040**
2. **The Seraphina Blush** (`blush-seraphina-birthday`, $195):
   - Bought count: 4 (Orders 002 [qty 2], 008 [qty 1], 014 [qty 1])
   - Cancelled count: 1 (Order 008 [qty 1])
   - Net revenue: (4 − 1) × $195 = **$585**
3. **The Nocturne Reserve** (`nocturne-anniversary-velvet`, $360):
   - Bought count: 2 (Orders 003 [qty 1], 009 [qty 1])
   - Cancelled count: 1 (Order 003 [qty 1])
   - Net revenue: (2 − 1) × $360 = **$360**
4. **The Céleste Cloud** (`celeste-baby-shower`, $320):
   - Bought count: 3 (Orders 004 [qty 1], 010 [qty 2])
   - Cancelled count: 0
   - Net revenue: 3 × $320 = **$960**
5. **The Solaris Cube Gala** (`solaris-gala-architectural`, $850):
   - Bought count: 3 (Orders 005 [qty 2], 011 [qty 1])
   - Cancelled count: 1 (Order 011 [qty 1])
   - Net revenue: (3 − 1) × $850 = **$1,700**
6. **The Rosalia Mirror** (`rosalia-intimate-romance`, $165):
   - Bought count: 4 (Orders 006 [qty 1], 012 [qty 3])
   - Cancelled count: 0
   - Net revenue: 4 × $165 = **$660**

**Per-Cake Sum Reconciliation**:
$2,040 + $585 + $360 + $960 + $1,700 + $660 = **$6,305** (Strictly matches catalog Net Revenue).

---

## 5. Verification Method

Once Milestone 2 Implementer modifies `prisma/schema.prisma` and `src/lib/seed-data.ts`:

1. **Schema Validation & DB Push**:
   ```bash
   npx prisma validate
   npx prisma db push
   ```
   *Expected output*: Valid schema, PostgreSQL `"Order"` table created, Prisma Client generated without error.

2. **Database Seed Execution**:
   ```bash
   pnpm seed
   ```
   *Expected output*: Successful upsert of seed orders with exit code 0.

3. **Targeted Test Execution**:
   ```bash
   pnpm vitest run tests/analytics-suite.test.ts -t "Tier 1.5"
   pnpm vitest run tests/analytics-suite.test.ts -t "Tier 1.6"
   ```
   *Expected output*: All seed order invariant tests and revenue calculation tests pass.

4. **Invalidation Conditions**:
   - If `model Cake` is missing `orders Order[]`, `npx prisma validate` will fail with a relation validation error.
   - If seed order cake IDs do not match `SEED_CAKES` IDs, foreign key push or catalog lookup tests will fail.
   - If prices contain fractional cents or strings, `Number.isInteger(metrics.grossRevenue)` in Tier 2.3 will fail.
