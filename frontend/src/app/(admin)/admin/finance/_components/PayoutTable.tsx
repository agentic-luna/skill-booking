"use client";

import React, { useState } from "react";
import { Search, RefreshCw, Landmark, CreditCard, QrCode, Calendar, CheckCircle2, Clock, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/features/admin/api/types";
import { PaginationControl } from "@/components/ui/pagination-control";

interface PayoutTableProps {
  loading: boolean;
  eventPayouts: any[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  eventStatusFilter: string;
  onEventStatusFilterChange: (val: string) => void;
  payoutStatusFilter: string;
  onPayoutStatusFilterChange: (val: string) => void;
  onSelectEvent: (eventItem: any) => void;
  onOpenConfirm: (open: boolean) => void;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function PayoutTable({
  loading,
  eventPayouts,
  searchTerm,
  onSearchChange,
  eventStatusFilter,
  onEventStatusFilterChange,
  payoutStatusFilter,
  onPayoutStatusFilterChange,
  onSelectEvent,
  onOpenConfirm,
  pagination,
  onPageChange,
  onLimitChange,
}: PayoutTableProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const safePayouts = Array.isArray(eventPayouts) ? eventPayouts : [];

  return (
    <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#a0f212]" /> Workshop Escrow Payouts Control
          </CardTitle>
          <CardDescription className="text-xs">
            Disburse held workshop ticket revenue to instructors per event. Filterable by completed/upcoming events.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search event, host, email, UPI..."
              className="pl-9 h-9 rounded-xl text-xs bg-muted/20"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Event Status Filter */}
          <select
            className="h-9 rounded-xl border border-black/5 dark:border-white/5 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
            value={eventStatusFilter}
            onChange={(e) => onEventStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Event Roster</option>
            <option value="COMPLETED">Completed Events Only</option>
            <option value="UPCOMING">Upcoming Events Only</option>
          </select>

          {/* Payout Status Filter */}
          <select
            className="h-9 rounded-xl border border-black/5 dark:border-white/5 bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20 text-muted-foreground font-semibold shrink-0 cursor-pointer"
            value={payoutStatusFilter}
            onChange={(e) => onPayoutStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Payout States</option>
            <option value="PENDING">Pending Payout Only</option>
            <option value="RELEASED_TO_HOST">Disbursed / Paid</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-muted/20 font-semibold text-muted-foreground">
                <th className="py-3 px-4">Workshop Event</th>
                <th className="py-3 px-4">Instructor Host</th>
                <th className="py-3 px-4">Bank & UPI Routing</th>
                <th className="py-3 px-4">Amount Needed to Pay</th>
                <th className="py-3 px-4 text-center">Payout Status</th>
                <th className="py-3 px-4 text-center">Disbursement Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Retrieving workshop escrow payout ledger...
                  </td>
                </tr>
              ) : safePayouts.length > 0 ? (
                safePayouts.map((item) => {
                  const bank = item.bankDetail;
                  const canPayout = item.payoutStatus === "PENDING" && item.hostPayableAmount > 0;
                  const isCompleted = item.eventStatus === "COMPLETED";

                  return (
                    <tr key={item.id} className="border-b border-black/5 dark:border-white/5 hover:bg-muted/10 last:border-none">
                      
                      {/* Event Details */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground line-clamp-1">{item.eventTitle}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              isCompleted ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                            }`}>
                              {item.eventStatus}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {new Date(item.startTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Host Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{item.hostName}</span>
                          <span className="text-[10px] text-muted-foreground">{item.hostEmail}</span>
                          {item.hostPhone && <span className="text-[10px] text-muted-foreground font-mono">{item.hostPhone}</span>}
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {bank ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Landmark className="h-3 w-3 text-muted-foreground shrink-0" /> {bank.bankName}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                              <span>A/C: {bank.accountNumber || "N/A"}</span>
                              {bank.accountNumber && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(bank.accountNumber!, `acc-${item.id}`)}
                                  className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                  title="Copy Account Number"
                                >
                                  {copiedField === `acc-${item.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                              )}
                            </div>
                            {bank.upiId && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-[#a0f212] font-mono font-bold">
                                <QrCode className="h-3 w-3 shrink-0" />
                                <span>{bank.upiId}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(bank.upiId!, `upi-${item.id}`)}
                                  className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                  title="Copy UPI ID"
                                >
                                  {copiedField === `upi-${item.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/50">No banking details linked</span>
                        )}
                      </td>

                      {/* Amount Needed to Pay Host for THIS event */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-black text-emerald-600 dark:text-[#a0f212] text-sm">
                            ₹{Number(item.hostPayableAmount || 0).toLocaleString()} INR
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {item.totalBookings || 0} Tickets • Rev: ₹{Number(item.totalRevenue || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Payout Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                          item.payoutStatus === "RELEASED_TO_HOST"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {item.payoutStatus === "RELEASED_TO_HOST" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {item.payoutStatus === "RELEASED_TO_HOST" ? "DISBURSED" : "PENDING"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <Button 
                          variant="default"
                          size="sm"
                          disabled={!canPayout}
                          onClick={() => {
                            onSelectEvent(item);
                            onOpenConfirm(true);
                          }}
                          className={`h-8 rounded-xl font-bold text-xs ${!canPayout ? "opacity-40 grayscale" : "shadow-md hover:shadow-lg transition-all"}`}
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" />
                          Disburse Event Escrow
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                    No workshop payout records matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && onPageChange && (
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
