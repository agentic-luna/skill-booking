import React, { useEffect, useState } from "react";
import { Mail, Save, Loader2, MessageSquare, Smartphone, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { MessageTemplate } from "@/features/admin/api/types";

const channelConfig: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  EMAIL:    { label: "Email",    icon: <Mail className="h-3 w-3" />,         bg: "bg-blue-500/10",    text: "text-blue-600" },
  SMS:      { label: "SMS",      icon: <Phone className="h-3 w-3" />,        bg: "bg-emerald-500/10", text: "text-emerald-600" },
  WHATSAPP: { label: "WhatsApp", icon: <MessageSquare className="h-3 w-3" />, bg: "bg-green-500/10",   text: "text-green-700" },
  IN_APP:   { label: "In-App",   icon: <Smartphone className="h-3 w-3" />,   bg: "bg-violet-500/10",  text: "text-violet-600" },
};

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

  return (
    <div className="group relative overflow-hidden border border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-[#0b0c01] p-2.5 rounded-2xl shadow-sm">
            <Mail className="h-5 w-5 text-[#a0f212]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-foreground">Notification Templates</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Edit triggered SMS, Email, and WhatsApp message templates.</p>
          </div>
        </div>
      </div>

      {/* Template list */}
      <div className="relative z-10 px-8 py-6 space-y-4">
        {templates.length === 0 && !loading && (
          <div className="py-16 text-center">
            <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No templates found.</p>
          </div>
        )}

        {templates.map((t) => {
          const ch = channelConfig[t.channel] ?? { label: t.channel, icon: null, bg: "bg-muted", text: "text-foreground" };
          const isEditing = editingId === t.id;

          return (
            <div
              key={t.id}
              className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                isEditing
                  ? "border-[#a0f212]/30 bg-[#a0f212]/5 shadow-[0_0_20px_rgba(160,242,18,0.08)]"
                  : "border-black/5 dark:border-white/5 bg-muted/20 hover:bg-muted/30"
              }`}
            >
              {/* Row header */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${ch.bg} ${ch.text}`}>
                    {ch.icon} {ch.label}
                  </span>
                  <span className="text-sm font-bold text-foreground">{t.triggerEvent}</span>
                </div>
                <Switch checked={t.isActive} onCheckedChange={(v) => handleToggle(t, v)} />
              </div>

              {/* Content */}
              <div className="px-5 pb-4">
                {isEditing ? (
                  <div className="space-y-4 pt-2">
                    {t.channel === "EMAIL" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Subject</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full px-4 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Body Content</label>
                      <textarea
                        rows={4}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="flex w-full rounded-xl border border-black/10 dark:border-white/10 bg-background px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40 resize-none"
                      />
                    </div>
                    {t.variables.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                        <span>Variables:</span>
                        {t.variables.map((v) => (
                          <code key={v} className="bg-[#0b0c01] text-[#a0f212] px-2 py-0.5 rounded-md font-mono text-[10px]">
                            {`{{${v}}}`}
                          </code>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-5 py-2 rounded-full text-xs font-bold border border-black/10 hover:bg-muted transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(t)}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-[#0b0c01] text-white hover:bg-[#1a1c02] px-5 py-2 rounded-full font-bold text-xs shadow-md transition-all disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Save Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {t.subject && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">Subject:</span> {t.subject}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t.bodyContent}</p>
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="mt-2 text-xs font-bold text-foreground/60 hover:text-foreground border border-black/10 hover:border-black/20 px-4 py-1.5 rounded-full transition-all hover:bg-muted/40"
                    >
                      Edit Template
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
