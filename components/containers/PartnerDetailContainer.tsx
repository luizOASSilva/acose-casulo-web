'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  ImageIcon,
  Link as LinkIcon,
  Palette,
  Save,
  SlidersHorizontal,
} from 'lucide-react';

import PartnerCard from '@/components/ui/PartnerCard';
import MediaPicker from '@/components/admin/MediaPicker';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import { uploadMediaFile } from '@/services/admin/media-library';
import {
  createPartner,
  type PartnerApiItem,
  storageUrlToPath,
  updatePartner,
} from '@/services/partners';
import type { Partner } from '@/types/partner';

interface PartnerDetailContainerProps {
  partner?: PartnerApiItem;
  isNew?: boolean;
  startInEditMode?: boolean;
}

type PartnerFormErrors = Partial<{
  name: string;
  website_url: string;
  bg_color: string;
  order: string;
  logo: string;
  logo_alt: string;
}>;

const ADMIN_PARTNERS_PATH = '/admin/parceiros';

function fieldClass(error?: string, className = '') {
  return `
    ${className}
    selection:bg-primary selection:text-white
    transition-all
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
  `;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-[11px] font-semibold text-red-600">
      {message}
    </p>
  );
}

function isValidHexColor(value: string) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeLogoDisplayUrl(url?: string | null): string {
  if (!url) return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('/storage/')
  ) {
    return url;
  }

  if (url.startsWith('storage/')) {
    return `/${url}`;
  }

  if (url.startsWith('media/partners/')) {
    return `/storage/${url}`;
  }

  return `/storage/media/partners/${url}`;
}

function getPartnerCardData({
  id,
  name,
  src,
  bgColor,
  websiteUrl,
  order,
  isActive,
  logoAlt,
}: {
  id: number;
  name: string;
  src: string;
  bgColor: string;
  websiteUrl: string | null;
  order: number;
  isActive: boolean;
  logoAlt: string;
}): Partner {
  return {
    id,
    name: name || 'Parceiro',
    src,
    logo_url: src,
    logoUrl: src,
    logo_alt: logoAlt,
    logoAlt,
    bgColor,
    bg_color: bgColor,
    website_url: websiteUrl,
    websiteUrl,
    order,
    is_active: isActive,
    isActive,
  } as Partner;
}

