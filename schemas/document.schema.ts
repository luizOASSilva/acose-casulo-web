import { z } from 'zod';

export const documentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres'),

  file_url: z
    .string()
    .trim()
    .min(1, 'URL do arquivo obrigatória')
    .url('URL do arquivo inválida')
    .max(2048, 'URL do arquivo muito longa'),

  category_id: z
    .number({
      error: 'Categoria obrigatória',
    })
    .int('Categoria inválida')
    .positive('Categoria obrigatória'),

  year: z
    .number({
      error: 'Ano obrigatório',
    })
    .int('Ano inválido')
    .min(2000, 'Ano inválido')
    .max(2100, 'Ano inválido'),
});

export type DocumentSchemaData = z.infer<typeof documentSchema>;
