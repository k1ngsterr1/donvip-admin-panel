import { useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedback-service";
import { feedbackKeys } from "@/lib/query-keys";

export function useDeclineFeedback(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => feedbackService.decline(id),
    onSuccess: (data) => {
      // Invalidate all feedback lists to refresh data
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });

      // Update the specific feedback in the cache
      queryClient.setQueryData(feedbackKeys.detail(id), data);
    },
  });
}
