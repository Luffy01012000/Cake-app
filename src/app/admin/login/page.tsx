"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, Sparkles, Key } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurapatisserie.com");
  const [password, setPassword] = useState("Admin@Aura2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: "admin" | "seo") => {
    if (type === "admin") {
      setEmail("admin@aurapatisserie.com");
      setPassword("Admin@Aura2026!");
    } else {
      setEmail("seo@aurapatisserie.com");
      setPassword("Seo@Aura2026!");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <span className="font-bold tracking-tight text-[22px] uppercase text-[#1d1d1f]">
            Aura
          </span>
          <span className="text-[12px] uppercase tracking-widest text-[#707070] font-medium">
            Pâtisserie
          </span>
        </Link>
        <h1 className="text-[24px] font-bold text-[#1d1d1f] tracking-tight">
          SEO & Content Administration
        </h1>
        <p className="mt-2 text-sm text-[#707070]">
          Sign in to manage catalog pages, JSON-LD, robots.txt, and metadata
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#e5e5ea] rounded-[24px] sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aurapatisserie.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3] outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-4 border-t border-[#f0f0f4] space-y-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Evaluation Credentials (Click to Autofill):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <Key className="w-3 h-3 text-blue-600" />
                  Administrator
                </div>
                <div className="text-[11px] text-gray-500 truncate">admin@aurapatisserie.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("seo")}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  SEO Specialist
                </div>
                <div className="text-[11px] text-gray-500 truncate">seo@aurapatisserie.com</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[#707070] hover:text-[#1d1d1f] hover:underline">
            &larr; Return to Public Boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
