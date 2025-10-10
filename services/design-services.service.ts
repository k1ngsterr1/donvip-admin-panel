import { api } from "@/lib/api-client";
import type {
  DesignService,
  CreateDesignServiceDto,
  UpdateDesignServiceDto,
  UpdatePriceDto,
} from "@/types/design-services";

export class DesignServicesService {
  static async getAll(): Promise<DesignService[]> {
    const response = await api.designServices.getAll();
    return response.data;
  }

  static async getById(id: number): Promise<DesignService> {
    const response = await api.designServices.getById(id);
    return response.data;
  }

  static async create(data: CreateDesignServiceDto): Promise<DesignService> {
    const response = await api.designServices.create(data);
    return response.data;
  }

  static async update(
    id: number,
    data: UpdateDesignServiceDto
  ): Promise<DesignService> {
    const response = await api.designServices.update(id, data);
    return response.data;
  }

  static async updatePrice(
    id: number,
    data: UpdatePriceDto
  ): Promise<DesignService> {
    const response = await api.designServices.updatePrice(id, data);
    return response.data;
  }

  static async updatePriceByKey(
    key: string,
    data: UpdatePriceDto
  ): Promise<DesignService> {
    const response = await api.designServices.updatePriceByKey(key, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.designServices.delete(id);
  }

  static async initialize(): Promise<{ message: string; count: number }> {
    const response = await api.designServices.initialize();
    return response.data;
  }
}
