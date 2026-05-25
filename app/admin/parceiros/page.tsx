import PartnerListContainer from '@/components/containers/PartnerListContainer';
import { getPartners } from '@/services/partners';

export const dynamic = 'force-dynamic';

export default async function AdminParceirosPage() {
  const partners = await getPartners();

  return (
    <div className="w-full min-h-screen">
      <PartnerListContainer partners={partners} />
    </div>
  );
}
