# Milestone 2 Explorer 3 Handoff Report: API Routes & Cart Integration

## 1. Observation

### 1.1 Existing Codebase & Architecture
- **Framework & Runtime**: Next.js 16.4.3 (App Router), React 19.3.0, Prisma 6.19.3, Vitest 5.1.0. Next.js 16 conventions dictate asynchronous request APIs (`cookies()`, `headers()`, and route segment parameters `params: Promise<{ id: string }>`) as documented in `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` lines 191-196:
  ```ts
  export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
    const { id } = await ctx.params
    return Response.json({ id })
  }
  ```
- **Existing Route Handlers & RBAC Patterns**:
  In `src/app/api/admin/cakes/[id]/route.ts` lines 5-12, 45-59:
  ```ts
  export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin role required to delete cakes from the catalog." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteCake(id);
    return NextResponse.json({ success: true });
  }
  ```
  In `src/app/api/admin/users/route.ts` lines 8-18 and 50-60:
  Unauthenticated requests return status 401 `{ error: "Unauthorized" }`; authenticated users with role other than `"ADMIN"` (such as `"SEO_SPECIALIST"`) return status 403 `{ error: "Forbidden: Admin role required..." }`.
- **Session & Auth Implementation**:
  In `src/lib/auth.ts` lines 19-57:
  - Session cookie is named `"aura_session"`.
  - `signSessionToken(user)` signs a JWT with `id`, `email`, `name`, `role` (`"ADMIN"` or `"SEO_SPECIALIST"`) using `jose` HS256.
  - `verifySessionToken(token)` verifies the JWT.
  - `getSession()` awaits `cookies()` from `"next/headers"` and verifies `"aura_session"`.
- **Order Model & Service Functions**:
  In `PROJECT.md` lines 71-120 and `tests/analytics-suite.test.ts` lines 37-67, 90-106:
  - `createOrder(data: { cakeId: string; cakeName?: string; customerName: string; customerEmail: string; price?: number; quantity?: number; deliveryDate?: string; notes?: string }): Promise<OrderRecord>`
  - `cancelOrder(orderId: string): Promise<OrderRecord>`
  - `getAllOrders(): Promise<OrderRecord[]>`
  - `OrderRecord` contains `{ id, cakeId, cakeName, customerName, customerEmail, price, quantity, status: "ACTIVE" | "CANCELLED", deliveryDate?, notes?, createdAt, updatedAt }`.
- **Current Cart Drawer Implementation**:
  In `src/components/CartDrawer.tsx` lines 65-71, 117-144:
  - `handleCheckout` currently simulates an order with `setTimeout` without network calls:
    ```tsx
    const handleCheckout = () => {
      setIsCheckingOut(true);
      setTimeout(() => {
        setIsCheckingOut(false);
        setOrderConfirmed(true);
      }, 1500);
    };
    ```
  - The confirmation screen hardcodes confirmation ID `"AUR-2026-9812"`.
  - `onClearCart()` is only invoked inside `handleReset` after the user closes the confirmation dialog, rather than upon order creation success.
  - There are currently no input fields for `customerName` and `customerEmail`.
- **Proxy Request Filtering**:
  In `src/proxy.ts` lines 41-49:
  ```ts
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }
  ```
  All `/api/*` endpoints are explicitly exempt from visit tracking, avoiding false-positive crawler or browser analytics increments during order operations.

---

## 2. Logic Chain

1. **Endpoint `POST /api/orders`**:
   - *Requirement*: Enable active ordering actions from both UI and API consumers, returning status 201 with created record.
   - *Step 1 (Input Parsing & Validation)*: Parse JSON body with try/catch to return 400 on malformed payloads. Verify `cakeId` (non-empty string), `customerName` (non-empty string), and `customerEmail` (valid email with `@`). Verify optional `quantity` is a positive integer (defaulting to 1), and optional `price` is non-negative.
   - *Step 2 (Service Invocation)*: Call `createOrder(...)`. If cakeId is missing from catalog and name/price are omitted, `createOrder` throws; catch error and map to 404/400.
   - *Step 3 (Response Format)*: Return status 201 with `{ success: true, order: createdOrder }`. This directly matches `{ success: true, cake }` in `cakes/route.ts` and `{ success: true, user }` in `users/route.ts`.
   - *Step 4 (Method Guard)*: Implement `GET` handler returning status 405 Method Not Allowed (`{ error: "Method not allowed. Use POST to place orders." }`) to prevent unauthorized order enumeration via public routes.

2. **Endpoint `PATCH /api/admin/orders/[id]/route.ts`**:
   - *Requirement*: Allow admin to cancel orders with strict role-based access control.
   - *Step 1 (Authentication)*: Check session via `getSession()`, with resilient fallback to `req.cookies.get("aura_session")` and `Authorization: Bearer <token>` to accommodate unit tests and standalone fetchers. If no session, return status 401 `{ error: "Unauthorized: Active session required." }`.
   - *Step 2 (RBAC Authorization)*: If `session.role !== "ADMIN"` (e.g., `"SEO_SPECIALIST"` or unauthorized role), return status 403 `{ error: "Forbidden: Admin role required to cancel orders." }`.
   - *Step 3 (Parameter Handling)*: Await Next.js 16 async route segment context `{ params }: { params: Promise<{ id: string }> }`. If `id` is blank, return 400.
   - *Step 4 (Order Cancellation)*: Call `cancelOrder(id.trim())`. If order is not found, return 404. If already cancelled, `cancelOrder` idempotently returns the cancelled order.
   - *Step 5 (Response Format)*: Return status 200 with `{ success: true, order: cancelledOrder }`.
   - *Step 6 (Verb Compatibility)*: Export `DELETE` as an alias to `PATCH` for HTTP client flexibility.

