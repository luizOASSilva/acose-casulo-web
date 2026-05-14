import { Eye, Shield, Target } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';

const items = [
  {
    icon: <Target size={40} className="text-primary" />,
    title: 'Missão',
    text: `
      Promover a qualidade de vida a adultos com deficiência
      por meio do desenvolvimento da autoestima e autonomia,
      resgatando-os da situação de vulnerabilidade.
    `,
  },
  {
    icon: <Eye size={40} className="text-primary" />,
    title: 'Visão',
    text: `
      Garantir apoio a adultos com deficiência e suas famílias,
      oferecendo orientação e serviços socioassistenciais
      com foco na qualidade de vida e nos direitos.
    `,
  },
  {
    icon: <Shield size={40} className="text-primary" />,
    title: 'Valores',
    text: `
      Acreditamos no acolhimento, no desenvolvimento humano
      e no respeito à individualidade, com dedicação e
      responsabilidade em cada ação.
    `,
  },
];

export default function Mission() {
  return (
    <section aria-labelledby="mvv-title" className="py-16">
      <h2 id="mvv-title" className="sr-only">
        Missão, Visão e Valores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {items.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.12}>
            <article className="flex flex-col space-y-3">
              <div className="p-3 bg-primary/10 w-fit rounded-md">
                {item.icon}
              </div>

              <h3 className="font-bold text-xl pt-2">{item.title}</h3>

              <p className="text-gray-700 leading-relaxed">{item.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
