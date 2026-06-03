import type { Metadata } from 'next';

import PartnerMarquee from '@/components/sections/PartnerMarquee';
import StatCounterClient from '@/components/ui/StatCount/StatCountClient';
import SupportCTA from '@/components/sections/SupportCTA';

import { OG_IMAGE } from '@/lib/config';
import { getPartners } from '@/services/partners';

import type { Partner } from '@/types/partner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Parceiros',
  description:
    'Conheça as empresas e instituições que apoiam o Centro Dia da Pessoa com Deficiência em Bragança Paulista. Juntos promovemos inclusão, autonomia e dignidade.',
  alternates: {
    canonical: '/parceiros',
  },
  openGraph: {
    title: 'Parceiros | Acose Casulo',
    description:
      'Empresas e instituições que acreditam no trabalho do Centro Dia e caminham com a gente na promoção da inclusão em Bragança Paulista.',
    url: '/parceiros',
    type: 'website',
    images: OG_IMAGE,
  },
};

function normalizePartnerUrl(value?: string | null): string {
  const url = value?.trim();

  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `https://${url}`;
}

export default async function Parceiros() {
  const apiPartners = await getPartners();

  const partners: Partner[] = apiPartners
    .filter((partner) => partner.logo_url)
    .map((partner) => ({
      id: partner.id,
      name: partner.name,
      src: partner.logo_url || '',
      bgColor: partner.bg_color || '#ffffff',
      bg_color: partner.bg_color,
      logo_url: partner.logo_url,
      logo_alt: partner.logo_alt,
      website_url: normalizePartnerUrl(partner.website_url),
      websiteUrl: normalizePartnerUrl(partner.website_url),
      url: normalizePartnerUrl(partner.website_url),
      order: partner.order,
      is_active: partner.is_active,
      isActive: partner.is_active,
    }));

  return (
    <main className="flex h-full flex-col justify-between py-8">
      <section>
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-8 px-6 pb-15 pt-10">
          <div className="space-y-2">
            <p className="text-md font-bold uppercase tracking-widest text-orange-700">
              Quem caminha com a gente
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 md:text-4xl">
              Parceiros do Centro Dia da Pessoa com Deficiência
            </h1>

            <p className="text-gray-600">
              Empresas e instituições que acreditam no nosso trabalho
            </p>
          </div>

          <div className="shrink-0 text-right">
            <StatCounterClient
              value={partners.length}
              label="Parceiros ativos"
              color="text-gray-900"
            />
          </div>
        </div>
      </section>

      <PartnerMarquee partners={partners} />

      <SupportCTA
        title="Quer apoiar o Centro Dia e fazer parte desta rede de parceiros?"
        buttonText="Seja um parceiro"
      />
    </main>
  );
}
