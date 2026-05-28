export interface DashboardAnalytics {
  visitors: number | string;
  visitors_growth?: string;
  donations: number | string;
  donations_growth?: string;
  articles_read: number | string;
  conversion: number | string;
  conversion_growth?: string;
}

export interface DashboardCms {
  articles: number;
  activities: number;
  partners: number;
  documents: number;
  media?: number;
}

export interface DashboardStatus {
  api?: string;
  analytics?: string;
  last_sync?: string;
}

export interface DashboardRecentActivityAdmin {
  id?: number | null;
  name?: string | null;
  role?: string | null;
}

export interface DashboardRecentActivitySubject {
  type?: string | null;
  id?: number | null;
  name?: string | null;
}

export interface DashboardRecentActivity {
  id?: number | null;

  admin?: DashboardRecentActivityAdmin;

  action: string;
  type?: string;

  subject?: DashboardRecentActivitySubject;

  title: string;
  description: string;

  properties?: Record<string, unknown>;

  ip_address?: string | null;

  time: string;
  date?: string | null;
  created_at?: string | null;
}

export interface DashboardData {
  analytics: DashboardAnalytics;
  cms: DashboardCms;
  status: DashboardStatus;
  recent_activity?: DashboardRecentActivity[];
}

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
