# Handoff Report — Survey Explorer 2: Data Models, ORM, Seed Data & Catalog/Orders

**Author**: Survey Explorer 2 (`teamwork_explorer_survey_2`)  
**Mission**: Investigate the data layer, Prisma schema, database provider, seed scripts, cake catalog, ordering flows, and visit/order analytics requirements.  
**Target File**: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/teamwork_explorer_survey_2/handoff.md`  

---

## 1. Observation

### 1.1 Database Provider and Existing Prisma Models
- **File**: `prisma/schema.prisma`
  - Database Provider: PostgreSQL (`provider = "postgresql"`, lines 5-8):
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
  - Existing models:
    - `User` (lines 10-18): `id` (cuid), `email` (unique), `passwordHash`, `name`, `role` (`Role`), `createdAt`, `updatedAt`.
    - `Role` enum (lines 110-113): `ADMIN`, `SEO_SPECIALIST`.
    - `Cake` (lines 20-48): `id` (cuid), `slug` (unique), `name`, `tagline`, `occasion`, `price Float`, `image`, `imageAlt`, `imageCaption`, `finishColor`, `swatchName`, `servings`, `tiers Int`, `isNew Boolean`, `flavors String[]`, `description`, `tastingNotes String[]`, `dimensions`, `leadTime`, `metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `rawJsonLd`, `createdAt`, `updatedAt`, `faqs CakeFaq[]`.
    - `CakeFaq` (lines 50-59): `id`, `cakeId`, `question`, `answer`, `order Int`, `cake Cake`.
    - `PageSeo` (lines 61-73) and `PageFaq` (lines 75-84).
    - `RobotsConfig` (lines 86-96): AI crawler flags (`gptBotAllowed`, `perplexityBotAllowed`, `claudeBotAllowed`, `googleExtendedAllowed`, `ccBotAllowed`), `customRules`, `sitemapUrl`.
    - `SiteSettings` (lines 98-108): `siteName`, `siteUrl`, `currency` (default "USD"), contact details.
  - **No `Order` model** currently exists in `prisma/schema.prisma`.
  - **No `Visit` or `PageVisit` model** currently exists in `prisma/schema.prisma`.
  - Note on PostgreSQL features: `flavors String[]` and `tastingNotes String[]` use native PostgreSQL array types.

### 1.2 Database Resilience & Dual-Store Architecture
- **File**: `src/lib/data-service.ts`
  - Lines 13-48 implement an in-memory runtime fallback cache:
    ```typescript
    class FallbackStore {
      cakes: SeedCake[] = JSON.parse(JSON.stringify(SEED_CAKES));
      pages: SeedPageSeo[] = JSON.parse(JSON.stringify(SEED_PAGES));
      robots = { ...SEED_ROBOTS };
      settings = { ...SEED_SETTINGS };
    }
    const globalStore = globalThis as unknown as { __auraStore?: FallbackStore };
    if (!globalStore.__auraStore) {
      globalStore.__auraStore = new FallbackStore();
    }
    const store = globalStore.__auraStore;
    ```
  - Line 32 defines `isDbAvailable(force = false): Promise<boolean>`. If `prisma.$queryRaw\`SELECT 1\`` fails or PostgreSQL is unreachable, all CRUD queries fallback to `store.cakes`, `store.pages`, `store.robots`, `store.settings`.
  - `.env` line 2 sets `DATABASE_URL="postgresql://your_user:your_password@localhost:5432/cake_app?schema=public"` (a placeholder connection string).
  - Terminal test command `pnpm test` executes Vitest tests against this fallback store, with **31 of 31 tests passing in ~1.5s** without requiring an active PostgreSQL database.

### 1.3 Database Seed Scripts and Execution Flow
- **File**: `package.json`
  - Line 10: `"seed": "prisma db seed"`
  - Lines 13-15: `"prisma": { "seed": "tsx prisma/seed.ts" }`
- **File**: `prisma/seed.ts`
  - Upserts `SEED_USERS`, `SEED_CAKES`, `SEED_PAGES`, `SEED_ROBOTS`, and `SEED_SETTINGS`.
  - Does not seed orders or visits currently.
