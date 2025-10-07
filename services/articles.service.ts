import { api } from "@/lib/api-client";
import {
  Article,
  Tag,
  CreateArticleDto,
  UpdateArticleDto,
  CreateTagDto,
  UpdateTagDto,
  ArticleFilters,
  TagFilters,
} from "@/types/articles";

export class ArticlesService {
  // Articles methods
  static async getAllArticles(filters?: ArticleFilters) {
    const response = await api.articles.getAll(filters);
    return response.data;
  }

  static async searchArticles(
    query: string,
    filters?: Omit<ArticleFilters, "search">
  ) {
    const response = await api.articles.search(query, filters);
    return response.data;
  }

  static async getArticleById(id: number) {
    const response = await api.articles.getById(id);
    return response.data;
  }

  static async getArticleBySlug(slug: string) {
    const response = await api.articles.getBySlug(slug);
    return response.data;
  }

  static async createArticle(data: CreateArticleDto) {
    const response = await api.articles.create(data);
    return response.data;
  }

  static async updateArticle(id: number, data: UpdateArticleDto) {
    const response = await api.articles.update(id, data);
    return response.data;
  }

  static async deleteArticle(id: number) {
    await api.articles.delete(id);
  }

  static async toggleArticlePublish(id: number) {
    const response = await api.articles.togglePublish(id);
    return response.data;
  }

  static async uploadFeaturedImage(file: File) {
    const response = await api.articles.uploadFeaturedImage(file);
    return response.data;
  }

  static async uploadContentImage(file: File) {
    const response = await api.articles.uploadContentImage(file);
    return response.data;
  }

  static async getArticlesByTag(
    tagSlug: string,
    filters?: Omit<ArticleFilters, "tag">
  ) {
    const response = await api.articles.getByTag(tagSlug, filters);
    return response.data;
  }

  // Tags methods
  static async getAllTags(filters?: TagFilters) {
    const response = await api.tags.getAll(filters);
    return response.data;
  }

  static async searchTags(query: string, filters?: Omit<TagFilters, "search">) {
    const response = await api.tags.search(query, filters);
    return response.data;
  }

  static async getTagById(id: number) {
    const response = await api.tags.getById(id);
    return response.data;
  }

  static async getTagBySlug(slug: string) {
    const response = await api.tags.getBySlug(slug);
    return response.data;
  }

  static async createTag(data: CreateTagDto) {
    const response = await api.tags.create(data);
    return response.data;
  }

  static async updateTag(id: number, data: UpdateTagDto) {
    const response = await api.tags.update(id, data);
    return response.data;
  }

  static async deleteTag(id: number) {
    await api.tags.delete(id);
  }

  // Utility methods
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  static validateArticleData(
    data: CreateArticleDto | UpdateArticleDto
  ): string[] {
    const errors: string[] = [];

    if ("title" in data && (!data.title || data.title.trim().length === 0)) {
      errors.push("Заголовок обязателен");
    }

    if ("title" in data && data.title && data.title.length > 255) {
      errors.push("Заголовок не должен превышать 255 символов");
    }

    if ("slug" in data && (!data.slug || data.slug.trim().length === 0)) {
      errors.push("URL (slug) обязателен");
    }

    if (
      "content" in data &&
      data.is_published &&
      (!data.content || data.content.trim().length === 0)
    ) {
      errors.push("Содержание обязательно для публикации");
    }

    if (
      "meta_title" in data &&
      data.meta_title &&
      data.meta_title.length > 60
    ) {
      errors.push("Meta Title не должен превышать 60 символов");
    }

    if (
      "meta_description" in data &&
      data.meta_description &&
      data.meta_description.length > 160
    ) {
      errors.push("Meta Description не должно превышать 160 символов");
    }

    return errors;
  }

  static validateTagData(data: CreateTagDto | UpdateTagDto): string[] {
    const errors: string[] = [];

    if ("name" in data && (!data.name || data.name.trim().length === 0)) {
      errors.push("Название тега обязательно");
    }

    if ("name" in data && data.name && data.name.length > 50) {
      errors.push("Название тега не должно превышать 50 символов");
    }

    if ("slug" in data && (!data.slug || data.slug.trim().length === 0)) {
      errors.push("URL (slug) тега обязателен");
    }

    return errors;
  }
}
