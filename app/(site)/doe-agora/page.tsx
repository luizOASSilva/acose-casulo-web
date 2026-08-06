import type { Metadata } from 'next';
import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';

import DonationFlow from '@/components/forms/donation/DonationFlow';
import { OG_IMAGE } from '@/lib/config';
import {
  getPublicSettings,
  isDonationEnabled,
} from '@/services/public-settings';

export const dynamic = 'force-dynamic';

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

const defaultDonationMessage =
  'Você ajuda jovens adultos com deficiência em Bragança Paulista.';

function DonationUnavailable({
  message,
}: {
  message?: string | null;
}) {
  return (
    <main className="py-20">
      <section className="mx-auto flex min-h-[55vh] w-[90%] max-w-2xl items-center justify-center">
        <div className="w-full p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-primary">
            <HeartHandshake className="h-7 w-7" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-bold leading-snug text-black md:text-4xl">
            Doações temporariamente{' '}
            <span className="text-primary">indisponíveis.</span>
          </h1>

          <p className="mt-3 whitespace-pre-line text-center text-gray-600">
            {message ||
              'Estamos ajustando o fluxo de doações. Em breve essa opção estará disponível novamente.'}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            Voltar para o início
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function DoeAgora() {
  const settings = await getPublicSettings();

  const donationMessage =
    settings.donation_message?.trim() || defaultDonationMessage;

  if (!isDonationEnabled(settings)) {
    return <DonationUnavailable message={settings.donation_message} />;
  }

  return (
    <main className="py-20">
      <h1 className="text-2xl md:text-4xl font-bold text-black leading-snug text-center">
        Cada doação é um adulto que não fica{' '}
        <span className="text-primary">pra trás.</span>
      </h1>

      <p className="whitespace-pre-line text-center">
        {donationMessage}
      </p>

      <DonationFlow />
    </main>
  );
}
