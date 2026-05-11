import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function SecurityBadge() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-6 text-center sm:flex-nowrap sm:text-left">
      <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />

      <div className="hidden sm:block h-5 w-px bg-gray-200 shrink-0" />

      <p className="text-xs text-gray-600 leading-snug">
        Pagamento processado com segurança por
      </p>

      <Image
        src="/mercado-pago-logo.svg"
        alt="Mercado Pago"
        width={180}
        height={36}
        className="h-8 sm:h-10 w-auto shrink-0"
      />
    </div>
  );
}
