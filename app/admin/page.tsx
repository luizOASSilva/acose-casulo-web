'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

import LogoLoader from '@/components/ui/LogoLoader';
import {
  ActivityIcon,
  ArrowRight,
  BarChart3,
  FileText,
  Globe,
  HeartHandshake,
  Pencil,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import StatusItem from '@/components/admin/dashboard/StatusItem';
import StatItem from '@/components/admin/dashboard/StatItem';
import ActivityItem from '@/components/admin/dashboard/ActivityItem';
import QuickActionCard from '@/components/admin/dashboard/QuickActionCard';
import AnalyticsCard from '@/components/admin/dashboard/AnalyticsCard';

export default function AdminPage() {
  const { admin, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data, loading: dataLoading, error, refetch } = useDashboard();

  useEffect(() => {
    if (!authLoading && !admin) {
      router.replace('/');
    }
  }, [admin, authLoading, router]);

  if (authLoading || !admin) {
    return <LogoLoader />;
  }

  const name = admin?.name?.split(' ')[0] ?? 'Admin';

  const skeletonCls =
    'animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700';

  function AnalyticsSkeleton() {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`${skeletonCls} h-28`}
          />
        ))}
      </div>
    );
  }

  function StatsSkeleton() {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${skeletonCls} h-5`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f7fa] p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-lg font-medium text-red-600">
            Falha ao carregar o painel
          </p>
          <p className="text-sm text-zinc-500">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      </main>
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
    };
    return map[value] ?? value;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">

        <section className="relative overflow-hidden py-8">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
                Bem-vindo novamente,
                <span className="text-primary"> {name}</span> 👋
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
                Gerencie conteúdos, acompanhe métricas, monitore atividades e
                entre no modo de edição visual do site.
              </p>
            </div>

            <Link
              href="/?edit=true"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              <Pencil size={18} />
              Entrar no modo edição
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Analytics
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Dados gerais do projeto
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={refetch}
                disabled={dataLoading}
                aria-label="Atualizar dados"
                className="text-zinc-400 transition hover:text-zinc-700 disabled:opacity-40"
              >
                <RefreshCw
                  size={16}
                  className={dataLoading ? 'animate-spin' : ''}
                />
              </button>

              <Link
                href="/admin/analytics"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
              >
                Ver detalhes
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {dataLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <section className="p-4">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Ações rápidas
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickActionCard
              icon={<FileText size={20} />}
              title="Novo artigo"
              description="Criar novo conteúdo institucional."
              href="/admin/articles/new"
            />

            <QuickActionCard
              icon={<ActivityIcon size={20} />}
              title="Nova atividade"
              description="Adicionar atividade ao site."
              href="/admin/activities/new"
            />

            <QuickActionCard
              icon={<HeartHandshake size={20} />}
              title="Novo parceiro"
              description="Cadastrar parceiro institucional."
              href="/admin/partners/new"
            />

            <QuickActionCard
              icon={<ShieldCheck size={20} />}
              title="Transparência"
              description="Enviar novos documentos."
              href="/admin/transparency/new"
            />
          </div>
        </section>

        <section className="grid gap-6 p-4 xl:grid-cols-[1.5fr_1fr]">

          <div className="rounded-md border border-white/40 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Atividade recente
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Últimas ações realizadas
                </p>
              </div>

              <button className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950">
                Ver tudo
              </button>
            </div>

            <div className="space-y-4">
              <ActivityItem
                title="Hero atualizado"
                description="Texto principal alterado."
                time="Há 12 minutos"
              />
              <ActivityItem
                title="Novo parceiro adicionado"
                description="Logo institucional enviada."
                time="Há 1 hora"
              />
              <ActivityItem
                title="PDF atualizado"
                description="Documento financeiro substituído."
                time="Hoje às 10:42"
              />
              <ActivityItem
                title="Novo artigo publicado"
                description="Conteúdo publicado na seção artigos."
                time="Ontem"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">

            <div className="rounded-md border border-white/40 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Conteúdo
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
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
                      value={String(data?.cms.articles ?? '—').padStart(2, '0')}
                    />
                    <StatItem
                      label="Atividades"
                      value={String(data?.cms.activities ?? '—').padStart(2, '0')}
                    />
                    <StatItem
                      label="Parceiros"
                      value={String(data?.cms.partners ?? '—').padStart(2, '0')}
                    />
                    <StatItem
                      label="Documentos"
                      value={String(data?.cms.documents ?? '—').padStart(2, '0')}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="rounded-md border border-white/40 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Sistema
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
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
                    <StatusItem label="Último deploy" status="Hoje" />
                    <StatusItem label="Drafts pendentes" status="3" />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
