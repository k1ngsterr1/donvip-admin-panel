import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedback-service";
import { feedbackKeys } from "../query-keys";

export function useFeedbacks(page = 1, limit = 10) {
  return useQuery<any, Error>({
    queryKey: [...feedbackKeys.lists(), { page, limit }],
    queryFn: () => feedbackService.getAll(page, limit),
  });
}
