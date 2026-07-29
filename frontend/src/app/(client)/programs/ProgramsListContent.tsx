"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, SlidersHorizontal, LayoutGrid, List, X, Star, Clock, MapPin,
  ChevronRight, Calendar, AlertCircle, RefreshCw, User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CanvasText } from "@/components/ui/canvas-text";
import { useClientStore } from "@/features/client/store/clientStore";
import type { ClientEvent } from "@/features/client/api/types";

interface FilterSidebarProps {
  category: string;
  setCategory: (v: string) => void;
  minPrice: number;
  setMinPrice: (v: number) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  trainerName: string;
  setTrainerName: (v: string) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  hideFull: boolean;
  setHideFull: (v: boolean) => void;
  handleResetFilters: () => void;
  categoriesList: { name: string; value: string }[];
  router: ReturnType<typeof import("next/navigation").useRouter>;
  sortedCount: number;
  isDark?: boolean;
}

const FilterSidebar = React.memo(function FilterSidebar({
  category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, trainerName, setTrainerName,
  minRating, setMinRating, hideFull, setHideFull, handleResetFilters, categoriesList, router,
  isDark = false
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Category Select */}
      <div className="space-y-3">
        <label className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-white/50" : "text-muted-foreground/80"}`}>Categories</label>
        <div className="space-y-1.5 pt-1">
          {categoriesList.map((cat) => {
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  router.push(`/programs?category=${cat.value}`);
                }}
                className={`group flex items-center w-full justify-between text-left text-sm py-2 px-3 rounded-xl transition-colors duration-200 ${isActive
                  ? isDark
                    ? "bg-[#a0f212]/10 text-[#a0f212] font-bold shadow-[inset_3px_0_0_0_#a0f212]"
                    : "bg-[#a0f212]/20 text-foreground font-bold shadow-[inset_3px_0_0_0_#a0f212]"
                  : isDark
                    ? "text-white/70 hover:bg-white/5 hover:text-white"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
              >
                <span className="truncate">{cat.name}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-2">
        <label className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-white/50" : "text-muted-foreground/80"}`}>Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice || ""}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            placeholder="Min"
            className={`w-full px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 ${isDark ? "bg-white/5 border-white/10 text-white focus:ring-[#a0f212]" : "bg-white border-gray-200 text-gray-900 focus:ring-primary"}`}
          />
          <span className={isDark ? "text-white/50" : "text-gray-400"}>-</span>
          <input
            type="number"
            min={0}
            value={maxPrice || ""}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            placeholder="Max"
            className={`w-full px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 ${isDark ? "bg-white/5 border-white/10 text-white focus:ring-[#a0f212]" : "bg-white border-gray-200 text-gray-900 focus:ring-primary"}`}
          />
        </div>
      </div>

      {/* Trainer Name Filter */}
      <div className="space-y-3 pt-2">
        <label className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-white/50" : "text-muted-foreground/80"}`}>Trainer Name</label>
        <input
          type="text"
          value={trainerName}
          onChange={(e) => setTrainerName(e.target.value)}
          placeholder="E.g. John Doe"
          className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? "bg-white/5 border-white/10 text-white focus:ring-[#a0f212]" : "bg-white border-gray-200 text-gray-900 focus:ring-primary"}`}
        />
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3 pt-2">
        <label className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-white/50" : "text-muted-foreground/80"}`}>Rating</label>
        <div className="space-y-1.5">
          {[
            { label: "Any Rating", value: 0 },
            { label: "4.5★ & Above", value: 4.5 },
            { label: "4.0★ & Above", value: 4.0 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setMinRating(item.value)}
              className={`flex items-center space-x-3 text-sm w-full text-left py-1.5 px-2 rounded-xl transition-all ${minRating === item.value
                ? "text-[#a0f212] font-bold"
                : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center p-0.5 transition-colors ${minRating === item.value
                ? "border-[#a0f212]"
                : isDark
                  ? "border-white/30"
                  : "border-muted-foreground/30"
                }`}>
                {minRating === item.value && <div className="w-2 h-2 bg-[#a0f212] rounded-full animate-in zoom-in duration-200" />}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hide Fully Booked Toggle */}
      <div className={`flex items-center justify-between pt-6 border-t ${isDark ? "border-white/10" : "border-border/40"}`}>
        <div className="flex flex-col space-y-1 pr-4">
          <span className={`text-xs font-bold ${isDark ? "text-white" : "text-foreground"}`}>Available Only</span>
          <span className={`text-[10px] leading-tight ${isDark ? "text-white/50" : "text-muted-foreground"}`}>Hide fully booked sessions</span>
        </div>
        <Switch checked={hideFull} onCheckedChange={setHideFull} className="data-[state=checked]:bg-[#a0f212]" />
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        className={`w-full h-11 text-xs font-bold rounded-xl transition-all shadow-sm ${isDark
          ? "border-white/10 text-white hover:bg-white/5"
          : "border-[#0b0c01]/20 text-[#0b0c01] hover:bg-[#0b0c01] hover:text-white"
          }`}
        onClick={handleResetFilters}
      >
        <RefreshCw className="mr-2 h-3.5 w-3.5" /> Clear All Filters
      </Button>
    </div>
  );
});

