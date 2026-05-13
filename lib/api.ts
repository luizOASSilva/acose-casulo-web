const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function ensureCsrf(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  withCsrf = false,
): Promise<T> {
  if (withCsrf) {
    await ensureCsrf();
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 401) {
    throw new Error('Não autenticado');
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
