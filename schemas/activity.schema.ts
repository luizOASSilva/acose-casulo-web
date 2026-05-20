import { z } from 'zod';

export const activitySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(80, 'Título deve ter no máximo 80 caracteres'),

  content: z
    .string()
    .trim()
    .min(1, 'Conteúdo obrigatório'),

  image_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => {
      if (!value) return true;

      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, 'URL da imagem inválida'),

  image_description: z
    .string()
    .trim()
    .max(255, 'Texto alternativo deve ter no máximo 255 caracteres')
    .optional(),

  image_caption: z
    .string()
    .trim()
    .max(255, 'Legenda deve ter no máximo 255 caracteres')
    .optional(),
});

export type ActivitySchemaData = z.infer<typeof activitySchema>;
