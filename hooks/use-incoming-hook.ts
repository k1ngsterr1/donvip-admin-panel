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

export function useIncomingFeedbacks(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...feedbackKeys.lists(), "incoming", { page, limit }],
    queryFn: () => feedbackService.getIncoming(page, limit),
    select: (data: ApiResponse): FormattedData => {
      return {
        items: data.data,
        totalPages: data.lastPage,
        currentPage: data.page,
      };
    },
  });
}
