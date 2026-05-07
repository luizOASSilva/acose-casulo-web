'use client';

import Image from 'next/image';
import { Partner } from '@/types/partner';

export default function LogoCard({
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
    <div className="mx-2 md:mx-6 w-30 h-17.5 md:w-55 md:h-30">
      <div
        className="w-full h-full flex items-center justify-center rounded-md shadow-sm border border-gray-200 transition-transform duration-500 hover:scale-105 will-change-transform"
        style={{ backgroundColor: logo.bgColor || '#ffffff' }}
      >
        <div className="relative w-[70%] h-[70%]">
          <Image
            src={logo.src}
            alt={isClone ? '' : `Parceiro ${logo.name}`}
            fill
            sizes="(max-width: 768px) 120px, 220px"
            priority={isPriority}
            loading="eager"
            className="object-contain"
            aria-hidden={isClone ? true : undefined}
          />
        </div>
      </div>
    </div>
  );
}
