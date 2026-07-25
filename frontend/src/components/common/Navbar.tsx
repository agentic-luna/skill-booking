"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Menu, X, Search, LogOut, LayoutDashboard, UserCheck, Heart, BookmarkCheck, Bell, CheckCircle2, AlertTriangle } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";
import { useClientEmailModalStore } from "@/features/auth/store/clientEmailModalStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, fetchNotifications, readNotification } = useClientStore();
  const openClientEmailModal = useClientEmailModalStore((s) => s.openModal);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/programs?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // We now have a light hero everywhere, so always treat it as not home for color purposes
  const isHome = false;
  const showSearchAndShrink = isScrolled || pathname !== "/";
  const unreadNotificationsCount = notifications.filter(n => n.status !== "READ").length;

  useEffect(() => {
    if (isAuthenticated && user?.role === "client") {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const hiddenRoutes = ["/super-admin", "/login", "/register", "/forgot-password", "/admin/login"];
  if (hiddenRoutes.includes(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/host")) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] z-[100] transition-all duration-500 ease-out ${showSearchAndShrink ? "max-w-[816px]" : "max-w-[1250px]"}`}>
      <nav className={`w-full rounded-full transition-all duration-500 ease-out overflow-hidden ${showSearchAndShrink
        ? "bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        : "bg-transparent border-transparent"
        }`}>
        <div className="px-6 sm:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
              <span className={`text-lg font-bold tracking-tight transition-colors duration-500 ${isScrolled || !isHome ? "text-graphite-ink" : "text-white"}`}>
                BookMy<span className="text-primary/90">Skill</span>
              </span>
            </Link>



            {/* Desktop Nav Items */}
            <div className={`hidden md:flex items-center space-x-6 transition-colors duration-500 ${isScrolled || !isHome ? "text-graphite-ink font-semibold" : "text-white/90"}`}>
              <Link
                href="/programs"
                className="text-sm font-medium hover:opacity-80 transition-all duration-500 ease-in-out whitespace-nowrap"
              >
                Explore Skills
              </Link>
              {isAuthenticated && user ? (
                <>
                  {/* Notification Bell Dropdown */}
                  {user.role === "client" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full relative transition-all duration-300 ${isScrolled || !isHome
                              ? "text-graphite-ink hover:bg-black/5 hover:drop-shadow-sm"
                              : "text-white hover:bg-white/10 hover:text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                            }`}
                        >
                          <Bell className="h-5 w-5" />
                          {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto rounded-xl">
                        <DropdownMenuLabel className="font-bold text-xs flex justify-between items-center px-4 py-2.5">
                          <span>Notifications Feed</span>
                          {unreadNotificationsCount > 0 && (
                            <span className="text-[10px] text-primary bg-[#a0f212]/10 px-2 py-0.5 rounded-full">{unreadNotificationsCount} unread</span>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notif) => (
                            <DropdownMenuItem
                              key={notif.id}
                              className={`flex flex-col items-start gap-1 p-3 cursor-pointer text-xs ${notif.status !== "READ" ? "bg-[#a0f212]/5 font-semibold" : ""}`}
                              onClick={() => {
                                if (notif.status !== "READ") readNotification(notif.id);
                              }}
                            >
                              <span className="font-bold text-foreground text-[11px]">{notif.subject || "Alert Notice"}</span>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{notif.bodyContent}</p>
                              <span className="text-[9px] text-muted-foreground/60 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-muted-foreground">No alerts in your feed.</div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Wishlist Link */}
                  {user.role === "client" && (
                    <Link href="/dashboard/wishlist">
                      <Button variant="ghost" size="icon" className={`rounded-full transition-colors ${isScrolled || !isHome ? "text-graphite-ink hover:bg-black/5" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
                        <Heart className="h-4.5 w-4.5" />
                      </Button>
                    </Link>
                  )}

                  {/* Enterprise SaaS Email Verification Status Badge — Only render if email is NOT verified */}
                  {user.role === "client" && !user.isEmailVerified && (
                    <button
                      type="button"
                      onClick={() => openClientEmailModal(user.email || "")}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm animate-pulse"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Verify Email</span>
                    </button>
                  )}



                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none">
                        <div className="h-9 w-9 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-xs font-extrabold ring-2 ring-[#a0f212]/20 tracking-wider shadow-sm">
                          {user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground capitalize font-normal">
                            {user.role} Account
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Role Dashboard Routing */}
                      {user.role === "client" && (
                        <>
                          <DropdownMenuItem onClick={() => router.push("/dashboard/tickets")}>
                            <BookmarkCheck className="mr-2 h-4 w-4" /> My Bookings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/dashboard/wishlist")}>
                            <Heart className="mr-2 h-4 w-4 text-rose-500" /> Wishlist
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.role === "host" && (
                        <DropdownMenuItem onClick={() => router.push("/host/dashboard")}>
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Host Dashboard
                        </DropdownMenuItem>
                      )}
                      {user.role === "admin" && (
                        <DropdownMenuItem onClick={() => router.push("/admin/dashboard")}>
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Portal
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                        <UserCheck className="mr-2 h-4 w-4" /> Profile Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 dark:focus:text-red-400 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" /> Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className={`rounded-full px-5 transition-all duration-300 backdrop-blur-sm border ${isScrolled || !isHome ? "bg-black/5 border-black/10 text-graphite-ink hover:bg-black/10 hover:shadow-sm" : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"}`}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push("/register")}
                    className="px-6 shadow-lg shadow-[#a0f212]/20"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`rounded-full p-2 transition-colors focus:outline-none ${isScrolled || !isHome ? "text-graphite-ink hover:bg-black/5" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-black/10 bg-background/95 backdrop-blur-md px-4 py-4 space-y-4 animate-in slide-in-from-top-4 duration-150">

          <div className="flex flex-col space-y-3">
            <Link
              href="/programs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-black py-1.5"
            >
              Explore Skills
            </Link>

            {isAuthenticated && user ? (
              <>
                {user.role === "client" && (
                  <>
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                    >
                      Home Feed
                    </Link>
                    <Link
                      href="/dashboard/tickets"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                    >
                      My Bookings
                    </Link>
                    {!user.isEmailVerified && (
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openClientEmailModal(user.email || "");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm animate-pulse"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Verify Email Address
                        </button>
                      </div>
                    )}
                  </>
                )}
                {user.role === "host" && (
                  <Link
                    href="/host/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                  >
                    Host Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  href="/dashboard/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                >
                  Wishlist
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                >
                  Profile Details
                </Link>
                <div className="h-[1px] bg-black/10" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-left py-1.5 flex items-center transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" /> Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMobileMenuOpen(false); router.push("/login"); }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  onClick={() => { setMobileMenuOpen(false); router.push("/register"); }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
