"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  Target,
  IndianRupee,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileCheck,
  Building,
  AlertCircle,
  X,
  CreditCard
} from "lucide-react";

interface AgentCrmDashboardProps {
  apiBase: string;
  agentId?: string;
}

export default function AgentCrmDashboard({ apiBase, agentId = "usr_agent_1" }: AgentCrmDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"BEAT" | "LEADS" | "PERFORMANCE" | "PAYMENTS">("BEAT");
  const [loading, setLoading] = useState(false);

  // Beat Data
  const [beatData, setBeatData] = useState<any | null>(null);
  const [activeVisitStore, setActiveVisitStore] = useState<any | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<string>("");

  // CRM Leads
  const [leads, setLeads] = useState<any[]>([]);
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [selectedRetailer360, setSelectedRetailer360] = useState<any | null>(null);
  const [isRetailer360Open, setIsRetailer360Open] = useState(false);

  // New Lead Modal
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    city: "Lucknow",
    pincode: "226001"
  });

  // Payment Collection Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectRetailer, setCollectRetailer] = useState<any | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [collectMode, setCollectMode] = useState<"CASH" | "UPI_QR" | "CHEQUE">("CASH");
  const [collectNotes, setCollectNotes] = useState<string>("");

  // Performance Data
  const [performance, setPerformance] = useState<any | null>(null);

  // Load CRM Data
  const loadCrmData = async () => {
    setLoading(true);
    try {
      // 1. Beat
      const beatRes = await fetch(`${apiBase}/api/beats/today?agentId=${agentId}`).then((r) => r.json());
      setBeatData(beatRes);

      // 2. Leads
      const leadsRes = await fetch(`${apiBase}/api/crm/leads`).then((r) => r.json());
      setLeads(leadsRes.leads || []);

      // 3. Performance
      const perfRes = await fetch(`${apiBase}/api/crm/agent/performance`).then((r) => r.json());
      setPerformance(perfRes.agentPerformance || null);
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrmData();
  }, [apiBase, agentId]);

  // Handle Check-in (<100m)
  const handleCheckin = async (stop: any) => {
    try {
      const res = await fetch(`${apiBase}/api/visits/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          retailerId: stop.retailerId,
          beatId: beatData?.beatId,
          latitude: stop.latitude, // simulating verified GPS at location
          longitude: stop.longitude,
          purpose: "ROUTINE_ORDER"
        })
      }).then((r) => r.json());

      if (res.success) {
        setCheckinStatus(`Verified check-in at ${stop.shopName}! Distance: ${res.visit.distanceMeters}m`);
        setActiveVisitStore(stop);
        await loadCrmData();
      } else {
        alert(res.message || res.error);
      }
    } catch (e: any) {
      alert("Check-in error: " + e.message);
    }
  };

  // Handle Onboard New Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.shopName || !newLeadForm.ownerName || !newLeadForm.phone) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/crm/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm)
      }).then((r) => r.json());

      if (res.success) {
        setIsNewLeadModalOpen(false);
        setNewLeadForm({ shopName: "", ownerName: "", phone: "", address: "", city: "Lucknow", pincode: "226001" });
        await loadCrmData();
      } else {
        alert(res.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Advance Lead Stage
  const handleAdvanceStage = async (retailerId: string, currentStage: string) => {
    const stageFlow: { [k: string]: string } = {
      PROSPECT: "CONTACTED",
      CONTACTED: "KYC_PENDING",
      KYC_PENDING: "KYC_VERIFIED",
      KYC_VERIFIED: "ACTIVE_BUYER",
      ACTIVE_BUYER: "DORMANT",
      DORMANT: "ACTIVE_BUYER"
    };

    const nextStage = stageFlow[currentStage] || "ACTIVE_BUYER";

    await fetch(`${apiBase}/api/crm/leads/${retailerId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage })
    });

    await loadCrmData();
  };

  // View Retailer 360
  const handleOpen360 = async (retailerId: string) => {
    try {
      const res = await fetch(`${apiBase}/api/crm/retailer/${retailerId}`).then((r) => r.json());
      setSelectedRetailer360(res);
      setIsRetailer360Open(true);
    } catch (e: any) {
      alert("Error fetching 360 profile: " + e.message);
    }
  };

  // Collect Payment
  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectRetailer || !collectAmount) return;

    try {
      const res = await fetch(`${apiBase}/api/crm/payments/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId: collectRetailer.id,
          amount: parseFloat(collectAmount),
          paymentMode: collectMode,
          notes: collectNotes
        })
      }).then((r) => r.json());

      if (res.success) {
        setIsCollectModalOpen(false);
        setCollectAmount("");
        setCollectNotes("");
        alert(`Payment of ₹${collectAmount} recorded! Receipt voucher: ${res.collection.receiptVoucherNumber}`);
        await loadCrmData();
      } else {
        alert(res.error);
      }
    } catch (e: any) {
      alert("Error collecting payment: " + e.message);
    }
  };

  const filteredLeads = stageFilter === "ALL" ? leads : leads.filter((l) => l.leadStage === stageFilter);

  return (
    <div className="space-y-6">
      {/* Top CRM Sub-Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab("BEAT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "BEAT"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Beat Route & Field Visits
        </button>
        <button
          onClick={() => setActiveSubTab("LEADS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "LEADS"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          Retailer Lead Pipeline ({leads.length})
        </button>
        <button
          onClick={() => setActiveSubTab("PERFORMANCE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "PERFORMANCE"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Target className="w-4 h-4" />
          Sales Targets & Achievement
        </button>
        <button
          onClick={() => setActiveSubTab("PAYMENTS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSubTab === "PAYMENTS"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          Payment Vouchers & Cash in Hand
        </button>
      </div>

      {/* ================= TAB 1: BEAT ROUTE & FIELD VISITS ================= */}
      {activeSubTab === "BEAT" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Today's Beat: {beatData?.beatName || "Hazratganj Monday Route"}
                </h3>
                <div className="text-xs text-slate-300 mt-1">
                  Field Agent: Rahul Sharma • Stops Visited: {beatData?.visitedStops || 0} / {beatData?.totalStops || 3}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  Geofence: &lt;100m Enforced
                </span>
              </div>
            </div>

            {checkinStatus && (
              <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <span>{checkinStatus}</span>
                <button onClick={() => setCheckinStatus("")} className="text-emerald-900 font-bold">✕</button>
              </div>
            )}

            <div className="divide-y divide-slate-200">
              {beatData?.stops?.map((stop: any) => (
                <div key={stop.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black flex items-center justify-center">
                        {stop.sequenceOrder}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{stop.shopName}</h4>
                      {stop.isVisited && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          VISITED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600">
                      Owner: <span className="font-semibold">{stop.ownerName}</span> • {stop.address}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>GPS: {stop.latitude}, {stop.longitude}</span>
                      <span>•</span>
                      <span>WhatsApp: {stop.whatsappNumber}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCheckin(stop)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Check-In (&lt;100m)
                    </button>

                    <button
                      onClick={() => {
                        setCollectRetailer({ id: stop.retailerId, shopName: stop.shopName });
                        setIsCollectModalOpen(true);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      Collect Cash
                    </button>

                    <a
                      href={`https://wa.me/91${stop.whatsappNumber}?text=${encodeURIComponent(
                        `Namaste ${stop.ownerName} ji, Rahul Sharma here from B2B Sales Aggregator. I am outside your store for your weekly stock order & quotation.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>

                    <button
                      onClick={() => handleOpen360(stop.retailerId)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                    >
                      360° Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: RETAILER LEAD PIPELINE ================= */}
      {activeSubTab === "LEADS" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Stage Filter Chips */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {["ALL", "PROSPECT", "CONTACTED", "KYC_PENDING", "KYC_VERIFIED", "ACTIVE_BUYER", "DORMANT"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStageFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    stageFilter === st
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Onboard Kirana Lead
            </button>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{lead.shopName}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">{lead.ownerName} • {lead.phone}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lead.leadStage === "ACTIVE_BUYER"
                          ? "bg-emerald-100 text-emerald-800"
                          : lead.leadStage === "PROSPECT"
                          ? "bg-blue-100 text-blue-800"
                          : lead.leadStage === "KYC_PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {lead.leadStage}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div>{lead.address}, {lead.city}</div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Credit Limit:</span>
                      <span className="font-bold text-slate-800">₹{lead.creditLimit?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Outstanding Dues:</span>
                      <span className={`font-bold ${lead.creditDues > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                        ₹{lead.creditDues?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Payment Term:</span>
                      <span className="font-semibold text-indigo-600">{lead.paymentTerm}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpen360(lead.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    360° Profile
                  </button>

                  <button
                    onClick={() => handleAdvanceStage(lead.id, lead.leadStage)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                  >
                    Advance <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PERFORMANCE INTELLIGENCE ================= */}
      {activeSubTab === "PERFORMANCE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue Target</div>
              <div className="text-2xl font-black text-slate-900">
                ₹{performance?.monthlyRevenueAchieved?.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-slate-500">
                Target: ₹{performance?.monthlyRevenueTarget?.toLocaleString("en-IN")} ({performance?.targetAchievementPct || 77}%)
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, performance?.targetAchievementPct || 77)}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Visits Progress</div>
              <div className="text-2xl font-black text-slate-900">
                {performance?.dailyVisitsCompletedToday || 14} / {performance?.dailyVisitsTarget || 18}
              </div>
              <div className="text-xs text-emerald-600 font-bold">
                77.8% Route Completed Today
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "78%" }} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visit Strike Rate %</div>
              <div className="text-2xl font-black text-indigo-600">
                {performance?.strikeRatePct || 78}%
              </div>
              <div className="text-xs text-slate-500">
                {performance?.monthlyOrdersCount || 42} wholesale orders booked this month
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cash in Hand Collected</div>
              <div className="text-2xl font-black text-emerald-700">
                ₹{performance?.cashInHand?.toLocaleString("en-IN") || "18,400"}
              </div>
              <div className="text-xs text-slate-500">
                Incentives Earned: <span className="font-bold text-slate-800">₹{performance?.incentiveEarned?.toLocaleString("en-IN") || "11,535"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PAYMENT VOUCHERS ================= */}
      {activeSubTab === "PAYMENTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Field Payment Collection Vouchers</h3>
              <p className="text-xs text-slate-500">
                Logged payments automatically reduce retailer credit dues and update the distributor ledger.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {leads
              .filter((l) => l.creditDues > 0 || l.lastOrderAmount > 0)
              .map((lead) => (
                <div key={lead.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{lead.shopName}</span>
                    <div className="text-slate-500 mt-0.5">Proprietor: {lead.ownerName} • Phone: {lead.phone}</div>
                    <div className="text-slate-600 mt-1 font-semibold">
                      Current Outstanding Balance:{" "}
                      <span className="text-amber-700 font-bold">₹{lead.creditDues?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCollectRetailer({ id: lead.id, shopName: lead.shopName });
                      setIsCollectModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    Collect Payment Voucher
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: 360° RETAILER PROFILE ================= */}
      {isRetailer360Open && selectedRetailer360 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedRetailer360.retailer?.shopName}</h3>
                <div className="text-xs text-slate-500">{selectedRetailer360.retailer?.ownerName} • {selectedRetailer360.retailer?.address}</div>
              </div>
              <button onClick={() => setIsRetailer360Open(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credit Status Cards */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Credit Limit</div>
                <div className="text-sm font-black text-slate-900">₹{selectedRetailer360.retailer?.creditLimit?.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Outstanding Dues</div>
                <div className="text-sm font-black text-amber-600">₹{selectedRetailer360.retailer?.creditDues?.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Available Credit</div>
                <div className="text-sm font-black text-emerald-600">₹{selectedRetailer360.retailer?.availableCredit?.toLocaleString("en-IN")}</div>
              </div>
            </div>

            {/* Notes & Activity History */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Recent CRM Visit & Activity Notes</h4>
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {selectedRetailer360.notes?.length === 0 ? (
                  <div className="text-xs text-slate-400">No notes recorded yet</div>
                ) : (
                  selectedRetailer360.notes?.map((n: any) => (
                    <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{n.type} by {n.agentName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1">{n.summary}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setIsRetailer360Open(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: ONBOARD NEW KIRANA ================= */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Onboard New Kirana Store</h3>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Shop / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laxmi Provision Store"
                  value={newLeadForm.shopName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, shopName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proprietor / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shiv Kumar"
                  value={newLeadForm.ownerName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, ownerName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Store Address</label>
                <input
                  type="text"
                  placeholder="Shop #, Street, Market"
                  value={newLeadForm.address}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition mt-2"
              >
                Save & Add to CRM Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: COLLECT PAYMENT VOUCHER ================= */}
      {isCollectModalOpen && collectRetailer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Payment Collection Voucher</h3>
                <div className="text-xs text-slate-500">{collectRetailer.shopName}</div>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Collection Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Mode</label>
                <select
                  value={collectMode}
                  onChange={(e) => setCollectMode(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="CASH">Cash in Hand</option>
                  <option value="UPI_QR">UPI Dynamic QR</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Collection Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Part-payment for invoice #2026-08"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition mt-2"
              >
                Generate Receipt Voucher
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
