import React from "react";
import { DollarSign, Users, Calendar, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardsProps {
  totalRevenue: number;
  totalSignups: number;
  activePrograms: number;
  averageRating: string;
}

function KpiCard({
  label, value, icon, colorClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <Card className="rounded-2xl border-border/40 bg-card">
      <CardContent className="pt-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
          <div className="text-2xl font-extrabold text-foreground">{value}</div>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}

export default function KpiCards({ totalRevenue, totalSignups, activePrograms, averageRating }: KpiCardsProps) {
  return (
    <>
      <KpiCard label="Gross Earnings" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} colorClass="bg-emerald-500/10 text-emerald-500" />
      <KpiCard label="Total Signups" value={`${totalSignups} Students`} icon={<Users className="h-5 w-5" />} colorClass="bg-blue-500/10 text-blue-500" />
      <KpiCard label="Active Classes" value={`${activePrograms} Workshops`} icon={<Calendar className="h-5 w-5" />} colorClass="bg-violet-500/10 text-violet-500" />
      <KpiCard label="Average Rating" value={averageRating} icon={<Star className="h-5 w-5" />} colorClass="bg-amber-500/10 text-amber-500" />
    </>
  );
}
