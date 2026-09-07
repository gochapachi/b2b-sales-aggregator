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
  Filter,
  Boxes,
  BookOpen,
  Trophy,
  FileSpreadsheet,
  UserPlus,
  Key,
  Users
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
import WarehousePackingDesk from "../components/warehouse/WarehousePackingDesk";
import DeliveryRunSheetView from "../components/logistics/DeliveryRunSheetView";
import TallyMargExportDesk from "../components/accounting/TallyMargExportDesk";
import RetailerSmartTools from "../components/retailer/RetailerSmartTools";
import SfaLeaderboardAndAudio from "../components/sfa/SfaLeaderboardAndAudio";
import RetailPosCheckoutDesk from "../components/pos/RetailPosCheckoutDesk";
import SuperAdminAnalyticsDashboard from "../components/admin/SuperAdminAnalyticsDashboard";
import PublicSignupModal from "../components/auth/PublicSignupModal";
import AppUpdateBanner from "../components/common/AppUpdateBanner";
import ErpUniversalColumnMapper from "../components/seller/ErpUniversalColumnMapper";
import TenantUserManagementDesk from "../components/users/TenantUserManagementDesk";
import TestAccountsQuickModal from "../components/auth/TestAccountsQuickModal";
import SuperAdminUserRegistryDesk from "../components/admin/SuperAdminUserRegistryDesk";
import AuthGateway from "../components/auth/AuthGateway";
import AppShell from "../components/layout/AppShell";
import AccessDeniedView from "../components/common/AccessDeniedView";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-b2b.anagataitsolutions.in";

