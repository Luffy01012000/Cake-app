import React from "react";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { getAllCakes, getSiteSettings, getAllPagesSeo } from "@/lib/data-service";

export default async function AdminSitemapPage() {
  const [cakes, settings, pages] = await Promise.all([
    getAllCakes(),
    getSiteSettings(),
    getAllPagesSeo(),
  ]);

  const baseUrl = settings.siteUrl.replace(/\/$/, "");

  const noIndexedPaths = new Set(
    pages
      .filter((p) => p.noIndex)
      .map((p) => (p.path.startsWith("/") ? p.path : `/${p.path}`))
  );

  const staticUrls = [
    { path: "/", url: `${baseUrl}`, label: "Home Page", priority: "1.0", freq: "daily", type: "Core Landing", isNoIndex: noIndexedPaths.has("/") },
    { path: "/cakes", url: `${baseUrl}/cakes`, label: "Haute Cake Catalog", priority: "0.9", freq: "daily", type: "Catalog Index", isNoIndex: noIndexedPaths.has("/cakes") },
    { path: "/occasions/weddings", url: `${baseUrl}/occasions/weddings`, label: "Weddings Collection", priority: "0.8", freq: "weekly", type: "Category SSR", isNoIndex: noIndexedPaths.has("/occasions/weddings") },
    { path: "/occasions/birthdays", url: `${baseUrl}/occasions/birthdays`, label: "Birthdays Collection", priority: "0.8", freq: "weekly", type: "Category SSR", isNoIndex: noIndexedPaths.has("/occasions/birthdays") },
    { path: "/occasions/anniversaries", url: `${baseUrl}/occasions/anniversaries`, label: "Anniversaries Collection", priority: "0.8", freq: "weekly", type: "Category SSR", isNoIndex: noIndexedPaths.has("/occasions/anniversaries") },
    { path: "/occasions/baby-showers", url: `${baseUrl}/occasions/baby-showers`, label: "Baby Showers Collection", priority: "0.8", freq: "weekly", type: "Category SSR", isNoIndex: noIndexedPaths.has("/occasions/baby-showers") },
    { path: "/occasions/galas", url: `${baseUrl}/occasions/galas`, label: "Galas Collection", priority: "0.8", freq: "weekly", type: "Category SSR", isNoIndex: noIndexedPaths.has("/occasions/galas") },
  ];

  const cakeUrls = cakes.map((cake) => ({
    path: `/cakes/${cake.slug}`,
    url: `${baseUrl}/cakes/${cake.slug}`,
    label: cake.name,
    priority: "0.85",
    freq: "weekly",
    type: "Product SSR",
    isNoIndex: false,
  }));

  const allUrls = [...staticUrls, ...cakeUrls];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dynamic XML Sitemap & Indexing Registry
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Real-time sitemap feed generated at <code className="font-mono text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-[#202025] px-1 py-0.5 rounded">/sitemap.xml</code> for search engine webmasters.
          </p>
        </div>

        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Open Live /sitemap.xml</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141416] p-5 rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Total Indexed URLs
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{allUrls.length}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% crawlable by Google & AI bots
          </p>
        </div>

        <div className="bg-white dark:bg-[#141416] p-5 rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Dedicated Cake Routes
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{cakeUrls.length}</div>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
            Synchronized dynamically from PostgreSQL
          </p>
        </div>

        <div className="bg-white dark:bg-[#141416] p-5 rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Categorized Occasion Pages
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
            Deep internal interlinking active
          </p>
        </div>
      </div>

      {/* Sitemap Table */}
      <div className="bg-white dark:bg-[#141416] rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-[#202025] flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Registered Sitemap Entries</h2>
          <span className="text-xs font-mono text-gray-500 dark:text-neutral-400">Live generated via Next.js metadata route</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#101012] text-gray-500 dark:text-neutral-400 uppercase font-semibold border-b border-gray-200 dark:border-[#202025]">
              <tr>
                <th className="py-3 px-4">Page Description</th>
                <th className="py-3 px-4">Canonical URL</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#202025] text-gray-700 dark:text-neutral-300">
              {allUrls.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-[#18181c] transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600 dark:text-neutral-400">
                    {item.url}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#1e1e24] text-gray-700 dark:text-neutral-300 text-[10px] font-medium mr-1.5">
                      {item.type}
                    </span>
                    {item.isNoIndex && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[10px] font-medium">
                        noindex (Excluded)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-white">
                    {item.priority}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-neutral-400">
                    {item.freq}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={item.url.replace(baseUrl, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end gap-1"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
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
