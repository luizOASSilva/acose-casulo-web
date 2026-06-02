'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  ActivityIcon,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  HeartHandshake,
  Images,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import {
  getAdminActionLogFilters,
  getAdminActionLogs,
} from '@/services/admin/actionsLogs';

import type {
  AdminActionLogFilterAdmin,
  AdminActionLogItem,
  AdminActionLogPaginationMeta,
} from '@/types/admin/action-log';

type AuditItem = AdminActionLogItem;

function getActionIcon(action?: string) {
  if (!action) return ActivityIcon;

  if (action.includes('media')) return Images;
  if (action.includes('partner')) return HeartHandshake;
  if (action.includes('article')) return FileText;
  if (action.includes('document')) return ShieldCheck;
  if (action.includes('activity')) return ActivityIcon;
  if (action.includes('setting')) return Settings;
  if (action.includes('keyword')) return Tag;

  return ActivityIcon;
}

function getActionVerbIcon(action?: string) {
  if (!action) return Clock;

  if (action.includes('media.created')) return Upload;
  if (action.includes('created')) return Plus;
  if (action.includes('updated')) return Pencil;
  if (action.includes('deleted')) return Trash2;

  return Clock;
}

function getActionLabel(action?: string): string {
  if (!action) return 'ação';

  const last = action.split('.').pop();

  const map: Record<string, string> = {
    created: 'criado',
    updated: 'editado',
    deleted: 'removido',
  };

  if (action.includes('media.created')) return 'enviado';

  return map[last || ''] ?? 'ação';
}

function getActionTone(action?: string) {
  if (!action) {
    return {
      icon: 'bg-zinc-100 text-zinc-600',
      badge: 'border-zinc-200 bg-zinc-100 text-zinc-600',
      item: 'border-transparent bg-transparent',
      accent: '',
    };
  }

  if (action.includes('deleted')) {
    return {
      icon: 'bg-red-50 text-red-600',
      badge: 'border-red-200 bg-red-50 text-red-600',
      item: 'border-red-200 bg-red-50/70 shadow-sm hover:bg-red-50',
      accent:
        'before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-red-500',
    };
  }

  if (action.includes('updated')) {
    return {
      icon: 'bg-zinc-100 text-zinc-700',
      badge: 'border-zinc-200 bg-zinc-100 text-zinc-700',
      item: 'border-transparent bg-transparent',
      accent: '',
    };
  }

  if (action.includes('created') || action.includes('media')) {
    return {
      icon: 'bg-emerald-50 text-emerald-700',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      item: 'border-transparent bg-transparent',
      accent: '',
    };
  }

  return {
    icon: 'bg-zinc-100 text-zinc-600',
    badge: 'border-zinc-200 bg-zinc-100 text-zinc-600',
    item: 'border-transparent bg-transparent',
    accent: '',
  };
}

function getAdminRoleLabel(
  item: AuditItem,
  currentAdminName?: string,
  currentAdminRole?: string
): string | null {
  const itemRole = item.admin?.role;

  if (itemRole === 'master') return 'Master';
  if (itemRole === 'admin') return 'Admin';

  if (
    currentAdminName &&
    item.admin?.name &&
    item.admin.name === currentAdminName
  ) {
    if (currentAdminRole === 'master') return 'Master';
    if (currentAdminRole) return 'Admin';
  }

  if (item.admin?.name && item.admin.name !== 'Sistema') return 'Admin';

  return null;
}

