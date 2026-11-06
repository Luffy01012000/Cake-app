"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Bot,
  Activity,
  DollarSign,
  ShoppingBag,
  XCircle,
  Search,
  Percent,
  Calendar,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  VisitAnalyticsSummary,
  CakeSalesMetrics,
  OrderRecord,
  DailyVisitTrend,
} from "@/lib/data-service";
import {
  classifyUserAgent,
  formatBotCategoryLabel,
  UAClassificationCategory,
} from "@/lib/visit-utils";

export interface AnalyticsDashboardProps {
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
}: AnalyticsDashboardProps) {
  const isAdmin = role === "ADMIN";

  // Navigation tab state: only ADMIN can switch between traffic, revenue, and orders
  const [activeTab, setActiveTab] = useState<"traffic" | "revenue" | "orders">(
    "traffic"
  );

  // Local state for orders & financials to support live interactive cancellation
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders || []);
  const [financials, setFinancials] = useState<CakeSalesMetrics | null | undefined>(
    initialFinancials
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Table filters
  const [searchTerm, setSearchTerm] = useState("");
  const [visitFilter, setVisitFilter] = useState<"all" | "users" | "bots">("all");
  const [selectedBotCategory, setSelectedBotCategory] = useState<string>("all");

  // Normal vs Bot calculations
  const totalVisits = visits.totalVisits || 1;
  const normalVisits = visits.normalUserVisits || 0;
  const botVisits = visits.botVisits || 0;
  const userPercent = Math.round((normalVisits / totalVisits) * 100);
  const botPercent = Math.round((botVisits / totalVisits) * 100);

  // --------------------------------------------------------------------------
  // 1. Bot Category Breakdown Calculation (AI Crawlers, Search Bots, Scrapers)
  // --------------------------------------------------------------------------
  const categoryStats = useMemo(() => {
    let aiCrawlerCount = 0;
    let searchBotCount = 0;
    let scraperToolCount = 0;

    const breakdown = visits.botBreakdown || {};

    const categorizedBots: {
      ai: Array<{ name: string; count: number }>;
      search: Array<{ name: string; count: number }>;
      scrapers: Array<{ name: string; count: number }>;
    } = {
      ai: [],
      search: [],
      scrapers: [],
    };

    for (const [botName, rawCount] of Object.entries(breakdown)) {
      const count = typeof rawCount === "number" ? rawCount : Number(rawCount) || 0;
      const classification = classifyUserAgent(botName);
      if (classification.category === "AI_CRAWLER") {
        aiCrawlerCount += count;
        categorizedBots.ai.push({ name: botName, count });
      } else if (classification.category === "SEARCH_BOT") {
        searchBotCount += count;
        categorizedBots.search.push({ name: botName, count });
      } else {
        scraperToolCount += count;
        categorizedBots.scrapers.push({ name: botName, count });
      }
    }

    // Sort descending by count
    categorizedBots.ai.sort((a, b) => b.count - a.count);
    categorizedBots.search.sort((a, b) => b.count - a.count);
    categorizedBots.scrapers.sort((a, b) => b.count - a.count);

    return {
      aiCrawlerCount,
      searchBotCount,
      scraperToolCount,
      categorizedBots,
    };
  }, [visits.botBreakdown]);

  // --------------------------------------------------------------------------
  // 2. Daily Trends Data (from visits.dailyTrends or synthesized from recentVisits)
  // --------------------------------------------------------------------------
  const trends: DailyVisitTrend[] = useMemo(() => {
    if (visits.dailyTrends && visits.dailyTrends.length > 0) {
      return visits.dailyTrends;
    }

    // Fallback: Group recent visits by UTC date string
    const map: Record<string, DailyVisitTrend> = {};
    for (const v of visits.recentVisits || []) {
      const date = (v.createdAt || "").slice(0, 10) || "Recent";
      if (!map[date]) {
        map[date] = { date, normalVisits: 0, botVisits: 0, totalVisits: 0 };
      }
      map[date].totalVisits++;
      if (v.isBot) map[date].botVisits++;
      else map[date].normalVisits++;
    }
    const result = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    return result.length > 0
      ? result
      : [
          {
            date: "Today",
            normalVisits: normalVisits,
            botVisits: botVisits,
            totalVisits: totalVisits,
          },
        ];
  }, [visits.dailyTrends, visits.recentVisits, normalVisits, botVisits, totalVisits]);

  const maxTrendTotal = useMemo(() => {
    return Math.max(...trends.map((t) => t.totalVisits), 1);
  }, [trends]);

  // --------------------------------------------------------------------------
  // 3. Filtered Visits Table Logic
  // --------------------------------------------------------------------------
  const filteredVisits = useMemo(() => {
    return (visits.recentVisits || []).filter((v) => {
      // Filter by user vs bot
      if (visitFilter === "users" && v.isBot) return false;
      if (visitFilter === "bots" && !v.isBot) return false;

      // Filter by bot category if selected
      if (selectedBotCategory !== "all" && v.isBot) {
        const cat = classifyUserAgent(v.botName || v.userAgent).category;
        if (cat !== selectedBotCategory) return false;
      }

      // Filter by search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        v.path.toLowerCase().includes(term) ||
        (v.botName && v.botName.toLowerCase().includes(term)) ||
        (v.ip && v.ip.toLowerCase().includes(term)) ||
        v.userAgent.toLowerCase().includes(term)
      );
    });
  }, [visits.recentVisits, visitFilter, selectedBotCategory, searchTerm]);

  // --------------------------------------------------------------------------
  // 4. Live Order Cancellation Action (ADMIN ONLY)
  // --------------------------------------------------------------------------
  const handleCancelOrder = async (orderId: string) => {
    if (!isAdmin) return;
    if (
      !confirm(
        "Are you sure you want to cancel this order? This will deduct its value from Net Revenue."
      )
    ) {
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
        // Update local order list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "CANCELLED" as const } : o
          )
        );

        // Update local financials
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
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Order cancellation error:", err);
      alert("Error occurred while communicating with the order cancellation service.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ==================================================================== */}
      {/* EXECUTIVE HEADER & TAB NAVIGATION                                     */}
      {/* ==================================================================== */}
      <div className="bg-[#121216] border border-[#23232c] rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        {/* Subtle gold metallic shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                  isAdmin
                    ? "bg-[#1c1822] text-[#e5c158] border-[#d4af37]/40"
                    : "bg-[#151c28] text-[#60a5fa] border-[#2563eb]/40"
                }`}
              >
                {isAdmin ? "Executive Terminal • Administrator" : "SEO Specialist Terminal"}
              </span>
              <span className="text-xs text-[#a1a1aa] flex items-center gap-1.5 ml-2 font-mono">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live Ingestion Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Traffic & Bot Intelligence</span>
              {isAdmin && (
                <span className="text-[#a1a1aa] font-normal text-xl sm:text-2xl">
                  & Cake Sales Financials
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-2xl">
              {isAdmin
                ? "Unified command center analyzing crawler access patterns, audience distributions, and real-time luxury cake order revenue."
                : "Continuous inspection of search engine crawlers, Generative AI bots, and normal visitor engagement across all patisserie routes."}
            </p>
          </div>

          {/* Tab Switcher: Rendered ONLY for ADMIN; completely absent for SEO_SPECIALIST */}
          {isAdmin && (
            <div className="flex bg-[#1a1a22] p-1.5 rounded-xl border border-[#2b2b36] self-start lg:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("traffic")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === "traffic"
                    ? "bg-[#252530] text-white shadow-sm border border-[#3b3b48]"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-[#e5c158]" />
                Traffic & Bots
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("revenue")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === "revenue"
                    ? "bg-[#252530] text-white shadow-sm border border-[#3b3b48]"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Cake Revenue
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === "orders"
                    ? "bg-[#252530] text-white shadow-sm border border-[#3b3b48]"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                Orders & Actions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION A: TRAFFIC & BOT ANALYTICS (Rendered for ALL Roles)          */}
      {/* ==================================================================== */}
      {(activeTab === "traffic" || !isAdmin) && (
        <div className="space-y-8">
          {/* 4 PRIMARY TRAFFIC KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Traffic */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Impressions
                </span>
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {visits.totalVisits.toLocaleString()}
              </div>
              <p className="text-xs text-[#71717a] mt-1.5 flex items-center gap-1">
                <span>All recorded catalog route visits</span>
              </p>
            </div>

            {/* Card 2: Normal Visitors */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Normal Visitors
                </span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                {normalVisits.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono">
                  {userPercent}% of traffic
                </span>
                <span className="text-xs text-[#71717a]">Human browsers</span>
              </div>
            </div>

            {/* Card 3: Bot & AI Crawlers */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Bot & AI Crawlers
                </span>
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-purple-400 font-mono tabular-nums">
                {botVisits.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/70 border border-purple-800/40 px-2 py-0.5 rounded-full font-mono">
                  {botPercent}% of traffic
                </span>
                <span className="text-xs text-[#71717a]">Automated agents</span>
              </div>
            </div>

            {/* Card 4: Bot Percentage KPI Card */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Crawler Share Ratio
                </span>
                <Percent className="w-4 h-4 text-[#e5c158]" />
              </div>
              <div className="text-3xl font-extrabold text-[#e5c158] font-mono tabular-nums">
                {botPercent}%
              </div>
              {/* Visual mini ratio bar */}
              <div className="h-2 w-full bg-[#23232c] rounded-full overflow-hidden flex mt-2.5">
                <div
                  style={{ width: `${userPercent}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Normal Users: ${userPercent}%`}
                />
                <div
                  style={{ width: `${botPercent}%` }}
                  className="bg-purple-500 transition-all duration-500"
                  title={`Bots: ${botPercent}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#71717a] mt-1 font-mono">
                <span>{normalVisits} Humans</span>
                <span>{botVisits} Crawlers</span>
              </div>
            </div>
          </div>

          {/* BOT CATEGORY BREAKDOWN (AI Crawlers, Search Bots, Scrapers) */}
          <div className="bg-[#141419] border border-[#252530] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#e5c158]" />
                  Bot Category Breakdown & Agent Signatures
                </h2>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  Granular distribution across Generative AI models, traditional search engines, and automated scrapers
                </p>
              </div>
              <div className="text-xs font-mono text-[#a1a1aa]">
                {Object.keys(visits.botBreakdown || {}).length} Unique Crawlers Detected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Category 1: AI Crawlers */}
              <div className="bg-[#181820] border border-[#2c2c38] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Generative AI Crawlers
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 border border-purple-800/40 px-2 py-0.5 rounded-full">
                      {categoryStats.aiCrawlerCount} visits
                    </span>
                  </div>
                  <p className="text-xs text-[#71717a] mb-4">
                    OpenAI GPTBot, Perplexity, Anthropic Claude, Gemini Google-Extended & Common Crawl indexers.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryStats.categorizedBots.ai.length === 0 ? (
                      <span className="text-xs text-[#52525b] italic">None detected</span>
                    ) : (
                      categoryStats.categorizedBots.ai.map((b) => (
                        <span
                          key={b.name}
                          className="text-[11px] font-mono bg-[#231b34] text-purple-200 border border-purple-800/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <span>{b.name}</span>
                          <span className="text-purple-400 font-bold">({b.count})</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Category 2: Search Engine Bots */}
              <div className="bg-[#181820] border border-[#2c2c38] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Search Engine Bots
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950/80 border border-blue-800/40 px-2 py-0.5 rounded-full">
                      {categoryStats.searchBotCount} visits
                    </span>
                  </div>
                  <p className="text-xs text-[#71717a] mb-4">
                    Googlebot, Microsoft Bingbot, DuckDuckBot, Baiduspider, and major organic search indexers.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryStats.categorizedBots.search.length === 0 ? (
                      <span className="text-xs text-[#52525b] italic">None detected</span>
                    ) : (
                      categoryStats.categorizedBots.search.map((b) => (
                        <span
                          key={b.name}
                          className="text-[11px] font-mono bg-[#162438] text-blue-200 border border-blue-800/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <span>{b.name}</span>
                          <span className="text-blue-400 font-bold">({b.count})</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Category 3: Scrapers & Tools */}
              <div className="bg-[#181820] border border-[#2c2c38] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Scrapers & HTTP Tools
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/40 px-2 py-0.5 rounded-full">
                      {categoryStats.scraperToolCount} visits
                    </span>
                  </div>
                  <p className="text-xs text-[#71717a] mb-4">
                    Headless browsers, CLI tools (curl, wget), python-requests, and automated scraping software.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryStats.categorizedBots.scrapers.length === 0 ? (
                      <span className="text-xs text-[#52525b] italic">None detected</span>
                    ) : (
                      categoryStats.categorizedBots.scrapers.map((b) => (
                        <span
                          key={b.name}
                          className="text-[11px] font-mono bg-[#282216] text-amber-200 border border-amber-800/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <span>{b.name}</span>
                          <span className="text-amber-400 font-bold">({b.count})</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DAILY TRENDS CHART (SVG Visualization) */}
          <div className="bg-[#141419] border border-[#252530] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#e5c158]" />
                  Daily Ingestion Trends (Normal Visitors vs. Bots)
                </h2>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  Timeline trajectory comparing human browser sessions against crawler waves
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-[#a1a1aa]">Normal Visitors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-purple-500" />
                  <span className="text-[#a1a1aa]">Bots & Crawlers</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Bars */}
            <div className="pt-4 pb-2">
              <div className="h-48 w-full flex items-end gap-3 sm:gap-6 px-2 border-b border-[#2c2c38]">
                {trends.map((t, idx) => {
                  const normalHeight = (t.normalVisits / maxTrendTotal) * 100;
                  const botHeight = (t.botVisits / maxTrendTotal) * 100;
                  return (
                    <div
                      key={t.date || idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 bg-[#1e1e28] border border-[#3b3b4a] text-white text-[11px] p-2 rounded-lg pointer-events-none z-20 shadow-xl whitespace-nowrap font-mono">
                        <div className="font-bold text-[#e5c158]">{t.date}</div>
                        <div>Normal: {t.normalVisits} | Bots: {t.botVisits}</div>
                        <div>Total: {t.totalVisits} visits</div>
                      </div>

                      {/* Bar group */}
                      <div className="w-full max-w-[48px] flex items-end gap-1 h-full">
                        {/* Normal User Bar */}
                        <div
                          style={{ height: `${Math.max(normalHeight, 4)}%` }}
                          className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        />
                        {/* Bot Bar */}
                        <div
                          style={{ height: `${Math.max(botHeight, 4)}%` }}
                          className="flex-1 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        />
                      </div>

                      {/* X-axis label */}
                      <div className="text-[10px] text-[#71717a] font-mono mt-2 truncate max-w-[60px] text-center">
                        {t.date.length > 5 ? t.date.slice(5) : t.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RECENT VISITS TABLE WITH PATH, IP, BOT NAME, TIMESTAMP */}
          <div className="bg-[#141419] border border-[#252530] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Live Traffic & Request Stream
                </h2>
                <p className="text-xs text-[#a1a1aa]">
                  Inspecting incoming HTTP requests with parsed IP addresses and User-Agent categorization
                </p>
              </div>

              {/* Table Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#71717a]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search path, IP, bot..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#1a1a22] text-white border border-[#2c2c38] rounded-lg focus:outline-none focus:border-[#d4af37] w-48 sm:w-56"
                  />
                </div>

                <select
                  value={visitFilter}
                  onChange={(e) => setVisitFilter(e.target.value as "all" | "users" | "bots")}
                  className="px-3 py-1.5 text-xs bg-[#1a1a22] text-white border border-[#2c2c38] rounded-lg focus:outline-none"
                >
                  <option value="all">All Visitors</option>
                  <option value="users">Normal Users Only</option>
                  <option value="bots">Bots Only</option>
                </select>

                <select
                  value={selectedBotCategory}
                  onChange={(e) => setSelectedBotCategory(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#1a1a22] text-white border border-[#2c2c38] rounded-lg focus:outline-none"
                >
                  <option value="all">All Bot Categories</option>
                  <option value="AI_CRAWLER">AI Crawlers</option>
                  <option value="SEARCH_BOT">Search Bots</option>
                  <option value="SCRAPER_TOOL">Scrapers & Tools</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2c2c38] text-[#71717a]">
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Type</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Path</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">IP Address</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Bot / Agent</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">User-Agent Signature</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202a]">
                  {filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#71717a]">
                        No visit records match your selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredVisits.slice(0, 30).map((v) => {
                      const category = classifyUserAgent(v.botName || v.userAgent).category;
                      return (
                        <tr key={v.id} className="hover:bg-[#191922] transition-colors">
                          <td className="py-3">
                            {v.isBot ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#261c38] text-purple-300 border border-purple-800/40">
                                <Bot className="w-3 h-3" /> BOT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14291f] text-emerald-300 border border-emerald-800/40">
                                <Users className="w-3 h-3" /> USER
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-mono text-white text-[11px]">
                            {v.path}
                          </td>
                          <td className="py-3 font-mono text-[#a1a1aa] text-[11px]">
                            {v.ip || <span className="text-[#52525b]">—</span>}
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-white">
                              {v.botName || "Browser Client"}
                            </div>
                            <div className="text-[10px] text-[#71717a]">
                              {formatBotCategoryLabel(category)}
                            </div>
                          </td>
                          <td
                            className="py-3 text-[#71717a] font-mono text-[11px] truncate max-w-xs"
                            title={v.userAgent}
                          >
                            {v.userAgent}
                          </td>
                          <td className="py-3 text-right font-mono text-[#a1a1aa] text-[11px] whitespace-nowrap">
                            {new Date(v.createdAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION B: FINANCIAL INTELLIGENCE (ADMIN ONLY — Hidden for SEO)       */}
      {/* ==================================================================== */}
      {isAdmin && financials && activeTab === "revenue" && (
        <div className="space-y-8">
          {/* 5 FINANCIAL KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Net Realized Revenue */}
            <div className="bg-[#141419] border border-[#d4af37]/40 rounded-2xl p-5 shadow-md relative overflow-hidden bg-gradient-to-br from-[#1a1820] to-[#141419]">
              <div className="flex items-center justify-between text-[#e5c158] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Net Realized Revenue
                </span>
                <DollarSign className="w-4 h-4 text-[#e5c158]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#e5c158] font-mono tabular-nums">
                ${financials.netRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#a1a1aa] mt-1.5">
                Gross sales minus cancellations
              </p>
            </div>

            {/* Card 2: Gross Cake Revenue */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Gross Cake Sales
                </span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                ${financials.grossRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#71717a] mt-1.5">
                Total value of placed orders
              </p>
            </div>

            {/* Card 3: Cancelled Revenue Loss */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Cancelled Revenue
                </span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
                -${financials.cancelledRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-rose-400/80 mt-1.5">
                Refunded / voided order value
              </p>
            </div>

            {/* Card 4: Total Cakes Sold */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Total Cakes Sold
                </span>
                <ShoppingBag className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {financials.totalBoughtCount}
              </div>
              <p className="text-[11px] text-[#71717a] mt-1.5">
                Gross units purchased
              </p>
            </div>

            {/* Card 5: Cancelled Orders Count */}
            <div className="bg-[#141419] border border-[#252530] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#a1a1aa] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Cancelled Orders
                </span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
                {financials.totalCancelledCount}
              </div>
              <p className="text-[11px] text-[#71717a] mt-1.5">
                Total voided transactions
              </p>
            </div>
          </div>

          {/* PER-CAKE BREAKDOWN TABLE */}
          <div className="bg-[#141419] border border-[#252530] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#e5c158]" />
                  Per-Cake Sales Performance & Revenue Realization
                </h2>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  Detailed breakdown of bought quantities, cancellations, and net revenue per catalog cake
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2c2c38] text-[#71717a]">
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Cake Product</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-center">Bought</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-center">Cancelled</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-center">Net Active</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-right">Net Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202a]">
                  {financials.perCake.map((item) => {
                    const netActive = item.boughtCount - item.cancelledCount;
                    return (
                      <tr key={item.cakeId} className="hover:bg-[#191922] transition-colors">
                        <td className="py-3.5">
                          <div className="font-semibold text-white">{item.cakeName}</div>
                          <div className="text-[10px] font-mono text-[#71717a]">{item.cakeId}</div>
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-emerald-400">
                          {item.boughtCount}
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-rose-400">
                          {item.cancelledCount}
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-white">
                          {netActive}
                        </td>
                        <td className="py-3.5 text-right font-mono font-extrabold text-[#e5c158] text-sm tabular-nums">
                          ${item.netRevenue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#2c2c38] font-bold text-white">
                    <td className="pt-4 font-semibold uppercase tracking-wider text-[11px]">
                      Catalog Grand Total
                    </td>
                    <td className="pt-4 text-center font-mono text-emerald-400">
                      {financials.totalBoughtCount}
                    </td>
                    <td className="pt-4 text-center font-mono text-rose-400">
                      {financials.totalCancelledCount}
                    </td>
                    <td className="pt-4 text-center font-mono text-white">
                      {financials.totalBoughtCount - financials.totalCancelledCount}
                    </td>
                    <td className="pt-4 text-right font-mono text-[#e5c158] text-base tabular-nums">
                      ${financials.netRevenue.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION C: ORDER MANAGEMENT & CANCELLATIONS (ADMIN ONLY)             */}
      {/* ==================================================================== */}
      {isAdmin && activeTab === "orders" && (
        <div className="bg-[#141419] border border-[#252530] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Live Customer Orders & Cancellation Terminal
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Review and actively cancel customer orders via authenticated PATCH /api/admin/orders/[id]
              </p>
            </div>
            <div className="text-xs font-mono text-[#a1a1aa]">
              {orders.length} Total Orders Recorded
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2c2c38] text-[#71717a]">
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Order ID</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Cake</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-center">Qty</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-right">Total Price</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-center">Status</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20202a]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#71717a]">
                      No orders found in the database.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const total = o.price * o.quantity;
                    const isCancelled = o.status === "CANCELLED";
                    return (
                      <tr key={o.id} className="hover:bg-[#191922] transition-colors">
                        <td className="py-3.5 font-mono text-[11px] text-[#71717a]">
                          {o.id.length > 16 ? `${o.id.slice(0, 14)}...` : o.id}
                        </td>
                        <td className="py-3.5 font-semibold text-white">
                          {o.cakeName}
                        </td>
                        <td className="py-3.5">
                          <div className="text-white font-medium">{o.customerName}</div>
                          <div className="text-[10px] font-mono text-[#71717a]">{o.customerEmail}</div>
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-white">
                          {o.quantity}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-[#e5c158] tabular-nums">
                          ${total.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-center">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34161b] text-rose-400 border border-rose-800/40">
                              <XCircle className="w-3 h-3" /> CANCELLED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14291f] text-emerald-400 border border-emerald-800/40">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          {!isCancelled ? (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(o.id)}
                              disabled={cancellingId === o.id}
                              className="px-3 py-1 text-[11px] font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {cancellingId === o.id ? "Cancelling..." : "Cancel Order"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#52525b] italic font-mono">
                              Voided
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
    </div>
  );
}
