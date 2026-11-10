# Task: Milestone 3 Navigation & RBAC API Redaction Exploration

## Objective
Investigate and specify:
1. `src/app/admin/(panel)/layout.tsx`:
   - Inspect navigation array and icon imports (`BarChart3` or `Activity` or `TrendingUp`).
   - Add `{ name: "Analytics & Traffic", href: "/admin/analytics", icon: BarChart3 }` visible to both `ADMIN` and `SEO_SPECIALIST`.
2. `src/app/api/admin/analytics/route.ts`:
   - `GET` endpoint.
   - Authentication check via `getSession()`, cookies, or Bearer token.
   - Role check:
     - Unauthenticated -> 401 `{ error: "Unauthorized" }`
     - If `session.role === "SEO_SPECIALIST"`: return `{ role: "SEO_SPECIALIST", visits }` (strict redaction: `financials` and `orders` keys must be completely absent from the JSON payload!).
     - If `session.role === "ADMIN"`: return `{ role: "ADMIN", visits, financials, orders }`.
   - Check `tests/analytics-suite.test.ts` (Tiers 1.9, 1.10, 2.5) for exact assertions.

Produce your structured handoff report in `handoff.md`.


## 2026-11-06T09:06:23Z
You are Milestone 3 Explorer 1 (Navigation & RBAC API Redaction).
Your working directory is:
/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_1

Read the authoritative files before beginning:
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/PROJECT.md
- /home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_1/DISPATCH.md

Your mission:
Explore and specify:
1. `src/app/admin/(panel)/layout.tsx`:
   - Inspect navigation links, icon imports from `lucide-react`, and layout structure.
   - Plan addition of `{ name: "Analytics & Traffic", href: "/admin/analytics", icon: BarChart3 }` visible to both `ADMIN` and `SEO_SPECIALIST`.
2. `src/app/api/admin/analytics/route.ts`:
   - `GET` endpoint.
   - Authentication via `getSession()` and request cookie/Bearer token fallback.
   - Strict RBAC:
     - 401 if unauthenticated.
     - If `SEO_SPECIALIST`: returns `{ role: "SEO_SPECIALIST", visits }`. CRITICAL: `financials` and `orders` keys must be completely omitted from the returned JSON (not undefined, not null, not empty object!).
     - If `ADMIN`: returns `{ role: "ADMIN", visits, financials, orders }`.
3. Check `tests/analytics-suite.test.ts` (especially Tiers 1.9, 1.10, 2.5) for exact assertions on `/api/admin/analytics` and session tokens.

Produce your structured handoff report in:
`/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_3/explorer_1/handoff.md`

Remember: You are read-only. DO NOT modify codebase source files. Send a completion message via send_message to the orchestrator when finished.
