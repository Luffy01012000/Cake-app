"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, Loader2 } from "lucide-react";

export default function AdminHeaderActions({
  userEmail,
  userName,
  userRole,
}: {
  userEmail: string;
  userName: string;
  userRole: string;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Live Site Link */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <span>View Live Site</span>
        <ExternalLink className="w-3 h-3 text-gray-500" />
      </a>

      {/* User Info */}
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-xs font-semibold text-gray-900 leading-tight">
          {userName}
        </span>
        <span className="text-[10px] text-gray-500 font-mono leading-tight">
          {userEmail}
        </span>
      </div>

      {/* Role Pill */}
      <span
        className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase ${
          userRole === "ADMIN"
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "bg-purple-100 text-purple-700 border border-purple-200"
        }`}
      >
        {userRole === "ADMIN" ? "Admin" : "SEO Specialist"}
      </span>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        title="Sign Out"
      >
        {loggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
