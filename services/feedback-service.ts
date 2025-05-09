import { api } from "@/lib/api-client";

export interface Feedback {
  id: number;
  user: string;
  userInitials: string;
  product: string;
  reaction: boolean;
  text: string;
  date: string;
}

export interface FeedbackListParams {
  limit?: number;
  page?: number;
}

export const FeedbackService = {
  /**
   * Get all feedback with pagination
   */
  getFeedback: async (params?: FeedbackListParams) => {
    const response = await api.feedback.getAll(params);
    return response.data;
  },

  /**
   * Get feedback by ID
   */
  getFeedbackById: async (id: number) => {
    const response = await api.feedback.getById(id);
    return response.data;
  },

  /**
   * Update feedback
   */
  updateFeedback: async (id: number, data: any) => {
    const response = await api.feedback.update(id, data);
    return response.data;
  },

  /**
   * Delete feedback
   */
  deleteFeedback: async (id: number) => {
    const response = await api.feedback.delete(id);
    return response.data;
  },
};
