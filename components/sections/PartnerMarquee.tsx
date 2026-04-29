"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";

const allPartners = [
  {
    name: "Apoio Social",
    src: "/parceiros/apoio-social.svg",
    bgColor: "#ffffff",
  },
  {
    name: "Casa do Pintor",
    src: "/parceiros/casa-do-pintor.svg",
    bgColor: "#ffffff",
  },
  { name: "Damatsu", src: "/parceiros/damatsu.svg", bgColor: "#ffffff" },
  { name: "Giorgino", src: "/parceiros/giorgino.svg", bgColor: "#212121" },
  {
    name: "José Paulino",
    src: "/parceiros/jose-paulino.svg",
    bgColor: "#ffffff",
  },
  { name: "Makino", src: "/parceiros/makino.svg", bgColor: "#ffffff" },
  {
    name: "Marcus Bonna",
    src: "/parceiros/marcus-bonna.svg",
    bgColor: "#ffffff",
  },
  {
    name: "Musical Tassara",
    src: "/parceiros/musical-tassara.svg",
    bgColor: "#000000",
  },
  {
    name: "Parque Brasil",
    src: "/parceiros/parque-brasil.svg",
    bgColor: "#ffffff",
  },
  { name: "Policog", src: "/parceiros/policog.svg", bgColor: "#000000" },
  {
    name: "Primeira Impressão",
    src: "/parceiros/primeira-impressao.svg",
    bgColor: "#4A5672",
  },
  { name: "Probac", src: "/parceiros/probac.svg", bgColor: "#000000" },
  { name: "Woodpel", src: "/parceiros/woodpel.svg", bgColor: "#ffffff" },
];

export default function PartnerMarquee() {
  const row1 = allPartners.slice(0, 7);
  const row2 = allPartners.slice(7);

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
            background:
              "linear-gradient(to right, rgb(255 255 255 / 0.25) , transparent)",
          }}
          aria-hidden="true"
        />

        <div
          className="absolute right-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgb(255 255 255 / 0.25), transparent)",
          }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 md:gap-10" role="list">
          <Marquee
            speed={35}
            gradient={false}
            pauseOnHover={true}
            className="overflow-hidden"
          >
            {row1.map((logo, i) => (
              <LogoCard key={`${logo.name}-${i}`} logo={logo} index={i} />
            ))}
            {row1.map((logo, i) => (
              <LogoCard
                key={`${logo.name}-c1-${i}`}
                logo={logo}
                index={i}
                isClone
              />
            ))}
          </Marquee>

          <Marquee
            speed={30}
            direction="right"
            gradient={false}
            pauseOnHover={true}
            className="overflow-hidden"
          >
            {row2.map((logo, i) => (
              <LogoCard key={`${logo.name}-${i}-rev`} logo={logo} index={i} />
            ))}
            {row2.map((logo, i) => (
              <LogoCard
                key={`${logo.name}-c2-rev-${i}`}
                logo={logo}
                index={i}
                isClone
              />
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
  logo: { name: string; src: string; bgColor?: string };
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
        rounded-2xl md:rounded-2xl
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
