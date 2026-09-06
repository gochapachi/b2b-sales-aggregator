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
  PackageCheck
} from "lucide-react";
import SavingsCalculator from "../components/roi/SavingsCalculator";
import KycVerificationModal from "../components/kyc/KycVerificationModal";
import DeliveryOtpModal from "../components/orders/DeliveryOtpModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-b2b.anagataitsolutions.in";

export default function Home() {
  const [activeRole, setActiveRole] = useState<"SELLER" | "ADMIN" | "RETAILER" | "AGENT">("SELLER");
  const [loading, setLoading] = useState(false);

  // Seller Data
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [selectedSubOrder, setSelectedSubOrder] = useState<any | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Admin Data
  const [pendingRetailers, setPendingRetailers] = useState<any[]>([]);
  const [selectedKycRetailer, setSelectedKycRetailer] = useState<any | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // Retailer Data
  const [catalog, setCatalog] = useState<any[]>([]);
  const [isPriceUnlocked, setIsPriceUnlocked] = useState(true);
  const [cart, setCart] = useState<{ [skuId: string]: number }>({});
  const [retailerOrders, setRetailerOrders] = useState<any[]>([]);
  const [orderStatusNotice, setOrderStatusNotice] = useState("");

  // Agent Data
  const [todayBeat, setTodayBeat] = useState<any | null>(null);
  const [checkinMessage, setCheckinMessage] = useState("");

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
        const cat = await fetch(`${API_BASE}/api/catalog?role=RETAILER&retailerId=ret_gupta_kirana`).then(r => r.json());
        setCatalog(cat.products || []);
        setIsPriceUnlocked(cat.isPriceUnlocked);
        const ords = await fetch(`${API_BASE}/api/orders?role=RETAILER&retailerId=ret_gupta_kirana`).then(r => r.json());
        setRetailerOrders(ords.orders || []);
      } else if (activeRole === "AGENT") {
        const beat = await fetch(`${API_BASE}/api/beats/today?agentId=usr_agent_1`).then(r => r.json());
        setTodayBeat(beat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

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

  // Retailer checkout
  const handleCheckout = async () => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([skuId, qty]) => ({ productSkuId: skuId, quantity: qty }));

    if (items.length === 0) return;

    const res = await fetch(`${API_BASE}/api/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retailerId: "ret_gupta_kirana",
        items
      })
    }).then(r => r.json());

    if (res.error) {
      alert(res.error);
      return;
    }

    setCart({});
    setOrderStatusNotice(`🎉 Order #${res.order.orderNumber} placed! Split into ${res.order.subOrders.length} vendor sub-orders. Itemized bill dispatched to your WhatsApp!`);
    await loadData();
  };

  // Agent Checkin
  const handleAgentCheckin = async (retailerId: string) => {
    const res = await fetch(`${API_BASE}/api/visits/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: "usr_agent_1",
        retailerId,
        beatId: todayBeat?.beatId,
        latitude: 26.8469,
        longitude: 80.9462
      })
    }).then(r => r.json());

    if (res.success) {
      setCheckinMessage(res.message);
      await loadData();
    } else {
      alert(res.message || res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-lg shadow-md">
              B
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                Hyperlocal B2B Sales Aggregator
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
              Super Admin
            </button>
            <button
              onClick={() => setActiveRole("RETAILER")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeRole === "RETAILER"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Retailer Web
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
              Sales Agent
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================= SELLER / WHOLESALER VIEW ================= */}
        {activeRole === "SELLER" && (
          <div className="space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Monthly Subscription</div>
                <div className="text-2xl font-black text-indigo-900 mt-1">₹6,000 <span className="text-xs font-normal text-slate-500">/mo</span></div>
                <div className="text-xs text-emerald-600 font-bold mt-1">✓ 0% Commission on GMV</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Beat Strike Rate</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">86.4%</div>
                <div className="text-xs text-slate-500 mt-1">11 orders booked from 13 visits</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Average Transit SLA</div>
                <div className="text-2xl font-black text-slate-800 mt-1">22 mins</div>
                <div className="text-xs text-slate-500 mt-1">Verified via 4-Digit Delivery OTP</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase">Net Payroll Savings</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">81.8%</div>
                <div className="text-xs text-slate-500 mt-1">₹27,000 saved / month / route</div>
              </div>
            </div>

            {/* Interactive Savings Simulator */}
            <div>
              <SavingsCalculator />
            </div>

            {/* Live Incoming Orders & OTP Fulfillment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    Incoming Sub-Orders & Delivery OTP Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dispatched orders trigger a WhatsApp alert to the retailer with the secure 4-digit Delivery OTP.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-200">
                {sellerOrders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No orders booked yet. Switch to "Retailer Web" or "Sales Agent" tab to place a test order!
                  </div>
                ) : (
                  sellerOrders.map((so) => (
                    <div key={so.id} className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">#{so.masterOrderNumber || "ORD-506874"}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              so.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : so.status === "DISPATCHED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {so.status}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-700">
                          {so.retailerShopName || "Gupta Kirana & General Store"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>{so.items?.length || 1} SKU items</span>
                          <span>•</span>
                          <span>Amount: ₹{so.grandTotal.toLocaleString("en-IN")}</span>
                          {so.transitDurationMinutes && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600">
                                Transit: {so.transitDurationMinutes} mins
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {so.status === "RECEIVED" && (
                          <button
                            onClick={() => handleDispatch(so.id)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Dispatch (Send OTP via WhatsApp)
                          </button>
                        )}
                        {so.status === "DISPATCHED" && (
                          <button
                            onClick={() => {
                              setSelectedSubOrder(so);
                              setIsOtpModalOpen(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Enter Delivery OTP
                          </button>
                        )}
                        {so.status === "DELIVERED" && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Verified (OTP: {so.deliveryOtp})
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= SUPER ADMIN VIEW ================= */}
        {activeRole === "ADMIN" && (
          <div className="space-y-6">
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
                <button
                  onClick={loadData}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
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

        {/* ================= RETAILER WEB STORE VIEW ================= */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Catalog Column */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  B2B Multi-Brand Wholesale Catalog
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalog.map((prod) => (
                    <div key={prod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{prod.brand}</div>
                        <h4 className="font-bold text-slate-900 text-sm">{prod.name}</h4>
                        <div className="text-xs text-slate-500">Seller: {prod.organizationName}</div>
                        <div className="text-xs text-slate-500">Seller Minimum Order: ₹{prod.minimumOrderValue}</div>

                        {prod.skus.map((sku: any) => (
                          <div key={sku.id} className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold text-slate-700">{sku.unitTitle}</div>
                              <div className="text-xs text-slate-400">MOQ: {sku.minimumOrderQuantity} units</div>
                              <div className="text-sm font-bold text-slate-900 mt-1">
                                {sku.wholesalePrice ? (
                                  <>₹{sku.wholesalePrice} <span className="text-xs text-slate-400 line-through">₹{sku.mrp}</span></>
                                ) : (
                                  <span className="text-xs text-amber-600 font-bold">🔒 Price Locked (KYC)</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCart(prev => ({ ...prev, [sku.id]: Math.max(0, (prev[sku.id] || 0) - 1) }))}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold w-6 text-center">{cart[sku.id] || 0}</span>
                              <button
                                onClick={() => setCart(prev => ({ ...prev, [sku.id]: (prev[sku.id] || 0) + 1 }))}
                                className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping Cart & Delivery OTP Tracker */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">Master Shopping Cart</h4>
                  <div className="text-xs text-slate-500">
                    Items will be automatically split into sub-orders for each wholesaler.
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {Object.entries(cart).filter(([_, q]) => q > 0).length === 0 ? (
                      <div className="py-4 text-center text-slate-400">Cart is empty</div>
                    ) : (
                      Object.entries(cart).filter(([_, q]) => q > 0).map(([skuId, qty]) => (
                        <div key={skuId} className="py-2 flex justify-between">
                          <span>SKU {skuId.slice(0, 12)}... (x{qty})</span>
                          <span className="font-bold">Added</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={Object.values(cart).every(v => v === 0)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition"
                  >
                    Place Wholesale Order
                  </button>
                </div>

                {/* My Orders with 4-digit Delivery OTP */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    My Active Delivery OTPs
                  </h4>

                  {retailerOrders.length === 0 ? (
                    <div className="text-xs text-slate-400 py-2">No active orders</div>
                  ) : (
                    retailerOrders.map(mo => (
                      <div key={mo.id} className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span>#{mo.orderNumber}</span>
                          <span className="text-indigo-600 font-bold">₹{mo.totalAmount.toLocaleString("en-IN")}</span>
                        </div>
                        {mo.subOrders?.map((so: any) => (
                          <div key={so.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                            <div className="flex justify-between font-medium">
                              <span>{so.organizationName}</span>
                              <span className="font-bold text-indigo-600">{so.status}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-slate-500">Delivery OTP:</span>
                              <span className="font-mono text-sm font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                {so.deliveryOtp}
                              </span>
                            </div>
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

        {/* ================= FIELD SALES AGENT VIEW ================= */}
        {activeRole === "AGENT" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Today's 6-Day Beat: {todayBeat?.beatName || "Monday Hazratganj Route"}
                  </h3>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Agent: Rahul Sharma • Stops Visited: {todayBeat?.visitedStops || 0} / {todayBeat?.totalStops || 2}
                  </div>
                </div>
                <div className="text-xs bg-indigo-600 px-3 py-1 rounded-full font-bold">
                  Geofence Radius: 100m
                </div>
              </div>

              {checkinMessage && (
                <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {checkinMessage}
                </div>
              )}

              <div className="divide-y divide-slate-200">
                {todayBeat?.stops?.map((stop: any) => (
                  <div key={stop.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center">
                          {stop.sequenceOrder}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{stop.shopName}</h4>
                        {stop.isVisited && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            VISITED ({stop.visitDisposition})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">Owner: {stop.ownerName} • {stop.address}</div>
                      <div className="text-xs text-slate-500 mt-0.5">GPS Pin: {stop.latitude}, {stop.longitude}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAgentCheckin(stop.retailerId)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Check-In (&lt;100m)
                      </button>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
