import { AuthService } from "@/services"; // Assuming AuthService is correctly defined elsewhere
import axios, { type AxiosResponse } from "axios";

// Define types to avoid implicit any errors
interface RequestConfig {
  headers: any;
  data?: any;
  _retry?: boolean;
}

interface ErrorResponse {
  config: RequestConfig;
  response?: {
    status: number;
    data?: any;
  };
}

// Declare global process object for Next.js environment
declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
  };
};

// --- START: Bank-specific Interfaces ---
export interface Bank {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface PaginatedBanksResponse {
  data: Bank[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBankPayload {
  name: string;
  isActive?: boolean;
}

export interface UpdateBankPayload {
  name?: string;
  isActive?: boolean;
}
// --- END: Bank-specific Interfaces ---

// --- START: DonatBank Order Interfaces ---
export interface DonatBankOrderField {
  [key: string]: string | number | boolean;
}

export interface DonatBankCreateOrderDto {
  productId: string; // DonatBank API expects string ID
  packageId: string; // This is also likely a string ID
  quantity: number;
  fields: DonatBankOrderField;
}

export interface DonatBankOrderResponse {
  id: string;
  status: string;
  paymentUrl?: string;
  orderId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface DonatBankProduct {
  id: string; // DonatBank IDs are likely UUIDs (strings)
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface DonatBankProductsResponse {
  status: string;
  message: string;
  product_list: { [key: string]: DonatBankProduct };
}
// --- END: DonatBank Order Interfaces ---

// Existing interfaces (WebsiteTechWorkInfoFromApi, UpdateTechWorksDto)
export interface WebsiteTechWorkInfoFromApi {
  id: number;
  isTechWorks: boolean;
  techWorksEndsAt?: string | null;
}
export interface UpdateTechWorksDto {
  isTechWorks?: boolean;
  techWorksEndsAt?: string | null;
}

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.don-vip.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: RequestConfig) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error: ErrorResponse) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: ErrorResponse) => {
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
  apiClient,

  auth: {
    login: (data: { identifier: string; password: string }) =>
      apiClient.post("/auth/login", data),
    register: (data: { identifier: string; password: string }) =>
      apiClient.post("/auth/register", data),
    refresh: (token: string) => apiClient.post("/auth/refresh", { token }),
  },

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
    getAll: (params?: {
      limit?: number;
      page?: number;
      search?: string;
      activeOnly?: boolean;
    }) => apiClient.get("/product/all", { params }),
    getActive: (params?: { limit?: number; page?: number; search?: string }) =>
      apiClient.get("/product/active", { params }),
    getById: (id: number) => apiClient.get(`/product/${id}`),
    create: (data: FormData) => apiClient.post("/product", data),
    update: (id: number, data: FormData) =>
      apiClient.patch(`/product/${id}`, data),
    delete: (id: number) => apiClient.delete(`/product/${id}`),
    toggleActive: (id: number) =>
      apiClient.patch(`/product/${id}/toggle-active`),
    activate: (id: number) => apiClient.patch(`/product/${id}/activate`),
    deactivate: (id: number) => apiClient.patch(`/product/${id}/deactivate`),
    getSmileProducts: () => apiClient.get("/product/smile"),
    getDonatBankProducts: () => apiClient.get("/product/donatbank/products"),
    getSmileSKU: (apiGame: string) =>
      apiClient.get(`/product/smile/${apiGame}`),
    getDonatBankPackages: (productId: string) =>
      apiClient.get(`/product/donatbank/${productId}/packages`),
  },

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
    createDonatBankOrder: (data: DonatBankCreateOrderDto) =>
      apiClient.post("/order/donatbank/create-order", data),
  },

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

  payments: {
    createPagsmilePayin: (data: { amount: string; order_id: string }) =>
      apiClient.post("/payment/pagsmile/payin", data),
    getTbankPaymentUrl: (orderId: string) =>
      apiClient.get(`/payment/tbank/url/${orderId}`),
  },

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

  banks: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      isActive?: boolean;
    }): Promise<AxiosResponse<PaginatedBanksResponse>> =>
      apiClient.get("/banks", { params }),
    getById: (id: number): Promise<AxiosResponse<Bank>> =>
      apiClient.get(`/banks/${id}`),
    create: (data: CreateBankPayload): Promise<AxiosResponse<Bank>> =>
      apiClient.post("/banks", data),
    update: (
      id: number,
      data: UpdateBankPayload
    ): Promise<AxiosResponse<Bank>> => apiClient.patch(`/banks/${id}`, data),
    delete: (id: number): Promise<AxiosResponse<Bank>> =>
      apiClient.delete(`/banks/${id}`), // Kept for API completeness
  },
};
