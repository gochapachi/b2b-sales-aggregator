"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Clock,
  Printer,
  QrCode,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  ArrowRight,
  PackageCheck
} from "lucide-react";

interface WarehousePackingDeskProps {
  apiBase: string;
}

export default function WarehousePackingDesk({ apiBase }: WarehousePackingDeskProps) {
  const [batches, setBatches] = useState<any[]>([]);
  const [nearExpiryBatches, setNearExpiryBatches] = useState<any[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<any | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [masterPo, setMasterPo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
    fetchNearExpiry();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${apiBase}/api/warehouse/batches`);
      const data = await res.json();
      if (data.success) setBatches(data.batches);
    } catch {
      // Fallback
    }
  };

  const fetchNearExpiry = async () => {
    try {
      const res = await fetch(`${apiBase}/api/warehouse/near-expiry`);
      const data = await res.json();
      if (data.success) setNearExpiryBatches(data.batches);
    } catch {
      // Fallback
    }
  };

  const fetchCartonLabel = async (subOrderId: string = "subord_001") => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/warehouse/carton-label/${subOrderId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedLabel(data.labelData);
        setShowLabelModal(true);
      }
    } catch {
      setMessage("Failed to load carton label");
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterPo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/warehouse/master-po`);
      const data = await res.json();
      if (data.success) {
        setMasterPo(data);
        setMessage("Consolidated Master Manufacturer Purchase Order generated");
      }
    } catch {
      setMessage("Failed to aggregate master PO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Boxes className="w-4 h-4" />
            FEFO Inventory & Dispatch Logistics
          </div>
          <h2 className="text-2xl font-bold">Warehouse Operations & Packing Desk</h2>
          <p className="text-white/80 text-sm mt-1">
            First-Expiry-First-Out (FEFO) automated allocation, 4x6 thermal carton labels, and manufacturer bulk POs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchCartonLabel("subord_001")}
            className="px-4 py-2.5 bg-white text-emerald-900 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            4x6 Carton QR Label
          </button>
          <button
            onClick={fetchMasterPo}
            className="px-4 py-2.5 bg-emerald-900/80 border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-emerald-900 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Consolidate Bulk PO
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-emerald-600 font-bold">×</button>
        </div>
      )}

      {/* Near Expiry Liquidation Alert */}
      {nearExpiryBatches.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Near-Expiry Liquidation Markdown Alert (Within 30 Days)
          </div>
          <p className="text-xs text-amber-800 mt-1">
            {nearExpiryBatches.length} batch(es) expiring soon. Automatic 20% markdown discount active on retail checkout to clear perishables before loss.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {nearExpiryBatches.map((b) => (
              <div key={b.id} className="bg-white p-3 rounded-lg border border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-gray-900">{b.productName}</div>
                  <div className="text-gray-500">Batch: {b.batchNumber} | Location: {b.godownLocation} ({b.binLocation})</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                    {b.daysToExpiry}d left (20% OFF)
                  </span>
                  <div className="text-gray-500 mt-1">{b.quantityAvailable} units in stock</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Batches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Active FIFO / FEFO Batch Register</h3>
            <p className="text-xs text-gray-500">Earliest expiring batch automatically assigned to outgoing orders first</p>
          </div>
          <button onClick={fetchBatches} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
            Refresh Batches
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 font-semibold">
                <th className="p-3.5">SKU & Batch #</th>
                <th className="p-3.5">Mfg Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Days to Expiry</th>
                <th className="p-3.5">Godown & Rack</th>
                <th className="p-3.5 text-right">Available Stock</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="p-3.5">
                    <div className="font-semibold text-gray-900">{b.productName}</div>
                    <div className="text-gray-500 font-mono">{b.batchNumber}</div>
                  </td>
                  <td className="p-3.5 text-gray-600">{b.mfgDate}</td>
                  <td className="p-3.5 text-gray-900 font-semibold">{b.expiryDate}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${b.daysToExpiry <= 30 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {b.daysToExpiry} days
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-600">
                    <div>{b.godownLocation}</div>
                    <div className="text-gray-400 font-mono">{b.binLocation}</div>
                  </td>
                  <td className="p-3.5 text-right font-bold text-gray-900">{b.quantityAvailable} units</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium text-[11px]">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Consolidated PO Preview */}
      {masterPo && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-300 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                Aggregated Manufacturer PO
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{masterPo.masterPoNumber}</h3>
              <p className="text-xs text-gray-500">Supplier: {masterPo.manufacturer}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Estimated Purchase Value</div>
              <div className="text-xl font-black text-emerald-700">₹{masterPo.totalEstCost.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {masterPo.items.map((it: any) => (
              <div key={it.skuId} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div className="font-semibold text-gray-900">{it.productName}</div>
                <div className="text-emerald-700 font-bold mt-1">Total Ordered: {it.totalQuantity} Master Packs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4x6 Carton Label Thermal Print Modal */}
      {showLabelModal && selectedLabel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                4x6 Thermal Carton Shipping Label
              </h3>
              <button onClick={() => setShowLabelModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
            </div>

            {/* Printable Carton Card */}
            <div className="border-2 border-dashed border-gray-800 p-4 rounded-lg bg-gray-50 font-mono text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-gray-400 pb-2">
                <span className="font-bold text-sm tracking-wider uppercase">ANAGATA EXPRESS</span>
                <span className="font-bold">{selectedLabel.boxLabel}</span>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Consignee:</div>
                <div className="font-bold text-sm">{selectedLabel.consignee}</div>
                <div>{selectedLabel.destinationAddress}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-b border-gray-400 py-2">
                <div>
                  <div className="text-[10px] text-gray-500">INVOICE #:</div>
                  <div className="font-bold">{selectedLabel.invoiceNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">GROSS WEIGHT:</div>
                  <div className="font-bold">{selectedLabel.grossWeightKg} KG</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="p-2 bg-white border border-gray-300 rounded inline-block">
                  <QrCode className="w-16 h-16 text-gray-900" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">HANDOVER OTP:</div>
                  <div className="text-xl font-black tracking-widest text-emerald-800">{selectedLabel.deliveryOtp}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLabelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print to ESC/POS Thermal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
