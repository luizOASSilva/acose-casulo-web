import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import Filter from '@/components/ui/YearFilter';
import TransparencySection from '@/components/sections/TransparencySection';
import SupportCTA from '@/components/sections/SupportCTA';
import { getTransparencyData } from '@/services/transparency';
import { TransparencyResponse } from '@/types/transparency';

export const metadata: Metadata = {
  title: 'Transparência',
  description:
    'Acesse documentos públicos, contratos, atas e relatórios financeiros do Centro Dia.',
  alternates: {
    canonical: '/transparencia',
  },
  openGraph: {
    title: 'Transparência | Acose Casulo',
    description:
      'Portal da transparência: acesse documentos oficiais e prestações de contas da Acose Casulo.',
    url: '/transparencia',
    type: 'website',
    images: [{ url: '/og-transparencia.jpg', width: 1200, height: 630 }],
  },
};

interface PageProps {
  searchParams: Promise<{ ano?: string }>;
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
            Nossa <span className="text-primary">transparência</span> é pública
          </>
        }
        description="O Centro Dia da Pessoa com Deficiência demonstra os recursos recebidos e investidos na entidade."
        overlay={false}
      />

      <section aria-labelledby="transparency-title">
        <Filter years={years} activeYear={currentYear} />

        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-sm text-gray-700 mb-6" id="transparency-title">
            Exibindo documentos de{' '}
            <strong className="text-orange-800">{currentYear}</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-gray-200">
            {sortedCategories.map((category, index) => (
              <div
                key={category.id}
                className="border-r border-b border-gray-200"
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
        </div>

        <SupportCTA
          title="Tem alguma dúvida sobre nossos documentos? Entre em contato — respondemos o mais rápido possível"
          buttonText="Falar com a nossa equipe!"
        />
      </section>
    </main>
  );
}
