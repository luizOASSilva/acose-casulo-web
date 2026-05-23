import { api } from '@/lib/api';

export type MediaCollection =
  | 'articles'
  | 'activities'
  | 'partners'
  | 'general';

export interface MediaFile {
  id: number;
  collection: MediaCollection;
  disk: string;
  original_name: string;
  filename: string;
  path: string;
  url: string;
  mime_type?: string | null;
  size: number;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface MediaCollectionResponse {
  data: MediaFile[];
}

interface MediaSingleResponse {
  data: MediaFile;
}

export async function getMediaFiles(
  collection: MediaCollection
): Promise<MediaFile[]> {
  try {
    const response = await api.get<MediaCollectionResponse>(
      `/media/${collection}`
    );

    return response.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar mídias:', error);
    return [];
  }
}

export async function uploadMediaFile(
  collection: MediaCollection,
  file: File
): Promise<MediaFile | null> {
  try {
    const formData = new FormData();

    formData.append('file', file);

    const response = await api.post<MediaSingleResponse>(
      `/media/${collection}`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mídia:', error);
    return null;
  }
}

export async function deleteMediaFile(
  collection: MediaCollection,
  mediaFileId: number
): Promise<boolean> {
  try {
    await api.delete(`/media/${collection}/${mediaFileId}`);

    return true;
  } catch (error) {
    console.error('Erro ao remover mídia:', error);
    return false;
  }
}
