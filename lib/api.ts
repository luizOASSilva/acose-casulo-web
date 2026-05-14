const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luizoassilva.xyz';

async function ensureCSRF() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {

  const method = (options.method || 'GET').toUpperCase();

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

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
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

export const api = {
  get: <T>(url: string) =>
    request<T>(url, { method: 'GET' }),

  post: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};