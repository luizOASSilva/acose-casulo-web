'use client';

import { m, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    function handleChange() {
      setIsMobile(mediaQuery.matches);
    }

    handleChange();

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}

export default function Reveal({ children, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <m.div
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: isMobile ? 1 : 0,
              y: isMobile ? 0 : 10,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: isMobile ? 0 : 0.05,
        margin: '0px',
      }}
      transition={{
        duration: isMobile ? 0.2 : 0.35,
        ease: 'easeOut',
        delay: isMobile ? 0 : delay,
      }}
    >
      {children}
    </m.div>
  );
}
