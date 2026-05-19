'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

interface Props {
  filterKey: string;
  children: React.ReactNode;
  className?: string;
}

export default function DonationCardFilter({ filterKey, children, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get('status');

    if (current === filterKey) {
      params.delete('status');
    } else {
      params.set('status', filterKey);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const isActive = searchParams.get('status') === filterKey;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'text-left w-full rounded-md transition-all duration-200 focus:outline-none',
        isActive ? '-translate-y-1 shadow-md' : 'hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {children}
    </button>
  );
}
