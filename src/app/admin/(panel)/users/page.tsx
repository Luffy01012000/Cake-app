import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SEED_USERS } from "@/lib/seed-data";
import UsersManager from "@/components/admin/UsersManager";
import { ShieldAlert } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getSession();

  if (session?.role !== "ADMIN") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          Administrator Role Required
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your current account is authenticated as <strong className="text-purple-600">SEO Specialist</strong>. Managing users, invitations, and administrative roles is restricted to Administrators.
        </p>
      </div>
    );
  }

  let users: { id: string; email: string; name: string; role: "ADMIN" | "SEO_SPECIALIST"; createdAt?: string }[] = [];

  try {
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    if (dbUsers && dbUsers.length > 0) {
      users = dbUsers.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "ADMIN" | "SEO_SPECIALIST",
        createdAt: u.createdAt.toISOString(),
      }));
    }
  } catch {
    // fallback
  }

  if (users.length === 0) {
    users = SEED_USERS.map((u, i) => ({
      id: `seed-${i}`,
      email: u.email,
      name: u.name,
      role: u.role,
    }));
  }

  return (
    <UsersManager
      initialUsers={users}
      currentUserEmail={session.email}
    />
  );
}
