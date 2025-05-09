import { api } from "@/lib/api-client";

export interface Coupon {
  id: number;
  code: string;
  discount: number;
  limit: number | null;
  used: number;
  active: boolean;
  created: string;
}

export interface CouponCreate {
  code: string;
  discount: number;
  limit?: number;
}

export interface CouponUpdate {
  code?: string;
  discount?: number;
  limit?: number;
  active?: boolean;
}

export const CouponService = {
  /**
   * Get all coupons
   */
  getCoupons: async () => {
    const response = await api.coupons.getAll();
    return response.data;
  },

  /**
   * Create a new coupon
   */
  createCoupon: async (data: CouponCreate) => {
    const response = await api.coupons.create(data);
    return response.data;
  },

  /**
   * Update an existing coupon
   */
  updateCoupon: async (id: number, data: CouponUpdate) => {
    const response = await api.coupons.update(id, data);
    return response.data;
  },

  /**
   * Delete a coupon
   */
  deleteCoupon: async (id: number) => {
    const response = await api.coupons.delete(id);
    return response.data;
  },

  /**
   * Check if a coupon code is valid
   */
  checkCoupon: async (code: string) => {
    const response = await api.coupons.check(code);
    return response.data;
  },
};
