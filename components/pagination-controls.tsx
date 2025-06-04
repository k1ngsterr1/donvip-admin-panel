"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  // Determine page numbers to display
  let pageNumbers: (number | string)[] = [];
  const maxPagesToShow = 5; // Max number of page buttons (excluding prev/next)
  const halfMaxPages = Math.floor(maxPagesToShow / 2);

  if (totalPages <= maxPagesToShow) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPage <= halfMaxPages + 1) {
      // Near the start
      pageNumbers = Array.from({ length: maxPagesToShow - 1 }, (_, i) => i + 1);
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - halfMaxPages) {
      // Near the end
      pageNumbers.push(1);
      pageNumbers.push("...");
      pageNumbers = pageNumbers.concat(
        Array.from(
          { length: maxPagesToShow - 1 },
          (_, i) => totalPages - (maxPagesToShow - 2) + i
        )
      );
    } else {
      // In the middle
      pageNumbers.push(1);
      pageNumbers.push("...");
      pageNumbers = pageNumbers.concat(
        Array.from(
          { length: maxPagesToShow - 2 },
          (_, i) => currentPage - Math.floor((maxPagesToShow - 2) / 2) + i
        )
      );
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFirst}
        disabled={currentPage === 1}
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((num, index) =>
        typeof num === "string" ? (
          <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm">
            {num}
          </span>
        ) : (
          <Button
            key={num}
            variant={currentPage === num ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(num)}
            aria-label={`Go to page ${num}`}
          >
            {num}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLast}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
