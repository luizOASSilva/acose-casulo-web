import Carousel from "@/components/sections/Carousel";
import Hero from "@/components/sections/Hero";
import Impact from "@/components/sections/Impact";
import Mission from "@/components/sections/Mission";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main>
      <Hero
        image="/hero.jpg"
        overlay={false}
        title={<>&quot;E quando forem adultos?&quot;</>}
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
              className="text-2xl md:text-3xl font-bold leading-tight"
              id="mission-title"
            >
              Sobre o Centro Dia
            </h2>
            <p className="text-gray-600 leading-relaxed">
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
              className="text-2xl md:text-3xl font-bold leading-tight"
              id="projects-title"
            >
              Conheça nossos projetos!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Desenvolvemos atividades que transformam vidas, promovendo
              autonomia, inclusão e dignidade para adultos com deficiência. Cada
              projeto nasce do cuidado com as pessoas e do compromisso com um
              futuro mais justo.
            </p>
          </div>
          <Carousel />
          <Button
            href="/atividades"
            ariaLabel="Conheça as atividades do Centro Dia da Pessoa com Deficiência"
            variant="secondary"
            text="Conhecer atividades"
          />
        </div>
      </section>

      <section aria-labelledby="location-title" className="py-20">
        <div className="w-4/5 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <header className="space-y-4">
                <h2
                  id="location-title"
                  className="text-2xl md:text-4xl font-bold leading-tight"
                >
                  Onde estamos
                </h2>

                <p className="text-gray-600 text-lg leading-relaxed">
                  O Projeto Casulo está localizado em Bragança Paulista, SP, em
                  um espaço preparado para promover acolhimento, inclusão e
                  desenvolvimento de jovens adultos com deficiência.
                </p>

                <div className="text-gray-600 leading-relaxed space-y-2">
                  <p className="font-semibold text-black text-lg">Endereço</p>

                  <address className="not-italic">
                    Rua Francisco Rodrigues Dias, 80
                    <br />
                    Uberaba — Bragança Paulista/SP
                    <br />
                    CEP: 12908-843
                  </address>
                </div>
                
                <p className="font-semibold text-black text-lg">Centro Dia Pessoa Com Deficiência</p>

                <p className="text-gray-600 leading-relaxed">
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

              <div className="relative w-full h-125 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
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
                className="text-primary text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
