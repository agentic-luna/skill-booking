"use client";

import React, { useState } from "react";
import { UserCheck, ShieldAlert, Award, FileText, Check, X, Search, Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HostVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hostsList, setHostsList] = useState([
    {
      id: "h_app_1",
      name: "Marcus Aurelius",
      email: "marcus@philosophy.com",
      expertise: "Classical Stoicism & Ethics",
      bio: "Author and philosophy instructor focusing on practical daily logic and resilience workshops.",
      status: "pending",
      dateApplied: "2026-06-29",
    },
    {
      id: "h_app_2",
      name: "Sarah Jenkins",
      email: "sarah.j@techdev.org",
      expertise: "React 19 & Next.js 15 Frameworks",
      bio: "Frontend engineer specializing in full-stack components mapping and performance caching.",
      status: "approved",
      dateApplied: "2026-06-25",
    }
  ]);

  const handleStatusChange = (appId: string, newStatus: "approved" | "rejected") => {
    setHostsList((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    alert(`Instructor application status set to: ${newStatus.toUpperCase()}`);
  };

  const filteredHosts = hostsList.filter((host) => {
    return (
      host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.expertise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" /> Host Verification
        </h1>
        <p className="text-sm text-muted-foreground">Verify and authorize credentials files of candidate marketplace instructors.</p>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex max-w-md relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search applicants, domains, or email..."
          className="pl-9 h-10 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Applications list Table */}
      <Card className="border-border/40 bg-card rounded-2xl overflow-hidden shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Instructor Candidates Roster</CardTitle>
          <CardDescription className="text-xs">Roster logs of pending and verified educators.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Expertise Area</th>
                  <th className="py-3.5 px-4">Professional Bio</th>
                  <th className="py-3.5 px-4">Date Applied</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHosts.length > 0 ? (
                  filteredHosts.map((host) => (
                    <tr key={host.id} className="border-b hover:bg-muted/30">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{host.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {host.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[10px]">
                          {host.expertise}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground max-w-[220px] truncate" title={host.bio}>
                        {host.bio}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{host.dateApplied}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          host.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : host.status === "pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {host.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {host.status === "pending" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5 hover:text-emerald-600" 
                              title="Approve Host Profile"
                              onClick={() => handleStatusChange(host.id, "approved")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive" 
                              title="Decline Host Profile"
                              onClick={() => handleStatusChange(host.id, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-semibold">Logged</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                      No matching instructor applications.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
