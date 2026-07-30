"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, Grid2X2, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClientStore } from "@/features/client/store/clientStore";
import { LOCATION_PRESETS } from "@/constants/locations";

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



export default function AdvancedSearchBar() {
  const router = useRouter();
  const { events, fetchEvents } = useClientStore();

  const [activeTab, setActiveTab] = useState<"location" | "category" | "dates" | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Form State
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  // Date Range Picker State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch real events data from API to populate dynamic dropdowns
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Dispatch search bar active state globally
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("search-active", { detail: activeTab !== null }));
    return () => {
      window.dispatchEvent(new CustomEvent("search-active", { detail: false }));
    };
  }, [activeTab]);

  // Derive dynamic locations from active events, fallback to Kerala districts presets
  const dynamicLocations = useMemo(() => {
    const locs = new Set<string>();
    events.forEach(event => {
      if (event.status !== "APPROVED") return;
      if (event.mode === "ONLINE") {
        locs.add("Online");
      } else {
        const city = event.venueDetails?.city;
        if (city) {
          locs.add(city.trim().charAt(0).toUpperCase() + city.trim().slice(1).toLowerCase());
        }
      }
    });

    const presets = LOCATION_PRESETS;
    presets.forEach(p => {
      if (!Array.from(locs).some(c => c.toLowerCase() === p.toLowerCase())) {
        locs.add(p);
      }
    });
    return Array.from(locs);
  }, [events]);

  const filteredLocations = useMemo(() => {
    return dynamicLocations.filter(loc =>
      loc.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );
  }, [dynamicLocations, locationSearchQuery]);

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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate < startDate) {
      setStartDate(clickedDate);
    } else {
      setEndDate(clickedDate);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location && location !== "Anywhere") params.append("location", location);

    // If they typed something but didn't select, use the typed query, otherwise use selected category
    const searchCat = categorySearchQuery || category;
    if (searchCat) params.append("search", searchCat);

    if (startDate) {
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate ? endDate.toISOString().split("T")[0] : startStr;
      params.append("dates", `range:${startStr}_${endStr}`);
    }

    router.push(`/programs?${params.toString()}`);
  };

  const filteredCategories = dynamicCategories.filter(cat =>
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const categoriesToDisplay = useMemo(() => {
    if (categorySearchQuery.trim() !== "") {
      return filteredCategories.slice(0, 6);
    }

    // Combine presets and dynamic categories, removing duplicates
    const list = ["Programming", "Design", "Marketing", "Business", "Music"];
    dynamicCategories.forEach(cat => {
      if (!list.some(item => item.toLowerCase() === cat.toLowerCase())) {
        list.push(cat);
      }
    });
    return list.slice(0, 6);
  }, [filteredCategories, dynamicCategories, categorySearchQuery]);

  return (
    <>
      {/* Background Blur Overlay */}
      {activeTab && (
        <div
          className="fixed inset-0 z-[110] bg-black/10 backdrop-blur-sm transition-all duration-300"
          onClick={() => setActiveTab(null)}
        />
      )}

      {/* Main Search Bar Container */}
      <div
        ref={searchRef}
        className="relative z-[120] w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 p-4 md:p-2 gap-3 md:gap-0"
      >
        {/* Location Section */}
        <div
          className={`relative flex-1 w-full px-6 py-3 cursor-pointer border border-gray-200 md:border-0 rounded-2xl md:rounded-full transition-colors hover:bg-gray-100 ${activeTab === 'location' ? 'shadow-md bg-white hover:bg-white z-10 border-gray-300' : ''}`}
          onClick={() => setActiveTab(activeTab === "location" ? null : "location")}
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800">Location</span>
              <span className={`text-[14px] font-light truncate ${location || locationSearchQuery ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {locationSearchQuery || location || "Where are you going?"}
              </span>
            </div>
          </div>

          {/* Location Dropdown */}
          {activeTab === "location" && (
            <div className="absolute top-[calc(100%+16px)] left-0 md:-left-4 w-full md:w-[320px] bg-white rounded-3xl shadow-xl border border-gray-200 p-6 z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Location Search Input */}
              <div
                className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2.5 mb-4 border border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      setLocation(locationSearchQuery);
                      setActiveTab(null);
                      handleSearch();
                    }
                  }}
                  placeholder="Search city or online..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder:text-gray-400 focus:ring-0"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <button
                  onClick={(e) => { e.stopPropagation(); setLocation(""); setLocationSearchQuery(""); setActiveTab(null); }}
                  className="bg-gray-900 hover:bg-black text-white text-xs px-4 py-1.5 rounded-full font-medium transition-colors"
                >
                  Anywhere
                </button>
              </div>
              <ul className="space-y-2 mt-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                {filteredLocations.map(loc => (
                  <li
                    key={loc}
                    onClick={(e) => { e.stopPropagation(); setLocation(loc); setLocationSearchQuery(loc); setActiveTab(null); }}
                    className="flex items-center gap-3 text-[14px] font-semibold text-gray-700 hover:text-black hover:bg-gray-50 cursor-pointer px-3 py-2 rounded-xl transition-all"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {loc}
                  </li>
                ))}
                {filteredLocations.length === 0 && (
                  <li className="text-xs text-gray-400 text-center py-4">No matching locations found</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-12 bg-gray-200" />

        {/* Overall Search Section (Formerly Category) */}
        <div
          className={`relative flex-1 w-full px-6 py-3 cursor-pointer border border-gray-200 md:border-0 rounded-2xl md:rounded-full transition-colors hover:bg-gray-100 ${activeTab === 'category' ? 'shadow-md bg-white hover:bg-white z-10 border-gray-300' : ''}`}
          onClick={() => setActiveTab(activeTab === "category" ? null : "category")}
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800">Courses</span>
              <span className={`text-[14px] font-light truncate ${category || categorySearchQuery ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {categorySearchQuery || category || "What do you want to learn?"}
              </span>
            </div>
          </div>

          {/* Search Dropdown */}
          {activeTab === "category" && (
            <div className="absolute top-[calc(100%+16px)] left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[600px] bg-white rounded-3xl shadow-xl border border-gray-200 p-6 z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
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
                  placeholder="Search for training, keywords, or categories..."
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
                {categorySearchQuery.trim() === "" ? "OR BROWSE CATEGORIES" : "MATCHING CATEGORIES & TRAINING"}
              </div>

              <div className="flex flex-col gap-4">
                <div className="w-full flex flex-wrap gap-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {categoriesToDisplay.map((cat) => {
                    const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                    return (
                      <span
                        key={`cat-${cat}`}
                        onClick={(e) => { e.stopPropagation(); setCategory(cat); setCategorySearchQuery(formattedCat); setActiveTab(null); }}
                        className="text-[13px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:border-gray-400 hover:text-black hover:bg-white hover:shadow-sm cursor-pointer px-4 py-2 rounded-full transition-all flex items-center justify-center text-center capitalize"
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
                        }}
                        className="text-[14px] text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-3 py-2 rounded-lg transition-colors flex items-center w-full line-clamp-1"
                      >
                        <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" /> <span className="truncate">{evt.title}</span>
                      </span>
                    ))}

                  {filteredCategories.length === 0 && (!events.some(evt => evt.status === "APPROVED" && (evt.title.toLowerCase().includes(categorySearchQuery.toLowerCase()) || (evt.description || "").toLowerCase().includes(categorySearchQuery.toLowerCase())))) && (
                    <span className="text-[14px] text-gray-400 w-full text-center py-4">No specific matches found. Press enter to search everywhere.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-12 bg-gray-200" />

        {/* Dates Section */}
        <div
          className={`relative flex-1 w-full px-6 py-3 cursor-pointer border border-gray-200 md:border-0 rounded-2xl md:rounded-full transition-colors hover:bg-gray-100 ${activeTab === 'dates' ? 'shadow-md bg-white hover:bg-white z-10 border-gray-300' : ''}`}
          onClick={() => setActiveTab(activeTab === "dates" ? null : "dates")}
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800">Dates</span>
              <span className={`text-[14px] font-light truncate ${startDate ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {startDate ? (
                  endDate ? (
                    `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  ) : (
                    startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  )
                ) : (
                  "When are you going?"
                )}
              </span>
            </div>
          </div>

          {/* Dates Dropdown */}
          {activeTab === "dates" && (() => {
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
            const monthName = MONTHS[currentMonth];

            const handlePrevMonth = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(prev => prev - 1);
              } else {
                setCurrentMonth(prev => prev - 1);
              }
            };

            const handleNextMonth = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(prev => prev + 1);
              } else {
                setCurrentMonth(prev => prev + 1);
              }
            };

            const calendarCells = [];
            // Offset blank cells
            for (let i = 0; i < firstDayIndex; i++) {
              calendarCells.push(<div key={`empty-${i}`} className="w-9 h-9" />);
            }
            // Real days of month
            for (let day = 1; day <= daysInMonth; day++) {
              const dateObj = new Date(currentYear, currentMonth, day);
              const isStart = startDate && dateObj.toDateString() === startDate.toDateString();
              const isEnd = endDate && dateObj.toDateString() === endDate.toDateString();
              const isSelected = isStart || isEnd;
              const isBetween = startDate && endDate && dateObj > startDate && dateObj < endDate;

              calendarCells.push(
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                  className={`w-9 h-9 text-xs font-bold rounded-full transition-all flex items-center justify-center ${isSelected
                    ? 'bg-[#a0f212] text-black shadow-md shadow-[#a0f212]/20 font-black'
                    : isBetween
                      ? 'bg-[#a0f212]/20 text-black hover:bg-[#a0f212]/30'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                >
                  {day}
                </button>
              );
            }

            return (
              <div className="absolute top-[calc(100%+16px)] right-0 md:-right-4 w-full md:w-[340px] bg-white rounded-3xl shadow-xl border border-gray-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 font-bold"
                  >
                    &larr;
                  </button>
                  <span className="text-[14px] font-bold text-gray-800">{monthName} {currentYear}</span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 font-bold"
                  >
                    &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarCells}
                </div>

                {startDate && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setStartDate(null); setEndDate(null); }}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      Clear Dates
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Search Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          className="w-full md:w-16 h-12 md:h-16 rounded-2xl md:rounded-full bg-[#a0f212] hover:bg-[#8ac90c] text-black flex items-center justify-center gap-2 transition-all md:ml-2 md:mr-1 flex-shrink-0 shadow-md focus:outline-none focus:ring-4 focus:ring-[#a0f212]/30 active:scale-95 font-bold text-sm"
        >
          <Search className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
          <span className="md:hidden">Search</span>
        </button>

      </div>
    </>
  );
}
