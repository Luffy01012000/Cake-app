# E2E Test Infra: AURA Production Analytics Panel

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md`.
- Methodology: Category-Partition + Boundary Value Analysis + Combinatorial + Real-World Workload Testing.
- Vitest Node environment running against resilient services/APIs.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Visit Analytics (User vs Bot) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Cake Revenue & Order Tracking | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Order Placement & Cancellation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | RBAC Analytics Visibility & Redaction | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 5 | Seed Data Population & Consistency | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Vitest (`pnpm test` / `vitest run`)
- Target test file: `tests/analytics-suite.test.ts`
- Expected pass: 0 failures, 100% passing

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total ≥ 25)
- Tier 2: ≥5 per feature (Total ≥ 25)
- Tier 3: pairwise coverage of major feature interactions (Total ≥ 10)
- Tier 4: ≥5 realistic end-to-end application scenarios
