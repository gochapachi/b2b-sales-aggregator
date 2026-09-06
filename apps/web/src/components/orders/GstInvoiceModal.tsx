"use client";

import React from "react";
import { X, Printer, CheckCircle2, QrCode, FileText, Building2, ShieldCheck } from "lucide-react";

interface GstInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

export default function GstInvoiceModal({ isOpen, onClose, invoice }: GstInvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">GST Tax Invoice</h3>
              <p className="text-xs text-slate-300">
                Invoice No: <span className="font-mono text-amber-300">{invoice.invoiceNumber}</span> • Order #{invoice.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Top Header & IRN Details */}
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider mb-2">
                Tax Invoice (Rule 46 of CGST Rules, 2017)
              </div>
              <h2 className="text-lg font-bold text-slate-900">{invoice.seller?.name}</h2>
              <div className="text-slate-600">{invoice.seller?.tradeName}</div>
              <div className="text-slate-500 mt-1">{invoice.seller?.address}</div>
              <div className="mt-1 font-semibold text-slate-700">
                GSTIN: <span className="font-mono text-indigo-900">{invoice.seller?.gstin}</span> • State Code: 09 (UP)
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-xs text-slate-500">Invoice Date:</div>
              <div className="font-bold text-slate-900 text-sm">
                {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </div>
              <div className="pt-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded text-xs">
                  Payment Term: {invoice.paymentTerm}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono break-all pt-1">
                IRN: {invoice.irn || "8f3ba792d4ef01..."}
              </div>
            </div>
          </div>

          {/* Buyer & Bill-To Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wide text-indigo-700 mb-1">
                Billed To (Retailer / Kirana Store)
              </div>
              <div className="font-bold text-sm text-slate-900">{invoice.buyer?.shopName}</div>
              <div className="text-slate-600">Proprietor: {invoice.buyer?.ownerName}</div>
              <div className="text-slate-600">{invoice.buyer?.address}</div>
              <div className="text-slate-500 mt-1">Phone / WhatsApp: {invoice.buyer?.phone}</div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-slate-500">Buyer Identification:</div>
              <div className="font-mono font-bold text-slate-800">
                GSTIN: {invoice.buyer?.gstin || "URP (Unregistered Dealer)"}
              </div>
              {invoice.buyer?.pan && (
                <div className="font-mono text-slate-600 text-[11px]">PAN/Udyam: {invoice.buyer?.pan}</div>
              )}
              <div className="text-slate-600">Place of Supply: Uttar Pradesh (State Code: 09)</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">HSN Code</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 text-right">CGST</th>
                  <th className="py-2.5 px-3 text-right">SGST</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items?.map((it: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{it.itemDescription}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{it.hsnCode}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right">₹{it.rate?.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">₹{it.taxableValue?.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {it.cgstRate}% (₹{it.cgstAmount})
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {it.sgstRate}% (₹{it.sgstAmount})
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{it.totalAmount?.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary & Payment QR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  E-Invoice Digital Verification
                </div>
                <p className="text-[11px] text-slate-500">
                  Digitally signed with B2B Aggregator Private Key. Scannable by GST officers and tax auditors.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  <div>UPI Payee: {invoice.seller?.name}</div>
                  <div>Settlement: {invoice.paymentTerm}</div>
                  <div className="text-emerald-700 font-bold mt-0.5">Verified Genuine GSTIN</div>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold">₹{invoice.taxableSubtotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total CGST:</span>
                <span className="font-semibold">₹{invoice.cgstTotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total SGST:</span>
                <span className="font-semibold">₹{invoice.sgstTotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Invoice Grand Total:</span>
                <span className="text-base text-indigo-700 font-black">
                  ₹{invoice.grandTotal?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2">
            This is a computer generated invoice registered on the National B2B Sales Aggregator Platform. No physical signature required.
          </div>
        </div>
      </div>
    </div>
  );
}
