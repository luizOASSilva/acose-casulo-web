"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";

type Partner = {
  name: string;
  src: string;
  bgColor?: string;
};

type Props = {
  partners: Partner[];
};

export default function PartnerMarquee({ partners }: Props) {
  const row1 = partners.slice(0, Math.ceil(partners.length / 2));
  const row2 = partners.slice(Math.ceil(partners.length / 2));

  return (
    <section className="overflow-hidden" aria-labelledby="partners-heading">
      <div
        className="relative"
        role="region"
        aria-label="Carrossel de parceiros"
      >
        <div
          className="absolute left-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgb(255 255 255 / 0.25), transparent)",
          }}
          aria-hidden="true"
        />

        <div
          className="absolute right-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{
            background: "linear-gradient(to left, rgb(255 255 255 / 0.25), transparent)",
          }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 md:gap-10" role="list">
          <Marquee speed={35} gradient={false} pauseOnHover={true} className="overflow-hidden">
            {row1.map((logo, i) => (
              <LogoCard key={`${logo.name}-${i}`} logo={logo} index={i} />
            ))}
            {row1.map((logo, i) => (
              <LogoCard key={`${logo.name}-c1-${i}`} logo={logo} index={i} isClone />
            ))}
          </Marquee>

          <Marquee speed={30} direction="right" gradient={false} pauseOnHover={true} className="overflow-hidden">
            {row2.map((logo, i) => (
              <LogoCard key={`${logo.name}-${i}-rev`} logo={logo} index={i} />
            ))}
            {row2.map((logo, i) => (
              <LogoCard key={`${logo.name}-c2-rev-${i}`} logo={logo} index={i} isClone />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

function LogoCard({
  logo,
  index,
  isClone,
}: {
  logo: Partner;
  index: number;
  isClone?: boolean;
}) {
  const isPriority = !isClone && index < 3;

  return (
    <div
      role="listitem"
      className="
        mx-2 md:mx-6
        flex items-center justify-center
        w-30 h-17.5
        md:w-55 md:h-30
        rounded-2xl
        shadow-sm border border-gray-200
        transition-all duration-500 hover:scale-105
      "
      style={{ backgroundColor: logo.bgColor || "#ffffff" }}
    >
      <div className="relative w-[70%] h-[70%]">
        <Image
          src={logo.src}
          alt={isClone ? "" : `Parceiro ${logo.name}`}
          fill
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          className="object-contain"
          aria-hidden={isClone ? true : undefined}
        />
      </div>
    </div>
  );
}
