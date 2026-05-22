import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nome deve ter ao menos 3 caracteres.')
    .max(120, 'Nome deve ter no máximo 120 caracteres.'),

  email: z
    .email('Informe um e-mail válido.')
    .max(160, 'E-mail deve ter no máximo 160 caracteres.'),

  subject: z
    .string()
    .trim()
    .min(3, 'Assunto deve ter ao menos 3 caracteres.')
    .max(160, 'Assunto deve ter no máximo 160 caracteres.'),

  message: z
    .string()
    .trim()
    .min(10, 'Mensagem deve ter ao menos 10 caracteres.')
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres.'),
});

export type ContactSchemaData = z.infer<typeof contactSchema>;
