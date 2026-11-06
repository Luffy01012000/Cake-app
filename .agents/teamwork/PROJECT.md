# Project: AURA Luxury Cake Patisserie - Production Analytics Panel

## Architecture
- **Framework**: Next.js 16.4.3 (App Router), React 19.3.0, Prisma 6.19.3, Vitest 5.1.0.
- **Next.js 16 Conventions**: Use `src/proxy.ts` for request interception (Next.js 16 deprecates `middleware.ts`). `cookies()` and `headers()` are asynchronous.
- **Data Persistence**: Dual-store resilient architecture in `src/lib/data-service.ts`. Production uses PostgreSQL via Prisma; test and offline environments automatically fallback to in-memory `FallbackStore` on `globalThis.__auraStore` seeded from `src/lib/seed-data.ts`. All data methods must operate consistently across both stores.
- **Authentication & RBAC**: JWT session cookie `aura_session` signed via `jose` HS256. Roles: `ADMIN` and `SEO_SPECIALIST`. Data redaction enforced at both API route and server/client component levels.
- **Testing**: Vitest in pure Node.js environment (`vitest.config.mts`). Zero DOM dependency; tests target services, data calculations, utility classifiers, and RBAC visibility.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | User-Agent Classification | Classify incoming request User-Agent as normal browser vs bot/crawler (AI crawlers, search bots, scrapers) | M1 | ORIGINAL_REQUEST R1 |
| F2 | Visit Storage & Ingestion | Persist visits in Prisma `Visit` model and `FallbackStore`, with server-side capture via `src/proxy.ts` and `/api/analytics/track` | M1 | ORIGINAL_REQUEST R1 |
| F3 | Visit Trends & Aggregation | Compute total visits, normal visits, bot visits, bot category breakdown, and timestamp trends | M1 | ORIGINAL_REQUEST R1 |
| F4 | Order Data Model & Seed Orders | Store cake reference, price, timestamp, quantity, and status (`ACTIVE` vs `CANCELLED`) with realistic seed orders | M2 | ORIGINAL_REQUEST R2 |
| F5 | Active Ordering Action | Enable checkout in UI (`CartDrawer.tsx`) to create real orders via `POST /api/orders` | M2 | ORIGINAL_REQUEST R2 |
| F6 | Order Cancellation Action | Allow admin to cancel orders via `PATCH /api/admin/orders/[id]` updating status to `CANCELLED` | M2 | ORIGINAL_REQUEST R2 |
| F7 | Revenue & Order Math | Compute bought counts, cancellation counts, gross revenue, and net revenue (`gross - cancelled`) catalog-wide and per-cake | M2 | ORIGINAL_REQUEST R2 |
| F8 | Sidebar Navigation | Add `/admin/analytics` to sidebar navigation for both `ADMIN` and `SEO_SPECIALIST` in `src/app/admin/(panel)/layout.tsx` | M3 | ORIGINAL_REQUEST R3 |
| F9 | Dedicated Analytics Page | `/admin/analytics` page rendering visit metrics (all roles) and financial/order metrics (ADMIN only) | M3 | ORIGINAL_REQUEST R3 |
| F10 | Admin Dashboard KPI Cards | Summary KPI cards on `/admin` reflecting role permissions (visit metrics for both roles; revenue/orders for ADMIN only) | M3 | ORIGINAL_REQUEST R3 |
| F11 | RBAC API & Data Isolation | `/api/admin/analytics` strictly redacts financial and order metrics for `SEO_SPECIALIST` requests | M3 | ORIGINAL_REQUEST R3 |
| F12 | Automated Vitest Suite | Comprehensive tests in `tests/analytics-suite.test.ts` covering classification, revenue math, ordering/cancellation, and RBAC | E2E Track & M-Final | ORIGINAL_REQUEST R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Design and implement complete opaque-box Vitest suite (`tests/analytics-suite.test.ts`) across Tiers 1-4 | none | DONE |
| M1 | Visit Analytics & Ingestion Core | UA classification utility, `Visit` model, seed visits, `recordVisit` / `getVisitAnalytics` in `data-service.ts`, `src/proxy.ts` | none | DONE |
| M2 | Cake Order & Revenue Tracking Core | `Order` model, seed orders, order creation API, order cancellation API, `CartDrawer.tsx` integration, revenue calculations | M1 | DONE |
| M3 | Role-Based UI, Dashboards & Navigation | Sidebar navigation link, dedicated `/admin/analytics` page, `/admin` summary KPI cards, RBAC API redaction | M1, M2 | IN_PROGRESS |
| M-Final | E2E Test Pass & Adversarial Hardening | 100% test suite pass, Tier 5 adversarial tests, Forensic Integrity Audit | E2E, M1, M2, M3 | PLANNED |

