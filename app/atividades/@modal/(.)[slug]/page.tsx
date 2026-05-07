import { getActivityBySlug } from '@/services/activities';
import ActivityModalClient from '@/components/Modals/ActivityModalClient';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) return null;

  return (
    <Suspense fallback={null}>
      <ActivityModalClient activity={activity} />
    </Suspense>
  );
}
