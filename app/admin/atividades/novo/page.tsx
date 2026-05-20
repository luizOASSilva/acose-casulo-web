import ActivityDetailsContainer from '@/components/containers/ActivityDetailsContainer';

export default function AdminCreateActivityPage() {
  const blankActivitySkeleton = {
    id: 0,
    slug: 'new',
    title: '',
    content: '',
    media: {
      url: '',
      alt_text: 'Capa da atividade',
      caption: '',
    },
    created_at: new Date().toISOString(),
  };

  return (
    <ActivityDetailsContainer
      activity={blankActivitySkeleton}
      isAdmin={true}
      isNew={true}
      startInEditMode={true}
    />
  );
}
