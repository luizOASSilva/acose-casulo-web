import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types/article';
import KeywordBadge from '@/components/ui/KeywordBadge';

export default function ArticleRow({ article }: { article: Article }) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(article.created_at));

  return (
    <Link
      href={`/artigos/${article.slug}`}
      aria-label={`Ler artigo: ${article.title}, por ${article.author.name}`}
      className="
        group
        flex
        flex-row
        gap-4
        py-5
        rounded-2xl
        transition-colors
        duration-200
        hover:bg-black/0.5
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
      "
    >
      <div
        className="
          relative
          w-24
          h-24
          md:w-44
          md:h-32
          shrink-0
          rounded-2xl
          overflow-hidden
          bg-gray-100
        "
      >
        <Image
          src={article.media.url}
          alt={article.media.alt_text}
          fill
          sizes="(max-width: 768px) 96px, 176px"
          className="
            object-cover
            transition-transform
            duration-300
            group-hover:scale-[1.02]
          "
        />

        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-2">
            {article.keywords.map((kw) => (
              <KeywordBadge keyword={kw} key={kw} />
            ))}
          </ul>

          <h2
            className="
              text-sm
              md:text-lg
              font-semibold
              tracking-tight
              text-gray-900
              leading-snug
              transition-colors
              duration-200
              group-hover:text-primary
              line-clamp-2
            "
          >
            {article.title}
          </h2>

          <p
            className="
              text-sm
              text-gray-600
              leading-relaxed
              line-clamp-2
            "
          >
            {article.summary}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              aria-hidden="true"
              className="
                w-5
                h-5
                md:w-6
                md:h-6
                rounded-full
                bg-primary/10
                text-primary
                text-[10px]
                font-bold
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              {article.author.name.charAt(0).toUpperCase()}
            </div>

            <span className="text-xs text-gray-700 truncate hidden sm:block">
              {article.author.name}
            </span>

            <span aria-hidden="true" className="text-gray-300 hidden sm:block">
              ·
            </span>

            <time
              dateTime={article.created_at}
              className="text-xs text-gray-600 shrink-0"
            >
              {formattedDate}
            </time>
          </div>

          <span
            aria-hidden="true"
            className="
              hidden
              sm:block
              text-xs
              font-medium
              text-primary
              opacity-0
              transition-opacity
              duration-200
              group-hover:opacity-100
              shrink-0
            "
          >
            Ler artigo →
          </span>
        </div>
      </div>
    </Link>
  );
}
