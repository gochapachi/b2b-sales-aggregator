"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Search,
  RefreshCw,
  Eye,
  Zap,
  CheckCircle2,
  XCircle,
  Key,
  Building2,
  Store,
  FileText,
  Activity,
  UserCheck,
  UserX,
  Lock
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  loginId?: string;
  role: string;
  staffTitle?: string;
  status: string;
  tenantName?: string;
  organizationId?: string;
  retailerId?: string;
  permissionsCount: number;
  quickPinSet: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role?: string;
  userRole?: string;
  action: string;
  details?: any;
  tenantType?: string;
  tenantId?: string;
}

interface SuperAdminUserRegistryDeskProps {
  apiBase: string;
  authToken: string;
  onImpersonateSuccess: (data: any) => void;
}

export default function SuperAdminUserRegistryDesk({
  apiBase,
  authToken,
  onImpersonateSuccess
}: SuperAdminUserRegistryDeskProps) {
  const [activeTab, setActiveTab] = useState<"USERS" | "AUDIT">("USERS");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "USERS") {
      fetchUsers();
    } else {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/audit-logs?limit=150`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (user: AdminUser) => {
    if (!confirm(`Log in and view platform portal as ${user.name} (${user.role})?`)) return;

    setImpersonatingId(user.id);
    try {
      const res = await fetch(`${apiBase}/api/admin/impersonate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ targetUserId: user.id })
      });

      if (res.ok) {
        const data = await res.json();
        onImpersonateSuccess(data);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to impersonate user");
      }
    } catch (err) {
      alert("Network error during impersonation");
    } finally {
      setImpersonatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      (u.loginId && u.loginId.toLowerCase().includes(search.toLowerCase())) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Platform Identity Registry & Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Cross-tenant user directory, RBAC governance, and immutable audit logs
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab("USERS")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === "USERS"
                ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === "AUDIT"
                ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Security Audit Trail
          </button>
        </div>
      </div>

      {activeTab === "USERS" ? (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, mobile, tenant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] text-slate-400">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="SELLER_ADMIN">Seller Admin</option>
                <option value="SELLER_STAFF">Seller Staff</option>
                <option value="RETAILER">Retailer</option>
                <option value="RETAILER_STAFF">Retailer Staff</option>
                <option value="SALES_AGENT">Field Sales Agent</option>
              </select>

              <button
                onClick={fetchUsers}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role / Title</th>
                    <th className="py-3 px-4">Associated Tenant</th>
                    <th className="py-3 px-4">Login Identifier</th>
                    <th className="py-3 px-4">Privileges</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Super Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300">
                          {u.role}
                        </span>
                        {u.staffTitle && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{u.staffTitle}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.tenantName ? (
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {u.tenantName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Platform Root</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div>{u.loginId || u.phone}</div>
                        <div className="text-[10px] text-slate-400">{u.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-medium">
                          {u.permissionsCount} permissions
                        </span>
                        {u.quickPinSet && (
                          <span className="ml-1 text-[9px] px-1 bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold rounded">
                            PIN
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.status === "ACTIVE" ? (
                          <span className="text-emerald-600 font-medium">● Active</span>
                        ) : (
                          <span className="text-rose-600 font-medium">● Suspended</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {u.role !== "SUPER_ADMIN" && (
                          <button
                            type="button"
                            disabled={impersonatingId === u.id}
                            onClick={() => handleImpersonate(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg transition"
                          >
                            <Zap className="w-3 h-3" />
                            {impersonatingId === u.id ? "Impersonating..." : "Impersonate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Tenant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userRole || log.role}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 font-bold rounded text-indigo-600 dark:text-indigo-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {typeof log.details === "object" ? JSON.stringify(log.details) : log.details || "—"}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {log.tenantType ? `${log.tenantType} (${log.tenantId})` : "PLATFORM"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
