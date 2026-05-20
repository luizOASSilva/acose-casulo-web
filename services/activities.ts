import type { Activity, SaveActivityDTO } from '@/types/activity';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export function getVisitorId() {
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
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...getVisitorHeaders(),
    };

    const response = await fetch(`${API_URL}/activities`, {
      cache: 'no-store',
      headers,
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
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...getVisitorHeaders(),
    };

    const response = await fetch(`${API_URL}/activities/recent`, {
      cache: 'no-store',
      headers,
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
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...getVisitorHeaders(),
    };

    const response = await fetch(`${API_URL}/activities/${slug}`, {
      cache: 'no-store',
      headers,
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
    const response = await fetch(`${API_URL}/activities`, {
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
    const response = await fetch(`${API_URL}/activities/${activityId}`, {
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
    const response = await fetch(`${API_URL}/activities/${activityId}`, {
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
  activityId: number
): Promise<{
  liked: boolean;
  likes: number;
} | null> {
  try {
    const visitorId = getVisitorId();

    if (!visitorId) {
      throw new Error('Visitor ID não encontrado');
    }

    const response = await fetch(`${API_URL}/activities/${activityId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        visitor_id: visitorId,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao curtir atividade');
    }

    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
