import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getVisitAnalytics,
  getCakeSalesMetrics,
  getAllOrders,
} from "@/lib/data-service";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

/**
 * Dedicated Analytics Page (Next.js Server Component)
 *
 * RBAC Rules:
 * - Unauthenticated: Redirects to /admin/login
 * - SEO_SPECIALIST: Receives visit analytics only; financials and orders are strictly omitted
 * - ADMIN: Receives visit analytics, cake sales metrics, and all order records
 */
export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const visits = await getVisitAnalytics();

  if (session.role === "ADMIN") {
    const [financials, orders] = await Promise.all([
      getCakeSalesMetrics(),
      getAllOrders(),
    ]);

    return (
      <AnalyticsDashboard
        role="ADMIN"
        initialVisits={visits}
        initialFinancials={financials}
        initialOrders={orders}
      />
    );
  }

  // SEO_SPECIALIST: Strictly redact financials and orders
  return (
    <AnalyticsDashboard
      role="SEO_SPECIALIST"
      initialVisits={visits}
    />
  );
}
