import { api } from '@/lib/api';
import type { Activity } from '@/types/activity';

export async function getRecentActivities(): Promise<Activity[]> {
  try {
    const response = await api.get<any>('/activities/recent');

    return response?.data || response || [];
  } catch {
    return [];
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const response = await api.get<any>('/activities');

    return response?.data || response || [];
  } catch {
    return [];
  }
}

export async function getActivityBySlug(
  slug: string
): Promise<Activity | null> {
  try {
    const response = await api.get<any>(`/activities/${slug}`);

    return response?.data || response || null;
  } catch {
    return null;
  }
}
