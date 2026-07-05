"use client";

import React, { useState } from "react";
import { DollarSign, Landmark, ArrowUpRight, History, CreditCard, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_BOOKINGS } from "@/constants/mockData";

export default function HostEarningsPage() {
  const [withdrawing, setWithdrawing] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState([
    { id: "wd_1", amount: 450, date: "2026-06-25", account: "Stripe ending 4242", status: "cleared" },
    { id: "wd_2", amount: 300, date: "2026-05-30", account: "Stripe ending 4242", status: "cleared" }
  ]);

  // Host financial math
  const grossRevenue = MOCK_BOOKINGS.reduce(
    (sum, b) => sum + (["confirmed", "completed"].includes(b.status) ? b.amountPaid : 0),
    0
  );
  
  const platformCommissionRate = 0.15; // 15% marketplace commission fee
  const commissionDeduction = Math.round(grossRevenue * platformCommissionRate);
  const netEarnings = grossRevenue - commissionDeduction;
  
  // Withdrawn amount is sum of cleared withdrawals
  const totalWithdrawn = withdrawalHistory.reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = Math.max(0, netEarnings - totalWithdrawn);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availableBalance <= 0) {
      alert("Withdrawable balance is $0.00");
      return;
    }
    
    setWithdrawing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setWithdrawing(false);
    
    const newWithdrawal = {
      id: `wd_${Math.random().toString(36).substr(2, 9)}`,
      amount: availableBalance,
      date: new Date().toISOString().split("T")[0],
      account: bankAccount ? `Bank Account (${bankAccount.slice(-4)})` : "Stripe ending 4242",
      status: "processing",
    };

    setWithdrawalHistory((prev) => [newWithdrawal, ...prev]);
    setBankAccount("");
    alert("Withdrawal request submitted! Funds will arrive in your bank account within 2-3 business days.");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1 pb-4 border-b">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Earnings Center
        </h1>
        <p className="text-sm text-muted-foreground">Manage your finances, check commissions deductions, and withdraw payouts.</p>
      </div>

      {/* Financial Ratios Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Gross Sales</span>
              <div className="text-xl font-extrabold text-foreground">${grossRevenue}</div>
            </div>
            <div className="bg-primary/10 text-primary p-3 rounded-xl"><DollarSign className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Platform Fee (15%)</span>
              <div className="text-xl font-extrabold text-muted-foreground">${commissionDeduction}</div>
            </div>
            <div className="bg-destructive/10 text-destructive p-3 rounded-xl"><Landmark className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card rounded-2xl">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Net Earnings</span>
              <div className="text-xl font-extrabold text-foreground">${netEarnings}</div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl"><CreditCard className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="border-primary bg-primary/5 rounded-2xl shadow-sm">
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Withdrawable Bal</span>
              <div className="text-xl font-extrabold text-primary">${availableBalance}</div>
            </div>
            <div className="bg-primary text-white p-3 rounded-xl"><ArrowUpRight className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Payout & History Panel split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payout request box */}
        <Card className="lg:col-span-5 border-border/40 rounded-2xl bg-card">
          <form onSubmit={handleRequestWithdrawal}>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-primary" /> Request Payout
              </CardTitle>
              <CardDescription className="text-xs">Withdraw your available balance directly to Stripe/Bank account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Amount to Withdraw</Label>
                <div className="text-3xl font-extrabold text-foreground">${availableBalance}</div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="bankAcc" className="text-xs">Stripe Email / IBAN Account</Label>
                <Input 
                  id="bankAcc" 
                  placeholder="stripe-payouts@example.com" 
                  className="h-9 text-xs" 
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required 
                  disabled={availableBalance <= 0 || withdrawing}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button 
                type="submit" 
                className="w-full text-xs font-semibold rounded-lg h-9" 
                disabled={availableBalance <= 0 || withdrawing}
              >
                {withdrawing ? "Processing request..." : "Transfer Available Balance"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Withdrawal Transactions History */}
        <Card className="lg:col-span-7 border-border/40 rounded-2xl bg-card overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <History className="h-4 w-4 text-primary" /> Withdrawal Logs
              </CardTitle>
              <CardDescription className="text-xs">Record of previous payout withdrawals to bank.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-t">
                <thead>
                  <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <th className="py-3.5 px-4">Withdrawal ID</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Account Target</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30">
                      <td className="py-3.5 px-4 font-semibold text-foreground">{log.id}</td>
                      <td className="py-3.5 px-4 font-bold text-foreground">${log.amount}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{log.account}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{log.date}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          log.status === "cleared" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
