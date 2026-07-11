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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Heart } from "lucide-react";

export default function ProgramsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { isAuthenticated } = useAuthStore();

  const {
    events,
    wishlist,
    fetchEvents,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    loading
  } = useClientStore();

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

  useEffect(() => {
    fetchEvents();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [fetchEvents, fetchWishlist, isAuthenticated]);

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

  // Title keyword matching helper
  const getCategoryFromTitle = (title: string): string => {
    const t = (title || "").toLowerCase();
    if (t.includes("react") || t.includes("next") || t.includes("python") || t.includes("code") || t.includes("web") || t.includes("javascript") || t.includes("tech") || t.includes("develop") || t.includes("program")) return "technology";
    if (t.includes("design") || t.includes("ux") || t.includes("ui") || t.includes("figma") || t.includes("art") || t.includes("sketch")) return "design";
    if (t.includes("business") || t.includes("market") || t.includes("finance") || t.includes("sales") || t.includes("startup")) return "business";
    if (t.includes("cook") || t.includes("bake") || t.includes("chef") || t.includes("food") || t.includes("culinary")) return "culinary";
    if (t.includes("fitness") || t.includes("yoga") || t.includes("workout") || t.includes("gym") || t.includes("wellness")) return "fitness";
    if (t.includes("photo") || t.includes("camera") || t.includes("video") || t.includes("lens")) return "photography";
    return "other";
  };

  const handleWishlistToggle = async (eventId: string) => {
    if (!isAuthenticated) {
      showAlert("Authentication Required", "Please log in to add workshops to your wishlist.", "warning");
      router.push("/login");
      return;
    }
    const isSaved = wishlist.some((w) => w.eventId === eventId);
    try {
      if (isSaved) {
        await removeFromWishlist(eventId);
        showAlert("Removed from Wishlist", "Workshop successfully removed.", "success");
      } else {
        await addToWishlist(eventId);
        showAlert("Added to Wishlist", "Workshop saved to your wishlist feed.", "success");
      }
    } catch (err: any) {
      showAlert("Wishlist Sync Error", err.message || "Failed to modify wishlist.", "destructive");
    }
  };

  // Filtering calculations
  const filteredPrograms = events.filter((prog) => {
    if (prog.status !== "APPROVED") return false;
    
    // Search check
    const matchesSearch = 
      prog.title.toLowerCase().includes(search.toLowerCase()) ||
      (prog.description || "").toLowerCase().includes(search.toLowerCase());
    
    // Category check
    const progCategory = getCategoryFromTitle(prog.title);
    const matchesCategory = category === "all" || progCategory === category;
    
    // Price check
    const price = Number(prog.venueDetails?.price || 0);
    const matchesPrice = price <= maxPrice;
    
    // Rating check (default 4.8 since reviews are fetched inside event details)
    const rating = 4.8;
    const matchesRating = rating >= minRating;
    
    // Availability check
    const matchesAvailability = !hideFull || (prog.availableSeats ?? 0) > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAvailability;
  });

  // Sorting calculations
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    const priceA = Number(a.venueDetails?.price || 0);
    const priceB = Number(b.venueDetails?.price || 0);
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    // default/rating
    return 0;
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
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            className="pl-9 h-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Select checkboxes */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</label>
        <div className="space-y-2 pt-1">
          {categoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                router.push(`/programs?category=${cat.value}`);
              }}
              className={`flex items-center w-full justify-between text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors ${
                category === cat.value
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span>{cat.name}</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Ticket Price</label>
          <span className="font-bold text-foreground">${maxPrice}</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>$0</span>
          <span>$200</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
        <div className="space-y-2 pt-1">
          {[
            { label: "Any Rating", value: 0 },
            { label: "4.5★ & Above", value: 4.5 },
            { label: "4.0★ & Above", value: 4.0 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setMinRating(item.value)}
              className={`flex items-center space-x-2 text-sm w-full text-left py-1 px-1.5 rounded-md ${
                minRating === item.value ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border border-primary flex items-center justify-center p-0.5`}>
                {minRating === item.value && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hide Fully Booked Toggle */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex flex-col space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Show Available Spots Only</span>
          <span className="text-[10px] text-muted-foreground">Hide sessions that are fully booked</span>
        </div>
        <Switch checked={hideFull} onCheckedChange={setHideFull} />
      </div>

      {/* Reset Button */}
      <Button variant="outline" className="w-full text-xs font-semibold" onClick={handleResetFilters}>
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Clear All Filters
      </Button>
    </div>
  );

  return (
    <main className="flex-1 py-8 bg-muted/10 dark:bg-card/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs & Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Marketplace</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Explore Skill Events</h1>
            <p className="text-sm text-muted-foreground">Browse and reserve seats for local and virtual coaching sessions.</p>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Grid vs List layout togglers */}
            <div className="border rounded-xl bg-card p-1 hidden sm:flex items-center space-x-1">
              <Button
                variant={layout === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setLayout("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setLayout("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sorting Menu Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-10 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filters Trigger */}
            <Button
              variant="outline"
              className="md:hidden h-10 rounded-xl"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Master Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
          
          {/* Sidebar filters (Desktop only) */}
          <aside className="hidden md:block col-span-1 bg-card border border-border/40 p-6 rounded-2xl h-fit sticky top-24 shadow-sm">
            <FilterSidebar />
          </aside>

          {/* Catalog results container */}
          <section className="md:col-span-3">
            {sortedPrograms.length > 0 ? (
              layout === "grid" ? (
                // GRID LAYOUT
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPrograms.map((prog) => {
                    const isWishlisted = wishlist.some((w) => w.eventId === prog.id);
                    const instructorName = prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host";
                    const price = Number(prog.venueDetails?.price || 0);
                    const formattedDate = new Date(prog.startTime).toLocaleDateString();
                    const category = getCategoryFromTitle(prog.title);

                    return (
                      <div
                        key={prog.id}
                        className="group flex flex-col border border-border/40 bg-card rounded-2xl overflow-hidden hover:border-primary/20 animate-hover relative"
                      >
                        <button
                          onClick={() => handleWishlistToggle(prog.id)}
                          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                        >
                          <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        <div className="relative aspect-video w-full bg-muted">
                          <img
                            src={prog.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                            alt={prog.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                            {category}
                          </div>
                        </div>

                        <div className="flex flex-col flex-1 p-5 space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                              {instructorName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{instructorName}</span>
                          </div>

                          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {prog.title}
                          </h3>

                          <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {formattedDate}</span>
                            <span>•</span>
                            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {prog.mode}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-foreground">4.8</span>
                            <span className="text-[10px] text-muted-foreground">({prog.availableSeats} spots left)</span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                            <div>
                              <span className="text-[10px] text-muted-foreground">Price</span>
                              <div className="text-base font-extrabold text-foreground">${price}</div>
                            </div>
                            <Link href={`/programs/${prog.id}`}>
                              <Button size="sm" className="rounded-lg h-8 text-xs">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // LIST LAYOUT
                <div className="space-y-4">
                  {sortedPrograms.map((prog) => {
                    const isWishlisted = wishlist.some((w) => w.eventId === prog.id);
                    const instructorName = prog.host?.user ? `${prog.host.user.firstName} ${prog.host.user.lastName}` : "Platform Host";
                    const price = Number(prog.venueDetails?.price || 0);
                    const formattedDate = new Date(prog.startTime).toLocaleDateString();
                    const category = getCategoryFromTitle(prog.title);

                    return (
                      <Card key={prog.id} className="overflow-hidden border-border/40 rounded-2xl group relative">
                        <button
                          onClick={() => handleWishlistToggle(prog.id)}
                          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                        >
                          <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-60 aspect-video sm:aspect-auto bg-muted relative">
                            <img
                              src={prog.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                              alt={prog.title}
                              className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                              {category}
                            </div>
                          </div>
                          <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                                  {prog.title}
                                </h3>
                                <div className="text-lg font-extrabold text-foreground shrink-0">${price}</div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{prog.description || "Learn specialized skills with real-world industry leaders."}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-auto border-t border-border/30">
                              <div className="flex items-center space-x-4 text-[10px] text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[7px] font-bold text-primary mr-1">
                                    {instructorName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span>{instructorName}</span>
                                </div>
                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {formattedDate}</span>
                                <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {prog.mode}</span>
                                <span className="flex items-center"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" /> 4.8 ({prog.availableSeats} left)</span>
                              </div>
                              <Link href={`/programs/${prog.id}`}>
                                <Button size="sm" className="rounded-lg h-8 text-xs">Book Seat</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )
            ) : (
              // EMPTY STATE COMPONENT
              <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border/40 rounded-2xl shadow-xs space-y-4">
                <div className="p-4 bg-muted/60 dark:bg-muted/30 rounded-full text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-lg font-bold text-foreground">No matches found</h3>
                  <p className="text-xs text-muted-foreground">We couldn&apos;t find any events that fit your selected criteria. Try adjusting your search query, price ranges, or rating parameters.</p>
                </div>
                <Button variant="outline" className="rounded-xl text-xs h-9" onClick={handleResetFilters}>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileFiltersOpen(false)} />
          
          {/* Drawer sheet panel */}
          <div className="relative w-80 bg-background h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-bold text-base text-foreground flex items-center"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-muted-foreground hover:bg-muted rounded-md"><X className="h-5 w-5" /></button>
              </div>
              <FilterSidebar />
            </div>
            
            <div className="pt-6 border-t mt-6">
              <Button className="w-full rounded-xl" onClick={() => setMobileFiltersOpen(false)}>
                Show {sortedPrograms.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
