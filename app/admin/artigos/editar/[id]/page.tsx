import { notFound } from 'next/navigation';
import { getArticleById } from '@/services/articles';
import ArticleDetailsContainer from '@/components/containers/ArticleDetailsContainer';

interface ParamProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditArticlePage({ params }: ParamProps) {
  const { id } = await params;
  
  const article = await getArticleById(Number(id)); 

  if (!article) notFound();

  return <ArticleDetailsContainer article={article} isAdmin={true} isNew={false} />;
}
