import { api } from "@/lib/api-client";

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
    const response = await api.orders.getAll(params);
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

  getAllForAdmin: async ({ page, limit }: { page: number; limit: number }) => {
    const res = await api.orders.getAllForAdmin();
    return res.data;
  },
};
