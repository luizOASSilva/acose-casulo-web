const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luizoassilva.xyz';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  ignoreUnauthorized = false,
): Promise<T> {

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (!ignoreUnauthorized) {
      throw new Error('UNAUTHORIZED');
    }
  }

  if (response.status === 419) {
    throw new Error('CSRF_ERROR');
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
