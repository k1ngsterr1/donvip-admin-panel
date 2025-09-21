import { api, apiClient } from "@/lib/api-client";

export interface ReplenishmentItem {
  price: number;
  amount: number;
  type: string;
  sku?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  description_en?: string;
  image: string;
  replenishment: ReplenishmentItem[];
  smile_api_game?: string;
  donatbank_product_id?: string;
  type?: string;
  currency_image?: string;
  currency_name?: string;
  order_number?: number;
  isActive?: boolean; // Add active status field
  isServerRequired?: boolean; // Whether server ID is required
  requireUserId?: boolean; // Whether user ID is required
  requireServer?: boolean; // Whether server is required
  requireEmail?: boolean; // Whether email is required
  requireUID?: boolean; // Whether UID is required
}

export interface ProductListParams {
  limit?: number;
  page?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const ProductService = {
  /**
   * Get all products with pagination and search
   */
  getProducts: async (
    params?: ProductListParams
  ): Promise<ProductListResponse> => {
    const response = await api.products.getAll(params); // ✅ Just pass directly
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: number) => {
    const response = await api.products.getById(id);
    return response.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (data: FormData) => {
    const response = await api.products.create(data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: number, data: FormData) => {
    const response = await api.products.update(id, data);
    return response.data;
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: number) => {
    const response = await api.products.delete(id);
    return response.data;
  },

  /**
   * Get Smile products
   */
  getSmileProducts: async () => {
    const response = await api.products.getSmileProducts();
    return response.data;
  },

  /**
   * Get DonatBank products
   */
  getDonatBankProducts: async () => {
    const response = await api.products.getDonatBankProducts();
    return response.data;
  },

  /**
   * Get Smile SKU for a specific game
   */
  getSmileSKU: async (apiGame: string) => {
    const response = await api.products.getSmileSKU(apiGame);
    return response.data;
  },

  /**
   * Get DonatBank packages for a specific product (POST /product/donatbank/product/info)
   */
  getDonatBankPackages: async (productId: string) => {
    const response = await apiClient.post("/product/donatbank/product/info", {
      id: productId,
    });
    return response.data;
  },

  /**
   * Toggle product active status
   */
  toggleProductActive: async (id: number) => {
    const response = await api.products.toggleActive(id);
    return response.data;
  },

  /**
   * Activate a product
   */
  activateProduct: async (id: number) => {
    const response = await api.products.activate(id);
    return response.data;
  },

  /**
   * Deactivate a product
   */
  deactivateProduct: async (id: number) => {
    const response = await api.products.deactivate(id);
    return response.data;
  },

  /**
   * Get only active products
   */
  getActiveProducts: async (
    params?: ProductListParams
  ): Promise<ProductListResponse> => {
    const response = await api.products.getActive(params);
    return response.data;
  },
};
