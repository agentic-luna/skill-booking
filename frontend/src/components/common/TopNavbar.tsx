"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, BookmarkCheck, Heart, LayoutDashboard, UserCheck } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavbarProps {
  hiddenRoutes?: string[];
}

export default function TopNavbar({ hiddenRoutes = ["/", "/home", "/super-admin", "/login", "/register", "/forgot-password", "/admin/login"] }: TopNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we should hide the navbar on this route
  if (hiddenRoutes.includes(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/host") || pathname.startsWith("/dashboard")) {
    return null;
  }

  // Check if we should force dark styling (e.g. on dashboard where background is white)
  const forceDark = pathname.startsWith("/dashboard") || pathname.startsWith("/programs/") || pathname.startsWith("/host") || pathname.startsWith("/admin");
  const isDarkText = isScrolled || forceDark;
  
  const bgStyle = (isScrolled || forceDark)
    ? "bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm py-3"
    : "bg-transparent py-6";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${bgStyle}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/programs" className={`text-2xl font-bold tracking-tight hover:opacity-80 transition-colors duration-500 ${isDarkText ? "text-[#0b0c01]" : "text-white"}`}>
          BookMy<span className="text-[#a0f212]">Skill</span>
        </Link>
        <div className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors duration-500 ${isDarkText ? "text-[#0b0c01]/70" : "text-white/80"}`}>
          {user?.role !== "admin" && (
            <Link href="/programs" className={`transition-colors ${isDarkText ? "hover:text-[#0b0c01]" : "hover:text-white"}`}>Explore Skills</Link>
          )}
          {user?.role === "client" && (
            <>
              <Link href="/dashboard/wishlist" className={`transition-colors ${isDarkText ? "hover:text-[#0b0c01]" : "hover:text-white"}`}>Wishlist</Link>
              <Link href="/dashboard/tickets" className={`transition-colors ${isDarkText ? "hover:text-[#0b0c01]" : "hover:text-white"}`}>My Tickets</Link>
            </>
          )}
          {user?.role === "host" && (
            <Link href="/host/dashboard" className={`transition-colors ${isDarkText ? "hover:text-[#0b0c01]" : "hover:text-white"}`}>Host Dashboard</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 group focus:outline-none">
                  {user.name && (
                    <span className={`text-sm font-bold transition-colors duration-500 ${isDarkText ? "text-[#0b0c01]/80 group-hover:text-[#0b0c01]" : "text-white/80 group-hover:text-white"}`}>
                      {user.name}
                    </span>
                  )}
                  <div className={`flex items-center justify-center rounded-full h-10 w-10 transition-all duration-500 border-2 overflow-hidden ${isDarkText ? "border-[#0b0c01]/20 text-[#0b0c01] bg-black/5 group-hover:bg-black/10 group-hover:border-[#0b0c01]/50" : "border-white/20 text-[#0b0c01] bg-white group-hover:bg-white/90 group-hover:border-white/50"}`}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User className="h-5 w-5" />}
                      </span>
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize font-normal">
                      {user.role} Account
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user.role === "client" && (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
                      <UserCheck className="mr-2 h-4 w-4" /> Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/tickets")} className="cursor-pointer">
                      <BookmarkCheck className="mr-2 h-4 w-4" /> My Tickets
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/wishlist")} className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4 text-rose-500" /> Wishlist
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "host" && (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/host/dashboard")} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Host Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
                      <UserCheck className="mr-2 h-4 w-4" /> Profile Details
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Portal
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className={`rounded-full px-5 transition-all duration-300 border ${isDarkText ? "bg-black/5 border-black/10 text-[#0b0c01] hover:bg-black/10" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
