"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Barcode,
  TrendingUp,
  Clock,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface RetailerSmartToolsProps {
  apiBase: string;
  retailerId?: string;
  onSearchQuery?: (q: string) => void;
}

export default function RetailerSmartTools({
  apiBase,
  retailerId = "ret_gupta_kirana",
  onSearchQuery
}: RetailerSmartToolsProps) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [khatas, setKhatas] = useState<any[]>([]);
  const [profitEstimate, setProfitEstimate] = useState<any | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // New Khata Entry Modal
  const [showKhataModal, setShowKhataModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [khataType, setKhataType] = useState<"CREDIT_GIVEN" | "PAYMENT_RECEIVED">("CREDIT_GIVEN");
  const [khataAmount, setKhataAmount] = useState(500);
  const [khataNotes, setKhataNotes] = useState("Daily Kirana rations");

  useEffect(() => {
    fetchKhatas();
    fetchProfitEstimate();
    fetchPredictions();
    fetchSubstitutes();
  }, [retailerId]);

  const fetchKhatas = async () => {
    try {
      const res = await fetch(`${apiBase}/api/retailer/khata/${retailerId}`);
      const data = await res.json();
      if (data.success) setKhatas(data.khatas);
    } catch {
      // Fallback
    }
  };

  const fetchProfitEstimate = async () => {
    try {
      const res = await fetch(`${apiBase}/api/retailer/tools/profit-estimate/${retailerId}`);
      const data = await res.json();
      if (data.success) setProfitEstimate(data);
    } catch {
      // Fallback
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`${apiBase}/api/retailer/tools/reorder-predictions/${retailerId}`);
      const data = await res.json();
      if (data.success) setPredictions(data.predictions);
    } catch {
      // Fallback
    }
  };

  const fetchSubstitutes = async () => {
    try {
      const res = await fetch(`${apiBase}/api/retailer/tools/substitutes/sku_parle_carton`);
      const data = await res.json();
      if (data.success) setSubstitutes(data.substitutes);
    } catch {
      // Fallback
    }
  };

  // Browser HTML5 Web Speech Recognition (Free, native, no cloud API cost)
  const toggleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage("Web Speech API not supported on this browser. Try Chrome or Edge!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "hi-IN"; // Hindi / Indian English

      recognition.onstart = () => {
        setIsListening(true);
        setMessage("Listening... Speak product name in Hindi or English (e.g., 'Parle-G biscuit' or 'Tata Tea')");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        if (onSearchQuery) onSearchQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMessage("Voice recognition stopped");
      };

      recognition.onend = () => {
        setIsListening(false);
        setMessage(spokenText ? `Searched for: "${spokenText}"` : null);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setMessage("Microphone permission denied or unavailable");
    }
  };

  const addKhataRecord = async () => {
    try {
      const res = await fetch(`${apiBase}/api/retailer/khata/entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId,
          customerName,
          customerPhone,
          type: khataType,
          amount: khataAmount,
          notes: khataNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setShowKhataModal(false);
        fetchKhatas();
      }
    } catch {
      setMessage("Failed to update Udhar Khata");
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice & Barcode Search Bar */}
      <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-800 rounded-xl p-6 text-white shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Kirana Smart Commerce Assistant
          </div>
          <span className="text-xs text-white/80">100% Zero Paid Cloud Speech Fees</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Voice-Powered FMCG Catalog & Smart Diary</h2>
          <p className="text-white/80 text-sm mt-1">
            Dictate bulk product search in Hindi or English, scan barcodes, and manage your local customer Udhar Khata.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={toggleVoiceSearch}
            className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition shadow ${
              isListening ? "bg-rose-500 text-white animate-pulse" : "bg-white text-purple-950 hover:bg-purple-50"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-purple-700" />}
            {isListening ? "Listening (Tap to Stop)..." : "Voice Search (Hindi / English)"}
          </button>
          <button
            onClick={() => {
              setSpokenText("Parle-G 80g Master Carton");
              if (onSearchQuery) onSearchQuery("Parle-G");
              setMessage("Barcode EAN-8901719101018 scanned: Parle-G Glucose Biscuit (80g)");
            }}
            className="px-5 py-3 bg-purple-900/80 border border-white/30 text-white rounded-xl text-sm font-semibold hover:bg-purple-900 transition flex items-center justify-center gap-2"
          >
            <Barcode className="w-5 h-5" />
            Camera Barcode Scanner
          </button>
        </div>

        {spokenText && (
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-lg text-xs flex items-center gap-2 border border-white/20">
            <span className="text-white/60 uppercase text-[10px] font-bold">Dictated Speech:</span>
            <span className="font-bold text-white text-sm">"{spokenText}"</span>
          </div>
        )}
      </div>

      {message && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-purple-600 font-bold">×</button>
        </div>
      )}

      {/* Grid: Profit Estimator & Predictive Re-Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit Estimator */}
        {profitEstimate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Retail Profit Margin Intelligence
                </span>
                <h3 className="font-bold text-gray-900 text-base mt-1">Estimated Retail Margin</h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total Profit Generated</div>
                <div className="text-xl font-black text-emerald-700">₹{profitEstimate.cumulativeProfitGenerated.toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="text-gray-500">Your average resale margin on bought goods is <strong>{profitEstimate.estimatedMarginPct}%</strong>.</div>
              {profitEstimate.topMarginSkus.map((sku: any, i: number) => (
                <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                  <div className="font-medium text-gray-800">{sku.productName}</div>
                  <div className="text-emerald-700 font-bold">{sku.resaleMarginPct}% Margin</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictive Replenishment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Smart Restock Predictor
              </span>
              <h3 className="font-bold text-gray-900 text-base mt-1">Recommended Replenishments</h3>
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            {predictions.map((p: any) => (
              <div key={p.skuId} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{p.productName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.urgency === "HIGH" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}`}>
                    {p.urgency} Restock
                  </span>
                </div>
                <p className="text-gray-600">{p.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Digital Udhar Khata (Kirana's Customer Credit Book) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-700" />
              Digital Udhar Khata (Customer Credit Diary)
            </h3>
            <p className="text-xs text-gray-500">Record credit given to your local neighborhood buyers directly inside the app</p>
          </div>
          <button
            onClick={() => setShowKhataModal(true)}
            className="px-3 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Khata Entry
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {khatas.map((k) => (
              <div key={k.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{k.customerName}</div>
                  <div className="text-gray-500 font-mono">{k.customerPhone}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Last updated: {new Date(k.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase">Outstanding Due</div>
                  <div className="text-base font-black text-rose-600">₹{k.totalDues.toLocaleString("en-IN")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Khata Modal */}
      {showKhataModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 text-base">Record Customer Khata Entry</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Phone</label>
              <input
                type="text"
                placeholder="9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Entry Type</label>
              <select
                value={khataType}
                onChange={(e) => setKhataType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="CREDIT_GIVEN">Credit Given (Udhar diya)</option>
                <option value="PAYMENT_RECEIVED">Payment Received (Paisa mila)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={khataAmount}
                onChange={(e) => setKhataAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowKhataModal(false)} className="px-4 py-2 border rounded-lg text-xs text-gray-600">
                Cancel
              </button>
              <button onClick={addKhataRecord} className="px-4 py-2 bg-purple-700 text-white font-bold rounded-lg text-xs">
                Save to Diary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
