import { notFound } from 'next/navigation';

import PartnerDetailContainer from '@/components/containers/PartnerDetailContainer';
import { getPartnerById } from '@/services/partners';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEditarParceiroPage({ params }: PageProps) {
  const { id } = await params;

  const partnerId = Number(id);

  if (!partnerId) {
    notFound();
  }

  const partner = await getPartnerById(partnerId);

  if (!partner) {
    notFound();
  }

  return (
    <PartnerDetailContainer
      key={`partner-edit-${partner.id}`}
      partner={partner}
      isNew={false}
      startInEditMode={true}
    />
  );
}
