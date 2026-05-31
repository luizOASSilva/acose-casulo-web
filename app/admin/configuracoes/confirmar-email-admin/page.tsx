'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

import { confirmAdminEmailChange } from '@/services/admin/settings';

type ConfirmStatus = 'loading' | 'success' | 'error';

export default function ConfirmarEmailAdminPage() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const [message, setMessage] = useState('Confirmando alteração de e-mail...');

  useEffect(() => {
    const token = searchParams.get('token');

    async function confirmEmailChange() {
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmação não encontrado.');
        return;
      }

      const responseMessage = await confirmAdminEmailChange(token);

      if (!responseMessage) {
        setStatus('error');
        setMessage(
          'Não foi possível confirmar a alteração de e-mail. O link pode ter expirado ou já ter sido utilizado.'
        );
        return;
      }

      setStatus('success');
      setMessage(responseMessage);
    }

    confirmEmailChange();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-md border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-primary">
          {status === 'loading' && (
            <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
          )}

          {status === 'success' && (
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          )}

          {status === 'error' && (
            <XCircle className="h-7 w-7 text-red-600" aria-hidden="true" />
          )}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {status === 'loading' && 'Confirmando e-mail'}
          {status === 'success' && 'E-mail alterado'}
          {status === 'error' && 'Confirmação inválida'}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          {message}
        </p>

        <div className="mt-7">
          <Link
            href="/admin/configuracoes"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
          >
            Voltar para configurações
          </Link>
        </div>
      </section>
    </main>
  );
}
