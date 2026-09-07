"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Shield,
  Store,
  Building2,
  UserCheck,
  Zap,
  Copy,
  Check,
  Lock,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut
} from "lucide-react";

interface TestAccount {
  roleName: string;
  loginId: string;
  phone: string;
  password: string;
  role: string;
  staffTitle?: string;
  quickPin?: string;
  description: string;
}

interface TestAccountsQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  onSwitchAccount: (data: { token: string; user: any; organization?: any; retailerProfile?: any }) => void;
}

export default function TestAccountsQuickModal({
  isOpen,
  onClose,
  apiBase,
  onSwitchAccount
}: TestAccountsQuickModalProps) {
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickPinInput, setQuickPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/test-credentials`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error("Failed to load test accounts", err);
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickLogin = async (acc: TestAccount) => {
    setSwitchingId(acc.loginId);
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: acc.loginId,
          password: acc.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        onSwitchAccount(data);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to switch persona");
      }
    } catch (err) {
      alert("Network error during persona switch");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleQuickPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPinInput || quickPinInput.length !== 4) {
      setPinError("Please enter a 4-digit PIN");
      return;
    }

    setPinError(null);
    try {
      const res = await fetch(`${apiBase}/api/auth/quick-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId: "ret_gupta_kirana",
          quickPin: quickPinInput
        })
      });

      if (res.ok) {
        const data = await res.json();
        onSwitchAccount(data);
        onClose();
      } else {
        const err = await res.json();
        setPinError(err.error || "Invalid PIN for this store");
      }
    } catch (err) {
      setPinError("Failed to authenticate PIN");
    }
  };

  const copyCreds = (acc: TestAccount) => {
    const text = `Login ID: ${acc.loginId}\nPhone: ${acc.phone}\nPassword: ${acc.password}${acc.quickPin ? `\nQuick-PIN: ${acc.quickPin}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.loginId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/40 border border-indigo-400/40 rounded-xl">
              <Key className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Demo Test Accounts & Quick Persona Switch</h2>
              <p className="text-xs text-indigo-200/80">
                Pre-configured credentials for all 4 ecosystem pillars with 1-click instant login
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Info & Test WhatsApp Notice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl col-span-2">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Live WhatsApp Evolution API Integration
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1">
                Real WhatsApp alerts, order OTPs, and password reset codes are configured to dispatch directly to numbers:{" "}
                <span className="font-mono font-bold">+91 9026019566</span> &amp;{" "}
                <span className="font-mono font-bold">+91 7705871046</span>.
              </p>
            </div>

            {/* Quick 4-Digit Cashier PIN box */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Cashier Quick-PIN (1234)
              </div>
              <form onSubmit={handleQuickPinSubmit} className="mt-2 flex gap-1.5">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="PIN"
                  value={quickPinInput}
                  onChange={(e) => setQuickPinInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  className="w-16 px-2 py-1 text-xs text-center font-mono font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-sm transition"
                >
                  ⚡ Shift
                </button>
              </form>
              {pinError && <div className="text-[10px] text-rose-600 mt-1">{pinError}</div>}
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {accounts.map((acc) => {
              const isSuper = acc.role === "SUPER_ADMIN";
              const isSeller = acc.role === "SELLER_ADMIN" || acc.role === "SELLER_STAFF";
              const isRetailer = acc.role === "RETAILER" || acc.role === "RETAILER_STAFF";
              const isAgent = acc.role === "SALES_AGENT";

              return (
                <div
                  key={acc.loginId}
                  className={`p-4 rounded-xl border transition duration-150 flex flex-col justify-between ${
                    isSuper
                      ? "bg-slate-950 text-white border-purple-800/60 shadow-md"
                      : isSeller
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                      : isRetailer
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                            isSuper
                              ? "bg-purple-900/60 text-purple-300 border border-purple-700"
                              : isSeller
                              ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                              : isRetailer
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {acc.roleName}
                        </span>
                        {acc.staffTitle && (
                          <span className="ml-1.5 text-[10px] text-slate-400 font-medium">
                            • {acc.staffTitle}
                          </span>
                        )}
                      </div>

                      {acc.quickPin && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded font-bold">
                          PIN: {acc.quickPin}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mt-2 leading-relaxed ${isSuper ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {acc.description}
                    </p>

                    {/* Credentials Box */}
                    <div className={`mt-3 p-2.5 rounded-lg font-mono text-[11px] space-y-1 ${
                      isSuper ? "bg-slate-900 border border-slate-800" : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Login ID:</span>
                        <span className="font-semibold text-indigo-500 dark:text-indigo-400">{acc.loginId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mobile Phone:</span>
                        <span>{acc.phone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Password:</span>
                        <span className="text-emerald-500 font-semibold">{acc.password}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyCreds(acc)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg transition ${
                        isSuper
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {copiedId === acc.loginId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === acc.loginId ? "Copied" : "Copy"}
                    </button>

                    <button
                      type="button"
                      disabled={switchingId === acc.loginId}
                      onClick={() => handle1ClickLogin(acc)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {switchingId === acc.loginId ? "Logging in..." : "1-Click Switch"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Multi-identifier login supports either <span className="font-mono font-semibold">loginId</span> or <span className="font-mono font-semibold">10-digit mobile</span>.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
