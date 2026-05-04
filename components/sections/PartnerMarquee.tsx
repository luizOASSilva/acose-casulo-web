"use client";

import Marquee from "react-fast-marquee";
import LogoCard from "@/components/ui/LogoCard";
import type { Partner } from "@/types/Partner";

type Props = {
  partners: Partner[];
};

export default function PartnerMarquee({ partners }: Props) {
  const row1 = partners.slice(0, Math.ceil(partners.length / 2));
  const row2 = partners.slice(Math.ceil(partners.length / 2));

  return (
    <section className="overflow-hidden mb-5" aria-labelledby="partners-heading">
      <div
        className="relative"
        role="region"
        aria-label="Carrossel de parceiros"
      >
        <div
          className="absolute left-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{
            background: "linear-gradient(to right, white, transparent)",
          }}
          aria-hidden="true"
        />

        <div
          className="absolute right-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{
            background: "linear-gradient(to left, white, transparent)",
          }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 md:gap-10 mb-10" role="list">
          <Marquee speed={35} gradient={false} pauseOnHover={true}>
            {row1.map((logo, i) => (
              <LogoCard key={`row1-${logo.name}-${i}`} logo={logo} index={i} />
            ))}
          </Marquee>

          <Marquee speed={30} direction="right" gradient={false} pauseOnHover={true}>
            {row2.map((logo, i) => (
              <LogoCard key={`row2-${logo.name}-${i}`} logo={logo} index={i} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
