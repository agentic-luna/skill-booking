"use client";

import React, { useEffect, useState } from "react";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/features/admin/store/adminStore";

export default function NotificationLogsPage() {
  const {
    notificationLogs, logsTotal, logsPage, logsTotalPages,
    fetchNotificationLogs, loading, error,
  } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => { fetchNotificationLogs(1, 20, statusFilter); }, [statusFilter]);

  const goToPage = (p: number) => fetchNotificationLogs(p, 20, statusFilter);

  const statusColor = (s: string) => {
    switch (s) {
      case "SENT":    return "bg-emerald-500/10 text-emerald-600";
      case "FAILED":  return "bg-destructive/10 text-destructive";
      case "PENDING": return "bg-amber-500/10 text-amber-600";
      case "QUEUED":  return "bg-blue-500/10 text-blue-600";
      default:        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Notification Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">System-wide notification delivery history (paginated).</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {[undefined, "SENT", "FAILED", "PENDING", "QUEUED"].map((s) => (
          <Button
            key={s ?? "all"} type="button" size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            className="text-xs h-8 rounded-lg"
            onClick={() => setStatusFilter(s)}
          >
            {s ?? "All"}
          </Button>
        ))}
      </div>

      <Card className="border-border/40 rounded-2xl bg-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Delivery Records</CardTitle>
          <CardDescription className="text-xs">Showing {notificationLogs.length} of {logsTotal} entries · Page {logsPage}/{logsTotalPages}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
            </div>
          ) : notificationLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No notification logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-t">
                <thead>
                  <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Trigger Event</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-bold uppercase">{log.channel}</td>
                      <td className="py-3 px-4 text-muted-foreground">{log.triggerEvent}</td>
                      <td className="py-3 px-4 text-muted-foreground truncate max-w-[160px]">{log.recipientEmail || log.recipientPhone || log.recipientId || "—"}</td>
                      <td className="py-3 px-4 truncate max-w-[200px]">{log.subject ?? "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${statusColor(log.status)}`}>{log.status}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {logsTotalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <Button type="button" variant="outline" size="sm" className="text-xs h-8" disabled={logsPage <= 1} onClick={() => goToPage(logsPage - 1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {logsPage} of {logsTotalPages}</span>
              <Button type="button" variant="outline" size="sm" className="text-xs h-8" disabled={logsPage >= logsTotalPages} onClick={() => goToPage(logsPage + 1)}>
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
