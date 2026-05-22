import type { PublicSettings } from '@/types/public-settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

function normalizePublicSettings(payload: any): PublicSettings {
  if (!payload) return {};
  if (payload.data && typeof payload.data === 'object') return payload.data;

  return payload;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const response = await fetch(`${getApiUrl()}/settings/public`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar configurações públicas');
    }

    const payload = await response.json();

    return normalizePublicSettings(payload);
  } catch (error) {
    console.error(error);
    return {};
  }
}

export function isDonationEnabled(settings: PublicSettings): boolean {
  return String(settings.donation_enabled ?? '1') === '1';
}
