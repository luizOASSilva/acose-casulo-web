'use client';

import { memo, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

type Props = {
  className?: string;
};

function LeafIllustration({ className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useInView(ref);

  return (
    <div ref={ref} className={`relative w-75 h-75 ${className}`}>
      <svg
        viewBox="0 0 200 300"
        className="w-full h-full text-green-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <g
          className={`animate-leafFloat transition-opacity duration-700 ${start ? 'opacity-100' : 'opacity-0'}`}
        >
          <path
            className={`draw delay-0 ${start ? 'active' : ''}`}
            d="M100 280 C90 220, 110 180, 100 140 C90 100, 110 60, 100 20"
          />
          <path
            className={`draw delay-200 ${start ? 'active' : ''}`}
            d="M100 140 C140 120, 160 100, 140 80 C120 60, 100 100, 100 140"
          />
          <path
            className={`draw delay-300 ${start ? 'active' : ''}`}
            d="M100 140 C60 120, 40 100, 60 80 C80 60, 100 100, 100 140"
          />
          <path
            className={`draw delay-400 ${start ? 'active' : ''}`}
            d="M100 90 C140 70, 160 50, 140 30 C120 10, 100 50, 100 90"
          />
          <path
            className={`draw delay-500 ${start ? 'active' : ''}`}
            d="M100 90 C60 70, 40 50, 60 30 C80 10, 100 50, 100 90"
          />
          <path
            className={`draw delay-600 ${start ? 'active' : ''}`}
            d="M100 200 C130 190, 140 170, 120 160 C100 150, 100 180, 100 200"
          />
          <path
            className={`draw delay-700 ${start ? 'active' : ''}`}
            d="M100 200 C70 190, 60 170, 80 160 C100 150, 100 180, 100 200"
          />
        </g>
      </svg>
    </div>
  );
}

export default memo(LeafIllustration);
