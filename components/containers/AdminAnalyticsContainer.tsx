'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  ExternalLink,
  Eye,
  Globe2,
  Laptop,
  MapPin,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import { getAdminAnalyticsSummary } from '@/services/analytics';

import type {
  AdminAnalyticsSummary,
  AnalyticsTimeseriesItem,
} from '@/types/admin/analytics';

const PERIOD_OPTIONS = [
  {
    label: '7 dias',
    value: 7,
  },
  {
    label: '30 dias',
    value: 30,
  },
  {
    label: '90 dias',
    value: 90,
  },
  {
    label: '12 meses',
    value: 365,
  },
];

function numberFormat(value?: number | string | null): string {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) {
    return '0';
  }

  return new Intl.NumberFormat('pt-BR').format(parsed);
}

function percentFormat(value?: number | string | null): string {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) {
    return '0%';
  }

  return `${parsed.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}%`;
}

function secondsFormat(value?: number | string | null): string {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '0s';
  }

  const minutes = Math.floor(parsed / 60);
  const seconds = Math.round(parsed % 60);

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}min ${seconds}s`;
}

function dateFormat(value?: string | null): string {
  if (!value) return '—';

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function getGrowthMeta(value?: string | number | null) {
  const parsed = Number(String(value ?? '0').replace('%', ''));

  if (parsed > 0) {
    return {
      label: `+${parsed.toLocaleString('pt-BR')}%`,
      className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      Icon: TrendingUp,
    };
  }

  if (parsed < 0) {
    return {
      label: `${parsed.toLocaleString('pt-BR')}%`,
      className: 'text-red-700 bg-red-50 border-red-200',
      Icon: TrendingDown,
    };
  }

  return {
    label: '0%',
    className: 'text-zinc-600 bg-zinc-50 border-zinc-200',
    Icon: Activity,
  };
}

function GrowthBadge({ value }: { value?: string | number | null }) {
  const meta = getGrowthMeta(value);
  const Icon = meta.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${meta.className}`}
    >
      <Icon size={12} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function MetricCard({
  title,
  value,
  helper,
  growth,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper?: string;
  growth?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{title}</p>

          <strong className="mt-2 block text-3xl font-semibold tracking-tight text-zinc-950">
            {value}
          </strong>
        </div>

        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>

      {(helper || growth !== undefined) && (
        <div className="mt-4 flex items-center justify-between gap-3">
          {helper && (
            <p className="min-w-0 text-xs leading-relaxed text-zinc-500">
              {helper}
            </p>
          )}

          {growth !== undefined && <GrowthBadge value={growth} />}
        </div>
      )}
    </div>
  );
}

function EmptyBox({ message = 'Nenhum dado disponível ainda.' }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50/70 p-8 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BarChart3 size={20} aria-hidden="true" />
      </div>

      <p className="text-sm font-semibold text-zinc-700">{message}</p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
        Os dados aparecem conforme o Google Analytics começa a processar visitas
        e eventos do site.
      </p>
    </div>
  );
}

