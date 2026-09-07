"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Truck,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface EWayBillNicModalProps {
  apiBase: string;
  subOrderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EWayBillNicModal({
  apiBase,
  subOrderId,
  isOpen,
  onClose
}: EWayBillNicModalProps) {
  const [payload, setPayload] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && subOrderId) {
      setLoading(true);
      setError(null);
      fetch(`${apiBase}/api/orders/eway-bill-payload/${subOrderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setPayload(data.payload);
          } else {
            setError(data.error || "Failed to generate E-Way bill payload");
          }
        })
        .catch(() => setError("Network error generating E-Way bill data"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, subOrderId, apiBase]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (payload?.formattedCopyText) {
      navigator.clipboard.writeText(payload.formattedCopyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadJson = () => {
    if (payload) {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EWayBill_Payload_${payload.invoiceNumber || subOrderId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black tracking-wider uppercase">
                Government NIC Portal Compliant
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                Rule 138 of CGST Rules
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              E-Way Bill Entry Payload (Sub-Order #{subOrderId.slice(-6)})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy-paste formatted consignment data directly into the National Informatics Centre (NIC) portal.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Generating NIC portal payload...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : payload ? (
          <div className="space-y-4">
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center justify-between">
              <span className="text-xs font-bold text-slate-700">1-Click NIC Portal Transfer:</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied All Fields!" : "Copy Payload for NIC Portal"}
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
                <a
                  href="https://ewaybillgst.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <span>Open NIC Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Consignment Valuation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Doc Number</span>
                <strong className="text-xs font-mono font-black text-slate-900">{payload.invoiceNumber}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Taxable Subtotal</span>
                <strong className="text-xs font-bold text-slate-900">₹{payload.totalTaxableValue?.toFixed(2)}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CGST + SGST</span>
                <strong className="text-xs font-bold text-slate-900">
                  ₹{(payload.totalCgstAmount + payload.totalSgstAmount)?.toFixed(2)}
                </strong>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Invoice Grand Total</span>
                <strong className="text-xs font-black text-emerald-900">₹{payload.totalInvoiceValue?.toFixed(2)}</strong>
              </div>
            </div>

            {/* Part A & Part B Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-950 block text-[11px] uppercase tracking-wider">
                  Part A: Consignor (Supplier)
                </span>
                <div>Legal: <strong>{payload.sellerDetails?.legalName}</strong></div>
                <div>GSTIN: <strong className="font-mono">{payload.sellerDetails?.gstin}</strong></div>
                <div className="text-slate-500">From: {payload.sellerDetails?.address}</div>
                <div>State Code: <strong>{payload.sellerDetails?.stateCode} (Uttar Pradesh)</strong></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-950 block text-[11px] uppercase tracking-wider">
                  Part A: Consignee (Recipient)
                </span>
                <div>Trade Name: <strong>{payload.buyerDetails?.tradeName}</strong></div>
                <div>Owner/Legal: <strong>{payload.buyerDetails?.legalName}</strong></div>
                <div>GSTIN: <strong className="font-mono">{payload.buyerDetails?.gstin}</strong></div>
                <div className="text-slate-500">To: {payload.buyerDetails?.address}, {payload.buyerDetails?.place}</div>
              </div>
            </div>

            {/* Part B Transport */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-indigo-950 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  Part B: Transport Details (Ready for Dispatch)
                </span>
                <div className="text-slate-600 mt-0.5">
                  Vehicle No: <strong className="font-mono">{payload.transporterDetails?.vehicleNumber}</strong> • Approx Distance:{" "}
                  <strong>{payload.transporterDetails?.approxDistanceKm} KM</strong> • Mode: Road (1)
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                Valid for Transport
              </span>
            </div>

            {/* Copy-Paste Preformatted Text Box */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  NIC Portal Copy-Paste Format (Plain Text):
                </label>
                {copied && <span className="text-xs font-bold text-emerald-600">Copied to clipboard!</span>}
              </div>
              <textarea
                readOnly
                rows={7}
                value={payload.formattedCopyText}
                className="w-full font-mono text-[11px] p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 select-all focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