- **File**: `src/lib/seed-data.ts`
  - Defines static seed data for 6 cakes:
    1. `The Elysian Grand Tier` (`elysian-wedding-tier`): price $680
    2. `The Seraphina Blush` (`blush-seraphina-birthday`): price $195
    3. `The Nocturne Reserve` (`nocturne-anniversary-velvet`): price $360
    4. `The Céleste Cloud` (`celeste-baby-shower`): price $320
    5. `The Solaris Cube Gala` (`solaris-gala-architectural`): price $850
    6. `The Rosalia Mirror` (`rosalia-intimate-romance`): price $165
  - Defines 2 initial users in `SEED_USERS`:
    - `admin@aurapatisserie.com` (`Role`: `ADMIN`, password: `Admin@Aura2026!`)
    - `seo@aurapatisserie.com` (`Role`: `SEO_SPECIALIST`, password: `Seo@Aura2026!`)

### 1.4 Existing Cake Catalog & Ordering Flow
- **Price Format**: Stored as standard numbers / `Float` representing whole dollars in USD (e.g. `680`, `195`, `360`, `320`, `850`, `165`). Not stored in cents.
- **File**: `src/components/CartDrawer.tsx`
  - Local cart state allows items to be added, quantity adjusted, and courier fee calculated (`courierFee = subtotal >= 300 ? 0 : 45`).
  - Lines 65-71 contain mock checkout logic:
    ```typescript
    const handleCheckout = () => {
      setIsCheckingOut(true);
      setTimeout(() => {
        setIsCheckingOut(false);
        setOrderConfirmed(true);
      }, 1500);
    };
    ```
  - No network request or API call is made to persist orders.
- **File**: `src/components/CakeDetailClient.tsx`
  - Lines 35-38 contain a mock `handleAddToCart`: `setAdded(true); setTimeout(() => setAdded(false), 2500);`.

### 1.5 Admin Panel Layout, Navigation & RBAC
- **File**: `src/app/admin/(panel)/layout.tsx`
  - Lines 30-65 define the sidebar navigation:
    - `/admin` (Dashboard)
    - `/admin/cakes` (Cake Portfolio & SEO)
    - `/admin/pages` (Page SEO & Meta)
    - `/admin/robots` (Robots & AI Crawlers)
    - `/admin/sitemap` (XML Sitemap)
    - If `session.role === "ADMIN"`: `/admin/users` (Team & Roles RBAC)
  - **No `/admin/analytics` link** is present yet in navigation.
- **File**: `src/app/admin/(panel)/page.tsx`
  - Lines 77-120 display 4 KPI cards: Cake Inventory, Catalog SEO Score, Indexed FAQs, AI Crawlers Allowed.
  - No visit metrics or revenue/order KPI cards are currently rendered.
- **File**: `src/lib/auth.ts`
  - Lines 7-14 define `UserRole = "ADMIN" | "SEO_SPECIALIST"` and `SessionUser`.
  - Lines 80-120 authenticate credentials via Prisma user table, with fallback to `SEED_USERS`.

