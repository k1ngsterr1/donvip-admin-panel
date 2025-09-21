export interface ReplenishmentOption {
  price: number;
  amount: number;
  type: string;
  sku?: string;
  error?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  description_en?: string;
  image?: string;
  images?: string[];
  replenishment: ReplenishmentOption[] | string;
  smile_api_game?: string;
  donatbank_product_id?: string;
  type?: string;
  currency_image?: string;
  currency_name?: string;
  order_number?: number;
  isActive?: boolean;
  isServerRequired?: boolean; // Whether server ID is required
  requireUserId?: boolean; // Whether user ID is required
  requireServer?: boolean; // Whether server is required
  requireEmail?: boolean; // Whether email is required
  requireUID?: boolean; // Whether UID is required
}

export interface ProductsResponse {
  data: {
    data: {
      data: Product[] | Product;
      total: number;
      page: number;
      lastPage: number;
    };
  };
}
