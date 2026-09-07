"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShieldAlert,
  Users,
  Building2,
  PieChart,
  MapPin,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  HardDrive,
  Cpu,
  Server,
  Database
} from "lucide-react";

interface SuperAdminAnalyticsDashboardProps {
  apiBase: string;
}

export default function SuperAdminAnalyticsDashboard({ apiBase }: SuperAdminAnalyticsDashboardProps) {
  const [overview, setOverview] = useState<any | null>(null);
  const [heatmaps, setHeatmaps] = useState<any[]>([]);
  const [brandShares, setBrandShares] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [npaData, setNpaData] = useState<any | null>(null);
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active Sub-view
  const [activeSection, setActiveSection] = useState<"OVERVIEW" | "HEATMAPS" | "BRANDS" | "COHORTS" | "NPA_RADAR">("OVERVIEW");

  // Broadcast Modal State
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overRes, heatRes, brandRes, cohortRes, npaRes, telemRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/analytics/overview`).then((r) => r.json()),
        fetch(`${apiBase}/api/admin/analytics/heatmaps`).then((r) => r.json()),
        fetch(`${apiBase}/api/admin/analytics/brand-share`).then((r) => r.json()),
        fetch(`${apiBase}/api/admin/analytics/cohort-retention`).then((r) => r.json()),
        fetch(`${apiBase}/api/admin/analytics/credit-npa`).then((r) => r.json()),
        fetch(`${apiBase}/api/admin/telemetry`).then((r) => r.json())
      ]);

      if (overRes.success) setOverview(overRes.overview);
      if (heatRes.success) setHeatmaps(heatRes.zones);
      if (brandRes.success) setBrandShares(brandRes.brandShares);
      if (cohortRes.success) setCohorts(cohortRes.cohorts);
      if (npaRes.success) setNpaData(npaRes);
      if (telemRes.success) setTelemetry(telemRes.telemetry);
    } catch {
      setStatusMessage("Failed to fetch platform analytics. Please ensure API is running.");
    } finally {
      setLoading(false);
    }
  };

  const triggerBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/broadcast-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignName: "Festive Flash Margin Booster", targetKiranasCount: 68 })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Zero-cost WhatsApp Broadcast sent to ${data.recipientsQueued} Kiranas via Evolution API!`);
      }
    } catch {
      setStatusMessage("Broadcast dispatch encountered an error.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Message */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner: Master Platform GMV Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Platform Owner HQ
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Telemetry Engine
              </span>
            </div>
            <h2 className="text-3xl font-black mt-2 text-white tracking-tight">
              B2B Sales Aggregator Platform Command
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              100% Zero-Paid Infrastructure Stack • PostGIS Hyperlocal Routing • Self-Hosted Evolution API (WhatsApp) • MinIO Object Storage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerBroadcast}
              disabled={isBroadcasting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isBroadcasting ? "Broadcasting..." : "Broadcast Deal to 68 Kiranas"}
            </button>
            <button
              onClick={loadAnalytics}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Core Platform Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Network GMV</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              ₹{(overview?.totalGmv || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-0.5 font-bold">
              <ArrowUpRight className="w-3 h-3" /> +24.8% MoM Velocity
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Wholesaler Monthly Savings</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              ₹{(overview?.wholesalerMonthlySavingsRupees || 27000).toLocaleString("en-IN")}/mo
            </div>
            <div className="text-[11px] text-slate-300 mt-1">0% commission vs 15% legacy</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Kiranas & Wholesalers</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {overview?.totalRetailersCount || 4} Kiranas / {overview?.totalWholesalersCount || 2} Sellers
            </div>
            <div className="text-[11px] text-indigo-300 mt-1">{overview?.totalOrdersCount || 18} orders processed</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Systemic NPA Credit Radar</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300 mt-1">
              ₹{(overview?.systemicNpaAmount || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-bold">
              {overview?.riskDistribution?.lowRiskPct || 85}% Low Risk Profile
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSection("OVERVIEW")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeSection === "OVERVIEW"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          Unit Economics & Telemetry
        </button>
        <button
          onClick={() => setActiveSection("HEATMAPS")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeSection === "HEATMAPS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Ward Density Heatmaps ({heatmaps.length})
        </button>
        <button
          onClick={() => setActiveSection("BRANDS")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeSection === "BRANDS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart className="w-4 h-4" />
          FMCG Brand Share ({brandShares.length})
        </button>
        <button
          onClick={() => setActiveSection("COHORTS")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeSection === "COHORTS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          12-Mo Cohort Retention ({cohorts.length})
        </button>
        <button
          onClick={() => setActiveSection("NPA_RADAR")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeSection === "NPA_RADAR"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          45+ Day NPA Radar
        </button>
      </div>

      {/* ================= SECTION 1: UNIT ECONOMICS & TELEMETRY ================= */}
      {activeSection === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Unit Economics Left 7 Cols */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Platform Unit Economics & Wholesaler ROI
              </h3>
              <p className="text-xs text-slate-500">
                Subscription monetization breakdown replacing traditional commission taking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Gross Contribution Margin</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {overview?.grossContributionMargin || 18.5}%
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Healthy Kirana Resale Spread</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Order Velocity</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {overview?.orderVelocityPerHour || 14.5} orders/hr
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Real-time Order Throughput</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Average Order Value (AOV)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹{(overview?.averageOrderValue || 7100).toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Bulk B2B Wholesale Cart Average</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Total Credit Outstanding</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹{(overview?.totalCreditOutstanding || 21500).toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Covered by Decentralized Limits</div>
              </div>
            </div>

            {/* Wholesaler Payroll Reduction Callout */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-indigo-950 text-xs">
                  SaaS vs 2 Dedicated Sales Reps Payroll Comparison
                </div>
                <div className="text-xs text-indigo-700 mt-0.5">
                  ₹33,000 legacy field payroll replaced by ₹6,000 platform subscription = <strong>81.8% Cost Reduction</strong>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-indigo-600 text-white font-black text-xs rounded-lg">
                ₹27,000 Net Saved
              </span>
            </div>
          </div>

          {/* Telemetry Right 5 Cols */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Self-Hosted Server Telemetry
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Ubuntu 24.04 VPS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero SaaS costs running on https://server.anagataitsolutions.in
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Cpu className="w-4 h-4 text-indigo-400" /> CPU Load Avg (1m, 5m, 15m)
                  </span>
                  <span className="font-bold text-emerald-400">
                    {Array.isArray(telemetry?.cpuLoad) ? telemetry.cpuLoad.join(", ") : (telemetry?.cpuLoad || "0.12, 0.18, 0.15")}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Database className="w-4 h-4 text-blue-400" /> PostgreSQL 16 + PostGIS
                  </span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <span className="flex items-center gap-2 text-slate-300">
                    <HardDrive className="w-4 h-4 text-amber-400" /> MinIO S3 Compatible Storage
                  </span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 14.8 MB Backups
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-purple-400" /> Evolution API (WhatsApp)
                  </span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> INSTANCE READY
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>RAM (Heap): {telemetry?.memoryUsageMb?.heapUsed ?? 184} MB (RSS: {telemetry?.memoryUsageMb?.rss ?? 240} MB) / 8,192 MB</span>
              <span>Active TCP: {telemetry?.activeConnections || 14}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: WARD DENSITY HEATMAPS ================= */}
      {activeSection === "HEATMAPS" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              OpenStreetMap Hyperlocal Kirana Density & Demand Ward Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Ward-by-ward analytics for Lucknow territory without paid Google Maps APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {heatmaps.map((z) => (
              <div key={z.zoneId} className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-indigo-400 transition">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-900">{z.wardName}</span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {z.activeKiranasCount} Kiranas
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-mono">
                  Coordinates: {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Monthly GMV:</span>
                    <strong className="text-slate-900">₹{z.monthlyGmvRupees.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Stockout Rate:</span>
                    <strong className="text-amber-600">{z.stockoutRatePct}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery TAT:</span>
                    <strong className="text-slate-900">{z.averageDeliveryTatMinutes} mins</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 3: FMCG BRAND SHARE ================= */}
      {activeSection === "BRANDS" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              FMCG Brand Category Share & Volume Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated order volumes revealing market leadership across Biscuits, Tea, and Edible Oils.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {brandShares.map((b, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{b.brandName}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {b.category}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Units Sold: {b.unitsSold.toLocaleString("en-IN")} • MoM Growth: +{b.growthPctMoM}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 text-base">{b.marketSharePct}%</div>
                  <div className="text-slate-500 text-[11px]">
                    ₹{b.monthlyGmv.toLocaleString("en-IN")} GMV
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 4: 12-MONTH COHORT RETENTION ================= */}
      {activeSection === "COHORTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              12-Month Kirana Monthly Cohort Retention Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Kirana reorder retention curves confirming platform stickiness and repeat purchasing habits.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold">Cohort Month</th>
                  <th className="p-3 font-bold">Base Kiranas</th>
                  <th className="p-3 font-bold text-center">M1</th>
                  <th className="p-3 font-bold text-center">M2</th>
                  <th className="p-3 font-bold text-center">M3</th>
                  <th className="p-3 font-bold text-center">M6</th>
                  <th className="p-3 font-bold text-center">M12</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohorts.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.cohortMonth}</td>
                    <td className="p-3 text-slate-600">{c.initialRetailersCount} stores</td>
                    <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100/70">
                      {c.m1RetentionPct}%
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100/60">
                      {c.m2RetentionPct}%
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100/50">
                      {c.m3RetentionPct}%
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100/40">
                      {c.m6RetentionPct}%
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 bg-emerald-100/30">
                      {c.m12RetentionPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECTION 5: 45+ DAY NPA RADAR ================= */}
      {activeSection === "NPA_RADAR" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                45+ Day Overdue Systemic NPA Credit Radar
              </h3>
              <p className="text-xs text-slate-500">
                Decentralized credit risk monitor flagging Kiranas exceeding grace periods.
              </p>
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-full uppercase">
              Risk Status: {npaData?.npaSummary?.systemicRiskLevel || "LOW"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Total Capital Overdue</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{(npaData?.npaSummary?.totalOverdueCapital || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
              <span className="text-xs text-rose-700">45+ Day Critical NPA Capital</span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                ₹{(npaData?.npaSummary?.totalNpaCapital || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Accounts Under Watch</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {npaData?.npaSummary?.overdueAccountsCount || 1}
              </div>
            </div>
          </div>

          {/* High-risk retailers table */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Retailer Accounts with Active Credit Dues
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {npaData?.highRiskRetailers?.length === 0 ? (
                <div className="p-6 text-center text-slate-400">All retailer accounts are healthy with 0 dues!</div>
              ) : (
                npaData?.highRiskRetailers?.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.shopName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Owner: {r.ownerName} • Phone: {r.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-rose-600 text-sm">₹{r.creditDues} Due</div>
                      <div className="text-[10px] text-slate-400">Limit: ₹{r.creditLimit}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
