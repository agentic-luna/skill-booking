"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sparkles, LayoutDashboard, Calendar, Users, DollarSign, Settings, 
  Menu, X, LogOut, UserCheck, ShieldCheck
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
            src={user.avatarUrl}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/25"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-foreground truncate">{user.name}</h4>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Verified Instructor</span>
          </div>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="space-y-1.5 flex flex-col">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <IconComp className="h-4.5 w-4.5" />
                <span>{item.name}</span>
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

        {/* Content container */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
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
