import { z } from 'zod';

export const activityScheduleSchema = z
  .object({
    weekday: z.enum(
      [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      {
        error: 'Escolha um dia da semana',
      }
    ),

    start_time: z
      .string()
      .min(1, 'Horário inicial obrigatório')
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inicial inválido'),

    end_time: z
      .string()
      .min(1, 'Horário final obrigatório')
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário final inválido'),
  })
  .refine((data) => data.end_time > data.start_time, {
    path: ['end_time'],
    message: 'Horário final deve ser maior que o inicial',
  });

export const activitySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Título deve ter ao menos 3 caracteres')
      .max(51, 'Título deve ter no máximo 51 caracteres'),

    content: z.string().trim().min(1, 'Conteúdo obrigatório'),

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
      .max(255, 'Legenda deve ter no máximo 255 caracteres')
      .nullable()
      .optional(),

    schedules: z
      .array(activityScheduleSchema)
      .min(1, 'Cadastre pelo menos um dia e horário'),
  })
  .superRefine((data, ctx) => {
    data.schedules.forEach((schedule, index) => {
      data.schedules.forEach((otherSchedule, otherIndex) => {
        if (index === otherIndex) return;

        const sameDay = schedule.weekday === otherSchedule.weekday;
        const overlaps =
          schedule.start_time < otherSchedule.end_time &&
          schedule.end_time > otherSchedule.start_time;

        if (sameDay && overlaps) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['schedules', index, 'start_time'],
            message: 'Existem horários sobrepostos nesta atividade',
          });
        }
      });
    });
  });

export type ActivitySchemaData = z.infer<typeof activitySchema>;
