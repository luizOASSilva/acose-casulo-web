const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface GetAdminActionLogsParams {
  busca?: string;
  action?: string;
  operation?: string;
  admin_id?: string;
  page?: number;
  per_page?: number;
}

export async function getAdminActionLogs(params: GetAdminActionLogsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.busca) searchParams.set('busca', params.busca);
  if (params.action) searchParams.set('action', params.action);
  if (params.operation) searchParams.set('operation', params.operation);
  if (params.admin_id) searchParams.set('admin_id', params.admin_id);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));

  const query = searchParams.toString();
  const url = `${BASE}/admin/action-logs${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Erro ${res.status}`);
  }

  return res.json();
}

export async function getAdminActionLogFilters() {
  const res = await fetch(`${BASE}/admin/action-logs/filters`, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Erro ${res.status}`);
  }

  return res.json();
}