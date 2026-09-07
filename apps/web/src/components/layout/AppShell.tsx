"use client";

import React, { useState } from "react";
import {
  Building2,
  Shield,
  ShoppingBag,
  MapPin,
  TrendingUp,
  Truck,
  FileText,
  KeyRound,
  Layers,
  Sparkles,
  PackageCheck,
  Tag,
  Percent,
  Receipt,
  Eye,
  Boxes,
  BookOpen,
  Trophy,
  FileSpreadsheet,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Download,
  CheckCircle2,
  ChevronRight,
  Zap,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface AppShellProps {
  currentUser: any;
  activeRole: "RETAILER" | "SELLER" | "AGENT" | "ADMIN";
  activeTab: string;
  onSelectTab: (tabId: any) => void;
  onSignOut: () => void;
  onOpenTestAccounts: () => void;
  onOpenSignup: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  children: React.ReactNode;
}

export default function AppShell({
  currentUser,
  activeRole,
  activeTab,
  onSelectTab,
  onSignOut,
  onOpenTestAccounts,
  onOpenSignup,
  searchQuery = "",
  onSearchChange,
  children
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Role-specific navigation items
  const getNavItems = (): NavItem[] => {
    switch (activeRole) {
      case "RETAILER":
        return [
          { id: "CATALOG", label: "Wholesale Catalog", icon: ShoppingBag },
          { id: "POS_COUNTER", label: "Kirana Counter POS", icon: Zap, badge: "Quick-PIN" },
          { id: "SMART_TOOLS", label: "Profit & Udhar Khata", icon: Percent },
          { id: "STAFF", label: "Store Staff & Cashiers", icon: Users }
        ];
      case "SELLER":
        return [
          { id: "ORDERS", label: "Orders & Dispatch", icon: PackageCheck },
          { id: "PRODUCTS", label: "Product Studio", icon: Tag },
          { id: "CREDIT", label: "Credit Lines & Ledgers", icon: Receipt },
          { id: "PACKING", label: "Warehouse Packing", icon: Boxes },
          { id: "LOGISTICS", label: "Delivery Run Sheets", icon: Truck },
          { id: "ERP", label: "ERP Universal Importer", icon: FileSpreadsheet, badge: "Tally/Marg" },
          { id: "ROI", label: "ROI & Commission", icon: TrendingUp },
          { id: "STAFF", label: "Team & Permissions", icon: Users }
        ];
      case "AGENT":
        return [
          { id: "CRM", label: "Beat CRM & Stops", icon: MapPin },
          { id: "LEADERBOARD_COACHING", label: "Leaderboard & Audio", icon: Trophy }
        ];
      case "ADMIN":
        return [
          { id: "ANALYTICS", label: "Operations HQ", icon: Shield },
          { id: "KYC", label: "KYC Inspection Queue", icon: FileText, badge: "Pending" },
          { id: "USERS", label: "User Registry & RBAC", icon: Users }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleHeaderInfo = () => {
    switch (activeRole) {
      case "RETAILER":
        return {
          title: currentUser?.retailerProfile?.shopName || "Gupta Kirana Store",
          subtitle: "Verified Kirana Storefront • Lucknow",
          tag: "RETAILER WORKSPACE",
          themeColor: "from-emerald-600 to-teal-700",
          badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        };
      case "SELLER":
        return {
          title: currentUser?.organization?.name || "Anagata FMCG Wholesale",
          subtitle: "Verified Distributor Hub • Lucknow",
          tag: "WHOLESALER WORKSPACE",
          themeColor: "from-indigo-600 to-purple-700",
          badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20"
        };
      case "AGENT":
        return {
          title: currentUser?.name || "Rahul Sharma",
          subtitle: "Field Sales Agent • Hazratganj Beat",
          tag: "FIELD SFA CRM",
          themeColor: "from-sky-600 to-blue-700",
          badgeColor: "bg-sky-500/10 text-sky-600 border-sky-500/20"
        };
      case "ADMIN":
        return {
          title: "Super Admin Command HQ",
          subtitle: "Platform Governance & Multi-Tenant Telemetry",
          tag: "SUPER ADMIN HQ",
          themeColor: "from-indigo-600 to-slate-900",
          badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 select-none">
          {/* Workspace Brand Header */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleInfo.themeColor} flex items-center justify-center font-black text-white text-lg shadow-md flex-shrink-0`}>
                B
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold text-white truncate leading-tight">
                  {roleInfo.title}
                </h2>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {roleInfo.subtitle}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.badgeColor} uppercase tracking-wider`}>
                {roleInfo.tag}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              Workspace Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* APK Download & Coolify Status Card */}
          <div className="p-3 border-t border-slate-800/80 space-y-2">
            <a
              href="https://b2b.anagataitsolutions.in/downloads/b2b-sales-aggregator.apk"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition group"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <div className="text-[11px] font-bold text-white group-hover:text-indigo-300 transition">
                    Android APK (v2.1.0)
                  </div>
                  <div className="text-[9px] text-slate-400">Direct standalone install</div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </a>

            {/* Authenticated User Card & Sign Out */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-black flex-shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">
                    {currentUser?.name || "Authenticated User"}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    @{currentUser?.loginId || currentUser?.id || "user"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT WRAPPER ================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Contextual Header Bar */}
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Breadcrumb Path */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-slate-900 font-bold">{roleInfo.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-indigo-600 font-bold">
                  {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Middle Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search SKUs, orders, retailers, bills..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Right Action Badges */}
            <div className="flex items-center gap-2">
              {/* WhatsApp Evolution API Status Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WhatsApp Active</span>
              </div>

              {/* Test Personas Switcher Button (Clearly marked for demo) */}
              <button
                type="button"
                onClick={onOpenTestAccounts}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                title="Switch persona for evaluation"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Switch Persona</span>
              </button>

              {/* Mobile Sign Out button */}
              <button
                type="button"
                onClick={onSignOut}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* ================= MOBILE DRAWER ================= */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-slate-900 text-slate-300 border-b border-slate-800 p-4 space-y-2 z-40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {roleInfo.title}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition text-left ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Signed in as <strong className="text-white">@{currentUser?.loginId}</strong>
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* ================= WORKSPACE BODY VIEWPORT ================= */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
