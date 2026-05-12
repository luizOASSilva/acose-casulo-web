'use client';

import { m, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export default function Reveal({ children, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : 10,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay,
      }}
    >
      {children}
    </m.div>
  );
}
