import { api } from '@/lib/api';

import type {
  Activity,
  AdminActivityFilters,
  OccupiedActivitySchedule,
  PaginatedActivitiesResponse,
  SaveActivityDTO,
} from '@/types/activity';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ToggleActivityLikeResponse = {
  liked: boolean;
  likes: number;
  likes_count: number;
};

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

function normalizeActivities(payload: any): Activity[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.activities)) return payload.activities;

  return [];
}

function normalizeActivity(payload: any): Activity | null {
  if (!payload) return null;
  if (payload?.data) return payload.data;
  if (payload?.activity) return payload.activity;

  return payload;
}

function normalizePaginatedActivities(
  payload: any
): PaginatedActivitiesResponse {
  return {
    data: normalizeActivities(payload),
    meta: {
      current_page: Number(
        payload?.meta?.current_page ?? payload?.current_page ?? 1
      ),
      from: payload?.meta?.from ?? payload?.from ?? null,
      last_page: Number(payload?.meta?.last_page ?? payload?.last_page ?? 1),
      per_page: Number(payload?.meta?.per_page ?? payload?.per_page ?? 9),
      to: payload?.meta?.to ?? payload?.to ?? null,
      total: Number(payload?.meta?.total ?? payload?.total ?? 0),
    },
    links: payload?.links,
  };
}

function mapOrderToApi(ordem?: string): string {
  const map: Record<string, string> = {
    recentes: 'recent',
    antigas: 'oldest',
    curtidas: 'likes',
    az: 'az',
  };

  return map[ordem || 'recentes'] || 'recent';
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  const key = 'acose_visitor_id';

  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

function getVisitorHeaders(): Record<string, string> {
  const visitorId = getVisitorId();

  if (!visitorId) return {};

  return {
    'X-Visitor-ID': visitorId,
  };
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const response = await fetch(`${getApiUrl()}/activities`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...getVisitorHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar atividades');
    }

    const payload = await response.json();

    return normalizeActivities(payload);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAdminActivities(
  filters: AdminActivityFilters = {},
  cookieHeader?: string
): Promise<PaginatedActivitiesResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.busca?.trim()) {
      params.set('q', filters.busca.trim());
    }

    if (filters.dia?.trim()) {
      params.set('weekday', filters.dia.trim());
    }

    if (filters.inicio?.trim()) {
      params.set('start_time', filters.inicio.trim());
    }

    if (filters.fim?.trim()) {
      params.set('end_time', filters.fim.trim());
    }

    params.set('sort', mapOrderToApi(filters.ordem));
    params.set('page', String(filters.page || 1));
    params.set('per_page', String(filters.per_page || 9));

    const response = await fetch(`${getApiUrl()}/activities?${params}`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar atividades do admin');
    }

    const payload = await response.json();

    return normalizePaginatedActivities(payload);
  } catch (error) {
    console.error(error);

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

export async function getRecentActivities(limit = 9): Promise<Activity[]> {
  try {
    const response = await fetch(`${getApiUrl()}/activities/recent`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...getVisitorHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar atividades recentes');
    }

    const payload = await response.json();

    return normalizeActivities(payload).slice(0, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  try {
    const response = await fetch(`${getApiUrl()}/activities/${slug}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...getVisitorHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar atividade');
    }

    const payload = await response.json();

    return normalizeActivity(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getOccupiedActivitySchedules(
  cookieHeader?: string
): Promise<OccupiedActivitySchedule[]> {
  try {
    const response = await fetch(`${getApiUrl()}/activities/schedules`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createActivity(
  data: SaveActivityDTO
): Promise<Activity | null> {
  try {
    const payload = await api.post<any>('/activities', data);

    return normalizeActivity(payload);
  } catch (error) {
    console.error('Erro ao criar atividade:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro ao criar atividade');
  }
}

export async function updateActivity(
  activityId: number,
  data: SaveActivityDTO
): Promise<Activity | null> {
  try {
    const payload = await api.put<any>(`/activities/${activityId}`, data);

    return normalizeActivity(payload);
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Erro ao atualizar atividade');
  }
}

export async function deleteActivity(activityId: number): Promise<boolean> {
  try {
    await api.delete<null>(`/activities/${activityId}`);

    return true;
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    return false;
  }
}

export async function toggleActivityLike(
  activityIdentifier: string | number
): Promise<ToggleActivityLikeResponse | null> {
  try {
    const payload = await api.post<any>(
      `/activities/${activityIdentifier}/like`,
      {
        visitor_id: getVisitorId(),
      },
      {
        headers: {
          ...getVisitorHeaders(),
        },
      }
    );

    const likesCount = Number(payload.likes_count ?? payload.likes ?? 0);

    return {
      liked: Boolean(payload.liked),
      likes: likesCount,
      likes_count: likesCount,
    };
  } catch (error) {
    console.error('Erro ao curtir atividade:', error);
    return null;
  }
}
