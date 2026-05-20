'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  Save,
  X,
  Calendar,
  FolderOpen,
  ExternalLink,
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

interface DocumentDetailsContainerProps {
  document: DocumentItem;
  categories: DocumentCategory[];
  isNew?: boolean;
  startInEditMode?: boolean;
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
  }, [document, categories]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === Number(categoryId));
  }, [categories, categoryId]);

  const hasPendingChanges = useMemo(() => {
    return (
      title !== (document?.title || '') ||
      fileUrl !== (document?.file_url || '') ||
      year !== (document?.year || new Date().getFullYear()) ||
      categoryId !==
        (document?.category_id || document?.category?.id || categories[0]?.id || 0)
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

  const confirmDiscard = (): boolean => {
    if (!hasPendingChanges) return true;

    return window.confirm(
      'Zezão, você tem alterações pendentes que não foram salvas! Deseja realmente descartar tudo?'
    );
  };

  const handleBack = () => {
    if (!confirmDiscard()) return;

    router.push('/admin/transparencia');
  };

  const handleCancel = () => {
    if (!confirmDiscard()) return;

    router.push('/admin/transparencia');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Título é obrigatório!');
      return;
    }

    if (!fileUrl.trim()) {
      alert('URL do arquivo é obrigatória!');
      return;
    }

    if (!categoryId) {
      alert('Categoria é obrigatória!');
      return;
    }

    if (!year) {
      alert('Ano é obrigatório!');
      return;
    }

    setIsSubmitting(true);

    const payload: DocumentInput = {
      title,
      file_url: fileUrl,
      category_id: Number(categoryId),
      year: Number(year),
    };

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

        router.push('/admin/transparency');
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
    <main className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6">
      <div className="mb-10 space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para transparência
        </button>

        <div className="pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {isNew ? 'Criar Novo Documento' : 'Editar Documento'}
          </h1>

          <p className="mt-2 text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block border border-emerald-100">
            Gerencie documentos públicos da área de transparência conectados ao banco de dados Laravel.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 md:p-8">
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
                onChange={(event) => setTitle(event.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                placeholder="Ex: Relatório Financeiro 2026"
              />
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
                onChange={(event) => setFileUrl(event.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800 font-mono"
                placeholder="https://drive.google.com/file/..."
              />
            </div>

            {fileUrl && (
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
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="w-full text-sm bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                  placeholder="2026"
                  min={2000}
                  max={2100}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Categoria
              </label>

              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(Number(event.target.value))}
                  className="w-full text-sm bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800 appearance-none"
                >
                  <option value={0}>Selecione uma categoria</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Prévia
            </p>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {title || 'Título do documento'}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedCategory?.name || 'Categoria'} · {year || 'Ano'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                Descartar
              </span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || (!hasPendingChanges && !isNew)}
              className="h-11 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all disabled:opacity-60"
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
