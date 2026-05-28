'use client';

import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

import {
  ActivityIcon,
  BarChart3,
  Clock,
  FileText,
  Globe,
  HeartHandshake,
  Images,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';

import StatusItem from '@/components/admin/dashboard/StatusItem';
import StatItem from '@/components/admin/dashboard/StatItem';
import QuickActionCard from '@/components/admin/dashboard/QuickActionCard';
import AnalyticsCard from '@/components/admin/dashboard/AnalyticsCard';

import type { DashboardRecentActivity } from '@/types/dashboard';

type AuditItem = DashboardRecentActivity & {
  admin?: {
    id?: number | null;
    name?: string | null;
    role?: string | null;
  };
};

const skeletonCls =
  'animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700';

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={`${skeletonCls} h-28`} />
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={`${skeletonCls} h-5`} />
      ))}
    </div>
  );
}

function AuditListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={`${skeletonCls} h-16`} />
      ))}
    </div>
  );
}

function fmtValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '—';

  return String(value);
}

function fmtGrowth(raw?: string | number | null): string {
  if (raw === undefined || raw === null || raw === '') return '—';

  const value = String(raw);

  return value.endsWith('%') ? value : `${value}%`;
}

function statusLabel(value: string | undefined): string {
  if (!value) return '—';

  const map: Record<string, string> = {
    Online: 'Online',
    Ativo: 'Ativo',
    Offline: 'Offline',
    Indisponível: 'Indisponível',
  };

  return map[value] ?? value;
}

function getActivityKey(item: AuditItem, index: number): string {
  return String(
    item.id ??
      `${item.action || item.type || 'activity'}-${
        item.created_at ?? item.date ?? index
      }-${index}`
  );
}

