'use client';

import type { ElementType, ReactNode } from 'react';
import Link from 'next/link';
import {
  ActivityIcon,
  AlertTriangle,
  ArrowLeft,
  Database,
  FileText,
  Fingerprint,
  Globe,
  HeartHandshake,
  Images,
  Info,
  Monitor,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  Tag,
  Trash2,
  Upload,
  User,
} from 'lucide-react';

import type { AdminActionLogDetails } from '@/types/admin/action-log';

interface AdminAuditDetailsContainerProps {
  log: AdminActionLogDetails;
}

type ChangedFieldMap = Record<
  string,
  {
    old?: unknown;
    new?: unknown;
  }
>;

type OperationType = 'created' | 'updated' | 'deleted' | 'default';

const IGNORED_PROPERTY_KEYS = [
  'request',
  'old_values',
  'new_values',
  'changed_values',
  'changed_fields',
];

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  title: 'Título',
  name: 'Nome',
  word: 'Palavra-chave',
  slug: 'Slug',
  summary: 'Resumo',
  content: 'Conteúdo',
  description: 'Descrição',
  image_url: 'Imagem',
  image_description: 'Texto alternativo',
  image_caption: 'Legenda da imagem',
  keywords: 'Palavras-chave',
  schedules: 'Horários',
  weekday: 'Dia da semana',
  start_time: 'Início',
  end_time: 'Fim',
  is_active: 'Status ativo',
  active: 'Ativo',
  order: 'Ordem',
  website_url: 'Site',
  bg_color: 'Cor de fundo',
  logo_path: 'Logo',
  logo_url: 'Logo',
  key: 'Chave',
  value: 'Valor',
  filename: 'Nome do arquivo',
  original_name: 'Nome original',
  path: 'Caminho',
  collection: 'Coleção',
  disk: 'Disco',
  mime_type: 'Tipo do arquivo',
  size: 'Tamanho',
  media_file_id: 'ID da mídia',
  article_id: 'ID do artigo',
  activity_id: 'ID da atividade',
  partner_id: 'ID do parceiro',
  document_id: 'ID do documento',
  keyword_id: 'ID da palavra-chave',
  setting_id: 'ID da configuração',
  publication_id: 'ID da publicação',
  category_id: 'ID da categoria',
  category_name: 'Categoria',
  year: 'Ano',
  file_url: 'Arquivo',
  file_path: 'Caminho do arquivo',
  published_at: 'Publicado em',
  created_at: 'Criado em',
  updated_at: 'Atualizado em',
  deleted_by_admin_id: 'ID de quem removeu',
  deleted_by_name: 'Removido por',
  deleted_by_email: 'E-mail de quem removeu',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

function getOperationIcon(action?: string) {
  if (!action) return ActivityIcon;

  if (action.includes('media.created')) return Upload;
  if (action.includes('created')) return Plus;
  if (action.includes('updated')) return Pencil;
  if (action.includes('deleted')) return Trash2;

  return ActivityIcon;
}

function getOperationType(action?: string): OperationType {
  if (!action) return 'default';

  if (action.includes('created')) return 'created';
  if (action.includes('updated')) return 'updated';
  if (action.includes('deleted')) return 'deleted';

  return 'default';
}

function getActionLabel(action?: string) {
  if (!action) return 'Ação';

  const last = action.split('.').pop();

  const map: Record<string, string> = {
    created: 'Criação',
    updated: 'Atualização',
    deleted: 'Remoção',
  };

  if (action.includes('media.created')) return 'Envio';

  return map[last || ''] || 'Ação';
}

function getActionTone(action?: string) {
  if (!action) {
    return {
      icon: 'bg-zinc-100 text-zinc-600',
    };
  }

  if (action.includes('deleted')) {
    return {
      icon: 'bg-red-50 text-red-600',
    };
  }

  if (action.includes('updated')) {
    return {
      icon: 'bg-zinc-100 text-zinc-800',
    };
  }

  if (action.includes('created') || action.includes('media')) {
    return {
      icon: 'bg-primary/10 text-primary',
    };
  }

  return {
    icon: 'bg-zinc-100 text-zinc-600',
  };
}

function getAdminRoleLabel(role?: string | null) {
  if (!role) return '—';

  if (role === 'master') return 'Master';
  if (role === 'admin') return 'Admin';

  return role;
}

