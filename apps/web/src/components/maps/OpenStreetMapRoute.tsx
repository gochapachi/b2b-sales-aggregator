"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Clock,
  Compass,
  Building2,
  Phone,
  Layers,
  RefreshCw
} from "lucide-react";

interface BeatStop {
  id: string;
  beatId: string;
  retailerId: string;
  shopName: string;
  ownerName: string;
  sequenceOrder: number;
  latitude: number;
  longitude: number;
  address: string;
  whatsappNumber: string;
  isNextStop?: boolean;
  osmMapUrl?: string;
}

interface OpenStreetMapRouteProps {
  apiBase: string;
  beatId?: string;
  onSelectStop?: (stop: BeatStop) => void;
}

export default function OpenStreetMapRoute({
  apiBase,
  beatId = "beat_hazratganj_mon",
  onSelectStop
}: OpenStreetMapRouteProps) {
  const [routeData, setRouteData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStop, setSelectedStop] = useState<BeatStop | null>(null);

  const loadRoute = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/geo/beat-route/${beatId}`).then((r) => r.json());
      if (res.success) {
        setRouteData(res);
        if (res.stops?.length > 0) {
          setSelectedStop(res.stops[0]);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoute();
  }, [beatId, apiBase]);

  const stops: BeatStop[] = routeData?.stops || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Map Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              OpenStreetMap (OSM) • 100% Free & Open
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
              Zero Google API Keys
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-600" />
            {routeData?.beatName || "Hazratganj & Narahi Beat Route (Monday)"}
          </h3>
          <p className="text-xs text-slate-500">
            Assigned Agent: <strong>{routeData?.agentName || "Rahul Sharma"}</strong> • {stops.length} Retailer Stops Planned
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRoute}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Reload Route"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <a
            href={`https://www.openstreetmap.org/#map=15/26.8485/80.9450`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
          >
            <span>Full Map on OSM</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Visual Route Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stops Sequence List */}
        <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto pr-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Optimized Beat Sequence:
          </span>
          {stops.map((stop, idx) => {
            const isSelected = selectedStop?.id === stop.id;
            return (
              <div
                key={stop.id}
                onClick={() => {
                  setSelectedStop(stop);
                  if (onSelectStop) onSelectStop(stop);
                }}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-300 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    idx === 0
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {stop.sequenceOrder}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-slate-900 truncate block">
                      {stop.shopName}
                    </strong>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded">
                        NEXT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{stop.address}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{stop.ownerName}</span>
                    <span className="font-mono">{stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stop Details & OSM Coordinates Pin Card */}
        <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
          {selectedStop ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
                    Stop #{selectedStop.sequenceOrder} on Beat
                  </span>
                  <h4 className="text-lg font-black text-slate-900 mt-1">{selectedStop.shopName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedStop.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Owner Contact</span>
                  <strong className="text-xs font-bold text-slate-800">{selectedStop.ownerName}</strong>
                  <div className="text-xs font-mono text-slate-600">{selectedStop.whatsappNumber}</div>
                </div>
              </div>

              {/* OpenStreetMap Visual Canvas Card */}
              <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Compass className="w-4 h-4" />
                    <span>OpenStreetMap GPS Coordinates</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">
                    LAT: {selectedStop.latitude} • LON: {selectedStop.longitude}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-lg text-xs space-y-1 font-mono text-slate-300">
                  <div>Geofence Check-in Tolerance: &lt;100 meters (Haversine Formula Enforced)</div>
                  <div>Map Tile Provider: OpenStreetMap Nominatim Standard Cartography</div>
                  <div className="text-amber-400">Strict GPS geofence prevents proxy check-ins outside store radius.</div>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={selectedStop.osmMapUrl || `https://www.openstreetmap.org/?mlat=${selectedStop.latitude}&mlon=${selectedStop.longitude}#map=18/${selectedStop.latitude}/${selectedStop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Pinpoint on OpenStreetMap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStop.latitude},${selectedStop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <span>Turn-by-Turn Nav</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">Select a stop to view GPS coordinates and OpenStreetMap links.</div>
          )}

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tile Source: © OpenStreetMap contributors</span>
            <span className="text-emerald-700 font-bold">100% Zero Paid External API Dependency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
