import React from "react";
import { Scale, DollarSign, ArrowUpRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceLedger } from "@/features/admin/api/types";

interface LedgerKPIsProps {
  financeLedger: FinanceLedger | null;
}

export default function LedgerKPIs({ financeLedger }: LedgerKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Escrow Liabilities */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden relative">
        <CardHeader className="pb-2 space-y-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Escrow Liabilities</span>
          <CardTitle className="text-xl font-extrabold text-amber-600 flex items-baseline">
            ${financeLedger?.totalEscrowLiabilities ?? 0}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">USD</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-[10px] text-muted-foreground">Funds currently held in escrow from active bookings.</p>
        </CardContent>
        <div className="absolute right-3.5 top-3.5 p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
          <Scale className="h-4 w-4" />
        </div>
      </Card>

      {/* Card 2: Realized Earnings */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden relative">
        <CardHeader className="pb-2 space-y-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Realized Revenue</span>
          <CardTitle className="text-xl font-extrabold text-emerald-600 flex items-baseline">
            ${financeLedger?.totalRealizedRevenue ?? 0}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">USD</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-[10px] text-muted-foreground">Platform net commission collected from completed checkouts.</p>
        </CardContent>
        <div className="absolute right-3.5 top-3.5 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
          <DollarSign className="h-4 w-4" />
        </div>
      </Card>

      {/* Card 3: Refund Metrics */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden relative">
        <CardHeader className="pb-2 space-y-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Refund Metrics</span>
          <CardTitle className="text-xl font-extrabold text-destructive flex items-baseline">
            ${financeLedger?.totalRefunded ?? 0}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">USD</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-[10px] text-muted-foreground">Aggregate ticket payments reversed to clients upon cancellation.</p>
        </CardContent>
        <div className="absolute right-3.5 top-3.5 p-1.5 rounded-lg bg-destructive/10 text-destructive">
          <ArrowUpRight className="h-4 w-4 rotate-90" />
        </div>
      </Card>

      {/* Card 4: Ledger Counts */}
      <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden relative">
        <CardHeader className="pb-2 space-y-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ledger Records</span>
          <CardTitle className="text-xl font-extrabold text-foreground flex items-baseline">
            {financeLedger?.ledgerCount ?? 0}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-[10px] text-muted-foreground">Total logged escrow and revenue items in transaction register.</p>
        </CardContent>
        <div className="absolute right-3.5 top-3.5 p-1.5 rounded-lg bg-muted/40 text-foreground">
          <FileText className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
}
