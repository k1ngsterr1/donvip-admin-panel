import { useQuery } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedback-service";
import { feedbackKeys } from "@/lib/query-keys";

type FeedbackItem = {
  id: number;
  reaction: boolean;
  text: string;
  product_id: number;
  isVerified: boolean;
  user_id: number;
  product: {
    name: string;
    image: string;
  };
  user: {
    first_name: string | null;
    avatar: string | null;
  };
};

type ApiResponse = {
  data: FeedbackItem[];
  total: number;
  page: number;
  lastPage: number;
};

type FormattedData = {
  items: FeedbackItem[];
  totalPages: number;
  currentPage: number;
};

export function useAcceptedFeedbacks(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...feedbackKeys.lists(), "accepted", { page, limit }],
    queryFn: () => feedbackService.getAccepted(page, limit),
    select: (data: ApiResponse): FormattedData => {
      // Transform the API response to match the expected format
      return {
        items: data.data,
        totalPages: data.lastPage,
        currentPage: data.page,
      };
    },
  });
}
