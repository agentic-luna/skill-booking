"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles, LayoutDashboard, Calendar, Users, IndianRupee,
  Menu, X, LogOut, UserCheck, ShieldCheck, Lock, CheckCircle2
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, refreshUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // If not logged in or role is not host, redirect appropriately
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "host") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "host") {
      refreshUser();
    }
  }, [isAuthenticated, user?.role, refreshUser]);

  if (!isAuthenticated || user?.role !== "host") {
    return (
      <div className="flex min-h-screen bg-[#fcfcfc] flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-black/5 rounded-full" />
          <div className="h-4 w-32 bg-black/10 rounded-md" />
        </div>
      </div>
    );
  }

  // Verification properties
  const hostProfile = user?.hostProfile;
  const hasKycSubmitted = !!hostProfile?.govIdUrl;
  const hasBankDetailsSubmitted = !!hostProfile?.bankDetail;
  const isKycApproved = hostProfile?.kycStatus === "APPROVED";
  const isKycPending = hostProfile?.kycStatus === "PENDING";
  const isKycRejected = hostProfile?.kycStatus === "REJECTED";
  const isFullyVerified = isKycApproved && hasBankDetailsSubmitted;

  const menuItems = [
    { name: "Overview", href: "/host/dashboard", icon: LayoutDashboard },
    { name: "Programs", href: "/host/programs", icon: Calendar },
    { name: "Participants", href: "/host/participants", icon: Users },
    { name: "Earnings", href: "/host/earnings", icon: IndianRupee },
    { name: "KYC Verification", href: "/host/kyc", icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0d1e17] text-white p-6 justify-between overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="space-y-10">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <div className="bg-[#a0f212] p-1.5 rounded-lg text-[#0b0c01]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            BookMy<span className="text-[#a0f212]">Training</span>
            <span className="text-[#8a9b93] text-xs ml-2 tracking-normal font-medium">Host</span>
          </span>
        </Link>

        {/* Sidebar Menu Links */}
        <nav className="space-y-2 flex flex-col">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = pathname === item.href;
            const isRestricted = !isKycApproved && item.href !== "/host/kyc";

            return (
              <Link
                key={item.href}
                href={isRestricted ? "#" : item.href}
                onClick={(e) => {
                  if (isRestricted) {
                    e.preventDefault();
                  } else {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${isRestricted
                  ? "opacity-40 cursor-not-allowed text-[#8a9b93] hover:bg-transparent"
                  : isActive
                    ? "bg-[#a0f212] text-[#0d1e17] shadow-lg shadow-[#a0f212]/10"
                    : "text-[#8a9b93] hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComp className={`h-5 w-5 ${isActive ? 'text-[#0d1e17]' : 'text-[#8a9b93]'}`} />
                  <span>{item.name}</span>
                </div>
                {isRestricted && (
                  <Lock className="h-4 w-4 text-[#a0f212]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
        {/* Pro Upgrade / Profile Card */}
        <div className="bg-[#152B20] p-4 rounded-3xl border border-white/5 space-y-4 shadow-xl">
          <div className="bg-[#a0f212]/20 w-10 h-10 rounded-xl flex items-center justify-center text-[#a0f212]">
            {isFullyVerified ? <CheckCircle2 className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              {isFullyVerified ? "Verified Host" : "Host Candidate"}
            </h4>
            <p className="text-[10px] text-[#8a9b93] leading-tight">
              Manage your workshop presence with detailed analytics.
            </p>
          </div>
          <Link href="/dashboard/profile" className="block">
            <Button className="w-full bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] rounded-xl text-xs font-bold h-9">
              Profile Settings
            </Button>
          </Link>
        </div>

        {/* Footer actions */}
        <div className="space-y-2">
          <Link
            href="/programs"
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#8a9b93] hover:bg-white/5 hover:text-white transition-all"
          >
            <Sparkles className="h-5 w-5" />
            <span>Explore Events</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const isRestrictedPath = pathname !== "/host/kyc";
  const shouldBlock = !isKycApproved && isRestrictedPath;

  return (
    <div className="flex min-h-screen bg-[#9ea99f] dark:bg-[#121614]  lg:p-6 gap-6 font-sans selection:bg-[#a0f212]/30 text-[#0b0c01]">

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-48px)] sticky top-6 z-40 rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
        <SidebarContent />
      </aside>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background lg:rounded-[30px] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden h-screen lg:h-[calc(100vh-48px)] relative">

        {/* Subtle background flair */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a0f212]/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

        {/* Top Navbar - Mobile & Small screens */}
        <header className="lg:hidden flex items-center justify-between h-16 px-6 bg-white border-b border-black/5 sticky top-0 z-40">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-[#a0f212] p-1.5 rounded-lg text-[#0b0c01]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-sm text-[#0b0c01]">Host Center</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-black/5 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Verification Status Header Banner */}
        {hasKycSubmitted && !isFullyVerified && (
          <div className="px-8 py-3 bg-white border-b border-black/5 text-xs flex flex-wrap gap-4 items-center justify-between">
            {isKycApproved ? (
              <div className="flex items-center space-x-3">
                <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border border-emerald-500/20 tracking-wider">
                  KYC Verified
                </span>
                {hasBankDetailsSubmitted && (
                  <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border border-emerald-500/20 tracking-wider">
                    Bank Details Verified
                  </span>
                )}
              </div>
            ) : isKycPending ? (
              <div className="text-amber-600 font-bold flex items-center gap-2 animate-pulse text-xs tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                Status will be approved soon, please wait...
              </div>
            ) : (
              <div className="text-red-600 font-bold flex items-center gap-2 text-xs tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                KYC Verification Rejected. Please resubmit valid details.
              </div>
            )}
          </div>
        )}

        {/* Content container */}
        <main className="flex-1 p-6 md:p-10 w-full relative z-10 overflow-y-scroll overflow-x-hidden [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-black/30">
          <div className="max-w-7xl w-full mx-auto">
            {shouldBlock ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="bg-white border border-black/5 max-w-md p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 animate-in zoom-in-95 duration-200">
                  <div className="mx-auto bg-[#a0f212]/10 text-[#0b0c01] w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-extrabold text-[#0b0c01]">
                      {hasKycSubmitted && isKycPending ? "Verification Pending" :
                        isKycRejected ? "Verification Rejected" : "KYC Identity Required"}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {hasKycSubmitted && isKycPending ? "Your KYC identity document verification is currently pending review. Please wait for administrators to approve it." :
                        isKycRejected ? "Your KYC identity document verification was rejected. Please review and submit valid government identity documents to unlock your account." :
                          "To comply with our instructor terms and unlock workshop hosting, please upload your KYC identification documents."}
                    </p>
                  </div>
                  <div className="bg-black/[0.02] border border-black/5 rounded-3xl p-5 space-y-4 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <span className={`w-3 h-3 rounded-full ${isKycApproved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                          isKycPending ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                            isKycRejected ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                              'bg-amber-500'
                          }`} />
                        <span className="font-semibold text-[#0b0c01]">KYC Status</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isKycApproved ? 'bg-emerald-500/10 text-emerald-600' :
                        isKycPending ? 'bg-amber-500/10 text-amber-600' :
                          isKycRejected ? 'bg-red-500/10 text-red-600' :
                            'bg-amber-500/10 text-amber-600'
                        }`}>
                        {hostProfile?.kycStatus ?? 'Not Submitted'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 pt-4">
                    {(!hasKycSubmitted || isKycRejected) && (
                      <Link href="/host/kyc" className="w-full">
                        <Button className="w-full text-sm font-bold py-6 rounded-2xl bg-[#0b0c01] text-white hover:bg-black/80 transition-colors shadow-lg">
                          {isKycRejected ? "Resubmit KYC Docs" : "Upload KYC Docs"}
                        </Button>
                      </Link>
                    )}
                    {hasKycSubmitted && isKycPending && (
                      <Button disabled className="w-full text-sm font-bold py-6 rounded-2xl bg-black/10 text-muted-foreground cursor-not-allowed">
                        Awaiting Admin Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-[#0d1e17]/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full animate-in slide-in-from-left duration-300">
            <div className="h-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10 py-4 pl-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors z-50"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