function getSubjectTypeLabel(type?: string | null) {
  if (!type) return '—';

  const normalized = type.split('\\').pop() || type;

  const map: Record<string, string> = {
    Article: 'Artigo',
    Activity: 'Atividade',
    Document: 'Documento',
    Partner: 'Parceiro',
    MediaFile: 'Mídia',
    Setting: 'Configuração',
    Keyword: 'Palavra-chave',
  };

  return map[normalized] || normalized;
}

function getFieldLabel(field: string) {
  return FIELD_LABELS[field] || field.replaceAll('_', ' ');
}

function getChangedValues(
  properties?: Record<string, unknown> | null
): ChangedFieldMap {
  const changed = properties?.changed_values;

  if (!isPlainObject(changed)) {
    return {};
  }

  return changed as ChangedFieldMap;
}

function getRequestData(properties?: Record<string, unknown> | null) {
  const request = properties?.request;

  if (!isPlainObject(request)) {
    return {};
  }

  return request;
}

function getVisibleProperties(properties: Record<string, unknown>) {
  return Object.entries(properties).filter(
    ([key, value]) =>
      !IGNORED_PROPERTY_KEYS.includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== ''
  );
}

function getSnapshotEntries(value: unknown) {
  if (!isPlainObject(value)) return [];

  return Object.entries(value).filter(
    ([, item]) => item !== null && item !== undefined && item !== ''
  );
}

function formatWeekday(weekday?: string) {
  const map: Record<string, string> = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  return weekday ? map[weekday] || weekday : 'Dia não informado';
}

function formatBytes(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return formatValue(value);
  }

  if (number < 1024) return `${number} B`;
  if (number < 1024 * 1024) return `${(number / 1024).toFixed(1)} KB`;

  return `${(number / 1024 / 1024).toFixed(1)} MB`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'Nenhum item';

    const isScheduleList = value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'weekday' in item &&
        'start_time' in item &&
        'end_time' in item
    );

    if (isScheduleList) {
      return value
        .map((item) => {
          const schedule = item as {
            weekday?: string;
            start_time?: string;
            end_time?: string;
          };

          return `${formatWeekday(schedule.weekday)} — ${
            schedule.start_time || '--:--'
          } às ${schedule.end_time || '--:--'}`;
        })
        .join('\n');
    }

    const isSimpleList = value.every(
      (item) =>
        typeof item === 'string' ||
        typeof item === 'number' ||
        typeof item === 'boolean'
    );

    if (isSimpleList) {
      return value.map(String).join(', ');
    }

    return JSON.stringify(value, null, 2);
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function isLongValue(value: unknown) {
  const text = formatValue(value);

  return text.length > 140 || text.includes('\n');
}

function IconBox({ icon: Icon }: { icon: ElementType }) {
  return (
    <div className="rounded-xl bg-primary/10 p-3 text-primary">
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </div>
  );
}

function TechnicalCard({
  icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <IconBox icon={icon} />

        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-700">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)]">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-sm text-zinc-700">
        {value || '—'}
      </dd>
    </div>
  );
}

function ValuePanel({
  title,
  value,
  tone,
}: {
  title: string;
  value: unknown;
  tone: 'red' | 'green' | 'neutral';
}) {
  const formatted = formatValue(value);
  const long = isLongValue(value);

  const toneClasses = {
    red: 'border-red-100 bg-red-50 text-red-900',
    green: 'border-green-100 bg-green-50 text-green-900',
    neutral: 'border-primary/15 bg-primary/10 text-primary',
  }[tone];

  const labelClasses = {
    red: 'border-red-100 bg-red-50 text-red-600',
    green: 'border-green-100 bg-green-50 text-green-700',
    neutral: 'border-primary/15 bg-primary/10 text-primary',
  }[tone];

  return (
    <div className="space-y-2">
      <span
        className={`
          inline-flex rounded-md border px-2 py-1
          text-[10px] font-bold uppercase tracking-[0.12em]
          ${labelClasses}
        `}
      >
        {title}
      </span>

      <div
        className={`
          rounded-md border px-4 py-3 text-sm leading-relaxed
          ${toneClasses}
          ${long ? 'max-h-72 overflow-auto' : ''}
        `}
      >
        <pre className="whitespace-pre-wrap break-words font-sans">
          {formatted}
        </pre>
      </div>
    </div>
  );
}