## Interface Contracts

### 1. User-Agent Classifier Contract (`src/lib/visit-utils.ts`)
```ts
export interface UAClassification {
  isBot: boolean;
  botName?: string;
  category: "BROWSER" | "AI_CRAWLER" | "SEARCH_BOT" | "SCRAPER_TOOL";
}
export function classifyUserAgent(ua: string | null | undefined): UAClassification;
```

### 2. Visit Analytics Contract (`src/lib/data-service.ts`)
```ts
export interface VisitRecord {
  id: string;
  path: string;
  userAgent: string;
  isBot: boolean;
  botName?: string;
  ip?: string;
  createdAt: string;
}

export interface VisitAnalyticsSummary {
  totalVisits: number;
  normalUserVisits: number;
  botVisits: number;
  botBreakdown: Record<string, number>;
  recentVisits: VisitRecord[];
}

export function recordVisit(data: { path: string; userAgent: string; ip?: string }): Promise<VisitRecord>;
export function getVisitAnalytics(): Promise<VisitAnalyticsSummary>;
```

### 3. Orders & Revenue Contract (`src/lib/data-service.ts`)
```ts
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

export function createOrder(data: {
  cakeId: string;
  cakeName?: string;
  customerName: string;
  customerEmail: string;
  price?: number;
  quantity?: number;
  deliveryDate?: string;
  notes?: string;
}): Promise<OrderRecord>;

export function cancelOrder(orderId: string): Promise<OrderRecord>;
export function getAllOrders(): Promise<OrderRecord[]>;
export function getCakeSalesMetrics(): Promise<CakeSalesMetrics>;
```

### 4. RBAC Analytics Summary Contract (`src/lib/data-service.ts` / API)
```ts
export interface AdminAnalyticsResponse {
  role: "ADMIN" | "SEO_SPECIALIST";
  visits: VisitAnalyticsSummary;
  financials?: CakeSalesMetrics;
  orders?: OrderRecord[];
}
```

## Code Layout
- `src/proxy.ts`: Next.js 16 request interceptor for visit logging and security headers.
- `src/lib/visit-utils.ts`: Regex & classification logic for User-Agent parsing.
- `src/lib/seed-data.ts`: Static definitions for `SEED_VISITS` and `SEED_ORDERS`.
- `src/lib/data-service.ts`: Extended `FallbackStore` and Prisma methods for visits, orders, and metrics.
- `prisma/schema.prisma`: `Order`, `OrderStatus`, `Visit` models with relation to `Cake`.
- `src/app/api/orders/route.ts`: Order placement endpoint.
- `src/app/api/admin/orders/[id]/route.ts`: Admin order cancellation endpoint.
- `src/app/api/admin/analytics/route.ts`: Role-gated analytics data endpoint.
- `src/app/api/analytics/track/route.ts`: Visit logging endpoint.
- `src/components/CartDrawer.tsx`: Updated with live checkout call.
- `src/app/admin/(panel)/layout.tsx`: Updated sidebar navigation with `/admin/analytics`.
- `src/app/admin/(panel)/page.tsx`: Updated dashboard with role-gated summary KPI cards.
- `src/app/admin/(panel)/analytics/page.tsx`: Dedicated analytics page with RBAC view separation.
- `src/components/admin/AnalyticsDashboard.tsx`: Interactive client analytics views, charts, and cancellation actions.
- `tests/analytics-suite.test.ts`: Complete Vitest test suite covering R1, R2, R3, R4.
