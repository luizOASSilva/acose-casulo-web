import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/services/articles";
import UserBadge from "@/components/ui/UserBadge";
import KeywordBadge from "@/components/ui/KeywordBadge";

interface ParamProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ParamProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Artigo não encontrado" };

  return {
    title: `${article.title} | Acose Casulo`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.media?.url ? [{ url: article.media.url, alt: article.media.alt_text }] : [],
      type: "article",
    },
  };
}

export default async function ArtigoPage({ params }: ParamProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <main className="w-[90%] max-w-3xl mx-auto px-6 py-20">
      <article aria-labelledby="article-title">
        <header className="space-y-6 mb-10">
          {article.keywords && article.keywords.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {article.keywords.map((kw) => (
                <KeywordBadge keyword={kw} key={kw} />
              ))}
            </ul>
          )}

          <h1 id="article-title" className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          <UserBadge
            name={article.author?.name || "Equipe Acose Casulo"}
            subtitle={new Date(article.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />

          <figure className="w-full rounded-xl overflow-hidden border border-gray-100">
            <div className="relative w-full h-72 md:h-96 bg-gray-50">
              <Image
                src={article.media?.url || ""}
                alt={article.media?.alt_text || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {article.media?.caption && (
              <figcaption className="text-xs text-gray-500 text-center p-3 bg-gray-50">
                {article.media.caption}
              </figcaption>
            )}
          </figure>
        </header>

        <div className="prose prose-gray max-w-none">
          {article.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-gray-700 text-lg leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
