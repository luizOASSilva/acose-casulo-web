export interface DashboardData {
  analytics: {
    visitors: string;
    visitors_growth: string;
    donations: number;
    donations_growth: string;
    articles_read: string;
    conversion: string;
    conversion_growth?: string;
  };
  cms: {
    articles: number;
    partners: number;
    activities: number;
    documents: number;
  };
  status: {
    api: string;
    analytics: string;
    last_deploy?: string;
    pending_drafts?: number;
  };
}

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
