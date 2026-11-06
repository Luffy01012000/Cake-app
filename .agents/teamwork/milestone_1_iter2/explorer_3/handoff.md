# Milestone 1 Iteration 2 Explorer 3 Handoff Report: Proxy Prefetch Header Casing Strategy

**Author**: Milestone 1 Iteration 2 Explorer 3 (`m1_iter2_explorer_3`)  
**Working Directory**: `/home/goku/.gemini/antigravity/worktrees/cake-app/seo_admin_panel_generator/.agents/teamwork/milestone_1_iter2/explorer_3`  
**Target File**: `src/proxy.ts`  
**Date**: 2026-11-06  

---

## 1. Observation

In the Milestone 1 Challenger 2 test harness (`tests/m1-challenger-stress.test.ts`), Test #2 failed with an unexpected visit count increase during prefetch filtering:

### 1.1 Verbatim Failure Output
```
FAIL tests/m1-challenger-stress.test.ts > Milestone 1 Empirical Stress Harness (Challenger 2) > 2. Proxy Interception Verification (src/proxy.ts) > strictly ignores prefetch requests across all standard prefetch headers
AssertionError: expected 975 to be 973 // Object.is equality

- Expected
+ Received

- 973
+ 975

 ❯ tests/m1-challenger-stress.test.ts:218:38
    216|       const statsAfter = await getVisitAnalytics();
    217|       // Total visits must remain completely unchanged
    218|       expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits);
       |                                      ^
    219|     });
```

### 1.2 Inspection of Existing Code (`src/proxy.ts:27-36`)
```ts
    // 2. Skip prefetch requests to avoid false positive visit tallies
    const isPrefetch =
      request.headers.get("next-router-prefetch") === "1" ||
      request.headers.get("purpose") === "prefetch" ||
      request.headers.get("x-purpose") === "prefetch" ||
      request.headers.get("sec-purpose") === "prefetch";

    if (isPrefetch) {
      return NextResponse.next();
    }
```

### 1.3 Inspection of Test Case (`tests/m1-challenger-stress.test.ts:195-202`)
The test sends an array of 6 prefetch header variations:
```ts
      const prefetchHeadersList: Array<Record<string, string>> = [
        { "next-router-prefetch": "1" },
        { "purpose": "prefetch" },
        { "purpose": "Prefetch" }, // Mixed-case HTTP header value
        { "x-purpose": "prefetch" },
        { "sec-purpose": "prefetch" },
        { "sec-purpose": "Prefetch" },
      ];
```
- Exactly 2 of the 6 headers (`purpose: "Prefetch"` and `sec-purpose: "Prefetch"`) bypassed the prefetch filter, incrementing `totalVisits` by exactly 2 (from 973 to 975).
- In Node.js / Fetch API `Headers`, `request.headers.get("purpose")` normalizes the *header name* to lowercase, but returns the *header value* verbatim (`"Prefetch"`).
- Strict equality comparison `"Prefetch" === "prefetch"` evaluates to `false`.

---

## 2. Logic Chain

1. **RFC 9110 Semantics & Fetch API Behavior**:
   - In RFC 9110 (HTTP Semantics), HTTP field names are case-insensitive, but field values are case-sensitive by default unless defined otherwise.
   - Fetch API `Headers.prototype.get(name)` lowercases `name` for lookup, so `request.headers.get("purpose")` matches `Purpose`, `PURPOSE`, or `purpose`.
   - However, the returned string preserves the incoming client value verbatim. If a browser, reverse proxy, CDN, or HTTP client sends `Purpose: Prefetch` or `Sec-Purpose: Prefetch`, `get("purpose")` returns `"Prefetch"`.

2. **Real-World Browser and Proxy Behavior**:
   - Modern Chromium browsers send `Sec-Purpose: prefetch` or `Sec-Purpose: prefetch;prerender`. Some mobile browsers, enterprise forward proxies, and API testing suites capitalize header values to TitleCase (`Prefetch`) or UPPERCASE (`PREFETCH`).
   - Firefox historically sent `Purpose: prefetch`.
   - Safari / WebKit and intermediate proxies send `X-Purpose: preview` or `X-Purpose: prefetch`.
   - Next.js client-side router sends `next-router-prefetch: 1`.

