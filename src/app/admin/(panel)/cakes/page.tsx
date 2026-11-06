import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { getAllCakes } from "@/lib/data-service";
import { analyzeSeo } from "@/lib/seo-utils";

export default async function AdminCakesListPage() {
  const cakes = await getAllCakes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Cake Portfolio & SEO Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage individual cake pages, customized structured data, alt tags, and search engine SERP snippets.
          </p>
        </div>

        <Link
          href="/admin/cakes/new"
          className="px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Cake
        </Link>
      </div>

      {/* Cakes Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Visual & Name</th>
                <th className="py-3.5 px-4">Occasion</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">SERP Title</th>
                <th className="py-3.5 px-4">Meta Desc</th>
                <th className="py-3.5 px-4">Alt Text</th>
                <th className="py-3.5 px-4">JSON-LD</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {cakes.map((cake) => {
                const analysis = analyzeSeo(
                  cake.metaTitle,
                  cake.metaDescription,
                  cake.imageAlt
                );
                return (
                  <tr key={cake.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Visual & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image
                            src={cake.image}
                            alt={cake.imageAlt || cake.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/admin/cakes/${cake.id}`}
                            className="font-semibold text-gray-900 hover:text-[#0071e3] transition-colors"
                          >
                            {cake.name}
                          </Link>
                          <div className="text-[11px] text-gray-400 font-mono">
                            /cakes/{cake.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Occasion */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                        {cake.occasion}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      ${cake.price}
                    </td>

                    {/* SERP Title */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          analysis.titleStatus === "good"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {analysis.titleLength} chars
                      </span>
                    </td>

                    {/* Meta Desc */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          analysis.descriptionStatus === "good"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {analysis.descriptionLength} chars
                      </span>
                    </td>

                    {/* Alt Text */}
                    <td className="py-3.5 px-4">
                      {analysis.hasAltText ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Set
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Missing
                        </span>
                      )}
                    </td>

                    {/* JSON-LD */}
                    <td className="py-3.5 px-4">
                      {cake.rawJsonLd && cake.rawJsonLd.trim() ? (
                        <span className="text-blue-600 font-medium">Override</span>
                      ) : (
                        <span className="text-emerald-600">Auto</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/cakes/${cake.slug}`}
                          target="_blank"
                          className="p-1 text-gray-400 hover:text-gray-700"
                          title="Open Live Public Route"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/cakes/${cake.id}`}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
