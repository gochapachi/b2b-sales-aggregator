"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Sliders,
  Send,
  UserCheck,
  UserX,
  CreditCard,
  Package,
  FileSpreadsheet,
  Settings,
  Edit2
} from "lucide-react";
import SlideOverDrawer from "../common/SlideOverDrawer";
import EmptyState from "../common/EmptyState";
export const UserPermission = {
  CAN_CREATE_BILLS: "CAN_CREATE_BILLS",
  CAN_VIEW_POS_CATALOG: "CAN_VIEW_POS_CATALOG",
  CAN_SCAN_BARCODES: "CAN_SCAN_BARCODES",
  CAN_INWARD_STOCK: "CAN_INWARD_STOCK",
  CAN_VIEW_PROFIT_MARGINS: "CAN_VIEW_PROFIT_MARGINS",
  CAN_OVERRIDE_DISCOUNTS: "CAN_OVERRIDE_DISCOUNTS",
  CAN_MANAGE_UDHAR: "CAN_MANAGE_UDHAR",
  CAN_VIEW_ORDERS: "CAN_VIEW_ORDERS",
  CAN_PACK_BATCHES: "CAN_PACK_BATCHES",
  CAN_DISPATCH: "CAN_DISPATCH",
  CAN_PRINT_LABELS: "CAN_PRINT_LABELS",
  CAN_VIEW_LEDGERS: "CAN_VIEW_LEDGERS",
  CAN_EXPORT_ERP: "CAN_EXPORT_ERP",
  CAN_MANAGE_PDC: "CAN_MANAGE_PDC",
  CAN_MANAGE_CREDIT_LINES: "CAN_MANAGE_CREDIT_LINES",
  CAN_MANAGE_PRICING: "CAN_MANAGE_PRICING",
  CAN_MANAGE_USERS: "CAN_MANAGE_USERS",
  CAN_VIEW_ANALYTICS: "CAN_VIEW_ANALYTICS"
} as const;

