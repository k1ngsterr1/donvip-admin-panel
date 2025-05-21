//@ts-nocheck
"use client";

import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, ThumbsUp, ThumbsDown, XCircle } from "lucide-react";
import { useAcceptFeedback } from "@/hooks/use-accept-feedback";
import { useDeclineFeedback } from "@/hooks/use-decline-feedback";
import { useIncomingFeedbacks } from "@/hooks/use-incoming-hook";

export function FeedbackList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error } = useIncomingFeedbacks(page, limit);
  const { toast } = useToast();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <FeedbackSkeleton key={i} />
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

  // Check if data exists and has the expected structure
  if (data?.items.length) {
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
        {data?.items.map((feedback: any) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </div>

      {data?.items.lastPage > 1 && (
        <Pagination
          //@ts-ignore
          currentPage={page}
          totalPages={data?.items.lastPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

function FeedbackItem({ feedback }: any) {
  const acceptMutation = useAcceptFeedback(feedback.id);
  const declineMutation = useDeclineFeedback(feedback.id);
  const { toast } = useToast();

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync();
      toast({
        title: "Feedback accepted",
        description: "The feedback has been successfully accepted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async () => {
    try {
      await declineMutation.mutateAsync();
      toast({
        title: "Feedback declined",
        description: "The feedback has been declined.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
      });
    }
  };

  // Get user name or default to "Anonymous"
  const userName = feedback.user?.first_name || "Anonymous";
  const userInitial = userName !== "Anonymous" ? userName.charAt(0) : "A";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mt-2">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={feedback.user?.avatar || "/placeholder.svg"}
              alt={userName}
            />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{userName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {feedback.isVerified && (
                <span className="flex items-center text-emerald-600 gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Одобрен
                </span>
              )}
              <span className="flex items-center gap-1">
                {feedback.reaction ? (
                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <ThumbsDown className="h-3.5 w-3.5 text-rose-600" />
                )}
                {feedback.reaction ? "Positive" : "Negative"}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{feedback.text}</p>

        {feedback.product && (
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-md">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src={feedback.product.image || "/placeholder.svg"}
                alt={feedback.product.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="font-medium text-sm">{feedback.product.name}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecline}
          disabled={declineMutation.isPending}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Отклонить
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleAccept}
          disabled={acceptMutation.isPending}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Принять
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeedbackSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-16 w-full rounded-md" />
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}
