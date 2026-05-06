import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ButtonProps {
  href: string;
  text: string;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export default function Button({
  href,
  text,
  ariaLabel,
  variant = 'primary',
  icon,
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-2 px-5 py-3 rounded-md font-medium transition w-fit group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',

    secondary: 'bg-black text-white hover:opacity-90',

    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  return (
    <Link
      href={href}
      aria-label={ariaLabel || text}
      className={`${base} ${variants[variant]}`}
    >
      {text}

      {icon ?? (
        <ArrowRight
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
