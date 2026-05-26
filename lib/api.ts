const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type RequestBody =
  | BodyInit
  | Record<string, unknown>
  | unknown[]
  | null
  | undefined;

interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  body?: RequestBody;
}

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

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams ||
    isFormData(body)
  );
}

async function ensureCSRF(): Promise<void> {
  await fetch(`${getApiUrl()}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter(Boolean)
        .map(String);

      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    if (data?.message) {
      return String(data.message);
    }
  } catch {}

  return 'Erro na requisição';
}

async function request<T>(
  endpoint: string,
  options: ApiRequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCSRF) {
    await ensureCSRF();
  }

  const xsrfToken = getCookie('XSRF-TOKEN');
  const requestBody = options.body;
  const hasBody = requestBody !== undefined && requestBody !== null;

  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', xsrfToken);
  }

  let body: BodyInit | undefined;

  if (hasBody) {
    if (isFormData(requestBody)) {
      body = requestBody;
      headers.delete('Content-Type');
    } else if (isBodyInit(requestBody)) {
      body = requestBody;
    } else {
      body = JSON.stringify(requestBody);
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...options,
    method,
    body,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (response.status === 419) {
    throw new Error('CSRF_ERROR');
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, options?: Omit<ApiRequestInit, 'method'>) =>
    request<T>(url, {
      ...options,
      method: 'GET',
    }),

  post: <T>(
    url: string,
    body?: RequestBody,
    options?: Omit<ApiRequestInit, 'method' | 'body'>
  ) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body,
    }),

  put: <T>(
    url: string,
    body?: RequestBody,
    options?: Omit<ApiRequestInit, 'method' | 'body'>
  ) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body,
    }),

  patch: <T>(
    url: string,
    body?: RequestBody,
    options?: Omit<ApiRequestInit, 'method' | 'body'>
  ) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body,
    }),

  delete: <T>(url: string, options?: Omit<ApiRequestInit, 'method'>) =>
    request<T>(url, {
      ...options,
      method: 'DELETE',
    }),
};
