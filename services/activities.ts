import type { Activity } from '@/types/activity';

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

export async function getActivities(): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_URL}/activities`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
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
    const activities = await getActivities();

    return activities
      .sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();

        return dateB - dateA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getActivityBySlug(id: string): Promise<Activity | null> {
  try {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
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

export async function createActivity(data: {
  title: string;
  content: string;
  image_url?: string;
  image_description?: string;
  image_caption?: string;
}): Promise<Activity | null> {
  try {
    const response = await fetch(`${API_URL}/activities`, {
      method: 'POST',
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
  data: {
    title: string;
    content: string;
    image_url?: string;
    image_description?: string;
    image_caption?: string;
  }
): Promise<Activity | null> {
  try {
    const response = await fetch(`${API_URL}/activities/${activityId}`, {
      method: 'PUT',
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
