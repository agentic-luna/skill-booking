"use client";

import React, { useState, useEffect } from "react";
import { IndianRupee, ArrowUpRight, TrendingUp, Download, Loader2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";

import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { BankDetailsPayload } from "@/features/host/api/types";
import BankDetailsForm from "./_components/BankDetailsForm";

const EMPTY_FORM: BankDetailsPayload = {
  accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", upiId: "",
};

export default function HostEarningsPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { bankDetails, fetchBankDetails, submitBankDetails, updateBankDetails, isLoading, error, clearError, dashboard, fetchDashboard } = useHostStore();
  const [form, setForm] = useState<BankDetailsPayload>(EMPTY_FORM);
  const isEdit = !!bankDetails;

  useEffect(() => {
    fetchBankDetails();
    fetchDashboard();
  }, [fetchBankDetails, fetchDashboard]);

  useEffect(() => {
    if (bankDetails) {
      setForm({
        accountHolderName: bankDetails.accountHolderName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        bankName: bankDetails.bankName || "",
        upiId: bankDetails.upiId || "",
      });
    }
  }, [bankDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (isEdit) {
        await updateBankDetails(form);
        showAlert("Bank Details Updated", `Bank account at ${form.bankName} updated successfully.`, "success");
      } else {
        await submitBankDetails(form);
        showAlert("Bank Details Saved", `Bank account at ${form.bankName} linked to your host profile.`, "success");
      }
    } catch { /* error shown via banner */ }
  };

  const grossRevenue = dashboard?.totalRevenue ?? 0;
  const recentBookings = dashboard?.recentBookings?.slice(0, 3) ?? [];
  const revenueData = dashboard?.monthlyRevenue?.slice(-2) ?? [
    { month: "Prev", earnings: 0 }, { month: "Cur", earnings: 0 }
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-black/5">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0c01]">
          Earnings Center
        </h1>
        <p className="text-muted-foreground font-medium">Manage your finances, track revenue, and update withdrawal settings.</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
      )}

      {/* Mixed-Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* TOP ROW */}
        
        {/* 1. Sales Statistics (Dark Card) */}
        <div className="lg:col-span-2 xl:col-span-2 bg-[#0b0c01] rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
          {/* Subtle bg texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,1)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-white font-extrabold text-lg">Sales statistics</h2>
              <p className="text-white/40 text-xs font-semibold">Updated today</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/70 text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors">
              Monthly v
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-end mt-12">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[#a0f212] text-xs font-bold">
                Gross Revenue <ArrowUpRight className="w-3 h-3 bg-[#a0f212] text-[#0b0c01] rounded-full" />
              </div>
              <div className="text-6xl font-black text-white tracking-tighter">
                ₹{grossRevenue.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Mini Bar Chart mimicking reference */}
            <div className="w-32 h-24 flex items-end gap-3 pb-1">
              {revenueData.map((data, idx) => {
                const isLast = idx === revenueData.length - 1;
                const heightPercent = data.earnings > 0 ? Math.max(30, (data.earnings / (grossRevenue || 1)) * 100) : (isLast ? 80 : 50);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform">
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">{data.month}</span>
                    <div className="w-full bg-white/5 rounded-t-xl overflow-hidden flex items-end" style={{ height: 80 }}>
                      <div 
                        className={`w-full rounded-t-xl transition-all duration-1000 ${isLast ? 'bg-[#a0f212]' : 'bg-[#a78bfa]'}`} 
                        style={{ height: `${Math.min(100, heightPercent)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Recent Transactions (White List Card) */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-6 flex flex-col gap-4 border border-black/5 shadow-xl relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#0b0c01] flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[#0b0c01] font-extrabold text-base leading-tight">Recent Bookings</h2>
              <p className="text-muted-foreground text-xs font-medium">Ticket sales</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {recentBookings.length > 0 ? (
              recentBookings.map((b: any, i: number) => (
                <div key={i} className="bg-black/5 hover:bg-black/10 transition-colors rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-[#0b0c01] text-xs">
                      {b.client?.firstName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#0b0c01]">₹{b.totalAmount ?? b.amount}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold truncate w-24">{b.event?.title}</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-3 h-3 text-[#0b0c01]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-semibold text-muted-foreground border border-dashed border-black/10 rounded-2xl">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW */}

        {/* 3. Current Balance (Green Card) */}
        <div className="lg:col-span-1 bg-[#a0f212] rounded-[32px] p-8 flex flex-col justify-between relative shadow-[0_8px_30px_rgba(160,242,18,0.2)]">
          <div className="flex justify-between items-start z-10">
            <h2 className="text-[#0b0c01] font-extrabold text-xl">Current balance</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white/40 hover:bg-white flex items-center justify-center transition-colors text-[#0b0c01]">
                ←
              </button>
              <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0b0c01]">
                →
              </button>
            </div>
          </div>

          {/* Abstract Gauge shape mirroring reference */}
          <div className="relative mt-12 flex justify-center items-center">
            <div className="w-48 h-24 overflow-hidden relative">
              <div className="w-48 h-48 border-[20px] border-[#0b0c01] rounded-full absolute top-0 left-0 border-b-transparent border-r-[#0b0c01]/10 transform -rotate-45" />
            </div>
            <div className="absolute bottom-2 text-center">
              <div className="text-3xl font-black text-[#0b0c01] tracking-tight">₹{grossRevenue.toLocaleString("en-IN")}</div>
              <div className="w-3 h-3 bg-[#a78bfa] rounded-full mx-auto mt-2 border-2 border-[#a0f212]" />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end z-10">
            <div>
              <div className="flex items-center gap-1 font-black text-[#0b0c01] text-lg">
                14% <ArrowUpRight className="w-4 h-4 bg-white rounded-full p-0.5" />
              </div>
              <div className="text-[#0b0c01]/60 text-xs font-bold">Avg month score</div>
            </div>
            {bankDetails && (
              <button className="bg-[#0b0c01] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/80 transition-colors flex items-center gap-1.5 shadow-xl">
                <Download className="w-3 h-3" /> Withdraw
              </button>
            )}
          </div>
        </div>

        {/* 4. Bank Settings (White Complex Card) */}
        <div className="lg:col-span-2 xl:col-span-2 bg-white border border-black/5 rounded-[32px] p-6 shadow-xl flex flex-col md:flex-row gap-6">
          {/* Left Timeline Side */}
          <div className="w-full md:w-1/3 border-r border-black/5 pr-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#a0f212] flex items-center justify-center text-[#0b0c01] shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h2 className="text-[#0b0c01] font-extrabold text-lg leading-tight">Bank<br/>Setup</h2>
            </div>

            <div className="relative flex-1 ml-4 mt-2 border-l-2 border-black/5 space-y-8 pb-4">
              <div className="relative pl-6">
                <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full border-2 ${bankDetails ? 'bg-[#a0f212] border-[#a0f212]' : 'bg-white border-black/20'}`} />
                <h3 className="text-xs font-extrabold text-[#0b0c01]">Profile Linked</h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">Host ID generated</p>
              </div>
              <div className="relative pl-6">
                <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full border-2 ${bankDetails ? 'bg-[#a0f212] border-[#a0f212]' : 'bg-white border-black/20'}`} />
                <h3 className="text-xs font-extrabold text-[#0b0c01]">Bank Details</h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">Submit your account</p>
              </div>
              <div className="relative pl-6">
                <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full border-2 ${bankDetails ? 'bg-[#a78bfa] border-[#a78bfa]' : 'bg-white border-black/20'}`} />
                <h3 className="text-xs font-extrabold text-[#0b0c01]">Verification</h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">Pending admin check</p>
              </div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-2xl p-5 relative overflow-hidden group flex-1 flex flex-col justify-center">
               <BankDetailsForm form={form} isLoading={isLoading} isEdit={isEdit} onChange={handleChange} onSubmit={handleSubmit} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
