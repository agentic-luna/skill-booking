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
    <Card className="overflow-hidden border-border/40 bg-card rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow">
      <div className="p-5 flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-extrabold text-primary shrink-0 border">
              {fullName[0]}
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground leading-tight">{fullName}</h3>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" /> {host.email}
              </div>
              <div className="text-[9px] text-muted-foreground">{host.phone}</div>
            </div>
          </div>
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
            host.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-destructive/10 text-destructive"
          }`}>
            {host.status}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {bio}
        </p>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-muted-foreground border-t pt-3">
          <div>
            <span className="text-muted-foreground/80">Active Classes: </span>
            <span className="font-bold text-foreground">{activeClassesCount} workshops</span>
          </div>
          <div>
            <span className="text-muted-foreground/80">Account Type: </span>
            <span className="font-bold text-foreground uppercase">{host.hostProfile?.accountType || "INDIVIDUAL"}</span>
          </div>
          <div>
            <span className="text-muted-foreground/80">KYC Verify Status: </span>
            <span className={`font-bold uppercase ${
              kycStatus === "APPROVED" ? "text-emerald-600" : kycStatus === "PENDING" ? "text-amber-500" : "text-destructive"
            }`}>{kycStatus}</span>
          </div>
          <div>
            <span className="text-muted-foreground/80">Payout Routing: </span>
            <span className="font-bold text-foreground">{isBankConfigured ? "Configured" : "None Linked"}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t bg-muted/10 flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs h-8 hover:bg-muted"
          onClick={() => onNotifyClick(host)}
        >
          <Bell className="h-3.5 w-3.5 mr-1" /> Notify Personally
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs h-8 border-destructive/20 text-destructive hover:bg-destructive/5"
          onClick={() => onDeleteClick(host.id)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Host
        </Button>
      </div>
    </Card>
  );
}