export default function ProgramsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Parameter rehydration
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialDates = searchParams.get("dates") || "";

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [dates, setDates] = useState(initialDates);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [trainerName, setTrainerName] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [hideFull, setHideFull] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { events, fetchEvents, loading } = useClientStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync Search state if URL parameter changes
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    setDates(initialDates);
  }, [initialDates]);

  
  const categoriesList = [
    { name: "All Categories", value: "all" },
    { name: "Technology", value: "technology" },
    { name: "Culinary Arts", value: "culinary" },
    { name: "Fitness & Wellness", value: "fitness" },
    { name: "Design & Arts", value: "design" },
    { name: "Photography", value: "photography" },
    { name: "Business", value: "business" },
  ];

  // Filtering calculations
  const filteredPrograms = events.filter((prog) => {
    if (prog.status !== "APPROVED") return false;

    // Filter out past events
    const isFuture = new Date(prog.startTime) >= new Date();
    if (!isFuture) return false;

    const trainerNameStr = prog.trainerName || (prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host");
    const matchesSearch =
      prog.title.toLowerCase().includes(search.toLowerCase()) ||
      (prog.description || "").toLowerCase().includes(search.toLowerCase()) ||
      trainerNameStr.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || (prog.category || "").toLowerCase() === category.toLowerCase();
    const eventLocation = prog.mode === "ONLINE" ? "Online" : prog.venueDetails?.city || prog.venueDetails?.address || "In Person";
    let matchesLocation = !location || location === "Anywhere";
    if (!matchesLocation && location) {
      const locLower = location.toLowerCase();
      const eventLocLower = eventLocation.toLowerCase();
      if (locLower.includes("ernakulam") || locLower.includes("kochi")) {
        matchesLocation = eventLocLower.includes("ernakulam") || eventLocLower.includes("kochi");
      } else if (locLower.includes("thiruvananthapuram") || locLower.includes("trivandrum")) {
        matchesLocation = eventLocLower.includes("thiruvananthapuram") || eventLocLower.includes("trivandrum");
      } else if (locLower.includes("kozhikode") || locLower.includes("calicut")) {
        matchesLocation = eventLocLower.includes("kozhikode") || eventLocLower.includes("calicut");
      } else {
        matchesLocation = eventLocLower.includes(locLower);
      }
    }
    let matchesDates = true;
    if (dates) {
      const eventStartDate = new Date(prog.startTime);
      const eventEndDateVal = (prog.venueDetails as any)?.endDate;
      const eventEndDate = eventEndDateVal ? new Date(eventEndDateVal) : eventStartDate;
      
      if (dates.startsWith("range:")) {
        const [startStr, endStr] = dates.replace("range:", "").split("_");
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        endDate.setHours(23, 59, 59, 999);
        eventEndDate.setHours(23, 59, 59, 999);
        
        if (!isNaN(eventStartDate.getTime()) && !isNaN(eventEndDate.getTime())) {
          matchesDates = eventStartDate <= endDate && eventEndDate >= startDate;
        } else {
          matchesDates = false;
        }
      } else {
        const selectedMonths = dates.split(",");
        if (!isNaN(eventStartDate.getTime())) {
          const startMonth = eventStartDate.toLocaleString("default", { month: "long" });
          const endMonth = eventEndDate.toLocaleString("default", { month: "long" });
          matchesDates = selectedMonths.includes(startMonth) || selectedMonths.includes(endMonth);
        } else {
          matchesDates = false;
        }
      }
    }
    const price = prog.price || prog.venueDetails?.price || 0;
    const matchesPrice = maxPrice === 0 || price <= maxPrice;
    const matchesRating = 4.8 >= minRating;
    const matchesAvailability = !hideFull || prog.availableSeats > 0;
    const matchesTrainerName = !trainerName || trainerNameStr.toLowerCase().includes(trainerName.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation && matchesDates && matchesPrice && matchesRating && matchesAvailability && matchesTrainerName;
  });

  // Sorting calculations
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    const priceA = a.price || a.venueDetails?.price || 0;
    const priceB = b.price || b.venueDetails?.price || 0;
    const likesA = a._count?.likes || 0;
    const likesB = b._count?.likes || 0;
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "rating") return likesB - likesA;
    return likesB - likesA;
  });

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setLocation("");
    setDates("");
    setMaxPrice(0);
    setMinRating(0);
    setTrainerName("");
    setHideFull(false);
    setSortBy("popular");
    router.push("/programs");
  };

  return (
    <main className="flex-1 bg-[#fcfcfc] dark:bg-[#0a0a0a] min-h-screen pb-16">
      {/* 1. DARK GLOWING HERO HEADER */}
      <div className="relative w-full bg-[#0b0c01] overflow-hidden rounded-b-[2rem] shadow-xl pt-16">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a0f212]/20 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-[#a0f212]/10 rounded-full blur-[120px] pointer-events-none transform translate-y-1/3"></div>

        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
            Find Your Next <br className="hidden md:block" />
            <CanvasText
              text="Expert Workshop"
              backgroundClassName="bg-white"
              colors={[
                "rgba(160, 242, 18, 1)",
                "rgba(160, 242, 18, 0.9)",
                "rgba(160, 242, 18, 0.8)",
                "rgba(171, 242, 130, 0.7)",
                "rgba(160, 242, 18, 0.6)",
                "rgba(160, 242, 18, 0.5)",
                "rgba(171, 242, 130, 0.4)",
                "rgba(160, 242, 18, 0.3)",
                "rgba(171, 242, 130, 0.2)",
                "rgba(160, 242, 18, 0.1)",
              ]}
              lineGap={3}
              animationDuration={15}
            />
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">

        {/* Action Bar (Sorting & Layout) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">

          {/* Search Input in Action Bar */}
          <div className="relative group w-full flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-[#0b0c01] transition-colors" />
            <Input
              placeholder="Search keywords, instructors, or skills..."
              className="pl-10 h-11 text-sm bg-white border-border/40 focus:border-[#0b0c01] focus-visible:ring-[#0b0c01] focus-visible:border-[#0b0c01] rounded-xl transition-all shadow-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Grid vs List layout togglers */}
            <div className="bg-muted/50 rounded-xl p-1 hidden sm:flex items-center">
              <Button
                variant={layout === "grid" ? "secondary" : "ghost"}
                size="icon"
                className={`h-9 w-9 rounded-lg ${layout === "grid" ? "bg-white shadow-sm text-foreground" : "hover:bg-white/50 text-muted-foreground"}`}
                onClick={() => setLayout("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === "list" ? "secondary" : "ghost"}
                size="icon"
                className={`h-9 w-9 rounded-lg ${layout === "list" ? "bg-white shadow-sm text-foreground" : "hover:bg-white/50 text-muted-foreground"}`}
                onClick={() => setLayout("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sorting Menu Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl bg-white border-border/40 focus:ring-0 focus:ring-offset-0 focus:border-[#a0f212] shadow-sm font-semibold text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 shadow-xl">
                <SelectItem value="popular" className="font-medium rounded-lg">Most Popular</SelectItem>
                <SelectItem value="price-asc" className="font-medium rounded-lg">Price: Low to High</SelectItem>
                <SelectItem value="price-desc" className="font-medium rounded-lg">Price: High to Low</SelectItem>
                <SelectItem value="rating" className="font-medium rounded-lg">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filters Trigger */}
            <Button
              variant="outline"
              className="min-[840px]:hidden h-11 rounded-xl bg-white border-border/40 shadow-sm font-semibold"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Master Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">

          {/* Sidebar filters (Desktop inline, visible above 840px) */}
          <aside className="hidden min-[840px]:block min-[840px]:col-span-3 lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-[2rem] h-fit sticky top-6">
              <FilterSidebar
                category={category}
                setCategory={setCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                trainerName={trainerName}
                setTrainerName={setTrainerName}
                minRating={minRating}
                setMinRating={setMinRating}
                hideFull={hideFull}
                setHideFull={setHideFull}
                handleResetFilters={handleResetFilters}
                categoriesList={categoriesList}
                router={router}
                sortedCount={sortedPrograms.length}
              />
            </div>
          </aside>

          {/* Catalog results container */}
          <section className="col-span-12 min-[840px]:col-span-9 lg:col-span-9">
            {sortedPrograms.length > 0 ? (
              layout === "grid" ? (
                // PREMIUM GRID LAYOUT
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPrograms.map((prog) => {
                    const instructorName = prog.trainerName || (prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host");
                    const price = prog.price || prog.venueDetails?.price || 0;

                    return (
                      <Link
                        key={prog.id}
                        href={`/programs/${prog.id}`}
                        className="group flex flex-col bg-white border border-border/20 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 relative cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                          <img
                            src={prog.posterUrl || prog.images?.[0] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"}
                            alt={prog.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          {/* Elegant Glassmorphic Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          {/* Premium Glass Badge */}
                          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
                            {prog.category || "General"}
                          </div>
                        </div>

                        <div className="flex flex-col flex-1 p-6 gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="h-6 w-6 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-[8px] font-extrabold ring-2 ring-background shadow-sm">
                                {instructorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground">{instructorName}</span>
                            </div>
                            <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-500">4.8</span>
                            </div>
                          </div>

                          <h3 className="font-extrabold text-[15px] text-foreground line-clamp-2 leading-snug transition-colors duration-300">
                            {prog.title}
                          </h3>

                          <div className="flex flex-wrap gap-y-2 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center w-1/2"><Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {prog.duration || "2 hrs"}</span>
                            <span className="flex items-center w-1/2"><MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {prog.mode}</span>
                          </div>

                          <div className="flex items-center justify-between pt-4 mt-auto">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Price</span>
                              <div className="text-xl font-black text-foreground">${price}</div>
                            </div>
                            <div className="flex items-center justify-center rounded-xl h-10 px-5 text-xs font-bold bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] shadow-[0_0_15px_rgba(160,242,18,0.15)] group-hover:from-[#a0f212] group-hover:to-[#8ce20b] group-hover:text-[#0b0c01] group-hover:shadow-[0_0_25px_rgba(160,242,18,0.4)] transition-all duration-300">
                              View Details
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                // PREMIUM LIST LAYOUT
                <div className="space-y-4">
                  {sortedPrograms.map((prog) => {
                    const instructorName = prog.trainerName || (prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host");
                    const price = prog.price || prog.venueDetails?.price || 0;

                    return (
                      <Link key={prog.id} href={`/programs/${prog.id}`} className="overflow-hidden bg-white border border-border/20 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 group block cursor-pointer">
                        <div className="flex flex-col sm:flex-row h-full">
                          <div className="sm:w-72 aspect-[16/10] sm:aspect-auto relative overflow-hidden bg-muted/20">
                            <img
                              src={prog.posterUrl || prog.images?.[0] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"}
                              alt={prog.title}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
                              {prog.category || "General"}
                            </div>
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="font-extrabold text-lg text-foreground leading-tight transition-colors duration-300 max-w-lg">
                                  {prog.title}
                                </h3>
                                <div className="text-2xl font-black text-foreground shrink-0">${price}</div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-2xl font-medium">{prog.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-border/40">
                              <div className="flex items-center space-x-5 text-xs text-muted-foreground font-semibold">
                                <div className="flex items-center space-x-2">
                                  <div className="h-6 w-6 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-[8px] font-extrabold ring-2 ring-background shadow-sm">
                                    {instructorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-foreground">{instructorName}</span>
                                </div>
                                <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5 opacity-60" /> {prog.duration || "2 hrs"}</span>
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5 opacity-60" /> {prog.mode}</span>
                                <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded-md text-amber-700 dark:text-amber-500">
                                  <Star className="h-3.5 w-3.5 fill-amber-500 mr-1.5" /> 4.8 ({prog._count?.likes || 0})
                                </div>
                              </div>
                              <div className="flex items-center justify-center rounded-xl h-10 px-6 text-sm font-bold bg-gradient-to-r from-[#1b2b0a] to-[#2a420f] border border-[#a0f212]/30 text-[#a0f212] shadow-[0_0_15px_rgba(160,242,18,0.15)] group-hover:from-[#a0f212] group-hover:to-[#8ce20b] group-hover:text-[#0b0c01] group-hover:shadow-[0_0_25px_rgba(160,242,18,0.4)] transition-all duration-300">
                                View Details
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : (
              // EMPTY STATE COMPONENT
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 backdrop-blur-md border border-white rounded-[2rem] shadow-sm space-y-5">
                <div className="p-5 bg-primary/10 rounded-full text-primary">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-xl font-extrabold text-foreground">No matches found</h3>
                  <p className="text-sm text-muted-foreground font-medium">We couldn&apos;t find any events that fit your selected criteria. Try adjusting your search query, price ranges, or rating parameters.</p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold h-11 px-6 shadow-sm bg-white" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* MOBILE DRAWER FILTERS SHEET */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end min-[840px]:hidden">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileFiltersOpen(false)} />

          {/* Drawer sheet panel */}
          <div className="relative w-80 bg-[#0d1e17]/95 backdrop-blur-xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-white/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-extrabold text-lg text-white flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-[#a0f212]" /> Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <FilterSidebar
                category={category}
                setCategory={setCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                trainerName={trainerName}
                setTrainerName={setTrainerName}
                minRating={minRating}
                setMinRating={setMinRating}
                hideFull={hideFull}
                setHideFull={setHideFull}
                handleResetFilters={handleResetFilters}
                categoriesList={categoriesList}
                router={router}
                sortedCount={sortedPrograms.length}
                isDark={true}
              />
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 sticky bottom-0 bg-[#0d1e17]/85 backdrop-blur-md pb-2">
              <Button className="w-full rounded-xl h-12 font-bold bg-[#a0f212] text-black hover:bg-[#8ac90c] shadow-lg shadow-[#a0f212]/20" onClick={() => setMobileFiltersOpen(false)}>
                Show {sortedPrograms.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