function LineChart({ items }: { items: AnalyticsTimeseriesItem[] }) {
  const chartItems = items.filter((item) => item.date);

  const maxValue = Math.max(
    1,
    ...chartItems.map((item) =>
      Math.max(item.active_users, item.pageviews, item.sessions)
    )
  );

  const width = 720;
  const height = 220;
  const paddingX = 24;
  const paddingY = 28;

  function createPath(key: 'active_users' | 'pageviews' | 'sessions') {
    if (chartItems.length <= 0) return '';

    if (chartItems.length === 1) {
      const x = width / 2;
      const y =
        height -
        paddingY -
        (chartItems[0][key] / maxValue) * (height - paddingY * 2);

      return `M ${x} ${y}`;
    }

    return chartItems
      .map((item, index) => {
        const x =
          paddingX +
          (index / Math.max(chartItems.length - 1, 1)) *
            (width - paddingX * 2);

        const y =
          height -
          paddingY -
          (item[key] / maxValue) * (height - paddingY * 2);

        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  if (chartItems.length <= 0) {
    return <EmptyBox />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Evolução de tráfego
            </h2>

            <p className="text-sm text-zinc-500">
              Usuários, visualizações e sessões no período selecionado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Usuários
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-900" />
              Pageviews
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              Sessões
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] min-w-[720px] w-full"
          role="img"
          aria-label="Gráfico de evolução de tráfego"
        >
          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + line * ((height - paddingY * 2) / 3);

            return (
              <line
                key={line}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-100"
              />
            );
          })}

          <path
            d={createPath('active_users')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />

          <path
            d={createPath('pageviews')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-900"
          />

          <path
            d={createPath('sessions')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
          />

          {chartItems.map((item, index) => {
            const x =
              paddingX +
              (index / Math.max(chartItems.length - 1, 1)) *
                (width - paddingX * 2);

            const y =
              height -
              paddingY -
              (item.active_users / maxValue) * (height - paddingY * 2);

            return (
              <g key={`${item.date}-${index}`}>
                <circle cx={x} cy={y} r="3.5" className="fill-primary" />

                {(index === 0 ||
                  index === chartItems.length - 1 ||
                  index % Math.ceil(chartItems.length / 5) === 0) && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-zinc-400 text-[10px] font-medium"
                  >
                    {dateFormat(item.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function BarList({
  title,
  description,
  items,
  getLabel,
  getValue,
  valueLabel = 'sessões',
  icon: Icon,
}: {
  title: string;
  description?: string;
  items: any[];
  getLabel: (item: any) => string;
  getValue: (item: any) => number;
  valueLabel?: string;
  icon: React.ElementType;
}) {
  const max = Math.max(1, ...items.map(getValue));

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Icon size={18} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>

            {description && (
              <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
            )}
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4 p-5">
          {items.map((item, index) => {
            const value = getValue(item);
            const width = `${Math.max(4, (value / max) * 100)}%`;

            return (
              <div key={`${getLabel(item)}-${index}`}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-zinc-700">
                    {getLabel(item)}
                  </span>

                  <span className="shrink-0 text-xs font-semibold text-zinc-500">
                    {numberFormat(value)} {valueLabel}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5">
          <EmptyBox />
        </div>
      )}
    </div>
  );
}

function TopPagesTable({ data }: { data: AdminAnalyticsSummary }) {
  const pages = data.top_pages ?? [];

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Eye size={18} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Páginas mais acessadas
            </h2>

            <p className="mt-0.5 text-sm text-zinc-500">
              URLs com mais visualizações no período.
            </p>
          </div>
        </div>
      </div>

      {pages.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Página</th>
                <th className="px-5 py-3 font-semibold">Visualizações</th>
                <th className="px-5 py-3 font-semibold">Usuários</th>
                <th className="px-5 py-3 font-semibold">Tempo médio</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {pages.map((page, index) => (
                <tr key={`${page.path}-${index}`} className="hover:bg-zinc-50">
                  <td className="px-5 py-4">
                    <div className="max-w-xl">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {page.title || 'Sem título'}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {page.path}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-zinc-800">
                    {numberFormat(page.pageviews)}
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-600">
                    {numberFormat(page.active_users)}
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-600">
                    {secondsFormat(page.average_session_duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <EmptyBox />
        </div>
      )}
    </div>
  );
}

function getDeviceLabel(device: string): string {
  const normalized = device.toLowerCase();

  if (normalized === 'mobile') return 'Celular';
  if (normalized === 'desktop') return 'Computador';
  if (normalized === 'tablet') return 'Tablet';

  return device || 'Desconhecido';
}

function getDeviceIcon(device: string) {
  const normalized = device.toLowerCase();

  if (normalized === 'mobile') return Smartphone;
  if (normalized === 'tablet') return Tablet;

  return Laptop;
}

function DevicesGrid({ data }: { data: AdminAnalyticsSummary }) {
  const devices = data.devices ?? [];

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-zinc-950">Dispositivos</h2>

        <p className="mt-0.5 text-sm text-zinc-500">
          Distribuição de acessos por categoria de dispositivo.
        </p>
      </div>

      {devices.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
          {devices.map((device) => {
            const Icon = getDeviceIcon(device.device);

            return (
              <div
                key={device.device}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-primary">
                    <Icon size={22} aria-hidden="true" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {numberFormat(device.sessions)} sessões
                  </span>
                </div>

                <p className="text-sm font-medium text-zinc-500">
                  {getDeviceLabel(device.device)}
                </p>

                <strong className="mt-1 block text-2xl font-semibold text-zinc-950">
                  {numberFormat(device.active_users)}
                </strong>

                <p className="mt-1 text-xs text-zinc-500">usuários ativos</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5">
          <EmptyBox />
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsContainer() {
  const searchParams = useSearchParams();

  const [days, setDays] = useState(30);
  const [data, setData] = useState<AdminAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showDashboardBack =
    searchParams.get('from') === 'geral' ||
    searchParams.get('from') === 'dashboard';

  const dateRangeLabel = useMemo(() => {
    if (!data?.period) return 'Carregando período...';

    const start = new Date(`${data.period.start_date}T00:00:00`);
    const end = new Date(`${data.period.end_date}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return `${data.period.start_date} até ${data.period.end_date}`;
    }

    return `${start.toLocaleDateString('pt-BR')} até ${end.toLocaleDateString(
      'pt-BR'
    )}`;
  }, [data]);

  async function loadAnalytics(nextDays = days, soft = false) {
    if (soft) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await getAdminAnalyticsSummary(nextDays);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o analytics.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAnalytics(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  function handlePeriodChange(value: number) {
    if (value === days) return;

    setDays(value);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-5 py-4">
          {showDashboardBack && (
            <Link
              href="/admin/geral"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Voltar para a visão geral
            </Link>
          )}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
                Dashboard de métricas do site
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
                Métricas integradas ao Google Analytics para acompanhar acessos,
                sessões, páginas mais visitadas, origem do tráfego,
                dispositivos e localização dos visitantes.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                Abrir no GA4
                <ExternalLink size={15} aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() => loadAnalytics(days, true)}
                disabled={loading || refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? 'animate-spin' : ''}
                  aria-hidden="true"
                />
                Atualizar
              </button>
            </div>
          </div>
        </section>

        <section className="sticky top-4 z-30 rounded-md border border-gray-200 bg-zinc-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Período analisado
              </p>

              <p className="text-xs text-zinc-500">{dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {PERIOD_OPTIONS.map((option) => {
                const active = days === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePeriodChange(option.value)}
                    className={`
                      h-10 rounded-md border px-4 text-sm font-semibold transition
                      ${
                        active
                          ? 'border-primary bg-primary text-white'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-primary/30 hover:bg-primary/10 hover:text-primary'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-md border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-md bg-zinc-100"
              />
            ))}
          </div>
        ) : !data || !data.available ? (
          <EmptyBox message="Analytics indisponível no momento." />
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Usuários ativos"
                value={numberFormat(data.overview.active_users)}
                helper="Usuários únicos no período."
                growth={data.overview.active_users_growth}
                icon={Users}
              />

              <MetricCard
                title="Sessões"
                value={numberFormat(data.overview.sessions)}
                helper="Total de sessões registradas."
                growth={data.overview.sessions_growth}
                icon={Activity}
              />

              <MetricCard
                title="Visualizações"
                value={numberFormat(data.overview.pageviews)}
                helper="Total de pageviews no site."
                growth={data.overview.pageviews_growth}
                icon={Eye}
              />

              <MetricCard
                title="Tempo real"
                value={numberFormat(data.realtime.active_users)}
                helper="Usuários ativos agora."
                icon={Clock}
              />

              <MetricCard
                title="Eventos"
                value={numberFormat(data.overview.event_count)}
                helper="Interações registradas pelo GA4."
                icon={MousePointerClick}
              />

              <MetricCard
                title="Sessões engajadas"
                value={numberFormat(data.overview.engaged_sessions)}
                helper="Sessões com engajamento."
                icon={TrendingUp}
              />

              <MetricCard
                title="Taxa de engajamento"
                value={percentFormat(data.overview.engagement_rate)}
                helper="Percentual de sessões engajadas."
                icon={BarChart3}
              />

              <MetricCard
                title="Duração média"
                value={secondsFormat(data.overview.average_session_duration)}
                helper="Tempo médio por sessão."
                icon={Clock}
              />
            </section>

            <LineChart items={data.timeseries} />

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
              <TopPagesTable data={data} />

              <div className="flex flex-col gap-5">
                <BarList
                  title="Origem do tráfego"
                  description="Canais e fontes de acesso."
                  items={data.sources}
                  getLabel={(item) => item.source}
                  getValue={(item) => item.sessions}
                  valueLabel="sessões"
                  icon={Globe2}
                />

                <DevicesGrid data={data} />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <BarList
                title="Países"
                description="Principais países dos visitantes."
                items={data.countries}
                getLabel={(item) => item.country}
                getValue={(item) => item.active_users}
                valueLabel="usuários"
                icon={Globe2}
              />

              <BarList
                title="Cidades"
                description="Principais cidades dos visitantes."
                items={data.cities}
                getLabel={(item) => item.city}
                getValue={(item) => item.active_users}
                valueLabel="usuários"
                icon={MapPin}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
