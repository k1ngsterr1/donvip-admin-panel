export interface Banner {
  id: number;
  title: string;
  description?: string;
  image?: string;
  mobileImage?: string;
  link?: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  link?: string;
  isActive: boolean;
  order?: number;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {
  image?: string;
  mobileImage?: string;
}
