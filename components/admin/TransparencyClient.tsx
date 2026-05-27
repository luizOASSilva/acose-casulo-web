'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FolderOpen,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

import YearFilter from '@/components/ui/YearFilter';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import { deleteDocument } from '@/services/admin/document';

interface AdminTransparencyClientProps {
  data: any;
}

type CategoryTheme = {
  card: string;
  header: string;
  folderBox: string;
  folderIcon: string;
  title: string;
  subtitle: string;
  divider: string;
  documentRow: string;
  documentTitle: string;
  documentDate: string;
  documentIcon: string;
  emptyBox: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyText: string;
  actionEdit: string;
  actionDelete: string;
};

function normalizeText(value?: string | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getBlackTheme(): CategoryTheme {
  return {
    card: 'border-secondary bg-secondary text-white shadow-sm',
    header: 'border-white/10 bg-secondary',
    folderBox: 'bg-white text-secondary',
    folderIcon: 'text-secondary',
    title: 'text-white',
    subtitle: 'text-white/70',
    divider: 'border-white/10',
    documentRow: 'border-white/10 hover:bg-white/10',
    documentTitle: 'text-white group-hover:text-white',
    documentDate: 'text-white/60',
    documentIcon: 'text-white/70 group-hover:text-white',
    emptyBox: 'bg-white/10 text-white/70',
    emptyIcon: 'text-white/70',
    emptyTitle: 'text-white',
    emptyText: 'text-white/60',
    actionEdit: 'text-white bg-white/10 hover:bg-white hover:text-secondary',
    actionDelete: 'text-white bg-red-500/30 hover:bg-red-500 hover:text-white',
  };
}

function getOrangeTheme(): CategoryTheme {
  return {
    card: 'border-primary bg-primary text-white shadow-sm',
    header: 'border-white/10 bg-primary',
    folderBox: 'bg-white text-primary',
    folderIcon: 'text-primary',
    title: 'text-white',
    subtitle: 'text-white/75',
    divider: 'border-white/10',
    documentRow: 'border-white/10 hover:bg-white/10',
    documentTitle: 'text-white group-hover:text-white',
    documentDate: 'text-white/65',
    documentIcon: 'text-white/75 group-hover:text-white',
    emptyBox: 'bg-white/10 text-white/75',
    emptyIcon: 'text-white/75',
    emptyTitle: 'text-white',
    emptyText: 'text-white/65',
    actionEdit: 'text-white bg-white/10 hover:bg-white hover:text-primary',
    actionDelete: 'text-white bg-red-500/30 hover:bg-red-500 hover:text-white',
  };
}

function getWhiteTheme(): CategoryTheme {
  return {
    card: 'border-zinc-200 bg-white text-zinc-900 shadow-sm',
    header: 'border-zinc-100 bg-zinc-50',
    folderBox: 'bg-primary/10 text-primary',
    folderIcon: 'text-primary',
    title: 'text-zinc-900',
    subtitle: 'text-zinc-500',
    divider: 'border-zinc-100',
    documentRow: 'border-zinc-100 hover:bg-zinc-50',
    documentTitle: 'text-zinc-800 group-hover:text-primary',
    documentDate: 'text-zinc-500',
    documentIcon: 'text-zinc-400 group-hover:text-primary',
    emptyBox: 'bg-zinc-100 text-zinc-400',
    emptyIcon: 'text-zinc-400',
    emptyTitle: 'text-zinc-900',
    emptyText: 'text-zinc-500',
    actionEdit:
      'text-gray-600 bg-gray-100 hover:bg-orange-500/20 hover:text-orange-600',
    actionDelete: 'text-red-600 bg-red-500/10 hover:bg-red-500/20',
  };
}

function getCategoryTheme(category: any): CategoryTheme {
  const name = normalizeText(category?.name);
  const slug = normalizeText(category?.slug);
  const key = `${name} ${slug}`;

  if (
    key.includes('financeiro') ||
    key.includes('financeira') ||
    key.includes('balanco') ||
    key.includes('balancos') ||
    key.includes('prestacao') ||
    key.includes('contas')
  ) {
    return getBlackTheme();
  }

  if (
    key.includes('centro dia') ||
    key.includes('centro-dia') ||
    key.includes('centrodia')
  ) {
    return getOrangeTheme();
  }

  return getWhiteTheme();
}

function formatDate(date?: string) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('pt-BR');
}

function getDocumentDate(doc: any) {
  return (
    doc?.published_at ||
    doc?.document_date ||
    doc?.date ||
    doc?.created_at ||
    doc?.updated_at ||
    ''
  );
}

