import { z } from 'zod';

function validateCPF(cpf: string) {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

export const stepDataBaseSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 11, 'CPF deve ter 11 dígitos')
    .refine(validateCPF, 'CPF inválido'),
});

export const addressSchema = z.object({
  zip_code: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 8, 'CEP inválido'),
  city: z.string().min(2, 'Cidade obrigatória'),
  street: z.string().min(3, 'Endereço obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  state: z.string().length(2, 'UF inválida'),
  size: z.enum(['PP', 'P', 'M', 'G', 'GG', '3G'], {
    error: 'Escolha um tamanho',
  }),
});

export const getStepDataSchema = (isGift: boolean) =>
  isGift ? stepDataBaseSchema.merge(addressSchema) : stepDataBaseSchema;
