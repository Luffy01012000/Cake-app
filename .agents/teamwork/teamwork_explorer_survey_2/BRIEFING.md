# BRIEFING — 2026-11-06T06:06:00Z

## Mission
Investigate the data layer, Prisma schema, database provider, models, seed scripts, cake catalog, and ordering/visit tracking requirements.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesis
- Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/teamwork_explorer_survey_2
- Original parent: 5224ce45-0d56-4e58-a11c-1bab000d62c3
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Write only to own folder (.agents/teamwork/teamwork_explorer_survey_2)
- Do not place source code, tests, or data files in .agents/teamwork/

## Current Parent
- Conversation ID: 5224ce45-0d56-4e58-a11c-1bab000d62c3
- Updated: 2026-11-06T05:56:43Z

## Investigation State
- **Explored paths**:
  - `prisma/schema.prisma`, `prisma/seed.ts`
  - `src/lib/data-service.ts`, `src/lib/prisma.ts`, `src/lib/auth.ts`, `src/lib/seed-data.ts`, `src/lib/robots-utils.ts`
  - `src/data/cakes.ts`, `src/components/CartDrawer.tsx`, `src/components/HomeClient.tsx`, `src/components/CakeDetailClient.tsx`
  - `src/app/admin/(panel)/layout.tsx`, `src/app/admin/(panel)/page.tsx`, `src/app/api/admin/`
  - `tests/seo-suite.test.ts`, `package.json`, `.env`
  - Next.js 16 documentation in `node_modules/next/dist/docs/` (Proxy vs Middleware convention)
- **Key findings**:
  1. Prisma provider is PostgreSQL (`postgresql`). Existing models: `User`, `Cake`, `CakeFaq`, `PageSeo`, `PageFaq`, `RobotsConfig`, `SiteSettings`. No `Order` or `Visit` model yet.
  2. Data architecture uses a resilient dual pattern: PostgreSQL via Prisma when online (`isDbAvailable()`), falling back to in-memory `FallbackStore` in `src/lib/data-service.ts` when offline/unauthenticated. Vitest tests currently run against this fallback store with 100% pass rate.
  3. Pricing: Prices are numbers/Float in USD (e.g., 680, 195, 360, 320, 850, 165).
  4. Ordering: `CartDrawer.tsx` has mock checkout (`setTimeout`); needs real order placement via API (`POST /api/orders`).
  5. Next.js 16 convention: `middleware.ts` is deprecated and replaced by `proxy.ts`.
  6. RBAC: `Role` enum has `ADMIN` and `SEO_SPECIALIST`. `SEO_SPECIALIST` can view user vs. bot visit analytics, but cannot access cake revenue, bought counts, or cancellations.
- **Unexplored areas**: None for survey scope.

## Key Decisions Made
- Analyzed and documented the complete schema additions needed: `Order` and `Visit` models with relations, fields, and enums.
- Designed the dual-layer persistence model (Prisma schema + `FallbackStore` in `data-service.ts`) ensuring test compatibility without live PostgreSQL.
- Formulated User-Agent classification logic for bots (AI crawlers + search engines) vs normal users.
- Defined revenue calculation formulas (gross, cancelled, net) and order management lifecycle.

## Artifact Index
- DISPATCH.md — incoming dispatch instructions
- BRIEFING.md — persistent working memory
- progress.md — liveness heartbeat
- handoff.md — structured 5-component handoff report
