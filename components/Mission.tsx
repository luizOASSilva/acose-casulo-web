import { Eye, Shield, Target } from "lucide-react";

export default function Mission() {
  return (
    <section aria-labelledby="mvv-title">
      
      <h2 id="mvv-title" className="sr-only">
        Missão, Visão e Valores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        <article className="flex flex-col space-y-3">
          <Target
            size={48}
            className="text-primary"
            aria-hidden="true"
          />
          <h3 className="font-bold text-xl">Missão</h3>
          <p className="text-gray-700 leading-relaxed">
            Promover a qualidade de vida a adultos com deficiência por meio do desenvolvimento da autoestima e autonomia, resgatando-os da situação de vulnerabilidade.
          </p>
        </article>

        <article className="flex flex-col space-y-3">
          <Eye
            size={48}
            className="text-primary"
            aria-hidden="true"
          />
          <h3 className="font-bold text-xl">Visão</h3>
          <p className="text-gray-700 leading-relaxed">
            Garantir apoio a adultos com deficiência e suas famílias, oferecendo orientação e serviços socioassistenciais com foco na qualidade de vida e nos direitos.
          </p>
        </article>

        <article className="flex flex-col space-y-3">
          <Shield
            size={48}
            className="text-primary"
            aria-hidden="true"
          />
          <h3 className="font-bold text-xl">Valores</h3>
          <p className="text-gray-700 leading-relaxed">
            Acreditamos no acolhimento, no desenvolvimento humano e no respeito à individualidade, com dedicação e responsabilidade em cada ação.
          </p>
        </article>

      </div>
    </section>
  );
}
