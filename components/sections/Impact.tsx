"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(
  target: number,
  duration: number = 2000,
  start: boolean = false,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  return count;
}

type StatItem = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
};

const stats: StatItem[] = [
  { value: 25, prefix: "+", label: "anos de história", duration: 1800 },
  { value: 80, prefix: "+", label: "famílias atendidas", duration: 2000 },
  { value: 12, prefix: "+", label: "atividades oferecidas", duration: 1600 },
  { value: 30, prefix: "+", label: "voluntários", duration: 1900 },
];

function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  duration = 2000,
  start,
}: StatItem & { start: boolean }) {
  const count = useCountUp(value, duration, start);
  return (
    <div className="flex flex-col items-center gap-3 group">
      <dt className="sr-only">{label}</dt>
      <dd className="text-6xl md:text-7xl font-extrabold tabular-nums leading-none transition-transform duration-300 group-hover:scale-105">
        <span aria-hidden="true">
          {prefix}
          {count}
          {suffix}
        </span>
        <span className="sr-only">
          {prefix}
          {value}
          {suffix}
        </span>
      </dd>
      <p
        aria-hidden="true"
        className="text-sm md:text-base uppercase tracking-widest opacity-85 font-medium text-center"
      >
        {label}
      </p>
    </div>
  );
}

export default function Impact() {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="impact-title"
      className="w-full bg-primary py-20 px-8"
    >
      <h2 id="impact-title" className="sr-only">
        Nosso impacto em números
      </h2>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-12 text-white text-center max-w-6xl mx-auto">
        {stats.map((stat) => (
          <StatCounter key={stat.label} {...stat} start={started} />
        ))}
      </dl>
    </section>
  );
}
