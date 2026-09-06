"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, FileText, Building2, MapPin, Phone, Shield } from "lucide-react";

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailer: {
    id: string;
    shopName: string;
    ownerName: string;
    phone: string;
    gstin?: string;
    panOrUdyam?: string;
    documentType: string;
    kycDocUrl?: string;
    shopPhotoUrl?: string;
    address: string;
    city: string;
    pincode: string;
  } | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export default function KycVerificationModal({
  isOpen,
  onClose,
  retailer,
  onApprove,
  onReject
}: KycVerificationModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !retailer) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(retailer.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setLoading(true);
    try {
      await onReject(retailer.id, rejectReason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg">B2B KYC Verification Review</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold"
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">Shop Details</div>
              <div className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {retailer.shopName}
              </div>
              <div className="text-sm text-slate-600 mt-1">Owner: {retailer.ownerName}</div>
              <div className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {retailer.phone}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">Business Identification</div>
              <div className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                {retailer.documentType}: {retailer.gstin || retailer.panOrUdyam || "Not Specified"}
              </div>
              <div className="text-sm text-slate-600 flex items-center gap-1 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {retailer.address}, {retailer.city} - {retailer.pincode}
              </div>
            </div>
          </div>

          {/* Document & Storefront Photo Preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-3">Submitted Evidence</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">Storefront Photograph:</div>
                <img
                  src={retailer.shopPhotoUrl || "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500"}
                  alt="Storefront"
                  className="w-full h-36 object-cover rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">GST / Business Certificate:</div>
                <div className="w-full h-36 bg-white border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-3 text-center">
                  <FileText className="w-8 h-8 text-indigo-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Official Document On File</span>
                  <a
                    href={retailer.kycDocUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 underline font-medium mt-1"
                  >
                    View Original Certificate
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection input */}
          {isRejecting && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-rose-600">Rejection Reason</label>
              <input
                type="text"
                placeholder="E.g., Invalid GST certificate format or address mismatch"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          {!isRejecting ? (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
              >
                Reject Application
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApprove}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? "Approving..." : "Approve & Unlock Prices"}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading || !rejectReason}
                onClick={handleReject}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
              >
                {loading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
