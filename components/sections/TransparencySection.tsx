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

  return (
    <article
      aria-labelledby={`section-${number}`}
      className={`p-8 flex flex-col gap-6 h-full ${
        isDark
          ? 'bg-secondary text-white'
          : isFeatured
            ? 'bg-primary text-white'
            : 'bg-white text-gray-900'
      }`}
    >
      <header className="flex items-start justify-between">
        <span
          className={`text-xs font-bold px-2 py-1 ${
            isDark ? 'bg-white text-black' : 'bg-black text-white'
          }`}
        >
          {number}
        </span>
      </header>

      <div>
        <h2
          id={`section-${number}`}
          className="text-xl font-bold leading-tight mb-1"
        >
          {title}
        </h2>

        {description && (
          <p
            className={`text-[10px] uppercase tracking-widest ${
              isDark || isFeatured ? 'text-white' : 'text-gray-800'
            }`}
          >
            {description}
          </p>
        )}
      </div>

      <div className="mt-auto">
        {documents.length === 0 ? (
          <p className="text-sm opacity-50 italic">
            Nenhum documento disponível.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {documents.map((doc) => {
              const documentDate = formatDate(getDocumentDate(doc));

              return (
                <li key={doc.id}>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-start gap-2 ${
                      isDark || isFeatured
                        ? 'text-white'
                        : 'text-gray-600 hover:text-orange-800'
                    }`}
                  >
                    <FileText size={14} className="mt-0.5 shrink-0" />

                    <span className="min-w-0">
                      <span className="block truncate text-sm group-hover:underline">
                        {doc.title}
                      </span>

                      {documentDate && (
                        <span
                          className={`mt-1 block text-xs ${
                            isDark || isFeatured
                              ? 'text-white/70'
                              : 'text-gray-500'
                          }`}
                        >
                          {documentDate}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
