"use client";

import React, { useState } from "react";
import { KeyRound, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react";

interface DeliveryOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  subOrder: {
    id: string;
    masterOrderNumber?: string;
    retailerShopName?: string;
    retailerPhone?: string;
    grandTotal: number;
    status: string;
    dispatchTime?: string;
  } | null;
  onVerify: (subOrderId: string, enteredOtp: string, deliveryBoyName: string) => Promise<{ success: boolean; transitDurationMinutes?: number }>;
}

export default function DeliveryOtpModal({
  isOpen,
  onClose,
  subOrder,
  onVerify
}: DeliveryOtpModalProps) {
  const [otp, setOtp] = useState("");
  const [deliveryBoy, setDeliveryBoy] = useState("Ramu Delivery Partner");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successResult, setSuccessResult] = useState<{ transitDurationMinutes?: number } | null>(null);

  if (!isOpen || !subOrder) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setErrorMsg("Please enter the complete 4-digit Delivery OTP");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const result = await onVerify(subOrder.id, otp, deliveryBoy);
      if (result.success) {
        setSuccessResult(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Delivery Hand-Off Verification</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!successResult ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm">
                <div className="font-bold text-slate-800">{subOrder.retailerShopName}</div>
                <div className="text-xs text-slate-500 mt-0.5">Order #{subOrder.masterOrderNumber}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600">Amount Payable (COD/UPI):</span>
                  <span className="font-bold text-slate-900 text-base">
                    ₹{subOrder.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Executive Name
                </label>
                <input
                  type="text"
                  value={deliveryBoy}
                  onChange={(e) => setDeliveryBoy(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4-Digit Customer Delivery OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full text-center tracking-widest text-2xl font-black py-2.5 border-2 border-indigo-200 focus:border-indigo-600 rounded-lg focus:outline-none bg-indigo-50/40 text-indigo-950"
                />
                <p className="text-xs text-slate-500 mt-1 text-center">
                  Ask the shop owner for the 4-digit code sent to their WhatsApp.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
              >
                {loading ? "Verifying..." : "Confirm Delivery & Log Transit Time"}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-slate-900">Delivery Confirmed!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Proof of Delivery verified. An automated WhatsApp receipt has been sent to the retailer.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 inline-flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Clock className="w-4 h-4" />
                Transit Duration: {successResult.transitDurationMinutes || 1} minutes
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