### 1.6 Next.js 16 Breaking Conventions
- **Docs**: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`
  - Line 11 explicitly documents: `"The middleware.js file convention has been deprecated in Next.js 16 and renamed to proxy.js."`
  - In Next.js 16, intercepting proxies must use `proxy.ts` (or named export `proxy`), not `middleware.ts`.
  - Next.js dynamic APIs (`cookies()`, `params`) are asynchronous in Next.js 16.

---

## 2. Logic Chain

1. **Dual-Layer Persistence Necessity (Obs. 1.1, 1.2)**:
   - In production with PostgreSQL available, Prisma ORM is used.
   - However, during automated tests (`pnpm test`) and in CI/CD environments where PostgreSQL is not provisioned or running, `isDbAvailable()` returns `false` and the app relies on `FallbackStore`.
   - Therefore, any new models (`Order`, `Visit`) must be implemented both in `prisma/schema.prisma` AND in `src/lib/data-service.ts`'s `FallbackStore`. If only Prisma is modified without updating `FallbackStore`, test execution and offline environments will fail or behave inconsistently.

2. **Order Lifecycle & Revenue Computation (Obs. 1.3, 1.4, ORIGINAL_REQUEST R2)**:
   - R2 requires:
     - Storing cake reference, price, timestamp, and status (`ACTIVE` vs `CANCELLED`).
     - Placing an order increments the bought count and updates total cake revenue.
     - Cancelling an order updates the cancellation count and adjusts net revenue calculations.
     - Seed orders must populate initial revenue, bought count, and cancellation counts.
   - To satisfy this deterministically:
     - `boughtCount` = total count of placed orders (or quantity bought).
     - `cancelledCount` = total count of cancelled orders.
     - `netRevenue` = sum of (price * quantity) of all non-cancelled orders (i.e., `status !== "CANCELLED"`).
     - Per-cake breakdown must compute `boughtCount`, `cancelledCount`, and `netRevenue` per cake ID/slug.
   - Prices must remain consistent with existing schema: `Float` in USD dollars (e.g., 680, 195).

3. **Visit Classification & Analytics Logic (Obs. 1.1, 1.5, 1.6, ORIGINAL_REQUEST R1)**:
   - R1 requires inspecting request `User-Agent` headers to categorize visits:
     - Normal User Visits: Standard browsers (`Chrome`, `Safari`, `Firefox`, `Edge`, mobile browsers) without bot keywords.
     - Bot Visits: AI crawlers (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `anthropic-ai`, `Bytespider`, `cohere-ai`, `OAI-SearchBot`), search engine crawlers (`Googlebot`, `Bingbot`, `Slurp`, `DuckDuckBot`, `Baiduspider`, `YandexBot`), and automated tools (`curl`, `wget`, `python-requests`, `headless`, `spider`, `crawler`).
   - Because search bots and AI crawlers do not execute client-side JavaScript, visits must be recorded on the server side (via Next.js 16 `proxy.ts` or layout/API ingestion). Client navigation can also log visits via `POST /api/analytics/track`.
   - Initial seed visits (`SEED_VISITS`) must include realistic normal user visits and bot visits across recent timestamps to display trends and comparison immediately upon startup.

4. **Role-Based Access Control & Navigation (Obs. 1.5, ORIGINAL_REQUEST R3)**:
   - `/admin/analytics` must be added to navigation in `src/app/admin/(panel)/layout.tsx` for both `ADMIN` and `SEO_SPECIALIST`.
   - When viewed by `SEO_SPECIALIST`:
     - User vs. bot visit counts, bot category breakdown, and visit trends are visible.
     - All financial/revenue metrics, bought counts, cancellation counts, and order tables are completely hidden.
   - When viewed by `ADMIN`:
     - Both visit analytics and order/revenue analytics (total net revenue, bought count, cancelled count, per-cake metrics, order management list with cancellation actions) are fully visible.
   - On the main dashboard (`/admin`):
     - `ADMIN`: Shows financial KPI cards (Net Revenue, Bought Count, Cancelled Count) alongside visit KPI cards.
     - `SEO_SPECIALIST`: Shows visit KPI cards (Normal User Visits, Bot Visits) alongside SEO health cards, with all financial KPI cards omitted.

---

## 3. Caveats

1. **PostgreSQL Container vs Standby Store**: A PostgreSQL 15 container is present on the host machine (`finland_dubai_carparts`), but the local `.env` has placeholder credentials. All unit tests and local dev operate reliably through `FallbackStore`. Schema additions to `prisma/schema.prisma` should maintain parity with `FallbackStore`.
2. **Next.js 16 Proxy Convention**: Next.js 16 replaces `middleware.ts` with `proxy.ts`. Any request interception must be implemented in `src/proxy.ts` (or `proxy.ts` at root) rather than `middleware.ts` to adhere to Next.js 16 standards.
3. **Cart Item Structure**: In `CartDrawer.tsx`, users can add multiple items in one cart session. Each item ordered should create an individual `Order` record referencing its `cakeId`, price, and quantity, or a batch order with line items. Linking directly by `cakeId` allows direct aggregation of revenue and bought counts per cake.

---

## 4. Conclusion & Recommended Design

### 4.1 Schema Additions in `prisma/schema.prisma`
```prisma
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
  cake          Cake?       @relation(fields: [cakeId], references: [id], onDelete: SetNull)

  @@index([cakeId])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  ACTIVE
  CANCELLED
}

