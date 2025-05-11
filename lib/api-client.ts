import { AuthService } from "@/services";
import axios from "axios";

// Create axios instance with default config
export const apiClient = axios.create({
  // baseURL: "http://localhost:3000",
  baseURL: "https://don-vip-backend-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Get token from AuthService
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the request contains FormData, remove the Content-Type header
    // to let the browser set it automatically with the correct boundary
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Refresh the token
        await AuthService.refreshToken(refreshToken);

        // Get the new token
        const newToken = AuthService.getAccessToken();

        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout and redirect
        AuthService.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  apiClient, // Export the client for direct use if needed

  // Auth
  auth: {
    login: (data: { identifier: string; password: string }) =>
      apiClient.post("/auth/login", data),
    register: (data: { identifier: string; password: string }) =>
      apiClient.post("/auth/register", data),
    refresh: (token: string) => apiClient.post("/auth/refresh", { token }),
  },

  // Users
  users: {
    getAll: (params?: { limit?: number; page?: number }) =>
      apiClient.get("/user", { params }),
    getById: (id: string) => apiClient.get(`/user/${id}`),
    updateProfile: (data: FormData) =>
      apiClient.patch("/user/update-profile", data),
    blockUser: (id: string) => apiClient.patch(`/user/${id}/ban`),
    unblockUser: (id: string) => apiClient.patch(`/user/${id}/unban`),
    getUserPayments: (id: string, params?: { limit?: number; page?: number }) =>
      apiClient.get(`/user/${id}/payments`, { params }),
  },

  products: {
    getAll: (params?: { limit?: number; page?: number; search?: string }) =>
      apiClient.get("/product", { params }),

    getById: (id: number) => apiClient.get(`/product/${id}`),

    create: (data: FormData) => {
      // Directly send the FormData object
      return apiClient.post("/product", data);
    },

    update: (id: number, data: FormData) => {
      // Directly send the FormData object
      return apiClient.patch(`/product/${id}`, data);
    },

    delete: (id: number) => apiClient.delete(`/product/${id}`),

    getSmileProducts: () => apiClient.get("/product/smile"),

    getSmileSKU: (apiGame: string) =>
      apiClient.get(`/product/smile/${apiGame}`),
  },

  // Orders
  orders: {
    getAll: (params?: { limit?: number; page?: number }) =>
      apiClient.get("/order", { params }),
    getById: (id: number) => apiClient.get(`/order/${id}`),
    create: (data: any) => apiClient.post("/order", data),
    delete: (id: number) => apiClient.delete(`/order/${id}`),
    getAnalytics: () => apiClient.get("/order/analytics"),
  },

  // Coupons
  coupons: {
    getAll: () => apiClient.get("/coupon/all"),
    create: (data: { code: string; discount: number; limit?: number }) =>
      apiClient.post("/coupon", data),
    update: (
      id: number,
      data: { code?: string; discount?: number; limit?: number }
    ) => apiClient.patch(`/coupon/${id}`, data),
    delete: (id: number) => apiClient.delete(`/coupon/${id}`),
    check: (code: string) =>
      apiClient.get("/coupon/check", { params: { code } }),
  },

  // Feedback
  feedback: {
    getAll: (params?: { limit?: number; page?: number }) =>
      apiClient.get("/feedback", { params }),
    getById: (id: number) => apiClient.get(`/feedback/${id}`),
    update: (id: number, data: any) => apiClient.patch(`/feedback/${id}`, data),
    delete: (id: number) => apiClient.delete(`/feedback/${id}`),
  },

  // Payments
  payments: {
    createPagsmilePayin: (data: { amount: string; order_id: string }) =>
      apiClient.post("/payment/pagsmile/payin", data),
    getTbankPaymentUrl: (orderId: string) =>
      apiClient.get(`/payment/tbank/url/${orderId}`),
  },
};
