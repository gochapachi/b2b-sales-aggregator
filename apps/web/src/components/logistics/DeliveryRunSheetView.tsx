"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Weight,
  MapPin,
  CheckCircle2,
  DollarSign,
  Fuel,
  Receipt,
  AlertCircle,
  Plus,
  RefreshCw,
  ShoppingBag
} from "lucide-react";

interface DeliveryRunSheetViewProps {
  apiBase: string;
}

export default function DeliveryRunSheetView({ apiBase }: DeliveryRunSheetViewProps) {
  const [runSheets, setRunSheets] = useState<any[]>([]);
  const [selectedRunSheet, setSelectedRunSheet] = useState<any | null>(null);
  const [vanSession, setVanSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Cash Handover State
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [cashCollected, setCashCollected] = useState(24500);

  // Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseType, setExpenseType] = useState<"DIESEL" | "TOLL" | "PARKING" | "CHAI_SNACKS">("DIESEL");
  const [expenseAmount, setExpenseAmount] = useState(1200);
  const [expenseNotes, setExpenseNotes] = useState("Fuel fill at highway petrol pump");

  useEffect(() => {
    fetchRunSheets();
    fetchVanSession();
  }, []);

  const fetchRunSheets = async () => {
    try {
      const res = await fetch(`${apiBase}/api/logistics/run-sheets`);
      const data = await res.json();
      if (data.success && data.runSheets.length > 0) {
        setRunSheets(data.runSheets);
        setSelectedRunSheet(data.runSheets[0]);
      }
    } catch {
      // Fallback
    }
  };

  const fetchVanSession = async () => {
    try {
      const res = await fetch(`${apiBase}/api/logistics/van-sales/session`);
      const data = await res.json();
      if (data.success) setVanSession(data.session);
    } catch {
      // Fallback
    }
  };

  const submitHandover = async () => {
    if (!selectedRunSheet) return;
    try {
      const res = await fetch(`${apiBase}/api/logistics/run-sheets/${selectedRunSheet.id}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualCashCollected: cashCollected })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setShowHandoverModal(false);
        fetchRunSheets();
      }
    } catch {
      setMessage("Failed to record driver cash handover");
    }
  };

  const submitExpense = async () => {
    try {
      const res = await fetch(`${apiBase}/api/logistics/driver-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runSheetId: selectedRunSheet?.id || "run_001",
          driverName: selectedRunSheet?.driverName || "Driver",
          expenseType,
          amount: expenseAmount,
          notes: expenseNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setShowExpenseModal(false);
      }
    } catch {
      setMessage("Failed to log expense");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Truck className="w-4 h-4" />
            Dispatch Logistics & Cash Van
          </div>
          <h2 className="text-2xl font-bold">Delivery Trip Run Sheets & Van Sales</h2>
          <p className="text-white/80 text-sm mt-1">
            Loading manifests, vehicle gross weight checks (Tata Ace 1000kg limit), driver COD reconciliation, and ready-stock van sales.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowHandoverModal(true)}
            className="px-4 py-2.5 bg-white text-blue-900 rounded-lg text-sm font-semibold hover:bg-blue-50 transition shadow flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-blue-700" />
            COD Cash Handover
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 bg-blue-900/80 border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition flex items-center gap-2"
          >
            <Fuel className="w-4 h-4" />
            Log Fuel / Toll
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-blue-600 font-bold">×</button>
        </div>
      )}

      {/* Selected Run Sheet Card */}
      {selectedRunSheet && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded">
                Active Trip Manifest
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedRunSheet.runSheetNumber}</h3>
              <p className="text-xs text-gray-500">
                Driver: <span className="font-semibold text-gray-800">{selectedRunSheet.driverName}</span> ({selectedRunSheet.driverPhone}) | Vehicle: <span className="font-semibold text-gray-800">{selectedRunSheet.vehicleNumber}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedRunSheet.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                {selectedRunSheet.status}
              </span>
            </div>
          </div>

          {/* Vehicle Capacity Meter */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-gray-500 flex items-center gap-1.5 font-medium">
                <Weight className="w-4 h-4 text-slate-700" />
                Gross Weight Payload
              </div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {selectedRunSheet.totalGrossWeightKg} kg / {selectedRunSheet.maxGrossWeightKg} kg
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(selectedRunSheet.totalGrossWeightKg / selectedRunSheet.maxGrossWeightKg) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Total Volume Space</div>
              <div className="text-lg font-bold text-gray-900 mt-1">{selectedRunSheet.totalVolumeCubicFt} cu ft</div>
              <div className="text-gray-400 mt-1">{selectedRunSheet.totalCartons} cartons packed</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Collectable COD Dues</div>
              <div className="text-lg font-bold text-emerald-700 mt-1">
                ₹{selectedRunSheet.totalCollectableCod.toLocaleString("en-IN")}
              </div>
              <div className="text-gray-400 mt-1">{selectedRunSheet.stops.length} stop deliveries</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Reconciled Cash Handover</div>
              <div className="text-lg font-bold text-indigo-700 mt-1">
                ₹{selectedRunSheet.actualCashCollected.toLocaleString("en-IN")}
              </div>
              <div className="text-gray-400 mt-1">End of shift settlement</div>
            </div>
          </div>

          {/* Stops List */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">Delivery Stop Sequence Manifest</h4>
            <div className="space-y-3">
              {selectedRunSheet.stops.map((stop: any) => (
                <div
                  key={stop.stopIndex}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {stop.stopIndex}
                    </span>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{stop.shopName}</div>
                      <div className="text-gray-500">{stop.address} (Ph: {stop.phone})</div>
                      <div className="text-blue-700 font-medium mt-0.5 font-mono">Sub-Order: #{stop.subOrderId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-gray-900">{stop.cartonCount} Cartons ({stop.grossWeightKg} kg)</div>
                      <div className="text-gray-500">Terms: {stop.paymentTerm}</div>
                    </div>
                    <div className="border-l pl-4">
                      <div className="text-[10px] text-gray-400 uppercase">Handover OTP</div>
                      <div className="font-mono font-bold text-emerald-700 text-sm">{stop.deliveryOtp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Van Sales Session */}
      {vanSession && (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-xs rounded">
                Ready-Stock Cash Van Mode
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">Vehicle {vanSession.vehicleNumber} (Sales Rep: {vanSession.agentName})</h3>
              <p className="text-xs text-gray-500">Live floating inventory sold and delivered on the spot</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">On-Spot GMV Collected</div>
              <div className="text-lg font-black text-indigo-700">₹{vanSession.totalGmvCollected.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {vanSession.currentInventory.map((item: any) => (
              <div key={item.skuId} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900">{item.productName}</div>
                  <div className="text-gray-500">Floating Vehicle Inventory</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 font-bold rounded">
                    {item.quantity} units left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COD Cash Handover Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base">Driver COD Cash Handover</h3>
            <p className="text-xs text-gray-500">
              Reconcile physical cash handed in by driver against total COD deliveries.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Actual Cash Submitted (₹)</label>
              <input
                type="number"
                value={cashCollected}
                onChange={(e) => setCashCollected(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowHandoverModal(false)} className="px-4 py-2 border rounded-lg text-xs text-gray-600">
                Cancel
              </button>
              <button onClick={submitHandover} className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg text-xs">
                Confirm & Reconcile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base">Log Driver Fuel / Toll Expense</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Category</label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="DIESEL">Diesel / Fuel Refill</option>
                <option value="TOLL">Highway Toll Gate</option>
                <option value="PARKING">Mandi Parking Fee</option>
                <option value="CHAI_SNACKS">Driver Food Allowance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Receipt Notes</label>
              <input
                type="text"
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 border rounded-lg text-xs text-gray-600">
                Cancel
              </button>
              <button onClick={submitExpense} className="px-4 py-2 bg-indigo-700 text-white font-bold rounded-lg text-xs">
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
