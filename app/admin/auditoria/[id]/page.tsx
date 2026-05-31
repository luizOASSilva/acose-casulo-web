'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import AdminAuditDetailsContainer from '@/components/containers/AdminAuditDetailsContainer';
import { getAdminActionLog } from '@/services/admin/actionsLogs';
import type { AdminActionLogDetails } from '@/types/admin/action-log';

export default function AdminAuditDetailsPage() {
  const params = useParams<{
    id: string;
  }>();

  const [log, setLog] = useState<AdminActionLogDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLog() {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getAdminActionLog(params.id);
        setLog(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o detalhe da auditoria.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadLog();
  }, [params.id]);

  if (loading) {
    return (
      <main className="w-full max-w-7xl mx-auto py-12 md:py-20 px-6">
        <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-4">
          <Link
            href="/admin/auditoria"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para auditoria
          </Link>
        </div>

        <div className="flex min-h-[360px] items-center justify-center rounded-md border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium text-zinc-600">
              Carregando detalhe da auditoria...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !log) {
    return (
      <main className="w-full max-w-7xl mx-auto py-12 md:py-20 px-6">
        <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-4">
          <Link
            href="/admin/auditoria"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para auditoria
          </Link>
        </div>

        <section className="rounded-md border border-red-100 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">
            Não foi possível carregar o registro
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || 'Registro de auditoria não encontrado.'}
          </p>

          <Link
            href="/admin/auditoria"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Voltar para auditoria
          </Link>
        </section>
      </main>
    );
  }

  return <AdminAuditDetailsContainer log={log} />;
}