3. **Consequences of Strict Casing in `src/proxy.ts`**:
   - Comparing `request.headers.get("purpose") === "prefetch"` fails whenever the client capitalizes the value (`"Prefetch"`).
   - The request falls through to step 4 (`recordVisit({ path, userAgent, ip })`).
   - Speculative background prefetch requests (e.g. mouse hover over navigation links or background tab prerendering) are falsely recorded as genuine page visits.
   - This corrupts `totalVisits` and `normalUserVisits` analytics counters and invalidates the core requirement that prefetch traffic must not increment analytics.

4. **Remediation Strategy**:
   - For all prefetch headers (`next-router-prefetch`, `purpose`, `x-purpose`, `sec-purpose`), extract the value and normalize via `?.trim().toLowerCase()`.
   - Account for compound prefetch values like Chromium's `Sec-Purpose: prefetch;prerender` via `.includes("prefetch")` or `=== "prerender"`.
   - Support `next-router-prefetch: "1"` and `next-router-prefetch: "true"`.
   - Encapsulate the logic in an exported helper function `isPrefetchRequest(request: NextRequest): boolean` to enable isolated unit testing and clean proxy middleware flow.

---

## 3. Caveats

1. **Header Name vs. Header Value**:
   - Header *names* do not require manual lowercasing because `Headers.prototype.get` already handles case-insensitivity per WHATWG Fetch specifications.
   - Only the header *values* require `?.trim().toLowerCase()`.
2. **Prerender Directives**:
   - Browsers also send `prerender` in `Purpose` or `Sec-Purpose`. Both prefetch and prerender are speculative browser background tasks that must not be logged as live user visits.
3. **Scope Boundary**:
   - This analysis targets `src/proxy.ts`. The other two Challenger 2 failures (concurrency read-skew in `getVisitAnalytics()` and missing `dailyTrends` in PostgreSQL) reside in `src/lib/data-service.ts` and are handled by peer investigators.

---

## 4. Conclusion & Proposed Fix

### 4.1 Recommended Implementation
Extract detection logic into an exported function `isPrefetchRequest(request: NextRequest): boolean` and call it within `proxy()`:

```ts
/**
 * Detects whether an incoming HTTP request is a speculative prefetch or prerender request.
 * Normalizes header values to lowercase and trims whitespace to prevent case-sensitive
 * bypasses (e.g., "Purpose: Prefetch", "Sec-Purpose: Prefetch", "next-router-prefetch: 1").
 */
export function isPrefetchRequest(request: NextRequest): boolean {
  const nextRouterPrefetch = request.headers.get("next-router-prefetch")?.trim().toLowerCase();
  const purpose = request.headers.get("purpose")?.trim().toLowerCase();
  const xPurpose = request.headers.get("x-purpose")?.trim().toLowerCase();
  const secPurpose = request.headers.get("sec-purpose")?.trim().toLowerCase();

  return (
    nextRouterPrefetch === "1" ||
    nextRouterPrefetch === "true" ||
    purpose === "prefetch" ||
    purpose === "prerender" ||
    xPurpose === "prefetch" ||
    xPurpose === "preview" ||
    secPurpose === "prefetch" ||
    secPurpose === "prerender" ||
    Boolean(secPurpose?.includes("prefetch"))
  );
}
```

In `proxy(request: NextRequest, event?: NextFetchEvent)`:
```ts
    // 2. Skip prefetch requests to avoid false positive visit tallies
    if (isPrefetchRequest(request)) {
      return NextResponse.next();
    }
```

### 4.2 Exact Unified Diff (`proxy_prefetch.patch`)
```diff
--- a/src/proxy.ts
+++ b/src/proxy.ts
@@ -10,6 +10,27 @@
 };
 
+/**
+ * Detects whether an incoming HTTP request is a speculative prefetch or prerender request.
+ * Normalizes header values to lowercase and trims whitespace to prevent case-sensitive
+ * bypasses (e.g., "Purpose: Prefetch", "Sec-Purpose: Prefetch", "next-router-prefetch: 1").
+ */
+export function isPrefetchRequest(request: NextRequest): boolean {
+  const nextRouterPrefetch = request.headers.get("next-router-prefetch")?.trim().toLowerCase();
+  const purpose = request.headers.get("purpose")?.trim().toLowerCase();
+  const xPurpose = request.headers.get("x-purpose")?.trim().toLowerCase();
+  const secPurpose = request.headers.get("sec-purpose")?.trim().toLowerCase();
+
+  return (
+    nextRouterPrefetch === "1" ||
+    nextRouterPrefetch === "true" ||
+    purpose === "prefetch" ||
+    purpose === "prerender" ||
+    xPurpose === "prefetch" ||
+    xPurpose === "preview" ||
+    secPurpose === "prefetch" ||
+    secPurpose === "prerender" ||
+    Boolean(secPurpose?.includes("prefetch"))
+  );
+}
+
 export async function proxy(request: NextRequest, event?: NextFetchEvent): Promise<NextResponse> {
   try {
     const pathname = request.nextUrl.pathname;
@@ -27,11 +48,7 @@
     // 2. Skip prefetch requests to avoid false positive visit tallies
-    const isPrefetch =
-      request.headers.get("next-router-prefetch") === "1" ||
-      request.headers.get("purpose") === "prefetch" ||
-      request.headers.get("x-purpose") === "prefetch" ||
-      request.headers.get("sec-purpose") === "prefetch";
-
-    if (isPrefetch) {
+    if (isPrefetchRequest(request)) {
       return NextResponse.next();
     }
```

