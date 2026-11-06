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
    <div className="min-h-screen bg-[#f5f5f7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e5e5ea] flex flex-col shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center border-b border-[#f0f0f4]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-[18px] uppercase text-[#1d1d1f]">
              Aura
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#707070] font-semibold bg-gray-100 px-2 py-0.5 rounded">
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
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#0071e3] hover:bg-blue-50/60 transition-all group"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#0071e3] transition-colors" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Database Status in Sidebar */}
        <div className="p-4 border-t border-[#f0f0f4] bg-gray-50/60">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
              Database Engine
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
              }`}
            />
            <span className="text-[11px] text-gray-600 truncate font-mono">
              {dbStatus.connected ? "PostgreSQL (Prisma)" : "Standby In-Memory"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#e5e5ea] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Mobile Brand Link */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="font-bold tracking-tight text-[16px] uppercase text-[#1d1d1f]">
              Aura Admin
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
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
