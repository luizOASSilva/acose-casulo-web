import { cookies } from 'next/headers';

import PartnerListContainer from '@/components/containers/PartnerListContainer';
import { getAdminPartners } from '@/services/partners';

export const dynamic = 'force-dynamic';

interface AdminParceirosPageProps {
  searchParams: Promise<{
    busca?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminParceirosPage({
  searchParams,
}: AdminParceirosPageProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const result = await getAdminPartners(
    {
      busca: params.busca,
      status: (params.status || 'all') as any,
      page: params.page ? Number(params.page) : 1,
      per_page: 18,
    },
    cookieHeader
  );

  return (
    <PartnerListContainer
      partners={result.data}
      pagination={result.meta}
      filters={{
        busca: params.busca || '',
        status: (params.status || 'all') as any,
        page: params.page ? Number(params.page) : 1,
      }}
    />
  );
}
