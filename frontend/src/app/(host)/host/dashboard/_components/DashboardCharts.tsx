import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export function SalesChartCard({ revenueData }: { revenueData: Array<{ month: string; earnings: number }> }) {
  const TOOLTIP_STYLE = {
    background: "#ffffff", 
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: 16,
    fontSize: 12,
    color: "#0b0c01",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    fontWeight: 600,
  };
  const AXIS_STYLE = { fontSize: 11, fill: "#64748b", fontWeight: 600 };

  return (
    <Card className="h-full border border-black/5 rounded-[32px] bg-white shadow-xl overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-8 pt-8">
        <div className="space-y-1">
          <CardTitle className="text-xl font-extrabold text-[#0b0c01]">Sales Analytics</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">Gross monthly revenue compiled across workshop sales.</CardDescription>
        </div>
        <button className="hidden sm:flex items-center space-x-1 bg-black/[0.03] hover:bg-black/5 text-[#0b0c01] px-4 py-2 rounded-xl text-xs font-bold transition-colors">
          <span>This Year</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </CardHeader>
      <CardContent className="pt-6 px-8 pb-8 flex-1 min-h-[300px]">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" opacity={0.05} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} style={AXIS_STYLE} dy={10} />
              <YAxis tickLine={false} axisLine={false} style={AXIS_STYLE} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#0b0c01" }} />
              <Bar dataKey="earnings" radius={[8, 8, 8, 8]} barSize={40}>
                {revenueData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === revenueData.length - 1 ? "#c1ff72" : "#e2e8f0"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyFlowCard({ bookingsTrendData }: { bookingsTrendData: Array<{ day: string; bookings: number }> }) {
  const TOOLTIP_STYLE_DARK = {
    background: "#152B20", 
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    fontSize: 12,
    color: "#ffffff",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    fontWeight: 600,
  };
  const AXIS_STYLE_DARK = { fontSize: 11, fill: "rgba(255,255,255,0.4)", fontWeight: 600 };

  return (
    <Card className="h-full border border-white/5 rounded-[32px] bg-[#0b0c01] shadow-2xl overflow-hidden flex flex-col relative group">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 px-8 pt-8">
        <div className="space-y-1">
          <CardTitle className="text-xl font-extrabold text-white">Weekly Flow</CardTitle>
          <CardDescription className="text-sm font-medium text-white/50">Timeline of ticket registrations.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-6 px-8 pb-8 flex-1 min-h-[300px]">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bookingsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.05} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} style={AXIS_STYLE_DARK} dy={10} />
              <YAxis tickLine={false} axisLine={false} style={AXIS_STYLE_DARK} dx={-10} />
              <Tooltip contentStyle={TOOLTIP_STYLE_DARK} itemStyle={{ color: "#a0f212" }} />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#a0f212" 
                strokeWidth={4} 
                dot={{ r: 5, strokeWidth: 0, fill: "#a0f212" }} 
                activeDot={{ r: 8, fill: "#0b0c01", stroke: "#a0f212", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
