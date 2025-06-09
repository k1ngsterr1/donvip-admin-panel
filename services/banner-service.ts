import { apiClient } from "@/lib/api-client";
import { extractErrorMessage } from "@/lib/utils";

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

export const bannerService = {
  getAll: async (): Promise<Banner[]> => {
    try {
      const response = await apiClient.get("/banners");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getById: async (id: number): Promise<Banner> => {
    try {
      const response = await apiClient.get(`/banners/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  create: async (data: CreateBannerDto): Promise<Banner> => {
    try {
      const response = await apiClient.post("/banners", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  update: async (id: number, data: UpdateBannerDto): Promise<Banner> => {
    try {
      const response = await apiClient.patch(`/banners/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/banners/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  uploadPcImage: async (id: number, file: File): Promise<Banner> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.patch(`/banners/${id}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  uploadMobileImage: async (id: number, file: File): Promise<Banner> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.patch(
        `/banners/${id}/mobile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  uploadImage: async (
    id: number,
    file: File,
    type: "pc" | "mobile"
  ): Promise<Banner> => {
    if (type === "pc") {
      return bannerService.uploadPcImage(id, file);
    } else {
      return bannerService.uploadMobileImage(id, file);
    }
  },

  updateButtonLink: async (id: number, buttonLink: string): Promise<Banner> => {
    try {
      const response = await apiClient.patch(`/banners/${id}`, { buttonLink });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
