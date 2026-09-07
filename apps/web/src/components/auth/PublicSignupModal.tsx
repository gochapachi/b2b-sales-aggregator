"use client";

import React, { useState } from "react";
import {
  Building2,
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  Navigation
} from "lucide-react";

interface PublicSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  initialRole?: "RETAILER" | "SELLER";
}

export default function PublicSignupModal({
  isOpen,
  onClose,
  apiBase,
  initialRole = "RETAILER"
}: PublicSignupModalProps) {
  const [role, setRole] = useState<"RETAILER" | "SELLER">(initialRole);
  const [submitting, setSubmitting] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    city: "Lucknow",
    pincode: "226001",
    latitude: 26.8467,
    longitude: 80.9462,
    documentType: "GSTIN",
    documentNumber: "",
    documentUrl: "",
    shopPhotoUrl: "",
    password: ""
  });

  if (!isOpen) return null;

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        }));
        setDetectingGps(false);
      },
      (err) => {
        alert("GPS Error: " + err.message + ". Using central Lucknow coordinates.");
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch(`${apiBase}/api/kyc/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64,
            fileName: file.name,
            mimeType: file.type,
            bucketType: "DOCS"
          })
        }).then((r) => r.json());

        if (res.success) {
          setFormData((prev) => ({ ...prev, documentUrl: res.documentUrl }));
          alert(`Document '${file.name}' uploaded to MinIO storage successfully!`);
        } else {
          alert("Upload failed: " + (res.error || "Server error"));
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert("Failed to read file: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const endpoint = role === "RETAILER" ? `${apiBase}/api/signup/retailer` : `${apiBase}/api/signup/seller`;
      const payload = role === "RETAILER"
        ? {
            storeName: formData.businessName,
            ownerName: formData.ownerName,
            phone: formData.phone,
            whatsappNumber: formData.whatsappNumber || formData.phone,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            latitude: formData.latitude,
            longitude: formData.longitude,
            documentType: formData.documentType,
            documentNumber: formData.documentNumber,
            documentUrl: formData.documentUrl,
            password: formData.password
          }
        : {
            companyName: formData.businessName,
            tradeName: formData.businessName,
            ownerName: formData.ownerName,
            phone: formData.phone,
            whatsappNumber: formData.whatsappNumber || formData.phone,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            latitude: formData.latitude,
            longitude: formData.longitude,
            documentType: formData.documentType,
            gstin: formData.documentNumber,
            documentUrl: formData.documentUrl,
            password: formData.password
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && (data.success || data.status === "PENDING_APPROVAL" || data.applicationId)) {
        setSubmittedApp(data);
      } else {
        setErrorMsg(data.message || data.error || "Registration failed. Please verify details.");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> B2B Merchant Registration Portal
            </span>
            <h3 className="text-xl font-black mt-1">Apply for B2B Wholesale Account</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit your trade KYC for 0% commission wholesale procurement or seller distribution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {submittedApp ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                Status: PENDING_APPROVAL
              </span>
              <h4 className="text-2xl font-black text-slate-900 mt-3">
                Application Queued for Verification!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                Thank you, <strong>{formData.ownerName}</strong>! Your application for <strong>{formData.businessName}</strong> has been submitted to the Super Admin KYC desk.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Phone:</span>
                <strong className="text-slate-900">{formData.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <strong className="text-slate-900">{formData.documentType} ({formData.documentNumber || "Provided"})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Territory:</span>
                <strong className="text-slate-900">{formData.city} (PIN: {formData.pincode})</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-600">
                🚀 An automated WhatsApp alert with your permanent Login ID and credentials will be sent to <strong>{formData.phone}</strong> as soon as an admin approves your profile.
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Done & Return to Store
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Account Type Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole("RETAILER")}
                className={`py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition ${
                  role === "RETAILER" ? "bg-white text-indigo-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store className="w-4 h-4 text-indigo-600" /> Kirana Retailer
              </button>
              <button
                type="button"
                onClick={() => setRole("SELLER")}
                className={`py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition ${
                  role === "SELLER" ? "bg-white text-indigo-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="w-4 h-4 text-purple-600" /> Wholesale Distributor / Seller
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {role === "RETAILER" ? "Kirana / Shop Name *" : "Company / Wholesale Trade Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === "RETAILER" ? "e.g. Laxmi General Store" : "e.g. Awadh FMCG Distributors"}
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proprietor / Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile / Login Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">WhatsApp Notification Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="For invoice & OTP alerts"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Store / Godown Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Shop No., Street, Landmark, Market Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Postal PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Geolocation Capture */}
              <div className="md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" /> OpenStreetMap Geolocation Coordinates
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Latitude: <strong>{formData.latitude}</strong> • Longitude: <strong>{formData.longitude}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:border-indigo-500 text-indigo-600 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {detectingGps ? "Detecting GPS..." : "Detect Current GPS"}
                </button>
              </div>

              {/* Document KYC */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Trade Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="GSTIN">GSTIN (Goods & Services Tax)</option>
                  <option value="PAN">PAN Card (Proprietorship)</option>
                  <option value="UDYAM">Udyam MSME Registration</option>
                  <option value="TRADE_LICENSE">Mandi / Municipal Trade License</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Number / Code *</label>
                <input
                  type="text"
                  required
                  placeholder={formData.documentType === "GSTIN" ? "09ABCDE1234F1Z5" : "Document ID"}
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono uppercase"
                />
              </div>

              {/* Upload to MinIO */}
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Upload Document Copy (MinIO Storage)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 font-bold flex items-center gap-2 transition">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Choose File (PDF/JPG/PNG)</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {formData.documentUrl ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Uploaded to MinIO
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Optional at signup; can be uploaded later.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit KYC Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
