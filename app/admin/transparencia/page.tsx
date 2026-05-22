import { getTransparencyData } from '@/services/transparency';
import TransparencyClient from '@/components/admin/TransparencyClient';

export const dynamic = 'force-dynamic';

export default async function AdminTransparenciaPage({
  searchParams,
}: {
  searchParams: Promise<{
    ano?: string;
  }>;
}) {
  const params = await searchParams;

  const ano = params.ano ? Number(params.ano) : undefined;

  const data = await getTransparencyData(ano);

  return <TransparencyClient data={data} />;
}
