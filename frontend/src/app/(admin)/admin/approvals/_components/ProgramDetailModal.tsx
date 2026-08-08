import React from "react";
import { Calendar, Clock, Ticket, MapPin, X, Check, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProgramDetailModalProps {
  selectedProgram: any;
  onClose: () => void;
  onDecline: (eventId: string, e: React.MouseEvent) => void;
  onApprove: (eventId: string, e: React.MouseEvent) => void;
  getVenueDetailsString: (venue: any) => string;
}

export default function ProgramDetailModal({
  selectedProgram,
  onClose,
  onDecline,
  onApprove,
  getVenueDetailsString
}: ProgramDetailModalProps) {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  if (!selectedProgram) return null;

  return (
    <Dialog open={selectedProgram !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
              {selectedProgram.mode}
            </span>
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 uppercase tracking-wider">
              {selectedProgram.status}
            </span>
          </div>
          <DialogTitle className="text-base font-extrabold leading-snug pt-1">
            {selectedProgram.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Detailed metadata review of requested workshop listing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Program Banner */}
          <div className="aspect-video w-full rounded-xl overflow-hidden border bg-muted relative">
            <img src={selectedProgram.posterUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600"} alt={selectedProgram.title} className="object-cover w-full h-full" />
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border bg-muted/20 p-4 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <Calendar className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <div className="text-[9px] font-semibold text-muted-foreground uppercase">Schedule Date</div>
                <div className="font-bold text-foreground">{new Date(selectedProgram.startTime).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <div className="text-[9px] font-semibold text-muted-foreground uppercase">Class Start Time</div>
                <div className="font-bold text-foreground">{new Date(selectedProgram.startTime).toLocaleTimeString()}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Ticket className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <div className="text-[9px] font-semibold text-muted-foreground uppercase">Enrollment Cap</div>
                <div className="font-bold text-foreground">{selectedProgram.totalSeats} Seats Available</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 sm:col-span-2 border-t pt-2 mt-1">
              <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <div className="text-[9px] font-semibold text-muted-foreground uppercase">Workshop Venue Details</div>
                <div className="font-bold text-foreground">{getVenueDetailsString(selectedProgram.venueDetails)}</div>
              </div>
            </div>
          </div>

          {/* Host Card */}
          <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-xl border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-extrabold text-primary shrink-0 border">
              {selectedProgram.host?.user?.firstName?.[0] || "H"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase">Host Profile</div>
              <h4 className="text-xs font-extrabold text-foreground">{selectedProgram.host?.user?.firstName} {selectedProgram.host?.user?.lastName}</h4>
              <div className="text-[10px] text-muted-foreground">{selectedProgram.host?.user?.phone || "No phone linked"}</div>
            </div>
          </div>

          {/* Trainer details */}
          {selectedProgram.trainerName && (
            <div className="space-y-1 bg-muted/20 border p-3.5 rounded-xl">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase">Trainer Profile: {selectedProgram.trainerName}</div>
              <div className="text-xs leading-relaxed text-foreground/80">{selectedProgram.trainerBio || selectedProgram.trainerInfo || "No details provided."}</div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Syllabus & Course Description</div>
            <div className="text-xs text-foreground leading-relaxed bg-card border rounded-xl p-4 max-h-[150px] overflow-y-auto custom-scrollbar">
              {selectedProgram.description || "No class syllabus details specified by host."}
            </div>
          </div>

          {/* Questionnaire / FAQ Review */}
          {(() => {
            const questionnaire = selectedProgram.questionnaire;
            const faqItems = questionnaire ? [
              { q: "What Is This Program?", a: questionnaire.whatIsThisProgram },
              { q: "Who Is This Training/Course For?", a: questionnaire.whoIsThisFor },
              { q: "What Will You Learn?", a: questionnaire.whatWillYouLearn },
              { q: "What topics we will be teaching?", a: questionnaire.whatTopics },
              { q: "Medium of Language", a: questionnaire.mediumOfLanguage },
              { q: "Prerequisites", a: questionnaire.prerequisites },
              { q: "Takeaways", a: questionnaire.takeaways },
              { q: "What tools you will be given?", a: questionnaire.toolsGiven },
            ].filter(item => item.a && item.a.trim() !== "") : [];

            if (faqItems.length === 0) return null;

            return (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Program Questionnaire (FAQ)</div>
                <div className="space-y-2">
                  {faqItems.map((item, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="border rounded-xl bg-card overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left font-bold text-xs hover:bg-muted/50 transition-colors"
                        >
                          <span>{item.q}</span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        <DialogFooter className="border-t pt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            type="button"
            className="text-xs h-9 rounded-xl"
            onClick={onClose}
          >
            Close View
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-xs font-semibold h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
              onClick={(e) => onDecline(selectedProgram.id, e)}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Decline Listing
            </Button>
            <Button 
              className="text-xs font-semibold h-9 rounded-xl shadow-xs"
              onClick={(e) => onApprove(selectedProgram.id, e)}
            >
              <Check className="mr-1 h-3.5 w-3.5" /> Approve Listing
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
