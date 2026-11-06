"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import CharacterCounter from "./CharacterCounter";
import GoogleSerpPreview from "./GoogleSerpPreview";
import FaqRepeater, { FaqItem } from "./FaqRepeater";
import JsonLdPreview from "./JsonLdPreview";
import { SeedPageSeo } from "@/lib/seed-data";

interface PagesSeoManagerProps {
  initialPages: SeedPageSeo[];
}

export default function PagesSeoManager({ initialPages }: PagesSeoManagerProps) {
  const router = useRouter();
  const [pages, setPages] = useState<SeedPageSeo[]>(initialPages);
  const [selectedPath, setSelectedPath] = useState<string>(initialPages[0]?.path || "/");

  const currentPage = pages.find((p) => p.path === selectedPath) || initialPages[0];

  const [title, setTitle] = useState(currentPage?.title || "");
  const [metaDescription, setMetaDescription] = useState(currentPage?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(currentPage?.canonicalUrl || "");
  const [ogImage, setOgImage] = useState(currentPage?.ogImage || "");
  const [noIndex, setNoIndex] = useState(Boolean(currentPage?.noIndex));
  const [faqs, setFaqs] = useState<FaqItem[]>(currentPage?.faqs || []);
  const [rawJsonLd, setRawJsonLd] = useState(currentPage?.rawJsonLd || "");

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSelectPage = (path: string) => {
    setSelectedPath(path);
    const target = pages.find((p) => p.path === path);
    if (target) {
      setTitle(target.title);
      setMetaDescription(target.metaDescription);
      setCanonicalUrl(target.canonicalUrl || "");
      setOgImage(target.ogImage || "");
      setNoIndex(Boolean(target.noIndex));
      setFaqs(target.faqs || []);
      setRawJsonLd(target.rawJsonLd || "");
      setStatusMessage(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload: SeedPageSeo = {
      path: selectedPath,
      title,
      metaDescription,
      canonicalUrl: canonicalUrl || undefined,
      ogImage: ogImage || undefined,
      noIndex,
      faqs,
      rawJsonLd: rawJsonLd || undefined,
    };

    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }

      setPages((prev) =>
        prev.map((p) => (p.path === selectedPath ? data.page : p))
      );
      setStatusMessage({ type: "success", text: `SEO for "${selectedPath}" saved successfully!` });
      setTimeout(() => setStatusMessage(null), 4000);
      router.refresh();
    } catch (err: unknown) {
      setStatusMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Static Pages SEO & Structured Data
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure metadata, Google SERP titles, FAQs, and JSON-LD overrides for key landing pages.
          </p>
        </div>

        <Link
          href={selectedPath}
          target="_blank"
          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span>View Live Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Page Switcher Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-200">
        {pages.map((p) => (
          <button
            key={p.path}
            type="button"
            onClick={() => handleSelectPage(p.path)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPath === p.path
                ? "bg-[#1d1d1f] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{p.path === "/" ? "Home (/)" : p.path}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields & FAQs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Metadata for {selectedPath}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noIndex}
                      onChange={(e) => setNoIndex(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>noindex (Block Google)</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Page Title (SERP)
                  </label>
                  <CharacterCounter
                    current={title.length}
                    minRecommended={45}
                    maxRecommended={60}
                  />
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Meta Description
                  </label>
                  <CharacterCounter
                    current={metaDescription.length}
                    minRecommended={120}
                    maxRecommended={160}
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              {/* Canonical URL & OG Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Canonical URL Override
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://aurapatisserie.com"
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    OpenGraph Image URL
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="/images/wedding_cake.jpg"
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Page FAQ Repeater */}
            <FaqRepeater
              faqs={faqs}
              onChange={setFaqs}
              title={`Page FAQs for ${selectedPath}`}
            />
          </div>

          {/* Right Column: SERP Preview & JSON-LD (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <GoogleSerpPreview
              title={title}
              description={metaDescription}
              urlPath={selectedPath === "/" ? "" : selectedPath.slice(1)}
            />

            <JsonLdPreview
              autoGeneratedJson={{
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: title,
                description: metaDescription,
                url: `https://aurapatisserie.com${selectedPath}`,
              }}
              rawOverride={rawJsonLd}
              onOverrideChange={setRawJsonLd}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save {selectedPath} SEO Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
