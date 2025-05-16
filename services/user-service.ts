import { api } from "@/lib/api-client";

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  is_banned: boolean;
  status: string;
  identifier: string;
  createdAt: string;
  avatar?: string;
  totalSpent?: number;
  orderCount?: number;
  averageCheck?: number;
}

export interface UserListParams {
  limit?: number;
  page?: number;
  search?: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  meta: {
    totalItems: number;
    itemCount: number;
    total: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: File;
}

export const UserService = {
  /**
   * Get all users with pagination and search
   */
  getUsers: async (params?: UserListParams): Promise<UserListResponse> => {
    const response = await api.users.getAll(params);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string) => {
    const response = await api.users.getById(id);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: FormData) => {
    const response = await api.users.updateProfile(data);
    return response.data;
  },

  /**
   * Block a user
   */
  blockUser: async (id: string) => {
    const response = await api.users.blockUser(id);
    return response.data;
  },

  /**
   * Unblock a user
   */
  unblockUser: async (id: string) => {
    const response = await api.users.unblockUser(id);
    return response.data;
  },

  /**
   * Get user payment history
   */
  getUserPayments: async (id: string, params?: UserListParams) => {
    const response = await api.users.getUserPayments(id, params);
    return response.data;
  },
};
