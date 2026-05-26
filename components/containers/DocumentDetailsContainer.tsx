'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Save,
} from 'lucide-react';

import type {
  DocumentCategory,
  DocumentInput,
  DocumentItem,
} from '@/types/document';

import {
  createDocument,
  updateDocument,
} from '@/services/admin/document';

import { documentSchema } from '@/schemas/document.schema';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface DocumentDetailsContainerProps {
  document: DocumentItem;
  categories: DocumentCategory[];
  isNew?: boolean;
  startInEditMode?: boolean;
}

type DocumentFormErrors = Partial<{
  title: string;
  file_url: string;
  category_id: string;
  year: string;
}>;

type PreviewTheme = {
  card: string;
  header: string;
  folderBox: string;
  folderIcon: string;
  title: string;
  subtitle: string;
  row: string;
  documentTitle: string;
  documentDate: string;
  icon: string;
};

const ADMIN_TRANSPARENCY_PATH = '/admin/transparencia';
const ADMIN_TRANSPARENCY_RETURN_PATH_KEY = 'admin.transparency.returnPath';

function getPreviewTheme(index: number): PreviewTheme {
  const isSecondary = index % 6 === 2;
  const isPrimary = index % 6 === 5;

  if (isSecondary) {
    return {
      card: 'border-secondary bg-secondary text-white',
      header: 'border-white/10 bg-secondary',
      folderBox: 'bg-white text-secondary',
      folderIcon: 'text-secondary',
      title: 'text-white',
      subtitle: 'text-white/70',
      row: 'border-white/10 hover:bg-white/10',
      documentTitle: 'text-white group-hover:text-white',
      documentDate: 'text-white/60',
      icon: 'text-white/70 group-hover:text-white',
    };
  }

  if (isPrimary) {
    return {
      card: 'border-primary bg-primary text-white',
      header: 'border-white/10 bg-primary',
      folderBox: 'bg-white text-primary',
      folderIcon: 'text-primary',
      title: 'text-white',
      subtitle: 'text-white/75',
      row: 'border-white/10 hover:bg-white/10',
      documentTitle: 'text-white group-hover:text-white',
      documentDate: 'text-white/65',
      icon: 'text-white/75 group-hover:text-white',
    };
  }

  return {
    card: 'border-zinc-200 bg-white text-zinc-900',
    header: 'border-zinc-100 bg-zinc-50',
    folderBox: 'bg-primary/10 text-primary',
    folderIcon: 'text-primary',
    title: 'text-zinc-900',
    subtitle: 'text-zinc-500',
    row: 'border-zinc-100 hover:bg-zinc-50',
    documentTitle: 'text-zinc-800 group-hover:text-primary',
    documentDate: 'text-zinc-500',
    icon: 'text-zinc-400 group-hover:text-primary',
  };
}

function fieldClass(error?: string, className = '') {
  return `
    ${className}
    selection:bg-primary selection:text-white
    transition-all
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
  `;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-[11px] font-semibold text-red-600">
      {message}
    </p>
  );
}