export default function PartnerDetailContainer({
  partner,
  isNew = false,
}: PartnerDetailContainerProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  const isCreationFlow = isNew || !partner?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PartnerFormErrors>({});

  const [name, setName] = useState(partner?.name || '');
  const [websiteUrl, setWebsiteUrl] = useState(partner?.website_url || '');
  const [bgColor, setBgColor] = useState(partner?.bg_color || '#ffffff');
  const [order, setOrder] = useState<number>(partner?.order ?? 0);
  const [isActive, setIsActive] = useState(
    partner?.is_active === undefined ? true : Boolean(partner.is_active)
  );

  const [logoUrl, setLogoUrl] = useState(
    normalizeLogoDisplayUrl(partner?.logo_url)
  );

  const [logoPath, setLogoPath] = useState(storageUrlToPath(partner?.logo_url));
  const [logoAlt, setLogoAlt] = useState(
    partner?.logo_alt || partner?.name || ''
  );

  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  const pendingLogoPreviewUrl = useMemo(() => {
    if (!pendingLogoFile) return '';

    return URL.createObjectURL(pendingLogoFile);
  }, [pendingLogoFile]);

  const displayLogoUrl =
    pendingLogoPreviewUrl || normalizeLogoDisplayUrl(logoUrl);

  useEffect(() => {
    return () => {
      if (pendingLogoPreviewUrl) {
        URL.revokeObjectURL(pendingLogoPreviewUrl);
      }
    };
  }, [pendingLogoPreviewUrl]);

  useEffect(() => {
    const normalizedLogoUrl = normalizeLogoDisplayUrl(partner?.logo_url);

    setName(partner?.name || '');
    setWebsiteUrl(partner?.website_url || '');
    setBgColor(partner?.bg_color || '#ffffff');
    setOrder(partner?.order ?? 0);
    setIsActive(
      partner?.is_active === undefined ? true : Boolean(partner.is_active)
    );
    setLogoUrl(normalizedLogoUrl);
    setLogoPath(storageUrlToPath(normalizedLogoUrl));
    setLogoAlt(partner?.logo_alt || partner?.name || '');
    setPendingLogoFile(null);
    setErrors({});
  }, [partner]);

  const hasPendingChanges = useMemo(() => {
    const originalLogoUrl = normalizeLogoDisplayUrl(partner?.logo_url);
    const originalLogoPath = storageUrlToPath(originalLogoUrl);

    if (isCreationFlow) {
      return (
        Boolean(name.trim()) ||
        Boolean(websiteUrl.trim()) ||
        bgColor !== '#ffffff' ||
        order !== 0 ||
        isActive !== true ||
        Boolean(logoUrl) ||
        Boolean(logoPath) ||
        Boolean(logoAlt.trim()) ||
        pendingLogoFile !== null
      );
    }

    return (
      pendingLogoFile !== null ||
      logoPath !== originalLogoPath ||
      normalizeLogoDisplayUrl(logoUrl) !== originalLogoUrl ||
      logoAlt !== (partner?.logo_alt || partner?.name || '') ||
      name !== (partner?.name || '') ||
      websiteUrl !== (partner?.website_url || '') ||
      bgColor !== (partner?.bg_color || '#ffffff') ||
      order !== (partner?.order ?? 0) ||
      isActive !== Boolean(partner?.is_active)
    );
  }, [
    isCreationFlow,
    pendingLogoFile,
    logoUrl,
    logoPath,
    logoAlt,
    name,
    websiteUrl,
    bgColor,
    order,
    isActive,
    partner,
  ]);

  const partnerCardData = useMemo(() => {
    return getPartnerCardData({
      id: partner?.id ?? 0,
      name,
      src: displayLogoUrl,
      bgColor,
      websiteUrl: websiteUrl.trim() || null,
      order,
      isActive,
      logoAlt: logoAlt.trim() || name.trim() || 'Logo do parceiro',
    });
  }, [
    partner?.id,
    name,
    displayLogoUrl,
    bgColor,
    websiteUrl,
    order,
    isActive,
    logoAlt,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges]);

  const clearError = (field: keyof PartnerFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const validate = (): boolean => {
    const nextErrors: PartnerFormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Informe o nome do parceiro.';
    } else if (name.trim().length > 255) {
      nextErrors.name = 'O nome deve ter no máximo 255 caracteres.';
    }

    if (websiteUrl.trim() && !isValidUrl(websiteUrl)) {
      nextErrors.website_url =
        'Informe uma URL válida começando com http:// ou https://.';
    }

    if (bgColor.trim() && !isValidHexColor(bgColor)) {
      nextErrors.bg_color = 'Informe uma cor hexadecimal válida. Ex: #ffffff.';
    }

    if (!Number.isInteger(Number(order))) {
      nextErrors.order = 'A ordem precisa ser um número inteiro.';
    }

    if (!displayLogoUrl && !pendingLogoFile && !logoPath) {
      nextErrors.logo = 'Selecione uma logo para o parceiro.';
    }

    if (logoAlt.trim().length > 255) {
      nextErrors.logo_alt =
        'O texto alternativo deve ter no máximo 255 caracteres.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const confirmDiscard = async (): Promise<boolean> => {
    if (!hasPendingChanges) return true;

    return confirm({
      title: 'Descartar alterações?',
      description:
        'Você tem alterações pendentes que ainda não foram salvas. Se continuar, tudo que foi alterado será perdido.',
      confirmText: 'Descartar',
      cancelText: 'Continuar editando',
      variant: 'danger',
    });
  };

  const handleBack = async () => {
    if (!(await confirmDiscard())) return;

    router.push(ADMIN_PARTNERS_PATH);
  };

  const handleCancel = async () => {
    if (!(await confirmDiscard())) return;

    router.push(ADMIN_PARTNERS_PATH);
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let finalLogoUrl = logoUrl;
      let finalLogoPath = logoPath;

      if (pendingLogoFile) {
        const uploaded = await uploadMediaFile('partners', pendingLogoFile);

        if (!uploaded?.url) {
          throw new Error('Não foi possível enviar a logo selecionada.');
        }

        finalLogoUrl = normalizeLogoDisplayUrl(uploaded.url);
        finalLogoPath = storageUrlToPath(finalLogoUrl);

        setLogoUrl(finalLogoUrl);
        setLogoPath(finalLogoPath);
        setPendingLogoFile(null);
      }

      if (!finalLogoPath) {
        finalLogoPath = storageUrlToPath(finalLogoUrl);
      }

      const payload = {
        name: name.trim(),
        logo_path: finalLogoPath,
        logo_alt: logoAlt.trim() || null,
        website_url: websiteUrl.trim() || null,
        bg_color: bgColor.trim() || '#ffffff',
        order: Number(order),
        is_active: isActive,
      };

      const response = isCreationFlow
        ? await createPartner(payload)
        : partner?.id
          ? await updatePartner(partner.id, payload)
          : null;

      if (response) {
        await confirm({
          title: isCreationFlow ? 'Parceiro criado' : 'Parceiro atualizado',
          description: isCreationFlow
            ? 'O parceiro foi criado com sucesso.'
            : 'As alterações do parceiro foram salvas com sucesso.',
          confirmText: 'Entendi',
          cancelText: 'Fechar',
          variant: 'success',
        });

        router.push(ADMIN_PARTNERS_PATH);
        router.refresh();
        return;
      }

      await confirm({
        title: 'Erro ao salvar',
        description:
          'Não foi possível salvar o parceiro agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } catch (error) {
      await confirm({
        title: 'Erro ao salvar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o parceiro agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 selection:bg-primary selection:text-white md:py-20">
      <header className="mb-10 space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para parceiros
        </button>

        <div className="space-y-2 pt-4">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {isCreationFlow ? 'Criar Novo Parceiro' : 'Editar Parceiro'}
          </h1>

          <p className="inline-block rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm text-gray-600">
            Painel conectado ao banco de dados. Alterações são refletidas em
            tempo real.
          </p>
        </div>
      </header>

      <section className="space-y-6">
        <div className="space-y-4 rounded-md border border-gray-200/60 bg-gray-50/70 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Mídia do parceiro
          </h3>

          <MediaPicker
            collection="partners"
            value={logoUrl}
            pendingFile={pendingLogoFile}
            onPendingFileChange={(file) => {
              setPendingLogoFile(file);
              clearError('logo');
            }}
            onChange={(url) => {
              const normalizedUrl = normalizeLogoDisplayUrl(url);
              const normalizedPath = storageUrlToPath(normalizedUrl);

              setLogoUrl(normalizedUrl);
              setLogoPath(normalizedPath);
              setPendingLogoFile(null);
              clearError('logo');
            }}
            label="Logo do parceiro"
            helperText="Escolha uma logo existente ou selecione uma nova do computador. O upload só acontece ao salvar."
          />

          <FieldError message={errors.logo} />

          {pendingLogoFile && (
            <p className="text-xs font-medium text-orange-600">
              Nova logo pronta para salvar. O upload só acontece ao confirmar.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                URL da Imagem
              </label>

              <input
                type="text"
                value={logoUrl}
                onChange={(event) => {
                  const normalizedUrl = normalizeLogoDisplayUrl(
                    event.target.value
                  );
                  const normalizedPath = storageUrlToPath(normalizedUrl);

                  setLogoUrl(event.target.value);
                  setLogoPath(normalizedPath);
                  clearError('logo');
                }}
                className={fieldClass(
                  errors.logo,
                  'w-full rounded-md border bg-white px-3 py-2 font-mono text-xs text-gray-700 focus:outline-none'
                )}
                placeholder="/storage/media/partners/logo.svg"
                maxLength={2048}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                Texto Alternativo
              </label>

              <input
                type="text"
                value={logoAlt}
                onChange={(event) => {
                  setLogoAlt(event.target.value);
                  clearError('logo_alt');
                }}
                className={fieldClass(
                  errors.logo_alt,
                  'w-full rounded-md border bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none'
                )}
                placeholder="Descrição da logo"
                maxLength={255}
              />

              <div className="flex justify-between">
                <FieldError message={errors.logo_alt} />

                <span className="ml-auto text-[11px] text-gray-400">
                  {logoAlt.length}/255
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">
            Nome do parceiro
          </label>

          <div className="relative">
            <ImageIcon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError('name');
              }}
              className={fieldClass(
                errors.name,
                'w-full rounded-md border bg-white py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none'
              )}
              placeholder="Ex: Parceiro Institucional"
              maxLength={255}
            />
          </div>

          <div className="flex items-start justify-between gap-3">
            <FieldError message={errors.name} />

            <span
              className={`ml-auto text-[11px] ${
                name.length > 240 ? 'text-orange-600' : 'text-gray-400'
              }`}
            >
              {name.length}/255
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">
            Site do parceiro
          </label>

          <div className="relative">
            <LinkIcon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              type="url"
              value={websiteUrl}
              onChange={(event) => {
                setWebsiteUrl(event.target.value);
                clearError('website_url');
              }}
              className={fieldClass(
                errors.website_url,
                'w-full rounded-md border bg-white py-3 pl-10 pr-4 font-mono text-sm text-gray-800 focus:outline-none'
              )}
              placeholder="https://exemplo.com.br"
              maxLength={2048}
            />
          </div>

          <FieldError message={errors.website_url} />

          {websiteUrl && !errors.website_url && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700"
            >
              Abrir site
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">
              Cor de fundo
            </label>

            <div className="relative">
              <Palette
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                type="text"
                value={bgColor}
                onChange={(event) => {
                  setBgColor(event.target.value);
                  clearError('bg_color');
                }}
                className={fieldClass(
                  errors.bg_color,
                  'w-full rounded-md border bg-white py-3 pl-10 pr-14 font-mono text-sm text-gray-800 focus:outline-none'
                )}
                placeholder="#ffffff"
                maxLength={7}
              />

              <input
                type="color"
                value={isValidHexColor(bgColor) ? bgColor : '#ffffff'}
                onChange={(event) => {
                  setBgColor(event.target.value);
                  clearError('bg_color');
                }}
                className="absolute right-3 top-1/2 h-7 w-8 -translate-y-1/2 cursor-pointer rounded border border-gray-200 bg-white"
                aria-label="Selecionar cor de fundo"
              />
            </div>

            <FieldError message={errors.bg_color} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">
              Ordem
            </label>

            <div className="relative">
              <SlidersHorizontal
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                type="number"
                value={order}
                onChange={(event) => {
                  setOrder(Number(event.target.value));
                  clearError('order');
                }}
                className={fieldClass(
                  errors.order,
                  'w-full rounded-md border bg-white py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none'
                )}
                placeholder="0"
              />
            </div>

            <FieldError message={errors.order} />
          </div>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={() => setIsActive((current) => !current)}
            aria-pressed={isActive}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Parceiro ativo
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Quando desativado, o parceiro pode ser ocultado da seção
                pública.
              </p>
            </div>

            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
                isActive
                  ? 'border-green-600 bg-green-600'
                  : 'border-zinc-300 bg-zinc-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        </div>

        <section className="rounded-md p-5 flex justify-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <ImageIcon size={18} aria-hidden="true" />
            </div>

            <div>
              <h3 className="font-semibold text-zinc-900">
                Prévia da logo
              </h3>

              <p className="text-xs text-zinc-500">
                Visualização usando o card público de parceiros
              </p>
            </div>
          </div>

          <div className="flex justify-center rounded-md px-5 py-6">
            {displayLogoUrl ? (
              <div className="w-full max-w-85">
                <PartnerCard logo={partnerCardData} index={0} />
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed border-zinc-300 px-5 py-8 text-center">
                <ImageIcon className="h-6 w-6 text-zinc-300" aria-hidden="true" />

                <p className="mt-2 text-xs text-zinc-400">
                  Nenhuma logo selecionada
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col items-stretch justify-end gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="cursor-pointer rounded-md border border-gray-300 bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            Descartar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || (!hasPendingChanges && !isCreationFlow)}
            className="cursor-pointer rounded-md bg-green-600 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />

              {isSubmitting
                ? pendingLogoFile
                  ? 'Enviando logo...'
                  : 'Salvando...'
                : isCreationFlow
                  ? 'Criar Parceiro'
                  : 'Confirmar e Salvar'}
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
