import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, Rocket, AlertTriangle } from "lucide-react";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BoostSettingsTab() {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { platformSettings, fetchPlatformSettings, upsertPlatformSetting, loading } = useAdminStore();

  const [boostPricing, setBoostPricing] = useState<any[]>([]);
  const [activeDays, setActiveDays] = useState<number | null>(null);
  const [newDaysInput, setNewDaysInput] = useState<string>("");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Custom confirm state for deleting days
  const [daysToDelete, setDaysToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  useEffect(() => {
    if (platformSettings.length === 0 || hasLoaded) return;
    const pricingVal = platformSettings.find((s) => s.key === "BOOST_PRICING")?.value;
    if (pricingVal) {
      try {
        const parsed = typeof pricingVal === 'string' ? JSON.parse(pricingVal) : pricingVal;
        if (Array.isArray(parsed)) {
          setBoostPricing(parsed);
          setHasLoaded(true);
          const uniqueDays = Array.from(new Set(parsed.map(p => Number(p.days)))).sort((a, b) => a - b);
          if (uniqueDays.length > 0 && activeDays === null) {
            setActiveDays(uniqueDays[0]);
          }
        }
      } catch (e) {
        console.error("Failed to parse boost pricing", e);
      }
    }
  }, [platformSettings, hasLoaded, activeDays]);

  // Extract all unique durations
  const uniqueDaysList = Array.from(new Set(boostPricing.map(p => Number(p.days)))).sort((a, b) => a - b);

  // Fallback if activeDays was deleted
  useEffect(() => {
    if (activeDays !== null && !uniqueDaysList.includes(activeDays)) {
      setActiveDays(uniqueDaysList.length > 0 ? uniqueDaysList[0] : null);
    }
  }, [boostPricing, activeDays, uniqueDaysList]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertPlatformSetting({ key: "BOOST_PRICING", value: boostPricing });
      showAlert("Boost Pricing Saved", "Days and tier prices have been updated globally.", "success");
      setHasLoaded(false); // allow re-population from freshly saved store settings
    } catch {
      showAlert("Error", "Failed to update boost pricing settings.", "destructive");
    }
  };

  const handleAddDays = async () => {
    const daysVal = Number(newDaysInput);
    if (!daysVal || daysVal <= 0) {
      showAlert("Invalid Input", "Please enter a valid number of days.", "destructive");
      return;
    }
    if (uniqueDaysList.includes(daysVal)) {
      showAlert("Duplicate Duration", "This duration already exists.", "destructive");
      return;
    }

    // Add pricing entries for all three tiers (BASIC, STANDARD, PRO) for this duration
    const newEntries = [
      { id: `basic-${daysVal}`, tier: "BASIC", days: daysVal, price: 0 },
      { id: `standard-${daysVal}`, tier: "STANDARD", days: daysVal, price: 0 },
      { id: `pro-${daysVal}`, tier: "PRO", days: daysVal, price: 0 }
    ];

    const updatedPricing = [...boostPricing, ...newEntries];
    
    try {
      await upsertPlatformSetting({ key: "BOOST_PRICING", value: updatedPricing });
      setBoostPricing(updatedPricing);
      setHasLoaded(false); // force reload from updated store
      setActiveDays(daysVal);
      setNewDaysInput("");
      showAlert("Duration Added", `${daysVal} Days tier created successfully in backend. Set prices below.`, "success");
    } catch {
      showAlert("Error", "Failed to add duration in database.", "destructive");
    }
  };

  const confirmRemoveDays = async () => {
    if (daysToDelete === null) return;
    const updatedPricing = boostPricing.filter(p => Number(p.days) !== daysToDelete);
    
    try {
      await upsertPlatformSetting({ key: "BOOST_PRICING", value: updatedPricing });
      setBoostPricing(updatedPricing);
      setHasLoaded(false); // force reload from updated store
      showAlert("Duration Removed", `${daysToDelete} Days plan removed successfully from database.`, "success");
    } catch {
      showAlert("Error", "Failed to remove duration in database.", "destructive");
    } finally {
      setDaysToDelete(null);
    }
  };

  const getTierPrice = (tier: string) => {
    if (activeDays === null) return 0;
    const match = boostPricing.find(p => p.tier.toUpperCase() === tier.toUpperCase() && Number(p.days) === activeDays);
    return match ? match.price : 0;
  };

  const updatePrice = (tier: string, value: string) => {
    if (activeDays === null) return;
    const numericVal = value === "" ? 0 : Number(value);
    setBoostPricing(prev => prev.map(p => {
      if (p.tier.toUpperCase() === tier.toUpperCase() && Number(p.days) === activeDays) {
        return { ...p, price: numericVal };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="group relative overflow-hidden border border-black/5 dark:border-white/5 bg-card rounded-[32px] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#a0f212]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#a0f212]/10 transition-all duration-500" />
        <form onSubmit={handleSave} className="relative z-10">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#0b0c01] p-2.5 rounded-2xl shadow-sm">
                <Rocket className="h-5 w-5 text-[#a0f212]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Boost Plan Matrix</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage day-wise & plan-wise pricing structures dynamically.</p>
              </div>
            </div>

            {/* Quick Add Form */}
            <div className="flex items-center gap-2">
              <div className="relative max-w-[120px]">
                <Input
                  type="number"
                  placeholder="Days"
                  value={newDaysInput}
                  onChange={(e) => setNewDaysInput(e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-[#a0f212]"
                />
              </div>
              <Button type="button" onClick={handleAddDays} className="h-9 rounded-xl bg-[#0b0c01] hover:bg-black text-white text-xs font-bold gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Day
              </Button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            
            {/* Dynamic Days tabs on top */}
            {uniqueDaysList.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-black/10 rounded-2xl text-muted-foreground text-xs font-semibold">
                No pricing durations configured. Enter a number above to add duration days.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Horizontal tabs */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-black/5">
                  {uniqueDaysList.map((days) => {
                    const isActive = activeDays === days;
                    return (
                      <div key={days} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveDays(days)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#0b0c01] text-white shadow-md"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {days} Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setDaysToDelete(days)}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg text-muted-foreground transition-colors"
                          title={`Delete ${days} Days Plan`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Fields for currently active day tab */}
                {activeDays !== null && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Basic Boost */}
                    <div className="bg-muted/10 border border-black/5 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-black uppercase text-foreground">Basic Boost</h4>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="price-basic" className="text-[10px] text-muted-foreground uppercase font-bold">Price (₹)</Label>
                        <Input
                          id="price-basic"
                          type="number"
                          min={0}
                          value={getTierPrice("BASIC")}
                          onChange={(e) => updatePrice("BASIC", e.target.value)}
                          className="h-10 text-sm font-bold bg-white focus-visible:ring-1 focus-visible:ring-[#a0f212]"
                        />
                      </div>
                    </div>

                    {/* Pro Boost */}
                    <div className="bg-muted/10 border border-black/5 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#a0f212]" />
                        <h4 className="text-xs font-black uppercase text-foreground">Pro Boost</h4>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="price-standard" className="text-[10px] text-muted-foreground uppercase font-bold">Price (₹)</Label>
                        <Input
                          id="price-standard"
                          type="number"
                          min={0}
                          value={getTierPrice("STANDARD")}
                          onChange={(e) => updatePrice("STANDARD", e.target.value)}
                          className="h-10 text-sm font-bold bg-white focus-visible:ring-1 focus-visible:ring-[#a0f212]"
                        />
                      </div>
                    </div>

                    {/* Ultra Pro Boost */}
                    <div className="bg-muted/10 border border-black/5 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <h4 className="text-xs font-black uppercase text-foreground">Ultra Pro Boost</h4>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="price-pro" className="text-[10px] text-muted-foreground uppercase font-bold">Price (₹)</Label>
                        <Input
                          id="price-pro"
                          type="number"
                          min={0}
                          value={getTierPrice("PRO")}
                          onChange={(e) => updatePrice("PRO", e.target.value)}
                          className="h-10 text-sm font-bold bg-white focus-visible:ring-1 focus-visible:ring-[#a0f212]"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-8 py-5 border-t border-black/5 dark:border-white/5 flex justify-end bg-muted/20 rounded-b-[32px]">
            <button
              type="submit"
              disabled={loading || uniqueDaysList.length === 0}
              className="flex items-center gap-2 bg-[#0b0c01] text-white hover:bg-[#1a1c02] px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Price Rules
            </button>
          </div>
        </form>
      </div>

      {/* ── CUSTOM CONFIRM DIALOG OVERLAY ────────────────────────────────── */}
      {daysToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-[28px] max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Remove Duration?</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Deleting {daysToDelete} Days Promotion Plan</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to remove the {daysToDelete} Days promotion plan? This will delete pricing for Basic, Pro, and Ultra Pro tiers under this duration.
              </p>

              <div className="flex gap-2.5 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs font-bold h-10"
                  onClick={() => setDaysToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl text-xs font-bold h-10 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  onClick={confirmRemoveDays}
                >
                  Yes, Remove Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
