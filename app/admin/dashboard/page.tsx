'use client';

import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

import {
  ActivityIcon,
  BarChart3,
  FileText,
  Globe,
  HeartHandshake,
  Images,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import StatusItem from '@/components/admin/dashboard/StatusItem';
import StatItem from '@/components/admin/dashboard/StatItem';
import ActivityItem from '@/components/admin/dashboard/ActivityItem';
import QuickActionCard from '@/components/admin/dashboard/QuickActionCard';
import AnalyticsCard from '@/components/admin/dashboard/AnalyticsCard';

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

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={`${skeletonCls} h-14`} />
      ))}
    </div>
  );
}

function fmtGrowth(raw?: string): string {
  if (!raw) return '—';

  return raw.endsWith('%') ? raw : `${raw}%`;
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

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const { data, loading: dataLoading, error, refetch } = useDashboard();

  const name = admin?.name?.split(' ')[0] ?? 'Admin';
  const recentActivity = data?.recent_activity ?? [];

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
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
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
                className="text-zinc-600 transition hover:text-zinc-900 disabled:opacity-40"
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
                value={data?.analytics.visitors ?? '—'}
                growth={fmtGrowth(data?.analytics.visitors_growth)}
              />

              <AnalyticsCard
                icon={<HeartHandshake size={22} />}
                title="Doações iniciadas"
                value={String(data?.analytics.donations ?? '—')}
                growth={fmtGrowth(data?.analytics.donations_growth)}
              />

              <AnalyticsCard
                icon={<FileText size={22} />}
                title="Artigos lidos"
                value={data?.analytics.articles_read ?? '—'}
                growth="—"
              />

              <AnalyticsCard
                icon={<BarChart3 size={22} />}
                title="Conversão"
                value={
                  data?.analytics.conversion
                    ? `${data.analytics.conversion}%`
                    : '—'
                }
                growth={fmtGrowth(data?.analytics.conversion_growth)}
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
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Atividade recente
                </h2>

                <p className="text-sm text-zinc-500">
                  Últimas ações realizadas
                </p>
              </div>

              <button
                type="button"
                onClick={refetch}
                disabled={dataLoading}
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 disabled:opacity-40"
              >
                Atualizar
              </button>
            </div>

            {dataLoading ? (
              <ActivitySkeleton />
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <ActivityItem
                    key={`${item.type}-${item.date ?? index}-${index}`}
                    title={item.title}
                    description={item.description}
                    time={item.time}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-sm font-medium text-zinc-700">
                  Nenhuma atividade recente.
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Quando conteúdos forem criados, atualizados ou mídias forem
                  enviadas, eles aparecerão aqui.
                </p>
              </div>
            )}
          </div>

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
                      value={String(data?.cms.articles ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Atividades"
                      value={String(data?.cms.activities ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Parceiros"
                      value={String(data?.cms.partners ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Documentos"
                      value={String(data?.cms.documents ?? '—').padStart(
                        2,
                        '0'
                      )}
                    />

                    <StatItem
                      label="Mídias"
                      value={String(data?.cms.media ?? '—').padStart(2, '0')}
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
                      status={statusLabel(data?.status.api)}
                    />

                    <StatusItem
                      label="Analytics"
                      status={statusLabel(data?.status.analytics)}
                    />

                    <StatusItem
                      label="Último deploy"
                      status="—"
                    />

                    <StatusItem
                      label="Drafts pendentes"
                      status="—"
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
