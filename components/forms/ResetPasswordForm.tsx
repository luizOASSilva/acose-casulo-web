'use client';

import { useId, useState } from 'react';
import { Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { resetAdminPassword } from '@/services/admin/settings';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres.'),
    password_confirmation: z
      .string()
      .min(8, 'Confirmação deve ter ao menos 8 caracteres.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'As senhas não conferem.',
  });

interface ResetPasswordFormProps {
  accessToken: string;
  resetToken: string;
}

export default function ResetPasswordForm({
  accessToken,
  resetToken,
}: ResetPasswordFormProps) {
  const router = useRouter();

  const passwordId = useId();
  const confirmationId = useId();

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [errors, setErrors] = useState<{
    password?: string;
    password_confirmation?: string;
    root?: string;
  }>({});

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setMessage('');

    const parsed = resetPasswordSchema.safeParse({
      password,
      password_confirmation: passwordConfirmation,
    });

    if (!parsed.success) {
      const nextErrors: typeof errors = {};

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === 'password') {
          nextErrors.password = issue.message;
        }

        if (field === 'password_confirmation') {
          nextErrors.password_confirmation = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    const responseMessage = await resetAdminPassword({
      token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    });

    setIsSubmitting(false);

    if (!responseMessage) {
      setErrors({
        root:
          'Não foi possível redefinir a senha. O link pode estar inválido ou expirado.',
      });
      return;
    }

    setPassword('');
    setPasswordConfirmation('');
    setMessage(responseMessage);

    window.setTimeout(() => {
      router.replace(`/acesso/${accessToken}`);
    }, 1800);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label="Formulário de redefinição de senha"
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label
            htmlFor={passwordId}
            className="text-sm font-medium text-neutral-700"
          >
            Nova senha
          </label>

          <div className="group relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary"
            >
              <Lock size={18} />
            </span>

            <input
              id={passwordId}
              type="password"
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.password}
              placeholder="Digite sua nova senha"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors({});
                setMessage('');
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-white pl-12 pr-4 text-sm text-[#141210] outline-none transition placeholder:text-neutral-400 focus:border-primary aria-invalid:border-red-300"
            />
          </div>

          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500"
              >
                {errors.password}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={confirmationId}
            className="text-sm font-medium text-neutral-700"
          >
            Confirmar senha
          </label>

          <div className="group relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary"
            >
              <Lock size={18} />
            </span>

            <input
              id={confirmationId}
              type="password"
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.password_confirmation}
              placeholder="Repita sua nova senha"
              value={passwordConfirmation}
              onChange={(event) => {
                setPasswordConfirmation(event.target.value);
                setErrors({});
                setMessage('');
              }}
              className="h-12 w-full rounded-md border border-neutral-200 bg-white pl-12 pr-4 text-sm text-[#141210] outline-none transition placeholder:text-neutral-400 focus:border-primary aria-invalid:border-red-300"
            />
          </div>

          <AnimatePresence>
            {errors.password_confirmation && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500"
              >
                {errors.password_confirmation}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {errors.root && (
            <motion.div
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
            >
              {errors.root}
            </motion.div>
          )}
        </AnimatePresence>

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
              {message} Redirecionando para o login...
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <span>{isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}</span>
        </button>
      </form>
    </motion.section>
  );
}
