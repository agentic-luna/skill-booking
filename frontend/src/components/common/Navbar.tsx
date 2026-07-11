"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Menu, X, Search, LogOut, LayoutDashboard, UserCheck, Heart, BookmarkCheck, Bell } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useClientStore } from "@/features/client/store/clientStore";

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
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, fetchNotifications, readNotification } = useClientStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/programs?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const unreadNotificationsCount = notifications.filter(n => n.status !== "READ").length;

  useEffect(() => {
    if (isAuthenticated && user?.role === "client") {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  return (
    <nav className="glass-nav">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-90">
              <span className="text-lg font-bold tracking-tight text-graphite-ink">
                BookMy<span className="text-nightshade-black">Skill</span>
              </span>
            </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/programs" className="text-sm font-medium text-foreground hover:text-black transition-colors">
              Explore Skills
            </Link>



            {isAuthenticated && user ? (
              <>
                {/* Notification Bell Dropdown */}
                {user.role === "client" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground relative">
                        <Bell className="h-4.5 w-4.5" />
                        {unreadNotificationsCount > 0 && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto rounded-xl">
                      <DropdownMenuLabel className="font-bold text-xs flex justify-between items-center px-4 py-2.5">
                        <span>Notifications Feed</span>
                        {unreadNotificationsCount > 0 && (
                          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadNotificationsCount} unread</span>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif) => (
                          <DropdownMenuItem
                            key={notif.id}
                            className={`flex flex-col items-start gap-1 p-3 cursor-pointer text-xs ${notif.status !== "READ" ? "bg-primary/5 font-semibold" : ""}`}
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
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                    <Heart className="h-4.5 w-4.5" />
                  </Button>
                </Link>



                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
                      />
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
                        <DropdownMenuItem onClick={() => router.push("/home")}>
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Home Feed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/bookings")}>
                          <BookmarkCheck className="mr-2 h-4 w-4" /> My Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/liked-events")}>
                          <Heart className="mr-2 h-4 w-4 text-rose-500" /> Liked Workshops
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

                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <UserCheck className="mr-2 h-4 w-4" /> Profile Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-md px-4 py-4 space-y-4 animate-in slide-in-from-top-4 duration-150">

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
                      href="/home"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                    >
                      Home Feed
                    </Link>
                    <Link
                      href="/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                    >
                      My Bookings
                    </Link>
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
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                >
                  Wishlist
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
                >
                  Profile Details
                </Link>
                <div className="h-[1px] bg-border/40" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-sm font-semibold text-destructive text-left py-1.5 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
