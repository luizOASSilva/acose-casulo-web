'use client';

import { useId, useState } from 'react';
import { Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

import { requestAdminPasswordReset } from '@/services/admin/settings';

const forgotPasswordSchema = z.object({
  email: z.email('E-mail inválido'),
});

interface ForgotPasswordFormProps {
  accessToken: string;
}

export default function ForgotPasswordForm({
  accessToken,
}: ForgotPasswordFormProps) {
  const emailId = useId();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();

    const parsed = forgotPasswordSchema.safeParse({
      email: cleanEmail,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    const responseMessage = await requestAdminPasswordReset({
      email: cleanEmail,
    });

    setIsSubmitting(false);

    if (!responseMessage) {
      setError(
        'Não foi possível enviar o link agora. Tente novamente em alguns instantes.'
      );
      return;
    }

    setMessage(
      responseMessage ||
        'Se este e-mail estiver cadastrado, enviaremos um link para redefinir a senha.'
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label="Formulário de recuperação de senha"
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label
            htmlFor={emailId}
            className="text-sm font-medium text-neutral-700"
          >
            E-mail
          </label>

          <div className="group relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary"
            >
              <Mail size={18} />
            </span>

            <input
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!error}
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
                setMessage('');
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-white pl-12 pr-4 text-sm text-[#141210] outline-none transition placeholder:text-neutral-400 focus:border-primary aria-invalid:border-red-300"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-700"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isSubmitting ? 'Enviando...' : 'Enviar link'}</span>
        </button>
      </form>
    </motion.section>
  );
}
