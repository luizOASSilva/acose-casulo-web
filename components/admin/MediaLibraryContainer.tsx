'use client';

import Image from 'next/image';
import {
  Copy,
  ExternalLink,
  FileImage,
  ImagePlus,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';

import { useConfirmDialog } from '@/context/ConfirmDialogContext';

import {
  deleteMediaFile,
  getMediaFiles,
  uploadMediaFile,
  type MediaCollection,
  type MediaFile,
} from '@/services/admin/media-library';

type MediaCollectionFilter = MediaCollection | 'all';

interface MediaLibraryFilters {
  collection?: MediaCollectionFilter;
  busca?: string;
  page?: number;
}

interface MediaLibraryContainerProps {
  initialFilters?: MediaLibraryFilters;
}

const ADMIN_MEDIA_PATH = '/admin/midias';
const MEDIA_PER_PAGE = 24;
const COPY_RESET_MS = 2500;

const collections: {
  value: MediaCollectionFilter;
  label: string;
  description: string;
}[] = [
  {
    value: 'all',
    label: 'Todas',
    description: 'Todas as imagens',
  },
  {
    value: 'articles',
    label: 'Artigos',
    description: 'Imagens usadas em artigos',
  },
  {
    value: 'activities',
    label: 'Atividades',
    description: 'Imagens usadas em atividades',
  },
  {
    value: 'partners',
    label: 'Parceiros',
    description: 'Logos e marcas parceiras',
  },
  {
    value: 'general',
    label: 'Geral',
    description: 'Logos, OG image e configurações',
  },
];

const uploadCollections = collections.filter(
  (collection): collection is {
    value: MediaCollection;
    label: string;
    description: string;
  } => collection.value !== 'all'
);

function normalizeCollection(value?: string | null): MediaCollectionFilter {
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

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value?: string) {
  if (!value) return 'Data não informada';

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getCollectionLabel(collection: MediaCollection) {
  return (
    collections.find((item) => item.value === collection)?.label || collection
  );
}

function getFileName(file: MediaFile) {
  return file.original_name || file.filename || 'imagem';
}

export default function MediaLibraryContainer({
  initialFilters,
}: MediaLibraryContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirmDialog();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const filterRef = useRef<HTMLElement | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collectionFilter = normalizeCollection(
    searchParams.get('collection') || initialFilters?.collection || 'all'
  );

  const search = searchParams.get('busca') ?? initialFilters?.busca ?? '';
  const currentPage = Math.max(
    1,
    Number(searchParams.get('page') || initialFilters?.page || 1)
  );

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const [copiedFileId, setCopiedFileId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const [searchDraft, setSearchDraft] = useState(search);

  const activeUploadCollection =
    collectionFilter === 'all' ? null : collectionFilter;

  const activeUploadLabel = activeUploadCollection
    ? getCollectionLabel(activeUploadCollection)
    : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    async function loadFiles() {
      setIsLoading(true);

      try {
        if (collectionFilter === 'all') {
          const results = await Promise.all(
            uploadCollections.map((collection) =>
              getMediaFiles(collection.value)
            )
          );

          setFiles(results.flat());
          return;
        }

        const result = await getMediaFiles(collectionFilter);
        setFiles(result);
      } finally {
        setIsLoading(false);
      }
    }

    loadFiles();
  }, [collectionFilter]);

  useEffect(() => {
    function handleScroll() {
      const element = filterRef.current;
      if (!element) return;

      setIsFilterSticky(element.getBoundingClientRect().top <= 16);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredFiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return files.filter((file) => {
      if (!normalizedSearch) return true;

      return (
        file.original_name?.toLowerCase().includes(normalizedSearch) ||
        file.filename?.toLowerCase().includes(normalizedSearch) ||
        file.path?.toLowerCase().includes(normalizedSearch) ||
        file.url?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [files, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFiles.length / MEDIA_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFiles = useMemo(() => {
    const start = (safeCurrentPage - 1) * MEDIA_PER_PAGE;
    const end = start + MEDIA_PER_PAGE;

    return filteredFiles.slice(start, end);
  }, [filteredFiles, safeCurrentPage]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, safeCurrentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  const hasActiveFilters = Boolean(
    search.trim() || collectionFilter !== 'all'
  );

  useEffect(() => {
    if (currentPage <= totalPages) return;

    pushWithQuery({
      page: totalPages,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages]);

  function buildQuery(next: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        params.delete(key);
        return;
      }

      params.set(key, String(value));
    });

    return params.toString();
  }

  function pushWithQuery(next: Record<string, string | number | null>) {
    const query = buildQuery(next);

    router.push(query ? `${ADMIN_MEDIA_PATH}?${query}` : ADMIN_MEDIA_PATH);
  }

  function handleCollectionChange(collection: MediaCollectionFilter) {
    pushWithQuery({
      collection: collection === 'all' ? null : collection,
      page: 1,
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    pushWithQuery({
      busca: searchDraft.trim() || null,
      page: 1,
    });
  }

  function handleClearFilters() {
    setSearchDraft('');

    router.push(ADMIN_MEDIA_PATH);
  }

  function handlePageChange(page: number) {
    pushWithQuery({
      page,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function handleCopyUrl(file: MediaFile) {
    await navigator.clipboard.writeText(file.url);

    setCopiedFileId(file.id);

    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }

    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedFileId(null);
    }, COPY_RESET_MS);
  }

  async function handleDelete(file: MediaFile) {
    setSelectedFile(null);

    const confirmed = await confirm({
      title: 'Remover imagem?',
      description: `A imagem "${getFileName(file)}" será removida da biblioteca. Se ela estiver em uso, a API pode bloquear a exclusão.`,
      confirmText: 'Remover imagem',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) {
      setSelectedFile(file);
      return;
    }

    const success = await deleteMediaFile(file.collection, file.id);

    if (!success) {
      await confirm({
        title: 'Não foi possível remover',
        description:
          'A imagem pode estar em uso ou ocorreu um erro ao tentar remover.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      setSelectedFile(file);
      return;
    }

    setFiles((current) => current.filter((item) => item.id !== file.id));

    await confirm({
      title: 'Imagem removida',
      description: 'A imagem foi removida da biblioteca.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !activeUploadCollection) return;

    setIsUploading(true);

    try {
      const uploaded = await uploadMediaFile(activeUploadCollection, file);

      setFiles((current) => [uploaded, ...current]);

      await confirm({
        title: 'Imagem enviada',
        description: `A imagem foi adicionada à coleção ${getCollectionLabel(
          activeUploadCollection
        )}.`,
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'success',
      });
    } catch (error) {
      await confirm({
        title: 'Erro ao enviar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar a imagem agora.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Biblioteca de Mídias
        </h1>

        <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-block border border-emerald-100">
          Gerencie imagens usadas em artigos, atividades, parceiros e configurações.
        </p>
      </header>

      <div className="space-y-8">
        <section
          ref={filterRef}
          className={`
            sticky top-4 z-30 rounded-md border border-gray-200 bg-zinc-50 p-4
            transition-shadow duration-200
            ${
              isFilterSticky
                ? 'shadow-[0_12px_18px_-18px_rgba(0,0,0,0.65)]'
                : ''
            }
          `}
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Buscar por nome, arquivo ou caminho..."
                  className="h-11 w-full rounded-md border border-gray-200 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
              >
                Filtrar
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-gray-600 transition hover:bg-gray-200 active:scale-95"
                  aria-label="Limpar filtros"
                  title="Limpar filtros"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </form>

            <div className="flex flex-col gap-1 xl:items-end">
              {activeUploadCollection ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isUploading
                      ? 'Enviando...'
                      : `Enviar imagem em ${activeUploadLabel}`}
                  </button>

                  <p className="text-xs text-gray-500">
                    O envio será salvo na coleção selecionada.
                  </p>
                </>
              ) : (
                <div className="rounded-md border border-orange-100 bg-orange-50 px-4 py-2.5 text-xs font-medium text-orange-800">
                  Selecione uma coleção para enviar novas imagens.
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {collections.map((collection) => {
              const active = collectionFilter === collection.value;

              return (
                <button
                  key={collection.value}
                  type="button"
                  onClick={() => handleCollectionChange(collection.value)}
                  className={`
                    rounded-md border px-3 py-2 text-xs font-semibold transition active:scale-95 cursor-pointer
                    ${
                      active
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={collection.description}
                >
                  {collection.label}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {filteredFiles.length === 0
              ? 'Nenhuma mídia encontrada.'
              : `Mostrando ${
                  (safeCurrentPage - 1) * MEDIA_PER_PAGE + 1
                }–${Math.min(
                  safeCurrentPage * MEDIA_PER_PAGE,
                  filteredFiles.length
                )} de ${filteredFiles.length} mídias.`}
          </p>
        </section>

        {isLoading ? (
          <section className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed border-zinc-300 bg-white">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />

              <p className="text-sm font-medium text-zinc-600">
                Carregando mídias...
              </p>
            </div>
          </section>
        ) : paginatedFiles.length > 0 ? (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {paginatedFiles.map((file, index) => (
              <article
                key={`${file.collection}-${file.id}`}
                onClick={() => setSelectedFile(file)}
                className="
                  group cursor-pointer overflow-hidden rounded-md border border-zinc-200 bg-white
                  transition-all hover:-translate-y-1 hover:shadow-md
                "
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
                  <Image
                    src={file.url}
                    alt={file.original_name || file.filename}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    priority={index < 8}
                  />

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                </div>

                <div className="space-y-1 p-3">
                  <p
                    className="truncate text-xs font-semibold text-zinc-800"
                    title={getFileName(file)}
                  >
                    {getFileName(file)}
                  </p>

                  <p className="text-[11px] text-zinc-500">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                <FileImage className="h-7 w-7" aria-hidden="true" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-zinc-900">
                Nenhuma mídia encontrada
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Envie uma imagem ou ajuste os filtros para visualizar a biblioteca.
              </p>

              {activeUploadCollection ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
                >
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  Enviar primeira imagem
                </button>
              ) : (
                <p className="mt-6 rounded-md border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-medium text-orange-800">
                  Selecione uma coleção para enviar novas imagens.
                </p>
              )}
            </div>
          </section>
        )}

        {filteredFiles.length > MEDIA_PER_PAGE && (
          <nav
            className="flex flex-wrap items-center justify-center gap-2 pt-4"
            aria-label="Paginação de mídias"
          >
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="
                cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2
                text-sm font-semibold text-gray-700 transition
                hover:bg-gray-50 active:scale-95
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              Anterior
            </button>

            {safeCurrentPage > 3 && totalPages > 5 && (
              <>
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  className="
                    cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2
                    text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95
                  "
                >
                  1
                </button>

                <span className="px-1 text-sm text-gray-400">...</span>
              </>
            )}

            {pageNumbers.map((page) => {
              const isCurrent = page === safeCurrentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-95 ${
                    isCurrent
                      ? 'cursor-default border-primary bg-primary text-white'
                      : 'cursor-pointer border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}

            {safeCurrentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="px-1 text-sm text-gray-400">...</span>

                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  className="
                    cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2
                    text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95
                  "
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="
                cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2
                text-sm font-semibold text-gray-700 transition
                hover:bg-gray-50 active:scale-95
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              Próxima
            </button>
          </nav>
        )}
      </div>

      {isMounted &&
        selectedFile &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedFile(null)}
            role="presentation"
          >
            <div
              className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-2xl md:grid-cols-[1.3fr_0.7fr]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="absolute right-3 top-3 z-20 rounded-md bg-white/90 p-2 text-zinc-600 shadow-sm transition hover:bg-zinc-100"
                aria-label="Fechar preview"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="relative min-h-[360px] bg-zinc-100 md:min-h-[620px]">
                <Image
                  src={selectedFile.url}
                  alt={getFileName(selectedFile)}
                  fill
                  sizes="(max-width: 768px) 100vw, 760px"
                  className="object-contain p-4"
                  priority
                />
              </div>

              <aside className="max-h-[92vh] overflow-y-auto p-6">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Preview da mídia
                  </p>

                  <h2 className="mt-2 break-words text-xl font-semibold text-zinc-900">
                    {getFileName(selectedFile)}
                  </h2>

                  <p className="mt-2 inline-flex rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                    {getCollectionLabel(selectedFile.collection)}
                  </p>
                </div>

                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-zinc-500">
                      URL
                    </dt>

                    <dd className="mt-1 break-all rounded-md bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
                      {selectedFile.url}
                    </dd>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">
                        Tamanho
                      </dt>

                      <dd className="mt-1 text-zinc-800">
                        {formatBytes(selectedFile.size)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">
                        Tipo
                      </dt>

                      <dd className="mt-1 text-zinc-800">
                        {selectedFile.mime_type || '—'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">
                        Enviada em
                      </dt>

                      <dd className="mt-1 text-zinc-800">
                        {formatDate(selectedFile.created_at)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">
                        Disco
                      </dt>

                      <dd className="mt-1 text-zinc-800">
                        {selectedFile.disk}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold text-zinc-500">
                      Caminho
                    </dt>

                    <dd className="mt-1 break-all rounded-md bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
                      {selectedFile.path}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedFile)}
                    aria-pressed={copiedFileId === selectedFile.id}
                    aria-label={
                      copiedFileId === selectedFile.id
                        ? 'URL copiada'
                        : 'Copiar URL da imagem'
                    }
                    className="
                      w-full bg-primary text-white py-3 rounded-md transition
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                      focus-visible:ring-primary active:scale-[.98] cursor-pointer
                      inline-flex items-center justify-center gap-2 text-sm font-semibold
                    "
                  >
                    {copiedFileId === selectedFile.id ? (
                      '✓ Copiado!'
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Copiar URL
                      </>
                    )}
                  </button>

                  <a
                    href={selectedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 active:scale-95"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Abrir imagem
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedFile)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remover imagem
                  </button>
                </div>
              </aside>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}