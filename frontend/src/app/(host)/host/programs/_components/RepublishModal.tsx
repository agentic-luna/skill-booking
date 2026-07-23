import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface RepublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: any[];
}

export function RepublishModal({ open, onOpenChange, events }: RepublishModalProps) {
  const router = useRouter();

  const handleSelect = (id: string) => {
    onOpenChange(false);
    router.push(`/host/programs/create?templateId=${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-[24px]">
        <div className="p-6 pb-4 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#0b0c01]">Republish Old Workshop</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Select a previous workshop to use as a template. All details will be copied over.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-3 bg-gray-50/50">
          {events.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-medium text-sm">
              No previous workshops found.
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id}
                onClick={() => handleSelect(event.id)}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-[#a0f212] hover:ring-1 hover:ring-[#a0f212] cursor-pointer transition-all group"
              >
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={event.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600"} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-[#0b0c01] text-[15px] truncate">{event.title}</h4>
                  <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{event.startTime ? new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.duration || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{event.mode === "ONLINE" ? "Online" : "In-Person"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
