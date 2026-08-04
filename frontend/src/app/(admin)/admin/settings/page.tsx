"use client";

import React from "react";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { AlertCircle } from "lucide-react";

import PlatformTab from "./_components/PlatformTab";
import IntegrationsTab from "./_components/IntegrationsTab";

export default function AdminSettingsPage() {
  const { error } = useAdminStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Page Header */}
      <div className="flex flex-col gap-2 pb-2">
        <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
          <span className="inline-flex items-center justify-center bg-card shadow-sm border border-black/5 dark:border-white/5 rounded-full p-2 mx-1 align-middle">
            <Settings className="w-6 h-6 text-foreground" />
          </span>{" "}
          Platform{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(160,242,18,0.2)]">
            Settings
          </span>
        </h1>
        <p className="text-muted-foreground font-medium pl-2">
          Configure commission rules, branding, and API connections.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-2xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="platform" className="w-full">
        {/* Pill-style tab switcher — same pattern as other admin pages */}
        <TabsList className="flex bg-muted/40 p-1 rounded-full border border-black/5 dark:border-white/5 w-fit shadow-sm mb-8 h-auto gap-1">
          <TabsTrigger
            value="platform"
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all data-[state=active]:bg-[#0b0c01] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
          >
            Platform
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all data-[state=active]:bg-[#0b0c01] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform"><PlatformTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
      </Tabs>

    </div>
  );
}
