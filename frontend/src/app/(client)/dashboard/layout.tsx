"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, BookmarkCheck, Heart, LayoutDashboard, LogOut, Menu, Sparkles } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { cn } from "@/lib/utils";

const DASHBOARD_LINKS = [
  { name: "My Tickets", href: "/dashboard/tickets", icon: BookmarkCheck },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
];

interface SidebarProps {
  pathname: string;
  userName: string | undefined;
  onNavigate: () => void;
  onLogout: () => void;
  isElevated: boolean;
}

function SidebarContent({ pathname, userName, onNavigate, onLogout, isElevated }: SidebarProps) {
  const visibleLinks = DASHBOARD_LINKS.filter((link) => {
    if (isElevated && (link.name === "My Tickets" || link.name === "Wishlist")) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0d1e17] text-white justify-between py-8 px-6 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#a0f212]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#a0f212]">
      <div className="space-y-8 flex flex-col">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-[#a0f212] p-2.5 rounded-2xl text-[#0b0c01] shadow-[0_0_20px_rgba(160,242,18,0.4)]">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white leading-none">BookMySkill</h2>
            <p className="text-[10px] text-[#a0f212] uppercase font-bold tracking-widest mt-1">Client Dashboard</p>
          </div>
        </div>

        {/* User context card */}
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#a0f212]/30 to-[#a0f212]/10 flex items-center justify-center text-[#a0f212] font-extrabold text-lg ring-2 ring-[#a0f212]/20 shadow-[0_0_10px_rgba(160,242,18,0.2)] shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{userName || "User"}</h4>
            <p className="text-[10px] text-white/50 truncate">Skill Learner</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5 flex flex-col">
          {visibleLinks.map((item) => {
            const IconComp = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all group relative ${
                  isActive
                    ? "bg-[#252525] text-white shadow-inner border border-white/5 font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
                }`}
              >
                <div className="relative shrink-0">
                  <IconComp
                    className={`h-5 w-5 relative z-10 transition-colors ${
                      isActive ? "text-[#a0f212]" : "text-white/60 group-hover:text-white"
                    }`}
                  />
                </div>
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="space-y-2 flex flex-col pt-8 border-t border-white/10">
        <Link
          href="/dashboard/profile"
          onClick={onNavigate}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all group font-medium ${
            pathname === "/dashboard/profile"
              ? "bg-[#252525] text-white shadow-inner border border-white/5 font-semibold"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <User className={`h-5 w-5 transition-colors ${
            pathname === "/dashboard/profile" ? "text-[#a0f212]" : "text-white/60 group-hover:text-white"
          }`} />
          <span className="text-sm tracking-wide">Profile Settings</span>
        </Link>
        <Link
          href="/programs"
          className="flex items-center gap-3.5 px-4 py-3 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all group font-medium"
        >
          <Sparkles className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
          <span className="text-sm tracking-wide">Explore Skills</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group font-medium"
        >
          <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-300 transition-colors" />
          <span className="text-sm tracking-wide">Log out</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isElevated = user?.role === "admin" || user?.role === "host";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sidebarProps: SidebarProps = {
    pathname,
    userName: user?.name,
    onNavigate: () => setSidebarOpen(false),
    onLogout: handleLogout,
    isElevated,
  };

  return (
    <div className="flex min-h-screen bg-[#9ea99f] dark:bg-[#121614] p-4 lg:p-6 gap-6 font-sans">
      
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-48px)] sticky top-6 z-40 rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main content canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-background rounded-[40px] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden h-[calc(100vh-48px)]">
        
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between h-16 px-6 bg-background border-b border-border/40 sticky top-0 z-40">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-[#0b0c01] p-1.5 rounded-xl text-[#a0f212]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-foreground">Client Dashboard</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-scroll overflow-x-hidden p-6 md:p-10 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-black/30">
          <div className="max-w-6xl w-full mx-auto relative">
             {/* Subtle glow effect */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#a0f212]/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 h-full animate-in slide-in-from-left duration-300 py-4 pl-4">
            <div className="h-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
              <SidebarContent {...sidebarProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
