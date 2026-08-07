import React, { useEffect, useState, useRef } from "react";
import { KeyRound, Plus, Loader2, CheckCircle2, Clock, Edit2 } from "lucide-react";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { ServiceName } from "@/features/admin/api/types";

const SERVICE_META: Record<ServiceName, { label: string; color: string; bg: string }> = {
  TWILIO:   { label: "Twilio SMS",        color: "text-red-600",    bg: "bg-red-500/10" },
  SENDGRID: { label: "SendGrid Email",    color: "text-blue-600",   bg: "bg-blue-500/10" },
  META_WA:  { label: "Meta WhatsApp",     color: "text-green-700",  bg: "bg-green-500/10" },
  RAZORPAY: { label: "Razorpay Payments", color: "text-violet-600", bg: "bg-violet-500/10" },
};

const setupFields: Record<ServiceName, Array<{ key: string; label: string; type?: string }>> = {
  TWILIO:   [{ key: "accountSid", label: "Account SID" }, { key: "authToken", label: "Auth Token", type: "password" }, { key: "fromNumber", label: "From Number" }],
  SENDGRID: [{ key: "apiKey", label: "API Key", type: "password" }, { key: "fromEmail", label: "From Email" }, { key: "fromName", label: "From Name" }],
  META_WA:  [{ key: "accessToken", label: "Access Token", type: "password" }, { key: "phoneNumberId", label: "Phone Number ID" }, { key: "businessAccountId", label: "Business Account ID" }, { key: "verifyToken", label: "Webhook Verify Token", type: "password" }],
  RAZORPAY: [{ key: "keyId", label: "Key ID" }, { key: "keySecret", label: "Key Secret", type: "password" }, { key: "webhookSecret", label: "Webhook Secret", type: "password" }],
};

type SetupMode = ServiceName | null;

export default function IntegrationsTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { integrations, fetchIntegrations, setupTwilio, setupSendgrid, setupMetaWa, setupRazorpay, loading } = useAdminStore();

  const [setupMode, setSetupMode] = useState<SetupMode>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const editCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchIntegrations(); }, []);

  const handleChange = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleEdit = (serviceName: ServiceName, environment?: string) => {
    setSetupMode(serviceName);
    setForm({ environment: environment || "TEST" });
    setTimeout(() => {
      editCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSetup = async () => {
    if (!setupMode) return;
    const env = (form.environment as "TEST" | "LIVE") || "TEST";
    try {
      switch (setupMode) {
        case "TWILIO":   await setupTwilio({ environment: env, accountSid: form.accountSid, authToken: form.authToken, fromNumber: form.fromNumber }); break;
        case "SENDGRID": await setupSendgrid({ environment: env, apiKey: form.apiKey, fromEmail: form.fromEmail, fromName: form.fromName }); break;
        case "META_WA":  await setupMetaWa({ environment: env, accessToken: form.accessToken, phoneNumberId: form.phoneNumberId, businessAccountId: form.businessAccountId, verifyToken: form.verifyToken }); break;
        case "RAZORPAY": await setupRazorpay({ environment: env, keyId: form.keyId, keySecret: form.keySecret, webhookSecret: form.webhookSecret }); break;
      }
      showAlert("Integration Configured", `${SERVICE_META[setupMode].label} credentials saved.`, "success");
      setSetupMode(null);
      setForm({});
    } catch { /* store error */ }
  };

  return (
    <div className="space-y-6">

      {/* Active Integrations Card */}
      <div className="group relative overflow-hidden border border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-[#0b0c01] p-2.5 rounded-2xl shadow-sm">
              <KeyRound className="h-5 w-5 text-[#a0f212]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">Active Integrations</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage third-party service credentials. Secrets are masked.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-8 py-6 space-y-4">
          {integrations.length === 0 && !loading && (
            <div className="py-16 text-center">
              <KeyRound className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No integrations configured yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Use the form below to add your first integration.</p>
            </div>
          )}

          {integrations.map((cfg) => {
            const meta = SERVICE_META[cfg.serviceName] ?? { label: cfg.serviceName, color: "text-foreground", bg: "bg-muted" };
            const credEntries = Object.entries(cfg.credentials || {});

            return (
              <div key={cfg.id} className="bg-muted/20 hover:bg-muted/30 border border-black/5 dark:border-white/5 rounded-[24px] p-5 transition-all space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${cfg.environment === "LIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {cfg.environment === "LIVE" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                        {cfg.environment}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium pt-0.5">
                      Updated: {new Date(cfg.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEdit(cfg.serviceName, cfg.environment)}
                    className="px-4 py-2 rounded-full text-xs font-bold border border-black/10 dark:border-white/10 bg-background hover:bg-muted/50 transition-all flex items-center gap-1.5 text-foreground shadow-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Configure
                  </button>
                </div>

                {/* Display credentials */}
                {credEntries.length > 0 && (
                  <div className="pt-3 border-t border-black/5 dark:border-white/5">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2">
                      Configured Credentials (Masked)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {credEntries.map(([key, val]) => (
                        <div key={key} className="bg-background/90 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-xs flex items-center justify-between">
                          <span className="text-muted-foreground text-[11px] font-medium">{key}:</span>
                          <span className="font-mono font-bold text-foreground text-[11px]">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup / Edit Integration Card */}
      <div ref={editCardRef} className="group relative overflow-hidden border border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#a0f212]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-[#a0f212] p-2.5 rounded-2xl shadow-sm">
              <Plus className="h-5 w-5 text-[#0b0c01]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">Setup / Edit Integration</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Select a service and provide credentials to configure an integration.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-8 py-6 space-y-6">
          {/* Service selector pills */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SERVICE_META) as ServiceName[]).map((svc) => {
              const existing = integrations.find((c) => c.serviceName === svc);
              return (
                <button
                  key={svc}
                  type="button"
                  onClick={() => handleEdit(svc, existing?.environment)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                    setupMode === svc
                      ? "bg-[#0b0c01] text-white border-transparent shadow-md"
                      : "bg-muted/30 text-muted-foreground border-black/10 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {SERVICE_META[svc].label}
                  {existing && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {setupMode && (
            <div className="rounded-[24px] border border-[#a0f212]/20 bg-[#a0f212]/5 p-6 space-y-5">
              {/* Environment toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Environment</label>
                <div className="flex gap-2">
                  {(["TEST", "LIVE"] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => handleChange("environment", env)}
                      className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                        form.environment === env
                          ? "bg-[#0b0c01] text-white border-transparent shadow-md"
                          : "bg-white/50 text-muted-foreground border-black/10 hover:text-foreground"
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic credential fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {setupFields[setupMode].map(({ key, label, type }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{label}</label>
                    <input
                      type={type ?? "text"}
                      placeholder={label}
                      value={form[key] ?? ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-4 h-11 rounded-xl border border-black/10 dark:border-white/10 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40"
                    />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setSetupMode(null); setForm({}); }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border border-black/10 hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSetup}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#0b0c01] text-white hover:bg-[#1a1c02] px-6 py-2.5 rounded-full font-bold text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Save {SERVICE_META[setupMode].label}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
