import type { PublicSettings } from '@/types/public-settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

function normalizePublicSettings(payload: unknown): PublicSettings {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const data = payload as {
    data?: unknown;
  };

  if (data.data && typeof data.data === 'object') {
    return data.data as PublicSettings;
  }

  return payload as PublicSettings;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const response = await fetch(`${getApiUrl()}/settings/public`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },

      /**
       * Não usar cache: 'no-store' aqui.
       *
       * Esse service é usado em páginas/layouts públicos e pode ser chamado
       * durante o build, inclusive no /_not-found.
       * Com no-store ou revalidate: 0, o Next acusa Dynamic server usage.
       */
      next: {
        revalidate: 60,
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
