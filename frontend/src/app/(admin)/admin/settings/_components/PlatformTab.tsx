import React, { useEffect, useState } from "react";
import { Landmark, Brush } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

export default function PlatformTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { platformSettings, fetchPlatformSettings, upsertPlatformSetting, loading } = useAdminStore();

  useEffect(() => { fetchPlatformSettings(); }, []);

  // Derive local state from API data
  const findVal = (key: string, fallback: string) =>
    platformSettings.find((s) => s.key === key)?.value ?? fallback;

  const [commissionRate, setCommissionRate] = useState(15);
  const [refundWindow, setRefundWindow] = useState(48);
  const [minPayout, setMinPayout] = useState(50);
  const [platformName, setPlatformName] = useState("BookMySkill");
  const [slogan, setSlogan] = useState("Empowering experts, expanding learners.");

  // Sync local state once platform settings arrive
  useEffect(() => {
    if (platformSettings.length === 0) return;
    setCommissionRate(Number(findVal("commissionRate", "15")));
    setRefundWindow(Number(findVal("refundWindow", "48")));
    setMinPayout(Number(findVal("minPayout", "50")));
    setPlatformName(findVal("platformName", "BookMySkill"));
    setSlogan(findVal("slogan", "Empowering experts, expanding learners."));
  }, [platformSettings]);

  const handleSaveFinancials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        upsertPlatformSetting({ key: "commissionRate", value: String(commissionRate) }),
        upsertPlatformSetting({ key: "refundWindow", value: String(refundWindow) }),
        upsertPlatformSetting({ key: "minPayout", value: String(minPayout) }),
      ]);
      showAlert("Financial Rules Saved", "Commission, refund, and payout settings applied globally.", "success");
    } catch { /* error in store */ }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        upsertPlatformSetting({ key: "platformName", value: platformName }),
        upsertPlatformSetting({ key: "slogan", value: slogan }),
      ]);
      showAlert("Branding Updated", "Platform display name and slogan updated.", "success");
    } catch { /* error in store */ }
  };

  return (
    <div className="space-y-6">

      {/* Financials */}
      <Card className="border-border/40 bg-card rounded-2xl">
        <form onSubmit={handleSaveFinancials}>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-primary" /> Commission & Refund Rules
            </CardTitle>
            <CardDescription className="text-xs">Manage transaction payouts and learner ticket refund policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label>Platform Commission Rate</Label>
                <span className="text-primary font-bold text-sm">{commissionRate}%</span>
              </div>
              <input type="range" min={5} max={30} step={1} value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer" />
              <p className="text-[10px] text-muted-foreground">Marketplace fee deducted from host sales before payout.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label>Refund Cancellation Window</Label>
                <span className="text-primary font-bold text-sm">{refundWindow} Hours</span>
              </div>
              <input type="range" min={12} max={72} step={12} value={refundWindow} onChange={(e) => setRefundWindow(Number(e.target.value))} className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer" />
              <p className="text-[10px] text-muted-foreground">Duration prior to class start where students can get full cancel-refunds.</p>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="minPayout" className="text-xs">Minimum Withdrawable Balance (USD)</Label>
              <Input id="minPayout" type="number" className="h-9 text-xs" value={minPayout} onChange={(e) => setMinPayout(Number(e.target.value))} />
              <p className="text-[10px] text-muted-foreground">Minimum account balance threshold for payout transfers.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={loading}>{loading ? "Applying..." : "Save Financial Rules"}</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Branding */}
      <Card className="border-border/40 bg-card rounded-2xl">
        <form onSubmit={handleSaveBranding}>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Brush className="h-4 w-4 text-primary" /> Platform Branding (CMS)
            </CardTitle>
            <CardDescription className="text-xs">Configure site assets, landing copy and tags visible to clients.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="platName" className="text-xs">Platform Display Name</Label>
              <Input id="platName" className="h-9 text-xs" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slogan" className="text-xs">Landing Page Slogan</Label>
              <Input id="slogan" className="h-9 text-xs" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={loading}>{loading ? "Saving..." : "Apply Branding CMS"}</Button>
          </CardFooter>
        </form>
      </Card>

    </div>
  );
}
