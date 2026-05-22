import { cookies } from 'next/headers';

import ActivityDetailsContainer from '@/components/containers/ActivityDetailsContainer';
import { getOccupiedActivitySchedules } from '@/services/activities';
import type { Activity } from '@/types/activity';

export const dynamic = 'force-dynamic';

export default async function AdminNovaAtividadePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const occupiedSchedules = await getOccupiedActivitySchedules(cookieHeader);

  const blankActivitySkeleton: Activity = {
    id: 0,
    slug: 'new',
    title: '',
    content: '',
    schedules: [],
    media: {
      url: '',
      alt_text: 'Capa da atividade',
      caption: '',
    },
    created_at: new Date().toISOString(),
  };

  return (
    <ActivityDetailsContainer
      activity={blankActivitySkeleton}
      isAdmin={true}
      isNew={true}
      startInEditMode={true}
      occupiedSchedules={occupiedSchedules}
    />
  );
}
