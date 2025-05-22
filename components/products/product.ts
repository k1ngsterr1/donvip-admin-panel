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
  image?: string;
  images?: string[];
  replenishment: ReplenishmentOption[] | string;
  smile_api_game?: string;
  type?: string;
  currency_image?: string;
  currency_name?: string;
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
