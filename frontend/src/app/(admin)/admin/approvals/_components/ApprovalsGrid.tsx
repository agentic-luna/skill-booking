import React from "react";
import { Clock, Ticket, MapPin, Eye, X, Check, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ApprovalsGridProps {
  loading: boolean;
  filteredApprovals: any[];
  onSelectProgram: (prog: any) => void;
  onDecline: (eventId: string, e: React.MouseEvent) => void;
  onApproveTrigger: (eventId: string, e: React.MouseEvent) => void;
  getVenueDetailsString: (venue: any) => string;
}

export default function ApprovalsGrid({
  loading,
  filteredApprovals,
  onSelectProgram,
  onDecline,
  onApproveTrigger,
  getVenueDetailsString
}: ApprovalsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {loading ? (
        <div className="col-span-2 text-center p-12 bg-card border rounded-2xl">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          <span>Fetching queue listings from database...</span>
        </div>
      ) : filteredApprovals.length > 0 ? (
        filteredApprovals.map((prog) => (
          <Card key={prog.id} className="overflow-hidden border-black/5 dark:border-white/5 bg-card rounded-[32px] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity duration-500 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-foreground to-transparent z-0"></div>
            <div
              className="relative aspect-video w-full bg-muted cursor-pointer group/img z-10"
              onClick={() => onSelectProgram(prog)}
            >
              <img src={prog.posterUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"} alt={prog.title} className="object-cover w-full h-full group-hover/img:scale-[1.02] transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">
                {prog.mode}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="flex items-center space-x-2 text-xs text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                  <Eye className="h-4 w-4" />
                  <span>Quick Review</span>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-5 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary shadow-inner">
                    {prog.host?.user?.firstName?.[0] || "H"}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Host: <span className="font-bold text-foreground">{prog.host?.user?.firstName} {prog.host?.user?.lastName}</span></span>
                </div>

                <h3
                  className="font-extrabold text-lg text-foreground line-clamp-1 leading-tight hover:text-primary cursor-pointer transition-colors tracking-tight"
                  onClick={() => onSelectProgram(prog)}
                >
                  {prog.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                  {prog.description || "No class syllabus details specified by host."}
                </p>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs font-semibold text-muted-foreground border-t border-black/5 dark:border-white/5 pt-4">
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /> {new Date(prog.startTime).toLocaleDateString()}</span>
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5 truncate" /> {getVenueDetailsString(prog.venueDetails).substring(0, 15)}...</span>
                  <span className="flex items-center"><Ticket className="h-4 w-4 mr-1.5" /> Spots: {prog.totalSeats}</span>
                  <span className="flex items-center font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-md w-fit">Mode: {prog.mode}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-black/5 dark:border-white/5 mt-auto">
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold h-10 rounded-full border-black/5 dark:border-white/5 hover:bg-muted shadow-sm"
                  onClick={() => onSelectProgram(prog)}
                >
                  <Eye className="mr-2 h-4 w-4" /> Full Details & Review
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-bold h-10 rounded-full border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm transition-colors"
                    onClick={(e) => onDecline(prog.id, e)}
                  >
                    <X className="mr-2 h-4 w-4" /> Decline
                  </Button>
                  <Button 
                    className="w-full text-xs font-bold h-10 rounded-full shadow-md bg-[#0b0c01] text-white hover:bg-[#1a1c02] border-none"
                    onClick={(e) => onApproveTrigger(prog.id, e)}
                  >
                    <Check className="mr-2 h-4 w-4" /> Approve Live
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="col-span-2 text-center p-12 bg-card border rounded-2xl border-dashed border-border/60 text-muted-foreground text-xs">
          Approvals queue is empty. No pending programs need review.
        </div>
      )}
    </div>
  );
}
