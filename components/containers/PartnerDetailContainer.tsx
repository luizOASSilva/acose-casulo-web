'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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

function getPartnerCardData({
  id,
  name,
  src,
  bgColor,
  websiteUrl,
  order,
  isActive,
}: {
  id: number;
  name: string;
  src: string;
  bgColor: string;
  websiteUrl: string | null;
  order: number;
  isActive: boolean;
}): Partner {
  return {
    id,
    name: name || 'Parceiro',
    src,
    logo_url: src,
    logoUrl: src,
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

  const [logoUrl, setLogoUrl] = useState(partner?.logo_url || '');
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  const pendingLogoPreviewUrl = useMemo(() => {
    if (!pendingLogoFile) return '';

    return URL.createObjectURL(pendingLogoFile);
  }, [pendingLogoFile]);

  const displayLogoUrl = pendingLogoPreviewUrl || logoUrl;

  useEffect(() => {
    return () => {
      if (pendingLogoPreviewUrl) {
        URL.revokeObjectURL(pendingLogoPreviewUrl);
      }
    };
  }, [pendingLogoPreviewUrl]);

  useEffect(() => {
    setName(partner?.name || '');
    setWebsiteUrl(partner?.website_url || '');
    setBgColor(partner?.bg_color || '#ffffff');
    setOrder(partner?.order ?? 0);
    setIsActive(
      partner?.is_active === undefined ? true : Boolean(partner.is_active)
    );
    setLogoUrl(partner?.logo_url || '');
    setPendingLogoFile(null);
    setErrors({});
  }, [partner]);

  const hasPendingChanges = useMemo(() => {
    if (isCreationFlow) {
      return (
        Boolean(name.trim()) ||
        Boolean(websiteUrl.trim()) ||
        bgColor !== '#ffffff' ||
        order !== 0 ||
        isActive !== true ||
        Boolean(logoUrl) ||
        pendingLogoFile !== null
      );
    }

    return (
      pendingLogoFile !== null ||
      logoUrl !== (partner?.logo_url || '') ||
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
    });
  }, [partner?.id, name, displayLogoUrl, bgColor, websiteUrl, order, isActive]);

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
    }

    if (name.trim().length > 255) {
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

    if (!displayLogoUrl && !pendingLogoFile) {
      nextErrors.logo = 'Selecione uma logo para o parceiro.';
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

      if (pendingLogoFile) {
        const uploaded = await uploadMediaFile('partners', pendingLogoFile);

        if (!uploaded?.url) {
          throw new Error('Não foi possível enviar a logo selecionada.');
        }

        finalLogoUrl = uploaded.url;
      }

      const finalLogoPath = storageUrlToPath(finalLogoUrl);

      const payload = {
        name: name.trim(),
        logo_path: finalLogoPath,
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
    <main className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6 selection:bg-primary selection:text-white">
      <header className="mb-10 space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Voltar para parceiros
        </button>

        <div className="pt-4 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {isCreationFlow ? 'Criar Novo Parceiro' : 'Editar Parceiro'}
          </h1>

          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-block border border-emerald-100">
            {isCreationFlow
              ? 'Cadastre uma nova logo e informações para exibição na seção de parceiros.'
              : 'Atualize a logo, cores e informações exibidas na seção de parceiros.'}
          </p>
        </div>
      </header>

      <section className="rounded-md border border-dashed border-gray-300 bg-white p-6 md:p-8">
        <div className="space-y-8">
          <section className="rounded-md border border-zinc-200 bg-zinc-50 p-5">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Prévia no site
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Visualização usando o mesmo card da seção pública de parceiros.
              </p>
            </div>

            <div className="flex min-h-40 items-center justify-center rounded-md border border-zinc-200 bg-white p-6">
              {displayLogoUrl ? (
                <PartnerCard logo={partnerCardData} index={0} />
              ) : (
                <div className="rounded-md border border-dashed border-zinc-300 px-5 py-6 text-center text-xs text-zinc-400">
                  Nenhuma logo selecionada
                </div>
              )}
            </div>

            <FieldError message={errors.logo} />

            {pendingLogoFile && (
              <p className="mt-3 text-xs font-medium text-orange-600">
                Nova logo pronta para salvar. O upload só acontece ao confirmar.
              </p>
            )}
          </section>

          <div className="rounded-md border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 text-xs font-bold text-gray-800 uppercase tracking-wider">
              Logo do parceiro
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
                setLogoUrl(url);
                setPendingLogoFile(null);
                clearError('logo');
              }}
              label="Logo do parceiro"
              helperText="Escolha uma logo existente ou selecione uma nova do computador. O upload só acontece ao salvar."
            />

            <FieldError message={errors.logo} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">
              Nome do parceiro
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError('name');
              }}
              className={fieldClass(
                errors.name,
                'w-full text-sm bg-white border rounded-md px-4 py-3 focus:outline-none text-gray-800'
              )}
              placeholder="Ex: Parceiro Institucional"
              maxLength={255}
            />

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

            <input
              type="url"
              value={websiteUrl}
              onChange={(event) => {
                setWebsiteUrl(event.target.value);
                clearError('website_url');
              }}
              className={fieldClass(
                errors.website_url,
                'w-full text-sm bg-white border rounded-md px-4 py-3 focus:outline-none text-gray-800 font-mono'
              )}
              placeholder="https://exemplo.com.br"
              maxLength={2048}
            />

            <FieldError message={errors.website_url} />

            {websiteUrl && !errors.website_url && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Abrir site ↗
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Cor de fundo
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={bgColor}
                  onChange={(event) => {
                    setBgColor(event.target.value);
                    clearError('bg_color');
                  }}
                  className={fieldClass(
                    errors.bg_color,
                    'w-full text-sm bg-white border rounded-md px-4 py-3 pr-14 focus:outline-none text-gray-800 font-mono'
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

              <input
                type="number"
                value={order}
                onChange={(event) => {
                  setOrder(Number(event.target.value));
                  clearError('order');
                }}
                className={fieldClass(
                  errors.order,
                  'w-full text-sm bg-white border rounded-md px-4 py-3 focus:outline-none text-gray-800'
                )}
                placeholder="0"
              />

              <FieldError message={errors.order} />
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-white px-4 py-4">
            <button
              type="button"
              onClick={() => setIsActive((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Parceiro ativo
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Quando desativado, o parceiro pode ser ocultado da seção pública.
                </p>
              </div>

              <span
                className={`
                  rounded-full px-3 py-1 text-xs font-bold
                  ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }
                `}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-md border border-gray-300 transition-colors cursor-pointer disabled:opacity-60"
            >
              Descartar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || (!hasPendingChanges && !isCreationFlow)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting
                ? pendingLogoFile
                  ? 'Enviando logo...'
                  : 'Salvando...'
                : isCreationFlow
                  ? 'Criar Parceiro'
                  : 'Confirmar e Salvar'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