function AdminRoleBadge({ label }: { label: string }) {
  const isMaster = label.toLowerCase() === 'master';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
        ${
          isMaster
            ? 'border-primary/15 bg-primary/10 text-primary'
            : 'border-zinc-200 bg-zinc-100 text-zinc-600'
        }
      `}
    >
      {label}
    </span>
  );
}

function AuditTimelineItem({
  item,
  currentAdminName,
  currentAdminRole,
  canViewDetails,
  isLast,
}: {
  item: AuditItem;
  currentAdminName?: string;
  currentAdminRole?: string;
  canViewDetails: boolean;
  isLast?: boolean;
}) {
  const action = item.action || item.type;
  const Icon = getActionIcon(action);
  const VerbIcon = getActionVerbIcon(action);
  const tone = getActionTone(action);
  const roleLabel = getAdminRoleLabel(item, currentAdminName, currentAdminRole);

  const showDetailsLink = canViewDetails && Boolean(item.id);

  return (
    <article className="group relative grid grid-cols-[46px_minmax(0,1fr)] gap-5 transition-all hover:bg-gray-50/70">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[22px] top-[52px] z-0 w-px bg-zinc-200"
        />
      )}

      <div className="col-start-1 row-start-1 flex justify-center pt-1">
        <div
          className={`
            relative z-10 flex h-10 w-10 items-center justify-center rounded-xl
            ${tone.icon}
          `}
        >
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>

      <div className="col-start-2 row-start-1 pb-5">
        <div
          className={`
            relative rounded-md border px-5 py-4 transition
            ${tone.item}
            ${tone.accent}
          `}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold text-zinc-950">
                  {item.title}
                </h3>

                <span
                  className={`
                    inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                    ${tone.badge}
                  `}
                >
                  <VerbIcon size={11} aria-hidden="true" />
                  {getActionLabel(action)}
                </span>

                {roleLabel && <AdminRoleBadge label={roleLabel} />}
              </div>

              {item.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {item.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-zinc-400">
                  {item.admin?.name && (
                    <span>
                      Por{' '}
                      <span className="font-semibold text-zinc-600">
                        {item.admin.name}
                      </span>
                    </span>
                  )}

                  {item.subject?.name && (
                    <>
                      <span className="hidden text-zinc-300 sm:inline">•</span>

                      <span className="min-w-0 truncate">
                        Item:{' '}
                        <span className="font-medium text-zinc-500">
                          {item.subject.name}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {showDetailsLink && (
                  <Link
                    href={`/admin/auditoria/${item.id}`}
                    className="
                      shrink-0 text-xs font-medium text-primary
                      opacity-100 transition-opacity duration-200
                      hover:brightness-90
                      sm:opacity-0 sm:group-hover:opacity-100
                    "
                  >
                    Ver detalhes →
                  </Link>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-400">
              <Clock size={14} aria-hidden="true" />
              {item.time}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminAuditoriaPage() {
  const { admin } = useAuth();
  const searchParams = useSearchParams();

  const filterRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [items, setItems] = useState<AuditItem[]>([]);
  const [meta, setMeta] = useState<AdminActionLogPaginationMeta | null>(null);
  const [adminOptions, setAdminOptions] = useState<AdminActionLogFilterAdmin[]>(
    []
  );

  const [busca, setBusca] = useState('');
  const [action, setAction] = useState('');
  const [operation, setOperation] = useState('');
  const [adminId, setAdminId] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMobileSticky, setIsMobileSticky] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const adminRole = (admin as { role?: string } | null)?.role;
  const isMaster = adminRole === 'master' || Boolean(admin?.is_master);

  const showDashboardBack = searchParams.get('from') === 'dashboard';

  const filters = useMemo(
    () => ({
      busca,
      action,
      operation,
      admin_id: adminId,
      page,
      per_page: 20,
    }),
    [busca, action, operation, adminId, page]
  );

  const shouldHideExtraMobileFilters = !isMobileFilterOpen;

  async function load(reset = false) {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const json = await getAdminActionLogs(filters);

      const newItems = json.data ?? [];
      const newMeta = json.meta ?? null;

      setItems((current) => (reset ? newItems : [...current, ...newItems]));
      setMeta(newMeta);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar auditoria'
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function loadFilterOptions() {
    setFiltersLoading(true);

    try {
      const json = await getAdminActionLogFilters();
      setAdminOptions(json.admins ?? []);
    } catch {
      setAdminOptions([]);
    } finally {
      setFiltersLoading(false);
    }
  }

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    load(page === 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, action, operation, adminId]);

  useEffect(() => {
    function updateStickyState() {
      const element = filterRef.current;
      if (!element) return;

      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const nextSticky = isMobile && element.getBoundingClientRect().top <= 16;

      setIsMobileSticky((current) => {
        if (current === nextSticky) return current;
        return nextSticky;
      });
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
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    load(true);
  }

  function handleActionChange(value: string) {
    setAction(value);
    setPage(1);
  }

  function handleOperationChange(value: string) {
    setOperation(value);
    setPage(1);
  }

  function handleAdminChange(value: string) {
    setAdminId(value);
    setPage(1);
  }

  function handleClearFilters() {
    setBusca('');
    setAction('');
    setOperation('');
    setAdminId('');
    setPage(1);
    setIsMobileFilterOpen(false);
  }

  const canLoadMore = meta ? meta.current_page < meta.last_page : false;
  const hasActiveFilters = Boolean(busca || action || operation || adminId);

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-5">
          {showDashboardBack && (
            <Link
              href="/admin/geral"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              <ArrowLeft size={16} />
              Voltar para a visão geral
            </Link>
          )}

          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
              Linha do tempo administrativa
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
              Consulte ações registradas no painel, como criações, edições,
              remoções e envios de mídia.
            </p>
          </div>
        </section>

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
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(260px,1fr)_170px_165px_190px_auto] xl:items-start">
              <div className="relative min-w-0">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />

                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por ação, item ou administrador..."
                  className="h-11 w-full rounded-md border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen((current) => !current)}
                className="
                  flex h-11 w-full items-center justify-center gap-2 rounded-md
                  border border-gray-200 bg-white px-3 text-xs
                  font-semibold text-gray-700 transition active:scale-[0.99] xl:hidden
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

              <select
                value={action}
                onChange={(event) => handleActionChange(event.target.value)}
                className={`
                  h-11 w-full min-w-0 cursor-pointer rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10
                  ${shouldHideExtraMobileFilters ? 'hidden xl:block' : ''}
                `}
              >
                <option value="">Todos os tipos</option>
                <option value="article">Artigos</option>
                <option value="activity">Atividades</option>
                <option value="partner">Parceiros</option>
                <option value="document">Documentos</option>
                <option value="media">Mídias</option>
                <option value="setting">Configurações</option>
                <option value="keyword">Palavras-chave</option>
              </select>

              <select
                value={operation}
                onChange={(event) => handleOperationChange(event.target.value)}
                className={`
                  h-11 w-full min-w-0 cursor-pointer rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10
                  ${shouldHideExtraMobileFilters ? 'hidden xl:block' : ''}
                `}
              >
                <option value="">Todas operações</option>
                <option value="created">Criado/enviado</option>
                <option value="updated">Editado</option>
                <option value="deleted">Removido</option>
              </select>

              <select
                value={adminId}
                onChange={(event) => handleAdminChange(event.target.value)}
                disabled={filtersLoading}
                className={`
                  h-11 w-full min-w-0 cursor-pointer rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60
                  ${shouldHideExtraMobileFilters ? 'hidden xl:block' : ''}
                `}
              >
                <option value="">
                  {filtersLoading ? 'Carregando...' : 'Todas as pessoas'}
                </option>

                {adminOptions.map((option) => (
                  <option key={option.id} value={String(option.id)}>
                    {option.name}
                  </option>
                ))}
              </select>

              <div
                className={`
                  flex h-11 min-w-0 gap-2
                  ${shouldHideExtraMobileFilters ? 'hidden xl:flex' : ''}
                `}
              >
                <button
                  type="submit"
                  className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-95 active:scale-95 xl:flex-none"
                >
                  Filtrar
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="
                      inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center
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
          </form>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Histórico
              </h2>

              <p className="text-sm text-zinc-500">
                {meta
                  ? `${meta.total} registros encontrados`
                  : 'Carregando registros'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => load(true)}
              disabled={loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
              aria-label="Atualizar auditoria"
            >
              <RefreshCw
                size={15}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>

          {error ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-md bg-zinc-100"
                />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div>
              {items.map((item, index) => (
                <AuditTimelineItem
                  key={String(item.id ?? index)}
                  item={item}
                  currentAdminName={admin?.name}
                  currentAdminRole={adminRole}
                  canViewDetails={isMaster}
                  isLast={index === items.length - 1}
                />
              ))}

              <div className="relative grid grid-cols-[46px_minmax(0,1fr)] gap-5">
                <div className="col-start-1 row-start-1 flex justify-center">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Clock size={16} />
                  </div>
                </div>

                <div className="col-start-2 row-start-1">
                  {canLoadMore ? (
                    <button
                      type="button"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={loadingMore}
                      className="w-full rounded-md border border-dashed border-zinc-200 bg-zinc-50/70 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                    >
                      {loadingMore ? 'Carregando...' : 'Carregar mais'}
                    </button>
                  ) : (
                    <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50/70 px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-700">
                        Fim do histórico carregado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50/70 p-8 text-center">
              <div className="mx-auto mb-3 w-fit rounded-xl bg-primary/10 p-3 text-primary">
                <Clock size={20} />
              </div>

              <p className="text-sm font-semibold text-zinc-700">
                Nenhum registro encontrado.
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
                Tente limpar os filtros ou realizar uma nova ação no painel.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
