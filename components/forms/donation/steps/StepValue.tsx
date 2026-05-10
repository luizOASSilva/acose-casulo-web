'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface StepValueProps {
  initialAmount: number;
  onNext: (amount: number) => void;
}

const DONATION_OPTIONS = [
  { value: 15 },
  { value: 30 },
  { value: 50 },
  { value: 100 },
  { value: 500 },
];

export default function StepValue({ initialAmount, onNext }: StepValueProps) {
  const [selected, setSelected] = useState<number | null>(initialAmount || null);
  const [custom, setCustom] = useState('');

  const getAmount = () => {
    if (selected) return selected;
    return Number(custom);
  };

  return (
    <div>
      {DONATION_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setSelected(o.value)}
          className={cn(selected === o.value ? 'bg-primary text-white' : '')}
        >
          R$ {o.value}
        </button>
      ))}

      <input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder="Outro valor"
      />

      <button onClick={() => onNext(getAmount())}>
        Continuar
      </button>
    </div>
  );
}
