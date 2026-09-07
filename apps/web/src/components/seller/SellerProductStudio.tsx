"use client";

import React, { useState, useEffect } from "react";
import {
  PackagePlus,
  PackageCheck,
  Boxes,
  Tag,
  Percent,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

interface SellerProductStudioProps {
  apiBase: string;
  organizationId?: string;
}

export default function SellerProductStudio({
  apiBase,
  organizationId = "org_anagata_fmcg"
}: SellerProductStudioProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [isGrouped, setIsGrouped] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Biscuits & Confectionery");
  const [brand, setBrand] = useState("Parle");
  const [description, setDescription] = useState("");
  const [hsnCode, setHsnCode] = useState("19053100");
  const [gstRatePct, setGstRatePct] = useState(18);
  const [skuCode, setSkuCode] = useState("");
  const [unitTitle, setUnitTitle] = useState("Master Carton");
  const [unitMultiplier, setUnitMultiplier] = useState(24);
  const [packMultiplier, setPackMultiplier] = useState(6);
  const [cartonMultiplier, setCartonMultiplier] = useState(24);
  const [mrp, setMrp] = useState(1200);
  const [wholesalePrice, setWholesalePrice] = useState(960);
  const [moq, setMoq] = useState(2);
  const [stockQuantity, setStockQuantity] = useState(100);

  // Dynamic Volume Slabs
  const [slabs, setSlabs] = useState<Array<{ minQuantity: number; pricePerUnit: number; discountPct: number; label: string }>>([
    { minQuantity: 2, pricePerUnit: 960, discountPct: 20, label: "2 - 4 Cartons (Base)" },
    { minQuantity: 5, pricePerUnit: 920, discountPct: 23.3, label: "5 - 9 Cartons (₹40 Off)" },
    { minQuantity: 10, pricePerUnit: 880, discountPct: 26.6, label: "10+ Cartons Special" }
  ]);

  // Grouped Bundle Child Items
  const [bundleItems, setBundleItems] = useState<Array<{ productSkuId: string; productName: string; skuCode: string; unitQuantity: number }>>([
    { productSkuId: "sku_parle_carton", productName: "Parle-G Master Carton (72 pkts)", skuCode: "PARLE-G-80G-CTN-72", unitQuantity: 2 }
  ]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/seller/products?organizationId=${organizationId}`).then((r) => r.json());
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load seller catalog" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [organizationId]);

  const resetForm = () => {
    setIsGrouped(false);
    setName("");
    setCategory("Biscuits & Confectionery");
    setBrand("Parle");
    setDescription("");
    setHsnCode("19053100");
    setGstRatePct(18);
    setSkuCode("");
    setUnitTitle("Master Carton");
    setUnitMultiplier(24);
    setPackMultiplier(6);
    setCartonMultiplier(24);
    setMrp(1200);
    setWholesalePrice(960);
    setMoq(2);
    setStockQuantity(100);
    setSlabs([
      { minQuantity: 2, pricePerUnit: 960, discountPct: 20, label: "2 - 4 Cartons (Base)" },
      { minQuantity: 5, pricePerUnit: 920, discountPct: 23.3, label: "5 - 9 Cartons" }
    ]);
    setEditingProductId(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !skuCode) {
      setMessage({ type: "error", text: "Product Name and SKU Code are required" });
      return;
    }

    const payload = {
      organizationId,
      name,
      category,
      brand,
      description,
      hsnCode,
      gstRatePct: Number(gstRatePct),
      marginPct: Math.round(((mrp - wholesalePrice) / mrp) * 100 * 10) / 10,
      skus: [
        {
          skuCode,
          unitTitle,
          unitMultiplier: Number(unitMultiplier),
          packMultiplier: Number(packMultiplier),
          cartonMultiplier: Number(cartonMultiplier),
          mrp: Number(mrp),
          wholesalePrice: Number(wholesalePrice),
          minimumOrderQuantity: Number(moq),
          stockQuantity: Number(stockQuantity),
          isActive: true,
          isGroupedBundle: isGrouped,
          bundleItems: isGrouped ? bundleItems : undefined,
          pricingSlabs: slabs
        }
      ]
    };

    try {
      const res = await fetch(`${apiBase}/api/seller/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((r) => r.json());

      if (res.success) {
        setMessage({ type: "success", text: "Product SKU added to wholesale catalog successfully!" });
        setShowAddModal(false);
        resetForm();
        loadProducts();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save product" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving product" });
    }
  };

  const handleAddSlab = () => {
    const nextQty = slabs.length > 0 ? slabs[slabs.length - 1].minQuantity + 5 : 5;
    const nextPrice = wholesalePrice > 50 ? wholesalePrice - 40 : wholesalePrice;
    const disc = Math.round(((mrp - nextPrice) / mrp) * 100 * 10) / 10;
    setSlabs([...slabs, { minQuantity: nextQty, pricePerUnit: nextPrice, discountPct: disc, label: `${nextQty}+ Units Bulk` }]);
  };

  const handleRemoveSlab = (idx: number) => {
    setSlabs(slabs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold text-xs border border-indigo-400/30">
              Seller Merchandising Studio
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-400/30">
              0% Platform Commission
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2 tracking-tight">Wholesale Catalog & Grouped Combos</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Configure single SKUs, master combo bundles, packaging multipliers, and automated volume discount tiers for retailers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/10"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <PackagePlus className="w-4 h-4" />
            Add New Product SKU
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Boxes className="w-4 h-4 text-indigo-600" />
            Active Wholesale SKUs & Bundles ({products.length})
          </h3>
          <span className="text-xs text-slate-500">Live inventory synced with kirana ordering portals</span>
        </div>

        <div className="divide-y divide-slate-100">
          {products.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No products configured yet. Click "Add New Product SKU" above.</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-6 hover:bg-slate-50/50 transition">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Boxes className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{p.name}</span>
                        {p.skus?.some((s: any) => s.isGroupedBundle) && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold border border-purple-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            COMBO BUNDLE
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl">{p.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                        <span>
                          HSN: <strong className="text-slate-800">{p.hsnCode}</strong>
                        </span>
                        <span>
                          GST Rate: <strong className="text-slate-800">{p.gstRatePct}%</strong>
                        </span>
                        <span>
                          Brand: <strong className="text-slate-800">{p.brand}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SKU Cards */}
                  <div className="lg:w-80 flex flex-col gap-2">
                    {p.skus?.map((sku: any) => (
                      <div key={sku.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{sku.unitTitle}</span>
                          <span className="font-mono text-[10px] text-slate-500">{sku.skuCode}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span>
                            Wholesale: <strong className="text-emerald-700 text-sm">₹{sku.wholesalePrice}</strong>
                          </span>
                          <span className="line-through text-slate-400">MRP ₹{sku.mrp}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {Math.round(((sku.mrp - sku.wholesalePrice) / sku.mrp) * 100)}% Margin
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <span>Stock: <strong className="text-slate-800">{sku.stockQuantity}</strong></span>
                          <span>MOQ: <strong className="text-slate-800">{sku.minimumOrderQuantity}</strong></span>
                          {sku.packMultiplier && <span>Pack: {sku.packMultiplier}u</span>}
                          {sku.cartonMultiplier && <span>Ctn: {sku.cartonMultiplier}u</span>}
                        </div>
                        {sku.pricingSlabs && sku.pricingSlabs.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-slate-200/40">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                              Volume Discount Tiers:
                            </span>
                            <div className="space-y-0.5">
                              {sku.pricingSlabs.map((s: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[10px] text-slate-600">
                                  <span>{s.label || `${s.minQuantity}+ units`}</span>
                                  <strong className="text-indigo-700">₹{s.pricePerUnit} ({s.discountPct}% off)</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {sku.isGroupedBundle && sku.bundleItems && (
                          <div className="mt-1 pt-1 border-t border-purple-200">
                            <span className="text-[10px] text-purple-700 font-bold block mb-1">
                              Atomically Deducts Child SKUs:
                            </span>
                            {sku.bundleItems.map((bi: any, bIdx: number) => (
                              <div key={bIdx} className="text-[10px] text-slate-600 flex justify-between">
                                <span>• {bi.productName}</span>
                                <strong>×{bi.unitQuantity}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Wholesale SKU / Grouped Combo</h3>
                <p className="text-xs text-slate-500">Configure packaging, pricing slabs, and catalog metadata</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Type Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900">Grouped Master Combo Bundle</span>
                  <p className="text-xs text-slate-500">Atomically reduces underlying child SKU inventory upon purchase</p>
                </div>
                <input
                  type="checkbox"
                  checked={isGrouped}
                  onChange={(e) => setIsGrouped(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Parle-G Master Carton (72 pkts)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Parle / Tata / Britannia"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Biscuits & Confectionery">Biscuits & Confectionery</option>
                    <option value="Tea & Beverages">Tea & Beverages</option>
                    <option value="Cold Drinks & Beverages">Cold Drinks & Beverages</option>
                    <option value="Dairy & Spreads">Dairy & Spreads</option>
                    <option value="Edibles & Oils">Edibles & Oils</option>
                    <option value="Combos & Bundles">Combos & Bundles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">HSN Code *</label>
                  <input
                    type="text"
                    required
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 19053100"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={gstRatePct}
                    onChange={(e) => setGstRatePct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Staples / Dairy)</option>
                    <option value={12}>12% (Packaged Food)</option>
                    <option value={18}>18% (Biscuits / Personal)</option>
                    <option value={28}>28% (Aerated Drinks)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Wholesale packaging information, shelf life, high-margin highlights..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* SKU & Packaging Multipliers */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Wholesale Unit & Packaging Hierarchy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SKU Code *</label>
                    <input
                      type="text"
                      required
                      value={skuCode}
                      onChange={(e) => setSkuCode(e.target.value)}
                      placeholder="e.g. PARLE-80G-CTN"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit Title</label>
                    <input
                      type="text"
                      value={unitTitle}
                      onChange={(e) => setUnitTitle(e.target.value)}
                      placeholder="e.g. Master Carton (72 pkts)"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Packs per Box</label>
                    <input
                      type="number"
                      value={packMultiplier}
                      onChange={(e) => setPackMultiplier(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Packs per Carton</label>
                    <input
                      type="number"
                      value={cartonMultiplier}
                      onChange={(e) => setCartonMultiplier(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={mrp}
                      onChange={(e) => setMrp(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Wholesale (₹)</label>
                    <input
                      type="number"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MOQ (Min Order Qty)</label>
                    <input
                      type="number"
                      value={moq}
                      onChange={(e) => setMoq(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Volume Pricing Slabs */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-indigo-600" />
                    Volume Discount Slabs
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSlab}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Tier
                  </button>
                </div>

                <div className="space-y-2">
                  {slabs.map((slab, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-indigo-100">
                      <span className="font-bold text-slate-700 w-16">Min {slab.minQuantity}u:</span>
                      <input
                        type="text"
                        value={slab.label}
                        onChange={(e) => {
                          const updated = [...slabs];
                          updated[idx].label = e.target.value;
                          setSlabs(updated);
                        }}
                        className="px-2 py-1 border border-slate-200 rounded flex-1 text-xs"
                      />
                      <span className="text-slate-500">₹</span>
                      <input
                        type="number"
                        value={slab.pricePerUnit}
                        onChange={(e) => {
                          const updated = [...slabs];
                          updated[idx].pricePerUnit = Number(e.target.value);
                          updated[idx].discountPct = Math.round(((mrp - Number(e.target.value)) / mrp) * 100 * 10) / 10;
                          setSlabs(updated);
                        }}
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-xs font-bold text-indigo-800"
                      />
                      <span className="text-emerald-700 font-bold w-16 text-right">{slab.discountPct}% off</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlab(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow"
                >
                  Publish Product SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
