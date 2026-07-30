import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
}

export default function ProgramReviews({
  reviews,
  reviewsTotalCount,
  reviewsPage,
  setReviewsPage,
}: ProgramReviewsProps) {
  const totalPages = Math.max(1, Math.ceil((reviewsTotalCount || 0) / 5));

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h2 className="text-lg font-bold text-foreground">Host Reviews & Feedback</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Reviews and feedback from students who attended workshops hosted by this trainer.
        </p>
      </div>

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
                  <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                    <span className="text-[10px] font-black text-amber-700">{rev.rating}</span>
                  </div>
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
          No student reviews submitted for this workshop yet.
        </p>
      )}
    </div>
  );
}