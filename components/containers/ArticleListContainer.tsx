'use client';

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

import ArticleRow from '@/components/ui/ArticleRow';
import Reveal from '@/components/animations/Reveal';

import type {
  Article,
  ArticleListFilters,
  PaginationMeta,
} from '@/types/article';

import { deleteArticle } from '@/services/articles';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface ArticleListContainerProps {
  articles: Article[];
  pagination?: PaginationMeta;
  filters?: ArticleListFilters;
  keywordSuggestions?: string[];
  isAdmin?: boolean;
}

type ArticleOrder = 'recentes' | 'antigas' | 'az';

const sortOptions: {
  value: ArticleOrder;
  label: string;
}[] = [
  {
    value: 'recentes',
    label: 'Mais recentes',
  },
  {
    value: 'antigas',
    label: 'Mais antigas',
  },
  {
    value: 'az',
    label: 'A-Z',
  },
];

const ADMIN_ARTICLES_RETURN_PATH_KEY = 'admin.articles.returnPath';

function normalizeOrder(order?: ArticleListFilters['ordem']): ArticleOrder {
  if (order === 'recentes' || order === 'antigas' || order === 'az') {
    return order;
  }

  return 'recentes';
}

function normalizeKeyword(keyword: string) {
  return keyword.trim();
}

