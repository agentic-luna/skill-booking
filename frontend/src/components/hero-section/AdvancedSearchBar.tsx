"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, Grid2X2, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClientStore } from "@/features/client/store/clientStore";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const FALLBACK_CATEGORIES = [
  "Web Development", "Python Bootcamp", "React Masterclass",
  "UI/UX Fundamentals", "Graphic Design", "SEO Training",
  "Digital Marketing", "Data Science", "Machine Learning",
  "Financial Modeling", "Public Speaking", "Photography"
];

const FALLBACK_LOCATIONS = [
  "Kochi", "Kozhikode", "Trivandrum", "Kerala", "Online"
];

export default function AdvancedSearchBar() {
  const router = useRouter();
  const { events, fetchEvents } = useClientStore();
  
  const [activeTab, setActiveTab] = useState<"location" | "category" | "dates" | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Form State
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Fetch real events data from API to populate dynamic dropdowns
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Use fallback locations (recommended cities) for now to avoid dummy data from db
  const dynamicLocations = useMemo(() => {
    return FALLBACK_LOCATIONS;
  }, []);

  // Derive dynamic categories from active events
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    events.forEach(event => {
      if (event.status !== "APPROVED") return;
      if (event.category) {
        cats.add(event.category);
      }
    });
    const result = Array.from(cats);
    return result.length > 0 ? result : FALLBACK_CATEGORIES;
  }, [events]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const toggleDate = (month: string) => {
    setSelectedDates(prev => 
      prev.includes(month) ? prev.filter(d => d !== month) : [...prev, month]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location && location !== "Anywhere") params.append("location", location);
    
    // If they typed something but didn't select, use the typed query, otherwise use selected category
    const searchCat = categorySearchQuery || category;
    if (searchCat) params.append("search", searchCat);
    
    if (selectedDates.length > 0) params.append("dates", selectedDates.join(","));
    
    router.push(`/programs?${params.toString()}`);
  };

  const filteredCategories = dynamicCategories.filter(cat => 
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  return (
    <>
      {/* Background Blur Overlay */}
      {activeTab && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm transition-all duration-300"
          onClick={() => setActiveTab(null)}
        />
      )}

      {/* Main Search Bar Container */}
      <div 
        ref={searchRef}
        className="relative z-50 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 md:p-2"
      >
        {/* Location Section */}
        <div 
          className={`relative flex-1 w-full px-6 py-3 cursor-pointer rounded-full transition-colors hover:bg-gray-100 ${activeTab === 'location' ? 'shadow-md bg-white hover:bg-white z-10' : ''}`}
          onClick={() => setActiveTab(activeTab === "location" ? null : "location")}
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800">Location</span>
              <span className={`text-[14px] font-light truncate ${location ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {location || "Where are you going?"}
              </span>
            </div>
          </div>
          
          {/* Location Dropdown */}
          {activeTab === "location" && (
            <div className="absolute top-[calc(100%+16px)] left-0 md:-left-4 w-full md:w-[320px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mb-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setLocation(""); setActiveTab(null); }}
                  className="bg-gray-900 hover:bg-black text-white text-sm px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Anywhere
                </button>
              </div>
              <ul className="space-y-4 mt-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                {dynamicLocations.map(loc => (
                  <li 
                    key={loc}
                    onClick={(e) => { e.stopPropagation(); setLocation(loc); setActiveTab(null); }}
                    className="flex items-center gap-3 text-[15px] font-semibold text-gray-700 hover:text-black hover:bg-gray-50 cursor-pointer px-4 py-2.5 rounded-xl transition-all"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {loc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-12 bg-gray-200" />

        {/* Overall Search Section (Formerly Category) */}
        <div 
          className={`relative flex-1 w-full px-6 py-3 cursor-pointer rounded-full transition-colors hover:bg-gray-100 ${activeTab === 'category' ? 'shadow-md bg-white hover:bg-white z-10' : ''}`}
          onClick={() => setActiveTab(activeTab === "category" ? null : "category")}
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800">Search</span>
              <span className={`text-[14px] font-light truncate ${category || categorySearchQuery ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {categorySearchQuery || category || "What do you want to learn?"}
              </span>
            </div>
          </div>

          {/* Search Dropdown */}
          {activeTab === "category" && (
            <div className="absolute top-[calc(100%+16px)] left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[600px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div 
                className="flex items-center gap-3 bg-gray-50 rounded-full px-5 py-3 mb-6 border border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  value={categorySearchQuery}
                  onChange={(e) => {
                    setCategorySearchQuery(e.target.value);
                    setCategory(""); // Clear selected category when typing
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      setActiveTab(null);
                      handleSearch();
                    }
                  }}
                  placeholder="Search for skills, keywords, or categories..."
                  className="bg-transparent border-none outline-none text-[15px] w-full text-gray-800 placeholder:text-gray-400 focus:ring-0"
                  autoFocus
                />
              </div>

              {categorySearchQuery.trim() !== "" && (
                <div 
                  className="mb-4 text-center cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-xl transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(null);
                    handleSearch();
                  }}
                >
                  Search all courses for "{categorySearchQuery}"
                </div>
              )}

              <div className="text-center text-[11px] font-bold text-gray-400 mb-5 tracking-wider uppercase">
                {categorySearchQuery.trim() === "" ? "OR BROWSE CATEGORIES" : "MATCHING CATEGORIES & SKILLS"}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {categorySearchQuery.trim() === "" && (
                  <div className="w-full md:w-1/3 flex flex-col gap-2 border-r border-gray-100 pr-4">
                    {["Programming", "Design", "Marketing", "Business", "Music"].map(cat => (
                      <span 
                        key={cat}
                        onClick={(e) => { e.stopPropagation(); setCategory(cat); setCategorySearchQuery(""); setActiveTab(null); }}
                        className="text-[14px] font-bold text-gray-700 cursor-pointer hover:text-black hover:bg-gray-50 px-3 py-2 rounded-xl transition-all"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={`w-full ${categorySearchQuery.trim() === "" ? 'md:w-2/3' : 'w-full'} flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar`}>
                  {filteredCategories.length > 0 && filteredCategories.map((cat) => {
                    const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                    return (
                      <span 
                        key={`cat-${cat}`} 
                        onClick={(e) => { e.stopPropagation(); setCategory(cat); setCategorySearchQuery(""); setActiveTab(null); }}
                        className="text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-400 hover:text-black hover:bg-gray-50 hover:shadow-sm cursor-pointer px-4 py-2.5 rounded-xl transition-all flex items-center justify-center text-center capitalize"
                      >
                        {formattedCat}
                      </span>
                    );
                  })}
                  
                  {categorySearchQuery.trim() !== "" && events
                    .filter(evt => evt.status === "APPROVED" && (
                      evt.title.toLowerCase().includes(categorySearchQuery.toLowerCase()) || 
                      (evt.description || "").toLowerCase().includes(categorySearchQuery.toLowerCase())
                    ))
                    .slice(0, 6)
                    .map(evt => (
                      <span 
                        key={`evt-${evt.id}`} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setCategorySearchQuery(evt.title); 
                          setActiveTab(null); 
                          // Optionally, directly navigate to the search with this title
                        }}
                        className="text-[14px] text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-3 py-2 rounded-lg transition-colors flex items-center col-span-1 sm:col-span-2 line-clamp-1"
                      >
                        <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" /> <span className="truncate">{evt.title}</span>
                      </span>
                    ))}

                  {filteredCategories.length === 0 && (!events.some(evt => evt.status === "APPROVED" && (evt.title.toLowerCase().includes(categorySearchQuery.toLowerCase()) || (evt.description || "").toLowerCase().includes(categorySearchQuery.toLowerCase())))) && (
                    <span className="text-[14px] text-gray-400 col-span-2 text-center py-4">No specific matches found. Press enter to search everywhere.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-12 bg-gray-200" />

        {/* Dates Section */}
        <div 
          className={`relative flex-1 w-full px-6 py-3 cursor-pointer rounded-full transition-colors hover:bg-gray-100 ${activeTab === 'dates' ? 'shadow-md bg-white hover:bg-white z-10' : ''}`}
          onClick={() => setActiveTab(activeTab === "dates" ? null : "dates")}
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800">Dates</span>
              <span className={`text-[14px] font-light truncate ${selectedDates.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {selectedDates.length > 0 ? selectedDates.join(", ") : "When are you going?"}
              </span>
            </div>
          </div>

          {/* Dates Dropdown */}
          {activeTab === "dates" && (
            <div className="absolute top-[calc(100%+16px)] right-0 md:-right-4 w-full md:w-[420px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[15px] font-bold text-gray-800 ml-4">2026</span>
                {selectedDates.length > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDates([]); }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mr-2"
                  >
                    Clear dates
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {MONTHS.map((month) => {
                  const isActive = selectedDates.includes(month);
                  return (
                    <button 
                      key={month} 
                      onClick={(e) => { e.stopPropagation(); toggleDate(month); }}
                      className={`text-[13px] py-3 px-2 rounded-xl font-bold transition-all ${
                        isActive 
                          ? 'bg-gray-900 text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-gray-900' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#a0f212] hover:bg-[#8ac90c] text-black flex items-center justify-center transition-all ml-2 mr-1 flex-shrink-0 shadow-md focus:outline-none focus:ring-4 focus:ring-[#a0f212]/30 active:scale-95"
        >
          <Search className="w-6 h-6 stroke-[2.5]" />
        </button>

      </div>
    </>
  );
}
