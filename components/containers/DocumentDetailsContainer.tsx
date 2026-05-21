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
  X,
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

const ADMIN_TRANSPARENCY_PATH = '/admin/transparencia';

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

  const confirmDiscard = (): boolean => {
    if (!hasPendingChanges) return true;

    return window.confirm(
      'Zezão, você tem alterações pendentes que não foram salvas! Deseja realmente descartar tudo?'
    );
  };

  const handleBack = () => {
    if (!confirmDiscard()) return;

    router.push(ADMIN_TRANSPARENCY_PATH);
  };

  const handleCancel = () => {
    if (!confirmDiscard()) return;

    router.push(ADMIN_TRANSPARENCY_PATH);
  };

  const handleSave = async () => {
    const parsed = documentSchema.safeParse({
      title,
      file_url: fileUrl,
      category_id: Number(categoryId),
      year: Number(year),
    });

    if (!parsed.success) {
      const nextErrors: DocumentFormErrors = {};

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof DocumentFormErrors | undefined;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });

      setErrors(nextErrors);
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
        alert(
          isNew
            ? 'Documento criado com sucesso! ✔'
            : 'Documento atualizado com sucesso! ✔'
        );

        router.push(ADMIN_TRANSPARENCY_PATH);
        router.refresh();
      } else {
        alert('Erro ao salvar documento.');
      }
    } catch {
      alert('Erro ao salvar documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6 selection:bg-primary selection:text-white">
      <header className="mb-10 space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para transparência
        </button>

        <div className="pt-4 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {isNew ? 'Criar Novo Documento' : 'Editar Documento'}
          </h1>

          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-block border border-emerald-100">
            Pipeline conectado ao banco de dados Laravel. Alterações são refletidas em tempo real.
          </p>
        </div>
      </header>

      <section className="rounded-md border border-dashed border-gray-300 bg-white p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <FileText className="w-8 h-8" />
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
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

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
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

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
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Ano
              </label>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

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
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

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

          <section className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <FolderOpen size={18} />
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-900">
                    {selectedCategory?.name || 'Categoria'}
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Prévia do documento
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 transition hover:bg-zinc-50">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-800">
                  {title || 'Título do documento'}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {formattedDate}
                </p>
              </div>

              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-zinc-400 transition hover:bg-primary/10 hover:text-primary"
                  title="Abrir documento"
                >
                  <ExternalLink size={15} />
                </a>
              ) : (
                <div className="rounded-md p-2 text-zinc-300">
                  <ExternalLink size={15} />
                </div>
              )}
            </div>
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
                <Save className="w-4 h-4" />
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
