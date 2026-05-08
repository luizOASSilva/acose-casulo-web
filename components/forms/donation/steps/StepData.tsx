'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStepDataSchema } from '@/lib/donationSchema';
import { DonationData } from '@/types/donation';
import { cn } from '@/lib/cn';

type FormValues = Omit<DonationData, 'amount'>;

interface StepDataProps {
  data: DonationData;
  isGift: boolean;
  onNext: (data: FormValues) => void;
}

function maskCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

const ERROR_COLOR = '#ff6568';
const NORMAL_COLOR = '#e5e7eb';

function inputCls(hasError: boolean) {
  return cn(
    'w-full px-3 py-3 rounded-lg border-2 bg-white outline-none transition text-sm text-black',
    !hasError && 'focus:border-primary'
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return { borderColor: hasError ? ERROR_COLOR : NORMAL_COLOR };
}

function Field({
  label,
  error,
  dark,
  children,
}: {
  label: string;
  error?: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={cn('text-xs font-bold uppercase tracking-widest', dark ? 'text-gray-300' : 'text-gray-600')}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: ERROR_COLOR }}>{error}</p>}
    </div>
  );
}

export default function StepData({ data, isGift, onNext }: StepDataProps) {
  const schema = useMemo(() => getStepDataSchema(isGift), [isGift]);
  type Schema = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      ...(isGift && {
        zip_code: data.zip_code,
        city: data.city,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        state: data.state,
        size: (data.size as 'PP' | 'P' | 'M' | 'G' | 'GG' | '3G') || 'M',
      }),
    },
  });

  const size = watch('size' as keyof Schema);
  const zipCode = watch('zip_code' as keyof Schema) as string | undefined;
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!isGift || !zipCode) return;
    const digits = zipCode.replace(/\D/g, '');
    if (digits.length !== 8) return;

    const fetchCEP = async () => {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const json = await res.json();
        if (!json.erro) {
          setValue('city' as keyof Schema, json.localidade as any);
          setValue('street' as keyof Schema, json.logradouro as any);
          setValue('neighborhood' as keyof Schema, json.bairro as any);
          setValue('state' as keyof Schema, json.uf as any);
        }
      } catch {
      } finally {
        setCepLoading(false);
      }
    };
    fetchCEP();
  }, [zipCode, isGift, setValue]);

  const e = errors as any;

  return (
    <form onSubmit={handleSubmit((v) => onNext(v as FormValues))} className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-primary">Seus dados</h2>
        <p className="text-gray-600 text-sm mt-1">
          Para o recibo fiscal, e se aplicável, envio da camiseta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome" error={e.name?.message}>
          <input
            {...register('name')}
            className={inputCls(!!e.name)}
            style={inputStyle(!!e.name)}
            placeholder="Seu nome completo"
          />
        </Field>

        <Field label="CPF" error={e.cpf?.message}>
          <Controller
            name={'cpf' as keyof Schema}
            control={control}
            render={({ field, fieldState }) => (
              <input
                {...field}
                className={inputCls(!!fieldState.error)}
                style={inputStyle(!!fieldState.error)}
                placeholder="000.000.000-00"
                maxLength={14}
                onChange={(ev) => field.onChange(maskCPF(ev.target.value))}
              />
            )}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="E-mail" error={e.email?.message}>
            <input
              {...register('email')}
              type="email"
              className={inputCls(!!e.email)}
              style={inputStyle(!!e.email)}
              placeholder="seu@email.com"
            />
          </Field>
        </div>
      </div>

      {isGift && (
        <div className="bg-secondary p-6 space-y-6  sm:mx-0 rounded-md">
          <h3 className="text-primary font-bold text-sm uppercase tracking-widest">
            Endereço para a camiseta
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Field label="CEP" error={e.zip_code?.message} dark>
              <div className="relative">
                <Controller
                  name={'zip_code' as keyof Schema}
                  control={control}
                  render={({ field, fieldState }) => (
                    <input
                      {...field}
                      className={inputCls(!!fieldState.error)}
                      style={inputStyle(!!fieldState.error)}
                      placeholder="00000-000"
                      maxLength={9}
                      onChange={(ev) => field.onChange(maskCEP(ev.target.value))}
                    />
                  )}
                />
              </div>
              {cepLoading && (
                <span className="text-xs text-white">
                  Buscando...
                </span>
              )}
            </Field>

            <Field label="Cidade" error={e.city?.message} dark>
              <input
                {...register('city' as keyof Schema)}
                className={inputCls(!!e.city)}
                style={inputStyle(!!e.city)}
                placeholder="Sua cidade"
              />
            </Field>

            <div className="col-span-2">
              <Field label="Endereço" error={e.street?.message} dark>
                <input
                  {...register('street' as keyof Schema)}
                  className={inputCls(!!e.street)}
                  style={inputStyle(!!e.street)}
                  placeholder="Rua, avenida..."
                />
              </Field>
            </div>

            <Field label="Número" error={e.number?.message} dark>
              <input
                {...register('number' as keyof Schema)}
                className={inputCls(!!e.number)}
                style={inputStyle(!!e.number)}
                placeholder="123"
              />
            </Field>

            <Field label="Bairro" error={e.neighborhood?.message} dark>
              <input
                {...register('neighborhood' as keyof Schema)}
                className={inputCls(!!e.neighborhood)}
                style={inputStyle(!!e.neighborhood)}
                placeholder="Seu bairro"
              />
            </Field>
          </div>

          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Tamanho</p>
            <div className="flex gap-2 flex-wrap">
              {(['PP', 'P', 'M', 'G', 'GG', '3G'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('size' as keyof Schema, s as any)}
                  className={cn(
                    'w-10 h-10 rounded border font-bold text-xs transition cursor-pointer',
                    size === s ? 'bg-primary text-white border-primary' : 'bg-white text-black border-gray-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {e.size && <p className="text-xs mt-1" style={{ color: ERROR_COLOR }}>{e.size.message}</p>}
          </div>
        </div>
      )}

      <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-lg transition active:scale-[.98] cursor-pointer">
        Continuar
      </button>
    </form>
  );
}