function normalizeSearchText(value?: string | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getKeywordTerms(value?: string | null) {
  return normalizeSearchText(value)
    .split(/[,\s]+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

function getKeywordDraftPrefix(value: string) {
  const match = value.match(/^(.*?)([^,\s]*)$/);

  return match?.[1] || '';
}

function getKeywordDraftLastTerm(value: string) {
  const parts = value.split(/[,\s]+/);

  return parts[parts.length - 1] || '';
}

function mergeKeywordSuggestion(currentValue: string, suggestion: string) {
  const prefix = getKeywordDraftPrefix(currentValue);
  const nextValue = `${prefix}${suggestion}`.trim();

  const terms = getKeywordTerms(nextValue);

  return Array.from(new Set(terms)).join(' ');
}

function removeKeywordTerm(currentValue: string, termToRemove: string) {
  const normalizedToRemove = normalizeSearchText(termToRemove);

  return getKeywordTerms(currentValue)
    .filter((term) => term !== normalizedToRemove)
    .join(' ');
}

export default function ArticleListContainer({
  articles,
  pagination,
  filters,
  keywordSuggestions,
  isAdmin = false,
}: ArticleListContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirmDialog();

  const filterRef = useRef<HTMLElement | null>(null);
  const keywordBoxRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isMobileSticky, setIsMobileSticky] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isKeywordOpen, setIsKeywordOpen] = useState(false);

  const [busca, setBusca] = useState(filters?.busca || '');
  const [palavra, setPalavra] = useState(filters?.palavra || '');
  const [ordem, setOrdem] = useState<ArticleOrder>(
    normalizeOrder(filters?.ordem)
  );

  const safeArticles = Array.isArray(articles) ? articles : [];

  const currentPage = pagination?.current_page || 1;
  const lastPage = pagination?.last_page || 1;

  const shouldHideExtraMobileFilters = isMobileSticky && !isMobileFilterOpen;

  const keywordTerms = useMemo(() => getKeywordTerms(palavra), [palavra]);

  const hasActiveFilters = Boolean(
    filters?.busca ||
      filters?.palavra ||
      (filters?.ordem && filters.ordem !== 'recentes')
  );

  const fallbackKeywordSuggestions = useMemo(() => {
    const keywords = safeArticles.flatMap((article) => article.keywords || []);

    return Array.from(
      new Set(
        keywords
          .map(normalizeKeyword)
          .filter((keyword) => keyword.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [safeArticles]);

  const availableKeywordSuggestions = useMemo(() => {
    const source =
      Array.isArray(keywordSuggestions) && keywordSuggestions.length > 0
        ? keywordSuggestions
        : fallbackKeywordSuggestions;

    return Array.from(
      new Set(
        source
          .map(normalizeKeyword)
          .filter((keyword) => keyword.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [keywordSuggestions, fallbackKeywordSuggestions]);

  const filteredKeywordSuggestions = useMemo(() => {
    const selectedTerms = new Set(keywordTerms);
    const lastTerm = normalizeSearchText(getKeywordDraftLastTerm(palavra));

    return availableKeywordSuggestions
      .filter((keyword) => {
        const normalizedKeyword = normalizeSearchText(keyword);

        if (selectedTerms.has(normalizedKeyword)) {
          return false;
        }

        if (!lastTerm) {
          return true;
        }

        return normalizedKeyword.includes(lastTerm);
      })
      .slice(0, 8);
  }, [availableKeywordSuggestions, keywordTerms, palavra]);

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
    if (!isAdmin) return;

    function updateStickyState() {
      const element = filterRef.current;
      if (!element) return;

      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const nextSticky = isMobile && element.getBoundingClientRect().top <= 16;

      setIsMobileSticky((current) => {
        if (current === nextSticky) return current;
        return nextSticky;
      });

      if (!nextSticky) {
        setIsMobileFilterOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (rafRef.current) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateStickyState();
      });
    }

    updateStickyState();

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isAdmin]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!keywordBoxRef.current) return;

      if (!keywordBoxRef.current.contains(event.target as Node)) {
        setIsKeywordOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getCurrentListPath() {
    const query = searchParams.toString();

    return query ? `/admin/artigos?${query}` : '/admin/artigos';
  }

  function saveReturnPath() {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(ADMIN_ARTICLES_RETURN_PATH_KEY, getCurrentListPath());
  }

  function navigateFromList(href: string) {
    saveReturnPath();
    router.push(href);
  }

  function handleArticleKeyDown(
    event: KeyboardEvent<HTMLLIElement>,
    articleId: number
  ) {
    if (!isAdmin) return;

    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    navigateFromList(`/admin/artigos/${articleId}`);
  }

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

    router.push(query ? `/admin/artigos?${query}` : '/admin/artigos');
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    pushWithQuery({
      busca: busca.trim() || null,
      palavra: keywordTerms.length > 0 ? keywordTerms.join(' ') : null,
      ordem: ordem === 'recentes' ? null : ordem,
      page: 1,
    });
  }

  function handleClearFilters() {
    setBusca('');
    setPalavra('');
    setOrdem('recentes');
    setIsKeywordOpen(false);
    setIsMobileFilterOpen(false);

    router.push('/admin/artigos');
  }

  function handlePageChange(page: number) {
    pushWithQuery({
      page,
    });
  }

  function handleKeywordSelect(keyword: string) {
    setPalavra((current) => mergeKeywordSuggestion(current, keyword));
    setIsKeywordOpen(true);
  }

  function handleRemoveKeywordTerm(term: string) {
    setPalavra((current) => removeKeywordTerm(current, term));
    setIsKeywordOpen(false);
  }

  const handleDelete = async (articleId: number) => {
    const confirmed = await confirm({
      title: 'Remover artigo?',
      description:
        'Esse artigo será removido do sistema. Essa ação não pode ser desfeita.',
      confirmText: 'Remover artigo',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteArticle(articleId);

    if (success) {
      await confirm({
        title: 'Artigo removido',
        description: 'O artigo foi removido com sucesso.',
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
        'Não foi possível remover o artigo agora. Tente novamente em alguns instantes.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'danger',
    });
  };

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          {isAdmin ? 'Painel de Controle de Artigos' : 'Artigos do Centro Dia'}
        </h1>

        {isAdmin && (
          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block border border-emerald-100">
            Painel conectado ao banco de dados. Alterações são refletidas em
            tempo real.
          </p>
        )}
      </header>

      <Reveal>
        <div className="space-y-8">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigateFromList('/admin/artigos/novo')}
              className="
                w-full min-h-[245px]
                flex items-center justify-center
                border border-dashed border-gray-300
                rounded-2xl
                hover:border-orange-400
                hover:bg-orange-50/50
                transition-colors
                group
                cursor-pointer
              "
            >
              <div className="flex flex-col items-center gap-4 text-center p-8">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-5xl font-extralight transition-transform group-hover:scale-110">
                  +
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-800">
                    Criar Novo Artigo
                  </p>

                  <p className="text-sm text-gray-600 max-w-xs">
                    Publique uma nova matéria direto no sistema.
                  </p>
                </div>
              </div>
            </button>
          )}

          {isAdmin && (
            <section
              ref={filterRef}
              className={`
                sticky top-4 z-30 rounded-md border border-gray-200 bg-zinc-50 p-4
                transition-shadow duration-200
                ${
                  isMobileSticky
                    ? 'shadow-[0_12px_18px_-18px_rgba(0,0,0,0.65)]'
                    : ''
                }
              `}
            >
              <form onSubmit={handleFilterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px_180px_auto] md:items-start">
                  <div className="relative min-w-0">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />

                    <input
                      type="search"
                      value={busca}
                      onChange={(event) => setBusca(event.target.value)}
                      placeholder="Buscar artigo..."
                      className="h-12 w-full rounded-md border border-gray-200 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div
                    ref={keywordBoxRef}
                    className={`
                      relative min-w-0
                      ${
                        shouldHideExtraMobileFilters
                          ? 'hidden md:block'
                          : 'block'
                      }
                    `}
                  >
                    <div className="relative">
                      <Tag
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />

                      <input
                        type="text"
                        value={palavra}
                        onFocus={() => setIsKeywordOpen(true)}
                        onChange={(event) => {
                          setPalavra(event.target.value);
                          setIsKeywordOpen(true);
                        }}
                        placeholder="Palavras-chave"
                        className="h-12 w-full rounded-md border border-gray-200 pl-10 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />

                      {palavra && (
                        <button
                          type="button"
                          onClick={() => {
                            setPalavra('');
                            setIsKeywordOpen(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                          aria-label="Limpar palavras-chave"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {keywordTerms.length > 0 && (
                      <div className="mt-2 flex max-h-16 flex-wrap gap-1.5 overflow-y-auto pr-1">
                        {keywordTerms.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleRemoveKeywordTerm(term)}
                            className="
                              inline-flex items-center gap-1 rounded-md border border-orange-100
                              bg-orange-50 px-2 py-1 text-[11px] font-semibold
                              text-orange-700 transition hover:border-orange-200 hover:bg-orange-100
                            "
                            title={`Remover ${term}`}
                          >
                            <span className="max-w-[120px] truncate">
                              {term}
                            </span>

                            <X
                              className="h-3 w-3 shrink-0"
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {isKeywordOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredKeywordSuggestions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {filteredKeywordSuggestions.map((keyword) => {
                                const normalizedKeyword =
                                  normalizeSearchText(keyword);

                                const selected =
                                  keywordTerms.includes(normalizedKeyword);

                                return (
                                  <button
                                    key={keyword}
                                    type="button"
                                    onClick={() =>
                                      handleKeywordSelect(keyword)
                                    }
                                    className={`
                                      rounded-md border px-3 py-1.5 text-xs font-semibold transition cursor-pointer
                                      ${
                                        selected
                                          ? 'border-primary bg-primary text-white'
                                          : 'border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-200 hover:bg-orange-100'
                                      }
                                    `}
                                  >
                                    {keyword}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="px-3 py-2 text-xs text-gray-500">
                              Nenhuma palavra-chave encontrada.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <select
                    value={ordem}
                    onChange={(event) =>
                      setOrdem(event.target.value as ArticleOrder)
                    }
                    className={`
                      h-12 w-full min-w-0 cursor-pointer rounded-md border border-gray-200 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10
                      ${
                        shouldHideExtraMobileFilters ? 'hidden md:block' : ''
                      }
                    `}
                    aria-label="Ordenar artigos"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div
                    className={`
                      flex h-12 min-w-0 gap-2
                      ${
                        shouldHideExtraMobileFilters ? 'hidden md:flex' : ''
                      }
                    `}
                  >
                    <button
                      type="submit"
                      className="
                        inline-flex h-12 flex-1 cursor-pointer items-center justify-center
                        rounded-md bg-primary px-4 text-sm font-semibold
                        text-white transition hover:brightness-110 active:scale-95 md:flex-none
                      "
                    >
                      Filtrar
                    </button>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="
                          inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center
                          rounded-md bg-red-200 text-gray-600
                          transition hover:bg-red-300 active:scale-95
                        "
                        aria-label="Limpar filtros"
                        title="Limpar filtros"
                      >
                        <X className="h-4 w-4 text-red-600" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {keywordTerms.length > 1 && (
                  <p
                    className={`
                      text-xs text-gray-500
                      ${
                        shouldHideExtraMobileFilters ? 'hidden md:block' : ''
                      }
                    `}
                  >
                    Buscando artigos que contenham todas as palavras-chave:{' '}
                    <strong>{keywordTerms.join(' + ')}</strong>
                  </p>
                )}

                {isMobileSticky && (
                  <button
                    type="button"
                    onClick={() =>
                      setIsMobileFilterOpen((current) => !current)
                    }
                    className="
                      flex w-full items-center justify-center gap-2 rounded-md
                      border border-gray-200 bg-white px-3 py-2.5 text-xs
                      font-semibold text-gray-700 transition active:scale-[0.99] md:hidden
                    "
                    aria-expanded={isMobileFilterOpen}
                  >
                    {isMobileFilterOpen ? (
                      <>
                        Recolher filtros
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Mostrar filtros
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}
              </form>

              {pagination && (
                <p className="mt-3 text-xs text-gray-500">
                  {pagination.total === 0
                    ? 'Nenhum artigo encontrado.'
                    : `Mostrando ${pagination.from ?? 0}–${
                        pagination.to ?? 0
                      } de ${pagination.total} artigos.`}
                </p>
              )}
            </section>
          )}

          {safeArticles.length === 0 ? (
            <div className="bg-white rounded-md p-8 border border-gray-100 text-center">
              <p className="text-gray-600">
                {isAdmin
                  ? 'Nenhum artigo encontrado com os filtros atuais.'
                  : 'Nenhum artigo cadastrado.'}
              </p>
            </div>
          ) : (
            <section className="overflow-hidden rounded-md">
              <ul className="flex flex-col divide-y divide-gray-100">
                {safeArticles.map((article) => (
                  <li
                    key={article.id}
                    role={isAdmin ? 'button' : undefined}
                    tabIndex={isAdmin ? 0 : undefined}
                    aria-label={
                      isAdmin ? `Abrir artigo ${article.title}` : undefined
                    }
                    className="
                      relative group px-4 py-2 flex justify-between items-center
                      transition-all hover:bg-gray-50/70 cursor-pointer
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-primary/40 focus-visible:ring-offset-2
                    "
                    onClick={() =>
                      isAdmin &&
                      navigateFromList(`/admin/artigos/${article.id}`)
                    }
                    onKeyDown={(event) =>
                      handleArticleKeyDown(event, article.id)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <ArticleRow article={article} isAdmin={isAdmin} />
                    </div>

                    {isAdmin && (
                      <div
                        className="
                          ml-6 flex items-center gap-2 z-10
                          opacity-100 md:opacity-0
                          translate-x-0 md:translate-x-2
                          md:group-hover:opacity-100
                          md:group-hover:translate-x-0
                          transition-all duration-200
                        "
                      >
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigateFromList(
                              `/admin/artigos/${article.id}/editar`
                            );
                          }}
                          className="
                            p-2.5 rounded-xl transition-all active:scale-95
                            text-gray-600 bg-gray-100
                            hover:bg-orange-500/20 hover:text-orange-600
                            cursor-pointer
                          "
                          title="Editar Artigo"
                          aria-label="Editar artigo"
                        >
                          <Edit3 className="w-5 h-5" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(article.id);
                          }}
                          className="
                            p-2.5 text-red-600 bg-red-500/10 hover:bg-red-500/20
                            rounded-xl transition-all active:scale-95 cursor-pointer
                          "
                          title="Deletar Artigo"
                          aria-label="Deletar artigo"
                        >
                          <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isAdmin && pagination && pagination.last_page > 1 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 pt-4"
              aria-label="Paginação de artigos"
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
