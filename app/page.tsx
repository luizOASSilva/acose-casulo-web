import Carousel from "@/components/sections/Carousel";
import Hero from "@/components/sections/Hero"
import Mission from "@/components/sections/Mission";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main>
      <Hero
        image="/hero.jpg"
        overlay={false}
        title={
          <>
            “E quando forem adultos?”
          </>
        }
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
            <h2 className="text-2xl md:text-3xl font-bold leading-tight" id="mission-title">
              Sobre o Centro Dia
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Entenda como o Projeto Casulo atua no cuidado, inclusão e desenvolvimento de jovens adultos com deficiência em Bragança Paulista.            
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
  )
}
