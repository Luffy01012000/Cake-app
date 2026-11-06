# Task: Milestone 3 Dedicated Analytics Page & Dashboard Component Exploration

## Objective
Investigate and specify:
1. `src/app/admin/(panel)/analytics/page.tsx`:
   - Server Component inspecting session via `getSession()`.
   - Redirect to `/admin/login` if not authenticated.
   - Fetch visit analytics and (if ADMIN) cake sales metrics and orders.
   - Render `AnalyticsDashboard` client component with initial data and user role.
2. `src/components/admin/AnalyticsDashboard.tsx`:
   - Interactive client component with luxury styling (matching existing admin theme: obsidian, gold, warm cream, slate).
   - Traffic & Bot Analytics (visible to both `ADMIN` and `SEO_SPECIALIST`):
     - Total visits, normal user visits, bot visits, and bot ratio.
     - Bot category breakdown (AI Crawlers, Search Bots, Scrapers).
     - Daily trends chart / timeline.
     - Recent visits table with IP, path, category, and timestamp.
   - Financial & Order Analytics (rendered ONLY if `role === 'ADMIN'`, completely hidden for `SEO_SPECIALIST`):
     - Net revenue, gross revenue, cancelled revenue, total bought count, total cancelled count.
     - Per-cake sales breakdown table.
     - Order management table with live "Cancel Order" action calling `PATCH /api/admin/orders/[id]`.

Produce your structured handoff report in `handoff.md`.

## 2026-11-06T09:06:23Z
You are Milestone 3 Explorer 2 (Analytics Page & Dashboard Component).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_2

Read the authoritative files before beginning:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_2/DISPATCH.md

Your mission:
Explore and specify:
1. `src/app/admin/(panel)/analytics/page.tsx`:
   - Next.js 16 Server Component.
   - Auth check via `getSession()`. If not authenticated -> redirect to `/admin/login`.
   - Fetch initial data via `getVisitAnalytics()`, and if user is `ADMIN`, fetch `getCakeSalesMetrics()` and `getAllOrders()`.
   - Pass data and user role to `AnalyticsDashboard`.
2. `src/components/admin/AnalyticsDashboard.tsx`:
   - Client Component (`"use client"`).
   - Luxury design consistent with admin panel (Obsidian, dark metallic, gold accents, crisp typography).
   - Traffic Section (rendered for both `ADMIN` and `SEO_SPECIALIST`):
     - Total visits, normal user visits, bot visits, and bot percentage KPI cards.
     - Bot category breakdown (AI Crawlers, Search Bots, Scrapers).
     - Daily trends chart (SVG or CSS bar/line visualization).
     - Recent visits table with path, IP, bot name, and formatted timestamp.
   - Financial Section (rendered ONLY for `ADMIN`, completely absent for `SEO_SPECIALIST`):
     - Net revenue, gross revenue, cancelled revenue, total cakes sold, cancelled orders.
     - Per-cake breakdown table (`boughtCount`, `cancelledCount`, `netRevenue`).
     - Recent orders table with interactive "Cancel Order" action calling `PATCH /api/admin/orders/[id]`.

Produce your structured handoff report in:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_2/handoff.md`

Remember: You are read-only. DO NOT modify codebase source files. Send a completion message via send_message to the orchestrator when finished.
