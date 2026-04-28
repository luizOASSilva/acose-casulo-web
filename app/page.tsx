import Hero from "@/components/Hero"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
        <Link
          href="/centro-dia"
          aria-label="Conheça a história do Centro Dia da Pessoa com Deficiência"
          className="inline-flex items-center gap-2 bg-black/80 text-white px-5 py-3 rounded-md hover:bg-black transition font-medium w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Conheça nossa história
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </Hero>

      {/* seção institucional */}
      <section aria-labelledby="sobre-title" className="py-16">
        <div className="max-w-7xl mx-auto px-6">

          <header className="mb-10">
            <h2
              id="sobre-title"
              className="text-2xl md:text-3xl font-bold"
            >
              Sobre o Centro Dia
            </h2>

            <p className="text-gray-600 mt-2 max-w-2xl">
              Entenda como o Projeto Casulo atua no cuidado, inclusão e desenvolvimento de jovens adultos com deficiência em Bragança Paulista.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">

            <article className="space-y-2">
              <h3 className="font-semibold text-lg">Acolhimento</h3>
              <p className="text-gray-600">
                Ambiente seguro e estruturado para desenvolvimento diário.
              </p>
            </article>

            <article className="space-y-2">
              <h3 className="font-semibold text-lg">Autonomia</h3>
              <p className="text-gray-600">
                Atividades que estimulam independência e habilidades sociais.
              </p>
            </article>

            <article className="space-y-2">
              <h3 className="font-semibold text-lg">Inclusão</h3>
              <p className="text-gray-600">
                Integração social com respeito às limitações e potencialidades.
              </p>
            </article>

          </div>

        </div>
      </section>

    </main>
  )
}
