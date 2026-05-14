import { api } from '@/lib/api';
import type { Article } from '@/types/article';

export async function getRecentArticles(): Promise<Article[]> {
  try {
    const response = await api.get<any>('/articles/recent');

    return response?.data || response || [];
  } catch {
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await api.get<any>('/articles');

    return response?.data || response || [];
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await api.get<any>(`/articles/${slug}`);

    return response?.data || response || null;
  } catch {
    return null;
  }
}
