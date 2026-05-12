'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export default function Reveal({ children, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 24,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
          delay,
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
