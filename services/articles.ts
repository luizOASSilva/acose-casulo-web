import { api } from '@/lib/api';
import type { Article } from '@/types/article';

export interface SaveArticleDTO {
  title: string;
  summary: string;
  content: string;
  image_url: string;
  image_description: string;
  keywords: string[];
}

export async function getRecentArticles(): Promise<Article[]> {
  try {
    const response = await api.get<any>('/articles/recent');
    return response?.data || response || [];
  } catch (error) {
    console.error("Erro ao buscar artigos recentes:", error);
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await api.get<any>('/articles');
    return response?.data || response || [];
  } catch (error) {
    console.error("Erro ao buscar listagem de artigos:", error);
    return [];
  }
}

export async function getArticleById(id: number): Promise<Article | null> {
  try {
    const response = await api.get<any>(`/articles/${id}`);
    return response?.data || response || null;
  } catch (error) {
    console.error(`Erro ao buscar artigo com o ID ${id}:`, error);
    return null;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await api.get<any>(`/articles/${slug}`);
    console.log('raw response:', JSON.stringify(response, null, 2));
    return response?.data || response || null;
  } catch (error) {
    console.error(`Erro ao buscar artigo com o slug ${slug}:`, error);
    return null;
  }
}

export async function createArticle(data: SaveArticleDTO): Promise<Article | null> {
  try {
    const response = await api.post<any>('/articles', data);
    return response?.data || response || null;
  } catch (error) {
    console.error("Erro ao criar novo artigo no Laravel:", error);
    return null;
  }
}

export async function updateArticle(id: number, data: SaveArticleDTO): Promise<Article | null> {
  try {
    const response = await api.put<any>(`/articles/${id}`, data);
    return response?.data || response || null;
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
