'use client';

import PartnerCard from '@/components/ui/PartnerCard';
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
  if (items.length === 0) return null;

  const repeated = [...items, ...items, ...items, ...items];
  const duration = items.length * (400 / speed);

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex w-max"
        style={{
          animation: `marquee-${direction} ${duration}s linear infinite`,
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.animationPlayState = 'running';
        }}
      >
        {repeated.map((logo, index) => (
          <PartnerCard
            key={`${logo.name}-${index}`}
            logo={logo}
            index={index % items.length}
            isClone={index >= items.length}
          />
        ))}
      </div>
    </div>
  );
}

export default function PartnerMarquee({ partners }: Props) {
  const row1 = partners.slice(0, Math.ceil(partners.length / 2));
  const row2 = partners.slice(Math.ceil(partners.length / 2));

  return (
    <section className="mb-20 overflow-hidden" aria-label="Parceiros">
      <div className="relative w-full">
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-7.5 md:w-37.5"
          style={{
            background: 'linear-gradient(to right, white, transparent)',
          }}
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-7.5 md:w-37.5"
          style={{
            background: 'linear-gradient(to left, white, transparent)',
          }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6 md:gap-10">
          <MarqueeRow items={row1} direction="left" speed={35} />

          {row2.length > 0 && (
            <MarqueeRow items={row2} direction="right" speed={30} />
          )}
        </div>
      </div>
    </section>
  );
}
