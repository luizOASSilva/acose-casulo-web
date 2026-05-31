export interface GetAdminActionLogsParams {
  busca?: string;
  action?: string;
  operation?: string;
  admin_id?: string;
  page?: number;
  per_page?: number;
}

export interface AdminActionLogAdmin {
  id?: number | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface AdminActionLogSubject {
  type?: string | null;
  id?: number | null;
  name?: string | null;
}

export type AdminActionLogProperties = Record<string, unknown>;

export interface AdminActionLogDetails {
  id: number;
  action: string;
  title: string;
  description: string | null;
  time?: string;
  created_at?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  admin?: AdminActionLogAdmin | null;
  subject?: AdminActionLogSubject | null;
  properties?: AdminActionLogProperties | null;
}

export interface AdminActionLogItem {
  id?: number | null;
  action?: string;
  type?: string;
  title: string;
  description?: string | null;
  time?: string;
  created_at?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  admin?: AdminActionLogAdmin | null;
  subject?: AdminActionLogSubject | null;
  properties?: AdminActionLogProperties | null;
}

export interface AdminActionLogPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface AdminActionLogsResponse {
  data: AdminActionLogItem[];
  meta?: AdminActionLogPaginationMeta;
}

export interface AdminActionLogDetailsResponse {
  data: AdminActionLogDetails;
}

export interface AdminActionLogFilterAdmin {
  id: number;
  name: string;
}

export interface AdminActionLogFilterOption {
  value: string;
  label: string;
}

export interface AdminActionLogFiltersResponse {
  admins: AdminActionLogFilterAdmin[];
  types?: AdminActionLogFilterOption[];
  operations?: AdminActionLogFilterOption[];
}
