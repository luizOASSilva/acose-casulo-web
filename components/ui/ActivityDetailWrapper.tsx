'use client';

import ActivityDetail from '@/components/ui/ActivityDetail';
import type { Activity } from '@/types/activity';

export default function ActivityDetailWrapper({ activity }: { activity: Activity }) {
  return (
    <main className="w-[90%] mx-auto py-20">
      <ActivityDetail
        activity={activity}
        onClose={() => (window.location.href = '/atividades')}
      />
    </main>
  );
}
