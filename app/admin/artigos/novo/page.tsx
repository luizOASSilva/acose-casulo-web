import ArticleDetailsContainer from '@/components/containers/ArticleDetailsContainer';

export default function AdminCreateArticlePage() {
  const blankDraftSkeleton = {
    id: 0,
    slug: 'new',
    title: '',
    content: '',
    summary: '',
    media: { url: '', alt_text: '' },
    author: { name: 'Admin Staff' },
    created_at: new Date().toISOString(),
    status: 'draft',
    keywords: []
  };

  return <ArticleDetailsContainer article={blankDraftSkeleton} isAdmin={true} />;
}
