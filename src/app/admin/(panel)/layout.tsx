import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Cake,
  FileText,
  Bot,
  MapPin,
  Users,
  Database,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getDatabaseStatus } from "@/lib/data-service";
import AdminHeaderActions from "@/components/admin/AdminHeaderActions";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const dbStatus = await getDatabaseStatus();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Analytics & Traffic",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Cake Portfolio & SEO",
      href: "/admin/cakes",
      icon: Cake,
    },
    {
      name: "Page SEO & Meta",
      href: "/admin/pages",
      icon: FileText,
    },
    {
      name: "Robots & AI Crawlers",
      href: "/admin/robots",
      icon: Bot,
    },
    {
      name: "XML Sitemap",
      href: "/admin/sitemap",
      icon: MapPin,
    },
    ...(session.role === "ADMIN"
      ? [
          {
            name: "Team & Roles (RBAC)",
            href: "/admin/users",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#09090b] text-[#1d1d1f] dark:text-[#f5f5f7] flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#121215] border-r border-[#e5e5ea] dark:border-[#202025] flex flex-col shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center border-b border-[#f0f0f4] dark:border-[#202025]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-[18px] uppercase text-[#1d1d1f] dark:text-[#f5f5f7]">
              Aura
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#707070] dark:text-[#a1a1a6] font-semibold bg-gray-100 dark:bg-[#202025] px-2 py-0.5 rounded">
              SEO Admin
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-grow">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-blue-50/60 dark:hover:bg-[#1a1a24] transition-all group"
              >
                <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Database Status in Sidebar */}
        <div className="p-4 border-t border-[#f0f0f4] dark:border-[#202025] bg-gray-50/60 dark:bg-[#16161b]">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Database Engine
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
              }`}
            />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate font-mono">
              {dbStatus.connected ? "PostgreSQL (Prisma)" : "Standby In-Memory"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#121215] border-b border-[#e5e5ea] dark:border-[#202025] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
          {/* Mobile Brand Link */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="font-bold tracking-tight text-[16px] uppercase text-[#1d1d1f] dark:text-[#f5f5f7]">
              Aura Admin
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Interconnected SEO Suite</span>
            <span>•</span>
            <span className="font-mono">Next.js 16 + PostgreSQL Prisma</span>
          </div>

          {/* Right Actions */}
          <AdminHeaderActions
            userEmail={session.email}
            userName={session.name}
            userRole={session.role}
          />
        </header>

        {/* Page View Body */}
        <div className="flex-1 p-4 sm:p-8 max-w-[1300px] w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
