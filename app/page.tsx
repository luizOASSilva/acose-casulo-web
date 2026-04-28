import Carousel from "@/components/Carousel";
import Hero from "@/components/Hero"
import Mission from "@/components/Mission";
import Button from "@/components/Button";

export default function Home() {
  return (
    <main>
      <Hero />

      <section aria-labelledby="mission-title" className="py-20">
        <div className="w-4/5 mx-auto max-w-6xl">

          <div className="max-w-2xl mb-8 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight" id="mission-title">
              O que nos move
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nosso trabalho é guiado por princípios que colocam a pessoa com deficiência no centro de tudo. Promovemos autonomia, respeitamos individualidades e construímos caminhos para uma vida mais digna.
            </p>
          </div>

          <Mission />

          <div className="w-auto mt-18 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Conheça nossos projetos!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Desenvolvemos atividades que transformam vidas, promovendo autonomia, inclusão e dignidade para adultos com deficiência. Cada projeto nasce do cuidado com as pessoas e do compromisso com um futuro mais justo.
            </p>
          </div>

          <Carousel />

          <Button 
            href="/atividades" 
            ariaLabel="Conheça a história do Centro Dia da Pessoa com Deficiência"
            variant="secondary"
            text="Conhecer atividades"
          /> 

        </div>
      </section>
    </main>
  );
}
