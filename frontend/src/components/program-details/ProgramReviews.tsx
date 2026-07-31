import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RatingBreakdown from "./RatingBreakdown";

interface ReviewClient {
  firstName?: string;
  lastName?: string;
}

interface Review {
  id: string;
  client?: ReviewClient;
  createdAt: string | Date;
  rating: number;
  comment?: string;
}

interface ProgramReviewsProps {
  reviews: Review[] | null;
  reviewsTotalCount: number;
  reviewsPage: number;
  setReviewsPage: React.Dispatch<React.SetStateAction<number>>;
  reviewsStats: {
    averageRating: number;
    totalReviews: number;
    breakdown?: Record<string | number, number>;
  } | null;
  selectedRating: number | null;
  setSelectedRating: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function ProgramReviews({
  reviews,
  reviewsTotalCount,
  reviewsPage,
  setReviewsPage,
  reviewsStats,
  selectedRating,
  setSelectedRating,
}: ProgramReviewsProps) {
  const totalPages = Math.max(1, Math.ceil((reviewsTotalCount || 0) / 5));

  const handleSelectRating = (rating: number | null) => {
    setSelectedRating(rating);
    setReviewsPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h2 className="text-lg font-bold text-foreground">Host Reviews & Feedback</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Reviews and feedback from students who attended workshops hosted by this trainer.
        </p>
      </div>

      {/* Ratings breakdown card */}
      <RatingBreakdown
        stats={reviewsStats}
        selectedRating={selectedRating}
        onSelectRating={handleSelectRating}
      />

      {/* Filter status banner */}
      {selectedRating !== null && (
        <div className="flex items-center justify-between p-3 bg-muted/65 border border-border/40 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center space-x-1.5">
            <span className="text-muted-foreground">Showing only</span>
            <span className="inline-flex items-center gap-1 font-black bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full">
              {selectedRating} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            </span>
            <span className="text-muted-foreground">reviews</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectRating(null)}
            className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded-lg"
          >
            Clear Filter
          </Button>
        </div>
      )}

      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="rounded-xl border-border/30 bg-card overflow-hidden">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                      {rev.client?.firstName?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {rev.client?.firstName} {rev.client?.lastName}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Color coded star badge */}
                  {(() => {
                    const rating = rev.rating;
                    let style = "bg-amber-500/10 text-amber-700";
                    let starColor = "fill-amber-500 text-amber-500";
                    
                    if (rating === 5) {
                      style = "bg-emerald-500/10 text-emerald-700";
                      starColor = "fill-emerald-500 text-emerald-500";
                    } else if (rating === 4) {
                      style = "bg-teal-500/10 text-teal-700";
                      starColor = "fill-teal-500 text-teal-500";
                    } else if (rating === 1) {
                      style = "bg-rose-500/10 text-rose-700";
                      starColor = "fill-rose-500 text-rose-500";
                    } else if (rating === 2) {
                      style = "bg-yellow-500/10 text-yellow-700";
                      starColor = "fill-yellow-500 text-yellow-500";
                    }
                    
                    return (
                      <div className={`flex items-center px-2 py-0.5 rounded-full ${style}`}>
                        <Star className={`h-3 w-3 mr-1 ${starColor}`} />
                        <span className="text-[10px] font-black">{rating}</span>
                      </div>
                    );
                  })()}
                </div>
                {rev.comment && (
                  <p className="text-xs text-muted-foreground leading-relaxed italic pl-1 border-l-2 border-border/50">
                    "{rev.comment}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={reviewsPage === 1}
                onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                className="text-xs h-8 px-3 rounded-lg border-border"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground font-semibold">
                Page {reviewsPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={reviewsPage === totalPages}
                onClick={() => setReviewsPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs h-8 px-3 rounded-lg border-border"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic bg-muted/20 border rounded-xl p-4 text-center">
          {selectedRating !== null 
            ? `No student reviews with a ${selectedRating}-star rating found.`
            : "No student reviews submitted for this workshop yet."
          }
        </p>
      )}
    </div>
  );
}