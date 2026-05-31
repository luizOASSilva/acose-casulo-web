'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

import {
  confirmAdminCreationRequest,
  getAdminCreationRequest,
} from '@/services/admin/settings';

import type { AdminCreationRequestPreview } from '@/types/admin/settings';

type PageStatus = 'loading' | 'ready' | 'confirming' | 'success' | 'error';

export default function ConfirmarCriacaoAdminPage() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<PageStatus>('loading');
  const [message, setMessage] = useState('Carregando solicitação...');
  const [preview, setPreview] =
    useState<AdminCreationRequestPreview | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    async function loadRequest() {
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmação não encontrado.');
        return;
      }

      const requestPreview = await getAdminCreationRequest(token);

      if (!requestPreview) {
        setStatus('error');
        setMessage(
          'Não foi possível carregar esta solicitação. O link pode ter expirado, já ter sido usado ou ser inválido.'
        );
        return;
      }

      setPreview(requestPreview);
      setStatus('ready');
      setMessage('Revise os dados abaixo antes de confirmar a criação.');
    }

    loadRequest();
  }, [token]);

  async function handleConfirm() {
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmação não encontrado.');
      return;
    }

    setStatus('confirming');
    setMessage('Confirmando criação do administrador...');

    const responseMessage = await confirmAdminCreationRequest(token);

    if (!responseMessage) {
      setStatus('error');
      setMessage(
        'Não foi possível confirmar a criação. O link pode ter expirado ou já ter sido utilizado.'
      );
      return;
    }

    setStatus('success');
    setMessage(responseMessage);
  }

  const isLoading = status === 'loading';
  const isReady = status === 'ready';
  const isConfirming = status === 'confirming';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-lg rounded-md border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-primary">
          {(isLoading || isConfirming) && (
            <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
          )}

          {isReady && <ShieldAlert className="h-7 w-7" aria-hidden="true" />}

          {isSuccess && (
            <CheckCircle2
              className="h-7 w-7 text-emerald-600"
              aria-hidden="true"
            />
          )}

          {isError && (
            <XCircle className="h-7 w-7 text-red-600" aria-hidden="true" />
          )}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            {isLoading && 'Carregando solicitação'}
            {isConfirming && 'Confirmando criação'}
            {isReady && 'Confirmar criação de administrador'}
            {isSuccess && 'Administrador criado'}
            {isError && 'Confirmação inválida'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {message}
          </p>
        </div>

        {preview && isReady && (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-orange-100 bg-orange-50 px-4 py-3">
              <div className="flex gap-3">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                  aria-hidden="true"
                />

                <p className="text-xs leading-relaxed text-orange-800">
                  Confira cuidadosamente o e-mail antes de confirmar. Após a
                  confirmação, este endereço receberá instruções para criar
                  senha e poderá acessar o painel conforme o nível informado.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Novo administrador
              </p>

              <p className="mt-2 text-sm font-semibold text-zinc-950">
                {preview.name}
              </p>

              <p className="mt-1 break-all text-sm text-zinc-700">
                {preview.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">
                  {preview.role}
                </span>

                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ${
                    preview.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {preview.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            {preview.requested_by && (
              <p className="text-xs leading-relaxed text-zinc-500">
                Solicitação feita por{' '}
                <strong>{preview.requested_by.name || 'Master'}</strong>
                {preview.requested_by.email
                  ? ` (${preview.requested_by.email})`
                  : ''}
                .
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/admin/configuracoes"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-95"
              >
                Cancelar
              </Link>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Confirmar criação
              </button>
            </div>
          </div>
        )}

        {(isSuccess || isError) && (
          <div className="mt-7 text-center">
            <Link
              href="/admin/configuracoes"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
            >
              Voltar para configurações
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
