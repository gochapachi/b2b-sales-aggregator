"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Barcode,
  Mic,
  MicOff,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  QrCode,
  ArrowRight,
  RefreshCw,
  Smartphone,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  Scale,
  Sparkles,
  X,
  FileText,
  Calendar,
  Tag,
  Package,
  Clock,
  Send,
  Bluetooth,
  Receipt
} from "lucide-react";

interface RetailPosCheckoutDeskProps {
  apiBase: string;
  retailerId?: string;
  retailerName?: string;
}

interface CartItem {
  id: string;
  productId: string;
  barcode: string;
  name: string;
  brand: string;
  uom: string;
  packSize: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  weightGrams?: number;
  isLoose?: boolean;
  taxAmount: number;
  totalPrice: number;
  expiryDate?: string;
}

interface HeldCart {
  id: string;
  customerLabel: string;
  items: CartItem[];
  heldAt: string;
  totalAmount: number;
}

export default function RetailPosCheckoutDesk({
  apiBase,
  retailerId = "ret_gupta_kirana",
  retailerName = "Gupta Kirana & General Store"
}: RetailPosCheckoutDeskProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"COUNTER" | "HOLD_CARTS" | "BILLS" | "REGISTER" | "FEFO_EXPIRY">("COUNTER");

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any | null>(null);
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search and category filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);

  // Checkout info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "KHATA" | "SPLIT">("CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);
  const [splitUpiAmount, setSplitUpiAmount] = useState<number>(0);
  const [sendWhatsAppReceipt, setSendWhatsAppReceipt] = useState(true);

  // Loose goods modal state
  const [looseModalProduct, setLooseModalProduct] = useState<any | null>(null);
  const [looseWeightGrams, setLooseWeightGrams] = useState<number>(500);

  // Add custom SKU modal
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [newSkuName, setNewSkuName] = useState("");
  const [newSkuSellingPrice, setNewSkuSellingPrice] = useState(25);
  const [newSkuCostPrice, setNewSkuCostPrice] = useState(20);
  const [newSkuStock, setNewSkuStock] = useState(24);
  const [newSkuCategory, setNewSkuCategory] = useState("General Grocery");
  const [newSkuBarcode, setNewSkuBarcode] = useState("");

  // Inward delivered order
  const [subOrderIdToInward, setSubOrderIdToInward] = useState("subord_001");
  const [isInwarding, setIsInwarding] = useState(false);

  // Speech & Barcode
  const [isListening, setIsListening] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  // Day-end register modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [closingCashCount, setClosingCashCount] = useState<number>(1850);
  const [registerNotes, setRegisterNotes] = useState("");

  // Completed receipt view
  const [completedBill, setCompletedBill] = useState<any | null>(null);

  useEffect(() => {
    loadPosData();
  }, [retailerId]);

  const loadPosData = async () => {
    setLoading(true);
    try {
      const [prodRes, finRes, billsRes] = await Promise.all([
        fetch(`${apiBase}/api/pos/products?retailerId=${retailerId}`).then((r) => r.json()),
        fetch(`${apiBase}/api/pos/financials?retailerId=${retailerId}`).then((r) => r.json()),
        fetch(`${apiBase}/api/pos/bills?retailerId=${retailerId}`).then((r) => r.json())
      ]);

      if (prodRes.success) setProducts(prodRes.products);
      if (finRes.success) setFinancials(finRes.financials);
      if (billsRes.success) setRecentBills(billsRes.bills);
    } catch {
      setStatusMessage({ type: "error", text: "Network error loading POS catalog." });
    } finally {
      setLoading(false);
    }
  };

  // 1. Add item to cart
  const addToCart = (product: any, qty = 1, weightGrams?: number) => {
    const existingIndex = cart.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1 && !product.isLooseWeight) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + qty;
      const price = updated[existingIndex].unitPrice * newQty;
      const tax = Math.round(price * 0.05 * 100) / 100;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = Math.round(price * 100) / 100;
      updated[existingIndex].taxAmount = tax;
      setCart(updated);
    } else {
      let unitPrice = product.sellingPrice;
      let lineTotal = unitPrice * qty;

      if (product.isLooseWeight && weightGrams) {
        // e.g. price per kg, calculate for grams
        lineTotal = Math.round((unitPrice * (weightGrams / 1000)) * 100) / 100;
      }

      const lineTax = Math.round(lineTotal * 0.05 * 100) / 100;

      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        uom: product.uom,
        packSize: product.packSize,
        unitPrice: product.sellingPrice,
        mrp: product.mrp,
        quantity: qty,
        weightGrams,
        isLoose: product.isLooseWeight,
        taxAmount: lineTax,
        totalPrice: lineTotal,
        expiryDate: product.expiryDate
      };
      setCart([newItem, ...cart]);
    }
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          const price = item.isLoose && item.weightGrams
            ? Math.round((item.unitPrice * (item.weightGrams / 1000)) * 100) / 100
            : Math.round(item.unitPrice * newQty * 100) / 100;
          return {
            ...item,
            quantity: newQty,
            totalPrice: price,
            taxAmount: Math.round(price * 0.05 * 100) / 100
          };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    setCart(updated);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered(0);
  };

  // Cart Calculations
  const cartSubtotal = Math.round(cart.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100;
  const cartTaxTotal = Math.round(cart.reduce((sum, item) => sum + item.taxAmount, 0) * 100) / 100;
  const cartGrandTotal = cartSubtotal;
  const changeDue = Math.max(0, Math.round((cashTendered - cartGrandTotal) * 100) / 100);

  // 2. Multi-Cart Hold Functionality
  const holdCurrentCart = () => {
    if (cart.length === 0) return;
    const label = customerName ? `${customerName} (₹${cartGrandTotal})` : `Customer #${heldCarts.length + 1} (₹${cartGrandTotal})`;
    const held: HeldCart = {
      id: `held_${Date.now()}`,
      customerLabel: label,
      items: [...cart],
      heldAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      totalAmount: cartGrandTotal
    };
    setHeldCarts([held, ...heldCarts]);
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setStatusMessage({ type: "success", text: `Cart put on Hold: ${label}` });
  };

  const resumeHeldCart = (heldId: string) => {
    const target = heldCarts.find((h) => h.id === heldId);
    if (!target) return;
    setCart(target.items);
    setHeldCarts(heldCarts.filter((h) => h.id !== heldId));
    setActiveTab("COUNTER");
    setStatusMessage({ type: "success", text: `Resumed held cart with ${target.items.length} items.` });
  };

  // 3. Automated Inwarding from B2B Deliveries
  const handleInwardFromDelivery = async () => {
    setIsInwarding(true);
    try {
      const res = await fetch(`${apiBase}/api/pos/inward-from-delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subOrderId: subOrderIdToInward })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `Inwarded ${data.inwardedProducts.length} items into Kirana stock! 18% margin auto-applied.`
        });
        loadPosData();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Inwarding failed" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error during delivery inwarding." });
    } finally {
      setIsInwarding(false);
    }
  };

  // 4. Counter Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setStatusMessage({ type: "error", text: "Cart is empty. Add products to bill." });
      return;
    }

    if (paymentMode === "KHATA" && !customerPhone) {
      setStatusMessage({ type: "error", text: "Customer phone number is required for Udhar Khata billing." });
      return;
    }

    setLoading(true);
    try {
      const checkoutPayload = {
        retailerId,
        customerName: customerName || "Counter Walk-in",
        customerPhone: customerPhone || undefined,
        paymentMode,
        cashAmount: paymentMode === "CASH" ? cartGrandTotal : paymentMode === "SPLIT" ? splitCashAmount : 0,
        upiAmount: paymentMode === "UPI" ? cartGrandTotal : paymentMode === "SPLIT" ? splitUpiAmount : 0,
        khataAmount: paymentMode === "KHATA" ? cartGrandTotal : 0,
        discountTotal: 0,
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity
        })),
        sendWhatsAppReceipt
      };

      const res = await fetch(`${apiBase}/api/pos/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload)
      });
      const data = await res.json();

      if (data.success) {
        setCompletedBill(data.bill);
        clearCart();
        setCustomerName("");
        setCustomerPhone("");
        setStatusMessage({
          type: "success",
          text: `Bill ${data.bill.billNumber} printed! Stock deducted. WhatsApp receipt queued.`
        });
        loadPosData();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Checkout failed" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error during checkout." });
    } finally {
      setLoading(false);
    }
  };

  // 5. Day-End Register Close
  const handleCloseRegister = async () => {
    try {
      const res = await fetch(`${apiBase}/api/pos/daily-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId,
          closingCashActual: closingCashCount,
          notes: registerNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRegisterModal(false);
        setStatusMessage({
          type: "success",
          text: `Cash drawer reconciled! Discrepancy: ₹${data.register.discrepancy}. Register marked CLOSED.`
        });
        loadPosData();
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to record daily register." });
    }
  };

  // 6. Voice Search Billing (Web Speech API)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support speech recognition. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // Hindi / Hinglish recognition
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      // Auto-match product
      const matched = products.find(
        (p) => p.name.toLowerCase().includes(transcript.toLowerCase()) || transcript.toLowerCase().includes(p.name.toLowerCase())
      );
      if (matched) {
        addToCart(matched, 1);
        setStatusMessage({ type: "success", text: `Voice recognized: "${transcript}" -> Added ${matched.name}` });
      } else {
        setStatusMessage({ type: "error", text: `Heard "${transcript}". Filtered search results.` });
      }
    };

    recognition.start();
  };

  // 7. Manual Barcode Scanning via Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const match = products.find((p) => p.barcode === barcodeInput.trim());
    if (match) {
      addToCart(match, 1);
      setStatusMessage({ type: "success", text: `Barcode scanned: ${match.name}` });
      setBarcodeInput("");
    } else {
      setStatusMessage({ type: "error", text: `No product found for barcode ${barcodeInput}` });
    }
  };

  // 8. Markdown Near-Expiry Stock
  const applyExpiryMarkdown = (productId: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          const markedDown = Math.round(p.sellingPrice * 0.85 * 10) / 10;
          return { ...p, sellingPrice: markedDown, marginPct: Math.round(((markedDown - p.costPrice) / markedDown) * 100) };
        }
        return p;
      })
    );
    setStatusMessage({ type: "success", text: "15% Clearance Markdown applied to near-expiry SKU." });
  };

  // Filtered Products
  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const expiringSoonProducts = products.filter((p) => {
    if (!p.expiryDate) return false;
    const days = (new Date(p.expiryDate).getTime() - Date.now()) / 86400000;
    return days > 0 && days <= 60;
  });

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Quick Financial Overview */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Kirana POS Desk
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Bluetooth className="w-3.5 h-3.5 text-blue-400" /> ESC/POS Ready
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1 text-white">{retailerName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-Speed Offline-Tolerant Counter Billing • Automated Delivery Inwarding • Digital Khata Ledger
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <span className="text-xs text-slate-400">Today Sales</span>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                ₹{(financials?.todaySales || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <span className="text-xs text-slate-400">Cash in Drawer</span>
              <div className="text-lg font-black text-amber-300 mt-0.5">
                ₹{(financials?.expectedCashInDrawer || 1500).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <span className="text-xs text-slate-400">Customer Khata Due</span>
              <div className="text-lg font-black text-rose-400 mt-0.5">
                ₹{(financials?.totalKhataOutstanding || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <span className="text-xs text-slate-400">Gross Margin</span>
              <div className="text-lg font-black text-indigo-300 mt-0.5">
                {financials?.estimatedGrossMarginPct || 18.5}%
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Inwarding Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Package className="w-4 h-4 text-indigo-400" />
            <span>
              <strong>Platform Delivery Inward:</strong> Auto-add delivered wholesale products with 18% markup
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={subOrderIdToInward}
              onChange={(e) => setSubOrderIdToInward(e.target.value)}
              placeholder="SubOrder # (e.g. subord_001)"
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 w-full sm:w-44"
            />
            <button
              onClick={handleInwardFromDelivery}
              disabled={isInwarding}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg whitespace-nowrap flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isInwarding ? "Inwarding..." : "Auto-Inward"}
            </button>
          </div>
        </div>
      </div>

      {/* POS Sub-Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("COUNTER")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "COUNTER"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Counter Billing ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab("HOLD_CARTS")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "HOLD_CARTS"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PauseCircle className="w-4 h-4" />
            Held Carts ({heldCarts.length})
          </button>
          <button
            onClick={() => setActiveTab("BILLS")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "BILLS"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Today Bills ({recentBills.length})
          </button>
          <button
            onClick={() => setActiveTab("FEFO_EXPIRY")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "FEFO_EXPIRY"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Expiry Markdown ({expiringSoonProducts.length})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSkuModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom SKU
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            Close Day Drawer
          </button>
        </div>
      </div>

      {/* ================= TAB 1: COUNTER BILLING DESK ================= */}
      {activeTab === "COUNTER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: PRODUCT SEARCH & CATALOG */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Barcode scanning bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, brand, or barcode (e.g. Parle-G, 89017...)"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={toggleVoiceInput}
                  title="Hindi/English Voice Search"
                  className={`p-2.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
                </button>
              </div>

              {/* Fast Barcode Enter form */}
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan barcode with handheld or type and hit Enter..."
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
                >
                  Scan Add
                </button>
              </form>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const inStock = p.currentStock > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (p.isLooseWeight) {
                        setLooseModalProduct(p);
                      } else {
                        addToCart(p, 1);
                      }
                    }}
                    className={`bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm cursor-pointer transition hover:border-indigo-400 hover:shadow-md flex flex-col justify-between ${
                      !inStock ? "opacity-60 bg-slate-50" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{p.brand || "Grocery"}</span>
                        {p.isPlatformInwarded && (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            B2B Sync
                          </span>
                        )}
                        {p.isLooseWeight && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Scale className="w-2.5 h-2.5" /> Loose
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-slate-900 text-xs mt-1 line-clamp-2">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {p.packSize} • {p.barcode.slice(-6)}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-slate-900">₹{p.sellingPrice}</div>
                        {p.mrp > p.sellingPrice && (
                          <div className="text-[10px] text-slate-400 line-through">₹{p.mrp}</div>
                        )}
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold ${
                            p.currentStock <= p.minStockAlert ? "text-rose-600" : "text-emerald-700"
                          }`}
                        >
                          {p.currentStock} {p.uom}
                        </span>
                        <div className="text-[10px] text-indigo-600 font-semibold">{p.marginPct}% mgn</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 5 COLS: ACTIVE CHECKOUT DESK */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 flex flex-col justify-between min-h-[580px]">
              <div>
                {/* Cart Top Controls */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-indigo-600" />
                      Active Counter Bill
                    </h3>
                    <div className="text-xs text-slate-500">{cart.length} item(s) in counter cart</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cart.length > 0 && (
                      <>
                        <button
                          onClick={holdCurrentCart}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                          title="Hold Cart for Next Customer"
                        >
                          <PauseCircle className="w-3.5 h-3.5" /> Hold
                        </button>
                        <button
                          onClick={clearCart}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Clear Cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Customer Details Header */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (Optional)"
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp Phone (10 digits)"
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Cart Item List */}
                <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      Scan barcodes or tap products to build bill
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="pt-2 flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                          <div className="text-[11px] text-slate-500">
                            ₹{item.unitPrice} × {item.isLoose && item.weightGrams ? `${item.weightGrams}g` : item.quantity}
                          </div>
                        </div>

                        {/* Quantity adjust */}
                        <div className="flex items-center gap-1.5">
                          {!item.isLoose && (
                            <>
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <div className="w-16 text-right font-black text-xs text-slate-900">
                            ₹{item.totalPrice}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Checkout Controls */}
              <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
                {/* Total Summary */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (GST 5% Included)</span>
                    <span>₹{cartTaxTotal}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span>₹{cartGrandTotal}</span>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {(["CASH", "UPI", "KHATA", "SPLIT"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPaymentMode(mode);
                        if (mode === "CASH") setCashTendered(cartGrandTotal);
                        if (mode === "SPLIT") {
                          setSplitCashAmount(Math.round(cartGrandTotal / 2));
                          setSplitUpiAmount(cartGrandTotal - Math.round(cartGrandTotal / 2));
                        }
                      }}
                      className={`py-2 rounded-lg border text-center transition ${
                        paymentMode === mode
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {mode === "KHATA" ? "UDHAR" : mode}
                    </button>
                  ))}
                </div>

                {/* CASH TENDER SHORTCUTS */}
                {paymentMode === "CASH" && (
                  <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Cash Received:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">₹</span>
                        <input
                          type="number"
                          value={cashTendered || ""}
                          onChange={(e) => setCashTendered(Number(e.target.value))}
                          placeholder="Amount"
                          className="w-20 p-1 text-xs font-bold text-right bg-white border border-slate-300 rounded"
                        />
                      </div>
                    </div>
                    {/* Quick Tender Buttons */}
                    <div className="flex gap-1.5">
                      {[50, 100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(amt)}
                          className="flex-1 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    {cashTendered >= cartGrandTotal && (
                      <div className="flex justify-between text-xs font-bold text-emerald-700 pt-1 border-t border-slate-200">
                        <span>Change to Return:</span>
                        <span>₹{changeDue}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* UPI QR Code Preview */}
                {paymentMode === "UPI" && (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-indigo-950 flex items-center gap-1">
                        <QrCode className="w-4 h-4 text-indigo-600" />
                        Dynamic Counter QR Active
                      </div>
                      <div className="text-indigo-700 mt-0.5">upi://pay?pa=guptakirana@kotak&am={cartGrandTotal}</div>
                    </div>
                    <span className="bg-indigo-600 text-white font-bold px-2 py-1 rounded text-[11px]">
                      Instant Verify
                    </span>
                  </div>
                )}

                {/* KHATA Alert */}
                {paymentMode === "KHATA" && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Udhar Khata Ledger Entry
                    </div>
                    <div className="text-amber-700 mt-0.5">
                      Bill of ₹{cartGrandTotal} will be charged to {customerName || "Customer"}'s ledger. WhatsApp reminder queued.
                    </div>
                  </div>
                )}

                {/* WhatsApp Receipt Toggle */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWhatsAppReceipt}
                      onChange={(e) => setSendWhatsAppReceipt(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>WhatsApp e-Bill via Evolution API</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Zero-Cost API</span>
                </div>

                {/* Print & Bill Primary Action Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  {loading ? "Processing..." : `Print Receipt & Collect ₹${cartGrandTotal}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: HELD CARTS ================= */}
      {activeTab === "HOLD_CARTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-600" />
            Parked Multi-Customer Carts (Rush-Hour Queue)
          </h3>
          {heldCarts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No carts currently on hold. Put a customer cart on hold when they leave to pick extra items.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heldCarts.map((h) => (
                <div key={h.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Parked at {h.heldAt}</span>
                      <span className="font-bold text-indigo-600">{h.items.length} items</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1">{h.customerLabel}</div>
                    <div className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {h.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => resumeHeldCart(h.id)}
                    className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Resume Checkout
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: TODAY BILLS ================= */}
      {activeTab === "BILLS" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Today Generated Bills ({recentBills.length})
            </h3>
            <button onClick={loadPosData} className="p-2 text-slate-400 hover:text-slate-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBills.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No bills recorded today yet.</div>
            ) : (
              recentBills.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-sm">{b.billNumber}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Customer: {b.customerName || "Walk-in"} • Mode: {b.paymentMode} •{" "}
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">₹{b.grandTotal}</div>
                    <button
                      onClick={() => setCompletedBill(b)}
                      className="text-indigo-600 hover:underline text-[11px] font-bold"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: FEFO EXPIRY MARKDOWN ================= */}
      {activeTab === "FEFO_EXPIRY" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Shelf FEFO & Near-Expiry Clearance Radar
              </h3>
              <p className="text-xs text-slate-500">
                Items expiring in the next 60 days. Apply 1-click clearance markdowns to liquidate stock fast.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringSoonProducts.map((p) => {
              const daysLeft = Math.round(
                (new Date(p.expiryDate).getTime() - Date.now()) / 86400000
              );
              return (
                <div key={p.id} className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {daysLeft} DAYS LEFT
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Batch: {p.batchNumber} • Stock: {p.currentStock} {p.uom}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-200/60">
                    <div>
                      <span className="text-xs text-slate-400">Price: </span>
                      <strong className="text-slate-900 text-sm">₹{p.sellingPrice}</strong>
                    </div>
                    <button
                      onClick={() => applyExpiryMarkdown(p.id)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      Apply 15% Markdown
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: LOOSE GOODS WEIGHING ================= */}
      {looseModalProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Scale className="w-5 h-5 text-indigo-600" />
                Weigh Loose Item
              </h4>
              <button onClick={() => setLooseModalProduct(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm">{looseModalProduct.name}</div>
              <div className="text-xs text-slate-500">Rate: ₹{looseModalProduct.sellingPrice} / kg</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Enter Weight (Grams):</label>
              <input
                type="number"
                value={looseWeightGrams}
                onChange={(e) => setLooseWeightGrams(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-lg font-black text-center"
              />

              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setLooseWeightGrams(w)}
                    className="py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    {w >= 1000 ? `${w / 1000}kg` : `${w}g`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl text-center">
              <div className="text-xs text-indigo-800">Calculated Line Price:</div>
              <div className="text-xl font-black text-indigo-950 mt-0.5">
                ₹{Math.round((looseModalProduct.sellingPrice * (looseWeightGrams / 1000)) * 100) / 100}
              </div>
            </div>

            <button
              onClick={() => {
                addToCart(looseModalProduct, 1, looseWeightGrams);
                setLooseModalProduct(null);
              }}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Add to Bill
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD CUSTOM SKU ================= */}
      {showAddSkuModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Local Kirana Product
              </h4>
              <button onClick={() => setShowAddSkuModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Product Name</label>
                <input
                  type="text"
                  value={newSkuName}
                  onChange={(e) => setNewSkuName(e.target.value)}
                  placeholder="e.g. Local Dairy Fresh Paneer 200g"
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newSkuSellingPrice}
                    onChange={(e) => setNewSkuSellingPrice(Number(e.target.value))}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={newSkuCostPrice}
                    onChange={(e) => setNewSkuCostPrice(Number(e.target.value))}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Initial Stock Units</label>
                  <input
                    type="number"
                    value={newSkuStock}
                    onChange={(e) => setNewSkuStock(Number(e.target.value))}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Barcode (Optional)</label>
                  <input
                    type="text"
                    value={newSkuBarcode}
                    onChange={(e) => setNewSkuBarcode(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!newSkuName) return;
                const res = await fetch(`${apiBase}/api/pos/products`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    retailerId,
                    name: newSkuName,
                    sellingPrice: newSkuSellingPrice,
                    costPrice: newSkuCostPrice,
                    stockQuantity: newSkuStock,
                    barcode: newSkuBarcode || undefined,
                    category: newSkuCategory
                  })
                });
                const data = await res.json();
                if (data.success) {
                  setShowAddSkuModal(false);
                  setNewSkuName("");
                  loadPosData();
                  setStatusMessage({ type: "success", text: `Added ${data.product.name} to POS!` });
                }
              }}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Save Product to POS
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: COMPLETED RECEIPT VIEW ================= */}
      {completedBill && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 font-mono">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-slate-900 text-sm">ESC/POS Thermal Receipt</h4>
              <button onClick={() => setCompletedBill(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Slip Content */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
              <div className="text-center">
                <div className="font-black text-sm text-slate-900">{retailerName}</div>
                <div className="text-[10px] text-slate-500">GSTIN: 09AABCA1234F1Z5 • Phone: 9555555555</div>
                <div className="border-b border-dashed border-slate-300 my-2" />
                <div className="text-[11px] font-bold">TAX INVOICE / रसीद</div>
                <div className="text-[10px] text-slate-600">{completedBill.billNumber}</div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-2" />

              <div className="space-y-1">
                {completedBill.items?.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">
                      {it.quantity}x {it.name}
                    </span>
                    <span>₹{it.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-300 my-2" />

              <div className="flex justify-between font-black text-sm">
                <span>TOTAL:</span>
                <span>₹{completedBill.grandTotal}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Payment Mode:</span>
                <span>{completedBill.paymentMode}</span>
              </div>
              <div className="text-center text-[10px] text-slate-400 pt-2">
                Thank you for shopping local!
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print 58mm
              </button>
              <button
                onClick={() => setCompletedBill(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DAY-END CASH COUNT ================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Day-End Cash Drawer Close
              </h4>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Opening Float:</span>
                  <span>₹1,500</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Today Cash Sales:</span>
                  <span>₹{financials?.todayCashSales || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Expected Drawer Cash:</span>
                  <span>₹{financials?.expectedCashInDrawer || 1500}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Counted Actual Drawer Cash (₹):</label>
                <input
                  type="number"
                  value={closingCashCount}
                  onChange={(e) => setClosingCashCount(Number(e.target.value))}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-lg font-black text-center"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Notes / Remarks</label>
                <input
                  type="text"
                  value={registerNotes}
                  onChange={(e) => setRegisterNotes(e.target.value)}
                  placeholder="e.g. ₹50 loose coin deficit"
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={handleCloseRegister}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
            >
              Reconcile & Close Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
