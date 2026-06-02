import { api } from '@/lib/api';
import type { AdminAnalyticsSummary } from '@/types/admin/analytics';

export async function getAdminAnalyticsSummary(
  days = 30
): Promise<AdminAnalyticsSummary> {
  const safeDays = Math.min(Math.max(days, 1), 365);

  return api.get<AdminAnalyticsSummary>(
    `/admin/analytics/summary?days=${safeDays}`
  );
}
