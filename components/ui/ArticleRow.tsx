import Link from "next/link"
import Image from "next/image"
import type { Article } from "@/types/article"

export default function ArticleRow({ article }: { article: Article }) {
  return (
    <Link
      href={`/artigos/${article.slug}`}
      aria-label={`Ler artigo: ${article.title}, por ${article.author.name}`}
      className="group flex flex-row gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="relative w-24 h-24 md:w-44 md:h-32 shrink-0 rounded-xl overflow-hidden">
        <Image
          src={article.media.url}
          alt={article.media.alt_text}
          fill
          sizes="(max-width: 768px) 96px, 176px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div className="space-y-1.5">
          <ul className="flex flex-wrap gap-1" aria-label="Palavras-chave">
            {article.keywords.map((kw) => (
              <li key={kw}>
                <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {kw}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="text-sm md:text-base font-semibold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              aria-hidden="true"
              className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0"
            >
              {article.author.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 truncate hidden sm:block">{article.author.name}</span>
            <span aria-hidden="true" className="text-gray-300 hidden sm:block">·</span>
            <time dateTime={article.created_at} className="text-xs text-gray-400 shrink-0">
              {new Date(article.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>

          <span
            aria-hidden="true"
            className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block"
          >
            Ler artigo →
          </span>
        </div>
      </div>
    </Link>
  )
}
