"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Globe,
  Sparkles,
} from "lucide-react";
import { CustomSitemapEntry } from "@/lib/data-service";
import posthog from "posthog-js";

interface SitemapItemDisplay {
  label: string;
  url: string;
  type: string;
  priority: string | number;
  freq: string;
  isNoIndex?: boolean;
}

interface SitemapManagerProps {
  initialCustomEntries: CustomSitemapEntry[];
  staticAndCakeUrls: SitemapItemDisplay[];
  baseUrl: string;
}

export default function SitemapManager({
  initialCustomEntries,
  staticAndCakeUrls,
  baseUrl,
}: SitemapManagerProps) {
  const [customEntries, setCustomEntries] = useState<CustomSitemapEntry[]>(
    initialCustomEntries
  );
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAddEntry = () => {
    setCustomEntries((prev) => [
      ...prev,
      {
        path: "/new-page",
        priority: 0.8,
        changeFrequency: "weekly",
        enabled: true,
      },
    ]);
  };

  const handleRemoveEntry = (index: number) => {
    setCustomEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEntry = <K extends keyof CustomSitemapEntry>(
    index: number,
    field: K,
    value: CustomSitemapEntry[K]
  ) => {
    setCustomEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/sitemap", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: customEntries }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save sitemap.");
      }

      posthog.capture("sitemap_saved", {
        custom_entry_count: customEntries.length,
        enabled_custom_entry_count: customEntries.filter((entry) => entry.enabled && entry.path).length,
      });
      setStatusMessage({
        type: "success",
        text: "Custom sitemap URLs updated and /sitemap.xml revalidated!",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      setStatusMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const totalIndexed =
    staticAndCakeUrls.length +
    customEntries.filter((e) => e.enabled && e.path).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dynamic XML Sitemap & Indexing Registry
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Real-time feed at{" "}
            <code className="font-mono text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-[#202025] px-1 py-0.5 rounded">
              /sitemap.xml
            </code>
            . Add and update custom paths below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 dark:bg-[#202025] hover:bg-gray-200 dark:hover:bg-[#2a2a32] text-gray-800 dark:text-neutral-200 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Preview Live /sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save & Deploy Sitemap</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141416] p-5 rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Total Live Sitemap URLs
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalIndexed}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% crawlable by Google & AI bots
          </p>
        </div>

        <div className="bg-white dark:bg-[#141416] p-5 rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Custom Configured Routes
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {customEntries.length}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
            User-managed sitemap directives
          </p>
        </div>

        <div className="bg-white dark:bg-[#141416] p-5 rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Automatic Catalog & SSR Routes
          </span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {staticAndCakeUrls.length}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
            Synchronized dynamically from database
          </p>
        </div>
      </div>

      {/* Custom Sitemap Editor */}
      <div className="bg-white dark:bg-[#141416] rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-[#202025] pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0071e3]" />
              <span>Custom Sitemap Entries</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Add custom landing pages, marketing URLs, or external routes to include directly in /sitemap.xml.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddEntry}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#0071e3] dark:text-[#2997ff] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom URL</span>
          </button>
        </div>

        {customEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 dark:text-neutral-400">
            No custom entries defined yet. Click &quot;Add Custom URL&quot; above to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {customEntries.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 dark:bg-[#1a1a1e] rounded-xl border border-gray-200/80 dark:border-[#282830] flex flex-col md:flex-row items-stretch md:items-center gap-3"
              >
                {/* Active Toggle */}
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={entry.enabled}
                    onChange={(e) =>
                      handleUpdateEntry(idx, "enabled", e.target.checked)
                    }
                    className="rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3] w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-neutral-300">
                    Active
                  </span>
                </label>

                {/* Path input */}
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                    Path or Route (e.g. /custom-offer)
                  </label>
                  <input
                    type="text"
                    value={entry.path}
                    onChange={(e) =>
                      handleUpdateEntry(idx, "path", e.target.value)
                    }
                    placeholder="/my-page"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#121215] border border-gray-200 dark:border-[#282830] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                {/* Priority */}
                <div className="w-28 shrink-0">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                    Priority (0.0-1.0)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={entry.priority}
                    onChange={(e) =>
                      handleUpdateEntry(
                        idx,
                        "priority",
                        parseFloat(e.target.value) || 0.5
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#121215] border border-gray-200 dark:border-[#282830] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                {/* Change Frequency */}
                <div className="w-36 shrink-0">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                    Change Frequency
                  </label>
                  <select
                    value={entry.changeFrequency}
                    onChange={(e) =>
                      handleUpdateEntry(
                        idx,
                        "changeFrequency",
                        e.target.value as CustomSitemapEntry["changeFrequency"]
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#121215] border border-gray-200 dark:border-[#282830] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="always">always</option>
                    <option value="hourly">hourly</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                    <option value="never">never</option>
                  </select>
                </div>

                {/* Delete button */}
                <div className="flex items-end justify-end self-end md:self-auto pt-2 md:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Remove Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Index Table */}
      <div className="bg-white dark:bg-[#141416] rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-[#202025] flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Live Registered Sitemap Entries
          </h2>
          <span className="text-xs font-mono text-gray-500 dark:text-neutral-400">
            Next.js /sitemap.xml output
          </span>
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
              {/* Custom Entries */}
              {customEntries
                .filter((e) => e.enabled && e.path)
                .map((item, i) => (
                  <tr
                    key={`custom-${i}`}
                    className="bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>Custom: {item.path}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 dark:text-neutral-400">
                      {baseUrl}
                      {item.path.startsWith("/") ? item.path : `/${item.path}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-medium">
                        Custom Managed
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-white">
                      {item.priority}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-neutral-400">
                      {item.changeFrequency}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={item.path.startsWith("/") ? item.path : `/${item.path}`}
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

              {/* Static & Cake Entries */}
              {staticAndCakeUrls.map((item, i) => (
                <tr
                  key={`std-${i}`}
                  className="hover:bg-gray-50/50 dark:hover:bg-[#18181c] transition-colors"
                >
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
