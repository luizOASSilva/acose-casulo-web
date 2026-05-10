'use client';

import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import StatCounter from '@/components/ui/statCount/StatCounter';

const stats = [
  { value: 25, prefix: '+', label: 'anos de história', duration: 1800 },
  { value: 80, prefix: '+', label: 'famílias atendidas', duration: 2000 },
  { value: 12, prefix: '+', label: 'atividades oferecidas', duration: 1600 },
  { value: 30, prefix: '+', label: 'voluntários', duration: 1900 },
];

export default function Impact() {
  const ref = useRef<HTMLElement>(null);
  const started = useInView(ref, 0.3);

  return (
    <section
      ref={ref}
      aria-labelledby="impact-title"
      className="w-full bg-primary py-20 px-8"
    >
      <h2 id="impact-title" className="sr-only">
        Estatísticas do Projeto Casulo
      </h2>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-12 text-white text-center max-w-6xl mx-auto">
        {stats.map((stat) => (
          <li key={stat.label}>
            <StatCounter {...stat} start={started} />
          </li>
        ))}
      </ul>
    </section>
  );
}
