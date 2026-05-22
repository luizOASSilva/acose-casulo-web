import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import {
  getActivityBySlug,
  getOccupiedActivitySchedules,
} from '@/services/activities';

import ActivityDetailsContainer from '@/components/containers/ActivityDetailsContainer';

export const dynamic = 'force-dynamic';

interface ParamProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditarAtividadePage({
  params,
}: ParamProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [activity, occupiedSchedules] = await Promise.all([
    getActivityBySlug(id),
    getOccupiedActivitySchedules(cookieHeader),
  ]);

  if (!activity) notFound();

  return (
    <ActivityDetailsContainer
      key={`edit-${activity.id}`}
      activity={activity}
      isAdmin={true}
      startInEditMode={true}
      occupiedSchedules={occupiedSchedules}
    />
  );
}