3. **Client Integration in `src/components/CartDrawer.tsx`**:
   - *Requirement*: Enable real checkout for cart items, clear the cart on success, surface errors, and provide clear user feedback.
   - *Step 1 (Contact Form Fields)*: Add `customerName` and `customerEmail` states with luxury input fields in the drawer. Include sensible fallbacks (`"Patisserie Guest"`, `"guest@aurapatisserie.com"`) so that 1-click checkout remains frictionless if inputs are left blank.
   - *Step 2 (Active Request Dispatch)*: In `handleCheckout`, asynchronously iterate through `items`. Assemble metadata (flavor choice, custom plaque inscription, calligraphy gift card note) into `notes`, and dispatch `POST /api/orders` for each item.
   - *Step 3 (Error Handling & User Feedback)*: If any request fails, catch error, display a rose/red dismissible error banner (`checkoutError`), and keep `isCheckingOut` false without clearing the cart.
   - *Step 4 (Success Lifecycle)*: On successful completion of all items, call `onClearCart()` immediately, store the created order IDs, and transition `orderConfirmed` to `true`, displaying the actual confirmation ID and delivery date.

---

## 3. Caveats

1. **Dependency on Explorer 1 & 2**: `POST /api/orders` and `PATCH /api/admin/orders/[id]` rely on `createOrder` and `cancelOrder` being implemented in `src/lib/data-service.ts` by Explorer 2.
2. **Multi-Item Cart Checkout Strategy**: In `CartDrawer.tsx`, items are currently processed sequentially via `for (const item of items)`. If transactional multi-item order grouping is introduced in a future milestone (e.g., a single parent order containing line items), `/api/orders` can accept an array payload `{ items: [...] }` without changing the single-item contract.
3. **No direct UI in Milestone 2 for Admin Cancellation**: Milestone 2 provides the backend endpoint `PATCH /api/admin/orders/[id]`; the interactive UI table and cancellation buttons will be integrated into `/admin/analytics` in Milestone 3 as specified in PROJECT.md Feature F9/F10/F11.

---

## 4. Conclusion

1. Full implementations of the required routes and components have been prepared as drop-in artifacts in `.agents/teamwork/milestone_2/explorer_3/`:
   - `proposed_orders_route.ts` → destination: `src/app/api/orders/route.ts`
   - `proposed_admin_orders_id_route.ts` → destination: `src/app/api/admin/orders/[id]/route.ts`
   - `proposed_CartDrawer.tsx` → destination: `src/components/CartDrawer.tsx`
   - `cart_drawer.patch` → unified diff patch for `CartDrawer.tsx`
2. Next.js 16 App Router conventions (async `params: Promise<{ id: string }>`, async `cookies()`, `NextRequest`, `NextResponse`) are strictly followed.
3. RBAC security requirements (401 for unauthenticated, 403 for `SEO_SPECIALIST`, 200 for `ADMIN`) are fully enforced with multi-vector token resolution.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Vitest Analytics Suite**:
   ```bash
   npx vitest run tests/analytics-suite.test.ts
   ```
   Verifies data models, revenue math, RBAC tokens, and permissions.
2. **TypeScript Compilation & Next.js Build Check**:
   ```bash
   pnpm run build
   ```
   Verifies route type generation, async parameter compatibility, and component props.

### 5.2 Verification Scenarios for Route Handlers
- **Order Placement (`POST /api/orders`)**:
  ```bash
  # Valid placement
  curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"cakeId":"elysian-wedding-tier","customerName":"Eleanor Vance","customerEmail":"eleanor@vance.com","quantity":1}'
  # Expected: HTTP 201 {"success": true, "order": {"id": "...", "status": "ACTIVE", ...}}

  # Missing customerName validation failure
  curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"cakeId":"elysian-wedding-tier","customerEmail":"test@test.com"}'
  # Expected: HTTP 400 {"error": "Validation failed: 'customerName' is required and must be a non-empty string."}
  ```

- **Order Cancellation (`PATCH /api/admin/orders/[id]`)**:
  ```bash
  # Unauthenticated request
  curl -X PATCH http://localhost:3000/api/admin/orders/some-order-id
  # Expected: HTTP 401 {"error": "Unauthorized: Active session required."}

  # Authenticated as SEO_SPECIALIST
  # Expected: HTTP 403 {"error": "Forbidden: Admin role required to cancel orders."}

  # Authenticated as ADMIN
  # Expected: HTTP 200 {"success": true, "order": {"id": "some-order-id", "status": "CANCELLED", ...}}
  ```

### 5.3 Invalidation Conditions
- If `tests/analytics-suite.test.ts` or subsequent test suites expect `POST /api/orders` to return `order` at the top level without `{ success: true, order }` wrapper (or vice versa), the response schema can be adjusted or provide both `{ success: true, order, ...order }`.
