import { api } from '@/lib/api';
import type { TransparencyResponse } from '@/types/transparency';

export async function getTransparencyData(
  year?: number
): Promise<TransparencyResponse> {
  try {
    const query = year ? `?year=${year}` : '';

    const res = await api.get<any>(`/transparency${query}`);

    return res?.data || res;
  } catch {
    return {
      year: new Date().getFullYear(),
      years: [],
      categories: [],
      featured: null,
    };
  }
}