function ChangeBlock({
  field,
  oldValue,
  newValue,
  action,
}: {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  action?: string;
}) {
  const operation = getOperationType(action);

  const heading =
    operation === 'created'
      ? 'Campo criado'
      : operation === 'deleted'
        ? 'Campo removido'
        : 'Campo alterado';

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-primary/10 px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            {heading}
          </p>

          <h3 className="mt-1 text-sm font-semibold capitalize text-zinc-900">
            {getFieldLabel(field)}
          </h3>
        </div>

        <span className="rounded-md border border-primary/15 bg-white px-2.5 py-1 text-[11px] font-medium text-primary">
          {field}
        </span>
      </div>

      {operation === 'created' ? (
        <div className="p-4">
          <ValuePanel title="Valor criado" value={newValue} tone="green" />
        </div>
      ) : operation === 'deleted' ? (
        <div className="p-4">
          <ValuePanel title="Valor removido" value={oldValue} tone="red" />
        </div>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <ValuePanel title="Saiu" value={oldValue} tone="red" />
          <ValuePanel title="Entrou" value={newValue} tone="green" />
        </div>
      )}
    </div>
  );
}

function SimpleDataGrid({
  title,
  entries,
}: {
  title: string;
  entries: Array<[string, unknown]>;
}) {
  if (entries.length === 0) return null;

  return (
    <section className="rounded-md border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <IconBox icon={Info} />

        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-700">
          {title}
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-md border border-primary/15 bg-primary/10 p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              {getFieldLabel(key)}
            </p>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-zinc-700">
              {key === 'size' ? formatBytes(value) : formatValue(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RawTechnicalDetails({
  properties,
  request,
}: {
  properties: Record<string, unknown>;
  request: Record<string, unknown>;
}) {
  return (
    <details className="mt-6 rounded-md border border-gray-200 bg-white p-5">
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-zinc-700">
        Dados técnicos avançados
      </summary>

      <div className="mt-5 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
            Request capturado
          </h3>

          <pre className="max-h-[420px] overflow-auto rounded-md bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100">
            {JSON.stringify(request || {}, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
            Properties do log
          </h3>

          <pre className="max-h-[420px] overflow-auto rounded-md bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100">
            {JSON.stringify(properties || {}, null, 2)}
          </pre>
        </div>
      </div>
    </details>
  );
}

export default function AdminAuditDetailsContainer({
  log,
}: AdminAuditDetailsContainerProps) {
  const properties = (log.properties || {}) as Record<string, unknown>;
  const request = getRequestData(properties);
  const changedValues = getChangedValues(properties);
  const changedEntries = Object.entries(changedValues);
  const hasChanges = changedEntries.length > 0;

  const oldValuesEntries = getSnapshotEntries(properties.old_values);
  const newValuesEntries = getSnapshotEntries(properties.new_values);
  const visibleProperties = getVisibleProperties(properties);

  const ActionIcon = getActionIcon(log.action);
  const OperationIcon = getOperationIcon(log.action);
  const tone = getActionTone(log.action);

  const changedFieldsList = Array.isArray(properties.changed_fields)
    ? properties.changed_fields
    : [];

  const totalTrackedFields = hasChanges
    ? changedEntries.length
    : changedFieldsList.length ||
      oldValuesEntries.length ||
      newValuesEntries.length ||
      visibleProperties.length;

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6 selection:bg-primary selection:text-white">
      <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-4">
        <Link
          href="/admin/auditoria"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 cursor-default"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para auditoria
        </Link>
      </div>

      <header className="mb-10 space-y-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`
                flex shrink-0 items-center justify-center rounded-xl p-3
                ${tone.icon}
              `}
            >
              <ActionIcon className="h-[22px] w-[22px]" aria-hidden="true" />
            </div>

            <div className="min-w-0 space-y-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <OperationIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {getActionLabel(log.action)}
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
                {log.title}
              </h1>

              {log.description && (
                <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
                  {log.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:min-w-[220px]">
            <div className="rounded-md border border-primary/15 bg-primary/10 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                Registro
              </p>

              <p className="mt-1 text-sm font-semibold text-zinc-800">
                #{log.id}
              </p>
            </div>

            <div className="rounded-md border border-primary/15 bg-primary/10 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                Horário
              </p>

              <p className="mt-1 text-sm font-semibold text-zinc-800">
                {formatValue(log.time)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Operação
          </p>

          <p className="mt-2 text-sm font-semibold text-zinc-800">
            {getActionLabel(log.action)}
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Campos rastreados
          </p>

          <p className="mt-2 text-sm font-semibold text-zinc-800">
            {totalTrackedFields}
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Objeto
          </p>

          <p className="mt-2 text-sm font-semibold text-zinc-800">
            {getSubjectTypeLabel(log.subject?.type)}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <TechnicalCard icon={User} title="Responsável">
          <dl>
            <DetailRow label="Nome" value={formatValue(log.admin?.name || 'Sistema')} />
            <DetailRow label="E-mail" value={formatValue(log.admin?.email)} />
            <DetailRow
              label="Cargo"
              value={getAdminRoleLabel(log.admin?.role)}
            />
            <DetailRow label="Admin ID" value={formatValue(log.admin?.id)} />
          </dl>
        </TechnicalCard>

        <TechnicalCard icon={Database} title="Objeto auditado">
          <dl>
            <DetailRow
              label="Tipo"
              value={getSubjectTypeLabel(log.subject?.type)}
            />
            <DetailRow label="ID" value={formatValue(log.subject?.id)} />
            <DetailRow label="Nome" value={formatValue(log.subject?.name)} />
            <DetailRow label="Ação técnica" value={formatValue(log.action)} />
          </dl>
        </TechnicalCard>

        <TechnicalCard icon={Globe} title="Requisição">
          <dl>
            <DetailRow
              label="IP"
              value={formatValue(log.ip_address || request.ip)}
            />
            <DetailRow label="Método" value={formatValue(request.method)} />
            <DetailRow label="Rota" value={formatValue(request.route_name)} />
            <DetailRow label="Path" value={formatValue(request.path)} />
            <DetailRow label="URL" value={formatValue(request.url)} />
          </dl>
        </TechnicalCard>

        <TechnicalCard icon={Monitor} title="Ambiente">
          <dl>
            <DetailRow label="Data amigável" value={formatValue(log.time)} />
            <DetailRow
              label="Timestamp"
              value={formatValue(log.created_at)}
            />
            <DetailRow
              label="User agent"
              value={
                <span className="break-words text-xs leading-relaxed text-zinc-600">
                  {formatValue(log.user_agent || request.user_agent)}
                </span>
              }
            />
          </dl>
        </TechnicalCard>
      </div>

      <section className="mt-6 rounded-md border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-2">
          <IconBox icon={ShieldCheck} />

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-700">
              Alterações realizadas
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Campos com histórico detalhado conforme o tipo de operação.
            </p>
          </div>
        </div>

        {hasChanges ? (
          <div className="space-y-4">
            {changedEntries.map(([field, values]) => (
              <ChangeBlock
                key={field}
                field={field}
                oldValue={values.old}
                newValue={values.new}
                action={log.action}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-primary/15 bg-primary/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-semibold text-zinc-700">
                  Nenhum comparativo detalhado disponível.
                </p>

                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Este registro ainda não possui <strong>changed_values</strong>.
                  Quando o backend salvar o diff completo, esta área mostrará
                  automaticamente o que saiu e o que entrou.
                </p>
              </div>
            </div>

            {changedFieldsList.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {changedFieldsList.map((field) => (
                  <span
                    key={String(field)}
                    className="inline-flex rounded-md border border-primary/15 bg-white px-3 py-1 text-xs font-medium capitalize text-primary"
                  >
                    {getFieldLabel(String(field))}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {!hasChanges && oldValuesEntries.length > 0 && (
        <div className="mt-6">
          <SimpleDataGrid
            title="Dados anteriores registrados"
            entries={oldValuesEntries}
          />
        </div>
      )}

      {!hasChanges && newValuesEntries.length > 0 && (
        <div className="mt-6">
          <SimpleDataGrid
            title="Dados novos registrados"
            entries={newValuesEntries}
          />
        </div>
      )}

      {visibleProperties.length > 0 && (
        <div className="mt-6">
          <SimpleDataGrid
            title="Informações complementares"
            entries={visibleProperties}
          />
        </div>
      )}

      <section className="mt-6 rounded-md border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <IconBox icon={Fingerprint} />

          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-700">
            Rastreamento
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-zinc-600">
          Este registro foi gerado para rastrear uma ação administrativa dentro
          do painel. As informações acima ajudam a identificar quem executou a
          ação, qual item foi afetado, quando aconteceu e quais dados foram
          alterados.
        </p>
      </section>

      <RawTechnicalDetails properties={properties} request={request} />
    </main>
  );
}
