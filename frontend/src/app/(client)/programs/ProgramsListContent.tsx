"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, SlidersHorizontal, LayoutGrid, List, X, Star, Clock, MapPin, 
  ChevronRight, Calendar, AlertCircle, RefreshCw 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PROGRAMS, Program } from "@/constants/mockData";
import { useClientStore } from "@/features/client/store/clientStore";

function mapEventToProgram(event: any): Program {
  const hostUser = event.host?.user;
  const instructorName = event.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Instructor");
  const instructorAvatar = hostUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
  const locationStr = event.mode === "ONLINE" ? "Online" : (event.venueDetails?.address || "In Person");
  const imageUrlStr = event.posterUrl || event.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600";

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    instructorName,
    instructorAvatar,
    category: event.category || "technology",
    rating: 4.8,
    reviewsCount: event._count?.bookings || 12,
    price: event.price || 0,
    duration: event.duration || "2 hours",
    date: event.startTime ? event.startTime.split("T")[0] : "2026-07-12",
    time: event.startTime 
      ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " EST"
      : "10:00 AM EST",
    spotsLeft: event.availableSeats ?? 0,
    maxSpots: event.totalSeats ?? 20,
    location: locationStr,
    imageUrl: imageUrlStr,
    status: event.status ? event.status.toLowerCase() : "approved",
    featured: true,
  };
}

