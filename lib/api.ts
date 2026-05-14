const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luizoassilva.xyz';

async function ensureCSRF() {
  // Sanctum CSRF cookie (obrigatório pra POST/PUT/DELETE)
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  ignoreUnauthorized = false,
): Promise<T> {

  const method = (options.method || 'GET').toUpperCase();

  // 🔥 CSRF apenas para mutações (evita overhead em GET)
  const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCSRF) {
    await ensureCSRF();
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  // 🔐 não redireciona — só estado
  if (response.status === 401) {
    if (!ignoreUnauthorized) {
      throw new Error('UNAUTHORIZED');
    }
  }

  // 🔒 CSRF inválido
  if (response.status === 419) {
    throw new Error('CSRF_ERROR');
  }

  // ❌ erro genérico
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
