import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function SecurityBadge() {
  return (
    <div className="flex items-center justify-center gap-4 border border-gray-200 rounded-2xl px-6 py-5 bg-white shadow-sm">
      <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
      <div className="h-5 w-px bg-gray-200 shrink-0" />
      <p className="text-xs text-gray-400 leading-snug">
        Pagamento processado <br className="hidden sm:block" /> com segurança por
      </p>
      <Image
        src="/mercado-pago-logo.svg"
        alt="Mercado Pago"
        width={140}
        height={28}
        className="h-8 w-auto shrink-0"
      />
    </div>
  );
}
