# Dispatch: E2E Test Writer 1

You are the E2E Test Writer (`teamwork_test_writer`).
Working directory: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/e2e_test_writer_1`
Project root: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator`
Original Request File: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md`
Project Specification: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md`
Test Infrastructure: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_INFRA.md`

## Mission
1. Read `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `TEST_INFRA.md`.
2. Inspect `tests/seo-suite.test.ts` to observe existing Vitest patterns, imports, session signing helpers (`signSessionToken`), and data service calls.
3. Author a comprehensive, opaque-box Vitest test suite at `tests/analytics-suite.test.ts` strictly deriving tests from requirements:
   - **Tier 1: Feature Coverage (>=5 tests per feature)**:
     - User-Agent classification for normal web browsers (Chrome, Safari, Firefox, Edge, Mobile Safari).
     - User-Agent classification for AI crawlers & bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot).
     - User-Agent classification for search bots & tools (Googlebot, Bingbot, DuckDuckBot, curl, python-requests).
     - Visit recording and analytics aggregation (`getVisitAnalytics()`, visit counts, bot breakdown).
     - Seed orders initial state verification (both active and cancelled orders present).
     - Revenue calculation formulas (`grossRevenue`, `cancelledRevenue`, `netRevenue`).
     - Order placement flow (`createOrder()`) updating bought count and gross revenue.
     - Order cancellation flow (`cancelOrder()`) updating cancelled count and net revenue.
     - RBAC: ADMIN full access to visits and financial metrics.
     - RBAC: SEO_SPECIALIST access to visits with revenue/orders completely hidden/redacted.
   - **Tier 2: Boundary & Corner Cases (>=5 tests per feature)**:
     - Edge cases in User-Agents: empty string, null/undefined, unusual casing, bot substrings in benign names.
     - Boundary cases in orders: order with multiple quantities, zero remaining active orders, cancelling already cancelled order, non-existent order ID.
     - Boundary cases in revenue: high-value orders, zero orders calculation, decimal arithmetic stability.
     - RBAC boundaries: session with invalid role, expired token, missing cookie/token.
   - **Tier 3: Cross-Feature Combinations**:
     - Placing an order, verifying order count increases, then cancelling it and verifying net revenue decreases while bought count remains tracked.
     - Simulating multiple visits (users and bots) alongside orders, checking analytics stability.
   - **Tier 4: Real-World Scenarios**:
     - Realistic e-commerce sequence: user visits site (UA tracked) -> adds cake to cart -> places order -> admin reviews analytics and cancels duplicate order -> SEO specialist reviews traffic metrics without seeing financials.
4. When finished, create `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_READY.md` detailing the test runner command and coverage summary.
5. Write your handoff report to `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/e2e_test_writer_1/handoff.md` and message the parent orchestrator.

## 2026-11-06T06:10:26Z
You are E2E Test Writer (e2e_test_writer_1).
Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/e2e_test_writer_1
Project root: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator
Original Request File: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
Dispatch Instructions: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/e2e_test_writer_1/DISPATCH.md
Project Specification: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
Test Infrastructure: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_INFRA.md

Follow all instructions in your DISPATCH.md. Write comprehensive tests in tests/analytics-suite.test.ts covering all 4 tiers.
Produce TEST_READY.md at /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/TEST_READY.md upon completion.
Write your handoff report to /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/e2e_test_writer_1/handoff.md and notify parent via send_message.
