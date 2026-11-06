## 2026-11-06T09:19:09Z
You are M3 UI & Dashboard Worker (`teamwork_worker`).
Your Working Directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/worker
Orchestrator Working Directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/orchestrator
Authoritative Request: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
Parent Orchestrator Conversation ID: 5224ce45-0d56-4e58-a11c-1bab000d62c3

CRITICAL: Before writing any code, READ /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively the following 4 files:
1. `src/app/api/admin/analytics/route.ts`
2. `src/app/admin/(panel)/analytics/page.tsx`
3. `src/components/admin/AnalyticsDashboard.tsx`
4. `src/app/admin/(panel)/page.tsx`

DO NOT touch any other source or test files.

SPECIFICATION & ARTIFACT BLUEPRINTS:
1. `src/app/api/admin/analytics/route.ts`:
   - Inspect `.agents/teamwork/milestone_3/explorer_1/proposed_route.ts`.
   - Export `GET(req: NextRequest)`.
   - Check authentication using `getSession()`: if null, return 401 unauthenticated `{ error: "Unauthorized" }`.
   - Call `getVisitAnalytics()`.
   - If `session.role === "ADMIN"`:
     - Call `getCakeSalesMetrics()` and `getAllOrders()`.
     - Return 200 `{ role: "ADMIN", visits, financials, orders }`.
   - If `session.role === "SEO_SPECIALIST"`:
     - Return 200 `{ role: "SEO_SPECIALIST", visits }`.
     - STRICT RBAC REQUIREMENT: `financials` and `orders` keys MUST BE COMPLETELY OMITTED from the response JSON (not null, not undefined, not empty object; `Object.keys(payload)` must not include "financials" or "orders").
   - Handle unexpected errors cleanly with 500 status.

2. `src/app/admin/(panel)/analytics/page.tsx`:
   - Inspect `.agents/teamwork/milestone_3/explorer_2/proposed_page.tsx`.
   - Next.js Server Component.
   - Check `getSession()`. If not authenticated, redirect to `/admin/login`.
   - Fetch `getVisitAnalytics()`.
   - If `session.role === "ADMIN"`: fetch `getCakeSalesMetrics()` and `getAllOrders()`.
   - If `session.role !== "ADMIN"`: do NOT query DB for orders or financials (pass undefined/null).
   - Render `<AnalyticsDashboard />` with `role={session.role}`, `initialVisits={visits}`, `initialFinancials={financials}`, `initialOrders={orders}`.

3. `src/components/admin/AnalyticsDashboard.tsx`:
   - Inspect `.agents/teamwork/milestone_3/explorer_2/proposed_AnalyticsDashboard.tsx`.
   - Next.js Client Component ("use client").
   - Follow AURA luxury aesthetic (obsidian background `#0B0B0C`, dark metallic slate surfaces, gold `#D4AF37` / `#C5A059` accents, crisp tracking and typography).
   - Traffic Section (for BOTH `ADMIN` and `SEO_SPECIALIST`):
     - 4 KPI cards: Total site impressions, Normal user visits, Automated bot visits, Human/bot ratio.
     - 3 bot breakdown cards: AI Crawlers, Search Engine Bots, Scrapers & Security.
     - Interactive SVG daily trends chart (displaying daily user vs bot traffic).
     - Recent visits table with IP address column, User-Agent, Category, Timestamp.
     - Export / Refresh action buttons.
   - Financial Section (rendered ONLY if `role === "ADMIN"` and `initialFinancials` is provided; COMPLETELY ABSENT from DOM for `SEO_SPECIALIST`):
     - 5 Financial KPI cards: Net Revenue, Gross Sales, Cancelled Revenue, Cakes Sold (Bought Count), Total Cancelled Orders.
     - Per-cake sales performance table with net revenue calculation.
     - Live Order Management table with real-time "Cancel Order" action calling `PATCH /api/admin/orders/[id]`.
     - Proper error handling and instant UI update on cancellation.

4. `src/app/admin/(panel)/page.tsx`:
   - Inspect `.agents/teamwork/milestone_3/explorer_3/handoff.md` §3.
   - Ensure `session = await getSession()` check is preserved.
   - In parallel `Promise.all`: fetch `getAllCakes()`, `getAllPagesSeo()`, `getRobotsConfig()`, `getDatabaseStatus()`, `getVisitAnalytics()`, and `session.role === "ADMIN" ? getCakeSalesMetrics() : Promise.resolve(null)`.
   - Retain existing Overview layout and catalog cards, and integrate the Role-Gated Summary Analytics KPI Cards grid:
     - For `ADMIN`: Render traffic KPI cards (Total visits, Human vs Bot ratio) AND financial KPI cards (Net Cake Revenue, Cakes Sold, Cancelled Orders).
     - For `SEO_SPECIALIST`: Render traffic KPI cards ONLY (Total visits, Human visitors, Automated bot visits); NEVER render financial KPI cards.

VERIFICATION STEPS:
Execute and verify each of the following:
1. `npx tsc --noEmit` (zero TypeScript compilation errors)
2. `npx eslint src` (clean linting)
3. `pnpm vitest run --fileParallelism=false --maxWorkers=1 tests/analytics-suite.test.ts` (all 95 tests pass)
4. `pnpm vitest run --fileParallelism=false --maxWorkers=1 tests/analytics-suite.test.ts tests/seo-suite.test.ts tests/visit-ingestion.test.ts tests/m1-challenger-stress.test.ts tests/m1-challenger-1-stress.test.ts tests/m2-challenger-revenue-stress.test.ts tests/m2-challenger-2-stress.test.ts tests/m2-reviewer-2-audit.test.ts` (all 251+ tests pass)
5. `pnpm build` (production build succeeds with zero errors)
