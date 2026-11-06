"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link2,
} from "lucide-react";
import CharacterCounter from "./CharacterCounter";
import GoogleSerpPreview from "./GoogleSerpPreview";
import ImageUploader from "./ImageUploader";
import FaqRepeater, { FaqItem } from "./FaqRepeater";
import JsonLdPreview from "./JsonLdPreview";
import {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from "@/lib/seo-utils";
import { CakeWithFaqs } from "@/lib/data-service";

interface CakeFormProps {
  initialCake?: Partial<CakeWithFaqs>;
  isNew?: boolean;
  userRole?: "ADMIN" | "SEO_SPECIALIST";
}

export default function CakeForm({
  initialCake,
  isNew = false,
  userRole = "ADMIN",
}: CakeFormProps) {
  const router = useRouter();

  // Basic Details
  const [name, setName] = useState(initialCake?.name || "");
  const [slug, setSlug] = useState(initialCake?.slug || "");
  const [isSlugLocked, setIsSlugLocked] = useState(!isNew);
  const [tagline, setTagline] = useState(initialCake?.tagline || "");
  const [occasion, setOccasion] = useState(initialCake?.occasion || "Weddings");
  const [price, setPrice] = useState(initialCake?.price?.toString() || "250");
  const [servings, setServings] = useState(initialCake?.servings || "20–25 guests");
  const [tiers, setTiers] = useState(initialCake?.tiers?.toString() || "2");
  const [isNewRelease, setIsNewRelease] = useState(Boolean(initialCake?.isNew));
  const [dimensions, setDimensions] = useState(initialCake?.dimensions || "8\" base — 12\" height");
  const [leadTime, setLeadTime] = useState(initialCake?.leadTime || "48 hours");
  const [finishColor, setFinishColor] = useState(initialCake?.finishColor || "#f0e4d3");
  const [swatchName, setSwatchName] = useState(initialCake?.swatchName || "Ivory Velvet");
  const [flavorsText, setFlavorsText] = useState(
    initialCake?.flavors?.join(", ") || "Tahitian Vanilla, Champagne Rosé"
  );
  const [tastingNotesText, setTastingNotesText] = useState(
    initialCake?.tastingNotes?.join(", ") || "Floral Madagascar vanilla, Crisp citrus"
  );
  const [description, setDescription] = useState(initialCake?.description || "");

  // Image & SEO Media
  const [image, setImage] = useState(initialCake?.image || "/images/wedding_cake.jpg");
  const [imageAlt, setImageAlt] = useState(initialCake?.imageAlt || "");
  const [imageCaption, setImageCaption] = useState(initialCake?.imageCaption || "");

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState(initialCake?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialCake?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialCake?.canonicalUrl || "");
  const [ogImage, setOgImage] = useState(initialCake?.ogImage || "");

  // FAQs
  const [faqs, setFaqs] = useState<FaqItem[]>(initialCake?.faqs || []);

  // Raw JSON-LD Override
  const [rawJsonLd, setRawJsonLd] = useState(initialCake?.rawJsonLd || "");

  // Submission States
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-generate slug when name changes if slug is not locked
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugLocked) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  // Generate synthetic structured data for live preview
  const flavorsArray = flavorsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const tastingNotesArray = tastingNotesText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const previewCakeObj = {
    id: initialCake?.id || slug,
    slug: slug || "cake-preview",
    name: name || "Cake Preview",
    tagline: tagline || "",
    occasion,
    price: Number(price) || 0,
    image: image || "/images/wedding_cake.jpg",
    imageAlt,
    servings,
    tiers: Number(tiers) || 1,
    flavors: flavorsArray,
    description: description || tagline,
    dimensions,
    leadTime,
  };

  const autoProductJson = generateProductJsonLd(previewCakeObj, "https://aurapatisserie.com");
  const autoBreadcrumbJson = generateBreadcrumbJsonLd(
    [
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/cakes" },
      { name: occasion, url: `/occasions/${occasion.toLowerCase().replace(/\s+/g, "-")}` },
      { name: name || "Cake", url: `/cakes/${slug}` },
    ],
    "https://aurapatisserie.com"
  );
  const autoFaqJson = generateFaqJsonLd(faqs);

  const combinedAutoJsonLd = [
    autoProductJson,
    autoBreadcrumbJson,
    ...(autoFaqJson ? [autoFaqJson] : []),
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload = {
      id: initialCake?.id || slug,
      slug,
      name,
      tagline,
      occasion,
      price: Number(price),
      servings,
      tiers: Number(tiers),
      isNew: isNewRelease,
      dimensions,
      leadTime,
      finishColor,
      swatchName,
      flavors: flavorsArray,
      tastingNotes: tastingNotesArray,
      description,
      image,
      imageAlt,
      imageCaption,
      metaTitle,
      metaDescription,
      canonicalUrl: canonicalUrl || undefined,
      ogImage: ogImage || image,
      rawJsonLd: rawJsonLd || undefined,
      faqs,
    };

    try {
      const url = isNew ? "/api/admin/cakes" : `/api/admin/cakes/${initialCake?.id || slug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }

      setStatusMessage({ type: "success", text: "Cake and SEO metadata updated successfully!" });
      setTimeout(() => setStatusMessage(null), 4000);

      if (isNew) {
        router.push(`/admin/cakes/${data.cake.slug}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setStatusMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cakes/${initialCake?.id || slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed.");
      router.push("/admin/cakes");
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-[1100px]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cakes"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isNew ? "Create Architectural Cake" : `Edit: ${name || "Cake"}`}
            </h1>
            <p className="text-xs text-gray-500">
              Full SEO suite, SERP preview, JSON-LD generator, and media optimization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && slug && (
            <Link
              href={`/cakes/${slug}`}
              target="_blank"
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <span>View SSR Route</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {!isNew && (
            userRole === "ADMIN" ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Cake"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <span
                className="p-2 text-gray-300 rounded-xl cursor-not-allowed"
                title="Admin role required to delete cakes"
              >
                <Trash2 className="w-4 h-4" />
              </span>
            )
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save & Publish
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
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

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Basic Details & Media (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Basic Cake Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
              1. Cake Specifications & Identity
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Cake Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. The Elysian Grand Tier"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              {/* URL Slug with Lock Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    URL Slug (SSR Route: /cakes/[slug]) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSlugLocked(!isSlugLocked)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    {isSlugLocked ? "Unlock Slug" : "Lock Slug"}
                  </button>
                </div>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-gray-100 px-3 py-2 text-xs text-gray-500 border-r border-gray-300 font-mono select-none">
                    /cakes/
                  </span>
                  <input
                    type="text"
                    required
                    readOnly={isSlugLocked}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="elysian-wedding-tier"
                    className={`w-full px-3 py-2 text-sm font-mono outline-none ${
                      isSlugLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Tagline (Concise Punchline)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Architectural purity crafted for eternal vows."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Occasion & Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Occasion Category *
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as CakeWithFaqs["occasion"])}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Weddings">Weddings</option>
                    <option value="Birthdays">Birthdays</option>
                    <option value="Anniversaries">Anniversaries</option>
                    <option value="Baby Showers">Baby Showers</option>
                    <option value="Galas">Galas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewRelease}
                    onChange={(e) => setIsNewRelease(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">Highlight with &ldquo;New Haute Release&rdquo; badge on catalog</span>
                </label>
              </div>

              {/* Servings, Tiers, Lead Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Servings
                  </label>
                  <input
                    type="text"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="65–80 guests"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Tiers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={tiers}
                    onChange={(e) => setTiers(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Lead Time
                  </label>
                  <input
                    type="text"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                    placeholder="7 days minimum"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Dimensions & Color Finish */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="10&quot; base, 8&quot; tier — 24&quot; height"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Finish Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={finishColor}
                        onChange={(e) => setFinishColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={finishColor}
                        onChange={(e) => setFinishColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Swatch Name
                    </label>
                    <input
                      type="text"
                      value={swatchName}
                      onChange={(e) => setSwatchName(e.target.value)}
                      placeholder="Starlight Ivory"
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Flavors & Tasting Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Flavor Combinations (Comma-separated)
                </label>
                <input
                  type="text"
                  value={flavorsText}
                  onChange={(e) => setFlavorsText(e.target.value)}
                  placeholder="Tahitian Vanilla, Champagne Strawberry Ganache, French Buttercream"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Sommelier Tasting Notes (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tastingNotesText}
                  onChange={(e) => setTastingNotesText(e.target.value)}
                  placeholder="Floral Madagascar vanilla, Sparkling rosé champagne notes, Velvety whipped ganache"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Architectural Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of culinary craftsmanship, finish, and floral sculpting..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card: Image Upload & SEO Media */}
          <ImageUploader
            imageUrl={image}
            imageAlt={imageAlt}
            imageCaption={imageCaption}
            onUrlChange={setImage}
            onAltChange={setImageAlt}
            onCaptionChange={setImageCaption}
          />

          {/* Card: FAQ Repeater (Auto-synced to FAQPage Schema) */}
          <FaqRepeater
            faqs={faqs}
            onChange={setFaqs}
            title="Cake Frequently Asked Questions"
          />
        </div>

        {/* Right Column: SEO Suite, Live SERP Preview, JSON-LD (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Live Google SERP Snippet Preview */}
          <GoogleSerpPreview
            title={metaTitle || `${name} | Architectural Luxury Cake | AURA`}
            description={
              metaDescription || tagline || description.slice(0, 160)
            }
            urlPath={`cakes/${slug}`}
          />

          {/* Card: SEO Meta Fields Visual Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              SEO Meta Tags Visual Editor
            </h2>

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Meta Title (SERP Display)
                </label>
                <CharacterCounter
                  current={metaTitle.length}
                  minRecommended={45}
                  maxRecommended={60}
                />
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={`${name || "Cake"} | Architectural Luxury Cake | AURA`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Primary headline shown in search results and social cards.
              </p>
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
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Include target keywords, servings, flavors, and white-glove delivery details..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Search engines often display this snippet under your link.
              </p>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Canonical URL Override (Optional)
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={`https://aurapatisserie.com/cakes/${slug || "slug"}`}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* OpenGraph Image URL */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                OpenGraph Share Image URL (Defaults to Cake Image)
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder={image}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Card: Structured Data & Raw JSON-LD Override */}
          <JsonLdPreview
            autoGeneratedJson={combinedAutoJsonLd}
            rawOverride={rawJsonLd}
            onOverrideChange={setRawJsonLd}
          />
        </div>
      </div>
    </form>
  );
}
