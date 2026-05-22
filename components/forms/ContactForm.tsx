'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormWrapper from '@/components/ui/FormWrapper';
import {
  contactSchema,
  type ContactSchemaData,
} from '@/schemas/contact.schema';
import { sendContactMessage } from '@/services/contact';

const fieldClass = `
  bg-white/10 border border-white/20 text-white placeholder:text-white/40
  w-full rounded-md px-4 py-3 text-sm
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
  hover:border-white/40
  aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-400/20
`;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-red-300">{message}</p>;
}

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSchemaData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactSchemaData) => {
    setStatus('idle');

    const success = await sendContactMessage(data);

    if (!success) {
      setStatus('error');
      return;
    }

    setStatus('success');
    reset();
  };

  return (
    <>
      <FormWrapper onSubmit={handleSubmit(onSubmit)} loading={isSubmitting}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Nome{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>

          <FieldError message={errors.name?.message} />

          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            aria-invalid={!!errors.name}
            {...register('name')}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            E-mail{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>

          <FieldError message={errors.email?.message} />

          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
            {...register('email')}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="subject"
            className="text-sm font-medium text-white/80"
          >
            Assunto{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>

          <FieldError message={errors.subject?.message} />

          <input
            id="subject"
            type="text"
            placeholder="Como podemos ajudar?"
            aria-invalid={!!errors.subject}
            {...register('subject')}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="message"
            className="text-sm font-medium text-white/80"
          >
            Mensagem{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>

          <FieldError message={errors.message?.message} />

          <textarea
            id="message"
            rows={5}
            placeholder="Descreva sua dúvida ou mensagem..."
            aria-invalid={!!errors.message}
            {...register('message')}
            className={`${fieldClass} resize-none`}
          />
        </div>
      </FormWrapper>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-2 text-sm"
      >
        {status === 'success' && (
          <p className="font-medium text-green-400">
            ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
          </p>
        )}

        {status === 'error' && (
          <p className="font-medium text-red-300">
            ✗ Erro ao enviar. Tente novamente ou nos contate por e-mail.
          </p>
        )}
      </div>
    </>
  );
}
