"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, ShieldCheck, DollarSign, Users, Award, Percent } from "lucide-react";

export default function SavingsCalculator() {
  const [repsCount, setRepsCount] = useState<number>(2);
  const [baseSalary, setBaseSalary] = useState<number>(22000);
  const [dailyTa, setDailyTa] = useState<number>(250);
  const [workingDays, setWorkingDays] = useState<number>(26);
  const [incentive, setIncentive] = useState<number>(3000);
  const [overheads, setOverheads] = useState<number>(1500);
  const [beatFee, setBeatFee] = useState<number>(6000);

  const calculations = useMemo(() => {
    const singleRepMonthly = baseSalary + dailyTa * workingDays + incentive + overheads;
    const totalDedicatedMonthly = singleRepMonthly * repsCount;
    const totalDedicatedAnnual = totalDedicatedMonthly * 12;

    const totalPlatformMonthly = beatFee * repsCount;
    const totalPlatformAnnual = totalPlatformMonthly * 12;

    const monthlySavings = Math.max(0, totalDedicatedMonthly - totalPlatformMonthly);
    const annualSavings = monthlySavings * 12;
    const savingsPercent =
      totalDedicatedMonthly > 0
        ? Math.round(((monthlySavings / totalDedicatedMonthly) * 100) * 10) / 10
        : 0;

    const monthlyVisitsPerRep = 780; // ~30 shops/day * 26 days
    const totalVisits = monthlyVisitsPerRep * repsCount;
    const dedicatedCostPerVisit = totalVisits > 0 ? Math.round(totalDedicatedMonthly / totalVisits) : 0;
    const platformCostPerVisit = totalVisits > 0 ? Math.round(totalPlatformMonthly / totalVisits) : 0;

    return {
      singleRepMonthly,
      totalDedicatedMonthly,
      totalDedicatedAnnual,
      totalPlatformMonthly,
      totalPlatformAnnual,
      monthlySavings,
      annualSavings,
      savingsPercent,
      dedicatedCostPerVisit,
      platformCostPerVisit
    };
  }, [repsCount, baseSalary, dailyTa, workingDays, incentive, overheads, beatFee]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Pure Fixed Subscription (0% Commission)
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ROI Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Seller Cost-Savings Intelligence Simulator
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Compare the heavy payroll of dedicated distributor sales reps against our shared beat sales-as-a-service model. Keep 100% of your order revenues!
          </p>
        </div>
        <div className="bg-indigo-600/30 border border-indigo-500/40 rounded-xl px-5 py-3 text-right">
          <div className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Payroll Reduction</div>
          <div className="text-3xl font-black text-emerald-400">
            {calculations.savingsPercent}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
        {/* Sliders Column */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            1. Dedicated Sales Rep Parameters
          </h3>

          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                <span>Number of Sales Reps / Beat Routes</span>
                <span className="text-indigo-600 font-bold">{repsCount} {repsCount === 1 ? 'Rep' : 'Reps'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={repsCount}
                onChange={(e) => setRepsCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                <span>Rep Monthly Base Salary</span>
                <span className="text-indigo-600 font-bold">₹{baseSalary.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="15000"
                max="35000"
                step="1000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Daily TA/DA (Fuel & Food)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={dailyTa}
                    onChange={(e) => setDailyTa(parseInt(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Monthly Incentive / Bonus
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={incentive}
                    onChange={(e) => setIncentive(parseInt(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pt-2">
            <Award className="w-5 h-5 text-emerald-600" />
            2. Platform Shared-Beat Subscription
          </h3>

          <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex justify-between text-sm font-semibold text-slate-800 mb-1">
              <span>Platform Fixed Beat Fee (per route)</span>
              <span className="text-emerald-700 font-bold">₹{beatFee.toLocaleString('en-IN')} / month</span>
            </div>
            <input
              type="range"
              min="4000"
              max="10000"
              step="500"
              value={beatFee}
              onChange={(e) => setBeatFee(parseInt(e.target.value))}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex items-center gap-2 text-xs text-emerald-800 pt-1">
              <span className="font-semibold">✓ 0% Commission on GMV</span>
              <span>•</span>
              <span>✓ Geofenced visit audit</span>
              <span>•</span>
              <span>✓ Instant WhatsApp delivery POD</span>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Monthly Rupee Savings Big Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <TrendingUp className="w-40 h-40" />
              </div>
              <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                Monthly Net Cash Savings
              </div>
              <div className="text-4xl font-black mt-1">
                ₹{calculations.monthlySavings.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-100 mt-2 font-medium">
                Saves <span className="font-bold text-white">₹{calculations.annualSavings.toLocaleString('en-IN')} / year</span> across {repsCount} {repsCount === 1 ? 'route' : 'routes'}
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-500/40 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-emerald-200">Cost per Visit (Old)</div>
                  <div className="text-base font-bold">₹{calculations.dedicatedCostPerVisit}</div>
                </div>
                <div>
                  <div className="text-emerald-200">Cost per Visit (New)</div>
                  <div className="text-base font-bold text-yellow-300">₹{calculations.platformCostPerVisit}</div>
                </div>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase">Old Dedicated Reps</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  ₹{calculations.totalDedicatedMonthly.toLocaleString('en-IN')}
                  <span className="text-xs text-slate-500 font-normal">/mo</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Salary + TA + Incentives</div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-700 uppercase">Platform Subscription</div>
                <div className="text-lg font-bold text-indigo-900 mt-1">
                  ₹{calculations.totalPlatformMonthly.toLocaleString('en-IN')}
                  <span className="text-xs text-indigo-700 font-normal">/mo</span>
                </div>
                <div className="text-xs text-emerald-600 font-bold mt-1">0% Commission Flat</div>
              </div>
            </div>
          </div>

          {/* Pitch Callout */}
          <div className="bg-slate-900 text-slate-200 text-xs p-4 rounded-xl leading-relaxed border border-slate-800">
            <span className="font-bold text-emerald-400">Distributor Pitch Summary: </span>
            You cut field sales operational expenses by <span className="font-bold text-white">{calculations.savingsPercent}%</span>, eliminate fake store visits with 100m GPS geofencing, and receive verified WhatsApp Delivery OTP receipts for every consignment.
          </div>
        </div>
      </div>
    </div>
  );
}
