export interface Banner {
  id: number;
  image: string;
  mobileImage: string;
  buttonLink: string;
  title: string;
}

export interface CreateBannerDto {
  image: string;
  mobileImage: string;
  buttonLink: string;
  title: string;
}

export interface CreateBannerFormData {
  pcImageFile?: File;
  mobileImageFile?: File;
  buttonLink: string;
  title: string;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {
  image?: string;
  mobileImage?: string;
  buttonLink?: string;
  title?: string;
}
