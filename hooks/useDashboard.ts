import { useEffect, useState } from 'react';

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

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }

        const json: DashboardData = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [trigger]);

  const refetch = () => setTrigger((t) => t + 1);

  return { data, loading, error, refetch };
}
