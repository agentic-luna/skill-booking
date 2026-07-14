"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Clock, Users, MapPin, Eye, Edit2, Trash2, Calendar, User, ArrowUpRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

export default function HostProgramsPage() {
  const { myEvents, fetchMyEvents, deleteEvent, isLoading } = useHostStore();
  const showAlert = useAlertStore(s => s.showAlert);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteEvent(id);
      if (res.success) {
        showAlert("Workshop Deleted", "The workshop has been successfully removed.", "success");
        fetchMyEvents();
      } else {
        showAlert("Deletion Failed", "Failed to delete the workshop. It may have active bookings.", "destructive");
      }
    } catch (err) {
      showAlert("Error", "An unexpected error occurred while deleting the workshop.", "destructive");
    }
  };

  const programsList = myEvents.map((event: any) => ({
    id: event.id,
    title: event.title,
    imageUrl: event.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600",
    status: event.status.toLowerCase(),
    category: event.category || event.mode,
    duration: event.duration || "N/A",
    spotsLeft: event.availableSeats,
    maxSpots: event.totalSeats,
    location: event.mode === "ONLINE" ? "Online Stream" : "Physical Venue",
    price: event.price ?? 0,
    hostName: `${event.host?.user?.firstName || "Host"} ${event.host?.user?.lastName || ""}`.trim(),
    email: event.host?.user?.email || "host@example.com",
    startDate: event.schedule?.[0]?.date ? new Date(event.schedule[0].date) : new Date(),
  }));

  // Style 1: Lime Hero Card
  const Style1HeroCard = ({ prog }: { prog: any }) => {
    const progress = Math.min(100, ((prog.maxSpots - prog.spotsLeft) / (prog.maxSpots || 1)) * 100);
    return (
      <div className="bg-[#ccff00] rounded-[40px] p-8 flex flex-col justify-between relative shadow-sm group hover:scale-[1.02] transition-transform h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
              <img src={prog.imageUrl} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0b0c01]">{prog.hostName}</div>
              <div className="text-[10px] font-semibold text-[#0b0c01]/60">Host Manager</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/programs/${prog.id}`}>
              <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors text-[#0b0c01]">
                <Eye className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-black text-[#0b0c01] leading-tight line-clamp-2">{prog.title}</h2>
          <div className="text-sm font-bold text-[#0b0c01]/60 mt-1 uppercase tracking-widest">{prog.category}</div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex justify-between items-end text-xs font-bold text-[#0b0c01]">
            <span>Booking Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#0b0c01] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
           <Link href={`/host/programs/${prog.id}/edit`} className="flex-1">
            <button className="w-full h-12 rounded-full bg-white hover:bg-white/80 text-[#0b0c01] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors">
              <Edit2 className="w-4 h-4" /> Edit Program
            </button>
          </Link>
          <button onClick={() => handleDelete(prog.id)} className="w-12 h-12 rounded-full bg-[#0b0c01] text-white hover:bg-red-500 flex items-center justify-center transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Style 2: White Schedule Card
  const Style2ScheduleCard = ({ prog }: { prog: any }) => (
    <div className="bg-white rounded-[40px] p-8 flex flex-col relative shadow-xl border border-black/5 group hover:scale-[1.02] transition-transform h-full">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-black text-[#0b0c01] leading-tight line-clamp-2 pr-4">{prog.title}</h2>
        <div className="px-4 py-2 rounded-full bg-gray-100 text-[#0b0c01] text-xs font-bold shrink-0 shadow-sm border border-black/5">
          {prog.status === 'approved' ? 'Live' : 'Pending'}
        </div>
      </div>
      
      <div className="text-xs font-semibold text-muted-foreground mt-2 flex items-center gap-1.5">
        <Calendar className="w-4 h-4" /> Upcoming Sessions
      </div>

      <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
        {[0, 1, 2].map((offset) => {
          const date = new Date(prog.startDate);
          date.setDate(date.getDate() + offset);
          return (
            <div key={offset} className={`shrink-0 w-16 py-3 rounded-full flex flex-col items-center justify-center shadow-sm border border-black/5 ${offset === 1 ? 'bg-[#ccff00] shadow-[0_4px_15px_rgba(204,255,0,0.4)] border-[#ccff00]' : 'bg-white'}`}>
              <div className="text-lg font-black text-[#0b0c01]">{date.getDate()}</div>
              <div className={`text-[10px] font-bold ${offset === 1 ? 'text-[#0b0c01]/70' : 'text-muted-foreground'}`}>
                {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-black/5 flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration & Loc</div>
          <div className="text-sm font-extrabold text-[#0b0c01]">{prog.duration} • {prog.location}</div>
        </div>
        <div className="flex gap-2">
          <Link href={`/host/programs/${prog.id}/edit`}>
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0b0c01] flex items-center justify-center transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </Link>
          <button onClick={() => handleDelete(prog.id)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-[#0b0c01] hover:text-red-500 flex items-center justify-center transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Style 3: Dark Analytics Card
  const Style3AnalyticsCard = ({ prog }: { prog: any }) => (
    <div className="bg-[#0b0c01] rounded-[40px] p-8 flex flex-col justify-between relative shadow-2xl group hover:scale-[1.02] transition-transform h-full">
      {/* Chart-like background graphic */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#ccff00]/10 to-transparent rounded-b-[40px] pointer-events-none" />
      <svg className="absolute bottom-16 left-0 w-full h-12 pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0,100 C20,100 30,20 50,50 C70,80 80,0 100,0 L100,100 Z" fill="none" stroke="#ccff00" strokeWidth="2"/>
      </svg>
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-white font-black text-xl leading-tight line-clamp-1">{prog.title}</h2>
          <p className="text-white/40 text-xs font-semibold">{prog.category}</p>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-full text-[#ccff00] text-[10px] font-bold uppercase tracking-wider shadow-sm border border-[#ccff00]/20 shrink-0">
          ${prog.price}
        </div>
      </div>

      <div className="relative z-10 mt-8 flex-1 flex flex-col justify-center">
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Available Seats</div>
        <div className="flex items-center gap-4">
          <div className="text-6xl font-black text-white tracking-tighter">
            {prog.maxSpots - prog.spotsLeft}
          </div>
          <div className="text-sm font-bold text-white/40">/ {prog.maxSpots}</div>
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex gap-2">
        <Link href={`/programs/${prog.id}`} className="flex-1">
          <button className="w-full h-12 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-colors">
            <Eye className="w-4 h-4" /> View
          </button>
        </Link>
        <Link href={`/host/programs/${prog.id}/edit`}>
          <button className="w-12 h-12 rounded-full bg-[#ccff00] text-[#0b0c01] hover:bg-white flex items-center justify-center transition-colors shadow-[0_4px_15px_rgba(204,255,0,0.3)]">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );

  // Style 4: Minimalist Gray Card
  const Style4MinimalistCard = ({ prog }: { prog: any }) => (
    <div className="bg-[#e4ebd9] rounded-[40px] p-3 flex flex-col relative shadow-md group hover:scale-[1.02] transition-transform h-full">
      <div className="w-full h-40 bg-white rounded-[32px] overflow-hidden relative shadow-sm">
        <img src={prog.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[#0b0c01] text-[10px] font-black uppercase tracking-wider shadow-sm">
          {prog.category}
        </div>
      </div>
      
      <div className="flex-1 p-5 flex flex-col">
        <h2 className="text-[#0b0c01] font-black text-xl leading-tight line-clamp-2">{prog.title}</h2>
        
        <div className="mt-4 flex items-center gap-3 text-xs font-bold text-[#0b0c01]/60">
          <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5" /> {prog.duration}
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
            <Users className="w-3.5 h-3.5" /> {prog.maxSpots} spots
          </div>
        </div>

        <div className="mt-auto pt-6 flex justify-between items-center">
          <div className="text-2xl font-black text-[#0b0c01]">${prog.price}</div>
          <div className="flex gap-2">
            <Link href={`/host/programs/${prog.id}/edit`}>
              <button className="w-10 h-10 rounded-full bg-white hover:bg-[#0b0c01] text-[#0b0c01] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <Edit2 className="w-4 h-4" />
              </button>
            </Link>
            <button onClick={() => handleDelete(prog.id)} className="w-10 h-10 rounded-full bg-white hover:bg-red-500 text-[#0b0c01] hover:text-white flex items-center justify-center transition-colors shadow-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0c01] flex items-center gap-2">
            Program Management
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground font-medium">List, check validation status, and edit details of your skill classes.</p>
        </div>
        <Link href="/host/programs/create">
          <Button className="rounded-2xl h-12 px-6 text-sm font-bold bg-[#0b0c01] text-white hover:bg-black/90 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 duration-300">
            <Plus className="mr-2 h-5 w-5" /> Create Workshop
          </Button>
        </Link>
      </div>

      {/* Dynamic Bento Grid Layout */}
      {!isLoading && programsList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center space-y-4 bg-gray-50 border border-black/5 rounded-[40px]">
          <div className="bg-white p-5 rounded-[32px] shadow-sm border border-black/5">
            <Plus className="h-8 w-8 text-[#0b0c01]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#0b0c01]">No programs yet</h3>
            <p className="text-muted-foreground max-w-sm font-medium">
              Create your first workshop to start accepting bookings from learners.
            </p>
          </div>
          <Link href="/host/programs/create" className="mt-4">
            <Button className="rounded-xl h-12 px-8 text-sm font-bold bg-[#0b0c01] text-white hover:bg-black/80">
               Create Workshop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[360px]">
          {programsList.map((prog, index) => {
            const styleType = index % 4;
            
            // Render specific card style based on modulo index
            if (styleType === 0) return <Style1HeroCard key={prog.id} prog={prog} />;
            if (styleType === 1) return <Style2ScheduleCard key={prog.id} prog={prog} />;
            if (styleType === 2) return <Style3AnalyticsCard key={prog.id} prog={prog} />;
            return <Style4MinimalistCard key={prog.id} prog={prog} />;
          })}
        </div>
      )}
    </div>
  );
}
