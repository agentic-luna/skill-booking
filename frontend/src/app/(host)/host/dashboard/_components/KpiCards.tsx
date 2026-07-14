import React from "react";
import { DollarSign, Users, Calendar, Star, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EarningsCard({ totalRevenue }: { totalRevenue: number }) {
  return (
    <Card className="rounded-[32px] border-0 bg-gradient-to-br from-[#d4fc94] to-[#a0f212] shadow-xl overflow-hidden relative group h-full">
      {/* Decorative background shapes */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
      
      <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
        <div className="flex items-start justify-between">
          <div className="p-4 rounded-3xl bg-white/30 backdrop-blur-md shadow-sm border border-white/40">
            <DollarSign className="h-7 w-7 text-[#0b0c01]" />
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-white/50 text-[#0b0c01] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12%
          </div>
        </div>
        
        <div className="space-y-1 mt-10">
          <span className="text-sm text-[#0b0c01]/70 font-extrabold uppercase tracking-widest">Total Earnings</span>
          <div className="text-5xl font-black text-[#0b0c01] tracking-tighter">${totalRevenue.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveWorkshopsCard({ activePrograms }: { activePrograms: number }) {
  return (
    <Card className="rounded-[32px] border border-white/5 bg-[#0b0c01] shadow-2xl overflow-hidden relative group h-full">
      {/* Subtle grid pattern background could go here */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
        <div className="flex items-start justify-between">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#a0f212]/30 transition-colors">
            <Calendar className="h-6 w-6 text-[#a0f212]" />
          </div>
          <div className="text-[#a0f212] text-[10px] font-bold bg-[#a0f212]/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">Live</div>
        </div>
        
        <div className="space-y-2 mt-10">
          <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Active Workshops</span>
          <div className="text-4xl font-black text-white tracking-tight">{activePrograms}</div>
          
          <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#a0f212] w-2/3 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityStatsCard({ totalSignups, averageRating }: { totalSignups: number, averageRating: string }) {
  return (
    <Card className="rounded-[32px] border border-black/5 bg-white shadow-xl h-full flex flex-col overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
      
      <div className="flex-1 p-6 border-b border-black/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Students</span>
          <div className="text-3xl font-black text-[#0b0c01] tracking-tight">{totalSignups}</div>
        </div>
        <div className="p-4 rounded-full bg-blue-50 text-blue-600">
          <Users className="h-6 w-6" />
        </div>
      </div>
      
      <div className="flex-1 p-6 flex items-center justify-between relative">
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/5 rounded-tl-full pointer-events-none" />
        <div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Average Rating</span>
          <div className="text-3xl font-black text-[#0b0c01] tracking-tight">{averageRating}</div>
        </div>
        <div className="p-4 rounded-full bg-amber-50 text-amber-500">
          <Star className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
