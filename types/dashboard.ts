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
}

export interface DashboardRecentActivity {
  type:
    | 'article'
    | 'activity'
    | 'partner'
    | 'document'
    | 'donation'
    | 'media'
    | string;
  title: string;
  description: string;
  time: string;
  date?: string | null;
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
