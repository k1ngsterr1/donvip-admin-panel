import { api } from "@/lib/api-client";

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
  image: string;
  replenishment: ReplenishmentItem[];
  smile_api_game?: string;
  type?: string;
}

export interface ProductListParams {
  limit?: number;
  page?: number;
  search?: string;
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
   * Get Smile SKU for a specific game
   */
  getSmileSKU: async (apiGame: string) => {
    const response = await api.products.getSmileSKU(apiGame);
    return response.data;
  },
};
