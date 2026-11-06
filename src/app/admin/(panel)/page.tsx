import React from "react";
import Link from "next/link";
import {
  Cake,
  HelpCircle,
  Bot,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Zap,
  BarChart3,
  DollarSign,
} from "lucide-react";
import {
  getAllCakes,
  getAllPagesSeo,
  getRobotsConfig,
  getDatabaseStatus,
  getVisitAnalytics,
  getCakeSalesMetrics,
} from "@/lib/data-service";
import { getSession } from "@/lib/auth";
import { analyzeSeo } from "@/lib/seo-utils";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  const [cakes, pages, robots, dbStatus, visits, financials] = await Promise.all([
    getAllCakes(),
    getAllPagesSeo(),
    getRobotsConfig(),
    getDatabaseStatus(),
    getVisitAnalytics(),
    isAdmin ? getCakeSalesMetrics() : Promise.resolve(null),
  ]);

  const totalFaqs =
    cakes.reduce((sum, c) => sum + (c.faqs?.length || 0), 0) +
    pages.reduce((sum, p) => sum + (p.faqs?.length || 0), 0);

  const analyzedCakes = cakes.map((cake) => {
    const analysis = analyzeSeo(cake.metaTitle, cake.metaDescription, cake.imageAlt);
    return { ...cake, analysis };
  });

  const avgSeoScore = Math.round(
    analyzedCakes.reduce((acc, c) => acc + c.analysis.overallScore, 0) /
      (analyzedCakes.length || 1)
  );

  const activeAiCrawlers = [
    robots.gptBotAllowed && "GPTBot (OpenAI)",
    robots.perplexityBotAllowed && "PerplexityBot (Perplexity)",
    robots.claudeBotAllowed && "ClaudeBot (Anthropic)",
    robots.googleExtendedAllowed && "Google-Extended (Gemini)",
    robots.ccBotAllowed && "CCBot (Common Crawl)",
  ].filter(Boolean) as string[];

  const totalTraffic = visits.totalVisits || 1;
  const userPercent = Math.round(((visits.normalUserVisits || 0) / totalTraffic) * 100);
  const botPercent = Math.round(((visits.botVisits || 0) / totalTraffic) * 100);

  return (
    <div className="space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isAdmin
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isAdmin ? "Admin Overview" : "SEO Specialist Overview"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            SEO, Content & Revenue Operations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage architectural cake pages, dynamic structured data, robots.txt AI crawlers, traffic, and sales performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-300 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Full Analytics
          </Link>
          <Link
            href="/admin/cakes/new"
            className="px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Cake
          </Link>
        </div>
      </div>

      {/* Analytics Summary Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card A: Traffic & Crawlers */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Audience Traffic Distribution
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {visits.totalVisits.toLocaleString()} Total Impressions
              </span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <div>
                <span className="text-2xl font-extrabold text-emerald-600">
                  {visits.normalUserVisits.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1.5 font-medium">
                  Normal Users ({userPercent}%)
                </span>
              </div>
              <span className="text-gray-300 text-lg">/</span>
              <div>
                <span className="text-2xl font-extrabold text-purple-600">
                  {visits.botVisits.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1.5 font-medium">
                  Bots & AI ({botPercent}%)
                </span>
              </div>
            </div>
            {/* Visual ratio bar */}
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex mt-3">
              <div style={{ width: `${userPercent}%` }} className="bg-emerald-500" />
              <div style={{ width: `${botPercent}%` }} className="bg-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Live crawler detection (Googlebot, GPTBot, Perplexity)
            </span>
            <Link
              href="/admin/analytics"
              className="text-[#0071e3] font-semibold hover:underline flex items-center gap-1"
            >
              Traffic Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card B: Revenue & Orders (Admin) or SEO Crawlers (SEO_SPECIALIST) */}
        {isAdmin && financials ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Realized Cake Revenue
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Admin Realtime
                </span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                ${financials.netRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span className="text-emerald-600 font-semibold">
                  {financials.totalBoughtCount} cakes bought
                </span>
                <span>•</span>
                <span className="text-rose-500 font-medium">
                  {financials.totalCancelledCount} orders cancelled (-${financials.cancelledRevenue.toLocaleString()})
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Gross sales: ${financials.grossRevenue.toLocaleString()}</span>
              <Link
                href="/admin/analytics"
                className="text-[#0071e3] font-semibold hover:underline flex items-center gap-1"
              >
                Manage Orders & Revenue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-600" /> Search & AI Bot Indexing
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {activeAiCrawlers.length} of 5 Bots Allowed
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                Dynamic Robots.txt & Schemas
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JSON-LD Product, BreadcrumbList, and FAQPage schemas active across all cake pages.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Governed via robots.txt</span>
              <Link
                href="/admin/robots"
                className="text-[#0071e3] font-semibold hover:underline flex items-center gap-1"
              >
                Configure Bot Directives <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cakes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Cake Inventory
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Cake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{cakes.length}</div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dedicated SSR routes active</span>
          </div>
        </div>

        {/* Card 2: Average SEO Health */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Catalog SEO Score
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgSeoScore}%</div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span>Titles, descriptions & alt text quality</span>
          </div>
        </div>

        {/* Card 3: Indexed FAQs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Indexed FAQs
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalFaqs}</div>
          <div className="mt-2 text-xs text-purple-600 flex items-center gap-1">
            <span>Synced to FAQPage Schema</span>
          </div>
        </div>

        {/* Card 4: AI Crawlers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              AI Crawlers Allowed
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeAiCrawlers.length} / 5</div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 truncate">
            <span>Dynamic robots.txt governed</span>
          </div>
        </div>
      </div>

      {/* Database Engine Status Banner */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
            }`}
          />
          <div>
            <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Database Connection:</span>
              <span className="text-[#0071e3]">{dbStatus.engine}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {dbStatus.connected
                ? "PostgreSQL connection active via Prisma ORM. Changes persist directly to the PostgreSQL database."
                : "Standby in-memory cache active. Ready to sync with PostgreSQL whenever DATABASE_URL is reachable."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 flex items-center gap-1 transition-colors"
          >
            <span>Test Sitemap.xml</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 flex items-center gap-1 transition-colors"
          >
            <span>Test Robots.txt</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
        </div>
      </div>

      {/* SEO Health Table of All Cakes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Cake Portfolio & SEO Diagnostic
            </h2>
            <p className="text-xs text-gray-500">
              Review Google SERP meta compliance, image alt tags, and FAQ count per cake.
            </p>
          </div>
          <Link
            href="/admin/cakes"
            className="text-xs text-[#0071e3] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View Full Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Cake Name & Slug</th>
                <th className="py-3 px-4">Occasion</th>
                <th className="py-3 px-4">Meta Title (SERP)</th>
                <th className="py-3 px-4">Meta Description</th>
                <th className="py-3 px-4">SEO Alt Text</th>
                <th className="py-3 px-4">FAQs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {analyzedCakes.map((cake) => (
                <tr key={cake.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">{cake.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">/cakes/{cake.slug}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                      {cake.occasion}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cake.analysis.titleStatus === "good"
                            ? "bg-emerald-500"
                            : cake.analysis.titleStatus === "short"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-mono text-gray-600">
                        {cake.analysis.titleLength} chars
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cake.analysis.descriptionStatus === "good"
                            ? "bg-emerald-500"
                            : cake.analysis.descriptionStatus === "short"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-mono text-gray-600">
                        {cake.analysis.descriptionLength} chars
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {cake.analysis.hasAltText ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Optimized
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Missing Alt
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {cake.faqs?.length || 0} FAQs
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/cakes/${cake.id}`}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors"
                    >
                      Edit SEO
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
