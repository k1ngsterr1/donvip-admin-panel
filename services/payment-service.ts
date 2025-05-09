import { api } from "@/lib/api-client";

export interface PagsmilePayinRequest {
  amount: string;
  order_id: string;
}

export const PaymentService = {
  /**
   * Create Pagsmile payin
   */
  createPagsmilePayin: async (data: PagsmilePayinRequest) => {
    const response = await api.payments.createPagsmilePayin(data);
    return response.data;
  },

  /**
   * Get T-bank payment URL
   */
  getTbankPaymentUrl: async (orderId: string) => {
    const response = await api.payments.getTbankPaymentUrl(orderId);
    return response.data;
  },
};
