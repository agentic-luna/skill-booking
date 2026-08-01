"use client";

import React, { useEffect, useState } from "react";
import { X, Eye, MousePointerClick, TrendingUp, DollarSign, Calendar, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { getBoostAnalytics } from "@/features/host/api/host.api";

interface BoostAnalyticsModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BoostAnalyticsModal({ eventId, isOpen, onClose }: BoostAnalyticsModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBoostAnalytics(eventId);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load boost analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      fetchAnalytics();
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1c14] border border-emerald-900/50 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden space-y-6">
        
        {/* Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#a0f212]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-950/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#a0f212]/10 p-2.5 rounded-2xl border border-[#a0f212]/20">
              <Sparkles className="h-5 w-5 text-[#a0f212]" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Boost Performance Telemetry</h3>
              <p className="text-xs text-emerald-100/50 font-semibold truncate max-w-[240px]">
                {data?.eventTitle || "Workshop Event"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-100/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#a0f212] mx-auto" />
            <p className="text-xs text-emerald-100/50 font-medium">Fetching real-time campaign analytics...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-4">
            <p className="text-xs text-rose-400 font-bold">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 bg-[#a0f212]/10 hover:bg-[#a0f212]/20 text-[#a0f212] px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Status & Plan Bar */}
            <div className="flex items-center justify-between p-3.5 bg-[#07130e] border border-emerald-900/40 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-500">Plan Tier:</span>
                <span className="text-xs font-extrabold text-[#a0f212] uppercase tracking-wider">{data.tier}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-500">Remaining:</span>
                <span className="text-xs font-extrabold text-white">{data.daysRemaining} Days</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Impressions */}
              <div className="bg-[#07130e] border border-emerald-950 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-emerald-500 text-[10px] font-black uppercase">
                  <span>Impressions</span>
                  <Eye className="h-3.5 w-3.5 text-[#a0f212]" />
                </div>
                <div className="text-2xl font-black text-white">{data.impressions.toLocaleString()}</div>
                <p className="text-[10px] text-emerald-100/40 font-medium">Views on listings & search</p>
              </div>

              {/* Clicks */}
              <div className="bg-[#07130e] border border-emerald-950 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-emerald-500 text-[10px] font-black uppercase">
                  <span>Card Clicks</span>
                  <MousePointerClick className="h-3.5 w-3.5 text-[#a0f212]" />
                </div>
                <div className="text-2xl font-black text-white">{data.clicks.toLocaleString()}</div>
                <p className="text-[10px] text-emerald-100/40 font-medium">CTR: {data.ctr}%</p>
              </div>

              {/* Conversions */}
              <div className="bg-[#07130e] border border-emerald-950 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-emerald-500 text-[10px] font-black uppercase">
                  <span>Bookings</span>
                  <TrendingUp className="h-3.5 w-3.5 text-[#a0f212]" />
                </div>
                <div className="text-2xl font-black text-white">{data.conversions.toLocaleString()}</div>
                <p className="text-[10px] text-emerald-100/40 font-medium">Conv. Rate: {data.conversionRate}%</p>
              </div>

              {/* ROI & Revenue */}
              <div className="bg-[#07130e] border border-emerald-950 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-emerald-500 text-[10px] font-black uppercase">
                  <span>Est. ROI</span>
                  <DollarSign className="h-3.5 w-3.5 text-[#a0f212]" />
                </div>
                <div className={`text-2xl font-black ${data.roi >= 0 ? "text-[#a0f212]" : "text-rose-400"}`}>
                  {data.roi > 0 ? `+${data.roi}%` : `${data.roi}%`}
                </div>
                <p className="text-[10px] text-emerald-100/40 font-medium">₹{data.revenueGenerated.toLocaleString()} Revenue</p>
              </div>

            </div>

            {/* Campaign Summary */}
            <div className="p-4 bg-[#07130e]/60 border border-emerald-950 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-emerald-100/60 font-semibold">
                <span>Boost Cost:</span>
                <span className="text-white font-bold">₹{data.boostPrice}</span>
              </div>
              <div className="flex justify-between text-emerald-100/60 font-semibold">
                <span>Total Booking Revenue:</span>
                <span className="text-[#a0f212] font-bold">₹{data.revenueGenerated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-100/60 font-semibold border-t border-emerald-950 pt-2">
                <span>Seats Filled:</span>
                <span className="text-white font-bold">{data.totalSeatsBooked} seats</span>
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] text-xs font-black px-6 py-2.5 rounded-xl transition-all"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
