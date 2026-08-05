"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50, 100],
}: PaginationControlProps) {
  if (totalItems <= 0) return null;

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers list with ellipsis handling
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3;

    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(safeTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < safeTotalPages - 2) pages.push("...");
      pages.push(safeTotalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 bg-card border-t border-black/5 dark:border-white/5 text-xs">
      
      {/* Items Range & Limit Selector */}
      <div className="flex items-center gap-4 text-muted-foreground font-medium">
        <span>
          Showing <strong className="text-foreground font-bold">{startItem}</strong> to{" "}
          <strong className="text-foreground font-bold">{endItem}</strong> of{" "}
          <strong className="text-foreground font-bold">{totalItems}</strong> items
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 border-l border-black/5 dark:border-white/5 pl-4">
            <span className="text-[11px] text-muted-foreground">Rows:</span>
            <select
              className="h-7 rounded-lg border border-black/5 dark:border-white/5 bg-muted/20 px-2 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-black/5 dark:border-white/5"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-black/5 dark:border-white/5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={idx}
                onClick={() => onPageChange(p)}
                className={`h-7 w-7 rounded-lg text-xs font-extrabold transition-all ${
                  currentPage === p
                    ? "bg-[#0b0c01] text-white shadow-xs dark:bg-[#a0f212] dark:text-[#0b0c01]"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-muted-foreground font-bold">
                ...
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-black/5 dark:border-white/5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-black/5 dark:border-white/5"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage >= safeTotalPages}
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>

    </div>
  );
}