function getActionIcon(action?: string) {
  if (!action) return ActivityIcon;

  if (action.includes('media')) return Images;
  if (action.includes('partner')) return HeartHandshake;
  if (action.includes('article')) return FileText;
  if (action.includes('document')) return ShieldCheck;
  if (action.includes('activity')) return ActivityIcon;
  if (action.includes('setting')) return Settings;

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
      border: 'border-zinc-100 hover:border-zinc-300',
    };
  }

  if (action.includes('deleted')) {
    return {
      icon: 'bg-red-50 text-red-600',
      badge: 'border-red-100 bg-red-50 text-red-600',
      border: 'border-red-200 hover:border-red-300',
    };
  }

  if (action.includes('updated')) {
    return {
      icon: 'bg-zinc-100 text-zinc-800',
      badge: 'border-zinc-200 bg-zinc-100 text-zinc-700',
      border: 'border-zinc-100 hover:border-zinc-300',
    };
  }

  if (action.includes('created') || action.includes('media')) {
    return {
      icon: 'bg-orange-50 text-primary',
      badge: 'border-orange-100 bg-orange-50 text-primary',
      border: 'border-zinc-100 hover:border-primary/25',
    };
  }

  return {
    icon: 'bg-zinc-100 text-zinc-600',
    badge: 'border-zinc-200 bg-zinc-100 text-zinc-600',
    border: 'border-zinc-100 hover:border-zinc-300',
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
            ? 'border-primary/20 bg-orange-50 text-primary'
            : 'border-zinc-200 bg-zinc-100 text-zinc-600'
        }
      `}
    >
      {label}
    </span>
  );
}

function AuditListItem({
  item,
  index,
  currentAdminName,
  currentAdminRole,
}: {
  item: AuditItem;
  index: number;
  currentAdminName?: string;
  currentAdminRole?: string;
}) {
  const action = item.action || item.type;
  const Icon = getActionIcon(action);
  const VerbIcon = getActionVerbIcon(action);
  const tone = getActionTone(action);
  const actionLabel = getActionLabel(action);
  const roleLabel = getAdminRoleLabel(item, currentAdminName, currentAdminRole);

  return (
    <article
      key={getActivityKey(item, index)}
      className={`
        rounded-xl border bg-white px-4 py-3 transition
        ${tone.border}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
            ${tone.icon}
          `}
        >
          <Icon size={17} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-950">
              {item.title}
            </h3>

            <span
              className={`
                inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                ${tone.badge}
              `}
            >
              <VerbIcon size={11} aria-hidden="true" />
              {actionLabel}
            </span>

            {roleLabel && <AdminRoleBadge label={roleLabel} />}
          </div>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-600">
              {item.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
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

                <span className="truncate">
                  Item:{' '}
                  <span className="font-medium text-zinc-500">
                    {item.subject.name}
                  </span>
                </span>
              </>
            )}

            <span className="ml-auto inline-flex items-center gap-1 text-zinc-400">
              <Clock size={13} aria-hidden="true" />
              {item.time}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecentAuditList({
  items,
  dataLoading,
  onRefresh,
  currentAdminName,
  currentAdminRole,
}: {
  items: AuditItem[];
  dataLoading: boolean;
  onRefresh: () => void;
  currentAdminName?: string;
  currentAdminRole?: string;
}) {
  const previewItems = items.slice(0, 5);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold leading-tight text-zinc-900 sm:text-2xl">
              Atividade recente
            </h2>

            <button
              type="button"
              onClick={onRefresh}
              disabled={dataLoading}
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition hover:bg-orange-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Atualizar atividades recentes"
              title="Atualizar"
            >
              <RefreshCw
                size={15}
                className={dataLoading ? 'animate-spin' : ''}
                aria-hidden="true"
              />
            </button>
          </div>

          <p className="mt-1 text-sm text-zinc-500">
            Últimas ações realizadas
          </p>
        </div>

        <Link
          href="/admin/auditoria"
          className="mt-1 shrink-0 cursor-pointer text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
        >
          Ver todos
        </Link>
      </div>

      {dataLoading ? (
        <AuditListSkeleton />
      ) : previewItems.length > 0 ? (
        <div className="space-y-3">
          {previewItems.map((item, index) => (
            <AuditListItem
              key={getActivityKey(item, index)}
              item={item}
              index={index}
              currentAdminName={currentAdminName}
              currentAdminRole={currentAdminRole}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-primary">
            <Clock size={20} aria-hidden="true" />
          </div>

          <p className="text-sm font-semibold text-zinc-700">
            Nenhuma atividade recente.
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
            Quando um administrador criar, atualizar, remover ou enviar algo, o
            histórico aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const { data, loading: dataLoading, error, refetch } = useDashboard();

  const name = admin?.name?.split(' ')[0] ?? 'Admin';
  const adminRole = (admin as { role?: string } | null)?.role;
  const recentActivity = (data?.recent_activity ?? []) as AuditItem[];

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-lg font-medium text-red-600">
            Falha ao carregar o painel
          </p>

          <p className="text-sm text-zinc-500">
            {error}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 active:scale-95"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden py-4">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                Bem-vindo novamente,
                <span className="text-primary"> {name}</span>
              </h1>

              <p className="mt-3 text-base leading-relaxed text-zinc-600">
                Gerencie conteúdos, acompanhe métricas, monitore atividades e
                controle a plataforma.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Analytics
              </h2>

              <p className="text-sm text-zinc-500">
                Dados gerais do projeto
              </p>
            </div>

            <div className="flex items-center gap-4 self-start sm:self-center">
              <button
                type="button"
                onClick={refetch}
                disabled={dataLoading}
                aria-label="Atualizar dados"
                className="cursor-pointer text-zinc-600 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw
                  size={16}
                  className={dataLoading ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </div>

          {dataLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsCard
                icon={<Globe size={22} />}
                title="Visitantes hoje"
                value={fmtValue(data?.analytics?.visitors)}
                growth={fmtGrowth(data?.analytics?.visitors_growth)}
              />

              <AnalyticsCard
                icon={<HeartHandshake size={22} />}
                title="Doações iniciadas"
                value={fmtValue(data?.analytics?.donations)}
                growth={fmtGrowth(data?.analytics?.donations_growth)}
              />

              <AnalyticsCard
                icon={<FileText size={22} />}
                title="Artigos lidos"
                value={fmtValue(data?.analytics?.articles_read)}
                growth="—"
              />

              <AnalyticsCard
                icon={<BarChart3 size={22} />}
                title="Conversão"
                value={fmtValue(data?.analytics?.conversion)}
                growth={fmtGrowth(data?.analytics?.conversion_growth)}
              />
            </div>
          )}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Ações rápidas
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              icon={<FileText size={20} />}
              title="Novo artigo"
              description="Criar novo conteúdo institucional."
              href="/admin/artigos/novo"
            />

            <QuickActionCard
              icon={<ActivityIcon size={20} />}
              title="Nova atividade"
              description="Adicionar atividade ao site."
              href="/admin/atividades/novo"
            />

            <QuickActionCard
              icon={<HeartHandshake size={20} />}
              title="Novo parceiro"
              description="Cadastrar parceiro institucional."
              href="/admin/parceiros/novo"
            />

            <QuickActionCard
              icon={<ShieldCheck size={20} />}
              title="Transparência"
              description="Enviar novos documentos."
              href="/admin/transparencia/novo"
            />

            <QuickActionCard
              icon={<Images size={20} />}
              title="Adicionar mídia"
              description="Enviar imagens para usar no site."
              href="/admin/midias"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <RecentAuditList
            items={recentActivity}
            dataLoading={dataLoading}
            onRefresh={refetch}
            currentAdminName={admin?.name}
            currentAdminRole={adminRole}
          />

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Conteúdo
                </h2>

                <p className="text-sm text-zinc-500">
                  Dados gerais do CMS
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {dataLoading ? (
                  <StatsSkeleton />
                ) : (
                  <>
                    <StatItem
                      label="Artigos publicados"
                      value={String(data?.cms?.articles ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Atividades"
                      value={String(data?.cms?.activities ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Parceiros"
                      value={String(data?.cms?.partners ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Documentos"
                      value={String(data?.cms?.documents ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Mídias"
                      value={String(data?.cms?.media ?? '—').padStart(2, '0')}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Sistema
                </h2>

                <p className="text-sm text-zinc-500">
                  Estado atual da aplicação
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {dataLoading ? (
                  <StatsSkeleton />
                ) : (
                  <>
                    <StatusItem
                      label="API"
                      status={statusLabel(data?.status?.api)}
                    />

                    <StatusItem
                      label="Analytics"
                      status={statusLabel(data?.status?.analytics)}
                    />

                    <StatusItem
                      label="Última sincronização"
                      status={data?.status?.last_sync ?? '—'}
                    />

                    <StatusItem
                      label="Logs de auditoria"
                      status={String(recentActivity.length).padStart(2, '0')}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
