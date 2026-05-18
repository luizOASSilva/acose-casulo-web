import ArticleDetailsContainer from '@/components/containers/ArticleDetailsContainer';

export default function AdminCreateArticlePage() {
  const blankDraftSkeleton = {
    slug: 'new',
    title: '',
    content: '',
    media: { url: '' },
    author: { name: 'Admin Staff' },
    created_at: new Date().toISOString(),
    status: 'draft',
    keywords: []
  };

  return <ArticleDetailsContainer article={blankDraftSkeleton} isAdmin={true} />;
}
