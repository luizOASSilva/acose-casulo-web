  import type { Metadata } from 'next';
  import ActivityGrid from '@/components/sections/ActivityGrid';
import { OG_IMAGE } from '@/lib/config';

  export const metadata: Metadata = {
    title: 'Atividades',
    description:
      'Conheça as atividades que promovem desenvolvimento, inclusão e qualidade de vida no Centro Dia da Pessoa com Deficiência em Bragança Paulista.',
    alternates: {
      canonical: '/atividades',
    },
    openGraph: {
      title: 'Atividades | Acose Casulo',
      description: 'Conheça as atividades que promovem desenvolvimento, inclusão e qualidade de vida no Centro Dia da Pessoa com Deficiência em Bragança Paulista.',
      url: '/atividades',
      type: 'website',
      images: OG_IMAGE,
    },
  };

  export default function Atividades() {
    return (
      <main id="conteudo" className="w-[90%] max-w-6xl mx-auto py-12 md:py-20">
        <header className="mb-12 space-y-3 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Atividades do Centro Dia
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Conheça as atividades desenvolvidas no Centro Dia, voltadas ao
            cuidado, desenvolvimento e bem-estar das pessoas atendidas.
          </p>
        </header>

        <section aria-labelledby="activities-list">
          <h2 id="activities-list" className="sr-only">
            Lista de atividades disponíveis
          </h2>
          <ActivityGrid />
        </section>
      </main>
    );
  }
