import { api } from '@/lib/api';

import type {
  AdminPartnerFilters,
  PaginatedPartnersResponse,
  PartnerApiItem,
  PartnerStatusFilter,
  SavePartnerInput,
} from '@/types/partner';

function normalizePartnerLogoUrl(url?: string | null): string | null {
  if (!url) return null;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/storage/')
  ) {
    return url;
  }

  if (url.startsWith('storage/')) {
    return `/${url}`;
  }

  if (url.startsWith('media/partners/')) {
    return `/storage/${url}`;
  }

  return `/storage/media/partners/${url}`;
}

function normalizePartnerItem(partner: any): PartnerApiItem {
  const rawLogoUrl =
    partner?.logo_url ||
    partner?.logo_path ||
    partner?.logo ||
    null;

  return {
    id: Number(partner.id),
    name: partner.name,
    logo_path: partner.logo_path ?? null,
    logo_url: normalizePartnerLogoUrl(rawLogoUrl),
    website_url: partner.website_url ?? null,
    bg_color: partner.bg_color ?? '#ffffff',
    order: partner.order ?? null,
    is_active: Boolean(partner.is_active),
    author: partner.author ?? null,
    created_at: partner.created_at,
    updated_at: partner.updated_at,
  };
}

function normalizePartners(payload: any): PartnerApiItem[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizePartnerItem);
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.map(normalizePartnerItem);
  }

  if (Array.isArray(payload?.partners)) {
    return payload.partners.map(normalizePartnerItem);
  }

  return [];
}

function normalizePartner(payload: any): PartnerApiItem | null {
  if (!payload) return null;

  if (payload?.data) {
    return normalizePartnerItem(payload.data);
  }

  if (payload?.partner) {
    return normalizePartnerItem(payload.partner);
  }

  return normalizePartnerItem(payload);
}

function normalizePaginatedPartners(response: any): PaginatedPartnersResponse {
  return {
    data: normalizePartners(response),
    meta: {
      current_page: Number(
        response?.meta?.current_page ?? response?.current_page ?? 1
      ),
      from: response?.meta?.from ?? response?.from ?? null,
      last_page: Number(response?.meta?.last_page ?? response?.last_page ?? 1),
      per_page: Number(response?.meta?.per_page ?? response?.per_page ?? 18),
      to: response?.meta?.to ?? response?.to ?? null,
      total: Number(response?.meta?.total ?? response?.total ?? 0),
    },
    links: response?.links,
  };
}

function normalizeStatus(status?: string): PartnerStatusFilter {
  if (status === 'active' || status === 'inactive' || status === 'all') {
    return status;
  }

  return 'all';
}

export function storageUrlToPath(url?: string | null): string {
  if (!url) return '';

  const normalizedUrl = normalizePartnerLogoUrl(url);

  if (!normalizedUrl) return '';

  const marker = '/storage/';
  const index = normalizedUrl.indexOf(marker);

  if (index >= 0) {
    return normalizedUrl.slice(index + marker.length);
  }

  if (normalizedUrl.startsWith('storage/')) {
    return normalizedUrl.replace(/^storage\//, '');
  }

  if (normalizedUrl.startsWith('media/partners/')) {
    return normalizedUrl;
  }

  if (
    normalizedUrl.startsWith('http://') ||
    normalizedUrl.startsWith('https://')
  ) {
    return normalizedUrl;
  }

  return `media/partners/${normalizedUrl.replace(/^\/+/, '')}`;
}

function partnerToFormData(data: SavePartnerInput, method?: 'PUT'): FormData {
  const formData = new FormData();

  if (method) {
    formData.append('_method', method);
  }

  formData.append('name', data.name);
  formData.append('logo_path', storageUrlToPath(data.logo_path));
  formData.append('website_url', data.website_url || '');
  formData.append('bg_color', data.bg_color || '#ffffff');
  formData.append('order', String(data.order ?? 0));
  formData.append('is_active', data.is_active ? '1' : '0');

  return formData;
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

export async function getAdminPartners(
  filters: AdminPartnerFilters = {},
  cookieHeader?: string
): Promise<PaginatedPartnersResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.busca?.trim()) {
      params.set('q', filters.busca.trim());
    }

    const status = normalizeStatus(filters.status);

    if (status !== 'all') {
      params.set('status', status);
    }

    params.set('page', String(filters.page || 1));
    params.set('per_page', String(filters.per_page || 18));

    const response = await api.get<any>(
      `/admin/partners?${params.toString()}`,
      {
        headers: cookieHeader
          ? {
              Cookie: cookieHeader,
            }
          : undefined,
      }
    );

    return normalizePaginatedPartners(response);
  } catch (error) {
    console.error('Erro ao buscar parceiros do admin:', error);

    return {
      data: [],
      meta: {
        current_page: 1,
        from: null,
        last_page: 1,
        per_page: 18,
        to: null,
        total: 0,
      },
    };
  }
}

export async function getPartnerById(
  id: number,
  cookieHeader?: string
): Promise<PartnerApiItem | null> {
  try {
    if (cookieHeader) {
      const response = await api.get<any>(`/admin/partners/${id}`, {
        headers: {
          Cookie: cookieHeader,
        },
      });

      return normalizePartner(response);
    }

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
