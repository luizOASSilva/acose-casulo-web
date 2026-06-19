'use client';

import Image from 'next/image';

import type { Partner } from '@/types/partner';

function getPartnerUrl(partner: Partner): string {
  return (
    partner.website_url ||
    partner.websiteUrl ||
    ''
  ).trim();
}

function isValidExternalUrl(value?: string | null): boolean {
  if (!value) return false;

  return value.startsWith('http://') || value.startsWith('https://');
}

export default function PartnerCard({
  logo,
  index,
  isClone,
}: {
  logo: Partner;
  index: number;
  isClone?: boolean;
}) {
  const isPriority = !isClone && index < 3;
  const partnerUrl = getPartnerUrl(logo);
  const hasUrl = isValidExternalUrl(partnerUrl);

  const content = (
    <div
      className={`
        group relative flex h-full w-full items-center justify-center rounded-md
        border border-gray-200 shadow-sm transition-transform duration-500
        will-change-transform hover:scale-105
        ${hasUrl ? 'cursor-pointer' : ''}
      `}
      style={{ backgroundColor: logo.bgColor || logo.bg_color || '#ffffff' }}
    >
      <div className="relative h-[70%] w-[70%]">
        <Image
          src={logo.src || logo.logo_url || logo.logoUrl || ''}
          alt={
            isClone
              ? ''
              : logo.logo_alt || logo.logoAlt || `Parceiro ${logo.name}`
          }
          fill
          sizes="(max-width: 768px) 120px, 220px"
          priority={isPriority}
          loading={isPriority ? 'eager' : 'lazy'}
          className="object-contain"
          aria-hidden={isClone ? true : undefined}
        />
      </div>
    </div>
  );

  if (!hasUrl) {
    return (
      <div className="mx-2 h-17.5 w-30 md:mx-6 md:h-30 md:w-55">
        {content}
      </div>
    );
  }

  return (
    <a
      href={partnerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-2 block h-17.5 w-30 outline-none md:mx-6 md:h-30 md:w-55"
      title={`Abrir site do parceiro ${logo.name}`}
      aria-label={`Abrir site do parceiro ${logo.name}`}
    >
      {content}
    </a>
  );
}
