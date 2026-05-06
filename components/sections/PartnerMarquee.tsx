'use client';

import LogoCard from '@/components/ui/LogoCard';
import type { Partner } from '@/types/partner';

type Props = {
  partners: Partner[];
};

function MarqueeRow({
  items,
  direction = 'left',
  speed = 35,
}: {
  items: Partner[];
  direction?: 'left' | 'right';
  speed?: number;
}) {

  const repeated = [...items, ...items, ...items, ...items];
  const duration = items.length * (400 / speed);

  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex w-max"
        style={{
          animation: `marquee-${direction} ${duration}s linear infinite`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running';
        }}
      >
        {repeated.map((logo, i) => (
          <LogoCard key={`${logo.name}-${i}`} logo={logo} index={i % items.length} />
        ))}
      </div>
    </div>
  );
}

export default function PartnerMarquee({ partners }: Props) {
  const row1 = partners.slice(0, Math.ceil(partners.length / 2));
  const row2 = partners.slice(Math.ceil(partners.length / 2));

  return (
    <section className="overflow-hidden mb-20" aria-labelledby="partners-heading">
      <div className="relative w-full">
        <div
          className="absolute left-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{ background: 'linear-gradient(to right, white, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 z-10 w-7.5 md:w-37.5 pointer-events-none"
          style={{ background: 'linear-gradient(to left, white, transparent)' }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 md:gap-10">
          <MarqueeRow items={row1} direction="left" speed={35} />
          <MarqueeRow items={row2} direction="right" speed={30} />
        </div>
      </div>
    </section>
  );
}
