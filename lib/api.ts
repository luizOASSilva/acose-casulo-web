const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

function getXsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  return cookie ? decodeURIComponent(cookie) : '';
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  withCsrf = false,
  ignoreUnauthorized = false,
): Promise<T> {
  if (withCsrf) {
    await getCsrfCookie();
  }

  const xsrfToken = getXsrfToken();

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 401) {
    if (!ignoreUnauthorized) {
      const slug = process.env.NEXT_PUBLIC_PANEL_SLUG ?? '';
      window.location.href = `/acesso/${slug}`;
    }
    throw new Error('Não autenticado.');
  }

  if (response.status === 419) { 
    throw new Error('Erro de sessão. Tente novamente.');
  }

  if (!response.ok) {
    let errorMessage = 'Erro na requisição';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}
