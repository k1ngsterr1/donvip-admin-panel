export interface Banner {
  id: number;
  image: string;
  mobileImage: string;
  buttonLink: string;
}

export interface CreateBannerDto {
  image?: string;
  mobileImage?: string;
  buttonLink: string;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {
  image?: string;
  mobileImage?: string;
  buttonLink?: string;
}
