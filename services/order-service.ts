import { api } from "@/lib/api-client";
import type {
  DonatBankCreateOrderDto,
  DonatBankOrderResponse,
} from "@/lib/api-client";

export interface Order {
  id: string;
  price: number;
  amount: number;
  type: string;
  payment: string;
  account_id?: string;
  server_id?: string;
  status: string;
  date: string;
  customer: string;
}

export interface OrderListParams {
  limit?: number;
  page?: number;
}

export interface OrderAnalytics {
  ordersByMonth: Array<{ name: string; total: number }>;
  packagesPurchased: Array<{ name: string; count: number }>;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export const OrderService = {
  /**
   * Get all orders with pagination
   */
  getOrders: async (params?: OrderListParams) => {
    // Set default limit to one million if not specified
    const defaultParams = {
      limit: 100000,
      ...params,
    };
    const response = await api.orders.getAll(defaultParams);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: number) => {
    const response = await api.orders.getById(id);
    return response.data;
  },

  /**
   * Create a new order
   */
  createOrder: async (data: any) => {
    const response = await api.orders.create(data);
    return response.data;
  },

  /**
   * Delete an order
   */
  deleteOrder: async (id: number) => {
    const response = await api.orders.delete(id);
    return response.data;
  },

  /**
   * Get order analytics
   */
  getAnalytics: async (): Promise<OrderAnalytics> => {
    const response = await api.orders.getAnalytics();
    return response.data;
  },

  getMonthlyPayments: async (): Promise<any> => {
    const response = await api.orders.getMonthlyPayments();
    return response.data;
  },

  getAllForAdmin: async ({
    page,
    limit = 100000, // Set default limit to one million
    removeDuplicates = true, // Enable duplicate filtering by default
  }: { page?: number; limit?: number; removeDuplicates?: boolean } = {}) => {
    const res = await api.orders.getAllForAdmin({
      page,
      limit,
      removeDuplicates,
    });
    return res.data;
  },

  /**
   * Create DonatBank order
   */
  createDonatBankOrder: async (
    data: DonatBankCreateOrderDto
  ): Promise<DonatBankOrderResponse> => {
    const response = await api.orders.createDonatBankOrder(data);
    return response.data;
  },
};
