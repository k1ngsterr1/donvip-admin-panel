import { apiClient } from "@/lib/api-client";
import { extractErrorMessage } from "@/lib/utils";

export const feedbackService = {
  // Get all feedbacks
  getAll: async (page = 1, limit = 10): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/feedback?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get feedback by id
  getById: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Accept feedback
  accept: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.patch(`/feedback/${id}/accept`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Decline feedback
  decline: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.patch(`/feedback/${id}/decline`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getAccepted: async (page = 1, limit = 10): Promise<any> => {
    try {
      const response = await apiClient.get("/feedback/list/accepted", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
