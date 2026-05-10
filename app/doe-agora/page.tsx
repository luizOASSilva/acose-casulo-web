import type { Metadata } from 'next';
import DonationFlow from '@/components/forms/donation/DonationFlow';
import { OG_IMAGE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Doe Agora',
  description:
    'Faça uma doação ao Centro Dia da Pessoa com Deficiência e ajude a garantir dignidade, autonomia e acolhimento a jovens adultos com deficiência em Bragança Paulista.',
  alternates: {
    canonical: '/doe-agora',
  },
  openGraph: {
    title: 'Doe Agora | Acose Casulo',
    description:
      'Sua doação transforma vidas. Contribua com o Centro Dia da Pessoa com Deficiência em Bragança Paulista.',
    url: '/doe-agora',
    type: 'website',
    images: OG_IMAGE,
  },
};

export default function DoeAgora() {
  return (
    <div className="py-20">
      <h1 className="sr-only">Doe Agora</h1>
      <DonationFlow />
    </div>
  );
}
