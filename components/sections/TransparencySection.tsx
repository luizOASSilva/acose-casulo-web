import { FileText } from "lucide-react";
import { Document } from "@/types/transparency";

interface TransparencySectionProps {
  number: string;
  title?: string;
  description?: string;
  documents?: Document[];
  variant?: "light" | "dark" | "featured";
}

export default function TransparencySection({
  number,
  title,
  description,
  documents = [],
  variant = "light",
}: TransparencySectionProps) {
  const isDark = variant === "dark";
  const isFeatured = variant === "featured";

  return (
    <article
      aria-labelledby={`section-${number}`}
      className={`p-8 flex flex-col gap-6 h-full ${
        isDark ? "bg-black text-white" : isFeatured ? "bg-primary text-white" : "bg-white text-gray-900"
      }`}
    >
      <header className="flex items-start justify-between">
        <span
          className={`text-xs font-bold px-2 py-1 ${
            isDark ? "bg-white text-black" : "bg-black text-white"
          }`}
        >
          {number}
        </span>
      </header>

      <div>
        <h2 id={`section-${number}`} className="text-xl font-bold leading-tight mb-1">
          {title}
        </h2>
        {description && (
          <p className={`text-[10px] uppercase tracking-widest ${
            isDark || isFeatured ? "text-white/60" : "text-gray-400"
          }`}>
            {description}
          </p>
        )}
      </div>

      <div className="mt-auto">
        {documents.length === 0 ? (
          <p className="text-sm opacity-50 italic">Nenhum documento disponível.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm flex items-center gap-2 hover:underline truncate ${
                    isDark || isFeatured ? "text-white/90" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <FileText size={14} className="shrink-0" />
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
