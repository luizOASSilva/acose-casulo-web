import { api } from '@/lib/api';

export interface PartnerApiItem {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  bg_color: string | null;
  order: number | null;
  is_active: boolean;
  author?: {
    id?: number | null;
    name?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface SavePartnerInput {
  name: string;
  logo_path: string;
  website_url?: string | null;
  bg_color?: string | null;
  order?: number | null;
  is_active?: boolean;
}

function normalizePartners(payload: any): PartnerApiItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.partners)) return payload.partners;

  return [];
}

function normalizePartner(payload: any): PartnerApiItem | null {
  if (!payload) return null;
  if (payload?.data) return payload.data;
  if (payload?.partner) return payload.partner;

  return payload;
}

function partnerToFormData(data: SavePartnerInput, method?: 'PUT'): FormData {
  const formData = new FormData();

  if (method) {
    formData.append('_method', method);
  }

  formData.append('name', data.name);
  formData.append('logo_path', data.logo_path);
  formData.append('website_url', data.website_url || '');
  formData.append('bg_color', data.bg_color || '#ffffff');
  formData.append('order', String(data.order ?? 0));
  formData.append('is_active', data.is_active ? '1' : '0');

  return formData;
}

export function storageUrlToPath(url?: string | null): string {
  if (!url) return '';

  const marker = '/storage/';
  const index = url.indexOf(marker);

  if (index >= 0) {
    return url.slice(index + marker.length);
  }

  if (url.startsWith('storage/')) {
    return url.replace(/^storage\//, '');
  }

  return url;
}

export async function getPartners(): Promise<PartnerApiItem[]> {
  try {
    const response = await api.get<any>('/partners');

    return normalizePartners(response);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    return [];
  }
}

export async function getPartnerById(id: number): Promise<PartnerApiItem | null> {
  try {
    const partners = await getPartners();

    return partners.find((partner) => Number(partner.id) === Number(id)) ?? null;
  } catch (error) {
    console.error(`Erro ao buscar parceiro ID ${id}:`, error);
    return null;
  }
}

export async function createPartner(
  data: SavePartnerInput
): Promise<PartnerApiItem | null> {
  try {
    const response = await api.post<any>(
      '/partners',
      partnerToFormData(data)
    );

    return normalizePartner(response);
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro ao criar parceiro.');
  }
}

export async function updatePartner(
  id: number,
  data: SavePartnerInput
): Promise<PartnerApiItem | null> {
  try {
    const response = await api.post<any>(
      `/partners/${id}`,
      partnerToFormData(data, 'PUT')
    );

    return normalizePartner(response);
  } catch (error) {
    console.error(`Erro ao atualizar parceiro ID ${id}:`, error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro ao atualizar parceiro.');
  }
}

export async function deletePartner(id: number): Promise<boolean> {
  try {
    await api.delete(`/partners/${id}`);

    return true;
  } catch (error) {
    console.error(`Erro ao remover parceiro ID ${id}:`, error);
    return false;
  }
}
