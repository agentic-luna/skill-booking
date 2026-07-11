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
          <Card key={prog.id} className="overflow-hidden border-border/40 bg-card rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow">
            <div
              className="relative aspect-video w-full bg-muted cursor-pointer group"
              onClick={() => onSelectProgram(prog)}
            >
              <img src={prog.posterUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"} alt={prog.title} className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                {prog.mode}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <div className="flex items-center space-x-1.5 text-xs text-white font-bold bg-black/50 px-3.5 py-2 rounded-xl backdrop-blur-xs">
                  <Eye className="h-4 w-4" />
                  <span>Quick Review</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {prog.host?.user?.firstName?.[0] || "H"}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Host: <span className="font-semibold text-foreground">{prog.host?.user?.firstName} {prog.host?.user?.lastName}</span></span>
                </div>

                <h3
                  className="font-bold text-sm text-foreground line-clamp-1 leading-tight hover:text-primary cursor-pointer transition-colors"
                  onClick={() => onSelectProgram(prog)}
                >
                  {prog.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {prog.description || "No class syllabus details specified by host."}
                </p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground border-t pt-3">
                  <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {new Date(prog.startTime).toLocaleDateString()}</span>
                  <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1 truncate" /> {getVenueDetailsString(prog.venueDetails).substring(0, 15)}...</span>
                  <span className="flex items-center"><Ticket className="h-3.5 w-3.5 mr-1" /> Spots: {prog.totalSeats}</span>
                  <span className="flex items-center font-bold text-foreground">Mode: {prog.mode}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t mt-auto">
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold h-9 rounded-xl border-border/60 hover:bg-muted"
                  onClick={() => onSelectProgram(prog)}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Full Details & Review
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-semibold h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
                    onClick={(e) => onDecline(prog.id, e)}
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Decline
                  </Button>
                  <Button 
                    className="w-full text-xs font-semibold h-9 rounded-xl shadow-xs"
                    onClick={(e) => onApproveTrigger(prog.id, e)}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve Live
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
