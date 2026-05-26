'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, Edit3, Search, Trash2, X } from 'lucide-react';

import ActivityCard from '@/components/ui/ActivityCard';
import Reveal from '@/components/animations/Reveal';

import type {
  Activity,
  ActivityListFilters,
  PaginationMeta,
} from '@/types/activity';

import { deleteActivity } from '@/services/activities';
import { weekdayOptions } from '@/utils/activitySchedule';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface ActivityListContainerProps {
  activities: Activity[];
  pagination?: PaginationMeta;
  filters?: ActivityListFilters;
  isAdmin?: boolean;
}

type ActivityOrder = 'recentes' | 'antigas' | 'curtidas' | 'az';

const sortOptions: {
  value: ActivityOrder;
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
    value: 'curtidas',
    label: 'Mais curtidas',
  },
  {
    value: 'az',
    label: 'A-Z',
  },
];

const ADMIN_ACTIVITIES_RETURN_PATH_KEY = 'admin.activities.returnPath';

function normalizeOrder(order?: ActivityListFilters['ordem']): ActivityOrder {
  if (
    order === 'recentes' ||
    order === 'antigas' ||
    order === 'curtidas' ||
    order === 'az'
  ) {
    return order;
  }

  return 'recentes';
}

export default function ActivityListContainer({
  activities,
  pagination,
  filters,
  isAdmin = false,
}: ActivityListContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirmDialog();

  const filterRef = useRef<HTMLElement | null>(null);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const [busca, setBusca] = useState(filters?.busca || '');
  const [dia, setDia] = useState(filters?.dia || '');
  const [inicio, setInicio] = useState(filters?.inicio || '');
  const [fim, setFim] = useState(filters?.fim || '');
  const [ordem, setOrdem] = useState<ActivityOrder>(
    normalizeOrder(filters?.ordem)
  );

  const safeActivities = Array.isArray(activities) ? activities : [];

  const currentPage = pagination?.current_page || 1;
  const lastPage = pagination?.last_page || 1;

  const hasActiveFilters = Boolean(
    filters?.busca ||
      filters?.dia ||
      filters?.inicio ||
      filters?.fim ||
      (filters?.ordem && filters.ordem !== 'recentes')
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
    if (!isAdmin) return;

    function handleScroll() {
      const element = filterRef.current;
      if (!element) return;

      setIsFilterSticky(element.getBoundingClientRect().top <= 16);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  function getCurrentListPath() {
    const query = searchParams.toString();

    return query ? `/admin/atividades?${query}` : '/admin/atividades';
  }

  function saveReturnPath() {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(
      ADMIN_ACTIVITIES_RETURN_PATH_KEY,
      getCurrentListPath()
    );
  }

  function navigateFromList(href: string) {
    saveReturnPath();
    router.push(href);
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

    router.push(query ? `/admin/atividades?${query}` : '/admin/atividades');
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    pushWithQuery({
      busca: busca.trim() || null,
      dia: dia || null,
      inicio: inicio || null,
      fim: fim || null,
      ordem: ordem === 'recentes' ? null : ordem,
      page: 1,
    });
  }

  function handleClearFilters() {
    setBusca('');
    setDia('');
    setInicio('');
    setFim('');
    setOrdem('recentes');

    router.push('/admin/atividades');
  }

  function handlePageChange(page: number) {
    pushWithQuery({
      page,
    });
  }

  const handleDelete = async (activityId: number) => {
    const confirmed = await confirm({
      title: 'Remover atividade?',
      description:
        'Essa atividade será removida do sistema. Essa ação não pode ser desfeita.',
      confirmText: 'Remover atividade',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteActivity(activityId);

    if (success) {
      await confirm({
        title: 'Atividade removida',
        description: 'A atividade foi removida com sucesso.',
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
        'Não foi possível remover a atividade agora. Tente novamente em alguns instantes.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'danger',
    });
  };

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          {isAdmin
            ? 'Painel de Controle de Atividades'
            : 'Atividades do Centro Dia'}
        </h1>

        {isAdmin && (
          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block border border-emerald-100">
            Painel conectado ao banco de dados. Alterações são refletidas em tempo real.
          </p>
        )}
      </header>

      <Reveal>
        <div className="space-y-8">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigateFromList('/admin/atividades/novo')}
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
                    Criar Nova Atividade
                  </p>

                  <p className="text-sm text-gray-600 max-w-xs">
                    Publique uma nova atividade direto no sistema.
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
                  isFilterSticky
                    ? 'shadow-[0_12px_18px_-18px_rgba(0,0,0,0.65)]'
                    : ''
                }
              `}
            >
              <form
                onSubmit={handleFilterSubmit}
                className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_150px_150px_180px_auto]"
              >
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />

                  <input
                    type="search"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar atividade..."
                    className="w-full rounded-md border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <select
                  value={dia}
                  onChange={(event) =>
                    setDia(event.target.value as ActivityListFilters['dia'])
                  }
                  className="w-full cursor-pointer rounded-md border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  aria-label="Filtrar por dia da semana"
                >
                  <option value="">Todos os dias</option>

                  {weekdayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Clock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />

                  <input
                    type="time"
                    value={inicio}
                    onChange={(event) => setInicio(event.target.value)}
                    className="w-full cursor-pointer rounded-md border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    aria-label="Horário inicial"
                  />
                </div>

                <div className="relative">
                  <Clock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />

                  <input
                    type="time"
                    value={fim}
                    onChange={(event) => setFim(event.target.value)}
                    className="w-full cursor-pointer rounded-md border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    aria-label="Horário final"
                  />
                </div>

                <select
                  value={ordem}
                  onChange={(event) =>
                    setOrdem(event.target.value as ActivityOrder)
                  }
                  className="w-full cursor-pointer rounded-md border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  aria-label="Ordenar atividades"
                >
                  {sortOptions.map((option) => (
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
                      className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-100 px-3 py-3 text-gray-600 transition hover:bg-gray-200 active:scale-95"
                      aria-label="Limpar filtros"
                      title="Limpar filtros"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </form>

              {pagination && (
                <p className="mt-3 text-xs text-gray-500">
                  {pagination.total === 0
                    ? 'Nenhuma atividade encontrada.'
                    : `Mostrando ${pagination.from ?? 0}–${pagination.to ?? 0} de ${pagination.total} atividades.`}
                </p>
              )}
            </section>
          )}

          {safeActivities.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <p className="text-gray-600">
                {isAdmin
                  ? 'Nenhuma atividade encontrada com os filtros atuais.'
                  : 'Nenhuma atividade cadastrada.'}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {safeActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="
                    relative group
                    bg-white
                    rounded-2xl
                    overflow-hidden
                    shadow-sm
                    border border-gray-100
                    transition-all
                    hover:-translate-y-1
                    hover:shadow-md
                    cursor-pointer
                  "
                  onClick={() =>
                    isAdmin &&
                    navigateFromList(`/admin/atividades/${activity.id}`)
                  }
                >
                  <div className="pointer-events-none">
                    <ActivityCard activity={activity} />
                  </div>

                  {isAdmin && (
                    <div
                      className="
                        absolute top-4 right-4
                        flex items-center gap-2 z-20
                        opacity-100 md:opacity-0
                        translate-y-0 md:-translate-y-1
                        md:group-hover:opacity-100
                        md:group-hover:translate-y-0
                        transition-all duration-200
                      "
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigateFromList(
                            `/admin/atividades/${activity.id}/editar`
                          )
                        }
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
                        title="Editar Atividade"
                        aria-label="Editar atividade"
                      >
                        <Edit3 className="w-5 h-5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(activity.id)}
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
                        title="Deletar Atividade"
                        aria-label="Deletar atividade"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAdmin && pagination && pagination.last_page > 1 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 pt-4"
              aria-label="Paginação de atividades"
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
