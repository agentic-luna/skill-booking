"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, BookmarkCheck, Heart, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { cn } from "@/lib/utils";

const DASHBOARD_LINKS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile Settings", href: "/dashboard/profile", icon: User },
  { name: "My Tickets", href: "/dashboard/tickets", icon: BookmarkCheck },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isAdmin = user?.role === "admin";

  const visibleLinks = DASHBOARD_LINKS.filter((link) => {
    if (isAdmin && (link.name === "Overview" || link.name === "My Tickets" || link.name === "Wishlist")) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] flex flex-col pt-[104px]">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-32 p-4 bg-white/80 dark:bg-[#0b0c01]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2">
            <div className="px-4 pb-4 pt-2 mb-2 border-b border-black/5 dark:border-white/10">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">My Account</h2>
              <p className="text-xs text-muted-foreground mt-1">Manage your bookings and preferences</p>
            </div>
            
            <nav className="flex flex-col gap-1">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                      isActive 
                        ? "bg-[#0b0c01] text-[#a0f212] shadow-md dark:bg-white dark:text-[#0b0c01]" 
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-70")} />
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="my-2 h-[1px] bg-black/5 dark:bg-white/10 w-full" />
              
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full text-left"
              >
                <LogOut className="h-4 w-4 opacity-70" />
                Log out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white/80 dark:bg-[#0b0c01]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          
          {/* Subtle glow effect in the content area */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#a0f212]/5 rounded-full blur-[80px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="relative z-10 p-6 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
