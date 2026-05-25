import { z } from 'zod';

const IMAGE_SETTING_KEYS = [
  'site_logo_url',
  'site_footer_logo_url',
  'site_og_image_url',
  'og_image_url',
];

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidPublicImagePath(value: string): boolean {
  if (!value) return true;

  const normalizedValue = value.trim();

  if (!normalizedValue) return true;

  if (normalizedValue.startsWith('/storage/')) {
    return /\.(svg|png|jpg|jpeg|webp)$/i.test(normalizedValue);
  }

  if (normalizedValue.startsWith('/')) {
    return /\.(svg|png|jpg|jpeg|webp)$/i.test(normalizedValue);
  }

  return isValidHttpUrl(normalizedValue);
}

export const settingsSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string(),
        type: z.string().optional(),
        value: z.string().nullable(),
      })
    )
    .superRefine((settings, ctx) => {
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

        if (IMAGE_SETTING_KEYS.includes(setting.key)) {
          if (!value) return;

          if (!isValidPublicImagePath(value)) {
            addError(
              'Use uma imagem válida, como /storage/media/general/logo.svg, /logo.svg ou uma URL completa.'
            );
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

          if (!isValidHttpUrl(value)) {
            addError('Informe uma URL válida.');
          }
        }
      });
    }),
});

export type SettingsSchemaData = z.infer<typeof settingsSchema>;
