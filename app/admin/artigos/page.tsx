import { getArticles } from '@/services/articles';
import ArticleListContainer from '@/components/containers/ArticleListContainer';

export default async function AdminArtigosPage() {
  const articles = await getArticles();

  return (
    <div className="w-full min-h-screen">
      <ArticleListContainer articles={articles} isAdmin={true} />
    </div>
  );
}