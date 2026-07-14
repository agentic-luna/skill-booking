"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";

interface TopNavbarProps {
  hiddenRoutes?: string[];
}

export default function TopNavbar({ hiddenRoutes = ["/", "/home", "/super-admin", "/login", "/register", "/forgot-password", "/admin/login"] }: TopNavbarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we should hide the navbar on this route
  if (hiddenRoutes.includes(pathname) || pathname.startsWith("/admin")) {
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
          <Link href={user?.role === "host" ? "/host/dashboard" : user?.role === "admin" ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3 group">
            {user?.name && (
              <span className={`text-sm font-bold transition-colors duration-500 ${isDarkText ? "text-[#0b0c01]/80 group-hover:text-[#0b0c01]" : "text-white/80 group-hover:text-white"}`}>
                {user.name}
              </span>
            )}
            <Button variant="ghost" size="icon" className={`rounded-full h-10 w-10 transition-colors duration-500 ${isDarkText ? "text-[#0b0c01] bg-black/5 group-hover:bg-black/10" : "text-[#0b0c01] bg-white group-hover:bg-white/90"}`}>
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
