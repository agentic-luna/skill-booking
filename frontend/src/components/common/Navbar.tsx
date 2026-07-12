"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Menu, X, Search, LogOut, LayoutDashboard, UserCheck, Heart, BookmarkCheck } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 250);
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

  const isHome = pathname === "/";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[950px] z-[100] transition-all duration-500 ease-out">
      <nav className={`w-full rounded-full transition-all duration-500 ease-out overflow-hidden ${
        isScrolled || !isHome
          ? "bg-bone-white/80 backdrop-blur-xl border border-clay-shadow/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
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
              
            {/* Integrated Search Bar (Shows on Scroll) */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden flex items-center ${isScrolled ? "max-w-[280px] mx-4 opacity-100" : "max-w-0 mx-0 opacity-0"}`}>
              <form onSubmit={handleSearchSubmit} className="relative group w-[280px] shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-grey group-focus-within:text-graphite-ink transition-colors" />
                <Input
                  type="text"
                  placeholder="Search skills..."
                  className="h-10 pl-10 w-full bg-graphite-ink/5 border-clay-shadow/40 text-graphite-ink placeholder:text-stone-grey/60 rounded-full focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Desktop Nav Items */}
            <div className={`hidden md:flex items-center space-x-6 transition-colors duration-500 ${isScrolled || !isHome ? "text-graphite-ink font-semibold" : "text-white/90"}`}>
            {isAuthenticated && user ? (
              <>
                {/* Wishlist Link */}
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className={`rounded-full transition-colors ${isScrolled || !isHome ? "text-graphite-ink hover:bg-graphite-ink/5" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
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
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className={`rounded-full px-5 transition-all duration-300 backdrop-blur-sm border ${isScrolled || !isHome ? "bg-graphite-ink/5 border-graphite-ink/10 text-graphite-ink hover:bg-graphite-ink/10 hover:shadow-sm" : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"}`}>Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="px-6 shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`rounded-full p-2 transition-colors focus:outline-none ${isScrolled || !isHome ? "text-graphite-ink hover:bg-graphite-ink/5" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>
    </nav>

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
    </div>
  );
}
