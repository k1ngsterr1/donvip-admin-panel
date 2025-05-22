"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground text-primary">
        Страница {page} из {totalPages}
      </div>
      <div className="flex items-center space-x-2 text-primary">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 text-primary"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            // Show pages around current page
            let pageNum = page - 2 + i;
            if (pageNum <= 0) pageNum = i + 1;
            if (pageNum > totalPages) return null;

            return (
              <Button
                key={i}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                className={cn("h-8 w-8 p-0", pageNum === page && "bg-primary")}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="mx-1 text-primary">...</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8"
        >
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
