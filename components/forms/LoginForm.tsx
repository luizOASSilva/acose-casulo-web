// components/forms/LoginForm.tsx
'use client';

import { useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, admin, loading } = useAuth();
  const router = useRouter();

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!loading && admin) {
      router.push('/admin');
    }
  }, [admin, loading, router]);

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError('root', {
        message: err?.message ?? 'Credenciais inválidas.',
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label="Formulário de acesso"
      className="w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
              aria-invalid={!!errors.email}
              placeholder="voce@exemplo.com"
              {...register('email')}
              className="h-12 w-full rounded-md border border-neutral-200 bg-white pl-12 pr-4 text-sm text-[#141210] outline-none transition placeholder:text-neutral-400 focus:border-primary aria-[invalid=true]:border-red-300"
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={passwordId}
              className="text-sm font-medium text-neutral-700"
            >
              Senha
            </label>
            <button
              type="button"
              className="text-xs font-medium text-primary transition hover:opacity-80"
            >
              Esqueceu sua senha?
            </button>
          </div>
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
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={!!errors.password}
              placeholder="Digite sua senha"
              {...register('password')}
              className="h-12 w-full rounded-md border border-neutral-200 bg-white pl-12 pr-4 text-sm text-[#141210] outline-none transition placeholder:text-neutral-400 focus:border-primary aria-[invalid=true]:border-red-300"
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
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {errors.root && (
            <motion.div
              id={errorId}
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl px-4 py-3 text-sm text-red-700"
            >
              {errors.root.message}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />
          )}
          <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
        </button>
      </form>
    </motion.section>
  );
}
