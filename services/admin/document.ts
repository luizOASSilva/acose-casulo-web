import { api } from '@/lib/api';
import { DocumentInput, DocumentItem } from '@/types/document';
import { DocumentCategory } from '@/types/transparency';

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
