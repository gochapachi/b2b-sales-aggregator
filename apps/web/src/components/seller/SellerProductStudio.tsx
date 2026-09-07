"use client";

import React, { useState, useEffect } from "react";
import {
  PackagePlus,
  PackageCheck,
  Boxes,
  Tag,
  Percent,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Info,
  Archive,
  X,
  FileText,
  ShieldCheck,
  PackageOpen
} from "lucide-react";
import SlideOverDrawer from "../common/SlideOverDrawer";
import EmptyState from "../common/EmptyState";

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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // View Details Drawer State
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editHsnCode, setEditHsnCode] = useState("");
  const [editGstRatePct, setEditGstRatePct] = useState(18);
  const [editWholesalePrice, setEditWholesalePrice] = useState(0);
  const [editMrp, setEditMrp] = useState(0);
  const [editMoq, setEditMoq] = useState(1);
  const [editStockQuantity, setEditStockQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editPackMultiplier, setEditPackMultiplier] = useState(1);
  const [editCartonMultiplier, setEditCartonMultiplier] = useState(1);
  const [editSlabs, setEditSlabs] = useState<Array<{ minQuantity: number; pricePerUnit: number; discountPct: number; label: string }>>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Delete / Archive Modal State
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleteMode, setDeleteMode] = useState<"ARCHIVE" | "HARD_DELETE">("ARCHIVE");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Product Form State
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

  // Dynamic Volume Slabs for Add Modal
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

  const resetAddForm = () => {
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
        resetAddForm();
        loadProducts();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save product" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving product" });
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (p: any) => {
    const primarySku = p.skus && p.skus.length > 0 ? p.skus[0] : null;
    setEditingProduct(p);
    setEditName(p.name || "");
    setEditBrand(p.brand || "");
    setEditCategory(p.category || "Biscuits & Confectionery");
    setEditDescription(p.description || "");
    setEditHsnCode(p.hsnCode || "19053100");
    setEditGstRatePct(p.gstRatePct || 18);
    setEditStatus(p.status || (p.isArchived ? "ARCHIVED" : "ACTIVE"));

    const wp = p.wholesalePrice ?? primarySku?.wholesalePrice ?? 960;
    const mrpVal = p.mrp ?? primarySku?.mrp ?? 1200;
    const moqVal = p.moq ?? primarySku?.minimumOrderQuantity ?? 2;
    const stockVal = p.stock ?? primarySku?.stockQuantity ?? 100;
    const packVal = p.packMultiplier ?? primarySku?.packMultiplier ?? 6;
    const cartonVal = p.cartonMultiplier ?? primarySku?.cartonMultiplier ?? 24;
    const slabsVal = p.pricingSlabs ?? primarySku?.pricingSlabs ?? [];

    setEditWholesalePrice(wp);
    setEditMrp(mrpVal);
    setEditMoq(moqVal);
    setEditStockQuantity(stockVal);
    setEditPackMultiplier(packVal);
    setEditCartonMultiplier(cartonVal);
    setEditSlabs(slabsVal.length > 0 ? slabsVal : [
      { minQuantity: moqVal, pricePerUnit: wp, discountPct: Math.round(((mrpVal - wp) / mrpVal) * 100), label: `${moqVal}+ Base` }
    ]);
  };

  // Submit Edit Modal calling PUT /api/seller/products/:id
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);

    const calculatedMargin = editMrp > 0
      ? Math.round(((editMrp - editWholesalePrice) / editMrp) * 100 * 10) / 10
      : 0;

    const payload = {
      name: editName,
      brand: editBrand,
      category: editCategory,
      description: editDescription,
      hsnCode: editHsnCode,
      gstRatePct: Number(editGstRatePct),
      wholesalePrice: Number(editWholesalePrice),
      mrp: Number(editMrp),
      stock: Number(editStockQuantity),
      moq: Number(editMoq),
      status: editStatus,
      isArchived: editStatus === "ARCHIVED",
      packMultiplier: Number(editPackMultiplier),
      cartonMultiplier: Number(editCartonMultiplier),
      pricingSlabs: editSlabs,
      marginPct: calculatedMargin,
      // If product has skus array, also sync the primary sku
      skus: editingProduct.skus?.map((s: any, idx: number) => {
        if (idx === 0) {
          return {
            ...s,
            wholesalePrice: Number(editWholesalePrice),
            mrp: Number(editMrp),
            stockQuantity: Number(editStockQuantity),
            minimumOrderQuantity: Number(editMoq),
            packMultiplier: Number(editPackMultiplier),
            cartonMultiplier: Number(editCartonMultiplier),
            pricingSlabs: editSlabs,
            isActive: editStatus !== "ARCHIVED"
          };
        }
        return s;
      })
    };

    try {
      const res = await fetch(`${apiBase}/api/seller/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((r) => r.json());

      if (res.success) {
        setMessage({ type: "success", text: `Product "${editName}" updated successfully in wholesale catalog!` });
        setEditingProduct(null);
        loadProducts();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update product" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error updating product" });
    } finally {
      setEditSaving(false);
    }
  };

  // Submit Delete / Archive calling DELETE /api/seller/products/:id
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const isArchive = deleteMode === "ARCHIVE";
      const queryParam = isArchive ? "?archive=true" : "?hardDelete=true";
      const res = await fetch(`${apiBase}/api/seller/products/${deletingProduct.id}${queryParam}`, {
        method: "DELETE"
      }).then((r) => r.json());

      if (res.success) {
        setMessage({
          type: "success",
          text: isArchive
            ? `Product "${deletingProduct.name}" archived successfully.`
            : `Product "${deletingProduct.name}" permanently deleted.`
        });
        setDeletingProduct(null);
        loadProducts();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to delete product" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error deleting product" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Slab helpers for Edit modal
  const handleAddEditSlab = () => {
    const nextQty = editSlabs.length > 0 ? editSlabs[editSlabs.length - 1].minQuantity + 5 : 5;
    const nextPrice = editWholesalePrice > 50 ? editWholesalePrice - 40 : editWholesalePrice;
    const disc = editMrp > 0 ? Math.round(((editMrp - nextPrice) / editMrp) * 100 * 10) / 10 : 0;
    setEditSlabs([...editSlabs, { minQuantity: nextQty, pricePerUnit: nextPrice, discountPct: disc, label: `${nextQty}+ Units Bulk` }]);
  };

  const handleRemoveEditSlab = (idx: number) => {
    setEditSlabs(editSlabs.filter((_, i) => i !== idx));
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
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/10"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              resetAddForm();
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
          <button type="button" onClick={() => setMessage(null)} className="text-xs hover:underline">
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

        <div>
          {products.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No Products in Catalog"
              description="You have not added any wholesale products or combos yet. Create your first product SKU to make it available for Kiranas across your beat."
              actionLabel="Add New Product SKU"
              onAction={() => {
                resetAddForm();
                setShowAddModal(true);
              }}
              className="m-6"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {products.map((p) => {
                const primarySku = p.skus && p.skus.length > 0 ? p.skus[0] : null;
                const wholesalePriceVal = p.wholesalePrice ?? primarySku?.wholesalePrice ?? 0;
                const mrpVal = p.mrp ?? primarySku?.mrp ?? 0;
                const marginRs = Math.max(0, mrpVal - wholesalePriceVal);
                const marginPercent = mrpVal > 0 ? Math.round((marginRs / mrpVal) * 100) : (p.marginPct || 0);
                const isArchived = p.status === "ARCHIVED" || p.isArchived;

                return (
                  <div key={p.id} className="p-6 hover:bg-slate-50/50 transition">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Product Details Header & Action Buttons */}
                      <div className="flex items-start gap-4 flex-1">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Boxes className="w-8 h-8" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
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
                            {isArchived ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                                ARCHIVED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1 max-w-xl">{p.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                            <span>
                              HSN: <strong className="text-slate-800">{p.hsnCode}</strong>
                            </span>
                            <span>
                              GST: <strong className="text-slate-800">{p.gstRatePct}%</strong>
                            </span>
                            <span>
                              Brand: <strong className="text-slate-800">{p.brand}</strong>
                            </span>
                            <span>
                              Wholesale: <strong className="text-emerald-700 font-bold">₹{wholesalePriceVal}</strong>
                            </span>
                            <span>
                              MRP: <strong className="text-slate-800">₹{mrpVal}</strong>
                            </span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                              {marginPercent}% Retail Margin
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: View, Edit, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingProduct(p)}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                            title="View Complete SKU Specs & Volume Slabs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Edit Product & Pricing"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingProduct(p);
                              setDeleteMode("ARCHIVE");
                            }}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="Archive / Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* SKU Cards Preview */}
                      <div className="lg:w-80 flex flex-col gap-2 shrink-0">
                        {p.skus?.map((sku: any) => (
                          <div key={sku.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{sku.unitTitle}</span>
                              <span className="font-mono text-[10px] text-slate-500">{sku.skuCode}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                              <span>
                                Buy: <strong className="text-emerald-700 text-sm">₹{sku.wholesalePrice}</strong>
                              </span>
                              <span className="line-through text-slate-400">MRP ₹{sku.mrp}</span>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                {sku.mrp > 0 ? Math.round(((sku.mrp - sku.wholesalePrice) / sku.mrp) * 100) : 0}% Margin
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= 1. VIEW PRODUCT DETAILS DRAWER ================= */}
      {viewingProduct && (
        <SlideOverDrawer
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          title={viewingProduct.name}
          subtitle={`Brand: ${viewingProduct.brand} • Category: ${viewingProduct.category}`}
          icon={Eye}
          width="max-w-2xl"
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  handleOpenEdit(p);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit This Product
              </button>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          }
        >
          {/* Main Specifications Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  {viewingProduct.brand}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{viewingProduct.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{viewingProduct.description || "No description provided."}</p>
              </div>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  viewingProduct.status === "ARCHIVED" || viewingProduct.isArchived
                    ? "bg-rose-100 text-rose-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {viewingProduct.status || "ACTIVE"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">HSN Code</span>
                <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{viewingProduct.hsnCode}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">GST Rate</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{viewingProduct.gstRatePct}%</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Base Wholesale</span>
                <div className="font-black text-emerald-700 text-sm mt-0.5">
                  ₹{viewingProduct.wholesalePrice ?? viewingProduct.skus?.[0]?.wholesalePrice ?? 0}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Retail MRP</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  ₹{viewingProduct.mrp ?? viewingProduct.skus?.[0]?.mrp ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Packaging Multipliers & Inventory Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-indigo-600" />
              Packaging Multipliers & Inventory Levels
            </h4>
            {viewingProduct.skus?.map((sku: any, sIdx: number) => {
              const packMul = sku.packMultiplier || 1;
              const ctnMul = sku.cartonMultiplier || 1;
              const totalUnitsPerCarton = packMul * ctnMul;

              return (
                <div key={sIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{sku.unitTitle}</span>
                      <span className="text-[11px] font-mono text-slate-400 ml-2">SKU: {sku.skuCode}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Available Stock: {sku.stockQuantity} cartons
                    </span>
                  </div>

                  {/* Packaging Formula Display */}
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>Packaging Ratio:</strong> 1 Master Carton = <strong>{ctnMul} packs</strong> = <strong>{totalUnitsPerCarton} consumer units</strong> (MOQ: {sku.minimumOrderQuantity} cartons).
                    </span>
                  </div>

                  {/* Volume Pricing Slabs Table */}
                  {sku.pricingSlabs && sku.pricingSlabs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Volume Discount Slab Matrix:
                      </span>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase">
                            <tr>
                              <th className="py-2 px-3">Tier Label</th>
                              <th className="py-2 px-3 text-center">Min Qty</th>
                              <th className="py-2 px-3 text-right">Wholesale Rate</th>
                              <th className="py-2 px-3 text-center">Discount %</th>
                              <th className="py-2 px-3 text-right">Retailer Savings</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sku.pricingSlabs.map((slab: any, idx: number) => {
                              const savings = Math.max(0, (sku.wholesalePrice || 0) - slab.pricePerUnit);
                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-medium text-slate-800">{slab.label || `${slab.minQuantity}+ units`}</td>
                                  <td className="py-2 px-3 text-center font-bold text-slate-700">{slab.minQuantity}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">₹{slab.pricePerUnit}</td>
                                  <td className="py-2 px-3 text-center font-bold text-indigo-600">{slab.discountPct}%</td>
                                  <td className="py-2 px-3 text-right font-bold text-emerald-600">+₹{savings}/unit</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Combo bundle breakdown */}
                  {sku.isGroupedBundle && sku.bundleItems && (
                    <div className="pt-2 border-t border-purple-100 space-y-1">
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                        Atomic Deductions for Child SKUs:
                      </span>
                      <div className="space-y-1">
                        {sku.bundleItems.map((bi: any, bIdx: number) => (
                          <div key={bIdx} className="text-xs bg-purple-50/70 p-2 rounded-lg border border-purple-100 flex justify-between">
                            <span className="text-purple-900 font-medium">• {bi.productName} ({bi.skuCode})</span>
                            <span className="font-black text-purple-800">×{bi.unitQuantity} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SlideOverDrawer>
      )}

      {/* ================= 2. EDIT PRODUCT MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">Edit Product & Wholesale Pricing</h3>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    ID: {editingProduct.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Changes persist directly to database and live ordering portals via PUT /api/seller/products/:id
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Biscuits & Confectionery">Biscuits & Confectionery</option>
                    <option value="Edible Oils & Ghee">Edible Oils & Ghee</option>
                    <option value="Spices & Masalas">Spices & Masalas</option>
                    <option value="Beverages & Tea">Beverages & Tea</option>
                    <option value="Atta, Rice & Dals">Atta, Rice & Dals</option>
                    <option value="Personal & Home Care">Personal & Home Care</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={editHsnCode}
                    onChange={(e) => setEditHsnCode(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE (Listed)</option>
                    <option value="ARCHIVED">ARCHIVED (Delisted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Pricing, Margin & Multipliers */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Wholesale Pricing & Margins</span>
                  {editMrp > 0 && (
                    <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[11px]">
                      Margin: ₹{Math.max(0, editMrp - editWholesalePrice)} (
                      {Math.round(((editMrp - editWholesalePrice) / editMrp) * 100)}%)
                    </span>
                  )}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Wholesale Rate (₹)</label>
                    <input
                      type="number"
                      value={editWholesalePrice}
                      onChange={(e) => setEditWholesalePrice(Number(e.target.value))}
                      required
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={editMrp}
                      onChange={(e) => setEditMrp(Number(e.target.value))}
                      required
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Stock (Cartons)</label>
                    <input
                      type="number"
                      value={editStockQuantity}
                      onChange={(e) => setEditStockQuantity(Number(e.target.value))}
                      required
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">MOQ (Cartons)</label>
                    <input
                      type="number"
                      value={editMoq}
                      onChange={(e) => setEditMoq(Number(e.target.value))}
                      required
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Packs / Ctn</label>
                    <input
                      type="number"
                      value={editPackMultiplier}
                      onChange={(e) => setEditPackMultiplier(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Units / Pack</label>
                    <input
                      type="number"
                      value={editCartonMultiplier}
                      onChange={(e) => setEditCartonMultiplier(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">GST Rate (%)</label>
                    <select
                      value={editGstRatePct}
                      onChange={(e) => setEditGstRatePct(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Volume Slabs Editor in Edit Modal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Volume Discount Slabs</label>
                  <button
                    type="button"
                    onClick={handleAddEditSlab}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier Slab
                  </button>
                </div>
                <div className="space-y-2">
                  {editSlabs.map((slab, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <input
                        type="text"
                        placeholder="Label"
                        value={slab.label}
                        onChange={(e) => {
                          const updated = [...editSlabs];
                          updated[idx].label = e.target.value;
                          setEditSlabs(updated);
                        }}
                        className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">Min:</span>
                        <input
                          type="number"
                          value={slab.minQuantity}
                          onChange={(e) => {
                            const updated = [...editSlabs];
                            updated[idx].minQuantity = Number(e.target.value);
                            setEditSlabs(updated);
                          }}
                          className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[11px]">₹:</span>
                        <input
                          type="number"
                          value={slab.pricePerUnit}
                          onChange={(e) => {
                            const updated = [...editSlabs];
                            const pVal = Number(e.target.value);
                            updated[idx].pricePerUnit = pVal;
                            updated[idx].discountPct = editMrp > 0 ? Math.round(((editMrp - pVal) / editMrp) * 100) : 0;
                            setEditSlabs(updated);
                          }}
                          className="w-20 p-1.5 border border-slate-200 rounded-lg text-xs text-center font-bold text-emerald-700"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditSlab(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {editSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Changes (PUT /api)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 3. DELETE / ARCHIVE CONFIRMATION MODAL ================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Archive / Delete SKU
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm action for <span className="font-semibold text-slate-800">{deletingProduct.name}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delMode"
                  checked={deleteMode === "ARCHIVE"}
                  onChange={() => setDeleteMode("ARCHIVE")}
                  className="text-indigo-600"
                />
                <div>
                  <div className="font-bold text-slate-800">Soft Archive (Recommended)</div>
                  <div className="text-[11px] text-slate-500">Delists SKU from storefront while preserving past order history.</div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200">
                <input
                  type="radio"
                  name="delMode"
                  checked={deleteMode === "HARD_DELETE"}
                  onChange={() => setDeleteMode("HARD_DELETE")}
                  className="text-rose-600"
                />
                <div>
                  <div className="font-bold text-rose-700">Permanent Hard Delete</div>
                  <div className="text-[11px] text-slate-500">Permanently purges this SKU record from the database.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {deleteLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleteMode === "ARCHIVE" ? "Archive Product" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. ADD PRODUCT MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Wholesale SKU / Grouped Combo</h3>
                <p className="text-xs text-slate-500">Configure packaging, pricing slabs, and catalog metadata</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Type Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsGrouped(false)}
                  className={`py-2 rounded-lg transition ${!isGrouped ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                >
                  Single Wholesale SKU
                </button>
                <button
                  type="button"
                  onClick={() => setIsGrouped(true)}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    isGrouped ? "bg-purple-600 text-white shadow" : "text-slate-500"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Grouped Combo Bundle
                </button>
              </div>

              {/* Master Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Parle-G Gold Master Carton"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Parle"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Biscuits & Confectionery">Biscuits & Confectionery</option>
                    <option value="Edible Oils & Ghee">Edible Oils & Ghee</option>
                    <option value="Spices & Masalas">Spices & Masalas</option>
                    <option value="Beverages & Tea">Beverages & Tea</option>
                    <option value="Atta, Rice & Dals">Atta, Rice & Dals</option>
                    <option value="Personal & Home Care">Personal & Home Care</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                  <select
                    value={gstRatePct}
                    onChange={(e) => setGstRatePct(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Packaging Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Shrink-wrapped moisture-resistant master packaging for kiranas"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Packaging Multipliers */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Packaging Multiplier Ratio</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={skuCode}
                      onChange={(e) => setSkuCode(e.target.value)}
                      placeholder="e.g. PARLE-G-CTN-72"
                      required
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Unit Title</label>
                    <input
                      type="text"
                      value={unitTitle}
                      onChange={(e) => setUnitTitle(e.target.value)}
                      placeholder="Master Carton"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Packs / Ctn</label>
                    <input
                      type="number"
                      value={packMultiplier}
                      onChange={(e) => setPackMultiplier(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Units / Pack</label>
                    <input
                      type="number"
                      value={cartonMultiplier}
                      onChange={(e) => setCartonMultiplier(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Wholesale (₹)</label>
                  <input
                    type="number"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">MOQ</label>
                  <input
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Volume Slabs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Volume Discount Slabs (Auto-applied in cart)</label>
                  <button
                    type="button"
                    onClick={handleAddSlab}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {slabs.map((slab, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                      <input
                        type="text"
                        value={slab.label}
                        onChange={(e) => {
                          const updated = [...slabs];
                          updated[idx].label = e.target.value;
                          setSlabs(updated);
                        }}
                        className="flex-1 p-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        value={slab.minQuantity}
                        onChange={(e) => {
                          const updated = [...slabs];
                          updated[idx].minQuantity = Number(e.target.value);
                          setSlabs(updated);
                        }}
                        className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs text-center"
                      />
                      <input
                        type="number"
                        value={slab.pricePerUnit}
                        onChange={(e) => {
                          const updated = [...slabs];
                          const pVal = Number(e.target.value);
                          updated[idx].pricePerUnit = pVal;
                          updated[idx].discountPct = Math.round(((mrp - pVal) / mrp) * 100);
                          setSlabs(updated);
                        }}
                        className="w-20 p-1.5 border border-slate-200 rounded-lg text-xs text-center font-bold text-emerald-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSlab(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <PackagePlus className="w-4 h-4" />
                  Add SKU to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
