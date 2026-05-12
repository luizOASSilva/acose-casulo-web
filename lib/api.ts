const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

function getXsrfToken(): string {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]
      ?.replace(/%3D/g, '=') ?? ''
  );
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  withCsrf = false
): Promise<T> {
  if (withCsrf) {
    await getCsrfCookie();
  }

  const url = `${API_URL}/api${endpoint}`;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': getXsrfToken(),
      ...(options.headers || {}),
    },
    ...options,
  });

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
