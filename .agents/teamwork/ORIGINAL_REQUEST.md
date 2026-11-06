# Original User Request

## Initial Request — 2026-11-06T05:53:34Z

Add a production analytics panel to the AURA luxury cake patisserie admin application where both ADMIN and SEO_SPECIALIST users can monitor normal user visits versus bot visits, while ADMIN users can additionally track cake sales revenue, quantity bought, and quantity cancelled.

Working directory: /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator
Integrity mode: development

## Requirements

### R1. Visit Analytics (Normal Users vs. Bots)
Track and categorize incoming page traffic by inspecting request User-Agent headers to distinguish normal user visits from automated bot or search engine/AI crawler visits. Provide an analytics interface showing visit counts and trends for normal users and bots.

### R2. Cake Revenue and Order Status Tracking
Track cake purchase orders and cancellations, computing total revenue generated per cake and across the entire catalog. Enable active ordering and cancellation actions in the application UI (allowing users to place cake orders and admin to manage/cancel them), and initialize the data store with realistic seed orders.

### R3. Role-Based Analytics Dashboard & Dedicated Page
Integrate analytics into the admin experience with:
- A dedicated `/admin/analytics` page accessible from the admin sidebar navigation for authorized roles.
- Summary analytics KPI cards on the main admin dashboard (`/admin`).
- Role-based access control: users with role `SEO_SPECIALIST` can view user vs. bot visit analytics, but cannot see cake revenue, bought counts, or cancellation counts. Users with role `ADMIN` have full access to both visit analytics and financial/order metrics.

### R4. Automated Testing
Extend the existing automated test suite (`tests/`) using Vitest to verify user vs. bot visit classification, revenue and order calculation accuracy, order placement/cancellation flows, and role-based data visibility restrictions.

## Acceptance Criteria

### Visit Analytics
- [ ] Visits from standard web browser User-Agents are classified and tallied as normal user visits.
- [ ] Visits from crawler and bot User-Agents (including search engine bots and AI crawlers) are classified and tallied as bot visits.
- [ ] The analytics interface displays the total count and comparison of normal user visits versus bot visits.

### Order, Revenue & Cancellation Metrics
- [ ] Order records store cake reference, price, timestamp, and status (e.g., active/completed vs. cancelled).
- [ ] Placing an order increments the bought count and updates total cake revenue accordingly.
- [ ] Cancelling an order updates the cancellation count and adjusts net revenue calculations.
- [ ] Initial seed orders exist so revenue, bought count, and cancellation counts are populated and visible upon setup.
- [ ] Revenue calculations accurately reflect the prices of ordered cakes minus cancelled orders.

### Role-Based Access Control & Navigation
- [ ] Both `ADMIN` and `SEO_SPECIALIST` roles can navigate to and view `/admin/analytics`.
- [ ] When logged in as `SEO_SPECIALIST`, visit metrics (normal user vs. bot visits) are displayed, but cake revenue, bought count, and cancellation metrics are completely hidden/inaccessible.
- [ ] When logged in as `ADMIN`, all analytics sections—including visit counts, cake revenue, bought count, and cancelled count—are fully visible.
- [ ] The main admin dashboard (`/admin`) displays summary KPI cards matching the logged-in user's role permissions.

### Verification
- [ ] Running `pnpm test` executes tests in `tests/` and passes with zero failures.
- [ ] Automated tests cover visit classification (user vs. bot), order creation/cancellation logic, revenue computation, and RBAC permission enforcement.
