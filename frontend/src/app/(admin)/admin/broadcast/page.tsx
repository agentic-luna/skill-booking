"use client";

import React, { useState } from "react";
import { Send, Loader2, Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { BroadcastChannel, BroadcastCohort } from "@/features/admin/api/types";

const CHANNELS: BroadcastChannel[] = ["EMAIL", "SMS", "WHATSAPP", "PUSH"];
const COHORTS: BroadcastCohort[] = ["ALL", "HOSTS", "CLIENTS"];

export default function BroadcastPage() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { broadcastNotification, loading, error, clearError } = useAdminStore();

  const [channel, setChannel] = useState<BroadcastChannel>("EMAIL");
  const [cohort, setCohort] = useState<BroadcastCohort>("ALL");
  const [subject, setSubject] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const result = await broadcastNotification({
        channel,
        cohort,
        subject,
        bodyContent,
        targetUserId: targetUserId || undefined,
      });
      showAlert(
        "Broadcast Sent",
        `Successfully delivered to ${result.sent} recipients via ${result.channel}.${result.failed > 0 ? ` ${result.failed} failed.` : ""}`,
        "success"
      );
      setSubject("");
      setBodyContent("");
      setTargetUserId("");
    } catch { /* store error */ }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      <div className="pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" /> Broadcast Notifications
        </h1>
        <p className="text-sm text-muted-foreground">Send manual custom notifications to a targeted user cohort.</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>
      )}

      <Card className="border-border/40 rounded-2xl bg-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Send className="h-4 w-4 text-primary" /> Compose Broadcast
            </CardTitle>
            <CardDescription className="text-xs">Select channel and audience, then craft your message.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Channel picker */}
            <div className="space-y-1.5">
              <Label className="text-xs">Channel</Label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((ch) => (
                  <Button key={ch} type="button" size="sm" variant={channel === ch ? "default" : "outline"} className="text-xs h-8 rounded-lg" onClick={() => setChannel(ch)}>
                    {ch}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cohort picker */}
            <div className="space-y-1.5">
              <Label className="text-xs">Target Cohort</Label>
              <div className="flex flex-wrap gap-2">
                {COHORTS.map((c) => (
                  <Button key={c} type="button" size="sm" variant={cohort === c ? "default" : "outline"} className="text-xs h-8 rounded-lg" onClick={() => setCohort(c)}>
                    {c === "ALL" ? "All Users" : c === "HOSTS" ? "Hosts Only" : "Clients Only"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Optional single target */}
            <div className="space-y-1.5">
              <Label className="text-xs">Specific User ID <span className="text-muted-foreground">(optional — overrides cohort)</span></Label>
              <Input className="h-9 text-xs" placeholder="user_abc123..." value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Input className="h-9 text-xs" placeholder="Important platform announcement" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <Label className="text-xs">Message Body</Label>
              <textarea
                rows={6}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Write the notification content here..."
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                required
              />
            </div>

          </CardContent>
          <CardFooter className="justify-end border-t pt-4 gap-2">
            <Button type="submit" className="text-xs font-semibold h-9 px-6" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : "Broadcast Now"}
            </Button>
          </CardFooter>
        </form>
      </Card>

    </div>
  );
}
