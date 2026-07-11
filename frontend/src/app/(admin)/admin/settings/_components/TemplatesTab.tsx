import React, { useEffect, useState } from "react";
import { Mail, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { MessageTemplate } from "@/features/admin/api/types";

export default function TemplatesTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { templates, fetchTemplates, updateTemplate, loading } = useAdminStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => { fetchTemplates(); }, []);

  const startEdit = (t: MessageTemplate) => {
    setEditingId(t.id);
    setEditSubject(t.subject ?? "");
    setEditBody(t.bodyContent);
  };

  const handleSave = async (t: MessageTemplate) => {
    try {
      await updateTemplate(t.id, { subject: editSubject || undefined, bodyContent: editBody });
      showAlert("Template Updated", `"${t.triggerEvent}" template content saved.`, "success");
      setEditingId(null);
    } catch { /* error in store */ }
  };

  const handleToggle = async (t: MessageTemplate, isActive: boolean) => {
    try {
      await updateTemplate(t.id, { isActive });
      showAlert("Template Toggled", `"${t.triggerEvent}" template ${isActive ? "activated" : "deactivated"}.`, "info");
    } catch { /* error in store */ }
  };

  const channelColor = (ch: string) => {
    switch (ch) {
      case "EMAIL": return "bg-blue-500/10 text-blue-600";
      case "SMS": return "bg-emerald-500/10 text-emerald-600";
      case "WHATSAPP": return "bg-green-500/10 text-green-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-border/40 bg-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-primary" /> Notification Templates
        </CardTitle>
        <CardDescription className="text-xs">Edit triggered SMS, Email, and WhatsApp message templates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 && !loading && (
          <div className="py-8 text-center text-sm text-muted-foreground">No templates found.</div>
        )}

        {templates.map((t) => (
          <div key={t.id} className="border border-border/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${channelColor(t.channel)}`}>
                  {t.channel}
                </span>
                <span className="text-xs font-bold text-foreground">{t.triggerEvent}</span>
              </div>
              <Switch checked={t.isActive} onCheckedChange={(v) => handleToggle(t, v)} />
            </div>

            {editingId === t.id ? (
              <div className="space-y-3">
                {t.channel === "EMAIL" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subject</Label>
                    <Input className="h-9 text-xs" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs">Body Content</Label>
                  <textarea rows={5} value={editBody} onChange={(e) => setEditBody(e.target.value)} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  Variables: {t.variables.map((v) => <code key={v} className="bg-muted px-1.5 py-0.5 rounded">{`{{${v}}}`}</code>)}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button type="button" size="sm" className="text-xs h-8" onClick={() => handleSave(t)} disabled={loading}>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />} Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {t.subject && <p className="text-xs text-muted-foreground"><strong>Subject:</strong> {t.subject}</p>}
                <p className="text-xs text-muted-foreground line-clamp-2">{t.bodyContent}</p>
                <Button type="button" variant="ghost" size="sm" className="text-xs h-7 mt-1" onClick={() => startEdit(t)}>Edit Template</Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
