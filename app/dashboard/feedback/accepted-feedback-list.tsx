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
import { CheckCircle, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useAcceptedFeedbacks } from "@/hooks/use-accepted-hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteFeedback } from "@/hooks/use-feedback";

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
  const deleteMutation = useDeleteFeedback();

  const handleDelete = () => {
    deleteMutation.mutate(feedback.id);
  };

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
          <div className="flex items-center gap-2">
            {feedback.isVerified && (
              <Badge
                variant="outline"
                className="bg-green-200/10 text-green-600 border-green-500"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Одобрен
              </Badge>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Отзыв будет удален навсегда.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription className="flex items-center mt-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={feedback.user.avatar || ""} />
            <AvatarFallback className="text-xs">
              {feedback.user.first_name ? feedback.user.first_name[0] : "U"}
            </AvatarFallback>
          </Avatar>
          Пользователь #{feedback.user_id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {feedback.text || "No feedback text provided"}
        </p>
        <div className="flex items-center mt-4 text-sm text-muted-foreground">
          {feedback.reaction ? (
            <ThumbsUp className="h-4 w-4 mr-1 text-green-400" />
          ) : (
            <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
          )}
          <span>{feedback.reaction ? "Нравится" : "Не нравится"}</span>
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
