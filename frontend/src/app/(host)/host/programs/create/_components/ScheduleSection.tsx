"use client";

import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Calendar, Clock, MapPin, Video, MapPinned, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProgramFormValues } from "./program-schema";

interface ScheduleSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  setValue: UseFormSetValue<ProgramFormValues>;
  watch: UseFormWatch<ProgramFormValues>;
}

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", 
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", 
  "Thiruvananthapuram", "Thrissur", "Wayanad"
];

export default function ScheduleSection({ register, errors, setValue, watch }: ScheduleSectionProps) {
  const selectedMode = watch("mode");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "LOCATION_SELECTED") {
        const fullAddress = event.data.address;
        setSelectedAddress(fullAddress);

        // Scan for matching district in Kerala
        const matched = KERALA_DISTRICTS.find(d => 
          fullAddress.toLowerCase().includes(d.toLowerCase())
        );
        
        if (matched) {
          setSelectedDistrict(matched);
        } else {
          // If no direct district found, check popular city aliases
          const lowerAddr = fullAddress.toLowerCase();
          if (lowerAddr.includes("kochi")) {
            setSelectedDistrict("Ernakulam");
          } else if (lowerAddr.includes("trivandrum")) {
            setSelectedDistrict("Thiruvananthapuram");
          } else if (lowerAddr.includes("calicut")) {
            setSelectedDistrict("Kozhikode");
          } else {
            setSelectedDistrict("");
          }
        }
      }
    };
    window.addEventListener("message", handleMapMessage);
    return () => window.removeEventListener("message", handleMapMessage);
  }, []);

  const handleConfirmLocation = () => {
    if (selectedAddress) {
      setValue("location", selectedAddress, { shouldValidate: true });
    }
    if (selectedDistrict) {
      setValue("district", selectedDistrict, { shouldValidate: true });
    }
    setIsMapOpen(false);
  };

  return (
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex items-center space-x-3.5">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Schedule & Logistics</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Mode, date, time, duration, and venue details.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-7">

        {/* ── Delivery Mode & Location Address ───────────────────────── */}
        <div className="space-y-5 bg-gray-50/50 p-6 rounded-[20px] border border-gray-200/50">
          <div className="space-y-2.5">
            <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Video className="h-4 w-4 text-gray-400" />
              <span>Delivery Mode</span>
            </Label>
            <div className="flex gap-3">
              {(["OFFLINE", "ONLINE"] as const).map((m) => {
                const active = selectedMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue("mode", m, { shouldValidate: true })}
                    className={`
                      flex items-center gap-2 flex-1 py-3 px-5 rounded-xl border text-[13px] font-bold
                      transition-all duration-300 select-none
                      ${active
                        ? "bg-emerald-50/50 border-emerald-300 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-transparent border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      active 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-gray-100 text-gray-400 group-hover:text-gray-600"
                    }`}>
                      {m === "ONLINE" ? <Video className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    </div>
                    <span>{m === "ONLINE" ? "Online / Virtual" : "In-Person / Offline"}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Hidden input to integrate with react-hook-form */}
            <input type="hidden" {...register("mode")} />
            {errors.mode && <p className="text-[11px] text-destructive font-medium">{errors.mode.message}</p>}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="location" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{selectedMode === "ONLINE" ? "Webinar / Stream Link" : "Venue Address / Map Location"}</span>
            </Label>
            <div className="relative flex flex-col sm:flex-row gap-2.5 items-stretch">
              <Input
                id="location"
                placeholder={selectedMode === "ONLINE" ? "https://zoom.us/j/..." : "123 Workshop St, City or Google Maps link"}
                className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5 flex-1"
                {...register("location")}
              />
              {selectedMode === "OFFLINE" && (
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="h-11 px-4 text-xs font-extrabold bg-[#a0f212] hover:bg-[#8ac90c] text-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                >
                  <MapPinned className="h-4 w-4" />
                  <span>Choose on Map</span>
                </button>
              )}
            </div>
            {errors.location && <p className="text-[12px] text-red-500 font-semibold">{errors.location.message}</p>}
          </div>

          <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
            <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 border-none z-[150] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-emerald-600" />
                  <span>Choose Location on Map</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-xs text-gray-500 font-medium">Click anywhere on the map to drop a pin. The address will be fetched automatically.</p>
                
                <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-gray-200">
                  <iframe
                    title="Location Map"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                        <style>
                          body { margin: 0; padding: 0; font-family: sans-serif; position: relative; }
                          #map { height: 100vh; width: 100vw; z-index: 1; }
                          .search-box-container {
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            z-index: 999;
                            display: flex;
                            gap: 6px;
                            background: white;
                            padding: 6px;
                            border-radius: 12px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            width: 280px;
                            border: 1px solid #e5e7eb;
                          }
                          .search-input {
                            flex: 1;
                            border: none;
                            outline: none;
                            font-size: 13px;
                            padding: 6px 8px;
                            border-radius: 8px;
                            background: #f9fafb;
                          }
                          .search-button {
                            background: #a0f212;
                            border: none;
                            outline: none;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 11px;
                            padding: 6px 12px;
                            border-radius: 8px;
                            transition: all 0.2s;
                          }
                          .search-button:hover {
                            background: #8ac90c;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="search-box-container">
                          <input type="text" id="search-input" class="search-input" placeholder="Search location or address..." />
                          <button type="button" id="search-button" class="search-button">Search</button>
                        </div>
                        
                        <div id="map"></div>
                        
                        <script>
                          var map = L.map('map').setView([10.0159, 76.3419], 12); // Ernakulam/Kochi default
                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                          }).addTo(map);

                          var marker;

                          function selectLocation(lat, lng, address) {
                            if (marker) {
                              marker.setLatLng([lat, lng]);
                            } else {
                              marker = L.marker([lat, lng]).addTo(map);
                            }
                            map.setView([lat, lng], 15);
                            window.parent.postMessage({ type: 'LOCATION_SELECTED', address: address }, '*');
                          }

                          map.on('click', function(e) {
                            var lat = e.latlng.lat;
                            var lng = e.latlng.lng;
                            
                            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
                              .then(response => response.json())
                              .then(data => {
                                var address = data.display_name || (lat.toFixed(5) + ', ' + lng.toFixed(5));
                                selectLocation(lat, lng, address);
                              })
                              .catch(() => {
                                selectLocation(lat, lng, lat.toFixed(5) + ', ' + lng.toFixed(5));
                              });
                          });

                          // Search function
                          function doSearch() {
                            var query = document.getElementById('search-input').value;
                            if (!query.trim()) return;
                            
                            fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query))
                              .then(response => response.json())
                              .then(results => {
                                if (results && results.length > 0) {
                                  var res = results[0];
                                  var lat = parseFloat(res.lat);
                                  var lng = parseFloat(res.lon);
                                  var address = res.display_name;
                                  selectLocation(lat, lng, address);
                                } else {
                                  alert('Location not found');
                                }
                              })
                              .catch(() => {
                                alert('Error searching for location');
                              });
                          }

                          document.getElementById('search-button').addEventListener('click', doSearch);
                          document.getElementById('search-input').addEventListener('keydown', function(e) {
                            if (e.key === 'Enter') {
                              doSearch();
                            }
                          });
                        </script>
                      </body>
                      </html>
                    `}
                    className="w-full h-full border-none"
                  />
                </div>

                {selectedAddress && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Detected Address</span>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">{selectedAddress}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLocation}
                    disabled={!selectedAddress}
                    className="px-6 py-2.5 text-xs font-bold bg-[#a0f212] hover:bg-[#8ac90c] text-black disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Confirm Location
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {selectedMode === "OFFLINE" && (
            <div className="space-y-2.5">
              <Label htmlFor="district" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>District / City</span>
              </Label>
              <div className="relative">
                <select
                  id="district"
                  className="w-full h-11 pl-4 pr-10 text-[14px] bg-emerald-50/30 border border-emerald-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm appearance-none bg-no-repeat bg-[right_16px_center] bg-[length:16px_16px] text-gray-800 font-semibold cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`
                  }}
                  defaultValue=""
                  {...register("district")}
                >
                  <option value="" disabled className="text-gray-400 font-medium">Select a District</option>
                  {KERALA_DISTRICTS.map(d => (
                    <option key={d} value={d} className="text-gray-800 font-semibold">{d}</option>
                  ))}
                </select>
              </div>
              {errors.district && <p className="text-[12px] text-red-500 font-semibold">{errors.district.message}</p>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Date */}
          <div className="space-y-2.5">
            <Label htmlFor="date" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Event Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("date")}
            />
            {errors.date && <p className="text-[12px] text-red-500 font-semibold">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div className="space-y-2.5">
            <Label htmlFor="time" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Start Time</span>
            </Label>
            <Input
              id="time"
              type="time"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("time")}
            />
            {errors.time && <p className="text-[12px] text-red-500 font-semibold">{errors.time.message}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2.5">
            <Label htmlFor="duration" className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Duration</span>
            </Label>
            <Input
              id="duration"
              placeholder="e.g. 3 hours or 2 days"
              className="h-11 text-[14px] bg-emerald-50/30 border-emerald-100 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 hover:border-emerald-300 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-900/5"
              {...register("duration")}
            />
            {errors.duration && <p className="text-[12px] text-red-500 font-semibold">{errors.duration.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
