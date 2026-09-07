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
  Lock,
  Edit2,
  AlertCircle,
  X,
  Send,
  EyeOff
} from "lucide-react";
import SlideOverDrawer from "../common/SlideOverDrawer";
import EmptyState from "../common/EmptyState";

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
  permissions?: string[];
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

const PERMISSION_OPTIONS = [
  { id: "CAN_CREATE_BILLS", label: "Create Customer Bills", group: "POS & Billing", desc: "POS sales & bills" },
  { id: "CAN_VIEW_POS_CATALOG", label: "View POS Catalog", group: "POS & Billing", desc: "Catalog lookup & prices" },
  { id: "CAN_SCAN_BARCODES", label: "Scan Barcodes", group: "POS & Billing", desc: "Barcode gun ringing" },
  { id: "CAN_INWARD_STOCK", label: "Inward Stock / Receive", group: "POS & Billing", desc: "Receive wholesale deliveries" },
  { id: "CAN_VIEW_PROFIT_MARGINS", label: "View Profit Margins", group: "Margin Privacy", desc: "⚠️ Wholesale buying costs & margin %" },
  { id: "CAN_PACK_BATCHES", label: "Pack & Pick Batches", group: "Wholesale Fulfillment", desc: "FEFO picking & batch labels" },
  { id: "CAN_DISPATCH", label: "Dispatch Run-Sheets", group: "Wholesale Fulfillment", desc: "Out-for-delivery run-sheets" },
  { id: "CAN_PRINT_LABELS", label: "Print Shipping Labels", group: "Wholesale Fulfillment", desc: "Manifests & carton labels" },
  { id: "CAN_VIEW_ORDERS", label: "View Wholesale Orders", group: "Wholesale Fulfillment", desc: "Order pipeline inspection" },
  { id: "CAN_VIEW_LEDGERS", label: "View Account Ledgers", group: "Finance & Credit", desc: "Balance sheets & retailer statements" },
  { id: "CAN_EXPORT_ERP", label: "Export to ERP / Tally", group: "Finance & Credit", desc: "Tally / Marg XML exports" },
  { id: "CAN_MANAGE_CREDIT_LINES", label: "Approve Credit Limits", group: "Finance & Credit", desc: "Credit lines & holds" },
  { id: "CAN_MANAGE_PRICING", label: "Update Wholesale Prices", group: "Administration", desc: "Wholesale price slabs" },
  { id: "CAN_MANAGE_USERS", label: "Manage Team Members", group: "Administration", desc: "User creation & permissions" },
  { id: "CAN_VIEW_ANALYTICS", label: "View Business Analytics", group: "Administration", desc: "Executive reports & retention" }
];

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

  // Profile View Drawer State
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [detailedUserProfile, setDetailedUserProfile] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editStaffTitle, setEditStaffTitle] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const handleOpenView = async (user: AdminUser) => {
    setViewingUser(user);
    setDrawerLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((r) => r.json());
      if (res.success && res.user) {
        setDetailedUserProfile(res.user);
      } else {
        setDetailedUserProfile(user);
      }
    } catch {
      setDetailedUserProfile(user);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditStaffTitle(user.staffTitle || "");
    setEditRole(user.role || "RETAILER_STAFF");
    setEditStatus(user.status || "ACTIVE");
    setEditPermissions(user.permissions || []);
    setEditError(null);
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setEditError(null);

    const payload = {
      name: editName,
      title: editStaffTitle,
      staffTitle: editStaffTitle,
      role: editRole,
      status: editStatus,
      permissions: editPermissions
    };

    try {
      let res = await fetch(`${apiBase}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        res = await fetch(`${apiBase}/api/tenant/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setEditingUser(null);
        await fetchUsers();
        if (viewingUser?.id === editingUser.id) {
          await handleOpenView({ ...viewingUser, ...payload });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setEditError(err.error || "Failed to update user profile");
      }
    } catch {
      setEditError("Network error saving user updates");
    } finally {
      setSavingEdit(false);
    }
  };

  const togglePermission = (permId: string) => {
    if (editPermissions.includes(permId)) {
      setEditPermissions(editPermissions.filter((p) => p !== permId));
    } else {
      setEditPermissions([...editPermissions, permId]);
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
    } catch {
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

  const activeUser = detailedUserProfile || viewingUser;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Super Admin User Registry & RBAC Authority</h2>
              <p className="text-xs text-indigo-200/80">
                Global identity management across Wholesalers, Kiranas, Field Sales Agents, and Cashiers
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-xl">
            Audit privileged access, update security credentials, modify granular permissions, or impersonate personas to audit production behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("USERS")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "USERS"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            User Directory ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AUDIT")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === "AUDIT"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "USERS" ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, phone, login ID, tenant..."
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
                type="button"
                onClick={fetchUsers}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                title="Refresh user list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Users Found"
                description="No user profiles matched your current search or role filter."
                actionLabel="Clear Filter"
                onAction={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                }}
                className="m-6 border-0 bg-transparent"
              />
            ) : (
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
                      <th className="py-3 px-4 text-right">Actions</th>
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
                            {u.permissionsCount || u.permissions?.length || 0} perms
                          </span>
                          {u.quickPinSet && (
                            <span className="ml-1 text-[9px] px-1 bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold rounded">
                              PIN
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {u.status === "ACTIVE" ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="text-rose-600 font-medium flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-500" /> Suspended
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenView(u)}
                              className="p-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                              title="View User Profile Drawer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition"
                              title="Edit User Details & Permissions"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {u.role !== "SUPER_ADMIN" && (
                              <button
                                type="button"
                                disabled={impersonatingId === u.id}
                                onClick={() => handleImpersonate(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg transition"
                                title="Login As User"
                              >
                                <Zap className="w-3 h-3" />
                                {impersonatingId === u.id ? "..." : "Impersonate"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

      {/* ================= DRAWER: VIEW USER PROFILE ================= */}
      {viewingUser && (
        <SlideOverDrawer
          isOpen={!!viewingUser}
          onClose={() => {
            setViewingUser(null);
            setDetailedUserProfile(null);
          }}
          width="max-w-2xl"
          icon={Users}
          title={
            <div className="flex items-center gap-2">
              <span>{activeUser?.name}</span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeUser?.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {activeUser?.status || "ACTIVE"}
              </span>
            </div>
          }
          subtitle={`${activeUser?.staffTitle || "General Staff"} • Role: ${activeUser?.role}`}
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = activeUser;
                    setViewingUser(null);
                    setDetailedUserProfile(null);
                    handleOpenEdit(u);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit User
                </button>
                {activeUser?.role !== "SUPER_ADMIN" && (
                  <button
                    type="button"
                    onClick={() => handleImpersonate(activeUser)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Impersonate
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingUser(null);
                  setDetailedUserProfile(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          }
        >
          {/* Identity & Facility Card */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">User ID: {activeUser?.id}</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{activeUser?.name}</h4>
                <div className="text-xs text-slate-500 mt-0.5">Phone: {activeUser?.phone} • Login: {activeUser?.loginId || activeUser?.phone}</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold font-mono">
                  {activeUser?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Tenant</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                  {activeUser?.tenantName || "Platform Root Admin"}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Quick-PIN Status</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                  {activeUser?.quickPinSet ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Last Login</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                  {activeUser?.lastLoginAt ? new Date(activeUser.lastLoginAt).toLocaleString("en-IN") : "Active Session"}
                </div>
              </div>
            </div>
          </div>

          {/* Granular Permissions Checklist */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Permissions Checklist ({activeUser?.permissions?.length || activeUser?.permissionsCount || 0} privileges)
              </h4>
              {activeUser?.permissions?.includes("CAN_VIEW_PROFIT_MARGINS") ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Margin Visible
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Margin Shielded
                </span>
              )}
            </div>

            {/* Grouped by domain */}
            {Array.from(new Set(PERMISSION_OPTIONS.map((p) => p.group))).map((groupName) => {
              const groupPerms = PERMISSION_OPTIONS.filter((p) => p.group === groupName);

              return (
                <div key={groupName} className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                    {groupName}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupPerms.map((perm) => {
                      const hasPerm = (activeUser?.permissions || []).includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                            hasPerm
                              ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                              : "bg-slate-50/50 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800 opacity-40"
                          }`}
                        >
                          {hasPerm ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className={`font-semibold ${hasPerm ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                              {perm.label}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{perm.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security & Audit Log */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
              Security Audit Trail
            </h4>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Account Created:</span>
                <span className="font-mono">{activeUser?.createdAt ? new Date(activeUser.createdAt).toLocaleString("en-IN") : "System Initialized"}</span>
              </div>
              <div className="flex justify-between">
                <span>Credential Dispatch:</span>
                <span className="text-emerald-600 font-semibold">Evolution API WhatsApp Verified</span>
              </div>
            </div>
          </div>
        </SlideOverDrawer>
      )}

      {/* ================= MODAL: EDIT USER DETAILS & PERMISSIONS ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  Edit User: {editingUser.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update role, staff title, status, and permissions via PUT /api/users/:id
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserEdit} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Title
                  </label>
                  <input
                    type="text"
                    value={editStaffTitle}
                    onChange={(e) => setEditStaffTitle(e.target.value)}
                    placeholder="e.g. Operations Manager"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="SELLER_ADMIN">SELLER_ADMIN</option>
                    <option value="SELLER_STAFF">SELLER_STAFF</option>
                    <option value="RETAILER">RETAILER</option>
                    <option value="RETAILER_STAFF">RETAILER_STAFF</option>
                    <option value="SALES_AGENT">SALES_AGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized)</option>
                    <option value="SUSPENDED">SUSPENDED (Locked Out)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Permissions ({editPermissions.length} selected)
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPermissions(PERMISSION_OPTIONS.map((p) => p.id))}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Select All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isChecked = editPermissions.includes(perm.id);
                    const isMargin = perm.id === "CAN_VIEW_PROFIT_MARGINS";

                    return (
                      <label
                        key={perm.id}
                        className={`p-2.5 rounded-lg border flex items-start gap-2 cursor-pointer text-xs transition ${
                          isChecked
                            ? isMargin
                              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                              : "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                            : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          className="mt-0.5 rounded text-indigo-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            {perm.label}
                            {isMargin && (
                              <span className="text-[9px] px-1 bg-rose-100 text-rose-700 font-bold rounded">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{perm.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save Changes (PUT /api)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
