import { activities } from "../../activity";
import ActivityModalClient from "./ActivityModalClient";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = activities.find((a) => a.slug === slug);

  if (!activity) return { title: "Atividade não encontrada" };

  const fullTitle = `${activity.title} | Projeto Casulo`;
  const fullDesc = activity.content.substring(0, 160);

  return {
    title: fullTitle,
    description: fullDesc,
    alternates: {
      canonical: `https://seusite.com.br/activity/${slug}`,
    },
    openGraph: {
      title: fullTitle,
      description: fullDesc,
      url: `https://seusite.com.br/activity/${slug}`,
      siteName: "Projeto Casulo",
      locale: "pt_BR",
      type: "article",
      images: [
        {
          url: activity.media.url,
          width: 1200,
          height: 630,
          alt: activity.media.alt_text,
        },
      ],
    },
  }
}

export default async function Page({ params }: Props) {
  return <ActivityModalClient params={params} />;
}