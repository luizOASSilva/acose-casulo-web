import { api } from '@/lib/api';
import type {
  DocumentInput,
  DocumentItem,
  DocumentCategory,
} from '@/types/document';

function normalizeDocuments(payload: any): DocumentItem[] {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.documents)) return payload.documents;

  return [];
}

function normalizeDocument(payload: any): DocumentItem | null {
  if (!payload) return null;

  if (payload?.data) return payload.data;

  if (payload?.document) return payload.document;

  return payload;
}

function normalizeCategories(payload: any): DocumentCategory[] {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.categories)) return payload.categories;

  return [];
}

export async function getDocuments(): Promise<DocumentItem[]> {
  try {
    const res = await api.get<any>('/documents');

    return normalizeDocuments(res);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return [];
  }
}

export async function getDocumentById(id: number): Promise<DocumentItem | null> {
  try {
    const res = await api.get<any>(`/documents/${id}`);

    return normalizeDocument(res);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    return null;
  }
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  try {
    const res = await api.get<any>('/document-categories');

    return normalizeCategories(res);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

export async function createDocument(
  data: DocumentInput
): Promise<DocumentItem | null> {
  try {
    const res = await api.post<any>('/documents', data);

    return normalizeDocument(res);
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    throw error;
  }
}

export async function updateDocument(
  id: number,
  data: Partial<DocumentInput>
): Promise<DocumentItem | null> {
  try {
    const res = await api.put<any>(`/documents/${id}`, data);

    return normalizeDocument(res);
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw error;
  }
}

export async function deleteDocument(id: number): Promise<boolean> {
  try {
    await api.delete(`/documents/${id}`);

    return true;
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    return false;
  }
}
