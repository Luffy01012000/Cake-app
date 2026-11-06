import { describe, it, expect, beforeEach } from "vitest";
import {
  computeSalesMetrics,
  createOrder,
  cancelOrder,
  resetOrdersStore,
  getCakeSalesMetrics,
  getAllCakes,
  OrderRecord,
} from "../src/lib/data-service";
import { SEED_ORDERS } from "../src/lib/seed-data";

const CATALOG_FIXTURE = [
  { id: "elysian-wedding-tier", name: "The Elysian Grand Tier" },
  { id: "blush-seraphina-birthday", name: "The Seraphina Blush" },
  { id: "nocturne-anniversary-velvet", name: "The Nocturne Reserve" },
  { id: "celeste-baby-shower", name: "The Céleste Cloud" },
  { id: "solaris-gala-architectural", name: "The Solaris Cube Gala" },
  { id: "rosalia-intimate-romance", name: "The Rosalia Mirror" },
];

describe("Milestone 2 Challenger 1: Revenue Math & Invariants Adversarial Stress", () => {
  beforeEach(() => {
    resetOrdersStore();
  });

  // =========================================================================
  // 1. Core Mathematical Invariants (Generator & Property-Based Checks)
  // =========================================================================
  describe("1. Core Mathematical Invariants (Generator & Oracle Checks)", () => {
    it("satisfies all 4 revenue invariants on an empty order list", () => {
      const metrics = computeSalesMetrics([], CATALOG_FIXTURE);

      expect(metrics.totalBoughtCount).toBe(0);
      expect(metrics.totalCancelledCount).toBe(0);
      expect(metrics.grossRevenue).toBe(0);
      expect(metrics.cancelledRevenue).toBe(0);
      expect(metrics.netRevenue).toBe(0);

      // Invariant 1: netRevenue === grossRevenue - cancelledRevenue
      expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);

      // Invariant 2: sum(perCake.netRevenue) === netRevenue
      const sumPerCakeNet = metrics.perCake.reduce((acc, c) => acc + c.netRevenue, 0);
      expect(sumPerCakeNet).toBe(metrics.netRevenue);

      // Invariant 5: all catalog cakes present even with 0 sales
      expect(metrics.perCake.length).toBe(CATALOG_FIXTURE.length);
      for (const cake of metrics.perCake) {
        expect(cake.boughtCount).toBe(0);
        expect(cake.cancelledCount).toBe(0);
        expect(cake.netRevenue).toBe(0);
      }
    });

    it("satisfies all invariants on baseline SEED_ORDERS dataset", () => {
      const orders = SEED_ORDERS as unknown as OrderRecord[];
      const metrics = computeSalesMetrics(orders, CATALOG_FIXTURE);

      // Invariant 1: netRevenue === grossRevenue - cancelledRevenue
      expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);

      // Invariant 2: sum(perCake.netRevenue) === netRevenue
      const sumPerCakeNet = metrics.perCake.reduce((acc, c) => acc + c.netRevenue, 0);
      expect(sumPerCakeNet).toBe(metrics.netRevenue);

      // Invariant 3: totalBoughtCount === sum(all order quantities)
      const expectedTotalBought = orders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      expect(metrics.totalBoughtCount).toBe(expectedTotalBought);

      // Invariant 4: totalCancelledCount === sum(cancelled order quantities)
      const expectedTotalCancelled = orders
        .filter((o) => o.status === "CANCELLED")
        .reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      expect(metrics.totalCancelledCount).toBe(expectedTotalCancelled);

      // Per-cake count sums match catalog totals
      const sumPerCakeBought = metrics.perCake.reduce((acc, c) => acc + c.boughtCount, 0);
      expect(sumPerCakeBought).toBe(metrics.totalBoughtCount);

      const sumPerCakeCancelled = metrics.perCake.reduce((acc, c) => acc + c.cancelledCount, 0);
      expect(sumPerCakeCancelled).toBe(metrics.totalCancelledCount);

      // Relationship checks
      expect(metrics.grossRevenue).toBeGreaterThanOrEqual(metrics.cancelledRevenue);
      expect(metrics.grossRevenue).toBeGreaterThanOrEqual(metrics.netRevenue);
      expect(metrics.totalBoughtCount).toBeGreaterThanOrEqual(metrics.totalCancelledCount);
    });

    it("satisfies all invariants under 100 generated randomized synthetic orders", () => {
      const syntheticCakes = [
        ...CATALOG_FIXTURE,
        { id: "custom-truffle-pyramid", name: "Custom Truffle Pyramid" },
        { id: "bespoke-wedding-chateau", name: "Bespoke Chateau" },
      ];

      const generatedOrders: OrderRecord[] = [];
      const cakePool = syntheticCakes.map((c) => c.id);
      const statuses: ("ACTIVE" | "CANCELLED")[] = ["ACTIVE", "CANCELLED"];
      const prices = [0, 50, 165, 195, 320, 360, 680, 850, 1200, 2500];

      for (let i = 0; i < 100; i++) {
        const cakeId = cakePool[i % cakePool.length];
        const status = statuses[i % 3 === 0 ? 1 : 0]; // ~33% cancelled
        const price = prices[i % prices.length];
        const quantity = (i % 5) + 1; // 1 to 5

        generatedOrders.push({
          id: `gen_order_${i}`,
          cakeId,
          cakeName: `Generated Cake ${cakeId}`,
          customerName: `Client ${i}`,
          customerEmail: `client${i}@aura.luxury`,
          price,
          quantity,
          status,
          createdAt: new Date(Date.now() - i * 60000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const metrics = computeSalesMetrics(generatedOrders, CATALOG_FIXTURE);

      // Invariant 1: netRevenue === grossRevenue - cancelledRevenue
      expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);

      // Invariant 2: sum(perCake.netRevenue) === netRevenue
      const sumPerCakeNet = metrics.perCake.reduce((acc, c) => acc + c.netRevenue, 0);
      expect(sumPerCakeNet).toBe(metrics.netRevenue);

      // Invariant 3: totalBoughtCount === sum(quantities)
      const expectedTotalBought = generatedOrders.reduce((sum, o) => sum + o.quantity, 0);
      expect(metrics.totalBoughtCount).toBe(expectedTotalBought);

      // Invariant 4: totalCancelledCount === sum(cancelled quantities)
      const expectedTotalCancelled = generatedOrders
        .filter((o) => o.status === "CANCELLED")
        .reduce((sum, o) => sum + o.quantity, 0);
      expect(metrics.totalCancelledCount).toBe(expectedTotalCancelled);

      // Invariant 5: sum(perCake.boughtCount) === totalBoughtCount
      const sumPerCakeBought = metrics.perCake.reduce((acc, c) => acc + c.boughtCount, 0);
      expect(sumPerCakeBought).toBe(metrics.totalBoughtCount);

      // Invariant 6: sum(perCake.cancelledCount) === totalCancelledCount
      const sumPerCakeCancelled = metrics.perCake.reduce((acc, c) => acc + c.cancelledCount, 0);
      expect(sumPerCakeCancelled).toBe(metrics.totalCancelledCount);

      // All catalog cakes are represented
      for (const catCake of CATALOG_FIXTURE) {
        const found = metrics.perCake.find((c) => c.cakeId === catCake.id);
        expect(found, `Catalog cake ${catCake.id} must be in perCake`).toBeDefined();
      }

      // Ad-hoc cakes are also present
      expect(metrics.perCake.find((c) => c.cakeId === "custom-truffle-pyramid")).toBeDefined();
      expect(metrics.perCake.find((c) => c.cakeId === "bespoke-wedding-chateau")).toBeDefined();
    });

    it("handles all orders cancelled: netRevenue becomes exactly 0 while grossRevenue equals cancelledRevenue", () => {
      const allCancelledOrders: OrderRecord[] = [
        {
          id: "canc_1",
          cakeId: "elysian-wedding-tier",
          cakeName: "The Elysian Grand Tier",
          customerName: "Alice",
          customerEmail: "alice@aura.luxury",
          price: 680,
          quantity: 2,
          status: "CANCELLED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "canc_2",
          cakeId: "solaris-gala-architectural",
          cakeName: "The Solaris Cube Gala",
          customerName: "Bob",
          customerEmail: "bob@aura.luxury",
          price: 850,
          quantity: 1,
          status: "CANCELLED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const metrics = computeSalesMetrics(allCancelledOrders, CATALOG_FIXTURE);

      expect(metrics.grossRevenue).toBe(680 * 2 + 850 * 1); // 2210
      expect(metrics.cancelledRevenue).toBe(2210);
      expect(metrics.netRevenue).toBe(0);
      expect(metrics.totalBoughtCount).toBe(3);
      expect(metrics.totalCancelledCount).toBe(3);

      // Invariants
      expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);
      const sumPerCakeNet = metrics.perCake.reduce((acc, c) => acc + c.netRevenue, 0);
      expect(sumPerCakeNet).toBe(0);
      expect(sumPerCakeNet).toBe(metrics.netRevenue);
    });
  });

  // =========================================================================
  // 2. Cancellation Invariant Under Dynamic State Transitions
  // =========================================================================
  describe("2. Cancellation Invariant Under Dynamic State Transitions", () => {
    it("strictly preserves grossRevenue while netRevenue decreases and cancelledRevenue increases on order cancellation", async () => {
      const beforeMetrics = await getCakeSalesMetrics();

      // 1. Create a known order
      const newOrder = await createOrder({
        cakeId: "nocturne-anniversary-velvet",
        cakeName: "The Nocturne Reserve",
        customerName: "Lord Byron",
        customerEmail: "byron@luxury.com",
        price: 360,
        quantity: 3, // $1,080 total
      });

      const placedMetrics = await getCakeSalesMetrics();
      expect(placedMetrics.grossRevenue).toBe(beforeMetrics.grossRevenue + 1080);
      expect(placedMetrics.netRevenue).toBe(beforeMetrics.netRevenue + 1080);
      expect(placedMetrics.cancelledRevenue).toBe(beforeMetrics.cancelledRevenue);
      expect(placedMetrics.totalBoughtCount).toBe(beforeMetrics.totalBoughtCount + 3);
      expect(placedMetrics.totalCancelledCount).toBe(beforeMetrics.totalCancelledCount);

      // 2. Cancel the order
      const cancelledOrder = await cancelOrder(newOrder.id);
      expect(cancelledOrder.status).toBe("CANCELLED");

      const afterCancelMetrics = await getCakeSalesMetrics();

      // STRICT INVARIANTS:
      // A. grossRevenue is INVARIANT upon cancellation
      expect(afterCancelMetrics.grossRevenue).toBe(placedMetrics.grossRevenue);

      // B. netRevenue strictly decreases by order total ($1,080)
      expect(afterCancelMetrics.netRevenue).toBe(placedMetrics.netRevenue - 1080);
      expect(afterCancelMetrics.netRevenue).toBe(beforeMetrics.netRevenue);

      // C. cancelledRevenue strictly increases by order total ($1,080)
      expect(afterCancelMetrics.cancelledRevenue).toBe(placedMetrics.cancelledRevenue + 1080);

      // D. totalBoughtCount is INVARIANT upon cancellation
      expect(afterCancelMetrics.totalBoughtCount).toBe(placedMetrics.totalBoughtCount);

      // E. totalCancelledCount strictly increases by quantity (3)
      expect(afterCancelMetrics.totalCancelledCount).toBe(placedMetrics.totalCancelledCount + 3);

      // F. Mathematical consistency
      expect(afterCancelMetrics.netRevenue).toBe(
        afterCancelMetrics.grossRevenue - afterCancelMetrics.cancelledRevenue
      );

      // G. Per-cake breakdown reflects the exact change
      const targetCake = afterCancelMetrics.perCake.find((c) => c.cakeId === "nocturne-anniversary-velvet");
      const targetCakeBefore = beforeMetrics.perCake.find((c) => c.cakeId === "nocturne-anniversary-velvet");
      expect(targetCake).toBeDefined();
      expect(targetCakeBefore).toBeDefined();

      expect(targetCake!.boughtCount).toBe(targetCakeBefore!.boughtCount + 3);
      expect(targetCake!.cancelledCount).toBe(targetCakeBefore!.cancelledCount + 3);
      expect(targetCake!.netRevenue).toBe(targetCakeBefore!.netRevenue); // Net returns to previous baseline
    });
  });

  // =========================================================================
  // 3. Idempotent Double & Concurrent Cancellation Stress
  // =========================================================================
  describe("3. Idempotent Double & Concurrent Cancellation Stress", () => {
    it("cancelling an already cancelled order produces ZERO revenue drift and ZERO count drift", async () => {
      // 1. Create and cancel an order
      const order = await createOrder({
        cakeId: "celeste-baby-shower",
        cakeName: "The Céleste Cloud",
        customerName: "Countess Ada",
        customerEmail: "ada@algorithm.org",
        price: 320,
        quantity: 2,
      });

      await cancelOrder(order.id);
      const metricsAfterFirstCancel = await getCakeSalesMetrics();

      // 2. Second cancellation of the same order
      const secondCancelResult = await cancelOrder(order.id);
      expect(secondCancelResult.status).toBe("CANCELLED");

      const metricsAfterSecondCancel = await getCakeSalesMetrics();

      // Zero drift verification
      expect(metricsAfterSecondCancel.grossRevenue).toBe(metricsAfterFirstCancel.grossRevenue);
      expect(metricsAfterSecondCancel.cancelledRevenue).toBe(metricsAfterFirstCancel.cancelledRevenue);
      expect(metricsAfterSecondCancel.netRevenue).toBe(metricsAfterFirstCancel.netRevenue);
      expect(metricsAfterSecondCancel.totalBoughtCount).toBe(metricsAfterFirstCancel.totalBoughtCount);
      expect(metricsAfterSecondCancel.totalCancelledCount).toBe(metricsAfterFirstCancel.totalCancelledCount);

      // 3. Third cancellation of the same order
      const thirdCancelResult = await cancelOrder(order.id);
      expect(thirdCancelResult.status).toBe("CANCELLED");

      const metricsAfterThirdCancel = await getCakeSalesMetrics();

      expect(metricsAfterThirdCancel.grossRevenue).toBe(metricsAfterFirstCancel.grossRevenue);
      expect(metricsAfterThirdCancel.cancelledRevenue).toBe(metricsAfterFirstCancel.cancelledRevenue);
      expect(metricsAfterThirdCancel.netRevenue).toBe(metricsAfterFirstCancel.netRevenue);
      expect(metricsAfterThirdCancel.totalBoughtCount).toBe(metricsAfterFirstCancel.totalBoughtCount);
      expect(metricsAfterThirdCancel.totalCancelledCount).toBe(metricsAfterFirstCancel.totalCancelledCount);
    });

    it("handles 5 concurrent cancellation requests for the same order without double deduction", async () => {
      const order = await createOrder({
        cakeId: "solaris-gala-architectural",
        cakeName: "The Solaris Cube Gala",
        customerName: "Solaris VIP",
        customerEmail: "vip@solaris.luxury",
        price: 850,
        quantity: 1,
      });

      const metricsBeforeCancel = await getCakeSalesMetrics();

      // Fire 5 simultaneous cancelOrder calls for the exact same order
      const results = await Promise.all([
        cancelOrder(order.id),
        cancelOrder(order.id),
        cancelOrder(order.id),
        cancelOrder(order.id),
        cancelOrder(order.id),
      ]);

      // All 5 must resolve to status CANCELLED
      for (const res of results) {
        expect(res.status).toBe("CANCELLED");
      }

      const metricsAfterConcurrentCancel = await getCakeSalesMetrics();

      // Revenue and counts should have shifted by EXACTLY 1 order ($850), NOT 5 * $850!
      expect(metricsAfterConcurrentCancel.grossRevenue).toBe(metricsBeforeCancel.grossRevenue);
      expect(metricsAfterConcurrentCancel.cancelledRevenue).toBe(metricsBeforeCancel.cancelledRevenue + 850);
      expect(metricsAfterConcurrentCancel.netRevenue).toBe(metricsBeforeCancel.netRevenue - 850);
      expect(metricsAfterConcurrentCancel.totalBoughtCount).toBe(metricsBeforeCancel.totalBoughtCount);
      expect(metricsAfterConcurrentCancel.totalCancelledCount).toBe(metricsBeforeCancel.totalCancelledCount + 1);

      // Invariant check
      expect(metricsAfterConcurrentCancel.netRevenue).toBe(
        metricsAfterConcurrentCancel.grossRevenue - metricsAfterConcurrentCancel.cancelledRevenue
      );
    });
  });

  // =========================================================================
  // 4. Ad-Hoc and Custom Non-Catalog Cake IDs
  // =========================================================================
  describe("4. Ad-Hoc and Custom Non-Catalog Cake IDs", () => {
    it("tracks custom cake ID 'test-isolated-cancel-cake' and custom ad-hoc cakes in perCake metrics", async () => {
      const initialMetrics = await getCakeSalesMetrics();

      // 1. Create order for non-catalog custom cake
      const customCakeId = `test-custom-tier-${Date.now()}`;
      const customOrder = await createOrder({
        cakeId: customCakeId,
        cakeName: "Custom Imperial Gold Tier",
        customerName: "Tester Custom",
        customerEmail: "tester@isolated.org",
        price: 520,
        quantity: 4, // $2,080 total
      });

      const metricsAfterPlacement = await getCakeSalesMetrics();

      expect(metricsAfterPlacement.grossRevenue).toBe(initialMetrics.grossRevenue + 2080);
      expect(metricsAfterPlacement.netRevenue).toBe(initialMetrics.netRevenue + 2080);
      expect(metricsAfterPlacement.totalBoughtCount).toBe(initialMetrics.totalBoughtCount + 4);

      // Verify custom cake appears in perCake
      const customEntry = metricsAfterPlacement.perCake.find((c) => c.cakeId === customCakeId);
      expect(customEntry, "Custom cake must appear in perCake").toBeDefined();
      expect(customEntry!.cakeName).toBe("Custom Imperial Gold Tier");
      expect(customEntry!.boughtCount).toBe(4);
      expect(customEntry!.cancelledCount).toBe(0);
      expect(customEntry!.netRevenue).toBe(2080);

      // Verify all catalog cakes are STILL present in perCake
      for (const catCake of CATALOG_FIXTURE) {
        expect(metricsAfterPlacement.perCake.find((c) => c.cakeId === catCake.id)).toBeDefined();
      }

      // Verify sum of perCake netRevenue equals total netRevenue
      const sumPerCakeNet = metricsAfterPlacement.perCake.reduce((acc, c) => acc + c.netRevenue, 0);
      expect(sumPerCakeNet).toBe(metricsAfterPlacement.netRevenue);

      // 2. Cancel the custom cake order
      await cancelOrder(customOrder.id);

      const metricsAfterCancel = await getCakeSalesMetrics();
      expect(metricsAfterCancel.grossRevenue).toBe(metricsAfterPlacement.grossRevenue);
      expect(metricsAfterCancel.netRevenue).toBe(initialMetrics.netRevenue);
      expect(metricsAfterCancel.cancelledRevenue).toBe(initialMetrics.cancelledRevenue + 2080);
      expect(metricsAfterCancel.totalCancelledCount).toBe(initialMetrics.totalCancelledCount + 4);

      const customEntryAfterCancel = metricsAfterCancel.perCake.find((c) => c.cakeId === customCakeId);
      expect(customEntryAfterCancel).toBeDefined();
      expect(customEntryAfterCancel!.boughtCount).toBe(4);
      expect(customEntryAfterCancel!.cancelledCount).toBe(4);
      expect(customEntryAfterCancel!.netRevenue).toBe(0);

      // Sum still strictly matches
      const sumPerCakeNetAfter = metricsAfterCancel.perCake.reduce((acc, c) => acc + c.netRevenue, 0);
      expect(sumPerCakeNetAfter).toBe(metricsAfterCancel.netRevenue);
    });

    it("handles order creation and cancellation for 'test-isolated-cancel-cake' specifically", async () => {
      const initialMetrics = await getCakeSalesMetrics();
      const existingEntry = initialMetrics.perCake.find((c) => c.cakeId === "test-isolated-cancel-cake");
      const initialBought = existingEntry?.boughtCount || 0;
      const initialCancelled = existingEntry?.cancelledCount || 0;
      const initialNet = existingEntry?.netRevenue || 0;

      const order = await createOrder({
        cakeId: "test-isolated-cancel-cake",
        cakeName: "Isolated Cake",
        customerName: "Adversarial Tester",
        customerEmail: "adversarial@tester.org",
        price: 400,
        quantity: 2,
      });

      const afterPlace = await getCakeSalesMetrics();
      const placeEntry = afterPlace.perCake.find((c) => c.cakeId === "test-isolated-cancel-cake");
      expect(placeEntry).toBeDefined();
      expect(placeEntry!.boughtCount).toBe(initialBought + 2);
      expect(placeEntry!.cancelledCount).toBe(initialCancelled);
      expect(placeEntry!.netRevenue).toBe(initialNet + 800);

      await cancelOrder(order.id);

      const afterCancel = await getCakeSalesMetrics();
      const cancelEntry = afterCancel.perCake.find((c) => c.cakeId === "test-isolated-cancel-cake");
      expect(cancelEntry).toBeDefined();
      expect(cancelEntry!.boughtCount).toBe(initialBought + 2);
      expect(cancelEntry!.cancelledCount).toBe(initialCancelled + 2);
      expect(cancelEntry!.netRevenue).toBe(initialNet);
      expect(afterCancel.netRevenue).toBe(afterCancel.grossRevenue - afterCancel.cancelledRevenue);
    });

    it("handles non-catalog cake creation without cakeName and price by falling back safely", async () => {
      const order = await createOrder({
        cakeId: "ad-hoc-mystery-cake",
        customerName: "Mystery Guest",
        customerEmail: "guest@mystery.org",
      });

      expect(order.cakeId).toBe("ad-hoc-mystery-cake");
      expect(order.cakeName).toBe("ad-hoc-mystery-cake"); // Defaults to cakeId
      expect(order.price).toBe(0); // Defaults to 0 when not in catalog
      expect(order.quantity).toBe(1); // Defaults to 1

      const metrics = await getCakeSalesMetrics();
      const entry = metrics.perCake.find((c) => c.cakeId === "ad-hoc-mystery-cake");
      expect(entry).toBeDefined();
      expect(entry!.boughtCount).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 5. Zero-Sales Catalog Cakes Integrity
  // =========================================================================
  describe("5. Zero-Sales Catalog Cakes Integrity", () => {
    it("ensures all 6 catalog cakes are present in perCake even when order array contains 0 orders", async () => {
      const catalog = await getAllCakes();
      const metrics = computeSalesMetrics([], catalog);

      expect(metrics.perCake.length).toBe(catalog.length);
      for (const cake of catalog) {
        const found = metrics.perCake.find((c) => c.cakeId === cake.id);
        expect(found, `Catalog cake ${cake.id} must be in perCake`).toBeDefined();
        expect(found!.boughtCount).toBe(0);
        expect(found!.cancelledCount).toBe(0);
        expect(found!.netRevenue).toBe(0);
      }
    });

    it("preserves zero-sale catalog cakes when only 1 catalog cake has orders", () => {
      const singleCakeOrders: OrderRecord[] = [
        {
          id: "ord_sole_1",
          cakeId: "elysian-wedding-tier",
          cakeName: "The Elysian Grand Tier",
          customerName: "Single Buyer",
          customerEmail: "single@buyer.com",
          price: 680,
          quantity: 1,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const metrics = computeSalesMetrics(singleCakeOrders, CATALOG_FIXTURE);

      expect(metrics.perCake.length).toBe(CATALOG_FIXTURE.length);

      const elysian = metrics.perCake.find((c) => c.cakeId === "elysian-wedding-tier");
      expect(elysian!.boughtCount).toBe(1);
      expect(elysian!.cancelledCount).toBe(0);
      expect(elysian!.netRevenue).toBe(680);

      const otherCakes = metrics.perCake.filter((c) => c.cakeId !== "elysian-wedding-tier");
      expect(otherCakes.length).toBe(5);
      for (const cake of otherCakes) {
        expect(cake.boughtCount).toBe(0);
        expect(cake.cancelledCount).toBe(0);
        expect(cake.netRevenue).toBe(0);
      }

      // Invariants
      expect(metrics.netRevenue).toBe(680);
      expect(metrics.grossRevenue).toBe(680);
      expect(metrics.cancelledRevenue).toBe(0);
      expect(metrics.totalBoughtCount).toBe(1);
      expect(metrics.totalCancelledCount).toBe(0);
      expect(metrics.perCake.reduce((sum, c) => sum + c.netRevenue, 0)).toBe(680);
    });
  });

  // =========================================================================
  // 6. High-Volume & Stress Invariant Preservation
  // =========================================================================
  describe("6. High-Volume & Stress Invariant Preservation", () => {
    it("preserves exact invariants across 20 rapid sequential order and cancellation cycles", async () => {
      const baseline = await getCakeSalesMetrics();
      const placedOrders: OrderRecord[] = [];

      // 1. Rapidly place 20 orders across all catalog cakes
      for (let i = 0; i < 20; i++) {
        const cake = CATALOG_FIXTURE[i % CATALOG_FIXTURE.length];
        const price = (i + 1) * 50; // $50, $100, ..., $1000
        const qty = (i % 3) + 1; // 1, 2, or 3

        const order = await createOrder({
          cakeId: cake.id,
          cakeName: cake.name,
          customerName: `Stress Client ${i}`,
          customerEmail: `stress${i}@aurapatisserie.com`,
          price,
          quantity: qty,
        });
        placedOrders.push(order);
      }

      const metricsAfterPlacing = await getCakeSalesMetrics();

      const totalPlacedQty = placedOrders.reduce((sum, o) => sum + o.quantity, 0);
      const totalPlacedGross = placedOrders.reduce((sum, o) => sum + o.price * o.quantity, 0);

      expect(metricsAfterPlacing.totalBoughtCount).toBe(baseline.totalBoughtCount + totalPlacedQty);
      expect(metricsAfterPlacing.grossRevenue).toBe(baseline.grossRevenue + totalPlacedGross);
      expect(metricsAfterPlacing.netRevenue).toBe(baseline.netRevenue + totalPlacedGross);
      expect(metricsAfterPlacing.cancelledRevenue).toBe(baseline.cancelledRevenue);

      // Invariant checks
      expect(metricsAfterPlacing.netRevenue).toBe(
        metricsAfterPlacing.grossRevenue - metricsAfterPlacing.cancelledRevenue
      );
      expect(metricsAfterPlacing.perCake.reduce((sum, c) => sum + c.netRevenue, 0)).toBe(
        metricsAfterPlacing.netRevenue
      );

      // 2. Cancel half (10) of the placed orders
      let cancelledQty = 0;
      let cancelledGross = 0;
      for (let i = 0; i < 10; i++) {
        await cancelOrder(placedOrders[i].id);
        cancelledQty += placedOrders[i].quantity;
        cancelledGross += placedOrders[i].price * placedOrders[i].quantity;
      }

      const metricsAfterPartialCancel = await getCakeSalesMetrics();

      // grossRevenue must remain constant
      expect(metricsAfterPartialCancel.grossRevenue).toBe(metricsAfterPlacing.grossRevenue);

      // cancelledRevenue increases
      expect(metricsAfterPartialCancel.cancelledRevenue).toBe(
        metricsAfterPlacing.cancelledRevenue + cancelledGross
      );

      // netRevenue decreases by cancelled amount
      expect(metricsAfterPartialCancel.netRevenue).toBe(
        metricsAfterPlacing.netRevenue - cancelledGross
      );

      // Counts
      expect(metricsAfterPartialCancel.totalBoughtCount).toBe(metricsAfterPlacing.totalBoughtCount);
      expect(metricsAfterPartialCancel.totalCancelledCount).toBe(
        metricsAfterPlacing.totalCancelledCount + cancelledQty
      );

      // Invariants
      expect(metricsAfterPartialCancel.netRevenue).toBe(
        metricsAfterPartialCancel.grossRevenue - metricsAfterPartialCancel.cancelledRevenue
      );
      expect(metricsAfterPartialCancel.perCake.reduce((sum, c) => sum + c.netRevenue, 0)).toBe(
        metricsAfterPartialCancel.netRevenue
      );
    });

    it("handles boundary orders with extreme quantities without calculation breakdown", () => {
      const boundaryOrders: OrderRecord[] = [
        {
          id: "huge_1",
          cakeId: "elysian-wedding-tier",
          cakeName: "The Elysian Grand Tier",
          customerName: "Mega Corporate Event",
          customerEmail: "mega@corp.com",
          price: 680,
          quantity: 10000, // $6,800,000
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "huge_2",
          cakeId: "elysian-wedding-tier",
          cakeName: "The Elysian Grand Tier",
          customerName: "Mega Corporate Event Cancelled",
          customerEmail: "mega@corp.com",
          price: 680,
          quantity: 5000, // $3,400,000 cancelled
          status: "CANCELLED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const metrics = computeSalesMetrics(boundaryOrders, CATALOG_FIXTURE);

      expect(metrics.totalBoughtCount).toBe(15000);
      expect(metrics.totalCancelledCount).toBe(5000);
      expect(metrics.grossRevenue).toBe(10200000); // 15000 * 680
      expect(metrics.cancelledRevenue).toBe(3400000); // 5000 * 680
      expect(metrics.netRevenue).toBe(6800000); // 10000 * 680

      expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);
      expect(metrics.perCake.reduce((sum, c) => sum + c.netRevenue, 0)).toBe(metrics.netRevenue);
    });
  });

  // =========================================================================
  // 7. Error Handling & Guardrails Stress
  // =========================================================================
  describe("7. Error Handling & Guardrails Stress", () => {
    it("rejects order cancellation with empty, whitespace, or invalid IDs", async () => {
      await expect(cancelOrder("")).rejects.toThrow();
      await expect(cancelOrder("   ")).rejects.toThrow();
      await expect(cancelOrder("non-existent-order-id-xyz-99999")).rejects.toThrow(/not found/i);
    });

    it("rejects order creation with missing cakeId, customerName, or invalid customerEmail", async () => {
      await expect(
        createOrder({
          cakeId: "",
          customerName: "John Doe",
          customerEmail: "john@example.com",
        })
      ).rejects.toThrow(/cakeId/i);

      await expect(
        createOrder({
          cakeId: "celeste-baby-shower",
          customerName: "   ",
          customerEmail: "john@example.com",
        })
      ).rejects.toThrow(/customerName/i);

      await expect(
        createOrder({
          cakeId: "celeste-baby-shower",
          customerName: "John Doe",
          customerEmail: "invalid-email-without-at",
        })
      ).rejects.toThrow(/customerEmail/i);
    });
  });
});
