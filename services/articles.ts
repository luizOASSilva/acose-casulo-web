import { apiFetch } from '@/lib/api';
import type { Article } from '@/types/article';

export async function getRecentArticles(): Promise<Article[]> {
  try {
    const response = await apiFetch(`/articles/recent`, {
      next: {
        revalidate: Number(process.env.NEXT_CACHE_REVALIDATE_TIME) || 3600,
      },
    });

    return response.data || response || [];
  } catch (error) {
    console.error('Erro ao carregar artigos recentes:', error);
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await apiFetch('/articles', {
      next: {
        revalidate: Number(process.env.NEXT_CACHE_REVALIDATE_TIME) || 3600,
      },
    });

    return response.data || response || [];
  } catch (error) {
    console.error('Erro ao carregar todos os artigos:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await apiFetch(`/articles/${slug}`, {
      next: {
        revalidate: Number(process.env.NEXT_CACHE_REVALIDATE_TIME) || 3600,
      },
    });

    return response.data || response || null;
  } catch (error) {
    console.error(`Erro ao carregar o artigo: ${slug}`, error);
    return null;
  }
}
