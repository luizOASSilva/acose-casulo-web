import { useEffect, useState } from 'react';
import { getDashboard } from '@/services/admin/dashboard';
import type { DashboardData, UseDashboardReturn } from '@/types/dashboard';

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const json = await getDashboard();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [trigger]);

  return { data, loading, error, refetch: () => setTrigger((t) => t + 1) };
}
