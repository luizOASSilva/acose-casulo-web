import { z } from 'zod';

export const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(51, 'Título deve ter no máximo 51 caracteres'),

  summary: z
    .string()
    .trim()
    .min(1, 'Resumo SEO obrigatório')
    .max(160, 'Resumo SEO deve ter no máximo 160 caracteres'),

  content: z
    .string()
    .trim()
    .min(1, 'Conteúdo obrigatório'),

  image_url: z
    .string()
    .trim()
    .min(1, 'URL da imagem obrigatória')
    .url('URL da imagem inválida')
    .max(2048, 'URL da imagem muito longa'),

  image_description: z
    .string()
    .trim()
    .min(1, 'Texto alternativo obrigatório')
    .max(255, 'Texto alternativo deve ter no máximo 255 caracteres'),

  image_caption: z
    .string()
    .trim()
    .max(255, 'Legenda da imagem deve ter no máximo 255 caracteres')
    .nullable()
    .optional(),

  keywords: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Palavra-chave inválida')
        .max(255, 'Palavra-chave deve ter no máximo 255 caracteres')
    )
    .default([])
    .superRefine((keywords, ctx) => {
      const normalized = keywords.map((keyword) => keyword.toLowerCase());
      const unique = new Set(normalized);

      if (unique.size !== normalized.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Existem palavras-chave duplicadas',
        });
      }
    }),
});

export type ArticleSchemaData = z.infer<typeof articleSchema>;
