"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";

import { EarningsCard, ActiveWorkshopsCard, CommunityStatsCard } from "./_components/KpiCards";
import { SalesChartCard, WeeklyFlowCard } from "./_components/DashboardCharts";
import RecentBookingsTable from "./_components/RecentBookingsTable";

const FALLBACK_REVENUE = [
  { month: "Jan", earnings: 0 }, { month: "Feb", earnings: 0 },
  { month: "Mar", earnings: 0 }, { month: "Apr", earnings: 0 },
  { month: "May", earnings: 0 }, { month: "Jun", earnings: 0 },
];
const FALLBACK_WEEKLY = [
  { day: "Mon", bookings: 0 }, { day: "Tue", bookings: 0 },
  { day: "Wed", bookings: 0 }, { day: "Thu", bookings: 0 },
  { day: "Fri", bookings: 0 }, { day: "Sat", bookings: 0 },
  { day: "Sun", bookings: 0 },
];

function SkeletonBento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {/* Top Row Skeletons */}
      <div className="col-span-1 h-64 bg-black/5 rounded-[32px]" />
      <div className="col-span-1 h-64 bg-black/5 rounded-[32px]" />
      <div className="col-span-1 h-64 bg-black/5 rounded-[32px]" />
      {/* Middle Row Skeletons */}
      <div className="col-span-1 md:col-span-2 h-96 bg-black/5 rounded-[32px]" />
      <div className="col-span-1 h-96 bg-black/5 rounded-[32px]" />
    </div>
  );
}

export default function HostDashboard() {
  const { dashboard, dashboardLoading, error, fetchDashboard } = useHostStore();

  useEffect(() => { fetchDashboard(); }, []);

  // Map actual backend fields → UI labels
  // Backend returns: totalEarnings, heldEscrow, activeTicketSales, totalRevenue, eventsCount
  // If the API is unavailable the store keeps dashboard === null, so every ?. falls back to the
  // safe default via the ?? operator — the dashboard still renders with zeros / empty arrays.
  const totalRevenue = dashboard?.totalEarnings ?? 0;
  const heldEscrow = dashboard?.heldEscrow ?? 0;
  const totalSignups = dashboard?.activeTicketSales ?? 0;
  const activePrograms = dashboard?.eventsCount ?? 0;
  const averageRating = dashboard?.averageRating != null
    ? `${dashboard.averageRating.toFixed(1)}★` : "—";
  const revenueData = dashboard?.monthlyRevenue ?? FALLBACK_REVENUE;
  const bookingsTrendData = dashboard?.weeklyBookings ?? FALLBACK_WEEKLY;
  const recentBookings = dashboard?.recentBookings ?? [];

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0c01]">Host Control Center</h1>
          <p className="text-muted-foreground font-medium">Monitor class bookings, track revenue metrics, and publish new programs.</p>
        </div>
        <Link href="/host/programs/create">
          <Button className="rounded-2xl h-12 px-6 text-sm font-bold bg-[#0b0c01] text-white hover:bg-[#0b0c01]/90 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 duration-300">
            <Plus className="mr-2 h-5 w-5" /> Create Workshop
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {error} — dashboard data may not be up to date.
        </div>
      )}

      {/* Mixed-Bento Grid Layout */}
      {dashboardLoading ? (
        <SkeletonBento />
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Top Row: 3 Equal Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* 1. Lime Gradient Earnings */}
            <div className="col-span-1">
              <EarningsCard totalRevenue={totalRevenue} heldEscrow={heldEscrow} />
            </div>

            {/* 2. Dark Active Workshops */}
            <div className="col-span-1">
              <ActiveWorkshopsCard activePrograms={activePrograms} />
            </div>

            {/* 3. White Community Stats (Students & Rating combined) */}
            <div className="col-span-1 lg:col-span-2 xl:col-span-1">
              <CommunityStatsCard totalSignups={totalSignups} averageRating={averageRating} />
            </div>
          </div>

          {/* Middle Row: 2/3 and 1/3 Columns */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* 4. White Sales Chart (2/3 width) */}
            <div className="col-span-1 xl:col-span-2">
              <SalesChartCard revenueData={revenueData} />
            </div>

            {/* 5. Dark Weekly Flow (1/3 width) */}
            <div className="col-span-1">
              <WeeklyFlowCard bookingsTrendData={bookingsTrendData} />
            </div>
          </div>

        </div>
      )}

      {/* Bottom Row: Full width Table */}
      <RecentBookingsTable loading={dashboardLoading} bookings={recentBookings} />

    </div>
  );
}
