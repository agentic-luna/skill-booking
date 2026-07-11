import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, MapPin, PlayCircle,
  FileText, Trash2, MessageSquare, Star
} from "lucide-react";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import type { ClientBooking } from "@/features/client/api/types";

interface BookingCardProps {
  booking: ClientBooking;
  onCancel: (id: string) => void;
  onWriteReview: (booking: ClientBooking) => void;
}

export default function BookingCard({ booking, onCancel, onWriteReview }: BookingCardProps) {
  const showAlert = useAlertStore((s) => s.showAlert);

  const event = booking.event;
  if (!event) return null;

  const startTime = new Date(event.startTime);
  const formattedDate = startTime.toLocaleDateString();
  const formattedTime = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const location = event.mode === "ONLINE" ? "Online Stream Room" : (event.venueDetails as any)?.address || "Physical Venue";
  const instructorName = event.host?.user ? `${event.host.user.firstName} ${event.host.user.lastName}` : "Platform Host";

  const statusColor =
    booking.status === "CONFIRMED"
      ? "bg-primary/10 text-primary"
      : booking.status === "COMPLETED"
      ? "bg-emerald-500/10 text-emerald-600"
      : booking.status === "PENDING"
      ? "bg-amber-500/10 text-amber-500"
      : "bg-destructive/10 text-destructive";

  return (
    <Card className="overflow-hidden border-border/40 rounded-2xl shadow-xs bg-card">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 aspect-video sm:aspect-auto bg-muted relative">
          <img
            src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-base text-foreground leading-tight">
                {event.title}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${statusColor}`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" />{formattedDate}</span>
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" />{formattedTime}</span>
              <span className="flex items-center sm:col-span-2"><MapPin className="h-3.5 w-3.5 mr-1.5" />{location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-4 gap-3">
            <div className="text-xs text-muted-foreground">
              Host: <span className="font-medium text-foreground">{instructorName}</span>
              <span className="mx-2">•</span>
              Seats: <span className="font-bold text-foreground">{booking.seatCount}</span>
              <span className="mx-2">•</span>
              Paid: <span className="font-bold text-foreground">${booking.amountPaid}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-lg"
                onClick={() =>
                  showAlert(
                    "Receipt Downloaded",
                    `Invoice successfully downloaded for transaction reference: TXN_${booking.id.slice(0, 8).toUpperCase()}`,
                    "success"
                  )
                }
              >
                <FileText className="h-3.5 w-3.5 mr-1" /> Invoice
              </Button>

              {booking.status === "COMPLETED" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => onWriteReview(booking)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Leave Review
                </Button>
              )}

              {booking.status === "CONFIRMED" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-transparent"
                    onClick={() => onCancel(booking.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancel Booking
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs rounded-lg"
                    onClick={() =>
                      showAlert(
                        "Room Launching",
                        "Launching your live workshop room. Please allow your browser popup windows access.",
                        "info"
                      )
                    }
                  >
                    <PlayCircle className="h-3.5 w-3.5 mr-1" /> Launch Class
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
