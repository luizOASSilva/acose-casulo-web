import { apiFetch } from '@/lib/api';
import type { TransparencyResponse } from '@/types/transparency';

export async function getTransparencyData(
  year?: number
): Promise<TransparencyResponse> {
  try {
    const query = year ? `?year=${year}` : '';

    const res = await apiFetch(`/transparency${query}`);

    return res.data || res;
  } catch (error) {
    console.error('Failed to load transparency data:', error);

    return {
      year: new Date().getFullYear(),
      years: [],
      categories: [],
      featured: null,
    };
  }
}
