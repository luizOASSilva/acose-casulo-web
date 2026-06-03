import { FileText } from 'lucide-react';

import { Document } from '@/types/transparency';

interface TransparencySectionProps {
  number: string;
  title?: string;
  description?: string;
  documents?: Document[];
  variant?: 'light' | 'dark' | 'featured';
}

type DocumentWithDates = Document & {
  published_at?: string | null;
  document_date?: string | null;
  date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(parsed);
}

function getDocumentDate(doc: Document): string {
  const safeDoc = doc as DocumentWithDates;

  return (
    safeDoc.published_at ||
    safeDoc.document_date ||
    safeDoc.date ||
    safeDoc.created_at ||
    safeDoc.updated_at ||
    ''
  );
}

export default function TransparencySection({
  number,
  title,
  description,
  documents = [],
  variant = 'light',
}: TransparencySectionProps) {
  const isDark = variant === 'dark';
  const isFeatured = variant === 'featured';
  const isColored = isDark || isFeatured;

  return (
    <article
      aria-labelledby={`section-${number}`}
      className={`
        flex h-full min-h-[340px] w-full flex-col justify-start p-8
        ${
          isDark
            ? 'bg-secondary text-white'
            : isFeatured
              ? 'bg-primary text-white'
              : 'bg-white text-gray-900'
        }
      `}
    >
      <header className="mb-7 flex items-start justify-between">
        <span
          className={`
            inline-flex h-7 min-w-7 items-center justify-center px-2
            text-xs font-bold
            ${isColored ? 'bg-white text-black' : 'bg-black text-white'}
          `}
        >
          {number}
        </span>
      </header>

      <div className="mb-8">
        <h2
          id={`section-${number}`}
          className="text-xl font-bold leading-tight"
        >
          {title}
        </h2>

        {description && (
          <p
            className={`
              mt-2 max-w-sm text-[10px] font-semibold uppercase leading-relaxed
              tracking-widest
              ${isColored ? 'text-white' : 'text-gray-800'}
            `}
          >
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col justify-start">
        {documents.length === 0 ? (
          <div className="flex flex-col items-start gap-2">
            <FileText
              size={16}
              className={isColored ? 'text-white/60' : 'text-gray-400'}
              aria-hidden="true"
            />

            <p
              className={`
                text-sm font-medium
                ${isColored ? 'text-white/70' : 'text-gray-500'}
              `}
            >
              Nenhum documento disponível.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {documents.map((doc) => {
              const documentDate = formatDate(getDocumentDate(doc));
              const hasFile = Boolean(doc.file_url);

              const content = (
                <>
                  <FileText
                    size={14}
                    className={`
                      mt-0.5 shrink-0 transition
                      ${isColored ? 'text-white/80' : 'text-gray-500'}
                    `}
                    aria-hidden="true"
                  />

                  <span className="min-w-0">
                    <span
                      className={`
                        block text-sm font-medium leading-snug transition
                        ${
                          isColored
                            ? 'text-white group-hover:text-white/80'
                            : 'text-gray-600 group-hover:text-orange-800'
                        }
                      `}
                    >
                      {doc.title}
                    </span>

                    {documentDate && (
                      <span
                        className={`
                          mt-1 block text-xs
                          ${isColored ? 'text-white/70' : 'text-gray-500'}
                        `}
                      >
                        {documentDate}
                      </span>
                    )}
                  </span>
                </>
              );

              return (
                <li key={doc.id}>
                  {hasFile ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2"
                      title={`Abrir documento: ${doc.title}`}
                      aria-label={`Abrir documento ${doc.title}`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex items-start gap-2">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
