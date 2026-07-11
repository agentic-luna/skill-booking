import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  fontSize: 11,
};
const AXIS_STYLE = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

interface DashboardChartsProps {
  revenueData: Array<{ month: string; earnings: number }>;
  bookingsTrendData: Array<{ day: string; bookings: number }>;
}

export default function DashboardCharts({ revenueData, bookingsTrendData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <Card className="lg:col-span-7 border-border/40 rounded-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Earnings Performance</CardTitle>
          <CardDescription className="text-xs">Gross monthly revenue compiled across workshop sales.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={AXIS_STYLE} />
                <YAxis tickLine={false} axisLine={false} style={AXIS_STYLE} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-5 border-border/40 rounded-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Weekly Signups Flow</CardTitle>
          <CardDescription className="text-xs">Timeline of ticket registrations this week.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} style={AXIS_STYLE} />
                <YAxis tickLine={false} axisLine={false} style={AXIS_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
