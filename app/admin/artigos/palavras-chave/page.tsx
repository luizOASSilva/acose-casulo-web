import { cookies } from 'next/headers';

import KeywordListContainer from '@/components/containers/KeywordListContainer';
import { getAdminKeywords } from '@/services/keyword';

export const dynamic = 'force-dynamic';

interface AdminPalavrasChavePageProps {
  searchParams: Promise<{
    busca?: string;
    page?: string;
  }>;
}

export default async function AdminPalavrasChavePage({
  searchParams,
}: AdminPalavrasChavePageProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const result = await getAdminKeywords(
    {
      busca: params.busca,
      page: params.page ? Number(params.page) : 1,
      per_page: 10,
    },
    cookieHeader
  );

  return (
    <KeywordListContainer
      keywords={result.data}
      pagination={result.meta}
      filters={{
        busca: params.busca || '',
      }}
    />
  );
}