model Visit {
  id        String   @id @default(cuid())
  path      String   @default("/")
  userAgent String
  isBot     Boolean  @default(false)
  botName   String?
  ip        String?
  createdAt DateTime @default(now())

  @@index([isBot])
  @@index([createdAt])
}
```
Add reverse relation to `Cake`:
```prisma
model Cake {
  // ... existing fields ...
  orders Order[]
}
```

### 4.2 Seed Data Additions (`src/lib/seed-data.ts`)
- **`SeedOrder` Interface**:
  ```typescript
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
- **`SEED_ORDERS`**: Provide 12–16 realistic seed orders across all 6 cakes, with 2–4 in `CANCELLED` status and the remainder in `ACTIVE` status.
- **`SeedVisit` Interface**:
  ```typescript
  export interface SeedVisit {
    id: string;
    path: string;
    userAgent: string;
    isBot: boolean;
    botName?: string;
    createdAt: string;
  }
  ```
- **`SEED_VISITS`**: Provide 80–120 realistic seed visit records (both standard browser UAs and bot UAs like GPTBot, ClaudeBot, Googlebot, PerplexityBot) across recent days.

### 4.3 Data Layer & Analytics Service (`src/lib/data-service.ts`)
- Update `FallbackStore`:
  ```typescript
  class FallbackStore {
    cakes: SeedCake[] = JSON.parse(JSON.stringify(SEED_CAKES));
    pages: SeedPageSeo[] = JSON.parse(JSON.stringify(SEED_PAGES));
    robots = { ...SEED_ROBOTS };
    settings = { ...SEED_SETTINGS };
    orders: SeedOrder[] = JSON.parse(JSON.stringify(SEED_ORDERS));
    visits: SeedVisit[] = JSON.parse(JSON.stringify(SEED_VISITS));
  }
  ```
- Expose methods:
  - `recordVisit({ path, userAgent, ip })`
  - `getVisitAnalytics()`: returns `{ totalVisits, normalUserVisits, botVisits, botBreakdown, recentVisits, trends }`
  - `getAllOrders()`: returns all orders sorted by date
  - `createOrder(orderData)`: increments bought count and gross revenue
  - `cancelOrder(orderId)`: updates status to `CANCELLED`, adjusts net revenue and cancellation count
  - `getCakeSalesMetrics()`: calculates `totalBoughtCount`, `totalCancelledCount`, `grossRevenue`, `cancelledRevenue`, `netRevenue`, and `perCake` breakdown

### 4.4 APIs & UI Touchpoints
1. `POST /api/orders`: creates real orders when checkout is submitted from `CartDrawer.tsx`.
2. `PATCH /api/admin/orders/[id]`: cancels an order (restricted to role `ADMIN`).
3. `GET /api/admin/analytics`: returns visit analytics and, if `ADMIN`, returns revenue/order analytics.
4. `/admin/analytics`: dedicated analytics page in admin layout.
5. `/admin`: main dashboard displaying role-filtered KPI summary cards.

---

## 5. Verification Method

### Independent Verification Commands
1. **Type Check**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected outcome*: Exit code 0, zero TypeScript errors.

2. **Automated Test Suite**:
   ```bash
   pnpm test
   ```
   *Expected outcome*: Vitest executes all test files in `tests/` with 0 failures.

3. **Prisma Generation & Validation**:
   ```bash
   pnpm prisma validate
   ```
   *Expected outcome*: Prisma schema passes syntax and relation validation.

### Invalidation Conditions
- Any change that breaks fallback store compatibility when PostgreSQL is offline.
- Any User-Agent from standard browsers (e.g. Chrome, Safari, Firefox) erroneously classified as a bot, or crawler UAs (e.g. GPTBot, Googlebot) classified as normal users.
- Net revenue formula not reflecting `grossRevenue - cancelledRevenue` (or omitting cancelled deductions).
- `SEO_SPECIALIST` role being able to see revenue or order metrics on `/admin` or `/admin/analytics`.
