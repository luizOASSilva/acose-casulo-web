const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const TOKEN_KEY = 'admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  ignoreUnauthorized = false,
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (!ignoreUnauthorized) {
      clearToken();
      const slug = process.env.NEXT_PUBLIC_PANEL_SLUG ?? '';
      window.location.href = `/acesso/${slug}`;
    }
    throw new Error('Não autenticado.');
  }

  if (response.status === 419) {
    throw new Error('Erro de sessão. Tente novamente.');
  }

  if (!response.ok) {
    let message = 'Erro na requisição';
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}
