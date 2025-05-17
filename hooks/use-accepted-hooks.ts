import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedback-service";
import { feedbackKeys } from "@/lib/query-keys";

export function useAcceptedFeedbacks(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...feedbackKeys.lists(), "accepted", { page, limit }],
    queryFn: () => feedbackService.getAccepted(page, limit),
  });
}
