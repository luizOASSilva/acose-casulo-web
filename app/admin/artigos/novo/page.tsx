import ArticleDetailsContainer from '@/components/containers/ArticleDetailsContainer';

export default function AdminCreateArticlePage() {
  const blankDraftSkeleton = {
    id: 0,
    slug: 'new',
    title: '',
    summary: '',
    content: '',
    media: { url: '', alt_text: 'Capa do artigo' },
    author: { name: 'Admin Staff' },
    created_at: new Date().toISOString(),
    status: 'draft' as const,
    keywords: []
  };

  return <ArticleDetailsContainer article={blankDraftSkeleton} isAdmin={true} isNew={true} />;
}
