import ArticleDetailsContainer from '@/components/containers/ArticleDetailsContainer';
import { getArticleKeywords } from '@/services/articles';

export default async function AdminNovoArtigoPage() {
  const allKeywords = await getArticleKeywords();

  const blankDraftSkeleton = {
    id: 0,
    slug: 'new',
    title: '',
    summary: '',
    content: '',
    media: {
      url: '',
      alt_text: 'Capa do artigo',
      caption: '',
    },
    author: {
      name: 'Admin Staff',
    },
    created_at: new Date().toISOString(),
    status: 'draft' as const,
    keywords: [],
  };

  return (
    <ArticleDetailsContainer
      key="create-article"
      article={blankDraftSkeleton}
      isAdmin={true}
      isNew={true}
      startInEditMode={true}
      allKeywords={allKeywords}
    />
  );
}
