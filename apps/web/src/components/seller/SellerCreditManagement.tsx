"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Receipt,
  FileText,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Lock,
  Unlock,
  Eye
} from "lucide-react";

interface SellerCreditManagementProps {
  apiBase: string;
  organizationId?: string;
}

export default function SellerCreditManagement({
  apiBase,
  organizationId = "org_anagata_fmcg"
}: SellerCreditManagementProps) {
  const [creditLines, setCreditLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Credit Line Modal
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLimit, setEditLimit] = useState(50000);
  const [editPaymentTerm, setEditPaymentTerm] = useState("NET_7");
  const [editGraceDays, setEditGraceDays] = useState(3);
  const [editNotes, setEditNotes] = useState("");

  // Record Voucher Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherRetailerId, setVoucherRetailerId] = useState("");
  const [voucherAmount, setVoucherAmount] = useState(10000);
  const [voucherMode, setVoucherMode] = useState<"CASH" | "CHEQUE" | "BANK_TRANSFER" | "DIRECT_SELLER_UPI">("CHEQUE");
  const [voucherRef, setVoucherRef] = useState("");
  const [voucherBank, setVoucherBank] = useState("HDFC Bank Ltd");
  const [voucherChequeDate, setVoucherChequeDate] = useState(new Date().toISOString().split("T")[0]);
  const [voucherNotes, setVoucherNotes] = useState("");

  // Ledger Statement Modal
  const [statement, setStatement] = useState<any | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementLoading, setStatementLoading] = useState(false);

  const loadCreditLines = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/seller/credit-lines?organizationId=${organizationId}`).then((r) => r.json());
      if (res.success) {
        setCreditLines(res.creditLines || []);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load seller credit lines" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreditLines();
  }, [organizationId]);

  const handleToggleHold = async (lineId: string) => {
    try {
      const res = await fetch(`${apiBase}/api/seller/credit-lines/${lineId}/hold`, {
        method: "POST"
      }).then((r) => r.json());

      if (res.success) {
        setMessage({ type: "success", text: res.message });
        loadCreditLines();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update status" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error updating credit hold status" });
    }
  };

  const handleSaveCreditLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLine) return;

    try {
      const res = await fetch(`${apiBase}/api/seller/credit-lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          retailerId: selectedLine.retailerId,
          creditLimit: Number(editLimit),
          paymentTerm: editPaymentTerm,
          creditGraceDays: Number(editGraceDays),
          notes: editNotes
        })
      }).then((r) => r.json());

      if (res.success) {
        setMessage({ type: "success", text: "Retailer credit terms updated successfully" });
        setShowEditModal(false);
        loadCreditLines();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save credit terms" });
      }
    } catch {
      setMessage({ type: "error", text: "Error updating credit line" });
    }
  };

  const handleRecordVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherRetailerId || !voucherAmount) {
      setMessage({ type: "error", text: "Retailer and amount are required" });
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/payments/record-voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          retailerId: voucherRetailerId,
          amount: Number(voucherAmount),
          paymentMode: voucherMode,
          referenceNumber: voucherRef,
          bankName: voucherBank,
          chequeDate: voucherChequeDate,
          notes: voucherNotes
        })
      }).then((r) => r.json());

      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setShowVoucherModal(false);
        setVoucherRef("");
        loadCreditLines();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to record voucher" });
      }
    } catch {
      setMessage({ type: "error", text: "Error recording payment voucher" });
    }
  };

  const handleViewStatement = async (retailerId: string) => {
    setStatementLoading(true);
    setShowStatementModal(true);
    try {
      const res = await fetch(
        `${apiBase}/api/ledger/statement?organizationId=${organizationId}&retailerId=${retailerId}`
      ).then((r) => r.json());
      if (res.success) {
        setStatement(res.statement);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load ledger statement" });
    } finally {
      setStatementLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold text-xs border border-indigo-400/30">
              Decentralized Credit Architecture
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-400/30">
              Zero Payment Gateway • Pure Ledger
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2 tracking-tight">Seller-Controlled Retailer Credit Lines</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            You determine custom credit limits and settlement periods (COD, Net-7, Net-15, Net-30) for each kirana.
            Track offline collections, cheques, bank NEFT, and direct UPI without third-party fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCreditLines}
            disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/10"
            title="Refresh Credit Lines"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              if (creditLines.length > 0) setVoucherRetailerId(creditLines[0].retailerId);
              setShowVoucherModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Receipt className="w-4 h-4" />
            Record Payment Voucher
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Credit Lines Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Active Retailer Credit Portfolios ({creditLines.length})
          </h3>
          <span className="text-xs text-slate-500">Autonomous credit hold enforcement on delinquency</span>
        </div>

        <div className="divide-y divide-slate-100">
          {creditLines.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No credit lines configured yet.</div>
          ) : (
            creditLines.map((line) => {
              const utilPct = line.creditLimit > 0 ? Math.round((line.currentDues / line.creditLimit) * 100) : 0;
              const isHold = line.status === "CREDIT_HOLD";

              return (
                <div key={line.id} className="p-6 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{line.retailerShopName}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            isHold
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {line.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {line.paymentTerm}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Grace Period: <strong>{line.creditGraceDays} days</strong> • Notes: {line.notes || "Standard B2B credit line"}
                      </p>

                      {/* Credit Utilization Bar */}
                      <div className="mt-3 max-w-md">
                        <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                          <span>
                            Dues: <strong className="text-slate-900">₹{line.currentDues?.toLocaleString("en-IN")}</strong>
                          </span>
                          <span>
                            Available: <strong className="text-emerald-700">₹{line.availableCredit?.toLocaleString("en-IN")}</strong>
                          </span>
                          <span>Limit: ₹{line.creditLimit?.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              utilPct > 85 ? "bg-red-500" : utilPct > 60 ? "bg-amber-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${Math.min(100, utilPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleToggleHold(line.id)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition ${
                          isHold
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {isHold ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {isHold ? "Release Hold" : "Enforce Credit Hold"}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLine(line);
                          setEditLimit(line.creditLimit);
                          setEditPaymentTerm(line.paymentTerm);
                          setEditGraceDays(line.creditGraceDays);
                          setEditNotes(line.notes || "");
                          setShowEditModal(true);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                      >
                        Configure Limit & Terms
                      </button>

                      <button
                        onClick={() => handleViewStatement(line.retailerId)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Running Ledger
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Terms Modal */}
      {showEditModal && selectedLine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Configure Credit Terms: {selectedLine.retailerShopName}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreditLine} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  required
                  value={editLimit}
                  onChange={(e) => setEditLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Payment Term</label>
                <select
                  value={editPaymentTerm}
                  onChange={(e) => setEditPaymentTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="COD">COD (Cash on Delivery)</option>
                  <option value="NET_7">NET_7 (7 Days Grace)</option>
                  <option value="NET_15">NET_15 (15 Days Grace)</option>
                  <option value="NET_30">NET_30 (30 Days Grace)</option>
                  <option value="NET_45">NET_45 (45 Days Grace)</option>
                  <option value="WEEKLY_SETTLEMENT">WEEKLY_SETTLEMENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overdue Grace Period (Days)</label>
                <input
                  type="number"
                  value={editGraceDays}
                  onChange={(e) => setEditGraceDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Reliable kirana, verified bank statement..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg">
                  Save Credit Terms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Payment Voucher</h3>
                <p className="text-xs text-slate-500">Record direct offline payment & update retailer ledger</p>
              </div>
              <button onClick={() => setShowVoucherModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordVoucher} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Retailer</label>
                <select
                  value={voucherRetailerId}
                  onChange={(e) => setVoucherRetailerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                >
                  {creditLines.map((c) => (
                    <option key={c.retailerId} value={c.retailerId}>
                      {c.retailerShopName} (Dues: ₹{c.currentDues})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount Collected (₹) *</label>
                  <input
                    type="number"
                    required
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={voucherMode}
                    onChange={(e) => setVoucherMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="CASH">Physical Cash</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="BANK_TRANSFER">Direct NEFT / RTGS</option>
                    <option value="DIRECT_SELLER_UPI">Direct Seller UPI QR Scan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ref / Cheque / UTR #</label>
                  <input
                    type="text"
                    value={voucherRef}
                    onChange={(e) => setVoucherRef(e.target.value)}
                    placeholder="e.g. CHQ-991240 / UTR-092831"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                {voucherMode === "CHEQUE" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={voucherBank}
                      onChange={(e) => setVoucherBank(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={voucherChequeDate}
                      onChange={(e) => setVoucherChequeDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Notes</label>
                <input
                  type="text"
                  value={voucherNotes}
                  onChange={(e) => setVoucherNotes(e.target.value)}
                  placeholder="e.g. Cleared August invoice balance"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 border text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow">
                  Record Voucher & Credit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Running Ledger Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Running Ledger Statement: {statement?.retailerShopName}
                </h3>
                <p className="text-xs text-slate-500">
                  Seller: {statement?.organizationName} • Limit: ₹{statement?.creditLimit?.toLocaleString("en-IN")} • Term: {statement?.paymentTerm}
                </p>
              </div>
              <button onClick={() => setShowStatementModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {statementLoading ? (
              <div className="py-12 text-center text-slate-400">Loading ledger reconciliation...</div>
            ) : !statement || statement.entries?.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No ledger entries recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoiced (Debits)</span>
                    <strong className="text-base font-black text-slate-900">₹{statement.totalInvoiced?.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Paid (Credits)</span>
                    <strong className="text-base font-black text-emerald-800">₹{statement.totalPaid?.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 block">Outstanding Balance</span>
                    <strong className="text-base font-black text-indigo-900">₹{statement.outstandingBalance?.toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                {/* Entries Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Reference #</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Debit (Invoice)</th>
                        <th className="p-3 text-right">Credit (Voucher)</th>
                        <th className="p-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statement.entries.map((e: any) => (
                        <tr key={e.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                e.type === "INVOICE"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {e.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] font-bold text-slate-700">{e.referenceNumber}</td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">{e.description}</td>
                          <td className="p-3 text-right font-semibold text-slate-800">
                            {e.debit > 0 ? `₹${e.debit?.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="p-3 text-right font-semibold text-emerald-700">
                            {e.credit > 0 ? `₹${e.credit?.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">
                            ₹{e.runningBalance?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowStatementModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
