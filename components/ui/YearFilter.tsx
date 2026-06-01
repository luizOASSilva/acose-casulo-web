'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

interface YearFilterProps {
  years: number[];
  activeYear: number;
  className?: string;
}

export default function YearFilter({
  years,
  activeYear,
  className = '',
}: YearFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleYear = (year: number) => {
    if (year === activeYear) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('ano', String(year));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <fieldset
      className={`
        w-full rounded-md border border-gray-200 bg-white px-4
        ${className}
      `}
    >
      <legend className="sr-only">Filtrar por ano</legend>

      <div className="flex flex-row items-center gap-4 overflow-x-auto">
        <span
          aria-hidden="true"
          className="shrink-0 text-sm font-semibold text-gray-500"
        >
          ANO
        </span>

        <ul className="flex flex-row gap-4">
          {years.map((year) => {
            const isActive = activeYear === year;

            return (
              <li key={year} className="flex">
                <button
                  type="button"
                  onClick={() => handleYear(year)}
                  aria-pressed={isActive}
                  disabled={isPending}
                  className={`
                    h-full cursor-pointer border-b-2 py-3 text-sm font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-600 hover:text-primary'
                    }
                    ${isPending ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  {year}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </fieldset>
  );
}
