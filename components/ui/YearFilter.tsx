'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useEffect } from 'react';

export default function YearFilter({
  years,
  activeYear,
}: {
  years: number[];
  activeYear: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!searchParams.get('ano')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('ano', String(activeYear));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [activeYear, pathname, router, searchParams]);

  const handleYear = (year: number) => {
    if (year === activeYear) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('ano', String(year));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <fieldset className="w-full px-4 bg-white flex flex-row gap-4 items-center border-b border-gray-200 sticky top-0 z-10">
      <legend className="sr-only">Filtrar por ano</legend>

      <span aria-hidden="true" className="text-sm font-semibold text-gray-500">
        ANO
      </span>

      <ul role="list" className="flex flex-row gap-4">
        {years.map((year) => {
          const isActive = activeYear === year;

          return (
            <li key={year} className="flex">
              <button
                onClick={() => handleYear(year)}
                aria-pressed={isActive}
                disabled={isPending}
                className={`py-3 h-full border-b-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary'
                } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {year}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
