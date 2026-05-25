import { notFound } from 'next/navigation';

import { getArticleById, getArticles } from '@/services/articles';
import ArticleDetailsContainer from '@/components/containers/ArticleDetailsContainer';

interface ParamProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditarArtigoPage({ params }: ParamProps) {
  const { id } = await params;

  const [article, articles] = await Promise.all([
    getArticleById(Number(id)),
    getArticles(),
  ]);

  if (!article) notFound();

  const allKeywords = Array.from(
    new Set(
      articles.flatMap((articleItem) =>
        articleItem.keywords?.map((keyword: any) =>
          typeof keyword === 'object' ? keyword.word : keyword
        ) ?? []
      )
    )
  ).filter(Boolean);

  return (
    <ArticleDetailsContainer
      key={`edit-${article.id}`}
      article={article}
      isAdmin={true}
      isNew={false}
      startInEditMode={true}
      allKeywords={allKeywords}
    />
  );
}
