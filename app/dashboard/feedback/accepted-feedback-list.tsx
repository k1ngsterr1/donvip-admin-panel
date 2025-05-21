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
import { CheckCircle, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
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
            Error loading feedbacks: {error?.message || "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.items?.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No feedbacks found</p>
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
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md">
              {feedback.product.image ? (
                <Image
                  src={feedback.product.image || "/placeholder.svg"}
                  alt={feedback.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-secondary flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No img</span>
                </div>
              )}
            </div>
            <CardTitle className="text-base">{feedback.product.name}</CardTitle>
          </div>
          {feedback.isVerified && (
            <Badge
              variant="outline"
              className="bg-success/10 text-success border-success"
            >
              <CheckCircle className="mr-1 h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center mt-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={feedback.user.avatar || ""} />
            <AvatarFallback className="text-xs">
              {feedback.user.first_name ? feedback.user.first_name[0] : "U"}
            </AvatarFallback>
          </Avatar>
          User #{feedback.user_id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {feedback.text || "No feedback text provided"}
        </p>
        <div className="flex items-center mt-4 text-sm text-muted-foreground">
          <ThumbsUp
            className={`h-4 w-4 mr-1 ${
              feedback.reaction ? "fill-primary" : ""
            }`}
          />
          <span>{feedback.reaction ? "Liked" : "Not liked"}</span>
          <span>Product ID: {feedback.product_id}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AcceptedFeedbackSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center mt-2">
          <Skeleton className="h-6 w-6 rounded-full mr-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}
