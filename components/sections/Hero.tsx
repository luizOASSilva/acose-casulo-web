'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface HeroProps {
  children?: React.ReactNode;
  image?: string;
  overlay?: boolean;
  title: React.ReactNode;
  description: string;
  dark?: boolean;
}

export default function Hero({
  title,
  description,
  children,
  image,
  overlay = true,
  dark = true,
}: HeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className={`relative min-h-[65vh] flex items-center overflow-hidden ${
        !image ? (dark ? 'bg-secondary' : 'bg-background') : ''
      }`}
    >
      {image && (
        <motion.div
          style={{
            y,
            scale,
            backgroundImage: `url(${image})`,
          }}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
        />
      )}

      {image && overlay && (
        <motion.div
          style={{ opacity }}
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/20 via-black/10 to-transparent"
        />
      )}

      {image && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/60 to-transparent pointer-events-none"
        />
      )}

      <motion.div
        style={{ y: textY }}
        className="relative z-10 w-full max-w-2xl px-6 py-20 space-y-5 will-change-transform"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-sm md:text-base font-bold tracking-wide uppercase ${
            image ? 'text-primary' : 'text-primary-light'
          }`}
        >
          Centro Dia da Pessoa com Deficiência • Bragança Paulista/SP
        </motion.p>

        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`font-bold leading-tight text-4xl md:text-5xl lg:text-6xl ${
            dark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className={dark ? (image ? 'text-white/90' : 'text-gray-300') : 'text-gray-700'}
        >
          {description}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
