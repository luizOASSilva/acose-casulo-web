import PartnerDetailContainer from '@/components/containers/PartnerDetailContainer';

export default function AdminNovoParceiroPage() {
  return (
    <PartnerDetailContainer
      isNew={true}
      startInEditMode={true}
    />
  );
}