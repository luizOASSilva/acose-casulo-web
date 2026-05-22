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

export default function TransparencyClient({
  data,
}: AdminTransparencyClientProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  const totalDocuments =
    data.categories.reduce(
      (acc: number, cat: any) => acc + cat.documents.length,
      0
    ) || 0;

  const totalCategories = data.categories.length || 0;

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
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-md bg-secondary px-8 py-8 text-white">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Transparência
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                Gerencie documentos institucionais,
                arquivos públicos e conteúdos da
                área de transparência da plataforma.
              </p>
            </div>

            <Link
              href="/admin/transparencia/novo"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-light px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              <Plus size={18} aria-hidden="true" />
              Novo documento
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-4">
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
                <p className="text-sm font-medium text-zinc-500">
                  Ano atual
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {data.year}
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
          <YearFilter
            years={data.years}
            activeYear={data.year}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {data.categories.map((category: any) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <FolderOpen size={18} aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-zinc-900">
                      {category.name}
                    </h3>

                    <p className="text-xs text-zinc-500">
                      {category.documents.length} documentos
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {category.documents.length > 0 ? (
                  category.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 transition hover:bg-zinc-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-800">
                          {doc.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/transparencia/${doc.id}/editar`}
                          className="
                            p-2.5 rounded-xl transition-all active:scale-95
                            text-gray-600 bg-gray-100
                            hover:bg-orange-500/20 hover:text-orange-600
                          "
                          title="Editar documento"
                          aria-label="Editar documento"
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-2.5 text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all active:scale-95"
                          title="Remover documento"
                          aria-label="Remover documento"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="rounded-md bg-zinc-100 p-4 text-zinc-400">
                      <FileText size={20} aria-hidden="true" />
                    </div>

                    <div className="text-center">
                      <p className="font-medium text-zinc-900">
                        Nenhum documento
                      </p>

                      <p className="text-sm text-zinc-500">
                        Esta categoria está vazia.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
