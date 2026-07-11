"use client";

import React from "react";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "@/features/admin/store/adminStore";

import PlatformTab from "./_components/PlatformTab";
import TemplatesTab from "./_components/TemplatesTab";
import IntegrationsTab from "./_components/IntegrationsTab";

export default function AdminSettingsPage() {
  const { error } = useAdminStore();

  return (
    <div className="space-y-6">

      <div className="pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground">Configure commission rules, branding, templates, and API connections.</p>
      </div>

      {error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>
      )}

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-lg mb-6">
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="platform"><PlatformTab /></TabsContent>
        <TabsContent value="templates"><TemplatesTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
      </Tabs>

    </div>
  );
}
