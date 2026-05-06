'use client';

interface StepConfirmationProps {
  amount: number;
}

export default function StepConfirmation({ amount }: StepConfirmationProps) {
  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col items-center gap-6 py-16 animate-in fade-in duration-700">
      <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-primary">Obrigado!</h2>

      <p className="text-center text-gray-700 text-base leading-relaxed max-w-sm">
        Sua doação de{' '}
        <span className="text-primary font-bold">R$ {formatBRL(amount)}</span>{' '}
        foi registrada. O recibo chegará no seu e-mail em breve.
      </p>
    </div>
  );
}
