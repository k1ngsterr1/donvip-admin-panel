// Article types for API integration
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  author_id?: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  tags: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  author_id?: number;
  tag_ids?: number[]; // Array of tag IDs
}

export interface UpdateArticleDto {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  tag_ids?: number[]; // Array of tag IDs
}

export interface CreateTagDto {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  is_published?: boolean;
  author_id?: number;
}

export interface TagFilters {
  page?: number;
  limit?: number;
  search?: string;
}