export default function DocumentDetailsContainer({
  document,
  categories,
  isNew = false,
  startInEditMode = false,
}: DocumentDetailsContainerProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  const [isEditMode] = useState(startInEditMode || isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<DocumentFormErrors>({});

  const [title, setTitle] = useState(document?.title || '');
  const [fileUrl, setFileUrl] = useState(document?.file_url || '');
  const [year, setYear] = useState<number>(
    document?.year || new Date().getFullYear()
  );

  const [categoryId, setCategoryId] = useState<number>(
    document?.category_id || document?.category?.id || categories[0]?.id || 0
  );

  useEffect(() => {
    if (!document) return;

    setTitle(document.title || '');
    setFileUrl(document.file_url || '');
    setYear(document.year || new Date().getFullYear());
    setCategoryId(
      document.category_id || document.category?.id || categories[0]?.id || 0
    );
    setErrors({});
  }, [document, categories]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === Number(categoryId));
  }, [categories, categoryId]);

  const selectedCategoryIndex = useMemo(() => {
    const index = categories.findIndex(
      (category) => category.id === Number(categoryId)
    );

    return index >= 0 ? index : 0;
  }, [categories, categoryId]);

  const previewTheme = useMemo(() => {
    return getPreviewTheme(selectedCategoryIndex);
  }, [selectedCategoryIndex]);

  const formattedDate = useMemo(() => {
    const date = document?.created_at
      ? new Date(document.created_at)
      : new Date();

    return date.toLocaleDateString('pt-BR');
  }, [document?.created_at]);

  const hasPendingChanges = useMemo(() => {
    const originalCategoryId =
      document?.category_id || document?.category?.id || categories[0]?.id || 0;

    return (
      title !== (document?.title || '') ||
      fileUrl !== (document?.file_url || '') ||
      year !== (document?.year || new Date().getFullYear()) ||
      categoryId !== originalCategoryId
    );
  }, [title, fileUrl, year, categoryId, document, categories]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasPendingChanges && isEditMode) {
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges, isEditMode]);

  const clearError = (field: keyof DocumentFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const confirmDiscard = async (): Promise<boolean> => {
    if (!hasPendingChanges) return true;

    return confirm({
      title: 'Descartar alterações?',
      description:
        'Você tem alterações pendentes que ainda não foram salvas. Se continuar, tudo que foi alterado será perdido.',
      confirmText: 'Descartar',
      cancelText: 'Continuar editando',
      variant: 'danger',
    });
  };

  const getReturnPath = () => {
    if (typeof window === 'undefined') return ADMIN_TRANSPARENCY_PATH;

    return (
      sessionStorage.getItem(ADMIN_TRANSPARENCY_RETURN_PATH_KEY) ||
      ADMIN_TRANSPARENCY_PATH
    );
  };

  const handleBack = async () => {
    if (!(await confirmDiscard())) return;

    router.push(getReturnPath());
  };

  const handleCancel = async () => {
    if (!(await confirmDiscard())) return;

    router.push(getReturnPath());
  };

  const applyValidationErrors = (
    issues: Array<{
      path: (string | number)[];
      message: string;
    }>
  ) => {
    const nextErrors: DocumentFormErrors = {};

    issues.forEach((issue) => {
      const field = issue.path[0] as keyof DocumentFormErrors | undefined;

      if (field && !nextErrors[field]) {
        nextErrors[field] = issue.message;
      }
    });

    setErrors(nextErrors);
  };

  const handleSave = async () => {
    const parsed = documentSchema.safeParse({
      title,
      file_url: fileUrl,
      category_id: Number(categoryId),
      year: Number(year),
    });

    if (!parsed.success) {
      applyValidationErrors(parsed.error.issues);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload: DocumentInput = parsed.data;

    try {
      const response = isNew
        ? await createDocument(payload)
        : await updateDocument(document.id, payload);

      if (response) {
        await confirm({
          title: isNew ? 'Documento criado' : 'Documento atualizado',
          description: isNew
            ? 'O documento foi criado com sucesso.'
            : 'As alterações do documento foram salvas com sucesso.',
          confirmText: 'Entendi',
          cancelText: 'Fechar',
          variant: 'success',
        });

        router.push(getReturnPath());
        router.refresh();
        return;
      }

      await confirm({
        title: 'Erro ao salvar',
        description:
          'Não foi possível salvar o documento agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } catch (error) {
      await confirm({
        title: 'Erro ao salvar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o documento agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewContent = (
    <>
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${previewTheme.documentTitle}`}>
          {title || 'Título do documento'}
        </p>

        <p className={`mt-1 text-xs ${previewTheme.documentDate}`}>
          {formattedDate}
        </p>
      </div>

      <div className={`rounded-md p-2 transition ${previewTheme.icon}`}>
        <ExternalLink size={15} aria-hidden="true" />
      </div>
    </>
  );

  return (
    <main className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6 selection:bg-primary selection:text-white">
      <header className="mb-10 space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar para transparência
        </button>

        <div className="pt-4 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {isNew ? 'Criar Novo Documento' : 'Editar Documento'}
          </h1>

          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-block border border-emerald-100">
            Painel conectado ao banco de dados. Alterações são refletidas em tempo real.
          </p>
        </div>
      </header>

      <section className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <FileText className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {isNew ? 'Novo documento' : 'Atualizar documento'}
            </h2>

            <p className="text-sm text-gray-600 max-w-md">
              Informe o título, link do arquivo, ano e categoria para exibição na página de transparência.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">
              Título do Documento
            </label>

            <div className="relative">
              <FileText
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              />

              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearError('title');
                }}
                className={fieldClass(
                  errors.title,
                  'w-full text-sm bg-white border rounded-md pl-10 pr-4 py-3 focus:outline-none text-gray-800'
                )}
                placeholder="Ex: Relatório Financeiro 2026"
                maxLength={255}
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <FieldError message={errors.title} />

              <span
                className={`ml-auto text-[11px] ${
                  title.length > 240 ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                {title.length}/255
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">
              URL do Arquivo
            </label>

            <div className="relative">
              <LinkIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              />

              <input
                type="url"
                value={fileUrl}
                onChange={(event) => {
                  setFileUrl(event.target.value);
                  clearError('file_url');
                }}
                className={fieldClass(
                  errors.file_url,
                  'w-full text-sm bg-white border rounded-md pl-10 pr-4 py-3 focus:outline-none text-gray-800 font-mono'
                )}
                placeholder="https://drive.google.com/file/..."
                maxLength={2048}
              />
            </div>

            <FieldError message={errors.file_url} />

            {fileUrl && !errors.file_url && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Abrir arquivo
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Ano
              </label>

              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="number"
                  value={year}
                  onChange={(event) => {
                    setYear(Number(event.target.value));
                    clearError('year');
                  }}
                  className={fieldClass(
                    errors.year,
                    'w-full text-sm bg-white border rounded-md pl-10 pr-4 py-3 focus:outline-none text-gray-800'
                  )}
                  placeholder="2026"
                  min={2000}
                  max={2100}
                />
              </div>

              <FieldError message={errors.year} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Categoria
              </label>

              <div className="relative">
                <FolderOpen
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />

                <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(Number(event.target.value));
                    clearError('category_id');
                  }}
                  className={fieldClass(
                    errors.category_id,
                    'w-full text-sm bg-white border rounded-md pl-10 pr-4 py-3 focus:outline-none text-gray-800 appearance-none'
                  )}
                >
                  <option value={0}>Selecione uma categoria</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <FieldError message={errors.category_id} />
            </div>
          </div>

          <section className={`overflow-hidden rounded-md border shadow-sm ${previewTheme.card}`}>
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${previewTheme.header}`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-md p-2 ${previewTheme.folderBox}`}>
                  <FolderOpen
                    size={18}
                    aria-hidden="true"
                    className={previewTheme.folderIcon}
                  />
                </div>

                <div>
                  <h3 className={`font-semibold ${previewTheme.title}`}>
                    {selectedCategory?.name || 'Categoria'}
                  </h3>

                  <p className={`text-xs ${previewTheme.subtitle}`}>
                    Prévia do documento
                  </p>
                </div>
              </div>
            </div>

            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between border-b px-5 py-3 transition ${previewTheme.row}`}
                title="Abrir documento"
                aria-label="Abrir documento"
              >
                {previewContent}
              </a>
            ) : (
              <div className={`flex items-center justify-between border-b px-5 py-3 ${previewTheme.row}`}>
                {previewContent}
              </div>
            )}
          </section>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-md border border-gray-300 transition-colors cursor-pointer disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                Descartar
              </span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || (!hasPendingChanges && !isNew)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-md transition-all cursor-pointer disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Save className="w-4 h-4" aria-hidden="true" />

                {isSubmitting
                  ? 'Salvando...'
                  : isNew
                    ? 'Criar Documento'
                    : 'Confirmar e Salvar'}
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
