import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({
  href = '/artigos',
  label = 'Todos os artigos',
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-primary"
      aria-label={`Voltar para ${label}`}
    >
      <ChevronLeft
        size={16}
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
      />
      {label}
    </Link>
  );
}
