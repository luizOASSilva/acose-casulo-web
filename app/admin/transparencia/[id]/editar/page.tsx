import { notFound } from 'next/navigation';
import DocumentDetailsContainer from '@/components/containers/DocumentDetailsContainer';
import { getDocumentById, getDocumentCategories } from '@/services/admin/document';

interface ParamProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEditarDocumentPage({ params }: ParamProps) {
  const { id } = await params;

  const [document, categories] = await Promise.all([
    getDocumentById(Number(id)),
    getDocumentCategories(),
  ]);

  if (!document) notFound();

  return (
    <DocumentDetailsContainer
      key={`edit-document-${document.id}`}
      document={document}
      categories={categories}
      isNew={false}
      startInEditMode={true}
    />
  );
}
