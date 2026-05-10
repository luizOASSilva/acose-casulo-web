import type { Metadata } from 'next';
import PartnerMarquee from '@/components/sections/PartnerMarquee';
import StatCounterClient from '@/components/ui/statCount/StatCountClient';
import SupportCTA from '@/components/sections/SupportCTA';
import { OG_IMAGE } from '@/lib/config';

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

const partners = [
  { name: 'Apoio Social', src: '/parceiros/apoio-social.svg', bgColor: '#ffffff' },
  { name: 'Casa do Pintor', src: '/parceiros/casa-do-pintor.svg', bgColor: '#ffffff' },
  { name: 'Damatsu', src: '/parceiros/damatsu.svg', bgColor: '#ffffff' },
  { name: 'Giorgino', src: '/parceiros/giorgino.svg', bgColor: '#212121' },
  { name: 'José Paulino', src: '/parceiros/jose-paulino.svg', bgColor: '#ffffff' },
  { name: 'Makino', src: '/parceiros/makino.svg', bgColor: '#ffffff' },
  { name: 'Marcus Bonna', src: '/parceiros/marcus-bonna.svg', bgColor: '#ffffff' },
  { name: 'Musical Tassara', src: '/parceiros/musical-tassara.svg', bgColor: '#000000' },
  { name: 'Parque Brasil', src: '/parceiros/parque-brasil.svg', bgColor: '#ffffff' },
  { name: 'Policog', src: '/parceiros/policog.svg', bgColor: '#000000' },
  { name: 'Primeira Impressão', src: '/parceiros/primeira-impressao.svg', bgColor: '#4A5672' },
  { name: 'Probac', src: '/parceiros/probac.svg', bgColor: '#000000' },
  { name: 'Woodpel', src: '/parceiros/woodpel.svg', bgColor: '#ffffff' },
];

export default function Parceiros() {
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
            <StatCounterClient value={13} label="Parceiros ativos" color="text-gray-900" />
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
