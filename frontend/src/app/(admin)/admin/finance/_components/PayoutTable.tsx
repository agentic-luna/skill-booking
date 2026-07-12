import React from "react";
import { Search, RefreshCw, Landmark, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HostWithProfile } from "@/features/admin/api/types";

interface PayoutTableProps {
  loading: boolean;
  filteredHosts: HostWithProfile[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  kycFilter: string;
  onKycFilterChange: (val: string) => void;
  onSelectHost: (host: HostWithProfile) => void;
  onOpenConfirm: (open: boolean) => void;
}

export default function PayoutTable({
  loading,
  filteredHosts,
  searchTerm,
  onSearchChange,
  kycFilter,
  onKycFilterChange,
  onSelectHost,
  onOpenConfirm,
}: PayoutTableProps) {
  return (
    <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-sm font-bold">Host Payout Disbursement Control</CardTitle>
          <CardDescription className="text-xs">Payout held ledger balances to registered hosts bank accounts.</CardDescription>
        </div>
        <div className="flex flex-row gap-3 w-full sm:max-w-md">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search host registry, bank..."
              className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-xl border border-border/40 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
            value={kycFilter}
            onChange={(e) => onKycFilterChange(e.target.value)}
          >
            <option value="ALL">All KYC Statuses</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="REJECTED">Rejected Only</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-muted/20 font-semibold text-muted-foreground">
                <th className="py-3 px-4">Host Details</th>
                <th className="py-3 px-4">Bank Routing Details</th>
                <th className="py-3 px-4">KYC State</th>
                <th className="py-3 px-4 text-center">Payout Disbursement</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Retrieving registered hosts financial metrics...
                  </td>
                </tr>
              ) : filteredHosts.length > 0 ? (
                filteredHosts.map((host) => {
                  const profile = host.hostProfile;
                  const bank = profile?.bankDetail;
                  const canPayout = !!bank && profile?.kycStatus === "APPROVED";
                  
                  return (
                    <tr key={host.id} className="border-b hover:bg-muted/10 last:border-none">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{host.firstName} {host.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{host.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {bank ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Landmark className="h-3 w-3 text-muted-foreground" /> {bank.bankName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              A/C: {bank.accountHolderName} | IFSC: {bank.ifscCode}
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/50">No banking details linked</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                          profile?.kycStatus === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : profile?.kycStatus === "PENDING"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {profile?.kycStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button 
                          variant={canPayout ? "default" : "outline"}
                          size="sm"
                          disabled={!canPayout}
                          onClick={() => {
                            onSelectHost(host);
                            onOpenConfirm(true);
                          }}
                          className="h-8 rounded-xl font-bold text-xs"
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" />
                          Disburse Escrow
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-muted-foreground text-xs">
                    No host routing setup records matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
