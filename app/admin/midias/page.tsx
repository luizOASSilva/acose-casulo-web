import MediaLibraryContainer from '@/components/containers/MediaLibraryContainer';

import type { MediaCollection } from '@/services/admin/media-library';

export const dynamic = 'force-dynamic';

type MediaCollectionFilter = MediaCollection | 'all';

interface AdminMidiasPageProps {
  searchParams: Promise<{
    collection?: string;
    busca?: string;
    page?: string;
  }>;
}

function normalizeCollection(value?: string): MediaCollectionFilter {
  if (
    value === 'articles' ||
    value === 'activities' ||
    value === 'partners' ||
    value === 'general' ||
    value === 'all'
  ) {
    return value;
  }

  return 'all';
}

export default async function AdminMidiasPage({
  searchParams,
}: AdminMidiasPageProps) {
  const params = await searchParams;

  return (
    <MediaLibraryContainer
      initialFilters={{
        collection: normalizeCollection(params.collection),
        busca: params.busca || '',
        page: params.page ? Number(params.page) : 1,
      }}
    />
  );
}
