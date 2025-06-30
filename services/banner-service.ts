import { apiClient } from "@/lib/api-client";
import { extractErrorMessage } from "@/lib/utils";
import {
  Banner,
  CreateBannerDto,
  CreateBannerFormData,
  UpdateBannerDto,
} from "@/components/banners/banner.types";

/**
 * Banner Service
 *
 * This service provides multiple approaches for banner creation:
 *
 * 1. createWithFormData - Recommended approach that sends files and data in a single request
 *    Requires your NestJS controller to accept FormData with FileFieldsInterceptor
 *
 * 2. createWithFiles - Two-step approach that creates banner first, then uploads files
 *    Works with your current controller structure
 *
 * 3. create - Basic creation with URLs (for when you already have image URLs)
 */
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

  // Method 1: Create banner with FormData (if your backend supports multipart in POST /banners)
  createWithFormData: async (data: CreateBannerFormData): Promise<Banner> => {
    try {
      const formData = new FormData();

      // Add button link
      formData.append("buttonLink", data.buttonLink);

      // Add title
      formData.append("title", data.title);

      // Add files if provided
      if (data.pcImageFile) {
        formData.append("image", data.pcImageFile);
      }

      if (data.mobileImageFile) {
        formData.append("mobileImage", data.mobileImageFile);
      }

      const response = await apiClient.post("/banners", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Method 2: Create banner then upload files (using your separate upload endpoints)
  createWithFiles: async (data: CreateBannerFormData): Promise<Banner> => {
    try {
      // First create the banner with placeholder URLs
      const createData: CreateBannerDto = {
        image: "https://placeholder.com/pc-image.jpg", // Placeholder URL
        mobileImage: "https://placeholder.com/mobile-image.jpg", // Placeholder URL
        buttonLink: data.buttonLink,
        title: data.title,
      };

      const response = await apiClient.post("/banners", createData);
      let banner: Banner = response.data;

      // Upload PC image if provided - this will replace the placeholder
      if (data.pcImageFile) {
        banner = await bannerService.uploadPcImage(banner.id, data.pcImageFile);
      }

      // Upload mobile image if provided - this will replace the placeholder
      if (data.mobileImageFile) {
        banner = await bannerService.uploadMobileImage(
          banner.id,
          data.mobileImageFile
        );
      }

      return banner;
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
