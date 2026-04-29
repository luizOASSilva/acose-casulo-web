import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { articles } from "../articles"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return {}
  return {
    title: `${article.title} | Acose Casulo`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [{ url: article.media.url, alt: article.media.alt_text }],
      type: "article",
    },
  }
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArtigoPage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  return (
    <main className="w-[90%] max-w-3xl mx-auto px-6 py-20">
      <article aria-labelledby="article-title">
        <header className="space-y-6 mb-10">
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-md bg-primary/10 text-primary"
              >
                {kw}
              </span>
            ))}
          </div>

          <h1
            id="article-title"
            className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
          >
            {article.title}
          </h1>

          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0"
            >
              {article.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{article.author.name}</p>
              <time dateTime={article.created_at} className="text-xs text-gray-400">
                {new Date(article.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>
          </div>
          <figure className="w-full rounded-sm overflow-hidden">
            <div className="relative w-full h-72 md:h-96">
              <Image
                src={article.media.url}
                alt={article.media.alt_text}
                fill
                className="object-cover"
                priority
              />
            </div>
            {article.media.caption && (
              <figcaption className="text-xs text-gray-600 text-center p-2">
                {article.media.caption}
              </figcaption>
            )}
          </figure>
        </header>

        <div className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-primary">
          {article.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-5">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  )
}
