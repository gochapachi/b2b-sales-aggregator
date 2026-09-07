"use client";

import React, { useState, useEffect } from "react";
import {
  PackageCheck,
  Building2,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  Receipt,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  Percent,
  Download,
  Printer
} from "lucide-react";
import SlideOverDrawer from "../common/SlideOverDrawer";

export interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
  orderId?: string | null;
  role?: "SELLER" | "ADMIN" | "RETAILER";
  userRole?: "SELLER" | "ADMIN" | "RETAILER" | string;
  apiBase: string;
  onDispatch?: (subOrderId: string) => Promise<void> | void;
  onVerifyOtp?: (subOrderId: string) => void;
  onOpenGstInvoice?: (subOrderId: string) => void;
  onOpenEWayBill?: (subOrderId: string) => void;
  onOrderUpdated?: () => void;
}

export default function OrderDetailsDrawer({
  isOpen,
  onClose,
  order: initialOrder,
  orderId,
  role = "SELLER",
  userRole,
  apiBase,
  onDispatch,
  onVerifyOtp,
  onOpenGstInvoice,
  onOpenEWayBill,
  onOrderUpdated
}: OrderDetailsDrawerProps) {
  const [detailedOrder, setDetailedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const effectiveRole = userRole || role;
  const targetId = orderId || initialOrder?.id;

  // Fetch complete details from GET /api/orders/:id when opened
  useEffect(() => {
    if (isOpen && targetId && apiBase) {
      setLoading(true);
      fetch(`${apiBase}/api/orders/${targetId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.order) {
            setDetailedOrder(res.order);
          } else {
            setDetailedOrder(initialOrder || null);
          }
        })
        .catch(() => {
          setDetailedOrder(initialOrder || null);
        })
        .finally(() => setLoading(false));
    } else if (isOpen) {
      setDetailedOrder(initialOrder || null);
    }
  }, [isOpen, targetId, initialOrder, apiBase]);

  // 6-second live polling while drawer is open
  useEffect(() => {
    if (isOpen && targetId && apiBase) {
      const interval = setInterval(() => {
        fetch(`${apiBase}/api/orders/${targetId}`)
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.order) {
              setDetailedOrder(res.order);
            }
          })
          .catch(() => {});
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen, targetId, apiBase]);

  const ord = detailedOrder || initialOrder;

  if (!isOpen || !ord) return null;

  const currentStatus = ord.status || "RECEIVED";
  const items = ord.items || ord.subOrders?.flatMap((so: any) => so.items || []) || [];
  const grandTotal = ord.grandTotal || ord.totalAmount || 0;
  const subtotal = ord.subtotal || ord.itemsPrice || Math.round(grandTotal / 1.18);
  const taxAmount = ord.taxAmount || (grandTotal - subtotal);
  const subOrderId = ord.subOrderId || ord.id;
  const masterNumber = ord.masterOrderNumber || ord.orderNumber || ord.masterOrderId || ord.id;
  const shopName = ord.retailerShopName || ord.storeName || ord.buyer?.shopName || "Kirana Store";
  const ownerName = ord.retailerOwnerName || ord.ownerName || ord.buyer?.ownerName || "Store Proprietor";
  const phone = ord.retailerPhone || ord.phone || ord.buyer?.phone || "9876543210";
  const address = ord.retailerAddress || ord.deliveryAddress || ord.address || "Hazratganj Main Market, Lucknow, UP";
  const lat = ord.retailerLatitude || ord.lat || 26.8520;
  const lng = ord.retailerLongitude || ord.lng || 80.9510;
  const paymentTerm = ord.paymentTerm || ord.paymentTerms || "NET_7";
  const paymentStatus = ord.paymentStatus || "UNPAID";
  const deliveryOtp = ord.deliveryOtp || ord.otp || "";
  const transitMinutes = ord.transitMinutes || ord.deliveryDurationMinutes || null;

  // 5-stage timeline configuration
  const stages = [
    { key: "RECEIVED", label: "Order Placed", desc: "Received at wholesale hub" },
    { key: "ACCEPTED", label: "Accepted", desc: "Inventory locked" },
    { key: "PACKED", label: "Packed", desc: "Batch & HSN verified" },
    { key: "DISPATCHED", label: "Dispatched", desc: "Out for delivery" },
    { key: "DELIVERED", label: "Delivered", desc: "OTP verified & received" }
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return 0;
      case "ACCEPTED":
        return 1;
      case "PACKED":
        return 2;
      case "DISPATCHED":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(currentStatus);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PACKED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ACCEPTED":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "RECEIVED":
      case "PENDING":
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const handleDispatchClick = async () => {
    if (!onDispatch) return;
    setActionLoading(true);
    try {
      await onDispatch(subOrderId);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-3xl"
      icon={PackageCheck}
      title={
        <div className="flex items-center gap-2.5">
          <span>Order Details</span>
          <span className="font-mono text-sm px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            #{masterNumber}
          </span>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
              currentStatus
            )}`}
          >
            {currentStatus}
          </span>
        </div>
      }
      subtitle={`Sub-Order ID: ${subOrderId} • Created: ${
        ord.createdAt ? new Date(ord.createdAt).toLocaleString("en-IN") : "Today"
      }`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenGstInvoice && (
              <button
                type="button"
                onClick={() => onOpenGstInvoice(subOrderId)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 transition"
              >
                <Receipt className="w-3.5 h-3.5" />
                GST Tax Invoice
              </button>
            )}
            {onOpenEWayBill && (
              <button
                type="button"
                onClick={() => onOpenEWayBill(subOrderId)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                E-Way Bill NIC
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {effectiveRole === "SELLER" && currentStatus === "RECEIVED" && onDispatch && (
              <button
                type="button"
                onClick={handleDispatchClick}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Truck className="w-3.5 h-3.5" />
                )}
                Dispatch & Send OTP
              </button>
            )}

            {effectiveRole === "SELLER" && currentStatus === "DISPATCHED" && onVerifyOtp && (
              <button
                type="button"
                onClick={() => onVerifyOtp(subOrderId)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Verify Retailer OTP
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      {/* 5-Stage Fulfillment Timeline */}
      <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            5-Stage Live Fulfillment Timeline
          </h4>
          {transitMinutes && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Transit: {transitMinutes} mins
            </span>
          )}
        </div>

        <div className="relative">
          {/* Progress bar line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-indigo-600 transition-all duration-500 -z-0"
            style={{ width: `${(currentStageIndex / 4) * 100}%` }}
          />

          <div className="grid grid-cols-5 gap-2 relative z-10">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? "bg-indigo-600 text-white shadow-sm"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900 animate-pulse"
                        : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 leading-tight ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isPast
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block mt-0.5">
                    {stage.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prominent Delivery OTP Card if dispatched */}
        {deliveryOtp && (currentStatus === "DISPATCHED" || currentStatus === "RECEIVED") && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  4-Digit Driver Delivery OTP
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Share with delivery personnel upon physical carton inspection
                </div>
              </div>
            </div>
            <div className="font-mono text-xl font-black tracking-widest text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-lg border border-emerald-300 shadow-sm">
              {deliveryOtp}
            </div>
          </div>
        )}
      </div>

      {/* Buyer & Store KYC Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {shopName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proprietor: <span className="font-medium text-slate-700 dark:text-slate-300">{ownerName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              GST Verified
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Terms: {paymentTerm}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Phone: <strong className="font-mono text-slate-900 dark:text-white">{phone}</strong>
              </span>
              <a
                href={`https://wa.me/91${phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-bold ml-1 text-[11px]"
              >
                WhatsApp &rarr;
              </a>
            </div>

            <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>{address}</span>
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">OpenStreetMap GPS:</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-semibold text-indigo-600 hover:underline flex items-center gap-1 text-[11px]"
              >
                {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span
                className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                  paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Ordered Line Items ({items.length})
          </h4>
          <span className="text-[11px] text-slate-500">All prices in INR (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 px-4">SKU / Item</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Wholesale Rate</th>
                <th className="py-2.5 px-4 text-center">GST %</th>
                <th className="py-2.5 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No items in this order.
                  </td>
                </tr>
              ) : (
                items.map((it: any, idx: number) => {
                  const qty = it.quantity || it.qty || 1;
                  const unitRate = it.unitPrice || it.wholesalePrice || it.price || 0;
                  const lineTotal = it.totalPrice || it.lineTotal || (qty * unitRate);
                  const gst = it.gstRatePct || 18;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {it.productName || it.name || "Master Wholesale SKU"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {it.skuCode || it.productSkuId || it.id || "SKU-AUTO"} • {it.unitTitle || it.brand || "FMCG"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {qty}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        ₹{Number(unitRate).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] text-slate-600 dark:text-slate-400">
                          {gst}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                        ₹{Number(lineTotal).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <div className="w-72 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxable Subtotal:</span>
              <span className="font-mono">₹{Number(subtotal).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Estimated GST (CGST + SGST):</span>
              <span className="font-mono">₹{Number(taxAmount).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Hyperlocal Delivery:</span>
              <span className="text-emerald-600 font-bold">FREE (0% Platform Fee)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{Number(grandTotal).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SlideOverDrawer>
  );
}
