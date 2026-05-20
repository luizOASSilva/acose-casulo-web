import { api } from '@/lib/api';
import type { Article, SaveArticleDTO } from '@/types/article';

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
    return null;
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
    return null;
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
