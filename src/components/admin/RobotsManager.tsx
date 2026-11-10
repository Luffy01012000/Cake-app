"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  FileCode,
} from "lucide-react";
import { formatRobotsTxt, RobotsConfigData } from "@/lib/robots-utils";

interface RobotsManagerProps {
  initialConfig: RobotsConfigData;
  siteUrl: string;
}

export default function RobotsManager({
  initialConfig,
  siteUrl,
}: RobotsManagerProps) {
  const [config, setConfig] = useState<RobotsConfigData>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const preview = formatRobotsTxt(config, siteUrl);

  // Keyboard shortcut: Ctrl+S or Cmd+S to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const formEl = document.getElementById("robots-editor-form") as HTMLFormElement | null;
        if (formEl) {
          formEl.requestSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = (key: keyof RobotsConfigData) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/robots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }

      setStatusMessage({
        type: "success",
        text: "Dynamic robots.txt directives and AI crawler permissions updated!",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      setStatusMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aiBots = [
    {
      key: "gptBotAllowed" as const,
      name: "OpenAI GPTBot",
      desc: "Allows ChatGPT, OpenAI Search, and Apple Intelligence retrieval models to crawl cake catalog pages.",
      botAgent: "GPTBot",
    },
    {
      key: "perplexityBotAllowed" as const,
      name: "Perplexity AI PerplexityBot",
      desc: "Permits Perplexity Search to index cake specifications and surface AURA in conversational answers.",
      botAgent: "PerplexityBot",
    },
    {
      key: "claudeBotAllowed" as const,
      name: "Anthropic ClaudeBot",
      desc: "Enables Claude 3.5/4 retrieval-augmented generation and search indexing.",
      botAgent: "ClaudeBot, anthropic-ai",
    },
    {
      key: "googleExtendedAllowed" as const,
      name: "Google Gemini / Google-Extended",
      desc: "Governs access for Google Gemini search grounding and Generative AI Overviews.",
      botAgent: "Google-Extended",
    },
    {
      key: "ccBotAllowed" as const,
      name: "Common Crawl CCBot",
      desc: "Supplies crawl data to the open-web Common Crawl archive used by academic and AI teams.",
      botAgent: "CCBot",
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f5f5f7] tracking-tight">
            Dynamic Robots.txt & AI Crawler Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Empower search engines and conversational AI agents (GPT, Perplexity, Claude, Gemini) to discover your cakes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f1f24] dark:hover:bg-[#282830] text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Live /robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="submit"
            form="robots-editor-form"
            disabled={saving}
            className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Deploy & Save /robots.txt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form id="robots-editor-form" onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Toggles and Rules (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Crawlers Card */}
            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-[#202025] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202025] pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-[#f5f5f7] uppercase tracking-wider">
                    AI & LLM Crawler Permissions
                  </h2>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  {Object.values(config).filter((v) => v === true).length} Allowed
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-[#202025]">
                {aiBots.map((bot) => {
                  const isAllowed = Boolean(config[bot.key]);
                  return (
                    <div
                      key={bot.key}
                      className="py-4 flex items-start justify-between gap-4 first:pt-2 last:pb-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900 dark:text-[#f5f5f7]">
                            {bot.name}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#1f1f24] text-gray-600 dark:text-gray-400 font-mono text-[10px] rounded">
                            {bot.botAgent}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {bot.desc}
                        </p>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggle(bot.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isAllowed ? "bg-emerald-600" : "bg-gray-200 dark:bg-[#2c2c34]"
                        }`}
                        role="switch"
                        aria-checked={isAllowed}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isAllowed ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Directives Card */}
            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-[#202025] rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-[#f5f5f7] border-b border-gray-100 dark:border-[#202025] pb-2 uppercase tracking-wider">
                Custom Crawl Rules & Directives
              </h2>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Additional Rules (Appended to robots.txt)
                </label>
                <textarea
                  rows={5}
                  value={config.customRules || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, customRules: e.target.value }))
                  }
                  placeholder={`User-agent: Bingbot\nAllow: /\n\nUser-agent: Yandex\nDisallow: /admin`}
                  className="w-full p-3 font-mono text-xs bg-white dark:bg-[#18181c] border border-gray-300 dark:border-[#2a2a32] text-gray-900 dark:text-[#f5f5f7] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Dynamic Sitemap Directive
                </label>
                <input
                  type="text"
                  value={config.sitemapUrl || "/sitemap.xml"}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, sitemapUrl: e.target.value }))
                  }
                  placeholder="/sitemap.xml"
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#18181c] border border-gray-300 dark:border-[#2a2a32] text-gray-900 dark:text-[#f5f5f7] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Output Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-[#202025] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202025] pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-[#f5f5f7]">
                    Live RFC 9309 Output Preview
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f1f24] dark:hover:bg-[#282830] text-gray-700 dark:text-gray-300 rounded text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-gray-950 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto max-h-[460px] leading-relaxed border border-gray-800">
                  <code>{preview}</code>
                </pre>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deploying Rules...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Deploy to Live /robots.txt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Floating Action Bar */}
        <div className="sticky bottom-4 z-30 bg-white/95 dark:bg-[#141416]/95 backdrop-blur-md border border-gray-200 dark:border-[#25252b] rounded-2xl p-4 shadow-xl dark:shadow-2xl dark:shadow-black/70 flex flex-wrap items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Robots.txt & AI Crawler Permissions
              <span className="hidden sm:inline text-gray-400 dark:text-gray-500 ml-2 font-mono">
                (⌘S / Ctrl+S to deploy)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f1f24] dark:hover:bg-[#282830] text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview Live /robots.txt</span>
            </a>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying Rules...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Deploy & Update /robots.txt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
