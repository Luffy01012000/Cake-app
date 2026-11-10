# Handoff Report: Survey Explorer 1 — Architecture, Routing, Navigation & RBAC

## 1. Observation

### 1.1 Next.js Version, Conventions & Breaking Changes
- **Package Versions** (`package.json:21-24`):
  - Next.js: `16.4.3`
  - React: `19.3.0` & React-DOM: `19.3.0`
  - Prisma: `6.19.3` (`@prisma/client: ^6.19.3`)
  - Jose: `6.2.15`
  - Bcryptjs: `3.0.3`
  - Vitest: `5.1.0`
- **Next.js 16 Breaking Changes** (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md:11-13` and `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md:15-17`):
  - `middleware.js|ts` is **deprecated** in Next.js 16 and renamed to `proxy.js|ts`:
    > "The `middleware.js` file convention has been **deprecated** in Next.js 16 and renamed to `proxy.js`. All functionality remains the same — only the file and export names have changed."
    > "Create a `proxy.ts` (or `.js`) file in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`."
    > Export convention: `export function proxy(request: NextRequest)` or `export default function proxy(request: NextRequest)`.
  - Dynamic request APIs are asynchronous: `await cookies()` and `await headers()` are required (e.g. `src/lib/auth.ts:50`: `const cookieStore = await cookies();`).
  - Cache Components & Partial Prerendering (PPR) are active during `pnpm build`.

### 1.2 Admin Panel Structure & Layout
- **Route Group**: `src/app/admin/(panel)/`
- **Layout** (`src/app/admin/(panel)/layout.tsx:17-66`):
  - Server Component: `export default async function AdminPanelLayout({ children })`
  - Session verification:
    ```ts
    const session = await getSession();
    if (!session) {
      redirect("/admin/login");
    }
    ```
  - Navigation array (`src/app/admin/(panel)/layout.tsx:30-65`):
    ```ts
    const navigation = [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Cake Portfolio & SEO", href: "/admin/cakes", icon: Cake },
      { name: "Page SEO & Meta", href: "/admin/pages", icon: FileText },
      { name: "Robots & AI Crawlers", href: "/admin/robots", icon: Bot },
      { name: "XML Sitemap", href: "/admin/sitemap", icon: MapPin },
      ...(session.role === "ADMIN"
        ? [{ name: "Team & Roles (RBAC)", href: "/admin/users", icon: Users }]
        : []),
    ];
    ```
    *Observation*: Currently, `/admin/analytics` does NOT exist in the `navigation` array or filesystem.
- **Top Header Actions** (`src/components/admin/AdminHeaderActions.tsx:57-64`):
  - Displays user name, user email, and role badge (`Admin` with blue styling or `SEO Specialist` with purple styling).
  - Contains sign-out handler calling `/api/auth/logout`.
- **Main Dashboard Page** (`src/app/admin/(panel)/page.tsx:22-142`):
  - Renders 4 KPI cards: Cake Inventory, Catalog SEO Score, Indexed FAQs, and AI Crawlers Allowed.
  - Currently does not inspect `session.role` inside `AdminDashboardPage` nor display visit metrics or financial KPI cards.

### 1.3 Authentication & RBAC System
- **Role Model & Enums** (`prisma/schema.prisma:110-113` & `src/lib/auth.ts:7-14`):
  ```prisma
  enum Role {
    ADMIN
    SEO_SPECIALIST
  }
  ```
  ```ts
  export type UserRole = "ADMIN" | "SEO_SPECIALIST";
  export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }
  ```
- **JWT & Session Cookie** (`src/lib/auth.ts:16-69`):
  - Cookie name: `aura_session` (`httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `maxAge: 7 days`).
  - Signed via `jose` `SignJWT` HS256 with secret `JWT_SECRET`.
  - Verifiable synchronously/asynchronously via `verifySessionToken(token: string)`.
  - Server retrieval via `getSession()`: `const cookieStore = await cookies(); const token = cookieStore.get("aura_session")?.value;`.
- **Pre-seeded Accounts** (`src/lib/seed-data.ts:412-425`):
  1. `admin@aurapatisserie.com` — Role: `ADMIN`, Password: `Admin@Aura2026!`
  2. `seo@aurapatisserie.com` — Role: `SEO_SPECIALIST`, Password: `Seo@Aura2026!`
- **Credential Fallback** (`src/lib/auth.ts:80-120`):
  - Checks Prisma `prisma.user.findUnique`. If DB lookup fails or database is unavailable, checks `SEED_USERS` fallback credentials.
- **Existing RBAC Enforcement Patterns**:
  - Server Component Page Level (`src/app/admin/(panel)/users/page.tsx:11-25`):
    ```ts
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return <AdministratorRoleRequiredNotice />;
    }
    ```
  - API Route Level (`src/app/api/admin/users/route.ts:8-18`):
    ```ts
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden: Admin role required..." }, { status: 403 });
    ```

### 1.4 Resilient Dual-Mode Data Architecture
- **In-Memory Fallback Cache** (`src/lib/data-service.ts:13-26`):
  - `FallbackStore` attached to `globalThis.__auraStore` ensures state persists across module reloads in Node.js runtime.
  - When PostgreSQL is disconnected, `isDbAvailable()` returns `false`, and all reads/writes fallback gracefully to `FallbackStore`.
- **Environment Status** (`.env:1-3`):
  - `DATABASE_URL` is configured with placeholder credentials (`localhost:5432/cake_app`), meaning the application operates in Standby In-Memory Fallback mode by default unless an active PostgreSQL instance is configured.

### 1.5 Shopping Cart & Ordering State
- **Cart Checkout** (`src/components/CartDrawer.tsx:65-71`):
  - Currently simulates checkout with a client-side timer:
    ```ts
    const handleCheckout = () => {
      setIsCheckingOut(true);
      setTimeout(() => {
        setIsCheckingOut(false);
        setOrderConfirmed(true);
      }, 1500);
    };
    ```
  - No order persistence or API call exists yet for orders or order cancellation.

### 1.6 Existing Automated Test Suite
- Tool run `pnpm test`:
  - Output: `31 passed (31)` in `tests/seo-suite.test.ts` (1417ms test execution).
  - RBAC test exists at `tests/seo-suite.test.ts:555-582` verifying JWT signing, verifying, and role separation between `ADMIN` and `SEO_SPECIALIST`.

---

## 2. Logic Chain

1. **Next.js 16 File Convention Compliance**:
   - *From Observation 1.1*: Next.js 16 has officially deprecated `middleware.ts` in favor of `proxy.ts`. Therefore, request interception / traffic monitoring should follow the Next.js 16 `proxy.ts` convention (`src/proxy.ts` exporting `proxy(request)`).
   - Alternatively or complementary to `src/proxy.ts`, server-side request tracking can be performed via route handlers (`/api/analytics/track`) and a centralized classification library (`src/lib/analytics.ts` or `src/lib/traffic.ts`).

2. **Navigation & Route Integration for Requirement R3**:
   - *From Observation 1.2*: Admin panel navigation is centrally defined in `src/app/admin/(panel)/layout.tsx:30-65`.
   - Both `ADMIN` and `SEO_SPECIALIST` roles need access to `/admin/analytics`.
   - Therefore, adding an entry `{ name: "Analytics & Traffic", href: "/admin/analytics", icon: BarChart3 }` to `navigation` makes it immediately accessible to both roles in the sidebar.
   - Creating `src/app/admin/(panel)/analytics/page.tsx` within the `(panel)` route group inherits `AdminPanelLayout`'s session check automatically, guaranteeing that unauthenticated users are redirected to `/admin/login`.

3. **RBAC Data Isolation (Admin vs. SEO Specialist)**:
   - *From Observation 1.2, 1.3 & Requirements R3*:
     - `SEO_SPECIALIST` role: Can view normal user vs. bot visit analytics. Must NOT see cake revenue, bought counts, or cancellation counts.
     - `ADMIN` role: Can view visit analytics AND all financial/order metrics (cake revenue, bought count, cancellation count).
   - *Logic for `/admin/analytics` page*:
     - The page component checks `session.role`.
     - When `session.role === "SEO_SPECIALIST"`, render the User vs. Bot traffic cards and charts, and omit/hide all financial and order management cards.
     - When `session.role === "ADMIN"`, render both the traffic metrics and the full cake sales revenue, quantity bought, cancellation counts, and order management/cancellation UI.
   - *Logic for `/api/admin/analytics` route*:
     - The API endpoint checks `session.role`.
     - For `SEO_SPECIALIST`, sanitize the response payload so that revenue, bought count, and cancellation counts are NOT transmitted in the JSON response at all (preventing client-side inspection leakage).
     - For `ADMIN`, return the complete dataset including revenue and order breakdown.
   - *Logic for `/admin` Dashboard KPI Cards*:
     - `src/app/admin/(panel)/page.tsx` can retrieve `session = await getSession();`.
     - In the KPI grid, include visit summary cards (Total Visits, Bot vs. User ratio) for both roles.
     - Conditionally include Net Revenue, Total Cakes Sold, and Cancelled Orders cards ONLY if `session.role === "ADMIN"`.

4. **Visit Analytics (R1) Classification Logic**:
   - *From Requirement R1*: User-Agent headers must distinguish normal web browsers from automated crawlers and bots (search engine bots, AI crawlers, scrapers).
   - Common crawler/bot signatures include:
     - AI Crawlers: `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Claude-Web`, `Google-Extended`, `CCBot`, `Applebot-Extended`, `Bytespider`, `Diffbot`, `ImagesiftBot`, `Cohere-ai`.
     - Search Engine Bots: `Googlebot`, `Bingbot`, `Slurp`, `DuckDuckBot`, `Baiduspider`, `YandexBot`, `Sogou`.
     - Automated Tools & Scrapers: `curl`, `Wget`, `python-requests`, `Scrapy`, `HeadlessChrome`, `lighthouse`, `PostmanRuntime`, `axios`.
   - A pure helper function `classifyUserAgent(ua: string | null | undefined): "USER" | "BOT"` should be exposed in `src/lib/analytics.ts` so it can be thoroughly unit-tested with Vitest.

5. **Order, Revenue & Cancellation Logic (R2)**:
   - *From Observation 1.4 & 1.5*:
     - `CartDrawer.tsx` currently mocks checkout; it should execute a `fetch("/api/orders", { method: "POST", ... })` to persist the order.
     - In `src/lib/data-service.ts`, add order state to `FallbackStore` (`orders: OrderRecord[]`) and seed with realistic initial orders (including both completed and cancelled orders) so that revenue, bought count, and cancellation counts are pre-populated upon startup.
     - Total bought count: Count of all created orders.
     - Cancellation count: Count of orders with status `"CANCELLED"`.
     - Net Cake Sales Revenue: `Sum of prices of all completed orders` (or `Total ordered price minus cancelled order prices`).
     - Admin order cancellation endpoint: `POST /api/admin/orders/[id]/cancel` allows admin users to cancel orders and automatically update cancellation counts and net revenue.

---

## 3. Caveats

1. **Database Mode**:
   - The application is architected to operate with either PostgreSQL Prisma OR the in-memory `FallbackStore`. Any new data models (`Order`, `Visit`) should be defined in both `prisma/schema.prisma` (for production DB) AND `FallbackStore` in `src/lib/data-service.ts` (for test and offline environments) to guarantee zero regressions.
2. **Proxy vs. Route Tracking**:
   - In Next.js 16, `proxy.ts` runs prior to route handlers. Because Next.js Proxy runs in a lightweight runtime, writing directly to disk or synchronous shared singletons from `proxy.ts` can be complemented by an internal API route (`/api/analytics/track`) or direct server component invocation during page render (`src/app/page.tsx`, `src/app/cakes/[slug]/page.tsx`).
3. **No Existing Order Model in Schema**:
   - Currently, `prisma/schema.prisma` does not have an `Order` or `Visit` table. These should either be added to Prisma schema or managed via `data-service.ts` resilient storage.

---

## 4. Conclusion

The application has a clean, well-architected Next.js 16 App Router foundation with an established JWT session mechanism and role-based access control.

To satisfy all requirements:
1. **Routing & Sidebar**: Add `/admin/analytics` to `navigation` in `src/app/admin/(panel)/layout.tsx` for both `ADMIN` and `SEO_SPECIALIST`.
2. **Dedicated Page & RBAC**: Create `src/app/admin/(panel)/analytics/page.tsx` and an accompanying client component (`AnalyticsDashboard.tsx`). Restrict financial and order metrics so they are visible only to `ADMIN`.
3. **Dashboard Summary Cards**: Update `src/app/admin/(panel)/page.tsx` to read the session role and display summary KPI cards (visit metrics for both roles; revenue, bought count, and cancellation count for `ADMIN` only).
4. **Traffic Classification**: Implement `classifyUserAgent()` and visit tracking storage in `src/lib/analytics.ts`, integrated via `src/proxy.ts` and/or page tracking.
5. **Order Lifecycle**: Implement `Order` storage and calculations in `src/lib/data-service.ts` seeded with realistic orders, hook up `CartDrawer.tsx` to `POST /api/orders`, and provide cancellation actions for `ADMIN`.
6. **Automated Testing**: Add automated Vitest tests covering visit classification, revenue/cancellation formulas, and RBAC visibility restrictions.

---

## 5. Verification Method

### 5.1 Project Test Command
Execute the Vitest suite:
```bash
pnpm test
```
*Expected Result*: All existing 31 tests plus newly added analytics and RBAC tests pass with exit code 0.

### 5.2 Build Verification Command
Run the production build with Turbopack:
```bash
pnpm build
```
*Expected Result*: Build completes with zero TypeScript or bundling errors, generating `/admin/analytics` and dynamic API routes.

### 5.3 Files to Inspect for Verification
1. `src/app/admin/(panel)/layout.tsx`: Verify `/admin/analytics` is present in `navigation`.
2. `src/app/admin/(panel)/page.tsx`: Verify role-gated KPI cards for visits (all roles) and revenue/orders (admin only).
3. `src/app/admin/(panel)/analytics/page.tsx`: Verify dedicated analytics page renders visit metrics for `SEO_SPECIALIST` and full financial metrics for `ADMIN`.
4. `src/lib/auth.ts`: Verify `UserRole` and session retrieval consistency.
5. `src/lib/analytics.ts` (or equivalent): Verify regex patterns for browser vs. crawler classification.
6. `src/components/CartDrawer.tsx`: Verify active order submission.

### 5.4 Invalidation Conditions
- If `pnpm build` fails due to Next.js 16 conventions (e.g., using deprecated `middleware.ts` instead of `proxy.ts`, or forgetting `await cookies()`).
- If an `SEO_SPECIALIST` user is able to view or receive revenue, bought counts, or cancelled counts in `/admin`, `/admin/analytics`, or API responses.
- If order placement or cancellation fails to update revenue or counts accurately.
