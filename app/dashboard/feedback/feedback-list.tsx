//@ts-nocheck
"use client";

import { useState } from "react";

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
import { CheckCircle, XCircle } from "lucide-react";
import { useFeedbacks } from "@/lib/hooks/use-feedbacks";
import { useAcceptFeedback } from "@/hooks/use-accept-feedback";
import { useDeclineFeedback } from "@/hooks/use-decline-feedback";

export function FeedbackList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error } = useFeedbacks(page, limit);
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
          <FeedbackItem key={feedback.id} feedback={feedback} />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{feedback.title}</CardTitle>
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
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecline}
          disabled={declineMutation.isPending || feedback.status === "declined"}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Decline
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleAccept}
          disabled={acceptMutation.isPending || feedback.status === "accepted"}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeedbackSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}
