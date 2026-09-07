"use client";

import React, { useState, useEffect } from "react";
import {
  FileCode,
  FileSpreadsheet,
  Download,
  Calendar,
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  RefreshCw,
  Landmark
} from "lucide-react";

interface TallyMargExportDeskProps {
  apiBase: string;
  organizationId?: string;
}

export default function TallyMargExportDesk({
  apiBase,
  organizationId = "org_anagata_fmcg"
}: TallyMargExportDeskProps) {
  const [aging, setAging] = useState<any | null>(null);
  const [pdcs, setPdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Cash Denomination State
  const [notes500, setNotes500] = useState(30);
  const [notes200, setNotes200] = useState(25);
  const [notes100, setNotes100] = useState(40);
  const [notes50, setNotes50] = useState(10);
  const totalReconciled = notes500 * 500 + notes200 * 200 + notes100 * 100 + notes50 * 50;

  useEffect(() => {
    fetchAging();
    fetchPdcs();
  }, [organizationId]);

  const fetchAging = async () => {
    try {
      const res = await fetch(`${apiBase}/api/accounting/aging-analysis?organizationId=${organizationId}`);
      const data = await res.json();
      if (data.success) setAging(data.aging);
    } catch {
      // Fallback
    }
  };

  const fetchPdcs = async () => {
    try {
      const res = await fetch(`${apiBase}/api/accounting/pdc-cheques`);
      const data = await res.json();
      if (data.success) setPdcs(data.cheques);
    } catch {
      // Fallback
    }
  };

  const updatePdcStatus = async (chequeId: string, status: "CLEARED" | "BOUNCED") => {
    try {
      const res = await fetch(`${apiBase}/api/accounting/pdc-cheques/${chequeId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, bounceReason: status === "BOUNCED" ? "Insufficient Funds" : undefined })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchPdcs();
        fetchAging();
      }
    } catch {
      setMessage("Failed to update cheque status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-stone-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Landmark className="w-4 h-4" />
            Financial Portability & ERP Integration
          </div>
          <h2 className="text-2xl font-bold">Tally Prime, Marg ERP & Financial Desk</h2>
          <p className="text-white/80 text-sm mt-1">
            Zero-cost standard exports for Tally XML and Marg CSV, debt aging brackets (0-90+ days), and post-dated cheque vault.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${apiBase}/api/accounting/tally-xml?organizationId=${organizationId}`}
            download
            className="px-4 py-2.5 bg-white text-orange-900 rounded-lg text-sm font-semibold hover:bg-orange-50 transition shadow flex items-center gap-2"
          >
            <FileCode className="w-4 h-4 text-orange-700" />
            Download Tally XML
          </a>
          <a
            href={`${apiBase}/api/accounting/marg-csv?organizationId=${organizationId}`}
            download
            className="px-4 py-2.5 bg-orange-950/80 border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-orange-950 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Marg CSV
          </a>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-amber-600 font-bold">×</button>
        </div>
      )}

      {/* Debt Aging Cards */}
      {aging && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-base">B2B Credit Receivables Aging Analysis</h3>
            <span className="text-xs text-gray-500">Total Outstanding: <strong className="text-gray-900 font-bold">₹{aging.totalOutstanding.toLocaleString("en-IN")}</strong></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <div className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px]">Current (0 - 30 Days)</div>
              <div className="text-xl font-bold text-emerald-900 mt-1">₹{aging.bracket_0_30.toLocaleString("en-IN")}</div>
              <div className="text-emerald-600 mt-1">Within regular credit cycle</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs">
              <div className="text-blue-700 font-semibold uppercase tracking-wider text-[10px]">Moderate (31 - 60 Days)</div>
              <div className="text-xl font-bold text-blue-900 mt-1">₹{aging.bracket_31_60.toLocaleString("en-IN")}</div>
              <div className="text-blue-600 mt-1">First follow-up sent via WhatsApp</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <div className="text-amber-700 font-semibold uppercase tracking-wider text-[10px]">Overdue (61 - 90 Days)</div>
              <div className="text-xl font-bold text-amber-900 mt-1">₹{aging.bracket_61_90.toLocaleString("en-IN")}</div>
              <div className="text-amber-600 mt-1">Credit hold recommended</div>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs">
              <div className="text-rose-700 font-semibold uppercase tracking-wider text-[10px]">Critical (90+ Days)</div>
              <div className="text-xl font-bold text-rose-900 mt-1">₹{aging.bracket_90_plus.toLocaleString("en-IN")}</div>
              <div className="text-rose-600 mt-1">Default notice dispatched</div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Dated Cheques (PDC) Vault */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Post-Dated Cheque (PDC) Vault & Maturity</h3>
            <p className="text-xs text-gray-500">Manage paper cheques collected by field agents with 1-click clearance or bounce penalty</p>
          </div>
          <button onClick={fetchPdcs} className="text-xs font-semibold text-orange-700 hover:text-orange-800">
            Refresh Cheques
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 font-semibold">
                <th className="p-3.5">Cheque # & Bank</th>
                <th className="p-3.5">Retailer Shop</th>
                <th className="p-3.5">Maturity Date</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pdcs.map((chq) => (
                <tr key={chq.id} className="hover:bg-gray-50 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900">{chq.chequeNumber}</div>
                    <div className="text-gray-500">{chq.bankName}</div>
                  </td>
                  <td className="p-3.5 text-gray-900 font-medium">{chq.retailerShopName}</td>
                  <td className="p-3.5 text-gray-600">{chq.chequeDate}</td>
                  <td className="p-3.5 text-right font-bold text-gray-900">₹{chq.amount.toLocaleString("en-IN")}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      chq.status === "CLEARED" ? "bg-emerald-100 text-emerald-800" :
                      chq.status === "BOUNCED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {chq.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {chq.status === "RECEIVED" && (
                      <>
                        <button
                          onClick={() => updatePdcStatus(chq.id, "CLEARED")}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                        >
                          Mark Cleared
                        </button>
                        <button
                          onClick={() => updatePdcStatus(chq.id, "BOUNCED")}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
                        >
                          Mark Bounced (+₹250)
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Denomination Handover Counter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">End-of-Day Physical Cash Denomination Counter</h3>
            <p className="text-xs text-gray-500">Calculate currency notes count before evening distributor safe deposit</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Reconciled Cash Handover</div>
            <div className="text-xl font-black text-orange-700">₹{totalReconciled.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">₹500 Notes (count)</label>
            <input
              type="number"
              value={notes500}
              onChange={(e) => setNotes500(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded font-bold"
            />
            <div className="text-gray-400 mt-1">= ₹{(notes500 * 500).toLocaleString("en-IN")}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">₹200 Notes (count)</label>
            <input
              type="number"
              value={notes200}
              onChange={(e) => setNotes200(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded font-bold"
            />
            <div className="text-gray-400 mt-1">= ₹{(notes200 * 200).toLocaleString("en-IN")}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">₹100 Notes (count)</label>
            <input
              type="number"
              value={notes100}
              onChange={(e) => setNotes100(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded font-bold"
            />
            <div className="text-gray-400 mt-1">= ₹{(notes100 * 100).toLocaleString("en-IN")}</div>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">₹50 Notes (count)</label>
            <input
              type="number"
              value={notes50}
              onChange={(e) => setNotes50(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded font-bold"
            />
            <div className="text-gray-400 mt-1">= ₹{(notes50 * 50).toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
