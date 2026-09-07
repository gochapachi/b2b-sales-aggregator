"use client";

import React, { useState } from "react";
import {
  Building2,
  Shield,
  ShoppingBag,
  MapPin,
  Key,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Zap,
  Users,
  Layers,
  ChevronRight
} from "lucide-react";

interface AuthGatewayProps {
  apiBase: string;
  onLoginSuccess: (session: { token: string; user: any; organization?: any; retailerProfile?: any }) => void;
  onOpenSignup: (role: "RETAILER" | "SELLER") => void;
}

const PRESET_DEMO_USERS = [
  {
    roleId: "SUPER_ADMIN",
    title: "Super Admin HQ",
    subtitle: "Full platform governance & KYC queue",
    loginId: "superadmin",
    pass: "SuperAdmin@2026",
    color: "from-indigo-600 to-blue-700",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    icon: Shield,
    entity: "Platform Command Center"
  },
  {
    roleId: "SELLER_ADMIN",
    title: "Wholesale Distributor",
    subtitle: "Anagata FMCG Wholesale (Orders & ERP)",
    loginId: "seller_anagata",
    pass: "Seller@2026",
    color: "from-purple-600 to-indigo-700",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: Building2,
    entity: "Anagata FMCG Wholesale"
  },
  {
    roleId: "SELLER_STAFF",
    title: "Warehouse Picker",
    subtitle: "Floor staff • Shielded purchase margins",
    loginId: "seller_picker",
    pass: "Picker@2026",
    color: "from-slate-600 to-slate-800",
    badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    icon: Layers,
    entity: "Warehouse Floor #1"
  },
  {
    roleId: "RETAILER",
    title: "Kirana Retail Store",
    subtitle: "Gupta Kirana (B2B Orders & Storefront)",
    loginId: "ret_gupta",
    pass: "Kirana@2026",
    color: "from-emerald-600 to-teal-700",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: ShoppingBag,
    entity: "Gupta Kirana & General Store"
  },
  {
    roleId: "RETAILER_STAFF",
    title: "Kirana POS Cashier",
    subtitle: "Counter #1 • Fast 4-Digit Quick-PIN",
    loginId: "ret_cashier",
    pass: "1234",
    isPin: true,
    color: "from-amber-600 to-orange-700",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: Zap,
    entity: "Counter #1 Cash Register"
  },
  {
    roleId: "SALES_AGENT",
    title: "Field Sales Agent",
    subtitle: "Hazratganj Beat (Geofenced Check-ins)",
    loginId: "agent_rahul",
    pass: "Agent@2026",
    color: "from-sky-600 to-cyan-700",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    icon: MapPin,
    entity: "Hazratganj Day Beat"
  }
];

export default function AuthGateway({
  apiBase,
  onLoginSuccess,
  onOpenSignup
}: AuthGatewayProps) {
  const [activeTab, setActiveTab] = useState<"SIGNIN" | "DEMO_PERSONAS">("SIGNIN");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPinMode, setIsPinMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      let endpoint = `${apiBase}/api/auth/login`;
      let payload: any = {
        identifier: identifier.trim(),
        password: password.trim()
      };

      if (isPinMode) {
        endpoint = `${apiBase}/api/auth/cashier-pin-login`;
        payload = {
          pin: password.trim(),
          retailerId: "ret_gupta_kirana"
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check credentials.");
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Could not connect to authentication service.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPersonaSelect = async (demo: typeof PRESET_DEMO_USERS[0]) => {
    setErrorMessage(null);
    setSubmitting(true);

    try {
      let endpoint = `${apiBase}/api/auth/login`;
      let payload: any = {
        loginId: demo.loginId,
        password: demo.pass
      };

      if (demo.isPin) {
        endpoint = `${apiBase}/api/auth/cashier-pin-login`;
        payload = {
          pin: demo.pass,
          retailerId: "ret_gupta_kirana"
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to switch persona");
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in as persona");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="max-w-md w-full text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 shadow-xl shadow-indigo-500/20 mb-4 border border-white/10">
          <span className="text-2xl font-black text-white">B</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Hyperlocal B2B Aggregator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Enterprise Udaan-Style Marketplace & Sales Force Automation CRM
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Cloud • Coolify Ubuntu 24.04
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-[11px] text-slate-400 font-mono">v2.1.0 Enterprise</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("SIGNIN")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "SIGNIN"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Secure Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DEMO_PERSONAS")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "DEMO_PERSONAS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Click Demo Personas</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Manual Sign In Form */}
        {activeTab === "SIGNIN" && (
          <form onSubmit={handleManualLogin} className="space-y-4">
            {/* Quick-PIN mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300 font-medium">
                {isPinMode ? "⚡ 4-Digit Cashier PIN Counter Mode" : "🔑 Standard Account Login (Password)"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsPinMode(!isPinMode);
                  setPassword("");
                  setErrorMessage(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline"
              >
                {isPinMode ? "Switch to Username" : "Cashier PIN"}
              </button>
            </div>

            {!isPinMode ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Username, Login ID or Registered Phone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. superadmin, seller_anagata, or 919026019566"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Enter 4-Digit Counter Quick-PIN (Demo PIN: 1234)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="• • • •"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-center text-2xl font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Authenticates fast shift switch on Kirana POS Counter #1
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <span>Authenticating Workspace...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: 1-Click Demo Personas */}
        {activeTab === "DEMO_PERSONAS" && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-3">
              Select any pre-configured seed account to inspect its isolated role dashboard:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {PRESET_DEMO_USERS.map((user) => {
                const Icon = user.icon;
                return (
                  <button
                    key={user.loginId}
                    type="button"
                    onClick={() => handleQuickPersonaSelect(user)}
                    disabled={submitting}
                    className="flex flex-col p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${user.color} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${user.badgeBg}`}>
                        {user.roleId}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                      {user.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {user.subtitle}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                      <span>ID: @{user.loginId}</span>
                      <span className="font-bold text-indigo-400 flex items-center gap-0.5">
                        Log In <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Registration Callouts */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Don't have an active merchant account yet?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onOpenSignup("RETAILER")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Register Kirana Store</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenSignup("SELLER")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-bold rounded-xl border border-purple-500/30 transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register Distributor/Brand</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Features Ticker */}
      <div className="max-w-2xl w-full mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-500 relative z-10">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Strict Tenant Isolation & RBAC
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Offline 4-Digit POS Counter PIN
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          WhatsApp Alerts via Evolution API
        </span>
      </div>
    </div>
  );
}
