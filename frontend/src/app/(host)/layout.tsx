"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sparkles, LayoutDashboard, Calendar, Users, DollarSign, Settings, 
  Menu, X, LogOut, UserCheck, ShieldCheck, Lock
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
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // If not logged in or role is not host, redirect appropriately
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "host") {
      router.push("/home");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "host") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  // Verification properties
  const hostProfile = user?.hostProfile;
  const hasKycSubmitted = !!hostProfile?.govIdUrl;
  const hasBankDetailsSubmitted = !!hostProfile?.bankDetail;
  const isKycApproved = hostProfile?.kycStatus === "APPROVED";
  const isFullyVerified = isKycApproved && hasBankDetailsSubmitted;
  const hasSubmittedBoth = hasKycSubmitted && hasBankDetailsSubmitted;

  const menuItems = [
    { name: "Overview Dashboard", href: "/host/dashboard", icon: LayoutDashboard },
    { name: "My Programs", href: "/host/programs", icon: Calendar },
    { name: "Participants Roster", href: "/host/participants", icon: Users },
    { name: "Earnings Center", href: "/host/earnings", icon: DollarSign },
    { name: "KYC Verification", href: "/host/kyc", icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border/40 justify-between p-6">
      <div className="space-y-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="text-lg font-bold tracking-tight text-graphite-ink">
            BookMy<span className="text-nightshade-black">Skill</span>
          </span>
        </Link>

        {/* User context card */}
        <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-xl border border-border/20">
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
            alt={user?.name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/25"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-foreground truncate">{user?.name}</h4>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {isFullyVerified ? "Verified Instructor" : "Host Candidate"}
            </span>
          </div>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="space-y-1.5 flex flex-col">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = pathname === item.href;
            const isRestricted = !hasSubmittedBoth && item.href !== "/host/kyc" && item.href !== "/host/earnings";
            
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isRestricted
                    ? "opacity-50 cursor-not-allowed text-muted-foreground hover:bg-transparent"
                    : isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComp className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </div>
                {isRestricted && (
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer buttons */}
      <div className="space-y-3 pt-6 border-t border-border/40">
        <Link
          href="/profile"
          className="flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <UserCheck className="h-4.5 w-4.5" />
          <span>Profile Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 w-full text-left"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  const isRestrictedPath = pathname !== "/host/kyc" && pathname !== "/host/earnings";
  const shouldBlock = !hasSubmittedBoth && isRestrictedPath;

  return (
    <div className="flex min-h-screen bg-muted/20 dark:bg-card/5">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-45">
        <SidebarContent />
      </aside>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar - Mobile & Small screens */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-card border-b border-border/40 sticky top-0 z-40">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-sm">BookMySkill Host</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Verification Status Header Banner */}
        {hasSubmittedBoth && (
          <div className="px-6 py-2.5 bg-background border-b border-border/40 text-xs flex flex-wrap gap-4 items-center justify-between">
            {isFullyVerified ? (
              <div className="flex items-center space-x-3">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border border-emerald-500/20">
                  KYC Verified
                </span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border border-emerald-500/20">
                  Bank Detailed Verified
                </span>
              </div>
            ) : (
              <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 animate-pulse text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Status will be approved soon, please wait...
              </div>
            )}
          </div>
        )}

        {/* Content container */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {shouldBlock ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
              <div className="bg-card border border-border/40 max-w-md p-8 rounded-3xl shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
                <div className="mx-auto bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-foreground">Onboarding Required</h2>
                  <p className="text-xs text-muted-foreground">
                    To comply with our instructor terms and unlock workshop hosting, please upload your KYC identification and link your bank details first.
                  </p>
                </div>
                <div className="bg-muted/30 border border-border/20 rounded-2xl p-4 space-y-3.5 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${hasKycSubmitted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-semibold text-foreground">KYC Identity Submission</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${hasKycSubmitted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {hasKycSubmitted ? 'Uploaded' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${hasBankDetailsSubmitted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-semibold text-foreground">Host Bank Details Link</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${hasBankDetailsSubmitted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {hasBankDetailsSubmitted ? 'Linked' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {!hasKycSubmitted && (
                    <Link href="/host/kyc" className="flex-1">
                      <Button className="w-full text-xs font-bold py-2.5 rounded-xl">
                        Upload KYC Docs
                      </Button>
                    </Link>
                  )}
                  {!hasBankDetailsSubmitted && (
                    <Link href="/host/earnings" className="flex-1">
                      <Button variant={hasKycSubmitted ? "default" : "outline"} className="w-full text-xs font-bold py-2.5 rounded-xl">
                        Link Bank Account
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 bg-muted hover:bg-muted/80 rounded-md text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
}
