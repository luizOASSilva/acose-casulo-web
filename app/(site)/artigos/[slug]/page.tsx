import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getArticleBySlug } from '@/services/articles';
import UserBadge from '@/components/ui/UserBadge';
import KeywordBadge from '@/components/ui/KeywordBadge';
import BackButton from '@/components/ui/BackButton';
import { OG_IMAGE } from '@/lib/config';

interface ParamProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ParamProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artigo não encontrado',
    };
  }

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `/artigos/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `/artigos/${slug}`,
      type: 'article',
      images: article.media?.url
        ? {
            url: article.media.url,
            width: 1200,
            height: 630,
            alt: article.media.alt_text || article.title,
          }
        : OG_IMAGE,
    },
  };
}

export default async function Artigo({ params }: ParamProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const hasImage = Boolean(article.media?.url);

  return (
    <main className="mx-auto w-[90%] max-w-3xl py-20">
      <BackButton href="/artigos" label="Todos os artigos" />

      <article
        aria-labelledby="article-title"
        className="mt-8 w-full overflow-hidden"
      >
        <header className="mb-10 space-y-6">
          {article.keywords && article.keywords.length > 0 && (
            <ul
              className="flex flex-wrap gap-2"
              aria-label="Palavras-chave do artigo"
            >
              {article.keywords.map((keyword) => (
                <KeywordBadge keyword={keyword} key={keyword} />
              ))}
            </ul>
          )}

          <h1
            id="article-title"
            className="break-words text-3xl font-bold leading-tight text-gray-900 md:text-4xl"
          >
            {article.title}
          </h1>

          <UserBadge
            name={article.author?.name || 'Equipe Acose Casulo'}
            subtitle={new Date(article.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          />

          {hasImage && (
            <figure className="w-full overflow-hidden">
              <div className="relative h-72 w-full overflow-hidden rounded-md bg-gray-50 md:h-96">
                <Image
                  src={article.media?.url || ''}
                  alt={article.media?.alt_text || article.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>

              {article.media?.caption && (
                <figcaption className="px-3 py-3 text-center text-xs leading-relaxed text-gray-600">
                  {article.media.caption}
                </figcaption>
              )}
            </figure>
          )}
        </header>

        <div className="w-full max-w-full overflow-hidden">
          <div
            className="
              prose prose-gray max-w-none
              prose-headings:font-bold prose-headings:text-gray-950
              prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-2xl
              prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-xl
              prose-p:text-gray-700 prose-p:text-lg prose-p:leading-relaxed
              prose-a:text-primary prose-a:font-semibold prose-a:underline prose-a:underline-offset-4
              prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-1 prose-li:text-gray-700
              prose-li:marker:text-primary
              break-words [overflow-wrap:anywhere]
              [&_p:empty]:hidden
              [&_li>p]:mb-0
            "
            dangerouslySetInnerHTML={{
              __html: article.content || '<p>Sem conteúdo.</p>',
            }}
          />
        </div>
      </article>
    </main>
  );
}
