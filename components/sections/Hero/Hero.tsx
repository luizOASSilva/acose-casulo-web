import HeroMotion from '@/components/sections/Hero/HeroMotion';
import Reveal from '@/components/animations/Reveal';

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
  return (
    <section
      className={`relative min-h-[65vh] flex items-center overflow-hidden ${
        dark ? 'bg-secondary' : 'bg-background'
      }`}
    >
      {image && <HeroMotion image={image} overlay={overlay} />}

      <div className="relative z-10 w-full max-w-2xl px-6 py-20 space-y-5">
        <Reveal>
          <p
            className={`text-sm md:text-base font-bold tracking-wide uppercase ${
              dark ? 'text-primary' : 'text-primary-light'
            }`}
          >
            Centro Dia da Pessoa com Deficiência • Bragança Paulista/SP
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h1
            className={`font-bold leading-tight text-4xl md:text-5xl lg:text-6xl ${
              dark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className={`max-w-lg ${dark ? 'text-white/85' : 'text-gray-300'}`}>
            {description}
          </p>
        </Reveal>

        {children && (
          <Reveal delay={0.15}>
            <div className="pt-2">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
