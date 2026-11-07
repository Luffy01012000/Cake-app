"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  onUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  onCaptionChange: (caption: string) => void;
}

export default function ImageUploader({
  imageUrl,
  imageAlt,
  imageCaption,
  onUrlChange,
  onAltChange,
  onCaptionChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUrlChange(data.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-[#202025] rounded-xl p-5 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202025] pb-3">
        <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Image Asset & SEO Optimization
        </h3>
        <span className="text-xs text-gray-500 dark:text-neutral-400">Local Uploads & Direct URLs</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Preview Panel */}
        <div className="md:col-span-5 space-y-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block uppercase tracking-wider">
            Image Preview
          </label>
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-50 dark:bg-[#101012] border border-gray-200 dark:border-[#282830] flex items-center justify-center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt || "Preview image"}
                fill
                sizes="300px"
                className="object-cover"
              />
            ) : (
              <div className="text-center p-4 text-gray-400 dark:text-neutral-500">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <span className="text-xs">No image provided</span>
              </div>
            )}
          </div>
          {imageCaption && (
            <p className="text-[11px] text-gray-500 dark:text-neutral-400 italic text-center">
              Caption: &ldquo;{imageCaption}&rdquo;
            </p>
          )}
        </div>

        {/* Form Controls */}
        <div className="md:col-span-7 space-y-4">
          {/* Image URL Input + Upload Button */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
              Image Source (Direct URL or Upload)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="/images/wedding_cake.jpg or https://..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 dark:placeholder-neutral-500"
                />
              </div>

              {/* Local File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-neutral-200 disabled:opacity-50 text-xs font-medium rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload File
                  </>
                )}
              </button>
            </div>

            {uploadError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>File uploaded to /public/uploads and linked successfully!</span>
              </div>
            )}
          </div>

          {/* Custom SEO Alt Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider">
                SEO Image Alt Text (Crucial for Google Image Search)
              </label>
              <span className={`text-[11px] ${imageAlt?.length > 10 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400 font-medium"}`}>
                {imageAlt?.length || 0} chars {imageAlt?.length < 10 && "(Too short)"}
              </span>
            </div>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="e.g. Architectural 3-tier ivory wedding cake with 24k gold leaf and sugar ranunculus flowers"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 dark:placeholder-neutral-500"
            />
            <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
              Describe the subject matter accurately for visual crawlers and screen readers. Include style, tiers, and materials.
            </p>
          </div>

          {/* Custom SEO Caption */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1 uppercase tracking-wider">
              Editorial Image Caption (Optional)
            </label>
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="e.g. Styled centerpiece presentation for a black-tie gala banquet in Manhattan."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 dark:placeholder-neutral-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
