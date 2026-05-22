import { z } from 'zod';

const logoPathRegex = /^\/[A-Za-z0-9._-]+\.(svg|png|jpg|jpeg|webp)$/i;

export const settingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string(),
      type: z.string().optional(),
      value: z.string().nullable(),
    })
  ).superRefine((settings, ctx) => {
    settings.forEach((setting, index) => {
      const value = setting.value?.trim() ?? '';

      const addError = (message: string) => {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'value'],
          message,
        });
      };

      if (value.length > 2048) {
        addError('O valor deve ter no máximo 2048 caracteres.');
        return;
      }

      if (setting.key === 'site_logo_url') {
        if (!value) return;

        if (!logoPathRegex.test(value)) {
          addError('Use apenas o caminho público da imagem. Exemplo: /logo.svg');
        }

        return;
      }

      if (setting.type === 'email' && value) {
        const parsedEmail = z.email().safeParse(value);

        if (!parsedEmail.success) {
          addError('Informe um e-mail válido.');
        }

        return;
      }

      if (setting.type === 'url' && value) {
        if (value.startsWith('/')) return;

        try {
          const url = new URL(value);

          if (!['http:', 'https:'].includes(url.protocol)) {
            addError('Informe uma URL válida.');
          }
        } catch {
          addError('Informe uma URL válida.');
        }
      }
    });
  }),
});

export type SettingsSchemaData = z.infer<typeof settingsSchema>;
