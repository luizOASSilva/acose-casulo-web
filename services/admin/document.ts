import { api } from '@/lib/api';

export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  featured: boolean;
  order?: number;
}

export interface DocumentItem {
  id: number;
  title: string;
  file_url: string;
  year: number | null;
  category_id: number;
  category: DocumentCategory;
  created_at: string;
}

export interface DocumentInput {
  title: string;
  file_url: string;
  category_id: number;
  year: number;
}

export async function getDocuments(): Promise<DocumentItem[]> {
  try {
    const res = await api.get<any>('/documents');
    return res?.data || res || [];
  } catch {
    return [];
  }
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  try {
    const res = await api.get<any>('/document-categories');
    return res?.data || res || [];
  } catch {
    return [];
  }
}

export async function createDocument(data: DocumentInput): Promise<DocumentItem | null> {
  try {
    const res = await api.post<any>('/documents', data);
    return res?.data || res;
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    throw error; 
  }
}

export async function updateDocument(id: number, data: Partial<DocumentInput>): Promise<DocumentItem | null> {
  try {
    const res = await api.put<any>(`/documents/${id}`, data);
    return res?.data || res;
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw error;
  }
}

export async function deleteDocument(id: number): Promise<boolean> {
  try {
    await api.delete(`/documents/${id}`);
    return true;
  } catch {
    return false;
  }
}