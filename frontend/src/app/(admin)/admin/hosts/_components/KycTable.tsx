import React from "react";
import { RefreshCw, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface KycTableProps {
  activeTab: "pending" | "all";
  pendingCount: number;
  allCount: number;
  loading: boolean;
  filteredHosts: any[];
  onSelectHost: (host: any) => void;
}

export default function KycTable({
  activeTab,
  pendingCount,
  allCount,
  loading,
  filteredHosts,
  onSelectHost
}: KycTableProps) {
  return (
    <Card className="border-border/40 bg-card rounded-2xl overflow-hidden shadow-xs">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-bold">
          {activeTab === "pending" ? "Hosts Awaiting Document Verification" : "All Instructor Registry Log"}
        </CardTitle>
        <CardDescription className="text-xs">Roster logs of pending and verified educators.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-muted/20 font-semibold text-muted-foreground">
                <th className="py-3 px-4">Instructor Candidate</th>
                <th className="py-3 px-4">Type & GST</th>
                <th className="py-3 px-4">Professional Bio</th>
                <th className="py-3 px-4">Verification State</th>
                <th className="py-3 px-4 text-center">Review</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Fetching roster records from gateway...
                  </td>
                </tr>
              ) : filteredHosts.length > 0 ? (
                filteredHosts.map((host) => {
                  const profile = host.hostProfile;
                  
                  return (
                    <tr key={host.id} className="border-b hover:bg-muted/10 last:border-none">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{host.firstName} {host.lastName}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {host.email}
                          </span>
                          <span className="text-[9px] text-muted-foreground/80">{host.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md text-[9px] w-fit uppercase">
                            {profile?.accountType || "INDIVIDUAL"}
                          </span>
                          {profile?.gstNumber && (
                            <span className="text-[9px] text-muted-foreground font-mono">GST: {profile.gstNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-[220px] truncate" title={profile?.bio || "No biography provided"}>
                        {profile?.bio || <span className="italic text-muted-foreground/50">No biography provided</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
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
                          variant="outline" 
                          size="sm"
                          className="h-8 rounded-xl font-semibold border-border/60 text-xs hover:bg-muted"
                          onClick={() => onSelectHost(host)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          {profile?.kycStatus === "PENDING" ? "Verify KYC" : "View Details"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    No instructor profiles match the query.
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
