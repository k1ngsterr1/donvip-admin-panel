import { AuthService } from "@/services"; // Assuming AuthService is correctly defined elsewhere
import axios, { type AxiosResponse } from "axios";

export interface WebsiteTechWorkInfoFromApi {
  id: number;
  isTechWorks: boolean;
  techWorksEndsAt?: string | null; // ISO string
  // name?: string; // Optional: if your getById endpoint returns it
}

export interface UpdateTechWorksDto {
  isTechWorks?: boolean;
  techWorksEndsAt?: string | null; // ISO string or null
}

export const apiClient = axios.create({
  baseURL: "http://localhost:6001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        await AuthService.refreshToken(refreshToken);
        const newToken = AuthService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
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

  // Products
  products: {
    getAll: (params?: { limit?: number; page?: number; search?: string }) =>
      apiClient.get("/product/all", { params }),
    getById: (id: number) => apiClient.get(`/product/${id}`),
    create: (data: FormData) => {
      return apiClient.post("/product", data);
    },
    update: (id: number, data: FormData) => {
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
    delete: (id: number) => apiClient.delete(`/order/delete/${id}`),
    getAnalytics: () => apiClient.get("/order/admin/analytics"),
    getMonthlyPayments: () => apiClient.get("/order/admin/monthly-sales"),
    getAllForAdmin: (params?: {
      limit?: number;
      page?: number;
      search?: string;
    }) => apiClient.get("/order/admin/history", { params }),
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
    getIncoming: (params?: { limit?: number; page?: number }) =>
      apiClient.get("/feedback/list/incoming", { params }),
    getAccepted: (params?: { limit?: number; page?: number }) =>
      apiClient.get("/feedback/list/accepted", { params }),
    getById: (id: number) => apiClient.get(`/feedback/${id}`),
    update: (id: number, data: any) => apiClient.patch(`/feedback/${id}`, data),
    delete: (id: number) => apiClient.delete(`/feedback/${id}`),
    accept: (id: number) => apiClient.patch(`/feedback/${id}/accept`),
    decline: (id: number) => apiClient.patch(`/feedback/${id}/decline`),
  },

  // Payments
  payments: {
    createPagsmilePayin: (data: { amount: string; order_id: string }) =>
      apiClient.post("/payment/pagsmile/payin", data),
    getTbankPaymentUrl: (orderId: string) =>
      apiClient.get(`/payment/tbank/url/${orderId}`),
  },

  // TechWorks
  techworks: {
    getById: (id: number): Promise<AxiosResponse<WebsiteTechWorkInfoFromApi>> =>
      apiClient.get(`/techworks/${id}`),
    updateTechWorks: (
      id: number,
      data: UpdateTechWorksDto
    ): Promise<AxiosResponse<WebsiteTechWorkInfoFromApi>> =>
      apiClient.patch(`/techworks/${id}/tech-works`, data),
    toggleTechWorks: (
      id: number
    ): Promise<AxiosResponse<WebsiteTechWorkInfoFromApi>> =>
      apiClient.patch(`/techworks/${id}/tech-works/toggle`),
  },
};
