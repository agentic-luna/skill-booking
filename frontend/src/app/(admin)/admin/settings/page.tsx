"use client";

import React, { useState } from "react";
import { Settings, Landmark, Brush, Mail, HelpCircle, HardDrive, KeyRound } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  
  // Financial Configuration states
  const [commissionRate, setCommissionRate] = useState(15); // Default 15%
  const [refundWindow, setRefundWindow] = useState(48); // 48 hours cancellation window
  const [minPayout, setMinPayout] = useState(50); // $50 minimum payout threshold

  // Branding states
  const [platformName, setPlatformName] = useState("BookMySkill");
  const [slogan, setSlogan] = useState("Empowering experts, expanding learners.");
  
  // Third-party API states
  const [stripeActive, setStripeActive] = useState(true);
  const [zoomActive, setZoomActive] = useState(true);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSaving(false);
    alert("Platform configuration parameters successfully applied globally!");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground">Configure commission rules, branding, notifications, and API connections.</p>
      </div>

      <form onSubmit={handleSaveSettings}>
        <Tabs defaultValue="financials" className="w-full">
          
          <TabsList className="grid grid-cols-4 w-full max-w-lg mb-6">
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="notifications">Templates</TabsTrigger>
            <TabsTrigger value="apis">Integrations</TabsTrigger>
          </TabsList>

          {/* TAB 1: FINANCIALS */}
          <TabsContent value="financials">
            <Card className="border-border/40 bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-primary" /> Commission & Refund Rules
                </CardTitle>
                <CardDescription className="text-xs">Manage transaction payouts and learner ticket refund policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Platform Commission fee */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label>Platform Commission Rate</Label>
                    <span className="text-primary font-bold text-sm">{commissionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground">Marketplace fee deducted from host registrations sales before payout.</p>
                </div>

                {/* Refund cancellation window */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label>Refund Cancellation Window</Label>
                    <span className="text-primary font-bold text-sm">{refundWindow} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={72}
                    step={12}
                    value={refundWindow}
                    onChange={(e) => setRefundWindow(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground">Duration prior to class start date where students are entitled to full cancel-refunds.</p>
                </div>

                {/* Minimum payout withdraw limit */}
                <div className="space-y-1.5 max-w-xs">
                  <Label htmlFor="minPayout" className="text-xs">Minimum Withdrawable Balance (USD)</Label>
                  <Input 
                    id="minPayout" 
                    type="number" 
                    className="h-9 text-xs" 
                    value={minPayout} 
                    onChange={(e) => setMinPayout(Number(e.target.value))} 
                  />
                  <p className="text-[10px] text-muted-foreground">Minimum account balance threshold required to submit Stripe transfers.</p>
                </div>

              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={saving}>
                  {saving ? "Applying changes..." : "Save Financial Rules"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 2: BRANDING */}
          <TabsContent value="branding">
            <Card className="border-border/40 bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Brush className="h-4 w-4 text-primary" /> Platform Branding (CMS)
                </CardTitle>
                <CardDescription className="text-xs">Configure site assets, landing copy and tags visible to clients.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="platName" className="text-xs">Platform Display Name</Label>
                    <Input id="platName" className="h-9 text-xs" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="slogan" className="text-xs">Landing Page Slogan</Label>
                    <Input id="slogan" className="h-9 text-xs" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Primary Theme Tint</Label>
                    <div className="flex gap-2 pt-1.5">
                      {["#7c3aed", "#2563eb", "#059669", "#e11d48"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-8 h-8 rounded-full border-2 transition-transform active:scale-90"
                          style={{ backgroundColor: color, borderColor: color === "#7c3aed" ? "white" : "transparent" }}
                          onClick={() => alert(`Theme color set to: ${color}`)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={saving}>
                  {saving ? "Saving..." : "Apply Branding CMS"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 3: NOTIFICATION TEMPLATES */}
          <TabsContent value="notifications">
            <Card className="border-border/40 bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary" /> Triggered Notifications Templates
                </CardTitle>
                <CardDescription className="text-xs">Edit email templates dispatched automatically by platform alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs">Registration Confirmation Email Subject</Label>
                  <Input id="subject" defaultValue="Confirm Ticket: You are registered for {{class_title}}" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="body" className="text-xs">Email Roster Body Layout</Label>
                  <textarea
                    id="body"
                    rows={5}
                    defaultValue="Dear {{student_name}},\n\nYour seat for {{class_title}} hosted by {{host_name}} starting on {{class_date}} has been reserved.\n\nWebinar Link: {{location_details}}\n\nWarm regards,\nBookMySkill Team"
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={saving}>
                  Save Templates
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 4: API INTEGRATIONS */}
          <TabsContent value="apis">
            <Card className="border-border/40 bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-primary" /> Third-party Services Connections
                </CardTitle>
                <CardDescription className="text-xs">Configure access credentials for payment portals and webinar routers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                
                {/* Stripe integration switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold">Stripe Payment Gateway</span>
                    <p className="text-xs text-muted-foreground">Enable live credit card charge collection and transfers routing.</p>
                  </div>
                  <Switch checked={stripeActive} onCheckedChange={setStripeActive} />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <Label htmlFor="stripeKey" className="text-xs">Stripe Publishable Key</Label>
                  <Input id="stripeKey" type="password" value="pk_test_51MzZJ2F113824fha38..." readOnly className="h-9 text-xs bg-muted/30" />
                </div>

                <div className="h-[1px] bg-border/40" />

                {/* Zoom integration switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold">Zoom API Automation Router</span>
                    <p className="text-xs text-muted-foreground">Auto-generate Zoom meeting schedules when hosts configure online classes.</p>
                  </div>
                  <Switch checked={zoomActive} onCheckedChange={setZoomActive} />
                </div>

              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={saving}>
                  Save Integrations
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </form>

    </div>
  );
}
