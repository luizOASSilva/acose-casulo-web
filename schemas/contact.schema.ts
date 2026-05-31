import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nome deve ter ao menos 3 caracteres')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),

  email: z
    .string()
    .trim()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido')
    .max(180, 'E-mail deve ter no máximo 180 caracteres'),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((value) => value?.replace(/\D/g, '') ?? '')
    .refine(
      (value) => value === '' || value.length === 10 || value.length === 11,
      'Telefone inválido'
    ),

  subject: z
    .string()
    .trim()
    .min(3, 'Assunto deve ter ao menos 3 caracteres')
    .max(160, 'Assunto deve ter no máximo 160 caracteres'),

  message: z
    .string()
    .trim()
    .min(10, 'Mensagem deve ter ao menos 10 caracteres')
    .max(3000, 'Mensagem deve ter no máximo 3000 caracteres'),
});

export type ContactSchemaData = z.infer<typeof contactSchema>;
