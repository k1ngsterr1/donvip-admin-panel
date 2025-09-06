import { api } from "@/lib/api-client";

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  country: string;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  fee?: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentMethodDto {
  name: string;
  code: string;
  country: string;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  fee?: number;
  isActive?: boolean;
  description?: string;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  code?: string;
  country?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  fee?: number;
  isActive?: boolean;
  description?: string;
}

export interface GetPaymentMethodsDto {
  country?: string;
  currency?: string;
  isActive?: boolean;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag?: string;
}

export interface PaymentMethodsResponse {
  data: PaymentMethod[];
  total: number;
  page?: number;
  limit?: number;
}

export const PaymentMethodService = {
  /**
   * Get all payment methods with filters
   */
  getPaymentMethods: async (
    params?: GetPaymentMethodsDto
  ): Promise<PaymentMethodsResponse> => {
    const response = await api.paymentMethods.getAll(params);
    return response.data;
  },

  /**
   * Get payment method by ID
   */
  getPaymentMethodById: async (id: number): Promise<PaymentMethod> => {
    const response = await api.paymentMethods.getById(id);
    return response.data;
  },

  /**
   * Create a new payment method
   */
  createPaymentMethod: async (
    data: CreatePaymentMethodDto
  ): Promise<PaymentMethod> => {
    const response = await api.paymentMethods.create(data);
    return response.data;
  },

  /**
   * Update an existing payment method
   */
  updatePaymentMethod: async (
    id: number,
    data: UpdatePaymentMethodDto
  ): Promise<PaymentMethod> => {
    const response = await api.paymentMethods.update(id, data);
    return response.data;
  },

  /**
   * Delete a payment method
   */
  deletePaymentMethod: async (id: number): Promise<void> => {
    const response = await api.paymentMethods.delete(id);
    return response.data;
  },

  /**
   * Get countries with payment methods
   */
  getCountriesWithPaymentMethods: async (): Promise<Country[]> => {
    const response = await api.paymentMethods.getCountries();
    return response.data;
  },

  /**
   * Get all supported countries
   */
  getAllSupportedCountries: async (): Promise<Country[]> => {
    const response = await api.paymentMethods.getSupportedCountries();
    return response.data;
  },
};
