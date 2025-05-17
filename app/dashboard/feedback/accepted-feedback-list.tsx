//@ts-nocheck

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useAcceptedFeedbacks } from "@/hooks/use-accepted-hooks";

export function AcceptedFeedbackList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error } = useAcceptedFeedbacks(page, limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <AcceptedFeedbackSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-destructive">
            Error loading accepted feedbacks:{" "}
            {error?.message || "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.items?.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No accepted feedbacks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {data.items.map((feedback: any) => (
          <AcceptedFeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <Pagination
          currentPage={page as any}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

function AcceptedFeedbackItem({ feedback }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{feedback.title}</CardTitle>
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success"
          >
            <CheckCircle className="mr-1 h-3 w-3" /> Accepted
          </Badge>
        </div>
        <CardDescription>
          From: {feedback.author} •{" "}
          {new Date(feedback.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{feedback.content}</p>
        {feedback.category && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {feedback.category}
            </span>
          </div>
        )}
        {feedback.acceptedAt && (
          <p className="text-sm text-muted-foreground mt-4">
            Accepted on: {new Date(feedback.acceptedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AcceptedFeedbackSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}
