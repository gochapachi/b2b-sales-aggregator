"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Check
} from "lucide-react";

interface ErpUniversalColumnMapperProps {
  apiBase: string;
  organizationId?: string;
  onImportSuccess?: () => void;
}

export default function ErpUniversalColumnMapper({
  apiBase,
  organizationId = "org_anagata_fmcg",
  onImportSuccess
}: ErpUniversalColumnMapperProps) {
  const [selectedFormat, setSelectedFormat] = useState<"CSV" | "XML">("CSV");
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([
    "Item_Desc",
    "Barcode",
    "Rate_Wholesale",
    "Max_Retail_Price",
    "Qty_Available",
    "HSN_Code",
    "Tax_Slab"
  ]);

  const [sampleRows, setSampleRows] = useState<any[][]>([
    ["Britannia Good Day Butter 100g", "8901063012345", "28.5", "35", "120", "19053100", "5"],
    ["Parle Krackjack Sweet & Salty 65g", "8901719102021", "16.2", "20", "250", "19053100", "5"],
    ["Tata Tea Gold 250g Jar", "8901052002103", "118.0", "140", "80", "09024010", "5"],
    ["Fortune Sunlite Refined Oil 1L", "8906007281014", "132.0", "155", "60", "15121910", "5"]
  ]);

  const [columnMapping, setColumnMapping] = useState<{ [platformField: string]: string }>({
    productName: "Item_Desc",
    skuCode: "Barcode",
    wholesalePrice: "Rate_Wholesale",
    mrp: "Max_Retail_Price",
    currentStock: "Qty_Available",
    gstRatePct: "Tax_Slab",
    category: "Item_Desc"
  });

  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const platformFields = [
    { key: "productName", label: "Product Name *", required: true },
    { key: "skuCode", label: "SKU / Barcode Code", required: false },
    { key: "wholesalePrice", label: "Wholesale Rate (Buy Price) *", required: true },
    { key: "mrp", label: "Maximum Retail Price (MRP) *", required: true },
    { key: "currentStock", label: "Current Godown Stock *", required: true },
    { key: "gstRatePct", label: "GST Tax Rate %", required: false }
  ];

  // Apply ERP Preset
  const applyPreset = (presetName: "TALLY" | "MARG" | "BUSY") => {
    if (presetName === "TALLY") {
      setDetectedHeaders(["STOCKITEM_NAME", "GUID_BARCODE", "OPENING_RATE", "MRP_RATE", "OPENING_BALANCE", "HSN_CODE"]);
      setSampleRows([
        ["Parle Hide & Seek 120g", "8901719103035", "42.0", "50", "150", "19053100"],
        ["Tata Salt Vacuum Evaporated 1kg", "8901058001018", "23.5", "28", "400", "25010010"]
      ]);
      setColumnMapping({
        productName: "STOCKITEM_NAME",
        skuCode: "GUID_BARCODE",
        wholesalePrice: "OPENING_RATE",
        mrp: "MRP_RATE",
        currentStock: "OPENING_BALANCE",
        gstRatePct: ""
      });
    } else if (presetName === "MARG") {
      setDetectedHeaders(["Item_Name", "Barcode_No", "Rate_A", "M.R.P.", "Cl_Stock", "Tax_Per"]);
      setSampleRows([
        ["Amul Butter 100g", "8901262010012", "51.0", "58", "90", "12"],
        ["Coca-Cola Bottle 750ml", "8901764012015", "34.0", "40", "120", "28"]
      ]);
      setColumnMapping({
        productName: "Item_Name",
        skuCode: "Barcode_No",
        wholesalePrice: "Rate_A",
        mrp: "M.R.P.",
        currentStock: "Cl_Stock",
        gstRatePct: "Tax_Per"
      });
    } else {
      setDetectedHeaders(["Item_Description", "Item_Code", "Wholesale_Price", "Print_MRP", "Qty_In_Hand"]);
      setSampleRows([
        ["Maggi 2-Minute Noodles 70g", "8901058852399", "11.5", "14", "300"],
        ["Aashirvaad Shudh Chakki Atta 5kg", "8901725181112", "235.0", "275", "45"]
      ]);
      setColumnMapping({
        productName: "Item_Description",
        skuCode: "Item_Code",
        wholesalePrice: "Wholesale_Price",
        mrp: "Print_MRP",
        currentStock: "Qty_In_Hand",
        gstRatePct: ""
      });
    }
    setPreviewItems([]);
  };

  // Run Preview Validation
  const handleRunPreview = async () => {
    setIsPreviewing(true);
    setImportStatus(null);
    try {
      const res = await fetch(`${apiBase}/api/erp/column-map/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: detectedHeaders,
          sampleRows,
          columnMapping
        })
      }).then((r) => r.json());

      if (res.success) {
        setPreviewItems(res.previewItems || []);
      }
    } catch (err: any) {
      alert("Preview error: " + err.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  // Commit Import
  const handleCommitImport = async () => {
    if (previewItems.length === 0) {
      alert("Please run preview first to validate items.");
      return;
    }

    setIsImporting(true);
    try {
      const validProducts = previewItems
        .filter((p) => p.isValid)
        .map((p) => ({
          productName: p.productName,
          skuCode: p.skuCode,
          mrp: p.mrp,
          wholesalePrice: p.wholesalePrice,
          currentStock: p.currentStock,
          gstRatePct: p.gstRatePct,
          category: p.category
        }));

      const res = await fetch(`${apiBase}/api/erp/column-map/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          products: validProducts
        })
      }).then((r) => r.json());

      if (res.success) {
        setImportStatus(`Successfully imported ${res.importedCount} products into your wholesale catalog!`);
        if (onImportSuccess) onImportSuccess();
      } else {
        alert("Import failed: " + (res.error || "Server error"));
      }
    } catch (err: any) {
      alert("Import request error: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
            <FileSpreadsheet className="w-4 h-4" /> Universal ERP Bulk Catalog Ingestion
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Dynamic Column Mapper & Smart ERP Importer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Import product catalogs from any non-standard accounting software (Tally Prime, Marg ERP, Busy, Excel/CSV)
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset("TALLY")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
          >
            Tally Prime XML
          </button>
          <button
            type="button"
            onClick={() => applyPreset("MARG")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
          >
            Marg ERP
          </button>
          <button
            type="button"
            onClick={() => applyPreset("BUSY")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
          >
            Busy Accounting
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Step 1: Column Mapping Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[11px] flex items-center justify-center font-bold">1</span>
            Map Your File Headers to Platform Fields
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {detectedHeaders.length} Columns Detected in File
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          {platformFields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                {f.label}
              </label>
              <select
                value={columnMapping[f.key] || ""}
                onChange={(e) => setColumnMapping({ ...columnMapping, [f.key]: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- Do Not Map --</option>
                {detectedHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Validate Dry Run */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[11px] flex items-center justify-center font-bold">2</span>
            Non-Destructive Dry-Run Validation
          </h4>
          <button
            type="button"
            onClick={handleRunPreview}
            disabled={isPreviewing}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPreviewing ? "animate-spin" : ""}`} />
            {isPreviewing ? "Validating..." : "Preview & Validate Rows"}
          </button>
        </div>

        {previewItems.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Product Name</th>
                  <th className="p-2.5">SKU Code</th>
                  <th className="p-2.5">Wholesale Rate</th>
                  <th className="p-2.5">MRP</th>
                  <th className="p-2.5">Godown Stock</th>
                  <th className="p-2.5">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewItems.map((it, idx) => (
                  <tr key={idx} className={it.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}>
                    <td className="p-2.5">
                      {it.isValid ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          VALID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]" title={it.validationErrors?.join(", ")}>
                          ERROR
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">{it.productName}</td>
                    <td className="p-2.5 font-mono text-slate-500">{it.skuCode}</td>
                    <td className="p-2.5 font-bold text-indigo-600">₹{it.wholesalePrice}</td>
                    <td className="p-2.5 text-slate-700">₹{it.mrp}</td>
                    <td className="p-2.5 text-slate-700">{it.currentStock} units</td>
                    <td className="p-2.5 font-bold text-emerald-600">
                      {Math.round(((it.mrp - it.wholesalePrice) / (it.mrp || 1)) * 1000) / 10}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 3: Commit Import */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Ready to commit {previewItems.filter((p) => p.isValid).length} valid items to <strong>{organizationId}</strong>.
        </div>

        <button
          type="button"
          onClick={handleCommitImport}
          disabled={isImporting || previewItems.filter((p) => p.isValid).length === 0}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {isImporting ? "Importing..." : "Commit Import to Catalog"}
        </button>
      </div>
    </div>
  );
}
