"use client";

import React, { useState } from "react";
import {
  Users,
  Bot,
  Activity,
  DollarSign,
  ShoppingBag,
  XCircle,
  ShieldAlert,
  Search,
} from "lucide-react";
import {
  VisitAnalyticsSummary,
  CakeSalesMetrics,
  OrderRecord,
} from "@/lib/data-service";

interface Props {
  role: "ADMIN" | "SEO_SPECIALIST";
  visits: VisitAnalyticsSummary;
  financials?: CakeSalesMetrics | null;
  orders?: OrderRecord[] | null;
}

export default function AnalyticsDashboard({
  role,
  visits,
  financials: initialFinancials,
  orders: initialOrders,
}: Props) {
  const [activeTab, setActiveTab] = useState<"traffic" | "revenue" | "orders">(
    "traffic"
  );
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders || []);
  const [financials, setFinancials] = useState<CakeSalesMetrics | null | undefined>(
    initialFinancials
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visitFilter, setVisitFilter] = useState<"all" | "users" | "bots">("all");

  const isAdmin = role === "ADMIN";

  // Normal vs Bot calculations
  const totalVisits = visits.totalVisits || 1;
  const userPercent = Math.round(((visits.normalUserVisits || 0) / totalVisits) * 100);
  const botPercent = Math.round(((visits.botVisits || 0) / totalVisits) * 100);

  // Filtered visits
  const filteredVisits = (visits.recentVisits || []).filter((v) => {
    if (visitFilter === "users" && v.isBot) return false;
    if (visitFilter === "bots" && !v.isBot) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.path.toLowerCase().includes(term) ||
      (v.botName && v.botName.toLowerCase().includes(term)) ||
      v.userAgent.toLowerCase().includes(term)
    );
  });

  // Handle Order Cancellation (Admin Only)
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This will update net revenue.")) {
      return;
    }
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        await res.json();
        // Update local orders
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" as const } : o))
        );
        // Recalculate financials locally
        if (financials) {
          const target = orders.find((o) => o.id === orderId);
          if (target && target.status === "ACTIVE") {
            const loss = target.price * target.quantity;
            setFinancials({
              ...financials,
              totalCancelledCount: financials.totalCancelledCount + target.quantity,
              cancelledRevenue: financials.cancelledRevenue + loss,
              netRevenue: financials.netRevenue - loss,
              perCake: financials.perCake.map((c) =>
                c.cakeId === target.cakeId
                  ? {
                      ...c,
                      cancelledCount: c.cancelledCount + target.quantity,
                      netRevenue: c.netRevenue - loss,
                    }
                  : c
              ),
            });
          }
        }
      } else {
        alert("Failed to cancel order.");
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      alert("Error occurred while cancelling order.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Role Notice */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isAdmin
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {role === "ADMIN" ? "Administrator Access" : "SEO Specialist Access"}
            </span>
            <span className="text-xs text-[#86868b] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Live Ingestion Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
            Traffic, Bot Crawlers & Revenue Intelligence
          </h1>
          <p className="text-sm text-[#86868b] mt-0.5">
            {isAdmin
              ? "Comprehensive analytics across user behavior, automated bot crawlers, and cake sales revenue."
              : "Monitor search engine bots, AI crawlers, and normal browser traffic patterns across all patisserie pages."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#f5f5f7] p-1 rounded-xl self-start md:self-auto border border-[#e5e5ea]">
          <button
            onClick={() => setActiveTab("traffic")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "traffic"
                ? "bg-white text-[#1d1d1f] shadow-sm"
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            Traffic & Bots
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "revenue"
                ? "bg-white text-[#1d1d1f] shadow-sm"
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            Cake Revenue
            {!isAdmin && <ShieldAlert className="w-3 h-3 text-amber-500" />}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-white text-[#1d1d1f] shadow-sm"
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            Orders & Cancellations
            {!isAdmin && <ShieldAlert className="w-3 h-3 text-amber-500" />}
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Visits */}
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Traffic</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#1d1d1f]">
            {visits.totalVisits.toLocaleString()}
          </div>
          <p className="text-xs text-[#86868b] mt-1">Recorded page impressions</p>
        </div>

        {/* Normal Users */}
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Normal Visitors</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {visits.normalUserVisits.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {userPercent}% of traffic
            </span>
            <span className="text-xs text-[#86868b]">Browser sessions</span>
          </div>
        </div>

        {/* Bot Visits */}
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bot & AI Crawlers</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600">
            {visits.botVisits.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {botPercent}% of traffic
            </span>
            <span className="text-xs text-[#86868b]">Search & AI bots</span>
          </div>
        </div>

        {/* Financial KPI (Admin Only) */}
        {isAdmin && financials ? (
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between text-[#86868b] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Net Cake Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#1d1d1f]">
              ${financials.netRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {financials.totalBoughtCount - financials.totalCancelledCount} Active Orders
              </span>
              <span className="text-xs text-rose-500 font-medium">
                ({financials.totalCancelledCount} cancelled)
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#fafafc] border border-dashed border-[#d2d2d7] rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs mb-1">
              <ShieldAlert className="w-4 h-4" /> Financial Data Restricted
            </div>
            <p className="text-xs text-[#86868b]">
              Revenue metrics and order pricing are reserved for Administrators.
            </p>
          </div>
        )}
      </div>

      {/* TAB 1: TRAFFIC & BOT ANALYTICS */}
      {activeTab === "traffic" && (
        <div className="space-y-6">
          {/* Traffic Ratio Comparison Bar */}
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1d1f] mb-3">
              Audience Composition: Normal Users vs. Automated Crawlers
            </h3>
            <div className="h-4 bg-[#f0f0f4] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${userPercent}%` }}
                className="bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                title={`Normal Users: ${visits.normalUserVisits} (${userPercent}%)`}
              />
              <div
                style={{ width: `${botPercent}%` }}
                className="bg-purple-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                title={`Bots: ${visits.botVisits} (${botPercent}%)`}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-[#6e6e73] mt-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Normal Users: <strong>{visits.normalUserVisits}</strong> ({userPercent}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                <span>Bots & Crawlers: <strong>{visits.botVisits}</strong> ({botPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Bot Classification Breakdown */}
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Identified Bot & AI Crawler Activity
                </h3>
                <p className="text-xs text-[#86868b]">
                  Search engine bots (Googlebot, Bingbot) and Generative AI indexers (GPTBot, PerplexityBot, ClaudeBot)
                </p>
              </div>
              <Bot className="w-5 h-5 text-purple-600" />
            </div>

            {Object.keys(visits.botBreakdown || {}).length === 0 ? (
              <p className="text-xs text-[#86868b] py-4 text-center">
                No crawler activity recorded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(visits.botBreakdown || {}).map(([name, count]) => {
                  const isAi = ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"].includes(
                    name
                  );
                  return (
                    <div
                      key={name}
                      className="bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-[#1d1d1f] truncate">
                          {name}
                        </span>
                        {isAi && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-[#1d1d1f]">{count} visits</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Visits Log */}
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1d1f]">
                  Recent Visit Log
                </h3>
                <p className="text-xs text-[#86868b]">
                  Real-time incoming request traffic captured via Edge proxy
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868b]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search path or bot..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={visitFilter}
                  onChange={(e) => setVisitFilter(e.target.value as "all" | "users" | "bots")}
                  className="px-3 py-1.5 text-xs bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg focus:outline-none"
                >
                  <option value="all">All Visitors</option>
                  <option value="users">Normal Users Only</option>
                  <option value="bots">Bots & Crawlers Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5e5ea] text-[#86868b]">
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Path</th>
                    <th className="pb-3 font-semibold">Bot / Agent</th>
                    <th className="pb-3 font-semibold">User Agent Signature</th>
                    <th className="pb-3 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f7]">
                  {filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#86868b]">
                        No visits match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredVisits.slice(0, 25).map((v) => (
                      <tr key={v.id} className="hover:bg-[#fafafc]">
                        <td className="py-2.5">
                          {v.isBot ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              <Bot className="w-3 h-3" /> BOT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Users className="w-3 h-3" /> USER
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 font-mono text-[#1d1d1f]">{v.path}</td>
                        <td className="py-2.5 font-medium text-[#1d1d1f]">
                          {v.botName || <span className="text-[#86868b]">Normal Browser</span>}
                        </td>
                        <td className="py-2.5 text-[#86868b] truncate max-w-xs" title={v.userAgent}>
                          {v.userAgent}
                        </td>
                        <td className="py-2.5 text-right text-[#86868b] whitespace-nowrap">
                          {new Date(v.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAKE REVENUE (ADMIN ONLY) */}
      {activeTab === "revenue" && (
        <>
          {!isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-amber-900">
                Financial Metrics Restricted
              </h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto mt-1">
                Your role (<strong>SEO_SPECIALIST</strong>) does not have permission to view cake revenue,
                order financials, or cancellation totals. Please switch to the Traffic tab to analyze visitor and crawler behavior.
              </p>
            </div>
          ) : financials ? (
            <div className="space-y-6">
              {/* Financial Summary KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Gross Cake Sales
                  </span>
                  <div className="text-2xl font-bold text-[#1d1d1f] mt-1">
                    ${financials.grossRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-[#86868b] mt-1">
                    {financials.totalBoughtCount} cakes ordered
                  </p>
                </div>
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Cancelled Losses
                  </span>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    -${financials.cancelledRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-rose-500 mt-1">
                    {financials.totalCancelledCount} orders cancelled
                  </p>
                </div>
                <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Net Realized Revenue
                  </span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    ${financials.netRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Gross sales minus cancellations
                  </p>
                </div>
              </div>

              {/* Per-Cake Sales Performance Table */}
              <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1d1f]">
                      Cake-by-Cake Sales & Revenue Breakdown
                    </h3>
                    <p className="text-xs text-[#86868b]">
                      Quantities bought, cancelled, and net generated revenue per cake
                    </p>
                  </div>
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e5e5ea] text-[#86868b]">
                        <th className="pb-3 font-semibold">Cake Product</th>
                        <th className="pb-3 font-semibold text-center">Bought</th>
                        <th className="pb-3 font-semibold text-center">Cancelled</th>
                        <th className="pb-3 font-semibold text-center">Net Active</th>
                        <th className="pb-3 font-semibold text-right">Net Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7]">
                      {financials.perCake.map((item) => {
                        const netCount = item.boughtCount - item.cancelledCount;
                        return (
                          <tr key={item.cakeId} className="hover:bg-[#fafafc]">
                            <td className="py-3 font-semibold text-[#1d1d1f]">
                              {item.cakeName}
                            </td>
                            <td className="py-3 text-center font-bold text-emerald-600">
                              {item.boughtCount}
                            </td>
                            <td className="py-3 text-center font-bold text-rose-500">
                              {item.cancelledCount}
                            </td>
                            <td className="py-3 text-center font-bold text-[#1d1d1f]">
                              {netCount}
                            </td>
                            <td className="py-3 text-right font-extrabold text-[#1d1d1f]">
                              ${item.netRevenue.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* TAB 3: ORDERS & CANCELLATIONS (ADMIN ONLY) */}
      {activeTab === "orders" && (
        <>
          {!isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-amber-900">
                Order Management Restricted
              </h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto mt-1">
                Your account does not have administrative rights to manage or cancel customer orders.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1d1f]">
                    Order Management & Cancellations
                  </h3>
                  <p className="text-xs text-[#86868b]">
                    Live and historical customer orders with direct cancellation controls
                  </p>
                </div>
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e5e5ea] text-[#86868b]">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Cake</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold text-center">Qty</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                      <th className="pb-3 font-semibold text-center">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f7]">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-[#86868b]">
                          No orders in the database.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => {
                        const total = o.price * o.quantity;
                        const isCancelled = o.status === "CANCELLED";
                        return (
                          <tr key={o.id} className="hover:bg-[#fafafc]">
                            <td className="py-3 font-mono text-[11px] text-[#86868b]">
                              {o.id.slice(0, 12)}...
                            </td>
                            <td className="py-3 font-semibold text-[#1d1d1f]">
                              {o.cakeName}
                            </td>
                            <td className="py-3 text-[#1d1d1f]">
                              <div>{o.customerName}</div>
                              <div className="text-[10px] text-[#86868b]">{o.customerEmail}</div>
                            </td>
                            <td className="py-3 text-center font-bold text-[#1d1d1f]">
                              {o.quantity}
                            </td>
                            <td className="py-3 text-right font-bold text-[#1d1d1f]">
                              ${total.toLocaleString()}
                            </td>
                            <td className="py-3 text-center">
                              {isCancelled ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  <XCircle className="w-3 h-3" /> CANCELLED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  ACTIVE
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              {!isCancelled ? (
                                <button
                                  onClick={() => handleCancelOrder(o.id)}
                                  disabled={cancellingId === o.id}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {cancellingId === o.id ? "Cancelling..." : "Cancel Order"}
                                </button>
                              ) : (
                                <span className="text-[11px] text-[#86868b] italic">
                                  Cancelled
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
