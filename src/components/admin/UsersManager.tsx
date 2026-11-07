"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  User,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SEO_SPECIALIST";
  createdAt?: string;
}

interface UsersManagerProps {
  initialUsers: UserItem[];
  currentUserEmail: string;
}

export default function UsersManager({
  initialUsers,
  currentUserEmail,
}: UsersManagerProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SEO_SPECIALIST">("SEO_SPECIALIST");

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user.");
      }

      setUsers((prev) => [...prev, data.user]);
      setStatusMessage({ type: "success", text: `User "${data.user.email}" created successfully!` });
      setName("");
      setEmail("");
      setPassword("");
      setShowCreateForm(false);
      router.refresh();
    } catch (err: unknown) {
      setStatusMessage({ type: "error", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove user "${userEmail}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setStatusMessage({ type: "success", text: `User "${userEmail}" removed.` });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Manage administrators and SEO specialists with granular editorial permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? "Cancel" : "Add Team Member"}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/60"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Create User Form Drawer / Modal */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateUser}
          className="p-6 bg-white dark:bg-[#141416] border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-xs space-y-4"
        >
          <div className="border-b border-gray-100 dark:border-[#202025] pb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Provision New Team Member
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Assigned credentials can sign in immediately at <code className="font-mono bg-gray-100 dark:bg-[#202025] px-1 py-0.5 rounded text-gray-800 dark:text-neutral-200">/admin/login</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@aurapatisserie.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono placeholder-gray-400 dark:placeholder-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                Role & Permissions *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "SEO_SPECIALIST")}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#101012] text-gray-900 dark:text-white"
              >
                <option value="SEO_SPECIALIST">
                  SEO Specialist (Edits pages, cakes, FAQs, JSON-LD, robots)
                </option>
                <option value="ADMIN">
                  Administrator (Full system control + User RBAC)
                </option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-[#1e1e24] hover:bg-gray-200 dark:hover:bg-[#282830] text-gray-700 dark:text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create User
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-[#141416] rounded-2xl border border-gray-200 dark:border-[#202025] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#101012] text-gray-500 dark:text-neutral-400 uppercase font-semibold border-b border-gray-200 dark:border-[#202025]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role Badge</th>
                <th className="py-3 px-4">Permissions Overview</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#202025] text-gray-700 dark:text-neutral-300">
              {users.map((u) => {
                const isCurrent = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-[#18181c] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      {u.name}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-neutral-400">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          u.role === "ADMIN"
                            ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                            : "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                        }`}
                      >
                        {u.role === "ADMIN" ? (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            SEO Specialist
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-neutral-400">
                      {u.role === "ADMIN"
                        ? "Full Access (Content, SEO, Structured Data, Robots, User Provisioning)"
                        : "SEO Suite (Pages, Cakes, SERP Previews, FAQs, JSON-LD, Robots)"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 dark:text-neutral-500 italic">Active Session</span>
                      )}
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
