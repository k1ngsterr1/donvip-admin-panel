import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedback-service";
import { feedbackKeys } from "@/lib/query-keys";
import { toast } from "./use-toast";

export function useFeedback(id: number) {
  return useQuery({
    queryKey: feedbackKeys.detail(id),
    queryFn: () => feedbackService.getById(id),
    enabled: !!id, // Only run the query if id is provided
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => feedbackService.delete(id),
    onSuccess: () => {
      toast({
        title: "Отзыв удален",
        description: "Отзыв был успешно удален",
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["acceptedFeedbacks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось удалить отзыв: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
