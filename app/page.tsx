import type { Metadata } from 'next';
import Carousel from '@/components/ui/Carousel/CarouselWrapper';
import Hero from '@/components/sections/Hero';
import Impact from '@/components/sections/Impact';
import Mission from '@/components/sections/Mission';
import Button from '@/components/ui/Button';
import LeafIllustration from '@/components/ui/LeafIllustration';
import { Briefcase, Coins, Recycle, Sprout } from 'lucide-react';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Acose Casulo | Centro Dia | Bragança Paulista',
    description:
      'Centro Dia da Pessoa com Deficiência — acolhimento, autonomia e dignidade para jovens adultos com deficiência em Bragança Paulista, SP.',
    url: '/',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main>
      <Hero
        image="/hero.jpg"
        overlay={false}
        title={<>"E quando forem adultos?"</>}
        description="O Centro Dia nasceu para responder essa pergunta — oferecendo acolhimento, autonomia e dignidade para jovens adultos com deficiência que o mundo insistia em esquecer."
      >
        <Button
          href="/centro-dia"
          ariaLabel="Conheça a história do Centro Dia da Pessoa com Deficiência"
          variant="secondary"
          text="Conheça nossa história"
        />
      </Hero>

      <section aria-labelledby="mission-title" className="py-20">
        <div className="w-4/5 mx-auto max-w-6xl">
          <div className="max-w-2xl mb-8 space-y-3">
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight text-gray-900"
              id="mission-title"
            >
              Sobre o Centro Dia
            </h2>
            <p className="text-gray-700 leading-relaxed font-medium">
              Entenda como o Projeto Casulo atua no cuidado, inclusão e
              desenvolvimento de jovens adultos com deficiência em Bragança
              Paulista.
            </p>
          </div>
          <Mission />
        </div>
      </section>

      <Impact />

      <section aria-labelledby="projects-title" className="pt-20">
        <div className="w-4/5 mx-auto max-w-6xl">
          <div className="w-auto space-y-3 mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight text-gray-900"
              id="projects-title"
            >
              Conheça nossos projetos!
            </h2>
            <p className="text-gray-700 leading-relaxed font-medium">
              Desenvolvemos atividades que transformam vidas, promovendo
              autonomia, inclusão e dignidade para adultos com deficiência. Cada
              projeto nasce do cuidado com as pessoas e do compromisso com um
              futuro mais justo.
            </p>
          </div>
        </div>

        <Carousel />

        <div className="w-4/5 mx-auto max-w-6xl mt-4 flex justify-center md:justify-start">
          <Button
            href="/atividades"
            ariaLabel="Conheça as atividades do Centro Dia da Pessoa com Deficiência"
            variant="secondary"
            text="Conhecer atividades"
          />
        </div>
      </section>

      <section
        className="relative py-20 overflow-hidden"
        aria-labelledby="environmental-title"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 lg:hidden">
          <LeafIllustration className="w-150 h-150" />
        </div>

        <div className="relative z-10 w-4/5 mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            <div className="flex-1">
              <header className="max-w-xl mb-16 space-y-4">
                {/* Ajustado para green-800 para contraste */}
                <p className="text-sm text-green-800 uppercase tracking-widest font-bold">
                  Compromisso Ambiental
                </p>
                <h2
                  id="environmental-title"
                  className="text-2xl md:text-3xl font-bold leading-tight text-gray-900"
                >
                  Centro Dia <span className="text-green-800">Ambiental</span>
                </h2>
                <p className="text-gray-800 leading-relaxed font-medium">
                  A reciclagem é uma das formas que o Centro Dia encontrou de
                  unir impacto social com responsabilidade ambiental, promovendo
                  consciência e transformação na comunidade.
                </p>
              </header>

              <ul className="pl-2 space-y-10 list-none">
                <li className="flex gap-4">
                  <div
                    className="text-green-800 mt-1 shrink-0"
                    aria-hidden="true"
                  >
                    <Recycle size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Reciclagem ativa</h3>
                    <p className="text-gray-800 mt-2 text-sm leading-relaxed font-medium">
                      Separação e reaproveitamento de resíduos, reduzindo
                      impactos ambientais e incentivando hábitos conscientes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div
                    className="text-green-800 mt-1 shrink-0"
                    aria-hidden="true"
                  >
                    <Sprout size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Horta comunitária</h3>
                    <p className="text-gray-800 mt-2 text-sm leading-relaxed font-medium">
                      Cultivo coletivo de alimentos, promovendo
                      sustentabilidade.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div
                    className="text-green-800 mt-1 shrink-0"
                    aria-hidden="true"
                  >
                    <Coins size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Moeda verde</h3>
                    <p className="text-gray-800 mt-2 text-sm leading-relaxed font-medium">
                      Troca de materiais recicláveis por benefícios.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div
                    className="text-green-800 mt-1 shrink-0"
                    aria-hidden="true"
                  >
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Geração de renda</h3>
                    <p className="text-gray-800 mt-2 text-sm leading-relaxed font-medium">
                      Criação de oportunidades através da reciclagem.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="hidden lg:flex items-center justify-center shrink-0">
              <LeafIllustration className="w-100 h-100" />
            </div>
          </div>

          <blockquote className="border-l-4 border-l-green-950 pl-6 mt-10 max-w-3xl bg-green-600/10 p-4 space-y-2">
            <p className="text-md italic text-gray-900 leading-relaxed font-medium">
              {'"'}O Centro Dia atua diretamente na preservação do meio
              ambiente, buscando a propagação de pequenas atitudes diárias que
              fazem toda a diferença.{'"'}
            </p>
            <cite className="block not-italic font-bold text-sm text-green-950">
              Projeto Casulo · Bragança Paulista
            </cite>
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="location-title" className="pb-20">
        <div className="w-4/5 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <header className="space-y-4">
                <h2
                  id="location-title"
                  className="text-2xl md:text-3xl font-bold leading-tight text-gray-900"
                >
                  Onde estamos
                </h2>

                <p className="text-gray-800 leading-relaxed font-medium">
                  O Projeto Casulo está localizado em Bragança Paulista, SP, em
                  um espaço preparado para promover acolhimento, inclusão e
                  desenvolvimento de jovens adultos com deficiência.
                </p>

                <div className="text-gray-800 leading-relaxed space-y-2 font-medium">
                  <p className="font-bold text-gray-900 text-lg">Endereço</p>
                  <address className="not-italic">
                    Rua Francisco Rodrigues Dias, 80
                    <br />
                    Uberaba — Bragança Paulista/SP
                    <br />
                    CEP: 12908-843
                  </address>
                </div>

                <p className="font-bold text-gray-900 text-lg">
                  Centro Dia Pessoa Com Deficiência
                </p>

                <p className="text-gray-800 leading-relaxed font-medium">
                  Nosso espaço oferece atividades socioeducativas,
                  fortalecimento de vínculos e apoio às famílias, promovendo
                  autonomia e qualidade de vida.
                </p>
              </header>
            </div>

            <div className="space-y-3">
              <p id="map-description" className="sr-only">
                Mapa mostrando a localização do Projeto Casulo em Bragança
                Paulista, São Paulo.
              </p>
              <div className="relative w-full h-105 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <iframe
                  title="Mapa de localização do Projeto Casulo"
                  src="https://maps.google.com/maps?q=Rua+Francisco+Rodrigues+Dias,+80+Bragança+Paulista&z=15&output=embed"
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
              <a
                href="https://www.google.com/maps?q=Rua+Francisco+Rodrigues+Dias,+80+Bragança+Paulista"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm font-bold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Ver localização no Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
