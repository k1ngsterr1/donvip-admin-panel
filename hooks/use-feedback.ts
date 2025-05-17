import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedback-service";
import { feedbackKeys } from "@/lib/query-keys";

export function useFeedback(id: number) {
  return useQuery({
    queryKey: feedbackKeys.detail(id),
    queryFn: () => feedbackService.getById(id),
    enabled: !!id, // Only run the query if id is provided
  });
}
