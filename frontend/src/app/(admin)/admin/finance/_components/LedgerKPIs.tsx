import React from "react";
import { Scale, IndianRupee, ArrowUpRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceLedger } from "@/features/admin/api/types";

interface LedgerKPIsProps {
  financeLedger: FinanceLedger | null;
}

export default function LedgerKPIs({ financeLedger }: LedgerKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 md:grid-flow-row-dense xl:grid-flow-row">
      
      {/* Card 1: Escrow Liabilities */}
      <Card className="col-span-1 md:col-span-1 xl:col-span-3 border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md overflow-hidden relative transition-all duration-300">
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl shadow-sm border border-amber-500/20"><Scale className="h-5 w-5" /></div>
            <div className="bg-muted px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm">Escrow</div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Escrow Liabilities</span>
            <div className="text-4xl font-extrabold text-amber-600 flex items-baseline tracking-tight">
              ₹{financeLedger?.totalEscrowLiabilities ?? 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Realized Earnings (Bento Highlight) */}
      <Card className="col-span-1 md:col-span-2 xl:col-span-6 border-none bg-[#a0f212] rounded-[32px] shadow-[0_10px_30px_rgba(160,242,18,0.2)] hover:shadow-[0_15px_40px_rgba(160,242,18,0.4)] overflow-hidden relative transition-all duration-300 group">
        <div className="absolute right-0 bottom-0 p-8 opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] transition-opacity">
          <IndianRupee className="w-64 h-64 text-[#0b0c01]" />
        </div>
        <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="bg-black/10 text-[#0b0c01] p-3 rounded-2xl shadow-sm border border-black/10"><IndianRupee className="h-6 w-6" /></div>
            <div className="bg-white/80 text-[#0b0c01] px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-widest">Platform Commission</div>
          </div>
          <div>
            <span className="text-sm text-[#0b0c01]/70 font-bold block mb-2">Total Realized Revenue</span>
            <div className="text-6xl font-medium text-[#0b0c01] tracking-tight">
              ₹{financeLedger?.totalRealizedRevenue ?? 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Refund Metrics Stack */}
      <div className="col-span-1 md:col-span-1 xl:col-span-3 flex flex-col gap-6">
        <Card className="flex-1 border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md overflow-hidden relative transition-all duration-300">
          <CardContent className="p-6 relative z-10 flex items-center justify-between h-full">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Total Refunded</span>
              <div className="text-3xl font-extrabold text-destructive flex items-baseline tracking-tight">
                ₹{financeLedger?.totalRefunded ?? 0}
              </div>
            </div>
            <div className="bg-destructive/10 text-destructive p-3 rounded-2xl shadow-sm border border-destructive/20"><ArrowUpRight className="h-5 w-5 rotate-90" /></div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md overflow-hidden relative transition-all duration-300">
          <CardContent className="p-6 relative z-10 flex items-center justify-between h-full">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Ledger Records</span>
              <div className="text-3xl font-extrabold text-foreground flex items-baseline tracking-tight">
                {financeLedger?.ledgerCount ?? 0}
              </div>
            </div>
            <div className="bg-muted/40 text-foreground p-3 rounded-2xl shadow-sm border border-black/5 dark:border-white/5"><FileText className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
