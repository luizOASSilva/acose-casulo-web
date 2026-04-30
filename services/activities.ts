import { apiFetch } from "@/lib/api";
import type { Activity } from "@/types/activity";

export async function getRecentActivities(): Promise<Activity[]> {
  try {
    const response = await apiFetch(`/activities/recent`, {
      next: { revalidate: Number(process.env.NEXT_CACHE_REVALIDATE_TIME) || 3600 },
    });
    console.log('response:', response);
    return response.data || response || [];
  } catch (error) {
    console.error("Erro DETALHADO ao carregar atividades recentes:", error);
    return [];
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const response = await apiFetch("/activities", {
      next: { revalidate: Number(process.env.NEXT_CACHE_REVALIDATE_TIME) || 3600 },
    });

    return response.data || response || [];
  } catch (error) {
    console.error("Erro ao carregar todas as atividades:", error);
    return [];
  }
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  try {
    const response = await apiFetch(`/activities/${slug}`, {
      next: { revalidate: Number(process.env.NEXT_CACHE_REVALIDATE_TIME) || 3600 },
    });

    return response.data || response || null;
  } catch (error) {
    console.error(`Erro ao carregar a atividade: ${slug}`, error);
    return null;
  }
}
