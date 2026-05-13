import { getActivityBySlug } from '@/services/activities';
import ActivityModalClient from '@/components/modals/ActivityModalClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params; 

  const activity = await getActivityBySlug(slug);

  if (!activity) return null;

  return <ActivityModalClient activity={activity} />;
}
