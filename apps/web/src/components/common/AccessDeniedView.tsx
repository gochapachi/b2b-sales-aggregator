"use client";

import React from "react";
import { ShieldAlert, ArrowLeft, Lock, RefreshCw } from "lucide-react";

interface AccessDeniedViewProps {
  userRole: string;
  attemptedRole: string;
  onReturnToDashboard: () => void;
  onSignOut: () => void;
}

export default function AccessDeniedView({
  userRole,
  attemptedRole,
  onReturnToDashboard,
  onSignOut
}: AccessDeniedViewProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            HTTP 403 • Security Access Denied
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            Restricted Dashboard View
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your authenticated account role (<span className="font-bold text-slate-700">{userRole}</span>)
            is strictly quarantined from accessing the <span className="font-bold text-slate-700">{attemptedRole}</span> workspace.
            Tenant boundary isolation protects trade secrets, private margins, and admin queues.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onReturnToDashboard}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Authorized Dashboard</span>
          </button>
          <button
            onClick={onSignOut}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign Out / Switch User</span>
          </button>
        </div>
      </div>
    </div>
  );
}
