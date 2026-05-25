'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import {
  deletePartner,
  type PartnerApiItem,
  updatePartner,
} from '@/services/partners';

interface PartnerListContainerProps {
  partners: PartnerApiItem[];
}

const ADMIN_PARTNERS_PATH = '/admin/parceiros';

function storageUrlToPath(url?: string | null): string {
  if (!url) return '';

  const marker = '/storage/';
  const index = url.indexOf(marker);

  if (index >= 0) {
    return url.slice(index + marker.length);
  }

  if (url.startsWith('storage/')) {
    return url.replace(/^storage\//, '');
  }

  return url;
}

export default function PartnerListContainer({
  partners,
}: PartnerListContainerProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  const activePartners = partners.filter((partner) => partner.is_active).length;
  const inactivePartners = partners.length - activePartners;

  const handleToggleActive = async (partner: PartnerApiItem) => {
    try {
      await updatePartner(partner.id, {
        name: partner.name,
        logo_path: storageUrlToPath(partner.logo_url),
        website_url: partner.website_url || null,
        bg_color: partner.bg_color || '#ffffff',
        order: partner.order ?? 0,
        is_active: !partner.is_active,
      });

      router.refresh();
    } catch (error) {
      await confirm({
        title: 'Erro ao atualizar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível alterar o status do parceiro agora.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    }
  };

  const handleDelete = async (partnerId: number, name: string) => {
    const confirmed = await confirm({
      title: 'Remover parceiro?',
      description: `O parceiro "${name}" será removido permanentemente. Essa ação não pode ser desfeita.`,
      confirmText: 'Remover parceiro',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deletePartner(partnerId);

    if (success) {
      await confirm({
        title: 'Parceiro removido',
        description: 'O parceiro foi removido com sucesso.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'success',
      });

      router.refresh();
      return;
    }

    await confirm({
      title: 'Erro ao remover',
      description:
        'Não foi possível remover o parceiro agora. Tente novamente em alguns instantes.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'danger',
    });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden py-4">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                Parceiros
              </h1>

              <p className="mt-3 text-base leading-relaxed text-zinc-600">
                Gerencie logos, links, cores e ordem de exibição dos parceiros institucionais da plataforma.
              </p>
            </div>

            <Link
              href={`${ADMIN_PARTNERS_PATH}/novo`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light active:scale-[0.98]"
            >
              Novo parceiro
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Métricas
            </h2>

            <p className="text-sm text-zinc-500">
              Dados gerais dos parceiros
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  Parceiros
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {partners.length}
                </h3>
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  Ativos
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {activePartners}
                </h3>
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  Inativos
                </p>

                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {inactivePartners}
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-orange-100 bg-orange-50 px-4 py-3">
          <p className="text-xs font-medium text-orange-800">
            Passe o mouse sobre uma logo para editar ou remover. Clique no selo <strong>Ativo</strong> ou <strong>Inativo</strong> para alternar a exibição pública do parceiro.
          </p>
        </section>

        {partners.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner, index) => (
              <article
                key={partner.id}
                className="group overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-t-md md:h-36"
                  style={{
                    backgroundColor: partner.bg_color || '#ffffff',
                  }}
                >
                  {partner.logo_url ? (
                    <Image
                      src={partner.logo_url}
                      alt={`Parceiro ${partner.name}`}
                      fill
                      sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 360px"
                      priority={index < 3}
                      className="object-contain p-7 transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-zinc-400">
                      Sem logo
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 z-20 bg-black/0 transition group-hover:bg-black/5" />

                  <div className="absolute left-4 top-4 z-30 translate-y-[-6px] opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(partner)}
                      className={`
                        pointer-events-auto rounded-full px-3 py-1 text-[11px] font-bold shadow-sm transition
                        ${
                          partner.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }
                      `}
                      title={
                        partner.is_active
                          ? 'Clique para deixar inativo'
                          : 'Clique para deixar ativo'
                      }
                    >
                      {partner.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  <div className="absolute right-4 top-4 z-30 flex translate-y-[-6px] items-center gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                      href={`${ADMIN_PARTNERS_PATH}/${partner.id}/editar`}
                      className="
                        pointer-events-auto p-2.5 rounded-xl transition-all active:scale-95 shadow-sm
                        text-gray-700 bg-white/95 backdrop-blur
                        hover:bg-orange-500/20 hover:text-orange-600
                      "
                      title="Editar parceiro"
                      aria-label="Editar parceiro"
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(partner.id, partner.name)}
                      className="
                        pointer-events-auto p-2.5 rounded-xl transition-all active:scale-95 shadow-sm
                        text-red-600 bg-red-50/95 backdrop-blur
                        hover:bg-red-100
                      "
                      title="Remover parceiro"
                      aria-label="Remover parceiro"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-zinc-900">
                        {partner.name}
                      </h2>

                      <p className="mt-1 text-xs text-zinc-500">
                        Ordem {partner.order ?? index + 1}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(partner)}
                      className={`
                        shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition md:hidden
                        ${
                          partner.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }
                      `}
                    >
                      {partner.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  <div className="mt-3 border-t border-zinc-100 pt-3">
                    {partner.website_url ? (
                      <p
                        className="truncate text-xs text-zinc-500"
                        title={partner.website_url}
                      >
                        {partner.website_url}
                      </p>
                    ) : (
                      <p className="truncate text-xs text-zinc-400">
                        Sem site cadastrado
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <h2 className="text-lg font-semibold text-zinc-900">
                Nenhum parceiro cadastrado
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Cadastre o primeiro parceiro para exibir na seção pública do site.
              </p>

              <Link
                href={`${ADMIN_PARTNERS_PATH}/novo`}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
              >
                Novo parceiro
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
