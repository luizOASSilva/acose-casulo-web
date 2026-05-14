const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.luizoassilva.xyz';

// Função auxiliar para ler o cookie XSRF-TOKEN enviado pelo Laravel
function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
}

async function ensureCSRF() {
  // Faz a chamada inicial para o Laravel gerar o cookie de sessão e o token CSRF
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

  // Se for uma requisição que altera dados, garante que temos o cookie antes
  if (needsCSRF) {
    await ensureCSRF();
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Mantém o envio de cookies para subdomínios
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // NOVIDADE: Envia o token CSRF no cabeçalho. O Laravel exige isso para validar a requisição.
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '', 
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
