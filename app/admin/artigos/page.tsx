import { getArticles } from '@/services/articles';
import ArticleListContainer from '@/components/containers/ArticleListContainer';

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="w-full min-h-screen bg-white">
      <ArticleListContainer articles={articles} isAdmin={true} />
    </div>
  );
}