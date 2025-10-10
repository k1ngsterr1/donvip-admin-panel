export interface DesignService {
  id: number;
  service_key: string;
  title: string;
  description?: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDesignServiceDto {
  service_key: string;
  title: string;
  description?: string;
  price: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateDesignServiceDto {
  service_key?: string;
  title?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdatePriceDto {
  price: number;
}
