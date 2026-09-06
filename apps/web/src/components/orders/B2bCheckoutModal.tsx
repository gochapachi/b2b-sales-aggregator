"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Truck,
  FileText
} from "lucide-react";

interface B2bCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [skuId: string]: number };
  products: any[];
  retailerProfile: any | null;
  onConfirmOrder: (paymentTerm: string) => Promise<void>;
}

export default function B2bCheckoutModal({
  isOpen,
  onClose,
  cart,
  products,
  retailerProfile,
  onConfirmOrder
}: B2bCheckoutModalProps) {
  const [selectedTerm, setSelectedTerm] = useState<string>("NET_7");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Build itemized list and vendor groups
  const vendorGroups: { [orgName: string]: { org: any; items: any[]; subtotal: number; tax: number; total: number } } = {};
  let totalOrderAmount = 0;
  let totalVolumeSavings = 0;

  for (const [skuId, qty] of Object.entries(cart)) {
    if (qty <= 0) continue;

    let foundProd: any = null;
    let foundSku: any = null;

    for (const prod of products) {
      const sku = prod.skus.find((s: any) => s.id === skuId);
      if (sku) {
        foundProd = prod;
        foundSku = sku;
        break;
      }
    }

    if (!foundProd || !foundSku) continue;

    // Evaluate volume pricing slab
    let appliedPrice = foundSku.wholesalePrice;
    if (foundSku.pricingSlabs && foundSku.pricingSlabs.length > 0) {
      const eligibleSlabs = foundSku.pricingSlabs
        .filter((s: any) => qty >= s.minQuantity)
        .sort((a: any, b: any) => b.minQuantity - a.minQuantity);
      if (eligibleSlabs.length > 0) {
        appliedPrice = eligibleSlabs[0].pricePerUnit;
        const savingsPerUnit = foundSku.wholesalePrice - appliedPrice;
        totalVolumeSavings += savingsPerUnit * qty;
      }
    }

    const orgName = foundProd.organizationName;
    if (!vendorGroups[orgName]) {
      vendorGroups[orgName] = {
        org: { id: foundProd.organizationId, name: orgName, mov: foundProd.minimumOrderValue || 1500 },
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0
      };
    }

    const lineTotal = appliedPrice * qty;
    const lineTax = (lineTotal * foundProd.gstRatePct) / 100;

    vendorGroups[orgName].items.push({
      productName: foundProd.name,
      unitTitle: foundSku.unitTitle,
      qty,
      unitPrice: appliedPrice,
      baseWholesalePrice: foundSku.wholesalePrice,
      taxPct: foundProd.gstRatePct,
      lineTotal,
      lineTax
    });

    vendorGroups[orgName].subtotal += lineTotal;
    vendorGroups[orgName].tax += lineTax;
    vendorGroups[orgName].total += lineTotal + lineTax;
    totalOrderAmount += lineTotal + lineTax;
  }

  const creditLimit = retailerProfile?.creditLimit || 50000;
  const creditDues = retailerProfile?.creditDues || 14200;
  const availableCredit = Math.max(0, creditLimit - creditDues);
  const isCreditExceeded = (selectedTerm === "NET_7" || selectedTerm === "NET_15") && totalOrderAmount > availableCredit;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmOrder(selectedTerm);
      onClose();
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">B2B Checkout & Credit Line Routing</h3>
              <p className="text-xs text-slate-400">
                Udaan-style vendor sub-orders with automated GST billing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
          {/* Vendor Splitting Preview */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Multi-Vendor Sub-Orders ({Object.keys(vendorGroups).length} Sellers)</span>
              {totalVolumeSavings > 0 && (
                <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[11px]">
                  🎉 Volume Savings: ₹{totalVolumeSavings.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {Object.entries(vendorGroups).map(([orgName, group]) => {
              const meetsMov = group.total >= group.org.mov;
              return (
                <div key={orgName} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      {orgName}
                    </span>
                    <span>₹{Math.round(group.total).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="space-y-1 divide-y divide-slate-100">
                    {group.items.map((it, idx) => (
                      <div key={idx} className="pt-1 flex justify-between text-slate-600">
                        <span>
                          {it.productName} ({it.unitTitle}) x{it.qty}
                        </span>
                        <span>₹{Math.round(it.lineTotal).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {!meetsMov && (
                    <div className="p-2 bg-amber-50 text-amber-800 rounded border border-amber-200 font-semibold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      Requires ₹{group.org.mov} MOV from this seller (Current: ₹{Math.round(group.total)})
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Terms Selector */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Select B2B Settlement Term</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTerm === "NET_7"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-xs">Net-7 Credit Line</span>
                  <input
                    type="radio"
                    name="term"
                    value="NET_7"
                    checked={selectedTerm === "NET_7"}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="mt-0.5 text-indigo-600"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  7-Day repayment terms for active Kirana partners.
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTerm === "NET_15"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-xs">Net-15 Credit Line</span>
                  <input
                    type="radio"
                    name="term"
                    value="NET_15"
                    checked={selectedTerm === "NET_15"}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="mt-0.5 text-indigo-600"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  15-Day extended credit for high-volume retailers.
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTerm === "COD"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-xs">Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    name="term"
                    value="COD"
                    checked={selectedTerm === "COD"}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="mt-0.5 text-indigo-600"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Pay with physical cash or UPI upon delivery.
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTerm === "UPI_INSTANT"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-xs">Instant UPI / QR</span>
                  <input
                    type="radio"
                    name="term"
                    value="UPI_INSTANT"
                    checked={selectedTerm === "UPI_INSTANT"}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="mt-0.5 text-indigo-600"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Instant bank settlement without utilizing credit.
                </div>
              </label>
            </div>

            {/* Credit Line Status Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500">Available Credit Balance:</span>
                <div className="font-bold text-slate-900 text-sm">
                  ₹{availableCredit.toLocaleString("en-IN")}{" "}
                  <span className="text-slate-400 text-xs font-normal">/ ₹{creditLimit.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Current Dues:</span>
                <div className="font-bold text-amber-700">₹{creditDues.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <div>
              <div className="text-slate-500">Total Payable (incl. GST):</div>
              <div className="text-xl font-black text-slate-900">
                ₹{Math.round(totalOrderAmount).toLocaleString("en-IN")}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(vendorGroups).length === 0}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-xs flex items-center gap-2 transition"
            >
              <Truck className="w-4 h-4" />
              {isSubmitting ? "Placing Order..." : "Confirm & Dispatch Bill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
