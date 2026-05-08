import Image from 'next/image';

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
      aria-labelledby="hero-title"
      className={`relative min-h-[65vh] flex items-center overflow-hidden ${
        image ? '' : dark ? 'bg-secondary' : 'bg-background'
      }`}
    >
      {image && (
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1335px"
          className="object-cover"
        />
      )}

      {image && overlay && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent"
        />
      )}

      <div className="relative z-10 w-full max-w-2xl px-6 py-20 space-y-5">
        <p className={`text-sm md:text-base font-bold tracking-wide uppercase ${image ? 'text-primary' : 'text-primary-light'}`}>
          Centro Dia da Pessoa com Deficiência • Bragança Paulista/SP
        </p>

        <h1
          id="hero-title"
          className={`font-bold leading-tight text-4xl md:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-gray-900'}`}
        >
          {title}
        </h1>

        <p className={dark ? (image ? 'text-white/90' : 'text-gray-300') : 'text-gray-700'}>
          {description}
        </p>

        {children}
      </div>
    </section>
  );
}
