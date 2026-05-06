import Image from 'next/image';

interface HeroProps {
  children?: React.ReactNode;
  image?: string;
  overlay?: boolean;
  title: React.ReactNode;
  description: string;
}

export default function Hero({
  title,
  description,
  children,
  image,
  overlay = true,
}: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className={`relative min-h-[65vh] flex items-center overflow-hidden ${
        image ? '' : 'bg-secondary'
      }`}
    >
      {image && (
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover blur-[0.5px]"
        />
      )}

      {image && overlay && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent"
        />
      )}

      <div className="relative z-10 w-full max-w-2xl px-6 py-20 space-y-5 text-white">
        <p className="text-sm md:text-base text-primary font-bold tracking-wide uppercase">
          Centro Dia da Pessoa com Deficiência • Bragança Paulista/SP
        </p>

        <h1
          id="hero-title"
          className="font-bold leading-tight text-4xl md:text-5xl lg:text-6xl text-white"
        >
          {title}
        </h1>

        <p className={image ? 'text-white/90' : 'text-gray-300'}>
          {description}
        </p>

        {children}
      </div>
    </section>
  );
}
