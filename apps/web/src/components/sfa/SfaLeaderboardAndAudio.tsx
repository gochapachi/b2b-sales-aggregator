"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Volume2,
  Route,
  UserCheck,
  Medal,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2
} from "lucide-react";

interface SfaLeaderboardAndAudioProps {
  apiBase: string;
}

export default function SfaLeaderboardAndAudio({ apiBase }: SfaLeaderboardAndAudioProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tspResult, setTspResult] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Coaching scorecard state
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [coachStore, setCoachStore] = useState("Gupta Kirana & General Store");
  const [pitchScore, setPitchScore] = useState(5);
  const [productScore, setProductScore] = useState(4);
  const [objectionScore, setObjectionScore] = useState(4);
  const [coachRemarks, setCoachRemarks] = useState("Excellent explanation of trade schemes and Diwali bundles.");

  useEffect(() => {
    fetchLeaderboard();
    fetchTspOptimization();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${apiBase}/api/sfa/leaderboard`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard);
    } catch {
      // Fallback
    }
  };

  const fetchTspOptimization = async () => {
    try {
      const res = await fetch(`${apiBase}/api/sfa/tsp-optimize/beat_hazratganj_mon`);
      const data = await res.json();
      if (data.success) setTspResult(data);
    } catch {
      // Fallback
    }
  };

  // Browser HTML5 SpeechSynthesis API (Zero cloud TTS fees, built-in device voice)
  const playMorningBriefing = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setMessage("Text-to-Speech not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = "Good morning Rahul Sharma! Welcome to your Monday Hazratganj and Narahi beat. Today you have 18 scheduled store visits with an optimized route saving 12% travel distance. Your daily sales revenue target is 25,000 rupees. Best of luck on the road!";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setMessage("Playing voice briefing through device audio");
  };

  const submitScorecard = async () => {
    try {
      const res = await fetch(`${apiBase}/api/sfa/coaching-scorecard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "usr_agent_1",
          agentName: "Rahul Sharma",
          storeShopName: coachStore,
          pitchingScore: pitchScore,
          productKnowledgeScore: productScore,
          objectionHandlingScore: objectionScore,
          remarks: coachRemarks
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Area Manager Coaching Scorecard logged successfully");
        setShowCoachModal(false);
      }
    } catch {
      setMessage("Failed to log scorecard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            Field Performance & Coaching Hub
          </div>
          <h2 className="text-2xl font-bold">Sales Force Automation (SFA) Intelligence</h2>
          <p className="text-white/80 text-sm mt-1">
            2-Opt Traveling Salesman (TSP) route optimization, device speech audio briefings, and gamified agent leaderboards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={playMorningBriefing}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow flex items-center gap-2 ${
              isSpeaking ? "bg-rose-500 text-white animate-pulse" : "bg-white text-teal-900 hover:bg-teal-50"
            }`}
          >
            <Volume2 className="w-4 h-4 text-teal-700" />
            {isSpeaking ? "Stop Briefing" : "Morning Audio Briefing"}
          </button>
          <button
            onClick={() => setShowCoachModal(true)}
            className="px-4 py-2.5 bg-teal-900/80 border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-teal-900 transition flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Area Manager Coaching
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-teal-600 font-bold">×</button>
        </div>
      )}

      {/* TSP 2-Opt Route Sequence Card */}
      {tspResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-3">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                2-Opt TSP Route Minimizer
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-1">{tspResult.beatName}</h3>
              <p className="text-xs text-gray-500">Autonomous mathematical optimization minimizing total fuel and travel kilometers</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gray-500">Original Route:</span> <strong className="text-gray-900">{tspResult.originalKm} km</strong>
              </div>
              <div>
                <span className="text-gray-500">Optimized:</span> <strong className="text-teal-700">{tspResult.optimizedKm} km</strong>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                Saved {tspResult.savingsKm} km ({tspResult.savingsPct}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {tspResult.orderedStops.map((s: any, idx: number) => (
              <div key={s.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2.5">
                <span className="w-6 h-6 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-bold text-gray-900">{s.shopName}</div>
                  <div className="text-gray-500 text-[11px]">{s.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gamified Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Field Sales Rep Competitive Leaderboard
            </h3>
            <p className="text-xs text-gray-500">Daily rankings computed by gross sales volume, visit strike rate %, and newly acquired kiranas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 font-semibold">
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Sales Executive</th>
                <th className="p-3.5 text-right">GMV Booked</th>
                <th className="p-3.5 text-right">Target</th>
                <th className="p-3.5 text-center">Visit Strike Rate</th>
                <th className="p-3.5 text-center">New Kiranas</th>
                <th className="p-3.5">Performer Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((item) => (
                <tr key={item.rank} className="hover:bg-gray-50 transition">
                  <td className="p-3.5 font-bold">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs text-white ${
                      item.rank === 1 ? "bg-amber-500" : item.rank === 2 ? "bg-slate-400" : "bg-amber-700"
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-gray-900">{item.agentName}</td>
                  <td className="p-3.5 text-right font-black text-emerald-700">₹{item.gmvAchieved.toLocaleString("en-IN")}</td>
                  <td className="p-3.5 text-right text-gray-500">₹{item.target.toLocaleString("en-IN")}</td>
                  <td className="p-3.5 text-center font-bold text-blue-700">{item.strikeRate}</td>
                  <td className="p-3.5 text-center font-bold text-purple-700">+{item.newKiranas}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                      {item.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coaching Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-gray-200 text-xs">
            <h3 className="font-bold text-gray-900 text-base">Area Manager Coaching Rubric</h3>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={coachStore}
                onChange={(e) => setCoachStore(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded font-medium"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Pitching (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={pitchScore}
                  onChange={(e) => setPitchScore(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={productScore}
                  onChange={(e) => setProductScore(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Objection (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={objectionScore}
                  onChange={(e) => setObjectionScore(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Manager Coaching Remarks</label>
              <textarea
                value={coachRemarks}
                onChange={(e) => setCoachRemarks(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCoachModal(false)} className="px-4 py-2 border rounded text-gray-600">
                Cancel
              </button>
              <button onClick={submitScorecard} className="px-4 py-2 bg-teal-700 text-white font-bold rounded">
                Save Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
