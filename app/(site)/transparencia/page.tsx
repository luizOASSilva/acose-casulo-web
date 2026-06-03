import type { Metadata } from 'next';

import Hero from '@/components/sections/Hero/Hero';
import YearFilter from '@/components/ui/YearFilter';
import TransparencySection from '@/components/sections/TransparencySection';
import SupportCTA from '@/components/sections/SupportCTA';

import { getTransparencyData } from '@/services/transparency';
import { OG_IMAGE } from '@/lib/config';

import type { TransparencyResponse } from '@/types/transparency';

interface PageProps {
  searchParams: Promise<{ ano?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { ano } = await searchParams;

  return {
    title: 'Transparência',
    description:
      'Acesse documentos públicos, contratos, atas e relatórios financeiros do Centro Dia.',
    alternates: {
      canonical: ano ? `/transparencia?ano=${ano}` : '/transparencia',
    },
    openGraph: {
      title: 'Transparência | Acose Casulo',
      description:
        'Portal da transparência: acesse documentos oficiais e prestações de contas da Acose Casulo.',
      url: ano ? `/transparencia?ano=${ano}` : '/transparencia',
      type: 'website',
      images: OG_IMAGE,
    },
  };
}

export default async function Transparencia({ searchParams }: PageProps) {
  const { ano } = await searchParams;

  const anoAtual = ano ? Number(ano) : new Date().getFullYear();

  const data: TransparencyResponse | null = await getTransparencyData(anoAtual);

  const years = data?.years || [];
  const currentYear = data?.year ?? anoAtual;
  const categories = data?.categories || [];

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <main>
      <Hero
        title={
          <>
            Nossa <span className="text-primary-light">transparência</span> é
            pública
          </>
        }
        description="O Centro Dia da Pessoa com Deficiência demonstra os recursos recebidos e investidos na entidade."
        overlay={false}
      />

      <section aria-labelledby="transparency-title">
        <YearFilter years={years} activeYear={currentYear} />

        <div className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-6 text-sm text-gray-700" id="transparency-title">
            Exibindo documentos de{' '}
            <strong className="text-orange-800">{currentYear}</strong>
          </h2>

          {sortedCategories.length > 0 ? (
            <div className="grid items-stretch border-l border-t border-gray-200 md:grid-cols-2 lg:grid-cols-3">
              {sortedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex min-h-[340px] border-b border-r border-gray-200"
                >
                  <TransparencySection
                    number={(index + 1).toString().padStart(2, '0')}
                    title={category.name}
                    description={category.description}
                    documents={category.documents}
                    variant={
                      category.featured
                        ? 'featured'
                        : category.order === 3
                          ? 'dark'
                          : 'light'
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-gray-800">
                Nenhum documento encontrado para {currentYear}.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Assim que novos documentos forem cadastrados, eles aparecerão
                nesta área.
              </p>
            </div>
          )}
        </div>

        <SupportCTA
          title="Tem alguma dúvida sobre nossos documentos? Entre em contato — respondemos o mais rápido possível"
          buttonText="Falar com a nossa equipe!"
        />
      </section>
    </main>
  );
}
