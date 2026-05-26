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

export default async function Parceiros() {
  const apiPartners = await getPartners();

  const partners: Partner[] = apiPartners
    .filter((partner) => partner.logo_url)
    .map((partner) => ({
      name: partner.name,
      src: partner.logo_url || '',
      bgColor: partner.bg_color || '#ffffff',
    }));

  return (
    <main className="flex flex-col justify-between h-full py-8">
      <section>
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-15 flex items-end justify-between gap-8">
          <div className="space-y-2">
            <p className="text-orange-700 font-bold text-md tracking-widest uppercase">
              Quem caminha com a gente
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
              Parceiros do Centro Dia da Pessoa com Deficiência
            </h1>
            <p className="text-gray-600">
              Empresas e instituições que acreditam no nosso trabalho
            </p>
          </div>

          <div className="text-right shrink-0">
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
  