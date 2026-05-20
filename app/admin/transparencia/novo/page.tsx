import DocumentDetailsContainer from '@/components/containers/DocumentDetailsContainer';
import { getDocumentCategories } from '@/services/admin/document';

export default async function AdminCreateDocumentPage() {
  const categories = await getDocumentCategories();

  const blankDocumentSkeleton = {
    id: 0,
    title: '',
    file_url: '',
    year: new Date().getFullYear(),
    category_id: categories[0]?.id || 0,
    category: categories[0] || {
      id: 0,
      name: '',
      featured: false,
    },
    created_at: new Date().toISOString(),
  };

  return (
    <DocumentDetailsContainer
      document={blankDocumentSkeleton}
      categories={categories}
      isNew={true}
      startInEditMode={true}
    />
  );
}