export default function TransparencyClient({
  data,
}: AdminTransparencyClientProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const years = Array.isArray(data?.years) ? data.years : [];

  const totalDocuments =
    categories.reduce(
      (acc: number, cat: any) =>
        acc + (Array.isArray(cat?.documents) ? cat.documents.length : 0),
      0
    ) || 0;

  const totalCategories = categories.length || 0;

  const handleDelete = async (documentId: number, title: string) => {
    const confirmed = await confirm({
      title: 'Remover documento?',
      description: `O documento "${title}" será removido da área de transparência. Essa ação não pode ser desfeita.`,
      confirmText: 'Remover documento',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteDocument(documentId);

    if (success) {
      await confirm({
        title: 'Documento removido',
        description: 'O documento foi removido com sucesso.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'success',
      });

      router.refresh();
      return;
    }

    await confirm({
      title: 'Erro ao remover',
      description:
        'Não foi possível remover o documento agora. Tente novamente em alguns instantes.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'danger',
    });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden py-4">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                Transparência
              </h1>

              <p className="mt-3 text-base leading-relaxed text-zinc-600">
                Gerencie documentos institucionais, arquivos públicos e
                conteúdos da área de transparência da plataforma.
              </p>
            </div>

            <Link
              href="/admin/transparencia/novo"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light active:scale-[0.98]"
            >
              <Plus size={18} aria-hidden="true" />
              Novo documento
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">Métricas</h2>

            <p className="text-sm text-zinc-500">
              Dados gerais da transparência
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  Documentos
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {totalDocuments}
                </h3>
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  Categorias
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {totalCategories}
                </h3>
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">Ano atual</p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {data?.year}
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-4 z-30 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 shadow-sm">
          <YearFilter years={years} activeYear={data?.year} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {categories.map((category: any) => {
            const documents = Array.isArray(category?.documents)
              ? category.documents
              : [];

            const theme = getCategoryTheme(category);

            return (
              <div
                key={category.id}
                className={`overflow-hidden rounded-md border ${theme.card}`}
              >
                <div
                  className={`flex items-center justify-between border-b px-5 py-4 ${theme.header}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md p-2 ${theme.folderBox}`}>
                      <FolderOpen
                        size={18}
                        aria-hidden="true"
                        className={theme.folderIcon}
                      />
                    </div>

                    <div>
                      <h3 className={`font-semibold ${theme.title}`}>
                        {category.name}
                      </h3>

                      <p className={`text-xs ${theme.subtitle}`}>
                        {documents.length}{' '}
                        {documents.length === 1 ? 'documento' : 'documentos'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  {documents.length > 0 ? (
                    documents.map((doc: any) => {
                      const documentDate = formatDate(getDocumentDate(doc));

                      return (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between border-b px-5 py-3 transition ${theme.documentRow}`}
                        >
                          {doc.file_url ? (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group min-w-0 flex-1"
                              title={`Abrir documento: ${doc.title}`}
                              aria-label={`Abrir documento ${doc.title}`}
                            >
                              <div className="flex min-w-0 items-start gap-2">
                                <FileText
                                  size={15}
                                  className={`mt-0.5 shrink-0 transition ${theme.documentIcon}`}
                                  aria-hidden="true"
                                />

                                <div className="min-w-0">
                                  <p
                                    className={`truncate text-sm font-medium transition ${theme.documentTitle}`}
                                  >
                                    {doc.title}
                                  </p>

                                  {documentDate && (
                                    <p
                                      className={`mt-1 text-xs ${theme.documentDate}`}
                                    >
                                      {documentDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </a>
                          ) : (
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-start gap-2">
                                <FileText
                                  size={15}
                                  className={`mt-0.5 shrink-0 ${theme.documentIcon}`}
                                  aria-hidden="true"
                                />

                                <div className="min-w-0">
                                  <p
                                    className={`truncate text-sm font-medium ${theme.documentTitle}`}
                                  >
                                    {doc.title}
                                  </p>

                                  {documentDate && (
                                    <p
                                      className={`mt-1 text-xs ${theme.documentDate}`}
                                    >
                                      {documentDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div
                            className="
                              ml-3 flex shrink-0 items-center gap-1
                              opacity-100
                              md:opacity-0 md:group-hover:opacity-100
                              transition-opacity
                            "
                          >
                            <Link
                              href={`/admin/transparencia/${doc.id}/editar`}
                              className={`rounded-xl p-2.5 transition-all active:scale-95 ${theme.actionEdit}`}
                              title="Editar documento"
                              aria-label="Editar documento"
                            >
                              <Pencil size={15} aria-hidden="true" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id, doc.title)}
                              className={`rounded-xl p-2.5 transition-all active:scale-95 ${theme.actionDelete}`}
                              title="Remover documento"
                              aria-label="Remover documento"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className={`rounded-md p-4 ${theme.emptyBox}`}>
                        <FileText
                          size={20}
                          aria-hidden="true"
                          className={theme.emptyIcon}
                        />
                      </div>

                      <div className="text-center">
                        <p className={`font-medium ${theme.emptyTitle}`}>
                          Nenhum documento
                        </p>

                        <p className={`text-sm ${theme.emptyText}`}>
                          Esta categoria está vazia.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
