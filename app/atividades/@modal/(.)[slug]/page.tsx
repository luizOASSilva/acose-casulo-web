import { getActivityBySlug } from "@/services/activities";
import ActivityModalClient from "@/components/Modals/ActivityModalClient";
import { Metadata } from "next";
import { Suspense } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);

  if (!activity) return { title: "Atividade não encontrada" };

  const fullTitle = `${activity.title} | Projeto Casulo`;
  const fullDesc = activity.content.substring(0, 160);

  return {
    title: fullTitle,
    description: fullDesc,
    openGraph: {
      title: fullTitle,
      description: fullDesc,
      url: `https://seusite.com.br/activity/${slug}`,
      siteName: "Projeto Casulo",
      locale: "pt_BR",
      type: "article",
      images: [{ url: activity.media.url, width: 1200, height: 630, alt: activity.media.alt_text }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug); 

  return (
    <Suspense fallback={null}>
      <ActivityModalClient activity={activity} />
    </Suspense>
  );
}
