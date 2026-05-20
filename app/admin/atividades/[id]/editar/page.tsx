
import { notFound } from 'next/navigation';
import { getActivityBySlug } from '@/services/activities';
import ActivityDetailsContainer from '@/components/containers/ActivityDetailsContainer';

interface ParamProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditActivityPage({ params }: ParamProps) {
  const { id } = await params;

  const activity = await getActivityBySlug(id);

  if (!activity) notFound();

  return <ActivityDetailsContainer key={`edit-${activity.id}`} activity={activity} isAdmin={true} startInEditMode={true} />;
}