### 4.3 Alternative Inline Implementation (if helper export is not desired)
```ts
    // 2. Skip prefetch requests to avoid false positive visit tallies (case-insensitive)
    const nextRouterPrefetch = request.headers.get("next-router-prefetch")?.trim().toLowerCase();
    const purpose = request.headers.get("purpose")?.trim().toLowerCase();
    const xPurpose = request.headers.get("x-purpose")?.trim().toLowerCase();
    const secPurpose = request.headers.get("sec-purpose")?.trim().toLowerCase();

    const isPrefetch =
      nextRouterPrefetch === "1" ||
      nextRouterPrefetch === "true" ||
      purpose === "prefetch" ||
      purpose === "prerender" ||
      xPurpose === "prefetch" ||
      xPurpose === "preview" ||
      secPurpose === "prefetch" ||
      secPurpose === "prerender" ||
      Boolean(secPurpose?.includes("prefetch"));

    if (isPrefetch) {
      return NextResponse.next();
    }
```

### 4.4 Artifacts Generated
- Replacement file: `.agents/teamwork/milestone_1_iter2/explorer_3/proposed_proxy.ts`
- Unified patch: `.agents/teamwork/milestone_1_iter2/explorer_3/proxy_prefetch.patch`

---

## 5. Verification Method

1. **Standalone Case-Insensitivity Probe**:
   Execute the following automated probe validating 14 prefetch permutations:
   ```bash
   npx tsx -e "
   import { NextRequest } from 'next/server';
   import { isPrefetchRequest } from './.agents/teamwork/milestone_1_iter2/explorer_3/proposed_proxy';

   const cases = [
     [{ 'next-router-prefetch': '1' }, true],
     [{ 'next-router-prefetch': 'true' }, true],
     [{ 'purpose': 'prefetch' }, true],
     [{ 'purpose': 'Prefetch' }, true],
     [{ 'purpose': 'PREFETCH' }, true],
     [{ 'purpose': 'prerender' }, true],
     [{ 'x-purpose': 'prefetch' }, true],
     [{ 'x-purpose': 'Prefetch' }, true],
     [{ 'x-purpose': 'preview' }, true],
     [{ 'sec-purpose': 'prefetch' }, true],
     [{ 'sec-purpose': 'Prefetch' }, true],
     [{ 'sec-purpose': 'prefetch;prerender' }, true],
     [{ 'sec-purpose': 'prerender' }, true],
     [{ 'user-agent': 'Mozilla/5.0' }, false],
   ];

   for (const [hdrs, exp] of cases) {
     const r = isPrefetchRequest(new NextRequest('http://localhost:3000/cakes', { headers: hdrs }));
     if (r !== exp) throw new Error('Mismatch for ' + JSON.stringify(hdrs));
   }
   console.log('14/14 prefetch checks passed!');
   "
   ```
   *Result*: `14/14 prefetch checks passed!`

2. **Challenger Stress Suite Post-Application**:
   Once applied by the Worker agent, execute:
   ```bash
   npx vitest run tests/m1-challenger-stress.test.ts -t "strictly ignores prefetch requests"
   ```
   *Expected Result*: Test passes with 0 visit increment delta (`statsAfter.totalVisits === statsBefore.totalVisits`).

3. **Regression & Type Safety**:
   ```bash
   npx tsc --noEmit
   npx eslint src/proxy.ts
   npx vitest run tests/visit-ingestion.test.ts
   ```
   *Result*: Zero TypeScript or ESLint errors; existing unit tests pass cleanly.
