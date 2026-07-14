import React from "react";
import { Mail, Bell, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HostCardProps {
  host: any;
  onNotifyClick: (host: any) => void;
  onDeleteClick: (hostId: string) => void;
}

export default function HostCard({ host, onNotifyClick, onDeleteClick }: HostCardProps) {
  const fullName = `${host.firstName || ""} ${host.lastName || ""}`.trim() || "Host Candidate";
  const bio = host.hostProfile?.bio || "No bio description specified by candidate.";
  const activeClassesCount = host.hostProfile?.events?.length || 0;
  const kycStatus = host.hostProfile?.kycStatus || "PENDING";
  const isBankConfigured = !!host.hostProfile?.bankDetail;

  return (
    <Card className="flex flex-col border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity duration-500 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-foreground to-transparent"></div>
      <div className="p-6 flex-1 space-y-6 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-[18px] bg-primary/10 flex items-center justify-center text-base font-extrabold text-primary shrink-0 shadow-inner">
              {fullName[0]}
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground tracking-tight">{fullName}</h3>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                {host.email}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border shadow-sm ${
            host.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}>
            {host.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] font-medium leading-relaxed">
          {bio}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
          <div className="bg-muted/30 p-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Active Classes</div>
            <div className="font-extrabold text-lg">{activeClassesCount}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Account Type</div>
            <div className="font-bold text-sm text-foreground uppercase">{host.hostProfile?.accountType || "INDIVIDUAL"}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">KYC Status</div>
            <div className={`font-bold text-sm ${kycStatus === "APPROVED" ? "text-emerald-600" : kycStatus === "PENDING" ? "text-amber-500" : "text-destructive"}`}>
              {kycStatus}
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Payout Routing</div>
            <div className="font-bold text-sm text-foreground">{isBankConfigured ? "Configured" : "None Linked"}</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-3 border-t border-black/5 dark:border-white/5 bg-muted/10 mt-auto relative z-10">
        <Button
          className="flex-1 rounded-full text-xs font-bold h-10 shadow-sm bg-[#0b0c01] text-[#a0f212] border-none hover:bg-[#1a1c02] hover:shadow-[0_0_12px_rgba(160,242,18,0.2)] transition-all"
          onClick={() => onNotifyClick(host)}
        >
          <Bell className="h-4 w-4 mr-2" /> Notify
        </Button>
        <Button
          className="flex-1 rounded-full text-xs font-bold h-10 shadow-sm bg-[#0b0c01] text-[#a0f212] border-none hover:bg-red-600 hover:text-white hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all"
          onClick={() => onDeleteClick(host.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>
    </Card>
  );
}
