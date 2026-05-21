import type { Activity, SaveActivityDTO } from '@/types/activity';

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

export async function createActivity(
  data: SaveActivityDTO
): Promise<Activity | null> {
  try {
    const response = await fetch(`${getApiUrl()}/activities`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar atividade');
    }

    const payload = await response.json();

    return normalizeActivity(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateActivity(
  activityId: number,
  data: SaveActivityDTO
): Promise<Activity | null> {
  try {
    const response = await fetch(`${getApiUrl()}/activities/${activityId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar atividade');
    }

    const payload = await response.json();

    return normalizeActivity(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteActivity(activityId: number): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/activities/${activityId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function toggleActivityLike(
  activityIdentifier: string | number
): Promise<ToggleActivityLikeResponse | null> {
  try {
    const response = await fetch(
      `${getApiUrl()}/activities/${activityIdentifier}/like`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...getVisitorHeaders(),
        },
        body: JSON.stringify({}),
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      console.error('Erro ao curtir atividade:', payload);
      return null;
    }

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
