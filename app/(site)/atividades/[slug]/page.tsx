import { Metadata } from 'next';
import { getActivityBySlug } from '@/services/activities';
import ActivityDetail from '@/components/ui/ActivityDetail';
import { OG_IMAGE } from '@/lib/config';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const activity = await getActivityBySlug(params.slug);

  if (!activity) return { title: 'Atividade não encontrada' };

  const description = activity.content.substring(0, 160);

  return {
    title: activity.title,
    description,
    alternates: {
      canonical: `/atividades/${params.slug}`,
    },
    openGraph: {
      title: `${activity.title} | Acose Casulo`,
      description,
      url: `/atividades/${params.slug}`,
      type: 'article',
      images: activity.media?.url
        ? {
            url: activity.media.url,
            width: 1200,
            height: 630,
            alt: activity.media.alt_text,
          }
        : OG_IMAGE,
    },
  };
}

export default async function Page({ params }: Props) {
  const activity = await getActivityBySlug(params.slug);

  if (!activity) return null;

  return (
    <main className="w-[90%] mx-auto py-20">
      <ActivityDetail
        activity={activity}
        onClose={() => (window.location.href = '/atividades')}
      />
    </main>
  );
}
