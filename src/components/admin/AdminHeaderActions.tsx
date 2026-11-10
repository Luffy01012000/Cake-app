"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, Loader2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
  const { isDarkMode, toggleDarkMode } = useTheme();

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
        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f1f24] dark:hover:bg-[#282830] text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <span>View Live Site</span>
        <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </a>

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1f1f24] rounded-lg transition-colors cursor-pointer"
      >
        {isDarkMode ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* User Info */}
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {userName}
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-tight">
          {userEmail}
        </span>
      </div>

      {/* Role Pill */}
      <span
        className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase ${
          userRole === "ADMIN"
            ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            : "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
        }`}
      >
        {userRole === "ADMIN" ? "Admin" : "SEO Specialist"}
      </span>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        title="Sign Out"
      >
        {loggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