export default function ProgramsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { events, fetchEvents, loading } = useClientStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // URL Parameter rehydration
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [minRating, setMinRating] = useState<number>(0);
  const [hideFull, setHideFull] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync Search state if URL parameter changes
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  // Categories list mapping
  const categoriesList = [
    { name: "All Categories", value: "all" },
    { name: "Technology", value: "technology" },
    { name: "Culinary Arts", value: "culinary" },
    { name: "Fitness & Wellness", value: "fitness" },
    { name: "Design & Arts", value: "design" },
    { name: "Photography", value: "photography" },
    { name: "Business", value: "business" },
  ];

  const programsList = (events || []).map(mapEventToProgram);

  // Filtering calculations
  const filteredPrograms = programsList.filter((prog) => {
    if (prog.status !== "approved") return false;
    
    // Search check
    const matchesSearch = 
      prog.title.toLowerCase().includes(search.toLowerCase()) ||
      prog.description.toLowerCase().includes(search.toLowerCase()) ||
      prog.instructorName.toLowerCase().includes(search.toLowerCase());
    
    // Category check
    const matchesCategory = category === "all" || prog.category === category;
    
    // Price check
    const matchesPrice = prog.price <= maxPrice;
    
    // Rating check
    const matchesRating = prog.rating >= minRating;
    
    // Availability check
    const matchesAvailability = !hideFull || prog.spotsLeft > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAvailability;
  });

  // Sorting calculations
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    // default: popular (reviewsCount)
    return b.reviewsCount - a.reviewsCount;
  });

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setMaxPrice(200);
    setMinRating(0);
    setHideFull(false);
    setSortBy("popular");
    router.push("/programs");
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-3">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">Search</label>
        <div className="relative group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search keywords..."
            className="pl-10 h-11 text-sm bg-white/50 backdrop-blur-sm border-border/40 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Select */}
      <div className="space-y-3">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">Categories</label>
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
                className={`group flex items-center w-full justify-between text-left text-sm py-2 px-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "bg-[#a0f212]/20 text-foreground font-bold shadow-[inset_3px_0_0_0_#a0f212]"
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

      {/* Price Slider */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">Max Ticket Price</label>
          <span className="font-extrabold text-primary">${maxPrice}</span>
        </div>
        <div className="pt-2">
          <input
            type="range"
            min={0}
            max={200}
            step={5}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mt-2">
            <span>$0</span>
            <span>$200</span>
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3 pt-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">Rating</label>
        <div className="space-y-1.5">
          {[
            { label: "Any Rating", value: 0 },
            { label: "4.5★ & Above", value: 4.5 },
            { label: "4.0★ & Above", value: 4.0 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setMinRating(item.value)}
              className={`flex items-center space-x-3 text-sm w-full text-left py-1.5 px-2 rounded-xl transition-all ${
                minRating === item.value ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center p-0.5 transition-colors ${minRating === item.value ? "border-primary" : "border-muted-foreground/30"}`}>
                {minRating === item.value && <div className="w-2 h-2 bg-primary rounded-full animate-in zoom-in duration-200" />}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hide Fully Booked Toggle */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <div className="flex flex-col space-y-1 pr-4">
          <span className="text-xs font-bold text-foreground">Available Only</span>
          <span className="text-[10px] text-muted-foreground leading-tight">Hide fully booked sessions</span>
        </div>
        <Switch checked={hideFull} onCheckedChange={setHideFull} className="data-[state=checked]:bg-primary" />
      </div>

      {/* Reset Button */}
      <Button variant="outline" className="w-full h-11 text-xs font-bold rounded-xl border-border/60 hover:bg-muted/50 transition-all shadow-sm" onClick={handleResetFilters}>
        <RefreshCw className="mr-2 h-3.5 w-3.5" /> Clear All Filters
      </Button>
    </div>
  );

  return (
    <main className="flex-1 bg-[#fcfcfc] dark:bg-[#0a0a0a] min-h-screen pb-16">
      
      {/* 1. DARK GLOWING HERO HEADER */}
      <div className="relative w-full bg-[#0b0c01] overflow-hidden rounded-b-[2rem] shadow-xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a0f212]/20 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-[#a0f212]/10 rounded-full blur-[120px] pointer-events-none transform translate-y-1/3"></div>
        
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
            Find Your Next <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0f212] to-[#abf282]">Expert Workshop</span>
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Action Bar (Sorting & Layout) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground px-2">
            Showing <span className="text-foreground mx-1">{sortedPrograms.length}</span> results
          </div>

          <div className="flex items-center space-x-3">
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
              className="md:hidden h-11 rounded-xl bg-white border-border/40 shadow-sm font-semibold"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Master Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          
          {/* Sidebar filters (Desktop only) */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-[2rem] h-fit sticky top-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Catalog results container */}
          <section className="md:col-span-9 lg:col-span-9">
            {loading && programsList.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted/60 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : sortedPrograms.length > 0 ? (
              layout === "grid" ? (
                // PREMIUM GRID LAYOUT
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPrograms.map((prog) => (
                    <div
                      key={prog.id}
                      className="group flex flex-col bg-white border border-border/20 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                        <img
                          src={prog.imageUrl}
                          alt={prog.title}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        {/* Elegant Glassmorphic Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Premium Glass Badge */}
                        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
                          {prog.category}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={prog.instructorAvatar}
                              alt={prog.instructorName}
                              className="h-6 w-6 rounded-full object-cover ring-2 ring-background shadow-sm"
                            />
                            <span className="text-xs font-semibold text-muted-foreground">{prog.instructorName}</span>
                          </div>
                          <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{prog.rating}</span>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-[15px] text-foreground line-clamp-2 leading-snug transition-colors duration-300">
                          {prog.title}
                        </h3>

                        <div className="flex flex-wrap gap-y-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center w-1/2"><Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {prog.duration.split(" ")[0]} hrs</span>
                          <span className="flex items-center w-1/2"><MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {prog.location.split(",")[0]}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Price</span>
                            <div className="text-xl font-black text-foreground">${prog.price}</div>
                          </div>
                          <Link href={`/programs/${prog.id}`}>
                            {/* Premium Glow Button */}
                            <Button className="rounded-xl h-10 px-5 text-xs font-bold bg-[#0b0c01] text-white hover:bg-[#1a1b0a] hover:shadow-[0_0_20px_rgba(160,242,18,0.4)] hover:text-[#a0f212] transition-all duration-300">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // PREMIUM LIST LAYOUT
                <div className="space-y-4">
                  {sortedPrograms.map((prog) => (
                    <Card key={prog.id} className="overflow-hidden bg-white border border-border/20 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 group">
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="sm:w-72 aspect-[16/10] sm:aspect-auto relative overflow-hidden bg-muted/20">
                          <img
                            src={prog.imageUrl}
                            alt={prog.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide capitalize shadow-sm">
                            {prog.category}
                          </div>
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="font-extrabold text-lg text-foreground leading-tight transition-colors duration-300 max-w-lg">
                                {prog.title}
                              </h3>
                              <div className="text-2xl font-black text-foreground shrink-0">${prog.price}</div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-2xl font-medium">{prog.description}</p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-border/40">
                            <div className="flex items-center space-x-5 text-xs text-muted-foreground font-semibold">
                              <div className="flex items-center space-x-2">
                                <img src={prog.instructorAvatar} alt={prog.instructorName} className="h-6 w-6 rounded-full object-cover ring-2 ring-background shadow-sm" />
                                <span className="text-foreground">{prog.instructorName}</span>
                              </div>
                              <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5 opacity-60" /> {prog.duration}</span>
                              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5 opacity-60" /> {prog.location.split(",")[0]}</span>
                              <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded-md text-amber-700 dark:text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-amber-500 mr-1.5" /> {prog.rating} ({prog.reviewsCount})
                              </div>
                            </div>
                            <Link href={`/programs/${prog.id}`}>
                              {/* Premium Glow Button */}
                              <Button className="rounded-xl h-10 px-6 text-sm font-bold bg-[#0b0c01] text-white hover:bg-[#1a1b0a] hover:shadow-[0_0_20px_rgba(160,242,18,0.4)] hover:text-[#a0f212] transition-all duration-300">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileFiltersOpen(false)} />
          
          {/* Drawer sheet panel */}
          <div className="relative w-80 bg-background/95 backdrop-blur-xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-white/20">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <h3 className="font-extrabold text-lg text-foreground flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5" /> Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-muted-foreground hover:bg-muted/80 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <FilterSidebar />
            </div>
            
            <div className="pt-6 border-t border-border/40 mt-6 sticky bottom-0 bg-background pb-2">
              <Button className="w-full rounded-xl h-12 font-bold bg-[#0b0c01] text-white shadow-lg" onClick={() => setMobileFiltersOpen(false)}>
                Show {sortedPrograms.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
