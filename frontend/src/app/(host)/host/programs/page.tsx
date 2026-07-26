"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Clock, Users, Calendar, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { RepublishModal } from "./_components/RepublishModal";

export default function HostProgramsPage() {
  const { myEvents, fetchMyEvents, deleteEvent, isLoading } = useHostStore();
  const showAlert = useAlertStore(s => s.showAlert);
  const [isRepublishOpen, setIsRepublishOpen] = React.useState(false);

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
    startDate: event.startTime ? new Date(event.startTime) : new Date(),
  }));

  const StandardProgramCard = ({ prog }: { prog: any }) => (
    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col relative shadow-sm border border-black/5 hover:shadow-xl transition-all duration-300 group">
      {/* Image Header */}
      <div className="h-48 relative overflow-hidden bg-gray-100">
        <img src={prog.imageUrl} alt={prog.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-[#0b0c01] shadow-sm">
          {prog.status === 'approved' ? 'Live' : 'Pending'}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-[#0b0c01]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
          {prog.category}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h2 className="text-xl font-extrabold text-[#0b0c01] leading-tight line-clamp-2">{prog.title}</h2>
        
        <div className="mt-5 space-y-3">
          <div className="flex items-center text-sm font-semibold text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0"><Calendar className="h-4 w-4" /></div>
            {prog.startDate.toLocaleDateString()} at {prog.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center text-sm font-semibold text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0"><Clock className="h-4 w-4" /></div>
            {prog.duration}
          </div>
          <div className="flex items-center text-sm font-semibold text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0"><MapPin className="h-4 w-4" /></div>
            <span className="truncate">{prog.location}</span>
          </div>
        </div>

        {/* Seats Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-end text-xs font-bold text-[#0b0c01] mb-2">
            <span className="uppercase tracking-widest text-muted-foreground text-[10px]">Seats Available</span>
            <span>{prog.spotsLeft} / {prog.maxSpots}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#a0f212] rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, ((prog.maxSpots - prog.spotsLeft) / (prog.maxSpots || 1)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 flex justify-between items-center border-t border-black/5">
          <div className="text-2xl font-black text-[#0b0c01]">${prog.price}</div>
          <div className="flex gap-2">
            <Link href={`/host/programs/${prog.id}/edit`}>
              <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0b0c01] text-[#0b0c01] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <Edit2 className="w-4 h-4" />
              </button>
            </Link>
            <button onClick={() => handleDelete(prog.id)} className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center transition-colors shadow-sm">
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
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0c01] flex items-center gap-3">
            <div className="bg-[#a0f212] p-2 rounded-xl text-[#0b0c01] shadow-sm"><Calendar className="h-6 w-6" /></div>
            Program Management
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-2" />}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">Create, edit, and manage all your upcoming skills workshops.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Button 
            variant="outline"
            onClick={() => setIsRepublishOpen(true)}
            className="rounded-2xl h-12 px-5 text-sm font-bold bg-white text-[#0b0c01] hover:bg-gray-50 border-gray-200 shadow-sm transition-all hover:-translate-y-0.5 duration-300 w-full sm:w-auto justify-center"
          >
            <Clock className="mr-2 h-4 w-4 shrink-0" /> Republish Old Workshop
          </Button>
          <Link href="/host/programs/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto justify-center rounded-2xl h-12 px-6 text-sm font-bold bg-[#0b0c01] text-white hover:bg-black/80 shadow-lg transition-all hover:-translate-y-0.5 duration-300">
              <Plus className="mr-2 h-5 w-5 shrink-0" /> Create Workshop
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      {!isLoading && programsList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white/50 border border-black/5 rounded-[40px] shadow-sm">
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
            <Button className="rounded-2xl h-12 px-8 text-sm font-bold bg-[#0b0c01] text-white hover:bg-black/80 shadow-md">
               Create Workshop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {programsList.map((prog) => (
            <StandardProgramCard key={prog.id} prog={prog} />
          ))}
        </div>
      )}

      <RepublishModal 
        open={isRepublishOpen} 
        onOpenChange={setIsRepublishOpen} 
        events={myEvents} 
      />
    </div>
  );
}
