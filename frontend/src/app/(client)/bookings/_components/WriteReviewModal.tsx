import React, { useState } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useClientStore } from "@/features/client/store/clientStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";

interface WriteReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSuccess: () => void;
}

export default function WriteReviewModal({
  isOpen,
  onOpenChange,
  booking,
  onSuccess
}: WriteReviewModalProps) {
  const showAlert = useAlertStore((s) => s.showAlert);
  const { submitReview } = useClientStore();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setSubmitting(true);
    try {
      await submitReview({
        eventId: booking.eventId,
        bookingId: booking.id,
        rating,
        comment: comment.trim() || undefined
      });
      showAlert("Review Submitted", "Thank you for sharing your experience!", "success");
      onSuccess();
      onOpenChange(false);
      setComment("");
      setRating(5);
    } catch (err: any) {
      showAlert("Review Error", err.message || "Failed to submit review.", "destructive");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
            <MessageSquare className="h-5 w-5 text-primary" /> Leave a Workshop Review
          </DialogTitle>
          <DialogDescription className="text-xs">
            Share feedback on your learning experience for: <span className="font-bold text-foreground">{booking?.event?.title}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Star selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">Select Rating</Label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 active:scale-90 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-muted hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment text input */}
          <div className="space-y-1">
            <Label htmlFor="comment" className="text-xs font-bold text-muted-foreground">Comment (Optional)</Label>
            <textarea
              id="comment"
              placeholder="What did you learn? How was the instructor..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              type="button"
              className="text-xs h-9 rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