export default function Home() {
  const [activeRole, setActiveRole] = useState<"SELLER" | "ADMIN" | "RETAILER" | "AGENT">("RETAILER");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Self-Registration Modal & Test Accounts Modal
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [signupInitialRole, setSignupInitialRole] = useState<"RETAILER" | "SELLER">("RETAILER");
  const [currentAuthUser, setCurrentAuthUser] = useState<any | null>(null);
  const [authToken, setAuthToken] = useState<string>("jwt_mock_token");

  // Sub-tabs for roles
  const [sellerTab, setSellerTab] = useState<"ORDERS" | "PRODUCTS" | "CREDIT" | "PACKING" | "LOGISTICS" | "ERP" | "ROI" | "STAFF">("ORDERS");
  const [retailerTab, setRetailerTab] = useState<"CATALOG" | "POS_COUNTER" | "SMART_TOOLS" | "STAFF">("CATALOG");
  const [adminTab, setAdminTab] = useState<"ANALYTICS" | "KYC" | "USERS">("ANALYTICS");
  const [agentTab, setAgentTab] = useState<"CRM" | "LEADERBOARD_COACHING">("CRM");

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("b2b_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.user) {
          handleSwitchAccount(parsed, false);
        }
      }
    } catch (e) {
      console.warn("Could not parse saved session", e);
    }
  }, []);

  const handleSignOut = () => {
    setCurrentAuthUser(null);
    setAuthToken("");
    try {
      localStorage.removeItem("b2b_session");
    } catch (e) {}
  };

  const handleSwitchAccount = (data: any, persist: boolean = true) => {
    setAuthToken(data.token);
    setCurrentAuthUser(data.user);
    if (persist) {
      try {
        localStorage.setItem("b2b_session", JSON.stringify(data));
      } catch (e) {}
    }

    if (data.retailerProfile) {
      setRetailerProfile(data.retailerProfile);
    }
    if (data.user.role === "SUPER_ADMIN") {
      setActiveRole("ADMIN");
      setAdminTab("ANALYTICS");
    } else if (data.user.role === "SELLER_ADMIN" || data.user.role === "SELLER_STAFF") {
      setActiveRole("SELLER");
      setSellerTab("ORDERS");
    } else if (data.user.role === "SALES_AGENT" || data.user.role === "SUPPLY_BD_AGENT") {
      setActiveRole("AGENT");
      setAgentTab("CRM");
    } else {
      setActiveRole("RETAILER");
      setRetailerTab("CATALOG");
    }
  };

  // Strict Role-Based Access Control
  const isRoleAuthorized = (role: string, userRole: string): boolean => {
    if (!userRole) return false;
    if (userRole === "SUPER_ADMIN") return true;
    if (role === "SELLER" && (userRole === "SELLER_ADMIN" || userRole === "SELLER_STAFF")) return true;
    if (role === "RETAILER" && (userRole === "RETAILER_ADMIN" || userRole === "RETAILER_STAFF" || userRole === "RETAILER")) return true;
    if (role === "AGENT" && (userRole === "SALES_AGENT" || userRole === "SUPPLY_BD_AGENT")) return true;
    return false;
  };

  const getCurrentTab = () => {
    if (activeRole === "RETAILER") return retailerTab;
    if (activeRole === "SELLER") return sellerTab;
    if (activeRole === "AGENT") return agentTab;
    if (activeRole === "ADMIN") return adminTab;
    return "";
  };

  const handleSelectTab = (tabId: string) => {
    if (activeRole === "RETAILER") setRetailerTab(tabId as any);
    if (activeRole === "SELLER") setSellerTab(tabId as any);
    if (activeRole === "AGENT") setAgentTab(tabId as any);
    if (activeRole === "ADMIN") setAdminTab(tabId as any);
  };

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
        const orgId = currentAuthUser?.tenantId || currentAuthUser?.organization?.id || currentAuthUser?.organizationId || "org_anagata_fmcg";
        const res = await fetch(`${API_BASE}/api/orders?role=SELLER_ADMIN&organizationId=${orgId}`).then(r => r.json());
        setSellerOrders(res.subOrders || []);
      } else if (activeRole === "ADMIN") {
        const res = await fetch(`${API_BASE}/api/kyc/pending`).then(r => r.json());
        setPendingRetailers(res.pendingRetailers || []);
      } else if (activeRole === "RETAILER") {
        const retId = currentAuthUser?.tenantId || currentAuthUser?.retailerProfile?.id || "ret_gupta_kirana";
        // Fetch brands
        const bRes = await fetch(`${API_BASE}/api/catalog/brands`).then(r => r.json());
        setBrands(bRes.brands || []);

        // Fetch categories
        const cRes = await fetch(`${API_BASE}/api/catalog/categories`).then(r => r.json());
        setCategories(cRes.categories || []);

        // Fetch catalog with filters
        let url = `${API_BASE}/api/catalog?role=RETAILER&retailerId=${retId}`;
        if (selectedBrand !== "ALL") url += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (selectedCategory !== "ALL") url += `&category=${encodeURIComponent(selectedCategory)}`;

        const cat = await fetch(url).then(r => r.json());
        setCatalog(cat.products || []);
        setIsPriceUnlocked(cat.isPriceUnlocked);

        // Fetch retailer orders
        const ords = await fetch(`${API_BASE}/api/orders?role=RETAILER&retailerId=${retId}`).then(r => r.json());
        setRetailerOrders(ords.orders || []);

        // Fetch retailer profile
        const prof = await fetch(`${API_BASE}/api/crm/retailer/${retId}`).then(r => r.json());
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

  if (!currentAuthUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <AppUpdateBanner apiBase={API_BASE} />
        <AuthGateway
          apiBase={API_BASE}
          onLoginSuccess={handleSwitchAccount}
          onOpenSignup={(role) => {
            setSignupInitialRole(role);
            setIsSignupModalOpen(true);
          }}
        />
        <PublicSignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          apiBase={API_BASE}
          initialRole={signupInitialRole}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppUpdateBanner apiBase={API_BASE} />

      {/* Super Admin Inspection Mode Warning */}
      {currentAuthUser.role === "SUPER_ADMIN" && activeRole !== "ADMIN" && (
        <div className="bg-indigo-950 text-indigo-200 px-4 py-2 text-xs flex items-center justify-between border-b border-indigo-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Super Admin View-As Audit:</strong> Currently previewing the <strong>{activeRole}</strong> workspace.
            </span>
          </div>
          <button
            onClick={() => setActiveRole("ADMIN")}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
          >
            Return to Super Admin HQ
          </button>
        </div>
      )}

      <AppShell
        currentUser={currentAuthUser}
        activeRole={activeRole}
        activeTab={getCurrentTab()}
        onSelectTab={handleSelectTab}
        onSignOut={handleSignOut}
        onOpenTestAccounts={() => setIsTestModalOpen(true)}
        onOpenSignup={() => {
          setSignupInitialRole("RETAILER");
          setIsSignupModalOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        {!isRoleAuthorized(activeRole, currentAuthUser.role) ? (
          <AccessDeniedView
            userRole={currentAuthUser.role}
            attemptedRole={activeRole}
            onReturnToDashboard={() => {
              if (currentAuthUser.role.startsWith("SELLER")) setActiveRole("SELLER");
              else if (currentAuthUser.role.startsWith("RETAILER")) setActiveRole("RETAILER");
              else if (currentAuthUser.role.includes("AGENT")) setActiveRole("AGENT");
              else setActiveRole("ADMIN");
            }}
            onSignOut={handleSignOut}
          />
        ) : (
          <div className="space-y-6">
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

            {retailerTab === "STAFF" && (
              <TenantUserManagementDesk
                apiBase={API_BASE}
                tenantType="RETAILER"
                tenantId="ret_gupta_kirana"
                tenantName={retailerProfile?.shopName || "Gupta Kirana Store"}
              />
            )}

            {retailerTab === "POS_COUNTER" && (
              <RetailPosCheckoutDesk
                apiBase={API_BASE}
                retailerId="ret_gupta_kirana"
                retailerName={retailerProfile?.shopName || "Gupta Kirana & General Store"}
              />
            )}

            {retailerTab === "SMART_TOOLS" && (
              <RetailerSmartTools
                apiBase={API_BASE}
                retailerId="ret_gupta_kirana"
                onSearchQuery={(q) => {
                  setSelectedCategory("ALL");
                  setRetailerTab("CATALOG");
                }}
              />
            )}

            {retailerTab === "CATALOG" && (
              <>
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
                          const profitRs = Math.max(0, (sku.mrp || 0) - (sku.wholesalePrice || 0));
                          const marginPct = sku.mrp > 0 ? Math.round((profitRs / sku.mrp) * 100) : 0;
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
                                  <div className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-0.5">
                                    <Percent className="w-2.5 h-2.5 text-emerald-600" />
                                    Net Margin: ₹{profitRs} ({marginPct}%)
                                  </div>
                                </div>
                              </div>

                              {/* Sell-Through Velocity Insight */}
                              <div className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg flex items-center justify-between text-slate-600">
                                <span className="flex items-center gap-1 font-medium">
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                  18-day average POS liquidation velocity
                                </span>
                                <span className="font-bold text-indigo-600">Recommended: 1-2 cartons</span>
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

                  {(() => {
                    let totalWholesale = 0;
                    let totalMrp = 0;
                    Object.entries(cart).forEach(([skuId, qty]) => {
                      if (qty > 0) {
                        const allSkus = catalog.flatMap((c) => c.skus || []);
                        const foundSku = allSkus.find((s: any) => s.id === skuId);
                        if (foundSku) {
                          totalWholesale += (foundSku.wholesalePrice || 0) * qty;
                          totalMrp += (foundSku.mrp || 0) * qty;
                        }
                      }
                    });
                    const projectedProfit = Math.max(0, totalMrp - totalWholesale);
                    const profitMarginPct = totalMrp > 0 ? Math.round((projectedProfit / totalMrp) * 100) : 0;

                    return (
                      <>
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

                        {/* Cart Profitability Summary Bar */}
                        {projectedProfit > 0 && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-emerald-800 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                Projected Kirana Resale Profit:
                              </span>
                              <span className="font-black text-emerald-700 text-sm">
                                ₹{projectedProfit.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-emerald-600">
                              <span>Cart Wholesale Buy: ₹{totalWholesale.toLocaleString("en-IN")}</span>
                              <span className="font-bold">+{profitMarginPct}% Profit Margin</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

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
            </>
            )}
          </div>
        )}

        {/* ================= 2. FIELD SALES AGENT SFA CRM VIEW ================= */}
        {activeRole === "AGENT" && (
          <div className="space-y-6">
            {agentTab === "CRM" && (
              <>
                <OpenStreetMapRoute apiBase={API_BASE} beatId="beat_hazratganj_mon" />
                <AgentCrmDashboard apiBase={API_BASE} agentId="usr_agent_1" />
              </>
            )}

            {agentTab === "LEADERBOARD_COACHING" && (
              <SfaLeaderboardAndAudio apiBase={API_BASE} />
            )}
          </div>
        )}

        {/* ================= 3. WHOLESALER / BRAND VIEW ================= */}
        {activeRole === "SELLER" && (
          <div className="space-y-6">
            {sellerTab === "STAFF" && (
              <TenantUserManagementDesk
                apiBase={API_BASE}
                tenantType="SELLER"
                tenantId="org_anagata_fmcg"
                tenantName="Anagata FMCG Wholesale"
              />
            )}

            {sellerTab === "PRODUCTS" && (
              <SellerProductStudio apiBase={API_BASE} organizationId="org_anagata_fmcg" />
            )}

            {sellerTab === "CREDIT" && (
              <SellerCreditManagement apiBase={API_BASE} organizationId="org_anagata_fmcg" />
            )}

            {sellerTab === "PACKING" && (
              <WarehousePackingDesk apiBase={API_BASE} />
            )}

            {sellerTab === "LOGISTICS" && (
              <DeliveryRunSheetView apiBase={API_BASE} />
            )}

            {sellerTab === "ERP" && (
              <div className="space-y-6">
                <ErpUniversalColumnMapper apiBase={API_BASE} organizationId="org_anagata_fmcg" />
                <TallyMargExportDesk apiBase={API_BASE} organizationId="org_anagata_fmcg" />
              </div>
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

        {/* ================= 4. SUPER ADMIN HQ VIEW ================= */}
        {activeRole === "ADMIN" && (
          <div className="space-y-6">
            {adminTab === "ANALYTICS" && (
              <SuperAdminAnalyticsDashboard apiBase={API_BASE} />
            )}

            {adminTab === "USERS" && (
              <SuperAdminUserRegistryDesk
                apiBase={API_BASE}
                authToken={authToken}
                onImpersonateSuccess={(data) => {
                  handleSwitchAccount(data);
                }}
              />
            )}

            {adminTab === "KYC" && (
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
            )}
          </div>
        )}
      </div>
    )}
  </AppShell>

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

      <PublicSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        apiBase={API_BASE}
        initialRole={signupInitialRole}
      />

      <TestAccountsQuickModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        apiBase={API_BASE}
        onSwitchAccount={handleSwitchAccount}
      />
    </div>
  );
}
