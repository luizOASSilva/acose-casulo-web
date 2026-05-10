import type { Metadata } from 'next';
import ArticleRow from '@/components/ui/ArticleRow';
import { getArticles } from '@/services/articles';

export const metadata: Metadata = {
  title: 'Artigos',
  description:
    'Artigos sobre inclusão, autonomia e cuidado para pessoas com deficiência intelectual em Bragança Paulista.',
  alternates: {
    canonical: '/artigos',
  },
  openGraph: {
    title: 'Artigos | Acose Casulo',
    description:
      'Artigos sobre inclusão, autonomia e cuidado para pessoas com deficiência intelectual em Bragança Paulista.',
    url: '/artigos',
    type: 'website',
  },
};

export default async function Artigos() {
  const articles = await getArticles();

  return (
    <main className="w-[90%] max-w-4xl mx-auto py-12 md:py-20">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Artigos do Centro Dia
        </h1>
        <p className="text-gray-700 text-base md:text-lg max-w-xl">
          Um pouco do material de quem vive o cuidado no dia-a-dia.
        </p>
      </header>

      {articles.length > 0 ? (
        <ul className="flex flex-col divide-y divide-gray-100">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleRow article={article} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 italic">Nenhum artigo encontrado.</p>
      )}
    </main>
  );
}
