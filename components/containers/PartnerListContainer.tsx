'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Pencil, Search, Trash2, X } from 'lucide-react';

import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import {
  deletePartner,
  storageUrlToPath,
  updatePartner,
} from '@/services/partners';

import type {
  PartnerApiItem,
  PartnerListFilters,
  PartnerPaginationMeta,
  PartnerStatusFilter,
} from '@/types/partner';

interface PartnerListContainerProps {
  partners: PartnerApiItem[];
  pagination?: PartnerPaginationMeta;
  filters?: PartnerListFilters;
}

const ADMIN_PARTNERS_PATH = '/admin/parceiros';
const ADMIN_PARTNERS_RETURN_PATH_KEY = 'admin.partners.returnPath';

const statusOptions: {
  value: PartnerStatusFilter;
  label: string;
}[] = [
  {
    value: 'all',
    label: 'Todos',
  },
  {
    value: 'active',
    label: 'Ativos',
  },
  {
    value: 'inactive',
    label: 'Inativos',
  },
];

function normalizeStatus(status?: string): PartnerStatusFilter {
  if (status === 'active' || status === 'inactive' || status === 'all') {
    return status;
  }

  return 'all';
}

export default function PartnerListContainer({
  partners,
  pagination,
  filters,
}: PartnerListContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirmDialog();

  const filterRef = useRef<HTMLElement | null>(null);

  const [search, setSearch] = useState(filters?.busca || '');
  const [statusFilter, setStatusFilter] = useState<PartnerStatusFilter>(
    normalizeStatus(filters?.status)
  );
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const safePartners = Array.isArray(partners) ? partners : [];

  const currentPage = pagination?.current_page || filters?.page || 1;
  const lastPage = pagination?.last_page || 1;

  const hasActiveFilters = Boolean(
    filters?.busca?.trim() || normalizeStatus(filters?.status) !== 'all'
  );

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
    setSearch(filters?.busca || '');
    setStatusFilter(normalizeStatus(filters?.status));
  }, [filters?.busca, filters?.status]);

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

  function getCurrentListPath() {
    const query = searchParams.toString();

    return query ? `${ADMIN_PARTNERS_PATH}?${query}` : ADMIN_PARTNERS_PATH;
  }

  function saveReturnPath() {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(
      ADMIN_PARTNERS_RETURN_PATH_KEY,
      getCurrentListPath()
    );
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

    router.push(query ? `${ADMIN_PARTNERS_PATH}?${query}` : ADMIN_PARTNERS_PATH);
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    pushWithQuery({
      busca: search.trim() || null,
      status: statusFilter === 'all' ? null : statusFilter,
      page: 1,
    });
  }

  function handleClearFilters() {
    setSearch('');
    setStatusFilter('all');

    router.push(ADMIN_PARTNERS_PATH);
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

  const handleToggleActive = async (partner: PartnerApiItem) => {
    try {
      await updatePartner(partner.id, {
        name: partner.name,
        logo_path: storageUrlToPath(partner.logo_url),
        website_url: partner.website_url || null,
        bg_color: partner.bg_color || '#ffffff',
        order: partner.order ?? 0,
        is_active: !partner.is_active,
      });

      router.refresh();
    } catch (error) {
      await confirm({
        title: 'Erro ao atualizar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível alterar o status do parceiro agora.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    }
  };

  const handleDelete = async (partnerId: number, name: string) => {
    const confirmed = await confirm({
      title: 'Remover parceiro?',
      description: `O parceiro "${name}" será removido permanentemente. Essa ação não pode ser desfeita.`,
      confirmText: 'Remover parceiro',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deletePartner(partnerId);

    if (success) {
      await confirm({
        title: 'Parceiro removido',
        description: 'O parceiro foi removido com sucesso.',
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
        'Não foi possível remover o parceiro agora. Tente novamente em alguns instantes.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'danger',
    });
  };

  const handleOpenPartner = (partner: PartnerApiItem) => {
    if (!partner.website_url) return;

    window.open(partner.website_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          Painel de Controle de Parceiros
        </h1>

        <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-block border border-emerald-100">
          Gerencie logos, links, cores, ordem e exibição pública dos parceiros.
        </p>
      </header>

      <div className="space-y-8">
        <Link
          href={`${ADMIN_PARTNERS_PATH}/novo`}
          onClick={saveReturnPath}
          className="
            w-full min-h-[245px]
            flex items-center justify-center
            border border-dashed border-gray-300
            rounded-md
            hover:border-orange-400
            hover:bg-orange-50/50
            transition-colors
            group
            cursor-pointer
          "
        >
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div
              className="
                w-16 h-16 rounded-full
                bg-orange-100 text-orange-600
                flex items-center justify-center
                text-5xl font-extralight
                transition-transform
                group-hover:scale-110
              "
            >
              +
            </div>

            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-800">
                Criar Novo Parceiro
              </p>

              <p className="text-sm text-gray-600 max-w-xs">
                Cadastre uma nova marca parceira direto no sistema.
              </p>
            </div>
          </div>
        </Link>

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
          <form
            onSubmit={handleFilterSubmit}
            className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar parceiro..."
                className="w-full rounded-md border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as PartnerStatusFilter)
              }
              className="w-full cursor-pointer rounded-md border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              aria-label="Filtrar parceiros por status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
              >
                Filtrar
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex cursor-pointer items-center justify-center rounded-md bg-red-200 px-3 py-3 text-gray-600 transition hover:bg-red-300 active:scale-95"
                  aria-label="Limpar filtros"
                  title="Limpar filtros"
                >
                  <X className="h-4 w-4 text-red-600" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>

          {pagination && (
            <p className="mt-3 text-xs text-gray-500">
              {pagination.total === 0
                ? 'Nenhum parceiro encontrado.'
                : `Mostrando ${pagination.from ?? 0}–${pagination.to ?? 0} de ${pagination.total} parceiros.`}
            </p>
          )}
        </section>

        <section className="rounded-md border border-orange-100 bg-orange-50 px-4 py-3">
          <p className="text-xs font-medium text-orange-800">
            Clique em <strong>Ativo</strong> ou <strong>Inativo</strong> para
            definir se o parceiro aparece no site.
          </p>
        </section>

        {safePartners.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {safePartners.map((partner, index) => {
              const isInactive = !partner.is_active;
              const hasWebsite = Boolean(partner.website_url);

              return (
                <article
                  key={partner.id}
                  role={hasWebsite ? 'link' : undefined}
                  tabIndex={hasWebsite ? 0 : undefined}
                  onClick={() => handleOpenPartner(partner)}
                  onKeyDown={(event) => {
                    if (!hasWebsite) return;

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenPartner(partner);
                    }
                  }}
                  className={`
                    group overflow-hidden rounded-md border shadow-sm
                    transition-all
                    hover:-translate-y-1
                    hover:shadow-md
                    ${hasWebsite ? 'cursor-pointer' : 'cursor-default'}
                    ${
                      isInactive
                        ? 'border-zinc-200 bg-zinc-50'
                        : 'border-zinc-100 bg-white'
                    }
                  `}
                >
                  <div
                    className="relative flex h-36 w-full items-center justify-center overflow-hidden md:h-40"
                    style={{
                      backgroundColor: partner.bg_color || '#ffffff',
                    }}
                  >
                    {isInactive && (
                      <div className="absolute inset-0 z-10 bg-zinc-100/55" />
                    )}

                    {partner.logo_url ? (
                      <Image
                        src={partner.logo_url}
                        alt={`Parceiro ${partner.name}`}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 360px"
                        priority={index < 6}
                        unoptimized
                        className={`
                          object-contain p-8 transition duration-500 group-hover:scale-105
                          ${isInactive ? 'opacity-75 saturate-50' : ''}
                        `}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-zinc-400">
                        Sem logo
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 z-20 bg-black/0 transition group-hover:bg-black/5" />

                    <div
                      className="
                        absolute left-4 top-4 z-30
                        translate-y-0 opacity-100
                        md:-translate-y-1 md:opacity-0
                        transition
                        md:group-hover:translate-y-0 md:group-hover:opacity-100
                      "
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleActive(partner)}
                        className={`
                          pointer-events-auto rounded-md px-3 py-1 text-[11px] font-bold shadow-sm transition
                          ${
                            partner.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                          }
                        `}
                        title={
                          partner.is_active
                            ? 'Clique para deixar inativo'
                            : 'Clique para deixar ativo'
                        }
                      >
                        {partner.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>

                    <div
                      className="
                        absolute right-4 top-4 z-30 flex items-center gap-2
                        translate-y-0 opacity-100
                        md:-translate-y-1 md:opacity-0
                        transition
                        md:group-hover:translate-y-0 md:group-hover:opacity-100
                      "
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Link
                        href={`${ADMIN_PARTNERS_PATH}/${partner.id}/editar`}
                        onClick={saveReturnPath}
                        className="
                          w-10 h-10
                          flex items-center justify-center
                          rounded-xl
                          bg-white
                          text-gray-600
                          border border-gray-200
                          shadow-md
                          transition-all
                          hover:bg-orange-500
                          hover:text-white
                          hover:border-orange-500
                          hover:shadow-lg
                          active:scale-95
                          cursor-pointer
                        "
                        title="Editar parceiro"
                        aria-label="Editar parceiro"
                      >
                        <Pencil size={17} aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(partner.id, partner.name)}
                        title="Remover parceiro"
                        aria-label="Remover parceiro"
                        className="
                          w-10 h-10
                          flex items-center justify-center
                          rounded-xl
                          bg-white
                          text-red-500
                          border border-gray-200
                          shadow-md
                          transition-all
                          hover:bg-red-500
                          hover:text-white
                          hover:border-red-500
                          hover:shadow-lg
                          active:scale-95
                        "
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2
                          className={`
                            truncate text-base font-bold
                            ${
                              partner.is_active
                                ? 'text-zinc-900'
                                : 'text-zinc-500'
                            }
                          `}
                        >
                          {partner.name}
                        </h2>

                        <p className="mt-1 text-xs text-zinc-500">
                          Ordem {partner.order ?? index + 1}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleActive(partner);
                        }}
                        className={`
                          shrink-0 rounded-md px-3 py-1 text-[11px] font-bold transition md:hidden
                          ${
                            partner.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                          }
                        `}
                      >
                        {partner.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>

                    <div className="mt-3 border-t border-zinc-100 pt-3">
                      {partner.website_url ? (
                        <p
                          className="inline-flex max-w-full items-center gap-1 truncate text-xs text-zinc-500"
                          title={partner.website_url}
                        >
                          <span className="truncate">
                            {partner.website_url}
                          </span>

                          <ExternalLink
                            className="h-3 w-3 shrink-0"
                            aria-hidden="true"
                          />
                        </p>
                      ) : (
                        <p className="truncate text-xs text-zinc-400">
                          Sem site cadastrado
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <h2 className="text-lg font-semibold text-zinc-900">
                Nenhum parceiro encontrado
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Ajuste os filtros ou cadastre um novo parceiro para exibir na
                seção pública do site.
              </p>

              <Link
                href={`${ADMIN_PARTNERS_PATH}/novo`}
                onClick={saveReturnPath}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
              >
                Novo parceiro
              </Link>
            </div>
          </section>
        )}

        {pagination && pagination.last_page > 1 && (
          <nav
            className="flex flex-wrap items-center justify-center gap-2 pt-4"
            aria-label="Paginação de parceiros"
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
    </main>
  );
}
