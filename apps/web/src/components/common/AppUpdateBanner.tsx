"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Download, Sparkles, CheckCircle2, X } from "lucide-react";

interface AppUpdateBannerProps {
  apiBase: string;
}

export default function AppUpdateBanner({ apiBase }: AppUpdateBannerProps) {
  const [currentBuildHash, setCurrentBuildHash] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<any | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Initial fetch
    checkVersion();

    // Poll every 30 seconds for background updates
    const interval = setInterval(checkVersion, 30000);
    return () => clearInterval(interval);
  }, [apiBase]);

  const checkVersion = async () => {
    try {
      const res = await fetch(`${apiBase}/api/app/version`).then((r) => r.json());
      if (res.version && res.buildHash) {
        setLatestVersion(res);

        // Check against local stored build hash
        const cachedHash = localStorage.getItem("b2b_app_build_hash");
        if (!cachedHash) {
          localStorage.setItem("b2b_app_build_hash", res.buildHash);
          setCurrentBuildHash(res.buildHash);
        } else if (cachedHash !== res.buildHash) {
          setUpdateAvailable(true);
        }
      }
    } catch {
      // Quietly fail if offline
    }
  };

  const handleApplyUpdate = () => {
    if (latestVersion?.buildHash) {
      localStorage.setItem("b2b_app_build_hash", latestVersion.buildHash);
    }
    // Hard refresh busting cache
    window.location.reload();
  };

  if (!updateAvailable || isDismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-black text-xs text-indigo-200 flex items-center gap-1.5">
              <span>Platform Update Available</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                v{latestVersion?.version || "2.1.0"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              New features deployed. Click to reload and apply automatic update.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleApplyUpdate}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
