import { cookies } from 'next/headers';

import ArticleListContainer from '@/components/containers/ArticleListContainer';
import { getAdminArticles } from '@/services/articles';

export const dynamic = 'force-dynamic';

interface AdminArtigosPageProps {
  searchParams: Promise<{
    busca?: string;
    palavra?: string;
    ordem?: string;
    page?: string;
  }>;
}

export default async function AdminArtigosPage({
  searchParams,
}: AdminArtigosPageProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const result = await getAdminArticles(
    {
      busca: params.busca,
      palavra: params.palavra,
      ordem: params.ordem as any,
      page: params.page ? Number(params.page) : 1,
      per_page: 9,
    },
    cookieHeader
  );

  return (
    <ArticleListContainer
      articles={result.data}
      pagination={result.meta}
      filters={{
        busca: params.busca || '',
        palavra: params.palavra || '',
        ordem: (params.ordem || 'recentes') as any,
      }}
      isAdmin
    />
  );
}
