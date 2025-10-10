import { AuthService } from "@/services"; // Assuming AuthService is correctly defined elsewhere
import axios, { type AxiosResponse } from "axios";
import {
  CreateGameContentDto,
  UpdateGameContentDto,
  CreateReviewDto,
  CreateFAQDto,
  GameContent,
  GameListResponse,
  GameSearchResponse,
  GameInstructionResponse,
  GameReviewsResponse,
  GameFAQResponse,
} from "@/types/game-content-dto";
import {
  Article,
  Tag,
  CreateArticleDto,
  UpdateArticleDto,
  CreateTagDto,
  UpdateTagDto,
  ArticlesResponse,
  TagsResponse,
  ArticleFilters,
  TagFilters,
} from "@/types/articles";

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
      removeDuplicates?: boolean;
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

  paymentMethods: {
    create: (data: {
      name: string;
      code: string;
      country: string;
      currency: string;
      minAmount?: number;
      maxAmount?: number;
      fee?: number;
      isActive?: boolean;
      description?: string;
      icon?: string;
    }) => apiClient.post("/payment/payment-methods", data),
    getAll: (params?: {
      country?: string;
      currency?: string;
      isActive?: boolean;
    }) => apiClient.get("/payment/admin/payment-methods", { params }),
    getById: (id: number) => apiClient.get(`/payment/payment-methods/${id}`),
    update: (
      id: number,
      data: {
        name?: string;
        code?: string;
        country?: string;
        currency?: string;
        minAmount?: number;
        maxAmount?: number;
        fee?: number;
        isActive?: boolean;
        description?: string;
        icon?: string;
      }
    ) => apiClient.post(`/payment/payment-methods/${id}`, data),
    delete: (id: number) =>
      apiClient.post(`/payment/payment-methods/${id}/delete`),
    getCountries: () => apiClient.get("/payment/countries"),
    getSupportedCountries: () => apiClient.get("/payment/supported-countries"),

    // Icon upload endpoints
    uploadIcon: (file: File) => {
      const formData = new FormData();
      formData.append("icon", file);
      return apiClient.post("/payment/payment-methods/upload-icon", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    updateIcon: (id: number, file: File) => {
      const formData = new FormData();
      formData.append("icon", file);
      return apiClient.post(`/payment/payment-methods/${id}/icon`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    deleteIcon: (id: number) =>
      apiClient.delete(`/payment/payment-methods/${id}/icon`),
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

  gameContent: {
    // Public endpoints
    getAll: (): Promise<AxiosResponse<GameListResponse>> =>
      apiClient.get("/game-content"),
    search: (query: string): Promise<AxiosResponse<GameSearchResponse>> =>
      apiClient.get(`/game-content/search?q=${encodeURIComponent(query)}`),
    getById: (gameId: string): Promise<AxiosResponse<GameContent>> =>
      apiClient.get(`/game-content/${gameId}`),
    getInstruction: (
      gameId: string
    ): Promise<AxiosResponse<GameInstructionResponse>> =>
      apiClient.get(`/game-content/${gameId}/instruction`),
    getReviews: (
      gameId: string,
      page: number = 1,
      limit: number = 10
    ): Promise<AxiosResponse<GameReviewsResponse>> =>
      apiClient.get(
        `/game-content/${gameId}/reviews?page=${page}&limit=${limit}`
      ),
    getFAQ: (gameId: string): Promise<AxiosResponse<GameFAQResponse>> =>
      apiClient.get(`/game-content/${gameId}/faq`),

    // Admin endpoints
    create: (data: CreateGameContentDto): Promise<AxiosResponse<GameContent>> =>
      apiClient.post("/game-content", data),
    update: (
      gameId: string,
      data: UpdateGameContentDto
    ): Promise<AxiosResponse<GameContent>> =>
      apiClient.put(`/game-content/${gameId}`, data),
    delete: (
      gameId: string
    ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
      apiClient.delete(`/game-content/${gameId}`),

    // Review management
    addReview: (
      gameId: string,
      data: CreateReviewDto
    ): Promise<AxiosResponse<any>> =>
      apiClient.post(`/game-content/${gameId}/reviews`, data),
    deleteReview: (
      gameId: string,
      reviewId: string
    ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
      apiClient.delete(`/game-content/${gameId}/reviews/${reviewId}`),

    // FAQ management
    addFAQ: (gameId: string, data: CreateFAQDto): Promise<AxiosResponse<any>> =>
      apiClient.post(`/game-content/${gameId}/faq`, data),
    deleteFAQ: (
      gameId: string,
      faqId: string
    ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
      apiClient.delete(`/game-content/${gameId}/faq/${faqId}`),

    // Extended Review endpoints
    getReviewStats: (gameId: string): Promise<AxiosResponse<any>> =>
      apiClient.get(`/game-content/${gameId}/reviews/stats`),
    getTopReviews: (
      gameId: string,
      limit: number = 5
    ): Promise<AxiosResponse<any>> =>
      apiClient.get(`/game-content/${gameId}/reviews/top?limit=${limit}`),
    searchReviews: (
      gameId: string,
      query: string
    ): Promise<AxiosResponse<any>> =>
      apiClient.get(
        `/game-content/${gameId}/reviews/search?q=${encodeURIComponent(query)}`
      ),
    getReviewsByRating: (
      gameId: string,
      rating: number
    ): Promise<AxiosResponse<any>> =>
      apiClient.get(`/game-content/${gameId}/reviews/rating/${rating}`),
    markReviewAsSpam: (
      gameId: string,
      reviewId: string
    ): Promise<AxiosResponse<any>> =>
      apiClient.post(`/game-content/${gameId}/reviews/${reviewId}/spam`),
    exportReviews: (gameId?: string): Promise<AxiosResponse<any>> => {
      const url = gameId
        ? `/game-content/reviews/export?gameId=${gameId}`
        : "/game-content/reviews/export";
      return apiClient.get(url);
    },
    getAllGamesReviewStats: (): Promise<AxiosResponse<any>> =>
      apiClient.get("/game-content/reviews/stats/all"),

    // Extended FAQ endpoints
    addFAQItem: (
      gameId: string,
      data: CreateFAQDto
    ): Promise<AxiosResponse<any>> =>
      apiClient.post(`/game-content/${gameId}/faq`, data),
    deleteFAQItem: (
      gameId: string,
      faqId: string
    ): Promise<AxiosResponse<any>> =>
      apiClient.delete(`/game-content/${gameId}/faq/${faqId}`),
    searchFAQ: (gameId: string, query: string): Promise<AxiosResponse<any>> =>
      apiClient.get(
        `/game-content/${gameId}/faq/search?q=${encodeURIComponent(query)}`
      ),
    getRandomFAQ: (
      gameId: string,
      limit: number = 3
    ): Promise<AxiosResponse<any>> =>
      apiClient.get(`/game-content/${gameId}/faq/random?limit=${limit}`),
    getFAQStats: (gameId: string): Promise<AxiosResponse<any>> =>
      apiClient.get(`/game-content/${gameId}/faq/stats`),
    updateFAQItem: (
      gameId: string,
      faqId: string,
      data: { question?: string; answer?: string }
    ): Promise<AxiosResponse<any>> =>
      apiClient.put(`/game-content/${gameId}/faq/${faqId}`, data),
    generateFAQItem: (
      gameId: string,
      template: string
    ): Promise<AxiosResponse<any>> =>
      apiClient.post(
        `/game-content/${gameId}/faq/generate?template=${template}`
      ),
    getAllGamesFAQ: (): Promise<AxiosResponse<any>> =>
      apiClient.get("/game-content/faq/all"),
    exportFAQ: (gameId?: string): Promise<AxiosResponse<any>> => {
      const url = gameId
        ? `/game-content/faq/export?gameId=${gameId}`
        : "/game-content/faq/export";
      return apiClient.get(url);
    },

    // New administrative endpoints
    toggleGameStatus: (
      gameId: string,
      data: { active: boolean }
    ): Promise<AxiosResponse<{ message: string; active: boolean }>> =>
      apiClient.patch(`/game-content/${gameId}/status`, data),
    bulkDeleteGames: (data: {
      gameIds: string[];
    }): Promise<AxiosResponse<{ message: string; deletedCount: number }>> =>
      apiClient.post("/game-content/bulk-delete", data),
    updateGameInstruction: (
      gameId: string,
      data: any
    ): Promise<AxiosResponse<GameContent>> =>
      apiClient.patch(`/game-content/${gameId}/instruction`, data),
    updateGameDescription: (
      gameId: string,
      data: { description: string }
    ): Promise<AxiosResponse<GameContent>> =>
      apiClient.patch(`/game-content/${gameId}/description`, data),
    duplicateGame: (
      gameId: string,
      data: { newGameId: string; newGameName?: string }
    ): Promise<AxiosResponse<GameContent>> =>
      apiClient.post(`/game-content/${gameId}/duplicate`, data),
    getGamesByStatus: (active?: boolean): Promise<AxiosResponse<any>> => {
      const url =
        active !== undefined
          ? `/game-content/games/by-status?active=${active}`
          : "/game-content/games/by-status";
      return apiClient.get(url);
    },
    searchGamesAdvanced: (filters: {
      query?: string;
      active?: boolean;
      minReviews?: number;
      minRating?: number;
    }): Promise<AxiosResponse<any>> => {
      const params = new URLSearchParams();
      if (filters.query) params.append("query", filters.query);
      if (filters.active !== undefined)
        params.append("active", filters.active.toString());
      if (filters.minReviews !== undefined)
        params.append("minReviews", filters.minReviews.toString());
      if (filters.minRating !== undefined)
        params.append("minRating", filters.minRating.toString());
      return apiClient.get(`/game-content/games/advanced-search?${params}`);
    },

    // Image upload endpoint for instructions
    uploadInstructionImage: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiClient.post(
        "/game-content/upload-instruction-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },

    // Image upload endpoint for description
    uploadDescriptionImage: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiClient.post(
        "/game-content/upload-description-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
  },

  // Articles API
  articles: {
    // Get all articles with filters and pagination
    getAll: (
      filters?: ArticleFilters
    ): Promise<AxiosResponse<ArticlesResponse>> =>
      apiClient.get("/articles", { params: filters }),

    // Search articles
    search: (
      query: string,
      filters?: Omit<ArticleFilters, "search">
    ): Promise<AxiosResponse<ArticlesResponse>> =>
      apiClient.get("/articles/search", { params: { q: query, ...filters } }),

    // Get article by ID
    getById: (id: number): Promise<AxiosResponse<Article>> =>
      apiClient.get(`/articles/${id}`),

    // Get article by slug
    getBySlug: (slug: string): Promise<AxiosResponse<Article>> =>
      apiClient.get(`/articles/slug/${slug}`),

    // Create new article
    create: (data: CreateArticleDto): Promise<AxiosResponse<Article>> =>
      apiClient.post("/articles", data),

    // Update article
    update: (
      id: number,
      data: UpdateArticleDto
    ): Promise<AxiosResponse<Article>> =>
      apiClient.patch(`/articles/${id}`, data),

    // Delete article
    delete: (id: number): Promise<AxiosResponse<void>> =>
      apiClient.delete(`/articles/${id}`),

    // Toggle article publication status
    togglePublish: (id: number): Promise<AxiosResponse<Article>> =>
      apiClient.patch(`/articles/${id}/toggle-publish`),

    // Upload article featured image
    uploadFeaturedImage: (
      file: File
    ): Promise<
      AxiosResponse<{
        message: string;
        filename: string;
        path: string;
        url: string;
      }>
    > => {
      const formData = new FormData();
      formData.append("image", file);
      return apiClient.post("/articles/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Upload image for article content
    uploadContentImage: (
      file: File
    ): Promise<
      AxiosResponse<{
        message: string;
        filename: string;
        path: string;
        url: string;
      }>
    > => {
      const formData = new FormData();
      formData.append("image", file);
      return apiClient.post("/articles/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Get articles by tag
    getByTag: (
      tagSlug: string,
      filters?: Omit<ArticleFilters, "tag">
    ): Promise<AxiosResponse<ArticlesResponse>> =>
      apiClient.get(`/articles/tag/${tagSlug}`, { params: filters }),
  },

  // Tags API
  tags: {
    // Get all tags with filters and pagination
    getAll: (filters?: TagFilters): Promise<AxiosResponse<Tag[]>> =>
      apiClient.get("/articles/tags/all", { params: filters }),

    // Search tags
    search: (
      query: string,
      filters?: Omit<TagFilters, "search">
    ): Promise<AxiosResponse<TagsResponse>> =>
      apiClient.get("/articles/tags/search", {
        params: { q: query, ...filters },
      }),

    // Get tag by ID
    getById: (id: number): Promise<AxiosResponse<Tag>> =>
      apiClient.get(`/articles/tags/${id}`),

    // Get tag by slug
    getBySlug: (slug: string): Promise<AxiosResponse<Tag>> =>
      apiClient.get(`/articles/tags/slug/${slug}`),

    // Create new tag
    create: (data: CreateTagDto): Promise<AxiosResponse<Tag>> =>
      apiClient.post("/articles/tags", data),

    // Update tag
    update: (id: number, data: UpdateTagDto): Promise<AxiosResponse<Tag>> =>
      apiClient.patch(`/articles/tags/${id}`, data),

    // Delete tag
    delete: (id: number): Promise<AxiosResponse<void>> =>
      apiClient.delete(`/articles/tags/${id}`),
  },

  // Design Services API
  designServices: {
    // Get all design services for admin
    getAll: (): Promise<
      AxiosResponse<import("@/types/design-services").DesignService[]>
    > => apiClient.get("/design-services/admin/all"),

    // Get design service by ID
    getById: (
      id: number
    ): Promise<
      AxiosResponse<import("@/types/design-services").DesignService>
    > => apiClient.get(`/design-services/admin/${id}`),

    // Create new design service
    create: (
      data: import("@/types/design-services").CreateDesignServiceDto
    ): Promise<
      AxiosResponse<import("@/types/design-services").DesignService>
    > => apiClient.post("/design-services/admin/create", data),

    // Update design service
    update: (
      id: number,
      data: import("@/types/design-services").UpdateDesignServiceDto
    ): Promise<
      AxiosResponse<import("@/types/design-services").DesignService>
    > => apiClient.patch(`/design-services/admin/${id}`, data),

    // Update only price
    updatePrice: (
      id: number,
      data: import("@/types/design-services").UpdatePriceDto
    ): Promise<
      AxiosResponse<import("@/types/design-services").DesignService>
    > => apiClient.patch(`/design-services/admin/${id}/price`, data),

    // Update price by service key
    updatePriceByKey: (
      key: string,
      data: import("@/types/design-services").UpdatePriceDto
    ): Promise<
      AxiosResponse<import("@/types/design-services").DesignService>
    > => apiClient.patch(`/design-services/admin/key/${key}/price`, data),

    // Delete design service
    delete: (id: number): Promise<AxiosResponse<void>> =>
      apiClient.delete(`/design-services/admin/${id}`),

    // Initialize default services
    initialize: (): Promise<
      AxiosResponse<{ message: string; count: number }>
    > => apiClient.post("/design-services/admin/initialize"),
  },
};
