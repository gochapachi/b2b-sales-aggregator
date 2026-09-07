"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Shield,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Truck,
  FileText,
  KeyRound,
  RefreshCw,
  Layers,
  ChevronRight,
  Sparkles,
  Phone,
  PackageCheck,
  Tag,
  Percent,
  Receipt,
  Eye,
  Filter
} from "lucide-react";
import SavingsCalculator from "../components/roi/SavingsCalculator";
import KycVerificationModal from "../components/kyc/KycVerificationModal";
import DeliveryOtpModal from "../components/orders/DeliveryOtpModal";
import GstInvoiceModal from "../components/orders/GstInvoiceModal";
import B2bCheckoutModal from "../components/orders/B2bCheckoutModal";
import AgentCrmDashboard from "../components/crm/AgentCrmDashboard";
import SellerProductStudio from "../components/seller/SellerProductStudio";
import SellerCreditManagement from "../components/seller/SellerCreditManagement";
import EWayBillNicModal from "../components/orders/EWayBillNicModal";
import OpenStreetMapRoute from "../components/maps/OpenStreetMapRoute";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-b2b.anagataitsolutions.in";

export default function Home() {
  const [activeRole, setActiveRole] = useState<"SELLER" | "ADMIN" | "RETAILER" | "AGENT">("RETAILER");
  const [loading, setLoading] = useState(false);

  // Seller Data & Merchandising Sub-Tabs
  const [sellerTab, setSellerTab] = useState<"ORDERS" | "PRODUCTS" | "CREDIT" | "ROI">("ORDERS");
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [selectedSubOrder, setSelectedSubOrder] = useState<any | null>(null);
  const [selectedEWaySubOrder, setSelectedEWaySubOrder] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isEWayModalOpen, setIsEWayModalOpen] = useState(false);

  // Admin Data
  const [pendingRetailers, setPendingRetailers] = useState<any[]>([]);
  const [selectedKycRetailer, setSelectedKycRetailer] = useState<any | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // Retailer Udaan Marketplace Data
  const [catalog, setCatalog] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isPriceUnlocked, setIsPriceUnlocked] = useState(true);
  const [cart, setCart] = useState<{ [skuId: string]: number }>({});
  const [retailerOrders, setRetailerOrders] = useState<any[]>([]);
  const [retailerProfile, setRetailerProfile] = useState<any | null>({
    id: "ret_gupta_kirana",
    shopName: "Gupta Kirana & General Store",
    ownerName: "Ramesh Gupta",
    phone: "9555555555",
    creditLimit: 50000,
    creditDues: 14200,
    paymentTerm: "NET_7",
    kycStatus: "VERIFIED"
  });
  const [orderStatusNotice, setOrderStatusNotice] = useState("");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Load data on tab switch
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeRole === "SELLER") {
        const res = await fetch(`${API_BASE}/api/orders?role=SELLER_ADMIN&organizationId=org_anagata_fmcg`).then(r => r.json());
        setSellerOrders(res.subOrders || []);
      } else if (activeRole === "ADMIN") {
        const res = await fetch(`${API_BASE}/api/kyc/pending`).then(r => r.json());
        setPendingRetailers(res.pendingRetailers || []);
      } else if (activeRole === "RETAILER") {
        // Fetch brands
        const bRes = await fetch(`${API_BASE}/api/catalog/brands`).then(r => r.json());
        setBrands(bRes.brands || []);

        // Fetch categories
        const cRes = await fetch(`${API_BASE}/api/catalog/categories`).then(r => r.json());
        setCategories(cRes.categories || []);

        // Fetch catalog with filters
        let url = `${API_BASE}/api/catalog?role=RETAILER&retailerId=ret_gupta_kirana`;
        if (selectedBrand !== "ALL") url += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (selectedCategory !== "ALL") url += `&category=${encodeURIComponent(selectedCategory)}`;

        const cat = await fetch(url).then(r => r.json());
        setCatalog(cat.products || []);
        setIsPriceUnlocked(cat.isPriceUnlocked);

        // Fetch retailer orders
        const ords = await fetch(`${API_BASE}/api/orders?role=RETAILER&retailerId=ret_gupta_kirana`).then(r => r.json());
        setRetailerOrders(ords.orders || []);

        // Fetch retailer profile
        const prof = await fetch(`${API_BASE}/api/crm/retailer/ret_gupta_kirana`).then(r => r.json());
        if (prof.retailer) setRetailerProfile(prof.retailer);
      }
    } catch (e) {
      console.error("Failed to load page data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole, selectedBrand, selectedCategory]);

  // Seller dispatch
  const handleDispatch = async (subOrderId: string) => {
    await fetch(`${API_BASE}/api/delivery/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subOrderId })
    });
    await loadData();
  };

  // Seller verify OTP
  const handleVerifyOtp = async (subOrderId: string, enteredOtp: string, deliveryBoyName: string) => {
    const res = await fetch(`${API_BASE}/api/delivery/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subOrderId, enteredOtp, deliveryBoyName })
    }).then(r => r.json());

    if (res.error) throw new Error(res.message || res.error);
    await loadData();
    return { success: true, transitDurationMinutes: res.subOrder?.transitDurationMinutes };
  };

  // Admin KYC decision
  const handleApproveKyc = async (retailerId: string) => {
    await fetch(`${API_BASE}/api/kyc/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: retailerId, targetType: "RETAILER", approved: true })
    });
    await loadData();
  };

  const handleRejectKyc = async (retailerId: string, reason: string) => {
    await fetch(`${API_BASE}/api/kyc/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: retailerId, targetType: "RETAILER", approved: false, reason })
    });
    await loadData();
  };

  // Retailer checkout with selected payment term
  const handleConfirmOrder = async (paymentTerm: string) => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([skuId, qty]) => ({ productSkuId: skuId, quantity: qty }));

    if (items.length === 0) return;

    const res = await fetch(`${API_BASE}/api/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retailerId: "ret_gupta_kirana",
        placedByAgentId: "usr_agent_1",
        paymentTerm,
        items
      })
    }).then(r => r.json());

    if (res.error) {
      throw new Error(res.error);
    }

    setCart({});
    setOrderStatusNotice(
      `🎉 Order #${res.order.orderNumber} placed successfully under ${paymentTerm}! Sub-orders routed with volume discounts. Bill sent to your WhatsApp.`
    );
    await loadData();
  };

  // View GST Invoice
  const handleViewInvoice = async (subOrderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/invoice/${subOrderId}`).then(r => r.json());
      if (res.invoice) {
        setSelectedInvoice(res.invoice);
        setIsInvoiceModalOpen(true);
      } else {
        alert("Invoice not available for this sub-order yet.");
      }
    } catch (e: any) {
      alert("Failed to load invoice: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-lg shadow-md">
              B
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight flex items-center gap-2">
                Hyperlocal B2B Sales Aggregator
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Udaan B2B + SFA CRM
                </span>
              </h1>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Coolify Ubuntu 24.04</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Evolution API WhatsApp Active</span>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-800 p-1 rounded-xl flex flex-wrap gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveRole("RETAILER")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeRole === "RETAILER"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Udaan B2B Store
            </button>
            <button
              onClick={() => setActiveRole("AGENT")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeRole === "AGENT"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Field Agent CRM
            </button>
            <button
              onClick={() => setActiveRole("SELLER")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeRole === "SELLER"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Wholesaler / Brand
            </button>
            <button
              onClick={() => setActiveRole("ADMIN")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeRole === "ADMIN"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Super Admin KYC
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================= 1. RETAILER UDAAN B2B STORE VIEW ================= */}
        {activeRole === "RETAILER" && (
          <div className="space-y-6">
            {/* Status notice */}
            {orderStatusNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>{orderStatusNotice}</span>
                <button onClick={() => setOrderStatusNotice("")} className="text-emerald-900 font-bold">✕</button>
              </div>
            )}

            {/* Price-gated notification */}
            {!isPriceUnlocked && (
              <div className="p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <span>
                  Wholesale prices are hidden. Your KYC status is Pending. Once verified by Admin or your Field Sales Agent, wholesale rates will unlock automatically.
                </span>
              </div>
            )}

            {/* Kirana Credit & Profile Status Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                  GK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{retailerProfile?.shopName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      GST Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Proprietor: {retailerProfile?.ownerName} • Phone: {retailerProfile?.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">B2B Credit Line</div>
                  <div className="font-black text-slate-900 text-sm">
                    ₹{(retailerProfile?.creditLimit - retailerProfile?.creditDues || 35800).toLocaleString("en-IN")}{" "}
                    <span className="text-slate-400 font-normal text-xs">/ ₹{retailerProfile?.creditLimit?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Payment Term</div>
                  <div className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {retailerProfile?.paymentTerm || "Net-7"}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Store Discovery Row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Official FMCG Brand Stores
                </h3>
                {selectedBrand !== "ALL" && (
                  <button
                    onClick={() => setSelectedBrand("ALL")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {brands.map((b) => (
                  <button
                    key={b.brand}
                    onClick={() => setSelectedBrand(selectedBrand === b.brand ? "ALL" : b.brand)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                      selectedBrand === b.brand
                        ? "bg-indigo-50 border-indigo-600 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-700 text-sm mb-1">
                      {b.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="font-bold text-slate-900 text-xs leading-tight">{b.brand}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{b.productsCount} SKUs</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedCategory === "ALL"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCategory(selectedCategory === c.name ? "ALL" : c.name)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedCategory === c.name
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c.name} ({c.count})
                </button>
              ))}
            </div>

            {/* Wholesale Products & Cart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Catalog Cards */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalog.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {prod.brand}
                          </span>
                          {prod.marginPct > 0 && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Percent className="w-3 h-3" />
                              {prod.marginPct}% Margin
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{prod.name}</h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Seller: {prod.organizationName} • MOV: ₹{prod.minimumOrderValue}
                          </div>
                        </div>

                        {prod.skus.map((sku: any) => {
                          const currentQty = cart[sku.id] || 0;
                          return (
                            <div key={sku.id} className="pt-3 border-t border-slate-100 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-xs font-semibold text-slate-800">{sku.unitTitle}</div>
                                  <div className="text-[11px] text-slate-400">MOQ: {sku.minimumOrderQuantity} units</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-black text-slate-900">
                                    ₹{sku.wholesalePrice}
                                    <span className="text-xs text-slate-400 line-through ml-1 font-normal">
                                      ₹{sku.mrp}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Volume Pricing Slab Pills */}
                              {sku.pricingSlabs && sku.pricingSlabs.length > 0 && (
                                <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase">Volume Tier Slabs:</div>
                                  <div className="space-y-1">
                                    {sku.pricingSlabs.map((slab: any, sIdx: number) => {
                                      const isTargetSlab =
                                        currentQty >= slab.minQuantity &&
                                        (!slab.maxQuantity || currentQty <= slab.maxQuantity);
                                      return (
                                        <div
                                          key={sIdx}
                                          className={`text-[10px] px-2 py-1 rounded flex justify-between items-center ${
                                            isTargetSlab
                                              ? "bg-emerald-600 text-white font-bold shadow-sm"
                                              : "text-slate-600 bg-white border border-slate-200"
                                          }`}
                                        >
                                          <span>{slab.label}</span>
                                          <span className="font-mono">₹{slab.pricePerUnit}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Quantity Stepper */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-slate-500">Order Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      setCart((prev) => ({
                                        ...prev,
                                        [sku.id]: Math.max(0, (prev[sku.id] || 0) - 1)
                                      }))
                                    }
                                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-xs flex items-center justify-center transition"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold w-6 text-center">{currentQty}</span>
                                  <button
                                    onClick={() =>
                                      setCart((prev) => ({
                                        ...prev,
                                        [sku.id]: (prev[sku.id] || 0) + 1
                                      }))
                                    }
                                    className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center transition shadow-sm"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping Cart & Delivery OTP Tracker */}
              <div className="space-y-6">
                {/* Cart Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-base">Master Shopping Cart</h4>
                    <span className="text-xs text-indigo-600 font-bold">
                      {Object.values(cart).reduce((a, b) => a + b, 0)} Items
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs max-h-56 overflow-y-auto">
                    {Object.entries(cart).filter(([_, q]) => q > 0).length === 0 ? (
                      <div className="py-6 text-center text-slate-400">Cart is empty. Select items to order.</div>
                    ) : (
                      Object.entries(cart)
                        .filter(([_, q]) => q > 0)
                        .map(([skuId, qty]) => (
                          <div key={skuId} className="py-2 flex justify-between items-center">
                            <span className="font-medium text-slate-700">SKU {skuId.slice(0, 16)}... (x{qty})</span>
                            <span className="font-bold text-slate-900">Added</span>
                          </div>
                        ))
                    )}
                  </div>

                  <button
                    onClick={() => setIsCheckoutModalOpen(true)}
                    disabled={Object.values(cart).every((v) => v === 0)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Review B2B Terms & Checkout
                  </button>
                </div>

                {/* Active Orders & 4-Digit OTP Hand-Off */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      Live Orders & Delivery OTPs
                    </h4>
                    <button onClick={loadData} className="text-slate-400 hover:text-slate-700 p-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {retailerOrders.length === 0 ? (
                    <div className="text-xs text-slate-400 py-3 text-center">No orders placed yet</div>
                  ) : (
                    retailerOrders.slice(0, 3).map((mo) => (
                      <div key={mo.id} className="space-y-2 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">#{mo.orderNumber}</span>
                          <span className="text-indigo-600 font-black">₹{mo.totalAmount?.toLocaleString("en-IN")}</span>
                        </div>

                        {mo.subOrders?.map((so: any) => (
                          <div key={so.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between font-bold text-slate-900">
                              <span>{so.organizationName}</span>
                              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                                {so.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Delivery OTP:</span>
                              <span className="font-mono text-sm font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                {so.deliveryOtp}
                              </span>
                            </div>

                            {/* View GST Tax Invoice button */}
                            <button
                              onClick={() => handleViewInvoice(so.id)}
                              className="w-full py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 mt-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              View & Print GST Tax Invoice
                            </button>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. FIELD SALES AGENT SFA CRM VIEW ================= */}
        {activeRole === "AGENT" && (
          <div className="space-y-6">
            <OpenStreetMapRoute apiBase={API_BASE} beatId="beat_hazratganj_mon" />
            <AgentCrmDashboard apiBase={API_BASE} agentId="usr_agent_1" />
          </div>
        )}

        {/* ================= 3. WHOLESALER / BRAND VIEW ================= */}
        {activeRole === "SELLER" && (
          <div className="space-y-6">
            {/* Wholesaler Section Sub-Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-fit overflow-x-auto border border-slate-200/80">
              <button
                onClick={() => setSellerTab("ORDERS")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  sellerTab === "ORDERS" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Orders & Consignments
              </button>
              <button
                onClick={() => setSellerTab("PRODUCTS")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  sellerTab === "PRODUCTS" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Product & Combo Studio
              </button>
              <button
                onClick={() => setSellerTab("CREDIT")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  sellerTab === "CREDIT" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Retailer Credit & Ledgers
              </button>
              <button
                onClick={() => setSellerTab("ROI")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  sellerTab === "ROI" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ROI & Savings Simulator
              </button>
            </div>

            {sellerTab === "PRODUCTS" && (
              <SellerProductStudio apiBase={API_BASE} organizationId="org_anagata_fmcg" />
            )}

            {sellerTab === "CREDIT" && (
              <SellerCreditManagement apiBase={API_BASE} organizationId="org_anagata_fmcg" />
            )}

            {sellerTab === "ROI" && (
              <SavingsCalculator />
            )}

            {sellerTab === "ORDERS" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      Incoming B2B Sub-Orders (Anagata FMCG Wholesale)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Orders routed directly to your warehouse with 0% platform commission.
                    </p>
                  </div>
                  <button onClick={loadData} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-200">
                  {sellerOrders.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No sub-orders received yet.</div>
                  ) : (
                    sellerOrders.map((order) => (
                      <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">{order.retailerShopName}</span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "DISPATCHED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            Master Order: #{order.masterOrderNumber} • Grand Total:{" "}
                            <span className="font-bold text-slate-900">₹{order.grandTotal?.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Retailer WhatsApp: {order.retailerPhone} • Payment: {order.paymentTerm || "NET_7"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === "RECEIVED" && (
                            <button
                              onClick={() => handleDispatch(order.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Dispatch & Send OTP
                            </button>
                          )}

                          {order.status === "DISPATCHED" && (
                            <button
                              onClick={() => {
                                setSelectedSubOrder(order);
                                setIsOtpModalOpen(true);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              Verify Retailer OTP
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedEWaySubOrder(order.id);
                              setIsEWayModalOpen(true);
                            }}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            E-Way Bill NIC
                          </button>

                          <button
                            onClick={() => handleViewInvoice(order.id)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            GST Invoice
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. SUPER ADMIN KYC VIEW ================= */}
        {activeRole === "ADMIN" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Pending B2B Retailer KYC Verification Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review GSTIN / Udyam / Shop licenses. Approving an account instantly unlocks wholesale prices.
                  </p>
                </div>
                <button onClick={loadData} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-200">
                {pendingRetailers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    All submitted KYC applications have been reviewed!
                  </div>
                ) : (
                  pendingRetailers.map((ret) => (
                    <div key={ret.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{ret.shopName}</span>
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            KYC PENDING
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">Owner: {ret.ownerName} • Phone: {ret.phone}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Document: {ret.documentType} ({ret.gstin || ret.panOrUdyam || "Provided"}) • {ret.city}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedKycRetailer(ret);
                          setIsKycModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition self-start sm:self-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Inspect & Verify
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        retailer={selectedKycRetailer}
        onApprove={handleApproveKyc}
        onReject={handleRejectKyc}
      />

      <DeliveryOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        subOrder={selectedSubOrder}
        onVerify={handleVerifyOtp}
      />

      <B2bCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        products={catalog}
        retailerProfile={retailerProfile}
        onConfirmOrder={handleConfirmOrder}
      />

      <GstInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />

      <EWayBillNicModal
        apiBase={API_BASE}
        subOrderId={selectedEWaySubOrder || ""}
        isOpen={isEWayModalOpen}
        onClose={() => setIsEWayModalOpen(false)}
      />
    </div>
  );
}
