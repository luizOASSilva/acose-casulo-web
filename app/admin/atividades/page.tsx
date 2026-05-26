import { cookies } from 'next/headers';

import ActivityListContainer from '@/components/containers/ActivityListContainer';
import { getAdminActivities } from '@/services/activities';

export const dynamic = 'force-dynamic';

interface AdminAtividadesPageProps {
  searchParams: Promise<{
    busca?: string;
    dia?: string;
    inicio?: string;
    fim?: string;
    ordem?: string;
    page?: string;
  }>;
}

export default async function AdminAtividadesPage({
  searchParams,
}: AdminAtividadesPageProps) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const result = await getAdminActivities(
    {
      busca: params.busca,
      dia: params.dia as any,
      inicio: params.inicio,
      fim: params.fim,
      ordem: params.ordem as any,
      page: params.page ? Number(params.page) : 1,
      per_page: 9,
    },
    cookieHeader
  );

  return (
    <ActivityListContainer
      activities={result.data}
      pagination={result.meta}
      filters={{
        busca: params.busca || '',
        dia: (params.dia || '') as any,
        inicio: params.inicio || '',
        fim: params.fim || '',
        ordem: (params.ordem || 'recentes') as any,
      }}
      isAdmin
    />
  );
}
