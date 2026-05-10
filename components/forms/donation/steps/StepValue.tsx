'use client';

import { useState } from 'react';
import { Shirt } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StepValueProps {
  initialAmount: number;
  onNext: (amount: number) => void;
}

const DONATION_OPTIONS = [
  { value: 15, desc: 'Materiais para uma oficina', gift: false },
  { value: 30, desc: 'Transporte de um assistido', gift: false },
  { value: 50, desc: 'Um dia de atividades', gift: false },
  { value: 75, desc: 'Um dia de atividades', gift: false },
  { value: 100, desc: 'Semana de atendimento', gift: true },
  { value: 500, desc: 'Mês de suporte', gift: true },
];

export default function StepValue({ initialAmount, onNext }: StepValueProps) {
  const preSelected =
    DONATION_OPTIONS.find((o) => o.value === initialAmount)?.value ?? null;
  const preCustom =
    initialAmount > 0 && !preSelected ? String(initialAmount) : '';

  const [selected, setSelected] = useState<number | null>(preSelected);
  const [custom, setCustom] = useState(preCustom);
  const [error, setError] = useState('');

  const handleCard = (value: number) => {
    if (selected === value) {
      setSelected(null);
    } else {
      setSelected(value);
      setCustom('');
    }
    setError('');
  };

  const handleCustom = (raw: string) => {
    const clean = raw.replace(/[^\d,\.]/g, '');
    setCustom(clean);
    setSelected(null);
    setError('');
  };

  const getAmount = (): number => {
    if (selected) return selected;
    const parsed = parseFloat(custom.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleContinue = () => {
    const amount = getAmount();
    if (amount <= 0) {
      setError('Escolha ou informe um valor para continuar.');
      return;
    }
    onNext(amount);
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <div className="w-full h-px bg-gray-300 my-8" />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-black">Escolha um valor</h2>
        <p className="text-sm text-gray-700 mt-1">
          Doações a partir de R$100 ganham uma camiseta da ACOSE Casulo
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
        {DONATION_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleCard(option.value)}
              className={cn(
                'relative flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-black hover:border-primary/50'
              )}
            >
              {option.gift && (
                <span
                  className={cn(
                    'absolute p-2 top-0 right-0 w-7 h-7 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-white/20' : 'bg-primary'
                  )}
                >
                  <Shirt size={20} />
                </span>
              )}
              <span className="text-xl font-bold">R$ {option.value}</span>
              <span
                className={cn(
                  'text-[11px] text-center mt-1 leading-tight',
                  isSelected ? 'text-white' : 'text-gray-600'
                )}
              >
                {option.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder="R$ Outro valor..."
          value={custom}
          onChange={(e) => handleCustom(e.target.value)}
          className={cn(
            'w-full pl-10 p-4 rounded-lg border-2 bg-white text-black outline-none transition',
            custom && !selected
              ? 'border-primary'
              : 'border-gray-200 focus:border-primary'
          )}
        />
      </div>

      {error && (
        <p className="text-sm py-4 font-medium" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        className="w-full bg-primary text-white font-bold py-4 rounded-lg mt-8 transition active:scale-[.98] cursor-pointer"
      >
        Continuar
      </button>

      <p className="text-sm text-gray-700 text-center mt-4">
        Doação segura · Recibo por email
      </p>
    </div>
  );
}
