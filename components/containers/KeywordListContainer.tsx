'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import Reveal from '@/components/animations/Reveal';
import KeywordBadge from '@/components/ui/KeywordBadge';

import {
  createKeyword,
  deleteKeyword,
  updateKeyword,
  type Keyword,
  type KeywordPaginationMeta,
} from '@/services/keyword';

import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface KeywordListContainerProps {
  keywords: Keyword[];
  pagination?: KeywordPaginationMeta;
  filters?: {
    busca?: string;
  };
}

export default function KeywordListContainer({
  keywords,
  pagination,
  filters,
}: KeywordListContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirmDialog();

  const stickySentinelRef = useRef<HTMLDivElement | null>(null);

  const [localKeywords, setLocalKeywords] = useState<Keyword[]>(
    Array.isArray(keywords) ? keywords : []
  );

  const [isMobileSticky, setIsMobileSticky] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [term, setTerm] = useState(filters?.busca || '');
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentPage = pagination?.current_page || 1;
  const lastPage = pagination?.last_page || 1;

  const normalizedTerm = term.trim().toLowerCase();

  const hasActiveFilters = Boolean(filters?.busca);
  const shouldHideActionsOnMobile = isMobileSticky && !isMobileFilterOpen;

  const visibleKeywords = useMemo(() => {
    const safe = Array.isArray(localKeywords) ? localKeywords : [];

    if (!filters?.busca) {
      return safe;
    }

    const search = filters.busca.trim().toLowerCase();

    return safe.filter((keyword) =>
      keyword.word.toLowerCase().includes(search)
    );
  }, [localKeywords, filters?.busca]);

  const keywordAlreadyExists = useMemo(() => {
    if (!normalizedTerm) return false;

    return localKeywords.some(
      (keyword) =>
        keyword.word.toLowerCase() === normalizedTerm &&
        keyword.id !== editingKeyword?.id
    );
  }, [localKeywords, normalizedTerm, editingKeyword?.id]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(lastPage, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, lastPage]);

  useEffect(() => {
    setLocalKeywords(Array.isArray(keywords) ? keywords : []);
  }, [keywords]);

  useEffect(() => {
    setTerm(filters?.busca || '');
  }, [filters?.busca]);

  useEffect(() => {
    const sentinel = stickySentinelRef.current;
    if (!sentinel) return;

    function isMobileViewport() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextSticky = isMobileViewport() && !entry.isIntersecting;

        setIsMobileSticky((current) => {
          if (current === nextSticky) return current;
          return nextSticky;
        });

        if (!nextSticky) {
          setIsMobileFilterOpen(false);
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-16px 0px 0px 0px',
      }
    );

    observer.observe(sentinel);

    function handleResize() {
      if (!isMobileViewport()) {
        setIsMobileSticky(false);
        setIsMobileFilterOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

    router.push(
      query
        ? `/admin/artigos/palavras-chave?${query}`
        : '/admin/artigos/palavras-chave'
    );
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingKeyword) {
      handleSaveKeyword();
      return;
    }

    pushWithQuery({
      busca: normalizedTerm || null,
      page: 1,
    });
  }

  function handleClearInput() {
    setTerm('');

    if (editingKeyword) {
      setEditingKeyword(null);
    }
  }

  function handleClearFilters() {
    setTerm('');
    setEditingKeyword(null);
    setIsMobileFilterOpen(false);
    router.push('/admin/artigos/palavras-chave');
  }

  function handlePageChange(page: number) {
    pushWithQuery({
      page,
    });
  }

  function handleEdit(keyword: Keyword) {
    setEditingKeyword(keyword);
    setTerm(keyword.word);
  }

  function handleCancelEdit() {
    setEditingKeyword(null);
    setTerm(filters?.busca || '');
  }

  async function handleSaveKeyword() {
    if (!normalizedTerm) {
      await confirm({
        title: 'Informe uma palavra-chave',
        description: 'Digite uma palavra-chave antes de salvar.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    if (keywordAlreadyExists) {
      await confirm({
        title: 'Palavra-chave já existe',
        description: 'Já existe uma palavra-chave cadastrada com esse nome.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    setIsSaving(true);

    const result = editingKeyword
      ? await updateKeyword(editingKeyword.id, normalizedTerm)
      : await createKeyword(normalizedTerm);

    setIsSaving(false);

    if (!result) {
      await confirm({
        title: 'Erro ao salvar',
        description:
          'Não foi possível salvar a palavra-chave. Verifique se ela já existe ou tente novamente.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    setLocalKeywords((current) => {
      if (editingKeyword) {
        return current
          .map((keyword) =>
            keyword.id === editingKeyword.id ? result : keyword
          )
          .sort((a, b) => a.word.localeCompare(b.word, 'pt-BR'));
      }

      const exists = current.some((keyword) => keyword.id === result.id);

      if (exists) {
        return current
          .map((keyword) => (keyword.id === result.id ? result : keyword))
          .sort((a, b) => a.word.localeCompare(b.word, 'pt-BR'));
      }

      return [...current, result].sort((a, b) =>
        a.word.localeCompare(b.word, 'pt-BR')
      );
    });

    await confirm({
      title: editingKeyword
        ? 'Palavra-chave atualizada'
        : 'Palavra-chave criada',
      description: editingKeyword
        ? 'A palavra-chave foi atualizada com sucesso.'
        : 'A palavra-chave foi cadastrada com sucesso.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });

    setTerm('');
    setEditingKeyword(null);

    router.refresh();
  }

  async function handleDelete(keyword: Keyword) {
    const confirmed = await confirm({
      title: 'Remover palavra-chave?',
      description: `A palavra-chave "${keyword.word}" será removida do sistema. Essa ação não pode ser desfeita.`,
      confirmText: 'Remover palavra-chave',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteKeyword(keyword.id);

    if (!success) {
      await confirm({
        title: 'Erro ao remover',
        description:
          'Não foi possível remover a palavra-chave agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    setLocalKeywords((current) =>
      current.filter((item) => item.id !== keyword.id)
    );

    if (editingKeyword?.id === keyword.id) {
      setEditingKeyword(null);
      setTerm('');
    }

    await confirm({
      title: 'Palavra-chave removida',
      description: 'A palavra-chave foi removida com sucesso.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });

    router.refresh();
  }

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6 selection:bg-primary selection:text-white">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={() => router.push('/admin/artigos')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Voltar para artigos
        </button>
      </div>

      <header className="mt-8 mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Palavras-chave
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
          Gerencie os termos usados para organizar, filtrar e encontrar os
          artigos publicados no site.
        </p>
      </header>

      <Reveal>
        <div className="space-y-8">
          <div ref={stickySentinelRef} className="h-px" />

          <section
            className={`
              sticky top-4 z-30 rounded-md border border-gray-200 bg-white p-4
              transition-shadow duration-200
              ${
                isMobileSticky
                  ? 'shadow-[0_12px_18px_-18px_rgba(0,0,0,0.65)]'
                  : ''
              }
            `}
          >
            <form onSubmit={handleFilterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative min-w-0">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />

                <input
                    type="text"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder={
                        editingKeyword
                        ? 'Editar palavra-chave...'
                        : 'Buscar ou criar palavra-chave...'
                    }
                    className="
                        h-12 w-full rounded-md border border-gray-200 bg-white
                        pl-10 pr-10 text-sm outline-none transition
                        focus:border-primary focus:ring-2 focus:ring-primary/10
                    "
                    maxLength={255}
                />

                  {term && (
                    <button
                      type="button"
                      onClick={handleClearInput}
                      className="
                        absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1
                        text-gray-400 transition hover:bg-gray-100 hover:text-gray-600
                        cursor-pointer
                      "
                      aria-label="Limpar campo"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div
                  className={`
                    flex h-12 min-w-0 gap-2
                    ${shouldHideActionsOnMobile ? 'hidden md:flex' : ''}
                  `}
                >
                  {editingKeyword && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="
                        inline-flex h-12 items-center justify-center
                        rounded-md border border-gray-200 bg-white px-4
                        text-sm font-semibold text-gray-700 transition
                        hover:bg-gray-50 active:scale-95 cursor-pointer
                      "
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    type="submit"
                    className="
                      inline-flex h-12 flex-1 cursor-pointer items-center justify-center
                      rounded-md bg-primary px-4 text-sm font-semibold
                      text-white transition hover:brightness-110 active:scale-95 md:flex-none
                    "
                  >
                    {editingKeyword ? 'Salvar' : 'Filtrar'}
                  </button>

                  {!editingKeyword && normalizedTerm && (
                    <button
                      type="button"
                      onClick={handleSaveKeyword}
                      disabled={isSaving || keywordAlreadyExists}
                      className="
                        inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2
                        rounded-md border border-orange-100 bg-orange-50 px-4
                        text-sm font-semibold text-orange-700 transition
                        hover:border-orange-200 hover:bg-orange-100 active:scale-95 md:flex-none
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Criar
                    </button>
                  )}

                  {hasActiveFilters && !editingKeyword && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="
                        inline-flex h-12 items-center justify-center
                        rounded-md border border-gray-200 bg-white px-4
                        text-sm font-semibold text-gray-700 transition
                        hover:bg-gray-50 active:scale-95 cursor-pointer
                      "
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>
              </div>

              {editingKeyword && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Editando:</span>
                  <KeywordBadge keyword={editingKeyword.word} />
                </div>
              )}

              {keywordAlreadyExists && !editingKeyword && normalizedTerm && (
                <p className="text-xs text-gray-500">
                  Essa palavra-chave já existe. Clique nela abaixo para editar.
                </p>
              )}

              {isMobileSticky && (
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen((current) => !current)}
                  className="
                    flex w-full items-center justify-center gap-2 rounded-md
                    border border-gray-200 bg-white px-3 py-2.5 text-xs
                    font-semibold text-gray-700 transition active:scale-[0.99] md:hidden
                  "
                  aria-expanded={isMobileFilterOpen}
                >
                  {isMobileFilterOpen ? (
                    <>
                      Recolher ações
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Mostrar ações
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </form>

            {pagination && (
              <p className="mt-3 text-xs text-gray-500">
                {pagination.total === 0
                  ? 'Nenhuma palavra-chave encontrada.'
                  : `Mostrando ${pagination.from ?? 0}–${
                      pagination.to ?? 0
                    } de ${pagination.total} palavras-chave.`}
              </p>
            )}
          </section>

          {visibleKeywords.length === 0 ? (
            <div className="rounded-md border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-600">
                Nenhuma palavra-chave encontrada.
              </p>
            </div>
          ) : (
            <section>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Palavras-chave cadastradas"
              >
                {visibleKeywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="
                      group inline-flex items-center gap-1 rounded-md
                      border border-orange-100 bg-orange-50/40 p-1
                      transition hover:border-orange-200 hover:bg-orange-50
                    "
                  >
                    <button
                      type="button"
                      onClick={() => handleEdit(keyword)}
                      className="cursor-pointer"
                      title={`Editar ${keyword.word}`}
                      aria-label={`Editar palavra-chave ${keyword.word}`}
                    >
                      <KeywordBadge keyword={keyword.word} />
                    </button>

                    <div
                      className="
                        flex items-center gap-1 pr-1
                        opacity-100 md:opacity-0
                        md:group-hover:opacity-100
                        transition-opacity duration-200
                      "
                    >
                      <button
                        type="button"
                        onClick={() => handleEdit(keyword)}
                        className="
                            p-2.5 rounded-md transition-all active:scale-95
                            text-gray-600 bg-gray-100
                            hover:bg-orange-500/20 hover:text-orange-600
                            cursor-pointer
                        "
                        title="Editar palavra-chave"
                        aria-label="Editar palavra-chave"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(keyword)}
                        className="
                            p-2.5 text-red-600 bg-red-500/10 hover:bg-red-500/20
                            rounded-md transition-all active:scale-95 cursor-pointer
                        "
                        title="Deletar palavra-chave"
                        aria-label="Deletar palavra-chave"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pagination && pagination.last_page > 1 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 pt-4"
              aria-label="Paginação de palavras-chave"
            >
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="
                  cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2
                  text-sm font-semibold text-gray-700 transition
                  hover:bg-gray-50 active:scale-95
                  disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                Anterior
              </button>

              {currentPage > 3 && lastPage > 5 && (
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
                const isCurrent = page === currentPage;

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

              {currentPage < lastPage - 2 && lastPage > 5 && (
                <>
                  <span className="px-1 text-sm text-gray-400">...</span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(lastPage)}
                    className="
                      cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2
                      text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95
                    "
                  >
                    {lastPage}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
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
      </Reveal>
    </main>
  );
}