interface TenantUser {
  id: string;
  name: string;
  phone: string;
  loginId?: string;
  role: string;
  staffTitle?: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_KYC";
  permissions: string[];
  quickPinSet?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface TenantUserManagementDeskProps {
  apiBase: string;
  tenantType: "SELLER" | "RETAILER";
  tenantId: string;
  tenantName: string;
  canManageUsers?: boolean;
}

const PERMISSION_LABELS: Record<string, { label: string; group: string; desc: string }> = {
  CAN_CREATE_BILLS: { label: "Create Customer Bills", group: "POS & Billing", desc: "Generate sales bills & accept payments on POS" },
  CAN_VIEW_POS_CATALOG: { label: "View POS Catalog", group: "POS & Billing", desc: "Access product search & retail prices" },
  CAN_SCAN_BARCODES: { label: "Scan Barcodes", group: "POS & Billing", desc: "Use camera / scanner gun to ring items" },
  CAN_INWARD_STOCK: { label: "Inward Stock / Receive", group: "POS & Billing", desc: "Scan & accept incoming wholesale deliveries" },
  CAN_OVERRIDE_DISCOUNTS: { label: "Override Discounts", group: "POS & Billing", desc: "Apply custom manual discounts on retail bills" },
  CAN_MANAGE_UDHAR: { label: "Manage Customer Khata", group: "POS & Billing", desc: "Log store credit & record customer repayments" },
  CAN_VIEW_PROFIT_MARGINS: { label: "View Profit Margins", group: "Margin Privacy", desc: "⚠️ Reveal wholesale buying costs & net margin %" },
  CAN_PACK_BATCHES: { label: "Pack & Pick Batches", group: "Wholesale Fulfillment", desc: "Pick items by FEFO batch and verify barcodes" },
  CAN_DISPATCH: { label: "Dispatch Run-Sheets", group: "Wholesale Fulfillment", desc: "Mark orders out-for-delivery & generate run-sheets" },
  CAN_PRINT_LABELS: { label: "Print Shipping Labels", group: "Wholesale Fulfillment", desc: "Print QR packing labels and carton manifests" },
  CAN_VIEW_ORDERS: { label: "View Wholesale Orders", group: "Wholesale Fulfillment", desc: "Browse retailer orders and fulfillment status" },
  CAN_VIEW_LEDGERS: { label: "View Account Ledgers", group: "Finance & Credit", desc: "Access retailer statements and balance sheets" },
  CAN_EXPORT_ERP: { label: "Export to ERP / Tally", group: "Finance & Credit", desc: "Download XML/CSV format for Tally/Marg ERP" },
  CAN_MANAGE_PDC: { label: "Manage PDC Cheques", group: "Finance & Credit", desc: "Log, deposit, and verify post-dated cheques" },
  CAN_MANAGE_CREDIT_LINES: { label: "Approve Credit Limits", group: "Finance & Credit", desc: "Set credit lines and toggle credit-holds" },
  CAN_MANAGE_PRICING: { label: "Update Wholesale Prices", group: "Catalog & Pricing", desc: "Modify wholesale rate slabs and MOQ discounts" },
  CAN_MANAGE_USERS: { label: "Manage Team Members", group: "Administration", desc: "Invite, configure permissions, and suspend staff" },
  CAN_VIEW_ANALYTICS: { label: "View Business Analytics", group: "Administration", desc: "Inspect sales reports, retention, and revenue" }
};

export default function TenantUserManagementDesk({
  apiBase,
  tenantType,
  tenantId,
  tenantName,
  canManageUsers = true
}: TenantUserManagementDeskProps) {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteQuickPin, setInviteQuickPin] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [createdResult, setCreatedResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Profile View Drawer State
  const [viewingUser, setViewingUser] = useState<TenantUser | null>(null);

  // Edit Permissions Modal State
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editStaffTitle, setEditStaffTitle] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "SUSPENDED" | "PENDING_KYC">("ACTIVE");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editQuickPin, setEditQuickPin] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [tenantType, tenantId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/tenant/users?tenantType=${tenantType}&tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load tenant users", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetType: string) => {
    if (presetType === "CASHIER") {
      setInviteTitle("Billing Counter Cashier");
      setSelectedPermissions([
        UserPermission.CAN_CREATE_BILLS,
        UserPermission.CAN_VIEW_POS_CATALOG,
        UserPermission.CAN_SCAN_BARCODES
      ]);
    } else if (presetType === "STORE_HELPER") {
      setInviteTitle("Store Helper & Inwarder");
      setSelectedPermissions([
        UserPermission.CAN_INWARD_STOCK,
        UserPermission.CAN_VIEW_POS_CATALOG,
        UserPermission.CAN_SCAN_BARCODES
      ]);
    } else if (presetType === "RETAIL_MANAGER") {
      setInviteTitle("Store Manager");
      setSelectedPermissions([
        UserPermission.CAN_CREATE_BILLS,
        UserPermission.CAN_VIEW_POS_CATALOG,
        UserPermission.CAN_SCAN_BARCODES,
        UserPermission.CAN_INWARD_STOCK,
        UserPermission.CAN_VIEW_PROFIT_MARGINS,
        UserPermission.CAN_OVERRIDE_DISCOUNTS,
        UserPermission.CAN_MANAGE_UDHAR,
        UserPermission.CAN_MANAGE_USERS,
        UserPermission.CAN_VIEW_ANALYTICS
      ]);
    } else if (presetType === "PICKER_DISPATCH") {
      setInviteTitle("Warehouse Dispatch Lead");
      setSelectedPermissions([
        UserPermission.CAN_PACK_BATCHES,
        UserPermission.CAN_DISPATCH,
        UserPermission.CAN_PRINT_LABELS,
        UserPermission.CAN_VIEW_ORDERS
      ]);
    } else if (presetType === "ACCOUNTANT") {
      setInviteTitle("Head Accountant");
      setSelectedPermissions([
        UserPermission.CAN_VIEW_LEDGERS,
        UserPermission.CAN_EXPORT_ERP,
        UserPermission.CAN_MANAGE_PDC,
        UserPermission.CAN_MANAGE_CREDIT_LINES
      ]);
    } else if (presetType === "WHOLESALE_MANAGER") {
      setInviteTitle("Operations Manager");
      setSelectedPermissions([
        UserPermission.CAN_VIEW_ORDERS,
        UserPermission.CAN_PACK_BATCHES,
        UserPermission.CAN_DISPATCH,
        UserPermission.CAN_PRINT_LABELS,
        UserPermission.CAN_VIEW_LEDGERS,
        UserPermission.CAN_EXPORT_ERP,
        UserPermission.CAN_MANAGE_PDC,
        UserPermission.CAN_MANAGE_CREDIT_LINES,
        UserPermission.CAN_MANAGE_PRICING,
        UserPermission.CAN_MANAGE_USERS,
        UserPermission.CAN_VIEW_ANALYTICS
      ]);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleEditPermission = (perm: string) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !invitePhone) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/tenant/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantType,
          tenantId,
          name: inviteName,
          phone: invitePhone,
          staffTitle: inviteTitle || (tenantType === "SELLER" ? "Warehouse Staff" : "Counter Staff"),
          permissions: selectedPermissions,
          quickPin: inviteQuickPin.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedResult(data);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to invite staff member");
      }
    } catch (err: any) {
      alert("Network error inviting staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: TenantUser) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const confirmMsg =
      newStatus === "SUSPENDED"
        ? `Are you sure you want to SUSPEND ${user.name}? They will immediately lose access to the system.`
        : `Reactivate ${user.name}'s login access?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${apiBase}/api/tenant/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleOpenEdit = (user: TenantUser) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditStaffTitle(user.staffTitle || "");
    setEditRole(user.role || (tenantType === "SELLER" ? "SELLER_STAFF" : "RETAILER_STAFF"));
    setEditStatus(user.status || "ACTIVE");
    setEditPermissions([...user.permissions]);
    setEditQuickPin("");
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const payload: any = {
        name: editName,
        title: editStaffTitle,
        staffTitle: editStaffTitle,
        role: editRole,
        status: editStatus,
        permissions: editPermissions
      };
      if (editQuickPin.trim()) {
        payload.quickPin = editQuickPin.trim();
      }

      // Try PUT /api/users/:id first, then fallback to PUT /api/tenant/users/:id
      let res = await fetch(`${apiBase}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        res = await fetch(`${apiBase}/api/tenant/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setEditingUser(null);
        await fetchUsers();
      } else {
        alert("Failed to update user profile");
      }
    } catch (err) {
      alert("Failed to update user details");
    } finally {
      setSavingEdit(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      (u.staffTitle && u.staffTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const quickPinCount = users.filter((u) => u.quickPinSet).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Team Management & RBAC Security Desk</h2>
              <p className="text-xs text-indigo-200/80">
                {tenantName} • {tenantType === "SELLER" ? "Wholesale Distributor Workspace" : "Kirana Store Billing Counters"}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-xl">
            Provision cashier counters, warehouse pickers, and accountants with isolated privileges. 
            Shield gross margins and wholesale buying costs from junior staff.
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={() => {
              setIsInviteOpen(true);
              setCreatedResult(null);
              setInviteName("");
              setInvitePhone("");
              setInviteTitle("");
              setInviteQuickPin("");
              setSelectedPermissions(
                tenantType === "RETAILER"
                  ? [UserPermission.CAN_CREATE_BILLS, UserPermission.CAN_VIEW_POS_CATALOG, UserPermission.CAN_SCAN_BARCODES]
                  : [UserPermission.CAN_PACK_BATCHES, UserPermission.CAN_DISPATCH, UserPermission.CAN_PRINT_LABELS]
              );
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition duration-150 transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            Invite Staff Member
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Team Size</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{users.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Staff & Administrators</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active Accounts</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Authorized for login</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Quick-PIN Enabled</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{quickPinCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fast counter switching</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">WhatsApp Dispatch</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">100%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Evolution API Auto-dispatch</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading team directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Staff Members Found"
            description="No team members match your search or status filter. Click below to onboard a new staff cashier or warehouse associate."
            actionLabel={canManageUsers ? "Invite Staff Member" : undefined}
            onAction={canManageUsers ? () => setIsInviteOpen(true) : undefined}
            className="m-6 border-0 bg-transparent"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role & Title</th>
                  <th className="py-3 px-4">Login Identifier</th>
                  <th className="py-3 px-4">Counter PIN</th>
                  <th className="py-3 px-4">Assigned Privileges</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => {
                  const hasMarginAccess = user.permissions.includes(UserPermission.CAN_VIEW_PROFIT_MARGINS);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {user.name}
                          {user.role === "RETAILER" || user.role === "SELLER_ADMIN" ? (
                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded font-medium">
                              PROPRIETOR
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Founding Member"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {user.staffTitle || "General Staff"}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          {user.role}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 dark:text-slate-200">
                          {user.loginId || user.phone}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          WhatsApp: {user.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.quickPinSet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded">
                            <Key className="w-3 h-3 text-indigo-500" />
                            PIN Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {/* Margin Privacy Pill */}
                          {hasMarginAccess ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5" /> Margin Visible
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[9px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded flex items-center gap-0.5">
                              <EyeOff className="w-2.5 h-2.5" /> Margin Shielded
                            </span>
                          )}

                          <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                            {user.permissions.length} privileges
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-full">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                            title="View Staff Profile & Permissions"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canManageUsers && user.role !== "RETAILER" && user.role !== "SELLER_ADMIN" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="px-2 py-1 text-[11px] bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium transition flex items-center gap-1"
                                title="Edit Staff Member"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                className={`px-2 py-1 text-[11px] rounded-lg font-medium transition ${
                                  user.status === "ACTIVE"
                                    ? "bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100"
                                    : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100"
                                }`}
                              >
                                {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Staff Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Invite New Team Member
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign role, configure permissions, and automatically dispatch credentials via WhatsApp
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            {createdResult ? (
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Staff Member Provisioned Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Account created and active. Credentials have been dispatched to WhatsApp number{" "}
                      <span className="font-semibold">{createdResult.user.phone}</span>.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{createdResult.user.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Staff Title:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{createdResult.user.staffTitle}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Login ID / Mobile:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{createdResult.user.loginId || createdResult.user.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Temporary Password:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{createdResult.temporaryPassword}</span>
                  </div>
                  {createdResult.user.quickPin && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Counter Quick-PIN:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{createdResult.user.quickPin}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      const text = `Welcome to ${tenantName}!\nLogin ID: ${createdResult.user.loginId}\nPassword: ${createdResult.temporaryPassword}${createdResult.user.quickPin ? `\nQuick-PIN: ${createdResult.user.quickPin}` : ''}\nPortal: https://b2b.anagataitsolutions.in/login`;
                      copyToClipboard(text);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-200 transition"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copiedKey ? "Credentials Copied!" : "Copy Full Credentials"}
                  </button>

                  <button
                    onClick={() => setIsInviteOpen(false)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Fast Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Quick Role Presets
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tenantType === "RETAILER" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => applyPreset("CASHIER")}
                          className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition"
                        >
                          🛒 Counter Cashier (Margins Shielded)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset("STORE_HELPER")}
                          className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 transition"
                        >
                          📦 Store Inwarder & Helper
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset("RETAIL_MANAGER")}
                          className="px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition"
                        >
                          👑 Store Manager (Full Access)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => applyPreset("PICKER_DISPATCH")}
                          className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition"
                        >
                          📦 Warehouse Picker & Dispatch
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset("ACCOUNTANT")}
                          className="px-3 py-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition"
                        >
                          📊 Head Accountant (Tally / Ledgers)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset("WHOLESALE_MANAGER")}
                          className="px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition"
                        >
                          👑 Operations Manager (Full Privileges)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Staff Member Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Phone (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Staff Title & Quick-PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Staff Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Counter Cashier 1"
                      value={inviteTitle}
                      onChange={(e) => setInviteTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      4-Digit Quick-PIN (Optional, for Cashier)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={inviteQuickPin}
                      onChange={(e) => setInviteQuickPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                {/* Granular Permissions Matrix */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Module Privileges ({selectedPermissions.length} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(Object.keys(PERMISSION_LABELS))}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                    {Object.entries(PERMISSION_LABELS).map(([permKey, permMeta]) => {
                      const isChecked = selectedPermissions.includes(permKey);
                      const isMarginPrivacy = permKey === "CAN_VIEW_PROFIT_MARGINS";

                      return (
                        <label
                          key={permKey}
                          className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition text-xs ${
                            isChecked
                              ? isMarginPrivacy
                                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                                : "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(permKey)}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                              {permMeta.label}
                              {isMarginPrivacy && (
                                <span className="text-[9px] px-1 bg-rose-100 text-rose-700 font-bold rounded">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                              {permMeta.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Create Account & Dispatch WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER PROFILE & PRIVILEGES ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  Edit Staff Member: {editingUser.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update name, staff title, role, status, Quick-PIN, and granular privileges (PUT /api/users/:id)
                </p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Profile Basic Info */}
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
                    Staff Job Title
                  </label>
                  <input
                    type="text"
                    value={editStaffTitle}
                    onChange={(e) => setEditStaffTitle(e.target.value)}
                    placeholder="e.g. Head Billing Cashier"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="RETAILER_STAFF">Retailer Staff / Cashier</option>
                    <option value="RETAILER">Retailer Proprietor</option>
                    <option value="SELLER_STAFF">Seller Staff / Picker</option>
                    <option value="SELLER_ADMIN">Seller Admin</option>
                    <option value="SALES_AGENT">Field Sales Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized)</option>
                    <option value="SUSPENDED">SUSPENDED (Locked out)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reset 4-Digit Quick-PIN (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="New 4-digit PIN"
                  value={editQuickPin}
                  onChange={(e) => setEditQuickPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  className="w-48 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-center tracking-widest"
                />
              </div>

              {/* Granular Permissions Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Granted Privileges ({editPermissions.length} selected)
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPermissions(Object.keys(PERMISSION_LABELS))}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Select All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {Object.entries(PERMISSION_LABELS).map(([permKey, permMeta]) => {
                    const isChecked = editPermissions.includes(permKey);
                    const isMarginPrivacy = permKey === "CAN_VIEW_PROFIT_MARGINS";

                    return (
                      <label
                        key={permKey}
                        className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer text-xs transition ${
                          isChecked
                            ? isMarginPrivacy
                              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                              : "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                            : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEditPermission(permKey)}
                          className="mt-0.5 rounded text-indigo-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            {permMeta.label}
                            {isMarginPrivacy && (
                              <span className="text-[9px] px-1 bg-rose-100 text-rose-700 font-bold rounded">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{permMeta.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Changes (PUT /api)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DRAWER: VIEW USER PROFILE ================= */}
      {viewingUser && (
        <SlideOverDrawer
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          width="max-w-2xl"
          icon={Users}
          title={
            <div className="flex items-center gap-2">
              <span>{viewingUser.name}</span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  viewingUser.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {viewingUser.status}
              </span>
            </div>
          }
          subtitle={`${viewingUser.staffTitle || "General Staff"} • Role: ${viewingUser.role}`}
          footer={
            <div className="flex items-center justify-between gap-3">
              {canManageUsers && viewingUser.role !== "RETAILER" && viewingUser.role !== "SELLER_ADMIN" && (
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    handleOpenEdit(u);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit User Profile
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition ml-auto"
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
                <span className="text-[10px] font-mono text-slate-400">ID: {viewingUser.id}</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{viewingUser.name}</h4>
                <div className="text-xs text-slate-500 mt-0.5">{viewingUser.staffTitle || "Staff"} • {viewingUser.phone}</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold font-mono">
                  {viewingUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Tenant</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">{tenantName}</div>
                <div className="text-[10px] text-slate-500">{tenantType} Facility</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Quick-PIN Status</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 flex items-center gap-1">
                  {viewingUser.quickPinSet ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-500" /> Active (Configured)
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Member Since</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                  {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString("en-IN") : "Founding Member"}
                </div>
              </div>
            </div>
          </div>

          {/* Domain Grouped Permissions Checklist */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Granular Permissions Checklist ({viewingUser.permissions.length} granted)
              </h4>
              {viewingUser.permissions.includes(UserPermission.CAN_VIEW_PROFIT_MARGINS) ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Margin Visible
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Margin Shielded
                </span>
              )}
            </div>

            {/* Grouped by Domain */}
            {Array.from(new Set(Object.values(PERMISSION_LABELS).map((p) => p.group))).map((groupName) => {
              const groupPerms = Object.entries(PERMISSION_LABELS).filter(([_, meta]) => meta.group === groupName);

              return (
                <div key={groupName} className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                    {groupName}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupPerms.map(([permKey, permMeta]) => {
                      const hasPerm = viewingUser.permissions.includes(permKey);
                      return (
                        <div
                          key={permKey}
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
                              {permMeta.label}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{permMeta.desc}</div>
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
                <span className="font-mono">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleString("en-IN") : "Initial Seed"}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp Provisioning:</span>
                <span className="text-emerald-600 font-semibold">Dispatched via Evolution API</span>
              </div>
              <div className="flex justify-between">
                <span>Last Authorized Session:</span>
                <span className="font-mono">{viewingUser.lastLoginAt ? new Date(viewingUser.lastLoginAt).toLocaleString("en-IN") : "Active Session"}</span>
              </div>
            </div>
          </div>
        </SlideOverDrawer>
      )}
    </div>
  );
}
