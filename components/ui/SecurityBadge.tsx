import Image from 'next/image';

export default function SecurityBadge() {
  return (
    <div className="flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-5 py-4 bg-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5 text-green-500 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      <p className="text-xs text-gray-500 leading-snug">
        Pagamento processado com segurança por
      </p>
      <Image
        src="/mercado-pago-logo.svg"
        alt="Mercado Pago"
        width={100}
        height={20}
        className="h-5 w-auto shrink-0"
      />
    </div>
  );
}
