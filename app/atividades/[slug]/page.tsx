import { Metadata } from 'next';
import { Suspense } from 'react';
import { getActivityBySlug } from '@/services/activities';
import ActivityModalClient from '@/components/modals/ActivityModalClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) return { title: 'Atividade não encontrada' };

  const description = activity.content.substring(0, 160);

  return {
    title: activity.title,
    description,
    alternates: {
      canonical: `/atividades/${slug}`,
    },
    openGraph: {
      title: `${activity.title} | Acose Casulo`,
      description,
      url: `/atividades/${slug}`,
      type: 'article',
    },
  };
}

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
