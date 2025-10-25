import { api } from "@/lib/api-client";

export interface PaymentMethod {
  id: number;
  name: string;
  code: string; // Changed to match form field name
  country: string;
  currency: string;
  icon?: string | null; // Added icon field from API response
  sortOrder?: number; // Added sortOrder field from API response
  minAmount?: number;
  maxAmount?: number;
  fee?: number;
  isActive: boolean;
  isMoneta?: boolean; // Flag for Moneta payment methods
  isDukPay?: boolean; // Flag for DukPay payment methods
  isPay4Game?: boolean; // Flag for Pay4Game payment methods
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
  isMoneta?: boolean;
  isDukPay?: boolean;
  isPay4Game?: boolean;
  description?: string;
  icon?: string;
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
  isMoneta?: boolean;
  isDukPay?: boolean;
  isPay4Game?: boolean;
  description?: string;
  icon?: string;
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
    // Handle if API returns array directly or wrapped in data object
    const responseData = response.data;
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        total: responseData.length,
      };
    }
    return responseData;
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

  /**
   * Upload icon for payment method creation
   */
  uploadIcon: async (
    file: File
  ): Promise<{ iconPath: string; message: string }> => {
    const response = await api.paymentMethods.uploadIcon(file);
    return response.data;
  },

  /**
   * Update existing payment method icon
   */
  updateIcon: async (id: number, file: File): Promise<PaymentMethod> => {
    const response = await api.paymentMethods.updateIcon(id, file);
    return response.data;
  },

  /**
   * Delete payment method icon
   */
  deleteIcon: async (id: number): Promise<void> => {
    const response = await api.paymentMethods.deleteIcon(id);
    return response.data;
  },
};
