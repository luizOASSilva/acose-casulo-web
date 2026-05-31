import type {
  AdminActionLogDetailsResponse,
  AdminActionLogFiltersResponse,
  AdminActionLogsResponse,
  GetAdminActionLogsParams,
} from '@/types/admin/action-log';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000';

function buildActionLogQuery(params: GetAdminActionLogsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.busca) {
    searchParams.set('busca', params.busca);
  }

  if (params.action) {
    searchParams.set('action', params.action);
  }

  if (params.operation) {
    searchParams.set('operation', params.operation);
  }

  if (params.admin_id) {
    searchParams.set('admin_id', params.admin_id);
  }

  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  if (params.per_page) {
    searchParams.set('per_page', String(params.per_page));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

function buildHeaders(cookieHeader?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
    headers.Origin = FRONTEND_URL;
    headers.Referer = `${FRONTEND_URL}/admin/auditoria`;
  }

  return headers;
}

async function request<T>(
  endpoint: string,
  cookieHeader?: string
): Promise<T> {
  const response = await fetch(`${BASE}${endpoint}`, {
    headers: buildHeaders(cookieHeader),
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const data = await response.json();

      if (data?.message) {
        message = String(data.message);
      }
    } catch {}

    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getAdminActionLogs(
  params: GetAdminActionLogsParams = {},
  cookieHeader?: string
): Promise<AdminActionLogsResponse> {
  const query = buildActionLogQuery(params);

  return request<AdminActionLogsResponse>(
    `/admin/action-logs${query}`,
    cookieHeader
  );
}

export async function getAdminActionLogFilters(
  cookieHeader?: string
): Promise<AdminActionLogFiltersResponse> {
  return request<AdminActionLogFiltersResponse>(
    '/admin/action-logs/filters',
    cookieHeader
  );
}

export async function getAdminActionLog(
  id: number | string,
  cookieHeader?: string
): Promise<AdminActionLogDetailsResponse> {
  return request<AdminActionLogDetailsResponse>(
    `/admin/action-logs/${id}`,
    cookieHeader
  );
}