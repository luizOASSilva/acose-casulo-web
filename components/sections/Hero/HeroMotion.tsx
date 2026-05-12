'use client';

import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import Image from 'next/image';
import { useRef } from 'react';

interface HeroMotionProps {
  image: string;
  overlay?: boolean;
}

export default function HeroMotion({ image, overlay = true }: HeroMotionProps) {
  const ref = useRef(null);

  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', shouldReduceMotion ? '0%' : '14%']
  );

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scaleScroll = useTransform(
    scrollYProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 1.03]
  );

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <m.div style={{ y, scale: scaleScroll }} className="absolute inset-0">
        <m.div
          initial={{ scale: 1 }}
          animate={{ scale: shouldReduceMotion ? 1 : 1.06 }}
          transition={{
            duration: 18,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'mirror',
          }}
          className="absolute inset-0"
        >
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </m.div>

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.12))',
          }}
        />
      </m.div>

      {overlay && (
        <m.div
          aria-hidden="true"
          style={{ opacity }}
          className="absolute inset-0 bg-black/10"
        />
      )}
    </div>
  );
}
