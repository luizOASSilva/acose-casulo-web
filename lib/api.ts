const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.split('=')[1] || '');
}

async function ensureCSRF(): Promise<void> {
  await fetch(`${getApiUrl()}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCSRF) {
    await ensureCSRF();
  }

  const xsrfToken = getCookie('XSRF-TOKEN');
  const hasBody = options.body !== undefined && options.body !== null;

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
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

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) =>
    request<T>(url, {
      method: 'GET',
    }),

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    }),

  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body ?? {}),
    }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }),

  delete: <T>(url: string) =>
    request<T>(url, {
      method: 'DELETE',
    }),
};
