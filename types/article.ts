import type { ArticleSchemaData } from '@/schemas/article.schema';

export interface Article {
  id: number;
  slug: string;

  author: {
    name: string;
  };

  summary: string;
  title: string;
  content: string;

  media: {
    url: string;
    alt_text: string;
    caption?: string | null;
  };

  keywords: string[];

  created_at: string;
  updated_at?: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface PaginatedArticlesResponse {
  data: Article[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface AdminArticleFilters {
  busca?: string;
  palavra?: string;
  ordem?: 'recentes' | 'antigas' | 'az';
  page?: number;
  per_page?: number;
}

export interface ArticleListFilters {
  busca?: string;
  palavra?: string;
  ordem?: 'recentes' | 'antigas' | 'az';
}

export type SaveArticleDTO = ArticleSchemaData;
