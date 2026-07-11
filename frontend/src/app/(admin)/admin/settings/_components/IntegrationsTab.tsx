import React, { useEffect, useState } from "react";
import { KeyRound, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { ServiceName } from "@/features/admin/api/types";

const SERVICE_META: Record<ServiceName, { label: string; color: string }> = {
  TWILIO:   { label: "Twilio SMS",           color: "bg-red-500/10 text-red-600" },
  SENDGRID: { label: "SendGrid Email",       color: "bg-blue-500/10 text-blue-600" },
  META_WA:  { label: "Meta WhatsApp",        color: "bg-green-500/10 text-green-600" },
  RAZORPAY: { label: "Razorpay Payments",    color: "bg-violet-500/10 text-violet-600" },
};

type SetupMode = ServiceName | null;

export default function IntegrationsTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const {
    integrations, fetchIntegrations, updateIntegration,
    setupTwilio, setupSendgrid, setupMetaWa, setupRazorpay,
    loading,
  } = useAdminStore();

  const [setupMode, setSetupMode] = useState<SetupMode>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => { fetchIntegrations(); }, []);

  const handleChange = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleToggle = async (serviceName: string, isActive: boolean) => {
    try {
      await updateIntegration(serviceName, { isActive });
      showAlert("Integration Updated", `${serviceName} ${isActive ? "enabled" : "disabled"}.`, "success");
    } catch { /* store error */ }
  };

  const handleSetup = async () => {
    if (!setupMode) return;
    const env = (form.environment as "SANDBOX" | "PRODUCTION") || "SANDBOX";
    try {
      switch (setupMode) {
        case "TWILIO":
          await setupTwilio({ environment: env, accountSid: form.accountSid, authToken: form.authToken, fromNumber: form.fromNumber });
          break;
        case "SENDGRID":
          await setupSendgrid({ environment: env, apiKey: form.apiKey, fromEmail: form.fromEmail, fromName: form.fromName });
          break;
        case "META_WA":
          await setupMetaWa({ environment: env, accessToken: form.accessToken, phoneNumberId: form.phoneNumberId, businessAccountId: form.businessAccountId });
          break;
        case "RAZORPAY":
          await setupRazorpay({ environment: env, keyId: form.keyId, keySecret: form.keySecret, webhookSecret: form.webhookSecret });
          break;
      }
      showAlert("Integration Configured", `${SERVICE_META[setupMode].label} credentials saved.`, "success");
      setSetupMode(null);
      setForm({});
    } catch { /* store error */ }
  };

  const setupFields: Record<ServiceName, Array<{ key: string; label: string; type?: string }>> = {
    TWILIO:   [{ key: "accountSid", label: "Account SID" }, { key: "authToken", label: "Auth Token", type: "password" }, { key: "fromNumber", label: "From Number" }],
    SENDGRID: [{ key: "apiKey", label: "API Key", type: "password" }, { key: "fromEmail", label: "From Email" }, { key: "fromName", label: "From Name" }],
    META_WA:  [{ key: "accessToken", label: "Access Token", type: "password" }, { key: "phoneNumberId", label: "Phone Number ID" }, { key: "businessAccountId", label: "Business Account ID" }],
    RAZORPAY: [{ key: "keyId", label: "Key ID" }, { key: "keySecret", label: "Key Secret", type: "password" }, { key: "webhookSecret", label: "Webhook Secret", type: "password" }],
  };

  return (
    <div className="space-y-4">

      {/* Existing integrations list */}
      <Card className="border-border/40 bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-primary" /> Active Integrations
          </CardTitle>
          <CardDescription className="text-xs">Manage third-party service credentials. Secrets are masked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">No integrations configured yet.</div>
          )}
          {integrations.map((cfg) => {
            const meta = SERVICE_META[cfg.serviceName] ?? { label: cfg.serviceName, color: "bg-muted text-foreground" };
            return (
              <div key={cfg.id} className="flex items-center justify-between border border-border/40 rounded-xl p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${meta.color}`}>{meta.label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{cfg.environment}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Updated: {new Date(cfg.updatedAt).toLocaleString()}</p>
                </div>
                <Switch checked={cfg.isActive} onCheckedChange={(v) => handleToggle(cfg.serviceName, v)} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Setup new integration */}
      <Card className="border-border/40 bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-primary" /> Setup New Integration
          </CardTitle>
          <CardDescription className="text-xs">Select a service and provide credentials to configure a new integration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SERVICE_META) as ServiceName[]).map((svc) => (
              <Button key={svc} type="button" variant={setupMode === svc ? "default" : "outline"} size="sm" className="text-xs h-8 rounded-lg" onClick={() => { setSetupMode(svc); setForm({ environment: "SANDBOX" }); }}>
                {SERVICE_META[svc].label}
              </Button>
            ))}
          </div>

          {setupMode && (
            <div className="border border-border/40 rounded-xl p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Environment</Label>
                <div className="flex gap-2">
                  {(["SANDBOX", "PRODUCTION"] as const).map((env) => (
                    <Button key={env} type="button" size="sm" variant={form.environment === env ? "default" : "outline"} className="text-xs h-8" onClick={() => handleChange("environment", env)}>
                      {env}
                    </Button>
                  ))}
                </div>
              </div>
              {setupFields[setupMode].map(({ key, label, type }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs">{label}</Label>
                  <Input type={type ?? "text"} className="h-9 text-xs" placeholder={label} value={form[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {setupMode && (
          <CardFooter className="justify-end border-t pt-4 gap-2">
            <Button type="button" variant="outline" className="text-xs h-9" onClick={() => { setSetupMode(null); setForm({}); }}>Cancel</Button>
            <Button type="button" className="text-xs h-9 px-6 font-semibold" onClick={handleSetup} disabled={loading}>
              {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...</> : `Configure ${SERVICE_META[setupMode].label}`}
            </Button>
          </CardFooter>
        )}
      </Card>

    </div>
  );
}
