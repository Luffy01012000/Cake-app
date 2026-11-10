# Implementation & Orchestration Plan

## Objective
Build a production analytics panel for AURA luxury cake patisserie admin application supporting:
- Visit Analytics (Normal users vs Bots / AI crawlers)
- Cake revenue, order counts (bought/cancelled), active ordering & cancellation UI, and seed orders
- Role-based analytics access (ADMIN has full access, SEO_SPECIALIST sees only visit analytics)
- Main admin dashboard summary KPI cards + dedicated `/admin/analytics` page
- Complete Vitest test suite (`tests/`) covering visit classification, revenue/order logic, and RBAC restrictions

## Orchestration Strategy (Project Pattern)
1. **Phase 0: Codebase Survey**
   - Dispatch 3 parallel Explorers to investigate:
     - Explorer 1: Current application architecture, routes, layout, admin navigation, RBAC/auth system, session handling.
     - Explorer 2: Existing data models (Prisma/DB or in-memory), seed data, cake catalog, order structures, API routes or server actions.
     - Explorer 3: Existing testing infrastructure (`tests/`, Vitest configuration, helper utilities, mock patterns).
2. **Phase 1: Project Plan & Architecture (PROJECT.md)**
   - Synthesize findings into `PROJECT.md` with full Feature Inventory, module boundaries, code layout, interface contracts, and milestone plan.
3. **Phase 2: Milestone Execution (Implementation & E2E Testing Dual Tracks)**
   - E2E Testing Track: `teamwork_test_writer` / test orchestrator building test suite based on requirements.
   - Milestone 1: Visit tracking & analytics data models/services (User-Agent parsing, bot detection, visit storage/aggregation).
   - Milestone 2: Order & Revenue tracking (Order model/schema, order placement, cancellation, seed data, revenue math).
   - Milestone 3: Role-based UI & Navigation (Admin dashboard KPI cards, `/admin/analytics` page, RBAC enforcement).
4. **Phase 3: Final Verification & Adversarial Hardening**
   - 100% test pass verification across all tiers.
   - Challenger & forensic auditor verification.
