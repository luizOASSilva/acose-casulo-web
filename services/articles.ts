import { api } from '@/lib/api';

import type {
  AdminArticleFilters,
  Article,
  PaginatedArticlesResponse,
  SaveArticleDTO,
} from '@/types/article';

function normalizeArticles(response: any): Article[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.articles)) return response.articles;

  return [];
}

function normalizeArticle(response: any): Article | null {
  if (!response) return null;
  if (response?.data) return response.data;
  if (response?.article) return response.article;

  return response;
}

function normalizePaginatedArticles(response: any): PaginatedArticlesResponse {
  return {
    data: normalizeArticles(response),
    meta: {
      current_page: Number(
        response?.meta?.current_page ?? response?.current_page ?? 1
      ),
      from: response?.meta?.from ?? response?.from ?? null,
      last_page: Number(response?.meta?.last_page ?? response?.last_page ?? 1),
      per_page: Number(response?.meta?.per_page ?? response?.per_page ?? 9),
      to: response?.meta?.to ?? response?.to ?? null,
      total: Number(response?.meta?.total ?? response?.total ?? 0),
    },
    links: response?.links,
  };
}

function mapOrderToApi(ordem?: string): string {
  const map: Record<string, string> = {
    recentes: 'recent',
    antigas: 'oldest',
    az: 'az',
  };

  return map[ordem || 'recentes'] || 'recent';
}

export async function getRecentArticles(): Promise<Article[]> {
  try {
    const response = await api.get<any>('/articles/recent');

    return normalizeArticles(response);
  } catch (error) {
    console.error('Erro ao buscar artigos recentes:', error);
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await api.get<any>('/articles');

    return normalizeArticles(response);
  } catch (error) {
    console.error('Erro ao buscar listagem de artigos:', error);
    return [];
  }
}

export async function getAdminArticles(
  filters: AdminArticleFilters = {},
  cookieHeader?: string
): Promise<PaginatedArticlesResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.busca?.trim()) {
      params.set('q', filters.busca.trim());
    }

    if (filters.palavra?.trim()) {
      params.set('keyword', filters.palavra.trim());
    }

    params.set('sort', mapOrderToApi(filters.ordem));
    params.set('page', String(filters.page || 1));
    params.set('per_page', String(filters.per_page || 9));

    const response = await api.get<any>(`/articles?${params.toString()}`, {
      headers: cookieHeader
        ? {
            Cookie: cookieHeader,
          }
        : undefined,
    });

    return normalizePaginatedArticles(response);
  } catch (error) {
    console.error('Erro ao buscar artigos do admin:', error);

    return {
      data: [],
      meta: {
        current_page: 1,
        from: null,
        last_page: 1,
        per_page: 9,
        to: null,
        total: 0,
      },
    };
  }
}

export async function getArticleById(id: number): Promise<Article | null> {
  try {
    const response = await api.get<any>(`/articles/${id}`);

    return normalizeArticle(response);
  } catch (error) {
    console.error(`Erro ao buscar artigo com o ID ${id}:`, error);
    return null;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await api.get<any>(`/articles/${slug}`);

    return normalizeArticle(response);
  } catch (error) {
    console.error(`Erro ao buscar artigo com o slug ${slug}:`, error);
    return null;
  }
}

export async function createArticle(
  data: SaveArticleDTO
): Promise<Article | null> {
  try {
    const response = await api.post<any>('/articles', data);

    return normalizeArticle(response);
  } catch (error) {
    console.error('Erro ao criar novo artigo no Laravel:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro ao criar artigo');
  }
}

export async function updateArticle(
  id: number,
  data: SaveArticleDTO
): Promise<Article | null> {
  try {
    const response = await api.put<any>(`/articles/${id}`, data);

    return normalizeArticle(response);
  } catch (error) {
    console.error(`Erro ao atualizar o artigo ID ${id} no Laravel:`, error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro ao atualizar artigo');
  }
}

export async function deleteArticle(id: number): Promise<boolean> {
  try {
    await api.delete(`/articles/${id}`);

    return true;
  } catch (error) {
    console.error(`Erro ao deletar o artigo ID ${id}:`, error);
    return false;
  }
}
